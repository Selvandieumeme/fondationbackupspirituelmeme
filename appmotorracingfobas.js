
/* ============================================================
   FOBAS MOTO RACING 3D
   Fichier : appmotorracingfobas.js
   Engine : Three.js + secours Canvas 2D
   Fonctionnalités :
   - 35 missions progressives
   - 20 motos, achat et sélection
   - Course contre 3 adversaires IA
   - Accélération, frein, nitro, direction, pause
   - Garage, peinture, améliorations, championnat
   - Profil joueur, résultats, XP, crédits
   - Sauvegarde IndexedDB avec secours localStorage
   - Compatible Android / commandes tactiles
   ============================================================ */

(() => {
  "use strict";

  const VERSION = "4.0.0";
  const $ = id => document.getElementById(id);
  const all = selector => [...document.querySelectorAll(selector)];
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (min, max) => min + Math.random() * (max - min);

  const app = $("motoApp");
  if (!app || app.dataset.fobasEngine === VERSION) return;
  app.dataset.fobasEngine = VERSION;

  const STORAGE_KEY = "FOBAS_MOTO_RACING_3D_SAVE_V4";
  const DB_NAME = "FOBAS_MOTO_RACING_DB";
  const DB_STORE = "progress";

  const COLORS = [
    "#e53935", "#1565c0", "#ffb300", "#00a86b",
    "#8e24aa", "#f5f5f5", "#212121", "#ff6d00",
    "#00acc1", "#ec407a"
  ];

  const missions = Array.from({ length: 35 }, (_, i) => {
    const level = i + 1;
    const difficulty = level <= 5 ? "Facile"
      : level <= 15 ? "Intermédiaire"
      : level <= 25 ? "Difficile" : "Expert";

    return {
      id: level,
      name: [
        "Premiers tours", "La route s'ouvre", "Pilote débutant",
        "Défi du littoral", "Première victoire"
      ][i] || `Mission ${String(level).padStart(2, "0")}`,
      location: [
        "Port-de-Paix", "Route côtière", "Gonaïves",
        "Circuit tropical", "Route des champions"
      ][i % 5],
      difficulty,
      laps: level < 6 ? 2 : level < 20 ? 3 : 4,
      reward: 100 + level * 45,
      xp: 60 + level * 25,
      target: level < 6 ? 95 : level < 20 ? 125 : 155
    };
  });

  const bikes = Array.from({ length: 20 }, (_, i) => {
    const n = i + 1;
    const tier = Math.floor(i / 4);
    return {
      id: n,
      name: [
        "Street 125", "Urban Racer", "Road 150", "Sport 180",
        "Falcon 200", "Racing 220", "Thunder 250", "Storm 300",
        "Viper 350", "Nitro 400", "Phantom 450", "Predator 500",
        "Titan 600", "Hurricane 650", "Velocity 750",
        "Superbike 850", "Apex 900", "Raptor 1000",
        "Legend 1100", "FOBAS Hyper 1200"
      ][i],
      price: i === 0 ? 0 : 450 + i * 430,
      speed: 95 + tier * 15 + (i % 4) * 4,
      accel: 55 + tier * 8 + (i % 4) * 3,
      handling: 60 + tier * 6 + (i % 4) * 4,
      braking: 55 + tier * 5 + (i % 4) * 3,
      nitro: 50 + tier * 7 + (i % 4) * 3,
      color: COLORS[i % COLORS.length]
    };
  });

  const defaultSave = () => ({
    version: VERSION,
    player: {
      name: "Pilote FOBAS",
      country: "Haïti",
      level: 1,
      xp: 0,
      credits: 2500,
      wins: 0,
      races: 0,
      championshipPoints: 0,
      bestPosition: 4
    },
    ownedBikes: [1],
    selectedBike: 1,
    upgrades: {},
    paint: {},
    completedMissions: [],
    raceResults: [],
    settings: {
      tilt: false,
      vibration: true,
      reducedEffects: false,
      graphics: "high"
    },
    championship: { races: 0, wins: 0, points: 0 }
  });

  let save = defaultSave();
  let db = null;
  let saveQueue = Promise.resolve();
  let currentScreen = "homeScreen";
  let selectedMission = 1;
  let selectedBikeId = 1;
  let race = null;
  let animationId = 0;
  let lastFrame = 0;
  let renderer = null;
  let scene = null;
  let camera = null;
  let threeReady = false;
  let threeLoading = false;
  let fallbackContext = null;
  let raceCanvas = $("raceCanvas");
  let toastTimer = null;
  let input = { gas: false, brake: false, left: false, right: false, nitro: false };
  let keys = Object.create(null);
  let profileEditing = false;

  function notify(message, duration = 2600) {
    const el = $("appToast");
    if (!el) {
      console.log("[FOBAS]", message);
      return;
    }
    el.textContent = message;
    el.classList.add("show");
    el.setAttribute("role", "status");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), duration);
  }

  function money(amount) {
    return `${Math.max(0, Math.floor(amount)).toLocaleString("fr-FR")} crédits`;
  }

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = String(value);
  }

  function setScreen(id) {
    const screen = $(id);
    if (!screen) {
      notify(`Écran introuvable : ${id}`);
      return;
    }

    all("[id$='Screen']").forEach(el => {
      el.hidden = el.id !== id;
      el.classList.toggle("active", el.id === id);
    });

    currentScreen = id;

    all("[data-nav]").forEach(btn => {
      const target = btn.dataset.nav;
      btn.classList.toggle(
        "active",
        target === id || target === id.replace("Screen", "")
      );
    });

    if (id === "garageScreen") renderGarage();
    if (id === "careerScreen") renderCareer();
    if (id === "championshipScreen") renderChampionship();
    if (id === "homeScreen") renderHome();

    if (id === "raceScreen") {
      ensure3D();
      if (race && !race.finished && !race.paused) startLoop();
    } else {
      stopLoop();
    }
  }

  /* ======================== SAUVEGARDE ======================== */

  function openDatabase() {
    return new Promise(resolve => {
      if (!("indexedDB" in window)) return resolve(null);

      let request;
      try {
        request = indexedDB.open(DB_NAME, 1);
      } catch (_) {
        return resolve(null);
      }

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(DB_STORE)) {
          database.createObjectStore(DB_STORE);
        }
      };

      request.onsuccess = () => {
        db = request.result;
        resolve(db);
      };
      request.onerror = () => resolve(null);
    });
  }

  function loadSavedData() {
    return new Promise(resolve => {
      let local = null;

      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) local = JSON.parse(raw);
      } catch (_) {}

      if (!db) {
        if (local && typeof local === "object") {
          save = mergeSave(local);
        }
        return resolve();
      }

      try {
        const tx = db.transaction(DB_STORE, "readonly");
        const req = tx.objectStore(DB_STORE).get("main");

        req.onsuccess = () => {
          const stored = req.result;
          if (stored && typeof stored === "object") {
            save = mergeSave(stored);
          } else if (local && typeof local === "object") {
            save = mergeSave(local);
          }
          resolve();
        };
        req.onerror = () => {
          if (local) save = mergeSave(local);
          resolve();
        };
      } catch (_) {
        if (local) save = mergeSave(local);
        resolve();
      }
    });
  }

  function mergeSave(data) {
    const base = defaultSave();
    return {
      ...base,
      ...data,
      player: { ...base.player, ...(data.player || {}) },
      settings: { ...base.settings, ...(data.settings || {}) },
      championship: { ...base.championship, ...(data.championship || {}) },
      ownedBikes: Array.isArray(data.ownedBikes) ? data.ownedBikes : [1],
      completedMissions: Array.isArray(data.completedMissions)
        ? data.completedMissions : [],
      raceResults: Array.isArray(data.raceResults) ? data.raceResults : [],
      upgrades: data.upgrades && typeof data.upgrades === "object"
        ? data.upgrades : {},
      paint: data.paint && typeof data.paint === "object" ? data.paint : {}
    };
  }

  function persist() {
    save.version = VERSION;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch (_) {}

    if (!db) return Promise.resolve();

    saveQueue = saveQueue.then(() => new Promise(resolve => {
      try {
        const tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).put(save, "main");
        tx.oncomplete = resolve;
        tx.onerror = resolve;
        tx.onabort = resolve;
      } catch (_) {
        resolve();
      }
    }));

    return saveQueue;
  }

  /* ======================== PROFIL ============================ */

  function renderHome() {
    const p = save.player;
    setText("headerPlayerName", p.name);
    setText("profileNameDisplay", p.name);
    setText("profileRankDisplay", rankName(p.level));
    setText("profileCountryDisplay", p.country);
    setText("profileLevelDisplay", p.level);
    setText("homeLevel", p.level);
    setText("homeWins", p.wins);
    setText("homeRaces", p.races);
    setText("homeMissions", save.completedMissions.length);
    setText("creditDisplay", money(p.credits));

    const bike = getBike(save.selectedBike);
    setText("homeBikeName", bike.name);
    setText("homeBikeDescription",
      `Vitesse ${bike.speed} • Accélération ${bike.accel}`);

    const art = $("homeBikeArt");
    if (art) {
      art.style.color = save.paint[bike.id] || bike.color;
      art.style.setProperty("--bike-color", save.paint[bike.id] || bike.color);
    }

    const form = $("profileEditForm");
    if (form) form.hidden = !profileEditing;

    const nameInput = $("playerNameInput");
    const countrySelect = $("playerCountrySelect");
    if (profileEditing) {
      if (nameInput) nameInput.value = p.name;
      if (countrySelect) countrySelect.value = p.country;
    }
  }

  function rankName(level) {
    if (level >= 30) return "Légende";
    if (level >= 20) return "Champion";
    if (level >= 12) return "Pilote professionnel";
    if (level >= 6) return "Pilote confirmé";
    return "Débutant";
  }

  function beginProfileEdit() {
    profileEditing = true;
    renderHome();
  }

  function saveProfile() {
    const name = ($("playerNameInput")?.value || "").trim();
    const country = $("playerCountrySelect")?.value || save.player.country;

    if (!name) {
      notify("Entre un nom de pilote valide.");
      return;
    }

    save.player.name = name.slice(0, 30);
    save.player.country = country;
    profileEditing = false;
    persist();
    renderHome();
    notify("Profil enregistré !");
  }

  /* ======================== CARRIÈRE ========================== */

  function nextMission() {
    return missions.find(m => !save.completedMissions.includes(m.id)) || null;
  }

  function renderCareer() {
    const p = save.player;
    const xpRequired = p.level * 300;
    const progress = clamp((p.xp / xpRequired) * 100, 0, 100);

    setText("careerLevel", p.level);
    setText("xpDisplay", p.xp);
    setText("xpNextDisplay", xpRequired);
    setText("completedMissionCount", save.completedMissions.length);
    setText("bestCareerPosition", p.bestPosition === 4 ? "—" : p.bestPosition);
    setText("careerPoints", p.championshipPoints);

    const bar = $("xpBar");
    if (bar) bar.style.width = `${progress}%`;

    const progressEl = $("xpProgress");
    if (progressEl) {
      progressEl.setAttribute("aria-valuenow", String(Math.round(progress)));
      progressEl.style.setProperty("--progress", `${progress}%`);
    }

    setText("careerMessage",
      nextMission()
        ? `Prochaine mission : ${nextMission().name}`
        : "Toutes les missions sont terminées !");

    const list = $("raceList");
    if (!list) return;

    list.replaceChildren();

    missions.forEach(mission => {
      const completed = save.completedMissions.includes(mission.id);
      const unlocked = mission.id === 1 ||
        save.completedMissions.includes(mission.id - 1);

      const card = document.createElement("button");
      card.type = "button";
      card.className = "race-mission-card";
      card.dataset.missionId = String(mission.id);
      card.disabled = !unlocked;
      card.setAttribute("aria-label",
        `Mission ${mission.id}: ${mission.name}`);

      const title = document.createElement("strong");
      title.textContent = `${mission.id}. ${mission.name}`;

      const info = document.createElement("span");
      info.textContent =
        `${mission.location} • ${mission.laps} tours • ${mission.difficulty}`;

      const status = document.createElement("span");
      status.textContent = completed ? "✓ Terminée"
        : unlocked ? `Récompense : ${money(mission.reward)}`
        : "🔒 Termine la mission précédente";

      card.append(title, info, status);
      card.addEventListener("click", () => {
        if (!unlocked) return notify("Termine la mission précédente d'abord.");
        selectedMission = mission.id;
        startRace(mission.id);
      });

      list.appendChild(card);
    });
  }

  /* ======================== GARAGE ============================ */

  function getBike(id) {
    return bikes.find(b => b.id === Number(id)) || bikes[0];
  }

  function isOwned(id) {
    return save.ownedBikes.includes(Number(id));
  }

  function bikeStats(bike) {
    const up = save.upgrades[bike.id] || {};
    return {
      speed: bike.speed + (up.speed || 0) * 5,
      accel: bike.accel + (up.accel || 0) * 4,
      handling: bike.handling + (up.handling || 0) * 4,
      braking: bike.braking + (up.braking || 0) * 4,
      nitro: bike.nitro + (up.nitro || 0) * 5
    };
  }

  function renderGarage() {
    const bike = getBike(selectedBikeId);
    const owned = isOwned(bike.id);
    const stats = bikeStats(bike);

    setText("garageBikeName", bike.name);
    setText("bikeOwnedBadge", owned ? "Possédée" : money(bike.price));
    setText("statSpeed", stats.speed);
    setText("statAccel", stats.accel);
    setText("statHandling", stats.handling);
    setText("statBraking", stats.braking);
    setText("statNitro", stats.nitro);

    const art = $("garageBikeArt");
    if (art) {
      art.style.color = save.paint[bike.id] || bike.color;
      art.style.setProperty("--bike-color", save.paint[bike.id] || bike.color);
    }

    const shop = $("bikeShopList");
    if (shop) {
      shop.replaceChildren();

      bikes.forEach(item => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "bike-shop-card";
        button.classList.toggle("selected", item.id === selectedBikeId);
        button.dataset.bikeId = String(item.id);

        const name = document.createElement("strong");
        name.textContent = item.name;

        const detail = document.createElement("span");
        detail.textContent = isOwned(item.id)
          ? (save.selectedBike === item.id ? "Moto active" : "Possédée")
          : money(item.price);

        button.append(name, detail);
        button.addEventListener("click", () => {
          selectedBikeId = item.id;
          renderGarage();
        });
        shop.appendChild(button);
      });
    }

    renderUpgrades(bike);
    renderPaints(bike);
  }

  function renderUpgrades(bike) {
    const list = $("upgradeList");
    if (!list) return;

    list.replaceChildren();

    const upgradeTypes = [
      ["speed", "Vitesse maximale"],
      ["accel", "Accélération"],
      ["handling", "Maniabilité"],
      ["braking", "Freinage"],
      ["nitro", "Nitro"]
    ];

    upgradeTypes.forEach(([key, label]) => {
      const level = (save.upgrades[bike.id] || {})[key] || 0;
      const price = 250 + level * 300 + bike.id * 25;
      const row = document.createElement("div");
      row.className = "upgrade-row";

      const title = document.createElement("span");
      title.textContent = `${label} — Niveau ${level}/5`;

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = level >= 5 ? "MAX" : `Améliorer (${price})`;
      button.disabled = !isOwned(bike.id) || level >= 5;
      button.addEventListener("click", () => {
        if (!isOwned(bike.id)) return notify("Achète cette moto avant de l'améliorer.");
        if (save.player.credits < price) return notify("Crédits insuffisants.");

        save.player.credits -= price;
        save.upgrades[bike.id] ||= {};
        save.upgrades[bike.id][key] = level + 1;
        persist();
        renderGarage();
        renderHome();
        notify(`${label} amélioré !`);
      });

      row.append(title, button);
      list.appendChild(row);
    });
  }

  function renderPaints(bike) {
    const list = $("paintOptions");
    if (!list) return;

    list.replaceChildren();

    COLORS.forEach(color => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "paint-swatch";
      button.title = `Peinture ${color}`;
      button.style.background = color;
      button.setAttribute("aria-label", `Choisir la couleur ${color}`);
      button.addEventListener("click", () => {
        if (!isOwned(bike.id)) return notify("Sélectionne d'abord une moto possédée.");
        save.paint[bike.id] = color;
        renderGarage();
        persist();
      });
      list.appendChild(button);
    });
  }

  function buyOrSelectBike() {
    const bike = getBike(selectedBikeId);

    if (!isOwned(bike.id)) {
      if (save.player.credits < bike.price) {
        return notify("Tu n'as pas assez de crédits pour acheter cette moto.");
      }

      save.player.credits -= bike.price;
      save.ownedBikes.push(bike.id);
      save.selectedBike = bike.id;
      persist();
      renderGarage();
      renderHome();
      notify(`${bike.name} achetée avec succès !`);
      return;
    }

    save.selectedBike = bike.id;
    persist();
    renderGarage();
    renderHome();
    notify(`${bike.name} sélectionnée !`);
  }

  /* ======================== CHAMPIONNAT ======================= */

  function renderChampionship() {
    setText("championPoints", save.championship.points);
    setText("championWins", save.championship.wins);
    setText("championRaces", save.championship.races);
    setText("firstPlaceReward", money(1000));
    setText("secondPlaceReward", money(650));
    setText("thirdPlaceReward", money(350));

    const board = $("leaderboard");
    if (!board) return;

    const entries = [
      {
        name: save.player.name,
        points: save.championship.points,
        isPlayer: true
      },
      { name: "MEME Selvandieu — IA", points: 1800 },
      { name: "FOBAS Racer — IA", points: 1300 },
      { name: "Champion Turbo — IA", points: 950 }
    ].sort((a, b) => b.points - a.points);

    board.replaceChildren();

    entries.forEach((entry, index) => {
      const row = document.createElement("div");
      row.className = "leaderboard-row";

      const position = document.createElement("strong");
      position.textContent = `#${index + 1}`;

      const name = document.createElement("span");
      name.textContent = entry.name;

      const points = document.createElement("b");
      points.textContent = `${entry.points} pts`;

      row.append(position, name, points);
      board.appendChild(row);
    });
  }

  /* ======================== THREE.JS ========================== */

  function loadThree() {
    return new Promise((resolve, reject) => {
      if (window.THREE) return resolve(window.THREE);
      if (threeLoading) {
        const timer = setInterval(() => {
          if (window.THREE) {
            clearInterval(timer);
            resolve(window.THREE);
          }
        }, 100);
        setTimeout(() => {
          clearInterval(timer);
          reject(new Error("Three.js indisponible"));
        }, 10000);
        return;
      }

      threeLoading = true;
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js";
      script.async = true;
      script.onload = () => {
        threeLoading = false;
        window.THREE ? resolve(window.THREE) : reject(new Error("Three.js non chargé"));
      };
      script.onerror = () => {
        threeLoading = false;
        reject(new Error("Impossible de charger Three.js"));
      };
      document.head.appendChild(script);
    });
  }

  function ensure3D() {
    if (threeReady || threeLoading) return;
    threeLoading = true;

    loadThree().then(THREE => {
      threeLoading = false;
      initThree(THREE);
      threeReady = true;
      if (race) drawThreeRace();
    }).catch(() => {
      threeLoading = false;
      initFallback();
      notify("Mode graphique de secours activé. Vérifie la connexion pour la 3D.");
    });
  }

  function makeBikeMesh(THREE, color, scale = 1) {
    const group = new THREE.Group();
    const paint = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.55,
      roughness: 0.35
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x17191b, metalness: 0.2, roughness: 0.75
    });
    const metal = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa, metalness: 0.85, roughness: 0.25
    });
    const light = new THREE.MeshStandardMaterial({
      color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.45
    });

    function box(w, h, d, material, x, y, z) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w * scale, h * scale, d * scale),
        material
      );
      mesh.position.set(x * scale, y * scale, z * scale);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    }

    function cylinder(radius, length, material, x, y, z, rotationZ = 0) {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * scale, radius * scale,
          length * scale, 16),
        material
      );
      mesh.rotation.z = rotationZ;
      mesh.position.set(x * scale, y * scale, z * scale);
      mesh.castShadow = true;
      group.add(mesh);
      return mesh;
    }

    // Roues visibles, cadre, moteur, réservoir, selle et guidon.
    cylinder(0.38, 0.13, dark, 0, 0.43, -1.02);
    cylinder(0.38, 0.13, dark, 0, 0.43, 1.00);
    cylinder(0.22, 0.15, metal, 0, 0.43, -1.02);
    cylinder(0.22, 0.15, metal, 0, 0.43, 1.00);

    box(0.12, 0.12, 1.4, metal, 0, 0.82, 0);
    box(0.52, 0.42, 0.72, paint, 0, 1.05, 0.15);
    box(0.38, 0.12, 0.48, dark, 0, 1.31, -0.42);
    box(0.36, 0.10, 0.28, paint, 0, 1.18, 0.70);
    box(0.48, 0.08, 0.14, metal, 0, 1.40, 0.94);
    box(0.12, 0.15, 0.12, light, 0, 1.19, 0.93);

    cylinder(0.12, 0.78, metal, -0.18, 0.70, 0.52, -0.2);
    cylinder(0.12, 0.78, metal, 0.18, 0.70, 0.52, -0.2);

    // Silhouette du pilote.
    cylinder(0.18, 0.34, dark, 0, 1.66, -0.05);
    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.23 * scale, 16, 12),
      paint
    );
    helmet.position.set(0, 1.97 * scale, 0.05 * scale);
    helmet.castShadow = true;
    group.add(helmet);

    return group;
  }

  function initThree(THREE) {
    const wrap = $("canvasWrap");
    if (!wrap) return;

    if (renderer) {
      try { renderer.dispose(); } catch (_) {}
      renderer = null;
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9bd5f2);
    scene.fog = new THREE.Fog(0x9bd5f2, 35, 180);

    camera = new THREE.PerspectiveCamera(
      62, Math.max(1, wrap.clientWidth) / Math.max(1, wrap.clientHeight),
      0.1, 400
    );
    camera.position.set(0, 7.5, 12);
    camera.lookAt(0, 0.5, -5);

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      });
    } catch (_) {
      initFallback();
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(wrap.clientWidth || 640, wrap.clientHeight || 420);
    renderer.shadowMap.enabled = save.settings.reducedEffects ? false : true;

    if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    renderer.domElement.id = "raceCanvas";
    renderer.domElement.style.cssText =
      "display:block;width:100%;height:100%;touch-action:none;outline:none;";
    if (raceCanvas && raceCanvas.parentNode) {
      raceCanvas.parentNode.replaceChild(renderer.domElement, raceCanvas);
    } else {
      wrap.appendChild(renderer.domElement);
    }
    raceCanvas = renderer.domElement;

    const ambient = new THREE.HemisphereLight(0xe8f5ff, 0x56634c, 2.0);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 2.1);
    sun.position.set(-10, 18, 8);
    sun.castShadow = !save.settings.reducedEffects;
    scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(260, 420),
      new THREE.MeshStandardMaterial({ color: 0x427f36, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.05, -100);
    ground.receiveShadow = true;
    scene.add(ground);

    // Route asphalt et marquages.
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 420),
      new THREE.MeshStandardMaterial({ color: 0x34383c, roughness: 0.92 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -100);
    road.receiveShadow = true;
    scene.add(road);

    for (const x of [-6, 6]) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.025, 420),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      line.position.set(x, 0.02, -100);
      scene.add(line);
    }

    for (let z = 15; z > -210; z -= 9) {
      const dash = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.025, 3.5),
        new THREE.MeshStandardMaterial({ color: 0xf6f2d5 })
      );
      dash.position.set(0, 0.025, z);
      scene.add(dash);
    }

    // Arbres stylisés des deux côtés.
    for (let z = 10; z > -200; z -= 8) {
      [-1, 1].forEach(side => {
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.2, 1.6, 7),
          new THREE.MeshStandardMaterial({ color: 0x74502d })
        );
        trunk.position.set(side * (9 + Math.random() * 8), 0.8, z);
        scene.add(trunk);

        const leaves = new THREE.Mesh(
          new THREE.ConeGeometry(1.1, 2.8, 7),
          new THREE.MeshStandardMaterial({ color: 0x267b36 })
        );
        leaves.position.set(trunk.position.x, 2.8, z);
        scene.add(leaves);
      });
    }

    if (race) {
      race.playerMesh = makeBikeMesh(THREE,
        save.paint[save.selectedBike] || getBike(save.selectedBike).color, 1);
      race.playerMesh.position.set(0, 0, 4);
      scene.add(race.playerMesh);

      race.aiMeshes = [];
      ["#1565c0", "#fbc02d", "#e53935"].forEach((color, i) => {
        const mesh = makeBikeMesh(THREE, color, 0.86);
        mesh.position.set([-2.3, 2.1, -0.7][i], 0, -3 - i * 3);
        scene.add(mesh);
        race.aiMeshes.push(mesh);
      });
    }

    window.addEventListener("resize", resizeRenderer);
    drawThreeRace();
  }

  function resizeRenderer() {
    if (!renderer || !camera) return;
    const wrap = $("canvasWrap");
    if (!wrap) return;
    const w = Math.max(1, wrap.clientWidth);
    const h = Math.max(1, wrap.clientHeight);
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function drawThreeRace() {
    if (!renderer || !scene || !camera) return;

    if (race && race.playerMesh) {
      race.playerMesh.position.x = race.lane;
      race.playerMesh.rotation.z = -race.steer * 0.15;
      race.playerMesh.position.y = Math.abs(race.steer) * 0.04;

      if (race.aiMeshes) {
        race.aiMeshes.forEach((mesh, i) => {
          const opponent = race.opponents[i];
          mesh.position.x = opponent.lane;
          mesh.position.z = 4 - (opponent.distance - race.distance) * 0.20;
          mesh.rotation.z = -opponent.steer * 0.12;
        });
      }

      camera.position.x += (race.lane * 0.25 - camera.position.x) * 0.04;
      camera.position.z = 12;
      camera.lookAt(race.lane * 0.2, 0.5, -5);
    }

    renderer.render(scene, camera);
  }

  function initFallback() {
    const wrap = $("canvasWrap");
    if (!wrap) return;

    if (!raceCanvas || !raceCanvas.getContext) {
      raceCanvas = document.createElement("canvas");
      raceCanvas.id = "raceCanvas";
      wrap.replaceChildren(raceCanvas);
    }

    raceCanvas.style.width = "100%";
    raceCanvas.style.height = "100%";
    raceCanvas.style.display = "block";
    fallbackContext = raceCanvas.getContext("2d");
    drawFallback();
  }

  function drawFallback() {
    if (!fallbackContext || !raceCanvas) return;

    const ctx = fallbackContext;
    const w = raceCanvas.width = Math.max(320, raceCanvas.clientWidth || 640);
    const h = raceCanvas.height = Math.max(300, raceCanvas.clientHeight || 420);

    ctx.fillStyle = "#83c9ed";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#43833a";
    ctx.fillRect(0, h * 0.32, w, h * 0.68);

    ctx.fillStyle = "#34383c";
    ctx.beginPath();
    ctx.moveTo(w * 0.32, h * 0.32);
    ctx.lineTo(w * 0.68, h * 0.32);
    ctx.lineTo(w * 0.95, h);
    ctx.lineTo(w * 0.05, h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.setLineDash([18, 16]);
    ctx.beginPath();
    ctx.moveTo(w / 2, h * 0.34);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);

    function bike(x, y, color, size) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "#17191b";
      ctx.beginPath();
      ctx.ellipse(0, size * 0.42, size * 0.17, size * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-size * 0.34, size * 0.1);
      ctx.lineTo(size * 0.34, size * 0.1);
      ctx.lineTo(size * 0.22, -size * 0.32);
      ctx.lineTo(-size * 0.22, -size * 0.32);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#e7edf2";
      ctx.beginPath();
      ctx.arc(0, -size * 0.43, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    bike(w * 0.39, h * 0.45, "#1565c0", 35);
    bike(w * 0.61, h * 0.48, "#fbc02d", 35);
    bike(w * 0.50 + (race?.lane || 0) * w * 0.04, h * 0.79,
      save.paint[save.selectedBike] || getBike(save.selectedBike).color, 70);
  }

  /* ======================== COURSE ============================ */

  function startRace(missionId = 1) {
    const mission = missions.find(m => m.id === Number(missionId)) || missions[0];
    selectedMission = mission.id;

    if (race) cleanupRaceMeshes();

    const stats = bikeStats(getBike(save.selectedBike));
    race = {
      mission,
      started: false,
      paused: false,
      finished: false,
      countdown: 3,
      countdownTimer: 0,
      elapsed: 0,
      distance: 0,
      lane: 0,
      steer: 0,
      speed: 0,
      maxSpeed: stats.speed,
      acceleration: stats.accel,
      handling: stats.handling,
      braking: stats.braking,
      nitroPower: stats.nitro,
      nitro: 100,
      nitroUsed: false,
      lap: 1,
      totalLaps: mission.laps,
      opponents: [
        { name: "MEME Selvandieu", distance: -10, lane: -2.2, speed: mission.target * 0.88, steer: 0 },
        { name: "FOBAS Racer", distance: -25, lane: 2.1, speed: mission.target * 0.82, steer: 0 },
        { name: "Champion Turbo", distance: -40, lane: 0.9, speed: mission.target * 0.85, steer: 0 }
      ],
      playerMesh: null,
      aiMeshes: [],
      laneLimit: 4.8,
      finishDistance: mission.target * mission.laps * 2.1,
      position: 4,
      elapsedBeforePause: 0
    };

    setScreen("raceScreen");
    setText("raceMissionName", mission.name);
    setText("raceLocationName", mission.location);
    setText("raceDifficultyName", mission.difficulty);
    setText("lapDisplay", `1 / ${mission.laps}`);
    setText("positionDisplay", "4 / 4");
    setText("timeDisplay", "00:00");
    setText("speedDisplay", "0");
    setText("nitroDisplay", "100%");
    setText("raceToast", "Prépare-toi !");
    setText("countdownDisplay", "3");

    showOverlay("pauseOverlay", false);
    showOverlay("resultOverlay", false);
    ensure3D();
    startLoop();
  }

  function cleanupRaceMeshes() {
    if (!scene || !race) return;
    [race.playerMesh, ...(race.aiMeshes || [])].forEach(mesh => {
      if (mesh) scene.remove(mesh);
    });
  }

  function showOverlay(id, visible) {
    const el = $(id);
    if (!el) return;
    el.hidden = !visible;
    el.classList.toggle("visible", visible);
  }

  function startLoop() {
    if (animationId) return;
    lastFrame = performance.now();
    animationId = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = 0;
  }

  function frame(now) {
    animationId = 0;
    const dt = clamp((now - lastFrame) / 1000, 0, 0.05);
    lastFrame = now;

    if (race && !race.paused && !race.finished && currentScreen === "raceScreen") {
      updateRace(dt);
      if (threeReady) drawThreeRace();
      else drawFallback();
    }

    if (race && !race.paused && !race.finished && currentScreen === "raceScreen") {
      animationId = requestAnimationFrame(frame);
    }
  }

  function updateRace(dt) {
    if (!race.started) {
      race.countdownTimer += dt;

      const remain = 3 - Math.floor(race.countdownTimer);
      setText("countdownDisplay", remain > 0 ? remain : "GO!");

      if (race.countdownTimer >= 3.5) {
        race.started = true;
        setText("countdownDisplay", "");
        setText("raceToast", "C'est parti !");
      }
      return;
    }

    race.elapsed += dt;

    const maxSpeed = race.maxSpeed;
    const gas = input.gas || keys.ArrowUp || keys.KeyW;
    const brake = input.brake || keys.ArrowDown || keys.KeyS;
    const left = input.left || keys.ArrowLeft || keys.KeyA;
    const right = input.right || keys.ArrowRight || keys.KeyD;
    const nitro = input.nitro || keys.Space;

    if (gas) race.speed += race.acceleration * 0.32 * dt;
    else race.speed -= 10 * dt;

    if (brake) race.speed -= race.braking * 0.60 * dt;

    if (nitro && race.nitro > 0 && race.speed > 10) {
      race.speed += race.nitroPower * 0.75 * dt;
      race.nitro = Math.max(0, race.nitro - 25 * dt);
      race.nitroUsed = true;
    } else {
      race.nitro = Math.min(100, race.nitro + 5 * dt);
    }

    race.speed = clamp(race.speed, 0, maxSpeed * 1.3);

    race.steer = (left ? -1 : 0) + (right ? 1 : 0);
    race.lane += race.steer * (race.handling / 60) * 2.8 * dt;
    race.lane = clamp(race.lane, -race.laneLimit, race.laneLimit);

    if (Math.abs(race.lane) > race.laneLimit - 0.1) {
      race.speed *= 0.985;
    }

    race.distance += race.speed * dt * 0.22;

    race.opponents.forEach((opponent, i) => {
      const variation = Math.sin(race.elapsed * (0.65 + i * 0.12)) * 5;
      opponent.distance += Math.max(15, opponent.speed + variation) * dt * 0.22;
      opponent.steer = Math.sin(race.elapsed * (0.7 + i * 0.2)) * 0.3;
      opponent.lane = [-2.2, 2.1, 0.9][i] + opponent.steer;
    });

    race.lap = Math.min(
      race.totalLaps,
      Math.floor(race.distance / (race.finishDistance / race.totalLaps)) + 1
    );

    race.position = 1 + race.opponents.filter(o => o.distance > race.distance).length;

    setText("positionDisplay", `${race.position} / 4`);
    setText("lapDisplay", `${race.lap} / ${race.totalLaps}`);
    setText("timeDisplay", formatTime(race.elapsed));
    setText("speedDisplay", Math.round(race.speed));
    setText("nitroDisplay", `${Math.round(race.nitro)}%`);

    const nitroBar = $("nitroBar");
    if (nitroBar) nitroBar.style.width = `${race.nitro}%`;

    const nitroProgress = $("nitroProgress");
    if (nitroProgress) {
      nitroProgress.style.setProperty("--progress", `${race.nitro}%`);
      nitroProgress.setAttribute("aria-valuenow", String(Math.round(race.nitro)));
    }

    // La mission se termine dès que le joueur franchit l'arrivée.
    if (race.distance >= race.finishDistance) finishRace();
  }

  function formatTime(seconds) {
    const total = Math.floor(seconds);
    const minutes = String(Math.floor(total / 60)).padStart(2, "0");
    const secs = String(total % 60).padStart(2, "0");
    return `${minutes}:${secs}`;
  }

  function pauseRace() {
    if (!race || race.finished) return;
    race.paused = true;
    stopLoop();
    showOverlay("pauseOverlay", true);
  }

  function resumeRace() {
    if (!race || race.finished) return;
    race.paused = false;
    showOverlay("pauseOverlay", false);
    startLoop();
  }

  function restartRace() {
    if (!race) return startRace(selectedMission);
    startRace(race.mission.id);
  }

  function quitRace() {
    if (race && !race.finished) {
      race.paused = true;
      stopLoop();
    }
    race = null;
    cleanupRaceMeshes();
    setScreen("homeScreen");
  }

  function finishRace() {
    if (!race || race.finished) return;

    race.finished = true;
    stopLoop();

    const position = race.position;
    const mission = race.mission;
    const baseReward = mission.reward;
    const reward = Math.round(baseReward * (
      position === 1 ? 1.5 : position === 2 ? 1.15 : position === 3 ? 0.9 : 0.7
    ));
    const xpEarned = Math.round(mission.xp * (
      position === 1 ? 1.3 : position === 2 ? 1.1 : 1
    ));
    const points = position === 1 ? 100
      : position === 2 ? 60
      : position === 3 ? 35 : 15;

    save.player.races += 1;
    save.player.credits += reward;
    save.player.xp += xpEarned;
    save.player.bestPosition = Math.min(save.player.bestPosition, position);
    save.championship.races += 1;
    save.championship.points += points;
    save.player.championshipPoints += points;

    if (position === 1) {
      save.player.wins += 1;
      save.championship.wins += 1;
    }

    // Progression accessible après avoir franchi la ligne, même en 4e place.
    if (!save.completedMissions.includes(mission.id)) {
      save.completedMissions.push(mission.id);
    }

    let levelUp = false;
    while (save.player.xp >= save.player.level * 300 && save.player.level < 35) {
      save.player.xp -= save.player.level * 300;
      save.player.level += 1;
      save.player.credits += 250;
      levelUp = true;
    }

    save.raceResults.unshift({
      mission: mission.id,
      name: mission.name,
      position,
      reward,
      xp: xpEarned,
      time: race.elapsed,
      date: new Date().toISOString()
    });
    save.raceResults = save.raceResults.slice(0, 50);

    persist();

    setText("resultEyebrow", `MISSION ${mission.id}`);
    setText("resultTitle", position === 1 ? "VICTOIRE !" : "COURSE TERMINÉE");
    setText("resultSubtitle", `${mission.name} — ${formatTime(race.elapsed)}`);
    setText("resultPosition", `${position}e / 4`);
    setText("resultCredits", `+${reward}`);
    setText("resultXP", `+${xpEarned}`);
    setText("resultChampionshipPoints", `+${points}`);
    setText("resultPodiumMessage",
      levelUp ? `Niveau supérieur ! Tu es niveau ${save.player.level}.`
        : position === 1 ? "Magnifique victoire, champion !"
        : "Mission validée ! Tu peux passer à la suivante.");

    setText("resultPodium",
      position === 1 ? "🥇" : position === 2 ? "🥈" :
      position === 3 ? "🥉" : "🏁");

    showOverlay("pauseOverlay", false);
    showOverlay("resultOverlay", true);
    setText("countdownDisplay", "");
    renderHome();
    renderCareer();
    renderChampionship();

    if (levelUp) notify("Félicitations ! Tu as gagné un niveau.");
  }

  /* ======================== COMMANDES ========================= */

  function bindHoldButton(id, key) {
    const button = $(id);
    if (!button) return;

    const down = event => {
      event.preventDefault();
      input[key] = true;
      button.classList.add("pressed");
      try {
        if (button.setPointerCapture && event.pointerId !== undefined) {
          button.setPointerCapture(event.pointerId);
        }
      } catch (_) {}
    };

    const up = event => {
      if (event) event.preventDefault();
      input[key] = false;
      button.classList.remove("pressed");
    };

    button.addEventListener("pointerdown", down, { passive: false });
    ["pointerup", "pointercancel", "lostpointercapture", "pointerleave"]
      .forEach(name => button.addEventListener(name, up));
    button.addEventListener("contextmenu", e => e.preventDefault());
  }

  function bindControls() {
    bindHoldButton("gasButton", "gas");
    bindHoldButton("brakeButton", "brake");
    bindHoldButton("leftButton", "left");
    bindHoldButton("rightButton", "right");
    bindHoldButton("nitroButton", "nitro");

    const tilt = $("tiltButton");
    if (tilt) {
      tilt.addEventListener("click", () => {
        save.settings.tilt = !save.settings.tilt;
        tilt.classList.toggle("active", save.settings.tilt);
        persist();
        notify(save.settings.tilt
          ? "Mode inclinaison activé si ton appareil le prend en charge."
          : "Mode inclinaison désactivé.");
      });
    }

    document.addEventListener("keydown", event => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
        event.preventDefault();
      }
      keys[event.code] = true;

      if (event.code === "Escape" && race && !race.finished) {
        race.paused ? resumeRace() : pauseRace();
      }
    });

    document.addEventListener("keyup", event => {
      keys[event.code] = false;
    });

    window.addEventListener("blur", () => {
      input = { gas: false, brake: false, left: false, right: false, nitro: false };
      keys = Object.create(null);
    });

    const pause = $("pauseButton");
    if (pause) pause.addEventListener("click", pauseRace);

    const resume = $("resumeButton");
    if (resume) resume.addEventListener("click", resumeRace);

    const restart = $("restartButton");
    if (restart) restart.addEventListener("click", restartRace);

    const quit = $("quitRaceButton");
    if (quit) quit.addEventListener("click", quitRace);

    const next = $("continueButton");
    if (next) {
      next.addEventListener("click", () => {
        showOverlay("resultOverlay", false);
        const nextM = nextMission();
        race = null;
        cleanupRaceMeshes();
        if (nextM) {
          selectedMission = nextM.id;
          startRace(nextM.id);
        } else {
          setScreen("championshipScreen");
          notify("Toutes les missions sont terminées !");
        }
      });
    }
  }

  /* ======================== NAVIGATION ======================== */

  function bindNavigation() {
    all("[data-nav]").forEach(button => {
      button.addEventListener("click", () => {
        const target = button.dataset.nav;
        const map = {
          home: "homeScreen",
          career: "careerScreen",
          garage: "garageScreen",
          championship: "championshipScreen",
          race: "raceScreen",
          settings: "settingsScreen"
        };

        if (map[target]) {
          if (target === "race" && !race) {
            startRace(selectedMission);
          } else {
            setScreen(map[target]);
          }
        } else if ($(target)) {
          setScreen(target);
        }
      });
    });

    all("[data-go]").forEach(button => {
      button.addEventListener("click", () => {
        const target = button.dataset.go;
        if ($(target)) setScreen(target);
        else notify(`Destination introuvable : ${target}`);
      });
    });

    const actions = [
      ["homeButton", () => setScreen("homeScreen")],
      ["profileButton", beginProfileEdit],
      ["editProfileButton", beginProfileEdit],
      ["saveProfileButton", saveProfile],
      ["cancelProfileButton", () => {
        profileEditing = false;
        renderHome();
      }],
      ["careerButton", () => setScreen("careerScreen")],
      ["openGarageButton", () => {
        selectedBikeId = save.selectedBike;
        setScreen("garageScreen");
      }],
      ["homeRaceButton", () => startRace(nextMission()?.id || 1)],
      ["quickCareerButton", () => setScreen("careerScreen")],
      ["quickGarageButton", () => {
        selectedBikeId = save.selectedBike;
        setScreen("garageScreen");
      }],
      ["quickChampionshipButton", () => setScreen("championshipScreen")],
      ["challengeMasterButton", () => startRace(nextMission()?.id || 1)],
      ["challengeMasterChampionshipButton", () => startRace(nextMission()?.id || 1)],
      ["refreshLeaderboardButton", () => {
        renderChampionship();
        notify("Classement actualisé.");
      }],
      ["applyPaintButton", () => {
        if (!isOwned(selectedBikeId)) {
          return notify("Achète d'abord cette moto.");
        }
        save.selectedBike = selectedBikeId;
        persist();
        renderHome();
        notify("Moto et peinture appliquées !");
      }],
      ["saveProgressButton", async () => {
        await persist();
        notify("Progression sauvegardée sur cet appareil.");
      }]
    ];

    actions.forEach(([id, callback]) => {
      const element = $(id);
      if (element) element.addEventListener("click", callback);
    });

    const shopBuy = $("bikeOwnedBadge");
    if (shopBuy) {
      shopBuy.style.cursor = "pointer";
      shopBuy.title = "Acheter ou sélectionner la moto";
      shopBuy.addEventListener("click", buyOrSelectBike);
    }

    const garageName = $("garageBikeName");
    if (garageName) {
      garageName.style.cursor = "pointer";
      garageName.title = "Acheter ou sélectionner la moto";
      garageName.addEventListener("click", buyOrSelectBike);
    }
  }

  /* ======================== PARAMÈTRES ======================== */

  function bindSettings() {
    const tilt = $("settingTilt");
    const vibration = $("settingVibration");
    const reduced = $("settingReducedEffects");
    const graphics = $("graphicsQuality");

    if (tilt) {
      tilt.checked = !!save.settings.tilt;
      tilt.addEventListener("change", () => {
        save.settings.tilt = tilt.checked;
        persist();
      });
    }

    if (vibration) {
      vibration.checked = !!save.settings.vibration;
      vibration.addEventListener("change", () => {
        save.settings.vibration = vibration.checked;
        persist();
      });
    }

    if (reduced) {
      reduced.checked = !!save.settings.reducedEffects;
      reduced.addEventListener("change", () => {
        save.settings.reducedEffects = reduced.checked;
        if (renderer) renderer.shadowMap.enabled = !reduced.checked;
        persist();
      });
    }

    if (graphics) {
      graphics.value = save.settings.graphics || "high";
      graphics.addEventListener("change", () => {
        save.settings.graphics = graphics.value;
        if (renderer) {
          renderer.setPixelRatio(
            graphics.value === "low" ? 1 :
            graphics.value === "medium" ? Math.min(devicePixelRatio, 1.3) :
            Math.min(devicePixelRatio, 1.8)
          );
        }
        persist();
      });
    }

    setText("gameVersion", `v${VERSION}`);
  }

  /* ======================== ZOOM TACTILE ====================== */

  function enablePinchZoom() {
    const wrap = $("canvasWrap");
    if (!wrap) return;

    let initialDistance = 0;
    let initialFov = 62;

    wrap.addEventListener("touchstart", event => {
      if (event.touches.length === 2 && camera) {
        const a = event.touches[0];
        const b = event.touches[1];
        initialDistance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        initialFov = camera.fov;
      }
    }, { passive: true });

    wrap.addEventListener("touchmove", event => {
      if (event.touches.length === 2 && camera && threeReady) {
        const a = event.touches[0];
        const b = event.touches[1];
        const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

        if (initialDistance > 0) {
          camera.fov = clamp(
            initialFov * initialDistance / Math.max(1, distance),
            38, 78
          );
          camera.updateProjectionMatrix();
        }
      }
    }, { passive: true });

    wrap.addEventListener("touchend", event => {
      if (event.touches.length < 2) initialDistance = 0;
    }, { passive: true });
  }

  /* ======================== DÉMARRAGE ========================= */

  async function init() {
    if (app.dataset.fobasInitialized === "yes") return;
    app.dataset.fobasInitialized = "yes";

    await openDatabase();
    await loadSavedData();

    if (!save.ownedBikes.includes(1)) save.ownedBikes.unshift(1);
    if (!isOwned(save.selectedBike)) save.selectedBike = 1;
    selectedBikeId = save.selectedBike;

    bindNavigation();
    bindControls();
    bindSettings();
    enablePinchZoom();

    renderHome();
    renderCareer();
    renderGarage();
    renderChampionship();

    const loading = $("loadingOverlay");
    if (loading) {
      loading.classList.add("hidden");
      setTimeout(() => { loading.hidden = true; }, 350);
    }

    setScreen("homeScreen");
    ensure3D();
    persist();

    console.log(`FOBAS MOTO RACING 3D — Engine ${VERSION} prêt.`);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();











