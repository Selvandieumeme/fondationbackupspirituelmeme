/* ============================================================
   FOBAS MOTO RACING 3D — ENGINE CORRIGÉ
   Fichier : appmotorracingfobas.js
   Version : 5.1.0
   Three.js + IndexedDB + sauvegarde locale
   Auteur : MEME Selvandieu
   Missions : 1 à 55
   ============================================================ */

(() => {
  "use strict";

  if (window.__FOBAS_MOTO_RACING_V5__) return;
  window.__FOBAS_MOTO_RACING_V5__ = true;

  const VERSION = "5.1.0";
  const THREE_URL =
    "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";

  const DB_NAME = "FOBAS_MOTO_RACING_DB";
  const STORE = "gameData";
  const SAVE_KEY = "mainSave";
  const MAX_MISSIONS = 55;

  const $ = id => document.getElementById(id);
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = array => array[Math.floor(Math.random() * array.length)];

  const txt = (id, value) => {
    const element = $(id);
    if (element) element.textContent = String(value);
  };

  const visible = (id, show) => {
    const element = $(id);
    if (element) element.hidden = !show;
  };

  const html = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);

  const fmtTime = seconds => {
    seconds = Math.max(0, Math.floor(seconds || 0));
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
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

  /* Les 35 missions originales restent dans le même ordre. */
  const MISSION_NAMES = [
    "Premiers tours de roue",
    "Maîtrise de trajectoire",
    "Départ rapide",
    "Virages contrôlés",
    "Défi de vitesse",
    "Course du littoral",
    "Rivalité locale",
    "Route des montagnes",
    "Accélération maîtrisée",
    "Défi de freinage",
    "Sprint technique",
    "Route des champions",
    "Duel de pilotes",
    "Course nocturne",
    "Défi expert",
    "Le grand virage",
    "Vitesse supérieure",
    "Course de précision",
    "Défi des meilleurs",
    "Rivalité extrême",
    "Sprint du champion",
    "Épreuve des maîtres",
    "Route de la victoire",
    "Course internationale",
    "Défi ultime",
    "Circuit royal",
    "Légende de la piste",
    "Tournoi des champions",
    "La grande finale",
    "Défi des sept mers",
    "Championnat mondial",
    "Course de prestige",
    "L'ultime rivalité",
    "Le dernier obstacle",
    "Couronne de légende",

    /* 20 nouvelles missions : 36 à 55 */
    "Route des géants",
    "Les virages infernaux",
    "L'asphalte sans fin",
    "Tempête de vitesse",
    "Le col des champions",
    "Rivalité des titans",
    "Circuit des falaises",
    "L'épreuve des réflexes",
    "La route impitoyable",
    "Le défi des machines",
    "Les courbes du danger",
    "Grand prix de l'endurance",
    "Le serpent d'asphalte",
    "La montagne noire",
    "Les pilotes d'élite",
    "Le circuit des légendes",
    "La traversée extrême",
    "L'ultime course d'endurance",
    "Le duel des maîtres",
    "FOBAS — Couronne ultime"
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

  const BIKES = BIKE_DATA.map((data, id) => ({
    id,
    name: data[0],
    color: data[1],
    speed: data[2],
    acceleration: data[3],
    handling: data[4],
    braking: data[5],
    nitro: data[6],
    price: data[7]
  }));

  /*
   * Nombre de rivaux.
   * La formule d'origine est conservée jusqu'à la mission 35.
   * Les missions 36 à 55 continuent la progression.
   */
  function aiCountForMission(missionId) {
    const id = clamp(Math.floor(Number(missionId) || 1), 1, MAX_MISSIONS);
    if (id === 1) return 7;
    if (id === 2) return 12;
    if (id === 3) return 19;
    return 19 + (id - 3) * 7;
  }

  const MISSIONS = MISSION_NAMES.map((name, index) => {
    const id = index + 1;
    const local = DEPARTMENTS[index % DEPARTMENTS.length];

    let tier = Math.min(4, Math.floor(index / 7));
    let difficulty = DIFFICULTIES[tier];
    let laps = difficulty.laps;
    let routeLength = 1800;
    let curveIntensity = 0.25;
    let reward = difficulty.reward + index * 15;
    let xp = 40 + index * 8;

    const location = id <= 28
      ? {
          country: "Haïti",
          department: local[0],
          city: local[1][index % local[1].length]
        }
      : {
          country: INTERNATIONAL[(id - 29) % INTERNATIONAL.length][0],
          city: INTERNATIONAL[(id - 29) % INTERNATIONAL.length][1]
        };

    /*
     * Paramètres spécifiques aux nouvelles missions.
     * Chaque niveau ajoute de la distance et de la difficulté.
     */
    if (id >= 36) {
      const stage = id - 35;

      tier = Math.min(4, Math.floor((stage - 1) / 4));
      difficulty = {
        name: stage <= 5 ? "Élite"
          : stage <= 10 ? "Expert supérieur"
          : stage <= 15 ? "Légende extrême"
          : "FOBAS Ultime",
        factor: 1.08 + stage * 0.018,
        laps: Math.min(8, 3 + Math.floor((stage - 1) / 3)),
        reward: 900 + stage * 180
      };

      laps = difficulty.laps;
      routeLength = 2400 + stage * 180;
      curveIntensity = Math.min(1.9, 0.55 + stage * 0.065);
      reward = difficulty.reward + index * 30;
      xp = 180 + stage * 35;
    }

    return {
      id,
      name,
      tier,
      difficulty,
      location,
      laps,
      routeLength,
      curveIntensity,
      reward,
      xp,
      aiCount: aiCountForMission(id)
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

  const freshState = () => ({
    version: VERSION,
    profile: { name: "Pilote FOBAS", country: "Haïti" },
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
    leaderboard: [],
    settings: {
      tilt: false,
      vibration: true,
      reducedEffects: false,
      graphicsQuality: "high"
    },
    lastSaved: null
  });

  let state = freshState();
  let db = null;

  let three = null;
  let renderer = null;
  let scene = null;
  let camera = null;
  let world = null;
  let playerBike3D = null;

  let aiRiders = [];
  let aiRiderIndexes = [];
  let roadSegments = [];
  let scenery = [];

  let currentScreen = "homeScreen";
  let selectedMissionId = 1;
  let garageBikeId = 0;
  let currentRace = null;

  let paused = false;
  let raceFinished = false;
  let gameReady = false;

  let countdown = 3;
  let countdownAccumulator = 0;
  let raceClock = 0;
  let lastFrameTime = 0;
  let rafId = 0;

  let currentSpeed = 0;
  let nitroEnergy = 100;
  let playerLane = 0;
  let steering = 0;
  let throttle = 0;
  let cameraZoom = 1;
  let toastTimer = 0;
  let saveTimer = 0;
  let lastCollisionTime = 0;
  let roadCurvePhase = 0;

  let inputLeft = false;
  let inputRight = false;
  let inputGas = false;
  let inputBrake = false;
  let inputNitro = false;
  let tiltValue = 0;

  /* ============================ MESSAGES ====================== */

  function toast(message, duration = 2600) {
    let element = $("appToast");

    if (!element) {
      element = document.createElement("div");
      element.id = "appToast";

      Object.assign(element.style, {
        position: "fixed",
        left: "50%",
        bottom: "22px",
        transform: "translateX(-50%)",
        zIndex: "999999",
        maxWidth: "92vw",
        padding: "12px 16px",
        color: "#fff",
        background: "#17382f",
        border: "1px solid #4c9879",
        borderRadius: "12px",
        font: "bold 14px Arial",
        textAlign: "center",
        boxShadow: "0 8px 24px #0006"
      });

      document.body.appendChild(element);
    }

    element.textContent = message;
    element.hidden = false;

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      element.hidden = true;
    }, duration);

    if (state.settings.vibration && navigator.vibrate) {
      try {
        navigator.vibrate(30);
      } catch (_) {}
    }
  }

  function escapeProfileName(name) {
    return String(name || "Pilote").slice(0, 32);
  }

  /* ============================ SAUVEGARDE ==================== */

  function openDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB indisponible"));
        return;
      }

      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE)) {
          database.createObjectStore(STORE, { keyPath: "key" });
        }
      };

      request.onsuccess = () => {
        db = request.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };

      request.onerror = () => reject(request.error);
    });
  }

  function dbRead() {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Base non ouverte"));
        return;
      }

      const request = db.transaction(STORE, "readonly")
        .objectStore(STORE)
        .get(SAVE_KEY);

      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  }

  function dbWrite(data) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Base non ouverte"));
        return;
      }

      const transaction = db.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put({ key: SAVE_KEY, data });

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  function fallbackRead() {
    try {
      const value = localStorage.getItem("fobasMotoRacingSave");
      return value ? JSON.parse(value) : null;
    } catch (_) {
      return null;
    }
  }

  function fallbackWrite(data) {
    try {
      localStorage.setItem("fobasMotoRacingSave", JSON.stringify(data));
      return true;
    } catch (_) {
      return false;
    }
  }

  function normalizeState(saved) {
    const fresh = freshState();
    if (!saved || typeof saved !== "object") return fresh;

    const result = {
      ...fresh,
      ...saved,
      profile: { ...fresh.profile, ...(saved.profile || {}) },
      settings: { ...fresh.settings, ...(saved.settings || {}) }
    };

    for (const key of [
      "credits", "xp", "level", "races", "wins",
      "podiums", "championshipPoints"
    ]) {
      result[key] = Math.max(
        key === "level" ? 1 : 0,
        Number(result[key]) || 0
      );
    }

    result.ownedBikes = Array.isArray(result.ownedBikes)
      ? [...new Set(result.ownedBikes.map(Number).filter(id =>
          Number.isInteger(id) && Boolean(BIKES[id])))]
      : [0];

    if (!result.ownedBikes.includes(0)) {
      result.ownedBikes.unshift(0);
    }

    result.selectedBike = result.ownedBikes.includes(
      Number(result.selectedBike)
    ) ? Number(result.selectedBike) : 0;

    for (const key of ["completedMissions", "unlockedMissions"]) {
      result[key] = Array.isArray(result[key])
        ? [...new Set(result[key].map(Number).filter(id =>
            Number.isInteger(id) && id >= 1 && id <= MAX_MISSIONS))]
        : [];
    }

    if (!result.unlockedMissions.includes(1)) {
      result.unlockedMissions.unshift(1);
    }

    result.bikeUpgrades =
      result.bikeUpgrades && typeof result.bikeUpgrades === "object"
        ? result.bikeUpgrades : {};

    result.bikePaints =
      result.bikePaints && typeof result.bikePaints === "object"
        ? result.bikePaints : {};

    result.leaderboard = Array.isArray(result.leaderboard)
      ? result.leaderboard : [];

    return result;
  }

  async function loadProgress() {
    let saved = null;

    try {
      await openDB();
      saved = await dbRead();
    } catch (error) {
      console.warn("[FOBAS] IndexedDB indisponible :", error);
      saved = fallbackRead();
    }

    state = normalizeState(saved);
  }

  async function saveProgress(showMessage = false) {
    state.lastSaved = new Date().toISOString();
    let success = false;

    try {
      if (db) {
        await dbWrite(state);
        success = true;
      } else {
        success = fallbackWrite(state);
      }
    } catch (error) {
      console.warn("[FOBAS] Sauvegarde :", error);
      success = fallbackWrite(state);
    }

    if (showMessage) {
      toast(success
        ? "Progression sauvegardée."
        : "Sauvegarde impossible dans ce navigateur.");
    }

    return success;
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveProgress(false), 350);
  }

  /* ============================ XP / PROFIL =================== */

  function xpRequired(level = state.level) {
    return 150 + (Math.max(1, level) - 1) * 90;
  }

  function xpAtLevel(level) {
    let total = 0;
    for (let i = 1; i < level; i++) total += xpRequired(i);
    return total;
  }

  function updateLevel() {
    const oldLevel = state.level;
    let level = 1;
    let remaining = state.xp;

    while (level < 55 && remaining >= xpRequired(level)) {
      remaining -= xpRequired(level);
      level++;
    }

    state.level = level;

    if (level > oldLevel) {
      const bonus = (level - oldLevel) * 100;
      state.credits += bonus;
      toast(`Niveau ${level} atteint ! +${bonus} crédits.`);
    }
  }

  function upgradeLevel(id, key) {
    return clamp(Number(state.bikeUpgrades[id]?.[key]) || 0, 0, 5);
  }

  function getBikeStats(id) {
    const bike = BIKES[id] || BIKES[0];

    return {
      ...bike,
      speed: bike.speed * (1 + upgradeLevel(id, "speed") * 0.045),
      acceleration: bike.acceleration + upgradeLevel(id, "acceleration") * 3,
      handling: Math.min(100, bike.handling + upgradeLevel(id, "handling") * 3),
      braking: Math.min(100, bike.braking + upgradeLevel(id, "braking") * 3),
      nitro: Math.min(100, bike.nitro + upgradeLevel(id, "nitro") * 3)
    };
  }

  function currentBike() {
    return getBikeStats(state.selectedBike);
  }

  function missionById(id) {
    return MISSIONS.find(mission => mission.id === Number(id)) || MISSIONS[0];
  }

  function updateProfileUI() {
    const rank = state.level >= 45 ? "FOBAS Ultime"
      : state.level >= 29 ? "Légende"
      : state.level >= 22 ? "Champion"
      : state.level >= 15 ? "Expert"
      : state.level >= 8 ? "Intermédiaire"
      : "Débutant";

    txt("headerPlayerName", state.profile.name);
    txt("profileNameDisplay", state.profile.name);
    txt("profileCountryDisplay", state.profile.country);
    txt("profileLevelDisplay", state.level);
    txt("profileRankDisplay", rank);

    if ($("playerNameInput")) $("playerNameInput").value = state.profile.name;
    if ($("playerCountrySelect")) $("playerCountrySelect").value = state.profile.country;
  }

  function updateHomeUI() {
    txt("creditDisplay", state.credits);
    txt("homeLevel", state.level);
    txt("homeWins", state.wins);
    txt("homeRaces", state.races);
    txt("homeMissions", state.completedMissions.length);

    const bike = BIKES[state.selectedBike] || BIKES[0];
    txt("homeBikeName", bike.name);
    txt("homeBikeDescription", `Vitesse ${bike.speed} km/h · Maniabilité ${bike.handling}/100`);

    const art = $("homeBikeArt");
    if (art) {
      art.style.setProperty("--bike-color", `#${bike.color.toString(16).padStart(6, "0")}`);
      art.setAttribute("aria-label", bike.name);
    }

    updateProfileUI();
  }

  function updateCareerUI() {
    const required = xpRequired(state.level);
    const within = Math.max(0, state.xp - xpAtLevel(state.level));
    const percent = clamp(within / required * 100, 0, 100);

    txt("careerLevel", state.level);
    txt("xpDisplay", within);
    txt("xpNextDisplay", required);
    txt("completedMissionCount", state.completedMissions.length);
    txt("bestCareerPosition", state.bestPosition || "—");
    txt("careerPoints", state.championshipPoints);

    if ($("xpProgress")) $("xpProgress").style.width = `${percent}%`;
    if ($("xpBar")) $("xpBar").style.width = `${percent}%`;

    txt(
      "careerMessage",
      state.completedMissions.length >= MAX_MISSIONS
        ? "Toutes les 55 missions sont terminées."
        : `${MAX_MISSIONS - state.completedMissions.length} mission(s) restante(s).`
    );

    const list = $("raceList");
    if (!list) return;

    list.innerHTML = MISSIONS.map(mission => {
      const done = state.completedMissions.includes(mission.id);
      const unlocked = state.unlockedMissions.includes(mission.id);

      return `
        <button type="button"
          class="race-mission-card ${done ? "completed" : ""} ${selectedMissionId === mission.id ? "selected" : ""}"
          data-mission-id="${mission.id}"
          ${unlocked ? "" : "disabled"}>
          <span class="mission-number">${String(mission.id).padStart(2, "0")}</span>
          <span class="mission-info">
            <strong>${html(mission.name)}</strong>
            <small>${html(mission.difficulty.name)} · ${html(mission.location.city)}</small>
            <small>${mission.aiCount} moto IA · ${mission.laps} tour(s) · ${Math.round(mission.routeLength)} m/tour</small>
          </span>
          <span class="mission-status">${done ? "✓" : unlocked ? "▶" : "🔒"}</span>
        </button>`;
    }).join("");
  }

  function updateChampionshipUI() {
    txt("championPoints", state.championshipPoints);
    txt("championWins", state.wins);
    txt("championRaces", state.races);
    txt("firstPlaceReward", "300 crédits + 100 XP");
    txt("secondPlaceReward", "180 crédits + 65 XP");
    txt("thirdPlaceReward", "100 crédits + 40 XP");

    const list = $("leaderboard");
    if (!list) return;

    const rows = [
      ...state.leaderboard,
      {
        name: state.profile.name,
        country: state.profile.country,
        points: state.championshipPoints,
        wins: state.wins,
        isPlayer: true
      }
    ].sort((a, b) => (Number(b.points) || 0) - (Number(a.points) || 0)).slice(0, 20);

    list.innerHTML = rows.map((entry, index) => `
      <div class="leaderboard-row ${entry.isPlayer ? "current-player" : ""}">
        <span class="leaderboard-rank">${index + 1}</span>
        <span class="leaderboard-player">
          <strong>${html(entry.name || "Pilote")}</strong>
          <small>${html(entry.country || "—")}</small>
        </span>
        <span class="leaderboard-points">${Number(entry.points) || 0} pts</span>
      </div>`).join("");
  }

  /* ============================ NAVIGATION ===================== */

  function navigate(screenId) {
    const target = $(screenId);

    if (!target) {
      toast(`Écran absent du HTML : ${screenId}`);
      return;
    }

    document.querySelectorAll("#motoApp main section, #motoApp > section")
      .forEach(section => {
        if (section.id && section.id.endsWith("Screen")) {
          section.hidden = section.id !== screenId;
        }
      });

    target.hidden = false;
    currentScreen = screenId;

    document.querySelectorAll("[data-nav]").forEach(button => {
      const active = button.dataset.nav === screenId;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });

    if (screenId === "homeScreen") updateHomeUI();
    if (screenId === "careerScreen") updateCareerUI();
    if (screenId === "garageScreen") updateGarageUI();
    if (screenId === "championshipScreen") updateChampionshipUI();
    if (screenId === "settingsScreen") updateSettingsUI();
    if (screenId === "raceScreen") requestAnimationFrame(resizeRenderer);
  }

  function bindNavigation() {
    document.querySelectorAll("[data-nav]").forEach(button => {
      if (button.dataset.fobasNavBound === "1") return;
      button.dataset.fobasNavBound = "1";
      button.addEventListener("click", () => navigate(button.dataset.nav));
    });

    document.querySelectorAll("[data-go]").forEach(button => {
      if (button.dataset.fobasGoBound === "1") return;
      button.dataset.fobasGoBound = "1";
      button.addEventListener("click", () => {
        const destination = button.dataset.go;
        if (destination === "raceScreen") startRace(selectedMissionId);
        else navigate(destination);
      });
    });

    const mappings = {
      homeButton: "homeScreen",
      careerButton: "careerScreen",
      openGarageButton: "garageScreen",
      garageButton: "garageScreen",
      championshipButton: "championshipScreen",
      openChampionshipButton: "championshipScreen",
      homeChampionshipButton: "championshipScreen",
      profileButton: "settingsScreen",
      settingsButton: "settingsScreen"
    };

    Object.entries(mappings).forEach(([id, screen]) => {
      const button = $(id);
      if (!button || button.dataset.fobasNavBound === "1") return;
      button.dataset.fobasNavBound = "1";
      button.addEventListener("click", () => navigate(screen));
    });

    const bindOnce = (id, event, callback) => {
      const element = $(id);
      if (!element || element.dataset.fobasActionBound === "1") return;
      element.dataset.fobasActionBound = "1";
      element.addEventListener(event, callback);
    };

    bindOnce("homeRaceButton", "click", () => startRace(selectedMissionId));
    bindOnce("challengeMasterButton", "click", challengeMaster);
    bindOnce("challengeMasterChampionshipButton", "click", challengeMaster);

    bindOnce("editProfileButton", "click", () => {
      visible("profileEditForm", true);
      $("playerNameInput")?.focus();
    });

    bindOnce("cancelProfileButton", "click", () => {
      visible("profileEditForm", false);
      updateProfileUI();
    });

    bindOnce("saveProfileButton", "click", saveProfile);
    bindOnce("refreshLeaderboardButton", "click", updateChampionshipUI);
    bindOnce("saveProgressButton", "click", () => saveProgress(true));

    document.querySelectorAll("button").forEach(button => {
      const label = (button.textContent || "").trim().toLowerCase();
      if (
        label.includes("défier meme") ||
        label.includes("defier meme") ||
        label.includes("défier le maître") ||
        label.includes("defier le maitre")
      ) {
        if (button.dataset.fobasMasterBound === "1") return;
        button.dataset.fobasMasterBound = "1";
        button.addEventListener("click", challengeMaster);
      }
    });
  }

  function saveProfile() {
    const name = $("playerNameInput")?.value.trim();
    const country = $("playerCountrySelect")?.value || "Haïti";

    if (!name || name.length < 2) {
      toast("Entrez un nom de pilote d'au moins 2 caractères.");
      return;
    }

    state.profile.name = escapeProfileName(name);
    state.profile.country = country;

    visible("profileEditForm", false);
    updateProfileUI();
    updateHomeUI();
    scheduleSave();
    toast("Profil enregistré.");
  }

  /* ================================ GARAGE ===================== */

  function owned(id) {
    return state.ownedBikes.includes(id);
  }

  function upgradePrice(id, key) {
    return Math.round((220 + id * 55) * (1 + upgradeLevel(id, key) * 0.85));
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
    updatePlayerBikePaint();
    scheduleSave();
  }

  function updateGarageUI() {
    const bike = getBikeStats(garageBikeId);
    const color = state.bikePaints[garageBikeId] ||
      `#${bike.color.toString(16).padStart(6, "0")}`;

    txt("garageBikeName", bike.name);
    txt("bikeOwnedBadge", owned(garageBikeId) ? "Possédée" : `${bike.price} crédits`);
    txt("statSpeed", Math.round(bike.speed));
    txt("statAccel", Math.round(bike.acceleration));
    txt("statHandling", Math.round(bike.handling));
    txt("statBraking", Math.round(bike.braking));
    txt("statNitro", Math.round(bike.nitro));

    const art = $("garageBikeArt");
    if (art) {
      art.style.setProperty("--bike-color", color);
      art.setAttribute("aria-label", bike.name);
    }

    renderBikeShop();
    renderUpgrades();
    renderPaintOptions();
  }

  function renderBikeShop() {
    const list = $("bikeShopList");
    if (!list) return;

    list.innerHTML = BIKES.map(bike => `
      <article class="bike-shop-card ${bike.id === garageBikeId ? "selected" : ""}">
        <div class="bike-shop-color" style="background:#${bike.color.toString(16).padStart(6, "0")}"></div>
        <div class="bike-shop-info">
          <strong>${html(bike.name)}</strong>
          <small>${bike.speed} km/h · Maniabilité ${bike.handling}</small>
        </div>
        <button type="button" data-bike-action="${bike.id}">
          ${bike.id === garageBikeId ? "Sélectionnée" : owned(bike.id) ? "Choisir" : `${bike.price} crédits`}
        </button>
      </article>`).join("");

    list.querySelectorAll("[data-bike-action]").forEach(button => {
      button.addEventListener("click", () => buyOrSelectBike(Number(button.dataset.bikeAction)));
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
          <div><strong>${label}</strong><small>Niveau ${level}/5</small></div>
          <button type="button" data-upgrade="${key}" ${level >= 5 || !owned(garageBikeId) ? "disabled" : ""}>
            ${level >= 5 ? "MAX" : `Améliorer · ${price}`}
          </button>
        </div>`;
    }).join("");

    list.querySelectorAll("[data-upgrade]").forEach(button => {
      button.addEventListener("click", () => purchaseUpgrade(garageBikeId, button.dataset.upgrade));
    });
  }

  function purchaseUpgrade(id, key) {
    if (!owned(id)) return toast("Achetez d'abord cette moto.");

    const level = upgradeLevel(id, key);
    if (level >= 5) return toast("Niveau maximum atteint.");

    const price = upgradePrice(id, key);
    if (state.credits < price) return toast("Crédits insuffisants.");

    state.credits -= price;
    state.bikeUpgrades[id] ||= {};
    state.bikeUpgrades[id][key] = level + 1;

    updateGarageUI();
    updateHomeUI();
    updatePlayerBikePaint();
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
        data-paint="${color}" title="${html(name)}" aria-label="${html(name)}"
        style="background:${color};width:36px;height:36px;border-radius:50%;border:2px solid ${current === color ? "#fff" : "transparent"};cursor:pointer">
      </button>`).join("");

    container.querySelectorAll("[data-paint]").forEach(button => {
      button.addEventListener("click", () => {
        if (!owned(garageBikeId)) return toast("Achetez d'abord cette moto.");

        state.bikePaints[garageBikeId] = button.dataset.paint;
        updateGarageUI();

        if (state.selectedBike === garageBikeId) updatePlayerBikePaint();

        scheduleSave();
        toast("Couleur appliquée.");
      });
    });
  }

  function applyPaint() {
    if (!owned(garageBikeId)) return toast("Achetez d'abord cette moto.");
    if (!state.bikePaints[garageBikeId]) return toast("Choisissez une couleur.");

    updatePlayerBikePaint();
    updateGarageUI();
    scheduleSave();
    toast("Peinture appliquée.");
  }

  /* ============================ PARAMÈTRES ===================== */

  function updateSettingsUI() {
    if ($("settingTilt")) $("settingTilt").checked = Boolean(state.settings.tilt);
    if ($("settingVibration")) $("settingVibration").checked = Boolean(state.settings.vibration);
    if ($("settingReducedEffects")) $("settingReducedEffects").checked = Boolean(state.settings.reducedEffects);
    if ($("graphicsQuality")) $("graphicsQuality").value = state.settings.graphicsQuality;
    txt("gameVersion", VERSION);
  }

  function bindSettings() {
    $("settingTilt")?.addEventListener("change", async event => {
      state.settings.tilt = event.target.checked;
      if (state.settings.tilt) await requestTiltPermission();
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
        const permission = await DeviceOrientationEvent.requestPermission();
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

  /* ============================ THREE.JS ======================= */

  function mat(color, roughness = 0.7, metalness = 0.1) {
    return new three.MeshStandardMaterial({ color, roughness, metalness });
  }

  function box(parent, width, height, depth, material, x, y, z) {
    const mesh = new three.Mesh(new three.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function makeWheel(parent, x, y, z, radius = 0.38) {
    const group = new three.Group();
    group.position.set(x, y, z);

    const tire = new three.Mesh(
      new three.TorusGeometry(radius, radius * 0.17, 10, 20),
      mat(0x111315, 0.98)
    );
    tire.rotation.y = Math.PI / 2;
    tire.castShadow = true;
    group.add(tire);

    const rim = new three.Mesh(
      new three.CylinderGeometry(radius * 0.62, radius * 0.62, 0.08, 16),
      mat(0xb9c3cd, 0.28, 0.8)
    );
    rim.rotation.z = Math.PI / 2;
    group.add(rim);
    parent.add(group);
    return group;
  }

  function createMotorcycle(color = 0xe53935, scale = 1) {
    const bike = new three.Group();
    bike.scale.setScalar(scale);

    const paint = mat(color, 0.3, 0.5);
    const dark = mat(0x20242a, 0.75, 0.1);
    const metal = mat(0xb9c3cd, 0.28, 0.8);

    const wheels = [
      makeWheel(bike, 0, 0.42, -0.94),
      makeWheel(bike, 0, 0.42, 0.91)
    ];

    box(bike, 0.12, 0.15, 1.05, metal, 0, 0.72, -0.02);
    box(bike, 0.43, 0.4, 0.45, dark, 0, 0.65, 0.17);

    const tank = new three.Mesh(new three.SphereGeometry(0.35, 14, 10), paint);
    tank.scale.set(0.85, 0.65, 1.25);
    tank.position.set(0, 1.05, -0.12);
    tank.castShadow = true;
    bike.add(tank);

    box(bike, 0.38, 0.12, 0.55, dark, 0, 1.1, 0.48);
    box(bike, 0.08, 0.74, 0.08, metal, 0, 0.83, -0.73);
    box(bike, 0.86, 0.06, 0.07, metal, 0, 1.32, -0.64);

    const fairing = new three.Mesh(new three.SphereGeometry(0.32, 12, 10), paint);
    fairing.scale.set(0.7, 0.85, 0.75);
    fairing.position.set(0, 0.91, -0.62);
    bike.add(fairing);

    const lamp = new three.Mesh(
      new three.SphereGeometry(0.12, 10, 8),
      new three.MeshStandardMaterial({
        color: 0xfff2c4,
        emissive: 0xffc45b,
        emissiveIntensity: 0.8
      })
    );
    lamp.position.set(0, 1.04, -0.9);
    bike.add(lamp);

    const rider = new three.Group();
    const suit = mat(0x20252d, 0.8);

    const torso = new three.Mesh(new three.CapsuleGeometry(0.18, 0.43, 3, 6), suit);
    torso.rotation.x = -0.35;
    torso.position.set(0, 1.48, 0.16);
    rider.add(torso);

    const helmet = new three.Mesh(
      new three.SphereGeometry(0.19, 12, 10),
      mat(0xf2f3f4, 0.25, 0.15)
    );
    helmet.position.set(0, 1.82, -0.12);
    rider.add(helmet);
    bike.add(rider);

    bike.userData.wheels = wheels;
    bike.userData.paintMaterial = paint;
    return bike;
  }

  function updatePlayerBikePaint() {
    if (!playerBike3D) return;

    const bike = currentBike();
    const color = state.bikePaints[state.selectedBike] ||
      `#${bike.color.toString(16).padStart(6, "0")}`;

    playerBike3D.userData.paintMaterial?.color.set(color);
  }

  function buildRoad() {
    roadSegments = [];

    const roadMaterial = mat(0x30373b, 0.96);
    const edgeMaterial = mat(0xd6d5ca, 0.9);
    const lineMaterial = mat(0xf5f4e9, 0.8);
    const redMaterial = mat(0xe9484e, 0.8);

    for (let i = 0; i < 36; i++) {
      const segment = new three.Group();
      segment.position.z = -i * 7;
      segment.userData.segmentIndex = i;

      const road = new three.Mesh(
        new three.BoxGeometry(8.8, 0.12, 7.1),
        roadMaterial
      );
      road.position.y = -0.045;
      road.receiveShadow = true;
      segment.add(road);

      for (const side of [-1, 1]) {
        box(segment, 0.26, 0.16, 7.1, edgeMaterial, side * 4.35, 0.02, 0);
        box(
          segment, 0.15, 0.17, 1.4,
          i % 2 ? redMaterial : lineMaterial,
          side * 4.25, 0.08, 0
        );
      }

      box(segment, 0.12, 0.025, 2.4, lineMaterial, 0, 0.025, 0);
      world.add(segment);
      roadSegments.push(segment);
    }
  }

  function createTree() {
    const tree = new three.Group();

    const trunk = new three.Mesh(
      new three.CylinderGeometry(0.12, 0.18, 1.5, 8),
      mat(0x6c4a30)
    );
    trunk.position.y = 0.75;
    tree.add(trunk);

    const leaves = new three.Mesh(
      new three.ConeGeometry(rand(0.75, 1.15), rand(1.8, 2.7), 8),
      mat(pick([0x267447, 0x317d49, 0x448b48, 0x236b45]))
    );
    leaves.position.y = 2;
    tree.add(leaves);
    return tree;
  }

  function buildScenery() {
    scenery = [];

    const ground = new three.Mesh(
      new three.PlaneGeometry(500, 600),
      mat(0x527c42, 1)
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.14, -150);
    world.add(ground);

    for (let i = 0; i < 54; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const tree = createTree();
      tree.position.set(side * rand(6, 18), -0.1, -rand(15, 235));
      tree.userData.initialX = tree.position.x;
      world.add(tree);
      scenery.push(tree);
    }
  }

  async function initThree() {
    const canvas = $("raceCanvas");
    if (!canvas) throw new Error("Élément #raceCanvas absent du HTML.");

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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
    renderer.shadowMap.enabled =
      !state.settings.reducedEffects && state.settings.graphicsQuality === "high";

    if ("outputColorSpace" in renderer) renderer.outputColorSpace = three.SRGBColorSpace;

    world = new three.Group();
    scene.add(world);

    scene.add(new three.HemisphereLight(0xdceeff, 0x3b4d32, 2));

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

    window.addEventListener("resize", resizeRenderer, { passive: true });
    resizeRenderer();
  }

  function configureRendererQuality() {
    if (!renderer) return;

    renderer.shadowMap.enabled =
      !state.settings.reducedEffects && state.settings.graphicsQuality === "high";

    const ratio = state.settings.graphicsQuality === "low" ? 1
      : state.settings.graphicsQuality === "medium" ? 1.2
      : 1.4;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, ratio));
    resizeRenderer();
  }

  function resizeRenderer() {
    if (!renderer || !camera) return;

    const canvas = $("raceCanvas");
    const parent = canvas?.parentElement;
    const width = Math.max(1, parent?.clientWidth || window.innerWidth);
    const height = Math.max(1, parent?.clientHeight || Math.min(window.innerHeight * 0.55, 600));

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function resetRaceWorld() {
    roadSegments.forEach((segment, index) => {
      segment.position.z = -index * 7;
      segment.position.x = 0;
      segment.rotation.y = 0;
    });

    scenery.forEach(object => {
      object.position.z = -rand(20, 250);
      if (object.userData.initialX !== undefined) {
        object.position.x = object.userData.initialX;
      }
    });

    if (playerBike3D) {
      playerBike3D.position.set(0, 0.05, 2);
      playerBike3D.rotation.set(0, 0, 0);
      updatePlayerBikePaint();
    }

    cameraZoom = 1;
    roadCurvePhase = 0;
  }

  /* ============================ COURSES ======================== */

  function buildRaceData(missionId, masterChallenge = false) {
    const mission = missionById(missionId);
    const player = currentBike();
    const progress = (mission.id - 1) / (MAX_MISSIONS - 1);

    const ai = Array.from({ length: mission.aiCount }, (_, index) => {
      /*
       * Missions 1–35 gardent un comportement proche de l'original.
       * À partir de 36, les rivaux deviennent plus rapides et réactifs.
       */
      let skill;
      if (mission.id <= 35) {
        skill = 0.82 + progress * 0.15 + rand(-0.035, 0.035);
      } else {
        const stage = mission.id - 35;
        skill = 0.98 + stage * 0.009 + rand(-0.025, 0.025);
      }

      skill = clamp(skill, 0.74, 1.18);

      const speedRatio = mission.id <= 35
        ? clamp(skill, 0.74, 0.99)
        : clamp(skill, 0.98, 1.16);

      const targetSpeed = Math.max(48, player.speed * speedRatio + rand(-5, 7));
      const lanePattern = [-3.0, -1.8, -0.6, 0.6, 1.8, 3.0];

      return {
        id: index,
        name: masterChallenge && index === 0
          ? "MEME Selvandieu"
          : `Pilote IA ${String(index + 1).padStart(3, "0")}`,
        lane: lanePattern[index % lanePattern.length],
        gridRow: Math.floor(index / lanePattern.length),
        speed: 0,
        targetSpeed,
        distance: 0,
        finished: false,
        finishTime: Infinity,
        phase: rand(0, Math.PI * 2),
        skill
      };
    });

    if (masterChallenge && ai[0]) {
      ai[0].name = "MEME Selvandieu";
      ai[0].targetSpeed = Math.min(
        player.speed * 1.12,
        Math.max(80, player.speed * (0.91 + progress * 0.18))
      );
      ai[0].skill = Math.min(1.2, 0.96 + progress * 0.20);
    }

    return {
      missionId,
      mission,
      masterChallenge,
      started: false,
      elapsed: 0,
      distance: 0,
      totalDistance: mission.routeLength * mission.laps,
      laps: mission.laps,
      ai,
      aiCount: mission.aiCount
    };
  }

  function challengeMaster() {
    selectedMissionId = MAX_MISSIONS;
    startRace(MAX_MISSIONS, true);
  }

  function createAIRiders() {
    if (!world || !three || !currentRace) return;

    aiRiders.forEach(rider => world.remove(rider));
    aiRiders = [];
    aiRiderIndexes = [];

    const colors = [
      0x1687ee, 0xffb020, 0x8e44ad, 0x18a878,
      0xe53935, 0x00bcd4, 0xff7043, 0x9ccc65
    ];

    const visibleCount = Math.min(currentRace.ai.length, 30);

    for (let index = 0; index < visibleCount; index++) {
      const data = currentRace.ai[index];
      const rider = createMotorcycle(colors[index % colors.length], 0.78);

      rider.position.set(
        data.lane,
        0.05,
        -8 - data.gridRow * 5 - (index % 6) * 1.2
      );

      rider.userData.index = index;
      world.add(rider);
      aiRiders.push(rider);
      aiRiderIndexes.push(index);
    }
  }

  function startRace(missionId = selectedMissionId, masterChallenge = false) {
    if (!gameReady) {
      toast("Le moteur 3D est en cours de chargement.", 1800);
      return;
    }

    if (currentRace && !raceFinished && !paused) {
      if (!window.confirm("Abandonner la course actuelle ?")) return;
    }

    const id = clamp(Math.floor(Number(missionId) || 1), 1, MAX_MISSIONS);

    if (!state.unlockedMissions.includes(id) && !masterChallenge) {
      toast("Mission verrouillée. Terminez la mission précédente.");
      return;
    }

    selectedMissionId = id;
    currentRace = buildRaceData(id, masterChallenge);

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
    lastCollisionTime = 0;

    resetRaceWorld();
    createAIRiders();
    navigate("raceScreen");

    visible("pauseOverlay", false);
    visible("resultOverlay", false);
    visible("countdownDisplay", true);

    txt("countdownDisplay", "3");
    txt("pauseButton", "Ⅱ");
    txt("raceMissionName", currentRace.mission.name);
    txt(
      "raceLocationName",
      `${currentRace.mission.location.city}, ${currentRace.mission.location.country}`
    );
    txt("raceDifficultyName", currentRace.mission.difficulty.name);
    txt("positionDisplay", `1/${currentRace.aiCount + 1}`);
    txt("lapDisplay", `0/${currentRace.laps}`);
    txt("timeDisplay", "00:00");
    txt("speedDisplay", "0 km/h");
    txt("nitroDisplay", "100%");

    const routeMeters = Math.round(currentRace.totalDistance);
    toast(
      currentRace.masterChallenge
        ? `Défi final : affrontez MEME Selvandieu ! ${currentRace.aiCount} rivaux.`
        : `Mission ${id}/${MAX_MISSIONS} · ${currentRace.aiCount} IA · ${routeMeters.toLocaleString("fr-FR")} m.`
    );
  }

  function getPlayerPosition() {
    if (!currentRace) return 1;

    let position = 1;
    for (const ai of currentRace.ai) {
      if (ai.distance > currentRace.distance + 0.01) position++;
    }
    return clamp(position, 1, currentRace.ai.length + 1);
  }

  function calculateRewards(position, mission) {
    const base = mission.reward;
    const xp = mission.xp;

    if (position === 1) return { credits: base, xp, points: 100 };
    if (position === 2) return { credits: Math.round(base * 0.75), xp: Math.round(xp * 0.8), points: 75 };
    if (position === 3) return { credits: Math.round(base * 0.55), xp: Math.round(xp * 0.65), points: 50 };

    if (position <= Math.ceil((mission.aiCount + 1) * 0.25)) {
      return { credits: Math.round(base * 0.3), xp: Math.round(xp * 0.4), points: 25 };
    }

    return { credits: Math.round(base * 0.1), xp: 5, points: 5 };
  }

  function positionLabel(position) {
    if (position === 1) return "1er";
    return `${position}e`;
  }

  /* ======================== RÉSULTATS DE COURSE ================ */

  function ensureResultsOverlay() {
    if ($("resultOverlay")) {
      bindResultsButtons();
      return;
    }

    const overlay = document.createElement("div");
    overlay.id = "resultOverlay";
    overlay.hidden = true;

    overlay.innerHTML = `
      <div class="fobas-results-card">
        <div id="resultPodium">🏁</div>
        <p id="resultEyebrow">MISSION</p>
        <h2 id="resultTitle">COURSE TERMINÉE</h2>
        <p id="resultSubtitle"></p>
        <h3>Position : <span id="resultPosition">—</span></h3>
        <p id="resultPodiumMessage"></p>
        <p>Crédits : <strong id="resultCredits">0</strong></p>
        <p>XP : <strong id="resultXP">0</strong></p>
        <p>Points : <strong id="resultChampionshipPoints">0</strong></p>
        <p>Temps : <strong id="resultElapsedTime">00:00</strong></p>
        <p id="resultNextMission"></p>
        <button id="fobasNextMissionButton" type="button">PROCHAINE MISSION ➜</button>
        <button id="fobasReplayButton" type="button">↻ REJOUER</button>
        <button id="fobasCareerButton" type="button">CARRIÈRE</button>
      </div>`;

    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "999998",
      background: "#06110feF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      overflowY: "auto"
    });

    const style = document.createElement("style");
    style.id = "fobasResultsStyle";
    style.textContent = `
      #resultOverlay[hidden] { display:none !important; }
      .fobas-results-card {
        width:min(100%,430px);max-height:92vh;overflow:auto;padding:24px 20px;
        text-align:center;color:#fff;background:linear-gradient(145deg,#183b32,#111b22);
        border:1px solid #52796c;border-radius:22px;box-shadow:0 20px 70px #0009;
        font-family:Arial,sans-serif;
      }
      .fobas-results-card button {
        display:block;width:100%;min-height:48px;margin-top:10px;border:0;
        border-radius:12px;padding:12px;font-weight:800;cursor:pointer;
      }
      #fobasNextMissionButton {background:#39d98a;color:#062015;}
      #fobasReplayButton {background:#274552;color:#fff;}
      #fobasCareerButton {background:#202d35;color:#fff;}
      #resultPodium {font-size:48px;}
      #resultTitle {font-size:27px;margin:8px 0;}
    `;

    if (!$("fobasResultsStyle")) document.head.appendChild(style);
    document.body.appendChild(overlay);
    bindResultsButtons();
  }

  function bindResultsButtons() {
    const bindOnce = (id, callback) => {
      const button = $(id);
      if (!button || button.dataset.fobasResultBound === "1") return;
      button.dataset.fobasResultBound = "1";
      button.addEventListener("click", callback);
    };

    bindOnce("fobasNextMissionButton", nextMission);
    bindOnce("fobasReplayButton", restartRace);
    bindOnce("fobasCareerButton", () => {
      visible("resultOverlay", false);
      currentRace = null;
      navigate("careerScreen");
    });
  }

  function finishRace(forcedPosition = null) {
    if (!currentRace || raceFinished) return;

    raceFinished = true;
    paused = false;
    currentSpeed = 0;

    inputLeft = false;
    inputRight = false;
    inputGas = false;
    inputBrake = false;
    inputNitro = false;

    visible("countdownDisplay", false);
    visible("pauseOverlay", false);

    let position = 1;

    if (forcedPosition !== null) {
      position = forcedPosition;
    } else {
      position += currentRace.ai.filter(ai =>
        ai.finished && ai.finishTime <= raceClock + 0.001
      ).length;
    }

    position = clamp(position, 1, currentRace.ai.length + 1);

    const mission = currentRace.mission;
    const reward = calculateRewards(position, mission);
    const elapsed = raceClock;

    state.races++;
    state.bestPosition = state.bestPosition
      ? Math.min(state.bestPosition, position)
      : position;

    state.credits += reward.credits;
    state.xp += reward.xp;
    state.championshipPoints += reward.points;

    if (position === 1) state.wins++;
    if (position <= 3) state.podiums++;

    if (!state.completedMissions.includes(mission.id)) {
      state.completedMissions.push(mission.id);
    }

    const nextId = mission.id + 1;

    if (nextId <= MAX_MISSIONS && !state.unlockedMissions.includes(nextId)) {
      state.unlockedMissions.push(nextId);
    }

    updateLevel();

    txt("resultPosition", positionLabel(position));
    txt("resultCredits", `+${reward.credits}`);
    txt("resultXP", `+${reward.xp}`);
    txt("resultChampionshipPoints", `+${reward.points}`);

    txt(
      "resultEyebrow",
      currentRace.masterChallenge
        ? "DÉFI DE MEME SELVANDIEU"
        : `MISSION ${mission.id}/${MAX_MISSIONS}`
    );

    txt(
      "resultTitle",
      position === 1 ? "VICTOIRE !" : position <= 3 ? "PODIUM !" : "COURSE TERMINÉE"
    );

    txt(
      "resultSubtitle",
      position === 1
        ? "Bravo ! Vous avez gagné cette course."
        : "Course terminée. Votre résultat a été enregistré."
    );

    txt(
      "resultPodiumMessage",
      position === 1 ? "Médaille d'or — Champion"
        : position === 2 ? "Médaille d'argent"
        : position === 3 ? "Médaille de bronze"
        : "Continuez à vous entraîner et améliorez votre moto."
    );

    txt("resultPodium", position === 1 ? "🥇" : position === 2 ? "🥈" : position === 3 ? "🥉" : "🏁");
    txt("resultElapsedTime", fmtTime(elapsed));

    txt(
      "resultNextMission",
      nextId <= MAX_MISSIONS
        ? `Mission ${nextId} débloquée.`
        : `Vous avez terminé les ${MAX_MISSIONS} missions !`
    );

    ensureResultsOverlay();
    visible("resultOverlay", true);

    const nextButton = $("fobasNextMissionButton");
    if (nextButton) {
      nextButton.textContent = nextId <= MAX_MISSIONS
        ? `PROCHAINE MISSION ${nextId} ➜`
        : `REJOUER LA MISSION ${MAX_MISSIONS}`;
    }

    updateHomeUI();
    updateCareerUI();
    updateChampionshipUI();
    updateGarageUI();
    scheduleSave();
  }

  function nextMission() {
    if (!currentRace) {
      visible("resultOverlay", false);
      navigate("careerScreen");
      return;
    }

    const nextId = currentRace.missionId + 1;
    visible("resultOverlay", false);

    if (nextId > MAX_MISSIONS) {
      toast(`Félicitations ! Vous avez terminé les ${MAX_MISSIONS} missions.`);
      currentRace = null;
      navigate("championshipScreen");
      return;
    }

    currentRace = null;
    selectedMissionId = nextId;
    startRace(nextId);
  }

  function restartRace() {
    if (!currentRace) {
      startRace(selectedMissionId);
      return;
    }

    const id = currentRace.missionId;
    const master = currentRace.masterChallenge;
    visible("resultOverlay", false);
    startRace(id, master);
  }

  function quitRace() {
    paused = false;
    currentRace = null;
    raceFinished = false;
    currentSpeed = 0;
    releaseAllControls();

    visible("pauseOverlay", false);
    visible("resultOverlay", false);
    visible("countdownDisplay", false);
    navigate("homeScreen");
  }

  function pauseRace() {
    if (!currentRace || raceFinished) return;

    paused = !paused;
    visible("pauseOverlay", paused);
    txt("pauseButton", paused ? "▶" : "Ⅱ");

    if (!paused) lastFrameTime = performance.now();
    else releaseAllControls();
  }

  function bindRaceButtons() {
    const bindOnce = (id, callback) => {
      const button = $(id);
      if (!button || button.dataset.fobasRaceBound === "1") return;
      button.dataset.fobasRaceBound = "1";
      button.addEventListener("click", callback);
    };

    bindOnce("pauseButton", pauseRace);
    bindOnce("resumeButton", pauseRace);
    bindOnce("restartButton", restartRace);
    bindOnce("quitRaceButton", quitRace);
    bindOnce("continueButton", nextMission);
    bindOnce("applyPaintButton", applyPaint);
  }

  /* ============================ COMMANDES ===================== */

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

    document.querySelectorAll(".pressed").forEach(element => {
      element.classList.remove("pressed");
    });
  }

  function bindHoldButton(id, name) {
    const button = $(id);
    if (!button || button.dataset.fobasBound === "1") return;

    button.dataset.fobasBound = "1";
    button.style.touchAction = "none";

    const press = event => {
      if (event.cancelable) event.preventDefault();
      if (paused || raceFinished || !currentRace) return;

      setControl(name, true);
      button.classList.add("pressed");

      try {
        button.setPointerCapture?.(event.pointerId);
      } catch (_) {}
    };

    const release = event => {
      if (event?.cancelable) event.preventDefault();
      setControl(name, false);
      button.classList.remove("pressed");
    };

    button.addEventListener("pointerdown", press, { passive: false });
    button.addEventListener("pointerup", release, { passive: false });
    button.addEventListener("pointercancel", release, { passive: false });
    button.addEventListener("lostpointercapture", release);
    button.addEventListener("contextmenu", event => event.preventDefault());
  }

  function bindInputs() {
    bindHoldButton("leftButton", "left");
    bindHoldButton("rightButton", "right");
    bindHoldButton("gasButton", "gas");
    bindHoldButton("brakeButton", "brake");
    bindHoldButton("nitroButton", "nitro");

    const tiltButton = $("tiltButton");
    if (tiltButton && tiltButton.dataset.fobasTiltBound !== "1") {
      tiltButton.dataset.fobasTiltBound = "1";
      tiltButton.addEventListener("click", async () => {
        state.settings.tilt = !state.settings.tilt;
        updateSettingsUI();
        if (state.settings.tilt) await requestTiltPermission();
        scheduleSave();
      });
    }

    window.addEventListener("keydown", event => {
      const key = event.key.toLowerCase();

      if (["arrowleft", "arrowright", "arrowup", "arrowdown", " "].includes(key)) {
        event.preventDefault();
      }

      if (key === "arrowleft" || key === "a") setControl("left", true);
      if (key === "arrowright" || key === "d") setControl("right", true);
      if (key === "arrowup" || key === "w") setControl("gas", true);
      if (key === "arrowdown" || key === "s") setControl("brake", true);
      if (key === " " || key === "shift") setControl("nitro", true);

      if (key === "escape" && currentRace && !raceFinished) pauseRace();
    }, { passive: false });

    window.addEventListener("keyup", event => {
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") setControl("left", false);
      if (key === "arrowright" || key === "d") setControl("right", false);
      if (key === "arrowup" || key === "w") setControl("gas", false);
      if (key === "arrowdown" || key === "s") setControl("brake", false);
      if (key === " " || key === "shift") setControl("nitro", false);
    });

    window.addEventListener("blur", releaseAllControls);

    document.addEventListener("visibilitychange", () => {
      releaseAllControls();
      if (document.hidden && currentRace && !raceFinished && !paused) pauseRace();
    });

    window.addEventListener("deviceorientation", event => {
      if (!state.settings.tilt || currentScreen !== "raceScreen") return;
      if (typeof event.gamma === "number") tiltValue = clamp(event.gamma / 24, -1, 1);
    }, { passive: true });

    bindPinchZoom();
  }

  function bindPinchZoom() {
    const surface = $("canvasWrap") || $("raceCanvas");
    if (!surface || surface.dataset.fobasPinchBound === "1") return;
    surface.dataset.fobasPinchBound = "1";

    let initialDistance = 0;
    let initialZoom = 1;

    surface.addEventListener("touchstart", event => {
      if (event.touches.length !== 2) return;
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      initialDistance = Math.hypot(dx, dy);
      initialZoom = cameraZoom;
    }, { passive: true });

    surface.addEventListener("touchmove", event => {
      if (event.touches.length !== 2 || !initialDistance) return;
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      cameraZoom = clamp(initialZoom * Math.hypot(dx, dy) / initialDistance, 0.75, 1.65);
    }, { passive: true });

    surface.addEventListener("touchend", () => {
      initialDistance = 0;
    }, { passive: true });
  }

  /* ============================ PHYSIQUE ====================== */

  function updateRace(delta) {
    if (!currentRace || raceFinished || paused) return;

    if (!currentRace.started) {
      countdownAccumulator += delta;

      if (countdownAccumulator >= 1) {
        countdownAccumulator -= 1;
        countdown--;

        if (countdown <= 0) {
          currentRace.started = true;
          txt("countdownDisplay", "GO !");
          setTimeout(() => visible("countdownDisplay", false), 650);
        } else {
          txt("countdownDisplay", countdown);
        }
      }
      return;
    }

    raceClock += delta;
    currentRace.elapsed = raceClock;

    const bike = currentBike();
    const maxSpeed = bike.speed;

    steering = (inputRight ? 1 : 0) - (inputLeft ? 1 : 0);
    if (!inputLeft && !inputRight && state.settings.tilt) steering = tiltValue;

    if (inputGas) {
      currentSpeed += (0.28 + bike.acceleration * 0.006) * delta * 60 * 8.5;
      throttle = Math.min(1, throttle + delta * 2.5);
    } else {
      currentSpeed -= delta * 3.2;
      throttle = Math.max(0, throttle - delta * 1.8);
    }

    if (inputBrake) currentSpeed -= (bike.braking * 0.12 + 9) * delta;

    if (inputNitro && nitroEnergy > 0 && currentSpeed > 10) {
      currentSpeed += 28 * delta;
      nitroEnergy = Math.max(0, nitroEnergy - 23 * delta);
    } else {
      nitroEnergy = Math.min(100, nitroEnergy + 5.5 * delta);
    }

    const nitroActive = inputNitro && nitroEnergy > 0;
    currentSpeed = clamp(currentSpeed, 0, nitroActive ? maxSpeed * 1.2 : maxSpeed);

    const missionCurve = currentRace.mission.curveIntensity || 0.25;
    playerLane = clamp(
      playerLane + steering * delta * (2.8 + bike.handling * 0.025),
      -3.45,
      3.45
    );

    /*
     * Sou nouvo misyon yo, koub yo pi sere.
     * Lè jwè a pa byen vire sou wout la, moto a pèdi vitès.
     */
    const curveNeed = Math.abs(Math.sin(
      currentRace.distance / Math.max(500, currentRace.mission.routeLength) * Math.PI * 2
    )) * missionCurve;

    const curvePenalty = currentRace.missionId >= 36
      ? Math.max(0, curveNeed - Math.abs(steering) * (0.25 + bike.handling / 160))
      : 0;

    if (Math.abs(playerLane) > 3.15) {
      currentSpeed = Math.max(0, currentSpeed - delta * 10);
    }

    if (curvePenalty > 0) {
      currentSpeed = Math.max(0, currentSpeed - curvePenalty * delta * 8);
    }

    currentRace.distance += currentSpeed / 3.6 * delta;

    currentRace.ai.forEach(ai => {
      if (ai.finished) return;

      const accelerationRate = 0.65 + ai.skill * 0.65;
      ai.speed = lerp(ai.speed, ai.targetSpeed, Math.min(1, delta * accelerationRate));

      /*
       * IA yo ajiste vitès yo sou misyon elit yo.
       * Ti varyasyon sa a anpeche tout rival yo kouri egzakteman menm jan.
       */
      const paceVariation = currentRace.missionId >= 36
        ? 1 + Math.sin(raceClock * 0.7 + ai.phase) * 0.012
        : 1;

      ai.distance += ai.speed * paceVariation / 3.6 * delta;

      if (ai.distance >= currentRace.totalDistance) {
        ai.distance = currentRace.totalDistance;
        ai.finished = true;
        ai.finishTime = raceClock;
      }
    });

    const now = performance.now();

    for (let index = 0; index < aiRiders.length; index++) {
      const rider = aiRiders[index];

      if (
        Math.abs(rider.position.z - playerBike3D.position.z) < 1.1 &&
        Math.abs(rider.position.x - playerBike3D.position.x) < 0.7 &&
        now - lastCollisionTime > 900
      ) {
        currentSpeed *= 0.88;
        lastCollisionTime = now;
      }
    }

    if (currentRace.distance >= currentRace.totalDistance) {
      currentRace.distance = currentRace.totalDistance;
      finishRace();
    }

    updateHUD();
  }

  function updateHUD() {
    if (!currentRace) return;

    const position = getPlayerPosition();
    const lap = Math.min(
      currentRace.laps,
      Math.floor(currentRace.distance / currentRace.mission.routeLength) + 1
    );

    txt("positionDisplay", `${position}/${currentRace.aiCount + 1}`);
    txt("timeDisplay", fmtTime(raceClock));
    txt("lapDisplay", `${lap}/${currentRace.laps}`);
    txt("speedDisplay", `${Math.round(currentSpeed)} km/h`);
    txt("nitroDisplay", `${Math.round(nitroEnergy)}%`);

    if ($("nitroProgress")) $("nitroProgress").style.width = `${nitroEnergy}%`;
    if ($("nitroBar")) $("nitroBar").style.width = `${nitroEnergy}%`;
  }

  function curveOffsetForZ(z, mission) {
    if (!mission || mission.id < 36) return 0;

    const intensity = mission.curveIntensity || 0.5;
    const phase = roadCurvePhase + Math.abs(z) * 0.018;
    return Math.sin(phase) * intensity * 1.45;
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
        wheel.rotation.x += currentSpeed * delta * 0.09;
      });
    }

    if (currentRace && currentRace.started && !paused && !raceFinished) {
      const movement = currentSpeed * delta * 0.16;
      roadCurvePhase += delta * (0.4 + currentSpeed / 160);

      roadSegments.forEach(segment => {
        segment.position.z += movement;

        if (segment.position.z > 12) {
          segment.position.z -= roadSegments.length * 7;
        }

        const curve = curveOffsetForZ(segment.position.z, currentRace.mission);
        segment.position.x = curve;
        segment.rotation.y = currentRace.missionId >= 36
          ? Math.cos(roadCurvePhase + Math.abs(segment.position.z) * 0.018) *
            currentRace.mission.curveIntensity * 0.055
          : 0;
      });

      scenery.forEach(object => {
        object.position.z += movement;

        if (object.position.z > 14) object.position.z = -rand(190, 280);

        if (currentRace.missionId >= 36) {
          const side = object.userData.initialX < 0 ? -1 : 1;
          object.position.x = side * (6 + Math.abs(curveOffsetForZ(object.position.z, currentRace.mission)));
        }
      });

      aiRiders.forEach((rider, riderIndex) => {
        const dataIndex = aiRiderIndexes[riderIndex];
        const data = currentRace.ai[dataIndex];
        if (!data) return;

        const difference = data.distance - currentRace.distance;
        rider.position.z = clamp(2 - difference * 0.075, -65, 10);

        const curve = currentRace.missionId >= 36
          ? curveOffsetForZ(rider.position.z, currentRace.mission)
          : 0;

        rider.position.x = lerp(
          rider.position.x,
          data.lane + curve + Math.sin(data.phase += delta) * 0.12,
          Math.min(1, delta * 1.4)
        );
      });

      camera.position.x = lerp(
        camera.position.x,
        playerLane * 0.55 + curveOffsetForZ(-5, currentRace.mission) * 0.3,
        Math.min(1, delta * 2)
      );

      camera.fov = lerp(
        camera.fov,
        65 - (cameraZoom - 1) * 8,
        Math.min(1, delta * 4)
      );

      camera.updateProjectionMatrix();
      camera.lookAt(playerLane * 0.4, 0.9, -5);
    }

    renderer.render(scene, camera);
  }

  function gameLoop(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;

    const delta = clamp((timestamp - lastFrameTime) / 1000, 0, 0.05);
    lastFrameTime = timestamp;

    try {
      updateRace(delta);
      animateThree(delta);
    } catch (error) {
      console.error("[FOBAS] Erreur de jeu :", error);
      toast("Erreur pendant la course. Consultez la console.", 3500);
    }

    rafId = requestAnimationFrame(gameLoop);
  }

  /* ================================ INIT ====================== */

  async function init() {
    txt("gameVersion", VERSION);
    await loadProgress();

    bindNavigation();
    bindInputs();
    bindRaceButtons();
    bindSettings();

    garageBikeId = state.selectedBike;

    updateHomeUI();
    updateCareerUI();
    updateGarageUI();
    updateChampionshipUI();
    updateSettingsUI();

    ensureResultsOverlay();

    try {
      await initThree();
      gameReady = true;
      toast("Moteur 3D FOBAS prêt.");
    } catch (error) {
      console.error("[FOBAS] Initialisation Three.js impossible :", error);
      gameReady = false;
      toast("Three.js n'a pas démarré. Vérifiez Internet et WebGL.", 5000);
    }

    document.addEventListener("click", event => {
      const button = event.target.closest("[data-mission-id]");
      if (!button || button.disabled) return;

      selectedMissionId = Number(button.dataset.missionId);
      startRace(selectedMissionId);
    });

    visible("loadingOverlay", false);

    window.addEventListener("beforeunload", () => {
      releaseAllControls();
      if (db) db.close();
    });

    if (!rafId) {
      lastFrameTime = 0;
      rafId = requestAnimationFrame(gameLoop);
    }
  }

  function startSafely() {
    init().catch(error => {
      console.error("[FOBAS] Erreur d'initialisation :", error);
      visible("loadingOverlay", false);
      toast("Erreur d'initialisation. Vérifiez les éléments HTML.", 5000);
    });
  }

  /* ============================ API PUBLIQUE ================== */

  window.FOBASMotoRacing = {
    startRace,
    finishRace,
    nextMission,
    restartRace,
    quitRace,
    pauseRace,
    navigate,
    challengeMaster,
    saveProgress,
    getState: () => JSON.parse(JSON.stringify(state)),
    getMissionInfo: id => {
      const mission = missionById(id);

      return {
        id: mission.id,
        name: mission.name,
        aiCount: mission.aiCount,
        laps: mission.laps,
        routeLength: mission.routeLength,
        totalDistance: mission.routeLength * mission.laps,
        curveIntensity: mission.curveIntensity,
        difficulty: mission.difficulty.name,
        unlocked: state.unlockedMissions.includes(mission.id),
        completed: state.completedMissions.includes(mission.id)
      };
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startSafely, { once: true });
  } else {
    startSafely();
  }
})();
