
/* ================================================================
   NINA JUMPER 3D
   MOTEUR PRINCIPAL — PLAYCANVAS ES MODULE
   Fichier : appjumperfobas.js

   - PlayCanvas chargé avec import()
   - 60 missions progressives + ajout dynamique
   - Compatible avec les ID/data-action du HTML fourni
   - Android : boutons tactiles, swipe, pinch-to-zoom
   - Sauvegarde IndexedDB + secours localStorage
   - Aucun accès à window
================================================================ */

const PLAYCANVAS_VERSION = "2.23.2";
const PLAYCANVAS_MODULE =
    `https://cdn.jsdelivr.net/npm/playcanvas@${PLAYCANVAS_VERSION}/build/playcanvas.mjs`;

const SAVE_KEY = "nina_jumper_3d_save_v1";
const DATABASE_NAME = "NINA_JUMPER_3D_DATABASE";
const DATABASE_VERSION = 1;
const STORE_NAME = "gameData";

const $ = (id) => document.getElementById(id);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const random = (min, max) => min + Math.random() * (max - min);
const distance3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

const state = {
    app: null,
    pc: null,
    camera: null,
    nina: null,
    ninaParts: [],
    track: [],
    obstacles: [],
    coins: [],
    decorations: [],
    particles: [],
    database: null,

    ready: false,
    started: false,
    paused: true,
    gameOver: false,
    completed: false,
    menuOpen: false,

    missionIndex: 0,
    score: 0,
    coins: 0,
    lives: 3,
    bestScore: 0,
    completedMissions: [],
    unlockedMission: 0,
    selectedMission: 0,
    missionFilter: "all",

    distance: 0,
    missionDistance: 0,
    lane: 0,
    targetLane: 0,
    verticalVelocity: 0,
    grounded: true,
    sliding: false,
    slideTimer: 0,
    invulnerable: 0,
    spawnCursor: 16,
    spawnIndex: 0,
    coinCursor: 10,
    cameraDistance: 9,
    cameraAngle: 0,
    cameraAngleTarget: 0,
    cameraHeight: 4.2,
    elapsed: 0,
    runSpeed: 8,
    missionCoins: 0,
    missionScore: 0,
    stars: 0,
    soundEnabled: true,
    soundVolume: 0.6,
    vibrationEnabled: true,
    quality: "medium",
    sensitivity: 5,
    audioContext: null,
    lastFrame: 0,
    lastSave: 0,
    lastHudUpdate: 0,
    confirmAction: null,
    pointerMap: new Map(),
    pinchStartDistance: 0,
    pinchStartZoom: 9,
    swipeStart: null,
    notificationTimer: null,
    initialized: false,
    missionSeed: 0
};

/* ================================================================
   1. MISSIONS : 60 MISSIONS GÉNÉRÉES, ÉDITABLES ET EXTENSIBLES
================================================================ */

const MISSION_THEMES = [
    "Le premier saut",
    "La route des pièces",
    "Les barrières du matin",
    "Le pont suspendu",
    "Le tunnel mystérieux",
    "La jungle lumineuse",
    "Les virages rapides",
    "Le canyon rouge",
    "La cité flottante",
    "La course du vent",
    "Le passage secret",
    "Les plateformes mobiles",
    "La vallée des cristaux",
    "Le temple ancien",
    "Le labyrinthe doré",
    "La forêt des ombres",
    "Le pont des nuages",
    "La montagne bleue",
    "Les ruines oubliées",
    "La route des météores",
    "Le désert des mirages",
    "Les arches de feu",
    "La rivière suspendue",
    "Le jardin mécanique",
    "Le château des hauteurs",
    "La nuit électrique",
    "Le couloir des pièges",
    "Les tours vertigineuses",
    "Le volcan endormi",
    "La piste des éclairs",
    "Le royaume de glace",
    "Les cristaux géants",
    "Le labyrinthe mobile",
    "La cité des étoiles",
    "Le pont des tempêtes",
    "La mine abandonnée",
    "Le chemin des dragons",
    "Les plateformes célestes",
    "La forteresse des vents",
    "Le désert électrique",
    "Le sanctuaire caché",
    "Les falaises mouvantes",
    "La route des titans",
    "Le temple des illusions",
    "La jungle sauvage",
    "Le tunnel des ombres",
    "Le pont de cristal",
    "La montagne interdite",
    "Les anneaux du destin",
    "Le royaume suspendu",
    "La course des champions",
    "La citadelle des pièges",
    "Les jardins de lumière",
    "Le canyon des géants",
    "La tempête infinie",
    "Le labyrinthe ultime",
    "La forteresse céleste",
    "Les portes du champion",
    "L'épreuve légendaire",
    "La grande victoire"
];

const MISSION_DESCRIPTIONS = [
    "Apprenez à courir, sauter et ramasser vos premières pièces.",
    "Explorez la piste et collectez les pièces tout en gardant votre vitesse.",
    "Enchaînez les sauts et les glissades sans perdre de vie.",
    "Traversez le parcours et atteignez la ligne d'arrivée.",
    "Esquivez les obstacles dans un passage de plus en plus étroit.",
    "Maîtrisez les trois voies et trouvez le meilleur itinéraire.",
    "Réagissez rapidement aux obstacles qui se rapprochent.",
    "Conservez vos vies et collectez des récompenses supplémentaires.",
    "Traversez une piste plus longue avec des pièges combinés.",
    "Terminez le parcours et démontrez votre maîtrise des commandes."
];

const MISSION_DEFINITIONS = [];

function buildMission(index) {
    const level = index + 1;
    const tier = Math.floor(index / 10);
    const distance = Math.round(110 + level * 24 + tier * 12);
    const obstacleDensity = clamp(0.10 + level * 0.008, 0.12, 0.66);
    const coinTarget = Math.round(5 + level * 1.4);
    const obstacleTarget = Math.round(5 + level * 1.1);

    return {
        id: `nina-mission-${String(level).padStart(3, "0")}`,
        number: level,
        name: MISSION_THEMES[index % MISSION_THEMES.length],
        description: MISSION_DESCRIPTIONS[
            Math.min(9, Math.floor(index / 6))
        ],
        objective: `Parcourez ${distance} m, récupérez ${coinTarget} pièces et atteignez l'arrivée.`,
        distance,
        coinTarget,
        obstacleTarget,
        obstacleDensity,
        speed: 7.5 + level * 0.095,
        difficulty: clamp(1 + Math.floor(index / 5), 1, 12),
        reward: 20 + level * 8,
        starsThreshold: {
            bronze: 0.60,
            silver: 0.82,
            gold: 1
        },
        colors: [
            "#39d5ff",
            "#a78bfa",
            "#f472b6",
            "#fbbf24",
            "#34d399"
        ],
        seed: level * 7919,
        unlocked: level === 1,
        completed: false
    };
}

for (let i = 0; i < 60; i++) {
    MISSION_DEFINITIONS.push(buildMission(i));
}

/*
  Ajouter une mission dans le code :
  addMission({
      name: "Le pont des dragons",
      distance: 1800,
      coinTarget: 90,
      obstacleTarget: 65,
      obstacleDensity: 0.58,
      speed: 17,
      reward: 900,
      objective: "Traversez le pont, collectez 90 pièces et terminez.",
      description: "Un parcours long avec des obstacles combinés."
  });

  La nouvelle mission est ajoutée à la liste.
  Son numéro est attribué automatiquement.
*/

export function addMission(definition = {}) {
    const number = MISSION_DEFINITIONS.length + 1;
    const base = buildMission(number - 1);

    const mission = {
        ...base,
        ...definition,
        id: definition.id || `nina-mission-${String(number).padStart(3, "0")}`,
        number,
        distance: Math.max(50, Number(definition.distance ?? base.distance)),
        coinTarget: Math.max(0, Number(definition.coinTarget ?? base.coinTarget)),
        obstacleTarget: Math.max(0, Number(definition.obstacleTarget ?? base.obstacleTarget)),
        obstacleDensity: clamp(Number(definition.obstacleDensity ?? base.obstacleDensity), 0.05, 0.85),
        speed: clamp(Number(definition.speed ?? base.speed), 4, 30),
        reward: Math.max(0, Number(definition.reward ?? base.reward)),
        completed: false,
        unlocked: false
    };

    MISSION_DEFINITIONS.push(mission);
    renderMissions();
    notify(`Mission ${number} ajoutée : ${mission.name}`);

    return mission;
}

export function getMissions() {
    return MISSION_DEFINITIONS.map((mission) => ({ ...mission }));
}

export function getMission(number) {
    const mission = MISSION_DEFINITIONS.find((item) => item.number === Number(number));
    return mission ? { ...mission } : null;
}

/* ================================================================
   2. SAUVEGARDE : INDEXEDDB + LOCALSTORAGE
================================================================ */

function openDatabase() {
    return new Promise((resolve, reject) => {
        if (!("indexedDB" in globalThis)) {
            reject(new Error("IndexedDB indisponible"));
            return;
        }

        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Ouverture impossible"));
    });
}

function serializeState() {
    return {
        version: 1,
        savedAt: new Date().toISOString(),
        missionIndex: state.missionIndex,
        score: state.score,
        coins: state.coins,
        lives: state.lives,
        bestScore: state.bestScore,
        completedMissions: [...state.completedMissions],
        unlockedMission: state.unlockedMission,
        quality: state.quality,
        sensitivity: state.sensitivity,
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
        vibrationEnabled: state.vibrationEnabled,
        cameraDistance: state.cameraDistance,
        cameraAngle: state.cameraAngle,
        customMissions: MISSION_DEFINITIONS.slice(60).map((mission) => ({ ...mission }))
    };
}

function applySave(data) {
    if (!data || typeof data !== "object") {
        throw new Error("Fichier de sauvegarde invalide");
    }

    state.missionIndex = clamp(Number(data.missionIndex) || 0, 0, MISSION_DEFINITIONS.length - 1);
    state.score = Math.max(0, Number(data.score) || 0);
    state.coins = Math.max(0, Number(data.coins) || 0);
    state.lives = clamp(Number(data.lives) || 3, 0, 3);
    state.bestScore = Math.max(0, Number(data.bestScore) || 0);
    state.completedMissions = Array.isArray(data.completedMissions)
        ? data.completedMissions.filter(Number.isInteger)
        : [];
    state.unlockedMission = clamp(Number(data.unlockedMission) || 0, 0, MISSION_DEFINITIONS.length - 1);
    state.quality = ["low", "medium", "high"].includes(data.quality) ? data.quality : "medium";
    state.sensitivity = clamp(Number(data.sensitivity) || 5, 1, 10);
    state.soundEnabled = data.soundEnabled !== false;
    state.soundVolume = clamp(Number(data.soundVolume ?? 0.6), 0, 1);
    state.vibrationEnabled = data.vibrationEnabled !== false;
    state.cameraDistance = clamp(Number(data.cameraDistance) || 9, 5, 18);
    state.cameraAngle = Number(data.cameraAngle) || 0;

    if (Array.isArray(data.customMissions)) {
        for (const item of data.customMissions) {
            if (!item || !item.name) continue;
            if (MISSION_DEFINITIONS.some((m) => m.id === item.id)) continue;
            MISSION_DEFINITIONS.push({
                ...buildMission(MISSION_DEFINITIONS.length),
                ...item,
                number: MISSION_DEFINITIONS.length + 1
            });
        }
    }

    for (const mission of MISSION_DEFINITIONS) {
        mission.completed = state.completedMissions.includes(mission.number);
        mission.unlocked = mission.number - 1 <= state.unlockedMission;
    }
}

async function saveGame() {
    const data = serializeState();
    let saved = false;

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        saved = true;
    } catch (error) {
        console.warn("Sauvegarde locale indisponible :", error);
    }

    try {
        if (!state.database) state.database = await openDatabase();

        await new Promise((resolve, reject) => {
            const transaction = state.database.transaction(STORE_NAME, "readwrite");
            transaction.objectStore(STORE_NAME).put({ id: SAVE_KEY, data });
            transaction.oncomplete = resolve;
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
        });

        saved = true;
    } catch (error) {
        console.warn("IndexedDB indisponible :", error);
    }

    state.lastSave = Date.now();

    if (saved) {
        setText("saveStatus", "Progression sauvegardée.");
        setText("systemMessage", "Sauvegarde terminée.");
        notify("Progression sauvegardée !");
        return true;
    }

    setText("systemMessage", "Impossible de sauvegarder. Vérifiez le stockage du navigateur.");
    notify("Échec de la sauvegarde");
    return false;
}

async function loadGame() {
    let data = null;

    try {
        if (!state.database) state.database = await openDatabase();

        data = await new Promise((resolve, reject) => {
            const request = state.database
                .transaction(STORE_NAME, "readonly")
                .objectStore(STORE_NAME)
                .get(SAVE_KEY);

            request.onsuccess = () => resolve(request.result?.data || null);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.info("Chargement IndexedDB indisponible :", error);
    }

    if (!data) {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (raw) data = JSON.parse(raw);
        } catch (error) {
            console.warn("Sauvegarde locale illisible :", error);
        }
    }

    if (data) {
        try {
            applySave(data);
            setText("saveStatus", "Sauvegarde trouvée. Vous pouvez continuer.");
            return true;
        } catch (error) {
            console.warn("Données de sauvegarde incorrectes :", error);
        }
    }

    setText("saveStatus", "Nouvelle partie : votre progression sera sauvegardée.");
    return false;
}

/* ================================================================
   3. UTILITAIRES D'INTERFACE
================================================================ */

function setText(id, value) {
    const element = $(id);
    if (element) element.textContent = String(value);
}

function show(elementOrId) {
    const element = typeof elementOrId === "string" ? $(elementOrId) : elementOrId;
    if (element) element.classList.remove("hidden");
}

function hide(elementOrId) {
    const element = typeof elementOrId === "string" ? $(elementOrId) : elementOrId;
    if (element) element.classList.add("hidden");
}

function toggle(elementOrId) {
    const element = typeof elementOrId === "string" ? $(elementOrId) : elementOrId;
    if (element) element.classList.toggle("hidden");
}

function notify(message, duration = 2200) {
    const element = $("gameNotification");
    if (!element) return;

    element.textContent = message;
    element.classList.add("visible");

    if (state.notificationTimer) clearTimeout(state.notificationTimer);
    state.notificationTimer = setTimeout(() => {
        element.classList.remove("visible");
    }, duration);
}

function setLoading(percent, message) {
    const progress = $("loadingProgress");
    if (progress) progress.style.width = `${clamp(percent, 0, 100)}%`;
    setText("loadingPercent", `${Math.round(clamp(percent, 0, 100))} %`);
    setText("loadingMessage", message);
}

function vibrate(pattern = 25) {
    if (!state.vibrationEnabled) return;
    if (navigator.vibrate) {
        try {
            navigator.vibrate(pattern);
        } catch (_) {
            // La vibration reste facultative.
        }
    }
}

function playTone(frequency = 440, duration = 0.07, type = "sine") {
    if (!state.soundEnabled || state.soundVolume <= 0) return;

    try {
        const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!AudioContextClass) return;

        if (!state.audioContext) state.audioContext = new AudioContextClass();
        if (state.audioContext.state === "suspended") {
            state.audioContext.resume().catch(() => {});
        }

        const oscillator = state.audioContext.createOscillator();
        const gain = state.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;
        gain.gain.value = state.soundVolume * 0.055;
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            state.audioContext.currentTime + duration
        );

        oscillator.connect(gain);
        gain.connect(state.audioContext.destination);
        oscillator.start();
        oscillator.stop(state.audioContext.currentTime + duration);
    } catch (error) {
        console.info("Son indisponible :", error);
    }
}

/* ================================================================
   4. CRÉATION DU MONDE PLAYCANVAS 3D
================================================================ */

function makeMaterial(pc, color, emissive = null) {
    const material = new pc.StandardMaterial();
    material.diffuse = new pc.Color(color);
    if (emissive) {
        material.emissive = new pc.Color(emissive);
        material.emissiveIntensity = 0.35;
    }
    material.metalness = 0.12;
    material.gloss = 40;
    material.update();
    return material;
}

function createBox(name, position, scale, material, parent = null) {
    const pc = state.pc;
    const entity = new pc.Entity(name);

    entity.addComponent("render", {
        type: "box",
        material
    });

    entity.setLocalPosition(position.x, position.y, position.z);
    entity.setLocalScale(scale.x, scale.y, scale.z);

    (parent || state.app.root).addChild(entity);
    return entity;
}

function createSphere(name, position, scale, material, parent = null) {
    const pc = state.pc;
    const entity = new pc.Entity(name);

    entity.addComponent("render", {
        type: "sphere",
        material
    });

    entity.setLocalPosition(position.x, position.y, position.z);
    entity.setLocalScale(scale.x, scale.y, scale.z);

    (parent || state.app.root).addChild(entity);
    return entity;
}

function createCylinder(name, position, scale, material, parent = null) {
    const pc = state.pc;
    const entity = new pc.Entity(name);

    entity.addComponent("render", {
        type: "cylinder",
        material
    });

    entity.setLocalPosition(position.x, position.y, position.z);
    entity.setLocalScale(scale.x, scale.y, scale.z);

    (parent || state.app.root).addChild(entity);
    return entity;
}

function setupScene() {
    const pc = state.pc;
    const canvas = $("jumperCanvas");

    if (!canvas) throw new Error("Canvas #jumperCanvas introuvable");

    const app = new pc.Application(canvas, {
        graphicsDeviceOptions: {
            antialias: state.quality !== "low",
            alpha: false,
            powerPreference: "high-performance",
            preserveDrawingBuffer: false
        },
        mouse: new pc.Mouse(canvas),
        touch: new pc.TouchDevice(canvas)
    });

    state.app = app;

    app.setCanvasFillMode(pc.FILLMODE_NONE);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);

    app.scene.ambientLight = new pc.Color(0.46, 0.51, 0.67);
    app.scene.exposure = 1;
    app.scene.toneMapping = pc.TONEMAP_ACES;

    const camera = new pc.Entity("NINA_CAMERA");
    camera.addComponent("camera", {
        clearColor: new pc.Color(0.025, 0.055, 0.12),
        fov: 60,
        nearClip: 0.1,
        farClip: 350
    });
    app.root.addChild(camera);
    state.camera = camera;

    const sun = new pc.Entity("SUN_LIGHT");
    sun.addComponent("light", {
        type: "directional",
        color: new pc.Color(1, 0.91, 0.78),
        intensity: 1.7,
        castShadows: state.quality === "high",
        shadowResolution: state.quality === "high" ? 1024 : 512
    });
    sun.setLocalEulerAngles(45, 25, 0);
    app.root.addChild(sun);

    const fill = new pc.Entity("FILL_LIGHT");
    fill.addComponent("light", {
        type: "omni",
        color: new pc.Color(0.24, 0.55, 1),
        intensity: 0.55,
        range: 50
    });
    fill.setLocalPosition(0, 8, 5);
    app.root.addChild(fill);

    createWorldMaterials();
    createNina();
    createInitialWorld();
    updateCamera(0);

    app.on("update", updateGame);
    app.start();

    resizeCanvas();
}

function createWorldMaterials() {
    const pc = state.pc;

    state.materials = {
        ground: makeMaterial(pc, "#172c47"),
        road: makeMaterial(pc, "#26354d"),
        lane: makeMaterial(pc, "#52708e", "#173c63"),
        edge: makeMaterial(pc, "#20d7f5", "#10a4df"),
        nina: makeMaterial(pc, "#ff4f91", "#b51d5d"),
        ninaFace: makeMaterial(pc, "#ffd7b0"),
        hair: makeMaterial(pc, "#241b36"),
        white: makeMaterial(pc, "#f7fbff"),
        obstacle: makeMaterial(pc, "#fa4b65", "#a91c3c"),
        obstacleGold: makeMaterial(pc, "#ffbf47", "#a95e08"),
        coin: makeMaterial(pc, "#ffd84c", "#ffb800"),
        gem: makeMaterial(pc, "#44f1ff", "#08b8e8"),
        platform: makeMaterial(pc, "#3b4f75"),
        decoration: makeMaterial(pc, "#273b64"),
        tree: makeMaterial(pc, "#22b67a"),
        treeTop: makeMaterial(pc, "#55e8a5"),
        star: makeMaterial(pc, "#ffe98a", "#ffd52a"),
        dark: makeMaterial(pc, "#0b1527")
    };
}

function createNina() {
    const pc = state.pc;
    const root = new pc.Entity("NINA_PLAYER");
    state.app.root.addChild(root);

    const body = createBox(
        "NINA_BODY",
        { x: 0, y: 1.02, z: 0 },
        { x: 0.62, y: 0.84, z: 0.38 },
        state.materials.nina,
        root
    );

    const head = createSphere(
        "NINA_HEAD",
        { x: 0, y: 1.72, z: 0.02 },
        { x: 0.58, y: 0.60, z: 0.52 },
        state.materials.ninaFace,
        root
    );

    createSphere(
        "NINA_HAIR",
        { x: 0, y: 1.95, z: -0.05 },
        { x: 0.62, y: 0.34, z: 0.55 },
        state.materials.hair,
        root
    );

    createSphere(
        "NINA_HAIR_SIDE_LEFT",
        { x: -0.27, y: 1.68, z: -0.04 },
        { x: 0.17, y: 0.55, z: 0.20 },
        state.materials.hair,
        root
    );

    createSphere(
        "NINA_HAIR_SIDE_RIGHT",
        { x: 0.27, y: 1.68, z: -0.04 },
        { x: 0.17, y: 0.55, z: 0.20 },
        state.materials.hair,
        root
    );

    for (const x of [-0.13, 0.13]) {
        createSphere(
            "NINA_EYE",
            { x, y: 1.73, z: 0.265 },
            { x: 0.07, y: 0.09, z: 0.04 },
            state.materials.dark,
            root
        );
    }

    const leftLeg = createBox(
        "NINA_LEG_LEFT",
        { x: -0.17, y: 0.42, z: 0 },
        { x: 0.22, y: 0.53, z: 0.25 },
        state.materials.white,
        root
    );

    const rightLeg = createBox(
        "NINA_LEG_RIGHT",
        { x: 0.17, y: 0.42, z: 0 },
        { x: 0.22, y: 0.53, z: 0.25 },
        state.materials.white,
        root
    );

    createBox(
        "NINA_SHOE_LEFT",
        { x: -0.17, y: 0.14, z: 0.09 },
        { x: 0.28, y: 0.15, z: 0.39 },
        state.materials.obstacleGold,
        root
    );

    createBox(
        "NINA_SHOE_RIGHT",
        { x: 0.17, y: 0.14, z: 0.09 },
        { x: 0.28, y: 0.15, z: 0.39 },
        state.materials.obstacleGold,
        root
    );

    const leftArm = createBox(
        "NINA_ARM_LEFT",
        { x: -0.39, y: 1.08, z: 0 },
        { x: 0.18, y: 0.58, z: 0.21 },
        state.materials.ninaFace,
        root
    );

    const rightArm = createBox(
        "NINA_ARM_RIGHT",
        { x: 0.39, y: 1.08, z: 0 },
        { x: 0.18, y: 0.58, z: 0.21 },
        state.materials.ninaFace,
        root
    );

    state.nina = root;
    state.ninaParts = [body, head, leftLeg, rightLeg, leftArm, rightArm];
}

function createInitialWorld() {
    const m = state.materials;

    createBox(
        "ENDLESS_GROUND",
        { x: 0, y: -0.35, z: -105 },
        { x: 40, y: 0.4, z: 300 },
        m.ground
    );

    createBox(
        "RUNWAY",
        { x: 0, y: -0.12, z: -105 },
        { x: 9, y: 0.18, z: 300 },
        m.road
    );

    for (const x of [-1.5, 1.5]) {
        const line = createBox(
            "LANE_MARKING",
            { x, y: -0.015, z: -105 },
            { x: 0.035, y: 0.025, z: 300 },
            m.lane
        );
        state.track.push(line);
    }

    for (const x of [-4.65, 4.65]) {
        createBox(
            "ROAD_EDGE",
            { x, y: 0.03, z: -105 },
            { x: 0.12, y: 0.12, z: 300 },
            m.edge
        );
    }

    for (let z = 0; z > -300; z -= 12) {
        for (const x of [-1.5, 1.5]) {
            createBox(
                "DASHED_LINE",
                { x, y: 0.005, z },
                { x: 0.045, y: 0.018, z: 4 },
                m.white
            );
        }
    }

    for (let i = 0; i < 30; i++) {
        const z = -i * 10 - 8;

        for (const side of [-1, 1]) {
            const x = side * random(7, 13);
            const trunk = createCylinder(
                "SCENERY_TRUNK",
                { x, y: 0.7, z },
                { x: 0.36, y: 1.4, z: 0.36 },
                m.decoration
            );

            const crown = createSphere(
                "SCENERY_CROWN",
                { x, y: 1.9, z },
                { x: 1.4, y: 1.8, z: 1.4 },
                i % 2 ? m.tree : m.treeTop
            );

            state.decorations.push(trunk, crown);
        }
    }
}

/* ================================================================
   5. CAMÉRA ET REDIMENSIONNEMENT
================================================================ */

function updateCamera(dt) {
    if (!state.camera || !state.nina) return;

    const playerPosition = state.nina.getPosition();
    const angle = state.cameraAngleTarget;
    const distance = state.cameraDistance;

    state.cameraAngle += (angle - state.cameraAngle) * Math.min(1, dt * 4);

    const radians = state.cameraAngle * Math.PI / 180;
    const targetX = playerPosition.x + Math.sin(radians) * distance * 0.45;
    const targetY = playerPosition.y + state.cameraHeight;
    const targetZ = playerPosition.z + distance;

    state.camera.setPosition(targetX, targetY, targetZ);
    state.camera.lookAt(playerPosition.x, playerPosition.y + 1.05, playerPosition.z - 4);
}

function resizeCanvas() {
    if (!state.app) return;

    try {
        state.app.resizeCanvas();
    } catch (error) {
        console.warn("Redimensionnement différé :", error);
    }
}

/* ================================================================
   6. MISSIONS ET PRÉPARATION DES PARCOURS
================================================================ */

function currentMission() {
    return MISSION_DEFINITIONS[
        clamp(state.missionIndex, 0, MISSION_DEFINITIONS.length - 1)
    ];
}

function selectMission(index) {
    const mission = MISSION_DEFINITIONS[index];
    if (!mission) return false;

    if (index > state.unlockedMission) {
        notify("Terminez les missions précédentes pour débloquer celle-ci.");
        return false;
    }

    state.selectedMission = index;
    state.missionIndex = index;
    updateHud();
    renderMissions();
    return true;
}

function clearObjects(list) {
    for (const object of list) {
        if (object && !object.destroyed) object.destroy();
    }
    list.length = 0;
}

function prepareMission(index, preserveTotal = true) {
    const mission = MISSION_DEFINITIONS[index];
    if (!mission) return;

    clearObjects(state.obstacles);
    clearObjects(state.coins);
    clearObjects(state.particles);

    state.missionIndex = index;
    state.selectedMission = index;
    state.distance = 0;
    state.missionDistance = 0;
    state.lane = 0;
    state.targetLane = 0;
    state.verticalVelocity = 0;
    state.grounded = true;
    state.sliding = false;
    state.slideTimer = 0;
    state.invulnerable = 0;
    state.spawnCursor = 17;
    state.spawnIndex = 0;
    state.coinCursor = 8;
    state.missionCoins = 0;
    state.missionScore = 0;
    state.stars = 0;
    state.runSpeed = mission.speed;
    state.elapsed = 0;
    state.completed = false;
    state.gameOver = false;

    state.nina.setPosition(0, 0, 0);
    state.nina.setLocalEulerAngles(0, 0, 0);
    state.nina.setLocalScale(1, 1, 1);

    if (!preserveTotal) {
        state.score = 0;
        state.coins = 0;
        state.lives = 3;
    } else {
        state.lives = Math.max(1, state.lives);
    }

    hide("missionCompletePanel");
    hide("gameOverPanel");
    hide("pausePanel");
    hide("startPanel");
    hide("missionsPanel");
    hide("sideMenu");

    state.started = true;
    state.paused = false;

    setText("missionName", mission.name);
    setText("objectiveText", mission.objective);
    setText("currentMission", `${String(index + 1).padStart(2, "0")} / ${MISSION_DEFINITIONS.length}`);

    notify(`Mission ${index + 1} : ${mission.name}`);
    updateHud();
}

function startGame() {
    prepareMission(state.unlockedMission, false);
    state.started = true;
    state.paused = false;
    state.gameOver = false;
    playTone(620, 0.12);
}

function continueGame() {
    prepareMission(state.missionIndex, true);
    state.paused = false;
    state.started = true;
    notify("Partie reprise");
}

function restartMission() {
    prepareMission(state.missionIndex, true);
    state.paused = false;
    notify("Mission recommencée");
}

function nextMission() {
    const nextIndex = state.missionIndex + 1;

    if (nextIndex >= MISSION_DEFINITIONS.length) {
        notify("Toutes les missions disponibles sont terminées !");
        return;
    }

    if (nextIndex > state.unlockedMission) {
        state.unlockedMission = nextIndex;
    }

    prepareMission(nextIndex, true);
    saveGame();
}

/* ================================================================
   7. OBSTACLES, PIÈCES ET GÉNÉRATION PROCÉDURALE
================================================================ */

function addObstacle(lane, z, type = "block") {
    const m = state.materials;
    let entity;

    if (type === "barrier") {
        entity = createBox(
            "OBSTACLE_BARRIER",
            { x: lane * 3, y: 1.35, z },
            { x: 1.95, y: 0.28, z: 0.5 },
            m.obstacleGold
        );
    } else if (type === "gap") {
        entity = createBox(
            "OBSTACLE_GAP_WARNING",
            { x: lane * 3, y: -0.005, z },
            { x: 2.7, y: 0.025, z: 2.8 },
            m.obstacle
        );
    } else if (type === "double") {
        entity = createBox(
            "OBSTACLE_DOUBLE",
            { x: lane * 3, y: 0.85, z },
            { x: 1.45, y: 1.7, z: 0.8 },
            m.obstacleGold
        );
    } else {
        entity = createBox(
            "OBSTACLE_BLOCK",
            { x: lane * 3, y: 0.65, z },
            { x: 1.15, y: 1.3, z: 0.85 },
            m.obstacle
        );
    }

    state.obstacles.push({
        entity,
        lane,
        z,
        type,
        hit: false,
        passed: false
    });
}

function addCoin(lane, z, height = 1.25, type = "coin") {
    const entity = createSphere(
        type === "gem" ? "GEM_REWARD" : "COIN_REWARD",
        { x: lane * 3, y: height, z },
        { x: 0.43, y: 0.43, z: 0.18 },
        type === "gem" ? state.materials.gem : state.materials.coin
    );

    state.coins.push({
        entity,
        lane,
        z,
        height,
        type,
        collected: false
    });
}

function spawnAhead() {
    const mission = currentMission();
    const maxZ = -(mission.distance + 100);

    while (state.spawnCursor > maxZ) {
        const z = -state.spawnCursor;
        const density = mission.obstacleDensity;
        const roll = Math.random();

        if (roll < density) {
            const lane = Math.floor(random(0, 3)) - 1;
            const typeRoll = Math.random();

            let type = "block";
            if (typeRoll > 0.78) type = "barrier";
            else if (typeRoll > 0.64) type = "double";

            addObstacle(lane, z, type);

            if (mission.difficulty >= 5 && Math.random() < 0.18) {
                const secondLane = [-1, 0, 1].filter((x) => x !== lane)[
                    Math.floor(Math.random() * 2)
                ];
                addObstacle(secondLane, z - random(1, 3), "block");
            }
        }

        if (Math.random() < 0.85) {
            const coinLane = Math.floor(random(0, 3)) - 1;
            const coinCount = 2 + Math.floor(Math.random() * Math.min(6, mission.difficulty + 1));

            for (let i = 0; i < coinCount; i++) {
                addCoin(coinLane, z - i * 2.1, 1.2 + (i % 3) * 0.12);
            }
        }

        if (state.spawnIndex % 7 === 0 && mission.difficulty >= 3) {
            const lane = Math.floor(random(0, 3)) - 1;
            addCoin(lane, z - 8, 2.1, "gem");
        }

        state.spawnIndex++;
        state.spawnCursor += random(9, 15) / (1 + density * 0.2);
    }
}

function cleanupObjects() {
    for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const item = state.obstacles[i];
        if (item.z > 15 || !item.entity || item.entity.destroyed) {
            if (item.entity && !item.entity.destroyed) item.entity.destroy();
            state.obstacles.splice(i, 1);
        }
    }

    for (let i = state.coins.length - 1; i >= 0; i--) {
        const item = state.coins[i];
        if (item.z > 15 || item.collected || !item.entity || item.entity.destroyed) {
            if (item.entity && !item.entity.destroyed) item.entity.destroy();
            state.coins.splice(i, 1);
        }
    }
}

/* ================================================================
   8. CONTRÔLES DU JOUEUR
================================================================ */

function moveLeft() {
    if (!canControl()) return;
    state.targetLane = clamp(state.targetLane - 1, -1, 1);
    playTone(260, 0.035);
}

function moveRight() {
    if (!canControl()) return;
    state.targetLane = clamp(state.targetLane + 1, -1, 1);
    playTone(300, 0.035);
}

function jump() {
    if (!canControl() || !state.grounded || state.sliding) return;

    state.verticalVelocity = 9.3 + Math.min(1.8, currentMission().difficulty * 0.08);
    state.grounded = false;

    playTone(520, 0.09);
    vibrate(15);
}

function slide() {
    if (!canControl() || state.sliding) return;

    state.sliding = true;
    state.slideTimer = 0.9;
    playTone(210, 0.08, "triangle");
    vibrate(12);
}

function canControl() {
    return state.ready && state.started && !state.paused &&
        !state.gameOver && !state.completed;
}

function zoomIn() {
    state.cameraDistance = clamp(state.cameraDistance - 1, 5, 18);
}

function zoomOut() {
    state.cameraDistance = clamp(state.cameraDistance + 1, 5, 18);
}

function resetZoom() {
    state.cameraDistance = 9;
    state.cameraAngleTarget = 0;
    state.cameraHeight = 4.2;
}

function rotateCamera() {
    state.cameraAngleTarget = (state.cameraAngleTarget + 35) % 360;
}

function pauseGame() {
    if (!state.started || state.completed || state.gameOver) return;

    state.paused = true;
    show("pausePanel");
    notify("Jeu en pause");
}

function resumeGame() {
    hide("pausePanel");
    hide("sideMenu");
    state.paused = false;
    state.started = true;
}

function returnHome() {
    state.paused = true;
    state.started = false;

    hide("pausePanel");
    hide("missionsPanel");
    hide("sideMenu");
    hide("missionCompletePanel");
    hide("gameOverPanel");
    show("startPanel");

    saveGame();
}

/* ================================================================
   9. COLLISIONS ET RÉCOMPENSES
================================================================ */

function playerCollisionLane() {
    return Math.abs(state.nina.getPosition().x - state.targetLane * 3) < 1.1;
}

function handleObstacleCollision(item) {
    if (item.hit || state.invulnerable > 0) return;

    item.hit = true;
    state.lives = Math.max(0, state.lives - 1);
    state.invulnerable = 1.35;

    state.score = Math.max(0, state.score - 20);
    notify("Attention ! Vous avez touché un obstacle.");
    playTone(120, 0.22, "sawtooth");
    vibrate([70, 40, 70]);

    if (state.lives <= 0) endGame();
}

function collectCoin(item) {
    if (item.collected) return;

    item.collected = true;
    state.coins++;
    state.missionCoins++;

    const reward = item.type === "gem" ? 10 : 2;
    state.score += reward;
    state.missionScore += reward;

    playTone(item.type === "gem" ? 950 : 720, 0.055);
    if (item.type === "gem") {
        notify("Cristal bonus récupéré !");
    }
}

function checkCollisions(dt) {
    const player = state.nina.getPosition();

    for (const obstacle of state.obstacles) {
        if (obstacle.hit || obstacle.passed) continue;

        const dz = Math.abs(obstacle.z - player.z);
        if (dz > 1.05) continue;

        if (Math.abs(obstacle.lane * 3 - player.x) > 1.12) {
            obstacle.passed = true;
            continue;
        }

        let collision = true;

        if (obstacle.type === "barrier") {
            collision = !state.sliding;
        } else if (obstacle.type === "double") {
            collision = player.y < 1.35;
        } else if (obstacle.type === "gap") {
            collision = state.grounded;
        } else {
            collision = player.y < 1.45;
        }

        if (collision) handleObstacleCollision(obstacle);
        else obstacle.passed = true;
    }

    for (const coin of state.coins) {
        if (coin.collected) continue;

        const dz = Math.abs(coin.z - player.z);
        if (dz > 1.25) continue;

        const dx = Math.abs(coin.lane * 3 - player.x);
        const dy = Math.abs(coin.height - (player.y + 1));

        if (dx < 1.25 && dy < 1.45) collectCoin(coin);
    }
}

/* ================================================================
   10. MOUVEMENT ET ANIMATION
================================================================ */

function animateNina(dt) {
    if (!state.nina) return;

    const position = state.nina.getPosition();
    const targetX = state.targetLane * 3;
    const movement = Math.min(1, dt * (5 + state.sensitivity * 0.6));

    const nextX = position.x + (targetX - position.x) * movement;
    state.nina.setPosition(nextX, position.y, 0);

    if (!state.grounded) {
        state.verticalVelocity -= 23 * dt;
        let y = position.y + state.verticalVelocity * dt;

        if (y <= 0) {
            y = 0;
            state.verticalVelocity = 0;
            state.grounded = true;
        }

        state.nina.setPosition(nextX, y, 0);
    }

    if (state.sliding) {
        state.slideTimer -= dt;
        state.nina.setLocalScale(1, 0.58, 1.25);

        if (state.slideTimer <= 0) {
            state.sliding = false;
            state.nina.setLocalScale(1, 1, 1);
        }
    }

    const bob = state.grounded && !state.sliding
        ? Math.sin(state.elapsed * 13) * 0.045
        : 0;

    if (state.grounded && !state.sliding) {
        state.nina.setPosition(nextX, bob, 0);
    }

    if (state.invulnerable > 0) {
        state.invulnerable -= dt;
        state.nina.enabled = Math.floor(state.elapsed * 14) % 2 === 0;
    } else {
        state.nina.enabled = true;
    }

    if (state.ninaParts.length >= 6) {
        const swing = Math.sin(state.elapsed * 12) * 28;
        state.ninaParts[2].setLocalEulerAngles(swing, 0, 0);
        state.ninaParts[3].setLocalEulerAngles(-swing, 0, 0);
        state.ninaParts[4].setLocalEulerAngles(-swing, 0, 0);
        state.ninaParts[5].setLocalEulerAngles(swing, 0, 0);
    }
}

function animateWorld(dt) {
    for (const item of state.coins) {
        if (!item.collected && item.entity && !item.entity.destroyed) {
            const rotation = item.entity.getLocalEulerAngles();
            item.entity.setLocalEulerAngles(rotation.x, rotation.y + dt * 140, rotation.z);
        }
    }

    for (const item of state.decorations) {
        if (!item || item.destroyed) continue;
        const position = item.getPosition();

        if (position.z > 15) {
            item.setPosition(position.x, position.y, position.z - 300);
        }
    }
}

function updateGame(dt) {
    if (!state.ready) return;

    dt = Math.min(dt, 0.05);
    state.elapsed += dt;

    if (state.started && !state.paused && !state.gameOver && !state.completed) {
        const mission = currentMission();

        state.distance += state.runSpeed * dt;
        state.missionDistance = state.distance;
        state.score += Math.floor(state.runSpeed * dt * 0.5);

        state.spawnCursor -= state.runSpeed * dt;
        state.coinCursor -= state.runSpeed * dt;

        /*
          Les entités du parcours sont placées dans l'espace devant NINA.
          Le monde se déplace vers le joueur, ce qui permet un runner
          continu sans déplacer le joueur dans un monde infini.
        */
        const movement = state.runSpeed * dt;

        for (const obstacle of state.obstacles) {
            obstacle.z += movement;
            obstacle.entity.setPosition(obstacle.lane * 3, obstacle.entity.getPosition().y, obstacle.z);
        }

        for (const coin of state.coins) {
            coin.z += movement;
            const p = coin.entity.getPosition();
            coin.entity.setPosition(coin.lane * 3, p.y, coin.z);
        }

        spawnAhead();
        animateNina(dt);
        checkCollisions(dt);
        cleanupObjects();

        if (state.missionDistance >= mission.distance) {
            completeMission();
        }

        if (Date.now() - state.lastHudUpdate > 120) {
            updateHud();
            state.lastHudUpdate = Date.now();
        }

        if (Date.now() - state.lastSave > 45000) {
            saveGame();
        }
    } else {
        animateNina(dt * 0.4);
    }

    animateWorld(dt);
    updateCamera(dt);
}

/* ================================================================
   11. PROGRESSION, VICTOIRE ET GAME OVER
================================================================ */

function completeMission() {
    if (state.completed || state.gameOver) return;

    state.completed = true;
    state.paused = true;
    state.started = false;

    const mission = currentMission();
    const distanceRatio = clamp(state.distance / mission.distance, 0, 1);
    const coinRatio = mission.coinTarget > 0
        ? clamp(state.missionCoins / mission.coinTarget, 0, 1)
        : 1;

    state.stars = 1;
    if (distanceRatio >= 1 && coinRatio >= 0.5) state.stars = 2;
    if (distanceRatio >= 1 && coinRatio >= 1 && state.lives >= 2) state.stars = 3;

    state.score += mission.reward + state.stars * 50;
    state.bestScore = Math.max(state.bestScore, state.score);

    if (!state.completedMissions.includes(mission.number)) {
        state.completedMissions.push(mission.number);
    }

    state.unlockedMission = Math.max(
        state.unlockedMission,
        Math.min(state.missionIndex + 1, MISSION_DEFINITIONS.length - 1)
    );

    for (const item of MISSION_DEFINITIONS) {
        item.completed = state.completedMissions.includes(item.number);
        item.unlocked = item.number - 1 <= state.unlockedMission;
    }

    setText("completeDescription", `${mission.name} terminée ! Récompense : ${mission.reward} points.`);
    setText("missionFinalScore", state.score);
    setText("missionFinalCoins", state.missionCoins);
    setText("missionFinalStars", `${state.stars} / 3`);

    const nextButton = $("nextMissionButton");
    if (nextButton) {
        nextButton.textContent = state.missionIndex + 1 < MISSION_DEFINITIONS.length
            ? "MISSION SUIVANTE"
            : "TOUTES LES MISSIONS TERMINÉES";
        nextButton.disabled = state.missionIndex + 1 >= MISSION_DEFINITIONS.length;
    }

    show("missionCompletePanel");
    hide("pausePanel");

    notify("Mission réussie !", 3000);
    playTone(700, 0.18);
    setTimeout(() => playTone(940, 0.2), 140);
    vibrate([40, 50, 80]);

    updateHud();
    renderMissions();
    saveGame();
}

function endGame() {
    state.gameOver = true;
    state.started = false;
    state.paused = true;

    state.bestScore = Math.max(state.bestScore, state.score);

    setText("gameOverScore", state.score);
    setText("gameOverBest", state.bestScore);

    show("gameOverPanel");
    notify("Course terminée. Essayez encore !");
    playTone(100, 0.4, "sawtooth");
    saveGame();
}

/* ================================================================
   12. HUD ET LISTE DES MISSIONS
================================================================ */

function updateHud() {
    const mission = currentMission();
    const progress = clamp(state.distance / mission.distance * 100, 0, 100);

    setText("currentMission", `${String(state.missionIndex + 1).padStart(2, "0")} / ${MISSION_DEFINITIONS.length}`);
    setText("scoreValue", state.score.toLocaleString("fr-FR"));
    setText("coinsValue", state.coins.toLocaleString("fr-FR"));
    setText("livesValue", `${"❤ ".repeat(state.lives).trim()}${state.lives === 0 ? "—" : ""}`);
    setText("missionName", mission.name);
    setText("missionProgressText", `${Math.floor(progress)} %`);
    setText("objectiveText", mission.objective);
    setText("inventoryCoins", state.coins);

    const bar = $("missionProgressBar");
    if (bar) bar.style.width = `${progress}%`;

    const track = $("missionProgressTrack");
    if (track) track.setAttribute("aria-valuenow", String(Math.floor(progress)));

    renderInventory();
}

function renderMissions() {
    const list = $("missionsList");
    if (!list) return;

    list.replaceChildren();

    const summary = $("missionsSummary");
    if (summary) {
        summary.textContent =
            `${state.completedMissions.length} mission(s) terminée(s) sur ${MISSION_DEFINITIONS.length}.`;
    }

    const filtered = MISSION_DEFINITIONS.filter((mission) => {
        if (state.missionFilter === "available") {
            return mission.number - 1 <= state.unlockedMission &&
                !state.completedMissions.includes(mission.number);
        }

        if (state.missionFilter === "completed") {
            return state.completedMissions.includes(mission.number);
        }

        return true;
    });

    for (const mission of filtered) {
        const unlocked = mission.number - 1 <= state.unlockedMission;
        const completed = state.completedMissions.includes(mission.number);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "mission-list-item";
        button.dataset.missionIndex = String(mission.number - 1);
        button.disabled = !unlocked;

        if (completed) button.classList.add("completed");
        if (mission.number - 1 === state.selectedMission) button.classList.add("selected");
        if (!unlocked) button.classList.add("locked");

        const heading = document.createElement("strong");
        heading.textContent = `${String(mission.number).padStart(2, "0")}. ${mission.name}`;

        const detail = document.createElement("small");
        detail.textContent = unlocked
            ? `${mission.distance} m · ${mission.coinTarget} pièces · ${completed ? "Terminée ✓" : "Disponible"}`
            : "🔒 Terminez les missions précédentes";

        button.append(heading, detail);
        button.addEventListener("click", () => {
            if (!selectMission(mission.number - 1)) return;

            for (const item of list.querySelectorAll(".mission-list-item")) {
                item.classList.toggle(
                    "selected",
                    Number(item.dataset.missionIndex) === state.selectedMission
                );
            }
        });

        list.appendChild(button);
    }
}

function renderInventory() {
    const list = $("inventoryList");
    if (!list) return;

    list.replaceChildren();

    const rows = [
        ["Pièces d'or", state.coins, "Récompenses de course"],
        ["Score total", state.score, "Points cumulés"],
        ["Missions terminées", state.completedMissions.length, "Défis accomplis"],
        ["Meilleur score", state.bestScore, "Record personnel"]
    ];

    for (const [name, value, description] of rows) {
        const row = document.createElement("div");
        row.className = "inventory-item";

        const title = document.createElement("strong");
        title.textContent = name;

        const detail = document.createElement("small");
        detail.textContent = description;

        const amount = document.createElement("b");
        amount.textContent = Number(value).toLocaleString("fr-FR");

        row.append(title, detail, amount);
        list.appendChild(row);
    }
}

/* ================================================================
   13. PANNEAUX ET ACTIONS HTML
================================================================ */

function openPanel(panelId) {
    const allPanels = [
        "missionsPanel",
        "settingsPanel",
        "inventoryPanel",
        "helpPanel",
        "systemPanel",
        "confirmPanel"
    ];

    for (const id of allPanels) {
        if (id !== panelId) hide(id);
    }

    hide("sideMenu");
    show(panelId);

    if (panelId === "missionsPanel") renderMissions();
    if (panelId === "inventoryPanel") renderInventory();
    if (panelId === "systemPanel") updateSystemStatus();
}

function openMenu() {
    state.menuOpen = true;
    toggle("sideMenu");
}

function closeMenu() {
    state.menuOpen = false;
    hide("sideMenu");
}

function updateSystemStatus() {
    setText(
        "databaseStatus",
        state.database
            ? "Base de données : connectée."
            : "Base de données : stockage local de secours disponible."
    );
}

function openConfirm(message, callback) {
    setText("confirmMessage", message);
    state.confirmAction = callback;
    openPanel("confirmPanel");
}

async function initializeGame() {
    openConfirm(
        "Réinitialiser la progression ? Cette action effacera les scores et les missions terminées.",
        async () => {
            state.score = 0;
            state.coins = 0;
            state.lives = 3;
            state.bestScore = 0;
            state.missionIndex = 0;
            state.selectedMission = 0;
            state.unlockedMission = 0;
            state.completedMissions = [];

            for (const mission of MISSION_DEFINITIONS) {
                mission.completed = false;
                mission.unlocked = mission.number === 1;
            }

            try {
                localStorage.removeItem(SAVE_KEY);
            } catch (_) {}

            try {
                if (state.database) {
                    await new Promise((resolve, reject) => {
                        const transaction = state.database.transaction(STORE_NAME, "readwrite");
                        transaction.objectStore(STORE_NAME).delete(SAVE_KEY);
                        transaction.oncomplete = resolve;
                        transaction.onerror = () => reject(transaction.error);
                    });
                }
            } catch (error) {
                console.warn("Suppression IndexedDB incomplète :", error);
            }

            hide("confirmPanel");
            prepareMission(0, false);
            state.started = false;
            state.paused = true;
            show("startPanel");
            updateHud();
            renderMissions();
            notify("Nouvelle partie initialisée");
        }
    );
}

function exportSave() {
    const data = JSON.stringify(serializeState(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "nina-jumper-sauvegarde.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Export de la sauvegarde lancé");
}

function importSave() {
    const input = $("importSaveFile");
    if (!input) return;

    input.value = "";
    input.click();
}

async function handleImportFile(file) {
    if (!file) return;

    try {
        const textContent = await file.text();
        const data = JSON.parse(textContent);

        openConfirm(
            "Importer cette sauvegarde remplacera la progression actuelle. Continuer ?",
            async () => {
                try {
                    applySave(data);
                    await saveGame();

                    hide("confirmPanel");
                    prepareMission(state.missionIndex, true);
                    state.started = false;
                    state.paused = true;

                    updateHud();
                    renderMissions();
                    show("startPanel");
                    notify("Sauvegarde importée avec succès");
                } catch (error) {
                    console.error(error);
                    notify("Impossible d'importer ce fichier");
                }
            }
        );
    } catch (error) {
        console.error(error);
        notify("Fichier JSON invalide");
    }
}

function applySettings() {
    const quality = $("qualitySelect");
    const sensitivity = $("sensitivityRange");
    const volume = $("volumeRange");
    const sound = $("soundEnabled");
    const vibration = $("vibrationEnabled");

    if (quality) state.quality = quality.value;
    if (sensitivity) state.sensitivity = Number(sensitivity.value);
    if (volume) state.soundVolume = Number(volume.value) / 100;
    if (sound) state.soundEnabled = sound.checked;
    if (vibration) state.vibrationEnabled = vibration.checked;

    updateHud();
    saveGame();
    hide("settingsPanel");
    notify("Paramètres appliqués");
}

function toggleSound() {
    state.soundEnabled = !state.soundEnabled;

    const checkbox = $("soundEnabled");
    if (checkbox) checkbox.checked = state.soundEnabled;

    const button = $("soundButton");
    if (button) button.textContent = state.soundEnabled ? "♫" : "🔇";

    notify(state.soundEnabled ? "Son activé" : "Son désactivé");
    if (state.soundEnabled) playTone(660, 0.08);
}

async function toggleFullscreen() {
    try {
        if (!document.fullscreenElement) {
            const target = $("appJumper") || document.documentElement;
            if (target.requestFullscreen) await target.requestFullscreen();
        } else if (document.exitFullscreen) {
            await document.exitFullscreen();
        }
    } catch (error) {
        notify("Le plein écran n'est pas disponible sur ce navigateur");
    }

    resizeCanvas();
}

/* ================================================================
   14. ROUTAGE DES BOUTONS data-action
================================================================ */

function handleAction(action, button) {
    switch (action) {
        case "toggle-menu":
            openMenu();
            break;

        case "close-menu":
            closeMenu();
            break;

        case "save":
            saveGame();
            break;

        case "pause":
            pauseGame();
            break;

        case "resume":
            resumeGame();
            break;

        case "start-game":
            startGame();
            break;

        case "continue-game":
            continueGame();
            break;

        case "move-left":
            moveLeft();
            break;

        case "move-right":
            moveRight();
            break;

        case "jump":
            jump();
            break;

        case "slide":
            slide();
            break;

        case "zoom-in":
            zoomIn();
            break;

        case "zoom-out":
            zoomOut();
            break;

        case "zoom-reset":
            resetZoom();
            break;

        case "rotate-camera":
            rotateCamera();
            break;

        case "open-missions":
            openPanel("missionsPanel");
            break;

        case "start-selected-mission":
            if (selectMission(state.selectedMission)) {
                prepareMission(state.selectedMission, true);
            }
            break;

        case "filter-missions":
            state.missionFilter = button.dataset.filter || "all";
            renderMissions();
            break;

        case "open-inventory":
            openPanel("inventoryPanel");
            break;

        case "open-settings":
            openPanel("settingsPanel");
            break;

        case "open-help":
            openPanel("helpPanel");
            break;

        case "open-system":
            openPanel("systemPanel");
            break;

        case "close-panel":
            hide(button.dataset.panel);
            break;

        case "apply-settings":
            applySettings();
            break;

        case "toggle-sound":
            toggleSound();
            break;

        case "fullscreen":
            toggleFullscreen();
            break;

        case "return-home":
            returnHome();
            break;

        case "restart-mission":
            restartMission();
            break;

        case "next-mission":
            nextMission();
            break;

        case "export-save":
            exportSave();
            break;

        case "import-save":
            importSave();
            break;

        case "initialize":
            initializeGame();
            break;

        case "confirm-yes": {
            const callback = state.confirmAction;
            state.confirmAction = null;
            if (typeof callback === "function") callback();
            break;
        }

        case "confirm-no":
            state.confirmAction = null;
            hide("confirmPanel");
            break;

        default:
            console.info("Action non reconnue :", action);
    }
}

/* ================================================================
   15. GESTES TACTILES ANDROID : SWIPE ET PINCH
================================================================ */

function pointerDistance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function bindGestures() {
    const gameScreen = $("gameScreen");
    const gestureSurface = $("gestureSurface");
    const canvas = $("jumperCanvas");

    if (!gameScreen) return;

    const eventSurface = gestureSurface || canvas || gameScreen;

    eventSurface.addEventListener("pointerdown", (event) => {
        if (event.target.closest("button, input, select, textarea, a")) return;

        state.pointerMap.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
            startX: event.clientX,
            startY: event.clientY
        });

        if (state.pointerMap.size === 1) {
            state.swipeStart = {
                x: event.clientX,
                y: event.clientY,
                time: performance.now()
            };
        }

        if (state.pointerMap.size === 2) {
            const points = [...state.pointerMap.values()];
            state.pinchStartDistance = pointerDistance(points[0], points[1]);
            state.pinchStartZoom = state.cameraDistance;
            state.swipeStart = null;
        }

        try {
            eventSurface.setPointerCapture(event.pointerId);
        } catch (_) {}
    }, { passive: true });

    eventSurface.addEventListener("pointermove", (event) => {
        const point = state.pointerMap.get(event.pointerId);
        if (!point) return;

        point.x = event.clientX;
        point.y = event.clientY;

        if (state.pointerMap.size >= 2) {
            const points = [...state.pointerMap.values()];
            const distance = pointerDistance(points[0], points[1]);

            if (state.pinchStartDistance > 0) {
                const change = (state.pinchStartDistance - distance) * 0.025;
                state.cameraDistance = clamp(state.pinchStartZoom + change, 5, 18);
            }

            event.preventDefault();
        }
    }, { passive: false });

    const finishPointer = (event) => {
        const point = state.pointerMap.get(event.pointerId);

        if (point && state.pointerMap.size === 1 && state.swipeStart) {
            const dx = event.clientX - state.swipeStart.x;
            const dy = event.clientY - state.swipeStart.y;
            const elapsed = performance.now() - state.swipeStart.time;

            if (elapsed < 650 && Math.max(Math.abs(dx), Math.abs(dy)) > 35) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    dx < 0 ? moveLeft() : moveRight();
                } else if (dy < 0) {
                    jump();
                } else {
                    slide();
                }
            }
        }

        state.pointerMap.delete(event.pointerId);

        if (state.pointerMap.size < 2) {
            state.pinchStartDistance = 0;
            state.swipeStart = null;
        }
    };

    eventSurface.addEventListener("pointerup", finishPointer, { passive: true });
    eventSurface.addEventListener("pointercancel", finishPointer, { passive: true });

    /*
      Les boutons restent utilisables même si le navigateur ne fournit
      pas pointer events. Les gestes sont limités à la surface du jeu.
    */
}

/* ================================================================
   16. CLAVIER, ACCESSIBILITÉ ET PARAMÈTRES
================================================================ */

function bindKeyboard() {
    document.addEventListener("keydown", (event) => {
        if (event.repeat) return;

        switch (event.key) {
            case "ArrowLeft":
            case "a":
            case "A":
                event.preventDefault();
                moveLeft();
                break;

            case "ArrowRight":
            case "d":
            case "D":
                event.preventDefault();
                moveRight();
                break;

            case "ArrowUp":
            case " ":
                event.preventDefault();
                jump();
                break;

            case "ArrowDown":
            case "s":
            case "S":
                event.preventDefault();
                slide();
                break;

            case "Escape":
                if (!state.paused) pauseGame();
                else {
                    hide("pausePanel");
                    hide("sideMenu");
                }
                break;

            case "+":
            case "=":
                zoomIn();
                break;

            case "-":
                zoomOut();
                break;
        }
    });
}

function bindSettingsInputs() {
    const sensitivity = $("sensitivityRange");
    const volume = $("volumeRange");

    if (sensitivity) {
        sensitivity.addEventListener("input", () => {
            setText("sensitivityValue", sensitivity.value);
            state.sensitivity = Number(sensitivity.value);
        });
    }

    if (volume) {
        volume.addEventListener("input", () => {
            setText("volumeValue", `${volume.value} %`);
            state.soundVolume = Number(volume.value) / 100;
        });
    }

    const sound = $("soundEnabled");
    if (sound) {
        sound.addEventListener("change", () => {
            state.soundEnabled = sound.checked;
        });
    }

    const vibration = $("vibrationEnabled");
    if (vibration) {
        vibration.addEventListener("change", () => {
            state.vibrationEnabled = vibration.checked;
        });
    }

    const quality = $("qualitySelect");
    if (quality) quality.addEventListener("change", () => {
        state.quality = quality.value;
    });

    const importInput = $("importSaveFile");
    if (importInput) {
        importInput.addEventListener("change", () => {
            handleImportFile(importInput.files?.[0]);
        });
    }
}

function bindButtons() {
    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action]");
        if (!button || button.disabled) return;

        const action = button.dataset.action;
        if (!action) return;

        handleAction(action, button);
    });
}

/* ================================================================
   17. DÉMARRAGE ET GESTION DES ERREURS
================================================================ */

function applyLoadedSettings() {
    const quality = $("qualitySelect");
    const sensitivity = $("sensitivityRange");
    const volume = $("volumeRange");
    const sound = $("soundEnabled");
    const vibration = $("vibrationEnabled");

    if (quality) quality.value = state.quality;
    if (sensitivity) sensitivity.value = String(state.sensitivity);
    if (volume) volume.value = String(Math.round(state.soundVolume * 100));
    if (sound) sound.checked = state.soundEnabled;
    if (vibration) vibration.checked = state.vibrationEnabled;

    setText("sensitivityValue", state.sensitivity);
    setText("volumeValue", `${Math.round(state.soundVolume * 100)} %`);
}

function bindLifecycle() {
    document.addEventListener("visibilitychange", () => {
        if (document.hidden && state.started && !state.paused) {
            pauseGame();
        }
    });

    document.addEventListener("fullscreenchange", resizeCanvas);

    if ("ResizeObserver" in globalThis) {
        const observer = new ResizeObserver(resizeCanvas);
        const app = $("appJumper");
        if (app) observer.observe(app);
    } else {
        document.addEventListener("orientationchange", resizeCanvas);
        document.addEventListener("resize", resizeCanvas);
    }
}

async function boot() {
    if (state.initialized) return;
    state.initialized = true;

    try {
        setLoading(5, "Chargement du moteur PlayCanvas...");

        bindButtons();
        bindGestures();
        bindKeyboard();
        bindSettingsInputs();
        bindLifecycle();

        const pc = await import(PLAYCANVAS_MODULE);
        state.pc = pc;

        setLoading(25, "Préparation des données...");
        try {
            state.database = await openDatabase();
        } catch (error) {
            console.info("Mode de stockage de secours activé.");
        }

        await loadGame();
        applyLoadedSettings();

        setLoading(45, "Création de l'univers 3D...");
        setupScene();

        setLoading(78, "Préparation des missions...");
        for (const mission of MISSION_DEFINITIONS) {
            mission.completed = state.completedMissions.includes(mission.number);
            mission.unlocked = mission.number - 1 <= state.unlockedMission;
        }

        renderMissions();
        renderInventory();
        updateHud();
        updateSystemStatus();

        prepareMission(state.missionIndex, true);
        state.started = false;
        state.paused = true;

        setLoading(100, "Prêt à jouer !");
        state.ready = true;

        setTimeout(() => {
            hide("loadingScreen");
            show("startPanel");
            notify("Bienvenue dans NINA JUMPER 3D !");
        }, 350);
    } catch (error) {
        console.error("Erreur au démarrage de NINA JUMPER 3D :", error);

        setLoading(100, "Le démarrage a échoué.");
        setText(
            "loadingMessage",
            "Impossible de charger le jeu. Vérifiez la connexion et la console du navigateur."
        );

        const message = document.createElement("p");
        message.className = "startup-error";
        message.textContent = `Erreur : ${error?.message || "initialisation impossible"}`;

        const loading = $("loadingScreen");
        if (loading) loading.appendChild(message);
    }
}

/* ================================================================
   18. API DU JEU
================================================================ */

export const NinaJumper = {
    start: startGame,
    pause: pauseGame,
    resume: resumeGame,
    save: saveGame,
    load: loadGame,
    restartMission,
    nextMission,
    addMission,
    getMissions,
    getMission,
    get state() {
        return {
            started: state.started,
            paused: state.paused,
            missionIndex: state.missionIndex,
            score: state.score,
            coins: state.coins,
            lives: state.lives,
            unlockedMission: state.unlockedMission,
            totalMissions: MISSION_DEFINITIONS.length
        };
    }
};

boot();
