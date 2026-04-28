document.addEventListener('DOMContentLoaded', () => {
  // === SPA NAVIGATION ===
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Update active nav link
      document.querySelectorAll('.nav-links a[data-page]').forEach(a => a.classList.remove('active'));
      const activeLink = document.querySelector('.nav-links a[data-page="' + pageId + '"]');
      if (activeLink) activeLink.classList.add('active');
      // Close mobile menu
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
      // Re-trigger reveal animations
      setTimeout(() => initReveal(), 100);
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

  // === NAV SCROLL ===
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  // === SCROLL REVEAL ===
  function initReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => {
      if (!el.classList.contains('visible')) observer.observe(el);
    });
  }
  initReveal();

  // === PORTFOLIO FILTERS ===
  const filterTabs = document.querySelectorAll('.filter-tab');
  const portfolioCards = document.querySelectorAll('#portfolioGrid .work-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      portfolioCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });

  // === STAT COUNTER ANIMATION ===
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

  // === CONTACT FORM ===
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Sent with love! 💕';
      btn.style.background = 'var(--gold)';
      setTimeout(() => {
        btn.textContent = 'Send With Love ✨';
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  }

  // === SMOOTH HOVER FOR CARDS ===
  document.querySelectorAll('.work-card, .service-card, .pick-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });
  });
});
