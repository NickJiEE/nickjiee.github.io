// FAQ Toggle - INDEX
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
        const item = q.parentElement;
        item.classList.toggle('active');
    });
});

// Carousel functionality - PROJECTS
const track = document.querySelector('.carousel-track');
const leftBtn = document.querySelector('.arrow.left');
const rightBtn = document.querySelector('.arrow.right');

let autoScroll;
let cardWidth = track.querySelector('.project-card').offsetWidth + 30; // width + margins

// start with an offset so the "first card" is centered
track.style.transform = `translateX(${-cardWidth}px)`;

// ---- FUNCTIONS ----
function next() {
    track.style.transition = 'transform 0.6s ease';
    track.style.transform = `translateX(${-cardWidth * 2}px)`;

    track.addEventListener('transitionend', () => {
        // move first card to the end
        track.appendChild(track.firstElementChild);

        // reset position back to -cardWidth
        track.style.transition = 'none';
        track.style.transform = `translateX(${-cardWidth}px)`;
    }, { once: true });
}

function prev() {
    // move last card instantly to the front
    track.style.transition = 'none';
    track.prepend(track.lastElementChild);

    // jump back two steps, then slide into place
    track.style.transform = `translateX(${-cardWidth * 2}px)`;

    requestAnimationFrame(() => {
        track.style.transition = 'transform 0.6s ease';
        track.style.transform = `translateX(${-cardWidth}px)`;
    });
}

// ---- BUTTONS ----
rightBtn.addEventListener('click', () => { next(); resetAutoScroll(); });
leftBtn.addEventListener('click', () => { prev(); resetAutoScroll(); });

// ---- AUTOSCROLL ----
function startAutoScroll() {
    autoScroll = setInterval(() => next(), 5000);
}
function resetAutoScroll() {
    clearInterval(autoScroll);
    startAutoScroll();
}
startAutoScroll();

// ----- MODAL -----
const modal = document.getElementById('project-modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.querySelector('.modal .close');

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    const details = card.querySelector('.project-details');
    if (details) {
      modalBody.innerHTML = details.innerHTML; // copy full content
      modal.style.display = 'flex';
    }
  });
});

// Close modal
modalClose.addEventListener('click', () => { modal.style.display = 'none'; });
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

// Select zoom buttons (delegation safer if images are dynamic)
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("zoom-btn")) {
    const imgSrc = e.target.previousElementSibling.getAttribute("src");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = lightbox.querySelector("img");

    lightboxImg.src = imgSrc;
    lightbox.style.display = "flex";
  }

  if (e.target.closest("#lightbox .close") || e.target.id === "lightbox") {
    document.getElementById("lightbox").style.display = "none";
  }
});

// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('show');
});