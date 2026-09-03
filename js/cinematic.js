// Louhichi Logistics — scroll-driven cinematic sequence.
//
// The container is the sole hero asset: built procedurally in Three.js
// (no external 3D file, no baked video) so it can be exploded, reassembled
// and carried through the whole film as one continuous object. Camera,
// lighting, background and the explode amount are all pure functions of
// scroll progress (0..1) — never time-based, so scrolling fast or slow
// always lands on the geometrically correct frame.
import * as THREE from "../vendor/three.module.min.js";

// The camera keyframes below (position + vertical FOV) were tuned against a
// ~16:10 desktop viewport. Three.js FOV is vertical, so on a narrow portrait
// phone screen the same vertical FOV yields a much narrower horizontal FOV —
// the container (wide relative to its depth) would clip off both edges.
// Compensate by solving for the vertical FOV that keeps the HORIZONTAL FOV
// constant at whatever it was on the reference desktop aspect.
const REF_ASPECT = 1500 / 950;
function fovForAspect(baseFovDeg, aspect) {
  const baseHalf = THREE.MathUtils.degToRad(baseFovDeg) / 2;
  const targetHorizHalf = Math.atan(Math.tan(baseHalf) * REF_ASPECT);
  const vHalf = Math.atan(Math.tan(targetHorizHalf) / aspect);
  return THREE.MathUtils.radToDeg(vHalf) * 2;
}

const ACTS = {
  introEnd: 0.10,
  chargeStart: 0.18,
  chargeExplodePeak: 0.32,
  chargeEnd: 0.40,
  departEnd: 0.50,
  transportStart: 0.50,
  transportEnd: 0.72,
  suiviEnd: 0.80,
  arriveeEnd: 0.90
};

// Camera keyframes: t in [0,1], pos/look in world units. Interpolated with
// smoothstep easing between the two bracketing keys — no spline needed at
// this keyframe density, and it stays perfectly predictable to tune.
const CAM_KEYS = [
  { t: 0.00, pos: [0.0, 0.85, 7.4], look: [0, 0.28, 0], fov: 32 },
  { t: 0.10, pos: [0.0, 0.70, 6.2], look: [0, 0.24, 0], fov: 32 },
  { t: 0.18, pos: [2.9, 1.05, 6.2], look: [0, 0.12, 0], fov: 32 },
  { t: 0.32, pos: [3.8, 1.30, 5.4], look: [0, 0.05, 0], fov: 34 },
  { t: 0.40, pos: [2.0, 1.10, 5.9], look: [0, 0.12, 0], fov: 32 },
  { t: 0.50, pos: [-3.0, 0.80, 5.8], look: [0, 0.20, 0], fov: 30 },
  { t: 0.60, pos: [-4.4, 0.60, 3.6], look: [0.6, 0.15, 0], fov: 28 },
  { t: 0.72, pos: [-3.6, 0.65, 3.0], look: [1.0, 0.15, 0], fov: 28 },
  { t: 0.80, pos: [-2.2, 1.25, 5.2], look: [0, 0.25, 0], fov: 30 },
  { t: 0.90, pos: [0.8, 0.95, 6.0], look: [0, 0.25, 0], fov: 28 },
  { t: 1.00, pos: [2.6, 0.60, 7.6], look: [0.6, 0.15, 0], fov: 26 }
];

// Background / fog / light mood per act — this is how "transport" changes
// (studio -> road -> open sea -> bright arrival -> studio) without ever
// needing a literal truck/ship/plane model.
const MOOD_KEYS = [
  { t: 0.00, bg: [0xf5f3ef], fog: [0xf5f3ef], fogNear: 8, fogFar: 15, key: 1.4, keyColor: 0xfff3df, ground: 0xe4e2dd, groundY: -0.62 },
  { t: 0.40, bg: [0xf0efec], fog: [0xf0efec], fogNear: 8, fogFar: 15, key: 1.5, keyColor: 0xfff3df, ground: 0xdedbd4, groundY: -0.62 },
  { t: 0.50, bg: [0xd9d5cc], fog: [0xd9d5cc], fogNear: 6, fogFar: 13, key: 1.3, keyColor: 0xfff0dc, ground: 0xb8b3a8, groundY: -0.62 },
  { t: 0.62, bg: [0x0e2438], fog: [0x0e2438], fogNear: 5, fogFar: 12, key: 0.9, keyColor: 0xcfe6ff, ground: 0x0a1b2b, groundY: -0.62 },
  { t: 0.72, bg: [0x123048], fog: [0x123048], fogNear: 5, fogFar: 12, key: 1.0, keyColor: 0xd8ecff, ground: 0x0c2033, groundY: -0.62 },
  { t: 0.80, bg: [0x274257], fog: [0x274257], fogNear: 6, fogFar: 13, key: 1.15, keyColor: 0xffe9c8, ground: 0x1c3547, groundY: -0.62 },
  { t: 0.90, bg: [0xe9e6df], fog: [0xe9e6df], fogNear: 7, fogFar: 14, key: 1.5, keyColor: 0xfff3df, ground: 0xdedbd4, groundY: -0.62 },
  { t: 1.00, bg: [0xf5f3ef], fog: [0xf5f3ef], fogNear: 8, fogFar: 16, key: 1.7, keyColor: 0xfff6e6, ground: 0xe9e7e2, groundY: -0.62 }
];

function smoothstep(a, b, t) {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a || 1)));
  return x * x * (3 - 2 * x);
}

function sampleKeys(keys, field, t, isColor) {
  if (t <= keys[0].t) return isColor ? new THREE.Color(keys[0][field][0]) : keys[0][field];
  if (t >= keys[keys.length - 1].t) return isColor ? new THREE.Color(keys[keys.length - 1][field][0]) : keys[keys.length - 1][field];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t >= a.t && t <= b.t) {
      const local = smoothstep(a.t, b.t, t);
      if (isColor) return lerpColor(a[field][0], b[field][0], local);
      if (Array.isArray(a[field])) return a[field].map((v, i2) => v + (b[field][i2] - v) * local);
      return a[field] + (b[field] - a[field]) * local;
    }
  }
  return keys[keys.length - 1][field];
}

function lerpColor(hexA, hexB, t) {
  const ca = new THREE.Color(hexA), cb = new THREE.Color(hexB);
  return ca.clone().lerp(cb, t);
}

export function initCinematic() {
  const stage = document.getElementById("cineStage");
  const canvas = document.getElementById("cineCanvas");
  if (!stage || !canvas) return null;

  const isSmall = window.innerWidth < 780;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !isSmall;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f3ef);
  scene.fog = new THREE.Fog(0xf5f3ef, 8, 15);

  const camera = new THREE.PerspectiveCamera(32, stage.clientWidth / stage.clientHeight, 0.1, 60);
  camera.position.set(0, 0.85, 7.4);

  // ---- lights ----
  const keyLight = new THREE.DirectionalLight(0xfff3df, 1.4);
  keyLight.position.set(3.2, 4.2, 3.0);
  keyLight.castShadow = !isSmall;
  if (!isSmall) {
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -4; keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4; keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0015;
  }
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xcfe0ff, 0.35);
  fillLight.position.set(-4, 2, -2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
  rimLight.position.set(-2, 1.5, -4);
  scene.add(rimLight);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x1a2430, 0.45);
  scene.add(hemi);

  // ---- ground (soft shadow catcher) ----
  const groundGeo = new THREE.CircleGeometry(9, 48);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xe4e2dd, roughness: 0.95, metalness: 0.0 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.62;
  ground.receiveShadow = !isSmall;
  scene.add(ground);

  // ---- container ----
  const { group: containerGroup, parts, redrawLabel } = buildContainer();
  scene.add(containerGroup);

  // ---- environment reflections (cheap generated equirect) ----
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = buildEnvScene();
  const envRT = pmrem.fromScene(envScene, 0.04);
  scene.environment = envRT.texture;
  envScene.dispose ? envScene.dispose() : null;

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  const tmpColor = new THREE.Color();

  function update(progress) {
    const p = Math.min(1, Math.max(0, progress));

    // camera
    const pos = sampleKeys(CAM_KEYS, "pos", p, false);
    const look = sampleKeys(CAM_KEYS, "look", p, false);
    const baseFov = sampleKeys(CAM_KEYS, "fov", p, false);
    camera.position.set(pos[0], pos[1], pos[2]);
    camera.fov = Math.min(85, fovForAspect(baseFov, camera.aspect));
    camera.updateProjectionMatrix();

    // hero-final framing: the container itself never moves — instead the
    // camera's look-at target is biased to the LEFT of it, which pushes the
    // (unmoved) container toward the right of the frame and leaves the
    // actual left side of the viewport empty for the HTML copy block. On a
    // narrow portrait screen the container reads much bigger on-screen, so
    // the bias is boosted to push it further clear of the text column.
    const heroShift = smoothstep(ACTS.arriveeEnd, 1.0, p);
    const portraitBoost = camera.aspect < 1 ? Math.min(1.9, REF_ASPECT / Math.max(camera.aspect, 0.3)) : 1;
    const lookBias = -1.7 * heroShift * portraitBoost;
    camera.lookAt(look[0] + lookBias, look[1], look[2]);

    // mood
    const bg = sampleKeys(MOOD_KEYS, "bg", p, true);
    const fog = sampleKeys(MOOD_KEYS, "fog", p, true);
    const keyIntensity = sampleKeys(MOOD_KEYS, "key", p, false);
    const keyColor = sampleKeys(MOOD_KEYS, "keyColor", p, true);
    const groundColor = sampleKeys(MOOD_KEYS, "ground", p, true);
    const fogNear = sampleKeys(MOOD_KEYS, "fogNear", p, false);
    const fogFar = sampleKeys(MOOD_KEYS, "fogFar", p, false);
    scene.background = bg;
    scene.fog.color.copy(fog);
    scene.fog.near = fogNear;
    scene.fog.far = fogFar;
    keyLight.intensity = keyIntensity;
    keyLight.color.copy(keyColor);
    groundMat.color.copy(groundColor);

    // explode / reassemble, driven purely by progress
    let explode = 0;
    if (p >= ACTS.chargeStart && p < ACTS.chargeExplodePeak) {
      explode = smoothstep(ACTS.chargeStart, ACTS.chargeExplodePeak, p);
    } else if (p >= ACTS.chargeExplodePeak && p < ACTS.chargeEnd) {
      explode = 1;
    } else if (p >= ACTS.chargeEnd && p < ACTS.departEnd) {
      explode = 1 - smoothstep(ACTS.chargeEnd, ACTS.departEnd, p);
    } else {
      explode = 0;
    }
    applyExplode(parts, explode);

    // slow full-film rotation so the container is never static-dead, plus a
    // touch more spin during the "transport" act to sell the travel feel
    const baseSpin = p * Math.PI * 0.55;
    const travelSpin = smoothstep(ACTS.transportStart, ACTS.transportEnd, p) * (1 - smoothstep(ACTS.suiviEnd, ACTS.arriveeEnd, p)) * 0.4;
    containerGroup.rotation.y = baseSpin + travelSpin;
  }

  function render() { renderer.render(scene, camera); }

  document.fonts && document.fonts.ready && document.fonts.ready.then(redrawLabel);

  return { update, render, resize, camera, scene };
}

function applyExplode(parts, amount) {
  parts.forEach((p) => {
    p.mesh.position.set(
      p.base.x + p.dir.x * p.distance * amount,
      p.base.y + p.dir.y * p.distance * amount,
      p.base.z + p.dir.z * p.distance * amount
    );
    if (p.rotDir) {
      p.mesh.rotation.y = p.rotBase + p.rotDir * amount * 0.35;
    }
  });
}

function buildContainer() {
  const group = new THREE.Group();
  const L = 4.0, W = 1.55, H = 1.7; // length, width, height (proportioned, not literal metres)
  const skin = 0.045;

  const bodyTex = makeBodyTexture();
  const bodyMat = new THREE.MeshStandardMaterial({
    map: bodyTex.texture,
    roughness: 0.55,
    metalness: 0.55,
    envMapIntensity: 0.9
  });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0e2033, roughness: 0.4, metalness: 0.75 });
  const doorMat = new THREE.MeshStandardMaterial({ map: bodyTex.doorTexture, roughness: 0.5, metalness: 0.6, envMapIntensity: 0.9 });

  const parts = [];
  function addPart(mesh, base, dir, distance, rotDir) {
    mesh.position.copy(base);
    mesh.castShadow = true; mesh.receiveShadow = true;
    group.add(mesh);
    parts.push({ mesh, base: base.clone(), dir: dir.clone().normalize(), distance, rotDir: rotDir || 0, rotBase: mesh.rotation.y });
    return mesh;
  }

  // side walls (long faces, +/-Z is width axis... use X=length, Y=height, Z=width)
  const wallGeo = new THREE.BoxGeometry(L, H, skin);
  addPart(new THREE.Mesh(wallGeo, bodyMat), new THREE.Vector3(0, 0, W / 2), new THREE.Vector3(0, 0, 1), 0.42);
  addPart(new THREE.Mesh(wallGeo, bodyMat), new THREE.Vector3(0, 0, -W / 2), new THREE.Vector3(0, 0, -1), 0.42);

  // roof
  const roofGeo = new THREE.BoxGeometry(L, skin, W);
  addPart(new THREE.Mesh(roofGeo, frameMat), new THREE.Vector3(0, H / 2, 0), new THREE.Vector3(0, 1, 0), 0.4);

  // base
  const baseGeo = new THREE.BoxGeometry(L, skin, W);
  addPart(new THREE.Mesh(baseGeo, frameMat), new THREE.Vector3(0, -H / 2, 0), new THREE.Vector3(0, -1, 0), 0.22);

  // front (closed) end
  const endGeo = new THREE.BoxGeometry(skin, H, W);
  addPart(new THREE.Mesh(endGeo, bodyMat), new THREE.Vector3(-L / 2, 0, 0), new THREE.Vector3(-1, 0, 0), 0.4);

  // rear doors (two leaves)
  const doorGeo = new THREE.BoxGeometry(skin, H, W / 2 - 0.02);
  const doorL = addPart(new THREE.Mesh(doorGeo, doorMat), new THREE.Vector3(L / 2, 0, W / 4), new THREE.Vector3(1, 0, 0.3), 0.5, 1);
  const doorR = addPart(new THREE.Mesh(doorGeo, doorMat), new THREE.Vector3(L / 2, 0, -W / 4), new THREE.Vector3(1, 0, -0.3), 0.5, -1);
  [doorL, doorR].forEach((d) => {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, H * 0.55, 0.03), frameMat);
    handle.position.set(0.03, 0, 0);
    d.add(handle);
  });

  // corner posts for a bit of structural read
  const postGeo = new THREE.BoxGeometry(0.06, H + 0.04, 0.06);
  [[-1, 1], [-1, -1], [1, 1], [1, -1]].forEach(([sx, sz]) => {
    const post = new THREE.Mesh(postGeo, frameMat);
    post.castShadow = true;
    post.position.set(sx * (L / 2 - 0.02), 0, sz * (W / 2 - 0.02));
    group.add(post);
  });

  return { group, parts, redrawLabel: bodyTex.redraw };
}

function makeBodyTexture() {
  const w = 1024, h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");

  function paint(fontReady) {
    ctx.fillStyle = "#0b1f33";
    ctx.fillRect(0, 0, w, h);
    const ribs = 40;
    const ribW = w / ribs;
    for (let i = 0; i < ribs; i++) {
      const x = i * ribW;
      const grad = ctx.createLinearGradient(x, 0, x + ribW, 0);
      grad.addColorStop(0, "rgba(255,255,255,0.05)");
      grad.addColorStop(0.5, "rgba(0,0,0,0.16)");
      grad.addColorStop(1, "rgba(255,255,255,0.03)");
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, ribW, h);
    }
    const fam = fontReady ? '"Montserrat", sans-serif' : "sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#c8a96b";
    ctx.font = "600 78px " + fam;
    ctx.fillText("L O U H I C H I", w / 2, h * 0.42);
    ctx.fillStyle = "rgba(228,205,160,0.82)";
    ctx.font = "400 30px " + fam;
    ctx.fillText("L O G I S T I C S", w / 2, h * 0.58);
  }
  paint(false);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  // plain door texture (corrugation only, no wordmark — logo reads on the body only)
  const dCanvas = document.createElement("canvas");
  dCanvas.width = 256; dCanvas.height = 512;
  const dctx = dCanvas.getContext("2d");
  dctx.fillStyle = "#0b1f33";
  dctx.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 10; i++) {
    const x = i * 25.6;
    const grad = dctx.createLinearGradient(x, 0, x + 25.6, 0);
    grad.addColorStop(0, "rgba(255,255,255,0.05)");
    grad.addColorStop(0.5, "rgba(0,0,0,0.16)");
    grad.addColorStop(1, "rgba(255,255,255,0.03)");
    dctx.fillStyle = grad;
    dctx.fillRect(x, 0, 25.6, 512);
  }
  const doorTexture = new THREE.CanvasTexture(dCanvas);
  doorTexture.colorSpace = THREE.SRGBColorSpace;

  return {
    texture,
    doorTexture,
    redraw: () => { paint(true); texture.needsUpdate = true; }
  };
}

function buildEnvScene() {
  const s = new THREE.Scene();
  const grad = new THREE.Mesh(
    new THREE.SphereGeometry(20, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide })
  );
  s.add(grad);
  const l1 = new THREE.Mesh(new THREE.PlaneGeometry(30, 4), new THREE.MeshBasicMaterial({ color: 0xfff3df }));
  l1.position.set(0, 8, -10);
  s.add(l1);
  return s;
}
