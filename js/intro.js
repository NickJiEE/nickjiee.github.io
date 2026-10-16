const canvas = document.querySelector('#network');
const ctx = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const toggle = document.querySelector('#motion-toggle');
let paused = reducedMotion.matches;
let frame = 0, width = 0, height = 0, nodes = [], lastTime = 0, elapsed = 0;
let pointer = { x: -1000, y: -1000 };
let pulses = [];
function resize() {
  width = innerWidth; height = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = width * dpr; canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(105, Math.max(35, Math.floor(width * height / 12500)));
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * width, y: Math.random() * height,
    vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
    ox: 0, oy: 0, phase: Math.random() * Math.PI * 2
  }));
  pulses = [];
  draw(0);
}
function draw(step) {
  ctx.clearRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(width * .5, height * .48, 0, width * .5, height * .48, width * .65);
  glow.addColorStop(0, 'rgba(92,143,112,.12)'); glow.addColorStop(1, 'rgba(12,15,15,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(181,239,206,.035)'; ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  for (let y = 0; y < height; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
  const reach = width < 600 ? 150 : 235;
  nodes.forEach(n => {
    n.x = (n.x + n.vx * step + width) % width;
    n.y = (n.y + n.vy * step + height) % height;
    const dx = n.x - pointer.x, dy = n.y - pointer.y, d = Math.hypot(dx, dy);
    const force = Math.max(0, 1 - d / reach) * 28;
    const ease = Math.min(1, .065 * step);
    n.ox += (dx / Math.max(d, 1) * force - n.ox) * ease;
    n.oy += (dy / Math.max(d, 1) * force - n.oy) * ease;
    n.px = n.x + n.ox; n.py = n.y + n.oy;
    n.lit = Math.max(0, 1 - d / reach);
    pulses.forEach(p => { const ring = Math.abs(Math.hypot(n.px - p.x, n.py - p.y) - p.radius); n.lit = Math.max(n.lit, Math.max(0, 1 - ring / 50) * p.life); });
  });
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j], dist = Math.hypot(a.px - b.px, a.py - b.py);
    if (dist > 190) continue;
    const strength = (1 - dist / 190), lit = Math.max(a.lit, b.lit);
    ctx.strokeStyle = `rgba(181,239,206,${strength * (.24 + lit * .48)})`;
    ctx.lineWidth = lit > .2 ? 1.1 : .7;
    ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py); ctx.stroke();
    // Sparse signal packets travel along existing connections.
    if ((i + j) % 7 === 0) {
      const t = (elapsed * .00016 + a.phase) % 1;
      ctx.fillStyle = `rgba(210,255,227,${strength * .75})`;
      ctx.beginPath(); ctx.arc(a.px + (b.px - a.px) * t, a.py + (b.py - a.py) * t, 1.7, 0, Math.PI * 2); ctx.fill();
    }
  }
  nodes.forEach(n => {
    if (n.lit > .1) {
      const halo = ctx.createRadialGradient(n.px, n.py, 0, n.px, n.py, 18);
      halo.addColorStop(0, `rgba(181,239,206,${n.lit * .24})`); halo.addColorStop(1, 'rgba(181,239,206,0)');
      ctx.fillStyle = halo; ctx.fillRect(n.px - 18, n.py - 18, 36, 36);
    }
    ctx.fillStyle = `rgba(181,239,206,${.35 + n.lit * .6 + Math.sin(elapsed * .001 + n.phase) * .1})`;
    ctx.beginPath(); ctx.arc(n.px, n.py, 1.6 + n.lit * 1.5, 0, Math.PI * 2); ctx.fill();
    if (n.lit > .1 && Math.hypot(n.px - pointer.x, n.py - pointer.y) < reach) {
      ctx.strokeStyle = `rgba(181,239,206,${n.lit * .23})`; ctx.lineWidth = .7;
      ctx.beginPath(); ctx.moveTo(n.px, n.py); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
    }
  });
  pulses.forEach(p => {
    p.radius += step * 4; p.life -= step * .009;
    ctx.strokeStyle = `rgba(181,239,206,${Math.max(0, p.life) * .22})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.stroke();
  });
  pulses = pulses.filter(p => p.life > 0);
}
function animate(time) {
  const step = lastTime ? Math.min((time - lastTime) / 16.67, 3) : 1;
  lastTime = time; elapsed += step * 16.67;
  draw(step); frame = requestAnimationFrame(animate);
}
function syncMotion() {
  cancelAnimationFrame(frame); lastTime = 0;
  document.body.classList.toggle('motion-paused', paused);
  toggle.textContent = paused ? 'Play animation' : 'Pause animation';
  toggle.setAttribute('aria-pressed', String(paused));
  if (!paused && !document.hidden) frame = requestAnimationFrame(animate);
}
toggle.addEventListener('click', () => { paused = !paused; syncMotion(); });
reducedMotion.addEventListener('change', e => { paused = e.matches; syncMotion(); });
document.addEventListener('visibilitychange', syncMotion);
window.addEventListener('resize', resize);
window.addEventListener('pointermove', e => { pointer = { x: e.clientX, y: e.clientY }; });
document.addEventListener('pointerleave', () => { pointer = { x: -1000, y: -1000 }; });
window.addEventListener('pointerdown', e => {
  if (paused || e.target.closest('a, button')) return;
  pointer = { x: e.clientX, y: e.clientY };
  pulses.push({ x: e.clientX, y: e.clientY, radius: 0, life: 1 });
  pulses = pulses.slice(-5);
});
window.addEventListener('pointerup', e => { if (e.pointerType === 'touch') pointer = { x: -1000, y: -1000 }; });
document.querySelector('#enter').addEventListener('click', e => {
  if (reducedMotion.matches || paused || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  e.preventDefault(); const destination = e.currentTarget.href;
  document.body.classList.add('leaving');
  setTimeout(() => { location.href = destination; }, 400);
});
// Back/forward cache restores the entrance in its readable state.
window.addEventListener('pageshow', () => { document.body.classList.remove('leaving'); });
resize(); syncMotion();
