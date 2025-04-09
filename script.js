document.addEventListener('DOMContentLoaded', () => {
    // --- Selectors related to Preloader ---
    const preloader = document.querySelector('.preloader');
    const mainContent = document.querySelector('.main-content'); // Needed to control visibility
    const navLinks = document.querySelectorAll('.nav-link');
    const galleries = document.querySelectorAll('.gallery');
    const galleryImages = document.querySelectorAll('.gallery-image');
    const lightbox = document.querySelector('.lightbox');
    const lightboxContent = document.querySelector('.lightbox-content');
    const lightboxClose = document.querySelector('.lightbox-close');
    const shutter = document.querySelector('.shutter'); // Get the new shutter element
    const firstFlap = document.querySelector('.flap'); // Get one flap to listen for animation end

    // --- Preloader Logic ---
    window.addEventListener('load', () => {
        setTimeout(() => { // Ensure content is rendered
            preloader.classList.add('hidden');
            document.body.classList.add('loaded'); // Trigger main content fade-in
        }, 1000); // Increased delay for a slower preloader
    });

    // --- Navigation Logic ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Switch gallery
            const targetGenre = link.getAttribute('data-genre');
            galleries.forEach(gallery => {
                if (gallery.id === targetGenre) {
                    gallery.classList.add('active');
                } else {
                    gallery.classList.remove('active');
                }
            });
        });
    });

    // --- Lightbox & Shutter Logic ---
    let isShutterAnimating = false; // Flag to prevent double clicks

    galleryImages.forEach(image => {
        image.addEventListener('click', () => {
            if (isShutterAnimating) return; // Prevent triggering if already animating
            isShutterAnimating = true;
            const imageUrl = image.getAttribute('src');

            // 1. Activate Shutter
            shutter.classList.add('active');

            // Remove immediate lightbox display and wait for shutter animation end
            const animationEndHandler = () => {
                lightboxContent.setAttribute('src', imageUrl);
                lightbox.classList.add('visible');
                shutter.classList.remove('active');
                isShutterAnimating = false;
                firstFlap.removeEventListener('animationend', animationEndHandler);
            };
            firstFlap.addEventListener('animationend', animationEndHandler);

            // Fallback timer: adjusted to match the slower animation duration
            setTimeout(() => {
                if (isShutterAnimating) {
                    console.warn("AnimationEnd event fallback triggered.");
                    lightboxContent.setAttribute('src', imageUrl);
                    lightbox.classList.add('visible');
                    shutter.classList.remove('active');
                    isShutterAnimating = false;
                    firstFlap.removeEventListener('animationend', animationEndHandler);
                }
            }, 1800); // Increased fallback duration for the slower shutter animation
        });
    });

    // Close Lightbox
    const closeLightbox = () => {
        lightbox.classList.remove('visible');
        // Optional: Delay clearing the src to prevent flash of empty space
        setTimeout(() => {
             if (!lightbox.classList.contains('visible')) { // Check if it wasn't reopened quickly
                lightboxContent.setAttribute('src', '');
             }
        }, 500); // Match lightbox transition duration
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        // Close only if clicking the background overlay, not the image itself
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Optional: Close lightbox with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('visible')) {
            closeLightbox();
        }
    });

}); // End DOMContentLoaded
