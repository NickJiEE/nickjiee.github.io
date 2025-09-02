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