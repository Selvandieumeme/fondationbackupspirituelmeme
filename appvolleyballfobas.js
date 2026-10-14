/* ============================================================
   FOBAS VOLLEYBALL CHAMPIONS 3D
   Fichier : appvolleyballfobas.js
   Version : 1.0.0
   Engine  : PlayCanvas 2.23.2
   Stockage: IndexedDB
   Cible   : Android, tablette, ordinateur

   Architecture :
   - Import dynamique de PlayCanvas
   - Terrain et joueurs 3D procéduraux
   - 11 joueurs par équipe
   - Ballon avec physique simplifiée
   - Contrôles tactiles et clavier
   - IA des deux équipes
   - 40 missions
   - Championnats et tournois
   - Sauvegarde IndexedDB
============================================================ */

(() => {
    "use strict";

    /* ========================================================
       01. CONFIGURATION
    ======================================================== */

    const CONFIG = window.FOBAS_VOLLEYBALL_CONFIG || {};

    const VERSION = CONFIG.version || "1.0.0";
    const DB_NAME =
        CONFIG.database || "FOBAS_VOLLEYBALL_CHAMPIONS_DB";

    const DB_VERSION = Number(CONFIG.databaseVersion) || 1;

    const MISSION_COUNT = 40;
    const PLAYERS_PER_TEAM = 11;

    const PC_MODULE_URL =
        "https://esm.sh/playcanvas@2.23.2";

    const $ = (id) => document.getElementById(id);

    const $$ = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const lerp = (a, b, t) =>
        a + (b - a) * t;

    const distance2D = (a, b) =>
        Math.hypot(a.x - b.x, a.z - b.z);

    const random = (min, max) =>
        min + Math.random() * (max - min);

    const formatTime = (seconds) => {
        const total = Math.max(0, Math.floor(seconds));

        const minutes = String(Math.floor(total / 60))
            .padStart(2, "0");

        const secs = String(total % 60)
            .padStart(2, "0");

        return `${minutes}:${secs}`;
    };

    const escapeHTML = (value) =>
        String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    const DEFAULT_NAMES = Array.isArray(CONFIG.playerNames)
        ? CONFIG.playerNames
        : [
            "Ranise",
            "MEME",
            "Kerlande",
            "Nina",
            "Dieuben",
            "Junior",
            "Monise",
            "Lise",
            "Selvandieu",
            "Natacha",
            "Sabine",
            "Ricardo",
            "Raoul",
            "Toutin",
            "Ydeja",
            "Lannda"
        ];

    const TEAM_NAMES = [
        "FOBAS LEGENDS",
        "MASTER STARS",
        "ROYAL VOLLEY",
        "CARIBBEAN ELITE",
        "RISING CHAMPIONS",
        "HAITI TITANS",
        "OCEAN WARRIORS",
        "GOLDEN EAGLES",
        "PORT-DE-PAIX CLUB",
        "WORLD ACES"
    ];

    const MISSION_TITLES = [
        "Premiers pas sur le terrain",
        "Le premier service",
        "Maîtriser la réception",
        "Les passes décisives",
        "L'attaque gagnante",
        "Premier blocage",
        "Défi des six points",
        "Les maîtres du filet",
        "Combat caribéen",
        "Le match de revanche",
        "La défense parfaite",
        "Service puissant",
        "Le mur défensif",
        "L'attaque rapide",
        "Le défi des champions",
        "La coupe régionale",
        "Les étoiles montantes",
        "Duel des capitaines",
        "La remontée historique",
        "La série victorieuse",
        "Le tournoi des îles",
        "Les guerriers du sable",
        "Le test des maîtres",
        "La finale régionale",
        "Le choc des titans",
        "La conquête du championnat",
        "Le défi international",
        "Le roi du smash",
        "La défense ultime",
        "Le grand tournoi",
        "La bataille des légendes",
        "L'épreuve de Ranise",
        "La puissance de MEME",
        "Les champions des Caraïbes",
        "La route vers la finale",
        "L'élite mondiale",
        "Le duel des immortels",
        "La finale des maîtres",
        "La couronne mondiale",
        "L'ultime légende FOBAS"
    ];

    const BALL_STYLES = {
        classic: {
            name: "Classique",
            colors: [
                [0.96, 0.97, 1],
                [0.05, 0.55, 0.85],
                [0.95, 0.65, 0.12]
            ],
            emissive: [0, 0, 0]
        },

        gold: {
            name: "Champion",
            colors: [
                [1, 0.76, 0.12],
                [0.96, 0.91, 0.62],
                [0.75, 0.37, 0.04]
            ],
            emissive: [0.12, 0.07, 0]
        },

        ocean: {
            name: "Océan",
            colors: [
                [0.02, 0.82, 0.94],
                [0.02, 0.22, 0.70],
                [0.70, 0.96, 1]
            ],
            emissive: [0, 0.03, 0.08]
        },

        fire: {
            name: "Flamme",
            colors: [
                [1, 0.25, 0.04],
                [1, 0.72, 0.05],
                [0.78, 0.04, 0.02]
            ],
            emissive: [0.12, 0.015, 0]
        }
    };

    const KIT_STYLES = {
        royal: {
            name: "Royal",
            home: [0.04, 0.31, 0.88],
            away: [0.84, 0.08, 0.18]
        },

        ocean: {
            name: "Océan",
            home: [0.00, 0.66, 0.74],
            away: [0.04, 0.20, 0.62]
        },

        fire: {
            name: "Flamme",
            home: [0.96, 0.24, 0.04],
            away: [0.75, 0.05, 0.10]
        }
    };

    const clampColor = (color) =>
        color.map((v) => clamp(v, 0, 1));

    /* ========================================================
       02. ÉTAT CENTRAL
    ======================================================== */

    const state = {
        initialized: false,
        engineReady: false,
        engineError: null,

        app: null,
        pc: null,
        camera: null,
        cameraEntity: null,
        lightEntity: null,

        db: null,

        running: false,
        paused: false,
        matchEnded: false,
        matchStarted: false,

        mode: "career",

        mission: 1,
        completedMissions: [],
        unlockedMission: 1,

        homeTeam: "FOBAS LEGENDS",
        awayTeam: "MASTER STARS",

        homeScore: 0,
        awayScore: 0,

        homeSets: 0,
        awaySets: 0,
        currentSet: 1,

        wins: 0,
        matches: 0,
        trophies: 0,

        matchTime: 0,
        lastFrame: 0,

        activeTeam: "home",
        activePlayerIndex: 0,

        ball: null,
        ballVelocity: { x: 0, y: 0, z: 0 },
        ballOwner: null,
        ballInFlight: false,
        ballTrail: [],

        teams: {
            home: [],
            away: []
        },

        sceneObjects: [],
        courtObjects: [],

        homeColor: [0.04, 0.31, 0.88],
        awayColor: [0.84, 0.08, 0.18],

        ballStyle: "classic",
        kitStyle: "royal",

        zoom: 1,
        targetZoom: 1,

        joystick: {
            active: false,
            pointerId: null,
            x: 0,
            y: 0
        },

        keyboard: Object.create(null),

        pointerPositions: new Map(),
        pinchDistance: 0,

        soundEnabled: true,
        musicVolume: 0.55,
        effectsVolume: 0.75,
        crowdSound: true,
        graphicsQuality: "high",

        audioContext: null,
        masterGain: null,
        musicGain: null,
        effectsGain: null,
        musicTimer: null,

        notificationTimer: null,
        messageTimer: null,

        dbAvailable: false,

        profileName: "Champion FOBAS",
        profileTeam: "FOBAS LEGENDS",

        lastSave: null,

        missionStats: {
            points: 0,
            smashes: 0,
            blocks: 0,
            passes: 0,
            serves: 0,
            elapsed: 0
        },

        matchId: 0,
        rallyId: 0,
        lastPointTime: -10,

        aiTimer: 0,
        pointPause: 0,

        pendingDialogAction: null,

        // Dimensions du terrain.
        courtWidth: 18,
        courtLength: 30,
        netHeight: 2.43,

        // Paramètres de simulation.
        gravity: -11.5,
        ballRadius: 0.28
    };

    /* ========================================================
       03. UTILITAIRES DOM
    ======================================================== */

    function on(id, event, handler, options) {
        const element = $(id);

        if (!element) {
            return;
        }

        element.addEventListener(event, handler, options);
    }

    function setText(id, value) {
        const element = $(id);

        if (element) {
            element.textContent = String(value);
        }
    }

    function setVisible(id, visible) {
        const element = $(id);

        if (!element) {
            return;
        }

        element.hidden = !visible;
        element.style.display = visible ? "" : "none";
    }

    function setLoadingProgress(percent, message) {
        const progress = $("loadingProgress");

        if (progress) {
            const value = clamp(percent, 0, 100);

            progress.style.width = `${value}%`;
            progress.setAttribute("aria-valuenow", String(value));
        }

        if (message) {
            setText("loadingMessage", message);
        }
    }

    function notify(message, type = "info", duration = 2800) {
        const element = $("notification");

        if (!element) {
            console.log("[FOBAS]", message);
            return;
        }

        clearTimeout(state.notificationTimer);

        element.textContent = String(message);
        element.className = "notification show";

        if (type === "success") {
            element.classList.add("success");
        }

        if (type === "error") {
            element.classList.add("error");
        }

        state.notificationTimer = setTimeout(() => {
            element.classList.remove("show", "is-visible");
        }, duration);
    }

    function showGameMessage(message, duration = 2200) {
        const element = $("gameMessage");

        if (!element) {
            return;
        }

        clearTimeout(state.messageTimer);

        element.textContent = String(message);
        element.hidden = false;
        element.style.opacity = "1";

        state.messageTimer = setTimeout(() => {
            if (!state.matchStarted || state.matchEnded) {
                return;
            }

            element.style.opacity = "0";
        }, duration);
    }

    function closeAllPanels() {
        [
            "profilePanel",
            "careerPanel",
            "championshipPanel",
            "teamsPanel",
            "equipmentPanel",
            "howToPlayPanel",
            "settingsPanel"
        ].forEach((id) => setVisible(id, false));
    }

    function openPanel(id) {
        if (state.running && !state.matchEnded) {
            pauseGame();
        }

        closeAllPanels();
        setVisible("matchResultPanel", false);
        setVisible(id, true);
    }

    function hideLoading() {
        const screen = $("loadingScreen");

        if (!screen) {
            return;
        }

        screen.style.opacity = "0";
        screen.style.pointerEvents = "none";

        setTimeout(() => {
            screen.hidden = true;
            screen.style.display = "none";
        }, 350);
    }

    /* ========================================================
       04. INDEXEDDB
    ======================================================== */

    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!("indexedDB" in window)) {
                reject(new Error("IndexedDB non disponible."));
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

                if (!db.objectStoreNames.contains("gameData")) {
                    db.createObjectStore("gameData", {
                        keyPath: "key"
                    });
                }
            };

            request.onsuccess = () => {
                state.db = request.result;
                state.dbAvailable = true;

                state.db.onversionchange = () => {
                    state.db.close();
                    state.db = null;
                    state.dbAvailable = false;
                };

                resolve(state.db);
            };

            request.onerror = () => {
                reject(
                    request.error ||
                    new Error("Impossible d'ouvrir IndexedDB.")
                );
            };

            request.onblocked = () => {
                console.warn(
                    "[FOBAS] Ouverture IndexedDB bloquée."
                );
            };
        });
    }

    function dbGet(key) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                reject(new Error("Base de données indisponible."));
                return;
            }

            const tx = state.db.transaction(
                ["gameData"],
                "readonly"
            );

            const request = tx.objectStore("gameData").get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };

            request.onerror = () => reject(request.error);
        });
    }

    function dbPut(key, value) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                reject(new Error("Base de données indisponible."));
                return;
            }

            const tx = state.db.transaction(
                ["gameData"],
                "readwrite"
            );

            tx.objectStore("gameData").put({
                key,
                value,
                updatedAt: Date.now()
            });

            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error);
        });
    }

    function dbDelete(key) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                reject(new Error("Base de données indisponible."));
                return;
            }

            const tx = state.db.transaction(
                ["gameData"],
                "readwrite"
            );

            tx.objectStore("gameData").delete(key);

            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    }

    function saveState() {
        const data = {
            version: VERSION,

            mission: state.mission,
            completedMissions: state.completedMissions,
            unlockedMission: state.unlockedMission,

            homeTeam: state.homeTeam,
            awayTeam: state.awayTeam,

            wins: state.wins,
            matches: state.matches,
            trophies: state.trophies,

            profileName: state.profileName,
            profileTeam: state.profileTeam,

            ballStyle: state.ballStyle,
            kitStyle: state.kitStyle,

            soundEnabled: state.soundEnabled,
            musicVolume: state.musicVolume,
            effectsVolume: state.effectsVolume,
            crowdSound: state.crowdSound,
            graphicsQuality: state.graphicsQuality,

            homeSets: state.homeSets,
            awaySets: state.awaySets,

            savedAt: Date.now()
        };

        return dbPut("gameState", data)
            .then(() => {
                state.lastSave = Date.now();

                setText(
                    "saveStatus",
                    `Sauvegarde réussie · ${new Date().toLocaleTimeString()}`
                );

                return true;
            })
            .catch((error) => {
                console.error("[FOBAS] Sauvegarde :", error);

                try {
                    localStorage.setItem(
                        `${DB_NAME}_fallback`,
                        JSON.stringify(data)
                    );

                    setText(
                        "saveStatus",
                        "Sauvegarde locale de secours effectuée."
                    );

                    return true;
                } catch (fallbackError) {
                    console.error(fallbackError);

                    notify(
                        "La sauvegarde a échoué. Vérifiez le stockage du navigateur.",
                        "error"
                    );

                    return false;
                }
            });
    }

    async function loadState() {
        let data = null;

        try {
            data = await dbGet("gameState");
        } catch (error) {
            console.warn("[FOBAS] Lecture IndexedDB :", error);
        }

        if (!data) {
            try {
                const raw = localStorage.getItem(
                    `${DB_NAME}_fallback`
                );

                if (raw) {
                    data = JSON.parse(raw);
                }
            } catch (error) {
                console.warn("[FOBAS] Lecture de secours :", error);
            }
        }

        if (!data || typeof data !== "object") {
            notify(
                "Aucune sauvegarde trouvée. Une nouvelle carrière est prête.",
                "info"
            );

            return false;
        }

        state.mission = clamp(
            Number(data.mission) || 1,
            1,
            MISSION_COUNT
        );

        state.completedMissions = Array.isArray(data.completedMissions)
            ? data.completedMissions
                .map(Number)
                .filter((n) => n >= 1 && n <= MISSION_COUNT)
            : [];

        state.unlockedMission = clamp(
            Number(data.unlockedMission) || 1,
            1,
            MISSION_COUNT
        );

        state.homeTeam = data.homeTeam || "FOBAS LEGENDS";
        state.awayTeam = data.awayTeam || "MASTER STARS";

        state.wins = Math.max(0, Number(data.wins) || 0);
        state.matches = Math.max(0, Number(data.matches) || 0);
        state.trophies = Math.max(0, Number(data.trophies) || 0);

        state.profileName =
            String(data.profileName || "Champion FOBAS").slice(0, 30);

        state.profileTeam = data.profileTeam || "FOBAS LEGENDS";

        state.ballStyle = BALL_STYLES[data.ballStyle]
            ? data.ballStyle
            : "classic";

        state.kitStyle = KIT_STYLES[data.kitStyle]
            ? data.kitStyle
            : "royal";

        state.soundEnabled = data.soundEnabled !== false;

        state.musicVolume = clamp(
            Number(data.musicVolume ?? 0.55),
            0,
            1
        );

        state.effectsVolume = clamp(
            Number(data.effectsVolume ?? 0.75),
            0,
            1
        );

        state.crowdSound = data.crowdSound !== false;

        state.graphicsQuality = [
            "high",
            "medium",
            "low"
        ].includes(data.graphicsQuality)
            ? data.graphicsQuality
            : "high";

        syncSettingsUI();
        syncProfileUI();
        updateMissionUI();
        updateEquipmentUI();

        if ($("homeTeamSelect")) {
            $("homeTeamSelect").value = state.homeTeam;
        }

        if ($("awayTeamSelect")) {
            $("awayTeamSelect").value = state.awayTeam;
        }

        if (state.engineReady) {
            applyKitColors();
            applyBallStyle();
        }

        setText("saveStatus", "Sauvegarde chargée avec succès.");

        notify("Votre progression a été chargée.", "success");

        return true;
    }

    /* ========================================================
       05. MATÉRIAUX PLAYCANVAS
    ======================================================== */

    function makeMaterial(color, options = {}) {
        const pc = state.pc;

        const material = new pc.StandardMaterial();

        material.diffuse = new pc.Color(
            color[0],
            color[1],
            color[2]
        );

        material.metalness = options.metalness ?? 0;
        material.roughness = options.roughness ?? 0.72;

        if (options.emissive) {
            material.emissive = new pc.Color(
                options.emissive[0],
                options.emissive[1],
                options.emissive[2]
            );
        }

        if (options.opacity !== undefined) {
            material.opacity = options.opacity;

            if (options.opacity < 1) {
                material.blendType = pc.BLEND_NORMAL;
                material.depthWrite = false;
            }
        }

        material.update();

        return material;
    }

    function createPrimitive(
        name,
        type,
        position,
        scale,
        material,
        parent = null
    ) {
        const pc = state.pc;

        const entity = new pc.Entity(name);

        entity.addComponent("render", {
            type,
            material
        });

        entity.setLocalPosition(
            position[0],
            position[1],
            position[2]
        );

        entity.setLocalScale(
            scale[0],
            scale[1],
            scale[2]
        );

        (parent || state.app.root).addChild(entity);

        state.sceneObjects.push(entity);

        return entity;
    }

    function setPosition(entity, x, y, z) {
        if (!entity || !entity.enabled) {
            return;
        }

        entity.setPosition(x, y, z);
    }

    function addBox(
        name,
        position,
        scale,
        color,
        parent = null,
        options = {}
    ) {
        return createPrimitive(
            name,
            "box",
            position,
            scale,
            makeMaterial(color, options),
            parent
        );
    }

    function addSphere(
        name,
        position,
        scale,
        color,
        parent = null,
        options = {}
    ) {
        return createPrimitive(
            name,
            "sphere",
            position,
            scale,
            makeMaterial(color, options),
            parent
        );
    }

    function addCylinder(
        name,
        position,
        scale,
        color,
        parent = null,
        options = {}
    ) {
        return createPrimitive(
            name,
            "cylinder",
            position,
            scale,
            makeMaterial(color, options),
            parent
        );
    }

    /* ========================================================
       06. INITIALISATION DU MOTEUR 3D
    ======================================================== */

    async function initializeEngine() {
        setLoadingProgress(
            8,
            "Chargement dynamique de PlayCanvas..."
        );

        const pc = await import(PC_MODULE_URL);

        state.pc = pc;

        const canvas = $("volleyballCanvas");

        if (!canvas) {
            throw new Error("Canvas volleyballCanvas introuvable.");
        }

        setLoadingProgress(20, "Création du moteur graphique...");

        const app = new pc.Application(canvas, {
            graphicsDeviceOptions: {
                antialias: true,
                alpha: false,
                powerPreference: "high-performance",
                preserveDrawingBuffer: false
            },

            mouse: new pc.Mouse(canvas),
            touch: new pc.TouchDevice(canvas)
        });

        state.app = app;

        app.scene.ambientLight = new pc.Color(
            0.42,
            0.47,
            0.58
        );

        app.scene.gammaCorrection = pc.GAMMA_SRGB;
        app.scene.toneMapping = pc.TONEMAP_ACES;

        if ("exposure" in app.scene) {
            app.scene.exposure = 1.12;
        }

        app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        app.setCanvasResolution(pc.RESOLUTION_AUTO);

        const camera = new pc.Entity("FOBAS Main Camera");

        camera.addComponent("camera", {
            clearColor: new pc.Color(
                0.36,
                0.60,
                0.77
            ),

            farClip: 180,
            nearClip: 0.1,
            fov: 53
        });

        app.root.addChild(camera);

        state.camera = camera.camera;
        state.cameraEntity = camera;

        setPosition(camera, 0, 18, 24);
        camera.lookAt(0, 0, 0);

        const light = new pc.Entity("FOBAS Sun Light");

        light.addComponent("light", {
            type: "directional",
            color: new pc.Color(1, 0.91, 0.78),
            intensity: 1.7,
            castShadows: state.graphicsQuality !== "low",
            shadowResolution: 1024,
            shadowDistance: 65
        });

        light.setEulerAngles(48, -35, 0);

        app.root.addChild(light);

        state.lightEntity = light;

        createStadium();
        createCourt();
        createNet();
        createAudience();
        createBall();
        createTeams();

        app.on("update", updateGame);

        app.start();

        state.engineReady = true;

        resizeCanvas();
        updateCamera();

        setText(
            "engineStatus",
            "PLAYCANVAS 3D · MOTEUR ACTIF"
        );

        setVisible("stadiumLoader", false);

        setLoadingProgress(
            100,
            "Le stade est prêt. Bienvenue, champion !"
        );

        return true;
    }

    /* ========================================================
       07. STADE ET ENVIRONNEMENT
    ======================================================== */

    function createStadium() {
        const pc = state.pc;

        const skyMaterial = makeMaterial(
            [0.22, 0.49, 0.70],
            {
                roughness: 1
            }
        );

        addSphere(
            "Distant sky dome",
            [0, 15, 0],
            [95, 60, 95],
            [0.26, 0.52, 0.72]
        );

        // Sol général.
        addBox(
            "Stadium ground",
            [0, -0.32, 0],
            [110, 0.4, 100],
            [0.12, 0.34, 0.27]
        );

        // Pelouse extérieure.
        addBox(
            "Outer field",
            [0, -0.09, 0],
            [80, 0.05, 70],
            [0.16, 0.43, 0.28]
        );

        // Tribunes de chaque côté.
        const standsMaterial = makeMaterial(
            [0.12, 0.19, 0.31],
            {
                roughness: 0.92
            }
        );

        addBox(
            "North grandstand",
            [0, 2.0, -22],
            [48, 4, 5],
            [0.10, 0.17, 0.27]
        );

        addBox(
            "South grandstand",
            [0, 2.0, 22],
            [48, 4, 5],
            [0.10, 0.17, 0.27]
        );

        addBox(
            "West grandstand",
            [-25, 2.0, 0],
            [5, 4, 35],
            [0.09, 0.15, 0.25]
        );

        addBox(
            "East grandstand",
            [25, 2.0, 0],
            [5, 4, 35],
            [0.09, 0.15, 0.25]
        );

        // Barrières et poteaux.
        const poleColor = [0.62, 0.72, 0.80];

        [-24, 24].forEach((x) => {
            [-18, 18].forEach((z) => {
                addCylinder(
                    "Stadium support",
                    [x, 2.4, z],
                    [0.14, 4.8, 0.14],
                    poleColor
                );
            });
        });

        // Projecteurs.
        const lampMaterial = makeMaterial(
            [1, 0.92, 0.68],
            {
                emissive: [1, 0.77, 0.38]
            }
        );

        [-19, 19].forEach((x) => {
            [-17, 17].forEach((z) => {
                addBox(
                    "Stadium floodlight",
                    [x, 8, z],
                    [1.7, 0.18, 1],
                    [0.25, 0.32, 0.42]
                );

                addSphere(
                    "Floodlight glow",
                    [x, 7.87, z],
                    [0.45, 0.14, 0.35],
                    [1, 0.86, 0.61],
                    null,
                    {
                        emissive: [0.8, 0.58, 0.21]
                    }
                );
            });
        });

        // Palmiers décoratifs, en bordure.
        const palmTrunk = [0.36, 0.24, 0.13];
        const palmLeaves = [0.06, 0.34, 0.16];

        const palmPositions = [
            [-31, -26],
            [-25, -28],
            [-18, -29],
            [18, -29],
            [25, -28],
            [31, -26],
            [-31, 26],
            [-24, 28],
            [24, 28],
            [31, 26]
        ];

        palmPositions.forEach(([x, z], index) => {
            addCylinder(
                `Palm trunk ${index}`,
                [x, 2.1, z],
                [0.34, 4.2, 0.34],
                palmTrunk
            );

            for (let i = 0; i < 5; i++) {
                const angle = i * Math.PI * 2 / 5;

                const leaf = addBox(
                    `Palm leaf ${index}-${i}`,
                    [
                        x + Math.cos(angle) * 1.15,
                        4.1,
                        z + Math.sin(angle) * 1.15
                    ],
                    [2.1, 0.11, 0.42],
                    palmLeaves
                );

                leaf.setEulerAngles(
                    random(-12, 12),
                    -angle * 180 / Math.PI,
                    random(-8, 8)
                );
            }
        });

        // Panneaux lumineux.
        const signMaterial = makeMaterial(
            [0.02, 0.13, 0.23],
            {
                emissive: [0.01, 0.06, 0.10]
            }
        );

        addBox(
            "FOBAS arena sign",
            [0, 5.8, -25],
            [15, 1.3, 0.25],
            [0.02, 0.20, 0.32],
            null,
            {
                emissive: [0.02, 0.08, 0.12]
            }
        );

        // Décoration au-dessus du stade.
        const ring = addCylinder(
            "Central decorative ring",
            [0, 9, 0],
            [1.2, 0.16, 1.2],
            [0.08, 0.42, 0.65],
            null,
            {
                emissive: [0.02, 0.10, 0.16]
            }
        );

        ring.enabled = true;
    }

    /* ========================================================
       08. TERRAIN DE VOLLEYBALL
    ======================================================== */

    function createCourt() {
        const W = state.courtWidth;
        const L = state.courtLength;

        // Terrain bleu professionnel.
        addBox(
            "Court surface",
            [0, 0.03, 0],
            [W, 0.12, L],
            [0.035, 0.24, 0.53],
            null,
            {
                roughness: 0.88
            }
        );

        // Zones extérieures.
        addBox(
            "Court left apron",
            [-W / 2 - 1.2, 0.01, 0],
            [2.4, 0.06, L + 2.4],
            [0.13, 0.40, 0.34]
        );

        addBox(
            "Court right apron",
            [W / 2 + 1.2, 0.01, 0],
            [2.4, 0.06, L + 2.4],
            [0.13, 0.40, 0.34]
        );

        addBox(
            "Court north apron",
            [0, 0.01, -L / 2 - 1.2],
            [W + 4.8, 0.06, 2.4],
            [0.13, 0.40, 0.34]
        );

        addBox(
            "Court south apron",
            [0, 0.01, L / 2 + 1.2],
            [W + 4.8, 0.06, 2.4],
            [0.13, 0.40, 0.34]
        );

        const lineMaterial = makeMaterial(
            [0.98, 0.99, 1],
            {
                emissive: [0.05, 0.05, 0.05]
            }
        );

        const lineY = 0.105;
        const lineWidth = 0.075;

        // Lignes latérales.
        [-W / 2, W / 2].forEach((x, i) => {
            addBox(
                `Sideline ${i}`,
                [x, lineY, 0],
                [lineWidth, 0.025, L],
                [0.98, 0.99, 1]
            );
        });

        // Lignes de fond.
        [-L / 2, L / 2].forEach((z, i) => {
            addBox(
                `Baseline ${i}`,
                [0, lineY, z],
                [W, 0.025, lineWidth],
                [0.98, 0.99, 1]
            );
        });

        // Lignes d'attaque.
        [-4.5, 4.5].forEach((z, i) => {
            addBox(
                `Attack line ${i}`,
                [0, lineY, z],
                [W, 0.025, lineWidth],
                [0.98, 0.99, 1]
            );
        });

        // Marquage central.
        addBox(
            "Center mark",
            [0, lineY + 0.003, 0],
            [W, 0.025, 0.07],
            [0.98, 0.99, 1]
        );

        // Marques discrètes de zone.
        [-W / 4, W / 4].forEach((x, i) => {
            addBox(
                `Court zone marker ${i}`,
                [x, 0.11, 0],
                [0.045, 0.015, L],
                [0.08, 0.35, 0.63]
            );
        });
    }

    /* ========================================================
       09. FILET
    ======================================================== */

    function createNet() {
        const W = state.courtWidth;
        const H = state.netHeight;

        // Deux poteaux.
        [-W / 2 - 0.25, W / 2 + 0.25].forEach((x, i) => {
            addCylinder(
                `Net post ${i}`,
                [x, H / 2, 0],
                [0.12, H + 0.35, 0.12],
                [0.83, 0.87, 0.91],
                null,
                {
                    metalness: 0.55,
                    roughness: 0.35
                }
            );
        });

        // Bande supérieure.
        addBox(
            "Net top tape",
            [0, H, 0],
            [W + 0.25, 0.13, 0.12],
            [0.98, 0.98, 1]
        );

        // Bande inférieure.
        addBox(
            "Net bottom tape",
            [0, 0.2, 0],
            [W, 0.08, 0.10],
            [0.90, 0.94, 1]
        );

        // Filet composé de bandes fines.
        const netColor = [0.84, 0.90, 0.95];

        for (let x = -W / 2; x <= W / 2 + 0.01; x += 0.55) {
            addBox(
                "Net vertical mesh",
                [x, H / 2, 0],
                [0.018, H - 0.25, 0.025],
                netColor
            );
        }

        for (let y = 0.3; y <= H - 0.1; y += 0.28) {
            addBox(
                "Net horizontal mesh",
                [0, y, 0],
                [W, 0.018, 0.025],
                netColor
            );
        }
    }

    /* ========================================================
       10. PUBLIC
    ======================================================== */

    function createAudience() {
        const skinColors = [
            [0.67, 0.43, 0.28],
            [0.36, 0.22, 0.15],
            [0.83, 0.64, 0.48],
            [0.51, 0.33, 0.23]
        ];

        const shirtColors = [
            [0.05, 0.40, 0.75],
            [0.84, 0.12, 0.18],
            [0.91, 0.63, 0.08],
            [0.06, 0.57, 0.37],
            [0.55, 0.22, 0.78],
            [0.89, 0.89, 0.93]
        ];

        const positions = [];

        // Tribunes du fond et de devant.
        for (let row = 0; row < 3; row++) {
            for (let i = 0; i < 22; i++) {
                positions.push([
                    -22 + i * 2.05,
                    4.0 + row * 0.35,
                    -22.8 - row * 0.72
                ]);

                positions.push([
                    -22 + i * 2.05,
                    4.0 + row * 0.35,
                    22.8 + row * 0.72
                ]);
            }
        }

        // Tribunes latérales.
        for (let row = 0; row < 3; row++) {
            for (let i = 0; i < 15; i++) {
                positions.push([
                    -26.4 - row * 0.5,
                    4.0 + row * 0.35,
                    -14 + i * 2
                ]);

                positions.push([
                    26.4 + row * 0.5,
                    4.0 + row * 0.35,
                    -14 + i * 2
                ]);
            }
        }

        positions.forEach(([x, y, z], index) => {
            const skin = skinColors[
                Math.floor(Math.random() * skinColors.length)
            ];

            const shirt = shirtColors[
                Math.floor(Math.random() * shirtColors.length)
            ];

            const root = new state.pc.Entity(
                `Spectator ${index + 1}`
            );

            root.setLocalPosition(
                x + random(-0.25, 0.25),
                y,
                z
            );

            state.app.root.addChild(root);

            addSphere(
                `Spectator head ${index}`,
                [0, 0.35, 0],
                [0.17, 0.19, 0.17],
                skin,
                root
            );

            addBox(
                `Spectator body ${index}`,
                [0, 0.03, 0],
                [0.34, 0.42, 0.22],
                shirt,
                root
            );

            if (index % 7 === 0) {
                addBox(
                    `Spectator raised arm ${index}`,
                    [0.24, 0.2, 0],
                    [0.09, 0.42, 0.10],
                    skin,
                    root
                );
            }
        });
    }

    /* ========================================================
       11. MODÈLE DU BALLON
    ======================================================== */

    function createBall() {
        const pc = state.pc;

        const root = new pc.Entity("FOBAS Volleyball");

        state.app.root.addChild(root);

        const style = BALL_STYLES[state.ballStyle];

        const baseMaterial = makeMaterial(
            style.colors[0],
            {
                roughness: 0.35,
                metalness: 0.03,
                emissive: style.emissive
            }
        );

        const ballSphere = new pc.Entity("Ball Sphere");

        ballSphere.addComponent("render", {
            type: "sphere",
            material: baseMaterial
        });

        ballSphere.setLocalScale(
            state.ballRadius * 2,
            state.ballRadius * 2,
            state.ballRadius * 2
        );

        root.addChild(ballSphere);

        // Segments décoratifs.
        for (let i = 0; i < 3; i++) {
            const stripeMaterial = makeMaterial(
                style.colors[(i + 1) % style.colors.length],
                {
                    roughness: 0.42,
                    emissive: style.emissive
                }
            );

            const stripe = new pc.Entity(
                `Ball stripe ${i}`
            );

            stripe.addComponent("render", {
                type: "box",
                material: stripeMaterial
            });

            stripe.setLocalScale(0.025, 0.53, 0.53);

            stripe.setEulerAngles(
                i * 52,
                i * 67,
                i * 38
            );

            root.addChild(stripe);
        }

        root.setPosition(0, 2.4, 12);

        state.ball = root;

        return root;
    }

    function applyBallStyle() {
        if (!state.ball || !state.pc) {
            return;
        }

        const style = BALL_STYLES[state.ballStyle];

        const renderEntity = state.ball.children[0];

        if (renderEntity && renderEntity.render) {
            renderEntity.render.material = makeMaterial(
                style.colors[0],
                {
                    roughness: 0.35,
                    metalness: 0.03,
                    emissive: style.emissive
                }
            );
        }

        state.ball.children.slice(1).forEach((stripe, index) => {
            if (!stripe.render) {
                return;
            }

            stripe.render.material = makeMaterial(
                style.colors[(index + 1) % style.colors.length],
                {
                    roughness: 0.42,
                    emissive: style.emissive
                }
            );
        });
    }

    /* ========================================================
       12. MODÈLE D'UN JOUEUR
    ======================================================== */

    function createPlayer(name, team, index, color, bench = false) {
        const pc = state.pc;

        const root = new pc.Entity(
            `${team}-${name}-${index}`
        );

        state.app.root.addChild(root);

        const skinColors = [
            [0.67, 0.43, 0.28],
            [0.40, 0.24, 0.16],
            [0.81, 0.61, 0.44],
            [0.53, 0.34, 0.23],
            [0.91, 0.73, 0.58]
        ];

        const skin = skinColors[index % skinColors.length];

        const shirt = makeMaterial(color, {
            roughness: 0.72
        });

        const skinMaterial = makeMaterial(skin, {
            roughness: 0.82
        });

        const shortsMaterial = makeMaterial(
            color.map((v) => v * 0.58),
            {
                roughness: 0.85
            }
        );

        const shoeMaterial = makeMaterial(
            [0.07, 0.09, 0.13],
            {
                roughness: 0.92
            }
        );

        // Torse.
        const torso = new pc.Entity("Player torso");

        torso.addComponent("render", {
            type: "capsule",
            material: shirt
        });

        torso.setLocalScale(0.56, 0.77, 0.34);
        torso.setLocalPosition(0, 1.34, 0);

        root.addChild(torso);

        // Tête.
        const head = new pc.Entity("Player head");

        head.addComponent("render", {
            type: "sphere",
            material: skinMaterial
        });

        head.setLocalScale(0.35, 0.38, 0.33);
        head.setLocalPosition(0, 1.96, 0);

        root.addChild(head);

        // Cheveux.
        const hair = new pc.Entity("Player hair");

        hair.addComponent("render", {
            type: "sphere",
            material: makeMaterial(
                index % 2 === 0
                    ? [0.09, 0.065, 0.045]
                    : [0.18, 0.12, 0.08]
            )
        });

        hair.setLocalScale(0.36, 0.18, 0.34);
        hair.setLocalPosition(0, 2.12, 0);

        root.addChild(hair);

        // Shorts.
        const shorts = new pc.Entity("Player shorts");

        shorts.addComponent("render", {
            type: "box",
            material: shortsMaterial
        });

        shorts.setLocalScale(0.47, 0.28, 0.34);
        shorts.setLocalPosition(0, 0.87, 0);

        root.addChild(shorts);

        const limbs = [];

        // Bras.
        [-1, 1].forEach((side) => {
            const arm = new pc.Entity("Player arm");

            arm.addComponent("render", {
                type: "capsule",
                material: shirt
            });

            arm.setLocalScale(0.18, 0.53, 0.18);

            arm.setLocalPosition(
                side * 0.38,
                1.40,
                0
            );

            root.addChild(arm);

            limbs.push({
                entity: arm,
                kind: "arm",
                side
            });

            const hand = new pc.Entity("Player hand");

            hand.addComponent("render", {
                type: "sphere",
                material: skinMaterial
            });

            hand.setLocalScale(0.15, 0.15, 0.15);
            hand.setLocalPosition(
                side * 0.38,
                1.12,
                0
            );

            root.addChild(hand);

            limbs.push({
                entity: hand,
                kind: "hand",
                side
            });
        });

        // Jambes.
        [-1, 1].forEach((side) => {
            const leg = new pc.Entity("Player leg");

            leg.addComponent("render", {
                type: "capsule",
                material: shortsMaterial
            });

            leg.setLocalScale(0.19, 0.58, 0.20);

            leg.setLocalPosition(
                side * 0.15,
                0.49,
                0
            );

            root.addChild(leg);

            limbs.push({
                entity: leg,
                kind: "leg",
                side
            });

            const shoe = new pc.Entity("Player shoe");

            shoe.addComponent("render", {
                type: "box",
                material: shoeMaterial
            });

            shoe.setLocalScale(0.24, 0.12, 0.32);

            shoe.setLocalPosition(
                side * 0.15,
                0.12,
                -0.05
            );

            root.addChild(shoe);
        });

        // Numéro sur le maillot.
        const numberEntity = new pc.Entity(
            `Player number ${index + 1}`
        );

        numberEntity.addComponent("render", {
            type: "box",
            material: makeMaterial(
                [0.96, 0.96, 0.96]
            )
        });

        numberEntity.setLocalScale(0.15, 0.18, 0.035);
        numberEntity.setLocalPosition(0, 1.40, -0.18);

        root.addChild(numberEntity);

        const player = {
            name,
            team,
            index,
            root,
            torso,
            head,
            limbs,

            bench,

            x: 0,
            y: 0,
            z: 0,

            baseX: 0,
            baseZ: 0,

            vx: 0,
            vz: 0,

            speed: name === "Ranise" || name === "MEME"
                ? 7.2
                : 5.2,

            power: name === "Ranise" || name === "MEME"
                ? 1.65
                : 1,

            jump: 0,
            jumpVelocity: 0,

            action: "idle",
            actionTimer: 0,

            facing: team === "home" ? 0 : 180,

            isMaster:
                name === "Ranise" ||
                name === "MEME",

            nameEntity: null
        };

        if (bench) {
            root.enabled = true;
        }

        return player;
    }

    /* ========================================================
       13. COMPOSITION DES ÉQUIPES
    ======================================================== */

    function makeTeamRoster(teamName, team) {
        const assigned = new Set();

        const names = [];

        if (team === "home") {
            names.push(
                state.profileName || "Selvandieu",
                "Selvandieu",
                "Ranise",
                "MEME",
                "Kerlande",
                "Nina",
                "Dieuben",
                "Junior",
                "Monise",
                "Lise",
                "Natacha"
            );
        } else {
            names.push(
                "Ricardo",
                "Raoul",
                "Toutin",
                "Ydeja",
                "Lannda",
                "Sabine",
                "Junior",
                "Monise",
                "Kerlande",
                "Nina",
                "Dieuben"
            );
        }

        const uniqueNames = [];

        names.forEach((name) => {
            if (!assigned.has(name)) {
                assigned.add(name);
                uniqueNames.push(name);
            }
        });

        const backup = [
            "Champion",
            "Expert",
            "Attaquant",
            "Défenseur",
            "Capitaine",
            "Libéro",
            "Maître",
            "Étoile",
            "Volleyeur",
            "Sprinteur",
            "Stratège"
        ];

        while (uniqueNames.length < PLAYERS_PER_TEAM) {
            const candidate = backup[uniqueNames.length];

            if (!assigned.has(candidate)) {
                assigned.add(candidate);
                uniqueNames.push(candidate);
            }
        }

        return uniqueNames.slice(0, PLAYERS_PER_TEAM);
    }

    function getTeamColor(team, index) {
        const kit = KIT_STYLES[state.kitStyle];

        if (team === "home") {
            return kit.home;
        }

        return kit.away;
    }

    function createTeams() {
        // Nettoyer les équipes existantes.
        ["home", "away"].forEach((side) => {
            state.teams[side].forEach((player) => {
                if (player.root) {
                    player.root.destroy();
                }
            });

            state.teams[side] = [];
        });

        const homeNames = makeTeamRoster(
            state.homeTeam,
            "home"
        );

        const awayNames = makeTeamRoster(
            state.awayTeam,
            "away"
        );

        homeNames.forEach((name, index) => {
            const bench = index >= 6;

            const player = createPlayer(
                name,
                "home",
                index,
                getTeamColor("home", index),
                bench
            );

            const slot = getFormationPosition(
                "home",
                index
            );

            player.x = slot.x;
            player.z = slot.z;

            player.baseX = slot.x;
            player.baseZ = slot.z;

            player.root.setPosition(
                player.x,
                0,
                player.z
            );

            if (bench) {
                player.root.setPosition(
                    -11 + (index - 6) * 1.0,
                    0,
                    19.4
                );
            }

            state.teams.home.push(player);
        });

        awayNames.forEach((name, index) => {
            const bench = index >= 6;

            const player = createPlayer(
                name,
                "away",
                index,
                getTeamColor("away", index),
                bench
            );

            const slot = getFormationPosition(
                "away",
                index
            );

            player.x = slot.x;
            player.z = slot.z;

            player.baseX = slot.x;
            player.baseZ = slot.z;

            player.root.setPosition(
                player.x,
                0,
                player.z
            );

            if (bench) {
                player.root.setPosition(
                    5 + (index - 6) * 1.0,
                    0,
                    -19.4
                );
            }

            state.teams.away.push(player);
        });

        state.activePlayerIndex = 0;

        updateActivePlayerUI();
    }

    function getFormationPosition(team, index) {
        const side = team === "home" ? 1 : -1;

        const formations = [
            [-5.5, 10],
            [0, 10],
            [5.5, 10],
            [-5.5, 5.1],
            [0, 5.1],
            [5.5, 5.1]
        ];

        const formation = formations[index % 6];

        return {
            x: formation[0],
            z: formation[1] * side
        };
    }

    function getActivePlayer() {
        const players = state.teams[state.activeTeam];

        if (!players || !players.length) {
            return null;
        }

        return players[
            clamp(
                state.activePlayerIndex,
                0,
                players.length - 1
            )
        ];
    }

    function updateActivePlayerUI() {
        const player = getActivePlayer();

        if (!player) {
            return;
        }

        setText("activePlayerName", player.name);

        setText(
            "activePlayerPosition",
            player.isMaster
                ? "JOUEUR MAÎTRE"
                : `Joueur ${player.index + 1} · ${player.team === "home" ? "Équipe locale" : "Équipe adverse"}`
        );
    }

    function applyKitColors() {
        if (!state.engineReady) {
            return;
        }

        // La mise à jour complète des tenues se fait en reconstruisant
        // les équipes pour garantir des matériaux cohérents.
        createTeams();
    }

    /* ========================================================
       14. CAMÉRA
    ======================================================== */

    function updateCamera() {
        if (!state.cameraEntity) {
            return;
        }

        const zoom = state.targetZoom;

        state.zoom = lerp(
            state.zoom,
            zoom,
            0.16
        );

        const camera = state.cameraEntity;

        const height = 18 / state.zoom;
        const depth = 24 / state.zoom;

        camera.setPosition(
            0,
            clamp(height, 8, 30),
            clamp(depth, 12, 40)
        );

        camera.lookAt(0, 0, 0);

        setText(
            "zoomLevel",
            `${Math.round(state.zoom * 100)}%`
        );
    }

    function zoomIn() {
        state.targetZoom = clamp(
            state.targetZoom + 0.12,
            0.65,
            1.8
        );

        playSound("click");
    }

    function zoomOut() {
        state.targetZoom = clamp(
            state.targetZoom - 0.12,
            0.65,
            1.8
        );

        playSound("click");
    }

    function resetCamera() {
        state.targetZoom = 1;
        state.zoom = 1;

        updateCamera();

        notify("Caméra réinitialisée.");
    }

    function resizeCanvas() {
        if (!state.app) {
            return;
        }

        state.app.resizeCanvas();

        if (state.camera) {
            state.camera.aspectRatio =
                $("volleyballCanvas").clientWidth /
                Math.max(
                    1,
                    $("volleyballCanvas").clientHeight
                );
        }
    }

    /* ========================================================
       15. AUDIO
    ======================================================== */

    function initAudio() {
        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContextClass) {
            return false;
        }

        try {
            state.audioContext = new AudioContextClass();

            state.masterGain =
                state.audioContext.createGain();

            state.musicGain =
                state.audioContext.createGain();

            state.effectsGain =
                state.audioContext.createGain();

            state.musicGain.connect(state.masterGain);
            state.effectsGain.connect(state.masterGain);

            state.masterGain.connect(
                state.audioContext.destination
            );

            updateAudioVolumes();

            return true;
        } catch (error) {
            console.warn("[FOBAS] Audio :", error);

            return false;
        }
    }

    function updateAudioVolumes() {
        if (!state.audioContext || !state.masterGain) {
            return;
        }

        const enabled = state.soundEnabled ? 1 : 0;

        state.masterGain.gain.setTargetAtTime(
            enabled,
            state.audioContext.currentTime,
            0.04
        );

        state.musicGain.gain.setTargetAtTime(
            state.musicVolume,
            state.audioContext.currentTime,
            0.04
        );

        state.effectsGain.gain.setTargetAtTime(
            state.effectsVolume,
            state.audioContext.currentTime,
            0.04
        );
    }

    function playTone(frequency, duration, type = "sine", volume = 0.18) {
        if (!state.soundEnabled || !state.audioContext) {
            return;
        }

        if (!state.effectsGain) {
            return;
        }

        const ctx = state.audioContext;

        if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
        }

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(
            frequency,
            ctx.currentTime
        );

        gain.gain.setValueAtTime(
            volume,
            ctx.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + duration
        );

        oscillator.connect(gain);
        gain.connect(state.effectsGain);

        oscillator.start();
        oscillator.stop(ctx.currentTime + duration);
    }

    function playSound(type) {
        if (!state.soundEnabled) {
            return;
        }

        switch (type) {
            case "serve":
                playTone(440, 0.12, "triangle", 0.2);
                setTimeout(() => {
                    playTone(660, 0.14, "triangle", 0.16);
                }, 75);
                break;

            case "pass":
                playTone(320, 0.08, "sine", 0.15);
                break;

            case "smash":
                playTone(180, 0.18, "sawtooth", 0.19);
                setTimeout(() => {
                    playTone(90, 0.22, "triangle", 0.12);
                }, 60);
                break;

            case "block":
                playTone(510, 0.1, "square", 0.11);
                break;

            case "point":
                playTone(660, 0.14, "triangle", 0.18);

                setTimeout(() => {
                    playTone(880, 0.20, "triangle", 0.15);
                }, 110);
                break;

            case "win":
                [523, 659, 784, 1047].forEach((freq, index) => {
                    setTimeout(() => {
                        playTone(freq, 0.28, "triangle", 0.13);
                    }, index * 130);
                });
                break;

            case "click":
                playTone(540, 0.04, "sine", 0.06);
                break;

            default:
                playTone(350, 0.08, "sine", 0.1);
        }
    }

    function toggleSound() {
        state.soundEnabled = !state.soundEnabled;

        updateAudioVolumes();

        setText(
            "soundButton",
            state.soundEnabled ? "🔊" : "🔇"
        );

        notify(
            state.soundEnabled
                ? "Son activé."
                : "Son désactivé."
        );

        if (state.soundEnabled) {
            playSound("click");
        }

        saveState();
    }

    function startMusic() {
        // Ambiance musicale générée par synthèse simple.
        // Aucun fichier audio externe n'est nécessaire.
        if (!state.audioContext || state.musicTimer) {
            return;
        }

        const notes = [
            261.63,
            329.63,
            392,
            329.63,
            293.66,
            349.23,
            440,
            349.23
        ];

        let noteIndex = 0;

        state.musicTimer = setInterval(() => {
            if (
                !state.soundEnabled ||
                !state.audioContext ||
                state.audioContext.state !== "running"
            ) {
                return;
            }

            const frequency = notes[
                noteIndex % notes.length
            ];

            noteIndex++;

            const ctx = state.audioContext;
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = frequency;

            gain.gain.setValueAtTime(
                0.0001,
                ctx.currentTime
            );

            gain.gain.linearRampToValueAtTime(
                0.025 * state.musicVolume,
                ctx.currentTime + 0.1
            );

            gain.gain.linearRampToValueAtTime(
                0.0001,
                ctx.currentTime + 0.7
            );

            oscillator.connect(gain);
            gain.connect(state.musicGain);

            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.75);
        }, 900);
    }

    /* ========================================================
       16. CRÉATION D'UN MATCH
    ======================================================== */

    function startMatch(options = {}) {
        if (!state.engineReady) {
            notify(
                "Le moteur 3D n'est pas encore prêt.",
                "error"
            );
            return;
        }

        state.matchId++;
        state.rallyId = 0;

        state.mode = options.mode || "career";

        if (options.mission) {
            state.mission = clamp(
                options.mission,
                1,
                MISSION_COUNT
            );
        }

        state.homeScore = 0;
        state.awayScore = 0;

        state.homeSets = 0;
        state.awaySets = 0;

        state.currentSet = 1;

        state.matchTime = 0;

        state.running = true;
        state.paused = false;
        state.matchEnded = false;
        state.matchStarted = true;

        state.pointPause = 0;
        state.aiTimer = 0;

        state.missionStats = {
            points: 0,
            smashes: 0,
            blocks: 0,
            passes: 0,
            serves: 0,
            elapsed: 0
        };

        state.activeTeam = "home";
        state.activePlayerIndex = 0;

        createTeams();

        updateScoreboard();

        setVisible("mainMenu", false);
        closeAllPanels();

        setVisible("matchResultPanel", false);
        setVisible("matchControls", true);

        setVisible("stadiumSection", true);

        setText(
            "missionLabel",
            `MISSION ${String(state.mission).padStart(2, "0")} / ${MISSION_COUNT}`
        );

        setText("matchClock", "00:00");
        setText("setLabel", "SET 1");

        setText(
            "matchObjective",
            getMissionObjective()
        );

        setText("ballState", "Ballon prêt");

        setVisible("stadiumLoader", false);

        resetBall("home");

        showGameMessage(
            `MATCH ${state.homeTeam} contre ${state.awayTeam}`,
            3500
        );

        updateActivePlayerUI();
        updateMissionUI();

        initAudio();

        if (state.audioContext?.state === "suspended") {
            state.audioContext.resume().catch(() => {});
        }

        startMusic();

        playSound("serve");

        saveState();
    }

    function getMissionObjective() {
        const mission = state.mission;

        const target = 3 + Math.floor(mission / 5);

        if (mission <= 5) {
            return `Objectif : gagner le match et marquer ${target} points.`;
        }

        if (mission <= 15) {
            return `Objectif : gagner et réussir ${Math.min(3, Math.ceil(mission / 5))} smashes.`;
        }

        if (mission <= 30) {
            return "Objectif : gagner le match face à une équipe élite.";
        }

        return "Objectif : remporter le titre des maîtres.";
    }

    /* ========================================================
       17. SERVICE ET RELANCE DU BALLON
    ======================================================== */

    function resetBall(servingTeam = "home") {
        state.ballInFlight = false;
        state.ballOwner = null;

        state.ballVelocity = {
            x: 0,
            y: 0,
            z: 0
        };

        const servingSide = servingTeam === "home" ? 1 : -1;

        state.ball.setPosition(
            random(-2, 2),
            2.2,
            servingSide * 12.6
        );

        setText("ballState", "Ballon prêt");
    }

    function serveBall() {
        if (!canAct()) {
            return;
        }

        const player = getActivePlayer();

        if (!player) {
            return;
        }

        const ballPos = state.ball.getPosition();

        state.ballOwner = player;
        state.ballInFlight = true;

        const targetZ = player.team === "home"
            ? -12.8
            : 12.8;

        const masterBoost = player.isMaster
            ? 1.65
            : 1;

        state.ballVelocity = {
            x: random(-2.5, 2.5),
            y: 8.5 * masterBoost,
            z: player.team === "home"
                ? -14 * masterBoost
                : 14 * masterBoost
        };

        player.action = "serve";
        player.actionTimer = 0.7;

        state.missionStats.serves++;

        state.ball.setPosition(
            player.x,
            player.y + 2.4,
            player.z
        );

        setText("ballState", "Service en cours");

        showGameMessage(
            `${player.name} effectue le service !`
        );

        playSound("serve");

        state.lastPointTime = state.matchTime;
    }

    /* ========================================================
       18. PASSE
    ======================================================== */

    function passBall() {
        if (!canAct()) {
            return;
        }

        const player = getActivePlayer();

        if (!player) {
            return;
        }

        if (!state.ballInFlight) {
            serveBall();
            return;
        }

        const ballPos = state.ball.getPosition();

        const distance = distance2D(
            {
                x: player.x,
                z: player.z
            },
            {
                x: ballPos.x,
                z: ballPos.z
            }
        );

        if (distance > 6.5 && ballPos.y > 5.5) {
            notify("Rapprochez-vous du ballon pour faire la passe.");
            return;
        }

        const teammates = state.teams[player.team]
            .filter((candidate) =>
                candidate !== player && !candidate.bench
            );

        if (!teammates.length) {
            return;
        }

        const target = teammates.reduce((best, candidate) => {
            const d = distance2D(
                { x: candidate.x, z: candidate.z },
                { x: ballPos.x, z: ballPos.z }
            );

            return !best || d < best.distance
                ? { player: candidate, distance: d }
                : best;
        }, null).player;

        const dx = target.x - ballPos.x;
        const dz = target.z - ballPos.z;

        const length = Math.hypot(dx, dz) || 1;

        state.ballVelocity = {
            x: (dx / length) * 3.2,
            y: 7.2,
            z: (dz / length) * 3.2
        };

        state.ballInFlight = true;
        state.ballOwner = null;

        player.action = "pass";
        player.actionTimer = 0.35;

        target.action = "ready";

        state.missionStats.passes++;

        setText("ballState", `Passe vers ${target.name}`);

        showGameMessage(
            `${player.name} passe le ballon à ${target.name} !`
        );

        playSound("pass");
    }

    /* ========================================================
       19. SMASH
    ======================================================== */

    function smashBall() {
        if (!canAct()) {
            return;
        }

        const player = getActivePlayer();

        if (!player) {
            return;
        }

        const ballPos = state.ball.getPosition();

        if (
            !state.ballInFlight ||
            distance2D(
                { x: player.x, z: player.z },
                { x: ballPos.x, z: ballPos.z }
            ) > 7.0
        ) {
            // Permet de préparer une attaque sans rester bloqué.
            state.ballInFlight = true;

            state.ball.setPosition(
                player.x,
                player.y + 2.6,
                player.z
            );
        }

        const targetZ = player.team === "home"
            ? -13.2
            : 13.2;

        const direction = targetZ < player.z ? -1 : 1;

        const power = player.power;

        state.ballVelocity = {
            x: clamp(
                -player.x * 0.12 + random(-2.2, 2.2),
                -7,
                7
            ),

            y: 8.3 * power,

            z: direction * 19 * power
        };

        state.ballInFlight = true;
        state.ballOwner = null;

        player.action = "smash";
        player.actionTimer = 0.9;
        player.jumpVelocity = 8.0 * power;

        state.missionStats.smashes++;

        setText("ballState", "SMASH !");

        showGameMessage(
            `${player.name} lance un smash puissant !`
        );

        playSound("smash");
    }

    /* ========================================================
       20. BLOCAGE
    ======================================================== */

    function blockBall() {
        if (!canAct()) {
            return;
        }

        const player = getActivePlayer();

        if (!player) {
            return;
        }

        player.action = "block";
        player.actionTimer = 0.65;

        player.jumpVelocity = player.isMaster
            ? 10.5
            : 7.5;

        const ballPos = state.ball.getPosition();

        const distance = distance2D(
            {
                x: player.x,
                z: player.z
            },
            {
                x: ballPos.x,
                z: ballPos.z
            }
        );

        if (state.ballInFlight && distance < 6) {
            const direction = player.team === "home"
                ? -1
                : 1;

            state.ballVelocity = {
                x: random(-2, 2),
                y: 7.5,
                z: direction * 12
            };

            state.missionStats.blocks++;

            setText("ballState", "Blocage réussi");

            showGameMessage(
                `${player.name} tente un blocage !`
            );

            playSound("block");
        } else {
            setText("ballState", "Saut défensif");

            showGameMessage(
                `${player.name} saute pour intercepter le ballon.`
            );
        }
    }

    /* ========================================================
       21. CHANGER DE JOUEUR
    ======================================================== */

    function switchPlayer() {
        if (!state.running || state.paused) {
            return;
        }

        const players = state.teams[state.activeTeam];

        if (!players || !players.length) {
            return;
        }

        const active = getActivePlayer();

        if (active) {
            active.action = "idle";
        }

        state.activePlayerIndex =
            (state.activePlayerIndex + 1) % PLAYERS_PER_TEAM;

        const next = getActivePlayer();

        if (next && next.bench) {
            // Les remplaçants peuvent devenir actifs et entrer sur le terrain.
            next.bench = false;

            const slot = getFormationPosition(
                state.activeTeam,
                next.index
            );

            next.x = slot.x;
            next.z = slot.z;

            next.root.enabled = true;

            next.root.setPosition(
                next.x,
                next.y,
                next.z
            );
        }

        updateActivePlayerUI();

        playSound("click");

        notify(`Joueur actif : ${next.name}`);
    }

    /* ========================================================
       22. DÉPLACEMENT
    ======================================================== */

    function canAct() {
        return (
            state.running &&
            !state.paused &&
            !state.matchEnded
        );
    }

    function setJoystick(x, y) {
        state.joystick.x = clamp(x, -1, 1);
        state.joystick.y = clamp(y, -1, 1);

        const stick = $("joystickStick");

        if (stick) {
            stick.style.transform =
                `translate(calc(-50% + ${state.joystick.x * 34}px), ` +
                `calc(-50% + ${state.joystick.y * 34}px))`;
        }
    }

    function releaseJoystick() {
        state.joystick.active = false;
        state.joystick.pointerId = null;

        setJoystick(0, 0);
    }

    function updatePlayerMovement(dt) {
        const player = getActivePlayer();

        if (!player || player.bench) {
            return;
        }

        let dx = state.joystick.x;
        let dz = state.joystick.y;

        if (state.keyboard.ArrowLeft || state.keyboard.KeyA) {
            dx -= 1;
        }

        if (state.keyboard.ArrowRight || state.keyboard.KeyD) {
            dx += 1;
        }

        if (state.keyboard.ArrowUp || state.keyboard.KeyW) {
            dz -= 1;
        }

        if (state.keyboard.ArrowDown || state.keyboard.KeyS) {
            dz += 1;
        }

        const magnitude = Math.hypot(dx, dz);

        if (magnitude > 1) {
            dx /= magnitude;
            dz /= magnitude;
        }

        const speed = player.speed;

        player.vx = dx * speed;
        player.vz = dz * speed;

        player.x += player.vx * dt;

        // Chaque équipe reste dans son demi-terrain.
        const teamSign = player.team === "home" ? 1 : -1;

        const minZ = teamSign > 0 ? 1.0 : -15;
        const maxZ = teamSign > 0 ? 15 : -1.0;

        player.z = clamp(
            player.z + player.vz * dt,
            minZ,
            maxZ
        );

        player.x = clamp(
            player.x,
            -state.courtWidth / 2 + 0.6,
            state.courtWidth / 2 - 0.6
        );

        if (magnitude > 0.1) {
            player.facing = Math.atan2(dx, dz) * 180 / Math.PI;
            player.action = "run";
        } else if (player.action === "run") {
            player.action = "idle";
        }

        player.root.setPosition(
            player.x,
            player.y,
            player.z
        );

        player.root.setEulerAngles(
            0,
            player.facing,
            0
        );
    }

    /* ========================================================
       23. ANIMATION DES JOUEURS
    ======================================================== */

    function updatePlayerAnimation(player, dt) {
        player.actionTimer = Math.max(
            0,
            player.actionTimer - dt
        );

        if (
            player.actionTimer === 0 &&
            ["serve", "pass", "smash", "block"].includes(player.action)
        ) {
            player.action = "idle";
        }

        // Gravité du saut.
        if (player.jump > 0 || player.jumpVelocity > 0) {
            player.jumpVelocity += state.gravity * dt;

            player.jump += player.jumpVelocity * dt;

            if (player.jump < 0) {
                player.jump = 0;
                player.jumpVelocity = 0;
            }
        }

        const jumpY = player.jump;

        player.root.setPosition(
            player.x,
            jumpY,
            player.z
        );

        const running = player.action === "run";
        const swinging =
            player.action === "smash" ||
            player.action === "serve";

        player.limbs.forEach((limb) => {
            if (limb.kind === "arm") {
                let zRotation = 0;

                if (running) {
                    zRotation =
                        Math.sin(state.matchTime * 10 + limb.side) * 20;
                }

                if (swinging) {
                    zRotation = limb.side === 1 ? -65 : -15;
                }

                if (player.action === "block") {
                    zRotation = limb.side * -55;
                }

                limb.entity.setLocalEulerAngles(
                    0,
                    0,
                    zRotation
                );
            }

            if (limb.kind === "leg") {
                const rotation = running
                    ? Math.sin(
                        state.matchTime * 11 + limb.side
                    ) * 23
                    : 0;

                limb.entity.setLocalEulerAngles(
                    rotation,
                    0,
                    0
                );
            }
        });
    }

    /* ========================================================
       24. INTELLIGENCE ARTIFICIELLE
    ======================================================== */

    function updateAI(dt) {
        if (!canAct()) {
            return;
        }

        const sides = ["home", "away"];

        sides.forEach((side) => {
            const players = state.teams[side];

            if (!players) {
                return;
            }

            players.forEach((player) => {
                if (player.bench) {
                    return;
                }

                // Le joueur contrôlé est laissé au joystick.
                if (
                    side === state.activeTeam &&
                    player.index === state.activePlayerIndex
                ) {
                    return;
                }

                const ballPos = state.ball.getPosition();

                let targetX = player.baseX;
                let targetZ = player.baseZ;

                if (state.ballInFlight) {
                    const onSameSide =
                        side === "home"
                            ? ballPos.z > -1
                            : ballPos.z < 1;

                    if (onSameSide) {
                        targetX = clamp(
                            ballPos.x * 0.75,
                            -7.5,
                            7.5
                        );

                        targetZ = side === "home"
                            ? clamp(ballPos.z + 1.5, 1.5, 13.5)
                            : clamp(ballPos.z - 1.5, -13.5, -1.5);
                    }
                }

                const dx = targetX - player.x;
                const dz = targetZ - player.z;

                const distance = Math.hypot(dx, dz);

                if (distance > 0.18) {
                    const speed = player.speed * 0.44;

                    player.x +=
                        dx / distance * Math.min(distance, speed * dt);

                    player.z +=
                        dz / distance * Math.min(distance, speed * dt);

                    player.root.setPosition(
                        player.x,
                        player.y,
                        player.z
                    );

                    player.root.setEulerAngles(
                        0,
                        Math.atan2(dx, dz) * 180 / Math.PI,
                        0
                    );

                    player.action = "run";
                } else if (player.action === "run") {
                    player.action = "idle";
                }
            });
        });

        state.aiTimer += dt;

        if (state.aiTimer < 0.45) {
            return;
        }

        state.aiTimer = 0;

        if (!state.ballInFlight) {
            return;
        }

        const ballPos = state.ball.getPosition();

        const defendingSide =
            ballPos.z > 0 ? "home" : "away";

        const defenders = state.teams[defendingSide]
            .filter((player) => !player.bench);

        const closest = defenders.reduce((best, player) => {
            const d = distance2D(
                { x: player.x, z: player.z },
                { x: ballPos.x, z: ballPos.z }
            );

            return !best || d < best.distance
                ? { player, distance: d }
                : best;
        }, null);

        if (!closest) {
            return;
        }

        if (
            closest.distance < 3.1 &&
            ballPos.y > 0.8 &&
            ballPos.y < 5.5
        ) {
            const player = closest.player;

            const chance = player.isMaster
                ? 0.94
                : 0.74;

            if (Math.random() < chance) {
                const towardOpponent =
                    player.team === "home" ? -1 : 1;

                state.ballVelocity.x =
                    clamp(
                        (random(-6, 6) - ballPos.x * 0.25),
                        -8,
                        8
                    );

                state.ballVelocity.y = player.isMaster
                    ? 7.5
                    : 6.1;

                state.ballVelocity.z =
                    towardOpponent * (
                        player.isMaster ? 14 : 10.5
                    );

                player.action = "pass";
                player.actionTimer = 0.35;

                setText("ballState", `${player.name} touche le ballon`);
            }
        }
    }

    /* ========================================================
       25. PHYSIQUE DU BALLON
    ======================================================== */

    function updateBall(dt) {
        if (!state.ball || !state.ballInFlight) {
            return;
        }

        const p = state.ball.getPosition();

        state.ballVelocity.y += state.gravity * dt;

        p.x += state.ballVelocity.x * dt;
        p.y += state.ballVelocity.y * dt;
        p.z += state.ballVelocity.z * dt;

        // Friction horizontale légère.
        state.ballVelocity.x *= Math.pow(0.994, dt * 60);

        // Collision avec le filet.
        if (
            Math.abs(p.z) < 0.25 &&
            p.y < state.netHeight + 0.2 &&
            Math.abs(p.x) < state.courtWidth / 2
        ) {
            state.ballVelocity.z *= -0.48;
            state.ballVelocity.y = Math.max(
                2,
                Math.abs(state.ballVelocity.y) * 0.48
            );

            p.z = p.z < 0 ? -0.28 : 0.28;

            showGameMessage("Le ballon touche le filet !");
        }

        // Collision simplifiée avec le sol.
        if (p.y <= state.ballRadius + 0.12) {
            p.y = state.ballRadius + 0.12;

            const landingTeam = p.z > 0
                ? "home"
                : "away";

            // Le point revient à l'équipe opposée à celle
            // qui se trouve dans la zone où le ballon tombe.
            const pointWinner = landingTeam === "home"
                ? "away"
                : "home";

            awardPoint(pointWinner);
            return;
        }

        // Sortie latérale ou en fond de terrain.
        if (
            Math.abs(p.x) > state.courtWidth / 2 + 2.5 ||
            Math.abs(p.z) > state.courtLength / 2 + 2.5 ||
            p.y < -2
        ) {
            const pointWinner = p.z > 0
                ? "away"
                : "home";

            awardPoint(pointWinner);
            return;
        }

        state.ball.setPosition(p.x, p.y, p.z);

        // Rotation visuelle du ballon.
        state.ball.rotate(
            state.ballVelocity.z * dt * 14,
            state.ballVelocity.x * dt * 10,
            state.ballVelocity.y * dt * 8
        );

        setText(
            "ballState",
            p.y > 4
                ? "Ballon en hauteur"
                : "Ballon en jeu"
        );
    }

    /* ========================================================
       26. SCORE ET SETS
    ======================================================== */

    function updateScoreboard() {
        setText("homeTeamName", state.homeTeam);
        setText("awayTeamName", state.awayTeam);

        setText("homeScore", state.homeScore);
        setText("awayScore", state.awayScore);

        setText("setLabel", `SET ${state.currentSet}`);
    }

    function awardPoint(team) {
        if (state.matchEnded) {
            return;
        }

        state.ballInFlight = false;
        state.ballOwner = null;

        if (team === "home") {
            state.homeScore++;
        } else {
            state.awayScore++;
        }

        state.missionStats.points++;

        state.lastPointTime = state.matchTime;

        updateScoreboard();

        playSound("point");

        showGameMessage(
            team === "home"
                ? `POINT POUR ${state.homeTeam} !`
                : `POINT POUR ${state.awayTeam} !`,
            1800
        );

        const homeWinsSet =
            state.homeScore >= 25 &&
            state.homeScore - state.awayScore >= 2;

        const awayWinsSet =
            state.awayScore >= 25 &&
            state.awayScore - state.homeScore >= 2;

        const homeWinsMatch =
            state.homeSets >= 2 && homeWinsSet;

        const awayWinsMatch =
            state.awaySets >= 2 && awayWinsSet;

        if (homeWinsSet) {
            state.homeSets++;
            state.currentSet++;

            if (state.homeSets >= 2) {
                finishMatch("home");
                return;
            }

            state.homeScore = 0;
            state.awayScore = 0;

            updateScoreboard();

            showGameMessage("Set remporté par l'équipe locale !");
        } else if (awayWinsSet) {
            state.awaySets++;
            state.currentSet++;

            if (state.awaySets >= 2) {
                finishMatch("away");
                return;
            }

            state.homeScore = 0;
            state.awayScore = 0;

            updateScoreboard();

            showGameMessage("Set remporté par l'équipe adverse !");
        }

        resetBall(team);

        state.pointPause = 1.0;
    }

    /* ========================================================
       27. FIN DU MATCH
    ======================================================== */

    function finishMatch(winner) {
        state.running = false;
        state.matchEnded = true;
        state.paused = false;

        state.matches++;

        const won = winner === "home";

        if (won) {
            state.wins++;

            if (!state.completedMissions.includes(state.mission)) {
                state.completedMissions.push(state.mission);
            }

            state.unlockedMission = Math.min(
                MISSION_COUNT,
                Math.max(
                    state.unlockedMission,
                    state.mission + 1
                )
            );

            state.trophies += state.mission % 5 === 0 ? 1 : 0;

            setText("resultIcon", "🏆");
            setText("resultTitle", "VICTOIRE !");
            setText(
                "resultDescription",
                `Félicitations ! Vous avez battu ${state.awayTeam}. Votre progression a été mise à jour.`
            );

            playSound("win");
        } else {
            setText("resultIcon", "💪");
            setText("resultTitle", "MATCH TERMINÉ");
            setText(
                "resultDescription",
                `Vous avez perdu contre ${state.awayTeam}. Entraînez-vous et revenez plus fort !`
            );
        }

        setText("resultHomeScore", state.homeSets);
        setText("resultAwayScore", state.awaySets);

        setVisible("matchControls", false);
        setVisible("matchResultPanel", true);

        setText(
            "nextMissionButton",
            state.mission >= MISSION_COUNT
                ? "REJOUER LA MISSION 40"
                : "MISSION SUIVANTE"
        );

        updateMissionUI();
        syncProfileUI();

        saveState();

        showGameMessage(
            won ? "VICTOIRE FOBAS !" : "FIN DU MATCH",
            4000
        );
    }

    /* ========================================================
       28. PAUSE
    ======================================================== */

    function pauseGame() {
        if (!state.running || state.matchEnded) {
            return;
        }

        state.paused = !state.paused;

        setText(
            "pauseButton",
            state.paused ? "▶" : "⏸"
        );

        if (state.paused) {
            showGameMessage("PAUSE", 30000);
            notify("Match en pause.");
        } else {
            showGameMessage("Le match reprend !");
            notify("Match repris.");
        }
    }

    function leaveMatch() {
        if (!state.matchStarted || state.matchEnded) {
            returnToMenu();
            return;
        }

        openConfirmation(
            "Quitter le match ?",
            "Votre match en cours sera arrêté. Votre progression déjà sauvegardée sera conservée.",
            () => {
                state.running = false;
                state.paused = false;
                state.matchEnded = true;

                setVisible("matchControls", false);
                setVisible("matchResultPanel", false);

                returnToMenu();
            }
        );
    }

    function returnToMenu() {
        state.running = false;
        state.paused = false;
        state.matchStarted = false;

        setVisible("matchControls", false);
        setVisible("matchResultPanel", false);

        closeAllPanels();

        setVisible("mainMenu", true);
        setVisible("stadiumSection", true);

        setText("pauseButton", "⏸");

        saveState();
    }

    /* ========================================================
       29. MISSIONS
    ======================================================== */

    function getMissionDescription(mission) {
        if (mission <= 5) {
            return "Apprendre les bases du volleyball.";
        }

        if (mission <= 15) {
            return "Défier une équipe plus expérimentée.";
        }

        if (mission <= 25) {
            return "Remporter un duel de haut niveau.";
        }

        if (mission <= 35) {
            return "Affronter les champions internationaux.";
        }

        return "Le dernier défi pour devenir une légende.";
    }

    function updateMissionUI() {
        const list = $("missionList");

        if (list) {
            list.innerHTML = "";

            for (let i = 1; i <= MISSION_COUNT; i++) {
                const completed =
                    state.completedMissions.includes(i);

                const unlocked =
                    i <= state.unlockedMission;

                const title = MISSION_TITLES[i - 1];

                const button = document.createElement("button");

                button.type = "button";

                button.className =
                    "mission-item" +
                    (completed ? " is-completed" : "") +
                    (!unlocked ? " is-locked" : "");

                button.disabled = !unlocked;

                button.innerHTML = `
                    <span class="mission-number">
                        ${String(i).padStart(2, "0")}
                    </span>

                    <span class="mission-details">
                        <strong>${escapeHTML(title)}</strong>
                        <small>${escapeHTML(getMissionDescription(i))}</small>
                    </span>

                    <span class="mission-status">
                        ${completed ? "✓" : unlocked ? "▶" : "🔒"}
                    </span>
                `;

                button.addEventListener("click", () => {
                    state.mission = i;

                    startMatch({
                        mission: i,
                        mode: "career"
                    });
                });

                list.appendChild(button);
            }
        }

        const completedCount = state.completedMissions.length;

        const progress = Math.round(
            completedCount / MISSION_COUNT * 100
        );

        setText(
            "careerProgressText",
            `${completedCount} / ${MISSION_COUNT} missions · ${progress}%`
        );

        const bar = $("careerProgressBar");

        if (bar) {
            bar.style.width = `${progress}%`;
        }

        setText(
            "profileMissions",
            `${completedCount} / ${MISSION_COUNT}`
        );
    }

    /* ========================================================
       30. PROFIL
    ======================================================== */

    function syncProfileUI() {
        setText("profileWins", state.wins);
        setText("profileMatches", state.matches);
        setText(
            "profileMissions",
            `${state.completedMissions.length} / ${MISSION_COUNT}`
        );
        setText("profileTrophies", state.trophies);

        if ($("profileName")) {
            $("profileName").value = state.profileName;
        }

        if ($("profileTeam")) {
            $("profileTeam").value = state.profileTeam;
        }
    }

    function saveProfile() {
        const name = $("profileName")?.value.trim();

        if (!name) {
            notify("Veuillez saisir un nom de joueur.", "error");
            return;
        }

        state.profileName = name.slice(0, 30);

        state.profileTeam =
            $("profileTeam")?.value || "FOBAS LEGENDS";

        syncProfileUI();

        saveState();

        notify("Profil enregistré.", "success");

        playSound("click");
    }

    /* ========================================================
       31. ÉQUIPES
    ======================================================== */

    function populateTeamRoster() {
        const roster = $("teamRoster");

        if (!roster) {
            return;
        }

        roster.innerHTML = "";

        const selectedTeam =
            $("homeTeamSelect")?.value || state.homeTeam;

        const names = makeTeamRoster(selectedTeam, "home");

        names.forEach((name, index) => {
            const item = document.createElement("div");

            item.className = "roster-player";

            item.innerHTML = `
                <span class="roster-number">
                    ${String(index + 1).padStart(2, "0")}
                </span>

                <div>
                    <strong>${escapeHTML(name)}</strong>
                    <small>
                        ${index === 0
                            ? "Capitaine"
                            : index < 3
                                ? "Joueur maître"
                                : index < 6
                                    ? "Titulaire"
                                    : "Remplaçant"}
                    </small>
                </div>
            `;

            roster.appendChild(item);
        });
    }

    function confirmTeams() {
        const home = $("homeTeamSelect")?.value;
        const away = $("awayTeamSelect")?.value;

        if (!home || !away) {
            notify("Veuillez choisir les deux équipes.", "error");
            return;
        }

        if (home === away) {
            notify(
                "Choisissez deux équipes différentes.",
                "error"
            );
            return;
        }

        state.homeTeam = home;
        state.awayTeam = away;

        if (state.engineReady) {
            createTeams();
        }

        updateScoreboard();

        closeAllPanels();

        notify(
            `Équipes confirmées : ${home} contre ${away}.`,
            "success"
        );

        saveState();
    }

    /* ========================================================
       32. ÉQUIPEMENTS
    ======================================================== */

    function updateEquipmentUI() {
        $$("[data-ball]").forEach((button) => {
            const selected =
                button.dataset.ball === state.ballStyle;

            button.classList.toggle("selected", selected);
            button.setAttribute(
                "aria-pressed",
                String(selected)
            );
        });

        $$("[data-kit]").forEach((button) => {
            const selected =
                button.dataset.kit === state.kitStyle;

            button.classList.toggle("selected", selected);
            button.setAttribute(
                "aria-pressed",
                String(selected)
            );
        });
    }

    function chooseBall(style) {
        if (!BALL_STYLES[style]) {
            return;
        }

        state.ballStyle = style;

        if (state.engineReady) {
            applyBallStyle();
        }

        updateEquipmentUI();

        setText(
            "equipmentStatus",
            `Ballon sélectionné : ${BALL_STYLES[style].name}`
        );

        playSound("click");

        saveState();
    }

    function chooseKit(style) {
        if (!KIT_STYLES[style]) {
            return;
        }

        state.kitStyle = style;

        if (state.engineReady) {
            applyKitColors();
        }

        updateEquipmentUI();

        setText(
            "equipmentStatus",
            `Tenues sélectionnées : ${KIT_STYLES[style].name}`
        );

        playSound("click");

        saveState();
    }

    /* ========================================================
       33. PARAMÈTRES
    ======================================================== */

    function syncSettingsUI() {
        if ($("musicVolume")) {
            $("musicVolume").value =
                Math.round(state.musicVolume * 100);
        }

        if ($("effectsVolume")) {
            $("effectsVolume").value =
                Math.round(state.effectsVolume * 100);
        }

        if ($("musicVolumeValue")) {
            $("musicVolumeValue").textContent =
                `${Math.round(state.musicVolume * 100)} %`;
        }

        if ($("effectsVolumeValue")) {
            $("effectsVolumeValue").textContent =
                `${Math.round(state.effectsVolume * 100)} %`;
        }

        if ($("graphicsQuality")) {
            $("graphicsQuality").value = state.graphicsQuality;
        }

        if ($("crowdSound")) {
            $("crowdSound").checked = state.crowdSound;
        }

        setText(
            "soundButton",
            state.soundEnabled ? "🔊" : "🔇"
        );
    }

    function saveSettings() {
        state.musicVolume = clamp(
            Number($("musicVolume")?.value || 0) / 100,
            0,
            1
        );

        state.effectsVolume = clamp(
            Number($("effectsVolume")?.value || 0) / 100,
            0,
            1
        );

        state.graphicsQuality =
            $("graphicsQuality")?.value || "high";

        state.crowdSound =
            $("crowdSound")?.checked !== false;

        updateAudioVolumes();

        if (state.lightEntity?.light) {
            state.lightEntity.light.castShadows =
                state.graphicsQuality === "high";
        }

        if (state.app) {
            const canvas = $("volleyballCanvas");

            if (state.graphicsQuality === "low") {
                state.app.graphicsDevice.maxPixelRatio = 1;
            } else if (state.graphicsQuality === "medium") {
                state.app.graphicsDevice.maxPixelRatio = 1.25;
            } else {
                state.app.graphicsDevice.maxPixelRatio = 1.75;
            }

            if (canvas) {
                state.app.resizeCanvas();
            }
        }

        syncSettingsUI();

        saveState();

        notify("Paramètres enregistrés.", "success");

        playSound("click");

        closeAllPanels();
    }

    /* ========================================================
       34. CHAMPIONNATS
    ======================================================== */

    function startCompetition(type) {
        const competitions = {
            caribbean: {
                name: "Caribbean Volleyball Cup",
                mission: 8,
                opponent: "CARIBBEAN ELITE"
            },

            elite: {
                name: "FOBAS Elite Championship",
                mission: 24,
                opponent: "MASTER STARS"
            },

            world: {
                name: "World Champions Tournament",
                mission: 36,
                opponent: "WORLD ACES"
            }
        };

        const competition = competitions[type];

        if (!competition) {
            return;
        }

        state.awayTeam = competition.opponent;

        if ($("awayTeamSelect")) {
            $("awayTeamSelect").value = competition.opponent;
        }

        notify(
            `Inscription : ${competition.name}`,
            "success"
        );

        startMatch({
            mission: competition.mission,
            mode: "championship"
        });
    }

    function startTournament() {
        const mission = Math.min(
            MISSION_COUNT,
            Math.max(1, state.unlockedMission)
        );

        startMatch({
            mission,
            mode: "tournament"
        });
    }

    /* ========================================================
       35. BOÎTE DE CONFIRMATION
    ======================================================== */

    function openConfirmation(title, message, action) {
        setText("dialogTitle", title);
        setText("dialogMessage", message);

        state.pendingDialogAction = action;

        const dialog = $("confirmationDialog");

        if (dialog && typeof dialog.showModal === "function") {
            if (!dialog.open) {
                dialog.showModal();
            }
        } else if (dialog) {
            dialog.setAttribute("open", "");
        }
    }

    function closeConfirmation() {
        const dialog = $("confirmationDialog");

        if (dialog?.open) {
            dialog.close();
        } else if (dialog) {
            dialog.removeAttribute("open");
        }

        state.pendingDialogAction = null;
    }

    /* ========================================================
       36. INITIALISATION / RÉINITIALISATION
    ======================================================== */

    async function resetProgress() {
        openConfirmation(
            "Réinitialiser la progression ?",
            "Cette action effacera les missions terminées, les victoires, les trophées, les paramètres et le profil sauvegardé.",
            async () => {
                try {
                    await dbDelete("gameState");
                } catch (error) {
                    console.warn(error);
                }

                try {
                    localStorage.removeItem(
                        `${DB_NAME}_fallback`
                    );
                } catch (error) {
                    console.warn(error);
                }

                state.mission = 1;
                state.completedMissions = [];
                state.unlockedMission = 1;

                state.wins = 0;
                state.matches = 0;
                state.trophies = 0;

                state.homeTeam = "FOBAS LEGENDS";
                state.awayTeam = "MASTER STARS";

                state.profileName = "Champion FOBAS";
                state.profileTeam = "FOBAS LEGENDS";

                state.ballStyle = "classic";
                state.kitStyle = "royal";

                state.homeScore = 0;
                state.awayScore = 0;

                state.homeSets = 0;
                state.awaySets = 0;
                state.currentSet = 1;

                state.soundEnabled = true;
                state.musicVolume = 0.55;
                state.effectsVolume = 0.75;
                state.crowdSound = true;
                state.graphicsQuality = "high";

                if ($("homeTeamSelect")) {
                    $("homeTeamSelect").value = state.homeTeam;
                }

                if ($("awayTeamSelect")) {
                    $("awayTeamSelect").value = state.awayTeam;
                }

                syncProfileUI();
                syncSettingsUI();
                updateMissionUI();
                updateEquipmentUI();

                if (state.engineReady) {
                    createTeams();
                    applyBallStyle();
                }

                updateScoreboard();

                await saveState();

                notify(
                    "Progression réinitialisée.",
                    "success"
                );

                closeAllPanels();
            }
        );
    }

    /* ========================================================
       37. BOUCLE DE JEU
    ======================================================== */

    function updateGame(dt) {
        if (!Number.isFinite(dt)) {
            return;
        }

        dt = Math.min(dt, 0.05);

        updateCamera();

        if (!state.running || state.paused || state.matchEnded) {
            return;
        }

        state.matchTime += dt;

        setText("matchClock", formatTime(state.matchTime));

        updatePlayerMovement(dt);
        updateAI(dt);
        updateBall(dt);

        Object.values(state.teams).forEach((players) => {
            players.forEach((player) => {
                if (!player.bench) {
                    updatePlayerAnimation(player, dt);
                }
            });
        });

        if (state.pointPause > 0) {
            state.pointPause -= dt;
        }

        // Enregistrer automatiquement la progression régulièrement.
        if (
            state.lastSave === null ||
            Date.now() - state.lastSave > 600000
        ) {
            saveState();
        }
    }

    /* ========================================================
       38. JOYSTICK TACTILE
    ======================================================== */

    function bindJoystick() {
        const base = $("joystickBase");

        if (!base) {
            return;
        }

        function calculate(event) {
            const rect = base.getBoundingClientRect();

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const dx = event.clientX - centerX;
            const dy = event.clientY - centerY;

            const radius = rect.width * 0.32;

            setJoystick(
                dx / radius,
                dy / radius
            );
        }

        base.addEventListener("pointerdown", (event) => {
            if (!canAct()) {
                return;
            }

            event.preventDefault();

            state.joystick.active = true;
            state.joystick.pointerId = event.pointerId;

            try {
                base.setPointerCapture(event.pointerId);
            } catch (_) {}

            calculate(event);
        });

        base.addEventListener("pointermove", (event) => {
            if (
                !state.joystick.active ||
                event.pointerId !== state.joystick.pointerId
            ) {
                return;
            }

            event.preventDefault();

            calculate(event);
        });

        const end = (event) => {
            if (
                state.joystick.pointerId !== null &&
                event.pointerId !== state.joystick.pointerId
            ) {
                return;
            }

            releaseJoystick();
        };

        base.addEventListener("pointerup", end);
        base.addEventListener("pointercancel", end);
        base.addEventListener("lostpointercapture", end);
    }

    /* ========================================================
       39. ZOOM À DEUX DOIGTS
    ======================================================== */

    function bindPinchZoom() {
        const canvas = $("volleyballCanvas");

        if (!canvas) {
            return;
        }

        canvas.addEventListener("pointerdown", (event) => {
            state.pointerPositions.set(
                event.pointerId,
                {
                    x: event.clientX,
                    y: event.clientY
                }
            );

            if (state.pointerPositions.size === 2) {
                const points = Array.from(
                    state.pointerPositions.values()
                );

                state.pinchDistance = Math.hypot(
                    points[0].x - points[1].x,
                    points[0].y - points[1].y
                );
            }
        });

        canvas.addEventListener("pointermove", (event) => {
            if (!state.pointerPositions.has(event.pointerId)) {
                return;
            }

            state.pointerPositions.set(
                event.pointerId,
                {
                    x: event.clientX,
                    y: event.clientY
                }
            );

            if (state.pointerPositions.size !== 2) {
                return;
            }

            const points = Array.from(
                state.pointerPositions.values()
            );

            const newDistance = Math.hypot(
                points[0].x - points[1].x,
                points[0].y - points[1].y
            );

            if (state.pinchDistance > 0) {
                const delta = newDistance - state.pinchDistance;

                if (Math.abs(delta) > 1.5) {
                    state.targetZoom = clamp(
                        state.targetZoom + delta * 0.0018,
                        0.65,
                        1.8
                    );
                }
            }

            state.pinchDistance = newDistance;
        });

        const end = (event) => {
            state.pointerPositions.delete(event.pointerId);

            if (state.pointerPositions.size < 2) {
                state.pinchDistance = 0;
            }
        };

        canvas.addEventListener("pointerup", end);
        canvas.addEventListener("pointercancel", end);
    }

    /* ========================================================
       40. CLAVIER
    ======================================================== */

    function bindKeyboard() {
        window.addEventListener("keydown", (event) => {
            state.keyboard[event.code] = true;

            if (
                ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"]
                    .includes(event.code)
            ) {
                event.preventDefault();
            }

            if (event.repeat) {
                return;
            }

            switch (event.code) {
                case "Space":
                    serveBall();
                    break;

                case "KeyP":
                    passBall();
                    break;

                case "KeyJ":
                    smashBall();
                    break;

                case "KeyB":
                    blockBall();
                    break;

                case "KeyC":
                    switchPlayer();
                    break;

                case "Escape":
                    if (state.running && !state.matchEnded) {
                        pauseGame();
                    }
                    break;
            }
        });

        window.addEventListener("keyup", (event) => {
            state.keyboard[event.code] = false;
        });

        window.addEventListener("blur", () => {
            state.keyboard = Object.create(null);
            releaseJoystick();
        });
    }

    /* ========================================================
       41. CONNEXION DE TOUS LES BOUTONS
    ======================================================== */

    function bindButtons() {
        // Navigation principale.
        on("playButton", "click", () => {
            startMatch({
                mission: state.mission,
                mode: "career"
            });
        });

        on("careerButton", "click", () => {
            updateMissionUI();
            openPanel("careerPanel");
        });

        on("championshipButton", "click", () => {
            openPanel("championshipPanel");
        });

        on("tournamentButton", "click", () => {
            startTournament();
        });

        on("teamsButton", "click", () => {
            populateTeamRoster();
            openPanel("teamsPanel");
        });

        on("equipmentButton", "click", () => {
            updateEquipmentUI();
            openPanel("equipmentPanel");
        });

        on("howToPlayButton", "click", () => {
            openPanel("howToPlayPanel");
        });

        on("settingsButton", "click", () => {
            syncSettingsUI();
            openPanel("settingsPanel");
        });

        // Sauvegarde et chargement.
        on("saveButton", "click", async () => {
            const result = await saveState();

            notify(
                result
                    ? "Partie sauvegardée."
                    : "Échec de la sauvegarde.",
                result ? "success" : "error"
            );
        });

        on("loadButton", "click", async () => {
            const result = await loadState();

            if (!result) {
                notify("Aucune sauvegarde à charger.");
            }
        });

        on("resetButton", "click", resetProgress);

        // Profil.
        on("profileButton", "click", () => {
            syncProfileUI();
            openPanel("profilePanel");
        });

        on("saveProfileButton", "click", saveProfile);

        on("closeProfileButton", "click", closeAllPanels);

        // Carrière.
        on("closeCareerButton", "click", closeAllPanels);

        // Championnats.
        on("closeChampionshipButton", "click", closeAllPanels);

        $$("[data-competition]").forEach((button) => {
            button.addEventListener("click", () => {
                startCompetition(button.dataset.competition);
            });
        });

        // Équipes.
        on("closeTeamsButton", "click", closeAllPanels);

        on("homeTeamSelect", "change", populateTeamRoster);

        on("confirmTeamsButton", "click", confirmTeams);

        // Équipements.
        on("closeEquipmentButton", "click", closeAllPanels);

        $$("[data-ball]").forEach((button) => {
            button.addEventListener("click", () => {
                chooseBall(button.dataset.ball);
            });
        });

        $$("[data-kit]").forEach((button) => {
            button.addEventListener("click", () => {
                chooseKit(button.dataset.kit);
            });
        });

        // Tutoriel.
        on("closeHowToPlayButton", "click", closeAllPanels);

        // Paramètres.
        on("closeSettingsButton", "click", closeAllPanels);

        on("musicVolume", "input", () => {
            state.musicVolume =
                Number($("musicVolume").value) / 100;

            setText(
                "musicVolumeValue",
                `${Math.round(state.musicVolume * 100)} %`
            );

            updateAudioVolumes();
        });

        on("effectsVolume", "input", () => {
            state.effectsVolume =
                Number($("effectsVolume").value) / 100;

            setText(
                "effectsVolumeValue",
                `${Math.round(state.effectsVolume * 100)} %`
            );

            updateAudioVolumes();
        });

        on("saveSettingsButton", "click", saveSettings);

        on("soundButton", "click", toggleSound);

        on("pauseButton", "click", pauseGame);

        // Caméra.
        on("zoomInButton", "click", zoomIn);
        on("zoomOutButton", "click", zoomOut);
        on("cameraResetButton", "click", resetCamera);

        // Contrôles du match.
        on("serveButton", "click", serveBall);
        on("passButton", "click", passBall);
        on("smashButton", "click", smashBall);
        on("blockButton", "click", blockBall);
        on("switchPlayerButton", "click", switchPlayer);

        on("leaveMatchButton", "click", leaveMatch);

        // Résultat.
        on("nextMissionButton", "click", () => {
            if (state.mission >= MISSION_COUNT) {
                startMatch({
                    mission: MISSION_COUNT,
                    mode: "career"
                });

                return;
            }

            const nextMission = Math.min(
                MISSION_COUNT,
                state.mission + 1
            );

            state.mission = nextMission;

            startMatch({
                mission: nextMission,
                mode: state.mode
            });
        });

        on("returnMenuButton", "click", returnToMenu);

        // Navigation inférieure.
        on("navHomeButton", "click", returnToMenu);

        on("navCareerButton", "click", () => {
            updateMissionUI();
            openPanel("careerPanel");
        });

        on("navTeamsButton", "click", () => {
            populateTeamRoster();
            openPanel("teamsPanel");
        });

        on("navProfileButton", "click", () => {
            syncProfileUI();
            openPanel("profilePanel");
        });

        // Dialogue de confirmation.
        on("dialogCancelButton", "click", closeConfirmation);

        on("dialogConfirmButton", "click", async () => {
            const action = state.pendingDialogAction;

            closeConfirmation();

            if (typeof action === "function") {
                await action();
            }
        });

        const dialog = $("confirmationDialog");

        if (dialog) {
            dialog.addEventListener("cancel", () => {
                state.pendingDialogAction = null;
            });
        }
    }

    /* ========================================================
       42. AUTO-SAUVEGARDE
    ======================================================== */

    function startAutosave() {
        setInterval(() => {
            if (state.initialized) {
                saveState();
            }
        }, 600000);

        window.addEventListener("pagehide", () => {
            if (state.initialized) {
                saveState();
            }
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden && state.initialized) {
                saveState();
            }
        });
    }

    /* ========================================================
       43. INITIALISATION DES DONNÉES
    ======================================================== */

    async function initializeData() {
        try {
            await openDatabase();

            setText(
                "saveStatus",
                "IndexedDB connecté."
            );
        } catch (error) {
            console.warn(
                "[FOBAS] IndexedDB indisponible :",
                error
            );

            state.dbAvailable = false;

            setText(
                "saveStatus",
                "Stockage de secours activé."
            );
        }

        if (state.dbAvailable) {
            try {
                await loadState();
            } catch (error) {
                console.warn(
                    "[FOBAS] Chargement initial :",
                    error
                );
            }
        } else {
            try {
                const raw = localStorage.getItem(
                    `${DB_NAME}_fallback`
                );

                if (raw) {
                    const data = JSON.parse(raw);

                    state.mission = data.mission || 1;
                    state.completedMissions =
                        data.completedMissions || [];

                    state.unlockedMission =
                        data.unlockedMission || 1;

                    state.wins = data.wins || 0;
                    state.matches = data.matches || 0;
                    state.trophies = data.trophies || 0;

                    state.profileName =
                        data.profileName || "Champion FOBAS";

                    state.profileTeam =
                        data.profileTeam || "FOBAS LEGENDS";

                    state.homeTeam =
                        data.homeTeam || "FOBAS LEGENDS";

                    state.awayTeam =
                        data.awayTeam || "MASTER STARS";
                }
            } catch (error) {
                console.warn(error);
            }
        }
    }

    /* ========================================================
       44. ERREUR GRAPHIQUE
    ======================================================== */

    function showEngineError(error) {
        console.error(
            "[FOBAS VOLLEYBALL] Erreur moteur 3D :",
            error
        );

        state.engineError = error;

        setText(
            "engineStatus",
            "ERREUR DE CHARGEMENT DU MOTEUR 3D"
        );

        setVisible("stadiumLoader", true);

        const loader = $("stadiumLoader");

        if (loader) {
            loader.innerHTML = `
                <span style="font-size:34px">⚠️</span>

                <strong style="margin-top:12px">
                    Le moteur 3D n'a pas pu démarrer.
                </strong>

                <p style="max-width:320px;margin-top:10px">
                    Vérifiez votre connexion Internet et ouvrez
                    cette application dans un navigateur compatible
                    avec WebGL.
                </p>

                <button id="retryEngineButton"
                        type="button"
                        style="
                            margin-top:18px;
                            padding:12px 18px;
                            border-radius:12px;
                            border:1px solid #00e5ff;
                            color:#fff;
                            background:#12364c;
                            font-weight:800;
                        ">
                    RÉESSAYER
                </button>
            `;

            on("retryEngineButton", "click", async () => {
                setText(
                    "engineStatus",
                    "NOUVELLE TENTATIVE..."
                );

                loader.innerHTML = `
                    <span class="stadium-loader-ball">🏐</span>
                    <span>Chargement du stade 3D...</span>
                `;

                try {
                    await initializeEngine();

                    state.engineError = null;

                    notify(
                        "Moteur 3D chargé avec succès.",
                        "success"
                    );
                } catch (retryError) {
                    showEngineError(retryError);
                }
            });
        }

        setLoadingProgress(
            0,
            "Impossible de charger PlayCanvas. Vérifiez Internet."
        );

        const screen = $("loadingScreen");

        if (screen) {
            screen.hidden = true;
        }

        notify(
            "Le moteur 3D n'a pas pu démarrer. Consultez le message sur le terrain.",
            "error",
            6000
        );
    }

    /* ========================================================
       45. DÉMARRAGE DE L'APPLICATION
    ======================================================== */

    async function initializeGame() {
        if (state.initialized) {
            return;
        }

        state.initialized = true;

        setLoadingProgress(
            3,
            "Préparation de FOBAS Volleyball Champions..."
        );

        bindButtons();
        bindJoystick();
        bindPinchZoom();
        bindKeyboard();

        window.addEventListener("resize", resizeCanvas);

        await initializeData();

        setLoadingProgress(
            14,
            "Chargement du moteur graphique..."
        );

        try {
            await initializeEngine();
        } catch (error) {
            showEngineError(error);
            return;
        }

        createTeams();

        updateScoreboard();
        updateMissionUI();
        syncProfileUI();
        syncSettingsUI();
        updateEquipmentUI();

        populateTeamRoster();

        startAutosave();

        hideLoading();

        setVisible("mainMenu", true);
        setVisible("stadiumSection", true);
        setVisible("matchControls", false);
        setVisible("matchResultPanel", false);

        setText(
            "gameMessage",
            "Bienvenue dans FOBAS Volleyball Champions 3D !"
        );

        setText(
            "engineStatus",
            `PLAYCANVAS ${VERSION} · 3D ACTIF`
        );

        notify(
            "FOBAS Volleyball Champions est prêt !",
            "success"
        );

        console.log(
            "FOBAS VOLLEYBALL CHAMPIONS 3D : initialisation terminée."
        );
    }

    /* ========================================================
       46. API PUBLIQUE POUR TESTS ET EXTENSIONS
    ======================================================== */

    window.FOBAS_VOLLEYBALL = Object.freeze({
        version: VERSION,

        startMatch,
        pauseGame,
        serveBall,
        passBall,
        smashBall,
        blockBall,
        switchPlayer,

        saveState,
        loadState,

        getState() {
            return {
                mission: state.mission,
                completedMissions: [
                    ...state.completedMissions
                ],
                unlockedMission: state.unlockedMission,

                homeTeam: state.homeTeam,
                awayTeam: state.awayTeam,

                homeScore: state.homeScore,
                awayScore: state.awayScore,

                homeSets: state.homeSets,
                awaySets: state.awaySets,

                wins: state.wins,
                matches: state.matches,
                trophies: state.trophies,

                engineReady: state.engineReady,
                running: state.running,
                paused: state.paused
            };
        }
    });

    /* ========================================================
       47. LANCEMENT AUTOMATIQUE
    ======================================================== */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeGame,
            { once: true }
        );
    } else {
        initializeGame();
    }

})();