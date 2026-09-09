# ZYZY — ishzati.com

A personal digital space for Nurul Faizah Izzati (Izzati / Zyzy).
Black ground, hot-pink, pixel type, a glitching wordmark, quiet cybersecurity
details. Opens with a full-screen letter-by-letter intro, then unfolds:
hero → about → SecureScope → globe → the archive → currently → contact.

Built with **plain HTML, one CSS file, and vanilla JavaScript** — no build step,
no framework, no dependencies to install. Open it, edit it, deploy it anywhere.

---

## Preview it locally

Just **double-click `index.html`** — it runs straight from the file system.

For a nicer local setup (live reload, correct routing) use any static server, e.g.
the *Live Server* extension in VS Code, or if you install Python:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

---

## Edit your content

**Almost everything lives in one file: [`assets/js/content.js`](assets/js/content.js).**
Change a string, save, refresh.

| Want to change… | Where |
| --- | --- |
| Name, alias, brand ("ZYZY"), location | `content.js` → `meta` |
| Intro act 1 words | `content.js` → `intro.words` |
| Intro act 2 (binary rain + name reveal) | `content.js` → `intro.cyber` |
| Nav links | `content.js` → `nav` |
| Hero headline + tagline | `content.js` → `hero` |
| About paragraphs | `content.js` → `about.paragraphs` |
| SecureScope section (lede, pipeline, tech, link) | `content.js` → `securescope` |
| "No borders" globe section (text, labels) | `content.js` → `globe` |
| "Currently / into / building…" labels | `content.js` → `currently.items` |
| Projects (add / remove / reorder) | `content.js` → `projects.items` |
| GitHub / LinkedIn / Email links | `content.js` → `contact.links` |
| Footer text | `content.js` → `footer` |
| Turn the globe / cursor / status badge on/off | `content.js` → `options` |
| **Colours** | [`assets/css/styles.css`](assets/css/styles.css) → the `:root` block at the top |
| Fonts | `<link>` in `index.html` + `--font-*` in `styles.css` |
| Images / project previews / social card | drop into [`assets/img/`](assets/img/), see the note there |
| SEO title & description, social tags | top of `index.html` |

### The intro animation

Two acts, in `content.js` → `intro`:

**Act 1** — `words` are spelled out one letter at a time, top to bottom.
`replay` controls how often the whole intro plays: `"session"` (once per visit,
default) · `"always"` (every load — handy while editing) · `"once"` (once ever).
`letterMs` / `wordMs` set the pace.

**Act 2** — `intro.cyber`: the screen goes dark, warm-pink binary rain falls, then
your `name` decrypts in terminal-style, then the curtain lifts into the site.
- `enabled: false` skips act 2 entirely (act 1 → straight to the site).
- `glyphs` — what rains (`"01"`, or add symbols like `"01</>#%"`).
- `rainMs` / `holdMs` — how long the rain builds / the name holds.

Both acts auto-skip for visitors who prefer reduced motion. There's a **skip
intro** button (top-right), and **Esc** skips too.

The binary rain and the globe are plain `<canvas>` — [`assets/js/rain.js`](assets/js/rain.js)
and [`assets/js/globe.js`](assets/js/globe.js) — no libraries. The globe only
animates while it's on screen.

### Projects

Each entry in `projects.items`:

```js
{
  no: "01",                       // archive number
  name: "SecureScope",
  description: "One or two sentences.",
  tech: ["Next.js", "FastAPI"],   // shown as a mono line ("" or [] to hide)
  year: "2025",
  status: "in progress",          // small tag, "" to hide
  link: "https://…",              // "" → shows the status instead of "view project →"
  muted: false,                   // true → dimmed (for things that don't exist yet)
  image: "assets/img/x.jpg",      // optional hover preview (desktop)
}
```

---

## Deploy

It's a static site, so anywhere works. Point the host at this folder — no build
command, output directory is the root (`.`).

- **Cloudflare Pages / Netlify** — drag the folder in, or connect the repo.
  Build command: *(none)*. Output directory: `/`.
- **GitHub Pages** — push to a repo, enable Pages on the branch root.
- **Vercel** — import the repo, framework preset "Other".

Then point `ishzati.com` at the host (their docs walk you through the DNS record).

After deploying, update the URLs in `index.html` (`canonical`, `og:url`,
`og:image`) and `sitemap.xml` / `robots.txt` if your domain ever changes.

---

## Structure

```
index.html            markup, <head> SEO, no-JS fallback, the leopard-spot <symbol>
favicon.svg            leopard-rosette icon
robots.txt  sitemap.xml  site.webmanifest
assets/
  css/styles.css       all styling — colour + font tokens at the top, sections numbered
  js/content.js        ← your content
  js/app.js            builds the page from content.js + runs interactions
  js/rain.js           intro act 2 — binary rain + name reveal (canvas)
  js/heroleo.js        the drifting pixel leopard-print behind the hero (canvas)
  js/globe.js          the "no borders" rotating globe (canvas)
  img/                 your images
```

Page flow: **intro (letters → binary rain → ZYZY)** → hero → about →
SecureScope → globe → the archive → currently → contact.

**Atmosphere** — a dark scanline + vignette overlay (`#fx` in `styles.css`,
section "CYBERPUNK ATMOSPHERE").

**Fonts** — `--font-pixel` (**Silkscreen**) for every title + small label,
`--font-body` (Space Mono) for sentences. Both live in the `:root` block of
`styles.css`; the `<link>` that loads them is at the top of `index.html`.

**The hero** — a glitching pixel wordmark (`hero.wordmark`) over a drifting,
pixelated leopard print ([`assets/js/heroleo.js`](assets/js/heroleo.js), canvas)
with CRT scanlines + vignette. Wordmark / sub / eyebrow / button text are all in
`content.js` → `hero`. Print colours: `styles.css` `:root` → `--hero-ground` /
`--hero-ground-2` / `--hero-spot`. Glitch colours: `.hero__title` in `styles.css`.

---

## Accessibility & performance notes

- Semantic landmarks, one `<h1>`, visible focus outlines, skip link.
- `prefers-reduced-motion` is respected throughout (intro, reveals, cursor).
- Committed dark theme (black + hot-pink); `color-scheme: dark`.
- No JS bundle, no dependencies; fonts load with `display=swap`.
- Works without JavaScript (a clean minimal fallback card).

---

## Moving to React / Next.js later

The content model (`window.SITE`) maps almost 1:1 to props. Each `render*`
function in `app.js` is effectively one component. If you want that later, the
copy and structure carry straight over.
