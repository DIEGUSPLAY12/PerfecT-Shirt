// js/shop.js

let allProducts = [];
let currentFilteredProducts = [];
let currentPage = 1;
const itemsPerPage = 9; // Configurado para 3 filas de 3
const API_URL = 'http://127.0.0.1:8000/api/importar-camisetas';
let selectedLeagues = [];

const LEAGUES = {
    'Premier League': 'English Premier League',
    'La Liga': 'Spanish La Liga',
    'Serie A': 'Italian Serie A',
    'Bundesliga': 'German Bundesliga',
    'Ligue 1': 'French Ligue 1'
};

document.addEventListener('DOMContentLoaded', async () => {
    initLeagueDropdown();
    applyURLPresets();
    
    let isDataLoaded = false;

    // Pruebo primero con datos locales
    if (typeof DATOS_LOCALES !== 'undefined' && DATOS_LOCALES.length > 0) {
        processData(DATOS_LOCALES);
        isDataLoaded = true;
    }

    // El servidor (Laravel) es quien trae los datos y dice quién está en oferta para TODOS por igual
    try {
        const res = await fetch(API_URL);
        if (res.ok) {
            const data = await res.json();
            const apiTeams = data.data || [];
            if (apiTeams.length > 0) {
                processData(apiTeams); 
                isDataLoaded = true;
            }
        }
    } catch (error) {
        console.warn("⚠️ API no disponible. Asegúrate de tener el backend encendido.");
    }

    if (!isDataLoaded) {
        document.getElementById('results-count').innerText = '0 Productos';
        document.getElementById('product-grid').innerHTML = '';
        document.getElementById('no-results').style.display = 'block';
        document.getElementById('no-results-title').innerText = 'Error de conexión';
        document.getElementById('no-results-desc').innerText = 'No hemos podido cargar los productos. Asegúrate de que el servidor esté encendido o de tener datos locales.';
    }
});

window.toggleAccordion = function(element) {
    const content = element.nextElementSibling;
    const icon = element.querySelector('i');
    
    if (content.classList.contains('open')) {
        content.classList.remove('open');
        icon.style.transform = 'rotate(180deg)';
    } else {
        content.classList.add('open');
        icon.style.transform = 'rotate(0deg)';
    }
};

function normalizeParamValue(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\+/g, ' ')
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ');
}

function parseBooleanParam(value) {
    const normalized = normalizeParamValue(value);
    return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'si' || normalized === 'sí';
}

function leagueParamToLeagueLong(leagueValue) {
    const normalized = normalizeParamValue(leagueValue);
    if (!normalized) return null;

    for (const [shortName, longName] of Object.entries(LEAGUES)) {
        if (normalizeParamValue(shortName) === normalized) return longName;
        if (normalizeParamValue(longName) === normalized) return longName;
    }

    // Algunos aliases comunes
    if (normalized === 'premier' || normalized === 'premier league') return LEAGUES['Premier League'];
    if (normalized === 'laliga' || normalized === 'la liga') return LEAGUES['La Liga'];
    if (normalized === 'seriea' || normalized === 'serie a') return LEAGUES['Serie A'];
    if (normalized === 'bundesliga') return LEAGUES['Bundesliga'];
    if (normalized === 'ligue1' || normalized === 'ligue 1') return LEAGUES['Ligue 1'];

    return null;
}

function applyURLPresets() {
    const params = new URLSearchParams(window.location.search);
    if ([...params.keys()].length === 0) return;

    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const maxPriceRange = document.getElementById('price-range');
    const priceVal = document.getElementById('price-val');
    const saleToggle = document.getElementById('sale-toggle');

    const searchValue = params.get('search') || params.get('q');
    if (searchInput && typeof searchValue === 'string' && searchValue.trim()) {
        searchInput.value = searchValue.trim();
    }

    const sortValue = params.get('sort');
    if (sortSelect && sortValue) {
        const allowed = new Set(['default', 'asc', 'desc']);
        if (allowed.has(sortValue)) sortSelect.value = sortValue;
    }

    const maxPriceValue = params.get('maxPrice') || params.get('maxprice') || params.get('price');
    if (maxPriceRange && maxPriceValue) {
        const parsed = Number(maxPriceValue);
        if (Number.isFinite(parsed) && parsed > 0) {
            const min = Number(maxPriceRange.min || 0);
            const max = Number(maxPriceRange.max || parsed);
            const clamped = Math.min(Math.max(parsed, min), max);
            maxPriceRange.value = String(clamped);
            if (priceVal) priceVal.innerText = `${clamped}${getCurrencySymbol()}`;
        }
    }

    const saleValue = params.get('sale') || params.get('offers') || params.get('ofertas');
    if (saleToggle && saleValue !== null) {
        saleToggle.checked = parseBooleanParam(saleValue);
    }

    // league=La%20Liga&league=Premier%20League o league=La%20Liga,Premier%20League
    const leagueValues = params.getAll('league').flatMap(v => String(v || '').split(','));
    const desiredLongs = leagueValues
        .map(leagueParamToLeagueLong)
        .filter(Boolean);

    if (desiredLongs.length > 0) {
        const uniqueLongs = Array.from(new Set(desiredLongs));
        uniqueLongs.forEach(longName => {
            const cb = document.querySelector(`.custom-checkbox input[value="${longName}"]`);
            if (cb && !cb.checked) {
                cb.checked = true;
                selectedLeagues.push({ long: longName, short: cb.dataset.short || longName });
            }
        });

        selectedLeagues = selectedLeagues.filter((v, i, arr) =>
            arr.findIndex(x => x.long === v.long) === i
        );
    }
}

function initLeagueDropdown() {
    const container = document.getElementById('league-checkboxes');
    const leagues = LEAGUES;
    
    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'mt-10';
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '10px';
    
    for (const [short, long] of Object.entries(leagues)) {
        const label = document.createElement('label');
        label.className = 'custom-checkbox';
        label.innerHTML = `
            <input type="checkbox" value="${long}" data-short="${short}" onchange="updateLeagueSelection(this)">
            <span class="checkmark"></span>
            <span class="label-text">${short}</span>
        `;
        wrap.appendChild(label);
    }
    container.appendChild(wrap);
}

window.updateLeagueSelection = function(cb) {
    if(cb.checked) {
        selectedLeagues.push({ long: cb.value, short: cb.dataset.short });
    } else {
        selectedLeagues = selectedLeagues.filter(l => l.long !== cb.value);
    }
    applyFilters();
}

function processData(rawData) {
    // Ya no inventamos ofertas en el frontend. Confiamos ciegamente en el backend.
    allProducts = rawData.map(t => ({
        name: t.nombre_equipo, 
        team: t.nombre_equipo,
        price: parseFloat(t.precio),
        originalPrice: t.precio_original ? parseFloat(t.precio_original) : parseFloat(t.precio),
        // Leemos la oferta global que nos manda el servidor
        isSale: (t.en_oferta === true || t.en_oferta === 'true' || t.en_oferta === 1),
        league: t.liga,
        safeName: t.nombre_equipo.replace(/'/g, "\\'"),
        img: t.url_camiseta || t.escudo || 'https://placehold.co/400x400?text=No+Image',
        safeImg: (t.url_camiseta || t.escudo || '').replace(/'/g, "\\'")
    }));

    allProducts = Array.from(new Set(allProducts.map(a => a.name))).map(name => {
        return allProducts.find(a => a.name === name)
    });

    allProducts.sort(() => Math.random() - 0.5);
    applyFilters();
}

function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const sortValue = document.getElementById('sort-select').value;
    const maxPrice = parseFloat(document.getElementById('price-range').value);
    const saleOnly = document.getElementById('sale-toggle').checked;

    currentFilteredProducts = allProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm);
        const matchesLeague = selectedLeagues.length === 0 || selectedLeagues.some(l => l.long === p.league);
        const matchesPrice = p.price <= maxPrice;
        
        const matchesSale = !saleOnly || p.isSale; 
        
        return matchesSearch && matchesLeague && matchesPrice && matchesSale;
    });

    if (sortValue === 'asc') currentFilteredProducts.sort((a, b) => a.price - b.price);
    if (sortValue === 'desc') currentFilteredProducts.sort((a, b) => b.price - a.price);

    currentPage = 1;
    
    const countEl = document.getElementById('results-count');
    if(countEl) countEl.innerText = `${currentFilteredProducts.length} Productos`;
    
    renderActiveFilters(searchTerm, maxPrice, saleOnly);
    renderShop();
}

function renderActiveFilters(searchTerm, maxPrice, saleOnly) {
    const container = document.getElementById('active-filters-container');
    container.innerHTML = '';
    let hasFilters = false;

    if (searchTerm) {
        hasFilters = true;
        container.innerHTML += `<div class="active-filter-chip">"${searchTerm}" <i class="fa-solid fa-xmark" onclick="removeFilter('search')"></i></div>`;
    }
    if (maxPrice < 150) {
        hasFilters = true;
        container.innerHTML += `<div class="active-filter-chip">Hasta ${maxPrice}€ <i class="fa-solid fa-xmark" onclick="removeFilter('price')"></i></div>`;
    }
    if (saleOnly) {
        hasFilters = true;
        container.innerHTML += `<div class="active-filter-chip">Ofertas <i class="fa-solid fa-xmark" onclick="removeFilter('sale')"></i></div>`;
    }
    
    selectedLeagues.forEach(league => {
        hasFilters = true;
        container.innerHTML += `<div class="active-filter-chip">${league.short} <i class="fa-solid fa-xmark" onclick="removeFilter('league', '${league.long}')"></i></div>`;
    });
    
    if (hasFilters) {
        container.innerHTML += `<div class="clear-all-filters" onclick="resetFilters()">Limpiar todo</div>`;
    }
}

window.removeFilter = function(type, value = null) {
    if (type === 'search') document.getElementById('search-input').value = '';
    else if (type === 'price') {
        document.getElementById('price-range').value = 150;
        document.getElementById('price-val').innerText = '150' + getCurrencySymbol();
    } else if (type === 'sale') document.getElementById('sale-toggle').checked = false;
    else if (type === 'league') {
        selectedLeagues = selectedLeagues.filter(l => l.long !== value);
        const cb = document.querySelector(`.custom-checkbox input[value="${value}"]`);
        if(cb) cb.checked = false;
    }
    applyFilters();
}

window.resetFilters = function() {
    document.getElementById('search-input').value = '';
    document.getElementById('sort-select').value = 'default';
    document.getElementById('price-range').value = 150;
    document.getElementById('price-val').innerText = '150' + getCurrencySymbol();
    document.getElementById('sale-toggle').checked = false;
    
    document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('active'));
    
    selectedLeagues = [];
    document.querySelectorAll('.custom-checkbox input').forEach(cb => cb.checked = false);
    
    document.getElementById('no-results-title').innerText = 'No hay resultados';
    document.getElementById('no-results-desc').innerText = 'Prueba a quitar algunos filtros o cambiar el texto de búsqueda.';
    
    applyFilters();
};

function renderShop() {
    const grid = document.getElementById('product-grid');
    const noResults = document.getElementById('no-results');
    
    if(!grid) return;
    grid.innerHTML = '';

    if (currentFilteredProducts.length === 0) {
        if(noResults) noResults.style.display = 'block';
        renderPagination(0);
        return;
    } 
    if(noResults) noResults.style.display = 'none';

    const totalPages = Math.ceil(currentFilteredProducts.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const itemsToShow = currentFilteredProducts.slice(start, end);

    itemsToShow.forEach(p => {
        const isFav = typeof state !== 'undefined' && state.favorites.some(f => f.name === p.name) ? 'active fa-solid' : 'fa-regular';
        
        const saleBadge = p.isSale ? `<span style="position:absolute; top:15px; left:15px; background:var(--error); color:white; font-size:0.75rem; font-weight:800; padding:6px 12px; border-radius:50px; z-index:5; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);">-20% OFERTA</span>` : '';
        
        const convertedOriginalPrice = convertPrice(p.originalPrice);
        const convertedPrice = convertPrice(p.price);
        const currencySymbol = getCurrencySymbol();
        
        const priceHTML = p.isSale 
            ? `<div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; line-height: 1.1;">
                 <span style="text-decoration: line-through; color: var(--text-muted); font-size: 0.85rem; font-weight: 600;">${convertedOriginalPrice.toFixed(2)}${currencySymbol}</span>
                 <span class="bold price" style="color: var(--error); font-size: 1.35rem;">${convertedPrice.toFixed(2)}${currencySymbol}</span>
               </div>`
            : `<span class="bold price" style="color: var(--primary); font-size: 1.35rem;">${convertedPrice.toFixed(2)}${currencySymbol}</span>`;

        grid.innerHTML += `
            <div class="card animate-in">
                <div class="wf-img" onclick="openQV('${p.safeName}', ${p.price}, '${p.safeImg}')" style="height:260px; padding: 30px; cursor:pointer;">
                    ${saleBadge}
                    <img src="${p.img}" alt="${p.name}">
                    
                    <div class="heart-btn ${isFav.includes('active') ? 'active' : ''}" 
                         onclick="event.stopPropagation(); toggleHeart('${p.safeName}', ${p.price}, '${p.safeImg}', this)">
                        <i class="${isFav} fa-heart"></i>
                    </div>
                </div>
                
                <div style="padding: 25px; display: flex; flex-direction: column; flex-grow: 1;">
                    <small class="uppercase bold" style="color: var(--text-muted); font-size: 0.75rem; letter-spacing: 1px; margin-bottom: 8px;">
                        ${p.league}
                    </small>
                    <h4 class="bold" style="font-size: 1.15rem; color: var(--primary-dark); margin: 0 0 15px 0; line-height: 1.3;">
                        ${p.name}
                    </h4>
                    
                    <div class="flex-between" style="margin-top: auto; align-items: center;">
                        ${priceHTML}
                        
                        <button onclick="openQV('${p.safeName}', ${p.price}, '${p.safeImg}')" 
                                style="width: 42px; height: 42px; border-radius: 50%; background: var(--primary); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; box-shadow: 0 4px 10px rgba(21, 59, 107, 0.2);"
                                onmouseover="this.style.transform='scale(1.1)'; this.style.backgroundColor='var(--primary-dark)'"
                                onmouseout="this.style.transform='scale(1)'; this.style.backgroundColor='var(--primary)'"
                                title="Seleccionar talla y añadir">
                            <i class="fa-solid fa-plus" style="font-size: 1.1rem;"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const container = document.getElementById('pagination-controls');
    if(!container) return;
    container.innerHTML = '';
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick = () => { 
            currentPage = i; 
            renderShop(); 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        };
        container.appendChild(btn);
    }
}

function toggleHeart(name, price, img, btn) {
    const icon = btn.querySelector('i');
    if(typeof toggleFavorite === 'function') toggleFavorite(name, price, img);

    if (icon.classList.contains('fa-regular')) {
        icon.classList.replace('fa-regular', 'fa-solid');
        btn.classList.add('active');
    } else {
        icon.classList.replace('fa-solid', 'fa-regular');
        btn.classList.remove('active');
    }
}

// =========================================
// MI LÓGICA DE VISTA RÁPIDA
// =========================================
let currentSelectedSize = null;

window.selectSize = function(btn, size) {
    currentSelectedSize = size;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('qv-size-error').style.display = 'none';
};

function openQV(name, price, img) {
    const modal = document.getElementById('qv-modal');
    
    const product = allProducts.find(p => p.name === name);
    
    currentSelectedSize = null;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('qv-size-error').style.display = 'none';

    document.getElementById('qv-img').src = img;
    document.getElementById('qv-name').innerText = name;
    
    const priceContainer = document.getElementById('qv-price');
    const currencySymbol = getCurrencySymbol();
    
    if (product && product.isSale) {
        const convertedOriginal = convertPrice(product.originalPrice);
        const convertedPrice = convertPrice(product.price);
        priceContainer.innerHTML = `
            <span style="text-decoration: line-through; color: var(--text-muted); font-size: 1.2rem; margin-right: 10px;">${convertedOriginal.toFixed(2)}${currencySymbol}</span>
            <span style="color: var(--error);">${convertedPrice.toFixed(2)} ${currencySymbol}</span>
            <span style="background: var(--error); color: white; font-size: 0.8rem; padding: 3px 8px; border-radius: 5px; vertical-align: middle; margin-left: 10px;">-20%</span>
        `;
    } else {
        const convertedPrice = convertPrice(price);
        priceContainer.innerHTML = `<span style="color: var(--primary);">${convertedPrice.toFixed(2)} ${currencySymbol}</span>`;
    }
    
    const recContainer = document.getElementById('qv-rec-container');
    recContainer.innerHTML = '';
    
    let recommendations = allProducts.filter(p => p.name !== name);
    recommendations.sort(() => Math.random() - 0.5);
    
    recommendations.slice(0, 3).forEach(rec => {
        recContainer.innerHTML += `
            <div class="qv-rec-item" onclick="openQV('${rec.safeName}', ${rec.price}, '${rec.safeImg}')">
                <img src="${rec.img}" alt="${rec.name}">
                <p>${rec.name}</p>
            </div>
        `;
    });
    
    const btnCart = document.getElementById('qv-add-cart');
    const btnFav = document.getElementById('qv-add-fav');
    
    btnCart.onclick = function() {
        if (!currentSelectedSize) {
            document.getElementById('qv-size-error').style.display = 'inline';
            return; 
        }
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