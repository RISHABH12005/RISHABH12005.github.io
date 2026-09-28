const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(pointer: coarse)').matches;
const loader = document.querySelector('#loader');
const bar = loader?.querySelector('i');

if (bar && loader) {
  requestAnimationFrame(() => bar.classList.add('is-loaded'));
  window.setTimeout(() => loader.remove(), prefersReduced ? 120 : 760);
}

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!open));
  document.body.classList.toggle('nav-open', !open);
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
}));

const sceneMount = document.querySelector('#scene');
if (sceneMount) {
  const canvas = document.createElement('canvas');
  canvas.className = 'star-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  sceneMount.append(canvas);
  const context = canvas.getContext('2d', { alpha: false });
  const stars = [];
  const shootingStars = [];
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let pointerX = 0;
  let pointerY = 0;
  let active = true;
  let lastFrame = 0;

  const createStars = () => {
    stars.length = 0;
    const count = isTouch ? 260 : Math.min(720, Math.floor((innerWidth * innerHeight) / 2100));
    for (let index = 0; index < count; index += 1) {
      stars.push({
        x: Math.random(), y: Math.random(), z: 0.25 + Math.random() * 0.75,
        size: 0.35 + Math.random() * 1.35, alpha: 0.25 + Math.random() * 0.6,
        drift: (Math.random() - 0.5) * 0.000035
      });
    }
  };

  const resize = () => {
    width = innerWidth; height = innerHeight; pixelRatio = Math.min(devicePixelRatio, isTouch ? 1.25 : 1.75);
    canvas.width = width * pixelRatio; canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createStars();
  };

  const draw = (time = 0) => {
    if (!context) return;
    if (active && time - lastFrame > (isTouch ? 42 : 28)) {
      lastFrame = time;
      const reduced = prefersReduced ? 0.12 : 1;
      context.fillStyle = '#02030a'; context.fillRect(0, 0, width, height);
      const haze = context.createRadialGradient(width * 0.7, height * 0.18, 0, width * 0.7, height * 0.18, width * 0.7);
      haze.addColorStop(0, 'rgba(55, 67, 130, 0.12)'); haze.addColorStop(0.48, 'rgba(25, 30, 78, 0.035)'); haze.addColorStop(1, 'rgba(2, 3, 10, 0)');
      context.fillStyle = haze; context.fillRect(0, 0, width, height);
      const offsetX = pointerX * 16; const offsetY = pointerY * 10;
      stars.forEach(star => {
        star.x = (star.x + star.drift * reduced + 1) % 1;
        const x = star.x * width + offsetX * star.z;
        const y = star.y * height + offsetY * star.z;
        const twinkle = prefersReduced ? 1 : 0.82 + Math.sin(time * 0.0012 * star.z + star.x * 20) * 0.18;
        context.beginPath(); context.fillStyle = `rgba(211, 224, 255, ${star.alpha * twinkle})`;
        context.arc(x, y, star.size * star.z, 0, Math.PI * 2); context.fill();
      });
      if (!prefersReduced && !isTouch && Math.random() < 0.002 && shootingStars.length < 1) shootingStars.push({ x: Math.random() * width, y: Math.random() * height * 0.45, life: 0 });
      shootingStars.forEach((star, index) => {
        star.life += 0.018; const x = star.x + star.life * 210; const y = star.y + star.life * 120;
        const trail = context.createLinearGradient(x - 90, y - 50, x, y); trail.addColorStop(0, 'rgba(184, 207, 255, 0)'); trail.addColorStop(1, 'rgba(218, 231, 255, 0.6)');
        context.strokeStyle = trail; context.lineWidth = 1; context.beginPath(); context.moveTo(x - 90, y - 50); context.lineTo(x, y); context.stroke();
        if (star.life > 1) shootingStars.splice(index, 1);
      });
    }
    requestAnimationFrame(draw);
  };
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', event => { pointerX = event.clientX / innerWidth - 0.5; pointerY = event.clientY / innerHeight - 0.5; }, { passive: true });
  document.addEventListener('visibilitychange', () => { active = !document.hidden; });
  resize(); requestAnimationFrame(draw);
}

if (!prefersReduced && !isTouch) {
  document.querySelectorAll('.project').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
      card.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
      card.style.transform = 'translateY(-3px)';
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.section-head, .about-grid, .section-intro, .projects, .capabilities, .timeline, .education-line, .highlights, .contact-grid').forEach(el => { el.classList.add('reveal'); if (!prefersReduced) observer.observe(el); else el.classList.add('is-visible'); });
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.site-header nav a')];
  const activeObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) links.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`)); }), { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach(section => activeObserver.observe(section));
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => anchor.addEventListener('click', event => {
  const target = document.querySelector(anchor.getAttribute('href'));
  if (target) { event.preventDefault(); target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' }); }
}));

const schema = { '@context': 'https://schema.org', '@type': 'Person', name: 'Rishabh Jain', url: 'https://rishabh12005.me/', email: 'mailto:2r10j5@gmail.com', sameAs: ['https://github.com/RISHABH12005', 'https://www.linkedin.com/in/rishabh12005', 'https://www.youtube.com/@RISHABH12005'] };
const schemaScript = document.createElement('script'); schemaScript.type = 'application/ld+json'; schemaScript.textContent = JSON.stringify(schema); document.head.appendChild(schemaScript);
if (prefersReduced) document.documentElement.classList.add('reduced-motion');

window.addEventListener('scroll', () => document.body.classList.toggle('has-scrolled', scrollY > 24), { passive: true });
window.dispatchEvent(new Event('scroll'));

if (typeof document.startViewTransition === 'function') document.documentElement.classList.add('supports-view-transition');

// Keep keyboard users informed when the mobile menu opens.
menu?.addEventListener('keydown', event => { if (event.key === 'Escape') { menu.click(); menu.focus(); } });

// Prevent accidental focus on the hidden mobile menu while it is closed.
const syncNav = () => nav?.setAttribute('aria-hidden', String(menu?.getAttribute('aria-expanded') !== 'true' && innerWidth < 760));
window.addEventListener('resize', syncNav, { passive: true }); syncNav();

// Ensure external links never inherit a stale opener relationship.
document.querySelectorAll('a[target="_blank"]').forEach(link => link.rel = 'noopener noreferrer');

// Keep the opening copy calm for reduced-motion users.
if (prefersReduced) document.documentElement.style.setProperty('--motion-duration', '0ms');

// Hide the loader if a slow device stalls the first paint.
window.setTimeout(() => loader?.remove(), 1800);
