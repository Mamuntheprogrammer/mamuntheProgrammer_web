/**
 * First-load Plotter Handwriting Intro Animation
 * Plots "Md Abdullah Al Mamun" stroke-by-stroke with SVG pathLength="1".
 * Honors sessionStorage & prefers-reduced-motion.
 */

export function initIntro(onComplete) {
  const introOverlay = document.getElementById('intro-overlay');
  if (!introOverlay) {
    if (onComplete) onComplete();
    return;
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alreadyShown = sessionStorage.getItem('mamun_intro_shown') === 'true';

  if (prefersReduced || alreadyShown) {
    introOverlay.classList.add('hidden');
    introOverlay.style.display = 'none';
    if (onComplete) onComplete();
    return;
  }

  const skipBtn = document.getElementById('intro-skip-btn');
  let finished = false;

  const finishIntro = () => {
    if (finished) return;
    finished = true;
    sessionStorage.setItem('mamun_intro_shown', 'true');
    introOverlay.classList.add('hidden');
    setTimeout(() => {
      introOverlay.style.display = 'none';
      if (onComplete) onComplete();
      window.dispatchEvent(new CustomEvent('intro-finished'));
    }, 500);
  };

  if (skipBtn) {
    skipBtn.addEventListener('click', finishIntro);
  }

  // Trigger stroke-by-stroke plotter animation
  const paths = introOverlay.querySelectorAll('.plotter-path');
  paths.forEach((path, idx) => {
    path.setAttribute('pathLength', '1');
    path.style.strokeDasharray = '1';
    path.style.strokeDashoffset = '1';
    path.style.transition = `stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.14}s`;
  });

  // Start animation on next frame
  requestAnimationFrame(() => {
    paths.forEach((path) => {
      path.style.strokeDashoffset = '0';
    });
  });

  // Fade in the soft letter fill after strokes finish
  const fillGroups = introOverlay.querySelectorAll('.plotter-fill');
  fillGroups.forEach((el) => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.6s ease 2.2s';
  });

  setTimeout(() => {
    fillGroups.forEach((el) => {
      el.style.opacity = '1';
    });
  }, 100);

  // Auto finish after 3.2 seconds
  setTimeout(finishIntro, 3400);
}
