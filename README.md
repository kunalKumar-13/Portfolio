# Kunal Kumar — Portfolio

A single-page portfolio. Static site: no build step, no framework — one HTML file, one class.

The design medium was a Claude Design Component (a small React-runtime `.dc.html`). This repo is
a **byte-faithful vanilla port**: the markup and all behavior are reproduced exactly; only the
Design-Component wrapper (`<x-dc>` / `DCLogic` / React ref) was rewritten to a plain
`class Site` mounted on `#kk-root`.

## Stack

- Plain HTML with inline design tokens ([index.html](index.html))
- [GSAP 3.12](https://gsap.com) + ScrollTrigger + [Lenis](https://lenis.darkroom.engineering) smooth scroll (CDN)
- Fonts: Bricolage Grotesque · Archivo · Instrument Serif · JetBrains Mono (Google Fonts)
- All behavior lives in one class in [script.js](script.js)

## Run it

Fonts, CDN libraries, and the GitHub fetch need an HTTP origin, so serve the folder:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## What's on the page

- **Hero** — preloader, char-split entrance, clickable rolling slot verb, living aurora canvas,
  and a velocity-reactive "charge" effect (RGB split) on the giant name.
- **Currently / the ledger** — editorial role rows that expand on hover (keyline draw-in) plus an
  availability pill that rolls to "let's talk →". Velocity **mono ribbon** · scroll-fill **manifesto**.
- **The Log** — a `tail -f life.log` terminal that streams in, shows commit tooltips on hover,
  and appends an idle line if you go quiet.
- **Work** — three stacking project cards with living-sim canvases; the top progress spine
  takes on the active project's accent. Each card opens a **case file** — an editorial dossier
  (problem → build → pipeline → stack) in an accessible overlay.
- **Experience** — a 2-col grid (Emergent · Ostrius · Teaching Assistant · Apple Developer Academy),
  collapsing to one column ≤680px.
- **Bento** — live Bengaluru clock + uptime, a GitHub 14-day commit **sparkline**, an **"ask me"**
  tile that opens the palette, a focus bar, the **MATS** tile with a rotating 4-color conic glow,
  and a monogram "KK" canvas that reassembles from scattered dots.
- **Memory** — a fading 4-color cursor trail, a returning-visitor "welcome back" greeting, a
  "pick up where you left off" toast that restores your scroll depth, and **sign the log** — a
  guestbook line in the terminal that the site remembers (local-only, forgettable on request).
- **Showcase** rail (drag, arrow keys, wheel) · **"How I build"** pipeline · **contact** end-card.

### Interactions / affordances

- **⌘K** (or the `⌘k` nav button) — command palette: navigate, copy email, open résumé/GitHub,
  cycle phase, spin the verb, party mode.
- **Phase dial** (`☀`/`☾` in the nav) — cycles auto → dawn → day → dusk → night. Defaults to
  `auto`, which follows real Bengaluru time (night mode inverts the page). Persisted for a day.
- **Sound** toggle (footer) — off by default, soft WebAudio ticks on section enter.
- Press **K** twice for party-mode confetti. Footer email click copies (second click opens mail).
- **Colophon** (footer link or ⌘K) — how the site is built + the easter-egg field guide.
- **Print** (⌘P) — the page collapses to a clean, ink-friendly one-pager.
- `404.html`, `robots.txt`, `og-image.png` + JSON-LD Person schema for sharing/SEO.

## Editing content

Almost everything is plain text in [index.html](index.html) — hero copy, roles, the log lines,
projects, experience cells, bento tiles, showcase cards, pipeline, contact.

In [script.js](script.js):

- **Hero copy packs** — `getPacks()` holds five hero variants. Swap by setting `this.heroPack`
  in the constructor (default `worth-remembering`).
- **GitHub tile** — `fetchGithub()` counts public push events in the last 30 days for
  `kunalKumar-13`; it falls back gracefully if the API is unavailable.
- **Project `Code ↗` links** point at the GitHub profile — replace with per-repo URLs in the
  markup when ready.

The résumé button serves `kunal-kumar-resume.pdf` from the repo root.

## Accessibility / degradation

- `prefers-reduced-motion` disables the preloader, smooth scroll, canvases, and scroll
  choreography; content renders statically.
- Touch / coarse pointers skip the custom cursor, magnetics, tilt, and hover-only effects.
- If GSAP/Lenis fail to load, the preloader hides itself and the page renders fully.
- Heavy canvases (aurora, sims, story) are IntersectionObserver-gated, ~30fps-capped, and pause
  on `document.hidden`.
