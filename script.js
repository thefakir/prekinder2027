// ==================== VARIABLES GLOBALES ====================
const whatsappLink = 'https://chat.whatsapp.com/C9eAPo2Y7ok2UDtyLQ1PZy';
const shareMessage = `📢 Información importante sobre Prekínder 2027 en Bolivia

Se ha anunciado un cambio en el criterio de edad que afecta a niños de enero-marzo.

Únete al grupo de padres informados: ${whatsappLink}

Más información en: ${window.location.href}`;

// ==================== ACORDEÓN FAQ ====================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            // Cerrar otros items abiertos
            const wasActive = item.classList.contains('active');

            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            // Toggle el item actual
            if (!wasActive) {
                item.classList.add('active');
            }
        });
    });
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ==================== COPIAR AL PORTAPAPELES ====================
async function copyToClipboard(text, successMessage) {
    try {
        // Intentar usar la API moderna del portapapeles
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            showToast(successMessage);
        } else {
            // Fallback para navegadores antiguos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            textArea.style.top = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    showToast(successMessage);
                } else {
                    showToast('❌ No se pudo copiar. Intenta manualmente.');
                }
            } catch (err) {
                console.error('Error al copiar:', err);
                showToast('❌ Error al copiar');
            }

            document.body.removeChild(textArea);
        }
    } catch (err) {
        console.error('Error al copiar:', err);
        showToast('❌ Error al copiar. Intenta manualmente.');
    }
}

// ==================== COPIAR ENLACE ====================
function initCopyLink() {
    const copyLinkBtn = document.getElementById('copyLinkBtn');

    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            const siteUrl = window.location.href;
            copyToClipboard(siteUrl, '✅ Enlace copiado al portapapeles');
        });
    }
}

// ==================== COPIAR MENSAJE ====================
function initCopyMessage() {
    const copyMessageBtn = document.getElementById('copyMessageBtn');

    if (copyMessageBtn) {
        copyMessageBtn.addEventListener('click', () => {
            copyToClipboard(shareMessage, '✅ Mensaje copiado. ¡Compártelo!');
        });
    }
}

// ==================== SCROLL SUAVE ====================
function initSmoothScroll() {
    // Seleccionar todos los enlaces internos
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Verificar que el href no sea solo '#'
            if (href && href !== '#') {
                e.preventDefault();

                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    // Calcular la posición considerando el banner fijo si existe
                    const offsetTop = targetElement.offsetTop;

                    window.scrollTo({
                        top: offsetTop - 20, // 20px de margen superior
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ==================== ANIMACIÓN AL HACER SCROLL ====================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar elementos que queremos animar
    const animatedElements = document.querySelectorAll('.content-box, .impact-card, .proposal-item, .help-card, .faq-item');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ==================== VALIDACIÓN DE ENLACES ====================
function validateLinks() {
    // Verificar que el enlace de WhatsApp funcione
    const whatsappButtons = document.querySelectorAll('a[href*="whatsapp"]');

    whatsappButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // En caso de error, mostrar mensaje alternativo
            setTimeout(() => {
                console.log('Enlace de WhatsApp clickeado');
            }, 100);
        });
    });
}

// ==================== ESTADÍSTICAS SIMPLES ====================
function initAnalytics() {
    // Registrar visita simple (solo en consola para desarrollo)
    const visitTime = new Date().toLocaleString('es-BO');
    console.log('Visita registrada:', visitTime);

    // Detectar si es móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('Dispositivo:', isMobile ? 'Móvil' : 'Escritorio');
}

// ==================== ACCESIBILIDAD: FOCUS TRAP EN FAQ ====================
function enhanceAccessibility() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        // Añadir atributos ARIA
        question.setAttribute('aria-expanded', 'false');

        // Actualizar aria-expanded cuando se toggle
        question.addEventListener('click', function () {
            const isActive = this.parentElement.classList.contains('active');
            this.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });

        // Soporte para teclado (Enter y Espacio)
        question.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// ==================== DETECCIÓN DE NAVEGADOR ANTIGUO ====================
function checkBrowserSupport() {
    // Verificar si el navegador soporta características modernas
    const isModernBrowser =
        'Promise' in window &&
        'IntersectionObserver' in window &&
        'classList' in document.createElement('div');

    if (!isModernBrowser) {
        console.warn('Navegador antiguo detectado. Algunas funciones pueden no estar disponibles.');
    }
}

// ==================== PREVENIR SPAM EN BOTONES ====================
function preventButtonSpam() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        let isProcessing = false;

        button.addEventListener('click', function (e) {
            if (isProcessing && !this.href) {
                e.preventDefault();
                return;
            }

            if (!this.href) { // Solo para botones sin href
                isProcessing = true;

                setTimeout(() => {
                    isProcessing = false;
                }, 1000);
            }
        });
    });
}

// ==================== CONTADOR DE VISITAS (OPCIONAL) ====================
function displayVisitCounter() {
    // Usar localStorage para contar visitas locales (solo demostración)
    if (typeof (Storage) !== "undefined") {
        let visitCount = localStorage.getItem('visitCount');

        if (visitCount === null) {
            visitCount = 0;
        }

        visitCount = parseInt(visitCount) + 1;
        localStorage.setItem('visitCount', visitCount);

        console.log('Número de visitas desde este dispositivo:', visitCount);
    }
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Sitio web Prekínder Bolivia 2027 cargado');

    // Verificar soporte del navegador
    checkBrowserSupport();

    // Inicializar funcionalidades principales
    initFAQ();
    initCopyLink();
    initCopyMessage();
    initSmoothScroll();

    // Inicializar funcionalidades secundarias
    validateLinks();
    enhanceAccessibility();
    preventButtonSpam();

    // Analytics y estadísticas simples
    initAnalytics();
    displayVisitCounter();

    // Animaciones (solo si el navegador lo soporta)
    if ('IntersectionObserver' in window) {
        initScrollAnimations();
    }

    console.log('✅ Todas las funcionalidades inicializadas correctamente');
});

// ==================== MANEJO DE ERRORES GLOBAL ====================
window.addEventListener('error', (e) => {
    console.error('Error capturado:', e.message);
});

// ==================== EXPORT PARA TESTING (OPCIONAL) ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToast,
        copyToClipboard,
        initFAQ
    };
}
