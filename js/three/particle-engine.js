/* =========================================================================
   CORE 3D ENGINE: SCROLL-DRIVEN PARTICLE MORPHING (THREE.JS)
   ========================================================================= */
export function initParticleEngine() {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('webgl-canvas');
  const isMobile = window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? 4500 : 12000;
  const STAR_COUNT = isMobile ? 1200 : 2800;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.z = isMobile ? 15.5 : 12.5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Soft luminous circular particle sprite texture
  function createGlowTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.28, 'rgba(255,255,255,0.85)');
    grad.addColorStop(0.65, 'rgba(255,255,255,0.22)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }
  const glowTex = createGlowTexture();

  // Palette
  const cAmber = new THREE.Color('#F5A623');
  const cCobalt = new THREE.Color('#2D7FF9');
  const cWhite = new THREE.Color('#FFFFFF');

  /* --- Ambient 3D Starfield drifting along +Z toward camera --- */
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(STAR_COUNT * 3);
  const starCol = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 70;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 50;
    starPos[i * 3 + 2] = -Math.random() * 90 + 10;
    const pick = Math.random() < 0.35 ? cCobalt : cWhite;
    const dim = 0.45 + Math.random() * 0.55;
    starCol[i * 3] = pick.r * dim;
    starCol[i * 3 + 1] = pick.g * dim;
    starCol[i * 3 + 2] = pick.b * dim;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
  const starMat = new THREE.PointsMaterial({
    size: isMobile ? 0.12 : 0.14,
    map: glowTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);

  /* --- Helper: Build 4 Sculptures (positions + colors + metadata flags) --- */
  const statesPos = [
    new Float32Array(PARTICLE_COUNT * 3), // 0: Rocket
    new Float32Array(PARTICLE_COUNT * 3), // 1: Satellite
    new Float32Array(PARTICLE_COUNT * 3), // 2: Earth/Globe
    new Float32Array(PARTICLE_COUNT * 3), // 3: Astronaut
  ];
  const statesCol = [
    new Float32Array(PARTICLE_COUNT * 3),
    new Float32Array(PARTICLE_COUNT * 3),
    new Float32Array(PARTICLE_COUNT * 3),
    new Float32Array(PARTICLE_COUNT * 3),
  ];
  const isExhaustFlag = new Float32Array(PARTICLE_COUNT); // 1 for rocket exhaust
  const isWaveArmFlag = new Float32Array(PARTICLE_COUNT); // 1 for astronaut waving arm
  const randomSeed = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    randomSeed[i] = Math.random() * Math.PI * 2;
  }

  // STATE 0: Tilted 3D Rocket pointing top-right at 45 degrees + animated exhaust
  (function buildRocket() {
    const pos = statesPos[0];
    const col = statesCol[0];
    const angle = -Math.PI / 4; // Pointing top-right (+X, +Y)
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      let color = cWhite;
      const r = i / PARTICLE_COUNT;

      if (r < 0.44) {
        // Fuselage + tapered nosecone
        const t = Math.random(); // 0 bottom to 1 tip
        y = -2.0 + t * 5.2;
        const radius = t > 0.62
          ? 1.05 * Math.pow(1 - (t - 0.62) / 0.38, 0.72)
          : 1.05 * (0.86 + 0.14 * Math.sin(t * Math.PI));
        const theta = Math.random() * Math.PI * 2;
        const radJitter = radius * (0.94 + Math.random() * 0.08);
        x = Math.cos(theta) * radJitter;
        z = Math.sin(theta) * radJitter;
        color = t > 0.78 ? cAmber : (Math.random() < 0.35 ? cCobalt : cWhite);
      } else if (r < 0.56) {
        // Porthole Window Ring
        const theta = Math.random() * Math.PI * 2;
        const rad = 0.45 + Math.random() * 0.12;
        x = Math.cos(theta) * rad;
        y = 0.75 + Math.sin(theta) * rad;
        z = 0.98 + (Math.random() - 0.5) * 0.08;
        color = cCobalt;
      } else if (r < 0.76) {
        // 3 Swept Aerodynamic Fins
        const finIdx = Math.floor(Math.random() * 3);
        const finAngle = (finIdx / 3) * Math.PI * 2 + 0.3;
        const u = Math.random(); // radial outward
        const v = Math.random(); // vertical along fin
        const rad = 0.95 + u * 1.15;
        y = -1.95 + v * 1.65 - u * 0.65;
        x = Math.cos(finAngle) * rad;
        z = Math.sin(finAngle) * rad;
        color = u > 0.55 ? cAmber : cCobalt;
      } else {
        // Animated Flickering Exhaust Plume at Tail
        isExhaustFlag[i] = 1;
        const depth = Math.random();
        const spread = (0.35 + depth * 1.05) * Math.sqrt(Math.random());
        const theta = Math.random() * Math.PI * 2;
        x = Math.cos(theta) * spread;
        z = Math.sin(theta) * spread;
        y = -2.1 - depth * 2.8;
        color = depth < 0.35 ? cWhite : (Math.random() < 0.68 ? cAmber : cCobalt);
      }

      // Tilt 45 degrees toward top-right
      const rx = x * cosA - y * sinA;
      const ry = x * sinA + y * cosA;
      pos[i * 3] = rx;
      pos[i * 3 + 1] = ry;
      pos[i * 3 + 2] = z;

      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
  })();

  // STATE 1: Rotating 3D Orbital Satellite with dual solar-panel wings
  (function buildSatellite() {
    const pos = statesPos[1];
    const col = statesCol[1];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      let color = cWhite;
      const r = i / PARTICLE_COUNT;

      if (r < 0.28) {
        // Central octagonal/cylindrical satellite bus
        const theta = Math.random() * Math.PI * 2;
        const rad = 0.85 + Math.random() * 0.12;
        const h = (Math.random() - 0.5) * 2.1;
        x = Math.cos(theta) * rad;
        y = h;
        z = Math.sin(theta) * rad;
        color = Math.random() < 0.55 ? cAmber : cWhite;
      } else if (r < 0.42) {
        // Parabolic Communications Dish on top
        const u = Math.random();
        const rad = Math.sqrt(u) * 1.25;
        const theta = Math.random() * Math.PI * 2;
        x = Math.cos(theta) * rad;
        z = Math.sin(theta) * rad;
        y = 1.25 + (rad * rad) * 0.35;
        color = rad > 0.95 ? cAmber : cWhite;
      } else {
        // Dual Solar-Panel Wings (Left & Right) with blue & gold grid
        const side = Math.random() < 0.5 ? -1 : 1;
        const u = Math.random(); // along wing span
        const v = (Math.random() - 0.5) * 1.55; // wing height
        x = side * (1.2 + u * 3.4);
        y = v;
        z = (Math.random() - 0.5) * 0.08;
        // Subtle solar grid lines in amber gold, cells in cobalt blue
        const isGrid = (Math.abs((u * 8) % 1) < 0.08) || (Math.abs(((v + 0.8) * 4) % 1) < 0.08);
        color = isGrid ? cAmber : (Math.random() < 0.82 ? cCobalt : cWhite);
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
  })();

  // STATE 2: Rotating 3D Earth/Globe Sphere with golden continents & blue oceans
  (function buildGlobe() {
    const pos = statesPos[2];
    const col = statesCol[2];
    const radius = 2.95;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0, y = 0, z = 0;
      let color = cCobalt;

      if (i < PARTICLE_COUNT * 0.90) {
        // Fibonacci / uniform sphere distribution
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.cos(phi);
        z = radius * Math.sin(phi) * Math.sin(theta);

        // Procedural multi-frequency continent field
        const continentSignal =
          Math.sin(theta * 2.3 + 0.5) * Math.cos(phi * 2.1) +
          0.55 * Math.sin(theta * 4.7 - phi * 3.2) +
          0.35 * Math.cos(theta * 3.1 + phi * 5.0);

        if (continentSignal > 0.22) {
          // Illuminated golden continents + white city highlights
          color = continentSignal > 0.72 ? cWhite : cAmber;
          // Slightly elevate continent particles
          x *= 1.02; y *= 1.02; z *= 1.02;
        } else {
          // Electric cobalt oceans
          color = cCobalt;
        }
      } else {
        // Faint orbital data ring around globe
        const theta = Math.random() * Math.PI * 2;
        const ringR = radius * (1.28 + (Math.random() - 0.5) * 0.12);
        const rx = Math.cos(theta) * ringR;
        const rz = Math.sin(theta) * ringR;
        // Tilt ring
        x = rx;
        y = rz * 0.38;
        z = rz * 0.92;
        color = Math.random() < 0.5 ? cWhite : cAmber;
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
  })();

  // STATE 3: Friendly 3D Astronaut figure with right arm subtly waving in zero-G
  (function buildAstronaut() {
    const pos = statesPos[3];
    const col = statesCol[3];

    function randSphere(cx, cy, cz, rx, ry, rz) {
      const u = Math.random(), v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const rad = Math.cbrt(0.75 + Math.random() * 0.25);
      return [
        cx + rx * rad * Math.sin(phi) * Math.cos(theta),
        cy + ry * rad * Math.cos(phi),
        cz + rz * rad * Math.sin(phi) * Math.sin(theta),
      ];
    }

    function randCapsule(x1, y1, z1, x2, y2, z2, r) {
      const t = Math.random();
      const theta = Math.random() * Math.PI * 2;
      const rad = r * (0.72 + Math.random() * 0.28);
      return [
        x1 + (x2 - x1) * t + Math.cos(theta) * rad,
        y1 + (y2 - y1) * t + (Math.random() - 0.5) * rad * 0.4,
        z1 + (z2 - z1) * t + Math.sin(theta) * rad,
      ];
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let p = [0, 0, 0];
      let color = cWhite;
      const r = i / PARTICLE_COUNT;

      if (r < 0.24) {
        // Helmet
        p = randSphere(0, 1.95, 0, 0.92, 0.88, 0.9);
        // Gold reflective visor on front (+Z)
        if (p[2] > 0.42 && Math.abs(p[0]) < 0.68 && p[1] > 1.55 && p[1] < 2.28) {
          color = cAmber;
        } else {
          color = Math.random() < 0.2 ? cCobalt : cWhite;
        }
      } else if (r < 0.50) {
        // Torso Spacesuit
        p = randSphere(0, 0.25, 0, 0.95, 1.15, 0.72);
        // Chest control module in cobalt blue
        if (p[2] > 0.45 && Math.abs(p[0]) < 0.4 && Math.abs(p[1] - 0.45) < 0.3) {
          color = cCobalt;
        } else {
          color = Math.random() < 0.15 ? cCobalt : cWhite;
        }
      } else if (r < 0.62) {
        // Life-Support Backpack
        p = [
          (Math.random() - 0.5) * 1.25,
          0.35 + (Math.random() - 0.5) * 1.45,
          -0.85 + (Math.random() - 0.5) * 0.45,
        ];
        color = cCobalt;
      } else if (r < 0.74) {
        // Right Arm (Raised & Waving in Zero-G!)
        isWaveArmFlag[i] = 1;
        p = randCapsule(0.88, 0.85, 0.05, 1.85, 2.05, 0.25, 0.30);
        color = p[1] > 1.75 ? cAmber : cWhite;
      } else if (r < 0.84) {
        // Left Arm floating gently
        p = randCapsule(-0.9, 0.8, 0.05, -1.7, -0.05, 0.25, 0.28);
        color = p[1] < 0.15 ? cAmber : cWhite;
      } else if (r < 0.92) {
        // Left Leg bent in zero-G
        p = randCapsule(-0.42, -0.75, 0.0, -0.72, -2.35, 0.35, 0.32);
        color = p[1] < -2.0 ? cCobalt : cWhite;
      } else {
        // Right Leg bent in zero-G
        p = randCapsule(0.42, -0.75, 0.0, 0.68, -2.15, -0.25, 0.32);
        color = p[1] < -1.85 ? cCobalt : cWhite;
      }

      pos[i * 3] = p[0];
      pos[i * 3 + 1] = p[1];
      pos[i * 3 + 2] = p[2];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
  })();

  /* --- Active BufferGeometry --- */
  const currentPos = new Float32Array(statesPos[0]);
  const currentCol = new Float32Array(statesCol[0]);
  const mainGeo = new THREE.BufferGeometry();
  mainGeo.setAttribute('position', new THREE.BufferAttribute(currentPos, 3));
  mainGeo.setAttribute('color', new THREE.BufferAttribute(currentCol, 3));

  const mainMat = new THREE.PointsMaterial({
    size: isMobile ? 0.12 : 0.105,
    map: glowTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const morphCloud = new THREE.Points(mainGeo, mainMat);
  const cloudGroup = new THREE.Group();
  cloudGroup.add(morphCloud);
  scene.add(cloudGroup);

  // Anchor positions per state (desktop vs mobile)
  const stateAnchors = isMobile
    ? [
        { x: 0.0, y: 1.4, z: -2.0 },
        { x: 0.0, y: 0.6, z: -2.0 },
        { x: 0.0, y: 0.2, z: -2.5 },
        { x: 0.0, y: -0.6, z: -2.0 },
      ]
    : [
        { x: 3.55, y: 0.15, z: 0.0 },   // State 0: Hero Right (Rocket)
        { x: -3.55, y: -0.1, z: 0.0 },  // State 1: Positioning Left (Satellite)
        { x: 3.65, y: 0.0, z: -0.6 },   // State 2: Pricing Right (Globe)
        { x: -2.9, y: -0.45, z: -0.2 }, // State 3: Showcase/Contact Left-Center (Astronaut)
      ];

  // Mouse parallax & subtle repulsion tracking
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });

  // Smooth scroll progress 0 -> 3 mapped across document scroll
  let targetScrollMorph = 0;
  let currentScrollMorph = 0;

  function updateScrollMorphTarget() {
    const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollRatio = Math.min(1, Math.max(0, window.scrollY / docHeight));
    // Map 0..1 to 0..3 across the 4 morph states
    targetScrollMorph = scrollRatio * 3.0;

    // Update bottom progress bar
    const bar = document.getElementById('scroll-progress-bar');
    if (bar) bar.style.width = (scrollRatio * 100).toFixed(2) + '%';

    // Navbar background tint on scroll
    const nav = document.getElementById('top-navbar');
    if (nav) {
      if (window.scrollY > 40) {
        nav.classList.add('bg-cosmic/75', 'backdrop-blur-xl', 'border-b', 'border-white/10');
      } else {
        nav.classList.remove('bg-cosmic/75', 'backdrop-blur-xl', 'border-b', 'border-white/10');
      }
    }
  }
  window.addEventListener('scroll', updateScrollMorphTarget, { passive: true });
  updateScrollMorphTarget();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth lerp mouse & scroll morph
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;
    currentScrollMorph += (targetScrollMorph - currentScrollMorph) * 0.075;

    // Drift ambient starfield toward camera along +Z
    const sArr = starGeo.attributes.position.array;
    for (let i = 0; i < STAR_COUNT; i++) {
      sArr[i * 3 + 2] += 0.045;
      if (sArr[i * 3 + 2] > 14) {
        sArr[i * 3 + 2] = -78;
      }
    }
    starGeo.attributes.position.needsUpdate = true;

    // Determine active pair of morph states
    const idxA = Math.min(2, Math.floor(currentScrollMorph));
    const idxB = Math.min(3, idxA + 1);
    const localT = Math.min(1, Math.max(0, currentScrollMorph - idxA));
    // Smoothstep ease
    const easeT = localT * localT * (3 - 2 * localT);
    // Swirling cosmic vortex dispersion peak at mid-transition (localT = 0.5)
    const vortex = Math.sin(localT * Math.PI);

    // Interpolate group anchor
    const anchorA = stateAnchors[idxA];
    const anchorB = stateAnchors[idxB];
    cloudGroup.position.x = anchorA.x + (anchorB.x - anchorA.x) * easeT + mouse.x * 0.55;
    cloudGroup.position.y = anchorA.y + (anchorB.y - anchorA.y) * easeT + Math.sin(t * 0.9) * 0.16 + mouse.y * 0.35;
    cloudGroup.position.z = anchorA.z + (anchorB.z - anchorA.z) * easeT;

    // State-aware gentle rotation + mouse tilt
    const spinY = (idxA === 1 || idxA === 2 || idxB === 2) ? t * 0.28 : Math.sin(t * 0.45) * 0.22;
    cloudGroup.rotation.y = spinY + mouse.x * 0.35;
    cloudGroup.rotation.x = mouse.y * 0.22 + (idxA === 1 ? 0.22 : 0.05);

    // Vertex + Color interpolation
    const posA = statesPos[idxA];
    const posB = statesPos[idxB];
    const colA = statesCol[idxA];
    const colB = statesCol[idxB];
    const pArr = mainGeo.attributes.position.array;
    const cArr = mainGeo.attributes.color.array;

    const rocketWeight = Math.max(0, 1 - currentScrollMorph);
    const astroWeight = Math.max(0, currentScrollMorph - 2);
    const waveAngle = Math.sin(t * 3.2) * 0.26;
    const cosW = Math.cos(waveAngle);
    const sinW = Math.sin(waveAngle);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      let x = posA[i3] + (posB[i3] - posA[i3]) * easeT;
      let y = posA[i3 + 1] + (posB[i3 + 1] - posA[i3 + 1]) * easeT;
      let z = posA[i3 + 2] + (posB[i3 + 2] - posA[i3 + 2]) * easeT;

      // Swirling cosmic vortex during transitions
      if (vortex > 0.005) {
        const swirl = vortex * (1.8 + (randomSeed[i] % 1.4));
        const cs = Math.cos(swirl);
        const ss = Math.sin(swirl);
        const nx = x * cs - z * ss;
        const nz = x * ss + z * cs;
        const expand = 1 + vortex * 0.65;
        x = nx * expand;
        y = y * (1 + vortex * 0.35) + Math.sin(t * 2 + randomSeed[i]) * vortex * 0.35;
        z = nz * expand;
      }

      // Animated flickering exhaust on State 0 (Rocket)
      if (rocketWeight > 0.05 && isExhaustFlag[i] === 1) {
        const flicker = ((t * 3.4 + randomSeed[i]) % 1.0);
        const push = flicker * 0.9 * rocketWeight;
        // Push along bottom-left exhaust vector (-0.707, -0.707)
        x -= push * 0.707;
        y -= push * 0.707;
        z += Math.sin(t * 14 + randomSeed[i]) * 0.06 * rocketWeight;
      }

      // Subtle waving right arm on State 3 (Astronaut)
      if (astroWeight > 0.1 && isWaveArmFlag[i] === 1) {
        // Pivot around right shoulder (0.88, 0.85)
        const dx = x - 0.88;
        const dy = y - 0.85;
        const wx = 0.88 + dx * cosW - dy * sinW;
        const wy = 0.85 + dx * sinW + dy * cosW;
        x += (wx - x) * astroWeight;
        y += (wy - y) * astroWeight;
      }

      pArr[i3] = x;
      pArr[i3 + 1] = y;
      pArr[i3 + 2] = z;

      cArr[i3] = colA[i3] + (colB[i3] - colA[i3]) * easeT;
      cArr[i3 + 1] = colA[i3 + 1] + (colB[i3 + 1] - colA[i3 + 1]) * easeT;
      cArr[i3 + 2] = colA[i3 + 2] + (colB[i3 + 2] - colA[i3 + 2]) * easeT;
    }

    mainGeo.attributes.position.needsUpdate = true;
    mainGeo.attributes.color.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();
}
