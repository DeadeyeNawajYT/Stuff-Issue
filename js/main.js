/*  ═══════════════════════════════════════════════════
    STUFF ISSUE — Premium Animated Website Engine
    GSAP + ScrollTrigger + Lenis Smooth Scroll
    ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ═══ PART 12: REDUCED MOTION CHECK ═══
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ═══ PART 2: REGISTER GSAP PLUGINS ═══
  gsap.registerPlugin(ScrollTrigger);

  // ═══ PART 1: LENIS SMOOTH SCROLL ENGINE ═══
  let lenis = null;
  const isMobile = window.innerWidth < 768;

  if (!isMobile && !prefersReducedMotion) {
    lenis = new Lenis({
      lerp: 0.08,
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // Sync Lenis with GSAP ticker
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // Sync Lenis with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
  }

  // ═══ SPA NAVIGATION (preserved) ═══
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('[data-page]');
  const nav = document.getElementById('mainNav');
  const mobileMenu = document.getElementById('mobileMenu');
  const navToggle = document.getElementById('navToggle');
  const mobileClose = document.getElementById('mobileClose');

  function navigateTo(pageId) {
    pages.forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) {
      target.classList.add('active');

      // Scroll to top
      if (lenis) { lenis.scrollTo(0, { immediate: true }); }
      else { window.scrollTo({ top: 0 }); }

      // Update active nav link
      document.querySelectorAll('.nav-links a[data-page]').forEach(a => a.classList.remove('active'));
      const activeLink = document.querySelector('.nav-links a[data-page="' + pageId + '"]');
      if (activeLink) activeLink.classList.add('active');

      // Close mobile menu
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';

      // Kill existing ScrollTriggers and re-init animations
      ScrollTrigger.getAll().forEach(st => st.kill());
      setTimeout(() => {
        initSectionAnimations();
        ScrollTrigger.refresh();
      }, 150);
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });

  // Mobile menu
  navToggle.addEventListener('click', () => {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  mobileClose.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });

  // ═══ PART 9: SCROLL PROGRESS INDICATOR ═══
  const scrollProgress = document.getElementById('scroll-progress');
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  // ═══ PART 3: NAVBAR BEHAVIOR ═══
  const navLogo = nav.querySelector('.nav-logo img');

  function updateNav() {
    const scrolled = window.scrollY > 80;
    nav.classList.toggle('scrolled', scrolled);

    if (!prefersReducedMotion && navLogo) {
      gsap.to(navLogo, {
        scale: scrolled ? 0.95 : 1,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: true
      });
    }
  }
  window.addEventListener('scroll', updateNav, { passive: true });

  // ═══ PART 8: TEXT SPLIT ANIMATION (Hero H1) ═══
  function splitHeroText() {
    const h1 = document.querySelector('#page-home .hero h1');
    if (!h1 || h1.dataset.split === 'done') return;

    const html = h1.innerHTML;
    // Split text nodes into words, preserving HTML tags
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    let result = '';
    function processNode(node) {
      if (node.nodeType === 3) { // text node
        const words = node.textContent.split(/(\s+)/);
        words.forEach(word => {
          if (word.trim() === '') {
            result += word;
          } else {
            result += `<span class="word" style="display:inline-block;overflow:hidden;vertical-align:top"><span class="word-inner" style="display:inline-block">${word}</span></span>`;
          }
        });
      } else if (node.nodeType === 1) { // element node
        const tag = node.tagName.toLowerCase();
        result += `<${tag}>`;
        node.childNodes.forEach(child => processNode(child));
        result += `</${tag}>`;
      }
    }
    wrapper.childNodes.forEach(child => processNode(child));
    h1.innerHTML = result;
    h1.dataset.split = 'done';
  }

  // ═══ PART 4: HERO SECTION ENTRANCE ═══
  function initHeroAnimation() {
    const activePage = document.querySelector('.page.active');
    if (!activePage || activePage.id !== 'page-home') return;

    const hero = activePage.querySelector('.hero');
    if (!hero) return;

    // Split hero text
    splitHeroText();

    const tagline = hero.querySelector('.hero-tagline');
    const h1 = hero.querySelector('h1');
    const wordInners = hero.querySelectorAll('.word-inner');
    const sub = hero.querySelector('.hero-sub');
    const buttons = hero.querySelector('.hero-buttons');
    const banner = hero.querySelector('.hero-banner');
    const particles = hero.querySelector('.hero-particles');

    if (prefersReducedMotion) {
      // Show everything immediately for reduced motion
      [tagline, h1, sub, buttons, banner].forEach(el => {
        if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
      });
      return;
    }

    // Set initial states
    gsap.set(tagline, { y: 40, opacity: 0 });
    gsap.set(wordInners, { y: '110%', opacity: 0 });
    gsap.set(sub, { y: 30, opacity: 0 });
    gsap.set(buttons, { y: 30, opacity: 0 });
    gsap.set(banner, { x: 60, opacity: 0 });

    // Staggered entrance timeline
    const heroTL = gsap.timeline({ delay: 0.2 });

    heroTL
      .to(tagline, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' })
      .to(wordInners, {
        y: '0%', opacity: 1, stagger: 0.06, duration: 0.9,
        ease: 'power4.out'
      }, '-=0.4')
      .to(sub, { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' }, '-=0.5')
      .to(buttons, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.5')
      .to(banner, {
        x: 0, opacity: 1, duration: 1.1,
        ease: 'power3.out'
      }, 0.5);

    // Hero scroll-out parallax effect
    gsap.to(h1, {
      y: -60, opacity: 0,
      scrollTrigger: {
        trigger: hero, start: 'top top', end: 'bottom top',
        scrub: 1
      }
    });

    if (particles) {
      gsap.to(particles, {
        y: -120,
        scrollTrigger: {
          trigger: hero, start: 'top top', end: 'bottom top',
          scrub: 1.5
        }
      });
    }

    if (banner) {
      gsap.to(banner.querySelector('img'), {
        scale: 1.08, y: -40,
        scrollTrigger: {
          trigger: hero, start: 'top top', end: 'bottom top',
          scrub: 1
        }
      });
    }
  }

  // ═══ PART 5 & 6: SECTION ENTRANCE TRIGGERS + PARALLAX ═══
  function initSectionAnimations() {
    if (prefersReducedMotion) {
      // Show all elements for reduced motion
      document.querySelectorAll('.reveal, .reveal-left').forEach(el => {
        el.classList.add('visible');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const activePage = document.querySelector('.page.active');
    if (!activePage) return;

    // Section labels
    activePage.querySelectorAll('.section-label').forEach(el => {
      gsap.fromTo(el,
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        }
      );
    });

    // Section headings
    activePage.querySelectorAll('.section-title').forEach(el => {
      gsap.fromTo(el,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, delay: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        }
      );
    });

    // Section paragraphs
    activePage.querySelectorAll('.section-desc, .hook-quote').forEach(el => {
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, delay: 0.25, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        }
      );
    });

    // Cards / grid items (stagger)
    const cardGroups = activePage.querySelectorAll(
      '.services-grid, .benefits-grid, .stats-grid'
    );
    cardGroups.forEach(group => {
      const cards = group.children;
      gsap.fromTo(cards,
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.7,
          stagger: 0.12, delay: 0.2, ease: 'back.out(1.4)',
          scrollTrigger: { trigger: group, start: 'top 82%', once: true }
        }
      );
    });

    // Images / visuals (not about logo)
    activePage.querySelectorAll('.hero-banner img').forEach(el => {
      gsap.fromTo(el,
        { scale: 0.92, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 1, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        }
      );
    });

    // About logo entrance
    activePage.querySelectorAll('.about-img').forEach(el => {
      gsap.fromTo(el,
        { x: -50, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        }
      );
    });

    // About philosophy card
    activePage.querySelectorAll('.about-philosophy').forEach(el => {
      gsap.fromTo(el,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        }
      );
    });

    // Contact form and info
    activePage.querySelectorAll('.contact-form, .contact-info').forEach(el => {
      gsap.fromTo(el,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, delay: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        }
      );
    });

    // CTA buttons in sections
    activePage.querySelectorAll('.cta-section .btn').forEach(el => {
      gsap.fromTo(el,
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, delay: 0.4, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        }
      );
    });

    // PART 6: Parallax — Hero banner image
    const heroBannerImg = activePage.querySelector('.hero-banner img');
    if (heroBannerImg) {
      gsap.to(heroBannerImg, {
        y: -80,
        scrollTrigger: {
          trigger: '.hero', start: 'top top', end: 'bottom top',
          scrub: 1
        }
      });
    }

    // PART 11: Footer entrance
    const footer = document.querySelector('.footer');
    if (footer) {
      gsap.fromTo(footer,
        { y: 80, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: footer, start: 'top 92%', once: true }
        }
      );

      // Footer links stagger
      const footerItems = footer.querySelectorAll('.footer-brand, .footer-tagline, .footer-social a, .footer-copy');
      gsap.fromTo(footerItems,
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.08, duration: 0.6, delay: 0.2,
          ease: 'power2.out',
          scrollTrigger: { trigger: footer, start: 'top 92%', once: true }
        }
      );
    }
  }

  // ═══ PART 7: INTERACTIVE HOVER STATES ═══
  function initHoverEffects() {
    if (prefersReducedMotion) return;

    // All cards hover
    document.querySelectorAll('.service-card, .benefit-card, .contact-form, .contact-info').forEach(card => {
      card.style.willChange = 'transform';
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { y: -8, scale: 1.03, duration: 0.3, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { y: 0, scale: 1, duration: 0.35, ease: 'power2.inOut' });
      });
    });

    // All buttons
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        gsap.to(btn, { scale: 1.06, duration: 0.25, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { scale: 1, duration: 0.25, ease: 'power2.out' });
      });
      btn.addEventListener('click', () => {
        gsap.to(btn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
      });
    });

    // Images hover
    document.querySelectorAll('.hero-banner img, .about-img img').forEach(img => {
      img.addEventListener('mouseenter', () => {
        gsap.to(img, { scale: 1.04, duration: 0.5, ease: 'power1.out' });
      });
      img.addEventListener('mouseleave', () => {
        gsap.to(img, { scale: 1, duration: 0.5, ease: 'power1.out' });
      });
    });

    // Stat items hover
    document.querySelectorAll('.stat-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        gsap.to(item, { y: -4, scale: 1.05, duration: 0.3, ease: 'power2.out' });
      });
      item.addEventListener('mouseleave', () => {
        gsap.to(item, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
      });
    });
  }

  // ═══ STAT COUNTER ANIMATION (preserved) ═══
  const stats = document.querySelectorAll('.stat-item h3');
  let statAnimated = false;
  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !statAnimated) {
      statAnimated = true;
      stats.forEach(stat => {
        const text = stat.textContent;
        const num = parseFloat(text);
        const suffix = text.replace(/[0-9.]/g, '');
        let current = 0;
        const step = num / 40;
        const interval = setInterval(() => {
          current += step;
          if (current >= num) { current = num; clearInterval(interval); }
          stat.textContent = (num % 1 !== 0 ? current.toFixed(1) : Math.floor(current)) + suffix;
        }, 30);
      });
    }
  }, { threshold: 0.5 });
  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) statsObserver.observe(statsBar);

  // ═══ CONTACT FORM (preserved) ═══
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Sent with love! 💕';
      btn.style.background = 'var(--yellow)';
      setTimeout(() => {
        btn.textContent = 'Send With Love ✨';
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  }

  // ═══ PART 12: PERFORMANCE & CLEANUP ═══
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

  window.addEventListener('beforeunload', () => {
    ScrollTrigger.killAll();
  });

  // ═══ INITIALIZE EVERYTHING ═══
  initHeroAnimation();
  initSectionAnimations();
  initHoverEffects();
});
