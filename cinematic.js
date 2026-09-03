(() => {
  "use strict";

  const section = document.getElementById("cinematic");
  if (!section) return; // section not present on this page

  const t = (key) => (window.I18N && window.I18N.t) ? window.I18N.t(key) : key;

  const FRAME_COUNT = 284;
  const FRAME_BASE = "assets/cinematic/frames/frame_";
  const FRAME_EXT = ".webp";
  const frameSrc = (i) => FRAME_BASE + String(i + 1).padStart(4, "0") + FRAME_EXT;

  // Matches the concatenated extraction order: 71 frames per scene (see
  // README in the handoff package — chargement / blueprint / navire / avion).
  const SCENE_BOUNDS = [
    { key: "loading", start: 0, end: 70 },
    { key: "blueprint", start: 71, end: 141 },
    { key: "vessel", start: 142, end: 212 },
    { key: "air", start: 213, end: 283 }
  ];

  const canvas = document.getElementById("cinematicCanvas");
  const ctx = canvas.getContext("2d");
  const track = document.getElementById("cinematicTrack");
  const progressBar = document.getElementById("cinematicProgress");
  const sceneLabel = document.getElementById("cinematicSceneLabel");
  const loadingEl = document.getElementById("cinematicLoading");
  const loadingFill = document.getElementById("cinematicLoadingFill");
  const loadingText = document.getElementById("cinematicLoadingText");

  const images = new Array(FRAME_COUNT);
  const loaded = new Array(FRAME_COUNT).fill(false);
  let loadedCount = 0;
  let currentDrawnFrame = -1;
  let lastProgress = 0;
  let started = false;
  let dpr = Math.max(1, window.devicePixelRatio || 1);

  function currentTargetIndex() {
    return Math.min(FRAME_COUNT - 1, Math.floor(lastProgress * FRAME_COUNT));
  }

  function updateLoadingUI() {
    const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
    if (loadingFill) loadingFill.style.width = pct + "%";
    if (loadingText) loadingText.textContent = t("cinematic.loadingLabel") + " — " + pct + "%";
    if (loadedCount >= FRAME_COUNT && loadingEl) loadingEl.classList.add("hide");
  }

  function drawFrame(index, force) {
    if (index === currentDrawnFrame && !force) return;
    const img = images[index];
    if (!img || !img.complete || !img.naturalWidth) return;
    currentDrawnFrame = index;

    // cover-fit: fill the canvas, cropped to center, aspect preserved
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);

    const scene = SCENE_BOUNDS.find((s) => index >= s.start && index <= s.end);
    if (scene) {
      const label = t("cinematic.scenes." + scene.key);
      if (sceneLabel.textContent !== label) sceneLabel.textContent = label;
      sceneLabel.classList.add("show");
    }
  }

  // Draw the closest already-loaded frame at or before `index`, so scrubbing
  // ahead of the download never shows a blank canvas.
  function drawNearest(index) {
    for (let i = index; i >= 0; i--) {
      if (loaded[i]) { drawFrame(i); return; }
    }
  }

  function loadFrame(i) {
    if (images[i]) return;
    const img = new Image();
    img.onload = () => {
      loaded[i] = true;
      loadedCount++;
      updateLoadingUI();
      drawNearest(currentTargetIndex());
    };
    img.src = frameSrc(i);
    images[i] = img;
  }

  function startLoading() {
    if (started) return;
    started = true;
    updateLoadingUI();
    loadFrame(0); // instant poster
    for (let i = 1; i < FRAME_COUNT; i++) loadFrame(i);
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    if (currentDrawnFrame >= 0) drawFrame(currentDrawnFrame, true);
  }

  function onScroll() {
    const rect = track.getBoundingClientRect();
    const trackHeight = track.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const inRange = trackHeight > 0 && scrolled > 0 && scrolled < trackHeight;
    let progress = trackHeight > 0 ? scrolled / trackHeight : 0;
    progress = Math.max(0, Math.min(1, progress));
    lastProgress = progress;

    if (progressBar) {
      progressBar.style.width = (progress * 100) + "%";
      progressBar.style.opacity = inRange ? "1" : "0";
    }

    drawNearest(currentTargetIndex());
    if (!inRange) sceneLabel.classList.remove("show");
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener("resize", () => {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    resizeCanvas();
  });

  // Start downloading the sequence well before the visitor actually reaches
  // it, instead of blocking the whole page's initial load on ~9MB of frames.
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { startLoading(); io.disconnect(); }
    });
  }, { rootMargin: "1200px 0px 1200px 0px" });

  document.addEventListener("DOMContentLoaded", () => {
    resizeCanvas();
    io.observe(section);
    if (window.I18N && window.I18N.onChange) {
      window.I18N.onChange(() => {
        if (currentDrawnFrame >= 0) drawFrame(currentDrawnFrame, true);
        updateLoadingUI();
      });
    }
  });
})();
