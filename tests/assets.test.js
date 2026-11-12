import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function localAssetPaths(htmlFile) {
  const html = fs.readFileSync(path.join(ROOT, htmlFile), 'utf8');
  const matches = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  return matches.filter(
    (href) =>
      !href.startsWith('#') &&
      !href.startsWith('http') &&
      !href.startsWith('mailto:') &&
      !href.startsWith('tel:')
  );
}

test('every local asset referenced by the HTML exists', () => {
  const missing = [];

  for (const htmlFile of ['index.html', '404.html']) {
    for (const href of localAssetPaths(htmlFile)) {
      const clean = href.split('?')[0].split('#')[0];
      const resolved = clean.startsWith('/')
        ? path.join(ROOT, clean)
        : path.resolve(ROOT, path.dirname(htmlFile), clean);
      if (!fs.existsSync(resolved)) missing.push(`${htmlFile} -> ${href}`);
    }
  }

  assert.deepEqual(missing, [], `Missing assets:\n${missing.join('\n')}`);
});

test('every JavaScript module import resolves on disk', () => {
  const jsFiles = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.js')) jsFiles.push(full);
    }
  };
  walk(path.join(ROOT, 'js'));

  const missing = [];
  for (const file of jsFiles) {
    const source = fs.readFileSync(file, 'utf8');
    const imports = [...source.matchAll(/(?:import|from)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
    for (const specifier of imports) {
      if (!specifier.startsWith('.')) continue;
      const resolved = path.resolve(path.dirname(file), specifier);
      if (!fs.existsSync(resolved)) {
        missing.push(`${path.relative(ROOT, file)} -> ${specifier}`);
      }
    }
  }

  assert.deepEqual(missing, [], `Unresolved imports:\n${missing.join('\n')}`);
});

test('vendored Three.js bundle exports the classes used by the 3D scene', () => {
  const bundle = fs.readFileSync(path.join(ROOT, 'vendor', 'three.module.js'), 'utf8');
  const required = [
    'Scene',
    'PerspectiveCamera',
    'WebGLRenderer',
    'Group',
    'Vector3',
    'CatmullRomCurve3',
    'TubeGeometry',
    'EdgesGeometry',
    'LineSegments',
    'LineBasicMaterial',
    'RingGeometry',
    'OctahedronGeometry',
    'BoxGeometry',
    'MeshBasicMaterial',
    'FogExp2',
    'SRGBColorSpace',
  ];
  const missing = required.filter((name) => !new RegExp(`\\b${name}\\b`).test(bundle));
  assert.deepEqual(missing, [], `Missing Three.js exports: ${missing.join(', ')}`);
});

test('static projects fallback is valid and complete', () => {
  const projects = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'));
  assert.ok(Array.isArray(projects) && projects.length > 0);

  for (const repo of projects) {
    assert.equal(typeof repo.name, 'string');
    assert.equal(typeof repo.description, 'string');
    assert.equal(typeof repo.language, 'string');
    assert.match(repo.html_url, /^https:\/\/github\.com\//);
    assert.ok(Array.isArray(repo.tags));
  }
});

test('GitHub Pages marker and self-hosted fonts are present', () => {
  assert.ok(fs.existsSync(path.join(ROOT, '.nojekyll')));
  assert.ok(fs.existsSync(path.join(ROOT, 'assets', 'fonts', 'space-grotesk-latin.woff2')));
  assert.ok(fs.existsSync(path.join(ROOT, 'assets', 'fonts', 'jetbrains-mono-latin.woff2')));
});
