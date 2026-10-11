/* ================================================================
   FOBAS MOTO RACING 3D
   Fichier final : appmotorracingfobas.js
   Version : 3.0.0
   Auteur / Rival maître : MEME Selvandieu

   Fonctionnalités :
   - Three.js 3D avec géométrie procédurale
   - 35 missions et 20 motos
   - Profil joueur et progression
   - Garage, achats, améliorations et peinture
   - Courses, adversaires IA, frein, nitro et commandes tactiles
   - Pause, redémarrage, résultats et podium
   - Sauvegarde IndexedDB avec solution de secours
   - Clavier, tactile, gyroscope facultatif
   - Compatible avec les éléments HTML existants
   ================================================================ */

(() => {
  "use strict";

  /* ------------------------- CONFIGURATION ---------------------- */

  const VERSION = "3.0.0";
  const DB_NAME = "FOBAS_MOTO_RACING_DB";
  const DB_VERSION = 1;
  const STORE_NAME = "gameData";
  const SAVE_KEY = "mainSave";

  const $ = (id) => document.getElementById(id);

  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

  const rand = (min, max) => Math.random() * (max - min) + min;

  const pick = (array) => array[Math.floor(Math.random() * array.length)];

  const safeText = (id, value) => {
    const el = $(id);
    if (el) el.textContent = String(value);
  };

  const safeHTML = (id, value) => {
    const el = $(id);
    if (el) el.innerHTML = value;
  };

  const safeShow = (id, visible) => {
    const el = $(id);
    if (el) el.hidden = !visible;
  };

  const formatTime = (seconds) => {
    const safe = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);

  /* --------------------------- DONNÉES -------------------------- */

  const DEPARTMENTS = [
    { name: "Nord-Ouest", cities: ["Port-de-Paix", "Môle-Saint-Nicolas", "Jean-Rabel"] },
    { name: "Nord", cities: ["Cap-Haïtien", "Limbé", "Grande-Rivière-du-Nord"] },
    { name: "Nord-Est", cities: ["Fort-Liberté", "Ouanaminthe", "Trou-du-Nord"] },
    { name: "Artibonite", cities: ["Gonaïves", "Saint-Marc", "Gros-Morne"] },
    { name: "Centre", cities: ["Hinche", "Mirebalais", "Lascahobas"] },
    { name: "Ouest", cities: ["Port-au-Prince", "Pétion-Ville", "Léogâne"] },
    { name: "Sud-Est", cities: ["Jacmel", "Marigot", "Bainet"] },
    { name: "Sud", cities: ["Les Cayes", "Aquin", "Port-Salut"] },
    { name: "Grande-Anse", cities: ["Jérémie", "Abricots", "Anse-d'Hainault"] },
    { name: "Nippes", cities: ["Miragoâne", "Anse-à-Veau", "Baradères"] }
  ];

  const INTERNATIONAL_DESTINATIONS = [
    { country: "République dominicaine", city: "Santo Domingo" },
    { country: "Jamaïque", city: "Kingston" },
    { country: "États-Unis", city: "Miami" },
    { country: "France", city: "Paris" },
    { country: "Japon", city: "Tokyo" },
    { country: "Italie", city: "Rome" }
  ];

  const DIFFICULTIES = [
    { name: "Débutant", speed: 0.76, laps: 1, reward: 100 },
    { name: "Intermédiaire", speed: 0.87, laps: 2, reward: 180 },
    { name: "Expert", speed: 0.96, laps: 2, reward: 280 },
    { name: "Champion", speed: 1.04, laps: 3, reward: 420 },
    { name: "Légende", speed: 1.12, laps: 3, reward: 650 }
  ];

  const MISSION_TITLES = [
    "Premiers tours de roue",
    "Maîtrise de la trajectoire",
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
    "Le circuit royal",
    "Légende de la piste",
    "Tournoi des champions",
    "La grande finale",
    "Le défi des sept mers",
    "Championnat mondial",
    "Course de prestige",
    "L'ultime rivalité",
    "Le dernier obstacle",
    "Couronne de légende"
  ];

  const BIKE_DEFINITIONS = [
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

  const BIKES = BIKE_DEFINITIONS.map((data, index) => ({
    id: index,
    name: data[0],
    color: data[1],
    speed: data[2],
    acceleration: data[3],
    handling: data[4],
    braking: data[5],
    nitro: data[6],
    price: data[7]
  }));

  const MISSION_DEFINITIONS = MISSION_TITLES.map((title, index) => {
    const tier = Math.floor(index / 7);
    let location;

    if (index < 10) {
      const department = DEPARTMENTS[index];
      location = {
        country: "Haïti",
        department: department.name,
        city: department.cities[index % department.cities.length]
      };
    } else if (index < 28) {
      const department = DEPARTMENTS[index % DEPARTMENTS.length];
      location = {
        country: "Haïti",
        department: department.name,
        city: department.cities[index % department.cities.length]
      };
    } else {
      location = INTERNATIONAL_DESTINATIONS[
        (index - 28) % INTERNATIONAL_DESTINATIONS.length
      ];
    }

    return {
      id: index + 1,
      title,
      tier,
      difficulty: DIFFICULTIES[tier],
      location,
      laps: DIFFICULTIES[tier].laps,
      reward: DIFFICULTIES[tier].reward + index * 15,
      xp: 40 + index * 8,
      requiredLevel: index + 1
    };
  });

  const PAINTS = [
    { name: "Rouge Racing", color: "#ef4444" },
    { name: "Bleu Océan", color: "#2196f3" },
    { name: "Vert Émeraude", color: "#10b981" },
    { name: "Or Champion", color: "#fbbf24" },
    { name: "Violet Royal", color: "#a855f7" },
    { name: "Noir Carbone", color: "#20242b" },
    { name: "Blanc Perle", color: "#f5f5f5" },
    { name: "Cyan FOBAS", color: "#00e5ff" }
  ];

  /* --------------------------- ÉTAT ----------------------------- */

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
  let selectedMissionId = 1;
  let garageBikeId = 0;
  let currentScreen = "homeScreen";
  let currentRace = null;
  let paused = false;
  let raceFinished = false;
  let countdown = 3;
  let countdownAccumulator = 0;
  let raceClock = 0;
  let animationFrame = 0;
  let lastFrameTime = 0;
  let saveTimer = null;
  let db = null;
  let three = null;
  let renderer = null;
  let scene = null;
  let camera = null;
  let world = null;
  let playerBike3D = null;
  let aiRiders = [];
  let roadSegments = [];
  let roadsideObjects = [];
  let cameraZoom = 1;
  let inputLeft = false;
  let inputRight = false;
  let inputGas = false;
  let inputBrake = false;
  let inputNitro = false;
  let steering = 0;
  let throttle = 0;
  let currentSpeed = 0;
  let nitroEnergy = 100;
  let worldDistance = 0;
  let raceProgress = 0;
  let playerLane = 0;
  let raceToastTimer = null;
  let tiltPermissionRequested = false;
  let lastCollisionTime = 0;
  let raceCanvas = null;

  const toast = (message, duration = 2800) => {
    const el = $("appToast");

    if (el) {
      el.textContent = message;
      el.hidden = false;
      clearTimeout(raceToastTimer);
      raceToastTimer = setTimeout(() => {
        el.hidden = true;
      }, duration);
    } else {
      console.info("[FOBAS]", message);
    }
  };

  /* ------------------------ INDEXEDDB --------------------------- */

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB indisponible"));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      };

      request.onsuccess = () => {
        db = request.result;
        resolve(db);
      };

      request.onerror = () => reject(
        request.error || new Error("Impossible d'ouvrir IndexedDB")
      );
    });
  }

  function readDatabaseSave() {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Base de données indisponible"));
        return;
      }

      const transaction = db.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(SAVE_KEY);

      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  }

  function writeDatabaseSave(data) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Base de données indisponible"));
        return;
      }

      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put({
        key: SAVE_KEY,
        data
      });

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  function readFallbackSave() {
    try {
      const raw = localStorage.getItem("fobasMotoRacingSave");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeFallbackSave(data) {
    try {
      localStorage.setItem("fobasMotoRacingSave", JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  function normalizeLoadedState(saved) {
    const fresh = defaultState();

    if (!saved || typeof saved !== "object") return fresh;

    const merged = {
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

    merged.credits = Math.max(0, Number(merged.credits) || 0);
    merged.xp = Math.max(0, Number(merged.xp) || 0);
    merged.level = Math.max(1, Number(merged.level) || 1);
    merged.races = Math.max(0, Number(merged.races) || 0);
    merged.wins = Math.max(0, Number(merged.wins) || 0);
    merged.podiums = Math.max(0, Number(merged.podiums) || 0);
    merged.championshipPoints = Math.max(
      0,
      Number(merged.championshipPoints) || 0
    );

    merged.ownedBikes = Array.isArray(merged.ownedBikes)
      ? [...new Set(merged.ownedBikes.filter((id) => BIKES[id]))]
      : [0];

    if (!merged.ownedBikes.includes(0)) merged.ownedBikes.unshift(0);

    merged.selectedBike = merged.ownedBikes.includes(
      Number(merged.selectedBike)
    ) ? Number(merged.selectedBike) : 0;

    merged.completedMissions = Array.isArray(merged.completedMissions)
      ? [...new Set(merged.completedMissions.filter((id) =>
          Number.isInteger(id) && id >= 1 && id <= 35
        ))]
      : [];

    merged.unlockedMissions = Array.isArray(merged.unlockedMissions)
      ? [...new Set(merged.unlockedMissions.filter((id) =>
          Number.isInteger(id) && id >= 1 && id <= 35
        ))]
      : [1];

    if (!merged.unlockedMissions.includes(1)) {
      merged.unlockedMissions.unshift(1);
    }

    return merged;
  }

  async function loadProgress() {
    let saved = null;

    try {
      await openDatabase();
      saved = await readDatabaseSave();
    } catch (error) {
      console.warn("[FOBAS] IndexedDB indisponible :", error);
      saved = readFallbackSave();
    }

    state = normalizeLoadedState(saved);
  }

  async function saveProgress(showMessage = false) {
    state.lastSaved = new Date().toISOString();

    let success = false;

    try {
      if (db) {
        await writeDatabaseSave(state);
        success = true;
      } else {
        success = writeFallbackSave(state);
      }
    } catch (error) {
      console.error("[FOBAS] Erreur de sauvegarde :", error);
      success = writeFallbackSave(state);
    }

    if (showMessage) {
      toast(success
        ? "Progression sauvegardée avec succès."
        : "Sauvegarde impossible. Vérifiez le stockage du navigateur."
      );
    }

    return success;
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveProgress(false), 500);
  }

  /* --------------------- PROFIL ET PROGRESSION ------------------ */

  function xpForNextLevel(level = state.level) {
    return 150 + (Math.max(1, level) - 1) * 90;
  }

  function totalXPForLevel(level) {
    let total = 0;

    for (let i = 1; i < level; i++) {
      total += xpForNextLevel(i);
    }

    return total;
  }

  function updateLevel() {
    let level = 1;
    let remaining = state.xp;

    while (remaining >= xpForNextLevel(level) && level < 35) {
      remaining -= xpForNextLevel(level);
      level++;
    }

    const previous = state.level;
    state.level = level;

    if (level > previous) {
      const bonus = (level - previous) * 100;
      state.credits += bonus;
      toast(`Niveau ${level} atteint ! Bonus : ${bonus} crédits.`);
    }
  }

  function getUpgrade(bikeId, key) {
    const upgrades = state.bikeUpgrades[bikeId] || {};
    return clamp(Number(upgrades[key]) || 0, 0, 5);
  }

  function getBikeStats(bikeId) {
    const bike = BIKES[bikeId] || BIKES[0];
    const speedLevel = getUpgrade(bikeId, "speed");
    const accelLevel = getUpgrade(bikeId, "acceleration");
    const handlingLevel = getUpgrade(bikeId, "handling");
    const brakeLevel = getUpgrade(bikeId, "braking");
    const nitroLevel = getUpgrade(bikeId, "nitro");

    return {
      ...bike,
      speed: bike.speed * (1 + speedLevel * 0.045),
      acceleration: bike.acceleration + accelLevel * 3,
      handling: Math.min(100, bike.handling + handlingLevel * 3),
      braking: Math.min(100, bike.braking + brakeLevel * 3),
      nitro: Math.min(100, bike.nitro + nitroLevel * 3)
    };
  }

  function currentBike() {
    return getBikeStats(state.selectedBike);
  }

  function missionById(id) {
    return MISSION_DEFINITIONS.find((mission) => mission.id === id)
      || MISSION_DEFINITIONS[0];
  }

  function highestUnlockedMission() {
    return Math.max(1, ...state.unlockedMissions);
  }

  function unlockNextMission(missionId) {
    const nextId = missionId + 1;

    if (nextId <= 35 && !state.unlockedMissions.includes(nextId)) {
      state.unlockedMissions.push(nextId);
    }
  }

  function updateProfileUI() {
    safeText("headerPlayerName", state.profile.name);
    safeText("profileNameDisplay", state.profile.name);
    safeText("profileCountryDisplay", state.profile.country);
    safeText("profileLevelDisplay", state.level);

    const rank = state.level >= 29
      ? "Légende"
      : state.level >= 22
        ? "Champion"
        : state.level >= 15
          ? "Expert"
          : state.level >= 8
            ? "Intermédiaire"
            : "Débutant";

    safeText("profileRankDisplay", rank);

    if ($("playerNameInput")) {
      $("playerNameInput").value = state.profile.name;
    }

    if ($("playerCountrySelect")) {
      $("playerCountrySelect").value = state.profile.country;
    }
  }

  function updateHomeUI() {
    safeText("creditDisplay", state.credits);
    safeText("homeLevel", state.level);
    safeText("homeWins", state.wins);
    safeText("homeRaces", state.races);
    safeText("homeMissions", state.completedMissions.length);

    const bike = BIKES[state.selectedBike] || BIKES[0];

    safeText("homeBikeName", bike.name);
    safeText(
      "homeBikeDescription",
      `Vitesse ${bike.speed} km/h · Maniabilité ${bike.handling}/100`
    );

    const art = $("homeBikeArt");

    if (art) {
      art.style.setProperty("--bike-color", `#${bike.color.toString(16).padStart(6, "0")}`);
      art.setAttribute("aria-label", bike.name);
    }

    updateProfileUI();
  }

  function updateCareerUI() {
    const nextXP = xpForNextLevel(state.level);
    const xpIntoLevel = state.xp - totalXPForLevel(state.level);
    const percentage = clamp((xpIntoLevel / nextXP) * 100, 0, 100);

    safeText("careerLevel", state.level);
    safeText("xpDisplay", Math.max(0, xpIntoLevel));
    safeText("xpNextDisplay", nextXP);
    safeText("completedMissionCount", state.completedMissions.length);
    safeText("bestCareerPosition", state.bestPosition || "—");
    safeText("careerPoints", state.championshipPoints);

    if ($("xpProgress")) {
      $("xpProgress").style.width = `${percentage}%`;
    }

    if ($("xpBar")) {
      $("xpBar").style.width = `${percentage}%`;
    }

    safeText(
      "careerMessage",
      state.completedMissions.length === 35
        ? "Toutes les missions sont terminées. Vous êtes une légende."
        : `${35 - state.completedMissions.length} mission(s) restent à terminer.`
    );

    const list = $("raceList");

    if (list) {
      list.innerHTML = MISSION_DEFINITIONS.map((mission) => {
        const completed = state.completedMissions.includes(mission.id);
        const unlocked = state.unlockedMissions.includes(mission.id);
        const isSelected = selectedMissionId === mission.id;

        return `
          <button
            type="button"
            class="race-mission-card ${completed ? "completed" : ""} ${isSelected ? "selected" : ""}"
            data-mission-id="${mission.id}"
            ${unlocked ? "" : "disabled"}
            aria-label="Mission ${mission.id} : ${escapeHTML(mission.title)}"
          >
            <span class="mission-number">${String(mission.id).padStart(2, "0")}</span>
            <span class="mission-info">
              <strong>${escapeHTML(mission.title)}</strong>
              <small>${escapeHTML(mission.difficulty.name)} · ${escapeHTML(mission.location.city)}</small>
            </span>
            <span class="mission-status">${completed ? "✓" : unlocked ? "▶" : "🔒"}</span>
          </button>
        `;
      }).join("");

      list.querySelectorAll("[data-mission-id]").forEach((button) => {
        button.addEventListener("click", () => {
          selectedMissionId = Number(button.dataset.missionId);
          updateCareerUI();
          startRace(selectedMissionId);
        });
      });
    }
  }

  function updateChampionshipUI() {
    safeText("championPoints", state.championshipPoints);
    safeText("championWins", state.wins);
    safeText("championRaces", state.races);
    safeText("firstPlaceReward", "300 crédits + 100 XP");
    safeText("secondPlaceReward", "180 crédits + 65 XP");
    safeText("thirdPlaceReward", "100 crédits + 40 XP");

    const list = $("leaderboard");

    if (!list) return;

    const localPlayers = [{
      name: state.profile.name,
      country: state.profile.country,
      points: state.championshipPoints,
      wins: state.wins,
      isPlayer: true
    }];

    const entries = [...(state.leaderboard || []), ...localPlayers]
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 20);

    list.innerHTML = entries.map((entry, index) => `
      <div class="leaderboard-row ${entry.isPlayer ? "current-player" : ""}">
        <span class="leaderboard-rank">${index + 1}</span>
        <span class="leaderboard-player">
          <strong>${escapeHTML(entry.name || "Pilote")}</strong>
          <small>${escapeHTML(entry.country || "—")}</small>
        </span>
        <span class="leaderboard-points">${Number(entry.points) || 0} pts</span>
      </div>
    `).join("");

    if (!entries.length) {
      list.textContent = "Aucun résultat pour le moment.";
    }
  }

  /* ---------------------------- NAVIGATION ---------------------- */

  function navigate(screenId) {
    const target = $(screenId);

    if (!target) {
      toast("Cette section n'est pas disponible dans le HTML actuel.");
      return;
    }

    document.querySelectorAll(
      "#motoApp main section, #motoApp > section"
    ).forEach((section) => {
      if (section.id && section.id.endsWith("Screen")) {
        section.hidden = section.id !== screenId;
      }
    });

    target.hidden = false;
    currentScreen = screenId;

    document.querySelectorAll("[data-nav]").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.nav === screenId
      );
      button.setAttribute(
        "aria-current",
        button.dataset.nav === screenId ? "page" : "false"
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
    document.querySelectorAll("[data-nav]").forEach((button) => {
      button.addEventListener("click", () => {
        navigate(button.dataset.nav);
      });
    });

    document.querySelectorAll("[data-go]").forEach((button) => {
      button.addEventListener("click", () => {
        const destination = button.dataset.go;

        if (destination === "raceScreen") {
          startRace(selectedMissionId);
        } else {
          navigate(destination);
        }
      });
    });

    const mappings = {
      homeButton: "homeScreen",
      careerButton: "careerScreen",
      openGarageButton: "garageScreen",
      profileButton: "settingsScreen"
    };

    Object.entries(mappings).forEach(([id, screen]) => {
      $(id)?.addEventListener("click", () => navigate(screen));
    });

    $("homeRaceButton")?.addEventListener("click", () => {
      startRace(selectedMissionId);
    });

    $("challengeMasterButton")?.addEventListener("click", challengeMaster);
    $("challengeMasterChampionshipButton")?.addEventListener("click", challengeMaster);

    $("editProfileButton")?.addEventListener("click", () => {
      safeShow("profileEditForm", true);
      $("playerNameInput")?.focus();
    });

    $("cancelProfileButton")?.addEventListener("click", () => {
      safeShow("profileEditForm", false);
      updateProfileUI();
    });

    $("saveProfileButton")?.addEventListener("click", saveProfile);
    $("refreshLeaderboardButton")?.addEventListener("click", updateChampionshipUI);
    $("saveProgressButton")?.addEventListener("click", () => saveProgress(true));

    installSettingsShortcut();
  }

  function installSettingsShortcut() {
    const topbar = document.querySelector(".topbar");

    if (!topbar || $("openSettingsButton")) return;

    const button = document.createElement("button");
    button.id = "openSettingsButton";
    button.type = "button";
    button.className = "secondary-btn compact";
    button.textContent = "⚙";
    button.setAttribute("aria-label", "Ouvrir les paramètres");
    button.title = "Paramètres";

    button.addEventListener("click", () => navigate("settingsScreen"));
    topbar.appendChild(button);
  }

  function saveProfile() {
    const name = $("playerNameInput")?.value.trim();
    const country = $("playerCountrySelect")?.value;

    if (!name || name.length < 2) {
      toast("Entrez un nom de pilote d'au moins 2 caractères.");
      return;
    }

    state.profile.name = name.slice(0, 32);
    state.profile.country = country || "Haïti";

    safeShow("profileEditForm", false);
    updateProfileUI();
    updateHomeUI();
    scheduleSave();
    toast("Profil enregistré.");
  }

  /* ------------------------------ GARAGE ------------------------ */

  function bikeIsOwned(id) {
    return state.ownedBikes.includes(id);
  }

  function upgradePrice(bikeId, key) {
    const level = getUpgrade(bikeId, key);
    return Math.round((220 + bikeId * 55) * (1 + level * 0.85));
  }

  function buyOrSelectBike(id) {
    const bike = BIKES[id];

    if (!bike) return;

    if (!bikeIsOwned(id)) {
      if (state.credits < bike.price) {
        toast(`Crédits insuffisants. Il faut ${bike.price} crédits.`);
        return;
      }

      state.credits -= bike.price;
      state.ownedBikes.push(id);
      toast(`${bike.name} achetée avec succès.`);
    }

    state.selectedBike = id;
    garageBikeId = id;

    updateGarageUI();
    updateHomeUI();
    scheduleSave();
  }

  function updateGarageUI() {
    const bike = getBikeStats(garageBikeId);
    const color = state.bikePaints[garageBikeId] || `#${bike.color.toString(16).padStart(6, "0")}`;

    safeText("garageBikeName", bike.name);
    safeText("bikeOwnedBadge", bikeIsOwned(garageBikeId) ? "Possédée" : `${bike.price} crédits`);

    const art = $("garageBikeArt");

    if (art) {
      art.style.setProperty("--bike-color", color);
      art.setAttribute("aria-label", bike.name);
    }

    safeText("statSpeed", Math.round(bike.speed));
    safeText("statAccel", Math.round(bike.acceleration));
    safeText("statHandling", Math.round(bike.handling));
    safeText("statBraking", Math.round(bike.braking));
    safeText("statNitro", Math.round(bike.nitro));

    renderBikeShop();
    renderUpgrades();
    renderPaintOptions();
  }

  function renderBikeShop() {
    const list = $("bikeShopList");

    if (!list) return;

    list.innerHTML = BIKES.map((bike) => {
      const owned = bikeIsOwned(bike.id);
      const selected = bike.id === garageBikeId;

      return `
        <article class="bike-shop-card ${selected ? "selected" : ""}">
          <div class="bike-shop-color" style="background:#${bike.color.toString(16).padStart(6, "0")}"></div>
          <div class="bike-shop-info">
            <strong>${escapeHTML(bike.name)}</strong>
            <small>${bike.speed} km/h · Maniabilité ${bike.handling}</small>
          </div>
          <button
            type="button"
            data-bike-action="${bike.id}"
            class="bike-action-btn"
          >${selected ? "Sélectionnée" : owned ? "Choisir" : `${bike.price} crédits`}</button>
        </article>
      `;
    }).join("");

    list.querySelectorAll("[data-bike-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.bikeAction);

        if (!bikeIsOwned(id)) {
          if (state.credits < BIKES[id].price) {
            toast("Vous n'avez pas assez de crédits.");
            return;
          }
          garageBikeId = id;
          buyOrSelectBike(id);
        } else {
          garageBikeId = id;
          buyOrSelectBike(id);
        }
      });
    });
  }

  function renderUpgrades() {
    const list = $("upgradeList");

    if (!list) return;

    const upgrades = [
      { key: "speed", label: "Moteur / vitesse" },
      { key: "acceleration", label: "Accélération" },
      { key: "handling", label: "Pneus / maniabilité" },
      { key: "braking", label: "Freins" },
      { key: "nitro", label: "Système nitro" }
    ];

    list.innerHTML = upgrades.map((upgrade) => {
      const level = getUpgrade(garageBikeId, upgrade.key);
      const price = upgradePrice(garageBikeId, upgrade.key);

      return `
        <div class="upgrade-row">
          <div>
            <strong>${escapeHTML(upgrade.label)}</strong>
            <small>Niveau ${level}/5</small>
          </div>
          <button
            type="button"
            data-upgrade="${upgrade.key}"
            ${level >= 5 || !bikeIsOwned(garageBikeId) ? "disabled" : ""}
          >${level >= 5 ? "MAX" : `Améliorer · ${price}`}</button>
        </div>
      `;
    }).join("");

    list.querySelectorAll("[data-upgrade]").forEach((button) => {
      button.addEventListener("click", () => {
        purchaseUpgrade(garageBikeId, button.dataset.upgrade);
      });
    });
  }

  function purchaseUpgrade(bikeId, key) {
    if (!bikeIsOwned(bikeId)) {
      toast("Achetez d'abord cette moto.");
      return;
    }

    const level = getUpgrade(bikeId, key);

    if (level >= 5) {
      toast("Cette amélioration a déjà atteint le niveau maximum.");
      return;
    }

    const price = upgradePrice(bikeId, key);

    if (state.credits < price) {
      toast("Crédits insuffisants pour cette amélioration.");
      return;
    }

    state.credits -= price;

    if (!state.bikeUpgrades[bikeId]) {
      state.bikeUpgrades[bikeId] = {};
    }

    state.bikeUpgrades[bikeId][key] = level + 1;

    updateGarageUI();
    updateHomeUI();
    scheduleSave();
    toast("Amélioration installée.");
  }

  function renderPaintOptions() {
    const container = $("paintOptions");

    if (!container) return;

    const currentPaint = state.bikePaints[garageBikeId];

    container.innerHTML = PAINTS.map((paint) => `
      <button
        type="button"
        class="paint-option ${currentPaint === paint.color ? "selected" : ""}"
        data-paint="${paint.color}"
        title="${escapeHTML(paint.name)}"
        aria-label="${escapeHTML(paint.name)}"
        style="background:${paint.color}; width:36px; height:36px; border-radius:50%; border:2px solid ${currentPaint === paint.color ? "#fff" : "transparent"}; cursor:pointer;"
      ></button>
    `).join("");

    container.querySelectorAll("[data-paint]").forEach((button) => {
      button.addEventListener("click", () => {
        state.bikePaints[garageBikeId] = button.dataset.paint;
        updateGarageUI();
      });
    });
  }

  function applyPaint() {
    if (!bikeIsOwned(garageBikeId)) {
      toast("Achetez d'abord cette moto avant de la personnaliser.");
      return;
    }

    const selectedPaint = state.bikePaints[garageBikeId];

    if (!selectedPaint) {
      toast("Choisissez une couleur avant de l'appliquer.");
      return;
    }

    updateGarageUI();
    scheduleSave();
    toast("Nouvelle peinture appliquée.");
  }

  /* -------------------------- PARAMÈTRES ------------------------ */

  function updateSettingsUI() {
    if ($("settingTilt")) {
      $("settingTilt").checked = Boolean(state.settings.tilt);
    }

    if ($("settingVibration")) {
      $("settingVibration").checked = Boolean(state.settings.vibration);
    }

    if ($("settingReducedEffects")) {
      $("settingReducedEffects").checked = Boolean(state.settings.reducedEffects);
    }

    if ($("graphicsQuality")) {
      $("graphicsQuality").value = state.settings.graphicsQuality;
    }

    safeText("gameVersion", VERSION);
  }

  function bindSettings() {
    $("settingTilt")?.addEventListener("change", (event) => {
      state.settings.tilt = event.target.checked;
      scheduleSave();

      if (state.settings.tilt) {
        requestTiltPermission();
      }
    });

    $("settingVibration")?.addEventListener("change", (event) => {
      state.settings.vibration = event.target.checked;
      scheduleSave();
    });

    $("settingReducedEffects")?.addEventListener("change", (event) => {
      state.settings.reducedEffects = event.target.checked;
      scheduleSave();
    });

    $("graphicsQuality")?.addEventListener("change", (event) => {
      state.settings.graphicsQuality = event.target.value;
      configureRendererQuality();
      scheduleSave();
    });
  }

  async function requestTiltPermission() {
    if (tiltPermissionRequested) return;
    tiltPermissionRequested = true;

    try {
      if (typeof DeviceOrientationEvent !== "undefined" &&
          typeof DeviceOrientationEvent.requestPermission === "function") {
        const permission = await DeviceOrientationEvent.requestPermission();

        if (permission !== "granted") {
          state.settings.tilt = false;
          updateSettingsUI();
          toast("Accès au gyroscope refusé.");
          return;
        }
      }

      toast("Contrôle par inclinaison activé.");
    } catch (error) {
      console.warn("[FOBAS] Gyroscope :", error);
      toast("Le gyroscope n'est pas disponible sur cet appareil.");
    }
  }

  /* --------------------------- THREE.JS ------------------------- */

  function makeMaterial(color, roughness = 0.75, metalness = 0.05) {
    return new three.MeshStandardMaterial({
      color,
      roughness,
      metalness
    });
  }

  function addBox(parent, width, height, depth, material, x, y, z) {
    const mesh = new three.Mesh(
      new three.BoxGeometry(width, height, depth),
      material
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function createWheel(parent, x, y, z, radius = 0.43) {
    const wheel = new three.Group();
    wheel.position.set(x, y, z);

    const rubber = makeMaterial(0x17191b, 0.96);
    const rim = makeMaterial(0xb9c1ca, 0.35, 0.8);
    const hub = makeMaterial(0x59616b, 0.35, 0.7);

    const tire = new three.Mesh(
      new three.TorusGeometry(radius, radius * 0.16, 12, 24),
      rubber
    );

    tire.rotation.y = Math.PI / 2;
    tire.castShadow = true;
    wheel.add(tire);

    const disk = new three.Mesh(
      new three.CylinderGeometry(radius * 0.63, radius * 0.63, 0.08, 20),
      rim
    );

    disk.rotation.z = Math.PI / 2;
    disk.castShadow = true;
    wheel.add(disk);

    const center = new three.Mesh(
      new three.CylinderGeometry(radius * 0.18, radius * 0.18, 0.1, 12),
      hub
    );

    center.rotation.z = Math.PI / 2;
    wheel.add(center);

    parent.add(wheel);
    return wheel;
  }

  function createMotorcycle(color = 0xe53935, scale = 1) {
    const bike = new three.Group();
    bike.scale.setScalar(scale);

    const paint = makeMaterial(color, 0.3, 0.45);
    const dark = makeMaterial(0x24282d, 0.72, 0.15);
    const metal = makeMaterial(0xb7c0c8, 0.3, 0.8);
    const rubber = makeMaterial(0x111315, 0.96);
    const lampMaterial = new three.MeshStandardMaterial({
      color: 0xfff4cc,
      emissive: 0xffd27d,
      emissiveIntensity: 0.65
    });

    const wheels = [];

    wheels.push(createWheel(bike, 0, 0.44, -0.94, 0.38));
    wheels.push(createWheel(bike, 0, 0.44, 0.91, 0.38));

    // Cadre central.
    addBox(bike, 0.12, 0.15, 1.05, metal, 0, 0.73, -0.02);

    // Moteur.
    addBox(bike, 0.43, 0.4, 0.45, dark, 0, 0.65, 0.17);

    // Réservoir.
    const tank = new three.Mesh(
      new three.SphereGeometry(0.35, 16, 12),
      paint
    );

    tank.scale.set(0.85, 0.65, 1.25);
    tank.position.set(0, 1.05, -0.12);
    tank.castShadow = true;
    bike.add(tank);

    // Selle.
    const seat = addBox(
      bike, 0.38, 0.12, 0.55, dark, 0, 1.1, 0.48
    );

    seat.rotation.x = -0.08;

    // Fourche avant.
    const fork = addBox(
      bike, 0.08, 0.74, 0.08, metal, 0, 0.83, -0.73
    );

    fork.rotation.x = -0.18;

    // Guidon.
    addBox(bike, 0.86, 0.06, 0.07, metal, 0, 1.32, -0.64);

    // Silencieux.
    const exhaust = addBox(
      bike, 0.12, 0.12, 0.68, metal, -0.24, 0.61, 0.51
    );

    exhaust.rotation.x = -0.08;

    // Carénage.
    const fairing = new three.Mesh(
      new three.SphereGeometry(0.32, 16, 12),
      paint
    );

    fairing.scale.set(0.7, 0.85, 0.75);
    fairing.position.set(0, 0.91, -0.62);
    fairing.castShadow = true;
    bike.add(fairing);

    // Phare.
    const lamp = new three.Mesh(
      new three.SphereGeometry(0.12, 12, 10),
      lampMaterial
    );

    lamp.scale.set(1, 0.75, 0.4);
    lamp.position.set(0, 1.04, -0.9);
    bike.add(lamp);

    // Pilote stylisé en 3D.
    const rider = new three.Group();

    const suit = makeMaterial(0x20252d, 0.75);
    const helmetMaterial = makeMaterial(0xf2f3f4, 0.28, 0.15);

    const torso = new three.Mesh(
      new three.CapsuleGeometry(0.18, 0.43, 4, 8),
      suit
    );

    torso.rotation.x = -0.35;
    torso.position.set(0, 1.48, 0.16);
    rider.add(torso);

    const helmet = new three.Mesh(
      new three.SphereGeometry(0.19, 16, 12),
      helmetMaterial
    );

    helmet.position.set(0, 1.82, -0.12);
    rider.add(helmet);

    const visor = new three.Mesh(
      new three.SphereGeometry(0.12, 12, 8),
      makeMaterial(0x273746, 0.15, 0.5)
    );

    visor.scale.set(1, 0.7, 0.5);
    visor.position.set(0, 1.83, -0.26);
    rider.add(visor);

    const armGeometry = new three.CylinderGeometry(0.055, 0.065, 0.53, 8);

    [-1, 1].forEach((side) => {
      const arm = new three.Mesh(armGeometry, suit);
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

  function createTree() {
    const tree = new three.Group();

    const trunk = new three.Mesh(
      new three.CylinderGeometry(0.12, 0.18, 1.5, 8),
      makeMaterial(0x6c4a30)
    );

    trunk.position.y = 0.75;
    trunk.castShadow = true;
    tree.add(trunk);

    const leaves = new three.Mesh(
      new three.ConeGeometry(rand(0.75, 1.15), rand(1.8, 2.7), 8),
      makeMaterial(pick([0x267447, 0x317d49, 0x448b48, 0x236b45]))
    );

    leaves.position.y = 2.0;
    leaves.castShadow = true;
    tree.add(leaves);

    return tree;
  }

  function buildRoad() {
    roadSegments = [];

    const roadMaterial = makeMaterial(0x30373b, 0.96, 0.02);
    const shoulderMaterial = makeMaterial(0xd6d5ca, 0.9, 0);
    const stripeMaterial = makeMaterial(0xf5f4e9, 0.8, 0);
    const redMaterial = makeMaterial(0xe9484e, 0.8, 0);

    for (let i = 0; i < 34; i++) {
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
        const edge = new three.Mesh(
          new three.BoxGeometry(0.26, 0.16, 7.1),
          shoulderMaterial
        );

        edge.position.set(side * 4.35, 0.02, 0);
        segment.add(edge);

        const curb = new three.Mesh(
          new three.BoxGeometry(0.15, 0.17, 1.4),
          i % 2 ? redMaterial : stripeMaterial
        );

        curb.position.set(side * 4.25, 0.08, 0);
        segment.add(curb);
      }

      const dash = new three.Mesh(
        new three.BoxGeometry(0.12, 0.025, 2.4),
        stripeMaterial
      );

      dash.position.set(0, 0.025, 0);
      segment.add(dash);

      world.add(segment);
      roadSegments.push(segment);
    }
  }

  function buildScenery() {
    roadsideObjects = [];

    const ground = new three.Mesh(
      new three.PlaneGeometry(500, 600),
      makeMaterial(0x527c42, 1, 0)
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
      tree.userData.side = side;

      world.add(tree);
      roadsideObjects.push(tree);
    }

    // Quelques rochers et barrières.
    const rockMaterial = makeMaterial(0x777c7e, 0.96);

    for (let i = 0; i < 18; i++) {
      const rock = new three.Mesh(
        new three.DodecahedronGeometry(rand(0.3, 0.8), 0),
        rockMaterial
      );

      rock.position.set(
        (i % 2 ? 1 : -1) * rand(5.4, 10),
        0.2,
        -rand(20, 220)
      );

      rock.rotation.set(rand(0, 2), rand(0, 2), rand(0, 2));
      rock.castShadow = true;
      world.add(rock);
      roadsideObjects.push(rock);
    }
  }

  function resetRaceWorld() {
    if (!world || !currentRace) return;

    roadsideObjects.forEach((obj) => {
      obj.position.z = -rand(20, 220);

      if (obj.userData.initialX !== undefined) {
        obj.position.x = obj.userData.initialX;
      }
    });

    roadSegments.forEach((segment, index) => {
      segment.position.z = -index * 7;
    });

    if (playerBike3D) {
      playerBike3D.position.set(0, 0.05, 2);
      playerBike3D.rotation.set(0, 0, 0);
    }

    aiRiders.forEach((ai, index) => {
      const data = currentRace.ai[index];

      ai.position.set(data ? data.lane : 0, 0.05, -7 - index * 10);
      ai.rotation.set(0, 0, 0);
    });

    cameraZoom = 1;

    if (camera) {
      camera.fov = 65;
      camera.updateProjectionMatrix();
    }
  }

  async function initThree() {
    raceCanvas = $("raceCanvas");

    if (!raceCanvas) {
      throw new Error("Le canvas #raceCanvas est absent du HTML.");
    }

    const THREE = await import(
      "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js"
    );

    three = THREE;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8db8d5);
    scene.fog = new THREE.Fog(0x8db8d5, 65, 260);

    camera = new THREE.PerspectiveCamera(
      65,
      1,
      0.1,
      500
    );

    camera.position.set(0, 4.6, 9.5);
    camera.lookAt(0, 1, -5);

    // Le renderer reçoit directement le canvas existant.
    renderer = new THREE.WebGLRenderer({
      canvas: raceCanvas,
      antialias: state.settings.graphicsQuality !== "low",
      alpha: false,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.shadowMap.enabled =
      !state.settings.reducedEffects &&
      state.settings.graphicsQuality === "high";

    if ("outputColorSpace" in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    if ("toneMapping" in renderer) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
    }

    world = new THREE.Group();
    scene.add(world);

    const hemisphere = new THREE.HemisphereLight(
      0xdceeff,
      0x3b4d32,
      2.0
    );

    scene.add(hemisphere);

    const sun = new THREE.DirectionalLight(0xfff1d0, 2.5);
    sun.position.set(-12, 20, 8);
    sun.castShadow = renderer.shadowMap.enabled;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x91c8ff, 0.7);
    fill.position.set(12, 7, -20);
    scene.add(fill);

    buildRoad();
    buildScenery();

    playerBike3D = createMotorcycle(
      Number.parseInt(
        (state.bikePaints[state.selectedBike] ||
          `#${currentBike().color.toString(16).padStart(6, "0")}`)
          .replace("#", ""),
        16
      ),
      1
    );

    playerBike3D.position.set(0, 0.05, 2);
    world.add(playerBike3D);

    createAIRiders();
    resizeRenderer();

    window.addEventListener("resize", resizeRenderer, { passive: true });

    return true;
  }

  function createAIRiders() {
    if (!world || !three) return;

    aiRiders.forEach((ai) => world.remove(ai));
    aiRiders = [];

    const rivalColors = [0x1687ee, 0xffb020, 0x8e44ad, 0x18a878];

    for (let i = 0; i < 4; i++) {
      const ai = createMotorcycle(rivalColors[i], 0.9);
      ai.position.set(i % 2 === 0 ? -1.4 : 1.4, 0.05, -9 - i * 8);
      ai.userData.aiIndex = i;
      ai.userData.phase = rand(0, Math.PI * 2);
      world.add(ai);
      aiRiders.push(ai);
    }
  }

  function configureRendererQuality() {
    if (!renderer) return;

    renderer.shadowMap.enabled =
      !state.settings.reducedEffects &&
      state.settings.graphicsQuality === "high";

    const ratio = state.settings.graphicsQuality === "low"
      ? 1
      : state.settings.graphicsQuality === "medium"
        ? 1.35
        : 1.75;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, ratio));
    resizeRenderer();
  }

  function resizeRenderer() {
    if (!renderer || !camera || !raceCanvas) return;

    const parent = raceCanvas.parentElement;
    const width = Math.max(
      1,
      parent?.clientWidth || window.innerWidth
    );

    const height = Math.max(
      1,
      parent?.clientHeight || Math.min(window.innerHeight * 0.55, 600)
    );

    renderer.setSize(width, height, false);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function animateThree(delta) {
    if (!renderer || !scene || !camera) return;

    if (playerBike3D) {
      playerBike3D.rotation.z = three.MathUtils.lerp(
        playerBike3D.rotation.z,
        -steering * 0.12,
        Math.min(1, delta * 5)
      );

      playerBike3D.userData.wheels?.forEach((wheel) => {
        wheel.rotation.x += currentSpeed * delta * 0.09;
      });
    }

    if (currentRace && !paused && !raceFinished) {
      const distanceStep = currentSpeed * delta * 0.018;
      worldDistance += distanceStep;

      roadSegments.forEach((segment) => {
        segment.position.z += currentSpeed * delta * 0.16;

        if (segment.position.z > 12) {
          segment.position.z -= roadSegments.length * 7;
        }
      });

      roadsideObjects.forEach((obj) => {
        obj.position.z += currentSpeed * delta * 0.16;

        if (obj.position.z > 14) {
          obj.position.z = -rand(190, 280);
        }
      });

      aiRiders.forEach((ai, index) => {
        const aiData = currentRace.ai[index];
        if (!aiData) return;

        const relativeSpeed = currentSpeed - aiData.speed;
        ai.position.z += relativeSpeed * delta * 0.11;

        // IA : progression graduelle, sans téléportation.
        aiData.speed = three.MathUtils.lerp(
          aiData.speed,
          aiData.targetSpeed,
          Math.min(1, delta * 0.18)
        );

        aiData.phase += delta;
        ai.position.x = three.MathUtils.lerp(
          ai.position.x,
          aiData.lane + Math.sin(aiData.phase) * 0.12,
          Math.min(1, delta * 1.4)
        );

        if (ai.position.z > 7) {
          ai.position.z = -rand(20, 42);
          aiData.lane = pick([-2.2, -1.1, 0, 1.1, 2.2]);
        }

        if (ai.position.z < -80) {
          ai.position.z = -80;
        }
      });

      // Détection de proximité : ralentissement léger, pas de téléportation.
      const now = performance.now();

      aiRiders.forEach((ai) => {
        if (
          Math.abs(ai.position.z - playerBike3D.position.z) < 1.25 &&
          Math.abs(ai.position.x - playerBike3D.position.x) < 0.75 &&
          now - lastCollisionTime > 900
        ) {
          currentSpeed *= 0.88;
          lastCollisionTime = now;
          toast("Contact ! Gardez vos distances.", 1000);
        }
      });

      // Le joueur ne peut pas sortir indéfiniment de la piste.
      playerLane = clamp(playerLane, -3.45, 3.45);
      playerBike3D.position.x = three.MathUtils.lerp(
        playerBike3D.position.x,
        playerLane,
        Math.min(1, delta * 5)
      );

      const desiredCameraX = playerBike3D.position.x * 0.55;

      camera.position.x = three.MathUtils.lerp(
        camera.position.x,
        desiredCameraX,
        Math.min(1, delta * 2)
      );

      camera.fov = three.MathUtils.lerp(
        camera.fov,
        65 - (cameraZoom - 1) * 8,
        Math.min(1, delta * 4)
      );

      camera.updateProjectionMatrix();
      camera.lookAt(playerBike3D.position.x * 0.4, 0.9, -5);
    }

    renderer.render(scene, camera);
  }

  /* ------------------------ COURSE ET IA ------------------------ */

  function buildRaceData(missionId) {
    const mission = missionById(missionId);
    const masterChallenge = missionId === 35 || currentRace?.masterChallenge;

    const ai = Array.from({ length: 4 }, (_, index) => {
      const difficultyFactor = mission.difficulty.speed;

      return {
        name: index === 0 && masterChallenge
          ? "MEME Selvandieu"
          : ["Alex Racing", "Speed Master", "Turbo Rider", "Night Hawk"][index],
        lane: [-2.1, -0.7, 0.7, 2.1][index],
        speed: 35 + index * 2,
        targetSpeed: (70 + index * 8) * difficultyFactor,
        progress: 0,
        phase: rand(0, Math.PI * 2)
      };
    });

    if (masterChallenge) {
      ai[0].targetSpeed = Math.max(80, currentBike().speed * 0.88);
    }

    return {
      missionId,
      mission,
      masterChallenge,
      started: false,
      elapsed: 0,
      distance: 0,
      laps: 0,
      totalLaps: mission.laps,
      ai,
      lastPosition: 5
    };
  }

  function challengeMaster() {
    if (state.level < 10 && state.completedMissions.length < 9) {
      toast("Terminez davantage de missions avant le défi du maître.");
      return;
    }

    selectedMissionId = 35;
    startRace(35, true);
  }

  function startRace(missionId = selectedMissionId, masterChallenge = false) {
    if (currentRace && !raceFinished && !paused) {
      const confirmLeave = window.confirm(
        "Une course est en cours. Voulez-vous l'abandonner ?"
      );

      if (!confirmLeave) return;
    }

    const id = clamp(Number(missionId) || 1, 1, 35);

    if (!state.unlockedMissions.includes(id) && id !== 35) {
      toast("Cette mission est verrouillée. Terminez la précédente.");
      return;
    }

    selectedMissionId = id;
    currentRace = buildRaceData(id);
    currentRace.masterChallenge = masterChallenge || id === 35;

    currentSpeed = 0;
    nitroEnergy = 100;
    worldDistance = 0;
    raceProgress = 0;
    playerLane = 0;
    steering = 0;
    throttle = 0;
    raceClock = 0;
    countdown = 3;
    countdownAccumulator = 0;
    paused = false;
    raceFinished = false;
    raceToastTimer && clearTimeout(raceToastTimer);

    resetRaceWorld();

    navigate("raceScreen");

    safeShow("pauseOverlay", false);
    safeShow("resultOverlay", false);
    safeShow("countdownDisplay", true);
    safeText("countdownDisplay", "3");

    const mission = currentRace.mission;

    safeText("raceMissionName", mission.title);
    safeText(
      "raceLocationName",
      `${mission.location.city}, ${mission.location.country}`
    );
    safeText("raceDifficultyName", mission.difficulty.name);

    safeText("positionDisplay", "5/5");
    safeText("lapDisplay", `0/${mission.laps}`);
    safeText("timeDisplay", "00:00");

    const toastMessage = currentRace.masterChallenge
      ? "Défi du maître : battez MEME Selvandieu !"
      : `Mission ${id}/35 : préparez-vous !`;

    toast(toastMessage);
  }

  function getPlayerPosition() {
    if (!currentRace) return 5;

    const playerScore = raceProgress;
    let position = 1;

    currentRace.ai.forEach((ai) => {
      if (ai.progress > playerScore) position++;
    });

    return clamp(position, 1, 5);
  }

  function calculateRewards(position, mission) {
    const baseReward = mission.reward;

    const rewards = {
      1: { credits: baseReward, xp: mission.xp, points: 100 },
      2: {
        credits: Math.round(baseReward * 0.6),
        xp: Math.round(mission.xp * 0.65),
        points: 60
      },
      3: {
        credits: Math.round(baseReward * 0.35),
        xp: Math.round(mission.xp * 0.4),
        points: 35
      },
      4: {
        credits: Math.round(baseReward * 0.1),
        xp: Math.round(mission.xp * 0.15),
        points: 10
      },
      5: { credits: 0, xp: 5, points: 0 }
    };

    return rewards[position] || rewards[5];
  }

  function finishRace(forcedPosition = null) {
    if (!currentRace || raceFinished) return;

    raceFinished = true;
    paused = false;
    currentSpeed = 0;

    safeShow("countdownDisplay", false);
    safeShow("pauseOverlay", false);

    const position = forcedPosition || getPlayerPosition();
    const mission = currentRace.mission;
    const reward = calculateRewards(position, mission);

    state.races++;
    state.bestPosition = state.bestPosition
      ? Math.min(state.bestPosition, position)
      : position;

    state.credits += reward.credits;
    state.xp += reward.xp;
    state.championshipPoints += reward.points;

    if (position === 1) {
      state.wins++;
      state.podiums++;
      state.completedMissions = [
        ...new Set([...state.completedMissions, mission.id])
      ];

      unlockNextMission(mission.id);
    } else if (position <= 3) {
      state.podiums++;
    }

    updateLevel();

    safeText("resultPosition", position === 1
      ? "1er"
      : position === 2
        ? "2e"
        : position === 3
          ? "3e"
          : `${position}e`
    );

    safeText("resultCredits", `+${reward.credits}`);
    safeText("resultXP", `+${reward.xp}`);
    safeText("resultChampionshipPoints", `+${reward.points}`);

    safeText(
      "resultEyebrow",
      currentRace.masterChallenge ? "DÉFI DU MAÎTRE" : `MISSION ${mission.id}/35`
    );

    safeText(
      "resultTitle",
      position === 1 ? "VICTOIRE !" :
        position <= 3 ? "PODIUM !" : "COURSE TERMINÉE"
    );

    safeText(
      "resultSubtitle",
      position === 1
        ? "Excellente course. Vous avez gagné."
        : position === 2
          ? "Très bonne performance. Deuxième place."
          : position === 3
            ? "Vous montez sur le podium."
            : "Continuez à vous entraîner pour progresser."
    );

    safeText(
      "resultPodiumMessage",
      position === 1
        ? "Médaille d'or — Champion"
        : position === 2
          ? "Médaille d'argent"
          : position === 3
            ? "Médaille de bronze"
            : "La prochaine course sera meilleure."
    );

    const podium = $("resultPodium");

    if (podium) {
      podium.textContent = position <= 3
        ? ["🥇", "🥈", "🥉"][position - 1]
        : "🏁";
    }

    safeShow("resultOverlay", true);

    updateHomeUI();
    updateCareerUI();
    updateChampionshipUI();
    updateGarageUI();

    saveProgress(false);
  }

  function restartRace() {
    if (!currentRace) {
      startRace(selectedMissionId);
      return;
    }

    const missionId = currentRace.missionId;
    const master = currentRace.masterChallenge;

    startRace(missionId, master);
  }

  function quitRace() {
    paused = false;
    raceFinished = false;
    currentRace = null;

    safeShow("pauseOverlay", false);
    safeShow("resultOverlay", false);
    safeShow("countdownDisplay", false);

    navigate("homeScreen");
  }

  function pauseRace() {
    if (!currentRace || raceFinished) return;

    paused = !paused;
    safeShow("pauseOverlay", paused);

    if (paused) {
      safeText("pauseButton", "▶");
    } else {
      safeText("pauseButton", "Ⅱ");
      lastFrameTime = performance.now();
    }
  }

  function bindRaceButtons() {
    $("pauseButton")?.addEventListener("click", pauseRace);
    $("resumeButton")?.addEventListener("click", pauseRace);
    $("restartButton")?.addEventListener("click", restartRace);
    $("quitRaceButton")?.addEventListener("click", quitRace);

    $("continueButton")?.addEventListener("click", () => {
      safeShow("resultOverlay", false);
      currentRace = null;
      navigate("careerScreen");
    });

    $("applyPaintButton")?.addEventListener("click", applyPaint);
  }

  /* --------------------- COMMANDES TACTILES --------------------- */

  function setControl(name, active) {
    switch (name) {
      case "left":
        inputLeft = active;
        break;
      case "right":
        inputRight = active;
        break;
      case "gas":
        inputGas = active;
        break;
      case "brake":
        inputBrake = active;
        break;
      case "nitro":
        inputNitro = active;
        break;
    }
  }

  function bindHoldButton(id, name) {
    const button = $(id);
    if (!button) return;

    const press = (event) => {
      event.preventDefault();
      setControl(name, true);
      button.classList.add("pressed");

      try {
        button.setPointerCapture?.(event.pointerId);
      } catch {
        // Certains navigateurs ne prennent pas en charge la capture.
      }
    };

    const release = (event) => {
      if (event) event.preventDefault();
      setControl(name, false);
      button.classList.remove("pressed");
    };

    button.addEventListener("pointerdown", press, { passive: false });
    button.addEventListener("pointerup", release, { passive: false });
    button.addEventListener("pointercancel", release, { passive: false });
    button.addEventListener("lostpointercapture", release);
    button.addEventListener("contextmenu", (event) => event.preventDefault());
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

    window.addEventListener("keydown", (event) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
        event.preventDefault();
      }

      if (event.repeat) return;

      switch (event.key.toLowerCase()) {
        case "arrowleft":
        case "a":
          setControl("left", true);
          break;
        case "arrowright":
        case "d":
          setControl("right", true);
          break;
        case "arrowup":
        case "w":
          setControl("gas", true);
          break;
        case "arrowdown":
        case "s":
          setControl("brake", true);
          break;
        case " ":
        case "shift":
          setControl("nitro", true);
          break;
        case "escape":
          if (currentRace && !raceFinished) pauseRace();
          break;
      }
    }, { passive: false });

    window.addEventListener("keyup", (event) => {
      switch (event.key.toLowerCase()) {
        case "arrowleft":
        case "a":
          setControl("left", false);
          break;
        case "arrowright":
        case "d":
          setControl("right", false);
          break;
        case "arrowup":
        case "w":
          setControl("gas", false);
          break;
        case "arrowdown":
        case "s":
          setControl("brake", false);
          break;
        case " ":
        case "shift":
          setControl("nitro", false);
          break;
      }
    });

    // Gyroscope facultatif.
    window.addEventListener("deviceorientation", (event) => {
      if (!state.settings.tilt || currentScreen !== "raceScreen") return;

      if (typeof event.gamma === "number") {
        const tiltValue = clamp(event.gamma / 24, -1, 1);
        if (!inputLeft && !inputRight) {
          steering = tiltValue;
        }
      }
    }, { passive: true });

    // Zoom gestuel à deux doigts sans bloquer le zoom général du navigateur.
    bindPinchZoom();
  }

  function bindPinchZoom() {
    const surface = $("canvasWrap") || $("raceCanvas");
    if (!surface) return;

    let initialDistance = 0;
    let initialZoom = 1;

    surface.addEventListener("touchstart", (event) => {
      if (event.touches.length === 2) {
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;

        initialDistance = Math.hypot(dx, dy);
        initialZoom = cameraZoom;
      }
    }, { passive: true });

    surface.addEventListener("touchmove", (event) => {
      if (event.touches.length !== 2 || !initialDistance) return;

      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const distance = Math.hypot(dx, dy);

      cameraZoom = clamp(
        initialZoom * (distance / initialDistance),
        0.75,
        1.65
      );
    }, { passive: true });

    surface.addEventListener("touchend", () => {
      initialDistance = 0;
    }, { passive: true });
  }

  /* ------------------------ BOUCLE DE JEU ----------------------- */

  function updateHUD() {
    if (!currentRace) return;

    const position = getPlayerPosition();
    safeText("positionDisplay", `${position}/5`);
    safeText("timeDisplay", formatTime(raceClock));
    safeText(
      "lapDisplay",
      `${Math.min(currentRace.totalLaps, Math.floor(raceProgress))}/${currentRace.totalLaps}`
    );

    safeText("speedDisplay", `${Math.round(currentSpeed)} km/h`);
    safeText("nitroDisplay", `${Math.round(nitroEnergy)}%`);

    if ($("nitroProgress")) {
      $("nitroProgress").style.width = `${nitroEnergy}%`;
    }

    if ($("nitroBar")) {
      $("nitroBar").style.width = `${nitroEnergy}%`;
    }
  }

  function updateRace(delta) {
    if (!currentRace || raceFinished || paused) return;

    if (!currentRace.started) {
      countdownAccumulator += delta;

      if (countdownAccumulator >= 1) {
        countdownAccumulator = 0;
        countdown--;

        if (countdown <= 0) {
          currentRace.started = true;
          safeText("countdownDisplay", "GO !");
          setTimeout(() => safeShow("countdownDisplay", false), 650);
        } else {
          safeText("countdownDisplay", countdown);
        }
      }

      return;
    }

    raceClock += delta;

    const bike = currentBike();
    const maxSpeed = bike.speed * currentRace.mission.difficulty.speed;

    steering = (inputRight ? 1 : 0) - (inputLeft ? 1 : 0);

    if (state.settings.tilt && !inputLeft && !inputRight) {
      steering = clamp(steering, -1, 1);
    }

    if (inputGas) {
      throttle = Math.min(1, throttle + delta * bike.acceleration * 0.007);
    } else {
      throttle = Math.max(0, throttle - delta * 0.45);
    }

    if (inputBrake) {
      currentSpeed = Math.max(0, currentSpeed - bike.braking * delta * 0.22);
    } else {
      const acceleration = inputGas
        ? bike.acceleration * delta * 0.35
        : -delta * 4.5;

      currentSpeed = clamp(currentSpeed + acceleration, 0, maxSpeed);
    }

    if (inputNitro && nitroEnergy > 0 && currentSpeed > 10) {
      currentSpeed = Math.min(maxSpeed * 1.2, currentSpeed + delta * 25);
      nitroEnergy = Math.max(0, nitroEnergy - delta * 23);
    } else {
      nitroEnergy = Math.min(100, nitroEnergy + delta * 5.5);
    }

    playerLane = clamp(
      playerLane + steering * delta * (2.8 + bike.handling * 0.025),
      -3.45,
      3.45
    );

    if (Math.abs(playerLane) > 3.15) {
      currentSpeed = Math.max(0, currentSpeed - delta * 10);
    }

    const progressRate = currentSpeed / Math.max(90, maxSpeed);
    raceProgress += delta * progressRate * 0.16;

    currentRace.ai.forEach((ai) => {
      ai.progress += delta * (ai.targetSpeed / Math.max(90, maxSpeed)) * 0.16;
    });

    // Une course se termine uniquement quand le joueur atteint la distance cible.
    if (raceProgress >= currentRace.totalLaps) {
      finishRace();
    } else if (raceClock >= 300) {
      finishRace();
    }

    updateHUD();
  }

  function gameLoop(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;

    const delta = clamp((timestamp - lastFrameTime) / 1000, 0, 0.05);
    lastFrameTime = timestamp;

    try {
      updateRace(delta);
      animateThree(delta);
    } catch (error) {
      console.error("[FOBAS] Erreur dans la boucle de jeu :", error);
    }

    animationFrame = requestAnimationFrame(gameLoop);
  }

  /* ---------------------------- INIT ---------------------------- */

  async function init() {
    safeText("gameVersion", VERSION);

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

    try {
      await initThree();
      toast("FOBAS Moto Racing 3D est prêt.");
    } catch (error) {
      console.error("[FOBAS] Initialisation 3D impossible :", error);

      toast(
        "Le moteur 3D n'a pas pu démarrer. Vérifiez votre connexion et l'accès WebGL.",
        5000
      );

      const canvas = $("raceCanvas");

      if (canvas) {
        const context = canvas.getContext("2d");

        if (context) {
          context.fillStyle = "#10241d";
          context.fillRect(0, 0, canvas.width || 640, canvas.height || 360);
          context.fillStyle = "#ffffff";
          context.font = "bold 18px sans-serif";
          context.fillText("FOBAS MOTO RACING 3D", 24, 44);
          context.font = "14px sans-serif";
          context.fillText("Le moteur 3D est indisponible.", 24, 76);
          context.fillText("Vérifiez la connexion et WebGL.", 24, 100);
        }
      }
    }

    // Sauvegarde périodique.
    window.addEventListener("beforeunload", () => {
      try {
        if (db) {
          const transaction = db.transaction(STORE_NAME, "readwrite");
          transaction.objectStore(STORE_NAME).put({
            key: SAVE_KEY,
            data: state
          });
        } else {
          writeFallbackSave(state);
        }
      } catch (error) {
        console.warn("[FOBAS] Sauvegarde de fermeture :", error);
      }

      if (animationFrame) cancelAnimationFrame(animationFrame);
    });

    setInterval(() => {
      if (state && !raceFinished) {
        saveProgress(false);
      }
    }, 30000);

    lastFrameTime = performance.now();
    animationFrame = requestAnimationFrame(gameLoop);
  }

  /* ------------------------- DÉMARRAGE -------------------------- */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      init().catch((error) => {
        console.error("[FOBAS] Erreur de démarrage :", error);
        toast("Une erreur empêche le démarrage. Consultez la console.");
      });
    }, { once: true });
  } else {
    init().catch((error) => {
      console.error("[FOBAS] Erreur de démarrage :", error);
      toast("Une erreur empêche le démarrage. Consultez la console.");
    });
  }

})();
