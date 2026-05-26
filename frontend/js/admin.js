const API_BASE = "http://127.0.0.1:8000/api";
const token = localStorage.getItem('auth_token');

// Variable global para guardar los usuarios y poder filtrarlos sin llamar al servidor todo el rato
let globalUsers = []; 
let globalProducts = [];
let globalBids = [];

// 1. SEGURIDAD: Verificar si es Admin al cargar
document.addEventListener('DOMContentLoaded', async () => {
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/user`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const user = await res.json();

        if (user.role !== 'admin') {
            alert("Acceso denegado: Área restringida a personal autorizado.");
            window.location.href = "index.html";
            return;
        }

        document.getElementById('admin-name').innerHTML = `<i class="fa-solid fa-circle-user"></i> ${user.name}`;
        
        loadStats();
        loadUsers();

        // Escuchadores de eventos para el buscador y el filtro
        document.getElementById('search-user').addEventListener('input', renderUsers);
        document.getElementById('filter-role').addEventListener('change', renderUsers);
        // Escuchadores para el Catálogo
        document.getElementById('search-product').addEventListener('input', renderProducts);
        document.getElementById('filter-league').addEventListener('change', renderProducts);

    } catch (e) {
        window.location.href = "index.html";
    }
});

// 2. CARGAR ESTADÍSTICAS
// 2. CARGAR ESTADÍSTICAS
async function loadStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const stats = await res.json();
    document.getElementById('stat-total-users').innerText = stats.total_users;
    document.getElementById('stat-admin-users').innerText = stats.admin_users;
    
    // AÑADE ESTA LÍNEA 👇
    document.getElementById('stat-active-auctions').innerText = stats.subastas_activas;
}

// 3. DESCARGAR TODOS LOS USUARIOS
async function loadUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    globalUsers = await res.json();
    renderUsers(); // Llamamos a renderizar la primera vez
}

// 4. FILTRAR Y PINTAR USUARIOS EN LA TABLA
function renderUsers() {
    const searchTerm = document.getElementById('search-user').value.toLowerCase();
    const roleFilter = document.getElementById('filter-role').value;
    const tbody = document.getElementById('users-table-body');
    
    tbody.innerHTML = '';

    // Filtrar la lista
    const filteredUsers = globalUsers.filter(u => {
        const nameMatch = u.name.toLowerCase().includes(searchTerm) || u.email.toLowerCase().includes(searchTerm);
        const roleMatch = roleFilter === 'all' || u.role === roleFilter;
        return nameMatch && roleMatch;
    });

    if (filteredUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">No se encontraron usuarios.</td></tr>`;
        return;
    }

    // Pintar la lista filtrada
    filteredUsers.forEach(u => {
        const date = new Date(u.created_at).toLocaleDateString();
        tbody.innerHTML += `
            <tr>
                <td style="font-weight: 500;">${u.name} ${u.apellidos || ''}</td>
                <td style="color: #64748b;">${u.email}</td>
                <td><span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}">${u.role}</span></td>
                <td>${date}</td>
                <td>
                    <button class="btn-action" onclick="toggleRole(${u.id})" title="Cambiar permisos">
                        <i class="fa-solid fa-key"></i>
                    </button>
                    <button class="btn-action delete" onclick="deleteUser(${u.id})" title="Eliminar cuenta">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

// 5. CAMBIAR ROL
async function toggleRole(id) {
    if (!confirm("¿Modificar los privilegios de este usuario?")) return;
    
    const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
        loadUsers(); // Recargamos para ver los cambios
        loadStats();
    } else {
        const err = await res.json();
        alert(err.message);
    }
}

// 6. ELIMINAR USUARIO
async function deleteUser(id) {
    if (!confirm("Atención: Vas a eliminar esta cuenta de forma permanente. ¿Continuar?")) return;
    
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
        loadUsers();
        loadStats();
    }
}

// 7. NAVEGACIÓN DEL MENÚ LATERAL
function showSection(sectionId, element) {
    // Ocultar todas las secciones
    document.querySelectorAll('.admin-section').forEach(sec => sec.style.display = 'none');
    
    // Mostrar la elegida
    document.getElementById('section-' + sectionId).style.display = 'block';
    
    // Quitar "active" de todos los enlaces y ponérselo al que hemos hecho clic
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    element.classList.add('active');

    // Cambiar el título
    const titles = {
        'dashboard': 'Dashboard',
        'users': 'Gestión de Usuarios',
        'products': 'Catálogo de Productos',
        'orders': 'Control de Pedidos'
    };
    document.getElementById('section-title').innerText = titles[sectionId];
}

// ==========================================
// MÓDULO DE CATÁLOGO (DATOS LOCALES)
// ==========================================
function loadProducts() {
    // Enganchamos directamente la variable de tu archivo datos_locales.js
    if (typeof DATOS_LOCALES !== 'undefined') {
        globalProducts = DATOS_LOCALES;
    } else {
        console.error("Error: No se ha cargado el archivo datos_locales.js");
        return;
    }
    
    renderProducts();
}

function renderProducts() {
    const searchTerm = document.getElementById('search-product').value.toLowerCase();
    const leagueFilter = document.getElementById('filter-league').value;
    const tbody = document.getElementById('products-table-body');
    
    tbody.innerHTML = '';

    const filteredProducts = globalProducts.filter(p => {
        // 1. Filtro por nombre (busca en nombre_camiseta y nombre_equipo)
        const nombreProducto = (p.nombre_camiseta || '').toLowerCase();
        const equipoProducto = (p.nombre_equipo || '').toLowerCase();
        const nameMatch = nombreProducto.includes(searchTerm) || equipoProducto.includes(searchTerm);
        
        // 2. Filtro por liga (Adaptado a tus datos "Spanish La Liga", "English Premier League", etc.)
        let matchLeague = false;
        const liga = p.liga || '';

        if (leagueFilter === 'all') {
            matchLeague = true;
        } else if (leagueFilter === 'La Liga' && liga.includes('La Liga')) {
            matchLeague = true;
        } else if (leagueFilter === 'Premier League' && liga.includes('Premier League')) {
            matchLeague = true;
        } else if (leagueFilter === 'Serie A' && liga.includes('Serie A')) {
            matchLeague = true;
        } else if (leagueFilter === 'Bundesliga' && liga.includes('Bundesliga')) {
            matchLeague = true;
        } else if (leagueFilter === 'Ligue 1' && liga.includes('Ligue 1')) {
            matchLeague = true;
        } else if (leagueFilter === 'Otras') {
            // Si no es ninguna de las principales
            if (!liga.includes('La Liga') && !liga.includes('Premier League') && 
                !liga.includes('Serie A') && !liga.includes('Bundesliga') && !liga.includes('Ligue 1')) {
                matchLeague = true;
            }
        }
        
        return nameMatch && matchLeague;
    });

    if (filteredProducts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">No se encontraron camisetas que coincidan con la búsqueda.</td></tr>`;
        return;
    }

    filteredProducts.forEach(p => {
        // Cogemos las propiedades tal cual están en tu archivo DATOS_LOCALES
        const img = p.url_camiseta || 'img/escudos/cami.png';
        const precio = p.precio || '0.00';
        const nombre = p.nombre_camiseta || 'Camiseta';
        // Quitamos el país de la liga para que quede más limpio en la tabla (ej: "Spanish La Liga" -> "La Liga")
        const ligaLimpia = p.liga ? p.liga.replace('Spanish ', '').replace('English ', '').replace('German ', '').replace('Italian ', '').replace('French ', '') : 'Sin Liga';
        
        tbody.innerHTML += `
            <tr>
                <td><img src="${img}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid #e2e8f0;"></td>
                <td style="font-weight: 500;">${nombre}</td>
                <td><span class="badge badge-user">${ligaLimpia}</span></td>
                <td style="font-weight: 600; color: #0f172a;">${precio}€</td>
                <td><span style="color: #16a34a; font-weight: 500; background: #dcfce7; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">En Stock</span></td>
            </tr>
        `;
    });
}

// ==========================================
// MÓDULO DE SUBASTAS (PUJAS)
// ==========================================
async function loadBids() {
    try {
        const res = await fetch(`${API_BASE}/admin/bids`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            globalBids = await res.json();
            renderBids();
        }
    } catch (e) {
        console.error("Error cargando pujas", e);
    }
}

function renderBids() {
    const tbody = document.getElementById('bids-table-body');
    tbody.innerHTML = '';

    if (globalBids.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px;">No hay pujas registradas aún.</td></tr>`;
        return;
    }

    globalBids.forEach(b => {
        const date = new Date(b.created_at).toLocaleString();
        tbody.innerHTML += `
            <tr>
                <td style="font-weight: 500;"><i class="fa-solid fa-user" style="color:#94a3b8; margin-right:5px;"></i> ${b.user_name}</td>
                <td>${b.producto_nombre}</td>
                <td style="font-weight: 700; color: #ea580c;">${b.cantidad}€</td>
                <td style="color: #64748b; font-size: 0.85rem;">${date}</td>
            </tr>
        `;
    });
}

// ==========================================
// MODIFICACIÓN DE LA NAVEGACIÓN
// ==========================================
// Sustituye tu función showSection actual por esta para que cargue los datos al hacer clic en la pestaña
function showSection(sectionId, element) {
    document.querySelectorAll('.admin-section').forEach(sec => sec.style.display = 'none');
    document.getElementById('section-' + sectionId).style.display = 'block';
    
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    if(element) element.classList.add('active');

    const titles = {
        'dashboard': 'Dashboard',
        'users': 'Gestión de Usuarios',
        'products': 'Catálogo de Productos',
        'orders': 'Control de Subastas y Pujas'
    };
    document.getElementById('section-title').innerText = titles[sectionId];

    // Cargar datos solo cuando se entra a la sección
    if (sectionId === 'products') loadProducts();
    if (sectionId === 'orders') loadBids();
}