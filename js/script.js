(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        initMobileMenu();
        initSmoothScroll();
        initCookieNotice();
        initScrollAnimations();
        initNavbarScroll();
        initImageModal();
        initAdminAccess();
    });

    /**
     * Inicializa el menú de navegación para móviles.
     */
    function initMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');

        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });

            const navLinks = navMenu.querySelectorAll('a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                });
            });
        }
    }

    /**
     * Inicializa el desplazamiento suave para los enlaces de anclaje.
     */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Gestiona el aviso de cookies.
     */
    function initCookieNotice() {
        const cookieNotice = document.getElementById('cookieNotice');
        const acceptCookies = document.getElementById('acceptCookies');

        if (cookieNotice && acceptCookies) {
            if (!localStorage.getItem('cookiesAccepted')) {
                setTimeout(() => {
                    cookieNotice.classList.add('active');
                }, 1000);
            }

            acceptCookies.addEventListener('click', () => {
                localStorage.setItem('cookiesAccepted', 'true');
                cookieNotice.classList.remove('active');
            });
        }
    }

    /**
     * Inicializa las animaciones de los elementos al hacer scroll.
     */
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.galeria-item, .objetivo-card, .linea-item');
        if (animatedElements.length === 0) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    /**
     * Cambia el estilo de la barra de navegación al hacer scroll.
     */
    function initNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 100) {
                navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
            } else {
                navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            }
        });
    }

    /**
     * Crea y gestiona el modal de la galería de imágenes.
     */
    function initImageModal() {
        const galleryImages = document.querySelectorAll('.galeria-thumbnails img, .galeria-item img');
        if (galleryImages.length === 0) return;

        galleryImages.forEach(img => {
            img.addEventListener('click', () => {
                createModal(img.src, img.alt);
            });
        });
    }

    function createModal(src, alt) {
        const modalHTML = `
            <div class="modal-overlay">
                <span class="close-modal">&times;</span>
                <img src="${src}" alt="${alt}">
            </div>
        `;

        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = modalHTML;
        document.body.appendChild(modal);

        // Estilos del modal
        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '3000',
            animation: 'fadeIn 0.3s ease'
        });

        const modalImg = modal.querySelector('img');
        Object.assign(modalImg.style, {
            maxWidth: '90%',
            maxHeight: '90vh',
            objectFit: 'contain',
            borderRadius: '10px'
        });

        const closeBtn = modal.querySelector('.close-modal');
        Object.assign(closeBtn.style, {
            position: 'absolute',
            top: '20px',
            right: '40px',
            color: 'white',
            fontSize: '50px',
            cursor: 'pointer',
            zIndex: '3001'
        });

        const closeModal = () => modal.remove();
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-overlay')) {
                closeModal();
            }
        });
    }

    /**
     * Inicializa el acceso secreto al panel de administración.
     */
    function initAdminAccess() {
        const logo = document.querySelector('.logo');
        if (!logo) return;

        let clickCount = 0;
        let clickTimer = null;

        logo.addEventListener('click', () => {
            clickCount++;

            logo.style.transform = 'scale(0.95)';
            setTimeout(() => {
                logo.style.transform = 'scale(1)';
            }, 100);

            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 500);
            }

            if (clickCount === 3) {
                clearTimeout(clickTimer);
                clickCount = 0;
                logo.style.opacity = '0.5';
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 200);
            }
        });
    }

    // Inyectar CSS para la animación fadeIn
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

})();
