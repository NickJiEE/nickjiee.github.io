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
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    });

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
    let timelineNodes = []; 
    
    if (!timeline || timelineItems.length === 0) return;

    const endMarker = document.createElement('div');
    endMarker.className = 'timeline-end-marker';
    timeline.appendChild(endMarker);

    function positionTimelineNodes() {
        timelineNodes.forEach((node, index) => {
            const item = timelineItems[index];
            node.style.top = (item.offsetTop + 15) + 'px';
            
            if (window.innerWidth <= 768) {
                node.style.left = '20px';
                node.style.transform = 'none';
            } else {
                node.style.left = '50%';
                node.style.transform = 'translateX(-50%)';
            }
        });
    }

    timelineItems.forEach((item, index) => {
        const node = document.createElement('div');
        node.className = 'timeline-node';
        node.style.position = 'absolute';
        
        timeline.appendChild(node);
        timelineNodes.push(node);

        node.addEventListener('click', () => {
            toggleTimelineItem(item);
        });
    });

    positionTimelineNodes();

    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateTimeline();
                timelineObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    function animateTimeline() {
        timeline.classList.add('animate');
        
        timelineItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animate');
            }, 300 + (index * 200));
        });
        
        // ❌ removed snapping scrollIntoView here
    }

    if (timelineSection) {
        timelineObserver.observe(timelineSection);
    }

    timelineItems.forEach(item => {
        const content = item.querySelector('.timeline-content');
        if (content) {
            content.addEventListener('click', () => {
                toggleTimelineItem(item);
            });
        }
    });

    function toggleTimelineItem(item) {
        const isExpanded = item.classList.contains('expanded');
        
        timelineItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('expanded')) {
                otherItem.classList.remove('expanded');
            }
        });
        
        if (isExpanded) {
            item.classList.remove('expanded');
        } else {
            item.classList.add('expanded');
            // ❌ removed snapping scrollIntoView here
        }
    }

    function handleResize() {
        positionTimelineNodes();
        
        timelineNodes.forEach(node => {
            const newNode = node.cloneNode(true);
            node.parentNode.replaceChild(newNode, node);
            
            const nodeIndex = timelineNodes.indexOf(node);
            timelineNodes[nodeIndex] = newNode;
            
            newNode.addEventListener('click', () => {
                toggleTimelineItem(timelineItems[nodeIndex]);
            });
            
            newNode.addEventListener('mouseenter', () => {
                if (window.innerWidth <= 768) {
                    newNode.style.transform = 'scale(1.2)';
                } else {
                    newNode.style.transform = 'translateX(-50%) scale(1.2)';
                }
                newNode.style.boxShadow = '0 0 0 12px rgba(0, 191, 255, 0.2)';
            });
            
            newNode.addEventListener('mouseleave', () => {
                if (window.innerWidth <= 768) {
                    newNode.style.transform = 'scale(1)';
                } else {
                    newNode.style.transform = 'translateX(-50%) scale(1)';
                }
                newNode.style.boxShadow = 'none';
            });
        });
    }

    window.addEventListener('resize', handleResize);

    createBackToTopButton();
});

// Back to Top Button
function createBackToTopButton() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.title = 'Back to Top';
    
    document.body.appendChild(backToTopBtn);
    
    function toggleBackToTopButton() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }
    
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    window.addEventListener('scroll', toggleBackToTopButton);
    backToTopBtn.addEventListener('click', scrollToTop);
    
    toggleBackToTopButton();
}
