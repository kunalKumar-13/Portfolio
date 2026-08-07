# The Record — Kunal Kumar

A personal portfolio set as a newspaper. Static: **no framework, no build step, no
dependencies** — one HTML file, one script, four real screenshots.

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## The paper

Nine pages, in the paper's own language:

| Page | Contents |
|---|---|
| One | Lead story, drop cap, two justified columns, "Inside This Issue", a Conditions box with the live IST clock |
| Two–Five | Recall, Aegis, PDFChat and Code-Guardian, each with kicker, headline, deck, byline, photo caption, pull quote and a working jump line |
| Six | Briefs (Watershed, Support Triage, the second brain) and a real Corrections column |
| Seven | Appointments — roles, dates, institutions |
| Eight | Market Report — the live GitHub contributions feed set as a market table |
| Nine | Classified — contact, and Letters to the Editor |

## The fold

Panels arrive rotated back below a creased rule and turn flat as you reach them.

The mechanism is built so it cannot break anything:

- **The CSS default is unfolded.** JS opts *in* by adding `.jsfold` to `<html>`, then
  releases each panel on approach. So the no-JS path and the `prefers-reduced-motion`
  path are correct for free rather than bolted on.
- **`transform` and `box-shadow` only** — never layout. It cannot cause layout shift.
- A **6-second safety net** opens anything a missed observer callback left shut, so a
  story can never end up unreadable.
- The angle is `-62deg`, not `-86deg`. Edge-on rotation projects every control inside a
  panel to a ~2px box: Lighthouse reads the links as unclickable and the text as 1.17:1
  contrast, and it is right on both counts.

## The work shown

Screenshots in `shots/` are captures of the **actual live deployments** — not mockups.

| Project | Live | Repo |
|---|---|---|
| Recall | web-seven-puce-99.vercel.app | Recall-me |
| Aegis | aegis-one-livid.vercel.app | aegis |
| PDFChat | pdf-reviewer-ten.vercel.app | PDF-Reviewer |
| Code-Guardian | zeus1205-codeguardian-ai.hf.space | codeguardian-ai- |

Watershed (private repo) and Support Triage appear as briefs on Page Six.

**To refresh a screenshot:** capture the live site at 1280×800, save it over the matching
`shots/<name>.jpg`, then regenerate the phone variant:

```sh
sips -Z 720 shots/<name>.jpg --out shots/<name>-720.jpg
```

## Type

Playfair Display for headlines, Source Serif 4 for text, Oswald for kickers and furniture.

Each has a metric-matched `@font-face` stand-in so the web faces swap in without moving a
line. **Measure those numbers through the live stack, never in isolation** — measured in
isolation they were 15% out on the headline face and 13% out on the body, which set the
lead headline on two lines instead of three and reflowed the front page by 122px on swap.
Measured in situ, both land within 0.7%.

## Live data

- **The clock** in the folio and the Conditions box (IST).
- **The Market Report** — twelve months from the public contributions API, with computed
  streaks and busiest day, cached an hour in `sessionStorage`. If the feed is down the
  column says so rather than printing a figure.

## Notes

- Newsprint is CSS: warm grey paper, soft-black ink (never `#000`), one red plate. The
  paper tooth is two repeating gradients — no image requests.
- The classifieds use CSS grid, not multi-column. Multi-column fragmented the links into
  2px-tall hit targets.
- `@media print` produces something genuinely printable — it is a newspaper.

## Quality

Lighthouse **100 / 100 / 100 / 100** — desktop *and* mobile. CLS 0.003 / 0.001.
No horizontal overflow at 320px · full `prefers-reduced-motion` path · every story
readable with JavaScript disabled · console clean.

## Earlier editions

Every previous direction is tagged and reachable: `v5.6-measure` (the Japanese zine),
`v7.0` (dark, product-led), `v2.2-heatmap` (the CRT memory core), and others.
