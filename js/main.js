/**
 * Main Client Entry Point
 * Orchestrates intro, continuous spine, custom icons, GitHub API data,
 * SAP command bar, 3D constellation, and clipboard helpers.
 */

import { initIntro } from './intro.js';
import { initLockGate } from './lockgate.js';
import { initSpine } from './spine.js';
import { injectIcons, initIconAnimations } from './icons.js';
import { loadProjects } from './projects.js';
import { initCommandBar } from './command.js';
import { init3DScene } from './scene3d.js';
import { initPortraitLightbox, initAnalysisModal } from './modals.js';
import { localGet, localSet } from './utils/storage.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inject custom hand-crafted line icons
  injectIcons();
  initIconAnimations();

  // 2. Setup SAP Command bar & Easter eggs
  initCommandBar();

  // 3. Setup email copy button
  initEmailCopy();

  // 4. Setup the portrait lightbox and the embedded data-analysis modal
  initPortraitLightbox();
  initAnalysisModal();

  // 5. Setup Theme Toggle (Dark Oscilloscope / Paper Blueprint)
  initThemeToggle();

  // 6. Decide layout mode first (desktop 3D vs classic/mobile), then wire scrolling
  init3DScene();

  // 7. Initialize navigation: 3D reveal on desktop, classic scroll observer elsewhere
  initSpine();

  // 8. Load Projects from GitHub API or fallback
  loadProjects();

  // 9. Prepare the playful lock gate, then run the intro and reveal the gate.
  const lockGate = initLockGate({
    onClose: () => {
      // Re-verify spine alignment after the gate fades out
      window.dispatchEvent(new Event('resize'));
    },
  });

  initIntro(() => {
    // Re-verify spine alignment after intro fades out
    window.dispatchEvent(new Event('resize'));
    lockGate.open();
  });
});

function initEmailCopy() {
  const copyBtn = document.getElementById('copy-email-btn');
  const emailTextEl = document.getElementById('contact-email-val');

  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const textToCopy = emailTextEl?.dataset.email || 'mamuntheprogrammer@gmail.com';

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--line-mint)">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>COPIED TO CLIPBOARD</span>
      `;
      setTimeout(() => {
        copyBtn.innerHTML = origText;
      }, 2500);
    } catch (err) {
      console.warn('Clipboard write failed', err);
    }
  });
}

function initThemeToggle() {
  const themeBtn = document.getElementById('toggle-theme-btn');
  if (!themeBtn) return;

  const themeColor = document.querySelector('meta[name="theme-color"]');
  const themes = ['dark', 'paper', 'crimson'];
  const labels = { dark: 'DARK', paper: 'PAPER', crimson: 'CRIMSON' };
  const browserColors = { dark: '#070b10', paper: '#f1f5f9', crimson: '#000000' };

  const applyTheme = (nextTheme) => {
    const theme = themes.includes(nextTheme) ? nextTheme : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localSet('mamun_theme', theme);

    const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
    themeBtn.textContent = `THEME: ${labels[theme]}`;
    themeBtn.setAttribute(
      'aria-label',
      `Current theme: ${labels[theme]}. Activate to switch to ${labels[themes[nextIndex]]}.`
    );
    themeBtn.removeAttribute('aria-pressed');

    if (themeColor) {
      themeColor.setAttribute('content', browserColors[theme]);
    }

    window.dispatchEvent(new CustomEvent('mamun:themechange', { detail: { theme } }));
  };

  const savedTheme = localGet('mamun_theme');
  applyTheme(themes.includes(savedTheme) ? savedTheme : 'dark');

  themeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextIndex = (themes.indexOf(current) + 1) % themes.length;
    applyTheme(themes[nextIndex]);
  });
}
