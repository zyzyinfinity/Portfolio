/* =============================================================================
   app.js — builds the page from content.js and runs the interactions
   -----------------------------------------------------------------------------
   You normally won't need to touch this. All text lives in content.js.
   Structure:
     · helpers
     · section renderers  (nav, hero, about, projects, currently, contact, footer)
     · intro curtain
     · scroll reveals · header state · scroll-spy · cursor dot
     · boot
   ========================================================================== */
(function () {
  "use strict";

  var SITE = window.SITE || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- helpers ----------------------------------------------------------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  // a leopard rosette (decorative only)
  function leo(cls) {
    return '<span class="leo ' + (cls || "") + '" aria-hidden="true">' +
      '<svg viewBox="-20 -20 40 40"><use href="#leo-spot"></use></svg></span>';
  }

  function kicker(text) {
    return '<p class="kicker reveal">' + esc(text) + "</p>";
  }

  /* ---- NAV -------------------------------------------------------------- */
  function renderNav() {
    var nav = $("#siteNav");
    if (!nav || !SITE.nav) return;
    nav.innerHTML = SITE.nav.map(function (item) {
      var ext = /^https?:/.test(item.href);
      return '<a href="' + esc(item.href) + '"' +
        (ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(item.label) +
        (ext ? ' <span class="arrow" aria-hidden="true">&#8599;</span>' : "") + "</a>";
    }).join("");

    var wm = $("#wordmark");
    if (wm && SITE.meta && SITE.meta.brand) wm.textContent = SITE.meta.brand;
  }

  // smooth-scroll for in-page links — wired after every section exists
  function initSmoothScroll() {
    $all('a[href^="#"]').forEach(function (a) {
      if (a.classList.contains("skip-link")) return; // let the skip link jump natively
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var target = document.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        try { history.replaceState(null, "", id); } catch (err) {}
      });
    });
  }

  /* ---- HERO (HackDev-style glitch wordmark over a pixel leopard print) ---- */
  function renderHero() {
    var el = $("#hero");
    var d = SITE.hero || {};
    var wm = String(d.wordmark || "ZYZY");

    el.innerHTML =
      '<canvas class="hero__leo" id="heroLeoCanvas" aria-hidden="true"></canvas>' +
      '<div class="hero__crt" aria-hidden="true"></div>' +
      '<div class="hero__inner">' +
        '<h1 class="hero__title glitch" id="heroHeading" data-text="' + esc(wm) + '">' + esc(wm) + "</h1>" +
        (d.sub ? '<p class="hero__sub">' + esc(d.sub) + "</p>" : "") +
      "</div>" +
      '<div class="hero__foot">' +
        '<div class="hero__foot-l">' +
          (d.eyebrow ? '<p class="hero__eyebrow">' + esc(d.eyebrow) + "</p>" : "") +
          (d.tagline ? '<p class="hero__tagline">' + esc(d.tagline) + "</p>" : "") +
        "</div>" +
        (d.cta ? '<a class="hero__cta" href="' + esc(d.ctaHref || "#about") + '">' +
          esc(d.cta) + ' <span aria-hidden="true">&darr;</span></a>' : "") +
      "</div>";
  }

  function initHeroLeo() {
    var c = $("#heroLeoCanvas");
    if (!c || !window.HeroLeo) return;
    var leo = window.HeroLeo.mount(c, {});
    var hero = $("#hero");
    if (!hero || !("IntersectionObserver" in window)) { leo.start(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) leo.start(); else leo.stop(); });
    }, { threshold: 0 });
    io.observe(hero);
  }

  /* ---- ABOUT ---------------------------------------------------------- */
  function renderAbout() {
    var el = $("#about");
    var d = SITE.about || {};
    el.innerHTML =
      '<div class="wrap">' +
        kicker(d.kicker || "about") +
        '<h2 class="section__head reveal" id="aboutHeading">' + esc(d.heading || "About") + "</h2>" +
        '<div class="about__body">' +
          (d.paragraphs || []).map(function (p, i) {
            return '<p class="reveal" style="--i:' + i + '">' + esc(p) + "</p>";
          }).join("") +
        "</div>" +
      "</div>";
  }

  /* ---- SECURESCOPE (flagship) --------------------------------------------- */
  function renderSecureScope() {
    var el = $("#securescope");
    var d = SITE.securescope;
    if (!el || !d) { if (el) el.remove(); return; }

    var steps = (d.pipeline || []).map(function (p, i) {
      return '<li class="pipe__step reveal" style="--i:' + i + '">' +
        leo("pipe__node") +
        '<span class="pipe__name">' + esc(p.step) + "</span>" +
        '<span class="pipe__note">' + esc(p.note) + "</span>" +
      "</li>";
    }).join("");

    var meta = [];
    if (d.status) meta.push('<span class="ss__status">' + esc(d.status) + "</span>");
    if (d.year) meta.push("<span>" + esc(d.year) + "</span>");
    (d.tech || []).forEach(function (t) { meta.push("<span>" + esc(t) + "</span>"); });

    var cta = d.link
      ? '<a class="btn-line" href="' + esc(d.link) + '" target="_blank" rel="noopener">' + esc(d.linkLabel || "view project") +
        ' <span class="arrow" aria-hidden="true">&rarr;</span></a>'
      : "";

    el.innerHTML =
      '<div class="wrap">' +
        kicker(d.kicker || "flagship project") +
        '<h2 class="section__head reveal" id="securescopeHeading">' + esc(d.heading || "SecureScope") + "</h2>" +
        (d.lede ? '<p class="ss__lede reveal">' + esc(d.lede) + "</p>" : "") +
        '<ol class="pipe">' + steps + "</ol>" +
        '<div class="ss__foot reveal">' +
          '<p class="ss__meta">' + meta.join('<span class="ss__dot">&middot;</span>') + "</p>" +
          cta +
        "</div>" +
      "</div>";
  }

  /* ---- GLOBE ------------------------------------------------------------- */
  function renderGlobe() {
    var el = $("#globe");
    var d = SITE.globe;
    var on = !SITE.options || SITE.options.globe !== false;
    if (!el || !d || !on) { if (el) el.remove(); return; }

    var lb = d.labels || {};
    el.innerHTML =
      '<div class="wrap globe__wrap">' +
        '<div class="globe__text">' +
          kicker(d.kicker || "the plan") +
          '<h2 class="section__head reveal" id="globeHeading">' + esc(d.heading || "No borders") + "</h2>" +
          (d.paragraphs || []).map(function (p, i) {
            return '<p class="reveal" style="--i:' + i + '">' + esc(p) + "</p>";
          }).join("") +
        "</div>" +
        '<figure class="globe__stage reveal" aria-label="A rotating globe with signal connections">' +
          '<canvas class="globe__canvas" id="globeCanvas"></canvas>' +
          '<span class="globe__lbl globe__lbl--tl">' + esc(lb.topLeft || "") + "</span>" +
          '<span class="globe__lbl globe__lbl--tr"><i></i>' + esc(lb.topRight || "") + "</span>" +
          '<span class="globe__lbl globe__lbl--bl">' + esc(lb.bottomLeft || "") + "</span>" +
          '<span class="globe__lbl globe__lbl--br">' + esc(lb.bottomRight || "") + "</span>" +
        "</figure>" +
      "</div>";
  }

  function initGlobe() {
    var canvas = $("#globeCanvas");
    if (!canvas || !window.Globe) return;
    var g = window.Globe.mount(canvas, {});
    if (!("IntersectionObserver" in window)) { g.start(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) g.start(); else g.stop();
      });
    }, { threshold: 0.15 });
    io.observe($("#globe"));
  }

  /* ---- PROJECTS ------------------------------------------------------- */
  function renderProjects() {
    var el = $("#projects");
    var d = SITE.projects || {};
    var items = (d.items || []).map(function (p, i) {
      var isLink = !!p.link && !p.muted;
      var cls = "project reveal" + (isLink ? " is-link" : "") + (p.muted ? " project--muted" : "");
      var top =
        '<div class="project__top">' +
          "<span>" + esc(p.no || "") +
            (p.status ? ' &middot; <span class="project__status">' + esc(p.status) + "</span>" : "") +
          "</span>" +
          "<span>" + esc(p.year || "") + "</span>" +
        "</div>";
      var name =
        '<h3 class="project__name">' + esc(p.name || "") + (isLink ? " " + leo() : "") + "</h3>";
      var desc = p.description ? '<p class="project__desc">' + esc(p.description) + "</p>" : "";
      var tech = (p.tech && p.tech.length)
        ? '<p class="project__tech">' + p.tech.map(esc).join(" &middot; ") + "</p>" : "";
      var cta = isLink
        ? '<a class="project__cta" href="' + esc(p.link) + '" aria-label="View project: ' + esc(p.name) +
          '">view project <span class="arrow" aria-hidden="true">&rarr;</span></a>'
        : (p.muted ? "" : '<span class="project__cta project__cta--static">' + esc(p.status || "in progress") + "</span>");
      var media = p.image
        ? '<div class="project__media" aria-hidden="true"><img src="' + esc(p.image) + '" alt="" loading="lazy"></div>'
        : "";
      return '<div class="' + cls + '" style="--i:' + i + '">' + top + name + desc + tech + cta + media + "</div>";
    }).join("");

    el.innerHTML =
      '<div class="wrap">' +
        kicker(d.kicker || "work") +
        '<h2 class="section__head reveal" id="projectsHeading">' + esc(d.heading || "Projects") + "</h2>" +
        '<div class="projects__list">' + items + "</div>" +
      "</div>";
  }

  /* ---- CURRENTLY ---------------------------------------------------------- */
  function renderCurrently() {
    var el = $("#currently");
    var d = SITE.currently || {};
    var rows = (d.items || []).map(function (it, i) {
      return '<div class="currently__row reveal" style="--i:' + i + '">' +
        "<dt>" + esc(it.label) + "</dt><dd>" + esc(it.value) + "</dd></div>";
    }).join("");
    el.innerHTML =
      '<div class="wrap">' +
        kicker(d.kicker || "currently") +
        '<h2 class="section__head reveal" id="currentlyHeading">' + esc(d.heading || "Currently") + "</h2>" +
        '<dl class="currently__list">' + rows + "</dl>" +
      "</div>";
  }

  /* ---- CONTACT ---------------------------------------------------------- */
  function renderContact() {
    var el = $("#contact");
    var d = SITE.contact || {};
    var links = (d.links || []).map(function (l) {
      return '<a href="' + esc(l.href) + '">' + esc(l.label) +
        ' <span class="arrow" aria-hidden="true">&#8599;</span></a>';
    }).join("");
    el.innerHTML =
      '<div class="contact__bg" aria-hidden="true"></div>' +
      '<div class="wrap">' +
        '<h2 class="section__head contact__head reveal" id="contactHeading">' + esc(d.heading || "Let's talk") + "</h2>" +
        (d.note ? '<p class="contact__note reveal">' + esc(d.note) + "</p>" : "") +
        '<div class="contact__links reveal">' + links + "</div>" +
      "</div>";
  }

  /* ---- FOOTER --------------------------------------------------------- */
  function renderFooter() {
    var el = $("#siteFooter");
    var d = SITE.footer || {};
    el.innerHTML =
      "<span>" + esc(d.copyright || "") + "</span>" +
      (d.sign ? '<span class="footer__sign">' + esc(d.sign) + "</span>" : "") +
      "<span>" + esc(d.line || "") +
        ' &middot; <a href="#top">top <span aria-hidden="true">&uarr;</span></a></span>';
  }

  /* ---- STATUS BADGE ------------------------------------------------------- */
  function renderStatusBadge() {
    var el = $("#statusBadge");
    if (!el) return;
    if (!SITE.options || !SITE.options.statusBadge) { el.remove(); return; }
    el.textContent = "session · secure";
  }

  /* ---- DIVIDERS (a single leopard mark on a hairline, used sparingly) ---- */
  function insertDividers() {
    [["#about", "#securescope"], ["#globe", "#projects"]].forEach(function (pair) {
      var after = $(pair[0]);
      if (!after) return;
      var div = document.createElement("div");
      div.className = "divider reveal";
      div.setAttribute("aria-hidden", "true");
      div.innerHTML = leo();
      after.parentNode.insertBefore(div, after.nextElementSibling);
    });
  }

  /* ---- INTRO CURTAIN --------------------------------------------------- */
  function introShouldPlay() {
    var mode = (SITE.intro && SITE.intro.replay) || "session";
    if (mode === "always") return true;
    try {
      if (mode === "once" && localStorage.getItem("zyzy:intro") === "seen") return false;
      if (mode === "session" && sessionStorage.getItem("zyzy:intro") === "seen") return false;
    } catch (e) {}
    return true;
  }
  function rememberIntro() {
    try {
      if ((SITE.intro && SITE.intro.replay) === "once") localStorage.setItem("zyzy:intro", "seen");
      else sessionStorage.setItem("zyzy:intro", "seen");
    } catch (e) {}
  }

  function buildIntroLetters() {
    var col = $("#introCol");
    var cfg = SITE.intro || {};
    var words = cfg.words || [];
    var letterMs = cfg.letterMs || 78;
    var wordMs = cfg.wordMs || 300;
    var delay = 0;
    var frag = document.createDocumentFragment();

    words.forEach(function (word, wi) {
      var w = document.createElement("span");
      w.className = "word";
      word.split("").forEach(function (ch) {
        var s = document.createElement("span");
        s.className = "ltr";
        s.textContent = ch;
        s.style.setProperty("--d", delay + "ms");
        delay += letterMs;
        w.appendChild(s);
      });
      frag.appendChild(w);
      if (wi < words.length - 1) {
        var g = document.createElement("span");
        g.className = "gap";
        frag.appendChild(g);
        delay += wordMs;
      }
    });

    var caret = document.createElement("span");
    caret.className = "caret";
    frag.appendChild(caret);
    col.appendChild(frag);
    return { total: delay, caret: caret };
  }

  function finishIntro() {
    var intro = $("#intro");
    if (!intro || intro.dataset.finished) return;
    intro.dataset.finished = "1";
    intro.classList.add("is-leaving");
    document.body.classList.remove("intro-active");
    document.body.classList.add("intro-done");
    rememberIntro();

    var cleanup = function (e) {
      if (e && e.target !== intro) return; // ignore bubbled child transitions
      intro.classList.add("is-done");
      intro.setAttribute("hidden", "");
      intro.removeEventListener("transitionend", cleanup);
      if (window.CyberIntro) window.CyberIntro.stop();
      var hh = $("#heroHeading");
      if (hh) { hh.setAttribute("tabindex", "-1"); try { hh.focus({ preventScroll: true }); } catch (err) { hh.focus(); } }
    };
    intro.addEventListener("transitionend", cleanup);
    setTimeout(cleanup, 1400);
  }

  function skipIntroNow() {
    var intro = $("#intro");
    if (intro) { intro.classList.add("is-done"); intro.setAttribute("hidden", ""); }
    document.body.classList.remove("intro-active");
    document.body.classList.add("intro-done");
  }

  function runIntro() {
    var intro = $("#intro");
    var skip = $("#introSkip");
    var meta = $("#introMeta");
    var payoff = $("#introPayoff");
    var col = $("#introCol");
    var cyberLayer = $("#cyber");
    if (!intro || !col) { skipIntroNow(); return; }

    var cyberCfg = (SITE.intro && SITE.intro.cyber) || {};
    var useCyber = !!(cyberCfg.enabled && cyberLayer && window.CyberIntro);

    document.body.classList.add("intro-active");
    window.scrollTo(0, 0);

    var built = buildIntroLetters();
    var timers = [];
    var after = function (ms, fn) { timers.push(setTimeout(fn, ms)); };

    function cancelTimers() { timers.forEach(clearTimeout); }

    function startAct2() {
      if (useCyber) {
        intro.classList.add("act2");
        if (meta) meta.textContent = "decrypting";
        cyberLayer.hidden = false;
        requestAnimationFrame(function () { cyberLayer.classList.add("show"); });
        try {
          window.CyberIntro.play(cyberLayer, cyberCfg).then(finishIntro, finishIntro);
        } catch (err) { finishIntro(); }
        // hard backstop: never let the curtain get stuck
        after((cyberCfg.rainMs || 1400) + (cyberCfg.holdMs || 1200) + 4500, finishIntro);
      } else {
        if (payoff) {
          payoff.innerHTML = (SITE.intro && SITE.intro.payoff) || "";
          payoff.hidden = false;
          payoff.classList.add("show");
        }
        after(1900, finishIntro);
      }
    }

    requestAnimationFrame(function () { col.classList.add("run"); });
    after(900, function () { if (skip) skip.classList.add("show"); });

    after(built.total + 160, function () {
      built.caret.classList.add("blink");
      if (meta) meta.textContent = "welcome";
    });
    after(built.total + 760, function () {
      col.style.transition = "opacity .5s ease, transform .5s ease, filter .5s ease";
      col.style.opacity = "0";
      col.style.transform = "translateY(-8px)";
      col.style.filter = "blur(6px)";
      after(360, startAct2);
    });

    function doSkip() {
      cancelTimers();
      if (window.CyberIntro) window.CyberIntro.cancel();
      finishIntro();
    }
    if (skip) skip.addEventListener("click", doSkip);
    document.addEventListener("keydown", function onKey(e) {
      if (e.key === "Escape" && !intro.dataset.finished) {
        doSkip();
        document.removeEventListener("keydown", onKey);
      }
    });
  }

  /* ---- SCROLL REVEALS ------------------------------------------------- */
  function initReveals() {
    var els = $all(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });

    // reveal whatever is already in view so the first frame is never blank
    requestAnimationFrame(function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      els.forEach(function (el) {
        if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add("in");
      });
    });
  }

  /* ---- HEADER STATE ------------------------------------------------------- */
  function initHeaderScroll() {
    var header = $("#siteHeader");
    if (!header) return;
    var update = function () { header.classList.toggle("scrolled", window.scrollY > 24); };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---- SCROLL-SPY (subtle active nav link) --------------------------------- */
  function initScrollSpy() {
    var links = $all(".site-nav a");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = new Map();
    links.forEach(function (a) {
      var sec = document.getElementById(a.getAttribute("href").slice(1));
      if (sec) map.set(sec, a);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove("is-current"); });
        var a = map.get(e.target);
        if (a) a.classList.add("is-current");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    map.forEach(function (_, sec) { io.observe(sec); });
  }

  /* ---- CURSOR DOT ------------------------------------------------------ */
  function initCursor() {
    if (reduceMotion) return;
    if (!SITE.options || !SITE.options.customCursor) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    var dot = $("#cursorDot");
    if (!dot) return;
    var x = window.innerWidth / 2, y = window.innerHeight / 2, tx = x, ty = y, shown = false;
    var sel = "a, button, summary, input, textarea, .project.is-link";

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; dot.classList.add("active"); }
    }, { passive: true });
    document.addEventListener("mouseleave", function () { dot.classList.remove("active"); shown = false; });
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(sel)) dot.classList.add("big");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest(sel)) dot.classList.remove("big");
    });

    (function tick() {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      dot.style.transform = "translate(" + x + "px," + y + "px) translate(-50%,-50%)";
      requestAnimationFrame(tick);
    })();
  }

  /* ---- BOOT --------------------------------------------------------------- */
  function boot() {
    renderNav();
    renderHero();
    renderAbout();
    renderSecureScope();
    renderGlobe();
    renderProjects();
    renderCurrently();
    renderContact();
    renderFooter();
    renderStatusBadge();
    insertDividers();

    initSmoothScroll();
    initReveals();
    initHeaderScroll();
    initScrollSpy();
    initCursor();
    initHeroLeo();
    initGlobe();

    // everything rendered & wired — tells the safety net (in index.html) to stand down
    document.documentElement.dataset.booted = "1";

    if (reduceMotion || !introShouldPlay()) {
      skipIntroNow();
    } else {
      runIntro();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
