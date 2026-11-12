/* ==========================================================================
   Three Years of Us — interactions
   Vanilla JS only. Customize the date below to reuse this site.
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   1. Configuration
   -------------------------------------------------------------------------- */
const CONFIG = {
  // The day it all began (local time). Month is 0-indexed: 10 = November.
  startDate: new Date(2023, 10, 12, 0, 0, 0),
  // The exact 3-year anniversary (local time).
  anniversaryDate: new Date(2026, 10, 12, 0, 0, 0),
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --------------------------------------------------------------------------
   2. Live "time together" counter
   -------------------------------------------------------------------------- */
const counterEls = {
  years: document.getElementById('counterYears'),
  days: document.getElementById('counterDays'),
  hours: document.getElementById('counterHours'),
  minutes: document.getElementById('counterMinutes'),
  seconds: document.getElementById('counterSeconds'),
};

const pad = (value, length = 2) => String(value).padStart(length, '0');

function addYears(date, amount) {
  const next = new Date(date);
  next.setFullYear(date.getFullYear() + amount);
  return next;
}

// Time shared since `start`, broken into calendar years plus the remainder.
function getElapsedParts(now, start) {
  if (now < start) {
    return { years: 0, days: 0, hours: 0, minutes: 0, seconds: 0, started: false };
  }

  // Count complete calendar years first so leap years are handled correctly.
  let years = now.getFullYear() - start.getFullYear();
  let anchor = addYears(start, years);
  if (anchor > now) {
    years -= 1;
    anchor = addYears(start, years);
  }

  // Whole calendar days since the year anchor (DST-safe, unlike ms division).
  const MS_PER_DAY = 86400000;
  const anchorMidnight = Date.UTC(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  const nowMidnight = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  let days = Math.round((nowMidnight - anchorMidnight) / MS_PER_DAY);

  let secondsToday =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  secondsToday -= anchor.getHours() * 3600 + anchor.getMinutes() * 60 + anchor.getSeconds();
  if (secondsToday < 0) {
    secondsToday += 86400;
    days -= 1;
  }

  const hours = Math.floor(secondsToday / 3600);
  const minutes = Math.floor((secondsToday % 3600) / 60);
  const seconds = secondsToday % 60;

  return { years, days, hours, minutes, seconds, started: true };
}

let elapsedStarted = null;

function updateCounterCaption(started) {
  const caption = document.getElementById('counterCaption');
  if (!caption || elapsedStarted === started) return;
  elapsedStarted = started;
  caption.innerHTML = started
    ? '<i class="bi bi-heart-fill"></i> Loving you for'
    : '<i class="bi bi-heart-fill"></i> Our story begins on 12 November 2023';
}

function updateCounter() {
  const now = new Date();
  const parts = getElapsedParts(now, CONFIG.startDate);

  if (counterEls.years) counterEls.years.textContent = pad(parts.years);
  if (counterEls.days) counterEls.days.textContent = pad(parts.days);
  if (counterEls.hours) counterEls.hours.textContent = pad(parts.hours);
  if (counterEls.minutes) counterEls.minutes.textContent = pad(parts.minutes);
  if (counterEls.seconds) counterEls.seconds.textContent = pad(parts.seconds);

  updateCounterCaption(parts.started);

  // Keep the "days of us" total on calendar days, so DST never shifts it.
  const startMidnight = Date.UTC(
    CONFIG.startDate.getFullYear(),
    CONFIG.startDate.getMonth(),
    CONFIG.startDate.getDate()
  );
  const nowMidnight = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const totalDays = Math.max(0, Math.round((nowMidnight - startMidnight) / 86400000));
  document.querySelectorAll('[data-total-days]').forEach((el) => {
    el.textContent = totalDays.toLocaleString('en-US');
  });

  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = String(now.getFullYear());
}

// Tick on the second boundary so the seconds digit never skips or lags.
function scheduleCounter() {
  updateCounter();
  window.setTimeout(scheduleCounter, 1000 - (Date.now() % 1000));
}

scheduleCounter();

// Catch up immediately when the tab becomes visible again (timers are throttled).
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) updateCounter();
});

/* --------------------------------------------------------------------------
   3. Floating heart particles (hero canvas)
   -------------------------------------------------------------------------- */
function initHeartCanvas() {
  const canvas = document.getElementById('heartCanvas');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const colors = ['224, 80, 122', '249, 168, 191', '201, 161, 90', '176, 22, 64', '255, 201, 215'];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let frame = 0;
  let visible = true;
  let lastTime = 0;

  function drawHeart(x, y, size, rotation, color, alpha, blur) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = `rgba(${color}, ${alpha})`;
    if (blur) {
      ctx.shadowColor = `rgba(${color}, ${alpha})`;
      ctx.shadowBlur = blur;
    }
    const s = size;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(0, s * 0.08, -s * 0.5, s * 0.08, -s * 0.5, s * 0.42);
    ctx.bezierCurveTo(-s * 0.5, s * 0.72, 0, s * 0.9, 0, s * 1.12);
    ctx.bezierCurveTo(0, s * 0.9, s * 0.5, s * 0.72, s * 0.5, s * 0.42);
    ctx.bezierCurveTo(s * 0.5, s * 0.08, 0, s * 0.08, 0, s * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function makeParticle(randomY) {
    const kind = Math.random() < 0.16 ? 'spark' : 'heart';
    return {
      kind,
      x: Math.random() * width,
      y: randomY ? Math.random() * height : height + 40,
      size: kind === 'spark' ? 1.5 + Math.random() * 2.2 : 7 + Math.random() * 22,
      speed: 0.12 + Math.random() * 0.42,
      sway: 0.25 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      rotation: (Math.random() - 0.5) * 0.8,
      spin: (Math.random() - 0.5) * 0.004,
      alpha: kind === 'spark' ? 0.2 + Math.random() * 0.4 : 0.1 + Math.random() * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      blur: kind === 'heart' && Math.random() > 0.6 ? 18 : 0,
      twinkle: Math.random() * Math.PI * 2,
    };
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(16, Math.min(46, Math.floor(width / 30)));
    particles = Array.from({ length: count }, () => makeParticle(true));

    if (prefersReducedMotion) renderStatic();
  }

  function renderStatic() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      drawHeart(p.x, p.y, p.size, p.rotation, p.color, p.alpha, p.blur);
    });
  }

  function animate(time) {
    if (!visible) {
      frame = requestAnimationFrame(animate);
      return;
    }

    frame = requestAnimationFrame(animate);
    if (time - lastTime < 32) return; // gentle ~30fps for a dreamy feel
    lastTime = time;

    ctx.clearRect(0, 0, width, height);
    const t = time / 1000;

    particles.forEach((p) => {
      p.y -= p.speed;
      p.x += Math.sin(t * p.sway + p.phase) * 0.28;
      p.rotation += p.spin;

      if (p.kind === 'heart') {
        drawHeart(p.x, p.y, p.size, p.rotation, p.color, p.alpha, p.blur);
      } else {
        const glow = 0.45 + Math.sin(t * 1.5 + p.twinkle) * 0.35;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha * glow})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (p.y < -60) {
        const fresh = makeParticle(false);
        Object.assign(p, fresh);
      }
    });
  }

  resize();
  window.addEventListener('resize', resize);

  if (!prefersReducedMotion) {
    frame = requestAnimationFrame(animate);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else frame = requestAnimationFrame(animate);
    });
    const heroObserver = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
    }, { threshold: 0 });
    heroObserver.observe(canvas.closest('.hero') || canvas);
  }
}

initHeartCanvas();

/* --------------------------------------------------------------------------
   4. Scroll reveals
   -------------------------------------------------------------------------- */
function initReveals() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  items.forEach((item) => observer.observe(item));
}

initReveals();

/* --------------------------------------------------------------------------
   5. Navigation, scroll progress & active link
   -------------------------------------------------------------------------- */
function initNavigation() {
  const nav = document.getElementById('siteNav');
  const progress = document.getElementById('scrollProgress');
  const collapseEl = document.getElementById('mainNav');

  let ticking = false;

  function onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (nav) nav.classList.toggle('scrolled', scrollTop > 40);
    if (progress) progress.style.width = `${Math.min(100, (scrollTop / Math.max(docHeight, 1)) * 100)}%`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  // Close the mobile menu after choosing a link.
  document.querySelectorAll('#mainNav a').forEach((link) => {
    link.addEventListener('click', () => {
      if (collapseEl && collapseEl.classList.contains('show') && window.bootstrap) {
        window.bootstrap.Collapse.getOrCreateInstance(collapseEl).hide();
      }
    });
  });

  // Highlight the section currently in view.
  const sections = document.querySelectorAll('header[id], section[id]');
  const navLinks = document.querySelectorAll('#mainNav .nav-link');

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach((section) => observer.observe(section));
  }
}

initNavigation();

/* --------------------------------------------------------------------------
   6. Photo gallery + lightbox
   -------------------------------------------------------------------------- */
function initGallery() {
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const modalEl = document.getElementById('lightboxModal');
  if (!galleryItems.length || !modalEl || !window.bootstrap) return;

  const imageEl = document.getElementById('lightboxImage');
  const captionEl = document.getElementById('lightboxCaption');
  const metaEl = document.getElementById('lightboxMeta');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  const modal = new window.bootstrap.Modal(modalEl);

  const photos = galleryItems.map((item) => {
    const img = item.querySelector('img');
    return {
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt') || '',
      title: item.dataset.title || '',
      meta: item.dataset.meta || '',
    };
  });

  let current = 0;

  function render(index) {
    current = (index + photos.length) % photos.length;
    const photo = photos[current];
    imageEl.src = photo.src;
    imageEl.alt = photo.alt;
    captionEl.textContent = photo.title;
    metaEl.textContent = photo.meta;
    imageEl.animate(
      [{ opacity: 0, transform: 'scale(.985)' }, { opacity: 1, transform: 'none' }],
      { duration: prefersReducedMotion ? 1 : 420, easing: 'cubic-bezier(.2,.7,.2,1)' }
    );
  }

  function open(index) {
    render(index);
    modal.show();
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => open(index));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(index);
      }
    });
  });

  prevBtn.addEventListener('click', () => render(current - 1));
  nextBtn.addEventListener('click', () => render(current + 1));

  modalEl.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      render(current - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      render(current + 1);
    }
  });
}

initGallery();

/* --------------------------------------------------------------------------
   7. Confetti surprise
   -------------------------------------------------------------------------- */
function initSurprise() {
  const surpriseBtn = document.getElementById('surpriseBtn');
  const againBtn = document.getElementById('surpriseAgain');
  const modalEl = document.getElementById('surpriseModal');
  const messageEl = document.getElementById('surpriseMessage');
  if (!surpriseBtn || !modalEl || !window.bootstrap) return;

  const surpriseModal = new window.bootstrap.Modal(modalEl);
  const colors = ['#e0507a', '#f9a8bf', '#c9a15a', '#e7cfa3', '#b01640', '#fff1f5'];

  const messages = [
    'You are my favorite hello, my hardest goodbye, and my favorite everything in between.',
    'In every version of the future, I hope there is a version of us.',
    'Three years down, forever to go. I would choose you again in a heartbeat.',
    'If love were a place, it would feel exactly like you.',
    'Thank you for making ordinary days feel like a love song.',
    'You + me = my favorite kind of math.',
    'I love you more than yesterday, and less than tomorrow.',
    'Every love story is beautiful, but ours is my favorite.',
  ];

  let lastIndex = -1;

  function nextMessage() {
    let index = Math.floor(Math.random() * messages.length);
    if (messages.length > 1 && index === lastIndex) {
      index = (index + 1) % messages.length;
    }
    lastIndex = index;
    messageEl.textContent = messages[index];
  }

  function makeHeartShape() {
    if (typeof window.confetti.shapeFromPath !== 'function') return null;
    try {
      return window.confetti.shapeFromPath({
        path: 'M167.5 10C210.5 10 235 50 235 85C235 150 160 205 118 230C76 205 0 150 0 85C0 50 25 10 67.5 10C105 10 118 30 118 30C118 30 130 10 167.5 10Z',
      });
    } catch (error) {
      return null;
    }
  }

  function fallbackHearts() {
    const total = 28;
    for (let i = 0; i < total; i += 1) {
      const heart = document.createElement('span');
      heart.className = 'fallback-heart';
      heart.textContent = '♥';
      heart.setAttribute('aria-hidden', 'true');
      heart.style.left = `${Math.random() * 100}vw`;
      heart.style.fontSize = `${12 + Math.random() * 26}px`;
      heart.style.animationDuration = `${2.4 + Math.random() * 2.6}s`;
      heart.style.animationDelay = `${Math.random() * 0.8}s`;
      heart.style.color = colors[Math.floor(Math.random() * colors.length)];
      document.body.appendChild(heart);
      window.setTimeout(() => heart.remove(), 6000);
    }
  }

  function fireConfetti() {
    if (typeof window.confetti !== 'function') {
      fallbackHearts();
      return;
    }

    const burst = (options) => window.confetti({
      colors,
      zIndex: 3000,
      disableForReducedMotion: true,
      ...options,
    });

    burst({
      particleCount: prefersReducedMotion ? 40 : 110,
      spread: 78,
      startVelocity: 46,
      origin: { x: 0.5, y: 0.68 },
      scalar: 1.05,
    });

    window.setTimeout(() => {
      burst({
        particleCount: 55,
        angle: 62,
        spread: 58,
        startVelocity: 50,
        origin: { x: 0, y: 0.72 },
      });
    }, 160);

    window.setTimeout(() => {
      burst({
        particleCount: 55,
        angle: 118,
        spread: 58,
        startVelocity: 50,
        origin: { x: 1, y: 0.72 },
      });
    }, 200);

    const heart = makeHeartShape();
    if (heart) {
      window.setTimeout(() => {
        burst({
          particleCount: prefersReducedMotion ? 8 : 18,
          spread: 100,
          startVelocity: 30,
          origin: { x: 0.5, y: 0.6 },
          shapes: [heart],
          scalar: 2.2,
          gravity: 0.85,
          ticks: 240,
        });
      }, 320);
    }
  }

  surpriseBtn.addEventListener('click', () => {
    nextMessage();
    fireConfetti();
    window.setTimeout(() => surpriseModal.show(), 320);
  });

  if (againBtn) {
    againBtn.addEventListener('click', () => {
      nextMessage();
      fireConfetti();
    });
  }
}

initSurprise();

/* --------------------------------------------------------------------------
   8. Small niceties
   -------------------------------------------------------------------------- */
// Add a soft click ripple when the envelope is opened.
document.querySelectorAll('[data-bs-target="#letterModal"]').forEach((button) => {
  button.addEventListener('click', () => {
    if (prefersReducedMotion) return;
    button.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(.97)' }, { transform: 'scale(1)' }],
      { duration: 320, easing: 'ease-out' }
    );
  });
});

// Keep poster-quality rendering for local SVG artwork.
document.querySelectorAll('img').forEach((img) => {
  img.decoding = 'async';
});

