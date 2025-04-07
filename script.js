document.addEventListener('DOMContentLoaded', () => {

    const preloader = document.querySelector('.preloader');
    const mainContent = document.querySelector('.main-content');
    const navLinks = document.querySelectorAll('.nav-link');
    const galleries = document.querySelectorAll('.gallery');
    const galleryImages = document.querySelectorAll('.gallery-image');
    const shutterOverlay = document.querySelector('.shutter-overlay');
    const lightbox = document.querySelector('.lightbox');
    const lightboxContent = document.querySelector('.lightbox-content');
    const lightboxClose = document.querySelector('.lightbox-close');

    // --- Preloader Logic ---
    window.addEventListener('load', () => {
        setTimeout(() => { // Give animations a moment to potentially finish
            preloader.classList.add('hidden');
            document.body.classList.add('loaded'); // Add class to body for content fade-in trigger
        }, 2500); // Adjust timing based on preloader animation length (needs to be >= total animation duration)

        // Clean up preloader from DOM after transition
        preloader.addEventListener('transitionend', () => {
            if (preloader.classList.contains('hidden')) {
                preloader.style.display = 'none';
            }
        });
    });

    // --- Seamless Navigation ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor behavior

            // Get target genre from data attribute
            const targetGenre = link.dataset.genre;

            // Update active link state
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');

            // Switch active gallery section
            galleries.forEach(gallery => {
                if (gallery.id === targetGenre) {
                    // Remove any existing active class to reset animation
                    gallery.classList.remove('active');
                    // Force reflow to restart animation if clicking same tab again
                    void gallery.offsetWidth;
                    // Add active class to trigger display and animation
                    gallery.classList.add('active');
                } else {
                    gallery.classList.remove('active');
                }
            });
        });
    });

    // --- Image Click Logic (Shutter + Lightbox) ---
    galleryImages.forEach(image => {
        image.addEventListener('click', () => {
            const imageSrc = image.getAttribute('src');
            triggerShutterAndLightbox(imageSrc);
        });
    });

    // Function to handle shutter and lightbox sequence
    function triggerShutterAndLightbox(imageSrc) {
        // 1. Show and activate shutter (close animation)
        shutterOverlay.style.opacity = '1'; // Make it visible
        shutterOverlay.style.pointerEvents = 'auto'; // Make it interactable briefly if needed
        shutterOverlay.classList.add('active');
        shutterOverlay.classList.remove('open'); // Ensure it starts from closed/ready state

        // Use setTimeout to sequence animations
        setTimeout(() => {
            // 2. Shutter is closed, now prepare and show lightbox
            lightboxContent.setAttribute('src', imageSrc);
            lightbox.classList.add('visible');

            // 3. Immediately trigger shutter open animation
            shutterOverlay.classList.add('open');
             shutterOverlay.classList.remove('active');

             // 4. Hide shutter overlay after its open animation finishes
             setTimeout(() => {
                 shutterOverlay.style.opacity = '0';
                 shutterOverlay.style.pointerEvents = 'none';
                 // Optional: could fully remove classes 'open' here if needed for reset
             }, 500); // Match shutter transition duration in CSS

        }, 500); // Match shutter transition duration in CSS
    }


    // --- Lightbox Close Logic ---
    function closeLightbox() {
        lightbox.classList.remove('visible');
         // Optional: Clear the image source after animation to prevent seeing old image briefly next time
         setTimeout(() => {
             if (!lightbox.classList.contains('visible')) { // Check if it wasn't reopened quickly
                 lightboxContent.setAttribute('src', '');
             }
         }, 500); // Match lightbox fade-out duration
    }

    lightboxClose.addEventListener('click', closeLightbox);
    // Close lightbox if clicking on the background overlay
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) { // Only close if click is directly on the overlay
            closeLightbox();
        }
    });

    // Close lightbox with Escape key
     document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('visible')) {
            closeLightbox();
        }
    });

}); // End DOMContentLoaded