/* ============================================================
   FOBAS MISSION FORCE UNIE 3D
   Version 1.0.0
   Moteur : WebGL natif + géométrie 3D
   SVG : interface et illustrations vectorielles
   Stockage : IndexedDB
   Sans Three.js, sans three.module.js, sans dépendance externe
   ============================================================ */

(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const now = () => performance.now();

  const APP = {
    name: "FOBAS MISSION FORCE UNIE 3D",
    version: "1.0.0",
    dbName: "FOBAS_MISSION_FORCE_UNIE",
    dbVersion: 1,
    saveKey: "playerProgress"
  };

  const missions = [
    { title: "La première route", objective: "Rejoignez le point de rendez-vous.", distance: 650, reward: 100 },
    { title: "Le véhicule disparu", objective: "Explorez la zone et suivez les indices.", distance: 850, reward: 180 },
    { title: "Route endommagée", objective: "Franchissez les obstacles.", distance: 1000, reward: 260 },
    { title: "La force du convoi", objective: "Conduisez l'équipe à destination.", distance: 1200, reward: 350 },
    { title: "Mission en montagne", objective: "Atteignez la zone de secours.", distance: 1450, reward: 450 },
    { title: "Unis pour réussir", objective: "Terminez l'opération finale.", distance: 1700, reward: 700 }
  ];

  const characters = [
    { id: "meme", name: "MEME", role: "Chef de mission", color: "#23d6a0", skill: "Leadership" },
    { id: "nova", name: "NOVA", role: "Spécialiste tactique", color: "#58a6ff", skill: "Protection" },
    { id: "axel", name: "AXEL", role: "Pilote d'élite", color: "#ffb547", skill: "Accélération" }
  ];

  const game = {
    screen: "mainMenu",
    playing: false,
    paused: false,
    initialized: false,
    webglAvailable: false,
    db: null,
    saveAvailable: false,

    mission: 1,
    unlockedMission: 1,
    completed: [],
    credits: 0,

    distance: 0,
    speed: 0,
    maxSpeed: 110,
    carX: 0,
    steer: 0,
    health: 100,
    teamHealth: 100,

    vehicleLevel: 0,
    armorLevel: 0,
    handlingLevel: 0,

    cameraDistance: 8,
    cameraHeight: 4.3,
    cameraYaw: 0,
    cameraPitch: 0.2,
    cameraMode: 0,
    quality: "high",
    sensitivity: 1,
    volume: 0.65,
    vibration: true,
    subtitles: true,
    touchZoom: true,

    objectivesOpen: true,
    minimapOpen: true,

    input: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false,
      handbrake: false
    },

    obstacles: [],
    particles: [],
    elapsed: 0,
    lastFrame: 0,
    lastSave: 0,
    lastAutosave: 0,
    collisionCooldown: 0,
    toastTimer: 0,
    notificationTimer: 0,
    animationFrame: 0,

    selectedVehicle: 0,
    selectedCharacter: "meme",
    currentModalAction: null
  };

  /* ============================================================
     UTILITAIRES DOM
     ============================================================ */

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = String(value);
  }

  function setHidden(id, hidden) {
    const el = $(id);
    if (el) el.hidden = Boolean(hidden);
  }

  function setWidth(id, percent) {
    const el = $(id);
    if (el) el.style.width = `${clamp(percent, 0, 100)}%`;
  }

  function formatNumber(n) {
    return Math.max(0, Math.floor(n)).toLocaleString("fr-FR");
  }

  function toast(message, duration = 2600) {
    const box = $("globalToast");
    if (!box) {
      console.info("[FOBAS]", message);
      return;
    }

    const messageEl =
      $("globalToastMessage") ||
      box.querySelector(".toast-message") ||
      box;

    messageEl.textContent = message;
    box.hidden = false;

    clearTimeout(game.toastTimer);
    game.toastTimer = setTimeout(() => {
      box.hidden = true;
    }, duration);
  }

  function notify(title, message) {
    if (!game.subtitles) return;

    const box = $("gameNotification");
    if (!box) {
      toast(`${title} — ${message}`);
      return;
    }

    const titleEl = $("notificationTitle") ||
      box.querySelector(".notification-title");
    const messageEl = $("notificationMessage") ||
      box.querySelector(".notification-message");

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;

    box.hidden = false;

    clearTimeout(game.notificationTimer);
    game.notificationTimer = setTimeout(() => {
      box.hidden = true;
    }, 3200);
  }

  function showScreen(id) {
    const screenAliases = {
      menu: "mainMenu",
      game: "gameScreen",
      missions: "missionsScreen",
      garage: "garageScreen",
      settings: "settingsScreen",
      help: "helpScreen"
    };

    id = screenAliases[id] || id;

    const validScreens = [
      "mainMenu",
      "gameScreen",
      "missionsScreen",
      "garageScreen",
      "settingsScreen",
      "helpScreen"
    ];

    if (!validScreens.includes(id)) {
      console.warn("Écran inconnu :", id);
      return;
    }

    validScreens.forEach((screenId) => {
      const el = $(screenId);
      if (el) el.hidden = screenId !== id;
    });

    game.screen = id;

    if (id !== "gameScreen") {
      game.playing = false;
      game.paused = false;
      releaseAllControls();
    } else {
      game.playing = true;
      game.paused = false;
      game.lastFrame = now();
      requestPointerSetup();
    }

    updateInterface();
  }

  function requestPointerSetup() {
    if (!canvas) return;
    canvas.style.cursor = "crosshair";
  }

  function openModal(id) {
    const modal = $(id);
    if (modal) modal.hidden = false;
  }

  function closeModal(id) {
    const modal = $(id);
    if (modal) modal.hidden = true;
  }

  /* ============================================================
     INDEXEDDB
     ============================================================ */

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB indisponible"));
        return;
      }

      const request = indexedDB.open(APP.dbName, APP.dbVersion);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains("saves")) {
          db.createObjectStore("saves");
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function dbRead(key) {
    return new Promise((resolve, reject) => {
      if (!game.db) return reject(new Error("Base indisponible"));

      const tx = game.db.transaction("saves", "readonly");
      const request = tx.objectStore("saves").get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function dbWrite(key, value) {
    return new Promise((resolve, reject) => {
      if (!game.db) return reject(new Error("Base indisponible"));

      const tx = game.db.transaction("saves", "readwrite");
      tx.objectStore("saves").put(value, key);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  function serializeGame() {
    return {
      version: APP.version,
      mission: game.mission,
      unlockedMission: game.unlockedMission,
      completed: game.completed,
      credits: game.credits,
      distance: game.distance,
      health: game.health,
      teamHealth: game.teamHealth,
      vehicleLevel: game.vehicleLevel,
      armorLevel: game.armorLevel,
      handlingLevel: game.handlingLevel,
      selectedVehicle: game.selectedVehicle,
      selectedCharacter: game.selectedCharacter,
      settings: {
        cameraDistance: game.cameraDistance,
        cameraMode: game.cameraMode,
        quality: game.quality,
        sensitivity: game.sensitivity,
        volume: game.volume,
        vibration: game.vibration,
        subtitles: game.subtitles,
        touchZoom: game.touchZoom
      },
      savedAt: new Date().toISOString()
    };
  }

  function restoreGame(data) {
    if (!data || typeof data !== "object") return;

    game.mission = clamp(Number(data.mission) || 1, 1, missions.length);
    game.unlockedMission = clamp(
      Number(data.unlockedMission) || 1, 1, missions.length
    );

    game.completed = Array.isArray(data.completed)
      ? data.completed.filter(Number.isFinite)
      : [];

    game.credits = Math.max(0, Number(data.credits) || 0);
    game.distance = Math.max(0, Number(data.distance) || 0);
    game.health = clamp(Number(data.health) || 100, 0, 100);
    game.teamHealth = clamp(Number(data.teamHealth) || 100, 0, 100);
    game.vehicleLevel = clamp(Number(data.vehicleLevel) || 0, 0, 10);
    game.armorLevel = clamp(Number(data.armorLevel) || 0, 0, 10);
    game.handlingLevel = clamp(Number(data.handlingLevel) || 0, 0, 10);
    game.selectedVehicle = Math.max(0, Number(data.selectedVehicle) || 0);
    game.selectedCharacter = data.selectedCharacter || "meme";

    const s = data.settings || {};

    game.cameraDistance = clamp(Number(s.cameraDistance) || 8, 4, 15);
    game.cameraMode = clamp(Number(s.cameraMode) || 0, 0, 2);
    game.quality = s.quality || "high";
    game.sensitivity = clamp(Number(s.sensitivity) || 1, 0.4, 2);
    game.volume = clamp(Number(s.volume) || 0.65, 0, 1);
    game.vibration = s.vibration !== false;
    game.subtitles = s.subtitles !== false;
    game.touchZoom = s.touchZoom !== false;
  }

  async function saveGame(showMessage = true) {
    try {
      if (!game.db) throw new Error("IndexedDB indisponible");

      await dbWrite(APP.saveKey, serializeGame());
      game.lastSave = Date.now();

      setText("saveSummary", "Progression sauvegardée");
      setText("saveStatus", "Sauvegarde réussie");

      if (showMessage) toast("Progression sauvegardée.");
      return true;
    } catch (error) {
      console.warn("Sauvegarde impossible :", error);
      setText("saveStatus", "Sauvegarde indisponible");

      if (showMessage) {
        toast("Impossible d'enregistrer. Vérifiez le navigateur.");
      }
      return false;
    }
  }

  async function initializeStorage() {
    try {
      game.db = await openDatabase();
      game.saveAvailable = true;

      const data = await dbRead(APP.saveKey);
      if (data) {
        restoreGame(data);
        setText("saveSummary", "Progression précédente restaurée");
      } else {
        setText("saveSummary", "Nouvelle partie");
      }
    } catch (error) {
      game.db = null;
      game.saveAvailable = false;
      console.warn("Mode sans sauvegarde permanente :", error);
      setText("saveSummary", "Mode temporaire");
    }

    updateInterface();
  }

  /* ============================================================
     WEBGL NATIF
     ============================================================ */

  let canvas = null;
  let gl = null;
  let shaderProgram = null;
  let vertexBuffer = null;
  let aPosition = -1;
  let uModel = null;
  let uView = null;
  let uProjection = null;
  let uColor = null;
  let uLight = null;
  let vertexData = null;

  const mat4 = {
    identity() {
      return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
    },

    multiply(a, b) {
      const out = new Float32Array(16);

      for (let c = 0; c < 4; c++) {
        for (let r = 0; r < 4; r++) {
          out[c * 4 + r] =
            a[r] * b[c * 4] +
            a[4 + r] * b[c * 4 + 1] +
            a[8 + r] * b[c * 4 + 2] +
            a[12 + r] * b[c * 4 + 3];
        }
      }

      return out;
    },

    translate(x, y, z) {
      const m = mat4.identity();
      m[12] = x;
      m[13] = y;
      m[14] = z;
      return m;
    },

    scale(x, y, z) {
      const m = mat4.identity();
      m[0] = x;
      m[5] = y;
      m[10] = z;
      return m;
    },

    rotateY(angle) {
      const c = Math.cos(angle);
      const s = Math.sin(angle);

      return new Float32Array([
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1
      ]);
    },

    rotateX(angle) {
      const c = Math.cos(angle);
      const s = Math.sin(angle);

      return new Float32Array([
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1
      ]);
    },

    perspective(fov, aspect, near, far) {
      const f = 1 / Math.tan(fov / 2);
      const nf = 1 / (near - far);

      return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, 2 * far * near * nf, 0
      ]);
    },

    lookAt(eye, target, up) {
      let zx = eye[0] - target[0];
      let zy = eye[1] - target[1];
      let zz = eye[2] - target[2];

      let len = Math.hypot(zx, zy, zz) || 1;
      zx /= len; zy /= len; zz /= len;

      let xx = up[1] * zz - up[2] * zy;
      let xy = up[2] * zx - up[0] * zz;
      let xz = up[0] * zy - up[1] * zx;

      len = Math.hypot(xx, xy, xz) || 1;
      xx /= len; xy /= len; xz /= len;

      const yx = zy * xz - zz * xy;
      const yy = zz * xx - zx * xz;
      const yz = zx * xy - zy * xx;

      return new Float32Array([
        xx, yx, zx, 0,
        xy, yy, zy, 0,
        xz, yz, zz, 0,
        -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
        -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
        -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
        1
      ]);
    }
  };

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message || "Erreur de compilation shader");
    }

    return shader;
  }

  function createCubeVertices() {
    const faces = [
      // Face avant
      [-1,-1, 1,  1,-1, 1,  1, 1, 1,  -1,-1, 1,  1, 1, 1,  -1, 1, 1],
      // Face arrière
      [1,-1,-1, -1,-1,-1, -1,1,-1,  1,-1,-1, -1,1,-1, 1,1,-1],
      // Face droite
      [1,-1,1, 1,-1,-1, 1,1,-1,  1,-1,1, 1,1,-1, 1,1,1],
      // Face gauche
      [-1,-1,-1, -1,-1,1, -1,1,1,  -1,-1,-1, -1,1,1, -1,1,-1],
      // Face supérieure
      [-1,1,1, 1,1,1, 1,1,-1,  -1,1,1, 1,1,-1, -1,1,-1],
      // Face inférieure
      [-1,-1,-1, 1,-1,-1, 1,-1,1,  -1,-1,-1, 1,-1,1, -1,-1,1]
    ];

    return new Float32Array(faces.flat());
  }

  function initWebGL() {
    const container = $("sceneContainer");
    if (!container) {
      throw new Error("Le conteneur #sceneContainer est absent du HTML.");
    }

    canvas = document.createElement("canvas");
    canvas.id = "fobas3DCanvas";
    canvas.setAttribute("aria-label", "Univers 3D interactif FOBAS");

    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
      touchAction: "none",
      outline: "none"
    });

    if (getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }

    container.style.overflow = "hidden";
    container.appendChild(canvas);

    gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: true,
      depth: true,
      powerPreference: "high-performance"
    });

    if (!gl) {
      throw new Error("WebGL n'est pas pris en charge par ce navigateur.");
    }

    const vertexSource = `
      attribute vec3 aPosition;
      uniform mat4 uModel;
      uniform mat4 uView;
      uniform mat4 uProjection;
      varying vec3 vPosition;

      void main() {
        vPosition = aPosition;
        gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
      }
    `;

    const fragmentSource = `
      precision mediump float;
      uniform vec4 uColor;
      uniform vec3 uLight;
      varying vec3 vPosition;

      void main() {
        float shade = 0.78 + 0.22 * max(dot(normalize(vPosition + vec3(0.001)), normalize(uLight)), 0.0);
        gl_FragColor = vec4(uColor.rgb * shade, uColor.a);
      }
    `;

    const vs = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vs);
    gl.attachShader(shaderProgram, fs);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(shaderProgram) || "Erreur WebGL");
    }

    gl.useProgram(shaderProgram);

    aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
    uModel = gl.getUniformLocation(shaderProgram, "uModel");
    uView = gl.getUniformLocation(shaderProgram, "uView");
    uProjection = gl.getUniformLocation(shaderProgram, "uProjection");
    uColor = gl.getUniformLocation(shaderProgram, "uColor");
    uLight = gl.getUniformLocation(shaderProgram, "uLight");

    vertexBuffer = gl.createBuffer();
    vertexData = createCubeVertices();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.clearColor(0.39, 0.67, 0.84, 1);

    game.webglAvailable = true;
    resizeCanvas();
    createWorld();
  }

  function resizeCanvas() {
    if (!canvas || !gl) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      game.quality === "low" ? 1 : game.quality === "medium" ? 1.5 : 2
    );

    const width = Math.floor(rect.width * dpr);
    const height = Math.floor(rect.height * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function drawCube(x, y, z, sx, sy, sz, color, rotationY = 0) {
    if (!gl) return;

    let model = mat4.translate(x, y, z);
    model = mat4.multiply(model, mat4.rotateY(rotationY));
    model = mat4.multiply(model, mat4.scale(sx, sy, sz));

    gl.uniformMatrix4fv(uModel, false, model);
    gl.uniform4fv(uColor, color);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }

  const COLORS = {
    grass: [0.10, 0.34, 0.20, 1],
    grassLight: [0.14, 0.43, 0.25, 1],
    road: [0.18, 0.20, 0.23, 1],
    roadLine: [0.95, 0.83, 0.45, 1],
    tire: [0.045, 0.05, 0.06, 1],
    rubber: [0.12, 0.13, 0.14, 1],
    white: [0.88, 0.91, 0.94, 1],
    window: [0.12, 0.34, 0.46, 1],
    red: [0.82, 0.10, 0.12, 1],
    green: [0.04, 0.64, 0.38, 1],
    blue: [0.12, 0.40, 0.92, 1],
    yellow: [0.95, 0.66, 0.10, 1],
    tree: [0.08, 0.29, 0.16, 1],
    trunk: [0.30, 0.18, 0.11, 1],
    building: [0.55, 0.58, 0.60, 1],
    buildingLight: [0.76, 0.78, 0.77, 1],
    obstacle: [0.91, 0.36, 0.08, 1]
  };

  /* ============================================================
     MONDE 3D : ROUTE, VÉHICULE, ARBRES, BÂTIMENTS
     ============================================================ */

  function createWorld() {
    game.obstacles = [];

    for (let i = 0; i < 22; i++) {
      game.obstacles.push({
        z: -18 - i * 17 - Math.random() * 9,
        x: Math.random() > 0.5 ? -3.7 : 3.7,
        type: Math.random() > 0.5 ? "barrier" : "cone",
        passed: false
      });
    }
  }

  function drawVehicle() {
    const x = game.carX;
    const yaw = -game.steer * 0.18;

    // Ombre géométrique
    drawCube(x, 0.05, 0.2, 0.98, 0.035, 1.65, [0.04, 0.05, 0.06, 0.35], yaw);

    // Châssis
    drawCube(x, 0.48, 0.15, 0.88, 0.25, 1.55, COLORS.green, yaw);

    // Capot avant
    drawCube(x, 0.62, -0.92, 0.79, 0.19, 0.55, [0.06, 0.77, 0.46, 1], yaw);

    // Habitacle
    drawCube(x, 0.89, 0.35, 0.60, 0.38, 0.78, [0.06, 0.49, 0.34, 1], yaw);

    // Pare-brise
    drawCube(x, 1.00, -0.26, 0.52, 0.23, 0.045, COLORS.window, yaw);

    // Vitre arrière
    drawCube(x, 1.00, 0.90, 0.51, 0.22, 0.045, COLORS.window, yaw);

    // Pare-chocs
    drawCube(x, 0.35, -1.63, 0.87, 0.12, 0.11, COLORS.white, yaw);
    drawCube(x, 0.35, 1.77, 0.87, 0.12, 0.11, COLORS.white, yaw);

    // Roues
    [-0.91, 0.91].forEach((wx) => {
      [-1.05, 1.10].forEach((wz) => {
        drawCube(x + wx, 0.34, wz, 0.19, 0.34, 0.35, COLORS.tire, yaw);
        drawCube(x + wx * 1.015, 0.34, wz, 0.09, 0.19, 0.19, COLORS.rubber, yaw);
      });
    });

    // Phares
    drawCube(x - 0.56, 0.58, -1.51, 0.16, 0.09, 0.035, [1, 0.94, 0.65, 1], yaw);
    drawCube(x + 0.56, 0.58, -1.51, 0.16, 0.09, 0.035, [1, 0.94, 0.65, 1], yaw);

    // Feux arrière
    drawCube(x - 0.57, 0.57, 1.73, 0.12, 0.08, 0.035, [1, 0.08, 0.06, 1], yaw);
    drawCube(x + 0.57, 0.57, 1.73, 0.12, 0.08, 0.035, [1, 0.08, 0.06, 1], yaw);
  }

  function drawTree(x, z, scale = 1) {
    drawCube(x, 0.65 * scale, z, 0.18 * scale, 0.72 * scale, 0.18 * scale, COLORS.trunk);
    drawCube(x, 1.65 * scale, z, 0.68 * scale, 0.78 * scale, 0.68 * scale, COLORS.tree);
    drawCube(x, 2.25 * scale, z, 0.45 * scale, 0.52 * scale, 0.45 * scale, COLORS.grassLight);
  }

  function drawBuilding(x, z, scale = 1) {
    drawCube(x, 0.95 * scale, z, 0.95 * scale, 0.95 * scale, 0.85 * scale, COLORS.building);
    drawCube(x, 1.95 * scale, z, 1.00 * scale, 0.10 * scale, 0.90 * scale, COLORS.buildingLight);

    [-0.48, 0.48].forEach((wx) => {
      drawCube(
        x + wx * scale,
        1.05 * scale,
        z - 0.87 * scale,
        0.16 * scale,
        0.23 * scale,
        0.035 * scale,
        COLORS.window
      );
    });
  }

  function drawObstacle(obstacle) {
    const z = obstacle.z;

    if (obstacle.type === "barrier") {
      drawCube(obstacle.x, 0.48, z, 0.80, 0.15, 0.17, COLORS.obstacle);
      drawCube(obstacle.x - 0.55, 0.22, z, 0.09, 0.28, 0.10, COLORS.white);
      drawCube(obstacle.x + 0.55, 0.22, z, 0.09, 0.28, 0.10, COLORS.white);
    } else {
      drawCube(obstacle.x, 0.28, z, 0.25, 0.28, 0.25, COLORS.yellow);
      drawCube(obstacle.x, 0.56, z, 0.15, 0.06, 0.15, COLORS.white);
    }
  }

  function drawRoad() {
    // Terrain de chaque côté de la chaussée
    drawCube(-11, -0.20, -42, 9.5, 0.12, 62, COLORS.grass);
    drawCube(11, -0.20, -42, 9.5, 0.12, 62, COLORS.grassLight);

    // Chaussée
    drawCube(0, -0.08, -42, 4.0, 0.10, 65, COLORS.road);

    // Accotements
    drawCube(-4.05, -0.04, -42, 0.12, 0.08, 65, COLORS.white);
    drawCube(4.05, -0.04, -42, 0.12, 0.08, 65, COLORS.white);

    // Marquage central animé
    const offset = (game.distance * 0.12) % 5;

    for (let i = 0; i < 14; i++) {
      drawCube(
        0,
        0.035,
        -i * 5 + offset - 10,
        0.055,
        0.025,
        1.35,
        COLORS.roadLine
      );
    }
  }

  function drawScenery() {
    for (let i = 0; i < 9; i++) {
      const z = -i * 9 - 8 + ((game.distance * 0.1) % 9);

      drawTree(-6.4, z, 0.85 + (i % 3) * 0.08);
      drawTree(6.6, z - 3, 0.90 + (i % 2) * 0.12);

      if (i % 3 === 0) {
        drawBuilding(-9.4, z - 5, 0.75);
        drawBuilding(9.5, z - 7, 0.85);
      }
    }
  }

  function drawWorld3D() {
    if (!gl || !canvas) return;

    resizeCanvas();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(shaderProgram);

    const aspect = canvas.width / Math.max(1, canvas.height);
    const projection = mat4.perspective(
      Math.PI / 3.2,
      aspect,
      0.1,
      160
    );

    const d = game.cameraDistance;
    const yaw = game.cameraYaw;

    const eye = [
      game.carX + Math.sin(yaw) * d,
      game.cameraHeight + game.cameraPitch * 2,
      3.2 + Math.cos(yaw) * d
    ];

    const target = [game.carX, 0.7, -5];

    const view = mat4.lookAt(eye, target, [0, 1, 0]);

    gl.uniformMatrix4fv(uProjection, false, projection);
    gl.uniformMatrix4fv(uView, false, view);
    gl.uniform3fv(uLight, new Float32Array([-0.4, 0.9, 0.5]));

    drawRoad();
    drawScenery();

    for (const obstacle of game.obstacles) {
      drawObstacle(obstacle);
    }

    drawVehicle();
  }

  /* ============================================================
     SCÈNE DE SECOURS SI WEBGL N'EST PAS DISPONIBLE
     ============================================================ */

  function showGraphicsError(error) {
    console.error("FOBAS 3D :", error);

    const fallback = $("sceneFallback");
    if (fallback) fallback.hidden = false;

    const message = fallback?.querySelector(".fallback-message");
    if (message) {
      message.textContent =
        "Le rendu 3D WebGL est indisponible. Activez WebGL dans le navigateur ou utilisez un appareil compatible.";
    }

    toast("Impossible d'initialiser le moteur WebGL.");
  }

  /* ============================================================
     CONTRÔLES DU JEU
     ============================================================ */

  function setInput(name, active) {
    if (!(name in game.input)) return;
    game.input[name] = active;
  }

  function releaseAllControls() {
    Object.keys(game.input).forEach((key) => {
      game.input[key] = false;
    });

    game.steer = 0;
  }

  function bindHoldButton(id, inputName) {
    const el = $(id);
    if (!el) return;

    const start = (event) => {
      event.preventDefault();
      setInput(inputName, true);
      el.classList.add("is-active");
    };

    const stop = (event) => {
      if (event) event.preventDefault();
      setInput(inputName, false);
      el.classList.remove("is-active");
    };

    el.addEventListener("pointerdown", start);
    el.addEventListener("pointerup", stop);
    el.addEventListener("pointercancel", stop);
    el.addEventListener("lostpointercapture", stop);
    el.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  function setupKeyboard() {
    window.addEventListener("keydown", (event) => {
      if (event.repeat) return;

      const key = event.key.toLowerCase();

      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
        if (game.screen === "gameScreen") event.preventDefault();
      }

      if (key === "w" || key === "arrowup") setInput("forward", true);
      if (key === "s" || key === "arrowdown") setInput("backward", true);
      if (key === "a" || key === "arrowleft") setInput("left", true);
      if (key === "d" || key === "arrowright") setInput("right", true);
      if (key === " ") setInput("brake", true);

      if (key === "escape" || key === "p") {
        if (game.screen === "gameScreen") togglePause();
      }

      if (key === "c") cycleCamera();
    });

    window.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();

      if (key === "w" || key === "arrowup") setInput("forward", false);
      if (key === "s" || key === "arrowdown") setInput("backward", false);
      if (key === "a" || key === "arrowleft") setInput("left", false);
      if (key === "d" || key === "arrowright") setInput("right", false);
      if (key === " ") setInput("brake", false);
    });

    window.addEventListener("blur", releaseAllControls);
  }

  function setupTouchControls() {
    bindHoldButton("accelerateButton", "forward");
    bindHoldButton("reverseButton", "backward");
    bindHoldButton("brakeButton", "brake");
    bindHoldButton("leftButton", "left");
    bindHoldButton("rightButton", "right");

    bindHoldButton("driveForwardButton", "forward");
    bindHoldButton("driveReverseButton", "backward");
    bindHoldButton("steerLeftButton", "left");
    bindHoldButton("steerRightButton", "right");
  }

  /* ============================================================
     ZOOM À DEUX DOIGTS SUR ANDROID
     ============================================================ */

  function setupPinchZoom() {
    const viewport = $("gameViewport") || $("sceneContainer");
    if (!viewport) return;

    const points = new Map();
    let initialDistance = 0;
    let initialZoom = game.cameraDistance;

    function distance(a, b) {
      return Math.hypot(a.x - b.x, a.y - b.y);
    }

    viewport.addEventListener("pointerdown", (event) => {
      points.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY
      });

      if (points.size === 2 && game.touchZoom) {
        const arr = [...points.values()];
        initialDistance = distance(arr[0], arr[1]);
        initialZoom = game.cameraDistance;
      }
    }, { passive: true });

    viewport.addEventListener("pointermove", (event) => {
      if (!points.has(event.pointerId)) return;

      points.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY
      });

      if (points.size === 2 && game.touchZoom && initialDistance > 0) {
        const arr = [...points.values()];
        const currentDistance = distance(arr[0], arr[1]);
        const ratio = initialDistance / Math.max(1, currentDistance);

        game.cameraDistance = clamp(initialZoom * ratio, 4, 15);
      }
    }, { passive: true });

    ["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
      viewport.addEventListener(type, (event) => {
        points.delete(event.pointerId);

        if (points.size < 2) initialDistance = 0;
      }, { passive: true });
    });

    viewport.addEventListener("wheel", (event) => {
      if (game.screen !== "gameScreen") return;

      game.cameraDistance = clamp(
        game.cameraDistance + Math.sign(event.deltaY) * 0.5,
        4,
        15
      );
    }, { passive: true });
  }

  /* ============================================================
     CAMÉRA
     ============================================================ */

  function cycleCamera() {
    game.cameraMode = (game.cameraMode + 1) % 3;

    if (game.cameraMode === 0) {
      game.cameraDistance = 8;
      game.cameraHeight = 4.3;
      game.cameraPitch = 0.2;
    } else if (game.cameraMode === 1) {
      game.cameraDistance = 5.2;
      game.cameraHeight = 2.9;
      game.cameraPitch = 0.12;
    } else {
      game.cameraDistance = 11;
      game.cameraHeight = 6.4;
      game.cameraPitch = 0.35;
    }

    toast(`Caméra ${game.cameraMode + 1}/3`);
  }

  /* ============================================================
     PHYSIQUE, COLLISIONS, MISSIONS
     ============================================================ */

  function spawnObstacle() {
    const side = Math.random() < 0.5 ? -3.1 : 3.1;

    game.obstacles.push({
      x: side + (Math.random() - 0.5) * 0.8,
      z: -125,
      type: Math.random() > 0.45 ? "barrier" : "cone",
      passed: false
    });
  }

  function updateObstacles(dt) {
    const move = game.speed * dt * 0.16;

    game.obstacles.forEach((obstacle) => {
      obstacle.z += move;

      if (
        !obstacle.passed &&
        obstacle.z > -2.2 &&
        obstacle.z < 2.0 &&
        Math.abs(obstacle.x - game.carX) < 1.35 &&
        game.collisionCooldown <= 0
      ) {
        obstacle.passed = true;
        game.collisionCooldown = 1.3;

        const damage = Math.max(5, 15 - game.armorLevel);
        game.health = clamp(game.health - damage, 0, 100);
        game.speed *= 0.35;

        notify("Collision !", `Le véhicule a perdu ${damage}% de santé.`);

        if (game.vibration && navigator.vibrate) {
          navigator.vibrate(100);
        }

        if (game.health <= 0) {
          finishMission(false);
        }
      }
    });

    game.obstacles = game.obstacles.filter((obstacle) => obstacle.z < 12);

    if (game.obstacles.length < 15 && Math.random() < 0.04) {
      spawnObstacle();
    }
  }

  function updatePhysics(dt) {
    if (!game.playing || game.paused) return;

    const input = game.input;
    const maxSpeed = game.maxSpeed + game.vehicleLevel * 4;

    if (input.forward) {
      game.speed += 34 * dt;
    } else if (input.backward) {
      game.speed -= 22 * dt;
    } else {
      game.speed -= 9 * dt;
    }

    if (input.brake || input.handbrake) {
      game.speed -= 48 * dt;
    }

    game.speed = clamp(game.speed, 0, maxSpeed);

    let direction = 0;
    if (input.left) direction -= 1;
    if (input.right) direction += 1;

    game.steer = lerp(
      game.steer,
      direction,
      clamp(dt * 6 * game.sensitivity, 0, 1)
    );

    const steeringPower = 2.1 + game.handlingLevel * 0.12;
    game.carX += game.steer * steeringPower * dt * (0.4 + game.speed / 80);
    game.carX = clamp(game.carX, -3.05, 3.05);

    game.distance += game.speed * dt * 0.36;
    game.collisionCooldown = Math.max(0, game.collisionCooldown - dt);

    updateObstacles(dt);

    game.elapsed += dt;

    if (game.distance >= missions[game.mission - 1].distance) {
      finishMission(true);
    }

    if (Date.now() - game.lastAutosave > 20000) {
      game.lastAutosave = Date.now();
      saveGame(false);
    }

    updateHUD();
  }

  function startMission(missionNumber = game.mission) {
    const n = clamp(Number(missionNumber) || 1, 1, missions.length);

    if (n > game.unlockedMission) {
      toast("Terminez la mission précédente pour la débloquer.");
      return;
    }

    game.mission = n;
    game.distance = 0;
    game.speed = 0;
    game.carX = 0;
    game.steer = 0;
    game.health = 100;
    game.teamHealth = 100;
    game.collisionCooldown = 0;
    game.lastFrame = now();

    createWorld();
    updateMissionInterface();
    showScreen("gameScreen");

    notify(
      `Mission ${n}`,
      missions[n - 1].objective
    );
  }

  async function finishMission(success) {
    if (!game.playing) return;

    game.playing = false;
    game.paused = false;
    releaseAllControls();

    if (success) {
      const mission = missions[game.mission - 1];

      if (!game.completed.includes(game.mission)) {
        game.completed.push(game.mission);
        game.credits += mission.reward;
      }

      game.unlockedMission = Math.min(
        missions.length,
        Math.max(game.unlockedMission, game.mission + 1)
      );

      setText("resultTitle", "Mission réussie !");
      setText("resultMessage", mission.title);
      setText("resultReward", `${mission.reward} crédits`);
    } else {
      setText("resultTitle", "Mission terminée");
      setText("resultMessage", "Votre véhicule doit être réparé.");
      setText("resultReward", "0 crédit");
    }

    setText("resultDistance", `${Math.floor(game.distance)} m`);
    setText("resultHealth", `${Math.floor(game.health)}%`);

    updateInterface();
    await saveGame(false);

    if ($("resultOverlay")) {
      $("resultOverlay").hidden = false;
    } else {
      showScreen("mainMenu");
      toast(success ? "Mission réussie !" : "Mission échouée.");
    }
  }

  function restartCurrentMission() {
    closeModal("resultOverlay");
    startMission(game.mission);
  }

  /* ============================================================
     PAUSE ET REPRISE
     ============================================================ */

  function togglePause(force) {
    if (game.screen !== "gameScreen") return;

    game.paused = typeof force === "boolean" ? force : !game.paused;

    if (game.paused) {
      releaseAllControls();
      setHidden("pauseOverlay", false);
    } else {
      setHidden("pauseOverlay", true);
      game.lastFrame = now();
    }
  }

  /* ============================================================
     HUD, BARRES, MINIMAP
     ============================================================ */

  function updateHUD() {
    const mission = missions[game.mission - 1];
    const progress = mission
      ? clamp((game.distance / mission.distance) * 100, 0, 100)
      : 0;

    setText("speedValue", Math.round(game.speed));
    setText("speedDisplay", Math.round(game.speed));
    setText("distanceValue", `${Math.floor(game.distance)} m`);
    setText("missionNumber", `MISSION ${String(game.mission).padStart(2, "0")}`);
    setText("missionTitle", mission?.title || "Mission");
    setText("objectiveText", mission?.objective || "");
    setText("creditValue", formatNumber(game.credits));
    setText("creditsValue", formatNumber(game.credits));

    setWidth("healthFill", game.health);
    setWidth("healthBar", game.health);
    setWidth("teamFill", game.teamHealth);
    setWidth("teamHealthFill", game.teamHealth);
    setWidth("missionProgressFill", progress);
    setWidth("missionProgressBar", progress);
    setWidth("speedMeterFill", (game.speed / game.maxSpeed) * 100);

    drawMinimap();
  }

  function drawMinimap() {
    const map = $("minimapCanvas");
    if (!map) return;

    const ctx = map.getContext("2d");
    if (!ctx) return;

    const w = map.width;
    const h = map.height;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#102b24";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#353b40";
    ctx.fillRect(w * 0.34, 0, w * 0.32, h);

    ctx.strokeStyle = "#e4cf75";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 0);
    ctx.lineTo(w * 0.5, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#38e4ad";
    ctx.beginPath();
    ctx.arc(
      w * (0.5 + game.carX / 15),
      h * 0.76,
      Math.max(4, w * 0.035),
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#ffba52";
    game.obstacles.forEach((o) => {
      if (o.z < -2 && o.z > -110) {
        const x = w * (0.5 + o.x / 15);
        const y = h * (0.75 + o.z / 150);
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
    });
  }

  function updateMissionInterface() {
    const grid = $("missionGrid");
    if (!grid) return;

    const existing = grid.querySelectorAll("[data-generated-mission]");
    existing.forEach((el) => el.remove());

    missions.forEach((mission, index) => {
      const n = index + 1;
      const card = document.createElement("article");

      card.className = "mission-card";
      card.dataset.generatedMission = "true";

      const isLocked = n > game.unlockedMission;
      const isCompleted = game.completed.includes(n);

      const title = document.createElement("h3");
      title.textContent = `${String(n).padStart(2, "0")} · ${mission.title}`;

      const description = document.createElement("p");
      description.textContent = mission.objective;

      const reward = document.createElement("p");
      reward.textContent = `Récompense : ${mission.reward} crédits`;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "mission-start-button";
      button.textContent = isCompleted
        ? "Rejouer"
        : isLocked
          ? "Verrouillée"
          : "Commencer";

      button.disabled = isLocked;
      button.addEventListener("click", () => startMission(n));

      card.append(title, description, reward, button);

      if (isCompleted) card.classList.add("is-completed");
      if (isLocked) card.classList.add("is-locked");

      grid.appendChild(card);
    });
  }

  function updateInterface() {
    setText("creditValue", formatNumber(game.credits));
    setText("creditsValue", formatNumber(game.credits));
    setText("completedMissions", game.completed.length);
    setText("unlockedMissions", game.unlockedMission);
    setText("vehicleLevel", game.vehicleLevel);
    setText("vehicleSpeed", game.maxSpeed + game.vehicleLevel * 4);
    setText("vehicleArmor", 75 + game.armorLevel * 3);
    setText("vehicleHandling", 70 + game.handlingLevel * 3);

    updateHUD();
    updateMissionInterface();
    updateSettingsUI();
  }

  /* ============================================================
     GARAGE ET AMÉLIORATIONS
     ============================================================ */

  function upgradeVehicle(type) {
    const levelMap = {
      speed: "vehicleLevel",
      armor: "armorLevel",
      handling: "handlingLevel"
    };

    const property = levelMap[type];
    if (!property) return;

    const level = game[property];
    if (level >= 10) {
      toast("Amélioration maximale atteinte.");
      return;
    }

    const cost = 100 + level * 125;

    if (game.credits < cost) {
      toast(`Il vous faut ${cost} crédits.`);
      return;
    }

    game.credits -= cost;
    game[property]++;

    toast(`Amélioration achetée : ${type}.`);
    updateInterface();
    saveGame(false);
  }

  /* ============================================================
     CAPACITÉS DES PERSONNAGES
     ============================================================ */

  function activateAbility(characterId) {
    if (game.abilityUsed && game.abilityUsed[characterId]) {
      toast("Cette capacité est déjà utilisée pendant cette mission.");
      return;
    }

    if (!game.abilityUsed) game.abilityUsed = {};
    game.abilityUsed[characterId] = true;

    if (characterId === "meme") {
      game.teamHealth = clamp(game.teamHealth + 30, 0, 100);
      notify("MEME", "L'équipe reprend des forces.");
    } else if (characterId === "nova") {
      game.health = clamp(game.health + 35, 0, 100);
      notify("NOVA", "Protection du véhicule renforcée.");
    } else if (characterId === "axel") {
      game.speed = Math.min(game.maxSpeed + 20, game.speed + 25);
      notify("AXEL", "Boost de vitesse activé.");
    }

    updateHUD();
  }

  /* ============================================================
     PARAMÈTRES
     ============================================================ */

  function updateSettingsUI() {
    const quality = $("qualitySelect");
    if (quality) quality.value = game.quality;

    const sensitivity = $("sensitivitySlider");
    if (sensitivity) sensitivity.value = String(game.sensitivity);

    const volume = $("volumeSlider");
    if (volume) volume.value = String(game.volume * 100);

    const zoom = $("touchZoomToggle");
    if (zoom) zoom.checked = game.touchZoom;

    const vibration = $("vibrationToggle");
    if (vibration) vibration.checked = game.vibration;

    const subtitles = $("subtitlesToggle");
    if (subtitles) subtitles.checked = game.subtitles;
  }

  function bindSettings() {
    const quality = $("qualitySelect");
    if (quality) {
      quality.addEventListener("change", () => {
        game.quality = quality.value;
        resizeCanvas();
        toast("Qualité graphique mise à jour.");
        saveGame(false);
      });
    }

    const sensitivity = $("sensitivitySlider");
    if (sensitivity) {
      sensitivity.addEventListener("input", () => {
        game.sensitivity = clamp(Number(sensitivity.value), 0.4, 2);
      });
      sensitivity.addEventListener("change", () => saveGame(false));
    }

    const volume = $("volumeSlider");
    if (volume) {
      volume.addEventListener("input", () => {
        game.volume = clamp(Number(volume.value) / 100, 0, 1);
      });
      volume.addEventListener("change", () => saveGame(false));
    }

    const zoom = $("touchZoomToggle");
    if (zoom) {
      zoom.addEventListener("change", () => {
        game.touchZoom = zoom.checked;
        saveGame(false);
      });
    }

    const vibration = $("vibrationToggle");
    if (vibration) {
      vibration.addEventListener("change", () => {
        game.vibration = vibration.checked;
        saveGame(false);
      });
    }

    const subtitles = $("subtitlesToggle");
    if (subtitles) {
      subtitles.addEventListener("change", () => {
        game.subtitles = subtitles.checked;
        saveGame(false);
      });
    }
  }

  /* ============================================================
     BOUTONS ET NAVIGATION
     ============================================================ */

  function onClick(id, callback) {
    const el = $(id);
    if (el) el.addEventListener("click", callback);
  }

  function bindButtons() {
    // Menu principal
    onClick("playButton", () => startMission(game.unlockedMission));
    onClick("startGameButton", () => startMission(game.unlockedMission));
    onClick("continueButton", () => startMission(game.mission));
    onClick("missionsButton", () => showScreen("missionsScreen"));
    onClick("garageButton", () => showScreen("garageScreen"));
    onClick("settingsButton", () => showScreen("settingsScreen"));
    onClick("helpButton", () => showScreen("helpScreen"));

    // Retour au menu
    onClick("backToMenuButton", () => showScreen("mainMenu"));
    onClick("backFromMissionsButton", () => showScreen("mainMenu"));
    onClick("backFromGarageButton", () => showScreen("mainMenu"));
    onClick("backFromSettingsButton", () => showScreen("mainMenu"));
    onClick("backFromHelpButton", () => showScreen("mainMenu"));

    // Pause
    onClick("pauseButton", () => togglePause());
    onClick("headerPauseButton", () => togglePause());
    onClick("resumeButton", () => togglePause(false));
    onClick("restartButton", restartCurrentMission);
    onClick("quitMissionButton", () => {
      closeModal("pauseOverlay");
      showScreen("mainMenu");
    });
    onClick("quitToMenuButton", () => {
      closeModal("pauseOverlay");
      showScreen("mainMenu");
    });

    // Résultat
    onClick("resultContinueButton", () => {
      closeModal("resultOverlay");

      if (game.mission < missions.length) {
        startMission(Math.min(game.mission + 1, game.unlockedMission));
      } else {
        showScreen("mainMenu");
      }
    });
    onClick("resultRetryButton", restartCurrentMission);
    onClick("resultMenuButton", () => {
      closeModal("resultOverlay");
      showScreen("mainMenu");
    });

    // Sauvegarde
    onClick("saveButton", () => saveGame(true));
    onClick("manualSaveButton", () => saveGame(true));

    // Caméra et objectifs
    onClick("cameraButton", cycleCamera);
    onClick("cameraSwitchButton", cycleCamera);
    onClick("objectivesToggle", () => {
      game.objectivesOpen = !game.objectivesOpen;
      setHidden("objectiveList", !game.objectivesOpen);
    });
    onClick("minimapToggle", () => {
      game.minimapOpen = !game.minimapOpen;
      setHidden("minimapPanel", !game.minimapOpen);
    });

    // Capacités
    onClick("memeAbilityButton", () => activateAbility("meme"));
    onClick("novaAbilityButton", () => activateAbility("nova"));
    onClick("axelAbilityButton", () => activateAbility("axel"));

    // Garage
    onClick("upgradeSpeedButton", () => upgradeVehicle("speed"));
    onClick("upgradeArmorButton", () => upgradeVehicle("armor"));
    onClick("upgradeHandlingButton", () => upgradeVehicle("handling"));

    // Dialogues
    onClick("confirmCancelButton", () => closeConfirm("confirmOverlay", false));
    onClick("confirmNoButton", () => closeConfirm("confirmOverlay", false));
    onClick("confirmAcceptButton", () => closeConfirm("confirmOverlay", true));
    onClick("confirmYesButton", () => closeConfirm("confirmOverlay", true));
    onClick("closeHelpButton", () => showScreen("mainMenu"));

    // Boutons génériques déclaratifs
    $$("[data-screen]").forEach((el) => {
      el.addEventListener("click", () => showScreen(el.dataset.screen));
    });

    $$("[data-mission]").forEach((el) => {
      el.addEventListener("click", () => {
        startMission(Number(el.dataset.mission));
      });
    });

    $$("[data-upgrade]").forEach((el) => {
      el.addEventListener("click", () => {
        upgradeVehicle(el.dataset.upgrade);
      });
    });

    $$("[data-ability]").forEach((el) => {
      el.addEventListener("click", () => {
        activateAbility(el.dataset.ability);
      });
    });

    $$("[data-action='pause']").forEach((el) => {
      el.addEventListener("click", () => togglePause());
    });

    $$("[data-action='save']").forEach((el) => {
      el.addEventListener("click", () => saveGame(true));
    });

    $$("[data-action='camera']").forEach((el) => {
      el.addEventListener("click", cycleCamera);
    });
  }

  function closeConfirm(overlayId, accept) {
    const overlay = $(overlayId);
    if (overlay) overlay.hidden = true;

    const callback = game.currentModalAction;
    game.currentModalAction = null;

    if (accept && typeof callback === "function") callback();
  }

  /* ============================================================
     BOUCLE D'ANIMATION
     ============================================================ */

  function frame(timestamp) {
    game.animationFrame = requestAnimationFrame(frame);

    if (!game.lastFrame) game.lastFrame = timestamp;

    const dt = clamp((timestamp - game.lastFrame) / 1000, 0, 0.05);
    game.lastFrame = timestamp;

    if (game.screen === "gameScreen" && game.playing && !game.paused) {
      updatePhysics(dt);
    }

    if (game.webglAvailable && gl) {
      try {
        drawWorld3D();
      } catch (error) {
        console.error("Erreur de rendu :", error);
      }
    }
  }

  /* ============================================================
     SVG : AMÉLIORATIONS VISUELLES SANS BIBLIOTHÈQUE
     ============================================================ */

  function enhanceInlineSVG() {
    $$("svg").forEach((svg) => {
      if (!svg.getAttribute("viewBox")) {
        const width = Number(svg.getAttribute("width")) || 100;
        const height = Number(svg.getAttribute("height")) || 100;
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      }

      if (!svg.hasAttribute("preserveAspectRatio")) {
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      }

      svg.style.maxWidth = svg.style.maxWidth || "100%";
      svg.style.height = svg.style.height || "auto";
    });
  }

  /* ============================================================
     ACCESSIBILITÉ ET SÉCURITÉ DES COMMANDES
     ============================================================ */

  function setupGlobalSafety() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        releaseAllControls();

        if (game.screen === "gameScreen" && game.playing) {
          togglePause(true);
        }

        saveGame(false);
      }
    });

    window.addEventListener("resize", resizeCanvas);

    window.addEventListener("beforeunload", () => {
      releaseAllControls();
    });

    document.addEventListener("contextmenu", (event) => {
      if (event.target.closest(".touch-controls")) {
        event.preventDefault();
      }
    });
  }

  /* ============================================================
     INITIALISATION
     ============================================================ */

  async function init() {
    try {
      await initializeStorage();
    } catch (error) {
      console.warn(error);
    }

    try {
      initWebGL();

      const fallback = $("sceneFallback");
      if (fallback) fallback.hidden = true;
    } catch (error) {
      showGraphicsError(error);
    }

    bindButtons();
    bindSettings();
    setupKeyboard();
    setupTouchControls();
    setupPinchZoom();
    setupGlobalSafety();
    enhanceInlineSVG();

    updateInterface();

    if ($("loadingScreen")) {
      $("loadingScreen").hidden = true;
    }

    showScreen("mainMenu");

    if (!game.webglAvailable) {
      toast("Mode de secours : le moteur WebGL n'a pas démarré.");
    }

    game.initialized = true;
    game.lastFrame = now();

    if (!game.animationFrame) {
      game.animationFrame = requestAnimationFrame(frame);
    }

    console.info(`${APP.name} ${APP.version} initialisé.`);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

})();


