# Kunal Kumar — portfolio

A minimal, work-first personal site. Static: **no framework, no build step** — one HTML file,
one script, four real screenshots.

## Run it

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## What's here

| Section | Contents |
|---|---|
| Hero | The name (spring entrance + letters that react to your cursor), positioning line, status |
| Selected work | 4 live products with **real screenshots**, plus 2 text-only entries |
| About | Story, facts, the second-brain system |
| Where I've been | Roles, and a live GitHub commit map |
| Contact | Copy-to-clipboard email, socials, résumé |

## The work shown

Screenshots in `shots/` are captured from the **actual live deployments** — not mockups:

| Project | Live | Repo |
|---|---|---|
| Recall | web-seven-puce-99.vercel.app | Recall-me |
| Aegis | aegis-one-livid.vercel.app | aegis |
| PDFChat | pdf-reviewer-ten.vercel.app | PDF-Reviewer |
| Code-Guardian | zeus1205-codeguardian-ai.hf.space | codeguardian-ai- |

Watershed (private) and Deterministic Support Triage appear as text entries.

**To refresh a screenshot:** capture the live site at 1280×800 (2× DPR) and save it over the
matching file in `shots/` — the layout picks it up as-is.

## The name animation

Each letter is a sprung mass. On load they rise into place with a staggered overshoot; after
that they respond to the pointer — a gaussian falloff lifts the nearest letters and tilts them
away from the cursor, then springs them back. Click the name and the whole thing hops.
Under `prefers-reduced-motion` it renders statically, and the name is real text in the HTML so
it shows with JavaScript disabled.

## Live data

- **Local time** in the About facts (IST).
- **Commit map** — last 12 months from the public contributions API, with computed streaks and
  busiest day, cached for an hour. If the feed is down it says so instead of inventing data.

## Quality

Lighthouse **100 / 100 / 100 / 100** — desktop *and* mobile.
No horizontal overflow at 390px · full `prefers-reduced-motion` path · console clean.
