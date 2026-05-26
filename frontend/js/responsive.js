// Global mobile navigation controller.
(function () {
  function createMobileNav() {
    var header = document.querySelector('.main-header');
    if (!header) return;

    var container = header.querySelector('.container');
    var nav = header.querySelector('.nav-links');
    if (!container || !nav) return;

    if (header.querySelector('.mobile-nav-toggle')) return;

    // 1. Crear botón hamburguesa
    var toggle = document.createElement('button');
    toggle.className = 'mobile-nav-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Abrir menu de navegacion');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'mobile-nav-drawer');
    toggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';

    // 2. Crear overlay oscuro
    var overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    overlay.setAttribute('data-mobile-nav-close', 'true');

    // 3. Crear el drawer (menú lateral)
    var drawer = document.createElement('nav');
    drawer.id = 'mobile-nav-drawer';
    drawer.className = 'mobile-nav-drawer';
    drawer.setAttribute('aria-label', 'Menu movil principal');

    // 4. Contenedor para teletransportar los iconos (Campana, Corazón, Carrito, Moneda...)
    var mobileIconsContainer = document.createElement('div');
    mobileIconsContainer.className = 'mobile-icons-container';
    drawer.appendChild(mobileIconsContainer);

    // 5. Clonar los enlaces de texto (Inicio, Catálogo, etc.)
    var navLinks = nav.querySelectorAll('a');
    navLinks.forEach(function (link) {
      drawer.appendChild(link.cloneNode(true));
    });

    // Añadir al DOM
    container.appendChild(toggle);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    // Funciones de abrir/cerrar menú
    function closeNav() {
      document.body.classList.remove('mobile-nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    }

    function openNav() {
      document.body.classList.add('mobile-nav-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    }

    toggle.addEventListener('click', function () {
      if (document.body.classList.contains('mobile-nav-open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    overlay.addEventListener('click', closeNav);

    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') closeNav();
    });


    // --- 6. MAGIA: TELETRANSPORTACIÓN DE ICONOS ---
    var headerActions = header.querySelector('.header-actions');
    
    function relocateIcons() {
      if (!headerActions) return;
      
      // Seleccionamos todos los iconos que queremos mover
      var iconsToMove = headerActions.querySelectorAll('.icon-btn, .currency-selector, .gtranslate_wrapper, #dark-mode-toggle');
      var iconsInMobile = mobileIconsContainer.querySelectorAll('.icon-btn, .currency-selector, .gtranslate_wrapper, #dark-mode-toggle');

      if (window.innerWidth <= 1024) {
        // MODO MÓVIL/TABLET: Movemos los iconos originales al menú lateral
        iconsToMove.forEach(function(icon) {
          // Hacemos que al tocar un icono (ej: carrito), se cierre el menú hamburguesa
          icon.addEventListener('click', closeNav);
          mobileIconsContainer.appendChild(icon);
        });
      } else {
        // MODO ESCRITORIO: Devolvemos los iconos a la cabecera
        closeNav(); // Por si el usuario agranda la ventana con el menú abierto
        
        // Buscamos tu botón de usuario/login para poner los iconos justo a su izquierda
        var referenceNode = Array.from(headerActions.children).find(function(el) {
          return !el.classList.contains('icon-btn') && 
                 !el.classList.contains('currency-selector') && 
                 !el.classList.contains('gtranslate_wrapper') && 
                 el.id !== 'dark-mode-toggle';
        });

        iconsInMobile.forEach(function(icon) {
          icon.removeEventListener('click', closeNav); // Limpiamos el evento de cierre
          if (referenceNode) {
            headerActions.insertBefore(icon, referenceNode);
          } else {
            headerActions.appendChild(icon);
          }
        });
      }
    }

    // Ejecutar al cargar y al redimensionar la pantalla
    window.addEventListener('resize', relocateIcons);
    relocateIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createMobileNav);
  } else {
    createMobileNav();
  }
})();