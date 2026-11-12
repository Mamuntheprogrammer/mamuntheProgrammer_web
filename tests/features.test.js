import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

test('the portfolio exposes six stations and no legacy AUTOMATE station', () => {
  const stationSections = [...html.matchAll(/<section[^>]*class="[^"]*spatial-station[^"]*"/g)];
  assert.equal(stationSections.length, 6);
  assert.equal((html.match(/class="dock-step-btn[^"]*"/g) || []).length, 6);
  assert.ok(!html.includes('section-04-automate'));
  assert.ok(!html.includes('STATION 05: AUTOMATE'));
  assert.ok(!/\[NODE\s/i.test(html), 'visible [NODE xx] labels are no longer used');
  assert.match(html, /\[EXPLORE STAGES 00 ➔ 05\]/);
});

test('header uses the MamunTheProgrammer wordmark with a separate accent', () => {
  assert.match(
    html,
    /<span class="brand-wordmark">Mamun<span class="brand-wordmark-accent">TheProgrammer<\/span><\/span>/
  );
  assert.ok(!html.includes('MAMUN.DEV'));
  assert.ok(!html.includes('.DEV</span>'));

  const css = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
  assert.match(css, /\.brand-wordmark-accent\s*\{[^}]*color:\s*var\(--packet-amber\)/s);
});

test('portrait lightbox and tabbed domain console are wired into the markup', () => {
  assert.match(html, /id="portrait-lightbox-btn"/);
  assert.match(html, /id="portrait-modal"/);
  assert.match(html, /id="portrait-close-btn"/);
  assert.match(html, /id="hero-bio"/);

  for (const domain of ['python', 'sap', 'data', 'ai']) {
    assert.match(html, new RegExp(`data-refinery-domain="${domain}"`));
    assert.match(html, new RegExp(`id="refinery-tab-${domain}"`));
  }

  assert.match(html, /id="refinery-domain-panel"/);
  assert.match(html, /id="refinery-domain-title"/);
  assert.match(html, /id="refinery-domain-points"/);
  assert.match(html, /id="refinery-analysis-btn"/);
});

test('embedded data-analysis modal references both dashboard builds', () => {
  assert.match(html, /id="analysis-modal"/);
  assert.match(html, /id="analysis-frame"/);
  assert.match(html, /id="analysis-close-btn"/);
  assert.match(html, /data-open-analysis/);

  for (const build of ['EM00013923.html', 'EM00013923_mobile.html']) {
    assert.ok(fs.existsSync(path.join(ROOT, 'assets', build)), `missing ${build}`);
    const dashboard = fs.readFileSync(path.join(ROOT, 'assets', build), 'utf8');
    assert.ok(!/https?:\/\//.test(dashboard), `${build} should be self-contained`);
  }

  const modals = fs.readFileSync(path.join(ROOT, 'js', 'modals.js'), 'utf8');
  assert.match(modals, /EM00013923_mobile\.html/);
  assert.match(modals, /EM00013923\.html/);
  assert.match(modals, /export function initPortraitLightbox/);
  assert.match(modals, /export function initAnalysisModal/);
});

test('contact offers a downloadable resume and no PyGems link', () => {
  assert.match(html, /href="\.\/assets\/Md_Abdullah_Al_Mamun_Resume\.pdf"/);
  assert.match(html, /download="Md_Abdullah_Al_Mamun_Resume\.pdf"/);
  const contactStart = html.indexOf('id="section-06-report"');
  const contactSection = html.slice(contactStart, html.indexOf('</section>', contactStart));
  assert.ok(!contactSection.includes('pygems.com'), 'PyGems contact link should be removed');

  const pdfPath = path.join(ROOT, 'assets', 'Md_Abdullah_Al_Mamun_Resume.pdf');
  assert.ok(fs.existsSync(pdfPath));
  assert.equal(fs.readFileSync(pdfPath).subarray(0, 4).toString(), '%PDF');
});

test('intro draws the name on load and can be skipped', () => {
  assert.match(html, /id="intro-overlay"/);
  assert.match(html, /id="intro-skip-btn"/);
  assert.equal((html.match(/class="plotter-path"/g) || []).length, 18);
  assert.ok(!html.includes('plotter-fill'), 'the mismatched ghost fill was removed');

  const intro = fs.readFileSync(path.join(ROOT, 'js', 'intro.js'), 'utf8');
  assert.match(intro, /path\.animate\(/);
  assert.match(intro, /idx \* 110/);
  assert.ok(!intro.includes('alreadyShown'), 'the intro should replay on each page load');
});

test('index.html loads the classic bundle so opening from disk works', () => {
  assert.match(html, /<script src="\.\/js\/app\.bundle\.js"><\/script>/);
  assert.ok(fs.existsSync(path.join(ROOT, 'js', 'app.bundle.js')));

  const bundle = fs.readFileSync(path.join(ROOT, 'js', 'app.bundle.js'), 'utf8');
  assert.match(bundle, /import\("\.\.\/vendor\/three\.module\.js"\)/);
  assert.match(bundle, /refinery-domain-panel/);
  assert.match(bundle, /portrait-lightbox-btn/);
  assert.match(bundle, /analysis-frame/);
  assert.match(bundle, /e\.preventDefault\(\);\s*execute\(input\.value\)/);
});

test('portfolio copy is selectable', () => {
  const css = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
  const selectableBlock = css.match(/body,\s*\.station-frame,\s*\.spatial-station,\s*\.refinery-domain-panel\s*\{([^}]*)\}/s);
  assert.ok(selectableBlock, 'selectable-copy rule is missing');
  assert.match(selectableBlock[1], /-webkit-user-select:\s*text/);
  assert.match(selectableBlock[1], /user-select:\s*text/);
});
