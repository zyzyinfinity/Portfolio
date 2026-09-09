/* =============================================================================
   heroleo.js — a pixelated leopard-print girl silhouette behind the hero
   -----------------------------------------------------------------------------
   window.HeroLeo.mount(canvasEl, opts) -> { start, stop }

   Draws a stylised standing girl (head + ponytail, an hourglass dress body,
   two legs split by a hem notch — BODY/PONY/HEAD below, in a normalised
   design space) and clips a drifting pink-leopard rosette pattern to that
   shape, so the print reads as "on her" rather than as a random field of
   blobs. Everything outside the silhouette stays transparent — the shape is
   what shows against the hero's black background.

   The canvas' internal resolution is derived from its real on-screen size
   (see geometry()) so the figure keeps its proportions instead of being
   squashed by the CSS width:100%/height:100% stretch, and re-derives on
   resize/orientation change.

   app.js starts it after the intro and stops it when the hero leaves the
   screen. Static under reduced-motion. Colours: styles.css :root
   --hero-ground / --hero-ground-2 / --hero-spot.
   ========================================================================== */
(function () {
  "use strict";

  function readVar(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    } catch (e) { return fallback; }
  }

  // ---- the silhouette, in a normalised design space --------------------
  // x is centred on 0 (mirrored left/right), y runs 0 (crown) -> ~1 (feet).
  var HEAD_R = 0.075, HEAD_CY = 0.085;
  var PONY = { cx: 0.1, cy: 0.05, rx: 0.03, ry: 0.09, rot: -0.5 };
  // shoulder -> bust -> waist-in -> hip -> hem -> leg -> foot, mirrored,
  // with a triangular notch between the legs (the two centre points).
  var BODY = [
    [0.045, 0.16], [0.17, 0.205], [0.215, 0.30], [0.135, 0.42],
    [0.245, 0.55], [0.245, 0.63], [0.30, 0.95], [0.16, 0.95],
    [0.05, 0.66], [0, 0.60], [-0.05, 0.66], [-0.16, 0.95],
    [-0.30, 0.95], [-0.245, 0.63], [-0.245, 0.55], [-0.135, 0.42],
    [-0.215, 0.30], [-0.17, 0.205], [-0.045, 0.16]
  ];
  var DESIGN_TOP = HEAD_CY - HEAD_R;   // crown
  var DESIGN_BOTTOM = 0.95;            // feet
  var DESIGN_HALF_W = 0.30;            // widest point (hips)

  function mount(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return { start: function () {}, stop: function () {} };

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var ground  = opts.ground  || readVar("--hero-ground", "#B83C6A");
    var ground2 = opts.ground2 || readVar("--hero-ground-2", "#5E1F42");
    var spot    = opts.spot    || readVar("--hero-spot", "#170811");

    var PXSIZE = 8;                        // real screen px per internal pixel
    var W = 200, H = 200, grad = null;
    var cx = 0, cy = 0, scale = 0;         // figure placement — set by geometry()
    var blobs = [];

    function buildBlobs() {
      blobs = [];
      var N = 11;
      var rangeX = scale * (DESIGN_HALF_W + 0.08);
      var top = cy + DESIGN_TOP * scale - scale * 0.05;
      var bot = cy + DESIGN_BOTTOM * scale + scale * 0.05;
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
          x: cx + (Math.random() * 2 - 1) * rangeX,
          y: top + Math.random() * (bot - top),
          r: scale * (0.05 + Math.random() * 0.055),
          vx: (Math.random() - 0.5) * scale * 0.0022,
          vy: (Math.random() - 0.5) * scale * 0.0016,
          off: off, rangeX: rangeX, top: top, bot: bot
        });
      }
    }

    // Recompute internal resolution + figure placement from the canvas'
    // real box, so the silhouette stays proportioned instead of stretched.
    function geometry() {
      var rect = canvas.getBoundingClientRect();
      var w = Math.round(rect.width)  || (canvas.parentElement && canvas.parentElement.clientWidth)  || 320;
      var h = Math.round(rect.height) || (canvas.parentElement && canvas.parentElement.clientHeight) || 480;
      W = Math.max(90, Math.min(300, Math.round(w / PXSIZE)));
      H = Math.max(90, Math.min(340, Math.round(h / PXSIZE)));
      canvas.width = W;
      canvas.height = H;

      grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, ground);
      grad.addColorStop(1, ground2);

      cx = W * 0.5;
      var availH = H * 0.88, availW = W * 0.85;
      scale = Math.min(availH / (DESIGN_BOTTOM - DESIGN_TOP), availW / (DESIGN_HALF_W * 2));
      var topY = H * 0.06;
      cy = topY - DESIGN_TOP * scale;   // crown sits at topY

      buildBlobs();
    }

    function tracePath() {
      ctx.beginPath();
      ctx.moveTo(cx + BODY[0][0] * scale, cy + BODY[0][1] * scale);
      for (var i = 1; i < BODY.length; i++) ctx.lineTo(cx + BODY[i][0] * scale, cy + BODY[i][1] * scale);
      ctx.closePath();
      ctx.ellipse(cx + PONY.cx * scale, cy + PONY.cy * scale, PONY.rx * scale, PONY.ry * scale, PONY.rot, 0, Math.PI * 2);
      ctx.arc(cx, cy + HEAD_CY * scale, HEAD_R * scale, 0, Math.PI * 2);
    }

    function paint() {
      ctx.clearRect(0, 0, W, H);
      if (!scale) return;
      ctx.save();
      tracePath();
      ctx.clip();
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
      ctx.restore();
    }

    function step() {
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        b.x += b.vx; b.y += b.vy;
        if (b.x < cx - b.rangeX - 20) b.x = cx + b.rangeX + 20;
        else if (b.x > cx + b.rangeX + 20) b.x = cx - b.rangeX - 20;
        if (b.y < b.top - 20) b.y = b.bot + 20;
        else if (b.y > b.bot + 20) b.y = b.top - 20;
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

    var resizeTimer = 0;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { geometry(); paint(); }, 120);
    }
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    if (typeof ResizeObserver === "function") {
      new ResizeObserver(onResize).observe(canvas);
    }

    geometry();
    paint();
    return { start: start, stop: stop };
  }

  window.HeroLeo = { mount: mount };
})();
