// app.js - VERSION COMPLÈTE AVEC CARROUSEL CORRIGÉ

// ===================================================================
// CONFIGURATION EMAILJS
// ===================================================================
const EMAILJS_CONFIG = {
    SERVICE_ID: "service_rtptjt8",
    TEMPLATE_ID: "template_v4f11jf", 
    PUBLIC_KEY: "vQ03-IJuTwdIo477I"
};

// Initialisation EmailJS
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
}

// ===================================================================
// VARIABLES GLOBALES ET SÉLECTEURS DU DOM
// ===================================================================
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navbarMenu = document.getElementById('navbarMenu');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contactForm');
const body = document.body;

let _typewriterRunning = false;
let firstClickDone = false;

// ===================================================================
// INITIALISATION
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadGSAP().then(() => {
        createStaticStars();
        initializeAnimations();
        setupIntersectionObserver(); 
        setupNavigation();
        setupContactForm();
        init3DCarousel(); // NOUVEAU: Initialiser le carrousel 3D

        window.scrollTo(0, 0);
        lockPage(); 

        updateActiveNavLink();

        const btn = document.getElementById("projects-btn");
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Cliquer ici pour commencer"; 
            btn.dataset.nextText = "A mon propos ?";
        }
    });
});

// Fonction pour charger GSAP
function loadGSAP() {
    return new Promise((resolve) => {
        if (window.gsap) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
        script.onload = () => {
            const stScript = document.createElement('script');
            stScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
            stScript.onload = () => {

                const scrollToScript = document.createElement('script');
                scrollToScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollToPlugin.min.js';
                scrollToScript.onload = () => {
                    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
                    resolve();
                };

                document.head.appendChild(scrollToScript);
            };
            document.head.appendChild(stScript);
        };
        document.head.appendChild(script);
    });
}

// ===================================================================
// CARROUSEL 3D - VERSION CORRIGÉE POUR LE CLIC
// ===================================================================

function init3DCarousel() {
    const scene = document.querySelector('.scene-3d');
    const spin = document.getElementById('carousel3d');
    const cards = document.querySelectorAll('.card-3d');
    
    if (!scene || !spin || cards.length === 0) return;

    /* ========== CONFIG ========== */
    let radius = 500;
    let rotation = 0;
    const angleStep = 360 / cards.length;
    
    // Variables drag
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let dragVelocity = 0;
    let lastTime = 0;
    
    /* ========== INIT POSITIONS ========== */
    function initCarousel() {
        cards.forEach((card, i) => {
            const angle = i * angleStep;
            card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px) rotateY(-${angle}deg)`;
            card.style.transition = 'transform 0.8s';
        });
        updateRotation();
        updateActiveDot();
    }

    /* ROTATION */
    function updateRotation() {
        spin.style.transform = `translate(-50%, -50%) rotateY(${rotation}deg)`;
        updateActiveDot();
    }

    /* ========== DRAG AVEC SENSIBILITÉ RÉDUITE ========== */
    scene.addEventListener('mousedown', startDrag);
    scene.addEventListener('touchstart', startDragTouch);
    
    function startDrag(e) {
        // NE PAS démarrer le drag si on clique sur une carte
        if (e.target.closest('.card-3d')) {
            return;
        }
        
        isDragging = true;
        startX = e.clientX;
        currentX = startX;
        dragVelocity = 0;
        lastTime = Date.now();
        scene.style.cursor = 'grabbing';
        stopAutoRotation();
        e.preventDefault();
    }
    
    function startDragTouch(e) {
        if (e.touches.length === 1 && !e.target.closest('.card-3d')) {
            isDragging = true;
            startX = e.touches[0].clientX;
            currentX = startX;
            dragVelocity = 0;
            lastTime = Date.now();
            stopAutoRotation();
        }
    }
    
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('touchmove', dragMoveTouch);
    
    function dragMove(e) {
        if (!isDragging) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTime;
        
        currentX = e.clientX;
        const delta = currentX - startX;
        
        // RÉDUIT LA SENSIBILITÉ : de 0.2 à 0.1
        rotation += delta * 0.1;
        
        // Calcul de la vitesse pour l'inertie
        if (deltaTime > 0) {
            dragVelocity = delta / deltaTime;
        }
        
        updateRotation();
        startX = currentX;
        lastTime = currentTime;
    }
    
    function dragMoveTouch(e) {
        if (!isDragging || e.touches.length !== 1) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTime;
        
        currentX = e.touches[0].clientX;
        const delta = currentX - startX;
        
        // RÉDUIT LA SENSIBILITÉ : de 0.2 à 0.1
        rotation += delta * 0.1;
        
        // Calcul de la vitesse pour l'inertie
        if (deltaTime > 0) {
            dragVelocity = delta / deltaTime;
        }
        
        updateRotation();
        startX = currentX;
        lastTime = currentTime;
    }
    
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    
    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        scene.style.cursor = 'grab';
        
        // Inertie avec friction plus élevée
        const inertia = setInterval(() => {
            dragVelocity *= 0.85; // Augmente la friction de 0.92 à 0.85
            rotation += dragVelocity * 5;
            
            updateRotation();
            
            if (Math.abs(dragVelocity) < 0.05) {
                clearInterval(inertia);
                setTimeout(() => {
                    if (isAutoRotateEnabled && !isAnyCardHovered()) {
                        startAutoRotation();
                    }
                }, 500);
            }
        }, 16);
    }
    
    /* ========== VÉRIFIER SI UNE CARTE EST SURVOLÉE ========== */
    function isAnyCardHovered() {
        return Array.from(cards).some(card => {
            return card.matches(':hover') || card.classList.contains('hovered');
        });
    }
    
    /* ========== GESTION DU HOVER SUR LES CARTES ========== */
    let hoverTimeout = null;
    
    function handleCardHover(card, isHovering) {
        if (isHovering) {
            card.classList.add('hovered');
            stopAutoRotation();
            
            // Annuler tout timeout de redémarrage
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
        } else {
            card.classList.remove('hovered');
            
            // Attendre un peu avant de redémarrer la rotation
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
            
            hoverTimeout = setTimeout(() => {
                if (isAutoRotateEnabled && !isDragging && !isAnyCardHovered()) {
                    startAutoRotation();
                }
                hoverTimeout = null;
            }, 800); // Augmenté de 300 à 800 ms
        }
    }
    
    /* ========== CLIC SIMPLE POUR FLIP ========== */
    // Nettoyer d'abord tous les événements existants
    cards.forEach(card => {
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
    });
    
    // Re-sélectionner les cartes fraîches
    const freshCards = document.querySelectorAll('.card-3d');
    
    freshCards.forEach(card => {
        // Gestion du hover
        card.addEventListener('mouseenter', () => handleCardHover(card, true));
        card.addEventListener('mouseleave', () => handleCardHover(card, false));
        
        // Pour mobile/tactile
        card.addEventListener('touchstart', () => handleCardHover(card, true));
        card.addEventListener('touchend', () => {
            setTimeout(() => handleCardHover(card, false), 100);
        });
        
        // CLIC SIMPLE
        card.addEventListener('click', function(e) {
            // Ne pas flipper si on clique sur un lien ou un bouton
            const clickedLink = e.target.closest('.company-link') || 
                               e.target.closest('a') || 
                               e.target.closest('button') ||
                               e.target.closest('.tag');
            
            if (clickedLink) {
                return;
            }
            
            // Flip la carte
            this.classList.toggle('flipped');
            
            // Animation avec GSAP
            const cardInner = this.querySelector('.card-inner');
            if (cardInner) {
                gsap.to(cardInner, {
                    rotationY: this.classList.contains('flipped') ? 180 : 0,
                    duration: 0.6,
                    ease: "power2.out"
                });
            }
            
            e.stopPropagation();
        });
        
        // Accessibilité
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.classList.toggle('flipped');
                const cardInner = this.querySelector('.card-inner');
                if (cardInner) {
                    gsap.to(cardInner, {
                        rotationY: this.classList.contains('flipped') ? 180 : 0,
                        duration: 0.6,
                        ease: "power2.out"
                    });
                }
            }
        });
    });

    /* ========== ROTATION AUTO ========== */
    let autoRotateInterval = null;
    let isAutoRotateEnabled = true;
    const autoRotateToggle = document.getElementById('autoRotateToggle');

    function startAutoRotation() {
        if (!isAutoRotateEnabled || isDragging || isAnyCardHovered()) return;
        stopAutoRotation();
        autoRotateInterval = setInterval(() => {
            if (!isDragging && !isAnyCardHovered()) {
                rotation -= 0.15; // Réduit la vitesse de rotation auto
                updateRotation();
            }
        }, 20); // Augmente l'intervalle de 16 à 20 ms
    }

    function stopAutoRotation() {
        if (autoRotateInterval) {
            clearInterval(autoRotateInterval);
            autoRotateInterval = null;
        }
    }

    if (autoRotateToggle) {
        autoRotateToggle.addEventListener('change', function() {
            isAutoRotateEnabled = this.checked;
            if (isAutoRotateEnabled && !isDragging && !isAnyCardHovered()) {
                startAutoRotation();
            } else {
                stopAutoRotation();
            }
        });
    }

    /* ========== NAVIGATION ========== */
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dots = document.querySelectorAll('.dot');

    function updateActiveDot() {
        let normalizedAngle = ((rotation % 360) + 360) % 360;
        const activeIndex = Math.round(normalizedAngle / angleStep) % cards.length;
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoRotation();
            rotation += angleStep;
            updateRotation();
            setTimeout(() => {
                if (isAutoRotateEnabled && !isAnyCardHovered()) startAutoRotation();
            }, 3000); // Augmenté de 2000 à 3000 ms
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoRotation();
            rotation -= angleStep;
            updateRotation();
            setTimeout(() => {
                if (isAutoRotateEnabled && !isAnyCardHovered()) startAutoRotation();
            }, 3000); // Augmenté de 2000 à 3000 ms
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopAutoRotation();
            rotation = -index * angleStep;
            updateRotation();
            setTimeout(() => {
                if (isAutoRotateEnabled && !isAnyCardHovered()) startAutoRotation();
            }, 3000); // Augmenté de 2000 à 3000 ms
        });
    });

    /* ========== INIT ========== */
    function initComplete() {
        initCarousel();
        
        // Animation d'entrée
        gsap.from(cards, {
            scale: 0,
            rotationY: (i) => i * 60,
            duration: 1,
            stagger: 0.1,
            ease: "back.out(1.5)",
            delay: 0.3
        });
        
        // Rotation auto après délai
        setTimeout(() => {
            if (isAutoRotateEnabled) startAutoRotation();
        }, 2000); // Augmenté de 1500 à 2000 ms
    }

    initComplete();
    
    /* ========== PAUSE GÉNÉRALE SUR LA SCÈNE ========== */
    scene.addEventListener('mouseenter', stopAutoRotation);
    scene.addEventListener('mouseleave', () => {
        if (isAutoRotateEnabled && !isDragging && !isAnyCardHovered()) {
            setTimeout(startAutoRotation, 1000); // Augmenté de 500 à 1000 ms
        }
    });
}

// ===================================================================
// ANIMATIONS GSAP (conservées)
// ===================================================================
function initializeAnimations() {
    // Animation du navbar au scroll
    gsap.to('.navbar', {
        y: -100,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
        scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            toggleActions: "play reverse play reverse"
        }
    });

    // Animation des sections au scroll
    gsap.utils.toArray('.section').forEach(section => {
        gsap.fromTo(section, {
            y: 80,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: section,
                start: "top 85%",
                end: "bottom 20%",
                toggleActions: "play none none none"
            }
        });
    });

    // Animation des cartes de compétences
    gsap.utils.toArray('.skill-category').forEach(card => {
        gsap.fromTo(card, {
            scale: 0.8,
            opacity: 0,
            y: 50
        }, {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "back.out(1.2)",
            scrollTrigger: {
                trigger: card,
                start: "top 90%",
                end: "bottom 10%",
                toggleActions: "play none none none"
            }
        });
    });

    // Animation de la photo de profil
    gsap.from('.profile-photo', {
        scale: 0,
        rotation: 360,
        duration: 1.5,
        ease: "back.out(1.7)",
        delay: 0.5
    });

    // Animation des liens sociaux
    gsap.utils.toArray('.social-link').forEach((link, i) => {
        gsap.fromTo(link, {
            x: -50,
            opacity: 0
        }, {
            x: 0,
            opacity: 1,
            duration: 0.6,
            delay: i * 0.2,
            scrollTrigger: {
                trigger: link,
                start: "top 90%",
                toggleActions: "play none none none"
            }
        });
    });
}

// ===================================================================
// NAVIGATION CORRIGÉE
// ===================================================================
function setupNavigation() {
    // Menu mobile
    if (mobileMenuToggle && navbarMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navbarMenu.classList.toggle('active');
            body.classList.toggle('no-scroll');
        });
    }

    // Navigation par ancres
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                
                // Fermer le menu mobile si ouvert
                if (mobileMenuToggle && navbarMenu) {
                    mobileMenuToggle.classList.remove('active');
                    navbarMenu.classList.remove('active');
                    body.classList.remove('no-scroll');
                }
                
                // Scroll vers la section
                const sectionId = href.substring(1);
                scrollToSection(sectionId);
            }
        });
    });
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
 
    const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 70;
    const targetPosition = el.offsetTop - navbarHeight;

    gsap.to(window, {
        duration: 1,
        scrollTo: { y: targetPosition, autoKill: false },
        ease: "power2.inOut",
        onComplete: updateActiveNavLink
    });
}

// ===================================================================
// GESTION DU PREMIER CLIC
// ===================================================================
function setupFirstClick() {
    const btn = document.getElementById("projects-btn");
    if (!btn) return;

    btn.addEventListener("click", (e) => {
        e.preventDefault();
        
        if (btn.disabled) return;

        if (!firstClickDone) {
            firstClickDone = true;
            
            // Animation du bouton au premier clic
            gsap.to(btn, {
                scale: 0.9,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut",
                onComplete: () => {
                    unlockPage();
                    btn.disabled = true;
                    
                    const sound = document.getElementById("typing-sound");
                    if (sound) {
                        sound.play().catch(()=>{});
                        sound.pause();
                        sound.currentTime = 0;
                    }

                    typewriterEffect();
                }
            });
            return;
        }

        // Après le premier clic, scroll vers "apropos"
        gsap.to(btn, {
            scale: 0.8,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => {
                scrollToSection('apropos');
                gsap.to(btn, {
                    scale: 1,
                    duration: 0.3,
                    ease: "back.out(1.7)"
                });
            }
        });
    });
}

function lockPage() {
    body.classList.add('no-scroll');
    navLinks.forEach(link => {
        if (link.id !== "projects-btn") {
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.5';
        }
    });
}

function unlockPage() {
    body.classList.remove('no-scroll');
    navLinks.forEach(link => {
        link.style.pointerEvents = 'auto';
        link.style.opacity = '1';
    });

    gsap.to('body', {
        background: 'linear-gradient(346deg, rgba(253, 217, 235, 1) 30%, rgba(253, 198, 225, 1) 49%)',
        duration: 1,
        ease: "power2.out",
        onComplete: updateActiveNavLink
    });
}

function typewriterEffect() {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;

    const sound = document.getElementById('typing-sound');
    const text = subtitle.dataset.fulltext || "";

    subtitle.textContent = "";
    subtitle.classList.remove('caret');

    let i = 0;
    _typewriterRunning = true;

    const interval = setInterval(() => {
        if (i < text.length) {
            subtitle.textContent += text.charAt(i);

            if (sound) {
                sound.pause();
                sound.currentTime = 0;
                sound.play().catch(()=>{});
            }

            i++;
        } else {
            clearInterval(interval);
            _typewriterRunning = false;

            if (sound) {
                sound.pause();
                sound.currentTime = 0;
            }

            subtitle.classList.add('caret');
            animateHeroAfterClick();

            const btn = document.getElementById("projects-btn");
            if (btn) {
                btn.disabled = false;
                btn.textContent = btn.dataset.nextText;
                
                gsap.to(btn, {
                    scale: 1.05,
                    duration: 0.3,
                    repeat: 3,
                    yoyo: true,
                    ease: "power2.inOut"
                });
            }
        }
    }, 100);
}

function animateHeroAfterClick() {
    const tl = gsap.timeline();
    
    tl.to('.hero-subtitle', {
        textShadow: '0 0 20px var(--color-neon-pink), 0 0 40px var(--color-neon-pink)',
        duration: 0.5,
        ease: "power2.out"
    })
    .to('.hero-cta', {
        scale: 1.1,
        boxShadow: '0 0 30px rgba(255, 0, 255, 0.8)',
        duration: 0.3,
        ease: "power2.out"
    }, '-=0.2')
    .to('.hero-cta', {
        scale: 1,
        boxShadow: '0 8px 25px rgba(255, 0, 255, 0.4)',
        duration: 0.3,
        ease: "power2.inOut"
    });
}

// ===================================================================
// FORMULAIRE DE CONTACT
// ===================================================================
function setupContactForm() {
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const message = formData.get('message')?.trim();

    clearFormErrors();
    let hasErrors = false;
    
    if (!name) { showFieldError('name', 'Le nom est requis'); hasErrors = true; }
    if (!email) { showFieldError('email', 'L\'email est requis'); hasErrors = true; }
    else if (!validateEmail(email)) { showFieldError('email', 'Veuillez entrer une adresse e-mail valide'); hasErrors = true; }
    if (!message) { showFieldError('message', 'Le message est requis'); hasErrors = true; }

    if (hasErrors) {
        showNotification('Veuillez corriger les erreurs ci-dessous et réessayer.', 'error');
        return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    gsap.to(submitButton, {
        scale: 0.95,
        duration: 0.2,
        ease: "power2.inOut"
    });

    submitButton.textContent = 'Envoi...';
    submitButton.disabled = true;
    submitButton.style.opacity = '0.7';

    emailjs.sendForm(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, "#contactForm")
        .then((response) => {
            console.log('EmailJS SUCCESS:', response.status, response.text);
            showNotification('Merci pour votre message ! Je vous répondrai bientôt. 💕', 'success');
            contactForm.reset();
            
            gsap.to(submitButton, {
                scale: 1,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        }, (error) => {
            console.error('EmailJS FAILED:', error);
            showNotification('Échec de l\'envoi. Réessayez plus tard ou contactez-moi directement.', 'error');
            
            gsap.to(submitButton, {
                x: 10,
                duration: 0.1,
                repeat: 3,
                yoyo: true,
                ease: "power2.inOut"
            });
        })
        .finally(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            gsap.to(submitButton, {
                x: 0,
                scale: 1,
                duration: 0.3
            });
        });
}

// ===================================================================
// FONCTIONS UTILITAIRES
// ===================================================================
function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (!field) return;
    field.classList.add('error');
    const existing = field.parentElement.querySelector('.field-error');
    if (existing) existing.remove();
    const err = document.createElement('div');
    err.className = 'field-error';
    err.textContent = message;
    field.parentElement.appendChild(err);
    
    gsap.fromTo(field, {
        x: 10
    }, {
        x: 0,
        duration: 0.3,
        ease: "power2.out"
    });
}

function clearFormErrors() {
    if (!contactForm) return;
    contactForm.querySelectorAll('.form-control.error').forEach(f => f.classList.remove('error'));
    contactForm.querySelectorAll('.field-error').forEach(m => m.remove());
}

function validateEmail(email){ 
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    return re.test(email); 
}

function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => { 
        n.style.transform = 'translateX(100%)'; 
        setTimeout(()=>n.remove(),300); 
    });
    
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close"><span>&times;</span></button>
        </div>
    `;
    document.body.appendChild(notification);
    
    if (!document.querySelector('#notification-styles')) addNotificationStyles();
    
    gsap.fromTo(notification, {
        x: 300,
        opacity: 0
    }, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(1.2)"
    });
    
    notification.querySelector('.notification-close').addEventListener('click', function() {
        gsap.to(notification, {
            x: 300,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => notification.remove()
        });
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            gsap.to(notification, {
                x: 300,
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => notification.remove()
            });
        }
    }, 6000);
}

function addNotificationStyles(){
    const s = document.createElement('style');
    s.id = 'notification-styles';
    s.textContent = `
        .notification {
            position: fixed; top: 20px; right: 20px; z-index: 9999;
            transform: translateX(100%); 
            max-width: 300px; background-color: #fff; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-left: 5px solid;
            font-family: sans-serif;
        }
        .notification--success { border-left-color: #4CAF50; }
        .notification--error { border-left-color: #F44336; }
        .notification--info { border-left-color: #2196F3; }
        .notification-content { padding: 12px 10px; display: flex; align-items: center; justify-content: space-between; }
        .notification-message { flex-grow: 1; margin-right: 10px; color: #333; font-size: 14px; }
        .notification-close { background: none; border: none; cursor: pointer; font-size: 1.2em; color: #999; line-height: 1; padding: 0; }
        .notification-close:hover { color: #555; }
        .field-error { color: #F44336; font-size: 0.85em; margin-top: 5px; }
        .form-control.error { border-color: #F44336 !important; }
    `;
    document.head.appendChild(s);
}

function setupIntersectionObserver() {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.skill-category');
    animatedElements.forEach(el => observer.observe(el));
}

function updateActiveNavLink(){
    if (body.classList.contains('no-scroll')) return; 
    
    const sections = document.querySelectorAll('.section');
    const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 70;
    let current = '';
    const scrollPosition = window.pageYOffset + navbarHeight + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${current}`) {
             link.classList.add('active');
        }
    });
}

// ===================================================================
// ÉVÉNEMENTS
// ===================================================================
window.addEventListener('scroll', updateActiveNavLink);

window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mobileMenuToggle) {
        mobileMenuToggle.classList.remove('active');
        if (navbarMenu) navbarMenu.classList.remove('active');
    }
});

// Initialiser le premier clic après le DOM
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        setupFirstClick();
    }, 100);
});

// Loader
window.addEventListener('load', () => {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <p>Loading Portfolio...</p>
        </div>
    `;
    const loaderStyles = document.createElement('style');
    loaderStyles.id = 'loader-styles';
    loaderStyles.textContent = `
        .page-loader { position: fixed; top:0; left:0; width:100%; height:100%; background: linear-gradient(135deg,#FFF8DC 0%,#E6E6FA 100%); display:flex; justify-content:center; align-items:center; z-index:10000; opacity:1; transition:opacity .5s ease;}
        .loader-content { text-align:center; color:#DDA0DD; font-family: var(--font-family-base); }
        .loader-spinner { width:50px; height:50px; border:3px solid rgba(221,160,221,0.3); border-top:3px solid #DDA0DD; border-radius:50%; animation: spin 1s linear infinite; margin:0 auto 16px;}
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
        .page-loader.fade-out { opacity: 0; pointer-events:none; }
    `;
    document.head.appendChild(loaderStyles);
    document.body.appendChild(loader);

    setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(()=>{ 
            if (loader.parentNode) loader.remove(); 
            if (loaderStyles.parentNode) loaderStyles.remove(); 
        }, 500);
    }, 1500);
});

// Easter egg
let clickCount = 0;
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('profile-photo') || e.target.classList.contains('profile-avatar')) {
        clickCount++;
        
        gsap.to(e.target, {
            scale: 0.9,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut"
        });
        
        if (clickCount === 5) {
            showNotification('🎉 You found the secret! Thanks for clicking my avatar 5 times!', 'success');
            
            gsap.to(e.target, {
                rotation: 360,
                scale: 1.2,
                duration: 1,
                ease: "back.out(1.7)",
                onComplete: () => {
                    gsap.to(e.target, {
                        rotation: 0,
                        scale: 1,
                        duration: 0.5
                    });
                }
            });
            
            clickCount = 0;
        }
    }
});

// ===================================================================
// FOND ÉTOILÉ STATIQUE
// ===================================================================
function createStaticStars() {
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars-background';
    document.body.appendChild(starsContainer);
  
    const starCount = 150;
  
    for (let i = 0; i < starCount; i++) {
      createStar(starsContainer);
    }
  
    createHeroStars();
  }
  
  function createStar(container) {
    const star = document.createElement('div');
    star.className = 'star';
    
    const sizes = ['small', 'medium', 'large'];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    star.classList.add(size);
    
    const colorRoll = Math.random();
    if (colorRoll < 0.7) {
      star.classList.add('color-4');
    } else if (colorRoll < 0.8) {
      star.classList.add('color-1');
    } else if (colorRoll < 0.9) {
      star.classList.add('color-2');
    } else {
      star.classList.add('color-3');
    }
    
    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;
    
    if (Math.random() < 0.3) {
      star.classList.add('pulse');
      star.style.animationDelay = `${Math.random() * 5}s`;
    }
    
    container.appendChild(star);
  }
  
  function createHeroStars() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
  
    const heroStars = document.createElement('div');
    heroStars.className = 'stars-background';
    heroStars.style.opacity = '0.6';
    hero.appendChild(heroStars);
  
    const heroStarCount = 80;
    
    for (let i = 0; i < heroStarCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      
      const sizes = ['small', 'medium', 'large'];
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      star.classList.add(size);
      
      const colors = ['color-1', 'color-2', 'color-3', 'color-4'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      star.classList.add(color);
      
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      
      if (Math.random() < 0.5) {
        star.classList.add('pulse');
        star.style.animationDelay = `${Math.random() * 4}s`;
      }
      
      heroStars.appendChild(star);
    }
  }