// app.js - VERSION COMPLÈTE AVEC EMAILJS FONCTIONNEL

// ===================================================================
// CONFIGURATION EMAILJS
// ===================================================================
const EMAILJS_CONFIG = {
    SERVICE_ID: "service_ec073qm",        // À remplacer par VOTRE Service ID
    TEMPLATE_ID: "template_v4f11jf",      // À remplacer par VOTRE Template ID
    PUBLIC_KEY: "UcMPljYtBqjKMc-Ea"       // À remplacer par VOTRE Public Key
};

// Initialisation EmailJS
(function initializeEmailJS() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        console.log("✅ EmailJS initialisé");
    } else {
        console.warn("⚠️ EmailJS non chargé - vérifiez le CDN dans index.html");
    }
})();

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
        init3DCarousel();

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
// CARROUSEL 3D - VERSION AVEC ROTATION CORRECTE
// ===================================================================
function init3DCarousel() {
    const scene = document.querySelector('.scene-3d');
    const spin = document.getElementById('carousel3d');
    const cards = document.querySelectorAll('.card-3d');
    
    if (!scene || !spin || cards.length === 0) return;

    /* ========== CONFIG ========== */
    let radius = calculateRadius();
    let rotation = 0;
    const angleStep = 360 / cards.length;
    
    // Variables drag
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let dragVelocity = 0;
    let lastTime = 0;
    let lastFrameTime = 0;
    let inertiaAnimationId = null;
    
    /* ========== CALCUL RADIUS RESPONSIVE ========== */
    function calculateRadius() {
        const width = window.innerWidth;
        if (width < 576) return 220;
        if (width < 768) return 280;
        if (width < 992) return 350;
        if (width < 1200) return 400;
        return 450;
    }

    /* ========== FLOU DYNAMIQUE CORRIGÉ ========== */
    function updateDepthBlur() {
        const cards = document.querySelectorAll('.card-3d');
        const totalCards = cards.length;
        
        // Calculer l'angle normalisé de rotation
        let normalizedAngle = ((rotation % 360) + 360) % 360;
        
        cards.forEach((card, index) => {
            // Calculer l'angle théorique de cette carte dans la configuration actuelle
            const cardAngle = (index * angleStep + normalizedAngle) % 360;
            
            // Calculer la distance angulaire par rapport à la position "face à nous" (0°)
            let angleDiff = Math.abs(cardAngle);
            angleDiff = Math.min(angleDiff, 360 - angleDiff);
            
            // Convertir en distance (0 = face, 180 = dos)
            const distance = angleDiff / 180;
            
            // Calculer les effets visuels
            let blurAmount, brightness, opacityValue;
            
            if (angleDiff <= 10) {
                blurAmount = 0;
                brightness = 1;
                opacityValue = 1;
                card.style.zIndex = '30';
            } else if (angleDiff <= 90) {
                blurAmount = Math.min(angleDiff / 20, 2);
                brightness = 1 - (angleDiff / 200);
                opacityValue = 1 - (angleDiff / 400);
                card.style.zIndex = '20';
            } else if (angleDiff <= 150) {
                blurAmount = Math.min(angleDiff / 15, 4);
                brightness = 0.9 - (angleDiff / 300);
                opacityValue = 0.9 - (angleDiff / 600);
                card.style.zIndex = '10';
            } else {
                blurAmount = Math.min(angleDiff / 10, 6);
                brightness = 0.8 - (angleDiff / 400);
                opacityValue = 0.7 - (angleDiff / 800);
                card.style.zIndex = '5';
            }
            
            // Appliquer les styles
            card.style.filter = `blur(${blurAmount}px) brightness(${brightness})`;
            card.style.opacity = opacityValue.toFixed(2);
            card.style.transition = 'filter 0.6s ease, opacity 0.6s ease';
            
            // Toujours garder les cartes flipées nettes
            if (card.classList.contains('flipped')) {
                card.style.filter = 'blur(0px) brightness(1)';
                card.style.opacity = '1';
                card.style.zIndex = '100';
            }
        });
    }

    /* ========== INIT POSITIONS CORRIGÉE ========== */
    function initCarousel() {
        cards.forEach((card, i) => {
            const angle = i * angleStep;
            card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
            card.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });
        updateRotation();
        updateActiveDot();
        updateDepthBlur();
    }

    /* ========== ROTATION ========== */
    function updateRotation() {
        spin.style.transform = `translate(-50%, -50%) rotateY(${rotation}deg)`;
        updateActiveDot();
        updateDepthBlur();
    }

    /* ========== GESTION DU REDIMENSIONNEMENT ========== */
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            radius = calculateRadius();
            initCarousel();
        }, 250);
    });

    /* ========== DRAG ET TOUCH ========== */
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (window.innerWidth <= 768 && 'ontouchstart' in window);
    }

    function startDrag(e) {
        if (e.target.closest('.card-3d')) return;
        
        isDragging = true;
        startX = e.clientX;
        currentX = startX;
        dragVelocity = 0;
        lastTime = Date.now();
        scene.style.cursor = 'grabbing';
        scene.classList.add('dragging');
        
        if (inertiaAnimationId) {
            cancelAnimationFrame(inertiaAnimationId);
            inertiaAnimationId = null;
        }
    }

    function startDragTouch(e) {
        if (e.touches.length === 1 && !e.target.closest('.card-3d')) {
            isDragging = true;
            startX = e.touches[0].clientX;
            currentX = startX;
            dragVelocity = 0;
            lastTime = Date.now();
            scene.classList.add('dragging');
            
            if (inertiaAnimationId) {
                cancelAnimationFrame(inertiaAnimationId);
                inertiaAnimationId = null;
            }
        }
    }

    function dragMove(e) {
        if (!isDragging) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTime;
        currentX = e.clientX;
        const delta = currentX - startX;
        
        const sensitivity = isMobileDevice() ? 0.25 : 0.15;
        rotation += delta * sensitivity;
        
        if (deltaTime > 0) {
            dragVelocity = delta / deltaTime;
        }
        
        updateRotation();
        startX = currentX;
        lastTime = currentTime;
        e.preventDefault();
    }

    function dragMoveTouch(e) {
        if (!isDragging || e.touches.length !== 1) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTime;
        currentX = e.touches[0].clientX;
        const delta = currentX - startX;
        
        const sensitivity = isMobileDevice() ? 0.3 : 0.15;
        rotation += delta * sensitivity;
        
        if (deltaTime > 0) {
            dragVelocity = delta / deltaTime;
        }
        
        updateRotation();
        startX = currentX;
        lastTime = currentTime;
        e.preventDefault();
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        scene.style.cursor = 'grab';
        scene.classList.remove('dragging');
        
        lastFrameTime = Date.now();
        
        function applyInertia() {
            const now = Date.now();
            const deltaTime = now - lastFrameTime;
            
            if (Math.abs(dragVelocity) < 0.01 || deltaTime === 0) {
                inertiaAnimationId = null;
                return;
            }
            
            const friction = isMobileDevice() ? 0.92 : 0.85;
            dragVelocity *= Math.pow(friction, deltaTime / 16);
            
            const inertiaPower = isMobileDevice() ? 3 : 4;
            rotation += dragVelocity * inertiaPower * (deltaTime / 16);
            
            updateRotation();
            lastFrameTime = now;
            
            inertiaAnimationId = requestAnimationFrame(applyInertia);
        }
        
        inertiaAnimationId = requestAnimationFrame(applyInertia);
    }

    /* ========== ÉVÉNEMENTS ========== */
    scene.addEventListener('mousedown', startDrag);
    scene.addEventListener('touchstart', startDragTouch, { passive: true });
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('touchmove', dragMoveTouch, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);

    /* ========== NAVIGATION AVEC FLÈCHES ========== */
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dots = document.querySelectorAll('.dot');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            rotation += angleStep;
            updateRotation();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            rotation -= angleStep;
            updateRotation();
        });
    }
    
    // Navigation par points
    dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            rotation = -index * angleStep;
            updateRotation();
        });
    });

    /* ========== CLAVIER ========== */
    document.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                rotation += angleStep;
                updateRotation();
                break;
            case 'ArrowRight':
                e.preventDefault();
                rotation -= angleStep;
                updateRotation();
                break;
            case ' ':
                e.preventDefault();
                const activeCard = document.querySelector('.card-3d[data-index="0"]');
                if (activeCard) activeCard.click();
                break;
        }
    });

    /* ========== CLIC POUR FLIP ========== */
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            const clickedLink = e.target.closest('.company-link') || 
                               e.target.closest('a') || 
                               e.target.closest('button') ||
                               e.target.closest('.tag') ||
                               e.target.closest('.flip-hint');
            
            if (clickedLink) return;
            
            // Toggle flip
            this.classList.toggle('flipped');
            
            // Animation
            const cardInner = this.querySelector('.card-inner');
            if (cardInner) {
                const targetRotation = this.classList.contains('flipped') ? 180 : 0;
                gsap.to(cardInner, {
                    rotationY: targetRotation,
                    duration: 0.6,
                    ease: "power2.out",
                    onComplete: () => {
                        if (this.classList.contains('flipped')) {
                            this.style.zIndex = "200";
                        } else {
                            this.style.zIndex = "";
                        }
                        updateDepthBlur();
                    }
                });
            }
            
            e.stopPropagation();
        });
    });

    /* ========== POINTS INDICATEURS ========== */
    function updateActiveDot() {
        let normalizedAngle = ((rotation % 360) + 360) % 360;
        const activeIndex = Math.round(normalizedAngle / angleStep) % cards.length;
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }

    /* ========== INITIALISATION FINALE ========== */
    // Animation d'entrée améliorée
    gsap.fromTo(cards, {
        scale: 0,
        rotationY: (i) => i * 60,
        filter: 'blur(20px)',
        opacity: 0
    }, {
        scale: 1,
        rotationY: (i) => i * 60,
        filter: 'blur(0px)',
        opacity: 1,
        duration: 1.5,
        stagger: {
            each: 0.2,
            from: "center",
            ease: "back.out(2)"
        },
        delay: 0.5,
        onComplete: () => {
            cards.forEach((card, i) => {
                const angle = i * angleStep;
                card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
            });
            updateDepthBlur();
            
            // Petit effet de pulse sur la carte centrale
            gsap.to(cards[0], {
                scale: 1.05,
                duration: 0.5,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
            });
        }
    });

    // Initialiser le carrousel
    initCarousel();
}

/* ========== TOGGLE FLOU ========== */
const blurToggle = document.getElementById('blurToggle');
if (blurToggle) {
    let blurEnabled = true;
    
    blurToggle.addEventListener('click', function() {
        blurEnabled = !blurEnabled;
        this.classList.toggle('active', blurEnabled);
        
        const cards = document.querySelectorAll('.card-3d');
        
        if (blurEnabled) {
            updateDepthBlur();
        } else {
            cards.forEach(card => {
                card.style.filter = 'blur(0px) brightness(1)';
                card.style.opacity = '1';
                card.style.transition = 'filter 0.3s ease, opacity 0.3s ease';
            });
        }
    });
}

// ===================================================================
// ANIMATIONS GSAP
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
// FORMULAIRE DE CONTACT AVEC EMAILJS
// ===================================================================
function setupContactForm() {
    if (contactForm) {
        console.log("📝 Formulaire de contact trouvé");
        contactForm.addEventListener('submit', handleFormSubmit);
    } else {
        console.warn("⚠️ Formulaire de contact non trouvé");
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    console.log("📤 Soumission du formulaire détectée");
    
    // Récupérer les valeurs
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Validation
    clearFormErrors();
    let hasErrors = false;
    
    if (!name) { 
        showFieldError('name', 'Le nom est requis'); 
        hasErrors = true; 
    }
    
    if (!email) { 
        showFieldError('email', 'L\'email est requis'); 
        hasErrors = true; 
    } else if (!validateEmail(email)) { 
        showFieldError('email', 'Email invalide'); 
        hasErrors = true; 
    }
    
    if (!message) { 
        showFieldError('message', 'Le message est requis'); 
        hasErrors = true; 
    }
    
    if (hasErrors) {
        showNotification('❌ Veuillez corriger les erreurs', 'error');
        return;
    }
    
    // Désactiver le bouton
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Envoi en cours...';
    submitButton.disabled = true;
    submitButton.style.opacity = '0.7';
    
    // Préparer les données
    const templateParams = {
        from_name: name,
        from_email: email,
        message: message,
        to_email: "ashramino02@gmail.com",
        reply_to: email
    };
    
    console.log("📧 Envoi avec EmailJS:", templateParams);
    
    // Vérifier qu'EmailJS est disponible
    if (typeof emailjs === 'undefined') {
        showNotification('❌ EmailJS non chargé', 'error');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
        return;
    }
    
    // Envoyer l'email
    emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
    )
    .then((response) => {
        console.log('✅ Email envoyé!', response.status, response.text);
        showNotification('🎉 Message envoyé avec succès! Je vous répondrai bientôt.', 'success');
        contactForm.reset();
        
        // Animation de succès
        gsap.to(submitButton, {
            backgroundColor: '#4CAF50',
            color: 'white',
            duration: 0.3,
            onComplete: () => {
                setTimeout(() => {
                    gsap.to(submitButton, {
                        backgroundColor: '',
                        color: '',
                        duration: 0.3
                    });
                }, 2000);
            }
        });
    })
    .catch((error) => {
        console.error('❌ Erreur EmailJS:', error);
        showNotification('❌ Erreur d\'envoi: ' + (error.text || 'Veuillez réessayer'), 'error');
        
        // Animation d'erreur
        gsap.to(submitButton, {
            backgroundColor: '#F44336',
            color: 'white',
            duration: 0.3,
            yoyo: true,
            repeat: 1
        });
    })
    .finally(() => {
        // Réactiver le bouton
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
    });
}

// ===================================================================
// FONCTIONS UTILITAIRES
// ===================================================================
function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (!field) return;
    
    field.classList.add('error');
    
    // Supprimer l'erreur existante
    const existing = field.parentElement.querySelector('.field-error');
    if (existing) existing.remove();
    
    // Créer le message d'erreur
    const err = document.createElement('div');
    err.className = 'field-error';
    err.textContent = message;
    field.parentElement.appendChild(err);
    
    // Animation
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
    
    contactForm.querySelectorAll('.form-control.error').forEach(f => {
        f.classList.remove('error');
    });
    
    contactForm.querySelectorAll('.field-error').forEach(m => m.remove());
}

function validateEmail(email) { 
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    return re.test(email); 
}

function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    document.querySelectorAll('.notification').forEach(n => { 
        n.style.transform = 'translateX(100%)'; 
        setTimeout(() => n.remove(), 300); 
    });
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close"><span>&times;</span></button>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Ajouter les styles si nécessaire
    if (!document.querySelector('#notification-styles')) {
        addNotificationStyles();
    }
    
    // Animation d'entrée
    gsap.fromTo(notification, {
        x: 300,
        opacity: 0
    }, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(1.2)"
    });
    
    // Fermeture au clic
    notification.querySelector('.notification-close').addEventListener('click', function() {
        closeNotification(notification);
    });
    
    // Fermeture automatique après 5 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            closeNotification(notification);
        }
    }, 5000);
}

function closeNotification(notification) {
    gsap.to(notification, {
        x: 300,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => notification.remove()
    });
}

function addNotificationStyles() {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            transform: translateX(100%);
            max-width: 350px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-left: 5px solid;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
        }
        
        .notification--success { 
            border-left-color: #4CAF50; 
        }
        
        .notification--error { 
            border-left-color: #F44336; 
        }
        
        .notification--info { 
            border-left-color: #2196F3; 
        }
        
        .notification-content {
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .notification-message {
            flex-grow: 1;
            margin-right: 10px;
            color: #333;
            font-size: 14px;
            line-height: 1.4;
        }
        
        .notification-close {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 20px;
            color: #999;
            line-height: 1;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
        }
        
        .notification-close:hover {
            background-color: #f5f5f5;
            color: #666;
        }
        
        .field-error {
            color: #F44336;
            font-size: 12px;
            margin-top: 5px;
            font-weight: 500;
        }
        
        .form-control.error {
            border-color: #F44336 !important;
            background-color: rgba(244, 67, 54, 0.05);
        }
    `;
    document.head.appendChild(style);
}

function setupIntersectionObserver() {
    const observerOptions = { 
        threshold: 0.1, 
        rootMargin: '0px 0px -50px 0px' 
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.skill-category');
    animatedElements.forEach(el => observer.observe(el));
}

function updateActiveNavLink() {
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
        .page-loader { 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: linear-gradient(135deg, #FFF8DC 0%, #E6E6FA 100%); 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            z-index: 10000; 
            opacity: 1; 
            transition: opacity .5s ease;
        }
        
        .loader-content { 
            text-align: center; 
            color: #DDA0DD; 
            font-family: var(--font-family-base); 
        }
        
        .loader-spinner { 
            width: 50px; 
            height: 50px; 
            border: 3px solid rgba(221, 160, 221, 0.3); 
            border-top: 3px solid #DDA0DD; 
            border-radius: 50%; 
            animation: spin 1s linear infinite; 
            margin: 0 auto 16px;
        }
        
        @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
        }
        
        .page-loader.fade-out { 
            opacity: 0; 
            pointer-events: none; 
        }
    `;
    
    document.head.appendChild(loaderStyles);
    document.body.appendChild(loader);

    setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => { 
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
// FOND ÉTOILÉ AVEC SCINTILLEMENT
// ===================================================================
function createStaticStars() {
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars-background';
    document.body.appendChild(starsContainer);

    const starCount = 150;
    for (let i = 0; i < starCount; i++) createStar(starsContainer);

    createHeroStars();
}

function createStar(container) {
    const star = document.createElement('div');
    star.className = 'star';
    
    const sizes = ['small', 'medium', 'large'];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    star.classList.add(size);
    
    const colors = ['color-1', 'color-2', 'color-3', 'color-4'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    star.style.background = color === 'color-1' ? '#FDC6E1' :
                           color === 'color-2' ? '#FDD9EB' :
                           color === 'color-3' ? '#FDC6E1' : '#FFFFFF';
    
    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;
    
    if (Math.random() < 0.4) {
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
    heroStars.style.opacity='0.6';
    hero.appendChild(heroStars);

    for(let i=0;i<80;i++){
        const star=document.createElement('div'); star.className='star';
        const sizes=['small','medium','large'];
        star.classList.add(sizes[Math.floor(Math.random()*sizes.length)]);
        const colors=['color-1','color-2','color-3','color-4'];
        star.classList.add(colors[Math.floor(Math.random()*colors.length)]);
        star.style.left=`${Math.random()*100}%`; star.style.top=`${Math.random()*100}%`;
        if(Math.random()<0.5){ const duration=1+Math.random()*3; star.style.animation=`twinkle ${duration}s infinite ease-in-out`; star.style.animationDelay=`${Math.random()*4}s`; }
        heroStars.appendChild(star);
    }
}