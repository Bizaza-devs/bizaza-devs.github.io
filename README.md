# bizaza-devs.github.io

Personal portfolio of **Zalan Birtalan** — student developer, founder of ALAN BIRTH.

Night Shift: deep black, electric gradients, bold type. **0 images, 0 frameworks, 0 dependencies** — plain HTML, CSS and JavaScript.

## Features
- Generative CSS background: drifting aurora, a dot grid that lights up around the cursor, film grain
- All content in one file: [`assets/js/data.js`](assets/js/data.js)
- Live GitHub data: contribution calendar, streaks, languages, recent activity, repositories
- Downloadable one-page CV (PDF), generated from the same data: `scripts/build-cv.ps1`
- Hidden command palette (`Ctrl K` / `⌘K` / `/`), scroll progress, live local clock
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
