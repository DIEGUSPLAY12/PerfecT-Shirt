// js/currency.js - Sistema de conversión de monedas

// Tasa de cambio EUR a USD (puede actualizarse desde una API si es necesario)
const EXCHANGE_RATE = {
    EUR_TO_USD: 1.10,
    USD_TO_EUR: 0.91
};

// Símbolos de moneda
const CURRENCY_SYMBOLS = {
    EUR: '€',
    USD: '$'
};

// Obtener moneda actual del estado o localStorage
function getCurrentCurrency() {
    if (typeof state !== 'undefined') {
        return state.currency || 'EUR';
    }
    return localStorage.getItem('currency') || 'EUR';
}

// Establecer moneda actual
function setCurrency(currency) {
    if (typeof state !== 'undefined') {
        state.currency = currency;
        saveState();
    }
    localStorage.setItem('currency', currency);
    
    // Sincronizar todos los selectores de moneda de la página
    document.querySelectorAll('select#currency-select, .currency-selector select').forEach(sel => {
        if (sel.value !== currency) {
            sel.value = currency;
        }
    });
    
    // Actualizar todos los precios en la página
    updateAllPrices();
}

// Convertir un precio de EUR a la moneda seleccionada
function convertPrice(priceInEUR, targetCurrency = null) {
    const currency = targetCurrency || getCurrentCurrency();
    const price = typeof priceInEUR === 'string' ? parseFloat(priceInEUR.replace(',', '.')) : priceInEUR;
    
    if (currency === 'USD') {
        return price * EXCHANGE_RATE.EUR_TO_USD;
    }
    return price; // EUR por defecto
}

// Formatear precio con símbolo de moneda
function formatPrice(priceInEUR, targetCurrency = null) {
    const currency = targetCurrency || getCurrentCurrency();
    const convertedPrice = convertPrice(priceInEUR, currency);
    const symbol = CURRENCY_SYMBOLS[currency];
    
    return `${convertedPrice.toFixed(2)}${symbol}`;
}

// Formatear solo el número del precio
function formatPriceNumber(priceInEUR, targetCurrency = null) {
    const currency = targetCurrency || getCurrentCurrency();
    const convertedPrice = convertPrice(priceInEUR, currency);
    
    return convertedPrice.toFixed(2);
}

// Obtener símbolo de moneda
function getCurrencySymbol(currency = null) {
    const curr = currency || getCurrentCurrency();
    return CURRENCY_SYMBOLS[curr];
}

// Actualizar todos los precios en la página
function updateAllPrices() {
    // Actualizar carrito global
    if (typeof renderCart === 'function') {
        renderCart();
    }
    
    // Actualizar favoritos si están abiertos
    const favContainer = document.getElementById('fav-items');
    if (favContainer && favContainer.innerHTML.trim()) {
        if (typeof renderFavorites === 'function') {
            renderFavorites();
        }
    }
    
    // Actualizar tienda (si estamos en shop.html)
    if (typeof renderShop === 'function') {
        renderShop();
    }
    
    // Actualizar top ventas en index.html
    const topSalesGrid = document.getElementById('top-sales-grid');
    if (topSalesGrid && typeof renderTopSales === 'function' && typeof GLOBAL_TEAMS !== 'undefined' && GLOBAL_TEAMS.length > 0) {
        renderTopSales(GLOBAL_TEAMS, topSalesGrid);
    }
    
    // Actualizar subastas en auction.html
    const auctionGrid = document.getElementById('auction-grid');
    if (auctionGrid && typeof renderAuctions === 'function' && typeof AUCTION_DATA !== 'undefined' && AUCTION_DATA.length > 0) {
        renderAuctions(AUCTION_DATA, auctionGrid);
    } else if (auctionGrid && typeof renderFallbackAuctions === 'function' && typeof FALLBACK_AUCTIONS !== 'undefined' && FALLBACK_AUCTIONS.length > 0) {
        renderFallbackAuctions(FALLBACK_AUCTIONS, auctionGrid);
    }
    
    // Actualizar carrito en página de pago
    if (typeof renderCartItems === 'function' && typeof state !== 'undefined') {
        renderCartItems(state.cart);
    }
    if (typeof updateSummaryUI === 'function') {
        updateSummaryUI();
    }
    
    // Actualizar precio en el customizer (product.html)
    if (typeof updatePrice === 'function') {
        updatePrice();
    }
    
    // Actualizar cualquier elemento con clase 'price-display'
    document.querySelectorAll('.price-display').forEach(el => {
        const priceEUR = parseFloat(el.dataset.priceEur);
        if (!isNaN(priceEUR)) {
            el.textContent = formatPrice(priceEUR);
        }
    });
}
