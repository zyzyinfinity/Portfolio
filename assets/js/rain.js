/* =============================================================================
   rain.js — intro "act 2": warm-pink binary rain + a terminal-style name reveal
   -----------------------------------------------------------------------------
   window.CyberIntro.play(hostEl, opts) -> Promise   (resolves when the name has held)
   window.CyberIntro.cancel()                         (skip: snap to end, resolve now)
   window.CyberIntro.stop()                           (kill the canvas loop)

   opts: { name, glyphs, rainMs, holdMs }   — all come from SITE.intro.cyber
   The visual palette lives in styles.css (section "INTRO — ACT 2").
   ========================================================================== */
(function () {
  "use strict";

  var current = null;

  function play(host, opts) {
    opts = opts || {};
    var name    = String(opts.name || "IZZATI").toUpperCase();
    var glyphs  = String(opts.glyphs || "01").split("");
    var rainMs  = opts.rainMs || 1400;
    var holdMs  = opts.holdMs || 1200;
    var chars   = name.split("");

    return new Promise(function (resolve) {
      var settled = false;
      var raf = 0;
      var timers = [];
      var intervals = [];

      function resolveOnce() {
        if (settled) return;
        settled = true;
        window.removeEventListener("resize", onResize);
        resolve();
      }
      function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
      function clearTimers() {
        timers.forEach(clearTimeout);
        intervals.forEach(clearInterval);
        timers = []; intervals = [];
      }
      function cancel() {
        clearTimers();
        // snap the name to its final state so a fast skip still flashes it
        letters.forEach(function (el, i) { el.textContent = chars[i]; el.classList.add("lock"); });
        if (nameEl) { nameEl.classList.add("show"); nameEl.classList.add("locked"); }
        stop();
        resolveOnce();
      }
      current = { cancel: cancel, stop: stop };

      /* ---- DOM ---------------------------------------------------------- */
      host.classList.add("cyber--on");
      host.innerHTML =
        '<canvas class="cyber__rain" aria-hidden="true"></canvas>' +
        '<div class="cyber__scan" aria-hidden="true"></div>' +
        '<div class="cyber__name" aria-hidden="true">' +
          chars.map(function (ch, i) {
            return '<span class="cyber__ltr" style="--i:' + i + '">' + ch + "</span>";
          }).join("") +
          '<span class="cyber__caret" aria-hidden="true">&#9611;</span>' +
        "</div>";

      var canvas  = host.querySelector(".cyber__rain");
      var nameEl  = host.querySelector(".cyber__name");
      var letters = [].slice.call(host.querySelectorAll(".cyber__ltr"));
      var ctx     = canvas.getContext && canvas.getContext("2d");

      if (!ctx) { timers.push(setTimeout(cancel, 500)); return; }

      /* ---- sizing ----------------------------------------------------------- */
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var W = 0, H = 0, fontSize = 14, colX = 12, lineH = 15, drops = [];

      function size() {
        W = host.clientWidth || window.innerWidth;
        H = host.clientHeight || window.innerHeight;
        canvas.width = Math.max(1, Math.floor(W * dpr));
        canvas.height = Math.max(1, Math.floor(H * dpr));
        canvas.style.width = W + "px";
        canvas.style.height = H + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        fontSize = Math.max(11, Math.min(20, Math.round(W / 48)));
        colX = fontSize * 0.86;
        lineH = fontSize * 1.05;
        ctx.font = fontSize + 'px "Space Mono", ui-monospace, monospace';
        ctx.textBaseline = "top";
        var cols = Math.ceil(W / colX) + 1;
        var next = [];
        for (var i = 0; i < cols; i++) {
          next[i] = drops[i] || {
            y: Math.random() * -H,
            speed: 0.45 + Math.random() * 0.9,
            trail: 6 + (Math.random() * 15 | 0),
            gate: Math.random()      // column turns on when density passes this
          };
        }
        drops = next;
      }
      size();
      var onResize = size;
      window.addEventListener("resize", onResize);

      /* ---- rain loop ------------------------------------------------------- */
      var t0 = performance.now();
      function frame(now) {
        var density = Math.min(1, (now - t0) / rainMs) * 0.55 + 0.14;

        // fade previous frame (pure black) — no glow on the fade
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(0,0,0,0.16)";
        ctx.fillRect(0, 0, W, H);

        // NEON PINK glitch glow for the glyphs
        ctx.shadowColor = "rgba(255,26,180,0.9)";
        ctx.shadowBlur = 5;

        for (var i = 0; i < drops.length; i++) {
          var d = drops[i];
          if (d.gate > density) continue;
          var x = i * colX;
          for (var k = 0; k < d.trail; k++) {
            var yy = d.y - k * lineH;
            if (yy < -lineH || yy > H) continue;
            var ch = glyphs[(Math.random() * glyphs.length) | 0];
            if (k === 0) ctx.fillStyle = "rgba(255,214,244,0.98)";                       // bright head
            else ctx.fillStyle = "rgba(255,26,180," + ((1 - k / d.trail) * 0.85).toFixed(3) + ")"; // neon pink trail
            ctx.fillText(ch, x, yy);
          }
          d.y += d.speed * lineH * 0.9;
          if (d.y - d.trail * lineH > H) { d.y = Math.random() * -H * 0.4; d.speed = 0.45 + Math.random() * 0.9; }
        }
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);

      /* ---- name decrypt --------------------------------------------------- */
      var scrambleSet = "0123456789ABCDEF#%<>/\\|=+".split("");
      function pick() {
        return glyphs.length > 3
          ? glyphs[(Math.random() * glyphs.length) | 0]
          : scrambleSet[(Math.random() * scrambleSet.length) | 0];
      }
      function decrypt() {
        nameEl.classList.add("show");
        letters.forEach(function (el, idx) {
          var iv = setInterval(function () { el.textContent = pick(); }, 45);
          intervals.push(iv);
          timers.push(setTimeout(function () {
            clearInterval(iv);
            el.textContent = chars[idx];
            el.classList.add("lock");
          }, 240 + idx * 95));
        });
        // once every letter has locked, bloom the neon glow
        timers.push(setTimeout(function () {
          nameEl.classList.add("locked");
        }, 240 + letters.length * 95 + 80));
      }

      var decryptTotal = 240 + letters.length * 95 + 220;
      timers.push(setTimeout(decrypt, rainMs));
      timers.push(setTimeout(function () {
        clearTimers();
        resolveOnce();   // orchestrator lifts the curtain; rain keeps going until stop()
      }, rainMs + decryptTotal + holdMs));
    });
  }

  window.CyberIntro = {
    play: play,
    cancel: function () { if (current) current.cancel(); },
    stop: function () { if (current) current.stop(); }
  };
})();
