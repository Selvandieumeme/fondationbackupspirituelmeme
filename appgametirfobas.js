
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


