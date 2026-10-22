
/* ============================================================
   FOBAS BASKET 3D
   Fichier : appbasketfobas.js
   Version : moteur de jeu modulaire
   ------------------------------------------------------------
   - PlayCanvas chargé dynamiquement
   - 100 missions progressives
   - Ballons et tentatives illimités
   - Validation des tirs par trajectoire et passage dans le panier
   - Panier mobile après chaque réussite
   - Contrôles Android, pincement à deux doigts et zoom
   - Profil, sauvegarde IndexedDB et solution de repli
   - Démonstration DIEUBEN
============================================================ */

const CONFIG = Object.freeze({
    APP_NAME: "FOBAS BASKET 3D",
    TOTAL_MISSIONS: 100,
    SAVE_KEY: "fobas-basket-3d-save-v1",
    DB_NAME: "FOBAS_BASKET_3D",
    DB_VERSION: 1,
    DB_STORE: "game",
    ENGINE_URL:
        "https://cdn.jsdelivr.net/npm/playcanvas@2.7.3/build/playcanvas.mjs",

    GRAVITY: 9.81,
    BALL_RADIUS: 0.24,
    HOOP_HEIGHT: 3.05,
    HOOP_RADIUS: 0.46,

    PLAYER_X: 0,
    PLAYER_Y: 0,
    PLAYER_Z: 5.2,

    INITIAL_HOOP_X: 0,
    INITIAL_HOOP_Z: -3.2,

    MIN_ZOOM: 5,
    MAX_ZOOM: 19,
    INITIAL_ZOOM: 11
});

const $ = (id) => document.getElementById(id);

const ui = {
    canvas: $("game-canvas"),
    viewport: $("game-viewport"),
    loading: $("loading-screen"),
    loadingMessage: $("loading-message"),
    loadingProgress: $("loading-progress"),

    gameState: $("game-state"),
    notification: $("game-notification"),

    playerName: $("player-display-name"),
    profileStatus: $("profile-status"),
    profileEditor: $("profile-editor"),
    profileInput: $("player-full-name"),
    profileMessage: $("profile-message"),

    hudMission: $("hud-mission"),
    hudProgress: $("hud-progress"),
    hudScore: $("hud-score"),

    missionHeading: $("mission-heading"),
    missionDifficulty: $("mission-difficulty"),
    missionDescription: $("mission-description"),
    missionTarget: $("mission-target"),
    missionProgressText: $("mission-progress-text"),
    missionProgressTrack: $("mission-progress-track"),
    missionProgressBar: $("mission-progress-bar"),
    missionFeedback: $("mission-feedback"),
    missionsGrid: $("missions-grid"),
    completedCount: $("completed-missions-count"),
    missionsMessage: $("missions-message"),

    aimPower: $("aim-power"),
    aimPowerValue: $("aim-power-value"),
    aimAngle: $("aim-angle"),
    aimAngleValue: $("aim-angle-value"),
    shootMessage: $("shoot-message"),

    dieubenStatus: $("dieuben-status"),
    touchHint: $("touch-hint"),

    saveStatus: $("save-status"),
    storageMessage: $("storage-message"),
    settingsMessage: $("settings-message"),
    quality: $("setting-quality"),
    sound: $("setting-sound"),
    haptics: $("setting-haptics"),

    confirmationDialog: $("confirmation-dialog"),
    confirmationTitle: $("confirmation-title"),
    confirmationMessage: $("confirmation-message"),
    confirmYes: $("btn-confirm-yes"),
    confirmNo: $("btn-confirm-no")
};

const state = {
    engine: null,
    app: null,
    camera: null,

    sceneReady: false,
    engineFailed: false,
    initialized: false,

    mission: 1,
    progress: 0,
    score: 0,
    attempts: 0,
    completedMissions: [],
    unlockedMission: 1,

    profile: {
        fullName: ""
    },

    settings: {
        sound: true,
        haptics: true,
        quality: "medium"
    },

    ball: null,
    ballVelocity: null,
    ballInFlight: false,
    ballScored: false,
    ballFlightTime: 0,
    ballPreviousPosition: null,

    hoop: {
        x: CONFIG.INITIAL_HOOP_X,
        y: CONFIG.HOOP_HEIGHT,
        z: CONFIG.INITIAL_HOOP_Z,
        targetX: CONFIG.INITIAL_HOOP_X,
        targetZ: CONFIG.INITIAL_HOOP_Z,
        moveTime: 0
    },

    zoom: CONFIG.INITIAL_ZOOM,
    aimRequested: false,
    shotInProgress: false,
    demoActive: false,

    scorePending: false,
    pendingAction: null,

    database: null,
    databaseAvailable: false,
    saveTimer: null,

    entities: {
        hoopParts: [],
        courtParts: [],
        playerParts: [],
        aiParts: [],
        ballParts: [],
        aimParts: []
    },

    touch: {
        points: new Map(),
        pinchDistance: 0,
        pinching: false
    },

    cameraTarget: {
        x: 0,
        y: 1.8,
        z: 0
    },

    lastNotification: 0
};

/* ============================================================
   1. OUTILS GÉNÉRAUX
============================================================ */

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function setText(element, text) {
    if (element) {
        element.textContent = String(text);
    }
}

function setVisible(element, visible) {
    if (element) {
        element.hidden = !visible;
    }
}

function announce(message, duration = 2600) {
    if (!ui.notification) return;

    setText(ui.notification, message);
    ui.notification.hidden = false;

    state.lastNotification++;

    const current = state.lastNotification;

    window.setTimeout(() => {
        if (
            current === state.lastNotification &&
            ui.notification
        ) {
            ui.notification.hidden = true;
        }
    }, duration);
}

function setLoading(message, percent) {
    setText(ui.loadingMessage, message);

    if (ui.loadingProgress) {
        ui.loadingProgress.style.width =
            `${clamp(percent, 0, 100)}%`;
    }
}

function vibrate(pattern = 30) {
    if (!state.settings.haptics) return;

    try {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    } catch (_) {
        // Les vibrations ne sont pas disponibles sur tous les appareils.
    }
}

function missionTarget(missionNumber) {
    const mission = clamp(
        Math.floor(missionNumber),
        1,
        CONFIG.TOTAL_MISSIONS
    );

    // Mission 1 : 1 position.
    // Mission 99 : 24 positions.
    // Mission 100 : exactement 25 positions.
    if (mission === 100) return 25;

    return Math.max(
        1,
        Math.min(24, Math.ceil((mission * 24) / 99))
    );
}

function missionDifficulty(missionNumber) {
    if (missionNumber <= 10) return "Débutant";
    if (missionNumber <= 25) return "Intermédiaire";
    if (missionNumber <= 50) return "Avancé";
    if (missionNumber <= 75) return "Expert";
    if (missionNumber <= 99) return "Maître";
    return "Légende";
}

function missionDistance(missionNumber) {
    return 7.0 + ((missionNumber - 1) / 99) * 3.0;
}

function createDefaultState() {
    state.mission = 1;
    state.progress = 0;
    state.score = 0;
    state.attempts = 0;
    state.completedMissions = [];
    state.unlockedMission = 1;
}

/* ============================================================
   2. STOCKAGE : INDEXEDDB AVEC SOLUTION DE REPLI
============================================================ */

function openDatabase() {
    return new Promise((resolve) => {
        if (!("indexedDB" in window)) {
            state.databaseAvailable = false;
            resolve(null);
            return;
        }

        let request;

        try {
            request = indexedDB.open(
                CONFIG.DB_NAME,
                CONFIG.DB_VERSION
            );
        } catch (_) {
            state.databaseAvailable = false;
            resolve(null);
            return;
        }

        request.onupgradeneeded = () => {
            const database = request.result;

            if (!database.objectStoreNames.contains(CONFIG.DB_STORE)) {
                database.createObjectStore(CONFIG.DB_STORE);
            }
        };

        request.onsuccess = () => {
            state.database = request.result;
            state.databaseAvailable = true;
            resolve(request.result);
        };

        request.onerror = () => {
            state.databaseAvailable = false;
            resolve(null);
        };

        request.onblocked = () => {
            state.databaseAvailable = false;
            resolve(null);
        };
    });
}

function readDatabase(key) {
    return new Promise((resolve) => {
        const database = state.database;

        if (!database || !state.databaseAvailable) {
            resolve(null);
            return;
        }

        let transaction;

        try {
            transaction = database.transaction(
                CONFIG.DB_STORE,
                "readonly"
            );

            const request = transaction
                .objectStore(CONFIG.DB_STORE)
                .get(key);

            request.onsuccess = () => resolve(request.result ?? null);
            request.onerror = () => resolve(null);
        } catch (_) {
            resolve(null);
        }
    });
}

function writeDatabase(key, value) {
    return new Promise((resolve) => {
        const database = state.database;

        if (!database || !state.databaseAvailable) {
            resolve(false);
            return;
        }

        let transaction;

        try {
            transaction = database.transaction(
                CONFIG.DB_STORE,
                "readwrite"
            );

            transaction.objectStore(CONFIG.DB_STORE).put(value, key);

            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => resolve(false);
            transaction.onabort = () => resolve(false);
        } catch (_) {
            resolve(false);
        }
    });
}

function deleteDatabaseRecord(key) {
    return new Promise((resolve) => {
        const database = state.database;

        if (!database || !state.databaseAvailable) {
            resolve(false);
            return;
        }

        try {
            const transaction = database.transaction(
                CONFIG.DB_STORE,
                "readwrite"
            );

            transaction.objectStore(CONFIG.DB_STORE).delete(key);

            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => resolve(false);
            transaction.onabort = () => resolve(false);
        } catch (_) {
            resolve(false);
        }
    });
}

function readLocalFallback() {
    try {
        const raw = localStorage.getItem(CONFIG.SAVE_KEY);

        if (!raw) return null;

        return JSON.parse(raw);
    } catch (_) {
        return null;
    }
}

function writeLocalFallback(value) {
    try {
        localStorage.setItem(
            CONFIG.SAVE_KEY,
            JSON.stringify(value)
        );

        return true;
    } catch (_) {
        return false;
    }
}

function serializeGame() {
    return {
        version: 1,
        savedAt: new Date().toISOString(),

        profile: {
            fullName: state.profile.fullName
        },

        mission: state.mission,
        progress: state.progress,
        score: state.score,
        attempts: state.attempts,

        completedMissions: [
            ...new Set(state.completedMissions)
        ],

        unlockedMission: state.unlockedMission,

        settings: {
            ...state.settings
        }
    };
}

function normalizeSavedGame(saved) {
    if (!saved || typeof saved !== "object") return false;

    const completed = Array.isArray(saved.completedMissions)
        ? saved.completedMissions
            .map(Number)
            .filter((n) =>
                Number.isInteger(n) &&
                n >= 1 &&
                n <= CONFIG.TOTAL_MISSIONS
            )
        : [];

    state.completedMissions = [...new Set(completed)];

    state.mission = clamp(
        Number(saved.mission) || 1,
        1,
        CONFIG.TOTAL_MISSIONS
    );

    state.progress = clamp(
        Number(saved.progress) || 0,
        0,
        missionTarget(state.mission)
    );

    state.score = Math.max(0, Number(saved.score) || 0);
    state.attempts = Math.max(0, Number(saved.attempts) || 0);

    state.unlockedMission = clamp(
        Number(saved.unlockedMission) || 1,
        1,
        CONFIG.TOTAL_MISSIONS
    );

    if (
        saved.profile &&
        typeof saved.profile.fullName === "string"
    ) {
        state.profile.fullName =
            saved.profile.fullName.trim().slice(0, 80);
    }

    if (saved.settings && typeof saved.settings === "object") {
        state.settings.sound = saved.settings.sound !== false;
        state.settings.haptics = saved.settings.haptics !== false;

        if (["low", "medium", "high"].includes(saved.settings.quality)) {
            state.settings.quality = saved.settings.quality;
        }
    }

    if (state.completedMissions.length) {
        state.unlockedMission = Math.max(
            state.unlockedMission,
            Math.min(
                CONFIG.TOTAL_MISSIONS,
                Math.max(...state.completedMissions) + 1
            )
        );
    }

    return true;
}

async function loadGame() {
    await openDatabase();

    let saved = await readDatabase("main");

    if (!saved) {
        saved = readLocalFallback();
    }

    if (saved) {
        normalizeSavedGame(saved);
    }

    renderProfile();
    renderSettings();

    return Boolean(saved);
}

async function saveGame() {
    const saved = serializeGame();

    let stored = false;

    if (state.databaseAvailable) {
        stored = await writeDatabase("main", saved);
    }

    if (!stored) {
        stored = writeLocalFallback(saved);
    }

    if (stored) {
        setText(ui.saveStatus, "Progression sauvegardée sur cet appareil.");
        setText(ui.storageMessage, "Sauvegarde réussie.");
        announce("Progression sauvegardée.");
    } else {
        setText(
            ui.storageMessage,
            "Stockage indisponible. Vérifiez le mode de lancement du jeu."
        );

        announce("Impossible de sauvegarder sur cet appareil.");
    }

    return stored;
}

function scheduleSave() {
    if (state.saveTimer !== null) {
        window.clearTimeout(state.saveTimer);
    }

    state.saveTimer = window.setTimeout(() => {
        saveGame().catch(() => {
            setText(ui.storageMessage, "Erreur pendant la sauvegarde.");
        });
    }, 400);
}

/* ============================================================
   3. PROFIL DU JOUEUR
============================================================ */

function renderProfile() {
    const name = state.profile.fullName;

    setText(
        ui.playerName,
        name ? name : "Bienvenue, joueur !"
    );

    setText(
        ui.profileStatus,
        name ? "Profil enregistré" : "Profil à configurer"
    );

    if (ui.profileInput && name) {
        ui.profileInput.value = name;
    }
}

function openProfileEditor() {
    setVisible(ui.profileEditor, true);

    if (ui.profileInput) {
        ui.profileInput.value = state.profile.fullName;
        ui.profileInput.focus();
    }
}

function saveProfile() {
    const fullName = ui.profileInput
        ? ui.profileInput.value.trim()
        : "";

    if (!fullName) {
        setText(
            ui.profileMessage,
            "Entrez votre nom complet avant d'enregistrer."
        );

        if (ui.profileInput) ui.profileInput.focus();
        return;
    }

    state.profile.fullName = fullName.slice(0, 80);

    renderProfile();
    setVisible(ui.profileEditor, false);

    setText(ui.profileMessage, "Profil enregistré.");
    scheduleSave();

    announce(`Bienvenue, ${state.profile.fullName} !`);
}

function cancelProfileEditor() {
    setVisible(ui.profileEditor, false);
    renderProfile();
}

/* ============================================================
   4. MOTEUR PLAYCANVAS
============================================================ */

async function loadPlayCanvas() {
    try {
        setLoading("Chargement du moteur 3D...", 15);

        const pc = await import(CONFIG.ENGINE_URL);

        state.engine = pc;

        setLoading("Initialisation de l'arène...", 30);

        if (!ui.canvas) {
            throw new Error("Le canvas #game-canvas est introuvable.");
        }

        const app = new pc.Application(ui.canvas, {
            mouse: new pc.Mouse(ui.canvas),
            touch: new pc.TouchDevice(ui.canvas),

            graphicsDeviceOptions: {
                antialias: true,
                alpha: false,
                powerPreference: "high-performance"
            }
        });

        state.app = app;

        app.graphicsDevice.maxPixelRatio = Math.min(
            window.devicePixelRatio || 1,
            state.settings.quality === "high" ? 2 : 1.5
        );

        app.setCanvasFillMode(pc.FILLMODE_NONE);
        app.setCanvasResolution(pc.RESOLUTION_AUTO);

        app.scene.ambientLight = new pc.Color(0.58, 0.61, 0.69);

        app.start();

        setLoading("Création du terrain et du panier...", 45);

        createScene(pc, app);

        app.on("update", updateGame);

        window.addEventListener("resize", resizeCanvas, {
            passive: true
        });

        resizeCanvas();

        state.sceneReady = true;
        state.engineFailed = false;

        setText(ui.gameState, "Arène 3D prête");
        setLoading("Terrain prêt !", 100);

        window.setTimeout(() => {
            setVisible(ui.loading, false);
        }, 450);

        return true;
    } catch (error) {
        console.error("FOBAS BASKET 3D : moteur 3D indisponible", error);

        state.engineFailed = true;
        state.sceneReady = false;

        setText(ui.gameState, "Mode de secours disponible");
        setLoading(
            "Le moteur 3D ne peut pas être chargé. Vérifiez Internet puis rechargez.",
            100
        );

        // L'interface, les missions et les commandes restent utilisables.
        // On laisse un message visible plutôt que de bloquer toute l'application.
        return false;
    }
}

function makeMaterial(pc, color, options = {}) {
    const material = new pc.StandardMaterial();

    material.diffuse = new pc.Color(
        color[0],
        color[1],
        color[2]
    );

    if (options.emissive) {
        material.emissive = new pc.Color(
            options.emissive[0],
            options.emissive[1],
            options.emissive[2]
        );
    }

    if (options.metalness !== undefined) {
        material.metalness = options.metalness;
    }

    if (options.gloss !== undefined) {
        material.gloss = options.gloss;
    }

    material.update();

    return material;
}

function createPrimitive(
    pc,
    app,
    name,
    type,
    position,
    scale,
    material,
    euler = [0, 0, 0],
    parent = null
) {
    const entity = new pc.Entity(name);

    entity.addComponent("model", {
        type
    });

    entity.setLocalScale(scale[0], scale[1], scale[2]);
    entity.setLocalPosition(position[0], position[1], position[2]);
    entity.setLocalEulerAngles(euler[0], euler[1], euler[2]);

    entity.model.material = material;

    if (parent) {
        parent.addChild(entity);
    } else {
        app.root.addChild(entity);
    }

    return entity;
}

function createScene(pc, app) {
    const courtMaterial = makeMaterial(pc, [0.58, 0.29, 0.13], {
        gloss: 60
    });

    const lineMaterial = makeMaterial(pc, [0.94, 0.92, 0.83]);
    const darkMaterial = makeMaterial(pc, [0.075, 0.095, 0.12]);
    const woodMaterial = makeMaterial(pc, [0.70, 0.39, 0.20]);
    const whiteMaterial = makeMaterial(pc, [0.94, 0.95, 0.96]);
    const orangeMaterial = makeMaterial(pc, [1.0, 0.27, 0.035], {
        gloss: 80
    });

    const ballMaterial = makeMaterial(pc, [0.94, 0.25, 0.035], {
        gloss: 65
    });

    const blueMaterial = makeMaterial(pc, [0.06, 0.31, 0.85], {
        gloss: 50
    });

    const aiMaterial = makeMaterial(pc, [0.10, 0.78, 0.95], {
        gloss: 65
    });

    // Terrain principal.
    createPrimitive(
        pc, app, "CourtFloor", "box",
        [0, -0.20, 0],
        [15, 0.35, 22],
        courtMaterial
    );

    createPrimitive(
        pc, app, "CourtWood", "box",
        [0, -0.005, 0],
        [14.4, 0.035, 21.4],
        woodMaterial
    );

    // Limites du terrain.
    const lineY = 0.025;
    const lineWidth = 0.055;

    createPrimitive(
        pc, app, "LineLeft", "box",
        [-6.8, lineY, 0],
        [lineWidth, 0.02, 20.5],
        lineMaterial
    );

    createPrimitive(
        pc, app, "LineRight", "box",
        [6.8, lineY, 0],
        [lineWidth, 0.02, 20.5],
        lineMaterial
    );

    createPrimitive(
        pc, app, "LineFront", "box",
        [0, lineY, 10.2],
        [13.6, 0.02, lineWidth],
        lineMaterial
    );

    createPrimitive(
        pc, app, "LineBack", "box",
        [0, lineY, -10.2],
        [13.6, 0.02, lineWidth],
        lineMaterial
    );

    createPrimitive(
        pc, app, "CenterLine", "box",
        [0, lineY, 0],
        [13.6, 0.02, 0.05],
        lineMaterial
    );

    // Zone de tir et ligne de lancer franc.
    createPrimitive(
        pc, app, "FreeThrowLine", "box",
        [0, lineY + 0.002, -5.2],
        [4.0, 0.02, 0.055],
        lineMaterial
    );

    // Caméra.
    const cameraEntity = new pc.Entity("MainCamera");

    cameraEntity.addComponent("camera", {
        clearColor: new pc.Color(0.035, 0.055, 0.085),
        fov: 58,
        nearClip: 0.1,
        farClip: 100
    });

    cameraEntity.setLocalPosition(0, 7.0, 14.0);
    cameraEntity.lookAt(0, 1.5, -1.5);

    app.root.addChild(cameraEntity);

    state.camera = cameraEntity;

    // Éclairage.
    const directionalLight = new pc.Entity("SunLight");

    directionalLight.addComponent("light", {
        type: "directional",
        color: new pc.Color(1, 0.94, 0.82),
        intensity: 1.65,
        castShadows: true
    });

    directionalLight.setLocalEulerAngles(43, 32, 0);
    app.root.addChild(directionalLight);

    // Structure du panier.
    createHoopParts(
        pc,
        app,
        darkMaterial,
        whiteMaterial,
        orangeMaterial
    );

    // Joueur principal.
    createPlayerCharacter(
        pc,
        app,
        "PlayerCharacter",
        blueMaterial,
        CONFIG.PLAYER_X,
        CONFIG.PLAYER_Z,
        state.entities.playerParts
    );

    // DIEUBEN : démonstrateur visuel indépendant.
    createPlayerCharacter(
        pc,
        app,
        "DIEUBENCharacter",
        aiMaterial,
        2.2,
        5.2,
        state.entities.aiParts
    );

    // Ballon.
    state.ball = createPrimitive(
        pc,
        app,
        "Basketball",
        "sphere",
        [CONFIG.PLAYER_X, 1.85, CONFIG.PLAYER_Z],
        [
            CONFIG.BALL_RADIUS * 2,
            CONFIG.BALL_RADIUS * 2,
            CONFIG.BALL_RADIUS * 2
        ],
        ballMaterial
    );

    state.ballPreviousPosition = {
        x: CONFIG.PLAYER_X,
        y: 1.85,
        z: CONFIG.PLAYER_Z
    };

    // Indicateur de visée.
    createAimMarker(pc, app, orangeMaterial);

    // Éléments de décor.
    createPrimitive(
        pc, app, "LeftWall", "box",
        [-7.3, 2.0, 0],
        [0.25, 4.0, 22],
        darkMaterial
    );

    createPrimitive(
        pc, app, "RightWall", "box",
        [7.3, 2.0, 0],
        [0.25, 4.0, 22],
        darkMaterial
    );

    // Le ballon démarre toujours disponible.
    resetBall();

    setText(ui.gameState, "Terrain prêt — vous pouvez jouer");
}

function createPlayerCharacter(
    pc,
    app,
    name,
    material,
    x,
    z,
    entityCollection
) {
    const parent = new pc.Entity(name);

    parent.setLocalPosition(x, 0, z);
    app.root.addChild(parent);

    const headMaterial = makeMaterial(pc, [0.77, 0.55, 0.38]);
    const shoeMaterial = makeMaterial(pc, [0.045, 0.05, 0.06]);

    const body = createPrimitive(
        pc, app, `${name}_Body`, "capsule",
        [0, 1.0, 0],
        [0.68, 1.0, 0.40],
        material,
        [0, 0, 0],
        parent
    );

    const head = createPrimitive(
        pc, app, `${name}_Head`, "sphere",
        [0, 1.78, 0],
        [0.42, 0.42, 0.42],
        headMaterial,
        [0, 0, 0],
        parent
    );

    const leftArm = createPrimitive(
        pc, app, `${name}_LeftArm`, "capsule",
        [-0.43, 1.08, -0.02],
        [0.18, 0.64, 0.18],
        material,
        [0, 0, -24],
        parent
    );

    const rightArm = createPrimitive(
        pc, app, `${name}_RightArm`, "capsule",
        [0.43, 1.08, -0.02],
        [0.18, 0.64, 0.18],
        material,
        [0, 0, 24],
        parent
    );

    createPrimitive(
        pc, app, `${name}_LeftLeg`, "capsule",
        [-0.18, 0.35, 0],
        [0.20, 0.65, 0.20],
        shoeMaterial,
        [0, 0, -5],
        parent
    );

    createPrimitive(
        pc, app, `${name}_RightLeg`, "capsule",
        [0.18, 0.35, 0],
        [0.20, 0.65, 0.20],
        shoeMaterial,
        [0, 0, 5],
        parent
    );

    entityCollection.push(parent, body, head, leftArm, rightArm);
    return parent;
}

function createHoopParts(
    pc,
    app,
    supportMaterial,
    boardMaterial,
    ringMaterial
) {
    // Poteau.
    state.entities.hoopParts.push(
        createPrimitive(
            pc, app, "HoopPole", "cylinder",
            [0, 2.0, -4.55],
            [0.18, 4.0, 0.18],
            supportMaterial
        )
    );

    // Panneau.
    state.entities.hoopParts.push(
        createPrimitive(
            pc, app, "HoopBackboard", "box",
            [0, 3.8, -4.15],
            [2.0, 1.2, 0.12],
            boardMaterial
        )
    );

    // Cadre rectangulaire du panneau.
    const frame = [
        {
            name: "BackboardTop",
            pos: [0, 4.35, -4.075],
            scale: [1.8, 0.035, 0.04]
        },
        {
            name: "BackboardBottom",
            pos: [0, 3.25, -4.075],
            scale: [1.8, 0.035, 0.04]
        },
        {
            name: "BackboardLeft",
            pos: [-0.9, 3.8, -4.075],
            scale: [0.035, 1.1, 0.04]
        },
        {
            name: "BackboardRight",
            pos: [0.9, 3.8, -4.075],
            scale: [0.035, 1.1, 0.04]
        }
    ];

    for (const part of frame) {
        state.entities.hoopParts.push(
            createPrimitive(
                pc, app,
                part.name,
                "box",
                part.pos,
                part.scale,
                ringMaterial
            )
        );
    }

    // Anneau représenté par 12 petits éléments circulaires.
    const ringSegments = 12;

    for (let i = 0; i < ringSegments; i++) {
        const angle = (Math.PI * 2 * i) / ringSegments;

        const x = Math.cos(angle) * CONFIG.HOOP_RADIUS;
        const z = Math.sin(angle) * CONFIG.HOOP_RADIUS;

        const segment = createPrimitive(
            pc,
            app,
            `HoopRing_${i}`,
            "sphere",
            [
                state.hoop.x + x,
                CONFIG.HOOP_HEIGHT,
                state.hoop.z + z
            ],
            [0.12, 0.065, 0.12],
            ringMaterial
        );

        state.entities.hoopParts.push(segment);
    }

    // Filet simplifié.
    const netMaterial = makeMaterial(pc, [0.91, 0.91, 0.87]);

    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;

        const x = Math.cos(angle) * 0.37;
        const z = Math.sin(angle) * 0.37;

        const netPart = createPrimitive(
            pc,
            app,
            `Net_${i}`,
            "cylinder",
            [x, 2.79, state.hoop.z + z],
            [0.018, 0.44, 0.018],
            netMaterial
        );

        state.entities.hoopParts.push(netPart);
    }
}

function createAimMarker(pc, app, material) {
    state.aimMarker = createPrimitive(
        pc,
        app,
        "AimMarker",
        "sphere",
        [0, 3, -3],
        [0.18, 0.18, 0.18],
        material
    );

    state.aimMarker.enabled = false;
}

/* ============================================================
   5. MISE À JOUR DU PANIER
============================================================ */

function moveHoopToNextPosition() {
    const mission = state.mission;
    const difficulty = (mission - 1) / 99;

    const distance = missionDistance(mission);

    const maxX = 1.1 + difficulty * 3.2;

    const x = clamp(
        randomBetween(-maxX, maxX),
        -4.5,
        4.5
    );

    // La profondeur varie légèrement selon la difficulté.
    const z = clamp(
        -Math.max(2.8, distance - 0.5) +
            randomBetween(-0.6, 0.6),
        -6.2,
        -2.8
    );

    state.hoop.targetX = x;
    state.hoop.targetZ = z;
    state.hoop.moveTime = 0;

    // La cible physique est mise à jour immédiatement.
    // L'animation visuelle suit dans updateHoop.
    state.hoop.x = x;
    state.hoop.z = z;

    updateHoopVisuals();

    announce("Nouvelle position du panier ! Visez à nouveau.");
}

function updateHoopVisuals() {
    const parts = state.entities.hoopParts;

    if (!parts.length) return;

    // Les six premiers éléments sont le poteau et le panneau.
    // Ils restent visuellement derrière l'anneau.
    for (let i = 6; i < parts.length; i++) {
        const entity = parts[i];

        if (!entity || !entity.enabled) continue;

        const name = entity.name || "";

        if (name.startsWith("HoopRing_")) {
            const index = Number(name.split("_")[1]);
            const angle = (Math.PI * 2 * index) / 12;

            entity.setLocalPosition(
                state.hoop.x +
                    Math.cos(angle) * CONFIG.HOOP_RADIUS,
                CONFIG.HOOP_HEIGHT,
                state.hoop.z +
                    Math.sin(angle) * CONFIG.HOOP_RADIUS
            );
        } else if (name.startsWith("Net_")) {
            const index = Number(name.split("_")[1]);
            const angle = (Math.PI * 2 * index) / 8;

            entity.setLocalPosition(
                state.hoop.x + Math.cos(angle) * 0.37,
                2.79,
                state.hoop.z + Math.sin(angle) * 0.37
            );
        }
    }

    // Le panneau et le poteau suivent le panier.
    const pole = parts[0];
    const board = parts[1];

    if (pole) {
        pole.setLocalPosition(
            state.hoop.x,
            2.0,
            state.hoop.z - 1.35
        );
    }

    if (board) {
        board.setLocalPosition(
            state.hoop.x,
            3.8,
            state.hoop.z - 0.95
        );
    }

    const framePositions = [
        [state.hoop.x, 4.35, state.hoop.z - 0.925],
        [state.hoop.x, 3.25, state.hoop.z - 0.925],
        [state.hoop.x - 0.9, 3.8, state.hoop.z - 0.925],
        [state.hoop.x + 0.9, 3.8, state.hoop.z - 0.925]
    ];

    for (let i = 0; i < framePositions.length; i++) {
        const entity = parts[i + 2];

        if (entity) {
            entity.setLocalPosition(...framePositions[i]);
        }
    }
}

/* ============================================================
   6. BALON ET TIRS
============================================================ */

function resetBall() {
    if (!state.ball) return;

    state.ballInFlight = false;
    state.shotInProgress = false;
    state.ballScored = false;
    state.ballFlightTime = 0;
    state.ballVelocity = null;
    state.scorePending = false;

    state.ball.setLocalPosition(
        CONFIG.PLAYER_X,
        1.85,
        CONFIG.PLAYER_Z
    );

    state.ballPreviousPosition = {
        x: CONFIG.PLAYER_X,
        y: 1.85,
        z: CONFIG.PLAYER_Z
    };

    state.ball.enabled = true;

    if (state.aimMarker) {
        state.aimMarker.enabled = state.aimRequested;
    }
}

function calculateIdealAngle(speed, horizontalDistance, verticalDifference) {
    const g = CONFIG.GRAVITY;
    const v2 = speed * speed;

    const discriminant =
        v2 * v2 -
        g * (
            g * horizontalDistance * horizontalDistance +
            2 * verticalDifference * v2
        );

    if (discriminant <= 0) {
        return 45;
    }

    const tanAngle =
        (v2 + Math.sqrt(discriminant)) /
        (g * Math.max(horizontalDistance, 0.1));

    const angle = Math.atan(tanAngle) * 180 / Math.PI;

    return clamp(angle, 15, 75);
}

function aimAtHoop() {
    if (!state.sceneReady) {
        announce("Le terrain 3D n'est pas encore prêt.");
        return;
    }

    const power = Number(ui.aimPower?.value || 50);

    const speed = 7.0 + power * 0.06;

    const dx = state.hoop.x - CONFIG.PLAYER_X;
    const dz = state.hoop.z - CONFIG.PLAYER_Z;

    const horizontalDistance = Math.hypot(dx, dz);

    const angle = calculateIdealAngle(
        speed,
        horizontalDistance,
        CONFIG.HOOP_HEIGHT - 1.85
    );

    if (ui.aimAngle) {
        ui.aimAngle.value = String(Math.round(angle));
    }

    updateAimLabels();

    state.aimRequested = true;

    if (state.aimMarker) {
        state.aimMarker.enabled = true;
        state.aimMarker.setLocalPosition(
            state.hoop.x,
            CONFIG.HOOP_HEIGHT,
            state.hoop.z
        );
    }

    setText(
        ui.shootMessage,
        "Visée calculée. Ajustez si nécessaire, puis tirez."
    );

    announce("Visée prête.");
}

function shootBall(options = {}) {
    const isAI = options.ai === true;

    if (!state.sceneReady || !state.ball) {
        announce("Attendez que le terrain soit prêt.");
        return false;
    }

    if (state.ballInFlight) {
        setText(
            ui.shootMessage,
            "Le ballon est déjà en mouvement. Attendez la fin du tir."
        );

        return false;
    }

    if (state.progress >= missionTarget(state.mission)) {
        announce("Cette mission est terminée. Choisissez la suivante.");
        return false;
    }

    const power = isAI
        ? 65
        : Number(ui.aimPower?.value || 50);

    const angleDegrees = isAI
        ? calculateIdealAngle(
            7 + power * 0.06,
            Math.hypot(
                state.hoop.x - CONFIG.PLAYER_X,
                state.hoop.z - CONFIG.PLAYER_Z
            ),
            CONFIG.HOOP_HEIGHT - 1.85
        )
        : Number(ui.aimAngle?.value || 45);

    const speed = 7.0 + power * 0.06;
    const angle = angleDegrees * Math.PI / 180;

    const dx = state.hoop.x - CONFIG.PLAYER_X;
    const dz = state.hoop.z - CONFIG.PLAYER_Z;

    const horizontalDistance = Math.max(0.1, Math.hypot(dx, dz));

    const dirX = dx / horizontalDistance;
    const dirZ = dz / horizontalDistance;

    state.ballVelocity = {
        x: dirX * speed * Math.cos(angle),
        y: speed * Math.sin(angle),
        z: dirZ * speed * Math.cos(angle)
    };

    state.ball.setLocalPosition(
        CONFIG.PLAYER_X,
        1.85,
        CONFIG.PLAYER_Z
    );

    state.ballPreviousPosition = {
        x: CONFIG.PLAYER_X,
        y: 1.85,
        z: CONFIG.PLAYER_Z
    };

    state.ballInFlight = true;
    state.ballScored = false;
    state.ballFlightTime = 0;
    state.shotInProgress = true;
    state.scorePending = false;

    state.attempts++;

    state.aimRequested = false;

    if (state.aimMarker) {
        state.aimMarker.enabled = false;
    }

    if (ui.shootMessage) {
        setText(
            ui.shootMessage,
            isAI ? "DIEUBEN tire..." : "Tir en cours..."
        );
    }

    setText(ui.gameState, "Ballon en mouvement");

    updateDashboard();
    scheduleSave();

    return true;
}

function updateBall(dt) {
    if (!state.ballInFlight || !state.ball || !state.ballVelocity) {
        return;
    }

    const previous = state.ballPreviousPosition;

    const current = state.ball.getLocalPosition();

    const vx = state.ballVelocity.x;
    const vy = state.ballVelocity.y;
    const vz = state.ballVelocity.z;

    const next = {
        x: current.x + vx * dt,
        y: current.y + vy * dt -
            0.5 * CONFIG.GRAVITY * dt * dt,
        z: current.z + vz * dt
    };

    state.ballVelocity.y -= CONFIG.GRAVITY * dt;
    state.ballFlightTime += dt;

    // Détection du passage descendant dans le plan horizontal du cercle.
    // Le tir n'est compté que si le ballon traverse le plan du panier
    // avec son centre dans l'ouverture utile de l'anneau.
    if (
        previous.y >= CONFIG.HOOP_HEIGHT &&
        next.y < CONFIG.HOOP_HEIGHT &&
        !state.ballScored
    ) {
        const denominator = previous.y - next.y;

        const t = denominator > 0
            ? (previous.y - CONFIG.HOOP_HEIGHT) / denominator
            : 0;

        const crossingX =
            previous.x + (next.x - previous.x) * t;

        const crossingZ =
            previous.z + (next.z - previous.z) * t;

        const radialDistance = Math.hypot(
            crossingX - state.hoop.x,
            crossingZ - state.hoop.z
        );

        const safeRadius =
            CONFIG.HOOP_RADIUS - CONFIG.BALL_RADIUS * 0.55;

        if (radialDistance <= safeRadius) {
            registerSuccessfulShot();
        }
    }

    state.ball.setLocalPosition(next.x, next.y, next.z);

    state.ballPreviousPosition = {
        x: next.x,
        y: next.y,
        z: next.z
    };

    // Le ballon est hors du terrain ou a touché le sol.
    if (
        next.y <= CONFIG.BALL_RADIUS ||
        Math.abs(next.x) > 30 ||
        Math.abs(next.z) > 35 ||
        state.ballFlightTime > 6
    ) {
        finishShot();
    }
}

function registerSuccessfulShot() {
    if (state.ballScored || state.scorePending) return;

    state.ballScored = true;
    state.scorePending = true;

    state.score++;
    state.progress++;

    const target = missionTarget(state.mission);

    setText(
        ui.shootMessage,
        `PANIER RÉUSSI ! ${state.progress}/${target}`
    );

    setText(ui.gameState, "Panier réussi !");
    announce("PANIER RÉUSSI !");
    vibrate([35, 45, 35]);

    updateDashboard();
    updateMissionUI();

    if (state.progress >= target) {
        completeMission();
    } else {
        // Un nouveau panier est attribué après chaque réussite.
        moveHoopToNextPosition();
    }

    scheduleSave();
}

function finishShot() {
    if (!state.ballInFlight) return;

    const wasScored = state.ballScored;

    state.ballInFlight = false;
    state.shotInProgress = false;
    state.ballVelocity = null;

    if (!wasScored) {
        setText(
            ui.shootMessage,
            "Tir manqué. Le ballon est illimité : essayez encore."
        );

        setText(ui.gameState, "Tir manqué — nouvel essai disponible");
    } else {
        setText(ui.gameState, "Prêt pour le prochain tir");
    }

    window.setTimeout(() => {
        if (state.ball && !state.ballInFlight) {
            resetBall();
        }
    }, 250);

    updateDashboard();
    scheduleSave();
}

/* ============================================================
   7. MISSIONS ET PROGRESSION
============================================================ */

function startMission(number = state.mission) {
    const requested = clamp(
        Math.floor(Number(number) || 1),
        1,
        CONFIG.TOTAL_MISSIONS
    );

    if (requested > state.unlockedMission) {
        announce("Terminez les missions précédentes pour débloquer celle-ci.");
        return;
    }

    if (state.ballInFlight) {
        announce("Attendez la fin du tir avant de changer de mission.");
        return;
    }

    state.mission = requested;

    if (!state.completedMissions.includes(requested)) {
        state.progress = 0;
    } else {
        // Une mission déjà terminée peut être rejouée.
        state.progress = 0;
    }

    state.aimRequested = false;

    state.hoop.x = CONFIG.INITIAL_HOOP_X;
    state.hoop.z = CONFIG.INITIAL_HOOP_Z;
    state.hoop.targetX = CONFIG.INITIAL_HOOP_X;
    state.hoop.targetZ = CONFIG.INITIAL_HOOP_Z;

    updateHoopVisuals();
    resetBall();

    renderMissions();
    updateMissionUI();
    updateDashboard();

    setText(ui.gameState, `Mission ${requested} prête`);
    setText(ui.missionFeedback, "Réussissez tous les tirs obligatoires.");

    setVisible(ui.loading, false);

    announce(`Mission ${requested} commencée.`);
    scheduleSave();
}

function completeMission() {
    const mission = state.mission;

    if (state.completedMissions.includes(mission)) {
        setText(ui.missionFeedback, "Mission déjà terminée.");
        return;
    }

    state.completedMissions.push(mission);
    state.completedMissions = [
        ...new Set(state.completedMissions)
    ];

    state.unlockedMission = Math.min(
        CONFIG.TOTAL_MISSIONS,
        Math.max(state.unlockedMission, mission + 1)
    );

    setText(
        ui.missionFeedback,
        `Mission ${mission} réussie ! Tous les tirs obligatoires sont validés.`
    );

    setText(ui.gameState, `Mission ${mission} terminée !`);
    setText(ui.shootMessage, "Mission réussie !");

    announce(`MISSION ${mission} RÉUSSIE !`, 3500);
    vibrate([60, 70, 120]);

    updateMissionUI();
    updateDashboard();
    renderMissions();

    if (mission < CONFIG.TOTAL_MISSIONS) {
        const nextButton = $("btn-start-mission");

        if (nextButton) {
            nextButton.textContent = `Mission suivante : ${mission + 1}`;
        }
    } else {
        setText(
            ui.missionFeedback,
            "Félicitations ! Vous avez terminé les 100 missions de FOBAS BASKET 3D."
        );

        announce("CHAMPION ! LES 100 MISSIONS SONT TERMINÉES.", 5000);
    }

    scheduleSave();
}

function restartCurrentMission() {
    if (state.ballInFlight) {
        announce("Attendez la fin du tir avant de recommencer.");
        return;
    }

    state.progress = 0;
    state.aimRequested = false;

    state.hoop.x = CONFIG.INITIAL_HOOP_X;
    state.hoop.z = CONFIG.INITIAL_HOOP_Z;

    updateHoopVisuals();
    resetBall();

    updateMissionUI();
    updateDashboard();

    setText(ui.missionFeedback, "Mission recommencée.");
    setText(ui.gameState, `Mission ${state.mission} prête`);

    scheduleSave();
}

function renderMissions() {
    if (!ui.missionsGrid) return;

    ui.missionsGrid.replaceChildren();

    const fragment = document.createDocumentFragment();

    for (let number = 1; number <= CONFIG.TOTAL_MISSIONS; number++) {
        const isUnlocked = number <= state.unlockedMission;
        const isCompleted = state.completedMissions.includes(number);
        const isCurrent = number === state.mission;

        const button = document.createElement("button");

        button.type = "button";
        button.className = "mission-card";

        if (isCurrent) button.classList.add("is-current");
        if (isCompleted) button.classList.add("is-completed");
        if (!isUnlocked) button.classList.add("is-locked");

        button.disabled = !isUnlocked;

        button.dataset.mission = String(number);

        button.setAttribute(
            "aria-label",
            `Mission ${number}, ${missionTarget(number)} changements de position` +
            (isCompleted ? ", terminée" : "") +
            (!isUnlocked ? ", verrouillée" : "")
        );

        const numberElement = document.createElement("span");
        numberElement.className = "mission-card-number";
        numberElement.textContent = String(number);

        const targetElement = document.createElement("span");
        targetElement.className = "mission-card-target";
        targetElement.textContent =
            `${missionTarget(number)} position${missionTarget(number) > 1 ? "s" : ""}`;

        const statusElement = document.createElement("span");
        statusElement.className = "mission-card-status";

        if (isCompleted) {
            statusElement.textContent = "✓";
        } else if (!isUnlocked) {
            statusElement.textContent = "🔒";
        } else if (isCurrent) {
            statusElement.textContent = "EN COURS";
        } else {
            statusElement.textContent = "JOUER";
        }

        button.append(
            numberElement,
            targetElement,
            statusElement
        );

        button.addEventListener("click", () => {
            startMission(number);
        });

        fragment.appendChild(button);
    }

    ui.missionsGrid.appendChild(fragment);

    setText(
        ui.completedCount,
        `${state.completedMissions.length} / ${CONFIG.TOTAL_MISSIONS} terminées`
    );
}

function updateMissionUI() {
    const target = missionTarget(state.mission);

    const progress = clamp(state.progress, 0, target);
    const percentage = Math.round((progress / target) * 100);

    setText(ui.missionHeading, `MISSION ${state.mission}`);
    setText(ui.missionDifficulty, missionDifficulty(state.mission));

    setText(
        ui.missionDescription,
        `Réussissez ${target} tir${target > 1 ? "s" : ""} exact${target > 1 ? "s" : ""} ` +
        `dans ${target} position${target > 1 ? "s différentes" : " différente"} du panier.`
    );

    setText(
        ui.missionTarget,
        `Réussir ${target} changement${target > 1 ? "s" : ""} de position`
    );

    setText(
        ui.missionProgressText,
        `${percentage}%`
    );

    if (ui.missionProgressBar) {
        ui.missionProgressBar.style.width = `${percentage}%`;
    }

    if (ui.missionProgressTrack) {
        ui.missionProgressTrack.setAttribute(
            "aria-valuenow",
            String(percentage)
        );
    }

    setText(
        ui.hudProgress,
        `${progress} / ${target}`
    );

    setText(
        ui.missionsMessage,
        `Mission ${state.mission} : ${target} position${target > 1 ? "s" : ""} à réussir.`
    );
}

function updateDashboard() {
    setText(
        ui.hudMission,
        `${state.mission} / ${CONFIG.TOTAL_MISSIONS}`
    );

    setText(ui.hudScore, state.score.toLocaleString("fr-FR"));

    setText(
        ui.hudProgress,
        `${state.progress} / ${missionTarget(state.mission)}`
    );
}

/* ============================================================
   8. CONTRÔLES DE CAMÉRA ET PINCEMENT ANDROID
============================================================ */

function setZoom(value) {
    state.zoom = clamp(
        value,
        CONFIG.MIN_ZOOM,
        CONFIG.MAX_ZOOM
    );

    if (state.camera) {
        const camera = state.camera;
        const currentPosition = camera.getLocalPosition();

        const target = state.cameraTarget;

        const directionX = currentPosition.x - target.x;
        const directionY = currentPosition.y - target.y;
        const directionZ = currentPosition.z - target.z;

        const length = Math.hypot(
            directionX,
            directionY,
            directionZ
        ) || 1;

        camera.setLocalPosition(
            target.x + (directionX / length) * state.zoom,
            target.y + (directionY / length) * state.zoom * 0.42,
            target.z + (directionZ / length) * state.zoom
        );

        camera.lookAt(target.x, target.y, target.z);
    }
}

function zoomIn() {
    setZoom(state.zoom - 1.0);
}

function zoomOut() {
    setZoom(state.zoom + 1.0);
}

function resetZoom() {
    state.zoom = CONFIG.INITIAL_ZOOM;

    if (state.camera) {
        state.camera.setLocalPosition(0, 7.0, 14.0);
        state.camera.lookAt(0, 1.5, -1.5);
    }
}

function pointerDistance(first, second) {
    return Math.hypot(
        first.x - second.x,
        first.y - second.y
    );
}

function setupPinchZoom() {
    if (!ui.viewport) return;

    ui.viewport.style.touchAction = "none";

    ui.viewport.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse") return;

        state.touch.points.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY
        });

        try {
            ui.viewport.setPointerCapture(event.pointerId);
        } catch (_) {
            // Capture non disponible : les événements tactiles continuent.
        }

        if (state.touch.points.size >= 2) {
            const points = [...state.touch.points.values()];

            state.touch.pinchDistance = pointerDistance(
                points[0],
                points[1]
            );

            state.touch.pinching = true;
        }
    }, { passive: true });

    ui.viewport.addEventListener("pointermove", (event) => {
        if (!state.touch.points.has(event.pointerId)) return;

        state.touch.points.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY
        });

        if (state.touch.points.size < 2) return;

        const points = [...state.touch.points.values()];

        const distance = pointerDistance(
            points[0],
            points[1]
        );

        if (state.touch.pinchDistance > 0) {
            const delta = distance - state.touch.pinchDistance;

            if (Math.abs(delta) > 1.5) {
                setZoom(state.zoom - delta * 0.025);
            }
        }

        state.touch.pinchDistance = distance;
        state.touch.pinching = true;
    }, { passive: true });

    const endPointer = (event) => {
        state.touch.points.delete(event.pointerId);

        if (state.touch.points.size < 2) {
            state.touch.pinchDistance = 0;
            state.touch.pinching = false;
        }
    };

    ui.viewport.addEventListener("pointerup", endPointer, {
        passive: true
    });

    ui.viewport.addEventListener("pointercancel", endPointer, {
        passive: true
    });

    ui.viewport.addEventListener("lostpointercapture", endPointer, {
        passive: true
    });
}

function resizeCanvas() {
    if (!state.app || !ui.canvas || !ui.viewport) return;

    const rect = ui.viewport.getBoundingClientRect();

    if (rect.width > 0 && rect.height > 0) {
        ui.canvas.style.width = `${rect.width}px`;
        ui.canvas.style.height = `${rect.height}px`;
    }

    try {
        state.app.resizeCanvas(
            Math.max(1, Math.round(rect.width)),
            Math.max(1, Math.round(rect.height))
        );
    } catch (error) {
        console.warn("Redimensionnement du canvas :", error);
    }
}

/* ============================================================
   9. DÉMONSTRATION DIEUBEN
============================================================ */

function demonstrateDieuben() {
    if (!state.sceneReady) {
        announce("DIEUBEN attend le chargement du terrain 3D.");
        return;
    }

    if (state.ballInFlight) {
        announce("Attendez la fin du tir avant la démonstration.");
        return;
    }

    state.demoActive = true;

    setText(ui.dieubenStatus, "Analyse de la cible...");
    announce("DIEUBEN prépare sa démonstration.");

    window.setTimeout(() => {
        if (!state.demoActive) return;

        const success = shootBall({ ai: true });

        if (success) {
            setText(ui.dieubenStatus, "Démonstration en cours");

            const finishDemo = () => {
                if (!state.ballInFlight) {
                    setText(
                        ui.dieubenStatus,
                        state.ballScored
                            ? "Démonstration réussie !"
                            : "Tir terminé — observez la trajectoire"
                    );

                    state.demoActive = false;
                    return;
                }

                window.setTimeout(finishDemo, 250);
            };

            window.setTimeout(finishDemo, 250);
        } else {
            setText(ui.dieubenStatus, "Prêt à démontrer");
            state.demoActive = false;
        }
    }, 500);
}

/* ============================================================
   10. PARAMÈTRES
============================================================ */

function renderSettings() {
    if (ui.sound) ui.sound.checked = state.settings.sound;
    if (ui.haptics) ui.haptics.checked = state.settings.haptics;

    if (ui.quality) {
        ui.quality.value = state.settings.quality;
    }
}

function saveSettings() {
    state.settings.sound = Boolean(ui.sound?.checked);
    state.settings.haptics = Boolean(ui.haptics?.checked);

    if (ui.quality) {
        const quality = ui.quality.value;

        if (["low", "medium", "high"].includes(quality)) {
            state.settings.quality = quality;
        }
    }

    if (state.app) {
        state.app.graphicsDevice.maxPixelRatio = Math.min(
            window.devicePixelRatio || 1,
            state.settings.quality === "high" ? 2 : 1
        );
    }

    setText(ui.settingsMessage, "Paramètres enregistrés.");
    scheduleSave();

    announce("Paramètres enregistrés.");
}

function toggleSettings() {
    const panel = $("settings-panel");

    if (!panel) return;

    setVisible(panel, panel.hidden);
}

/* ============================================================
   11. AIDE, PLEIN ÉCRAN ET RÉINITIALISATION
============================================================ */

function toggleHelp() {
    const content = $("how-to-play-content");
    const button = $("btn-how-to-play");

    if (!content || !button) return;

    const open = content.hidden;

    content.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
}

async function toggleFullscreen() {
    const target = $("app");

    if (!target) return;

    try {
        if (!document.fullscreenElement) {
            if (target.requestFullscreen) {
                await target.requestFullscreen();
            }
        } else if (document.exitFullscreen) {
            await document.exitFullscreen();
        }
    } catch (_) {
        announce("Le plein écran n'est pas disponible sur cet appareil.");
    }
}

function openConfirmation(title, message, action) {
    state.pendingAction = action;

    setText(ui.confirmationTitle, title);
    setText(ui.confirmationMessage, message);

    if (ui.confirmationDialog?.showModal) {
        ui.confirmationDialog.showModal();
    } else {
        const confirmed = window.confirm(message);

        if (confirmed) {
            executePendingAction();
        }

        state.pendingAction = null;
    }
}

function closeConfirmation() {
    if (ui.confirmationDialog?.open) {
        ui.confirmationDialog.close();
    }

    state.pendingAction = null;
}

function executePendingAction() {
    const action = state.pendingAction;

    closeConfirmation();

    if (action === "reset") {
        resetAllGameData();
    }
}

async function resetAllGameData() {
    if (state.ballInFlight) {
        announce("Attendez la fin du tir avant la réinitialisation.");
        return;
    }

    createDefaultState();

    state.profile.fullName = "";

    state.settings = {
        sound: true,
        haptics: true,
        quality: "medium"
    };

    await deleteDatabaseRecord("main");

    try {
        localStorage.removeItem(CONFIG.SAVE_KEY);
    } catch (_) {
        // Le stockage local peut être désactivé.
    }

    renderProfile();
    renderSettings();

    startMission(1);
    renderMissions();

    setText(ui.storageMessage, "Progression réinitialisée.");
    setText(ui.profileMessage, "");

    openProfileEditor();

    announce("Nouvelle partie prête.");
}

/* ============================================================
   12. ÉVÉNEMENTS DES BOUTONS HTML
============================================================ */

function handleAction(action) {
    switch (action) {
        case "save":
            saveGame();
            break;

        case "settings":
            toggleSettings();
            break;

        case "edit-profile":
            openProfileEditor();
            break;

        case "save-profile":
            saveProfile();
            break;

        case "cancel-profile":
            cancelProfileEditor();
            break;

        case "fullscreen":
            toggleFullscreen();
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

        case "aim":
            aimAtHoop();
            break;

        case "shoot":
            shootBall();
            break;

        case "start-mission":
            if (state.mission < state.unlockedMission) {
                startMission(state.mission);
            } else {
                startMission(state.mission);
            }
            break;

        case "restart-mission":
            restartCurrentMission();
            break;

        case "dieuben-demo":
            demonstrateDieuben();
            break;

        case "toggle-help":
            toggleHelp();
            break;

        case "save-settings":
            saveSettings();
            break;

        case "close-settings":
            setVisible($("settings-panel"), false);
            break;

        case "reset":
            openConfirmation(
                "Réinitialiser la partie ?",
                "Cette action effacera le profil, le score et la progression sauvegardée. Continuer ?",
                "reset"
            );
            break;

        case "confirm-yes":
            executePendingAction();
            break;

        case "confirm-no":
            closeConfirmation();
            break;

        default:
            console.warn("Action non reconnue :", action);
    }
}

function setupButtonEvents() {
    document.querySelectorAll("[data-action]").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.preventDefault();

            const action = element.dataset.action;

            if (action) {
                handleAction(action);
            }
        });
    });

    if (ui.aimPower) {
        ui.aimPower.addEventListener("input", updateAimLabels);
    }

    if (ui.aimAngle) {
        ui.aimAngle.addEventListener("input", updateAimLabels);
    }

    if (ui.confirmationDialog) {
        ui.confirmationDialog.addEventListener("click", (event) => {
            if (event.target === ui.confirmationDialog) {
                closeConfirmation();
            }
        });
    }
}

function updateAimLabels() {
    setText(
        ui.aimPowerValue,
        `${Number(ui.aimPower?.value || 50)}%`
    );

    setText(
        ui.aimAngleValue,
        `${Number(ui.aimAngle?.value || 45)}°`
    );
}

/* ============================================================
   13. BOUCLE DE JEU
============================================================ */

function updateGame(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return;

    const safeDelta = Math.min(dt, 0.05);

    updateBall(safeDelta);
}

/* ============================================================
   14. INITIALISATION DE L'APPLICATION
============================================================ */

async function initializeApplication() {
    if (state.initialized) return;

    state.initialized = true;

    setLoading("Préparation de FOBAS BASKET 3D...", 5);

    setupButtonEvents();
    setupPinchZoom();
    updateAimLabels();

    try {
        await loadGame();
    } catch (error) {
        console.warn("Chargement de la sauvegarde :", error);
    }

    renderMissions();
    updateMissionUI();
    updateDashboard();

    renderProfile();
    renderSettings();

    setLoading("Ouverture de l'arène 3D...", 20);

    const engineLoaded = await loadPlayCanvas();

    if (engineLoaded) {
        setText(ui.gameState, "Terrain 3D prêt");
        setText(ui.shootMessage, "Visez puis tirez.");
    } else {
        setText(
            ui.gameState,
            "Interface disponible — moteur 3D à vérifier"
        );

        setText(
            ui.shootMessage,
            "Vérifiez la connexion Internet puis rechargez pour activer le terrain 3D."
        );
    }

    updateDashboard();
    updateMissionUI();

    // Ne pas imposer la création du profil avant l'ouverture de l'interface.
    setVisible(ui.profileEditor, !state.profile.fullName);

    setText(
        ui.storageMessage,
        state.databaseAvailable
            ? "Sauvegarde locale prête."
            : "Mode de stockage de secours activé."
    );

    window.addEventListener("beforeunload", () => {
        try {
            const saved = serializeGame();
            writeLocalFallback(saved);
        } catch (_) {
            // La fermeture ne doit pas provoquer d'erreur visible.
        }
    });

    console.info("FOBAS BASKET 3D : initialisation terminée.");
}

/* ============================================================
   15. DÉMARRAGE SÛR
============================================================ */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeApplication,
        { once: true }
    );
} else {
    initializeApplication();
}
