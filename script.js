// ==================== CONSTANTES ====================
const WHATSAPP_LINK = 'https://chat.whatsapp.com/DaVjTJuld2q9SkI3MNutCs';

// Grupos de WhatsApp por departamento. Pando todavía no tiene grupo propio:
// si se crea, solo hay que agregar la línea acá y todo (grid + formulario) se actualiza solo.
const DEPARTMENT_LINKS = {
    'Cochabamba': 'https://chat.whatsapp.com/Fdk427zcUx3AoT3EUtCY8K',
    'La Paz': 'https://chat.whatsapp.com/IJPdmnC3qk49s3lzZtekcJ',
    'Santa Cruz': 'https://chat.whatsapp.com/DQhRqAR0vvz4e4HmYewcNZ',
    'Oruro': 'https://chat.whatsapp.com/L7QScVfY1Z7BphT8xCJuW3',
    'Potosí': 'https://chat.whatsapp.com/JtVh6Vo9RPbI6vrF9XDD8K',
    'Tarija': 'https://chat.whatsapp.com/DFbQFjWJtY6EjnoIAKJyvn',
    'Chuquisaca': 'https://chat.whatsapp.com/IyjWlcMAxir0YeTf3m480S',
    'Beni': 'https://chat.whatsapp.com/C0Ik4Puo5cRCzbrI5fqDRj',
    'Pando': 'https://chat.whatsapp.com/BVm7F9K3OSsA4p3ZW2mlpF',
};
const SHARE_MESSAGE = `📢 Bolivia necesita reglas educativas estables

El Ministerio de Educación cambió el criterio de edad para Prekínder desde la Gestión 2027. Ya somos +500 familias organizadas en todo el país pidiendo una transición responsable.

Más información en: ${window.location.href}

Regístrate o únete al grupo: ${WHATSAPP_LINK}`;

// ==================== CONFIG: BASE DE DATOS (Supabase) ====================
// 1. Crea un proyecto gratis en https://supabase.com
// 2. En el SQL Editor, corre el script completo de creación de la tabla "registros"
//    (schema, RLS y policy de solo-INSERT) — ver registros_schema.sql en el repo,
//    o pídeselo a Claude si no lo tienes a mano.
// 3. Copia la URL del proyecto y la "Publishable key" (Settings > API Keys) aquí abajo.
//    El CI es un dato sensible (identifica a una persona real): nunca expongas la
//    "Secret key" en el sitio, solo la "Publishable key" con policy de solo-INSERT.
const SUPABASE_URL = 'https://zyqnjtfdbzdnsaujfkjf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FAMR1CdVpDZ_pPUaAxLGDg_yxjaaKxa'; // Publishable key, NO la "Secret key"
const SUPABASE_TABLE = 'registros';
const DB_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// ==================== HEADER: SCROLL SHADOW + HAMBURGER ====================
function initHeader() {
    const header = document.getElementById('site-header');
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('site-nav');

    // Shadow on scroll
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });

    // Hamburger toggle
    hamburger.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile nav when a link inside it is clicked
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Close mobile nav on outside click
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('open') && !header.contains(e.target)) {
            nav.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
}

// ==================== FLOATING WHATSAPP BUTTON ====================
function initFAB() {
    const fab = document.getElementById('whatsapp-fab');
    const heroBtn = document.getElementById('hero-whatsapp-btn');

    if (!fab || !heroBtn) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            fab.classList.toggle('visible', !entry.isIntersecting);
        });
    }, { threshold: 0.1 });

    observer.observe(heroBtn);
}

// ==================== ATRIBUCIÓN DE CANAL (UTM) ====================
// Captura utm_source/medium/campaign en la primera visita y los recuerda durante
// la sesión, para saber qué canal (TikTok, Facebook, WhatsApp...) trae registros.
function captureUTM() {
    const params = new URLSearchParams(window.location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign'];
    const stored = {};

    keys.forEach(key => {
        const value = params.get(key);
        if (value) {
            sessionStorage.setItem(key, value);
        }
        stored[key] = sessionStorage.getItem(key) || '';
    });

    return stored;
}

// ==================== FORMULARIO DE REGISTRO ====================
function initDeptGroupHint() {
    const select = document.getElementById('f-departamento');
    const wrap = document.getElementById('dept-group-wrap');
    const hint = document.getElementById('dept-group-hint');
    if (!select || !wrap || !hint) return;

    select.addEventListener('change', () => {
        const depto = select.value;
        const link = DEPARTMENT_LINKS[depto];

        if (link) {
            hint.innerHTML = `📱 Grupo de WhatsApp de <strong>${depto}</strong> ya disponible —
                <a href="${link}" target="_blank" rel="noopener noreferrer">unirme ahora</a>`;
        } else if (depto) {
            hint.innerHTML = `Aún no tenemos grupo propio en <strong>${depto}</strong>, te contactamos para armarlo.
                Mientras tanto, únete al <a href="${WHATSAPP_LINK}" target="_blank" rel="noopener noreferrer">grupo nacional</a>.`;
        }

        wrap.hidden = !depto;
    });
}

// Muestra "mes de nacimiento" solo cuando aplica (padre/madre o familiar de un niño
// afectado). Amigos/aliados o quienes ya pasaron por el proceso no tienen que
// inventar un mes que no corresponde a nadie.
function initMesNacimientoToggle() {
    const relacion = document.getElementById('f-relacion');
    const wrap = document.getElementById('mes-nacimiento-wrap');
    const mesSelect = document.getElementById('f-mes');
    if (!relacion || !wrap || !mesSelect) return;

    const REQUIERE_MES = new Set(['padre-madre', 'familiar']);

    relacion.addEventListener('change', () => {
        const aplica = REQUIERE_MES.has(relacion.value);
        wrap.hidden = !aplica;
        mesSelect.required = aplica;
        const label = wrap.querySelector('label');
        if (label) {
            label.textContent = aplica ? 'Mes en que nació el niño/a *' : 'Mes en que nació el niño/a';
        }
        if (!aplica) mesSelect.value = '';
    });
}

function initRegistroForm() {
    const form = document.getElementById('registro-form');
    if (!form) return;

    initDeptGroupHint();
    initMesNacimientoToggle();

    const submitBtn = document.getElementById('registro-submit');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Honeypot: si un bot llenó este campo invisible, fingimos éxito y no
        // guardamos nada. No le damos pistas de que fue detectado.
        if (form.website && form.website.value.trim() !== '') {
            console.warn('Envío bloqueado por honeypot (probable bot).');
            showToast('✅ ¡Gracias! Te contactaremos pronto.');
            form.reset();
            return;
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const utm = captureUTM();
        // Normalizamos CI (solo dígitos) y contacto (sin espacios/guiones) antes de
        // guardar, para que la restricción UNIQUE de la base detecte duplicados aunque
        // se hayan escrito con formato distinto.
        const ciNormalizado = form.ci.value.trim().replace(/\D+/g, '');
        const contactoNormalizado = form.contacto.value.trim().toLowerCase().replace(/[\s-]+/g, '');

        const payload = {
            nombre: form.nombre.value.trim(),
            contacto: contactoNormalizado,
            departamento: form.departamento.value,
            ciudad: form.ciudad.value.trim(),
            relacion: form.relacion.value,
            mes_nacimiento: form.mes_nacimiento.value,
            ci: ciNormalizado,
            ci_expedido: form.ci_expedido.value,
            utm_source: utm.utm_source,
            utm_medium: utm.utm_medium,
            utm_campaign: utm.utm_campaign,
        };

        if (!DB_CONFIGURED) {
            // Aún no se configuró Supabase (ver arriba). No perdemos el registro:
            // lo dejamos en el navegador y avisamos por consola para no bloquear
            // al usuario mientras se termina de conectar la base de datos.
            console.warn('SUPABASE_URL / SUPABASE_ANON_KEY no configurados. Registro no guardado:', payload);
            showToast('✅ ¡Gracias! Te contactaremos pronto.');
            form.reset();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Prefer': 'return=minimal',
                },
                body: JSON.stringify(payload),
            });

            if (res.status === 409) {
                // 23505 = violación de restricción UNIQUE (ci o contacto ya registrados).
                const body = await res.json().catch(() => ({}));
                const detalle = `${body.message || ''} ${body.details || ''}`.toLowerCase();
                if (detalle.includes('ci')) {
                    showToast('Ese número de CI ya está registrado. Si crees que es un error, escríbenos por WhatsApp.', 5000);
                } else if (detalle.includes('contacto')) {
                    showToast('Ese contacto ya está registrado. Si crees que es un error, escríbenos por WhatsApp.', 5000);
                } else {
                    showToast('Ya existe un registro con esos datos.', 5000);
                }
                return;
            }

            if (!res.ok) throw new Error(`Supabase respondió ${res.status}`);

            showToast('✅ ¡Familia registrada! Gracias por sumarte.');
            form.reset();
        } catch (err) {
            console.error('Error guardando registro:', err);
            showToast('No se pudo enviar. Intenta de nuevo o escríbenos por WhatsApp.', 4000);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Registrarme';
        }
    });
}

// ==================== MODAL: ELEGIR GRUPO DE WHATSAPP ====================
function initWhatsappModal() {
    const overlay = document.getElementById('whatsapp-modal-overlay');
    const closeBtn = document.getElementById('whatsapp-modal-close');
    const nationalLink = document.getElementById('modal-national-link');
    const deptList = document.getElementById('modal-dept-list');
    const triggers = document.querySelectorAll('[data-whatsapp-trigger]');

    if (!overlay || !closeBtn || !nationalLink || !deptList || !triggers.length) return;

    nationalLink.href = WHATSAPP_LINK;

    // Todos los departamentos, en el orden habitual de mayor a menor población.
    const ALL_DEPARTMENTS = ['La Paz', 'Santa Cruz', 'Cochabamba', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Beni', 'Pando'];

    deptList.innerHTML = ALL_DEPARTMENTS.map(depto => {
        const link = DEPARTMENT_LINKS[depto];
        if (link) {
            return `<a class="modal-dept-btn" href="${link}" target="_blank" rel="noopener noreferrer">${depto}</a>`;
        }
        // Sin grupo propio todavía: manda al nacional pero lo marca como pendiente.
        return `<a class="modal-dept-btn modal-dept-btn-pending" href="${WHATSAPP_LINK}" target="_blank" rel="noopener noreferrer">
                    ${depto} <small>(en formación)</small>
                </a>`;
    }).join('');

    let lastFocused = null;

    function openModal() {
        lastFocused = document.activeElement;
        overlay.hidden = false;
        document.body.classList.add('modal-open');
        closeBtn.focus();
        document.addEventListener('keydown', onKeydown);
    }

    function closeModal() {
        overlay.hidden = true;
        document.body.classList.remove('modal-open');
        document.removeEventListener('keydown', onKeydown);
        if (lastFocused) lastFocused.focus();
    }

    function onKeydown(e) {
        if (e.key === 'Escape') closeModal();
    }

    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
}

// ==================== FAQ ACORDEÓN ====================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const wasActive = item.classList.contains('active');

            faqItems.forEach(other => {
                other.classList.remove('active');
                other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            if (!wasActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });

        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });
}

// ==================== TOAST ====================
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

// ==================== PORTAPAPELES ====================
async function copyToClipboard(text, successMessage) {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        showToast(successMessage);
    } catch {
        showToast('No se pudo copiar. Intenta manualmente.');
    }
}

function initCopyButtons() {
    document.getElementById('copyLinkBtn')?.addEventListener('click', () => {
        copyToClipboard(window.location.href, '✅ Enlace copiado al portapapeles');
    });

    document.getElementById('copyMessageBtn')?.addEventListener('click', () => {
        copyToClipboard(SHARE_MESSAGE, '✅ Mensaje copiado. ¡Compártelo!');
    });
}

// ==================== ANIMACIONES AL SCROLL ====================
function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    const targets = document.querySelectorAll(
        '.comparison-card, .consequence-item, .impact-card, .proposal-item, .help-card, .faq-item, .timeline-item, .dept-card, .stat-card, .media-card'
    );

    targets.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    captureUTM();
    initHeader();
    initFAB();
    initWhatsappModal();
    initFAQ();
    initCopyButtons();
    initScrollAnimations();
    initRegistroForm();
});

window.addEventListener('error', (e) => {
    console.error('Error capturado:', e.message);
});
