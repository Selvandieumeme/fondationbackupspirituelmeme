/* ================================================================
   FOBAS FOOTBALL ULTIMATE 3D
   Fichier : appfootballfobas.js
   Version : 1.0.0
   Moteur   : PlayCanvas 2.23.2 via import()
   Stockage : IndexedDB + localStorage fallback
   Cible    : Android / navigateur moderne

   COMPATIBILITÉ HTML :
   footballGameApp, loadingScreen, footballCanvas, pitchViewport,
   matchScreen, matchSetupScreen, mainMenu, joystick, match buttons,
   competition, teams, equipment, profile, settings, pause, tactics.
================================================================ */

(() => {
    "use strict";

    const CONFIG = window.FOBAS_FOOTBALL_CONFIG || {};

    const DB_NAME = CONFIG.databaseName || "FOBAS_FOOTBALL_ULTIMATE_DB";
    const DB_VERSION = CONFIG.databaseVersion || 1;
    const ENGINE_VERSION = CONFIG.engineVersion || "2.23.2";

    const $ = (id) => document.getElementById(id);

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const random = (min, max) =>
        min + Math.random() * (max - min);

    const distance2D = (a, b) =>
        Math.hypot(a.x - b.x, a.z - b.z);

    const safeText = (value) =>
        String(value ?? "").replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);

    const state = {
        pc: null,
        app: null,
        camera: null,
        cameraEntity: null,
        world: null,
        field: null,
        ball: null,
        ballShadow: null,

        homePlayers: [],
        awayPlayers: [],
        allPlayers: [],
        controlledPlayer: null,

        teams: [],
        selectedHome: "mare-rouge",
        selectedAway: "mole-saint-nicolas",
        selectedCompetition: "local",
        selectedStadium: "home",

        scoreHome: 0,
        scoreAway: 0,
        elapsed: 0,
        matchDuration: 90,
        matchStarted: false,
        matchFinished: false,
        paused: false,
        kickoffTimer: 0,

        ballVelocity: { x: 0, z: 0 },
        ballOwner: null,
        lastTouchTeam: "home",

        joystick: { x: 0, z: 0, active: false },
        sprinting: false,
        defending: false,

        cameraDistance: 43,
        cameraMode: 0,
        cameraSensitivity: 0.5,

        db: null,
        soundEnabled: true,
        audioContext: null,

        currentScreen: "mainMenu",

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
        selectedEquipmentTab: "kits",
        selectedEquipment: {
            kits: "classic",
            balls: "classic",
            boots: "classic"
        },

        autoSaveTimer: null,
        lastFrame: 0,
        lastAIStep: 0,
        lastAnnouncement: 0,
        booting: false,
        listenersAttached: false,
        engineReady: false,
        engineError: null,
        saveQueue: Promise.resolve()
    };

    const TEAM_COLORS = [
        [0.10, 0.42, 0.92],
        [0.86, 0.12, 0.15],
        [0.10, 0.65, 0.35],
        [0.95, 0.67, 0.08],
        [0.50, 0.20, 0.78],
        [0.08, 0.70, 0.78],
        [0.95, 0.38, 0.08],
        [0.85, 0.85, 0.90],
        [0.20, 0.25, 0.32],
        [0.70, 0.20, 0.42]
    ];

    const LOCAL_REGIONS = CONFIG.localRegions || [
        "Môle-Saint-Nicolas",
        "Mare-Rouge",
        "Jean-Rabel",
        "Bombardopolis",
        "Baie-de-Henne",
        "Port-de-Paix",
        "La Tortue",
        "Bassin-Bleu",
        "Chansolme",
        "Saint-Louis-du-Nord",
        "Anse-à-Foleur"
    ];

    const INTERNATIONAL_REGIONS = {
        caribbean: [
            "Cap-Haïtien", "Gonaïves", "Saint-Marc", "Port-au-Prince",
            "Les Cayes", "Jérémie", "Jacmel", "Santo Domingo",
            "Kingston", "Bridgetown", "Castries", "Nassau",
            "San Juan", "Port of Spain"
        ],
        americas: [
            "Miami", "New York", "Los Angeles", "Montréal",
            "Toronto", "Mexico City", "Bogotá", "Medellín",
            "São Paulo", "Rio de Janeiro", "Buenos Aires", "Lima"
        ],
        europe: [
            "Paris", "Madrid", "Barcelona", "London", "Manchester",
            "Lisbon", "Rome", "Milan", "Berlin", "Munich",
            "Amsterdam", "Brussels", "Porto", "Marseille"
        ],
        africa: [
            "Dakar", "Abidjan", "Accra", "Lagos", "Casablanca",
            "Tunis", "Cairo", "Nairobi", "Johannesburg", "Kigali"
        ],
        international: [
            "Tokyo", "Seoul", "Sydney", "Dubai", "Doha",
            "Istanbul", "Singapore", "Bangkok", "Melbourne", "Auckland"
        ]
    };

    const EQUIPMENT = {
        kits: [
            { id: "classic", name: "Maillot classique", color: "#1769d2" },
            { id: "red", name: "Maillot rouge", color: "#dc3545" },
            { id: "green", name: "Maillot vert", color: "#159447" },
            { id: "gold", name: "Maillot doré", color: "#d8a529" },
            { id: "black", name: "Maillot noir", color: "#202632" },
            { id: "white", name: "Maillot blanc", color: "#e8edf4" }
        ],
        balls: [
            { id: "classic", name: "Ballon classique", color: "#ffffff" },
            { id: "gold", name: "Ballon doré", color: "#d6a62a" },
            { id: "ocean", name: "Ballon océan", color: "#168ed0" },
            { id: "fire", name: "Ballon feu", color: "#ed6325" }
        ],
        boots: [
            { id: "classic", name: "Chaussures classiques", color: "#252525" },
            { id: "red", name: "Chaussures rouges", color: "#e84141" },
            { id: "gold", name: "Chaussures dorées", color: "#d8aa28" },
            { id: "blue", name: "Chaussures bleues", color: "#2074db" }
        ]
    };

    /* ============================================================
       1. DIAGNOSTIC ET CHARGEMENT
    ============================================================ */

    console.info("[FOBAS FOOTBALL] appfootballfobas.js chargé.");

    function setLoading(percent, message) {
        const value = clamp(Math.round(percent), 0, 100);

        const bar = $("loadingProgressBar");
        const label = $("loadingPercent");
        const track = $("loadingProgressTrack");
        const messageNode = $("loadingMessage");

        if (bar) bar.style.width = `${value}%`;
        if (label) label.textContent = `${value} %`;

        if (track) {
            track.setAttribute("aria-valuenow", String(value));
        }

        if (messageNode && message) {
            messageNode.textContent = message;
        }
    }

    function setEngineStatus(message, isError = false) {
        const node = $("engineStatus");

        if (node) {
            node.textContent = message;
            node.dataset.state = isError ? "error" : "ready";
        }
    }

    function showLoadingError(error) {
        state.engineError = error;

        const message = error?.message || String(error || "Erreur inconnue");

        console.error("[FOBAS FOOTBALL] Erreur de démarrage :", error);

        setLoading(100, `Impossible de démarrer : ${message}`);
        setEngineStatus(`Erreur : ${message}`, true);

        const retry = $("retryLoadingBtn");
        if (retry) retry.classList.remove("hidden");

        toast(
            "Le moteur 3D n'a pas pu démarrer. Vérifiez la connexion Internet et réessayez.",
            "error",
            6500
        );
    }

    window.addEventListener("error", (event) => {
        console.error(
            "[FOBAS FOOTBALL] Erreur JavaScript :",
            event.message,
            event.filename,
            event.lineno
        );
    });

    window.addEventListener("unhandledrejection", (event) => {
        console.error(
            "[FOBAS FOOTBALL] Promesse rejetée :",
            event.reason
        );
    });

    async function importPlayCanvas() {
        const sources = [
            `https://esm.sh/playcanvas@${ENGINE_VERSION}`,
            `https://cdn.jsdelivr.net/npm/playcanvas@${ENGINE_VERSION}/build/playcanvas.mjs`
        ];

        let lastError = null;

        for (const source of sources) {
            try {
                setLoading(8, "Chargement de PlayCanvas 3D...");

                console.info("[FOBAS FOOTBALL] Import du moteur :", source);

                const module = await import(source);

                if (
                    module &&
                    typeof module.Application === "function" &&
                    typeof module.Entity === "function"
                ) {
                    console.info("[FOBAS FOOTBALL] PlayCanvas prêt.");
                    return module;
                }

                throw new Error("Le module chargé ne contient pas Application et Entity.");
            } catch (error) {
                lastError = error;
                console.warn(
                    "[FOBAS FOOTBALL] Source du moteur indisponible :",
                    source,
                    error
                );
            }
        }

        throw new Error(
            `PlayCanvas ${ENGINE_VERSION} indisponible. ` +
            "Vérifiez la connexion Internet, le chemin du module et les règles CORS. " +
            (lastError?.message || "")
        );
    }

    /* ============================================================
       2. OUTILS DOM / NOTIFICATIONS / NAVIGATION
    ============================================================ */

    function toast(message, type = "info", duration = 3200) {
        const container = $("toastContainer");

        if (!container) {
            console.log(`[FOBAS ${type.toUpperCase()}] ${message}`);
            return;
        }

        const item = document.createElement("div");
        item.className = `fobas-toast toast-${type}`;
        item.textContent = message;

        Object.assign(item.style, {
            position: "relative",
            margin: "8px",
            padding: "12px 15px",
            borderRadius: "10px",
            color: "#ffffff",
            background: type === "error"
                ? "#a72b35"
                : type === "success"
                    ? "#137849"
                    : "#12304c",
            boxShadow: "0 5px 20px #0004",
            fontSize: "13px",
            lineHeight: "1.4",
            zIndex: "99999"
        });

        container.appendChild(item);

        window.setTimeout(() => {
            item.remove();
        }, duration);
    }

    function showDialog(title, content, actions = []) {
        const overlay = $("dialogOverlay");
        const titleNode = $("dialogTitle");
        const contentNode = $("dialogContent");
        const actionsNode = $("dialogActions");

        if (!overlay || !titleNode || !contentNode || !actionsNode) {
            toast(String(content).replace(/<[^>]*>/g, " "), "info");
            return;
        }

        titleNode.textContent = title;
        contentNode.innerHTML = content;
        actionsNode.replaceChildren();

        actions.forEach((action) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = action.className || "ui-button button-primary";
            button.textContent = action.label;

            button.addEventListener("click", async () => {
                if (typeof action.onClick === "function") {
                    await action.onClick();
                }

                if (action.close !== false) {
                    overlay.classList.add("hidden");
                }
            });

            actionsNode.appendChild(button);
        });

        overlay.classList.remove("hidden");
    }

    function closeDialog() {
        $("dialogOverlay")?.classList.add("hidden");
    }

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

    function showScreen(id) {
        if (!$(id)) {
            console.warn(`[FOBAS FOOTBALL] Écran introuvable : ${id}`);
            return;
        }

        SCREEN_IDS.forEach((screenId) => {
            const element = $(screenId);
            if (element) element.classList.toggle("hidden", screenId !== id);
        });

        state.currentScreen = id;

        if (id !== "matchScreen") {
            $("pauseOverlay")?.classList.add("hidden");
            $("tacticsOverlay")?.classList.add("hidden");
        }

        if (id === "matchScreen" && state.app) {
            window.setTimeout(resizeCanvas, 80);
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /* ============================================================
       3. STOCKAGE INDEXEDDB + SOLUTION DE SECOURS
    ============================================================ */

    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!("indexedDB" in window)) {
                reject(new Error("IndexedDB non disponible."));
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = () => {
                const db = request.result;

                [
                    "game",
                    "profile",
                    "settings",
                    "teams",
                    "equipment",
                    "career",
                    "tournaments"
                ].forEach((name) => {
                    if (!db.objectStoreNames.contains(name)) {
                        db.createObjectStore(name, { keyPath: "id" });
                    }
                });
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error("Erreur IndexedDB."));
            request.onblocked = () => {
                console.warn("[FOBAS FOOTBALL] Ouverture IndexedDB bloquée.");
            };
        });
    }

    function dbWrite(storeName, id, value) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                try {
                    localStorage.setItem(
                        `FOBAS_FOOTBALL_${storeName}_${id}`,
                        JSON.stringify(value)
                    );
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
                return;
            }

            try {
                const transaction = state.db.transaction(storeName, "readwrite");

                transaction.objectStore(storeName).put({
                    id,
                    value,
                    updatedAt: Date.now()
                });

                transaction.oncomplete = () => resolve(true);
                transaction.onerror = () => reject(transaction.error);
                transaction.onabort = () => reject(transaction.error);
            } catch (error) {
                reject(error);
            }
        });
    }

    function dbRead(storeName, id) {
        return new Promise((resolve) => {
            if (!state.db) {
                try {
                    const raw = localStorage.getItem(
                        `FOBAS_FOOTBALL_${storeName}_${id}`
                    );
                    resolve(raw ? JSON.parse(raw) : null);
                } catch {
                    resolve(null);
                }
                return;
            }

            try {
                const request = state.db
                    .transaction(storeName, "readonly")
                    .objectStore(storeName)
                    .get(id);

                request.onsuccess = () => resolve(request.result?.value ?? null);
                request.onerror = () => resolve(null);
            } catch {
                resolve(null);
            }
        });
    }

    async function loadSavedState() {
        const [profile, settings, equipment, career, tournaments] =
            await Promise.all([
                dbRead("profile", "main"),
                dbRead("settings", "main"),
                dbRead("equipment", "main"),
                dbRead("career", "main"),
                dbRead("tournaments", "main")
            ]);

        if (profile && typeof profile === "object") {
            Object.assign(state.profile, profile);
        }

        if (settings && typeof settings === "object") {
            Object.assign(state.settings, settings);
        }

        if (equipment && typeof equipment === "object") {
            Object.assign(state.selectedEquipment, equipment);
        }

        if (career && typeof career === "object") {
            Object.assign(state.career, career);
        }

        if (Array.isArray(tournaments)) {
            state.tournaments = tournaments;
        }

        applySettingsToUI();
        applyProfileToUI();
    }

    async function saveAll(showMessage = true) {
        const tasks = [
            ["profile", "main", state.profile],
            ["settings", "main", state.settings],
            ["equipment", "main", state.selectedEquipment],
            ["career", "main", state.career],
            ["tournaments", "main", state.tournaments],
            ["teams", "all", state.teams]
        ];

        if (state.matchStarted) {
            tasks.push([
                "game",
                "activeMatch",
                getMatchSnapshot()
            ]);
        }

        state.saveQueue = state.saveQueue.then(async () => {
            for (const [store, id, value] of tasks) {
                try {
                    await dbWrite(store, id, value);
                } catch (error) {
                    console.warn(`[FOBAS FOOTBALL] Sauvegarde ${store} :`, error);
                }
            }
        });

        await state.saveQueue;

        const label = $("saveStatusLabel");
        if (label) {
            label.textContent = `Sauvegardé à ${new Date().toLocaleTimeString()}`;
        }

        if (showMessage) toast("Progression sauvegardée.", "success");
    }

    function getMatchSnapshot() {
        return {
            selectedHome: state.selectedHome,
            selectedAway: state.selectedAway,
            selectedCompetition: state.selectedCompetition,
            scoreHome: state.scoreHome,
            scoreAway: state.scoreAway,
            elapsed: state.elapsed,
            matchDuration: state.matchDuration,
            matchFinished: state.matchFinished,
            savedAt: Date.now()
        };
    }

    async function saveMatch() {
        if (!state.matchStarted) {
            toast("Aucun match actif à sauvegarder.", "info");
            return;
        }

        try {
            await dbWrite("game", "activeMatch", getMatchSnapshot());
            toast("Match sauvegardé avec succès.", "success");
            updateSaveStatus();
        } catch (error) {
            console.error(error);
            toast("La sauvegarde du match a échoué.", "error");
        }
    }

    function updateSaveStatus() {
        const label = $("saveStatusLabel");
        if (label) label.textContent = "Progression sauvegardée localement";
    }

    /* ============================================================
       4. CRÉATION DES ÉQUIPES DYNAMIQUES
    ============================================================ */

    function slugify(text) {
        return String(text)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function createTeam(id, name, region, category, index) {
        const color = TEAM_COLORS[index % TEAM_COLORS.length];

        return {
            id,
            name,
            region,
            category,
            color: color.slice(),
            rating: Math.round(random(60, 92)),
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0
        };
    }

    function buildTeams() {
        const teams = [];
        const seen = new Set();

        function add(name, region, category) {
            const id = slugify(name);

            if (!id || seen.has(id)) return;

            seen.add(id);
            teams.push(createTeam(id, name, region, category, teams.length));
        }

        LOCAL_REGIONS.forEach((name) => add(name, "Nord-Ouest d'Haïti", "northwest"));

        Object.entries(INTERNATIONAL_REGIONS).forEach(([category, names]) => {
            names.forEach((name) => add(name, name, category));
        });

        const prefixes = [
            "FOBAS", "UNITED", "ATHLETIC", "REAL", "SPORTING",
            "ACADEMY", "LEGENDS", "STARS", "DYNAMO", "ELITE"
        ];

        const bases = [
            "NORD", "SUD", "CARAÏBES", "TROPICAL", "HORIZON",
            "PHOENIX", "TITANS", "CHAMPIONS", "ESPOIR", "VICTOIRE",
            "OCEAN", "MONTAGNE", "FALAISE", "SOLEIL", "FUTUR"
        ];

        let generatedIndex = 0;

        while (teams.length < Math.max(100, Number(CONFIG.initialTeamCount) || 100)) {
            const prefix = prefixes[generatedIndex % prefixes.length];
            const base = bases[Math.floor(generatedIndex / prefixes.length) % bases.length];
            const suffix = Math.floor(generatedIndex / (prefixes.length * bases.length)) + 1;

            add(
                `${prefix} ${base} ${suffix}`,
                "Équipe internationale",
                "international"
            );

            generatedIndex++;
        }

        state.teams = teams;

        console.info(`[FOBAS FOOTBALL] ${teams.length} équipes disponibles.`);
    }

    function getTeam(id) {
        return state.teams.find((team) => team.id === id) ||
            state.teams.find((team) => team.id === "mare-rouge") ||
            state.teams[0];
    }

    function colorToHex(color) {
        if (typeof color === "string") return color;

        const parts = color || [0.1, 0.4, 0.9];

        return "#" + parts
            .map((value) => Math.round(clamp(value, 0, 1) * 255)
                .toString(16).padStart(2, "0"))
            .join("");
    }

    function populateSelect(select, teams, selectedId) {
        if (!select) return;

        const current = selectedId || select.value;
        select.replaceChildren();

        teams.forEach((team) => {
            const option = document.createElement("option");
            option.value = team.id;
            option.textContent = team.name;
            select.appendChild(option);
        });

        if (teams.some((team) => team.id === current)) {
            select.value = current;
        }
    }

    function populateTeamSelectors() {
        const home = $("homeTeamSelect");
        const away = $("awayTeamSelect");

        populateSelect(home, state.teams, state.selectedHome);
        populateSelect(away, state.teams, state.selectedAway);

        if (home) home.value = state.selectedHome;
        if (away) away.value = state.selectedAway;
    }

    function renderTeams() {
        const list = $("teamsList");
        if (!list) return;

        const query = ($("teamSearchInput")?.value || "").trim().toLowerCase();
        const region = $("teamRegionSelect")?.value || "all";

        const filtered = state.teams.filter((team) => {
            const text = `${team.name} ${team.region} ${team.category}`.toLowerCase();

            const matchesQuery = !query || text.includes(query);
            const matchesRegion = region === "all" ||
                (region === "northwest" && team.category === "northwest") ||
                (region === "haiti" && team.category === "haiti") ||
                team.category === region;

            return matchesQuery && matchesRegion;
        });

        list.replaceChildren();

        filtered.forEach((team) => {
            const card = document.createElement("article");
            card.className = "team-card";

            const color = colorToHex(team.color);

            card.innerHTML = `
                <span class="team-color-mark" style="background:${color}"></span>
                <div class="team-card-info">
                    <strong>${safeText(team.name)}</strong>
                    <small>${safeText(team.region)}</small>
                    <small>Force ${team.rating} · ${team.wins} victoires</small>
                </div>
                <button type="button" class="ui-button button-secondary"
                    data-team-select="${safeText(team.id)}">
                    CHOISIR
                </button>
            `;

            list.appendChild(card);
        });

        const count = $("teamCountLabel");
        if (count) count.textContent = `${filtered.length} équipe(s) affichée(s)`;
    }

    /* ============================================================
       5. MATÉRIAUX ET ENTITÉS PLAYCANVAS
    ============================================================ */

    function createMaterial(color, emissive = null) {
        const material = new state.pc.StandardMaterial();

        const normalized = Array.isArray(color)
            ? color
            : [1, 1, 1];

        material.diffuse = new state.pc.Color(
            normalized[0],
            normalized[1],
            normalized[2]
        );

        if (emissive) {
            material.emissive = new state.pc.Color(
                emissive[0],
                emissive[1],
                emissive[2]
            );
        }

        material.metalness = 0;
        material.gloss = 0.25;
        material.update();

        return material;
    }

    function createPrimitive(name, type, position, scale, material, parent = state.world) {
        const entity = new state.pc.Entity(name);

        entity.addComponent("render", { type });

        entity.setLocalPosition(position[0], position[1], position[2]);
        entity.setLocalScale(scale[0], scale[1], scale[2]);

        if (material && entity.render) {
            entity.render.material = material;
        }

        parent.addChild(entity);

        return entity;
    }

    function createBox(name, position, scale, material, parent = state.world) {
        return createPrimitive(name, "box", position, scale, material, parent);
    }

    function createSphere(name, position, scale, material, parent = state.world) {
        return createPrimitive(name, "sphere", position, scale, material, parent);
    }

    function createCylinder(name, position, scale, material, parent = state.world) {
        return createPrimitive(name, "cylinder", position, scale, material, parent);
    }

    function createLine(name, x1, z1, x2, z2, material, thickness = 0.055) {
        const dx = x2 - x1;
        const dz = z2 - z1;
        const length = Math.hypot(dx, dz);

        if (length < 0.001) return null;

        const line = createBox(
            name,
            [(x1 + x2) / 2, 0.035, (z1 + z2) / 2],
            [thickness, 0.035, length],
            material
        );

        line.setLocalEulerAngles(0, Math.atan2(dx, dz) * 180 / Math.PI, 0);

        return line;
    }

    function createField() {
        state.field = new state.pc.Entity("FOBAS Football Stadium");
        state.world.addChild(state.field);

        const grassA = createMaterial([0.06, 0.37, 0.17]);
        const grassB = createMaterial([0.08, 0.43, 0.19]);
        const white = createMaterial([0.94, 0.96, 0.91]);
        const darkGreen = createMaterial([0.035, 0.23, 0.10]);
        const goalMaterial = createMaterial([0.92, 0.95, 1.0]);
        const crowdMaterial = createMaterial([0.18, 0.23, 0.32]);

        // Terrain : 34 unités de large, 52 unités de long.
        createBox(
            "Terrain de football",
            [0, -0.35, 0],
            [38, 0.55, 58],
            darkGreen
        );

        createBox(
            "Surface de jeu",
            [0, -0.04, 0],
            [34, 0.15, 52],
            grassA
        );

        // Bandes de pelouse pour donner une meilleure lecture du terrain.
        for (let i = 0; i < 8; i++) {
            const z = -22.75 + i * 6.5;

            createBox(
                `Bande de pelouse ${i + 1}`,
                [0, 0.045, z],
                [33.7, 0.02, 3.25],
                i % 2 === 0 ? grassA : grassB
            );
        }

        // Lignes extérieures.
        createLine("Ligne gauche", -17, -26, -17, 26, white);
        createLine("Ligne droite", 17, -26, 17, 26, white);
        createLine("Ligne de fond nord", -17, -26, 17, -26, white);
        createLine("Ligne de fond sud", -17, 26, 17, 26, white);
        createLine("Ligne médiane", -17, 0, 17, 0, white);

        // Cercle central : représentation polygonale.
        for (let i = 0; i < 40; i++) {
            const a1 = i / 40 * Math.PI * 2;
            const a2 = (i + 1) / 40 * Math.PI * 2;

            createLine(
                `Cercle central ${i}`,
                Math.cos(a1) * 4.1,
                Math.sin(a1) * 4.1,
                Math.cos(a2) * 4.1,
                Math.sin(a2) * 4.1,
                white,
                0.045
            );
        }

        // Surfaces de réparation.
        [-1, 1].forEach((side) => {
            const z = side * 20.1;
            const z2 = side * 26;

            createLine(
                `Surface ${side} gauche`,
                -10, z, -10, z2, white
            );
            createLine(
                `Surface ${side} droite`,
                10, z, 10, z2, white
            );
            createLine(
                `Surface ${side} face`,
                -10, z, 10, z, white
            );

            const smallZ = side * 23.5;
            createLine(
                `Petite surface ${side} gauche`,
                -4.5, smallZ, -4.5, z2, white
            );
            createLine(
                `Petite surface ${side} droite`,
                4.5, smallZ, 4.5, z2, white
            );
            createLine(
                `Petite surface ${side} face`,
                -4.5, smallZ, 4.5, smallZ, white
            );

            // Gola.
            createBox(
                `Poteau gauche ${side}`,
                [-3.7, 0.85, z2],
                [0.16, 1.7, 0.16],
                goalMaterial
            );

            createBox(
                `Poteau droit ${side}`,
                [3.7, 0.85, z2],
                [0.16, 1.7, 0.16],
                goalMaterial
            );

            createBox(
                `Barre transversale ${side}`,
                [0, 1.65, z2],
                [7.5, 0.16, 0.16],
                goalMaterial
            );

            // Filet stylisé à l'arrière du but.
            createBox(
                `Filet ${side}`,
                [0, 0.85, z2 + side * 1.1],
                [7.25, 1.55, 0.08],
                white
            );
        });

        // Petits projecteurs aux quatre coins.
        for (const x of [-20, 20]) {
            for (const z of [-27, 27]) {
                createCylinder(
                    "Pylône de stade",
                    [x, 4.5, z],
                    [0.25, 9, 0.25],
                    crowdMaterial
                );

                createBox(
                    "Projecteur",
                    [x, 9.1, z],
                    [1.5, 0.5, 0.8],
                    white
                );
            }
        }

        // Tribune simplifiée hors du terrain.
        createBox(
            "Tribune ouest",
            [-22, 0.4, 0],
            [5, 1.8, 43],
            crowdMaterial
        );

        createBox(
            "Tribune est",
            [22, 0.4, 0],
            [5, 1.8, 43],
            crowdMaterial
        );
    }

    /* ============================================================
       6. JOUEURS 3D ET FORMATIONS
    ============================================================ */

    function getFormationPositions(formation) {
        const maps = {
            "442": [4, 4, 2],
            "433": [4, 3, 3],
            "352": [3, 5, 2],
            "4231": [4, 2, 3, 1],
            "541": [5, 4, 1]
        };

        const lines = maps[formation] || maps["433"];
        const positions = [[0, 0, 24]];

        const lineCount = lines.length;

        for (let row = 0; row < lineCount; row++) {
            const number = lines[row];
            const z = 17 - row * (30 / Math.max(1, lineCount - 1));

            for (let index = 0; index < number; index++) {
                const x = number === 1
                    ? 0
                    : -12 + index * (24 / (number - 1));

                positions.push([x, 0, z]);
            }
        }

        // Garantit 11 positions, même si une formation est mal définie.
        while (positions.length < 11) {
            const index = positions.length;
            positions.push([
                ((index % 5) - 2) * 4,
                0,
                10 - Math.floor(index / 5) * 7
            ]);
        }

        return positions.slice(0, 11);
    }

    function createPlayerModel(team, index, side, formationPosition) {
        const group = new state.pc.Entity(`${team.name} joueur ${index + 1}`);
        state.world.addChild(group);

        const color = team.color.slice();
        const shirtMaterial = createMaterial(color);

        const skinTones = [
            [0.50, 0.30, 0.20],
            [0.68, 0.44, 0.30],
            [0.36, 0.21, 0.13],
            [0.78, 0.58, 0.43]
        ];

        const skinMaterial = createMaterial(skinTones[index % skinTones.length]);
        const shortsMaterial = createMaterial([0.10, 0.12, 0.16]);
        const socksMaterial = createMaterial(color);
        const bootMaterial = createMaterial([0.045, 0.045, 0.05]);
        const numberMaterial = createMaterial([1, 1, 1]);

        const body = createCylinder(
            `Corps ${index + 1}`,
            [0, 0.88, 0],
            [0.50, 0.72, 0.34],
            shirtMaterial,
            group
        );

        const head = createSphere(
            `Tête ${index + 1}`,
            [0, 1.52, 0],
            [0.32, 0.34, 0.32],
            skinMaterial,
            group
        );

        createBox(
            `Short ${index + 1}`,
            [0, 0.43, 0],
            [0.46, 0.28, 0.32],
            shortsMaterial,
            group
        );

        const leftLeg = createBox(
            `Jambe gauche ${index + 1}`,
            [-0.13, 0.20, 0.015],
            [0.15, 0.38, 0.17],
            socksMaterial,
            group
        );

        const rightLeg = createBox(
            `Jambe droite ${index + 1}`,
            [0.13, 0.20, 0.015],
            [0.15, 0.38, 0.17],
            socksMaterial,
            group
        );

        createSphere(
            `Chaussure gauche ${index + 1}`,
            [-0.13, 0.045, -0.07],
            [0.18, 0.10, 0.30],
            bootMaterial,
            group
        );

        createSphere(
            `Chaussure droite ${index + 1}`,
            [0.13, 0.045, -0.07],
            [0.18, 0.10, 0.30],
            bootMaterial,
            group
        );

        const leftArm = createBox(
            `Bras gauche ${index + 1}`,
            [-0.32, 0.91, 0],
            [0.13, 0.50, 0.15],
            shirtMaterial,
            group
        );

        const rightArm = createBox(
            `Bras droit ${index + 1}`,
            [0.32, 0.91, 0],
            [0.13, 0.50, 0.15],
            shirtMaterial,
            group
        );

        const number = createBox(
            `Numéro ${index + 1}`,
            [0, 0.94, -0.178],
            [0.18, 0.22, 0.025],
            numberMaterial,
            group
        );

        // Marqueur au-dessus du joueur humain contrôlé.
        const marker = createSphere(
            `Marqueur joueur ${index + 1}`,
            [0, 2.10, 0],
            [0.14, 0.07, 0.14],
            createMaterial([1, 0.86, 0.10], [0.35, 0.25, 0.02]),
            group
        );

        marker.enabled = false;

        const sign = side === "home" ? 1 : -1;

        const player = {
            id: `${side}-${index}`,
            index,
            teamSide: side,
            team,
            name: (CONFIG.playerNames || [])[index] ||
                `${side === "home" ? "FOBAS" : "ADV"} ${index + 1}`,
            entity: group,
            body,
            head,
            leftLeg,
            rightLeg,
            leftArm,
            rightArm,
            marker,
            x: formationPosition[0],
            z: formationPosition[2] * sign,
            vx: 0,
            vz: 0,
            speed: 0,
            stamina: 100,
            hasBall: false,
            role: index === 0 ? "GK" : "field",
            facing: side === "home" ? -1 : 1,
            rating: team.rating + random(-8, 8),
            aiTarget: null,
            animationTime: random(0, 10)
        };

        group.setLocalPosition(player.x, 0, player.z);

        return player;
    }

    function resetPlayers() {
        state.homePlayers.forEach((player) => player.entity.destroy());
        state.awayPlayers.forEach((player) => player.entity.destroy());

        state.homePlayers = [];
        state.awayPlayers = [];
        state.allPlayers = [];

        const homeTeam = getTeam(state.selectedHome);
        const awayTeam = getTeam(state.selectedAway);

        const positions = getFormationPositions(state.tactics.formation);

        for (let i = 0; i < 11; i++) {
            state.homePlayers.push(
                createPlayerModel(homeTeam, i, "home", positions[i])
            );

            state.awayPlayers.push(
                createPlayerModel(awayTeam, i, "away", positions[i])
            );
        }

        state.allPlayers = [...state.homePlayers, ...state.awayPlayers];

        state.controlledPlayer = state.homePlayers[9] || state.homePlayers[0];

        // Le joueur choisi reste le seul joueur directement contrôlé.
        updateControlledMarker();

        state.allPlayers.forEach((player) => {
            player.entity.enabled = true;
        });
    }

    function updateControlledMarker() {
        state.allPlayers.forEach((player) => {
            if (player.marker) {
                player.marker.enabled = player === state.controlledPlayer;
            }
        });
    }

    function switchPlayer() {
        if (!state.matchStarted || !state.homePlayers.length) return;

        const ball = getBallPosition();

        let candidates = state.homePlayers.filter(
            (player) => player !== state.controlledPlayer
        );

        candidates.sort((a, b) =>
            distance2D(a, ball) - distance2D(b, ball)
        );

        state.controlledPlayer = candidates[0] || state.homePlayers[0];

        updateControlledMarker();

        announce(
            "JOUEUR SÉLECTIONNÉ",
            state.controlledPlayer.name,
            1000
        );
    }

    /* ============================================================
       7. BALLON, CAMÉRA ET LUMIÈRES
    ============================================================ */

    function createBall() {
        if (state.ball) state.ball.destroy();

        const material = createMaterial([0.96, 0.96, 0.91]);

        state.ball = createSphere(
            "Ballon FOBAS",
            [0, 0.45, 0],
            [0.45, 0.45, 0.45],
            material
        );

        state.ballShadow = createCylinder(
            "Ombre du ballon",
            [0, 0.055, 0],
            [0.50, 0.02, 0.50],
            createMaterial([0.035, 0.06, 0.035])
        );

        state.ballVelocity = { x: 0, z: 0 };
        state.ballOwner = null;
    }

    function getBallPosition() {
        if (!state.ball) return { x: 0, z: 0 };

        const p = state.ball.getPosition();

        return { x: p.x, z: p.z };
    }

    function setBallPosition(x, z, y = 0.45) {
        if (!state.ball) return;

        state.ball.setLocalPosition(x, y, z);

        if (state.ballShadow) {
            state.ballShadow.setLocalPosition(x, 0.055, z);
        }
    }

    function createCamera() {
        state.cameraEntity = new state.pc.Entity("Camera principale FOBAS");

        state.cameraEntity.addComponent("camera", {
            clearColor: new state.pc.Color(0.035, 0.07, 0.12),
            fov: 48,
            nearClip: 0.1,
            farClip: 250
        });

        state.world.addChild(state.cameraEntity);

        state.camera = state.cameraEntity.camera;

        updateCamera(true);
    }

    function updateCamera(snap = false) {
        if (!state.cameraEntity || !state.app) return;

        const player = state.controlledPlayer;

        let targetX = 0;
        let targetZ = 0;

        if (player && state.cameraMode !== 0) {
            targetX = player.x * 0.32;
            targetZ = player.z * 0.28;
        }

        const height = state.cameraDistance;
        const target = new state.pc.Vec3(targetX, 0, targetZ);

        const cameraPosition = new state.pc.Vec3(
            targetX,
            height,
            targetZ + height * 0.06
        );

        if (snap) {
            state.cameraEntity.setPosition(
                cameraPosition.x,
                cameraPosition.y,
                cameraPosition.z
            );
        } else {
            const current = state.cameraEntity.getPosition();
            const factor = 1 - Math.exp(-3.0 * (1 / 60));

            state.cameraEntity.setPosition(
                current.x + (cameraPosition.x - current.x) * factor,
                current.y + (cameraPosition.y - current.y) * factor,
                current.z + (cameraPosition.z - current.z) * factor
            );
        }

        state.cameraEntity.lookAt(target);
    }

    function setupLighting() {
        const ambient = new state.pc.Entity("Lumière ambiante");

        ambient.addComponent("light", {
            type: "directional",
            color: new state.pc.Color(1, 0.95, 0.85),
            intensity: 1.15,
            castShadows: false
        });

        ambient.setEulerAngles(42, 30, 0);
        state.world.addChild(ambient);

        const fill = new state.pc.Entity("Lumière de remplissage");

        fill.addComponent("light", {
            type: "directional",
            color: new state.pc.Color(0.65, 0.78, 1),
            intensity: 0.35,
            castShadows: false
        });

        fill.setEulerAngles(25, -130, 0);
        state.world.addChild(fill);
    }

    /* ============================================================
       8. INITIALISATION DU MOTEUR 3D
    ============================================================ */

    async function initializeEngine() {
        if (state.booting) return;

        state.booting = true;

        try {
            setLoading(2, "Préparation de l'application...");

            const canvas = $("footballCanvas");

            if (!canvas) {
                throw new Error(
                    "Canvas #footballCanvas introuvable. Vérifiez l'identifiant dans le HTML."
                );
            }

            if (!window.WebGLRenderingContext) {
                throw new Error(
                    "WebGL n'est pas disponible dans ce navigateur. Essayez Chrome à jour."
                );
            }

            state.pc = await importPlayCanvas();

            setLoading(28, "Création du moteur graphique...");

            const graphicsDeviceOptions = {
                antialias: true,
                alpha: false,
                preserveDrawingBuffer: false,
                powerPreference: "high-performance"
            };

            state.app = new state.pc.Application(canvas, {
                graphicsDeviceOptions
            });

            if (typeof state.app.setCanvasFillMode === "function") {
                try {
                    state.app.setCanvasFillMode(state.pc.FILLMODE_NONE);
                } catch (error) {
                    console.warn("Canvas fill mode non appliqué :", error);
                }
            }

            if (typeof state.app.setCanvasResolution === "function") {
                try {
                    state.app.setCanvasResolution(state.pc.RESOLUTION_AUTO);
                } catch (error) {
                    console.warn("Canvas resolution non appliquée :", error);
                }
            }

            setLoading(42, "Construction du stade 3D...");

            state.world = new state.pc.Entity("FOBAS World");
            state.app.root.addChild(state.world);

            setupLighting();
            createField();

            setLoading(61, "Création des joueurs et du ballon...");

            resetPlayers();
            createBall();
            createCamera();

            state.app.on("update", (dt) => {
                try {
                    updateGame(dt);
                } catch (error) {
                    console.error("[FOBAS FOOTBALL] Erreur pendant le match :", error);
                    setEngineStatus("Erreur de simulation — consultez la console.", true);
                }
            });

            state.app.start();

            window.addEventListener("resize", resizeCanvas, { passive: true });
            window.addEventListener("orientationchange", () => {
                window.setTimeout(resizeCanvas, 200);
            }, { passive: true });

            resizeCanvas();

            state.engineReady = true;

            setLoading(100, "Le moteur 3D est prêt !");
            setEngineStatus("PlayCanvas 3D prêt — 22 joueurs disponibles.");

            const loadingScreen = $("loadingScreen");

            window.setTimeout(() => {
                if (loadingScreen) loadingScreen.classList.add("hidden");
            }, 350);

            state.booting = false;

            console.info("[FOBAS FOOTBALL] Initialisation terminée.");

            toast("FOBAS FOOTBALL ULTIMATE 3D est prêt.", "success");

        } catch (error) {
            state.booting = false;
            showLoadingError(error);
        }
    }

    function resizeCanvas() {
        const canvas = $("footballCanvas");
        const viewport = $("pitchViewport");

        if (!canvas || !viewport) return;

        const rect = viewport.getBoundingClientRect();

        const width = Math.max(320, Math.floor(rect.width));
        const height = Math.max(280, Math.floor(rect.height));

        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.width = width;
        canvas.height = height;

        if (state.app) {
            try {
                if (typeof state.app.resizeCanvas === "function") {
                    state.app.resizeCanvas(width, height);
                }
            } catch (error) {
                console.warn("[FOBAS FOOTBALL] Redimensionnement :", error);
            }
        }
    }

    /* ============================================================
       9. MATCH, SCORE ET CHRONOMÈTRE
    ============================================================ */

    function updateScoreboard() {
        const homeName = $("homeTeamName");
        const awayName = $("awayTeamName");
        const homeScore = $("homeScore");
        const awayScore = $("awayScore");

        if (homeName) homeName.textContent = getTeam(state.selectedHome).name.toUpperCase();
        if (awayName) awayName.textContent = getTeam(state.selectedAway).name.toUpperCase();

        if (homeScore) homeScore.textContent = String(state.scoreHome);
        if (awayScore) awayScore.textContent = String(state.scoreAway);

        const competition = CONFIG.competitionLevels?.find(
            (item) => item.id === state.selectedCompetition
        );

        if ($("competitionLabel")) {
            $("competitionLabel").textContent =
                competition?.name?.toUpperCase() || "MATCH LOCAL";
        }

        if ($("stadiumLabel")) {
            $("stadiumLabel").textContent =
                state.selectedStadium === "neutral"
                    ? "STADE NEUTRE"
                    : `STADE ${getTeam(state.selectedHome).name.toUpperCase()}`;
        }
    }

    function updateClock() {
        const ratio = state.matchDuration > 0
            ? clamp(state.elapsed / state.matchDuration, 0, 1)
            : 0;

        const seconds = Math.floor(ratio * 90 * 60);

        const minutes = Math.floor(seconds / 60);
        const remainder = seconds % 60;

        if ($("matchClock")) {
            $("matchClock").textContent =
                `${String(minutes).padStart(2, "0")}:` +
                `${String(remainder).padStart(2, "0")}`;
        }

        if ($("matchPeriod")) {
            $("matchPeriod").textContent =
                ratio < 0.5 ? "1re MI-TEMPS" : "2e MI-TEMPS";
        }
    }

    function announce(title, message, duration = 2200) {
        const box = $("matchAnnouncement");
        const titleNode = $("announcementTitle");
        const messageNode = $("announcementMessage");

        if (!box || !titleNode || !messageNode) return;

        titleNode.textContent = title;
        messageNode.textContent = message;

        box.classList.remove("hidden");

        state.lastAnnouncement = Date.now();

        window.setTimeout(() => {
            if (Date.now() - state.lastAnnouncement >= duration) {
                box.classList.add("hidden");
            }
        }, duration);
    }

    function startMatch() {
        if (!state.engineReady || !state.app) {
            toast("Le moteur 3D n'est pas prêt. Réessayez dans quelques secondes.", "error");
            return;
        }

        const home = $("homeTeamSelect")?.value || state.selectedHome;
        const away = $("awayTeamSelect")?.value || state.selectedAway;

        if (home === away) {
            const alternative = state.teams.find((team) => team.id !== home);

            state.selectedAway = alternative?.id || "mole-saint-nicolas";

            if ($("awayTeamSelect")) {
                $("awayTeamSelect").value = state.selectedAway;
            }

            toast(
                "Les deux équipes doivent être différentes. Un adversaire a été sélectionné.",
                "info"
            );
        } else {
            state.selectedAway = away;
        }

        state.selectedHome = home;
        state.selectedCompetition = $("competitionSelect")?.value || "local";
        state.selectedStadium = $("stadiumSelect")?.value || "home";

        const duration = $("matchDurationSelect")?.value || "standard";

        state.matchDuration = duration === "short"
            ? 4
            : duration === "long"
                ? 12
                : 7;

        state.scoreHome = 0;
        state.scoreAway = 0;
        state.elapsed = 0;
        state.matchFinished = false;
        state.matchStarted = true;
        state.paused = false;
        state.kickoffTimer = 1.2;

        state.ballVelocity = { x: 0, z: 0 };
        state.ballOwner = null;

        resetPlayers();
        setBallPosition(0, 0, 0.45);
        updateScoreboard();
        updateClock();

        $("pauseOverlay")?.classList.add("hidden");

        showScreen("matchScreen");

        setEngineStatus(
            `Match actif : ${getTeam(state.selectedHome).name} contre ` +
            `${getTeam(state.selectedAway).name}.`
        );

        announce(
            "COUP D'ENVOI",
            `${getTeam(state.selectedHome).name} contre ${getTeam(state.selectedAway).name}`,
            2500
        );

        updateSaveStatus();

        // Le chronomètre démarre immédiatement après le coup d'envoi.
        saveAll(false).catch(console.error);
    }

    function finishMatch() {
        state.matchFinished = true;
        state.matchStarted = false;
        state.paused = true;

        const homeTeam = getTeam(state.selectedHome);
        const awayTeam = getTeam(state.selectedAway);

        homeTeam.played++;
        awayTeam.played++;

        homeTeam.goalsFor += state.scoreHome;
        homeTeam.goalsAgainst += state.scoreAway;

        awayTeam.goalsFor += state.scoreAway;
        awayTeam.goalsAgainst += state.scoreHome;

        state.profile.matchesPlayed++;

        if (state.scoreHome > state.scoreAway) {
            homeTeam.wins++;
            awayTeam.losses++;
            state.career.wins++;
            state.profile.trophies += 0;
        } else if (state.scoreHome < state.scoreAway) {
            awayTeam.wins++;
            homeTeam.losses++;
            state.career.losses++;
        } else {
            homeTeam.draws++;
            awayTeam.draws++;
            state.career.draws++;
        }

        announce(
            "FIN DU MATCH",
            `${homeTeam.name} ${state.scoreHome} - ${state.scoreAway} ${awayTeam.name}`,
            5000
        );

        showDialog(
            "Fin du match",
            `<p><strong>${safeText(homeTeam.name)}</strong> ${state.scoreHome} – ` +
            `${state.scoreAway} <strong>${safeText(awayTeam.name)}</strong></p>` +
            `<p>Match terminé. Votre progression est prête à être sauvegardée.</p>`,
            [
                {
                    label: "REJOUER",
                    onClick: () => {
                        startMatch();
                    }
                },
                {
                    label: "RETOUR AU MENU",
                    className: "ui-button button-secondary",
                    onClick: () => {
                        state.paused = false;
                        showScreen("mainMenu");
                    }
                }
            ]
        );

        saveAll(false).catch(console.error);
    }

    function registerGoal(teamSide) {
        if (!state.matchStarted || state.matchFinished) return;

        if (teamSide === "home") {
            state.scoreHome++;
            state.profile.goalsScored++;
        } else {
            state.scoreAway++;
        }

        state.ballOwner = null;
        state.ballVelocity = { x: 0, z: 0 };

        updateScoreboard();

        const scorer = state.lastTouchTeam === teamSide
            ? (state.controlledPlayer?.name || "Joueur")
            : "Équipe";

        announce(
            "⚽ BUT !",
            `${teamSide === "home" ? getTeam(state.selectedHome).name : getTeam(state.selectedAway).name} marque !`,
            3000
        );

        setRefereeDecision(`But validé — arbitre ${CONFIG.refereeName || "FOBAS"}`);

        setBallPosition(0, 0, 0.45);

        state.allPlayers.forEach((player) => {
            player.x = player.teamSide === "home"
                ? random(-12, 12)
                : random(-12, 12);

            player.z = player.teamSide === "home"
                ? random(5, 20)
                : random(-20, -5);

            player.entity.setLocalPosition(player.x, 0, player.z);
            player.vx = 0;
            player.vz = 0;
        });

        state.kickoffTimer = 1.5;

        window.setTimeout(() => {
            if (state.matchStarted) {
                state.ballOwner = null;
                state.ballVelocity = { x: 0, z: 0 };
                setBallPosition(0, 0, 0.45);
            }
        }, 700);
    }

    function setRefereeDecision(message) {
        const label = $("refereeDecisionLabel");
        if (label) label.textContent = message;
    }

    /* ============================================================
       10. MOUVEMENT DU JOUEUR HUMAIN
    ============================================================ */

    function updateHumanPlayer(dt) {
        const player = state.controlledPlayer;

        if (!player || !state.matchStarted || state.paused) return;

        const x = state.joystick.x;
        const z = state.joystick.z;

        const inputLength = Math.hypot(x, z);
        const multiplier = state.sprinting ? 1.75 : 1.0;

        const speed = 6.8 * multiplier;

        if (inputLength > 0.05) {
            player.vx = (x / Math.max(1, inputLength)) * speed;
            player.vz = (z / Math.max(1, inputLength)) * speed;

            player.x += player.vx * dt;
            player.z += player.vz * dt;

            player.facing = player.vz >= 0 ? 1 : -1;
        } else {
            player.vx *= Math.pow(0.03, dt);
            player.vz *= Math.pow(0.03, dt);
        }

        player.x = clamp(player.x, -16.0, 16.0);
        player.z = clamp(player.z, -25.0, 25.0);

        player.entity.setLocalPosition(player.x, 0, player.z);

        animatePlayer(player, dt, inputLength > 0.1);

        if (state.defending) {
            tryTackle(player);
        }
    }

    function animatePlayer(player, dt, moving) {
        player.animationTime += dt * (moving ? 10 : 2);

        const swing = moving
            ? Math.sin(player.animationTime) * 0.22
            : 0;

        if (player.leftLeg) {
            player.leftLeg.setLocalEulerAngles(swing * 50, 0, 0);
        }

        if (player.rightLeg) {
            player.rightLeg.setLocalEulerAngles(-swing * 50, 0, 0);
        }

        if (player.leftArm) {
            player.leftArm.setLocalEulerAngles(-swing * 25, 0, 0);
        }

        if (player.rightArm) {
            player.rightArm.setLocalEulerAngles(swing * 25, 0, 0);
        }
    }

    /* ============================================================
       11. IA DES COÉQUIPIERS ET ADVERSAIRES
    ============================================================ */

    function aiDifficultyMultiplier() {
        const values = {
            easy: 0.70,
            normal: 0.90,
            hard: 1.12,
            expert: 1.30
        };

        return values[state.settings.difficulty] || 0.90;
    }

    function moveAIPlayer(player, targetX, targetZ, dt, speed = 4.8) {
        const dx = targetX - player.x;
        const dz = targetZ - player.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 0.08) {
            const movement = Math.min(dist, speed * dt);

            player.x += dx / dist * movement;
            player.z += dz / dist * movement;

            player.facing = dz >= 0 ? 1 : -1;
        }

        player.x = clamp(player.x, -16, 16);
        player.z = clamp(player.z, -25, 25);

        player.entity.setLocalPosition(player.x, 0, player.z);

        animatePlayer(player, dt, dist > 0.3);
    }

    function updateAI(dt) {
        if (!state.matchStarted || state.paused || state.kickoffTimer > 0) return;

        const ball = getBallPosition();
        const difficulty = aiDifficultyMultiplier();

        const owner = state.ballOwner;

        // Les joueurs de l'équipe humaine, sauf le joueur sélectionné,
        // aident automatiquement mais ne remplacent jamais son contrôle.
        state.homePlayers.forEach((player, index) => {
            if (player === state.controlledPlayer) return;

            let tx;
            let tz;

            if (owner && owner.teamSide === "home") {
                tx = player.x * 0.72;
                tz = player.z * 0.70 + 2;
            } else if (owner && owner.teamSide === "away") {
                tx = ball.x + random(-5, 5);
                tz = ball.z + random(-5, 5);
            } else {
                const target = index === 0
                    ? { x: 0, z: 23.5 }
                    : { x: ball.x * 0.55, z: ball.z + 2 + index * 0.15 };

                tx = target.x;
                tz = target.z;
            }

            moveAIPlayer(player, tx, tz, dt, 4.5);
        });

        // L'adversaire presse le ballon, couvre les espaces et attaque.
        state.awayPlayers.forEach((player, index) => {
            let tx = ball.x;
            let tz = ball.z;

            if (owner && owner.teamSide === "away") {
                if (owner === player) {
                    tx = player.x;
                    tz = player.z;
                } else {
                    tx = owner.x + random(-4, 4);
                    tz = owner.z + random(-5, 5);
                }
            } else if (owner && owner.teamSide === "home") {
                tx = owner.x + random(-1.5, 1.5);
                tz = owner.z + random(-1.5, 1.5);
            } else if (index === 0) {
                tx = 0;
                tz = -23.5;
            } else {
                tx = ball.x * 0.8 + random(-3, 3);
                tz = ball.z * 0.85 + random(-3, 3);
            }

            moveAIPlayer(player, tx, tz, dt, 4.2 * difficulty);
        });

        // Le gardien reste près de son but et se déplace latéralement.
        const keeperHome = state.homePlayers[0];
        const keeperAway = state.awayPlayers[0];

        if (keeperHome && state.controlledPlayer !== keeperHome) {
            const x = clamp(ball.x * 0.25, -3, 3);
            moveAIPlayer(keeperHome, x, 23.5, dt, 2.6);
        }

        if (keeperAway) {
            const x = clamp(ball.x * 0.25, -3, 3);
            moveAIPlayer(keeperAway, x, -23.5, dt, 2.6 * difficulty);
        }

        // L'IA peut récupérer le ballon, mais elle ne crée jamais un but fictif.
        if (!owner) {
            let closest = null;
            let minDistance = 1.05;

            for (const player of state.allPlayers) {
                const d = distance2D(player, ball);

                if (d < minDistance) {
                    minDistance = d;
                    closest = player;
                }
            }

            if (closest) {
                acquireBall(closest);
            }
        }

        if (owner && owner.teamSide === "away") {
            // L'adversaire passe ou tire seulement quand sa position le permet.
            if (Math.random() < 0.008 * difficulty) {
                aiKick(owner);
            }
        } else if (owner && owner.teamSide === "home" && owner !== state.controlledPlayer) {
            if (Math.random() < 0.004) {
                aiKick(owner);
            }
        }
    }

    function acquireBall(player) {
        if (!player) return;

        state.ballOwner = player;
        player.hasBall = true;
        state.lastTouchTeam = player.teamSide;

        state.allPlayers.forEach((item) => {
            if (item !== player) item.hasBall = false;
        });

        state.ballVelocity = { x: 0, z: 0 };
    }

    function aiKick(player) {
        if (!player || state.ballOwner !== player) return;

        const targetZ = player.teamSide === "home" ? -25 : 25;
        const direction = targetZ > player.z ? 1 : -1;

        const towardGoal = Math.abs(player.z) > 12;

        if (towardGoal && Math.random() < 0.48) {
            kickBall(
                player,
                random(-2, 2),
                direction,
                random(13, 18)
            );
        } else {
            const teammates = player.teamSide === "home"
                ? state.homePlayers
                : state.awayPlayers;

            const teammate = teammates
                .filter((candidate) => candidate !== player)
                .sort((a, b) =>
                    distance2D(a, player) - distance2D(b, player)
                )[0];

            if (teammate) {
                const dx = teammate.x - player.x;
                const dz = teammate.z - player.z;
                const length = Math.max(0.01, Math.hypot(dx, dz));

                kickBall(player, dx / length, dz / length, 8.5);
            } else {
                kickBall(player, 0, direction, 10);
            }
        }
    }

    /* ============================================================
       12. PHYSIQUE DU BALLON ET DÉTECTION DES BUTS
    ============================================================ */

    function kickBall(player, dx, dz, power) {
        if (!state.ball) return;

        const length = Math.max(0.001, Math.hypot(dx, dz));

        state.ballOwner = null;
        state.lastTouchTeam = player.teamSide;

        state.ballVelocity.x = dx / length * power;
        state.ballVelocity.z = dz / length * power;

        player.hasBall = false;

        const p = state.ball.getPosition();

        state.ball.setPosition(p.x, 0.48, p.z);

        if (state.settings.commentary) {
            setRefereeDecision(
                `${player.name} joue le ballon — ${CONFIG.refereeName || "arbitre IA"}`
            );
        }
    }

    function updateBall(dt) {
        if (!state.ball) return;

        if (state.ballOwner) {
            const owner = state.ballOwner;

            const offsetZ = owner.teamSide === "home" ? -0.65 : 0.65;

            const x = owner.x + owner.facing * 0.05;
            const z = owner.z + offsetZ;

            setBallPosition(x, z, 0.45);

            // Si le ballon est possédé par un joueur humain, son déplacement
            // reste sous le contrôle du joystick.
            return;
        }

        const p = state.ball.getPosition();

        let x = p.x + state.ballVelocity.x * dt;
        let z = p.z + state.ballVelocity.z * dt;

        const drag = Math.pow(0.28, dt);

        state.ballVelocity.x *= drag;
        state.ballVelocity.z *= drag;

        // Rebonds latéraux.
        if (x < -16.5 || x > 16.5) {
            x = clamp(x, -16.5, 16.5);
            state.ballVelocity.x *= -0.55;
        }

        // Détection du but avant le retour de balle.
        if (z <= -26.2) {
            if (Math.abs(x) <= 3.8) {
                registerGoal("home");
                return;
            }

            z = -25.8;
            state.ballVelocity.z *= -0.55;
        }

        if (z >= 26.2) {
            if (Math.abs(x) <= 3.8) {
                registerGoal("away");
                return;
            }

            z = 25.8;
            state.ballVelocity.z *= -0.55;
        }

        setBallPosition(x, z, 0.45);

        if (
            Math.hypot(state.ballVelocity.x, state.ballVelocity.z) < 0.20
        ) {
            state.ballVelocity.x = 0;
            state.ballVelocity.z = 0;

            const ball = getBallPosition();

            let nearest = null;
            let nearestDistance = 0.9;

            for (const player of state.allPlayers) {
                const d = distance2D(player, ball);

                if (d < nearestDistance) {
                    nearestDistance = d;
                    nearest = player;
                }
            }

            if (nearest) acquireBall(nearest);
        }
    }

    function tryTackle(player) {
        const opponents = player.teamSide === "home"
            ? state.awayPlayers
            : state.homePlayers;

        for (const opponent of opponents) {
            if (distance2D(player, opponent) < 1.25) {
                if (state.ballOwner === opponent) {
                    acquireBall(player);

                    announce(
                        "RÉCUPÉRATION",
                        `${player.name} récupère le ballon.`,
                        1300
                    );

                    setRefereeDecision("Récupération régulière.");
                    break;
                }
            }
        }
    }

    /* ============================================================
       13. PASSE / TIR / SPRINT / DÉFENSE
    ============================================================ */

    function passBall() {
        if (!state.matchStarted || state.paused) return;

        const player = state.controlledPlayer;
        if (!player) return;

        if (state.ballOwner !== player) {
            const ball = getBallPosition();

            if (distance2D(player, ball) < 1.7 && !state.ballOwner) {
                acquireBall(player);
            } else {
                toast("Approchez-vous du ballon pour faire une passe.", "info", 1800);
                return;
            }
        }

        const teammates = state.homePlayers
            .filter((candidate) => candidate !== player)
            .sort((a, b) => {
                const da = distance2D(a, player);
                const db = distance2D(b, player);

                const progressA = -a.z;
                const progressB = -b.z;

                return (da - progressA * 0.15) - (db - progressB * 0.15);
            });

        const target = teammates[0];

        if (!target) return;

        const dx = target.x - player.x;
        const dz = target.z - player.z;
        const length = Math.max(0.01, Math.hypot(dx, dz));

        kickBall(player, dx / length, dz / length, 8.5);

        toast(`Passe vers ${target.name}.`, "info", 1000);
    }

    function shootBall() {
        if (!state.matchStarted || state.paused) return;

        const player = state.controlledPlayer;
        if (!player) return;

        const ball = getBallPosition();

        if (state.ballOwner !== player) {
            if (!state.ballOwner && distance2D(player, ball) < 1.8) {
                acquireBall(player);
            } else {
                toast("Le joueur doit avoir le ballon pour tirer.", "info", 1600);
                return;
            }
        }

        const goalZ = -25;
        let dx = clamp(-player.x * 0.08, -0.45, 0.45);
        let dz = goalZ - player.z;

        if (dz >= 0) {
            // Le joueur attaque le but opposé à son camp.
            dx = -player.x * 0.08;
            dz = player.teamSide === "home" ? -1 : 1;
        }

        const length = Math.max(0.01, Math.hypot(dx, dz));

        kickBall(player, dx / length, dz / length, 17.5);

        if (state.settings.vibration && navigator.vibrate) {
            navigator.vibrate(30);
        }

        toast("Tir effectué !", "success", 1000);
    }

    function setSprint(active) {
        state.sprinting = Boolean(active);
    }

    function toggleDefend() {
        state.defending = !state.defending;

        const button = $("defendBtn");
        if (button) {
            button.setAttribute("aria-pressed", String(state.defending));
        }

        toast(
            state.defending ? "Mode défense activé." : "Mode défense désactivé.",
            "info",
            1200
        );
    }

    /* ============================================================
       14. JOYSTICK MOBILE ET ZOOM TACTILE
    ============================================================ */

    function setupJoystick() {
        const joystick = $("movementJoystick");
        const base = $("joystickBase");
        const knob = $("joystickKnob");

        if (!joystick || !base || !knob) return;

        let activePointer = null;

        const reset = () => {
            activePointer = null;

            state.joystick.x = 0;
            state.joystick.z = 0;
            state.joystick.active = false;

            knob.style.transform = "translate(0, 0)";
        };

        const update = (event) => {
            const rect = base.getBoundingClientRect();

            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            const maxRadius = Math.max(10, Math.min(rect.width, rect.height) * 0.32);

            let dx = event.clientX - cx;
            let dy = event.clientY - cy;

            const length = Math.hypot(dx, dy);

            if (length > maxRadius) {
                dx = dx / length * maxRadius;
                dy = dy / length * maxRadius;
            }

            state.joystick.x = dx / maxRadius;
            state.joystick.z = dy / maxRadius;
            state.joystick.active = true;

            knob.style.transform = `translate(${dx}px, ${dy}px)`;
        };

        joystick.addEventListener("pointerdown", (event) => {
            event.preventDefault();

            activePointer = event.pointerId;

            try {
                joystick.setPointerCapture(event.pointerId);
            } catch {
                // Le navigateur peut ne pas autoriser pointer capture.
            }

            update(event);
        });

        joystick.addEventListener("pointermove", (event) => {
            if (event.pointerId !== activePointer) return;

            event.preventDefault();
            update(event);
        });

        ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) => {
            joystick.addEventListener(type, (event) => {
                if (
                    activePointer !== null &&
                    event.pointerId !== undefined &&
                    event.pointerId !== activePointer
                ) return;

                reset();
            });
        });
    }

    function setupPinchZoom() {
        const viewport = $("pitchViewport");
        if (!viewport) return;

        let previousDistance = null;

        viewport.addEventListener("touchstart", (event) => {
            if (event.touches.length === 2) {
                const a = event.touches[0];
                const b = event.touches[1];

                previousDistance = Math.hypot(
                    a.clientX - b.clientX,
                    a.clientY - b.clientY
                );
            }
        }, { passive: true });

        viewport.addEventListener("touchmove", (event) => {
            if (event.touches.length !== 2 || previousDistance === null) return;

            const a = event.touches[0];
            const b = event.touches[1];

            const currentDistance = Math.hypot(
                a.clientX - b.clientX,
                a.clientY - b.clientY
            );

            const delta = currentDistance - previousDistance;

            state.cameraDistance = clamp(
                state.cameraDistance - delta * 0.055,
                28,
                65
            );

            previousDistance = currentDistance;
            updateCamera();
        }, { passive: true });

        viewport.addEventListener("touchend", (event) => {
            if (event.touches.length < 2) previousDistance = null;
        }, { passive: true });
    }

    function zoomCamera(amount) {
        state.cameraDistance = clamp(state.cameraDistance + amount, 28, 65);
        updateCamera(true);
    }

    function resetCamera() {
        state.cameraDistance = 43;
        state.cameraMode = 0;
        updateCamera(true);
        toast("Caméra réinitialisée.", "info", 1000);
    }

    function changeCameraMode() {
        state.cameraMode = (state.cameraMode + 1) % 2;
        updateCamera(true);

        toast(
            state.cameraMode === 0
                ? "Vue tactique : tout le terrain."
                : "Vue de suivi : joueur contrôlé.",
            "info",
            1500
        );
    }

    /* ============================================================
       15. PAUSE, TACTIQUES ET COMMANDES SECONDAIRES
    ============================================================ */

    function pauseMatch() {
        if (!state.matchStarted || state.matchFinished) return;

        state.paused = true;
        $("pauseOverlay")?.classList.remove("hidden");
    }

    function resumeMatch() {
        if (!state.matchStarted) return;

        state.paused = false;
        $("pauseOverlay")?.classList.add("hidden");
    }

    function quitMatch() {
        state.paused = false;
        state.matchStarted = false;

        $("pauseOverlay")?.classList.add("hidden");
        $("tacticsOverlay")?.classList.add("hidden");

        showScreen("mainMenu");

        saveAll(false).catch(console.error);
    }

    function openTactics() {
        const overlay = $("tacticsOverlay");
        if (!overlay) return;

        if ($("formationSelect")) {
            $("formationSelect").value = state.tactics.formation;
        }

        if ($("tacticalStyleSelect")) {
            $("tacticalStyleSelect").value = state.tactics.style;
        }

        if ($("pressureSelect")) {
            $("pressureSelect").value = state.tactics.pressure;
        }

        overlay.classList.remove("hidden");
    }

    function applyTactics() {
        state.tactics.formation = $("formationSelect")?.value || "433";
        state.tactics.style = $("tacticalStyleSelect")?.value || "balanced";
        state.tactics.pressure = $("pressureSelect")?.value || "medium";

        if (state.matchStarted) {
            resetPlayers();
        }

        $("tacticsOverlay")?.classList.add("hidden");

        saveAll(false).catch(console.error);

        toast("Tactiques appliquées.", "success");
    }

    /* ============================================================
       16. PROFIL, PARAMÈTRES ET ÉQUIPEMENT
    ============================================================ */

    function applyProfileToUI() {
        if ($("profileNameInput")) {
            $("profileNameInput").value = state.profile.name || "Joueur FOBAS";
        }

        if ($("profileFavoriteTeam")) {
            const favorite = state.profile.favoriteTeam || "mare-rouge";

            if (
                Array.from($("profileFavoriteTeam").options)
                    .some((option) => option.value === favorite)
            ) {
                $("profileFavoriteTeam").value = favorite;
            }
        }

        if ($("profileMatchesPlayed")) {
            $("profileMatchesPlayed").textContent = String(state.profile.matchesPlayed || 0);
        }

        if ($("profileGoalsScored")) {
            $("profileGoalsScored").textContent = String(state.profile.goalsScored || 0);
        }

        if ($("profileTrophies")) {
            $("profileTrophies").textContent = String(state.profile.trophies || 0);
        }
    }

    function saveProfile() {
        state.profile.name = ($("profileNameInput")?.value || "Joueur FOBAS").trim();
        state.profile.favoriteTeam = $("profileFavoriteTeam")?.value || "mare-rouge";

        if (!state.profile.name) state.profile.name = "Joueur FOBAS";

        applyProfileToUI();

        saveAll(false).catch(console.error);
        toast("Profil sauvegardé.", "success");
    }

    function applySettingsToUI() {
        if ($("graphicsQualitySelect")) {
            $("graphicsQualitySelect").value = state.settings.graphics;
        }

        if ($("soundVolumeInput")) {
            $("soundVolumeInput").value = String(state.settings.volume);
        }

        if ($("cameraSensitivityInput")) {
            $("cameraSensitivityInput").value = String(state.settings.cameraSensitivity);
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

    function saveSettings() {
        state.settings.graphics = $("graphicsQualitySelect")?.value || "medium";
        state.settings.volume = Number($("soundVolumeInput")?.value || 70);
        state.settings.cameraSensitivity = Number(
            $("cameraSensitivityInput")?.value || 50
        );
        state.settings.difficulty = $("matchDifficultySelect")?.value || "normal";
        state.settings.vibration = Boolean($("vibrationToggle")?.checked);
        state.settings.commentary = Boolean($("commentaryToggle")?.checked);

        state.cameraSensitivity = state.settings.cameraSensitivity / 100;

        saveAll(false).catch(console.error);

        toast("Paramètres enregistrés.", "success");
    }

    function renderEquipment() {
        const list = $("equipmentItemsList");
        if (!list) return;

        const tab = state.selectedEquipmentTab;
        const items = EQUIPMENT[tab] || [];

        list.replaceChildren();

        items.forEach((item) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "equipment-item";
            button.dataset.equipmentId = item.id;

            if (state.selectedEquipment[tab] === item.id) {
                button.classList.add("active");
            }

            button.innerHTML = `
                <span class="equipment-color"
                    style="display:block;width:42px;height:42px;border-radius:10px;
                    background:${safeText(item.color)};margin-bottom:8px"></span>
                <strong>${safeText(item.name)}</strong>
                <small>${state.selectedEquipment[tab] === item.id ? "Sélectionné" : "Choisir"}</small>
            `;

            button.addEventListener("click", () => {
                state.selectedEquipment[tab] = item.id;
                renderEquipment();
            });

            list.appendChild(button);
        });

        ["kits", "balls", "boots"].forEach((key) => {
            const id = {
                kits: "kitsTabBtn",
                balls: "ballsTabBtn",
                boots: "bootsTabBtn"
            }[key];

            const button = $(id);

            if (button) {
                button.classList.toggle("active", tab === key);
                button.setAttribute("aria-selected", String(tab === key));
            }
        });
    }

    function applyEquipment() {
        if (state.ball && state.selectedEquipmentTab === "balls") {
            const item = EQUIPMENT.balls.find(
                (candidate) => candidate.id === state.selectedEquipment.balls
            );

            if (item) {
                const rgb = item.color.match(/[a-f0-9]{2}/gi)
                    ?.map((part) => parseInt(part, 16) / 255);

                if (rgb && state.ball.render?.material) {
                    state.ball.render.material.diffuse = new state.pc.Color(
                        rgb[0], rgb[1], rgb[2]
                    );
                    state.ball.render.material.update();
                }
            }
        }

        saveAll(false).catch(console.error);
        toast("Équipement appliqué et sauvegardé.", "success");
    }

    /* ============================================================
       17. CHAMPIONNATS ET TOURNOIS
    ============================================================ */

    function renderChampionships() {
        const list = $("competitionLevelsList");
        if (!list) return;

        list.replaceChildren();

        (CONFIG.competitionLevels || []).forEach((competition, index) => {
            const card = document.createElement("article");
            card.className = "competition-card";

            card.innerHTML = `
                <span class="competition-number">${String(index + 1).padStart(2, "0")}</span>
                <div>
                    <strong>${safeText(competition.name)}</strong>
                    <p>${safeText(competition.description || "")}</p>
                </div>
                <button type="button" class="ui-button button-secondary"
                    data-competition-select="${safeText(competition.id)}">
                    CHOISIR
                </button>
            `;

            list.appendChild(card);
        });
    }

    function renderTournaments() {
        const list = $("tournamentList");
        if (!list) return;

        list.replaceChildren();

        const defaults = [
            {
                id: "caribbean-cup",
                name: "Coupe des Caraïbes FOBAS",
                description: "Tournoi régional",
                level: "caribbean"
            },
            {
                id: "elite-championship",
                name: "FOBAS Elite Championship",
                description: "Championnat des meilleures équipes",
                level: "champions"
            },
            {
                id: "world-tournament",
                name: "World Champions Tournament",
                description: "Compétition internationale",
                level: "international"
            }
        ];

        const tournaments = [...defaults, ...state.tournaments];

        tournaments.forEach((tournament) => {
            const card = document.createElement("article");
            card.className = "tournament-card";

            card.innerHTML = `
                <strong>${safeText(tournament.name)}</strong>
                <p>${safeText(tournament.description || "Tournoi FOBAS")}</p>
                <button type="button" class="ui-button button-secondary"
                    data-tournament-start="${safeText(tournament.level || "local")}">
                    PARTICIPER
                </button>
            `;

            list.appendChild(card);
        });
    }

    function createTournament() {
        showDialog(
            "Créer un tournoi",
            `
                <label for="newTournamentName">Nom du tournoi</label>
                <input id="newTournamentName" type="text" maxlength="60"
                    placeholder="Ex. Coupe FOBAS du Nord-Ouest">
                <label for="newTournamentLevel">Niveau</label>
                <select id="newTournamentLevel">
                    ${(CONFIG.competitionLevels || []).map((item) =>
                        `<option value="${safeText(item.id)}">${safeText(item.name)}</option>`
                    ).join("")}
                </select>
            `,
            [
                {
                    label: "CRÉER",
                    onClick: () => {
                        const name = $("newTournamentName")?.value.trim();

                        if (!name) {
                            toast("Saisissez le nom du tournoi.", "error");
                            return;
                        }

                        state.tournaments.push({
                            id: `tournament-${Date.now()}`,
                            name,
                            description: "Tournoi créé par le joueur",
                            level: $("newTournamentLevel")?.value || "local"
                        });

                        renderTournaments();
                        saveAll(false).catch(console.error);

                        toast("Tournoi créé.", "success");
                    }
                },
                {
                    label: "ANNULER",
                    className: "ui-button button-secondary"
                }
            ]
        );
    }

    /* ============================================================
       18. ÉVÉNEMENTS ET CONNEXION DE TOUS LES BOUTONS
    ============================================================ */

    function bindButton(id, handler) {
        const element = $(id);

        if (!element) {
            console.warn(`[FOBAS FOOTBALL] Bouton absent du HTML : #${id}`);
            return;
        }

        element.addEventListener("click", (event) => {
            event.preventDefault();

            try {
                handler(event);
            } catch (error) {
                console.error(`[FOBAS FOOTBALL] Action ${id} :`, error);
                toast("Cette action a rencontré une erreur. Consultez la console.", "error");
            }
        });
    }

    function bindEvents() {
        if (state.listenersAttached) return;

        state.listenersAttached = true;

        bindButton("playMatchBtn", () => showScreen("matchSetupScreen"));
        bindButton("continueCareerBtn", () => {
            state.selectedCompetition = "local";
            if ($("competitionSelect")) $("competitionSelect").value = "local";
            showScreen("matchSetupScreen");
            toast(`Carrière — mission ${state.career.currentMission || 1}`, "info");
        });

        bindButton("championshipsBtn", () => {
            renderChampionships();
            showScreen("championshipScreen");
        });

        bindButton("tournamentsBtn", () => {
            renderTournaments();
            showScreen("tournamentScreen");
        });

        bindButton("teamsBtn", () => {
            renderTeams();
            showScreen("teamsScreen");
        });

        bindButton("equipmentBtn", () => {
            renderEquipment();
            showScreen("equipmentScreen");
        });

        bindButton("profileBtn", () => {
            applyProfileToUI();
            showScreen("profileScreen");
        });

        bindButton("howToPlayBtn", () => showScreen("howToPlayScreen"));
        bindButton("openSettingsBtn", () => showScreen("settingsScreen"));

        bindButton("confirmMatchBtn", startMatch);

        bindButton("passBtn", passBall);
        bindButton("shootBtn", shootBall);
        bindButton("switchPlayerBtn", switchPlayer);
        bindButton("defendBtn", toggleDefend);
        bindButton("changeCameraBtn", changeCameraMode);

        bindButton("cameraZoomOutBtn", () => zoomCamera(3));
        bindButton("cameraZoomInBtn", () => zoomCamera(-3));
        bindButton("cameraResetBtn", resetCamera);

        bindButton("saveMatchBtn", saveMatch);
        bindButton("exitMatchBtn", () => {
            showDialog(
                "Quitter le match ?",
                "<p>La progression du match sera sauvegardée avant le retour au menu.</p>",
                [
                    {
                        label: "SAUVEGARDER ET QUITTER",
                        onClick: async () => {
                            await saveMatch();
                            quitMatch();
                        }
                    },
                    {
                        label: "CONTINUER",
                        className: "ui-button button-secondary"
                    }
                ]
            );
        });

        bindButton("pauseGameBtn", () => {
            if (state.paused) {
                resumeMatch();
            } else {
                pauseMatch();
            }
        });

        bindButton("resumeGameBtn", resumeMatch);
        bindButton("savePausedMatchBtn", saveMatch);

        bindButton("quitPausedMatchBtn", () => {
            showDialog(
                "Quitter le match ?",
                "<p>Voulez-vous sauvegarder avant de quitter ?</p>",
                [
                    {
                        label: "SAUVEGARDER ET QUITTER",
                        onClick: async () => {
                            await saveMatch();
                            quitMatch();
                        }
                    },
                    {
                        label: "QUITTER SANS SAUVEGARDER",
                        className: "ui-button button-danger",
                        onClick: quitMatch
                    }
                ]
            );
        });

        bindButton("showTacticsBtn", openTactics);
        bindButton("closeTacticsBtn", () => $("tacticsOverlay")?.classList.add("hidden"));
        bindButton("applyTacticsBtn", applyTactics);

        bindButton("saveProfileBtn", saveProfile);
        bindButton("saveSettingsBtn", saveSettings);
        bindButton("applyEquipmentBtn", applyEquipment);

        bindButton("refreshTeamsBtn", () => {
            renderTeams();
            toast("Liste des équipes actualisée.", "success");
        });

        bindButton("createTournamentBtn", createTournament);

        bindButton("startChampionshipBtn", () => {
            const selected = state.selectedCompetition || "local";

            if ($("competitionSelect")) {
                $("competitionSelect").value = selected;
            }

            showScreen("matchSetupScreen");
        });

        bindButton("closeDialogBtn", closeDialog);

        bindButton("retryLoadingBtn", () => {
            $("retryLoadingBtn")?.classList.add("hidden");
            state.engineError = null;
            initializeEngine();
        });

        bindButton("soundToggleBtn", () => {
            state.soundEnabled = !state.soundEnabled;

            const button = $("soundToggleBtn");

            if (button) {
                button.textContent = state.soundEnabled ? "🔊" : "🔇";
                button.setAttribute("aria-pressed", String(state.soundEnabled));
            }

            toast(
                state.soundEnabled ? "Son activé." : "Son désactivé.",
                "info",
                1000
            );
        });

        bindButton("kitsTabBtn", () => {
            state.selectedEquipmentTab = "kits";
            renderEquipment();
        });

        bindButton("ballsTabBtn", () => {
            state.selectedEquipmentTab = "balls";
            renderEquipment();
        });

        bindButton("bootsTabBtn", () => {
            state.selectedEquipmentTab = "boots";
            renderEquipment();
        });

        // Boutons de retour : navigation vers un écran existant.
        document.querySelectorAll("[data-back]").forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();

                const target = button.dataset.back;

                showScreen(SCREEN_IDS.includes(target) ? target : "mainMenu");
            });
        });

        // Boutons d'action génériques, sans doubler les handlers principaux.
        document.querySelectorAll("[data-action]").forEach((button) => {
            const action = button.dataset.action;

            const alreadyBound = [
                "play-match",
                "continue-career",
                "championships",
                "tournaments",
                "teams",
                "equipment",
                "profile",
                "how-to-play",
                "pass",
                "shoot",
                "sprint",
                "defend",
                "switch-player"
            ].includes(action);

            if (alreadyBound) return;

            if (action === "sprint") {
                button.addEventListener("pointerdown", () => setSprint(true));
                ["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
                    button.addEventListener(type, () => setSprint(false));
                });
            }
        });

        // Correction de la sélection d'équipes : pas de doublon possible.
        bindButton("homeTeamSelect", () => {});
        $("homeTeamSelect")?.addEventListener("change", () => {
            state.selectedHome = $("homeTeamSelect").value;

            if (state.selectedHome === $("awayTeamSelect")?.value) {
                const other = state.teams.find((team) => team.id !== state.selectedHome);

                if (other && $("awayTeamSelect")) {
                    $("awayTeamSelect").value = other.id;
                    state.selectedAway = other.id;
                }
            }
        });

        $("awayTeamSelect")?.addEventListener("change", () => {
            state.selectedAway = $("awayTeamSelect").value;

            if (state.selectedAway === $("homeTeamSelect")?.value) {
                const other = state.teams.find((team) => team.id !== state.selectedAway);

                if (other && $("homeTeamSelect")) {
                    $("homeTeamSelect").value = other.id;
                    state.selectedHome = other.id;
                }
            }
        });

        $("teamSearchInput")?.addEventListener("input", renderTeams);
        $("teamRegionSelect")?.addEventListener("change", renderTeams);

        $("teamsList")?.addEventListener("click", (event) => {
            const button = event.target.closest("[data-team-select]");
            if (!button) return;

            const id = button.dataset.teamSelect;

            showDialog(
                "Choisir cette équipe",
                `<p>Comment voulez-vous utiliser <strong>${safeText(getTeam(id).name)}</strong> ?</p>`,
                [
                    {
                        label: "ÉQUIPE QUE JE CONTRÔLE",
                        onClick: () => {
                            state.selectedHome = id;
                            populateTeamSelectors();

                            if (state.selectedAway === id) {
                                state.selectedAway =
                                    state.teams.find((team) => team.id !== id)?.id || id;
                            }

                            populateTeamSelectors();

                            toast("Équipe contrôlée sélectionnée.", "success");
                            showScreen("matchSetupScreen");
                        }
                    },
                    {
                        label: "ÉQUIPE ADVERSE",
                        className: "ui-button button-secondary",
                        onClick: () => {
                            state.selectedAway = id;

                            if (state.selectedHome === id) {
                                state.selectedHome =
                                    state.teams.find((team) => team.id !== id)?.id || id;
                            }

                            populateTeamSelectors();
                            showScreen("matchSetupScreen");
                        }
                    }
                ]
            );
        });

        $("competitionLevelsList")?.addEventListener("click", (event) => {
            const button = event.target.closest("[data-competition-select]");
            if (!button) return;

            state.selectedCompetition = button.dataset.competitionSelect;

            if ($("competitionSelect")) {
                $("competitionSelect").value = state.selectedCompetition;
            }

            toast("Compétition sélectionnée.", "success");
        });

        $("tournamentList")?.addEventListener("click", (event) => {
            const button = event.target.closest("[data-tournament-start]");
            if (!button) return;

            state.selectedCompetition = button.dataset.tournamentStart;

            if ($("competitionSelect")) {
                $("competitionSelect").value = state.selectedCompetition;
            }

            showScreen("matchSetupScreen");
        });

        // Maintenir le bouton Sprint accélère le joueur.
        const sprintButton = $("sprintBtn");

        if (sprintButton) {
            sprintButton.addEventListener("pointerdown", (event) => {
                event.preventDefault();
                setSprint(true);
            });

            ["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
                sprintButton.addEventListener(type, () => setSprint(false));
            });
        }

        // Les boutons de caméra restent utilisables pendant le match.
        $("matchScreen")?.addEventListener("contextmenu", (event) => {
            if (event.target === $("footballCanvas")) event.preventDefault();
        });

        setupJoystick();
        setupPinchZoom();

        // Sauvegarde automatique toutes les dix minutes.
        state.autoSaveTimer = window.setInterval(() => {
            saveAll(false).catch((error) => {
                console.warn("[FOBAS FOOTBALL] Autosave :", error);
            });
        }, 10 * 60 * 1000);

        window.addEventListener("beforeunload", () => {
            try {
                localStorage.setItem(
                    "FOBAS_FOOTBALL_RECOVERY",
                    JSON.stringify({
                        profile: state.profile,
                        settings: state.settings,
                        match: state.matchStarted ? getMatchSnapshot() : null
                    })
                );
            } catch {
                // La sortie ne doit jamais être bloquée par un stockage indisponible.
            }
        });
    }

    /* ============================================================
       19. BOUCLE PRINCIPALE DU JEU
    ============================================================ */

    function updateGame(dt) {
        if (!state.engineReady || !state.app) return;

        dt = clamp(dt, 0, 0.05);

        updateCamera();

        if (!state.matchStarted || state.paused || state.matchFinished) {
            return;
        }

        if (state.kickoffTimer > 0) {
            state.kickoffTimer -= dt;

            if (state.kickoffTimer <= 0) {
                announce("COUP D'ENVOI", "Le match est lancé !", 1500);
            }

            return;
        }

        state.elapsed += dt;

        updateHumanPlayer(dt);

        if (Date.now() - state.lastAIStep > 65) {
            updateAI(dt);
            state.lastAIStep = Date.now();
        }

        updateBall(dt);
        updateClock();

        if (state.elapsed >= state.matchDuration) {
            finishMatch();
        }
    }

    /* ============================================================
       20. DÉMARRAGE
    ============================================================ */

    async function boot() {
        setLoading(2, "Initialisation de FOBAS FOOTBALL...");

        try {
            buildTeams();

            populateTeamSelectors();

            if ($("homeTeamSelect")) {
                $("homeTeamSelect").value = state.selectedHome;
            }

            if ($("awayTeamSelect")) {
                $("awayTeamSelect").value = state.selectedAway;
            }

            renderChampionships();
            renderTournaments();
            renderTeams();
            renderEquipment();

            bindEvents();

            setLoading(5, "Ouverture de la sauvegarde locale...");

            try {
                state.db = await openDatabase();

                console.info("[FOBAS FOOTBALL] IndexedDB disponible.");

            } catch (error) {
                state.db = null;

                console.warn(
                    "[FOBAS FOOTBALL] IndexedDB indisponible, utilisation de localStorage :",
                    error
                );
            }

            await loadSavedState();

            // Recharge les listes après la restauration des préférences.
            populateTeamSelectors();
            renderEquipment();
            applyProfileToUI();
            applySettingsToUI();

            setLoading(7, "Préparation du terrain et du moteur 3D...");

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












