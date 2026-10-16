const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
function closeMenu() { nav?.classList.remove('is-open'); menu?.setAttribute('aria-expanded', 'false'); }
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
document.addEventListener('click', e => { if (!e.target.closest('.nav')) closeMenu(); });
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
const filters = document.querySelectorAll('[data-filter]');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  let count = 0;
  document.querySelectorAll('[data-category]').forEach(card => {
    card.hidden = button.dataset.filter !== 'All work' && card.dataset.category !== button.dataset.filter;
    if (!card.hidden) count++;
  });
  document.querySelector('.result-count').textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
}));
const dialog = document.querySelector('.image-dialog');
if (dialog) {
  let lastImage;
  document.querySelectorAll('.project-body .modal-image-container img').forEach(img => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Enlarge ${img.alt}`);
    const open = () => { lastImage = img; dialog.querySelector('img').src = img.src; dialog.querySelector('img').alt = img.alt; dialog.showModal(); document.body.style.overflow = 'hidden'; };
    img.addEventListener('click', open);
    img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; lastImage?.focus(); });
}
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.08 });
  document.querySelectorAll('.section-heading, .research-grid, .focus-list article').forEach(el => { el.classList.add('reveal-ready'); observer.observe(el); });
}

// Pointer lighting stays local to imagery; text never follows the cursor.
const pointerMotion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
document.querySelectorAll('.hero-art, .work-image').forEach(surface => {
  let pointerFrame = 0;
  surface.addEventListener('pointermove', event => {
    if (!pointerMotion.matches) return;
    const { clientX, clientY } = event;
    cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      const rect = surface.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width, y = (clientY - rect.top) / rect.height;
      surface.style.setProperty('--pointer-x', `${x * 100}%`);
      surface.style.setProperty('--pointer-y', `${y * 100}%`);
      if (surface.classList.contains('hero-art')) surface.style.transform = `perspective(1200px) rotateX(${(0.5 - y) * 3}deg) rotateY(${(x - 0.5) * 3}deg)`;
    });
  });
  const resetSurface = () => {
    cancelAnimationFrame(pointerFrame);
    surface.style.removeProperty('transform');
    surface.style.removeProperty('--pointer-x');
    surface.style.removeProperty('--pointer-y');
  };
  surface.addEventListener('pointerleave', resetSurface);
  pointerMotion.addEventListener('change', resetSurface);
});
