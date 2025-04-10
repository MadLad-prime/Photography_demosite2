document.addEventListener('DOMContentLoaded', () => {
    // --- Selectors ---
    const preloader = document.querySelector('.preloader');
    const mainContent = document.querySelector('.main-content');
    const navLinks = document.querySelectorAll('.nav-link');
    const galleryImages = document.querySelectorAll('.gallery-image'); // Still needed for lightbox trigger
    const lightbox = document.querySelector('.lightbox');
    const lightboxContent = document.querySelector('.lightbox-content');
    const lightboxClose = document.querySelector('.lightbox-close');
    const shutter = document.querySelector('.shutter');
    const firstFlap = document.querySelector('.flap');
    const pageSections = document.querySelectorAll('.page-section'); // Get all switchable sections

    // --- Preloader Logic (Keep As Is) ---
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (preloader) {
                preloader.classList.add('hidden');
            }
            document.body.classList.add('loaded');
        }, 1000); // Adjust timing if needed
    });

    // --- UPDATED Navigation Logic ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Use 'data-page' attribute now
            const targetPageId = link.getAttribute('data-page');

            // Ignore click if it's already the active link
            if (link.classList.contains('active')) {
                return;
            }

            // Remove 'active' from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            pageSections.forEach(sec => sec.classList.remove('active'));

            // Add 'active' to the clicked link
            link.classList.add('active');

            // Find and activate the target section
            const targetSection = document.getElementById(targetPageId);
            if (targetSection) {
                targetSection.classList.add('active');
                 // Optional: Scroll to top of the section after switching
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                console.warn(`Navigation target section not found for ID: ${targetPageId}`);
                // Optionally show a default section like 'home' if target is missing
                const homeSection = document.getElementById('home');
                if(homeSection) homeSection.classList.add('active');
                const homeLink = document.querySelector('.nav-link[data-page="home"]');
                if(homeLink) homeLink.classList.add('active');

            }
        });
    });

    // --- Lightbox & Shutter Logic (Keep As Is - CRITICAL FOR FUNCTIONALITY) ---
    let isShutterAnimating = false;

    galleryImages.forEach(image => {
        image.addEventListener('click', () => {
            if (isShutterAnimating || !shutter || !firstFlap) return; // Add null checks for robustness
            isShutterAnimating = true;
            const imageUrl = image.getAttribute('src');

            shutter.classList.add('active');

            const animationEndHandler = () => {
                // Check if the lightbox elements exist before using them
                 if (lightboxContent && lightbox) {
                    lightboxContent.setAttribute('src', imageUrl);
                    lightbox.classList.add('visible');
                    document.body.classList.add('no-scroll');
                }
                if(shutter) shutter.classList.remove('active'); // Check shutter exists
                isShutterAnimating = false;
                 // Clean up the listener
                 if(firstFlap) firstFlap.removeEventListener('animationend', animationEndHandler);
            };

            // Check if firstFlap exists before adding listener
            if (firstFlap) {
                firstFlap.addEventListener('animationend', animationEndHandler, { once: true }); // Use {once: true} for automatic removal
            } else {
                 // If no flaps/shutter animation, open lightbox directly after a small delay
                 console.warn("Shutter flap element not found, opening lightbox directly.");
                 setTimeout(() => {
                      if (lightboxContent && lightbox) {
                        lightboxContent.setAttribute('src', imageUrl);
                        lightbox.classList.add('visible');
                        document.body.classList.add('no-scroll');
                      }
                      isShutterAnimating = false;
                 }, 100); // Small delay
            }


            // Fallback timer (Keep, adjust if needed for animation)
            // Removed the manual removal inside setTimeout because {once: true} handles it
            setTimeout(() => {
                if (isShutterAnimating) {
                    console.warn("Shutter animationEnd event fallback triggered.");
                    animationEndHandler(); // Run the cleanup/show logic
                }
            }, 1800); // Match animation + delay (1.5s + 0.2s + buffer)
        });
    });

    // Close Lightbox (Keep As Is)
    const closeLightbox = () => {
         if (lightbox) {
            lightbox.classList.remove('visible');
            document.body.classList.remove('no-scroll');
            setTimeout(() => {
                if (!lightbox.classList.contains('visible')) {
                   if(lightboxContent) lightboxContent.setAttribute('src', '');
                }
            }, 500); // Match lightbox transition duration
         }
    };

    if(lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if(lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('visible')) {
            closeLightbox();
        }
    });

    // --- Lightbox Next Picture Feature (Keep As Is) ---
    // Convert NodeList to Array safely
    const galleryImagesArray = galleryImages ? Array.from(galleryImages) : [];

    const showNextPicture = () => {
        if (!lightboxContent || galleryImagesArray.length === 0) return; // Guard clause

        const currentSrc = lightboxContent.getAttribute('src');
        const currentIndex = galleryImagesArray.findIndex(img => img.getAttribute('src') === currentSrc);

        if (currentIndex !== -1) {
            const nextIndex = (currentIndex + 1) % galleryImagesArray.length;
            const nextImageSrc = galleryImagesArray[nextIndex]?.getAttribute('src');
            if (nextImageSrc) {
                 // Optional: Add a subtle transition effect
                 lightboxContent.style.opacity = '0';
                 setTimeout(() => {
                    lightboxContent.setAttribute('src', nextImageSrc);
                    lightboxContent.style.opacity = '1';
                 }, 150); // short fade duration
            }
        }
    };

    if(lightboxContent) {
        // Desktop click on the lightbox image for next picture
        lightboxContent.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing lightbox on click
            showNextPicture();
        });

        // Mobile swipe on the lightbox image for next picture
        let startXLightbox = 0, deltaXLightbox = 0;
        lightboxContent.addEventListener('touchstart', e => {
            if (e.touches.length === 1) { // Ensure single touch
                startXLightbox = e.touches[0].pageX;
            }
        });
        lightboxContent.addEventListener('touchmove', e => {
             if (e.touches.length === 1) {
                deltaXLightbox = e.touches[0].pageX - startXLightbox;
             }
        });
        lightboxContent.addEventListener('touchend', () => {
            if (deltaXLightbox < -50) { // Swipe left threshold
                showNextPicture();
            } else if (deltaXLightbox > 50) {
                 // Optional: Implement swipe right for previous picture?
                 // showPreviousPicture();
            }
            // Reset values
            startXLightbox = 0;
            deltaXLightbox = 0;
        });
    }

    // Footer Year Update (moved from inline HTML)
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Hero background image slideshow
    const heroSection = document.querySelector('.hero-section');
    const heroImages = [
        'img/hero.jpeg',
        'img/landscapes/l5.jpg',
        'img/landscapes/l3.jpg',
        'img/sport/s3.jpg',
        'img/wildlife/w2.jpg'
    ];
    let currentHeroIndex = 0;
    if (heroSection) {
        setInterval(() => {
            currentHeroIndex = (currentHeroIndex + 1) % heroImages.length;
            heroSection.style.backgroundImage = `url('${heroImages[currentHeroIndex]}')`;
        }, 5000); // change image every 5 seconds
    }

}); // End DOMContentLoaded

    // --- MASONRY INITIALIZATION ---

    // Select all gallery grid containers
    const galleryGrids = document.querySelectorAll('.gallery-grid');
    let masonryInstances = []; // Store instances if we need to destroy/reload later

    function initMasonry() {
        console.log("Attempting to initialize Masonry...");
        galleryGrids.forEach((grid, index) => {
            // Optional: Use imagesLoaded for reliability
            // Requires adding the imagesLoaded script to your HTML
            /*
            const imgLoad = imagesLoaded(grid);
            imgLoad.on('progress', function() {
                console.log('Masonry layout on progress for grid:', index);
                if (masonryInstances[index]) {
                     masonryInstances[index].layout();
                 }
            });
            imgLoad.on('done', function() {
                 console.log('Images loaded, initializing/laying out Masonry for grid:', index);
                 if (!masonryInstances[index]) {
                    masonryInstances[index] = new Masonry(grid, {
                         itemSelector: '.gallery-image',
                         columnWidth: '.gallery-image', // Use item width defined in CSS
                         gutter: 16, // **MUST MATCH the HORIZONTAL gap intended (e.g., 1rem = 16px)
                         percentPosition: true,
                         fitWidth: false // Adjust if needed
                    });
                 } else {
                     masonryInstances[index].layout();
                 }
             });
             imgLoad.on('fail', function() {
                 console.error("ImagesLoaded failed for grid:", index);
             });
            */


            // --- Simpler Initialization (Without imagesLoaded) ---
            // Runs immediately, might need recalculation if images load late
             if (typeof Masonry !== 'undefined') {
                 console.log("Initializing Masonry (simple) for grid:", grid);
                 // Destroy previous instance if resizing or re-navigating, prevents errors
                 if (masonryInstances[index]) {
                     // console.log("Destroying existing Masonry instance for grid:", index);
                     // masonryInstances[index].destroy(); // Destroy might be too aggressive on simple nav
                 }
                 masonryInstances[index] = new Masonry( grid, {
                    itemSelector: '.gallery-image',
                    columnWidth: '.gallery-image', // Tells Masonry how wide a column is based on item width
                    // --- IMPORTANT: Gutter is HORIZONTAL space ---
                    // Masonry calculates positions; it uses this gutter value.
                    // Vertical space comes from the margin-bottom on .gallery-image in CSS.
                    // Set gutter value in PIXELS to match the desired horizontal gap
                    // e.g., if gap should be 1rem (16px), set gutter: 16
                    gutter: 16,
                    percentPosition: true, // Good for responsive % widths in CSS
                    initLayout: true // Initialize layout immediately
                });

                // **Crucial:** Re-layout Masonry when switching tabs/pages if elements were display:none
                // We might need to explicitly call layout when a section becomes active.
            } else {
                 console.error("Masonry library not found!");
             }
             // --- End Simpler Init ---
        });
    }

    // Initial call on load
    // If using imagesLoaded, the init happens inside its 'done' event.
    // If NOT using imagesLoaded, call initMasonry() here.
    initMasonry(); // Remove this line if using the imagesLoaded 'done' event method

    // Re-layout Masonry when a gallery section becomes active
    // Modify the navigation logic slightly:
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPageId = link.getAttribute('data-page');

            if (link.classList.contains('active')) return;

            navLinks.forEach(l => l.classList.remove('active'));
            pageSections.forEach(sec => sec.classList.remove('active'));

            link.classList.add('active');
            const targetSection = document.getElementById(targetPageId);

            if (targetSection) {
                targetSection.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // --- ADD THIS CHECK ---
                // If the activated section contains a gallery grid, re-layout Masonry
                const gridInTarget = targetSection.querySelector('.gallery-grid');
                if (gridInTarget) {
                    const gridIndex = Array.from(galleryGrids).indexOf(gridInTarget);
                    if (gridIndex !== -1 && masonryInstances[gridIndex]) {
                         console.log("Re-laying out Masonry for newly active grid:", gridIndex);
                         // Use setTimeout to ensure element is visible and dimensions are calculated
                         setTimeout(() => {
                              masonryInstances[gridIndex].layout();
                         }, 50); // Small delay often helps
                    } else if (gridIndex !== -1 && !masonryInstances[gridIndex]) {
                        // If instance didn't exist (e.g., first time showing), try initializing again
                        console.log("Masonry instance not found for active grid, re-initializing");
                         initMasonry(); // Re-run full init (may recreate some instances)
                    }
                }
                // --- END ADDED CHECK ---

            } else {
                console.warn(`Navigation target section not found for ID: ${targetPageId}`);
                const homeSection = document.getElementById('home');
                if(homeSection) homeSection.classList.add('active');
                const homeLink = document.querySelector('.nav-link[data-page="home"]');
                if(homeLink) homeLink.classList.add('active');
            }
        });
    });

    // Optional: Add resize listener to re-layout Masonry (important!)
     let resizeTimeout;
     window.addEventListener('resize', () => {
         clearTimeout(resizeTimeout);
         resizeTimeout = setTimeout(() => {
             console.log("Window resized, relaying out all Masonry instances.");
             masonryInstances.forEach(instance => {
                 if(instance) {
                     instance.layout();
                 }
             });
         }, 250); // Debounce resize event
     });

    // --- End MASONRY ---
