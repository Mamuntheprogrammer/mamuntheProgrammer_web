/**
 * One-Page Navigation & 3D Z-Axis Scroll-Reveal Engine
 * Transforms stations in 3D perspective space on desktop, syncs the bottom
 * pipeline scrubber dock, and falls back to normal document scrolling in
 * classic mode (mobile, reduced motion, or the VIEW toggle).
 */

export function initSpine() {
  const stations = Array.from(document.querySelectorAll('.spatial-station'));
  const dockButtons = Array.from(document.querySelectorAll('.dock-step-btn'));
  const prevBtn = document.getElementById('dock-prev-btn');
  const nextBtn = document.getElementById('dock-next-btn');
  const depthMeter = document.getElementById('depth-meter-badge');

  if (!stations.length) return;

  const maxIndex = stations.length - 1;
  let targetProgress = 0;
  let currentProgress = 0;
  let classicActiveIndex = 0;
  let rafId = 0;
  let classicObserver = null;

  const isClassicMode = () =>
    document.body.classList.contains('classic-mode') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const syncTargetFromWindowScroll = () => {
    if (isClassicMode()) return;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    targetProgress = ratio * maxIndex;
  };

  const scrollToStationIndex = (index) => {
    const clamped = Math.max(0, Math.min(maxIndex, index));

    if (isClassicMode()) {
      classicActiveIndex = clamped;
      stations[clamped]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      updateDockUI(clamped);
      return;
    }

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const targetY = (clamped / maxIndex) * maxScroll;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  // Expose global navigation helper for SAP Command Bar, Hero CTAs, and 3D gates
  window.navigateToStationById = (elementId) => {
    if (!elementId) return false;

    const directIdx = stations.findIndex((s) => s.id === elementId);
    if (directIdx !== -1) {
      scrollToStationIndex(directIdx);
      return true;
    }

    const innerEl = document.getElementById(elementId);
    if (innerEl) {
      const parentStation = innerEl.closest('.spatial-station');
      if (parentStation) {
        const parentIdx = stations.indexOf(parentStation);
        if (parentIdx !== -1) {
          scrollToStationIndex(parentIdx);
          setTimeout(() => {
            innerEl.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
            innerEl.style.boxShadow = '0 0 0 2px var(--packet-amber)';
            setTimeout(() => {
              innerEl.style.boxShadow = '';
            }, 1800);
          }, isClassicMode() ? 650 : 420);
          return true;
        }
      }
    }
    return false;
  };

  const displayProgress = () => (isClassicMode() ? classicActiveIndex : currentProgress);

  const updateDockUI = (activeIndex) => {
    dockButtons.forEach((btn, idx) => {
      if (idx === activeIndex) {
        btn.classList.add('active');
        btn.setAttribute('aria-current', 'step');
      } else {
        btn.classList.remove('active');
        btn.removeAttribute('aria-current');
      }
    });

    if (depthMeter) {
      const zMeters = (displayProgress() * -35).toFixed(1);
      const nodeStr = String(activeIndex).padStart(2, '0');
      depthMeter.textContent = `Z:${zMeters}m // STAGE ${nodeStr}`;
    }
  };

  const render3DStations = () => {
    if (isClassicMode()) {
      stations.forEach((st) => {
        st.classList.add('is-interactive', 'is-visible');
        st.style.transform = 'none';
        st.style.opacity = '1';
        st.inert = false;
      });
      updateDockUI(classicActiveIndex);
      return;
    }

    // Smooth exponential damping toward scroll target
    const diff = targetProgress - currentProgress;
    if (Math.abs(diff) > 0.0008) {
      currentProgress += diff * 0.14;
      rafId = requestAnimationFrame(render3DStations);
    } else {
      currentProgress = targetProgress;
      rafId = 0;
    }

    // Share progress with the 3D WebGL Pipeline Tunnel
    window.pipelineScrollProgress = currentProgress;

    const activeIdx = Math.round(currentProgress);
    updateDockUI(activeIdx);

    stations.forEach((station, idx) => {
      const delta = idx - currentProgress; // > 0 means ahead in deep Z; < 0 means passed camera
      const absDelta = Math.abs(delta);

      if (absDelta > 1.85) {
        station.classList.remove('is-interactive', 'is-visible');
        station.style.opacity = '0';
        station.style.transform = 'translate3d(0, 0, -1400px)';
        station.inert = true;
        return;
      }

      station.classList.add('is-visible');

      if (absDelta < 0.46) {
        station.classList.add('is-interactive');
        station.inert = false;
      } else {
        station.classList.remove('is-interactive');
        station.inert = true;
      }

      if (delta >= 0) {
        // Upcoming station emerging from deep 3D Z-space
        const z = -delta * 760;
        const y = delta * 28;
        const x = Math.sin(delta * 1.4) * 36;
        const rotX = delta * 6.5;
        const rotY = Math.sin(delta * 1.2) * -4;
        const opacity = delta < 0.2 ? 1 : Math.max(0, 1 - (delta - 0.15) * 1.45);

        station.style.opacity = opacity.toFixed(3);
        station.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
      } else {
        // Passed station flying forward past the camera
        const pass = Math.abs(delta);
        const z = pass * 540;
        const y = -pass * 45;
        const rotX = -pass * 5;
        const opacity = Math.max(0, 1 - pass * 2.15);

        station.style.opacity = opacity.toFixed(3);
        station.style.transform = `translate3d(0px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateX(${rotX.toFixed(2)}deg)`;
      }
    });
  };

  const requestUpdate = () => {
    if (isClassicMode()) return;
    syncTargetFromWindowScroll();
    if (!rafId) {
      rafId = requestAnimationFrame(render3DStations);
    }
  };

  // In classic mode, keep the dock in sync with whichever section is centred.
  const observeClassicStations = () => {
    if (!('IntersectionObserver' in window) || classicObserver) return;

    classicObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (!visible.length) return;
        const idx = stations.indexOf(visible[0].target);
        if (idx !== -1 && idx !== classicActiveIndex) {
          classicActiveIndex = idx;
          updateDockUI(idx);
        }
      },
      { rootMargin: '-38% 0px -56% 0px', threshold: 0 }
    );

    stations.forEach((station) => classicObserver.observe(station));
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });

  // Wire bottom dock buttons
  dockButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      scrollToStationIndex(idx);
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const current = isClassicMode() ? classicActiveIndex : Math.round(currentProgress);
      scrollToStationIndex(current - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const current = isClassicMode() ? classicActiveIndex : Math.round(currentProgress);
      scrollToStationIndex(current + 1);
    });
  }

  // Intercept internal #hash links so they fly smoothly in 3D space
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href && href.length > 1) {
        const targetId = href.slice(1);
        if (window.navigateToStationById(targetId)) {
          e.preventDefault();
        }
      }
    });
  });

  // Keyboard navigation support (ArrowRight / ArrowLeft or PageDown / PageUp)
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

    const current = isClassicMode() ? classicActiveIndex : Math.round(currentProgress);

    if (e.key === 'PageDown' || (e.key === 'ArrowRight' && e.altKey)) {
      e.preventDefault();
      scrollToStationIndex(current + 1);
    } else if (e.key === 'PageUp' || (e.key === 'ArrowLeft' && e.altKey)) {
      e.preventDefault();
      scrollToStationIndex(current - 1);
    }
  });

  // Initial render
  syncTargetFromWindowScroll();
  render3DStations();
  if (isClassicMode()) observeClassicStations();

  // Deep links (#section-...) should open the right station. The project
  // grid loads asynchronously, so recalculate once its height is known.
  const initialHash = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : '';
  if (initialHash) {
    const navigateToInitialHash = () => window.navigateToStationById(initialHash);
    setTimeout(navigateToInitialHash, 150);
    window.addEventListener(
      'projects-loaded',
      () => setTimeout(navigateToInitialHash, 120),
      { once: true }
    );
  }

  // Keep the scrubber in sync when the user edits the URL hash manually.
  window.addEventListener('hashchange', () => {
    const nextHash = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : '';
    if (nextHash) window.navigateToStationById(nextHash);
  });
}
