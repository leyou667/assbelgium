(() => {
  "use strict";

  const SUPPORTED = ["fr", "nl", "en"];
  const DEFAULT_LANG = "fr";
  const STORAGE_KEY = "louhichi_lang";
  const IS_DEV = location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.protocol === "file:";

  const dicts = {};
  let currentLang = DEFAULT_LANG;
  const changeCallbacks = [];
  let resolveReady;
  const readyPromise = new Promise((r) => { resolveReady = r; });

  function flattenKeys(obj, prefix, out) {
    if (Array.isArray(obj)) {
      obj.forEach((v, i) => flattenKeys(v, prefix + "." + i, out));
    } else if (obj && typeof obj === "object") {
      for (const k in obj) flattenKeys(obj[k], prefix ? prefix + "." + k : k, out);
    } else if (prefix) {
      out.push(prefix);
    }
    return out;
  }

  function getByPath(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  function detectInitialLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.indexOf(saved) >= 0) return saved;
    } catch (e) { /* localStorage unavailable (private mode, etc.) — ignore */ }
    const nav = ((navigator.language || navigator.userLanguage || DEFAULT_LANG) + "").slice(0, 2).toLowerCase();
    return SUPPORTED.indexOf(nav) >= 0 ? nav : DEFAULT_LANG;
  }

  function t(key) {
    let v = getByPath(dicts[currentLang], key);
    if (v === undefined) {
      console.warn('[i18n] missing key "' + key + '" for lang "' + currentLang + '" — falling back to fr');
      v = getByPath(dicts[DEFAULT_LANG], key);
    }
    return v === undefined ? key : v;
  }

  function checkCoverage() {
    if (!IS_DEV || !dicts.fr) return;
    // _readme is fr-only maintenance documentation, not a translatable string.
    const frKeys = flattenKeys(dicts.fr, "", []).filter((k) => k.indexOf("_readme") !== 0);
    ["nl", "en"].forEach((lang) => {
      if (!dicts[lang]) return;
      const missing = frKeys.filter((k) => getByPath(dicts[lang], k) === undefined);
      if (missing.length) {
        console.warn("[i18n] " + missing.length + " key(s) present in fr.json but missing in " + lang + ".json:", missing);
      }
    });
  }

  function applyToDom(root) {
    root = root || document;
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      el.innerHTML = t(el.getAttribute("data-i18n"));
    });
    root.querySelectorAll("*").forEach((el) => {
      if (!el.attributes || !el.attributes.length) return;
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        if (attr.name.indexOf("data-i18n-attr-") === 0) {
          el.setAttribute(attr.name.slice("data-i18n-attr-".length), t(attr.value));
        }
      }
    });
  }

  function updateHeadAndLangButtons(lang) {
    document.documentElement.setAttribute("lang", lang);
    document.title = t("meta.title");
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t("meta.description"));
    document.querySelectorAll(".langs button[data-lang]").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
    });
  }

  function domReady() {
    return new Promise((resolve) => {
      if (document.readyState !== "loading") resolve();
      else document.addEventListener("DOMContentLoaded", resolve, { once: true });
    });
  }

  function loadDict(lang) {
    return fetch("i18n/" + lang + ".json", { cache: "no-cache" }).then((res) => res.json());
  }

  // Fade the visible content out a touch, swap every translated string while
  // hidden, then fade back in. ~90ms out + instant swap + ~130ms in, well
  // under the 250ms budget, and only opacity is touched so no element is
  // ever removed/recreated — focus and form state survive untouched.
  function setLangWithFade(lang) {
    if (SUPPORTED.indexOf(lang) < 0) lang = DEFAULT_LANG;
    if (lang === currentLang) return;
    currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }

    const body = document.body;
    body.style.transition = "opacity 90ms ease";
    body.style.opacity = "0.15";
    window.setTimeout(() => {
      updateHeadAndLangButtons(lang);
      applyToDom(document);
      changeCallbacks.forEach((cb) => { try { cb(lang); } catch (e) { console.error(e); } });
      requestAnimationFrame(() => {
        body.style.transition = "opacity 130ms ease";
        body.style.opacity = "1";
      });
    }, 90);
  }

  function onChange(cb) {
    if (typeof cb === "function") changeCallbacks.push(cb);
  }

  async function init() {
    const [fr, nl, en] = await Promise.all([loadDict("fr"), loadDict("nl"), loadDict("en")]);
    dicts.fr = fr; dicts.nl = nl; dicts.en = en;
    await domReady();
    checkCoverage();
    currentLang = detectInitialLang();
    updateHeadAndLangButtons(currentLang);
    applyToDom(document);
    document.querySelectorAll(".langs button[data-lang]").forEach((b) => {
      b.addEventListener("click", () => setLangWithFade(b.getAttribute("data-lang")));
    });
    resolveReady();
  }

  init();

  window.I18N = {
    t,
    getLang: () => currentLang,
    setLang: setLangWithFade,
    onChange,
    ready: readyPromise
  };
})();
