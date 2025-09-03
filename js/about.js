// Skills Animation with Stagger Effect
document.addEventListener('DOMContentLoaded', function() {
    // Set up Intersection Observer to detect when skills section comes into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skills = entry.target.querySelectorAll('.skill');
                
                // Animate skills with stagger effect
                skills.forEach((skill, index) => {
                    setTimeout(() => {
                        skill.classList.add('animate');
                    }, index * 100); // 100ms delay between each skill
                });
                
                // Stop observing after animation is triggered
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3, // Trigger when 30% of the skills section is visible
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before the section is fully visible
    });

    // Start observing the skills section
    const skillsSection = document.querySelector('.skills');
    if (skillsSection) {
        observer.observe(skillsSection);
    }
});

// Enhanced Interactive Timeline Animation with Indicators
document.addEventListener('DOMContentLoaded', function() {
    const timelineSection = document.querySelector('.timeline-section');
    const timeline = document.querySelector('.timeline');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (!timeline || timelineItems.length === 0) return;

    // Create the end marker element
    const endMarker = document.createElement('div');
    endMarker.className = 'timeline-end-marker';
    timeline.appendChild(endMarker);

    // Create timeline nodes dynamically and position them correctly
    timelineItems.forEach((item, index) => {
        const node = document.createElement('div');
        node.className = 'timeline-node';
        
        // Position the node in the timeline container
        node.style.position = 'absolute';
        node.style.left = '50%';
        node.style.transform = 'translateX(-50%)';
        node.style.top = (item.offsetTop + 15) + 'px'; // 15px to align with content
        
        timeline.appendChild(node);
        
        // Add click handler to node
        node.addEventListener('click', () => {
            toggleTimelineItem(item);
        });
    });

    // Enhanced Intersection Observer for timeline animation
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Start animation sequence
                animateTimeline();
                
                // Stop observing after animation
                timelineObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    // Animation sequence function
    function animateTimeline() {
        // 1. Animate the central line first
        timeline.classList.add('animate');
        
        // 2. Animate timeline items with stagger
        timelineItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animate');
            }, 300 + (index * 200)); // Start after line begins, 200ms delay between items
        });
        
        // 3. Add a subtle scroll effect to highlight the timeline
        setTimeout(() => {
            timelineSection.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 500);
    }

    // Start observing the timeline section
    if (timelineSection) {
        timelineObserver.observe(timelineSection);
    }

    // Add click handlers for expandable content
    timelineItems.forEach(item => {
        const content = item.querySelector('.timeline-content');
        
        // Add click handler to content
        if (content) {
            content.addEventListener('click', () => {
                toggleTimelineItem(item);
            });
        }
    });

    function toggleTimelineItem(item) {
        const isExpanded = item.classList.contains('expanded');
        
        // Close all other expanded items with smooth animation
        timelineItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('expanded')) {
                otherItem.classList.remove('expanded');
            }
        });
        
        // Toggle current item
        if (isExpanded) {
            item.classList.remove('expanded');
        } else {
            item.classList.add('expanded');
            
            // Smooth scroll to the expanded item
            setTimeout(() => {
                item.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 100);
        }
    }

    // Optional: Add mouse hover effects to timeline nodes
    const allNodes = document.querySelectorAll('.timeline-node');
    allNodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            node.style.transform = 'translateX(-50%) scale(1.2)';
            node.style.boxShadow = '0 0 0 12px rgba(0, 191, 255, 0.2)';
        });
        
        node.addEventListener('mouseleave', () => {
            node.style.transform = 'translateX(-50%) scale(1)';
            node.style.boxShadow = 'none';
        });
    });

    // Back to Top Button Functionality
    createBackToTopButton();
});

// Back to Top Button Creation and Logic
function createBackToTopButton() {
    // Create the button element
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.title = 'Back to Top';
    
    // Add to body
    document.body.appendChild(backToTopBtn);
    
    // Show/hide button based on scroll position
    function toggleBackToTopButton() {
        if (window.scrollY > 300) { // Show after scrolling 300px
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }
    
    // Smooth scroll to top functionality
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Event listeners
    window.addEventListener('scroll', toggleBackToTopButton);
    backToTopBtn.addEventListener('click', scrollToTop);
    
    // Initial check in case page is already scrolled
    toggleBackToTopButton();
}