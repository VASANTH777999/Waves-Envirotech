/* ================================================================
   WAVES ENVIROTECH — Premium JavaScript v4
   Hero Slider · AOS · Counters · Gallery · Forms
   ================================================================ */
'use strict';

/* ── Preloader ─────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const pre = document.getElementById('preloader');
    if (pre) { pre.classList.add('hidden'); setTimeout(() => pre.remove(), 600); }
    initAOS();
    initCounters();
    initHeroSlider();
  }, 1200);
});

/* ── NCC-Style Header: White Bar + Dark Navy Nav ──────────────── */
const navbar    = document.getElementById('navbar');
const headerTop = document.getElementById('header-top');

function getHeaderTopH() {
  return headerTop ? headerTop.offsetHeight : 0;
}

function handleScroll() {
  if (!navbar) return;
  const ht = getHeaderTopH();
  const scrolled = window.scrollY > ht;

  /* Dark navy nav — moves to top:0 when white bar scrolls away */
  navbar.classList.toggle('scrolled', scrolled);
  if (headerTop) {
    headerTop.classList.toggle('hidden', scrolled);
    navbar.style.top = scrolled ? '0' : `${ht}px`;
  } else {
    navbar.style.top = '0';
  }

  const btt = document.getElementById('back-to-top');
  if (btt) btt.classList.toggle('visible', window.scrollY > 450);
}
window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

/* ── Mobile Menu ───────────────────────────────────────────────── */
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const active = mobileMenu.classList.toggle('active');
    hamburger.classList.toggle('active', active);
    document.body.style.overflow = active ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

/* ── Back to Top ───────────────────────────────────────────────── */
const bttBtn = document.getElementById('back-to-top');
if (bttBtn) bttBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── AOS (Animate On Scroll) ───────────────────────────────────── */
function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  if (!elements.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.getAttribute('data-aos-delay') || 0);
        setTimeout(() => entry.target.classList.add('aos-animate'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  elements.forEach(el => observer.observe(el));
}

/* ── Counter Animation ─────────────────────────────────────────── */
function animateCounter(el) {
  if (el.classList.contains('counted')) return;
  el.classList.add('counted');
  const target = parseInt(el.getAttribute('data-target') || el.textContent);
  const suffix = el.getAttribute('data-suffix') || '';
  const prefix = el.getAttribute('data-prefix') || '';
  const duration = parseInt(el.getAttribute('data-duration') || 2200);
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = prefix + Math.round(target * eased).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(c => observer.observe(c));
}

/* ── Hero Slider ───────────────────────────────────────────────── */
function initHeroSlider() {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;
  const slides   = slider.querySelectorAll('.hs-slide');
  const dots     = slider.querySelectorAll('.hs-dot');
  const prevBtn  = slider.querySelector('.hs-prev');
  const nextBtn  = slider.querySelector('.hs-next');
  const fill     = slider.querySelector('.hs-progress-fill');
  const currentEl = slider.querySelector('.hs-current');
  const DURATION = 6000;
  let current = 0, timer, progressTimer;

  function pad(n) { return n < 10 ? '0' + n : n; }

  function setFill(start, dur) {
    if (fill) {
      fill.style.transition = 'none';
      fill.style.width = '0%';
      requestAnimationFrame(() => {
        fill.style.transition = `width ${dur}ms linear`;
        fill.style.width = '100%';
      });
    }
  }

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
    if (currentEl) currentEl.textContent = pad(current + 1);
    setFill(performance.now(), DURATION);
    clearTimeout(timer);
    timer = setTimeout(() => goTo(current + 1), DURATION);
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  // Keyboard
  document.addEventListener('keydown', e => {
    if (!slider) return;
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Touch swipe
  let touchStartX = 0;
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1);
  }, { passive: true });

  goTo(0);
}

/* ── Hero Canvas Particle System ───────────────────────────────── */
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(Math.floor((W * H) / 10000), 90);
    const colors = ['rgba(0,212,255,', 'rgba(0,168,107,', 'rgba(116,185,255,', 'rgba(85,239,196,'];
    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const opacity = Math.random() * 0.35 + 0.08;
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 3 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.55 - 0.1,
        color: color + opacity + ')',
        alpha: opacity,
        baseAlpha: opacity,
      });
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.12;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => {
      // Mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100 * 0.8;
        p.vx += (dx / dist) * force * 0.04;
        p.vy += (dy / dist) * force * 0.04;
      }

      // Damping
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.y < -10) p.y = H + 10;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y > H + 10) p.y = -10;

      // Draw
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();

  window.addEventListener('resize', () => { resize(); createParticles(); });
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });
})();

/* ── Typed Text Effect ─────────────────────────────────────────── */
(function initTyped() {
  const el = document.getElementById('hero-typed');
  if (!el) return;
  const words = (el.getAttribute('data-words') || '').split(',').map(w => w.trim()).filter(Boolean);
  if (!words.length) return;
  let wi = 0, ci = 0, deleting = false;
  const cursor = document.createElement('span');
  cursor.style.cssText = 'display:inline-block;width:2px;height:1em;background:currentColor;margin-left:2px;vertical-align:middle;animation:blink .75s step-end infinite;';
  const style = document.createElement('style');
  style.textContent = '@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}';
  document.head.appendChild(style);

  function type() {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(type, 2200); return; }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
    }
    el.appendChild(cursor);
    setTimeout(type, deleting ? 55 : 85);
  }
  type();
})();

/* ── Project Filter ────────────────────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectItems = document.querySelectorAll('.project-item');
if (filterBtns.length && projectItems.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      projectItems.forEach(item => {
        const show = filter === 'all' || item.getAttribute('data-category') === filter;
        item.classList.toggle('show', show);
      });
    });
  });
  document.querySelector('.filter-btn[data-filter="all"]')?.click();
}

/* ── Contact Form ──────────────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type=submit]');
    const feedback = document.getElementById('contactFeedback');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
    btn.disabled = true;
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(contactForm))) });
      const json = await res.json();
      feedback.className = 'alert alert-' + (json.success ? 'success' : 'error');
      feedback.innerHTML = `<i class="fa-solid fa-${json.success ? 'circle-check' : 'circle-exclamation'}"></i> ${json.message || (json.success ? 'Sent!' : 'Error')}`;
      feedback.style.display = 'flex';
      if (json.success) contactForm.reset();
    } catch {
      feedback.className = 'alert alert-error';
      feedback.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Connection error. Try again.';
      feedback.style.display = 'flex';
    }
    btn.innerHTML = orig; btn.disabled = false;
    setTimeout(() => { feedback.style.display = 'none'; }, 6000);
  });
}

/* ── Career Form ───────────────────────────────────────────────── */
const careerForm = document.getElementById('careerForm');
if (careerForm) {
  careerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = careerForm.querySelector('button[type=submit]');
    const feedback = document.getElementById('careerFeedback');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting…';
    btn.disabled = true;
    try {
      const res = await fetch('/api/careers/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(careerForm))) });
      const json = await res.json();
      feedback.className = 'alert alert-' + (json.success ? 'success' : 'error');
      feedback.innerHTML = `<i class="fa-solid fa-${json.success ? 'circle-check' : 'circle-exclamation'}"></i> ${json.message || (json.success ? 'Submitted!' : 'Error')}`;
      feedback.style.display = 'flex';
      if (json.success) careerForm.reset();
    } catch {
      feedback.className = 'alert alert-error';
      feedback.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Error submitting application.';
      feedback.style.display = 'flex';
    }
    btn.innerHTML = orig; btn.disabled = false;
  });
}

/* ── Newsletter ────────────────────────────────────────────────── */
document.querySelectorAll('.newsletter-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type=email]');
    const btn   = form.querySelector('button');
    if (!input?.value) return;
    btn.textContent = '✓'; btn.style.background = '#00A86B';
    try { await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: input.value }) }); } catch {}
    input.value = '';
    setTimeout(() => { btn.textContent = 'Subscribe'; btn.style.background = ''; }, 3000);
  });
});

/* ── Testimonials Slider ───────────────────────────────────────── */
(function initSlider() {
  const container = document.querySelector('.testimonials-slider');
  if (!container) return;
  const slides = container.querySelectorAll('.testimonial-slide');
  const dots   = document.querySelectorAll('.slider-dot');
  if (!slides.length) return;
  let current = 0, timer;
  function goTo(i) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (i + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }
  document.querySelector('.slider-prev')?.addEventListener('click', () => { clearInterval(timer); goTo(current - 1); });
  document.querySelector('.slider-next')?.addEventListener('click', () => { clearInterval(timer); goTo(current + 1); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { clearInterval(timer); goTo(i); }));
  goTo(0);
  timer = setInterval(() => goTo(current + 1), 5500);
})();

/* ── Active Nav Link ───────────────────────────────────────────── */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) link.classList.add('active');
});

/* ── Smooth Scroll ─────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ── Gallery Lightbox ──────────────────────────────────────────── */
(function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.style.cssText = 'position:fixed;inset:0;background:rgba(2,8,20,.95);z-index:9998;display:none;align-items:center;justify-content:center;backdrop-filter:blur(8px);';
  lb.innerHTML = `
    <button id="lb-close" style="position:absolute;top:24px;right:24px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:1.4rem;cursor:pointer;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;">&times;</button>
    <img id="lb-img" style="max-width:90%;max-height:88vh;border-radius:16px;object-fit:contain;box-shadow:0 32px 80px rgba(0,0,0,.6);">
  `;
  document.body.appendChild(lb);
  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) { document.getElementById('lb-img').src = img.src; lb.style.display = 'flex'; }
    });
  });
  lb.querySelector('#lb-close').addEventListener('click', () => { lb.style.display = 'none'; });
  lb.addEventListener('click', e => { if (e.target === lb) lb.style.display = 'none'; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.style.display = 'none'; });
})();

/* ── Parallax Hero BG ──────────────────────────────────────────── */
const heroBg = document.querySelector('.hero-bg');
if (heroBg) {
  window.addEventListener('scroll', () => {
    heroBg.style.transform = `translateY(${window.scrollY * 0.28}px)`;
  }, { passive: true });
}

/* ── Tab System ────────────────────────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.closest('.tabs-wrapper');
    if (!group) return;
    group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    group.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const target = group.querySelector('#' + btn.getAttribute('data-tab'));
    if (target) target.classList.add('active');
  });
});

/* ── Projects Showcase Filter ──────────────────────────────────── */
(function initShowcaseFilter() {
  const tabs = document.querySelectorAll('.stab');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.filter;          // tabs use data-filter
      document.querySelectorAll('.sc-card').forEach(card => {
        if (cat === 'all' || card.dataset.cat === cat) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ── Showcase Card Lightbox (NCC-style) ────────────────────────── */
(function initShowcaseLightbox() {
  const cards = document.querySelectorAll('.sc-card');
  if (!cards.length) return;

  const lb = document.createElement('div');
  lb.id = 'scLightbox';
  lb.className = 'sc-lightbox';
  lb.innerHTML = `
    <div class="sc-lb-backdrop"></div>
    <button class="sc-lb-close" aria-label="Close">&times;</button>
    <button class="sc-lb-nav sc-lb-prev" aria-label="Previous">&#10094;</button>
    <button class="sc-lb-nav sc-lb-next" aria-label="Next">&#10095;</button>
    <div class="sc-lb-box">
      <img class="sc-lb-img" src="" alt="">
      <div class="sc-lb-caption"></div>
    </div>`;
  document.body.appendChild(lb);

  const lbImg = lb.querySelector('.sc-lb-img');
  const lbCap = lb.querySelector('.sc-lb-caption');
  let idx = 0;

  function visible() {
    return [...cards].filter(c => !c.classList.contains('hidden'));
  }

  function openAt(i) {
    const vis = visible();
    if (!vis.length) return;
    idx = ((i % vis.length) + vis.length) % vis.length;
    const card = vis[idx];
    const img  = card.querySelector('.sc-img img');
    lbImg.src  = img ? img.src : '';
    lbImg.alt  = card.dataset.title || '';
    lbCap.textContent = card.dataset.title || card.querySelector('h3')?.textContent || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      const vis = visible();
      const vi  = vis.indexOf(card);
      if (vi !== -1) openAt(vi);
    });
  });

  lb.querySelector('.sc-lb-backdrop').addEventListener('click', close);
  lb.querySelector('.sc-lb-close').addEventListener('click', close);
  lb.querySelector('.sc-lb-prev').addEventListener('click', e => { e.stopPropagation(); openAt(idx - 1); });
  lb.querySelector('.sc-lb-next').addEventListener('click', e => { e.stopPropagation(); openAt(idx + 1); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  openAt(idx - 1);
    if (e.key === 'ArrowRight') openAt(idx + 1);
  });
})();

/* ── India Map Tooltips ────────────────────────────────────────── */
(function initMapTooltips() {
  const pins = document.querySelectorAll('.map-pin');
  const tooltip = document.querySelector('.map-tooltip');
  if (!pins.length || !tooltip) return;
  pins.forEach(pin => {
    pin.addEventListener('mouseenter', (e) => {
      const city = pin.dataset.city || '';
      const project = pin.dataset.project || '';
      tooltip.textContent = project ? `${city} — ${project}` : city;
      tooltip.classList.add('visible');
    });
    pin.addEventListener('mousemove', (e) => {
      const wrap = pin.closest('.india-map-wrap');
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left + 12;
      const y = e.clientY - rect.top - 36;
      tooltip.style.left = x + 'px';
      tooltip.style.top  = y + 'px';
    });
    pin.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
  });
})();

/* ── Home Contact Form ─────────────────────────────────────────── */
(function initHomeContactForm() {
  const form = document.getElementById('homeContactForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.ch-submit');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
    btn.disabled = true;
    const data = {
      name:    form.querySelector('[name="name"]')?.value    || '',
      email:   form.querySelector('[name="email"]')?.value   || '',
      phone:   form.querySelector('[name="phone"]')?.value   || '',
      service: form.querySelector('[name="service"]')?.value || '',
      message: form.querySelector('[name="message"]')?.value || ''
    };
    try {
      const res = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
      if (res.ok) {
        btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        btn.style.background = '#00A86B';
        form.reset();
        setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false; }, 3500);
      } else {
        throw new Error('Server error');
      }
    } catch {
      btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed — Try Again';
      btn.style.background = '#E53E3E';
      setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false; }, 3000);
    }
  });
})();

/* ── Staggered Section Reveal ──────────────────────────────────── */
(function initStagger() {
  const sections = document.querySelectorAll('.stagger-children');
  if (!sections.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const children = entry.target.querySelectorAll(':scope > *');
      children.forEach((child, i) => {
        setTimeout(() => {
          child.style.opacity = '1';
          child.style.transform = 'none';
        }, i * 80);
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  sections.forEach(s => {
    Array.from(s.children).forEach(child => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(16px)';
      child.style.transition = 'opacity .5s ease, transform .5s ease';
    });
    observer.observe(s);
  });
})();
