(() => {
  "use strict";

  // t() reads the active-language string from i18n.js; falls back to the
  // raw key if i18n.js somehow failed to load, so the site never crashes.
  const t = (key) => (window.I18N && window.I18N.t) ? window.I18N.t(key) : key;

  // ---- icon paths (thin-stroke, matches the Industry design system) ----
  const ICON = {
    ship: ["M3.5 16.5h17l-2 4.5H5.5z", "M6.5 16.5V9.5h11v7", "M12 4.5v5", "M9.5 12.5h5"],
    customs: ["M12 3l7.5 3v5.5c0 4.5-3.2 7.6-7.5 10-4.3-2.4-7.5-5.5-7.5-10V6z", "M9 12l2.2 2.2L15.5 10"],
    truck: ["M2.5 6.5h11v9h-11z", "M13.5 10h3.6l3.4 3.4v2.1h-7z", "M7 19a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8", "M17 19a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8"],
    plane: ["M2.5 12.5L21.5 4.5l-7.5 16-3.2-7.3z", "M10.8 13.2L7 9.6"],
    box: ["M12 3l8 4.5v9L12 21l-8-4.5v-9z", "M4 7.5l8 4.5 8-4.5", "M12 12v9"],
    home: ["M4 10.5L12 4l8 6.5V20H4z", "M9.5 20v-6h5v6"],
    car: ["M3.5 14l1.8-5.2A2 2 0 0 1 7.2 7.5h9.6a2 2 0 0 1 1.9 1.3L20.5 14", "M3.5 14h17v4h-17z", "M6.8 18v1.8", "M17.2 18v1.8"],
    pallet: ["M4 5.5h16v6H4z", "M6.5 11.5v3.5", "M17.5 11.5V15", "M3 18.5h18", "M3 15h18"],
    food: ["M7 3.5v8a2.5 2.5 0 0 0 5 0v-8", "M9.5 11.5V20.5", "M16 3.5c2 1.6 2.6 4 2 7-.4 2-.6 8-.6 10", "M9.5 3.5v4"],
    hazard: ["M12 4l9 15.5H3z", "M12 10v4.2", "M12 16.8v.6"],
    more: ["M6 12h.01", "M12 12h.01", "M18 12h.01", "M3.5 5.5h17v13h-17z"],
    cube: ["M4 7.5h16v9H4z", "M8 7.5v9", "M12 7.5v9", "M16 7.5v9"],
    snow: ["M12 3v18", "M4.2 7.5l15.6 9", "M19.8 7.5l-15.6 9"],
    open: ["M4 9h16v10H4z", "M3 6l9-2.5L21 6"],
    help: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18", "M9.6 9.4a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1 .9-1 1.7", "M12 17.2h.01"]
  };

  // ---- live-tracking teaser (home page) ----
  const ROUTE_STEP_DEFS = [
    { key: "pickup", paths: ICON.truck },
    { key: "sea", paths: ICON.ship },
    { key: "customs", paths: ICON.customs },
    { key: "delivered", paths: ICON.home }
  ];

  const PORTS = ["Anvers", "Zeebruges", "Shanghai", "Ningbo", "Jebel Ali", "Casablanca", "Dakar", "Abidjan", "Lagos", "Douala", "New York", "Autre"];
  const CITIES = ["Bruxelles", "Anvers", "Liège", "Paris", "Rotterdam", "Cologne", "Milan", "Madrid", "Autre"];

  // Full world port / city lists for the "Autre" full-screen search picker
  // (the compact PORTS / CITIES lists above stay the quick-select chips).
  // Place names are never translated (same spelling in fr/nl/en on this site).
  const WORLD_PORTS = [
    "Abidjan", "Alger", "Algésiras", "Anvers", "Auckland", "Balboa (Panama)", "Bandar Abbas", "Bangkok / Laem Chabang",
    "Buenos Aires", "Busan", "Callao (Lima)", "Cartagena", "Casablanca", "Charleston", "Chennai", "Chittagong",
    "Colombo", "Constanța", "Cotonou", "Dakar", "Dammam", "Djeddah", "Djibouti", "Douala", "Durban", "Felixstowe",
    "Gdańsk", "Gdynia", "Gênes", "Gioia Tauro", "Guangzhou", "Haïfa", "Halifax", "Hambourg", "Ho Chi Minh Ville",
    "Hong Kong", "Houston", "Jebel Ali (Dubaï)", "Karachi", "Kaohsiung", "Le Cap", "Le Havre", "Livourne", "Lomé",
    "Long Beach", "Los Angeles", "Lagos", "Manzanillo", "Marseille", "Mombasa", "Montréal", "New York / New Jersey",
    "Nhava Sheva (Mumbai)", "Ningbo", "Norfolk", "Oakland", "Pirée", "Port Klang", "Qingdao", "Rijeka", "Rio de Janeiro",
    "Rotterdam", "Santos", "Savannah", "Shanghai", "Shenzhen", "Singapour", "Sines", "Southampton", "Sydney",
    "Tanger Med", "Tanjung Pelepas", "Tianjin", "Trieste", "Tunis", "Valence", "Vancouver", "Veracruz", "Xiamen",
    "Zeebruges"
  ].sort((a, b) => a.localeCompare(b, "fr"));

  const WORLD_CITIES = [
    "Amsterdam", "Anvers", "Athènes", "Bâle", "Barcelone", "Berlin", "Bilbao", "Birmingham", "Bruxelles", "Bucarest",
    "Budapest", "Charleroi", "Cologne", "Copenhague", "Dublin", "Düsseldorf", "Eindhoven", "Francfort", "Gand",
    "Genève", "Helsinki", "La Haye", "Liège", "Lille", "Lisbonne", "Londres", "Luxembourg", "Lyon", "Madrid",
    "Manchester", "Marseille", "Milan", "Munich", "Naples", "Oslo", "Paris", "Porto", "Prague", "Rome", "Rotterdam",
    "Sofia", "Stockholm", "Strasbourg", "Turin", "Utrecht", "Valence", "Varsovie", "Vienne", "Zurich"
  ].sort((a, b) => a.localeCompare(b, "fr"));

  // ---- tracker demo data: place names / ref codes / vessel & container IDs
  // stay fixed: mode and eta are looked up by index via tracker.demos.N.* ----
  const DEMOS_BASE = [
    { ref: "LL-2026-1847", from: "Shanghai", to: "Anvers", vessel: "MSC Loreto", container: "MSCU 738210-4", stage: 3 },
    { ref: "LL-2026-1923", from: "Casablanca", to: "Bruxelles", vessel: "Grande Lagos", container: "—", stage: 5 },
    { ref: "LL-2026-2014", from: "Lagos", to: "Liège", vessel: "Vol QR-1340", container: "AWB 157-88421", stage: 7 }
  ];
  const demoMode = (i) => t("tracker.demos." + i + ".mode");
  const demoEta = (i) => t("tracker.demos." + i + ".eta");

  const STAGE_COUNT = 8;
  const stageLabel = (i) => t("tracker.stages." + i + ".label");
  const stageDesc = (i) => t("tracker.stages." + i + ".desc");

  const FAQ_COUNT = 6;
  const faqQ = (i) => t("chat.faq." + i + ".q");
  const faqA = (i) => t("chat.faq." + i + ".a");

  // ---- wizard: stable ids per choice, decoupled from the displayed
  // (translated) label, so a language switch mid-form never loses the
  // user's selections or breaks the "selected" highlighting ----
  const CHOICE_ORDER = {
    dir: ["export", "import"],
    mode: ["maritime", "road", "air"],
    goods: ["vehicles", "general", "food", "hazard", "personal", "other"],
    ctype: ["std20", "std40", "hc40", "reefer", "opentop", "unsure"]
  };
  const CHOICE_ICONS = {
    dir: { export: ICON.ship, import: ICON.box },
    mode: { maritime: ICON.ship, road: ICON.truck, air: ICON.plane },
    goods: { vehicles: ICON.car, general: ICON.pallet, food: ICON.food, hazard: ICON.hazard, personal: ICON.home, other: ICON.more },
    ctype: { std20: ICON.cube, std40: ICON.cube, hc40: ICON.cube, reefer: ICON.snow, opentop: ICON.open, unsure: ICON.help }
  };
  const STEP_FIELD_BY_INDEX = { 0: "dir", 1: "mode", 3: "goods", 4: "ctype" };

  function choiceValueLabel(field, id) {
    if (!id) return null;
    return t("wizard.choices." + field + "." + id + ".label");
  }

  function stepDef(i, road) {
    const base = "wizard.stepDefs." + i;
    if (i === 2) {
      return { eyebrow: t(base + ".eyebrow"), q: t(base + ".q"), help: road ? t(base + ".helpRoad") : t(base + ".helpPort") };
    }
    return { eyebrow: t(base + ".eyebrow"), q: t(base + ".q"), help: t(base + ".help") };
  }

  function iconSVG(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
      + paths.map(d => '<path d="' + d + '"></path>').join("")
      + "</svg>";
  }

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  // ---- application state ----
  const state = {
    routeStep: 0,
    chatOpen: false,
    chat: [],
    trackOpen: false,
    demoIdx: 0,
    refInput: "",
    trackNotFound: false,
    wizOpen: false,
    wizStep: 0,
    wizSent: false,
    wizRef: "",
    formError: "",
    portPickerOpen: false,
    portPickerField: null,
    portPickerQuery: "",
    w: { dir: null, mode: null, from: null, to: null, goods: null, ctype: null, qty: 1, name: "", company: "", email: "", phone: "", msg: "" }
  };

  function setW(patch) { Object.assign(state.w, patch); state.formError = ""; }

  function choiceList() {
    const field = STEP_FIELD_BY_INDEX[state.wizStep];
    if (!field) return [];
    return CHOICE_ORDER[field].map((id) => ({
      field, value: id,
      label: choiceValueLabel(field, id),
      sub: t("wizard.choices." + field + "." + id + ".sub"),
      paths: CHOICE_ICONS[field][id]
    }));
  }

  function canNext() {
    const i = state.wizStep, w = state.w;
    if (i === 0) return !!w.dir;
    if (i === 1) return !!w.mode;
    if (i === 2) return !!w.from && !!w.to;
    if (i === 3) return !!w.goods;
    if (i === 4) return !!w.ctype;
    return true;
  }

  function submit() {
    const w = state.w;
    if (!w.name.trim()) { state.formError = t("wizard.errors.name"); renderWizard(); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(w.email)) { state.formError = t("wizard.errors.email"); renderWizard(); return; }
    if (!w.phone.trim()) { state.formError = t("wizard.errors.phone"); renderWizard(); return; }
    state.wizSent = true;
    state.wizRef = "LL-2026-" + (1500 + Math.floor(Math.random() * 800));
    renderWizard();
  }

  function ask(q, a) {
    state.chat.push({ me: true, text: q });
    renderChat();
    setTimeout(() => { state.chat.push({ me: false, text: a }); renderChat(); }, 420);
  }

  // ---- render: route steps (home page live-tracking teaser) ----
  function renderRouteSteps() {
    const host = document.getElementById("routeSteps");
    host.innerHTML = "";
    ROUTE_STEP_DEFS.forEach((r, i) => {
      const active = i === state.routeStep;
      const color = active ? "var(--color-accent-800)" : "var(--color-neutral-500)";
      host.appendChild(el(
        '<div class="route-step">' +
          '<div class="tick"></div>' +
          '<div class="icon" style="color:' + color + '">' + iconSVG(r.paths) + '</div>' +
          '<div class="label" style="color:' + color + '">' + t("tracking.steps." + r.key + ".label") + '</div>' +
          '<div class="note">' + t("tracking.steps." + r.key + ".note") + '</div>' +
        '</div>'
      ));
    });
    const dot = document.querySelector(".progress-line .dot");
    if (dot) dot.style.left = (state.routeStep / ROUTE_STEP_DEFS.length * 100) + "%";
  }

  // ---- render: chat widget ----
  function renderChat() {
    document.getElementById("chatPanel").hidden = !state.chatOpen;
    document.getElementById("chatToggleLabel").textContent = state.chatOpen ? t("chat.toggleCloseLabel") : t("chat.toggleOpenLabel");
    const body = document.getElementById("chatBody");
    body.innerHTML = "";
    state.chat.forEach(m => {
      const b = el('<div class="chat-bubble"></div>');
      if (m.me) b.classList.add("me");
      b.textContent = m.text;
      body.appendChild(b);
    });
    body.scrollTop = body.scrollHeight;
    const chips = document.getElementById("chatChips");
    chips.innerHTML = "";
    for (let i = 0; i < FAQ_COUNT; i++) {
      const q = faqQ(i), a = faqA(i);
      const btn = el('<button type="button" class="chat-chip"></button>');
      btn.textContent = q;
      btn.addEventListener("click", () => ask(q, a));
      chips.appendChild(btn);
    }
  }

  // ---- render: tracker modal ----
  function renderTracker() {
    document.getElementById("trackerOverlay").classList.toggle("open", state.trackOpen);
    const demo = DEMOS_BASE[state.demoIdx];

    const grid = document.getElementById("demoGrid");
    grid.innerHTML = "";
    DEMOS_BASE.forEach((d, i) => {
      const card = el(
        '<button type="button" class="demo-card' + (i === state.demoIdx ? " active" : "") + '">' +
          '<span class="ref">' + d.ref + '</span>' +
          '<span class="route">' + d.from + ' → ' + d.to + '</span>' +
          '<span class="mode">' + demoMode(i) + '</span>' +
        '</button>'
      );
      card.addEventListener("click", () => { state.demoIdx = i; state.trackNotFound = false; renderTracker(); });
      grid.appendChild(card);
    });

    document.getElementById("refInput").value = state.refInput;
    document.getElementById("trackNotFound").hidden = !state.trackNotFound;

    const meta = document.getElementById("trackMeta");
    meta.innerHTML = "";
    [[t("tracker.metaMode"), demoMode(state.demoIdx)], [t("tracker.metaVessel"), demo.vessel], [t("tracker.metaContainer"), demo.container], [t("tracker.metaEta"), demoEta(state.demoIdx)]].forEach(m => {
      meta.appendChild(el('<div><div class="k">' + m[0] + '</div><div class="v">' + m[1] + '</div></div>'));
    });

    const pct = Math.round(((demo.stage + 1) / STAGE_COUNT) * 100);
    document.getElementById("trackPct").textContent = pct + "%";
    document.getElementById("trackFill").style.width = pct + "%";

    const stagesHost = document.getElementById("trackStages");
    stagesHost.innerHTML = "";
    for (let i = 0; i < STAGE_COUNT; i++) {
      const done = i <= demo.stage;
      const lineDone = i < demo.stage;
      const row = el(
        '<div class="track-stage' + (done ? " done" : "") + (lineDone ? " line-done" : "") + '">' +
          '<div class="rail"><span class="stage-dot"></span><span class="line"></span></div>' +
          '<div class="content"><div class="label">' + stageLabel(i) + '</div><div class="note">' + (done ? stageDesc(i) : "") + '</div></div>' +
        '</div>'
      );
      stagesHost.appendChild(row);
    }
  }

  function doTrack() {
    const q = state.refInput.trim().toLowerCase();
    const i = DEMOS_BASE.findIndex(d => d.ref.toLowerCase() === q);
    state.demoIdx = i >= 0 ? i : 0;
    state.trackNotFound = i < 0 && q.length > 0;
    renderTracker();
  }

  // ---- render: port / city picker (full-screen "Autre" search) ----
  function openPortPicker(field) {
    state.portPickerField = field;
    state.portPickerQuery = "";
    state.portPickerOpen = true;
    renderPortPicker();
  }

  function closePortPicker() {
    state.portPickerOpen = false;
    renderPortPicker();
  }

  function renderPortPicker() {
    document.getElementById("portPickerOverlay").classList.toggle("open", state.portPickerOpen);
    if (!state.portPickerOpen) return;
    const road = state.w.mode === "road";
    document.getElementById("portPickerTitle").textContent = road ? t("portPicker.titleCity") : t("portPicker.titlePort");
    document.getElementById("portPickerSearch").value = state.portPickerQuery;
    const source = road ? WORLD_CITIES : WORLD_PORTS;
    const q = state.portPickerQuery.trim().toLowerCase();
    const filtered = q ? source.filter(p => p.toLowerCase().includes(q)) : source;
    const field = state.portPickerField;
    const list = document.getElementById("portPickerList");
    list.innerHTML = "";
    filtered.forEach(p => {
      const sel = state.w[field] === p;
      const chip = el('<button type="button" class="chip' + (sel ? " sel" : "") + '">' + p + '</button>');
      chip.addEventListener("click", () => {
        setW({ [field]: p });
        closePortPicker();
        renderWizard();
      });
      list.appendChild(chip);
    });
    if (!filtered.length) list.appendChild(el('<div class="notice">' + t("portPicker.noResults") + '</div>'));
  }

  // ---- render: wizard ----
  function renderWizard() {
    const overlay = document.getElementById("wizardOverlay");
    overlay.classList.toggle("open", state.wizOpen);
    document.getElementById("wizSent").hidden = !state.wizSent;
    document.getElementById("wizActive").hidden = state.wizSent;
    if (state.wizSent) {
      document.getElementById("wizRef").textContent = state.wizRef;
      return;
    }

    const w = state.w;
    const road = w.mode === "road";
    const stepsHost = document.getElementById("wizSteps");
    stepsHost.innerHTML = "";
    for (let i = 0; i < 6; i++) {
      const btn = el(
        '<button type="button" class="wiz-step-btn' + (i <= state.wizStep ? " done" : "") + (i === state.wizStep ? " current" : "") + '">' +
          '<span class="bar"></span><span class="lbl">' + t("wizard.stepLabels." + i) + '</span>' +
        '</button>'
      );
      btn.addEventListener("click", () => { state.wizStep = i; state.formError = ""; renderWizard(); });
      stepsHost.appendChild(btn);
    }

    const step = stepDef(state.wizStep, road);
    document.getElementById("stepEyebrow").textContent = step.eyebrow;
    document.getElementById("stepQ").textContent = step.q;
    document.getElementById("stepHelp").textContent = step.help;

    const isChoiceStep = [0, 1, 3, 4].indexOf(state.wizStep) >= 0;
    const isRouteStep = state.wizStep === 2;
    const isQtyStep = state.wizStep === 4;
    const isFormStep = state.wizStep === 5;
    const isRecapStep = state.wizStep === 6;

    const choiceGrid = document.getElementById("choiceGrid");
    choiceGrid.hidden = !isChoiceStep;
    choiceGrid.innerHTML = "";
    if (isChoiceStep) {
      choiceList().forEach(c => {
        const sel = w[c.field] === c.value;
        const card = el(
          '<button type="button" class="choice-card blueprint' + (sel ? " sel" : "") + '" data-tilt>' +
            '<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>' +
            '<span class="icon">' + iconSVG(c.paths) + '</span>' +
            '<span class="lbl">' + c.label + '</span>' +
            '<span class="sub">' + c.sub + '</span>' +
          '</button>'
        );
        card.addEventListener("click", () => {
          setW({ [c.field]: c.value });
          const i = state.wizStep;
          if (i < 4) setTimeout(() => { state.wizStep = Math.min(6, i + 1); renderWizard(); }, 180);
          else renderWizard();
        });
        choiceGrid.appendChild(card);
      });
    }

    const routeCols = document.getElementById("routeCols");
    routeCols.hidden = !isRouteStep;
    if (isRouteStep) {
      document.getElementById("fromLabel").textContent = road ? t("wizard.route.fromRoad") : t("wizard.route.fromPort");
      document.getElementById("toLabel").textContent = road ? t("wizard.route.toRoad") : t("wizard.route.toPort");
      const opts = road ? CITIES : PORTS;
      const mkOpts = (field, host) => {
        host.innerHTML = "";
        const current = w[field];
        const isCustom = !!current && opts.indexOf(current) < 0;
        opts.forEach(p => {
          if (p === "Autre") {
            const label = isCustom ? current : t("portPicker.otherLabel");
            const sel = isCustom;
            const chip = el('<button type="button" class="chip' + (sel ? " sel" : "") + '">' + label + '</button>');
            chip.addEventListener("click", () => openPortPicker(field));
            host.appendChild(chip);
            return;
          }
          const sel = current === p;
          const chip = el('<button type="button" class="chip' + (sel ? " sel" : "") + '">' + p + '</button>');
          chip.addEventListener("click", () => { setW({ [field]: p }); renderWizard(); });
          host.appendChild(chip);
        });
      };
      mkOpts("from", document.getElementById("fromOptions"));
      mkOpts("to", document.getElementById("toOptions"));
    }

    const qtyRow = document.getElementById("qtyRow");
    qtyRow.hidden = !isQtyStep;
    if (isQtyStep) {
      document.getElementById("qtyVal").textContent = w.qty;
      document.getElementById("qtyUnit").textContent = w.qty > 1 ? t("wizard.qtyUnitPlural") : t("wizard.qtyUnitSingular");
    }

    const formGrid = document.getElementById("formGrid");
    formGrid.hidden = !isFormStep;
    if (isFormStep) {
      document.getElementById("fName").value = w.name;
      document.getElementById("fCompany").value = w.company;
      document.getElementById("fEmail").value = w.email;
      document.getElementById("fPhone").value = w.phone;
      document.getElementById("fMsg").value = w.msg;
    }

    const recapList = document.getElementById("recapList");
    recapList.hidden = !isRecapStep;
    recapList.innerHTML = "";
    if (isRecapStep) {
      const rows = [
        [t("wizard.recap.sens"), choiceValueLabel("dir", w.dir) || "—", 0],
        [t("wizard.recap.transport"), choiceValueLabel("mode", w.mode) || "—", 1],
        [t("wizard.recap.trajet"), (w.from || "—") + " → " + (w.to || "—"), 2],
        [t("wizard.recap.marchandise"), choiceValueLabel("goods", w.goods) || "—", 3],
        [t("wizard.recap.conteneur"), (choiceValueLabel("ctype", w.ctype) || "—") + " × " + w.qty, 4],
        [t("wizard.recap.contact"), (w.name || "—") + (w.email ? " · " + w.email : ""), 5]
      ];
      rows.forEach(r => {
        const row = el(
          '<div class="recap-row">' +
            '<span class="k">' + r[0] + '</span>' +
            '<span class="v">' + r[1] + '</span>' +
            '<button type="button" class="edit">' + t("wizard.recap.edit") + '</button>' +
          '</div>'
        );
        row.querySelector(".edit").addEventListener("click", () => { state.wizStep = r[2]; state.formError = ""; renderWizard(); });
        recapList.appendChild(row);
      });
    }

    const isLast = state.wizStep === 6;
    const nextBtn = document.getElementById("wizNextBtn");
    nextBtn.textContent = isLast ? t("wizard.submit") : t("wizard.next");
    nextBtn.disabled = !isLast && !canNext();

    const errEl = document.getElementById("wizError");
    errEl.hidden = !state.formError;
    errEl.textContent = state.formError;
  }

  function openWizard(dir) {
    state.wizOpen = true;
    state.wizSent = false;
    if (dir) { state.wizStep = 1; setW({ dir }); }
    else { state.wizStep = 0; }
    renderWizard();
  }

  function resetWizard() {
    state.wizSent = false;
    state.wizStep = 0;
    state.formError = "";
    state.w = { dir: null, mode: null, from: null, to: null, goods: null, ctype: null, qty: 1, name: "", company: "", email: "", phone: "", msg: "" };
    renderWizard();
  }

  // ---- wiring ----
  document.addEventListener("DOMContentLoaded", () => {
    const boot = () => {
      state.chat = [{ me: false, text: t("chat.greeting") }];
      renderRouteSteps();
      renderChat();
      renderTracker();
      renderWizard();

      // Re-render every dynamic (JS-rendered) piece of UI whenever the
      // language changes, so nothing stays stuck in the old language.
      // Everything reads from `state`/`state.w`, which a language switch
      // never touches, so the quote wizard's progress survives untouched.
      if (window.I18N && window.I18N.onChange) {
        window.I18N.onChange(() => {
          if (state.chat.length === 1 && !state.chat[0].me) state.chat[0].text = t("chat.greeting");
          renderRouteSteps();
          renderChat();
          renderTracker();
          renderWizard();
          if (state.portPickerOpen) renderPortPicker();
        });
      }
    };
    if (window.I18N && window.I18N.ready) window.I18N.ready.then(boot);
    else boot();

    // mobile nav toggle (hamburger, shown once .navlinks collapses below 1080px)
    const navToggle = document.getElementById("navToggle");
    const mobileNav = document.getElementById("mobileNav");
    navToggle.addEventListener("click", () => {
      const open = !mobileNav.classList.contains("open");
      mobileNav.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });
    mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }));

    // chat
    document.getElementById("chatToggle").addEventListener("click", () => { state.chatOpen = !state.chatOpen; renderChat(); });
    document.querySelector("[data-close-chat]").addEventListener("click", () => { state.chatOpen = false; renderChat(); });

    // tracker
    document.querySelectorAll("[data-open-tracker]").forEach(b => b.addEventListener("click", () => { state.trackOpen = true; renderTracker(); }));
    document.querySelectorAll("[data-close-tracker]").forEach(b => b.addEventListener("click", () => { state.trackOpen = false; renderTracker(); }));
    document.getElementById("trackerOverlay").addEventListener("click", (e) => { if (e.target.id === "trackerOverlay") { state.trackOpen = false; renderTracker(); } });
    document.getElementById("refInput").addEventListener("input", (e) => { state.refInput = e.target.value; });
    document.getElementById("doTrackBtn").addEventListener("click", doTrack);

    // port / city picker
    document.querySelectorAll("[data-close-portpicker]").forEach(b => b.addEventListener("click", closePortPicker));
    document.getElementById("portPickerOverlay").addEventListener("click", (e) => { if (e.target.id === "portPickerOverlay") closePortPicker(); });
    document.getElementById("portPickerSearch").addEventListener("input", (e) => { state.portPickerQuery = e.target.value; renderPortPicker(); });

    // wizard
    document.querySelectorAll("[data-open-wizard]").forEach(b => b.addEventListener("click", () => openWizard(b.dataset.dir || null)));
    document.querySelectorAll("[data-close-wizard]").forEach(b => b.addEventListener("click", () => { state.wizOpen = false; state.wizSent = false; renderWizard(); }));
    document.getElementById("wizResetBtn").addEventListener("click", resetWizard);
    document.getElementById("wizBackBtn").addEventListener("click", () => { state.wizStep = Math.max(0, state.wizStep - 1); state.formError = ""; renderWizard(); });
    document.getElementById("wizNextBtn").addEventListener("click", () => {
      if (state.wizStep === 6) return submit();
      if (canNext()) { state.wizStep = Math.min(6, state.wizStep + 1); state.formError = ""; renderWizard(); }
    });
    document.getElementById("qtyInc").addEventListener("click", () => { setW({ qty: Math.min(40, state.w.qty + 1) }); renderWizard(); });
    document.getElementById("qtyDec").addEventListener("click", () => { setW({ qty: Math.max(1, state.w.qty - 1) }); renderWizard(); });
    [["fName", "name"], ["fCompany", "company"], ["fEmail", "email"], ["fPhone", "phone"], ["fMsg", "msg"]].forEach(([id, field]) => {
      document.getElementById(id).addEventListener("input", (e) => { setW({ [field]: e.target.value }); });
    });

    // route-step cycle (live tracking teaser)
    setInterval(() => { state.routeStep = (state.routeStep + 1) % 4; renderRouteSteps(); }, 2000);

    // scroll-reveal
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); }), { threshold: 0.08 });
    document.querySelectorAll("[data-reveal]").forEach(n => io.observe(n));

    // parallax — cache each node's document-relative center on load/resize so
    // the scroll handler itself never forces a layout reflow (no
    // getBoundingClientRect while scrolling, only cheap arithmetic).
    let raf = null;
    let parCache = [];
    function cacheParallaxRects() {
      const y = window.scrollY || 0;
      parCache = Array.prototype.map.call(document.querySelectorAll("[data-par]"), (n) => {
        const k = parseFloat(n.getAttribute("data-par")) || 0;
        const r = n.getBoundingClientRect();
        return { node: n, k, centerDoc: r.top + y + r.height / 2 };
      });
    }
    function applyParallax() {
      const y = window.scrollY || 0;
      const mid = y + window.innerHeight / 2;
      parCache.forEach(({ node, k, centerDoc }) => {
        node.style.transform = "translate3d(0," + (-((centerDoc - mid) * k)).toFixed(1) + "px,0)";
      });
    }
    let resizeT = null;
    window.addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(() => { cacheParallaxRects(); applyParallax(); }, 150); });
    window.addEventListener("scroll", () => { if (raf) return; raf = requestAnimationFrame(() => { raf = null; applyParallax(); }); }, { passive: true });
    cacheParallaxRects();
    applyParallax();
    window.addEventListener("load", () => { cacheParallaxRects(); applyParallax(); });

    // 3D tilt on hover
    document.addEventListener("mousemove", (ev) => {
      const target = ev.target;
      const node = target && target.closest ? target.closest("[data-tilt]") : null;
      if (!node) return;
      const r = node.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width - 0.5;
      const py = (ev.clientY - r.top) / r.height - 0.5;
      node.style.transform = "rotateY(" + (px * 7).toFixed(2) + "deg) rotateX(" + (-py * 7).toFixed(2) + "deg) translateZ(14px)";
    });
    document.addEventListener("mouseout", (ev) => {
      const target = ev.target;
      const node = target && target.closest ? target.closest("[data-tilt]") : null;
      if (node) node.style.transform = "";
    });
  });
})();
