/* ============================================================
   FOBAS BUBBLE SHOOTER 3D
   Ranise Moise — FOBAS Gaming Studio
   Fichier : appranisebubblefobas.js

   Moteur :
   - Three.js
   - Système de tir et collisions
   - Groupes de bulles, combos et gravité
   - 30 missions et 4 difficultés
   - 3 modes de jeu
   - 5 pouvoirs spéciaux
   - Audio Web Audio
   - IndexedDB + sauvegarde de secours
   - Contrôles tactiles Android, zoom et plein écran
   ============================================================ */

import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

"use strict";

/* ============================================================
   1. CONFIGURATION GÉNÉRALE
   ============================================================ */

const CONFIG = {
  appName: "FOBAS Bubble Shooter 3D",
  databaseName: "FOBAS_BUBBLE_SHOOTER_DB",
  databaseVersion: 1,
  storeName: "gameState",

  columns: 10,
  rows: 8,

  bubbleRadius: 0.48,
  horizontalSpacing: 1.02,
  verticalSpacing: 0.90,

  shooterY: -6.35,
  projectileSpeed: 19,

  minCluster: 3,
  maxZoom: 1.65,
  minZoom: 0.78,

  colors: [
    0xff3864,
    0x27c7ff,
    0xffd447,
    0x9b72ff,
    0x48e69b,
    0xff8a36
  ],

  colorNames: [
    "rose",
    "bleu",
    "jaune",
    "violet",
    "vert",
    "orange"
  ],

  difficulty: {
    easy: {
      startingRows: 4,
      targetMultiplier: 0.75,
      aimAssist: true,
      shotsPenalty: 0
    },

    normal: {
      startingRows: 5,
      targetMultiplier: 1,
      aimAssist: true,
      shotsPenalty: 0
    },

    hard: {
      startingRows: 6,
      targetMultiplier: 1.2,
      aimAssist: false,
      shotsPenalty: 0
    },

    expert: {
      startingRows: 7,
      targetMultiplier: 1.4,
      aimAssist: false,
      shotsPenalty: 0
    }
  }
};

const $ = (id) => document.getElementById(id);

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

const randomInt = (max) =>
  Math.floor(Math.random() * max);

const randomColor = () =>
  CONFIG.colors[randomInt(CONFIG.colors.length)];

const formatNumber = (number) =>
  Math.max(0, Math.floor(number || 0)).toLocaleString("fr-FR");

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* ============================================================
   2. ÉTAT CENTRAL DU JEU
   ============================================================ */

const game = {
  initialized: false,
  rendererReady: false,
  running: false,
  paused: false,
  ended: false,
  busy: false,

  mode: "mission",
  difficulty: "normal",

  currentMission: 1,

  score: 0,
  bestScore: 0,
  totalScore: 0,

  combo: 0,
  bestCombo: 0,
  consecutiveHits: 0,

  bubblesPopped: 0,
  shots: 0,
  shotsRemaining: Infinity,

  targetPops: 18,
  missionStartPops: 0,

  fireballs: 3,
  bombs: 3,
  rainbows: 2,
  lightnings: 2,
  shields: 1,

  activePower: null,
  shieldActive: false,

  currentColor: CONFIG.colors[0],
  nextColor: CONFIG.colors[1],

  aimX: 0,
  aimY: 3,

  zoom: 1,
  elapsed: 0,

  tutorialStep: 0,
  confirmationAction: null,

  animationFrame: 0,
  lastFrame: 0,

  settings: {
    musicEnabled: true,
    musicVolume: 45,

    sfxEnabled: true,
    sfxVolume: 75,

    graphicsQuality: "medium",
    reducedEffects: false,
    showAimGuide: true,

    touchZoomEnabled: true,
    vibrationEnabled: true,
    leftHandedMode: false
  },

  progress: {
    completedMissions: {},
    unlockedMissions: 1,
    totalStars: 0,
    totalScore: 0,
    bestScore: 0,
    bestCombo: 0,
    bubblesPopped: 0,
    lastMission: 1
  },

  database: null
};

/* ============================================================
   3. MISSIONS : 30 OBJECTIFS DYNAMIQUES
   ============================================================ */

const MISSION_NAMES = [
  "Le premier défi",
  "Les bulles lumineuses",
  "Précision parfaite",
  "La chaîne colorée",
  "Le combo débutant",
  "La pluie de bulles",
  "L'arc-en-ciel",
  "La puissance du feu",
  "Le mur coloré",
  "Le maître débutant",

  "La stratégie bleue",
  "Le labyrinthe",
  "Les bulles suspendues",
  "Combo supérieur",
  "Les couleurs mélangées",
  "La grande explosion",
  "Le défi du temps",
  "Les bulles rebelles",
  "Précision avancée",
  "Le champion intermédiaire",

  "L'arène des experts",
  "Les six couleurs",
  "La tempête de bulles",
  "L'ultime précision",
  "La cascade brillante",
  "Maître des combos",
  "Le défi extrême",
  "La dernière frontière",
  "Le grand champion",
  "Légende FOBAS"
];

const MISSION_DESCRIPTIONS = [
  "Éclate les premières bulles et apprends à viser.",
  "Élimine les groupes de bulles colorées.",
  "Réalise des tirs précis et efficaces.",
  "Enchaîne les groupes de trois bulles ou plus.",
  "Déclenche un combo pour gagner davantage de points.",
  "Fais éclater plusieurs groupes successivement.",
  "Utilise les couleurs pour libérer l'arène.",
  "Découvre la puissance des bulles spéciales.",
  "Réduis le mur de bulles avant qu'il ne te bloque.",
  "Termine ce parcours de débutant.",
  "Élimine un nombre important de bulles.",
  "Cherche les meilleurs angles de tir.",
  "Détache les groupes suspendus.",
  "Enchaîne les réactions de groupe.",
  "Adapte ta stratégie aux couleurs présentes.",
  "Utilise les explosions au bon moment.",
  "Maintiens un rythme de tir régulier.",
  "Réduis les groupes difficiles à atteindre.",
  "Privilégie les tirs qui touchent plusieurs bulles.",
  "Montre ta maîtrise du jeu.",
  "Affronte une arène plus dense.",
  "Maîtrise toutes les couleurs.",
  "Enchaîne les éliminations.",
  "Choisis tes angles avec précision.",
  "Provoque une cascade de bulles.",
  "Construis le plus grand combo possible.",
  "Termine un défi de haut niveau.",
  "Exploite les cinq pouvoirs spéciaux.",
  "Démontre ta maîtrise de toutes les mécaniques.",
  "Deviens une légende FOBAS."
];

function getMissionDefinition(number) {
  const n = clamp(number, 1, 30);

  const tier =
    n <= 10 ? "Débutant" :
    n <= 20 ? "Intermédiaire" :
    "Avancé";

  return {
    number: n,
    title: MISSION_NAMES[n - 1],
    description: MISSION_DESCRIPTIONS[n - 1],
    tier,
    baseTarget: 12 + n * 3,
    baseRows: Math.min(7, 3 + Math.floor(n / 5)),
    baseScore: 250 + n * 120
  };
}

function getMissionTarget(number = game.currentMission) {
  const definition = getMissionDefinition(number);
  const multiplier =
    CONFIG.difficulty[game.difficulty].targetMultiplier;

  return Math.max(
    8,
    Math.ceil(definition.baseTarget * multiplier)
  );
}

/* ============================================================
   4. AUDIO : MUSIQUE D'AMBIANCE ET EFFETS SONORES
   ============================================================ */

const audio = {
  context: null,
  master: null,
  musicGain: null,
  sfxGain: null,
  musicTimer: null,
  musicStep: 0,

  init() {
    if (this.context) {
      if (this.context.state === "suspended") {
        this.context.resume().catch(() => {});
      }
      return;
    }

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    try {
      this.context = new AudioContextClass();

      this.master = this.context.createGain();
      this.musicGain = this.context.createGain();
      this.sfxGain = this.context.createGain();

      this.musicGain.connect(this.master);
      this.sfxGain.connect(this.master);
      this.master.connect(this.context.destination);

      this.applyVolumes();
    } catch (error) {
      console.warn("Audio indisponible :", error);
    }
  },

  applyVolumes() {
    if (!this.context || !this.musicGain || !this.sfxGain) {
      return;
    }

    const settings = game.settings;

    this.musicGain.gain.value =
      settings.musicEnabled
        ? settings.musicVolume / 100 * 0.25
        : 0;

    this.sfxGain.gain.value =
      settings.sfxEnabled
        ? settings.sfxVolume / 100 * 0.65
        : 0;
  },

  tone(frequency, duration = 0.12, type = "sine",
       volume = 0.25, destination = null) {
    if (!this.context) return;

    try {
      const now = this.context.currentTime;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + Math.max(0.025, duration)
      );

      oscillator.connect(gain);
      gain.connect(destination || this.sfxGain);

      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    } catch (error) {
      console.debug("Son ignoré :", error);
    }
  },

  shoot() {
    this.tone(360, 0.07, "triangle", 0.16);
  },

  pop(count = 1) {
    const frequency = 460 + Math.min(count, 12) * 35;
    this.tone(frequency, 0.12, "sine", 0.24);
  },

  combo(level) {
    this.tone(620 + level * 75, 0.20, "triangle", 0.22);
    setTimeout(() => {
      if (this.context) {
        this.tone(820 + level * 45, 0.17, "sine", 0.18);
      }
    }, 90);
  },

  power() {
    this.tone(240, 0.12, "sawtooth", 0.16);
    setTimeout(() => this.tone(520, 0.20, "triangle", 0.18), 75);
  },

  victory() {
    [523, 659, 784, 1046].forEach((frequency, index) => {
      setTimeout(() => {
        this.tone(frequency, 0.24, "triangle", 0.23);
      }, index * 135);
    });
  },

  defeat() {
    this.tone(260, 0.3, "triangle", 0.17);
    setTimeout(() => this.tone(190, 0.35, "triangle", 0.15), 170);
  },

  startMusic() {
    this.stopMusic();

    if (!game.settings.musicEnabled) return;

    const melody = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];

    this.musicTimer = setInterval(() => {
      if (!game.running || game.paused || !this.context) return;

      if (game.settings.musicEnabled) {
        this.tone(
          melody[this.musicStep % melody.length],
          0.30,
          "sine",
          0.08,
          this.musicGain
        );
      }

      this.musicStep++;
    }, 480);
  },

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
};

/* ============================================================
   5. SAUVEGARDE INDEXEDDB
   ============================================================ */

const storage = {
  async init() {
    if (!("indexedDB" in window)) return false;

    return new Promise((resolve) => {
      let request;

      try {
        request = indexedDB.open(
          CONFIG.databaseName,
          CONFIG.databaseVersion
        );
      } catch (error) {
        console.warn("IndexedDB indisponible :", error);
        resolve(false);
        return;
      }

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(CONFIG.storeName)) {
          database.createObjectStore(CONFIG.storeName, {
            keyPath: "id"
          });
        }
      };

      request.onsuccess = () => {
        game.database = request.result;
        resolve(true);
      };

      request.onerror = () => {
        console.warn("Ouverture IndexedDB impossible.");
        resolve(false);
      };
    });
  },

  async save() {
    const payload = {
      id: "main",
      savedAt: Date.now(),

      progress: game.progress,
      settings: game.settings,

      score: game.score,
      currentMission: game.currentMission,
      mode: game.mode,
      difficulty: game.difficulty,

      fireballs: game.fireballs,
      bombs: game.bombs,
      rainbows: game.rainbows,
      lightnings: game.lightnings,
      shields: game.shields
    };

    try {
      localStorage.setItem(
        "fobasBubbleBackup",
        JSON.stringify(payload)
      );
    } catch (error) {
      console.warn("Sauvegarde de secours indisponible.");
    }

    if (!game.database) return false;

    return new Promise((resolve) => {
      try {
        const transaction = game.database.transaction(
          CONFIG.storeName,
          "readwrite"
        );

        transaction.objectStore(CONFIG.storeName).put(payload);

        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => resolve(false);
        transaction.onabort = () => resolve(false);
      } catch (error) {
        resolve(false);
      }
    });
  },

  async load() {
    let data = null;

    if (game.database) {
      data = await new Promise((resolve) => {
        try {
          const transaction = game.database.transaction(
            CONFIG.storeName,
            "readonly"
          );

          const request = transaction
            .objectStore(CONFIG.storeName)
            .get("main");

          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => resolve(null);
        } catch (error) {
          resolve(null);
        }
      });
    }

    if (!data) {
      try {
        data = JSON.parse(
          localStorage.getItem("fobasBubbleBackup") || "null"
        );
      } catch (error) {
        data = null;
      }
    }

    if (!data) return false;

    if (data.progress) {
      game.progress = {
        ...game.progress,
        ...data.progress
      };
    }

    if (data.settings) {
      game.settings = {
        ...game.settings,
        ...data.settings
      };
    }

    game.bestScore = game.progress.bestScore || 0;
    game.totalScore = game.progress.totalScore || 0;

    if (Number.isFinite(data.currentMission)) {
      game.currentMission = clamp(data.currentMission, 1, 30);
    }

    if (data.mode) game.mode = data.mode;

    if (data.difficulty && CONFIG.difficulty[data.difficulty]) {
      game.difficulty = data.difficulty;
    }

    game.fireballs = Number.isFinite(data.fireballs)
      ? data.fireballs : 3;

    game.bombs = Number.isFinite(data.bombs)
      ? data.bombs : 3;

    game.rainbows = Number.isFinite(data.rainbows)
      ? data.rainbows : 2;

    game.lightnings = Number.isFinite(data.lightnings)
      ? data.lightnings : 2;

    game.shields = Number.isFinite(data.shields)
      ? data.shields : 1;

    return true;
  }
};

/* ============================================================
   6. MOTEUR THREE.JS
   ============================================================ */

const world = {
  scene: null,
  camera: null,
  renderer: null,

  root: null,
  bubbleLayer: null,
  effectLayer: null,

  shooter: null,
  shooterRing: null,
  aimLine: null,
  aimLineMaterial: null,

  currentBubbleMesh: null,
  nextBubbleMesh: null,

  bubbles: [],
  projectiles: [],
  effects: [],

  geometry: null,
  materials: new Map(),

  clock: new THREE.Clock(),

  pointerDown: false,
  activePointers: new Map(),
  pinchDistance: 0,
  pinchZoomStart: 1,

  viewportWidth: 1,
  viewportHeight: 1,

  sceneBounds: {
    left: -5.2,
    right: 5.2,
    top: 7.4,
    bottom: -7.4
  }
};

function createBubbleMaterial(color) {
  const key = String(color);

  if (world.materials.has(key)) {
    return world.materials.get(key);
  }

  const material = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.05,
    roughness: 0.16,
    transmission: 0.08,
    thickness: 0.35,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    emissive: color,
    emissiveIntensity: 0.12
  });

  world.materials.set(key, material);
  return material;
}

function createBubbleMesh(color, radius = CONFIG.bubbleRadius) {
  const geometry = new THREE.SphereGeometry(radius, 28, 20);

  const mesh = new THREE.Mesh(
    geometry,
    createBubbleMaterial(color)
  );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.userData.color = color;
  mesh.userData.radius = radius;

  return mesh;
}

function initThree() {
  const container = $("threeContainer");

  if (!container) {
    throw new Error("Élément #threeContainer introuvable.");
  }

  world.scene = new THREE.Scene();
  world.scene.background = new THREE.Color(0x071426);

  world.scene.fog = new THREE.FogExp2(0x071426, 0.018);

  world.camera = new THREE.PerspectiveCamera(
    42,
    1,
    0.1,
    100
  );

  world.camera.position.set(0, 0.1, 21);
  world.camera.lookAt(0, 0, 0);

  world.renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });

  world.renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 1.8)
  );

  world.renderer.shadowMap.enabled = true;
  world.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  world.renderer.outputColorSpace = THREE.SRGBColorSpace;
  world.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  world.renderer.toneMappingExposure = 1.12;

  world.renderer.domElement.className = "bubble-three-canvas";
  world.renderer.domElement.setAttribute(
    "aria-label",
    "Scène interactive du jeu Bubble Shooter 3D"
  );

  world.renderer.domElement.style.display = "block";
  world.renderer.domElement.style.width = "100%";
  world.renderer.domElement.style.height = "100%";
  world.renderer.domElement.style.touchAction = "none";

  container.appendChild(world.renderer.domElement);

  world.root = new THREE.Group();
  world.scene.add(world.root);

  world.bubbleLayer = new THREE.Group();
  world.effectLayer = new THREE.Group();

  world.root.add(world.bubbleLayer);
  world.root.add(world.effectLayer);

  addLighting();
  createArena();
  createShooter();
  createAimGuide();

  resizeRenderer();

  window.addEventListener("resize", resizeRenderer, {
    passive: true
  });

  world.rendererReady = true;
}

function addLighting() {
  const ambient = new THREE.HemisphereLight(
    0x9dc9ff,
    0x15213e,
    2.15
  );

  world.scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
  keyLight.position.set(-4, 8, 12);
  keyLight.castShadow = true;

  keyLight.shadow.mapSize.set(1024, 1024);
  world.scene.add(keyLight);

  const cyanLight = new THREE.PointLight(
    0x26cfff,
    32,
    18
  );

  cyanLight.position.set(-5, 2, 4);
  world.scene.add(cyanLight);

  const pinkLight = new THREE.PointLight(
    0xff387b,
    22,
    15
  );

  pinkLight.position.set(5, -1, 3);
  world.scene.add(pinkLight);
}

function createArena() {
  const floorGeometry = new THREE.PlaneGeometry(12, 18);

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b2139,
    metalness: 0.35,
    roughness: 0.4
  });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.set(0, 0, -2.4);
  world.root.add(floor);

  const grid = new THREE.GridHelper(
    18,
    28,
    0x1a759b,
    0x163752
  );

  grid.rotation.x = Math.PI / 2;
  grid.position.set(0, -0.2, -1.95);
  grid.material.transparent = true;
  grid.material.opacity = 0.25;

  world.root.add(grid);

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b4d6a,
    metalness: 0.65,
    roughness: 0.25,
    emissive: 0x073a5a,
    emissiveIntensity: 0.7
  });

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 15.2, 0.35),
    frameMaterial
  );

  leftWall.position.set(-5.55, 0, -0.7);
  world.root.add(leftWall);

  const rightWall = leftWall.clone();
  rightWall.position.x = 5.55;
  world.root.add(rightWall);

  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(11.2, 0.1, 0.35),
    frameMaterial
  );

  ceiling.position.set(0, 7.6, -0.7);
  world.root.add(ceiling);

  const starMaterial = new THREE.PointsMaterial({
    color: 0x92dfff,
    size: 0.035,
    transparent: true,
    opacity: 0.65
  });

  const starPositions = [];

  for (let i = 0; i < 180; i++) {
    starPositions.push(
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 19,
      -3.5 + Math.random() * 1.5
    );
  }

  const starGeometry = new THREE.BufferGeometry();

  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3)
  );

  world.root.add(
    new THREE.Points(starGeometry, starMaterial)
  );
}

function createShooter() {
  world.shooter = new THREE.Group();
  world.shooter.position.set(0, CONFIG.shooterY, 0.4);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.76, 0.92, 0.34, 36),
    new THREE.MeshStandardMaterial({
      color: 0x183e60,
      metalness: 0.8,
      roughness: 0.22
    })
  );

  base.rotation.x = Math.PI / 2;
  base.position.z = 0;
  world.shooter.add(base);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.69, 0.055, 12, 48),
    new THREE.MeshStandardMaterial({
      color: 0x42d9ff,
      metalness: 0.5,
      roughness: 0.2,
      emissive: 0x087ca3,
      emissiveIntensity: 1.4
    })
  );

  ring.position.z = 0.12;
  world.shooter.add(ring);

  world.shooterRing = ring;

  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.23, 0.36, 1.45, 24),
    new THREE.MeshStandardMaterial({
      color: 0x35759a,
      metalness: 0.72,
      roughness: 0.22,
      emissive: 0x073c5b,
      emissiveIntensity: 0.5
    })
  );

  barrel.position.set(0, 0.64, 0.15);
  world.shooter.add(barrel);

  const barrelLight = new THREE.PointLight(0x2fdcff, 2, 3);
  barrelLight.position.set(0, 0.8, 0.5);
  world.shooter.add(barrelLight);

  world.root.add(world.shooter);
}

function createAimGuide() {
  world.aimLineMaterial = new THREE.LineDashedMaterial({
    color: 0x83efff,
    dashSize: 0.18,
    gapSize: 0.12,
    transparent: true,
    opacity: 0.8
  });

  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(60 * 3);

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  world.aimLine = new THREE.Line(
    geometry,
    world.aimLineMaterial
  );

  world.aimLine.frustumCulled = false;

  world.root.add(world.aimLine);
}

/* ============================================================
   7. DIMENSIONS, CAMÉRA ET ZOOM
   ============================================================ */

function resizeRenderer() {
  if (!world.renderer || !world.camera) return;

  const container = $("threeContainer");
  if (!container) return;

  const width = Math.max(1, container.clientWidth);
  const height = Math.max(1, container.clientHeight);

  world.viewportWidth = width;
  world.viewportHeight = height;

  world.renderer.setSize(width, height, false);

  world.camera.aspect = width / height;
  world.camera.updateProjectionMatrix();

  updateAimGuide();
}

function applyZoom() {
  if (!world.camera) return;

  world.camera.position.z = 21 / game.zoom;
  world.camera.updateProjectionMatrix();

  updateAimGuide();
}

function changeZoom(amount) {
  game.zoom = clamp(
    game.zoom + amount,
    CONFIG.minZoom,
    CONFIG.maxZoom
  );

  applyZoom();
  audio.tone(500, 0.05, "sine", 0.08);
}

function resetZoom() {
  game.zoom = 1;
  applyZoom();
}

function pointerToWorld(clientX, clientY) {
  const canvas = world.renderer?.domElement;
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();

  const normalizedX =
    ((clientX - rect.left) / rect.width) * 2 - 1;

  const normalizedY =
    -((clientY - rect.top) / rect.height) * 2 + 1;

  const vector = new THREE.Vector3(
    normalizedX,
    normalizedY,
    0
  );

  vector.unproject(world.camera);

  const direction = vector.sub(world.camera.position).normalize();

  const distance =
    (0 - world.camera.position.z) / direction.z;

  const point = world.camera.position
    .clone()
    .add(direction.multiplyScalar(distance));

  return {
    x: clamp(point.x, -5.05, 5.05),
    y: clamp(point.y, -5.8, 7.1)
  };
}

/* ============================================================
   8. GRILLE ET GÉNÉRATION DES BULLES
   ============================================================ */

function gridToPosition(row, col) {
  const spacingX = CONFIG.horizontalSpacing;
  const spacingY = CONFIG.verticalSpacing;

  const offset = row % 2 === 1 ? spacingX / 2 : 0;

  return {
    x:
      (col - (CONFIG.columns - 1) / 2) * spacingX
      + offset,

    y: 6.75 - row * spacingY
  };
}

function positionToGrid(x, y) {
  let best = null;
  let bestDistance = Infinity;

  for (let row = 0; row < CONFIG.rows + 2; row++) {
    for (let col = 0; col < CONFIG.columns; col++) {
      const position = gridToPosition(row, col);

      const distance = Math.hypot(
        x - position.x,
        y - position.y
      );

      if (distance < bestDistance) {
        bestDistance = distance;
        best = { row, col, ...position };
      }
    }
  }

  return best;
}

function getBubbleAt(row, col) {
  return world.bubbles.find(
    (bubble) =>
      bubble.row === row &&
      bubble.col === col &&
      !bubble.removed
  );
}

function createGridBubble(row, col, color) {
  const existing = getBubbleAt(row, col);

  if (existing) return existing;

  const position = gridToPosition(row, col);
  const mesh = createBubbleMesh(color);

  mesh.position.set(position.x, position.y, 0);

  mesh.userData.row = row;
  mesh.userData.col = col;
  mesh.userData.removed = false;

  world.bubbleLayer.add(mesh);

  const bubble = {
    row,
    col,
    color,
    mesh,
    removed: false
  };

  world.bubbles.push(bubble);

  return bubble;
}

function removeBubble(bubble, makeEffect = true) {
  if (!bubble || bubble.removed) return;

  bubble.removed = true;

  world.bubbleLayer.remove(bubble.mesh);

  bubble.mesh.geometry.dispose();

  if (makeEffect && !game.settings.reducedEffects) {
    createPopEffect(
      bubble.mesh.position.clone(),
      bubble.color
    );
  }

  world.bubbles = world.bubbles.filter(
    (item) => item !== bubble
  );
}

function clearBoard() {
  for (const bubble of [...world.bubbles]) {
    removeBubble(bubble, false);
  }

  world.bubbles = [];
}

function generateBoard(rows) {
  clearBoard();

  const activeRows = clamp(rows, 2, CONFIG.rows);

  for (let row = 0; row < activeRows; row++) {
    for (let col = 0; col < CONFIG.columns; col++) {
      // Des espaces occasionnels rendent la grille moins uniforme.
      if (row > 1 && Math.random() < 0.055) continue;

      createGridBubble(row, col, randomColor());
    }
  }
}

function chooseColorFromBoard() {
  if (world.bubbles.length === 0) return randomColor();

  const counts = new Map();

  for (const bubble of world.bubbles) {
    counts.set(
      bubble.color,
      (counts.get(bubble.color) || 0) + 1
    );
  }

  const colors = [...counts.keys()];

  if (colors.length === 0) return randomColor();

  return colors[randomInt(colors.length)];
}

/* ============================================================
   9. BULLES DU LANCEUR
   ============================================================ */

function setCurrentBubble(color) {
  game.currentColor = color;

  if (world.currentBubbleMesh) {
    world.shooter.remove(world.currentBubbleMesh);
    world.currentBubbleMesh.geometry.dispose();
  }

  world.currentBubbleMesh = createBubbleMesh(
    color,
    CONFIG.bubbleRadius * 0.84
  );

  world.currentBubbleMesh.position.set(0, 0.95, 0.8);

  world.shooter.add(world.currentBubbleMesh);

  const preview = $("nextBubbleColor");

  if (preview) {
    preview.style.background =
      `radial-gradient(circle at 30% 25%, #ffffff, ${new THREE.Color(color).getStyle()} 45%, #10243d)`;
  }

  updateShooterUI();
}

function setNextBubble(color) {
  game.nextColor = color;

  const preview = $("nextBubbleColor");

  if (preview) {
    const cssColor = new THREE.Color(color).getStyle();

    preview.style.background =
      `radial-gradient(circle at 30% 25%, #ffffff, ${cssColor} 45%, #10243d)`;
  }
}

function prepareNextShot() {
  setCurrentBubble(game.nextColor);
  setNextBubble(chooseColorFromBoard());
}

/* ============================================================
   10. VISÉE ET TRAJECTOIRE
   ============================================================ */

function updateAimGuide() {
  if (!world.aimLine || !world.aimLine.geometry) return;

  const positions = world.aimLine.geometry.attributes.position.array;

  const startX = world.shooter?.position.x || 0;
  const startY = CONFIG.shooterY + 1.25;

  const direction = new THREE.Vector2(
    game.aimX - startX,
    game.aimY - startY
  );

  if (direction.lengthSq() < 0.001) {
    direction.set(0, 1);
  }

  direction.normalize();

  const pointCount = 60;
  const step = 0.16;

  for (let i = 0; i < pointCount; i++) {
    const index = i * 3;

    positions[index] = startX + direction.x * i * step;
    positions[index + 1] = startY + direction.y * i * step;
    positions[index + 2] = 0.12;
  }

  world.aimLine.geometry.attributes.position.needsUpdate = true;
  world.aimLine.computeLineDistances();

  world.aimLine.visible =
    game.settings.showAimGuide &&
    game.running &&
    !game.paused &&
    !game.ended;
}

function setAim(clientX, clientY) {
  const point = pointerToWorld(clientX, clientY);

  const shooterY = CONFIG.shooterY + 1.25;

  game.aimX = point.x;
  game.aimY = Math.max(shooterY + 0.25, point.y);

  const angle = Math.atan2(
    game.aimY - shooterY,
    game.aimX
  );

  if (world.shooter) {
    world.shooter.rotation.z = -angle + Math.PI / 2;
  }

  updateAimGuide();

  const hint = $("aimHint");

  if (hint && game.settings.showAimGuide) {
    hint.textContent = "Vise puis touche TIRER";
  }
}

/* ============================================================
   11. TIR ET COLLISIONS
   ============================================================ */

function canShoot() {
  return (
    game.running &&
    !game.paused &&
    !game.ended &&
    !game.busy
  );
}

function shoot() {
  if (!canShoot()) {
    if (game.paused) showToast("Reprends la partie pour tirer.");
    else if (!game.running) showToast("Lance une partie d'abord.");
    return;
  }

  audio.init();
  audio.shoot();

  game.shots++;

  const origin = new THREE.Vector3(
    0,
    CONFIG.shooterY + 1.28,
    0.55
  );

  const target = new THREE.Vector3(
    game.aimX,
    game.aimY,
    0.25
  );

  const direction = target.sub(origin).normalize();

  const projectile = createBubbleMesh(
    game.activePower === "rainbow"
      ? 0xffffff
      : game.currentColor,
    CONFIG.bubbleRadius * 0.84
  );

  projectile.position.copy(origin);
  world.bubbleLayer.add(projectile);

  world.projectiles.push({
    mesh: projectile,
    color: game.currentColor,
    power: game.activePower,
    direction,
    speed: CONFIG.projectileSpeed,
    age: 0
  });

  game.activePower = null;

  updatePowerButtons();
  updateShooterUI();
}

/* Vérifie si la bulle en vol touche une bulle ou un bord. */
function projectileHasCollision(projectile) {
  const position = projectile.mesh.position;
  const radius = CONFIG.bubbleRadius * 1.75;

  if (
    position.x < -5.05 ||
    position.x > 5.05 ||
    position.y > 7.05
  ) {
    return true;
  }

  for (const bubble of world.bubbles) {
    if (bubble.removed) continue;

    const distance = position.distanceTo(bubble.mesh.position);

    if (distance < radius) return true;
  }

  return false;
}

function updateProjectiles(delta) {
  for (const projectile of [...world.projectiles]) {
    projectile.age += delta;

    projectile.mesh.position.addScaledVector(
      projectile.direction,
      projectile.speed * delta
    );

    projectile.mesh.rotation.x += delta * 2;
    projectile.mesh.rotation.y += delta * 1.5;

    if (
      projectileHasCollision(projectile) ||
      projectile.age > 3
    ) {
      attachProjectile(projectile);
    }
  }
}

function attachProjectile(projectile) {
  if (!world.projectiles.includes(projectile)) return;

  world.projectiles = world.projectiles.filter(
    (item) => item !== projectile
  );

  const position = projectile.mesh.position.clone();
  const power = projectile.power;
  const color = projectile.color;

  world.bubbleLayer.remove(projectile.mesh);
  projectile.mesh.geometry.dispose();

  if (power === "fireball") {
    activateFireballAt(position);
    prepareNextShot();
    return;
  }

  if (power === "bomb") {
    activateBombAt(position);
    prepareNextShot();
    return;
  }

  if (power === "lightning") {
    activateLightningAt(position);
    prepareNextShot();
    return;
  }

  const slot = findNearestFreeSlot(position.x, position.y);

  if (!slot) {
    // Si la grille est pleine, retire une bulle du bas pour libérer de la place.
    const lowest = [...world.bubbles].sort(
      (a, b) => a.row - b.row
    )[0];

    if (lowest) removeBubble(lowest, true);

    prepareNextShot();
    return;
  }

  createGridBubble(
    slot.row,
    slot.col,
    power === "rainbow"
      ? chooseColorFromBoard()
      : color
  );

  resolveClusters(slot.row, slot.col);
  prepareNextShot();
}

function findNearestFreeSlot(x, y) {
  let best = null;
  let bestDistance = Infinity;

  const rowsToSearch = CONFIG.rows + 2;

  for (let row = 0; row < rowsToSearch; row++) {
    for (let col = 0; col < CONFIG.columns; col++) {
      if (getBubbleAt(row, col)) continue;

      const position = gridToPosition(row, col);

      if (position.y < -5.6) continue;

      const distance = Math.hypot(
        x - position.x,
        y - position.y
      );

      if (distance < bestDistance) {
        bestDistance = distance;
        best = { row, col };
      }
    }
  }

  return best;
}

/* ============================================================
   12. VOISINS, GROUPES ET GRAVITÉ
   ============================================================ */

function getNeighbors(row, col) {
  const odd = row % 2 === 1;

  const offsets = odd
    ? [
        [0, -1], [0, 1],
        [-1, 0], [-1, 1],
        [1, 0], [1, 1]
      ]
    : [
        [0, -1], [0, 1],
        [-1, -1], [-1, 0],
        [1, -1], [1, 0]
      ];

  return offsets
    .map(([dr, dc]) => ({
      row: row + dr,
      col: col + dc
    }))
    .filter(
      (point) =>
        point.row >= 0 &&
        point.row < CONFIG.rows + 2 &&
        point.col >= 0 &&
        point.col < CONFIG.columns
    );
}

function findSameColorCluster(startRow, startCol) {
  const start = getBubbleAt(startRow, startCol);

  if (!start) return [];

  const queue = [start];
  const visited = new Set([`${start.row}:${start.col}`]);
  const cluster = [];

  while (queue.length) {
    const bubble = queue.shift();

    cluster.push(bubble);

    for (const neighborPosition of getNeighbors(
      bubble.row,
      bubble.col
    )) {
      const key =
        `${neighborPosition.row}:${neighborPosition.col}`;

      if (visited.has(key)) continue;

      const neighbor = getBubbleAt(
        neighborPosition.row,
        neighborPosition.col
      );

      if (neighbor && neighbor.color === start.color) {
        visited.add(key);
        queue.push(neighbor);
      }
    }
  }

  return cluster;
}

function findConnectedToCeiling() {
  const queue = world.bubbles.filter(
    (bubble) => bubble.row === 0
  );

  const visited = new Set(
    queue.map((bubble) => `${bubble.row}:${bubble.col}`)
  );

  while (queue.length) {
    const bubble = queue.shift();

    for (const position of getNeighbors(
      bubble.row,
      bubble.col
    )) {
      const key = `${position.row}:${position.col}`;

      if (visited.has(key)) continue;

      const neighbor = getBubbleAt(
        position.row,
        position.col
      );

      if (neighbor) {
        visited.add(key);
        queue.push(neighbor);
      }
    }
  }

  return visited;
}

function removeFloatingBubbles() {
  const connected = findConnectedToCeiling();

  const floating = world.bubbles.filter(
    (bubble) =>
      !connected.has(`${bubble.row}:${bubble.col}`)
  );

  if (floating.length > 0) {
    floating.forEach((bubble) => removeBubble(bubble, true));

    game.score += floating.length * 20;
    game.bubblesPopped += floating.length;

    showAnnouncement(
      `CASCADE ! +${floating.length * 20}`,
      "combo"
    );

    audio.pop(floating.length);
  }

  return floating.length;
}

function resolveClusters(row, col) {
  const cluster = findSameColorCluster(row, col);

  if (cluster.length >= CONFIG.minCluster) {
    const amount = cluster.length;

    cluster.forEach((bubble) => removeBubble(bubble, true));

    game.combo++;
    game.consecutiveHits++;

    const comboMultiplier = Math.min(5, 1 + game.combo * 0.25);

    const gained = Math.round(amount * 50 * comboMultiplier);

    game.score += gained;
    game.bubblesPopped += amount;

    if (game.combo > game.bestCombo) {
      game.bestCombo = game.combo;
    }

    if (game.combo >= 2) {
      audio.combo(game.combo);

      showAnnouncement(
        `COMBO x${game.combo}  +${formatNumber(gained)}`,
        "combo"
      );
    } else {
      audio.pop(amount);
      showAnnouncement(
        `+${formatNumber(gained)}`,
        "normal"
      );
    }

    removeFloatingBubbles();
    updateProgress();
    updateHUD();
    saveSoon();

    checkMissionProgress();
  } else {
    game.combo = 0;
  }

  updateShooterUI();
  checkBoardState();
}

function checkBoardState() {
  if (!game.running || game.ended) return;

  if (world.bubbles.length === 0) {
    game.score += 500;
    completeMission();
    return;
  }

  const lowest = Math.min(
    ...world.bubbles.map((bubble) => bubble.mesh.position.y)
  );

  if (lowest < -5.7) {
    if (game.shieldActive) {
      game.shieldActive = false;

      for (const bubble of world.bubbles) {
        bubble.mesh.position.y += 0.7;
        bubble.row = Math.max(0, bubble.row - 1);
      }

      showToast("Bouclier activé : l'arène est protégée.");
      return;
    }

    // Ne provoque pas une défaite injuste dans les premiers niveaux.
    if (game.currentMission >= 21) {
      defeatMission();
    } else {
      for (const bubble of [...world.bubbles]) {
        if (bubble.mesh.position.y < -5.7) {
          removeBubble(bubble, false);
        }
      }
    }
  }
}

/* ============================================================
   13. POUVOIRS SPÉCIAUX
   ============================================================ */

function usePower(power) {
  if (!canShoot()) {
    showToast("Le pouvoir sera disponible pendant une partie.");
    return;
  }

  const inventory = {
    fireball: "fireballs",
    bomb: "bombs",
    rainbow: "rainbows",
    lightning: "lightnings",
    shield: "shields"
  };

  const property = inventory[power];

  if (!property || game[property] <= 0) {
    showToast("Tu n'as plus de charge pour ce pouvoir.");
    return;
  }

  if (power === "shield") {
    game[property]--;
    game.shieldActive = true;

    audio.power();
    showToast("Bouclier activé !");
    updatePowerButtons();
    saveSoon();
    return;
  }

  game[property]--;

  game.activePower = power;

  if (power === "rainbow") {
    setCurrentBubble(0xffffff);
    showToast("Arc-en-ciel : la prochaine bulle s'adapte à la grille.");
  } else if (power === "fireball") {
    setCurrentBubble(0xff4b17);
    showToast("Boule de feu prête : vise puis tire.");
  } else if (power === "bomb") {
    setCurrentBubble(0x262d3e);
    showToast("Bombe prête : vise puis tire.");
  } else if (power === "lightning") {
    setCurrentBubble(0xe5fbff);
    showToast("Éclair prêt : vise puis tire.");
  }

  audio.power();
  updatePowerButtons();
  updateShooterUI();
  saveSoon();
}

function activateFireballAt(position) {
  const affected = world.bubbles.filter(
    (bubble) =>
      bubble.mesh.position.distanceTo(position) < 2.35
  );

  const amount = affected.length;

  affected.forEach((bubble) => removeBubble(bubble, true));

  game.score += amount * 75;
  game.bubblesPopped += amount;

  showAnnouncement(`FEU ! +${amount * 75}`, "combo");

  audio.power();
  audio.pop(amount);

  updateProgress();
  updateHUD();
  checkMissionProgress();
  checkBoardState();
}

function activateBombAt(position) {
  const affected = world.bubbles.filter(
    (bubble) =>
      bubble.mesh.position.distanceTo(position) < 2.0
  );

  const amount = affected.length;

  affected.forEach((bubble) => removeBubble(bubble, true));

  game.score += amount * 100;
  game.bubblesPopped += amount;

  showAnnouncement(`BOUM ! +${amount * 100}`, "combo");

  createShockwave(position, 0xffb347);

  audio.power();
  audio.pop(amount);

  updateProgress();
  updateHUD();
  checkMissionProgress();
  checkBoardState();
}

function activateLightningAt(position) {
  const ordered = [...world.bubbles].sort(
    (a, b) =>
      a.mesh.position.distanceTo(position) -
      b.mesh.position.distanceTo(position)
  );

  const affected = ordered.slice(0, 7);
  const amount = affected.length;

  affected.forEach((bubble) => removeBubble(bubble, true));

  game.score += amount * 90;
  game.bubblesPopped += amount;

  showAnnouncement(`ÉCLAIR ! +${amount * 90}`, "combo");

  createShockwave(position, 0x88f7ff);

  audio.power();
  audio.pop(amount);

  updateProgress();
  updateHUD();
  checkMissionProgress();
  checkBoardState();
}

/* ============================================================
   14. EFFETS 3D
   ============================================================ */

function createPopEffect(position, color) {
  const particleCount = game.settings.graphicsQuality === "low"
    ? 4
    : game.settings.graphicsQuality === "ultra"
      ? 13
      : 8;

  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.95
  });

  for (let i = 0; i < particleCount; i++) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.045 + Math.random() * 0.055, 8, 6),
      material.clone()
    );

    mesh.position.copy(position);

    world.effectLayer.add(mesh);

    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4,
      Math.random() * 2
    );

    world.effects.push({
      mesh,
      velocity,
      age: 0,
      life: 0.35 + Math.random() * 0.35,
      kind: "particle"
    });
  }
}

function createShockwave(position, color) {
  const geometry = new THREE.TorusGeometry(0.35, 0.035, 8, 48);

  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.9
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.position.z += 0.2;

  world.effectLayer.add(mesh);

  world.effects.push({
    mesh,
    age: 0,
    life: 0.6,
    kind: "shockwave"
  });
}

function updateEffects(delta) {
  for (const effect of [...world.effects]) {
    effect.age += delta;

    if (effect.kind === "particle") {
      effect.mesh.position.addScaledVector(
        effect.velocity,
        delta
      );

      effect.velocity.multiplyScalar(0.96);

      const opacity = Math.max(
        0,
        1 - effect.age / effect.life
      );

      effect.mesh.material.opacity = opacity;
      effect.mesh.scale.setScalar(
        Math.max(0.01, 1 - effect.age / effect.life)
      );
    }

    if (effect.kind === "shockwave") {
      const scale = 1 + effect.age * 8;

      effect.mesh.scale.setScalar(scale);
      effect.mesh.material.opacity =
        Math.max(0, 1 - effect.age / effect.life);
    }

    if (effect.age >= effect.life) {
      world.effectLayer.remove(effect.mesh);

      if (effect.mesh.geometry) {
        effect.mesh.geometry.dispose();
      }

      if (Array.isArray(effect.mesh.material)) {
        effect.mesh.material.forEach((material) => material.dispose());
      } else if (effect.mesh.material) {
        effect.mesh.material.dispose();
      }

      world.effects = world.effects.filter(
        (item) => item !== effect
      );
    }
  }
}

/* ============================================================
   15. MISSIONS : LANCEMENT, VICTOIRE ET DÉFAITE
   ============================================================ */

function startMission(number = game.currentMission, mode = "mission") {
  game.currentMission = clamp(number, 1, 30);
  game.mode = mode;

  game.difficulty = $("missionDifficulty")?.value
    || game.difficulty
    || "normal";

  game.score = 0;
  game.combo = 0;
  game.bestCombo = 0;
  game.consecutiveHits = 0;

  game.shots = 0;
  game.bubblesPopped = 0;

  game.targetPops = mode === "relax"
    ? Infinity
    : mode === "classic"
      ? Infinity
      : getMissionTarget(game.currentMission);

  game.missionStartPops = game.progress.bubblesPopped || 0;

  game.ended = false;
  game.paused = false;
  game.running = true;
  game.busy = false;

  game.activePower = null;
  game.shieldActive = false;

  game.fireballs = 3;
  game.bombs = 3;
  game.rainbows = 2;
  game.lightnings = 2;
  game.shields = 1;

  game.currentColor = randomColor();
  game.nextColor = chooseColorFromBoard();

  const definition = getMissionDefinition(game.currentMission);
  const difficultyRows =
    CONFIG.difficulty[game.difficulty].startingRows;

  const rows = mode === "relax"
    ? 3
    : Math.min(
        8,
        Math.max(
          definition.baseRows,
          difficultyRows
        )
      );

  generateBoard(rows);

  setCurrentBubble(chooseColorFromBoard());
  setNextBubble(chooseColorFromBoard());

  showScreen("game");

  hideOverlay("pauseOverlay");
  hideOverlay("victoryOverlay");
  hideOverlay("defeatOverlay");
  hideOverlay("tutorialOverlay");

  const hud = $("gameHud");
  if (hud) hud.hidden = false;

  const objective = $("missionObjective");
  if (objective) objective.hidden = false;

  const viewport = $("gameViewport");
  if (viewport) viewport.hidden = false;

  const panel = $("shooterPanel");
  if (panel) panel.hidden = false;

  updateMissionUI();
  updateHUD();
  updatePowerButtons();
  updateProgress();
  updateShooterUI();

  const loading = $("loadingScreen");
  if (loading) loading.hidden = true;

  const ranise = $("raniseAssistant");
  if (ranise) ranise.hidden = false;

  setRaniseMessage(
    `Mission ${String(game.currentMission).padStart(2, "0")} : ${definition.description}`
  );

  audio.init();
  audio.startMusic();

  showToast(`Mission ${game.currentMission} lancée !`);
  updateAimGuide();

  saveSoon();
}

function checkMissionProgress() {
  if (!game.running || game.ended) return;

  if (
    game.mode === "mission" &&
    game.bubblesPopped >= game.targetPops
  ) {
    completeMission();
  }
}

function completeMission() {
  if (game.ended) return;

  game.ended = true;
  game.running = false;
  game.paused = false;
  game.busy = false;

  audio.stopMusic();
  audio.victory();

  const stars = calculateStars();

  const key = String(game.currentMission);
  const previous = game.progress.completedMissions[key] || 0;

  if (stars > previous) {
    game.progress.completedMissions[key] = stars;
  }

  game.progress.unlockedMissions = Math.max(
    game.progress.unlockedMissions,
    Math.min(30, game.currentMission + 1)
  );

  game.progress.totalStars = Object.values(
    game.progress.completedMissions
  ).reduce((sum, value) => sum + value, 0);

  game.progress.totalScore += game.score;
  game.progress.bestScore = Math.max(
    game.progress.bestScore,
    game.score
  );

  game.progress.bestCombo = Math.max(
    game.progress.bestCombo,
    game.bestCombo
  );

  game.progress.bubblesPopped += game.bubblesPopped;

  game.bestScore = game.progress.bestScore;
  game.totalScore = game.progress.totalScore;

  const message = $("victoryMessage");

  if (message) {
    message.textContent =
      `Mission ${game.currentMission} terminée ! ` +
      `Tu as gagné ${stars} étoile(s) et marqué ` +
      `${formatNumber(game.score)} points.`;
  }

  setText("victoryScore", formatNumber(game.score));
  setText("victoryCombo", `x${game.bestCombo}`);
  setText("victoryStars", "★".repeat(stars) + "☆".repeat(3 - stars));

  const nextButton = $("nextMissionButton");

  if (nextButton) {
    nextButton.textContent =
      game.currentMission >= 30
        ? "Rejouer la légende ↻"
        : "Mission suivante →";
  }

  showOverlay("victoryOverlay");

  updateMenuStats();
  updateStatistics();
  updateMissionGrid();
  saveSoon();
}

function calculateStars() {
  if (game.score >= 1800) return 3;
  if (game.score >= 850) return 2;
  return 1;
}

function defeatMission() {
  if (game.ended) return;

  game.ended = true;
  game.running = false;
  game.paused = false;

  audio.stopMusic();
  audio.defeat();

  setText(
    "defeatMessage",
    "L'arène est devenue trop difficile. Change de stratégie et réessaie."
  );

  showOverlay("defeatOverlay");
  saveSoon();
}

/* ============================================================
   16. PAUSE ET REPRISE
   ============================================================ */

function pauseGame() {
  if (!game.running || game.ended) return;

  game.paused = true;
  audio.stopMusic();

  showOverlay("pauseOverlay");
  updateAimGuide();
}

function resumeGame() {
  if (!game.running || game.ended) return;

  game.paused = false;

  hideOverlay("pauseOverlay");

  audio.init();
  audio.startMusic();

  updateAimGuide();
}

function restartCurrentMission() {
  startMission(game.currentMission, game.mode);
}

function returnToMenu() {
  game.running = false;
  game.paused = false;
  game.ended = false;
  game.busy = false;

  audio.stopMusic();

  hideAllOverlays();
  showScreen("menu");

  updateMenuStats();
  updateAimGuide();
  saveSoon();
}

/* ============================================================
   17. NAVIGATION ENTRE LES ÉCRANS
   ============================================================ */

const screenIds = [
  "mainMenuScreen",
  "modeSelectScreen",
  "missionSelectScreen",
  "settingsScreen",
  "statisticsScreen"
];

function showScreen(name) {
  const map = {
    menu: "mainMenuScreen",
    modes: "modeSelectScreen",
    missions: "missionSelectScreen",
    settings: "settingsScreen",
    statistics: "statisticsScreen"
  };

  for (const id of screenIds) {
    const element = $(id);
    if (element) element.hidden = true;
  }

  if (name === "game") {
    const main = $("gameMain");
    if (main) main.hidden = false;

    const menu = $("mainMenuScreen");
    if (menu) menu.hidden = true;

    const hud = $("gameHud");
    if (hud) hud.hidden = false;

    const objective = $("missionObjective");
    if (objective) objective.hidden = false;

    const viewport = $("gameViewport");
    if (viewport) viewport.hidden = false;

    const shooter = $("shooterPanel");
    if (shooter) shooter.hidden = false;

    return;
  }

  const gameMain = $("gameMain");
  if (gameMain) gameMain.hidden = true;

  const hud = $("gameHud");
  if (hud) hud.hidden = true;

  const objective = $("missionObjective");
  if (objective) objective.hidden = true;

  const screenId = map[name];
  if (screenId && $(screenId)) {
    $(screenId).hidden = false;
  }
}

function openModes() {
  showScreen("modes");
}

function openMissions() {
  updateMissionGrid();
  showScreen("missions");
}

function openSettings() {
  syncSettingsToForm();
  showScreen("settings");
}

function openStatistics() {
  updateStatistics();
  showScreen("statistics");
}

/* ============================================================
   18. INTERFACE : HUD ET OBJECTIFS
   ============================================================ */

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = String(value);
}

function updateHUD() {
  setText("hudMission", `${String(game.currentMission).padStart(2, "0")} / 30`);
  setText("scoreValue", formatNumber(game.score));
  setText("bestScoreValue", formatNumber(game.bestScore));
  setText("comboValue", `x${game.combo}`);

  updateProgress();
}

function updateMissionUI() {
  const definition = getMissionDefinition(game.currentMission);

  setText("missionTitle", definition.title);
  setText("missionDescription", definition.description);

  setText(
    "hudMission",
    `${String(game.currentMission).padStart(2, "0")} / 30`
  );

  updateProgress();
}

function updateProgress() {
  const target = game.targetPops;
  const progress = Number.isFinite(target)
    ? clamp(game.bubblesPopped / Math.max(1, target), 0, 1)
    : clamp(game.bubblesPopped / 100, 0, 1);

  const percent = Math.round(progress * 100);

  const bar = $("objectiveProgressBar");
  if (bar) bar.style.width = `${percent}%`;

  setText(
    "objectiveProgressText",
    Number.isFinite(target)
      ? `${Math.min(game.bubblesPopped, target)} / ${target}`
      : `${game.bubblesPopped} bulles`
  );

  const powerPercent = clamp(
    100 - Math.min(100, game.shots * 1.5),
    10,
    100
  );

  const powerBar = $("powerBar");
  if (powerBar) powerBar.style.width = `${powerPercent}%`;

  setText("powerValue", `${Math.round(powerPercent)}%`);
}

function updateShooterUI() {
  setText("shotsRemaining", "∞");

  const preview = $("nextBubbleColor");

  if (preview) {
    preview.style.backgroundColor =
      new THREE.Color(game.nextColor).getStyle();
  }

  const powerPercent = clamp(
    100 - game.shots * 1.5,
    10,
    100
  );

  const powerBar = $("powerBar");
  if (powerBar) powerBar.style.width = `${powerPercent}%`;

  setText("powerValue", `${Math.round(powerPercent)}%`);
}

function updatePowerButtons() {
  setText("fireballCount", game.fireballs);
  setText("bombCount", game.bombs);
  setText("rainbowCount", game.rainbows);
  setText("lightningCount", game.lightnings);
  setText("shieldCount", game.shields);

  const buttons = [
    ["fireballButton", game.fireballs],
    ["bombButton", game.bombs],
    ["rainbowButton", game.rainbows],
    ["lightningButton", game.lightnings],
    ["shieldButton", game.shields]
  ];

  for (const [id, count] of buttons) {
    const button = $(id);

    if (button) {
      button.disabled = count <= 0 || !game.running || game.paused;
      button.classList.toggle(
        "powerup-active",
        game.activePower === id.replace("Button", "")
      );
    }
  }
}

/* ============================================================
   19. ANNONCES ET GUIDE RANISE
   ============================================================ */

let announcementTimer = null;
let toastTimer = null;

function showAnnouncement(message, type = "normal") {
  const element = $(
    type === "combo"
      ? "comboAnnouncement"
      : "gameAnnouncement"
  );

  if (!element) return;

  element.textContent = message;
  element.classList.remove("announcement-pop");
  element.classList.toggle("is-combo", type === "combo");

  // Force une réinitialisation de l'animation CSS.
  void element.offsetWidth;

  element.classList.add("announcement-pop");

  clearTimeout(announcementTimer);

  announcementTimer = setTimeout(() => {
    element.classList.remove("announcement-pop");
  }, 1250);
}

function setRaniseMessage(message) {
  setText("raniseMessage", message);
}

function showToast(message) {
  const region = $("toastRegion");
  if (!region) return;

  region.textContent = message;
  region.classList.add("toast-visible");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    region.classList.remove("toast-visible");
  }, 2600);
}

/* ============================================================
   20. SÉLECTION DES MISSIONS
   ============================================================ */

function createMissionButton(number) {
  const definition = getMissionDefinition(number);
  const completed =
    game.progress.completedMissions[String(number)] || 0;

  const unlocked =
    number <= game.progress.unlockedMissions;

  const button = document.createElement("button");

  button.type = "button";
  button.className = "mission-card";

  if (!unlocked) button.classList.add("mission-locked");
  if (completed > 0) button.classList.add("mission-completed");

  button.setAttribute(
    "aria-label",
    unlocked
      ? `Mission ${number} : ${definition.title}`
      : `Mission ${number} verrouillée`
  );

  button.innerHTML = `
    <span class="mission-number">
      ${String(number).padStart(2, "0")}
    </span>
    <strong class="mission-card-title"></strong>
    <span class="mission-stars"></span>
    <span class="mission-lock"></span>
  `;

  button.querySelector(".mission-card-title").textContent =
    definition.title;

  button.querySelector(".mission-stars").textContent =
    "★".repeat(completed) + "☆".repeat(3 - completed);

  button.querySelector(".mission-lock").textContent =
    unlocked ? "" : "🔒";

  button.disabled = !unlocked;

  button.addEventListener("click", () => {
    if (!unlocked) {
      showToast("Termine les missions précédentes pour débloquer celle-ci.");
      return;
    }

    startMission(number, "mission");
  });

  return button;
}

function updateMissionGrid() {
  const groups = [
    ["beginnerMissionGrid", 1, 10],
    ["intermediateMissionGrid", 11, 20],
    ["advancedMissionGrid", 21, 30]
  ];

  for (const [id, start, end] of groups) {
    const grid = $(id);
    if (!grid) continue;

    grid.replaceChildren();

    for (let number = start; number <= end; number++) {
      grid.appendChild(createMissionButton(number));
    }
  }

  const completed = Object.keys(
    game.progress.completedMissions
  ).filter(
    (key) => game.progress.completedMissions[key] > 0
  ).length;

  setText("missionCompletedCount", completed);
  setText("missionUnlockedCount", game.progress.unlockedMissions);
  setText("missionStarsCount", `${game.progress.totalStars} / 90`);

  const difficulty = $("missionDifficulty");

  if (difficulty) {
    difficulty.value = game.difficulty;
  }
}

function updateMenuStats() {
  const completed = Object.keys(
    game.progress.completedMissions
  ).filter(
    (key) => game.progress.completedMissions[key] > 0
  ).length;

  setText("menuCompletedMissions", `${completed} / 30`);
  setText("menuTotalScore", formatNumber(game.progress.totalScore));
  setText("menuTotalStars", `${game.progress.totalStars} / 90`);
}

/* ============================================================
   21. STATISTIQUES
   ============================================================ */

function updateStatistics() {
  const completed = Object.keys(
    game.progress.completedMissions
  ).filter(
    (key) => game.progress.completedMissions[key] > 0
  ).length;

  setText(
    "statsTotalScore",
    formatNumber(game.progress.totalScore)
  );

  setText(
    "statsBestScore",
    formatNumber(game.progress.bestScore)
  );

  setText("statsCompletedMissions", `${completed} / 30`);

  setText(
    "statsStars",
    `${game.progress.totalStars} / 90`
  );

  setText(
    "statsBestCombo",
    `x${game.progress.bestCombo}`
  );

  setText(
    "statsBubblesPopped",
    formatNumber(game.progress.bubblesPopped)
  );
}

function exportProgress() {
  const data = {
    application: CONFIG.appName,
    exportedAt: new Date().toISOString(),
    progress: game.progress,
    settings: game.settings
  };

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "fobas-bubble-progress.json";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  showToast("Export de progression préparé.");
}

/* ============================================================
   22. PARAMÈTRES
   ============================================================ */

function syncSettingsToForm() {
  for (const [key, value] of Object.entries(game.settings)) {
    const input = $(key);

    if (input) {
      if (input.type === "checkbox") {
        input.checked = Boolean(value);
      } else {
        input.value = value;
      }
    }
  }

  setText(
    "musicVolumeOutput",
    `${game.settings.musicVolume}%`
  );

  setText(
    "sfxVolumeOutput",
    `${game.settings.sfxVolume}%`
  );
}

function readSettingsFromForm() {
  const ids = [
    "musicEnabled",
    "musicVolume",
    "sfxEnabled",
    "sfxVolume",
    "graphicsQuality",
    "reducedEffects",
    "showAimGuide",
    "touchZoomEnabled",
    "vibrationEnabled",
    "leftHandedMode"
  ];

  for (const id of ids) {
    const input = $(id);
    if (!input) continue;

    if (input.type === "checkbox") {
      game.settings[id] = input.checked;
    } else if (input.type === "range" || input.type === "number") {
      game.settings[id] = Number(input.value);
    } else {
      game.settings[id] = input.value;
    }
  }

  game.settings.musicVolume = clamp(
    game.settings.musicVolume,
    0,
    100
  );

  game.settings.sfxVolume = clamp(
    game.settings.sfxVolume,
    0,
    100
  );

  if (world.renderer) {
    const pixelRatio =
      game.settings.graphicsQuality === "low" ? 1 :
      game.settings.graphicsQuality === "medium" ? 1.35 :
      game.settings.graphicsQuality === "high" ? 1.7 :
      2;

    world.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, pixelRatio)
    );

    world.renderer.shadowMap.enabled =
      game.settings.graphicsQuality !== "low";
  }

  if (world.aimLine) {
    world.aimLine.visible = game.settings.showAimGuide;
  }

  audio.applyVolumes();

  if (game.settings.musicEnabled && game.running && !game.paused) {
    audio.startMusic();
  } else if (!game.settings.musicEnabled) {
    audio.stopMusic();
  }

  syncSettingsToForm();
  updateAimGuide();
}

function resetSettings() {
  game.settings = {
    musicEnabled: true,
    musicVolume: 45,
    sfxEnabled: true,
    sfxVolume: 75,
    graphicsQuality: "medium",
    reducedEffects: false,
    showAimGuide: true,
    touchZoomEnabled: true,
    vibrationEnabled: true,
    leftHandedMode: false
  };

  syncSettingsToForm();
  readSettingsFromForm();

  saveSoon();
  showToast("Paramètres par défaut restaurés.");
}

/* ============================================================
   23. TUTORIEL
   ============================================================ */

const tutorialSteps = [
  {
    title: "Bienvenue dans FOBAS Bubble 3D",
    text: "Ranise Moise te guide. Ton objectif est de rassembler au moins trois bulles de la même couleur."
  },
  {
    title: "Vise avec précision",
    text: "Touche ou fais glisser ton doigt dans la zone 3D pour orienter le lanceur."
  },
  {
    title: "Tire et crée des combos",
    text: "Appuie sur TIRER. Lorsque trois bulles ou plus de la même couleur se touchent, elles éclatent."
  },
  {
    title: "Utilise les pouvoirs",
    text: "Feu, bombe, arc-en-ciel, éclair et bouclier t'aident à surmonter les missions."
  }
];

function openTutorial() {
  game.tutorialStep = 0;
  showScreen("game");

  const main = $("gameMain");
  if (main) main.hidden = false;

  showTutorialStep();
  showOverlay("tutorialOverlay");
}

function showTutorialStep() {
  const step = tutorialSteps[game.tutorialStep];
  if (!step) return;

  setText("tutorialTitle", step.title);
  setText("tutorialText", step.text);
  setText(
    "tutorialStep",
    `${game.tutorialStep + 1} / ${tutorialSteps.length}`
  );

  setText(
    "tutorialNextButton",
    game.tutorialStep === tutorialSteps.length - 1
      ? "Terminer ✓"
      : "Suivant →"
  );
}

function nextTutorialStep() {
  game.tutorialStep++;

  if (game.tutorialStep >= tutorialSteps.length) {
    hideOverlay("tutorialOverlay");

    if (!game.running) {
      showScreen("menu");
    }

    showToast("Tutoriel terminé. Bonne partie !");
    return;
  }

  showTutorialStep();
}

function skipTutorial() {
  hideOverlay("tutorialOverlay");

  if (!game.running) {
    showScreen("menu");
  }
}

/* ============================================================
   24. OVERLAYS ET CONFIRMATIONS
   ============================================================ */

const overlayIds = [
  "pauseOverlay",
  "victoryOverlay",
  "defeatOverlay",
  "tutorialOverlay",
  "confirmationOverlay"
];

function showOverlay(id) {
  const element = $(id);
  if (element) element.hidden = false;
}

function hideOverlay(id) {
  const element = $(id);
  if (element) element.hidden = true;
}

function hideAllOverlays() {
  overlayIds.forEach(hideOverlay);
}

function askConfirmation(title, message, action) {
  setText("confirmationTitle", title);
  setText("confirmationMessage", message);

  game.confirmationAction = action;

  showOverlay("confirmationOverlay");
}

function confirmAction() {
  const action = game.confirmationAction;

  game.confirmationAction = null;
  hideOverlay("confirmationOverlay");

  if (typeof action === "function") {
    action();
  }
}

function cancelConfirmation() {
  game.confirmationAction = null;
  hideOverlay("confirmationOverlay");
}

/* ============================================================
   25. COMMANDES TACTILES ET ZOOM À DEUX DOIGTS
   ============================================================ */

function distanceBetweenPointers() {
  const points = [...world.activePointers.values()];

  if (points.length < 2) return 0;

  return Math.hypot(
    points[0].x - points[1].x,
    points[0].y - points[1].y
  );
}

function attachPointerControls() {
  const canvas = world.renderer?.domElement;
  if (!canvas) return;

  canvas.addEventListener("pointerdown", (event) => {
    world.activePointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY
    });

    if (world.activePointers.size === 2) {
      world.pinchDistance = distanceBetweenPointers();
      world.pinchZoomStart = game.zoom;
      return;
    }

    if (world.activePointers.size === 1) {
      world.pointerDown = true;
      setAim(event.clientX, event.clientY);
    }

    try {
      canvas.setPointerCapture(event.pointerId);
    } catch (error) {
      // Certains navigateurs ne permettent pas la capture.
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!world.activePointers.has(event.pointerId)) return;

    world.activePointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY
    });

    if (
      world.activePointers.size >= 2 &&
      game.settings.touchZoomEnabled
    ) {
      const currentDistance = distanceBetweenPointers();

      if (world.pinchDistance > 0) {
        game.zoom = clamp(
          world.pinchZoomStart *
            (currentDistance / world.pinchDistance),
          CONFIG.minZoom,
          CONFIG.maxZoom
        );

        applyZoom();
      }

      return;
    }

    if (world.pointerDown) {
      setAim(event.clientX, event.clientY);
    }
  });

  const finishPointer = (event) => {
    world.activePointers.delete(event.pointerId);

    if (world.activePointers.size < 2) {
      world.pinchDistance = 0;
    }

    if (world.activePointers.size === 0) {
      world.pointerDown = false;
    }
  };

  canvas.addEventListener("pointerup", finishPointer);
  canvas.addEventListener("pointercancel", finishPointer);

  canvas.addEventListener("click", (event) => {
    if (!game.settings.leftHandedMode) {
      setAim(event.clientX, event.clientY);
    }
  });
}

/* ============================================================
   26. PLEIN ÉCRAN ET VIBRATIONS
   ============================================================ */

async function toggleFullscreen() {
  const target = $("bubbleApp") || document.documentElement;

  try {
    if (!document.fullscreenElement) {
      if (target.requestFullscreen) {
        await target.requestFullscreen();
      } else {
        showToast("Le plein écran n'est pas disponible ici.");
      }
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    showToast("Impossible d'activer le plein écran.");
  }
}

function vibrate(pattern = 25) {
  if (!game.settings.vibrationEnabled) return;

  if ("vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      // Vibration optionnelle selon l'appareil.
    }
  }
}

/* ============================================================
   27. ÉVÉNEMENTS DES BOUTONS HTML
   ============================================================ */

function bindClick(id, callback) {
  const element = $(id);

  if (!element) {
    console.warn(`Bouton #${id} introuvable dans le HTML.`);
    return;
  }

  element.addEventListener("click", (event) => {
    event.preventDefault();

    try {
      callback(event);
    } catch (error) {
      console.error(`Erreur dans #${id} :`, error);
      showToast("Une erreur est survenue. Réessaie.");
    }
  });
}

function bindInput(id, callback) {
  const element = $(id);
  if (!element) return;

  element.addEventListener("input", callback);
  element.addEventListener("change", callback);
}

function bindAllControls() {
  /* Menu principal */
  bindClick("playButton", () => openModes());

  bindClick("continueButton", () => {
    const mission = clamp(
      game.progress.lastMission || game.currentMission,
      1,
      30
    );

    startMission(mission, "mission");
  });

  bindClick("missionsMenuButton", openMissions);
  bindClick("tutorialMenuButton", openTutorial);

  bindClick("homeButton", () => {
    if (game.running) {
      askConfirmation(
        "Retour au menu",
        "Veux-tu quitter la partie en cours ? Ta progression sera sauvegardée.",
        returnToMenu
      );
    } else {
      returnToMenu();
    }
  });

  bindClick("settingsButton", openSettings);
  bindClick("statisticsMenuButton", openStatistics);

  /* Modes */
  bindClick("modeBackButton", () => showScreen("menu"));

  bindClick("classicModeButton", () => {
    startMission(1, "classic");
  });

  bindClick("missionModeButton", openMissions);

  bindClick("relaxModeButton", () => {
    startMission(1, "relax");
  });

  /* Missions */
  bindClick("missionsBackButton", () => showScreen("modes"));

  bindInput("missionDifficulty", () => {
    const select = $("missionDifficulty");

    if (select && CONFIG.difficulty[select.value]) {
      game.difficulty = select.value;
      updateMissionGrid();
      saveSoon();
    }
  });

  /* Pause */
  bindClick("pauseButton", pauseGame);
  bindClick("resumeButton", resumeGame);

  bindClick("restartFromPauseButton", () => {
    askConfirmation(
      "Recommencer",
      "Le score de cette tentative sera perdu. Continuer ?",
      restartCurrentMission
    );
  });

  bindClick("pauseHomeButton", () => {
    askConfirmation(
      "Quitter la partie",
      "Retourner au menu principal ?",
      returnToMenu
    );
  });

  /* Victoire */
  bindClick("nextMissionButton", () => {
    const next = game.currentMission >= 30
      ? 1
      : game.currentMission + 1;

    startMission(next, "mission");
  });

  bindClick("replayVictoryButton", restartCurrentMission);
  bindClick("victoryHomeButton", returnToMenu);

  /* Défaite */
  bindClick("retryButton", restartCurrentMission);
  bindClick("defeatHomeButton", returnToMenu);

  /* Tir et changement de bulle */
  bindClick("shootButton", () => {
    shoot();
    vibrate(18);
  });

  bindClick("swapBubbleButton", () => {
    if (!canShoot()) return;

    const oldColor = game.currentColor;

    setCurrentBubble(game.nextColor);
    setNextBubble(oldColor);

    audio.tone(420, 0.07, "triangle", 0.12);
  });

  /* Pouvoirs */
  bindClick("fireballButton", () => usePower("fireball"));
  bindClick("bombButton", () => usePower("bomb"));
  bindClick("rainbowButton", () => usePower("rainbow"));
  bindClick("lightningButton", () => usePower("lightning"));
  bindClick("shieldButton", () => usePower("shield"));

  /* Zoom et plein écran */
  bindClick("zoomInButton", () => changeZoom(0.12));
  bindClick("zoomOutButton", () => changeZoom(-0.12));
  bindClick("zoomResetButton", resetZoom);
  bindClick("fullscreenButton", toggleFullscreen);

  /* Guide Ranise */
  bindClick("closeRaniseButton", () => {
    const assistant = $("raniseAssistant");
    if (assistant) assistant.hidden = true;
  });

  /* Tutoriel */
  bindClick("tutorialNextButton", nextTutorialStep);
  bindClick("tutorialSkipButton", skipTutorial);

  /* Réglages */
  bindClick("settingsBackButton", () => {
    if (game.running) {
      showScreen("game");
    } else {
      showScreen("menu");
    }
  });

  bindClick("saveSettingsButton", () => {
    readSettingsFromForm();
    saveSoon();
    showToast("Paramètres enregistrés.");
  });

  bindClick("resetSettingsButton", resetSettings);

  bindInput("musicVolume", () => {
    const input = $("musicVolume");
    if (!input) return;

    game.settings.musicVolume = Number(input.value);
    setText("musicVolumeOutput", `${input.value}%`);

    audio.applyVolumes();
  });

  bindInput("sfxVolume", () => {
    const input = $("sfxVolume");
    if (!input) return;

    game.settings.sfxVolume = Number(input.value);
    setText("sfxVolumeOutput", `${input.value}%`);

    audio.applyVolumes();
  });

  const settingIds = [
    "musicEnabled",
    "sfxEnabled",
    "graphicsQuality",
    "reducedEffects",
    "showAimGuide",
    "touchZoomEnabled",
    "vibrationEnabled",
    "leftHandedMode"
  ];

  for (const id of settingIds) {
    bindInput(id, () => {
      readSettingsFromForm();
      saveSoon();
    });
  }

  /* Statistiques */
  bindClick("statisticsBackButton", () => showScreen("menu"));
  bindClick("statisticsHomeButton", returnToMenu);
  bindClick("exportProgressButton", exportProgress);

  /* Confirmation */
  bindClick("confirmActionButton", confirmAction);
  bindClick("cancelActionButton", cancelConfirmation);

  /* Raccourcis clavier pour les ordinateurs */
  window.addEventListener("keydown", (event) => {
    if (event.repeat) return;

    if (event.code === "Space") {
      event.preventDefault();

      if (game.paused) resumeGame();
      else if (game.running) shoot();
    }

    if (event.code === "Escape") {
      if (game.paused) {
        resumeGame();
      } else if (game.running) {
        pauseGame();
      } else {
        returnToMenu();
      }
    }

    if (event.code === "ArrowLeft") {
      game.aimX = clamp(game.aimX - 0.25, -5, 5);
      updateAimGuide();
    }

    if (event.code === "ArrowRight") {
      game.aimX = clamp(game.aimX + 0.25, -5, 5);
      updateAimGuide();
    }
  });
}

/* ============================================================
   28. SAUVEGARDE DIFFÉRÉE
   ============================================================ */

let saveTimer = null;

function saveSoon() {
  clearTimeout(saveTimer);

  game.progress.lastMission = game.currentMission;
  game.progress.bestScore = Math.max(
    game.progress.bestScore || 0,
    game.score || 0
  );

  game.progress.totalStars = Object.values(
    game.progress.completedMissions
  ).reduce((sum, value) => sum + value, 0);

  saveTimer = setTimeout(() => {
    storage.save().catch((error) => {
      console.warn("Sauvegarde différée échouée :", error);
    });
  }, 180);
}

/* ============================================================
   29. BOUCLE D'ANIMATION THREE.JS
   ============================================================ */

function animate(now = 0) {
  game.animationFrame = requestAnimationFrame(animate);

  if (!world.rendererReady) return;

  const delta = Math.min(
    0.05,
    Math.max(0, (now - (game.lastFrame || now)) / 1000)
  );

  game.lastFrame = now;
  game.elapsed += delta;

  if (world.shooterRing) {
    world.shooterRing.rotation.z += delta * 0.4;
  }

  if (world.currentBubbleMesh) {
    const pulse = 1 + Math.sin(game.elapsed * 3.4) * 0.035;

    world.currentBubbleMesh.scale.setScalar(pulse);
  }

  if (game.running && !game.paused && !game.ended) {
    updateProjectiles(delta);
  }

  updateEffects(delta);

  if (world.renderer && world.scene && world.camera) {
    world.renderer.render(world.scene, world.camera);
  }
}

/* ============================================================
   30. INITIALISATION ET GESTION DES ERREURS
   ============================================================ */

async function initializeGame() {
  if (game.initialized) return;

  const loading = $("loadingScreen");
  const loadingMessage = $("loadingMessage");
  const loadingProgress = $("loadingProgress");

  try {
    if (loading) loading.hidden = false;

    if (loadingMessage) {
      loadingMessage.textContent = "Chargement du moteur 3D...";
    }

    if (loadingProgress) loadingProgress.style.width = "20%";

    initThree();

    if (loadingProgress) loadingProgress.style.width = "45%";

    if (loadingMessage) {
      loadingMessage.textContent = "Préparation de l'arène...";
    }

    generateBoard(4);

    setCurrentBubble(randomColor());
    setNextBubble(randomColor());

    if (loadingProgress) loadingProgress.style.width = "65%";

    if (loadingMessage) {
      loadingMessage.textContent = "Chargement des sauvegardes...";
    }

    await storage.init();
    await storage.load();

    if (loadingProgress) loadingProgress.style.width = "85%";

    syncSettingsToForm();
    readSettingsFromForm();

    bindAllControls();
    attachPointerControls();

    updateMenuStats();
    updateMissionGrid();
    updateStatistics();
    updateHUD();
    updatePowerButtons();
    updateAimGuide();

    if (loadingMessage) {
      loadingMessage.textContent = "Prêt à jouer !";
    }

    if (loadingProgress) loadingProgress.style.width = "100%";

    game.initialized = true;

    await sleep(300);

    if (loading) loading.hidden = true;

    showScreen("menu");

    setRaniseMessage(
      "Bienvenue ! Vise les bulles de même couleur, crée des combos et termine les 30 missions."
    );

    animate();

    console.info(
      `${CONFIG.appName} initialisé avec succès.`
    );
  } catch (error) {
    console.error("Erreur d'initialisation du jeu :", error);

    if (loadingMessage) {
      loadingMessage.textContent =
        "Le moteur 3D n'a pas pu démarrer. Vérifie la connexion Internet et recharge la page.";
    }

    if (loadingProgress) {
      loadingProgress.style.width = "100%";
    }

    showToast(
      "Impossible de charger la scène 3D. Vérifie la connexion et la console."
    );
  }
}

/* ============================================================
   31. DÉMARRAGE SÉCURISÉ
   ============================================================ */

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeGame,
    { once: true }
  );
} else {
  initializeGame();
}

/* ============================================================
   FIN DU FICHIER
   FOBAS BUBBLE SHOOTER 3D — RANISE MOISE
   ============================================================ */