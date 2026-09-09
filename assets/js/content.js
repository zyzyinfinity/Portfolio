/* =============================================================================
   content.js  —  THE ONLY FILE YOU NEED TO EDIT FOR TEXT / PROJECTS / LINKS
   -----------------------------------------------------------------------------
   Everything the site says lives here. Change a string, save, refresh.
   Colours live in  assets/css/styles.css  (the :root block near the top).
   Images go in     assets/img/  and are referenced from projects[].image
   ========================================================================== */

window.SITE = {

  /* --- identity ----------------------------------------------------------- */
  meta: {
    name: "Nurul Faizah Izzati",
    alias: "Izzati",
    brand: "ZYZY",
    domain: "ishzati.com",
    location: "Kuala Lumpur",
    coords: "03.08°N 101.68°E",
  },

  /* --- intro animation --------------------------------------------------------
     A two-act opening.

     ACT 1 — letters appear one at a time, top to bottom, spelling each word.
     ACT 2 — the screen goes dark, warm-pink binary rain falls, then your name
             decrypts in, terminal-style. Then the curtain lifts into the site.

     replay   : "session" -> once per browser session (default)
                "always"  -> every visit (handy while editing)
                "once"    -> once ever, then remembered forever
     letterMs : delay between letters in act 1
     wordMs   : extra pause between words in act 1                              */
  intro: {
    words: ["HELLO", "WELCOME", "TO", "ZYZY", "PAGE"],
    replay: "session",
    letterMs: 62,
    wordMs: 240,

    cyber: {
      enabled: true,        // set false to skip act 2 (letters -> site)
      name: "ZYZY",         // the large pixel-font reveal (pink -> neon-purple)
      glyphs: "01",         // what rains — try "01" or "01</>#%"
      rainMs: 1400,          // how long the rain builds before the name
      holdMs: 1200,          // how long the name holds before the curtain lifts
    },
  },

  /* --- navigation ------------------------------------------------------------ */
  nav: [
    { label: "about",       href: "#about" },
    { label: "securescope", href: "https://securescope.ishzati.com" },
    { label: "projects",    href: "#projects" },
    { label: "contact",     href: "#contact" },
  ],

  /* --- hero / identity -------------------------------------------------------
     wordmark : the huge glitching name (keep it short — it fills the screen)
     sub      : small wide-spaced line under it
     eyebrow  : tiny label, bottom-left
     cta      : the button text (links to ctaHref)                              */
  hero: {
    wordmark: "ZYZY",
    sub: "IZZATI",
    eyebrow: "kuala lumpur — cyber security",
    tagline: "cybersecurity student · security enthusiast · future pentester",
    cta: "explore",
    ctaHref: "#about",
  },

  /* --- about --------------------------------------------------------------- */
  about: {
    kicker: "about me",
    heading: "HELLO EVERYONE!",
    paragraphs: [
      "I'm Izzati, a Cyber Security student from Universiti Poly-Tech Malaysia (UPTM). I'm into cybersecurity, web security, penetration testing, and basically anything that lets me build, break, and figure out how things work.",
      "I originally made this website just for fun because I thought, “why not put all my projects in one basket?” But then I figured, why not share them too? So here's a little collection of the things I've built, learned, experimented with, and probably broken along the way.",
      "I'm hoping this portfolio can help me share my work, connect with people, learn from others, and slowly build the career I want in cybersecurity. Welcome to my little corner of the internet! ♡",
    ],
  },

  /* --- SecureScope (flagship — its own section) -----------------------------
     pipeline : the steps shown as a connected flow (add / remove freely)
     link     : "" hides the button                                            */
  securescope: {
    kicker: "flagship project",
    heading: "SECURESCOPE",
    lede: "An AI-assisted web security assessment platform. Recon, scanning and reporting stitched into one calm workflow instead of forty open tabs.",
    pipeline: [
      { step: "recon",  note: "surface mapping, subdomains, tech fingerprinting" },
      { step: "scan",   note: "guided checks against the OWASP Top 10" },
      { step: "assist", note: "an LLM that explains each finding in plain words" },
      { step: "report", note: "one clean export, ready to hand over" },
    ],
    tech: ["Next.js", "FastAPI", "PostgreSQL", "LLM", "Burp Suite"],
    status: "in progress",
    year: "2025",
    link: "https://securescope.ishzati.com",
    linkLabel: "open securescope",
  },

  /* --- the globe / "going global" section ---------------------------------
     A rotating dotted globe with signal arcs. Sits on the one dark panel.
     labels : the little metadata strings around the visual                    */
  globe: {
    kicker: "the plan",
    heading: "NO BORDERS",
    paragraphs: [
      "Security doesn't stop at a border, and neither should the work. The goal is a career that's international from the start — different teams, different problems, wherever the interesting ones are.",
    ],
    labels: {
      topLeft: "// network",
      topRight: "live",
      bottomLeft: "node · kl-01",
      bottomRight: "03.08°N 101.68°E",
    },
  },

  /* --- projects (a digital archive — SecureScope has its own section above) - */
  projects: {
    kicker: "selected work",
    heading: "THE ARCHIVE",
    items: [
      {
        no: "01",
        name: "Nightjar",
        description: "A running notebook of CTF write-ups and the small exploit tooling I keep reaching for.",
        tech: ["Python", "pwntools", "Docker"],
        year: "2024",
        status: "",
        link: "",
        image: "",
      },
      {
        no: "02",
        name: "Soft Perimeter",
        description: "A study of web authentication flaws, learned by building small, deliberately broken apps and then fixing them.",
        tech: ["Node.js", "JWT", "OWASP"],
        year: "2024",
        status: "",
        link: "",
        image: "",
      },
      {
        no: "03",
        name: "untitled",
        description: "Something with hardware and radio. Still forming.",
        tech: [],
        year: "2026",
        status: "queued",
        link: "",
        muted: true,
        image: "",
      },
    ],
  },

  /* --- currently / personal ---------------------------------------------- */
  currently: {
    kicker: "right now",
    heading: "CURRENTLY",
    items: [
      { label: "currently", value: "Cybersecurity student at UPTM" },
      { label: "into",       value: "web security · pentesting · CTFs" },
      { label: "building",   value: "small security tools & experiments" },
      { label: "learning",   value: "something new every week" },
      { label: "dream",      value: "working in security, internationally" },
    ],
  },

  /* --- contact ---------------------------------------------------------------- */
  contact: {
    heading: "LET'S MAKE SOMETHING INTERESTING.",
    note: "open to internships, collaborations, CTF teams, and generally interesting problems.",
    links: [
      { label: "GitHub",   href: "https://github.com/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
      { label: "Email",    href: "mailto:hello@ishzati.com" },
    ],
  },

  /* --- footer -------------------------------------------------------------------- */
  footer: {
    copyright: "© 2026 ZYZY",
    line: "ishzati.com — Kuala Lumpur",
    sign: "// thanks for scrolling",
  },

  /* --- small toggles ---------------------------------------------------------- */
  options: {
    customCursor: false,  // subtle trailing dot on desktop
    statusBadge: true,    // tiny "session · secure" indicator, bottom-left on desktop
    globe: true,          // the rotating globe visual
  },
};
