(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // js/intro.js
  function initIntro(onComplete) {
    const introOverlay = document.getElementById("intro-overlay");
    if (!introOverlay) {
      if (onComplete) onComplete();
      return;
    }
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      introOverlay.classList.add("hidden");
      introOverlay.style.display = "none";
      introOverlay.setAttribute("aria-hidden", "true");
      if (onComplete) onComplete();
      return;
    }
    const skipBtn = document.getElementById("intro-skip-btn");
    let finished = false;
    const finishIntro = () => {
      if (finished) return;
      finished = true;
      introOverlay.classList.add("hidden");
      introOverlay.setAttribute("aria-hidden", "true");
      setTimeout(() => {
        introOverlay.style.display = "none";
        if (onComplete) onComplete();
        window.dispatchEvent(new CustomEvent("intro-finished"));
      }, 500);
    };
    if (skipBtn) {
      skipBtn.addEventListener("click", finishIntro);
    }
    const paths = introOverlay.querySelectorAll(".plotter-path");
    paths.forEach((path) => {
      path.setAttribute("pathLength", "1");
      path.style.strokeDasharray = "1";
      path.style.strokeDashoffset = "1";
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
              easing: "cubic-bezier(0.4, 0, 0.2, 1)",
              fill: "forwards"
            }
          );
        });
      });
    });
    setTimeout(finishIntro, 3600);
  }

  // js/spine.js
  function initSpine() {
    const stations = Array.from(document.querySelectorAll(".spatial-station"));
    const dockButtons = Array.from(document.querySelectorAll(".dock-step-btn"));
    const prevBtn = document.getElementById("dock-prev-btn");
    const nextBtn = document.getElementById("dock-next-btn");
    const depthMeter = document.getElementById("depth-meter-badge");
    if (!stations.length) return;
    const maxIndex = stations.length - 1;
    let targetProgress = 0;
    let currentProgress = 0;
    let classicActiveIndex = 0;
    let rafId = 0;
    let classicObserver = null;
    const isClassicMode = () => document.body.classList.contains("classic-mode") || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
        stations[clamped]?.scrollIntoView({ behavior: "smooth", block: "start" });
        updateDockUI(clamped);
        return;
      }
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const targetY = clamped / maxIndex * maxScroll;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    };
    window.navigateToStationById = (elementId) => {
      if (!elementId) return false;
      const directIdx = stations.findIndex((s) => s.id === elementId);
      if (directIdx !== -1) {
        scrollToStationIndex(directIdx);
        return true;
      }
      const innerEl = document.getElementById(elementId);
      if (innerEl) {
        const parentStation = innerEl.closest(".spatial-station");
        if (parentStation) {
          const parentIdx = stations.indexOf(parentStation);
          if (parentIdx !== -1) {
            scrollToStationIndex(parentIdx);
            setTimeout(() => {
              innerEl.style.transition = "box-shadow 0.4s ease, border-color 0.4s ease";
              innerEl.style.boxShadow = "0 0 0 2px var(--packet-amber)";
              setTimeout(() => {
                innerEl.style.boxShadow = "";
              }, 1800);
            }, isClassicMode() ? 650 : 420);
            return true;
          }
        }
      }
      return false;
    };
    const displayProgress = () => isClassicMode() ? classicActiveIndex : currentProgress;
    const updateDockUI = (activeIndex) => {
      dockButtons.forEach((btn, idx) => {
        if (idx === activeIndex) {
          btn.classList.add("active");
          btn.setAttribute("aria-current", "step");
        } else {
          btn.classList.remove("active");
          btn.removeAttribute("aria-current");
        }
      });
      if (depthMeter) {
        const zMeters = (displayProgress() * -35).toFixed(1);
        const nodeStr = String(activeIndex).padStart(2, "0");
        depthMeter.textContent = `Z:${zMeters}m // STAGE ${nodeStr}`;
      }
    };
    const render3DStations = () => {
      if (isClassicMode()) {
        stations.forEach((st) => {
          st.classList.add("is-interactive", "is-visible");
          st.style.transform = "none";
          st.style.opacity = "1";
          st.inert = false;
        });
        updateDockUI(classicActiveIndex);
        return;
      }
      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) > 8e-4) {
        currentProgress += diff * 0.14;
        rafId = requestAnimationFrame(render3DStations);
      } else {
        currentProgress = targetProgress;
        rafId = 0;
      }
      window.pipelineScrollProgress = currentProgress;
      const activeIdx = Math.round(currentProgress);
      updateDockUI(activeIdx);
      stations.forEach((station, idx) => {
        const delta = idx - currentProgress;
        const absDelta = Math.abs(delta);
        if (absDelta > 1.85) {
          station.classList.remove("is-interactive", "is-visible");
          station.style.opacity = "0";
          station.style.transform = "translate3d(0, 0, -1400px)";
          station.inert = true;
          return;
        }
        station.classList.add("is-visible");
        if (absDelta < 0.46) {
          station.classList.add("is-interactive");
          station.inert = false;
        } else {
          station.classList.remove("is-interactive");
          station.inert = true;
        }
        if (delta >= 0) {
          const z = -delta * 760;
          const y = delta * 28;
          const x = Math.sin(delta * 1.4) * 36;
          const rotX = delta * 6.5;
          const rotY = Math.sin(delta * 1.2) * -4;
          const opacity = delta < 0.2 ? 1 : Math.max(0, 1 - (delta - 0.15) * 1.45);
          station.style.opacity = opacity.toFixed(3);
          station.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
        } else {
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
    const observeClassicStations = () => {
      if (!("IntersectionObserver" in window) || classicObserver) return;
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
        { rootMargin: "-38% 0px -56% 0px", threshold: 0 }
      );
      stations.forEach((station) => classicObserver.observe(station));
    };
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    dockButtons.forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        scrollToStationIndex(idx);
      });
    });
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const current = isClassicMode() ? classicActiveIndex : Math.round(currentProgress);
        scrollToStationIndex(current - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const current = isClassicMode() ? classicActiveIndex : Math.round(currentProgress);
        scrollToStationIndex(current + 1);
      });
    }
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (href && href.length > 1) {
          const targetId = href.slice(1);
          if (window.navigateToStationById(targetId)) {
            e.preventDefault();
          }
        }
      });
    });
    window.addEventListener("keydown", (e) => {
      const tag = document.activeElement?.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      const current = isClassicMode() ? classicActiveIndex : Math.round(currentProgress);
      if (e.key === "PageDown" || e.key === "ArrowRight" && e.altKey) {
        e.preventDefault();
        scrollToStationIndex(current + 1);
      } else if (e.key === "PageUp" || e.key === "ArrowLeft" && e.altKey) {
        e.preventDefault();
        scrollToStationIndex(current - 1);
      }
    });
    syncTargetFromWindowScroll();
    render3DStations();
    if (isClassicMode()) observeClassicStations();
    const initialHash = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : "";
    if (initialHash) {
      const navigateToInitialHash = () => window.navigateToStationById(initialHash);
      setTimeout(navigateToInitialHash, 150);
      window.addEventListener(
        "projects-loaded",
        () => setTimeout(navigateToInitialHash, 120),
        { once: true }
      );
    }
    window.addEventListener("hashchange", () => {
      const nextHash = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : "";
      if (nextHash) window.navigateToStationById(nextHash);
    });
  }

  // js/icons.js
  var ICONS = {
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
  `
  };
  function injectIcons() {
    const iconHolders = document.querySelectorAll("[data-icon]");
    iconHolders.forEach((el) => {
      const key = el.dataset.icon?.toLowerCase();
      if (key && ICONS[key]) {
        el.innerHTML = ICONS[key];
      }
    });
  }
  function initIconAnimations() {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const icons = document.querySelectorAll(".station-icon-svg");
    icons.forEach((svg) => {
      const paths = svg.querySelectorAll(".draw-path");
      paths.forEach((path) => {
        try {
          const length = path.getTotalLength ? path.getTotalLength() : 60;
          path.style.strokeDasharray = `${length}`;
          path.style.strokeDashoffset = prefersReduced ? "0" : `${length}`;
          path.style.transition = prefersReduced ? "none" : "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
        } catch (e) {
          path.style.strokeDasharray = "none";
        }
      });
      if (prefersReduced) return;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            paths.forEach((path) => {
              path.style.strokeDashoffset = "0";
            });
          }
        });
      }, { threshold: 0.2 });
      observer.observe(svg);
      const card = svg.closest(".station-card, .automate-card");
      if (card) {
        card.addEventListener("mouseenter", () => {
          paths.forEach((path) => {
            path.style.strokeDashoffset = "10";
            setTimeout(() => {
              path.style.strokeDashoffset = "0";
            }, 50);
          });
        });
      }
    });
  }

  // js/utils/github-filter.js
  var KNOWN_DESCRIPTIONS = {
    Excel_Merger_Desktop_Application: {
      desc: "Python GUI application built with Tkinter that automatically merges multiple Excel files into a consolidated workbook.",
      tags: ["Automation", "Python", "Tkinter"]
    },
    "Excel_Merger_Desktop_Application-": {
      desc: "Python GUI application built with Tkinter that automatically merges multiple Excel files into a consolidated workbook.",
      tags: ["Automation", "Python", "Tkinter"]
    },
    Excel_to_sql: {
      desc: "Desktop GUI tool (Excel2SQL) to ingest messy spreadsheets, parse schemas, and query workbook data directly with relational SQL.",
      tags: ["SQL", "Python", "Data Pipeline"]
    },
    PantryShop_Desktop_Version: {
      desc: "Desktop CRM and inventory management application architected with modular MVC controllers, models, and views for shop management.",
      tags: ["Python", "MVC", "CRM"]
    },
    docktube: {
      desc: "Lightweight, user-friendly YouTube media downloader built with Python and yt-dlp to download single videos and playlists.",
      tags: ["Python", "yt-dlp", "Automation"]
    },
    apl_contact: {
      desc: "Mobile contact and directory management application developed in Dart with Flutter, featuring clean UI and state management.",
      tags: ["Flutter", "Dart", "Mobile"]
    },
    "Spring_Boot-Ordering_system-": {
      desc: "Digital ordering and transaction management system built with Spring Boot, REST APIs, and modern front-end integration.",
      tags: ["Backend", "Orders", "REST API"]
    },
    "Django-RestApi-CRUD": {
      desc: "RESTful CRUD API service built with Django REST Framework for structured backend data persistence.",
      tags: ["Django", "REST API", "Python"]
    },
    "DRF-JWT": {
      desc: "Stateless JWT authentication and token verification pipeline for Django REST Framework services.",
      tags: ["Django", "JWT", "Auth"]
    },
    "Excel-add-ins": {
      desc: "Custom VBA macros and spreadsheet automation add-ins for streamlined enterprise reporting.",
      tags: ["Excel", "VBA", "Automation"]
    },
    Food_Pantry_CRM: {
      desc: "Customer and inventory management system tailored for pantry operations and order tracking.",
      tags: ["Python", "CRM", "Database"]
    },
    GDriveLinker: {
      desc: "Python utility that converts and manages direct download links and asset sharing for Google Drive workflows.",
      tags: ["Python", "Automation", "Cloud"]
    },
    num2bangla: {
      desc: "Python utility library for converting numerical figures into formatted Bengali text and numerals.",
      tags: ["Python", "NLP", "Localization"]
    },
    NVR_Manager: {
      desc: "TypeScript management interface for monitoring network video recorders and device streams.",
      tags: ["TypeScript", "Web", "Systems"]
    },
    pygems: {
      desc: "Full-stack web hub for Python utilities, technical tutorials, and developer tooling.",
      tags: ["JavaScript", "Web", "Python"]
    },
    "PyGems-Office-Utilities": {
      desc: "Suite of Python desktop and office automation utilities to eliminate repetitive document tasks.",
      tags: ["Python", "Automation", "Office"]
    },
    "PyGemsBlog-V2": {
      desc: "Content publishing platform and technical blog engine engineered with Python.",
      tags: ["Python", "Web", "CMS"]
    },
    RuhiPdfEditor: {
      desc: "Python desktop utility for splitting, merging, and manipulating PDF documents.",
      tags: ["Python", "PDF", "Automation"]
    },
    salarySync: {
      desc: "Automated payroll calculation and salary sheet synchronization tool built in Python.",
      tags: ["Python", "Data", "Automation"]
    },
    Route_9: {
      desc: "Cross-platform mobile application built with Dart and Flutter.",
      tags: ["Flutter", "Dart", "Mobile"]
    },
    zia_invento: {
      desc: "TypeScript inventory and stock tracking web application for real-time warehouse visibility.",
      tags: ["TypeScript", "Inventory", "Web"]
    }
  };
  var FEATURED_NAMES = /* @__PURE__ */ new Set([
    "excel_to_sql",
    "excel_merger_desktop_application-",
    "excel_merger_desktop_application",
    "pantryshop_desktop_version",
    "docktube",
    "apl_contact",
    "spring_boot-ordering_system-"
  ]);
  function filterAndFormatRepos(repos) {
    if (!Array.isArray(repos)) return [];
    return repos.filter((repo) => {
      if (repo.fork) return false;
      if (repo.size === 0 && !FEATURED_NAMES.has(repo.name.toLowerCase())) return false;
      const lowerName = repo.name.toLowerCase();
      if (lowerName === "mamuntheprogrammer" || lowerName === "aistudio" || lowerName === "foraistudio") return false;
      return true;
    }).map((repo) => {
      const lower = repo.name.toLowerCase();
      const isFeatured = FEATURED_NAMES.has(lower);
      const known = KNOWN_DESCRIPTIONS[repo.name] || KNOWN_DESCRIPTIONS[repo.name.replace(/-$/, "")];
      const cleanName = repo.name.replace(/[-_]+/g, " ").trim();
      const fallbackDesc = `${cleanName} \u2014 ${repo.language || "Software"} implementation and workflow utility by Mamuntheprogrammer.`;
      const desc = repo.description && repo.description.trim().length > 0 && repo.description !== "for test" ? repo.description : known ? known.desc : fallbackDesc;
      const tags = known ? known.tags : [repo.language || "Code", "Open Source"].filter(Boolean);
      return {
        name: repo.name,
        description: desc,
        language: repo.language || "Polyglot",
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count || 0,
        featured: isFeatured,
        tags
      };
    }).sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return a.name.localeCompare(b.name);
    });
  }

  // js/utils/storage.js
  function storageGet(storage, key) {
    try {
      return storage.getItem(key);
    } catch (error) {
      return null;
    }
  }
  function storageSet(storage, key, value) {
    try {
      storage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }
  function sessionGet(key) {
    return storageGet(window.sessionStorage, key);
  }
  function sessionSet(key, value) {
    return storageSet(window.sessionStorage, key, value);
  }
  function localGet(key) {
    return storageGet(window.localStorage, key);
  }
  function localSet(key, value) {
    return storageSet(window.localStorage, key, value);
  }

  // js/projects.js
  var CACHE_KEY = "mamun_github_repos_cache_v2";
  var CACHE_TIME_KEY = "mamun_github_repos_time_v2";
  var CACHE_TTL_MS = 60 * 60 * 1e3;
  var GITHUB_PROFILE = "https://github.com/Mamuntheprogrammer";
  async function loadProjects() {
    const container = document.getElementById("projects-grid-container");
    const countBadge = document.getElementById("projects-count-badge");
    if (!container) return;
    container.innerHTML = `
    <div class="project-loading-state" style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.85rem;">
      <span style="color: var(--line-mint)">SELECT * FROM public_repositories...</span> Fetching latest GitHub records...
    </div>
  `;
    let repos = [];
    const cachedData = sessionGet(CACHE_KEY);
    const cachedTime = sessionGet(CACHE_TIME_KEY);
    const isFresh = cachedTime && Date.now() - parseInt(cachedTime, 10) < CACHE_TTL_MS;
    if (cachedData && isFresh) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed)) repos = parsed;
      } catch (error) {
      }
    }
    if (!repos.length) {
      try {
        const response = await fetch("https://api.github.com/users/Mamuntheprogrammer/repos?per_page=100&sort=updated", {
          headers: { Accept: "application/vnd.github.v3+json" }
        });
        if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`);
        const raw = await response.json();
        repos = filterAndFormatRepos(raw);
        if (!repos.length) throw new Error("GitHub API returned no usable repositories");
        sessionSet(CACHE_KEY, JSON.stringify(repos));
        sessionSet(CACHE_TIME_KEY, Date.now().toString());
      } catch (err) {
        console.warn("GitHub API unavailable or rate-limited; falling back to ./data/projects.json", err);
        try {
          const fallbackRes = await fetch("./data/projects.json", { cache: "no-cache" });
          if (!fallbackRes.ok) throw new Error(`Fallback HTTP ${fallbackRes.status}`);
          const fallbackData = await fallbackRes.json();
          if (Array.isArray(fallbackData)) repos = fallbackData;
        } catch (fallbackErr) {
          console.error("Failed to load fallback projects data", fallbackErr);
        }
      }
    }
    if (!repos.length) {
      if (countBadge) countBadge.textContent = "OFFLINE";
      container.innerHTML = `
      <div class="project-loading-state" style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.85rem;">
        Repository records could not be loaded right now.<br />
        <a href="${GITHUB_PROFILE}?tab=repositories" target="_blank" rel="noopener noreferrer">Browse the full list on GitHub \u2197</a>
      </div>
    `;
      return;
    }
    renderRepoCards(container, repos);
    initFilterButtons(container, repos);
    window.dispatchEvent(new CustomEvent("projects-loaded", { detail: { count: repos.length } }));
  }
  function renderRepoCards(container, repos, filterCategory = "all") {
    const filtered = repos.filter((repo) => {
      if (filterCategory === "all") return true;
      if (filterCategory === "featured") return repo.featured;
      if (filterCategory === "python") return (repo.language || "").toLowerCase().includes("python");
      if (filterCategory === "automation") {
        return (repo.tags || []).some((t) => t.toLowerCase().includes("auto")) || repo.name.toLowerCase().includes("merger") || repo.name.toLowerCase().includes("sql");
      }
      if (filterCategory === "mobile") {
        return (repo.language || "").toLowerCase().includes("dart") || (repo.tags || []).some((t) => t.toLowerCase().includes("flutter") || t.toLowerCase().includes("mobile"));
      }
      return true;
    });
    const countBadge = document.getElementById("projects-count-badge");
    if (countBadge) {
      countBadge.textContent = filterCategory === "all" ? `${filtered.length} records` : `${filtered.length} / ${repos.length} records`;
    }
    if (!filtered.length) {
      container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted); font-family: var(--font-mono);">
        No matching records found for query [${escapeHtml(filterCategory)}].
      </div>
    `;
      return;
    }
    container.innerHTML = filtered.map((repo, idx) => {
      const recordNumber = String(idx + 1).padStart(3, "0");
      const language = repo.language || "Polyglot";
      const languageKey = language.toLowerCase();
      const tags = Array.from(
        new Set((repo.tags || []).filter((tag) => tag && tag.toLowerCase() !== languageKey))
      );
      const repoName = escapeHtml(repo.name);
      const description = escapeHtml(repo.description || "Open-source repository by Mamuntheprogrammer.");
      const safeUrl = /^https:\/\/github\.com\//i.test(repo.html_url || "") ? repo.html_url : `${GITHUB_PROFILE}?tab=repositories`;
      const stars = Number(repo.stargazers_count) || 0;
      const starIcon = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--packet-amber);" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      `;
      return `
        <article class="project-card ${repo.featured ? "project-featured" : ""}" data-repo-name="${repoName}">
          <div class="project-card-top">
            <div class="project-record-id">
              <span>RECORD_ID #${recordNumber}</span>
              ${repo.featured ? '<span class="technical-tag technical-tag-amber" style="font-size: 0.65rem;">\u2605 FEATURED</span>' : ""}
            </div>
            <h3 class="project-name">${repoName}</h3>
            <p class="project-desc">${description}</p>
            <div class="project-tags">
              <span class="project-tag" style="color: var(--line-mint);">${escapeHtml(language)}</span>
              ${tags.map((t) => `<span class="project-tag">${escapeHtml(t)}</span>`).join("")}
            </div>
          </div>
          <div class="project-card-footer">
            <div class="project-stat-group">
              <span style="display: inline-flex; align-items: center; gap: 0.25rem;" aria-label="${stars} GitHub stars">
                ${starIcon} ${stars}
              </span>
            </div>
            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="project-link-action" aria-label="View repository ${repoName} on GitHub">
              <span>SOURCE</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </article>
      `;
    }).join("");
  }
  function initFilterButtons(container, repos) {
    const filterBar = document.querySelector(".projects-filter-bar");
    if (!filterBar || filterBar.dataset.bound === "true") return;
    filterBar.dataset.bound = "true";
    const filterBtns = Array.from(filterBar.querySelectorAll(".filter-btn"));
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderRepoCards(container, repos, btn.dataset.filter || "all");
      });
    });
  }
  function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // js/utils/command-parser.js
  function parseCommand(raw) {
    const cmd = (raw || "").trim().toLowerCase();
    if (!cmd) {
      return {
        type: "unknown",
        message: 'Enter a valid transaction code or type "help".'
      };
    }
    if (cmd === "help") {
      return {
        type: "help",
        message: 'Available commands: /nSE38 (ABAP), /nVA01 (SD), /nME21N (MM), /nSE16 (Toolbelt), /nHOME (Hero), /nPORBO (porbobd.com), /nPROJ (Projects), /nYT (YouTube), /nCONTACT (Contact), "import this" (Zen of Python).'
      };
    }
    if (cmd === "import this") {
      return {
        type: "zen",
        message: "The Zen of Python, by Tim Peters"
      };
    }
    if (cmd === "clear") {
      return {
        type: "clear",
        message: "Cleared command console."
      };
    }
    const tcodes = {
      "/nse38": { targetId: "station-sap-abap", label: "SE38: ABAP Program Development" },
      "/nva01": { targetId: "station-sap-sd", label: "VA01: Create Sales Order (SD)" },
      "/nme21n": { targetId: "station-sap-mm", label: "ME21N: Create Purchase Order (MM)" },
      "/nse16": { targetId: "section-02-transform", label: "SE16: Data Browser / Toolbelt" },
      "/nhome": { targetId: "section-00-source", label: "SOURCE: Hero" },
      "/nporbo": { targetId: "porbobd-spotlight", label: "PORBO: porbobd.com Venture" },
      "/nproj": { targetId: "section-03-load", label: "LOAD: Repository Records" },
      "/nyt": { targetId: "section-06-report", label: "YT: YouTube Channel" },
      "/ncontact": { targetId: "section-06-report", label: "REPORT: Communication Endpoint" }
    };
    if (tcodes[cmd]) {
      return {
        type: "navigate",
        targetId: tcodes[cmd].targetId,
        label: tcodes[cmd].label,
        message: `Navigating to ${tcodes[cmd].label}...`
      };
    }
    return {
      type: "unknown",
      message: `Unknown command "${raw}". Type "help" for a list of SAP transaction codes.`
    };
  }

  // js/command.js
  var ZEN_OF_PYTHON = `The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
Complex is better than complicated.
Flat is better than nested.
Sparse is better than dense.
Readability counts.
Special cases aren't special enough to break the rules.
Although practicality beats purity.
Errors should never pass silently.
Unless explicitly silenced.
In the face of ambiguity, refuse the temptation to guess.
There should be one-- and preferably only one --obvious way to do it.
Although that way may not be obvious at first unless you're Dutch.
Now is better than never.
Although never is often better than *right* now.
If the implementation is hard to explain, it's a bad idea.
If the implementation is easy to explain, it may be a good idea.
Namespaces are one honking great idea -- let's do more of those!`;
  function initCommandBar() {
    const input = document.getElementById("sap-command-input");
    const feedback = document.getElementById("command-feedback");
    const zenModal = document.getElementById("zen-modal");
    const zenCloseBtn = document.getElementById("zen-close-btn");
    console.log(
      '%c[THE PIPELINE 3D]%c Md Abdullah Al Mamun (Mamuntheprogrammer)\n%c"I move data from messy to meaningful."\nDhaka, Bangladesh | GitHub: https://github.com/Mamuntheprogrammer | YouTube: https://www.youtube.com/@MamunTheProgrammer\nTip: Press "/" to focus the SAP OK-CODE bar!',
      "color: #5eead4; font-weight: bold; font-size: 14px;",
      "color: #fbbf24; font-weight: bold; font-size: 13px;",
      "color: #8b98a5; font-style: italic; font-size: 12px;"
    );
    const showFeedback = (msg, isError = false) => {
      if (!feedback) return;
      feedback.textContent = msg;
      feedback.style.borderColor = isError ? "var(--accent-red)" : "var(--line-mint)";
      feedback.style.color = isError ? "var(--accent-red)" : "var(--line-mint)";
      feedback.classList.add("visible");
      setTimeout(() => {
        feedback.classList.remove("visible");
      }, 3800);
    };
    const execute = (rawText) => {
      const result = parseCommand(rawText);
      if (result.type === "navigate" && result.targetId) {
        showFeedback(result.message);
        if (typeof window.navigateToStationById === "function") {
          window.navigateToStationById(result.targetId);
        } else {
          const targetEl = document.getElementById(result.targetId);
          if (targetEl) targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else if (result.type === "zen") {
        if (zenModal) {
          zenModal.classList.add("active");
          zenModal.setAttribute("aria-hidden", "false");
          zenCloseBtn?.focus();
        }
        showFeedback('Executing "import this"... Displaying Zen of Python.');
      } else if (result.type === "help") {
        showFeedback(result.message);
      } else if (result.type === "clear") {
        if (input) input.value = "";
        showFeedback("Console cleared.");
      } else {
        showFeedback(result.message, true);
      }
    };
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          execute(input.value);
        }
        if (e.key === "Escape") {
          input.blur();
        }
      });
    }
    window.addEventListener("keydown", (e) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isTyping = activeTag === "input" || activeTag === "textarea";
      const inputIsVisible = input && input.offsetParent !== null;
      if (e.key === "/" && !isTyping && inputIsVisible) {
        e.preventDefault();
        input.focus();
        input.select();
      }
      if (e.key === "Escape" && zenModal?.classList.contains("active")) {
        zenModal.classList.remove("active");
        zenModal.setAttribute("aria-hidden", "true");
        if (inputIsVisible) input.focus();
      }
    });
    if (zenCloseBtn && zenModal) {
      zenCloseBtn.addEventListener("click", () => {
        zenModal.classList.remove("active");
        zenModal.setAttribute("aria-hidden", "true");
      });
      zenModal.addEventListener("click", (e) => {
        if (e.target === zenModal) {
          zenModal.classList.remove("active");
          zenModal.setAttribute("aria-hidden", "true");
        }
      });
    }
    const zenBody = document.getElementById("zen-modal-body");
    if (zenBody) {
      zenBody.textContent = ZEN_OF_PYTHON;
    }
  }

  // js/utils/viewport.js
  var COMPACT_VIEWPORT_QUERY = "(max-width: 900px), ((pointer: coarse) and (hover: none))";
  function isCompactViewport() {
    return window.matchMedia(COMPACT_VIEWPORT_QUERY).matches;
  }

  // js/scene3d.js
  function init3DScene() {
    const container = document.getElementById("tunnel-canvas-container");
    const fallback2D = document.getElementById("tunnel-2d-fallback");
    const toggleBtn = document.getElementById("toggle-3d-btn");
    initInteractiveRefineryConsole();
    if (!container || !fallback2D) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compactViewport = isCompactViewport();
    const fileProtocol = window.location.protocol === "file:";
    document.body.classList.toggle("compact-mode", compactViewport);
    const forceClassic = compactViewport || prefersReduced || fileProtocol;
    const savedPref = sessionGet("mamun_3d_enabled");
    const isEnabled = !forceClassic && (savedPref === null ? true : savedPref === "true");
    if (!isEnabled) {
      document.body.classList.add("classic-mode");
    } else {
      document.body.classList.remove("classic-mode");
    }
    if (forceClassic) {
      document.body.classList.add("classic-mode");
      if (toggleBtn) toggleBtn.hidden = true;
    }
    updateToggleButton(toggleBtn, isEnabled);
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        if (isCompactViewport() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const currentlyClassic = document.body.classList.contains("classic-mode");
        const next3D = currentlyClassic;
        sessionSet("mamun_3d_enabled", String(next3D));
        window.location.reload();
      });
    }
    const compactQuery = window.matchMedia(COMPACT_VIEWPORT_QUERY);
    const handleViewportChange = () => window.location.reload();
    if (typeof compactQuery.addEventListener === "function") {
      compactQuery.addEventListener("change", handleViewportChange);
    }
    if (!isEnabled) {
      return;
    }
    const startThree = () => {
      mountPipelineTunnel3D(container, fallback2D);
    };
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(startThree);
    } else {
      setTimeout(startThree, 180);
    }
  }
  function updateToggleButton(btn, enabled) {
    if (!btn) return;
    btn.textContent = enabled ? "VIEW: 3D REVEAL" : "VIEW: CLASSIC";
    btn.setAttribute("aria-pressed", String(enabled));
  }
  function initInteractiveRefineryConsole() {
    const injectBtn = document.getElementById("refinery-inject-btn");
    const statusEl = document.getElementById("refinery-telemetry-status");
    const svgStage = document.getElementById("refinery-svg-stream");
    const domainBtns = Array.from(document.querySelectorAll("[data-refinery-domain]"));
    const panelEl = document.getElementById("refinery-domain-panel");
    const titleEl = document.getElementById("refinery-domain-title");
    const tagEl = document.getElementById("refinery-domain-tag");
    const descEl = document.getElementById("refinery-domain-desc");
    const pointsEl = document.getElementById("refinery-domain-points");
    const analysisBtn = document.getElementById("refinery-analysis-btn");
    const heroBio = document.getElementById("hero-bio");
    const labelIn = document.getElementById("refinery-svg-label-in");
    const labelGate = document.getElementById("refinery-svg-label-gate");
    const labelOut = document.getElementById("refinery-svg-label-out");
    const DOMAIN_VIEWS = {
      python: {
        tabId: "refinery-tab-python",
        title: "Python // Systems Engine",
        tag: "CORE LANGUAGE",
        bio: "Python-first engineer turning messy files, folders, and APIs into dependable systems \u2014 ETL pipelines, Pandas analysis, Django/Flask backends, and Tkinter desktop tools.",
        description: "I design Python systems that remove repetitive manual work and keep data moving cleanly from source to output.",
        points: [
          "ETL & file-processing pipelines",
          "Django & Flask backends",
          "Pandas & NumPy analysis",
          "Tkinter desktop utilities"
        ],
        in: "RAW_EXCEL_BATCH (42 sheets)",
        out: "CLEAN_SCHEMA: 100% MERGED",
        labels: ["01. RAW FILES", "02. PYTHON ENGINE", "03. CLEAN DATA"],
        analysis: false
      },
      sap: {
        tabId: "refinery-tab-sap",
        title: "SAP // ABAP \xD7 SD \xD7 MM",
        tag: "TECHNO-FUNCTIONAL",
        bio: "Techno-functional SAP engineer bridging ABAP development with SD/MM business processes \u2014 custom reports, BAPIs, enhancements, O2C, P2P, and clean technical specs.",
        description: "I translate business rules into reliable SAP technical solutions, then validate them against live SD and MM process flows.",
        points: [
          "ABAP reports, ALV & BAPIs",
          "SD: O2C, pricing & billing",
          "MM: P2P & inventory management",
          "Functional-to-technical specifications"
        ],
        in: "IDOC_ORDERS05 // RAW_FLATFILE",
        out: "SAP SD/MM POSTED (0 ERRORS)",
        labels: ["01. FLAT FILES", "02. ABAP BAPI", "03. SAP POSTED"],
        analysis: false
      },
      data: {
        tabId: "refinery-tab-data",
        title: "Data // Messy \u2192 Meaningful",
        tag: "ANALYTICS",
        bio: "Data analyst turning raw operational workbooks into clean relational models, reconciled KPIs, and decision-ready dashboards \u2014 using SQL, MySQL, MongoDB, and Excel2SQL.",
        description: "I clean the source, model the relationships, and surface the few numbers that actually drive a decision.",
        points: [
          "Excel2SQL schema inference",
          "SQL / MySQL / MongoDB querying",
          "KPI reporting & reconciliation",
          "Latest: Aristopharma target vs achievement"
        ],
        in: "UNSTRUCTURED_CSV_LOGS",
        out: "MYSQL_RELATIONAL_TABLE",
        labels: ["01. MESSY SHEETS", "02. SQL REFINERY", "03. LIVE DASHBOARD"],
        analysis: true
      },
      ai: {
        tabId: "refinery-tab-ai",
        title: "AI // Agentic Workflows",
        tag: "INTELLIGENCE",
        bio: "Agentic-AI builder designing PLAN \u2192 ACT \u2192 OBSERVE workflows that parse inputs, verify outputs, and keep a human in the loop \u2014 with strict review and testing.",
        description: "I use AI for velocity, not blind trust: every generated step is checked, tested, and reviewed before it ships.",
        points: [
          "Plan \u2192 Act \u2192 Observe agent loops",
          "ML classification & prediction",
          "Verified, human-reviewed output",
          "Vibe coding backed by tests"
        ],
        in: "AMBIGUOUS_USER_PROMPT",
        out: "VERIFIED_AUTONOMOUS_ACTION",
        labels: ["01. RAW PROMPT", "02. AGENT LOOP", "03. VERIFIED OUTPUT"],
        analysis: false
      }
    };
    const activeDomain = (key) => DOMAIN_VIEWS[key] || DOMAIN_VIEWS.python;
    const selectDomain = (key, { focusTab = false } = {}) => {
      const info = activeDomain(key);
      domainBtns.forEach((btn) => {
        const isActive = btn.getAttribute("data-refinery-domain") === key;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", String(isActive));
        btn.tabIndex = isActive ? 0 : -1;
        if (isActive && focusTab) btn.focus();
      });
      if (panelEl) panelEl.setAttribute("aria-labelledby", info.tabId);
      if (titleEl) titleEl.textContent = info.title;
      if (tagEl) tagEl.textContent = info.tag;
      if (descEl) descEl.textContent = info.description;
      if (heroBio) heroBio.textContent = info.bio;
      if (analysisBtn) analysisBtn.hidden = !info.analysis;
      if (pointsEl) {
        pointsEl.replaceChildren(
          ...info.points.map((point) => {
            const li = document.createElement("li");
            li.textContent = point;
            return li;
          })
        );
      }
      if (labelIn) labelIn.textContent = info.labels[0];
      if (labelGate) labelGate.textContent = info.labels[1];
      if (labelOut) labelOut.textContent = info.labels[2];
      if (statusEl) {
        statusEl.innerHTML = `
        <span>IN: <strong style="color:var(--packet-amber)">${info.in}</strong></span>
        <span>\u2794</span>
        <span>OUT: <strong style="color:var(--line-mint)">${info.out}</strong></span>
      `;
      }
      window.dispatchEvent(new CustomEvent("refinery-surge"));
    };
    if (domainBtns.length) {
      domainBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          selectDomain(btn.getAttribute("data-refinery-domain") || "python");
        });
        btn.addEventListener("keydown", (event) => {
          const keys = Object.keys(DOMAIN_VIEWS);
          const index = keys.indexOf(btn.getAttribute("data-refinery-domain") || "python");
          let nextIndex = index;
          if (event.key === "ArrowRight") nextIndex = (index + 1) % keys.length;
          else if (event.key === "ArrowLeft") nextIndex = (index - 1 + keys.length) % keys.length;
          else if (event.key === "Home") nextIndex = 0;
          else if (event.key === "End") nextIndex = keys.length - 1;
          else return;
          event.preventDefault();
          selectDomain(keys[nextIndex], { focusTab: true });
        });
      });
    }
    if (injectBtn && svgStage) {
      injectBtn.addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("refinery-surge"));
        svgStage.classList.remove("surge-active");
        void svgStage.offsetWidth;
        svgStage.classList.add("surge-active");
        const orig = injectBtn.innerHTML;
        injectBtn.innerHTML = "<span>\u26A1 REFINING BATCH... 100% CLEAN</span>";
        setTimeout(() => {
          injectBtn.innerHTML = orig;
        }, 1400);
      });
    }
  }
  async function mountPipelineTunnel3D(container, fallback2D) {
    try {
      let afterDraw = function(cb) {
        const gl = renderer.getContext();
        if (gl && typeof gl.fenceSync === "function") {
          const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
          gl.flush();
          const poll = () => {
            const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
            if (state === gl.UNSIGNALED) {
              frameId = window.setTimeout(poll, 5);
            } else {
              gl.deleteSync(sync);
              frameId = window.setTimeout(cb, 85);
            }
          };
          frameId = window.setTimeout(poll, 5);
        } else {
          frameId = window.setTimeout(cb, 85);
        }
      }, tick = function() {
        const now = performance.now();
        const dt = Math.min((now - lastTime) / 1e3, 0.1);
        lastTime = now;
        if (surgeBoost > 0) {
          surgeBoost = Math.max(0, surgeBoost - dt * 1.2);
        }
        const maxProgress = Math.max(1, stationCount - 1);
        const progress = Math.max(0, Math.min(maxProgress, window.pipelineScrollProgress || 0));
        const curveT = Math.min(0.96, progress / maxProgress * 0.86);
        const camPos = pipelineCurve.getPointAt(curveT);
        const lookAtPos = pipelineCurve.getPointAt(Math.min(0.99, curveT + 0.08));
        camera.position.x = camPos.x + mouseX * 1.2;
        camera.position.y = camPos.y - mouseY * 0.9;
        camera.position.z = camPos.z + 5.5;
        lookTarget.set(lookAtPos.x + mouseX * 0.5, lookAtPos.y - mouseY * 0.4, lookAtPos.z);
        camera.lookAt(lookTarget);
        portalGates.forEach((gate, idx) => {
          const dir = idx % 2 === 0 ? 1 : -1;
          const speedMult = 1 + surgeBoost * 4;
          gate.outerRing.rotation.z += dt * 0.18 * dir * speedMult;
          gate.innerRing.rotation.z -= dt * 0.32 * dir * speedMult;
        });
        shards.forEach((s) => {
          s.t = (s.t + dt * s.speed * (1 + surgeBoost * 3.5)) % 1;
          const centerPt = pipelineCurve.getPointAt(s.t);
          const swirl = s.angle + now * 8e-4 * (s.isClean ? 0.5 : 1.5);
          const r = s.isClean ? Math.round(s.radius) : s.radius;
          s.mesh.position.set(
            centerPt.x + Math.cos(swirl) * r,
            centerPt.y + Math.sin(swirl) * r,
            centerPt.z
          );
          s.mesh.rotation.x += dt * (s.isClean ? 0.6 : 2.2);
          s.mesh.rotation.y += dt * (s.isClean ? 0.6 : 1.8);
        });
        renderer.render(scene, camera);
        if (isSoftwareGl) {
          afterDraw(tick);
        } else {
          frameId = requestAnimationFrame(tick);
        }
      };
      const THREE = await import("../vendor/three.module.js");
      const isSoftwareGl = (() => {
        const gl = document.createElement("canvas").getContext("webgl2");
        if (!gl) return true;
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      })();
      const width = window.innerWidth || 1280;
      const height = window.innerHeight || 800;
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(461584, 0.014);
      const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 180);
      camera.position.set(0, 0, 6);
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isSoftwareGl,
        powerPreference: "high-performance"
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);
      fallback2D.style.opacity = "0.12";
      const stationCount = document.querySelectorAll(".spatial-station").length || 6;
      const curvePoints = [];
      for (let i = 0; i <= stationCount; i++) {
        const z = -i * (210 / stationCount);
        const x = Math.sin(i * 1.1) * 4.5;
        const y = Math.cos(i * 0.9) * 2.2;
        curvePoints.push(new THREE.Vector3(x, y, z));
      }
      const pipelineCurve = new THREE.CatmullRomCurve3(curvePoints);
      const tubeGeo = new THREE.TubeGeometry(pipelineCurve, 120, 6.2, 8, false);
      const tubeEdges = new THREE.EdgesGeometry(tubeGeo);
      const tubeMat = new THREE.LineBasicMaterial({
        color: 6220500,
        transparent: true,
        opacity: 0.11
      });
      const tubeMesh = new THREE.LineSegments(tubeEdges, tubeMat);
      scene.add(tubeMesh);
      const corePoints = pipelineCurve.getPoints(200);
      const coreLineGeo = new THREE.BufferGeometry().setFromPoints(corePoints);
      const coreLineMat = new THREE.LineBasicMaterial({
        color: 16498468,
        transparent: true,
        opacity: 0.35
      });
      const coreLine = new THREE.LineSegments(coreLineGeo, coreLineMat);
      scene.add(coreLine);
      const gatesGroup = new THREE.Group();
      const gateMintMat = new THREE.LineBasicMaterial({
        color: 6220500,
        transparent: true,
        opacity: 0.45
      });
      const gateAmberMat = new THREE.LineBasicMaterial({
        color: 16498468,
        transparent: true,
        opacity: 0.55
      });
      const portalGates = [];
      for (let i = 0; i < stationCount; i++) {
        const t = i / stationCount;
        const pos = pipelineCurve.getPointAt(t);
        const tangent = pipelineCurve.getTangentAt(t);
        const gateHolder = new THREE.Group();
        gateHolder.position.copy(pos);
        const outerGeo = new THREE.RingGeometry(4.8, 5.2, 8);
        const outerEdges = new THREE.EdgesGeometry(outerGeo);
        const outerRing = new THREE.LineSegments(outerEdges, i % 2 === 0 ? gateMintMat : gateAmberMat);
        gateHolder.add(outerRing);
        const innerGeo = new THREE.RingGeometry(3.2, 3.45, 6);
        const innerEdges = new THREE.EdgesGeometry(innerGeo);
        const innerRing = new THREE.LineSegments(innerEdges, gateMintMat);
        gateHolder.add(innerRing);
        const nodeGeo = new THREE.OctahedronGeometry(0.22, 0);
        const nodeMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 16498468 : 6220500 });
        for (let c = 0; c < 4; c++) {
          const angle = c * Math.PI / 2 + Math.PI / 4;
          const cornerMesh = new THREE.Mesh(nodeGeo, nodeMat);
          cornerMesh.position.set(Math.cos(angle) * 5, Math.sin(angle) * 5, 0);
          gateHolder.add(cornerMesh);
        }
        gateHolder.lookAt(pos.clone().add(tangent));
        gatesGroup.add(gateHolder);
        portalGates.push({ group: gateHolder, outerRing, innerRing, index: i });
      }
      scene.add(gatesGroup);
      const shardCount = 90;
      const shards = [];
      const messyGeo = new THREE.OctahedronGeometry(0.16, 0);
      const cleanGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
      const messyMat = new THREE.MeshBasicMaterial({ color: 16498468, wireframe: true });
      const cleanMat = new THREE.MeshBasicMaterial({ color: 6220500, wireframe: true });
      for (let i = 0; i < shardCount; i++) {
        const isClean = i % 2 === 0;
        const mesh = new THREE.Mesh(isClean ? cleanGeo : messyGeo, isClean ? cleanMat : messyMat);
        const t = Math.random();
        const radius = 1.5 + Math.random() * 3.8;
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.015 + Math.random() * 0.025;
        scene.add(mesh);
        shards.push({ mesh, t, radius, angle, speed, isClean });
      }
      let surgeBoost = 0;
      window.addEventListener("refinery-surge", () => {
        surgeBoost = 1;
      });
      let mouseX = 0;
      let mouseY = 0;
      window.addEventListener(
        "pointermove",
        (e) => {
          mouseX = (e.clientX / window.innerWidth - 0.5) * 1.4;
          mouseY = (e.clientY / window.innerHeight - 0.5) * 1;
        },
        { passive: true }
      );
      window.addEventListener(
        "resize",
        () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        },
        { passive: true }
      );
      let frameId = 0;
      let lastTime = performance.now();
      const lookTarget = new THREE.Vector3();
      tick();
      window.addEventListener("beforeunload", () => {
        cancelAnimationFrame(frameId);
        clearTimeout(frameId);
        renderer.dispose();
      });
    } catch (err) {
      console.warn("3D Pipeline Tunnel fallback to 2D schematic:", err);
    }
  }

  // js/modals.js
  var FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, iframe, [tabindex]:not([tabindex="-1"])';
  function getFocusable(container) {
    return Array.from(container.querySelectorAll(FOCUSABLE)).filter(
      (el) => !el.hasAttribute("hidden") && el.offsetParent !== null
    );
  }
  function trapTabKey(event, container) {
    if (event.key !== "Tab") return;
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
    document.body.classList.add("modal-open");
  }
  function unlockBodyScroll() {
    if (!document.querySelector(".modal-backdrop.active")) {
      document.body.classList.remove("modal-open");
    }
  }
  function openModal(modal, closeButton) {
    const previousFocus = document.activeElement;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    lockBodyScroll();
    const dialog = modal.querySelector('[role="dialog"], .portrait-modal-window, .analysis-modal-window') || modal;
    modal._trapHandler = (event) => trapTabKey(event, dialog);
    document.addEventListener("keydown", modal._trapHandler);
    if (closeButton) closeButton.focus();
    return previousFocus;
  }
  function closeModal(modal, previousFocus, focusTarget) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    if (modal._trapHandler) {
      document.removeEventListener("keydown", modal._trapHandler);
      modal._trapHandler = null;
    }
    unlockBodyScroll();
    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    } else if (focusTarget && typeof focusTarget.focus === "function") {
      focusTarget.focus();
    }
  }
  function initPortraitLightbox() {
    const trigger = document.getElementById("portrait-lightbox-btn");
    const modal = document.getElementById("portrait-modal");
    const closeButton = document.getElementById("portrait-close-btn");
    if (!trigger || !modal || !closeButton) return;
    let previousFocus = null;
    const open = () => {
      previousFocus = openModal(modal, closeButton);
    };
    const close = () => {
      closeModal(modal, previousFocus, trigger);
      previousFocus = null;
    };
    trigger.addEventListener("click", open);
    closeButton.addEventListener("click", close);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("active")) close();
    });
  }
  function initAnalysisModal() {
    const modal = document.getElementById("analysis-modal");
    const frame = document.getElementById("analysis-frame");
    const closeButton = document.getElementById("analysis-close-btn");
    const loading = document.getElementById("analysis-loading");
    if (!modal || !frame || !closeButton) return;
    const mobileQuery = window.matchMedia("(max-width: 700px)");
    let previousFocus = null;
    const sourceForViewport = () => mobileQuery.matches ? "./assets/EM00013923_mobile.html" : "./assets/EM00013923.html";
    const ensureFrameSource = () => {
      const desired = sourceForViewport();
      const layout = mobileQuery.matches ? "mobile" : "desktop";
      if (frame.dataset.layout === layout && frame.getAttribute("src") === desired) return;
      frame.dataset.layout = layout;
      if (loading) loading.hidden = false;
      frame.addEventListener(
        "load",
        () => {
          if (loading) loading.hidden = true;
        },
        { once: true }
      );
      frame.setAttribute("src", desired);
    };
    const open = () => {
      ensureFrameSource();
      previousFocus = openModal(modal, closeButton);
    };
    const close = () => {
      closeModal(modal, previousFocus, null);
      previousFocus = null;
    };
    document.querySelectorAll("[data-open-analysis]").forEach((button) => {
      button.addEventListener("click", open);
    });
    window.addEventListener("analysis:open", open);
    closeButton.addEventListener("click", close);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("active")) close();
    });
    const handleViewportChange = () => {
      if (modal.classList.contains("active")) ensureFrameSource();
    };
    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", handleViewportChange);
    }
  }

  // js/main.js
  document.addEventListener("DOMContentLoaded", () => {
    injectIcons();
    initIconAnimations();
    initCommandBar();
    initEmailCopy();
    initPortraitLightbox();
    initAnalysisModal();
    initThemeToggle();
    init3DScene();
    initSpine();
    loadProjects();
    initIntro(() => {
      window.dispatchEvent(new Event("resize"));
    });
  });
  function initEmailCopy() {
    const copyBtn = document.getElementById("copy-email-btn");
    const emailTextEl = document.getElementById("contact-email-val");
    if (!copyBtn) return;
    copyBtn.addEventListener("click", async () => {
      const textToCopy = emailTextEl?.dataset.email || "mamuntheprogrammer@gmail.com";
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = textToCopy;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
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
        console.warn("Clipboard write failed", err);
      }
    });
  }
  function initThemeToggle() {
    const themeBtn = document.getElementById("toggle-theme-btn");
    if (!themeBtn) return;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const applyTheme = (nextTheme) => {
      document.documentElement.setAttribute("data-theme", nextTheme);
      localSet("mamun_theme", nextTheme);
      themeBtn.textContent = nextTheme === "paper" ? "THEME: PAPER" : "THEME: DARK";
      themeBtn.setAttribute("aria-pressed", String(nextTheme === "paper"));
      if (themeColor) {
        themeColor.setAttribute("content", nextTheme === "paper" ? "#f1f5f9" : "#070b10");
      }
    };
    const savedTheme = localGet("mamun_theme") || "dark";
    applyTheme(savedTheme === "paper" ? "paper" : "dark");
    themeBtn.addEventListener("click", () => {
      const isPaper = document.documentElement.getAttribute("data-theme") === "paper";
      applyTheme(isPaper ? "dark" : "paper");
    });
  }
})();
