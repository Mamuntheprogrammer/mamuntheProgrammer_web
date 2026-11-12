/**
 * Accessible modal helpers for the portrait lightbox and the embedded
 * Aristopharma data-analysis dashboard. The analysis dashboard has separate
 * desktop and mobile HTML builds; the matching one is loaded into an iframe so
 * its own layout and scrolling stay isolated from the portfolio page.
 */

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, iframe, [tabindex]:not([tabindex="-1"])';

function getFocusable(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('hidden') && el.offsetParent !== null
  );
}

function trapTabKey(event, container) {
  if (event.key !== 'Tab') return;
  const focusable = getFocusable(container);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function lockBodyScroll() {
  document.body.classList.add('modal-open');
}

function unlockBodyScroll() {
  if (!document.querySelector('.modal-backdrop.active')) {
    document.body.classList.remove('modal-open');
  }
}

function openModal(modal, closeButton) {
  const previousFocus = document.activeElement;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  lockBodyScroll();

  const dialog = modal.querySelector('[role="dialog"], .portrait-modal-window, .analysis-modal-window') || modal;
  modal._trapHandler = (event) => trapTabKey(event, dialog);
  document.addEventListener('keydown', modal._trapHandler);

  if (closeButton) closeButton.focus();

  return previousFocus;
}

function closeModal(modal, previousFocus, focusTarget) {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  if (modal._trapHandler) {
    document.removeEventListener('keydown', modal._trapHandler);
    modal._trapHandler = null;
  }
  unlockBodyScroll();

  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus();
  } else if (focusTarget && typeof focusTarget.focus === 'function') {
    focusTarget.focus();
  }
}

export function initPortraitLightbox() {
  const trigger = document.getElementById('portrait-lightbox-btn');
  const modal = document.getElementById('portrait-modal');
  const closeButton = document.getElementById('portrait-close-btn');
  if (!trigger || !modal || !closeButton) return;

  let previousFocus = null;

  const open = () => {
    previousFocus = openModal(modal, closeButton);
  };

  const close = () => {
    closeModal(modal, previousFocus, trigger);
    previousFocus = null;
  };

  trigger.addEventListener('click', open);
  closeButton.addEventListener('click', close);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('active')) close();
  });
}

export function initAnalysisModal() {
  const modal = document.getElementById('analysis-modal');
  const frame = document.getElementById('analysis-frame');
  const closeButton = document.getElementById('analysis-close-btn');
  const loading = document.getElementById('analysis-loading');
  if (!modal || !frame || !closeButton) return;

  const mobileQuery = window.matchMedia('(max-width: 700px)');
  let previousFocus = null;

  const sourceForViewport = () =>
    mobileQuery.matches ? './assets/EM00013923_mobile.html' : './assets/EM00013923.html';

  const ensureFrameSource = () => {
    const desired = sourceForViewport();
    const layout = mobileQuery.matches ? 'mobile' : 'desktop';

    if (frame.dataset.layout === layout && frame.getAttribute('src') === desired) return;

    frame.dataset.layout = layout;
    if (loading) loading.hidden = false;

    frame.addEventListener(
      'load',
      () => {
        if (loading) loading.hidden = true;
      },
      { once: true }
    );

    frame.setAttribute('src', desired);
  };

  const open = () => {
    ensureFrameSource();
    previousFocus = openModal(modal, closeButton);
  };

  const close = () => {
    closeModal(modal, previousFocus, null);
    previousFocus = null;
  };

  document.querySelectorAll('[data-open-analysis]').forEach((button) => {
    button.addEventListener('click', open);
  });
  window.addEventListener('analysis:open', open);

  closeButton.addEventListener('click', close);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('active')) close();
  });

  // If the viewport crosses the mobile/desktop breakpoint while the dashboard
  // is open, swap to the matching analysis build without closing the modal.
  const handleViewportChange = () => {
    if (modal.classList.contains('active')) ensureFrameSource();
  };
  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', handleViewportChange);
  }
}
