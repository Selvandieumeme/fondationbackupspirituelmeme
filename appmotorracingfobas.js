
/* ================================================================
   FOBAS MOTO RACING 3D — COMPLETE RACING ENGINE
   Fichier : appmotorracingfobas.js
   Version : 4.0.0
   Three.js + IndexedDB + Android Touch + Career + Garage
   ================================================================ */

(() => {
  "use strict";

  if (window.FOBASMotoRacing) return;

  const VERSION = "4.0.0";
  const SAVE_KEY = "fobasMotoRacingSaveV4";
  const DB_NAME = "FOBAS_MOTO_RACING_DB";
  const DB_STORE = "progress";
  const TOTAL_MISSIONS = 35;
  const TOTAL_BIKES = 20;
  const MAX_RIDERS = 5;
  const THREE_URL =
    "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  const byId = id => document.getElementById(id);

  const clamp = (n, min, max) =>
    Math.max(min, Math.min(max, n));

  const random = (min, max) =>
    min + Math.random() * (max - min);

  const safeText = value =>
    String(value ?? "").replace(/[<>]/g, "");

  const MISSION_NAMES = [
    "Première accélération",
    "Défi de Port-de-Paix",
    "Virage de précision",
    "Route des champions",
    "Sprint de montagne",
    "Pilote confirmé",
    "Course du Nord-Ouest",
    "Vitesse maximale",
    "Défi professionnel",
    "Champion des routes",
    "Sprint avancé",
    "Maître des virages",
    "Course de Gonaïves",
    "Défi des experts",
    "Pilote élite",
    "Rivalité intense",
    "Route de la victoire",
    "Grand sprint",
    "Champion confirmé",
    "Course de précision",
    "Défi du tonnerre",
    "Maître de la piste",
    "Course internationale",
    "Pilote légendaire",
    "Champion de vitesse",
    "Défi ultime",
    "Course professionnelle",
    "Maître du championnat",
    "Sprint extrême",
    "Rival des champions",
    "Route de l'excellence",
    "Course des légendes",
    "Champion suprême",
    "Dernière ligne droite",
    "Défi MEME Selvandieu"
  ];

  const BIKE_DATA = Array.from({ length: TOTAL_BIKES }, (_, i) => ({
    id: i,
    name: [
      "Street 125", "Racing 150", "Sport 200", "Roadster 250",
      "Falcon 300", "Thunder 350", "Raptor 400", "Ninja 450",
      "Phantom 500", "Viper 600", "Hurricane 650", "Storm 700",
      "Predator 750", "Titan 800", "Superbike 850", "Velocity 900",
      "Legend 1000", "HyperSport 1100", "Ultimate 1200", "FOBAS X1"
    ][i],
    speed: 100 + i * 9,
    acceleration: 8 + i * 0.45,
    price: i === 0 ? 0 : 350 + i * 275,
    color: [
      "#e53935", "#1976d2", "#fbc02d", "#eeeeee",
      "#43a047", "#ff6d00", "#8e24aa", "#00acc1",
      "#3949ab", "#f4511e", "#00897b", "#d81b60",
      "#546e7a", "#7cb342", "#5e35b1", "#039be5",
      "#c0ca33", "#fb8c00", "#e53935", "#ffffff"
    ][i]
  }));

  const defaultProfile = () => ({
    name: "MEME Selvandieu",
    country: "Haïti",
    credits: 1500,
    xp: 0,
    level: 1,
    races: 0,
    wins: 0,
    bestPosition: 5,
    selectedBike: 0,
    ownedBikes: [0],
    completedMissions: [],
    unlockedMissions: [1],
    paint: {},
    championshipWins: 0,
    sound: true
  });

  let profile = defaultProfile();
  let db = null;
  let three = null;
  let scene = null;
  let camera = null;
  let renderer = null;
  let road = null;
  let playerBike3D = null;
  let aiModels = [];
  let animationId = 0;
  let previousFrame = 0;
  let saveTimer = 0;
  let raceFinishLock = false;
  let pointerControlsBound = false;
  let selectedMissionId = 1;
  let currentMode = "career";
  let championshipRound = 0;

  const input = {
    gas: false,
    brake: false,
    left: false,
    right: false,
    nitro: false
  };

  const game = {
    screen: "homeScreen",
    running: false,
    paused: false,
    countdown: 0,
    elapsed: 0,
    speed: 0,
    distance: 0,
    totalDistance: 1400,
    lap: 1,
    laps: 1,
    position: 1,
    lane: 0,
    nitro: 100,
    missionId: 1,
    masterChallenge: false,
    riders: [],
    result: null,
    lastTimestamp: 0
  };

  /* ================================================================
     MESSAGES
  ================================================================ */

  function notify(message, type = "info") {
    let box = byId("motoToast");

    if (!box) {
      box = document.createElement("div");
      box.id = "motoToast";
      Object.assign(box.style, {
        position: "fixed",
        zIndex: "99999",
        left: "50%",
        bottom: "24px",
        transform: "translateX(-50%)",
        maxWidth: "90vw",
        padding: "12px 18px",
        borderRadius: "12px",
        background: "#102b22",
        color: "#fff",
        border: "1px solid #35d49a",
        boxShadow: "0 8px 30px #0007",
        font: "600 14px system-ui",
        textAlign: "center"
      });
      document.body.appendChild(box);
    }

    box.textContent = message;
    box.dataset.type = type;
    box.style.display = "block";

    clearTimeout(box._timer);
    box._timer = setTimeout(() => {
      box.style.display = "none";
    }, 2800);
  }

  /* ================================================================
     SAVE SYSTEM — INDEXEDDB + LOCALSTORAGE FALLBACK
  ================================================================ */

  function openDatabase() {
    return new Promise(resolve => {
      if (!("indexedDB" in window)) {
        resolve(null);
        return;
      }

      let request;

      try {
        request = indexedDB.open(DB_NAME, 1);
      } catch {
        resolve(null);
        return;
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

  function dbRead() {
    return new Promise(resolve => {
      if (!db) {
        resolve(null);
        return;
      }

      try {
        const transaction = db.transaction(DB_STORE, "readonly");
        const request = transaction.objectStore(DB_STORE).get("profile");

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  function dbWrite(data) {
    return new Promise(resolve => {
      if (!db) {
        resolve(false);
        return;
      }

      try {
        const transaction = db.transaction(DB_STORE, "readwrite");
        transaction.objectStore(DB_STORE).put(data, "profile");
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => resolve(false);
        transaction.onabort = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async function saveProgress(showMessage = false) {
    const snapshot = JSON.parse(JSON.stringify(profile));
    let saved = false;

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
      saved = true;
    } catch (error) {
      console.warn("[FOBAS] LocalStorage indisponible.", error);
    }

    if (db) {
      saved = (await dbWrite(snapshot)) || saved;
    }

    if (showMessage) {
      notify(
        saved ? "Progression sauvegardée." : "Sauvegarde indisponible.",
        saved ? "success" : "error"
      );
    }

    return saved;
  }

  async function loadProgress() {
    let data = null;

    try {
      data = await dbRead();
    } catch {}

    if (!data) {
      try {
        data = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      } catch {}
    }

    if (data && typeof data === "object") {
      profile = {
        ...defaultProfile(),
        ...data,
        ownedBikes: Array.isArray(data.ownedBikes)
          ? [...new Set([0, ...data.ownedBikes])]
          : [0],
        completedMissions: Array.isArray(data.completedMissions)
          ? data.completedMissions
          : [],
        unlockedMissions: Array.isArray(data.unlockedMissions)
          ? data.unlockedMissions
          : [1],
        paint: data.paint && typeof data.paint === "object"
          ? data.paint
          : {}
      };
    }

    profile.selectedBike = clamp(
      Number(profile.selectedBike) || 0,
      0,
      TOTAL_BIKES - 1
    );

    if (!profile.ownedBikes.includes(profile.selectedBike)) {
      profile.selectedBike = 0;
    }

    updateAllUI();
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveProgress(false), 350);
  }

  /* ================================================================
     SCREEN NAVIGATION
  ================================================================ */

  function getScreens() {
    const app = byId("motoApp") || document;
    return $$("#motoApp [id$='Screen'], [id$='Screen']", app)
      .filter((element, index, list) => list.indexOf(element) === index);
  }

  function navigate(screenId) {
    const target = byId(screenId);

    if (!target) {
      notify("Écran introuvable : " + screenId, "error");
      return false;
    }

    getScreens().forEach(screen => {
      screen.hidden = screen !== target;
      screen.classList.toggle("active", screen === target);
      screen.setAttribute("aria-hidden", screen === target ? "false" : "true");
    });

    game.screen = screenId;

    if (screenId === "garageScreen") renderGarage();
    if (screenId === "careerScreen") renderMissions();
    if (screenId === "championshipScreen") renderChampionship();
    if (screenId === "homeScreen") updateHomeUI();

    return true;
  }

  /* ================================================================
     OPTIONAL UI HELPERS
  ================================================================ */

  function setText(id, value) {
    const element = byId(id);
    if (element) element.textContent = String(value);
  }

  function updateHomeUI() {
    setText("playerName", profile.name);
    setText("profileName", profile.name);
    setText("creditBalance", profile.credits);
    setText("creditsValue", profile.credits);
    setText("playerLevel", profile.level);
    setText("playerXP", profile.xp);
    setText("raceCount", profile.races);
    setText("winCount", profile.wins);
    setText("selectedBikeName", BIKE_DATA[profile.selectedBike].name);
    setText("missionProgress",
      `${profile.completedMissions.length}/${TOTAL_MISSIONS}`);
  }

  function updateAllUI() {
    updateHomeUI();
    updatePositionUI();
    renderMissions();
    renderGarage();
    renderChampionship();
  }

  function updatePositionUI() {
    setText("racePosition", `${game.position}/${MAX_RIDERS}`);
    setText("positionValue", `${game.position}/${MAX_RIDERS}`);
    setText("raceSpeed", Math.round(game.speed));
    setText("speedValue", Math.round(game.speed));
    setText("raceDistance", Math.floor(game.distance));
    setText("nitroValue", Math.round(game.nitro) + "%");
    setText("raceLap", `${game.lap}/${game.laps}`);

    const bar = byId("nitroBar");
    if (bar) bar.style.width = `${game.nitro}%`;

    const progress = byId("raceProgress");
    if (progress) {
      progress.style.width =
        `${clamp(game.distance / game.totalDistance * 100, 0, 100)}%`;
    }
  }

  /* ================================================================
     MISSIONS — EVENT DELEGATION SO RE-RENDER DOES NOT BREAK CLICKS
  ================================================================ */

  function renderMissions() {
    const list = byId("raceList") ||
      byId("missionList") ||
      byId("missionsList");

    if (!list) return;

    list.innerHTML = "";

    for (let id = 1; id <= TOTAL_MISSIONS; id++) {
      const unlocked = profile.unlockedMissions.includes(id) ||
        profile.completedMissions.includes(id);

      const completed = profile.completedMissions.includes(id);
      const bike = BIKE_DATA[profile.selectedBike];

      const button = document.createElement("button");
      button.type = "button";
      button.dataset.missionId = String(id);
      button.disabled = !unlocked;
      button.className =
        "mission-card" +
        (completed ? " completed" : "") +
        (id === selectedMissionId ? " selected" : "");

      Object.assign(button.style, {
        display: "block",
        width: "100%",
        margin: "8px 0",
        padding: "13px",
        borderRadius: "12px",
        border: "1px solid " + (completed ? "#2ecc71" : "#526c61"),
        background: !unlocked ? "#26342e" : "#102b22",
        color: "#fff",
        textAlign: "left",
        opacity: unlocked ? "1" : ".58",
        cursor: unlocked ? "pointer" : "not-allowed"
      });

      button.innerHTML =
        `<strong>${completed ? "✓ " : ""}${id}. ${safeText(MISSION_NAMES[id - 1])}</strong>` +
        `<div style="font-size:12px;margin-top:5px">` +
        `${unlocked ? "Débloquée" : "Verrouillée"} · ${bike.name}` +
        `</div>`;

      list.appendChild(button);
    }
  }

  function bindMissionList() {
    document.addEventListener("click", event => {
      const button = event.target.closest("[data-mission-id]");
      if (!button) return;

      const id = Number(button.dataset.missionId);
      if (!Number.isInteger(id) || id < 1 || id > TOTAL_MISSIONS) return;

      const unlocked = profile.unlockedMissions.includes(id) ||
        profile.completedMissions.includes(id);

      if (!unlocked) {
        notify("Termine la mission précédente pour débloquer celle-ci.");
        return;
      }

      selectedMissionId = id;
      renderMissions();
      startRace(id, "career");
    });
  }

  /* ================================================================
     GARAGE — 20 MOTORCYCLES
  ================================================================ */

  function renderGarage() {
    const container = byId("garageList") ||
      byId("bikeShop") ||
      byId("garageGrid");

    if (!container) return;

    container.innerHTML = "";

    BIKE_DATA.forEach(bike => {
      const owned = profile.ownedBikes.includes(bike.id);
      const selected = profile.selectedBike === bike.id;

      const card = document.createElement("article");
      card.className = "bike-card";

      Object.assign(card.style, {
        display: "inline-block",
        verticalAlign: "top",
        width: "min(100%, 240px)",
        margin: "8px",
        padding: "14px",
        boxSizing: "border-box",
        background: "#102b22",
        color: "#fff",
        border: selected ? "2px solid #2ecc71" : "1px solid #496458",
        borderRadius: "16px"
      });

      card.innerHTML = `
        <div style="
          height:70px;border-radius:10px;margin-bottom:10px;
          background:linear-gradient(135deg,${bike.color},#15231d);
          display:grid;place-items:center;font-size:32px">
          🏍️
        </div>
        <strong>${safeText(bike.name)}</strong>
        <p>Vitesse max. : ${bike.speed} km/h</p>
        <p>Accélération : ${bike.acceleration.toFixed(1)}</p>
        <p>Prix : ${bike.price} crédits</p>
        <button type="button" data-bike-action="${owned ? "select" : "buy"}"
          data-bike-id="${bike.id}"
          style="width:100%;padding:11px;border:0;border-radius:9px;
          background:${selected ? "#238b57" : "#e2b341"};color:#111;font-weight:700">
          ${selected ? "Moto sélectionnée" : owned ? "Choisir cette moto" : "Acheter"}
        </button>
      `;

      container.appendChild(card);
    });

    setText("garageCredits", profile.credits);
  }

  function handleBikeAction(action, bikeId) {
    const bike = BIKE_DATA[bikeId];
    if (!bike) return;

    if (action === "buy") {
      if (profile.ownedBikes.includes(bikeId)) {
        notify("Tu possèdes déjà cette moto.");
        return;
      }

      if (profile.credits < bike.price) {
        notify("Crédits insuffisants pour acheter cette moto.", "error");
        return;
      }

      profile.credits -= bike.price;
      profile.ownedBikes.push(bikeId);
      profile.selectedBike = bikeId;
      notify("Moto achetée et sélectionnée : " + bike.name, "success");
    } else {
      if (!profile.ownedBikes.includes(bikeId)) {
        notify("Tu dois acheter cette moto avant de la choisir.");
        return;
      }

      profile.selectedBike = bikeId;
      notify("Moto sélectionnée : " + bike.name, "success");
    }

    scheduleSave();
    renderGarage();
    updateHomeUI();
    rebuildPlayerBike();
  }

  /* ================================================================
     CHAMPIONSHIP
  ================================================================ */

  function renderChampionship() {
    const panel = byId("championshipList") ||
      byId("championshipContent");

    if (panel) {
      panel.innerHTML = `
        <h3>Championnat FOBAS</h3>
        <p>Manches gagnées : ${profile.championshipWins}</p>
        <p>Manche actuelle : ${championshipRound + 1}/5</p>
        <p>Termine les courses pour gagner des points et des crédits.</p>
        <button type="button" id="startChampionshipRound"
          style="padding:12px 18px;border:0;border-radius:10px;
          background:#2ecc71;font-weight:700">
          ${championshipRound >= 5 ? "Recommencer le championnat" : "Lancer la manche"}
        </button>
      `;
    }

    setText("championshipWins", profile.championshipWins);
  }

  function startChampionship() {
    if (championshipRound >= 5) championshipRound = 0;
    currentMode = "championship";
    const missionId = Math.min(TOTAL_MISSIONS, championshipRound + 1);
    startRace(missionId, "championship");
  }

  /* ================================================================
     RACE ENGINE
  ================================================================ */

  function currentBike() {
    return BIKE_DATA[profile.selectedBike] || BIKE_DATA[0];
  }

  function startRace(missionId = 1, mode = "career") {
    const id = clamp(Number(missionId) || 1, 1, TOTAL_MISSIONS);

    if (
      !profile.unlockedMissions.includes(id) &&
      !profile.completedMissions.includes(id) &&
      mode !== "master"
    ) {
      notify("Cette mission est encore verrouillée.");
      return false;
    }

    currentMode = mode;
    selectedMissionId = id;
    raceFinishLock = false;

    game.running = true;
    game.paused = false;
    game.countdown = 2.5;
    game.elapsed = 0;
    game.speed = 0;
    game.distance = 0;
    game.totalDistance = mode === "master" ? 2200 : 1200 + id * 35;
    game.lap = 1;
    game.laps = id >= 20 ? 3 : id >= 8 ? 2 : 1;
    game.totalDistance *= game.laps;
    game.position = 1;
    game.lane = 0;
    game.nitro = 100;
    game.missionId = id;
    game.masterChallenge = mode === "master";
    game.result = null;

    game.riders = Array.from({ length: MAX_RIDERS - 1 }, (_, index) => {
      const master = mode === "master" && index === 0;

      return {
        id: index,
        name: master ? "MEME Selvandieu" :
          ["Alex", "Junior", "Kevin"][index],
        distance: 0,
        speed: master
          ? Math.max(100, currentBike().speed * 0.82)
          : 75 + index * 8 + Math.min(30, id * 0.8),
        lane: [-0.5, 0.5, 1][index],
        color: ["#ffb300", "#e53935", "#42a5f5"][index],
        finished: false
      };
    });

    resetRaceWorld();
    createAIRiders();
    navigate("raceScreen");
    updatePositionUI();

    notify("Prépare-toi ! Le départ est dans quelques secondes.");
    return true;
  }

  function getPlayerPosition() {
    let position = 1;

    for (const rider of game.riders) {
      if (rider.distance > game.distance) position++;
    }

    return clamp(position, 1, game.riders.length + 1);
  }

  function updateRace(delta) {
    if (!game.running || game.paused) return;

    if (game.countdown > 0) {
      game.countdown -= delta;
      game.speed = 0;
      setText("raceStatus", "DÉPART DANS " + Math.ceil(game.countdown));
      if (game.countdown <= 0) {
        game.countdown = 0;
        setText("raceStatus", "GO !");
      }
      return;
    }

    game.elapsed += delta;

    const bike = currentBike();
    const maxSpeed = bike.speed * (input.nitro && game.nitro > 0 ? 1.22 : 1);
    const acceleration = bike.acceleration * 2.2;

    /* Une vitesse de croisière évite que le joueur reste bloqué
       si le bouton tactile se relâche accidentellement. */
    const cruiseSpeed = 42;
    const targetSpeed = input.brake
      ? 12
      : input.gas
        ? maxSpeed
        : cruiseSpeed;

    const rate = input.gas ? acceleration : 12;
    game.speed += (targetSpeed - game.speed) * Math.min(1, delta * rate);
    game.speed = clamp(game.speed, 0, maxSpeed);

    if (input.nitro && game.nitro > 0 && !input.brake) {
      game.nitro = Math.max(0, game.nitro - 28 * delta);
    } else {
      game.nitro = Math.min(100, game.nitro + 5 * delta);
    }

    if (input.left) game.lane = Math.max(-1.4, game.lane - 1.8 * delta);
    if (input.right) game.lane = Math.min(1.4, game.lane + 1.8 * delta);

    game.distance += game.speed / 3.6 * delta;

    for (const rider of game.riders) {
      const catchUp = rider.speed * (rider.distance < game.distance ? 1.015 : 0.985);
      rider.distance += catchUp / 3.6 * delta;
      rider.distance = Math.min(rider.distance, game.totalDistance);
    }

    game.position = getPlayerPosition();
    game.lap = Math.min(
      game.laps,
      Math.floor(game.distance / (game.totalDistance / game.laps)) + 1
    );

    updatePositionUI();
    updateThreeScene(delta);

    if (game.distance >= game.totalDistance) {
      finishRace();
    }
  }

  function finishRace() {
    if (raceFinishLock) return;
    raceFinishLock = true;
    game.running = false;
    game.paused = false;
    game.distance = game.totalDistance;
    game.speed = 0;
    game.position = getPlayerPosition();

    const position = game.position;
    const won = position === 1;
    const reward = Math.max(100, 600 - (position - 1) * 100);
    const xpGain = Math.max(40, 160 - (position - 1) * 20);
    const id = game.missionId;

    profile.races += 1;
    profile.credits += reward;
    profile.xp += xpGain;
    profile.level = Math.max(1, Math.floor(profile.xp / 500) + 1);
    profile.bestPosition = Math.min(profile.bestPosition || 5, position);

    if (won) profile.wins += 1;

    /* La mission est marquée terminée dès que la course est finie.
       La victoire reste distincte du simple fait de terminer. */
    if (!profile.completedMissions.includes(id)) {
      profile.completedMissions.push(id);
    }

    const next = Math.min(TOTAL_MISSIONS, id + 1);
    if (!profile.unlockedMissions.includes(next)) {
      profile.unlockedMissions.push(next);
    }

    if (currentMode === "championship") {
      if (won) profile.championshipWins += 1;
      championshipRound = (championshipRound + 1) % 5;
    }

    saveProgress(false);
    updateAllUI();
    showRaceResult(position, reward, xpGain, won);
  }

  function showRaceResult(position, reward, xpGain, won) {
    let overlay = byId("raceResultOverlay");

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "raceResultOverlay";

      Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        zIndex: "99990",
        background: "rgba(0,0,0,.82)",
        display: "grid",
        placeItems: "center",
        padding: "18px",
        color: "#fff",
        fontFamily: "system-ui"
      });

      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div style="width:min(100%,420px);padding:24px;border-radius:20px;
        background:#102b22;border:1px solid #36d399;text-align:center">
        <div style="font-size:42px">${won ? "🏆" : "🏁"}</div>
        <h2>${won ? "VICTOIRE !" : "COURSE TERMINÉE"}</h2>
        <p>Position : <strong>${position}/${MAX_RIDERS}</strong></p>
        <p>Mission : ${safeText(MISSION_NAMES[game.missionId - 1])}</p>
        <p>Récompense : +${reward} crédits</p>
        <p>Expérience : +${xpGain} XP</p>
        <button type="button" id="resultContinue"
          style="padding:12px 20px;margin:6px;border:0;border-radius:10px;
          background:#2ecc71;font-weight:700">Continuer</button>
        <button type="button" id="resultReplay"
          style="padding:12px 20px;margin:6px;border:0;border-radius:10px;
          background:#e2b341;font-weight:700">Rejouer</button>
      </div>
    `;

    overlay.style.display = "grid";
    game.result = { position, reward, xpGain, won };

    setText("raceStatus", won ? "VICTOIRE" : "COURSE TERMINÉE");
  }

  function hideRaceResult() {
    const overlay = byId("raceResultOverlay");
    if (overlay) overlay.style.display = "none";
  }

  function pauseRace() {
    if (!game.running) return;
    game.paused = true;
    releaseControls();
    setText("raceStatus", "PAUSE");
    notify("Course en pause.");
  }

  function resumeRace() {
    if (!game.running) return;
    game.paused = false;
    setText("raceStatus", "COURSE EN COURS");
  }

  function restartRace() {
    hideRaceResult();
    startRace(game.missionId, currentMode);
  }

  function quitRace() {
    game.running = false;
    game.paused = false;
    releaseControls();
    hideRaceResult();
    navigate(currentMode === "championship" ? "championshipScreen" : "careerScreen");
  }

  function challengeMaster() {
    if (profile.level < 10 && profile.completedMissions.length < 9) {
      notify("Débloque le niveau 10 ou termine 9 missions avant ce défi.");
      return;
    }

    startRace(TOTAL_MISSIONS, "master");
  }

  /* ================================================================
     THREE.JS — 3D ROAD, BIKES AND RIVALS
  ================================================================ */

  async function initThree() {
    const host = byId("raceCanvas") ||
      byId("threeCanvas") ||
      byId("gameCanvas") ||
      byId("raceScene");

    if (!host) {
      console.warn("[FOBAS] Aucun conteneur 3D trouvé.");
      return;
    }

    try {
      three = await import(THREE_URL);

      scene = new three.Scene();
      scene.background = new three.Color("#83bde8");
      scene.fog = new three.Fog("#83bde8", 45, 260);

      camera = new three.PerspectiveCamera(
        62,
        Math.max(1, host.clientWidth) /
          Math.max(1, host.clientHeight),
        0.1,
        500
      );

      camera.position.set(0, 6, 12);
      camera.lookAt(0, 1, -12);

      renderer = new three.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(
        Math.max(1, host.clientWidth),
        Math.max(1, host.clientHeight)
      );

      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = three.PCFSoftShadowMap;
      renderer.outputColorSpace = three.SRGBColorSpace;

      if (host.tagName.toLowerCase() === "canvas") {
        host.replaceWith(renderer.domElement);
        renderer.domElement.id = "raceCanvas";
      } else {
        host.innerHTML = "";
        host.appendChild(renderer.domElement);
      }

      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.touchAction = "pan-y";

      const hemi = new three.HemisphereLight(0xffffff, 0x35533c, 2.1);
      scene.add(hemi);

      const sun = new three.DirectionalLight(0xffffff, 2.6);
      sun.position.set(-12, 25, 8);
      sun.castShadow = true;
      scene.add(sun);

      const ground = new three.Mesh(
        new three.PlaneGeometry(600, 600),
        new three.MeshStandardMaterial({ color: "#4d9b48", roughness: 1 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.12;
      ground.position.z = -180;
      ground.receiveShadow = true;
      scene.add(ground);

      road = new three.Group();
      scene.add(road);

      const asphalt = new three.Mesh(
        new three.BoxGeometry(12, 0.16, 320),
        new three.MeshStandardMaterial({ color: "#343a40", roughness: 0.92 })
      );
      asphalt.position.set(0, 0, -145);
      asphalt.receiveShadow = true;
      road.add(asphalt);

      for (const x of [-6.2, 6.2]) {
        const rail = new three.Mesh(
          new three.BoxGeometry(0.3, 0.24, 320),
          new three.MeshStandardMaterial({ color: "#f2f2f2" })
        );
        rail.position.set(x, 0.13, -145);
        road.add(rail);
      }

      for (const x of [-2, 2]) {
        for (let z = 12; z > -300; z -= 12) {
          const line = new three.Mesh(
            new three.BoxGeometry(0.12, 0.025, 5),
            new three.MeshStandardMaterial({ color: "#f5f5f5" })
          );
          line.position.set(x, 0.1, z);
          line.userData.roadMark = true;
          road.add(line);
        }
      }

      playerBike3D = makeMotorcycle(
        profile.paint[profile.selectedBike] ||
          currentBike().color
      );
      playerBike3D.position.set(0, 0.05, 4);
      scene.add(playerBike3D);

      createAIRiders();
      resizeThree();
      window.addEventListener("resize", resizeThree);

      console.info("[FOBAS] Moteur Three.js prêt.");
    } catch (error) {
      console.error("[FOBAS] Initialisation 3D impossible :", error);
      notify("Le moteur 3D n'a pas pu charger. Vérifie Internet et Three.js.", "error");
    }
  }

  function makeMotorcycle(color = "#e53935") {
    if (!three) return null;

    const group = new three.Group();

    const rubber = new three.MeshStandardMaterial({
      color: "#141414",
      roughness: 0.88
    });

    const bodyMaterial = new three.MeshStandardMaterial({
      color,
      metalness: 0.25,
      roughness: 0.35
    });

    const metal = new three.MeshStandardMaterial({
      color: "#c5cbd1",
      metalness: 0.78,
      roughness: 0.25
    });

    const dark = new three.MeshStandardMaterial({
      color: "#20252a",
      metalness: 0.35,
      roughness: 0.4
    });

    function addMesh(geometry, material, x, y, z, scale = null) {
      const mesh = new three.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    }

    function wheel(z) {
      const tire = addMesh(
        new three.TorusGeometry(0.42, 0.105, 12, 28),
        rubber,
        0,
        0.46,
        z
      );
      tire.rotation.y = Math.PI / 2;

      const hub = addMesh(
        new three.CylinderGeometry(0.23, 0.23, 0.14, 20),
        metal,
        0,
        0.46,
        z
      );
      hub.rotation.z = Math.PI / 2;

      const hub2 = addMesh(
        new three.CylinderGeometry(0.08, 0.08, 0.17, 12),
        dark,
        0,
        0.46,
        z
      );
      hub2.rotation.z = Math.PI / 2;
    }

    wheel(-0.93);
    wheel(0.93);

    addMesh(
      new three.BoxGeometry(0.43, 0.48, 1.15),
      bodyMaterial,
      0,
      0.88,
      0
    );

    addMesh(
      new three.SphereGeometry(0.34, 16, 12),
      bodyMaterial,
      0,
      1.12,
      -0.24,
      [1, 0.65, 1.15]
    );

    addMesh(
      new three.BoxGeometry(0.38, 0.16, 0.65),
      dark,
      0,
      1.2,
      0.38
    );

    addMesh(
      new three.CylinderGeometry(0.045, 0.045, 0.85, 10),
      metal,
      0,
      0.88,
      -0.53
    ).rotation.x = 0.32;

    addMesh(
      new three.BoxGeometry(0.82, 0.09, 0.12),
      metal,
      0,
      1.42,
      -0.38
    );

    addMesh(
      new three.SphereGeometry(0.12, 12, 10),
      new three.MeshStandardMaterial({
        color: "#fff7bf",
        emissive: "#fff0a0",
        emissiveIntensity: 0.8
      }),
      0,
      1.1,
      -0.61
    );

    addMesh(
      new three.BoxGeometry(0.32, 0.12, 0.14),
      dark,
      0,
      0.64,
      0.96
    );

    /* Pilote stylisé */
    addMesh(
      new three.SphereGeometry(0.25, 16, 12),
      new three.MeshStandardMaterial({ color: "#222831", roughness: 0.6 }),
      0,
      1.72,
      0.12
    );

    addMesh(
      new three.CapsuleGeometry(0.22, 0.52, 5, 10),
      dark,
      0,
      1.36,
      0.15,
      [1, 1, 0.8]
    );

    return group;
  }

  function rebuildPlayerBike() {
    if (!three || !scene) return;

    if (playerBike3D) scene.remove(playerBike3D);

    playerBike3D = makeMotorcycle(
      profile.paint[profile.selectedBike] || currentBike().color
    );

    if (playerBike3D) {
      playerBike3D.position.set(game.lane, 0.05, 4);
      scene.add(playerBike3D);
    }
  }

  function createAIRiders() {
    if (!three || !scene) return;

    aiModels.forEach(model => scene.remove(model));
    aiModels = [];

    game.riders.forEach((rider, index) => {
      const model = makeMotorcycle(rider.color);
      if (!model) return;

      model.scale.setScalar(0.88);
      model.position.set(rider.lane * 2, 0.05, -8 - index * 5);
      model.rotation.y = Math.PI;
      scene.add(model);
      aiModels.push(model);
    });
  }

  function resetRaceWorld() {
    if (playerBike3D) {
      playerBike3D.position.set(game.lane, 0.05, 4);
    }

    if (road) {
      road.position.z = 0;
    }
  }

  function updateThreeScene(delta) {
    if (!three || !renderer || !scene || !camera) return;

    if (playerBike3D) {
      playerBike3D.position.x +=
        (game.lane * 2 - playerBike3D.position.x) *
        Math.min(1, delta * 5);

      playerBike3D.rotation.z =
        (input.left ? 0.15 : 0) - (input.right ? 0.15 : 0);

      playerBike3D.rotation.x = input.brake ? -0.035 : 0;
    }

    if (road) {
      road.children.forEach(object => {
        if (!object.userData.roadMark) return;
        object.position.z += game.speed / 3.6 * delta * 1.5;
        if (object.position.z > 15) object.position.z -= 312;
      });
    }

    aiModels.forEach((model, index) => {
      const rider = game.riders[index];
      if (!rider) return;

      const gap = rider.distance - game.distance;
      model.position.z = clamp(4 - gap * 0.11, -60, 16);
      model.position.x +=
        (rider.lane * 2 - model.position.x) *
        Math.min(1, delta * 2);
    });

    camera.position.x +=
      (game.lane * 0.35 - camera.position.x) *
      Math.min(1, delta * 2);

    camera.lookAt(game.lane * 0.45, 1, -12);
    renderer.render(scene, camera);
  }

  function resizeThree() {
    if (!renderer || !camera) return;

    const host = renderer.domElement.parentElement;
    if (!host) return;

    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  /* ================================================================
     CONTROLS — POINTER, TOUCH AND KEYBOARD
  ================================================================ */

  function releaseControls() {
    Object.keys(input).forEach(key => input[key] = false);
  }

  function bindHoldButton(id, control) {
    const button = byId(id);
    if (!button || button.dataset.holdBound === "1") return;

    button.dataset.holdBound = "1";
    button.style.touchAction = "none";

    const press = event => {
      event.preventDefault();
      input[control] = true;
      button.classList.add("pressed");

      try {
        button.setPointerCapture(event.pointerId);
      } catch {}
    };

    const release = event => {
      if (event) event.preventDefault();
      input[control] = false;
      button.classList.remove("pressed");
    };

    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
    button.addEventListener("contextmenu", event => event.preventDefault());
  }

  function bindControls() {
    bindHoldButton("gasButton", "gas");
    bindHoldButton("accelerateButton", "gas");
    bindHoldButton("brakeButton", "brake");
    bindHoldButton("leftButton", "left");
    bindHoldButton("rightButton", "right");
    bindHoldButton("nitroButton", "nitro");

    document.addEventListener("pointerup", () => {
      /* Empêche un bouton de rester bloqué après une interruption. */
      for (const key of ["gas", "brake", "left", "right", "nitro"]) {
        const id = {
          gas: ["gasButton", "accelerateButton"],
          brake: ["brakeButton"],
          left: ["leftButton"],
          right: ["rightButton"],
          nitro: ["nitroButton"]
        }[key];

        const activeButton = id.some(buttonId => {
          const button = byId(buttonId);
          return button && button.matches(":active");
        });

        if (!activeButton) input[key] = false;
      }
    });

    window.addEventListener("blur", releaseControls);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) releaseControls();
    });

    document.addEventListener("keydown", event => {
      if (/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;

      switch (event.key.toLowerCase()) {
        case "arrowup":
        case "w":
          input.gas = true;
          break;
        case "arrowdown":
        case "s":
          input.brake = true;
          break;
        case "arrowleft":
        case "a":
          input.left = true;
          break;
        case "arrowright":
        case "d":
          input.right = true;
          break;
        case " ":
          input.nitro = true;
          event.preventDefault();
          break;
        case "escape":
          game.paused ? resumeRace() : pauseRace();
          break;
      }
    });

    document.addEventListener("keyup", event => {
      switch (event.key.toLowerCase()) {
        case "arrowup":
        case "w":
          input.gas = false;
          break;
        case "arrowdown":
        case "s":
          input.brake = false;
          break;
        case "arrowleft":
        case "a":
          input.left = false;
          break;
        case "arrowright":
        case "d":
          input.right = false;
          break;
        case " ":
          input.nitro = false;
          break;
      }
    });
  }

  /* ================================================================
     PAINT
  ================================================================ */

  function applyPaint(color) {
    if (!/^#[0-9a-f]{6}$/i.test(color)) {
      notify("Couleur non valide.", "error");
      return;
    }

    profile.paint[profile.selectedBike] = color;

    rebuildPlayerBike();
    scheduleSave();
    notify("Peinture appliquée à la moto.", "success");
  }

  /* ================================================================
     BUTTON ROUTING — DELEGATED EVENTS
  ================================================================ */

  function bindNavigation() {
    document.addEventListener("click", event => {
      const nav = event.target.closest("[data-nav]");
      if (nav) {
        const screen = nav.dataset.nav;
        if (screen) navigate(screen);
        return;
      }

      const go = event.target.closest("[data-go]");
      if (go) {
        const screen = go.dataset.go;
        if (screen) navigate(screen);
        return;
      }

      const bikeButton = event.target.closest("[data-bike-action]");
      if (bikeButton) {
        handleBikeAction(
          bikeButton.dataset.bikeAction,
          Number(bikeButton.dataset.bikeId)
        );
        return;
      }

      const actionButton = event.target.closest("button");
      if (!actionButton) return;

      const id = actionButton.id;

      switch (id) {
        case "homeButton":
        case "backHomeButton":
          navigate("homeScreen");
          break;

        case "careerButton":
        case "openCareerButton":
          navigate("careerScreen");
          break;

        case "openGarageButton":
        case "garageButton":
          navigate("garageScreen");
          break;

        case "championshipButton":
        case "openChampionshipButton":
          navigate("championshipScreen");
          break;

        case "profileButton":
          navigate("settingsScreen");
          break;

        case "startRaceButton":
        case "playButton":
          startRace(selectedMissionId, "career");
          break;

        case "masterChallengeButton":
        case "challengeMasterButton":
          challengeMaster();
          break;

        case "pauseButton":
          pauseRace();
          break;

        case "resumeButton":
          resumeRace();
          break;

        case "restartButton":
          restartRace();
          break;

        case "quitRaceButton":
          quitRace();
          break;

        case "continueButton":
          hideRaceResult();
          navigate("careerScreen");
          break;

        case "saveProgressButton":
          saveProgress(true);
          break;

        case "startChampionshipButton":
        case "startChampionshipRound":
          startChampionship();
          break;

        case "applyPaintButton": {
          const colorInput = byId("bikePaintColor") ||
            byId("paintColor") ||
            byId("paintPicker");

          if (colorInput) applyPaint(colorInput.value);
          else notify("Ajoute un sélecteur de couleur à l'écran garage.");
          break;
        }
      }
    });

    document.addEventListener("click", event => {
      const target = event.target;

      if (target.closest("#resultContinue")) {
        hideRaceResult();
        navigate(currentMode === "championship"
          ? "championshipScreen"
          : "careerScreen");
      }

      if (target.closest("#resultReplay")) {
        hideRaceResult();
        restartRace();
      }
    });
  }

  function bindSettings() {
    const nameInput = byId("playerNameInput") ||
      byId("profileNameInput");

    if (nameInput) {
      nameInput.addEventListener("change", () => {
        const name = nameInput.value.trim();
        if (name) profile.name = name.slice(0, 50);
        updateHomeUI();
        scheduleSave();
      });
    }

    const colorInput = byId("bikePaintColor") ||
      byId("paintColor") ||
      byId("paintPicker");

    if (colorInput) {
      colorInput.addEventListener("input", () => {
        if (/^#[0-9a-f]{6}$/i.test(colorInput.value)) {
          applyPaint(colorInput.value);
        }
      });
    }
  }

  /* ================================================================
     MAIN GAME LOOP
  ================================================================ */

  function gameLoop(timestamp) {
    animationId = requestAnimationFrame(gameLoop);

    const delta = previousFrame
      ? Math.min(0.05, (timestamp - previousFrame) / 1000)
      : 0;

    previousFrame = timestamp;

    updateRace(delta);

    if (renderer && scene && camera) {
      if (!game.running || game.paused) {
        renderer.render(scene, camera);
      }
    }
  }

  /* ================================================================
     PUBLIC API FOR HTML BUTTONS OR DEBUGGING
  ================================================================ */

  window.FOBASMotoRacing = {
    version: VERSION,
    get profile() {
      return JSON.parse(JSON.stringify(profile));
    },
    get race() {
      return {
        running: game.running,
        paused: game.paused,
        speed: game.speed,
        distance: game.distance,
        position: game.position,
        missionId: game.missionId
      };
    },
    startRace,
    challengeMaster,
    pauseRace,
    resumeRace,
    restartRace,
    quitRace,
    navigate,
    saveProgress,
    renderGarage,
    renderMissions,
    applyPaint,
    getPlayerPosition
  };

  /* ================================================================
     INITIALIZATION
  ================================================================ */

  async function init() {
    try {
      await openDatabase();
      await loadProgress();

      bindMissionList();
      bindControls();
      bindNavigation();
      bindSettings();

      await initThree();

      renderMissions();
      renderGarage();
      renderChampionship();
      updateAllUI();

      if (byId("loadingScreen")) {
        byId("loadingScreen").hidden = true;
      }

      requestAnimationFrame(gameLoop);

      console.info(
        `[FOBAS MOTO RACING 3D] Engine ${VERSION} initialisé.`
      );
    } catch (error) {
      console.error("[FOBAS] Erreur d'initialisation :", error);
      notify("Une erreur est survenue au démarrage du jeu.", "error");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

})();
















