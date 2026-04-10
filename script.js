// ========================================
// CatCatch — Inspired by Seen Advertising Agency
// ========================================

document.addEventListener('DOMContentLoaded', () => {

    // ===== Custom Cursor =====
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursor);
    document.body.appendChild(cursorDot);

    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    let isInitialized = false;

    document.addEventListener('mousemove', (e) => {
        if (!isInitialized) {
            cursor.classList.add('visible');
            cursorDot.classList.add('visible');
            cursorX = e.clientX;
            cursorY = e.clientY;
            isInitialized = true;
        }
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });

    document.addEventListener('mouseleave', () => {
        cursor.classList.remove('visible');
        cursorDot.classList.remove('visible');
    });

    document.addEventListener('mouseenter', () => {
        cursor.classList.add('visible');
        cursorDot.classList.add('visible');
    });

    (function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        requestAnimationFrame(animateCursor);
    })();

    document.querySelectorAll('a, button, .btn-discover, .work-item, .nav-link, .nav-logo img').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
    });

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

    // ===== Navbar Active =====
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const activateNav = () => {
        let current = '';
        sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) current = s.getAttribute('id'); });
        navLinks.forEach(l => {
            l.classList.remove('active');
            if (l.getAttribute('href') === '#' + current) l.classList.add('active');
        });
    };
    window.addEventListener('scroll', activateNav);
    activateNav();

    // ===== Smooth Scroll =====
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href?.startsWith('#')) {
                e.preventDefault();
                document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
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

    // ===== Hero mascot parallax =====
    const mascot = document.querySelector('.hero-mascot video');
    if (mascot) {
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 8;
            const y = (e.clientY / window.innerHeight - 0.5) * 8;
            mascot.style.transform = `rotate(${x * 0.3}deg) translate(${x}px, ${y}px)`;
        });
    }

    // ===== About hover parallax =====
    const aboutSection = document.querySelector('#about');
    const airplane = document.querySelector('.statement-icon');
    const bag = document.querySelector('.discover-bag');
    if (aboutSection && airplane) {
        aboutSection.addEventListener('mousemove', (e) => {
            const r = aboutSection.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width - 0.5) * 22;
            const y = ((e.clientY - r.top) / r.height - 0.5) * 16;
            airplane.classList.add('is-hovering');
            airplane.style.transform = `translate(${x}px, ${y}px) rotate(${x * 0.4}deg)`;
            if (bag) bag.style.transform = `translate(${-x * 0.25}px, ${Math.abs(y) * 0.2}px) rotate(${8 - x * 0.25}deg)`;
        });
        aboutSection.addEventListener('mouseleave', () => {
            airplane.classList.remove('is-hovering');
            airplane.style.transform = '';
            if (bag) bag.style.transform = '';
        });
    }

    // ===== Magnetic buttons =====
    document.querySelectorAll('.btn-magnetic, .btn-discover, .social-circle').forEach(btn => {
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
            { yPercent: 0, rotateX: 0, stagger: 0.045, duration: 1.1, ease: 'expo.out', delay: 0.3 }
        );
    }

    // Hero subtitle fade-up
    gsap.fromTo('.hero-subtitle',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 1.1 }
    );

    // Hero mascot — elastic bounce entrance
    const heroMascot = document.querySelector('.hero-mascot');
    if (heroMascot) {
        gsap.fromTo(heroMascot,
            { opacity: 0, y: -60, rotate: 0, scale: 0.7 },
            { opacity: 1, y: 0, rotate: 0, scale: 1, duration: 1.4, ease: 'elastic.out(1, 0.55)', delay: 0.6 }
        );
    }

    // Hero wrapper scale-in
    const heroWrapper = document.querySelector('.hero-text-wrapper');
    if (heroWrapper) {
        gsap.fromTo(heroWrapper,
            { opacity: 0, scale: 0.96 },
            { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out', delay: 0.1 }
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