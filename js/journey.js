// Highlight the milestone being read without implying chronological progress.
(() => {
  const journey = document.querySelector('.journey');
  if (!journey) return;
  const items = [...journey.querySelectorAll('.journey-item')];
  const toggle = document.querySelector('#journey-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let preference = null;
  try { preference = sessionStorage.getItem('portfolio-journey-effects'); } catch {}
  let enabled = preference === null ? !reduced.matches : preference === 'on';
  let frame = 0;
  function draw() {
    frame = 0;
    const readingLine = innerHeight * .4;
    const headerBottom = document.querySelector('.site-header').getBoundingClientRect().bottom;
    let current = null, nearest = Infinity;
    if (enabled) {
      items.forEach(item => {
        const rect = item.getBoundingClientRect();
        if (rect.bottom <= headerBottom || rect.top >= innerHeight) return;
        const distance = Math.max(rect.top - readingLine, readingLine - rect.bottom, 0);
        if (distance < nearest) { nearest = distance; current = item; }
      });
    }
    items.forEach(item => item.classList.toggle('is-current', item === current));
    toggle.textContent = `Timeline effects: ${enabled ? 'on' : 'off'}`;
    toggle.setAttribute('aria-pressed', String(enabled));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    enabled = !enabled; preference = enabled ? 'on' : 'off';
    try { sessionStorage.setItem('portfolio-journey-effects', preference); } catch {}
    schedule();
  });
  reduced.addEventListener('change', () => { if (preference === null) enabled = !reduced.matches; schedule(); });
  window.addEventListener('scroll', () => { if (enabled) schedule(); }, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  journey.querySelectorAll('details').forEach(details => details.addEventListener('toggle', schedule));
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.querySelector('main'));
  document.fonts?.ready.then(schedule);
  draw();
})();
