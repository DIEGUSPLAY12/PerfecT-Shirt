// js/random.js

const BOX_PRICE = 34.99;
let isPlaying = false;

// Inyectamos la animación de temblor para la caja sorpresa
const style = document.createElement('style');
style.innerHTML = `
  @keyframes shakeBox {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(-8deg) scale(1.05); }
    50% { transform: rotate(8deg) scale(1.05); }
    75% { transform: rotate(-8deg) scale(1.05); }
  }
`;
document.head.appendChild(style);

// Actualiza el texto de "X ligas seleccionadas"
function updateLeagueCounter() {
    const activeLeagues = document.querySelectorAll('.league-card.active').length;
    const counterText = document.getElementById('league-counter');
    if (counterText) {
        counterText.innerText = `${activeLeagues} liga${activeLeagues !== 1 ? 's' : ''} seleccionada${activeLeagues !== 1 ? 's' : ''}`;
    }
}

// Activa/Desactiva ligas al hacer clic
function toggleLeague(element) {
    if (element.classList.contains('disabled')) return;
    
    element.classList.toggle('active');
    
    // Pequeño efecto visual de pulsación
    element.style.transform = 'scale(0.95)';
    setTimeout(() => element.style.transform = 'scale(1)', 150);

    updateLeagueCounter();
}

// Botones de Todas / Ninguna
function selectAll() {
    document.querySelectorAll('.league-card:not(.disabled)').forEach(card => card.classList.add('active'));
    updateLeagueCounter();
}

function deselectAll() {
    document.querySelectorAll('.league-card:not(.disabled)').forEach(card => card.classList.remove('active'));
    updateLeagueCounter();
}

// Inicializar contador al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    updateLeagueCounter();
});

// Lógica principal: Jugar a la Caja Sorpresa
function playRandom() {
    if (isPlaying) return;

    const activeCards = document.querySelectorAll('.league-card.active');
    if (activeCards.length === 0) {
        alert("¡Debes seleccionar al menos una liga para jugar!");
        return;
    }

    // Obtenemos qué ligas quiere el usuario
    const selectedLeagues = Array.from(activeCards).map(card => card.dataset.league);
    isPlaying = true;

    // Elementos de la UI
    const btnPlay = document.getElementById('btn-play');
    const boxIcon = document.querySelector('#mystery-box i');
    const resultContainer = document.getElementById('result');

    // 1. Estado de carga y suspense
    btnPlay.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> PREPARANDO CAJA...';
    btnPlay.style.opacity = '0.8';
    btnPlay.style.cursor = 'not-allowed';
    
    resultContainer.style.display = 'none'; // Ocultar resultado anterior
    
    // Cambiamos el icono de caja abierta a caja cerrada temblando
    boxIcon.classList.remove('fa-box-open');
    boxIcon.classList.add('fa-box');
    boxIcon.style.animation = 'shakeBox 0.4s ease-in-out infinite';
    boxIcon.style.color = 'var(--secondary)';

    // Simulamos un tiempo de "unboxing" de 2 segundos
    setTimeout(() => {
        // 2. Detener animación y abrir la caja
        boxIcon.style.animation = 'none';
        boxIcon.classList.remove('fa-box');
        boxIcon.classList.add('fa-box-open');
        boxIcon.style.color = 'var(--primary)';
        
        // Efecto de explosión
        boxIcon.style.transform = 'scale(1.2)';
        setTimeout(() => boxIcon.style.transform = 'scale(1)', 300);

        // 3. Obtener camiseta ganadora
        const prize = getRandomShirt(selectedLeagues);

        // 4. Mostrar resultado
        showResult(prize);

        // 5. Restaurar el botón para volver a jugar
        btnPlay.innerHTML = '¡VOLVER A JUGAR!';
        btnPlay.style.opacity = '1';
        btnPlay.style.cursor = 'pointer';
        isPlaying = false;
        
        // Bajar el scroll suavemente para ver el premio si está en móvil
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    }, 2000); 
}

// Función que elige una camiseta al azar de tus datos
function getRandomShirt(allowedLeagues) {
    // Camisetas de reserva por si fallan los datos locales
    let sourceData = [
        { name: "Real Madrid 24/25", league: "Spanish La Liga", img: "https://m.media-amazon.com/images/I/71s+j+j+j+L._AC_SX679_.jpg" },
        { name: "FC Barcelona 24/25", league: "Spanish La Liga", img: "https://m.media-amazon.com/images/I/51p1+J+H+4L._AC_SX679_.jpg" },
        { name: "Man City 24/25", league: "English Premier League", img: "https://m.media-amazon.com/images/I/61j4y+S-iBL._AC_SX679_.jpg" },
        { name: "Arsenal 24/25", league: "English Premier League", img: "https://m.media-amazon.com/images/I/61y+E+J+L._AC_SX679_.jpg" },
        { name: "AC Milan 24/25", league: "Italian Serie A", img: "https://m.media-amazon.com/images/I/51y4jL-Q7sL._AC_SX679_.jpg" },
        { name: "Bayern Munich 24/25", league: "German Bundesliga", img: "https://m.media-amazon.com/images/I/61xXG+8I4cL._AC_SX679_.jpg" },
        { name: "PSG 24/25", league: "French Ligue 1", img: "https://m.media-amazon.com/images/I/51vX7f1-RcL._AC_SX679_.jpg" }
    ];

    // Intentamos usar tu archivo datos_locales.js si está cargado
    if (typeof DATOS_LOCALES !== 'undefined' && DATOS_LOCALES.length > 0) {
        sourceData = DATOS_LOCALES.map(t => ({
            name: t.nombre_equipo,
            league: t.liga,
            img: t.url_camiseta || t.escudo || 'https://placehold.co/400x400?text=No+Image'
        }));
    }

    // Filtramos las camisetas para que solo salgan las de las ligas que eligió el usuario
    const filteredShirts = sourceData.filter(shirt => allowedLeagues.includes(shirt.league));
    
    // Si por algún casual no hubiera camisetas (error de filtrado), usamos el catálogo completo
    const finalPool = filteredShirts.length > 0 ? filteredShirts : sourceData;

    // Elegir aleatoria
    const randomIndex = Math.floor(Math.random() * finalPool.length);
    return finalPool[randomIndex];
}

// Pinta el resultado en pantalla con estilo premium
function showResult(prize) {
    const resultContainer = document.getElementById('result');
    
    // Proteger nombres con comillas simples para la función onClick
    const safeName = prize.name.replace(/'/g, "\\'");
    const safeImg = prize.img.replace(/'/g, "\\'");

    // Aquí es donde ocurría el error si se borraba la comilla `
    resultContainer.innerHTML = `
        <div style="background: var(--bg-body); border-radius: 20px; padding: 25px; border: 1px solid var(--border); position: relative; overflow: hidden; box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);">
            
            <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: radial-gradient(circle, var(--secondary) 0%, transparent 70%); opacity: 0.1; border-radius: 50%;"></div>
            
            <h3 class="bold mb-20" style="color: var(--primary-dark); font-size: 1.2rem;">¡Enhorabuena! Has conseguido:</h3>
            
            <div class="wf-img" style="height: 220px; padding: 20px; background: white; border-radius: 16px; margin-bottom: 20px; box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: center;">
                <img src="${prize.img}" alt="${prize.name}" style="max-height: 100%; max-width: 100%; object-fit: contain; filter: drop-shadow(0 15px 15px rgba(0,0,0,0.1));">
            </div>
            
            <small class="uppercase bold" style="color: var(--text-muted); font-size: 0.75rem; letter-spacing: 1px;">${prize.league}</small>
            <h4 class="bold mt-5 mb-20" style="font-size: 1.4rem; color: var(--primary);">${prize.name}</h4>
            
            <button class="btn btn-primary btn-full" style="font-size: 1.1rem; padding: 15px;" onclick="addRandomToCart('${safeName}', '${safeImg}')">
                <i class="fa-solid fa-cart-shopping"></i> Reclamar por ${convertPrice(BOX_PRICE).toFixed(2)}${getCurrencySymbol()}
            </button>
        </div>
    `;

    resultContainer.style.display = 'block';
}

// Función puente para añadir al carrito general
function addRandomToCart(name, img) {
    if (typeof addToCart === 'function') {
        addToCart(name + " (Mystery Box)", BOX_PRICE, img);
    } else {
        console.error("Error: No se ha cargado app.js correctamente.");
    }
}