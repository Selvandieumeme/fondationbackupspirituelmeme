/* ============================================================
   FOBAS FOOTBALL ULTIMATE 3D
   JavaScript principal — Version 1.0.0
   Moteur : PlayCanvas 2.23.2
   Architecture : HTML / CSS / JavaScript
   Stockage : IndexedDB + localStorage de secours
   Android First — Sans backend
============================================================ */

(() => {
    "use strict";

    /* ========================================================
       1. INITIALISATION ET CONFIGURATION
    ======================================================== */

    if (window.__FOBAS_FOOTBALL_INITIALIZED__) {
        console.warn("[FOBAS FOOTBALL] Le jeu est déjà initialisé.");
        return;
    }

    window.__FOBAS_FOOTBALL_INITIALIZED__ = true;

    console.info("[FOBAS FOOTBALL] appfootballfobas.js chargé.");

    const CONFIG = window.FOBAS_FOOTBALL_CONFIG || {};

    const DB_NAME =
        CONFIG.databaseName || "FOBAS_FOOTBALL_ULTIMATE_DB";

    const DB_VERSION =
        Number(CONFIG.databaseVersion) || 1;

    const $ = id => document.getElementById(id);

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const random = (min, max) =>
        min + Math.random() * (max - min);

    const choose = array =>
        array[Math.floor(Math.random() * array.length)];

    const slugify = text =>
        String(text)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    const safeText = value =>
        String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);

    const $all = selector =>
        Array.from(document.querySelectorAll(selector));

    const CONFIG_REGIONS = Array.isArray(CONFIG.localRegions)
        ? CONFIG.localRegions
        : ["Mare-Rouge", "Môle-Saint-Nicolas", "Jean-Rabel"];

    const CONFIG_NAMES = Array.isArray(CONFIG.playerNames)
        ? CONFIG.playerNames
        : ["Junior", "Ranise", "Kerlande", "Selvandieu"];

    const COMPETITIONS = Array.isArray(CONFIG.competitionLevels)
        ? CONFIG.competitionLevels
        : [
            { id: "local", name: "Matchs locaux" },
            { id: "communal", name: "Championnats communaux" },
            { id: "northwest", name: "Championnat du Nord-Ouest" },
            { id: "haiti-national", name: "Championnat national" },
            { id: "caribbean", name: "Tournoi des Caraïbes" },
            { id: "international", name: "Championnats internationaux" },
            { id: "champions", name: "Tournoi des champions" }
        ];

    const FIELD = {
        width: 34,
        length: 52,
        halfWidth: 17,
        halfLength: 26,
        goalHalfWidth: 3.7
    };

    const COLORS = {
        grass: [0.09, 0.39, 0.19],
        grassLight: [0.12, 0.46, 0.23],
        line: [0.92, 0.96, 0.91],
        ball: [0.98, 0.98, 0.95],
        home: [0.06, 0.31, 0.98],
        away: [0.94, 0.08, 0.12],
        skin: [0.72, 0.49, 0.32],
        shorts: [0.08, 0.10, 0.14],
        goalkeeper: [0.98, 0.72, 0.06]
    };

    const CAMERA = {
        defaultHeight: 48,
        minHeight: 36,
        maxHeight: 68,
        angle: 0
    };

    const DIFFICULTY = {
        easy: 0.78,
        normal: 1,
        hard: 1.18,
        expert: 1.35
    };

    /* ========================================================
       2. ÉTAT GLOBAL
    ======================================================== */

    const state = {
        pc: null,
        app: null,
        db: null,

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
        goalPause: 0,

        ballVelocity: { x: 0, y: 0, z: 0 },
        ballOwner: null,
        lastBallOwner: null,
        lastGoalTeam: null,

        joystick: { x: 0, y: 0, active: false },
        sprinting: false,
        defending: false,

        cameraHeight: CAMERA.defaultHeight,
        cameraMode: 0,

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

        tournaments: [],
        activeTournament: null,

        selectedCompetition: "local",
        selectedChampionship: "local",

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

        toastTimer: null,
        announcementTimer: null,
        currentMatchId: null,
        matchRecorded: false,
        saveInProgress: false
    };

    /* ========================================================
       3. OUTILS DOM
    ======================================================== */

    function setLoading(percent, message) {
        const value = clamp(Number(percent) || 0, 0, 100);

        const bar = $("loadingProgressBar");
        const label = $("loadingPercent");
        const messageElement = $("loadingMessage");
        const track = $("loadingProgressTrack");

        if (bar) bar.style.width = `${value}%`;
        if (label) label.textContent = `${Math.round(value)} %`;

        if (messageElement) {
            messageElement.textContent = message || "";
        }

        if (track) {
            track.setAttribute("aria-valuenow", String(Math.round(value)));
        }
    }

    function showLoadingError(message) {
        state.loadingFailed = true;

        setLoading(100, message || "Erreur de chargement.");

        const retry = $("retryLoadingBtn");
        if (retry) retry.classList.remove("hidden");

        const status = $("engineStatus");
        if (status) {
            status.textContent = message || "Erreur du moteur 3D.";
        }

        console.error("[FOBAS FOOTBALL]", message);
    }

    function showToast(message, duration = 2800) {
        const container = $("toastContainer");
        if (!container) {
            console.info("[FOBAS]", message);
            return;
        }

        const toast = document.createElement("div");
        toast.className = "toast-message";
        toast.textContent = String(message);
        toast.setAttribute("role", "status");

        container.appendChild(toast);

        window.setTimeout(() => {
            toast.remove();
        }, duration);
    }

    function showAnnouncement(title, message, duration = 2600) {
        const panel = $("matchAnnouncement");
        const titleElement = $("announcementTitle");
        const messageElement = $("announcementMessage");

        if (!panel) return;

        if (titleElement) titleElement.textContent = title || "";
        if (messageElement) messageElement.textContent = message || "";

        panel.classList.remove("hidden");

        if (state.announcementTimer) {
            clearTimeout(state.announcementTimer);
        }

        state.announcementTimer = setTimeout(() => {
            panel.classList.add("hidden");
        }, duration);
    }

    function showDialog(title, html, actions = []) {
        const overlay = $("dialogOverlay");
        const titleElement = $("dialogTitle");
        const content = $("dialogContent");
        const actionsElement = $("dialogActions");

        if (!overlay || !content || !actionsElement) return;

        if (titleElement) titleElement.textContent = title || "FOBAS FOOTBALL";

        content.innerHTML = html || "";
        actionsElement.replaceChildren();

        actions.forEach(action => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = action.className || "ui-button button-primary";
            button.textContent = action.label || "OK";

            button.addEventListener("click", () => {
                if (typeof action.onClick === "function") {
                    action.onClick();
                }
            });

            actionsElement.appendChild(button);
        });

        overlay.classList.remove("hidden");
    }

    function closeDialog() {
        $("dialogOverlay")?.classList.add("hidden");
    }

    function showScreen(screenId) {
        const ids = [
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

        if (!$(screenId)) {
            console.warn("[FOBAS] Écran introuvable :", screenId);
            return;
        }

        ids.forEach(id => {
            const screen = $(id);
            if (!screen) return;

            screen.classList.toggle("hidden", id !== screenId);
        });

        state.currentScreen = screenId;

        const header = $("topHeader");
        if (header) {
            header.classList.toggle("hidden", screenId === "loadingScreen");
        }

        if (screenId === "matchScreen") {
            resizeCanvas();
        }

        if (screenId === "mainMenu") {
            $("pauseOverlay")?.classList.add("hidden");
            $("tacticsOverlay")?.classList.add("hidden");
        }
    }

    function setEngineStatus(message) {
        const element = $("engineStatus");
        if (element) element.textContent = message || "";
    }

    function setSaveStatus(message) {
        const element = $("saveStatusLabel");
        if (element) element.textContent = message || "";
    }

    function vibrate(pattern = 35) {
        if (!state.settings.vibration) return;

        try {
            if (navigator.vibrate) navigator.vibrate(pattern);
        } catch (_) {
            // Fonction optionnelle.
        }
    }

    /* ========================================================
       4. SON
    ======================================================== */

    function playSound(frequency = 500, duration = 0.09, type = "sine") {
        if (!state.soundEnabled || Number(state.settings.volume) <= 0) {
            return;
        }

        try {
            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;

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

            oscillator.type = type;
            oscillator.frequency.value = frequency;

            gain.gain.value = clamp(
                Number(state.settings.volume) / 100 * 0.07,
                0,
                0.07
            );

            oscillator.connect(gain);
            gain.connect(context.destination);

            oscillator.start();

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                context.currentTime + duration
            );

            oscillator.stop(context.currentTime + duration);
        } catch (error) {
            console.debug("[FOBAS] Son indisponible :", error);
        }
    }

    /* ========================================================
       5. BASE DE DONNÉES
    ======================================================== */

    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!("indexedDB" in window)) {
                reject(new Error("IndexedDB non disponible"));
                return;
            }

            let settled = false;

            const timeout = setTimeout(() => {
                if (settled) return;
                settled = true;
                reject(new Error("Délai IndexedDB dépassé"));
            }, 8000);

            let request;

            try {
                request = indexedDB.open(DB_NAME, DB_VERSION);
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
                return;
            }

            request.onupgradeneeded = event => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains("gameState")) {
                    db.createObjectStore("gameState", { keyPath: "id" });
                }

                if (!db.objectStoreNames.contains("matchHistory")) {
                    const store = db.createObjectStore(
                        "matchHistory",
                        { keyPath: "id", autoIncrement: true }
                    );

                    store.createIndex("date", "date", { unique: false });
                }

                if (!db.objectStoreNames.contains("tournaments")) {
                    db.createObjectStore("tournaments", { keyPath: "id" });
                }
            };

            request.onsuccess = () => {
                clearTimeout(timeout);

                if (settled) {
                    request.result.close();
                    return;
                }

                settled = true;
                resolve(request.result);
            };

            request.onerror = () => {
                clearTimeout(timeout);

                if (settled) return;
                settled = true;

                reject(request.error || new Error("Erreur IndexedDB"));
            };

            request.onblocked = () => {
                console.warn("[FOBAS] Ouverture IndexedDB bloquée.");
            };
        });
    }

    function dbRead(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                reject(new Error("Base de données indisponible"));
                return;
            }

            try {
                const transaction = state.db.transaction(storeName, "readonly");
                const request = transaction.objectStore(storeName).get(key);

                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => reject(request.error);
            } catch (error) {
                reject(error);
            }
        });
    }

    function dbWrite(storeName, value) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                reject(new Error("Base de données indisponible"));
                return;
            }

            try {
                const transaction = state.db.transaction(storeName, "readwrite");

                transaction.objectStore(storeName).put(value);

                transaction.oncomplete = () => resolve(true);
                transaction.onerror = () => reject(transaction.error);
                transaction.onabort = () => reject(transaction.error);
            } catch (error) {
                reject(error);
            }
        });
    }

    function dbAdd(storeName, value) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                reject(new Error("Base de données indisponible"));
                return;
            }

            try {
                const transaction = state.db.transaction(storeName, "readwrite");
                const request = transaction.objectStore(storeName).add(value);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            } catch (error) {
                reject(error);
            }
        });
    }

    function getPersistableState() {
        return {
            id: "main",
            version: CONFIG.version || "1.0.0",
            updatedAt: Date.now(),

            selectedHome: state.selectedHome,
            selectedAway: state.selectedAway,

            profile: state.profile,
            settings: state.settings,
            tactics: state.tactics,
            career: state.career,

            selectedCompetition: state.selectedCompetition,
            selectedChampionship: state.selectedChampionship,

            selectedEquipment: state.selectedEquipment,
            tournaments: state.tournaments,

            scoreHome: state.scoreHome,
            scoreAway: state.scoreAway,
            elapsed: state.elapsed,
            matchLength: state.matchLength,

            matchStarted: state.matchStarted,
            matchFinished: state.matchFinished
        };
    }

    async function saveAll(silent = false) {
        if (state.saveInProgress) return false;

        state.saveInProgress = true;

        const payload = getPersistableState();

        try {
            if (state.db) {
                await dbWrite("gameState", payload);
            }

            try {
                localStorage.setItem(
                    "FOBAS_FOOTBALL_BACKUP",
                    JSON.stringify(payload)
                );
            } catch (storageError) {
                console.warn("[FOBAS] Sauvegarde secondaire indisponible.");
            }

            state.lastSave = Date.now();
            state.lastAutoSave = state.lastSave;

            setSaveStatus(
                "Sauvegardé à " +
                new Date(state.lastSave).toLocaleTimeString()
            );

            if (!silent) {
                showToast("Progression sauvegardée.");
                playSound(620, 0.08);
            }

            return true;
        } catch (error) {
            console.error("[FOBAS] Erreur sauvegarde :", error);

            try {
                localStorage.setItem(
                    "FOBAS_FOOTBALL_BACKUP",
                    JSON.stringify(payload)
                );

                setSaveStatus("Sauvegarde locale secondaire effectuée.");

                if (!silent) {
                    showToast("Sauvegarde locale effectuée.");
                }

                return true;
            } catch (_) {
                setSaveStatus("Impossible de sauvegarder.");

                if (!silent) {
                    showToast("Échec de la sauvegarde.");
                }

                return false;
            }
        } finally {
            state.saveInProgress = false;
        }
    }

    async function loadAll() {
        let saved = null;

        try {
            if (state.db) {
                saved = await dbRead("gameState", "main");
            }
        } catch (error) {
            console.warn("[FOBAS] Lecture IndexedDB impossible :", error);
        }

        if (!saved) {
            try {
                const raw = localStorage.getItem("FOBAS_FOOTBALL_BACKUP");
                if (raw) saved = JSON.parse(raw);
            } catch (error) {
                console.warn("[FOBAS] Sauvegarde secondaire illisible.");
            }
        }

        if (!saved || typeof saved !== "object") return false;

        if (saved.profile && typeof saved.profile === "object") {
            state.profile = {
                ...state.profile,
                ...saved.profile
            };
        }

        if (saved.settings && typeof saved.settings === "object") {
            state.settings = {
                ...state.settings,
                ...saved.settings
            };
        }

        if (saved.tactics && typeof saved.tactics === "object") {
            state.tactics = {
                ...state.tactics,
                ...saved.tactics
            };
        }

        if (saved.career && typeof saved.career === "object") {
            state.career = {
                ...state.career,
                ...saved.career
            };
        }

        if (saved.selectedEquipment && typeof saved.selectedEquipment === "object") {
            state.selectedEquipment = {
                ...state.selectedEquipment,
                ...saved.selectedEquipment
            };
        }

        if (Array.isArray(saved.tournaments)) {
            state.tournaments = saved.tournaments;
        }

        state.selectedHome = saved.selectedHome || state.selectedHome;
        state.selectedAway = saved.selectedAway || state.selectedAway;

        state.selectedCompetition =
            saved.selectedCompetition || state.selectedCompetition;

        state.selectedChampionship =
            saved.selectedChampionship || state.selectedChampionship;

        updateProfileUI();
        updateSettingsUI();
        updateTacticsUI();

        return true;
    }

    /* ========================================================
       6. CRÉATION DES ÉQUIPES
    ======================================================== */

    const WORLD_TEAMS = [
        ["Real Madrid", "europe"],
        ["FC Barcelona", "europe"],
        ["Manchester City", "europe"],
        ["Liverpool FC", "europe"],
        ["Arsenal FC", "europe"],
        ["Manchester United", "europe"],
        ["Chelsea FC", "europe"],
        ["Bayern Munich", "europe"],
        ["Borussia Dortmund", "europe"],
        ["Paris Saint-Germain", "europe"],
        ["Olympique de Marseille", "europe"],
        ["Juventus", "europe"],
        ["AC Milan", "europe"],
        ["Inter Milan", "europe"],
        ["Atletico Madrid", "europe"],
        ["Ajax Amsterdam", "europe"],
        ["Benfica", "europe"],
        ["Porto", "europe"],
        ["Napoli", "europe"],
        ["Tottenham Hotspur", "europe"],

        ["Boca Juniors", "americas"],
        ["River Plate", "americas"],
        ["Flamengo", "americas"],
        ["Palmeiras", "americas"],
        ["Santos FC", "americas"],
        ["Sao Paulo FC", "americas"],
        ["Corinthians", "americas"],
        ["Inter Miami", "americas"],
        ["LA Galaxy", "americas"],
        ["New York City FC", "americas"],
        ["Club America", "americas"],
        ["Tigres UANL", "americas"],
        ["Monterrey", "americas"],
        ["Chivas Guadalajara", "americas"],
        ["Alianza Lima", "americas"],
        ["Atletico Nacional", "americas"],
        ["Colo-Colo", "americas"],
        ["Peñarol", "americas"],
        ["Nacional Montevideo", "americas"],

        ["Al Ahly", "africa"],
        ["Wydad Casablanca", "africa"],
        ["Raja Casablanca", "africa"],
        ["Esperance Tunis", "africa"],
        ["Mamelodi Sundowns", "africa"],
        ["TP Mazembe", "africa"],
        ["Zamalek", "africa"],
        ["ASEC Mimosas", "africa"],
        ["Orlando Pirates", "africa"],
        ["Enyimba", "africa"],

        ["Al Hilal", "international"],
        ["Al Nassr", "international"],
        ["Urawa Red Diamonds", "international"],
        ["Kashima Antlers", "international"],
        ["Jeonbuk Hyundai Motors", "international"],
        ["Al Sadd", "international"],
        ["Persepolis", "international"],
        ["Sydney FC", "international"],

        ["W Connection", "caribbean"],
        ["Defence Force", "caribbean"],
        ["Cavalier FC", "caribbean"],
        ["Mount Pleasant", "caribbean"],
        ["Harbour View", "caribbean"],
        ["Santo Domingo FC", "caribbean"],
        ["Puerto Rico United", "caribbean"],
        ["Trinidad United", "caribbean"]
    ];

    function addTeam(name, region, regionKey, index = 0) {
        const id = slugify(name);

        if (state.teams.some(team => team.id === id)) return;

        const palette = [
            [0.08, 0.32, 0.92],
            [0.88, 0.08, 0.13],
            [0.05, 0.56, 0.29],
            [0.95, 0.67, 0.04],
            [0.43, 0.12, 0.76],
            [0.04, 0.67, 0.76],
            [0.96, 0.33, 0.08],
            [0.86, 0.20, 0.54]
        ];

        state.teams.push({
            id,
            name,
            region,
            regionKey,
            color: palette[index % palette.length],
            rating: 94 + Math.floor(Math.random() * 7),
            attack: 94 + Math.floor(Math.random() * 7),
            defense: 94 + Math.floor(Math.random() * 7),
            speed: 94 + Math.floor(Math.random() * 7)
        });
    }

    function generateTeams() {
        state.teams = [];

        CONFIG_REGIONS.forEach((region, index) => {
            addTeam(region, "Nord-Ouest d'Haïti", "northwest", index);
            addTeam(`${region} FC`, "Nord-Ouest d'Haïti", "northwest", index + 1);
            addTeam(`${region} United`, "Nord-Ouest d'Haïti", "northwest", index + 2);
        });

        [
            "Port-au-Prince",
            "Cap-Haïtien",
            "Gonaïves",
            "Les Cayes",
            "Jacmel",
            "Jérémie",
            "Hinche",
            "Fort-Liberté",
            "Saint-Marc",
            "Petit-Goâve",
            "Miragoâne",
            "Ouanaminthe",
            "Carrefour",
            "Delmas",
            "Cité Soleil",
            "Léogâne",
            "Verrettes",
            "Dessalines",
            "Anse-à-Veau"
        ].forEach((name, index) => {
            addTeam(`${name} FC`, "Autres départements d'Haïti", "haiti", index);
        });

        WORLD_TEAMS.forEach((entry, index) => {
            const [name, region] = entry;

            const label = region === "europe"
                ? "Europe"
                : region === "americas"
                    ? "Amériques"
                    : region === "africa"
                        ? "Afrique"
                        : region === "caribbean"
                            ? "Caraïbes"
                            : "International";

            addTeam(name, label, region, index);
        });

        while (state.teams.length < 100) {
            const number = state.teams.length + 1;
            const region = choose(CONFIG_REGIONS);

            addTeam(
                `${region} Champions ${number}`,
                "Nord-Ouest d'Haïti",
                "northwest",
                number
            );
        }

        if (!state.teams.some(team => team.id === "mare-rouge")) {
            addTeam("Mare-Rouge", "Nord-Ouest d'Haïti", "northwest");
        }

        if (!state.teams.some(team => team.id === "mole-saint-nicolas")) {
            addTeam("Môle-Saint-Nicolas", "Nord-Ouest d'Haïti", "northwest");
        }

        state.teams.sort((a, b) => {
            const priority = team =>
                team.id === "mare-rouge" ? 0 :
                team.id === "mole-saint-nicolas" ? 1 : 2;

            return priority(a) - priority(b) ||
                a.name.localeCompare(b.name);
        });

        console.info(
            `[FOBAS FOOTBALL] ${state.teams.length} équipes générées.`
        );
    }

    function getTeam(id) {
        return state.teams.find(team => team.id === id) ||
            state.teams[0] || {
                id: "unknown",
                name: "Équipe",
                color: COLORS.home,
                rating: 100
            };
    }

    function selectAutomaticOpponent(homeId) {
        const candidates = state.teams.filter(team => team.id !== homeId);

        if (!candidates.length) return null;

        const favorite = candidates.find(team =>
            team.id === "mole-saint-nicolas" && homeId !== team.id
        );

        if (homeId === "mare-rouge" && favorite) {
            return favorite;
        }

        return choose(candidates);
    }

    function populateSelect(selectId, selectedId) {
        const select = $(selectId);
        if (!select) return;

        const previous = selectedId || select.value;

        select.replaceChildren();

        state.teams.forEach(team => {
            const option = document.createElement("option");
            option.value = team.id;
            option.textContent = team.name;

            select.appendChild(option);
        });

        if (state.teams.some(team => team.id === previous)) {
            select.value = previous;
        }
    }

    function refreshTeamSelectors() {
        populateSelect("homeTeamSelect", state.selectedHome);
        populateSelect("awayTeamSelect", state.selectedAway);

        populateSelect("profileFavoriteTeam", state.profile.favoriteTeam);

        if (
            $("awayTeamSelect") &&
            $("homeTeamSelect") &&
            $("awayTeamSelect").value === $("homeTeamSelect").value
        ) {
            const opponent = selectAutomaticOpponent($("homeTeamSelect").value);

            if (opponent) {
                $("awayTeamSelect").value = opponent.id;
            }
        }
    }

    /* ========================================================
       7. CONSTRUCTION DU MONDE PLAYCANVAS
    ======================================================== */

    function makeMaterial(color, emissive = null) {
        const pc = state.pc;
        const material = new pc.StandardMaterial();

        material.diffuse = new pc.Color(color[0], color[1], color[2]);

        if (emissive) {
            material.emissive = new pc.Color(
                emissive[0],
                emissive[1],
                emissive[2]
            );
        }

        material.metalness = 0.03;
        material.gloss = 0.22;
        material.update();

        return material;
    }

    function createEntity(name, type, position, scale, material, parent) {
        const pc = state.pc;
        const entity = new pc.Entity(name);

        entity.addComponent("render", {
            type: type || "box",
            material: material || makeMaterial([0.7, 0.7, 0.7])
        });

        entity.setPosition(position[0], position[1], position[2]);
        entity.setLocalScale(scale[0], scale[1], scale[2]);

        (parent || state.sceneRoot).addChild(entity);

        return entity;
    }

    function createLight(name, type, position, color, intensity) {
        const pc = state.pc;
        const light = new pc.Entity(name);

        light.addComponent("light", {
            type,
            color: new pc.Color(color[0], color[1], color[2]),
            intensity
        });

        light.setPosition(position[0], position[1], position[2]);

        if (type === "directional") {
            light.setEulerAngles(48, 28, 0);
        }

        state.sceneRoot.addChild(light);
        return light;
    }

    function createField() {
        const root = new state.pc.Entity("Football Field");
        state.sceneRoot.addChild(root);
        state.fieldRoot = root;

        const grass = makeMaterial(COLORS.grass);
        const stripe = makeMaterial(COLORS.grassLight);
        const white = makeMaterial(COLORS.line);
        const dark = makeMaterial([0.08, 0.13, 0.17]);
        const goalMaterial = makeMaterial([0.88, 0.92, 0.94]);

        createEntity(
            "Pitch Base",
            "box",
            [0, -0.35, 0],
            [FIELD.width + 4, 0.5, FIELD.length + 4],
            dark,
            root
        );

        createEntity(
            "Grass",
            "box",
            [0, -0.08, 0],
            [FIELD.width, 0.15, FIELD.length],
            grass,
            root
        );

        for (let i = 0; i < 8; i++) {
            const z = -FIELD.halfLength + (i + 0.5) * FIELD.length / 8;

            createEntity(
                `Grass Stripe ${i + 1}`,
                "box",
                [0, 0.002, z],
                [FIELD.width - 0.1, 0.015, FIELD.length / 8],
                i % 2 === 0 ? stripe : grass,
                root
            );
        }

        function line(name, x, z, width, depth) {
            return createEntity(
                name,
                "box",
                [x, 0.025, z],
                [width, 0.025, depth],
                white,
                root
            );
        }

        line("Touchline Left", -FIELD.halfWidth, 0, 0.13, FIELD.length);
        line("Touchline Right", FIELD.halfWidth, 0, 0.13, FIELD.length);
        line("Goal Line Home", 0, -FIELD.halfLength, FIELD.width, 0.13);
        line("Goal Line Away", 0, FIELD.halfLength, FIELD.width, 0.13);
        line("Halfway Line", 0, 0, FIELD.width, 0.12);

        line("Home Penalty Front", 0, -19.5, 20, 0.10);
        line("Home Penalty Left", -10, -22.5, 0.10, 7);
        line("Home Penalty Right", 10, -22.5, 0.10, 7);

        line("Away Penalty Front", 0, 19.5, 20, 0.10);
        line("Away Penalty Left", -10, 22.5, 0.10, 7);
        line("Away Penalty Right", 10, 22.5, 0.10, 7);

        line("Home Goal Area Front", 0, -23, 9, 0.10);
        line("Away Goal Area Front", 0, 23, 9, 0.10);

        const circleSegments = 40;
        const circleRadius = 5.1;

        for (let i = 0; i < circleSegments; i++) {
            const angle1 = i / circleSegments * Math.PI * 2;
            const angle2 = (i + 1) / circleSegments * Math.PI * 2;

            const x1 = Math.cos(angle1) * circleRadius;
            const z1 = Math.sin(angle1) * circleRadius;

            const x2 = Math.cos(angle2) * circleRadius;
            const z2 = Math.sin(angle2) * circleRadius;

            const midX = (x1 + x2) / 2;
            const midZ = (z1 + z2) / 2;

            const length = Math.hypot(x2 - x1, z2 - z1);
            const angle = Math.atan2(x2 - x1, z2 - z1);

            const segment = createEntity(
                `Center Circle ${i}`,
                "box",
                [midX, 0.035, midZ],
                [0.09, 0.025, length],
                white,
                root
            );

            segment.setEulerAngles(0, angle * 180 / Math.PI, 0);
        }

        createEntity(
            "Center Spot",
            "sphere",
            [0, 0.06, 0],
            [0.18, 0.04, 0.18],
            white,
            root
        );

        [-1, 1].forEach(sign => {
            const z = sign * (FIELD.halfLength + 0.4);

            createEntity(
                `Goal Crossbar ${sign}`,
                "box",
                [0, 1.65, z],
                [7.5, 0.16, 0.16],
                goalMaterial,
                root
            );

            [-1, 1].forEach(side => {
                createEntity(
                    `Goal Post ${sign} ${side}`,
                    "box",
                    [side * FIELD.goalHalfWidth, 0.85, z],
                    [0.16, 1.7, 0.16],
                    goalMaterial,
                    root
                );
            });

            for (let j = 0; j < 8; j++) {
                createEntity(
                    `Goal Net ${sign} ${j}`,
                    "box",
                    [-3.5 + j, 0.82, z + sign * 0.75],
                    [0.025, 1.55, 0.025],
                    white,
                    root
                );
            }
        });

        createEntity(
            "Stadium Ground",
            "box",
            [0, -0.75, 0],
            [FIELD.width + 12, 0.3, FIELD.length + 12],
            dark,
            root
        );
    }

    /* ========================================================
       8. JOUEURS 3D
    ======================================================== */

    function createPlayerModel(player, parent) {
        const pc = state.pc;

        const teamColor = player.isGoalkeeper
            ? COLORS.goalkeeper
            : player.teamColor;

        const shirtMaterial = makeMaterial(teamColor);
        const shortsMaterial = makeMaterial(COLORS.shorts);
        const skinMaterial = makeMaterial(COLORS.skin);
        const shoeMaterial = makeMaterial([0.08, 0.08, 0.08]);

        const entity = new pc.Entity(
            `Player ${player.name} ${player.number}`
        );

        parent.addChild(entity);

        const torso = new pc.Entity("Torso");
        torso.addComponent("render", {
            type: "capsule",
            material: shirtMaterial
        });
        torso.setLocalScale(0.48, 0.62, 0.32);
        torso.setPosition(0, 1.1, 0);
        entity.addChild(torso);

        const head = new pc.Entity("Head");
        head.addComponent("render", {
            type: "sphere",
            material: skinMaterial
        });
        head.setLocalScale(0.25, 0.25, 0.25);
        head.setPosition(0, 1.57, 0);
        entity.addChild(head);

        const shorts = new pc.Entity("Shorts");
        shorts.addComponent("render", {
            type: "box",
            material: shortsMaterial
        });
        shorts.setLocalScale(0.4, 0.22, 0.29);
        shorts.setPosition(0, 0.77, 0);
        entity.addChild(shorts);

        const legs = [];

        [-1, 1].forEach(side => {
            const leg = new pc.Entity("Leg");
            leg.addComponent("render", {
                type: "box",
                material: shortsMaterial
            });

            leg.setLocalScale(0.14, 0.48, 0.15);
            leg.setPosition(side * 0.12, 0.42, 0);

            entity.addChild(leg);
            legs.push(leg);

            const shoe = new pc.Entity("Boot");
            shoe.addComponent("render", {
                type: "box",
                material: shoeMaterial
            });
            shoe.setLocalScale(0.17, 0.10, 0.24);
            shoe.setPosition(side * 0.12, 0.17, -0.045);
            entity.addChild(shoe);
        });

        player.entity = entity;
        player.legs = legs;
        player.torso = torso;
        player.head = head;

        entity.setPosition(player.x, 0, player.z);

        if (player.teamSide === "home") {
            entity.setEulerAngles(0, 180, 0);
        } else {
            entity.setEulerAngles(0, 0, 0);
        }
    }

    function formationPositions(side, formation = "433") {
        const attackSign = side === "home" ? -1 : 1;

        const configurations = {
            "442": [
                [0, 22],
                [-12, 14], [-4, 14], [4, 14], [12, 14],
                [-12, 5], [-4, 5], [4, 5], [12, 5],
                [-5, -7], [5, -7]
            ],
            "433": [
                [0, 22],
                [-12, 14], [-4, 14], [4, 14], [12, 14],
                [-8, 4], [0, 3], [8, 4],
                [-10, -8], [0, -12], [10, -8]
            ],
            "352": [
                [0, 22],
                [-9, 14], [0, 14], [9, 14],
                [-13, 5], [-6, 5], [0, 2], [6, 5], [13, 5],
                [-5, -8], [5, -8]
            ],
            "4231": [
                [0, 22],
                [-12, 14], [-4, 14], [4, 14], [12, 14],
                [-7, 5], [7, 5],
                [-10, -3], [0, -5], [10, -3],
                [0, -12]
            ],
            "541": [
                [0, 22],
                [-12, 14], [-6, 15], [0, 15], [6, 15], [12, 14],
                [-8, 5], [-3, 4], [3, 4], [8, 5],
                [0, -10]
            ]
        };

        const positions = configurations[formation] || configurations["433"];

        return positions.map(([x, z]) => ({
            x: clamp(x, -14, 14),
            z: clamp(z * attackSign, -23, 23)
        }));
    }

    function createTeamPlayers(team, side) {
        const parent = new state.pc.Entity(`${team.name} Players`);
        state.playerRoot.addChild(parent);

        const formation = side === "home"
            ? state.tactics.formation
            : "433";

        const positions = formationPositions(side, formation);

        const players = [];

        for (let i = 0; i < 11; i++) {
            const position = positions[i];

            const player = {
                id: `${team.id}-${side}-${i + 1}`,
                number: i + 1,
                name: CONFIG_NAMES[
                    (i + (side === "away" ? 11 : 0)) % CONFIG_NAMES.length
                ],

                teamId: team.id,
                teamName: team.name,
                teamSide: side,
                teamColor: team.color,

                x: position.x,
                z: position.z,
                y: 0,

                vx: 0,
                vz: 0,

                homeX: position.x,
                homeZ: position.z,

                speed: random(7.5, 9.0),
                skill: random(0.94, 1.06),
                strength: random(0.94, 1.06),

                isGoalkeeper: i === 0,
                isControlled: false,

                entity: null,
                legs: [],
                cooldown: random(0, 1.5),
                aiTimer: random(0, 0.5),
                animationTime: random(0, 5)
            };

            createPlayerModel(player, parent);
            players.push(player);
        }

        return players;
    }

    function createPlayers() {
        if (state.playerRoot) {
            state.playerRoot.destroy();
        }

        state.playerRoot = new state.pc.Entity("All Football Players");
        state.sceneRoot.addChild(state.playerRoot);

        const homeTeam = getTeam(state.selectedHome);
        const awayTeam = getTeam(state.selectedAway);

        state.homePlayers = createTeamPlayers(homeTeam, "home");
        state.awayPlayers = createTeamPlayers(awayTeam, "away");

        state.allPlayers = [
            ...state.homePlayers,
            ...state.awayPlayers
        ];

        state.controlledPlayer =
            state.homePlayers.find(player => !player.isGoalkeeper) ||
            state.homePlayers[0];

        setControlledPlayer(state.controlledPlayer);

        console.info(
            "[FOBAS] Joueurs créés :",
            state.homePlayers.length,
            "+",
            state.awayPlayers.length
        );
    }

    function setControlledPlayer(player) {
        if (!player || player.teamSide !== "home") return;

        state.homePlayers.forEach(item => {
            item.isControlled = item === player;
        });

        state.controlledPlayer = player;

        const label = player.name || `Joueur ${player.number}`;

        setEngineStatus(`Vous contrôlez : ${label}`);

        if (state.cameraMode === 1) {
            updateCameraTarget();
        }
    }

    /* ========================================================
       9. BALLON
    ======================================================== */

    function createBall() {
        if (state.ballEntity) {
            state.ballEntity.destroy();
        }

        if (state.ballShadow) {
            state.ballShadow.destroy();
        }

        const pc = state.pc;

        const ballMaterial = makeMaterial(
            state.selectedEquipment.balls === "gold"
                ? [0.95, 0.64, 0.08]
                : state.selectedEquipment.balls === "ocean"
                    ? [0.08, 0.62, 0.88]
                    : state.selectedEquipment.balls === "fire"
                        ? [0.95, 0.20, 0.07]
                        : COLORS.ball
        );

        state.ballEntity = new pc.Entity("Football");

        state.ballEntity.addComponent("render", {
            type: "sphere",
            material: ballMaterial
        });

        state.ballEntity.setLocalScale(0.38, 0.38, 0.38);
        state.ballEntity.setPosition(0, 0.28, 0);

        state.sceneRoot.addChild(state.ballEntity);

        state.ballShadow = createEntity(
            "Ball Shadow",
            "sphere",
            [0, 0.02, 0],
            [0.48, 0.025, 0.48],
            makeMaterial([0.025, 0.04, 0.025]),
            state.sceneRoot
        );

        state.ballVelocity = { x: 0, y: 0, z: 0 };
        state.ballOwner = null;
        state.lastBallOwner = null;
    }

    function resetKickoff(teamSide = "home") {
        state.goalPause = 0;
        state.ballOwner = null;
        state.ballVelocity = { x: 0, y: 0, z: 0 };

        if (state.ballEntity) {
            state.ballEntity.setPosition(0, 0.28, 0);
        }

        if (state.ballShadow) {
            state.ballShadow.setPosition(0, 0.02, 0);
        }

        state.allPlayers.forEach(player => {
            player.x = player.homeX;
            player.z = player.homeZ;
            player.vx = 0;
            player.vz = 0;

            player.entity?.setPosition(player.x, 0, player.z);
        });

        if (teamSide === "home") {
            state.controlledPlayer =
                state.homePlayers.find(player => !player.isGoalkeeper) ||
                state.homePlayers[0];
        } else {
            state.controlledPlayer =
                state.homePlayers.find(player => !player.isGoalkeeper) ||
                state.homePlayers[0];
        }

        setControlledPlayer(state.controlledPlayer);
    }

    /* ========================================================
       10. CAMÉRA 3D
    ======================================================== */

    function createCamera() {
        const pc = state.pc;

        const camera = new pc.Entity("Football Camera");

        camera.addComponent("camera", {
            clearColor: new pc.Color(0.04, 0.08, 0.13),
            fov: 55,
            nearClip: 0.1,
            farClip: 250
        });

        camera.setPosition(0, CAMERA.defaultHeight, 1);
        camera.lookAt(0, 0, 0);

        state.sceneRoot.addChild(camera);
        state.cameraEntity = camera;
    }

    function updateCameraTarget() {
        if (!state.cameraEntity) return;

        let targetX = 0;
        let targetZ = 0;

        if (state.cameraMode === 1 && state.controlledPlayer) {
            targetX = state.controlledPlayer.x * 0.35;
            targetZ = state.controlledPlayer.z * 0.35;
        } else if (state.cameraMode === 2 && state.ballEntity) {
            const position = state.ballEntity.getPosition();
            targetX = position.x * 0.25;
            targetZ = position.z * 0.25;
        }

        const cameraY = state.cameraHeight;

        state.cameraEntity.setPosition(
            targetX,
            cameraY,
            targetZ + 1
        );

        state.cameraEntity.lookAt(targetX, 0, targetZ);
    }

    function changeCameraMode() {
        state.cameraMode = (state.cameraMode + 1) % 3;

        const names = [
            "Vue complète du terrain",
            "Caméra joueur",
            "Caméra ballon"
        ];

        updateCameraTarget();
        showToast(names[state.cameraMode]);
    }

    function cameraZoom(amount) {
        state.cameraHeight = clamp(
            state.cameraHeight + amount,
            CAMERA.minHeight,
            CAMERA.maxHeight
        );

        updateCameraTarget();
    }

    function resizeCanvas() {
        if (!state.app) return;

        try {
            state.app.resizeCanvas();
        } catch (error) {
            console.debug("[FOBAS] Redimensionnement différé.");
        }
    }

    /* ========================================================
       11. MOUVEMENTS ET CONTRÔLE MANUEL
    ======================================================== */

    function distance2D(a, b) {
        return Math.hypot(a.x - b.x, a.z - b.z);
    }

    function nearestPlayer(players, target, excludeGoalkeeper = false) {
        let best = null;
        let bestDistance = Infinity;

        players.forEach(player => {
            if (excludeGoalkeeper && player.isGoalkeeper) return;

            const distance = distance2D(player, target);

            if (distance < bestDistance) {
                best = player;
                bestDistance = distance;
            }
        });

        return best;
    }

    function nearestOpponent(player) {
        const opponents = player.teamSide === "home"
            ? state.awayPlayers
            : state.homePlayers;

        return nearestPlayer(opponents, player);
    }

    function movePlayerToward(player, targetX, targetZ, dt, speedMultiplier = 1) {
        if (!player || !player.entity) return;

        const dx = targetX - player.x;
        const dz = targetZ - player.z;

        const distance = Math.hypot(dx, dz);

        if (distance < 0.05) {
            player.vx *= 0.8;
            player.vz *= 0.8;
            return;
        }

        const speed = player.speed * speedMultiplier;

        const targetVX = dx / distance * speed;
        const targetVZ = dz / distance * speed;

        const response = Math.min(1, dt * 6);

        player.vx += (targetVX - player.vx) * response;
        player.vz += (targetVZ - player.vz) * response;

        player.x += player.vx * dt;
        player.z += player.vz * dt;

        player.x = clamp(player.x, -FIELD.halfWidth + 0.65, FIELD.halfWidth - 0.65);
        player.z = clamp(player.z, -FIELD.halfLength + 0.65, FIELD.halfLength - 0.65);

        player.entity.setPosition(player.x, 0, player.z);

        const angle = Math.atan2(player.vx, player.vz) * 180 / Math.PI;
        player.entity.setEulerAngles(0, angle, 0);
    }

    function updateControlledPlayer(dt) {
        const player = state.controlledPlayer;

        if (!player || !player.entity) return;

        const input = state.joystick;

        if (input.active || Math.abs(input.x) > 0.03 || Math.abs(input.y) > 0.03) {
            const multiplier = state.sprinting ? 1.48 : 1;

            const speed = player.speed * multiplier;

            player.vx = input.x * speed;
            player.vz = input.y * speed;

            player.x += player.vx * dt;
            player.z += player.vz * dt;

            player.x = clamp(player.x, -FIELD.halfWidth + 0.65, FIELD.halfWidth - 0.65);
            player.z = clamp(player.z, -FIELD.halfLength + 0.65, FIELD.halfLength - 0.65);

            player.entity.setPosition(player.x, 0, player.z);

            const angle = Math.atan2(player.vx, player.vz) * 180 / Math.PI;

            if (Math.abs(player.vx) + Math.abs(player.vz) > 0.1) {
                player.entity.setEulerAngles(0, angle, 0);
            }
        } else {
            player.vx *= Math.max(0, 1 - dt * 7);
            player.vz *= Math.max(0, 1 - dt * 7);
        }

        player.animationTime += dt;

        if (player.legs && player.legs.length === 2) {
            const movement = Math.hypot(player.vx, player.vz);

            if (movement > 0.4) {
                player.legs[0].setLocalEulerAngles(
                    Math.sin(player.animationTime * 9) * 18,
                    0,
                    0
                );

                player.legs[1].setLocalEulerAngles(
                    -Math.sin(player.animationTime * 9) * 18,
                    0,
                    0
                );
            } else {
                player.legs.forEach(leg => {
                    leg.setLocalEulerAngles(0, 0, 0);
                });
            }
        }
    }

    /* ========================================================
       12. IA DES DEUX ÉQUIPES
    ======================================================== */

    function getDifficultyMultiplier() {
        return DIFFICULTY[state.settings.difficulty] || 1;
    }

    function getAttackDirection(side) {
        return side === "home" ? -1 : 1;
    }

    function getGoalkeeperTarget(player) {
        const z = player.teamSide === "home"
            ? -FIELD.halfLength + 2.3
            : FIELD.halfLength - 2.3;

        return {
            x: clamp(
                state.ballEntity.getPosition().x,
                -FIELD.goalHalfWidth + 0.5,
                FIELD.goalHalfWidth - 0.5
            ),
            z
        };
    }

    function updateTeamAI(players, side, dt, isHumanTeam) {
        const ballPosition = state.ballEntity.getPosition();
        const ball = {
            x: ballPosition.x,
            z: ballPosition.z
        };

        const attackDirection = getAttackDirection(side);

        const difficulty = getDifficultyMultiplier();

        const ownTeam = players;
        const opponentTeam = side === "home"
            ? state.awayPlayers
            : state.homePlayers;

        const closestPlayer = nearestPlayer(
            ownTeam,
            ball,
            true
        );

        players.forEach(player => {
            if (isHumanTeam && player === state.controlledPlayer) {
                return;
            }

            player.aiTimer -= dt;

            if (player.isGoalkeeper) {
                const target = getGoalkeeperTarget(player);

                const distanceToGoal = Math.abs(
                    ball.z - target.z
                );

                if (distanceToGoal < 10) {
                    movePlayerToward(
                        player,
                        target.x,
                        target.z,
                        dt,
                        difficulty
                    );
                } else {
                    movePlayerToward(
                        player,
                        0,
                        target.z,
                        dt,
                        0.65
                    );
                }

                continue;
            }

            const isClosest = player === closestPlayer;

            const hasBall =
                state.ballOwner &&
                state.ballOwner.teamSide === side &&
                state.ballOwner === player;

            if (hasBall) {
                const goalZ = attackDirection * FIELD.halfLength;
                const goalDistance = Math.abs(goalZ - player.z);

                if (goalDistance < 18 && player.cooldown <= 0) {
                    const target = findShotTarget(player, side);

                    if (Math.random() < 0.035 * difficulty) {
                        shootBall(player, target.x, target.z, true);
                        player.cooldown = random(1.1, 2.2);
                    } else {
                        const teammate = nearestForwardTeammate(
                            player,
                            ownTeam,
                            attackDirection
                        );

                        if (
                            teammate &&
                            Math.random() < 0.015 * difficulty
                        ) {
                            passBall(player, teammate, true);
                            player.cooldown = random(0.7, 1.5);
                        } else {
                            movePlayerToward(
                                player,
                                player.x * 0.35,
                                goalZ - attackDirection * 5,
                                dt,
                                difficulty
                            );
                        }
                    }
                } else {
                    const teammate = nearestForwardTeammate(
                        player,
                        ownTeam,
                        attackDirection
                    );

                    if (
                        teammate &&
                        Math.random() < 0.012 * difficulty
                    ) {
                        passBall(player, teammate, true);
                        player.cooldown = random(0.8, 1.6);
                    } else {
                        movePlayerToward(
                            player,
                            player.x * 0.25,
                            goalZ - attackDirection * 6,
                            dt,
                            difficulty
                        );
                    }
                }

                continue;
            }

            if (isClosest && distance2D(player, ball) < 15) {
                movePlayerToward(
                    player,
                    ball.x,
                    ball.z,
                    dt,
                    difficulty
                );
            } else {
                const ballInfluenceX = clamp(
                    ball.x * 0.25,
                    -4,
                    4
                );

                const ballInfluenceZ = clamp(
                    ball.z * 0.20,
                    -4,
                    4
                );

                const formationTargetX =
                    player.homeX + ballInfluenceX;

                const formationTargetZ =
                    player.homeZ + ballInfluenceZ;

                movePlayerToward(
                    player,
                    formationTargetX,
                    formationTargetZ,
                    dt,
                    isHumanTeam ? 0.85 : difficulty
                );
            }

            player.cooldown = Math.max(0, player.cooldown - dt);
        });
    }

    function nearestForwardTeammate(player, teammates, attackDirection) {
        let best = null;
        let bestScore = -Infinity;

        teammates.forEach(teammate => {
            if (teammate === player || teammate.isGoalkeeper) return;

            const forwardDistance =
                (teammate.z - player.z) * attackDirection;

            const lateralDistance =
                Math.abs(teammate.x - player.x);

            if (forwardDistance < -2) return;

            const score = forwardDistance - lateralDistance * 0.25;

            if (score > bestScore) {
                bestScore = score;
                best = teammate;
            }
        });

        return best;
    }

    /* ========================================================
       13. PASSES, TIRS ET POSSESSION
    ======================================================== */

    function giveBallTo(player) {
        if (!player || !state.ballEntity) return;

        state.ballOwner = player;
        state.lastBallOwner = player;

        state.ballVelocity = {
            x: 0,
            y: 0,
            z: 0
        };

        state.ballEntity.setPosition(
            player.x,
            0.30,
            player.z - (player.teamSide === "home" ? 0.45 : -0.45)
        );
    }

    function passBall(player, teammate = null, fromAI = false) {
        if (!player || !state.ballEntity) return;

        const ballPos = state.ballEntity.getPosition();

        if (
            state.ballOwner !== player &&
            distance2D(player, { x: ballPos.x, z: ballPos.z }) > 2.2
        ) {
            if (!fromAI) {
                showToast("Rapprochez-vous du ballon pour faire une passe.");
            }
            return;
        }

        const team = player.teamSide === "home"
            ? state.homePlayers
            : state.awayPlayers;

        const receiver = teammate ||
            nearestForwardTeammate(
                player,
                team,
                getAttackDirection(player.teamSide)
            );

        if (!receiver) {
            showToast("Aucun coéquipier disponible.");
            return;
        }

        const dx = receiver.x - player.x;
        const dz = receiver.z - player.z;
        const distance = Math.max(1, Math.hypot(dx, dz));

        state.ballOwner = null;
        state.lastBallOwner = player;

        state.ballVelocity = {
            x: dx / distance * 13,
            y: 2.4,
            z: dz / distance * 13
        };

        playSound(430, 0.07);
        vibrate(18);

        if (!fromAI) {
            showToast(`Passe vers ${receiver.name}.`);
        }
    }

    function findShotTarget(player, side) {
        const goalZ = side === "home"
            ? -FIELD.halfLength - 0.3
            : FIELD.halfLength + 0.3;

        const goalkeeper = side === "home"
            ? state.awayPlayers[0]
            : state.homePlayers[0];

        let targetX = random(-2.6, 2.6);

        if (goalkeeper) {
            targetX += goalkeeper.x * -0.15;
        }

        targetX = clamp(
            targetX,
            -FIELD.goalHalfWidth + 0.5,
            FIELD.goalHalfWidth - 0.5
        );

        return {
            x: targetX,
            z: goalZ
        };
    }

    function shootBall(player, targetX = null, targetZ = null, fromAI = false) {
        if (!player || !state.ballEntity) return;

        const ballPos = state.ballEntity.getPosition();

        if (
            state.ballOwner !== player &&
            distance2D(player, { x: ballPos.x, z: ballPos.z }) > 2.3
        ) {
            if (!fromAI) {
                showToast("Vous devez être près du ballon pour tirer.");
            }
            return;
        }

        const target = targetX === null || targetZ === null
            ? findShotTarget(player, player.teamSide)
            : { x: targetX, z: targetZ };

        const dx = target.x - player.x;
        const dz = target.z - player.z;

        const distance = Math.max(1, Math.hypot(dx, dz));

        const accuracy = player.skill || 1;

        state.ballOwner = null;
        state.lastBallOwner = player;

        state.ballVelocity = {
            x: dx / distance * 21 * accuracy,
            y: 5.0 * accuracy,
            z: dz / distance * 21 * accuracy
        };

        state.ballEntity.setPosition(
            player.x,
            0.38,
            player.z
        );

        playSound(190, 0.15, "triangle");
        vibrate(45);

        if (!fromAI) {
            showToast("Tir déclenché !");
        }
    }

    function tryPossession() {
        if (!state.ballEntity || state.ballOwner) return;

        const ballPosition = state.ballEntity.getPosition();

        let best = null;
        let bestDistance = Infinity;

        state.allPlayers.forEach(player => {
            const distance = distance2D(
                player,
                { x: ballPosition.x, z: ballPosition.z }
            );

            if (distance < bestDistance) {
                bestDistance = distance;
                best = player;
            }
        });

        if (best && bestDistance < 0.78 && ballPosition.y < 1.1) {
            state.ballOwner = best;
            state.lastBallOwner = best;

            state.ballVelocity.x = 0;
            state.ballVelocity.y = 0;
            state.ballVelocity.z = 0;
        }
    }

    function updateBall(dt) {
        if (!state.ballEntity) return;

        if (state.ballOwner && state.ballOwner.entity) {
            const owner = state.ballOwner;

            const offset = owner.teamSide === "home" ? -0.48 : 0.48;

            const bx = owner.x;
            const bz = owner.z + offset;

            state.ballEntity.setPosition(
                bx,
                0.30,
                bz
            );

            state.ballShadow?.setPosition(bx, 0.02, bz);

            return;
        }

        const position = state.ballEntity.getPosition();

        let x = position.x + state.ballVelocity.x * dt;
        let y = position.y + state.ballVelocity.y * dt;
        let z = position.z + state.ballVelocity.z * dt;

        state.ballVelocity.y -= 9.8 * dt;

        if (y < 0.22) {
            y = 0.22;
            state.ballVelocity.y = Math.max(
                0,
                -state.ballVelocity.y * 0.38
            );

            state.ballVelocity.x *= 0.985;
            state.ballVelocity.z *= 0.985;
        }

        if (Math.abs(x) > FIELD.halfWidth - 0.25) {
            x = clamp(x, -FIELD.halfWidth + 0.25, FIELD.halfWidth - 0.25);
            state.ballVelocity.x *= -0.65;
        }

        state.ballVelocity.x *= Math.max(0, 1 - dt * 0.22);
        state.ballVelocity.z *= Math.max(0, 1 - dt * 0.22);

        state.ballEntity.setPosition(x, y, z);
        state.ballShadow?.setPosition(x, 0.02, z);

        checkGoal(x, y, z);

        if (state.goalPause <= 0) {
            tryPossession();
        }
    }

    /* ========================================================
       14. GESTION DES BUTS
    ======================================================== */

    function checkGoal(x, y, z) {
        if (state.goalPause > 0 || state.matchFinished) return;

        if (
            Math.abs(x) > FIELD.goalHalfWidth ||
            y > 2.2
        ) {
            return;
        }

        if (z < -FIELD.halfLength) {
            // Le but au nord est attaqué par l'équipe domicile.
            state.scoreHome += 1;
            state.lastGoalTeam = "home";

            registerGoal("home");
            return;
        }

        if (z > FIELD.halfLength) {
            // Le but au sud est attaqué par l'équipe visiteuse.
            state.scoreAway += 1;
            state.lastGoalTeam = "away";

            registerGoal("away");
        }
    }

    function registerGoal(side) {
        state.goalPause = 2.7;

        state.ballOwner = null;
        state.ballVelocity = { x: 0, y: 0, z: 0 };

        updateScoreboard();

        const team = side === "home"
            ? getTeam(state.selectedHome)
            : getTeam(state.selectedAway);

        showAnnouncement(
            "⚽ BUT !",
            `${team.name} marque un but !`,
            2500
        );

        if (side === "home") {
            state.profile.goalsScored += 1;
        }

        playSound(720, 0.22, "triangle");
        vibrate([80, 40, 80]);

        if (state.settings.commentary) {
            const decision = $("refereeDecisionLabel");

            if (decision) {
                decision.textContent = `But validé pour ${team.name}`;
            }
        }

        saveAll(true).catch(() => {});

        setTimeout(() => {
            if (!state.matchFinished && state.matchStarted) {
                resetKickoff(side === "home" ? "away" : "home");
                showAnnouncement(
                    "REPRISE DU JEU",
                    "Le ballon est remis en jeu.",
                    1300
                );
            }
        }, 2700);
    }

    /* ========================================================
       15. TABLEAU DE SCORE ET TEMPS
    ======================================================== */

    function updateScoreboard() {
        if ($("homeScore")) {
            $("homeScore").textContent = String(state.scoreHome);
        }

        if ($("awayScore")) {
            $("awayScore").textContent = String(state.scoreAway);
        }

        const home = getTeam(state.selectedHome);
        const away = getTeam(state.selectedAway);

        if ($("homeTeamName")) {
            $("homeTeamName").textContent = home.name;
        }

        if ($("awayTeamName")) {
            $("awayTeamName").textContent = away.name;
        }

        if ($("competitionLabel")) {
            const competition = COMPETITIONS.find(
                item => item.id === state.selectedCompetition
            );

            $("competitionLabel").textContent =
                competition ? competition.name : "MATCH LOCAL";
        }

        if ($("stadiumLabel")) {
            $("stadiumLabel").textContent = "STADE FOBAS";
        }
    }

    function formatClock(seconds) {
        const total = Math.max(0, Math.floor(seconds));

        const minutes = Math.floor(total / 60);
        const remainder = total % 60;

        return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
    }

    function updateMatchClock(dt) {
        if (!state.matchStarted || state.paused || state.matchFinished) {
            return;
        }

        if (state.goalPause > 0) {
            state.goalPause = Math.max(0, state.goalPause - dt);
            return;
        }

        // Le temps est accéléré pour obtenir des matchs jouables
        // sans immobiliser le téléphone pendant 90 minutes.
        state.elapsed += dt * 3.2;

        const totalSeconds = state.matchLength * 60;

        if ($("matchClock")) {
            $("matchClock").textContent = formatClock(state.elapsed);
        }

        const halfTime = totalSeconds / 2;

        if ($("matchPeriod")) {
            $("matchPeriod").textContent =
                state.elapsed < halfTime
                    ? "1re MI-TEMPS"
                    : "2e MI-TEMPS";
        }

        if (state.elapsed >= totalSeconds) {
            finishMatch();
        }
    }

    async function finishMatch() {
        if (state.matchFinished) return;

        state.matchFinished = true;
        state.matchStarted = false;

        state.joystick.x = 0;
        state.joystick.y = 0;
        state.joystick.active = false;

        state.sprinting = false;
        state.defending = false;

        const home = getTeam(state.selectedHome);
        const away = getTeam(state.selectedAway);

        let result = "match nul";

        if (state.scoreHome > state.scoreAway) {
            result = "victoire";
            state.career.wins += 1;
            state.profile.trophies += 1;
        } else if (state.scoreHome < state.scoreAway) {
            result = "défaite";
            state.career.losses += 1;
        } else {
            state.career.draws += 1;
        }

        state.profile.matchesPlayed += 1;

        if (!state.career.completedMissions.includes(state.career.currentMission)) {
            state.career.completedMissions.push(state.career.currentMission);
        }

        state.career.currentMission = Math.min(
            40,
            state.career.currentMission + 1
        );

        updateScoreboard();

        await saveAll(true);
        await recordMatch();

        showDialog(
            "Fin du match",
            `
                <div class="result-summary">
                    <h3>${safeText(home.name)} ${state.scoreHome} - ${state.scoreAway} ${safeText(away.name)}</h3>
                    <p>Résultat : <strong>${safeText(result)}</strong></p>
                    <p>Matchs joués : ${state.profile.matchesPlayed}</p>
                    <p>Buts marqués : ${state.profile.goalsScored}</p>
                    <p>Mission suivante : ${state.career.currentMission}</p>
                </div>
            `,
            [
                {
                    label: "REJOUER",
                    className: "ui-button button-primary",
                    onClick: () => {
                        closeDialog();
                        startMatch({
                            homeId: state.selectedHome,
                            awayId: state.selectedAway,
                            competition: state.selectedCompetition,
                            duration: state.matchLength
                        });
                    }
                },
                {
                    label: "MENU PRINCIPAL",
                    className: "ui-button button-secondary",
                    onClick: () => {
                        closeDialog();
                        showScreen("mainMenu");
                    }
                }
            ]
        );
    }

    async function recordMatch() {
        if (state.matchRecorded) return;

        state.matchRecorded = true;

        const entry = {
            date: new Date().toISOString(),
            home: state.selectedHome,
            away: state.selectedAway,
            scoreHome: state.scoreHome,
            scoreAway: state.scoreAway,
            competition: state.selectedCompetition,
            duration: state.matchLength
        };

        try {
            if (state.db) {
                await dbAdd("matchHistory", entry);
            }
        } catch (error) {
            console.warn("[FOBAS] Historique du match indisponible.");
        }
    }

    /* ========================================================
       16. DÉMARRAGE DU MATCH
    ======================================================== */

    function durationToSeconds(value) {
        if (typeof value === "number" && Number.isFinite(value)) {
            return clamp(value, 1, 120) * 60;
        }

        switch (value) {
            case "short":
                return 3 * 60;
            case "long":
                return 15 * 60;
            case "standard":
            default:
                return 8 * 60;
        }
    }

    async function startMatch(options = {}) {
        const homeId = options.homeId || state.selectedHome;

        let awayId = options.awayId || state.selectedAway;

        if (!state.teams.some(team => team.id === homeId)) {
            showToast("Équipe domicile introuvable.");
            return;
        }

        // L'IA doit toujours recevoir une équipe différente.
        if (homeId === awayId || !state.teams.some(team => team.id === awayId)) {
            const opponent = selectAutomaticOpponent(homeId);

            awayId = opponent ? opponent.id : state.teams.find(
                team => team.id !== homeId
            )?.id;
        }

        if (!awayId || homeId === awayId) {
            showToast("Impossible de sélectionner un adversaire.");
            return;
        }

        state.selectedHome = homeId;
        state.selectedAway = awayId;

        state.selectedCompetition =
            options.competition || state.selectedCompetition || "local";

        state.scoreHome = 0;
        state.scoreAway = 0;
        state.elapsed = 0;
        state.matchLength = durationToSeconds(
            options.duration || "standard"
        );

        state.matchStarted = true;
        state.paused = false;
        state.matchFinished = false;
        state.goalPause = 0;
        state.matchRecorded = false;
        state.currentMatchId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        state.sprinting = false;
        state.defending = false;

        state.joystick = {
            x: 0,
            y: 0,
            active: false
        };

        refreshTeamSelectors();
        updateScoreboard();

        if (!state.app || !state.sceneRoot) {
            showToast("Le moteur 3D n'est pas encore prêt.");
            state.matchStarted = false;
            return;
        }

        createPlayers();
        createBall();

        resetKickoff("home");

        state.cameraHeight = CAMERA.defaultHeight;
        state.cameraMode = 0;

        updateCameraTarget();
        updateScoreboard();

        showScreen("matchScreen");

        $("pauseOverlay")?.classList.add("hidden");
        $("tacticsOverlay")?.classList.add("hidden");

        setEngineStatus(
            `Match prêt : ${getTeam(homeId).name} contre ${getTeam(awayId).name}`
        );

        showAnnouncement(
            "COUP D'ENVOI",
            `${getTeam(homeId).name} contre ${getTeam(awayId).name}`,
            2400
        );

        if ($("refereeDecisionLabel")) {
            $("refereeDecisionLabel").textContent =
                `${CONFIG.refereeName || "MEME Selvandieu"} : match autorisé`;
        }

        playSound(520, 0.11);
        await saveAll(true);
    }

    /* ========================================================
       17. JOYSTICK TACTILE
    ======================================================== */

    function attachJoystick() {
        const joystick = $("movementJoystick");
        const base = $("joystickBase");
        const knob = $("joystickKnob");

        if (!joystick || !base || !knob) return;

        let pointerId = null;

        function updateFromEvent(event) {
            const rect = base.getBoundingClientRect();

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const maxRadius = Math.max(15, rect.width * 0.34);

            let dx = event.clientX - centerX;
            let dy = event.clientY - centerY;

            const distance = Math.hypot(dx, dy);

            if (distance > maxRadius) {
                dx = dx / distance * maxRadius;
                dy = dy / distance * maxRadius;
            }

            state.joystick.x = clamp(dx / maxRadius, -1, 1);

            // Vers le haut de l'écran = mouvement vers le nord du terrain.
            state.joystick.y = clamp(dy / maxRadius, -1, 1);

            state.joystick.active = true;

            knob.style.transform =
                `translate(${dx}px, ${dy}px)`;
        }

        function release() {
            pointerId = null;

            state.joystick.x = 0;
            state.joystick.y = 0;
            state.joystick.active = false;

            knob.style.transform = "translate(0, 0)";
        }

        joystick.addEventListener("pointerdown", event => {
            if (pointerId !== null) return;

            pointerId = event.pointerId;

            try {
                joystick.setPointerCapture(pointerId);
            } catch (_) {}

            updateFromEvent(event);
            event.preventDefault();
        });

        joystick.addEventListener("pointermove", event => {
            if (event.pointerId !== pointerId) return;

            updateFromEvent(event);
            event.preventDefault();
        });

        joystick.addEventListener("pointerup", event => {
            if (event.pointerId === pointerId) release();
        });

        joystick.addEventListener("pointercancel", release);
        joystick.addEventListener("lostpointercapture", release);
    }

    /* ========================================================
       18. ZOOM AVEC DEUX DOIGTS
    ======================================================== */

    function attachPinchZoom() {
        const viewport = $("pitchViewport");

        if (!viewport) return;

        let startDistance = null;
        let initialHeight = CAMERA.defaultHeight;

        viewport.addEventListener("touchstart", event => {
            if (event.touches.length === 2) {
                const a = event.touches[0];
                const b = event.touches[1];

                startDistance = Math.hypot(
                    b.clientX - a.clientX,
                    b.clientY - a.clientY
                );

                initialHeight = state.cameraHeight;
            }
        }, { passive: true });

        viewport.addEventListener("touchmove", event => {
            if (event.touches.length !== 2 || startDistance === null) {
                return;
            }

            const a = event.touches[0];
            const b = event.touches[1];

            const distance = Math.hypot(
                b.clientX - a.clientX,
                b.clientY - a.clientY
            );

            const delta = distance - startDistance;

            state.cameraHeight = clamp(
                initialHeight - delta * 0.055,
                CAMERA.minHeight,
                CAMERA.maxHeight
            );

            updateCameraTarget();
        }, { passive: true });

        viewport.addEventListener("touchend", event => {
            if (event.touches.length < 2) {
                startDistance = null;
            }
        }, { passive: true });
    }

    /* ========================================================
       19. COMMANDES DU JOUEUR
    ======================================================== */

    function playerPassAction() {
        if (!state.matchStarted || state.paused) return;

        const player = state.controlledPlayer;
        if (!player) return;

        const ballPosition = state.ballEntity.getPosition();

        if (
            state.ballOwner === player ||
            distance2D(player, {
                x: ballPosition.x,
                z: ballPosition.z
            }) < 1.6
        ) {
            if (!state.ballOwner) giveBallTo(player);

            passBall(player);
            return;
        }

        showToast("Approchez-vous du ballon pour faire une passe.");
    }

    function playerShootAction() {
        if (!state.matchStarted || state.paused) return;

        const player = state.controlledPlayer;
        if (!player) return;

        const ballPosition = state.ballEntity.getPosition();

        if (
            state.ballOwner === player ||
            distance2D(player, {
                x: ballPosition.x,
                z: ballPosition.z
            }) < 1.6
        ) {
            if (!state.ballOwner) giveBallTo(player);

            shootBall(player);
            return;
        }

        showToast("Approchez-vous du ballon pour tirer.");
    }

    function switchControlledPlayer() {
        if (!state.homePlayers.length) return;

        const ballPosition = state.ballEntity
            ? state.ballEntity.getPosition()
            : { x: 0, z: 0 };

        const candidates = state.homePlayers
            .filter(player => !player.isGoalkeeper);

        if (!candidates.length) return;

        const currentIndex = candidates.indexOf(state.controlledPlayer);

        const nextIndex = (currentIndex + 1) % candidates.length;

        let nextPlayer = candidates[nextIndex];

        if (state.ballEntity) {
            nextPlayer = nearestPlayer(
                candidates,
                { x: ballPosition.x, z: ballPosition.z }
            ) || nextPlayer;
        }

        setControlledPlayer(nextPlayer);

        playSound(540, 0.06);

        showToast(`Vous contrôlez maintenant ${nextPlayer.name}.`);
    }

    function toggleSprint() {
        state.sprinting = !state.sprinting;

        $("sprintBtn")?.classList.toggle(
            "active",
            state.sprinting
        );

        showToast(
            state.sprinting ? "Sprint activé." : "Sprint désactivé."
        );
    }

    function toggleDefense() {
        state.defending = !state.defending;

        $("defendBtn")?.classList.toggle(
            "active",
            state.defending
        );

        if (state.defending) {
            attemptTackle();
        }

        showToast(
            state.defending ? "Défense activée." : "Défense désactivée."
        );
    }

    function attemptTackle() {
        const player = state.controlledPlayer;
        if (!player) return;

        const opponent = nearestPlayer(
            state.awayPlayers,
            player
        );

        if (!opponent) return;

        const distance = distance2D(player, opponent);

        if (distance > 1.9) return;

        const ballPosition = state.ballEntity.getPosition();

        if (
            state.ballOwner === opponent ||
            distance2D(opponent, {
                x: ballPosition.x,
                z: ballPosition.z
            }) < 1.2
        ) {
            const successChance = 0.72;

            if (Math.random() < successChance) {
                giveBallTo(player);

                if ($("refereeDecisionLabel")) {
                    $("refereeDecisionLabel").textContent =
                        "Récupération régulière du ballon";
                }

                showToast("Ballon récupéré !");
                playSound(360, 0.08);
            } else {
                if ($("refereeDecisionLabel")) {
                    $("refereeDecisionLabel").textContent =
                        "Contact : continuez le jeu";
                }

                showToast("L'adversaire protège le ballon.");
            }
        }
    }

    /* ========================================================
       20. PAUSE
    ======================================================== */

    function pauseMatch() {
        if (!state.matchStarted || state.matchFinished) return;

        state.paused = true;

        $("pauseOverlay")?.classList.remove("hidden");
        showToast("Match en pause.");
    }

    function resumeMatch() {
        state.paused = false;

        $("pauseOverlay")?.classList.add("hidden");

        showToast("Match repris.");
    }

    function quitMatch() {
        state.paused = false;
        state.matchStarted = false;

        state.joystick = {
            x: 0,
            y: 0,
            active: false
        };

        $("pauseOverlay")?.classList.add("hidden");

        saveAll(true).finally(() => {
            showScreen("mainMenu");
            showToast("Retour au menu principal.");
        });
    }

    /* ========================================================
       21. CHAMPIONNATS
    ======================================================== */

    function renderChampionships() {
        const container = $("competitionLevelsList");
        if (!container) return;

        container.replaceChildren();

        COMPETITIONS.forEach((competition, index) => {
            const card = document.createElement("button");

            card.type = "button";
            card.className = "competition-level-card";

            card.classList.toggle(
                "active",
                state.selectedChampionship === competition.id
            );

            card.innerHTML = `
                <span class="competition-level-number">${index + 1}</span>
                <span class="competition-level-text">
                    <strong>${safeText(competition.name)}</strong>
                    <small>${safeText(competition.description || "Compétition FOBAS")}</small>
                </span>
                <span class="competition-level-arrow">›</span>
            `;

            card.addEventListener("click", () => {
                state.selectedChampionship = competition.id;
                state.selectedCompetition = competition.id;

                renderChampionships();
                saveAll(true);
            });

            container.appendChild(card);
        });
    }

    function startChampionship() {
        const competition = COMPETITIONS.find(
            item => item.id === state.selectedChampionship
        );

        state.selectedCompetition =
            competition ? competition.id : "local";

        showScreen("matchSetupScreen");

        if ($("competitionSelect")) {
            $("competitionSelect").value = state.selectedCompetition;
        }

        showToast(
            `Préparation : ${competition ? competition.name : "Championnats"}`
        );
    }

    /* ========================================================
       22. TOURNOIS
    ======================================================== */

    function renderTournaments() {
        const container = $("tournamentList");
        if (!container) return;

        container.replaceChildren();

        if (!state.tournaments.length) {
            const empty = document.createElement("div");
            empty.className = "empty-state";
            empty.textContent = "Aucun tournoi créé. Créez votre premier tournoi.";

            container.appendChild(empty);
            return;
        }

        state.tournaments.forEach(tournament => {
            const card = document.createElement("div");

            card.className = "tournament-card";

            card.innerHTML = `
                <h3>${safeText(tournament.name)}</h3>
                <p>${safeText(tournament.competitionName || "Tournoi FOBAS")}</p>
                <p>Équipes : ${Number(tournament.teamCount) || 0}</p>
                <p>Statut : ${safeText(tournament.status || "Disponible")}</p>
            `;

            const playButton = document.createElement("button");
            playButton.type = "button";
            playButton.className = "ui-button button-primary";
            playButton.textContent = "JOUER";

            playButton.addEventListener("click", () => {
                state.activeTournament = tournament;

                state.selectedCompetition =
                    tournament.competition || "caribbean";

                showScreen("matchSetupScreen");
            });

            card.appendChild(playButton);
            container.appendChild(card);
        });
    }

    async function createTournament() {
        const defaultName = `Tournoi FOBAS ${state.tournaments.length + 1}`;

        showDialog(
            "Créer un tournoi",
            `
                <label for="newTournamentName">Nom du tournoi</label>
                <input id="newTournamentName" type="text" maxlength="60"
                    value="${safeText(defaultName)}">

                <label for="newTournamentCompetition">Niveau</label>
                <select id="newTournamentCompetition">
                    ${COMPETITIONS.map(item => `
                        <option value="${safeText(item.id)}">
                            ${safeText(item.name)}
                        </option>
                    `).join("")}
                </select>
            `,
            [
                {
                    label: "CRÉER",
                    className: "ui-button button-primary",
                    onClick: async () => {
                        const nameInput = $("newTournamentName");
                        const competitionInput = $("newTournamentCompetition");

                        const name = nameInput?.value.trim();

                        if (!name) {
                            showToast("Entrez un nom de tournoi.");
                            return;
                        }

                        const competition = COMPETITIONS.find(
                            item => item.id === competitionInput?.value
                        );

                        const tournament = {
                            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                            name,
                            competition: competition?.id || "local",
                            competitionName: competition?.name || "Matchs locaux",
                            teamCount: Math.min(16, state.teams.length),
                            status: "Disponible",
                            createdAt: Date.now()
                        };

                        state.tournaments.push(tournament);

                        try {
                            if (state.db) {
                                await dbWrite("tournaments", tournament);
                            }
                        } catch (_) {}

                        await saveAll(true);

                        closeDialog();
                        renderTournaments();

                        showToast("Tournoi créé.");
                    }
                },
                {
                    label: "ANNULER",
                    className: "ui-button button-secondary",
                    onClick: closeDialog
                }
            ]
        );
    }

    /* ========================================================
       23. LISTE DES ÉQUIPES
    ======================================================== */

    function renderTeams() {
        const container = $("teamsList");
        if (!container) return;

        const query = state.teamsFilter.query.toLowerCase().trim();
        const region = state.teamsFilter.region;

        const filtered = state.teams.filter(team => {
            const matchesQuery =
                !query ||
                team.name.toLowerCase().includes(query) ||
                team.region.toLowerCase().includes(query);

            const matchesRegion =
                region === "all" || team.regionKey === region;

            return matchesQuery && matchesRegion;
        });

        container.replaceChildren();

        filtered.forEach(team => {
            const card = document.createElement("article");
            card.className = "team-card";

            const color = team.color.map(value =>
                Math.round(value * 255)
            );

            card.innerHTML = `
                <div class="team-card-badge"
                    style="background:rgb(${color.join(",")})">
                    ${safeText(team.name.slice(0, 2).toUpperCase())}
                </div>

                <div class="team-card-info">
                    <strong>${safeText(team.name)}</strong>
                    <small>${safeText(team.region)}</small>
                    <small>Force : ${team.rating}/100</small>
                </div>
            `;

            const selectButton = document.createElement("button");
            selectButton.type = "button";
            selectButton.className = "ui-button button-secondary";
            selectButton.textContent = "CHOISIR";

            selectButton.addEventListener("click", () => {
                state.selectedHome = team.id;
                state.profile.favoriteTeam = team.id;

                refreshTeamSelectors();
                updateProfileUI();

                showDialog(
                    "Équipe sélectionnée",
                    `<p>Vous avez choisi <strong>${safeText(team.name)}</strong>.</p>
                     <p>L'IA choisira automatiquement une autre équipe pour vous affronter.</p>`,
                    [
                        {
                            label: "PRÉPARER UN MATCH",
                            className: "ui-button button-primary",
                            onClick: () => {
                                closeDialog();
                                showScreen("matchSetupScreen");
                            }
                        },
                        {
                            label: "FERMER",
                            className: "ui-button button-secondary",
                            onClick: closeDialog
                        }
                    ]
                );
            });

            card.appendChild(selectButton);
            container.appendChild(card);
        });

        if ($("teamCountLabel")) {
            $("teamCountLabel").textContent =
                `${filtered.length} équipe(s) affichée(s) sur ${state.teams.length}`;
        }
    }

    /* ========================================================
       24. ÉQUIPEMENTS
    ======================================================== */

    const EQUIPMENT = {
        kits: [
            { id: "classic", name: "Maillot classique", description: "Tenue traditionnelle FOBAS", icon: "👕" },
            { id: "royal", name: "Maillot royal", description: "Tenue bleue de compétition", icon: "🔵" },
            { id: "ocean", name: "Maillot océan", description: "Tenue bleue et turquoise", icon: "🌊" },
            { id: "fire", name: "Maillot feu", description: "Tenue rouge et orange", icon: "🔥" }
        ],

        balls: [
            { id: "classic", name: "Ballon classique", description: "Ballon blanc", icon: "⚽" },
            { id: "gold", name: "Ballon doré", description: "Ballon doré de champion", icon: "🥇" },
            { id: "ocean", name: "Ballon océan", description: "Ballon bleu", icon: "🌊" },
            { id: "fire", name: "Ballon feu", description: "Ballon rouge", icon: "🔥" }
        ],

        boots: [
            { id: "classic", name: "Chaussures classiques", description: "Chaussures de match", icon: "👟" },
            { id: "speed", name: "Chaussures vitesse", description: "Conçues pour le sprint", icon: "⚡" },
            { id: "power", name: "Chaussures puissance", description: "Pour des frappes puissantes", icon: "💥" }
        ]
    };

    let pendingEquipment = { ...state.selectedEquipment };

    function renderEquipment() {
        const container = $("equipmentItemsList");
        if (!container) return;

        const tab = state.selectedEquipmentTab;
        const items = EQUIPMENT[tab] || [];

        container.replaceChildren();

        $all("[data-equipment-tab]").forEach(button => {
            const active = button.dataset.equipmentTab === tab;

            button.classList.toggle("active", active);
            button.setAttribute("aria-selected", String(active));
        });

        items.forEach(item => {
            const card = document.createElement("button");

            card.type = "button";
            card.className = "equipment-item-card";

            card.classList.toggle(
                "selected",
                pendingEquipment[tab] === item.id
            );

            card.innerHTML = `
                <span class="equipment-icon">${item.icon}</span>
                <strong>${safeText(item.name)}</strong>
                <small>${safeText(item.description)}</small>
                <span class="equipment-select-label">
                    ${pendingEquipment[tab] === item.id ? "SÉLECTIONNÉ" : "CHOISIR"}
                </span>
            `;

            card.addEventListener("click", () => {
                pendingEquipment[tab] = item.id;
                renderEquipment();
            });

            container.appendChild(card);
        });
    }

    async function applyEquipment() {
        state.selectedEquipment = { ...pendingEquipment };

        await saveAll(true);

        if (state.matchStarted) {
            createBall();
        }

        showToast("Équipement appliqué.");
        playSound(610, 0.08);
    }

    /* ========================================================
       25. PROFIL
    ======================================================== */

    function updateProfileUI() {
        if ($("profileNameInput")) {
            $("profileNameInput").value = state.profile.name || "Joueur FOBAS";
        }

        if ($("profileFavoriteTeam")) {
            $("profileFavoriteTeam").value = state.profile.favoriteTeam ||
                state.selectedHome;
        }

        if ($("profileMatchesPlayed")) {
            $("profileMatchesPlayed").textContent =
                String(state.profile.matchesPlayed || 0);
        }

        if ($("profileGoalsScored")) {
            $("profileGoalsScored").textContent =
                String(state.profile.goalsScored || 0);
        }

        if ($("profileTrophies")) {
            $("profileTrophies").textContent =
                String(state.profile.trophies || 0);
        }
    }

    async function saveProfile() {
        const name = $("profileNameInput")?.value.trim();

        if (!name) {
            showToast("Entrez un nom de joueur.");
            return;
        }

        state.profile.name = name;

        state.profile.favoriteTeam =
            $("profileFavoriteTeam")?.value || state.selectedHome;

        state.selectedHome = state.profile.favoriteTeam;

        refreshTeamSelectors();
        updateProfileUI();

        await saveAll(true);

        showToast("Profil sauvegardé.");
    }

    /* ========================================================
       26. PARAMÈTRES
    ======================================================== */

    function updateSettingsUI() {
        if ($("graphicsQualitySelect")) {
            $("graphicsQualitySelect").value = state.settings.graphics;
        }

        if ($("soundVolumeInput")) {
            $("soundVolumeInput").value = state.settings.volume;
        }

        if ($("cameraSensitivityInput")) {
            $("cameraSensitivityInput").value =
                state.settings.cameraSensitivity;
        }

        if ($("matchDifficultySelect")) {
            $("matchDifficultySelect").value = state.settings.difficulty;
        }

        if ($("vibrationToggle")) {
            $("vibrationToggle").checked = Boolean(state.settings.vibration);
        }

        if ($("commentaryToggle")) {
            $("commentaryToggle").checked =
                Boolean(state.settings.commentary);
        }
    }

    async function saveSettings() {
        state.settings.graphics =
            $("graphicsQualitySelect")?.value || "medium";

        state.settings.volume = clamp(
            Number($("soundVolumeInput")?.value ?? 70),
            0,
            100
        );

        state.settings.cameraSensitivity = clamp(
            Number($("cameraSensitivityInput")?.value ?? 50),
            1,
            100
        );

        state.settings.difficulty =
            $("matchDifficultySelect")?.value || "normal";

        state.settings.vibration =
            Boolean($("vibrationToggle")?.checked);

        state.settings.commentary =
            Boolean($("commentaryToggle")?.checked);

        if (state.app) {
            try {
                const ratio = state.settings.graphics === "low"
                    ? 1
                    : state.settings.graphics === "high"
                        ? Math.min(window.devicePixelRatio || 1, 2)
                        : Math.min(window.devicePixelRatio || 1, 1.4);

                state.app.graphicsDevice.maxPixelRatio = ratio;
            } catch (_) {}
        }

        await saveAll(true);

        showToast("Paramètres enregistrés.");
    }

    function updateTacticsUI() {
        if ($("formationSelect")) {
            $("formationSelect").value = state.tactics.formation;
        }

        if ($("tacticalStyleSelect")) {
            $("tacticalStyleSelect").value = state.tactics.style;
        }

        if ($("pressureSelect")) {
            $("pressureSelect").value = state.tactics.pressure;
        }
    }

    async function applyTactics() {
        state.tactics.formation =
            $("formationSelect")?.value || "433";

        state.tactics.style =
            $("tacticalStyleSelect")?.value || "balanced";

        state.tactics.pressure =
            $("pressureSelect")?.value || "medium";

        if (state.matchStarted && !state.matchFinished) {
            const home = getTeam(state.selectedHome);

            const oldControlledId = state.controlledPlayer?.id;

            createPlayers();

            const replacement = state.homePlayers.find(
                player => player.id === oldControlledId
            );

            if (replacement) {
                setControlledPlayer(replacement);
            }

            // Le ballon est replacé au même endroit pour éviter
            // une réinitialisation artificielle du score.
        }

        await saveAll(true);

        $("tacticsOverlay")?.classList.add("hidden");

        showToast(
            `Tactique appliquée : ${state.tactics.formation}`
        );
    }

    /* ========================================================
       27. ÉVÉNEMENTS ET BOUTONS
    ======================================================== */

    function attachEvents() {
        if (state.listenersAttached) return;

        state.listenersAttached = true;

        $("playMatchBtn")?.addEventListener("click", () => {
            refreshTeamSelectors();
            showScreen("matchSetupScreen");
        });

        $("continueCareerBtn")?.addEventListener("click", () => {
            state.selectedCompetition = "local";
            showScreen("matchSetupScreen");

            showToast(
                `Carrière : mission ${state.career.currentMission}/40`
            );
        });

        $("championshipsBtn")?.addEventListener("click", () => {
            renderChampionships();
            showScreen("championshipScreen");
        });

        $("tournamentsBtn")?.addEventListener("click", () => {
            renderTournaments();
            showScreen("tournamentScreen");
        });

        $("teamsBtn")?.addEventListener("click", () => {
            renderTeams();
            showScreen("teamsScreen");
        });

        $("equipmentBtn")?.addEventListener("click", () => {
            pendingEquipment = { ...state.selectedEquipment };
            renderEquipment();
            showScreen("equipmentScreen");
        });

        $("profileBtn")?.addEventListener("click", () => {
            updateProfileUI();
            showScreen("profileScreen");
        });

        $("howToPlayBtn")?.addEventListener("click", () => {
            showScreen("howToPlayScreen");
        });

        $("openSettingsBtn")?.addEventListener("click", () => {
            updateSettingsUI();
            showScreen("settingsScreen");
        });

        $("soundToggleBtn")?.addEventListener("click", () => {
            state.soundEnabled = !state.soundEnabled;

            $("soundToggleBtn").textContent =
                state.soundEnabled ? "🔊" : "🔇";

            $("soundToggleBtn").setAttribute(
                "aria-pressed",
                String(state.soundEnabled)
            );

            if (state.soundEnabled) playSound(600, 0.08);

            showToast(
                state.soundEnabled ? "Son activé." : "Son désactivé."
            );
        });

        $("pauseGameBtn")?.addEventListener("click", pauseMatch);
        $("resumeGameBtn")?.addEventListener("click", resumeMatch);

        $("savePausedMatchBtn")?.addEventListener("click", () => {
            saveAll();
        });

        $("quitPausedMatchBtn")?.addEventListener("click", quitMatch);
        $("exitMatchBtn")?.addEventListener("click", quitMatch);

        $("confirmMatchBtn")?.addEventListener("click", () => {
            const homeId = $("homeTeamSelect")?.value || state.selectedHome;

            let awayId = $("awayTeamSelect")?.value || state.selectedAway;

            if (homeId === awayId) {
                const opponent = selectAutomaticOpponent(homeId);
                awayId = opponent?.id;

                if ($("awayTeamSelect") && awayId) {
                    $("awayTeamSelect").value = awayId;
                }

                showToast(
                    "L'équipe adverse a été remplacée automatiquement."
                );
            }

            startMatch({
                homeId,
                awayId,
                competition: $("competitionSelect")?.value || "local",
                duration: $("matchDurationSelect")?.value || "standard"
            });
        });

        $("homeTeamSelect")?.addEventListener("change", event => {
            state.selectedHome = event.target.value;

            if (state.selectedHome === $("awayTeamSelect")?.value) {
                const opponent = selectAutomaticOpponent(state.selectedHome);

                if (opponent && $("awayTeamSelect")) {
                    $("awayTeamSelect").value = opponent.id;
                }
            }

            state.profile.favoriteTeam = state.selectedHome;
        });

        $("awayTeamSelect")?.addEventListener("change", event => {
            if (event.target.value === $("homeTeamSelect")?.value) {
                const opponent = selectAutomaticOpponent(
                    $("homeTeamSelect").value
                );

                if (opponent) {
                    event.target.value = opponent.id;
                    showToast("Les deux équipes doivent être différentes.");
                }
            }

            state.selectedAway = event.target.value;
        });

        $("cameraZoomInBtn")?.addEventListener("click", () => {
            cameraZoom(-3);
        });

        $("cameraZoomOutBtn")?.addEventListener("click", () => {
            cameraZoom(3);
        });

        $("cameraResetBtn")?.addEventListener("click", () => {
            state.cameraHeight = CAMERA.defaultHeight;
            state.cameraMode = 0;

            updateCameraTarget();

            showToast("Caméra réinitialisée.");
        });

        $("changeCameraBtn")?.addEventListener("click", changeCameraMode);

        $("passBtn")?.addEventListener("click", playerPassAction);
        $("shootBtn")?.addEventListener("click", playerShootAction);
        $("sprintBtn")?.addEventListener("click", toggleSprint);
        $("defendBtn")?.addEventListener("click", toggleDefense);
        $("switchPlayerBtn")?.addEventListener("click", switchControlledPlayer);

        $("showTacticsBtn")?.addEventListener("click", () => {
            updateTacticsUI();
            $("tacticsOverlay")?.classList.remove("hidden");
        });

        $("closeTacticsBtn")?.addEventListener("click", () => {
            $("tacticsOverlay")?.classList.add("hidden");
        });

        $("applyTacticsBtn")?.addEventListener("click", applyTactics);

        $("saveMatchBtn")?.addEventListener("click", () => {
            saveAll();
        });

        $("closeDialogBtn")?.addEventListener("click", closeDialog);

        $("dialogOverlay")?.addEventListener("click", event => {
            if (event.target === $("dialogOverlay")) {
                closeDialog();
            }
        });

        $all("[data-back]").forEach(button => {
            button.addEventListener("click", () => {
                showScreen(button.dataset.back || "mainMenu");
            });
        });

        $("startChampionshipBtn")?.addEventListener(
            "click",
            startChampionship
        );

        $("createTournamentBtn")?.addEventListener(
            "click",
            createTournament
        );

        $("teamSearchInput")?.addEventListener("input", event => {
            state.teamsFilter.query = event.target.value || "";
            renderTeams();
        });

        $("teamRegionSelect")?.addEventListener("change", event => {
            state.teamsFilter.region = event.target.value || "all";
            renderTeams();
        });

        $("refreshTeamsBtn")?.addEventListener("click", () => {
            generateTeams();
            refreshTeamSelectors();
            renderTeams();

            showToast("Liste des équipes actualisée.");
        });

        $all("[data-equipment-tab]").forEach(button => {
            button.addEventListener("click", () => {
                state.selectedEquipmentTab =
                    button.dataset.equipmentTab || "kits";

                renderEquipment();
            });
        });

        $("applyEquipmentBtn")?.addEventListener(
            "click",
            applyEquipment
        );

        $("saveProfileBtn")?.addEventListener(
            "click",
            saveProfile
        );

        $("saveSettingsBtn")?.addEventListener(
            "click",
            saveSettings
        );

        $("retryLoadingBtn")?.addEventListener("click", () => {
            location.reload();
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden && state.matchStarted) {
                state.paused = true;
                $("pauseOverlay")?.classList.remove("hidden");
            }
        });

        window.addEventListener("resize", resizeCanvas);

        window.addEventListener("keydown", event => {
            if (
                state.currentScreen !== "matchScreen" ||
                !state.matchStarted ||
                state.paused
            ) {
                return;
            }

            const target = event.target;

            if (
                target &&
                ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)
            ) {
                return;
            }

            switch (event.key.toLowerCase()) {
                case "w":
                case "arrowup":
                    state.joystick.y = -1;
                    state.joystick.active = true;
                    break;

                case "s":
                case "arrowdown":
                    state.joystick.y = 1;
                    state.joystick.active = true;
                    break;

                case "a":
                case "arrowleft":
                    state.joystick.x = -1;
                    state.joystick.active = true;
                    break;

                case "d":
                case "arrowright":
                    state.joystick.x = 1;
                    state.joystick.active = true;
                    break;

                case " ":
                    event.preventDefault();
                    playerShootAction();
                    break;

                case "e":
                    playerPassAction();
                    break;

                case "q":
                    switchControlledPlayer();
                    break;

                case "shift":
                    state.sprinting = true;
                    break;

                case "escape":
                    pauseMatch();
                    break;
            }
        });

        window.addEventListener("keyup", event => {
            switch (event.key.toLowerCase()) {
                case "w":
                case "arrowup":
                case "s":
                case "arrowdown":
                    state.joystick.y = 0;
                    break;

                case "a":
                case "arrowleft":
                case "d":
                case "arrowright":
                    state.joystick.x = 0;
                    break;

                case "shift":
                    state.sprinting = false;
                    break;
            }

            if (
                state.joystick.x === 0 &&
                state.joystick.y === 0
            ) {
                state.joystick.active = false;
            }
        });

        attachJoystick();
        attachPinchZoom();
    }

    /* ========================================================
       28. BOUCLE DU JEU
    ======================================================== */

    function updateGame(dt) {
        if (!Number.isFinite(dt) || dt <= 0) return;

        dt = Math.min(dt, 0.05);

        if (state.matchStarted && !state.paused && !state.matchFinished) {
            updateMatchClock(dt);

            if (!state.matchFinished) {
                updateControlledPlayer(dt);

                updateTeamAI(
                    state.homePlayers,
                    "home",
                    dt,
                    true
                );

                updateTeamAI(
                    state.awayPlayers,
                    "away",
                    dt,
                    false
                );

                updateBall(dt);

                if (state.defending) {
                    attemptTackle();
                }

                updateCameraTarget();
            }
        }
    }

    /* ========================================================
       29. INITIALISATION DU MOTEUR PLAYCANVAS
    ======================================================== */

    async function importPlayCanvas() {
        const urls = [
            "https://esm.sh/playcanvas@2.23.2",
            "https://cdn.jsdelivr.net/npm/playcanvas@2.23.2/build/playcanvas.mjs"
        ];

        let lastError = null;

        for (const url of urls) {
            try {
                setLoading(18, "Chargement du moteur PlayCanvas 3D...");

                const module = await import(url);

                if (!module.Application || !module.Entity) {
                    throw new Error("API PlayCanvas incomplète.");
                }

                console.info("[FOBAS] PlayCanvas chargé depuis :", url);

                return module;
            } catch (error) {
                lastError = error;

                console.warn(
                    "[FOBAS] Import PlayCanvas échoué :",
                    url,
                    error
                );
            }
        }

        throw lastError || new Error("Impossible de charger PlayCanvas.");
    }

    async function initializeEngine() {
        const canvas = $("footballCanvas");

        if (!canvas) {
            throw new Error("Le canvas #footballCanvas est introuvable.");
        }

        state.pc = await importPlayCanvas();

        setLoading(38, "Création de l'application 3D...");

        const pc = state.pc;

        state.app = new pc.Application(canvas, {
            graphicsDeviceOptions: {
                antialias: true,
                alpha: false,
                preserveDrawingBuffer: false,
                powerPreference: "high-performance"
            }
        });

        if (typeof state.app.setCanvasFillMode === "function" && pc.FILLMODE_FILL_WINDOW) {
            state.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        }

        if (typeof state.app.setCanvasResolution === "function" && pc.RESOLUTION_AUTO) {
            state.app.setCanvasResolution(pc.RESOLUTION_AUTO);
        }

        try {
            state.app.graphicsDevice.maxPixelRatio =
                Math.min(window.devicePixelRatio || 1, 1.4);
        } catch (_) {}

        state.sceneRoot = new pc.Entity("FOBAS Football World");
        state.app.root.addChild(state.sceneRoot);

        setLoading(52, "Construction du terrain de football...");

        createLight(
            "Main Directional Light",
            "directional",
            [0, 35, 0],
            [1, 0.96, 0.86],
            1.6
        );

        createLight(
            "Ambient Fill Light",
            "omni",
            [0, 15, 0],
            [0.62, 0.72, 1],
            0.7
        );

        createField();

        setLoading(66, "Création de la caméra et des joueurs...");

        createCamera();

        generateTeams();
        refreshTeamSelectors();

        state.selectedHome = state.teams.some(
            team => team.id === "mare-rouge"
        )
            ? "mare-rouge"
            : state.teams[0].id;

        state.selectedAway =
            selectAutomaticOpponent(state.selectedHome)?.id ||
            state.teams[1]?.id;

        refreshTeamSelectors();

        createPlayers();
        createBall();

        setLoading(82, "Préparation des commandes et des compétitions...");

        state.app.on("update", updateGame);

        state.app.start();

        resizeCanvas();

        setLoading(92, "Chargement du profil et de la progression...");

        try {
            state.db = await openDatabase();
            console.info("[FOBAS] IndexedDB prête.");
        } catch (error) {
            state.db = null;
            console.warn(
                "[FOBAS] Utilisation de la sauvegarde secondaire :",
                error
            );
        }

        await loadAll();

        // Restaurer une équipe valide et choisir un adversaire différent.
        if (!state.teams.some(team => team.id === state.selectedHome)) {
            state.selectedHome = "mare-rouge";
        }

        if (
            !state.teams.some(team => team.id === state.selectedAway) ||
            state.selectedHome === state.selectedAway
        ) {
            state.selectedAway =
                selectAutomaticOpponent(state.selectedHome)?.id ||
                state.teams[1]?.id;
        }

        refreshTeamSelectors();

        state.selectedAway = $("awayTeamSelect")?.value ||
            state.selectedAway;

        createPlayers();
        createBall();
        resetKickoff("home");

        attachEvents();

        renderChampionships();
        renderTournaments();
        renderTeams();
        renderEquipment();

        updateProfileUI();
        updateSettingsUI();
        updateTacticsUI();
        updateScoreboard();

        if (state.autoSaveTimer) {
            clearInterval(state.autoSaveTimer);
        }

        state.autoSaveTimer = setInterval(() => {
            saveAll(true);
        }, 10 * 60 * 1000);

        setLoading(100, "Jeu prêt !");

        setEngineStatus("PlayCanvas 3D prêt — 22 joueurs disponibles.");

        const loadingScreen = $("loadingScreen");

        if (loadingScreen) {
            loadingScreen.classList.add("hidden");
        }

        showScreen("mainMenu");

        setSaveStatus(
            state.db
                ? "Sauvegarde IndexedDB prête"
                : "Sauvegarde locale secondaire prête"
        );

        console.info("[FOBAS FOOTBALL] Initialisation terminée.");

        playSound(520, 0.08);
    }

    /* ========================================================
       30. GESTION DES ERREURS GLOBALES
    ======================================================== */

    window.addEventListener("error", event => {
        console.error(
            "[FOBAS FOOTBALL] Erreur JavaScript :",
            event.message,
            event.filename,
            event.lineno
        );

        if (!state.app && !state.loadingFailed) {
            setEngineStatus("Erreur JavaScript. Consultez la console.");
        }
    });

    window.addEventListener("unhandledrejection", event => {
        console.error(
            "[FOBAS FOOTBALL] Promesse rejetée :",
            event.reason
        );
    });

    /* ========================================================
       31. DÉMARRAGE
    ======================================================== */

    async function boot() {
        if (state.booting) return;

        state.booting = true;

        setLoading(2, "JavaScript chargé...");

        try {
            await initializeEngine();
        } catch (error) {
            console.error("[FOBAS FOOTBALL] Démarrage impossible :", error);

            showLoadingError(
                "Le moteur 3D n'a pas pu démarrer. Vérifiez votre connexion, puis réessayez."
            );

            const status = $("engineStatus");

            if (status) {
                status.textContent =
                    error && error.message
                        ? error.message
                        : "Erreur inconnue du moteur 3D.";
            }

            state.booting = false;
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }

})();
