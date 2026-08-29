(() => {
  "use strict";

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

  const ROUTE_STEPS = [
    { label: "Pris en charge", note: "Empotage & enlèvement", paths: ICON.truck },
    { label: "En mer", note: "Position suivie en continu", paths: ICON.ship },
    { label: "Douane", note: "Dédouanement & documents", paths: ICON.customs },
    { label: "Livré", note: "Porte-à-porte", paths: ICON.home }
  ];

  const PORTS = ["Anvers", "Zeebruges", "Shanghai", "Ningbo", "Jebel Ali", "Casablanca", "Dakar", "Abidjan", "Lagos", "Douala", "New York", "Autre"];
  const CITIES = ["Bruxelles", "Anvers", "Liège", "Paris", "Rotterdam", "Cologne", "Milan", "Madrid", "Autre"];

  // Full world port / city lists for the "Autre" full-screen search picker
  // (the compact PORTS / CITIES lists above stay the quick-select chips).
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

  const DEMOS = [
    { ref: "LL-2026-1847", from: "Shanghai", to: "Anvers", mode: "Maritime FCL", vessel: "MSC Loreto", container: "MSCU 738210-4", stage: 3, eta: "28 juin 2026" },
    { ref: "LL-2026-1923", from: "Casablanca", to: "Bruxelles", mode: "RORO", vessel: "Grande Lagos", container: "—", stage: 5, eta: "22 juin 2026" },
    { ref: "LL-2026-2014", from: "Lagos", to: "Liège", mode: "Cargo aérien", vessel: "Vol QR-1340", container: "AWB 157-88421", stage: 7, eta: "Livré le 19 juin" }
  ];

  const STAGES = [
    ["Booking confirmé", "Réservation confirmée auprès de la compagnie."],
    ["Pris en charge", "Marchandise empotée et prise en charge."],
    ["Chargé à bord", "Chargé à bord — départ imminent."],
    ["En transit", "En transit — position suivie en continu."],
    ["Arrivé au port", "Arrivé à destination, déchargement en cours."],
    ["Dédouané", "Formalités douanières finalisées."],
    ["En livraison", "En route vers l'adresse de livraison."],
    ["Livré", "Marchandise livrée. Merci de votre confiance."]
  ];

  const FAQ = [
    ["Quels sont vos services ?", "Conteneur maritime (FCL/LCL), RORO, cargo aérien, transport routier, service douane (T1/NCTS, EUR.1, ATR, PLDA), logistique & entreposage, colis & express. Billetterie voyageurs : billets d'avion et de bus longue distance. Point d'envoi DHL agréé."],
    ["Combien coûte un 40' vers Anvers ?", "Cela dépend du port de départ, de la marchandise et de l'incoterm. Un conseiller Louhichi confirme le tarif définitif sous 1 h ouvrée, hors droits de douane & TVA."],
    ["Quels documents pour un export ?", "Facture commerciale, liste de colisage, code HS, et selon la destination : EUR.1, ATR, certificat d'origine. Nous vous assistons sur les incoterms et l'assurance transport."],
    ["Vous êtes joignables où ?", "devis@louhichilogistics.be · +32 472 92 51 06 · [À COMPLÉTER]. TVA BE [À COMPLÉTER]."],
    ["Combien de temps pour un devis ?", "Devis gratuit, sans engagement, réponse en moins d'1 h ouvrée. Tous incoterms : EXW, FOB, CIF, CFR, DAP, DDP, FCA."],
    ["Vous gérez la douane ?", "Oui. Dédouanement export/import, déclarations, codes HS, documents et conformité réglementaire. Nous opérons sous agrément OEA / AEO."]
  ];

  const STEP_DEFS = (road) => [
    { eyebrow: "Étape 1", q: "Que souhaitez-vous faire ?", help: "Choisissez le sens de votre expédition." },
    { eyebrow: "Étape 2", q: "Quel mode de transport ?", help: "Sélectionnez le moyen de transport principal." },
    { eyebrow: "Étape 3", q: "Quel est le trajet ?", help: road ? "Choisissez la ville de départ et d'arrivée." : "Choisissez le port de départ et d'arrivée." },
    { eyebrow: "Étape 4", q: "Que transportez-vous ?", help: "Choisissez la catégorie la plus proche." },
    { eyebrow: "Étape 5", q: "Quel type de conteneur ?", help: "Choisissez le conteneur adapté à votre marchandise." },
    { eyebrow: "Dernière étape", q: "Vos coordonnées", help: "Pour vous envoyer votre cotation. C'est la seule partie à remplir au clavier." },
    { eyebrow: "Récapitulatif", q: "Vérifions ensemble", help: "Tout est correct ? Vous pouvez modifier chaque ligne." }
  ];

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
    lang: "fr",
    routeStep: 0,
    chatOpen: false,
    chat: [{ me: false, text: "Bonjour ! Je suis l'assistant Louhichi. Choisissez une question ci-dessous." }],
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
    const i = state.wizStep, w = state.w;
    const mk = (field) => (label, sub, paths) => ({ label, sub, paths, field, value: label });
    if (i === 0) { const m = mk("dir"); return [m("EXPORTER", "J'envoie vers l'étranger", ICON.ship), m("IMPORTER", "Je reçois de l'étranger", ICON.box)]; }
    if (i === 1) { const m = mk("mode"); return [m("Maritime", "Conteneur par bateau", ICON.ship), m("Routier", "Camion en Europe", ICON.truck), m("Cargo aérien", "Fret par avion", ICON.plane)]; }
    if (i === 3) {
      const m = mk("goods");
      return [m("Véhicules", "Voitures, engins", ICON.car), m("Marchandises générales", "Palettes, cartons", ICON.pallet), m("Alimentaire", "Denrées, boissons", ICON.food),
        m("Matières dangereuses", "ADR / IMO", ICON.hazard), m("Effets personnels", "Déménagement", ICON.home), m("Autre", "Je précise", ICON.more)];
    }
    if (i === 4) {
      const m = mk("ctype");
      return [m("20' Standard", "≈ 28 m³", ICON.cube), m("40' Standard", "≈ 58 m³", ICON.cube), m("40' High Cube", "Volume +", ICON.cube),
        m("Frigorifique", "Reefer / froid", ICON.snow), m("Open Top", "Charge par le haut", ICON.open), m("Je ne sais pas", "On vous conseille", ICON.help)];
    }
    return [];
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
    if (!w.name.trim()) { state.formError = "Merci d'indiquer votre nom."; renderWizard(); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(w.email)) { state.formError = "Email invalide."; renderWizard(); return; }
    if (!w.phone.trim()) { state.formError = "Merci d'indiquer un téléphone."; renderWizard(); return; }
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
    ROUTE_STEPS.forEach((r, i) => {
      const active = i === state.routeStep;
      const color = active ? "var(--color-accent-800)" : "var(--color-neutral-500)";
      host.appendChild(el(
        '<div class="route-step">' +
          '<div class="tick"></div>' +
          '<div class="icon" style="color:' + color + '">' + iconSVG(r.paths) + '</div>' +
          '<div class="label" style="color:' + color + '">' + r.label + '</div>' +
          '<div class="note">' + r.note + '</div>' +
        '</div>'
      ));
    });
    const dot = document.querySelector(".progress-line .dot");
    if (dot) dot.style.left = (state.routeStep / ROUTE_STEPS.length * 100) + "%";
  }

  // ---- render: chat widget ----
  function renderChat() {
    document.getElementById("chatPanel").hidden = !state.chatOpen;
    document.getElementById("chatToggleLabel").textContent = state.chatOpen ? "Fermer l'assistant" : "Assistant Louhichi";
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
    if (!chips.childElementCount) {
      FAQ.forEach(f => {
        const btn = el('<button type="button" class="chat-chip"></button>');
        btn.textContent = f[0];
        btn.addEventListener("click", () => ask(f[0], f[1]));
        chips.appendChild(btn);
      });
    }
  }

  // ---- render: tracker modal ----
  function renderTracker() {
    document.getElementById("trackerOverlay").classList.toggle("open", state.trackOpen);
    const demo = DEMOS[state.demoIdx];

    const grid = document.getElementById("demoGrid");
    grid.innerHTML = "";
    DEMOS.forEach((d, i) => {
      const card = el(
        '<button type="button" class="demo-card' + (i === state.demoIdx ? " active" : "") + '">' +
          '<span class="ref">' + d.ref + '</span>' +
          '<span class="route">' + d.from + ' → ' + d.to + '</span>' +
          '<span class="mode">' + d.mode + '</span>' +
        '</button>'
      );
      card.addEventListener("click", () => { state.demoIdx = i; state.trackNotFound = false; renderTracker(); });
      grid.appendChild(card);
    });

    document.getElementById("refInput").value = state.refInput;
    document.getElementById("trackNotFound").hidden = !state.trackNotFound;

    const meta = document.getElementById("trackMeta");
    meta.innerHTML = "";
    [["Mode", demo.mode], ["Navire / vol", demo.vessel], ["Conteneur", demo.container], ["Arrivée estimée", demo.eta]].forEach(m => {
      meta.appendChild(el('<div><div class="k">' + m[0] + '</div><div class="v">' + m[1] + '</div></div>'));
    });

    const pct = Math.round(((demo.stage + 1) / 8) * 100);
    document.getElementById("trackPct").textContent = pct + "%";
    document.getElementById("trackFill").style.width = pct + "%";

    const stagesHost = document.getElementById("trackStages");
    stagesHost.innerHTML = "";
    STAGES.forEach((s, i) => {
      const done = i <= demo.stage;
      const lineDone = i < demo.stage;
      const row = el(
        '<div class="track-stage' + (done ? " done" : "") + (lineDone ? " line-done" : "") + '">' +
          '<div class="rail"><span class="stage-dot"></span><span class="line"></span></div>' +
          '<div class="content"><div class="label">' + s[0] + '</div><div class="note">' + (done ? s[1] : "") + '</div></div>' +
        '</div>'
      );
      stagesHost.appendChild(row);
    });
  }

  function doTrack() {
    const q = state.refInput.trim().toLowerCase();
    const i = DEMOS.findIndex(d => d.ref.toLowerCase() === q);
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
    const road = state.w.mode === "Routier";
    document.getElementById("portPickerTitle").textContent = road ? "Choisir une ville" : "Choisir un port";
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
    if (!filtered.length) list.appendChild(el('<div class="notice">Aucun résultat.</div>'));
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
    const road = w.mode === "Routier";
    const labels = ["Sens", "Transport", "Trajet", "Marchandise", "Conteneurs", "Coordonnées"];
    const stepsHost = document.getElementById("wizSteps");
    stepsHost.innerHTML = "";
    labels.forEach((l, i) => {
      const btn = el(
        '<button type="button" class="wiz-step-btn' + (i <= state.wizStep ? " done" : "") + (i === state.wizStep ? " current" : "") + '">' +
          '<span class="bar"></span><span class="lbl">' + l + '</span>' +
        '</button>'
      );
      btn.addEventListener("click", () => { state.wizStep = i; state.formError = ""; renderWizard(); });
      stepsHost.appendChild(btn);
    });

    const step = STEP_DEFS(road)[state.wizStep];
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
      document.getElementById("fromLabel").textContent = road ? "Ville / pays de départ" : "Port de départ";
      document.getElementById("toLabel").textContent = road ? "Ville / pays d'arrivée" : "Port d'arrivée";
      const opts = road ? CITIES : PORTS;
      const mkOpts = (field, host) => {
        host.innerHTML = "";
        const current = w[field];
        const isCustom = !!current && opts.indexOf(current) < 0;
        opts.forEach(p => {
          if (p === "Autre") {
            const label = isCustom ? current : "Autre";
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
      document.getElementById("qtyUnit").textContent = w.qty > 1 ? "conteneurs" : "conteneur";
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
        ["Sens", w.dir || "—", 0], ["Transport", w.mode || "—", 1],
        ["Trajet", (w.from || "—") + " → " + (w.to || "—"), 2],
        ["Marchandise", w.goods || "—", 3],
        ["Conteneur", (w.ctype || "—") + " × " + w.qty, 4],
        ["Contact", (w.name || "—") + (w.email ? " · " + w.email : ""), 5]
      ];
      rows.forEach(r => {
        const row = el(
          '<div class="recap-row">' +
            '<span class="k">' + r[0] + '</span>' +
            '<span class="v">' + r[1] + '</span>' +
            '<button type="button" class="edit">Modifier</button>' +
          '</div>'
        );
        row.querySelector(".edit").addEventListener("click", () => { state.wizStep = r[2]; state.formError = ""; renderWizard(); });
        recapList.appendChild(row);
      });
    }

    const isLast = state.wizStep === 6;
    const nextBtn = document.getElementById("wizNextBtn");
    nextBtn.textContent = isLast ? "Envoyer ma demande" : "Suivant";
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
    renderRouteSteps();
    renderChat();
    renderTracker();
    renderWizard();

    // language selector (decorative, as requested by the client)
    document.querySelectorAll(".langs button").forEach(btn => {
      btn.addEventListener("click", () => {
        state.lang = btn.dataset.lang;
        document.querySelectorAll(".langs button").forEach(b => b.classList.toggle("active", b === btn));
      });
    });

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
