document.addEventListener('DOMContentLoaded', function() {
    const images = Array.from(document.querySelectorAll('.gallery-grid .gallery-image'));
    if(!images.length) return;

    // Group images by row based on their top coordinate (with tolerance)
    const rows = [];
    images.forEach(img => {
        const top = Math.round(img.getBoundingClientRect().top);
        let row = rows.find(r => Math.abs(r.top - top) < 5);
        if(row) {
            row.images.push(img);
        } else {
            rows.push({ top, images: [img] });
        }
    });

    // Reduction factor to lower the overall height
    const reductionFactor = 0.5; // reduce height by 20%

    // For each row, calculate the average natural height, reduce it, and apply it
    rows.forEach(row => {
        let total = 0;
        row.images.forEach(img => {
            total += img.naturalHeight || img.getBoundingClientRect().height;
        });
        const avg = total / row.images.length;
        const newHeight = avg * reductionFactor;
        row.images.forEach(img => {
            img.style.height = newHeight + 'px';
            img.style.objectFit = 'cover';
        });
    });
});
