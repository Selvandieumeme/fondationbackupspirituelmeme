/* ============================================================
   FOBAS FOOTBALL ULTIMATE 3D
   Fichier : appfootballfobas.js
   Version : 2.0.0
   Moteur : PlayCanvas 2.23.2
   Plateforme : Android / navigateur mobile et ordinateur

   FONCTIONS :
   - Chargement sécurisé du moteur 3D
   - Terrain 3D avec lignes, buts et éclairage
   - 22 joueurs visibles sur le terrain
   - Joueurs IA et déplacement
   - Ballon interactif
   - Passe, tir, sprint et défense
   - Caméra avec zoom et commandes tactiles
   - Navigation entre les écrans HTML
   - Équipes locales et internationales
   - Sept niveaux de compétition
   - Tournois
   - Équipement
   - Profil
   - Tactiques
   - Paramètres
   - IndexedDB avec solution de secours
   - Sauvegarde automatique toutes les 10 minutes
   - Reprise après erreur de démarrage

   Les éléments HTML sont recherchés par leurs identifiants.
============================================================ */

(() => {
    "use strict";

    /* ========================================================
       1. CONFIGURATION
    ======================================================== */

    const CONFIG = window.FOBAS_FOOTBALL_CONFIG || {};

    const APP_NAME =
        CONFIG.appName || "FOBAS FOOTBALL ULTIMATE 3D";

    const APP_VERSION = CONFIG.version || "2.0.0";

    const DB_NAME =
        CONFIG.databaseName || "FOBAS_FOOTBALL_ULTIMATE_DB";

    const DB_VERSION =
        Number(CONFIG.databaseVersion) || 1;

    const PLAYER_NAMES = Array.isArray(CONFIG.playerNames)
        ? CONFIG.playerNames
        : [
            "Ranise",
            "Junior",
            "Kerlande",
            "Nina",
            "Dieuben",
            "Lise",
            "Selvandieu",
            "Ricardo",
            "Natacha",
            "Sabine",
            "Muller"
        ];

    const REGIONS = Array.isArray(CONFIG.localRegions)
        ? CONFIG.localRegions
        : [
            "Mare-Rouge",
            "Môle-Saint-Nicolas",
            "Jean-Rabel",
            "Bombardopolis",
            "Baie-de-Henne",
            "Port-de-Paix"
        ];

    const COMPETITION_LEVELS =
        Array.isArray(CONFIG.competitionLevels)
            ? CONFIG.competitionLevels
            : [];

    const ROSTER_SIZE = 18;
    const PLAYERS_ON_FIELD = 11;

    const FIELD = {
        width: 28,
        length: 48,
        grassHeight: 0.15,
        lineHeight: 0.025,
        goalWidth: 7,
        goalHeight: 2.5
    };

    const CAMERA = {
        minHeight: 28,
        maxHeight: 75,
        height: 48,
        zoomStep: 4,
        angle: 8
    };

    const AUTOSAVE_INTERVAL = 10 * 60 * 1000;

    const STORAGE_KEY = "FOBAS_FOOTBALL_STATE_V2";

    const SCREEN_IDS = [
        "mainMenu",
        "matchScreen",
        "matchSetupScreen",
        "championshipScreen",
        "tournamentScreen",
        "teamsScreen",
        "equipmentScreen",
        "profileScreen",
        "howToPlayScreen",
        "settingsScreen"
    ];

    const ENGINE_IMPORT_URLS = [
        "https://esm.sh/playcanvas@2.23.2",
        "https://cdn.jsdelivr.net/npm/playcanvas@2.23.2/build/playcanvas.mjs"
    ];


    /* ========================================================
       2. ÉTAT CENTRAL
    ======================================================== */

    const state = {
        engine: null,
        app: null,
        cameraEntity: null,
        sceneRoot: null,
        fieldRoot: null,
        playerRoot: null,
        ballEntity: null,
        ballShadow: null,

        teams: [],
        homePlayers: [],
        awayPlayers: [],
        allPlayers: [],
        controlledPlayer: null,

        selectedHome: "mare-rouge",
        selectedAway: "mole-saint-nicolas",

        scoreHome: 0,
        scoreAway: 0,

        elapsed: 0,
        matchLength: 90,

        matchStarted: false,
        paused: false,
        matchFinished: false,

        ballVelocity: {
            x: 0,
            y: 0,
            z: 0
        },

        joystick: {
            x: 0,
            y: 0,
            active: false
        },

        sprinting: false,
        defending: false,

        cameraDistance: CAMERA.height,
        cameraAngle: CAMERA.angle,
        cameraMode: 0,

        db: null,

        soundEnabled: true,
        audioContext: null,

        currentScreen: "mainMenu",

        selectedEquipmentTab: "kits",

        selectedEquipment: {
            kits: "classic",
            balls: "classic",
            boots: "classic"
        },

        profile: {
            name: "Joueur FOBAS",
            favoriteTeam: "mare-rouge",
            matchesPlayed: 0,
            goalsScored: 0,
            trophies: 0
        },

        settings: {
            graphics: "medium",
            volume: 70,
            cameraSensitivity: 50,
            difficulty: "normal",
            vibration: true,
            commentary: true
        },

        tactics: {
            formation: "433",
            style: "balanced",
            pressure: "medium"
        },

        career: {
            currentMission: 1,
            completedMissions: [],
            wins: 0,
            losses: 0,
            draws: 0
        },

        selectedCompetition: "local",
        selectedChampionship: "local",

        tournaments: [],
        activeTournament: null,

        teamsFilter: {
            query: "",
            region: "all"
        },

        animationFrame: 0,
        lastSave: 0,
        lastAutoSave: 0,
        autoSaveTimer: null,

        lastAITick: 0,
        lastClockUpdate: 0,
        lastRefereeTick: 0,

        touchDistance: null,

        loadingFailed: false,
        booting: false,
        listenersAttached: false,

        engineReady: false,
        engineImporting: false,
        databaseAvailable: false,

        pointerId: null,
        joystickPointerId: null,

        lastFrameTime: 0,
        elapsedFrameTime: 0,

        lastAnnouncement: 0,
        activeScreenBeforePause: "matchScreen",

        resizeHandler: null,
        frameHandler: null,

        errorMessage: "",
        retryCount: 0,

        equipmentItems: {
            kits: [
                {
                    id: "classic",
                    name: "Maillot classique",
                    description: "Tenue traditionnelle FOBAS",
                    color: "#e9f0ff"
                },
                {
                    id: "royal",
                    name: "Maillot royal",
                    description: "Tenue royale",
                    color: "#2255d9"
                },
                {
                    id: "ocean",
                    name: "Maillot océan",
                    description: "Tenue inspirée des Caraïbes",
                    color: "#16a8b9"
                },
                {
                    id: "fire",
                    name: "Maillot feu",
                    description: "Tenue rouge dynamique",
                    color: "#e54c39"
                },
                {
                    id: "gold",
                    name: "Maillot champion",
                    description: "Tenue dorée",
                    color: "#e2b449"
                }
            ],

            balls: [
                {
                    id: "classic",
                    name: "Ballon classique",
                    description: "Ballon de football traditionnel"
                },
                {
                    id: "gold",
                    name: "Ballon doré",
                    description: "Ballon spécial championnat"
                },
                {
                    id: "ocean",
                    name: "Ballon océan",
                    description: "Ballon édition Caraïbes"
                },
                {
                    id: "fire",
                    name: "Ballon feu",
                    description: "Ballon édition spéciale"
                }
            ],

            boots: [
                {
                    id: "classic",
                    name: "Chaussures classiques",
                    description: "Chaussures polyvalentes"
                },
                {
                    id: "speed",
                    name: "Chaussures vitesse",
                    description: "Chaussures légères"
                },
                {
                    id: "power",
                    name: "Chaussures puissance",
                    description: "Chaussures pour les tirs puissants"
                }
            ]
        }
    };


    /* ========================================================
       3. OUTILS DOM
    ======================================================== */

    function $(id) {
        return document.getElementById(id);
    }

    function exists(id) {
        return Boolean($(id));
    }

    function safeText(id, value) {
        const element = $(id);

        if (element) {
            element.textContent = String(value ?? "");
        }
    }

    function show(element) {
        if (typeof element === "string") {
            element = $(element);
        }

        if (element) {
            element.classList.remove("hidden");
            element.removeAttribute("hidden");
        }
    }

    function hide(element) {
        if (typeof element === "string") {
            element = $(element);
        }

        if (element) {
            element.classList.add("hidden");
            element.setAttribute("hidden", "");
        }
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }

    function choose(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function safeNumber(value, fallback = 0) {
        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : fallback;
    }

    function safeCall(callback, ...args) {
        if (typeof callback !== "function") {
            return undefined;
        }

        try {
            return callback(...args);
        } catch (error) {
            console.error("[FOBAS] Erreur :", error);
            return undefined;
        }
    }


    /* ========================================================
       4. CHARGEMENT ET NOTIFICATIONS
    ======================================================== */

    function setLoading(percent, message) {
        const progress = clamp(
            Math.round(safeNumber(percent)),
            0,
            100
        );

        safeText("loadingMessage", message);
        safeText("loadingPercent", progress + " %");

        const bar = $("loadingProgressBar");

        if (bar) {
            bar.style.width = progress + "%";
        }

        const track = $("loadingProgressTrack");

        if (track) {
            track.setAttribute(
                "aria-valuenow",
                String(progress)
            );
        }

        console.info(
            "[FOBAS FOOTBALL] " + progress + "% — " + message
        );
    }

    function showLoadingError(error) {
        state.loadingFailed = true;

        const message = error?.message ||
            "Une erreur inconnue est survenue.";

        state.errorMessage = message;

        setLoading(
            100,
            "Échec du chargement : " + message
        );

        safeText(
            "engineStatus",
            "ERREUR : " + message
        );

        show("loadingScreen");
        show("retryLoadingBtn");

        toast(
            "Impossible de lancer le jeu : " + message,
            "error",
            9000
        );

        console.error(
            "[FOBAS FOOTBALL] Erreur de démarrage :",
            error
        );
    }

    function toast(message, type = "info", duration = 3500) {
        const container = $("toastContainer");

        if (!container) {
            console.log("[FOBAS]", message);
            return;
        }

        const item = document.createElement("div");

        item.className = "toast toast-" + type;
        item.textContent = String(message);

        container.appendChild(item);

        window.setTimeout(() => {
            item.classList.add("toast-leaving");

            window.setTimeout(() => {
                item.remove();
            }, 250);
        }, duration);
    }

    function announce(title, message, duration = 3000) {
        safeText("announcementTitle", title);
        safeText("announcementMessage", message);

        show("matchAnnouncement");

        state.lastAnnouncement = Date.now();

        window.setTimeout(() => {
            if (
                Date.now() - state.lastAnnouncement >= duration
            ) {
                hide("matchAnnouncement");
            }
        }, duration);
    }


    /* ========================================================
       5. STOCKAGE LOCAL
    ======================================================== */

    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!("indexedDB" in window)) {
                state.databaseAvailable = false;

                console.warn(
                    "[FOBAS] IndexedDB indisponible. " +
                    "Le jeu utilisera le stockage local."
                );

                resolve(null);
                return;
            }

            let request;

            try {
                request = indexedDB.open(
                    DB_NAME,
                    DB_VERSION
                );
            } catch (error) {
                reject(error);
                return;
            }

            request.onupgradeneeded = event => {
                const database = event.target.result;

                if (!database.objectStoreNames.contains("gameState")) {
                    database.createObjectStore(
                        "gameState",
                        { keyPath: "id" }
                    );
                }
            };

            request.onsuccess = event => {
                state.databaseAvailable = true;

                const database = event.target.result;

                database.onversionchange = () => {
                    database.close();
                    state.db = null;
                    state.databaseAvailable = false;
                };

                resolve(database);
            };

            request.onerror = () => {
                state.databaseAvailable = false;

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

    function databaseRead(key) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                resolve(null);
                return;
            }

            try {
                const transaction = state.db.transaction(
                    ["gameState"],
                    "readonly"
                );

                const request = transaction
                    .objectStore("gameState")
                    .get(key);

                request.onsuccess = () => {
                    resolve(request.result || null);
                };

                request.onerror = () => {
                    reject(
                        request.error ||
                        new Error("Lecture IndexedDB impossible.")
                    );
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    function databaseWrite(key, value) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                resolve(false);
                return;
            }

            try {
                const transaction = state.db.transaction(
                    ["gameState"],
                    "readwrite"
                );

                transaction
                    .objectStore("gameState")
                    .put({
                        id: key,
                        value,
                        updatedAt: Date.now()
                    });

                transaction.oncomplete = () => resolve(true);

                transaction.onerror = () => {
                    reject(
                        transaction.error ||
                        new Error("Écriture IndexedDB impossible.")
                    );
                };

                transaction.onabort = () => {
                    reject(
                        transaction.error ||
                        new Error("Transaction IndexedDB annulée.")
                    );
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    function getPersistentState() {
        return {
            version: APP_VERSION,

            selectedHome: state.selectedHome,
            selectedAway: state.selectedAway,

            scoreHome: state.scoreHome,
            scoreAway: state.scoreAway,

            profile: state.profile,
            settings: state.settings,
            tactics: state.tactics,
            career: state.career,

            selectedCompetition: state.selectedCompetition,
            selectedChampionship: state.selectedChampionship,

            tournaments: state.tournaments,
            activeTournament: state.activeTournament,

            selectedEquipment: state.selectedEquipment,
            selectedEquipmentTab: state.selectedEquipmentTab,

            soundEnabled: state.soundEnabled,

            savedAt: Date.now()
        };
    }

    function restorePersistentState(data) {
        if (!data || typeof data !== "object") {
            return;
        }

        if (data.profile && typeof data.profile === "object") {
            state.profile = {
                ...state.profile,
                ...data.profile
            };
        }

        if (data.settings && typeof data.settings === "object") {
            state.settings = {
                ...state.settings,
                ...data.settings
            };
        }

        if (data.tactics && typeof data.tactics === "object") {
            state.tactics = {
                ...state.tactics,
                ...data.tactics
            };
        }

        if (data.career && typeof data.career === "object") {
            state.career = {
                ...state.career,
                ...data.career
            };

            if (!Array.isArray(state.career.completedMissions)) {
                state.career.completedMissions = [];
            }
        }

        if (data.selectedEquipment) {
            state.selectedEquipment = {
                ...state.selectedEquipment,
                ...data.selectedEquipment
            };
        }

        if (Array.isArray(data.tournaments)) {
            state.tournaments = data.tournaments;
        }

        if (data.activeTournament) {
            state.activeTournament = data.activeTournament;
        }

        if (data.selectedHome) {
            state.selectedHome = data.selectedHome;
        }

        if (data.selectedAway) {
            state.selectedAway = data.selectedAway;
        }

        if (data.selectedCompetition) {
            state.selectedCompetition = data.selectedCompetition;
        }

        if (data.selectedChampionship) {
            state.selectedChampionship = data.selectedChampionship;
        }

        if (data.selectedEquipmentTab) {
            state.selectedEquipmentTab = data.selectedEquipmentTab;
        }

        if (typeof data.soundEnabled === "boolean") {
            state.soundEnabled = data.soundEnabled;
        }
    }

    async function loadAll() {
        let data = null;

        try {
            const record = await databaseRead("main");

            if (record && record.value) {
                data = record.value;
            }
        } catch (error) {
            console.warn(
                "[FOBAS] Lecture IndexedDB échouée :",
                error
            );
        }

        if (!data) {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);

                if (stored) {
                    data = JSON.parse(stored);
                }
            } catch (error) {
                console.warn(
                    "[FOBAS] Lecture du stockage local échouée :",
                    error
                );
            }
        }

        restorePersistentState(data);

        syncProfileUI();
        syncSettingsUI();
        syncTacticsUI();
    }

    async function saveAll(showMessage = true) {
        const data = getPersistentState();

        let localSaved = false;
        let databaseSaved = false;

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(data)
            );

            localSaved = true;
        } catch (error) {
            console.warn(
                "[FOBAS] Sauvegarde locale impossible :",
                error
            );
        }

        if (state.db) {
            try {
                databaseSaved = await databaseWrite(
                    "main",
                    data
                );
            } catch (error) {
                console.warn(
                    "[FOBAS] Sauvegarde IndexedDB échouée :",
                    error
                );
            }
        }

        if (localSaved || databaseSaved) {
            state.lastSave = Date.now();

            safeText(
                "saveStatusLabel",
                "Sauvegardé à " +
                new Date().toLocaleTimeString()
            );

            if (showMessage) {
                toast("Progression sauvegardée.", "success");
            }

            return true;
        }

        if (showMessage) {
            toast(
                "La sauvegarde n'a pas pu être effectuée.",
                "error"
            );
        }

        return false;
    }


    /* ========================================================
       6. DONNÉES DES ÉQUIPES
    ======================================================== */

    const TEAM_SEEDS = [
        {
            id: "mare-rouge",
            name: "Mare-Rouge",
            region: "northwest",
            country: "Haïti",
            primary: "#1747a8",
            secondary: "#ffffff",
            rating: 78
        },
        {
            id: "mole-saint-nicolas",
            name: "Môle-Saint-Nicolas",
            region: "northwest",
            country: "Haïti",
            primary: "#e54b3c",
            secondary: "#ffffff",
            rating: 79
        },
        {
            id: "jean-rabel",
            name: "Jean-Rabel",
            region: "northwest",
            country: "Haïti",
            primary: "#12815b",
            secondary: "#ffffff",
            rating: 76
        },
        {
            id: "bombardopolis",
            name: "Bombardopolis",
            region: "northwest",
            country: "Haïti",
            primary: "#e5b63d",
            secondary: "#17223d",
            rating: 75
        },
        {
            id: "baie-de-henne",
            name: "Baie-de-Henne",
            region: "northwest",
            country: "Haïti",
            primary: "#4a6cb4",
            secondary: "#f2e8d8",
            rating: 75
        },
        {
            id: "port-de-paix",
            name: "Port-de-Paix",
            region: "northwest",
            country: "Haïti",
            primary: "#243f88",
            secondary: "#f0c844",
            rating: 82
        },
        {
            id: "la-tortue",
            name: "La Tortue",
            region: "northwest",
            country: "Haïti",
            primary: "#258b75",
            secondary: "#ffffff",
            rating: 73
        },
        {
            id: "bassin-bleu",
            name: "Bassin-Bleu",
            region: "northwest",
            country: "Haïti",
            primary: "#3572d4",
            secondary: "#ffffff",
            rating: 73
        },
        {
            id: "chansolme",
            name: "Chansolme",
            region: "northwest",
            country: "Haïti",
            primary: "#bf3449",
            secondary: "#ffffff",
            rating: 72
        },
        {
            id: "saint-louis-du-nord",
            name: "Saint-Louis-du-Nord",
            region: "northwest",
            country: "Haïti",
            primary: "#d29d28",
            secondary: "#183c78",
            rating: 75
        },
        {
            id: "anse-a-foleur",
            name: "Anse-à-Foleur",
            region: "northwest",
            country: "Haïti",
            primary: "#2384a2",
            secondary: "#ffffff",
            rating: 72
        },
        {
            id: "cap-haitien",
            name: "Cap-Haïtien",
            region: "haiti",
            country: "Haïti",
            primary: "#2b4c91",
            secondary: "#ffffff",
            rating: 82
        },
        {
            id: "port-au-prince",
            name: "Port-au-Prince",
            region: "haiti",
            country: "Haïti",
            primary: "#d43d4b",
            secondary: "#ffffff",
            rating: 85
        },
        {
            id: "jacmel",
            name: "Jacmel",
            region: "haiti",
            country: "Haïti",
            primary: "#218767",
            secondary: "#ffffff",
            rating: 78
        },
        {
            id: "les-cayes",
            name: "Les Cayes",
            region: "haiti",
            country: "Haïti",
            primary: "#dca83b",
            secondary: "#1b3b78",
            rating: 78
        },
        {
            id: "fort-liberte",
            name: "Fort-Liberté",
            region: "haiti",
            country: "Haïti",
            primary: "#4b63b8",
            secondary: "#ffffff",
            rating: 75
        },
        {
            id: "haiti-national",
            name: "Sélection nationale d'Haïti",
            region: "haiti",
            country: "Haïti",
            primary: "#234baf",
            secondary: "#d83d43",
            rating: 87
        },
        {
            id: "jamaica",
            name: "Jamaïque",
            region: "caribbean",
            country: "Jamaïque",
            primary: "#1b8a52",
            secondary: "#f1ca39",
            rating: 84
        },
        {
            id: "dominican-republic",
            name: "République dominicaine",
            region: "caribbean",
            country: "République dominicaine",
            primary: "#df454b",
            secondary: "#ffffff",
            rating: 81
        },
        {
            id: "trinidad",
            name: "Trinité-et-Tobago",
            region: "caribbean",
            country: "Trinité-et-Tobago",
            primary: "#d63b42",
            secondary: "#ffffff",
            rating: 80
        },
        {
            id: "cuba",
            name: "Cuba",
            region: "caribbean",
            country: "Cuba",
            primary: "#d64a4a",
            secondary: "#ffffff",
            rating: 79
        },
        {
            id: "usa",
            name: "États-Unis",
            region: "americas",
            country: "États-Unis",
            primary: "#244b9a",
            secondary: "#ffffff",
            rating: 88
        },
        {
            id: "brazil",
            name: "Brésil",
            region: "americas",
            country: "Brésil",
            primary: "#23834d",
            secondary: "#f0cf3e",
            rating: 93
        },
        {
            id: "argentina",
            name: "Argentine",
            region: "americas",
            country: "Argentine",
            primary: "#8dc7e5",
            secondary: "#ffffff",
            rating: 94
        },
        {
            id: "france",
            name: "France",
            region: "europe",
            country: "France",
            primary: "#2e4fba",
            secondary: "#ffffff",
            rating: 94
        },
        {
            id: "spain",
            name: "Espagne",
            region: "europe",
            country: "Espagne",
            primary: "#d94a3c",
            secondary: "#e8bd3f",
            rating: 92
        },
        {
            id: "england",
            name: "Angleterre",
            region: "europe",
            country: "Angleterre",
            primary: "#e4e8f1",
            secondary: "#d83b4b",
            rating: 91
        },
        {
            id: "portugal",
            name: "Portugal",
            region: "europe",
            country: "Portugal",
            primary: "#258451",
            secondary: "#d54a3c",
            rating: 88
        },
        {
            id: "germany",
            name: "Allemagne",
            region: "europe",
            country: "Allemagne",
            primary: "#262626",
            secondary: "#e5c13d",
            rating: 90
        },
        {
            id: "morocco",
            name: "Maroc",
            region: "africa",
            country: "Maroc",
            primary: "#b52f43",
            secondary: "#1e7a4b",
            rating: 87
        },
        {
            id: "senegal",
            name: "Sénégal",
            region: "africa",
            country: "Sénégal",
            primary: "#21824c",
            secondary: "#e7d23f",
            rating: 86
        },
        {
            id: "nigeria",
            name: "Nigeria",
            region: "africa",
            country: "Nigeria",
            primary: "#23875b",
            secondary: "#ffffff",
            rating: 84
        }
    ];

    function slugify(text) {
        return String(text)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function buildTeams() {
        const teams = TEAM_SEEDS.map(team => ({ ...team }));

        const localNames = [
            ...REGIONS,
            "Gonaïves",
            "Saint-Marc",
            "Hinche",
            "Miragoâne",
            "Petit-Goâve",
            "Léogâne",
            "Port-Salut",
            "Ouanaminthe",
            "Limbé",
            "Plaisance"
        ];

        localNames.forEach((name, index) => {
            const id = slugify(name);

            if (teams.some(team => team.id === id)) {
                return;
            }

            teams.push({
                id,
                name,
                region: "northwest",
                country: "Haïti",
                primary: [
                    "#234baf",
                    "#d64545",
                    "#17845b",
                    "#e1b43e",
                    "#6a4eb3",
                    "#1886a0"
                ][index % 6],
                secondary: "#ffffff",
                rating: 68 + (index % 15)
            });
        });

        while (teams.length < (CONFIG.initialTeamCount || 100)) {
            const index = teams.length;

            teams.push({
                id: "fobas-club-" + (index + 1),
                name: "FOBAS Club " + (index + 1),
                region: [
                    "northwest",
                    "haiti",
                    "caribbean",
                    "americas",
                    "europe",
                    "africa",
                    "international"
                ][index % 7],
                country: "International",
                primary: [
                    "#1747a8",
                    "#e54b3c",
                    "#12815b",
                    "#b94ca3",
                    "#e2b449",
                    "#288fa6"
                ][index % 6],
                secondary: "#ffffff",
                rating: 65 + (index % 30)
            });
        }

        state.teams = teams;

        populateTeamSelects();
        renderTeams();
    }

    function getTeam(id) {
        return state.teams.find(team => team.id === id) ||
            state.teams[0] ||
            TEAM_SEEDS[0];
    }

    function populateTeamSelects() {
        const homeSelect = $("homeTeamSelect");
        const awaySelect = $("awayTeamSelect");
        const favoriteSelect = $("profileFavoriteTeam");

        if (homeSelect) {
            homeSelect.replaceChildren();

            state.teams.forEach(team => {
                const option = document.createElement("option");

                option.value = team.id;
                option.textContent = team.name;

                homeSelect.appendChild(option);
            });

            homeSelect.value = state.selectedHome;

            if (homeSelect.value !== state.selectedHome) {
                homeSelect.value = state.teams[0].id;
                state.selectedHome = homeSelect.value;
            }
        }

        if (awaySelect) {
            awaySelect.replaceChildren();

            state.teams.forEach(team => {
                const option = document.createElement("option");

                option.value = team.id;
                option.textContent = team.name;

                awaySelect.appendChild(option);
            });

            awaySelect.value = state.selectedAway;

            if (awaySelect.value === state.selectedHome) {
                const alternative = state.teams.find(
                    team => team.id !== state.selectedHome
                );

                if (alternative) {
                    awaySelect.value = alternative.id;
                    state.selectedAway = alternative.id;
                }
            }
        }

        if (favoriteSelect) {
            favoriteSelect.replaceChildren();

            state.teams.forEach(team => {
                const option = document.createElement("option");

                option.value = team.id;
                option.textContent = team.name;

                favoriteSelect.appendChild(option);
            });

            favoriteSelect.value = state.profile.favoriteTeam;
        }
    }


    /* ========================================================
       7. NAVIGATION ENTRE LES ÉCRANS
    ======================================================== */

    function showScreen(screenId) {
        if (!SCREEN_IDS.includes(screenId)) {
            console.warn(
                "[FOBAS] Écran inconnu :",
                screenId
            );

            return;
        }

        SCREEN_IDS.forEach(id => {
            const element = $(id);

            if (element) {
                element.classList.toggle(
                    "hidden",
                    id !== screenId
                );
            }
        });

        state.currentScreen = screenId;

        if (screenId === "teamsScreen") {
            renderTeams();
        }

        if (screenId === "equipmentScreen") {
            renderEquipment();
        }

        if (screenId === "championshipScreen") {
            renderChampionships();
        }

        if (screenId === "tournamentScreen") {
            renderTournaments();
        }

        if (screenId === "profileScreen") {
            syncProfileUI();
        }

        if (screenId === "settingsScreen") {
            syncSettingsUI();
        }

        if (screenId === "matchScreen") {
            resizeCanvas();
        }

        window.setTimeout(resizeCanvas, 100);
    }

    function goToMainMenu() {
        state.paused = false;

        hide("pauseOverlay");
        hide("tacticsOverlay");
        hide("dialogOverlay");

        showScreen("mainMenu");
    }


    /* ========================================================
       8. MOTEUR PLAYCANVAS
    ======================================================== */

    async function importPlayCanvas() {
        if (state.engine) {
            return state.engine;
        }

        if (state.engineImporting) {
            throw new Error(
                "Le chargement de PlayCanvas est déjà en cours."
            );
        }

        state.engineImporting = true;

        let lastError = null;

        try {
            for (let index = 0; index < ENGINE_IMPORT_URLS.length; index++) {
                const url = ENGINE_IMPORT_URLS[index];

                setLoading(
                    48 + index * 4,
                    "Chargement du moteur 3D (" +
                    (index + 1) +
                    "/" +
                    ENGINE_IMPORT_URLS.length +
                    ")..."
                );

                try {
                    const module = await import(url);

                    const engine = module.Application
                        ? module
                        : module.default;

                    if (
                        !engine ||
                        typeof engine.Application !== "function" ||
                        typeof engine.Entity !== "function"
                    ) {
                        throw new Error(
                            "Le module chargé ne fournit pas " +
                            "les classes PlayCanvas nécessaires."
                        );
                    }

                    state.engine = engine;

                    console.info(
                        "[FOBAS] PlayCanvas chargé depuis :",
                        url
                    );

                    return engine;
                } catch (error) {
                    lastError = error;

                    console.warn(
                        "[FOBAS] Échec de l'import PlayCanvas :",
                        url,
                        error
                    );
                }
            }

            throw new Error(
                "PlayCanvas n'a pas pu être chargé. " +
                "Vérifiez la connexion Internet, le navigateur " +
                "et les restrictions réseau. Détail : " +
                (lastError?.message || "erreur inconnue")
            );
        } finally {
            state.engineImporting = false;
        }
    }

    function createMaterial(colorHex, options = {}) {
        const pc = state.engine;

        const material = new pc.StandardMaterial();

        const color = new pc.Color();
        color.fromString(colorHex || "#ffffff");

        material.diffuse = color;

        material.metalness = options.metalness ?? 0;
        material.gloss = options.gloss ?? 35;

        if (options.emissive) {
            const emissive = new pc.Color();

            emissive.fromString(options.emissive);

            material.emissive = emissive;
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
        parent = state.sceneRoot
    ) {
        const pc = state.engine;

        const entity = new pc.Entity(name);

        entity.addComponent("render", {
            type
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

        if (material) {
            entity.render.material = material;
        }

        parent.addChild(entity);

        return entity;
    }

    function createBox(
        name,
        position,
        scale,
        material,
        parent = state.sceneRoot
    ) {
        return createPrimitive(
            name,
            "box",
            position,
            scale,
            material,
            parent
        );
    }

    function createSphere(
        name,
        position,
        scale,
        material,
        parent = state.sceneRoot
    ) {
        return createPrimitive(
            name,
            "sphere",
            position,
            scale,
            material,
            parent
        );
    }

    function createCylinder(
        name,
        position,
        scale,
        material,
        parent = state.sceneRoot
    ) {
        return createPrimitive(
            name,
            "cylinder",
            position,
            scale,
            material,
            parent
        );
    }

    function addLight(
        name,
        type,
        color,
        intensity,
        position,
        parent = state.sceneRoot
    ) {
        const pc = state.engine;

        const light = new pc.Entity(name);

        light.addComponent("light", {
            type,
            color: new pc.Color(
                color[0],
                color[1],
                color[2]
            ),
            intensity,
            castShadows: false
        });

        if (position) {
            light.setPosition(
                position[0],
                position[1],
                position[2]
            );
        }

        parent.addChild(light);

        return light;
    }

    function disposeEngineScene() {
        if (state.app) {
            try {
                state.app.destroy();
            } catch (error) {
                console.warn(
                    "[FOBAS] Nettoyage du moteur :",
                    error
                );
            }
        }

        state.app = null;
        state.cameraEntity = null;
        state.sceneRoot = null;
        state.fieldRoot = null;
        state.playerRoot = null;
        state.ballEntity = null;
        state.ballShadow = null;

        state.homePlayers = [];
        state.awayPlayers = [];
        state.allPlayers = [];

        state.controlledPlayer = null;

        state.engineReady = false;
    }

    async function createEngine() {
        if (state.engineReady && state.app) {
            return state.app;
        }

        const canvas = $("footballCanvas");

        if (!canvas) {
            throw new Error(
                "Canvas #footballCanvas introuvable dans le HTML."
            );
        }

        const pc = await importPlayCanvas();

        setLoading(58, "Initialisation du moteur graphique...");

        disposeEngineScene();

        let app;

        try {
            app = new pc.Application(canvas, {
                graphicsDeviceOptions: {
                    antialias: true,
                    alpha: false,
                    preserveDrawingBuffer: false,
                    powerPreference: "high-performance"
                }
            });
        } catch (error) {
            throw new Error(
                "Impossible de créer l'application PlayCanvas : " +
                (error?.message || error)
            );
        }

        state.app = app;

        try {
            if (typeof app.setCanvasFillMode === "function") {
                app.setCanvasFillMode(pc.FILLMODE_NONE);
            }

            if (typeof app.setCanvasResolution === "function") {
                app.setCanvasResolution(
                    pc.RESOLUTION_AUTO
                );
            }

            if (app.graphicsDevice) {
                app.graphicsDevice.maxPixelRatio =
                    state.settings.graphics === "high"
                        ? Math.min(window.devicePixelRatio || 1, 2)
                        : 1;
            }

            app.scene.ambientLight = new pc.Color(
                0.48,
                0.52,
                0.47
            );

            state.sceneRoot = app.root;

            state.fieldRoot = new pc.Entity("FootballFieldRoot");
            app.root.addChild(state.fieldRoot);

            state.playerRoot = new pc.Entity("FootballPlayersRoot");
            app.root.addChild(state.playerRoot);

            setLoading(64, "Construction du terrain...");

            buildFootballField();

            setLoading(72, "Création des équipes et des joueurs...");

            buildMatchPlayers();

            setLoading(80, "Configuration de la caméra...");

            createCamera();

            createBall();

            addLight(
                "FootballAmbientLight",
                "directional",
                [1, 0.96, 0.88],
                1.7,
                [-12, 25, 12]
            );

            addLight(
                "FootballFillLight",
                "directional",
                [0.72, 0.82, 1],
                0.55,
                [12, 20, -10]
            );

            app.on("update", onEngineUpdate);

            app.start();

            state.engineReady = true;

            resizeCanvas();
            updateScoreboard();

            console.info(
                "[FOBAS] Moteur 3D démarré."
            );

            return app;
        } catch (error) {
            disposeEngineScene();

            throw new Error(
                "Erreur pendant la construction de la scène 3D : " +
                (error?.message || error)
            );
        }
    }


    /* ========================================================
       9. CONSTRUCTION DU TERRAIN
    ======================================================== */

    function buildFootballField() {
        const pc = state.engine;

        const parent = state.fieldRoot;

        const grassDark = createMaterial("#1d693b");
        const grassLight = createMaterial("#287b43");
        const lineMaterial = createMaterial("#f3f6ef");
        const goalMaterial = createMaterial("#e9eef5");
        const groundMaterial = createMaterial("#183e2b");
        const blackMaterial = createMaterial("#17202b");

        const width = FIELD.width;
        const length = FIELD.length;
        const halfWidth = width / 2;
        const halfLength = length / 2;

        /* Sol autour du terrain. */
        createBox(
            "FootballGround",
            [0, -0.45, 0],
            [width + 15, 0.4, length + 15],
            groundMaterial,
            parent
        );

        /* Surface de jeu. */
        createBox(
            "FootballPitch",
            [0, -0.18, 0],
            [width, FIELD.grassHeight, length],
            grassDark,
            parent
        );

        /* Bandes de gazon pour donner du relief visuel. */
        const stripeCount = 8;
        const stripeLength = length / stripeCount;

        for (let i = 0; i < stripeCount; i++) {
            const z =
                -halfLength +
                stripeLength * i +
                stripeLength / 2;

            createBox(
                "GrassStripe_" + i,
                [0, -0.09, z],
                [width - 0.05, 0.015, stripeLength],
                i % 2 === 0 ? grassLight : grassDark,
                parent
            );
        }

        const y = 0.012;

        /* Limites du terrain. */
        createBox(
            "TouchlineLeft",
            [-halfWidth, y, 0],
            [FIELD.lineHeight, 0.03, length],
            lineMaterial,
            parent
        );

        createBox(
            "TouchlineRight",
            [halfWidth, y, 0],
            [FIELD.lineHeight, 0.03, length],
            lineMaterial,
            parent
        );

        createBox(
            "GoalLineNorth",
            [0, y, -halfLength],
            [width, 0.03, FIELD.lineHeight],
            lineMaterial,
            parent
        );

        createBox(
            "GoalLineSouth",
            [0, y, halfLength],
            [width, 0.03, FIELD.lineHeight],
            lineMaterial,
            parent
        );

        /* Ligne centrale. */
        createBox(
            "HalfwayLine",
            [0, y, 0],
            [width, 0.03, FIELD.lineHeight],
            lineMaterial,
            parent
        );

        /* Cercle central approximé par plusieurs segments. */
        const circleRadius = 4.5;
        const segments = 48;

        for (let i = 0; i < segments; i++) {
            const a1 = (i / segments) * Math.PI * 2;
            const a2 = ((i + 1) / segments) * Math.PI * 2;

            const x1 = Math.cos(a1) * circleRadius;
            const z1 = Math.sin(a1) * circleRadius;

            const x2 = Math.cos(a2) * circleRadius;
            const z2 = Math.sin(a2) * circleRadius;

            const midX = (x1 + x2) / 2;
            const midZ = (z1 + z2) / 2;

            const dx = x2 - x1;
            const dz = z2 - z1;

            const lengthSegment = Math.sqrt(
                dx * dx + dz * dz
            );

            const line = createBox(
                "CenterCircleSegment_" + i,
                [midX, y + 0.003, midZ],
                [0.045, 0.025, lengthSegment],
                lineMaterial,
                parent
            );

            line.setLocalEulerAngles(
                0,
                -Math.atan2(dx, dz) * 180 / Math.PI,
                0
            );
        }

        /* Point central. */
        createSphere(
            "CenterSpot",
            [0, 0.045, 0],
            [0.15, 0.035, 0.15],
            lineMaterial,
            parent
        );

        /* Surfaces des zones de réparation. */
        const penaltyWidth = 15;
        const penaltyLength = 6;

        createBox(
            "PenaltyNorthLeft",
            [-penaltyWidth / 2, y + 0.002, -halfLength + penaltyLength / 2],
            [FIELD.lineHeight, 0.025, penaltyLength],
            lineMaterial,
            parent
        );

        createBox(
            "PenaltyNorthRight",
            [penaltyWidth / 2, y + 0.002, -halfLength + penaltyLength / 2],
            [FIELD.lineHeight, 0.025, penaltyLength],
            lineMaterial,
            parent
        );

        createBox(
            "PenaltyNorthFront",
            [0, y + 0.002, -halfLength + penaltyLength],
            [penaltyWidth, 0.025, FIELD.lineHeight],
            lineMaterial,
            parent
        );

        createBox(
            "PenaltySouthLeft",
            [-penaltyWidth / 2, y + 0.002, halfLength - penaltyLength / 2],
            [FIELD.lineHeight, 0.025, penaltyLength],
            lineMaterial,
            parent
        );

        createBox(
            "PenaltySouthRight",
            [penaltyWidth / 2, y + 0.002, halfLength - penaltyLength / 2],
            [FIELD.lineHeight, 0.025, penaltyLength],
            lineMaterial,
            parent
        );

        createBox(
            "PenaltySouthFront",
            [0, y + 0.002, halfLength - penaltyLength],
            [penaltyWidth, 0.025, FIELD.lineHeight],
            lineMaterial,
            parent
        );

        /* Petites surfaces des buts. */
        const goalWidth = FIELD.goalWidth;
        const goalHeight = FIELD.goalHeight;

        const goalDepth = 2.5;
        const postScale = [0.12, goalHeight, 0.12];

        /* But nord. */
        createBox(
            "NorthGoalPostLeft",
            [-goalWidth / 2, goalHeight / 2 - 0.1, -halfLength - 0.7],
            postScale,
            goalMaterial,
            parent
        );

        createBox(
            "NorthGoalPostRight",
            [goalWidth / 2, goalHeight / 2 - 0.1, -halfLength - 0.7],
            postScale,
            goalMaterial,
            parent
        );

        createBox(
            "NorthGoalCrossbar",
            [0, goalHeight - 0.1, -halfLength - 0.7],
            [goalWidth, 0.12, 0.12],
            goalMaterial,
            parent
        );

        createBox(
            "NorthGoalNetBack",
            [0, goalHeight / 2 - 0.1, -halfLength - goalDepth],
            [goalWidth, goalHeight, 0.04],
            blackMaterial,
            parent
        );

        /* But sud. */
        createBox(
            "SouthGoalPostLeft",
            [-goalWidth / 2, goalHeight / 2 - 0.1, halfLength + 0.7],
            postScale,
            goalMaterial,
            parent
        );

        createBox(
            "SouthGoalPostRight",
            [goalWidth / 2, goalHeight / 2 - 0.1, halfLength + 0.7],
            postScale,
            goalMaterial,
            parent
        );

        createBox(
            "SouthGoalCrossbar",
            [0, goalHeight - 0.1, halfLength + 0.7],
            [goalWidth, 0.12, 0.12],
            goalMaterial,
            parent
        );

        createBox(
            "SouthGoalNetBack",
            [0, goalHeight / 2 - 0.1, halfLength + goalDepth],
            [goalWidth, goalHeight, 0.04],
            blackMaterial,
            parent
        );

        /* Petits drapeaux de coin. */
        const cornerPositions = [
            [-halfWidth, -halfLength],
            [halfWidth, -halfLength],
            [-halfWidth, halfLength],
            [halfWidth, halfLength]
        ];

        cornerPositions.forEach((position, index) => {
            const pole = createCylinder(
                "CornerPole_" + index,
                [position[0], 0.75, position[1]],
                [0.06, 1.5, 0.06],
                goalMaterial,
                parent
            );

            createBox(
                "CornerFlag_" + index,
                [
                    position[0] + 0.2,
                    1.35,
                    position[1]
                ],
                [0.45, 0.3, 0.04],
                createMaterial("#f4c43e"),
                parent
            );
        });

        /* Repères de terrain supplémentaires. */
        createBox(
            "GoalAreaNorth",
            [0, y + 0.001, -halfLength + 3.0],
            [8.0, 0.02, FIELD.lineHeight],
            lineMaterial,
            parent
        );

        createBox(
            "GoalAreaSouth",
            [0, y + 0.001, halfLength - 3.0],
            [8.0, 0.02, FIELD.lineHeight],
            lineMaterial,
            parent
        );

        console.info(
            "[FOBAS] Terrain construit :",
            width,
            "x",
            length
        );
    }


    /* ========================================================
       10. JOUEURS 3D
    ======================================================== */

    function createPlayerEntity(
        playerData,
        team,
        index,
        isHome
    ) {
        const pc = state.engine;

        const root = new pc.Entity(
            "Player_" + team.id + "_" + index
        );

        root.setLocalPosition(
            playerData.x,
            0,
            playerData.z
        );

        state.playerRoot.addChild(root);

        const kitColor = createMaterial(team.primary);
        const shortsColor = createMaterial(team.secondary);
        const skinColor = createMaterial(
            choose([
                "#7a4b32",
                "#986447",
                "#c28b63",
                "#5b392b",
                "#d3a078"
            ])
        );

        const sockColor = createMaterial(team.secondary);
        const bootColor = createMaterial("#20252b");

        const torso = createBox(
            "Torso",
            [0, 1.05, 0],
            [0.58, 0.72, 0.32],
            kitColor,
            root
        );

        const head = createSphere(
            "Head",
            [0, 1.67, 0],
            [0.36, 0.36, 0.36],
            skinColor,
            root
        );

        const shorts = createBox(
            "Shorts",
            [0, 0.57, 0],
            [0.54, 0.26, 0.31],
            shortsColor,
            root
        );

        const leftLeg = createBox(
            "LeftLeg",
            [-0.15, 0.28, 0],
            [0.18, 0.42, 0.19],
            sockColor,
            root
        );

        const rightLeg = createBox(
            "RightLeg",
            [0.15, 0.28, 0],
            [0.18, 0.42, 0.19],
            sockColor,
            root
        );

        const leftBoot = createBox(
            "LeftBoot",
            [-0.15, 0.055, -0.05],
            [0.2, 0.1, 0.3],
            bootColor,
            root
        );

        const rightBoot = createBox(
            "RightBoot",
            [0.15, 0.055, -0.05],
            [0.2, 0.1, 0.3],
            bootColor,
            root
        );

        const leftArm = createBox(
            "LeftArm",
            [-0.37, 1.05, 0],
            [0.17, 0.55, 0.18],
            kitColor,
            root
        );

        const rightArm = createBox(
            "RightArm",
            [0.37, 1.05, 0],
            [0.17, 0.55, 0.18],
            kitColor,
            root
        );

        const numberMaterial = createMaterial("#ffffff");

        const numberMarker = createBox(
            "PlayerNumberMarker",
            [0, 1.05, -0.17],
            [0.17, 0.18, 0.025],
            numberMaterial,
            root
        );

        const player = {
            id: playerData.id,
            name: playerData.name,

            teamId: team.id,
            teamName: team.name,

            isHome,

            root,
            torso,
            head,
            shorts,

            leftLeg,
            rightLeg,
            leftBoot,
            rightBoot,

            leftArm,
            rightArm,
            numberMarker,

            x: playerData.x,
            z: playerData.z,

            targetX: playerData.x,
            targetZ: playerData.z,

            homeX: playerData.x,
            homeZ: playerData.z,

            velocityX: 0,
            velocityZ: 0,

            speed: randomBetween(3.0, 4.5),

            hasBall: false,
            isGoalkeeper: playerData.position === "GK",

            number: index + 1,
            aiEnabled: true,

            animationPhase: Math.random() * Math.PI * 2,

            kitMaterial: kitColor
        };

        root.setLocalScale(1, 1, 1);

        return player;
    }

    function getFormationPositions(isHome) {
        const sign = isHome ? 1 : -1;

        const positions = [
            { x: 0, z: sign * 21.0, position: "GK" },

            { x: -8.2, z: sign * 14.0 },
            { x: -3.0, z: sign * 15.5 },
            { x: 3.0, z: sign * 15.5 },
            { x: 8.2, z: sign * 14.0 },

            { x: -9.0, z: sign * 6.8 },
            { x: -3.0, z: sign * 7.0 },
            { x: 3.0, z: sign * 7.0 },
            { x: 9.0, z: sign * 6.8 },

            { x: -4.0, z: sign * 1.5 },
            { x: 4.0, z: sign * 1.5 }
        ];

        return positions;
    }

    function buildMatchPlayers() {
        const homeTeam = getTeam(state.selectedHome);
        const awayTeam = getTeam(state.selectedAway);

        const homePositions = getFormationPositions(true);
        const awayPositions = getFormationPositions(false);

        state.homePlayers = [];
        state.awayPlayers = [];
        state.allPlayers = [];

        for (let index = 0; index < PLAYERS_ON_FIELD; index++) {
            const name = PLAYER_NAMES[
                index % PLAYER_NAMES.length
            ];

            const player = createPlayerEntity(
                {
                    id: homeTeam.id + "-player-" + (index + 1),
                    name,
                    x: homePositions[index].x,
                    z: homePositions[index].z,
                    position: homePositions[index].position
                },
                homeTeam,
                index,
                true
            );

            state.homePlayers.push(player);
            state.allPlayers.push(player);
        }

        for (let index = 0; index < PLAYERS_ON_FIELD; index++) {
            const name = PLAYER_NAMES[
                (index + 11) % PLAYER_NAMES.length
            ];

            const player = createPlayerEntity(
                {
                    id: awayTeam.id + "-player-" + (index + 1),
                    name,
                    x: awayPositions[index].x,
                    z: awayPositions[index].z,
                    position: awayPositions[index].position
                },
                awayTeam,
                index,
                false
            );

            state.awayPlayers.push(player);
            state.allPlayers.push(player);
        }

        state.controlledPlayer =
            state.homePlayers[9] ||
            state.homePlayers[0] ||
            null;

        console.info(
            "[FOBAS] Joueurs créés :",
            state.allPlayers.length
        );
    }


    /* ========================================================
       11. CAMÉRA 3D
    ======================================================== */

    function createCamera() {
        const pc = state.engine;

        const camera = new pc.Entity("FootballCamera");

        camera.addComponent("camera", {
            clearColor: new pc.Color(
                0.06,
                0.10,
                0.15
            ),

            fov: 55,
            nearClip: 0.1,
            farClip: 250,

            frustumCulling: true
        });

        state.sceneRoot.addChild(camera);

        state.cameraEntity = camera;

        updateCameraPosition(true);
    }

    function updateCameraPosition(immediate = false) {
        const camera = state.cameraEntity;

        if (!camera) return;

        const pc = state.engine;

        const distance = clamp(
            state.cameraDistance,
            CAMERA.minHeight,
            CAMERA.maxHeight
        );

        const controlled = state.controlledPlayer;

        const targetX = controlled ? controlled.x * 0.25 : 0;
        const targetZ = controlled ? controlled.z * 0.2 : 0;

        let height = distance;
        let zOffset = distance * 0.25;

        if (state.cameraMode === 1) {
            height = distance * 0.78;
            zOffset = distance * 0.72;
        } else if (state.cameraMode === 2) {
            height = distance * 1.15;
            zOffset = distance * 0.06;
        }

        height = clamp(
            height,
            CAMERA.minHeight * 0.7,
            CAMERA.maxHeight * 1.2
        );

        const targetPosition = {
            x: targetX,
            y: height,
            z: targetZ + zOffset
        };

        if (immediate) {
            camera.setPosition(
                targetPosition.x,
                targetPosition.y,
                targetPosition.z
            );
        } else {
            const current = camera.getPosition();

            const factor = 0.08;

            camera.setPosition(
                current.x +
                    (targetPosition.x - current.x) * factor,

                current.y +
                    (targetPosition.y - current.y) * factor,

                current.z +
                    (targetPosition.z - current.z) * factor
            );
        }

        camera.lookAt(targetX, 0, targetZ);

        const cameraComponent = camera.camera;

        if (cameraComponent) {
            cameraComponent.fov = state.cameraMode === 2
                ? 62
                : 55;
        }
    }

    function cameraZoomIn() {
        state.cameraDistance = clamp(
            state.cameraDistance - CAMERA.zoomStep,
            CAMERA.minHeight,
            CAMERA.maxHeight
        );

        updateCameraPosition(true);
    }

    function cameraZoomOut() {
        state.cameraDistance = clamp(
            state.cameraDistance + CAMERA.zoomStep,
            CAMERA.minHeight,
            CAMERA.maxHeight
        );

        updateCameraPosition(true);
    }

    function resetCamera() {
        state.cameraDistance = CAMERA.height;
        state.cameraMode = 0;

        updateCameraPosition(true);

        toast("Caméra réinitialisée.");
    }

    function changeCameraMode() {
        state.cameraMode = (state.cameraMode + 1) % 3;

        updateCameraPosition(true);

        const labels = [
            "Vue tactique",
            "Vue rapprochée",
            "Vue verticale"
        ];

        toast(labels[state.cameraMode]);
    }

    function resizeCanvas() {
        if (!state.app) return;

        const canvas = $("footballCanvas");

        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();

        if (!rect.width || !rect.height) {
            return;
        }

        canvas.width = Math.max(
            1,
            Math.round(rect.width * Math.min(window.devicePixelRatio || 1, 1.5))
        );

        canvas.height = Math.max(
            1,
            Math.round(rect.height * Math.min(window.devicePixelRatio || 1, 1.5))
        );

        if (state.app.graphicsDevice) {
            try {
                state.app.resizeCanvas(
                    canvas.width,
                    canvas.height
                );
            } catch (error) {
                console.warn(
                    "[FOBAS] Ajustement du canvas :",
                    error
                );
            }
        }
    }


    /* ========================================================
       12. BALLON
    ======================================================== */

    function createBall() {
        const ballMaterial = createMaterial("#f5f6f7", {
            gloss: 70
        });

        const ball = createSphere(
            "FootballBall",
            [0, 0.45, 0],
            [0.55, 0.55, 0.55],
            ballMaterial,
            state.sceneRoot
        );

        state.ballEntity = ball;

        state.ballShadow = createBox(
            "BallShadow",
            [0, 0.025, 0],
            [0.85, 0.025, 0.85],
            createMaterial("#193824"),
            state.sceneRoot
        );

        state.ballVelocity = {
            x: 0,
            y: 0,
            z: 0
        };

        return ball;
    }

    function getBallPosition() {
        if (!state.ballEntity) {
            return { x: 0, y: 0.45, z: 0 };
        }

        const position = state.ballEntity.getPosition();

        return {
            x: position.x,
            y: position.y,
            z: position.z
        };
    }

    function setBallPosition(x, y, z) {
        if (!state.ballEntity) return;

        state.ballEntity.setPosition(x, y, z);

        if (state.ballShadow) {
            state.ballShadow.setPosition(x, 0.025, z);
        }
    }

    function attachBallToPlayer(player) {
        if (!player || !state.ballEntity) return;

        state.allPlayers.forEach(item => {
            item.hasBall = item === player;
        });

        const offset = player.isHome ? -0.6 : 0.6;

        setBallPosition(
            player.x,
            0.45,
            player.z + offset
        );

        state.ballVelocity = {
            x: 0,
            y: 0,
            z: 0
        };
    }


    /* ========================================================
       13. MATCH ET SCORE
    ======================================================== */

    function updateScoreboard() {
        const home = getTeam(state.selectedHome);
        const away = getTeam(state.selectedAway);

        safeText("homeTeamName", home.name.toUpperCase());
        safeText("awayTeamName", away.name.toUpperCase());

        safeText("homeScore", state.scoreHome);
        safeText("awayScore", state.scoreAway);

        safeText(
            "competitionLabel",
            getCompetitionName(state.selectedCompetition).toUpperCase()
        );

        safeText(
            "stadiumLabel",
            $("stadiumSelect")?.value === "neutral"
                ? "TERRAIN NEUTRE"
                : "STADE FOBAS"
        );

        const elapsedMinutes = Math.floor(state.elapsed);

        const minutes = String(
            Math.floor(elapsedMinutes)
        ).padStart(2, "0");

        const seconds = String(
            Math.floor((state.elapsed % 1) * 60)
        ).padStart(2, "0");

        safeText(
            "matchClock",
            minutes + ":" + seconds
        );

        safeText(
            "matchPeriod",
            state.elapsed < state.matchLength / 2
                ? "1re MI-TEMPS"
                : "2e MI-TEMPS"
        );
    }

    function getCompetitionName(id) {
        const competition = COMPETITION_LEVELS.find(
            item => item.id === id
        );

        if (competition) {
            return competition.name;
        }

        const fallback = {
            local: "Match local",
            communal: "Championnat communal",
            northwest: "Championnat départemental",
            "haiti-national": "Championnat national",
            caribbean: "Tournoi des Caraïbes",
            international: "Compétition internationale",
            champions: "Tournoi des champions"
        };

        return fallback[id] || "Match de football";
    }

    function getMatchDuration() {
        const selected = $("matchDurationSelect")?.value ||
            "standard";

        if (selected === "short") return 5;
        if (selected === "long") return 20;

        return 10;
    }

    function prepareMatch() {
        const homeSelect = $("homeTeamSelect");
        const awaySelect = $("awayTeamSelect");
        const competitionSelect = $("competitionSelect");

        if (homeSelect) {
            state.selectedHome = homeSelect.value;
        }

        if (awaySelect) {
            state.selectedAway = awaySelect.value;
        }

        if (state.selectedHome === state.selectedAway) {
            toast(
                "Choisissez deux équipes différentes.",
                "error"
            );

            return false;
        }

        if (competitionSelect) {
            state.selectedCompetition = competitionSelect.value;
            state.selectedChampionship = competitionSelect.value;
        }

        state.scoreHome = 0;
        state.scoreAway = 0;

        state.elapsed = 0;
        state.matchLength = getMatchDuration();

        state.matchStarted = true;
        state.paused = false;
        state.matchFinished = false;

        if (state.app) {
            disposeEngineScene();
        }

        showScreen("matchScreen");

        safeText("engineStatus", "Préparation du terrain 3D...");

        state.cameraDistance = CAMERA.height;
        state.cameraMode = 0;

        createEngine()
            .then(() => {
                startMatchSimulation();

                safeText("engineStatus", "MATCH 3D EN COURS");

                announce(
                    "COUP D'ENVOI",
                    getTeam(state.selectedHome).name +
                    " contre " +
                    getTeam(state.selectedAway).name
                );
            })
            .catch(error => {
                showLoadingError(error);
            });

        return true;
    }

    function startMatchSimulation() {
        if (!state.engineReady) {
            return;
        }

        const kickoffPlayer =
            state.homePlayers[9] ||
            state.homePlayers[0];

        if (kickoffPlayer) {
            state.controlledPlayer = kickoffPlayer;
            attachBallToPlayer(kickoffPlayer);
        }

        updateScoreboard();
        updateCameraPosition(true);
    }

    function finishMatch() {
        if (state.matchFinished) return;

        state.matchFinished = true;
        state.matchStarted = false;

        state.profile.matchesPlayed += 1;

        if (state.scoreHome > state.scoreAway) {
            state.career.wins += 1;
            state.profile.trophies += 1;
        } else if (state.scoreHome < state.scoreAway) {
            state.career.losses += 1;
        } else {
            state.career.draws += 1;
        }

        state.career.currentMission += 1;

        const completed = state.career.completedMissions;

        if (!completed.includes(state.career.currentMission - 1)) {
            completed.push(state.career.currentMission - 1);
        }

        announce(
            "FIN DU MATCH",
            state.scoreHome + " - " + state.scoreAway,
            5000
        );

        safeText(
            "engineStatus",
            "MATCH TERMINÉ"
        );

        saveAll(false);

        window.setTimeout(() => {
            showMatchResultDialog();
        }, 500);
    }

    function showMatchResultDialog() {
        openDialog(
            "Résultat du match",
            `
                <div class="result-card">
                    <h3>${escapeHTML(getTeam(state.selectedHome).name)}</h3>
                    <p class="result-score">
                        ${state.scoreHome} - ${state.scoreAway}
                    </p>
                    <h3>${escapeHTML(getTeam(state.selectedAway).name)}</h3>
                    <p>Match terminé.</p>
                </div>
            `,
            [
                {
                    label: "REJOUER",
                    action: () => prepareMatch()
                },
                {
                    label: "MENU PRINCIPAL",
                    action: () => goToMainMenu()
                }
            ]
        );
    }


    /* ========================================================
       14. PHYSIQUE ET IA
    ======================================================== */

    function distance2D(x1, z1, x2, z2) {
        const dx = x1 - x2;
        const dz = z1 - z2;

        return Math.sqrt(dx * dx + dz * dz);
    }

    function findClosestPlayerToBall(players) {
        if (!players.length) return null;

        const ball = getBallPosition();

        let closest = null;
        let closestDistance = Infinity;

        for (const player of players) {
            const distance = distance2D(
                player.x,
                player.z,
                ball.x,
                ball.z
            );

            if (distance < closestDistance) {
                closest = player;
                closestDistance = distance;
            }
        }

        return closest;
    }

    function updateAI(delta) {
        if (!state.matchStarted || state.paused) return;

        const ball = getBallPosition();

        const closestHome = findClosestPlayerToBall(
            state.homePlayers
        );

        const closestAway = findClosestPlayerToBall(
            state.awayPlayers
        );

        const difficulty = state.settings.difficulty;

        const difficultyFactor = {
            easy: 0.7,
            normal: 1,
            hard: 1.2,
            expert: 1.4
        }[difficulty] || 1;

        for (const player of state.allPlayers) {
            if (player === state.controlledPlayer) {
                continue;
            }

            let targetX = player.homeX;
            let targetZ = player.homeZ;

            const attacking = player.isHome
                ? ball.z < 0
                : ball.z > 0;

            if (
                player === closestHome ||
                player === closestAway
            ) {
                targetX = ball.x;
                targetZ = ball.z;
            } else {
                const tacticalOffset = attacking ? 3.5 : -2.0;

                targetZ += player.isHome
                    ? -tacticalOffset
                    : tacticalOffset;

                targetX += Math.sin(
                    state.elapsed * 0.6 +
                    player.animationPhase
                ) * 1.3;

                targetZ += Math.cos(
                    state.elapsed * 0.4 +
                    player.animationPhase
                ) * 1.0;
            }

            targetX = clamp(
                targetX,
                -FIELD.width / 2 + 1,
                FIELD.width / 2 - 1
            );

            targetZ = clamp(
                targetZ,
                -FIELD.length / 2 + 1,
                FIELD.length / 2 - 1
            );

            player.targetX = targetX;
            player.targetZ = targetZ;

            const dx = targetX - player.x;
            const dz = targetZ - player.z;

            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance > 0.08) {
                const speed = player.speed * difficultyFactor;

                const move = Math.min(
                    distance,
                    speed * delta
                );

                player.x += dx / distance * move;
                player.z += dz / distance * move;

                player.root.setPosition(
                    player.x,
                    0,
                    player.z
                );

                const angle = Math.atan2(dx, dz);

                player.root.setLocalEulerAngles(
                    0,
                    angle * 180 / Math.PI,
                    0
                );
            }

            animatePlayer(player, delta);
        }

        updateBallPhysics(delta);
        updateControlledPlayer(delta);
        checkGoals();
    }

    function animatePlayer(player, delta) {
        player.animationPhase += delta * 5;

        const swing = Math.sin(
            player.animationPhase
        ) * 0.12;

        if (player.leftLeg) {
            player.leftLeg.setLocalEulerAngles(
                swing * 35,
                0,
                0
            );
        }

        if (player.rightLeg) {
            player.rightLeg.setLocalEulerAngles(
                -swing * 35,
                0,
                0
            );
        }

        if (player.leftArm) {
            player.leftArm.setLocalEulerAngles(
                -swing * 20,
                0,
                0
            );
        }

        if (player.rightArm) {
            player.rightArm.setLocalEulerAngles(
                swing * 20,
                0,
                0
            );
        }
    }

    function updateControlledPlayer(delta) {
        const player = state.controlledPlayer;

        if (!player || !state.matchStarted || state.paused) {
            return;
        }

        const joystick = state.joystick;

        if (!joystick.active) {
            return;
        }

        const speed = player.speed *
            (state.sprinting ? 1.65 : 1);

        const dx = joystick.x * speed * delta;
        const dz = joystick.y * speed * delta;

        player.x = clamp(
            player.x + dx,
            -FIELD.width / 2 + 0.5,
            FIELD.width / 2 - 0.5
        );

        player.z = clamp(
            player.z + dz,
            -FIELD.length / 2 + 0.5,
            FIELD.length / 2 - 0.5
        );

        player.root.setPosition(
            player.x,
            0,
            player.z
        );

        if (Math.abs(dx) + Math.abs(dz) > 0.001) {
            player.root.setLocalEulerAngles(
                0,
                Math.atan2(dx, dz) * 180 / Math.PI,
                0
            );
        }

        animatePlayer(player, delta);

        if (
            distance2D(
                player.x,
                player.z,
                getBallPosition().x,
                getBallPosition().z
            ) < 1.4
        ) {
            attachBallToPlayer(player);
        }
    }

    function updateBallPhysics(delta) {
        if (!state.ballEntity) return;

        const carrier = state.allPlayers.find(
            player => player.hasBall
        );

        if (carrier) {
            const angle =
                carrier.root.getEulerAngles().y *
                Math.PI / 180;

            const x = carrier.x + Math.sin(angle) * 0.65;
            const z = carrier.z + Math.cos(angle) * 0.65;

            setBallPosition(
                x,
                0.45 + Math.abs(Math.sin(state.elapsed * 8)) * 0.08,
                z
            );

            return;
        }

        const ball = getBallPosition();

        ball.x += state.ballVelocity.x * delta;
        ball.z += state.ballVelocity.z * delta;

        state.ballVelocity.x *= Math.pow(0.985, delta * 60);
        state.ballVelocity.z *= Math.pow(0.985, delta * 60);

        if (Math.abs(state.ballVelocity.x) < 0.04) {
            state.ballVelocity.x = 0;
        }

        if (Math.abs(state.ballVelocity.z) < 0.04) {
            state.ballVelocity.z = 0;
        }

        if (Math.abs(ball.x) > FIELD.width / 2 - 0.5) {
            state.ballVelocity.x *= -0.6;

            ball.x = clamp(
                ball.x,
                -FIELD.width / 2 + 0.5,
                FIELD.width / 2 - 0.5
            );
        }

        if (Math.abs(ball.z) > FIELD.length / 2 - 0.5) {
            state.ballVelocity.z *= -0.6;

            ball.z = clamp(
                ball.z,
                -FIELD.length / 2 + 0.5,
                FIELD.length / 2 - 0.5
            );
        }

        setBallPosition(
            ball.x,
            0.45,
            ball.z
        );

        const closestHome = findClosestPlayerToBall(
            state.homePlayers
        );

        const closestAway = findClosestPlayerToBall(
            state.awayPlayers
        );

        if (
            closestHome &&
            distance2D(
                closestHome.x,
                closestHome.z,
                ball.x,
                ball.z
            ) < 0.85
        ) {
            attachBallToPlayer(closestHome);
        } else if (
            closestAway &&
            distance2D(
                closestAway.x,
                closestAway.z,
                ball.x,
                ball.z
            ) < 0.85
        ) {
            attachBallToPlayer(closestAway);
        }
    }

    function checkGoals() {
        const ball = getBallPosition();

        const insideGoal =
            Math.abs(ball.x) < FIELD.goalWidth / 2;

        if (!insideGoal) return;

        if (ball.z < -FIELD.length / 2 + 0.4) {
            state.scoreHome += 1;
            state.profile.goalsScored += 1;

            resetAfterGoal("BUT POUR " + getTeam(state.selectedHome).name);
        } else if (ball.z > FIELD.length / 2 - 0.4) {
            state.scoreAway += 1;

            resetAfterGoal("BUT POUR " + getTeam(state.selectedAway).name);
        }
    }

    function resetAfterGoal(message) {
        state.allPlayers.forEach(player => {
            player.hasBall = false;
        });

        state.ballVelocity = {
            x: 0,
            y: 0,
            z: 0
        };

        setBallPosition(0, 0.45, 0);

        state.homePlayers.forEach((player, index) => {
            const positions = getFormationPositions(true);

            player.x = positions[index].x;
            player.z = positions[index].z;

            player.root.setPosition(
                player.x,
                0,
                player.z
            );
        });

        state.awayPlayers.forEach((player, index) => {
            const positions = getFormationPositions(false);

            player.x = positions[index].x;
            player.z = positions[index].z;

            player.root.setPosition(
                player.x,
                0,
                player.z
            );
        });

        if (state.controlledPlayer) {
            attachBallToPlayer(state.controlledPlayer);
        }

        updateScoreboard();

        announce("BUT !", message, 4000);

        safeCall(
            window.navigator.vibrate?.bind(window.navigator),
            100
        );
    }

    function onEngineUpdate(delta) {
        const dt = clamp(
            safeNumber(delta, 0),
            0,
            0.05
        );

        if (!state.app || !state.engineReady) {
            return;
        }

        if (state.matchStarted && !state.paused && !state.matchFinished) {
            state.elapsed += dt * 0.15;

            updateAI(dt);
            updateScoreboard();

            if (state.elapsed >= state.matchLength) {
                finishMatch();
            }
        }

        updateCameraPosition(false);
    }


    /* ========================================================
       15. ACTIONS DE FOOTBALL
    ======================================================== */

    function passBall() {
        const player = state.controlledPlayer;

        if (!player || !state.matchStarted || state.paused) {
            toast("Lancez un match pour jouer.", "info");
            return;
        }

        const teammate = state.homePlayers
            .filter(item => item !== player)
            .sort((a, b) => {
                const ball = getBallPosition();

                return distance2D(
                    a.x,
                    a.z,
                    ball.x,
                    ball.z
                ) - distance2D(
                    b.x,
                    b.z,
                    ball.x,
                    ball.z
                );
            })[0];

        if (!teammate) return;

        state.allPlayers.forEach(item => {
            item.hasBall = false;
        });

        state.ballVelocity.x =
            (teammate.x - player.x) * 1.5;

        state.ballVelocity.z =
            (teammate.z - player.z) * 1.5;

        setBallPosition(
            player.x,
            0.5,
            player.z
        );

        announce("PASSE", "Passe vers " + teammate.name);

        window.setTimeout(() => {
            if (state.matchStarted && !state.paused) {
                attachBallToPlayer(teammate);
            }
        }, 350);
    }

    function shootBall() {
        const player = state.controlledPlayer;

        if (!player || !state.matchStarted || state.paused) {
            toast("Lancez un match pour tirer.", "info");
            return;
        }

        state.allPlayers.forEach(item => {
            item.hasBall = false;
        });

        const direction = player.isHome ? -1 : 1;

        const power = state.sprinting ? 24 : 18;

        state.ballVelocity = {
            x: randomBetween(-2.5, 2.5),
            y: 0,
            z: direction * power
        };

        setBallPosition(
            player.x,
            0.5,
            player.z
        );

        announce("TIR !", "Le ballon est en mouvement.");

        state.profile.goalsScored =
            safeNumber(state.profile.goalsScored);
    }

    function switchPlayer() {
        if (!state.homePlayers.length) {
            toast("Aucun joueur disponible.", "error");
            return;
        }

        const ball = getBallPosition();

        const candidates = state.homePlayers
            .filter(player => player !== state.controlledPlayer)
            .sort((a, b) => {
                return distance2D(
                    a.x,
                    a.z,
                    ball.x,
                    ball.z
                ) - distance2D(
                    b.x,
                    b.z,
                    ball.x,
                    ball.z
                );
            });

        state.controlledPlayer = candidates[0] ||
            state.homePlayers[0];

        toast(
            "Joueur contrôlé : " +
            state.controlledPlayer.name
        );

        updateCameraPosition(true);
    }

    function toggleSprint(active) {
        state.sprinting = Boolean(active);
    }

    function toggleDefend(active) {
        state.defending = Boolean(active);

        if (state.defending) {
            const opponent = findClosestPlayerToBall(
                state.awayPlayers
            );

            if (opponent) {
                const player = state.controlledPlayer;

                if (player) {
                    const distance = distance2D(
                        player.x,
                        player.z,
                        opponent.x,
                        opponent.z
                    );

                    if (distance < 2) {
                        opponent.hasBall = false;
                        attachBallToPlayer(player);

                        announce(
                            "RÉCUPÉRATION",
                            "Vous avez récupéré le ballon."
                        );
                    }
                }
            }
        }
    }


    /* ========================================================
       16. JOYSTICK TACTILE
    ======================================================== */

    function setupJoystick() {
        const joystick = $("movementJoystick");
        const knob = $("joystickKnob");
        const base = $("joystickBase");

        if (!joystick || !knob || !base) {
            return;
        }

        let activePointer = null;

        function resetJoystick() {
            activePointer = null;

            state.joystick.x = 0;
            state.joystick.y = 0;
            state.joystick.active = false;

            knob.style.transform = "translate(0px, 0px)";
        }

        function updateJoystick(event) {
            const rect = base.getBoundingClientRect();

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            let dx = event.clientX - centerX;
            let dy = event.clientY - centerY;

            const radius = Math.max(
                20,
                Math.min(rect.width, rect.height) * 0.35
            );

            const length = Math.sqrt(
                dx * dx + dy * dy
            );

            if (length > radius) {
                dx = dx / length * radius;
                dy = dy / length * radius;
            }

            state.joystick.x = clamp(
                dx / radius,
                -1,
                1
            );

            state.joystick.y = clamp(
                dy / radius,
                -1,
                1
            );

            state.joystick.active = true;

            knob.style.transform =
                "translate(" + dx + "px, " + dy + "px)";
        }

        joystick.addEventListener("pointerdown", event => {
            if (activePointer !== null) return;

            event.preventDefault();

            activePointer = event.pointerId;

            try {
                joystick.setPointerCapture(event.pointerId);
            } catch {}

            updateJoystick(event);
        });

        joystick.addEventListener("pointermove", event => {
            if (event.pointerId !== activePointer) return;

            event.preventDefault();

            updateJoystick(event);
        });

        joystick.addEventListener("pointerup", event => {
            if (event.pointerId === activePointer) {
                resetJoystick();
            }
        });

        joystick.addEventListener("pointercancel", resetJoystick);
        joystick.addEventListener("lostpointercapture", resetJoystick);

        joystick.addEventListener("contextmenu", event => {
            event.preventDefault();
        });
    }


    /* ========================================================
       17. ZOOM AVEC DEUX DOIGTS
    ======================================================== */

    function setupPinchZoom() {
        const viewport = $("pitchViewport");

        if (!viewport) return;

        let initialDistance = null;
        let initialCameraDistance = null;

        viewport.addEventListener("touchstart", event => {
            if (event.touches.length === 2) {
                const a = event.touches[0];
                const b = event.touches[1];

                initialDistance = Math.hypot(
                    a.clientX - b.clientX,
                    a.clientY - b.clientY
                );

                initialCameraDistance = state.cameraDistance;
            }
        }, { passive: true });

        viewport.addEventListener("touchmove", event => {
            if (
                event.touches.length !== 2 ||
                initialDistance === null
            ) {
                return;
            }

            const a = event.touches[0];
            const b = event.touches[1];

            const distance = Math.hypot(
                a.clientX - b.clientX,
                a.clientY - b.clientY
            );

            const difference = distance - initialDistance;

            state.cameraDistance = clamp(
                initialCameraDistance - difference * 0.06,
                CAMERA.minHeight,
                CAMERA.maxHeight
            );

            updateCameraPosition(true);
        }, { passive: true });

        viewport.addEventListener("touchend", event => {
            if (event.touches.length < 2) {
                initialDistance = null;
                initialCameraDistance = null;
            }
        }, { passive: true });

        viewport.addEventListener("touchcancel", () => {
            initialDistance = null;
            initialCameraDistance = null;
        }, { passive: true });
    }


    /* ========================================================
       18. ÉCRAN DES ÉQUIPES
    ======================================================== */

    function renderTeams() {
        const container = $("teamsList");

        if (!container) return;

        const query = String(
            state.teamsFilter.query || ""
        ).trim().toLowerCase();

        const region = state.teamsFilter.region || "all";

        const filtered = state.teams.filter(team => {
            const matchesQuery =
                !query ||
                team.name.toLowerCase().includes(query) ||
                team.country.toLowerCase().includes(query);

            const matchesRegion =
                region === "all" ||
                team.region === region;

            return matchesQuery && matchesRegion;
        });

        container.replaceChildren();

        filtered.forEach(team => {
            const card = document.createElement("article");

            card.className = "team-card";

            card.innerHTML = `
                <div class="team-card-color"
                     style="background:${escapeHTML(team.primary)}"></div>

                <div class="team-card-content">
                    <h3>${escapeHTML(team.name)}</h3>
                    <p>${escapeHTML(team.country)}</p>
                    <small>Force : ${team.rating}/100</small>
                </div>

                <button type="button"
                        class="ui-button button-secondary"
                        data-team-home="${escapeHTML(team.id)}">
                    DOMICILE
                </button>

                <button type="button"
                        class="ui-button button-secondary"
                        data-team-away="${escapeHTML(team.id)}">
                    VISITEUR
                </button>
            `;

            container.appendChild(card);
        });

        safeText(
            "teamCountLabel",
            filtered.length + " équipe(s)"
        );
    }

    function selectTeam(id, side) {
        const team = getTeam(id);

        if (side === "home") {
            if (team.id === state.selectedAway) {
                toast(
                    "Les deux équipes doivent être différentes.",
                    "error"
                );
                return;
            }

            state.selectedHome = team.id;

            if ($("homeTeamSelect")) {
                $("homeTeamSelect").value = team.id;
            }
        } else {
            if (team.id === state.selectedHome) {
                toast(
                    "Les deux équipes doivent être différentes.",
                    "error"
                );
                return;
            }

            state.selectedAway = team.id;

            if ($("awayTeamSelect")) {
                $("awayTeamSelect").value = team.id;
            }
        }

        toast(
            team.name + " sélectionnée comme équipe " +
            (side === "home" ? "à domicile." : "visiteuse."),
            "success"
        );

        saveAll(false);
    }

    function refreshTeams() {
        buildTeams();
        renderTeams();

        toast(
            state.teams.length + " équipes disponibles.",
            "success"
        );
    }


    /* ========================================================
       19. CHAMPIONNATS
    ======================================================== */

    function renderChampionships() {
        const container = $("competitionLevelsList");

        if (!container) return;

        container.replaceChildren();

        const levels = COMPETITION_LEVELS.length
            ? COMPETITION_LEVELS
            : [
                { id: "local", name: "Matchs locaux", description: "Matchs entre clubs locaux." },
                { id: "communal", name: "Championnats communaux", description: "Compétitions communales." },
                { id: "northwest", name: "Championnat du Nord-Ouest", description: "Équipes du Nord-Ouest." },
                { id: "haiti-national", name: "Championnat national", description: "Compétition nationale." },
                { id: "caribbean", name: "Tournoi des Caraïbes", description: "Compétition régionale." },
                { id: "international", name: "Compétitions internationales", description: "Équipes du monde." },
                { id: "champions", name: "Tournoi des champions", description: "Finales." }
            ];

        levels.forEach((level, index) => {
            const card = document.createElement("article");

            card.className = "competition-level-card";

            card.innerHTML = `
                <div class="competition-level-number">
                    ${index + 1}
                </div>

                <div>
                    <h3>${escapeHTML(level.name)}</h3>
                    <p>${escapeHTML(level.description || "")}</p>
                </div>

                <button type="button"
                        class="ui-button button-secondary"
                        data-competition="${escapeHTML(level.id)}">
                    CHOISIR
                </button>
            `;

            container.appendChild(card);
        });
    }

    function selectCompetition(id) {
        state.selectedCompetition = id;
        state.selectedChampionship = id;

        if ($("competitionSelect")) {
            $("competitionSelect").value = id;
        }

        toast(
            getCompetitionName(id) + " sélectionné.",
            "success"
        );

        saveAll(false);
    }


    /* ========================================================
       20. TOURNOIS
    ======================================================== */

    function renderTournaments() {
        const container = $("tournamentList");

        if (!container) return;

        container.replaceChildren();

        if (!state.tournaments.length) {
            const empty = document.createElement("div");

            empty.className = "empty-state";

            empty.textContent =
                "Aucun tournoi créé. Utilisez le bouton ci-dessous.";

            container.appendChild(empty);
            return;
        }

        state.tournaments.forEach((tournament, index) => {
            const card = document.createElement("article");

            card.className = "tournament-card";

            card.innerHTML = `
                <h3>${escapeHTML(tournament.name)}</h3>
                <p>${escapeHTML(tournament.type || "Tournoi FOBAS")}</p>
                <small>${escapeHTML(tournament.createdAt || "")}</small>

                <button type="button"
                        class="ui-button button-primary"
                        data-tournament-index="${index}">
                    SÉLECTIONNER
                </button>
            `;

            container.appendChild(card);
        });
    }

    function createTournament() {
        openDialog(
            "Créer un tournoi",
            `
                <label for="newTournamentName">Nom du tournoi</label>
                <input id="newTournamentName"
                       type="text"
                       maxlength="60"
                       placeholder="Tournoi FOBAS">

                <label for="newTournamentType">Type de tournoi</label>
                <select id="newTournamentType">
                    <option value="local">Local</option>
                    <option value="communal">Communal</option>
                    <option value="caribbean">Caraïbes</option>
                    <option value="international">International</option>
                </select>
            `,
            [
                {
                    label: "CRÉER",
                    action: () => {
                        const name = String(
                            $("newTournamentName")?.value || ""
                        ).trim();

                        const type = $("newTournamentType")?.value ||
                            "local";

                        if (!name) {
                            toast(
                                "Entrez le nom du tournoi.",
                                "error"
                            );
                            return;
                        }

                        const tournament = {
                            id: "tournament-" + Date.now(),
                            name,
                            type,
                            createdAt: new Date().toLocaleDateString(),
                            matches: [],
                            champion: null
                        };

                        state.tournaments.push(tournament);
                        state.activeTournament = tournament;

                        saveAll(false);

                        closeDialog();
                        renderTournaments();

                        toast(
                            "Tournoi créé : " + name,
                            "success"
                        );
                    }
                },
                {
                    label: "ANNULER",
                    action: closeDialog
                }
            ]
        );
    }


    /* ========================================================
       21. ÉQUIPEMENT
    ======================================================== */

    function renderEquipment() {
        const container = $("equipmentItemsList");

        if (!container) return;

        const category = state.selectedEquipmentTab;

        const items = state.equipmentItems[category] || [];

        container.replaceChildren();

        document.querySelectorAll("[data-equipment-tab]").forEach(button => {
            const active =
                button.dataset.equipmentTab === category;

            button.classList.toggle("active", active);

            button.setAttribute(
                "aria-selected",
                String(active)
            );
        });

        items.forEach(item => {
            const card = document.createElement("article");

            card.className = "equipment-item-card";

            const selected =
                state.selectedEquipment[category] === item.id;

            card.innerHTML = `
                <div class="equipment-item-preview"
                     style="background:${escapeHTML(item.color || "#26384e")}">
                    ${category === "balls" ? "⚽" : category === "boots" ? "👟" : "👕"}
                </div>

                <div class="equipment-item-info">
                    <h3>${escapeHTML(item.name)}</h3>
                    <p>${escapeHTML(item.description)}</p>
                </div>

                <button type="button"
                        class="ui-button ${selected ? "button-primary" : "button-secondary"}"
                        data-equipment-id="${escapeHTML(item.id)}">
                    ${selected ? "SÉLECTIONNÉ" : "CHOISIR"}
                </button>
            `;

            container.appendChild(card);
        });
    }

    function selectEquipment(id) {
        const category = state.selectedEquipmentTab;

        const items = state.equipmentItems[category] || [];

        if (!items.some(item => item.id === id)) {
            return;
        }

        state.selectedEquipment[category] = id;

        renderEquipment();

        toast(
            "Équipement sélectionné.",
            "success"
        );
    }

    function applyEquipment() {
        const kit = state.selectedEquipment.kits;

        const item = state.equipmentItems.kits.find(
            equipment => equipment.id === kit
        );

        if (item && state.controlledPlayer?.kitMaterial) {
            state.controlledPlayer.kitMaterial.diffuse.fromString(
                item.color
            );

            state.controlledPlayer.kitMaterial.update();
        }

        saveAll(false);

        toast(
            "Équipement appliqué et sauvegardé.",
            "success"
        );
    }


    /* ========================================================
       22. PROFIL
    ======================================================== */

    function syncProfileUI() {
        safeText(
            "profileMatchesPlayed",
            state.profile.matchesPlayed
        );

        safeText(
            "profileGoalsScored",
            state.profile.goalsScored
        );

        safeText(
            "profileTrophies",
            state.profile.trophies
        );

        const nameInput = $("profileNameInput");

        if (
            nameInput &&
            document.activeElement !== nameInput
        ) {
            nameInput.value = state.profile.name;
        }

        const favoriteSelect = $("profileFavoriteTeam");

        if (favoriteSelect) {
            favoriteSelect.value = state.profile.favoriteTeam;
        }
    }

    function saveProfile() {
        const name = String(
            $("profileNameInput")?.value || ""
        ).trim();

        const favoriteTeam = $("profileFavoriteTeam")?.value ||
            state.profile.favoriteTeam;

        if (!name) {
            toast(
                "Le nom du joueur ne peut pas être vide.",
                "error"
            );

            return;
        }

        state.profile.name = name.slice(0, 40);
        state.profile.favoriteTeam = favoriteTeam;

        syncProfileUI();

        saveAll(false);

        toast(
            "Profil sauvegardé.",
            "success"
        );
    }


    /* ========================================================
       23. PARAMÈTRES
    ======================================================== */

    function syncSettingsUI() {
        const graphics = $("graphicsQualitySelect");
        const volume = $("soundVolumeInput");
        const sensitivity = $("cameraSensitivityInput");
        const difficulty = $("matchDifficultySelect");
        const vibration = $("vibrationToggle");
        const commentary = $("commentaryToggle");

        if (graphics) {
            graphics.value = state.settings.graphics;
        }

        if (volume) {
            volume.value = state.settings.volume;
        }

        if (sensitivity) {
            sensitivity.value = state.settings.cameraSensitivity;
        }

        if (difficulty) {
            difficulty.value = state.settings.difficulty;
        }

        if (vibration) {
            vibration.checked = state.settings.vibration;
        }

        if (commentary) {
            commentary.checked = state.settings.commentary;
        }

        updateSoundButton();
    }

    function readSettingsFromUI() {
        state.settings.graphics =
            $("graphicsQualitySelect")?.value || "medium";

        state.settings.volume = clamp(
            safeNumber($("soundVolumeInput")?.value, 70),
            0,
            100
        );

        state.settings.cameraSensitivity = clamp(
            safeNumber(
                $("cameraSensitivityInput")?.value,
                50
            ),
            1,
            100
        );

        state.settings.difficulty =
            $("matchDifficultySelect")?.value || "normal";

        state.settings.vibration =
            Boolean($("vibrationToggle")?.checked);

        state.settings.commentary =
            Boolean($("commentaryToggle")?.checked);
    }

    function saveSettings() {
        readSettingsFromUI();

        if (state.app?.graphicsDevice) {
            state.app.graphicsDevice.maxPixelRatio =
                state.settings.graphics === "high"
                    ? Math.min(window.devicePixelRatio || 1, 2)
                    : 1;
        }

        saveAll(false);

        toast(
            "Paramètres enregistrés.",
            "success"
        );
    }

    function syncTacticsUI() {
        const formation = $("formationSelect");
        const style = $("tacticalStyleSelect");
        const pressure = $("pressureSelect");

        if (formation) {
            formation.value = state.tactics.formation;
        }

        if (style) {
            style.value = state.tactics.style;
        }

        if (pressure) {
            pressure.value = state.tactics.pressure;
        }
    }

    function applyTactics() {
        state.tactics.formation =
            $("formationSelect")?.value || "433";

        state.tactics.style =
            $("tacticalStyleSelect")?.value || "balanced";

        state.tactics.pressure =
            $("pressureSelect")?.value || "medium";

        applyFormation();

        saveAll(false);

        closeTactics();

        toast(
            "Tactiques appliquées.",
            "success"
        );
    }

    function applyFormation() {
        if (!state.homePlayers.length || !state.awayPlayers.length) {
            return;
        }

        const homePositions = getFormationPositions(true);
        const awayPositions = getFormationPositions(false);

        state.homePlayers.forEach((player, index) => {
            const position = homePositions[index];

            if (!position) return;

            player.homeX = position.x;
            player.homeZ = position.z;

            player.targetX = position.x;
            player.targetZ = position.z;
        });

        state.awayPlayers.forEach((player, index) => {
            const position = awayPositions[index];

            if (!position) return;

            player.homeX = position.x;
            player.homeZ = position.z;

            player.targetX = position.x;
            player.targetZ = position.z;
        });
    }


    /* ========================================================
       24. BOÎTES DE DIALOGUE
    ======================================================== */

    let dialogActionHandlers = [];

    function openDialog(title, content, actions = []) {
        safeText("dialogTitle", title);

        const contentElement = $("dialogContent");
        const actionsElement = $("dialogActions");

        if (contentElement) {
            contentElement.innerHTML = content;
        }

        if (actionsElement) {
            actionsElement.replaceChildren();

            actions.forEach((item, index) => {
                const button = document.createElement("button");

                button.type = "button";
                button.className =
                    "ui-button " +
                    (index === 0
                        ? "button-primary"
                        : "button-secondary");

                button.textContent = item.label;

                button.addEventListener("click", () => {
                    safeCall(item.action);
                });

                actionsElement.appendChild(button);
            });
        }

        show("dialogOverlay");
    }

    function closeDialog() {
        hide("dialogOverlay");

        const content = $("dialogContent");
        const actions = $("dialogActions");

        if (content) {
            content.replaceChildren();
        }

        if (actions) {
            actions.replaceChildren();
        }
    }

    function openTactics() {
        syncTacticsUI();
        show("tacticsOverlay");
    }

    function closeTactics() {
        hide("tacticsOverlay");
    }


    /* ========================================================
       25. PAUSE ET SAUVEGARDE DU MATCH
    ======================================================== */

    function pauseMatch() {
        if (!state.matchStarted) {
            toast(
                "Aucun match en cours.",
                "info"
            );
            return;
        }

        state.paused = true;

        show("pauseOverlay");

        safeText(
            "engineStatus",
            "MATCH EN PAUSE"
        );
    }

    function resumeMatch() {
        state.paused = false;

        hide("pauseOverlay");

        safeText(
            "engineStatus",
            "MATCH 3D EN COURS"
        );
    }

    function saveCurrentMatch() {
        saveAll(false).then(success => {
            if (success) {
                toast(
                    "Progression sauvegardée.",
                    "success"
                );
            } else {
                toast(
                    "La sauvegarde a échoué.",
                    "error"
                );
            }
        });
    }

    function quitMatch() {
        state.paused = false;
        state.matchStarted = false;

        hide("pauseOverlay");
        hide("tacticsOverlay");

        saveAll(false);

        goToMainMenu();
    }


    /* ========================================================
       26. SON ET COMMENTAIRES
    ======================================================== */

    function updateSoundButton() {
        const button = $("soundToggleBtn");

        if (!button) return;

        button.textContent = state.soundEnabled
            ? "🔊"
            : "🔇";

        button.setAttribute(
            "aria-pressed",
            String(state.soundEnabled)
        );
    }

    function toggleSound() {
        state.soundEnabled = !state.soundEnabled;

        updateSoundButton();

        saveAll(false);

        toast(
            state.soundEnabled
                ? "Son activé."
                : "Son désactivé."
        );
    }

    function playBeep(frequency = 440, duration = 0.12) {
        if (!state.soundEnabled) return;

        try {
            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

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

            oscillator.frequency.value = frequency;
            oscillator.type = "sine";

            gain.gain.setValueAtTime(
                0.06,
                context.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                context.currentTime + duration
            );

            oscillator.connect(gain);
            gain.connect(context.destination);

            oscillator.start();
            oscillator.stop(
                context.currentTime + duration
            );
        } catch (error) {
            console.warn(
                "[FOBAS] Son indisponible :",
                error
            );
        }
    }


    /* ========================================================
       27. DÉMARRAGE PRINCIPAL
    ======================================================== */

    async function boot() {
        if (state.booting) return;

        state.booting = true;
        state.loadingFailed = false;

        hide("retryLoadingBtn");
        show("loadingScreen");

        const withTimeout = (promise, milliseconds, label) => {
            let timeoutId;

            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = window.setTimeout(() => {
                    reject(
                        new Error(
                            label +
                            " : délai dépassé après " +
                            Math.round(milliseconds / 1000) +
                            " secondes."
                        )
                    );
                }, milliseconds);
            });

            return Promise.race([
                Promise.resolve(promise),
                timeoutPromise
            ]).finally(() => {
                window.clearTimeout(timeoutId);
            });
        };

        try {
            setLoading(
                3,
                "Démarrage de FOBAS FOOTBALL..."
            );

            attachEvents();

            setLoading(
                12,
                "Ouverture de la sauvegarde locale..."
            );

            try {
                state.db = await withTimeout(
                    openDatabase(),
                    12000,
                    "Ouverture IndexedDB"
                );
            } catch (databaseError) {
                state.db = null;

                console.warn(
                    "[FOBAS] IndexedDB indisponible. " +
                    "Le stockage local sera utilisé.",
                    databaseError
                );
            }

            setLoading(
                22,
                "Chargement du profil et des paramètres..."
            );

            await withTimeout(
                loadAll(),
                12000,
                "Chargement des données"
            );

            setLoading(
                32,
                "Création des équipes..."
            );

            buildTeams();

            setLoading(
                43,
                "Chargement du moteur PlayCanvas..."
            );

            await withTimeout(
                createEngine(),
                90000,
                "Initialisation du moteur 3D"
            );

            setLoading(
                88,
                "Synchronisation de l'interface..."
            );

            renderEquipment();
            renderChampionships();
            renderTournaments();
            renderTeams();

            syncProfileUI();
            syncSettingsUI();
            syncTacticsUI();

            updateScoreboard();

            setLoading(
                100,
                "Prêt à jouer !"
            );

            safeText(
                "engineStatus",
                "MOTEUR 3D PRÊT"
            );

            state.booting = false;

            window.setTimeout(() => {
                hide("loadingScreen");
            }, 450);

            toast(
                APP_NAME + " est prêt.",
                "success"
            );

            if (state.autoSaveTimer) {
                window.clearInterval(state.autoSaveTimer);
            }

            state.autoSaveTimer = window.setInterval(async () => {
                try {
                    await saveAll(false);

                    state.lastAutoSave = Date.now();
                } catch (error) {
                    console.error(
                        "[FOBAS] Erreur de sauvegarde automatique :",
                        error
                    );
                }
            }, AUTOSAVE_INTERVAL);

            console.info(
                "[FOBAS] Démarrage terminé.",
                APP_VERSION
            );
        } catch (error) {
            state.booting = false;

            showLoadingError(error);
        }
    }


    /* ========================================================
       28. RELANCEMENT APRÈS UNE ERREUR
    ======================================================== */

    async function retryBoot() {
        if (state.booting) return;

        state.retryCount += 1;

        hide("retryLoadingBtn");

        if (state.autoSaveTimer) {
            window.clearInterval(state.autoSaveTimer);
            state.autoSaveTimer = null;
        }

        disposeEngineScene();

        state.loadingFailed = false;

        setLoading(
            3,
            "Nouvelle tentative de démarrage..."
        );

        await boot();
    }


    /* ========================================================
       29. ÉVÉNEMENTS ET BOUTONS
    ======================================================== */

    function attachEvents() {
        if (state.listenersAttached) {
            return;
        }

        state.listenersAttached = true;

        /* Navigation principale. */

        $("playMatchBtn")?.addEventListener("click", () => {
            showScreen("matchSetupScreen");
        });

        $("continueCareerBtn")?.addEventListener("click", () => {
            showScreen("championshipScreen");
        });

        $("championshipsBtn")?.addEventListener("click", () => {
            showScreen("championshipScreen");
        });

        $("tournamentsBtn")?.addEventListener("click", () => {
            showScreen("tournamentScreen");
        });

        $("teamsBtn")?.addEventListener("click", () => {
            showScreen("teamsScreen");
        });

        $("equipmentBtn")?.addEventListener("click", () => {
            showScreen("equipmentScreen");
        });

        $("profileBtn")?.addEventListener("click", () => {
            showScreen("profileScreen");
        });

        $("howToPlayBtn")?.addEventListener("click", () => {
            showScreen("howToPlayScreen");
        });

        $("openSettingsBtn")?.addEventListener("click", () => {
            showScreen("settingsScreen");
        });

        /* Boutons de navigation de retour. */

        document.querySelectorAll("[data-back]").forEach(button => {
            button.addEventListener("click", () => {
                const target = button.dataset.back;

                showScreen(
                    SCREEN_IDS.includes(target)
                        ? target
                        : "mainMenu"
                );
            });
        });

        /* Match. */

        $("confirmMatchBtn")?.addEventListener("click", () => {
            prepareMatch();
        });

        $("pauseGameBtn")?.addEventListener("click", pauseMatch);

        $("resumeGameBtn")?.addEventListener("click", resumeMatch);

        $("saveMatchBtn")?.addEventListener(
            "click",
            saveCurrentMatch
        );

        $("savePausedMatchBtn")?.addEventListener(
            "click",
            saveCurrentMatch
        );

        $("exitMatchBtn")?.addEventListener("click", quitMatch);

        $("quitPausedMatchBtn")?.addEventListener(
            "click",
            quitMatch
        );

        $("passBtn")?.addEventListener("click", passBall);
        $("shootBtn")?.addEventListener("click", shootBall);
        $("switchPlayerBtn")?.addEventListener("click", switchPlayer);

        /* Sprint : maintien du bouton. */

        const sprintButton = $("sprintBtn");

        if (sprintButton) {
            sprintButton.addEventListener("pointerdown", event => {
                event.preventDefault();
                toggleSprint(true);
            });

            sprintButton.addEventListener("pointerup", () => {
                toggleSprint(false);
            });

            sprintButton.addEventListener("pointercancel", () => {
                toggleSprint(false);
            });

            sprintButton.addEventListener("lostpointercapture", () => {
                toggleSprint(false);
            });

            sprintButton.addEventListener("pointerleave", event => {
                if (event.buttons === 0) {
                    toggleSprint(false);
                }
            });
        }

        const defendButton = $("defendBtn");

        if (defendButton) {
            defendButton.addEventListener("pointerdown", event => {
                event.preventDefault();
                toggleDefend(true);
            });

            defendButton.addEventListener("pointerup", () => {
                toggleDefend(false);
            });

            defendButton.addEventListener("pointercancel", () => {
                toggleDefend(false);
            });

            defendButton.addEventListener("lostpointercapture", () => {
                toggleDefend(false);
            });
        }

        /* Caméra. */

        $("cameraZoomInBtn")?.addEventListener(
            "click",
            cameraZoomIn
        );

        $("cameraZoomOutBtn")?.addEventListener(
            "click",
            cameraZoomOut
        );

        $("cameraResetBtn")?.addEventListener(
            "click",
            resetCamera
        );

        $("changeCameraBtn")?.addEventListener(
            "click",
            changeCameraMode
        );

        $("showTacticsBtn")?.addEventListener(
            "click",
            openTactics
        );

        $("applyTacticsBtn")?.addEventListener(
            "click",
            applyTactics
        );

        $("closeTacticsBtn")?.addEventListener(
            "click",
            closeTactics
        );

        /* Profil. */

        $("saveProfileBtn")?.addEventListener(
            "click",
            saveProfile
        );

        /* Paramètres. */

        $("saveSettingsBtn")?.addEventListener(
            "click",
            saveSettings
        );

        $("soundToggleBtn")?.addEventListener(
            "click",
            toggleSound
        );

        /* Équipement. */

        document.querySelectorAll("[data-equipment-tab]").forEach(button => {
            button.addEventListener("click", () => {
                state.selectedEquipmentTab =
                    button.dataset.equipmentTab;

                renderEquipment();
            });
        });

        $("applyEquipmentBtn")?.addEventListener(
            "click",
            applyEquipment
        );

        /* Tournois. */

        $("createTournamentBtn")?.addEventListener(
            "click",
            createTournament
        );

        /* Équipes. */

        $("teamSearchInput")?.addEventListener("input", event => {
            state.teamsFilter.query = event.target.value;
            renderTeams();
        });

        $("teamRegionSelect")?.addEventListener("change", event => {
            state.teamsFilter.region = event.target.value;
            renderTeams();
        });

        $("refreshTeamsBtn")?.addEventListener(
            "click",
            refreshTeams
        );

        /* Dialogue générique. */

        $("closeDialogBtn")?.addEventListener(
            "click",
            closeDialog
        );

        $("dialogOverlay")?.addEventListener("click", event => {
            if (event.target === $("dialogOverlay")) {
                closeDialog();
            }
        });

        /* Bouton de nouvelle tentative. */

        $("retryLoadingBtn")?.addEventListener(
            "click",
            retryBoot
        );

        /* Délégation des événements des listes dynamiques. */

        document.addEventListener("click", event => {
            const homeButton = event.target.closest(
                "[data-team-home]"
            );

            if (homeButton) {
                selectTeam(
                    homeButton.dataset.teamHome,
                    "home"
                );

                return;
            }

            const awayButton = event.target.closest(
                "[data-team-away]"
            );

            if (awayButton) {
                selectTeam(
                    awayButton.dataset.teamAway,
                    "away"
                );

                return;
            }

            const competitionButton = event.target.closest(
                "[data-competition]"
            );

            if (competitionButton) {
                selectCompetition(
                    competitionButton.dataset.competition
                );

                return;
            }

            const equipmentButton = event.target.closest(
                "[data-equipment-id]"
            );

            if (equipmentButton) {
                selectEquipment(
                    equipmentButton.dataset.equipmentId
                );

                return;
            }

            const tournamentButton = event.target.closest(
                "[data-tournament-index]"
            );

            if (tournamentButton) {
                const index = Number(
                    tournamentButton.dataset.tournamentIndex
                );

                const tournament = state.tournaments[index];

                if (tournament) {
                    state.activeTournament = tournament;

                    toast(
                        "Tournoi sélectionné : " +
                        tournament.name,
                        "success"
                    );

                    saveAll(false);
                }

                return;
            }

            const actionButton = event.target.closest(
                "[data-action]"
            );

            if (actionButton) {
                const action = actionButton.dataset.action;

                switch (action) {
                    case "pass":
                        passBall();
                        break;

                    case "shoot":
                        shootBall();
                        break;

                    case "sprint":
                        toggleSprint(!state.sprinting);
                        break;

                    case "defend":
                        toggleDefend(!state.defending);
                        break;

                    case "switch-player":
                        switchPlayer();
                        break;

                    case "play-match":
                        showScreen("matchSetupScreen");
                        break;

                    case "continue-career":
                        showScreen("championshipScreen");
                        break;

                    case "championships":
                        showScreen("championshipScreen");
                        break;

                    case "tournaments":
                        showScreen("tournamentScreen");
                        break;

                    case "teams":
                        showScreen("teamsScreen");
                        break;

                    case "equipment":
                        showScreen("equipmentScreen");
                        break;

                    case "profile":
                        showScreen("profileScreen");
                        break;

                    case "how-to-play":
                        showScreen("howToPlayScreen");
                        break;
                }
            }
        });

        /* Redimensionnement. */

        state.resizeHandler = () => {
            resizeCanvas();
        };

        window.addEventListener(
            "resize",
            state.resizeHandler,
            { passive: true }
        );

        window.addEventListener(
            "orientationchange",
            state.resizeHandler,
            { passive: true }
        );

        /* Sauvegarde avant fermeture de page. */

        window.addEventListener("pagehide", () => {
            try {
                const data = getPersistentState();

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(data)
                );
            } catch (error) {
                console.warn(
                    "[FOBAS] Sauvegarde de fermeture impossible :",
                    error
                );
            }
        });

        setupJoystick();
        setupPinchZoom();
    }


    /* ========================================================
       30. GESTION DES ERREURS GLOBALES
    ======================================================== */

    window.addEventListener("error", event => {
        console.error(
            "[FOBAS] Erreur JavaScript :",
            event.message,
            event.filename,
            event.lineno
        );
    });

    window.addEventListener("unhandledrejection", event => {
        console.error(
            "[FOBAS] Promesse rejetée sans gestion :",
            event.reason
        );
    });


    /* ========================================================
       31. INITIALISATION
    ======================================================== */

    function startApplication() {
        if (state.booting || state.engineReady) {
            return;
        }

        console.info(
            "[FOBAS FOOTBALL] JavaScript chargé.",
            APP_VERSION
        );

        boot().catch(error => {
            state.booting = false;
            showLoadingError(error);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            startApplication,
            { once: true }
        );
    } else {
        startApplication();
    }

})();
