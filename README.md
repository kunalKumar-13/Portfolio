# KUNAL.SYS — portfolio, v2.0

> building software worth remembering.

A ground-up rebuild. The portfolio is a **memory core**: a dark CRT/terminal interface —
phosphor amber on near-black, Anton + JetBrains Mono, a HUD frame with live sector/memory
readouts, and a boot sequence.

**Zero dependencies.** No framework, no build step, no animation libraries — one HTML file,
one vanilla-JS class (`Kernel` in [script.js](script.js)). Google Fonts is the only external
request.

## Run it

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## The machine

- **BOOT (0x00)** — a once-per-session boot log; hero with a typewriter brand line, a
  phosphor **memory-grid canvas** that lights where your cursor sweeps and fades like CRT
  persistence, and a crosshair cursor with live coordinates.
- **IDENTITY (0x01)** — the thesis + a spec sheet (host/proc/edu/focus/state/uptime, live IST).
- **MEMORY BANKS (0x02)** — the three projects as expandable banks: problem → build →
  ownership → 4-step pipeline → stack → code link.
- **RUNTIME (0x03)** — experience as a `ps aux` process table (RUNNING / EXIT 0 / QUEUED).
- **LIFE.LOG (0x04)** — 8 career milestones, tail -f style, ending on a blinking cursor —
  plus **leave a mark**: visitors sign the log and the site remembers them (local-only,
  forgettable).
- **MODULES (0x05)** — the stack as `lsmod` groups. **TRANSMIT (0x06)** — say hello.

### Field guide

- **⌘K** or **/** — command palette (navigate, copy email, resume, sign the log, colophon,
  `sudo party`).
- **K K** — SYSTEM FAULT (a glitch + confetti). The **colophon** explains the whole build.
- It remembers you: visit count, welcome-back greeting, scroll-depth **RESTORE SESSION**
  toast, and your log signature. All localStorage — nothing leaves the device.
- Reduced motion → fully static core. Prints as a clean one-pager. `404.html` on-brand.

## Editing content

Everything visible is plain text in [index.html](index.html) (hero, spec sheet, banks,
process table, log lines, modules, contact). Behavior lives in the `Kernel` class —
each feature is one small method. The résumé is `kunal-kumar-resume.pdf` at the root.

## Numbers

Lighthouse: **97–100 performance · 100 accessibility · 100 best-practices · 100 SEO**.
