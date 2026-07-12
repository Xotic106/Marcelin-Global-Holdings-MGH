/* ======================================================================
   MGH — SCROLL-LINKED 3D BEACON
   ----------------------------------------------------------------------
   A glowing wireframe shape (positioned fixed at the right edge of the
   screen, see #beacon-canvas-wrap in style.css) that slowly rotates as
   the page auto-idles AND turns further based on how far you've
   scrolled down the page. It's hidden on small screens via CSS.

   Requires the Three.js library loaded BEFORE this file (see the
   <script> tag in each HTML page, loaded from a CDN).
   ====================================================================== */
(function () {
  const wrap = document.getElementById("beacon-canvas-wrap");
  if (!wrap || typeof THREE === "undefined") return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ---- Scene setup ----
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 6.5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  wrap.appendChild(renderer.domElement);

  // Outer wireframe shape — an icosahedron reads as a "network node" cluster
  const outerGeometry = new THREE.IcosahedronGeometry(2.1, 1);
  const outerMaterial = new THREE.MeshBasicMaterial({
    color: 0x4ff3ff,
    wireframe: true,
    transparent: true,
    opacity: 0.75,
  });
  const outerMesh = new THREE.Mesh(outerGeometry, outerMaterial);
  scene.add(outerMesh);

  // Inner smaller shape, rotates opposite direction for a layered feel
  const innerGeometry = new THREE.IcosahedronGeometry(1.15, 0);
  const innerMaterial = new THREE.MeshBasicMaterial({
    color: 0x2f7dff,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
  });
  const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
  scene.add(innerMesh);

  function resize() {
    const size = wrap.clientWidth || 460;
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  // ---- Scroll progress (0 to 1) drives extra rotation ----
  let scrollFraction = 0;
  function updateScrollFraction() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    scrollFraction = scrollable > 0 ? window.scrollY / scrollable : 0;
  }
  window.addEventListener("scroll", updateScrollFraction, { passive: true });
  updateScrollFraction();

  function animate() {
    // Gentle constant idle spin, PLUS extra rotation tied to scroll position
    outerMesh.rotation.y += 0.0018;
    outerMesh.rotation.x = scrollFraction * Math.PI * 1.4;
    innerMesh.rotation.y -= 0.0026;
    innerMesh.rotation.x = -scrollFraction * Math.PI * 1.1;

    renderer.render(scene, camera);
    if (!prefersReducedMotion) requestAnimationFrame(animate);
  }

  if (prefersReducedMotion) {
    // Render a single static frame instead of a continuous loop
    renderer.render(scene, camera);
  } else {
    animate();
  }
})();
