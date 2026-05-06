// ========================================
// CatCatch — Inspired by Seen Advertising Agency
// ========================================

document.addEventListener('DOMContentLoaded', () => {

    const pillNavContainer = document.querySelector('.pill-nav-container');

    let lastNavScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        if (!pillNavContainer) return;

        const currentScrollY = window.scrollY;
        const hasMeaningfulDelta = Math.abs(currentScrollY - lastNavScrollY) > 6;

        if (currentScrollY <= 20) {
            pillNavContainer.classList.remove('is-hidden');
        } else if (hasMeaningfulDelta && currentScrollY > lastNavScrollY) {
            pillNavContainer.classList.add('is-hidden');
        } else if (hasMeaningfulDelta && currentScrollY < lastNavScrollY) {
            pillNavContainer.classList.remove('is-hidden');
        }

        lastNavScrollY = currentScrollY;
    }, { passive: true });

    // ===== Scroll Progress Bar =====
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
        progressBar.style.width = pct + '%';
    });

    // ===== Intersection Observer Reveals =====
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal-up, .reveal-scale').forEach(el => revealObserver.observe(el));

    setTimeout(() => {
        document.querySelectorAll('.hero .reveal-up, .hero .reveal-scale').forEach(el => el.classList.add('active'));
    }, 200);

    // ===== PillNav Logic =====
    const ease = 'power3.easeOut';
    const initialLoadAnimation = true;
    const circleRefs = document.querySelectorAll('.hover-circle');
    const tlRefs = [];
    const activeTweenRefs = [];
    const logoImg = document.querySelector('.pill-logo img');
    const logoTweenRef = { current: null };
    const hamburger = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu-popover');
    const navItems = document.querySelector('.pill-nav-items');
    const logo = document.querySelector('.pill-logo');

    const layout = () => {
        circleRefs.forEach((circle, index) => {
            if (!circle || !circle.parentElement) return;

            const pill = circle.parentElement;
            const rect = pill.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            const R = ((w * w) / 4 + h * h) / (2 * h);
            const D = Math.ceil(2 * R) + 2;
            const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
            const originY = D - delta;

            circle.style.width = `${D}px`;
            circle.style.height = `${D}px`;
            circle.style.bottom = `-${delta}px`;

            gsap.set(circle, {
                xPercent: -50,
                scale: 0,
                transformOrigin: `50% ${originY}px`
            });

            const label = pill.querySelector('.pill-label');
            const white = pill.querySelector('.pill-label-hover');

            if (label) gsap.set(label, { y: 0 });
            if (white) gsap.set(white, { y: h + 12, opacity: 0 });

            if (tlRefs[index]) tlRefs[index].kill();
            const tl = gsap.timeline({ paused: true });

            tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.8, ease, overwrite: 'auto' }, 0);

            if (label) {
                tl.to(label, { y: -(h + 8), duration: 0.8, ease, overwrite: 'auto' }, 0);
            }

            if (white) {
                gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
                tl.to(white, { y: 0, opacity: 1, duration: 0.8, ease, overwrite: 'auto' }, 0);
            }

            tlRefs[index] = tl;
        });
    };

    layout();
    window.addEventListener('resize', layout);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(layout).catch(() => {});
    }

    if (mobileMenu) {
        gsap.set(mobileMenu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
    }

    if (initialLoadAnimation) {
        if (logo) {
            gsap.set(logo, { scale: 0 });
            gsap.to(logo, { scale: 1, duration: 0.6, ease });
        }

        if (navItems) {
            gsap.set(navItems, { width: 0, overflow: 'hidden' });
            gsap.to(navItems, {
                width: 'auto',
                duration: 0.6,
                ease,
                onComplete: () => {
                    navItems.style.overflow = '';
                    layout();
                }
            });
        }
    }

    // Pill Hover Events
    const pills = document.querySelectorAll('.pill');
    pills.forEach((pill, i) => {
        pill.addEventListener('mouseenter', () => {
            const tl = tlRefs[i];
            if (!tl) return;
            if (activeTweenRefs[i]) activeTweenRefs[i].kill();
            activeTweenRefs[i] = tl.tweenTo(tl.duration(), { duration: 0.14, ease, overwrite: 'auto' });
        });

        pill.addEventListener('mouseleave', () => {
            const tl = tlRefs[i];
            if (!tl) return;
            if (activeTweenRefs[i]) activeTweenRefs[i].kill();
            activeTweenRefs[i] = tl.tweenTo(0, { duration: 0.12, ease, overwrite: 'auto' });
        });
    });

    if (logo) {
        logo.addEventListener('mouseenter', () => {
            if (!logoImg) return;
            if (logoTweenRef.current) logoTweenRef.current.kill();
            gsap.set(logoImg, { rotate: 0 });
            logoTweenRef.current = gsap.to(logoImg, { rotate: 360, duration: 0.2, ease, overwrite: 'auto' });
        });
    }

    let isMobileMenuOpen = false;
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            isMobileMenuOpen = !isMobileMenuOpen;
            hamburger.setAttribute('aria-expanded', String(isMobileMenuOpen));
            const lines = hamburger.querySelectorAll('.hamburger-line');
            if (isMobileMenuOpen) {
                gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
                gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
                gsap.set(mobileMenu, { visibility: 'visible' });
                gsap.fromTo(mobileMenu,
                    { opacity: 0, y: 10, scaleY: 1 },
                    { opacity: 1, y: 0, scaleY: 1, duration: 0.3, ease, transformOrigin: 'top center' }
                );
            } else {
                gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
                gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
                gsap.to(mobileMenu, {
                    opacity: 0, y: 10, scaleY: 1, duration: 0.2, ease, transformOrigin: 'top center',
                    onComplete: () => gsap.set(mobileMenu, { visibility: 'hidden' })
                });
            }
        });
    }

    // ScrollSpy & Smooth Scroll
    const sections = document.querySelectorAll('section[id], header[id], footer[id]');
    const navLinksDesktop = document.querySelectorAll('.pill');
    const navLinksMobile = document.querySelectorAll('.mobile-menu-link');

    const activateNav = () => {
        let current = '';
        sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) current = s.getAttribute('id'); });
        navLinksDesktop.forEach(l => {
            l.classList.remove('is-active');
            if (l.getAttribute('href') === '#' + current) l.classList.add('is-active');
        });
        navLinksMobile.forEach(l => {
            l.classList.remove('is-active');
            if (l.getAttribute('href') === '#' + current) l.classList.add('is-active');
        });
    };
    window.addEventListener('scroll', activateNav);
    activateNav();

    document.querySelectorAll('.pill, .mobile-menu-link, .pill-logo').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
                if (link.classList.contains('mobile-menu-link') && isMobileMenuOpen) {
                    hamburger.click();
                }
            }
        });
    });

    // ===== Stats Counter =====

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const target = parseInt(entry.target.dataset.target);
                let current = 0;
                const step = target / (2000 / 16);
                const timer = setInterval(() => {
                    current = Math.min(current + step, target);
                    entry.target.textContent = Math.floor(current).toLocaleString();
                    if (current >= target) clearInterval(timer);
                }, 16);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number[data-target]').forEach(el => statsObserver.observe(el));

    // ===== Work items 3D tilt =====
    document.querySelectorAll('.work-item').forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const r = item.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width;
            const y = (e.clientY - r.top) / r.height;
            item.style.transform = `perspective(800px) rotateX(${(y - 0.5) * 10}deg) rotateY(${(x - 0.5) * -10}deg) scale(1.02)`;
        });
        item.addEventListener('mouseleave', () => item.style.transform = '');
    });

    // ===== REVIEWS — Smooth auto-rotating carousel =====
    const reviewsSection = document.querySelector('.reviews-section');
    const reviewsStack = document.querySelector('.reviews-stack');

    if (reviewsStack) {
        const cards = Array.from(reviewsStack.querySelectorAll('.review-card'));
        let current = 0;
        let autoTimer = null;

        // Build dots
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'review-dots';
        reviewsSection.appendChild(dotsContainer);

        cards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'review-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => { goTo(i); resetTimer(); });
            dotsContainer.appendChild(dot);
        });

        // Nav arrows
        const prevBtn = document.createElement('button');
        prevBtn.className = 'review-nav review-prev';
        prevBtn.innerHTML = '←';
        const nextBtn = document.createElement('button');
        nextBtn.className = 'review-nav review-next';
        nextBtn.innerHTML = '→';
        reviewsStack.appendChild(prevBtn);
        reviewsStack.appendChild(nextBtn);

        prevBtn.addEventListener('click', () => { goTo((current - 1 + cards.length) % cards.length); resetTimer(); });
        nextBtn.addEventListener('click', () => { goTo((current + 1) % cards.length); resetTimer(); });

        function setActiveCard(index) {
            cards.forEach((card, i) => {
                card.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');
                if (i === index) card.classList.add('is-active');
                else if (i === (index - 1 + cards.length) % cards.length) card.classList.add('is-prev');
                else if (i === (index + 1) % cards.length) card.classList.add('is-next');
                else card.classList.add('is-hidden');
            });
            dotsContainer.querySelectorAll('.review-dot').forEach((dot, i) => dot.classList.toggle('active', i === index));
            current = index;
        }

        function goTo(index) { setActiveCard(index); }

        function resetTimer() {
            clearInterval(autoTimer);
            autoTimer = setInterval(() => goTo((current + 1) % cards.length), 4500);
        }

        setActiveCard(0);
        resetTimer();

        reviewsStack.addEventListener('mouseenter', () => clearInterval(autoTimer));
        reviewsStack.addEventListener('mouseleave', resetTimer);

        let touchStartX = 0;
        reviewsStack.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        reviewsStack.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) { goTo(diff > 0 ? (current + 1) % cards.length : (current - 1 + cards.length) % cards.length); resetTimer(); }
        });
    }

    // ===== Magnetic buttons =====
    document.querySelectorAll('.btn-magnetic, .btn-discover, .btn-hero, .social-circle').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const r = btn.getBoundingClientRect();
            const x = e.clientX - r.left - r.width / 2;
            const y = e.clientY - r.top - r.height / 2;
            btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });
        btn.addEventListener('mouseleave', () => btn.style.transform = '');
    });

    // ===== GSAP =====
    gsap.registerPlugin(ScrollTrigger);

    // Hero title: split chars with 3D drop-in
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const original = heroTitle.textContent;
        heroTitle.innerHTML = original.split('').map(c =>
            `<span class="hero-char" style="display:inline-block;overflow:hidden"><span class="hero-char-inner">${c === ' ' ? '&nbsp;' : c}</span></span>`
        ).join('');
        gsap.fromTo('.hero-char-inner',
            { yPercent: 110, rotateX: -40 },
            { yPercent: 0, rotateX: 0, stagger: 0.025, duration: 0.72, ease: 'expo.out', delay: 0.12 }
        );
    }

    // Hero subtitle fade-up
    gsap.fromTo('.hero-subtitle',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: 0.42 }
    );

    // Hero mascot — elastic bounce entrance
    const heroMascot = document.querySelector('.hero-gato');
    if (heroMascot) {
        gsap.fromTo(heroMascot,
            { opacity: 0, y: -60, rotate: 0, scale: 0.7 },
            { opacity: 1, y: 0, rotate: 0, scale: 1, duration: 0.8, ease: 'back.out(1.25)', delay: 0.28 }
        );
    }

    // Hero wrapper scale-in
    const heroWrapper = document.querySelector('.hero-text-wrapper');
    if (heroWrapper) {
        gsap.fromTo(heroWrapper,
            { opacity: 0, scale: 0.96 },
            { opacity: 1, scale: 1, duration: 0.65, ease: 'power3.out', delay: 0.05 }
        );
    }

    // Floating particles
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
        const symbols = ['✦', '◆', '○', '✿', '%'];
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('span');
            p.className = 'hero-particle';
            p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            p.style.cssText = `position:absolute;left:${Math.random() * 90 + 5}%;top:${Math.random() * 80 + 10}%;font-size:${Math.random() * 14 + 10}px;color:rgba(255,255,255,${Math.random() * 0.25 + 0.08});pointer-events:none;z-index:1;user-select:none;`;
            heroEl.appendChild(p);
            gsap.to(p, { y: `${(Math.random() - .5) * 60}`, x: `${(Math.random() - .5) * 40}`, rotation: (Math.random() - .5) * 180, duration: 4 + Math.random() * 4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: Math.random() * 3 });
            gsap.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 1.5, delay: 0.8 + Math.random() * 1.5 });
        }
    }

    // About entrance
    const aboutEl = document.querySelector('.big-statement');
    if (aboutEl) {
        gsap.set(aboutEl, { transformOrigin: 'center top' });
        gsap.fromTo(aboutEl,
            { yPercent: 5, scale: 0.94, borderRadius: '60px', opacity: 0.6 },
            {
                yPercent: 0, scale: 1, borderRadius: '0 0 40px 40px', opacity: 1,
                ease: 'power2.out',
                scrollTrigger: { trigger: aboutEl, start: 'top 95%', end: 'top 15%', scrub: 1.5 }
            }
        );
        gsap.fromTo('.big-statement-title, .big-statement-sub, .about-copy, .discover-row',
            { opacity: 0, y: 30 },
            {
                opacity: 1, y: 0, stagger: 0.08, ease: 'power2.out',
                scrollTrigger: { trigger: aboutEl, start: 'top 60%', end: 'top 20%', scrub: 1 }
            }
        );
    }

    // Stats section
    gsap.fromTo('.stat-item',
        { opacity: 0, y: 50 },
        {
            opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: '.stats-section', start: 'top 75%' }
        }
    );

    // Work items
    gsap.fromTo('.work-item',
        { opacity: 0, y: 60, scale: 0.95 },
        {
            opacity: 1, y: 0, scale: 1,
            stagger: 0.12, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: '.work-section', start: 'top 70%' }
        }
    );

    // Footer reveal
    gsap.fromTo('.footer-ticket',
        { y: 80, scale: 0.95, opacity: 0 },
        {
            y: 0, scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: '.footer', start: 'top 85%' }
        }
    );

    // Section labels
    gsap.utils.toArray('.section-label').forEach(label => {
        gsap.fromTo(label,
            { opacity: 0, x: -20 },
            {
                opacity: 1, x: 0, duration: 0.6, ease: 'power2.out',
                scrollTrigger: { trigger: label, start: 'top 85%' }
            }
        );
    });

});
