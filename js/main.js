/**
 * Main Client Entry Point
 * Orchestrates intro, continuous spine, custom icons, GitHub API data,
 * SAP command bar, 3D constellation, and clipboard helpers.
 */

import { initIntro } from './intro.js';
import { initSpine } from './spine.js';
import { injectIcons, initIconAnimations } from './icons.js';
import { loadProjects } from './projects.js';
import { initCommandBar } from './command.js';
import { init3DScene } from './scene3d.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inject custom hand-crafted line icons
  injectIcons();
  initIconAnimations();

  // 2. Setup SAP Command bar & Easter eggs
  initCommandBar();

  // 3. Setup email copy button
  initEmailCopy();

  // 4. Setup Theme Toggle (Dark Oscilloscope / Paper Blueprint)
  initThemeToggle();

  // 5. Initialize Continuous Spine
  initSpine();

  // 6. Load Projects from GitHub API or fallback
  loadProjects();

  // 7. Setup 3D Scene / 2D fallback
  init3DScene();

  // 8. Run Intro (First load only)
  initIntro(() => {
    // Re-verify spine alignment after intro fades out
    window.dispatchEvent(new Event('resize'));
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

  const savedTheme = localStorage.getItem('mamun_theme') || 'dark';
  if (savedTheme === 'paper') {
    document.documentElement.setAttribute('data-theme', 'paper');
    themeBtn.textContent = 'THEME: PAPER';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn.textContent = 'THEME: DARK';
  }

  themeBtn.addEventListener('click', () => {
    const isPaper = document.documentElement.getAttribute('data-theme') === 'paper';
    const nextTheme = isPaper ? 'dark' : 'paper';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('mamun_theme', nextTheme);
    themeBtn.textContent = nextTheme === 'paper' ? 'THEME: PAPER' : 'THEME: DARK';
  });
}
