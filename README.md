# bizaza-devs.github.io

Personal portfolio of **Zalan Birtalan** — student developer, founder of ALAN BIRTH.

Monochrome liquid glass. **0 images, 0 frameworks, 0 dependencies** — plain HTML, CSS and JavaScript.

## Features
- Liquid glass panels: `backdrop-filter` + an SVG displacement filter for real refraction (Chromium), graceful blur fallback elsewhere
- All content in one file: [`assets/js/data.js`](assets/js/data.js) — English / Hungarian
- Live GitHub data: contribution calendar, streaks, languages, recent activity, repositories
- Downloadable one-page CV (EN/HU PDF), generated from the same data: `scripts/build-cv.ps1`
- Command palette (`Ctrl K` / `⌘K` / `/`), scroll progress, live local clock
- Responsive down to 320 px, respects `prefers-reduced-motion`

## Run locally
```bash
python -m http.server 5173
# open http://localhost:5173
```

## Deploy
GitHub Pages → Settings → Pages → Deploy from branch → `main` / root.
The site is served at `https://bizaza-devs.github.io`.

## Data sources
- GitHub REST API (public, unauthenticated, cached 10 min in `sessionStorage`)
- Contribution calendar: [github-contributions-api](https://github.com/grubersjoe/github-contributions-api)
