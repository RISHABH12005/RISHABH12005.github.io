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

const mount = document.querySelector('#hero-3d');
if (mount && !prefersReduced && !isTouch && 'WebGLRenderingContext' in window) {
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.z = 7.2;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const world = new THREE.Group();
    world.rotation.z = -0.48;
    scene.add(world);
    const geometry = new THREE.IcosahedronGeometry(1.18, 2);
    world.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 18), new THREE.LineBasicMaterial({ color: 0xd6d0c8, transparent: true, opacity: 0.72 })));
    world.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xe8e3dc, transparent: true, opacity: 0.055, side: THREE.DoubleSide })));
    for (let i = 0; i < 3; i += 1) {
      const points = [];
      for (let j = 0; j < 65; j += 1) {
        const angle = (j / 64) * Math.PI * 2;
        const radius = 1.45 + i * 0.28;
        points.push(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.5, Math.sin(angle) * radius * 0.3);
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(points.reduce((acc, _, index) => index % 3 === 0 ? [...acc, new THREE.Vector3(points[index], points[index + 1], points[index + 2])] : acc, []));
      const ring = new THREE.Line(ringGeo, new THREE.LineBasicMaterial({ color: 0x756bff, transparent: true, opacity: 0.34 - i * 0.07 }));
      ring.rotation.x = i * Math.PI / 6;
      world.add(ring);
    }
    let targetX = 0, targetY = 0, active = true;
    window.addEventListener('pointermove', event => { targetX = (event.clientY / innerHeight - 0.5) * 0.18; targetY = (event.clientX / innerWidth - 0.5) * 0.28; }, { passive: true });
    const resize = () => { const width = mount.clientWidth; const height = mount.clientHeight; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height); };
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => { active = !document.hidden; });
    const clock = new THREE.Clock();
    const animate = () => {
      if (active) {
        const time = clock.getElapsedTime();
        world.rotation.x += (targetX - world.rotation.x) * 0.018;
        world.rotation.y += (targetY - world.rotation.y) * 0.018;
        world.rotation.z = -0.48 + Math.sin(time * 0.18) * 0.08;
        world.position.y = Math.sin(time * 0.45) * 0.045;
        renderer.render(scene, camera);
      }
      requestAnimationFrame(animate);
    };
    resize();
    animate();
  } catch (error) {
    mount.classList.add('is-fallback');
  }
} else if (mount) mount.classList.add('is-fallback');

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
