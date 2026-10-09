
/* ============================================================
   FOBAS MISSION FORCE UNIE 3D
   Version 1.0.0 — moteur WebGL natif, sans Three.js
   HTML compatible : appjeufobas.html
   CSS compatible  : appjeufobas.css

   Fonctionnalités :
   - Moteur 3D WebGL personnalisé
   - Voiture pilotable et caméra dynamique
   - Six missions progressives
   - Contrôles tactiles Android et clavier
   - Radar, objectifs, capacités de l'équipe
   - Garage et améliorations
   - Paramètres graphiques et caméra
   - Sauvegarde IndexedDB avec solution de secours
   - Mode 2D de secours si WebGL est indisponible
   ============================================================ */

const FOBAS = (() => {
  "use strict";

  const VERSION = "1.0.0";
  const DB_NAME = "FOBAS_MISSION_FORCE_UNIE_DB";
  const DB_VERSION = 1;
  const SAVE_KEY = "main-save";

  const $ = id => document.getElementById(id);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const distance2D = (a, b) =>
    Math.hypot(a.x - b.x, a.z - b.z);

  const missions = [
    {
      id: "mission-01",
      title: "La première route",
      objective: "Rejoignez le point de rendez-vous.",
      distance: 180,
      reward: 100,
      difficulty: "INITIATION"
    },
    {
      id: "mission-02",
      title: "Le véhicule disparu",
      objective: "Explorez la zone et retrouvez le véhicule.",
      distance: 280,
      reward: 180,
      difficulty: "EXPLORATION"
    },
    {
      id: "mission-03",
      title: "Route endommagée",
      objective: "Atteignez la zone de réparation.",
      distance: 350,
      reward: 250,
      difficulty: "TECHNIQUE"
    },
    {
      id: "mission-04",
      title: "La force du convoi",
      objective: "Conduisez le convoi jusqu'à destination.",
      distance: 440,
      reward: 350,
      difficulty: "CONVOI"
    },
    {
      id: "mission-05",
      title: "Mission en montagne",
      objective: "Atteignez la zone de secours.",
      distance: 520,
      reward: 450,
      difficulty: "SAUVETAGE"
    },
    {
      id: "mission-06",
      title: "Unis pour réussir",
      objective: "Terminez l'opération finale.",
      distance: 650,
      reward: 700,
      difficulty: "OPÉRATION FINALE"
    }
  ];

  const defaultSettings = {
    graphicsQuality: "medium",
    cameraDistance: 7,
    steeringSensitivity: 1,
    gameVolume: 65,
    vibrationEnabled: true,
    touchZoomEnabled: true,
    showSubtitles: true
  };

  const state = {
    started: false,
    running: false,
    paused: false,
    gameOver: false,
    initialized: false,
    mode: "menu",

    missionIndex: 0,
    unlockedMissions: 1,
    completedMissions: [],
    currentMission: null,
    missionStartZ: 0,
    missionProgress: 0,
    money: 0,

    player: {
      x: 0,
      y: 0,
      z: 0,
      yaw: 0,
      speed: 0,
      health: 100,
      teamHealth: 100,
      steering: 0,
      damageTimer: 0
    },

    vehicle: {
      name: "Force One",
      speed: 65,
      armor: 75,
      handling: 70,
      level: 0
    },

    camera: {
      distance: 7,
      height: 3.3,
      mode: 0,
      zoom: 0,
      yaw: 0
    },

    controls: {
      accelerate: false,
      reverse: false,
      brake: false,
      left: false,
      right: false,
      handbrake: false
    },

    abilities: {
      memeReady: true,
      novaReady: true,
      axelReady: true,
      tacticalVision: 0,
      scanTimer: 0
    },

    objectives: [],
    settings: { ...defaultSettings },
    db: null,
    saveAvailable: false,
    lastSave: 0,
    lastFrame: 0,
    elapsed: 0,
    notificationTimer: 0,
    confirmAction: null,
    raf: 0,
    gl: null,
    renderer: null,
    sceneCanvas: null,
    fallback2D: false,
    keys: new Set(),
    touchPointers: new Map(),
    lastPinchDistance: 0,
    audioContext: null,
    soundEnabled: false,
    lastSpeedSound: 0
  };

  /* ========================= DOM ========================= */

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = String(value);
  }

  function show(id, visible = true) {
    const el = $(id);
    if (el) el.hidden = !visible;
  }

  function setWidth(id, value) {
    const el = $(id);
    if (el) el.style.width = `${clamp(value, 0, 100)}%`;
  }

  function setConnection(text, ok = true) {
    setText("connectionStatusText", text);

    const el = $("connectionStatus");
    if (el) {
      el.dataset.state = ok ? "online" : "offline";
      el.setAttribute("aria-label", text);
    }
  }

  function notify(message, title = "FOBAS") {
    const toast = $("globalToast");
    if (!toast) return;

    setText("globalToastMessage", message);
    show("globalToast", true);

    state.notificationTimer = 4.5;

    if (state.settings.vibrationEnabled &&
        navigator.vibrate) {
      try { navigator.vibrate(20); } catch (_) {}
    }

    console.info(`[${title}] ${message}`);
  }

  function gameMessage(title, message, duration = 3) {
    setText("notificationTitle", title);
    setText("notificationMessage", message);
    show("gameNotification", true);

    state.gameNotificationTimer = duration;
  }

  function setStatus(id, message) {
    setText(id, message);
  }

  /* ====================== INDEXEDDB ====================== */

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB indisponible."));
        return;
      }

      let request;

      try {
        request = indexedDB.open(DB_NAME, DB_VERSION);
      } catch (error) {
        reject(error);
        return;
      }

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains("saves")) {
          db.createObjectStore("saves", { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(request.error || new Error("Ouverture impossible."));
      request.onblocked = () =>
        reject(new Error("Base de données bloquée."));
    });
  }

  function readSave() {
    return new Promise((resolve, reject) => {
      if (!state.db) {
        reject(new Error("Base de données indisponible."));
        return;
      }

      try {
        const tx = state.db.transaction("saves", "readonly");
        const request = tx.objectStore("saves").get(SAVE_KEY);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  function makeSaveData() {
    return {
      id: SAVE_KEY,
      version: VERSION,
      savedAt: new Date().toISOString(),

      missionIndex: state.missionIndex,
      unlockedMissions: state.unlockedMissions,
      completedMissions: [...state.completedMissions],
      money: state.money,

      player: {
        x: state.player.x,
        z: state.player.z,
        yaw: state.player.yaw,
        health: state.player.health,
        teamHealth: state.player.teamHealth
      },

      vehicle: { ...state.vehicle },
      settings: { ...state.settings }
    };
  }

  async function saveGame(silent = false) {
    const data = makeSaveData();

    try {
      if (!state.db) {
        state.db = await openDatabase();
      }

      await new Promise((resolve, reject) => {
        const tx = state.db.transaction("saves", "readwrite");

        tx.objectStore("saves").put(data);

        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
        tx.onabort = () =>
          reject(tx.error || new Error("Sauvegarde annulée."));
      });

      state.saveAvailable = true;
      state.lastSave = Date.now();

      setText("saveSummary", "Progression sauvegardée.");
      setConnection("Sauvegarde active", true);

      if (!silent) notify("Progression enregistrée dans IndexedDB.");

      updateSaveButtons();
      return true;
    } catch (error) {
      console.warn("IndexedDB :", error);

      try {
        localStorage.setItem(
          "fobas-mission-force-unie-fallback",
          JSON.stringify(data)
        );

        state.saveAvailable = true;
        state.lastSave = Date.now();

        setText("saveSummary", "Sauvegarde locale de secours.");
        updateSaveButtons();

        if (!silent) {
          notify("Sauvegarde de secours utilisée.");
        }

        return true;
      } catch (fallbackError) {
        console.error(fallbackError);
        setConnection("Sauvegarde indisponible", false);

        if (!silent) {
          notify("Impossible de sauvegarder les données.");
        }

        return false;
      }
    }
  }

  async function loadSave() {
    let data = null;

    try {
      if (!state.db) state.db = await openDatabase();
      data = await readSave();
    } catch (error) {
      console.warn("Lecture IndexedDB :", error);
    }

    if (!data) {
      try {
        const raw = localStorage.getItem(
          "fobas-mission-force-unie-fallback"
        );

        if (raw) data = JSON.parse(raw);
      } catch (error) {
        console.warn("Lecture de secours :", error);
      }
    }

    if (!data || typeof data !== "object") {
      state.saveAvailable = false;
      setText("saveSummary", "Aucune sauvegarde trouvée.");
      updateSaveButtons();
      return false;
    }

    state.missionIndex = clamp(
      Number(data.missionIndex) || 0,
      0,
      missions.length - 1
    );

    state.unlockedMissions = clamp(
      Number(data.unlockedMissions) || 1,
      1,
      missions.length
    );

    state.completedMissions = Array.isArray(data.completedMissions)
      ? data.completedMissions.filter(id =>
          missions.some(m => m.id === id)
        )
      : [];

    state.money = Math.max(0, Number(data.money) || 0);

    if (data.player) {
      state.player.x = clamp(Number(data.player.x) || 0, -8, 8);
      state.player.z = Number(data.player.z) || 0;
      state.player.yaw = Number(data.player.yaw) || 0;
      state.player.health = clamp(
        Number(data.player.health ?? 100), 0, 100
      );
      state.player.teamHealth = clamp(
        Number(data.player.teamHealth ?? 100), 0, 100
      );
    }

    if (data.vehicle) {
      state.vehicle.speed = clamp(Number(data.vehicle.speed) || 65, 1, 100);
      state.vehicle.armor = clamp(Number(data.vehicle.armor) || 75, 1, 100);
      state.vehicle.handling = clamp(Number(data.vehicle.handling) || 70, 1, 100);
      state.vehicle.level = clamp(Number(data.vehicle.level) || 0, 0, 10);
    }

    if (data.settings) {
      state.settings = {
        ...defaultSettings,
        ...data.settings
      };
    }

    state.camera.distance = Number(state.settings.cameraDistance) || 7;

    setText(
      "saveSummary",
      `Sauvegarde disponible · ${state.money} crédits`
    );

    syncSettingsUI();
    updateSaveButtons();
    updateMissionButtons();
    updateGarageUI();

    return true;
  }

  function updateSaveButtons() {
    const button = $("continueGameButton");

    if (button) {
      button.disabled = !state.saveAvailable;
    }

    const status = $("saveStatusButton");

    if (status) {
      status.title = state.saveAvailable
        ? "Sauvegarde disponible"
        : "Aucune sauvegarde confirmée";
    }
  }

  /* ======================== WEBGL ======================== */

  const vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;

    uniform mat4 uProjection;
    uniform mat4 uView;
    uniform mat4 uModel;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec4 world = uModel * vec4(aPosition, 1.0);
      vWorldPosition = world.xyz;
      vNormal = mat3(uModel) * aNormal;
      gl_Position = uProjection * uView * world;
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;

    uniform vec3 uColor;
    uniform vec3 uLightDirection;
    uniform float uEmissive;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 n = normalize(vNormal);
      float diffuse = max(dot(n, normalize(uLightDirection)), 0.0);
      float lighting = 0.40 + diffuse * 0.68;
      vec3 color = uColor * lighting;

      color += uColor * uEmissive;

      float fog = smoothstep(75.0, 180.0, length(vWorldPosition));
      vec3 fogColor = vec3(0.10, 0.20, 0.17);
      color = mix(color, fogColor, fog * 0.60);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);

    if (!shader) throw new Error("Création shader impossible.");

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(error || "Erreur de compilation shader.");
    }

    return shader;
  }

  function createProgram(gl) {
    const vertex = compileShader(
      gl, gl.VERTEX_SHADER, vertexShaderSource
    );

    const fragment = compileShader(
      gl, gl.FRAGMENT_SHADER, fragmentShaderSource
    );

    const program = gl.createProgram();

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(error || "Liaison shader impossible.");
    }

    return program;
  }

  function createCube(gl) {
    const faces = [
      // Avant
      [-0.5,-0.5, 0.5, 0,0,1],
      [ 0.5,-0.5, 0.5, 0,0,1],
      [ 0.5, 0.5, 0.5, 0,0,1],
      [-0.5,-0.5, 0.5, 0,0,1],
      [ 0.5, 0.5, 0.5, 0,0,1],
      [-0.5, 0.5, 0.5, 0,0,1],

      // Arrière
      [ 0.5,-0.5,-0.5, 0,0,-1],
      [-0.5,-0.5,-0.5, 0,0,-1],
      [-0.5, 0.5,-0.5, 0,0,-1],
      [ 0.5,-0.5,-0.5, 0,0,-1],
      [-0.5, 0.5,-0.5, 0,0,-1],
      [ 0.5, 0.5,-0.5, 0,0,-1],

      // Droite
      [0.5,-0.5, 0.5, 1,0,0],
      [0.5,-0.5,-0.5, 1,0,0],
      [0.5, 0.5,-0.5, 1,0,0],
      [0.5,-0.5, 0.5, 1,0,0],
      [0.5, 0.5,-0.5, 1,0,0],
      [0.5, 0.5, 0.5, 1,0,0],

      // Gauche
      [-0.5,-0.5,-0.5, -1,0,0],
      [-0.5,-0.5, 0.5, -1,0,0],
      [-0.5, 0.5, 0.5, -1,0,0],
      [-0.5,-0.5,-0.5, -1,0,0],
      [-0.5, 0.5, 0.5, -1,0,0],
      [-0.5, 0.5,-0.5, -1,0,0],

      // Dessus
      [-0.5,0.5, 0.5, 0,1,0],
      [ 0.5,0.5, 0.5, 0,1,0],
      [ 0.5,0.5,-0.5, 0,1,0],
      [-0.5,0.5, 0.5, 0,1,0],
      [ 0.5,0.5,-0.5, 0,1,0],
      [-0.5,0.5,-0.5, 0,1,0],

      // Dessous
      [-0.5,-0.5,-0.5, 0,-1,0],
      [ 0.5,-0.5,-0.5, 0,-1,0],
      [ 0.5,-0.5, 0.5, 0,-1,0],
      [-0.5,-0.5,-0.5, 0,-1,0],
      [ 0.5,-0.5, 0.5, 0,-1,0],
      [-0.5,-0.5, 0.5, 0,-1,0]
    ];

    const positions = [];
    const normals = [];

    for (const item of faces) {
      positions.push(item[0], item[1], item[2]);
      normals.push(item[3], item[4], item[5]);
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(positions),
      gl.STATIC_DRAW
    );

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(normals),
      gl.STATIC_DRAW
    );

    return {
      positionBuffer,
      normalBuffer,
      vertexCount: positions.length / 3
    };
  }

  function mat4Identity() {
    return new Float32Array([
      1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      0,0,0,1
    ]);
  }

  function mat4Multiply(a, b) {
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

  function normalize3(v) {
    const length = Math.hypot(v[0], v[1], v[2]) || 1;

    return [
      v[0] / length,
      v[1] / length,
      v[2] / length
    ];
  }

  function subtract3(a, b) {
    return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
  }

  function cross3(a, b) {
    return [
      a[1]*b[2] - a[2]*b[1],
      a[2]*b[0] - a[0]*b[2],
      a[0]*b[1] - a[1]*b[0]
    ];
  }

  function mat4LookAt(eye, target, up) {
    const z = normalize3(subtract3(eye, target));
    const x = normalize3(cross3(up, z));
    const y = cross3(z, x);

    const out = new Float32Array(16);

    out[0] = x[0];
    out[1] = y[0];
    out[2] = z[0];
    out[3] = 0;

    out[4] = x[1];
    out[5] = y[1];
    out[6] = z[1];
    out[7] = 0;

    out[8] = x[2];
    out[9] = y[2];
    out[10] = z[2];
    out[11] = 0;

    out[12] = -(
      x[0]*eye[0] + x[1]*eye[1] + x[2]*eye[2]
    );

    out[13] = -(
      y[0]*eye[0] + y[1]*eye[1] + y[2]*eye[2]
    );

    out[14] = -(
      z[0]*eye[0] + z[1]*eye[1] + z[2]*eye[2]
    );

    out[15] = 1;

    return out;
  }

  function modelMatrix(x, y, z, sx, sy, sz, yaw = 0) {
    const c = Math.cos(yaw);
    const s = Math.sin(yaw);

    return new Float32Array([
      c*sx, 0, -s*sx, 0,
      0, sy, 0, 0,
      s*sz, 0, c*sz, 0,
      x, y, z, 1
    ]);
  }

  function initializeWebGL() {
    const container = $("sceneContainer");

    if (!container) {
      throw new Error("Conteneur de scène introuvable.");
    }

    const canvas = document.createElement("canvas");

    canvas.id = "fobasWebGLCanvas";
    canvas.setAttribute("aria-label", "Scène 3D FOBAS");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.touchAction = "none";

    container.insertBefore(canvas, container.firstChild);

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: true,
      depth: true,
      powerPreference: "high-performance"
    });

    if (!gl) {
      canvas.remove();
      throw new Error("WebGL indisponible sur cet appareil.");
    }

    const program = createProgram(gl);
    const cube = createCube(gl);

    state.gl = gl;
    state.sceneCanvas = canvas;

    state.renderer = {
      gl,
      program,
      cube,
      locations: {
        position: gl.getAttribLocation(program, "aPosition"),
        normal: gl.getAttribLocation(program, "aNormal"),
        projection: gl.getUniformLocation(program, "uProjection"),
        view: gl.getUniformLocation(program, "uView"),
        model: gl.getUniformLocation(program, "uModel"),
        color: gl.getUniformLocation(program, "uColor"),
        light: gl.getUniformLocation(program, "uLightDirection"),
        emissive: gl.getUniformLocation(program, "uEmissive")
      }
    };

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clearColor(0.10, 0.20, 0.17, 1);

    show("sceneFallback", false);

    canvas.addEventListener("webglcontextlost", event => {
      event.preventDefault();
      state.running = false;
      notify("Le contexte graphique a été interrompu.");
      setConnection("Graphismes interrompus", false);
    });

    canvas.addEventListener("webglcontextrestored", () => {
      notify("Contexte graphique restauré. Rechargez la partie.");
    });

    resizeRenderer();

    return true;
  }

  function resizeRenderer() {
    if (!state.sceneCanvas || !state.gl) return;

    const canvas = state.sceneCanvas;
    const rect = canvas.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const quality = state.settings.graphicsQuality;
    const qualityScale = quality === "low" ? 0.65 :
      quality === "high" ? 1.25 : 1;

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      quality === "high" ? 1.75 : 1.25
    ) * qualityScale;

    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    state.gl.viewport(0, 0, width, height);
  }

  /* ====================== DESSIN 3D ====================== */

  function drawCube(x, y, z, sx, sy, sz, color, yaw = 0, emissive = 0) {
    const r = state.renderer;
    if (!r) return;

    const gl = r.gl;
    const u = r.locations;

    gl.uniformMatrix4fv(
      u.model, false,
      modelMatrix(x, y, z, sx, sy, sz, yaw)
    );

    gl.uniform3fv(u.color, color);
    gl.uniform1f(u.emissive, emissive);

    gl.drawArrays(gl.TRIANGLES, 0, r.cube.vertexCount);
  }

  function bindCubeBuffers() {
    const r = state.renderer;
    if (!r) return;

    const gl = r.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, r.cube.positionBuffer);
    gl.enableVertexAttribArray(r.locations.position);
    gl.vertexAttribPointer(
      r.locations.position, 3, gl.FLOAT, false, 0, 0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, r.cube.normalBuffer);
    gl.enableVertexAttribArray(r.locations.normal);
    gl.vertexAttribPointer(
      r.locations.normal, 3, gl.FLOAT, false, 0, 0
    );
  }

  function drawWorld() {
    const p = state.player;
    const offset = Math.floor(p.z / 18) * 18;
    const quality = state.settings.graphicsQuality;

    // Terrain
    drawCube(0, -0.55, p.z - 80, 180, 0.8, 240, [0.10,0.30,0.19]);

    // Route principale
    drawCube(0, -0.08, p.z - 65, 12, 0.18, 210, [0.20,0.23,0.22]);

    // Accotements
    drawCube(-6.35, 0, p.z - 65, 0.45, 0.24, 210, [0.67,0.68,0.59]);
    drawCube(6.35, 0, p.z - 65, 0.45, 0.24, 210, [0.67,0.68,0.59]);

    // Bandes blanches centrales
    for (let i = -11; i < 12; i++) {
      const z = offset - i * 18;

      drawCube(0, 0.025, z, 0.16, 0.035, 6, [0.88,0.89,0.78]);
    }

    // Bordures et lampes
    for (let i = -7; i < 8; i++) {
      const z = offset - i * 27;

      drawCube(-6.5, 0.65, z, 0.12, 1.3, 0.12, [0.68,0.75,0.69]);
      drawCube(6.5, 0.65, z, 0.12, 1.3, 0.12, [0.68,0.75,0.69]);

      drawCube(-6.5, 1.35, z, 0.38, 0.22, 0.38, [0.95,0.78,0.40], 0, 0.25);
      drawCube(6.5, 1.35, z, 0.38, 0.22, 0.38, [0.95,0.78,0.40], 0, 0.25);
    }

    // Végétation et constructions
    const count = quality === "low" ? 5 : 9;

    for (let i = -count; i <= count; i++) {
      const z = offset - i * 14;

      if (i % 2 === 0) {
        const side = i % 4 === 0 ? -1 : 1;
        const x = side * (11 + (Math.abs(i) % 3) * 2);

        // Tronc
        drawCube(x, 1.1, z, 0.55, 2.2, 0.55, [0.33,0.22,0.13]);

        // Feuillage en étages
        drawCube(x, 2.6, z, 3.2, 2.1, 3.2, [0.08,0.38,0.20]);
        drawCube(x, 3.6, z, 2.3, 1.7, 2.3, [0.10,0.46,0.23]);
      } else {
        const side = i % 3 === 0 ? -1 : 1;
        const x = side * (15 + (Math.abs(i) % 4) * 2);

        drawCube(x, 2.2, z, 4, 4.4, 5, [0.40,0.43,0.39]);
        drawCube(x, 4.7, z, 4.2, 0.25, 5.2, [0.22,0.28,0.26]);

        for (let wy = 1.3; wy < 3.8; wy += 1.4) {
          drawCube(x, wy, z - 2.53, 0.65, 0.65, 0.08, [0.40,0.75,0.75], 0, 0.08);
          drawCube(x + 0.8, wy, z - 2.53, 0.65, 0.65, 0.08, [0.40,0.75,0.75], 0, 0.08);
        }
      }
    }

    // Véhicules immobiles dans la zone
    for (let i = -4; i < 5; i++) {
      if (i % 3 !== 0) continue;

      const z = offset - i * 23 - 11;

      drawCube(-8.7, 0.65, z, 1.8, 1, 3.1, [0.72,0.28,0.16]);
      drawCube(-8.7, 1.18, z, 1.25, 0.55, 1.5, [0.12,0.24,0.27]);
    }

    drawMissionTarget();
  }

  function drawMissionTarget() {
    if (!state.currentMission) return;

    const targetZ = state.missionStartZ - state.currentMission.distance;
    const p = state.player;

    drawCube(0, 0.18, targetZ, 7.5, 0.12, 7.5, [0.13,0.45,0.28], 0, 0.15);
    drawCube(0, 1.6, targetZ, 0.25, 3.2, 0.25, [0.15,1,0.60], 0, 0.7);
    drawCube(0, 3.35, targetZ, 2.0, 0.18, 0.18, [0.20,1,0.65], 0, 0.7);

    if (Math.abs(p.z - targetZ) < 60) {
      drawCube(-2.5, 0.5, targetZ, 0.25, 1, 0.25, [0.2,0.95,0.5], 0, 0.4);
      drawCube(2.5, 0.5, targetZ, 0.25, 1, 0.25, [0.2,0.95,0.5], 0, 0.4);
    }
  }

  function drawCar() {
    const p = state.player;
    const yaw = p.yaw;

    const paint = [0.08, 0.72, 0.43];
    const glass = [0.07, 0.18, 0.20];
    const rubber = [0.055, 0.065, 0.06];

    // Châssis
    drawCube(p.x, 0.75, p.z, 2.25, 0.55, 4.2, paint, yaw);

    // Capot
    drawCube(
      p.x, 0.98, p.z - 1.2,
      2.12, 0.24, 1.35,
      [0.12,0.83,0.51], yaw
    );

    // Habitacle
    drawCube(
      p.x, 1.30, p.z + 0.1,
      1.65, 0.80, 1.95,
      paint, yaw
    );

    // Vitres
    drawCube(
      p.x, 1.52, p.z - 0.05,
      1.45, 0.40, 1.45,
      glass, yaw
    );

    // Toit
    drawCube(
      p.x, 1.77, p.z + 0.1,
      1.42, 0.12, 1.55,
      [0.05,0.48,0.30], yaw
    );

    // Pare-chocs
    drawCube(
      p.x, 0.48, p.z - 2.15,
      2.25, 0.25, 0.22,
      [0.10,0.12,0.11], yaw
    );

    drawCube(
      p.x, 0.48, p.z + 2.15,
      2.25, 0.25, 0.22,
      [0.10,0.12,0.11], yaw
    );

    // Phares
    drawCube(
      p.x - 0.72, 0.91, p.z - 2.16,
      0.42, 0.22, 0.08,
      [1,0.93,0.69], yaw, 0.35
    );

    drawCube(
      p.x + 0.72, 0.91, p.z - 2.16,
      0.42, 0.22, 0.08,
      [1,0.93,0.69], yaw, 0.35
    );

    // Feux arrière
    drawCube(
      p.x - 0.78, 0.85, p.z + 2.15,
      0.35, 0.20, 0.08,
      [0.92,0.10,0.08], yaw, 0.12
    );

    drawCube(
      p.x + 0.78, 0.85, p.z + 2.15,
      0.35, 0.20, 0.08,
      [0.92,0.10,0.08], yaw, 0.12
    );

    // Roues en cubes orientables
    for (const side of [-1, 1]) {
      for (const end of [-1, 1]) {
        drawCube(
          p.x + side * 1.13,
          0.42,
          p.z + end * 1.35,
          0.30, 0.75, 0.62,
          rubber,
          yaw + (end < 0 ? p.steering * 0.22 : 0)
        );

        drawCube(
          p.x + side * 1.30,
          0.42,
          p.z + end * 1.35,
          0.06, 0.37, 0.34,
          [0.46,0.52,0.49],
          yaw
        );
      }
    }

    // Logo sur le capot
    drawCube(
      p.x, 1.12, p.z - 1.15,
      0.65, 0.035, 0.45,
      [0.93,0.77,0.31], yaw, 0.12
    );

    // Effet de freinage
    if (state.controls.brake || state.controls.handbrake) {
      drawCube(
        p.x, 0.62, p.z + 2.24,
        1.45, 0.06, 0.06,
        [1,0.02,0.01], yaw, 0.35
      );
    }
  }

  function renderWebGL() {
    const r = state.renderer;
    if (!r || !r.gl) return;

    resizeRenderer();

    const gl = r.gl;
    const p = state.player;
    const cameraDistance = clamp(
      state.camera.distance + state.camera.zoom, 3.5, 14
    );

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(r.program);

    bindCubeBuffers();

    const aspect = gl.canvas.width / Math.max(1, gl.canvas.height);

    const projection = mat4Perspective(
      Math.PI / 3.2, aspect, 0.1, 350
    );

    const cameraYaw = state.camera.mode === 0
      ? p.yaw
      : p.yaw + Math.PI;

    const eye = [
      p.x + Math.sin(cameraYaw) * cameraDistance,
      state.camera.height + cameraDistance * 0.16,
      p.z + Math.cos(cameraYaw) * cameraDistance
    ];

    const target = [
      p.x,
      0.8,
      p.z - 4
    ];

    const view = mat4LookAt(eye, target, [0,1,0]);

    gl.uniformMatrix4fv(r.locations.projection, false, projection);
    gl.uniformMatrix4fv(r.locations.view, false, view);
    gl.uniform3fv(r.locations.light, [-0.45, 0.9, 0.35]);

    drawWorld();
    drawCar();

    gl.flush();
  }

  /* ====================== MODE 2D SECOURS ====================== */

  function initializeFallback2D() {
    const container = $("sceneContainer");
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.id = "fobasFallbackCanvas";
    canvas.style.cssText =
      "width:100%;height:100%;display:block;touch-action:none";

    container.insertBefore(canvas, container.firstChild);

    state.sceneCanvas = canvas;
    state.fallback2D = true;

    show("sceneFallback", false);
    resizeRenderer();
  }

  function renderFallback2D() {
    const canvas = state.sceneCanvas;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = rect.width;
    const h = rect.height;
    const p = state.player;

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#76a8a2");
    sky.addColorStop(0.52, "#c3d5aa");
    sky.addColorStop(1, "#1b5032");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    const roadWidth = w * 0.48;
    const center = w / 2;

    ctx.fillStyle = "#2b3230";
    ctx.beginPath();
    ctx.moveTo(center - roadWidth * 0.13, h * 0.35);
    ctx.lineTo(center + roadWidth * 0.13, h * 0.35);
    ctx.lineTo(center + roadWidth * 0.80, h);
    ctx.lineTo(center - roadWidth * 0.80, h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#e3dfb2";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(center, h * 0.35);
    ctx.lineTo(center, h);
    ctx.stroke();

    for (let i = 0; i < 10; i++) {
      const z = i / 10;
      const y = h * (0.40 + z * 0.65);
      const scale = 0.15 + z * 1.0;
      const spread = w * (0.18 + z * 0.35);

      for (const side of [-1, 1]) {
        const x = center + side * spread;

        ctx.fillStyle = "#634b30";
        ctx.fillRect(x - 3 * scale, y, 6 * scale, 24 * scale);

        ctx.fillStyle = "#145c30";
        ctx.beginPath();
        ctx.arc(x, y, 13 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Cible
    if (state.currentMission) {
      const targetZ =
        state.missionStartZ - state.currentMission.distance;
      const distance = Math.abs(p.z - targetZ);
      const y = clamp(h * 0.32 + distance * 0.10, h * 0.30, h * 0.75);

      ctx.strokeStyle = "#57ffae";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(center, y, 20, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Véhicule
    ctx.save();
    ctx.translate(center + p.x * 15, h * 0.78);
    ctx.rotate(-p.yaw * 0.3);

    ctx.fillStyle = "#0a1c15";
    ctx.fillRect(-w * 0.09, -h * 0.035, w * 0.18, h * 0.095);

    ctx.fillStyle = "#14c27d";
    ctx.fillRect(-w * 0.075, -h * 0.045, w * 0.15, h * 0.065);

    ctx.fillStyle = "#142e35";
    ctx.fillRect(-w * 0.052, -h * 0.065, w * 0.104, h * 0.035);

    ctx.restore();
  }

  /* ===================== CAMÉRA / RADAR ===================== */

  function renderMinimap() {
    const canvas = $("minimapCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#102b22";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(110,220,160,.20)";
    ctx.lineWidth = 1;

    for (let i = 0; i < w; i += 22) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }

    ctx.fillStyle = "#5e6e63";
    ctx.fillRect(cx - 18, 0, 36, h);

    ctx.strokeStyle = "#e5e7c7";
    ctx.setLineDash([9, 9]);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();
    ctx.setLineDash([]);

    if (state.currentMission) {
      const targetZ =
        state.missionStartZ - state.currentMission.distance;

      const dy = clamp(
        (targetZ - state.player.z) * 0.42,
        -cy + 10,
        cy - 10
      );

      ctx.fillStyle = "#44ff9b";
      ctx.beginPath();
      ctx.arc(cx, cy + dy, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#44ff9b";
      ctx.beginPath();
      ctx.arc(cx, cy + dy, 11, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(state.player.yaw);

    ctx.fillStyle = "#70e6ff";
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(8, 8);
    ctx.lineTo(0, 4);
    ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /* ======================== MISSIONS ======================== */

  function buildObjectives() {
    const mission = state.currentMission;

    state.objectives = [
      {
        id: "drive",
        text: mission.objective,
        done: false
      },
      {
        id: "team",
        text: "Gardez votre véhicule et votre équipe en sécurité.",
        done: false
      }
    ];

    renderObjectives();
  }

  function renderObjectives() {
    const list = $("objectiveList");
    if (!list) return;

    list.replaceChildren();

    if (!state.objectives.length) {
      const p = document.createElement("p");
      p.textContent = "Les objectifs apparaîtront ici.";
      list.appendChild(p);
      return;
    }

    for (const objective of state.objectives) {
      const row = document.createElement("div");
      row.className = "objective-item";
      row.dataset.done = String(objective.done);

      const mark = document.createElement("span");
      mark.textContent = objective.done ? "✓" : "○";

      const text = document.createElement("span");
      text.textContent = objective.text;

      row.append(mark, text);
      list.appendChild(row);
    }
  }

  function updateMissionButtons() {
    document.querySelectorAll("[data-start-mission]").forEach(button => {
      const id = button.dataset.startMission;
      const index = missions.findIndex(m => m.id === id);

      const unlocked = index >= 0 && index < state.unlockedMissions;
      button.disabled = !unlocked;

      if (unlocked) {
        button.textContent = state.completedMissions.includes(id)
          ? "Rejouer"
          : "Jouer";
      } else {
        button.textContent = "Verrouillée";
      }
    });

    const next = $("nextMissionButton");

    if (next) {
      next.disabled = state.missionIndex >= missions.length - 1;
    }
  }

  function updateMissionHUD() {
    const mission = state.currentMission;
    if (!mission) return;

    setText("missionNumber",
      `MISSION ${String(state.missionIndex + 1).padStart(2, "0")}`);

    setText("missionTitle", mission.title);
    setText("missionObjective", mission.objective);

    const targetZ = state.missionStartZ - mission.distance;
    const total = Math.max(1, mission.distance);
    const travelled = Math.max(0, state.missionStartZ - state.player.z);

    state.missionProgress = clamp(travelled / total * 100, 0, 100);

    setWidth("missionProgressBar", state.missionProgress);
    setText("missionProgressText",
      `${Math.floor(state.missionProgress)} % terminé`);

    setText("speedValue", Math.round(Math.abs(state.player.speed)));

    setWidth("vehicleHealthBar", state.player.health);
    setText("vehicleHealthText", `${Math.round(state.player.health)} %`);

    setWidth("teamHealthBar", state.player.teamHealth);
    setText("teamHealthText", `${Math.round(state.player.teamHealth)} %`);

    setText("teamStatusText",
      state.player.teamHealth > 30 ? "Équipe opérationnelle" : "Équipe en difficulté");

    setText("navigationPromptText",
      Math.abs(state.player.z - targetZ) < 25
        ? "Vous êtes proche de la destination."
        : "Suivez la route vers l'objectif.");

    const distance = Math.max(0, Math.round(Math.abs(targetZ - state.player.z)));

    const prompt = $("navigationPrompt");
    if (prompt) {
      prompt.title = `${distance} unités de distance`;
    }
  }

  function startMission(id = null, resume = false) {
    let index = id
      ? missions.findIndex(m => m.id === id)
      : state.missionIndex;

    if (index < 0 || index >= missions.length) index = 0;

    if (index >= state.unlockedMissions && !resume) {
      notify("Terminez la mission précédente pour la débloquer.");
      return;
    }

    state.missionIndex = index;
    state.currentMission = missions[index];
    state.started = true;
    state.running = true;
    state.paused = false;
    state.gameOver = false;

    if (!resume) {
      state.player.x = 0;
      state.player.z = 0;
      state.player.yaw = 0;
      state.player.speed = 0;
      state.player.health = 100;
      state.player.teamHealth = 100;
      state.player.steering = 0;
      state.missionStartZ = 0;

      state.abilities.memeReady = true;
      state.abilities.novaReady = true;
      state.abilities.axelReady = true;
      state.abilities.tacticalVision = 0;
      state.abilities.scanTimer = 0;
    } else {
      state.missionStartZ = state.player.z;
    }

    state.controls.accelerate = false;
    state.controls.reverse = false;
    state.controls.brake = false;
    state.controls.left = false;
    state.controls.right = false;
    state.controls.handbrake = false;

    buildObjectives();
    updateMissionHUD();
    updateMissionButtons();

    hide("pauseOverlay");
    hide("resultOverlay");

    switchScreen("gameScreen");

    gameMessage("MISSION LANCÉE", state.currentMission.title);
    setConnection("En mission", true);
  }

  function completeMission() {
    if (!state.running || state.gameOver) return;

    state.running = false;
    state.gameOver = true;

    const mission = state.currentMission;

    if (!state.completedMissions.includes(mission.id)) {
      state.completedMissions.push(mission.id);
      state.money += mission.reward;
    }

    state.unlockedMissions = Math.max(
      state.unlockedMissions,
      Math.min(missions.length, state.missionIndex + 2)
    );

    state.objectives.forEach(objective => {
      objective.done = true;
    });

    renderObjectives();
    updateMissionButtons();

    setText("resultTitle", "Mission réussie !");
    setText("resultEyebrow", "RAPPORT DE MISSION");
    setText("resultMessage",
      `Excellent travail. ${mission.title} est terminée.`);
    setText("resultProgress", "100 %");
    setText("resultReward", `${mission.reward} crédits`);

    show("resultOverlay", true);

    const next = $("nextMissionButton");
    if (next) next.disabled = state.missionIndex >= missions.length - 1;

    saveGame(true);
    setConnection("Mission terminée", true);
  }

  function failMission(reason) {
    if (state.gameOver) return;

    state.running = false;
    state.gameOver = true;

    setText("resultTitle", "Mission interrompue");
    setText("resultEyebrow", "RAPPORT D'OPÉRATION");
    setText("resultMessage", reason);
    setText("resultProgress", `${Math.floor(state.missionProgress)} %`);
    setText("resultReward", "0 crédit");

    const next = $("nextMissionButton");
    if (next) next.disabled = true;

    show("resultOverlay", true);
  }

  /* ======================= PHYSIQUE ======================= */

  function updatePhysics(dt) {
    if (!state.running || state.paused) return;

    const p = state.player;
    const vehicle = state.vehicle;
    const c = state.controls;

    const maxSpeed = 13 + vehicle.speed * 0.20;
    const acceleration = 8 + vehicle.speed * 0.035;
    const reverseSpeed = 5.5;

    if (c.accelerate) {
      p.speed += acceleration * dt;
    } else if (c.reverse) {
      p.speed -= acceleration * 0.65 * dt;
    } else {
      p.speed *= Math.exp(-0.72 * dt);
    }

    if (c.brake) {
      p.speed *= Math.exp(-4.6 * dt);
    }

    if (c.handbrake) {
      p.speed *= Math.exp(-6.0 * dt);
    }

    p.speed = clamp(p.speed, -reverseSpeed, maxSpeed);

    const steeringInput =
      (c.right ? 1 : 0) - (c.left ? 1 : 0);

    const steeringStrength =
      (0.65 + vehicle.handling / 100) *
      state.settings.steeringSensitivity;

    p.steering = lerp(
      p.steering,
      steeringInput,
      Math.min(1, dt * 8)
    );

    if (Math.abs(p.speed) > 0.2) {
      p.yaw +=
        p.steering *
        steeringStrength *
        dt *
        Math.min(1.2, Math.abs(p.speed) / 5) *
        Math.sign(p.speed);
    }

    p.x -= Math.sin(p.yaw) * p.speed * dt;
    p.z -= Math.cos(p.yaw) * p.speed * dt;

    // Limites de la route
    if (Math.abs(p.x) > 5.1) {
      p.x = clamp(p.x, -5.1, 5.1);
      p.speed *= 0.82;

      p.damageTimer += dt;

      if (p.damageTimer > 1.3) {
        p.health = Math.max(0, p.health - 2);
        p.damageTimer = 0;
      }
    } else {
      p.damageTimer = Math.max(0, p.damageTimer - dt);
    }

    // Les capacités de l'équipe
    if (state.abilities.tacticalVision > 0) {
      state.abilities.tacticalVision -= dt;
    }

    if (state.abilities.scanTimer > 0) {
      state.abilities.scanTimer -= dt;
    }

    // Progression de mission
    const mission = state.currentMission;

    if (mission) {
      const targetZ = state.missionStartZ - mission.distance;

      if (p.z <= targetZ && Math.abs(p.x) < 6) {
        completeMission();
      }
    }

    if (p.health <= 0) {
      failMission("Le véhicule ne peut plus continuer.");
    }

    if (p.teamHealth <= 0) {
      failMission("L'équipe n'est plus en état de poursuivre.");
    }

    updateMissionHUD();
  }

  /* ===================== CAPACITÉS ÉQUIPE ===================== */

  function useMemeAbility() {
    if (!state.running || state.paused) {
      notify("Lancez une mission avant d'utiliser cette capacité.");
      return;
    }

    if (!state.abilities.memeReady) {
      notify("Vision tactique en recharge.");
      return;
    }

    state.abilities.memeReady = false;
    state.abilities.tacticalVision = 10;

    setText("memeStatus", "Vision active");
    gameMessage("MEME", "Vision tactique activée pendant 10 secondes.");

    window.setTimeout(() => {
      state.abilities.memeReady = true;
      setText("memeStatus", "Prêt");
    }, 10000);
  }

  function useNovaAbility() {
    if (!state.running || state.paused) {
      notify("Lancez une mission avant d'utiliser cette capacité.");
      return;
    }

    if (!state.abilities.novaReady) {
      notify("Réparation rapide en recharge.");
      return;
    }

    state.abilities.novaReady = false;

    state.player.health = clamp(state.player.health + 35, 0, 100);
    state.player.teamHealth = clamp(state.player.teamHealth + 10, 0, 100);

    setText("novaStatus", "Réparation effectuée");
    gameMessage("NOVA", "Le véhicule a été réparé de 35 %.");

    updateMissionHUD();

    window.setTimeout(() => {
      state.abilities.novaReady = true;
      setText("novaStatus", "Prête");
    }, 15000);
  }

  function useAxelAbility() {
    if (!state.running || state.paused) {
      notify("Lancez une mission avant d'utiliser cette capacité.");
      return;
    }

    if (!state.abilities.axelReady) {
      notify("Scan de zone en recharge.");
      return;
    }

    state.abilities.axelReady = false;
    state.abilities.scanTimer = 12;

    const mission = state.currentMission;
    const targetZ = state.missionStartZ - mission.distance;
    const distance = Math.round(Math.abs(targetZ - state.player.z));

    setText("axelStatus", `Cible : ${distance} m`);
    gameMessage("AXEL", `Zone analysée. Distance estimée : ${distance} m.`);

    const radar = $("minimapPanel");
    if (radar) radar.classList.add("radar-scanning");

    window.setTimeout(() => {
      state.abilities.axelReady = true;
      setText("axelStatus", "Prêt");

      if (radar) radar.classList.remove("radar-scanning");
    }, 12000);
  }

  /* =========================== GARAGE =========================== */

  function updateGarageUI() {
    setText("garageVehicleName", state.vehicle.name);
    setText(
      "garageVehicleDescription",
      `Véhicule Force Unie · Niveau ${state.vehicle.level + 1}`
    );

    setText("garageSpeedValue", `${state.vehicle.speed}/100`);
    setText("garageArmorValue", `${state.vehicle.armor}/100`);
    setText("garageHandlingValue", `${state.vehicle.handling}/100`);

    setWidth("garageSpeedBar", state.vehicle.speed);
    setWidth("garageArmorBar", state.vehicle.armor);
    setWidth("garageHandlingBar", state.vehicle.handling);
  }

  function repairVehicle() {
    state.player.health = 100;
    state.player.teamHealth = 100;

    updateMissionHUD();
    setStatus("garageMessage", "Véhicule et équipe réparés.");
    notify("Réparation terminée.");
  }

  function upgradeVehicle() {
    const cost = 100 + state.vehicle.level * 75;

    if (state.money < cost) {
      setStatus(
        "garageMessage",
        `Fonds insuffisants. Coût : ${cost} crédits.`
      );

      notify(`Il vous faut ${cost} crédits pour cette amélioration.`);
      return;
    }

    if (state.vehicle.level >= 10) {
      notify("Le véhicule a atteint son niveau maximum.");
      return;
    }

    state.money -= cost;
    state.vehicle.level += 1;

    state.vehicle.speed = clamp(state.vehicle.speed + 4, 1, 100);
    state.vehicle.armor = clamp(state.vehicle.armor + 3, 1, 100);
    state.vehicle.handling = clamp(state.vehicle.handling + 3, 1, 100);

    updateGarageUI();

    setStatus(
      "garageMessage",
      `Amélioration terminée. Niveau ${state.vehicle.level + 1}.`
    );

    saveGame(true);
    notify("Véhicule amélioré avec succès.");
  }

  /* ======================= PARAMÈTRES ======================= */

  function syncSettingsUI() {
    const s = state.settings;

    const controls = {
      graphicsQuality: s.graphicsQuality,
      cameraDistance: s.cameraDistance,
      steeringSensitivity: s.steeringSensitivity,
      gameVolume: s.gameVolume,
      vibrationEnabled: s.vibrationEnabled,
      touchZoomEnabled: s.touchZoomEnabled,
      showSubtitles: s.showSubtitles
    };

    for (const [id, value] of Object.entries(controls)) {
      const el = $(id);
      if (!el) continue;

      if (el.type === "checkbox") el.checked = Boolean(value);
      else el.value = String(value);
    }

    setText("cameraDistanceValue", s.cameraDistance);
    setText("steeringSensitivityValue",
      Number(s.steeringSensitivity).toFixed(1));
    setText("gameVolumeValue", `${s.gameVolume} %`);

    state.camera.distance = Number(s.cameraDistance) || 7;
  }

  function readSettingsUI() {
    const s = state.settings;

    if ($("graphicsQuality")) {
      s.graphicsQuality = $("graphicsQuality").value;
    }

    if ($("cameraDistance")) {
      s.cameraDistance = Number($("cameraDistance").value);
    }

    if ($("steeringSensitivity")) {
      s.steeringSensitivity = Number($("steeringSensitivity").value);
    }

    if ($("gameVolume")) {
      s.gameVolume = Number($("gameVolume").value);
    }

    for (const id of [
      "vibrationEnabled",
      "touchZoomEnabled",
      "showSubtitles"
    ]) {
      if ($(id)) s[id] = $(id).checked;
    }

    state.camera.distance = s.cameraDistance;
  }

  async function saveSettings() {
    readSettingsUI();
    syncSettingsUI();

    resizeRenderer();

    setStatus("settingsMessage", "Paramètres enregistrés.");
    await saveGame(true);

    notify("Paramètres appliqués.");
  }

  async function resetSettings() {
    state.settings = { ...defaultSettings };
    syncSettingsUI();
    resizeRenderer();

    setStatus("settingsMessage", "Paramètres par défaut restaurés.");

    await saveGame(true);
    notify("Configuration réinitialisée.");
  }

  /* ======================= NAVIGATION ======================= */

  const screenIds = [
    "loadingScreen",
    "mainMenu",
    "gameScreen",
    "missionsScreen",
    "garageScreen",
    "settingsScreen",
    "helpScreen"
  ];

  function switchScreen(id) {
    for (const screenId of screenIds) {
      show(screenId, screenId === id);
    }

    state.mode = id;

    if (id === "gameScreen") {
      resizeRenderer();
    }

    if (id !== "gameScreen") {
      releaseControls();
    }
  }

  function showPause() {
    if (!state.started || !state.running || state.gameOver) return;

    state.paused = true;
    releaseControls();
    show("pauseOverlay", true);
  }

  function resumeGame() {
    if (!state.started || state.gameOver) return;

    state.paused = false;
    state.running = true;

    hide("pauseOverlay");
    switchScreen("gameScreen");
  }

  function requestConfirmation(message, action) {
    setText("confirmTitle", "Confirmer l'action");
    setText("confirmMessage", message);

    state.confirmAction = action;
    show("confirmOverlay", true);
  }

  function confirmAccepted() {
    const action = state.confirmAction;
    state.confirmAction = null;

    hide("confirmOverlay");

    if (typeof action === "function") action();
  }

  function exitToMenu() {
    requestConfirmation(
      "Quitter la mission en cours ? Sauvegardez votre progression avant de partir.",
      async () => {
        await saveGame(true);

        state.running = false;
        state.paused = false;
        state.started = false;

        hide("pauseOverlay");
        hide("resultOverlay");

        switchScreen("mainMenu");
        updateSaveButtons();
      }
    );
  }

  /* ====================== COMMANDES ====================== */

  function setControl(name, value) {
    if (!(name in state.controls)) return;
    state.controls[name] = Boolean(value);
  }

  function releaseControls() {
    for (const key of Object.keys(state.controls)) {
      state.controls[key] = false;
    }
  }

  function bindHoldButton(id, control) {
    const button = $(id);
    if (!button) return;

    const down = event => {
      event.preventDefault();

      if (!state.running || state.paused) return;

      setControl(control, true);

      try {
        button.setPointerCapture(event.pointerId);
      } catch (_) {}
    };

    const up = event => {
      if (event) event.preventDefault();
      setControl(control, false);
    };

    button.addEventListener("pointerdown", down);
    button.addEventListener("pointerup", up);
    button.addEventListener("pointercancel", up);
    button.addEventListener("lostpointercapture", up);
    button.addEventListener("contextmenu", e => e.preventDefault());
  }

  function bindTouchControls() {
    bindHoldButton("accelerateButton", "accelerate");
    bindHoldButton("reverseButton", "reverse");
    bindHoldButton("brakeButton", "brake");
    bindHoldButton("steerLeftButton", "left");
    bindHoldButton("steerRightButton", "right");
    bindHoldButton("handbrakeButton", "handbrake");

    const zoomTarget = $("gameViewport");
    if (!zoomTarget) return;

    zoomTarget.addEventListener("pointerdown", event => {
      state.touchPointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY
      });

      if (state.touchPointers.size === 2) {
        const pts = [...state.touchPointers.values()];

        state.lastPinchDistance = Math.hypot(
          pts[0].x - pts[1].x,
          pts[0].y - pts[1].y
        );
      }
    }, { passive: true });

    zoomTarget.addEventListener("pointermove", event => {
      if (!state.touchPointers.has(event.pointerId)) return;

      state.touchPointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY
      });

      if (!state.settings.touchZoomEnabled ||
          state.touchPointers.size < 2) return;

      const pts = [...state.touchPointers.values()];

      const nextDistance = Math.hypot(
        pts[0].x - pts[1].x,
        pts[0].y - pts[1].y
      );

      if (state.lastPinchDistance > 0) {
        const delta = nextDistance - state.lastPinchDistance;

        state.camera.zoom = clamp(
          state.camera.zoom - delta * 0.025,
          -3,
          7
        );
      }

      state.lastPinchDistance = nextDistance;
    }, { passive: true });

    const releasePointer = event => {
      state.touchPointers.delete(event.pointerId);

      if (state.touchPointers.size < 2) {
        state.lastPinchDistance = 0;
      }
    };

    zoomTarget.addEventListener("pointerup", releasePointer);
    zoomTarget.addEventListener("pointercancel", releasePointer);
  }

  function bindKeyboard() {
    window.addEventListener("keydown", event => {
      const key = event.key.toLowerCase();

      if ([
        "arrowup", "arrowdown", "arrowleft", "arrowright", " "
      ].includes(key)) {
        event.preventDefault();
      }

      state.keys.add(key);

      if (key === "escape") {
        if (!$("pauseOverlay")?.hidden) {
          resumeGame();
        } else {
          showPause();
        }
      }

      if ((key === "p" || key === " ") &&
          state.running && !event.repeat) {
        showPause();
      }

      if (!state.running || state.paused) return;

      setControl("accelerate", state.keys.has("w") ||
        state.keys.has("arrowup"));

      setControl("reverse", state.keys.has("s") ||
        state.keys.has("arrowdown"));

      setControl("left", state.keys.has("a") ||
        state.keys.has("arrowleft"));

      setControl("right", state.keys.has("d") ||
        state.keys.has("arrowright"));

      setControl("brake", state.keys.has("shift"));
    });

    window.addEventListener("keyup", event => {
      state.keys.delete(event.key.toLowerCase());

      setControl("accelerate",
        state.keys.has("w") || state.keys.has("arrowup"));

      setControl("reverse",
        state.keys.has("s") || state.keys.has("arrowdown"));

      setControl("left",
        state.keys.has("a") || state.keys.has("arrowleft"));

      setControl("right",
        state.keys.has("d") || state.keys.has("arrowright"));

      setControl("brake", state.keys.has("shift"));
    });

    window.addEventListener("blur", () => {
      releaseControls();
      state.keys.clear();
    });
  }

  /* ========================= BOUTONS ========================= */

  function bindButton(id, callback) {
    const el = $(id);
    if (!el) {
      console.warn(`Bouton absent du HTML : ${id}`);
      return;
    }

    el.addEventListener("click", event => {
      event.preventDefault();

      try {
        const result = callback(event);

        if (result && typeof result.catch === "function") {
          result.catch(error => {
            console.error(`Action ${id} :`, error);
            notify("Une erreur est survenue pendant cette action.");
          });
        }
      } catch (error) {
        console.error(`Action ${id} :`, error);
        notify("Une erreur est survenue pendant cette action.");
      }
    });
  }

  function bindAllButtons() {
    bindButton("brandHomeButton", () => {
      if (state.running) exitToMenu();
      else switchScreen("mainMenu");
    });

    bindButton("newGameButton", () => startMission("mission-01"));
    bindButton("continueGameButton", async () => {
      const loaded = await loadSave();

      if (loaded) {
        startMission(
          missions[state.missionIndex].id,
          true
        );
      } else {
        notify("Aucune sauvegarde disponible.");
      }
    });

    bindButton("missionsMenuButton", () => {
      updateMissionButtons();
      switchScreen("missionsScreen");
    });

    bindButton("garageMenuButton", () => {
      updateGarageUI();
      switchScreen("garageScreen");
    });

    bindButton("settingsMenuButton", () => {
      syncSettingsUI();
      switchScreen("settingsScreen");
    });

    bindButton("helpMenuButton", () => switchScreen("helpScreen"));

    bindButton("backToMenuButton", exitToMenu);
    bindButton("headerPauseButton", showPause);
    bindButton("gamePauseButton", showPause);

    bindButton("resumeGameButton", resumeGame);

    bindButton("pauseSaveButton", async () => {
      await saveGame(false);
    });

    bindButton("pauseRestartButton", () => {
      requestConfirmation(
        "Recommencer la mission depuis le début ?",
        () => startMission(state.currentMission?.id || "mission-01")
      );
    });

    bindButton("pauseExitButton", exitToMenu);

    bindButton("resultMenuButton", () => {
      hide("resultOverlay");
      state.started = false;
      switchScreen("mainMenu");
    });

    bindButton("replayMissionButton", () => {
      startMission(state.currentMission?.id || "mission-01");
    });

    bindButton("nextMissionButton", () => {
      if (state.missionIndex < missions.length - 1) {
        startMission(missions[state.missionIndex + 1].id);
      }
    });

    bindButton("confirmCancelButton", () => {
      state.confirmAction = null;
      hide("confirmOverlay");
    });

    bindButton("confirmAcceptButton", confirmAccepted);

    bindButton("closeToastButton", () => hide("globalToast"));

    bindButton("footerSaveButton", () => saveGame(false));
    bindButton("saveStatusButton", () => {
      if (state.saveAvailable) {
        notify(`Sauvegarde disponible. Dernière sauvegarde : ${
          state.lastSave
            ? new Date(state.lastSave).toLocaleTimeString()
            : "heure inconnue"
        }`);
      } else {
        notify("Aucune sauvegarde confirmée pour le moment.");
      }
    });

    bindButton("repairVehicleButton", repairVehicle);
    bindButton("upgradeVehicleButton", upgradeVehicle);

    bindButton("saveSettingsButton", saveSettings);
    bindButton("resetSettingsButton", resetSettings);

    bindButton("cameraModeButton", () => {
      state.camera.mode = (state.camera.mode + 1) % 2;

      notify(
        state.camera.mode === 0
          ? "Caméra arrière activée."
          : "Caméra alternative activée."
      );
    });

    bindButton("interactButton", () => {
      if (!state.running) {
        notify("Aucune mission en cours.");
        return;
      }

      const mission = state.currentMission;
      const targetZ = state.missionStartZ - mission.distance;
      const distance = Math.abs(state.player.z - targetZ);

      if (distance < 18) {
        completeMission();
      } else {
        notify("Approchez-vous du point de mission pour interagir.");
      }
    });

    bindButton("memeAbilityButton", useMemeAbility);
    bindButton("novaAbilityButton", useNovaAbility);
    bindButton("axelAbilityButton", useAxelAbility);

    bindButton("toggleObjectivesButton", () => {
      const list = $("objectiveList");
      if (!list) return;

      const collapsed = list.hidden;
      list.hidden = !collapsed;

      const button = $("toggleObjectivesButton");
      if (button) {
        button.textContent = collapsed ? "−" : "+";
        button.setAttribute("aria-expanded", String(collapsed));
      }
    });

    bindButton("toggleMinimapButton", () => {
      const canvas = $("minimapCanvas");
      if (!canvas) return;

      const hidden = canvas.hidden;
      canvas.hidden = !hidden;

      const button = $("toggleMinimapButton");
      if (button) {
        button.setAttribute("aria-pressed", String(!hidden));
      }
    });

    document.querySelectorAll("[data-back-menu]").forEach(button => {
      button.addEventListener("click", () => switchScreen("mainMenu"));
    });

    document.querySelectorAll("[data-start-mission]").forEach(button => {
      button.addEventListener("click", () => {
        if (!button.disabled) {
          startMission(button.dataset.startMission);
        }
      });
    });

    bindSettingInput("cameraDistance", "cameraDistanceValue", value => {
      state.settings.cameraDistance = Number(value);
      state.camera.distance = Number(value);
    });

    bindSettingInput("steeringSensitivity", "steeringSensitivityValue", value => {
      state.settings.steeringSensitivity = Number(value);
    });

    bindSettingInput("gameVolume", "gameVolumeValue", value => {
      state.settings.gameVolume = Number(value);
    });
  }

  function bindSettingInput(inputId, outputId, callback) {
    const input = $(inputId);
    if (!input) return;

    input.addEventListener("input", () => {
      const value = input.value;
      callback(value);

      const output = $(outputId);
      if (output) {
        output.textContent = inputId === "gameVolume"
          ? `${value} %`
          : inputId === "steeringSensitivity"
            ? Number(value).toFixed(1)
            : value;
      }
    });
  }

  /* =========================== BOUCLE =========================== */

  function update(dt) {
    state.elapsed += dt;

    updatePhysics(dt);

    if (state.notificationTimer > 0) {
      state.notificationTimer -= dt;

      if (state.notificationTimer <= 0) {
        hide("globalToast");
      }
    }

    if (state.gameNotificationTimer > 0) {
      state.gameNotificationTimer -= dt;

      if (state.gameNotificationTimer <= 0) {
        hide("gameNotification");
      }
    }

    if (state.mode === "gameScreen") {
      renderMinimap();
    }
  }

  function frame(timestamp) {
    if (!state.initialized) return;

    const previous = state.lastFrame || timestamp;
    const dt = Math.min(0.05, Math.max(0, (timestamp - previous) / 1000));

    state.lastFrame = timestamp;

    try {
      update(dt);

      if (state.fallback2D) {
        renderFallback2D();
      } else if (state.gl && !state.gl.isContextLost()) {
        renderWebGL();
      }
    } catch (error) {
      console.error("Erreur dans la boucle de jeu :", error);
    }

    state.raf = requestAnimationFrame(frame);
  }

  /* ========================= INITIALISATION ========================= */

  async function initialize() {
    show("loadingScreen", true);

    const progress = $("loadingProgressBar");
    const progressContainer = $("loadingProgress");

    const setProgress = (value, message) => {
      if (progress) progress.style.width = `${value}%`;

      if (progressContainer) {
        progressContainer.setAttribute("aria-valuenow", String(value));
      }

      setText("loadingMessage", message);
    };

    try {
      setProgress(10, "Initialisation du moteur graphique…");

      try {
        initializeWebGL();
        setConnection("WebGL actif", true);
      } catch (error) {
        console.warn("WebGL non disponible :", error);

        initializeFallback2D();
        setConnection("Mode graphique de secours", false);

        setText(
          "loadingError",
          "WebGL est indisponible. Le jeu démarre en mode 2D de secours."
        );
        show("loadingError", true);
      }

      setProgress(35, "Préparation de la simulation…");

      bindAllButtons();
      bindTouchControls();
      bindKeyboard();

      setProgress(55, "Chargement des sauvegardes…");

      await loadSave();

      setProgress(78, "Préparation de l'équipe Force Unie…");

      updateGarageUI();
      updateMissionButtons();
      updateMissionHUD();

      setProgress(100, "Prêt à jouer !");

      state.initialized = true;

      window.setTimeout(() => {
        switchScreen("mainMenu");
      }, 250);

      state.raf = requestAnimationFrame(frame);

      window.addEventListener("resize", resizeRenderer);

      document.addEventListener("visibilitychange", () => {
        if (document.hidden && state.running && !state.paused) {
          showPause();
        }
      });

      window.addEventListener("beforeunload", () => {
        releaseControls();
      });

      console.info(
        `FOBAS MISSION FORCE UNIE 3D v${VERSION} initialisé.`
      );
    } catch (error) {
      console.error("Initialisation FOBAS :", error);

      setText(
        "loadingError",
        `Impossible de démarrer le jeu : ${error.message}`
      );

      show("loadingError", true);
      show("loadingRetryButton", true);

      setConnection("Erreur d'initialisation", false);
    }
  }

  bindButtonOnRetry();

  function bindButtonOnRetry() {
    const button = $("loadingRetryButton");
    if (!button) return;

    button.addEventListener("click", () => {
      window.location.reload();
    });
  }

  return {
    initialize,
    saveGame,
    startMission,
    state
  };
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    FOBAS.initialize();
  }, { once: true });
} else {
  FOBAS.initialize();
}