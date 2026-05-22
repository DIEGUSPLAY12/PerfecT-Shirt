// js/auction.js

const AUCTION_API_URL = 'http://127.0.0.1:8000/api/subastas/diarias';
const PUJAR_API_URL = 'http://127.0.0.1:8000/api/subastas';

let AUCTION_DATA = [];
let FALLBACK_AUCTIONS = [];

async function loadAuctions() {
    const grid = document.getElementById('auction-grid');
    if(!grid) return;

    if (grid.innerHTML.trim() === '') {
        grid.innerHTML = '<p class="text-center w-100" style="color:#888; background: var(--white); padding: 40px; border-radius: 16px; box-shadow: var(--shadow-sm);">Cargando subastas exclusivas del día...</p>';
    }

    try {
        const res = await fetch(AUCTION_API_URL);
        if (!res.ok) throw new Error("Error conectando con el servidor");
        
        const responseData = await res.json();
        const auctionItems = responseData.data || [];

        if (auctionItems.length > 0) {
            AUCTION_DATA = auctionItems;
            renderAuctions(auctionItems, grid);
        } else {
            grid.innerHTML = '<p class="text-center w-100" style="color:#888; background: var(--white); padding: 40px; border-radius: 16px; box-shadow: var(--shadow-sm);">No hay subastas activas en este momento.</p>';
        }
    } catch (error) {
        console.error("Error cargando subastas:", error);
        if (typeof DATOS_LOCALES !== 'undefined' && DATOS_LOCALES.length > 0) {
            const localItems = [...DATOS_LOCALES].sort(() => Math.random() - 0.5).slice(0, 4);
            FALLBACK_AUCTIONS = localItems;
            renderFallbackAuctions(localItems, grid);
        } else {
            grid.innerHTML = '<p class="text-center w-100" style="color:var(--error); background: var(--white); padding: 40px; border-radius: 16px; box-shadow: var(--shadow-sm);">Error al cargar las subastas. Servidor no disponible.</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAuctions();
});

function renderAuctions(items, container) {
    container.innerHTML = '';

    items.forEach(item => {
        const idPuja = item.id_puja;
        const currentBidEUR = parseFloat(item.precio_actual);
        const currentBid = convertPrice(currentBidEUR).toFixed(2);
        const currencySymbol = getCurrencySymbol();
        const prod = item.producto;
        const imgUrl = prod.imagen || prod.escudo || 'https://placehold.co/300x300?text=Subasta';
        const teamName = prod.equipo;
        const shirtName = prod.nombre;

        // --- GENERACIÓN DEL HISTORIAL DE PUJAS ---
        let historialHTML = '';
        if (item.historial && item.historial.length > 0) {
            item.historial.forEach((oferta, index) => {
                // Destacamos la primera con un trofeo o medalla
                const isWinner = index === 0;
                const icon = isWinner ? '<i class="fa-solid fa-crown" style="color: gold; margin-right: 5px;"></i>' : '<i class="fa-solid fa-user" style="color: var(--text-muted); margin-right: 5px;"></i>';
                const fontWeight = isWinner ? 'bold' : 'normal';
                const convertedOferta = convertPrice(parseFloat(oferta.cantidad)).toFixed(2);
                
                historialHTML += `
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; padding:6px 0; border-bottom:1px dashed var(--border);">
                        <span style="font-weight: ${fontWeight};">${icon}${oferta.usuario}</span>
                        <span class="bold" style="color:var(--primary-dark);">${convertedOferta}${currencySymbol}</span>
                    </div>`;
            });
        } else {
            historialHTML = '<div style="font-size:0.8rem; color:var(--text-muted); text-align:center; font-style:italic; padding: 10px 0;">¡Sé el primero en pujar!</div>';
        }

        container.innerHTML += `
            <div class="card auction-card animate-in" style="padding: 0;">
                <div class="wf-img" style="height:200px; display:flex; align-items:center; justify-content:center; border-bottom: 1px solid var(--border);">
                    <div class="heart-btn"><i class="fa-regular fa-heart"></i></div>
                    <img src="${imgUrl}" alt="${teamName}" style="max-height:85%; max-width:85%; object-fit:contain;">
                </div>
                
                <div style="padding: 25px; display: flex; flex-direction: column; height: calc(100% - 200px);">
                    <h3 class="bold uppercase text-center" style="font-size:1rem; margin-bottom: 5px; color: var(--primary-dark);">${teamName}</h3>
                    <p class="text-muted text-center" style="font-size:0.8rem; height: 35px; overflow: hidden; margin-bottom: 10px;">${shirtName}</p>
                    
                    <div class="price-evolution text-center" style="margin: 10px 0; background: var(--bg-soft); padding: 12px; border-radius: 12px;">
                        <p class="uppercase" style="font-size:0.7rem; color:var(--text-muted); font-weight: 800; margin-bottom:5px; letter-spacing: 0.5px;">PUJA ACTUAL</p>
                        <b class="price" id="price-display-${idPuja}" style="font-size:1.5rem; color:var(--primary-dark); font-weight: 900;">${currentBid} ${currencySymbol}</b>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 10px 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #eee;">
                        <p style="font-size: 0.7rem; text-transform: uppercase; font-weight: bold; color: var(--text-muted); margin-bottom: 5px; text-align: left;">Últimas ofertas</p>
                        ${historialHTML}
                    </div>
                    
                    <div class="bid-group" style="display:flex; gap:10px; margin-top: auto;">
                        <input type="number" id="bid-input-${idPuja}" class="filter-input" placeholder="Tu oferta..." style="width: 100%; text-align: center; font-weight: bold; padding: 10px;">
                        <button class="btn btn-primary" onclick="placeBid(${idPuja})" style="padding: 10px 20px;">PUJAR</button>
                    </div>
                </div>
            </div>
        `;
    });
}

window.placeBid = async function(idPuja) {
    if (!state.token || !state.user) {
        alert("¡Para hacer una oferta necesitas iniciar sesión primero!");
        if (typeof toggleLogin === 'function') toggleLogin(); 
        return;
    }

    const input = document.getElementById(`bid-input-${idPuja}`);
    const display = document.getElementById(`price-display-${idPuja}`);
    
    if (!input || !display) return;

    const offer = parseFloat(input.value);
    const currentPriceText = display.innerText.replace(/[^0-9.,]/g, '').replace(',', '.');
    const currentPrice = parseFloat(currentPriceText);
    const currencySymbol = typeof getCurrencySymbol === 'function' ? getCurrencySymbol() : '€';

    if (isNaN(offer) || offer <= 0) {
        alert("Introduce una cantidad válida.");
        return;
    }

    if (offer <= currentPrice) {
        alert(`Tu oferta debe ser mayor a ${currentPrice.toFixed(2)}${currencySymbol}`);
        return;
    }

    // Convertimos la oferta a EUR para enviarla al backend
    let offerEUR = offer;
    if (typeof getCurrentCurrency === 'function' && getCurrentCurrency() === 'USD') {
        offerEUR = offer / EXCHANGE_RATE.EUR_TO_USD;
    }

    const btn = input.nextElementSibling;
    const originalText = btn.innerText;
    btn.innerText = "Pujando...";
    btn.disabled = true;

    try {
        const response = await fetch(`${PUJAR_API_URL}/${idPuja}/pujar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${state.token}` 
            },
            body: JSON.stringify({ cantidad: offerEUR })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al procesar la puja.');
        }

        // Si es éxito, vaciamos el input y recargamos para ver el historial nuevo
        input.value = "";
        await loadAuctions();

    } catch (error) {
        alert(error.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
};

function renderFallbackAuctions(items, container) {
    container.innerHTML = '';
    const currencySymbol = typeof getCurrencySymbol === 'function' ? getCurrencySymbol() : '€';
    
    items.forEach(item => {
        const currentBidEUR = parseFloat((Math.random() * (50 - 20) + 20).toFixed(2));
        const convertedBid = typeof convertPrice === 'function' ? convertPrice(currentBidEUR).toFixed(2) : currentBidEUR;
        const imgUrl = item.url_camiseta || item.escudo || 'https://placehold.co/300x300';
        const uniqueId = item.id || Math.floor(Math.random() * 9999);

        container.innerHTML += `
            <div class="card auction-card animate-in" style="padding: 0;">
                <div class="wf-img" style="height:200px; display:flex; align-items:center; justify-content:center; border-bottom: 1px solid var(--border);">
                    <div class="heart-btn"><i class="fa-regular fa-heart"></i></div>
                    <img src="${imgUrl}" style="max-height:85%; max-width:85%; object-fit:contain;" alt="${item.nombre_equipo}">
                </div>
                <div style="padding: 25px; text-align: center;">
                    <h3 class="bold uppercase" style="font-size:1.1rem; color: var(--primary-dark);">${item.nombre_equipo}</h3>
                    <p style="color:var(--error); font-size:0.75rem; font-weight: 600; margin-top: 5px;">(Modo Offline - Demo)</p>
                    <div class="price-evolution" style="margin: 25px 0 0 0; background: var(--bg-soft); padding: 15px; border-radius: 12px;">
                        <b class="price" id="price-display-${uniqueId}" style="font-size:1.6rem; color:var(--primary-dark); font-weight: 900;">${convertedBid} ${currencySymbol}</b>
                    </div>
                </div>
            </div>
        `;
    });
}