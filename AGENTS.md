# AGENTS.md

Guidance for AI agents working in this repo. Human-facing overview lives in `README.md`.

## What this is

An interactive, single-page CV for James Brown (JB) that doubles as a print-ready PDF.
**The entire site is one self-contained file: `index.html`** — inline CSS and inline JS,
no framework, no bundler, no build step for the site itself.

The page has two signature pieces of motion:
- **Hero agent-swarm** — a boids flock rendered to `#swarm` (canvas), with the portrait as a
  repulsion zone.
- **Live 3D portrait** — a three.js head (`models/jb.glb`, loaded from a CDN) that tracks the
  cursor. Progressive enhancement: it falls back to the photo `images/3djb.png` when WebGL/CDN
  is unavailable, is hidden at `≤820px`, and is skipped entirely when the URL has `?test=1`.
- **Career timeline** — an SVG git-branch graph built in JS (`main` = JB, each role a branch,
  ThoughtWorks sub-branches per client). The current role (Schroders) is the live branch and
  ends in a pulsing "spark" terminus rather than a committed node.

## Layout

- `index.html` — the whole site (markup + styles + scripts).
- `images/`, `models/` — assets referenced by `index.html` (and copied to the deploy artifact).
- `serve.js` — zero-dependency static server for local preview.
- `scripts/build-pdf.js` — renders `index.html` to `JB_CV.pdf` via Playwright/Chromium.
- `tests/` — Playwright behavioural specs (boids, halo, git graph, a11y, reduced-motion).
- `.github/workflows/deploy.yml` — CI: test → build PDF → deploy to GitHub Pages on push to `main`.

## Commands

```bash
node serve.js          # local preview at http://localhost:8731 (PORT overrides)
npm test               # Playwright specs (chromium, headless) — tests load with ?test=1
npm run pdf            # build JB_CV.pdf from index.html (uses ?test=1, prints A4)
```

There is no install/build step for the site. `npm ci` only fetches `@playwright/test` for
tests and the PDF build.

## Design north star

Two distinct sensibilities — keep them separate and true to source:

- **The PDF** strives for clear, quiet typography and layout in the lineage of **Edward Tufte**
  (high data-ink ratio, no chartjunk, content over decoration), **Ellen Lupton** (typography as
  a deliberate, legible system), and **Massimo Vignelli** (disciplined grid, restrained type
  palette, rigorous structure). When in doubt on the print side: remove, align, and let the
  type carry it.
- **The web page** is inspired by **Daniel Shiffman's _The Nature of Code_** — emergent,
  generative systems you can watch behave: the agent swarm (boids), forces and flocking, the
  living git-branch timeline. New interactive work on the page should feel like it belongs in
  that world: simple local rules producing legible, organic motion.

## Conventions & constraints

- **Keep it self-contained.** Don't introduce a framework, bundler, or external runtime
  dependency for the page. New behaviour goes inline in `index.html`.
- **Progressive enhancement.** Anything heavy (WebGL, animation) must degrade gracefully and
  be skippable. Honour the `?test=1` escape hatch and `prefers-reduced-motion`.
- **Design tokens** live in CSS custom properties at the top of `index.html` — teal `--teal`
  `#3FE0C8`, gold `--gold` `#E8B23A`, on a near-black ground. Fonts: Bricolage Grotesque
  (display), Inter (body), JetBrains Mono (mono/captions). Reuse these, don't hardcode new ones.
- **The print stylesheet matters** — it produces the PDF. Verify changes don't break the
  A4 print layout (the 3D portrait is hidden in print; the photo shows instead).
- **Code style:** terse, vanilla, no semicolize-everything ceremony — match the dense
  surrounding style in the inline scripts.

## Before you finish

- Run `npm test` and keep it green.
- If you touched anything that prints, run `npm run pdf` and sanity-check `JB_CV.pdf`.
- Spot-check the live page in a browser for the swarm, 3D portrait, and git graph — the tests
  cover behaviour but not visual polish.
