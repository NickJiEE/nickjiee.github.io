// Carousel functionality - PROJECTS
const track = document.querySelector('.carousel-track');
const container = document.querySelector('.carousel-container');
const leftBtn = document.querySelector('.arrow.left');
const rightBtn = document.querySelector('.arrow.right');

let cardWidth;
let scrollTimer = null;    // holds setTimeout (initial delay OR interval wrapper)
let scrollInterval = null; // holds the actual setInterval
let isAnimating = false;
let hasInitialized = false;

// ---- CARD WIDTH ----
function updateCardWidth() {
  const card = track.querySelector('.project-card');
  cardWidth = card.offsetWidth + parseInt(getComputedStyle(card).marginLeft) + parseInt(getComputedStyle(card).marginRight);
}

// ---- CAROUSEL MOVEMENT ----
function next() {
  if (isAnimating) return;
  isAnimating = true;

  track.style.transition = 'transform 0.6s ease';
  track.style.transform = `translateX(${-cardWidth * 2}px)`;

  track.addEventListener('transitionend', () => {
    track.appendChild(track.firstElementChild);
    track.style.transition = 'none';
    track.style.transform = `translateX(${-cardWidth}px)`;
    isAnimating = false;
  }, { once: true });
}

function prev() {
  if (isAnimating) return;
  isAnimating = true;

  track.style.transition = 'none';
  track.prepend(track.lastElementChild);
  track.style.transform = `translateX(${-cardWidth * 2}px)`;

  // Double rAF ensures the 'none' transition is committed before we animate
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      track.style.transition = 'transform 0.6s ease';
      track.style.transform = `translateX(${-cardWidth}px)`;
      setTimeout(() => { isAnimating = false; }, 620);
    });
  });
}

// ---- AUTOSCROLL ----
function stopAutoScroll() {
  clearTimeout(scrollTimer);
  clearInterval(scrollInterval);
  scrollTimer = null;
  scrollInterval = null;
}

function startAutoScroll(delay = 0) {
  if (window.innerWidth <= 768) return;
  stopAutoScroll();

  if (delay > 0) {
    scrollTimer = setTimeout(() => {
      scrollInterval = setInterval(next, 5000);
    }, delay);
  } else {
    scrollInterval = setInterval(next, 5000);
  }
}

function resetAutoScroll() {
  // After manual interaction, wait 3s before resuming
  startAutoScroll(3000);
}

// ---- INIT ----
function initCarouselMode() {
  updateCardWidth();

  if (window.innerWidth > 768) {
    // Desktop
    track.style.transition = 'none';
    track.style.transform = `translateX(${-cardWidth}px)`;
    leftBtn.style.display = 'block';
    rightBtn.style.display = 'block';
    container.style.overflowX = 'hidden';

    if (!hasInitialized) {
      hasInitialized = true;
      // Pre-position: move last card to front so card[0] is the visible center
      track.prepend(track.lastElementChild);
      startAutoScroll(7500);
    }
    // On resize: don't restart the scroll, just fix the transform
  } else {
    // Mobile
    track.style.transition = 'none';
    track.style.transform = 'none';
    leftBtn.style.display = 'none';
    rightBtn.style.display = 'none';
    container.style.overflowX = 'auto';
    stopAutoScroll();
  }
}

initCarouselMode();

// ---- BUTTONS ----
rightBtn.addEventListener('click', () => {
  if (isAnimating) return;
  next();
  resetAutoScroll();
});

leftBtn.addEventListener('click', () => {
  if (isAnimating) return;
  prev();
  resetAutoScroll();
});

// ---- RESIZE ----
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    initCarouselMode();
  }, 150); // debounce so it doesn't fire 50x while dragging the window
});

// ----- MODAL -----
const modal = document.getElementById('project-modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.querySelector('.modal .close');

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    const details = card.querySelector('.project-details');
    if (details) {
      modalBody.innerHTML = details.innerHTML;
      modal.style.display = 'flex';
    }
  });
});

modalClose.addEventListener('click', () => { modal.style.display = 'none'; });
modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

// ---- ZOOM / LIGHTBOX ----
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('zoom-btn')) {
    const imgSrc = e.target.previousElementSibling.getAttribute('src');
    const lightbox = document.getElementById('lightbox');
    lightbox.querySelector('img').src = imgSrc;
    lightbox.style.display = 'flex';
  }
  if (e.target.closest('#lightbox .close') || e.target.id === 'lightbox') {
    document.getElementById('lightbox').style.display = 'none';
  }
});

// ---- MOBILE SWIPE ----
let startX = 0;
let isDragging = false;

track.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
  isDragging = true;
  stopAutoScroll();
}, { passive: true });

track.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  const diff = e.touches[0].clientX - startX;
  if (Math.abs(diff) > 50) {
    diff > 0
      ? container.scrollBy({ left: -cardWidth, behavior: 'smooth' })
      : container.scrollBy({ left: cardWidth, behavior: 'smooth' });
    isDragging = false;
  }
}, { passive: true });

track.addEventListener('touchend', () => {
  isDragging = false;
  // No autoscroll restart on mobile
});