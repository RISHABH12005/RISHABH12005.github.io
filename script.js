import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

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

if (!prefersReduced && !isTouch) {
  document.querySelectorAll('.project').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
      card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
      card.style.transform = `perspective(1200px) rotateX(${-y * 1.5}deg) rotateY(${x * 2}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

const sceneMount = document.querySelector('#scene');
if (sceneMount && 'WebGLRenderingContext' in window) {
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
    camera.position.z = 8;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
    renderer.setSize(innerWidth, innerHeight);
    sceneMount.appendChild(renderer.domElement);

    const count = isTouch ? 520 : 1050;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 3 + Math.random() * 15;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 13;
      positions[i * 3 + 2] = -Math.random() * 20;
    }
    const stars = new THREE.BufferGeometry();
    stars.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starField = new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xcbd6ff, size: isTouch ? 0.025 : 0.035, transparent: true, opacity: 0.7, sizeAttenuation: true }));
    scene.add(starField);

    let targetX = 0, targetY = 0, active = true;
    window.addEventListener('pointermove', event => { targetX = (event.clientX / innerWidth - 0.5) * 0.22; targetY = (event.clientY / innerHeight - 0.5) * 0.12; }, { passive: true });
    const resize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => { active = !document.hidden; });
    const clock = new THREE.Clock();
    const animate = () => {
      if (active && !prefersReduced) {
        const time = clock.getElapsedTime();
        starField.rotation.y += 0.00012;
        starField.rotation.x = (starField.rotation.x * 0.98) + targetY * 0.02;
        camera.position.x += (targetX - camera.position.x) * 0.012;
        camera.position.y += (-targetY - camera.position.y) * 0.012;
        camera.lookAt(0, 0, -5);
        renderer.render(scene, camera);
      } else if (active) renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    resize();
    animate();
  } catch (error) {
    sceneMount.classList.add('is-fallback');
  }
} else if (sceneMount) sceneMount.classList.add('is-fallback');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.section-head, .about-grid, .section-intro, .projects, .capabilities, .timeline, .education-line, .highlights, .contact-grid').forEach(el => { el.classList.add('reveal'); if (!prefersReduced) observer.observe(el); else el.classList.add('is-visible'); });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => anchor.addEventListener('click', event => {
  const target = document.querySelector(anchor.getAttribute('href'));
  if (target) { event.preventDefault(); target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' }); }
}));

if ('IntersectionObserver' in window) {
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.site-header nav a')];
  const activeObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) links.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`)); }), { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach(section => activeObserver.observe(section));
}

const schema = { '@context': 'https://schema.org', '@type': 'Person', name: 'Rishabh Jain', url: 'https://rishabh12005.me/', email: 'mailto:2r10j5@gmail.com', sameAs: ['https://github.com/RISHABH12005', 'https://www.linkedin.com/in/rishabh12005', 'https://www.youtube.com/@RISHABH12005'] };
const schemaScript = document.createElement('script'); schemaScript.type = 'application/ld+json'; schemaScript.textContent = JSON.stringify(schema); document.head.appendChild(schemaScript);

if (prefersReduced) document.documentElement.classList.add('reduced-motion');
