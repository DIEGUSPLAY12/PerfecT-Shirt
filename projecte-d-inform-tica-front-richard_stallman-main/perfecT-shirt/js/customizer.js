// js/customizer.js

let basePrice = 54.99;
let patchPrice = 0;
let currentSize = 'L';
let currentColor = '#ffffff';
let currentPattern = 'none';

document.addEventListener('DOMContentLoaded', () => {
    updatePrice();
    
    // Bloqueo estricto a 2 dígitos para el número
    const numInput = document.getElementById('in-num');
    if (numInput) {
        numInput.addEventListener('input', function() {
            if (this.value.length > 2) this.value = this.value.slice(0, 2);
            updateText();
        });
    }
});

// Cambia entre vista delantera y trasera usando transformaciones 3D
function switchView(side) {
    const obj = document.getElementById('tshirt-obj');
    const btnFront = document.getElementById('btn-view-front');
    const btnBack = document.getElementById('btn-view-back');

    if (side === 'front') {
        if(obj) obj.style.transform = 'rotateY(0deg)';
        if(btnFront) btnFront.classList.add('active');
        if(btnBack) btnBack.classList.remove('active');
    } else {
        if(obj) obj.style.transform = 'rotateY(180deg)';
        if(btnFront) btnFront.classList.remove('active');
        if(btnBack) btnBack.classList.add('active');
    }
}

// Aplica el color a todas las mallas y calcula el contraste (blanco/negro)
function changeColor(bgColor, textColor, btnEl) {
    // 1. Pinto la malla base
    document.querySelectorAll('.shirt-base').forEach(path => path.style.fill = bgColor);
    
    // 2. Modifico los colores de la vista trasera (dorsal) usando fill porque son elementos SVG
    document.querySelectorAll('.p-name').forEach(el => el.style.fill = textColor);
    document.querySelectorAll('.p-number').forEach(el => el.style.fill = textColor);
    
    // 3. Modifico el patrocinador delantero para que nunca sea invisible
    document.querySelectorAll('.sponsor-text').forEach(el => {
        if (el.tagName.toLowerCase() === 'image') {
            if (textColor === '#ffffff') {
                el.style.filter = 'brightness(0) invert(1)';
            } else {
                el.style.filter = 'none';
            }
        } else {
            el.style.fill = textColor;
        }
    });
    
    // 4. Controles visuales
    document.querySelectorAll('.color-swatch-pro').forEach(b => b.classList.remove('active'));
    if(btnEl) btnEl.classList.add('active');
    currentColor = bgColor;
}

// Controla las rayas garantizando que la máscara HTML oculte el cuello
function changePattern(type, label, btnEl) {
    const patternFront = document.querySelector('#wrapper-front .shirt-pattern-overlay');
    const patternBack = document.querySelector('#wrapper-back .shirt-pattern-overlay');
    
    const fillValue = (type === 'none') ? 'transparent' : 
                     (type === 'vertical') ? 'url(#pattern-v-front)' : 'url(#pattern-h-front)';
    const fillValueBack = (type === 'none') ? 'transparent' : 
                         (type === 'vertical') ? 'url(#pattern-v-back)' : 'url(#pattern-h-back)';

    if(patternFront) patternFront.style.fill = fillValue;
    if(patternBack) patternBack.style.fill = fillValueBack;

    // Ocultar sombras y brillos del torso cuando hay patrón para que resalte
    const torsoShadows = document.querySelectorAll('.torso-shadow');
    if (type !== 'none') {
        torsoShadows.forEach(el => el.style.opacity = '0');
    } else {
        torsoShadows.forEach(el => el.style.opacity = '1');
    }

    document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
    if(btnEl) btnEl.classList.add('active');
    
    const sumPattern = document.getElementById('sum-pattern');
    if(sumPattern) sumPattern.innerText = label;
}

// Rellena el textContent simultáneamente en los elementos correspondientes
function updateText() {
    let nameVal = document.getElementById('in-name').value;
    let numVal = document.getElementById('in-num').value;
    
    if(!nameVal.trim()) nameVal = 'NOMBRE';
    if(!numVal.trim()) numVal = '10';
    
    document.querySelectorAll('.p-name').forEach(el => {
        el.textContent = nameVal.toUpperCase();
        
        // Ajuste dinámico de la fuente para que nombres muy largos no se salgan a las mangas
        if (nameVal.length > 12) {
            el.setAttribute('font-size', '14');
        } else if (nameVal.length > 9) {
            el.setAttribute('font-size', '18');
        } else if (nameVal.length > 6) {
            el.setAttribute('font-size', '22');
        } else {
            el.setAttribute('font-size', '26');
        }
    });
    
    document.querySelectorAll('.p-number').forEach(el => el.textContent = numVal);
}

function selectOption(cat, price, label, btnEl) {
    if (cat === 'patch') {
        patchPrice = price;
        const sumPatch = document.getElementById('sum-patch');
        if(sumPatch) sumPatch.innerText = label;
        document.querySelectorAll('.patch-btn').forEach(b => b.classList.remove('active'));
    }
    if(btnEl) btnEl.classList.add('active');
    updatePrice();
}

function selectSize(size, btnEl) {
    currentSize = size;
    const sumSize = document.getElementById('sum-size');
    if(sumSize) sumSize.innerText = size;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    if(btnEl) btnEl.classList.add('active');
}

function updatePrice() {
    const total = basePrice + patchPrice;
    const converted = typeof convertPrice === 'function' ? convertPrice(total) : total;
    const sym = typeof getCurrencySymbol === 'function' ? getCurrencySymbol() : '€';
    const el = document.getElementById('total-price');
    if(el) el.innerText = converted.toFixed(2) + ' ' + sym;
}

function addCustomToCart() {
    const finalPrice = basePrice + patchPrice;
    const desc = `Custom (${currentSize}) - ${currentColor}`;
    if (typeof addToCart === 'function') {
        addToCart(desc, finalPrice, '../img/escudos/cami.png');
        toggleSidebar('cart-modal');
    }

    // Feedback visual en el botón
    const btn = document.querySelector('.checkout-box .btn-primary');
    if (btn) {
        const originalText = btn.innerHTML;
        const originalBg = btn.style.background;
        
        btn.innerHTML = '<i class="fa-solid fa-check"></i> ¡AÑADIDO CON ÉXITO!';
        btn.style.background = '#10b981'; // Color verde éxito
        btn.style.borderColor = '#10b981';
        btn.style.pointerEvents = 'none';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = originalBg;
            btn.style.borderColor = '';
            btn.style.pointerEvents = 'auto';
        }, 2500);
    }
}