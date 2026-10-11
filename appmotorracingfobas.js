
/* ============================================================
   FOBAS MOTO RACING 3D — FINAL ENGINE
   Fichier : appmotorracingfobas.js
   Moteur : Three.js WebGL
   Auteur / rival maître : MEME Selvandieu
   Version corrigée : 3.1.1
   ============================================================ */

(() => {
  "use strict";

  if (window.__FOBAS_MOTO_RACING_STARTED__) return;
  window.__FOBAS_MOTO_RACING_STARTED__ = true;

  const VERSION = "3.1.1";
  const DB_NAME = "FOBAS_MOTO_RACING_DB";
  const STORE = "gameData";
  const SAVE_KEY = "mainSave";
  const THREE_URL =
    "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";

  const $ = id => document.getElementById(id);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];

  const text = (id, value) => {
    const el = $(id);
    if (el) el.textContent = String(value);
  };

  const show = (id, visible) => {
    const el = $(id);
    if (el) el.hidden = !visible;
  };

  const escapeHTML = value =>
    String(value ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]);

  const formatTime = seconds => {
    const n = Math.max(0, Math.floor(seconds || 0));
    return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  };

  const DEPARTMENTS = [
    ["Nord-Ouest", ["Port-de-Paix", "Môle-Saint-Nicolas", "Jean-Rabel"]],
    ["Nord", ["Cap-Haïtien", "Limbé", "Grande-Rivière-du-Nord"]],
    ["Nord-Est", ["Fort-Liberté", "Ouanaminthe", "Trou-du-Nord"]],
    ["Artibonite", ["Gonaïves", "Saint-Marc", "Gros-Morne"]],
    ["Centre", ["Hinche", "Mirebalais", "Lascahobas"]],
    ["Ouest", ["Port-au-Prince", "Pétion-Ville", "Léogâne"]],
    ["Sud-Est", ["Jacmel", "Marigot", "Bainet"]],
    ["Sud", ["Les Cayes", "Aquin", "Port-Salut"]],
    ["Grande-Anse", ["Jérémie", "Abricots", "Anse-d'Hainault"]],
    ["Nippes", ["Miragoâne", "Anse-à-Veau", "Baradères"]]
  ];

  const INTERNATIONAL = [
    ["République dominicaine", "Santo Domingo"],
    ["Jamaïque", "Kingston"],
    ["États-Unis", "Miami"],
    ["France", "Paris"],
    ["Japon", "Tokyo"],
    ["Italie", "Rome"]
  ];

  const MISSION_NAMES = [
    "Premiers tours de roue", "Maîtrise de trajectoire",
    "Départ rapide", "Virages contrôlés", "Défi de vitesse",
    "Course du littoral", "Rivalité locale", "Route des montagnes",
    "Accélération maîtrisée", "Défi de freinage", "Sprint technique",
    "Route des champions", "Duel de pilotes", "Course nocturne",
    "Défi expert", "Le grand virage", "Vitesse supérieure",
    "Course de précision", "Défi des meilleurs", "Rivalité extrême",
    "Sprint du champion", "Épreuve des maîtres", "Route de la victoire",
    "Course internationale", "Défi ultime", "Circuit royal",
    "Légende de la piste", "Tournoi des champions", "La grande finale",
    "Défi des sept mers", "Championnat mondial", "Course de prestige",
    "L'ultime rivalité", "Le dernier obstacle", "Couronne de légende"
  ];

  const DIFFICULTIES = [
    { name: "Débutant", factor: 0.76, laps: 1, reward: 100 },
    { name: "Intermédiaire", factor: 0.87, laps: 2, reward: 180 },
    { name: "Expert", factor: 0.96, laps: 2, reward: 280 },
    { name: "Champion", factor: 1.04, laps: 3, reward: 420 },
    { name: "Légende", factor: 1.12, laps: 3, reward: 650 }
  ];

  const BIKE_DATA = [
    ["Moto École 125", 0x36c9a0, 105, 58, 65, 68, 55, 0],
    ["Street 150", 0x2196f3, 125, 65, 68, 70, 60, 250],
    ["Roadster 200", 0xffa726, 145, 70, 72, 72, 62, 450],
    ["Sport 250", 0xf44336, 165, 76, 74, 75, 68, 700],
    ["Racing 300", 0xe53935, 185, 80, 76, 76, 72, 1000],
    ["Ninja 400", 0x43a047, 205, 83, 78, 78, 74, 1400],
    ["Street Fighter", 0xab47bc, 215, 85, 80, 80, 76, 1800],
    ["Sport Touring", 0x26c6da, 225, 85, 82, 82, 78, 2300],
    ["SuperSport 600", 0xef5350, 245, 89, 82, 83, 82, 2900],
    ["Enduro Pro", 0x8d6e63, 210, 80, 90, 85, 80, 3500],
    ["Racing GP", 0xff7043, 260, 92, 85, 85, 85, 4300],
    ["Hypersport 750", 0x5c6bc0, 275, 93, 85, 87, 88, 5200],
    ["Superbike 900", 0xec407a, 290, 95, 87, 88, 90, 6200],
    ["Track Master", 0x66bb6a, 300, 96, 90, 89, 91, 7400],
    ["Turbo Racing", 0xffca28, 315, 97, 88, 90, 93, 8800],
    ["SuperSport 1000", 0x29b6f6, 325, 98, 90, 92, 94, 10400],
    ["Velocity X", 0x7e57c2, 340, 99, 92, 92, 96, 12200],
    ["Phantom GP", 0xffffff, 355, 100, 93, 94, 98, 14500],
    ["Legend Hyper", 0xff1744, 375, 100, 95, 96, 100, 17500],
    ["FOBAS Ultimate", 0x00e5ff, 400, 100, 100, 100, 100, 22000]
  ];

  const BIKES = BIKE_DATA.map((d, id) => ({
    id,
    name: d[0],
    color: d[1],
    speed: d[2],
    acceleration: d[3],
    handling: d[4],
    braking: d[5],
    nitro: d[6],
    price: d[7]
  }));

  const MISSIONS = MISSION_NAMES.map((name, i) => {
    const tier = Math.min(4, Math.floor(i / 7));
    const local = DEPARTMENTS[i % DEPARTMENTS.length];

    const destination = i < 28
      ? {
          country: "Haïti",
          department: local[0],
          city: local[1][i % local[1].length]
        }
      : {
          country: INTERNATIONAL[(i - 28) % INTERNATIONAL.length][0],
          city: INTERNATIONAL[(i - 28) % INTERNATIONAL.length][1]
        };

    return {
      id: i + 1,
      name,
      tier,
      difficulty: DIFFICULTIES[tier],
      location: destination,
      laps: DIFFICULTIES[tier].laps,
      reward: DIFFICULTIES[tier].reward + i * 15,
      xp: 40 + i * 8
    };
  });

  const PAINTS = [
    ["Rouge Racing", "#ef4444"],
    ["Bleu Océan", "#2196f3"],
    ["Vert Émeraude", "#10b981"],
    ["Or Champion", "#fbbf24"],
    ["Violet Royal", "#a855f7"],
    ["Noir Carbone", "#20242b"],
    ["Blanc Perle", "#f5f5f5"],
    ["Cyan FOBAS", "#00e5ff"]
  ];

  const defaultState = () => ({
    version: VERSION,
    profile: {
      name: "Pilote FOBAS",
      country: "Haïti"
    },
    credits: 500,
    xp: 0,
    level: 1,
    selectedBike: 0,
    ownedBikes: [0],
    bikeUpgrades: {},
    bikePaints: {},
    completedMissions: [],
    unlockedMissions: [1],
    races: 0,
    wins: 0,
    podiums: 0,
    bestPosition: 0,
    championshipPoints: 0,
    settings: {
      tilt: false,
      vibration: true,
      reducedEffects: false,
      graphicsQuality: "high"
    },
    leaderboard: [],
    lastSaved: null
  });

  let state = defaultState();
  let db = null;
  let three = null;
  let renderer = null;
  let scene = null;
  let camera = null;
  let world = null;
  let playerBike3D = null;
  let aiRiders = [];
  let roadSegments = [];
  let scenery = [];

  let currentScreen = "homeScreen";
  let selectedMissionId = 1;
  let garageBikeId = 0;
  let currentRace = null;

  let paused = false;
  let raceFinished = false;
  let countdown = 3;
  let countdownAccumulator = 0;
  let raceClock = 0;
  let lastFrameTime = 0;
  let currentSpeed = 0;
  let nitroEnergy = 100;
  let playerLane = 0;
  let steering = 0;
  let throttle = 0;
  let cameraZoom = 1;
  let saveTimer = 0;
  let toastTimer = 0;
  let lastCollisionTime = 0;
  let inputLeft = false;
  let inputRight = false;
  let inputGas = false;
  let inputBrake = false;
  let inputNitro = false;
  let tiltValue = 0;
  let rafId = 0;
  let lastSaveUsedFallback = false;

  /* ============================== NOTIFICATIONS =============== */

  function toast(message, duration = 2600) {
    const el = $("appToast");

    if (!el) {
      console.info("[FOBAS]", message);
      return;
    }

    el.textContent = message;
    el.hidden = false;

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, duration);
  }

  /* =========================== SAUVEGARDE ====================== */

  function openDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB indisponible"));
        return;
      }

      const req = indexedDB.open(DB_NAME, 1);

      req.onupgradeneeded = () => {
        const database = req.result;

        if (!database.objectStoreNames.contains(STORE)) {
          database.createObjectStore(STORE, {
            keyPath: "key"
          });
        }
      };

      req.onsuccess = () => {
        db = req.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };

      req.onerror = () => reject(req.error);
    });
  }

  function dbRead() {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Base non ouverte"));
        return;
      }

      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(SAVE_KEY);

      req.onsuccess = () => resolve(req.result?.data || null);
      req.onerror = () => reject(req.error);
    });
  }

  function dbWrite(data) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Base non ouverte"));
        return;
      }

      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({
        key: SAVE_KEY,
        data
      });

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  function fallbackRead() {
    try {
      const value = localStorage.getItem("fobasMotoRacingSave");
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn("[FOBAS] Lecture de secours impossible :", error);
      return null;
    }
  }

  function fallbackWrite(data) {
    try {
      localStorage.setItem(
        "fobasMotoRacingSave",
        JSON.stringify(data)
      );
      return true;
    } catch (error) {
      console.warn("[FOBAS] Sauvegarde de secours impossible :", error);
      return false;
    }
  }

  function normalizeState(saved) {
    const fresh = defaultState();

    if (!saved || typeof saved !== "object") {
      return fresh;
    }

    const result = {
      ...fresh,
      ...saved,
      profile: {
        ...fresh.profile,
        ...(saved.profile || {})
      },
      settings: {
        ...fresh.settings,
        ...(saved.settings || {})
      }
    };

    for (const key of [
      "credits",
      "xp",
      "level",
      "races",
      "wins",
      "podiums",
      "championshipPoints"
    ]) {
      result[key] = Math.max(
        key === "level" ? 1 : 0,
        Number(result[key]) || 0
      );
    }

    result.ownedBikes = Array.isArray(result.ownedBikes)
      ? [...new Set(result.ownedBikes.filter(id =>
          Number.isInteger(id) && BIKES[id]))]
      : [0];

    if (!result.ownedBikes.includes(0)) {
      result.ownedBikes.unshift(0);
    }

    result.selectedBike = result.ownedBikes.includes(
      Number(result.selectedBike)
    )
      ? Number(result.selectedBike)
      : 0;

    for (const key of [
      "completedMissions",
      "unlockedMissions"
    ]) {
      result[key] = Array.isArray(result[key])
        ? [...new Set(result[key].filter(id =>
            Number.isInteger(id) && id >= 1 && id <= 35))]
        : [];
    }

    if (!result.unlockedMissions.includes(1)) {
      result.unlockedMissions.unshift(1);
    }

    result.bikeUpgrades =
      result.bikeUpgrades &&
      typeof result.bikeUpgrades === "object"
        ? result.bikeUpgrades
        : {};

    result.bikePaints =
      result.bikePaints &&
      typeof result.bikePaints === "object"
        ? result.bikePaints
        : {};

    result.leaderboard = Array.isArray(result.leaderboard)
      ? result.leaderboard
      : [];

    return result;
  }

  async function loadProgress() {
    let saved = null;

    try {
      await openDB();
      saved = await dbRead();

      if (!saved) {
        saved = fallbackRead();
      }
    } catch (error) {
      console.warn("[FOBAS] IndexedDB indisponible :", error);
      saved = fallbackRead();
      lastSaveUsedFallback = true;
    }

    state = normalizeState(saved);
  }

  async function saveProgress(showMessage = false) {
    state.lastSaved = new Date().toISOString();

    let ok = false;

    try {
      if (db) {
        await dbWrite(state);
        ok = true;
      } else {
        ok = fallbackWrite(state);
      }
    } catch (error) {
      console.error("[FOBAS] Sauvegarde IndexedDB :", error);
      ok = fallbackWrite(state);
      lastSaveUsedFallback = ok;
    }

    if (showMessage) {
      toast(ok
        ? "Progression sauvegardée."
        : "Sauvegarde impossible : vérifiez le navigateur.");
    }

    return ok;
  }

  function scheduleSave() {
    clearTimeout(saveTimer);

    saveTimer = setTimeout(() => {
      saveProgress(false);
    }, 450);
  }

  /* ========================= PROFIL / XP ======================= */

  function xpRequired(level = state.level) {
    return 150 + (Math.max(1, level) - 1) * 90;
  }

  function xpAtLevel(level) {
    let total = 0;

    for (let i = 1; i < level; i++) {
      total += xpRequired(i);
    }

    return total;
  }

  function updateLevel() {
    const old = state.level;
    let level = 1;
    let remaining = state.xp;

    while (level < 35 && remaining >= xpRequired(level)) {
      remaining -= xpRequired(level);
      level++;
    }

    state.level = level;

    if (level > old) {
      const bonus = (level - old) * 100;
      state.credits += bonus;
      toast(`Niveau ${level} atteint ! +${bonus} crédits.`);
    }
  }

  function upgradeLevel(bikeId, key) {
    return clamp(
      Number(state.bikeUpgrades[bikeId]?.[key]) || 0,
      0,
      5
    );
  }

  function getBikeStats(id) {
    const bike = BIKES[id] || BIKES[0];

    return {
      ...bike,
      speed: bike.speed *
        (1 + upgradeLevel(id, "speed") * 0.045),

      acceleration: bike.acceleration +
        upgradeLevel(id, "acceleration") * 3,

      handling: Math.min(
        100,
        bike.handling + upgradeLevel(id, "handling") * 3
      ),

      braking: Math.min(
        100,
        bike.braking + upgradeLevel(id, "braking") * 3
      ),

      nitro: Math.min(
        100,
        bike.nitro + upgradeLevel(id, "nitro") * 3
      )
    };
  }

  function currentBike() {
    return getBikeStats(state.selectedBike);
  }

  function missionById(id) {
    return MISSIONS.find(m => m.id === id) || MISSIONS[0];
  }

  function updateProfileUI() {
    const rank = state.level >= 29 ? "Légende"
      : state.level >= 22 ? "Champion"
      : state.level >= 15 ? "Expert"
      : state.level >= 8 ? "Intermédiaire"
      : "Débutant";

    text("headerPlayerName", state.profile.name);
    text("profileNameDisplay", state.profile.name);
    text("profileCountryDisplay", state.profile.country);
    text("profileLevelDisplay", state.level);
    text("profileRankDisplay", rank);

    if ($("playerNameInput")) {
      $("playerNameInput").value = state.profile.name;
    }

    if ($("playerCountrySelect")) {
      $("playerCountrySelect").value = state.profile.country;
    }
  }

  function updateHomeUI() {
    text("creditDisplay", state.credits);
    text("homeLevel", state.level);
    text("homeWins", state.wins);
    text("homeRaces", state.races);
    text("homeMissions", state.completedMissions.length);

    const bike = BIKES[state.selectedBike] || BIKES[0];

    text("homeBikeName", bike.name);
    text(
      "homeBikeDescription",
      `Vitesse ${bike.speed} km/h · Maniabilité ${bike.handling}/100`
    );

    const art = $("homeBikeArt");

    if (art) {
      art.style.setProperty(
        "--bike-color",
        `#${bike.color.toString(16).padStart(6, "0")}`
      );

      art.setAttribute("aria-label", bike.name);
    }

    updateProfileUI();
  }

  function updateCareerUI() {
    const required = xpRequired(state.level);
    const within = Math.max(
      0,
      state.xp - xpAtLevel(state.level)
    );

    const percent = clamp(
      within / required * 100,
      0,
      100
    );

    text("careerLevel", state.level);
    text("xpDisplay", within);
    text("xpNextDisplay", required);
    text("completedMissionCount", state.completedMissions.length);
    text("bestCareerPosition", state.bestPosition || "—");
    text("careerPoints", state.championshipPoints);

    if ($("xpProgress")) {
      $("xpProgress").style.width = `${percent}%`;
    }

    if ($("xpBar")) {
      $("xpBar").style.width = `${percent}%`;
    }

    text(
      "careerMessage",
      state.completedMissions.length === 35
        ? "Toutes les missions sont terminées."
        : `${35 - state.completedMissions.length} mission(s) restante(s).`
    );

    const list = $("raceList");
    if (!list) return;

    list.innerHTML = MISSIONS.map(m => {
      const complete = state.completedMissions.includes(m.id);
      const unlocked = state.unlockedMissions.includes(m.id);
      const selected = selectedMissionId === m.id;

      return `
        <button type="button"
          class="race-mission-card ${complete ? "completed" : ""} ${selected ? "selected" : ""}"
          data-mission-id="${m.id}"
          ${unlocked ? "" : "disabled"}>
          <span class="mission-number">${String(m.id).padStart(2, "0")}</span>
          <span class="mission-info">
            <strong>${escapeHTML(m.name)}</strong>
            <small>${escapeHTML(m.difficulty.name)} · ${escapeHTML(m.location.city)}</small>
          </span>
          <span class="mission-status">${complete ? "✓" : unlocked ? "▶" : "🔒"}</span>
        </button>`;
    }).join("");
  }

  function updateChampionshipUI() {
    text("championPoints", state.championshipPoints);
    text("championWins", state.wins);
    text("championRaces", state.races);
    text("firstPlaceReward", "300 crédits + 100 XP");
    text("secondPlaceReward", "180 crédits + 65 XP");
    text("thirdPlaceReward", "100 crédits + 40 XP");

    const list = $("leaderboard");
    if (!list) return;

    const rows = [
      ...(Array.isArray(state.leaderboard) ? state.leaderboard : []),
      {
        name: state.profile.name,
        country: state.profile.country,
        points: state.championshipPoints,
        wins: state.wins,
        isPlayer: true
      }
    ]
      .sort((a, b) =>
        (Number(b.points) || 0) - (Number(a.points) || 0)
      )
      .slice(0, 20);

    list.innerHTML = rows.map((entry, index) => `
      <div class="leaderboard-row ${entry.isPlayer ? "current-player" : ""}">
        <span class="leaderboard-rank">${index + 1}</span>
        <span class="leaderboard-player">
          <strong>${escapeHTML(entry.name || "Pilote")}</strong>
          <small>${escapeHTML(entry.country || "—")}</small>
        </span>
        <span class="leaderboard-points">${Number(entry.points) || 0} pts</span>
      </div>`
    ).join("");
  }

  /* ============================ NAVIGATION ====================== */

  function navigate(screenId) {
    const target = $(screenId);

    if (!target) {
      toast("Cette section n'existe pas dans le HTML actuel.");
      return;
    }

    document.querySelectorAll(
      "#motoApp main section, #motoApp > section"
    ).forEach(section => {
      if (section.id && section.id.endsWith("Screen")) {
        section.hidden = section.id !== screenId;
      }
    });

    target.hidden = false;
    currentScreen = screenId;

    document.querySelectorAll("[data-nav]").forEach(button => {
      const active = button.dataset.nav === screenId;

      button.classList.toggle("active", active);
      button.setAttribute(
        "aria-current",
        active ? "page" : "false"
      );
    });

    if (screenId === "homeScreen") updateHomeUI();
    if (screenId === "careerScreen") updateCareerUI();
    if (screenId === "garageScreen") updateGarageUI();
    if (screenId === "championshipScreen") updateChampionshipUI();
    if (screenId === "settingsScreen") updateSettingsUI();

    if (screenId === "raceScreen") {
      requestAnimationFrame(resizeRenderer);
    }
  }

  function bindNavigation() {
    document.querySelectorAll("[data-nav]").forEach(button => {
      button.addEventListener("click", () => {
        navigate(button.dataset.nav);
      });
    });

    document.querySelectorAll("[data-go]").forEach(button => {
      button.addEventListener("click", () => {
        const dest = button.dataset.go;

        if (dest === "raceScreen") {
          startRace(selectedMissionId);
        } else {
          navigate(dest);
        }
      });
    });

    const mapping = {
      homeButton: "homeScreen",
      careerButton: "careerScreen",
      openGarageButton: "garageScreen",
      profileButton: "settingsScreen"
    };

    Object.entries(mapping).forEach(([id, screen]) => {
      $(id)?.addEventListener("click", () => navigate(screen));
    });

    $("homeRaceButton")?.addEventListener("click", () => {
      startRace(selectedMissionId);
    });

    $("challengeMasterButton")?.addEventListener(
      "click",
      challengeMaster
    );

    $("challengeMasterChampionshipButton")?.addEventListener(
      "click",
      challengeMaster
    );

    $("editProfileButton")?.addEventListener("click", () => {
      show("profileEditForm", true);
      $("playerNameInput")?.focus();
    });

    $("cancelProfileButton")?.addEventListener("click", () => {
      show("profileEditForm", false);
      updateProfileUI();
    });

    $("saveProfileButton")?.addEventListener("click", saveProfile);

    $("refreshLeaderboardButton")?.addEventListener(
      "click",
      updateChampionshipUI
    );

    $("saveProgressButton")?.addEventListener(
      "click",
      () => saveProgress(true)
    );

    /*
      CORRECTION :
      Le clic sur les missions est géré par délégation plus bas.
      Ainsi, les boutons recréés par updateCareerUI() continuent
      de fonctionner après chaque actualisation de la liste.
    */

    if ($(".topbar") && !$("openSettingsButton")) {
      const button = document.createElement("button");

      button.id = "openSettingsButton";
      button.type = "button";
      button.className = "secondary-btn compact";
      button.textContent = "⚙";
      button.setAttribute("aria-label", "Paramètres");

      button.addEventListener("click", () => {
        navigate("settingsScreen");
      });

      $(".topbar").appendChild(button);
    }
  }

  function saveProfile() {
    const name = $("playerNameInput")?.value.trim();
    const country = $("playerCountrySelect")?.value || "Haïti";

    if (!name || name.length < 2) {
      toast("Entrez un nom de pilote d'au moins 2 caractères.");
      return;
    }

    state.profile.name = name.slice(0, 32);
    state.profile.country = country;

    show("profileEditForm", false);

    updateProfileUI();
    updateHomeUI();
    updateChampionshipUI();

    scheduleSave();
    toast("Profil enregistré.");
  }

  /* ============================== GARAGE ======================= */

  function owned(id) {
    return state.ownedBikes.includes(id);
  }

  function upgradePrice(id, key) {
    return Math.round(
      (220 + id * 55) *
      (1 + upgradeLevel(id, key) * 0.85)
    );
  }

  function buyOrSelectBike(id) {
    const bike = BIKES[id];
    if (!bike) return;

    if (!owned(id)) {
      if (state.credits < bike.price) {
        toast(`Crédits insuffisants : ${bike.price} nécessaires.`);
        return;
      }

      state.credits -= bike.price;
      state.ownedBikes.push(id);

      toast(`${bike.name} achetée.`);
    } else {
      toast(`${bike.name} sélectionnée.`);
    }

    state.selectedBike = id;
    garageBikeId = id;

    updateGarageUI();
    updateHomeUI();

    if (playerBike3D && currentScreen === "raceScreen") {
      updatePlayerBikePaint();
    }

    scheduleSave();
  }

  function updateGarageUI() {
    const bike = getBikeStats(garageBikeId);

    const color = state.bikePaints[garageBikeId] ||
      `#${bike.color.toString(16).padStart(6, "0")}`;

    text("garageBikeName", bike.name);

    text(
      "bikeOwnedBadge",
      owned(garageBikeId)
        ? "Possédée"
        : `${bike.price} crédits`
    );

    const art = $("garageBikeArt");

    if (art) {
      art.style.setProperty("--bike-color", color);
      art.setAttribute("aria-label", bike.name);
    }

    text("statSpeed", Math.round(bike.speed));
    text("statAccel", Math.round(bike.acceleration));
    text("statHandling", Math.round(bike.handling));
    text("statBraking", Math.round(bike.braking));
    text("statNitro", Math.round(bike.nitro));

    renderBikeShop();
    renderUpgrades();
    renderPaintOptions();
  }

  function renderBikeShop() {
    const list = $("bikeShopList");
    if (!list) return;

    list.innerHTML = BIKES.map(bike => `
      <article class="bike-shop-card ${bike.id === garageBikeId ? "selected" : ""}">
        <div class="bike-shop-color"
          style="background:#${bike.color.toString(16).padStart(6, "0")}"></div>
        <div class="bike-shop-info">
          <strong>${escapeHTML(bike.name)}</strong>
          <small>${bike.speed} km/h · Maniabilité ${bike.handling}</small>
        </div>
        <button type="button" data-bike-action="${bike.id}">
          ${bike.id === garageBikeId
            ? "Sélectionnée"
            : owned(bike.id)
              ? "Choisir"
              : `${bike.price} crédits`}
        </button>
      </article>`
    ).join("");

    list.querySelectorAll("[data-bike-action]").forEach(button => {
      button.addEventListener("click", () => {
        buyOrSelectBike(Number(button.dataset.bikeAction));
      });
    });
  }

  function renderUpgrades() {
    const list = $("upgradeList");
    if (!list) return;

    const options = [
      ["speed", "Moteur / vitesse"],
      ["acceleration", "Accélération"],
      ["handling", "Pneus / maniabilité"],
      ["braking", "Freins"],
      ["nitro", "Système nitro"]
    ];

    list.innerHTML = options.map(([key, label]) => {
      const level = upgradeLevel(garageBikeId, key);
      const price = upgradePrice(garageBikeId, key);

      return `
        <div class="upgrade-row">
          <div>
            <strong>${label}</strong>
            <small>Niveau ${level}/5</small>
          </div>
          <button type="button"
            data-upgrade="${key}"
            ${level >= 5 || !owned(garageBikeId) ? "disabled" : ""}>
            ${level >= 5 ? "MAX" : `Améliorer · ${price}`}
          </button>
        </div>`;
    }).join("");

    list.querySelectorAll("[data-upgrade]").forEach(button => {
      button.addEventListener("click", () => {
        purchaseUpgrade(
          garageBikeId,
          button.dataset.upgrade
        );
      });
    });
  }

  function purchaseUpgrade(id, key) {
    if (!owned(id)) {
      toast("Achetez d'abord cette moto.");
      return;
    }

    const level = upgradeLevel(id, key);

    if (level >= 5) {
      toast("Niveau maximum atteint.");
      return;
    }

    const price = upgradePrice(id, key);

    if (state.credits < price) {
      toast("Crédits insuffisants.");
      return;
    }

    state.credits -= price;

    state.bikeUpgrades[id] ||= {};
    state.bikeUpgrades[id][key] = level + 1;

    updateGarageUI();
    updateHomeUI();

    scheduleSave();
    toast("Amélioration installée.");
  }

  function renderPaintOptions() {
    const container = $("paintOptions");
    if (!container) return;

    const current = state.bikePaints[garageBikeId];

    container.innerHTML = PAINTS.map(([name, color]) => `
      <button type="button"
        class="paint-option ${current === color ? "selected" : ""}"
        data-paint="${color}"
        title="${escapeHTML(name)}"
        aria-label="${escapeHTML(name)}"
        style="background:${color};width:36px;height:36px;border-radius:50%;border:2px solid ${current === color ? "#fff" : "transparent"};cursor:pointer">
      </button>`
    ).join("");

    container.querySelectorAll("[data-paint]").forEach(button => {
      button.addEventListener("click", () => {
        state.bikePaints[garageBikeId] = button.dataset.paint;

        updateGarageUI();

        if (state.selectedBike === garageBikeId) {
          updatePlayerBikePaint();
        }

        scheduleSave();
      });
    });
  }

  function applyPaint() {
    if (!owned(garageBikeId)) {
      toast("Achetez d'abord cette moto.");
      return;
    }

    if (!state.bikePaints[garageBikeId]) {
      toast("Choisissez une couleur.");
      return;
    }

    if (playerBike3D && state.selectedBike === garageBikeId) {
      updatePlayerBikePaint();
    }

    updateGarageUI();
    scheduleSave();

    toast("Peinture appliquée.");
  }

  /* ============================= PARAMÈTRES ==================== */

  function updateSettingsUI() {
    if ($("settingTilt")) {
      $("settingTilt").checked = !!state.settings.tilt;
    }

    if ($("settingVibration")) {
      $("settingVibration").checked =
        !!state.settings.vibration;
    }

    if ($("settingReducedEffects")) {
      $("settingReducedEffects").checked =
        !!state.settings.reducedEffects;
    }

    if ($("graphicsQuality")) {
      $("graphicsQuality").value =
        state.settings.graphicsQuality;
    }

    text("gameVersion", VERSION);
  }

  function bindSettings() {
    $("settingTilt")?.addEventListener("change", event => {
      state.settings.tilt = event.target.checked;

      if (state.settings.tilt) {
        requestTiltPermission();
      }

      scheduleSave();
    });

    $("settingVibration")?.addEventListener("change", event => {
      state.settings.vibration = event.target.checked;
      scheduleSave();
    });

    $("settingReducedEffects")?.addEventListener("change", event => {
      state.settings.reducedEffects = event.target.checked;
      configureRendererQuality();
      scheduleSave();
    });

    $("graphicsQuality")?.addEventListener("change", event => {
      state.settings.graphicsQuality = event.target.value;
      configureRendererQuality();
      scheduleSave();
    });
  }

  async function requestTiltPermission() {
    try {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        const permission =
          await DeviceOrientationEvent.requestPermission();

        if (permission !== "granted") {
          state.settings.tilt = false;
          updateSettingsUI();
          toast("Permission gyroscope refusée.");
          return;
        }
      }

      toast("Contrôle par inclinaison activé.");
    } catch (error) {
      console.warn("[FOBAS] Gyroscope :", error);
      toast("Gyroscope indisponible sur cet appareil.");
    }
  }

  /* ========================== MOTEUR THREE.JS ================== */

  function material(color, roughness = 0.7, metalness = 0.1) {
    return new three.MeshStandardMaterial({
      color,
      roughness,
      metalness
    });
  }

  function box(parent, w, h, d, mat, x, y, z) {
    const mesh = new three.Mesh(
      new three.BoxGeometry(w, h, d),
      mat
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
  }

  function cylinder(
    parent, r1, r2, h, mat, x, y, z, segments = 16
  ) {
    const mesh = new three.Mesh(
      new three.CylinderGeometry(r1, r2, h, segments),
      mat
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;

    parent.add(mesh);

    return mesh;
  }

  function createWheel(parent, x, y, z, radius = 0.4) {
    const group = new three.Group();
    group.position.set(x, y, z);

    const tire = new three.Mesh(
      new three.TorusGeometry(
        radius,
        radius * 0.17,
        12,
        24
      ),
      material(0x111315, 0.98)
    );

    tire.rotation.y = Math.PI / 2;
    tire.castShadow = true;
    group.add(tire);

    const rim = new three.Mesh(
      new three.CylinderGeometry(
        radius * 0.62,
        radius * 0.62,
        0.08,
        20
      ),
      material(0xb9c3cd, 0.28, 0.8)
    );

    rim.rotation.z = Math.PI / 2;
    group.add(rim);

    const hub = new three.Mesh(
      new three.CylinderGeometry(
        radius * 0.16,
        radius * 0.16,
        0.1,
        12
      ),
      material(0x414952, 0.3, 0.8)
    );

    hub.rotation.z = Math.PI / 2;
    group.add(hub);

    parent.add(group);

    return group;
  }

  function createMotorcycle(color = 0xe53935, scale = 1) {
    const bike = new three.Group();
    bike.scale.setScalar(scale);

    const paint = material(color, 0.3, 0.5);
    const dark = material(0x20242a, 0.75, 0.1);
    const metal = material(0xb9c3cd, 0.28, 0.8);

    const wheels = [];

    wheels.push(createWheel(bike, 0, 0.42, -0.94, 0.38));
    wheels.push(createWheel(bike, 0, 0.42, 0.91, 0.38));

    box(bike, 0.12, 0.15, 1.05, metal, 0, 0.72, -0.02);
    box(bike, 0.43, 0.4, 0.45, dark, 0, 0.65, 0.17);

    const tank = new three.Mesh(
      new three.SphereGeometry(0.35, 18, 12),
      paint
    );

    tank.scale.set(0.85, 0.65, 1.25);
    tank.position.set(0, 1.05, -0.12);
    tank.castShadow = true;

    bike.add(tank);

    box(bike, 0.38, 0.12, 0.55, dark, 0, 1.1, 0.48);
    box(bike, 0.08, 0.74, 0.08, metal, 0, 0.83, -0.73);
    box(bike, 0.86, 0.06, 0.07, metal, 0, 1.32, -0.64);
    box(bike, 0.12, 0.12, 0.68, metal, -0.24, 0.61, 0.51);

    const fairing = new three.Mesh(
      new three.SphereGeometry(0.32, 16, 12),
      paint
    );

    fairing.scale.set(0.7, 0.85, 0.75);
    fairing.position.set(0, 0.91, -0.62);
    fairing.castShadow = true;

    bike.add(fairing);

    const lampMat = new three.MeshStandardMaterial({
      color: 0xfff2c4,
      emissive: 0xffc45b,
      emissiveIntensity: 0.8
    });

    const lamp = new three.Mesh(
      new three.SphereGeometry(0.12, 12, 10),
      lampMat
    );

    lamp.scale.set(1, 0.75, 0.4);
    lamp.position.set(0, 1.04, -0.9);

    bike.add(lamp);

    const rider = new three.Group();
    const suit = material(0x20252d, 0.8);
    const helmetMat = material(0xf2f3f4, 0.25, 0.15);

    const torso = new three.Mesh(
      new three.CapsuleGeometry(0.18, 0.43, 4, 8),
      suit
    );

    torso.rotation.x = -0.35;
    torso.position.set(0, 1.48, 0.16);

    rider.add(torso);

    const helmet = new three.Mesh(
      new three.SphereGeometry(0.19, 16, 12),
      helmetMat
    );

    helmet.position.set(0, 1.82, -0.12);
    rider.add(helmet);

    const visor = new three.Mesh(
      new three.SphereGeometry(0.12, 12, 8),
      material(0x273746, 0.15, 0.5)
    );

    visor.scale.set(1, 0.7, 0.5);
    visor.position.set(0, 1.83, -0.26);

    rider.add(visor);

    [-1, 1].forEach(side => {
      const arm = new three.Mesh(
        new three.CylinderGeometry(0.055, 0.065, 0.53, 8),
        suit
      );

      arm.position.set(side * 0.23, 1.38, -0.32);
      arm.rotation.x = -0.7;
      arm.rotation.z = side * 0.32;

      rider.add(arm);
    });

    bike.add(rider);

    bike.userData.wheels = wheels;
    bike.userData.rider = rider;
    bike.userData.paintMaterial = paint;

    return bike;
  }

  function updatePlayerBikePaint() {
    if (!playerBike3D) return;

    const color = state.bikePaints[state.selectedBike] ||
      `#${currentBike().color.toString(16).padStart(6, "0")}`;

    const paintMaterial = playerBike3D.userData.paintMaterial;

    if (paintMaterial) {
      paintMaterial.color.set(color);
      paintMaterial.needsUpdate = true;
    }
  }

  function createTree() {
    const tree = new three.Group();

    cylinder(
      tree,
      0.18,
      0.12,
      1.5,
      material(0x6c4a30),
      0,
      0.75,
      0,
      8
    );

    const leaves = new three.Mesh(
      new three.ConeGeometry(
        rand(0.75, 1.15),
        rand(1.8, 2.7),
        8
      ),
      material(pick([
        0x267447,
        0x317d49,
        0x448b48,
        0x236b45
      ]))
    );

    leaves.position.y = 2;
    leaves.castShadow = true;

    tree.add(leaves);

    return tree;
  }

  function buildRoad() {
    roadSegments = [];

    const roadMat = material(0x30373b, 0.96);
    const edgeMat = material(0xd6d5ca, 0.9);
    const lineMat = material(0xf5f4e9, 0.8);
    const redMat = material(0xe9484e, 0.8);

    for (let i = 0; i < 36; i++) {
      const segment = new three.Group();
      segment.position.z = -i * 7;

      const road = new three.Mesh(
        new three.BoxGeometry(8.8, 0.12, 7.1),
        roadMat
      );

      road.position.y = -0.045;
      road.receiveShadow = true;

      segment.add(road);

      for (const side of [-1, 1]) {
        box(
          segment,
          0.26,
          0.16,
          7.1,
          edgeMat,
          side * 4.35,
          0.02,
          0
        );

        box(
          segment,
          0.15,
          0.17,
          1.4,
          i % 2 ? redMat : lineMat,
          side * 4.25,
          0.08,
          0
        );
      }

      box(
        segment,
        0.12,
        0.025,
        2.4,
        lineMat,
        0,
        0.025,
        0
      );

      world.add(segment);
      roadSegments.push(segment);
    }
  }

  function buildScenery() {
    scenery = [];

    const ground = new three.Mesh(
      new three.PlaneGeometry(500, 600),
      material(0x527c42, 1)
    );

    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.14, -150);
    ground.receiveShadow = true;

    world.add(ground);

    for (let i = 0; i < 54; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const tree = createTree();

      tree.position.set(
        side * rand(6, 18),
        -0.1,
        -rand(15, 235)
      );

      tree.userData.initialX = tree.position.x;

      world.add(tree);
      scenery.push(tree);
    }

    const rockMat = material(0x777c7e, 0.96);

    for (let i = 0; i < 18; i++) {
      const rock = new three.Mesh(
        new three.DodecahedronGeometry(
          rand(0.3, 0.8),
          0
        ),
        rockMat
      );

      rock.position.set(
        (i % 2 ? 1 : -1) * rand(5.4, 10),
        0.2,
        -rand(20, 220)
      );

      rock.rotation.set(
        rand(0, 2),
        rand(0, 2),
        rand(0, 2)
      );

      rock.castShadow = true;

      world.add(rock);
      scenery.push(rock);
    }
  }

  function createAIRiders() {
    if (!world || !three || !currentRace) return;

    aiRiders.forEach(ai => world.remove(ai));
    aiRiders = [];

    const colors = [
      0x1687ee,
      0xffb020,
      0x8e44ad,
      0x18a878
    ];

    currentRace.ai.forEach((data, i) => {
      const ai = createMotorcycle(colors[i], 0.9);

      ai.position.set(data.lane, 0.05, -9 - i * 8);
      ai.userData.index = i;

      world.add(ai);
      aiRiders.push(ai);
    });
  }

  async function initThree() {
    const canvas = $("raceCanvas");

    if (!canvas) {
      throw new Error("Élément #raceCanvas absent du HTML.");
    }

    three = await import(THREE_URL);

    scene = new three.Scene();
    scene.background = new three.Color(0x8db8d5);
    scene.fog = new three.Fog(0x8db8d5, 65, 260);

    camera = new three.PerspectiveCamera(65, 1, 0.1, 500);

    camera.position.set(0, 4.6, 9.5);
    camera.lookAt(0, 1, -5);

    renderer = new three.WebGLRenderer({
      canvas,
      antialias: state.settings.graphicsQuality !== "low",
      alpha: false,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.6)
    );

    renderer.shadowMap.enabled =
      !state.settings.reducedEffects &&
      state.settings.graphicsQuality === "high";

    if ("outputColorSpace" in renderer) {
      renderer.outputColorSpace = three.SRGBColorSpace;
    }

    if ("toneMapping" in renderer) {
      renderer.toneMapping = three.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
    }

    world = new three.Group();
    scene.add(world);

    scene.add(
      new three.HemisphereLight(
        0xdceeff,
        0x3b4d32,
        2
      )
    );

    const sun = new three.DirectionalLight(0xfff1d0, 2.5);

    sun.position.set(-12, 20, 8);
    sun.castShadow = renderer.shadowMap.enabled;

    scene.add(sun);

    const fill = new three.DirectionalLight(0x91c8ff, 0.7);

    fill.position.set(12, 7, -20);

    scene.add(fill);

    buildRoad();
    buildScenery();

    playerBike3D = createMotorcycle(currentBike().color);
    playerBike3D.position.set(0, 0.05, 2);

    world.add(playerBike3D);

    updatePlayerBikePaint();

    window.addEventListener(
      "resize",
      resizeRenderer,
      { passive: true }
    );

    resizeRenderer();
  }

  function configureRendererQuality() {
    if (!renderer) return;

    renderer.shadowMap.enabled =
      !state.settings.reducedEffects &&
      state.settings.graphicsQuality === "high";

    const ratio =
      state.settings.graphicsQuality === "low" ? 1
      : state.settings.graphicsQuality === "medium" ? 1.25
      : 1.6;

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, ratio)
    );

    resizeRenderer();
  }

  function resizeRenderer() {
    if (!renderer || !camera) return;

    const canvas = $("raceCanvas");
    const parent = canvas?.parentElement;

    const width = Math.max(
      1,
      parent?.clientWidth || window.innerWidth
    );

    const height = Math.max(
      1,
      parent?.clientHeight ||
        Math.min(window.innerHeight * 0.55, 600)
    );

    renderer.setSize(width, height, false);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function resetRaceWorld() {
    roadSegments.forEach((segment, index) => {
      segment.position.z = -index * 7;
    });

    scenery.forEach(obj => {
      obj.position.z = -rand(20, 250);

      if (obj.userData.initialX !== undefined) {
        obj.position.x = obj.userData.initialX;
      }
    });

    if (playerBike3D) {
      playerBike3D.position.set(0, 0.05, 2);
      playerBike3D.rotation.set(0, 0, 0);
      updatePlayerBikePaint();
    }

    cameraZoom = 1;
    steering = 0;
    throttle = 0;
    lastCollisionTime = 0;
  }

  /* ========================== COURSE / TOURNOI ================= */

  function buildRaceData(missionId, masterChallenge = false) {
    const mission = missionById(missionId);
    const factor = mission.difficulty.factor;

    const ai = Array.from({ length: 4 }, (_, i) => ({
      name: masterChallenge && i === 0
        ? "MEME Selvandieu"
        : [
            "Alex Racing",
            "Speed Master",
            "Turbo Rider",
            "Night Hawk"
          ][i],

      lane: [-2.1, -0.7, 0.7, 2.1][i],
      speed: 65 + i * 5,
      targetSpeed: (72 + i * 9) * factor,
      distance: 0,
      phase: rand(0, Math.PI * 2)
    }));

    if (masterChallenge) {
      ai[0].targetSpeed = Math.max(
        100,
        currentBike().speed * 0.88
      );
    }

    return {
      missionId,
      mission,
      masterChallenge,
      started: false,
      elapsed: 0,
      distance: 0,
      totalDistance: 1800 * mission.laps,
      laps: mission.laps,
      ai,
      lastPosition: 5
    };
  }

  function challengeMaster() {
    if (
      state.level < 10 &&
      state.completedMissions.length < 9
    ) {
      toast(
        "Terminez au moins 9 missions avant le défi du maître."
      );
      return;
    }

    selectedMissionId = 35;
    startRace(35, true);
  }

  function startRace(
    missionId = selectedMissionId,
    masterChallenge = false
  ) {
    if (currentRace && !raceFinished && !paused) {
      if (!window.confirm("Abandonner la course actuelle ?")) {
        return;
      }
    }

    const id = clamp(Number(missionId) || 1, 1, 35);

    if (
      !state.unlockedMissions.includes(id) &&
      id !== 35
    ) {
      toast("Cette mission est verrouillée.");
      return;
    }

    selectedMissionId = id;

    currentRace = buildRaceData(
      id,
      masterChallenge || id === 35
    );

    currentSpeed = 0;
    nitroEnergy = 100;
    playerLane = 0;
    steering = 0;
    throttle = 0;
    raceClock = 0;
    countdown = 3;
    countdownAccumulator = 0;

    paused = false;
    raceFinished = false;

    inputLeft = false;
    inputRight = false;
    inputGas = false;
    inputBrake = false;
    inputNitro = false;

    resetRaceWorld();
    createAIRiders();

    navigate("raceScreen");

    show("pauseOverlay", false);
    show("resultOverlay", false);
    show("countdownDisplay", true);

    text("countdownDisplay", "3");
    text("pauseButton", "Ⅱ");

    const m = currentRace.mission;

    text("raceMissionName", m.name);
    text(
      "raceLocationName",
      `${m.location.city}, ${m.location.country}`
    );
    text("raceDifficultyName", m.difficulty.name);
    text("positionDisplay", "5/5");
    text("lapDisplay", `0/${m.laps}`);
    text("timeDisplay", "00:00");
    text("speedDisplay", "0 km/h");
    text("nitroDisplay", "100%");

    if ($("nitroProgress")) {
      $("nitroProgress").style.width = "100%";
    }

    if ($("nitroBar")) {
      $("nitroBar").style.width = "100%";
    }

    toast(
      currentRace.masterChallenge
        ? "Défi du maître : affrontez MEME Selvandieu !"
        : `Mission ${id}/35 : préparez-vous !`
    );
  }

  function getPlayerPosition() {
    if (!currentRace) return 5;

    let position = 1;

    currentRace.ai.forEach(ai => {
      if (ai.distance > currentRace.distance) {
        position++;
      }
    });

    return clamp(position, 1, 5);
  }

  function calculateRewards(position, mission) {
    const reward = mission.reward;

    const table = {
      1: {
        credits: reward,
        xp: mission.xp,
        points: 100
      },
      2: {
        credits: Math.round(reward * 0.6),
        xp: Math.round(mission.xp * 0.65),
        points: 60
      },
      3: {
        credits: Math.round(reward * 0.35),
        xp: Math.round(mission.xp * 0.4),
        points: 35
      },
      4: {
        credits: Math.round(reward * 0.1),
        xp: Math.round(mission.xp * 0.15),
        points: 10
      },
      5: {
        credits: 0,
        xp: 5,
        points: 0
      }
    };

    return table[position] || table[5];
  }

  function finishRace(forcedPosition = null) {
    if (!currentRace || raceFinished) return;

    raceFinished = true;
    paused = false;
    currentSpeed = 0;

    releaseAllControls();

    show("countdownDisplay", false);
    show("pauseOverlay", false);

    const position = clamp(
      Number(forcedPosition) || getPlayerPosition(),
      1,
      5
    );

    const mission = currentRace.mission;
    const reward = calculateRewards(position, mission);

    state.races++;

    state.bestPosition = state.bestPosition
      ? Math.min(state.bestPosition, position)
      : position;

    state.credits += reward.credits;
    state.xp += reward.xp;
    state.championshipPoints += reward.points;

    /*
      CORRECTION DE PROGRESSION :
      Une mission est considérée terminée lorsque le joueur
      franchit la ligne d'arrivée, pas uniquement lorsqu'il gagne.

      Les crédits, XP et points restent calculés selon la position.
      La mission suivante est déverrouillée après la fin du parcours.
    */
    if (!state.completedMissions.includes(mission.id)) {
      state.completedMissions.push(mission.id);
    }

    if (position === 1) {
      state.wins++;
    }

    if (position <= 3) {
      state.podiums++;
    }

    const next = mission.id + 1;

    if (
      next <= 35 &&
      !state.unlockedMissions.includes(next)
    ) {
      state.unlockedMissions.push(next);
    }

    updateLevel();

    text(
      "resultPosition",
      position === 1 ? "1er"
        : position === 2 ? "2e"
        : position === 3 ? "3e"
        : `${position}e`
    );

    text("resultCredits", `+${reward.credits}`);
    text("resultXP", `+${reward.xp}`);
    text(
      "resultChampionshipPoints",
      `+${reward.points}`
    );

    text(
      "resultEyebrow",
      currentRace.masterChallenge
        ? "DÉFI DU MAÎTRE"
        : `MISSION ${mission.id}/35`
    );

    text(
      "resultTitle",
      position === 1 ? "VICTOIRE !"
        : position <= 3 ? "PODIUM !"
        : "COURSE TERMINÉE"
    );

    text(
      "resultSubtitle",
      position === 1
        ? "Excellente course. Vous avez gagné."
        : position <= 3
          ? "Bonne performance. Continuez ainsi."
          : "Mission terminée. La prochaine étape est débloquée."
    );

    text(
      "resultPodiumMessage",
      position === 1
        ? "Médaille d'or — Champion"
        : position === 2
          ? "Médaille d'argent"
          : position === 3
            ? "Médaille de bronze"
            : "Course terminée — progression enregistrée."
    );

    text(
      "resultPodium",
      position <= 3
        ? ["🥇", "🥈", "🥉"][position - 1]
        : "🏁"
    );

    show("resultOverlay", true);

    updateHomeUI();
    updateCareerUI();
    updateChampionshipUI();
    updateGarageUI();

    scheduleSave();
    saveProgress(false);
  }

  function restartRace() {
    if (!currentRace) {
      startRace(selectedMissionId);
      return;
    }

    startRace(
      currentRace.missionId,
      currentRace.masterChallenge
    );
  }

  function quitRace() {
    paused = false;
    currentRace = null;
    raceFinished = false;
    currentSpeed = 0;

    releaseAllControls();

    show("pauseOverlay", false);
    show("resultOverlay", false);
    show("countdownDisplay", false);

    navigate("homeScreen");
  }

  function pauseRace() {
    if (!currentRace || raceFinished) return;

    paused = !paused;

    show("pauseOverlay", paused);
    text("pauseButton", paused ? "▶" : "Ⅱ");

    if (!paused) {
      lastFrameTime = performance.now();
    }

    if (paused) {
      releaseAllControls();
    }
  }

  function bindRaceButtons() {
    $("pauseButton")?.addEventListener("click", pauseRace);
    $("resumeButton")?.addEventListener("click", pauseRace);
    $("restartButton")?.addEventListener("click", restartRace);
    $("quitRaceButton")?.addEventListener("click", quitRace);

    $("continueButton")?.addEventListener("click", () => {
      show("resultOverlay", false);
      currentRace = null;
      raceFinished = false;
      navigate("careerScreen");
    });

    $("applyPaintButton")?.addEventListener("click", applyPaint);

    $("resultContinueButton")?.addEventListener("click", () => {
      show("resultOverlay", false);
      currentRace = null;
      raceFinished = false;
      navigate("careerScreen");
    });

    $("resultReplayButton")?.addEventListener("click", restartRace);
  }

  /* ======================= COMMANDES / CLAVIER ================= */

  function setControl(name, active) {
    if (name === "left") inputLeft = active;
    if (name === "right") inputRight = active;
    if (name === "gas") inputGas = active;
    if (name === "brake") inputBrake = active;
    if (name === "nitro") inputNitro = active;
  }

  function releaseAllControls() {
    inputLeft = false;
    inputRight = false;
    inputGas = false;
    inputBrake = false;
    inputNitro = false;

    document.querySelectorAll(".pressed").forEach(el => {
      el.classList.remove("pressed");
    });
  }

  function bindHoldButton(id, name) {
    const button = $(id);
    if (!button) return;

    button.style.touchAction = "none";

    const press = event => {
      if (event.cancelable) {
        event.preventDefault();
      }

      if (paused || raceFinished || !currentRace) return;

      setControl(name, true);
      button.classList.add("pressed");

      try {
        if (event.pointerId !== undefined) {
          button.setPointerCapture?.(event.pointerId);
        }
      } catch (_) {}
    };

    const release = event => {
      if (event?.cancelable) {
        event.preventDefault();
      }

      setControl(name, false);
      button.classList.remove("pressed");
    };

    button.addEventListener(
      "pointerdown",
      press,
      { passive: false }
    );

    button.addEventListener(
      "pointerup",
      release,
      { passive: false }
    );

    button.addEventListener(
      "pointercancel",
      release,
      { passive: false }
    );

    button.addEventListener(
      "lostpointercapture",
      release
    );

    button.addEventListener("contextmenu", event => {
      event.preventDefault();
    });
  }

  function bindInputs() {
    bindHoldButton("leftButton", "left");
    bindHoldButton("rightButton", "right");
    bindHoldButton("gasButton", "gas");
    bindHoldButton("brakeButton", "brake");
    bindHoldButton("nitroButton", "nitro");

    $("tiltButton")?.addEventListener("click", async () => {
      state.settings.tilt = !state.settings.tilt;

      updateSettingsUI();

      if (state.settings.tilt) {
        await requestTiltPermission();
      }

      scheduleSave();
    });

    window.addEventListener("keydown", event => {
      const key = event.key.toLowerCase();

      if (
        [
          "arrowleft",
          "arrowright",
          "arrowup",
          "arrowdown",
          " "
        ].includes(key)
      ) {
        event.preventDefault();
      }

      if (key === "arrowleft" || key === "a") {
        setControl("left", true);
      }

      if (key === "arrowright" || key === "d") {
        setControl("right", true);
      }

      if (key === "arrowup" || key === "w") {
        setControl("gas", true);
      }

      if (key === "arrowdown" || key === "s") {
        setControl("brake", true);
      }

      if (key === " " || key === "shift") {
        setControl("nitro", true);
      }

      if (
        key === "escape" &&
        currentRace &&
        !raceFinished
      ) {
        pauseRace();
      }
    }, { passive: false });

    window.addEventListener("keyup", event => {
      const key = event.key.toLowerCase();

      if (key === "arrowleft" || key === "a") {
        setControl("left", false);
      }

      if (key === "arrowright" || key === "d") {
        setControl("right", false);
      }

      if (key === "arrowup" || key === "w") {
        setControl("gas", false);
      }

      if (key === "arrowdown" || key === "s") {
        setControl("brake", false);
      }

      if (key === " " || key === "shift") {
        setControl("nitro", false);
      }
    });

    window.addEventListener("blur", releaseAllControls);

    document.addEventListener("visibilitychange", () => {
      releaseAllControls();

      if (
        document.hidden &&
        currentRace &&
        !raceFinished &&
        !paused
      ) {
        pauseRace();
      }
    });

    window.addEventListener("deviceorientation", event => {
      if (
        !state.settings.tilt ||
        currentScreen !== "raceScreen"
      ) {
        return;
      }

      if (typeof event.gamma === "number") {
        tiltValue = clamp(event.gamma / 24, -1, 1);
      }
    }, { passive: true });

    bindPinchZoom();
  }

  function bindPinchZoom() {
    const surface = $("canvasWrap") || $("raceCanvas");
    if (!surface) return;

    let initialDistance = 0;
    let initialZoom = 1;

    surface.addEventListener("touchstart", event => {
      if (event.touches.length !== 2) return;

      const dx =
        event.touches[0].clientX -
        event.touches[1].clientX;

      const dy =
        event.touches[0].clientY -
        event.touches[1].clientY;

      initialDistance = Math.hypot(dx, dy);
      initialZoom = cameraZoom;
    }, { passive: true });

    surface.addEventListener("touchmove", event => {
      if (
        event.touches.length !== 2 ||
        !initialDistance
      ) {
        return;
      }

      const dx =
        event.touches[0].clientX -
        event.touches[1].clientX;

      const dy =
        event.touches[0].clientY -
        event.touches[1].clientY;

      cameraZoom = clamp(
        initialZoom *
          (Math.hypot(dx, dy) / initialDistance),
        0.75,
        1.65
      );
    }, { passive: true });

    surface.addEventListener("touchend", () => {
      initialDistance = 0;
    }, { passive: true });

    surface.addEventListener("touchcancel", () => {
      initialDistance = 0;
    }, { passive: true });
  }

  /* ============================== PHYSIQUE ===================== */

  function updateRace(delta) {
    if (!currentRace || raceFinished || paused) return;

    if (!currentRace.started) {
      countdownAccumulator += delta;

      if (countdownAccumulator >= 1) {
        countdownAccumulator -= 1;
        countdown--;

        if (countdown <= 0) {
          currentRace.started = true;
          text("countdownDisplay", "GO !");

          setTimeout(() => {
            show("countdownDisplay", false);
          }, 650);
        } else {
          text("countdownDisplay", countdown);
        }
      }

      return;
    }

    raceClock += delta;
    currentRace.elapsed = raceClock;

    const bike = currentBike();
    const maxSpeed = bike.speed;

    steering = (inputRight ? 1 : 0) -
      (inputLeft ? 1 : 0);

    if (
      !inputLeft &&
      !inputRight &&
      state.settings.tilt
    ) {
      steering = tiltValue;
    }

    /*
      CORRECTION PHYSIQUE :
      L'accélération est calculée en fonction du temps écoulé.
      L'ancienne formule augmentait trop rapidement la vitesse
      et pouvait donner une sensation de commande instable.
    */
    if (inputGas) {
      const accelerationRate =
        4 + bike.acceleration * 0.055;

      currentSpeed += accelerationRate * delta;
      throttle = Math.min(1, throttle + delta * 2.5);
    } else {
      currentSpeed -= 3.2 * delta;
      throttle = Math.max(0, throttle - delta * 1.8);
    }

    if (inputBrake) {
      currentSpeed -=
        (bike.braking * 0.12 + 9) * delta;
    }

    if (
      inputNitro &&
      nitroEnergy > 0 &&
      currentSpeed > 10
    ) {
      currentSpeed += 28 * delta;
      nitroEnergy = Math.max(
        0,
        nitroEnergy - 23 * delta
      );
    } else {
      nitroEnergy = Math.min(
        100,
        nitroEnergy + 5.5 * delta
      );
    }

    const maximum =
      inputNitro && nitroEnergy > 0
        ? maxSpeed * 1.2
        : maxSpeed;

    currentSpeed = clamp(
      currentSpeed,
      0,
      maximum
    );

    playerLane = clamp(
      playerLane +
        steering * delta *
        (2.8 + bike.handling * 0.025),
      -3.45,
      3.45
    );

    if (Math.abs(playerLane) > 3.15) {
      currentSpeed = Math.max(
        0,
        currentSpeed - delta * 10
      );
    }

    const playerMetersPerSecond =
      currentSpeed / 3.6;

    currentRace.distance +=
      playerMetersPerSecond * delta;

    currentRace.ai.forEach(ai => {
      ai.speed = lerp(
        ai.speed,
        ai.targetSpeed,
        Math.min(1, delta * 0.18)
      );

      ai.distance +=
        ai.speed / 3.6 * delta;
    });

    /*
      CORRECTION :
      Vérification du contact seulement si les objets 3D existent.
      Cela évite une erreur lorsque WebGL n'a pas pu démarrer.
    */
    const now = performance.now();

    if (playerBike3D) {
      aiRiders.forEach((ai, i) => {
        const data = currentRace.ai[i];
        if (!data) return;

        if (
          Math.abs(
            ai.position.z - playerBike3D.position.z
          ) < 1.1 &&
          Math.abs(
            ai.position.x - playerBike3D.position.x
          ) < 0.7 &&
          now - lastCollisionTime > 900
        ) {
          currentSpeed *= 0.88;
          lastCollisionTime = now;

          if (state.settings.vibration && navigator.vibrate) {
            navigator.vibrate(60);
          }

          toast(
            "Contact ! Gardez vos distances.",
            1000
          );
        }
      });
    }

    if (
      currentRace.distance >=
      currentRace.totalDistance
    ) {
      finishRace();
    }

    updateHUD();
  }

  function updateHUD() {
    if (!currentRace) return;

    const position = getPlayerPosition();

    const lap = Math.min(
      currentRace.laps,
      Math.floor(
        currentRace.distance / 1800
      ) + 1
    );

    text("positionDisplay", `${position}/5`);
    text("timeDisplay", formatTime(raceClock));
    text("lapDisplay", `${lap}/${currentRace.laps}`);
    text("speedDisplay", `${Math.round(currentSpeed)} km/h`);
    text("nitroDisplay", `${Math.round(nitroEnergy)}%`);

    if ($("nitroProgress")) {
      $("nitroProgress").style.width =
        `${nitroEnergy}%`;
    }

    if ($("nitroBar")) {
      $("nitroBar").style.width =
        `${nitroEnergy}%`;
    }
  }

  function animateThree(delta) {
    if (!renderer || !scene || !camera) return;

    if (playerBike3D) {
      playerBike3D.rotation.z = lerp(
        playerBike3D.rotation.z,
        -steering * 0.12,
        Math.min(1, delta * 5)
      );

      playerBike3D.position.x = lerp(
        playerBike3D.position.x,
        playerLane,
        Math.min(1, delta * 5)
      );

      playerBike3D.userData.wheels?.forEach(wheel => {
        wheel.rotation.x +=
          currentSpeed * delta * 0.09;
      });
    }

    /*
      Le rendu reste actif pendant le décompte et après l'arrivée.
      Le déplacement de la piste est limité aux courses en cours.
    */
    if (
      currentRace &&
      currentRace.started &&
      !paused &&
      !raceFinished
    ) {
      const movement = currentSpeed * delta * 0.16;

      roadSegments.forEach(segment => {
        segment.position.z += movement;

        if (segment.position.z > 12) {
          segment.position.z -=
            roadSegments.length * 7;
        }
      });

      scenery.forEach(obj => {
        obj.position.z += movement;

        if (obj.position.z > 14) {
          obj.position.z = -rand(190, 280);
        }
      });

      aiRiders.forEach((ai, index) => {
        const data = currentRace.ai[index];
        if (!data) return;

        const relativeSpeed =
          currentSpeed - data.speed;

        ai.position.z +=
          relativeSpeed * delta * 0.11;

        data.phase += delta;

        ai.position.x = lerp(
          ai.position.x,
          data.lane +
            Math.sin(data.phase) * 0.12,
          Math.min(1, delta * 1.4)
        );

        if (ai.position.z > 7) {
          ai.position.z = -rand(20, 42);

          data.lane = pick([
            -2.2,
            -1.1,
            0,
            1.1,
            2.2
          ]);
        }

        if (ai.position.z < -80) {
          ai.position.z = -80;
        }
      });

      camera.position.x = lerp(
        camera.position.x,
        playerLane * 0.55,
        Math.min(1, delta * 2)
      );

      camera.fov = lerp(
        camera.fov,
        65 - (cameraZoom - 1) * 8,
        Math.min(1, delta * 4)
      );

      camera.updateProjectionMatrix();

      camera.lookAt(
        playerLane * 0.4,
        0.9,
        -5
      );
    }

    renderer.render(scene, camera);
  }

  function gameLoop(timestamp) {
    if (!lastFrameTime) {
      lastFrameTime = timestamp;
    }

    const delta = clamp(
      (timestamp - lastFrameTime) / 1000,
      0,
      0.05
    );

    lastFrameTime = timestamp;

    try {
      updateRace(delta);
      animateThree(delta);
    } catch (error) {
      console.error("[FOBAS] Erreur de jeu :", error);

      toast(
        "Erreur pendant la course. Consultez la console.",
        4000
      );
    }

    rafId = requestAnimationFrame(gameLoop);
  }

  /* ====================== ÉVÉNEMENTS DYNAMIQUES ================ */

  function bindDynamicActions() {
    /*
      CORRECTION IMPORTANTE :
      Les cartes de mission sont recréées avec innerHTML.
      Un événement attaché directement à l'ancienne carte disparaît
      donc lorsque la liste est redessinée.

      La délégation conserve les clics fonctionnels, même après
      plusieurs actualisations de la carrière.
    */
    document.addEventListener("click", event => {
      const missionButton = event.target.closest(
        "[data-mission-id]"
      );

      if (!missionButton) return;

      if (missionButton.disabled) {
        toast("Cette mission est verrouillée.");
        return;
      }

      const id = Number(missionButton.dataset.missionId);

      if (!Number.isInteger(id) || id < 1 || id > 35) {
        return;
      }

      selectedMissionId = id;

      if (currentScreen === "careerScreen") {
        updateCareerUI();
      }

      startRace(selectedMissionId);
    });
  }

  /* ================================ INIT ======================= */

  async function init() {
    text("gameVersion", VERSION);

    await loadProgress();

    bindNavigation();
    bindInputs();
    bindRaceButtons();
    bindSettings();
    bindDynamicActions();

    garageBikeId = state.selectedBike;

    updateHomeUI();
    updateCareerUI();
    updateGarageUI();
    updateChampionshipUI();
    updateSettingsUI();

    try {
      await initThree();
      toast("Moteur Three.js 3D initialisé.");
    } catch (error) {
      console.error(
        "[FOBAS] Initialisation Three.js impossible :",
        error
      );

      toast(
        "Three.js n'a pas pu démarrer. Vérifiez Internet, WebGL et #raceCanvas.",
        5000
      );
    }

    show("loadingOverlay", false);

    window.addEventListener("beforeunload", () => {
      releaseAllControls();

      if (db) {
        db.close();
        db = null;
      }
    });

    if (!rafId) {
      lastFrameTime = 0;
      rafId = requestAnimationFrame(gameLoop);
    }
  }

  function startSafely() {
    init().catch(error => {
      console.error(
        "[FOBAS] Erreur d'initialisation :",
        error
      );

      show("loadingOverlay", false);

      toast(
        "Erreur d'initialisation. Vérifiez les éléments HTML.",
        5000
      );
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      startSafely,
      { once: true }
    );
  } else {
    startSafely();
  }
})();















