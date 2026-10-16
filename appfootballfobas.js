/* ================================================================
   FOBAS FOOTBALL ULTIMATE 3D
   JavaScript principal — Version 1.0.0
   Moteur : PlayCanvas 2.23.2
   Fichier racine : appfootballfobas.js

   Fonctionnalités :
   - Chargement dynamique de PlayCanvas
   - Terrain 3D, buts, lignes et tribunes
   - 22 joueurs sur le terrain + remplaçants
   - Joueurs 3D avec maillots numérotés
   - Caméra rapprochée suivant le joueur actif
   - Zoom multitouch à deux doigts sur Android
   - Joystick tactile, passe, tir, sprint et défense
   - Intelligence artificielle des deux équipes
   - Score, chronomètre, événements et arbitre
   - Équipes dynamiques, compétitions et tournois
   - IndexedDB avec sauvegarde automatique
   - Repli localStorage en cas d'indisponibilité
   - Interface compatible avec les identifiants HTML fournis
================================================================ */

(() => {
    "use strict";

    if (window.__FOBAS_FOOTBALL_INITIALIZED__) {
        return;
    }

    window.__FOBAS_FOOTBALL_INITIALIZED__ = true;

    const CONFIG = window.FOBAS_FOOTBALL_CONFIG || {};

    const DB_NAME = CONFIG.databaseName || "FOBAS_FOOTBALL_ULTIMATE_DB";
    const DB_VERSION = CONFIG.databaseVersion || 1;
    const ENGINE_VERSION = CONFIG.engineVersion || "2.23.2";

    const $ = (id) => document.getElementById(id);

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const lerp = (a, b, t) => a + (b - a) * t;

    const distance2D = (a, b) =>
        Math.hypot(a.x - b.x, a.z - b.z);

    const random = (min, max) =>
        min + Math.random() * (max - min);

    const safeText = (value) =>
        String(value ?? "").replace(/[<>]/g, "");

    const $all = (selector) =>
        Array.from(document.querySelectorAll(selector));

    const DOM = {
        loadingScreen: $("loadingScreen"),
        loadingMessage: $("loadingMessage"),
        loadingProgressTrack: $("loadingProgressTrack"),
        loadingProgressBar: $("loadingProgressBar"),
        loadingPercent: $("loadingPercent"),
        retryLoadingBtn: $("retryLoadingBtn"),

        topHeader: $("topHeader"),
        soundToggleBtn: $("soundToggleBtn"),
        pauseGameBtn: $("pauseGameBtn"),
        openSettingsBtn: $("openSettingsBtn"),

        mainMenu: $("mainMenu"),
        playMatchBtn: $("playMatchBtn"),
        continueCareerBtn: $("continueCareerBtn"),
        championshipsBtn: $("championshipsBtn"),
        tournamentsBtn: $("tournamentsBtn"),
        teamsBtn: $("teamsBtn"),
        equipmentBtn: $("equipmentBtn"),
        profileBtn: $("profileBtn"),
        howToPlayBtn: $("howToPlayBtn"),

        matchScreen: $("matchScreen"),
        competitionLabel: $("competitionLabel"),
        stadiumLabel: $("stadiumLabel"),
        homeTeamName: $("homeTeamName"),
        homeScore: $("homeScore"),
        matchClock: $("matchClock"),
        matchPeriod: $("matchPeriod"),
        awayScore: $("awayScore"),
        awayTeamName: $("awayTeamName"),

        pitchViewport: $("pitchViewport"),
        footballCanvas: $("footballCanvas"),
        engineStatus: $("engineStatus"),
        matchAnnouncement: $("matchAnnouncement"),
        announcementTitle: $("announcementTitle"),
        announcementMessage: $("announcementMessage"),
        refereeDecisionLabel: $("refereeDecisionLabel"),

        cameraZoomOutBtn: $("cameraZoomOutBtn"),
        cameraResetBtn: $("cameraResetBtn"),
        cameraZoomInBtn: $("cameraZoomInBtn"),

        movementJoystick: $("movementJoystick"),
        joystickBase: $("joystickBase"),
        joystickKnob: $("joystickKnob"),

        passBtn: $("passBtn"),
        shootBtn: $("shootBtn"),
        sprintBtn: $("sprintBtn"),
        defendBtn: $("defendBtn"),
        switchPlayerBtn: $("switchPlayerBtn"),
        changeCameraBtn: $("changeCameraBtn"),
        showTacticsBtn: $("showTacticsBtn"),
        saveMatchBtn: $("saveMatchBtn"),
        exitMatchBtn: $("exitMatchBtn"),

        matchSetupScreen: $("matchSetupScreen"),
        competitionSelect: $("competitionSelect"),
        homeTeamSelect: $("homeTeamSelect"),
        awayTeamSelect: $("awayTeamSelect"),
        stadiumSelect: $("stadiumSelect"),
        matchDurationSelect: $("matchDurationSelect"),
        confirmMatchBtn: $("confirmMatchBtn"),

        championshipScreen: $("championshipScreen"),
        competitionLevelsList: $("competitionLevelsList"),
        startChampionshipBtn: $("startChampionshipBtn"),

        tournamentScreen: $("tournamentScreen"),
        tournamentList: $("tournamentList"),
        createTournamentBtn: $("createTournamentBtn"),

        teamsScreen: $("teamsScreen"),
        teamSearchInput: $("teamSearchInput"),
        teamRegionSelect: $("teamRegionSelect"),
        teamsList: $("teamsList"),
        teamCountLabel: $("teamCountLabel"),
        refreshTeamsBtn: $("refreshTeamsBtn"),

        equipmentScreen: $("equipmentScreen"),
        equipmentItemsList: $("equipmentItemsList"),
        applyEquipmentBtn: $("applyEquipmentBtn"),

        profileScreen: $("profileScreen"),
        profileNameInput: $("profileNameInput"),
        profileFavoriteTeam: $("profileFavoriteTeam"),
        profileMatchesPlayed: $("profileMatchesPlayed"),
        profileGoalsScored: $("profileGoalsScored"),
        profileTrophies: $("profileTrophies"),
        saveProfileBtn: $("saveProfileBtn"),

        settingsScreen: $("settingsScreen"),
        graphicsQualitySelect: $("graphicsQualitySelect"),
        soundVolumeInput: $("soundVolumeInput"),
        cameraSensitivityInput: $("cameraSensitivityInput"),
        matchDifficultySelect: $("matchDifficultySelect"),
        vibrationToggle: $("vibrationToggle"),
        commentaryToggle: $("commentaryToggle"),
        saveSettingsBtn: $("saveSettingsBtn"),

        dialogOverlay: $("dialogOverlay"),
        dialogTitle: $("dialogTitle"),
        closeDialogBtn: $("closeDialogBtn"),
        dialogContent: $("dialogContent"),
        dialogActions: $("dialogActions"),

        toastContainer: $("toastContainer"),

        pauseOverlay: $("pauseOverlay"),
        resumeGameBtn: $("resumeGameBtn"),
        savePausedMatchBtn: $("savePausedMatchBtn"),
        quitPausedMatchBtn: $("quitPausedMatchBtn"),

        tacticsOverlay: $("tacticsOverlay"),
        closeTacticsBtn: $("closeTacticsBtn"),
        formationSelect: $("formationSelect"),
        tacticalStyleSelect: $("tacticalStyleSelect"),
        pressureSelect: $("pressureSelect"),
        applyTacticsBtn: $("applyTacticsBtn"),

        saveStatusLabel: $("saveStatusLabel")
    };

    const STATE = {
        pc: null,
        app: null,
        camera: null,
        cameraEntity: null,
        sceneRoot: null,
        playerRoot: null,
        ballEntity: null,
        ballMaterial: null,
        materials: {},
        teams: [],
        players: [],
        homePlayers: [],
        awayPlayers: [],
        substitutes: [],
        selectedPlayer: null,
        homeTeam: null,
        awayTeam: null,
        ball: {
            x: 0,
            z: 0,
            vx: 0,
            vz: 0,
            y: 0.22,
            vy: 0,
            owner: null,
            lastTouchTeam: "home"
        },
        score: {
            home: 0,
            away: 0
        },
        match: {
            active: false,
            paused: false,
            finished: false,
            elapsed: 0,
            duration: 90 * 60,
            half: 1,
            lastGoalTime: -100,
            lastAIAction: 0,
            lastRefereeEvent: 0,
            possessionHome: true,
            competition: "local",
            stadium: "home"
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
            commentary: true,
            sound: true
        },
        cameraState: {
            zoom: 19,
            minZoom: 10,
            maxZoom: 36,
            defaultZoom: 19,
            mode: 0,
            targetX: 0,
            targetZ: 0,
            pitch: 40,
            yaw: 0
        },
        joystick: {
            x: 0,
            y: 0,
            active: false,
            pointerId: null
        },
        input: {
            sprint: false,
            defend: false
        },
        equipment: {
            tab: "kits",
            selected: null,
            kits: [
                { id: "royal", name: "Maillot Royal", color: "#1f5eff" },
                { id: "red", name: "Maillot Rouge", color: "#e33445" },
                { id: "green", name: "Maillot Vert", color: "#138f54" },
                { id: "gold", name: "Maillot Or", color: "#d4a62b" },
                { id: "black", name: "Maillot Noir", color: "#202735" }
            ],
            balls: [
                { id: "classic", name: "Ballon classique", color: "#f5f5f5" },
                { id: "gold", name: "Ballon doré", color: "#d7ad32" },
                { id: "ocean", name: "Ballon océan", color: "#36a9e1" },
                { id: "fire", name: "Ballon feu", color: "#ed5a24" }
            ],
            boots: [
                { id: "speed", name: "Chaussures Speed", color: "#e4eaf5" },
                { id: "pro", name: "Chaussures Pro", color: "#ef453f" },
                { id: "elite", name: "Chaussures Elite", color: "#e3bd38" }
            ]
        },
        tactics: {
            formation: "433",
            style: "balanced",
            pressure: "medium"
        },
        db: null,
        saveTimer: null,
        lastFrame: 0,
        frameAccumulator: 0,
        audioContext: null,
        masterGain: null,
        initialized: false,
        selectedCompetitionLevel: "local",
        activeEquipmentTab: "kits",
        tournamentCounter: 0,
        cameraTouch: {
            points: new Map(),
            initialDistance: 0,
            initialZoom: 19,
            pinching: false
        },
        career: {
            level: 0,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0
        }
    };

    const COMPETITIONS = Array.isArray(CONFIG.competitionLevels)
        ? CONFIG.competitionLevels
        : [
            { id: "local", name: "Matchs locaux" },
            { id: "communal", name: "Championnats communaux" },
            { id: "northwest", name: "Championnat du Nord-Ouest" },
            { id: "haiti-national", name: "Championnat national" },
            { id: "caribbean", name: "Tournoi des Caraïbes" },
            { id: "international", name: "Ligues internationales" },
            { id: "champions", name: "Tournoi des champions" }
        ];

    const PLAYER_NAMES = Array.isArray(CONFIG.playerNames)
        ? CONFIG.playerNames
        : ["Ranise", "MEME", "Kerlande", "Junior", "Nina", "Ricardo"];

    const REGIONS = {
        northwest: [
            "Môle-Saint-Nicolas", "Mare-Rouge", "Jean-Rabel",
            "Bombardopolis", "Baie-de-Henne", "Port-de-Paix",
            "La Tortue", "Bassin-Bleu", "Chansolme",
            "Saint-Louis-du-Nord", "Anse-à-Foleur"
        ],
        haiti: [
            "Cap-Haïtien", "Fort-Liberté", "Ouanaminthe",
            "Gonaïves", "Saint-Marc", "Hinche", "Mirebalais",
            "Port-au-Prince", "Pétion-Ville", "Léogâne",
            "Jacmel", "Les Cayes", "Jérémie", "Miragoâne",
            "Anse-à-Veau", "Petit-Goâve", "Kenscoff",
            "Croix-des-Bouquets", "Delmas", "Tabarre",
            "Carrefour", "Cité Soleil", "Verrettes", "Dessalines",
            "Limbé", "Limonade", "Trou-du-Nord", "Aquin",
            "Cavaillon", "Torbeck", "Port-Salut", "Dame-Marie"
        ],
        caribbean: [
            "Santo Domingo", "Santiago de los Caballeros",
            "Kingston", "Montego Bay", "Nassau", "Bridgetown",
            "Castries", "Roseau", "Saint George's",
            "Port of Spain", "Willemstad", "Oranjestad",
            "San Juan", "Fort-de-France", "Pointe-à-Pitre",
            "Basseterre", "Saint John's", "Road Town"
        ],
        americas: [
            "New York", "Miami", "Los Angeles", "Toronto",
            "Montréal", "Mexico City", "Guadalajara",
            "São Paulo", "Rio de Janeiro", "Buenos Aires",
            "Bogotá", "Medellín", "Lima", "Quito",
            "Santiago", "Caracas", "Panama City", "San José"
        ],
        europe: [
            "Paris", "Madrid", "Barcelona", "Londres",
            "Manchester", "Liverpool", "Rome", "Milan",
            "Lisbonne", "Amsterdam", "Berlin", "Munich",
            "Bruxelles", "Marseille", "Lyon", "Monaco"
        ],
        africa: [
            "Dakar", "Abidjan", "Accra", "Lagos", "Yaoundé",
            "Douala", "Casablanca", "Rabat", "Le Caire",
            "Tunis", "Alger", "Johannesburg", "Nairobi",
            "Kigali", "Lomé", "Cotonou"
        ],
        international: [
            "Tokyo", "Séoul", "Pékin", "Sydney",
            "Melbourne", "Doha", "Dubaï", "Riyad",
            "Istanbul", "Ankara", "Athènes", "Zurich"
        ]
    };

    const TEAM_COLORS = [
        "#1769e0", "#e43e4d", "#13a66b", "#e3a52b",
        "#8a45d8", "#12a6b5", "#ed702b", "#313a4b",
        "#dd4c98", "#609c3b", "#5d65e8", "#a16a42"
    ];

    /* ============================================================
       OUTILS DOM
    ============================================================ */

    function setLoading(percent, message) {
        const value = clamp(Math.round(percent), 0, 100);

        if (DOM.loadingMessage) {
            DOM.loadingMessage.textContent = message || "Chargement...";
        }

        if (DOM.loadingProgressBar) {
            DOM.loadingProgressBar.style.width = value + "%";
        }

        if (DOM.loadingPercent) {
            DOM.loadingPercent.textContent = value + " %";
        }

        if (DOM.loadingProgressTrack) {
            DOM.loadingProgressTrack.setAttribute("aria-valuenow", String(value));
        }
    }

    function hideLoading() {
        if (DOM.loadingScreen) {
            DOM.loadingScreen.classList.add("hidden");
        }
    }

    function showLoadingError(error) {
        console.error("[FOBAS FOOTBALL] Chargement impossible :", error);

        setLoading(100, "Impossible de charger le moteur 3D.");

        if (DOM.retryLoadingBtn) {
            DOM.retryLoadingBtn.classList.remove("hidden");
        }

        if (DOM.engineStatus) {
            DOM.engineStatus.textContent =
                "Erreur moteur 3D. Vérifiez Internet puis réessayez.";
        }

        toast("Le moteur 3D n'a pas pu être chargé. Vérifiez votre connexion.");
    }

    function toast(message, duration = 3000) {
        if (!DOM.toastContainer) {
            console.info("[FOBAS]", message);
            return;
        }

        const item = document.createElement("div");
        item.className = "toast-message";
        item.textContent = message;

        DOM.toastContainer.appendChild(item);

        window.setTimeout(() => {
            item.classList.add("toast-leaving");
            window.setTimeout(() => item.remove(), 350);
        }, duration);
    }

    function announce(title, message, duration = 3600) {
        if (!DOM.matchAnnouncement) return;

        if (DOM.announcementTitle) {
            DOM.announcementTitle.textContent = title || "";
        }

        if (DOM.announcementMessage) {
            DOM.announcementMessage.textContent = message || "";
        }

        DOM.matchAnnouncement.classList.remove("hidden");

        window.clearTimeout(announce._timer);

        announce._timer = window.setTimeout(() => {
            DOM.matchAnnouncement?.classList.add("hidden");
        }, duration);
    }

    function setRefereeDecision(message) {
        if (DOM.refereeDecisionLabel) {
            DOM.refereeDecisionLabel.textContent = message;
        }
    }

    function showScreen(screenId) {
        const screenIds = [
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

        screenIds.forEach((id) => {
            const node = $(id);
            if (node) {
                node.classList.toggle("hidden", id !== screenId);
                node.classList.toggle("active", id === screenId);
            }
        });

        if (DOM.topHeader) {
            DOM.topHeader.classList.toggle("hidden", screenId === "mainMenu");
        }

        if (screenId === "matchScreen") {
            resizeCanvas();
            requestAnimationFrame(resizeCanvas);
        }

        window.scrollTo({ top: 0, behavior: "instant" });
    }

    function showDialog(title, content, actions = []) {
        if (!DOM.dialogOverlay) return;

        DOM.dialogTitle.textContent = title;
        DOM.dialogContent.innerHTML = content;

        DOM.dialogActions.innerHTML = "";

        actions.forEach((action) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = action.className || "ui-button button-primary";
            button.textContent = action.label;

            button.addEventListener("click", () => {
                if (typeof action.onClick === "function") {
                    action.onClick();
                }
            });

            DOM.dialogActions.appendChild(button);
        });

        DOM.dialogOverlay.classList.remove("hidden");
    }

    function closeDialog() {
        DOM.dialogOverlay?.classList.add("hidden");
    }

    function bind(id, event, handler, options) {
        const node = $(id);
        if (!node) return;

        node.addEventListener(event, handler, options);
    }

    /* ============================================================
       BASE DE DONNÉES : INDEXEDDB + LOCALSTORAGE
    ============================================================ */

    function openDatabase() {
        return new Promise((resolve) => {
            if (!("indexedDB" in window)) {
                resolve(null);
                return;
            }

            let request;

            try {
                request = indexedDB.open(DB_NAME, DB_VERSION);
            } catch (error) {
                console.warn("IndexedDB indisponible :", error);
                resolve(null);
                return;
            }

            request.onupgradeneeded = () => {
                const db = request.result;

                if (!db.objectStoreNames.contains("saves")) {
                    db.createObjectStore("saves", { keyPath: "key" });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
            request.onblocked = () => resolve(null);
        });
    }

    function dbRead(key) {
        return new Promise((resolve) => {
            if (!STATE.db) {
                try {
                    resolve(JSON.parse(localStorage.getItem("FOBAS_FOOTBALL_" + key)));
                } catch {
                    resolve(null);
                }
                return;
            }

            try {
                const transaction = STATE.db.transaction(["saves"], "readonly");
                const request = transaction.objectStore("saves").get(key);

                request.onsuccess = () => resolve(request.result?.value ?? null);
                request.onerror = () => resolve(null);
            } catch {
                resolve(null);
            }
        });
    }

    function dbWrite(key, value) {
        return new Promise((resolve) => {
            let fallbackWorked = false;

            try {
                localStorage.setItem(
                    "FOBAS_FOOTBALL_" + key,
                    JSON.stringify(value)
                );
                fallbackWorked = true;
            } catch (error) {
                console.warn("localStorage indisponible :", error);
            }

            if (!STATE.db) {
                resolve(fallbackWorked);
                return;
            }

            try {
                const transaction = STATE.db.transaction(["saves"], "readwrite");

                transaction.objectStore("saves").put({
                    key,
                    value,
                    updatedAt: Date.now()
                });

                transaction.oncomplete = () => resolve(true);
                transaction.onerror = () => resolve(fallbackWorked);
                transaction.onabort = () => resolve(fallbackWorked);
            } catch {
                resolve(fallbackWorked);
            }
        });
    }

    function collectSaveData() {
        return {
            version: CONFIG.version || "1.0.0",
            savedAt: Date.now(),

            profile: { ...STATE.profile },
            settings: { ...STATE.settings },
            career: { ...STATE.career },
            tactics: { ...STATE.tactics },

            equipment: {
                tab: STATE.equipment.tab,
                selected: STATE.equipment.selected
            },

            match: {
                active: STATE.match.active,
                paused: STATE.match.paused,
                finished: STATE.match.finished,
                elapsed: STATE.match.elapsed,
                duration: STATE.match.duration,
                half: STATE.match.half,
                competition: STATE.match.competition,
                stadium: STATE.match.stadium,
                score: { ...STATE.score },
                homeTeamId: STATE.homeTeam?.id || null,
                awayTeamId: STATE.awayTeam?.id || null,
                ball: {
                    x: STATE.ball.x,
                    z: STATE.ball.z,
                    vx: STATE.ball.vx,
                    vz: STATE.ball.vz
                }
            }
        };
    }

    async function saveGame(showMessage = true) {
        const data = collectSaveData();

        const ok = await dbWrite("main", data);

        if (DOM.saveStatusLabel) {
            DOM.saveStatusLabel.textContent = ok
                ? "Sauvegarde : " + new Date().toLocaleTimeString("fr-FR")
                : "Sauvegarde locale indisponible";
        }

        if (showMessage) {
            toast(ok ? "Progression sauvegardée." : "Échec de la sauvegarde.");
        }

        return ok;
    }

    async function loadGame() {
        const data = await dbRead("main");
        if (!data) return;

        if (data.profile) {
            STATE.profile = { ...STATE.profile, ...data.profile };
        }

        if (data.settings) {
            STATE.settings = { ...STATE.settings, ...data.settings };
        }

        if (data.career) {
            STATE.career = { ...STATE.career, ...data.career };
        }

        if (data.tactics) {
            STATE.tactics = { ...STATE.tactics, ...data.tactics };
        }

        if (data.equipment) {
            Object.assign(STATE.equipment, data.equipment);
        }

        if (data.match) {
            STATE.match.elapsed = Number(data.match.elapsed) || 0;
            STATE.match.duration = Number(data.match.duration) || 90 * 60;
            STATE.match.half = Number(data.match.half) || 1;
            STATE.match.competition = data.match.competition || "local";
            STATE.match.stadium = data.match.stadium || "home";

            if (data.match.score) {
                STATE.score = {
                    home: Number(data.match.score.home) || 0,
                    away: Number(data.match.score.away) || 0
                };
            }
        }

        applySettingsToUI();
        updateProfileUI();
    }

    function startAutosave() {
        if (STATE.saveTimer) {
            clearInterval(STATE.saveTimer);
        }

        STATE.saveTimer = window.setInterval(() => {
            saveGame(false);
        }, 10 * 60 * 1000);
    }

    /* ============================================================
       GÉNÉRATION DES ÉQUIPES
    ============================================================ */

    function slugify(text) {
        return String(text)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function makeTeam(name, region, regionType, index) {
        const color = TEAM_COLORS[index % TEAM_COLORS.length];

        return {
            id: slugify(name) + "-" + slugify(region),
            name,
            region,
            regionType,
            color,
            strength: Math.round(random(68, 96)),
            rating: Math.round(random(850, 2100)),
            wins: 0,
            draws: 0,
            losses: 0,
            played: 0,
            goalsFor: 0,
            goalsAgainst: 0
        };
    }

    function buildTeams() {
        const result = [];
        const seen = new Set();

        const add = (name, region, regionType) => {
            const id = slugify(name) + "-" + slugify(region);

            if (seen.has(id)) return;

            seen.add(id);

            result.push(makeTeam(
                name,
                region,
                regionType,
                result.length
            ));
        };

        REGIONS.northwest.forEach((region) => {
            add(region + " FC", region, "northwest");
            add("FOBAS " + region, region, "northwest");
        });

        REGIONS.haiti.forEach((region) => {
            add(region + " FC", region, "haiti");
            add("Étoile de " + region, region, "haiti");
        });

        REGIONS.caribbean.forEach((region) => {
            add(region + " United", region, "caribbean");
        });

        REGIONS.americas.forEach((region) => {
            add(region + " FC", region, "americas");
        });

        REGIONS.europe.forEach((region) => {
            add(region + " Athletic", region, "europe");
        });

        REGIONS.africa.forEach((region) => {
            add(region + " Stars", region, "africa");
        });

        REGIONS.international.forEach((region) => {
            add(region + " Sporting", region, "international");
        });

        [
            "FOBAS Legends",
            "Master Stars",
            "FOBAS Elite",
            "Selvandieu FC",
            "Ranise United",
            "Kerlande Sporting",
            "Haiti Champions",
            "Nord-Ouest All Stars"
        ].forEach((name) => {
            add(name, "FOBAS", "northwest");
        });

        while (result.length < Math.max(100, Number(CONFIG.initialTeamCount) || 100)) {
            const n = result.length + 1;
            add("FOBAS Club " + String(n).padStart(3, "0"), "International", "international");
        }

        STATE.teams = result;

        return result;
    }

    function findTeamById(id) {
        return STATE.teams.find((team) => team.id === id) ||
            STATE.teams.find((team) => slugify(team.region) === id) ||
            STATE.teams[0];
    }

    function teamBySelectValue(value) {
        const normalized = slugify(value);

        return STATE.teams.find((team) =>
            team.id.includes(normalized) ||
            slugify(team.region) === normalized ||
            team.id === normalized
        ) || STATE.teams.find((team) => team.region === value) ||
            STATE.teams[0];
    }

    function populateTeamSelect(select, preferredId) {
        if (!select) return;

        const previous = preferredId || select.value;

        select.innerHTML = "";

        STATE.teams.forEach((team) => {
            const option = document.createElement("option");

            option.value = team.id;
            option.textContent = team.name + " — " + team.region;

            select.appendChild(option);
        });

        const match = STATE.teams.find((team) => team.id === previous);

        if (match) {
            select.value = match.id;
        }
    }

    function renderTeamsList() {
        if (!DOM.teamsList) return;

        const query = (DOM.teamSearchInput?.value || "")
            .trim()
            .toLocaleLowerCase("fr");

        const region = DOM.teamRegionSelect?.value || "all";

        const filtered = STATE.teams.filter((team) => {
            const matchesQuery =
                team.name.toLocaleLowerCase("fr").includes(query) ||
                team.region.toLocaleLowerCase("fr").includes(query);

            const matchesRegion =
                region === "all" ||
                team.regionType === region ||
                (region === "international" &&
                    ["europe", "africa", "international"].includes(team.regionType));

            return matchesQuery && matchesRegion;
        });

        DOM.teamsList.innerHTML = "";

        filtered.forEach((team) => {
            const card = document.createElement("article");
            card.className = "team-card";

            card.innerHTML = `
                <span class="team-card-color"
                      style="background:${team.color}"></span>
                <div class="team-card-info">
                    <strong>${safeText(team.name)}</strong>
                    <small>${safeText(team.region)} · Niveau ${team.strength}</small>
                </div>
                <button type="button" class="ui-button button-secondary"
                        data-select-team="${safeText(team.id)}">
                    CHOISIR
                </button>
            `;

            DOM.teamsList.appendChild(card);
        });

        if (DOM.teamCountLabel) {
            DOM.teamCountLabel.textContent =
                filtered.length + " équipe(s) affichée(s) / " +
                STATE.teams.length + " disponibles";
        }
    }

    /* ============================================================
       PLAYCANVAS : MATÉRIAUX ET OBJETS 3D
    ============================================================ */

    function makeMaterial(color, options = {}) {
        const pc = STATE.pc;
        const material = new pc.StandardMaterial();

        const parsed = color || "#ffffff";
        const hex = parsed.startsWith("#") ? parsed.slice(1) : parsed;
        const numeric = parseInt(hex, 16);

        material.diffuse = new pc.Color(
            ((numeric >> 16) & 255) / 255,
            ((numeric >> 8) & 255) / 255,
            (numeric & 255) / 255
        );

        if (options.emissive) {
            material.emissive = material.diffuse.clone();
        }

        if (options.metalness !== undefined) {
            material.metalness = options.metalness;
        }

        if (options.gloss !== undefined) {
            material.shininess = options.gloss;
        }

        material.update();

        return material;
    }

    function createMaterials() {
        STATE.materials = {
            grass: makeMaterial("#2c8b42"),
            grassLight: makeMaterial("#34984a"),
            line: makeMaterial("#f4f5ef"),
            goal: makeMaterial("#e8edf2", { metalness: 0.2 }),
            ball: makeMaterial("#f7f7f1"),
            ballPatch: makeMaterial("#22252b"),
            skin: makeMaterial("#8f5d3e"),
            hair: makeMaterial("#171515"),
            shorts: makeMaterial("#192536"),
            socks: makeMaterial("#e9edf5"),
            shoes: makeMaterial("#f4c542"),
            stadium: makeMaterial("#303a4b"),
            seatA: makeMaterial("#263e5c"),
            seatB: makeMaterial("#c53c48"),
            shadow: makeMaterial("#245d30")
        };
    }

    function addRenderEntity(parent, name, type, material, position, scale) {
        const pc = STATE.pc;
        const entity = new pc.Entity(name);

        entity.addComponent("render", {
            type,
            material
        });

        if (position) {
            entity.setLocalPosition(position.x, position.y, position.z);
        }

        if (scale) {
            entity.setLocalScale(scale.x, scale.y, scale.z);
        }

        parent.addChild(entity);

        return entity;
    }

    function addBox(parent, name, material, x, y, z, sx, sy, sz) {
        return addRenderEntity(
            parent,
            name,
            "box",
            material,
            { x, y, z },
            { x: sx, y: sy, z: sz }
        );
    }

    function addSphere(parent, name, material, x, y, z, sx, sy, sz) {
        return addRenderEntity(
            parent,
            name,
            "sphere",
            material,
            { x, y, z },
            { x: sx, y: sy, z: sz }
        );
    }

    function addCylinder(parent, name, material, x, y, z, sx, sy, sz) {
        return addRenderEntity(
            parent,
            name,
            "cylinder",
            material,
            { x, y, z },
            { x: sx, y: sy, z: sz }
        );
    }

    function buildField() {
        const pc = STATE.pc;

        STATE.sceneRoot = new pc.Entity("FOBAS_SCENE_ROOT");
        STATE.app.root.addChild(STATE.sceneRoot);

        STATE.playerRoot = new pc.Entity("FOOTBALL_PLAYERS_ROOT");
        STATE.sceneRoot.addChild(STATE.playerRoot);

        addBox(
            STATE.sceneRoot,
            "Terrain principal",
            STATE.materials.grass,
            0, -0.18, 0,
            72, 0.35, 112
        );

        const fieldWidth = 54;
        const fieldLength = 94;
        const lineWidth = 0.12;

        // Bandes de pelouse.
        for (let i = 0; i < 14; i++) {
            const z = -fieldLength / 2 + (i + 0.5) * (fieldLength / 14);

            addBox(
                STATE.sceneRoot,
                "Bande de pelouse " + i,
                i % 2 ? STATE.materials.grassLight : STATE.materials.grass,
                0, 0.005, z,
                fieldWidth, 0.015, fieldLength / 14
            );
        }

        // Lignes principales.
        addBox(STATE.sceneRoot, "Ligne gauche", STATE.materials.line,
            -fieldWidth / 2, 0.025, 0, lineWidth, 0.025, fieldLength);

        addBox(STATE.sceneRoot, "Ligne droite", STATE.materials.line,
            fieldWidth / 2, 0.025, 0, lineWidth, 0.025, fieldLength);

        addBox(STATE.sceneRoot, "Ligne de fond nord", STATE.materials.line,
            0, 0.025, -fieldLength / 2, fieldWidth, 0.025, lineWidth);

        addBox(STATE.sceneRoot, "Ligne de fond sud", STATE.materials.line,
            0, 0.025, fieldLength / 2, fieldWidth, 0.025, lineWidth);

        addBox(STATE.sceneRoot, "Ligne médiane", STATE.materials.line,
            0, 0.028, 0, fieldWidth, 0.03, lineWidth);

        // Cercle central approché par de petits segments.
        for (let i = 0; i < 48; i++) {
            const angle = (i / 48) * Math.PI * 2;
            const next = ((i + 1) / 48) * Math.PI * 2;

            const x = Math.cos(angle) * 9.15;
            const z = Math.sin(angle) * 9.15;
            const nx = Math.cos(next) * 9.15;
            const nz = Math.sin(next) * 9.15;

            const cx = (x + nx) / 2;
            const cz = (z + nz) / 2;
            const length = Math.hypot(nx - x, nz - z);
            const angleY = Math.atan2(nx - x, nz - z) * 180 / Math.PI;

            const segment = addBox(
                STATE.sceneRoot,
                "Cercle central " + i,
                STATE.materials.line,
                cx, 0.035, cz,
                0.12, 0.025, length
            );

            segment.setEulerAngles(0, angleY, 0);
        }

        // Surface de réparation.
        [-1, 1].forEach((side) => {
            const goalZ = side * fieldLength / 2;

            addBox(STATE.sceneRoot, "Surface de réparation",
                STATE.materials.line, 0, 0.028,
                goalZ - side * 8,
                40, 0.025, 0.12);

            addBox(STATE.sceneRoot, "Côté surface gauche",
                STATE.materials.line, -20, 0.028,
                goalZ - side * 4,
                0.12, 0.025, 16);

            addBox(STATE.sceneRoot, "Côté surface droit",
                STATE.materials.line, 20, 0.028,
                goalZ - side * 4,
                0.12, 0.025, 16);

            addBox(STATE.sceneRoot, "Petite surface",
                STATE.materials.line, 0, 0.028,
                goalZ - side * 3,
                20, 0.025, 0.12);
        });

        buildGoal(-1);
        buildGoal(1);
        buildStadium();
    }

    function buildGoal(side) {
        const pc = STATE.pc;
        const z = side * 47.1;
        const postHeight = 2.7;
        const halfWidth = 3.8;

        addCylinder(STATE.sceneRoot, "Poteau de but",
            STATE.materials.goal, -halfWidth, postHeight / 2, z,
            0.09, postHeight, 0.09);

        addCylinder(STATE.sceneRoot, "Poteau de but",
            STATE.materials.goal, halfWidth, postHeight / 2, z,
            0.09, postHeight, 0.09);

        addBox(STATE.sceneRoot, "Barre transversale",
            STATE.materials.goal, 0, postHeight, z,
            halfWidth * 2, 0.09, 0.09);

        // Filet stylisé.
        const backZ = z + side * 2.4;

        for (let i = 0; i <= 8; i++) {
            const x = -halfWidth + (i / 8) * halfWidth * 2;

            addBox(STATE.sceneRoot, "Filet vertical",
                STATE.materials.line, x, postHeight / 2, backZ,
                0.035, postHeight, 0.035);
        }

        for (let i = 0; i <= 5; i++) {
            const y = (i / 5) * postHeight;

            addBox(STATE.sceneRoot, "Filet horizontal",
                STATE.materials.line, 0, y, backZ,
                halfWidth * 2, 0.025, 0.025);
        }
    }

    function buildStadium() {
        // Tribunes simplifiées autour du terrain.
        for (let row = 0; row < 4; row++) {
            const zOffset = 58 + row * 2.1;
            const y = 1.1 + row * 0.75;

            addBox(
                STATE.sceneRoot,
                "Tribune nord " + row,
                row % 2 ? STATE.materials.seatA : STATE.materials.seatB,
                0, y, -zOffset,
                68, 1.1, 1.7
            );

            addBox(
                STATE.sceneRoot,
                "Tribune sud " + row,
                row % 2 ? STATE.materials.seatB : STATE.materials.seatA,
                0, y, zOffset,
                68, 1.1, 1.7
            );
        }

        for (let row = 0; row < 4; row++) {
            const xOffset = 37 + row * 2.1;
            const y = 1.1 + row * 0.75;

            addBox(
                STATE.sceneRoot,
                "Tribune ouest " + row,
                row % 2 ? STATE.materials.seatA : STATE.materials.seatB,
                -xOffset, y, 0,
                1.7, 1.1, 100
            );

            addBox(
                STATE.sceneRoot,
                "Tribune est " + row,
                row % 2 ? STATE.materials.seatB : STATE.materials.seatA,
                xOffset, y, 0,
                1.7, 1.1, 100
            );
        }
    }

    /* ============================================================
       JOUEURS 3D AVEC MAILLOT ET NUMÉRO
    ============================================================ */

    function makeNumberTexture(number, teamColor) {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;

        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, 128, 128);

        ctx.fillStyle = teamColor;
        ctx.fillRect(8, 8, 112, 112);

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 6;
        ctx.strokeRect(8, 8, 112, 112);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 76px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(number), 64, 65);

        return canvas;
    }

    function createPlayerNumberMaterial(number, teamColor) {
        const pc = STATE.pc;
        const material = new pc.StandardMaterial();

        const texture = new pc.Texture(STATE.app.graphicsDevice, {
            width: 128,
            height: 128,
            format: pc.PIXELFORMAT_R8_G8_B8_A8
        });

        const ctxCanvas = makeNumberTexture(number, teamColor);

        texture.setSource(ctxCanvas);

        material.diffuseMap = texture;
        material.emissiveMap = texture;
        material.emissive = new pc.Color(0.35, 0.35, 0.35);
        material.opacityMap = texture;
        material.blendType = pc.BLEND_NORMAL;
        material.depthWrite = true;
        material.update();

        return material;
    }

    function createPlayerModel(player) {
        const pc = STATE.pc;

        const root = new pc.Entity(
            "Joueur_" + player.team + "_" + player.number + "_" + player.name
        );

        STATE.playerRoot.addChild(root);

        const jerseyMaterial = makeMaterial(player.teamColor, { gloss: 45 });
        const shortsMaterial = STATE.materials.shorts;
        const skinMaterial = STATE.materials.skin;
        const sockMaterial = STATE.materials.socks;
        const shoeMaterial = STATE.materials.shoes;
        const hairMaterial = STATE.materials.hair;

        // Taille du modèle : suffisamment grande pour une caméra rapprochée.
        const scale = player.role === "GK" ? 1.0 : 1.0;

        root.setLocalScale(scale, scale, scale);

        // Jambes.
        const leftLeg = addCylinder(
            root, "Jambe gauche", shortsMaterial,
            -0.19, 0.57, 0,
            0.15, 0.72, 0.15
        );

        const rightLeg = addCylinder(
            root, "Jambe droite", shortsMaterial,
            0.19, 0.57, 0,
            0.15, 0.72, 0.15
        );

        // Chaussettes.
        addCylinder(root, "Chaussette gauche", sockMaterial,
            -0.19, 0.24, 0.015, 0.13, 0.36, 0.13);

        addCylinder(root, "Chaussette droite", sockMaterial,
            0.19, 0.24, 0.015, 0.13, 0.36, 0.13);

        // Chaussures.
        addBox(root, "Chaussure gauche", shoeMaterial,
            -0.19, 0.06, 0.08, 0.18, 0.11, 0.33);

        addBox(root, "Chaussure droite", shoeMaterial,
            0.19, 0.06, 0.08, 0.18, 0.11, 0.33);

        // Short.
        addBox(root, "Short", shortsMaterial,
            0, 1.0, 0, 0.65, 0.43, 0.37);

        // Torse / maillot.
        const torso = addBox(
            root, "Maillot",
            jerseyMaterial,
            0, 1.55, 0,
            0.79, 0.9, 0.42
        );

        // Épaules et bras.
        addSphere(root, "Épaule gauche", jerseyMaterial,
            -0.46, 1.83, 0, 0.22, 0.22, 0.22);

        addSphere(root, "Épaule droite", jerseyMaterial,
            0.46, 1.83, 0, 0.22, 0.22, 0.22);

        addCylinder(root, "Bras gauche", skinMaterial,
            -0.54, 1.48, 0,
            0.12, 0.55, 0.12);

        addCylinder(root, "Bras droit", skinMaterial,
            0.54, 1.48, 0,
            0.12, 0.55, 0.12);

        // Cou et tête.
        addCylinder(root, "Cou", skinMaterial,
            0, 2.08, 0, 0.13, 0.22, 0.13);

        addSphere(root, "Tête", skinMaterial,
            0, 2.35, 0, 0.29, 0.34, 0.29);

        addSphere(root, "Cheveux", hairMaterial,
            0, 2.51, -0.025, 0.295, 0.19, 0.295);

        // Numéro sur le dos, visible de la caméra arrière.
        const numberMaterial = createPlayerNumberMaterial(
            player.number,
            player.teamColor
        );

        addBox(
            root,
            "Numéro maillot",
            numberMaterial,
            0, 1.62, -0.218,
            0.39, 0.42, 0.025
        );

        // Numéro de poitrine.
        addBox(
            root,
            "Numéro poitrine",
            numberMaterial,
            0, 1.58, 0.218,
            0.28, 0.32, 0.025
        );

        // Gardien distinctif.
        if (player.role === "GK") {
            const gloves = makeMaterial("#f4d64b");

            addSphere(root, "Gant gauche", gloves,
                -0.58, 1.2, 0.02, 0.14, 0.13, 0.14);

            addSphere(root, "Gant droit", gloves,
                0.58, 1.2, 0.02, 0.14, 0.13, 0.14);
        }

        player.entity = root;
        player.jerseyMaterial = jerseyMaterial;
        player.parts = {
            leftLeg,
            rightLeg,
            torso
        };

        return root;
    }

    const FORMATIONS = {
        "433": [
            [0, -43], [-19, -31], [-7, -33], [7, -33], [19, -31],
            [-15, -15], [0, -17], [15, -15],
            [-18, -2], [0, -5], [18, -2]
        ],
        "442": [
            [0, -43], [-20, -31], [-7, -33], [7, -33], [20, -31],
            [-19, -16], [-6, -16], [6, -16], [19, -16],
            [-8, -2], [8, -2]
        ],
        "352": [
            [0, -43], [-20, -31], [0, -33], [20, -31],
            [-23, -15], [-10, -18], [0, -14], [10, -18], [23, -15],
            [-9, -2], [9, -2]
        ],
        "4231": [
            [0, -43], [-19, -31], [-7, -33], [7, -33], [19, -31],
            [-10, -19], [10, -19],
            [-19, -8], [0, -9], [19, -8], [0, -2]
        ],
        "541": [
            [0, -43], [-20, -31], [-10, -33], [0, -34], [10, -33],
            [20, -31], [-18, -15], [-6, -17], [6, -17], [18, -15],
            [0, -2]
        ]
    };

    function createTeamPlayers(team, side) {
        const players = [];
        const formation = FORMATIONS[STATE.tactics.formation] || FORMATIONS["433"];

        const shirtColor = team.color;
        const opponent = side === "away";

        for (let i = 0; i < 11; i++) {
            const role = i === 0 ? "GK" :
                i < 5 ? "DEF" :
                i < 8 ? "MID" : "ATT";

            const coordinates = formation[i] || [0, -i * 3];

            const player = {
                id: side + "-" + (i + 1),
                team: side,
                teamId: team.id,
                teamName: team.name,
                teamColor: shirtColor,
                number: i + 1,
                name: PLAYER_NAMES[
                    (i + (opponent ? 17 : 0)) % PLAYER_NAMES.length
                ],
                role,
                x: coordinates[0],
                z: opponent ? -coordinates[1] : coordinates[1],
                targetX: coordinates[0],
                targetZ: opponent ? -coordinates[1] : coordinates[1],
                vx: 0,
                vz: 0,
                speed: random(5.2, 6.7) * (team.strength / 85),
                stamina: 100,
                skill: random(0.78, 1.12) * (team.strength / 85),
                isControlled: false,
                hasBall: false,
                entity: null,
                cooldown: 0,
                aiState: "position",
                lastAction: 0
            };

            players.push(player);
            createPlayerModel(player);
        }

        // Sept remplaçants visibles dans la zone de banc.
        for (let i = 0; i < 7; i++) {
            const substitute = {
                id: side + "-SUB-" + (i + 1),
                team: side,
                teamId: team.id,
                teamName: team.name,
                teamColor: shirtColor,
                number: 12 + i,
                name: PLAYER_NAMES[
                    (i + 34 + (opponent ? 11 : 0)) % PLAYER_NAMES.length
                ],
                role: "SUB",
                x: (i - 3) * 2.4,
                z: side === "home" ? 57 + (i % 2) * 2 : -57 - (i % 2) * 2,
                targetX: (i - 3) * 2.4,
                targetZ: side === "home" ? 57 + (i % 2) * 2 : -57 - (i % 2) * 2,
                vx: 0,
                vz: 0,
                speed: 0,
                stamina: 100,
                skill: 1,
                isControlled: false,
                hasBall: false,
                entity: null,
                cooldown: 0,
                aiState: "bench",
                lastAction: 0
            };

            players.push(substitute);
            createPlayerModel(substitute);

            // Réduire légèrement la taille des remplaçants, sans les rendre invisibles.
            substitute.entity.setLocalScale(0.78, 0.78, 0.78);
            STATE.substitutes.push(substitute);
        }

        return players;
    }

    function setPlayerPosition(player, x, z) {
        player.x = clamp(x, -27, 27);
        player.z = clamp(z, -47, 47);

        if (player.entity) {
            player.entity.setPosition(player.x, 0, player.z);
        }
    }

    function rebuildPlayers() {
        if (!STATE.playerRoot) return;

        STATE.playerRoot.destroy();
        STATE.playerRoot = new STATE.pc.Entity("FOOTBALL_PLAYERS_ROOT");
        STATE.sceneRoot.addChild(STATE.playerRoot);

        STATE.players = [];
        STATE.homePlayers = [];
        STATE.awayPlayers = [];
        STATE.substitutes = [];

        STATE.homePlayers = createTeamPlayers(STATE.homeTeam, "home");
        STATE.awayPlayers = createTeamPlayers(STATE.awayTeam, "away");

        STATE.players = [...STATE.homePlayers, ...STATE.awayPlayers];

        const homeActive = STATE.homePlayers.filter((p) => p.role !== "SUB");
        const awayActive = STATE.awayPlayers.filter((p) => p.role !== "SUB");

        STATE.selectedPlayer = homeActive[9] || homeActive[0];
        STATE.selectedPlayer.isControlled = true;

        STATE.ball.owner = STATE.selectedPlayer;
        STATE.selectedPlayer.hasBall = true;

        STATE.ball.x = STATE.selectedPlayer.x;
        STATE.ball.z = STATE.selectedPlayer.z + 0.9;

        updateScoreboard();
    }

    /* ============================================================
       BALLON
    ============================================================ */

    function buildBall() {
        STATE.ballEntity = addSphere(
            STATE.sceneRoot,
            "Ballon de football",
            STATE.materials.ball,
            0, 0.22, 0,
            0.22, 0.22, 0.22
        );

        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5;
            const patch = addSphere(
                STATE.ballEntity,
                "Panneau noir",
                STATE.materials.ballPatch,
                Math.cos(angle) * 0.15,
                Math.sin(angle) * 0.08,
                0.12,
                0.07, 0.07, 0.035
            );

            patch.setEulerAngles(0, i * 72, 0);
        }
    }

    function syncBall() {
        if (!STATE.ballEntity) return;

        STATE.ballEntity.setPosition(
            STATE.ball.x,
            Math.max(0.22, STATE.ball.y),
            STATE.ball.z
        );
    }

    function releaseBall(vx, vz, owner = null) {
        if (STATE.ball.owner) {
            STATE.ball.owner.hasBall = false;
        }

        STATE.ball.owner = owner;

        if (owner) {
            owner.hasBall = true;
            STATE.ball.lastTouchTeam = owner.team;
        }

        STATE.ball.vx = vx;
        STATE.ball.vz = vz;
    }

    function giveBallTo(player) {
        if (!player || player.role === "SUB") return;

        if (STATE.ball.owner) {
            STATE.ball.owner.hasBall = false;
        }

        STATE.ball.owner = player;
        player.hasBall = true;
        STATE.ball.lastTouchTeam = player.team;

        STATE.ball.x = player.x;
        STATE.ball.z = player.z;
        STATE.ball.y = 0.22;

        STATE.ball.vx = 0;
        STATE.ball.vz = 0;
    }

    /* ============================================================
       CAMÉRA : CADRAGE RAPPROCHÉ + SUIVI DU JOUEUR
    ============================================================ */

    function buildCamera() {
        const pc = STATE.pc;

        STATE.cameraEntity = new pc.Entity("FOBAS_MATCH_CAMERA");

        STATE.cameraEntity.addComponent("camera", {
            clearColor: new pc.Color(0.45, 0.69, 0.88),
            fov: 55,
            nearClip: 0.1,
            farClip: 500
        });

        STATE.sceneRoot.addChild(STATE.cameraEntity);
        STATE.camera = STATE.cameraEntity.camera;

        STATE.cameraState.zoom = 19;
        STATE.cameraState.defaultZoom = 19;
        STATE.cameraState.minZoom = 10;
        STATE.cameraState.maxZoom = 36;

        updateCameraImmediate();
    }

    function cameraTarget() {
        const player = STATE.selectedPlayer;

        if (!player) {
            return { x: STATE.ball.x, z: STATE.ball.z };
        }

        const ballNear = Math.hypot(
            STATE.ball.x - player.x,
            STATE.ball.z - player.z
        ) < 9;

        if (ballNear) {
            return {
                x: lerp(player.x, STATE.ball.x, 0.28),
                z: lerp(player.z, STATE.ball.z, 0.28)
            };
        }

        return {
            x: player.x,
            z: player.z
        };
    }

    function updateCameraImmediate() {
        if (!STATE.cameraEntity) return;

        const target = cameraTarget();
        const zoom = STATE.cameraState.zoom;

        STATE.cameraState.targetX = target.x;
        STATE.cameraState.targetZ = target.z;

        // Perspective rapprochée : priorité à la taille du joueur.
        STATE.cameraEntity.setPosition(
            target.x,
            zoom * 0.79,
            target.z + zoom * 0.74
        );

        STATE.cameraEntity.lookAt(
            target.x,
            0.8,
            target.z - zoom * 0.18
        );
    }

    function updateCamera(dt) {
        if (!STATE.cameraEntity) return;

        const target = cameraTarget();

        STATE.cameraState.targetX = lerp(
            STATE.cameraState.targetX,
            target.x,
            clamp(dt * 5.5, 0, 1)
        );

        STATE.cameraState.targetZ = lerp(
            STATE.cameraState.targetZ,
            target.z,
            clamp(dt * 5.5, 0, 1)
        );

        const zoom = STATE.cameraState.zoom;

        const cameraX = STATE.cameraState.targetX;
        const cameraZ = STATE.cameraState.targetZ + zoom * 0.74;
        const cameraY = zoom * 0.79;

        const current = STATE.cameraEntity.getPosition();

        STATE.cameraEntity.setPosition(
            lerp(current.x, cameraX, clamp(dt * 6, 0, 1)),
            lerp(current.y, cameraY, clamp(dt * 6, 0, 1)),
            lerp(current.z, cameraZ, clamp(dt * 6, 0, 1))
        );

        STATE.cameraEntity.lookAt(
            STATE.cameraState.targetX,
            0.8,
            STATE.cameraState.targetZ - zoom * 0.18
        );
    }

    function setZoom(value) {
        STATE.cameraState.zoom = clamp(
            value,
            STATE.cameraState.minZoom,
            STATE.cameraState.maxZoom
        );

        if (STATE.cameraState.zoom < 13) {
            STATE.camera?.setFov(49);
        } else {
            STATE.camera?.setFov(55);
        }

        updateCameraImmediate();
    }

    function zoomIn() {
        setZoom(STATE.cameraState.zoom - 2);
    }

    function zoomOut() {
        setZoom(STATE.cameraState.zoom + 2);
    }

    function resetCamera() {
        STATE.cameraState.mode = 0;
        setZoom(STATE.cameraState.defaultZoom);
        updateCameraImmediate();
        toast("Caméra rapprochée réinitialisée.");
    }

    function changeCameraMode() {
        STATE.cameraState.mode = (STATE.cameraState.mode + 1) % 3;

        if (STATE.cameraState.mode === 0) {
            setZoom(19);
            toast("Caméra joueur rapprochée.");
        } else if (STATE.cameraState.mode === 1) {
            setZoom(25);
            toast("Caméra de jeu.");
        } else {
            setZoom(15);
            toast("Caméra action.");
        }
    }

    /* ============================================================
       TOUCH : PINCH À DEUX DOIGTS SUR LE CANVAS
    ============================================================ */

    function touchDistance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;

        return Math.hypot(dx, dy);
    }

    function onCanvasTouchStart(event) {
        if (!DOM.footballCanvas) return;

        for (const touch of event.changedTouches) {
            STATE.cameraTouch.points.set(touch.identifier, {
                x: touch.clientX,
                y: touch.clientY
            });
        }

        if (STATE.cameraTouch.points.size >= 2) {
            const points = Array.from(STATE.cameraTouch.points.values());

            STATE.cameraTouch.initialDistance = touchDistance(points[0], points[1]);
            STATE.cameraTouch.initialZoom = STATE.cameraState.zoom;
            STATE.cameraTouch.pinching = true;
        }
    }

    function onCanvasTouchMove(event) {
        if (STATE.cameraTouch.points.size < 2) return;

        for (const touch of event.changedTouches) {
            if (STATE.cameraTouch.points.has(touch.identifier)) {
                STATE.cameraTouch.points.set(touch.identifier, {
                    x: touch.clientX,
                    y: touch.clientY
                });
            }
        }

        if (STATE.cameraTouch.points.size >= 2) {
            const points = Array.from(STATE.cameraTouch.points.values());

            const currentDistance = touchDistance(points[0], points[1]);
            const initialDistance = STATE.cameraTouch.initialDistance;

            if (initialDistance > 0) {
                const ratio = currentDistance / initialDistance;

                // Doigts écartés : zoom avant. Doigts rapprochés : zoom arrière.
                const newZoom = STATE.cameraTouch.initialZoom / ratio;

                setZoom(newZoom);
            }

            event.preventDefault();
        }
    }

    function onCanvasTouchEnd(event) {
        for (const touch of event.changedTouches) {
            STATE.cameraTouch.points.delete(touch.identifier);
        }

        if (STATE.cameraTouch.points.size < 2) {
            STATE.cameraTouch.pinching = false;
        }
    }

    function setupPinchZoom() {
        const canvas = DOM.footballCanvas;
        const viewport = DOM.pitchViewport;

        if (!canvas || !viewport) return;

        canvas.style.touchAction = "none";
        viewport.style.touchAction = "pan-y";

        canvas.addEventListener("touchstart", onCanvasTouchStart, {
            passive: true
        });

        canvas.addEventListener("touchmove", onCanvasTouchMove, {
            passive: false
        });

        canvas.addEventListener("touchend", onCanvasTouchEnd, {
            passive: true
        });

        canvas.addEventListener("touchcancel", onCanvasTouchEnd, {
            passive: true
        });

        // Pointer Events comme solution de compatibilité Android.
        const pointerMap = new Map();

        canvas.addEventListener("pointerdown", (event) => {
            if (event.pointerType !== "touch") return;

            pointerMap.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY
            });

            if (pointerMap.size >= 2) {
                const points = Array.from(pointerMap.values());

                STATE.cameraTouch.initialDistance =
                    touchDistance(points[0], points[1]);

                STATE.cameraTouch.initialZoom = STATE.cameraState.zoom;
                STATE.cameraTouch.pinching = true;
            }
        });

        canvas.addEventListener("pointermove", (event) => {
            if (!pointerMap.has(event.pointerId)) return;

            pointerMap.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY
            });

            if (pointerMap.size >= 2) {
                const points = Array.from(pointerMap.values());

                const dist = touchDistance(points[0], points[1]);
                const start = STATE.cameraTouch.initialDistance;

                if (start > 0) {
                    setZoom(STATE.cameraTouch.initialZoom / (dist / start));
                }

                event.preventDefault();
            }
        });

        const removePointer = (event) => {
            pointerMap.delete(event.pointerId);

            if (pointerMap.size < 2) {
                STATE.cameraTouch.pinching = false;
            }
        };

        canvas.addEventListener("pointerup", removePointer);
        canvas.addEventListener("pointercancel", removePointer);
        canvas.addEventListener("lostpointercapture", removePointer);
    }

    function resizeCanvas() {
        if (!STATE.app || !DOM.footballCanvas) return;

        const canvas = DOM.footballCanvas;
        const rect = canvas.getBoundingClientRect();

        if (rect.width < 10 || rect.height < 10) {
            const viewport = DOM.pitchViewport?.getBoundingClientRect();

            if (viewport && viewport.width > 10 && viewport.height > 10) {
                canvas.width = Math.floor(viewport.width * (window.devicePixelRatio || 1));
                canvas.height = Math.floor(viewport.height * (window.devicePixelRatio || 1));
            }
        }

        try {
            STATE.app.resizeCanvas();
        } catch (error) {
            console.warn("Redimensionnement du canvas :", error);
        }
    }

    /* ============================================================
       JOYSTICK VIRTUEL
    ============================================================ */

    function updateJoystickVisual(x, y) {
        if (!DOM.joystickKnob) return;

        const max = 33;

        DOM.joystickKnob.style.transform =
            `translate(${x * max}px, ${y * max}px)`;
    }

    function joystickCoordinates(event) {
        const rect = DOM.joystickBase.getBoundingClientRect();

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        let x = (event.clientX - cx) / (rect.width * 0.38);
        let y = (event.clientY - cy) / (rect.height * 0.38);

        const length = Math.hypot(x, y);

        if (length > 1) {
            x /= length;
            y /= length;
        }

        return {
            x: clamp(x, -1, 1),
            y: clamp(y, -1, 1)
        };
    }

    function setupJoystick() {
        const joystick = DOM.movementJoystick;
        const base = DOM.joystickBase;

        if (!joystick || !base) return;

        const start = (event) => {
            event.preventDefault();

            STATE.joystick.active = true;
            STATE.joystick.pointerId = event.pointerId;

            try {
                joystick.setPointerCapture(event.pointerId);
            } catch {
                // Le navigateur peut refuser la capture.
            }

            const point = joystickCoordinates(event);

            STATE.joystick.x = point.x;
            STATE.joystick.y = point.y;

            updateJoystickVisual(point.x, point.y);
        };

        const move = (event) => {
            if (!STATE.joystick.active) return;

            if (
                STATE.joystick.pointerId !== null &&
                event.pointerId !== STATE.joystick.pointerId
            ) {
                return;
            }

            event.preventDefault();

            const point = joystickCoordinates(event);

            STATE.joystick.x = point.x;
            STATE.joystick.y = point.y;

            updateJoystickVisual(point.x, point.y);
        };

        const end = (event) => {
            if (
                STATE.joystick.pointerId !== null &&
                event.pointerId !== STATE.joystick.pointerId
            ) {
                return;
            }

            STATE.joystick.active = false;
            STATE.joystick.pointerId = null;
            STATE.joystick.x = 0;
            STATE.joystick.y = 0;

            updateJoystickVisual(0, 0);
        };

        joystick.addEventListener("pointerdown", start);
        joystick.addEventListener("pointermove", move);
        joystick.addEventListener("pointerup", end);
        joystick.addEventListener("pointercancel", end);
        joystick.addEventListener("lostpointercapture", end);
    }

    /* ============================================================
       CONTRÔLES DU JOUEUR
    ============================================================ */

    function activeHomePlayers() {
        return STATE.homePlayers.filter((player) => player.role !== "SUB");
    }

    function activeAwayPlayers() {
        return STATE.awayPlayers.filter((player) => player.role !== "SUB");
    }

    function switchPlayer() {
        const candidates = activeHomePlayers();

        if (!candidates.length) return;

        const current = STATE.selectedPlayer;

        let nearest = null;
        let bestScore = Infinity;

        for (const player of candidates) {
            if (player === current) continue;

            const ballDistance = distance2D(player, STATE.ball);

            const score = ballDistance +
                (player.role === "GK" ? 8 : 0);

            if (score < bestScore) {
                bestScore = score;
                nearest = player;
            }
        }

        if (!nearest) return;

        if (current) {
            current.isControlled = false;
        }

        STATE.selectedPlayer = nearest;
        nearest.isControlled = true;

        toast("Joueur contrôlé : " + nearest.name + " · N° " + nearest.number);
    }

    function getMovementDirection() {
        const x = STATE.joystick.x;
        const y = STATE.joystick.y;

        return {
            x,
            z: y
        };
    }

    function moveControlledPlayer(dt) {
        const player = STATE.selectedPlayer;

        if (!player || !STATE.match.active || STATE.match.paused) return;

        const input = getMovementDirection();

        const length = Math.hypot(input.x, input.z);

        if (length < 0.05) {
            player.vx = lerp(player.vx, 0, dt * 6);
            player.vz = lerp(player.vz, 0, dt * 6);
            return;
        }

        const nx = input.x / Math.max(1, length);
        const nz = input.z / Math.max(1, length);

        const sprintMultiplier = STATE.input.sprint ? 1.55 : 1;
        const speed = player.speed * sprintMultiplier;

        player.vx = nx * speed;
        player.vz = nz * speed;

        setPlayerPosition(
            player,
            player.x + player.vx * dt,
            player.z + player.vz * dt
        );

        // Orienter le joueur dans le sens du déplacement.
        if (player.entity) {
            const angle = Math.atan2(nx, nz) * 180 / Math.PI;
            player.entity.setEulerAngles(0, angle, 0);
        }

        player.stamina = clamp(
            player.stamina - (STATE.input.sprint ? 8 : 2) * dt,
            0,
            100
        );

        if (STATE.ball.owner === player) {
            STATE.ball.x = player.x + nx * 0.72;
            STATE.ball.z = player.z + nz * 0.72;
            STATE.ball.y = 0.22;
        }
    }

    function nearestTeammate(player, includeKeeper = false) {
        const list = player.team === "home"
            ? activeHomePlayers()
            : activeAwayPlayers();

        let best = null;
        let bestDistance = Infinity;

        for (const candidate of list) {
            if (candidate === player) continue;
            if (!includeKeeper && candidate.role === "GK") continue;

            const d = distance2D(player, candidate);

            if (d < bestDistance) {
                bestDistance = d;
                best = candidate;
            }
        }

        return best;
    }

    function nearestOpponent(player) {
        const list = player.team === "home"
            ? activeAwayPlayers()
            : activeHomePlayers();

        let best = null;
        let bestDistance = Infinity;

        for (const opponent of list) {
            const d = distance2D(player, opponent);

            if (d < bestDistance) {
                bestDistance = d;
                best = opponent;
            }
        }

        return best;
    }

    function passBall() {
        if (!STATE.match.active || STATE.match.paused) return;

        const player = STATE.selectedPlayer;
        if (!player) return;

        if (STATE.ball.owner !== player) {
            const opponent = nearestOpponent(player);

            if (opponent && distance2D(player, opponent) < 2.8) {
                toast("Le joueur est en phase défensive.");
                return;
            }

            if (distance2D(player, STATE.ball) < 2.1) {
                giveBallTo(player);
            } else {
                toast("Rapprochez-vous du ballon pour faire une passe.");
                return;
            }
        }

        const teammate = nearestTeammate(player);

        if (!teammate) return;

        const dx = teammate.x - player.x;
        const dz = teammate.z - player.z;
        const length = Math.max(0.01, Math.hypot(dx, dz));

        releaseBall(
            dx / length * 15,
            dz / length * 15,
            player
        );

        playTone(520, 0.07);

        announce("PASSE", player.name + " passe à " + teammate.name + ".");

        player.lastAction = STATE.match.elapsed;
    }

    function shootBall() {
        if (!STATE.match.active || STATE.match.paused) return;

        const player = STATE.selectedPlayer;
        if (!player) return;

        if (STATE.ball.owner !== player) {
            if (distance2D(player, STATE.ball) < 2.0) {
                giveBallTo(player);
            } else {
                toast("Rapprochez-vous du ballon pour tirer.");
                return;
            }
        }

        const direction = player.team === "home" ? -1 : 1;

        const targetZ = direction * 47;
        const dx = -player.x;
        const dz = targetZ - player.z;
        const length = Math.max(1, Math.hypot(dx, dz));

        const skill = player.skill;
        const power = random(19, 26) * skill;

        releaseBall(
            dx / length * power + random(-1.5, 1.5),
            dz / length * power,
            player
        );

        STATE.ball.vy = random(1.5, 3.5);

        playTone(220, 0.12);

        announce("TIR AU BUT", player.name + " tente sa chance !");

        player.lastAction = STATE.match.elapsed;
    }

    function sprintStart() {
        STATE.input.sprint = true;
    }

    function sprintEnd() {
        STATE.input.sprint = false;
    }

    function defendAction() {
        if (!STATE.match.active || STATE.match.paused) return;

        const player = STATE.selectedPlayer;
        if (!player) return;

        STATE.input.defend = true;

        const opponent = nearestOpponent(player);

        if (opponent && distance2D(player, opponent) < 3.2) {
            const chance = clamp(
                0.55 + player.skill * 0.2 -
                (opponent.skill * 0.12),
                0.2,
                0.9
            );

            if (Math.random() < chance) {
                giveBallTo(player);

                setRefereeDecision("Récupération régulière du ballon");

                announce(
                    "BALLON RÉCUPÉRÉ",
                    player.name + " récupère le ballon."
                );

                playTone(400, 0.08);
            } else {
                const foulChance = Math.random();

                if (foulChance < 0.12) {
                    refereeFoul(player, opponent);
                } else {
                    announce(
                        "DUEL",
                        opponent.name + " conserve le ballon."
                    );
                }
            }
        } else if (distance2D(player, STATE.ball) < 2.4) {
            giveBallTo(player);
        } else {
            toast("Rapprochez-vous d'un adversaire pour défendre.");
        }

        window.setTimeout(() => {
            STATE.input.defend = false;
        }, 450);
    }

    /* ============================================================
       IA DES DEUX ÉQUIPES
    ============================================================ */

    function getGoalDirection(team) {
        return team === "home" ? -1 : 1;
    }

    function getFormationTarget(player) {
        const base = FORMATIONS[STATE.tactics.formation] || FORMATIONS["433"];
        const index = Math.max(0, Number(player.number) - 1);

        const coordinates = base[index] || [0, -10];

        return {
            x: coordinates[0],
            z: player.team === "home"
                ? coordinates[1]
                : -coordinates[1]
        };
    }

    function updateAITarget(player, dt) {
        if (player.role === "SUB") return;
        if (player === STATE.selectedPlayer) return;

        const teamHasBall =
            STATE.ball.owner && STATE.ball.owner.team === player.team;

        const opponentHasBall =
            STATE.ball.owner && STATE.ball.owner.team !== player.team;

        const ball = STATE.ball;

        const formation = getFormationTarget(player);

        if (player.role === "GK") {
            const ownGoal = player.team === "home" ? -44.7 : 44.7;

            player.targetX = clamp(ball.x * 0.18, -3.2, 3.2);
            player.targetZ = ownGoal + clamp(
                (ball.z - ownGoal) * 0.035,
                -2.5,
                2.5
            );

            if (!teamHasBall && distance2D(player, ball) < 4.0) {
                player.targetX = ball.x;
                player.targetZ = ball.z;
            }

            return;
        }

        if (teamHasBall) {
            if (STATE.ball.owner === player) {
                const goalDirection = getGoalDirection(player.team);

                player.targetX = clamp(player.x * 0.4, -14, 14);
                player.targetZ = player.z + goalDirection * 9;

                const goalDistance = Math.abs(47 - Math.abs(player.z));

                if (goalDistance < 27 && Math.random() < 0.015) {
                    aiShoot(player);
                } else if (Math.random() < 0.012) {
                    aiPass(player);
                }
            } else {
                player.targetX = lerp(
                    formation.x,
                    ball.x,
                    player.role === "ATT" ? 0.5 : 0.22
                );

                player.targetZ = lerp(
                    formation.z,
                    ball.z,
                    player.role === "ATT" ? 0.55 : 0.18
                );
            }
        } else if (opponentHasBall) {
            if (player.role === "DEF" || player.role === "MID") {
                player.targetX = lerp(formation.x, ball.x, 0.35);
                player.targetZ = lerp(formation.z, ball.z, 0.35);
            } else {
                player.targetX = lerp(formation.x, ball.x, 0.18);
                player.targetZ = lerp(formation.z, ball.z, 0.15);
            }

            const ballDistance = distance2D(player, ball);

            if (ballDistance < 4.5 && Math.random() < 0.025) {
                aiTackle(player);
            }
        } else {
            player.targetX = lerp(formation.x, ball.x, 0.2);
            player.targetZ = lerp(formation.z, ball.z, 0.18);
        }

        // Garder les joueurs dans le terrain.
        player.targetX = clamp(player.targetX, -25, 25);
        player.targetZ = clamp(player.targetZ, -45, 45);
    }

    function moveAIPlayer(player, dt) {
        if (player.role === "SUB") return;
        if (player === STATE.selectedPlayer) return;

        updateAITarget(player, dt);

        const dx = player.targetX - player.x;
        const dz = player.targetZ - player.z;
        const distance = Math.hypot(dx, dz);

        if (distance > 0.25) {
            const speed = player.speed *
                (STATE.match.difficulty === "expert" ? 1.15 : 1);

            const step = Math.min(distance, speed * dt);

            setPlayerPosition(
                player,
                player.x + dx / distance * step,
                player.z + dz / distance * step
            );

            player.vx = dx / distance * speed;
            player.vz = dz / distance * speed;

            player.entity?.setEulerAngles(
                0,
                Math.atan2(dx, dz) * 180 / Math.PI,
                0
            );
        }
    }

    function aiPass(player) {
        if (STATE.ball.owner !== player) return;

        const teammate = nearestTeammate(player);

        if (!teammate) return;

        const dx = teammate.x - player.x;
        const dz = teammate.z - player.z;
        const d = Math.max(0.1, Math.hypot(dx, dz));

        releaseBall(
            dx / d * 13,
            dz / d * 13,
            player
        );

        if (player.team === "away") {
            STATE.match.possessionHome = false;
        }

        if (Math.random() < 0.3) {
            setRefereeDecision("Jeu fluide — pas de faute");
        }
    }

    function aiShoot(player) {
        if (STATE.ball.owner !== player) return;

        const direction = getGoalDirection(player.team);

        const dx = -player.x;
        const dz = direction * 47 - player.z;
        const d = Math.max(1, Math.hypot(dx, dz));

        const difficultyBonus =
            STATE.settings.difficulty === "expert" ? 1.2 :
            STATE.settings.difficulty === "hard" ? 1.1 : 1;

        const power = random(17, 24) *
            player.skill *
            difficultyBonus;

        releaseBall(
            dx / d * power + random(-1.2, 1.2),
            dz / d * power,
            player
        );

        STATE.ball.vy = random(1.1, 2.7);
    }

    function aiTackle(player) {
        const owner = STATE.ball.owner;

        if (!owner || owner.team === player.team) return;

        const d = distance2D(player, owner);

        if (d > 3.0) return;

        const difficulty =
            STATE.settings.difficulty === "expert" ? 0.76 :
            STATE.settings.difficulty === "hard" ? 0.66 :
            STATE.settings.difficulty === "easy" ? 0.43 : 0.57;

        if (Math.random() < difficulty * player.skill) {
            giveBallTo(player);

            if (player.team === "away") {
                STATE.match.possessionHome = false;
            }
        } else if (Math.random() < 0.08) {
            refereeFoul(player, owner);
        }
    }

    function updateAI(dt) {
        if (!STATE.match.active || STATE.match.paused) return;

        for (const player of STATE.players) {
            if (player.role === "SUB") continue;

            moveAIPlayer(player, dt);
        }

        const owner = STATE.ball.owner;

        if (owner && owner.role !== "SUB") {
            const opponent = nearestOpponent(owner);

            if (
                opponent &&
                distance2D(owner, opponent) < 1.7 &&
                Math.random() < 0.045
            ) {
                if (Math.random() < 0.6) {
                    giveBallTo(opponent);
                } else {
                    refereeFoul(opponent, owner);
                }
            }
        }

        // Les adversaires se rapprochent réellement du ballon.
        if (!owner) {
            const nearest = STATE.players
                .filter((p) => p.role !== "SUB")
                .sort((a, b) =>
                    distance2D(a, STATE.ball) -
                    distance2D(b, STATE.ball)
                )[0];

            if (nearest && distance2D(nearest, STATE.ball) < 2.1) {
                giveBallTo(nearest);
            }
        }
    }

    /* ============================================================
       PHYSIQUE DU BALLON ET DÉTECTION DES BUTS
    ============================================================ */

    function updateBallPhysics(dt) {
        const owner = STATE.ball.owner;

        if (owner) {
            STATE.ball.x = owner.x;
            STATE.ball.z = owner.z + (owner.team === "home" ? 0.65 : -0.65);
            STATE.ball.y = 0.22;

            STATE.ball.vx = 0;
            STATE.ball.vz = 0;

            syncBall();
            return;
        }

        STATE.ball.x += STATE.ball.vx * dt;
        STATE.ball.z += STATE.ball.vz * dt;

        STATE.ball.vx *= Math.pow(0.985, dt * 60);
        STATE.ball.vz *= Math.pow(0.985, dt * 60);

        STATE.ball.y += STATE.ball.vy * dt;

        STATE.ball.vy -= 9.8 * dt;

        if (STATE.ball.y < 0.22) {
            STATE.ball.y = 0.22;
            STATE.ball.vy = Math.abs(STATE.ball.vy) * 0.35;
        }

        // Sortie latérale : remise en jeu simplifiée.
        if (Math.abs(STATE.ball.x) > 27) {
            STATE.ball.x = clamp(STATE.ball.x, -26.5, 26.5);
            STATE.ball.vx *= -0.45;

            setRefereeDecision("Ballon remis en jeu");
        }

        // Buts : le ballon doit franchir la ligne dans l'ouverture.
        if (Math.abs(STATE.ball.z) > 47.2) {
            const insideGoal = Math.abs(STATE.ball.x) < 3.75 &&
                STATE.ball.y < 2.7;

            if (insideGoal && STATE.match.elapsed - STATE.match.lastGoalTime > 3) {
                scoreGoal(STATE.ball.lastTouchTeam);
                return;
            }

            STATE.ball.z = clamp(STATE.ball.z, -46.8, 46.8);
            STATE.ball.vz *= -0.4;
        }

        // Joueurs proches : contrôle automatique du ballon libre.
        if (Math.hypot(STATE.ball.vx, STATE.ball.vz) < 8) {
            const candidates = STATE.players.filter((p) => p.role !== "SUB");

            for (const player of candidates) {
                if (distance2D(player, STATE.ball) < 1.15) {
                    giveBallTo(player);
                    break;
                }
            }
        }

        syncBall();
    }

    function scoreGoal(team) {
        STATE.match.lastGoalTime = STATE.match.elapsed;

        if (team === "home") {
            STATE.score.home += 1;
            STATE.profile.goalsScored += 1;

            announce(
                "⚽ BUT !",
                STATE.homeTeam.name + " marque !"
            );
        } else {
            STATE.score.away += 1;

            announce(
                "⚽ BUT !",
                STATE.awayTeam.name + " marque !"
            );
        }

        setRefereeDecision("But accordé par MEME Selvandieu");

        playGoalSound();

        updateScoreboard();

        resetAfterGoal(team);
        saveGame(false);
    }

    function resetAfterGoal(scoringTeam) {
        for (const player of STATE.players) {
            if (player.role === "SUB") continue;

            const formation = getFormationTarget(player);

            setPlayerPosition(player, formation.x, formation.z);

            player.targetX = formation.x;
            player.targetZ = formation.z;
        }

        STATE.ball.x = 0;
        STATE.ball.z = 0;
        STATE.ball.y = 0.22;
        STATE.ball.vx = 0;
        STATE.ball.vz = 0;

        const kickoffTeam = scoringTeam === "home" ? "away" : "home";

        const candidates = kickoffTeam === "home"
            ? activeHomePlayers()
            : activeAwayPlayers();

        const kickoffPlayer = candidates.find((p) => p.role === "ATT") ||
            candidates[1];

        giveBallTo(kickoffPlayer);

        if (STATE.selectedPlayer?.team !== "home") {
            STATE.selectedPlayer = activeHomePlayers()[9];
        }

        STATE.selectedPlayer.isControlled = true;

        updateCameraImmediate();
    }

    /* ============================================================
       ARBITRE IA : FAUTES ET CARTONS
    ============================================================ */

    function refereeFoul(tackler, victim) {
        const now = STATE.match.elapsed;

        if (now - STATE.match.lastRefereeEvent < 6) return;

        STATE.match.lastRefereeEvent = now;

        setRefereeDecision(
            "Faute signalée par " + (CONFIG.refereeName || "MEME Selvandieu")
        );

        if (Math.random() < 0.17) {
            announce(
                "🟨 CARTON JAUNE",
                tackler.name + " reçoit un avertissement."
            );
        } else {
            announce(
                "FAUTE",
                tackler.name + " commet une faute sur " + victim.name + "."
            );
        }

        // Coup franc simplifié.
        STATE.ball.owner = null;
        STATE.ball.x = victim.x;
        STATE.ball.z = victim.z;
        STATE.ball.vx = 0;
        STATE.ball.vz = 0;

        playTone(180, 0.2);
    }

    /* ============================================================
       HORLOGE, MI-TEMPS ET FIN DE MATCH
    ============================================================ */

    function durationFromSelection() {
        const value = DOM.matchDurationSelect?.value || "standard";

        if (value === "short") return 6 * 60;
        if (value === "long") return 120 * 60;

        return 90 * 60;
    }

    function formatMatchClock(seconds) {
        const totalMinutes = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);

        return String(totalMinutes).padStart(2, "0") +
            ":" +
            String(sec).padStart(2, "0");
    }

    function updateMatchClock(dt) {
        if (!STATE.match.active || STATE.match.paused || STATE.match.finished) {
            return;
        }

        // La durée du match est comprimée pour rendre les parties jouables.
        const gameTimeScale = STATE.match.duration <= 360 ? 1 : 6;

        STATE.match.elapsed += dt * gameTimeScale;

        const halfDuration = STATE.match.duration / 2;

        if (
            STATE.match.half === 1 &&
            STATE.match.elapsed >= halfDuration
        ) {
            STATE.match.half = 2;

            announce(
                "MI-TEMPS",
                "La première période est terminée. Le match reprend."
            );

            setRefereeDecision("Mi-temps");

            switchHalves();
        }

        if (STATE.match.elapsed >= STATE.match.duration) {
            finishMatch();
        }

        if (DOM.matchClock) {
            DOM.matchClock.textContent =
                formatMatchClock(Math.min(
                    STATE.match.elapsed,
                    STATE.match.duration
                ));
        }

        if (DOM.matchPeriod) {
            DOM.matchPeriod.textContent =
                STATE.match.half === 1 ? "1re MI-TEMPS" : "2e MI-TEMPS";
        }
    }

    function switchHalves() {
        // Changer les positions des équipes à la mi-temps.
        for (const player of STATE.players) {
            if (player.role === "SUB") continue;

            player.z *= -1;
            player.targetZ *= -1;

            if (player.entity) {
                player.entity.setPosition(player.x, 0, player.z);
            }
        }

        STATE.ball.z *= -1;

        updateCameraImmediate();
    }

    function finishMatch() {
        if (STATE.match.finished) return;

        STATE.match.finished = true;
        STATE.match.active = false;
        STATE.match.paused = false;

        STATE.profile.matchesPlayed += 1;
        STATE.career.played += 1;

        let resultText;

        if (STATE.score.home > STATE.score.away) {
            resultText = "Victoire de " + STATE.homeTeam.name + " !";
            STATE.career.wins += 1;
            STATE.homeTeam.wins++;
            STATE.awayTeam.losses++;
        } else if (STATE.score.home < STATE.score.away) {
            resultText = "Victoire de " + STATE.awayTeam.name + " !";
            STATE.career.losses += 1;
            STATE.awayTeam.wins++;
            STATE.homeTeam.losses++;
        } else {
            resultText = "Match nul.";
            STATE.career.draws += 1;
            STATE.homeTeam.draws++;
            STATE.awayTeam.draws++;
        }

        STATE.homeTeam.played++;
        STATE.awayTeam.played++;

        STATE.homeTeam.goalsFor += STATE.score.home;
        STATE.homeTeam.goalsAgainst += STATE.score.away;

        STATE.awayTeam.goalsFor += STATE.score.away;
        STATE.awayTeam.goalsAgainst += STATE.score.home;

        if (STATE.score.home > STATE.score.away) {
            STATE.profile.trophies +=
                STATE.match.competition === "champions" ? 1 : 0;
        }

        updateScoreboard();
        updateProfileUI();

        setRefereeDecision("Coup de sifflet final");

        saveGame(false);

        showDialog(
            "FIN DU MATCH",
            `
                <div class="match-result-summary">
                    <h3>${safeText(STATE.homeTeam.name)}
                        ${STATE.score.home} — ${STATE.score.away}
                        ${safeText(STATE.awayTeam.name)}</h3>
                    <p>${safeText(resultText)}</p>
                    <p>Arbitre : MEME Selvandieu</p>
                </div>
            `,
            [
                {
                    label: "REJOUER",
                    className: "ui-button button-primary",
                    onClick: () => {
                        closeDialog();
                        startMatch(STATE.homeTeam, STATE.awayTeam);
                    }
                },
                {
                    label: "MENU",
                    className: "ui-button button-secondary",
                    onClick: () => {
                        closeDialog();
                        showScreen("mainMenu");
                    }
                }
            ]
        );
    }

    function updateScoreboard() {
        if (DOM.homeScore) {
            DOM.homeScore.textContent = String(STATE.score.home);
        }

        if (DOM.awayScore) {
            DOM.awayScore.textContent = String(STATE.score.away);
        }

        if (DOM.homeTeamName && STATE.homeTeam) {
            DOM.homeTeamName.textContent = STATE.homeTeam.name;
        }

        if (DOM.awayTeamName && STATE.awayTeam) {
            DOM.awayTeamName.textContent = STATE.awayTeam.name;
        }

        if (DOM.competitionLabel) {
            const competition = COMPETITIONS.find(
                (item) => item.id === STATE.match.competition
            );

            DOM.competitionLabel.textContent =
                competition?.name || "MATCH FOBAS";
        }

        if (DOM.stadiumLabel) {
            DOM.stadiumLabel.textContent =
                STATE.match.stadium === "neutral"
                    ? "STADE NEUTRE"
                    : "STADE " + (STATE.homeTeam?.region || "FOBAS").toUpperCase();
        }
    }

    /* ============================================================
       SON : WEB AUDIO SANS FICHIER EXTERNE
    ============================================================ */

    function ensureAudio() {
        if (STATE.audioContext) return STATE.audioContext;

        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return null;

        STATE.audioContext = new AudioContextClass();

        STATE.masterGain = STATE.audioContext.createGain();

        STATE.masterGain.gain.value =
            STATE.settings.sound ? STATE.settings.volume / 100 : 0;

        STATE.masterGain.connect(STATE.audioContext.destination);

        return STATE.audioContext;
    }

    function playTone(frequency = 440, duration = 0.1) {
        if (!STATE.settings.sound) return;

        const context = ensureAudio();
        if (!context || !STATE.masterGain) return;

        if (context.state === "suspended") {
            context.resume().catch(() => {});
        }

        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(0.0001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.14,
            context.currentTime + 0.015
        );
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            context.currentTime + duration
        );

        oscillator.connect(gain);
        gain.connect(STATE.masterGain);

        oscillator.start();
        oscillator.stop(context.currentTime + duration + 0.03);
    }

    function playGoalSound() {
        playTone(520, 0.13);

        window.setTimeout(() => playTone(660, 0.13), 140);
        window.setTimeout(() => playTone(790, 0.24), 280);
    }

    function toggleSound() {
        STATE.settings.sound = !STATE.settings.sound;

        if (DOM.soundToggleBtn) {
            DOM.soundToggleBtn.textContent =
                STATE.settings.sound ? "🔊" : "🔇";

            DOM.soundToggleBtn.setAttribute(
                "aria-pressed",
                String(STATE.settings.sound)
            );
        }

        if (STATE.masterGain && STATE.audioContext) {
            STATE.masterGain.gain.setTargetAtTime(
                STATE.settings.sound ? STATE.settings.volume / 100 : 0,
                STATE.audioContext.currentTime,
                0.03
            );
        }

        if (STATE.settings.sound) {
            playTone(440, 0.07);
        }

        saveGame(false);
    }

    /* ============================================================
       LANCEMENT D'UN MATCH
    ============================================================ */

    function startMatch(homeTeam, awayTeam) {
        if (!STATE.app || !STATE.sceneRoot) {
            toast("Le moteur 3D n'est pas encore prêt.");
            return;
        }

        if (!homeTeam || !awayTeam) {
            toast("Sélectionnez deux équipes.");
            return;
        }

        if (homeTeam.id === awayTeam.id) {
            toast("Choisissez deux équipes différentes.");
            return;
        }

        STATE.homeTeam = homeTeam;
        STATE.awayTeam = awayTeam;

        STATE.match.active = true;
        STATE.match.paused = false;
        STATE.match.finished = false;
        STATE.match.elapsed = 0;
        STATE.match.duration = durationFromSelection();
        STATE.match.half = 1;
        STATE.match.lastGoalTime = -100;
        STATE.match.competition = DOM.competitionSelect?.value || "local";
        STATE.match.stadium = DOM.stadiumSelect?.value || "home";

        STATE.score.home = 0;
        STATE.score.away = 0;

        rebuildPlayers();

        STATE.ball.x = 0;
        STATE.ball.z = 0;
        STATE.ball.y = 0.22;
        STATE.ball.vx = 0;
        STATE.ball.vz = 0;

        const kickoff = activeHomePlayers().find((p) => p.role === "ATT") ||
            activeHomePlayers()[9];

        giveBallTo(kickoff);

        if (DOM.matchClock) {
            DOM.matchClock.textContent = "00:00";
        }

        updateScoreboard();
        showScreen("matchScreen");

        if (DOM.engineStatus) {
            DOM.engineStatus.textContent =
                "PLAYCANVAS 3D · 22 JOUEURS · IA ACTIVE";
        }

        setZoom(19);
        updateCameraImmediate();

        ensureAudio();

        announce(
            "COUP D'ENVOI",
            STATE.homeTeam.name + " contre " + STATE.awayTeam.name
        );

        setRefereeDecision("Match dirigé par MEME Selvandieu");

        toast("Match lancé. L'IA contrôle l'équipe adverse.");

        saveGame(false);
    }

    function startMatchFromForm() {
        const home = teamBySelectValue(DOM.homeTeamSelect?.value);
        const away = teamBySelectValue(DOM.awayTeamSelect?.value);

        startMatch(home, away);
    }

    function pauseMatch() {
        if (!STATE.match.active) return;

        STATE.match.paused = true;
        DOM.pauseOverlay?.classList.remove("hidden");
    }

    function resumeMatch() {
        STATE.match.paused = false;
        DOM.pauseOverlay?.classList.add("hidden");
    }

    function quitMatch() {
        STATE.match.active = false;
        STATE.match.paused = false;

        DOM.pauseOverlay?.classList.add("hidden");
        showScreen("mainMenu");

        saveGame(false);
    }

    /* ============================================================
       CHAMPIONNATS ET TOURNOIS
    ============================================================ */

    function renderChampionships() {
        if (!DOM.competitionLevelsList) return;

        DOM.competitionLevelsList.innerHTML = "";

        COMPETITIONS.forEach((competition, index) => {
            const card = document.createElement("article");

            card.className = "competition-level-card" +
                (STATE.selectedCompetitionLevel === competition.id
                    ? " active"
                    : "");

            card.innerHTML = `
                <span class="competition-level-number">${index + 1}</span>
                <div class="competition-level-info">
                    <strong>${safeText(competition.name)}</strong>
                    <small>${safeText(competition.description || "Compétition FOBAS")}</small>
                </div>
                <button type="button" class="ui-button button-secondary"
                        data-competition="${safeText(competition.id)}">
                    CHOISIR
                </button>
            `;

            DOM.competitionLevelsList.appendChild(card);
        });
    }

    function renderTournaments() {
        if (!DOM.tournamentList) return;

        const tournaments = [
            {
                name: "Coupe FOBAS du Nord-Ouest",
                description: "Tournoi départemental haïtien",
                level: "northwest"
            },
            {
                name: "Championnat national d'Haïti",
                description: "Les meilleures équipes nationales",
                level: "haiti-national"
            },
            {
                name: "Coupe des Caraïbes",
                description: "Compétition régionale",
                level: "caribbean"
            },
            {
                name: "FOBAS World Champions",
                description: "Tournoi international",
                level: "champions"
            }
        ];

        DOM.tournamentList.innerHTML = "";

        tournaments.forEach((tournament, index) => {
            const card = document.createElement("article");
            card.className = "tournament-card";

            card.innerHTML = `
                <strong>${safeText(tournament.name)}</strong>
                <p>${safeText(tournament.description)}</p>
                <button type="button" class="ui-button button-secondary"
                        data-tournament-level="${safeText(tournament.level)}">
                    SÉLECTIONNER
                </button>
            `;

            DOM.tournamentList.appendChild(card);
        });
    }

    function createTournament() {
        STATE.tournamentCounter++;

        const name = "Tournoi FOBAS #" + STATE.tournamentCounter;

        showDialog(
            "Créer un tournoi",
            `
                <label for="newTournamentName">Nom du tournoi</label>
                <input id="newTournamentName" type="text"
                       maxlength="60" value="${safeText(name)}">
                <p>Le tournoi sera enregistré dans votre progression locale.</p>
            `,
            [
                {
                    label: "CRÉER",
                    className: "ui-button button-primary",
                    onClick: async () => {
                        const input = $("newTournamentName");
                        const tournamentName = input?.value.trim() || name;

                        const stored = await dbRead("tournaments") || [];

                        stored.push({
                            id: "tournament-" + Date.now(),
                            name: tournamentName,
                            createdAt: Date.now(),
                            level: STATE.selectedCompetitionLevel
                        });

                        await dbWrite("tournaments", stored);

                        closeDialog();
                        renderTournaments();

                        toast("Tournoi créé : " + tournamentName);
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

    /* ============================================================
       ÉQUIPEMENT
    ============================================================ */

    function renderEquipment(tab = STATE.activeEquipmentTab) {
        STATE.activeEquipmentTab = tab;

        const items = STATE.equipment[tab] || [];

        if (!DOM.equipmentItemsList) return;

        DOM.equipmentItemsList.innerHTML = "";

        $all("[data-equipment-tab]").forEach((button) => {
            const active = button.dataset.equipmentTab === tab;

            button.classList.toggle("active", active);
            button.setAttribute("aria-selected", String(active));
        });

        items.forEach((item) => {
            const card = document.createElement("article");
            card.className = "equipment-item-card";

            const selected = STATE.equipment.selected === item.id;

            card.innerHTML = `
                <span class="equipment-color"
                      style="background:${safeText(item.color)}"></span>
                <strong>${safeText(item.name)}</strong>
                <button type="button"
                        class="ui-button ${selected ? "button-primary" : "button-secondary"}"
                        data-equipment-id="${safeText(item.id)}">
                    ${selected ? "SÉLECTIONNÉ" : "CHOISIR"}
                </button>
            `;

            DOM.equipmentItemsList.appendChild(card);
        });
    }

    function applyEquipment() {
        const tab = STATE.activeEquipmentTab;
        const item = (STATE.equipment[tab] || []).find(
            (entry) => entry.id === STATE.equipment.selected
        );

        if (!item) {
            toast("Sélectionnez d'abord un équipement.");
            return;
        }

        if (tab === "kits" && STATE.homePlayers.length) {
            STATE.homePlayers
                .filter((player) => player.role !== "SUB")
                .forEach((player) => {
                    player.teamColor = item.color;
                    player.jerseyMaterial?.destroy();

                    player.jerseyMaterial = makeMaterial(item.color);
                    player.entity?.findByName("Maillot")?.render &&
                        (player.entity.findByName("Maillot").render.material =
                            player.jerseyMaterial);
                });
        }

        if (tab === "balls" && STATE.ballEntity) {
            STATE.materials.ball = makeMaterial(item.color);

            const ball = STATE.ballEntity.findByName("Ballon de football");

            if (ball?.render) {
                ball.render.material = STATE.materials.ball;
            }
        }

        toast("Équipement appliqué.");
        saveGame(false);
    }

    /* ============================================================
       PROFIL ET PARAMÈTRES
    ============================================================ */

    function updateProfileUI() {
        if (DOM.profileNameInput) {
            DOM.profileNameInput.value = STATE.profile.name;
        }

        if (DOM.profileFavoriteTeam) {
            const optionExists = Array.from(DOM.profileFavoriteTeam.options)
                .some((option) => option.value === STATE.profile.favoriteTeam);

            if (optionExists) {
                DOM.profileFavoriteTeam.value = STATE.profile.favoriteTeam;
            }
        }

        if (DOM.profileMatchesPlayed) {
            DOM.profileMatchesPlayed.textContent =
                String(STATE.profile.matchesPlayed);
        }

        if (DOM.profileGoalsScored) {
            DOM.profileGoalsScored.textContent =
                String(STATE.profile.goalsScored);
        }

        if (DOM.profileTrophies) {
            DOM.profileTrophies.textContent =
                String(STATE.profile.trophies);
        }
    }

    function saveProfile() {
        STATE.profile.name =
            DOM.profileNameInput?.value.trim() || "Joueur FOBAS";

        STATE.profile.favoriteTeam =
            DOM.profileFavoriteTeam?.value || "mare-rouge";

        updateProfileUI();
        saveGame(false);

        toast("Profil sauvegardé.");
    }

    function applySettingsToUI() {
        if (DOM.graphicsQualitySelect) {
            DOM.graphicsQualitySelect.value = STATE.settings.graphics;
        }

        if (DOM.soundVolumeInput) {
            DOM.soundVolumeInput.value = STATE.settings.volume;
        }

        if (DOM.cameraSensitivityInput) {
            DOM.cameraSensitivityInput.value =
                STATE.settings.cameraSensitivity;
        }

        if (DOM.matchDifficultySelect) {
            DOM.matchDifficultySelect.value = STATE.settings.difficulty;
        }

        if (DOM.vibrationToggle) {
            DOM.vibrationToggle.checked = STATE.settings.vibration;
        }

        if (DOM.commentaryToggle) {
            DOM.commentaryToggle.checked = STATE.settings.commentary;
        }

        if (DOM.soundToggleBtn) {
            DOM.soundToggleBtn.textContent =
                STATE.settings.sound ? "🔊" : "🔇";

            DOM.soundToggleBtn.setAttribute(
                "aria-pressed",
                String(STATE.settings.sound)
            );
        }
    }

    function saveSettings() {
        STATE.settings.graphics =
            DOM.graphicsQualitySelect?.value || "medium";

        STATE.settings.volume =
            Number(DOM.soundVolumeInput?.value || 70);

        STATE.settings.cameraSensitivity =
            Number(DOM.cameraSensitivityInput?.value || 50);

        STATE.settings.difficulty =
            DOM.matchDifficultySelect?.value || "normal";

        STATE.settings.vibration =
            Boolean(DOM.vibrationToggle?.checked);

        STATE.settings.commentary =
            Boolean(DOM.commentaryToggle?.checked);

        if (STATE.masterGain && STATE.audioContext) {
            STATE.masterGain.gain.setTargetAtTime(
                STATE.settings.sound ? STATE.settings.volume / 100 : 0,
                STATE.audioContext.currentTime,
                0.05
            );
        }

        if (STATE.app) {
            const resolution = STATE.settings.graphics === "high"
                ? 1.5
                : STATE.settings.graphics === "low"
                    ? 0.8
                    : 1;

            try {
                STATE.app.graphicsDevice.maxPixelRatio = resolution;
                resizeCanvas();
            } catch (error) {
                console.warn("Paramètres graphiques :", error);
            }
        }

        saveGame(false);
        toast("Paramètres enregistrés.");
    }

    /* ============================================================
       TACTIQUES
    ============================================================ */

    function openTactics() {
        DOM.tacticsOverlay?.classList.remove("hidden");
    }

    function closeTactics() {
        DOM.tacticsOverlay?.classList.add("hidden");
    }

    function applyTactics() {
        STATE.tactics.formation = DOM.formationSelect?.value || "433";
        STATE.tactics.style = DOM.tacticalStyleSelect?.value || "balanced";
        STATE.tactics.pressure = DOM.pressureSelect?.value || "medium";

        const formation = FORMATIONS[STATE.tactics.formation] || FORMATIONS["433"];

        for (const player of STATE.homePlayers) {
            if (player.role === "SUB") continue;

            const coords = formation[player.number - 1] || [0, -10];

            player.targetX = coords[0];
            player.targetZ = coords[1];
        }

        toast("Tactique appliquée : " + STATE.tactics.formation);
        closeTactics();
        saveGame(false);
    }

    /* ============================================================
       BOUCLE DU JEU
    ============================================================ */

    function gameUpdate(dt) {
        if (!STATE.app) return;

        const safeDt = clamp(dt, 0, 0.05);

        if (STATE.match.active && !STATE.match.paused) {
            moveControlledPlayer(safeDt);
            updateAI(safeDt);
            updateBallPhysics(safeDt);
            updateMatchClock(safeDt);
        }

        updateCamera(safeDt);
    }

    /* ============================================================
       INITIALISATION DU MOTEUR
    ============================================================ */

    async function loadPlayCanvas() {
        setLoading(8, "Chargement de PlayCanvas " + ENGINE_VERSION + "...");

        const urls = [
            "https://cdn.jsdelivr.net/npm/playcanvas@" +
                ENGINE_VERSION + "/build/playcanvas.mjs",
            "https://esm.sh/playcanvas@" + ENGINE_VERSION
        ];

        let lastError = null;

        for (const url of urls) {
            try {
                const module = await import(url);

                if (module && module.Application && module.Entity) {
                    return module;
                }

                lastError = new Error("Module PlayCanvas incomplet : " + url);
            } catch (error) {
                lastError = error;
                console.warn("Échec du chargement PlayCanvas :", url, error);
            }
        }

        throw lastError || new Error("PlayCanvas indisponible.");
    }

    function initializeLights() {
        const pc = STATE.pc;

        const ambient = new pc.Entity("Lumière ambiante");
        ambient.addComponent("light", {
            type: "directional",
            color: new pc.Color(1, 0.97, 0.88),
            intensity: 1.35,
            castShadows: true
        });

        ambient.setEulerAngles(48, 30, 0);
        STATE.sceneRoot.addChild(ambient);

        const fill = new pc.Entity("Lumière de remplissage");
        fill.addComponent("light", {
            type: "directional",
            color: new pc.Color(0.72, 0.82, 1),
            intensity: 0.45,
            castShadows: false
        });

        fill.setEulerAngles(28, -140, 0);
        STATE.sceneRoot.addChild(fill);

        try {
            STATE.app.scene.ambientLight = new pc.Color(0.45, 0.48, 0.52);
        } catch {
            // Certaines configurations de scène utilisent les lumières directes.
        }
    }

    async function initializeEngine() {
        if (STATE.initialized) return;

        setLoading(12, "Préparation de la scène...");

        const pc = await loadPlayCanvas();

        STATE.pc = pc;

        const canvas = DOM.footballCanvas;

        if (!canvas) {
            throw new Error("Canvas #footballCanvas introuvable.");
        }

        setLoading(22, "Création du moteur 3D...");

        const options = {
            graphicsDeviceOptions: {
                alpha: false,
                antialias: true,
                powerPreference: "high-performance"
            },
            mouse: new pc.Mouse(canvas),
            touch: new pc.TouchDevice(canvas)
        };

        STATE.app = new pc.Application(canvas, options);

        STATE.app.setCanvasFillMode(pc.FILLMODE_NONE);
        STATE.app.setCanvasResolution(pc.RESOLUTION_AUTO);

        STATE.app.scene.gammaCorrection = pc.GAMMA_SRGB;
        STATE.app.scene.toneMapping = pc.TONEMAP_ACES;

        STATE.app.start();

        setLoading(35, "Construction du terrain...");

        createMaterials();
        buildField();
        initializeLights();

        setLoading(52, "Construction du ballon...");
        buildBall();

        setLoading(60, "Installation de la caméra rapprochée...");
        buildCamera();

        setLoading(68, "Création des équipes...");
        buildTeams();

        const initialHome = teamBySelectValue("mare-rouge");
        const initialAway = teamBySelectValue("mole-saint-nicolas");

        STATE.homeTeam = initialHome;
        STATE.awayTeam = initialAway;

        rebuildPlayers();

        setLoading(80, "Activation des contrôles Android...");
        setupJoystick();
        setupPinchZoom();

        STATE.app.on("update", gameUpdate);

        window.addEventListener("resize", resizeCanvas);

        document.addEventListener("visibilitychange", () => {
            if (document.hidden && STATE.match.active) {
                STATE.match.paused = true;
            }
        });

        setLoading(88, "Chargement des sauvegardes...");
        STATE.db = await openDatabase();

        await loadGame();

        setLoading(95, "Préparation des menus...");
        populateTeamSelect(DOM.homeTeamSelect, initialHome.id);
        populateTeamSelect(DOM.awayTeamSelect, initialAway.id);

        renderTeamsList();
        renderChampionships();
        renderTournaments();
        renderEquipment("kits");

        updateProfileUI();
        applySettingsToUI();

        startAutosave();

        setLoading(100, "Le jeu est prêt.");

        STATE.initialized = true;

        if (DOM.engineStatus) {
            DOM.engineStatus.textContent =
                "PLAYCANVAS 3D · CAMÉRA RAPPROCHÉE · PINCH 2 DOIGTS";
        }

        resizeCanvas();
        hideLoading();

        toast("FOBAS FOOTBALL ULTIMATE 3D est prêt.");
    }

    /* ============================================================
       LIAISON DES BOUTONS HTML
    ============================================================ */

    function setupNavigation() {
        bind("playMatchBtn", "click", () => {
            populateTeamSelect(DOM.homeTeamSelect, STATE.homeTeam?.id);
            populateTeamSelect(DOM.awayTeamSelect, STATE.awayTeam?.id);
            showScreen("matchSetupScreen");
        });

        bind("continueCareerBtn", "click", () => {
            const home = STATE.homeTeam || STATE.teams[0];
            let away = STATE.awayTeam || STATE.teams[1];

            if (home.id === away.id) {
                away = STATE.teams.find((team) => team.id !== home.id);
            }

            startMatch(home, away);
        });

        bind("championshipsBtn", "click", () => {
            renderChampionships();
            showScreen("championshipScreen");
        });

        bind("tournamentsBtn", "click", () => {
            renderTournaments();
            showScreen("tournamentScreen");
        });

        bind("teamsBtn", "click", () => {
            renderTeamsList();
            showScreen("teamsScreen");
        });

        bind("equipmentBtn", "click", () => {
            renderEquipment("kits");
            showScreen("equipmentScreen");
        });

        bind("profileBtn", "click", () => {
            updateProfileUI();
            showScreen("profileScreen");
        });

        bind("howToPlayBtn", "click", () => {
            showScreen("howToPlayScreen");
        });

        bind("openSettingsBtn", "click", () => {
            showScreen("settingsScreen");
        });

        $all("[data-back]").forEach((button) => {
            button.addEventListener("click", () => {
                const target = button.dataset.back || "mainMenu";
                showScreen(target);
            });
        });
    }

    function setupMatchControls() {
        bind("confirmMatchBtn", "click", startMatchFromForm);

        bind("passBtn", "click", passBall);
        bind("shootBtn", "click", shootBall);
        bind("defendBtn", "click", defendAction);
        bind("switchPlayerBtn", "click", switchPlayer);

        bind("sprintBtn", "pointerdown", (event) => {
            event.preventDefault();
            sprintStart();
        });

        ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
            bind("sprintBtn", eventName, sprintEnd);
        });

        bind("cameraZoomInBtn", "click", zoomIn);
        bind("cameraZoomOutBtn", "click", zoomOut);
        bind("cameraResetBtn", "click", resetCamera);
        bind("changeCameraBtn", "click", changeCameraMode);

        bind("showTacticsBtn", "click", openTactics);
        bind("saveMatchBtn", "click", () => saveGame(true));
        bind("exitMatchBtn", "click", quitMatch);

        bind("pauseGameBtn", "click", pauseMatch);
        bind("resumeGameBtn", "click", resumeMatch);
        bind("savePausedMatchBtn", "click", () => saveGame(true));
        bind("quitPausedMatchBtn", "click", quitMatch);
    }

    function setupMenus() {
        bind("teamSearchInput", "input", renderTeamsList);
        bind("teamRegionSelect", "change", renderTeamsList);

        bind("refreshTeamsBtn", "click", () => {
            buildTeams();
            populateTeamSelect(DOM.homeTeamSelect);
            populateTeamSelect(DOM.awayTeamSelect);
            renderTeamsList();

            toast("Liste des équipes actualisée.");
        });

        bind("startChampionshipBtn", "click", () => {
            const home = STATE.homeTeam || STATE.teams[0];

            let away = STATE.teams.find((team) => team.id !== home.id);

            if (DOM.competitionSelect) {
                DOM.competitionSelect.value = STATE.selectedCompetitionLevel;
            }

            startMatch(home, away);
        });

        bind("createTournamentBtn", "click", createTournament);

        bind("applyEquipmentBtn", "click", applyEquipment);

        bind("saveProfileBtn", "click", saveProfile);
        bind("saveSettingsBtn", "click", saveSettings);

        bind("soundToggleBtn", "click", toggleSound);

        bind("closeDialogBtn", "click", closeDialog);

        bind("closeTacticsBtn", "click", closeTactics);
        bind("applyTacticsBtn", "click", applyTactics);

        $all("[data-equipment-tab]").forEach((button) => {
            button.addEventListener("click", () => {
                renderEquipment(button.dataset.equipmentTab);
            });
        });

        document.addEventListener("click", (event) => {
            const teamButton = event.target.closest("[data-select-team]");

            if (teamButton) {
                const team = findTeamById(teamButton.dataset.selectTeam);

                showDialog(
                    team.name,
                    `
                        <p><strong>Région :</strong> ${safeText(team.region)}</p>
                        <p><strong>Niveau :</strong> ${team.strength}/100</p>
                        <p><strong>Classement :</strong> ${team.rating}</p>
                    `,
                    [
                        {
                            label: "DOMICILE",
                            className: "ui-button button-primary",
                            onClick: () => {
                                populateTeamSelect(DOM.homeTeamSelect, team.id);
                                closeDialog();
                                toast(team.name + " choisie à domicile.");
                            }
                        },
                        {
                            label: "VISITEUR",
                            className: "ui-button button-secondary",
                            onClick: () => {
                                populateTeamSelect(DOM.awayTeamSelect, team.id);
                                closeDialog();
                                toast(team.name + " choisie comme visiteur.");
                            }
                        }
                    ]
                );
                return;
            }

            const competitionButton = event.target.closest("[data-competition]");

            if (competitionButton) {
                STATE.selectedCompetitionLevel =
                    competitionButton.dataset.competition;

                if (DOM.competitionSelect) {
                    DOM.competitionSelect.value =
                        STATE.selectedCompetitionLevel;
                }

                renderChampionships();
                toast("Compétition sélectionnée.");
                return;
            }

            const tournamentButton = event.target.closest("[data-tournament-level]");

            if (tournamentButton) {
                STATE.selectedCompetitionLevel =
                    tournamentButton.dataset.tournamentLevel;

                toast("Tournoi sélectionné : " + STATE.selectedCompetitionLevel);
                return;
            }

            const equipmentButton = event.target.closest("[data-equipment-id]");

            if (equipmentButton) {
                STATE.equipment.selected = equipmentButton.dataset.equipmentId;
                renderEquipment(STATE.activeEquipmentTab);
            }
        });

        if (DOM.soundVolumeInput) {
            DOM.soundVolumeInput.addEventListener("input", () => {
                STATE.settings.volume = Number(DOM.soundVolumeInput.value);

                if (STATE.masterGain && STATE.audioContext) {
                    STATE.masterGain.gain.setTargetAtTime(
                        STATE.settings.sound
                            ? STATE.settings.volume / 100
                            : 0,
                        STATE.audioContext.currentTime,
                        0.03
                    );
                }
            });
        }

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeDialog();
                closeTactics();
                DOM.pauseOverlay?.classList.add("hidden");
            }

            if (!STATE.match.active || STATE.match.paused) return;

            switch (event.key.toLowerCase()) {
                case "w":
                case "arrowup":
                    STATE.joystick.y = -1;
                    break;

                case "s":
                case "arrowdown":
                    STATE.joystick.y = 1;
                    break;

                case "a":
                case "arrowleft":
                    STATE.joystick.x = -1;
                    break;

                case "d":
                case "arrowright":
                    STATE.joystick.x = 1;
                    break;

                case " ":
                    shootBall();
                    break;

                case "e":
                    passBall();
                    break;

                case "q":
                    switchPlayer();
                    break;

                case "shift":
                    sprintStart();
                    break;
            }
        });

        document.addEventListener("keyup", (event) => {
            switch (event.key.toLowerCase()) {
                case "w":
                case "arrowup":
                case "s":
                case "arrowdown":
                    STATE.joystick.y = 0;
                    break;

                case "a":
                case "arrowleft":
                case "d":
                case "arrowright":
                    STATE.joystick.x = 0;
                    break;

                case "shift":
                    sprintEnd();
                    break;
            }
        });
    }

    /* ============================================================
       DÉMARRAGE
    ============================================================ */

    async function boot() {
        setupNavigation();
        setupMatchControls();
        setupMenus();

        bind("retryLoadingBtn", "click", async () => {
            if (DOM.retryLoadingBtn) {
                DOM.retryLoadingBtn.classList.add("hidden");
            }

            try {
                await initializeEngine();
            } catch (error) {
                showLoadingError(error);
            }
        });

        try {
            await initializeEngine();
        } catch (error) {
            showLoadingError(error);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }

})();
