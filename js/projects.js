// Carousel functionality - PROJECTS
const track = document.querySelector('.carousel-track');
const container = document.querySelector('.carousel-container');
const leftBtn = document.querySelector('.arrow.left');
const rightBtn = document.querySelector('.arrow.right');

let autoScroll;
let cardWidth;

// ---- FUNCTIONS ----
function updateCardWidth() {
  cardWidth = track.querySelector('.project-card').offsetWidth + 30;
}

// Desktop next/prev logic
function next() {
  track.style.transition = 'transform 0.6s ease';
  track.style.transform = `translateX(${-cardWidth * 2}px)`;

  track.addEventListener(
    'transitionend',
    () => {
      track.appendChild(track.firstElementChild);
      track.style.transition = 'none';
      track.style.transform = `translateX(${-cardWidth}px)`;
    },
    { once: true }
  );
}

function prev() {
  track.style.transition = 'none';
  track.prepend(track.lastElementChild);
  track.style.transform = `translateX(${-cardWidth * 2}px)`;

  requestAnimationFrame(() => {
    track.style.transition = 'transform 0.6s ease';
    track.style.transform = `translateX(${-cardWidth}px)`;
  });
}

// ---- AUTOSCROLL (desktop only) ----
function startAutoScroll() {
  if (window.innerWidth > 768) {
    autoScroll = setInterval(next, 5000);
  }
}
function resetAutoScroll() {
  clearInterval(autoScroll);
  startAutoScroll();
}

// ---- INIT ----
function initCarouselMode() {
  updateCardWidth();

  if (window.innerWidth > 768) {
    // Desktop mode
    track.style.transform = `translateX(${-cardWidth}px)`;
    leftBtn.style.display = "block";
    rightBtn.style.display = "block";
    container.style.overflowX = "hidden";
    resetAutoScroll(); // only start auto-scroll on desktop
  } else {
    // Mobile mode
    track.style.transform = "none";
    track.style.transition = "none";
    leftBtn.style.display = "none";
    rightBtn.style.display = "none";
    container.style.overflowX = "auto";
    clearInterval(autoScroll); // ensure auto-scroll is stopped
  }
}

initCarouselMode();

// ---- BUTTONS (desktop only) ----
rightBtn.addEventListener('click', () => { next(); resetAutoScroll(); });
leftBtn.addEventListener('click', () => { prev(); resetAutoScroll(); });

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

// Zoom button
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("zoom-btn")) {
    const imgSrc = e.target.previousElementSibling.getAttribute("src");
    const lightbox = document.getElementById("lightbox");
    lightbox.querySelector("img").src = imgSrc;
    lightbox.style.display = "flex";
  }
  if (e.target.closest("#lightbox .close") || e.target.id === "lightbox") {
    document.getElementById("lightbox").style.display = "none";
  }
});

// Mobile swipe (scroll only, no transforms)
let startX = 0;
let isDragging = false;

track.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
  isDragging = true;
  clearInterval(autoScroll);
});

track.addEventListener("touchmove", (e) => {
  if (!isDragging) return;
  const diff = e.touches[0].clientX - startX;

  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      container.scrollBy({ left: -cardWidth, behavior: "smooth" });
    } else {
      container.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
    isDragging = false;
  }
});

track.addEventListener("touchend", () => {
  isDragging = false;
  resetAutoScroll(); // restart auto-scroll only if desktop
});

// Resize handler
window.addEventListener('resize', () => {
  updateCardWidth();
  initCarouselMode();
});
