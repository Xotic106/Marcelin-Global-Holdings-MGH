/* ======================================================================
   MGH — NETWORK NODE BACKGROUND
   ----------------------------------------------------------------------
   Draws a canvas full of small "nodes" that drift slowly and connect to
   their nearby neighbors with faint lines, like a network diagram.
   Runs behind every page via <canvas id="network-canvas">.

   Nothing in this file needs editing to use the site — it just reads the
   CSS color variables below. If you want to tweak the look, the settings
   are all grouped in the CONFIG object.
   ====================================================================== */
(function () {
  const canvas = document.getElementById("network-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // ---- Settings you can safely tweak ----
  const CONFIG = {
    nodeCount: 70,          // fewer nodes on small screens (see below)
    maxLinkDistance: 130,   // px — nodes closer than this get connected
    nodeSpeed: 0.15,        // px per frame, drift speed
    nodeRadius: 1.6,
    lineColor: "79, 243, 255",   // matches --blue-cyan
    nodeColor: "111, 178, 255",  // a soft electric blue
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let width, height, nodes;

  function sizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createNodes() {
    // Fewer nodes on narrow screens keeps things light on mobile.
    const count = width < 700 ? Math.round(CONFIG.nodeCount * 0.5) : CONFIG.nodeCount;
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * CONFIG.nodeSpeed,
      vy: (Math.random() - 0.5) * CONFIG.nodeSpeed,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    // Move + draw nodes
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      // wrap around edges so nodes never "run out" of screen
      if (n.x < 0) n.x = width;
      if (n.x > width) n.x = 0;
      if (n.y < 0) n.y = height;
      if (n.y > height) n.y = 0;

      ctx.beginPath();
      ctx.arc(n.x, n.y, CONFIG.nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.nodeColor}, 0.9)`;
      ctx.fill();
    }

    // Connect nearby nodes with faint lines
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.maxLinkDistance) {
          const opacity = 1 - dist / CONFIG.maxLinkDistance;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${CONFIG.lineColor}, ${opacity * 0.35})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    if (!prefersReducedMotion) requestAnimationFrame(step);
  }

  function init() {
    sizeCanvas();
    createNodes();
    // Draw at least one frame even in reduced-motion mode, so the
    // background isn't blank — it just won't animate.
    step();
  }

  window.addEventListener("resize", () => {
    sizeCanvas();
    createNodes();
  });

  init();
})();
