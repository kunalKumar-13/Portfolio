# KUNAL KUMAR — ISSUE Ø1 / 記憶

A personal portfolio built as a **printed object**: a Japanese design-annual / zine,
rendered in the browser. Warm newsprint, brutal grotesk, a hairline Swiss grid,
bilingual micro-labels, crop marks, a real barcode — and a live 1-bit dither engine.

Static site: **no framework, no build step.** One HTML file, one script, one page.

## Run it

Fonts and the GitHub feed need an HTTP origin, so serve the folder:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## The spreads

| № | Spread | 日本語 | What's in it |
|---|--------|--------|--------------|
| ØØ | Cover | 表紙 | Masthead, the name, live plate, Code128 barcode |
| Ø1 | Contents | 目次 | The issue index |
| Ø2 | Profile | 識別 | Lede, the story, spec sheet, live IST clock |
| Ø3 | Works | 作品 | 4 plates — Recall.me · Triage Agent · Watershed · Aegis |
| Ø4 | Runtime | 経歴 | 7 processes + the live GitHub commit map |
| Ø5 | Second Brain | 第二の脳 | KUNAL_HQ — vault / agent / page, with a typing demo |
| Ø6 | Life.log | 記録 | Append-only timeline + sign-the-log guestbook |
| Ø7 | Modules | 道具 | The stack |
| Ø8 | Colophon | 奥付 | Contact, imprint, field guide |

## PLATE Ø1 — the dither engine

The cover figure is generated live, never an image file:

- A grayscale field is built from a vignette, sine ridges, value noise, a giant **K**
  glyph mask — and **your real commit history as terrain**, so the plate is literally a
  portrait made of the work (it re-renders when the GitHub feed lands).
- That field is reduced to **1-bit** by one of four algorithms — **Atkinson**,
  **Floyd–Steinberg**, **Bayer 4×4**, **Bayer 8×8** — switchable under the figure or with **D**.
- Move the cursor and the image **develops** under it like photographic paper: local
  contrast rises, and the newly-revealed ink prints in **spot magenta**.
- Runs at ~24fps, pauses off-screen and when the tab is hidden; renders once, statically,
  under `prefers-reduced-motion`.

**Want your face on it?** Drop an image in the folder and point the canvas at it:
`<canvas id="plate" data-photo="portrait.jpg">`. The engine dithers it instead.

## Live data

- **Bengaluru clock** — masthead + spec sheet, real IST.
- **Commit map** — last 12 months from the public contributions API, with computed
  total / current streak / longest streak / busiest day. 1-hour session cache. If the feed
  is unreachable it prints an honest **LINK DOWN** notice rather than inventing cells.
- **The barcode is real** — Code128-B, encoded and drawn at runtime.

## Interactions

- **⌘K** — command palette (navigate, switch plates, copy email, sign the log, print)
- **1 – 4** — jump to a work plate · **D** — cycle dither · **G** — sign the log
- **Sign the log** — leave a mark; it's remembered on your next visit (local only, with a *forget* button)
- **Press run** — first load registers CMYK plates before the cover (skippable, once per session)
- **Print** (⌘P or the button) — the issue collapses to a clean one-pager

## Editing

Everything visible is plain text in `index.html`. In `script.js`: the log/terminal script,
the palette actions, the dither parameters. The résumé is `kunal-kumar-resume.pdf`.

## Quality

Lighthouse **100 / 100 / 100 / 100** on both desktop and mobile.
Zero horizontal overflow at 390px · full `prefers-reduced-motion` path · keyboard-navigable
palette and tabs · console clean.
