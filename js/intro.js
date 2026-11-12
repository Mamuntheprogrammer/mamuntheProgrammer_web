/**
 * Home-page Plotter Handwriting Intro Animation
 * Plots "Md Abdullah Al Mamun" stroke-by-stroke with SVG pathLength="1".
 * Plays on every page load unless the visitor skips it or prefers reduced motion.
 */

export function initIntro(onComplete) {
  const introOverlay = document.getElementById('intro-overlay');
  if (!introOverlay) {
    if (onComplete) onComplete();
    return;
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    introOverlay.classList.add('hidden');
    introOverlay.style.display = 'none';
    introOverlay.setAttribute('aria-hidden', 'true');
    if (onComplete) onComplete();
    return;
  }

  const skipBtn = document.getElementById('intro-skip-btn');
  let finished = false;

  const finishIntro = () => {
    if (finished) return;
    finished = true;
    introOverlay.classList.add('hidden');
    introOverlay.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      introOverlay.style.display = 'none';
      if (onComplete) onComplete();
      window.dispatchEvent(new CustomEvent('intro-finished'));
    }, 500);
  };

  if (skipBtn) {
    skipBtn.addEventListener('click', finishIntro);
  }

  // Hide every stroke first, then drive the drawing with the Web Animations API.
  // A double rAF guarantees the hidden state is painted before drawing starts.
  const paths = introOverlay.querySelectorAll('.plotter-path');
  paths.forEach((path) => {
    path.setAttribute('pathLength', '1');
    path.style.strokeDasharray = '1';
    path.style.strokeDashoffset = '1';
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (finished) return;
      paths.forEach((path, idx) => {
        path.animate(
          [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
          {
            duration: 800,
            delay: idx * 110,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards',
          }
        );
      });
    });
  });

  // Auto finish after the last stroke has drawn, or earlier when skipped.
  setTimeout(finishIntro, 3600);
}
