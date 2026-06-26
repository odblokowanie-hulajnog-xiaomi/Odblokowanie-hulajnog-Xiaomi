/* ============================================================
   ScooterMod.pl — Main JavaScript
   Version: 2026.1
   ============================================================ */

'use strict';

/* ---- Navbar scroll state ---- */
const navbar = document.querySelector('.navbar');
const scrollThreshold = 60;

function updateNavbar() {
  if (window.scrollY > scrollThreshold) {
    navbar?.classList.add('scrolled');
  } else {
    navbar?.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

/* ---- Mobile menu ---- */
const burger  = document.querySelector('.navbar__burger');
const mobileMenu = document.querySelector('.navbar__mobile');
const mobileLinks = document.querySelectorAll('.navbar__mobile-link');

burger?.addEventListener('click', () => {
  burger.classList.toggle('active');
  mobileMenu?.classList.toggle('open');
  document.body.style.overflow = mobileMenu?.classList.contains('open') ? 'hidden' : '';
});
mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    burger?.classList.remove('active');
    mobileMenu?.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ---- Particle Canvas ---- */
(function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r  = Math.random() * 1.5 + 0.3;
      this.a  = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.7 ? '#00ff88' : '#ffffff';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.a;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: 80 }, () => new Particle());
    loop();
  }

  function drawConnections() {
    const maxDist = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#00ff88';
          ctx.globalAlpha = (1 - dist / maxDist) * 0.08;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    init();
  });

  init();
})();

/* ---- Energy Lines (Hero) ---- */
(function initEnergyLines() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const lines = [30, 50, 70];
  lines.forEach((top, i) => {
    const el = document.createElement('div');
    el.className = 'energy-line';
    el.style.cssText = `
      top: ${top}%;
      width: ${200 + Math.random() * 300}px;
      animation-delay: ${i * 2.5}s;
      animation-duration: ${5 + i * 1.5}s;
    `;
    hero.appendChild(el);
  });
})();

/* ---- Scroll Reveal (IntersectionObserver) ---- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal, .stagger');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
})();

/* ---- Animated Counters ---- */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el   = entry.target;
      const end  = parseFloat(el.dataset.count);
      const dec  = (el.dataset.count.includes('.')) ? 1 : 0;
      const suffix = el.dataset.suffix || '';
      const dur  = 2000;
      let start  = null;

      function step(ts) {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / dur, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = (end * ease).toFixed(dec) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();

/* ---- FAQ Accordion ---- */
(function initFAQ() {
  document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq__item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq__item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
})();

/* ---- Testimonials Slider ---- */
(function initSlider() {
  const slider = document.querySelector('.testimonials__slider');
  const prevBtn = document.querySelector('.testimonials__btn--prev');
  const nextBtn = document.querySelector('.testimonials__btn--next');
  const dots    = document.querySelectorAll('.testimonials__dot');
  if (!slider) return;

  let current = 0;
  let autoTimer;

  function getVisible() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640)  return 2;
    return 1;
  }

  function totalSlides() {
    return slider.children.length - getVisible() + 1;
  }

  function goto(idx) {
    const max = totalSlides() - 1;
    current = Math.max(0, Math.min(idx, max));
    const cardW = slider.children[0].offsetWidth + 24;
    slider.style.transform = `translateX(-${current * cardW}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() { goto(current + 1 >= totalSlides() ? 0 : current + 1); }
  function prev() { goto(current - 1 < 0 ? totalSlides() - 1 : current - 1); }

  nextBtn?.addEventListener('click', () => { next(); resetAuto(); });
  prevBtn?.addEventListener('click', () => { prev(); resetAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goto(i); resetAuto(); }));

  function resetAuto() { clearInterval(autoTimer); autoTimer = setInterval(next, 5000); }
  resetAuto();

  window.addEventListener('resize', () => goto(0));

  /* Touch/swipe */
  let touchX = 0;
  slider.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); resetAuto(); }
  }, { passive: true });
})();

/* ---- Parallax on scroll ---- */
(function initParallax() {
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (!parallaxEls.length) return;

  function update() {
    parallaxEls.forEach(el => {
      const speed  = parseFloat(el.dataset.parallax) || 0.3;
      const rect   = el.getBoundingClientRect();
      const center = window.innerHeight / 2;
      const offset = (rect.top + rect.height / 2 - center) * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ---- Form submit (Formspree) ---- */
(function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Wklej tutaj swój Formspree Form ID po rejestracji na formspree.io
  const FORMSPREE_ID = 'xzdlrvzd';

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const rodo = form.querySelector('#rodo');
    if (rodo && !rodo.checked) {
      rodo.reportValidity();
      return;
    }

    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Wysyłanie…';
    btn.disabled = true;

    const data = new FormData(form);

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        form.style.display = 'none';
        const success = document.querySelector('.form__success');
        if (success) success.classList.add('show');
      } else {
        btn.textContent = 'Błąd — spróbuj ponownie';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Błąd sieci — spróbuj ponownie';
      btn.disabled = false;
    }
  });
})();

/* ---- Smooth anchor links ---- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ---- Ripple on buttons ---- */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
    btn.style.setProperty('--x', x);
    btn.style.setProperty('--y', y);
  });
});

/* ---- Hover tilt on cards (subtle) ---- */
document.querySelectorAll('.model-card, .why__card, .feature-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const rx = ((e.clientY - cy) / rect.height) * 4;
    const ry = ((e.clientX - cx) / rect.width)  * -4;
    card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
