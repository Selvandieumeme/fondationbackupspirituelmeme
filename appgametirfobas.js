
/* ============================================================
   FOBAS MISSION 3D — MEME & TEAM
   Version 2.0.0
   Native WebGL | Android + Desktop | IndexedDB
   San Three.js, san CDN, san Canvas 2D
   Konpatib ak ID ki nan appgametirfobas.html
   ============================================================ */

(() => {
  const APP = "FOBAS MISSION 3D";
  const VERSION = "2.0.0";
  const SAVE_DB = "FOBAS_MISSION_3D_DB";
  const SAVE_STORE = "game_saves";
  const SAVE_KEY = "main_save";

  const $ = (id) => document.getElementById(id);

  const dom = {
    loadingScreen: $("loading-screen"),
    loadingProgress: $("loading-progress"),
    loadingStatus: $("loading-status"),
    btnEnter: $("btn-enter"),

    mainMenu: $("main-menu"),
    btnPlay: $("btn-play"),
    btnMissions: $("btn-missions"),
    btnCharacters: $("btn-characters"),
    btnSettings: $("btn-settings"),
    btnContinue: $("btn-continue"),

    missionMenu: $("mission-menu"),
    characterMenu: $("character-menu"),
    settingsMenu: $("settings-menu"),
    selectedCharacter: $("selected-character"),
    btnConfirmCharacter: $("btn-confirm-character"),

    graphicsQuality: $("graphics-quality"),
    cameraSensitivity: $("camera-sensitivity"),
    gameVolume: $("game-volume"),
    soundEnabled: $("sound-enabled"),
    btnSaveSettings: $("btn-save-settings"),
    saveStatus: $("save-status"),

    gameScreen: $("game-screen"),
    canvas: $("game-canvas"),
    fallback: $("world-fallback"),

    hudCharacter: $("hud-character"),
    hudLevel: $("hud-level"),
    hudHealth: $("hud-health"),
    hudEnergy: $("hud-energy"),
    hudScore: $("hud-score"),
    btnPause: $("btn-pause"),

    hudMissionTitle: $("hud-mission-title"),
    hudObjective: $("hud-objective"),
    objectiveProgress: $("objective-progress"),
    objectiveCount: $("objective-count"),
    hudLocation: $("hud-location"),
    hudTimer: $("hud-timer"),

    mobileControls: $("mobile-controls"),
    joystickZone: $("joystick-zone"),
    joystickBase: $("joystick-base"),
    joystickKnob: $("joystick-knob"),

    btnJump: $("btn-jump"),
    btnRun: $("btn-run"),
    btnAction: $("btn-action"),
    btnCamera: $("btn-camera"),
    btnPitch2: $("btn-pitch-2"),

    pauseMenu: $("pause-menu"),
    btnResume: $("btn-resume"),
    btnRestart: $("btn-restart"),
    btnBackToMenu: $("btn-back-to-menu"),

    missionResult: $("mission-result"),
    resultTitle: $("result-title"),
    resultDescription: $("result-description"),
    resultScore: $("result-score"),
    btnNextMission: $("btn-next-mission"),
    btnResultMenu: $("btn-result-menu"),

    notifications: $("game-notifications"),

    appError: $("app-error"),
    appErrorMessage: $("app-error-message"),
    btnErrorClose: $("btn-error-close")
  };

  const MISSIONS = [
    {
      id: 1,
      title: "Misyon 1 — Premye Kontak",
      objective: "Eksplore teren an epi avanse omwen 35 mèt.",
      type: "explore",
      target: 35,
      reward: 100
    },
    {
      id: 2,
      title: "Misyon 2 — Meme & Team",
      objective: "Jwenn 3 baliz ekip la epi aktive yo.",
      type: "beacons",
      target: 3,
      reward: 250
    },
    {
      id: 3,
      title: "Misyon 3 — Defi Final",
      objective: "Elimine 6 advèsè pou sekirize baz la.",
      type: "combat",
      target: 6,
      reward: 500
    }
  ];

  const CHARACTERS = {
    MEME: {
      name: "MEME",
      health: 100,
      energy: 100,
      speed: 5.2,
      color: [0.15, 0.72, 0.92]
    },
    FOBAS: {
      name: "FOBAS",
      health: 120,
      energy: 100,
      speed: 4.7,
      color: [0.22, 0.85, 0.47]
    },
    SHADOW: {
      name: "SHADOW",
      health: 90,
      energy: 120,
      speed: 6.2,
      color: [0.55, 0.36, 0.90]
    },
    BLAZE: {
      name: "BLAZE",
      health: 95,
      energy: 110,
      speed: 6.8,
      color: [0.98, 0.36, 0.12]
    },
    TITAN: {
      name: "TITAN",
      health: 150,
      energy: 90,
      speed: 4.1,
      color: [0.88, 0.72, 0.20]
    }
  };

  const state = {
    initialized: false,
    entered: false,
    running: false,
    paused: false,
    completed: false,
    gameOver: false,

    missionIndex: 0,
    character: "MEME",

    score: 0,
    health: 100,
    energy: 100,

    progress: 0,
    objectiveTarget: 35,
    enemiesEliminated: 0,
    beaconsActivated: 0,

    startTime: 0,
    elapsedTime: 0,
    lastFrame: 0,
    raf: 0,

    keys: Object.create(null),

    player: {
      x: 0,
      y: 0,
      z: 5,
      yaw: 0,
      pitch: 0,
      speed: 5.2,
      jumpHeight: 0,
      jumpVelocity: 0,
      isJumping: false,
      runningFast: false,
      cameraMode: 0
    },

    enemies: [],
    beacons: [],
    bullets: [],
    effects: [],

    joystick: {
      active: false,
      pointerId: null,
      x: 0,
      y: 0,
      forward: 0,
      strafe: 0
    },

    look: {
      active: false,
      pointerId: null,
      x: 0,
      y: 0
    },

    settings: {
      quality: "medium",
      sensitivity: 5,
      volume: 70,
      sound: true
    },

    saved: {
      unlockedMission: 1,
      bestScore: 0,
      totalMissionsCompleted: 0
    },

    db: null,
    audioContext: null
  };

  let gl = null;
  let shaderProgram = null;
  let cubeMesh = null;
  let planeMesh = null;
  let gridMesh = null;
  let lastSaveTime = 0;
  let lastShotTime = 0;
  let messageTimer = null;

  /* ============================================================
     ERÈ AK NOTIFIKASYON
     ============================================================ */

  function notify(message, duration = 2600) {
    if (!dom.notifications) return;

    dom.notifications.textContent = message;
    dom.notifications.classList.add("visible");

    if (messageTimer) clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {
      if (dom.notifications) {
        dom.notifications.classList.remove("visible");
      }
    }, duration);
  }

  function showError(message) {
    if (dom.appError && dom.appErrorMessage) {
      dom.appErrorMessage.textContent = message;
      dom.appError.hidden = false;
    } else {
      console.error(`[${APP}] ${message}`);
    }
  }

  function hideError() {
    if (dom.appError) dom.appError.hidden = true;
  }

  function setLoading(percent, message) {
    if (dom.loadingProgress) {
      dom.loadingProgress.style.width =
        `${Math.max(0, Math.min(100, percent))}%`;
    }

    if (dom.loadingStatus) {
      dom.loadingStatus.textContent = message;
    }
  }

  /* ============================================================
     NAVIGASYON AK MENI
     ============================================================ */

  function hideAllScreens() {
    if (dom.loadingScreen) dom.loadingScreen.hidden = true;
    if (dom.mainMenu) dom.mainMenu.hidden = true;
    if (dom.gameScreen) dom.gameScreen.hidden = true;
  }

  function hideMainSubmenus() {
    if (dom.missionMenu) dom.missionMenu.hidden = true;
    if (dom.characterMenu) dom.characterMenu.hidden = true;
    if (dom.settingsMenu) dom.settingsMenu.hidden = true;
  }

  function showMainMenu(section = null) {
    stopGameLoop();
    state.running = false;
    state.paused = false;

    hideAllScreens();
    hideMainSubmenus();

    if (dom.mainMenu) dom.mainMenu.hidden = false;

    if (section === "missions" && dom.missionMenu) {
      dom.missionMenu.hidden = false;
    }

    if (section === "characters" && dom.characterMenu) {
      dom.characterMenu.hidden = false;
    }

    if (section === "settings" && dom.settingsMenu) {
      dom.settingsMenu.hidden = false;
    }

    if (dom.pauseMenu) dom.pauseMenu.hidden = true;
    if (dom.missionResult) dom.missionResult.hidden = true;

    updateCharacterSelection();
    updateSaveStatus("Meni prensipal");
  }

  function showGameScreen() {
    hideAllScreens();

    if (dom.gameScreen) dom.gameScreen.hidden = false;

    if (dom.pauseMenu) dom.pauseMenu.hidden = true;
    if (dom.missionResult) dom.missionResult.hidden = true;

    updateMobileControls();
    resizeRenderer();
    renderFrame();
  }

  function enterGame() {
    state.entered = true;
    showMainMenu();
    notify("Byenveni nan FOBAS MISSION 3D!");
  }

  /* ============================================================
     SOVGAD INDEXEDDB
     ============================================================ */

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB pa disponib."));
        return;
      }

      let request;

      try {
        request = indexedDB.open(SAVE_DB, 1);
      } catch (error) {
        reject(error);
        return;
      }

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(SAVE_STORE)) {
          database.createObjectStore(SAVE_STORE, {
            keyPath: "id"
          });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(
        request.error || new Error("Erè IndexedDB.")
      );
    });
  }

  function databaseRead(key) {
    return new Promise((resolve, reject) => {
      if (!state.db) {
        reject(new Error("Bazdone poko ouvri."));
        return;
      }

      const transaction = state.db.transaction(
        SAVE_STORE,
        "readonly"
      );

      const request = transaction
        .objectStore(SAVE_STORE)
        .get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  function databaseWrite(record) {
    return new Promise((resolve, reject) => {
      if (!state.db) {
        reject(new Error("Bazdone poko ouvri."));
        return;
      }

      const transaction = state.db.transaction(
        SAVE_STORE,
        "readwrite"
      );

      transaction.objectStore(SAVE_STORE).put(record);

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  function createSaveRecord() {
    return {
      id: SAVE_KEY,
      version: VERSION,
      updatedAt: Date.now(),

      character: state.character,
      missionIndex: state.missionIndex,
      score: state.score,

      health: state.health,
      energy: state.energy,

      settings: { ...state.settings },

      unlockedMission: state.saved.unlockedMission,
      bestScore: state.saved.bestScore,
      totalMissionsCompleted: state.saved.totalMissionsCompleted
    };
  }

  async function saveGame(showMessageAfter = false) {
    const record = createSaveRecord();

    try {
      await databaseWrite(record);

      updateSaveStatus("Pwogrè sove nan IndexedDB.");

      if (showMessageAfter) {
        notify("Pwogrè ou sove avèk siksè.");
      }

      return true;
    } catch (error) {
      console.warn(`${APP}: sovgad IndexedDB echwe.`, error);

      updateSaveStatus(
        "Sovgad pa disponib nan navigatè sa a."
      );

      if (showMessageAfter) {
        notify("Navigatè a pa t kapab sove pwogrè a.");
      }

      return false;
    }
  }

  async function loadGameSave() {
    try {
      const record = await databaseRead(SAVE_KEY);

      if (!record) {
        updateSaveStatus("Premye jwèt — pa gen sovgad anvan.");
        return false;
      }

      if (record.character && CHARACTERS[record.character]) {
        state.character = record.character;
      }

      if (Number.isFinite(record.missionIndex)) {
        state.missionIndex = Math.max(
          0,
          Math.min(MISSIONS.length - 1, record.missionIndex)
        );
      }

      if (Number.isFinite(record.score)) {
        state.score = Math.max(0, record.score);
      }

      if (record.settings) {
        state.settings = {
          ...state.settings,
          ...record.settings
        };
      }

      state.saved.unlockedMission = Math.max(
        1,
        Math.min(
          MISSIONS.length,
          Number(record.unlockedMission) || 1
        )
      );

      state.saved.bestScore = Math.max(
        0,
        Number(record.bestScore) || 0
      );

      state.saved.totalMissionsCompleted = Math.max(
        0,
        Number(record.totalMissionsCompleted) || 0
      );

      applySettingsToControls();
      updateCharacterSelection();
      updateSaveStatus("Sovgad chaje avèk siksè.");

      return true;
    } catch (error) {
      console.warn(`${APP}: pa t kapab chaje sovgad la.`, error);
      updateSaveStatus("Sovgad poko disponib.");
      return false;
    }
  }

  function updateSaveStatus(message) {
    if (dom.saveStatus) dom.saveStatus.textContent = message;
  }

  /* ============================================================
     PARAMÈT
     ============================================================ */

  function applySettingsToControls() {
    if (dom.graphicsQuality) {
      dom.graphicsQuality.value = state.settings.quality;
    }

    if (dom.cameraSensitivity) {
      dom.cameraSensitivity.value = String(
        state.settings.sensitivity
      );
    }

    if (dom.gameVolume) {
      dom.gameVolume.value = String(state.settings.volume);
    }

    if (dom.soundEnabled) {
      dom.soundEnabled.checked = Boolean(state.settings.sound);
    }

    updateGraphicsQuality();
  }

  function readSettingsFromControls() {
    if (dom.graphicsQuality) {
      state.settings.quality = dom.graphicsQuality.value;
    }

    if (dom.cameraSensitivity) {
      state.settings.sensitivity = Number(
        dom.cameraSensitivity.value
      );
    }

    if (dom.gameVolume) {
      state.settings.volume = Number(dom.gameVolume.value);
    }

    if (dom.soundEnabled) {
      state.settings.sound = dom.soundEnabled.checked;
    }

    updateGraphicsQuality();
  }

  function updateGraphicsQuality() {
    if (!gl) return;

    const quality = state.settings.quality;

    if (quality === "low") {
      gl.disable(gl.DITHER);
    } else {
      gl.enable(gl.DITHER);
    }

    resizeRenderer();
    renderFrame();
  }

  async function saveSettings() {
    readSettingsFromControls();
    await saveGame(false);

    notify("Paramèt jwèt la sove.");
    showMainMenu();
  }

  /* ============================================================
     CHWAZI PÈSONAJ
     ============================================================ */

  function selectCharacter(name) {
    if (!CHARACTERS[name]) return;

    state.character = name;
    updateCharacterSelection();
    notify(`Ou chwazi ${name}.`);
  }

  function updateCharacterSelection() {
    if (dom.selectedCharacter) {
      dom.selectedCharacter.textContent =
        `Pèsonaj: ${state.character}`;
    }

    document.querySelectorAll("[data-character]").forEach((button) => {
      const selected =
        button.getAttribute("data-character") === state.character;

      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function confirmCharacter() {
    const character = CHARACTERS[state.character];

    state.health = character.health;
    state.energy = character.energy;
    state.player.speed = character.speed;

    saveGame(false);
    showMainMenu();
    notify(`Pèsonaj ${state.character} konfime.`);
  }

  /* ============================================================
     WEBGL — SHADERS
     ============================================================ */

  const VERTEX_SHADER = `
    attribute vec3 aPosition;
    attribute vec3 aColor;

    uniform mat4 uProjection;
    uniform mat4 uView;
    uniform mat4 uModel;

    varying vec3 vColor;

    void main(void) {
      gl_Position =
        uProjection * uView * uModel * vec4(aPosition, 1.0);

      vColor = aColor;
    }
  `;

  const FRAGMENT_SHADER = `
    precision mediump float;

    varying vec3 vColor;

    void main(void) {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);

    if (!shader) {
      throw new Error("WebGL pa t kapab kreye shader la.");
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader) || "Erè enkoni.";

      gl.deleteShader(shader);
      throw new Error(error);
    }

    return shader;
  }

  function createShaderProgram() {
    const vertex = compileShader(
      gl.VERTEX_SHADER,
      VERTEX_SHADER
    );

    const fragment = compileShader(
      gl.FRAGMENT_SHADER,
      FRAGMENT_SHADER
    );

    const program = gl.createProgram();

    if (!program) {
      throw new Error("WebGL pa t kapab kreye pwogram nan.");
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program) || "Erè enkoni.";

      gl.deleteProgram(program);
      throw new Error(error);
    }

    return program;
  }

  /* ============================================================
     MATRIS 3D
     ============================================================ */

  function mat4Identity() {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  function mat4Multiply(a, b) {
    const out = new Float32Array(16);

    for (let column = 0; column < 4; column++) {
      for (let row = 0; row < 4; row++) {
        out[column * 4 + row] =
          a[row] * b[column * 4] +
          a[4 + row] * b[column * 4 + 1] +
          a[8 + row] * b[column * 4 + 2] +
          a[12 + row] * b[column * 4 + 3];
      }
    }

    return out;
  }

  function mat4Translation(x, y, z) {
    const out = mat4Identity();

    out[12] = x;
    out[13] = y;
    out[14] = z;

    return out;
  }

  function mat4Scale(x, y, z) {
    const out = mat4Identity();

    out[0] = x;
    out[5] = y;
    out[10] = z;

    return out;
  }

  function mat4RotationY(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return new Float32Array([
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1
    ]);
  }

  function mat4Perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    const out = new Float32Array(16);

    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[14] = 2 * far * near * nf;

    return out;
  }

  function normalize3(vector) {
    const length = Math.hypot(
      vector[0],
      vector[1],
      vector[2]
    ) || 1;

    return [
      vector[0] / length,
      vector[1] / length,
      vector[2] / length
    ];
  }

  function cross3(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  function dot3(a, b) {
    return (
      a[0] * b[0] +
      a[1] * b[1] +
      a[2] * b[2]
    );
  }

  function mat4LookAt(eye, target, up) {
    const z = normalize3([
      eye[0] - target[0],
      eye[1] - target[1],
      eye[2] - target[2]
    ]);

    const x = normalize3(cross3(up, z));
    const y = cross3(z, x);

    return new Float32Array([
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -dot3(x, eye),
      -dot3(y, eye),
      -dot3(z, eye),
      1
    ]);
  }

  /* ============================================================
     GEOMETRI 3D
     ============================================================ */

  function createCubeGeometry() {
    const faces = [
      {
        color: [0.16, 0.62, 0.38],
        vertices: [
          [-0.5, -0.5, 0.5],
          [0.5, -0.5, 0.5],
          [0.5, 0.5, 0.5],
          [-0.5, 0.5, 0.5]
        ]
      },
      {
        color: [0.09, 0.30, 0.22],
        vertices: [
          [0.5, -0.5, -0.5],
          [-0.5, -0.5, -0.5],
          [-0.5, 0.5, -0.5],
          [0.5, 0.5, -0.5]
        ]
      },
      {
        color: [0.12, 0.43, 0.28],
        vertices: [
          [0.5, -0.5, 0.5],
          [0.5, -0.5, -0.5],
          [0.5, 0.5, -0.5],
          [0.5, 0.5, 0.5]
        ]
      },
      {
        color: [0.10, 0.37, 0.25],
        vertices: [
          [-0.5, -0.5, -0.5],
          [-0.5, -0.5, 0.5],
          [-0.5, 0.5, 0.5],
          [-0.5, 0.5, -0.5]
        ]
      },
      {
        color: [0.30, 0.72, 0.42],
        vertices: [
          [-0.5, 0.5, 0.5],
          [0.5, 0.5, 0.5],
          [0.5, 0.5, -0.5],
          [-0.5, 0.5, -0.5]
        ]
      },
      {
        color: [0.07, 0.20, 0.14],
        vertices: [
          [-0.5, -0.5, -0.5],
          [0.5, -0.5, -0.5],
          [0.5, -0.5, 0.5],
          [-0.5, -0.5, 0.5]
        ]
      }
    ];

    const positions = [];
    const colors = [];
    const indices = [];

    const baseIndices = [0, 1, 2, 0, 2, 3];

    faces.forEach((face, faceIndex) => {
      face.vertices.forEach((vertex) => {
        positions.push(vertex[0], vertex[1], vertex[2]);
        colors.push(
          face.color[0],
          face.color[1],
          face.color[2]
        );
      });

      baseIndices.forEach((index) => {
        indices.push(faceIndex * 4 + index);
      });
    });

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      indices: new Uint16Array(indices)
    };
  }

  function createPlaneGeometry(size = 180, divisions = 60) {
    const positions = [];
    const colors = [];
    const indices = [];
    const half = size / 2;
    const step = size / divisions;

    for (let z = 0; z <= divisions; z++) {
      for (let x = 0; x <= divisions; x++) {
        positions.push(
          -half + x * step,
          -1.1,
          -half + z * step
        );

        const alternate = (x + z) % 2 === 0;
        const brightness = alternate ? 0.10 : 0.12;

        colors.push(
          brightness,
          brightness + 0.11,
          brightness + 0.05
        );
      }
    }

    const rowSize = divisions + 1;

    for (let z = 0; z < divisions; z++) {
      for (let x = 0; x < divisions; x++) {
        const a = z * rowSize + x;
        const b = a + 1;
        const c = a + rowSize;
        const d = c + 1;

        indices.push(a, c, b, b, c, d);
      }
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      indices: new Uint16Array(indices)
    };
  }

  function createGridGeometry(size = 100, divisions = 50) {
    const positions = [];
    const colors = [];
    const indices = [];
    const half = size / 2;
    const step = size / divisions;

    for (let i = 0; i <= divisions; i++) {
      const offset = -half + i * step;

      const start = positions.length / 3;

      positions.push(
        -half, -1.085, offset,
        half, -1.085, offset,
        offset, -1.085, -half,
        offset, -1.085, half
      );

      for (let j = 0; j < 4; j++) {
        colors.push(0.18, 0.30, 0.23);
      }

      indices.push(
        start, start + 1,
        start + 2, start + 3
      );
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      indices: new Uint16Array(indices),
      mode: gl.LINES
    };
  }

  function createMesh(geometry) {
    const positionBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      geometry.positions,
      gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      geometry.colors,
      gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      geometry.indices,
      gl.STATIC_DRAW
    );

    return {
      positionBuffer,
      colorBuffer,
      indexBuffer,
      indexCount: geometry.indices.length,
      mode: geometry.mode || gl.TRIANGLES
    };
  }

  function drawMesh(mesh, modelMatrix) {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
    gl.enableVertexAttribArray(gl.getAttribLocation(
      shaderProgram,
      "aPosition"
    ));

    gl.vertexAttribPointer(
      gl.getAttribLocation(shaderProgram, "aPosition"),
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.colorBuffer);
    gl.enableVertexAttribArray(gl.getAttribLocation(
      shaderProgram,
      "aColor"
    ));

    gl.vertexAttribPointer(
      gl.getAttribLocation(shaderProgram, "aColor"),
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(
      gl.ELEMENT_ARRAY_BUFFER,
      mesh.indexBuffer
    );

    gl.uniformMatrix4fv(
      gl.getUniformLocation(shaderProgram, "uModel"),
      false,
      modelMatrix
    );

    gl.drawElements(
      mesh.mode,
      mesh.indexCount,
      gl.UNSIGNED_SHORT,
      0
    );
  }

  function drawCube(
    x, y, z,
    sx, sy, sz,
    rotation = 0
  ) {
    const translation = mat4Translation(x, y, z);
    const scale = mat4Scale(sx, sy, sz);
    const rotate = mat4RotationY(rotation);

    const model = mat4Multiply(
      translation,
      mat4Multiply(rotate, scale)
    );

    drawMesh(cubeMesh, model);
  }

  /* ============================================================
     INISYAL MOTÈ WEBGL
     ============================================================ */

  function initializeWebGL() {
    if (!dom.canvas) {
      throw new Error("Eleman #game-canvas pa jwenn nan HTML la.");
    }

    gl =
      dom.canvas.getContext("webgl", {
        alpha: false,
        antialias: true,
        depth: true,
        powerPreference: "high-performance"
      }) ||
      dom.canvas.getContext("experimental-webgl");

    if (!gl) {
      throw new Error(
        "WebGL pa disponib. Verifye sipò navigatè a."
      );
    }

    shaderProgram = createShaderProgram();
    gl.useProgram(shaderProgram);

    cubeMesh = createMesh(createCubeGeometry());
    planeMesh = createMesh(createPlaneGeometry());

    if (state.settings.quality === "high") {
      gridMesh = createMesh(createGridGeometry(100, 70));
    } else {
      gridMesh = createMesh(createGridGeometry(80, 35));
    }

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.035, 0.085, 0.075, 1);

    resizeRenderer();

    if (dom.fallback) dom.fallback.hidden = true;
  }

  function resizeRenderer() {
    if (!gl || !dom.canvas) return;

    const rect = dom.canvas.getBoundingClientRect();
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      state.settings.quality === "high" ? 2 : 1.5
    );

    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (dom.canvas.width !== width) dom.canvas.width = width;
    if (dom.canvas.height !== height) dom.canvas.height = height;

    gl.viewport(0, 0, width, height);
  }

  /* ============================================================
     MOND JEU
     ============================================================ */

  function getCameraMatrices() {
    const p = state.player;

    const direction = [
      Math.sin(p.yaw) * Math.cos(p.pitch),
      Math.sin(p.pitch),
      -Math.cos(p.yaw) * Math.cos(p.pitch)
    ];

    const eye = [
      p.x,
      p.y + 1.45 + p.jumpHeight,
      p.z
    ];

    let target;
    let up = [0, 1, 0];

    if (p.cameraMode === 1) {
      eye[0] -= Math.sin(p.yaw) * 4;
      eye[1] += 1.4;
      eye[2] += Math.cos(p.yaw) * 4;

      target = [
        p.x,
        p.y + 1.3 + p.jumpHeight,
        p.z
      ];
    } else {
      target = [
        eye[0] + direction[0],
        eye[1] + direction[1],
        eye[2] + direction[2]
      ];
    }

    return {
      projection: mat4Perspective(
        Math.PI / 3,
        dom.canvas.width / Math.max(1, dom.canvas.height),
        0.1,
        250
      ),
      view: mat4LookAt(eye, target, up)
    };
  }

  function drawEnvironment() {
    drawMesh(planeMesh, mat4Identity());

    if (gridMesh) {
      drawMesh(gridMesh, mat4Identity());
    }

    // Wout ki mennen nan baz la
    drawCube(0, -0.98, -18, 5, 0.04, 45);
    drawCube(-2.55, -0.96, -18, 0.08, 0.04, 45);
    drawCube(2.55, -0.96, -18, 0.08, 0.04, 45);

    // Bilding prensipal yo
    const buildings = [
      [-9, 1.4, -10, 4, 5, 4],
      [9, 1.2, -14, 4, 4, 4],
      [-14, 1.7, -23, 4, 6, 4],
      [14, 1.8, -28, 5, 6, 5],
      [-6, 1.1, -34, 6, 3.5, 5],
      [7, 2.1, -42, 5, 7, 5],
      [-19, 1.4, -48, 4, 5, 4],
      [20, 1.5, -55, 5, 5, 5],
      [-24, 1.0, -15, 4, 3.5, 4],
      [25, 1.2, -20, 4, 4, 4]
    ];

    buildings.forEach((item) => drawCube(...item));

    // Kolòn limyè nan baz la
    for (let i = 0; i < 7; i++) {
      const z = -8 - i * 8;

      drawCube(-5, 0.6, z, 0.16, 1.5, 0.16);
      drawCube(5, 0.6, z, 0.16, 1.5, 0.16);
    }

    // Eleman ki reprezante ekip jwè a nan mòd kamera dèyè
    if (state.player.cameraMode === 1) {
      const c = CHARACTERS[state.character].color;

      drawCube(
        state.player.x,
        state.player.y + 0.7 + state.player.jumpHeight,
        state.player.z,
        0.65,
        1.35,
        0.45,
        state.player.yaw
      );

      drawCube(
        state.player.x,
        state.player.y + 1.55 + state.player.jumpHeight,
        state.player.z,
        0.42,
        0.42,
        0.42,
        state.player.yaw
      );

      // Mak vizyèl pou koulè pèsonaj la
      void c;
    }
  }

  function drawBeacons() {
    state.beacons.forEach((beacon) => {
      if (beacon.active) return;

      const pulse = 1 + Math.sin(performance.now() * 0.004) * 0.1;

      drawCube(
        beacon.x,
        -0.35,
        beacon.z,
        0.75 * pulse,
        1.5 * pulse,
        0.75 * pulse
      );

      drawCube(
        beacon.x,
        0.55,
        beacon.z,
        0.95,
        0.12,
        0.95
      );
    });
  }

  function drawEnemies() {
    state.enemies.forEach((enemy) => {
      if (!enemy.alive) return;

      drawCube(
        enemy.x,
        enemy.y + 0.75,
        enemy.z,
        0.72,
        1.5,
        0.62,
        enemy.rotation
      );

      drawCube(
        enemy.x,
        enemy.y + 1.65,
        enemy.z,
        0.44,
        0.44,
        0.44,
        enemy.rotation
      );
    });
  }

  function drawBullets() {
    state.bullets.forEach((bullet) => {
      drawCube(
        bullet.x,
        bullet.y,
        bullet.z,
        0.10,
        0.10,
        0.35,
        bullet.yaw
      );
    });

    state.effects.forEach((effect) => {
      drawCube(
        effect.x,
        effect.y,
        effect.z,
        effect.size,
        effect.size,
        effect.size
      );
    });
  }

  function renderFrame() {
    if (!gl || !shaderProgram || !dom.canvas) return;

    resizeRenderer();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(shaderProgram);

    const camera = getCameraMatrices();

    gl.uniformMatrix4fv(
      gl.getUniformLocation(shaderProgram, "uProjection"),
      false,
      camera.projection
    );

    gl.uniformMatrix4fv(
      gl.getUniformLocation(shaderProgram, "uView"),
      false,
      camera.view
    );

    drawEnvironment();
    drawBeacons();
    drawEnemies();
    drawBullets();
  }

  /* ============================================================
     KREYE MOND MISYON
     ============================================================ */

  function spawnEnemies(count) {
    state.enemies = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 12 + Math.random() * 25;

      state.enemies.push({
        id: i + 1,
        x: Math.cos(angle) * distance,
        y: -1.1,
        z: -Math.abs(Math.sin(angle) * distance) - 5,
        health: 100,
        alive: true,
        rotation: Math.random() * Math.PI * 2,
        attackCooldown: 1 + Math.random() * 2
      });
    }
  }

  function spawnBeacons() {
    state.beacons = [
      { id: 1, x: -8, z: -15, active: false },
      { id: 2, x: 9, z: -30, active: false },
      { id: 3, x: -5, z: -45, active: false }
    ];
  }

  function resetPlayer() {
    const character = CHARACTERS[state.character];

    state.player.x = 0;
    state.player.y = 0;
    state.player.z = 5;
    state.player.yaw = 0;
    state.player.pitch = 0;
    state.player.speed = character.speed;
    state.player.jumpHeight = 0;
    state.player.jumpVelocity = 0;
    state.player.isJumping = false;
    state.player.runningFast = false;
    state.player.cameraMode = 0;

    state.health = character.health;
    state.energy = character.energy;
  }

  function selectMission(missionNumber) {
    const index = Number(missionNumber) - 1;

    if (!Number.isInteger(index)) return false;
    if (index < 0 || index >= MISSIONS.length) return false;

    if (index + 1 > state.saved.unlockedMission) {
      notify("Ou dwe fini misyon anvan yo anvan ou debloke sa a.");
      return false;
    }

    state.missionIndex = index;
    state.completed = false;
    state.gameOver = false;
    state.paused = false;
    state.progress = 0;
    state.enemiesEliminated = 0;
    state.beaconsActivated = 0;
    state.elapsedTime = 0;

    state.bullets = [];
    state.effects = [];

    resetPlayer();

    const mission = MISSIONS[index];
    state.objectiveTarget = mission.target;

    spawnEnemies(index === 2 ? 6 : index === 1 ? 3 : 2);
    spawnBeacons();

    updateHUD();
    saveGame(false);

    return true;
  }

  /* ============================================================
     DEMARAJ / POZ / REKÒMANSE
     ============================================================ */

  function startGame() {
    if (!state.initialized) {
      showError("Motè jwèt la poko pare.");
      return;
    }

    if (state.running && !state.paused) return;

    if (state.completed || state.gameOver) {
      selectMission(state.missionIndex + 1);
    }

    state.running = true;
    state.paused = false;
    state.completed = false;
    state.gameOver = false;

    if (state.startTime === 0 || state.elapsedTime === 0) {
      state.startTime = performance.now();
    } else {
      state.startTime = performance.now() - state.elapsedTime * 1000;
    }

    state.lastFrame = performance.now();

    showGameScreen();
    updateHUD();
    notify("Misyon an kòmanse!");

    startGameLoop();
  }

  function pauseGame() {
    if (!state.running || state.completed || state.gameOver) return;

    state.running = false;
    state.paused = true;

    stopGameLoop();

    if (dom.pauseMenu) dom.pauseMenu.hidden = false;
    if (dom.missionResult) dom.missionResult.hidden = true;

    notify("Jwèt la an poz.");
    saveGame(false);
  }

  function resumeGame() {
    if (!state.paused) return;

    state.paused = false;
    state.running = true;

    if (dom.pauseMenu) dom.pauseMenu.hidden = true;

    state.lastFrame = performance.now();
    startGameLoop();

    notify("Jwèt la kontinye.");
  }

  function restartMission() {
    selectMission(state.missionIndex + 1);
    startGame();
  }

  function stopGameLoop() {
    if (state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    }
  }

  function startGameLoop() {
    if (state.raf) return;

    state.lastFrame = performance.now();
    state.raf = requestAnimationFrame(gameLoop);
  }

  function backToMainMenu() {
    state.running = false;
    state.paused = false;

    stopGameLoop();
    resetInputState();
    saveGame(false);
    showMainMenu();
  }

  /* ============================================================
     HUD
     ============================================================ */

  function updateHUD() {
    const mission = MISSIONS[state.missionIndex];

    if (!mission) return;

    if (dom.hudCharacter) {
      dom.hudCharacter.textContent = state.character;
    }

    if (dom.hudLevel) {
      dom.hudLevel.textContent = `Nivo ${state.missionIndex + 1}`;
    }

    if (dom.hudHealth) {
      dom.hudHealth.textContent = String(
        Math.max(0, Math.round(state.health))
      );
    }

    if (dom.hudEnergy) {
      dom.hudEnergy.textContent = String(
        Math.max(0, Math.round(state.energy))
      );
    }

    if (dom.hudScore) {
      dom.hudScore.textContent = String(state.score);
    }

    if (dom.hudMissionTitle) {
      dom.hudMissionTitle.textContent = mission.title;
    }

    if (dom.hudObjective) {
      dom.hudObjective.textContent = mission.objective;
    }

    if (dom.objectiveCount) {
      dom.objectiveCount.textContent =
        `${Math.min(state.progress, mission.target)} / ${mission.target}`;
    }

    if (dom.objectiveProgress) {
      const percent = Math.min(
        100,
        (state.progress / mission.target) * 100
      );

      dom.objectiveProgress.style.width = `${percent}%`;
    }

    if (dom.hudLocation) {
      const x = Math.round(state.player.x);
      const z = Math.round(state.player.z);

      dom.hudLocation.textContent = `Pozisyon: ${x}, ${z}`;
    }

    if (dom.hudTimer) {
      dom.hudTimer.textContent = formatTime(state.elapsedTime);
    }

    if (dom.btnNextMission) {
      dom.btnNextMission.hidden =
        state.missionIndex >= MISSIONS.length - 1;
    }
  }

  function formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(total / 60);
    const secs = total % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  /* ============================================================
     PWOGRÈ MISYON
     ============================================================ */

  function updateMissionProgress() {
    const mission = MISSIONS[state.missionIndex];

    if (!mission) return;

    if (mission.type === "explore") {
      state.progress = Math.min(
        mission.target,
        Math.floor(Math.hypot(state.player.x, state.player.z - 5))
      );
    }

    if (mission.type === "beacons") {
      state.progress = state.beaconsActivated;
    }

    if (mission.type === "combat") {
      state.progress = state.enemiesEliminated;
    }

    if (state.progress >= mission.target && !state.completed) {
      completeMission();
    }
  }

  function completeMission() {
    if (state.completed) return;

    const mission = MISSIONS[state.missionIndex];

    state.completed = true;
    state.running = false;
    state.paused = false;
    state.score += mission.reward;

    state.saved.unlockedMission = Math.max(
      state.saved.unlockedMission,
      Math.min(MISSIONS.length, state.missionIndex + 2)
    );

    state.saved.bestScore = Math.max(
      state.saved.bestScore,
      state.score
    );

    state.saved.totalMissionsCompleted += 1;

    stopGameLoop();

    if (dom.pauseMenu) dom.pauseMenu.hidden = true;
    if (dom.missionResult) dom.missionResult.hidden = false;

    if (dom.resultTitle) {
      dom.resultTitle.textContent = "MISYON REYISI!";
    }

    if (dom.resultDescription) {
      dom.resultDescription.textContent =
        `${mission.title} fini. Ou resevwa ${mission.reward} pwen rekonpans.`;
    }

    if (dom.resultScore) {
      dom.resultScore.textContent = String(state.score);
    }

    updateHUD();
    saveGame(false);
    notify("Felisitasyon! Ou reyisi misyon an.", 4000);
  }

  function failMission(message) {
    if (state.gameOver || state.completed) return;

    state.gameOver = true;
    state.running = false;
    state.paused = false;

    stopGameLoop();

    if (dom.pauseMenu) dom.pauseMenu.hidden = true;
    if (dom.missionResult) dom.missionResult.hidden = false;

    if (dom.resultTitle) {
      dom.resultTitle.textContent = "MISYON ECHWE";
    }

    if (dom.resultDescription) {
      dom.resultDescription.textContent = message;
    }

    if (dom.resultScore) {
      dom.resultScore.textContent = String(state.score);
    }

    if (dom.btnNextMission) {
      dom.btnNextMission.hidden = true;
    }

    updateHUD();
    notify(message, 4000);
  }

  function nextMission() {
    if (state.missionIndex >= MISSIONS.length - 1) {
      notify("Ou rive nan dènye misyon an. Felisitasyon!");
      backToMainMenu();
      return;
    }

    const nextNumber = state.missionIndex + 2;

    if (!selectMission(nextNumber)) return;

    startGame();
  }

  /* ============================================================
     AKSYON PÈSONAJ
     ============================================================ */

  function activateBeaconIfNear() {
    if (MISSIONS[state.missionIndex].type !== "beacons") {
      return false;
    }

    let nearest = null;
    let nearestDistance = Infinity;

    state.beacons.forEach((beacon) => {
      if (beacon.active) return;

      const distance = Math.hypot(
        state.player.x - beacon.x,
        state.player.z - beacon.z
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = beacon;
      }
    });

    if (!nearest || nearestDistance > 3.2) {
      notify("Pwoche bò kote yon baliz pou aktive li.");
      return false;
    }

    nearest.active = true;
    state.beaconsActivated += 1;
    state.score += 50;
    state.energy = Math.min(100, state.energy + 10);

    playSound("beacon");
    updateMissionProgress();
    updateHUD();

    notify(
      `Baliz aktive! ${state.beaconsActivated}/3`
    );

    return true;
  }

  function jump() {
    if (!state.running || state.paused) return;
    if (state.player.isJumping) return;
    if (state.energy < 5) {
      notify("Ou pa gen ase enèji pou sote.");
      return;
    }

    state.energy -= 5;
    state.player.isJumping = true;
    state.player.jumpVelocity = 6.5;

    playSound("jump");
    updateHUD();
  }

  function toggleRun() {
    state.player.runningFast = !state.player.runningFast;

    if (dom.btnRun) {
      dom.btnRun.classList.toggle(
        "active",
        state.player.runningFast
      );
    }

    notify(
      state.player.runningFast
        ? "Kouri aktive."
        : "Kouri dezaktive."
    );
  }

  function toggleCamera() {
    state.player.cameraMode =
      state.player.cameraMode === 0 ? 1 : 0;

    notify(
      state.player.cameraMode === 0
        ? "Kamera premye pèsonn."
        : "Kamera dèyè pèsonaj la."
    );

    renderFrame();
  }

  function pitchCamera() {
    state.player.pitch += 0.18;

    if (state.player.pitch > 0.8) {
      state.player.pitch = -0.4;
    }

    renderFrame();
    notify("Ang kamera a chanje.");
  }

  function performAction() {
    if (!state.running || state.paused) return;

    if (MISSIONS[state.missionIndex].type === "beacons") {
      activateBeaconIfNear();
      return;
    }

    shoot();
  }

  /* ============================================================
     TIRE
     ============================================================ */

  function shoot() {
    if (!state.running || state.paused || state.completed) return;

    const now = performance.now();

    if (now - lastShotTime < 250) return;
    lastShotTime = now;

    state.bullets.push({
      x: state.player.x,
      y: state.player.y + 1.4 + state.player.jumpHeight,
      z: state.player.z,
      yaw: state.player.yaw,
      pitch: state.player.pitch,
      speed: 35,
      life: 1.7
    });

    playSound("shoot");
  }

  function updateBullets(dt) {
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const bullet = state.bullets[i];

      const cosPitch = Math.cos(bullet.pitch);

      bullet.x += Math.sin(bullet.yaw) *
        bullet.speed * cosPitch * dt;

      bullet.y += Math.sin(bullet.pitch) *
        bullet.speed * dt;

      bullet.z -= Math.cos(bullet.yaw) *
        bullet.speed * cosPitch * dt;

      bullet.life -= dt;

      let hit = false;

      for (const enemy of state.enemies) {
        if (!enemy.alive) continue;

        const dx = bullet.x - enemy.x;
        const dy = bullet.y - (enemy.y + 1);
        const dz = bullet.z - enemy.z;

        const distance = Math.hypot(dx, dy, dz);

        if (distance < 1.05) {
          enemy.health -= 50;
          hit = true;

          if (enemy.health <= 0) {
            enemy.alive = false;
            state.enemiesEliminated += 1;
            state.score += 20;

            state.effects.push({
              x: enemy.x,
              y: enemy.y + 1,
              z: enemy.z,
              size: 0.8,
              life: 0.35
            });

            playSound("hit");
            updateMissionProgress();
            updateHUD();

            notify(
              `Advèsè elimine: ${state.enemiesEliminated}`
            );
          }

          break;
        }
      }

      if (hit || bullet.life <= 0) {
        state.bullets.splice(i, 1);
      }
    }
  }

  /* ============================================================
     MOUVMAN JWÈ A
     ============================================================ */

  function updatePlayer(dt) {
    const player = state.player;

    let forward =
      (state.keys.KeyW || state.keys.ArrowUp ? 1 : 0) -
      (state.keys.KeyS || state.keys.ArrowDown ? 1 : 0);

    let strafe =
      (state.keys.KeyD || state.keys.ArrowRight ? 1 : 0) -
      (state.keys.KeyA || state.keys.ArrowLeft ? 1 : 0);

    forward += -state.joystick.forward;
    strafe += state.joystick.strafe;

    const magnitude = Math.hypot(forward, strafe);

    if (magnitude > 1) {
      forward /= magnitude;
      strafe /= magnitude;
    }

    const baseSpeed = player.speed;
    const runMultiplier = player.runningFast ? 1.65 : 1;
    const energyFactor = state.energy <= 0 ? 0.7 : 1;

    const speed = baseSpeed * runMultiplier * energyFactor * dt;

    player.x += (
      Math.sin(player.yaw) * forward +
      Math.cos(player.yaw) * strafe
    ) * speed;

    player.z += (
      -Math.cos(player.yaw) * forward +
      Math.sin(player.yaw) * strafe
    ) * speed;

    player.x = Math.max(-45, Math.min(45, player.x));
    player.z = Math.max(-80, Math.min(15, player.z));

    if (player.runningFast && magnitude > 0.1) {
      state.energy = Math.max(0, state.energy - 8 * dt);
    } else {
      state.energy = Math.min(100, state.energy + 3 * dt);
    }

    if (player.isJumping) {
      player.jumpHeight += player.jumpVelocity * dt;
      player.jumpVelocity -= 16 * dt;

      if (player.jumpHeight <= 0) {
        player.jumpHeight = 0;
        player.jumpVelocity = 0;
        player.isJumping = false;
      }
    }

    updateMissionProgress();
  }

  /* ============================================================
     IA ADVÈSÈ
     ============================================================ */

  function updateEnemies(dt) {
    const player = state.player;

    state.enemies.forEach((enemy) => {
      if (!enemy.alive) return;

      const dx = player.x - enemy.x;
      const dz = player.z - enemy.z;
      const distance = Math.hypot(dx, dz);

      enemy.rotation = Math.atan2(dx, dz);

      if (distance > 3.2) {
        const enemySpeed = 0.55 * dt;

        enemy.x += dx / Math.max(distance, 0.001) * enemySpeed;
        enemy.z += dz / Math.max(distance, 0.001) * enemySpeed;
      } else {
        enemy.attackCooldown -= dt;

        if (enemy.attackCooldown <= 0) {
          state.health = Math.max(0, state.health - 5);
          enemy.attackCooldown = 1.5;

          updateHUD();

          if (state.health <= 0) {
            failMission(
              "Enèji lavi ou fini. Rekòmanse misyon an pou eseye ankò."
            );
          }
        }
      }
    });
  }

  function updateEffects(dt) {
    for (let i = state.effects.length - 1; i >= 0; i--) {
      const effect = state.effects[i];

      effect.life = (effect.life || 0.35) - dt;
      effect.size = Math.max(0.1, effect.size - dt * 1.2);

      if (effect.life <= 0) {
        state.effects.splice(i, 1);
      }
    }
  }

  /* ============================================================
     BOUK ANIMASYON
     ============================================================ */

  function gameLoop(timestamp) {
    state.raf = 0;

    if (!state.running || state.paused) {
      renderFrame();
      return;
    }

    const dt = Math.min(
      Math.max(0, (timestamp - state.lastFrame) / 1000),
      0.04
    );

    state.lastFrame = timestamp;
    state.elapsedTime = Math.max(
      0,
      (timestamp - state.startTime) / 1000
    );

    updatePlayer(dt);
    updateEnemies(dt);
    updateBullets(dt);
    updateEffects(dt);

    renderFrame();
    updateHUD();

    if (timestamp - lastSaveTime > 15000) {
      lastSaveTime = timestamp;
      saveGame(false);
    }

    if (state.running && !state.paused) {
      state.raf = requestAnimationFrame(gameLoop);
    }
  }

  /* ============================================================
     SON JWE A
     ============================================================ */

  function playSound(type) {
    if (!state.settings.sound) return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      if (!state.audioContext) {
        state.audioContext = new AudioContextClass();
      }

      const audio = state.audioContext;

      if (audio.state === "suspended") {
        audio.resume().catch(() => {});
      }

      const oscillator = audio.createOscillator();
      const gain = audio.createGain();

      const volume = Math.max(
        0,
        Math.min(1, state.settings.volume / 100)
      );

      const sounds = {
        shoot: { frequency: 170, duration: 0.08, wave: "square" },
        hit: { frequency: 500, duration: 0.11, wave: "triangle" },
        jump: { frequency: 340, duration: 0.12, wave: "sine" },
        beacon: { frequency: 720, duration: 0.20, wave: "sine" }
      };

      const sound = sounds[type] || sounds.hit;

      oscillator.type = sound.wave;
      oscillator.frequency.setValueAtTime(
        sound.frequency,
        audio.currentTime
      );

      gain.gain.setValueAtTime(
        volume * 0.07,
        audio.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audio.currentTime + sound.duration
      );

      oscillator.connect(gain);
      gain.connect(audio.destination);

      oscillator.start();
      oscillator.stop(audio.currentTime + sound.duration);
    } catch (error) {
      console.debug("Son pa disponib:", error);
    }
  }

  /* ============================================================
     KONTWÒL KLAVYE
     ============================================================ */

  function onKeyDown(event) {
    state.keys[event.code] = true;

    if (
      [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Space"
      ].includes(event.code)
    ) {
      event.preventDefault();
    }

    if (event.repeat) return;

    if (event.code === "Escape") {
      if (state.running) pauseGame();
      else if (state.paused) resumeGame();
    }

    if (event.code === "Space") jump();
    if (event.code === "KeyF") performAction();
    if (event.code === "KeyE") activateBeaconIfNear();
    if (event.code === "KeyC") toggleCamera();
    if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
      toggleRun();
    }
  }

  function onKeyUp(event) {
    state.keys[event.code] = false;

    if (
      event.code === "ShiftLeft" ||
      event.code === "ShiftRight"
    ) {
      state.player.runningFast = false;

      if (dom.btnRun) dom.btnRun.classList.remove("active");
    }
  }

  function resetInputState() {
    state.keys = Object.create(null);

    state.joystick.active = false;
    state.joystick.pointerId = null;
    state.joystick.x = 0;
    state.joystick.y = 0;
    state.joystick.forward = 0;
    state.joystick.strafe = 0;

    state.look.active = false;
    state.look.pointerId = null;

    if (dom.joystickKnob) {
      dom.joystickKnob.style.transform = "translate(0, 0)";
    }
  }

  /* ============================================================
     JOYSTICK TACTILE
     ============================================================ */

  function setupJoystick() {
    if (!dom.joystickZone || !dom.joystickBase) return;

    dom.joystickZone.style.touchAction = "none";
    dom.joystickBase.style.touchAction = "none";

    dom.joystickZone.addEventListener("pointerdown", (event) => {
      if (!state.running || state.paused) return;

      event.preventDefault();

      state.joystick.active = true;
      state.joystick.pointerId = event.pointerId;

      try {
        dom.joystickZone.setPointerCapture(event.pointerId);
      } catch (_) {}

      updateJoystickPosition(event);
    });

    dom.joystickZone.addEventListener("pointermove", (event) => {
      if (
        !state.joystick.active ||
        event.pointerId !== state.joystick.pointerId
      ) {
        return;
      }

      event.preventDefault();
      updateJoystickPosition(event);
    });

    const release = (event) => {
      if (event.pointerId !== state.joystick.pointerId) return;

      state.joystick.active = false;
      state.joystick.pointerId = null;
      state.joystick.x = 0;
      state.joystick.y = 0;
      state.joystick.forward = 0;
      state.joystick.strafe = 0;

      if (dom.joystickKnob) {
        dom.joystickKnob.style.transform = "translate(0, 0)";
      }
    };

    dom.joystickZone.addEventListener("pointerup", release);
    dom.joystickZone.addEventListener("pointercancel", release);
    dom.joystickZone.addEventListener("lostpointercapture", release);
  }

  function updateJoystickPosition(event) {
    const rect = dom.joystickBase.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;

    const maxRadius = Math.max(20, rect.width * 0.34);
    const distance = Math.hypot(dx, dy) || 1;

    if (distance > maxRadius) {
      dx = dx / distance * maxRadius;
      dy = dy / distance * maxRadius;
    }

    state.joystick.x = dx / maxRadius;
    state.joystick.y = dy / maxRadius;

    state.joystick.strafe = state.joystick.x;
    state.joystick.forward = state.joystick.y;

    if (dom.joystickKnob) {
      dom.joystickKnob.style.transform =
        `translate(${dx}px, ${dy}px)`;
    }
  }

  /* ============================================================
     KAMERA TACTILE AK PITCH 2
     ============================================================ */

  function setupCameraTouch() {
    if (!dom.canvas) return;

    dom.canvas.style.touchAction = "none";

    dom.canvas.addEventListener("pointerdown", (event) => {
      if (!state.running || state.paused) return;
      if (event.pointerType === "mouse") return;

      const rect = dom.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;

      // Bò dwat ekran an sèvi pou vire kamera.
      if (x < rect.width * 0.45) return;

      state.look.active = true;
      state.look.pointerId = event.pointerId;
      state.look.x = event.clientX;
      state.look.y = event.clientY;

      try {
        dom.canvas.setPointerCapture(event.pointerId);
      } catch (_) {}
    });

    dom.canvas.addEventListener("pointermove", (event) => {
      if (
        !state.look.active ||
        state.look.pointerId !== event.pointerId
      ) {
        return;
      }

      const dx = event.clientX - state.look.x;
      const dy = event.clientY - state.look.y;

      const sensitivity =
        Number(state.settings.sensitivity || 5) * 0.0009;

      state.player.yaw += dx * sensitivity;
      state.player.pitch -= dy * sensitivity;

      state.player.pitch = Math.max(
        -1.15,
        Math.min(1.15, state.player.pitch)
      );

      state.look.x = event.clientX;
      state.look.y = event.clientY;
    });

    const release = (event) => {
      if (event.pointerId !== state.look.pointerId) return;

      state.look.active = false;
      state.look.pointerId = null;
    };

    dom.canvas.addEventListener("pointerup", release);
    dom.canvas.addEventListener("pointercancel", release);
    dom.canvas.addEventListener("lostpointercapture", release);
  }

  /* ============================================================
     KONTWÒL SOURIS
     ============================================================ */

  function setupMouseControls() {
    if (!dom.canvas) return;

    dom.canvas.addEventListener("click", () => {
      if (!state.running || state.paused) return;

      if (dom.canvas.requestPointerLock) {
        dom.canvas.requestPointerLock();
      }
    });

    document.addEventListener("mousemove", (event) => {
      if (document.pointerLockElement !== dom.canvas) return;
      if (!state.running || state.paused) return;

      const sensitivity =
        Number(state.settings.sensitivity || 5) * 0.0007;

      state.player.yaw += event.movementX * sensitivity;
      state.player.pitch -= event.movementY * sensitivity;

      state.player.pitch = Math.max(
        -1.15,
        Math.min(1.15, state.player.pitch)
      );
    });
  }

  /* ============================================================
     BOUTON AKSYON HTML
     ============================================================ */

  function bindClick(element, callback) {
    if (!element) return;

    element.addEventListener("click", (event) => {
      event.preventDefault();
      callback();
    });
  }

  function setupButtons() {
    bindClick(dom.btnEnter, enterGame);

    bindClick(dom.btnPlay, () => {
      if (!selectMission(state.missionIndex + 1)) {
        selectMission(1);
      }

      startGame();
    });

    bindClick(dom.btnMissions, () => {
      showMainMenu("missions");
    });

    bindClick(dom.btnCharacters, () => {
      showMainMenu("characters");
    });

    bindClick(dom.btnSettings, () => {
      showMainMenu("settings");
    });

    bindClick(dom.btnContinue, async () => {
      await loadGameSave();
      selectMission(state.missionIndex + 1);
      startGame();
    });

    document.querySelectorAll("[data-select-mission]").forEach((button) => {
      bindClick(button, () => {
        const number = Number(
          button.getAttribute("data-select-mission")
        );

        if (selectMission(number)) {
          startGame();
        }
      });
    });

    document.querySelectorAll("[data-character]").forEach((button) => {
      bindClick(button, () => {
        selectCharacter(
          button.getAttribute("data-character")
        );
      });
    });

    document.querySelectorAll("[data-back-menu]").forEach((button) => {
      bindClick(button, () => showMainMenu());
    });

    bindClick(dom.btnConfirmCharacter, confirmCharacter);
    bindClick(dom.btnSaveSettings, saveSettings);

    bindClick(dom.btnPause, pauseGame);
    bindClick(dom.btnResume, resumeGame);
    bindClick(dom.btnRestart, restartMission);
    bindClick(dom.btnBackToMenu, backToMainMenu);

    bindClick(dom.btnNextMission, nextMission);
    bindClick(dom.btnResultMenu, backToMainMenu);

    bindClick(dom.btnJump, jump);
    bindClick(dom.btnRun, toggleRun);
    bindClick(dom.btnAction, performAction);
    bindClick(dom.btnCamera, toggleCamera);
    bindClick(dom.btnPitch2, pitchCamera);

    bindClick(dom.btnErrorClose, hideError);
  }

  function updateMobileControls() {
    if (!dom.mobileControls) return;

    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    dom.mobileControls.style.display =
      isTouchDevice ? "" : "";
  }

  /* ============================================================
     INISYALIZASYON
     ============================================================ */

  async function initialize() {
    if (state.initialized) return;

    setLoading(10, "Preparasyon motè grafik 3D...");

    try {
      initializeWebGL();

      setLoading(40, "Preparasyon mond jwèt la...");

      setupButtons();
      setupJoystick();
      setupCameraTouch();
      setupMouseControls();

      window.addEventListener("keydown", onKeyDown, {
        passive: false
      });

      window.addEventListener("keyup", onKeyUp);

      window.addEventListener("resize", () => {
        resizeRenderer();
        renderFrame();
      });

      document.addEventListener("visibilitychange", () => {
        if (document.hidden && state.running) {
          pauseGame();
        }
      });

      setLoading(65, "Preparasyon sovgad...");
      try {
        state.db = await openDatabase();
        await loadGameSave();
      } catch (error) {
        console.warn(
          `${APP}: IndexedDB pa disponib nan anviwònman sa a.`,
          error
        );

        updateSaveStatus(
          "Sovgad IndexedDB pa disponib nan navigatè sa a."
        );
      }

      applySettingsToControls();

      selectMission(state.missionIndex + 1);
      updateCharacterSelection();
      updateHUD();

      setLoading(100, "Motè a pare!");

      state.initialized = true;

      renderFrame();

      if (dom.btnEnter) {
        dom.btnEnter.disabled = false;
      }
    } catch (error) {
      console.error(`${APP}:`, error);

      if (dom.fallback) {
        dom.fallback.hidden = false;
        dom.fallback.textContent =
          "Mond jwèt la pa t kapab chaje. Verifye sipò WebGL navigatè a.";
      }

      showError(
        `Motè jwèt la pa t kapab demare: ${error.message}`
      );

      setLoading(100, "Erè pandan preparasyon motè a.");
    }
  }

  /* ============================================================
     API PUBLIK POU DEBAGAJ
     ============================================================ */

  window.FOBAS_MISSION_3D = {
    version: VERSION,

    startGame,
    pauseGame,
    resumeGame,
    restartMission,
    backToMainMenu,

    selectMission,
    selectCharacter,
    confirmCharacter,

    shoot,
    jump,
    toggleRun,
    toggleCamera,
    pitchCamera,
    activateBeaconIfNear,

    saveGame,
    loadGameSave,
    updateHUD,

    getState() {
      return {
        initialized: state.initialized,
        running: state.running,
        paused: state.paused,
        completed: state.completed,
        gameOver: state.gameOver,

        mission: state.missionIndex + 1,
        character: state.character,

        score: state.score,
        health: state.health,
        energy: state.energy,

        progress: state.progress,
        enemiesEliminated: state.enemiesEliminated,
        beaconsActivated: state.beaconsActivated
      };
    }
  };

  /* ============================================================
     LANSE MOTÈ A
     ============================================================ */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, {
      once: true
    });
  } else {
    initialize();
  }
})();












