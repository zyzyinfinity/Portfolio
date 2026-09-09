/* =============================================================================
   heroleo.js — the drifting, pixelated leopard-print behind the hero wordmark
   -----------------------------------------------------------------------------
   window.HeroLeo.mount(canvasEl, opts) -> { start, stop }

   A small low-res canvas (chunky pixels via CSS image-rendering) painted with a
   pink ground + slowly drifting dark rosette clusters. app.js starts it after
   the intro and stops it when the hero leaves the screen. Static under
   reduced-motion. Colours: styles.css :root  --hero-ground / --hero-spot.
   ========================================================================== */
(function () {
  "use strict";

  function readVar(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    } catch (e) { return fallback; }
  }

  function mount(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return { start: function () {}, stop: function () {} };

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var W = 200, H = 116;                 // internal resolution — small = chunky pixels
    canvas.width = W;
    canvas.height = H;

    var ground  = opts.ground  || readVar("--hero-ground", "#B83C6A");
    var ground2 = opts.ground2 || readVar("--hero-ground-2", "#5E1F42");
    var spot    = opts.spot    || readVar("--hero-spot", "#170811");

    // rosette clusters — offsets fixed once so they drift smoothly (no shimmer)
    var blobs = [];
    var N = 11;
    for (var i = 0; i < N; i++) {
      var parts = 4 + (Math.random() * 3 | 0);
      var off = [];
      for (var k = 0; k < parts; k++) {
        var a = (k / parts) * Math.PI * 2 + Math.random() * 1.6;
        var d = 0.15 + Math.random() * 0.85;
        off.push({ dx: Math.cos(a) * d, dy: Math.sin(a) * d,
                   rx: 0.45 + Math.random() * 0.55, ry: 0.32 + Math.random() * 0.4, rot: a + Math.random() });
      }
      blobs.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 4.5 + Math.random() * 8,
        vx: (Math.random() - 0.5) * 0.055,
        vy: (Math.random() - 0.5) * 0.04,
        off: off
      });
    }

    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, ground);
    grad.addColorStop(1, ground2);

    function paint() {
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = spot;
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        for (var k = 0; k < b.off.length; k++) {
          var o = b.off[k];
          ctx.beginPath();
          ctx.ellipse(b.x + o.dx * b.r, b.y + o.dy * b.r, b.r * o.rx, b.r * o.ry, o.rot, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function step() {
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        b.x += b.vx; b.y += b.vy;
        if (b.x < -40) b.x += W + 80; else if (b.x > W + 40) b.x -= W + 80;
        if (b.y < -40) b.y += H + 80; else if (b.y > H + 40) b.y -= H + 80;
      }
    }

    var raf = 0, running = false;
    function loop() {
      step();
      paint();
      if (running) raf = requestAnimationFrame(loop);
    }
    function start() {
      if (running) return;
      if (reduce) { paint(); return; }
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

    paint();
    return { start: start, stop: stop };
  }

  window.HeroLeo = { mount: mount };
})();
