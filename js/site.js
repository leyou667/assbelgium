import { initCinematic } from "./cinematic.js";

function smoothstep(a, b, t) {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a || 1)));
  return x * x * (3 - 2 * x);
}
function rangeOpacity(p, start, end, fade) {
  if (p < start - fade || p > end + fade) return 0;
  if (p < start) return smoothstep(start - fade, start, p);
  if (p > end) return 1 - smoothstep(end, end + fade, p);
  return 1;
}

document.addEventListener("DOMContentLoaded", () => {
  // ---- nav: solid once past the first viewport ----
  const nav = document.getElementById("siteNav");
  const onScroll = () => nav.classList.toggle("solid", window.scrollY > window.innerHeight * 0.6);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- mobile menu ----
  const toggle = document.getElementById("navToggle");
  const panel = document.getElementById("mobilePanel");
  toggle.addEventListener("click", () => {
    const open = !panel.classList.contains("open");
    panel.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    panel.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }));

  // ---- reveal-on-scroll for regular sections ----
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); });
  }, { threshold: 0.12 });
  document.querySelectorAll("[data-reveal]").forEach((n) => io.observe(n));

  // ---- contact form (no backend wired yet — see project notes) ----
  const form = document.getElementById("quoteForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = document.getElementById("formStatus");
      status.textContent = window.I18N ? window.I18N.t("contact.formSent") : "Merci, nous revenons vers vous sous 24 h.";
      status.classList.add("ok");
      form.reset();
    });
  }

  // ---- cinematic sequence ----
  const cine = initCinematic();
  const loading = document.getElementById("cineLoading");
  const loadingBar = loading ? loading.querySelector(".bar i") : null;
  const loadingPct = loading ? loading.querySelector(".pct") : null;

  function setLoadingProgress(p) {
    if (loadingBar) loadingBar.style.width = Math.round(p * 100) + "%";
    if (loadingPct) loadingPct.textContent = Math.round(p * 100) + "%";
  }

  const cueLines = Array.from(document.querySelectorAll(".cine-line[data-show]"));
  const cueChips = Array.from(document.querySelectorAll(".cine-hud .chip[data-show]"));
  const heroCopy = document.querySelector(".cine-hero-copy .inner");
  const heroCopyShow = 0.93;
  const scrollCue = document.getElementById("scrollCue");

  function parseShow(el) {
    const [start, end, fade] = el.getAttribute("data-show").split(",").map(Number);
    return { start, end, fade: fade || 0.03 };
  }
  const cueData = cueLines.map((el) => ({ el, ...parseShow(el) }));
  const chipData = cueChips.map((el) => ({ el, ...parseShow(el) }));

  function updateText(p) {
    cueData.forEach(({ el, start, end, fade }) => {
      const o = rangeOpacity(p, start, end, fade);
      el.style.opacity = o;
      el.style.transform = "translateY(" + (14 * (1 - o)) + "px)";
    });
    chipData.forEach(({ el, start, end, fade }) => {
      const o = rangeOpacity(p, start, end, fade);
      el.style.opacity = o;
    });
    const hud = document.querySelector(".cine-hud");
    if (hud) hud.style.opacity = chipData.length ? Math.max(...chipData.map(c => rangeOpacity(p, c.start, c.end, c.fade))) : 0;

    if (heroCopy) {
      const o = smoothstep(heroCopyShow, 1.0, p);
      heroCopy.style.opacity = o;
      heroCopy.style.transform = "translateY(" + (20 * (1 - o)) + "px)";
    }
    if (scrollCue) scrollCue.style.opacity = p < 0.03 ? 0.6 : 0;
  }

  function afterReady() {
    if (loading) {
      loading.style.opacity = "0";
      setTimeout(() => loading.hidden = true, 650);
    }

    if (!cine) return;

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({
        trigger: ".cine-track",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.35,
        onUpdate: (self) => {
          cine.update(self.progress);
          updateText(self.progress);
        }
      });
    } else {
      // Fallback with no GSAP: drive progress from raw scroll math directly.
      const track = document.querySelector(".cine-track");
      const onRaw = () => {
        const rect = track.getBoundingClientRect();
        const total = track.offsetHeight - window.innerHeight;
        const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
        cine.update(p);
        updateText(p);
      };
      window.addEventListener("scroll", onRaw, { passive: true });
      onRaw();
    }

    (function raf() { cine.render(); requestAnimationFrame(raf); })();
    cine.update(0);
    updateText(0);
  }

  // brief, honest loading state: waits for webfont + one render tick (there
  // is no heavy media to preload any more — the container is procedural)
  let progress = 0;
  const tick = () => {
    progress = Math.min(0.92, progress + 0.08);
    setLoadingProgress(progress);
    if (progress < 0.92) requestAnimationFrame(() => setTimeout(tick, 40));
  };
  tick();
  // Race the webfont against a timeout: a blocked/slow font host (offline,
  // ad-blocker, flaky network) must never leave the loader stuck forever.
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  const readyOrTimeout = Promise.race([
    fontsReady,
    new Promise((resolve) => setTimeout(resolve, 2500))
  ]);
  readyOrTimeout.then(() => {
    setLoadingProgress(1);
    setTimeout(afterReady, 180);
  });
});
