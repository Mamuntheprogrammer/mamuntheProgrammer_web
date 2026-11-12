# Md Abdullah Al Mamun — Personal Portfolio ("The Pipeline")

> *"I move data from messy to meaningful."*

This repository is the personal portfolio of **Md Abdullah Al Mamun** ([@Mamuntheprogrammer](https://github.com/Mamuntheprogrammer)), techno-functional software engineer based in Dhaka, Bangladesh.

A hand-crafted static site designed for **GitHub Pages** with a dark blueprint/oscilloscope aesthetic, a continuous SVG pipeline spine, interactive 3D/2D skill constellation, live GitHub repository ingestion, and SAP-style transaction command shortcuts.

---

## ⚡ Architecture & Key Highlights

- **Static-First & Zero Build Step Requirement**: Pure HTML5, modern CSS, and vanilla ES modules. Can be deployed directly to GitHub Pages or served with `python -m http.server`.
- **The Pipeline Spine**: A continuous SVG path runs the page height, drawing itself as the user scrolls, while a glowing amber data packet rides the tip and pulses across section nodes.
- **Intro Plotter Animation**: First-load stroke-by-stroke SVG plotter handwriting effect of the name *"Md Abdullah Al Mamun"*, with soft letter fills, visible skip button, `sessionStorage` guard, and `prefers-reduced-motion` compliance.
- **Skill Constellation (3D + 2D Fallback)**: Wireframe icosahedron with orbit rings and skill nodes in Three.js (r160+), projecting crisp accessible HTML badges. Zero layout shift via instant 2D SVG rendering first, capability gating (low memory/concurrency, reduced motion), and software WebGL pacing.
- **Custom Line-Art Icons**: 100% original 64x64px line-art glyphs with 2px stroke (no external logo fonts). Self-draws into view on scroll and replays on hover/focus/tap.
- **SAP Command Bar**: Press `/` anywhere to focus the header OK-CODE bar. Supports T-codes:
  - `/nSE38` ➔ Technical ABAP development
  - `/nVA01` ➔ Sales & Distribution (SD) functional workflow
  - `/nME21N` ➔ Materials Management (MM) procurement workflow
  - `/nSE16` ➔ Toolbelt DataFrame
  - `/nHOME` ➔ Hero section & Constellation
  - `/nPROJ` ➔ Live GitHub projects
  - `/nCONTACT` ➔ Communication endpoint & clipboard email
  - `help` ➔ Lists available commands
  - `import this` ➔ Opens terminal modal with Zen of Python
- **Live GitHub Records with Static Fallback**: Queries `api.github.com/users/Mamuntheprogrammer/repos`, caches responses in `sessionStorage`, and falls back to `/data/projects.json` if offline or rate-limited.
- **Strict Honesty & Zero Hallucination**: No invented ABAP objects, metrics, fake percentage bars, or unverified claims. All unfilled fields are clearly designated with `[TODO]` placeholders.

---

## 🚀 Running Locally

No npm install or build step is required! You can serve the project using any standard HTTP server:

### Option 1: Python HTTP Server (Recommended)
```bash
# In the repository root:
python3 -m http.server 8000
# or on Windows:
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Option 2: Node.js / npx
```bash
npx serve .
```

### Option 3: Vite Dev Server (If Node installed)
```bash
npm install
npm run dev
```

---

## 🌐 Deploying to GitHub Pages

1. **Create Repository on GitHub**:
   - Repository name: `mamuntheprogrammer.github.io`
2. **Push Code to Main**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial pipeline portfolio release"
   git branch -M main
   git remote add origin https://github.com/Mamuntheprogrammer/mamuntheprogrammer.github.io.git
   git push -u origin main
   ```
3. **Configure GitHub Pages**:
   - Go to **Settings** ➔ **Pages**.
   - Under **Build and deployment** ➔ **Source**, select **Deploy from a branch**.
   - Branch: `main` / folder: `/ (root)`.
   - Click **Save**.
4. The site will be live at `https://mamuntheprogrammer.github.io/` in ~1-2 minutes.
   - Note: `.nojekyll` is already included to ensure all assets and vendor directories are served cleanly.

---

## 🛠️ How to Edit Content

- **Your Name & Tagline**: Edit hero text and meta tags in `index.html`.
- **ABAP & SAP Details**: Update `station-sap-abap`, `station-sap-sd`, and `station-sap-mm` inside `index.html`.
- **Before ➔ After Automations**: Update cards under `#section-04-automate` in `index.html`.
- **Work Experience & Education**: Edit timeline entries in `#section-05-experience` in `index.html`.
- **Email & Resume**: Update `data-email` and resume links in `#section-06-report` in `index.html`.
- **Static Fallback Repositories**: Update `data/projects.json` if you add new repositories offline.

---

## 📦 Updating the Vendored Three.js Module

The 3D constellation imports a self-contained ES module from `/vendor/three.module.js` with zero runtime CDN calls. To update it:

```bash
# 1. Update npm package
npm install three@latest --save

# 2. Re-bundle the minimal tree-shaken module
node -e "
const fs = require('fs');
const esbuild = require('esbuild');
const entry = \`
export {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Group,
  Vector3,
  Matrix4,
  Color,
  SRGBColorSpace,
  ACESFilmicToneMapping,
  IcosahedronGeometry,
  EdgesGeometry,
  LineSegments,
  LineBasicMaterial,
  RingGeometry,
  SphereGeometry,
  OctahedronGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  MeshBasicMaterial,
  Mesh,
  MathUtils,
  Raycaster
} from 'three';
\`;
fs.writeFileSync('vendor/three-entry.js', entry);
esbuild.buildSync({
  entryPoints: ['vendor/three-entry.js'],
  bundle: true,
  minify: true,
  format: 'esm',
  outfile: 'vendor/three.module.js',
  allowOverwrite: true,
});
fs.unlinkSync('vendor/three-entry.js');
console.log('Updated vendor/three.module.js');
"
```

---

## 📋 Strict Honesty Placeholders Checklist

Below is the list of placeholders `[TODO]` you can complete with your personal data:

- [ ] **Email Address**: Add your primary email to `data-email` in `#section-06-report`.
- [ ] **Resume PDF**: Add your downloadable resume PDF URL to `#section-06-report`.
- [ ] **Current Role & Employer**: Update Job Title and Company in `#section-05-experience`.
- [ ] **SAP ABAP Objects**: Detail custom reports, ALV grids, user exits, or BAPIs in `#station-sap-abap`.
- [ ] **SAP SD/MM Configurations**: Detail business processes handled in `#station-sap-sd` and `#station-sap-mm`.
- [ ] **SAP Automation Story**: Fill in real before ➔ after automation in `#section-04-automate`.
- [ ] **AI / Agent Automation Story**: Fill in real agentic workflow or model pipeline in `#section-04-automate`.
- [ ] **Academic Credentials**: Add university name, degree title, and graduation year in `#section-05-experience`.
- [ ] **Confirmation**: Review the vibe coding wording and footer credit: *"Built with AI assistance, reviewed by me."*
