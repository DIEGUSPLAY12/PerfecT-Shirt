// js/index.js

const API_URL = 'http://127.0.0.1:8000/api/importar-camisetas';

const WANTED_TEAMS = [
    "Real Madrid", 
    "Barcelona", 
    "Manchester City", 
    "Arsenal",
    "Paris SG",
    "Bayern Munich"
];

// Guardamos los datos globales para poder sacar recomendaciones aleatorias
let GLOBAL_TEAMS = [];

document.addEventListener('DOMContentLoaded', async () => {
    fetchNoticias();
    const grid = document.getElementById('top-sales-grid');
    if (!grid) return;

    if (typeof DATOS_LOCALES !== 'undefined' && DATOS_LOCALES.length > 0) {
        GLOBAL_TEAMS = DATOS_LOCALES;
        renderTopSales(DATOS_LOCALES, grid);
    } else {
        grid.innerHTML = '<p class="text-center w-100" style="color: #888;">Cargando ofertas...</p>';
    }

    try {
        const res = await fetch(API_URL);
        if (res.ok) {
            const data = await res.json();
            const apiTeams = data.data || [];
            if (apiTeams.length > 0) {
                GLOBAL_TEAMS = apiTeams;
                renderTopSales(apiTeams, grid); 
            }
        }
    } catch (error) {
        console.warn("⚠️ API no disponible, seguimos con local.");
        if (!grid.innerHTML.includes('card')) {
            grid.innerHTML = '<p class="text-center w-100" style="color: red;">No se pudieron cargar las ofertas.</p>';
        }
    }
});

// --- RENDERIZADO COMÚN ---
function renderTopSales(teamsList, container) {
    let topTeams = teamsList.filter(t => WANTED_TEAMS.includes(t.nombre_equipo));

    if (topTeams.length < 4) {
        const others = teamsList.filter(t => !WANTED_TEAMS.includes(t.nombre_equipo));
        topTeams = topTeams.concat(others).slice(0, 4);
    } else {
        topTeams = topTeams.slice(0, 4);
    }

    container.innerHTML = ''; 

    topTeams.forEach(team => {
        const safeName = team.nombre_equipo.replace(/'/g, "\\'");
        const imgUrl = team.url_camiseta || team.escudo || 'https://placehold.co/300x300?text=Top+Venta';
        const safeImg = imgUrl.replace(/'/g, "\\'");
        const convertedPrice = convertPrice(team.precio);
        const currencySymbol = getCurrencySymbol();

        container.innerHTML += `
            <div class="card animate-in">
                <div class="wf-img" onclick="openQV('${safeName}', ${team.precio}, '${safeImg}')" style="height:250px; background: #fff; display:flex; align-items:center; justify-content:center; position:relative; border-bottom:1px solid #eee; cursor:pointer;">
                    <img src="${imgUrl}" alt="${team.nombre_equipo}" style="max-height:85%; max-width:85%; object-fit:contain;">
                </div>
                
                <div style="padding: 20px">
                    <h4 style="margin-bottom: 5px;">${team.nombre_equipo}</h4>
                    <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom: 15px;">Camiseta Oficial 2025</p>
                    
                    <div class="flex-between">
                        <span class="bold" style="color:var(--primary); font-size:1.2rem;">${convertedPrice.toFixed(2)} ${currencySymbol}</span>
                        
                        <div class="flex-center" style="gap: 5px">
                            <button class="btn btn-primary btn-sm" 
                                onclick="openQV('${safeName}', ${team.precio}, '${safeImg}')"
                                title="Seleccionar talla y añadir">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                            
                            <button class="btn btn-outline btn-sm" 
                                onclick="toggleFavorite('${safeName}', ${team.precio}, '${safeImg}', this)"
                                title="Añadir a favoritos">
                                <i class="fa-regular fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

// =========================================
// LÓGICA DE VISTA RÁPIDA, TALLAS Y RECOMENDADOS
// =========================================
let currentSelectedSize = null;

window.selectSize = function(btn, size) {
    currentSelectedSize = size;
    // Quitamos la clase active de todos los botones y se la ponemos al clicado
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Ocultamos el mensaje de error si existía
    document.getElementById('qv-size-error').style.display = 'none';
};

function openQV(name, price, img) {
    const modal = document.getElementById('qv-modal');
    
    // Reseteamos talla al abrir
    currentSelectedSize = null;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('qv-size-error').style.display = 'none';

    // Inyectamos los datos principales
    document.getElementById('qv-img').src = img;
    document.getElementById('qv-name').innerText = name;
    const convertedPrice = convertPrice(price);
    const currencySymbol = getCurrencySymbol();
    document.getElementById('qv-price').innerText = convertedPrice.toFixed(2) + " " + currencySymbol;
    
    // Generar recomendaciones aleatorias excluyendo la camiseta actual
    const recContainer = document.getElementById('qv-rec-container');
    recContainer.innerHTML = '';
    
    let recommendations = GLOBAL_TEAMS.filter(t => WANTED_TEAMS.includes(t.nombre_equipo) && t.nombre_equipo !== name);
    // Cogemos 3 aleatorios
    recommendations.slice(0, 3).forEach(rec => {
        const recImg = rec.url_camiseta || rec.escudo || 'https://placehold.co/100x100?text=Rec';
        const recNameSafe = rec.nombre_equipo.replace(/'/g, "\\'");
        const recImgSafe = recImg.replace(/'/g, "\\'");
        const recPrice = rec.precio || 0;
        
        // Al pulsar en un recomendado, se abre directamente su propia ventana
        recContainer.innerHTML += `
            <div class="qv-rec-item" onclick="openQV('${recNameSafe}', ${recPrice}, '${recImgSafe}')">
                <img src="${recImg}" alt="${rec.nombre_equipo}">
                <p>${rec.nombre_equipo}</p>
            </div>
        `;
    });
    
    // Configuración de botones con control de talla
    const btnCart = document.getElementById('qv-add-cart');
    const btnFav = document.getElementById('qv-add-fav');
    
    btnCart.onclick = function() {
        if (!currentSelectedSize) {
            document.getElementById('qv-size-error').style.display = 'inline';
            return; 
        }
        // Juntamos el nombre con la talla para el carrito
        const nameWithSize = name + " (Talla " + currentSelectedSize + ")";
        if (typeof addToCart === 'function') addToCart(nameWithSize, price, img);
        closeQV();
    };
    
    btnFav.onclick = function() {
        if (typeof toggleFavorite === 'function') toggleFavorite(name, price, img, this);
        closeQV();
    };
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeQV(event) {
    if (event) event.stopPropagation();
    document.getElementById('qv-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// =========================================
// LÓGICA DE NOTICIAS DE FÚTBOL (GNews)
// =========================================
async function fetchNoticias() {
    const grid = document.getElementById('news-grid');
    if (!grid) return;

    try {
        const res = await fetch('http://127.0.0.1:8000/api/noticias-futbol');
        if (res.ok) {
            const data = await res.json();
            const noticias = data.data || [];

            if (noticias.length > 0) {
                grid.innerHTML = '';
                noticias.forEach(noticia => {
                    // Formateamos la fecha
                    const date = new Date(noticia.publishedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
                    
                    grid.innerHTML += `
                        <div class="card" style="display: flex; flex-direction: column; overflow: hidden; cursor: pointer; transition: 0.3s; box-shadow: var(--shadow-sm);" onclick="window.open('${noticia.url}', '_blank')" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='var(--shadow-hover)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)';">
                            <div style="height: 200px; overflow: hidden;">
                                <img src="${noticia.image}" alt="Noticia" style="width: 100%; height: 100%; object-fit: cover; transition: 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            </div>
                            <div style="padding: 25px; display: flex; flex-direction: column; flex: 1; background: var(--white);">
                                <small style="color: var(--primary); font-weight: bold; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; font-size: 0.75rem;">${date} • ${noticia.source.name}</small>
                                <h4 style="margin-bottom: 12px; font-size: 1.15rem; color: var(--primary-dark); line-height: 1.4;">${noticia.title}</h4>
                                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px; flex: 1; line-height: 1.6;">${noticia.description.substring(0, 110)}...</p>
                                <span style="color: var(--secondary); font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;">Leer artículo <i class="fa-solid fa-arrow-right"></i></span>
                            </div>
                        </div>
                    `;
                });
            } else {
                grid.innerHTML = '<p class="text-center w-100" style="color: #888;">No hay noticias disponibles ahora mismo.</p>';
            }
        }
    } catch (error) {
        console.warn("Error cargando noticias:", error);
        grid.innerHTML = '<p class="text-center w-100" style="color: var(--error);">Servicio de noticias temporalmente no disponible.</p>';
    }
}