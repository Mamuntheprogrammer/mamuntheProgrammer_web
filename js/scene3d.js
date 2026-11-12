/**
 * Full-Viewport 3D Spatial Pipeline Tunnel & Messy-to-Meaningful Refinery
 * - Flies the 3D camera along a 3D Catmull-Rom pipeline spline as the user scrolls
 * - Renders an architectural Hexagonal Refinery Portal Gate at each station
 * - Streams data shards that transform from chaotic amber entropy into ordered mint crystals
 * - Includes interactive Hero Refinery Console (Inject Messy Batch + Domain Filter)
 * - Enforces software-WebGL (SwiftShader) frame pacing via afterDraw()
 * - Phones and touch tablets use the classic flowing layout for reliable scrolling
 */

import { sessionGet, sessionSet } from './utils/storage.js';
import { isCompactViewport, COMPACT_VIEWPORT_QUERY } from './utils/viewport.js';

export function init3DScene() {
  const container = document.getElementById('tunnel-canvas-container');
  const fallback2D = document.getElementById('tunnel-2d-fallback');
  const toggleBtn = document.getElementById('toggle-3d-btn');

  // Initialize the interactive Hero Refinery Console right away
  initInteractiveRefineryConsole();

  if (!container || !fallback2D) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compactViewport = isCompactViewport();
  const fileProtocol = window.location.protocol === 'file:';
  document.body.classList.toggle('compact-mode', compactViewport);

  // Opening index.html directly (file://) blocks module/font CORS in browsers.
  // The classic document layout below still works from disk, so use it there.
  const forceClassic = compactViewport || prefersReduced || fileProtocol;
  const savedPref = sessionGet('mamun_3d_enabled');
  // Touch/small screens and reduced-motion users always use the classic
  // document flow. Desktop keeps the user's saved 3D preference.
  const isEnabled = !forceClassic && (savedPref === null ? true : savedPref === 'true');

  if (!isEnabled) {
    document.body.classList.add('classic-mode');
  } else {
    document.body.classList.remove('classic-mode');
  }

  if (forceClassic) {
    document.body.classList.add('classic-mode');
    if (toggleBtn) toggleBtn.hidden = true;
  }

  updateToggleButton(toggleBtn, isEnabled);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (isCompactViewport() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const currentlyClassic = document.body.classList.contains('classic-mode');
      const next3D = currentlyClassic;
      sessionSet('mamun_3d_enabled', String(next3D));
      window.location.reload();
    });
  }

  // If a desktop window is resized across the compact breakpoint, reload once
  // so the scroll model and CSS layout stay in sync.
  const compactQuery = window.matchMedia(COMPACT_VIEWPORT_QUERY);
  const handleViewportChange = () => window.location.reload();
  if (typeof compactQuery.addEventListener === 'function') {
    compactQuery.addEventListener('change', handleViewportChange);
  }

  if (!isEnabled) {
    return;
  }

  const startThree = () => {
    mountPipelineTunnel3D(container, fallback2D);
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(startThree);
  } else {
    setTimeout(startThree, 180);
  }
}

function updateToggleButton(btn, enabled) {
  if (!btn) return;
  btn.textContent = enabled ? 'VIEW: 3D REVEAL' : 'VIEW: CLASSIC';
  btn.setAttribute('aria-pressed', String(enabled));
}

function initInteractiveRefineryConsole() {
  const injectBtn = document.getElementById('refinery-inject-btn');
  const statusEl = document.getElementById('refinery-telemetry-status');
  const svgStage = document.getElementById('refinery-svg-stream');
  const domainBtns = Array.from(document.querySelectorAll('[data-refinery-domain]'));
  const panelEl = document.getElementById('refinery-domain-panel');
  const titleEl = document.getElementById('refinery-domain-title');
  const tagEl = document.getElementById('refinery-domain-tag');
  const descEl = document.getElementById('refinery-domain-desc');
  const pointsEl = document.getElementById('refinery-domain-points');
  const analysisBtn = document.getElementById('refinery-analysis-btn');
  const heroBio = document.getElementById('hero-bio');
  const labelIn = document.getElementById('refinery-svg-label-in');
  const labelGate = document.getElementById('refinery-svg-label-gate');
  const labelOut = document.getElementById('refinery-svg-label-out');

  const DOMAIN_VIEWS = {
    python: {
      tabId: 'refinery-tab-python',
      title: 'Python // Systems Engine',
      tag: 'CORE LANGUAGE',
      bio: 'Python-first engineer turning messy files, folders, and APIs into dependable systems — ETL pipelines, Pandas analysis, Django/Flask backends, and Tkinter desktop tools.',
      description: 'I design Python systems that remove repetitive manual work and keep data moving cleanly from source to output.',
      points: [
        'ETL & file-processing pipelines',
        'Django & Flask backends',
        'Pandas & NumPy analysis',
        'Tkinter desktop utilities',
      ],
      in: 'RAW_EXCEL_BATCH (42 sheets)',
      out: 'CLEAN_SCHEMA: 100% MERGED',
      labels: ['01. RAW FILES', '02. PYTHON ENGINE', '03. CLEAN DATA'],
      analysis: false,
    },
    sap: {
      tabId: 'refinery-tab-sap',
      title: 'SAP // ABAP × SD × MM',
      tag: 'TECHNO-FUNCTIONAL',
      bio: 'Techno-functional SAP engineer bridging ABAP development with SD/MM business processes — custom reports, BAPIs, enhancements, O2C, P2P, and clean technical specs.',
      description: 'I translate business rules into reliable SAP technical solutions, then validate them against live SD and MM process flows.',
      points: [
        'ABAP reports, ALV & BAPIs',
        'SD: O2C, pricing & billing',
        'MM: P2P & inventory management',
        'Functional-to-technical specifications',
      ],
      in: 'IDOC_ORDERS05 // RAW_FLATFILE',
      out: 'SAP SD/MM POSTED (0 ERRORS)',
      labels: ['01. FLAT FILES', '02. ABAP BAPI', '03. SAP POSTED'],
      analysis: false,
    },
    data: {
      tabId: 'refinery-tab-data',
      title: 'Data // Messy → Meaningful',
      tag: 'ANALYTICS',
      bio: 'Data analyst turning raw operational workbooks into clean relational models, reconciled KPIs, and decision-ready dashboards — using SQL, MySQL, MongoDB, and Excel2SQL.',
      description: 'I clean the source, model the relationships, and surface the few numbers that actually drive a decision.',
      points: [
        'Excel2SQL schema inference',
        'SQL / MySQL / MongoDB querying',
        'KPI reporting & reconciliation',
        'Latest: Aristopharma target vs achievement',
      ],
      in: 'UNSTRUCTURED_CSV_LOGS',
      out: 'MYSQL_RELATIONAL_TABLE',
      labels: ['01. MESSY SHEETS', '02. SQL REFINERY', '03. LIVE DASHBOARD'],
      analysis: true,
    },
    ai: {
      tabId: 'refinery-tab-ai',
      title: 'AI // Agentic Workflows',
      tag: 'INTELLIGENCE',
      bio: 'Agentic-AI builder designing PLAN → ACT → OBSERVE workflows that parse inputs, verify outputs, and keep a human in the loop — with strict review and testing.',
      description: 'I use AI for velocity, not blind trust: every generated step is checked, tested, and reviewed before it ships.',
      points: [
        'Plan → Act → Observe agent loops',
        'ML classification & prediction',
        'Verified, human-reviewed output',
        'Vibe coding backed by tests',
      ],
      in: 'AMBIGUOUS_USER_PROMPT',
      out: 'VERIFIED_AUTONOMOUS_ACTION',
      labels: ['01. RAW PROMPT', '02. AGENT LOOP', '03. VERIFIED OUTPUT'],
      analysis: false,
    },
  };

  const activeDomain = (key) => DOMAIN_VIEWS[key] || DOMAIN_VIEWS.python;

  const selectDomain = (key, { focusTab = false } = {}) => {
    const info = activeDomain(key);

    domainBtns.forEach((btn) => {
      const isActive = btn.getAttribute('data-refinery-domain') === key;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      btn.tabIndex = isActive ? 0 : -1;
      if (isActive && focusTab) btn.focus();
    });

    if (panelEl) panelEl.setAttribute('aria-labelledby', info.tabId);
    if (titleEl) titleEl.textContent = info.title;
    if (tagEl) tagEl.textContent = info.tag;
    if (descEl) descEl.textContent = info.description;
    if (heroBio) heroBio.textContent = info.bio;
    if (analysisBtn) analysisBtn.hidden = !info.analysis;

    if (pointsEl) {
      pointsEl.replaceChildren(
        ...info.points.map((point) => {
          const li = document.createElement('li');
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
        <span>➔</span>
        <span>OUT: <strong style="color:var(--line-mint)">${info.out}</strong></span>
      `;
    }

    window.dispatchEvent(new CustomEvent('refinery-surge'));
  };

  if (domainBtns.length) {
    domainBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        selectDomain(btn.getAttribute('data-refinery-domain') || 'python');
      });

      btn.addEventListener('keydown', (event) => {
        const keys = Object.keys(DOMAIN_VIEWS);
        const index = keys.indexOf(btn.getAttribute('data-refinery-domain') || 'python');
        let nextIndex = index;

        if (event.key === 'ArrowRight') nextIndex = (index + 1) % keys.length;
        else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + keys.length) % keys.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = keys.length - 1;
        else return;

        event.preventDefault();
        selectDomain(keys[nextIndex], { focusTab: true });
      });
    });
  }

  if (injectBtn && svgStage) {
    injectBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('refinery-surge'));
      svgStage.classList.remove('surge-active');
      void svgStage.offsetWidth;
      svgStage.classList.add('surge-active');

      const orig = injectBtn.innerHTML;
      injectBtn.innerHTML = '<span>⚡ REFINING BATCH... 100% CLEAN</span>';
      setTimeout(() => {
        injectBtn.innerHTML = orig;
      }, 1400);
    });
  }
}

async function mountPipelineTunnel3D(container, fallback2D) {
  try {
    const THREE = await import('../vendor/three.module.js');

    // Software WebGL guard (SwiftShader / headless Chromium)
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = window.innerWidth || 1280;
    const height = window.innerHeight || 800;

    // Read the active theme so the tunnel follows Dark, Paper, and Crimson.
    const readThemePalette = () => {
      const styles = getComputedStyle(document.documentElement);
      const read = (property, fallback) => styles.getPropertyValue(property).trim() || fallback;
      return {
        accent: read('--line-mint', '#5eead4'),
        secondary: read('--packet-amber', '#fbbf24'),
        background: read('--bg-primary', '#070b10'),
      };
    };
    const themePalette = readThemePalette();

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(new THREE.Color(themePalette.background), 0.014);

    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 180);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);
    fallback2D.style.opacity = '0.12';

    // 1. Build the 3D Pipeline Spline Curve through Z-space (6 stations: z = 0 to z = -210)
    const stationCount = document.querySelectorAll('.spatial-station').length || 6;
    const curvePoints = [];
    for (let i = 0; i <= stationCount; i++) {
      const z = -i * (210 / stationCount);
      const x = Math.sin(i * 1.1) * 4.5;
      const y = Math.cos(i * 0.9) * 2.2;
      curvePoints.push(new THREE.Vector3(x, y, z));
    }
    const pipelineCurve = new THREE.CatmullRomCurve3(curvePoints);

    // Wireframe Conduit Tube along the spline
    const tubeGeo = new THREE.TubeGeometry(pipelineCurve, 120, 6.2, 8, false);
    const tubeEdges = new THREE.EdgesGeometry(tubeGeo);
    const tubeMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(themePalette.accent),
      transparent: true,
      opacity: 0.11,
    });
    const tubeMesh = new THREE.LineSegments(tubeEdges, tubeMat);
    scene.add(tubeMesh);

    // Inner core data thread line
    const corePoints = pipelineCurve.getPoints(200);
    const coreLineGeo = new THREE.BufferGeometry().setFromPoints(corePoints);
    const coreLineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(themePalette.secondary),
      transparent: true,
      opacity: 0.35,
    });
    const coreLine = new THREE.LineSegments(coreLineGeo, coreLineMat);
    scene.add(coreLine);

    // 2. Build one Architectural Refinery Portal Gate per station
    const gatesGroup = new THREE.Group();
    const gateMintMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(themePalette.accent),
      transparent: true,
      opacity: 0.45,
    });
    const gateAmberMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(themePalette.secondary),
      transparent: true,
      opacity: 0.55,
    });

    const themedMaterials = [
      { material: tubeMat, role: 'accent' },
      { material: coreLineMat, role: 'secondary' },
      { material: gateMintMat, role: 'accent' },
      { material: gateAmberMat, role: 'secondary' },
    ];

    const portalGates = [];

    for (let i = 0; i < stationCount; i++) {
      const t = i / stationCount;
      const pos = pipelineCurve.getPointAt(t);
      const tangent = pipelineCurve.getTangentAt(t);

      const gateHolder = new THREE.Group();
      gateHolder.position.copy(pos);

      // Outer Octagonal Portal Ring
      const outerGeo = new THREE.RingGeometry(4.8, 5.2, 8);
      const outerEdges = new THREE.EdgesGeometry(outerGeo);
      const outerRing = new THREE.LineSegments(outerEdges, i % 2 === 0 ? gateMintMat : gateAmberMat);
      gateHolder.add(outerRing);

      // Inner Rotating Refinery Filter Grid
      const innerGeo = new THREE.RingGeometry(3.2, 3.45, 6);
      const innerEdges = new THREE.EdgesGeometry(innerGeo);
      const innerRing = new THREE.LineSegments(innerEdges, gateMintMat);
      gateHolder.add(innerRing);

      // Corner data nodes on the portal
      const nodeGeo = new THREE.OctahedronGeometry(0.22, 0);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(i % 2 === 0 ? themePalette.secondary : themePalette.accent),
      });
      themedMaterials.push({ material: nodeMat, role: i % 2 === 0 ? 'secondary' : 'accent' });
      for (let c = 0; c < 4; c++) {
        const angle = (c * Math.PI) / 2 + Math.PI / 4;
        const cornerMesh = new THREE.Mesh(nodeGeo, nodeMat);
        cornerMesh.position.set(Math.cos(angle) * 5.0, Math.sin(angle) * 5.0, 0);
        gateHolder.add(cornerMesh);
      }

      gateHolder.lookAt(pos.clone().add(tangent));
      gatesGroup.add(gateHolder);
      portalGates.push({ group: gateHolder, outerRing, innerRing, index: i });
    }
    scene.add(gatesGroup);

    // 3. Stream of Messy-to-Meaningful 3D Data Shards along the Tunnel
    const shardCount = 90;
    const shards = [];
    const messyGeo = new THREE.OctahedronGeometry(0.16, 0);
    const cleanGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    const messyMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(themePalette.secondary),
      wireframe: true,
    });
    const cleanMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(themePalette.accent),
      wireframe: true,
    });
    themedMaterials.push({ material: messyMat, role: 'secondary' });
    themedMaterials.push({ material: cleanMat, role: 'accent' });

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

    function applyThemeColors() {
      const palette = readThemePalette();
      scene.fog.color.set(palette.background);
      themedMaterials.forEach(({ material, role }) => {
        material.color.set(role === 'accent' ? palette.accent : palette.secondary);
      });
    }

    window.addEventListener('mamun:themechange', applyThemeColors);

    // Burst surge effect when user clicks "Inject Messy Data"
    let surgeBoost = 0;
    window.addEventListener('refinery-surge', () => {
      surgeBoost = 1.0;
    });

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener(
      'pointermove',
      (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 1.4;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 1.0;
      },
      { passive: true }
    );

    window.addEventListener(
      'resize',
      () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      },
      { passive: true }
    );

    // Software WebGL afterDraw frame pacer (prevents headless Chromium CPU starvation)
    let frameId = 0;
    function afterDraw(cb) {
      const gl = renderer.getContext();
      if (gl && typeof gl.fenceSync === 'function') {
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
    }

    let lastTime = performance.now();
    const lookTarget = new THREE.Vector3();

    function tick() {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (surgeBoost > 0) {
        surgeBoost = Math.max(0, surgeBoost - dt * 1.2);
      }

      // Read scroll progress (0..stationCount-1) shared by spine.js
      const maxProgress = Math.max(1, stationCount - 1);
      const progress = Math.max(0, Math.min(maxProgress, window.pipelineScrollProgress || 0));
      const curveT = Math.min(0.96, (progress / maxProgress) * 0.86);

      // Position camera along the 3D pipeline spline
      const camPos = pipelineCurve.getPointAt(curveT);
      const lookAtPos = pipelineCurve.getPointAt(Math.min(0.99, curveT + 0.08));

      camera.position.x = camPos.x + mouseX * 1.2;
      camera.position.y = camPos.y - mouseY * 0.9;
      camera.position.z = camPos.z + 5.5;

      lookTarget.set(lookAtPos.x + mouseX * 0.5, lookAtPos.y - mouseY * 0.4, lookAtPos.z);
      camera.lookAt(lookTarget);

      // Rotate refinery portal gates
      portalGates.forEach((gate, idx) => {
        const dir = idx % 2 === 0 ? 1 : -1;
        const speedMult = 1 + surgeBoost * 4;
        gate.outerRing.rotation.z += dt * 0.18 * dir * speedMult;
        gate.innerRing.rotation.z -= dt * 0.32 * dir * speedMult;
      });

      // Advance data shards along the pipeline
      shards.forEach((s) => {
        s.t = (s.t + dt * s.speed * (1 + surgeBoost * 3.5)) % 1;
        const centerPt = pipelineCurve.getPointAt(s.t);
        const swirl = s.angle + now * 0.0008 * (s.isClean ? 0.5 : 1.5);
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
    }

    tick();

    window.addEventListener('beforeunload', () => {
      window.removeEventListener('mamun:themechange', applyThemeColors);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.dispose();
    });
  } catch (err) {
    console.warn('3D Pipeline Tunnel fallback to 2D schematic:', err);
  }
}
