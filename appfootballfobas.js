/* ============================================================
   FOBAS FOOTBALL ULTIMATE 3D
   JavaScript principal — Version 1.0.0
   PlayCanvas 2.23.2 — import() dynamique
   Android First — IndexedDB — Français

   Fichier : appfootballfobas.js
   Dépendance externe : PlayCanvas 2.23.2

   Compatible avec les ID du HTML fourni.
============================================================ */

(() => {
    "use strict";

    if (window.__FOBAS_FOOTBALL_INITIALIZED__) return;
    window.__FOBAS_FOOTBALL_INITIALIZED__ = true;

    /* ========================================================
       1. CONFIGURATION
    ======================================================== */

    const CONFIG = window.FOBAS_FOOTBALL_CONFIG || {};

    const APP_NAME = CONFIG.appName || "FOBAS FOOTBALL ULTIMATE 3D";
    const DB_NAME = CONFIG.databaseName || "FOBAS_FOOTBALL_ULTIMATE_DB";
    const DB_VERSION = CONFIG.databaseVersion || 1;
    const ENGINE_VERSION = CONFIG.engineVersion || "2.23.2";

    const PLAYER_NAMES = Array.isArray(CONFIG.playerNames)
        ? CONFIG.playerNames
        : ["MEME", "Ranise", "Kerlande", "Junior", "Nina"];

    const REGIONS = [
        {
            id: "northwest",
            name: "Nord-Ouest",
            communes: [
                "Port-de-Paix",
                "Môle-Saint-Nicolas",
                "Jean-Rabel",
                "Bombardopolis",
                "Baie-de-Henne",
                "Bassin-Bleu",
                "Chansolme",
                "Saint-Louis-du-Nord",
                "Anse-à-Foleur",
                "La Tortue",
                "Mare-Rouge"
            ]
        },
        {
            id: "north",
            name: "Nord",
            communes: [
                "Cap-Haïtien",
                "Limonade",
                "Quartier-Morin",
                "Milot",
                "Grande-Rivière-du-Nord",
                "Saint-Raphaël",
                "Plaisance",
                "Borgne",
                "Dondon",
                "Acul-du-Nord"
            ]
        },
        {
            id: "northeast",
            name: "Nord-Est",
            communes: [
                "Fort-Liberté",
                "Ouanaminthe",
                "Trou-du-Nord",
                "Caracol",
                "Ferrier",
                "Vallières",
                "Mont-Organisé"
            ]
        },
        {
            id: "artibonite",
            name: "Artibonite",
            communes: [
                "Gonaïves",
                "Saint-Marc",
                "Dessalines",
                "Petite-Rivière-de-l'Artibonite",
                "Verrettes",
                "L'Estère",
                "Gros-Morne",
                "Ennery",
                "Marchand-Dessalines"
            ]
        },
        {
            id: "center",
            name: "Centre",
            communes: [
                "Hinche",
                "Mirebalais",
                "Lascahobas",
                "Belladère",
                "Thomassique",
                "Cerca-la-Source",
                "Maïssade"
            ]
        },
        {
            id: "west",
            name: "Ouest",
            communes: [
                "Port-au-Prince",
                "Pétion-Ville",
                "Carrefour",
                "Delmas",
                "Tabarre",
                "Croix-des-Bouquets",
                "Léogâne",
                "Petit-Goâve",
                "Grand-Goâve",
                "Kenscoff",
                "Gressier"
            ]
        },
        {
            id: "south",
            name: "Sud",
            communes: [
                "Les Cayes",
                "Torbeck",
                "Aquin",
                "Cavaillon",
                "Port-Salut",
                "Chantal",
                "Camp-Perrin",
                "Côteaux",
                "Roche-à-Bateaux"
            ]
        },
        {
            id: "southeast",
            name: "Sud-Est",
            communes: [
                "Jacmel",
                "Marigot",
                "Cayes-Jacmel",
                "Bainet",
                "Belle-Anse",
                "Anse-à-Pitres",
                "La Vallée-de-Jacmel"
            ]
        },
        {
            id: "grandanse",
            name: "Grand'Anse",
            communes: [
                "Jérémie",
                "Abricots",
                "Anse-d'Hainault",
                "Dame-Marie",
                "Corail",
                "Chambellan",
                "Pestel",
                "Roseaux"
            ]
        },
        {
            id: "nippes",
            name: "Nippes",
            communes: [
                "Miragoâne",
                "Anse-à-Veau",
                "Petit-Trou-de-Nippes",
                "Baradères",
                "L'Asile",
                "Paillant",
                "Petite-Rivière-de-Nippes"
            ]
        }
    ];

    const COMPETITIONS = Array.isArray(CONFIG.competitionLevels)
        ? CONFIG.competitionLevels
        : [];

    const DURATIONS = {
        short: {
            label: "Match rapide",
            seconds: 180
        },
        standard: {
            label: "Match standard",
            seconds: 360
        },
        long: {
            label: "Match long",
            seconds: 720
        }
    };

    const FORMATIONS = {
        "442": [1, 4, 4, 2],
        "433": [1, 4, 3, 3],
        "352": [1, 3, 5, 2],
        "4231": [1, 4, 2, 3, 1],
        "541": [1, 5, 4, 1]
    };

    const $ = (id) => document.getElementById(id);

    const state = {
        engine: null,
        app: null,
        db: null,
        materials: {},
        screen: "mainMenu",
        running: false,
        paused: false,
        soundEnabled: true,
        audioContext: null,
        musicTimer: null,
        matchTimer: null,
        lastFrame: 0,
        frameAccumulator: 0,
        match: null,
        career: null,
        activeCompetition: null,
        activeTournament: null,
        selectedEquipment: {
            kits: "classic",
            balls: "classic",
            boots: "classic"
        },
        equipmentTab: "kits",
        selectedTeamId: null,
        selectedChampionship: "local",
        settings: {
            graphics: "medium",
            volume: 70,
            cameraSensitivity: 50,
            difficulty: "normal",
            vibration: true,
            commentary: true
        },
        profile: {
            name: "Joueur FOBAS",
            favoriteTeam: "mare-rouge",
            matchesPlayed: 0,
            goalsScored: 0,
            trophies: 0
        },
        statistics: {
            matchesPlayed: 0,
            goalsScored: 0,
            trophies: 0
        },
        teams: [],
        toastTimer: null,
        animationFrame: 0,
        gameOver: false,
        cameraMode: 0,
        pinchDistance: null,
        pointerPositions: new Map(),
        joystick: {
            active: false,
            pointerId: null,
            x: 0,
            y: 0
        },
        selectedPlayer: 0,
        ballOwner: null,
        lastSaveTime: 0,
        eventListeners: [],
        shuttingDown: false
    };

    /* ========================================================
       2. UTILITAIRES
    ======================================================== */

    function safeText(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function random(min, max) {
        return min + Math.random() * (max - min);
    }

    function randomInt(min, max) {
        return Math.floor(random(min, max + 1));
    }

    function pick(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function formatClock(seconds) {
        const safe = Math.max(0, Math.floor(seconds));
        const minutes = Math.floor(safe / 60);
        const remaining = safe % 60;

        return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
    }

    function announce(message, title = "FOBAS FOOTBALL", duration = 2500) {
        const box = $("matchAnnouncement");

        if (box) {
            const titleNode = $("announcementTitle");
            const messageNode = $("announcementMessage");

            if (titleNode) titleNode.textContent = title;
            if (messageNode) messageNode.textContent = message;

            box.classList.remove("hidden");

            window.clearTimeout(state.toastTimer);

            state.toastTimer = window.setTimeout(() => {
                box.classList.add("hidden");
            }, duration);
        }

        toast(message);
    }

    function toast(message, type = "info") {
        const container = $("toastContainer");
        if (!container) return;

        const item = document.createElement("div");
        item.className = `fobas-toast fobas-toast-${type}`;
        item.textContent = message;

        Object.assign(item.style, {
            padding: "12px 15px",
            margin: "6px",
            borderRadius: "10px",
            background: type === "error"
                ? "#8b2635"
                : type === "success"
                    ? "#176b47"
                    : "#142d49",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "700",
            boxShadow: "0 5px 20px #0005",
            maxWidth: "min(92vw, 420px)"
        });

        container.appendChild(item);

        window.setTimeout(() => {
            item.remove();
        }, 3200);
    }

    function setLoading(percent, message) {
        const progress = clamp(percent, 0, 100);
        const bar = $("loadingProgressBar");
        const track = $("loadingProgressTrack");
        const label = $("loadingPercent");
        const text = $("loadingMessage");

        if (bar) bar.style.width = `${progress}%`;

        if (track) {
            track.setAttribute("aria-valuenow", String(Math.round(progress)));
        }

        if (label) label.textContent = `${Math.round(progress)} %`;
        if (text && message) text.textContent = message;
    }

    function setEngineStatus(message) {
        const node = $("engineStatus");
        if (node) node.textContent = message;
    }

    function showLoadingError(message) {
        setLoading(100, message);

        const retry = $("retryLoadingBtn");
        if (retry) retry.classList.remove("hidden");

        toast(message, "error");
    }

    function addListener(element, eventName, handler, options) {
        if (!element) return;

        element.addEventListener(eventName, handler, options);

        state.eventListeners.push(() => {
            element.removeEventListener(eventName, handler, options);
        });
    }

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;

        return element;
    }

    /* ========================================================
       3. INDEXEDDB
    ======================================================== */

    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!("indexedDB" in window)) {
                reject(new Error("IndexedDB n'est pas disponible."));
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = () => {
                const db = request.result;

                [
                    "profile",
                    "settings",
                    "teams",
                    "matches",
                    "competitions",
                    "tournaments",
                    "career",
                    "equipment"
                ].forEach((storeName) => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, {
                            keyPath: "id"
                        });
                    }
                });
            };

            request.onsuccess = () => resolve(request.result);

            request.onerror = () => {
                reject(request.error || new Error("Impossible d'ouvrir IndexedDB."));
            };
        });
    }

    function dbWrite(storeName, value) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                reject(new Error("Base de données indisponible."));
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

    function dbRead(storeName, id) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                reject(new Error("Base de données indisponible."));
                return;
            }

            try {
                const transaction = state.db.transaction(storeName, "readonly");
                const request = transaction.objectStore(storeName).get(id);

                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => reject(request.error);
            } catch (error) {
                reject(error);
            }
        });
    }

    function dbReadAll(storeName) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                reject(new Error("Base de données indisponible."));
                return;
            }

            try {
                const transaction = state.db.transaction(storeName, "readonly");
                const request = transaction.objectStore(storeName).getAll();

                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            } catch (error) {
                reject(error);
            }
        });
    }

    async function saveData(storeName, id, data) {
        try {
            await dbWrite(storeName, {
                id,
                updatedAt: Date.now(),
                ...data
            });

            const label = $("saveStatusLabel");
            if (label) label.textContent = "Sauvegarde locale effectuée";

            state.lastSaveTime = Date.now();
            return true;
        } catch (error) {
            console.error(`[FOBAS] Sauvegarde ${storeName}:`, error);
            toast("La sauvegarde locale a échoué.", "error");
            return false;
        }
    }

    async function loadSavedData() {
        const [
            savedProfile,
            savedSettings,
            savedEquipment,
            savedCareer,
            savedMatch,
            savedCompetition
        ] = await Promise.all([
            dbRead("profile", "main").catch(() => null),
            dbRead("settings", "main").catch(() => null),
            dbRead("equipment", "main").catch(() => null),
            dbRead("career", "main").catch(() => null),
            dbRead("matches", "active").catch(() => null),
            dbRead("competitions", "active").catch(() => null)
        ]);

        if (savedProfile) {
            Object.assign(state.profile, savedProfile.data || {});
        }

        if (savedSettings) {
            Object.assign(state.settings, savedSettings.data || {});
        }

        if (savedEquipment) {
            Object.assign(state.selectedEquipment, savedEquipment.data || {});
        }

        if (savedCareer) {
            state.career = savedCareer.data || null;
        }

        if (savedMatch && savedMatch.data) {
            state.savedMatch = savedMatch.data;
        }

        if (savedCompetition && savedCompetition.data) {
            state.activeCompetition = savedCompetition.data;
        }

        state.statistics.matchesPlayed = Number(state.profile.matchesPlayed) || 0;
        state.statistics.goalsScored = Number(state.profile.goalsScored) || 0;
        state.statistics.trophies = Number(state.profile.trophies) || 0;

        updateProfileUI();
        applySettingsToUI();
    }

    /* ========================================================
       4. GÉNÉRATION DES ÉQUIPES
    ======================================================== */

    const WORLD_TEAMS = [
        ["Haïti", "Port-au-Prince", "haiti"],
        ["Haïti", "Cap-Haïtien", "haiti"],
        ["Haïti", "Gonaïves", "haiti"],
        ["Haïti", "Les Cayes", "haiti"],
        ["Haïti", "Jacmel", "haiti"],
        ["Jamaïque", "Kingston", "caribbean"],
        ["Trinité-et-Tobago", "Port of Spain", "caribbean"],
        ["République dominicaine", "Saint-Domingue", "caribbean"],
        ["Cuba", "La Havane", "caribbean"],
        ["Barbade", "Bridgetown", "caribbean"],
        ["États-Unis", "New York", "americas"],
        ["États-Unis", "Los Angeles", "americas"],
        ["Canada", "Toronto", "americas"],
        ["Mexique", "Mexico", "americas"],
        ["Brésil", "Rio de Janeiro", "americas"],
        ["Argentine", "Buenos Aires", "americas"],
        ["Colombie", "Bogotá", "americas"],
        ["Chili", "Santiago", "americas"],
        ["Pérou", "Lima", "americas"],
        ["Uruguay", "Montevideo", "americas"],
        ["France", "Paris", "europe"],
        ["Espagne", "Madrid", "europe"],
        ["Angleterre", "Londres", "europe"],
        ["Italie", "Rome", "europe"],
        ["Allemagne", "Berlin", "europe"],
        ["Portugal", "Lisbonne", "europe"],
        ["Pays-Bas", "Amsterdam", "europe"],
        ["Belgique", "Bruxelles", "europe"],
        ["Croatie", "Zagreb", "europe"],
        ["Suisse", "Berne", "europe"],
        ["Sénégal", "Dakar", "africa"],
        ["Maroc", "Rabat", "africa"],
        ["Côte d'Ivoire", "Abidjan", "africa"],
        ["Cameroun", "Yaoundé", "africa"],
        ["Nigeria", "Abuja", "africa"],
        ["Ghana", "Accra", "africa"],
        ["Égypte", "Le Caire", "africa"],
        ["Afrique du Sud", "Pretoria", "africa"],
        ["Algérie", "Alger", "africa"],
        ["Tunisie", "Tunis", "africa"],
        ["Japon", "Tokyo", "international"],
        ["Corée du Sud", "Séoul", "international"],
        ["Chine", "Pékin", "international"],
        ["Australie", "Sydney", "international"],
        ["Nouvelle-Zélande", "Auckland", "international"]
    ];

    function slugify(value) {
        return String(value)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function makeTeam(id, name, region, locality, country, index) {
        const hue = (index * 47 + 180) % 360;

        return {
            id,
            name,
            region,
            locality,
            country,
            primaryColor: `hsl(${hue}, 72%, 42%)`,
            secondaryColor: `hsl(${(hue + 160) % 360}, 75%, 82%)`,
            rating: randomInt(55, 90),
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0
        };
    }

    function generateTeams() {
        const teams = [];
        let index = 0;

        REGIONS.forEach((region) => {
            region.communes.forEach((locality) => {
                const id = slugify(locality);

                teams.push(
                    makeTeam(
                        id,
                        `${locality.toUpperCase()} FC`,
                        region.id === "northwest" ? "northwest" : "haiti",
                        locality,
                        "Haïti",
                        index++
                    )
                );
            });
        });

        WORLD_TEAMS.forEach(([country, locality, region]) => {
            const id = `club-${slugify(locality)}-${slugify(country)}`;

            if (!teams.some((team) => team.id === id)) {
                teams.push(
                    makeTeam(
                        id,
                        `${locality.toUpperCase()} FC`,
                        region,
                        locality,
                        country,
                        index++
                    )
                );
            }
        });

        const extraNames = [
            "FOBAS LEGENDS",
            "FOBAS UNITED",
            "MASTER STARS",
            "TROPICAL FC",
            "CARIBBEAN ELITE",
            "NORD-OUEST ALL STARS",
            "HAÏTI CHAMPIONS",
            "FOBAS ACADEMY",
            "PORT-DE-PAIX UNITED",
            "MARE-ROUGE LEGENDS",
            "JEAN-RABEL STARS",
            "MOLE FOOTBALL CLUB",
            "GRAND NORD FC",
            "HAÏTI ROYAL",
            "WORLD ELITE FC"
        ];

        extraNames.forEach((name) => {
            const id = slugify(name);

            if (!teams.some((team) => team.id === id)) {
                teams.push(
                    makeTeam(
                        id,
                        name,
                        "haiti",
                        "Haïti",
                        "Haïti",
                        index++
                    )
                );
            }
        });

        while (teams.length < (Number(CONFIG.initialTeamCount) || 100)) {
            const number = teams.length + 1;

            teams.push(
                makeTeam(
                    `fobas-club-${number}`,
                    `FOBAS CLUB ${String(number).padStart(3, "0")}`,
                    "international",
                    "FOBAS",
                    "International",
                    index++
                )
            );
        }

        return teams;
    }

    async function initializeTeams() {
        state.teams = generateTeams();

        try {
            const savedTeams = await dbReadAll("teams");

            if (savedTeams.length) {
                const byId = new Map(
                    savedTeams.map((item) => [item.id, item])
                );

                state.teams = state.teams.map((team) => {
                    const saved = byId.get(team.id);
                    return saved ? { ...team, ...saved.data } : team;
                });
            }

            for (const team of state.teams) {
                await dbWrite("teams", {
                    id: team.id,
                    data: team
                });
            }
        } catch (error) {
            console.warn("[FOBAS] Les équipes utilisent les données en mémoire.", error);
        }

        populateTeamSelects();
        renderTeams();
    }

    function populateTeamSelects() {
        const selects = [
            $("homeTeamSelect"),
            $("awayTeamSelect"),
            $("profileFavoriteTeam")
        ].filter(Boolean);

        selects.forEach((select) => {
            const previous = select.value;

            select.replaceChildren();

            state.teams.forEach((team) => {
                const option = document.createElement("option");
                option.value = team.id;
                option.textContent = team.name;
                select.appendChild(option);
            });

            if (state.teams.some((team) => team.id === previous)) {
                select.value = previous;
            }
        });

        if ($("homeTeamSelect") && $("awayTeamSelect")) {
            if ($("homeTeamSelect").value === $("awayTeamSelect").value) {
                const alternative = state.teams.find(
                    (team) => team.id !== $("homeTeamSelect").value
                );

                if (alternative) $("awayTeamSelect").value = alternative.id;
            }
        }
    }

    function getTeam(id) {
        return state.teams.find((team) => team.id === id) || state.teams[0];
    }

    function renderTeams() {
        const container = $("teamsList");
        if (!container) return;

        const search = ($("teamSearchInput")?.value || "")
            .trim()
            .toLowerCase();

        const regionFilter = $("teamRegionSelect")?.value || "all";

        const filtered = state.teams.filter((team) => {
            const text = `${team.name} ${team.locality} ${team.country}`.toLowerCase();

            const matchesSearch = !search || text.includes(search);
            const matchesRegion = regionFilter === "all"
                || team.region === regionFilter;

            return matchesSearch && matchesRegion;
        });

        container.replaceChildren();

        if (!filtered.length) {
            container.appendChild(
                createElement("p", "empty-state", "Aucune équipe trouvée.")
            );
        }

        filtered.forEach((team) => {
            const card = createElement("article", "team-card");
            card.style.borderLeft = `5px solid ${team.primaryColor}`;

            const name = createElement("strong", "team-card-name", team.name);
            const locality = createElement(
                "span",
                "team-card-locality",
                `${team.locality} · ${team.country}`
            );

            const rating = createElement(
                "span",
                "team-card-rating",
                `Niveau ${team.rating}`
            );

            const choose = createElement(
                "button",
                "ui-button button-secondary",
                "Choisir cette équipe"
            );

            choose.type = "button";

            choose.addEventListener("click", () => {
                state.selectedTeamId = team.id;

                if ($("homeTeamSelect")) {
                    $("homeTeamSelect").value = team.id;
                }

                if ($("profileFavoriteTeam")) {
                    $("profileFavoriteTeam").value = team.id;
                }

                showScreen("matchSetupScreen");
                toast(`${team.name} sélectionnée.`, "success");
            });

            card.append(name, locality, rating, choose);
            container.appendChild(card);
        });

        const count = $("teamCountLabel");

        if (count) {
            count.textContent = `${filtered.length} équipe(s) disponible(s)`;
        }
    }

    /* ========================================================
       5. NAVIGATION ET INTERFACE
    ======================================================== */

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

    function showScreen(screenId) {
        if (!SCREEN_IDS.includes(screenId)) return;

        SCREEN_IDS.forEach((id) => {
            const node = $(id);
            if (!node) return;

            node.classList.toggle("hidden", id !== screenId);
        });

        state.screen = screenId;

        if (screenId === "matchScreen") {
            resizeCanvas();
        }

        if (screenId === "championshipScreen") {
            renderChampionships();
        }

        if (screenId === "tournamentScreen") {
            renderTournaments();
        }

        if (screenId === "equipmentScreen") {
            renderEquipment();
        }

        if (screenId === "profileScreen") {
            updateProfileUI();
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showDialog(title, content, actions = []) {
        const overlay = $("dialogOverlay");
        const titleNode = $("dialogTitle");
        const contentNode = $("dialogContent");
        const actionsNode = $("dialogActions");

        if (!overlay || !titleNode || !contentNode || !actionsNode) return;

        titleNode.textContent = title;
        contentNode.replaceChildren();
        actionsNode.replaceChildren();

        if (typeof content === "string") {
            const paragraph = document.createElement("p");
            paragraph.textContent = content;
            contentNode.appendChild(paragraph);
        } else if (content instanceof Node) {
            contentNode.appendChild(content);
        }

        actions.forEach((action) => {
            const button = createElement(
                "button",
                action.className || "ui-button button-secondary",
                action.label
            );

            button.type = "button";

            button.addEventListener("click", async () => {
                if (action.onClick) await action.onClick();
            });

            actionsNode.appendChild(button);
        });

        overlay.classList.remove("hidden");
    }

    function closeDialog() {
        $("dialogOverlay")?.classList.add("hidden");
    }

    function showPause() {
        if (!state.match || state.gameOver) return;

        state.paused = true;
        $("pauseOverlay")?.classList.remove("hidden");
    }

    function resumeMatch() {
        state.paused = false;
        $("pauseOverlay")?.classList.add("hidden");
    }

    function openSettings() {
        showScreen("settingsScreen");
    }

    /* ========================================================
       6. PROFIL ET PARAMÈTRES
    ======================================================== */

    function updateProfileUI() {
        if ($("profileNameInput")) {
            $("profileNameInput").value = state.profile.name || "Joueur FOBAS";
        }

        if ($("profileFavoriteTeam")) {
            const id = state.profile.favoriteTeam;

            if (state.teams.some((team) => team.id === id)) {
                $("profileFavoriteTeam").value = id;
            }
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
        state.profile.name =
            ($("profileNameInput")?.value || "Joueur FOBAS").trim()
            || "Joueur FOBAS";

        state.profile.favoriteTeam =
            $("profileFavoriteTeam")?.value || "mare-rouge";

        state.profile.matchesPlayed = state.statistics.matchesPlayed;
        state.profile.goalsScored = state.statistics.goalsScored;
        state.profile.trophies = state.statistics.trophies;

        await saveData("profile", "main", {
            data: { ...state.profile }
        });

        updateProfileUI();
        toast("Profil sauvegardé.", "success");
    }

    function applySettingsToUI() {
        if ($("graphicsQualitySelect")) {
            $("graphicsQualitySelect").value = state.settings.graphics;
        }

        if ($("soundVolumeInput")) {
            $("soundVolumeInput").value = state.settings.volume;
        }

        if ($("cameraSensitivityInput")) {
            $("cameraSensitivityInput").value = state.settings.cameraSensitivity;
        }

        if ($("matchDifficultySelect")) {
            $("matchDifficultySelect").value = state.settings.difficulty;
        }

        if ($("vibrationToggle")) {
            $("vibrationToggle").checked = Boolean(state.settings.vibration);
        }

        if ($("commentaryToggle")) {
            $("commentaryToggle").checked = Boolean(state.settings.commentary);
        }
    }

    async function saveSettings() {
        state.settings.graphics = $("graphicsQualitySelect")?.value || "medium";
        state.settings.volume = Number($("soundVolumeInput")?.value || 70);
        state.settings.cameraSensitivity =
            Number($("cameraSensitivityInput")?.value || 50);
        state.settings.difficulty = $("matchDifficultySelect")?.value || "normal";
        state.settings.vibration = Boolean($("vibrationToggle")?.checked);
        state.settings.commentary = Boolean($("commentaryToggle")?.checked);

        applyGraphicsQuality();

        await saveData("settings", "main", {
            data: { ...state.settings }
        });

        toast("Paramètres enregistrés.", "success");
    }

    /* ========================================================
       7. ÉQUIPEMENTS
    ======================================================== */

    const EQUIPMENT = {
        kits: [
            { id: "classic", name: "Maillot classique", color: "#e53935" },
            { id: "ocean", name: "Maillot océan", color: "#087bb8" },
            { id: "royal", name: "Maillot royal", color: "#5b3cc4" },
            { id: "gold", name: "Maillot doré", color: "#c79b28" },
            { id: "forest", name: "Maillot forêt", color: "#18734b" }
        ],
        balls: [
            { id: "classic", name: "Ballon classique", color: "#ffffff" },
            { id: "gold", name: "Ballon doré", color: "#e8bf45" },
            { id: "ocean", name: "Ballon océan", color: "#24a9d8" },
            { id: "fire", name: "Ballon feu", color: "#e45b24" }
        ],
        boots: [
            { id: "classic", name: "Chaussures classiques", color: "#20242a" },
            { id: "gold", name: "Chaussures dorées", color: "#c9a332" },
            { id: "fire", name: "Chaussures rouges", color: "#c93535" }
        ]
    };

    function renderEquipment() {
        const container = $("equipmentItemsList");
        if (!container) return;

        const items = EQUIPMENT[state.equipmentTab] || [];
        container.replaceChildren();

        items.forEach((item) => {
            const card = createElement("button", "equipment-item");

            card.type = "button";
            card.style.border = state.selectedEquipment[state.equipmentTab] === item.id
                ? "2px solid #e5b84c"
                : "1px solid #64748b";

            card.style.padding = "14px";
            card.style.margin = "6px";
            card.style.borderRadius = "12px";
            card.style.color = "inherit";

            const swatch = createElement("span", "equipment-swatch");
            Object.assign(swatch.style, {
                display: "block",
                width: "36px",
                height: "36px",
                marginBottom: "8px",
                borderRadius: "50%",
                background: item.color
            });

            const label = createElement("strong", "", item.name);

            card.append(swatch, label);

            card.addEventListener("click", () => {
                state.selectedEquipment[state.equipmentTab] = item.id;
                renderEquipment();
            });

            container.appendChild(card);
        });
    }

    async function applyEquipment() {
        await saveData("equipment", "main", {
            data: { ...state.selectedEquipment }
        });

        toast("Équipement appliqué.", "success");
    }

    /* ========================================================
       8. CHAMPIONNATS ET TOURNOIS
    ======================================================== */

    function makeCompetition(levelId, customName) {
        const level = COMPETITIONS.find((item) => item.id === levelId)
            || COMPETITIONS[0]
            || { id: "local", name: "Matchs locaux" };

        const teamList = [...state.teams]
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.min(8, state.teams.length));

        if (teamList.length < 2) {
            throw new Error("Il faut au moins deux équipes.");
        }

        const fixtures = [];

        for (let round = 0; round < teamList.length - 1; round++) {
            for (let i = 0; i < Math.floor(teamList.length / 2); i++) {
                const home = teamList[i];
                const away = teamList[teamList.length - 1 - i];

                if (home && away) {
                    fixtures.push({
                        id: `fixture-${round}-${i}-${Date.now()}`,
                        homeTeamId: home.id,
                        awayTeamId: away.id,
                        round: round + 1,
                        played: false,
                        homeScore: null,
                        awayScore: null
                    });
                }
            }

            const fixed = teamList[0];
            const rotating = teamList.slice(1);
            rotating.unshift(rotating.pop());
            teamList.splice(0, teamList.length, fixed, ...rotating);
        }

        return {
            id: `competition-${Date.now()}`,
            name: customName || level.name,
            levelId: level.id,
            teams: teamList.map((team) => team.id),
            fixtures,
            currentFixture: 0,
            completed: false,
            createdAt: Date.now()
        };
    }

    function makeTournament(name, teamCount = 8) {
        const teams = [...state.teams]
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.min(teamCount, state.teams.length));

        return {
            id: `tournament-${Date.now()}`,
            name,
            teams: teams.map((team) => team.id),
            rounds: [],
            completed: false,
            createdAt: Date.now()
        };
    }

    function renderChampionships() {
        const container = $("competitionLevelsList");
        if (!container) return;

        container.replaceChildren();

        COMPETITIONS.forEach((competition) => {
            const card = createElement("button", "competition-level-card");
            card.type = "button";

            card.style.padding = "16px";
            card.style.marginBottom = "10px";
            card.style.width = "100%";
            card.style.textAlign = "left";
            card.style.borderRadius = "12px";
            card.style.border = state.selectedChampionship === competition.id
                ? "2px solid #e5b84c"
                : "1px solid #60748a";

            const title = createElement("strong", "", competition.name);
            const description = createElement(
                "p",
                "",
                competition.description || ""
            );

            card.append(title, description);

            card.addEventListener("click", () => {
                state.selectedChampionship = competition.id;
                renderChampionships();
            });

            container.appendChild(card);
        });

        if (state.activeCompetition) {
            const summary = createElement(
                "p",
                "competition-progress",
                `${state.activeCompetition.name} — ${state.activeCompetition.fixtures.filter((f) => f.played).length}/${state.activeCompetition.fixtures.length} matchs terminés`
            );

            container.appendChild(summary);
        }
    }

    function renderTournaments() {
        const container = $("tournamentList");
        if (!container) return;

        container.replaceChildren();

        const list = state.tournaments || [];
        state.tournaments = list;

        if (!list.length) {
            container.appendChild(
                createElement(
                    "p",
                    "empty-state",
                    "Aucun tournoi créé. Utilisez le bouton ci-dessous."
                )
            );
        }

        list.forEach((tournament) => {
            const card = createElement("article", "tournament-card");
            const title = createElement("strong", "", tournament.name);
            const status = createElement(
                "p",
                "",
                tournament.completed ? "Tournoi terminé" : "Tournoi disponible"
            );

            const start = createElement(
                "button",
                "ui-button button-primary",
                "Jouer le tournoi"
            );

            start.type = "button";

            start.addEventListener("click", () => {
                state.activeTournament = tournament;
                startTournamentFixture(tournament);
            });

            card.append(title, status, start);
            container.appendChild(card);
        });
    }

    async function startChampionship() {
        try {
            state.activeCompetition = makeCompetition(
                state.selectedChampionship
            );

            await saveData("competitions", "active", {
                data: state.activeCompetition
            });

            renderChampionships();

            showDialog(
                "Championnat prêt",
                `${state.activeCompetition.name} est prêt. ${state.activeCompetition.fixtures.length} matchs ont été programmés.`,
                [
                    {
                        label: "Jouer le premier match",
                        className: "ui-button button-primary",
                        onClick: async () => {
                            closeDialog();
                            await startCompetitionFixture();
                        }
                    },
                    {
                        label: "Plus tard",
                        onClick: closeDialog
                    }
                ]
            );
        } catch (error) {
            console.error(error);
            toast("Impossible de créer ce championnat.", "error");
        }
    }

    async function startCompetitionFixture() {
        const competition = state.activeCompetition;

        if (!competition) {
            toast("Aucun championnat actif.", "error");
            return;
        }

        const fixture = competition.fixtures.find((item) => !item.played);

        if (!fixture) {
            finishCompetition(competition);
            return;
        }

        const home = getTeam(fixture.homeTeamId);
        const away = getTeam(fixture.awayTeamId);

        if ($("homeTeamSelect")) $("homeTeamSelect").value = home.id;
        if ($("awayTeamSelect")) $("awayTeamSelect").value = away.id;

        state.matchContext = {
            type: "competition",
            competitionId: competition.id,
            fixtureId: fixture.id
        };

        closeDialog();
        await startMatch({
            homeTeamId: home.id,
            awayTeamId: away.id,
            competitionName: competition.name,
            duration: "short"
        });
    }

    async function finishCompetition(competition) {
        competition.completed = true;

        const table = new Map();

        competition.teams.forEach((teamId) => {
            table.set(teamId, {
                teamId,
                played: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                points: 0
            });
        });

        competition.fixtures.forEach((fixture) => {
            if (!fixture.played) return;

            const home = table.get(fixture.homeTeamId);
            const away = table.get(fixture.awayTeamId);

            if (!home || !away) return;

            home.played++;
            away.played++;

            home.goalsFor += fixture.homeScore;
            home.goalsAgainst += fixture.awayScore;

            away.goalsFor += fixture.awayScore;
            away.goalsAgainst += fixture.homeScore;

            if (fixture.homeScore > fixture.awayScore) {
                home.wins++;
                home.points += 3;
                away.losses++;
            } else if (fixture.awayScore > fixture.homeScore) {
                away.wins++;
                away.points += 3;
                home.losses++;
            } else {
                home.draws++;
                away.draws++;
                home.points++;
                away.points++;
            }
        });

        const ranking = [...table.values()].sort((a, b) =>
            b.points - a.points
            || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)
            || b.goalsFor - a.goalsFor
        );

        const champion = getTeam(ranking[0]?.teamId);

        state.statistics.trophies++;
        state.profile.trophies = state.statistics.trophies;

        await saveData("competitions", "active", {
            data: competition
        });

        await saveData("profile", "main", {
            data: { ...state.profile }
        });

        const content = document.createElement("div");

        content.appendChild(
            createElement("h3", "", `Champion : ${champion?.name || "FOBAS"}`)
        );

        ranking.forEach((row, index) => {
            const team = getTeam(row.teamId);

            content.appendChild(
                createElement(
                    "p",
                    "",
                    `${index + 1}. ${team.name} — ${row.points} pts — ${row.goalsFor} buts`
                )
            );
        });

        showDialog(
            "Compétition terminée",
            content,
            [
                {
                    label: "Retour aux championnats",
                    className: "ui-button button-primary",
                    onClick: () => {
                        closeDialog();
                        showScreen("championshipScreen");
                        updateProfileUI();
                    }
                }
            ]
        );

        toast(`${champion?.name || "L'équipe gagnante"} remporte la compétition !`, "success");
    }

    async function createTournamentFlow() {
        const input = document.createElement("input");

        input.type = "text";
        input.maxLength = 60;
        input.placeholder = "Nom du tournoi";
        input.value = "Tournoi FOBAS";

        Object.assign(input.style, {
            width: "100%",
            padding: "12px",
            marginTop: "12px",
            boxSizing: "border-box"
        });

        showDialog(
            "Créer un tournoi",
            input,
            [
                {
                    label: "Créer",
                    className: "ui-button button-primary",
                    onClick: async () => {
                        const name = input.value.trim() || "Tournoi FOBAS";

                        state.tournaments ||= [];
                        const tournament = makeTournament(name, 8);

                        state.tournaments.push(tournament);
                        state.activeTournament = tournament;

                        await saveData("tournaments", "all", {
                            data: state.tournaments
                        });

                        closeDialog();
                        renderTournaments();
                        toast("Tournoi créé.", "success");
                    }
                },
                {
                    label: "Annuler",
                    onClick: closeDialog
                }
            ]
        );
    }

    async function startTournamentFixture(tournament) {
        if (!tournament || tournament.teams.length < 2) {
            toast("Le tournoi nécessite au moins deux équipes.", "error");
            return;
        }

        const existing = tournament.fixtures || [];

        let fixture = existing.find((item) => !item.played);

        if (!fixture) {
            const playedCount = existing.length;

            if (playedCount === 0) {
                tournament.fixtures = [];

                for (let i = 0; i + 1 < tournament.teams.length; i += 2) {
                    tournament.fixtures.push({
                        id: `t-${Date.now()}-${i}`,
                        homeTeamId: tournament.teams[i],
                        awayTeamId: tournament.teams[i + 1],
                        played: false,
                        homeScore: null,
                        awayScore: null
                    });
                }

                fixture = tournament.fixtures[0];
            } else if (existing.every((item) => item.played)) {
                tournament.completed = true;

                await saveData("tournaments", "all", {
                    data: state.tournaments || []
                });

                showDialog(
                    "Tournoi terminé",
                    "Tous les matchs programmés ont été terminés. Vous pouvez créer un nouveau tournoi.",
                    [
                        {
                            label: "OK",
                            className: "ui-button button-primary",
                            onClick: () => {
                                closeDialog();
                                renderTournaments();
                            }
                        }
                    ]
                );

                return;
            }
        }

        if (!fixture) {
            toast("Aucun match disponible pour ce tournoi.", "error");
            return;
        }

        state.matchContext = {
            type: "tournament",
            tournamentId: tournament.id,
            fixtureId: fixture.id
        };

        await startMatch({
            homeTeamId: fixture.homeTeamId,
            awayTeamId: fixture.awayTeamId,
            competitionName: tournament.name,
            duration: "short"
        });
    }

    /* ========================================================
       9. MATÉRIAUX ET SCÈNE PLAYCANVAS
    ======================================================== */

    function createMaterial(pc, color, options = {}) {
        const material = new pc.StandardMaterial();

        material.diffuse = new pc.Color(color[0], color[1], color[2]);

        if (options.emissive) {
            material.emissive = new pc.Color(
                options.emissive[0],
                options.emissive[1],
                options.emissive[2]
            );
        }

        material.metalness = options.metalness ?? 0;
        material.gloss = options.gloss ?? 0.25;
        material.update();

        return material;
    }

    function makeEntity(pc, name, type, material, parent, position, scale) {
        const entity = new pc.Entity(name);

        entity.addComponent("render", {
            type,
            material
        });

        entity.setLocalPosition(position[0], position[1], position[2]);
        entity.setLocalScale(scale[0], scale[1], scale[2]);

        parent.addChild(entity);

        return entity;
    }

    function addLight(pc, app, name, position, intensity, color, shadows = false) {
        const light = new pc.Entity(name);

        light.addComponent("light", {
            type: "directional",
            color: new pc.Color(color[0], color[1], color[2]),
            intensity,
            castShadows: shadows,
            shadowResolution: shadows ? 1024 : 256
        });

        light.setLocalPosition(position[0], position[1], position[2]);
        light.setLocalEulerAngles(45, 25, 0);

        app.root.addChild(light);

        return light;
    }

    function addLine(pc, parent, material, x, z, length, horizontal, thickness = 0.045) {
        if (horizontal) {
            return makeEntity(
                pc,
                "FieldLine",
                "box",
                material,
                parent,
                [x, 0.035, z],
                [length, 0.025, thickness]
            );
        }

        return makeEntity(
            pc,
            "FieldLine",
            "box",
            material,
            parent,
            [x, 0.035, z],
            [thickness, 0.025, length]
        );
    }

    function buildPitch(pc, app) {
        const root = new pc.Entity("FootballWorld");
        app.root.addChild(root);

        const grassA = createMaterial(pc, [0.09, 0.39, 0.18]);
        const grassB = createMaterial(pc, [0.12, 0.45, 0.21]);
        const lineMaterial = createMaterial(pc, [0.93, 0.96, 0.92]);
        const goalMaterial = createMaterial(pc, [0.85, 0.88, 0.91]);
        const netMaterial = createMaterial(pc, [0.65, 0.73, 0.78]);

        const fieldLength = 104;
        const fieldWidth = 68;

        makeEntity(
            pc,
            "FieldGround",
            "box",
            grassA,
            root,
            [0, -0.3, 0],
            [fieldWidth + 14, 0.5, fieldLength + 14]
        );

        for (let i = 0; i < 10; i++) {
            const z = -fieldLength / 2 + (i + 0.5) * fieldLength / 10;

            makeEntity(
                pc,
                `GrassStripe${i}`,
                "box",
                i % 2 ? grassA : grassB,
                root,
                [0, -0.035, z],
                [fieldWidth, 0.06, fieldLength / 10]
            );
        }

        addLine(pc, root, lineMaterial, 0, -fieldLength / 2, fieldWidth, true);
        addLine(pc, root, lineMaterial, 0, fieldLength / 2, fieldWidth, true);
        addLine(pc, root, lineMaterial, -fieldWidth / 2, 0, fieldLength, false);
        addLine(pc, root, lineMaterial, fieldWidth / 2, 0, fieldLength, false);
        addLine(pc, root, lineMaterial, 0, 0, fieldLength, false);

        const centerCircle = makeEntity(
            pc,
            "CenterCircle",
            "torus",
            lineMaterial,
            root,
            [0, 0.05, 0],
            [9.15, 0.08, 9.15]
        );

        centerCircle.setLocalEulerAngles(90, 0, 0);

        makeEntity(
            pc,
            "CenterSpot",
            "sphere",
            lineMaterial,
            root,
            [0, 0.06, 0],
            [0.24, 0.08, 0.24]
        );

        [-1, 1].forEach((side) => {
            const z = side * (fieldLength / 2 - 16.5);

            addLine(pc, root, lineMaterial, 0, z, 40.3, true);
            addLine(pc, root, lineMaterial, -20.15, z - side * 5.5, 11, false);
            addLine(pc, root, lineMaterial, 20.15, z - side * 5.5, 11, false);

            const goalZ = side * (fieldLength / 2 + 1.1);
            const goalWidth = 7.32;
            const goalHeight = 2.44;

            makeEntity(
                pc,
                "GoalPostLeft",
                "cylinder",
                goalMaterial,
                root,
                [-goalWidth / 2, goalHeight / 2, goalZ],
                [0.11, goalHeight / 2, 0.11]
            );

            makeEntity(
                pc,
                "GoalPostRight",
                "cylinder",
                goalMaterial,
                root,
                [goalWidth / 2, goalHeight / 2, goalZ],
                [0.11, goalHeight / 2, 0.11]
            );

            makeEntity(
                pc,
                "GoalCrossbar",
                "cylinder",
                goalMaterial,
                root,
                [0, goalHeight, goalZ],
                [0.11, goalWidth / 2, 0.11]
            );

            makeEntity(
                pc,
                "GoalNet",
                "box",
                netMaterial,
                root,
                [0, goalHeight / 2, goalZ + side * 1.8],
                [goalWidth, goalHeight, 0.05]
            );
        });

        for (let side = -1; side <= 1; side += 2) {
            for (let end = -1; end <= 1; end += 2) {
                makeEntity(
                    pc,
                    "StadiumTower",
                    "box",
                    createMaterial(pc, [0.18, 0.23, 0.29]),
                    root,
                    [side * 40, 7, end * 46],
                    [2.5, 14, 2.5]
                );
            }
        }

        for (let row = 0; row < 3; row++) {
            makeEntity(
                pc,
                `StandNorth${row}`,
                "box",
                createMaterial(pc, [0.2 + row * 0.04, 0.24, 0.31]),
                root,
                [0, 2 + row * 1.4, -fieldLength / 2 - 7 + row * 1.1],
                [fieldWidth + 12, 1.4, 3]
            );

            makeEntity(
                pc,
                `StandSouth${row}`,
                "box",
                createMaterial(pc, [0.2 + row * 0.04, 0.24, 0.31]),
                root,
                [0, 2 + row * 1.4, fieldLength / 2 + 7 - row * 1.1],
                [fieldWidth + 12, 1.4, 3]
            );
        }

        addLight(pc, app, "SunLight", [0, 60, 0], 1.6, [1, 0.96, 0.86], true);
        addLight(pc, app, "FillLight", [25, 25, -25], 0.55, [0.73, 0.84, 1]);

        return {
            root,
            fieldLength,
            fieldWidth,
            lineMaterial,
            grassMaterial: grassA
        };
    }

    /* ========================================================
       10. JOUEURS 3D
    ======================================================== */

    function buildHuman(pc, parent, name, jerseyColor, skinColor, shortsColor) {
        const group = new pc.Entity(name);
        parent.addChild(group);

        const jersey = createMaterial(pc, jerseyColor);
        const skin = createMaterial(pc, skinColor);
        const shorts = createMaterial(pc, shortsColor);
        const socks = createMaterial(pc, [0.92, 0.92, 0.92]);
        const boots = createMaterial(pc, [0.07, 0.08, 0.1]);
        const hair = createMaterial(pc, [0.12, 0.08, 0.05]);

        const torso = makeEntity(
            pc, `${name}_Torso`, "capsule", jersey, group,
            [0, 1.2, 0], [0.48, 0.52, 0.32]
        );

        const head = makeEntity(
            pc, `${name}_Head`, "sphere", skin, group,
            [0, 1.93, 0], [0.28, 0.31, 0.28]
        );

        makeEntity(
            pc, `${name}_Hair`, "sphere", hair, group,
            [0, 2.08, -0.015], [0.29, 0.19, 0.29]
        );

        const leftArm = makeEntity(
            pc, `${name}_LeftArm`, "capsule", jersey, group,
            [-0.35, 1.25, 0], [0.14, 0.42, 0.14]
        );

        const rightArm = makeEntity(
            pc, `${name}_RightArm`, "capsule", jersey, group,
            [0.35, 1.25, 0], [0.14, 0.42, 0.14]
        );

        const leftHand = makeEntity(
            pc, `${name}_LeftHand`, "sphere", skin, group,
            [-0.37, 0.94, 0], [0.12, 0.12, 0.12]
        );

        const rightHand = makeEntity(
            pc, `${name}_RightHand`, "sphere", skin, group,
            [0.37, 0.94, 0], [0.12, 0.12, 0.12]
        );

        const leftLeg = makeEntity(
            pc, `${name}_LeftLeg`, "capsule", shorts, group,
            [-0.16, 0.57, 0], [0.17, 0.4, 0.18]
        );

        const rightLeg = makeEntity(
            pc, `${name}_RightLeg`, "capsule", shorts, group,
            [0.16, 0.57, 0], [0.17, 0.4, 0.18]
        );

        const leftSock = makeEntity(
            pc, `${name}_LeftSock`, "cylinder", socks, group,
            [-0.16, 0.25, 0], [0.11, 0.23, 0.11]
        );

        const rightSock = makeEntity(
            pc, `${name}_RightSock`, "cylinder", socks, group,
            [0.16, 0.25, 0], [0.11, 0.23, 0.11]
        );

        const leftBoot = makeEntity(
            pc, `${name}_LeftBoot`, "box", boots, group,
            [-0.16, 0.08, 0.09], [0.23, 0.12, 0.34]
        );

        const rightBoot = makeEntity(
            pc, `${name}_RightBoot`, "box", boots, group,
            [0.16, 0.08, 0.09], [0.23, 0.12, 0.34]
        );

        return {
            entity: group,
            torso,
            head,
            leftArm,
            rightArm,
            leftHand,
            rightHand,
            leftLeg,
            rightLeg,
            leftSock,
            rightSock,
            leftBoot,
            rightBoot,
            animationTime: Math.random() * 10,
            startY: 0
        };
    }

    function createPlayer(pc, world, teamId, index, side, isGoalkeeper = false) {
        const team = getTeam(teamId);

        const jerseyColor = team?.primaryColor
            ? colorStringToRgb(team.primaryColor)
            : side === 0
                ? [0.8, 0.12, 0.1]
                : [0.08, 0.24, 0.78];

        const shortsColor = side === 0
            ? [0.12, 0.16, 0.22]
            : [0.88, 0.88, 0.88];

        const name = PLAYER_NAMES[index % PLAYER_NAMES.length] || `Joueur ${index + 1}`;

        const human = buildHuman(
            pc,
            world,
            `${team?.name || "Équipe"}_${index + 1}_${name}`,
            jerseyColor,
            [0.55, 0.35, 0.23],
            shortsColor
        );

        const player = {
            id: `${teamId}-${index}-${Date.now()}`,
            name,
            teamId,
            side,
            number: index + 1,
            isGoalkeeper,
            isSubstitute: false,
            sentOff: false,
            yellowCards: 0,
            redCard: false,
            fouls: 0,
            goals: 0,
            assists: 0,
            stamina: 100,
            speed: random(5.4, 7.2),
            human,
            entity: human.entity,
            x: 0,
            z: 0,
            targetX: 0,
            targetZ: 0,
            vx: 0,
            vz: 0,
            homeX: 0,
            homeZ: 0,
            action: "idle",
            aiTimer: random(0.1, 1.5),
            animationPhase: random(0, Math.PI * 2),
            injured: false
        };

        return player;
    }

    function colorStringToRgb(value) {
        if (typeof value !== "string") return [0.8, 0.2, 0.2];

        const match = value.match(/^#([0-9a-f]{6})$/i);

        if (match) {
            const number = parseInt(match[1], 16);

            return [
                ((number >> 16) & 255) / 255,
                ((number >> 8) & 255) / 255,
                (number & 255) / 255
            ];
        }

        const hsl = value.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i);

        if (hsl) {
            const h = Number(hsl[1]) / 360;
            const s = Number(hsl[2]) / 100;
            const l = Number(hsl[3]) / 100;

            const hue = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            if (s === 0) return [l, l, l];

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            return [
                hue(p, q, h + 1 / 3),
                hue(p, q, h),
                hue(p, q, h - 1 / 3)
            ];
        }

        return [0.8, 0.2, 0.2];
    }

    function formationPositions(side, formation = "433") {
        const groups = FORMATIONS[formation] || FORMATIONS["433"];
        const positions = [];

        positions.push({
            x: 0,
            z: side === 0 ? -46 : 46
        });

        const lanes = [-25, -8, 8, 25];

        const outfieldGroups = groups.slice(1);

        let layer = 0;

        outfieldGroups.forEach((count) => {
            const zBase = side === 0
                ? -36 + layer * 15
                : 36 - layer * 15;

            for (let i = 0; i < count; i++) {
                const x = count === 1
                    ? 0
                    : lanes[Math.round(i * (lanes.length - 1) / Math.max(1, count - 1))];

                positions.push({ x, z: zBase });
            }

            layer++;
        });

        while (positions.length < 11) {
            positions.push({
                x: random(-25, 25),
                z: side === 0 ? random(-30, -5) : random(5, 30)
            });
        }

        return positions.slice(0, 11);
    }

    function arrangePlayers(players, side, formation = "433") {
        const positions = formationPositions(side, formation);

        players.forEach((player, index) => {
            const position = positions[index] || {
                x: 0,
                z: side === 0 ? -15 : 15
            };

            player.homeX = position.x;
            player.homeZ = position.z;
            player.targetX = position.x;
            player.targetZ = position.z;
            player.x = position.x;
            player.z = position.z;

            player.entity.setLocalPosition(player.x, 0, player.z);
            player.entity.setLocalEulerAngles(0, side === 0 ? 0 : 180, 0);
        });
    }

    function createSubstitutes(pc, world, teamId, side) {
        const substitutes = [];

        for (let i = 0; i < 7; i++) {
            const player = createPlayer(
                pc,
                world,
                teamId,
                11 + i,
                side,
                false
            );

            player.isSubstitute = true;
            player.entity.enabled = false;

            substitutes.push(player);
        }

        return substitutes;
    }

    /* ========================================================
       11. BALLON ET CAMÉRA
    ======================================================== */

    function createBall(pc, world) {
        const material = createMaterial(pc, [0.96, 0.96, 0.92], {
            gloss: 0.65
        });

        const ball = makeEntity(
            pc,
            "FootballBall",
            "sphere",
            material,
            world,
            [0, 0.28, 0],
            [0.48, 0.48, 0.48]
        );

        return {
            entity: ball,
            x: 0,
            y: 0.28,
            z: 0,
            vx: 0,
            vy: 0,
            vz: 0,
            owner: null,
            lastTouchTeam: null,
            lastTouchPlayer: null,
            lastTouchTime: 0,
            flight: 0
        };
    }

    function createCamera(pc, app) {
        const camera = new pc.Entity("FootballCamera");

        camera.addComponent("camera", {
            clearColor: new pc.Color(0.42, 0.65, 0.82),
            fov: 43,
            nearClip: 0.1,
            farClip: 400
        });

        camera.setLocalPosition(0, 24, -39);
        camera.setLocalEulerAngles(25, 0, 0);

        app.root.addChild(camera);

        return camera;
    }

    function updateCamera() {
        if (!state.camera || !state.match) return;

        const match = state.match;
        const active = match.activePlayer;

        const ball = match.ball;

        let targetX = active ? active.x : 0;
        let targetZ = active ? active.z : 0;

        if (ball) {
            targetX = targetX * 0.58 + ball.x * 0.42;
            targetZ = targetZ * 0.58 + ball.z * 0.42;
        }

        targetX = clamp(targetX, -28, 28);
        targetZ = clamp(targetZ, -44, 44);

        const zoom = match.cameraZoom || 1;

        const distance = 39 / zoom;
        const height = 24 / zoom;

        let cameraX = targetX;
        let cameraZ = targetZ - distance;

        if (state.cameraMode === 1) {
            cameraX = targetX + 28 / zoom;
            cameraZ = targetZ - 15 / zoom;
        } else if (state.cameraMode === 2) {
            cameraX = targetX;
            cameraZ = targetZ - 25 / zoom;
        }

        const current = state.camera.getLocalPosition();

        const smooth = 0.075;

        state.camera.setLocalPosition(
            current.x + (cameraX - current.x) * smooth,
            current.y + (height - current.y) * smooth,
            current.z + (cameraZ - current.z) * smooth
        );

        state.camera.lookAt(
            targetX,
            0.4,
            targetZ + (state.cameraMode === 2 ? 10 : 4)
        );
    }

    function resizeCanvas() {
        if (!state.app || !state.app.graphicsDevice) return;

        try {
            state.app.resizeCanvas();
        } catch (error) {
            console.warn("[FOBAS] Redimensionnement du canvas :", error);
        }
    }

    /* ========================================================
       12. INITIALISATION DU MOTEUR
    ======================================================== */

    async function initializeEngine() {
        setLoading(5, "Chargement de PlayCanvas...");

        const urls = [
            `https://cdn.jsdelivr.net/npm/playcanvas@${ENGINE_VERSION}/build/playcanvas.mjs`,
            `https://esm.sh/playcanvas@${ENGINE_VERSION}`
        ];

        let pc = null;
        let lastError = null;

        for (const url of urls) {
            try {
                const module = await import(url);

                if (module.Application && module.Entity) {
                    pc = module;
                    break;
                }
            } catch (error) {
                lastError = error;
                console.warn("[FOBAS] Import PlayCanvas échoué :", url, error);
            }
        }

        if (!pc) {
            throw new Error(
                `Impossible de charger PlayCanvas ${ENGINE_VERSION}. Vérifiez la connexion Internet. ${lastError?.message || ""}`
            );
        }

        state.engine = pc;

        setLoading(24, "Création du moteur graphique...");

        const canvas = $("footballCanvas");

        if (!canvas) {
            throw new Error("Canvas #footballCanvas introuvable.");
        }

        const app = new pc.Application(canvas, {
            graphicsDeviceOptions: {
                antialias: true,
                alpha: false,
                powerPreference: "high-performance",
                preserveDrawingBuffer: false
            }
        });

        state.app = app;

        app.setCanvasFillMode(pc.FILLMODE_NONE);
        app.setCanvasResolution(pc.RESOLUTION_AUTO);

        app.scene.ambientLight = new pc.Color(0.45, 0.45, 0.45);
        app.scene.gammaCorrection = pc.GAMMA_SRGB;
        app.scene.toneMapping = pc.TONEMAP_ACES;

        setLoading(45, "Préparation du terrain 3D...");

        const world = buildPitch(pc, app);
        const camera = createCamera(pc, app);

        app.root.addChild(camera);
        app.start();

        state.world = world.root;
        state.camera = camera;
        state.pitch = world;

        app.on("update", (dt) => {
            try {
                updateGame(dt);
            } catch (error) {
                console.error("[FOBAS] Erreur pendant la mise à jour :", error);
                setEngineStatus("Une erreur de simulation a été détectée.");
            }
        });

        window.addEventListener("resize", resizeCanvas, { passive: true });

        setLoading(70, "Préparation des équipes...");
        return true;
    }

    /* ========================================================
       13. CRÉATION D'UN MATCH
    ======================================================== */

    async function startMatch(options = {}) {
        if (!state.engine || !state.app || !state.world) {
            toast("Le moteur 3D n'est pas prêt.", "error");
            return;
        }

        if (state.match && !state.gameOver) {
            const proceed = window.confirm(
                "Un match est déjà en cours. Voulez-vous le remplacer ?"
            );

            if (!proceed) return;
        }

        state.gameOver = false;
        state.paused = false;

        $("pauseOverlay")?.classList.add("hidden");
        closeDialog();

        const homeTeamId = options.homeTeamId
            || $("homeTeamSelect")?.value
            || state.profile.favoriteTeam
            || state.teams[0]?.id;

        let awayTeamId = options.awayTeamId
            || $("awayTeamSelect")?.value
            || state.teams[1]?.id;

        if (homeTeamId === awayTeamId) {
            awayTeamId = state.teams.find((team) => team.id !== homeTeamId)?.id;
        }

        const homeTeam = getTeam(homeTeamId);
        const awayTeam = getTeam(awayTeamId);

        if (!homeTeam || !awayTeam || homeTeam.id === awayTeam.id) {
            toast("Choisissez deux équipes différentes.", "error");
            showScreen("matchSetupScreen");
            return;
        }

        if (state.match?.players) {
            state.match.players.forEach((player) => {
                if (player.entity) player.entity.destroy();
            });
        }

        if (state.match?.substitutes) {
            state.match.substitutes.forEach((player) => {
                if (player.entity) player.entity.destroy();
            });
        }

        const homePlayers = [];
        const awayPlayers = [];

        for (let i = 0; i < 11; i++) {
            homePlayers.push(
                createPlayer(
                    state.engine,
                    state.world,
                    homeTeam.id,
                    i,
                    0,
                    i === 0
                )
            );

            awayPlayers.push(
                createPlayer(
                    state.engine,
                    state.world,
                    awayTeam.id,
                    i,
                    1,
                    i === 0
                )
            );
        }

        const homeSubs = createSubstitutes(
            state.engine,
            state.world,
            homeTeam.id,
            0
        );

        const awaySubs = createSubstitutes(
            state.engine,
            state.world,
            awayTeam.id,
            1
        );

        arrangePlayers(homePlayers, 0, "433");
        arrangePlayers(awayPlayers, 1, "433");

        const ball = createBall(state.engine, state.world);

        const durationKey = options.duration
            || $("matchDurationSelect")?.value
            || "standard";

        const duration = DURATIONS[durationKey] || DURATIONS.standard;

        state.match = {
            id: `match-${Date.now()}`,
            homeTeam,
            awayTeam,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            competitionName: options.competitionName
                || $("competitionSelect")?.selectedOptions?.[0]?.textContent
                || "Match local",
            stadium: $("stadiumSelect")?.selectedOptions?.[0]?.textContent
                || "Stade FOBAS",
            durationKey,
            totalSeconds: duration.seconds,
            remainingSeconds: duration.seconds,
            elapsedSeconds: 0,
            homeScore: 0,
            awayScore: 0,
            homePlayers,
            awayPlayers,
            substitutes: [...homeSubs, ...awaySubs],
            players: [...homePlayers, ...awayPlayers],
            activePlayer: homePlayers[9],
            activeTeam: 0,
            ball,
            cameraZoom: 1,
            phase: "1re MI-TEMPS",
            halftime: false,
            lastCommentaryTime: 0,
            kickoffTeam: 0,
            substitutionsUsed: {
                [homeTeam.id]: 0,
                [awayTeam.id]: 0
            },
            yellowCards: [],
            redCards: [],
            fouls: [],
            shots: 0,
            passes: 0,
            saves: 0,
            corners: 0,
            penalties: 0,
            goals: [],
            events: [],
            tactics: {
                formation: "433",
                style: "balanced",
                pressure: "medium"
            }
        };

        state.match.activePlayer = homePlayers[9];

        state.ballOwner = null;
        state.selectedPlayer = 9;

        positionKickoff();

        updateScoreboard();
        updateRefereeLabel("Coup d'envoi imminent");
        setEngineStatus("Match 3D en cours");
        showScreen("matchScreen");

        announce(
            `${homeTeam.name} contre ${awayTeam.name}`,
            state.match.competitionName,
            3200
        );

        state.matchTimer = Date.now();

        await saveCurrentMatch(false);
    }

    function positionKickoff() {
        if (!state.match) return;

        const match = state.match;

        match.homePlayers.forEach((player) => {
            player.entity.setLocalPosition(player.x, 0, player.z);
        });

        match.awayPlayers.forEach((player) => {
            player.entity.setLocalPosition(player.x, 0, player.z);
        });

        match.ball.x = 0;
        match.ball.y = 0.3;
        match.ball.z = 0;
        match.ball.vx = 0;
        match.ball.vy = 0;
        match.ball.vz = 0;
        match.ball.owner = null;

        match.ball.entity.setLocalPosition(0, 0.3, 0);

        match.homePlayers[9].x = -1.5;
        match.homePlayers[9].z = -2;
        match.homePlayers[10].x = 1.5;
        match.homePlayers[10].z = -2;

        match.awayPlayers[9].x = -1.5;
        match.awayPlayers[9].z = 2;
        match.awayPlayers[10].x = 1.5;
        match.awayPlayers[10].z = 2;

        match.homePlayers[9].entity.setLocalPosition(-1.5, 0, -2);
        match.homePlayers[10].entity.setLocalPosition(1.5, 0, -2);
        match.awayPlayers[9].entity.setLocalPosition(-1.5, 0, 2);
        match.awayPlayers[10].entity.setLocalPosition(1.5, 0, 2);
    }

    /* ========================================================
       14. SIMULATION ET ANIMATION
    ======================================================== */

    function updateGame(dt) {
        if (!state.match || state.paused || state.gameOver) {
            updateCamera();
            return;
        }

        const match = state.match;

        const safeDt = clamp(dt, 0, 0.05);

        match.elapsedSeconds += safeDt;
        match.remainingSeconds -= safeDt;

        if (match.remainingSeconds <= 0) {
            endMatch();
            return;
        }

        if (!match.halftime && match.elapsedSeconds >= match.totalSeconds / 2) {
            match.halftime = true;
            match.phase = "2e MI-TEMPS";
            match.remainingSeconds += 0;
            announce("La seconde période commence.", "Mi-temps");
            updateScoreboard();
        }

        updatePlayers(safeDt);
        updateBall(safeDt);
        updateAI(safeDt);
        updateReferee(safeDt);
        updateScoreboard();
        updateCamera();

        state.frameAccumulator += safeDt;

        if (state.frameAccumulator > 10) {
            state.frameAccumulator = 0;
            saveCurrentMatch(false);
        }
    }

    function movePlayer(player, x, z, speed, dt) {
        const dx = x - player.x;
        const dz = z - player.z;
        const distance = Math.hypot(dx, dz);

        if (distance < 0.05) {
            player.vx = 0;
            player.vz = 0;
            return;
        }

        const amount = Math.min(distance, speed * dt);

        player.vx = dx / distance * speed;
        player.vz = dz / distance * speed;

        player.x += dx / distance * amount;
        player.z += dz / distance * amount;

        player.x = clamp(player.x, -32, 32);
        player.z = clamp(player.z, -52, 52);

        player.entity.setLocalPosition(player.x, 0, player.z);

        const angle = Math.atan2(dx, dz) * 180 / Math.PI;
        player.entity.setLocalEulerAngles(0, angle, 0);
    }

    function updatePlayers(dt) {
        const match = state.match;

        match.players.forEach((player) => {
            if (player.sentOff || player.isSubstitute) return;

            player.human.animationTime += dt * 8;

            const moving = Math.hypot(player.vx, player.vz) > 0.2;
            const swing = moving
                ? Math.sin(player.human.animationTime) * 22
                : 0;

            player.human.leftLeg.setLocalEulerAngles(swing, 0, 0);
            player.human.rightLeg.setLocalEulerAngles(-swing, 0, 0);
            player.human.leftArm.setLocalEulerAngles(-swing * 0.6, 0, 0);
            player.human.rightArm.setLocalEulerAngles(swing * 0.6, 0, 0);

            player.stamina = Math.max(
                30,
                player.stamina - (moving ? 0.01 : -0.02) * dt
            );

            const distanceToBall = Math.hypot(
                player.x - match.ball.x,
                player.z - match.ball.z
            );

            if (!match.ball.owner && distanceToBall < 1.4) {
                if (Math.random() < 0.15) {
                    acquireBall(player);
                }
            }
        });
    }

    function updateAI(dt) {
        const match = state.match;
        if (!match) return;

        match.players.forEach((player) => {
            if (
                player === match.activePlayer
                || player.sentOff
                || player.isSubstitute
            ) {
                return;
            }

            player.aiTimer -= dt;

            if (player.aiTimer > 0) {
                if (player.action === "run") {
                    movePlayer(
                        player,
                        player.targetX,
                        player.targetZ,
                        player.speed * 0.8,
                        dt
                    );
                }

                return;
            }

            player.aiTimer = random(0.5, 1.8);

            const ball = match.ball;
            const teammateOwnsBall = ball.owner?.teamId === player.teamId;

            if (ball.owner && ball.owner.teamId !== player.teamId) {
                const dx = ball.x - player.x;
                const dz = ball.z - player.z;
                const dist = Math.hypot(dx, dz);

                if (dist < 22) {
                    player.targetX = ball.x;
                    player.targetZ = ball.z;
                    player.action = "run";
                } else {
                    player.targetX = player.homeX;
                    player.targetZ = player.homeZ;
                    player.action = "run";
                }
            } else if (teammateOwnsBall) {
                player.targetX = player.homeX + random(-5, 5);
                player.targetZ = player.homeZ + (player.side === 0 ? 4 : -4);
                player.action = "run";

                if (
                    ball.owner === player
                    && Math.random() < 0.04
                ) {
                    aiPass(player);
                }
            } else if (!ball.owner) {
                const distance = Math.hypot(
                    player.x - ball.x,
                    player.z - ball.z
                );

                if (distance < 17) {
                    player.targetX = ball.x;
                    player.targetZ = ball.z;
                } else {
                    player.targetX = player.homeX;
                    player.targetZ = player.homeZ;
                }

                player.action = "run";
            }

            if (player.isGoalkeeper) {
                const goalZ = player.side === 0 ? -47 : 47;

                player.targetX = clamp(ball.x, -5, 5);
                player.targetZ = goalZ;
            }

            movePlayer(
                player,
                player.targetX,
                player.targetZ,
                player.speed * 0.65,
                dt
            );
        });
    }

    /* ========================================================
       15. BALLON ET ACTIONS
    ======================================================== */

    function acquireBall(player) {
        const match = state.match;
        if (!match || player.sentOff) return;

        match.ball.owner = player;
        match.ball.vx = 0;
        match.ball.vy = 0;
        match.ball.vz = 0;

        match.ball.lastTouchTeam = player.teamId;
        match.ball.lastTouchPlayer = player;
        match.ball.lastTouchTime = match.elapsedSeconds;

        state.ballOwner = player;

        player.action = "control";
    }

    function updateBall(dt) {
        const match = state.match;
        const ball = match.ball;

        if (ball.owner && !ball.owner.sentOff) {
            const owner = ball.owner;

            const radians = owner.entity.getLocalEulerAngles().y * Math.PI / 180;

            ball.x = owner.x + Math.sin(radians) * 0.65;
            ball.z = owner.z + Math.cos(radians) * 0.65;
            ball.y = 0.3;

            ball.vx = 0;
            ball.vy = 0;
            ball.vz = 0;
        } else {
            ball.owner = null;

            ball.x += ball.vx * dt;
            ball.y += ball.vy * dt;
            ball.z += ball.vz * dt;

            ball.vy -= 9.8 * dt;

            if (ball.y < 0.3) {
                ball.y = 0.3;
                ball.vy = Math.abs(ball.vy) > 1 ? -ball.vy * 0.35 : 0;
                ball.vx *= 0.96;
                ball.vz *= 0.96;
            }

            ball.vx *= Math.pow(0.985, dt * 60);
            ball.vz *= Math.pow(0.985, dt * 60);

            if (
                Math.hypot(ball.vx, ball.vz) < 1.2
                && Math.abs(ball.vy) < 0.5
            ) {
                ball.vx = 0;
                ball.vz = 0;
            }

            const nearest = match.players
                .filter((player) => !player.sentOff && !player.isSubstitute)
                .sort((a, b) => {
                    const da = Math.hypot(a.x - ball.x, a.z - ball.z);
                    const db = Math.hypot(b.x - ball.x, b.z - ball.z);
                    return da - db;
                })[0];

            if (
                nearest
                && Math.hypot(nearest.x - ball.x, nearest.z - ball.z) < 1.25
                && Math.hypot(ball.vx, ball.vz) < 8
            ) {
                acquireBall(nearest);
            }
        }

        ball.entity.setLocalPosition(ball.x, ball.y, ball.z);

        checkBallOutOfBounds();
        checkGoal();
    }

    function passBall() {
        const match = state.match;
        if (!match || state.paused || state.gameOver) return;

        const player = match.activePlayer;

        if (!player || player.sentOff) return;

        if (match.ball.owner !== player) {
            if (match.ball.owner && match.ball.owner.teamId === player.teamId) {
                match.activePlayer = match.ball.owner;
            } else {
                toast("Récupérez le ballon avant de faire une passe.");
                return;
            }
        }

        const teammates = match.players.filter((candidate) =>
            candidate.teamId === player.teamId
            && candidate !== player
            && !candidate.sentOff
            && !candidate.isSubstitute
        );

        if (!teammates.length) return;

        const forward = player.side === 0 ? 1 : -1;

        teammates.sort((a, b) => {
            const scoreA = Math.hypot(a.x - player.x, a.z - player.z)
                - (a.z - player.z) * forward * 0.3;

            const scoreB = Math.hypot(b.x - player.x, b.z - player.z)
                - (b.z - player.z) * forward * 0.3;

            return scoreA - scoreB;
        });

        const target = teammates[0];

        match.ball.owner = null;
        match.ball.vx = (target.x - player.x) * 2.2;
        match.ball.vz = (target.z - player.z) * 2.2;
        match.ball.vy = 1.2;

        match.ball.lastTouchTeam = player.teamId;
        match.ball.lastTouchPlayer = player;

        player.action = "pass";
        match.passes++;

        match.activePlayer = target;

        refereeComment("Passe en jeu.");

        playSound(520, 0.08);

        toast(`Passe vers ${target.name}.`);
    }

    function aiPass(player) {
        const match = state.match;
        if (!match || match.ball.owner !== player) return;

        const teammates = match.players.filter((candidate) =>
            candidate.teamId === player.teamId
            && candidate !== player
            && !candidate.sentOff
            && !candidate.isSubstitute
        );

        if (!teammates.length) return;

        const target = pick(teammates);

        match.ball.owner = null;
        match.ball.vx = (target.x - player.x) * 1.8;
        match.ball.vz = (target.z - player.z) * 1.8;
        match.ball.vy = 1;

        match.ball.lastTouchTeam = player.teamId;
        match.ball.lastTouchPlayer = player;
    }

    function shootBall() {
        const match = state.match;
        if (!match || state.paused || state.gameOver) return;

        const player = match.activePlayer;

        if (!player || match.ball.owner !== player) {
            toast("Le joueur doit contrôler le ballon pour tirer.");
            return;
        }

        const direction = player.side === 0 ? 1 : -1;

        const distanceToGoal = player.side === 0
            ? 52 - player.z
            : player.z + 52;

        const accuracy = state.settings.difficulty === "expert"
            ? 0.72
            : state.settings.difficulty === "hard"
                ? 0.8
                : state.settings.difficulty === "easy"
                    ? 0.95
                    : 0.86;

        const lateral = random(-1, 1) * (1 - accuracy) * 12;

        match.ball.owner = null;
        match.ball.vx = lateral;
        match.ball.vz = direction * random(19, 27);
        match.ball.vy = random(2.5, 5.5);

        match.ball.lastTouchTeam = player.teamId;
        match.ball.lastTouchPlayer = player;

        player.action = "shoot";
        match.shots++;

        refereeComment("Tir au but !");
        playSound(180, 0.15);

        if (Math.abs(lateral) > 5) {
            toast("Tir non cadré !");
        } else if (distanceToGoal < 30) {
            toast("Tir puissant !");
        }
    }

    function sprintPlayer(active) {
        if (!state.match?.activePlayer) return;

        const player = state.match.activePlayer;

        if (active) {
            player.speed = 10;
            player.stamina = Math.max(0, player.stamina - 0.2);
        } else {
            player.speed = 6.2;
        }
    }

    function defendAction() {
        const match = state.match;
        if (!match || !match.activePlayer) return;

        const player = match.activePlayer;

        if (match.ball.owner && match.ball.owner.teamId !== player.teamId) {
            const opponent = match.ball.owner;

            const distance = Math.hypot(
                opponent.x - player.x,
                opponent.z - player.z
            );

            if (distance < 2.1 && Math.random() > 0.25) {
                match.ball.owner = null;
                acquireBall(player);
                refereeComment("Récupération du ballon.");
                playSound(300, 0.06);
                toast("Ballon récupéré !", "success");
                return;
            }

            if (distance < 2.5) {
                player.fouls++;
                registerFoul(player, opponent);
                return;
            }
        }

        const ball = match.ball;

        player.targetX = ball.x;
        player.targetZ = ball.z;

        toast("Le joueur se place en défense.");
    }

    function switchPlayer() {
        const match = state.match;
        if (!match) return;

        const candidates = match.players.filter((player) =>
            player.teamId === match.homeTeamId
            && !player.sentOff
            && !player.isSubstitute
        );

        if (!candidates.length) return;

        const owner = match.ball.owner;

        let next;

        if (owner && owner.teamId === match.homeTeamId) {
            next = owner;
        } else {
            const sorted = candidates.sort((a, b) => {
                const da = Math.hypot(a.x - match.ball.x, a.z - match.ball.z);
                const db = Math.hypot(b.x - match.ball.x, b.z - match.ball.z);
                return da - db;
            });

            next = sorted[0];
        }

        match.activePlayer = next;
        state.selectedPlayer = candidates.indexOf(next);

        announce(`Contrôle de ${next.name}.`, "Changement de joueur", 1500);
    }

    /* ========================================================
       16. BUTS, SORTIES ET REPRISES
    ======================================================== */

    function checkGoal() {
        const match = state.match;
        const ball = match.ball;

        if (Math.abs(ball.z) > 51.8 && Math.abs(ball.x) < 3.66 && ball.y < 2.6) {
            const scoringTeam = ball.z > 0
                ? match.homeTeamId
                : match.awayTeamId;

            scoreGoal(scoringTeam, ball.lastTouchPlayer);
        }
    }

    function scoreGoal(teamId, scorer) {
        const match = state.match;
        if (!match || state.gameOver) return;

        if (teamId === match.homeTeamId) {
            match.homeScore++;
        } else {
            match.awayScore++;
        }

        if (scorer) scorer.goals++;

        match.goals.push({
            teamId,
            scorer: scorer?.name || "Inconnu",
            time: match.elapsedSeconds
        });

        if (teamId === match.homeTeamId) {
            match.awayPlayers.forEach((player) => {
                player.targetX = player.homeX;
                player.targetZ = player.homeZ;
            });
        }

        refereeComment(`But pour ${getTeam(teamId).name} !`);
        announce(`BUT ! ${scorer?.name || "Un joueur"} marque !`, "⚽ BUT", 3500);

        playSound(720, 0.3);

        state.statistics.goalsScored++;
        state.profile.goalsScored = state.statistics.goalsScored;

        updateScoreboard();
        positionKickoff();

        match.events.push({
            type: "goal",
            teamId,
            time: match.elapsedSeconds
        });
    }

    function checkBallOutOfBounds() {
        const match = state.match;
        const ball = match.ball;

        if (Math.abs(ball.x) > 34 || Math.abs(ball.z) > 53) {
            const lastTouch = ball.lastTouchTeam;

            ball.owner = null;
            ball.vx = 0;
            ball.vy = 0;
            ball.vz = 0;

            if (Math.abs(ball.x) > 34) {
                match.events.push({
                    type: "throw-in",
                    time: match.elapsedSeconds
                });

                refereeComment("Remise en touche.");
            } else {
                match.events.push({
                    type: "goal-kick-or-corner",
                    lastTouch,
                    time: match.elapsedSeconds
                });

                refereeComment("Le ballon est sorti du terrain.");
            }

            ball.x = clamp(ball.x, -33, 33);
            ball.z = clamp(ball.z, -52, 52);

            ball.entity.setLocalPosition(ball.x, 0.3, ball.z);
        }
    }

    /* ========================================================
       17. ARBITRE IA — MEME SELVANDIEU
    ======================================================== */

    function updateReferee() {
        const match = state.match;
        if (!match) return;

        if (Math.random() < 0.00035) {
            const player = pick(
                match.players.filter((candidate) =>
                    !candidate.sentOff && !candidate.isSubstitute
                )
            );

            if (player && Math.random() < 0.5) {
                player.fouls++;
                registerFoul(player, match.ball.owner);
            }
        }
    }

    function updateRefereeLabel(message) {
        const label = $("refereeDecisionLabel");
        if (label) label.textContent = message;
    }

    function refereeComment(message) {
        updateRefereeLabel(message);

        if (state.settings.commentary) {
            announce(message, "MEME Selvandieu", 1800);
        }
    }

    function registerFoul(player, victim) {
        const match = state.match;
        if (!match || !player) return;

        match.fouls.push({
            player: player.name,
            teamId: player.teamId,
            time: match.elapsedSeconds
        });

        refereeComment(`Faute signalée contre ${player.name}.`);

        if (Math.random() < 0.22) {
            issueYellowCard(player);
        } else {
            playSound(900, 0.16);
        }

        if (victim) {
            victim.targetX = victim.x + random(-1, 1);
            victim.targetZ = victim.z + random(-1, 1);
        }

        match.ball.owner = null;
        match.ball.vx = 0;
        match.ball.vz = 0;
    }

    function issueYellowCard(player) {
        const match = state.match;
        if (!match || !player || player.sentOff) return;

        player.yellowCards++;
        match.yellowCards.push({
            player: player.name,
            teamId: player.teamId,
            time: match.elapsedSeconds
        });

        refereeComment(`Carton jaune pour ${player.name}.`);

        if (player.yellowCards >= 2) {
            issueRedCard(player, true);
        } else {
            playSound(1000, 0.18);
        }
    }

    function issueRedCard(player, secondYellow = false) {
        const match = state.match;
        if (!match || !player || player.sentOff) return;

        player.sentOff = true;
        player.redCard = true;

        match.redCards.push({
            player: player.name,
            teamId: player.teamId,
            secondYellow,
            time: match.elapsedSeconds
        });

        player.entity.enabled = false;

        if (match.ball.owner === player) {
            match.ball.owner = null;
        }

        refereeComment(
            secondYellow
                ? `Deuxième carton jaune : ${player.name} est expulsé.`
                : `Carton rouge : ${player.name} est expulsé.`
        );

        playSound(1100, 0.35);

        if (match.activePlayer === player) {
            switchPlayer();
        }
    }

    /* ========================================================
       18. REMPLACEMENTS
    ======================================================== */

    function openSubstitutionPanel() {
        const match = state.match;

        if (!match) {
            toast("Aucun match en cours.");
            return;
        }

        const content = document.createElement("div");

        const teamPlayers = match.players.filter((player) =>
            player.teamId === match.homeTeamId
            && !player.isSubstitute
            && !player.sentOff
        );

        const substitutes = match.substitutes.filter((player) =>
            player.teamId === match.homeTeamId
            && player.isSubstitute
        );

        content.appendChild(
            createElement("p", "", "Choisissez le joueur qui sort et son remplaçant.")
        );

        const outgoing = document.createElement("select");
        const incoming = document.createElement("select");

        teamPlayers.forEach((player) => {
            const option = document.createElement("option");
            option.value = player.id;
            option.textContent = `${player.number}. ${player.name}`;
            outgoing.appendChild(option);
        });

        substitutes.forEach((player) => {
            const option = document.createElement("option");
            option.value = player.id;
            option.textContent = player.name;
            incoming.appendChild(option);
        });

        outgoing.style.width = "100%";
        incoming.style.width = "100%";

        content.appendChild(createElement("label", "", "Joueur sortant"));
        content.appendChild(outgoing);
        content.appendChild(createElement("label", "", "Remplaçant"));
        content.appendChild(incoming);

        showDialog(
            "Remplacement",
            content,
            [
                {
                    label: "Confirmer",
                    className: "ui-button button-primary",
                    onClick: async () => {
                        const out = match.players.find(
                            (player) => player.id === outgoing.value
                        );

                        const inc = match.substitutes.find(
                            (player) => player.id === incoming.value
                        );

                        if (!out || !inc || out.sentOff) {
                            toast("Remplacement invalide.", "error");
                            return;
                        }

                        const used = match.substitutionsUsed[match.homeTeamId] || 0;

                        if (used >= 5) {
                            toast("Maximum de cinq remplacements atteint.", "error");
                            return;
                        }

                        out.isSubstitute = true;
                        out.entity.enabled = false;

                        inc.isSubstitute = false;
                        inc.entity.enabled = true;

                        inc.x = out.x;
                        inc.z = out.z;
                        inc.homeX = out.homeX;
                        inc.homeZ = out.homeZ;

                        inc.entity.setLocalPosition(inc.x, 0, inc.z);

                        match.players = match.players.map((player) =>
                            player.id === out.id ? inc : player
                        );

                        match.substitutionsUsed[match.homeTeamId] = used + 1;

                        if (match.activePlayer === out) {
                            match.activePlayer = inc;
                        }

                        closeDialog();
                        toast("Remplacement effectué.", "success");

                        await saveCurrentMatch(false);
                    }
                },
                {
                    label: "Annuler",
                    onClick: closeDialog
                }
            ]
        );
    }

    /* ========================================================
       19. TABLEAU DE SCORE ET FIN DE MATCH
    ======================================================== */

    function updateScoreboard() {
        const match = state.match;
        if (!match) return;

        if ($("homeTeamName")) {
            $("homeTeamName").textContent = match.homeTeam.name;
        }

        if ($("awayTeamName")) {
            $("awayTeamName").textContent = match.awayTeam.name;
        }

        if ($("homeScore")) {
            $("homeScore").textContent = String(match.homeScore);
        }

        if ($("awayScore")) {
            $("awayScore").textContent = String(match.awayScore);
        }

        if ($("matchClock")) {
            const elapsed = match.totalSeconds - match.remainingSeconds;
            const displaySeconds = Math.floor(
                elapsed / match.totalSeconds * 90 * 60
            );

            $("matchClock").textContent = formatClock(displaySeconds);
        }

        if ($("matchPeriod")) {
            $("matchPeriod").textContent = match.phase;
        }

        if ($("competitionLabel")) {
            $("competitionLabel").textContent = match.competitionName;
        }

        if ($("stadiumLabel")) {
            $("stadiumLabel").textContent = match.stadium;
        }
    }

    async function endMatch() {
        const match = state.match;
        if (!match || state.gameOver) return;

        state.gameOver = true;
        state.paused = true;

        match.phase = "FIN DU MATCH";

        updateScoreboard();

        const homeWon = match.homeScore > match.awayScore;
        const awayWon = match.awayScore > match.homeScore;

        let result = "Match nul";

        if (homeWon) result = `Victoire de ${match.homeTeam.name}`;
        if (awayWon) result = `Victoire de ${match.awayTeam.name}`;

        state.statistics.matchesPlayed++;
        state.profile.matchesPlayed = state.statistics.matchesPlayed;

        await saveData("profile", "main", {
            data: { ...state.profile }
        });

        await saveCurrentMatch(true);

        refereeComment("Fin du match. L'arbitre valide le résultat.");

        const content = document.createElement("div");

        content.appendChild(createElement("h3", "", result));

        content.appendChild(
            createElement(
                "p",
                "",
                `${match.homeTeam.name} ${match.homeScore} — ${match.awayScore} ${match.awayTeam.name}`
            )
        );

        content.appendChild(
            createElement(
                "p",
                "",
                `Passes : ${match.passes} · Tirs : ${match.shots} · Fautes : ${match.fouls.length}`
            )
        );

        content.appendChild(
            createElement(
                "p",
                "",
                `Cartons jaunes : ${match.yellowCards.length} · Cartons rouges : ${match.redCards.length}`
            )
        );

        showDialog(
            "Match terminé",
            content,
            [
                {
                    label: "Rejouer",
                    className: "ui-button button-primary",
                    onClick: async () => {
                        closeDialog();
                        state.paused = false;

                        await startMatch({
                            homeTeamId: match.homeTeamId,
                            awayTeamId: match.awayTeamId,
                            competitionName: match.competitionName,
                            duration: match.durationKey
                        });
                    }
                },
                {
                    label: "Menu principal",
                    onClick: () => {
                        closeDialog();
                        state.paused = false;
                        showScreen("mainMenu");
                    }
                }
            ]
        );

        const context = state.matchContext;

        if (context?.type === "competition" && state.activeCompetition) {
            const fixture = state.activeCompetition.fixtures.find(
                (item) => item.id === context.fixtureId
            );

            if (fixture) {
                fixture.played = true;
                fixture.homeScore = match.homeScore;
                fixture.awayScore = match.awayScore;
            }

            await saveData("competitions", "active", {
                data: state.activeCompetition
            });

            const remaining = state.activeCompetition.fixtures.some(
                (item) => !item.played
            );

            if (!remaining) {
                window.setTimeout(() => {
                    finishCompetition(state.activeCompetition);
                }, 300);
            } else {
                window.setTimeout(() => {
                    showDialog(
                        "Championnat en cours",
                        "Le match est terminé. Vous pouvez jouer la prochaine rencontre.",
                        [
                            {
                                label: "Match suivant",
                                className: "ui-button button-primary",
                                onClick: async () => {
                                    closeDialog();
                                    state.paused = false;
                                    await startCompetitionFixture();
                                }
                            },
                            {
                                label: "Plus tard",
                                onClick: () => {
                                    closeDialog();
                                    showScreen("championshipScreen");
                                }
                            }
                        ]
                    );
                }, 400);
            }
        }

        if (context?.type === "tournament" && state.activeTournament) {
            const fixture = state.activeTournament.fixtures?.find(
                (item) => item.id === context.fixtureId
            );

            if (fixture) {
                fixture.played = true;
                fixture.homeScore = match.homeScore;
                fixture.awayScore = match.awayScore;
            }

            await saveData("tournaments", "all", {
                data: state.tournaments || []
            });
        }
    }

    /* ========================================================
       20. SAUVEGARDE DU MATCH
    ======================================================== */

    async function saveCurrentMatch(finalized = false) {
        const match = state.match;
        if (!match) return false;

        const snapshot = {
            id: match.id,
            homeTeamId: match.homeTeamId,
            awayTeamId: match.awayTeamId,
            competitionName: match.competitionName,
            durationKey: match.durationKey,
            totalSeconds: match.totalSeconds,
            remainingSeconds: match.remainingSeconds,
            elapsedSeconds: match.elapsedSeconds,
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            phase: match.phase,
            finalized,
            savedAt: Date.now()
        };

        const success = await saveData("matches", "active", {
            data: snapshot
        });

        if (success) {
            toast(finalized ? "Résultat sauvegardé." : "Match sauvegardé.", "success");
        }

        return success;
    }

    async function continueCareer() {
        if (state.savedMatch && !state.savedMatch.finalized) {
            const saved = state.savedMatch;

            showDialog(
                "Reprendre la carrière",
                "Une sauvegarde de match a été trouvée.",
                [
                    {
                        label: "Nouvelle partie",
                        className: "ui-button button-secondary",
                        onClick: async () => {
                            closeDialog();
                            await startMatch({});
                        }
                    },
                    {
                        label: "Reprendre le match",
                        className: "ui-button button-primary",
                        onClick: async () => {
                            closeDialog();

                            await startMatch({
                                homeTeamId: saved.homeTeamId,
                                awayTeamId: saved.awayTeamId,
                                competitionName: saved.competitionName,
                                duration: saved.durationKey
                            });

                            if (state.match) {
                                state.match.homeScore = saved.homeScore || 0;
                                state.match.awayScore = saved.awayScore || 0;
                                state.match.elapsedSeconds = saved.elapsedSeconds || 0;
                                state.match.remainingSeconds = saved.remainingSeconds
                                    || state.match.totalSeconds;

                                updateScoreboard();
                            }
                        }
                    }
                ]
            );

            return;
        }

        showScreen("matchSetupScreen");
    }

    /* ========================================================
       21. CAMÉRA ET ZOOM TACTILE
    ======================================================== */

    function zoomCamera(delta) {
        if (!state.match) return;

        state.match.cameraZoom = clamp(
            (state.match.cameraZoom || 1) + delta,
            0.65,
            1.8
        );
    }

    function resetCamera() {
        if (!state.match) return;

        state.match.cameraZoom = 1;
        state.cameraMode = 0;
    }

    function changeCamera() {
        state.cameraMode = (state.cameraMode + 1) % 3;

        const names = [
            "Caméra dynamique",
            "Caméra latérale",
            "Caméra rapprochée"
        ];

        toast(names[state.cameraMode]);
    }

    function distanceBetweenPointers() {
        const values = [...state.pointerPositions.values()];

        if (values.length < 2) return null;

        const dx = values[0].x - values[1].x;
        const dy = values[0].y - values[1].y;

        return Math.hypot(dx, dy);
    }

    function setupPinchZoom() {
        const canvas = $("footballCanvas");
        if (!canvas) return;

        addListener(canvas, "pointerdown", (event) => {
            state.pointerPositions.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY
            });

            if (state.pointerPositions.size >= 2) {
                state.pinchDistance = distanceBetweenPointers();
            }
        });

        addListener(canvas, "pointermove", (event) => {
            if (!state.pointerPositions.has(event.pointerId)) return;

            state.pointerPositions.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY
            });

            if (state.pointerPositions.size >= 2) {
                const currentDistance = distanceBetweenPointers();

                if (currentDistance && state.pinchDistance) {
                    const delta = currentDistance - state.pinchDistance;

                    if (Math.abs(delta) > 2) {
                        zoomCamera(delta > 0 ? 0.015 : -0.015);
                    }
                }

                state.pinchDistance = currentDistance;
            }
        });

        const removePointer = (event) => {
            state.pointerPositions.delete(event.pointerId);

            if (state.pointerPositions.size < 2) {
                state.pinchDistance = null;
            }
        };

        addListener(canvas, "pointerup", removePointer);
        addListener(canvas, "pointercancel", removePointer);
        addListener(canvas, "lostpointercapture", removePointer);

        canvas.style.touchAction = "pan-y";
    }

    /* ========================================================
       22. JOYSTICK
    ======================================================== */

    function setupJoystick() {
        const joystick = $("movementJoystick");
        const base = $("joystickBase");
        const knob = $("joystickKnob");

        if (!joystick || !base || !knob) return;

        function updateJoystick(event) {
            const rect = base.getBoundingClientRect();

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const maxRadius = Math.min(rect.width, rect.height) * 0.32;

            let dx = event.clientX - centerX;
            let dy = event.clientY - centerY;

            const distance = Math.hypot(dx, dy);

            if (distance > maxRadius) {
                dx = dx / distance * maxRadius;
                dy = dy / distance * maxRadius;
            }

            state.joystick.x = maxRadius ? dx / maxRadius : 0;
            state.joystick.y = maxRadius ? dy / maxRadius : 0;

            knob.style.transform = `translate(${dx}px, ${dy}px)`;

            if (state.match?.activePlayer) {
                const player = state.match.activePlayer;

                const forward = -state.joystick.y;
                const side = state.joystick.x;

                player.targetX = clamp(player.x + side * 12, -30, 30);
                player.targetZ = clamp(player.z + forward * 12, -49, 49);

                player.action = "run";
            }
        }

        addListener(joystick, "pointerdown", (event) => {
            event.preventDefault();

            state.joystick.active = true;
            state.joystick.pointerId = event.pointerId;

            try {
                joystick.setPointerCapture(event.pointerId);
            } catch (_) {}

            updateJoystick(event);
        });

        addListener(joystick, "pointermove", (event) => {
            if (
                state.joystick.active
                && event.pointerId === state.joystick.pointerId
            ) {
                event.preventDefault();
                updateJoystick(event);
            }
        });

        const endJoystick = (event) => {
            if (event.pointerId !== state.joystick.pointerId) return;

            state.joystick.active = false;
            state.joystick.pointerId = null;
            state.joystick.x = 0;
            state.joystick.y = 0;

            knob.style.transform = "translate(0, 0)";
        };

        addListener(joystick, "pointerup", endJoystick);
        addListener(joystick, "pointercancel", endJoystick);
        addListener(joystick, "lostpointercapture", endJoystick);
    }

    /* ========================================================
       23. SON ET MUSIQUE
    ======================================================== */

    function getAudioContext() {
        if (!state.audioContext) {
            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) return null;

            state.audioContext = new AudioContextClass();
        }

        if (state.audioContext.state === "suspended") {
            state.audioContext.resume().catch(() => {});
        }

        return state.audioContext;
    }

    function playSound(frequency = 440, duration = 0.1) {
        if (!state.soundEnabled || Number(state.settings.volume) <= 0) return;

        const context = getAudioContext();
        if (!context) return;

        try {
            const oscillator = context.createOscillator();
            const gain = context.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = frequency;

            gain.gain.value = clamp(state.settings.volume / 100, 0, 1) * 0.08;

            oscillator.connect(gain);
            gain.connect(context.destination);

            oscillator.start();

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                context.currentTime + duration
            );

            oscillator.stop(context.currentTime + duration);
        } catch (error) {
            console.warn("[FOBAS] Son indisponible :", error);
        }
    }

    function toggleSound() {
        state.soundEnabled = !state.soundEnabled;

        const button = $("soundToggleBtn");

        if (button) {
            button.textContent = state.soundEnabled ? "🔊" : "🔇";
            button.setAttribute("aria-pressed", String(state.soundEnabled));
        }

        if (state.soundEnabled) {
            getAudioContext();
            playSound(500, 0.1);
        }

        toast(state.soundEnabled ? "Son activé." : "Son désactivé.");
    }

    function startMenuMusic() {
        // Génération sonore légère : aucune piste audio externe obligatoire.
        // Les navigateurs exigent une interaction utilisateur avant le son.
        if (state.musicTimer) {
            clearInterval(state.musicTimer);
        }

        const notes = [330, 392, 440, 392, 294, 349, 392, 349];
        let index = 0;

        state.musicTimer = window.setInterval(() => {
            if (
                !state.soundEnabled
                || state.screen !== "mainMenu"
                || document.hidden
            ) {
                return;
            }

            playSound(notes[index % notes.length], 0.07);
            index++;
        }, 1800);
    }

    /* ========================================================
       24. TACTIQUES
    ======================================================== */

    function openTactics() {
        $("tacticsOverlay")?.classList.remove("hidden");
    }

    function closeTactics() {
        $("tacticsOverlay")?.classList.add("hidden");
    }

    function applyTactics() {
        if (!state.match) {
            closeTactics();
            toast("Les tactiques seront appliquées au prochain match.");
            return;
        }

        const formation = $("formationSelect")?.value || "433";
        const style = $("tacticalStyleSelect")?.value || "balanced";
        const pressure = $("pressureSelect")?.value || "medium";

        state.match.tactics = {
            formation,
            style,
            pressure
        };

        arrangePlayers(state.match.homePlayers, 0, formation);
        arrangePlayers(state.match.awayPlayers, 1, formation);

        if (style === "attacking") {
            state.match.players.forEach((player) => {
                player.homeZ += player.side === 0 ? 4 : -4;
            });
        }

        if (style === "defensive") {
            state.match.players.forEach((player) => {
                player.homeZ += player.side === 0 ? -4 : 4;
            });
        }

        closeTactics();
        toast("Tactiques appliquées.", "success");
    }

    /* ========================================================
       25. ÉVÉNEMENTS DE L'INTERFACE
    ======================================================== */

    function bindUI() {
        addListener($("playMatchBtn"), "click", () => {
            showScreen("matchSetupScreen");
        });

        addListener($("continueCareerBtn"), "click", continueCareer);

        addListener($("championshipsBtn"), "click", () => {
            showScreen("championshipScreen");
        });

        addListener($("tournamentsBtn"), "click", () => {
            showScreen("tournamentScreen");
        });

        addListener($("teamsBtn"), "click", () => {
            showScreen("teamsScreen");
            renderTeams();
        });

        addListener($("equipmentBtn"), "click", () => {
            showScreen("equipmentScreen");
        });

        addListener($("profileBtn"), "click", () => {
            showScreen("profileScreen");
        });

        addListener($("howToPlayBtn"), "click", () => {
            showScreen("howToPlayScreen");
        });

        addListener($("openSettingsBtn"), "click", openSettings);
        addListener($("soundToggleBtn"), "click", toggleSound);
        addListener($("pauseGameBtn"), "click", showPause);

        addListener($("confirmMatchBtn"), "click", async () => {
            await startMatch({
                homeTeamId: $("homeTeamSelect")?.value,
                awayTeamId: $("awayTeamSelect")?.value,
                duration: $("matchDurationSelect")?.value
            });
        });

        addListener($("passBtn"), "click", passBall);
        addListener($("shootBtn"), "click", shootBall);

        addListener($("sprintBtn"), "pointerdown", () => sprintPlayer(true));
        addListener($("sprintBtn"), "pointerup", () => sprintPlayer(false));
        addListener($("sprintBtn"), "pointercancel", () => sprintPlayer(false));
        addListener($("sprintBtn"), "pointerleave", () => sprintPlayer(false));

        addListener($("defendBtn"), "click", defendAction);
        addListener($("switchPlayerBtn"), "click", switchPlayer);

        addListener($("cameraZoomInBtn"), "click", () => zoomCamera(0.12));
        addListener($("cameraZoomOutBtn"), "click", () => zoomCamera(-0.12));
        addListener($("cameraResetBtn"), "click", resetCamera);
        addListener($("changeCameraBtn"), "click", changeCamera);

        addListener($("showTacticsBtn"), "click", openTactics);
        addListener($("closeTacticsBtn"), "click", closeTactics);
        addListener($("applyTacticsBtn"), "click", applyTactics);

        addListener($("saveMatchBtn"), "click", () => saveCurrentMatch(false));
        addListener($("savePausedMatchBtn"), "click", () => saveCurrentMatch(false));

        addListener($("resumeGameBtn"), "click", resumeMatch);

        addListener($("quitPausedMatchBtn"), "click", () => {
            state.paused = false;
            $("pauseOverlay")?.classList.add("hidden");
            showScreen("mainMenu");
        });

        addListener($("exitMatchBtn"), "click", () => {
            showDialog(
                "Quitter le match",
                "Voulez-vous quitter le match en cours ?",
                [
                    {
                        label: "Sauvegarder et quitter",
                        className: "ui-button button-primary",
                        onClick: async () => {
                            await saveCurrentMatch(false);
                            state.paused = false;
                            closeDialog();
                            showScreen("mainMenu");
                        }
                    },
                    {
                        label: "Continuer",
                        onClick: closeDialog
                    }
                ]
            );
        });

        addListener($("startChampionshipBtn"), "click", startChampionship);
        addListener($("createTournamentBtn"), "click", createTournamentFlow);

        addListener($("teamSearchInput"), "input", renderTeams);
        addListener($("teamRegionSelect"), "change", renderTeams);

        addListener($("refreshTeamsBtn"), "click", async () => {
            await initializeTeams();
            toast("Liste des équipes actualisée.", "success");
        });

        addListener($("saveProfileBtn"), "click", saveProfile);
        addListener($("saveSettingsBtn"), "click", saveSettings);
        addListener($("applyEquipmentBtn"), "click", applyEquipment);

        document.querySelectorAll("[data-equipment-tab]").forEach((button) => {
            addListener(button, "click", () => {
                state.equipmentTab = button.dataset.equipmentTab;

                document.querySelectorAll("[data-equipment-tab]").forEach((tab) => {
                    tab.classList.toggle("active", tab === button);
                    tab.setAttribute(
                        "aria-selected",
                        String(tab === button)
                    );
                });

                renderEquipment();
            });
        });

        document.querySelectorAll("[data-back]").forEach((button) => {
            addListener(button, "click", () => {
                const target = button.dataset.back;

                if (target === "mainMenu") {
                    showScreen("mainMenu");
                } else if (SCREEN_IDS.includes(target)) {
                    showScreen(target);
                }
            });
        });

        addListener($("closeDialogBtn"), "click", closeDialog);

        addListener($("dialogOverlay"), "click", (event) => {
            if (event.target === $("dialogOverlay")) {
                closeDialog();
            }
        });

        addListener($("retryLoadingBtn"), "click", () => {
            window.location.reload();
        });

        addListener(document, "visibilitychange", () => {
            if (document.hidden && state.match && !state.gameOver) {
                state.paused = true;
                $("pauseOverlay")?.classList.remove("hidden");
            }
        });

        addListener(window, "beforeunload", () => {
            state.shuttingDown = true;

            if (state.musicTimer) {
                clearInterval(state.musicTimer);
            }

            if (state.matchTimer) {
                clearInterval(state.matchTimer);
            }
        });
    }

    /* ========================================================
       26. QUALITÉ GRAPHIQUE
    ======================================================== */

    function applyGraphicsQuality() {
        if (!state.app) return;

        const device = state.app.graphicsDevice;
        const quality = state.settings.graphics;

        try {
            if (quality === "low") {
                device.maxPixelRatio = 1;
            } else if (quality === "high") {
                device.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            } else {
                device.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
            }

            state.app.resizeCanvas();
        } catch (error) {
            console.warn("[FOBAS] Réglage graphique :", error);
        }
    }

    /* ========================================================
       27. INITIALISATION GÉNÉRALE
    ======================================================== */

    async function initializeApp() {
        bindUI();
        setupJoystick();
        setupPinchZoom();

        setLoading(2, "Initialisation de l'application...");

        try {
            state.db = await openDatabase();
            setLoading(12, "Chargement des données locales...");
        } catch (error) {
            console.error("[FOBAS] IndexedDB :", error);

            showLoadingError(
                "Stockage local indisponible. Vérifiez les paramètres du navigateur."
            );

            // On continue quand même le démarrage sans sauvegarde.
            state.db = null;
        }

        try {
            await initializeTeams();
            await loadSavedData();

            setLoading(30, "Préparation du moteur 3D...");

            await initializeEngine();

            applySettingsToUI();
            applyGraphicsQuality();

            setLoading(90, "Finalisation de l'application...");

            state.tournaments = await dbRead("tournaments", "all")
                .then((record) => record?.data || [])
                .catch(() => []);

            renderChampionships();
            renderTournaments();
            renderEquipment();
            updateProfileUI();

            setLoading(100, "Prêt à jouer !");

            window.setTimeout(() => {
                $("loadingScreen")?.classList.add("hidden");
                showScreen("mainMenu");
            }, 350);

            startMenuMusic();

            setEngineStatus("PlayCanvas prêt");
            toast(`${APP_NAME} est prêt.`, "success");

            // Actualisation périodique des données persistées.
            window.setInterval(async () => {
                if (state.shuttingDown) return;

                try {
                    if (state.match && !state.gameOver) {
                        await saveCurrentMatch(false);
                    }

                    await saveData("settings", "main", {
                        data: { ...state.settings }
                    });
                } catch (error) {
                    console.warn("[FOBAS] Synchronisation périodique :", error);
                }
            }, 10 * 60 * 1000);

        } catch (error) {
            console.error("[FOBAS] Erreur de démarrage :", error);

            showLoadingError(
                `Erreur au lancement : ${error.message || "erreur inconnue"}`
            );

            setEngineStatus("Erreur de démarrage");
        }
    }

    /* ========================================================
       28. PROTECTION CONTRE LES ERREURS GLOBALES
    ======================================================== */

    window.addEventListener("error", (event) => {
        console.error("[FOBAS] Erreur JavaScript :", event.error || event.message);
    });

    window.addEventListener("unhandledrejection", (event) => {
        console.error("[FOBAS] Promesse rejetée :", event.reason);
    });

    /* ========================================================
       29. DÉMARRAGE
    ======================================================== */

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeApp, {
            once: true
        });
    } else {
        initializeApp();
    }

})();









