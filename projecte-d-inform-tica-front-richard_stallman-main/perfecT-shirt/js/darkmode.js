// js/darkmode.js

(function () {
    const KEY = 'perfecTshirt_theme';

    // 1. Aplicamos el tema inmediatamente (antes del primer paint) para evitar el flash blanco
    const savedTheme = localStorage.getItem(KEY) || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    // 2. Esperamos a que el HTML (y el botón) existan para asignar eventos e iconos
    document.addEventListener('DOMContentLoaded', function () {
        const btn = document.getElementById('dark-mode-toggle');
        
        if (btn) {
            // Sincronizamos el icono nada más cargar la página
            // &#9728; = Sol (☀), &#9790; = Luna (☾)
            btn.innerHTML = savedTheme === 'dark' ? '&#9728;' : '&#9790;';
            
            // Añadimos la acción al hacer clic
            btn.addEventListener('click', function () {
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                const newTheme = isDark ? 'light' : 'dark';
                
                // Cambiamos el atributo en el HTML
                if (newTheme === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.removeAttribute('data-theme');
                }
                
                // Guardamos en tu memoria
                localStorage.setItem(KEY, newTheme);
                
                // Cambiamos el icono del botón
                btn.innerHTML = newTheme === 'dark' ? '&#9728;' : '&#9790;';
            });
        }
    });
})();