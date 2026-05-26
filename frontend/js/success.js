/**
 * success.js - Maneja la visualización del resumen de compra
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Intentar recuperar el pedido del almacenamiento local
    const orderDataRaw = localStorage.getItem('last_order');
    
    if (!orderDataRaw) {
        console.warn("No se encontró ningún pedido reciente.");
        return;
    }

    const orderData = JSON.parse(orderDataRaw);
    const items = orderData.items || [];

    // --- ELEMENTOS DEL DOM ---
    const listContainer = document.getElementById('product-list');
    const orderNumberEl = document.getElementById('order-number');
    const orderDateEl = document.getElementById('order-date');
    const orderDeliveryEl = document.getElementById('order-delivery');
    
    const resSubtotalEl = document.getElementById('res-subtotal');
    const resShippingEl = document.getElementById('res-shipping');
    const resTotalEl = document.getElementById('res-total');
    const resShippingLabel = document.getElementById('res-shipping-label');

    const delNombre = document.getElementById('del-nombre');
    const delCiudad = document.getElementById('del-ciudad');
    const delDireccion = document.getElementById('del-direccion');
    const delCp = document.getElementById('del-cp');

    // --- 2. RENDERIZAR ARTÍCULOS ---
    let subtotalCalculado = orderData.subtotal || 0;

    if (listContainer) {
        if (items.length === 0) {
            listContainer.innerHTML = '<p style="padding: 20px; color: #888;">No se han podido cargar los artículos.</p>';
        } else {
            listContainer.innerHTML = ''; // Limpiar
            items.forEach(item => {
                // Limpiar precio (quitar € y convertir a número)
                const priceNum = typeof item.price === 'string' 
                    ? parseFloat(item.price.replace(/[^\d.,]/g, '').replace(',', '.')) 
                    : parseFloat(item.price);

                listContainer.innerHTML += `
                    <div class="product-item">
                        <img src="${item.img || 'https://placehold.co/60'}" alt="${item.name}" class="product-img">
                        <div style="flex:1; min-width:0;">
                            <div class="product-name">${item.name}</div>
                            <div class="product-meta">Cantidad: 1</div>
                        </div>
                        <div class="product-price">${priceNum.toFixed(2).replace('.', ',')} €</div>
                    </div>`;
            });
        }
    }

    // --- 3. PROCESAR TOTALES Y FECHAS ---
    const shippingCost = parseFloat(orderData.shipping) || 0;
    const totalFinal = orderData.total || (subtotalCalculado + shippingCost);
    const isExpress = orderData.isExpress !== undefined ? orderData.isExpress : (shippingCost > 2);

    // Fechas dinámicas
    const hoy = new Date();
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    
    // Fecha de entrega (1 día para express, 3 para estándar)
    const fechaEntrega = new Date();
    fechaEntrega.setDate(hoy.getDate() + (isExpress ? 1 : 3));

    // --- 4. ASIGNAR VALORES AL HTML ---
    
    // Metadatos del pedido
    if(orderNumberEl) orderNumberEl.textContent = `Pedido #${orderData.number || '000000'}`;
    if(orderDateEl) orderDateEl.textContent = hoy.toLocaleDateString('es-ES', options);
    if(orderDeliveryEl) orderDeliveryEl.textContent = `Entrega est. ${fechaEntrega.toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}`;

    // Resumen económico
    if(resSubtotalEl) resSubtotalEl.textContent = `${subtotalCalculado.toFixed(2).replace('.', ',')} €`;
    if(resShippingEl) resShippingEl.textContent = `${shippingCost.toFixed(2).replace('.', ',')} €`;
    if(resTotalEl) resTotalEl.textContent = `${totalFinal.toFixed(2).replace('.', ',')} €`;
    
    if(resShippingLabel) {
        resShippingLabel.innerHTML = isExpress 
            ? '<i class="fa-solid fa-bolt"></i> Express' 
            : '<i class="fa-solid fa-box"></i> Estándar';
    }

    // Datos de envío
    if(delNombre) delNombre.textContent = orderData.nombre || '—';
    if(delCiudad) delCiudad.textContent = orderData.ciudad || '—';
    if(delDireccion) delDireccion.textContent = orderData.direccion || '—';
    if(delCp) delCp.textContent = orderData.cp || '—';

    // Lanzar efecto visual
    crearConfetti();

    // --- 5. SINCRONIZACIÓN CON PERFIL.JS ---
    // Aseguramos que last_order tenga la estructura que perfil.js espera
    // No borramos el 'cart' aquí, dejamos que perfil.js lo haga al entrar en la pestaña pedidos.
    
    const orderForHistory = {
        ...orderData,
        items: items, // Nos aseguramos de que los productos estén incluidos
        subtotal: subtotalCalculado,
        total: totalFinal,
        date: hoy.toISOString()
    };

    localStorage.setItem('last_order', JSON.stringify(orderForHistory));

    // Opcional: Si tienes un botón para ir al perfil, asegúrate de que apunte al ancla #pedidos
    const btnPerfil = document.querySelector('a[href*="perfil.html"]');
    if (btnPerfil) {
        btnPerfil.href = 'perfil.html#pedidos';
    }
});

/**
 * Genera pequeñas piezas de colores cayendo por la pantalla
 */
function crearConfetti() {
    const colores = ['#10B981', '#153B6B', '#fbbf24', '#f87171', '#6366f1'];
    const container = document.body;

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
        confetti.style.width = Math.random() * 8 + 4 + 'px';
        confetti.style.height = Math.random() * 8 + 4 + 'px';
        confetti.style.animationDuration = Math.random() * 2 + 3 + 's';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.opacity = Math.random();

        container.appendChild(confetti);

        // Limpiar el DOM después de la animación
        setTimeout(() => confetti.remove(), 5000);
    }
}  