```javascript
/* =========================================================
   FOBAS MISSION 3D — MEME & TEAM
   Native JavaScript + Canvas 2D pseudo-3D
   Pa gen Three.js, WebGL, CDN oswa bibliyotèk ekstèn.
   Sove done ak IndexedDB + localStorage kòm sovgad.
   Konpatib ak HTML FOBAS MISSION 3D.
========================================================= */

(() => {
  "use strict";

  /* -------------------- ZOUTI -------------------- */

  const $ = (id) => document.getElementById(id);

  const ui = {
    loading: $("loading-screen"),
    loadingProgress: $("loading-progress"),
    loadingStatus: $("loading-status"),
    enter: $("btn-enter"),
    menu: $("main-menu"),
    game: $("game-screen"),
    canvas: $("game-canvas"),
    world: $("game-world"),
    fallback: $("world-fallback"),

    play: $("btn-play"),
    missions: $("btn-missions"),
    characters: $("btn-characters"),
    settings: $("btn-settings"),
    continue: $("btn-continue"),

    missionMenu: $("mission-menu"),
    characterMenu: $("character-menu"),
    settingsMenu: $("settings-menu"),
    selectedCharacter: $("selected-character"),
    confirmCharacter: $("btn-confirm-character"),

    quality: $("graphics-quality"),
    sensitivity: $("camera-sensitivity"),
    volume: $("game-volume"),
    sound: $("sound-enabled"),
    saveSettings: $("btn-save-settings"),
    saveStatus: $("save-status"),

    hudCharacter: $("hud-character"),
    hudLevel: $("hud-level"),
    hudHealth: $("hud-health"),
    hudEnergy: $("hud-energy"),
    hudScore: $("hud-score"),
    hudMissionTitle: $("hud-mission-title"),
    hudObjective: $("hud-objective"),
    objectiveProgress: $("objective-progress"),
    objectiveCount: $("objective-count"),
    location: $("hud-location"),
    timer: $("hud-timer"),

    pause: $("btn-pause"),
    pauseMenu: $("pause-menu"),
    resume: $("btn-resume"),
    restart: $("btn-restart"),
    backMenu: $("btn-back-to-menu"),

    result: $("mission-result"),
    resultTitle: $("result-title"),
    resultDescription: $("result-description"),
    resultScore: $("result-score"),
    nextMission: $("btn-next-mission"),
    resultMenu: $("btn-result-menu"),

    joystickZone: $("joystick-zone"),
    joystickBase: $("joystick-base"),
    joystickKnob: $("joystick-knob"),
    jump: $("btn-jump"),
    run: $("btn-run"),
    action: $("btn-action"),
    camera: $("btn-camera"),

    notifications: $("game-notifications"),
    error: $("app-error"),
    errorMessage: $("app-error-message"),
    errorClose: $("btn-error-close")
  };

  const ctx = ui.canvas ? ui.canvas.getContext("2d", {
    alpha: false,
    desynchronized: true
  }) : null;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (min, max) => min + Math.random() * (max - min);
  const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

  /* -------------------- DONE JWÈT -------------------- */

  const CHARACTERS = {
    MEME:   { color: "#38e7e7", accent: "#ffffff", speed: 4.2 },
    FOBAS:  { color: "#ffad42", accent: "#fff0bd", speed: 3.8 },
    SHADOW: { color: "#a68bff", accent: "#e7ddff", speed: 4.8 },
    BLAZE:  { color: "#ff526c", accent: "#ffd1d8", speed: 5.2 },
    TITAN:  { color: "#70d58a", accent: "#e3ffe9", speed: 3.6 }
  };

  const MISSIONS = {
    1: {
      title: "Premye Kontak",
      description: "Kolekte kristal yo epi eksplore baz la.",
      target: 5,
      reward: 100
    },
    2: {
      title: "Meme & Team",
      description: "Kolekte 8 kristal pou ede ekip la.",
      target: 8,
      reward: 250
    },
    3: {
      title: "Defi Final",
      description: "Kolekte 12 kristal pou fini misyon final la.",
      target: 12,
      reward: 500
    }
  };

  const state = {
    ready: false,
    running: false,
    paused: false,
    finished: false,

    mission: 1,
    character: "MEME",
    selectedCharacter: "MEME",

    x: 0,
    z: 0,
    facing: 0,
    cameraAngle: 0,
    cameraZoom: 1,
    cameraTargetZoom: 1,

    health: 100,
    energy: 100,
    score: 0,
    collected: 0,
    elapsed: 0,

    jumping: false,
    jumpHeight: 0,
    jumpVelocity: 0,
    running: false,

    joyX: 0,
    joyY: 0,
    joyActive: false,
    joyPointer: null,

    keys: {},
    crystals: [],
    decorations: [],
    particles: [],

    settings: {
      quality: "medium",
      sensitivity: 5,
      volume: 70,
      sound: true
    },

    lastTime: 0,
    saveTimer: 0,
    notificationTimer: null,
    audioContext: null,
    audioReady: false
  };

  /* -------------------- INDEXEDDB -------------------- */

  const DB_NAME = "FOBAS_MISSION_3D_DB";
  const DB_VERSION = 1;
  const STORE_NAME = "gameData";
  let db = null;
  let dbAvailable = false;

  function openDatabase() {
    return new Promise((resolve) => {
      if (!("indexedDB" in window)) {
        resolve(false);
        return;
      }

      let request;

      try {
        request = indexedDB.open(DB_NAME, DB_VERSION);
      } catch (err) {
        resolve(false);
        return;
      }

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, {
            keyPath: "id"
          });
        }
      };

      request.onsuccess = () => {
        db = request.result;
        dbAvailable = true;

        db.onversionchange = () => {
          db.close();
          dbAvailable = false;
        };

        resolve(true);
      };

      request.onerror = () => resolve(false);
      request.onblocked = () => resolve(false);
    });
  }

  function databaseGet(id) {
    return new Promise((resolve) => {
      if (!dbAvailable || !db) {
        resolve(null);
        return;
      }

      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).get(id);

        request.onsuccess = () => {
          resolve(request.result ? request.result.value : null);
        };

        request.onerror = () => resolve(null);
      } catch (_) {
        resolve(null);
      }
    });
  }

  function databasePut(id, value) {
    return new Promise((resolve) => {
      if (!dbAvailable || !db) {
        resolve(false);
        return;
      }

      try {
        const tx = db.transaction(STORE_NAME, "readwrite");

        tx.objectStore(STORE_NAME).put({
          id,
          value,
          updatedAt: Date.now()
        });

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
        tx.onabort = () => resolve(false);
      } catch (_) {
        resolve(false);
      }
    });
  }

  async function saveData() {
    const data = {
      mission: state.mission,
      character: state.character,
      score: state.score,
      settings: state.settings,
      savedAt: Date.now()
    };

    let saved = false;

    try {
      saved = await databasePut("save", data);
    } catch (_) {}

    try {
      localStorage.setItem("fobasMissionSave", JSON.stringify(data));
      if (!saved) saved = true;
    } catch (_) {}

    if (ui.saveStatus) {
      ui.saveStatus.textContent = saved
        ? "Sistèm sove: done"
        : "Sistèm sove: pa disponib";
    }

    return saved;
  }

  async function loadData() {
    let data = null;

    try {
      data = await databaseGet("save");
    } catch (_) {}

    if (!data) {
      try {
        const raw = localStorage.getItem("fobasMissionSave");
        if (raw) data = JSON.parse(raw);
      } catch (_) {}
    }

    if (!data || typeof data !== "object") return;

    if (MISSIONS[data.mission]) state.mission = data.mission;
    if (CHARACTERS[data.character]) {
      state.character = data.character;
      state.selectedCharacter = data.character;
    }

    if (Number.isFinite(data.score)) {
      state.score = Math.max(0, data.score);
    }

    if (data.settings && typeof data.settings === "object") {
      state.settings = {
        ...state.settings,
        ...data.settings
      };
    }

    applySettingsToControls();
    updateHUD();
  }

  /* -------------------- EKRAN AK MESAJ -------------------- */

  function showScreen(screen) {
    [ui.loading, ui.menu, ui.game].forEach((element) => {
      if (element) element.hidden = element !== screen;
    });
  }

  function showPanel(panel) {
    [ui.missionMenu, ui.characterMenu, ui.settingsMenu].forEach((element) => {
      if (element) element.hidden = element !== panel;
    });
  }

  function notify(message) {
    if (!ui.notifications) return;

    ui.notifications.textContent = message;
    ui.notifications.classList.add("show");

    if (state.notificationTimer) {
      clearTimeout(state.notificationTimer);
    }

    state.notificationTimer = setTimeout(() => {
      if (ui.notifications) {
        ui.notifications.classList.remove("show");
      }
    }, 2400);
  }

  function showError(message) {
    if (ui.errorMessage) ui.errorMessage.textContent = message;
    if (ui.error) ui.error.hidden = false;
  }

  function hideError() {
    if (ui.error) ui.error.hidden = true;
  }

  /* -------------------- PARAMÈT -------------------- */

  function applySettingsToControls() {
    if (ui.quality) ui.quality.value = state.settings.quality;
    if (ui.sensitivity) ui.sensitivity.value = state.settings.sensitivity;
    if (ui.volume) ui.volume.value = state.settings.volume;
    if (ui.sound) ui.sound.checked = !!state.settings.sound;
  }

  function readSettings() {
    if (ui.quality) state.settings.quality = ui.quality.value;
    if (ui.sensitivity) {
      state.settings.sensitivity = Number(ui.sensitivity.value) || 5;
    }
    if (ui.volume) {
      state.settings.volume = Number(ui.volume.value) || 0;
    }
    if (ui.sound) state.settings.sound = ui.sound.checked;

    resizeCanvas();
    saveData();
    notify("Paramèt yo anrejistre!");
  }

  /* -------------------- SON SENP -------------------- */

  function playTone(frequency = 500, duration = 0.08) {
    if (!state.settings.sound || state.settings.volume <= 0) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!state.audioContext) state.audioContext = new AudioCtx();

      const ac = state.audioContext;
      if (ac.state === "suspended") ac.resume();

      const oscillator = ac.createOscillator();
      const gain = ac.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      gain.gain.value = Math.min(0.12, state.settings.volume / 800);
      gain.gain.setTargetAtTime(0, ac.currentTime + duration * 0.55, 0.04);

      oscillator.connect(gain);
      gain.connect(ac.destination);

      oscillator.start();
      oscillator.stop(ac.currentTime + duration);
    } catch (_) {
      // Jwèt la kontinye menm si son pa disponib.
    }
  }

  /* -------------------- MOND PSEUDO-3D -------------------- */

  let width = 800;
  let height = 600;
  let pixelRatio = 1;

  function resizeCanvas() {
    if (!ui.canvas || !ctx) return;

    const rect = ui.world
      ? ui.world.getBoundingClientRect()
      : ui.canvas.getBoundingClientRect();

    width = Math.max(320, rect.width || window.innerWidth);
    height = Math.max(240, rect.height || window.innerHeight);

    const quality = state.settings.quality;
    const maxRatio = quality === "high" ? 2 : quality === "medium" ? 1.5 : 1;

    pixelRatio = Math.min(window.devicePixelRatio || 1, maxRatio);

    ui.canvas.width = Math.floor(width * pixelRatio);
    ui.canvas.height = Math.floor(height * pixelRatio);
    ui.canvas.style.width = "100%";
    ui.canvas.style.height = "100%";

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingEnabled = true;
  }

  // Transfòme kowòdone mond lan an kowòdone izometrik.
  function project(x, z, y = 0) {
    const zoom = state.cameraZoom;
    const angle = state.cameraAngle;

    const dx = x - state.x;
    const dz = z - state.z;

    const rx = dx * Math.cos(angle) - dz * Math.sin(angle);
    const rz = dx * Math.sin(angle) + dz * Math.cos(angle);

    const scale = Math.min(width, height) * 0.052 * zoom;

    return {
      x: width * 0.5 + (rx - rz) * scale,
      y: height * 0.53 + (rx + rz) * scale * 0.48 - y * scale
    };
  }

  function polygon(points, fill, stroke = null, lineWidth = 1) {
    if (!ctx || !points.length) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();

    if (stroke) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  function worldDiamond(x, z, y, rx, rz, fill, stroke) {
    const p1 = project(x, z - rz, y);
    const p2 = project(x + rx, z, y);
    const p3 = project(x, z + rz, y);
    const p4 = project(x - rx, z, y);

    polygon([p1, p2, p3, p4], fill, stroke);
  }

  function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#071426");
    gradient.addColorStop(0.52, "#163b55");
    gradient.addColorStop(1, "#65a8a0");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Limyè syèl la.
    const glow = ctx.createRadialGradient(
      width * 0.76, height * 0.18, 4,
      width * 0.76, height * 0.18, height * 0.5
    );

    glow.addColorStop(0, "rgba(95,245,231,0.22)");
    glow.addColorStop(1, "rgba(95,245,231,0)");

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // Zetwal dekoratif.
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    for (let i = 0; i < 38; i++) {
      const x = ((i * 173) % 997) / 997 * width;
      const y = ((i * 83) % 421) / 421 * height * 0.42;
      ctx.fillRect(x, y, 1.3, 1.3);
    }

    // Sol orizon an.
    ctx.fillStyle = "#102b36";
    ctx.fillRect(0, height * 0.61, width, height * 0.39);
  }

  function drawGround() {
    const range = state.settings.quality === "low" ? 9 : 13;

    for (let z = -range; z <= range; z++) {
      for (let x = -range; x <= range; x++) {
        const wx = Math.round(state.x) + x;
        const wz = Math.round(state.z) + z;

        const checker = (wx + wz) & 1;
        const color = checker ? "#1d655d" : "#205e56";

        const corners = [
          project(wx, wz, 0),
          project(wx + 1, wz, 0),
          project(wx + 1, wz + 1, 0),
          project(wx, wz + 1, 0)
        ];

        polygon(corners, color, "rgba(4,25,35,0.12)", 0.5);

        // Ti wòch sou kèk kare.
        if ((Math.abs(wx * 7 + wz * 13) % 17) === 0) {
          const p = project(wx + 0.5, wz + 0.5, 0.025);
          ctx.fillStyle = "rgba(170,218,185,0.25)";
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, 3, 1.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  function drawTree(tree) {
    const base = project(tree.x, tree.z, 0);
    const size = tree.size;

    // Lonbraj.
    ctx.fillStyle = "rgba(0,0,0,0.23)";
    ctx.beginPath();
    ctx.ellipse(base.x + 5, base.y + 2, size * 0.6, size * 0.23, 0, 0, Math.PI * 2);
    ctx.fill();

    // Twon.
    const trunkTop = project(tree.x, tree.z, size * 0.9);
    ctx.strokeStyle = "#69482f";
    ctx.lineWidth = Math.max(3, size * 0.13);
    ctx.beginPath();
    ctx.moveTo(base.x, base.y);
    ctx.lineTo(trunkTop.x, trunkTop.y);
    ctx.stroke();

    // Fèy an plizyè kouch.
    const colors = ["#0d5049", "#137363", "#24977a"];

    for (let i = 0; i < 3; i++) {
      const h = size * (0.65 + i * 0.35);
      const center = project(tree.x, tree.z, h);
      const r = size * (0.43 - i * 0.035);

      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.moveTo(center.x, center.y - r);
      ctx.lineTo(center.x + r * 0.78, center.y + r * 0.3);
      ctx.lineTo(center.x, center.y + r * 0.72);
      ctx.lineTo(center.x - r * 0.78, center.y + r * 0.3);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(123,255,200,0.12)";
      ctx.stroke();
    }
  }

  function drawBuilding(b) {
    const w = b.w;
    const d = b.d;
    const h = b.h;

    const a = project(b.x, b.z, 0);
    const b1 = project(b.x + w, b.z, 0);
    const c = project(b.x + w, b.z + d, 0);
    const d1 = project(b.x, b.z + d, 0);

    const at = project(b.x, b.z, h);
    const bt = project(b.x + w, b.z, h);
    const ct = project(b.x + w, b.z + d, h);
    const dt = project(b.x, b.z + d, h);

    // Fasad bò yo.
    polygon([a, b1, bt, at], "#254b64", "#152f46");
    polygon([b1, c, ct, bt], "#18384f", "#10283a");
    polygon([a, d1, dt, at], "#315c70", "#173a4b");

    // Do.
    polygon([at, bt, ct, dt], b.roof, "#5adbd2", 1);

    // Fenèt limen.
    const mid1 = project(b.x + w * 0.5, b.z, h * 0.57);
    const mid2 = project(b.x + w, b.z + d * 0.5, h * 0.57);

    ctx.fillStyle = "#78e7de";
    ctx.globalAlpha = 0.8;
    ctx.fillRect(mid1.x - 5, mid1.y - 7, 8, 12);
    ctx.fillRect(mid2.x - 4, mid2.y - 7, 7, 12);
    ctx.globalAlpha = 1;
  }

  function drawCrystal(crystal, time) {
    if (crystal.taken) return;

    const bob = Math.sin(time * 0.003 + crystal.phase) * 0.13;
    const p = project(crystal.x, crystal.z, 0.75 + bob);
    const size = 12 * state.cameraZoom;

    // Halo.
    const halo = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, size * 2.2);
    halo.addColorStop(0, "rgba(75,255,236,0.35)");
    halo.addColorStop(1, "rgba(75,255,236,0)");

    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Kristal fasete.
    polygon([
      { x: p.x, y: p.y - size },
      { x: p.x + size * 0.6, y: p.y - size * 0.1 },
      { x: p.x, y: p.y + size },
      { x: p.x - size * 0.6, y: p.y - size * 0.1 }
    ], "#46f8e1", "#d5fffb", 1);

    polygon([
      { x: p.x, y: p.y - size },
      { x: p.x, y: p.y + size },
      { x: p.x + size * 0.6, y: p.y - size * 0.1 }
    ], "#a4fff4");
  }

  function drawPlayer(time) {
    const p = project(state.x, state.z, state.jumpHeight);
    const char = CHARACTERS[state.character];

    // Lonbraj pèsonaj la.
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 3, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = state.running
      ? Math.sin(time * 0.018) * 2
      : Math.sin(time * 0.004) * 0.7;

    const y = p.y - 11 + bob;

    // Pye.
    ctx.strokeStyle = "#152b3b";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    const legSwing = state.running ? Math.sin(time * 0.02) * 4 : 0;

    ctx.beginPath();
    ctx.moveTo(p.x - 4, y + 18);
    ctx.lineTo(p.x - 5 + legSwing, y + 29);
    ctx.moveTo(p.x + 4, y + 18);
    ctx.lineTo(p.x + 5 - legSwing, y + 29);
    ctx.stroke();

    // Kò.
    polygon([
      { x: p.x - 9, y: y - 1 },
      { x: p.x + 9, y: y - 1 },
      { x: p.x + 7, y: y + 18 },
      { x: p.x - 7, y: y + 18 }
    ], char.color, "#d8ffff", 1);

    // Bras.
    ctx.strokeStyle = char.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(p.x - 8, y + 2);
    ctx.lineTo(p.x - 13, y + 12);
    ctx.moveTo(p.x + 8, y + 2);
    ctx.lineTo(p.x + 13, y + 12);
    ctx.stroke();

    // Tèt.
    ctx.fillStyle = "#f0c7a3";
    ctx.beginPath();
    ctx.arc(p.x, y - 8, 8, 0, Math.PI * 2);
    ctx.fill();

    // Kas / cheve.
    ctx.fillStyle = char.color;
    ctx.beginPath();
    ctx.arc(p.x, y - 10, 8, Math.PI, Math.PI * 2);
    ctx.fill();

    // Vizè.
    ctx.fillStyle = "#152b3b";
    ctx.fillRect(p.x - 5, y - 10, 10, 3);

    // Bag limyè anba pèsonaj.
    ctx.strokeStyle = "rgba(73,255,228,0.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 1, 18, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawParticles() {
    for (const p of state.particles) {
      const screen = project(p.x, p.z, p.y);
      ctx.globalAlpha = clamp(p.life, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawWorld(time) {
    if (!ctx) return;

    drawSky();
    drawGround();

    const objects = [];

    for (const tree of state.decorations) {
      objects.push({
        depth: tree.x + tree.z,
        draw: () => drawTree(tree)
      });
    }

    const buildings = [
      { x: -5, z: -4, w: 2.5, d: 2, h: 2.4, roof: "#2c9b99" },
      { x: 3.7, z: -5.3, w: 2, d: 2.2, h: 3.1, roof: "#487baf" },
      { x: 5.2, z: 2.7, w: 2.4, d: 1.8, h: 2.1, roof: "#8863ba" },
      { x: -5.5, z: 4, w: 2, d: 2, h: 2.7, roof: "#c17b55" }
    ];

    for (const building of buildings) {
      objects.push({
        depth: building.x + building.z + building.w + building.d,
        draw: () => drawBuilding(building)
      });
    }

    for (const crystal of state.crystals) {
      if (!crystal.taken) {
        objects.push({
          depth: crystal.x + crystal.z,
          draw: () => drawCrystal(crystal, time)
        });
      }
    }

    objects.push({
      depth: state.x + state.z + 0.1,
      draw: () => drawPlayer(time)
    });

    objects.sort((a, b) => a.depth - b.depth);
    objects.forEach((object) => object.draw());

    drawParticles();

    // Ti etikèt mond lan.
    const base = project(0, 0, 0);
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText("BAZ FOBAS", base.x, base.y - 26);
  }

  /* -------------------- KREYE MOND LAN -------------------- */

  function createWorld() {
    state.crystals = [];
    state.decorations = [];
    state.particles = [];

    const target = MISSIONS[state.mission].target;

    // Kristal yo parèt nan diferan kote.
    for (let i = 0; i < target; i++) {
      let x;
      let z;

      if (i === 0) {
        x = 2;
        z = 0;
      } else {
        x = rand(-9, 9);
        z = rand(-9, 9);
      }

      state.crystals.push({
        x,
        z,
        taken: false,
        phase: rand(0, Math.PI * 2)
      });
    }

    // Pyebwa ki rete sou bor tèren an.
    for (let i = 0; i < 35; i++) {
      let x = rand(-13, 13);
      let z = rand(-13, 13);

      if (Math.abs(x) < 7 && Math.abs(z) < 7) {
        x = x < 0 ? -10 - Math.random() * 3 : 10 + Math.random() * 3;
      }

      state.decorations.push({
        x,
        z,
        size: rand(22, 36)
      });
    }
  }

  function resetMission() {
    state.x = 0;
    state.z = 0;
    state.facing = 0;
    state.cameraAngle = 0;
    state.cameraZoom = 1;
    state.cameraTargetZoom = 1;

    state.health = 100;
    state.energy = 100;
    state.collected = 0;
    state.elapsed = 0;

    state.jumping = false;
    state.jumpHeight = 0;
    state.jumpVelocity = 0;
    state.running = false;
    state.finished = false;
    state.paused = false;

    if (ui.pauseMenu) ui.pauseMenu.hidden = true;
    if (ui.result) ui.result.hidden = true;

    createWorld();
    updateHUD();
  }

  /* -------------------- MOUVMAN AK FIZIK -------------------- */

  function movePlayer(dx, dz, dt) {
    if (!dx && !dz) {
      state.running = false;
      return;
    }

    const magnitude = Math.hypot(dx, dz) || 1;
    dx /= magnitude;
    dz /= magnitude;

    const char = CHARACTERS[state.character];
    const runMultiplier = state.running && state.energy > 0 ? 1.65 : 1;
    const speed = char.speed * runMultiplier;

    const angle = state.cameraAngle;

    const worldX = dx * Math.cos(angle) + dz * Math.sin(angle);
    const worldZ = -dx * Math.sin(angle) + dz * Math.cos(angle);

    state.x = clamp(state.x + worldX * speed * dt, -14, 14);
    state.z = clamp(state.z + worldZ * speed * dt, -14, 14);

    state.facing = Math.atan2(worldZ, worldX);

    if (state.running && state.energy > 0) {
      state.energy = Math.max(0, state.energy - 18 * dt);
    } else {
      state.energy = Math.min(100, state.energy + 11 * dt);
    }

    // Ranmase kristal ki toupre pèsonaj la.
    for (const crystal of state.crystals) {
      if (crystal.taken) continue;

      if (distance(state, crystal) < 0.85) {
        crystal.taken = true;
        state.collected++;
        state.score += 20;
        state.energy = Math.min(100, state.energy + 8);

        createCollectionParticles(crystal.x, crystal.z);
        playTone(720, 0.12);
        notify("✨ Ou kolekte yon kristal!");

        updateHUD();

        if (state.collected >= MISSIONS[state.mission].target) {
          finishMission();
        }
      }
    }
  }

  function jump() {
    if (!state.running || state.paused || state.finished) return;
    if (state.jumping) return;

    state.jumping = true;
    state.jumpVelocity = 6.4;
    playTone(350, 0.07);
  }

  function updateJump(dt) {
    if (!state.jumping) return;

    state.jumpHeight += state.jumpVelocity * dt;
    state.jumpVelocity -= 17 * dt;

    if (state.jumpHeight <= 0) {
      state.jumpHeight = 0;
      state.jumpVelocity = 0;
      state.jumping = false;
    }
  }

  function createCollectionParticles(x, z) {
    for (let i = 0; i < 12; i++) {
      state.particles.push({
        x,
        z,
        y: rand(0.4, 1.2),
        vx: rand(-2, 2),
        vz: rand(-2, 2),
        vy: rand(0.5, 2.5),
        life: 1,
        size: rand(2, 4),
        color: i % 2 ? "#51ffdf" : "#fff3a1"
      });
    }
  }

  function updateParticles(dt) {
    for (const p of state.particles) {
      p.x += p.vx * dt;
      p.z += p.vz * dt;
      p.y += p.vy * dt;
      p.vy -= 4 * dt;
      p.life -= dt * 1.4;
    }

    state.particles = state.particles.filter((p) => p.life > 0);
  }

  /* -------------------- HUD -------------------- */

  function formatTime(seconds) {
    const total = Math.floor(seconds);
    const minutes = Math.floor(total / 60);
    const secs = total % 60;

    return String(minutes).padStart(2, "0") + ":" +
      String(secs).padStart(2, "0");
  }

  function updateHUD() {
    const mission = MISSIONS[state.mission];
    if (!mission) return;

    if (ui.hudCharacter) ui.hudCharacter.textContent = state.character;
    if (ui.hudLevel) ui.hudLevel.textContent = "Nivo " + state.mission;
    if (ui.hudHealth) ui.hudHealth.textContent = Math.round(state.health);
    if (ui.hudEnergy) ui.hudEnergy.textContent = Math.round(state.energy);
    if (ui.hudScore) ui.hudScore.textContent = state.score;

    if (ui.hudMissionTitle) ui.hudMissionTitle.textContent = mission.title;

    if (ui.hudObjective) {
      ui.hudObjective.textContent = mission.description;
    }

    if (ui.objectiveCount) {
      ui.objectiveCount.textContent =
        state.collected + " / " + mission.target;
    }

    if (ui.objectiveProgress) {
      const percentage = state.collected / mission.target * 100;
      ui.objectiveProgress.style.width = percentage + "%";
    }

    if (ui.location) {
      if (Math.hypot(state.x, state.z) < 3) {
        ui.location.textContent = "Baz prensipal";
      } else if (Math.hypot(state.x, state.z) > 10) {
        ui.location.textContent = "Zòn eksplorasyon";
      } else {
        ui.location.textContent = "Tèren FOBAS";
      }
    }

    if (ui.timer) ui.timer.textContent = formatTime(state.elapsed);
  }

  /* -------------------- BOUK JWE -------------------- */

  function frame(time) {
    requestAnimationFrame(frame);

    const dt = state.lastTime
      ? Math.min((time - state.lastTime) / 1000, 0.04)
      : 0;

    state.lastTime = time;

    if (!ctx) return;

    if (state.running && !state.paused && !state.finished) {
      state.elapsed += dt;

      let dx = state.joyX;
      let dz = state.joyY;

      if (state.keys.ArrowLeft || state.keys.a || state.keys.A) dx -= 1;
      if (state.keys.ArrowRight || state.keys.d || state.keys.D) dx += 1;
      if (state.keys.ArrowUp || state.keys.w || state.keys.W) dz -= 1;
      if (state.keys.ArrowDown || state.keys.s || state.keys.S) dz += 1;

      movePlayer(dx, dz, dt);
      updateJump(dt);
      updateParticles(dt);

      state.cameraZoom +=
        (state.cameraTargetZoom - state.cameraZoom) * Math.min(1, dt * 8);

      state.saveTimer += dt;

      if (state.saveTimer >= 15) {
        state.saveTimer = 0;
        saveData();
      }

      updateHUD();
    }

    drawWorld(time);
  }

  /* -------------------- KONTWÒL JOYSTICK -------------------- */

  function setJoystick(clientX, clientY) {
    if (!ui.joystickBase || !ui.joystickKnob) return;

    const rect = ui.joystickBase.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRadius = Math.max(20, rect.width * 0.32);
    let dx = clientX - centerX;
    let dy = clientY - centerY;

    const len = Math.hypot(dx, dy);

    if (len > maxRadius) {
      dx = dx / len * maxRadius;
      dy = dy / len * maxRadius;
    }

    state.joyX = dx / maxRadius;
    state.joyY = dy / maxRadius;

    ui.joystickKnob.style.transform =
      `translate(${dx}px, ${dy}px)`;
  }

  function resetJoystick() {
    state.joyX = 0;
    state.joyY = 0;
    state.joyActive = false;
    state.joyPointer = null;

    if (ui.joystickKnob) {
      ui.joystickKnob.style.transform = "translate(0, 0)";
    }
  }

  if (ui.joystickZone) {
    ui.joystickZone.addEventListener("pointerdown", (event) => {
      event.preventDefault();

      state.joyActive = true;
      state.joyPointer = event.pointerId;

      try {
        ui.joystickZone.setPointerCapture(event.pointerId);
      } catch (_) {}

      setJoystick(event.clientX, event.clientY);
    });

    ui.joystickZone.addEventListener("pointermove", (event) => {
      if (!state.joyActive || event.pointerId !== state.joyPointer) return;
      event.preventDefault();
      setJoystick(event.clientX, event.clientY);
    });

    ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) => {
      ui.joystickZone.addEventListener(type, resetJoystick);
    });
  }

  /* -------------------- KAMERA AK DE DWÈ DWÈT -------------------- */

  const pointers = new Map();
  let lastPinchDistance = null;
  let lastDrag = null;

  function getPinchDistance() {
    const points = [...pointers.values()];
    if (points.length < 2) return null;

    return Math.hypot(
      points[0].x - points[1].x,
      points[0].y - points[1].y
    );
  }

  if (ui.canvas) {
    ui.canvas.style.touchAction = "none";

    ui.canvas.addEventListener("pointerdown", (event) => {
      pointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY
      });

      lastDrag = { x: event.clientX, y: event.clientY };
      lastPinchDistance = getPinchDistance();

      try {
        ui.canvas.setPointerCapture(event.pointerId);
      } catch (_) {}
    });

    ui.canvas.addEventListener("pointermove", (event) => {
      if (!pointers.has(event.pointerId)) return;

      pointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY
      });

      const pinch = getPinchDistance();

      // De dwèt: rale pou agrandi, pwoche pou diminye.
      if (pinch !== null && lastPinchDistance !== null) {
        const change = pinch - lastPinchDistance;

        state.cameraTargetZoom = clamp(
          state.cameraTargetZoom + change * 0.003,
          0.65,
          1.8
        );

        lastPinchDistance = pinch;
        lastDrag = null;
        return;
      }

      // Yon dwèt sou mond lan: vire kamera a.
      if (pointers.size === 1 && lastDrag) {
        const dx = event.clientX - lastDrag.x;

        state.cameraAngle += dx *
          (Number(state.settings.sensitivity) || 5) * 0.0012;

        lastDrag = { x: event.clientX, y: event.clientY };
      }
    });

    function removePointer(event) {
      pointers.delete(event.pointerId);
      lastPinchDistance = getPinchDistance();
      lastDrag = null;
    }

    ui.canvas.addEventListener("pointerup", removePointer);
    ui.canvas.addEventListener("pointercancel", removePointer);
    ui.canvas.addEventListener("lostpointercapture", removePointer);

    ui.canvas.addEventListener("wheel", (event) => {
      event.preventDefault();

      state.cameraTargetZoom = clamp(
        state.cameraTargetZoom - event.deltaY * 0.001,
        0.65,
        1.8
      );
    }, { passive: false });
  }

  /* -------------------- KONTWÒL KLAVYE -------------------- */

  window.addEventListener("keydown", (event) => {
    state.keys[event.key] = true;

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "]
      .includes(event.key)) {
      event.preventDefault();
    }

    if (event.key === " " || event.key === "Spacebar") jump();

    if (event.key === "Escape" && state.running) {
      if (state.paused) resumeGame();
      else pauseGame();
    }
  });

  window.addEventListener("keyup", (event) => {
    state.keys[event.key] = false;
  });

  window.addEventListener("blur", () => {
    state.keys = {};
    resetJoystick();
  });

  /* -------------------- BOUTON AKSYON -------------------- */

  function bindButton(element, handler) {
    if (!element) return;

    element.addEventListener("click", (event) => {
      event.preventDefault();
      handler();
    });
  }

  bindButton(ui.enter, () => {
    state.ready = true;
    showScreen(ui.menu);
    showPanel(null);
    playTone(520, 0.08);
  });

  bindButton(ui.play, () => startGame(state.mission));
  bindButton(ui.continue, () => startGame(state.mission));

  bindButton(ui.missions, () => {
    showPanel(ui.missionMenu);
  });

  bindButton(ui.characters, () => {
    state.selectedCharacter = state.character;
    updateCharacterSelection();
    showPanel(ui.characterMenu);
  });

  bindButton(ui.settings, () => {
    applySettingsToControls();
    showPanel(ui.settingsMenu);
  });

  document.querySelectorAll("[data-back-menu]").forEach((button) => {
    button.addEventListener("click", () => showPanel(null));
  });

  document.querySelectorAll("[data-select-mission]").forEach((button) => {
    button.addEventListener("click", () => {
      const mission = Number(button.dataset.selectMission);

      if (!MISSIONS[mission]) return;

      state.mission = mission;
      saveData();
      startGame(mission);
    });
  });

  document.querySelectorAll("[data-character]").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.character;

      if (!CHARACTERS[name]) return;

      state.selectedCharacter = name;
      updateCharacterSelection();
      playTone(430, 0.06);
    });
  });

  function updateCharacterSelection() {
    document.querySelectorAll("[data-character]").forEach((button) => {
      const selected = button.dataset.character === state.selectedCharacter;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    if (ui.selectedCharacter) {
      ui.selectedCharacter.textContent =
        "Pèsonaj: " + state.selectedCharacter;
    }
  }

  bindButton(ui.confirmCharacter, () => {
    state.character = state.selectedCharacter;
    saveData();
    updateHUD();
    showPanel(null);
    notify("Pèsonaj " + state.character + " chwazi!");
    playTone(600, 0.1);
  });

  bindButton(ui.saveSettings, readSettings);

  bindButton(ui.pause, pauseGame);
  bindButton(ui.resume, resumeGame);

  bindButton(ui.restart, () => {
    resetMission();
    state.running = true;
    state.paused = false;
    notify("Misyon an rekòmanse!");
  });

  bindButton(ui.backMenu, () => {
    state.running = false;
    state.paused = false;
    resetJoystick();

    if (ui.pauseMenu) ui.pauseMenu.hidden = true;
    if (ui.result) ui.result.hidden = true;

    showScreen(ui.menu);
    showPanel(null);
    saveData();
  });

  bindButton(ui.resultMenu, () => {
    state.running = false;
    state.finished = false;

    if (ui.result) ui.result.hidden = true;

    showScreen(ui.menu);
    showPanel(null);
    saveData();
  });

  bindButton(ui.nextMission, () => {
    const next = state.mission >= 3 ? 1 : state.mission + 1;
    state.mission = next;
    startGame(next);
  });

  bindButton(ui.jump, jump);

  bindButton(ui.run, () => {
    state.running = !state.running;
    ui.run.classList.toggle("active", state.running);
  });

  bindButton(ui.action, () => {
    if (!state.running || state.paused) return;

    let nearest = null;
    let nearestDistance = Infinity;

    for (const crystal of state.crystals) {
      if (crystal.taken) continue;

      const d = distance(state, crystal);
      if (d < nearestDistance) {
        nearestDistance = d;
        nearest = crystal;
      }
    }

    if (nearest && nearestDistance < 2.2) {
      // Aksyon an ranmase kristal ki toupre a.
      nearest.x = state.x;
      nearest.z = state.z;
      notify("Ou pwoche ase! Kontinye deplase sou kristal la.");
    } else {
      notify("Eksplore zòn nan pou jwenn kristal yo.");
    }
  });

  bindButton(ui.camera, () => {
    state.cameraAngle += Math.PI / 4;
    playTone(300, 0.05);
  });

  bindButton(ui.errorClose, hideError);

  /* -------------------- KÒMANSE / POZ / FINI -------------------- */

  function startGame(missionNumber) {
    if (MISSIONS[missionNumber]) state.mission = missionNumber;

    resetMission();
    showScreen(ui.game);
    showPanel(null);

    if (ui.pauseMenu) ui.pauseMenu.hidden = true;
    if (ui.result) ui.result.hidden = true;

    state.running = true;
    state.paused = false;

    resizeCanvas();
    updateHUD();
    saveData();

    playTone(540, 0.12);
  }

  function pauseGame() {
    if (!state.running || state.finished) return;

    state.paused = true;

    if (ui.pauseMenu) ui.pauseMenu.hidden = false;

    resetJoystick();
  }

  function resumeGame() {
    if (state.finished) return;

    state.paused = false;

    if (ui.pauseMenu) ui.pauseMenu.hidden = true;

    state.running = true;
    playTone(470, 0.06);
  }

  function finishMission() {
    if (state.finished) return;

    state.finished = true;
    state.paused = false;

    const reward = MISSIONS[state.mission].reward;
    state.score += reward;

    if (ui.pauseMenu) ui.pauseMenu.hidden = true;
    if (ui.result) ui.result.hidden = false;

    if (ui.resultTitle) {
      ui.resultTitle.textContent = "MISYON REYISI!";
    }

    if (ui.resultDescription) {
      ui.resultDescription.textContent =
        "Bravo! Ou fini misyon: " + MISSIONS[state.mission].title +
        ". Ou resevwa " + reward + " pwen anplis.";
    }

    if (ui.resultScore) ui.resultScore.textContent = state.score;

    if (ui.nextMission) {
      ui.nextMission.hidden = state.mission >= 3;
    }

    updateHUD();
    saveData();
    playTone(850, 0.22);
  }

  /* -------------------- CHAJMAN -------------------- */

  async function initialize() {
    if (!ctx) {
      if (ui.fallback) {
        ui.fallback.hidden = false;
        ui.fallback.textContent =
          "Navigatè sa a pa sipòte Canvas 2D. Eseye mete navigatè a ajou.";
      }

      showError("Canvas pa disponib nan navigatè sa a.");
      return;
    }

    if (ui.loadingStatus) {
      ui.loadingStatus.textContent = "Preparasyon grafik yo...";
    }
    if (ui.loadingProgress) ui.loadingProgress.style.width = "25%";

    resizeCanvas();

    if (ui.loadingStatus) {
      ui.loadingStatus.textContent = "Preparasyon sistèm sove a...";
    }
    if (ui.loadingProgress) ui.loadingProgress.style.width = "55%";

    await openDatabase();
    await loadData();

    if (ui.loadingStatus) {
      ui.loadingStatus.textContent = "Kreyasyon mond FOBAS la...";
    }
    if (ui.loadingProgress) ui.loadingProgress.style.width = "82%";

    createWorld();
    applySettingsToControls();
    updateHUD();
    updateCharacterSelection();

    if (ui.loadingProgress) ui.loadingProgress.style.width = "100%";
    if (ui.loadingStatus) {
      ui.loadingStatus.textContent = "Jwèt la pare!";
    }

    state.ready = true;
    requestAnimationFrame(frame);

    // Bouton antre a rete disponib; si li pa peze,
    // jwè a ka antre lè li pare.
    if (ui.enter) {
      ui.enter.disabled = false;
      ui.enter.textContent = "ANTRE NAN JWÈT LA";
    }

    if (ui.saveStatus) {
      ui.saveStatus.textContent = dbAvailable
        ? "Sistèm sove: IndexedDB aktif"
        : "Sistèm sove: mòd sovgad";
    }
  }

  /* -------------------- ADAPTASYON EKRAN -------------------- */

  window.addEventListener("resize", resizeCanvas);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", resizeCanvas);
  }

  // Evite paj la defile pandan y ap jwe sou telefòn.
  document.addEventListener("touchmove", (event) => {
    if (state.running) event.preventDefault();
  }, { passive: false });

  // Anpeche meni kontèks la deranje kontwòl jwèt la.
  if (ui.canvas) {
    ui.canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  }

  // Chaje jwèt la.
  initialize().catch((error) => {
    console.error("FOBAS init error:", error);
    showError("Te gen yon pwoblèm pandan jwèt la t ap chaje.");
  });

})();
```