/* ============================================================
   NINA JUMPER 3D — ENGINE PRINCIPAL
   ES MODULES • PLAYCANVAS • ANDROID TOUCH
   Version 1.0
   ============================================================
   Architecture:
   - import() dynamique de PlayCanvas
   - export pour les extensions futures
   - 50 missions progressives
   - Runner automatique, saut et glissade
   - Contrôles tactiles et pinch-to-zoom
   - Sauvegarde locale, import/export JSON
   - Gestion centralisée des data-action
   - Nettoyage et protection des événements
   ============================================================ */

const VERSION = "1.0.0";
const SAVE_KEY = "nina-jumper-3d-save-v1";
const SETTINGS_KEY = "nina-jumper-3d-settings-v1";

const $ = (id) => document.getElementById(id);

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rand = (min, max) => min + Math.random() * (max - min);
const choice = (items) => items[Math.floor(Math.random() * items.length)];

const LANES = [-2.2, 0, 2.2];

const MISSION_THEMES = [
    "La forêt lumineuse",
    "Le pont suspendu",
    "La vallée des cristaux",
    "Le temple oublié",
    "La route des étoiles",
    "Le canyon doré",
    "Les jardins célestes",
    "La cité futuriste",
    "Le désert mystérieux",
    "La montagne de glace",
    "La rivière magique",
    "Le tunnel des ombres",
    "Les ruines anciennes",
    "La jungle secrète",
    "Le volcan rouge",
    "Le royaume des nuages",
    "La grotte turquoise",
    "La ville des robots",
    "Le labyrinthe vert",
    "Le palais de cristal",
    "La piste arc-en-ciel",
    "La cascade géante",
    "Le passage des dragons",
    "La cité sous-marine",
    "La tour du vent",
    "Le désert électrique",
    "La vallée des géants",
    "Le jardin des lunes",
    "La forteresse volante",
    "Le chemin des comètes",
    "La jungle des géants",
    "Le temple du tonnerre",
    "La route des mirages",
    "Le glacier éternel",
    "La cité des flammes",
    "Le pont des tempêtes",
    "Le royaume mécanique",
    "La forêt des illusions",
    "Le canyon des lumières",
    "La pyramide secrète",
    "Le sanctuaire céleste",
    "La vallée des tempêtes",
    "Le labyrinthe de lave",
    "Le palais des vents",
    "La course des étoiles",
    "Le monde des titans",
    "La citadelle du soleil",
    "Le passage dimensionnel",
    "Le dernier défi",
    "La légende de NINA"
];

const MISSION_OBJECTIVES = [
    "Terminez la course en évitant les obstacles.",
    "Ramassez des pièces et franchissez la ligne d'arrivée.",
    "Sautez au-dessus des barrières et esquivez les pièges.",
    "Enchaînez les sauts et les glissades avec précision.",
    "Survivez à cette course et obtenez trois étoiles."
];

/* ------------------------------------------------------------
   MISSIONS EXTENSIBLES
   Ajoutez une mission avec registerMission().
   Chaque mission possède ses propres paramètres.
------------------------------------------------------------ */

export const missionRegistry = [];

export function registerMission(mission) {
    if (!mission || typeof mission !== "object") {
        throw new TypeError("Une mission doit être un objet.");
    }

    if (!mission.name || !String(mission.name).trim()) {
        throw new Error("Le nom de la mission est obligatoire.");
    }

    const id = mission.id || `custom-${Date.now()}-${missionRegistry.length}`;

    if (missionRegistry.some((item) => item.id === id)) {
        throw new Error(`Mission déjà enregistrée : ${id}`);
    }

    const normalized = {
        id,
        name: String(mission.name),
        description: String(
            mission.description || "Terminez le parcours."
        ),
        distance: Math.max(30, Number(mission.distance) || 100),
        speed: clamp(Number(mission.speed) || 12, 6, 30),
        obstacleRate: clamp(Number(mission.obstacleRate) || 1.4, 0.6, 4),
        coinRate: clamp(Number(mission.coinRate) || 0.9, 0.3, 3),
        reward: Math.max(0, Number(mission.reward) || 100),
        color: mission.color || "#29d9ff",
        ...mission,
        id
    };

    missionRegistry.push(normalized);
    return normalized;
}

for (let i = 0; i < 50; i++) {
    const difficulty = i / 49;

    registerMission({
        id: `mission-${i + 1}`,
        index: i,
        name: MISSION_THEMES[i],
        description:
            `${MISSION_OBJECTIVES[i % MISSION_OBJECTIVES.length]} ` +
            `Distance : ${Math.round(150 + i * 32)} mètres.`,
        distance: Math.round(150 + i * 32),
        speed: 10 + difficulty * 9,
        obstacleRate: 1.9 - difficulty * 0.85,
        coinRate: 1.15 - difficulty * 0.25,
        reward: 100 + i * 30,
        color: `hsl(${185 + i * 3.2}, 85%, 58%)`,
        difficulty: i + 1
    });
}

/* ------------------------------------------------------------
   ÉTAT CENTRAL
------------------------------------------------------------ */

export const state = {
    ready: false,
    running: false,
    paused: false,
    gameOver: false,
    completed: false,

    missionIndex: 0,
    selectedMission: 0,
    completedMissions: [],
    bestScores: {},

    score: 0,
    coins: 0,
    totalCoins: 0,
    lives: 3,

    distance: 0,
    elapsed: 0,
    obstacleTimer: 0,
    coinTimer: 0,
    invulnerable: 0,
    slideTimer: 0,
    jumpVelocity: 0,
    jumpHeight: 0,

    lane: 1,
    targetLane: 1,
    cameraZoom: 1,
    cameraRotation: 0,

    quality: "medium",
    sensitivity: 5,
    volume: 60,
    soundEnabled: true,
    vibrationEnabled: true,

    app: null,
    pc: null,
    canvas: null,
    camera: null,
    player: null,
    playerBody: null,
    playerHead: null,
    road: null,
    ground: null,
    obstacles: [],
    collectibles: [],
    scenery: [],
    roadSegments: [],

    rafActive: false,
    lastFrame: 0,
    lastSave: 0,
    pendingConfirmation: null,
    selectedFilter: "all",
    audioContext: null,
    destroyed: false
};

const cleanupCallbacks = [];
const actionHandlers = new Map();

function onCleanup(fn) {
    cleanupCallbacks.push(fn);
}

function addEvent(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    onCleanup(() => target.removeEventListener(type, handler, options));
}

function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = String(value);
}

function showPanel(id) {
    const panel = $(id);
    if (panel) panel.classList.remove("hidden");
}

function hidePanel(id) {
    const panel = $(id);
    if (panel) panel.classList.add("hidden");
}

function hideAllPanels() {
    [
        "pausePanel",
        "missionsPanel",
        "missionCompletePanel",
        "gameOverPanel",
        "settingsPanel",
        "inventoryPanel",
        "helpPanel",
        "systemPanel",
        "confirmPanel"
    ].forEach(hidePanel);

    hidePanel("sideMenu");
}

function notify(message, duration = 2500) {
    const el = $("gameNotification");
    if (!el) return;

    el.textContent = message;
    el.classList.add("visible");
    el.setAttribute("aria-live", "polite");

    if (notify.timer) clearTimeout(notify.timer);

    notify.timer = setTimeout(() => {
        el.classList.remove("visible");
    }, duration);
}

/* ------------------------------------------------------------
   CHARGEMENT PLAYCANVAS
------------------------------------------------------------ */

async function loadPlayCanvas() {
    setLoading(12, "Chargement du moteur PlayCanvas...");

    const pc = await import(
        "https://cdn.jsdelivr.net/npm/playcanvas@2.14.4/+esm"
    );

    if (!pc.Application || !pc.Entity || !pc.Color) {
        throw new Error("Le module PlayCanvas est incomplet.");
    }

    state.pc = pc;
    return pc;
}

function setLoading(percent, message) {
    const progress = $("loadingProgress");
    const label = $("loadingPercent");

    if (progress) {
        progress.style.width = `${clamp(percent, 0, 100)}%`;
    }

    if (label) {
        label.textContent = `${Math.round(percent)} %`;
    }

    setText("loadingMessage", message);
}

function hideLoading() {
    const screen = $("loadingScreen");

    if (screen) {
        screen.classList.add("loaded");
        screen.setAttribute("aria-hidden", "true");
    }
}

/* ------------------------------------------------------------
   MATÉRIAUX ET ENTITÉS 3D
------------------------------------------------------------ */

function createMaterial(color, options = {}) {
    const pc = state.pc;
    const material = new pc.StandardMaterial();

    material.diffuse = new pc.Color(
        options.r ?? 0.1,
        options.g ?? 0.8,
        options.b ?? 1
    );

    if (Array.isArray(color)) {
        material.diffuse = new pc.Color(
            color[0],
            color[1],
            color[2]
        );
    }

    material.emissive = options.emissive
        ? new pc.Color(
            options.emissive[0],
            options.emissive[1],
            options.emissive[2]
        )
        : new pc.Color(0, 0, 0);

    material.metalness = options.metalness ?? 0.05;
    material.gloss = options.gloss ?? 45;
    material.update();

    return material;
}

function makeBox(name, position, scale, material, parent = null) {
    const pc = state.pc;
    const entity = new pc.Entity(name);

    entity.addComponent("render", { type: "box" });

    entity.setLocalScale(scale[0], scale[1], scale[2]);
    entity.setPosition(position[0], position[1], position[2]);

    if (material) entity.render.material = material;

    (parent || state.app.root).addChild(entity);
    return entity;
}

function makeSphere(name, position, scale, material, parent = null) {
    const pc = state.pc;
    const entity = new pc.Entity(name);

    entity.addComponent("render", { type: "sphere" });
    entity.setLocalScale(scale[0], scale[1], scale[2]);
    entity.setPosition(position[0], position[1], position[2]);

    if (material) entity.render.material = material;

    (parent || state.app.root).addChild(entity);
    return entity;
}

function setupScene() {
    const pc = state.pc;
    const canvas = $("jumperCanvas");

    if (!canvas) {
        throw new Error("Le canvas #jumperCanvas est introuvable.");
    }

    state.canvas = canvas;

    const app = new pc.Application(canvas, {
        graphicsDeviceOptions: {
            antialias: true,
            alpha: false,
            depth: true,
            stencil: false,
            powerPreference: "high-performance"
        },
        keyboard: false,
        mouse: false,
        touch: false
    });

    state.app = app;

    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);

    const camera = new pc.Entity("NINA_CAMERA");

    camera.addComponent("camera", {
        clearColor: new pc.Color(0.025, 0.055, 0.12),
        fov: 60,
        nearClip: 0.1,
        farClip: 250
    });

    camera.setPosition(0, 5.5, 10);
    camera.lookAt(0, 1.3, -8);
    app.root.addChild(camera);

    state.camera = camera;

    const light = new pc.Entity("MAIN_LIGHT");

    light.addComponent("light", {
        type: "directional",
        color: new pc.Color(1, 0.94, 0.82),
        intensity: 1.7,
        castShadows: false
    });

    light.setEulerAngles(42, 25, 0);
    app.root.addChild(light);

    const fillLight = new pc.Entity("FILL_LIGHT");

    fillLight.addComponent("light", {
        type: "omni",
        color: new pc.Color(0.2, 0.55, 1),
        intensity: 0.65,
        range: 35
    });

    fillLight.setPosition(-5, 6, 2);
    app.root.addChild(fillLight);

    const floorMaterial = createMaterial([0.035, 0.09, 0.15], {
        metalness: 0.15
    });

    const roadMaterial = createMaterial([0.06, 0.13, 0.2], {
        metalness: 0.25
    });

    const edgeMaterial = createMaterial([0.05, 0.75, 1], {
        emissive: [0.01, 0.22, 0.4]
    });

    state.ground = makeBox(
        "WORLD_GROUND",
        [0, -0.4, -40],
        [200, 0.4, 220],
        floorMaterial
    );

    state.road = makeBox(
        "RUNWAY",
        [0, -0.12, -45],
        [7.4, 0.16, 120],
        roadMaterial
    );

    for (const x of [-3.65, 3.65]) {
        makeBox(
            "RUNWAY_EDGE",
            [x, -0.02, -45],
            [0.12, 0.1, 120],
            edgeMaterial
        );
    }

    for (const x of [-1.1, 1.1]) {
        makeBox(
            "LANE_MARKING",
            [x, -0.025, -45],
            [0.035, 0.025, 120],
            edgeMaterial
        );
    }

    const bodyMaterial = createMaterial([0.05, 0.65, 1], {
        metalness: 0.12,
        gloss: 70
    });

    const headMaterial = createMaterial([1, 0.72, 0.52], {
        gloss: 55
    });

    const hairMaterial = createMaterial([0.12, 0.045, 0.025]);
    const accentMaterial = createMaterial([1, 0.12, 0.5], {
        emissive: [0.25, 0.015, 0.06]
    });

    state.player = new pc.Entity("NINA_PLAYER");
    app.root.addChild(state.player);

    state.playerBody = makeBox(
        "NINA_BODY",
        [0, 0.92, 0],
        [0.62, 0.95, 0.38],
        bodyMaterial,
        state.player
    );

    state.playerHead = makeSphere(
        "NINA_HEAD",
        [0, 1.68, 0],
        [0.56, 0.56, 0.52],
        headMaterial,
        state.player
    );

    makeSphere(
        "NINA_HAIR",
        [0, 1.9, -0.04],
        [0.59, 0.3, 0.54],
        hairMaterial,
        state.player
    );

    makeBox(
        "NINA_SCARF",
        [0, 1.28, -0.03],
        [0.68, 0.15, 0.43],
        accentMaterial,
        state.player
    );

    const legMaterial = createMaterial([0.08, 0.13, 0.4]);
    const shoeMaterial = createMaterial([0.96, 0.96, 1]);

    state.playerParts = [];

    for (const x of [-0.19, 0.19]) {
        const leg = makeBox(
            "NINA_LEG",
            [x, 0.28, 0],
            [0.2, 0.48, 0.24],
            legMaterial,
            state.player
        );

        makeBox(
            "NINA_SHOE",
            [x, 0.06, -0.09],
            [0.25, 0.12, 0.38],
            shoeMaterial,
            state.player
        );

        state.playerParts.push(leg);
    }

    state.player.setPosition(0, 0, 0);

    for (let i = 0; i < 20; i++) {
        const z = -i * 5 - 10;

        const left = makeBox(
            "SCENERY_LEFT",
            [-6.5 - rand(0, 3), 1.5, z],
            [rand(1, 2.5), rand(2, 5), rand(1, 2)],
            createMaterial(choice([
                [0.04, 0.25, 0.24],
                [0.08, 0.16, 0.35],
                [0.14, 0.09, 0.3]
            ]))
        );

        const right = makeBox(
            "SCENERY_RIGHT",
            [6.5 + rand(0, 3), 1.5, z - 2],
            [rand(1, 2.5), rand(2, 5), rand(1, 2)],
            createMaterial(choice([
                [0.04, 0.25, 0.24],
                [0.08, 0.16, 0.35],
                [0.14, 0.09, 0.3]
            ]))
        );

        state.scenery.push(left, right);
    }

    app.on("update", updateGame);
    app.start();

    applyQuality();
    resizeCanvas();
}

/* ------------------------------------------------------------
   OBJETS DE COURSE : OBSTACLES ET PIÈCES
------------------------------------------------------------ */

function clearObjects(list) {
    for (const item of list) {
        if (item.entity && !item.entity.destroyed) {
            item.entity.destroy();
        }
    }

    list.length = 0;
}

function spawnObstacle() {
    if (!state.app || !state.running) return;

    const pc = state.pc;
    const lane = Math.floor(Math.random() * 3);
    const type = choice(["block", "barrier", "block", "barrier"]);

    const material = type === "barrier"
        ? createMaterial([1, 0.25, 0.12], {
            emissive: [0.3, 0.025, 0.005]
        })
        : createMaterial([0.95, 0.52, 0.08], {
            metalness: 0.15
        });

    const entity = new pc.Entity(`OBSTACLE_${type}`);
    entity.addComponent("render", {
        type: type === "barrier" ? "box" : "box"
    });

    entity.setPosition(LANES[lane], type === "barrier" ? 0.55 : 0.65, -70);

    entity.setLocalScale(
        type === "barrier" ? 1.45 : 0.95,
        type === "barrier" ? 0.55 : 1.3,
        0.75
    );

    entity.render.material = material;
    state.app.root.addChild(entity);

    state.obstacles.push({
        entity,
        lane,
        type,
        z: -70,
        passed: false
    });
}

function spawnCoinLine() {
    if (!state.app || !state.running) return;

    const pc = state.pc;
    const lane = Math.floor(Math.random() * 3);
    const count = 3 + Math.floor(Math.random() * 4);

    const material = createMaterial([1, 0.78, 0.06], {
        emissive: [0.3, 0.17, 0.005],
        metalness: 0.5
    });

    for (let i = 0; i < count; i++) {
        const entity = new pc.Entity("COIN");

        entity.addComponent("render", {
            type: "cylinder"
        });

        entity.setLocalScale(0.34, 0.1, 0.34);
        entity.setEulerAngles(90, 0, 0);
        entity.setPosition(LANES[lane], 1.05, -60 - i * 1.35);
        entity.render.material = material;

        state.app.root.addChild(entity);

        state.collectibles.push({
            entity,
            lane,
            z: -60 - i * 1.35,
            collected: false
        });
    }
}

/* ------------------------------------------------------------
   GESTION DES MISSIONS
------------------------------------------------------------ */

export function getMission(index = state.missionIndex) {
    if (missionRegistry.length === 0) return null;

    return missionRegistry[
        clamp(index, 0, missionRegistry.length - 1)
    ];
}

function getUnlockedCount() {
    return Math.min(
        missionRegistry.length,
        state.completedMissions.length + 1
    );
}

function updateMissionHUD() {
    const mission = getMission();

    if (!mission) return;

    setText(
        "currentMission",
        `${String(state.missionIndex + 1).padStart(2, "0")} / ${missionRegistry.length}`
    );

    setText("missionName", mission.name);
    setText("scoreValue", state.score);
    setText("coinsValue", state.coins);
    setText("livesValue", "❤ ".repeat(Math.max(0, state.lives)).trim() || "0");

    setText(
        "objectiveText",
        `${mission.description} Distance : ${Math.floor(state.distance)} / ${mission.distance} m`
    );

    const percent = clamp(
        (state.distance / mission.distance) * 100,
        0,
        100
    );

    setText("missionProgressText", `${Math.floor(percent)} %`);

    const bar = $("missionProgressBar");
    const track = $("missionProgressTrack");

    if (bar) bar.style.width = `${percent}%`;

    if (track) {
        track.setAttribute("aria-valuenow", String(Math.floor(percent)));
    }
}

function resetMissionState() {
    state.score = 0;
    state.coins = 0;
    state.lives = 3;
    state.distance = 0;
    state.elapsed = 0;
    state.obstacleTimer = 0.5;
    state.coinTimer = 1;
    state.invulnerable = 0;
    state.slideTimer = 0;
    state.jumpVelocity = 0;
    state.jumpHeight = 0;
    state.lane = 1;
    state.targetLane = 1;
    state.gameOver = false;
    state.completed = false;

    clearObjects(state.obstacles);
    clearObjects(state.collectibles);

    if (state.player) {
        state.player.setPosition(0, 0, 0);
    }
}

export function startMission(index = state.missionIndex) {
    if (!state.ready) {
        notify("Le moteur 3D est encore en cours de chargement.");
        return false;
    }

    const mission = getMission(index);

    if (!mission) {
        notify("Aucune mission disponible.");
        return false;
    }

    if (
        index > getUnlockedCount() - 1 &&
        !state.completedMissions.includes(index - 1)
    ) {
        notify("Terminez d'abord la mission précédente.");
        return false;
    }

    state.missionIndex = index;
    state.selectedMission = index;

    resetMissionState();
    hideAllPanels();

    state.running = true;
    state.paused = false;

    setText("startMissionButton", "JOUER LA MISSION");
    notify(`Mission ${index + 1} : ${mission.name}`, 3000);

    updateMissionHUD();
    return true;
}

function finishMission() {
    if (state.completed || state.gameOver) return;

    state.running = false;
    state.completed = true;

    const index = state.missionIndex;
    const mission = getMission(index);

    if (!mission) return;

    const stars = state.lives >= 3 ? 3 : state.lives === 2 ? 2 : 1;
    const reward = mission.reward + state.coins * 2 + stars * 50;

    state.score += reward;
    state.totalCoins += state.coins;

    if (!state.completedMissions.includes(index)) {
        state.completedMissions.push(index);
    }

    state.bestScores[index] = Math.max(
        state.bestScores[index] || 0,
        state.score
    );

    setText("missionFinalScore", state.score);
    setText("missionFinalCoins", state.coins);
    setText("missionFinalStars", `${stars} / 3`);

    setText(
        "completeDescription",
        `${mission.name} terminée ! Récompense : ${reward} points.`
    );

    const next = $("nextMissionButton");

    if (next) {
        next.disabled = index >= missionRegistry.length - 1;
        next.textContent = index >= missionRegistry.length - 1
            ? "AVENTURE TERMINÉE"
            : "MISSION SUIVANTE";
    }

    showPanel("missionCompletePanel");
    updateMissionHUD();
    saveGame();

    if (index >= missionRegistry.length - 1) {
        notify("Félicitations ! Vous avez terminé les 50 missions.", 5000);
    } else {
        notify("Mission réussie ! La prochaine aventure est débloquée.");
    }
}

function endGame() {
    if (state.gameOver || state.completed) return;

    state.running = false;
    state.gameOver = true;

    const index = state.missionIndex;

    state.bestScores[index] = Math.max(
        state.bestScores[index] || 0,
        state.score
    );

    setText("gameOverScore", state.score);
    setText("gameOverBest", state.bestScores[index] || 0);

    showPanel("gameOverPanel");
    saveGame();
}

function goNextMission() {
    if (state.missionIndex >= missionRegistry.length - 1) {
        notify("Vous avez terminé toutes les missions !");
        return;
    }

    startMission(state.missionIndex + 1);
}

/* ------------------------------------------------------------
   PHYSIQUE SIMPLIFIÉE : COURSE, SAUT, GLISSADE
------------------------------------------------------------ */

function jump() {
    if (!state.running || state.paused || state.completed) return;

    if (state.jumpHeight > 0.02) return;
    if (state.slideTimer > 0) return;

    state.jumpVelocity = 8.2;
    playTone(520, 0.07);
    vibrate(10);
}

function slide() {
    if (!state.running || state.paused || state.completed) return;

    if (state.jumpHeight > 0.15) return;

    state.slideTimer = 0.72;
    playTone(260, 0.05);
    vibrate(8);
}

function moveLane(direction) {
    if (!state.running || state.paused) return;

    state.targetLane = clamp(
        state.targetLane + direction,
        0,
        2
    );
}

function updateGame(dt) {
    if (!state.ready || state.destroyed) return;

    const safeDt = clamp(dt, 0, 0.05);

    if (state.paused || !state.running) {
        updateCamera(safeDt);
        return;
    }

    const mission = getMission();

    if (!mission) return;

    state.elapsed += safeDt;
    state.invulnerable = Math.max(0, state.invulnerable - safeDt);
    state.slideTimer = Math.max(0, state.slideTimer - safeDt);

    const speed = mission.speed * (1 + state.distance / 10000);

    state.distance += speed * safeDt;

    state.obstacleTimer -= safeDt;
    state.coinTimer -= safeDt;

    if (state.obstacleTimer <= 0) {
        spawnObstacle();

        state.obstacleTimer = Math.max(
            0.58,
            mission.obstacleRate * rand(0.72, 1.28)
        );
    }

    if (state.coinTimer <= 0) {
        spawnCoinLine();

        state.coinTimer = Math.max(
            0.45,
            mission.coinRate * rand(0.7, 1.25)
        );
    }

    // Déplacement progressif entre les trois voies.
    const targetX = LANES[state.targetLane];
    const currentX = state.player.getPosition().x;
    const nextX = currentX + (targetX - currentX) * Math.min(1, safeDt * 12);

    state.player.setPosition(nextX, state.jumpHeight, 0);
    state.lane = state.targetLane;

    // Saut avec gravité.
    if (state.jumpHeight > 0 || state.jumpVelocity > 0) {
        state.jumpVelocity -= 19 * safeDt;
        state.jumpHeight += state.jumpVelocity * safeDt;

        if (state.jumpHeight <= 0) {
            state.jumpHeight = 0;
            state.jumpVelocity = 0;
        }
    }

    // Animation des jambes.
    if (state.playerParts) {
        const runningCycle = Math.sin(state.elapsed * 14) * 0.4;

        state.playerParts.forEach((leg, i) => {
            leg.setLocalPosition(
                i === 0 ? -0.19 : 0.19,
                0.28 + Math.abs(runningCycle) * 0.1,
                runningCycle * (i === 0 ? 1 : -1)
            );
        });
    }

    // Animation du corps et de la tête.
    if (state.playerBody) {
        const slideScale = state.slideTimer > 0 ? 0.52 : 1;

        state.playerBody.setLocalScale(
            0.62,
            0.95 * slideScale,
            0.38
        );

        state.playerBody.setLocalPosition(
            0,
            state.slideTimer > 0 ? 0.48 : 0.92,
            0
        );
    }

    if (state.playerHead) {
        state.playerHead.enabled = state.slideTimer <= 0;
    }

    // Avancement des obstacles et détection des collisions.
    for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obstacle = state.obstacles[i];

        obstacle.z += speed * safeDt;
        obstacle.entity.setPosition(
            LANES[obstacle.lane],
            obstacle.type === "barrier" ? 0.55 : 0.65,
            obstacle.z
        );

        const sameLane = obstacle.lane === state.targetLane;
        const close = obstacle.z > -0.9 && obstacle.z < 0.9;

        if (sameLane && close && !obstacle.passed) {
            obstacle.passed = true;

            const jumpedOver = state.jumpHeight > 0.85;
            const slidUnder =
                state.slideTimer > 0 && obstacle.type === "barrier";

            if (!jumpedOver && !slidUnder && state.invulnerable <= 0) {
                hitPlayer();
            } else {
                state.score += 15;
            }
        }

        if (obstacle.z > 8) {
            obstacle.entity.destroy();
            state.obstacles.splice(i, 1);
        }
    }

    // Pièces à collecter.
    for (let i = state.collectibles.length - 1; i >= 0; i--) {
        const coin = state.collectibles[i];

        coin.z += speed * safeDt;
        coin.entity.setPosition(
            LANES[coin.lane],
            1.05 + Math.sin(state.elapsed * 5 + i) * 0.08,
            coin.z
        );

        coin.entity.rotate(0, 180 * safeDt, 0);

        if (
            coin.lane === state.targetLane &&
            coin.z > -0.8 &&
            coin.z < 0.8 &&
            !coin.collected
        ) {
            coin.collected = true;
            state.coins++;
            state.score += 10;
            state.totalCoins++;
            playTone(880, 0.045);
            vibrate(6);
        }

        if (coin.z > 8 || coin.collected) {
            coin.entity.destroy();
            state.collectibles.splice(i, 1);
        }
    }

    // Défilement du décor.
    for (const object of state.scenery) {
        const pos = object.getPosition();

        if (pos.z > 15) {
            object.setPosition(
                pos.x,
                pos.y,
                -100 - Math.random() * 30
            );
        } else {
            object.setPosition(
                pos.x,
                pos.y,
                pos.z + speed * safeDt
            );
        }
    }

    state.score += Math.floor(speed * safeDt);

    if (state.distance >= mission.distance) {
        finishMission();
    }

    if (state.elapsed - state.lastSave > 20) {
        state.lastSave = state.elapsed;
        saveGame();
    }

    updateCamera(safeDt);
    updateMissionHUD();
}

function hitPlayer() {
    if (state.invulnerable > 0) return;

    state.lives--;
    state.invulnerable = 1.25;
    state.score = Math.max(0, state.score - 25);

    notify("Attention ! NINA a heurté un obstacle.", 1600);
    playTone(130, 0.16);
    vibrate(100);

    if (state.lives <= 0) {
        endGame();
    }
}

/* ------------------------------------------------------------
   CAMÉRA ET ZOOM
------------------------------------------------------------ */

function updateCamera(dt) {
    if (!state.camera || !state.player) return;

    const targetX = state.player.getPosition().x * 0.25;
    const cameraPosition = state.camera.getPosition();

    state.camera.setPosition(
        cameraPosition.x + (targetX - cameraPosition.x) * Math.min(1, dt * 3),
        5.5,
        10 * state.cameraZoom
    );

    state.camera.lookAt(
        targetX * 0.4,
        1.2,
        -8
    );

    if (state.cameraRotation !== 0) {
        state.camera.setEulerAngles(
            16,
            state.cameraRotation,
            0
        );
    }
}

function changeZoom(amount) {
    state.cameraZoom = clamp(
        state.cameraZoom + amount,
        0.65,
        1.8
    );

    notify(`Zoom : ${Math.round(100 / state.cameraZoom)} %`, 800);
}

function resetZoom() {
    state.cameraZoom = 1;
    state.cameraRotation = 0;
    notify("Caméra réinitialisée.");
}

function rotateCamera() {
    state.cameraRotation = (state.cameraRotation + 20) % 360;
}

/* ------------------------------------------------------------
   GESTES TACTILES ANDROID
   - Un doigt : swipe gauche/droite/haut/bas
   - Deux doigts : pinch-to-zoom
------------------------------------------------------------ */

function setupTouchGestures() {
    const surface = $("gestureSurface");
    const canvas = $("jumperCanvas");

    if (!surface || !canvas) return;

    const activeTouches = new Map();
    let pinchStartDistance = 0;
    let pinchStartZoom = 1;
    let swipeStartX = 0;
    let swipeStartY = 0;
    let gestureHandled = false;

    function distance(a, b) {
        return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }

    function getTouchPoints(event) {
        return Array.from(event.touches || []);
    }

    const start = (event) => {
        for (const touch of getTouchPoints(event)) {
            activeTouches.set(touch.identifier, {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }

        gestureHandled = false;

        if (event.touches.length === 1) {
            swipeStartX = event.touches[0].clientX;
            swipeStartY = event.touches[0].clientY;
        }

        if (event.touches.length >= 2) {
            pinchStartDistance = distance(
                event.touches[0],
                event.touches[1]
            );

            pinchStartZoom = state.cameraZoom;
        }
    };

    const move = (event) => {
        if (event.touches.length >= 2) {
            event.preventDefault();

            const currentDistance = distance(
                event.touches[0],
                event.touches[1]
            );

            if (pinchStartDistance > 0) {
                const ratio = currentDistance / pinchStartDistance;

                state.cameraZoom = clamp(
                    pinchStartZoom / ratio,
                    0.65,
                    1.8
                );
            }

            gestureHandled = true;
        }
    };

    const end = (event) => {
        if (!gestureHandled && state.running && !state.paused) {
            const changed = event.changedTouches;

            if (changed && changed.length) {
                const touch = changed[0];

                const dx = touch.clientX - swipeStartX;
                const dy = touch.clientY - swipeStartY;

                if (Math.abs(dx) > 35 || Math.abs(dy) > 35) {
                    if (Math.abs(dx) > Math.abs(dy)) {
                        moveLane(dx < 0 ? -1 : 1);
                    } else if (dy < -35) {
                        jump();
                    } else if (dy > 35) {
                        slide();
                    }
                }
            }
        }

        activeTouches.clear();

        if (event.touches.length < 2) {
            pinchStartDistance = 0;
        }
    };

    surface.style.touchAction = "none";
    canvas.style.touchAction = "none";

    addEvent(surface, "touchstart", start, { passive: true });
    addEvent(surface, "touchmove", move, { passive: false });
    addEvent(surface, "touchend", end, { passive: true });
    addEvent(surface, "touchcancel", end, { passive: true });

    // Le canvas accepte aussi le pinch, utile lorsque la surface
    // est placée sous un élément d'interface.
    addEvent(canvas, "touchstart", start, { passive: true });
    addEvent(canvas, "touchmove", move, { passive: false });
    addEvent(canvas, "touchend", end, { passive: true });
    addEvent(canvas, "touchcancel", end, { passive: true });

    addEvent(surface, "contextmenu", (event) => {
        event.preventDefault();
    });
}

/* ------------------------------------------------------------
   SON ET VIBRATION
------------------------------------------------------------ */

function playTone(frequency = 440, duration = 0.08) {
    if (!state.soundEnabled || state.volume <= 0) return;

    try {
        const AudioContextClass =
            globalThis.AudioContext ||
            globalThis.webkitAudioContext;

        if (!AudioContextClass) return;

        if (!state.audioContext) {
            state.audioContext = new AudioContextClass();
        }

        const context = state.audioContext;

        if (context.state === "suspended") {
            context.resume().catch(() => {});
        }

        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;

        gain.gain.value = Math.min(0.12, state.volume / 1000);

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start();
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            context.currentTime + duration
        );

        oscillator.stop(context.currentTime + duration);
    } catch (error) {
        console.warn("Audio indisponible :", error);
    }
}

function vibrate(duration = 20) {
    if (!state.vibrationEnabled) return;

    try {
        if (typeof navigator !== "undefined" &&
            typeof navigator.vibrate === "function") {
            navigator.vibrate(duration);
        }
    } catch {
        // La vibration n'est pas disponible sur tous les appareils.
    }
}

/* ------------------------------------------------------------
   SAUVEGARDE, IMPORT ET EXPORT
------------------------------------------------------------ */

function makeSaveData() {
    return {
        version: VERSION,
        savedAt: new Date().toISOString(),
        missionIndex: state.missionIndex,
        selectedMission: state.selectedMission,
        completedMissions: state.completedMissions,
        bestScores: state.bestScores,
        score: state.score,
        coins: state.coins,
        totalCoins: state.totalCoins,
        lives: state.lives,
        distance: state.distance,
        settings: {
            quality: state.quality,
            sensitivity: state.sensitivity,
            volume: state.volume,
            soundEnabled: state.soundEnabled,
            vibrationEnabled: state.vibrationEnabled
        }
    };
}

export function saveGame() {
    try {
        const data = JSON.stringify(makeSaveData());

        localStorage.setItem(SAVE_KEY, data);
        setText("saveStatus", "Progression sauvegardée.");
        setText("databaseStatus", "Base de données : sauvegarde locale active.");
        setText("systemMessage", "Sauvegarde effectuée avec succès.");

        return true;
    } catch (error) {
        console.error("Échec de sauvegarde :", error);

        setText("saveStatus", "Sauvegarde indisponible.");
        setText("systemMessage", "Impossible d'enregistrer les données.");

        notify("La sauvegarde locale a échoué.");
        return false;
    }
}

export function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);

        if (!raw) {
            setText("saveStatus", "Aucune sauvegarde trouvée.");
            return false;
        }

        const data = JSON.parse(raw);

        if (!data || typeof data !== "object") {
            throw new Error("Format de sauvegarde invalide.");
        }

        state.missionIndex = clamp(
            Number(data.missionIndex) || 0,
            0,
            missionRegistry.length - 1
        );

        state.selectedMission = state.missionIndex;

        state.completedMissions = Array.isArray(data.completedMissions)
            ? data.completedMissions.filter(
                (i) => Number.isInteger(i) &&
                    i >= 0 &&
                    i < missionRegistry.length
            )
            : [];

        state.bestScores = data.bestScores &&
            typeof data.bestScores === "object"
            ? data.bestScores
            : {};

        state.score = Math.max(0, Number(data.score) || 0);
        state.coins = Math.max(0, Number(data.coins) || 0);
        state.totalCoins = Math.max(0, Number(data.totalCoins) || 0);
        state.lives = clamp(Number(data.lives) || 3, 1, 3);
        state.distance = Math.max(0, Number(data.distance) || 0);

        if (data.settings) {
            Object.assign(state, {
                quality: data.settings.quality || state.quality,
                sensitivity: clamp(Number(data.settings.sensitivity) || 5, 1, 10),
                volume: clamp(Number(data.settings.volume) || 60, 0, 100),
                soundEnabled: data.settings.soundEnabled !== false,
                vibrationEnabled: data.settings.vibrationEnabled !== false
            });
        }

        updateSettingsUI();
        updateMissionHUD();

        setText("saveStatus", "Sauvegarde disponible.");
        setText("databaseStatus", "Base de données : données restaurées.");

        return true;
    } catch (error) {
        console.error("Lecture de sauvegarde impossible :", error);
        setText("saveStatus", "Sauvegarde illisible.");
        return false;
    }
}

function exportSave() {
    try {
        const blob = new Blob(
            [JSON.stringify(makeSaveData(), null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = "nina-jumper-sauvegarde.json";
        anchor.click();

        setTimeout(() => URL.revokeObjectURL(url), 1500);
        notify("Fichier de sauvegarde exporté.");
    } catch (error) {
        console.error(error);
        notify("Échec de l'exportation.");
    }
}

function importSave() {
    const input = $("importSaveFile");

    if (!input) {
        notify("Champ d'importation introuvable.");
        return;
    }

    input.value = "";

    input.onchange = async () => {
        const file = input.files && input.files[0];

        if (!file) return;

        try {
            const textData = await file.text();
            const data = JSON.parse(textData);

            if (!data || typeof data !== "object") {
                throw new Error("Le fichier JSON est invalide.");
            }

            localStorage.setItem(SAVE_KEY, JSON.stringify(data));

            if (loadGame()) {
                notify("Sauvegarde importée avec succès.");
            }
        } catch (error) {
            console.error(error);
            notify("Impossible d'importer ce fichier.");
        }
    };

    input.click();
}

/* ------------------------------------------------------------
   PARAMÈTRES
------------------------------------------------------------ */

function readSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return;

        const settings = JSON.parse(raw);

        state.quality = settings.quality || "medium";
        state.sensitivity = clamp(Number(settings.sensitivity) || 5, 1, 10);
        state.volume = clamp(Number(settings.volume) || 60, 0, 100);
        state.soundEnabled = settings.soundEnabled !== false;
        state.vibrationEnabled = settings.vibrationEnabled !== false;
    } catch (error) {
        console.warn("Paramètres par défaut utilisés :", error);
    }
}

function saveSettings() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({
            quality: state.quality,
            sensitivity: state.sensitivity,
            volume: state.volume,
            soundEnabled: state.soundEnabled,
            vibrationEnabled: state.vibrationEnabled
        }));
    } catch (error) {
        console.warn("Paramètres non sauvegardés :", error);
    }
}

function updateSettingsUI() {
    const quality = $("qualitySelect");
    const sensitivity = $("sensitivityRange");
    const volume = $("volumeRange");
    const sound = $("soundEnabled");
    const vibration = $("vibrationEnabled");

    if (quality) quality.value = state.quality;
    if (sensitivity) sensitivity.value = String(state.sensitivity);
    if (volume) volume.value = String(state.volume);
    if (sound) sound.checked = state.soundEnabled;
    if (vibration) vibration.checked = state.vibrationEnabled;

    setText("sensitivityValue", state.sensitivity);
    setText("volumeValue", `${state.volume} %`);
}

function applyQuality() {
    if (!state.app || !state.app.graphicsDevice) return;

    const device = state.app.graphicsDevice;

    const ratio = state.quality === "low"
        ? 1
        : state.quality === "high"
            ? 1.75
            : 1.35;

    try {
        device.maxPixelRatio = ratio;
        state.app.setCanvasResolution(state.pc.RESOLUTION_AUTO);
    } catch (error) {
        console.warn("Réglage graphique partiel :", error);
    }
}

function applySettings() {
    state.quality = $("qualitySelect")?.value || "medium";
    state.sensitivity = clamp(
        Number($("sensitivityRange")?.value) || 5,
        1,
        10
    );

    state.volume = clamp(
        Number($("volumeRange")?.value) || 0,
        0,
        100
    );

    state.soundEnabled = $("soundEnabled")?.checked ?? true;
    state.vibrationEnabled = $("vibrationEnabled")?.checked ?? true;

    applyQuality();
    updateSettingsUI();
    saveSettings();

    notify("Paramètres appliqués.");
    hidePanel("settingsPanel");
}

/* ------------------------------------------------------------
   MISSIONS : LISTE ET FILTRES
------------------------------------------------------------ */

function renderMissions(filter = state.selectedFilter) {
    const container = $("missionsList");

    if (!container) return;

    container.replaceChildren();

    const unlocked = getUnlockedCount();

    missionRegistry.forEach((mission, index) => {
        const completed = state.completedMissions.includes(index);
        const available = index < unlocked;

        if (filter === "completed" && !completed) return;
        if (filter === "available" && !available) return;

        const row = document.createElement("button");

        row.type = "button";
        row.className = "mission-item";
        row.dataset.missionIndex = String(index);

        row.disabled = !available;

        const status = completed
            ? "✓ Terminée"
            : available
                ? "▶ Disponible"
                : "🔒 Verrouillée";

        const title = document.createElement("strong");
        title.textContent =
            `${String(index + 1).padStart(2, "0")}. ${mission.name}`;

        const description = document.createElement("small");
        description.textContent =
            `${mission.distance} m • Difficulté ${index + 1} • ${status}`;

        row.append(title, description);

        if (index === state.selectedMission) {
            row.classList.add("selected");
            row.setAttribute("aria-pressed", "true");
        }

        row.addEventListener("click", () => {
            if (!available) return;

            state.selectedMission = index;
            renderMissions(filter);
        });

        container.appendChild(row);
    });

    setText(
        "missionsSummary",
        `${state.completedMissions.length} / ${missionRegistry.length} missions terminées`
    );
}

/* ------------------------------------------------------------
   MENU, CONFIRMATION ET INITIALISATION
------------------------------------------------------------ */

function openConfirmation(title, message, callback) {
    setText("confirmTitle", title);
    setText("confirmMessage", message);

    state.pendingConfirmation = callback;
    showPanel("confirmPanel");
}

function confirmAction() {
    const callback = state.pendingConfirmation;
    state.pendingConfirmation = null;

    hidePanel("confirmPanel");

    if (typeof callback === "function") {
        callback();
    }
}

function initializeGame() {
    openConfirmation(
        "INITIALISER LE JEU",
        "Supprimer la sauvegarde locale et recommencer ? Cette action est irréversible.",
        () => {
            try {
                localStorage.removeItem(SAVE_KEY);

                state.completedMissions = [];
                state.bestScores = {};
                state.totalCoins = 0;

                state.missionIndex = 0;
                state.selectedMission = 0;

                resetMissionState();
                saveGame();

                hideAllPanels();
                showPanel("startPanel");

                setText("saveStatus", "Nouvelle partie prête.");
                notify("Progression réinitialisée.");
            } catch (error) {
                console.error(error);
                notify("Impossible d'initialiser les données.");
            }
        }
    );
}

function togglePause() {
    if (!state.running && !state.paused) return;

    state.paused = !state.paused;
    state.running = !state.paused;

    if (state.paused) {
        showPanel("pausePanel");
    } else {
        hidePanel("pausePanel");
    }
}

function returnHome() {
    state.running = false;
    state.paused = false;

    hideAllPanels();
    showPanel("startPanel");
    saveGame();
}

function toggleMenu() {
    const menu = $("sideMenu");

    if (!menu) return;

    menu.classList.toggle("hidden");
}

function toggleSound() {
    state.soundEnabled = !state.soundEnabled;

    const button = $("soundButton");

    if (button) {
        button.textContent = state.soundEnabled ? "♫" : "🔇";
    }

    saveSettings();
    notify(state.soundEnabled ? "Son activé." : "Son désactivé.");
}

async function toggleFullscreen() {
    const root = $("appJumper");

    try {
        if (!document.fullscreenElement) {
            if (root?.requestFullscreen) {
                await root.requestFullscreen();
            } else {
                notify("Le plein écran n'est pas pris en charge ici.");
            }
        } else if (document.exitFullscreen) {
            await document.exitFullscreen();
        }
    } catch (error) {
        console.warn("Plein écran indisponible :", error);
        notify("Impossible d'activer le plein écran.");
    }
}

function resizeCanvas() {
    try {
        if (state.app) {
            state.app.resizeCanvas();
        }
    } catch (error) {
        console.warn("Redimensionnement différé :", error);
    }
}

/* ------------------------------------------------------------
   INVENTAIRE ET AIDE
------------------------------------------------------------ */

function renderInventory() {
    setText("inventoryCoins", state.totalCoins);

    const list = $("inventoryList");
    if (!list) return;

    list.replaceChildren();

    const entries = [
        `Pièces collectées : ${state.totalCoins}`,
        `Missions terminées : ${state.completedMissions.length}`,
        `Record actuel : ${Math.max(0, ...Object.values(state.bestScores))}`
    ];

    entries.forEach((text) => {
        const p = document.createElement("p");
        p.textContent = text;
        list.appendChild(p);
    });
}

/* ------------------------------------------------------------
   REGISTRE DES ACTIONS HTML
------------------------------------------------------------ */

function registerAction(name, handler) {
    actionHandlers.set(name, handler);
}

function registerDefaultActions() {
    registerAction("start-game", () => {
        hideAllPanels();
        showPanel("startPanel");
        startMission(0);
        hidePanel("startPanel");
    });

    registerAction("continue-game", () => {
        loadGame();
        startMission(state.missionIndex);
        hidePanel("startPanel");
    });

    registerAction("start-selected-mission", () => {
        startMission(state.selectedMission);
    });

    registerAction("next-mission", goNextMission);

    registerAction("restart-mission", () => {
        startMission(state.missionIndex);
    });

    registerAction("jump", jump);
    registerAction("slide", slide);

    registerAction("move-left", () => moveLane(-1));
    registerAction("move-right", () => moveLane(1));

    registerAction("pause", togglePause);
    registerAction("resume", () => {
        state.paused = false;
        state.running = true;
        hidePanel("pausePanel");
    });

    registerAction("toggle-menu", toggleMenu);
    registerAction("close-menu", () => hidePanel("sideMenu"));

    registerAction("open-missions", () => {
        hidePanel("sideMenu");
        renderMissions();
        showPanel("missionsPanel");
    });

    registerAction("open-inventory", () => {
        hidePanel("sideMenu");
        renderInventory();
        showPanel("inventoryPanel");
    });

    registerAction("open-settings", () => {
        hidePanel("sideMenu");
        updateSettingsUI();
        showPanel("settingsPanel");
    });

    registerAction("open-help", () => {
        hidePanel("sideMenu");
        showPanel("helpPanel");
    });

    registerAction("open-system", () => {
        hidePanel("sideMenu");
        showPanel("systemPanel");
    });

    registerAction("close-panel", (button) => {
        const panelId = button.dataset.panel;
        if (panelId) hidePanel(panelId);
    });

    registerAction("filter-missions", (button) => {
        state.selectedFilter = button.dataset.filter || "all";
        renderMissions(state.selectedFilter);
    });

    registerAction("save", () => {
        saveGame();
        notify("Progression sauvegardée.");
    });

    registerAction("export-save", exportSave);
    registerAction("import-save", importSave);
    registerAction("initialize", initializeGame);

    registerAction("confirm-yes", confirmAction);
    registerAction("confirm-no", () => {
        state.pendingConfirmation = null;
        hidePanel("confirmPanel");
    });

    registerAction("apply-settings", applySettings);
    registerAction("toggle-sound", toggleSound);
    registerAction("fullscreen", toggleFullscreen);

    registerAction("zoom-in", () => changeZoom(-0.12));
    registerAction("zoom-out", () => changeZoom(0.12));
    registerAction("zoom-reset", resetZoom);
    registerAction("rotate-camera", rotateCamera);

    registerAction("return-home", returnHome);
}

function bindActions() {
    registerDefaultActions();

    document.addEventListener("click", (event) => {
        const target = event.target instanceof Element
            ? event.target.closest("[data-action]")
            : null;

        if (!target) return;

        const action = target.dataset.action;
        const handler = actionHandlers.get(action);

        if (handler) {
            try {
                handler(target);
            } catch (error) {
                console.error(`Action "${action}" :`, error);
                notify("Une erreur est survenue pendant cette action.");
            }
        }
    });
}

/* ------------------------------------------------------------
   CLAVIER OPTIONNEL
------------------------------------------------------------ */

function setupKeyboard() {
    addEvent(document, "keydown", (event) => {
        if (event.repeat) return;

        if (event.code === "Space" || event.code === "ArrowUp") {
            event.preventDefault();
            jump();
        } else if (event.code === "ArrowDown") {
            event.preventDefault();
            slide();
        } else if (event.code === "ArrowLeft" || event.code === "KeyA") {
            moveLane(-1);
        } else if (event.code === "ArrowRight" || event.code === "KeyD") {
            moveLane(1);
        } else if (event.code === "Escape" && state.running) {
            togglePause();
        }
    });
}

/* ------------------------------------------------------------
   SÉCURITÉ DE DÉMARRAGE
------------------------------------------------------------ */

function showFatalError(error) {
    console.error("[NINA JUMPER 3D]", error);

    setLoading(100, "Erreur de démarrage.");

    const message = error?.message || String(error);

    setText(
        "loadingMessage",
        `Impossible de démarrer : ${message}. Vérifiez Internet, WebGL 2 et le serveur HTTP.`
    );

    const screen = $("loadingScreen");
    if (screen) {
        screen.classList.remove("loaded");
        screen.setAttribute("aria-hidden", "false");
    }
}

export async function initGame() {
    if (state.ready) return state;
    if (state.destroyed) {
        throw new Error("Le jeu a été détruit.");
    }

    try {
        setLoading(3, "Préparation de NINA JUMPER 3D...");

        readSettings();
        updateSettingsUI();

        setLoading(8, "Préparation de l'interface...");
        bindActions();
        setupKeyboard();

        setLoading(15, "Chargement du moteur 3D...");
        await loadPlayCanvas();

        setLoading(55, "Construction de l'univers 3D...");
        setupScene();

        setLoading(78, "Activation des commandes tactiles...");
        setupTouchGestures();

        setLoading(88, "Récupération de la progression...");
        loadGame();

        setLoading(96, "Préparation des 50 missions...");
        renderMissions();
        updateMissionHUD();

        addEvent(document, "fullscreenchange", resizeCanvas);
        addEvent(document, "visibilitychange", () => {
            if (document.hidden && state.running) {
                state.running = false;
                state.paused = true;
                showPanel("pausePanel");
            }
        });

        state.ready = true;

        setLoading(100, "Prêt !");
        hideLoading();

        setText("databaseStatus", "Base de données : opérationnelle.");
        setText("saveStatus", "Prêt à jouer.");

        notify("NINA JUMPER 3D est prêt !");
        return state;
    } catch (error) {
        showFatalError(error);
        throw error;
    }
}

export function destroyGame() {
    if (state.destroyed) return;

    state.running = false;
    state.paused = true;
    state.destroyed = true;

    for (const cleanup of cleanupCallbacks.splice(0)) {
        try {
            cleanup();
        } catch (error) {
            console.warn("Nettoyage incomplet :", error);
        }
    }

    try {
        clearObjects(state.obstacles);
        clearObjects(state.collectibles);

        if (state.app) {
            state.app.destroy();
        }

        if (state.audioContext) {
            state.audioContext.close().catch(() => {});
        }
    } catch (error) {
        console.warn("Erreur pendant la fermeture :", error);
    }

    state.app = null;
    state.ready = false;
}

/* ------------------------------------------------------------
   API PUBLIQUE POUR AJOUTER DES FONCTIONS
------------------------------------------------------------ */

export function registerGameAction(name, callback) {
    if (typeof name !== "string" || !name.trim()) {
        throw new TypeError("Le nom de l'action est obligatoire.");
    }

    if (typeof callback !== "function") {
        throw new TypeError("Le callback doit être une fonction.");
    }

    registerAction(name, callback);
}

export function getGameState() {
    return {
        ready: state.ready,
        running: state.running,
        paused: state.paused,
        missionIndex: state.missionIndex,
        missionCount: missionRegistry.length,
        completedMissions: [...state.completedMissions],
        score: state.score,
        coins: state.coins,
        lives: state.lives,
        distance: state.distance
    };
}

export function addMission(mission) {
    const created = registerMission(mission);

    renderMissions();
    setText("missionsSummary", `${missionRegistry.length} missions disponibles`);

    notify(`Mission ajoutée : ${created.name}`);
    return created;
}

/* ------------------------------------------------------------
   LANCEMENT AUTOMATIQUE DU MODULE
------------------------------------------------------------ */

initGame().catch((error) => {
    console.error("Échec de l'initialisation :", error);
});
