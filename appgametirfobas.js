
/* ============================================================
   FOBAS MISSION 3D — MEME & TEAM
   Native WebGL 3D Engine
   Pa gen Three.js | Pa gen CDN | Pa gen bibliyotèk ekstèn
   Android + PC | IndexedDB + localStorage
   Fichye: appgametirfobas.js
============================================================ */

(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

  const ui = {
    loading: $("loading-screen"),
    progress: $("loading-progress"),
    loadingStatus: $("loading-status"),
    enter: $("btn-enter"),
    menu: $("main-menu"),
    game: $("game-screen"),
    canvas: $("game-canvas"),
    world: $("game-world"),
    fallback: $("world-fallback"),

    play: $("btn-play"),
    continue: $("btn-continue"),
    missions: $("btn-missions"),
    characters: $("btn-characters"),
    settings: $("btn-settings"),

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

  const CHARACTERS = {
    MEME:   { color: [0.12, 0.91, 0.91], speed: 4.5 },
    FOBAS:  { color: [1.00, 0.56, 0.15], speed: 4.0 },
    SHADOW: { color: [0.55, 0.39, 1.00], speed: 5.0 },
    BLAZE:  { color: [1.00, 0.20, 0.31], speed: 5.4 },
    TITAN:  { color: [0.27, 0.83, 0.45], speed: 3.8 }
  };

  const MISSIONS = {
    1: { title: "Premye Kontak", description: "Kolekte 5 kristal.", target: 5, reward: 100 },
    2: { title: "Meme & Team", description: "Kolekte 8 kristal.", target: 8, reward: 250 },
    3: { title: "Defi Final", description: "Kolekte 12 kristal.", target: 12, reward: 500 }
  };

  const state = {
    mission: 1,
    character: "MEME",
    selectedCharacter: "MEME",

    active: false,
    paused: false,
    finished: false,
    sprint: false,

    x: 0, z: 0,
    facing: 0,
    cameraAngle: 0,
    cameraPitch: 0.35,
    cameraDistance: 8,
    targetCameraDistance: 8,

    health: 100,
    energy: 100,
    score: 0,
    collected: 0,
    elapsed: 0,

    jumping: false,
    jumpY: 0,
    jumpVelocity: 0,

    joyX: 0,
    joyY: 0,
    joyActive: false,
    joyPointer: null,

    keys: Object.create(null),
    crystals: [],
    trees: [],
    buildings: [],
    particles: [],

    settings: {
      quality: "high",
      sensitivity: 5,
      volume: 70,
      sound: true
    },

    lastTime: 0,
    saveTimer: 0,
    audio: null,
    notifyTimer: null
  };

  /* ===================== WEBGL ENGINE ===================== */

  const canvas = ui.canvas;
  let gl = null;
  let program = null;
  let locations = {};
  let meshes = {};
  let canvasWidth = 1;
  let canvasHeight = 1;
  let animationStarted = false;
  let lostContext = false;

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
    uniform vec3 uCamera;
    uniform float uEmissive;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 lightDirection = normalize(vec3(-0.45, 0.9, 0.35));

      float diffuse = max(dot(normal, lightDirection), 0.0);
      float hemisphere = normal.y * 0.5 + 0.5;

      vec3 ambient = mix(
        vec3(0.10, 0.16, 0.22),
        vec3(0.37, 0.50, 0.48),
        hemisphere
      );

      float light = 0.40 + diffuse * 0.75;
      vec3 color = uColor * (ambient + light * 0.55);

      float distanceFog = length(uCamera - vWorldPosition);
      float fog = smoothstep(18.0, 42.0, distanceFog);

      vec3 fogColor = vec3(0.10, 0.22, 0.29);
      color = mix(color, fogColor, fog * 0.68);

      color += uColor * uEmissive;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || "Shader error";
      gl.deleteShader(shader);
      throw new Error(message);
    }

    return shader;
  }

  function createProgram() {
    const vs = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    const p = gl.createProgram();

    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);

    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p) || "WebGL link error");
    }

    program = p;
    gl.useProgram(program);

    locations = {
      position: gl.getAttribLocation(program, "aPosition"),
      normal: gl.getAttribLocation(program, "aNormal"),
      projection: gl.getUniformLocation(program, "uProjection"),
      view: gl.getUniformLocation(program, "uView"),
      model: gl.getUniformLocation(program, "uModel"),
      color: gl.getUniformLocation(program, "uColor"),
      camera: gl.getUniformLocation(program, "uCamera"),
      emissive: gl.getUniformLocation(program, "uEmissive")
    };
  }

  /* ===================== MATEMATIK 3D ===================== */

  function identity() {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  function multiply(a, b) {
    const out = new Float32Array(16);

    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        let sum = 0;

        for (let k = 0; k < 4; k++) {
          sum += a[k * 4 + row] * b[col * 4 + k];
        }

        out[col * 4 + row] = sum;
      }
    }

    return out;
  }

  function perspective(fov, aspect, near, far) {
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

  function lookAt(eye, target, up) {
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

  function modelMatrix(x, y, z, sx, sy, sz, rotationY = 0) {
    const c = Math.cos(rotationY);
    const s = Math.sin(rotationY);

    return new Float32Array([
      c * sx, 0, -s * sx, 0,
      0, sy, 0, 0,
      s * sz, 0, c * sz, 0,
      x, y, z, 1
    ]);
  }

  /* ===================== JEYOMETRI ===================== */

  function createMesh(vertices, normals, indices) {
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
      vertexBuffer,
      normalBuffer,
      indexBuffer,
      count: indices.length
    };
  }

  function makeCube() {
    const faces = [
      { n: [0, 0, 1],  v: [[-0.5,-0.5,0.5],[0.5,-0.5,0.5],[0.5,0.5,0.5],[-0.5,0.5,0.5]] },
      { n: [0, 0,-1],  v: [[0.5,-0.5,-0.5],[-0.5,-0.5,-0.5],[-0.5,0.5,-0.5],[0.5,0.5,-0.5]] },
      { n: [1, 0, 0],  v: [[0.5,-0.5,0.5],[0.5,-0.5,-0.5],[0.5,0.5,-0.5],[0.5,0.5,0.5]] },
      { n: [-1,0, 0],  v: [[-0.5,-0.5,-0.5],[-0.5,-0.5,0.5],[-0.5,0.5,0.5],[-0.5,0.5,-0.5]] },
      { n: [0, 1, 0],  v: [[-0.5,0.5,0.5],[0.5,0.5,0.5],[0.5,0.5,-0.5],[-0.5,0.5,-0.5]] },
      { n: [0,-1, 0],  v: [[-0.5,-0.5,-0.5],[0.5,-0.5,-0.5],[0.5,-0.5,0.5],[-0.5,-0.5,0.5]] }
    ];

    const vertices = [];
    const normals = [];
    const indices = [];

    for (const face of faces) {
      const base = vertices.length / 3;

      for (const v of face.v) {
        vertices.push(...v);
        normals.push(...face.n);
      }

      indices.push(
        base, base + 1, base + 2,
        base, base + 2, base + 3
      );
    }

    return createMesh(vertices, normals, indices);
  }

  function makeOctahedron() {
    const vertices = [
      0,1,0,  1,0,0,  0,0,1,
      0,1,0,  0,0,1, -1,0,0,
      0,1,0, -1,0,0,  0,0,-1,
      0,1,0,  0,0,-1, 1,0,0,
      0,-1,0, 0,0,1, 1,0,0,
      0,-1,0,-1,0,0, 0,0,1,
      0,-1,0, 0,0,-1,-1,0,0,
      0,-1,0, 1,0,0, 0,0,-1
    ];

    const normals = [];

    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i], y = vertices[i + 1], z = vertices[i + 2];
      const l = Math.hypot(x, y, z) || 1;
      normals.push(x / l, y / l, z / l);
    }

    const indices = Array.from(
      { length: vertices.length / 3 },
      (_, i) => i
    );

    return createMesh(vertices, normals, indices);
  }

  function makeCone(segments = 8) {
    const vertices = [];
    const normals = [];
    const indices = [];

    for (let i = 0; i < segments; i++) {
      const a = i / segments * Math.PI * 2;
      const b = (i + 1) / segments * Math.PI * 2;

      const p1 = [Math.cos(a) * 0.5, -0.5, Math.sin(a) * 0.5];
      const p2 = [Math.cos(b) * 0.5, -0.5, Math.sin(b) * 0.5];
      const tip = [0, 0.5, 0];

      const base = vertices.length / 3;
      vertices.push(...p1, ...p2, ...tip);

      for (const p of [p1, p2, tip]) {
        const l = Math.hypot(p[0], p[1], p[2]) || 1;
        normals.push(p[0] / l, p[1] / l, p[2] / l);
      }

      indices.push(base, base + 1, base + 2);
    }

    return createMesh(vertices, normals, indices);
  }

  function setupMeshes() {
    meshes.cube = makeCube();
    meshes.crystal = makeOctahedron();
    meshes.cone = makeCone(10);
  }

  function drawMesh(mesh, model, color, emissive = 0) {
    if (!mesh || lostContext) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
    gl.enableVertexAttribArray(locations.position);
    gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
    gl.enableVertexAttribArray(locations.normal);
    gl.vertexAttribPointer(locations.normal, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);

    gl.uniformMatrix4fv(locations.model, false, model);
    gl.uniform3fv(locations.color, color);
    gl.uniform1f(locations.emissive, emissive);

    gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
  }

  /* ===================== MOND 3D ===================== */

  function createWorld() {
    state.crystals = [];
    state.trees = [];
    state.particles = [];
    state.buildings = [];

    const target = MISSIONS[state.mission].target;

    for (let i = 0; i < target; i++) {
      let x, z;

      if (i === 0) {
        x = 2;
        z = 0;
      } else {
        x = rand(-10, 10);
        z = rand(-10, 10);
      }

      state.crystals.push({
        x, z,
        y: 0.9,
        phase: rand(0, Math.PI * 2),
        taken: false
      });
    }

    for (let i = 0; i < 48; i++) {
      let x = rand(-20, 20);
      let z = rand(-20, 20);

      if (Math.abs(x) < 7 && Math.abs(z) < 7) {
        x = x < 0 ? -8 - Math.random() * 5 : 8 + Math.random() * 5;
      }

      state.trees.push({
        x, z,
        size: rand(1.2, 2.5),
        shade: rand(0.8, 1.2)
      });
    }

    state.buildings = [
      { x: -5, z: -4, w: 3.2, h: 2.4, d: 2.8, color: [0.13,0.39,0.49] },
      { x: 4, z: -5, w: 2.6, h: 3.3, d: 2.5, color: [0.20,0.31,0.53] },
      { x: 6, z: 3, w: 3.0, h: 2.1, d: 2.4, color: [0.40,0.23,0.55] },
      { x: -6, z: 4, w: 2.8, h: 2.7, d: 2.5, color: [0.50,0.28,0.18] },
      { x: 0, z: -8, w: 4.5, h: 2.1, d: 2.4, color: [0.10,0.42,0.40] }
    ];
  }

  function drawGround() {
    const cube = meshes.cube;
    const startX = Math.floor(state.x) - 15;
    const startZ = Math.floor(state.z) - 15;
    const quality = state.settings.quality;
    const range = quality === "low" ? 10 : quality === "medium" ? 13 : 16;

    for (let x = startX; x < startX + range * 2; x++) {
      for (let z = startZ; z < startZ + range * 2; z++) {
        const checker = (x + z) & 1;
        const color = checker
          ? [0.08, 0.31, 0.27]
          : [0.10, 0.36, 0.30];

        drawMesh(
          cube,
          modelMatrix(x + 0.5, -0.12, z + 0.5, 1, 0.24, 1),
          color
        );
      }
    }
  }

  function drawBuildings() {
    for (const b of state.buildings) {
      drawMesh(
        meshes.cube,
        modelMatrix(b.x, b.h / 2, b.z, b.w, b.h, b.d),
        b.color
      );

      // Do kay la.
      drawMesh(
        meshes.cube,
        modelMatrix(b.x, b.h + 0.08, b.z, b.w * 1.08, 0.18, b.d * 1.08),
        [0.12, 0.70, 0.68],
        0.12
      );

      // Fenèt devan.
      for (let i = -1; i <= 1; i++) {
        drawMesh(
          meshes.cube,
          modelMatrix(
            b.x + i * b.w * 0.27,
            b.h * 0.62,
            b.z + b.d / 2 + 0.012,
            0.28, 0.38, 0.025
          ),
          [0.24, 0.92, 0.91],
          0.22
        );
      }
    }
  }

  function drawTrees(time) {
    for (const tree of state.trees) {
      const s = tree.size;

      drawMesh(
        meshes.cube,
        modelMatrix(tree.x, s * 0.65, tree.z, 0.25, s * 1.3, 0.25),
        [0.30, 0.17, 0.10]
      );

      for (let layer = 0; layer < 3; layer++) {
        const scale = s * (1.3 - layer * 0.23);

        drawMesh(
          meshes.cone,
          modelMatrix(
            tree.x,
            s * (1.45 + layer * 0.43),
            tree.z,
            scale, s * 1.25, scale,
            time * 0.00012 + layer
          ),
          layer === 0
            ? [0.05, 0.30, 0.20]
            : layer === 1
              ? [0.07, 0.42, 0.25]
              : [0.10, 0.50, 0.30]
        );
      }
    }
  }

  function drawCrystals(time) {
    for (const crystal of state.crystals) {
      if (crystal.taken) continue;

      const bob = Math.sin(time * 0.002 + crystal.phase) * 0.15;

      drawMesh(
        meshes.crystal,
        modelMatrix(
          crystal.x,
          crystal.y + bob,
          crystal.z,
          0.48, 0.90, 0.48,
          time * 0.001 + crystal.phase
        ),
        [0.10, 1.00, 0.85],
        0.8
      );

      drawMesh(
        meshes.crystal,
        modelMatrix(
          crystal.x,
          crystal.y + 0.1 + bob,
          crystal.z,
          0.24, 0.52, 0.24,
          -time * 0.0015
        ),
        [0.80, 1.00, 1.00],
        0.65
      );
    }
  }

  function drawPlayer(time) {
    const char = CHARACTERS[state.character];
    const bob = state.active && !state.paused
      ? Math.sin(time * (state.sprint ? 0.018 : 0.009)) * 0.035
      : 0;

    const x = state.x;
    const z = state.z;
    const y = state.jumpY + bob;

    // Lonbraj senp sou tè a.
    drawMesh(
      meshes.cube,
      modelMatrix(x, 0.015, z, 0.75, 0.025, 0.45, state.facing),
      [0.025, 0.07, 0.08]
    );

    // Janm.
    const legSwing = state.sprint ? Math.sin(time * 0.02) * 0.12 : 0;

    drawMesh(
      meshes.cube,
      modelMatrix(x - 0.17, 0.40 + y, z + legSwing, 0.18, 0.58, 0.20),
      [0.06, 0.12, 0.18]
    );

    drawMesh(
      meshes.cube,
      modelMatrix(x + 0.17, 0.40 + y, z - legSwing, 0.18, 0.58, 0.20),
      [0.06, 0.12, 0.18]
    );

    // Kò.
    drawMesh(
      meshes.cube,
      modelMatrix(x, 0.98 + y, z, 0.57, 0.72, 0.35, state.facing),
      char.color
    );

    // Bras.
    drawMesh(
      meshes.cube,
      modelMatrix(x - 0.37, 0.98 + y, z, 0.15, 0.65, 0.18, state.facing),
      char.color
    );

    drawMesh(
      meshes.cube,
      modelMatrix(x + 0.37, 0.98 + y, z, 0.15, 0.65, 0.18, state.facing),
      char.color
    );

    // Tèt ak kas.
    drawMesh(
      meshes.cube,
      modelMatrix(x, 1.58 + y, z, 0.43, 0.43, 0.40, state.facing),
      [0.84, 0.66, 0.50]
    );

    drawMesh(
      meshes.cube,
      modelMatrix(x, 1.70 + y, z, 0.47, 0.20, 0.44, state.facing),
      char.color
    );

    // Vizè.
    drawMesh(
      meshes.cube,
      modelMatrix(
        x,
        1.58 + y,
        z + Math.cos(state.facing) * 0.215,
        0.31, 0.095, 0.035,
        state.facing
      ),
      [0.03, 0.10, 0.15],
      0.2
    );
  }

  function drawParticles() {
    for (const p of state.particles) {
      drawMesh(
        meshes.cube,
        modelMatrix(p.x, p.y, p.z, p.size, p.size, p.size),
        p.color,
        0.35
      );
    }
  }

  /* ===================== KAMERA AK RANNING ===================== */

  function resize() {
    if (!canvas || !gl || lostContext) return;

    const rect = (ui.world || canvas).getBoundingClientRect();

    canvasWidth = Math.max(1, rect.width || window.innerWidth);
    canvasHeight = Math.max(1, rect.height || window.innerHeight);

    const maxRatio = state.settings.quality === "high" ? 1.5 : 1;
    const ratio = Math.min(window.devicePixelRatio || 1, maxRatio);

    canvas.width = Math.round(canvasWidth * ratio);
    canvas.height = Math.round(canvasHeight * ratio);
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function render(time) {
    if (!gl || lostContext || !program) return;

    gl.clearColor(0.035, 0.09, 0.15, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = canvas.width / Math.max(1, canvas.height);
    const projection = perspective(1.02, aspect, 0.1, 100);

    const distanceFromPlayer = state.cameraDistance;
    const angle = state.cameraAngle;
    const pitch = state.cameraPitch;

    const horizontal = distanceFromPlayer * Math.cos(pitch);

    const eye = [
      state.x + Math.sin(angle) * horizontal,
      2.7 + distanceFromPlayer * Math.sin(pitch),
      state.z + Math.cos(angle) * horizontal
    ];

    const target = [state.x, 0.9 + state.jumpY * 0.3, state.z];

    const view = lookAt(eye, target, [0, 1, 0]);

    gl.useProgram(program);
    gl.uniformMatrix4fv(locations.projection, false, projection);
    gl.uniformMatrix4fv(locations.view, false, view);
    gl.uniform3fv(locations.camera, eye);

    drawGround();
    drawTrees(time);
    drawBuildings();
    drawCrystals(time);
    drawParticles();
    drawPlayer(time);
  }

  /* ===================== INDEXEDDB + SOVGAD ===================== */

  const DB_NAME = "FOBAS_MISSION_3D_DB";
  const DB_VERSION = 1;
  const STORE_NAME = "gameData";

  let db = null;

  function openDatabase() {
    return new Promise(resolve => {
      if (!window.indexedDB) return resolve(false);

      let request;

      try {
        request = indexedDB.open(DB_NAME, DB_VERSION);
      } catch (_) {
        return resolve(false);
      }

      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        db = request.result;
        db.onversionchange = () => db.close();
        resolve(true);
      };

      request.onerror = () => resolve(false);
      request.onblocked = () => resolve(false);
    });
  }

  function dbGet(id) {
    return new Promise(resolve => {
      if (!db) return resolve(null);

      try {
        const request = db.transaction(STORE_NAME, "readonly")
          .objectStore(STORE_NAME).get(id);

        request.onsuccess = () => {
          resolve(request.result ? request.result.value : null);
        };

        request.onerror = () => resolve(null);
      } catch (_) {
        resolve(null);
      }
    });
  }

  function dbPut(id, value) {
    return new Promise(resolve => {
      if (!db) return resolve(false);

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

    let saved = await dbPut("save", data);

    try {
      localStorage.setItem("fobasMissionSave", JSON.stringify(data));
      saved = true;
    } catch (_) {}

    if (ui.saveStatus) {
      ui.saveStatus.textContent = saved
        ? "Sistèm sove: done"
        : "Sovgad pa disponib";
    }

    return saved;
  }

  async function loadData() {
    let data = await dbGet("save");

    if (!data) {
      try {
        data = JSON.parse(localStorage.getItem("fobasMissionSave") || "null");
      } catch (_) {}
    }

    if (!data) return;

    if (MISSIONS[data.mission]) state.mission = data.mission;

    if (CHARACTERS[data.character]) {
      state.character = data.character;
      state.selectedCharacter = data.character;
    }

    if (Number.isFinite(data.score)) {
      state.score = Math.max(0, data.score);
    }

    if (data.settings && typeof data.settings === "object") {
      state.settings = { ...state.settings, ...data.settings };
    }

    applySettings();
    updateHUD();
  }

  /* ===================== HUD + NOTIFIKASYON ===================== */

  function showScreen(screen) {
    [ui.loading, ui.menu, ui.game].forEach(el => {
      if (el) el.hidden = el !== screen;
    });
  }

  function showPanel(panel) {
    [ui.missionMenu, ui.characterMenu, ui.settingsMenu].forEach(el => {
      if (el) el.hidden = el !== panel;
    });
  }

  function notify(message) {
    if (!ui.notifications) return;

    ui.notifications.textContent = message;
    ui.notifications.classList.add("show");

    clearTimeout(state.notifyTimer);

    state.notifyTimer = setTimeout(() => {
      ui.notifications?.classList.remove("show");
    }, 2300);
  }

  function showError(message) {
    if (ui.errorMessage) ui.errorMessage.textContent = message;
    if (ui.error) ui.error.hidden = false;
  }

  function hideError() {
    if (ui.error) ui.error.hidden = true;
  }

  function formatTime(seconds) {
    const total = Math.floor(seconds);
    return String(Math.floor(total / 60)).padStart(2, "0") + ":" +
      String(total % 60).padStart(2, "0");
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
    if (ui.hudObjective) ui.hudObjective.textContent = mission.description;

    if (ui.objectiveCount) {
      ui.objectiveCount.textContent = state.collected + " / " + mission.target;
    }

    if (ui.objectiveProgress) {
      ui.objectiveProgress.style.width =
        clamp(state.collected / mission.target * 100, 0, 100) + "%";
    }

    if (ui.timer) ui.timer.textContent = formatTime(state.elapsed);

    if (ui.location) {
      const d = Math.hypot(state.x, state.z);
      ui.location.textContent = d < 3
        ? "Baz prensipal"
        : d > 10 ? "Zòn eksplorasyon" : "Tèren FOBAS";
    }
  }

  /* ===================== SON ===================== */

  function playTone(frequency = 500, duration = 0.1) {
    if (!state.settings.sound || state.settings.volume <= 0) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!state.audio) state.audio = new AudioContextClass();

      if (state.audio.state === "suspended") state.audio.resume();

      const oscillator = state.audio.createOscillator();
      const gain = state.audio.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(
        Math.min(0.12, state.settings.volume / 800),
        state.audio.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        state.audio.currentTime + duration
      );

      oscillator.connect(gain);
      gain.connect(state.audio.destination);

      oscillator.start();
      oscillator.stop(state.audio.currentTime + duration);
    } catch (_) {}
  }

  /* ===================== JWE AK MISYON ===================== */

  function resetMission() {
    state.x = 0;
    state.z = 0;
    state.facing = 0;
    state.cameraAngle = 0;
    state.cameraPitch = 0.35;
    state.cameraDistance = 8;
    state.targetCameraDistance = 8;

    state.health = 100;
    state.energy = 100;
    state.collected = 0;
    state.elapsed = 0;
    state.sprint = false;

    state.jumping = false;
    state.jumpY = 0;
    state.jumpVelocity = 0;
    state.finished = false;
    state.paused = false;

    resetJoystick();

    if (ui.pauseMenu) ui.pauseMenu.hidden = true;
    if (ui.result) ui.result.hidden = true;
    if (ui.run) ui.run.classList.remove("active");

    createWorld();
    updateHUD();
  }

  function createParticles(x, z) {
    for (let i = 0; i < 10; i++) {
      state.particles.push({
        x, z,
        y: rand(0.5, 1.4),
        vx: rand(-1.8, 1.8),
        vy: rand(0.3, 2.3),
        vz: rand(-1.8, 1.8),
        life: 1,
        size: rand(0.05, 0.13),
        color: i % 2
          ? [0.15, 1.0, 0.8]
          : [1.0, 0.9, 0.35]
      });
    }
  }

  function collectCrystal(crystal) {
    if (crystal.taken || state.finished) return;

    crystal.taken = true;
    state.collected++;
    state.score += 20;
    state.energy = Math.min(100, state.energy + 8);

    createParticles(crystal.x, crystal.z);
    playTone(740, 0.13);
    notify("✨ Ou kolekte yon kristal!");

    updateHUD();

    if (state.collected >= MISSIONS[state.mission].target) {
      finishMission();
    }
  }

  function movePlayer(dx, dz, dt) {
    const inputMagnitude = Math.hypot(dx, dz);

    if (inputMagnitude < 0.08) {
      if (!state.sprint) {
        state.energy = Math.min(100, state.energy + 10 * dt);
      }
      return;
    }

    // Kenbe vitès pwopòsyonèl ak joystick la.
    const magnitude = Math.min(1, inputMagnitude);
    dx = dx / inputMagnitude * magnitude;
    dz = dz / inputMagnitude * magnitude;

    const char = CHARACTERS[state.character];
    const sprinting = state.sprint && state.energy > 0;
    const speed = char.speed * (sprinting ? 1.65 : 1);

    const angle = state.cameraAngle;
    const worldX = dx * Math.cos(angle) + dz * Math.sin(angle);
    const worldZ = -dx * Math.sin(angle) + dz * Math.cos(angle);

    state.x = clamp(state.x + worldX * speed * dt, -22, 22);
    state.z = clamp(state.z + worldZ * speed * dt, -22, 22);
    state.facing = Math.atan2(worldX, worldZ);

    if (sprinting) {
      state.energy = Math.max(0, state.energy - 18 * dt);
    } else {
      state.energy = Math.min(100, state.energy + 11 * dt);
    }

    for (const crystal of state.crystals) {
      if (!crystal.taken && dist(state, crystal) < 0.9) {
        collectCrystal(crystal);
      }
    }
  }

  function jump() {
    if (!state.active || state.paused || state.finished) return;
    if (state.jumping) return;

    state.jumping = true;
    state.jumpVelocity = 6.2;
    playTone(360, 0.08);
  }

  function updateJump(dt) {
    if (!state.jumping) return;

    state.jumpY += state.jumpVelocity * dt;
    state.jumpVelocity -= 17 * dt;

    if (state.jumpY <= 0) {
      state.jumpY = 0;
      state.jumpVelocity = 0;
      state.jumping = false;
    }
  }

  function updateParticles(dt) {
    for (const p of state.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.vy -= 3 * dt;
      p.life -= dt * 1.5;
    }

    state.particles = state.particles.filter(p => p.life > 0);
  }

  function finishMission() {
    if (state.finished) return;

    state.finished = true;
    state.paused = false;
    state.sprint = false;

    const reward = MISSIONS[state.mission].reward;
    state.score += reward;

    if (ui.resultTitle) ui.resultTitle.textContent = "MISYON REYISI!";
    if (ui.resultDescription) {
      ui.resultDescription.textContent =
        "Ou fini misyon " + MISSIONS[state.mission].title +
        ". Ou resevwa " + reward + " pwen anplis.";
    }

    if (ui.resultScore) ui.resultScore.textContent = state.score;
    if (ui.result) ui.result.hidden = false;
    if (ui.pauseMenu) ui.pauseMenu.hidden = true;

    if (ui.nextMission) ui.nextMission.hidden = state.mission >= 3;

    updateHUD();
    saveData();
    playTone(850, 0.25);
  }

  function startGame(missionNumber) {
    if (MISSIONS[missionNumber]) state.mission = missionNumber;

    resetMission();
    showScreen(ui.game);
    showPanel(null);

    state.active = true;
    state.paused = false;

    resize();
    updateHUD();
    saveData();
    playTone(550, 0.12);
  }

  function pauseGame() {
    if (!state.active || state.finished) return;

    state.paused = true;
    if (ui.pauseMenu) ui.pauseMenu.hidden = false;
    resetJoystick();
  }

  function resumeGame() {
    if (state.finished) return;

    state.paused = false;
    state.active = true;

    if (ui.pauseMenu) ui.pauseMenu.hidden = true;
    playTone(470, 0.06);
  }

  /* ===================== BOUK ANIMASYON ===================== */

  function frame(time) {
    requestAnimationFrame(frame);

    if (lostContext || !gl) return;

    const dt = state.lastTime
      ? Math.min((time - state.lastTime) / 1000, 0.04)
      : 0;

    state.lastTime = time;

    if (state.active && !state.paused && !state.finished) {
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

      state.cameraDistance +=
        (state.targetCameraDistance - state.cameraDistance) *
        Math.min(1, dt * 8);

      state.saveTimer += dt;

      if (state.saveTimer >= 15) {
        state.saveTimer = 0;
        saveData();
      }

      updateHUD();
    }

    render(time);
  }

  /* ===================== JOYSTICK ANDROID ===================== */

  function setJoystick(clientX, clientY) {
    if (!ui.joystickBase || !ui.joystickKnob) return;

    const rect = ui.joystickBase.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const maxRadius = Math.max(20, rect.width * 0.32);
    let dx = clientX - cx;
    let dy = clientY - cy;

    const length = Math.hypot(dx, dy);

    if (length > maxRadius) {
      dx = dx / length * maxRadius;
      dy = dy / length * maxRadius;
    }

    state.joyX = dx / maxRadius;
    state.joyY = dy / maxRadius;

    ui.joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
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
    ui.joystickZone.addEventListener("pointerdown", event => {
      event.preventDefault();

      state.joyActive = true;
      state.joyPointer = event.pointerId;

      try {
        ui.joystickZone.setPointerCapture(event.pointerId);
      } catch (_) {}

      setJoystick(event.clientX, event.clientY);
    });

    ui.joystickZone.addEventListener("pointermove", event => {
      if (!state.joyActive || event.pointerId !== state.joyPointer) return;

      event.preventDefault();
      setJoystick(event.clientX, event.clientY);
    });

    ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => {
      ui.joystickZone.addEventListener(type, resetJoystick);
    });
  }

  /* ===================== KAMERA TACTILE / ZOOM ===================== */

  const pointers = new Map();
  let lastPinchDistance = null;
  let lastDrag = null;

  function pinchDistance() {
    const pts = [...pointers.values()];
    if (pts.length < 2) return null;

    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }

  if (canvas) {
    canvas.style.touchAction = "none";

    canvas.addEventListener("pointerdown", event => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      lastPinchDistance = pinchDistance();
      lastDrag = { x: event.clientX, y: event.clientY };

      try {
        canvas.setPointerCapture(event.pointerId);
      } catch (_) {}
    });

    canvas.addEventListener("pointermove", event => {
      if (!pointers.has(event.pointerId)) return;

      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      const pinch = pinchDistance();

      if (pinch !== null && lastPinchDistance !== null) {
        const delta = pinch - lastPinchDistance;

        state.targetCameraDistance = clamp(
          state.targetCameraDistance - delta * 0.018,
          3.5,
          14
        );

        lastPinchDistance = pinch;
        lastDrag = null;
        return;
      }

      if (pointers.size === 1 && lastDrag) {
        const dx = event.clientX - lastDrag.x;
        const dy = event.clientY - lastDrag.y;

        state.cameraAngle -= dx *
          (Number(state.settings.sensitivity) || 5) * 0.0018;

        state.cameraPitch = clamp(state.cameraPitch + dy * 0.002, 0.12, 0.85);

        lastDrag = { x: event.clientX, y: event.clientY };
      }
    });

    function removePointer(event) {
      pointers.delete(event.pointerId);
      lastPinchDistance = pinchDistance();
      lastDrag = null;
    }

    canvas.addEventListener("pointerup", removePointer);
    canvas.addEventListener("pointercancel", removePointer);
    canvas.addEventListener("lostpointercapture", removePointer);

    canvas.addEventListener("wheel", event => {
      event.preventDefault();

      state.targetCameraDistance = clamp(
        state.targetCameraDistance + event.deltaY * 0.008,
        3.5,
        14
      );
    }, { passive: false });

    canvas.addEventListener("contextmenu", event => event.preventDefault());
  }

  /* ===================== KLAVYE ===================== */

  window.addEventListener("keydown", event => {
    state.keys[event.key] = true;

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "]
      .includes(event.key)) {
      event.preventDefault();
    }

    if (event.key === " " || event.key === "Spacebar") jump();

    if (event.key === "Escape" && state.active) {
      state.paused ? resumeGame() : pauseGame();
    }
  });

  window.addEventListener("keyup", event => {
    state.keys[event.key] = false;
  });

  window.addEventListener("blur", () => {
    state.keys = Object.create(null);
    resetJoystick();
  });

  /* ===================== PARAMÈT ===================== */

  function applySettings() {
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
    if (ui.volume) state.settings.volume = Number(ui.volume.value) || 0;
    if (ui.sound) state.settings.sound = ui.sound.checked;

    resize();
    saveData();
    notify("Paramèt yo anrejistre!");
  }

  /* ===================== SELEKSYON PÈSONAJ ===================== */

  function updateCharacterSelection() {
    document.querySelectorAll("[data-character]").forEach(button => {
      const selected = button.dataset.character === state.selectedCharacter;

      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    if (ui.selectedCharacter) {
      ui.selectedCharacter.textContent = "Pèsonaj: " + state.selectedCharacter;
    }
  }

  /* ===================== BOUTON HTML ===================== */

  function bindButton(element, handler) {
    if (!element) return;

    element.addEventListener("click", event => {
      event.preventDefault();
      handler();
    });
  }

  bindButton(ui.enter, () => {
    showScreen(ui.menu);
    showPanel(null);
    playTone(520, 0.08);
  });

  bindButton(ui.play, () => startGame(state.mission));
  bindButton(ui.continue, () => startGame(state.mission));

  bindButton(ui.missions, () => showPanel(ui.missionMenu));

  bindButton(ui.characters, () => {
    state.selectedCharacter = state.character;
    updateCharacterSelection();
    showPanel(ui.characterMenu);
  });

  bindButton(ui.settings, () => {
    applySettings();
    showPanel(ui.settingsMenu);
  });

  document.querySelectorAll("[data-back-menu]").forEach(button => {
    button.addEventListener("click", () => showPanel(null));
  });

  document.querySelectorAll("[data-select-mission]").forEach(button => {
    button.addEventListener("click", () => {
      const mission = Number(button.dataset.selectMission);
      if (MISSIONS[mission]) startGame(mission);
    });
  });

  document.querySelectorAll("[data-character]").forEach(button => {
    button.addEventListener("click", () => {
      const name = button.dataset.character;

      if (!CHARACTERS[name]) return;

      state.selectedCharacter = name;
      updateCharacterSelection();
      playTone(430, 0.06);
    });
  });

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
    startGame(state.mission);
    notify("Misyon an rekòmanse!");
  });

  bindButton(ui.backMenu, () => {
    state.active = false;
    state.paused = false;
    state.sprint = false;
    resetJoystick();

    if (ui.pauseMenu) ui.pauseMenu.hidden = true;
    if (ui.result) ui.result.hidden = true;

    showScreen(ui.menu);
    showPanel(null);
    saveData();
  });

  bindButton(ui.resultMenu, () => {
    state.active = false;
    state.finished = false;

    if (ui.result) ui.result.hidden = true;

    showScreen(ui.menu);
    showPanel(null);
    saveData();
  });

  bindButton(ui.nextMission, () => {
    if (state.mission >= 3) return;
    startGame(state.mission + 1);
  });

  bindButton(ui.jump, jump);

  bindButton(ui.run, () => {
    if (!state.active || state.paused || state.finished) return;

    state.sprint = !state.sprint;

    if (ui.run) ui.run.classList.toggle("active", state.sprint);

    notify(state.sprint ? "Kouri aktive!" : "Kouri dezaktive!");
  });

  bindButton(ui.action, () => {
    if (!state.active || state.paused || state.finished) return;

    let nearest = null;
    let nearestDistance = Infinity;

    for (const crystal of state.crystals) {
      if (crystal.taken) continue;

      const d = dist(state, crystal);

      if (d < nearestDistance) {
        nearestDistance = d;
        nearest = crystal;
      }
    }

    if (nearest && nearestDistance < 2.0) {
      collectCrystal(nearest);
    } else {
      notify("Chèche kristal ki pi pre a.");
    }
  });

  bindButton(ui.camera, () => {
    state.cameraAngle += Math.PI / 4;
    playTone(300, 0.05);
  });

  bindButton(ui.errorClose, hideError);

  /* ===================== INISYALIZASYON WEBGL ===================== */

  async function initialize() {
    if (!canvas) {
      showError("Canvas jwèt la pa jwenn.");
      return;
    }

    try {
      gl = canvas.getContext("webgl2", {
        alpha: false,
        antialias: true,
        depth: true,
        powerPreference: "high-performance"
      });

      if (!gl) {
        gl = canvas.getContext("webgl", {
          alpha: false,
          antialias: true,
          depth: true,
          powerPreference: "high-performance"
        });
      }

      if (!gl) {
        if (ui.fallback) {
          ui.fallback.hidden = false;
          ui.fallback.textContent =
            "WebGL pa disponib. Mete ajou navigatè a oswa aktive akselerasyon grafik la.";
        }

        showError("Navigatè sa a pa sipòte WebGL.");
        return;
      }

      if (ui.progress) ui.progress.style.width = "20%";
      if (ui.loadingStatus) {
        ui.loadingStatus.textContent = "Preparasyon motè WebGL 3D...";
      }

      createProgram();

      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);

      setupMeshes();
      resize();

      if (ui.progress) ui.progress.style.width = "45%";
      if (ui.loadingStatus) {
        ui.loadingStatus.textContent = "Preparasyon sistèm sovgad...";
      }

      await openDatabase();
      await loadData();

      if (ui.progress) ui.progress.style.width = "75%";
      if (ui.loadingStatus) {
        ui.loadingStatus.textContent = "Kreyasyon mond 3D la...";
      }

      createWorld();
      applySettings();
      updateHUD();
      updateCharacterSelection();

      if (ui.progress) ui.progress.style.width = "100%";
      if (ui.loadingStatus) ui.loadingStatus.textContent = "Jwèt la pare!";

      if (ui.enter) {
        ui.enter.disabled = false;
        ui.enter.textContent = "ANTRE NAN JWÈT LA";
      }

      if (ui.saveStatus) {
        ui.saveStatus.textContent = db
          ? "Sistèm sove: IndexedDB aktif"
          : "Sistèm sove: mòd sovgad";
      }

      if (!animationStarted) {
        animationStarted = true;
        requestAnimationFrame(frame);
      }
    } catch (error) {
      console.error("FOBAS WebGL error:", error);
      showError("Motè WebGL la pa t kapab kòmanse: " + error.message);
    }
  }

  /* ===================== SIPÒ NAVIGATÈ ===================== */

  window.addEventListener("resize", resize);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", resize);
  }

  document.addEventListener("touchmove", event => {
    if (state.active) event.preventDefault();
  }, { passive: false });

  canvas?.addEventListener("webglcontextlost", event => {
    event.preventDefault();
    lostContext = true;
    showError("WebGL pèdi koneksyon grafik la. Rechaje paj la pou rekòmanse.");
  });

  canvas?.addEventListener("webglcontextrestored", () => {
    lostContext = false;
    showError("WebGL retabli. Si grafik yo pa retounen, rechaje paj la.");
  });

  initialize().catch(error => {
    console.error("FOBAS initialization error:", error);
    showError("Yon erè te rive pandan jwèt la t ap chaje.");
  });

})();













