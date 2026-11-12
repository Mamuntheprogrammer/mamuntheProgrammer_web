# Md Abdullah Al Mamun — Personal Portfolio ("The Pipeline")

> *"I move data from messy to meaningful."*

The personal portfolio of **Md Abdullah Al Mamun** ([@Mamuntheprogrammer](https://github.com/Mamuntheprogrammer)), a techno-functional software engineer based in Dhaka, Bangladesh.

The site is a **static portfolio** designed for **GitHub Pages**: semantic HTML, modern CSS, and vanilla JavaScript. There is no server, database, or framework required. The JavaScript is committed as a prebuilt classic bundle (`js/app.bundle.js`), so the site also works when `index.html` is opened directly from disk.

---

## Highlights

- **Desktop 3D pipeline** — scroll flies the camera through a Three.js pipeline tunnel with six stations.
- **Post-intro lock gate** — a playful animated padlock challenge with nine expertise paths (Python, ABAP, SQL, JavaScript, Go, Rust, Java, Excel, Linux), a typing terminal, free hints, and a letter-rebuild puzzle that reveals a cheat code. Passing shows a success message and a three-second countdown before the portfolio appears. It is always skippable.
- **Mobile-first classic layout** — phones and touch tablets automatically use normal document scrolling, so long sections (especially projects) remain easy to reach.
- **Three visual themes** — cycle the header button through Blueprint Dark, Paper, and Crimson (pure black with a `#CB2957` signal accent). The saved choice is restored before first paint, and the 3D tunnel recolors live.
- **Interactive domain console** — Python, SAP, Data, and AI tabs swap the live refinery view, hero bio, process labels, and telemetry.
- **Portrait lightbox** — click the round portrait for a larger, accessible image view.
- **Embedded data analysis** — the Data domain opens a full scrollable Aristopharma target-vs-achievement dashboard, with separate desktop and mobile builds.
- **Static GitHub project feed** — tries the GitHub API, caches results for one hour, and falls back to [`data/projects.json`](data/projects.json) when offline or rate-limited.
- **SAP-style OK-CODE command bar** — press `/` on desktop and try `/nSE38`, `/nVA01`, `/nME21N`, `/nSE16`, `/nHOME`, `/nPORBO`, `/nPROJ`, `/nYT`, `/nCONTACT`, `help`, or `import this`.
- **Self-hosted fonts** — Space Grotesk and JetBrains Mono (variable WOFF2), so there are no third-party font requests.
- **Accessible fallbacks** — reduced-motion support, a no-JavaScript classic layout, skip link, focus states, focus-trapped modals, and classic navigation when 3D is disabled.
- **Custom social preview** — `assets/social-preview.jpg` (1200×630) for Open Graph/Twitter cards.

---

## Running Locally

Opening `index.html` directly from disk works in classic mode. For the intended 3D experience, serve the repository root over HTTP (ES modules and the Three.js scene need HTTP):

```bash
# Option 1 — Python (recommended)
python3 -m http.server 8000

# Option 2 — Node
npm start

# Option 3 — any static server
npx serve .
```

Then open <http://localhost:8000>.

### Editing JavaScript

`index.html` loads the prebuilt classic bundle. After changing any file under `js/`, rebuild it:

```bash
npm run build
```

The build uses esbuild to create `js/app.bundle.js`, with Three.js left as a dynamic import for the desktop 3D scene.

---

## Deploying to GitHub Pages

**No build is needed for deployment.** `js/app.bundle.js` is already generated and committed with the site, so GitHub Pages serves the repository exactly as-is — no npm, no GitHub Actions, and no build command.

1. Create the special repository **`mamuntheprogrammer.github.io`** on GitHub.
2. Push this project to its `main` branch, including `js/app.bundle.js`.
3. In **Settings → Pages → Build and deployment**, set **Source** to **Deploy from a branch**, then choose **`main`** and **`/ (root)`**.
4. Wait 1–2 minutes. The site is published at <https://mamuntheprogrammer.github.io/>.

The `.nojekyll` file is included so GitHub Pages serves the `vendor/` and `assets/` folders directly without a Jekyll build step.

The custom 404 page uses root-absolute asset paths, so it renders correctly even when a nested URL is requested.

---

## Project Structure

```text
index.html              All six stations, modals, and page shell
404.html                Custom GitHub Pages 404
css/style.css           Layout, themes, lightbox/modal, responsive rules, fonts
js/main.js              Entry point / orchestration
js/app.bundle.js        Prebuilt classic bundle loaded by index.html
js/scene3d.js           Three.js tunnel + interactive refinery/domain tabs
js/spine.js             3D reveal and classic navigation
js/modals.js            Portrait lightbox + embedded analysis dashboard
js/projects.js          GitHub API + static fallback rendering
js/command.js           SAP command bar and Zen of Python modal
js/icons.js             Hand-drawn SVG line icons
js/intro.js             Home-page plotter intro animation
js/lockgate.js          Post-intro lock gate, challenge bank, terminal, puzzle
js/utils/               Command parser, repo filter, spine math, storage, viewport
data/projects.json      Offline/static repository fallback
assets/EM00013923.html         Desktop data-analysis dashboard (iframe)
assets/EM00013923_mobile.html  Mobile data-analysis dashboard (iframe)
assets/Md_Abdullah_Al_Mamun_Resume.pdf  Downloadable one-page resume
assets/                 Portrait, social image, favicon, fonts, touch icon
vendor/three.module.js  Vendored Three.js ES module (no CDN at runtime)
tests/                  Node test-runner checks for logic, markup, and assets
```

---

## Editing Content

- **Name, tagline, bio**: `index.html` hero section (`#section-00-source`) and meta tags in `<head>`.
- **Interactive domain content**: `DOMAIN_VIEWS` in `js/scene3d.js` (titles, bios, points, telemetry, and analysis-tab visibility).
- **SAP / ABAP details**: `#station-sap-abap`, `#station-sap-sd`, `#station-sap-mm`.
- **Data analysis dashboard**: replace the two `assets/EM00013923*.html` files, then rebuild the bundle only if the paths in `js/modals.js` change.
- **Resume download**: replace `assets/Md_Abdullah_Al_Mamun_Resume.pdf` with your latest PDF (keep the filename or update the download button in `#section-06-report`).
- **Contact links and email**: `#section-06-report` (`data-email` on `#contact-email-val`).
- **Fallback repositories**: `data/projects.json`.
- **Lock gate challenges**: `LOCK_CHALLENGES` in `js/lockgate.js` (questions, accepted answers, hints, cheat codes, success copy). Rebuild the bundle after editing.
- **Colors / themes**: CSS custom properties at the top of `css/style.css` (`:root` dark, `[data-theme="paper"]`, and `[data-theme="crimson"]`). The header button cycles Dark → Paper → Crimson.

Replace `assets/profile.jpg` and regenerate `assets/social-preview.jpg` when updating the portrait. Keep the social preview at 1200×630 for best results.

---

## Tests

No dependencies are required — Node's built-in test runner is used:

```bash
npm test
```

The suite checks command parsing, repository filtering, spine math, unresolved JavaScript imports, missing local assets, the vendored Three.js exports, the static projects fallback, six-station markup, the MamunTheProgrammer wordmark, tabbed domain controls, modal markup, the animated intro, the lock gate challenge bank and answer normalization, the resume download, and the prebuilt bundle.

---

## Notes

- The intro name animation draws on every page load. Use **[SKIP INTRO]** to bypass it, or enable `prefers-reduced-motion` in your OS.
- The lock gate appears after the intro once per browser session. Use **[CONTINUE AS VISITOR]**, `Escape`, or the inline skip to bypass it; add `?gate=off` to the URL for demos and automated screenshots. The pass is stored in `sessionStorage`, so a new tab or cleared session shows the challenge again. This is playful theatre, not real security.
- The 3D scene is intentionally disabled on compact/touch viewports, for `prefers-reduced-motion` users, and when `index.html` is opened via `file://`. Use the **VIEW: CLASSIC / 3D REVEAL** toggle on desktop HTTP to switch.
- Direct `file://` opening uses the classic layout. Self-hosted fonts fall back because browsers block font requests from local files.
- Live GitHub API calls are unauthenticated and subject to GitHub's rate limit (60 requests/hour per IP). The static fallback keeps the section usable regardless.
- The analysis dashboard is embedded with an iframe: the mobile build is used at 700px and below, and the modal swaps builds if the viewport crosses that breakpoint.
- `public/` and `.aistudio/` are ignored staging copies and are not used by the deployed site.
