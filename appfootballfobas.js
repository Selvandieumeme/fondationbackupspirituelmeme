* ============================================================
   FOBAS FOOTBALL ULTIMATE 3D
   JavaScript principal — Version 1.0.0
   Moteur : PlayCanvas 2.23.2
   Android First — IndexedDB
   Fichier racine : appfootballfobas.js
============================================================ */

(() => {
    "use strict";

    /* ========================================================
       1. CONFIGURATION ET OUTILS
    ======================================================== */

    const CONFIG = window.FOBAS_FOOTBALL_CONFIG || {};

    const DB_NAME = CONFIG.databaseName || "FOBAS_FOOTBALL_ULTIMATE_DB";
    const DB_VERSION = CONFIG.databaseVersion || 1;

    const FIELD = {
        length: 44,
        width: 28,
        lineY: 0.045,
        playerHeight: 1.85,
        playerRadius: 0.34,
        ballRadius: 0.32
    };

    const CAMERA = {
        distance: 28,
        minDistance: 13,
        maxDistance: 47,
        height: 18,
        angle: 0.66,
        minAngle: 0.38,
        maxAngle: 1.12
    };

    const $ = id => document.getElementById(id);

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const random = (min, max) => min + Math.random() * (max - min);

    const pick = list => list[Math.floor(Math.random() * list.length)];

    const slug = value => String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const escapeHTML = value => String(value ?? "").replace(
        /[&<>"']/g,
        char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]
    );

    const teamName = value => {
        const option = document.querySelector(
            `#homeTeamSelect option[value="${CSS.escape(String(value))}"], ` +
            `#awayTeamSelect option[value="${CSS.escape(String(value))}"]`
        );

        if (option) {
            return option.textContent.replace(/^Équipe\s*/i, "").trim();
        }

        return String(value || "FOBAS");
    };

    const safeText = (id, value) => {
        const element = $(id);
        if (element) element.textContent = String(value ?? "");
    };

    const show = element => element && element.classList.remove("hidden");

    const hide = element => element && element.classList.add("hidden");

    const setLoading = (percent, message) => {
        const value = clamp(Number(percent) || 0, 0, 100);

        if ($("loadingMessage")) {
            $("loadingMessage").textContent = message || "Chargement...";
        }

        if ($("loadingPercent")) {
            $("loadingPercent").textContent = `${Math.round(value)} %`;
        }

        if ($("loadingProgressBar")) {
            $("loadingProgressBar").style.width = `${value}%`;
        }

        if ($("loadingProgressTrack")) {
            $("loadingProgressTrack").setAttribute(
                "aria-valuenow",
                String(Math.round(value))
            );
        }
    };

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

    ballVelocity: { x: 0, y: 0, z: 0 },
    joystick: { x: 0, y: 0, active: false },
    sprinting: false,
    defending: false,

    cameraDistance: CAMERA.distance,
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

    // Gestion du minuteur de sauvegarde automatique
    autoSaveTimer: null,

    lastAITick: 0,
    lastClockUpdate: 0,
    lastRefereeTick: 0,

    touchDistance: null,

    loadingFailed: false,
    booting: false,
    listenersAttached: false
};


    /* ========================================================
       3. NOTIFICATIONS NON BLOQUANTES
    ======================================================== */

    let toastTimer = null;

    function toast(message, type = "info", duration = 2800) {
        const container = $("toastContainer");

        if (!container) {
            console.log(`[FOBAS ${type}] ${message}`);
            return;
        }

        const item = document.createElement("div");
        item.className = `fobas-toast fobas-toast-${type}`;
        item.textContent = message;

        Object.assign(item.style, {
            position: "relative",
            margin: "8px",
            padding: "12px 15px",
            borderRadius: "12px",
            color: "#fff",
            background: type === "error"
                ? "rgba(150,25,35,.96)"
                : type === "success"
                    ? "rgba(14,115,72,.96)"
                    : "rgba(8,28,51,.96)",
            border: "1px solid rgba(255,255,255,.15)",
            boxShadow: "0 8px 28px rgba(0,0,0,.25)",
            fontSize: "13px",
            lineHeight: "1.45",
            pointerEvents: "auto"
        });

        container.appendChild(item);

        window.setTimeout(() => {
            item.style.opacity = "0";
            item.style.transition = "opacity .25s";
            window.setTimeout(() => item.remove(), 280);
        }, duration);

        while (container.children.length > 5) {
            container.firstElementChild.remove();
        }
    }

    function announce(title, message, duration = 3200) {
        const panel = $("matchAnnouncement");

        safeText("announcementTitle", title);
        safeText("announcementMessage", message);

        if (panel) {
            show(panel);

            window.clearTimeout(announce._timer);

            announce._timer = window.setTimeout(() => {
                hide(panel);
            }, duration);
        }

        if ($("refereeDecisionLabel")) {
            $("refereeDecisionLabel").textContent = message;
        }
    }

    /* ========================================================
       4. INDEXEDDB — SAUVEGARDE LOCALE
    ======================================================== */

    function openDatabase() {
        return new Promise(resolve => {
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

            request.onupgradeneeded = event => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains("records")) {
                    db.createObjectStore("records", { keyPath: "key" });
                }
            };

            request.onsuccess = () => resolve(request.result);

            request.onerror = () => {
                console.warn("Impossible d'ouvrir IndexedDB.");
                resolve(null);
            };

            request.onblocked = () => {
                console.warn("Ouverture IndexedDB bloquée.");
                resolve(null);
            };
        });
    }

    function saveRecord(key, value) {
        const record = {
            key,
            value,
            updatedAt: Date.now()
        };

        try {
            localStorage.setItem(`FOBAS_FOOTBALL_${key}`, JSON.stringify(record));
        } catch (error) {
            console.warn("LocalStorage indisponible :", error);
        }

        if (!state.db) return Promise.resolve(false);

        return new Promise(resolve => {
            try {
                const transaction = state.db.transaction("records", "readwrite");

                transaction.objectStore("records").put(record);

                transaction.oncomplete = () => resolve(true);
                transaction.onerror = () => resolve(false);
                transaction.onabort = () => resolve(false);
            } catch (error) {
                console.warn("Sauvegarde IndexedDB impossible :", error);
                resolve(false);
            }
        });
    }

    function loadRecord(key) {
        if (!state.db) {
            try {
                const stored = localStorage.getItem(`FOBAS_FOOTBALL_${key}`);
                return Promise.resolve(stored ? JSON.parse(stored).value : null);
            } catch {
                return Promise.resolve(null);
            }
        }

        return new Promise(resolve => {
            try {
                const request = state.db
                    .transaction("records", "readonly")
                    .objectStore("records")
                    .get(key);

                request.onsuccess = () => {
                    if (request.result) {
                        resolve(request.result.value);
                        return;
                    }

                    try {
                        const stored = localStorage.getItem(
                            `FOBAS_FOOTBALL_${key}`
                        );

                        resolve(stored ? JSON.parse(stored).value : null);
                    } catch {
                        resolve(null);
                    }
                };

                request.onerror = () => resolve(null);
            } catch {
                resolve(null);
            }
        });
    }

    async function saveAll(showMessage = true) {
        const data = {
            profile: state.profile,
            settings: state.settings,
            career: state.career,
            tournaments: state.tournaments,
            selectedEquipment: state.selectedEquipment,
            selectedCompetition: state.selectedCompetition,
            tactics: state.tactics,
            savedAt: Date.now()
        };

        const results = await Promise.all([
            saveRecord("appState", data),
            saveRecord("profile", state.profile),
            saveRecord("settings", state.settings),
            saveRecord("career", state.career),
            saveRecord("tournaments", state.tournaments)
        ]);

        state.lastSave = Date.now();

        safeText(
            "saveStatusLabel",
            `Sauvegardé à ${new Date().toLocaleTimeString()}`
        );

        if (showMessage) {
            toast(
                results.some(Boolean)
                    ? "Sauvegarde locale effectuée."
                    : "Sauvegarde locale de secours effectuée.",
                "success"
            );
        }

        return true;
    }

    async function loadAll() {
        const saved = await loadRecord("appState");

        if (!saved || typeof saved !== "object") return;

        if (saved.profile) {
            state.profile = { ...state.profile, ...saved.profile };
        }

        if (saved.settings) {
            state.settings = { ...state.settings, ...saved.settings };
        }

        if (saved.career) {
            state.career = { ...state.career, ...saved.career };
        }

        if (Array.isArray(saved.tournaments)) {
            state.tournaments = saved.tournaments;
        }

        if (saved.selectedEquipment) {
            state.selectedEquipment = {
                ...state.selectedEquipment,
                ...saved.selectedEquipment
            };
        }

        if (saved.selectedCompetition) {
            state.selectedCompetition = saved.selectedCompetition;
        }

        if (saved.tactics) {
            state.tactics = { ...state.tactics, ...saved.tactics };
        }

        syncProfileUI();
        syncSettingsUI();
        syncTacticsUI();
    }

    /* ========================================================
       5. ÉQUIPES — GÉNÉRATION DYNAMIQUE
    ======================================================== */

    const WORLD_TEAMS = [
        ["Haïti", "haiti"],
        ["République dominicaine", "caribbean"],
        ["Jamaïque", "caribbean"],
        ["Cuba", "caribbean"],
        ["Porto Rico", "caribbean"],
        ["Trinité-et-Tobago", "caribbean"],
        ["Barbade", "caribbean"],
        ["Guadeloupe", "caribbean"],
        ["Martinique", "caribbean"],
        ["États-Unis", "americas"],
        ["Canada", "americas"],
        ["Mexique", "americas"],
        ["Brésil", "americas"],
        ["Argentine", "americas"],
        ["Colombie", "americas"],
        ["Chili", "americas"],
        ["France", "europe"],
        ["Espagne", "europe"],
        ["Angleterre", "europe"],
        ["Italie", "europe"],
        ["Allemagne", "europe"],
        ["Portugal", "europe"],
        ["Pays-Bas", "europe"],
        ["Belgique", "europe"],
        ["Maroc", "africa"],
        ["Sénégal", "africa"],
        ["Côte d'Ivoire", "africa"],
        ["Cameroun", "africa"],
        ["Nigeria", "africa"],
        ["Afrique du Sud", "africa"],
        ["Japon", "international"],
        ["Corée du Sud", "international"],
        ["Australie", "international"],
        ["Arabie saoudite", "international"],
        ["Qatar", "international"]
    ];

    function buildTeams() {
        const teams = [];
        const localRegions = Array.isArray(CONFIG.localRegions)
            ? CONFIG.localRegions
            : [];

        localRegions.forEach((region, index) => {
            teams.push({
                id: slug(region),
                name: region,
                region: "northwest",
                country: "Haïti",
                kind: "local",
                rating: 58 + (index % 8) * 3
            });

            for (let section = 1; section <= 3; section++) {
                teams.push({
                    id: `${slug(region)}-section-${section}`,
                    name: `${region} — Section ${section}`,
                    region: "northwest",
                    country: "Haïti",
                    kind: "section",
                    rating: 48 + ((index + section) % 10) * 3
                });
            }
        });

        [
            "Cap-Haïtien",
            "Gonaïves",
            "Saint-Marc",
            "Port-au-Prince",
            "Jacmel",
            "Les Cayes",
            "Jérémie",
            "Hinche",
            "Fort-Liberté",
            "Miragoâne",
            "Petit-Goâve",
            "Léogâne",
            "Ouanaminthe",
            "Cayes-Jacmel",
            "Anse-à-Galets",
            "Belladère",
            "Limbé",
            "Aquin",
            "Trou-du-Nord",
            "Verrettes"
        ].forEach((name, index) => {
            teams.push({
                id: slug(name),
                name,
                region: "haiti",
                country: "Haïti",
                kind: "national",
                rating: 60 + (index % 9) * 3
            });
        });

        WORLD_TEAMS.forEach(([name, region], index) => {
            teams.push({
                id: slug(name),
                name,
                region,
                country: name,
                kind: "international",
                rating: 70 + (index % 10) * 3
            });
        });

        const bases = [...teams];

        let serial = 1;

        while (teams.length < Math.max(100, Number(CONFIG.initialTeamCount) || 100)) {
            const base = bases[(serial - 1) % bases.length];

            teams.push({
                id: `${base.id}-academy-${serial}`,
                name: `${base.name} ${serial % 2 ? "Academy" : "United"}`,
                region: base.region,
                country: base.country,
                kind: "academy",
                rating: clamp(base.rating + (serial % 11) - 5, 40, 95)
            });

            serial++;
        }

        state.teams = teams;

        populateTeamSelects();
        renderTeams();
        renderChampionships();
        renderTournaments();
    }

    function populateTeamSelects() {
        const selects = [$("homeTeamSelect"), $("awayTeamSelect")];

        selects.forEach(select => {
            if (!select) return;

            const oldValue = select.value;
            const fragment = document.createDocumentFragment();

            state.teams.forEach(team => {
                const option = document.createElement("option");

                option.value = team.id;
                option.textContent = team.name;

                fragment.appendChild(option);
            });

            select.replaceChildren(fragment);

            if ([...select.options].some(option => option.value === oldValue)) {
                select.value = oldValue;
            }
        });

        if ($("profileFavoriteTeam")) {
            const select = $("profileFavoriteTeam");
            const oldValue = state.profile.favoriteTeam;

            const fragment = document.createDocumentFragment();

            state.teams.slice(0, 180).forEach(team => {
                const option = document.createElement("option");
                option.value = team.id;
                option.textContent = team.name;
                fragment.appendChild(option);
            });

            select.replaceChildren(fragment);

            if ([...select.options].some(option => option.value === oldValue)) {
                select.value = oldValue;
            }
        }
    }

    function renderTeams() {
        const container = $("teamsList");
        if (!container) return;

        const query = state.teamsFilter.query.toLowerCase();
        const region = state.teamsFilter.region;

        const filtered = state.teams.filter(team => {
            const matchesQuery =
                !query ||
                team.name.toLowerCase().includes(query) ||
                team.country.toLowerCase().includes(query);

            const matchesRegion = region === "all" || team.region === region;

            return matchesQuery && matchesRegion;
        });

        const fragment = document.createDocumentFragment();

        filtered.slice(0, 220).forEach(team => {
            const card = document.createElement("article");

            card.className = "team-card";
            card.innerHTML = `
                <strong>${escapeHTML(team.name)}</strong>
                <span>${escapeHTML(team.country)} · ${escapeHTML(team.region)}</span>
                <small>Niveau ${team.rating}/100</small>
                <button type="button" class="ui-button button-secondary"
                    data-select-team="${escapeHTML(team.id)}">
                    Choisir cette équipe
                </button>
            `;

            fragment.appendChild(card);
        });

        container.replaceChildren(fragment);

        safeText(
            "teamCountLabel",
            `${filtered.length} équipe(s) disponible(s)`
        );
    }

    /* ========================================================
       6. CHAMPIONNATS ET TOURNOIS
    ======================================================== */

    function renderChampionships() {
        const container = $("competitionLevelsList");
        if (!container) return;

        const levels = Array.isArray(CONFIG.competitionLevels)
            ? CONFIG.competitionLevels
            : [];

        const fragment = document.createDocumentFragment();

        levels.forEach((level, index) => {
            const card = document.createElement("article");
            card.className = "competition-level-card";

            card.innerHTML = `
                <strong>${index + 1}. ${escapeHTML(level.name)}</strong>
                <p>${escapeHTML(level.description)}</p>
                <button type="button" class="ui-button button-secondary"
                    data-select-competition="${escapeHTML(level.id)}">
                    Sélectionner
                </button>
            `;

            fragment.appendChild(card);
        });

        container.replaceChildren(fragment);
    }

    function renderTournaments() {
        const container = $("tournamentList");
        if (!container) return;

        const defaults = [
            {
                id: "fobas-cup",
                name: "Coupe FOBAS",
                description: "Coupe à élimination directe."
            },
            {
                id: "caribbean-cup",
                name: "Coupe des Caraïbes",
                description: "Tournoi régional."
            },
            {
                id: "northwest-cup",
                name: "Coupe du Nord-Ouest",
                description: "Compétition départementale."
            },
            {
                id: "world-champions",
                name: "Tournoi des champions",
                description: "Compétition internationale."
            }
        ];

        const list = [...defaults, ...state.tournaments];
        const fragment = document.createDocumentFragment();

        list.forEach(tournament => {
            const card = document.createElement("article");
            card.className = "tournament-card";

            card.innerHTML = `
                <strong>${escapeHTML(tournament.name)}</strong>
                <p>${escapeHTML(tournament.description || "Tournoi FOBAS")}</p>
                <button type="button" class="ui-button button-secondary"
                    data-tournament-id="${escapeHTML(tournament.id)}">
                    Participer
                </button>
            `;

            fragment.appendChild(card);
        });

        container.replaceChildren(fragment);
    }

    /* ========================================================
       7. PLAYCANVAS — IMPORTATION DYNAMIQUE
    ======================================================== */

    async function importPlayCanvas() {
        const urls = [
            "https://esm.sh/playcanvas@2.23.2",
            "https://cdn.jsdelivr.net/npm/playcanvas@2.23.2/build/playcanvas.mjs"
        ];

        let lastError = null;

        for (const url of urls) {
            try {
                const module = await import(url);

                if (module && module.Application && module.Entity) {
                    return module;
                }

                throw new Error("API PlayCanvas incomplète.");
            } catch (error) {
                lastError = error;
                console.warn(`Import PlayCanvas échoué : ${url}`, error);
            }
        }

        throw lastError || new Error("Impossible de charger PlayCanvas.");
    }

    function createMaterial(pc, color, options = {}) {
        const material = new pc.StandardMaterial();

        material.diffuse = new pc.Color(color[0], color[1], color[2]);
        material.useLighting = true;

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

    function addPrimitive(name, type, position, scale, material, parent = null) {
        const pc = state.engine;

        const entity = new pc.Entity(name);

        entity.addComponent("render", {
            type,
            material
        });

        entity.setLocalPosition(position[0], position[1], position[2]);
        entity.setLocalScale(scale[0], scale[1], scale[2]);

        (parent || state.sceneRoot).addChild(entity);

        return entity;
    }

    function createBox(name, position, scale, material, parent = null) {
        return addPrimitive(name, "box", position, scale, material, parent);
    }

    function createSphere(name, position, scale, material, parent = null) {
        return addPrimitive(name, "sphere", position, scale, material, parent);
    }

    function createCylinder(name, position, scale, material, parent = null) {
        return addPrimitive(name, "cylinder", position, scale, material, parent);
    }

    function createCapsuleLikePlayer(name, color, parent) {
        const pc = state.engine;
        const root = new pc.Entity(name);

        parent.addChild(root);

        const shirtMaterial = createMaterial(pc, color, { gloss: 55 });
        const shortsMaterial = createMaterial(
            pc,
            [0.08, 0.10, 0.15],
            { gloss: 35 }
        );
        const skinMaterial = createMaterial(pc, [0.43, 0.25, 0.15]);
        const sockMaterial = createMaterial(pc, [0.88, 0.88, 0.84]);
        const bootMaterial = createMaterial(pc, [0.025, 0.03, 0.035]);

        const body = createCylinder(
            `${name}-torse`,
            [0, 1.08, 0],
            [0.58, 0.75, 0.40],
            shirtMaterial,
            root
        );

        const chest = createSphere(
            `${name}-poitrine`,
            [0, 1.30, 0],
            [0.54, 0.46, 0.40],
            shirtMaterial,
            root
        );

        const shorts = createBox(
            `${name}-short`,
            [0, 0.72, 0],
            [0.48, 0.30, 0.34],
            shortsMaterial,
            root
        );

        const head = createSphere(
            `${name}-tete`,
            [0, 1.79, 0],
            [0.34, 0.37, 0.32],
            skinMaterial,
            root
        );

        const hair = createSphere(
            `${name}-cheveux`,
            [0, 1.94, -0.015],
            [0.35, 0.17, 0.33],
            bootMaterial,
            root
        );

        const leftArm = createCylinder(
            `${name}-bras-gauche`,
            [-0.36, 1.13, 0],
            [0.15, 0.55, 0.16],
            skinMaterial,
            root
        );

        const rightArm = createCylinder(
            `${name}-bras-droit`,
            [0.36, 1.13, 0],
            [0.15, 0.55, 0.16],
            skinMaterial,
            root
        );

        const leftLeg = createCylinder(
            `${name}-jambe-gauche`,
            [-0.14, 0.37, 0],
            [0.17, 0.62, 0.18],
            sockMaterial,
            root
        );

        const rightLeg = createCylinder(
            `${name}-jambe-droite`,
            [0.14, 0.37, 0],
            [0.17, 0.62, 0.18],
            sockMaterial,
            root
        );

        createBox(
            `${name}-chaussure-gauche`,
            [-0.14, 0.08, 0.08],
            [0.22, 0.12, 0.35],
            bootMaterial,
            root
        );

        createBox(
            `${name}-chaussure-droite`,
            [0.14, 0.08, 0.08],
            [0.22, 0.12, 0.35],
            bootMaterial,
            root
        );

        root.setLocalScale(1, 1, 1);

        return {
            root,
            body,
            chest,
            head,
            hair,
            leftArm,
            rightArm,
            leftLeg,
            rightLeg,
            shorts,
            team: 0,
            number: 0,
            name,
            speed: 3.6,
            targetX: 0,
            targetZ: 0,
            homeX: 0,
            homeZ: 0,
            phase: Math.random() * Math.PI * 2,
            controlled: false,
            goalkeeper: false,
            stamina: 100
        };
    }

    /* ========================================================
       8. TERRAIN — DIMENSIONS ET MARQUAGES
    ======================================================== */

    function createField() {
        const pc = state.engine;

        state.fieldRoot = new pc.Entity("FOBAS_FOOTBALL_FIELD");
        state.sceneRoot.addChild(state.fieldRoot);

        const grassDark = createMaterial(pc, [0.055, 0.24, 0.105]);
        const grassLight = createMaterial(pc, [0.08, 0.34, 0.13]);
        const lineMaterial = createMaterial(pc, [0.92, 0.96, 0.91]);
        const goalMaterial = createMaterial(pc, [0.84, 0.88, 0.91]);
        const netMaterial = createMaterial(pc, [0.60, 0.70, 0.72]);

        // Terrain extérieur
        createBox(
            "Terrain extérieur",
            [0, -0.18, 0],
            [FIELD.length + 5, 0.35, FIELD.width + 5],
            createMaterial(pc, [0.11, 0.13, 0.14]),
            state.fieldRoot
        );

        // Herbe
        createBox(
            "Pelouse",
            [0, 0, 0],
            [FIELD.length, 0.10, FIELD.width],
            grassDark,
            state.fieldRoot
        );

        // Bandes de gazon alternées
        const stripeCount = 8;
        const stripeLength = FIELD.length / stripeCount;

        for (let i = 0; i < stripeCount; i++) {
            if (i % 2 === 0) continue;

            createBox(
                `Bande gazon ${i}`,
                [
                    -FIELD.length / 2 + stripeLength * i + stripeLength / 2,
                    0.055,
                    0
                ],
                [stripeLength, 0.012, FIELD.width - 0.1],
                grassLight,
                state.fieldRoot
            );
        }

        const y = FIELD.lineY;

        // Lignes périphériques
        createBox(
            "Ligne nord",
            [0, y, -FIELD.width / 2],
            [FIELD.length, 0.025, 0.10],
            lineMaterial,
            state.fieldRoot
        );

        createBox(
            "Ligne sud",
            [0, y, FIELD.width / 2],
            [FIELD.length, 0.025, 0.10],
            lineMaterial,
            state.fieldRoot
        );

        createBox(
            "Ligne gauche",
            [-FIELD.length / 2, y, 0],
            [0.10, 0.025, FIELD.width],
            lineMaterial,
            state.fieldRoot
        );

        createBox(
            "Ligne droite",
            [FIELD.length / 2, y, 0],
            [0.10, 0.025, FIELD.width],
            lineMaterial,
            state.fieldRoot
        );

        // Ligne médiane
        createBox(
            "Ligne médiane",
            [0, y + 0.005, 0],
            [0.07, 0.025, FIELD.width],
            lineMaterial,
            state.fieldRoot
        );

        // Cercle central approximé avec segments
        const circleRadius = 4.1;
        const segments = 44;

        for (let i = 0; i < segments; i++) {
            const a1 = (i / segments) * Math.PI * 2;
            const a2 = ((i + 1) / segments) * Math.PI * 2;

            const x1 = Math.cos(a1) * circleRadius;
            const z1 = Math.sin(a1) * circleRadius;
            const x2 = Math.cos(a2) * circleRadius;
            const z2 = Math.sin(a2) * circleRadius;

            const dx = x2 - x1;
            const dz = z2 - z1;
            const length = Math.sqrt(dx * dx + dz * dz);

            const line = createBox(
                `Cercle central ${i}`,
                [(x1 + x2) / 2, y + 0.006, (z1 + z2) / 2],
                [length, 0.022, 0.055],
                lineMaterial,
                state.fieldRoot
            );

            line.setLocalEulerAngles(0, -Math.atan2(dz, dx) * 180 / Math.PI, 0);
        }

        // Point central
        createCylinder(
            "Point central",
            [0, y + 0.025, 0],
            [0.16, 0.025, 0.16],
            lineMaterial,
            state.fieldRoot
        );

        // Surfaces de réparation et petits rectangles
        for (const sign of [-1, 1]) {
            const goalX = sign * FIELD.length / 2;

            createBox(
                `Surface réparation ${sign}`,
                [goalX - sign * 3.2, y + 0.004, 0],
                [6.4, 0.025, 15],
                lineMaterial,
                state.fieldRoot
            );

            createBox(
                `Petite surface ${sign}`,
                [goalX - sign * 1.1, y + 0.008, 0],
                [2.2, 0.025, 7],
                lineMaterial,
                state.fieldRoot
            );

            createGoal(sign, goalMaterial, netMaterial);
        }

        // Éclairage / décor du stade
        createStadiumDecor();
    }

    function createGoal(sign, goalMaterial, netMaterial) {
        const x = sign * (FIELD.length / 2 + 0.75);
        const zHalf = 3.65;
        const height = 2.55;

        // Poteaux et barre transversale
        createCylinder(
            `Poteau but ${sign} gauche`,
            [x, height / 2, -zHalf],
            [0.12, height, 0.12],
            goalMaterial,
            state.fieldRoot
        );

        createCylinder(
            `Poteau but ${sign} droit`,
            [x, height / 2, zHalf],
            [0.12, height, 0.12],
            goalMaterial,
            state.fieldRoot
        );

        createBox(
            `Barre but ${sign}`,
            [x, height, 0],
            [0.14, 0.14, zHalf * 2],
            goalMaterial,
            state.fieldRoot
        );

        // Filet arrière
        createBox(
            `Filet but ${sign}`,
            [x + sign * 1.0, height / 2, 0],
            [0.035, height, zHalf * 2],
            netMaterial,
            state.fieldRoot
        );

        createBox(
            `Filet latéral gauche ${sign}`,
            [x + sign * 0.5, height / 2, -zHalf],
            [1.0, height, 0.035],
            netMaterial,
            state.fieldRoot
        );

        createBox(
            `Filet latéral droit ${sign}`,
            [x + sign * 0.5, height / 2, zHalf],
            [1.0, height, 0.035],
            netMaterial,
            state.fieldRoot
        );
    }

    function createStadiumDecor() {
        const pc = state.engine;

        const standMaterial = createMaterial(pc, [0.17, 0.20, 0.24]);
        const seatMaterial = createMaterial(pc, [0.07, 0.31, 0.56]);
        const poleMaterial = createMaterial(pc, [0.23, 0.25, 0.28]);
        const lightMaterial = createMaterial(
            pc,
            [0.92, 0.96, 1.0],
            { emissive: [0.65, 0.72, 0.86] }
        );

        for (const side of [-1, 1]) {
            createBox(
                `Tribune ${side}`,
                [0, 0.65, side * (FIELD.width / 2 + 3.5)],
                [FIELD.length - 3, 1.25, 3.4],
                standMaterial,
                state.fieldRoot
            );

            for (let row = 0; row < 3; row++) {
                createBox(
                    `Rang sièges ${side}-${row}`,
                    [0, 1.0 + row * 0.18, side * (FIELD.width / 2 + 2.5 + row * 0.65)],
                    [FIELD.length - 5, 0.16, 0.42],
                    seatMaterial,
                    state.fieldRoot
                );
            }
        }

        for (const x of [-FIELD.length / 2 - 2.2, FIELD.length / 2 + 2.2]) {
            for (const z of [-FIELD.width / 2 - 5.5, FIELD.width / 2 + 5.5]) {
                createCylinder(
                    `Pylône ${x}-${z}`,
                    [x, 7, z],
                    [0.16, 14, 0.16],
                    poleMaterial,
                    state.fieldRoot
                );

                createBox(
                    `Projecteur ${x}-${z}`,
                    [x, 13.5, z],
                    [1.0, 0.32, 0.8],
                    lightMaterial,
                    state.fieldRoot
                );
            }
        }

        // Décor extérieur léger
        createBox(
            "Sol du stade",
            [0, -0.42, 0],
            [FIELD.length + 20, 0.2, FIELD.width + 20],
            createMaterial(pc, [0.12, 0.15, 0.14]),
            state.fieldRoot
        );
    }

    /* ========================================================
       9. JOUEURS ET BALLON
    ======================================================== */

    function makeTeamPlayers(teamIndex, teamColor, teamId) {
        const names = Array.isArray(CONFIG.playerNames)
            ? CONFIG.playerNames
            : ["Joueur 1", "Joueur 2", "Joueur 3"];

        const players = [];

        const positions = [
            [-19, 0],
            [-14, -8],
            [-14, -3],
            [-14, 3],
            [-14, 8],
            [-7, -10],
            [-7, -3],
            [-7, 3],
            [-7, 10],
            [-2, -5],
            [-2, 5]
        ];

        for (let i = 0; i < 11; i++) {
            const playerName = names[
                (teamIndex * 11 + i) % names.length
            ];

            const player = createCapsuleLikePlayer(
                `${teamId}-${i + 1}-${playerName}`,
                teamColor,
                state.playerRoot
            );

            const side = teamIndex === 0 ? -1 : 1;
            const formationPos = positions[i];

            const x = formationPos[0] * side;
            const z = formationPos[1];

            player.team = teamIndex;
            player.number = i + 1;
            player.name = playerName;
            player.homeX = x;
            player.homeZ = z;
            player.targetX = x;
            player.targetZ = z;
            player.goalkeeper = i === 0;
            player.speed = i === 0 ? 3.0 : random(3.2, 4.5);

            player.root.setLocalPosition(x, 0, z);

            players.push(player);
        }

        return players;
    }

    function createPlayers() {
        const pc = state.engine;

        state.playerRoot = new pc.Entity("FOBAS_PLAYERS_ROOT");
        state.sceneRoot.addChild(state.playerRoot);

        const homeColor = [0.08, 0.31, 0.92];
        const awayColor = [0.88, 0.12, 0.11];

        state.homePlayers = makeTeamPlayers(
            0,
            homeColor,
            slug(teamName(state.selectedHome))
        );

        state.awayPlayers = makeTeamPlayers(
            1,
            awayColor,
            slug(teamName(state.selectedAway))
        );

        state.allPlayers = [...state.homePlayers, ...state.awayPlayers];

        state.controlledPlayer = state.homePlayers[9];
        state.controlledPlayer.controlled = true;

        // Petit marqueur visible au-dessus du joueur contrôlé
        const markerMaterial = createMaterial(pc, [1.0, 0.84, 0.08], {
            emissive: [0.35, 0.25, 0.02]
        });

        const marker = createCylinder(
            "Marqueur joueur contrôlé",
            [0, 2.45, 0],
            [0.48, 0.035, 0.48],
            markerMaterial,
            state.controlledPlayer.root
        );

        marker.setLocalEulerAngles(0, 0, 0);

        // Ballon contrasté et clairement visible
        const ballMaterial = createMaterial(pc, [0.96, 0.96, 0.92], {
            gloss: 85
        });

        state.ballEntity = createSphere(
            "Ballon FOBAS",
            [0, FIELD.ballRadius + 0.08, 0],
            [
                FIELD.ballRadius * 2,
                FIELD.ballRadius * 2,
                FIELD.ballRadius * 2
            ],
            ballMaterial,
            state.sceneRoot
        );

        // Motif sombre approximatif du ballon
        const patternMaterial = createMaterial(pc, [0.035, 0.045, 0.055]);

        for (let i = 0; i < 5; i++) {
            const angle = i * Math.PI * 2 / 5;

            createSphere(
                `Motif ballon ${i}`,
                [
                    Math.cos(angle) * 0.16,
                    FIELD.ballRadius + 0.08 + Math.sin(angle) * 0.13,
                    Math.sin(angle) * 0.16
                ],
                [0.10, 0.10, 0.10],
                patternMaterial,
                state.ballEntity
            );
        }

        state.ballShadow = createCylinder(
            "Ombre ballon",
            [0, 0.07, 0],
            [0.65, 0.025, 0.65],
            createMaterial(pc, [0.025, 0.045, 0.025]),
            state.sceneRoot
        );

        state.ballEntity.setLocalPosition(0, FIELD.ballRadius + 0.08, 0);
    }

    /* ========================================================
       10. CAMÉRA — PROCHE, LISIBLE, ANDROID
    ======================================================== */

    function createCamera() {
        const pc = state.engine;

        state.cameraEntity = new pc.Entity("FOBAS_MATCH_CAMERA");

        state.cameraEntity.addComponent("camera", {
            clearColor: new pc.Color(0.39, 0.61, 0.80),
            fov: 48,
            nearClip: 0.1,
            farClip: 220
        });

        state.sceneRoot.addChild(state.cameraEntity);

        state.cameraDistance = 27;
        state.cameraAngle = 0.66;

        updateCamera(true);
    }

    function updateCamera(snap = false) {
        if (!state.cameraEntity) return;

        const player = state.controlledPlayer;

        const targetX = player
            ? player.root.getPosition().x
            : 0;

        const targetZ = player
            ? player.root.getPosition().z
            : 0;

        const distance = clamp(
            state.cameraDistance,
            CAMERA.minDistance,
            CAMERA.maxDistance
        );

        const angle = clamp(
            state.cameraAngle,
            CAMERA.minAngle,
            CAMERA.maxAngle
        );

        const horizontalDistance = Math.cos(angle) * distance;
        const height = Math.sin(angle) * distance;

        let cameraX = targetX + horizontalDistance * 0.60;
        let cameraZ = targetZ + horizontalDistance * 0.80;

        if (state.cameraMode === 1) {
            cameraX = targetX + horizontalDistance;
            cameraZ = targetZ;
        } else if (state.cameraMode === 2) {
            cameraX = 0;
            cameraZ = FIELD.width * 0.80;
        }

        const desiredPosition = new state.engine.Vec3(
            cameraX,
            height + 1.5,
            cameraZ
        );

        const lookTarget = new state.engine.Vec3(
            targetX,
            0.8,
            targetZ
        );

        if (snap) {
            state.cameraEntity.setPosition(desiredPosition);
        } else {
            const current = state.cameraEntity.getPosition();

            current.lerp(current, desiredPosition, 0.12);

            state.cameraEntity.setPosition(current);
        }

        state.cameraEntity.lookAt(lookTarget);
    }

    function setCameraZoom(delta) {
        state.cameraDistance = clamp(
            state.cameraDistance + delta,
            CAMERA.minDistance,
            CAMERA.maxDistance
        );

        updateCamera(true);
        saveRecord("cameraDistance", state.cameraDistance);
    }

    function resetCamera() {
        state.cameraDistance = 27;
        state.cameraAngle = 0.66;
        state.cameraMode = 0;

        updateCamera(true);

        toast("Caméra rapprochée réinitialisée.");
    }

    function changeCameraMode() {
        state.cameraMode = (state.cameraMode + 1) % 3;

        const names = [
            "Caméra d'action rapprochée",
            "Caméra latérale",
            "Vue tactique"
        ];

        updateCamera(true);
        toast(names[state.cameraMode]);
    }

    /* ========================================================
       11. CRÉATION DU MOTEUR PLAYCANVAS
    ======================================================== */

    async function createEngine() {
        const canvas = $("footballCanvas");

        if (!canvas) {
            throw new Error("Le canvas #footballCanvas est absent du HTML.");
        }

        state.engine = await importPlayCanvas();

        const pc = state.engine;

        const app = new pc.Application(canvas, {
            graphicsDeviceOptions: {
                alpha: false,
                antialias: true,
                depth: true,
                stencil: false,
                powerPreference: "high-performance",
                preserveDrawingBuffer: false
            },
            mouse: new pc.Mouse(canvas),
            touch: new pc.TouchDevice(canvas),
            keyboard: new pc.Keyboard(window)
        });

        state.app = app;

        app.setCanvasFillMode(pc.FILLMODE_NONE);
        app.setCanvasResolution(pc.RESOLUTION_AUTO);

        app.scene.ambientLight = new pc.Color(0.52, 0.56, 0.62);
        app.scene.gammaCorrection = pc.GAMMA_SRGB;
        app.scene.toneMapping = pc.TONEMAP_ACES;

        if (app.scene.skybox) {
            // Le fond de caméra est utilisé si aucun skybox n'est chargé.
        }

        app.start();

        state.sceneRoot = new pc.Entity("FOBAS_SCENE_ROOT");
        app.root.addChild(state.sceneRoot);

        // Soleil directionnel
        const sunlight = new pc.Entity("FOBAS_SUNLIGHT");

        sunlight.addComponent("light", {
            type: "directional",
            color: new pc.Color(1, 0.95, 0.82),
            intensity: 1.8,
            castShadows: true,
            shadowResolution: 1024,
            shadowDistance: 70,
            normalOffsetBias: 0.04
        });

        sunlight.setEulerAngles(48, 28, 0);

        state.sceneRoot.addChild(sunlight);

        createField();
        createPlayers();
        createCamera();

        fitCanvas();

        app.on("update", dt => updateGame(dt));

        window.addEventListener("resize", fitCanvas, { passive: true });

        safeText("engineStatus", "MOTEUR 3D ACTIF · PLAYCANVAS");

        return app;
    }

    function fitCanvas() {
        if (!state.app || !$("footballCanvas")) return;

        const canvas = $("footballCanvas");
        const viewport = $("pitchViewport");

        const rect = viewport
            ? viewport.getBoundingClientRect()
            : canvas.getBoundingClientRect();

        const width = Math.max(320, Math.floor(rect.width || window.innerWidth));
        const height = Math.max(240, Math.floor(rect.height || window.innerHeight * 0.55));

        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";

        try {
            state.app.resizeCanvas(width, height);
        } catch (error) {
            console.warn("Redimensionnement canvas :", error);
        }

        updateCamera(true);
    }

    /* ========================================================
       12. IA DES JOUEURS ET PHYSIQUE SIMPLE
    ======================================================== */

    function movePlayer(player, x, z, dt, maxSpeed = null) {
        const position = player.root.getPosition();

        const dx = x - position.x;
        const dz = z - position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < 0.02) return;

        const speed = maxSpeed || player.speed;
        const step = Math.min(distance, speed * dt);

        const nextX = position.x + dx / distance * step;
        const nextZ = position.z + dz / distance * step;

        player.root.setPosition(
            clamp(nextX, -FIELD.length / 2 + 0.5, FIELD.length / 2 - 0.5),
            0,
            clamp(nextZ, -FIELD.width / 2 + 0.5, FIELD.width / 2 - 0.5)
        );

        player.root.setEulerAngles(
            0,
            Math.atan2(dx, dz) * 180 / Math.PI,
            0
        );

        player.phase += dt * (player.sprinting ? 12 : 8);

        const legSwing = Math.sin(player.phase) * 18;

        player.leftLeg.setLocalEulerAngles(legSwing, 0, 0);
        player.rightLeg.setLocalEulerAngles(-legSwing, 0, 0);
        player.leftArm.setLocalEulerAngles(-legSwing * 0.7, 0, 0);
        player.rightArm.setLocalEulerAngles(legSwing * 0.7, 0, 0);
    }

    function getBallPosition() {
        if (!state.ballEntity) return { x: 0, y: 0, z: 0 };

        const p = state.ballEntity.getPosition();

        return { x: p.x, y: p.y, z: p.z };
    }

    function setBallPosition(x, y, z) {
        if (!state.ballEntity) return;

        state.ballEntity.setPosition(x, y, z);

        if (state.ballShadow) {
            state.ballShadow.setPosition(x, 0.07, z);
        }
    }

    function nearestPlayerToBall(team) {
        const players = team === 0 ? state.homePlayers : state.awayPlayers;

        const ball = getBallPosition();

        let nearest = null;
        let best = Infinity;

        for (const player of players) {
            const p = player.root.getPosition();
            const d = Math.hypot(p.x - ball.x, p.z - ball.z);

            if (d < best) {
                best = d;
                nearest = player;
            }
        }

        return nearest;
    }

    function updateAI(dt) {
        if (!state.matchStarted || state.paused || state.matchFinished) return;

        const ball = getBallPosition();
        const holderHome = nearestPlayerToBall(0);
        const holderAway = nearestPlayerToBall(1);

        for (const player of state.allPlayers) {
            if (player === state.controlledPlayer) continue;

            const position = player.root.getPosition();
            const side = player.team === 0 ? 1 : -1;

            const isNearest = player === holderHome || player === holderAway;
            const chaseDistance = Math.hypot(
                position.x - ball.x,
                position.z - ball.z
            );

            if (isNearest && chaseDistance > 0.9) {
                movePlayer(player, ball.x, ball.z, dt, player.speed * 0.86);
                continue;
            }

            if (chaseDistance < 1.05 && Math.random() < 0.025) {
                const targetGoalX = player.team === 0
                    ? FIELD.length / 2
                    : -FIELD.length / 2;

                kickBall(player, targetGoalX, random(-2.5, 2.5), 13);
                continue;
            }

            const desiredX = clamp(
                player.homeX + (ball.x * 0.12),
                -FIELD.length / 2 + 2,
                FIELD.length / 2 - 2
            );

            const desiredZ = clamp(
                player.homeZ + (ball.z * 0.18),
                -FIELD.width / 2 + 2,
                FIELD.width / 2 - 2
            );

            movePlayer(
                player,
                desiredX,
                desiredZ,
                dt,
                player.speed * 0.42
            );
        }
    }

    function updateBall(dt) {
        if (!state.ballEntity || state.paused || !state.matchStarted) return;

        const p = getBallPosition();

        state.ballVelocity.x *= Math.pow(0.985, dt * 60);
        state.ballVelocity.z *= Math.pow(0.985, dt * 60);

        const x = p.x + state.ballVelocity.x * dt;
        const z = p.z + state.ballVelocity.z * dt;

        let y = p.y + state.ballVelocity.y * dt;

        state.ballVelocity.y -= 9.8 * dt;

        if (y < FIELD.ballRadius + 0.06) {
            y = FIELD.ballRadius + 0.06;

            if (state.ballVelocity.y < -1) {
                state.ballVelocity.y *= -0.34;
            } else {
                state.ballVelocity.y = 0;
            }
        }

        // Limites latérales
        if (Math.abs(z) > FIELD.width / 2 - 0.35) {
            state.ballVelocity.z *= -0.72;
        }

        // Limites de terrain et buts
        if (Math.abs(x) > FIELD.length / 2 + 1.0) {
            const goalScored =
                Math.abs(z) < 3.45 &&
                y < 2.7;

            if (goalScored) {
                const scoringTeam = x > 0 ? 0 : 1;
                registerGoal(scoringTeam);
                return;
            }

            state.ballVelocity.x *= -0.65;
        }

        setBallPosition(
            clamp(x, -FIELD.length / 2 - 1.2, FIELD.length / 2 + 1.2),
            y,
            clamp(z, -FIELD.width / 2 - 1.2, FIELD.width / 2 + 1.2)
        );

        if (state.ballEntity) {
            const velocity = Math.hypot(
                state.ballVelocity.x,
                state.ballVelocity.z
            );

            if (velocity > 0.5) {
                state.ballEntity.rotate(
                    state.ballVelocity.z * dt * 50,
                    0,
                    -state.ballVelocity.x * dt * 50
                );
            }
        }
    }

    function kickBall(player, targetX, targetZ, power = 10) {
        if (!player || !state.ballEntity) return;

        const position = player.root.getPosition();
        const ball = getBallPosition();

        const dx = targetX - ball.x;
        const dz = targetZ - ball.z;
        const length = Math.max(0.01, Math.hypot(dx, dz));

        state.ballVelocity.x = dx / length * power;
        state.ballVelocity.z = dz / length * power;
        state.ballVelocity.y = power > 11 ? 2.5 : 0.6;

        setBallPosition(
            position.x + Math.sign(dx || 1) * 0.55,
            FIELD.ballRadius + 0.08,
            position.z
        );
    }

    function attachBallToPlayer(player) {
        if (!player || !state.ballEntity) return;

        const position = player.root.getPosition();

        setBallPosition(
            position.x + 0.48,
            FIELD.ballRadius + 0.08,
            position.z + 0.10
        );

        state.ballVelocity.x = 0;
        state.ballVelocity.y = 0;
        state.ballVelocity.z = 0;
    }

    /* ========================================================
       13. ACTIONS DE JEU
    ======================================================== */

    function passBall() {
        if (!state.matchStarted || state.paused) return;

        const player = state.controlledPlayer;

        if (!player) return;

        const teammates = state.homePlayers
            .filter(other => other !== player)
            .sort((a, b) => {
                const pa = a.root.getPosition();
                const pb = b.root.getPosition();

                const ball = getBallPosition();

                const da = Math.hypot(pa.x - ball.x, pa.z - ball.z);
                const db = Math.hypot(pb.x - ball.x, pb.z - ball.z);

                return da - db;
            });

        const target = teammates[0];

        if (!target) return;

        const targetPosition = target.root.getPosition();

        kickBall(
            player,
            targetPosition.x,
            targetPosition.z,
            9.5
        );

        announce("PASSE", `${player.name} passe le ballon à ${target.name}.`);
        playTone(560, 0.09);
    }

    function shootBall() {
        if (!state.matchStarted || state.paused) return;

        const player = state.controlledPlayer;
        if (!player) return;

        const targetX = FIELD.length / 2 + 3;
        const targetZ = random(-2.3, 2.3);

        kickBall(player, targetX, targetZ, 17);

        announce("TIR", `${player.name} tente sa chance !`);
        playTone(240, 0.16);

        refereeCheckShot();
    }

    function sprintStart() {
        state.sprinting = true;

        if (state.controlledPlayer) {
            state.controlledPlayer.speed = 6.5;
        }
    }

    function sprintStop() {
        state.sprinting = false;

        if (state.controlledPlayer) {
            state.controlledPlayer.speed = 4.2;
        }
    }

    function defendAction() {
        if (!state.matchStarted || state.paused) return;

        state.defending = true;

        const player = state.controlledPlayer;
        const opponent = nearestPlayerToBall(1);

        if (!player || !opponent) return;

        const p = player.root.getPosition();
        const o = opponent.root.getPosition();

        const distance = Math.hypot(p.x - o.x, p.z - o.z);

        if (distance < 2.3) {
            const ball = getBallPosition();

            state.ballVelocity.x = (p.x - ball.x) * 3.0;
            state.ballVelocity.z = (p.z - ball.z) * 3.0;

            announce(
                "RÉCUPÉRATION",
                `${player.name} tente de reprendre le ballon.`
            );
        } else {
            announce("DÉFENSE", "Approchez-vous de l'adversaire pour récupérer le ballon.");
        }

        if (CONFIG.refereeName) {
            refereeCheckContact(distance);
        }
    }

    function switchPlayer() {
        if (!state.homePlayers.length) return;

        const currentIndex = state.homePlayers.indexOf(state.controlledPlayer);
        const nextIndex = (currentIndex + 1) % state.homePlayers.length;

        if (state.controlledPlayer) {
            state.controlledPlayer.controlled = false;
        }

        state.controlledPlayer = state.homePlayers[nextIndex];
        state.controlledPlayer.controlled = true;

        updateCamera(true);

        announce(
            "CHANGEMENT",
            `Vous contrôlez maintenant ${state.controlledPlayer.name}.`
        );
    }

    function updateControlledPlayer(dt) {
        const player = state.controlledPlayer;

        if (!player || !state.matchStarted || state.paused) return;

        const { x, y } = state.joystick;

        if (Math.abs(x) < 0.04 && Math.abs(y) < 0.04) return;

        const position = player.root.getPosition();
        const speed = state.sprinting ? 6.5 : 4.2;

        const nextX = position.x + x * speed * dt;
        const nextZ = position.z + y * speed * dt;

        movePlayer(player, nextX, nextZ, dt, speed);

        const ball = getBallPosition();

        if (Math.hypot(position.x - ball.x, position.z - ball.z) < 1.4) {
            if (
                Math.hypot(state.ballVelocity.x, state.ballVelocity.z) < 1.2
            ) {
                attachBallToPlayer(player);
            }
        }
    }

    /* ========================================================
       14. ARBITRE IA
    ======================================================== */

    function refereeCheckShot() {
        if (!state.settings.commentary) return;

        const ball = getBallPosition();

        if (
            Math.abs(ball.x) > FIELD.length / 2 - 6 &&
            Math.abs(ball.z) < 7
        ) {
            safeText(
                "refereeDecisionLabel",
                `${CONFIG.refereeName || "Arbitre IA"} : tir dangereux`
            );
        } else {
            safeText(
                "refereeDecisionLabel",
                `${CONFIG.refereeName || "Arbitre IA"} : jeu en cours`
            );
        }
    }

    function refereeCheckContact(distance) {
        if (distance < 0.65 && Math.random() < 0.04) {
            safeText(
                "refereeDecisionLabel",
                `${CONFIG.refereeName || "Arbitre IA"} : contact à surveiller`
            );
        }
    }

    function updateReferee() {
        if (!state.settings.commentary) return;

        if (Date.now() - state.lastRefereeTick < 5000) return;

        state.lastRefereeTick = Date.now();

        const messages = [
            "Arbitre IA : jeu en cours",
            "Arbitre IA : surveille les contacts",
            "Arbitre IA : positionnement correct",
            "Arbitre IA : restez attentif au ballon"
        ];

        safeText("refereeDecisionLabel", pick(messages));
    }

    /* ========================================================
       15. BUTS, SCORE ET CHRONOMÈTRE
    ======================================================== */

    function registerGoal(scoringTeam) {
        if (state.matchFinished) return;

        if (scoringTeam === 0) {
            state.scoreHome++;
            state.profile.goalsScored++;
        } else {
            state.scoreAway++;
        }

        safeText("homeScore", state.scoreHome);
        safeText("awayScore", state.scoreAway);

        const scorer = nearestPlayerToBall(scoringTeam);
        const name = scorer ? scorer.name : "Joueur";

        announce(
            "⚽ BUT !",
            `${scoringTeam === 0 ? teamName(state.selectedHome) : teamName(state.selectedAway)} marque !`
        );

        toast(`BUT : ${name}`, "success", 4000);

        state.ballVelocity = { x: 0, y: 0, z: 0 };
        setBallPosition(0, FIELD.ballRadius + 0.08, 0);

        state.allPlayers.forEach(player => {
            player.root.setLocalPosition(player.homeX, 0, player.homeZ);
        });

        state.career.currentMission = Math.max(
            1,
            state.career.currentMission
        );

        saveAll(false);
    }

    function updateClock(dt) {
        if (!state.matchStarted || state.paused || state.matchFinished) return;

        state.elapsed += dt * (state.matchLength / 540);

        const totalSeconds = Math.floor(state.elapsed * 60);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        safeText(
            "matchClock",
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        );

        if (state.elapsed >= state.matchLength) {
            finishMatch();
        } else if (state.elapsed >= state.matchLength / 2) {
            safeText("matchPeriod", "2e MI-TEMPS");
        } else {
            safeText("matchPeriod", "1re MI-TEMPS");
        }
    }

    function finishMatch() {
        state.matchFinished = true;
        state.matchStarted = false;

        state.profile.matchesPlayed++;

        if (state.scoreHome > state.scoreAway) {
            state.career.wins++;
            state.career.completedMissions.push(state.career.currentMission);
            state.profile.trophies += 0;
        } else if (state.scoreHome < state.scoreAway) {
            state.career.losses++;
        } else {
            state.career.draws++;
        }

        syncProfileUI();

        showDialog(
            "FIN DU MATCH",
            `
                <p>${escapeHTML(teamName(state.selectedHome))}
                <strong>${state.scoreHome}</strong> —
                <strong>${state.scoreAway}</strong>
                ${escapeHTML(teamName(state.selectedAway))}</p>
                <p>Match terminé. Votre progression est sauvegardée localement.</p>
            `,
            [
                {
                    label: "REJOUER",
                    primary: true,
                    action: () => startMatch()
                },
                {
                    label: "MENU",
                    action: () => showScreen("mainMenu")
                }
            ]
        );

        saveAll(false);
    }

    /* ========================================================
       16. BOUCLE PRINCIPALE
    ======================================================== */

    function updateGame(dt) {
        if (!Number.isFinite(dt) || dt <= 0) return;

        dt = Math.min(dt, 0.05);

        if (state.matchStarted && !state.paused && !state.matchFinished) {
            updateControlledPlayer(dt);
            updateAI(dt);
            updateBall(dt);
            updateClock(dt);
            updateReferee();

            updateCamera(false);

            if (Date.now() - state.lastAutoSave > 600000) {
                state.lastAutoSave = Date.now();
                saveAll(false);
            }
        }
    }

    /* ========================================================
       17. LANCEMENT ET CONFIGURATION DU MATCH
    ======================================================== */

    function readMatchSetup() {
        state.selectedCompetition = $("competitionSelect")?.value || "local";
        state.selectedHome = $("homeTeamSelect")?.value || "mare-rouge";
        state.selectedAway = $("awayTeamSelect")?.value || "mole-saint-nicolas";

        if (state.selectedHome === state.selectedAway) {
            const alternative = state.teams.find(
                team => team.id !== state.selectedHome
            );

            if (alternative) {
                state.selectedAway = alternative.id;

                if ($("awayTeamSelect")) {
                    $("awayTeamSelect").value = alternative.id;
                }

                toast("Les deux équipes doivent être différentes.");
            }
        }

        const duration = $("matchDurationSelect")?.value || "standard";

        state.matchLength = duration === "short"
            ? 45
            : duration === "long"
                ? 120
                : 90;
    }

    function resetMatchState() {
        state.scoreHome = 0;
        state.scoreAway = 0;
        state.elapsed = 0;
        state.matchFinished = false;
        state.paused = false;
        state.ballVelocity = { x: 0, y: 0, z: 0 };

        safeText("homeScore", "0");
        safeText("awayScore", "0");
        safeText("matchClock", "00:00");
        safeText("matchPeriod", "1re MI-TEMPS");
    }

    function startMatch() {
        if (!state.app || !state.engine) {
            toast("Le moteur 3D n'est pas encore prêt.", "error");
            return;
        }

        readMatchSetup();
        resetMatchState();

        if (state.playerRoot) {
            state.playerRoot.destroy();
        }

        if (state.ballEntity) {
            state.ballEntity.destroy();
        }

        if (state.ballShadow) {
            state.ballShadow.destroy();
        }

        state.homePlayers = [];
        state.awayPlayers = [];
        state.allPlayers = [];
        state.controlledPlayer = null;

        createPlayers();

        safeText("competitionLabel", getCompetitionName(state.selectedCompetition));
        safeText("stadiumLabel", $("stadiumSelect")?.value === "neutral"
            ? "STADE NEUTRE"
            : `STADE ${teamName(state.selectedHome).toUpperCase()}`);

        safeText("homeTeamName", teamName(state.selectedHome).toUpperCase());
        safeText("awayTeamName", teamName(state.selectedAway).toUpperCase());

        state.matchStarted = true;
        state.paused = false;
        state.cameraDistance = 27;
        state.cameraMode = 0;

        hide($("pauseOverlay"));
        showScreen("matchScreen");
        updateCamera(true);

        safeText("engineStatus", "MATCH EN COURS · PLAYCANVAS 3D");

        announce(
            "COUP D'ENVOI",
            `${teamName(state.selectedHome)} contre ${teamName(state.selectedAway)}`
        );

        toast("Le match commence !", "success");
    }

    function getCompetitionName(id) {
        const item = (CONFIG.competitionLevels || []).find(
            competition => competition.id === id
        );

        return item ? item.name : "MATCH LOCAL";
    }

    /* ========================================================
       18. NAVIGATION ENTRE LES ÉCRANS
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

    function showScreen(id) {
        const target = $(id);

        if (!target) {
            console.warn(`Écran absent : ${id}`);
            return;
        }

        SCREEN_IDS.forEach(screenId => hide($(screenId)));

        show(target);

        state.currentScreen = id;

        if (id === "matchScreen") {
            window.setTimeout(() => {
                fitCanvas();
                updateCamera(true);
            }, 80);
        }

        if (id === "profileScreen") syncProfileUI();
        if (id === "settingsScreen") syncSettingsUI();

        if (id === "teamsScreen") renderTeams();
        if (id === "championshipScreen") renderChampionships();
        if (id === "tournamentScreen") renderTournaments();
    }

    /* ========================================================
       19. DIALOGUES
    ======================================================== */

    function showDialog(title, content, actions = []) {
        safeText("dialogTitle", title);

        const contentElement = $("dialogContent");
        const actionsElement = $("dialogActions");

        if (contentElement) {
            contentElement.innerHTML = content;
        }

        if (actionsElement) {
            actionsElement.replaceChildren();

            actions.forEach(action => {
                const button = document.createElement("button");

                button.type = "button";
                button.className = action.primary
                    ? "ui-button button-primary"
                    : "ui-button button-secondary";

                button.textContent = action.label;

                button.addEventListener("click", () => {
                    hide($("dialogOverlay"));

                    if (typeof action.action === "function") {
                        action.action();
                    }
                });

                actionsElement.appendChild(button);
            });
        }

        show($("dialogOverlay"));
    }

    function closeDialog() {
        hide($("dialogOverlay"));
    }

    /* ========================================================
       20. PROFIL ET PARAMÈTRES
    ======================================================== */

    function syncProfileUI() {
        if ($("profileNameInput")) {
            $("profileNameInput").value = state.profile.name;
        }

        if ($("profileFavoriteTeam")) {
            const optionExists = [...$("profileFavoriteTeam").options]
                .some(option => option.value === state.profile.favoriteTeam);

            if (optionExists) {
                $("profileFavoriteTeam").value = state.profile.favoriteTeam;
            }
        }

        safeText("profileMatchesPlayed", state.profile.matchesPlayed);
        safeText("profileGoalsScored", state.profile.goalsScored);
        safeText("profileTrophies", state.profile.trophies);
    }

    function saveProfile() {
        state.profile.name =
            $("profileNameInput")?.value.trim() || "Joueur FOBAS";

        state.profile.favoriteTeam =
            $("profileFavoriteTeam")?.value || "mare-rouge";

        saveRecord("profile", state.profile);
        saveAll(false);
        syncProfileUI();

        toast("Profil sauvegardé.", "success");
    }

    function syncSettingsUI() {
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
            $("vibrationToggle").checked = state.settings.vibration;
        }

        if ($("commentaryToggle")) {
            $("commentaryToggle").checked = state.settings.commentary;
        }
    }

    function saveSettings() {
        state.settings.graphics =
            $("graphicsQualitySelect")?.value || "medium";

        state.settings.volume =
            Number($("soundVolumeInput")?.value || 70);

        state.settings.cameraSensitivity =
            Number($("cameraSensitivityInput")?.value || 50);

        state.settings.difficulty =
            $("matchDifficultySelect")?.value || "normal";

        state.settings.vibration =
            Boolean($("vibrationToggle")?.checked);

        state.settings.commentary =
            Boolean($("commentaryToggle")?.checked);

        if (state.app) {
            state.app.graphicsDevice.maxPixelRatio =
                state.settings.graphics === "high"
                    ? Math.min(window.devicePixelRatio || 1, 2)
                    : state.settings.graphics === "low"
                        ? 1
                        : Math.min(window.devicePixelRatio || 1, 1.5);
        }

        saveRecord("settings", state.settings);
        saveAll(false);

        toast("Paramètres enregistrés.", "success");
    }

    function syncTacticsUI() {
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

    function applyTactics() {
        state.tactics.formation = $("formationSelect")?.value || "433";
        state.tactics.style = $("tacticalStyleSelect")?.value || "balanced";
        state.tactics.pressure = $("pressureSelect")?.value || "medium";

        hide($("tacticsOverlay"));

        saveRecord("tactics", state.tactics);

        toast(
            `Tactiques appliquées : ${state.tactics.formation}, ${state.tactics.style}.`,
            "success"
        );
    }

    /* ========================================================
       21. ÉQUIPEMENTS
    ======================================================== */

    const EQUIPMENT = {
        kits: [
            { id: "classic", name: "Maillot classique FOBAS", price: 0 },
            { id: "royal", name: "Maillot royal", price: 150 },
            { id: "ocean", name: "Maillot océan", price: 200 },
            { id: "fire", name: "Maillot feu", price: 250 },
            { id: "gold", name: "Maillot champion doré", price: 500 }
        ],
        balls: [
            { id: "classic", name: "Ballon classique", price: 0 },
            { id: "gold", name: "Ballon doré", price: 120 },
            { id: "ocean", name: "Ballon océan", price: 140 },
            { id: "fire", name: "Ballon feu", price: 160 }
        ],
        boots: [
            { id: "classic", name: "Chaussures classiques", price: 0 },
            { id: "speed", name: "Chaussures vitesse", price: 100 },
            { id: "control", name: "Chaussures contrôle", price: 150 },
            { id: "elite", name: "Chaussures élite", price: 300 }
        ]
    };

    function renderEquipment(tab = state.selectedEquipmentTab) {
        state.selectedEquipmentTab = tab;

        const container = $("equipmentItemsList");
        if (!container) return;

        document.querySelectorAll("[data-equipment-tab]").forEach(button => {
            const active = button.dataset.equipmentTab === tab;

            button.classList.toggle("active", active);
            button.setAttribute("aria-selected", String(active));
        });

        const fragment = document.createDocumentFragment();

        (EQUIPMENT[tab] || []).forEach(item => {
            const card = document.createElement("article");

            card.className = "equipment-card";

            const selected = state.selectedEquipment[tab] === item.id;

            card.innerHTML = `
                <strong>${escapeHTML(item.name)}</strong>
                <p>${item.price === 0 ? "Gratuit" : `${item.price} crédits`}</p>
                <button type="button" class="ui-button ${selected ? "button-primary" : "button-secondary"}"
                    data-equipment-item="${escapeHTML(item.id)}">
                    ${selected ? "Sélectionné" : "Choisir"}
                </button>
            `;

            fragment.appendChild(card);
        });

        container.replaceChildren(fragment);
    }

    function applyEquipment() {
        saveRecord("equipment", state.selectedEquipment);
        saveAll(false);

        toast("Équipement sauvegardé.", "success");
    }

    /* ========================================================
       22. AUDIO — SANS FICHIER EXTERNE OBLIGATOIRE
    ======================================================== */

    function playTone(frequency = 440, duration = 0.1) {
        if (!state.soundEnabled || state.settings.volume <= 0) return;

        try {
            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) return;

            if (!state.audioContext) {
                state.audioContext = new AudioContextClass();
            }

            if (state.audioContext.state === "suspended") {
                state.audioContext.resume();
            }

            const oscillator = state.audioContext.createOscillator();
            const gain = state.audioContext.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = frequency;

            gain.gain.value =
                (state.settings.volume / 100) * 0.07;

            oscillator.connect(gain);
            gain.connect(state.audioContext.destination);

            oscillator.start();

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                state.audioContext.currentTime + duration
            );

            oscillator.stop(state.audioContext.currentTime + duration);
        } catch (error) {
            console.warn("Audio indisponible :", error);
        }
    }

    function toggleSound() {
        state.soundEnabled = !state.soundEnabled;

        const button = $("soundToggleBtn");

        if (button) {
            button.textContent = state.soundEnabled ? "🔊" : "🔇";
            button.setAttribute("aria-pressed", String(state.soundEnabled));
        }

        toast(state.soundEnabled ? "Son activé." : "Son désactivé.");
    }

    /* ========================================================
       23. JOYSTICK ANDROID
    ======================================================== */

    function attachJoystick() {
        const joystick = $("movementJoystick");
        const base = $("joystickBase");
        const knob = $("joystickKnob");

        if (!joystick || !base || !knob) return;

        let pointerId = null;

        const reset = () => {
            state.joystick.x = 0;
            state.joystick.y = 0;
            state.joystick.active = false;
            pointerId = null;

            knob.style.transform = "translate(-50%, -50%)";
        };

        const update = event => {
            if (pointerId !== null && event.pointerId !== pointerId) return;

            const rect = base.getBoundingClientRect();

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const maxRadius = Math.max(20, rect.width * 0.34);

            const dx = event.clientX - centerX;
            const dy = event.clientY - centerY;

            const distance = Math.hypot(dx, dy);
            const ratio = distance > maxRadius ? maxRadius / distance : 1;

            const px = dx * ratio;
            const py = dy * ratio;

            state.joystick.x = clamp(px / maxRadius, -1, 1);
            state.joystick.y = clamp(py / maxRadius, -1, 1);
            state.joystick.active = true;

            knob.style.transform =
                `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
        };

        joystick.addEventListener("pointerdown", event => {
            event.preventDefault();

            pointerId = event.pointerId;

            try {
                joystick.setPointerCapture(pointerId);
            } catch {}

            update(event);
        });

        joystick.addEventListener("pointermove", event => {
            if (pointerId === null) return;

            event.preventDefault();
            update(event);
        });

        joystick.addEventListener("pointerup", reset);
        joystick.addEventListener("pointercancel", reset);
        joystick.addEventListener("lostpointercapture", reset);
    }

    /* ========================================================
       24. ZOOM PINCH DEUX DOIGTS
    ======================================================== */

    function attachPinchZoom() {
        const viewport = $("pitchViewport");
        if (!viewport) return;

        viewport.style.touchAction = "none";

        let initialDistance = null;
        let initialZoom = null;
        let lastZoomUpdate = 0;

        const distanceBetween = touches => {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;

            return Math.hypot(dx, dy);
        };

        viewport.addEventListener("touchstart", event => {
            if (event.touches.length === 2) {
                event.preventDefault();

                initialDistance = distanceBetween(event.touches);
                initialZoom = state.cameraDistance;
                lastZoomUpdate = 0;
            }
        }, { passive: false });

        viewport.addEventListener("touchmove", event => {
            if (event.touches.length !== 2 || initialDistance === null) return;

            event.preventDefault();

            const currentDistance = distanceBetween(event.touches);
            const ratio = initialDistance / Math.max(1, currentDistance);

            state.cameraDistance = clamp(
                initialZoom * ratio,
                CAMERA.minDistance,
                CAMERA.maxDistance
            );

            const now = performance.now();

            if (now - lastZoomUpdate > 25) {
                updateCamera(true);
                lastZoomUpdate = now;
            }
        }, { passive: false });

        const resetPinch = () => {
            initialDistance = null;
            initialZoom = null;
        };

        viewport.addEventListener("touchend", event => {
            if (event.touches.length < 2) resetPinch();
        }, { passive: true });

        viewport.addEventListener("touchcancel", resetPinch, { passive: true });

        // Souris / stylet : zoom avec la molette si disponible.
        viewport.addEventListener("wheel", event => {
            event.preventDefault();

            setCameraZoom(event.deltaY > 0 ? 1.5 : -1.5);
        }, { passive: false });
    }

    /* ========================================================
       25. ÉVÉNEMENTS DE L'INTERFACE
    ======================================================== */

    function attachEvents() {
        if (state.listenersAttached) return;

        state.listenersAttached = true;

        const on = (id, event, handler) => {
            const element = $(id);

            if (element) {
                element.addEventListener(event, handler);
            }
        };

        on("playMatchBtn", "click", () => showScreen("matchSetupScreen"));

        on("continueCareerBtn", "click", () => {
            showScreen("championshipScreen");

            toast(
                `Carrière : mission ${state.career.currentMission}.`
            );
        });

        on("championshipsBtn", "click", () => showScreen("championshipScreen"));
        on("tournamentsBtn", "click", () => showScreen("tournamentScreen"));
        on("teamsBtn", "click", () => showScreen("teamsScreen"));

        on("equipmentBtn", "click", () => {
            renderEquipment();
            showScreen("equipmentScreen");
        });

        on("profileBtn", "click", () => showScreen("profileScreen"));
        on("howToPlayBtn", "click", () => showScreen("howToPlayScreen"));
        on("openSettingsBtn", "click", () => showScreen("settingsScreen"));

        on("confirmMatchBtn", "click", startMatch);

        on("cameraZoomInBtn", "click", () => setCameraZoom(-2.5));
        on("cameraZoomOutBtn", "click", () => setCameraZoom(2.5));
        on("cameraResetBtn", "click", resetCamera);
        on("changeCameraBtn", "click", changeCameraMode);

        on("passBtn", "click", passBall);
        on("shootBtn", "click", shootBall);
        on("defendBtn", "click", defendAction);
        on("switchPlayerBtn", "click", switchPlayer);

        on("sprintBtn", "pointerdown", event => {
            event.preventDefault();
            sprintStart();
        });

        on("sprintBtn", "pointerup", sprintStop);
        on("sprintBtn", "pointercancel", sprintStop);
        on("sprintBtn", "pointerleave", sprintStop);

        on("saveMatchBtn", "click", () => saveAll(true));

        on("exitMatchBtn", "click", () => {
            state.matchStarted = false;
            showScreen("mainMenu");
            saveAll(false);
        });

        on("pauseGameBtn", "click", () => {
            if (!state.matchStarted) return;

            state.paused = true;
            show($("pauseOverlay"));
        });

        on("resumeGameBtn", "click", () => {
            state.paused = false;
            hide($("pauseOverlay"));
        });

        on("savePausedMatchBtn", "click", () => saveAll(true));

        on("quitPausedMatchBtn", "click", () => {
            state.paused = false;
            state.matchStarted = false;

            hide($("pauseOverlay"));
            showScreen("mainMenu");
            saveAll(false);
        });

        on("soundToggleBtn", "click", toggleSound);

        on("closeDialogBtn", "click", closeDialog);

        on("showTacticsBtn", "click", () => {
            syncTacticsUI();
            show($("tacticsOverlay"));
        });

        on("closeTacticsBtn", "click", () => hide($("tacticsOverlay")));
        on("applyTacticsBtn", "click", applyTactics);

        on("saveProfileBtn", "click", saveProfile);
        on("saveSettingsBtn", "click", saveSettings);

        on("kitsTabBtn", "click", () => renderEquipment("kits"));
        on("ballsTabBtn", "click", () => renderEquipment("balls"));
        on("bootsTabBtn", "click", () => renderEquipment("boots"));
        on("applyEquipmentBtn", "click", applyEquipment);

        on("teamSearchInput", "input", event => {
            state.teamsFilter.query = event.target.value.trim();
            renderTeams();
        });

        on("teamRegionSelect", "change", event => {
            state.teamsFilter.region = event.target.value;
            renderTeams();
        });

        on("refreshTeamsBtn", "click", () => {
            buildTeams();
            toast("Liste des équipes actualisée.", "success");
        });

        on("startChampionshipBtn", "click", () => {
            if ($("competitionSelect")) {
                $("competitionSelect").value = state.selectedChampionship;
            }

            showScreen("matchSetupScreen");
        });

        on("createTournamentBtn", "click", () => {
            const name = `Tournoi FOBAS ${state.tournaments.length + 1}`;

            state.tournaments.push({
                id: `tournament-${Date.now()}`,
                name,
                description: "Tournoi créé localement."
            });

            renderTournaments();
            saveRecord("tournaments", state.tournaments);

            toast("Nouveau tournoi créé.", "success");
        });

        document.addEventListener("click", event => {
            const backButton = event.target.closest("[data-back]");

            if (backButton) {
                showScreen(backButton.dataset.back || "mainMenu");
                return;
            }

            const competitionButton =
                event.target.closest("[data-select-competition]");

            if (competitionButton) {
                state.selectedChampionship =
                    competitionButton.dataset.selectCompetition;

                if ($("competitionSelect")) {
                    $("competitionSelect").value = state.selectedChampionship;
                }

                document.querySelectorAll("[data-select-competition]")
                    .forEach(button => button.classList.remove("active"));

                competitionButton.classList.add("active");

                toast(`Compétition choisie : ${
                    getCompetitionName(state.selectedChampionship)
                }`);

                return;
            }

            const teamButton = event.target.closest("[data-select-team]");

            if (teamButton) {
                const teamId = teamButton.dataset.selectTeam;

                showDialog(
                    "CHOISIR UNE ÉQUIPE",
                    `<p>Utiliser <strong>${escapeHTML(teamName(teamId))}</strong> comme équipe à domicile ou visiteuse ?</p>`,
                    [
                        {
                            label: "À DOMICILE",
                            primary: true,
                            action: () => {
                                if ($("homeTeamSelect")) {
                                    $("homeTeamSelect").value = teamId;
                                }

                                showScreen("matchSetupScreen");
                            }
                        },
                        {
                            label: "VISITEUSE",
                            action: () => {
                                if ($("awayTeamSelect")) {
                                    $("awayTeamSelect").value = teamId;
                                }

                                showScreen("matchSetupScreen");
                            }
                        }
                    ]
                );

                return;
            }

            const equipmentButton =
                event.target.closest("[data-equipment-item]");

            if (equipmentButton) {
                state.selectedEquipment[state.selectedEquipmentTab] =
                    equipmentButton.dataset.equipmentItem;

                renderEquipment();
                return;
            }

            const tournamentButton =
                event.target.closest("[data-tournament-id]");

            if (tournamentButton) {
                const id = tournamentButton.dataset.tournamentId;

                state.activeTournament = id;

                toast("Tournoi sélectionné.", "success");

                if ($("competitionSelect")) {
                    $("competitionSelect").value = "champions";
                }

                showScreen("matchSetupScreen");
            }
        });

        // Éviter la pause permanente quand l'application passe en arrière-plan.
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && state.matchStarted) {
                state.paused = true;
                show($("pauseOverlay"));
            }
        });

        // Sauvegarde de sécurité avant fermeture.
        window.addEventListener("pagehide", () => {
            saveAll(false);
        });

        attachJoystick();
        attachPinchZoom();
    }

    /* ========================================================
       26. ÉTAT D'ERREUR DU CHARGEMENT
    ======================================================== */

    function showLoadingError(error) {
        state.loadingFailed = true;

        console.error("FOBAS FOOTBALL — Erreur de démarrage :", error);

        setLoading(
            100,
            "Impossible de charger le moteur 3D. Vérifiez la connexion Internet puis réessayez."
        );

        if ($("retryLoadingBtn")) {
            show($("retryLoadingBtn"));
        }

        if ($("engineStatus")) {
            $("engineStatus").textContent =
                "ERREUR MOTEUR 3D · Touchez RÉESSAYER";
        }

        toast(
            "Le moteur 3D n'a pas pu démarrer. Vérifiez Internet.",
            "error",
            6000
        );
    }

   /* ========================================================
   27. DÉMARRAGE PRINCIPAL
   FOBAS FOOTBALL ULTIMATE 3D
   Chargement sécurisé + sauvegarde automatique
======================================================== */

async function boot() {
    if (state.booting) return;

    state.booting = true;
    state.loadingFailed = false;

    hide($("retryLoadingBtn"));
    show($("loadingScreen"));

    /*
     * Limite de temps pour éviter un chargement bloqué.
     * Attention : cette limite ne peut pas annuler une
     * opération déjà lancée en arrière-plan.
     */
    const withTimeout = (promise, milliseconds, label) => {
        let timeoutId;

        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = window.setTimeout(() => {
                reject(
                    new Error(
                        label + " : délai dépassé après " +
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
        /* 1. Préparation de l'interface */
        setLoading(5, "Préparation de l'interface...");

        attachEvents();

        /* 2. Ouverture de la base de données */
        setLoading(15, "Ouverture de la sauvegarde locale...");

        state.db = await withTimeout(
            openDatabase(),
            15000,
            "Ouverture IndexedDB"
        );

        /* 3. Chargement des données */
        setLoading(25, "Chargement du profil et des paramètres...");

        await withTimeout(
            loadAll(),
            15000,
            "Chargement des données"
        );

        /* 4. Construction des équipes */
        setLoading(35, "Création des équipes...");

        buildTeams();

        /* 5. Initialisation du moteur 3D */
        setLoading(45, "Chargement du moteur PlayCanvas...");

        await withTimeout(
            createEngine(),
            60000,
            "Initialisation de PlayCanvas"
        );

        /* 6. Préparation de l'interface du jeu */
        setLoading(85, "Préparation du terrain et des joueurs...");

        renderEquipment();
        syncProfileUI();
        syncSettingsUI();
        syncTacticsUI();

        /* 7. Fin du démarrage */
        setLoading(100, "Prêt à jouer !");

        safeText("engineStatus", "MOTEUR 3D PRÊT");

        state.booting = false;

        window.setTimeout(() => {
            hide($("loadingScreen"));
        }, 500);

        toast(
            "FOBAS FOOTBALL ULTIMATE 3D est prêt.",
            "success"
        );

        /* 8. Sauvegarde automatique toutes les 10 minutes */
        if (state.autoSaveTimer) {
            window.clearInterval(state.autoSaveTimer);
            state.autoSaveTimer = null;
        }

        state.autoSaveTimer = window.setInterval(async () => {
            try {
                if (!state.db) return;

                await saveAll(false);

                state.lastAutoSave = Date.now();

                console.info(
                    "[FOBAS FOOTBALL] Sauvegarde automatique effectuée."
                );
            } catch (saveError) {
                console.error(
                    "[FOBAS FOOTBALL] Erreur de sauvegarde automatique :",
                    saveError
                );
            }
        }, 600000);

        console.info(
            "[FOBAS FOOTBALL] Démarrage terminé avec succès."
        );

    } catch (error) {
        state.booting = false;
        state.loadingFailed = true;

        console.error(
            "[FOBAS FOOTBALL] Échec du démarrage :",
            error
        );

        /*
         * Afficher l'erreur dans l'écran de chargement
         * pour faciliter le diagnostic.
         */
        try {
            showLoadingError(error);
        } catch (displayError) {
            console.error(
                "[FOBAS FOOTBALL] Impossible d'afficher l'erreur :",
                displayError
            );

            setLoading(
                100,
                "Échec du démarrage : " +
                (error?.message || "erreur inconnue")
            );

            show($("retryLoadingBtn"));
        }
    }
}


/* ========================================================
   27.1. BOUTON DE NOUVELLE TENTATIVE
======================================================== */

if ($("retryLoadingBtn")) {
    $("retryLoadingBtn").addEventListener("click", async () => {
        if (state.booting) return;

        /*
         * Arrêter l'ancien minuteur de sauvegarde,
         * s'il existe.
         */
        if (state.autoSaveTimer) {
            window.clearInterval(state.autoSaveTimer);
            state.autoSaveTimer = null;
        }

        /*
         * Arrêter l'ancienne application PlayCanvas.
         */
        if (state.app) {
            try {
                state.app.destroy();
            } catch (error) {
                console.warn(
                    "[FOBAS FOOTBALL] Nettoyage de l'ancienne application :",
                    error
                );
            }
        }

        /*
         * Réinitialiser les références du moteur.
         */
        state.app = null;
        state.engine = null;
        state.sceneRoot = null;
        state.cameraEntity = null;
        state.fieldRoot = null;
        state.playerRoot = null;
        state.ballEntity = null;
        state.ballShadow = null;

        state.homePlayers = [];
        state.awayPlayers = [];
        state.allPlayers = [];
        state.controlledPlayer = null;

        state.loadingFailed = false;

        /*
         * Relancer le démarrage.
         */
        await boot();
    });
}

    /* ========================================================
       28. EXPOSITION FACULTATIVE POUR LE DÉBOGAGE
    ======================================================== */

    window.FOBAS_FOOTBALL_GAME = {
        getState: () => ({
            matchStarted: state.matchStarted,
            paused: state.paused,
            scoreHome: state.scoreHome,
            scoreAway: state.scoreAway,
            playerCount: state.allPlayers.length,
            homeTeam: teamName(state.selectedHome),
            awayTeam: teamName(state.selectedAway),
            cameraDistance: state.cameraDistance,
            engineReady: Boolean(state.app)
        }),

        save: () => saveAll(true),

        zoomIn: () => setCameraZoom(-2.5),

        zoomOut: () => setCameraZoom(2.5),

        resetCamera,

        startMatch,

        pause: () => {
            state.paused = true;
            show($("pauseOverlay"));
        },

        resume: () => {
            state.paused = false;
            hide($("pauseOverlay"));
        }
    };

    // Lancer le jeu sans bloquer la page si une fonction échoue.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }

})();
