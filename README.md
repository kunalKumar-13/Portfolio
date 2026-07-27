# Kunal Kumar — portfolio

A dark, product-led personal site. Static: **no framework, no build step, no dependencies** —
one HTML file, one script, four real screenshots.

## Run it

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## What's here

| Section | Contents |
|---|---|
| Hero | Availability status, positioning, and the four facts that matter |
| Selected work | 4 live products in browser frames — alternating left/right — plus 2 text entries |
| Experience | Roles with current/completed status |
| About | The second-brain system, and details with a live IST clock |
| Activity | Live GitHub commit map — streaks, busiest day, 12 months |
| Contact | Copy-to-clipboard email, GitHub, LinkedIn, résumé |

## The work shown

Screenshots in `shots/` are captured from the **actual live deployments** — not mockups.
Each one sits in a browser frame showing its real URL, and the whole frame links to the site.

| Project | Live | Repo |
|---|---|---|
| Recall | web-seven-puce-99.vercel.app | Recall-me |
| Aegis | aegis-one-livid.vercel.app | aegis |
| PDFChat | pdf-reviewer-ten.vercel.app | PDF-Reviewer |
| Code-Guardian | zeus1205-codeguardian-ai.hf.space | codeguardian-ai- |

Watershed (private repo) and Support Triage appear as text cards below the four.

**To refresh a screenshot:** capture the live site at 1280×800, save it over the matching
`shots/<name>.jpg`, then regenerate the mobile variant:

```sh
sips -Z 640 shots/<name>.jpg --out shots/<name>-640.jpg
```

## Live data

- **Local time** in the About details (IST, ticking).
- **Commit map** — last 12 months from the public contributions API, with computed current and
  longest streaks and busiest day. Cached for an hour in `sessionStorage`. If the feed is down it
  says so and links to GitHub instead of inventing numbers.

## Notes on the build

- **Zero CLS from web fonts.** `Inter Fallback` is a `@font-face` over local Arial with
  `size-adjust`/`ascent-override` tuned to Inter's metrics, so the real font swaps in without
  reflowing a line.
- **No layout shift from async data** — the commit grid reserves its final height and the stats
  row renders placeholders, so filling them moves nothing.
- **Responsive images** — `srcset` serves 640px on phones, 1280px on desktop.
- **Motion** — everything reveals via `IntersectionObserver`; the whole thing renders static
  under `prefers-reduced-motion`.
- **Touch** — sub-44px links get invisible `::after` hit areas below 640px; no visual change.

## Quality

Lighthouse **100 / 100 / 100 / 100** — desktop *and* mobile.
No horizontal overflow at 390px · full `prefers-reduced-motion` path · console clean.
