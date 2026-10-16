// A document-space route connects section entrances, not overall page progress.
(() => {
  const svg = document.querySelector('.circuit-background');
  if (!svg) return;
  const main = document.querySelector('#main');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('#trace-toggle');
  const sections = [...main.querySelectorAll(':scope > section')];
  const ns = 'http://www.w3.org/2000/svg';
  let preference = null;
  try { preference = sessionStorage.getItem('portfolio-scroll-effects'); } catch {}
  let enabled = preference === null ? !motion.matches : preference === 'on';
  let frame = 0, needsLayout = true, routes = [];
  const flashed = new Set();
  const node = (tag, attrs, parent = svg) => {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, value));
    parent.append(el); return el;
  };
  function layout() {
    svg.replaceChildren(); routes = [];
    const origin = main.getBoundingClientRect().top + scrollY;
    const rect = el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top + scrollY - origin, bottom: r.bottom + scrollY - origin };
    };
    const hero = rect(sections[0]);
    const shell = rect(document.querySelector('.home-hero'));
    const art = rect(document.querySelector('.hero-art'));
    const small = innerWidth <= 760;
    const gutter = Math.max(7, shell.left - (small ? 12 : 26));
    const startY = hero.bottom - (small ? 20 : 30);
    const startX = art.left + (art.right - art.left) * .65;
    svg.setAttribute('viewBox', `0 0 ${main.clientWidth} ${main.offsetHeight}`);
    // One source pad, connected at its outer edge instead of overlapping wires.
    const source = node('g', { class: 'circuit-source-pad' });
    node('circle', { class: 'circuit-source-ring', cx: startX, cy: startY, r: 6 }, source);
    node('circle', { class: 'circuit-source', cx: startX, cy: startY, r: 2 }, source);
    let previousY = startY;
    sections.slice(1).forEach((section, index) => {
      const r = rect(section);
      const targetY = r.top + (small ? 24 : 38);
      const endX = shell.left + (small ? 66 : 150);
      // Orthogonal branches meet the vertical trunk at exact T-junctions.
      const d = index === 0
        ? `M${startX - 6} ${previousY} H${gutter} V${targetY} H${endX}`
        : `M${gutter} ${previousY} V${targetY} H${endX}`;
      const group = node('g', { class: section.classList.contains('research-band') ? 'circuit-route-on-light' : '' });
      node('path', { class: 'circuit-track', d }, group);
      const path = node('path', { class: 'circuit-signal', pathLength: 1, d }, group);
      const dot = node('circle', { class: 'circuit-node', cx: endX, cy: targetY, r: small ? 2.5 : 3.5 }, group);
      routes.push({ path, dot, key: section, start: origin + previousY, end: origin + targetY });
      previousY = targetY;
    });
  }
  function draw() {
    frame = 0;
    if (needsLayout) { needsLayout = false; layout(); }
    svg.classList.toggle('is-scroll-linked', enabled);
    toggle.textContent = `Scroll effects: ${enabled ? 'on' : 'off'}`;
    toggle.setAttribute('aria-pressed', String(enabled));

    routes.forEach(route => {
      // Start from an empty route at scrollY=0, even on a tall viewport.
      const begin = Math.max(0, route.start - innerHeight * .72);
      const finish = Math.max(begin + 1, route.end - innerHeight * .72);
      const progress = enabled ? Math.min(1, Math.max(0, (scrollY - begin) / (finish - begin))) : 1;
      route.path.style.strokeDashoffset = String(1 - progress);
      route.dot.classList.toggle('is-arrived', enabled && progress >= 1);
      if (enabled && progress >= 1 && !flashed.has(route.key)) {
        flashed.add(route.key);
        // A single connection highlight, then the node settles into the route.
        route.dot.animate([{ opacity: .7, strokeWidth: 1 }, { opacity: 1, strokeWidth: 7, offset: .25 }, { opacity: .7, strokeWidth: 1 }], { duration: 750, easing: 'ease-out' });
      }
    });
  }
  function schedule(relayout = false) {
    needsLayout = needsLayout || relayout;
    if (!frame) frame = requestAnimationFrame(draw);
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    enabled = !enabled; preference = enabled ? 'on' : 'off';
    try { sessionStorage.setItem('portfolio-scroll-effects', preference); } catch {}
    if (!enabled) svg.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
    schedule();
  });
  window.addEventListener('scroll', () => { if (enabled) schedule(); }, { passive: true });
  window.addEventListener('resize', () => schedule(true));
  window.addEventListener('pageshow', () => schedule(true));
  motion.addEventListener('change', () => {
    if (preference === null) enabled = !motion.matches;
    if (!enabled) svg.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
    schedule();
  });
  if ('ResizeObserver' in window) new ResizeObserver(() => schedule(true)).observe(main);
  document.fonts?.ready.then(() => schedule(true));
  draw();
})();
