/* ============================================================
   FOBAS FOOTBALL ULTIMATE 3D
   JavaScript principal — Version 1.0.0
   Moteur : PlayCanvas 2.23.2
   Stockage : IndexedDB + localStorage de secours
   Android First — HTML existant conservé
============================================================ */

(() => {
    "use strict";

    if (window.__FOBAS_FOOTBALL_INITIALIZED__) return;
    window.__FOBAS_FOOTBALL_INITIALIZED__ = true;

    /* ========================================================
       1. CONFIGURATION
    ======================================================== */

    const CONFIG = window.FOBAS_FOOTBALL_CONFIG || {};

    const DB_NAME = CONFIG.databaseName || "FOBAS_FOOTBALL_ULTIMATE_DB";
    const DB_VERSION = CONFIG.databaseVersion || 1;

    const PLAYER_NAMES = Array.isArray(CONFIG.playerNames)
        ? CONFIG.playerNames
        : ["Ranise", "Junior", "Desir", "Kerlande", "MEME Selvandieu"];

    const LOCAL_REGIONS = Array.isArray(CONFIG.localRegions)
        ? CONFIG.localRegions
        : ["Mare-Rouge", "Môle-Saint-Nicolas", "Port-de-Paix"];

    const COMPETITION_LEVELS = Array.isArray(CONFIG.competitionLevels)
        ? CONFIG.competitionLevels
        : [];

    const $ = id => document.getElementById(id);

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const random = (min, max) => min + Math.random() * (max - min);
    const pick = list => list[Math.floor(Math.random() * list.length)];

    const distance2D = (a, b) =>
        Math.hypot(a.x - b.x, a.z - b.z);

    const escapeHTML = value =>
        String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    const state = {
        pc: null,
        app: null,
        camera: null,
        cameraTarget: null,
        fieldEntity: null,
        ball: null,
        players: [],
        homePlayers: [],
        awayPlayers: [],
        teams: [],
        selectedHome: null,
        selectedAway: null,
        controlledPlayer: null,

        activeScreen: "mainMenu",
        matchStarted: false,
        paused: false,
        matchFinished: false,
        initialized: false,
        engineBusy: false,

        scoreHome: 0,
        scoreAway: 0,
        elapsed: 0,
        matchLength: 360,
        half: 1,
        lastGoalTime: -10,
        lastSaveTime: 0,

        cameraZoom: 1,
        cameraMode: 0,
        cameraSensitivity: 0.5,

        joystickX: 0,
        joystickY: 0,
        joystickActive: false,
        sprinting: false,
        defending: false,

        ballVelocity: { x: 0, y: 0, z: 0 },
        ballOwner: null,
        lastTouchTeam: null,
        lastTouchPlayer: null,

        difficulty: "normal",
        formation: "433",
        tacticalStyle: "balanced",
        pressure: "medium",

        soundEnabled: true,
        soundVolume: 0.7,
        audioContext: null,

        settings: {},
        profile: {
            name: "Joueur FOBAS",
            favoriteTeam: "mare-rouge",
            matchesPlayed: 0,
            goalsScored: 0,
            trophies: 0
        },

        equipment: {
            kits: "classic",
            balls: "classic",
            boots: "classic"
        },

        selectedEquipmentTab: "kits",
        selectedEquipment: null,
        currentCompetition: "local",
        currentStadium: "Stade FOBAS",
        announcementTimer: 0,
        aiTimer: 0,
        refereeTimer: 0,
        matchStatsUpdated: false
    };

    const FIELD = {
        width: 62,
        length: 100,
        halfWidth: 31,
        halfLength: 50,
        goalWidth: 14,
        goalDepth: 3,
        penaltyWidth: 34,
        penaltyDepth: 16
    };

    const COLORS = {
        grass: newColor(0.07, 0.36, 0.16),
        grassAlt: newColor(0.09, 0.41, 0.18),
        line: newColor(0.94, 0.97, 0.91),
        home: newColor(0.04, 0.28, 0.96),
        away: newColor(0.92, 0.08, 0.07),
        skin: newColor(0.67, 0.43, 0.28),
        dark: newColor(0.025, 0.04, 0.075),
        gold: newColor(1, 0.7, 0.12),
        ball: newColor(0.96, 0.96, 0.91)
    };

    function newColor(r, g, b) {
        return { r, g, b };
    }

    function pcColor(c) {
        return new state.pc.Color(c.r, c.g, c.b);
    }

    /* ========================================================
       2. DOM ET INTERFACE
    ======================================================== */

    function showScreen(screenId) {
        const screens = [
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

        screens.forEach(id => {
            const el = $(id);
            if (el) el.classList.toggle("hidden", id !== screenId);
        });

        state.activeScreen = screenId;

        if (screenId === "matchScreen") {
            resizeCanvas();
            updateCamera(true);
        }

        if (screenId === "mainMenu") {
            updateProfileUI();
        }

        if (screenId === "teamsScreen") renderTeams();
        if (screenId === "equipmentScreen") renderEquipment();
        if (screenId === "championshipScreen") renderChampionships();
        if (screenId === "tournamentScreen") renderTournaments();

        saveStatus("Écran : " + screenId);
    }

    function toast(message, duration = 2600) {
        const container = $("toastContainer");
        if (!container) return;

        const item = document.createElement("div");
        item.className = "fobas-toast";
        item.textContent = message;

        Object.assign(item.style, {
            padding: "11px 15px",
            margin: "6px",
            borderRadius: "12px",
            background: "#10243b",
            color: "#fff",
            border: "1px solid rgba(255,255,255,.18)",
            boxShadow: "0 8px 25px rgba(0,0,0,.28)",
            fontSize: "13px",
            maxWidth: "330px",
            pointerEvents: "auto"
        });

        container.appendChild(item);

        window.setTimeout(() => {
            item.style.opacity = "0";
            item.style.transition = "opacity .25s";
            window.setTimeout(() => item.remove(), 300);
        }, duration);
    }

    function saveStatus(message) {
        const el = $("saveStatusLabel");
        if (el) el.textContent = message;
    }

    function setLoading(percent, message) {
        const value = clamp(percent, 0, 100);
        const bar = $("loadingProgressBar");
        const track = $("loadingProgressTrack");
        const label = $("loadingPercent");
        const msg = $("loadingMessage");

        if (bar) bar.style.width = value + "%";
        if (track) track.setAttribute("aria-valuenow", String(value));
        if (label) label.textContent = Math.round(value) + " %";
        if (msg) msg.textContent = message || "Chargement...";
    }

    function finishLoading() {
        setLoading(100, "FOBAS FOOTBALL est prêt.");

        window.setTimeout(() => {
            const loading = $("loadingScreen");
            if (loading) loading.classList.add("hidden");

            showScreen("mainMenu");

            const header = $("topHeader");
            const footer = $("appFooter");

            if (header) header.style.display = "";
            if (footer) footer.style.display = "";
        }, 250);
    }

    function showDialog(title, content, buttons = []) {
        const overlay = $("dialogOverlay");
        const titleEl = $("dialogTitle");
        const contentEl = $("dialogContent");
        const actionsEl = $("dialogActions");

        if (!overlay || !titleEl || !contentEl || !actionsEl) return;

        titleEl.textContent = title;
        contentEl.innerHTML = content;
        actionsEl.replaceChildren();

        buttons.forEach(button => {
            const el = document.createElement("button");
            el.type = "button";
            el.className = button.className || "ui-button button-secondary";
            el.textContent = button.label;

            el.addEventListener("click", () => {
                if (typeof button.action === "function") button.action();
            });

            actionsEl.appendChild(el);
        });

        overlay.classList.remove("hidden");
    }

    function closeDialog() {
        const overlay = $("dialogOverlay");
        if (overlay) overlay.classList.add("hidden");
    }

    function announce(title, message, duration = 3200) {
        const box = $("matchAnnouncement");
        const titleEl = $("announcementTitle");
        const messageEl = $("announcementMessage");

        if (!box) return;

        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;

        box.classList.remove("hidden");
        state.announcementTimer = duration / 1000;

        if (state.settings.commentary !== false) {
            refereeSay(message);
        }
    }

    function updateAnnouncement(dt) {
        if (state.announcementTimer <= 0) return;

        state.announcementTimer -= dt;

        if (state.announcementTimer <= 0) {
            const box = $("matchAnnouncement");
            if (box) box.classList.add("hidden");
        }
    }

    /* ========================================================
       3. SAUVEGARDE INDEXEDDB
    ======================================================== */

    let databasePromise = null;

    function openDatabase() {
        if (databasePromise) return databasePromise;

        databasePromise = new Promise(resolve => {
            if (!("indexedDB" in window)) {
                resolve(null);
                return;
            }

            let request;

            try {
                request = indexedDB.open(DB_NAME, DB_VERSION);
            } catch {
                resolve(null);
                return;
            }

            request.onupgradeneeded = () => {
                const db = request.result;

                if (!db.objectStoreNames.contains("saves")) {
                    db.createObjectStore("saves", { keyPath: "id" });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
            request.onblocked = () => resolve(null);
        });

        return databasePromise;
    }

    async function dbWrite(id, data) {
        const db = await openDatabase();

        if (!db) {
            try {
                localStorage.setItem("FOBAS_FOOTBALL_" + id, JSON.stringify(data));
                return true;
            } catch {
                return false;
            }
        }

        return new Promise(resolve => {
            try {
                const tx = db.transaction("saves", "readwrite");
                tx.objectStore("saves").put({
                    id,
                    data,
                    updatedAt: Date.now()
                });

                tx.oncomplete = () => resolve(true);
                tx.onerror = () => resolve(false);
                tx.onabort = () => resolve(false);
            } catch {
                resolve(false);
            }
        });
    }

    async function dbRead(id) {
        const db = await openDatabase();

        if (!db) {
            try {
                const raw = localStorage.getItem("FOBAS_FOOTBALL_" + id);
                return raw ? JSON.parse(raw) : null;
            } catch {
                return null;
            }
        }

        return new Promise(resolve => {
            try {
                const request = db.transaction("saves", "readonly")
                    .objectStore("saves")
                    .get(id);

                request.onsuccess = () => {
                    resolve(request.result ? request.result.data : null);
                };

                request.onerror = () => resolve(null);
            } catch {
                resolve(null);
            }
        });
    }

    function createSaveData() {
        return {
            version: CONFIG.version || "1.0.0",
            savedAt: Date.now(),

            profile: state.profile,
            settings: state.settings,
            equipment: state.equipment,

            currentCompetition: state.currentCompetition,
            currentStadium: state.currentStadium,

            match: {
                started: state.matchStarted,
                paused: state.paused,
                finished: state.matchFinished,
                scoreHome: state.scoreHome,
                scoreAway: state.scoreAway,
                elapsed: state.elapsed,
                half: state.half,
                homeTeam: state.selectedHome ? state.selectedHome.id : null,
                awayTeam: state.selectedAway ? state.selectedAway.id : null,
                ballX: state.ball ? state.ball.getPosition().x : 0,
                ballZ: state.ball ? state.ball.getPosition().z : 0
            }
        };
    }

    async function saveAll(showMessage = true) {
        const ok = await dbWrite("main", createSaveData());

        state.lastSaveTime = Date.now();
        saveStatus(ok ? "Sauvegardé à " + new Date().toLocaleTimeString() : "Sauvegarde indisponible");

        if (showMessage) {
            toast(ok ? "Progression sauvegardée." : "Impossible de sauvegarder.");
        }

        return ok;
    }

    async function loadAll() {
        const data = await dbRead("main");
        if (!data || typeof data !== "object") return;

        if (data.profile) {
            state.profile = { ...state.profile, ...data.profile };
        }

        if (data.settings) {
            state.settings = { ...data.settings, ...state.settings };
        }

        if (data.equipment) {
            state.equipment = { ...state.equipment, ...data.equipment };
        }

        state.currentCompetition = data.currentCompetition || "local";
        state.currentStadium = data.currentStadium || "Stade FOBAS";

        applySettingsToUI();
        updateProfileUI();

        if (data.match && data.match.started && !data.match.finished) {
            state.pendingMatchRestore = data.match;
        }
    }

    /* ========================================================
       4. GÉNÉRATION DES ÉQUIPES
    ======================================================== */

    const WORLD_REGIONS = {
        northwest: [
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
        ],

        haiti: [
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
            "Limbé",
            "Ouanaminthe",
            "Carrefour",
            "Pétion-Ville"
        ],

        caribbean: [
            "Kingston",
            "Montego Bay",
            "Santo Domingo",
            "Santiago de Cuba",
            "San Juan",
            "Bridgetown",
            "Castries",
            "Roseau",
            "Nassau",
            "Port of Spain",
            "Oranjestad",
            "Willemstad"
        ],

        americas: [
            "Miami",
            "New York",
            "Los Angeles",
            "Montréal",
            "Toronto",
            "Mexico City",
            "São Paulo",
            "Rio de Janeiro",
            "Buenos Aires",
            "Bogotá",
            "Lima",
            "Kingstown"
        ],

        europe: [
            "Paris",
            "Madrid",
            "Barcelona",
            "London",
            "Manchester",
            "Lisbon",
            "Rome",
            "Milan",
            "Munich",
            "Amsterdam",
            "Brussels",
            "Dortmund"
        ],

        africa: [
            "Dakar",
            "Abidjan",
            "Lagos",
            "Accra",
            "Casablanca",
            "Tunis",
            "Cairo",
            "Nairobi",
            "Johannesburg",
            "Yaoundé",
            "Kinshasa",
            "Bamako"
        ],

        international: [
            "Tokyo",
            "Seoul",
            "Sydney",
            "Doha",
            "Istanbul",
            "Riyadh",
            "Dubai",
            "Singapore",
            "Bangkok",
            "Melbourne"
        ]
    };

    const TEAM_PREFIXES = [
        "FC", "AS", "SC", "AC", "Racing", "Athletic",
        "Union", "Sporting", "Real", "Olympique"
    ];

    const TEAM_SUFFIXES = [
        "United", "Stars", "Legends", "Warriors",
        "Eagles", "Tigers", "Lions", "Champions",
        "Athletic", "Dynamo", "City", "Rovers"
    ];

    function slugify(text) {
        return String(text)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function generateTeams() {
        const result = [];
        const used = new Set();

        const localNames = [
            "FOBAS Mare-Rouge",
            "FOBAS Môle-Saint-Nicolas",
            "Jean-Rabel Football Club",
            "Bombardopolis United",
            "Baie-de-Henne Stars",
            "Port-de-Paix FC",
            "La Tortue Warriors",
            "Bassin-Bleu Athletic",
            "Chansolme Eagles",
            "Saint-Louis-du-Nord FC",
            "Anse-à-Foleur Sporting"
        ];

        localNames.forEach((name, index) => {
            result.push({
                id: slugify(name),
                name,
                region: "northwest",
                location: LOCAL_REGIONS[index] || "Nord-Ouest",
                rating: Math.floor(random(58, 82)),
                color: randomTeamColor(),
                isLocal: true
            });
        });

        const regionKeys = Object.keys(WORLD_REGIONS);

        for (let i = result.length; i < Math.max(100, Number(CONFIG.initialTeamCount) || 100); i++) {
            const region = regionKeys[(i - localNames.length) % regionKeys.length];
            const place = pick(WORLD_REGIONS[region]);

            let name = `${pick(TEAM_PREFIXES)} ${place} ${pick(TEAM_SUFFIXES)}`;

            if (used.has(name)) {
                name += " " + (i + 1);
            }

            used.add(name);

            result.push({
                id: slugify(name) + "-" + i,
                name,
                region,
                location: place,
                rating: Math.floor(random(52, 94)),
                color: randomTeamColor(),
                isLocal: false
            });
        }

        return result;
    }

    function randomTeamColor() {
        const palette = [
            "#075be8",
            "#d71d28",
            "#16a05d",
            "#ffb21b",
            "#7136ce",
            "#eeeeee",
            "#101820",
            "#ff6b21",
            "#009eac",
            "#e6469a"
        ];

        return pick(palette);
    }

    function getTeamById(id) {
        return state.teams.find(team => team.id === id) || state.teams[0];
    }

    function populateTeamSelects() {
        const home = $("homeTeamSelect");
        const away = $("awayTeamSelect");
        const favorite = $("profileFavoriteTeam");

        if (home) home.replaceChildren();
        if (away) away.replaceChildren();
        if (favorite) favorite.replaceChildren();

        state.teams.forEach(team => {
            [home, away, favorite].forEach(select => {
                if (!select) return;

                const option = document.createElement("option");
                option.value = team.id;
                option.textContent = team.name;
                select.appendChild(option);
            });
        });

        if (home) home.value = state.teams[0]?.id || "";
        if (away) away.value = state.teams[1]?.id || "";
        if (favorite) favorite.value = state.profile.favoriteTeam || state.teams[0]?.id || "";
    }

    function renderTeams() {
        const container = $("teamsList");
        const countLabel = $("teamCountLabel");

        if (!container) return;

        const search = ($("teamSearchInput")?.value || "").trim().toLowerCase();
        const region = $("teamRegionSelect")?.value || "all";

        const filtered = state.teams.filter(team => {
            const matchesSearch =
                team.name.toLowerCase().includes(search) ||
                team.location.toLowerCase().includes(search);

            const matchesRegion = region === "all" || team.region === region;

            return matchesSearch && matchesRegion;
        });

        container.replaceChildren();

        filtered.forEach(team => {
            const card = document.createElement("article");
            card.className = "team-card";

            Object.assign(card.style, {
                padding: "13px",
                margin: "8px 0",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,.13)",
                background: "rgba(12,29,49,.82)",
                display: "flex",
                alignItems: "center",
                gap: "12px"
            });

            card.innerHTML = `
                <span style="
                    width:14px;height:42px;border-radius:8px;
                    background:${escapeHTML(team.color)};
                    flex-shrink:0;
                "></span>

                <div style="flex:1;min-width:0">
                    <strong>${escapeHTML(team.name)}</strong>
                    <div style="font-size:12px;opacity:.75;margin-top:4px">
                        ${escapeHTML(team.location)} · Niveau ${team.rating}
                    </div>
                </div>

                <button type="button" class="ui-button button-secondary"
                    data-home="${escapeHTML(team.id)}">DOM.</button>

                <button type="button" class="ui-button button-secondary"
                    data-away="${escapeHTML(team.id)}">EXT.</button>
            `;

            card.querySelector("[data-home]").addEventListener("click", () => {
                const select = $("homeTeamSelect");
                if (select) select.value = team.id;
                toast(team.name + " sélectionnée à domicile.");
            });

            card.querySelector("[data-away]").addEventListener("click", () => {
                const select = $("awayTeamSelect");
                if (select) select.value = team.id;
                toast(team.name + " sélectionnée à l'extérieur.");
            });

            container.appendChild(card);
        });

        if (countLabel) {
            countLabel.textContent = `${filtered.length} équipe(s) affichée(s) sur ${state.teams.length}`;
        }
    }

    /* ========================================================
       5. COMPÉTITIONS ET TOURNOIS
    ======================================================== */

    function renderChampionships() {
        const container = $("competitionLevelsList");
        if (!container) return;

        container.replaceChildren();

        COMPETITION_LEVELS.forEach((level, index) => {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "competition-level-card";
            card.dataset.level = level.id;

            Object.assign(card.style, {
                width: "100%",
                textAlign: "left",
                padding: "16px",
                margin: "7px 0",
                borderRadius: "14px",
                color: "inherit",
                background: "rgba(12,30,50,.9)",
                border: "1px solid rgba(255,255,255,.15)"
            });

            card.innerHTML = `
                <strong>${index + 1}. ${escapeHTML(level.name)}</strong>
                <p style="margin:7px 0 0;opacity:.75;font-size:13px">
                    ${escapeHTML(level.description || "")}
                </p>
            `;

            card.addEventListener("click", () => {
                state.currentCompetition = level.id;

                const select = $("competitionSelect");
                if (select) select.value = level.id;

                container.querySelectorAll(".competition-level-card")
                    .forEach(item => item.style.outline = "none");

                card.style.outline = "2px solid #f5bd3d";
                toast("Compétition choisie : " + level.name);
            });

            container.appendChild(card);
        });
    }

    function renderTournaments() {
        const container = $("tournamentList");
        if (!container) return;

        const tournaments = [
            ["Coupe FOBAS du Nord-Ouest", "northwest"],
            ["Championnat national d'Haïti", "haiti-national"],
            ["Caribbean Football Cup", "caribbean"],
            ["FOBAS International League", "international"],
            ["Champions Elite Tournament", "champions"]
        ];

        container.replaceChildren();

        tournaments.forEach(([name, level]) => {
            const card = document.createElement("article");
            card.className = "tournament-card";

            Object.assign(card.style, {
                padding: "16px",
                margin: "9px 0",
                borderRadius: "14px",
                background: "rgba(12,30,50,.88)",
                border: "1px solid rgba(255,255,255,.13)"
            });

            card.innerHTML = `
                <strong>${escapeHTML(name)}</strong>
                <p style="opacity:.7;font-size:13px">Compétition : ${escapeHTML(level)}</p>
                <button type="button" class="ui-button button-secondary">SÉLECTIONNER</button>
            `;

            card.querySelector("button").addEventListener("click", () => {
                state.currentCompetition = level;

                if ($("competitionSelect")) {
                    $("competitionSelect").value = level;
                }

                toast(name + " sélectionné.");
            });

            container.appendChild(card);
        });
    }

    /* ========================================================
       6. PROFIL, PARAMÈTRES ET ÉQUIPEMENT
    ======================================================== */

    function updateProfileUI() {
        const fields = {
            profileNameInput: state.profile.name,
            profileFavoriteTeam: state.profile.favoriteTeam,
            profileMatchesPlayed: state.profile.matchesPlayed,
            profileGoalsScored: state.profile.goalsScored,
            profileTrophies: state.profile.trophies
        };

        Object.entries(fields).forEach(([id, value]) => {
            const el = $(id);
            if (el && document.activeElement !== el) el.value = value ?? "";
            if (el && (id === "profileMatchesPlayed" || id === "profileGoalsScored" || id === "profileTrophies")) {
                el.textContent = String(value ?? 0);
            }
        });
    }

    async function saveProfile() {
        state.profile.name = ($("profileNameInput")?.value || "Joueur FOBAS").trim();
        state.profile.favoriteTeam = $("profileFavoriteTeam")?.value || "";

        await saveAll(false);
        updateProfileUI();
        toast("Profil sauvegardé.");
    }

    function applySettingsToUI() {
        const s = state.settings;

        if ($("graphicsQualitySelect") && s.graphicsQuality) {
            $("graphicsQualitySelect").value = s.graphicsQuality;
        }

        if ($("soundVolumeInput")) {
            $("soundVolumeInput").value = s.soundVolume ?? Math.round(state.soundVolume * 100);
        }

        if ($("cameraSensitivityInput")) {
            $("cameraSensitivityInput").value = s.cameraSensitivity ?? 50;
        }

        if ($("matchDifficultySelect")) {
            $("matchDifficultySelect").value = s.difficulty || state.difficulty;
        }

        if ($("vibrationToggle")) {
            $("vibrationToggle").checked = s.vibration !== false;
        }

        if ($("commentaryToggle")) {
            $("commentaryToggle").checked = s.commentary !== false;
        }
    }

    async function saveSettings() {
        state.settings.graphicsQuality = $("graphicsQualitySelect")?.value || "medium";
        state.settings.soundVolume = Number($("soundVolumeInput")?.value ?? 70);
        state.settings.cameraSensitivity = Number($("cameraSensitivityInput")?.value ?? 50);
        state.settings.difficulty = $("matchDifficultySelect")?.value || "normal";
        state.settings.vibration = $("vibrationToggle")?.checked !== false;
        state.settings.commentary = $("commentaryToggle")?.checked !== false;

        state.difficulty = state.settings.difficulty;
        state.soundVolume = clamp(state.settings.soundVolume / 100, 0, 1);
        state.cameraSensitivity = clamp(state.settings.cameraSensitivity / 100, 0.01, 1);

        if (state.pc && state.app) {
            const quality = state.settings.graphicsQuality;

            try {
                state.app.graphicsDevice.maxPixelRatio =
                    quality === "high" ? Math.min(window.devicePixelRatio || 1, 2) :
                    quality === "low" ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
            } catch {
                /* Certaines versions du moteur ne permettent pas cette modification. */
            }
        }

        await saveAll(false);
        toast("Paramètres enregistrés.");
    }

    const EQUIPMENT = {
        kits: [
            { id: "classic", name: "Maillot classique", description: "Tenue traditionnelle FOBAS" },
            { id: "royal", name: "Tenue royale", description: "Maillot bleu royal" },
            { id: "ocean", name: "Tenue océan", description: "Maillot bleu océan" },
            { id: "fire", name: "Tenue feu", description: "Maillot rouge intense" },
            { id: "gold", name: "Tenue champions", description: "Maillot or" }
        ],

        balls: [
            { id: "classic", name: "Ballon classique", description: "Ballon de football standard" },
            { id: "gold", name: "Ballon doré", description: "Ballon spécial champions" },
            { id: "ocean", name: "Ballon océan", description: "Ballon bleu" },
            { id: "fire", name: "Ballon feu", description: "Ballon rouge" }
        ],

        boots: [
            { id: "classic", name: "Chaussures classiques", description: "Chaussures de match" },
            { id: "speed", name: "Chaussures vitesse", description: "Pour les accélérations" },
            { id: "control", name: "Chaussures contrôle", description: "Pour les passes précises" },
            { id: "power", name: "Chaussures puissance", description: "Pour les tirs puissants" }
        ]
    };

    function renderEquipment() {
        const container = $("equipmentItemsList");
        if (!container) return;

        const items = EQUIPMENT[state.selectedEquipmentTab] || EQUIPMENT.kits;
        container.replaceChildren();

        items.forEach(item => {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "equipment-item";
            card.dataset.item = item.id;

            Object.assign(card.style, {
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "15px",
                margin: "8px 0",
                color: "inherit",
                background: "rgba(12,30,50,.88)",
                border: "1px solid rgba(255,255,255,.14)",
                borderRadius: "13px"
            });

            const active = state.equipment[state.selectedEquipmentTab] === item.id;

            card.innerHTML = `
                <strong>${active ? "✓ " : ""}${escapeHTML(item.name)}</strong>
                <p style="opacity:.7;font-size:13px;margin:6px 0 0">
                    ${escapeHTML(item.description)}
                </p>
            `;

            card.addEventListener("click", () => {
                state.selectedEquipment = item.id;

                container.querySelectorAll(".equipment-item")
                    .forEach(el => el.style.borderColor = "rgba(255,255,255,.14)");

                card.style.borderColor = "#f5bd3d";
            });

            container.appendChild(card);
        });
    }

    async function applyEquipment() {
        if (!state.selectedEquipment) {
            toast("Choisissez un équipement avant de l'appliquer.");
            return;
        }

        state.equipment[state.selectedEquipmentTab] = state.selectedEquipment;

        if (state.selectedEquipmentTab === "kits" && state.app) {
            updatePlayerKitMaterials();
        }

        if (state.selectedEquipmentTab === "balls" && state.ball) {
            updateBallMaterial();
        }

        await saveAll(false);
        renderEquipment();
        toast("Équipement appliqué.");
    }

    function updatePlayerKitMaterials() {
        const kit = state.equipment.kits;

        let home = newColor(0.04, 0.28, 0.96);
        let away = newColor(0.92, 0.08, 0.07);

        if (kit === "royal") home = newColor(0.06, 0.12, 0.65);
        if (kit === "ocean") home = newColor(0.02, 0.55, 0.75);
        if (kit === "fire") home = newColor(0.9, 0.08, 0.06);
        if (kit === "gold") home = newColor(0.95, 0.62, 0.06);

        state.homePlayers.forEach(p => {
            p.teamColor = home;
            recolorEntity(p.parts.shirt, home);
        });

        state.awayPlayers.forEach(p => {
            p.teamColor = away;
            recolorEntity(p.parts.shirt, away);
        });
    }

    function recolorEntity(entity, color) {
        if (!entity || !entity.render || !entity.render.meshInstances.length) return;

        const material = makeMaterial(color);
        entity.render.meshInstances.forEach(instance => {
            instance.material = material;
        });
    }

    /* ========================================================
       7. INITIALISATION PLAYCANVAS
    ======================================================== */

    async function initializeEngine() {
        if (state.engineBusy) return state.initialized;
        state.engineBusy = true;

        setLoading(8, "Chargement de PlayCanvas 3D...");

        try {
            const pc = await import(
                "https://cdn.jsdelivr.net/npm/playcanvas@2.23.2/build/playcanvas.mjs"
            );

            state.pc = pc;

            setLoading(22, "Création du moteur graphique...");

            const canvas = $("footballCanvas");

            if (!canvas) {
                throw new Error("Le canvas #footballCanvas est absent du HTML.");
            }

            const app = new pc.Application(canvas, {
                mouse: new pc.Mouse(canvas),
                touch: new pc.TouchDevice(canvas),
                keyboard: new pc.Keyboard(window),
                graphicsDeviceOptions: {
                    antialias: true,
                    alpha: false,
                    preserveDrawingBuffer: false,
                    powerPreference: "high-performance"
                }
            });

            state.app = app;

            app.setCanvasFillMode(pc.FILLMODE_NONE);
            app.setCanvasResolution(pc.RESOLUTION_AUTO);

            try {
                app.graphicsDevice.maxPixelRatio =
                    Math.min(window.devicePixelRatio || 1, 1.5);
            } catch {
                /* Facultatif. */
            }

            app.scene.ambientLight = new pc.Color(0.68, 0.72, 0.76);

            const camera = new pc.Entity("FOBAS Main Camera");
            camera.addComponent("camera", {
                clearColor: new pc.Color(0.42, 0.62, 0.79),
                fov: 53,
                nearClip: 0.1,
                farClip: 500,
                frustumCulling: true
            });

            app.root.addChild(camera);
            state.camera = camera;

            const light = new pc.Entity("FOBAS Sun");
            light.addComponent("light", {
                type: "directional",
                color: new pc.Color(1, 0.96, 0.86),
                intensity: 1.65,
                castShadows: true,
                shadowResolution: 1024,
                shadowDistance: 150
            });

            light.setEulerAngles(42, 28, 0);
            app.root.addChild(light);

            const fillLight = new pc.Entity("FOBAS Fill Light");
            fillLight.addComponent("light", {
                type: "directional",
                color: new pc.Color(0.68, 0.78, 1),
                intensity: 0.35,
                castShadows: false
            });

            fillLight.setEulerAngles(25, -135, 0);
            app.root.addChild(fillLight);

            setLoading(35, "Construction du terrain...");
            createStadium();

            setLoading(55, "Création des joueurs 3D...");
            createInitialTeams();

            setLoading(72, "Création du ballon et de la caméra...");
            createBall();
            updateCamera(true);

            app.on("update", updateGame);

            app.start();

            state.initialized = true;
            state.engineBusy = false;

            const status = $("engineStatus");
            if (status) status.textContent = "Moteur 3D actif · PlayCanvas";

            window.addEventListener("resize", resizeCanvas);
            resizeCanvas();

            setLoading(84, "Chargement des sauvegardes...");
            await loadAll();

            setLoading(94, "Préparation des commandes...");
            wireUI();

            window.setInterval(() => {
                saveAll(false);
            }, 10 * 60 * 1000);

            window.setTimeout(finishLoading, 300);

            return true;
        } catch (error) {
            state.engineBusy = false;

            console.error("[FOBAS FOOTBALL] Erreur moteur :", error);

            setLoading(
                0,
                "Le moteur 3D n'a pas pu démarrer. Vérifiez Internet puis réessayez."
            );

            const retry = $("retryLoadingBtn");
            if (retry) retry.classList.remove("hidden");

            const status = $("engineStatus");
            if (status) {
                status.textContent = "Erreur du moteur 3D : " + (error.message || "inconnue");
            }

            toast("Erreur de chargement du moteur 3D.");
            return false;
        }
    }

    function resizeCanvas() {
        if (!state.app) return;

        const canvas = $("footballCanvas");
        const viewport = $("pitchViewport");

        if (!canvas || !viewport) return;

        const width = Math.max(1, viewport.clientWidth);
        const height = Math.max(1, viewport.clientHeight);

        if (canvas.width !== Math.round(width * (window.devicePixelRatio || 1)) ||
            canvas.height !== Math.round(height * (window.devicePixelRatio || 1))) {
            state.app.resizeCanvas(width, height);
        }
    }

    /* ========================================================
       8. MATÉRIAUX ET OBJETS 3D
    ======================================================== */

    function makeMaterial(color, options = {}) {
        const pc = state.pc;
        const material = new pc.StandardMaterial();

        material.diffuse = pcColor(color);
        material.metalness = options.metalness ?? 0;
        material.gloss = options.gloss ?? 25;

        if (options.emissive) {
            material.emissive = pcColor(options.emissive);
        }

        material.update();
        return material;
    }

    function createBox(name, position, scale, color, parent = null) {
        const pc = state.pc;
        const entity = new pc.Entity(name);

        entity.addComponent("render", {
            type: "box",
            material: makeMaterial(color)
        });

        entity.setLocalPosition(position.x, position.y, position.z);
        entity.setLocalScale(scale.x, scale.y, scale.z);

        (parent || state.app.root).addChild(entity);
        return entity;
    }

    function createSphere(name, position, scale, color, parent = null) {
        const pc = state.pc;
        const entity = new pc.Entity(name);

        entity.addComponent("render", {
            type: "sphere",
            material: makeMaterial(color)
        });

        entity.setLocalPosition(position.x, position.y, position.z);
        entity.setLocalScale(scale.x, scale.y, scale.z);

        (parent || state.app.root).addChild(entity);
        return entity;
    }

    function createCylinder(name, position, scale, color, parent = null) {
        const pc = state.pc;
        const entity = new pc.Entity(name);

        entity.addComponent("render", {
            type: "cylinder",
            material: makeMaterial(color)
        });

        entity.setLocalPosition(position.x, position.y, position.z);
        entity.setLocalScale(scale.x, scale.y, scale.z);

        (parent || state.app.root).addChild(entity);
        return entity;
    }

    function createStadium() {
        const grassA = newColor(0.08, 0.37, 0.15);
        const grassB = newColor(0.10, 0.42, 0.18);
        const white = newColor(0.94, 0.96, 0.9);
        const dark = newColor(0.09, 0.12, 0.16);
        const seatA = newColor(0.10, 0.24, 0.42);
        const seatB = newColor(0.8, 0.12, 0.08);

        state.fieldEntity = new state.pc.Entity("FOBAS Stadium");
        state.app.root.addChild(state.fieldEntity);

        createBox(
            "Stadium Ground",
            { x: 0, y: -0.35, z: 0 },
            { x: 150, y: 0.5, z: 170 },
            newColor(0.13, 0.15, 0.17),
            state.fieldEntity
        );

        createBox(
            "Football Pitch",
            { x: 0, y: -0.04, z: 0 },
            { x: FIELD.width, y: 0.12, z: FIELD.length },
            grassA,
            state.fieldEntity
        );

        /* Bandes de gazon */
        const stripeWidth = FIELD.width / 10;

        for (let i = 0; i < 10; i++) {
            if (i % 2 === 0) continue;

            createBox(
                "Grass Stripe " + i,
                {
                    x: -FIELD.halfWidth + stripeWidth * i + stripeWidth / 2,
                    y: 0.025,
                    z: 0
                },
                { x: stripeWidth, y: 0.025, z: FIELD.length - 0.15 },
                grassB,
                state.fieldEntity
            );
        }

        const lineY = 0.075;
        const lineH = 0.025;

        function line(name, x, z, sx, sz) {
            return createBox(
                name,
                { x, y: lineY, z },
                { x: sx, y: lineH, z: sz },
                white,
                state.fieldEntity
            );
        }

        /* Lignes extérieures */
        line("Touchline Left", -FIELD.halfWidth, 0, 0.18, FIELD.length);
        line("Touchline Right", FIELD.halfWidth, 0, 0.18, FIELD.length);
        line("Goal Line Home", 0, -FIELD.halfLength, FIELD.width, 0.18);
        line("Goal Line Away", 0, FIELD.halfLength, FIELD.width, 0.18);

        /* Ligne centrale et cercle */
        line("Halfway Line", 0, 0, FIELD.width, 0.18);

        const circleRadius = 9.2;
        const segments = 64;

        for (let i = 0; i < segments; i++) {
            const angle1 = (i / segments) * Math.PI * 2;
            const angle2 = ((i + 1) / segments) * Math.PI * 2;

            const x1 = Math.cos(angle1) * circleRadius;
            const z1 = Math.sin(angle1) * circleRadius;
            const x2 = Math.cos(angle2) * circleRadius;
            const z2 = Math.sin(angle2) * circleRadius;

            const mx = (x1 + x2) / 2;
            const mz = (z1 + z2) / 2;

            const dx = x2 - x1;
            const dz = z2 - z1;
            const length = Math.hypot(dx, dz);

            const segment = createBox(
                "Center Circle Segment " + i,
                { x: mx, y: lineY, z: mz },
                { x: length, y: lineH, z: 0.12 },
                white,
                state.fieldEntity
            );

            segment.setEulerAngles(0, -Math.atan2(dz, dx) * 180 / Math.PI, 0);
        }

        createSphere(
            "Center Spot",
            { x: 0, y: 0.13, z: 0 },
            { x: 0.35, y: 0.1, z: 0.35 },
            white,
            state.fieldEntity
        );

        /* Surfaces de réparation */
        [-1, 1].forEach(side => {
            const z = side * (FIELD.halfLength - FIELD.penaltyDepth / 2);

            line("Penalty Top " + side, 0, z, FIELD.penaltyWidth, 0.15);
            line("Penalty Left " + side, -FIELD.penaltyWidth / 2, side * (FIELD.halfLength - FIELD.penaltyDepth), 0.15, FIELD.penaltyDepth);
            line("Penalty Right " + side, FIELD.penaltyWidth / 2, side * (FIELD.halfLength - FIELD.penaltyDepth), 0.15, FIELD.penaltyDepth);

            const sixZ = side * (FIELD.halfLength - 5.5);

            line("Six Yard Top " + side, 0, sixZ, 17, 0.15);
            line("Six Yard Left " + side, -8.5, side * (FIELD.halfLength - 5.5), 0.15, 5.5);
            line("Six Yard Right " + side, 8.5, side * (FIELD.halfLength - 5.5), 0.15, 5.5);

            createSphere(
                "Penalty Spot " + side,
                { x: 0, y: 0.13, z: side * (FIELD.halfLength - 11) },
                { x: 0.28, y: 0.1, z: 0.28 },
                white,
                state.fieldEntity
            );

            createGoal(side, white);
        });

        /* Gradins stylisés */
        createBox(
            "North Stand",
            { x: 0, y: 4, z: -64 },
            { x: 82, y: 8, z: 7 },
            seatA,
            state.fieldEntity
        );

        createBox(
            "South Stand",
            { x: 0, y: 4, z: 64 },
            { x: 82, y: 8, z: 7 },
            seatB,
            state.fieldEntity
        );

        createBox(
            "West Stand",
            { x: -40, y: 3.2, z: 0 },
            { x: 7, y: 6.4, z: 110 },
            seatA,
            state.fieldEntity
        );

        createBox(
            "East Stand",
            { x: 40, y: 3.2, z: 0 },
            { x: 7, y: 6.4, z: 110 },
            seatB,
            state.fieldEntity
        );

        /* Projecteurs */
        [-1, 1].forEach(xSide => {
            [-1, 1].forEach(zSide => {
                const x = xSide * 48;
                const z = zSide * 58;

                createCylinder(
                    "Floodlight Pole",
                    { x, y: 12, z },
                    { x: 0.45, y: 12, z: 0.45 },
                    dark,
                    state.fieldEntity
                );

                createBox(
                    "Floodlight",
                    { x, y: 24, z },
                    { x: 3.4, y: 0.8, z: 1.5 },
                    newColor(1, 0.94, 0.7),
                    state.fieldEntity
                );
            });
        });
    }

    function createGoal(side, white) {
        const z = side * (FIELD.halfLength + 0.3);
        const postH = 3.2;
        const postW = 0.25;
        const goalW = FIELD.goalWidth;

        createCylinder(
            "Goal Post Left " + side,
            { x: -goalW / 2, y: postH / 2, z },
            { x: postW, y: postH / 2, z: postW },
            white,
            state.fieldEntity
        );

        createCylinder(
            "Goal Post Right " + side,
            { x: goalW / 2, y: postH / 2, z },
            { x: postW, y: postH / 2, z: postW },
            white,
            state.fieldEntity
        );

        createBox(
            "Goal Crossbar " + side,
            { x: 0, y: postH, z },
            { x: goalW, y: 0.22, z: 0.22 },
            white,
            state.fieldEntity
        );

        createBox(
            "Goal Net Back " + side,
            { x: 0, y: postH / 2, z: side * (FIELD.halfLength + 3) },
            { x: goalW, y: postH, z: 0.12 },
            newColor(0.76, 0.83, 0.84),
            state.fieldEntity
        );
    }

    /* ========================================================
       9. JOUEURS 3D
    ======================================================== */

    function createPlayer(team, index, home, x, z) {
        const pc = state.pc;

        const root = new pc.Entity(
            `${team.name} - Joueur ${index + 1}`
        );

        state.app.root.addChild(root);
        root.setPosition(x, 0, z);

        const skinColor = pick([
            newColor(0.26, 0.15, 0.1),
            newColor(0.39, 0.24, 0.16),
            newColor(0.53, 0.34, 0.22),
            newColor(0.68, 0.45, 0.31),
            newColor(0.78, 0.57, 0.4)
        ]);

        const teamColor = hexToColor(team.color);

        const pantsColor = home
            ? newColor(0.07, 0.1, 0.17)
            : newColor(0.94, 0.94, 0.9);

        const shirt = createBox(
            "Shirt " + index,
            { x: 0, y: 1.36, z: 0 },
            { x: 0.78, y: 0.92, z: 0.4 },
            teamColor,
            root
        );

        const torso = createBox(
            "Torso " + index,
            { x: 0, y: 1.45, z: 0 },
            { x: 0.67, y: 0.68, z: 0.36 },
            teamColor,
            root
        );

        const head = createSphere(
            "Head " + index,
            { x: 0, y: 2.15, z: 0 },
            { x: 0.42, y: 0.46, z: 0.4 },
            skinColor,
            root
        );

        const hair = createSphere(
            "Hair " + index,
            { x: 0, y: 2.37, z: -0.015 },
            { x: 0.43, y: 0.2, z: 0.41 },
            newColor(0.075, 0.055, 0.045),
            root
        );

        const shorts = createBox(
            "Shorts " + index,
            { x: 0, y: 0.86, z: 0 },
            { x: 0.63, y: 0.35, z: 0.35 },
            pantsColor,
            root
        );

        const legL = createCylinder(
            "Leg Left " + index,
            { x: -0.2, y: 0.42, z: 0 },
            { x: 0.17, y: 0.43, z: 0.17 },
            pantsColor,
            root
        );

        const legR = createCylinder(
            "Leg Right " + index,
            { x: 0.2, y: 0.42, z: 0 },
            { x: 0.17, y: 0.43, z: 0.17 },
            pantsColor,
            root
        );

        const bootL = createBox(
            "Boot Left " + index,
            { x: -0.2, y: 0.13, z: 0.13 },
            { x: 0.2, y: 0.15, z: 0.36 },
            newColor(0.035, 0.035, 0.04),
            root
        );

        const bootR = createBox(
            "Boot Right " + index,
            { x: 0.2, y: 0.13, z: 0.13 },
            { x: 0.2, y: 0.15, z: 0.36 },
            newColor(0.035, 0.035, 0.04),
            root
        );

        const armL = createCylinder(
            "Arm Left " + index,
            { x: -0.48, y: 1.36, z: 0 },
            { x: 0.14, y: 0.39, z: 0.14 },
            skinColor,
            root
        );

        const armR = createCylinder(
            "Arm Right " + index,
            { x: 0.48, y: 1.36, z: 0 },
            { x: 0.14, y: 0.39, z: 0.14 },
            skinColor,
            root
        );

        /* Numéro sur le maillot : panneau lisible de face */
        const numberPlate = createBox(
            "Jersey Number Plate " + index,
            { x: 0, y: 1.48, z: 0.211 },
            { x: 0.31, y: 0.35, z: 0.025 },
            newColor(0.96, 0.96, 0.92),
            root
        );

        const numberColor = makeMaterial(
            home ? newColor(0.04, 0.1, 0.25) : newColor(0.65, 0.04, 0.04)
        );

        const numberEntity = new pc.Entity("Numéro " + (index + 1));

        numberEntity.addComponent("render", {
            type: "box",
            material: numberColor
        });

        numberEntity.setLocalPosition(0, 1.48, 0.23);
        numberEntity.setLocalScale(0.17, 0.23, 0.018);
        root.addChild(numberEntity);

        const shadow = createSphere(
            "Player Shadow " + index,
            { x: 0, y: 0.045, z: 0 },
            { x: 0.55, y: 0.04, z: 0.42 },
            newColor(0.035, 0.075, 0.035),
            root
        );

        shadow.render.castShadows = false;

        const player = {
            id: `${home ? "H" : "A"}-${index + 1}`,
            name: PLAYER_NAMES[(index + (home ? 0 : 11)) % PLAYER_NAMES.length],
            number: index + 1,
            home,
            team,
            teamColor,
            root,

            parts: {
                shirt,
                torso,
                head,
                hair,
                shorts,
                legL,
                legR,
                bootL,
                bootR,
                armL,
                armR,
                numberPlate,
                numberEntity,
                shadow
            },

            x,
            z,
            vx: 0,
            vz: 0,
            speed: random(5.5, 7.5),
            stamina: 100,
            keeper: index === 0,
            targetX: x,
            targetZ: z,
            aiThink: random(0.1, 0.8),
            kickCooldown: 0,
            animTime: random(0, 6),
            direction: home ? 1 : -1,
            hasBall: false
        };

        return player;
    }

    function hexToColor(hex) {
        const value = String(hex || "#075be8").replace("#", "");
        const full = value.length === 3
            ? value.split("").map(c => c + c).join("")
            : value;

        const n = parseInt(full, 16);

        if (!Number.isFinite(n)) return newColor(0.05, 0.3, 0.9);

        return newColor(
            ((n >> 16) & 255) / 255,
            ((n >> 8) & 255) / 255,
            (n & 255) / 255
        );
    }

    function createInitialTeams() {
        state.teams = generateTeams();

        state.selectedHome = state.teams[0];
        state.selectedAway = state.teams[1];

        populateTeamSelects();

        createPlayersForMatch();

        renderTeams();
        renderChampionships();
        renderTournaments();
        renderEquipment();
    }

    function createPlayersForMatch() {
        if (!state.app) return;

        state.players.forEach(player => {
            if (player.root && player.root.destroy) player.root.destroy();
        });

        state.players = [];
        state.homePlayers = [];
        state.awayPlayers = [];

        const home = state.selectedHome || state.teams[0];
        const away = state.selectedAway || state.teams[1];

        state.selectedHome = home;
        state.selectedAway = away;

        const formations = {
            "442": [
                [0, 0],
                [-20, -11], [-7, -13], [7, -13], [20, -11],
                [-20, -1], [-7, -1], [7, -1], [20, -1],
                [-9, 11], [9, 11]
            ],

            "433": [
                [0, 0],
                [-22, -12], [-8, -14], [8, -14], [22, -12],
                [-15, 0], [0, -2], [15, 0],
                [-17, 12], [0, 16], [17, 12]
            ],

            "352": [
                [0, 0],
                [-18, -13], [0, -14], [18, -13],
                [-24, -1], [-11, -2], [0, -4], [11, -2], [24, -1],
                [-10, 13], [10, 13]
            ],

            "4231": [
                [0, 0],
                [-21, -12], [-7, -14], [7, -14], [21, -12],
                [-10, -2], [10, -2],
                [-17, 8], [0, 7], [17, 8],
                [0, 17]
            ],

            "541": [
                [0, 0],
                [-23, -13], [-12, -14], [0, -15], [12, -14], [23, -13],
                [-20, -1], [-7, -2], [7, -2], [20, -1],
                [0, 17]
            ]
        };

        const formation = formations[state.formation] || formations["433"];

        for (let i = 0; i < 11; i++) {
            const [x, z] = formation[i];

            const player = createPlayer(
                home,
                i,
                true,
                x,
                z
            );

            player.targetX = x;
            player.targetZ = z;

            state.homePlayers.push(player);
            state.players.push(player);
        }

        for (let i = 0; i < 11; i++) {
            const [x, z] = formation[i];

            const player = createPlayer(
                away,
                i,
                false,
                x,
                -z
            );

            player.direction = -1;
            player.targetX = x;
            player.targetZ = -z;

            state.awayPlayers.push(player);
            state.players.push(player);
        }

        state.controlledPlayer = state.homePlayers[9] || state.homePlayers[0];

        if (state.controlledPlayer) {
            state.controlledPlayer.root.name = "JOUEUR CONTRÔLÉ — " + state.controlledPlayer.name;
        }

        updatePlayerKitMaterials();
    }

    /* ========================================================
       10. BALLON
    ======================================================== */

    function createBall() {
        if (!state.app) return;

        if (state.ball && state.ball.destroy) {
            state.ball.destroy();
        }

        state.ball = createSphere(
            "FOBAS Football",
            { x: 0, y: 0.6, z: 0 },
            { x: 0.72, y: 0.72, z: 0.72 },
            COLORS.ball
        );

        state.ballVelocity = { x: 0, y: 0, z: 0 };
        state.ballOwner = null;
    }

    function updateBallMaterial() {
        if (!state.ball) return;

        const type = state.equipment.balls;

        let color = newColor(0.96, 0.96, 0.91);

        if (type === "gold") color = newColor(1, 0.65, 0.05);
        if (type === "ocean") color = newColor(0.03, 0.45, 0.95);
        if (type === "fire") color = newColor(0.9, 0.08, 0.04);

        recolorEntity(state.ball, color);
    }

    function ballPosition() {
        if (!state.ball) return { x: 0, y: 0.6, z: 0 };

        const p = state.ball.getPosition();
        return { x: p.x, y: p.y, z: p.z };
    }

    function resetBall() {
        if (!state.ball) return;

        state.ball.setPosition(0, 0.6, 0);
        state.ballVelocity = { x: 0, y: 0, z: 0 };
        state.ballOwner = null;
        state.lastTouchPlayer = null;

        state.players.forEach(p => {
            p.hasBall = false;
        });
    }

    /* ========================================================
       11. CAMÉRA
    ======================================================== */

    function updateCamera(immediate = false) {
        if (!state.camera || !state.app) return;

        const controlled = state.controlledPlayer;
        let targetX = controlled ? controlled.x : 0;
        let targetZ = controlled ? controlled.z : 0;

        if (state.cameraMode === 1) {
            targetX = 0;
            targetZ = 0;
        } else if (state.cameraMode === 2 && state.ball) {
            const b = ballPosition();
            targetX = b.x;
            targetZ = b.z;
        }

        const zoom = clamp(state.cameraZoom, 0.6, 2.1);

        const cameraHeight = 27 / zoom;
        const cameraBack = 25 / zoom;

        const desired = new state.pc.Vec3(
            targetX,
            cameraHeight,
            targetZ + cameraBack
        );

        const focus = new state.pc.Vec3(
            targetX,
            0.8,
            targetZ - 5 / zoom
        );

        if (immediate) {
            state.camera.setPosition(desired);
        } else {
            const current = state.camera.getPosition();
            const blend = Math.min(1, 5.5 * (state.app?.deltaTime || 0.016));

            state.camera.setPosition(
                current.x + (desired.x - current.x) * blend,
                current.y + (desired.y - current.y) * blend,
                current.z + (desired.z - current.z) * blend
            );
        }

        state.camera.lookAt(focus);
    }

    function zoomCamera(delta) {
        state.cameraZoom = clamp(state.cameraZoom + delta, 0.6, 2.1);
        updateCamera(true);
    }

    /* ========================================================
       12. COMMANDES DU JOUEUR
    ======================================================== */

    function getControlledPlayer() {
        return state.controlledPlayer || state.homePlayers[9] || state.homePlayers[0];
    }

    function nearestPlayerToBall(players) {
        if (!state.ball || !players.length) return null;

        const b = ballPosition();
        let nearest = null;
        let best = Infinity;

        players.forEach(player => {
            const d = Math.hypot(player.x - b.x, player.z - b.z);

            if (d < best) {
                best = d;
                nearest = player;
            }
        });

        return nearest;
    }

    function switchPlayer() {
        if (!state.matchStarted || !state.homePlayers.length) return;

        const nearest = nearestPlayerToBall(state.homePlayers);

        if (nearest && nearest !== state.controlledPlayer) {
            state.controlledPlayer = nearest;
        } else {
            const index = state.homePlayers.indexOf(state.controlledPlayer);
            state.controlledPlayer = state.homePlayers[(index + 1) % state.homePlayers.length];
        }

        announce(
            "JOUEUR CONTRÔLÉ",
            `${state.controlledPlayer.name} — numéro ${state.controlledPlayer.number}`,
            1800
        );

        updateCamera(true);
    }

    function getForwardDirection(player) {
        return player.home ? -1 : 1;
    }

    function kickBall(player, target, power = 14, lift = 1.2) {
        if (!state.ball || !player) return false;

        const b = ballPosition();
        const dx = target.x - b.x;
        const dz = target.z - b.z;
        const length = Math.max(0.001, Math.hypot(dx, dz));

        state.ballVelocity = {
            x: dx / length * power,
            y: lift,
            z: dz / length * power
        };

        state.ballOwner = null;
        state.lastTouchPlayer = player;
        state.lastTouchTeam = player.home ? "home" : "away";

        player.hasBall = false;
        player.kickCooldown = 0.45;

        soundEffect("kick");
        return true;
    }

    function nearestTeammate(player) {
        const teamPlayers = player.home ? state.homePlayers : state.awayPlayers;
        let best = null;
        let bestScore = Infinity;

        teamPlayers.forEach(other => {
            if (other === player) return;

            const d = Math.hypot(other.x - player.x, other.z - player.z);

            const forwardPenalty = (
                (other.z - player.z) * getForwardDirection(player) < -2
            ) ? 4 : 0;

            const score = d + forwardPenalty;

            if (score < bestScore) {
                bestScore = score;
                best = other;
            }
        });

        return best;
    }

    function doPass() {
        if (!state.matchStarted || state.paused) return;

        const player = getControlledPlayer();
        if (!player) return;

        let teammate = nearestTeammate(player);

        if (state.ballOwner && state.ballOwner !== player) {
            if (distance2D(player, state.ballOwner) > 8) {
                toast("Approchez-vous du ballon pour faire une passe.");
                return;
            }
        }

        if (!teammate) return;

        const target = {
            x: teammate.x,
            z: teammate.z
        };

        if (state.ballOwner && state.ballOwner !== player) {
            state.ballOwner = player;
        }

        const b = ballPosition();

        if (distance2D(player, b) < 4 || state.ballOwner === player) {
            state.ball.setPosition(player.x, 0.55, player.z - 0.65);
            kickBall(player, target, 12, 1.3);
            announce("PASSE", `${player.name} passe à ${teammate.name}.`, 1600);
        } else {
            toast("Le joueur doit se rapprocher du ballon.");
        }
    }

    function doShoot() {
        if (!state.matchStarted || state.paused) return;

        const player = getControlledPlayer();
        if (!player) return;

        const b = ballPosition();

        if (distance2D(player, b) > 4.2 && state.ballOwner !== player) {
            toast("Rapprochez le joueur du ballon pour tirer.");
            return;
        }

        state.ball.setPosition(player.x, 0.55, player.z - 0.55);

        const goalZ = player.home ? -FIELD.halfLength - 1 : FIELD.halfLength + 1;
        const targetX = random(-3.5, 3.5);

        kickBall(
            player,
            { x: targetX, z: goalZ },
            state.difficulty === "expert" ? 25 : 20,
            3.2
        );

        announce("TIR AU BUT", `${player.name} tente sa chance !`, 1600);
    }

    function doDefend() {
        if (!state.matchStarted || state.paused) return;

        state.defending = !state.defending;

        const player = getControlledPlayer();

        if (player) {
            player.speed = state.defending ? 5.8 : 7;
        }

        const btn = $("defendBtn");
        if (btn) btn.classList.toggle("active", state.defending);

        toast(state.defending ? "Posture défensive activée." : "Posture défensive désactivée.");
    }

    function setSprint(active) {
        state.sprinting = active;

        const btn = $("sprintBtn");
        if (btn) btn.classList.toggle("active", active);
    }

    /* ========================================================
       13. IA : DÉPLACEMENTS ET COMPORTEMENT
    ======================================================== */

    function formationPosition(player) {
        const home = player.home;
        const sign = home ? 1 : -1;

        const index = player.number - 1;
        const row = Math.floor(index / 4);
        const col = index % 4;

        let x = (col - 1.5) * 11;
        let z = sign * (23 - row * 13);

        if (player.keeper) {
            x = 0;
            z = sign * 45;
        }

        return { x, z };
    }

    function updateAIPlayer(player, dt) {
        if (!state.matchStarted || !player) return;

        const b = ballPosition();
        const ownTeam = player.home ? state.homePlayers : state.awayPlayers;
        const opponents = player.home ? state.awayPlayers : state.homePlayers;

        player.aiThink -= dt;
        player.kickCooldown = Math.max(0, player.kickCooldown - dt);

        const distanceBall = Math.hypot(player.x - b.x, player.z - b.z);

        const nearestOwn = nearestPlayerToBall(ownTeam);
        const isBallChaser = nearestOwn === player;

        const direction = getForwardDirection(player);
        const formation = formationPosition(player);

        let tx = formation.x;
        let tz = formation.z;

        if (player.keeper) {
            tx = clamp(b.x * 0.35, -8, 8);
            tz = player.home ? -44 : 44;

            if (distanceBall < 14) {
                tx = b.x;
                tz = b.z + (player.home ? 3 : -3);
            }
        } else if (isBallChaser || state.ballOwner === player) {
            tx = b.x;
            tz = b.z;

            if (state.ballOwner === player) {
                tz += direction * 7;

                const nearGoal = player.home
                    ? player.z < -30
                    : player.z > 30;

                if (nearGoal && player.kickCooldown <= 0 && Math.random() < dt * 0.55) {
                    kickBall(
                        player,
                        { x: random(-4, 4), z: player.home ? -51 : 51 },
                        random(15, 22),
                        random(1.4, 3.2)
                    );
                } else if (player.aiThink <= 0 && player.kickCooldown <= 0 && Math.random() < 0.28) {
                    const teammate = nearestTeammate(player);

                    if (teammate && distance2D(player, teammate) > 6) {
                        kickBall(
                            player,
                            { x: teammate.x, z: teammate.z },
                            random(9, 14),
                            random(0.7, 1.8)
                        );
                    }

                    player.aiThink = random(0.5, 1.3);
                }
            } else if (distanceBall < 2.4 && player.kickCooldown <= 0 && !player.home) {
                if (Math.random() < 0.15) {
                    state.ballOwner = player;
                    player.hasBall = true;
                }
            }
        } else {
            const bHome = player.home ? b.z < 0 : b.z > 0;

            if (bHome) {
                tx = formation.x * 0.65 + b.x * 0.25;
                tz = formation.z * 0.6 + b.z * 0.25;
            }
        }

        /* Le joueur contrôlé est géré par le joystick */
        if (player === state.controlledPlayer && state.matchStarted) return;

        const dx = tx - player.x;
        const dz = tz - player.z;
        const d = Math.hypot(dx, dz);

        if (d > 0.3) {
            const difficultyMultiplier = {
                easy: 0.8,
                normal: 1,
                hard: 1.12,
                expert: 1.24
            }[state.difficulty] || 1;

            const speed = player.speed * difficultyMultiplier;

            player.vx = (dx / d) * speed;
            player.vz = (dz / d) * speed;

            player.x += player.vx * dt;
            player.z += player.vz * dt;

            player.root.setPosition(player.x, 0, player.z);

            const yaw = Math.atan2(dx, dz) * 180 / Math.PI;
            player.root.setEulerAngles(0, yaw, 0);
        } else {
            player.vx = 0;
            player.vz = 0;
        }

        player.x = clamp(player.x, -FIELD.halfWidth + 1, FIELD.halfWidth - 1);
        player.z = clamp(player.z, -FIELD.halfLength + 1, FIELD.halfLength - 1);

        player.root.setPosition(player.x, 0, player.z);

        if (distanceBall < 1.7 && !state.ballOwner && player.kickCooldown <= 0) {
            if (Math.random() < dt * 1.8) {
                state.ballOwner = player;
                player.hasBall = true;
                state.ballVelocity = { x: 0, y: 0, z: 0 };
                state.lastTouchPlayer = player;
                state.lastTouchTeam = player.home ? "home" : "away";
            }
        }

        animatePlayer(player, dt);
    }

    function updateControlledPlayer(dt) {
        const player = getControlledPlayer();

        if (!player || !state.matchStarted || state.paused) return;

        const sprintFactor = state.sprinting ? 1.55 : 1;
        const speed = player.speed * sprintFactor;

        const inputX = state.joystickX;
        const inputY = state.joystickY;

        if (Math.abs(inputX) > 0.05 || Math.abs(inputY) > 0.05) {
            player.vx = inputX * speed;
            player.vz = inputY * speed;

            player.x += player.vx * dt;
            player.z += player.vz * dt;

            player.x = clamp(player.x, -FIELD.halfWidth + 1, FIELD.halfWidth - 1);
            player.z = clamp(player.z, -FIELD.halfLength + 1, FIELD.halfLength - 1);

            player.root.setPosition(player.x, 0, player.z);

            const yaw = Math.atan2(player.vx, player.vz) * 180 / Math.PI;
            player.root.setEulerAngles(0, yaw, 0);

            player.stamina = Math.max(0, player.stamina - dt * (state.sprinting ? 6 : 1));
        } else {
            player.vx = 0;
            player.vz = 0;
            player.stamina = Math.min(100, player.stamina + dt * 1.8);
        }

        const b = ballPosition();
        const d = distance2D(player, b);

        if (d < 1.65 && !state.ballOwner) {
            state.ballOwner = player;
            player.hasBall = true;
            state.ballVelocity = { x: 0, y: 0, z: 0 };
            state.lastTouchPlayer = player;
            state.lastTouchTeam = "home";
        }

        if (state.ballOwner === player) {
            const forward = getForwardDirection(player);

            state.ball.setPosition(
                player.x,
                0.56,
                player.z + forward * 0.9
            );

            state.ballVelocity = { x: 0, y: 0, z: 0 };
        }

        animatePlayer(player, dt);
    }

    function animatePlayer(player, dt) {
        player.animTime += dt * (Math.hypot(player.vx, player.vz) > 0.5 ? 11 : 2);

        const swing = Math.sin(player.animTime) * 0.32;
        const moving = Math.hypot(player.vx, player.vz) > 0.5;

        if (player.parts.legL) {
            player.parts.legL.setLocalEulerAngles(moving ? swing * 55 : 0, 0, 0);
        }

        if (player.parts.legR) {
            player.parts.legR.setLocalEulerAngles(moving ? -swing * 55 : 0, 0, 0);
        }

        if (player.parts.armL) {
            player.parts.armL.setLocalEulerAngles(moving ? -swing * 30 : 0, 0, 0);
        }

        if (player.parts.armR) {
            player.parts.armR.setLocalEulerAngles(moving ? swing * 30 : 0, 0, 0);
        }
    }

    /* ========================================================
       14. BALLON : PHYSIQUE SIMPLIFIÉE
    ======================================================== */

    function updateBall(dt) {
        if (!state.ball || !state.matchStarted || state.paused) return;

        if (state.ballOwner) {
            const owner = state.ballOwner;

            if (owner === state.controlledPlayer) {
                const forward = getForwardDirection(owner);

                state.ball.setPosition(
                    owner.x,
                    0.56,
                    owner.z + forward * 0.85
                );

                return;
            }

            if (owner.root && owner.home !== undefined) {
                const forward = getForwardDirection(owner);

                state.ball.setPosition(
                    owner.x,
                    0.56,
                    owner.z + forward * 0.8
                );

                return;
            }
        }

        const b = ballPosition();

        state.ballVelocity.x *= Math.pow(0.985, dt * 60);
        state.ballVelocity.z *= Math.pow(0.985, dt * 60);

        state.ballVelocity.y -= 9.8 * dt;

        let nx = b.x + state.ballVelocity.x * dt;
        let ny = b.y + state.ballVelocity.y * dt;
        let nz = b.z + state.ballVelocity.z * dt;

        if (ny < 0.48) {
            ny = 0.48;

            if (Math.abs(state.ballVelocity.y) > 1.4) {
                state.ballVelocity.y *= -0.35;
            } else {
                state.ballVelocity.y = 0;
            }
        }

        /* Limites latérales */
        if (nx < -FIELD.halfWidth || nx > FIELD.halfWidth) {
            nx = clamp(nx, -FIELD.halfWidth, FIELD.halfWidth);
            state.ballVelocity.x *= -0.55;
        }

        /* Sortie de but et détection de but */
        if (nz < -FIELD.halfLength - 1 || nz > FIELD.halfLength + 1) {
            const goal = Math.abs(nx) < FIELD.goalWidth / 2;

            if (goal && Date.now() - state.lastGoalTime > 1800) {
                const scoredHome = nz < 0;

                if (scoredHome) {
                    state.scoreHome++;
                    announce("BUT !", `${state.selectedHome.name} marque !`, 3500);
                    state.profile.goalsScored++;
                } else {
                    state.scoreAway++;
                    announce("BUT !", `${state.selectedAway.name} marque !`, 3500);
                }

                state.lastGoalTime = Date.now();
                updateScoreboard();
                soundEffect("goal");
                resetBall();

                if (state.profile.goalsScored % 3 === 0) {
                    saveAll(false);
                }

                return;
            }

            /* Remise en jeu simplifiée */
            if (Math.abs(nz) > FIELD.halfLength + 2) {
                nz = clamp(nz, -FIELD.halfLength + 0.8, FIELD.halfLength - 0.8);
                state.ballVelocity.z *= -0.35;
            }
        }

        state.ball.setPosition(nx, ny, nz);

        /* Tentative de récupération par un joueur proche */
        if (!state.ballOwner && ny < 1.2) {
            let closest = null;
            let best = 1.15;

            state.players.forEach(player => {
                const d = Math.hypot(player.x - nx, player.z - nz);

                if (d < best && player.kickCooldown <= 0) {
                    best = d;
                    closest = player;
                }
            });

            if (closest) {
                const canTake = closest === state.controlledPlayer ||
                    Math.random() < dt * (state.difficulty === "expert" ? 4 : 2.2);

                if (canTake) {
                    state.ballOwner = closest;
                    closest.hasBall = true;
                    state.lastTouchPlayer = closest;
                    state.lastTouchTeam = closest.home ? "home" : "away";
                    state.ballVelocity = { x: 0, y: 0, z: 0 };
                }
            }
        }
    }

    /* ========================================================
       15. TABLEAU DE SCORE ET TEMPS
    ======================================================== */

    function matchDurationSeconds() {
        const value = $("matchDurationSelect")?.value || "standard";

        if (value === "short") return 180;
        if (value === "long") return 900;
        return 360;
    }

    function updateScoreboard() {
        if ($("homeScore")) $("homeScore").textContent = String(state.scoreHome);
        if ($("awayScore")) $("awayScore").textContent = String(state.scoreAway);

        if ($("homeTeamName")) {
            $("homeTeamName").textContent = state.selectedHome?.name || "ÉQUIPE DOMICILE";
        }

        if ($("awayTeamName")) {
            $("awayTeamName").textContent = state.selectedAway?.name || "ÉQUIPE VISITEUSE";
        }

        if ($("competitionLabel")) {
            const level = COMPETITION_LEVELS.find(item => item.id === state.currentCompetition);
            $("competitionLabel").textContent = level?.name || "MATCH LOCAL";
        }

        if ($("stadiumLabel")) {
            $("stadiumLabel").textContent = state.currentStadium;
        }
    }

    function updateMatchClock(dt) {
        if (!state.matchStarted || state.paused || state.matchFinished) return;

        state.elapsed += dt;

        const ratio = state.elapsed / state.matchLength;
        const displayedSeconds = Math.floor(ratio * 90);
        const minutes = Math.floor(displayedSeconds / 60);
        const seconds = displayedSeconds % 60;

        if ($("matchClock")) {
            $("matchClock").textContent =
                String(minutes).padStart(2, "0") + ":" +
                String(seconds).padStart(2, "0");
        }

        if (ratio >= 0.5 && state.half === 1) {
            state.half = 2;

            if ($("matchPeriod")) {
                $("matchPeriod").textContent = "2e MI-TEMPS";
            }

            announce("MI-TEMPS", "La deuxième période commence.", 3000);
            resetBall();
        }

        if (state.elapsed >= state.matchLength) {
            finishMatch();
        }
    }

    function finishMatch() {
        if (state.matchFinished) return;

        state.matchFinished = true;
        state.matchStarted = false;
        state.paused = false;

        if ($("matchPeriod")) $("matchPeriod").textContent = "TERMINÉ";

        const result =
            state.scoreHome > state.scoreAway ? "Victoire à domicile" :
            state.scoreHome < state.scoreAway ? "Victoire à l'extérieur" :
            "Match nul";

        state.profile.matchesPlayed++;

        if (state.scoreHome > state.scoreAway) {
            state.profile.trophies += 1;
        }

        saveAll(false);
        updateProfileUI();

        showDialog(
            "FIN DU MATCH",
            `
                <div style="text-align:center;padding:12px">
                    <h3>${escapeHTML(result)}</h3>
                    <p style="font-size:25px;font-weight:800">
                        ${state.scoreHome} — ${state.scoreAway}
                    </p>
                    <p>${escapeHTML(state.selectedHome?.name || "")}</p>
                    <p>contre</p>
                    <p>${escapeHTML(state.selectedAway?.name || "")}</p>
                </div>
            `,
            [
                {
                    label: "MENU PRINCIPAL",
                    className: "ui-button button-primary",
                    action: () => {
                        closeDialog();
                        showScreen("mainMenu");
                    }
                },
                {
                    label: "NOUVEAU MATCH",
                    className: "ui-button button-secondary",
                    action: () => {
                        closeDialog();
                        showScreen("matchSetupScreen");
                    }
                }
            ]
        );

        announce("FIN DU MATCH", result, 3500);
    }

    /* ========================================================
       16. ARBITRE IA
    ======================================================== */

    function refereeSay(message) {
        const label = $("refereeDecisionLabel");
        if (label) label.textContent = message;

        if (!state.settings.commentary && state.settings.commentary !== undefined) {
            return;
        }

        if ("speechSynthesis" in window && state.soundEnabled) {
            try {
                window.speechSynthesis.cancel();

                const utterance = new SpeechSynthesisUtterance(message);
                utterance.lang = "fr-FR";
                utterance.rate = 1.05;
                utterance.pitch = 0.9;
                utterance.volume = clamp(state.soundVolume, 0, 1);

                window.speechSynthesis.speak(utterance);
            } catch {
                /* La synthèse vocale dépend du navigateur. */
            }
        }
    }

    function updateReferee(dt) {
        state.refereeTimer += dt;

        if (state.refereeTimer < 8) return;
        state.refereeTimer = 0;

        if (!state.matchStarted || state.paused) return;

        const messages = [
            "Continuez à jouer.",
            "L'arbitre surveille le terrain.",
            "Jouez fair-play.",
            "La rencontre continue.",
            "Gardez votre position.",
            "Bonne circulation du ballon."
        ];

        if (Math.random() < 0.22) {
            refereeSay(pick(messages));
        }
    }

    /* ========================================================
       17. SON
    ======================================================== */

    function soundEffect(type) {
        if (!state.soundEnabled || state.soundVolume <= 0) return;

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) return;

            if (!state.audioContext) {
                state.audioContext = new AudioContextClass();
            }

            const ctx = state.audioContext;
            if (ctx.state === "suspended") ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            const frequencies = {
                kick: 180,
                goal: 720,
                whistle: 1000,
                click: 430
            };

            osc.frequency.value = frequencies[type] || 430;
            osc.type = type === "goal" ? "triangle" : "sine";

            gain.gain.setValueAtTime(Math.max(0.001, state.soundVolume * 0.11), ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (type === "goal" ? 0.5 : 0.12));

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + (type === "goal" ? 0.5 : 0.12));
        } catch {
            /* Le jeu reste utilisable sans audio. */
        }
    }

    function toggleSound() {
        state.soundEnabled = !state.soundEnabled;

        const btn = $("soundToggleBtn");

        if (btn) {
            btn.textContent = state.soundEnabled ? "🔊" : "🔇";
            btn.setAttribute("aria-pressed", String(state.soundEnabled));
        }

        if (!state.soundEnabled && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        toast(state.soundEnabled ? "Son activé." : "Son désactivé.");
    }

    /* ========================================================
       18. JOYSTICK TACTILE
    ======================================================== */

    function bindJoystick() {
        const joystick = $("movementJoystick");
        const base = $("joystickBase");
        const knob = $("joystickKnob");

        if (!joystick || !base || !knob) return;

        let pointerId = null;

        function updateJoystick(event) {
            const rect = base.getBoundingClientRect();

            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            let dx = event.clientX - cx;
            let dy = event.clientY - cy;

            const maxRadius = Math.max(20, rect.width * 0.34);
            const length = Math.hypot(dx, dy);

            if (length > maxRadius) {
                dx = dx / length * maxRadius;
                dy = dy / length * maxRadius;
            }

            state.joystickX = clamp(dx / maxRadius, -1, 1);
            state.joystickY = clamp(dy / maxRadius, -1, 1);

            knob.style.transform = `translate(${dx}px, ${dy}px)`;
        }

        function releaseJoystick() {
            pointerId = null;
            state.joystickActive = false;
            state.joystickX = 0;
            state.joystickY = 0;
            knob.style.transform = "translate(0, 0)";
        }

        joystick.addEventListener("pointerdown", event => {
            if (!state.matchStarted || state.paused) return;

            pointerId = event.pointerId;
            state.joystickActive = true;

            try {
                joystick.setPointerCapture(pointerId);
            } catch {
                /* Certains navigateurs refusent la capture. */
            }

            updateJoystick(event);
            event.preventDefault();
        });

        joystick.addEventListener("pointermove", event => {
            if (pointerId !== event.pointerId) return;

            updateJoystick(event);
            event.preventDefault();
        });

        joystick.addEventListener("pointerup", event => {
            if (pointerId === event.pointerId) releaseJoystick();
        });

        joystick.addEventListener("pointercancel", releaseJoystick);
        joystick.addEventListener("lostpointercapture", releaseJoystick);
    }

    /* ========================================================
       19. ZOOM PINCE À DEUX DOIGTS
    ======================================================== */

    function bindPinchZoom() {
        const viewport = $("pitchViewport");
        if (!viewport) return;

        let initialDistance = 0;
        let initialZoom = state.cameraZoom;

        function fingerDistance(touches) {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.hypot(dx, dy);
        }

        viewport.addEventListener("touchstart", event => {
            if (event.touches.length === 2) {
                initialDistance = fingerDistance(event.touches);
                initialZoom = state.cameraZoom;
            }
        }, { passive: true });

        viewport.addEventListener("touchmove", event => {
            if (event.touches.length !== 2 || initialDistance <= 0) return;

            const currentDistance = fingerDistance(event.touches);
            const ratio = currentDistance / initialDistance;

            state.cameraZoom = clamp(initialZoom * ratio, 0.6, 2.1);
            updateCamera(true);

            event.preventDefault();
        }, { passive: false });

        viewport.addEventListener("touchend", event => {
            if (event.touches.length < 2) initialDistance = 0;
        }, { passive: true });
    }

    /* ========================================================
       20. PAUSE ET TACTIQUES
    ======================================================== */

    function pauseMatch() {
        if (!state.matchStarted || state.matchFinished) return;

        state.paused = true;

        const overlay = $("pauseOverlay");
        if (overlay) overlay.classList.remove("hidden");

        soundEffect("click");
    }

    function resumeMatch() {
        state.paused = false;

        const overlay = $("pauseOverlay");
        if (overlay) overlay.classList.add("hidden");
    }

    function openTactics() {
        const overlay = $("tacticsOverlay");
        if (!overlay) return;

        if ($("formationSelect")) $("formationSelect").value = state.formation;
        if ($("tacticalStyleSelect")) $("tacticalStyleSelect").value = state.tacticalStyle;
        if ($("pressureSelect")) $("pressureSelect").value = state.pressure;

        overlay.classList.remove("hidden");
    }

    function applyTactics() {
        state.formation = $("formationSelect")?.value || "433";
        state.tacticalStyle = $("tacticalStyleSelect")?.value || "balanced";
        state.pressure = $("pressureSelect")?.value || "medium";

        const overlay = $("tacticsOverlay");
        if (overlay) overlay.classList.add("hidden");

        if (state.matchStarted) {
            repositionPlayersForFormation();
        }

        toast("Tactiques appliquées : " + state.formation + ".");
        saveAll(false);
    }

    function repositionPlayersForFormation() {
        const formations = {
            "442": [
                [0, 0],
                [-20, -11], [-7, -13], [7, -13], [20, -11],
                [-20, -1], [-7, -1], [7, -1], [20, -1],
                [-9, 11], [9, 11]
            ],
            "433": [
                [0, 0],
                [-22, -12], [-8, -14], [8, -14], [22, -12],
                [-15, 0], [0, -2], [15, 0],
                [-17, 12], [0, 16], [17, 12]
            ],
            "352": [
                [0, 0],
                [-18, -13], [0, -14], [18, -13],
                [-24, -1], [-11, -2], [0, -4], [11, -2], [24, -1],
                [-10, 13], [10, 13]
            ],
            "4231": [
                [0, 0],
                [-21, -12], [-7, -14], [7, -14], [21, -12],
                [-10, -2], [10, -2],
                [-17, 8], [0, 7], [17, 8],
                [0, 17]
            ],
            "541": [
                [0, 0],
                [-23, -13], [-12, -14], [0, -15], [12, -14], [23, -13],
                [-20, -1], [-7, -2], [7, -2], [20, -1],
                [0, 17]
            ]
        };

        const formation = formations[state.formation] || formations["433"];

        state.players.forEach(player => {
            const index = player.number - 1;
            const [x, z] = formation[index];

            player.targetX = x;
            player.targetZ = player.home ? z : -z;
        });
    }

    /* ========================================================
       21. DÉMARRER UN MATCH
    ======================================================== */

    function startMatch() {
        if (!state.initialized || !state.app) {
            toast("Le moteur 3D n'est pas encore prêt.");
            return;
        }

        const homeId = $("homeTeamSelect")?.value;
        const awayId = $("awayTeamSelect")?.value;

        const home = getTeamById(homeId);
        const away = getTeamById(awayId);

        if (!home || !away) {
            toast("Choisissez les deux équipes.");
            return;
        }

        if (home.id === away.id) {
            toast("Choisissez deux équipes différentes.");
            return;
        }

        state.selectedHome = home;
        state.selectedAway = away;
        state.currentCompetition = $("competitionSelect")?.value || "local";

        state.currentStadium = $("stadiumSelect")?.value === "neutral"
            ? "Terrain neutre"
            : "Stade " + home.location;

        state.matchLength = matchDurationSeconds();
        state.elapsed = 0;
        state.half = 1;
        state.scoreHome = 0;
        state.scoreAway = 0;
        state.matchStarted = true;
        state.paused = false;
        state.matchFinished = false;
        state.matchStatsUpdated = false;

        createPlayersForMatch();
        resetBall();

        if ($("matchPeriod")) $("matchPeriod").textContent = "1re MI-TEMPS";
        if ($("matchClock")) $("matchClock").textContent = "00:00";

        updateScoreboard();
        showScreen("matchScreen");

        const pause = $("pauseOverlay");
        if (pause) pause.classList.add("hidden");

        announce(
            "COUP D'ENVOI",
            `${home.name} contre ${away.name}. L'arbitre MEME Selvandieu lance le match !`,
            4000
        );

        refereeSay("Coup d'envoi. Que le meilleur gagne.");
        soundEffect("whistle");

        saveAll(false);
    }

    /* ========================================================
       22. BOUCLE PRINCIPALE
    ======================================================== */

    function updateGame(dt) {
        if (!state.initialized) return;

        dt = clamp(dt || 0, 0, 0.05);

        if (state.matchStarted && !state.paused) {
            updateControlledPlayer(dt);

            state.players.forEach(player => {
                if (player !== state.controlledPlayer) {
                    updateAIPlayer(player, dt);
                }
            });

            updateBall(dt);
            updateMatchClock(dt);
            updateReferee(dt);
            updateAnnouncement(dt);

            if (state.cameraMode !== 1) {
                updateCamera(false);
            }
        }

        if (state.app && state.app.graphicsDevice) {
            const status = $("engineStatus");

            if (status && state.matchStarted) {
                status.textContent =
                    `${state.players.length} joueurs · Ballon ${state.ballOwner ? "contrôlé" : "libre"}`;
            }
        }
    }

    /* ========================================================
       23. SAUVEGARDE DU MATCH
    ======================================================== */

    async function saveMatch() {
        const ok = await saveAll(false);

        if (ok) {
            toast("Match et progression sauvegardés.");
        } else {
            toast("Échec de la sauvegarde.");
        }
    }

    async function restoreSavedMatch() {
        const data = await dbRead("main");

        if (!data || !data.match || !data.match.started || data.match.finished) {
            toast("Aucun match sauvegardé à reprendre.");
            showScreen("matchSetupScreen");
            return;
        }

        const match = data.match;

        const home = getTeamById(match.homeTeam);
        const away = getTeamById(match.awayTeam);

        if (!home || !away || home.id === away.id) {
            toast("La sauvegarde ne contient pas d'équipes valides.");
            showScreen("matchSetupScreen");
            return;
        }

        state.selectedHome = home;
        state.selectedAway = away;
        state.scoreHome = Number(match.scoreHome) || 0;
        state.scoreAway = Number(match.scoreAway) || 0;
        state.elapsed = Number(match.elapsed) || 0;
        state.half = Number(match.half) || 1;
        state.matchLength = matchDurationSeconds();

        state.matchStarted = true;
        state.matchFinished = false;
        state.paused = false;

        createPlayersForMatch();
        resetBall();

        if (state.ball) {
            state.ball.setPosition(
                Number(match.ballX) || 0,
                0.6,
                Number(match.ballZ) || 0
            );
        }

        updateScoreboard();
        showScreen("matchScreen");

        if ($("matchPeriod")) {
            $("matchPeriod").textContent = state.half === 1 ? "1re MI-TEMPS" : "2e MI-TEMPS";
        }

        toast("Match sauvegardé chargé.");
    }

    /* ========================================================
       24. NAVIGATION
    ======================================================== */

    function openMenuAction(action) {
        switch (action) {
            case "play-match":
                showScreen("matchSetupScreen");
                break;

            case "continue-career":
                restoreSavedMatch();
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
                updateProfileUI();
                showScreen("profileScreen");
                break;

            case "how-to-play":
                showScreen("howToPlayScreen");
                break;

            default:
                toast("Action non reconnue : " + action);
        }
    }

    /* ========================================================
       25. ÉVÉNEMENTS DE L'INTERFACE
    ======================================================== */

    function wireUI() {
        document.querySelectorAll("[data-action]").forEach(button => {
            if (button.dataset.actionBound === "true") return;

            button.dataset.actionBound = "true";

            button.addEventListener("click", () => {
                const action = button.dataset.action;

                switch (action) {
                    case "play-match":
                    case "continue-career":
                    case "championships":
                    case "tournaments":
                    case "teams":
                    case "equipment":
                    case "profile":
                    case "how-to-play":
                        openMenuAction(action);
                        break;

                    case "pass":
                        doPass();
                        break;

                    case "shoot":
                        doShoot();
                        break;

                    case "defend":
                        doDefend();
                        break;

                    case "switch-player":
                        switchPlayer();
                        break;

                    case "sprint":
                        setSprint(!state.sprinting);
                        break;
                }
            });
        });

        document.querySelectorAll("[data-back]").forEach(button => {
            button.addEventListener("click", () => {
                showScreen(button.dataset.back || "mainMenu");
            });
        });

        const byId = (id, event, callback) => {
            const el = $(id);
            if (el) el.addEventListener(event, callback);
        };

        byId("confirmMatchBtn", "click", startMatch);

        byId("soundToggleBtn", "click", toggleSound);
        byId("pauseGameBtn", "click", pauseMatch);
        byId("openSettingsBtn", "click", () => showScreen("settingsScreen"));

        byId("resumeGameBtn", "click", resumeMatch);

        byId("savePausedMatchBtn", "click", saveMatch);

        byId("quitPausedMatchBtn", "click", () => {
            const overlay = $("pauseOverlay");
            if (overlay) overlay.classList.add("hidden");

            state.paused = false;
            state.matchStarted = false;
            saveAll(false);
            showScreen("mainMenu");
        });

        byId("exitMatchBtn", "click", () => {
            showDialog(
                "QUITTER LE MATCH ?",
                "<p>Voulez-vous sauvegarder votre progression avant de quitter ?</p>",
                [
                    {
                        label: "SAUVEGARDER ET QUITTER",
                        className: "ui-button button-primary",
                        action: async () => {
                            await saveAll(false);
                            closeDialog();
                            state.matchStarted = false;
                            state.paused = false;
                            showScreen("mainMenu");
                        }
                    },
                    {
                        label: "QUITTER SANS SAUVEGARDER",
                        className: "ui-button button-danger",
                        action: () => {
                            closeDialog();
                            state.matchStarted = false;
                            state.paused = false;
                            showScreen("mainMenu");
                        }
                    },
                    {
                        label: "ANNULER",
                        className: "ui-button button-secondary",
                        action: closeDialog
                    }
                ]
            );
        });

        byId("saveMatchBtn", "click", saveMatch);

        byId("cameraZoomOutBtn", "click", () => zoomCamera(-0.15));
        byId("cameraZoomInBtn", "click", () => zoomCamera(0.15));

        byId("cameraResetBtn", "click", () => {
            state.cameraZoom = 1;
            state.cameraMode = 0;
            updateCamera(true);
            toast("Caméra réinitialisée.");
        });

        byId("changeCameraBtn", "click", () => {
            state.cameraMode = (state.cameraMode + 1) % 3;
            updateCamera(true);

            const labels = ["Caméra joueur", "Caméra terrain", "Caméra ballon"];
            toast(labels[state.cameraMode]);
        });

        byId("showTacticsBtn", "click", openTactics);
        byId("closeTacticsBtn", "click", () => {
            $("tacticsOverlay")?.classList.add("hidden");
        });
        byId("applyTacticsBtn", "click", applyTactics);

        byId("closeDialogBtn", "click", closeDialog);

        byId("dialogOverlay", "click", event => {
            if (event.target === $("dialogOverlay")) closeDialog();
        });

        byId("saveProfileBtn", "click", saveProfile);
        byId("saveSettingsBtn", "click", saveSettings);

        byId("teamSearchInput", "input", renderTeams);
        byId("teamRegionSelect", "change", renderTeams);

        byId("refreshTeamsBtn", "click", () => {
            renderTeams();
            toast("Liste des équipes actualisée.");
        });

        byId("startChampionshipBtn", "click", () => {
            showScreen("matchSetupScreen");

            if ($("competitionSelect")) {
                $("competitionSelect").value = state.currentCompetition || "local";
            }
        });

        byId("createTournamentBtn", "click", () => {
            showDialog(
                "CRÉER UN TOURNOI",
                `
                    <label for="newTournamentName">Nom du tournoi</label>
                    <input id="newTournamentName" type="text" maxlength="60"
                        placeholder="Nom de votre tournoi"
                        style="width:100%;padding:12px;margin:10px 0">
                    <p>Votre tournoi personnalisé sera conservé dans la progression locale.</p>
                `,
                [
                    {
                        label: "CRÉER",
                        className: "ui-button button-primary",
                        action: async () => {
                            const name = $("newTournamentName")?.value.trim();

                            if (!name) {
                                toast("Entrez le nom du tournoi.");
                                return;
                            }

                            const tournaments = await dbRead("custom-tournaments") || [];
                            tournaments.push({
                                id: Date.now(),
                                name,
                                createdAt: Date.now()
                            });

                            await dbWrite("custom-tournaments", tournaments);
                            closeDialog();
                            toast("Tournoi créé : " + name);
                        }
                    },
                    {
                        label: "ANNULER",
                        className: "ui-button button-secondary",
                        action: closeDialog
                    }
                ]
            );
        });

        document.querySelectorAll("[data-equipment-tab]").forEach(button => {
            button.addEventListener("click", () => {
                state.selectedEquipmentTab = button.dataset.equipmentTab;

                document.querySelectorAll("[data-equipment-tab]").forEach(tab => {
                    const active = tab === button;
                    tab.classList.toggle("active", active);
                    tab.setAttribute("aria-selected", String(active));
                });

                state.selectedEquipment = null;
                renderEquipment();
            });
        });

        byId("applyEquipmentBtn", "click", applyEquipment);

        byId("retryLoadingBtn", "click", async () => {
            const retry = $("retryLoadingBtn");
            if (retry) retry.classList.add("hidden");

            state.engineBusy = false;
            state.initialized = false;

            await initializeEngine();
        });

        /* Sprint maintenu pendant l'appui */
        const sprintBtn = $("sprintBtn");

        if (sprintBtn) {
            sprintBtn.addEventListener("pointerdown", () => setSprint(true));
            sprintBtn.addEventListener("pointerup", () => setSprint(false));
            sprintBtn.addEventListener("pointercancel", () => setSprint(false));
            sprintBtn.addEventListener("pointerleave", () => setSprint(false));
        }

        bindJoystick();
        bindPinchZoom();

        /* Empêcher le défilement accidentel dans le jeu */
        const viewport = $("pitchViewport");

        if (viewport) {
            viewport.addEventListener("contextmenu", event => event.preventDefault());
        }

        window.addEventListener("keydown", event => {
            if (event.repeat) return;

            if (event.code === "Escape") {
                if (state.paused) resumeMatch();
                else pauseMatch();
            }

            if (event.code === "Space" && state.matchStarted && !state.paused) {
                event.preventDefault();
                doShoot();
            }

            if (event.key.toLowerCase() === "p" && state.matchStarted) doPass();
            if (event.key.toLowerCase() === "s" && state.matchStarted) switchPlayer();

            if (event.key === "ArrowLeft") state.joystickX = -1;
            if (event.key === "ArrowRight") state.joystickX = 1;
            if (event.key === "ArrowUp") state.joystickY = -1;
            if (event.key === "ArrowDown") state.joystickY = 1;
        });

        window.addEventListener("keyup", event => {
            if (["ArrowLeft", "ArrowRight"].includes(event.key)) state.joystickX = 0;
            if (["ArrowUp", "ArrowDown"].includes(event.key)) state.joystickY = 0;
        });

        /* Sauvegarde quand l'application quitte le premier plan */
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") {
                saveAll(false);
            }
        });

        window.addEventListener("beforeunload", () => {
            try {
                localStorage.setItem(
                    "FOBAS_FOOTBALL_RECENT",
                    JSON.stringify(createSaveData())
                );
            } catch {
                /* Le navigateur peut interdire le stockage local. */
            }
        });
    }

    /* ========================================================
       26. INITIALISATION GÉNÉRALE
    ======================================================== */

    async function boot() {
        setLoading(2, "Démarrage de FOBAS FOOTBALL...");

        const header = $("topHeader");
        const footer = $("appFooter");

        if (header) header.style.display = "none";
        if (footer) footer.style.display = "none";

        state.teams = generateTeams();

        state.settings = {
            graphicsQuality: "medium",
            soundVolume: 70,
            cameraSensitivity: 50,
            difficulty: "normal",
            vibration: true,
            commentary: true
        };

        await initializeEngine();

        if (!state.initialized) return;

        populateTeamSelects();
        updateProfileUI();
        applySettingsToUI();

        updateScoreboard();

        const mainMenu = $("mainMenu");
        if (mainMenu) mainMenu.classList.remove("hidden");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }

})();

