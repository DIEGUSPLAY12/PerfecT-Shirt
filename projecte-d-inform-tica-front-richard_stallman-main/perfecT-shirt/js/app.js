// js/app.js

const API_BASE = 'http://127.0.0.1:8000/api';

const state = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    favorites: JSON.parse(localStorage.getItem('favorites')) || [], 
    notifications: JSON.parse(localStorage.getItem('notifications')) || [], // <--- NUEVO
    currency: 'EUR',
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('auth_token') || null 
};

let emailParaVerificar = ""; 

document.addEventListener('DOMContentLoaded', () => {
    updateCounts();
    createLoginModal();
    createVerifyModal();
    createForgotModal(); 
    checkAuthStatus();
    checkGoogleLoginCallback(); 
    initTranslator();
    
    // Inicializar moneda desde localStorage
    const savedCurrency = localStorage.getItem('currency') || 'EUR';
    state.currency = savedCurrency;
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
        currencySelect.value = savedCurrency;
    }
    
    // Mantiene los datos (como la foto) actualizados siempre al cambiar de página
    fetchUserFromBackend();
});

// =========================================================================
// Sincronización silenciosa con el Backend
// =========================================================================
async function fetchUserFromBackend() {
    if (!state.token) return;

    try {
        const res = await fetch(`${API_BASE}/user`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${state.token}`
            }
        });

        if (res.ok) {
            state.user = await res.json();
            saveState(); 
            checkAuthStatus(); // Refresca la barra superior
            
            // Si estamos en perfil.html, refrescamos la foto grande central
            const avatarPreview = document.getElementById('avatar-preview');
            if (avatarPreview && state.user.avatar) {
                avatarPreview.src = state.user.avatar.startsWith('http') 
                    ? state.user.avatar 
                    : `http://127.0.0.1:8000/${state.user.avatar}`;
            }
        } else {
            logoutUser();
        }
    } catch (error) {
        console.error("Error sincronizando usuario:", error);
    }
}

// =========================================================================

function saveState() {
    localStorage.setItem('cart', JSON.stringify(state.cart));
    localStorage.setItem('favorites', JSON.stringify(state.favorites));
    localStorage.setItem('notifications', JSON.stringify(state.notifications));
    if(state.user) { localStorage.setItem('user', JSON.stringify(state.user)); } 
    else { localStorage.removeItem('user'); }
    if(state.token) { localStorage.setItem('auth_token', state.token); } 
    else { localStorage.removeItem('auth_token'); }
}

function toggleSidebar(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return; 
    const isActive = overlay.classList.contains('active');
    document.querySelectorAll('.sidebar-overlay').forEach(el => el.classList.remove('active'));
    const loginOverlay = document.getElementById('login-overlay');
    if (loginOverlay) loginOverlay.style.display = 'none';
    const profileMenu = document.getElementById('profile-dropdown');
    if (profileMenu) profileMenu.style.display = 'none';

    if (!isActive) {
        overlay.classList.add('active');
        if (id === 'cart-modal') renderCart();
        if (id === 'fav-modal') renderFavorites();
        if (id === 'notif-modal') renderNotifications(); // <--- Pintar panel de notificaciones
    }
}

function addToCart(name, price, img) {
    const cleanPrice = typeof price === 'string' ? parseFloat(price.replace(',', '.')) : parseFloat(price);
    state.cart.push({ name, price: cleanPrice || 0, img });
    updateCounts();
    renderCart(); 
    saveState();
    addNotificationLocal('¡Añadido al carrito!', `Has añadido ${name} por ${cleanPrice}€`, 'success');
    const cartModal = document.getElementById('cart-modal');
    if (cartModal && !cartModal.classList.contains('active')) { toggleSidebar('cart-modal'); }
}

function removeFromCart(index) {
    state.cart.splice(index, 1); 
    renderCart(); updateCounts(); saveState();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (!container) return;
    container.innerHTML = '';
    let total = 0;
    if (state.cart.length === 0) {
        container.innerHTML = '<p class="text-center" style="color:#888; margin-top: 20px;">Tu carrito está vacío</p>';
    }
    state.cart.forEach((item, index) => {
        const validPrice = Number(item.price) || 0;
        const convertedPrice = convertPrice(validPrice);
        total += convertedPrice;
        const displayImg = item.img || 'https://placehold.co/50';
        container.innerHTML += `
            <div style="display:flex; gap:10px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px; align-items:center;">
                <img src="${displayImg}" style="width:50px; height:50px; object-fit: contain; border-radius:5px; border: 1px solid #eee;">
                <div style="flex:1;">
                    <div class="bold" style="font-size:0.9rem;">${item.name || 'Producto'}</div>
                    <div style="color:var(--primary); font-weight:bold;">${convertedPrice.toFixed(2)}${getCurrencySymbol()}</div>
                </div>
                <button onclick="removeFromCart(${index})" style="background:none; border:none; cursor:pointer; color:var(--error);" title="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>`;
    });
    if(totalEl) totalEl.innerText = total.toFixed(2) + ' ' + getCurrencySymbol();
}

function toggleFavorite(name, price, img, btnElement = null) {
    const index = state.favorites.findIndex(i => i.name === name);
    if (index !== -1) {
        state.favorites.splice(index, 1);
        if(btnElement) updateHeartIcon(btnElement, false);
    } else {
        const cleanPrice = typeof price === 'string' ? parseFloat(price.replace(',', '.')) : parseFloat(price);
        state.favorites.push({ name, price: cleanPrice || 0, img });
        if(btnElement) updateHeartIcon(btnElement, true);
        
        addNotificationLocal('¡Añadido a favoritos!', `Has guardado ${name} en tu lista de deseos.`, 'success'); // <--- NOTIFICACIÓN
    }
    updateCounts(); saveState();
    const favModal = document.getElementById('fav-modal');
    if (favModal && favModal.classList.contains('active')) renderFavorites();
}

function updateHeartIcon(btn, isActive) {
    const icon = btn.querySelector('i');
    if (!icon) return;
    if (isActive) {
        icon.classList.remove('fa-regular'); icon.classList.add('fa-solid'); btn.classList.add('active');
    } else {
        icon.classList.remove('fa-solid'); icon.classList.add('fa-regular'); btn.classList.remove('active');
    }
}

function renderFavorites() {
    const container = document.getElementById('fav-items');
    if (!container) return;
    container.innerHTML = '';
    if (state.favorites.length === 0) {
        container.innerHTML = '<p class="text-center" style="color:#888; margin-top: 20px;">No tienes favoritos</p>';
        return;
    }
    state.favorites.forEach((item) => {
        const validPrice = Number(item.price) || 0;
        const convertedPrice = convertPrice(validPrice);
        const displayImg = item.img || 'https://placehold.co/50';
        container.innerHTML += `
            <div style="display:flex; gap:10px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px; align-items:center;">
                <img src="${displayImg}" style="width:50px; height:50px; object-fit: contain; border-radius:5px; border: 1px solid #eee;">
                <div style="flex:1;">
                    <div class="bold" style="font-size:0.9rem;">${item.name}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:5px;">${convertedPrice.toFixed(2)}${getCurrencySymbol()}</div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-primary btn-sm" style="padding: 5px 10px; font-size:0.75rem;" onclick="addToCart('${item.name}', '${validPrice}', '${item.img}')">Añadir</button>
                        <button class="btn btn-outline btn-sm" style="padding: 5px 10px; font-size:0.75rem; color:var(--error);" onclick="toggleFavorite('${item.name}', '${validPrice}', '${item.img}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>`;
    });
}

function updateCounts() {
    const cartCount = document.getElementById('cart-count');
    const favCount = document.getElementById('fav-count');
    if(cartCount) cartCount.innerText = state.cart.length;
    if(favCount) favCount.innerText = state.favorites.length;
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('sidebar-overlay')) e.target.classList.remove('active');
    const profileBtn = document.getElementById('btn-profile-toggle');
    const profileMenu = document.getElementById('profile-dropdown');
    if (profileMenu && profileMenu.style.display === 'block') {
        if (e.target !== profileBtn && !profileBtn.contains(e.target) && e.target !== profileMenu && !profileMenu.contains(e.target)) {
            profileMenu.style.display = 'none';
        }
    }
});

// =========================================================================
// LÓGICA DE BARRA SUPERIOR (HEADER)
// =========================================================================
function checkAuthStatus() {
    const loginBtnContainer = document.querySelector('.header-actions');
    if (!loginBtnContainer) return;
    let existingProfile = document.getElementById('user-profile-widget');
    const links = loginBtnContainer.querySelectorAll('button, a');

    if (state.user) {
        links.forEach(el => { if (el.textContent.includes('Login')) el.style.display = 'none'; });

        // Eliminamos el widget si ya existía para repintarlo con la nueva foto
        if (existingProfile) { existingProfile.remove(); }

        const isPagesDir = window.location.pathname.includes('/pages/');
        const profileLink = isPagesDir ? 'perfil.html' : 'pages/perfil.html';

        // LÓGICA INTELIGENTE DEL AVATAR (Google o Subida Manual directa a public)
        let avatarHTML = '';
        if (state.user.avatar) {
            const avatarUrl = state.user.avatar.startsWith('http') 
                ? state.user.avatar 
                : `http://127.0.0.1:8000/${state.user.avatar}`; 
            
            avatarHTML = `<img src="${avatarUrl}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1px solid var(--primary); box-shadow: 0 2px 4px rgba(0,0,0,0.1);">`;
        } else {
            avatarHTML = `<i class="fa-solid fa-user-circle" style="font-size: 1.5rem; color: var(--primary);"></i>`;
        }

        const profileHTML = `
            <div id="user-profile-widget" style="position: relative; margin-left: 10px;">
                <div id="btn-profile-toggle" style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 5px 10px; border-radius: 20px; background: rgba(21, 59, 107, 0.1); border: 1px solid rgba(21, 59, 107, 0.2);">
                    
                    ${avatarHTML}
                    
                    <span style="font-weight: bold; color: var(--primary); font-size: 0.9rem; max-width: 80px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${state.user.name}</span>
                    <i class="fa-solid fa-chevron-down" style="font-size: 0.7rem; color: var(--primary);"></i>
                </div>
                
                <div id="profile-dropdown" style="display: none; position: absolute; top: 120%; right: 0; background: white; border: 1px solid #eee; box-shadow: 0 10px 20px rgba(0,0,0,0.1); border-radius: 12px; width: 200px; z-index: 1000; overflow: hidden;">
                    <div style="padding: 15px; border-bottom: 1px solid #eee; background: #fafafa;">
                        <div style="font-weight: bold; color: #333;">Mi Cuenta</div>
                        <div style="font-size: 0.8rem; color: #888; word-break: break-all;">${state.user.email}</div>
                    </div>
                    <a href="${profileLink}" style="display: block; padding: 12px 15px; color: #333; text-decoration: none; font-size: 0.9rem; cursor: pointer; border-top: 1px solid #eee; background: #fff; transition: 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#fff'">
                        <i class="fa-solid fa-gear" style="width: 20px; color: var(--primary);"></i> Mi Perfil
                    </a>
                    <div onclick="logoutUser()" style="display: block; padding: 12px 15px; color: var(--error, #e74c3c); text-decoration: none; font-size: 0.9rem; cursor: pointer; border-top: 1px solid #eee; background: #fffcfc;">
                        <i class="fa-solid fa-right-from-bracket" style="width: 20px;"></i> Cerrar Sesión
                    </div>
                </div>
            </div>
        `;
        loginBtnContainer.insertAdjacentHTML('beforeend', profileHTML);
        
        document.getElementById('btn-profile-toggle').addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('profile-dropdown');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
    } else {
        if (existingProfile) existingProfile.remove();
        links.forEach(el => { if (el.textContent.includes('Login')) el.style.display = 'inline-block'; });
    }
}

async function logoutUser() {
    if (state.token) {
        try {
            await fetch(`${API_BASE}/logout`, { method: 'POST', headers: { 'Authorization': `Bearer ${state.token}`, 'Accept': 'application/json' } });
        } catch (e) { console.warn("No se pudo conectar con el servidor para logout", e); }
    }
    state.user = null; state.token = null; saveState(); checkAuthStatus();
}

function loginWithGoogle() { window.location.href = `${API_BASE}/auth/google`; }

async function checkGoogleLoginCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        state.token = token; localStorage.setItem('auth_token', token);
        window.history.replaceState({}, document.title, window.location.pathname);
        try {
            const res = await fetch(`${API_BASE}/user`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${state.token}` } });
            if (res.ok) {
                state.user = await res.json(); saveState(); checkAuthStatus();
                alert(`¡Bienvenido de nuevo, ${state.user.name}!`);
            }
        } catch(e) { console.error("Error Google Login", e); }
    }
}

// =========================================================================
// SISTEMA DE LOGIN Y REGISTRO AVANZADO (Modal)
// =========================================================================
let isRegisterMode = false;

function createLoginModal() {
    if (document.getElementById('login-overlay')) return;

    const modalHTML = `
    <div id="login-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(8px); z-index: 9999; align-items: center; justify-content: center;">
      
      <!-- CONTENEDOR EXTERNO: Define el borde redondeado y "corta" el scrollbar -->
      <div style="background: #fff; border-radius: 16px; box-shadow: 0 15px 35px rgba(0,0,0,0.2); width: 90%; max-width: 500px; position: relative; overflow: hidden;">
        
        <!-- BOTÓN DE CERRAR: Lo dejamos fijo arriba para que no haga scroll -->
        <div onclick="toggleLogin()" style="position: absolute; top: 15px; right: 15px; cursor: pointer; padding: 5px; z-index: 20; background: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <i class="fa-solid fa-xmark" style="font-size: 1.2rem; color: #333;"></i>
        </div>

        <!-- CONTENEDOR INTERNO: Aquí está el padding y el scroll -->
        <div style="max-height: 90vh; overflow-y: auto; padding: 40px; box-sizing: border-box; width: 100%;">

          <h2 id="modal-title" style="text-align: center; margin-bottom: 25px; font-weight: 800; font-size: 1.5rem; color: var(--primary-dark);">Inicia sesión</h2>
          
          <div class="auth-tabs" style="display: flex; justify-content: space-around; margin-bottom: 25px; border-bottom: 2px solid #eee;">
            <div id="tab-login" onclick="switchAuthMode(false)" style="padding-bottom: 10px; cursor: pointer; border-bottom: 2px solid var(--primary); color: var(--primary); font-weight: bold; flex: 1; text-align: center; transition: 0.3s;">Inicia sesión</div>
            <div id="tab-register" onclick="switchAuthMode(true)" style="padding-bottom: 10px; cursor: pointer; color: #888; flex: 1; text-align: center; transition: 0.3s;">Regístrate</div>
          </div>

          <form id="auth-form" style="width: 100%; box-sizing: border-box;">
            <div id="register-fields" style="display: none;">
                <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                    <div style="flex: 1; min-width: 0;">
                        <label style="display: block; font-weight: bold; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-main);">Nombre</label>
                        <input type="text" id="auth-name" class="input-field" style="border-radius: 8px; width: 100%; box-sizing: border-box;" placeholder="Tu nombre">
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <label style="display: block; font-weight: bold; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-main);">Apellidos</label>
                        <input type="text" id="auth-apellidos" class="input-field" style="border-radius: 8px; width: 100%; box-sizing: border-box;" placeholder="Tus apellidos">
                    </div>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: bold; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-main);">Fecha de Nacimiento</label>
                    <input type="date" id="auth-fecha" class="input-field" style="border-radius: 8px; color: var(--text-main); cursor: pointer; width: 100%; box-sizing: border-box;">
                </div>
            </div>

            <div style="margin-bottom: 15px;">
              <label style="display: block; font-weight: bold; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-main);">Correo electrónico</label>
              <input type="email" id="auth-email" required class="input-field" style="border-radius: 8px; width: 100%; box-sizing: border-box;" placeholder="ejemplo@correo.com">
            </div>

            <div id="passwords-container" style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 5px;">
              <div style="flex: 1; min-width: 0;">
                <label style="display: block; font-weight: bold; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-main);">Contraseña</label>
                <input type="password" id="auth-pass" required class="input-field" style="border-radius: 8px; width: 100%; box-sizing: border-box;" placeholder="Mínimo 6 caracteres">
              </div>
              <div id="confirm-pass-group" style="flex: 1; min-width: 0; display: none;">
                <label style="display: block; font-weight: bold; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-main);">Repetir Contraseña</label>
                <input type="password" id="auth-pass-confirm" class="input-field" style="border-radius: 8px; width: 100%; box-sizing: border-box;" placeholder="Misma contraseña">
              </div>
            </div>

            <div id="forgot-password-link" style="text-align: right; margin-bottom: 20px;">
                <a href="#" onclick="showForgotModal()" style="font-size: 0.85rem; color: var(--primary); font-weight: 500; text-decoration: none;">¿Has olvidado tu contraseña?</a>
            </div>

            <button type="submit" id="auth-submit-btn" class="btn btn-primary btn-full" style="width: 100%; padding: 14px; margin-top: 10px; font-size: 1rem; border-radius: 50px; box-sizing: border-box;">Acceder</button>
          </form>
          
          <div style="text-align: center; margin: 20px 0 10px;">
            <span style="color: #888; font-size: 0.85rem;">o</span>
          </div>
          
          <button type="button" onclick="loginWithGoogle()" style="width: 100%; padding: 12px; background: white; border: 1px solid #ddd; border-radius: 50px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; box-sizing: border-box;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" style="width: 20px; height: 20px;"> Continuar con Google
          </button>
          <div id="auth-error" style="color: var(--error); text-align: center; margin-top: 15px; font-size: 0.9rem; display: none; background: #fff9f9; padding: 10px; border-radius: 8px; border: 1px solid #ffccba;"></div>
        
        </div>
      </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('auth-form').addEventListener('submit', handleAuthSubmit);
}

function toggleLogin() {
    const overlay = document.getElementById('login-overlay');
    if (!overlay) return;
    if (overlay.style.display === 'flex') { overlay.style.display = 'none'; } 
    else {
        document.querySelectorAll('.sidebar-overlay').forEach(el => el.classList.remove('active'));
        const profileMenu = document.getElementById('profile-dropdown');
        if (profileMenu) profileMenu.style.display = 'none';
        overlay.style.display = 'flex';
        switchAuthMode(false);
        document.getElementById('auth-error').style.display = 'none';
    }
}

function switchAuthMode(isRegister) {
    isRegisterMode = isRegister;
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const registerFields = document.getElementById('register-fields');
    const confirmPassGroup = document.getElementById('confirm-pass-group');
    const passContainer = document.getElementById('passwords-container');
    const btn = document.getElementById('auth-submit-btn');
    const title = document.getElementById('modal-title');
    const forgotLink = document.getElementById('forgot-password-link');
    
    const nameInput = document.getElementById('auth-name');
    const apeInput = document.getElementById('auth-apellidos');
    const fechaInput = document.getElementById('auth-fecha');
    const confirmPassInput = document.getElementById('auth-pass-confirm');

    if (isRegister) {
        tabRegister.style.borderBottom = '2px solid var(--primary)'; tabRegister.style.color = 'var(--primary)'; tabRegister.style.fontWeight = 'bold';
        tabLogin.style.borderBottom = 'none'; tabLogin.style.color = '#888'; tabLogin.style.fontWeight = 'normal';
        registerFields.style.display = 'block'; confirmPassGroup.style.display = 'block'; passContainer.style.flexDirection = 'row'; 
        if(forgotLink) forgotLink.style.display = 'none';
        
        nameInput.required = true; apeInput.required = true; fechaInput.required = true; confirmPassInput.required = true;
        btn.innerText = 'Crear Cuenta'; title.innerText = 'Crea tu cuenta';
    } else {
        tabLogin.style.borderBottom = '2px solid var(--primary)'; tabLogin.style.color = 'var(--primary)'; tabLogin.style.fontWeight = 'bold';
        tabRegister.style.borderBottom = 'none'; tabRegister.style.color = '#888'; tabRegister.style.fontWeight = 'normal';
        registerFields.style.display = 'none'; confirmPassGroup.style.display = 'none'; passContainer.style.flexDirection = 'column'; 
        if(forgotLink) forgotLink.style.display = 'block';
        
        nameInput.required = false; apeInput.required = false; fechaInput.required = false; confirmPassInput.required = false;
        btn.innerText = 'Acceder'; title.innerText = 'Inicia sesión';
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-pass').value;
    const errorMsg = document.getElementById('auth-error');
    const btn = document.getElementById('auth-submit-btn');

    let url = isRegisterMode ? `${API_BASE}/register` : `${API_BASE}/login`;
    let payload = { email, password };
    
    if (isRegisterMode) {
        payload.name = document.getElementById('auth-name').value;
        payload.apellidos = document.getElementById('auth-apellidos').value;
        payload.fecha_nacimiento = document.getElementById('auth-fecha').value;
        payload.password_confirmation = document.getElementById('auth-pass-confirm').value; 
    }

    btn.disabled = true; btn.innerText = "Procesando..."; errorMsg.style.display = 'none';

    try {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();

        if (!res.ok) {
            if (res.status === 403 && !isRegisterMode) {
                alert(data.message || "Tu cuenta aún no está verificada. Revisa tu correo."); toggleLogin(); showVerifyModal(email); return;
            }
            if (data.errors) { const firstError = Object.values(data.errors)[0][0]; throw new Error(firstError); }
            throw new Error(data.message || 'Error en la solicitud');
        }

        if (isRegisterMode && res.status === 201) {
            alert(data.message || "Registro casi completo. Revisa tu bandeja de entrada."); toggleLogin(); showVerifyModal(email); return;
        }

        state.user = data.user; state.token = data.token; saveState(); checkAuthStatus(); toggleLogin();
        alert(`¡Hola de nuevo, ${data.user.name}!`);

    } catch (error) {
        console.error("Auth Error:", error); errorMsg.innerText = error.message; errorMsg.style.display = 'block';
    } finally {
        btn.disabled = false; btn.innerText = isRegisterMode ? 'Crear Cuenta' : 'Acceder';
    }
}

// =========================================================================
// SISTEMA DE VERIFICACIÓN DE CORREO (OTP)
// =========================================================================
function createVerifyModal() {
    if (document.getElementById('verify-modal')) return;
    const modalHTML = `
    <div id="verify-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.8); z-index: 9999; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
        <div style="background: white; padding: 40px; border-radius: 16px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); position: relative;">
            <i class="fa-regular fa-envelope-open" style="font-size: 3rem; color: #2563eb; margin-bottom: 20px;"></i>
            <h2 style="margin-bottom: 10px; color: #0f172a; font-size: 1.5rem;">Revisa tu correo</h2>
            <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 25px; line-height: 1.5;">Te hemos enviado un código de 6 dígitos. Introdúcelo a continuación para verificar tu cuenta.</p>
            <input type="text" id="verify-code-input" placeholder="Ej: 123456" maxlength="6" style="width: 100%; padding: 15px; font-size: 1.5rem; text-align: center; letter-spacing: 5px; border: 2px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; outline: none; font-weight: bold; color: #ea580c;">
            <button onclick="submitVerification()" id="verify-btn" style="width: 100%; background: #2563eb; color: white; border: none; padding: 14px; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: 0.2s;">Verificar Cuenta</button>
            <button onclick="closeVerifyModal()" style="width: 100%; background: transparent; color: #64748b; border: none; padding: 10px; margin-top: 10px; cursor: pointer; font-size: 0.9rem;">Lo haré más tarde</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}
function showVerifyModal(email) { emailParaVerificar = email; document.getElementById('verify-modal').style.display = 'flex'; document.getElementById('verify-code-input').value = ''; }
function closeVerifyModal() { document.getElementById('verify-modal').style.display = 'none'; }
async function submitVerification() {
    const code = document.getElementById('verify-code-input').value; const btn = document.getElementById('verify-btn');
    if (code.length !== 6) { alert("El código debe tener exactamente 6 dígitos."); return; }
    btn.disabled = true; btn.innerText = "Verificando...";
    try {
        const response = await fetch(`${API_BASE}/verify-code`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ email: emailParaVerificar, code: code }) });
        const data = await response.json();
        if (response.ok) { alert("¡Cuenta verificada con éxito!"); state.user = data.user; state.token = data.token; saveState(); checkAuthStatus(); closeVerifyModal(); } 
        else { alert(data.message || "Código incorrecto. Vuelve a intentarlo."); }
    } catch (error) { console.error("Error al verificar:", error); alert("Error de conexión al verificar el código."); } 
    finally { btn.disabled = false; btn.innerText = "Verificar Cuenta"; }
}

// =========================================================================
// SISTEMA DE RECUPERACIÓN DE CONTRASEÑA
// =========================================================================
let resetEmail = "";
function createForgotModal() {
    if (document.getElementById('forgot-modal')) return;
    const modalHTML = `
    <div id="forgot-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.8); z-index: 10000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
        <div style="background: white; padding: 40px; border-radius: 16px; width: 90%; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); position: relative;">
            <div onclick="closeForgotModal()" style="position: absolute; top: 15px; right: 15px; cursor: pointer; padding: 5px;"><i class="fa-solid fa-xmark" style="font-size: 1.2rem; color: #333;"></i></div>
            <div id="step-1-email">
                <i class="fa-solid fa-unlock-keyhole" style="font-size: 2.5rem; color: #2563eb; margin-bottom: 15px; display: block; text-align: center;"></i>
                <h2 style="margin-bottom: 10px; color: #0f172a; font-size: 1.3rem; text-align: center;">Recuperar contraseña</h2>
                <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 20px; text-align: center;">Introduce tu correo y te enviaremos un código para restablecerla.</p>
                <input type="email" id="forgot-email" placeholder="ejemplo@correo.com" class="input-field" style="width: 100%; padding: 12px; margin-bottom: 15px; box-sizing: border-box;">
                <button onclick="requestPasswordReset()" id="btn-request-reset" class="btn btn-primary" style="width: 100%; padding: 12px;">Enviar código</button>
            </div>
            <div id="step-2-reset" style="display: none;">
                <h2 style="margin-bottom: 10px; color: #0f172a; font-size: 1.3rem; text-align: center;">Nueva contraseña</h2>
                <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 20px; text-align: center;">Introduce el código de 6 dígitos y tu nueva contraseña.</p>
                <input type="text" id="reset-code" placeholder="Código (Ej: 123456)" maxlength="6" style="width: 100%; padding: 12px; margin-bottom: 15px; text-align: center; letter-spacing: 3px; font-weight: bold; border: 1px solid #ddd; border-radius: 8px;">
                <input type="password" id="reset-pass" placeholder="Nueva contraseña" class="input-field" style="width: 100%; padding: 12px; margin-bottom: 15px; box-sizing: border-box;">
                <input type="password" id="reset-pass-confirm" placeholder="Repetir nueva contraseña" class="input-field" style="width: 100%; padding: 12px; margin-bottom: 15px; box-sizing: border-box;">
                <button onclick="submitNewPassword()" id="btn-submit-reset" class="btn btn-primary" style="width: 100%; padding: 12px;">Guardar contraseña</button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}
function showForgotModal() { toggleLogin(); document.getElementById('forgot-modal').style.display = 'flex'; document.getElementById('step-1-email').style.display = 'block'; document.getElementById('step-2-reset').style.display = 'none'; document.getElementById('forgot-email').value = document.getElementById('auth-email').value; }
function closeForgotModal() { document.getElementById('forgot-modal').style.display = 'none'; }
async function requestPasswordReset() {
    resetEmail = document.getElementById('forgot-email').value; if (!resetEmail) { alert("Escribe tu correo primero"); return; }
    const btn = document.getElementById('btn-request-reset'); btn.disabled = true; btn.innerText = "Enviando...";
    try {
        const res = await fetch(`${API_BASE}/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ email: resetEmail }) });
        document.getElementById('step-1-email').style.display = 'none'; document.getElementById('step-2-reset').style.display = 'block';
    } catch (e) { alert("Error de conexión"); } finally { btn.disabled = false; btn.innerText = "Enviar código"; }
}
async function submitNewPassword() {
    const code = document.getElementById('reset-code').value; 
    const password = document.getElementById('reset-pass').value; 
    const password_confirmation = document.getElementById('reset-pass-confirm').value;
    if (code.length !== 6 || !password) { alert("Rellena todos los campos"); return; }
    if (password !== password_confirmation) { alert("Las contraseñas no coinciden"); return; }
    const btn = document.getElementById('btn-submit-reset'); 
    btn.disabled = true; 
    btn.innerText = "Guardando...";
    try {
        const res = await fetch(`${API_BASE}/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ email: resetEmail, code, password, password_confirmation }) });
        const data = await res.json();
        if (res.ok) {
            alert("¡Contraseña cambiada con éxito! Ya puedes iniciar sesión.");
            closeForgotModal();
            toggleLogin();
        } else {
            alert(data.message || "Error al cambiar la contraseña");
        }
    } catch (e) {
        alert("Error de conexión");
    } finally {
        btn.disabled = false;
        btn.innerText = "Guardar contraseña";
    }
}

// =========================================================================
// SISTEMA DE NOTIFICACIONES UNIFICADO (Locales + Servidor)
// =========================================================================

// 1. Añade una notificación local (ej: Añadido al carrito)
function addNotificationLocal(titulo, mensaje, tipo = 'info') {
    const nueva = {
        id: 'local_' + Date.now(),
        titulo: titulo,
        mensaje: mensaje,
        tipo: tipo,
        leida: false,
        created_at: new Date().toISOString()
    };
    state.notifications.unshift(nueva);
    saveState();
    updateNotifBadge();
    renderNotifications();
}

// 2. Lee las notificaciones importantes del servidor (ej: Pujas)
async function fetchServerNotifications() {
    if (!state.token) return;
    try {
        const res = await fetch(`${API_BASE}/notificaciones`, {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${state.token}` }
        });
        if (res.ok) {
            const data = await res.json();
            // Filtramos para mantener las locales, pero añadimos las del servidor
            const locales = state.notifications.filter(n => n.id.toString().startsWith('local_'));
            state.notifications = [...data, ...locales].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            saveState();
            updateNotifBadge();
            if (document.getElementById('notif-modal') && document.getElementById('notif-modal').classList.contains('active')) {
                renderNotifications();
            }
        }
    } catch (e) { console.warn("Error leyendo notificaciones", e); }
}

// 3. Pinta el panel lateral
function renderNotifications() {
    const container = document.getElementById('notif-items');
    if (!container) return;
    container.innerHTML = '';

    if (state.notifications.length === 0) {
        container.innerHTML = '<p class="text-center" style="color:#888; margin-top: 20px;">No tienes notificaciones nuevas</p>';
        return;
    }

    state.notifications.forEach(notif => {
        let icon = '<i class="fa-solid fa-bell" style="color: #3498db;"></i>';
        if (notif.tipo === 'success') icon = '<i class="fa-solid fa-check-circle" style="color: #2ecc71;"></i>';
        if (notif.tipo === 'warning') icon = '<i class="fa-solid fa-triangle-exclamation" style="color: #e74c3c;"></i>';

        const bg = notif.leida ? 'transparent' : '#f0f8ff';
        const isServer = !notif.id.toString().startsWith('local_');

        container.innerHTML += `
            <div onclick="${isServer && !notif.leida ? `markAsRead(${notif.id})` : ''}" style="display:flex; gap:15px; margin-bottom:15px; border-bottom:1px solid #eee; padding: 15px; background: ${bg}; border-radius: 8px; cursor: ${isServer && !notif.leida ? 'pointer' : 'default'};">
                <div style="font-size: 1.5rem; margin-top: 5px;">${icon}</div>
                <div style="flex:1;">
                    <div class="bold" style="font-size:0.95rem; color: #333;">${notif.titulo || 'Aviso'}</div>
                    <div style="color: #666; font-size: 0.85rem; margin-top: 5px;">${notif.mensaje}</div>
                </div>
            </div>`;
    });
}

// 4. Marca como leída en el servidor
async function markAsRead(id) {
    if (!state.token) return;
    try {
        await fetch(`${API_BASE}/notificaciones/${id}/leer`, {
            method: 'PUT',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${state.token}` }
        });
        const index = state.notifications.findIndex(n => n.id === id);
        if (index > -1) state.notifications[index].leida = true;
        saveState(); updateNotifBadge(); renderNotifications();
    } catch (e) { console.warn(e); }
}

// 5. Borrar todas
async function clearNotifications() {
    if (state.token) {
        await fetch(`${API_BASE}/notificaciones`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${state.token}` }
        });
    }
    state.notifications = [];
    saveState(); updateNotifBadge(); renderNotifications();
}

// 6. Controlar la burbuja roja
function updateNotifBadge() {
    const badge = document.getElementById('notif-count');
    if (!badge) return;
    const noLeidas = state.notifications.filter(n => !n.leida).length;
    if (noLeidas > 0) {
        badge.innerText = noLeidas;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// =========================================================================
// SISTEMA DE TRADUCCIÓN MULTILINGÜE (GTranslate)
// =========================================================================
function initTranslator() {
    // 1. Buscamos la zona de acciones de la cabecera
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;

    // Evitamos que se duplique si ya se ha cargado
    if (document.querySelector('.gtranslate_wrapper')) return;

    // 2. Creamos el hueco visual para el desplegable
    const wrapper = document.createElement('div');
    wrapper.className = 'gtranslate_wrapper';
    wrapper.style.marginLeft = '10px';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    
    // Lo colocamos en la cabecera (justo antes del botón de Login o el Dark Mode)
    const loginBtn = headerActions.querySelector('button');
    if (loginBtn) {
        headerActions.insertBefore(wrapper, loginBtn);
    } else {
        headerActions.appendChild(wrapper);
    }

    // 3. Le damos las instrucciones al motor de Google
    window.gtranslateSettings = {
        "default_language": "es",
        "languages": ["es", "en", "fr", "pt"], // Los 4 idiomas que pediste
        "wrapper_selector": ".gtranslate_wrapper",
        "switcher_horizontal_position": "right",
        "switcher_vertical_position": "top"
    };

    // 4. Descargamos el script oficial de forma invisible
    const script = document.createElement('script');
    script.src = "https://cdn.gtranslate.net/widgets/latest/dropdown.js";
    script.defer = true;
    document.body.appendChild(script);
}

document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("page-loader");
    if (!loader) return;

    // 1. Ocultar el loader cuando todo (CSS, imágenes, JS) termine de cargar
    window.addEventListener("load", () => {
        // Le damos 300ms de "gracia" extra para que el Modo Oscuro y el traductor se asienten bien
        setTimeout(() => {
            loader.classList.add("hidden");
        }, 300);
    });

    // 1.1 TRUCO ANTI-BLOQUEO: Ampliado a 1.5 segundos (1500ms) para dar más tiempo a cargas pesadas
    setTimeout(() => {
        if (!loader.classList.contains("hidden")) {
            loader.classList.add("hidden");
        }
    }, 1500);

    // 2. Mostrar el loader al hacer clic en enlaces para ir a otras páginas
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetAttr = this.getAttribute('target');
            const hrefAttr = this.getAttribute('href');
            const hasOnclick = this.hasAttribute('onclick');

            // Ignoramos los enlaces que abren en otra pestaña, las anclas (#) o los que tienen acciones JS
            if (targetAttr === '_blank' || !hrefAttr || hrefAttr.startsWith('#') || hasOnclick) {
                return;
            }

            e.preventDefault(); // Pausamos el cambio de página momentáneamente
            const destination = this.href;
            
            loader.classList.remove("hidden"); // Mostramos la pantalla de carga
            
            // Le damos 500ms para que la animación de tapado se vea completa y elegante
            setTimeout(() => {
                window.location.href = destination;
            }, 500);
        });
    });
});

