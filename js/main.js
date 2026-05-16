/**
 * Souma Tourisme — main.js (v2 — synchronisé avec index.html & style.css améliorés)
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       1. BARRE DE PROGRESSION DE LECTURE
    ============================================================ */
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed; top: 0; left: 0; height: 3px;
        background: var(--secondary); width: 0%;
        z-index: 9999; transition: width 0.1s linear;
        pointer-events: none;
    `;
    document.body.prepend(progressBar);


    /* ============================================================
       2. HEADER — scroll + masquage intelligent
    ============================================================ */
    const header = document.getElementById('header');
    let lastScrollY = 0;
    let ticking = false;

    header.style.transition = 'transform 0.35s ease, background 0.4s ease, padding 0.4s ease, box-shadow 0.4s ease';

    function onScroll() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        header.classList.toggle('scrolled', scrollY > 60);

        if (scrollY > lastScrollY && scrollY > 350) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        lastScrollY = scrollY;

        progressBar.style.width = docHeight > 0
            ? `${Math.min((scrollY / docHeight) * 100, 100)}%`
            : '0%';

        const btn = document.getElementById('backToTop');
        if (btn) {
            scrollY > 500 ? btn.removeAttribute('hidden') : btn.setAttribute('hidden', '');
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });


    /* ============================================================
       3. MENU MOBILE
    ============================================================ */
    const burger = document.getElementById('burger');
    const nav    = document.getElementById('nav');

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.55);
        z-index: 998; opacity: 0; pointer-events: none;
        transition: opacity 0.3s ease;
    `;
    document.body.appendChild(overlay);

    function openMenu() {
        nav.classList.add('active');
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        burger.setAttribute('aria-expanded', 'true');
        burger.setAttribute('aria-label', 'Fermer le menu');
        document.body.style.overflow = 'hidden';
        const lines = burger.querySelectorAll('.burger__line');
        if (lines.length === 3) {
            lines[0].style.cssText = 'transform: translateY(7px) rotate(45deg);';
            lines[1].style.cssText = 'opacity: 0; transform: scaleX(0);';
            lines[2].style.cssText = 'transform: translateY(-7px) rotate(-45deg);';
        }
    }

    function closeMenu() {
        nav.classList.remove('active');
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Ouvrir le menu');
        document.body.style.overflow = '';
        const lines = burger.querySelectorAll('.burger__line');
        if (lines.length === 3) {
            lines[0].style.cssText = '';
            lines[1].style.cssText = '';
            lines[2].style.cssText = '';
        }
    }

    if (burger) {
        burger.addEventListener('click', () => nav.classList.contains('active') ? closeMenu() : openMenu());
    }
    overlay.addEventListener('click', closeMenu);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    document.querySelectorAll('.nav__list a').forEach(link => link.addEventListener('click', closeMenu));


    /* ============================================================
       4. SMOOTH SCROLL
    ============================================================ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (!id || id === '#' || id === '#!') return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const offset = header.offsetHeight + 20;
            window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
        });
    });


    /* ============================================================
       5. LIEN ACTIF DANS LA NAV
    ============================================================ */
    const navLinks = document.querySelectorAll('.nav__list a[href^="#"]');

    document.querySelectorAll('section[id]').forEach(section => {
        new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.classList.toggle('nav__active', link.getAttribute('href') === `#${entry.target.id}`);
                    });
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px' }).observe(section);
    });


    /* ============================================================
       6. REVEAL AU SCROLL (animations d'entrée décalées)
    ============================================================ */
    const revealSelectors = [
        '.dest-card', '.service-card', '.prestige__item',
        '.section__header', '.testi-card', '.footer__col',
        '.cta__content', '.why__item', '.contact__info', '.contact__form'
    ];

    document.querySelectorAll(revealSelectors.join(', ')).forEach(el => {
        el.style.cssText += 'opacity:0; transform: translateY(28px) scale(0.98); transition: opacity 0.65s ease, transform 0.65s ease;';

        new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            const siblings = [...entries[0].target.parentElement.children];
            const delay = siblings.indexOf(entries[0].target) * 90;
            setTimeout(() => {
                entries[0].target.style.opacity = '1';
                entries[0].target.style.transform = 'translateY(0) scale(1)';
            }, delay);
            entries[0].target._observer && entries[0].target._observer.unobserve(entries[0].target);
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }).observe(el);
    });


    /* ============================================================
       7. SLIDESHOW HERO
    ============================================================ */
    const slides = document.querySelectorAll('.hero__slide');
    if (slides.length > 1) {
        let current = 0;
        setInterval(() => {
            slides[current].classList.remove('active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('active');
        }, 6000);
    }


    /* ============================================================
       8. COMPTEURS ANIMÉS (hero stats)
    ============================================================ */
    document.querySelectorAll('.counter').forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        const obs = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            obs.unobserve(el);
            const step = target / (1800 / 16);
            let current = 0;
            const update = () => {
                current = Math.min(current + step, target);
                el.textContent = Math.floor(current).toLocaleString('fr-FR');
                if (current < target) requestAnimationFrame(update);
            };
            requestAnimationFrame(update);
        }, { threshold: 0.5 });
        obs.observe(el);
    });


    /* ============================================================
       9. PARALLAXE LÉGÈRE SUR LE HERO
    ============================================================ */
    const heroSlides = document.querySelector('.hero__slides');
    if (heroSlides && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        window.addEventListener('scroll', () => {
            if (window.scrollY < window.innerHeight) {
                heroSlides.style.transform = `translateY(${window.scrollY * 0.3}px)`;
            }
        }, { passive: true });
    }


    /* ============================================================
       10. FORMULAIRE DE CONTACT — validation + feedback
    ============================================================ */
    const form = document.getElementById('contactForm');
    if (form) {
        const successMsg = document.getElementById('formSuccess');

        function validateField(field) {
            const errorEl = field.parentElement.querySelector('.form__error');
            let msg = '';
            if (field.required && !field.value.trim()) {
                msg = 'Ce champ est requis.';
            } else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
                msg = 'Adresse email invalide.';
            }
            if (errorEl) errorEl.textContent = msg;
            field.classList.toggle('error', !!msg);
            return !msg;
        }

        form.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => { if (field.classList.contains('error')) validateField(field); });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fields = form.querySelectorAll('input[required], textarea[required]');
            let valid = true;
            fields.forEach(f => { if (!validateField(f)) valid = false; });
            if (!valid) return;

            const submitBtn = form.querySelector('[type="submit"]');
            const btnText   = submitBtn.querySelector('.btn__text');
            submitBtn.disabled = true;
            if (btnText) btnText.textContent = 'Envoi en cours…';

            // Remplacez cette simulation par votre vraie intégration (Formspree, EmailJS, etc.)
            await new Promise(r => setTimeout(r, 1500));

            form.style.display = 'none';
            if (successMsg) successMsg.removeAttribute('hidden');

            setTimeout(() => {
                form.reset();
                form.style.display = '';
                if (successMsg) successMsg.setAttribute('hidden', '');
                submitBtn.disabled = false;
                if (btnText) btnText.textContent = 'Envoyer ma demande';
            }, 6000);
        });
    }


    /* ============================================================
       11. BOUTON RETOUR EN HAUT
    ============================================================ */
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }


    /* ============================================================
       12. WHATSAPP — apparition différée + pulse
    ============================================================ */
    const wa = document.querySelector('.whatsapp-float');
    if (wa) {
        wa.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        wa.style.transform = 'scale(0.85)';
        setTimeout(() => {
            wa.style.opacity = '1';
            wa.style.transform = 'scale(1)';
        }, 3500);

        const waStyle = document.createElement('style');
        waStyle.textContent = `
            @keyframes waPulse {
                0%, 100% { box-shadow: 0 6px 20px rgba(37,211,102,0.4); }
                50%       { box-shadow: 0 6px 30px rgba(37,211,102,0.7); }
            }
            .whatsapp-float { animation: waPulse 2.8s ease-in-out infinite; }
        `;
        document.head.appendChild(waStyle);
    }


    /* ============================================================
       13. ANNÉE DYNAMIQUE DANS LE FOOTER
    ============================================================ */
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();


    /* ============================================================
       14. LAZY LOADING des backgrounds data-bg
    ============================================================ */
    document.querySelectorAll('[data-bg]').forEach(el => {
        new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                el.style.backgroundImage = `url('${el.dataset.bg}')`;
            }
        }, { rootMargin: '200px' }).observe(el);
    });

    console.info('✅ Souma Tourisme v2 — scripts chargés.');

});