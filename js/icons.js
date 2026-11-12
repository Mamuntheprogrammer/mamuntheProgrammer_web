/**
 * Custom Line-Art SVG Icons
 * 64x64 grid, 2px stroke, round caps & joins, mint #5eead4 palette.
 * Self-drawing stroke animation on intersection, replay on hover/tap.
 */

export const ICONS = {
  python: `
    <svg viewBox="0 0 64 64" fill="none" class="station-icon-svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Looping serpent single curve -->
      <path class="draw-path" d="M 18 16 C 18 10, 36 10, 36 18 C 36 28, 14 24, 14 36 C 14 48, 38 52, 46 44 C 52 38, 50 26, 44 26" />
      <path class="draw-path" d="M 44 26 C 36 26, 32 38, 40 44" />
      <circle class="draw-node" cx="22" cy="15" r="1.5" fill="currentColor" stroke="none" />
      <circle class="draw-node" cx="42" cy="45" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  `,

  sap: `
    <svg viewBox="0 0 64 64" fill="none" class="station-icon-svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Cut-corner hexagonal table grid -->
      <polygon class="draw-path" points="20 8, 44 8, 56 20, 56 44, 44 56, 20 56, 8 44, 8 20" />
      <line class="draw-path" x1="8" y1="32" x2="56" y2="32" stroke-dasharray="3 3" />
      <line class="draw-path" x1="32" y1="8" x2="32" y2="56" />
      <!-- Integrated transaction badge [T] -->
      <rect class="draw-path" x="22" y="22" width="20" height="20" rx="3" fill="var(--bg-surface-solid)" stroke="currentColor" />
      <path class="draw-path" d="M 26 27 L 38 27 M 32 27 L 32 37" />
    </svg>
  `,

  data: `
    <svg viewBox="0 0 64 64" fill="none" class="station-icon-svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- DataFrame brackets [ ] -->
      <path class="draw-path" d="M 14 12 L 8 12 L 8 52 L 14 52" />
      <path class="draw-path" d="M 50 12 L 56 12 L 56 52 L 50 52" />
      <!-- Ascending multi-point line chart -->
      <polyline class="draw-path" points="16 42, 26 34, 36 38, 48 20" />
      <circle class="draw-node" cx="16" cy="42" r="2.5" fill="currentColor" />
      <circle class="draw-node" cx="26" cy="34" r="2.5" fill="currentColor" />
      <circle class="draw-node" cx="36" cy="38" r="2.5" fill="currentColor" />
      <circle class="draw-node" cx="48" cy="20" r="3" fill="#fbbf24" stroke="#fbbf24" />
      <!-- Baseline grid -->
      <line class="draw-path" x1="14" y1="48" x2="50" y2="48" stroke-dasharray="2 2" stroke-opacity="0.4" />
    </svg>
  `,

  web: `
    <svg viewBox="0 0 64 64" fill="none" class="station-icon-svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Globe latitude & meridian curves -->
      <circle class="draw-path" cx="32" cy="32" r="22" stroke-opacity="0.35" />
      <ellipse class="draw-path" cx="32" cy="32" rx="10" ry="22" stroke-opacity="0.35" />
      <line class="draw-path" x1="10" y1="32" x2="54" y2="32" stroke-opacity="0.35" />
      <!-- Sharp </> code glyphs -->
      <path class="draw-path" d="M 22 24 L 14 32 L 22 40" />
      <path class="draw-path" d="M 42 24 L 50 32 L 42 40" />
      <line class="draw-path" x1="36" y1="20" x2="28" y2="44" />
    </svg>
  `,

  ai: `
    <svg viewBox="0 0 64 64" fill="none" class="station-icon-svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Neural network nodes & synapses -->
      <circle class="draw-node" cx="16" cy="22" r="3" fill="currentColor" />
      <circle class="draw-node" cx="16" cy="42" r="3" fill="currentColor" />
      <circle class="draw-node" cx="32" cy="14" r="3" fill="currentColor" />
      <circle class="draw-node" cx="32" cy="32" r="3.5" fill="#fbbf24" stroke="#fbbf24" />
      <circle class="draw-node" cx="32" cy="50" r="3" fill="currentColor" />
      <circle class="draw-node" cx="48" cy="24" r="3" fill="currentColor" />
      <circle class="draw-node" cx="48" cy="40" r="3" fill="currentColor" />
      <!-- Synaptic connections -->
      <line class="draw-path" x1="16" y1="22" x2="32" y2="14" />
      <line class="draw-path" x1="16" y1="22" x2="32" y2="32" />
      <line class="draw-path" x1="16" y1="42" x2="32" y2="32" />
      <line class="draw-path" x1="16" y1="42" x2="32" y2="50" />
      <line class="draw-path" x1="32" y1="14" x2="48" y2="24" />
      <line class="draw-path" x1="32" y1="32" x2="48" y2="24" />
      <line class="draw-path" x1="32" y1="32" x2="48" y2="40" />
      <line class="draw-path" x1="32" y1="50" x2="48" y2="40" />
    </svg>
  `,

  agentic: `
    <svg viewBox="0 0 64 64" fill="none" class="station-icon-svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Orbiting loop arrow around cognitive node -->
      <circle class="draw-node" cx="32" cy="32" r="7" fill="rgba(94,234,212,0.15)" stroke="currentColor" />
      <circle class="draw-node" cx="32" cy="32" r="2.5" fill="#fbbf24" stroke="#fbbf24" />
      <!-- Orbit loop with arrowheads -->
      <path class="draw-path" d="M 32 12 A 20 20 0 1 1 16 22" />
      <polyline class="draw-path" points="14 14, 16 22, 24 22" />
      <!-- Small satellite nodes -->
      <circle class="draw-node" cx="50" cy="22" r="2" fill="currentColor" />
      <circle class="draw-node" cx="44" cy="48" r="2" fill="currentColor" />
      <circle class="draw-node" cx="18" cy="44" r="2" fill="currentColor" />
    </svg>
  `,

  ml: `
    <svg viewBox="0 0 64 64" fill="none" class="station-icon-svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Coordinate axes -->
      <line class="draw-path" x1="10" y1="54" x2="54" y2="54" />
      <line class="draw-path" x1="10" y1="54" x2="10" y2="10" />
      <!-- Fitted regression curve -->
      <path class="draw-path" d="M 12 48 Q 28 42, 38 28 T 54 14" stroke="#fbbf24" />
      <!-- Scatter points -->
      <circle class="draw-node" cx="16" cy="44" r="2" fill="currentColor" />
      <circle class="draw-node" cx="22" cy="40" r="2" fill="currentColor" />
      <circle class="draw-node" cx="26" cy="46" r="2" fill="currentColor" />
      <circle class="draw-node" cx="34" cy="30" r="2" fill="currentColor" />
      <circle class="draw-node" cx="42" cy="24" r="2" fill="currentColor" />
      <circle class="draw-node" cx="46" cy="28" r="2" fill="currentColor" />
      <circle class="draw-node" cx="50" cy="18" r="2" fill="currentColor" />
    </svg>
  `,

  flutter: `
    <svg viewBox="0 0 64 64" fill="none" class="station-icon-svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Phone chassis -->
      <rect class="draw-path" x="14" y="8" width="36" height="48" rx="5" />
      <!-- Screen boundary -->
      <line class="draw-path" x1="14" y1="16" x2="50" y2="16" />
      <line class="draw-path" x1="14" y1="48" x2="50" y2="48" />
      <circle class="draw-node" cx="32" cy="52" r="1.5" fill="currentColor" />
      <!-- Stacked widget tree blocks inside viewport -->
      <rect class="draw-path" x="20" y="20" width="24" height="6" rx="2" stroke-dasharray="2 2" />
      <rect class="draw-path" x="22" y="29" width="10" height="14" rx="2" fill="rgba(94,234,212,0.15)" />
      <rect class="draw-path" x="34" y="29" width="10" height="14" rx="2" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" />
    </svg>
  `,

  automation: `
    <svg viewBox="0 0 64 64" fill="none" class="station-icon-svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Gear wheel with teeth -->
      <circle class="draw-node" cx="32" cy="32" r="10" />
      <circle class="draw-node" cx="32" cy="32" r="4" fill="currentColor" />
      <!-- Gear teeth -->
      <path class="draw-path" d="M 32 14 L 32 18 M 32 46 L 32 50 M 14 32 L 18 32 M 46 32 L 50 32" stroke-width="3" />
      <path class="draw-path" d="M 19 19 L 22 22 M 42 42 L 45 45 M 19 45 L 22 42 M 42 22 L 45 19" stroke-width="3" />
      <!-- Counter-clockwise looping cycle arrow -->
      <path class="draw-path" d="M 12 26 A 22 22 0 1 1 12 38" stroke="#fbbf24" stroke-width="1.8" />
      <polyline class="draw-path" points="8 26, 12 26, 12 20" stroke="#fbbf24" />
    </svg>
  `,

  vibecoding: `
    <svg viewBox="0 0 64 64" fill="none" class="station-icon-svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Terminal prompt frame -->
      <rect class="draw-path" x="8" y="12" width="48" height="40" rx="4" />
      <line class="draw-path" x1="8" y1="22" x2="56" y2="22" />
      <circle class="draw-node" cx="14" cy="17" r="1.5" fill="currentColor" />
      <circle class="draw-node" cx="20" cy="17" r="1.5" fill="currentColor" />
      <!-- Prompt cursor >_ -->
      <path class="draw-path" d="M 16 32 L 24 37 L 16 42" stroke="#5eead4" stroke-width="2.5" />
      <line class="draw-path" x1="28" y1="42" x2="36" y2="42" stroke="#fbbf24" stroke-width="2" />
      <!-- Spark of generation -->
      <path class="draw-path" d="M 44 28 L 46 34 L 52 36 L 46 38 L 44 44 L 42 38 L 36 36 L 42 34 Z" fill="rgba(251,191,36,0.2)" stroke="#fbbf24" stroke-width="1.5" />
    </svg>
  `,
};

export function injectIcons() {
  const iconHolders = document.querySelectorAll('[data-icon]');
  iconHolders.forEach((el) => {
    const key = el.dataset.icon?.toLowerCase();
    if (key && ICONS[key]) {
      el.innerHTML = ICONS[key];
    }
  });
}

export function initIconAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const icons = document.querySelectorAll('.station-icon-svg');

  icons.forEach((svg) => {
    const paths = svg.querySelectorAll('.draw-path');
    
    paths.forEach((path) => {
      try {
        const length = path.getTotalLength ? path.getTotalLength() : 60;
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = prefersReduced ? '0' : `${length}`;
        path.style.transition = prefersReduced ? 'none' : 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      } catch (e) {
        path.style.strokeDasharray = 'none';
      }
    });

    if (prefersReduced) return;

    // Trigger stroke animation when entering viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          paths.forEach((path) => {
            path.style.strokeDashoffset = '0';
          });
        }
      });
    }, { threshold: 0.2 });

    observer.observe(svg);

    // Replay on card hover or tap
    const card = svg.closest('.station-card, .automate-card');
    if (card) {
      card.addEventListener('mouseenter', () => {
        paths.forEach((path) => {
          path.style.strokeDashoffset = '10';
          setTimeout(() => { path.style.strokeDashoffset = '0'; }, 50);
        });
      });
    }
  });
}
