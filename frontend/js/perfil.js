const STORAGE_URL = 'http://127.0.0.1:8000/';
 
document.addEventListener('DOMContentLoaded', () => {
    if (!state.user || !state.token) {
        window.location.href = '../index.html';
        return;
    }
 
    // ── Rellenar formulario de datos ──────────────────────────────────────
    document.getElementById('prof-name').value      = state.user.name      || '';
    document.getElementById('prof-apellidos').value = state.user.apellidos || '';
 
    if (state.user.fecha_nacimiento) {
        const dateOnly = state.user.fecha_nacimiento.split('T')[0];
        document.getElementById('prof-fecha').value = dateOnly;
    }
 
    document.getElementById('prof-email').value = state.user.email || '';
 
    // Cargar avatar actual
    const avatarPreview = document.getElementById('avatar-preview');
    if (state.user.avatar) {
        avatarPreview.src = state.user.avatar.startsWith('http')
            ? state.user.avatar
            : `http://127.0.0.1:8000/${state.user.avatar}`;
    }
 
    // Preview nueva imagen antes de guardar
    document.getElementById('prof-avatar').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                document.getElementById('avatar-preview').src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
 
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
 
    // ── Listeners de pestañas ─────────────────────────────────────────────
    document.querySelectorAll('.legal-link[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
 
    // ── Inicializar historial de pedidos ─────────────────────────────────
    saveCurrentOrderToHistory();
    renderOrders();
 
    // Si la URL tiene #pedidos, ir directamente a esa pestaña
    if (window.location.hash === '#pedidos') {
        switchTab('pedidos');
    }
});
 
// ============================================================
// SISTEMA DE PESTAÑAS
// ============================================================
function switchTab(tab) {
    // Ocultar todas las secciones
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    // Desactivar todos los botones
    document.querySelectorAll('.legal-link').forEach(b => b.classList.remove('active'));
 
    // Activar la pestaña elegida
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('tab-btn-' + tab).classList.add('active');
}
 
// ============================================================
// HISTORIAL DE PEDIDOS
// ============================================================
 
/**
 * Lee last_order del localStorage (guardado por checkout.js)
 * y lo añade al historial si no está ya guardado.
 */
function saveCurrentOrderToHistory() {
    const lastOrder = JSON.parse(localStorage.getItem('last_order')) || null;

    // Si no hay pedido reciente, no hacemos nada
    if (!lastOrder || !lastOrder.number) return;

    const userId = state.user?.id || 'guest';
    const historyKey = `orders_history_${userId}`;
    const history = JSON.parse(localStorage.getItem(historyKey)) || [];

    // Evitar duplicados
    if (history.some(o => o.number === lastOrder.number)) {
        // Pedido ya existe, solo limpiamos
        localStorage.removeItem('last_order');
        localStorage.removeItem('cart');
        return;
    }

    // El pedido ya tiene toda la info necesaria desde checkout.js
    const newOrder = {
        number: lastOrder.number,
        date: lastOrder.date || new Date().toISOString(),
        items: lastOrder.items || [], 
        subtotal: lastOrder.subtotal || 0,
        shipping: lastOrder.shipping || 0,
        total: lastOrder.total || 0,
        isExpress: lastOrder.isExpress || false,
        nombre: lastOrder.nombre || '',
        direccion: lastOrder.direccion || '',
        ciudad: lastOrder.ciudad || '',
        cp: lastOrder.cp || '',
    };

    // Agregar el nuevo pedido al inicio del historial
    history.unshift(newOrder); 
    localStorage.setItem(historyKey, JSON.stringify(history));

    // Limpiar datos temporales después de guardar
    localStorage.removeItem('last_order');
    localStorage.removeItem('cart');
    
    // Actualizar el estado global para que el icono del carrito en el header baje a 0
    if (typeof state !== 'undefined') {
        state.cart = [];
        if (typeof saveState === 'function') saveState();
    }
    if (typeof updateCartUI === 'function') {
        updateCartUI(); 
    }
    
    console.log('✅ Pedido #' + newOrder.number + ' agregado al historial');
}
 
/**
 * Pinta todas las tarjetas de pedido en #orders-list
 */
function renderOrders() {
    const userId     = state.user?.id || 'guest';
    const historyKey = `orders_history_${userId}`;
    const history    = JSON.parse(localStorage.getItem(historyKey)) || [];
 
    // Actualizar badge del sidebar
    const badge = document.getElementById('orders-count-badge');
    if (history.length > 0) {
        badge.textContent = history.length;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
 
    const container = document.getElementById('orders-list');
    if (!container) return;
 
    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty-orders">
                <i class="fa-solid fa-box-open"></i>
                <p><strong>Aún no tienes pedidos</strong></p>
                <small>Cuando realices una compra, aparecerá aquí.</small>
                <br><br>
                <a href="shop.html" class="btn btn-primary" style="margin-top: 10px;">
                    <i class="fa-solid fa-bag-shopping"></i> Ir al catálogo
                </a>
            </div>`;
        return;
    }
 
    container.innerHTML = history.map(order => buildOrderCard(order)).join('');
}
 
/**
 * Genera el HTML de una tarjeta de pedido
 */
function buildOrderCard(order) {
    const dateObj = new Date(order.date);
    const dateStr = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const shippingLabel = order.isExpress
        ? '<i class="fa-solid fa-bolt"></i> Express'
        : '<i class="fa-solid fa-box"></i> Estándar';

    // Listado de productos del pedido
    const itemsHTML = order.items.map(item => {
        const price = parseFloat(String(item.price).replace(',', '.')) || 0;
        
        // Lógica de imagen: si es relativa, le pegamos la URL del servidor
        let imgSrc = item.img || 'https://placehold.co/52x52/e2e8f0/1e293b?text=?';
        if (imgSrc && !imgSrc.startsWith('http')) {
            imgSrc = `${STORAGE_URL}${imgSrc}`;
        }

        return `
            <div class="order-product-row">
                <img src="${imgSrc}" alt="${item.name}">
                <span class="order-product-name">${item.name}</span>
                <span class="order-product-price">${price.toFixed(2).replace('.', ',')} €</span>
            </div>`;
    }).join('');

    // Dirección de entrega formateada
    const addressHTML = `
        <div class="order-delivery-info">
            <i class="fa-solid fa-location-dot"></i>
            <span>
                <strong>${order.nombre || 'Usuario'}</strong><br>
                ${order.direccion || 'Sin dirección'}, ${order.ciudad || ''} ${order.cp || ''}
            </span>
        </div>`;

    return `
        <div class="order-card">
            <div class="order-card-header">
                <div>
                    <div class="order-num">Pedido #${order.number}</div>
                    <div class="order-date">
                        <i class="fa-regular fa-calendar"></i>
                        ${dateStr} · ${timeStr}
                    </div>
                </div>
                <div class="order-status-badge">
                    <i class="fa-solid fa-circle-check"></i> Completado
                </div>
            </div>

            <div class="order-card-body">
                ${itemsHTML}
            </div>

            <div class="order-card-footer">
                <div style="flex: 1;">
                    <div class="order-total-label" style="margin-bottom: 5px;">
                        ${shippingLabel} · ${order.items.length} ${order.items.length === 1 ? 'artículo' : 'artículos'}
                    </div>
                    ${addressHTML}
                </div>
                <div style="text-align: right; min-width: 100px;">
                    <div class="order-total-label">Total pagado</div>
                    <div class="order-total-amount">${parseFloat(order.total).toFixed(2).replace('.', ',')} €</div>
                </div>
            </div>
        </div>`;
}
 
// ============================================================
// ACTUALIZACIÓN DE PERFIL (sin cambios respecto al original)
// ============================================================
async function handleProfileUpdate(e) {
    e.preventDefault();
 
    const btn    = document.getElementById('prof-submit-btn');
    const msgBox = document.getElementById('prof-msg');
 
    const formData = new FormData();
    formData.append('name',             document.getElementById('prof-name').value);
    formData.append('apellidos',        document.getElementById('prof-apellidos').value);
    formData.append('fecha_nacimiento', document.getElementById('prof-fecha').value);
    formData.append('email',            document.getElementById('prof-email').value);
    formData.append('_method', 'PUT');
 
    const password        = document.getElementById('prof-pass').value;
    const confirmPassword = document.getElementById('prof-pass-confirm').value;
 
    if (password) {
        if (password !== confirmPassword) {
            showMessage('Las contraseñas no coinciden', 'error');
            return;
        }
        formData.append('password',              password);
        formData.append('password_confirmation', confirmPassword);
    }
 
    const avatarFile = document.getElementById('prof-avatar').files[0];
    if (avatarFile) {
        formData.append('avatar', avatarFile);
    }
 
    btn.disabled    = true;
    btn.innerText   = 'Guardando...';
    msgBox.style.display = 'none';
 
    try {
        const response = await fetch(`${API_BASE}/perfil`, {
            method: 'POST',
            headers: {
                'Accept':        'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: formData
        });
 
        const data = await response.json();
 
        if (!response.ok) {
            if (data.errors) {
                const firstError = Object.values(data.errors)[0][0];
                throw new Error(firstError);
            }
            throw new Error(data.message || 'Error al actualizar el perfil');
        }
 
        state.user = data.user;
        saveState();
        checkAuthStatus();
 
        document.getElementById('prof-pass').value         = '';
        document.getElementById('prof-pass-confirm').value = '';
 
        showMessage(data.message, 'success');
 
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        btn.disabled  = false;
        btn.innerText = 'Guardar Cambios';
    }
}
 
function showMessage(text, type) {
    const msgBox = document.getElementById('prof-msg');
    msgBox.innerText       = text;
    msgBox.style.display   = 'block';
 
    if (type === 'success') {
        msgBox.style.backgroundColor = '#ecfdf5';
        msgBox.style.color           = '#10b981';
        msgBox.style.border          = '1px solid #a7f3d0';
    } else {
        msgBox.style.backgroundColor = '#fef2f2';
        msgBox.style.color           = '#ef4444';
        msgBox.style.border          = '1px solid #fecaca';
    }
}