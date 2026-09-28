import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(pointer: coarse)').matches;
const loader = document.querySelector('#loader');
const bar = loader?.querySelector('i');

/* The intro uses CSS and a single timer so it does not add a second animation library. */
if (bar && loader) {
  requestAnimationFrame(() => bar.classList.add('is-loaded'));
  window.setTimeout(() => loader.remove(), prefersReduced ? 120 : 980);
}

/* ============================================================================ PROJECT CARD INTERACTIONS */

document.querySelectorAll('.project').forEach(card => {
  card.addEventListener('mousemove', e => {
    if (prefersReduced) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX / rect.width) - (rect.left / rect.width) - 0.5;
    const y = (e.clientY / rect.height) - (rect.top / rect.height) - 0.5;

    card.style.transform = `perspective(1000px) rotateX(${-y * 3}deg) rotateY(${x * 4}deg) translateY(-5px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ============================================================================ 3D HERO SCENE */

const mount = document.querySelector('#hero-3d');

if (mount && !prefersReduced && !isTouch) {
  try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0, 7.2);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      mount.appendChild(renderer.domElement);

      const world = new THREE.Group();
      world.rotation.z = -0.48;
      world.rotation.x = 0.08;
      scene.add(world);

      // Procedural core geometry (no external GLB dependency)
      function createCore() {
        const group = new THREE.Group();

        // Create icosahedron wireframe
          const geometry = new THREE.IcosahedronGeometry(1.2, 2);
        const edges = new THREE.EdgesGeometry(geometry, 12);
        const wireframe = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 0x77736d, transparent: true, opacity: 0.85 })
        );
        group.add(wireframe);

        // Add subtle fill
        const fill = new THREE.Mesh(
          geometry,
          new THREE.MeshBasicMaterial({ color: 0xe8e3dc, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
        );
        group.add(fill);

        // Create rotating rings
        for (let i = 0; i < 3; i++) {
          const ringGeo = new THREE.BufferGeometry();
          const ringPoints = [];
          for (let j = 0; j < 64; j++) {
            const angle = (j / 64) * Math.PI * 2;
            const radius = 1.5 + i * 0.3;
            ringPoints.push(
              Math.cos(angle) * radius,
              Math.sin(angle) * radius * 0.5,
              Math.sin(angle) * radius * 0.3
            );
          }
          ringGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ringPoints), 3));
          const ring = new THREE.Line(
            ringGeo,
            new THREE.LineBasicMaterial({
              color: 0x746cff,
              transparent: true,
              opacity: 0.4 - i * 0.08,
              linewidth: 1
            })
          );
          ring.rotation.x = (i * Math.PI / 6);
          group.add(ring);
        }

        return group;
      }

      const core = createCore();
      world.add(core);

      // Lighting
      const ambient = new THREE.AmbientLight(0xffffff, 1.7);
      scene.add(ambient);
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(3, 4, 6);
      scene.add(key);

      let targetX = 0;
      let targetY = 0;
      let currentX = world.rotation.x;
      let currentY = world.rotation.y;

      window.addEventListener('pointermove', e => {
        targetX = (e.clientY / window.innerHeight - 0.5) * 0.2;
        targetY = (e.clientX / window.innerWidth - 0.5) * 0.35;
      });

      function resize() {
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }

      window.addEventListener('resize', resize);

      const clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Smooth rotation toward target
        currentX += (targetX - currentX) * 0.018;
        currentY += (targetY - currentY) * 0.018;

        world.rotation.z = -0.48 + (t % (Math.PI * 2 / (Math.PI * 2 / 64))) * (Math.PI * 2 / 64);
        world.rotation.x = currentX;
        world.rotation.y = currentY;

        renderer.render(scene, camera);
      }

      animate();
  } catch (error) {
    mount.classList.add('is-fallback');
  }
} else if (mount) {
  mount.classList.add('is-fallback');
}

/* ============================================================================ SCROLL REVEAL */

// Simple intersection observer for scroll reveals
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  // Observe section content
  document.querySelectorAll('.section-head, .about-grid, .section-intro, .projects, .capabilities, .timeline, .highlights, .contact-grid').forEach(el => {
    el.classList.add('reveal');
    if (!prefersReduced) observer.observe(el);
  });
}

/* ============================================================================ SMOOTH SCROLL LINKS */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
