/**
 * Full-Viewport 3D Spatial Pipeline Tunnel & Messy-to-Meaningful Refinery
 * - Flies the 3D camera along a 3D Catmull-Rom pipeline spline as the user scrolls
 * - Renders 7 architectural Hexagonal Refinery Portal Gates at each station node
 * - Streams data shards that transform from chaotic amber entropy into ordered mint crystals
 * - Includes interactive Hero Refinery Console (Inject Messy Batch + Domain Filter)
 * - Enforces software-WebGL (SwiftShader) frame pacing via afterDraw()
 */

export function init3DScene() {
  const container = document.getElementById('tunnel-canvas-container');
  const fallback2D = document.getElementById('tunnel-2d-fallback');
  const toggleBtn = document.getElementById('toggle-3d-btn');

  // Initialize the interactive Hero Refinery Console right away
  initInteractiveRefineryConsole();

  if (!container || !fallback2D) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const savedPref = sessionStorage.getItem('mamun_3d_enabled');
  const isEnabled = savedPref === null ? !prefersReduced : savedPref === 'true';

  if (!isEnabled) {
    document.body.classList.add('classic-mode');
  } else {
    document.body.classList.remove('classic-mode');
  }

  updateToggleButton(toggleBtn, isEnabled);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentlyClassic = document.body.classList.contains('classic-mode');
      const next3D = currentlyClassic;
      sessionStorage.setItem('mamun_3d_enabled', String(next3D));
      window.location.reload();
    });
  }

  if (!isEnabled || prefersReduced) {
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
  const domainBtns = document.querySelectorAll('[data-refinery-domain]');

  const DOMAIN_TELEMETRY = {
    python: {
      in: 'RAW_EXCEL_BATCH (42 sheets)',
      gate: 'PANDAS // TKINTER NORMALIZER',
      out: 'CLEAN_SCHEMA: 100% MERGED',
    },
    sap: {
      in: 'IDOC_ORDERS05 // RAW_FLATFILE',
      gate: 'ABAP BAPI_SALESORDER_CREATE',
      out: 'SAP SD/MM POSTED (0 ERRORS)',
    },
    data: {
      in: 'UNSTRUCTURED_CSV_LOGS',
      gate: 'EXCEL2SQL PARSER ENGINE',
      out: 'MYSQL_RELATIONAL_TABLE',
    },
    ai: {
      in: 'AMBIGUOUS_USER_PROMPT',
      gate: 'AGENTIC: PLAN ➔ ACT ➔ OBSERVE',
      out: 'VERIFIED_AUTONOMOUS_ACTION',
    },
  };

  if (domainBtns.length && statusEl) {
    domainBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        domainBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.getAttribute('data-refinery-domain') || 'python';
        const info = DOMAIN_TELEMETRY[key] || DOMAIN_TELEMETRY.python;
        statusEl.innerHTML = `
          <span>IN: <strong style="color:var(--packet-amber)">${info.in}</strong></span>
          <span>➔</span>
          <span>OUT: <strong style="color:var(--line-mint)">${info.out}</strong></span>
        `;
        window.dispatchEvent(new CustomEvent('refinery-surge'));
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

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b10, 0.014);

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

    // 1. Build the 3D Pipeline Spline Curve through Z-space (7 stations: z = 0 to z = -210)
    const curvePoints = [];
    for (let i = 0; i <= 7; i++) {
      const z = -i * 35;
      const x = Math.sin(i * 1.1) * 4.5;
      const y = Math.cos(i * 0.9) * 2.2;
      curvePoints.push(new THREE.Vector3(x, y, z));
    }
    const pipelineCurve = new THREE.CatmullRomCurve3(curvePoints);

    // Wireframe Conduit Tube along the spline
    const tubeGeo = new THREE.TubeGeometry(pipelineCurve, 120, 6.2, 8, false);
    const tubeEdges = new THREE.EdgesGeometry(tubeGeo);
    const tubeMat = new THREE.LineBasicMaterial({
      color: 0x5eead4,
      transparent: true,
      opacity: 0.11,
    });
    const tubeMesh = new THREE.LineSegments(tubeEdges, tubeMat);
    scene.add(tubeMesh);

    // Inner core data thread line
    const corePoints = pipelineCurve.getPoints(200);
    const coreLineGeo = new THREE.BufferGeometry().setFromPoints(corePoints);
    const coreLineMat = new THREE.LineBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.35,
    });
    const coreLine = new THREE.LineSegments(coreLineGeo, coreLineMat);
    scene.add(coreLine);

    // 2. Build 7 Architectural Refinery Portal Gates at each Station Node
    const gatesGroup = new THREE.Group();
    const gateMintMat = new THREE.LineBasicMaterial({
      color: 0x5eead4,
      transparent: true,
      opacity: 0.45,
    });
    const gateAmberMat = new THREE.LineBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.55,
    });

    const portalGates = [];

    for (let i = 0; i < 7; i++) {
      const t = i / 7;
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
      const nodeMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xfbbf24 : 0x5eead4 });
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
    const messyMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, wireframe: true });
    const cleanMat = new THREE.MeshBasicMaterial({ color: 0x5eead4, wireframe: true });

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

      // Read scroll progress (0..6) shared by spine.js
      const progress = Math.max(0, Math.min(6, window.pipelineScrollProgress || 0));
      const curveT = Math.min(0.96, (progress / 6) * 0.86);

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
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.dispose();
    });
  } catch (err) {
    console.warn('3D Pipeline Tunnel fallback to 2D schematic:', err);
  }
}
