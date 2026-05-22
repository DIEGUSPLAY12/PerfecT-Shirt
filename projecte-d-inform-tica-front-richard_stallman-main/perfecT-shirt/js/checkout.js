/* --- CONFIGURACIÓN DE ESTADO --- */
let subtotalReal = 0;
let shippingCost = 1.95;

document.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    initFormInteractions();
    createExpiryPicker();
});

/* --- LEER CARRITO DESDE LOCALSTORAGE --- */
function loadCartFromStorage() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    subtotalReal = cart.reduce((acc, item) => {
        const price = parseFloat(String(item.price).replace(',', '.')) || 0;
        return acc + price;
    }, 0);

    renderCartItems(cart);
    updateSummaryUI();
}

function renderCartItems(cart) {
    const summaryCard = document.querySelector('.summary-card');
    if (!summaryCard) return;

    const existingItems = summaryCard.querySelector('.cart-items-list');
    if (existingItems) existingItems.remove();

    if (cart.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.style.cssText = 'color:#888; font-size:0.9rem; margin-bottom:15px;';
        emptyMsg.textContent = 'Tu carrito está vacío.';
        summaryCard.insertBefore(emptyMsg, summaryCard.querySelector('.summary-row'));
        return;
    }

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'cart-items-list';
    itemsContainer.style.cssText = 'margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px;';
    
    const currencySymbol = getCurrencySymbol ? getCurrencySymbol() : '€';

    cart.forEach(item => {
        const price = parseFloat(String(item.price).replace(',', '.')) || 0;
        const convertedPrice = (typeof convertPrice === 'function') ? convertPrice(price) : price;
        const img = item.img || 'https://placehold.co/50';

        itemsContainer.innerHTML += `
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                <img src="${img}" alt="${item.name}"
                     style="width:52px; height:52px; object-fit:contain; border-radius:8px; border:1px solid #eee; background:#f8f9fa;">
                <div style="flex:1; min-width:0;">
                    <div style="font-weight:600; font-size:0.88rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        ${item.name}
                    </div>
                    <div style="font-size:0.85rem; color:#666; margin-top:2px;">
                        ${convertedPrice.toFixed(2).replace('.', ',')} ${currencySymbol}
                    </div>
                </div>
            </div>
        `;
    });

    summaryCard.insertBefore(itemsContainer, summaryCard.querySelector('.summary-row'));
}

/* --- GESTIÓN DE PRECIOS Y ENVÍO --- */
function updateShipping(cost) {
    shippingCost = cost;
    updateSummaryUI();
}

function updateSummaryUI() {
    const currencySymbol = getCurrencySymbol ? getCurrencySymbol() : '€';
    const convertedSubtotal = (typeof convertPrice === 'function') ? convertPrice(subtotalReal) : subtotalReal;
    const convertedShipping = (typeof convertPrice === 'function') ? convertPrice(shippingCost) : shippingCost;
    const convertedTotal = convertedSubtotal + convertedShipping;

    const subtotalEl = document.getElementById('summary-subtotal');
    if (subtotalEl) subtotalEl.textContent = convertedSubtotal.toFixed(2).replace('.', ',') + ' ' + currencySymbol;

    const shippingEl = document.getElementById('summary-shipping');
    if (shippingEl) shippingEl.textContent = convertedShipping.toFixed(2).replace('.', ',') + ' ' + currencySymbol;

    const totalEl = document.getElementById('summary-total');
    if (totalEl) totalEl.textContent = convertedTotal.toFixed(2).replace('.', ',') + ' ' + currencySymbol;
}

/* --- PICKER DE FECHA DE CADUCIDAD (MES / AÑO) --- */
function createExpiryPicker() {
    const expiryInput = document.getElementById('card-expiry');
    if (!expiryInput) return;

    // Hacer el input de solo lectura y con cursor pointer
    expiryInput.readOnly = true;
    expiryInput.style.cursor = 'pointer';
    expiryInput.placeholder = 'MM/AA';

    // Crear el dropdown del picker
    const picker = document.createElement('div');
    picker.id = 'expiry-picker';
    picker.style.cssText = `
        display: none;
        position: absolute;
        z-index: 1000;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 14px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        padding: 16px;
        width: 260px;
        margin-top: 6px;
    `;

    const now = new Date();
    let selectedMonth = null;
    let selectedYear  = null;
    let currentYear   = now.getFullYear();

    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

    function renderPicker() {
        const twoDigitYear = (y) => String(y).slice(-2);
        picker.innerHTML = `
            <!-- Selector de año -->
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
                <button id="prev-year" style="background:none; border:1px solid #eee; border-radius:8px; width:32px; height:32px; cursor:pointer; font-size:1rem; color:#555; display:flex; align-items:center; justify-content:center;">‹</button>
                <span style="font-weight:700; font-size:0.95rem; color:#153b6b;">${currentYear}</span>
                <button id="next-year" style="background:none; border:1px solid #eee; border-radius:8px; width:32px; height:32px; cursor:pointer; font-size:1rem; color:#555; display:flex; align-items:center; justify-content:center;">›</button>
            </div>
            <!-- Grid de meses -->
            <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:6px;">
                ${months.map((m, i) => {
                    const monthNum = i + 1;
                    const isPast   = currentYear === now.getFullYear() && monthNum < (now.getMonth() + 1);
                    const isSelected = selectedMonth === monthNum && selectedYear === currentYear;
                    return `
                        <button
                            data-month="${monthNum}"
                            style="
                                padding: 8px 4px;
                                border-radius: 8px;
                                border: 1px solid ${isSelected ? '#153b6b' : '#eee'};
                                background: ${isSelected ? '#153b6b' : '#fff'};
                                color: ${isPast ? '#ccc' : isSelected ? '#fff' : '#333'};
                                cursor: ${isPast ? 'not-allowed' : 'pointer'};
                                font-size: 0.8rem;
                                font-weight: ${isSelected ? '700' : '500'};
                                transition: all 0.15s;
                            "
                            ${isPast ? 'disabled' : ''}
                            onmouseover="if(!this.disabled && !${isSelected}) { this.style.background='#f0f4ff'; this.style.borderColor='#153b6b'; }"
                            onmouseout="if(!this.disabled && !${isSelected}) { this.style.background='#fff'; this.style.borderColor='#eee'; }"
                        >${m}</button>
                    `;
                }).join('')}
            </div>
        `;

        // Eventos de año
        picker.querySelector('#prev-year').addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentYear > now.getFullYear()) { currentYear--; renderPicker(); }
        });
        picker.querySelector('#next-year').addEventListener('click', (e) => {
            e.stopPropagation();
            currentYear++;
            renderPicker();
        });

        // Eventos de mes
        picker.querySelectorAll('[data-month]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedMonth = parseInt(btn.dataset.month);
                selectedYear  = currentYear;
                const mm = String(selectedMonth).padStart(2, '0');
                const yy = twoDigitYear(selectedYear);
                expiryInput.value = `${mm}/${yy}`;
                removeErrorState(expiryInput);
                closePicker();
            });
        });
    }

    function openPicker() {
        renderPicker();
        picker.style.display = 'block';
    }
    function closePicker() {
        picker.style.display = 'none';
    }

    // Posicionar el picker relativo al input
    const wrapper = expiryInput.parentElement;
    wrapper.style.position = 'relative';
    wrapper.appendChild(picker);

    expiryInput.addEventListener('click', (e) => {
        e.stopPropagation();
        picker.style.display === 'block' ? closePicker() : openPicker();
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!picker.contains(e.target) && e.target !== expiryInput) {
            closePicker();
        }
    });
}

/* --- LÓGICA DE INTERACCIÓN Y FORMATEO --- */
function initFormInteractions() {
    const cardInput = document.getElementById('card-number');

    // Máscara tarjeta: XXXX XXXX XXXX XXXX
    cardInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        let blocks = val.match(/.{1,4}/g);
        e.target.value = blocks ? blocks.join(' ') : val;
        removeErrorState(e.target);
    });

    // Limpiar errores y restringir números en CP/CVV
    document.querySelectorAll('.input-field').forEach(input => {
        input.addEventListener('input', () => {
            if (input.id === 'cp' || input.id === 'card-cvv') {
                input.value = input.value.replace(/\D/g, '');
            }
            removeErrorState(input);
        });
    });
}

/* --- VALIDACIONES POR PASO --- */
function validateStep1() {
    let isValid = true;
    const fields = {
        nombre:    /^[a-zA-ZÀ-ÿ\s]{3,}$/,
        direccion: /^.{5,}$/,
        cp:        /^\d{5}$/,
        ciudad:    /^[a-zA-ZÀ-ÿ\s]{2,}$/
    };

    for (let id in fields) {
        const input = document.getElementById(id);
        if (!fields[id].test(input.value.trim())) {
            showError(id, "Campo requerido o no válido");
            isValid = false;
        }
    }

    // Validar email si existe el campo
    const emailInput = document.getElementById('email');
    if (emailInput) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            showError('email', 'Introduce un email válido');
            isValid = false;
        }
    }

    if (isValid) goToStep(2);
}

function validateStep2() {
    let isValid = true;
    const card   = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiry = document.getElementById('card-expiry').value;
    const cvv    = document.getElementById('card-cvv').value;

    if (card.length !== 16)                         { showError('card-number', '16 dígitos requeridos'); isValid = false; }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) { showError('card-expiry', 'Selecciona una fecha');  isValid = false; }
    if (cvv.length !== 3)                           { showError('card-cvv', '3 dígitos');                isValid = false; }

    if (isValid) {
        renderReviewData();
        goToStep(3);
    }
}

/* --- UTILIDADES DE NAVEGACIÓN Y UI --- */
function showError(id, message) {
    const input     = document.getElementById(id);
    const errorSpan = document.getElementById('error-' + id);
    if (!input) return;
    input.classList.add('invalid');
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
    }
}

function removeErrorState(input) {
    input.classList.remove('invalid');
    const errorSpan = document.getElementById('error-' + input.id);
    if (errorSpan) errorSpan.style.display = 'none';
}

function renderReviewData() {
    const nombre    = document.getElementById('nombre').value;
    const email     = document.getElementById('email')?.value || '';
    const dir       = document.getElementById('direccion').value;
    const cp        = document.getElementById('cp').value;
    const ciudad    = document.getElementById('ciudad').value;

    document.getElementById('review-text').innerHTML = `
        <strong>${nombre}</strong><br>
        ${email ? `<span style="color:#666;">${email}</span><br>` : ''}
        ${dir}<br>
        ${cp}, ${ciudad}
    `;
}

function goToStep(step) {
    document.querySelectorAll('.step-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById('step' + step).classList.remove('hidden');

    const circles = document.querySelectorAll('.progress-step');
    circles.forEach((c, i) => i < step ? c.classList.add('active') : c.classList.remove('active'));

    document.getElementById('progressBar').style.width = ((step - 1) / (circles.length - 1)) * 100 + '%';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function completarPedido() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    const orderData = {
        number: Math.floor(100000 + Math.random() * 900000),
        nombre: document.getElementById('nombre').value,
        direccion: document.getElementById('direccion').value,
        ciudad: document.getElementById('ciudad').value,
        cp: document.getElementById('cp').value,
        shipping: shippingCost,
        items: JSON.parse(JSON.stringify(cart)), // Copiar profundamente los items
        subtotal: subtotalReal,
        total: subtotalReal + shippingCost,
        date: new Date().toISOString(),
        isExpress: shippingCost >= 3
    };

    // Guardamos el pedido temporal para la página de éxito
    localStorage.setItem('last_order', JSON.stringify(orderData));
    
    // Guardamos el pedido directamente en el historial también (para redundancia)
    const userId = (typeof state !== 'undefined' && state.user && state.user.id) ? state.user.id : 'guest';
    const historyKey = `orders_history_${userId}`;
    const history = JSON.parse(localStorage.getItem(historyKey)) || [];
    
    // Evitar duplicados
    if (!history.some(o => o.number === orderData.number)) {
        history.unshift(orderData);
        localStorage.setItem(historyKey, JSON.stringify(history));
    }

    // Redirigir a página de éxito
    window.location.href = 'success.html';
}