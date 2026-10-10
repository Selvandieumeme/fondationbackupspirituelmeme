
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
    MEME: {
      color: [0.12, 0.91, 0.91],
      speed: 4.5
    },
    FOBAS: {
      color: [1.00, 0.56, 0.15],
      speed: 4.0
    },
    SHADOW: {
      color: [0.55, 0.39, 1.00],
      speed: 5.0
    },
    BLAZE: {
      color: [1.00, 0.20, 0.31],
      speed: 5.4
    },
    TITAN: {
      color: [0.27, 0.83, 0.45],
      speed: 3.8
    }
  };

  const MISSIONS = {
    1: {
      title: "Premye Kontak",
      description: "Kolekte 5 kristal.",
      target: 5,
      reward: 100
    },
    2: {
      title: "Meme & Team",
      description: "Kolekte 8 kristal.",
      target: 8,
      reward: 250
    },
    3: {
      title: "Defi Final",
      description: "Kolekte 12 kristal.",
      target: 12,
      reward: 500
    },
    4: {
      title: "Zòn Sekrè",
      description: "Kolekte 10 kristal nan zòn sekre a.",
      target: 10,
      reward: 700
    },
    5: {
      title: "Ekip An Aksyon",
      description: "Kolekte 14 kristal.",
      target: 14,
      reward: 1000
    },
    6: {
      title: "Dènye Misyon",
      description: "Kolekte 18 kristal pou fini misyon an.",
      target: 18,
      reward: 1500
    }
  };

  const state = {
    mission: 1,
    character: "MEME",
    selectedCharacter: "MEME",

    active: false,
    paused: false,
    finished: false,
    sprint: false,

    x: 0,
    z: 0,
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
    enemies: [],

    settings: {
      quality: "high",
      sensitivity: 5,
      volume: 70,
      sound: true
    },

    lastTime: 0,
    saveTimer: 0,
    audio: null,
    notifyTimer: null,
    shotCooldown: 0
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

      vec3 lightDirection =
        normalize(vec3(-0.45, 0.9, 0.35));

      float diffuse =
        max(dot(normal, lightDirection), 0.0);

      float hemisphere =
        normal.y * 0.5 + 0.5;

      vec3 ambient = mix(
        vec3(0.10, 0.16, 0.22),
        vec3(0.37, 0.50, 0.48),
        hemisphere
      );

      float light = 0.40 + diffuse * 0.75;

      vec3 color =
        uColor * (ambient + light * 0.55);

      float distanceFog =
        length(uCamera - vWorldPosition);

      float fog = smoothstep(
        18.0,
        42.0,
        distanceFog
      );

      vec3 fogColor = vec3(0.10, 0.22, 0.29);

      color = mix(
        color,
        fogColor,
        fog * 0.68
      );

      color += uColor * uEmissive;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message =
        gl.getShaderInfoLog(shader) || "Shader error";

      gl.deleteShader(shader);

      throw new Error(message);
    }

    return shader;
  }

  function createProgram() {
    const vs = compileShader(
      gl.VERTEX_SHADER,
      vertexShaderSource
    );

    const fs = compileShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    const p = gl.createProgram();

    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);

    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(
        gl.getProgramInfoLog(p) || "WebGL link error"
      );
    }

    program = p;
    gl.useProgram(program);

    locations = {
      position: gl.getAttribLocation(
        program,
        "aPosition"
      ),

      normal: gl.getAttribLocation(
        program,
        "aNormal"
      ),

      projection: gl.getUniformLocation(
        program,
        "uProjection"
      ),

      view: gl.getUniformLocation(
        program,
        "uView"
      ),

      model: gl.getUniformLocation(
        program,
        "uModel"
      ),

      color: gl.getUniformLocation(
        program,
        "uColor"
      ),

      camera: gl.getUniformLocation(
        program,
        "uCamera"
      ),

      emissive: gl.getUniformLocation(
        program,
        "uEmissive"
      )
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
          sum +=
            a[k * 4 + row] *
            b[col * 4 + k];
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

    zx /= len;
    zy /= len;
    zz /= len;

    let xx = up[1] * zz - up[2] * zy;
    let xy = up[2] * zx - up[0] * zz;
    let xz = up[0] * zy - up[1] * zx;

    len = Math.hypot(xx, xy, xz) || 1;

    xx /= len;
    xy /= len;
    xz /= len;

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

  function modelMatrix(
    x,
    y,
    z,
    sx,
    sy,
    sz,
    rotationY = 0
  ) {
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

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertices),
      gl.STATIC_DRAW
    );

    const normalBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(normals),
      gl.STATIC_DRAW
    );

    const indexBuffer = gl.createBuffer();

    gl.bindBuffer(
      gl.ELEMENT_ARRAY_BUFFER,
      indexBuffer
    );

    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW
    );

    return {
      vertexBuffer,
      normalBuffer,
      indexBuffer,
      count: indices.length
    };
  }

  function makeCube() {
    const faces = [
      {
        n: [0, 0, 1],
        v: [
          [-0.5, -0.5, 0.5],
          [0.5, -0.5, 0.5],
          [0.5, 0.5, 0.5],
          [-0.5, 0.5, 0.5]
        ]
      },
      {
        n: [0, 0, -1],
        v: [
          [0.5, -0.5, -0.5],
          [-0.5, -0.5, -0.5],
          [-0.5, 0.5, -0.5],
          [0.5, 0.5, -0.5]
        ]
      },
      {
        n: [1, 0, 0],
        v: [
          [0.5, -0.5, 0.5],
          [0.5, -0.5, -0.5],
          [0.5, 0.5, -0.5],
          [0.5, 0.5, 0.5]
        ]
      },
      {
        n: [-1, 0, 0],
        v: [
          [-0.5, -0.5, -0.5],
          [-0.5, -0.5, 0.5],
          [-0.5, 0.5, 0.5],
          [-0.5, 0.5, -0.5]
        ]
      },
      {
        n: [0, 1, 0],
        v: [
          [-0.5, 0.5, 0.5],
          [0.5, 0.5, 0.5],
          [0.5, 0.5, -0.5],
          [-0.5, 0.5, -0.5]
        ]
      },
      {
        n: [0, -1, 0],
        v: [
          [-0.5, -0.5, -0.5],
          [0.5, -0.5, -0.5],
          [0.5, -0.5, 0.5],
          [-0.5, -0.5, 0.5]
        ]
      }
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

    return createMesh(
      vertices,
      normals,
      indices
    );
  }

  function makeOctahedron() {
    const vertices = [
      0, 1, 0,  1, 0, 0,  0, 0, 1,
      0, 1, 0,  0, 0, 1, -1, 0, 0,
      0, 1, 0, -1, 0, 0,  0, 0, -1,
      0, 1, 0,  0, 0, -1, 1, 0, 0,

      0, -1, 0, 0, 0, 1, 1, 0, 0,
      0, -1, 0, -1, 0, 0, 0, 0, 1,
      0, -1, 0, 0, 0, -1, -1, 0, 0,
      0, -1, 0, 1, 0, 0, 0, 0, -1
    ];

    const normals = [];

    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];

      const len = Math.hypot(x, y, z) || 1;

      normals.push(
        x / len,
        y / len,
        z / len
      );
    }

    const indices = Array.from(
      { length: vertices.length / 3 },
      (_, i) => i
    );

    return createMesh(
      vertices,
      normals,
      indices
    );
  }

  function makeCone(segments = 8) {
    const vertices = [];
    const normals = [];
    const indices = [];

    for (let i = 0; i < segments; i++) {
      const a = i / segments * Math.PI * 2;
      const b = (i + 1) / segments * Math.PI * 2;

      const p1 = [
        Math.cos(a) * 0.5,
        -0.5,
        Math.sin(a) * 0.5
      ];

      const p2 = [
        Math.cos(b) * 0.5,
        -0.5,
        Math.sin(b) * 0.5
      ];

      const tip = [0, 0.5, 0];

      const base = vertices.length / 3;

      vertices.push(...p1, ...p2, ...tip);

      for (const p of [p1, p2, tip]) {
        const len =
          Math.hypot(p[0], p[1], p[2]) || 1;

        normals.push(
          p[0] / len,
          p[1] / len,
          p[2] / len
        );
      }

      indices.push(
        base,
        base + 1,
        base + 2
      );
    }

    return createMesh(
      vertices,
      normals,
      indices
    );
  }

  function setupMeshes() {
    meshes.cube = makeCube();
    meshes.crystal = makeOctahedron();
    meshes.cone = makeCone(10);
  }

  function drawMesh(
    mesh,
    model,
    color,
    emissive = 0
  ) {
    if (!mesh || lostContext || !gl) return;

    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      mesh.vertexBuffer
    );

    gl.enableVertexAttribArray(
      locations.position
    );

    gl.vertexAttribPointer(
      locations.position,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      mesh.normalBuffer
    );

    gl.enableVertexAttribArray(
      locations.normal
    );

    gl.vertexAttribPointer(
      locations.normal,
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
      locations.model,
      false,
      model
    );

    gl.uniform3fv(
      locations.color,
      color
    );

    gl.uniform1f(
      locations.emissive,
      emissive
    );

    gl.drawElements(
      gl.TRIANGLES,
      mesh.count,
      gl.UNSIGNED_SHORT,
      0
    );
  }

  // Kontinye ak pati 2 nan menm fichye a.





  /* =========================================================
     PATI 2 — MOND 3D, TÈREN, OBJE AK KAMERA
     Kontinye nan menm IIFE pati 1 an.
  ========================================================= */

  /* ===================== KREYE MOND LAN ===================== */

  const WORLD_SIZE = 100;
  const WORLD_LIMIT = 44;

  function createWorld() {
    state.crystals = [];
    state.trees = [];
    state.buildings = [];
    state.particles = [];
    state.enemies = [];

    const mission = MISSIONS[state.mission] || MISSIONS[1];
    const crystalCount = mission.target + 8;

    // Kreye kristal yo nan diferan zòn.
    for (let i = 0; i < crystalCount; i++) {
      let x = 0;
      let z = 0;
      let attempts = 0;

      do {
        x = rand(-WORLD_LIMIT + 4, WORLD_LIMIT - 4);
        z = rand(-WORLD_LIMIT + 4, WORLD_LIMIT - 4);
        attempts++;
      } while (
        Math.hypot(x, z) < 7 &&
        attempts < 30
      );

      state.crystals.push({
        x,
        y: 0.95,
        z,
        size: rand(0.65, 1.05),
        phase: rand(0, Math.PI * 2),
        collected: false
      });
    }

    // Kreye pyebwa yo.
    for (let i = 0; i < 65; i++) {
      const x = rand(-WORLD_LIMIT, WORLD_LIMIT);
      const z = rand(-WORLD_LIMIT, WORLD_LIMIT);

      if (Math.hypot(x, z) < 6) continue;

      state.trees.push({
        x,
        z,
        height: rand(1.7, 3.2),
        width: rand(0.8, 1.4)
      });
    }

    // Kreye bilding nan vil la.
    for (let i = 0; i < 18; i++) {
      const side = i % 4;
      let x;
      let z;

      if (side === 0) {
        x = rand(-WORLD_LIMIT + 5, WORLD_LIMIT - 5);
        z = rand(-WORLD_LIMIT, -18);
      } else if (side === 1) {
        x = rand(-WORLD_LIMIT + 5, WORLD_LIMIT - 5);
        z = rand(18, WORLD_LIMIT);
      } else if (side === 2) {
        x = rand(-WORLD_LIMIT, -18);
        z = rand(-WORLD_LIMIT + 5, WORLD_LIMIT - 5);
      } else {
        x = rand(18, WORLD_LIMIT);
        z = rand(-WORLD_LIMIT + 5, WORLD_LIMIT - 5);
      }

      state.buildings.push({
        x,
        z,
        width: rand(3, 6),
        height: rand(3, 8),
        depth: rand(3, 6),
        color: [
          rand(0.25, 0.55),
          rand(0.28, 0.50),
          rand(0.32, 0.58)
        ]
      });
    }
  }

  /* ===================== DIMANSYON CANVAS ===================== */

  function resizeCanvas() {
    if (!canvas || !gl || lostContext) return;

    const rect = canvas.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const quality = state.settings.quality;
    let pixelRatio = window.devicePixelRatio || 1;

    if (quality === "low") {
      pixelRatio = Math.min(pixelRatio, 1);
    } else if (quality === "medium") {
      pixelRatio = Math.min(pixelRatio, 1.5);
    } else {
      pixelRatio = Math.min(pixelRatio, 2);
    }

    const width = Math.max(
      1,
      Math.floor(rect.width * pixelRatio)
    );

    const height = Math.max(
      1,
      Math.floor(rect.height * pixelRatio)
    );

    if (
      canvas.width !== width ||
      canvas.height !== height
    ) {
      canvas.width = width;
      canvas.height = height;
    }

    canvasWidth = width;
    canvasHeight = height;

    gl.viewport(0, 0, width, height);
  }

  /* ===================== DESEN OBJE 3D ===================== */

  function drawCube(
    x,
    y,
    z,
    sx,
    sy,
    sz,
    color,
    rotationY = 0,
    emissive = 0
  ) {
    drawMesh(
      meshes.cube,
      modelMatrix(
        x,
        y,
        z,
        sx,
        sy,
        sz,
        rotationY
      ),
      color,
      emissive
    );
  }

  function drawCrystal(crystal, time) {
    if (crystal.collected) return;

    const bob = Math.sin(
      time * 2.2 + crystal.phase
    ) * 0.14;

    const rotation = time * 0.8 + crystal.phase;
    const size = crystal.size;

    drawMesh(
      meshes.crystal,
      modelMatrix(
        crystal.x,
        crystal.y + bob,
        crystal.z,
        size,
        size * 1.45,
        size,
        rotation
      ),
      [0.12, 0.92, 1.0],
      0.45
    );

    // Ti baz vizyèl anba kristal la.
    drawCube(
      crystal.x,
      0.035,
      crystal.z,
      0.9,
      0.06,
      0.9,
      [0.05, 0.32, 0.43],
      0,
      0.15
    );
  }

  function drawTree(tree) {
    // Kò pyebwa a.
    drawCube(
      tree.x,
      tree.height * 0.25,
      tree.z,
      0.28,
      tree.height * 0.5,
      0.28,
      [0.35, 0.20, 0.11]
    );

    // Fèy yo an fòm kòn.
    drawMesh(
      meshes.cone,
      modelMatrix(
        tree.x,
        tree.height * 0.75,
        tree.z,
        tree.width,
        tree.height * 0.8,
        tree.width
      ),
      [0.12, 0.48, 0.25]
    );

    drawMesh(
      meshes.cone,
      modelMatrix(
        tree.x,
        tree.height * 1.05,
        tree.z,
        tree.width * 0.72,
        tree.height * 0.65,
        tree.width * 0.72
      ),
      [0.16, 0.60, 0.30]
    );
  }

  function drawBuilding(building) {
    // Kò bilding lan.
    drawCube(
      building.x,
      building.height * 0.5,
      building.z,
      building.width,
      building.height,
      building.depth,
      building.color
    );

    // Twati a.
    drawCube(
      building.x,
      building.height + 0.08,
      building.z,
      building.width + 0.25,
      0.16,
      building.depth + 0.25,
      [0.16, 0.22, 0.29]
    );

    // Ti fenèt devan bilding lan.
    const windowColor = [0.25, 0.80, 1.0];
    const rows = Math.max(
      1,
      Math.floor(building.height / 1.6)
    );

    const columns = Math.max(
      1,
      Math.floor(building.width / 1.5)
    );

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const wx =
          building.x -
          building.width * 0.3 +
          col * 1.1;

        const wy = 0.8 + row * 1.45;

        if (wy > building.height - 0.25) continue;

        drawCube(
          wx,
          wy,
          building.z + building.depth * 0.5 + 0.012,
          0.35,
          0.45,
          0.035,
          windowColor,
          0,
          0.12
        );
      }
    }
  }

  /* ===================== PÈSONAJ JWÈ A ===================== */

  function drawPlayer(time) {
    const character =
      CHARACTERS[state.character] || CHARACTERS.MEME;

    const bob = state.jumping
      ? state.jumpY
      : Math.abs(Math.sin(time * 8)) * 0.035;

    const x = state.x;
    const z = state.z;
    const bodyColor = character.color;

    // Lonbraj senp anba pèsonaj la.
    drawCube(
      x,
      0.025,
      z,
      0.95,
      0.035,
      0.72,
      [0.035, 0.055, 0.065]
    );

    // Janm yo.
    drawCube(
      x - 0.19,
      0.40 + bob,
      z,
      0.22,
      0.72,
      0.26,
      [0.12, 0.17, 0.23],
      state.facing
    );

    drawCube(
      x + 0.19,
      0.40 + bob,
      z,
      0.22,
      0.72,
      0.26,
      [0.12, 0.17, 0.23],
      state.facing
    );

    // Kò pèsonaj la.
    drawCube(
      x,
      1.02 + bob,
      z,
      0.72,
      0.82,
      0.42,
      bodyColor,
      state.facing
    );

    // Tèt pèsonaj la.
    drawCube(
      x,
      1.68 + bob,
      z,
      0.48,
      0.48,
      0.44,
      [0.94, 0.77, 0.62],
      state.facing
    );

    // De je devan tèt la.
    const eyeOffsetX = 0.12;
    const eyeY = 1.73 + bob;
    const eyeZ = z + 0.226;

    drawCube(
      x - eyeOffsetX,
      eyeY,
      eyeZ,
      0.065,
      0.075,
      0.025,
      [0.025, 0.035, 0.05]
    );

    drawCube(
      x + eyeOffsetX,
      eyeY,
      eyeZ,
      0.065,
      0.075,
      0.025,
      [0.025, 0.035, 0.05]
    );

    // Bras yo.
    drawCube(
      x - 0.48,
      1.00 + bob,
      z,
      0.22,
      0.70,
      0.25,
      bodyColor,
      state.facing
    );

    drawCube(
      x + 0.48,
      1.00 + bob,
      z,
      0.22,
      0.70,
      0.25,
      bodyColor,
      state.facing
    );
  }

  /* ===================== KAMERA 3D ===================== */

  function getCameraPosition() {
    const distance = state.cameraDistance;

    const pitch = clamp(
      state.cameraPitch,
      -0.05,
      1.05
    );

    const horizontalDistance =
      Math.cos(pitch) * distance;

    const verticalDistance =
      Math.sin(pitch) * distance;

    return [
      state.x +
        Math.sin(state.cameraAngle) *
        horizontalDistance,

      2.0 + verticalDistance,

      state.z +
        Math.cos(state.cameraAngle) *
        horizontalDistance
    ];
  }

  function updateCameraMatrices() {
    const camera = getCameraPosition();

    const target = [
      state.x,
      1.0 + state.jumpY * 0.35,
      state.z
    ];

    const projection = perspective(
      Math.PI / 3,
      canvasWidth / Math.max(1, canvasHeight),
      0.1,
      150
    );

    const view = lookAt(
      camera,
      target,
      [0, 1, 0]
    );

    gl.uniformMatrix4fv(
      locations.projection,
      false,
      projection
    );

    gl.uniformMatrix4fv(
      locations.view,
      false,
      view
    );

    gl.uniform3fv(
      locations.camera,
      camera
    );
  }

  /* ===================== RANN MOND LAN ===================== */

  function renderScene(timeSeconds) {
    if (
      !gl ||
      !program ||
      lostContext ||
      !meshes.cube
    ) {
      return;
    }

    resizeCanvas();

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clearColor(
      0.10,
      0.22,
      0.29,
      1.0
    );

    gl.clear(
      gl.COLOR_BUFFER_BIT |
      gl.DEPTH_BUFFER_BIT
    );

    gl.useProgram(program);

    updateCameraMatrices();

    // Tè prensipal la.
    drawCube(
      0,
      -0.32,
      0,
      WORLD_SIZE,
      0.5,
      WORLD_SIZE,
      [0.20, 0.34, 0.26]
    );

    // Wout prensipal yo.
    drawCube(
      0,
      -0.045,
      0,
      5,
      0.035,
      WORLD_SIZE,
      [0.16, 0.19, 0.22]
    );

    drawCube(
      0,
      -0.04,
      0,
      WORLD_SIZE,
      0.035,
      5,
      [0.16, 0.19, 0.22]
    );

    // Mak wout yo.
    for (let i = -40; i <= 40; i += 5) {
      drawCube(
        0,
        -0.018,
        i,
        0.12,
        0.02,
        1.8,
        [0.85, 0.79, 0.48]
      );

      drawCube(
        i,
        -0.018,
        0,
        1.8,
        0.02,
        0.12,
        [0.85, 0.79, 0.48]
      );
    }

    // Bilding yo.
    for (const building of state.buildings) {
      drawBuilding(building);
    }

    // Pyebwa yo.
    for (const tree of state.trees) {
      drawTree(tree);
    }

    // Kristal yo.
    for (const crystal of state.crystals) {
      drawCrystal(crystal, timeSeconds);
    }

    // Pèsonaj jwè a.
    drawPlayer(timeSeconds);
  }

  /* ===================== FIN PATI 2 ===================== */

  // Pa fèmen IIFE a isit la.
  // Pati 3 dwe kontinye nan menm estrikti JavaScript la.









  /* =========================================================
     PATI 3 — MOUVMAN, JOYSTICK, SOTE AK KAMERA
     Kontinye apre pati 2 a.
  ========================================================= */

  /* ===================== PARAMÈT MOUVMAN ===================== */

  const MOVEMENT = {
    gravity: 18,
    jumpPower: 7.2,
    walkSpeed: 1,
    sprintMultiplier: 1.65,
    joystickRadius: 48,
    cameraTurnSpeed: 2.2,
    pitchSpeed: 0.08,
    minPitch: -0.05,
    maxPitch: 1.05
  };

  let movementControlsReady = false;
  let sprintPointer = null;
  let jumpPointer = null;
  let cameraPointer = null;
  let lastMoveNotice = 0;

  /* ===================== MESAJ JWÈ A ===================== */

  function movementNotice(message) {
    if (typeof showNotification === "function") {
      showNotification(message);
      return;
    }

    if (ui.notifications) {
      ui.notifications.textContent = message;
      ui.notifications.classList.add("show");

      window.clearTimeout(state.notifyTimer);

      state.notifyTimer = window.setTimeout(() => {
        if (ui.notifications) {
          ui.notifications.classList.remove("show");
        }
      }, 1800);
    }
  }

  /* ===================== KONTWÒL KAMERA VÈTIKAL ===================== */

  function createPitchControls() {
    if (!ui.game) return;

    let panel = document.getElementById("camera-pitch-controls");

    if (!panel) {
      panel = document.createElement("div");
      panel.id = "camera-pitch-controls";

      Object.assign(panel.style, {
        position: "absolute",
        right: "14px",
        top: "35%",
        zIndex: "20",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        pointerEvents: "auto"
      });

      const makeButton = (id, text, label) => {
        const button = document.createElement("button");

        button.id = id;
        button.type = "button";
        button.textContent = text;
        button.setAttribute("aria-label", label);

        Object.assign(button.style, {
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,.55)",
          background: "rgba(10,25,40,.72)",
          color: "#ffffff",
          fontSize: "22px",
          fontWeight: "bold",
          touchAction: "none",
          userSelect: "none"
        });

        panel.appendChild(button);
        return button;
      };

      makeButton(
        "btn-pitch-up",
        "▲",
        "Gade anlè"
      );

      makeButton(
        "btn-pitch-down",
        "▼",
        "Gade anba"
      );

      if (getComputedStyle(ui.game).position === "static") {
        ui.game.style.position = "relative";
      }

      ui.game.appendChild(panel);
    }

    const up = document.getElementById("btn-pitch-up");
    const down = document.getElementById("btn-pitch-down");

    if (!up || !down) return;

    const changePitch = amount => {
      if (!state.active || state.paused || state.finished) return;

      state.cameraPitch = clamp(
        state.cameraPitch + amount,
        MOVEMENT.minPitch,
        MOVEMENT.maxPitch
      );
    };

    up.addEventListener("pointerdown", event => {
      event.preventDefault();
      changePitch(MOVEMENT.pitchSpeed);
    });

    down.addEventListener("pointerdown", event => {
      event.preventDefault();
      changePitch(-MOVEMENT.pitchSpeed);
    });

    panel.style.display = "flex";
  }

  /* ===================== JOYSTICK ANDROID ===================== */

  function updateJoystickFromPointer(event) {
    if (!ui.joystickBase || !ui.joystickKnob) return;

    const rect = ui.joystickBase.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;

    const radius = Math.max(
      20,
      Math.min(rect.width, rect.height) * 0.38
    );

    const length = Math.hypot(dx, dy);

    if (length > radius) {
      dx = dx / length * radius;
      dy = dy / length * radius;
    }

    state.joyX = clamp(dx / radius, -1, 1);
    state.joyY = clamp(dy / radius, -1, 1);
    state.joyActive = true;

    ui.joystickKnob.style.transform =
      `translate(${dx}px, ${dy}px)`;
  }

  function resetJoystick() {
    state.joyX = 0;
    state.joyY = 0;
    state.joyActive = false;
    state.joyPointer = null;

    if (ui.joystickKnob) {
      ui.joystickKnob.style.transform =
        "translate(0px, 0px)";
    }
  }

  function bindJoystick() {
    if (!ui.joystickZone || !ui.joystickBase) return;

    ui.joystickZone.style.touchAction = "none";
    ui.joystickBase.style.touchAction = "none";

    ui.joystickZone.addEventListener("pointerdown", event => {
      if (!state.active || state.paused || state.finished) return;

      event.preventDefault();

      state.joyPointer = event.pointerId;

      try {
        ui.joystickZone.setPointerCapture(event.pointerId);
      } catch (_) {
        // Gen kèk navigatè ki pa sipòte pointer capture.
      }

      updateJoystickFromPointer(event);
    });

    ui.joystickZone.addEventListener("pointermove", event => {
      if (event.pointerId !== state.joyPointer) return;

      event.preventDefault();
      updateJoystickFromPointer(event);
    });

    const releaseJoystick = event => {
      if (
        state.joyPointer !== null &&
        event.pointerId !== state.joyPointer
      ) {
        return;
      }

      resetJoystick();
    };

    ui.joystickZone.addEventListener(
      "pointerup",
      releaseJoystick
    );

    ui.joystickZone.addEventListener(
      "pointercancel",
      releaseJoystick
    );

    ui.joystickZone.addEventListener(
      "lostpointercapture",
      resetJoystick
    );
  }

  /* ===================== BOUTON SOTE ===================== */

  function startJump() {
    if (
      !state.active ||
      state.paused ||
      state.finished ||
      state.jumping
    ) {
      return;
    }

    state.jumping = true;
    state.jumpVelocity = MOVEMENT.jumpPower;
  }

  function bindJumpButton() {
    if (!ui.jump) return;

    ui.jump.style.touchAction = "none";

    ui.jump.addEventListener("pointerdown", event => {
      event.preventDefault();

      jumpPointer = event.pointerId;
      startJump();
    });

    const releaseJump = event => {
      if (
        jumpPointer !== null &&
        event.pointerId !== jumpPointer
      ) {
        return;
      }

      jumpPointer = null;
    };

    ui.jump.addEventListener("pointerup", releaseJump);
    ui.jump.addEventListener("pointercancel", releaseJump);
  }

  /* ===================== BOUTON KOURI ===================== */

  function bindSprintButton() {
    if (!ui.run) return;

    ui.run.style.touchAction = "none";

    ui.run.addEventListener("pointerdown", event => {
      event.preventDefault();

      sprintPointer = event.pointerId;
      state.sprint = true;
    });

    const stopSprint = event => {
      if (
        sprintPointer !== null &&
        event.pointerId !== sprintPointer
      ) {
        return;
      }

      sprintPointer = null;
      state.sprint = false;
    };

    ui.run.addEventListener("pointerup", stopSprint);
    ui.run.addEventListener("pointercancel", stopSprint);
    ui.run.addEventListener("lostpointercapture", () => {
      sprintPointer = null;
      state.sprint = false;
    });
  }

  /* ===================== KAMERA AK SOURIT ===================== */

  function bindCameraControl() {
    if (!canvas) return;

    canvas.style.touchAction = "none";

    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener("pointerdown", event => {
      if (!state.active || state.paused || state.finished) return;

      if (event.pointerType === "mouse" && event.button !== 2) {
        return;
      }

      cameraPointer = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;

      try {
        canvas.setPointerCapture(event.pointerId);
      } catch (_) {
        // Pointer capture pa obligatwa.
      }
    });

    canvas.addEventListener("pointermove", event => {
      if (event.pointerId !== cameraPointer) return;
      if (!state.active || state.paused || state.finished) return;

      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;

      lastX = event.clientX;
      lastY = event.clientY;

      const sensitivity = clamp(
        Number(state.settings.sensitivity) || 5,
        1,
        10
      );

      const factor = sensitivity * 0.0018;

      state.cameraAngle -= dx * factor;
      state.cameraPitch = clamp(
        state.cameraPitch - dy * factor,
        MOVEMENT.minPitch,
        MOVEMENT.maxPitch
      );
    });

    const releaseCamera = event => {
      if (event.pointerId === cameraPointer) {
        cameraPointer = null;
      }
    };

    canvas.addEventListener("pointerup", releaseCamera);
    canvas.addEventListener("pointercancel", releaseCamera);

    canvas.addEventListener("contextmenu", event => {
      event.preventDefault();
    });

    if (ui.camera) {
      ui.camera.addEventListener("click", () => {
        state.cameraAngle += Math.PI / 4;
      });
    }
  }

  /* ===================== KLAVYE PC ===================== */

  function bindMovementKeyboard() {
    window.addEventListener("keydown", event => {
      const key = event.key.toLowerCase();

      state.keys[key] = true;

      if (
        [
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
          " "
        ].includes(key)
      ) {
        event.preventDefault();
      }

      if (
        key === " " &&
        !event.repeat
      ) {
        startJump();
      }

      if (
        key === "shift" &&
        state.active &&
        !state.paused
      ) {
        state.sprint = true;
      }

      if (
        key === "q" &&
        state.active &&
        !state.paused
      ) {
        state.cameraPitch = clamp(
          state.cameraPitch + MOVEMENT.pitchSpeed,
          MOVEMENT.minPitch,
          MOVEMENT.maxPitch
        );
      }

      if (
        key === "e" &&
        state.active &&
        !state.paused
      ) {
        state.cameraPitch = clamp(
          state.cameraPitch - MOVEMENT.pitchSpeed,
          MOVEMENT.minPitch,
          MOVEMENT.maxPitch
        );
      }
    });

    window.addEventListener("keyup", event => {
      const key = event.key.toLowerCase();

      state.keys[key] = false;

      if (key === "shift") {
        state.sprint = false;
      }
    });

    window.addEventListener("blur", () => {
      state.keys = Object.create(null);
      state.sprint = false;
      resetJoystick();
    });
  }

  /* ===================== KALKILE DIREKSYON ===================== */

  function getMovementInput() {
    let x = state.joyX;
    let y = state.joyY;

    if (state.keys.a || state.keys.arrowleft) x -= 1;
    if (state.keys.d || state.keys.arrowright) x += 1;
    if (state.keys.w || state.keys.arrowup) y -= 1;
    if (state.keys.s || state.keys.arrowdown) y += 1;

    const length = Math.hypot(x, y);

    if (length > 1) {
      x /= length;
      y /= length;
    }

    return { x, y };
  }

  /* ===================== METE JWÈ A AN MOUVMAN ===================== */

  function updateMovement(deltaTime) {
    if (
      !state.active ||
      state.paused ||
      state.finished ||
      lostContext
    ) {
      return;
    }

    const dt = clamp(deltaTime, 0, 0.05);
    const input = getMovementInput();

    const hasInput =
      Math.abs(input.x) > 0.01 ||
      Math.abs(input.y) > 0.01;

    const character =
      CHARACTERS[state.character] || CHARACTERS.MEME;

    let speed = character.speed * MOVEMENT.walkSpeed;

    if (state.sprint && state.energy > 0 && hasInput) {
      speed *= MOVEMENT.sprintMultiplier;
      state.energy = Math.max(0, state.energy - 24 * dt);
    } else {
      state.energy = Math.min(100, state.energy + 12 * dt);
    }

    // Mouvman an suiv direksyon kamera a.
    const forwardX = -Math.sin(state.cameraAngle);
    const forwardZ = -Math.cos(state.cameraAngle);

    const rightX = Math.cos(state.cameraAngle);
    const rightZ = -Math.sin(state.cameraAngle);

    const moveX =
      rightX * input.x +
      forwardX * -input.y;

    const moveZ =
      rightZ * input.x +
      forwardZ * -input.y;

    if (hasInput) {
      state.x += moveX * speed * dt;
      state.z += moveZ * speed * dt;

      state.facing = Math.atan2(moveX, moveZ);
    }

    // Kenbe pèsonaj la andedan limit mond lan.
    state.x = clamp(state.x, -WORLD_LIMIT, WORLD_LIMIT);
    state.z = clamp(state.z, -WORLD_LIMIT, WORLD_LIMIT);

    // Fizik sote a.
    if (state.jumping) {
      state.jumpY += state.jumpVelocity * dt;
      state.jumpVelocity -= MOVEMENT.gravity * dt;

      if (state.jumpY <= 0) {
        state.jumpY = 0;
        state.jumpVelocity = 0;
        state.jumping = false;
      }
    }

    // Rejenere enèji piti piti lè jwè a pa kouri.
    if (ui.hudEnergy) {
      ui.hudEnergy.textContent =
        `${Math.round(state.energy)}%`;
    }

    // Mete pozisyon HUD la ajou si eleman yo egziste.
    if (ui.location) {
      ui.location.textContent =
        `X: ${state.x.toFixed(1)} | Z: ${state.z.toFixed(1)}`;
    }
  }

  /* ===================== INISYALIZE KONTWÒL ===================== */

  function setupMovementControls() {
    if (movementControlsReady) return;

    movementControlsReady = true;

    createPitchControls();
    bindJoystick();
    bindJumpButton();
    bindSprintButton();
    bindCameraControl();
    bindMovementKeyboard();

    window.addEventListener("resize", resizeCanvas);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        state.sprint = false;
        resetJoystick();
      }
    });
  }

  /* ===================== FIN PATI 3 ===================== */

  // Pa mete })(); isit la.
  // Pati 4 dwe kontinye nan menm fichye a.












  /* =========================================================
     PATI 4 — MISYON, KRISTAL, LÈNMI, AKSYON AK REKONPANZ
     Kontinye nan menm IIFE a.
  ========================================================= */

  /* ===================== PARAMÈT MISYON ===================== */

  const MISSION_RULES = {
    crystalRange: 1.65,
    enemyRange: 1.35,
    enemySpeed: 1.15,
    enemyDamage: 8,
    enemyDamageDelay: 1.0,
    actionCooldown: 0.35,
    particleLifetime: 0.65
  };

  let missionSystemsReady = false;
  let enemyDamageCooldown = 0;
  let missionActionPointer = null;

  /* ===================== NOTIFIKASYON ===================== */

  function missionMessage(message) {
    if (typeof showNotification === "function") {
      showNotification(message);
      return;
    }

    if (!ui.notifications) return;

    ui.notifications.textContent = message;
    ui.notifications.classList.add("show");

    window.clearTimeout(state.notifyTimer);

    state.notifyTimer = window.setTimeout(() => {
      if (ui.notifications) {
        ui.notifications.classList.remove("show");
      }
    }, 2000);
  }

  /* ===================== MIZAJOU HUD MISYON ===================== */

  function updateMissionHUD() {
    const mission = MISSIONS[state.mission] || MISSIONS[1];
    const target = mission.target;

    if (ui.hudMissionTitle) {
      ui.hudMissionTitle.textContent =
        `Misyon ${state.mission}: ${mission.title}`;
    }

    if (ui.hudObjective) {
      ui.hudObjective.textContent = mission.description;
    }

    if (ui.objectiveCount) {
      ui.objectiveCount.textContent =
        `${Math.min(state.collected, target)} / ${target}`;
    }

    if (ui.objectiveProgress) {
      const percentage = clamp(
        (state.collected / target) * 100,
        0,
        100
      );

      if ("value" in ui.objectiveProgress) {
        ui.objectiveProgress.value = percentage;
      } else {
        ui.objectiveProgress.style.width =
          `${percentage}%`;
      }

      ui.objectiveProgress.setAttribute(
        "aria-valuenow",
        String(Math.round(percentage))
      );
    }

    if (ui.hudScore) {
      ui.hudScore.textContent = String(state.score);
    }

    if (ui.hudHealth) {
      ui.hudHealth.textContent =
        `${Math.round(state.health)}%`;
    }

    if (ui.hudEnergy) {
      ui.hudEnergy.textContent =
        `${Math.round(state.energy)}%`;
    }

    if (ui.hudLevel) {
      ui.hudLevel.textContent =
        `Nivo ${state.mission}`;
    }

    if (ui.hudCharacter) {
      ui.hudCharacter.textContent = state.character;
    }

    if (ui.timer) {
      const totalSeconds = Math.max(
        0,
        Math.floor(state.elapsed)
      );

      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      ui.timer.textContent =
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;
    }
  }

  /* ===================== PATIKIL KI PI PRE KRISTAL ===================== */

  function spawnMissionParticles(x, y, z, color, amount = 8) {
    for (let i = 0; i < amount; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(0.6, 2.2);

      state.particles.push({
        x,
        y,
        z,
        vx: Math.cos(angle) * speed,
        vy: rand(0.7, 2.2),
        vz: Math.sin(angle) * speed,
        life: MISSION_RULES.particleLifetime,
        maxLife: MISSION_RULES.particleLifetime,
        color: color.slice()
      });
    }
  }

  function updateMissionParticles(deltaTime) {
    const dt = clamp(deltaTime, 0, 0.05);

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const particle = state.particles[i];

      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.z += particle.vz * dt;
      particle.vy -= 4 * dt;

      if (particle.life <= 0) {
        state.particles.splice(i, 1);
      }
    }
  }

  function renderMissionParticles() {
    if (!gl || lostContext || !meshes.crystal) return;

    for (const particle of state.particles) {
      const scale = Math.max(
        0.04,
        0.16 * (particle.life / particle.maxLife)
      );

      drawMesh(
        meshes.crystal,
        modelMatrix(
          particle.x,
          Math.max(0.08, particle.y),
          particle.z,
          scale,
          scale,
          scale
        ),
        particle.color,
        0.35
      );
    }
  }

  /* ===================== KOLEKTE KRISTAL ===================== */

  function collectMissionCrystal(crystal) {
    if (!crystal || crystal.collected) return false;

    const mission = MISSIONS[state.mission] || MISSIONS[1];

    if (state.collected >= mission.target) {
      return false;
    }

    crystal.collected = true;
    state.collected += 1;
    state.score += 10;

    spawnMissionParticles(
      crystal.x,
      crystal.y,
      crystal.z,
      [0.15, 0.9, 1],
      10
    );

    missionMessage(
      `Kristal jwenn! ${state.collected}/${mission.target}`
    );

    updateMissionHUD();

    if (state.collected >= mission.target) {
      completeMissionSystems();
    }

    return true;
  }

  function findNearbyCrystal(maxDistance = MISSION_RULES.crystalRange) {
    let nearest = null;
    let nearestDistance = maxDistance;

    for (const crystal of state.crystals) {
      if (crystal.collected) continue;

      const distance = Math.hypot(
        state.x - crystal.x,
        state.z - crystal.z
      );

      if (distance < nearestDistance) {
        nearest = crystal;
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  function collectNearbyMissionCrystal() {
    const crystal = findNearbyCrystal();

    if (!crystal) {
      missionMessage("Pwoche pi pre yon kristal pou kolekte li.");
      return false;
    }

    return collectMissionCrystal(crystal);
  }

  /* ===================== KREYE LÈNMI ===================== */

  function createMissionEnemies() {
    state.enemies = [];

    const count = Math.min(
      2 + state.mission,
      8
    );

    for (let i = 0; i < count; i++) {
      let x = rand(-WORLD_LIMIT + 5, WORLD_LIMIT - 5);
      let z = rand(-WORLD_LIMIT + 5, WORLD_LIMIT - 5);

      let attempts = 0;

      while (
        Math.hypot(x - state.x, z - state.z) < 10 &&
        attempts < 25
      ) {
        x = rand(-WORLD_LIMIT + 5, WORLD_LIMIT - 5);
        z = rand(-WORLD_LIMIT + 5, WORLD_LIMIT - 5);
        attempts++;
      }

      state.enemies.push({
        x,
        y: 0.75,
        z,
        health: 2 + Math.floor(state.mission / 3),
        speed: MISSION_RULES.enemySpeed +
          rand(0, 0.45),
        phase: rand(0, Math.PI * 2),
        alive: true,
        attackCooldown: rand(0.2, 0.8)
      });
    }
  }

  /* ===================== MOUVMAN LÈNMI ===================== */

  function updateMissionEnemies(deltaTime) {
    const dt = clamp(deltaTime, 0, 0.05);

    enemyDamageCooldown = Math.max(
      0,
      enemyDamageCooldown - dt
    );

    for (const enemy of state.enemies) {
      if (!enemy.alive) continue;

      const dx = state.x - enemy.x;
      const dz = state.z - enemy.z;
      const distance = Math.hypot(dx, dz);

      enemy.attackCooldown = Math.max(
        0,
        enemy.attackCooldown - dt
      );

      if (distance > MISSION_RULES.enemyRange && distance > 0.001) {
        enemy.x +=
          (dx / distance) *
          enemy.speed *
          dt;

        enemy.z +=
          (dz / distance) *
          enemy.speed *
          dt;
      } else if (
        enemy.attackCooldown <= 0 &&
        enemyDamageCooldown <= 0
      ) {
        state.health = Math.max(
          0,
          state.health - MISSION_RULES.enemyDamage
        );

        enemy.attackCooldown = 1.2;
        enemyDamageCooldown =
          MISSION_RULES.enemyDamageDelay;

        missionMessage("Atansyon! Yon lènmi pwoche ou.");

        updateMissionHUD();

        if (state.health <= 0) {
          failMissionSystems();
          break;
        }
      }

      enemy.x = clamp(
        enemy.x,
        -WORLD_LIMIT,
        WORLD_LIMIT
      );

      enemy.z = clamp(
        enemy.z,
        -WORLD_LIMIT,
        WORLD_LIMIT
      );
    }
  }

  function renderMissionEnemies(timeSeconds) {
    if (!gl || lostContext || !meshes.cube) return;

    for (const enemy of state.enemies) {
      if (!enemy.alive) continue;

      const bob = Math.sin(
        timeSeconds * 3 + enemy.phase
      ) * 0.08;

      drawCube(
        enemy.x,
        0.75 + bob,
        enemy.z,
        0.8,
        1.15,
        0.7,
        [0.82, 0.12, 0.19],
        timeSeconds * 0.4,
        0.08
      );

      drawCube(
        enemy.x,
        1.43 + bob,
        enemy.z,
        0.65,
        0.45,
        0.62,
        [0.48, 0.08, 0.15],
        timeSeconds * 0.4
      );
    }
  }

  /* ===================== AKSYON JWÈ A ===================== */

  function performMissionAction() {
    if (
      !state.active ||
      state.paused ||
      state.finished ||
      lostContext
    ) {
      return;
    }

    if (state.shotCooldown > 0) return;

    state.shotCooldown = MISSION_RULES.actionCooldown;

    // Si yon kristal toupre, aksyon an kolekte li.
    const crystal = findNearbyCrystal();

    if (crystal) {
      collectMissionCrystal(crystal);
      return;
    }

    // Sinon, aksyon an frape lènmi ki toupre yo.
    let target = null;
    let bestDistance = 3.2;

    for (const enemy of state.enemies) {
      if (!enemy.alive) continue;

      const distance = Math.hypot(
        state.x - enemy.x,
        state.z - enemy.z
      );

      if (distance < bestDistance) {
        target = enemy;
        bestDistance = distance;
      }
    }

    if (!target) {
      missionMessage("Pa gen kristal oswa lènmi toupre ou.");
      return;
    }

    target.health -= 1;

    spawnMissionParticles(
      target.x,
      target.y,
      target.z,
      [1, 0.25, 0.18],
      6
    );

    if (target.health <= 0) {
      target.alive = false;
      state.score += 25;
      missionMessage("Ou depase yon lènmi! +25 pwen");
    } else {
      missionMessage("Ou frape lènmi an!");
    }

    updateMissionHUD();
  }

  function bindMissionAction() {
    if (!ui.action) return;

    ui.action.style.touchAction = "none";

    ui.action.addEventListener("pointerdown", event => {
      event.preventDefault();

      if (missionActionPointer !== null) return;

      missionActionPointer = event.pointerId;
      performMissionAction();
    });

    const releaseAction = event => {
      if (event.pointerId === missionActionPointer) {
        missionActionPointer = null;
      }
    };

    ui.action.addEventListener("pointerup", releaseAction);
    ui.action.addEventListener("pointercancel", releaseAction);

    window.addEventListener("keydown", event => {
      if (
        event.repeat ||
        event.key.toLowerCase() !== "f"
      ) {
        return;
      }

      performMissionAction();
    });
  }

  /* ===================== REZILTA MISYON ===================== */

  function completeMissionSystems() {
    if (state.finished) return;

    const mission = MISSIONS[state.mission] || MISSIONS[1];

    state.finished = true;
    state.active = false;
    state.paused = false;

    state.score += mission.reward;

    updateMissionHUD();

    if (typeof finishMission === "function") {
      finishMission(true);
      return;
    }

    if (ui.result) {
      ui.result.hidden = false;
      ui.result.style.display = "flex";
    }

    if (ui.resultTitle) {
      ui.resultTitle.textContent = "Misyon Reyisi!";
    }

    if (ui.resultDescription) {
      ui.resultDescription.textContent =
        `${mission.title} fini. Ou resevwa ${mission.reward} pwen kòm rekonpans.`;
    }

    if (ui.resultScore) {
      ui.resultScore.textContent = String(state.score);
    }

    missionMessage("Felisitasyon! Ou fini misyon an.");
  }

  function failMissionSystems() {
    if (state.finished) return;

    state.finished = true;
    state.active = false;
    state.paused = false;

    updateMissionHUD();

    if (ui.result) {
      ui.result.hidden = false;
      ui.result.style.display = "flex";
    }

    if (ui.resultTitle) {
      ui.resultTitle.textContent = "Misyon Echwe";
    }

    if (ui.resultDescription) {
      ui.resultDescription.textContent =
        "Sante ou fini. Ou ka rekòmanse misyon an.";
    }

    if (ui.resultScore) {
      ui.resultScore.textContent = String(state.score);
    }

    missionMessage("Misyon fini. Eseye ankò!");
  }

  /* ===================== DEMARE YON MISYON ===================== */

  function setupMissionSystems() {
    if (missionSystemsReady) return;

    missionSystemsReady = true;

    bindMissionAction();
    updateMissionHUD();
  }

  function resetMissionSystems() {
    const mission = MISSIONS[state.mission] || MISSIONS[1];

    state.collected = 0;
    state.elapsed = 0;
    state.health = 100;
    state.energy = 100;
    state.finished = false;
    state.paused = false;
    state.sprint = false;
    state.shotCooldown = 0;

    enemyDamageCooldown = 0;

    state.x = 0;
    state.z = 0;
    state.jumpY = 0;
    state.jumpVelocity = 0;
    state.jumping = false;

    state.cameraAngle = 0;
    state.cameraPitch = 0.35;
    state.cameraDistance = 8;
    state.targetCameraDistance = 8;

    state.particles = [];

    createWorld();
    createMissionEnemies();
    updateMissionHUD();

    if (ui.hudObjective) {
      ui.hudObjective.textContent = mission.description;
    }
  }

  /* ===================== MIZAJOU SISTÈM MISYON ===================== */

  function updateMissionSystems(deltaTime) {
    if (
      !state.active ||
      state.paused ||
      state.finished ||
      lostContext
    ) {
      return;
    }

    const dt = clamp(deltaTime, 0, 0.05);

    state.elapsed += dt;

    state.shotCooldown = Math.max(
      0,
      state.shotCooldown - dt
    );

    updateMissionParticles(dt);
    updateMissionEnemies(dt);
    updateMissionHUD();
  }

  /* ===================== FIN PATI 4 ===================== */

  // Pa mete })(); isit la.
  // Pati 5 dwe kontinye nan menm estrikti JavaScript la.










// ============================================================
// PATI 5/6 — MENI, PARAMÈT, SOVGAD, HUD AK REZILTA MISYON
// Kole pati sa a dirèkteman apre Pati 4.
// Pa mete yon lòt IIFE epi pa ajoute })(); nan pati sa a.
// ============================================================

const SAVE_KEY = "fobasMission3D_save_v1";

let menuControlsReady = false;
let saveSystemReady = false;
let notificationElement = null;
let notificationHideTimer = null;

// ------------------------------------------------------------
// 1. ZOUTI POU KONTWOLE AFICHAY ELEMAN HTML YO
// ------------------------------------------------------------

function setElementVisible(element, visible, displayMode = "flex") {
    if (!element) return;

    element.hidden = !visible;
    element.style.display = visible ? displayMode : "none";
    element.setAttribute("aria-hidden", visible ? "false" : "true");
}

function showScreen(screenName) {
    const screens = [
        { name: "menu", element: ui.menu },
        { name: "game", element: ui.game },
        { name: "missions", element: ui.missionMenu },
        { name: "characters", element: ui.characterMenu },
        { name: "settings", element: ui.settingsMenu },
        { name: "pause", element: ui.pauseMenu },
        { name: "result", element: ui.result }
    ];

    screens.forEach((screen) => {
        const visible = screen.name === screenName;
        if (screen.element) {
            setElementVisible(screen.element, visible);
        }
    });

    if (ui.loading) {
        setElementVisible(ui.loading, false);
    }
}

function openMenu(menuName) {
    if (state.active && menuName !== "game" && menuName !== "pause") {
        state.active = false;
    }

    if (menuName === "missions") {
        showScreen("missions");
    } else if (menuName === "characters") {
        showScreen("characters");
        updateCharacterSelectionUI();
    } else if (menuName === "settings") {
        showScreen("settings");
        syncSettingsControls();
    } else if (menuName === "pause") {
        showScreen("pause");
    } else if (menuName === "game") {
        showScreen("game");
    } else {
        showScreen("menu");
    }
}

// ------------------------------------------------------------
// 2. NOTIFIKASYON AK MESAJ ERÈ
// ------------------------------------------------------------

function showNotification(message, duration = 2600) {
    const text = String(message || "");

    if (ui.notifications) {
        ui.notifications.textContent = text;
        setElementVisible(ui.notifications, true, "block");

        if (notificationHideTimer !== null) {
            clearTimeout(notificationHideTimer);
        }

        notificationHideTimer = setTimeout(() => {
            if (ui.notifications) {
                setElementVisible(ui.notifications, false);
            }
            notificationHideTimer = null;
        }, Math.max(500, Number(duration) || 2600));

        return;
    }

    if (!notificationElement) {
        notificationElement = document.createElement("div");
        notificationElement.id = "runtime-notification";
        notificationElement.setAttribute("role", "status");
        notificationElement.style.position = "fixed";
        notificationElement.style.left = "50%";
        notificationElement.style.bottom = "22px";
        notificationElement.style.transform = "translateX(-50%)";
        notificationElement.style.zIndex = "9999";
        notificationElement.style.maxWidth = "90%";
        notificationElement.style.padding = "12px 18px";
        notificationElement.style.borderRadius = "10px";
        notificationElement.style.background = "rgba(10, 18, 30, 0.94)";
        notificationElement.style.color = "#ffffff";
        notificationElement.style.fontFamily = "sans-serif";
        notificationElement.style.fontSize = "14px";
        notificationElement.style.textAlign = "center";
        notificationElement.style.pointerEvents = "none";
        document.body.appendChild(notificationElement);
    }

    notificationElement.textContent = text;
    notificationElement.style.display = "block";

    if (notificationHideTimer !== null) {
        clearTimeout(notificationHideTimer);
    }

    notificationHideTimer = setTimeout(() => {
        if (notificationElement) {
            notificationElement.style.display = "none";
        }
        notificationHideTimer = null;
    }, Math.max(500, Number(duration) || 2600));
}

function showAppError(message) {
    const errorText = String(message || "Yon erè rive pandan jwèt la t ap fonksyone.");

    if (ui.errorMessage) {
        ui.errorMessage.textContent = errorText;
    }

    if (ui.error) {
        setElementVisible(ui.error, true);
    } else {
        showNotification(errorText, 5000);
    }
}

function hideAppError() {
    if (ui.error) {
        setElementVisible(ui.error, false);
    }
}

// ------------------------------------------------------------
// 3. SOVGAD AK CHAJMAN PWOGRÈ JWE A
// ------------------------------------------------------------

function getSafeSavedData() {
    return {
        version: 1,
        mission: Number(state.mission) || 1,
        character: String(state.character || "FOBAS"),
        selectedCharacter: String(
            state.selectedCharacter || state.character || "FOBAS"
        ),
        score: Math.max(0, Number(state.score) || 0),
        settings: {
            quality: state.settings.quality || "high",
            sensitivity: clamp(
                Number(state.settings.sensitivity) || 5,
                1,
                10
            ),
            volume: clamp(
                Number(state.settings.volume) || 0,
                0,
                100
            ),
            sound: state.settings.sound !== false
        },
        savedAt: Date.now()
    };
}

function saveGameData() {
    try {
        const data = getSafeSavedData();
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        saveSystemReady = true;

        if (ui.saveStatus) {
            ui.saveStatus.textContent = "Sovgad la reyisi.";
        }

        return true;
    } catch (error) {
        console.warn("Sovgad lokal la pa disponib:", error);

        if (ui.saveStatus) {
            ui.saveStatus.textContent =
                "Sovgad pa disponib sou aparèy sa a.";
        }

        return false;
    }
}

function loadGameData() {
    try {
        const rawData = localStorage.getItem(SAVE_KEY);

        if (!rawData) {
            saveSystemReady = true;
            syncSettingsControls();
            return false;
        }

        const data = JSON.parse(rawData);

        if (!data || typeof data !== "object") {
            throw new Error("Done sovgad yo pa nan bon fòma.");
        }

        const missionNumber = Number(data.mission);
        const missionExists = MISSIONS.some(
            (mission) => Number(mission.id) === missionNumber
        );

        if (missionExists) {
            state.mission = missionNumber;
        }

        const savedCharacter = String(data.character || "");
        const selectedCharacter = String(
            data.selectedCharacter || savedCharacter
        );

        if (CHARACTERS[savedCharacter]) {
            state.character = savedCharacter;
        }

        if (CHARACTERS[selectedCharacter]) {
            state.selectedCharacter = selectedCharacter;
        } else if (CHARACTERS[state.character]) {
            state.selectedCharacter = state.character;
        }

        if (Number.isFinite(Number(data.score))) {
            state.score = Math.max(0, Number(data.score));
        }

        if (data.settings && typeof data.settings === "object") {
            const savedSettings = data.settings;

            if (["low", "medium", "high"].includes(savedSettings.quality)) {
                state.settings.quality = savedSettings.quality;
            }

            if (Number.isFinite(Number(savedSettings.sensitivity))) {
                state.settings.sensitivity = clamp(
                    Number(savedSettings.sensitivity),
                    1,
                    10
                );
            }

            if (Number.isFinite(Number(savedSettings.volume))) {
                state.settings.volume = clamp(
                    Number(savedSettings.volume),
                    0,
                    100
                );
            }

            if (typeof savedSettings.sound === "boolean") {
                state.settings.sound = savedSettings.sound;
            }
        }

        saveSystemReady = true;
        syncSettingsControls();
        updateCharacterSelectionUI();

        return true;
    } catch (error) {
        console.warn("Pa t kapab chaje sovgad la:", error);
        saveSystemReady = false;

        if (ui.saveStatus) {
            ui.saveStatus.textContent =
                "Sovgad la pa t kapab chaje; jwèt la ap itilize paramèt nòmal yo.";
        }

        return false;
    }
}

// ------------------------------------------------------------
// 4. PARAMÈT JWÈT LA
// ------------------------------------------------------------

function syncSettingsControls() {
    if (ui.quality) {
        ui.quality.value = state.settings.quality || "high";
    }

    if (ui.sensitivity) {
        ui.sensitivity.value = String(
            clamp(Number(state.settings.sensitivity) || 5, 1, 10)
        );
    }

    if (ui.volume) {
        ui.volume.value = String(
            clamp(Number(state.settings.volume) || 0, 0, 100)
        );
    }

    if (ui.sound) {
        ui.sound.checked = state.settings.sound !== false;
    }
}

function readSettingsControls() {
    if (ui.quality) {
        const qualityValue = String(ui.quality.value || "high");

        if (["low", "medium", "high"].includes(qualityValue)) {
            state.settings.quality = qualityValue;
        }
    }

    if (ui.sensitivity) {
        state.settings.sensitivity = clamp(
            Number(ui.sensitivity.value) || 5,
            1,
            10
        );
    }

    if (ui.volume) {
        state.settings.volume = clamp(
            Number(ui.volume.value) || 0,
            0,
            100
        );
    }

    if (ui.sound) {
        state.settings.sound = Boolean(ui.sound.checked);
    }
}

function applySettings() {
    state.settings.sensitivity = clamp(
        Number(state.settings.sensitivity) || 5,
        1,
        10
    );

    state.settings.volume = clamp(
        Number(state.settings.volume) || 0,
        0,
        100
    );

    state.settings.sound = state.settings.sound !== false;

    if (canvas) {
        resizeCanvas();
    }

    if (ui.saveStatus) {
        ui.saveStatus.textContent = "Paramèt yo aplike.";
    }
}

// ------------------------------------------------------------
// 5. CHWA PÈSONAJ
// ------------------------------------------------------------

function updateCharacterSelectionUI() {
    const selectedId = String(
        state.selectedCharacter || state.character || "FOBAS"
    );

    if (ui.selectedCharacter) {
        const characterData = CHARACTERS[selectedId];

        ui.selectedCharacter.textContent = characterData
            ? String(characterData.name || selectedId)
            : selectedId;
    }

    document.querySelectorAll("[data-character]").forEach((element) => {
        const characterId = String(element.dataset.character || "");
        const selected = characterId === selectedId;

        element.classList.toggle("selected", selected);
        element.setAttribute("aria-pressed", selected ? "true" : "false");
    });
}

function selectCharacter(characterId) {
    const id = String(characterId || "");

    if (!CHARACTERS[id]) {
        showNotification("Pèsonaj sa a pa disponib.");
        return;
    }

    state.selectedCharacter = id;
    updateCharacterSelectionUI();
    saveGameData();
}

function confirmCharacterSelection() {
    const id = String(
        state.selectedCharacter || state.character || "FOBAS"
    );

    if (!CHARACTERS[id]) {
        showNotification("Chwazi yon pèsonaj ki disponib anvan.");
        return;
    }

    state.character = id;
    saveGameData();
    showNotification("Pèsonaj chwazi: " + id);
    openMenu("menu");
}

// ------------------------------------------------------------
// 6. CHWA MISYON
// ------------------------------------------------------------

function selectMission(missionId) {
    const id = Number(missionId);
    const mission = MISSIONS.find(
        (item) => Number(item.id) === id
    );

    if (!mission) {
        showNotification("Misyon sa a pa disponib.");
        return;
    }

    state.mission = id;
    saveGameData();
    startGame();
}

// ------------------------------------------------------------
// 7. HUD AK ENFÒMASYON JWÈ A
// ------------------------------------------------------------

function updateMainHUD() {
    const characterId = String(state.character || "FOBAS");
    const characterData = CHARACTERS[characterId] || {};
    const mission = MISSIONS.find(
        (item) => Number(item.id) === Number(state.mission)
    );

    if (ui.hudCharacter) {
        ui.hudCharacter.textContent = String(
            characterData.name || characterId
        );
    }

    if (ui.hudLevel) {
        ui.hudLevel.textContent = String(state.mission || 1);
    }

    if (ui.hudHealth) {
        ui.hudHealth.textContent = String(
            Math.round(clamp(Number(state.health) || 0, 0, 100))
        );
    }

    if (ui.hudEnergy) {
        ui.hudEnergy.textContent = String(
            Math.round(clamp(Number(state.energy) || 0, 0, 100))
        );
    }

    if (ui.hudScore) {
        ui.hudScore.textContent = String(
            Math.max(0, Math.round(Number(state.score) || 0))
        );
    }

    if (ui.hudMissionTitle && mission) {
        ui.hudMissionTitle.textContent = String(mission.title || "Misyon");
    }

    if (ui.hudObjective && mission) {
        ui.hudObjective.textContent = String(
            mission.description || "Kontinye misyon an."
        );
    }

    if (ui.location) {
        ui.location.textContent =
            "X: " + Math.round(Number(state.x) || 0) +
            " | Z: " + Math.round(Number(state.z) || 0);
    }

    if (ui.timer) {
        const elapsed = Math.max(0, Number(state.elapsed) || 0);
        const minutes = Math.floor(elapsed / 60);
        const seconds = Math.floor(elapsed % 60);

        ui.timer.textContent =
            String(minutes).padStart(2, "0") +
            ":" +
            String(seconds).padStart(2, "0");
    }
}

// ------------------------------------------------------------
// 8. KÒMANSE, REKÒMANSE AK KONTINYE MISYON
// ------------------------------------------------------------

function startGame() {
    const chosenMission = MISSIONS.find(
        (item) => Number(item.id) === Number(state.mission)
    );

    if (!chosenMission) {
        state.mission = Number(MISSIONS[0].id) || 1;
    }

    if (!CHARACTERS[state.character]) {
        state.character = CHARACTERS[state.selectedCharacter]
            ? state.selectedCharacter
            : "FOBAS";
    }

    state.selectedCharacter = state.character;
    state.paused = false;
    state.finished = false;
    state.active = false;

    if (typeof resetMissionSystems === "function") {
        resetMissionSystems();
    } else if (typeof createWorld === "function") {
        createWorld();
    }

    if (typeof setupMovementControls === "function") {
        setupMovementControls();
    }

    if (typeof setupMissionSystems === "function") {
        setupMissionSystems();
    }

    state.active = true;
    state.paused = false;
    state.finished = false;

    if (ui.result) {
        setElementVisible(ui.result, false);
    }

    if (ui.pauseMenu) {
        setElementVisible(ui.pauseMenu, false);
    }

    showScreen("game");
    updateMainHUD();
    updateMissionHUD();

    saveGameData();

    if (typeof startAnimation === "function") {
        startAnimation();
    }

    showNotification("Misyon an kòmanse!");
}

function restartMission() {
    startGame();
}

function continueGame() {
    startGame();
}

// ------------------------------------------------------------
// 9. POZ, REPRANN AK RETOUNEN NAN MENI
// ------------------------------------------------------------

function pauseGame() {
    if (!state.active || state.finished) return;

    state.paused = true;
    state.active = false;

    openMenu("pause");
}

function resumeGame() {
    if (state.finished) return;

    state.paused = false;
    state.active = true;

    showScreen("game");

    if (typeof startAnimation === "function") {
        startAnimation();
    }
}

function returnToMenu() {
    state.active = false;
    state.paused = false;

    saveGameData();

    showScreen("menu");
    updateCharacterSelectionUI();
}

// ------------------------------------------------------------
// 10. REZILTA MISYON
// ------------------------------------------------------------

function finishMission(success = true) {
    if (state.finished && ui.result && !ui.result.hidden) {
        return;
    }

    state.finished = true;
    state.active = false;
    state.paused = false;

    const mission = MISSIONS.find(
        (item) => Number(item.id) === Number(state.mission)
    );

    if (success && mission) {
        const reward = Math.max(0, Number(mission.reward) || 0);
        state.score = Math.max(0, Number(state.score) || 0) + reward;
    }

    if (ui.resultTitle) {
        ui.resultTitle.textContent = success
            ? "MISYON REYISI!"
            : "MISYON FINI";
    }

    if (ui.resultDescription) {
        ui.resultDescription.textContent = success
            ? "Bon travay! Ou fini misyon an."
            : "Misyon sa a fini. Ou ka eseye ankò.";
    }

    if (ui.resultScore) {
        ui.resultScore.textContent = String(
            Math.max(0, Math.round(Number(state.score) || 0))
        );
    }

    if (ui.nextMission) {
        const hasNextMission = MISSIONS.some(
            (item) => Number(item.id) === Number(state.mission) + 1
        );

        setElementVisible(ui.nextMission, success && hasNextMission, "inline-flex");
    }

    if (ui.result) {
        setElementVisible(ui.result, true);
    } else {
        showNotification(
            success ? "Misyon reyisi!" : "Misyon fini.",
            4000
        );
    }

    saveGameData();
}

function goToNextMission() {
    const nextId = Number(state.mission) + 1;
    const nextMission = MISSIONS.find(
        (item) => Number(item.id) === nextId
    );

    if (!nextMission) {
        showNotification("Ou fini tout misyon ki disponib yo!");
        returnToMenu();
        return;
    }

    state.mission = nextId;
    startGame();
}

// ------------------------------------------------------------
// 11. KONEKTE TOUT BOUTON AK MENI YO
// ------------------------------------------------------------

function bindMenuControls() {
    if (menuControlsReady) return;
    menuControlsReady = true;

    if (ui.enter) {
        ui.enter.addEventListener("click", () => {
            openMenu("menu");
        });
    }

    if (ui.play) {
        ui.play.addEventListener("click", () => {
            openMenu("missions");
        });
    }

    if (ui.continue) {
        ui.continue.addEventListener("click", () => {
            continueGame();
        });
    }

    if (ui.missions) {
        ui.missions.addEventListener("click", () => {
            openMenu("missions");
        });
    }

    if (ui.characters) {
        ui.characters.addEventListener("click", () => {
            openMenu("characters");
        });
    }

    if (ui.settings) {
        ui.settings.addEventListener("click", () => {
            openMenu("settings");
        });
    }

    document.querySelectorAll("[data-select-mission]").forEach((element) => {
        element.addEventListener("click", () => {
            const missionId = element.dataset.selectMission;
            selectMission(missionId);
        });
    });

    document.querySelectorAll("[data-back-menu]").forEach((element) => {
        element.addEventListener("click", () => {
            openMenu("menu");
        });
    });

    document.querySelectorAll("[data-character]").forEach((element) => {
        element.addEventListener("click", () => {
            selectCharacter(element.dataset.character);
        });
    });

    if (ui.confirmCharacter) {
        ui.confirmCharacter.addEventListener("click", () => {
            confirmCharacterSelection();
        });
    }

    if (ui.saveSettings) {
        ui.saveSettings.addEventListener("click", () => {
            readSettingsControls();
            applySettings();
            saveGameData();
            showNotification("Paramèt yo sove.");
        });
    }

    if (ui.pause) {
        ui.pause.addEventListener("click", () => {
            if (state.paused) {
                resumeGame();
            } else {
                pauseGame();
            }
        });
    }

    if (ui.resume) {
        ui.resume.addEventListener("click", () => {
            resumeGame();
        });
    }

    if (ui.restart) {
        ui.restart.addEventListener("click", () => {
            restartMission();
        });
    }

    if (ui.backMenu) {
        ui.backMenu.addEventListener("click", () => {
            returnToMenu();
        });
    }

    if (ui.nextMission) {
        ui.nextMission.addEventListener("click", () => {
            goToNextMission();
        });
    }

    if (ui.resultMenu) {
        ui.resultMenu.addEventListener("click", () => {
            returnToMenu();
        });
    }

    if (ui.errorClose) {
        ui.errorClose.addEventListener("click", () => {
            hideAppError();
        });
    }

    if (ui.quality) {
        ui.quality.addEventListener("change", () => {
            readSettingsControls();
            applySettings();
        });
    }

    if (ui.sensitivity) {
        ui.sensitivity.addEventListener("input", () => {
            readSettingsControls();
        });
    }

    if (ui.volume) {
        ui.volume.addEventListener("input", () => {
            readSettingsControls();
        });
    }

    if (ui.sound) {
        ui.sound.addEventListener("change", () => {
            readSettingsControls();
        });
    }

    window.addEventListener("beforeunload", () => {
        saveGameData();
    });

    window.addEventListener("keydown", (event) => {
        const key = String(event.key || "").toLowerCase();

        if (key === "escape" || key === "p") {
            if (state.active && !state.finished) {
                pauseGame();
            } else if (state.paused && !state.finished) {
                resumeGame();
            }
        }
    });
}

// ------------------------------------------------------------
// 12. PREPARE SISTÈM MENI AK SOVGAD YO
// Apèl fonksyon sa yo ap fèt nan Pati 6.
// ------------------------------------------------------------

function setupMenuSystems() {
    loadGameData();
    syncSettingsControls();
    updateCharacterSelectionUI();
    bindMenuControls();

    if (ui.result) {
        setElementVisible(ui.result, false);
    }

    if (ui.pauseMenu) {
        setElementVisible(ui.pauseMenu, false);
    }

    if (ui.error) {
        setElementVisible(ui.error, false);
    }

    updateMainHUD();
}


