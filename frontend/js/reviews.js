// js/reviews.js

document.addEventListener('DOMContentLoaded', () => {
    initReviews();
});

function initReviews() {
    // Si no hay reviews en localStorage, cargamos algunas de prueba
    if (!localStorage.getItem('store_reviews')) {
        const dummyReviews = [
            { id: 1, user: "Carlos Martínez", avatar: "https://placehold.co/100x100?text=CM", rating: 5, comment: "La caja random es una locura, me tocó una del Manchester City firmada. ¡Súper recomendable!", date: new Date(Date.now() - 86400000 * 2).toISOString() },
            { id: 2, user: "Ana Gómez", avatar: "https://placehold.co/100x100?text=AG", rating: 4, comment: "Buena calidad en las camisetas retro. El envío tardó un poco más de lo esperado pero valió la pena.", date: new Date(Date.now() - 86400000 * 5).toISOString() },
            { id: 3, user: "David Ruiz", avatar: "https://placehold.co/100x100?text=DR", rating: 5, comment: "Compré una personalizada y los materiales son premium. La atención al cliente también fue de 10.", date: new Date(Date.now() - 86400000 * 10).toISOString() }
        ];
        localStorage.setItem('store_reviews', JSON.stringify(dummyReviews));
    }
    
    renderReviewsSection();
    setupStarRating();
}

function getReviews() {
    return JSON.parse(localStorage.getItem('store_reviews')) || [];
}

function renderReviewsSection() {
    const reviews = getReviews();
    const grid = document.getElementById('reviews-grid');
    const summaryContainer = document.getElementById('reviews-summary');
    
    if (!grid || !summaryContainer) return;
    
    // Calcular media
    let totalScore = 0;
    reviews.forEach(r => totalScore += r.rating);
    const average = reviews.length > 0 ? (totalScore / reviews.length).toFixed(1) : 0;
    
    // Renderizar resumen
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.round(average)) {
            starsHtml += '<i class="fa-solid fa-star" style="color: gold;"></i>';
        } else {
            starsHtml += '<i class="fa-regular fa-star" style="color: #ccc;"></i>';
        }
    }
    
    summaryContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
            <div style="font-size: 3rem; font-weight: 900; color: var(--primary-dark); line-height: 1;">${average}</div>
            <div>
                <div style="font-size: 1.2rem; margin-bottom: 5px;">${starsHtml}</div>
                <div style="color: var(--text-muted); font-size: 0.85rem;">Basado en ${reviews.length} valoraciones</div>
            </div>
            <button class="btn btn-primary" style="margin-left: auto;" onclick="openReviewModal()">Escribir valoración</button>
        </div>
    `;
    
    // Renderizar tarjetas
    grid.innerHTML = '';
    
    // Limpiar botón previo de "Ver más" si existe
    const existingBtnContainer = document.getElementById('reviews-more-btn-container');
    if (existingBtnContainer) existingBtnContainer.remove();
    
    if (reviews.length === 0) {
        grid.innerHTML = '<p class="text-center w-100" style="color: #888; padding: 20px;">Sé el primero en dejar una valoración.</p>';
        return;
    }
    
    // Ordenar de más reciente a más antigua
    const sortedReviews = reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Paginación: Mostrar solo las 3 primeras si no se ha expandido
    window.showingAllReviews = window.showingAllReviews || false;
    const displayedReviews = window.showingAllReviews ? sortedReviews : sortedReviews.slice(0, 3);
    
    displayedReviews.forEach(r => {
        let rStars = '';
        for (let i = 1; i <= 5; i++) {
            rStars += i <= r.rating 
                ? '<i class="fa-solid fa-star" style="color: gold; font-size: 0.85rem;"></i>' 
                : '<i class="fa-regular fa-star" style="color: #ccc; font-size: 0.85rem;"></i>';
        }
        
        const dateObj = new Date(r.date);
        const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth()+1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
        
        grid.innerHTML += `
            <div class="card" style="padding: 25px; display: flex; flex-direction: column; height: 100%;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <img src="${r.avatar}" alt="${r.user}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover;">
                    <div>
                        <div style="font-weight: bold; color: var(--primary-dark);">${r.user}</div>
                        <div style="color: var(--text-muted); font-size: 0.75rem;">${dateStr}</div>
                    </div>
                </div>
                <div style="margin-bottom: 15px;">${rStars}</div>
                <p style="font-size: 0.9rem; color: #555; line-height: 1.5; flex: 1;">"${r.comment}"</p>
            </div>
        `;
    });
    
    // Añadir botón de "Ver más" o "Ver menos" si hay más de 3
    if (sortedReviews.length > 3) {
        const btnText = window.showingAllReviews ? "Ver menos" : `Ver todas (${sortedReviews.length})`;
        const btnHtml = `
            <div id="reviews-more-btn-container" style="text-align: center; margin-top: 30px; width: 100%;">
                <button class="btn btn-outline" onclick="toggleAllReviews()" style="min-width: 200px;">${btnText}</button>
            </div>
        `;
        grid.insertAdjacentHTML('afterend', btnHtml);
    }
}

function toggleAllReviews() {
    window.showingAllReviews = !window.showingAllReviews;
    renderReviewsSection();
}

function openReviewModal() {
    // Comprobar si está logueado
    if (!state.token || !state.user) {
        alert("Debes iniciar sesión para escribir una valoración.");
        if (typeof toggleLogin === 'function') {
            toggleLogin();
        }
        return;
    }
    
    // Resetear formulario
    document.getElementById('review-comment').value = '';
    window.currentSelectedRating = 0;
    updateStarSelection(0);
    
    // Mostrar modal
    const modal = document.getElementById('review-modal');
    if (modal) {
        modal.style.display = 'flex';
        // Añadir animación suave
        modal.style.opacity = '0';
        setTimeout(() => modal.style.opacity = '1', 10);
    }
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

function setupStarRating() {
    const stars = document.querySelectorAll('.review-star-select');
    window.currentSelectedRating = 0;
    
    stars.forEach(star => {
        // Hover
        star.addEventListener('mouseover', function() {
            const val = parseInt(this.dataset.value);
            updateStarHover(val);
        });
        
        // Quitar Hover
        star.addEventListener('mouseout', function() {
            updateStarHover(window.currentSelectedRating);
        });
        
        // Click
        star.addEventListener('click', function() {
            window.currentSelectedRating = parseInt(this.dataset.value);
            updateStarSelection(window.currentSelectedRating);
        });
    });
}

function updateStarHover(val) {
    const stars = document.querySelectorAll('.review-star-select');
    stars.forEach(star => {
        const starVal = parseInt(star.dataset.value);
        if (starVal <= val) {
            star.classList.remove('fa-regular');
            star.classList.add('fa-solid');
            star.style.color = 'gold';
            star.style.transform = 'scale(1.1)';
        } else {
            star.classList.remove('fa-solid');
            star.classList.add('fa-regular');
            star.style.color = '#ccc';
            star.style.transform = 'scale(1)';
        }
    });
}

function updateStarSelection(val) {
    updateStarHover(val);
}

function submitReview() {
    if (window.currentSelectedRating === 0) {
        alert("Por favor, selecciona una puntuación de 1 a 5 estrellas.");
        return;
    }
    
    const comment = document.getElementById('review-comment').value.trim();
    if (comment.length < 5) {
        alert("Por favor, escribe un comentario un poco más descriptivo (mínimo 5 caracteres).");
        return;
    }
    
    const reviews = getReviews();
    
    // Obtener datos del usuario logueado
    const userName = state.user.name || "Usuario Anónimo";
    const userAvatar = state.user.avatar 
        ? (state.user.avatar.startsWith('http') ? state.user.avatar : `http://127.0.0.1:8000/${state.user.avatar}`)
        : `https://placehold.co/100x100?text=${userName.substring(0,2).toUpperCase()}`;
        
    const newReview = {
        id: Date.now(),
        user: userName,
        avatar: userAvatar,
        rating: window.currentSelectedRating,
        comment: comment,
        date: new Date().toISOString()
    };
    
    reviews.push(newReview);
    localStorage.setItem('store_reviews', JSON.stringify(reviews));
    
    closeReviewModal();
    renderReviewsSection();
    
    // Animación de éxito (opcional)
    setTimeout(() => {
        alert("¡Gracias por tu valoración!");
    }, 300);
}
