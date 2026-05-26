const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px', // Detecta la sección cuando está en la parte superior
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Buscamos todos los enlaces y quitamos la clase activa
            document.querySelectorAll('.legal-link').forEach(link => {
                link.classList.remove('active');
                // Si el href coincide con el ID de la sección visible, activamos el link
                if (link.getAttribute('href').substring(1) === entry.target.id) {
                    link.classList.add('active');
                }
            });
        }
    });
}, observerOptions);

document.querySelectorAll('.legal-section').forEach(section => {
    observer.observe(section);
});