document.addEventListener("DOMContentLoaded", () => {
    console.log("Cinematic Portfolio V2 Initialized");

    // --- CINEMATIC PAGE TRANSITIONS ---
    const curtain = document.querySelector('.transition-curtain');

    // 1. Enter Animation (Fade Out Curtain)
    if (curtain) {
        // Ensure curtain blocks view initially
        gsap.to(curtain, {
            opacity: 0, duration: 1.2, ease: 'power2.inOut', onComplete: () => {
                curtain.style.pointerEvents = 'none';
            }
        });
    }

    // 2. Leave Animation (Link Interception)
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            const target = link.getAttribute('target');

            // Handle internal links
            if (href && !href.startsWith('#') && !href.startsWith('mailto:') && target !== '_blank') {
                e.preventDefault();
                if (curtain) {
                    curtain.style.pointerEvents = 'all';
                    gsap.to(curtain, {
                        opacity: 1, duration: 0.8, ease: 'power2.inOut', onComplete: () => {
                            window.location.href = href;
                        }
                    });
                } else {
                    window.location.href = href;
                }
            }
        }
    });

    // ACT III: DRONE BACKGROUND CYCLER
    const droneSection = document.getElementById('drone-cycler');
    if (droneSection) {
        const images = [
            "/Users/joseadrianzen/.gemini/antigravity/brain/dff227e5-44cd-4ed1-8524-2fc02d7cbba7/drone_shot_iceland_1771384161257.png",
            "/Users/joseadrianzen/.gemini/antigravity/brain/dff227e5-44cd-4ed1-8524-2fc02d7cbba7/drone_iceland_beach_1771387190007.png",
            "/Users/joseadrianzen/.gemini/antigravity/brain/dff227e5-44cd-4ed1-8524-2fc02d7cbba7/drone_mountain_road_1771387342080.png"
        ];

        let currentIndex = 0;
        const imgElement = droneSection.querySelector('.current-bg');
        const nextImgElement = droneSection.querySelector('.next-bg');

        // Preload images
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });

        setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            const nextSrc = images[currentIndex];

            // Set next image source
            nextImgElement.src = nextSrc;

            // Fade in next image
            gsap.to(nextImgElement, {
                opacity: 1, duration: 1.5, ease: "power2.inOut", onComplete: () => {
                    // After fade, set current to next and reset next
                    imgElement.src = nextSrc;
                    nextImgElement.style.opacity = 0;
                }
            });

        }, 4000); // Change every 4 seconds
    }
});
