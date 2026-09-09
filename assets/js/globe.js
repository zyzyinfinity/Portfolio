/* =============================================================================
   globe.js — a slow rotating dotted globe with travelling signal arcs
   -----------------------------------------------------------------------------
   window.Globe.mount(canvasEl, opts) -> { start, stop, destroy }

   Pure canvas 2D, no dependencies. app.js starts / stops it with an
   IntersectionObserver so it only runs while on screen. Honors reduced motion
   (draws one static frame). Colours are tuned to match the site palette.
   ========================================================================== */
(function () {
  "use strict";

  function mount(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return { start: function () {}, stop: function () {}, destroy: function () {} };

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var N = opts.points || (window.innerWidth < 760 ? 460 : 720);
    var FRONT = opts.front || [203, 141, 162];
    var BACK  = opts.back  || [104, 70, 80];
    var HOME  = opts.home  || "#F2D7E0";
    var ARC   = opts.arc   || "rgba(214,140,166,0.55)";
    var HEAD  = opts.head  || "#F4DCE4";

    /* evenly-spread points on a unit sphere (fibonacci) */
    var pts = [];
    var GA = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2;
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var th = i * GA;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    function ll(latDeg, lonDeg) {
      var la = latDeg * Math.PI / 180, lo = lonDeg * Math.PI / 180;
      return [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)];
    }
    var home = ll(3.1, 101.7); // Kuala Lumpur-ish

    var W = 0, H = 0, cx = 0, cy = 0, R = 0;
    function size() {
      W = canvas.clientWidth || 320;
      H = canvas.clientHeight || 320;
      canvas.width = Math.max(1, Math.floor(W * DPR));
      canvas.height = Math.max(1, Math.floor(H * DPR));
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx = W / 2; cy = H / 2;
      R = Math.min(W, H) * 0.42;
    }
    size();

    var TILT = -0.42, ang = 0.6, DIST = 3.0;
    function rot(p, a) {
      var x = p[0] * Math.cos(a) - p[2] * Math.sin(a);
      var z = p[0] * Math.sin(a) + p[2] * Math.cos(a);
      var y2 = p[1] * Math.cos(TILT) - z * Math.sin(TILT);
      var z2 = p[1] * Math.sin(TILT) + z * Math.cos(TILT);
      return [x, y2, z2];
    }
    function project(p) {
      var persp = DIST / (DIST - p[2]);
      return [cx + p[0] * persp * R, cy - p[1] * persp * R, p[2]];
    }
    function bez(a, m, b, t) {
      var u = 1 - t;
      return [
        u * u * a[0] + 2 * u * t * m[0] + t * t * b[0],
        u * u * a[1] + 2 * u * t * m[1] + t * t * b[1],
        u * u * a[2] + 2 * u * t * m[2] + t * t * b[2]
      ];
    }

    var arcs = [];
    function spawnArc() {
      var a = pts[(Math.random() * N) | 0], b = pts[(Math.random() * N) | 0];
      var m = [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
      var ml = Math.hypot(m[0], m[1], m[2]) || 1;
      var lift = 1.34;
      arcs.push({
        a: a, b: b,
        m: [m[0] / ml * lift, m[1] / ml * lift, m[2] / ml * lift],
        life: 0, dur: 2100 + Math.random() * 1700
      });
      if (arcs.length > 4) arcs.shift();
    }

    function draw(dt) {
      ctx.clearRect(0, 0, W, H);
      ang += dt * 0.00013;

      for (var i = 0; i < N; i++) {
        var p = rot(pts[i], ang);
        var sp = project(p);
        var depth = (p[2] + 1) / 2;
        var al = 0.1 + depth * depth * 0.72;
        var rr = 0.6 + depth * 1.4;
        var cr = (BACK[0] + (FRONT[0] - BACK[0]) * depth) | 0;
        var cg = (BACK[1] + (FRONT[1] - BACK[1]) * depth) | 0;
        var cb = (BACK[2] + (FRONT[2] - BACK[2]) * depth) | 0;
        ctx.fillStyle = "rgba(" + cr + "," + cg + "," + cb + "," + al.toFixed(3) + ")";
        ctx.fillRect(sp[0] - rr, sp[1] - rr, rr * 2, rr * 2);
      }

      for (var j = arcs.length - 1; j >= 0; j--) {
        var arc = arcs[j];
        arc.life += dt;
        var prog = Math.min(1, arc.life / arc.dur);
        var STEPS = 36, started = false;
        ctx.beginPath();
        for (var s = 0; s <= STEPS; s++) {
          var tt = s / STEPS;
          if (tt > prog + 0.001) break;
          var bp = project(rot(bez(arc.a, arc.m, arc.b, tt), ang));
          if (!started) { ctx.moveTo(bp[0], bp[1]); started = true; }
          else ctx.lineTo(bp[0], bp[1]);
        }
        ctx.strokeStyle = ARC;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1 - Math.max(0, (prog - 0.7) / 0.3);
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (prog < 1) {
          var hp = project(rot(bez(arc.a, arc.m, arc.b, prog), ang));
          ctx.beginPath();
          ctx.arc(hp[0], hp[1], 1.8, 0, Math.PI * 2);
          ctx.fillStyle = HEAD;
          ctx.fill();
        }
        if (arc.life > arc.dur + 500) arcs.splice(j, 1);
      }

      var hp2 = rot(home, ang);
      if (hp2[2] > -0.2) {
        var hs = project(hp2);
        var pulse = (Math.sin(performance.now() * 0.003) + 1) / 2;
        ctx.beginPath();
        ctx.arc(hs[0], hs[1], 2.4 + pulse * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = HOME;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hs[0], hs[1], 4 + pulse * 7, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(242,215,224," + (0.4 * (1 - pulse)).toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    var raf = 0, last = 0, running = false, arcTimer = 0;
    function loop(now) {
      var dt = Math.min(50, now - (last || now));
      last = now;
      arcTimer += dt;
      if (arcTimer > 1400) { arcTimer = 0; spawnArc(); }
      draw(dt);
      if (running) raf = requestAnimationFrame(loop);
    }

    function start() {
      if (reduce) { size(); arcs = []; spawnArc(); spawnArc(); draw(16); return; }
      if (running) return;
      running = true; last = 0;
      raf = requestAnimationFrame(loop);
    }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

    var ro = null, onWinResize = null;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(function () { size(); if (!running) draw(16); });
      ro.observe(canvas);
    } else {
      onWinResize = function () { size(); if (!running) draw(16); };
      window.addEventListener("resize", onWinResize);
    }

    spawnArc();
    draw(16);

    return {
      start: start,
      stop: stop,
      destroy: function () {
        stop();
        if (ro) ro.disconnect();
        if (onWinResize) window.removeEventListener("resize", onWinResize);
      }
    };
  }

  window.Globe = { mount: mount };
})();
