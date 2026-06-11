# Kunal Kumar — Portfolio

"Continuity Ribbon" — a single-page portfolio implemented from the Claude Design prototype
(`Kunal Kumar.dc.html`). Static site: no build step, no framework.

## Stack

- Plain HTML + inline design tokens ([index.html](index.html))
- [GSAP 3.12](https://gsap.com) + ScrollTrigger + [Lenis](https://lenis.darkroom.engineering) smooth scroll (CDN)
- Fonts: Bricolage Grotesque · Archivo · Instrument Serif · JetBrains Mono (Google Fonts)
- All motion behaviors live in [script.js](script.js)

## Run it

Fonts and CDN scripts need an HTTP origin, so serve the folder:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Editing content

Everything visible is in `index.html` (hero copy, projects, experience rows, honors, footer
links). Three things live in `script.js`:

- **Toolkit chips** — the `data` map in `buildChips()` (keyed by accent color)
- **Hero copy packs** — `getPacks()` holds all five hero variants (slot verbs, headline
  lines, preloader words, verb marquee). Swap packs by changing `this.heroPack` in the
  constructor — one line. Shipped default: `worth-remembering`.
- **Project links** — each card has `Code ↗` / `Live ↗` pills in `index.html`; replace the
  `data-live` placeholder `#` with real URLs

Easter eggs: press **K** twice for party mode; the slot verb is clickable; clicking the
footer email copies it (second click within 3s opens the mail app).

The résumé button points at `kunal-kumar-resume.pdf` in the repo root — replace that file to
update it.

## Accessibility / degradation

- `prefers-reduced-motion` disables the preloader, smooth scroll and all scroll choreography
- Touch / coarse pointers skip the custom cursor, magnetics and tilt
- If the GSAP/Lenis CDNs fail, the preloader hides itself and the page renders fully static
