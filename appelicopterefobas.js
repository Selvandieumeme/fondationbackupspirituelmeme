/* ============================================================
   FOBAS ELITE STRIKE 3D
   JavaScript principal
   Compatible avec le HTML fourni et Babylon.js 9.30.0
   Stockage : IndexedDB
   Compatible Android / tactile / clavier
============================================================ */

(() => {
    "use strict";

    /* =========================================================
       1. CONFIGURATION
    ========================================================= */

    const CONFIG = Object.freeze({
        appName: "FOBAS ELITE STRIKE 3D",
        version: "2.0.0",
        databaseName: "FOBASEliteStrikeDB",
        databaseVersion: 1,
        saveKey: "game-save",
        settingsKey: "game-settings",
        contentKey: "dynamic-content",
        syncInterval: 10 * 60 * 1000,
        autosaveInterval: 60 * 1000,
        worldSize: 260,
        enemyCount: 18,
        maxHealth: 100,
        maxArmor: 100,
        playerWalkSpeed: 6,
        playerSprintSpeed: 10,
        allySpeed: 5.5,
        cameraMinRadius: 5,
        cameraMaxRadius: 28,
        cameraInitialRadius: 12,
        maxChatMessages: 200,
        maxLogEntries: 150,
        infiniteReserveAmmo: true,
        damageReduction: 0.95,
        interactionRange: 5
    });

    const $ = id => document.getElementById(id);

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const random = (min, max) =>
        Math.random() * (max - min) + min;

    const randomInt = (min, max) =>
        Math.floor(random(min, max + 1));

    const distance2D = (a, b) =>
        Math.hypot((a.x || 0) - (b.x || 0), (a.z || 0) - (b.z || 0));

    const formatTime = seconds => {
        const s = Math.max(0, Math.floor(seconds || 0));
        return String(Math.floor(s / 60)).padStart(2, "0") +
            ":" + String(s % 60).padStart(2, "0");
    };

    const escapeHTML = value =>
        String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    const deepClone = value =>
        JSON.parse(JSON.stringify(value));

    const now = () => performance.now();

    /* =========================================================
       2. DONNÉES DES ARMES
    ========================================================= */

    const DEFAULT_WEAPONS = [
        {
            id: "pistol",
            name: "Pistolet tactique",
            damage: 25,
            range: 40,
            fireRate: 320,
            magazine: 15,
            reserve: Infinity,
            accuracy: 0.96,
            price: 0
        },
        {
            id: "rifle",
            name: "Fusil d'assaut",
            damage: 34,
            range: 100,
            fireRate: 190,
            magazine: 30,
            reserve: Infinity,
            accuracy: 0.94,
            price: 0
        },
        {
            id: "smg",
            name: "Mitraillette tactique",
            damage: 22,
            range: 55,
            fireRate: 105,
            magazine: 40,
            reserve: Infinity,
            accuracy: 0.86,
            price: 100
        },
        {
            id: "shotgun",
            name: "Fusil à pompe",
            damage: 65,
            range: 24,
            fireRate: 650,
            magazine: 8,
            reserve: Infinity,
            accuracy: 0.80,
            price: 150
        },
        {
            id: "marksman",
            name: "Fusil de précision",
            damage: 90,
            range: 170,
            fireRate: 900,
            magazine: 10,
            reserve: Infinity,
            accuracy: 0.99,
            price: 250
        },
        {
            id: "heavy",
            name: "Mitrailleuse lourde",
            damage: 42,
            range: 115,
            fireRate: 145,
            magazine: 75,
            reserve: Infinity,
            accuracy: 0.87,
            price: 350
        }
    ];

    const DEFAULT_EQUIPMENT = [
        {
            id: "standard",
            name: "Protection standard",
            description: "Équipement tactique de base.",
            armor: 100,
            damageReduction: 0.95,
            price: 0
        },
        {
            id: "heavy",
            name: "Armure renforcée",
            description: "Protection avancée pour les trois experts.",
            armor: 150,
            damageReduction: 0.97,
            price: 200
        },
        {
            id: "elite",
            name: "Protection Elite",
            description: "Protection tactique maximale.",
            armor: 200,
            damageReduction: 0.98,
            price: 400
        }
    ];

    const DEFAULT_HELICOPTERS = [
        {
            id: "scout",
            name: "Hélicoptère de reconnaissance",
            speed: 32,
            maxAltitude: 28,
            health: 100,
            fuel: 100,
            weaponDamage: 45,
            price: 0
        },
        {
            id: "assault",
            name: "Hélicoptère d'assaut",
            speed: 38,
            maxAltitude: 35,
            health: 150,
            fuel: 100,
            weaponDamage: 65,
            price: 250
        },
        {
            id: "heavy",
            name: "Hélicoptère lourd",
            speed: 26,
            maxAltitude: 30,
            health: 220,
            fuel: 150,
            weaponDamage: 85,
            price: 450
        }
    ];

    const MISSION_TEMPLATES = [
        {
            title: "Premier contact",
            description: "Explorez la zone et sécurisez votre équipe.",
            objectives: [
                { type: "reach", label: "Rejoindre la zone tactique", target: 1 },
                { type: "team", label: "Rassembler les deux experts", target: 2 },
                { type: "kill", label: "Neutraliser les hostiles", target: 3 }
            ]
        },
        {
            title: "Périmètre hostile",
            description: "Éliminez les menaces et protégez vos alliés.",
            objectives: [
                { type: "kill", label: "Neutraliser les hostiles", target: 6 },
                { type: "reach", label: "Atteindre le point de contrôle", target: 1 }
            ]
        },
        {
            title: "Extraction aérienne",
            description: "Rejoignez un hélicoptère et préparez l'extraction.",
            objectives: [
                { type: "board", label: "Monter dans un hélicoptère", target: 1 },
                { type: "fly", label: "Voler pendant 15 secondes", target: 15 },
                { type: "reach", label: "Atteindre la zone d'extraction", target: 1 }
            ]
        },
        {
            title: "Supériorité tactique",
            description: "Coordonnez les experts et neutralisez les adversaires.",
            objectives: [
                { type: "kill", label: "Neutraliser les hostiles", target: 10 },
                { type: "team", label: "Rassembler les deux experts", target: 2 }
            ]
        },
        {
            title: "Dernière opération",
            description: "Terminez tous les objectifs de la zone.",
            objectives: [
                { type: "kill", label: "Neutraliser les hostiles", target: 12 },
                { type: "reach", label: "Atteindre le point final", target: 1 },
                { type: "team", label: "Garder l'équipe opérationnelle", target: 2 }
            ]
        }
    ];

    const DEFAULT_INTERACTIONS = [
        ["position", "where", "Où es-tu ?", "position"],
        ["position", "follow", "Suivez-moi", "follow"],
        ["position", "hold", "Maintenez la position", "hold"],
        ["position", "regroup", "Regroupez l'équipe", "regroup"],
        ["position", "protect", "Protégez Selvandieu", "protect"],
        ["position", "advance", "Avancez", "advance"],
        ["position", "retreat", "Repli tactique", "retreat"],
        ["position", "cover", "Couvrez-moi", "cover"],
        ["position", "rally", "Rassemblement", "rally"],
        ["position", "patrol", "Patrouille locale", "patrol"],

        ["threat", "enemy", "Signalez les ennemis", "enemy"],
        ["threat", "attack", "Engagez les ennemis", "attack"],
        ["threat", "ceasefire", "Cessez le feu", "ceasefire"],
        ["threat", "focus", "Concentrez le tir", "focus"],
        ["threat", "defend", "Défendez la zone", "defend"],
        ["threat", "clear", "Nettoyez la zone", "clear"],
        ["threat", "sniper", "Recherchez les tireurs", "sniper"],
        ["threat", "danger", "Signalez les dangers", "danger"],
        ["threat", "flank", "Contournez l'ennemi", "flank"],
        ["threat", "suppress", "Tir de couverture", "suppress"],

        ["team", "status", "État de l'équipe", "status"],
        ["team", "health", "État de santé", "health"],
        ["team", "ready", "Êtes-vous prêts ?", "ready"],
        ["team", "heal", "Rassemblement sanitaire", "heal"],
        ["team", "protect", "Protection rapprochée", "protect"],
        ["team", "assist", "Assistez le joueur", "assist"],
        ["team", "split", "Formation dispersée", "split"],
        ["team", "formation", "Formation tactique", "formation"],
        ["team", "regroup", "Retour auprès du joueur", "regroup"],
        ["team", "report", "Rapport de situation", "report"],

        ["helicopter", "locateheli", "Localisez un hélicoptère", "locateheli"],
        ["helicopter", "board", "Montez dans l'hélicoptère", "board"],
        ["helicopter", "prepare_boarding", "Préparez l'embarquement", "prepare_boarding"],
        ["helicopter", "takeoff", "Préparez le décollage", "takeoff"],
        ["helicopter", "land", "Préparez l'atterrissage", "land"],
        ["helicopter", "hover", "Stabilisez le véhicule", "hover"],
        ["helicopter", "exit", "Descendez du véhicule", "exit"],
        ["helicopter", "aircover", "Couverture aérienne", "aircover"],
        ["helicopter", "extract", "Préparez l'extraction", "extract"],
        ["helicopter", "vehicle_status", "État de l'hélicoptère", "vehicle_status"],

        ["mission", "mission", "État de la mission", "mission"],
        ["mission", "objectives", "Liste des objectifs", "objectives"],
        ["mission", "next", "Mission suivante", "next"],
        ["mission", "checkpoint", "Atteindre le point de contrôle", "checkpoint"],
        ["mission", "secure", "Sécurisez la zone", "secure"],
        ["mission", "search", "Recherchez les hostiles", "search"],
        ["mission", "extract", "Rejoignez l'extraction", "extract"],
        ["mission", "save", "Sauvegardez la progression", "save"],
        ["mission", "coordinates", "Coordonnées du joueur", "coordinates"],
        ["mission", "report", "Rapport opérationnel", "report"]
    ].map(([category, id, label, command]) => ({
        category, id, label, command
    }));

    /* =========================================================
       3. ÉTAT CENTRAL DU JEU
    ========================================================= */

    const state = {
        initialized: false,
        initializing: false,
        running: false,
        paused: false,
        gameStarted: false,
        missionComplete: false,

        engine: null,
        scene: null,
        camera: null,
        canvas: null,

        materials: {},
        actors: new Map(),
        enemies: [],
        helicopters: [],
        bullets: [],

        selectedWeaponId: "rifle",
        selectedEquipmentId: "standard",
        selectedHelicopterId: "scout",

        selectedInteractionCategory: "position",
        selectedExpertId: "ranise",
        selectedWeaponLibraryId: "rifle",
        selectedEquipmentLibraryId: "standard",
        selectedHelicopterLibraryId: "scout",

        health: 100,
        armor: 100,
        ammo: 30,
        reserveAmmo: Infinity,
        score: 0,
        kills: 0,

        missionIndex: 0,
        mission: null,
        missionStartTime: 0,
        missionElapsed: 0,

        lastSaveTime: null,
        lastShotAt: 0,
        lastHelicopterShotAt: 0,
        lastReinforcementAt: 0,
        lastAutoSaveAt: 0,

        player: {
            id: "selvandieu",
            name: "Selvandieu",
            type: "player",
            x: 0,
            z: 0,
            health: 100,
            armor: 100,
            alive: true,
            weaponId: "rifle",
            equipmentId: "standard",
            lastShotAt: 0,
            inHelicopter: false,
            helicopterId: null,
            crouching: false,
            jumping: false,
            jumpUntil: 0,
            targetId: null,
            yaw: 0
        },

        allies: [
            {
                id: "ranise",
                name: "Ranise",
                type: "ally",
                x: -4,
                z: -3,
                health: 100,
                armor: 100,
                alive: true,
                behavior: "follow",
                targetId: null,
                lastShotAt: 0,
                weaponId: "rifle",
                inHelicopter: false,
                helicopterId: null,
                yaw: 0
            },
            {
                id: "kerlande",
                name: "Kerlande",
                type: "ally",
                x: 4,
                z: -3,
                health: 100,
                armor: 100,
                alive: true,
                behavior: "follow",
                targetId: null,
                lastShotAt: 0,
                weaponId: "heavy",
                inHelicopter: false,
                helicopterId: null,
                yaw: 0
            }
        ],

        input: {
            forward: false,
            backward: false,
            left: false,
            right: false,
            sprint: false,
            fire: false,
            aim: false,
            jump: false,
            joystickX: 0,
            joystickY: 0,
            flight: {
                accelerate: false,
                brake: false,
                ascend: false,
                descend: false,
                turnLeft: false,
                turnRight: false
            }
        },

        cameraTarget: null,
        settings: {
            soundEnabled: true,
            musicEnabled: false,
            showCoordinates: true,
            showMinimap: true,
            autoSaveEnabled: true,
            graphicsQuality: "medium",
            cameraSensitivity: 5
        },

        database: null,
        saving: false,
        dynamicContent: {
            weapons: DEFAULT_WEAPONS,
            equipment: DEFAULT_EQUIPMENT,
            helicopters: DEFAULT_HELICOPTERS,
            interactions: DEFAULT_INTERACTIONS,
            missions: MISSION_TEMPLATES
        },

        chatMessages: [],
        unreadMessages: 0,
        tacticalLogs: [],
        toastTimer: null,
        confirmationCallback: null,
        lastFrameTime: 0,
        elapsedSinceStart: 0,
        interactionCooldowns: new Map()
    };

    /* =========================================================
       4. INTERFACE UTILITAIRE
    ========================================================= */

    function showElement(id) {
        const element = $(id);
        if (element) element.classList.remove("hidden");
    }

    function hideElement(id) {
        const element = $(id);
        if (element) element.classList.add("hidden");
    }

    function toggleElement(id) {
        const element = $(id);
        if (element) element.classList.toggle("hidden");
    }

    function setText(id, value) {
        const element = $(id);
        if (element) element.textContent = String(value ?? "");
    }

    function setWidth(id, value) {
        const element = $(id);
        if (element) {
            element.style.width = clamp(Number(value) || 0, 0, 100) + "%";
        }
    }

    function toast(message, icon = "ℹ") {
        setText("globalToastMessage", message);
        setText("globalToastIcon", icon);
        showElement("globalToast");

        if (state.toastTimer) clearTimeout(state.toastTimer);

        state.toastTimer = setTimeout(() => {
            hideElement("globalToast");
        }, 3200);
    }

    function addLog(message, type = "info") {
        const entry = {
            time: new Date().toLocaleTimeString(),
            message: String(message),
            type
        };

        state.tacticalLogs.unshift(entry);
        state.tacticalLogs = state.tacticalLogs.slice(0, CONFIG.maxLogEntries);

        renderTacticalLog();
    }

    function renderTacticalLog() {
        const container = $("tacticalLogEntries");
        if (!container) return;

        if (!state.tacticalLogs.length) {
            container.innerHTML =
                '<p class="empty-state">Aucun événement enregistré.</p>';
            return;
        }

        container.innerHTML = state.tacticalLogs.map(entry => `
            <article class="tactical-log-entry">
                <small>${escapeHTML(entry.time)}</small>
                <p>${escapeHTML(entry.message)}</p>
            </article>
        `).join("");
    }

    function openPanel(id) {
        closeAllPanels(id);
        showElement(id);
    }

    function closePanel(id) {
        hideElement(id);
    }

    function closeAllPanels(exceptId = "") {
        [
            "weaponLibraryPanel",
            "equipmentPanel",
            "helicopterLibraryPanel",
            "communicationPanel",
            "tacticalLogPanel",
            "settingsPanel",
            "saveManagementPanel"
        ].forEach(id => {
            if (id !== exceptId) hideElement(id);
        });
    }

    function showLoadingProgress(percent, message) {
        setWidth("loadingProgressBar", percent);
        setText("loadingProgressText", message + " " + Math.round(percent) + " %");
        setText("loadingMessage", message);
    }

    function hideWorldLoading() {
        hideElement("worldLoadingNotice");
        hideElement("loadingScreen");
    }

    /* =========================================================
       5. INDEXEDDB
    ========================================================= */

    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!("indexedDB" in window)) {
                reject(new Error("IndexedDB n'est pas disponible."));
                return;
            }

            const request = indexedDB.open(
                CONFIG.databaseName,
                CONFIG.databaseVersion
            );

            request.onupgradeneeded = event => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains("saves")) {
                    db.createObjectStore("saves", { keyPath: "key" });
                }

                if (!db.objectStoreNames.contains("settings")) {
                    db.createObjectStore("settings", { keyPath: "key" });
                }

                if (!db.objectStoreNames.contains("content")) {
                    db.createObjectStore("content", { keyPath: "key" });
                }
            };

            request.onsuccess = () => {
                state.database = request.result;
                resolve(state.database);
            };

            request.onerror = () => reject(
                request.error || new Error("Impossible d'ouvrir IndexedDB.")
            );
        });
    }

    function dbRequest(storeName, mode, operation) {
        return new Promise((resolve, reject) => {
            if (!state.database) {
                reject(new Error("Base de données non initialisée."));
                return;
            }

            const transaction = state.database.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);

            let request;

            try {
                request = operation(store);
            } catch (error) {
                reject(error);
                return;
            }

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    function dbGet(store, key) {
        return dbRequest(store, "readonly", objectStore => objectStore.get(key));
    }

    function dbPut(store, record) {
        return dbRequest(store, "readwrite", objectStore => objectStore.put(record));
    }

    function dbDelete(store, key) {
        return dbRequest(store, "readwrite", objectStore => objectStore.delete(key));
    }

    async function initializeDatabase() {
        try {
            await openDatabase();
            setText("saveStorageStatus", "IndexedDB opérationnel");
            return true;
        } catch (error) {
            console.error(error);
            setText("saveStorageStatus", "Stockage local indisponible");
            return false;
        }
    }

    /* =========================================================
       6. SAUVEGARDE ET CHARGEMENT
    ========================================================= */

    function makeSaveSnapshot() {
        return {
            version: CONFIG.version,
            timestamp: Date.now(),

            missionIndex: state.missionIndex,
            missionComplete: state.missionComplete,
            score: state.score,
            kills: state.kills,

            player: {
                x: state.player.x,
                z: state.player.z,
                health: state.player.health,
                armor: state.player.armor,
                weaponId: state.player.weaponId,
                equipmentId: state.player.equipmentId,
                inHelicopter: state.player.inHelicopter,
                helicopterId: state.player.helicopterId
            },

            allies: state.allies.map(ally => ({
                id: ally.id,
                x: ally.x,
                z: ally.z,
                health: ally.health,
                armor: ally.armor,
                alive: ally.alive,
                behavior: ally.behavior,
                weaponId: ally.weaponId,
                inHelicopter: ally.inHelicopter,
                helicopterId: ally.helicopterId
            })),

            selectedWeaponId: state.selectedWeaponId,
            selectedEquipmentId: state.selectedEquipmentId,
            selectedHelicopterId: state.selectedHelicopterId,

            enemies: state.enemies.map(enemy => ({
                id: enemy.id,
                x: enemy.x,
                z: enemy.z,
                health: enemy.health,
                alive: enemy.alive
            })),

            helicopters: state.helicopters.map(heli => ({
                id: heli.id,
                definitionId: heli.definitionId,
                x: heli.x,
                z: heli.z,
                altitude: heli.altitude,
                yaw: heli.yaw,
                speed: heli.speed,
                health: heli.health,
                fuel: heli.fuel,
                landed: heli.landed,
                destroyed: heli.destroyed
            }))
        };
    }

    async function saveGame(silent = false) {
        if (state.saving) return false;

        state.saving = true;

        try {
            if (!state.database) await initializeDatabase();

            if (!state.database) {
                throw new Error("Le stockage local est indisponible.");
            }

            await dbPut("saves", {
                key: CONFIG.saveKey,
                data: makeSaveSnapshot()
            });

            await dbPut("settings", {
                key: CONFIG.settingsKey,
                data: state.settings
            });

            state.lastSaveTime = Date.now();

            setText(
                "lastSaveTime",
                new Date(state.lastSaveTime).toLocaleString()
            );

            setText("saveStorageStatus", "Sauvegarde IndexedDB réussie");

            if (!silent) toast("Progression sauvegardée.", "✓");

            addLog("Progression sauvegardée.");
            return true;

        } catch (error) {
            console.error("Erreur de sauvegarde :", error);
            if (!silent) toast("Échec de la sauvegarde.", "!");
            return false;

        } finally {
            state.saving = false;
        }
    }

    async function loadGame() {
        try {
            if (!state.database) await initializeDatabase();

            if (!state.database) {
                toast("Le stockage local est indisponible.", "!");
                return false;
            }

            const record = await dbGet("saves", CONFIG.saveKey);

            if (!record || !record.data) {
                toast("Aucune sauvegarde trouvée.", "!");
                return false;
            }

            const data = record.data;

            state.missionIndex = Math.max(0, Number(data.missionIndex) || 0);
            state.score = Math.max(0, Number(data.score) || 0);
            state.kills = Math.max(0, Number(data.kills) || 0);

            Object.assign(state.player, data.player || {});

            state.player.health = clamp(
                Number(state.player.health) || 100,
                1,
                CONFIG.maxHealth
            );

            state.player.armor = Math.max(0, Number(state.player.armor) || 0);
            state.player.alive = true;

            if (Array.isArray(data.allies)) {
                data.allies.forEach(savedAlly => {
                    const ally = state.allies.find(a => a.id === savedAlly.id);
                    if (ally) {
                        Object.assign(ally, savedAlly);
                        ally.health = Math.max(1, Number(ally.health) || 100);
                        ally.alive = true;
                    }
                });
            }

            state.selectedWeaponId = data.selectedWeaponId || "rifle";
            state.selectedEquipmentId = data.selectedEquipmentId || "standard";
            state.selectedHelicopterId = data.selectedHelicopterId || "scout";

            state.missionComplete = false;

            if (state.initialized) {
                rebuildActors();
                restoreSavedWorld(data);
                setupMission(state.missionIndex);
                updateAllHUD();
            }

            toast("Sauvegarde chargée.", "✓");
            addLog("Sauvegarde précédente restaurée.");

            return true;

        } catch (error) {
            console.error("Erreur de chargement :", error);
            toast("Impossible de charger la sauvegarde.", "!");
            return false;
        }
    }

    function restoreSavedWorld(data) {
        if (Array.isArray(data.enemies)) {
            data.enemies.forEach(saved => {
                const enemy = state.enemies.find(item => item.id === saved.id);
                if (enemy) {
                    enemy.x = saved.x;
                    enemy.z = saved.z;
                    enemy.health = saved.health;
                    enemy.alive = saved.alive;
                    updateActorMesh(enemy);
                }
            });
        }

        if (Array.isArray(data.helicopters)) {
            data.helicopters.forEach(saved => {
                const heli = state.helicopters.find(item => item.id === saved.id);
                if (heli) Object.assign(heli, saved);
            });
        }
    }

    async function resetGame() {
        state.player.x = 0;
        state.player.z = 0;
        state.player.health = 100;
        state.player.armor = 100;
        state.player.alive = true;
        state.player.inHelicopter = false;
        state.player.helicopterId = null;

        state.allies.forEach((ally, index) => {
            ally.x = index === 0 ? -4 : 4;
            ally.z = -3;
            ally.health = 100;
            ally.armor = 100;
            ally.alive = true;
            ally.inHelicopter = false;
            ally.helicopterId = null;
            ally.behavior = "follow";
            ally.targetId = null;
        });

        state.score = 0;
        state.kills = 0;
        state.missionIndex = 0;
        state.missionComplete = false;
        state.elapsedSinceStart = 0;
        state.ammo = 30;
        state.reserveAmmo = Infinity;

        if (state.initialized) {
            rebuildActors();
            spawnHelicopters();
            spawnEnemies();
            setupMission(0);
        }

        await saveGame(true);
        updateAllHUD();
        toast("Partie réinitialisée.", "✓");
    }

    /* =========================================================
       7. MATÉRIAUX ET ENVIRONNEMENT 3D
    ========================================================= */

    function makeMaterial(name, color, options = {}) {
        const material = new BABYLON.StandardMaterial(name, state.scene);

        material.diffuseColor = BABYLON.Color3.FromHexString(color);
        material.specularColor = new BABYLON.Color3(0.25, 0.25, 0.25);

        if (options.emissive) {
            material.emissiveColor = BABYLON.Color3.FromHexString(options.emissive);
        }

        if (options.alpha !== undefined) {
            material.alpha = options.alpha;
        }

        return material;
    }

    function createMaterials() {
        state.materials.ground = makeMaterial("ground", "#34483b");
        state.materials.road = makeMaterial("road", "#343a39");
        state.materials.building = makeMaterial("building", "#777e7b");
        state.materials.player = makeMaterial("player", "#20d7a0");
        state.materials.ally = makeMaterial("ally", "#2d9bff");
        state.materials.enemy = makeMaterial("enemy", "#c63737");
        state.materials.weapon = makeMaterial("weapon", "#202626");
        state.materials.helicopter = makeMaterial("helicopter", "#3d5144");
        state.materials.glass = makeMaterial("glass", "#2b6370", { alpha: 0.65 });
        state.materials.marker = makeMaterial("marker", "#f6c945", {
            emissive: "#4b3c10"
        });
        state.materials.tracer = makeMaterial("tracer", "#ffd66b", {
            emissive: "#ffb52c"
        });
    }

    function createGround() {
        const ground = BABYLON.MeshBuilder.CreateGround(
            "battlefieldGround",
            {
                width: CONFIG.worldSize,
                height: CONFIG.worldSize,
                subdivisions: 2
            },
            state.scene
        );

        ground.material = state.materials.ground;
        ground.isPickable = false;

        for (let i = -5; i <= 5; i++) {
            const roadX = BABYLON.MeshBuilder.CreateBox(
                "roadX" + i,
                {
                    width: CONFIG.worldSize,
                    height: 0.06,
                    depth: 5
                },
                state.scene
            );

            roadX.position.set(0, 0.035, i * 35);
            roadX.material = state.materials.road;
            roadX.isPickable = false;

            const roadZ = BABYLON.MeshBuilder.CreateBox(
                "roadZ" + i,
                {
                    width: 5,
                    height: 0.06,
                    depth: CONFIG.worldSize
                },
                state.scene
            );

            roadZ.position.set(i * 35, 0.04, 0);
            roadZ.material = state.materials.road;
            roadZ.isPickable = false;
        }

        for (let i = 0; i < 32; i++) {
            const x = random(-115, 115);
            const z = random(-115, 115);

            if (Math.abs(x) < 14 || Math.abs(z) < 14) continue;

            const building = BABYLON.MeshBuilder.CreateBox(
                "building_" + i,
                {
                    width: random(5, 12),
                    depth: random(5, 12),
                    height: random(3, 10)
                },
                state.scene
            );

            building.position.set(x, building.scaling.y / 2 + 2, z);
            building.position.y = building.getBoundingInfo()
                .boundingBox.extendSize.y;

            building.material = state.materials.building;
            building.isPickable = false;
        }

        const marker = BABYLON.MeshBuilder.CreateCylinder(
            "missionMarker",
            {
                diameter: 3,
                height: 0.2,
                tessellation: 32
            },
            state.scene
        );

        marker.position.set(25, 0.12, 25);
        marker.material = state.materials.marker;
        marker.isPickable = false;
    }

    function createLighting() {
        const light = new BABYLON.HemisphericLight(
            "ambientLight",
            new BABYLON.Vector3(0, 1, 0),
            state.scene
        );

        light.intensity = 0.95;

        const directional = new BABYLON.DirectionalLight(
            "sunLight",
            new BABYLON.Vector3(-0.4, -1, 0.3),
            state.scene
        );

        directional.position = new BABYLON.Vector3(30, 60, -20);
        directional.intensity = 0.8;
    }

    function createCamera() {
        state.camera = new BABYLON.ArcRotateCamera(
            "gameCamera",
            -Math.PI / 2,
            Math.PI / 3,
            CONFIG.cameraInitialRadius,
            new BABYLON.Vector3(0, 1, 0),
            state.scene
        );

        state.camera.lowerRadiusLimit = CONFIG.cameraMinRadius;
        state.camera.upperRadiusLimit = CONFIG.cameraMaxRadius;
        state.camera.wheelPrecision = 30;
        state.camera.panningSensibility = 0;
        state.camera.angularSensibilityX = 900;
        state.camera.angularSensibilityY = 900;
        state.camera.inertia = 0.72;
        state.camera.attachControl(state.canvas, true);

        state.cameraTarget = new BABYLON.Vector3(0, 1, 0);
    }

    /* =========================================================
       8. CRÉATION DES PERSONNAGES
    ========================================================= */

    function createCharacterMesh(actor) {
        if (!state.scene || actor.inHelicopter) return null;

        const root = new BABYLON.TransformNode(
            "actor_" + actor.id,
            state.scene
        );

        const body = BABYLON.MeshBuilder.CreateCapsule(
            "body_" + actor.id,
            {
                height: 1.45,
                radius: 0.32,
                tessellation: 8
            },
            state.scene
        );

        body.parent = root;
        body.position.y = 0.95;

        const head = BABYLON.MeshBuilder.CreateSphere(
            "head_" + actor.id,
            { diameter: 0.42, segments: 12 },
            state.scene
        );

        head.parent = root;
        head.position.y = 1.82;

        const weapon = BABYLON.MeshBuilder.CreateBox(
            "weapon_" + actor.id,
            {
                width: 0.12,
                height: 0.13,
                depth: 1.05
            },
            state.scene
        );

        weapon.parent = root;
        weapon.position.set(0.3, 1.35, 0.52);
        weapon.rotation.x = -0.04;
        weapon.material = state.materials.weapon;

        const color = actor.type === "enemy"
            ? state.materials.enemy
            : actor.type === "player"
                ? state.materials.player
                : state.materials.ally;

        body.material = color;
        head.material = color;

        root.position.set(actor.x, 0, actor.z);

        actor.mesh = root;
        actor.bodyMesh = body;
        actor.headMesh = head;
        actor.weaponMesh = weapon;

        root.metadata = { actorId: actor.id };

        return root;
    }

    function createEnemyMesh(enemy) {
        return createCharacterMesh(enemy);
    }

    function rebuildActors() {
        if (!state.scene) return;

        state.actors.forEach(mesh => {
            if (mesh && !mesh.isDisposed()) mesh.dispose(false, true);
        });

        state.actors.clear();

        const allActors = [
            state.player,
            ...state.allies,
            ...state.enemies
        ];

        allActors.forEach(actor => {
            if (!actor.alive || actor.inHelicopter) return;

            const mesh = createCharacterMesh(actor);
            if (mesh) state.actors.set(actor.id, mesh);
        });
    }

    function updateActorMesh(actor) {
        const mesh = actor.mesh;

        if (!mesh || mesh.isDisposed()) return;

        mesh.position.x = actor.x;
        mesh.position.z = actor.z;
        mesh.rotation.y = actor.yaw || 0;

        if (actor.jumping) {
            mesh.position.y = 0.7;
        } else {
            mesh.position.y = 0;
        }

        if (!actor.alive || actor.inHelicopter) {
            mesh.setEnabled(false);
        } else {
            mesh.setEnabled(true);
        }
    }

    function syncActorMeshes() {
        const actors = [state.player, ...state.allies, ...state.enemies];

        actors.forEach(actor => {
            if (!actor.alive || actor.inHelicopter) {
                if (actor.mesh) actor.mesh.setEnabled(false);
                return;
            }

            if (!actor.mesh || actor.mesh.isDisposed()) {
                createCharacterMesh(actor);
            }

            updateActorMesh(actor);
        });
    }

    /* =========================================================
       9. ENNEMIS ET RENFORTS
    ========================================================= */

    function spawnEnemies() {
        state.enemies.forEach(enemy => {
            if (enemy.mesh && !enemy.mesh.isDisposed()) enemy.mesh.dispose();
        });

        state.enemies = [];

        for (let i = 0; i < CONFIG.enemyCount; i++) {
            const enemy = {
                id: "enemy_" + i,
                name: "Hostile " + (i + 1),
                type: "enemy",
                x: random(-105, 105),
                z: random(-105, 105),
                health: 100,
                armor: 0,
                alive: true,
                weaponId: "rifle",
                lastShotAt: 0,
                targetId: null,
                yaw: 0,
                speed: random(1.0, 2.4)
            };

            if (Math.hypot(enemy.x, enemy.z) < 20) {
                enemy.x += 35;
                enemy.z += 35;
            }

            state.enemies.push(enemy);
        }

        if (state.scene) {
            state.enemies.forEach(enemy => createEnemyMesh(enemy));
        }
    }

    function maybeSpawnReinforcements() {
        const aliveCount = state.enemies.filter(enemy => enemy.alive).length;

        if (aliveCount > 5 || state.enemies.length > 70) return;

        for (let i = 0; i < 5; i++) {
            const enemy = {
                id: "reinforcement_" + Date.now() + "_" + i,
                name: "Renfort hostile",
                type: "enemy",
                x: state.player.x + random(-35, 35),
                z: state.player.z + random(-35, 35),
                health: 100,
                armor: 0,
                alive: true,
                weaponId: "rifle",
                lastShotAt: 0,
                targetId: null,
                yaw: 0,
                speed: random(1.2, 2.4)
            };

            state.enemies.push(enemy);

            if (state.scene) createEnemyMesh(enemy);
        }

        addLog("Des renforts hostiles approchent.", "warning");
    }

    /* =========================================================
       10. HÉLICOPTÈRES
    ========================================================= */

    function getHelicopterDefinition(id) {
        return state.dynamicContent.helicopters.find(item => item.id === id)
            || DEFAULT_HELICOPTERS[0];
    }

    function getCurrentHelicopter() {
        return state.helicopters.find(heli =>
            heli.id === state.player.helicopterId
        ) || null;
    }

    function createHelicopterMesh(heli) {
        const root = new BABYLON.TransformNode(
            "helicopter_" + heli.id,
            state.scene
        );

        const body = BABYLON.MeshBuilder.CreateBox(
            "heliBody_" + heli.id,
            {
                width: 1.8,
                height: 1.1,
                depth: 4.0
            },
            state.scene
        );

        body.parent = root;
        body.material = state.materials.helicopter;

        const cockpit = BABYLON.MeshBuilder.CreateBox(
            "heliCockpit_" + heli.id,
            {
                width: 1.35,
                height: 0.7,
                depth: 1.2
            },
            state.scene
        );

        cockpit.parent = root;
        cockpit.position.set(0, 0.35, 1.4);
        cockpit.material = state.materials.glass;

        const tail = BABYLON.MeshBuilder.CreateBox(
            "heliTail_" + heli.id,
            {
                width: 0.3,
                height: 0.3,
                depth: 3.0
            },
            state.scene
        );

        tail.parent = root;
        tail.position.set(0, 0.1, -3.0);
        tail.material = state.materials.helicopter;

        const rotor = BABYLON.MeshBuilder.CreateBox(
            "heliRotor_" + heli.id,
            {
                width: 7,
                height: 0.08,
                depth: 0.15
            },
            state.scene
        );

        rotor.parent = root;
        rotor.position.y = 0.8;
        rotor.material = state.materials.weapon;

        heli.mesh = root;
        heli.bodyMesh = body;
        heli.rotorMesh = rotor;

        updateHelicopterMesh(heli);
    }

    function updateHelicopterMesh(heli) {
        if (!heli.mesh || heli.mesh.isDisposed()) return;

        heli.mesh.position.set(heli.x, heli.altitude + 0.8, heli.z);
        heli.mesh.rotation.y = heli.yaw || 0;

        if (heli.rotorMesh && !heli.landed && !heli.destroyed) {
            heli.rotorMesh.rotation.y += 0.2;
        }

        if (heli.destroyed) heli.mesh.setEnabled(false);
    }

    function spawnHelicopters() {
        state.helicopters.forEach(heli => {
            if (heli.mesh && !heli.mesh.isDisposed()) heli.mesh.dispose(false, true);
        });

        state.helicopters = [];

        const positions = [
            { x: 14, z: 10 },
            { x: -25, z: 20 },
            { x: 35, z: -20 },
            { x: -45, z: -35 },
            { x: 65, z: 45 }
        ];

        DEFAULT_HELICOPTERS.forEach((definition, index) => {
            const position = positions[index % positions.length];

            const heli = {
                id: "heli_" + index,
                definitionId: definition.id,
                name: definition.name,
                x: position.x,
                z: position.z,
                altitude: 0,
                yaw: 0,
                speed: 0,
                health: definition.health,
                fuel: definition.fuel,
                landed: true,
                destroyed: false,
                occupied: false,
                passengers: [],
                maxAltitude: definition.maxAltitude,
                maxSpeed: definition.speed,
                verticalTarget: 0,
                targetX: null,
                targetZ: null,
                velocityX: 0,
                velocityZ: 0,
                enemyVehicle: false
            };

            state.helicopters.push(heli);

            if (state.scene) createHelicopterMesh(heli);
        });

        renderHelicopterLibrary();
    }

    function findNearestAccessibleHelicopter(actor = state.player) {
        let best = null;
        let bestDistance = Infinity;

        state.helicopters.forEach(heli => {
            if (heli.destroyed || !heli.landed || heli.altitude > 1.5) return;

            const d = distance2D(actor, heli);

            if (d < bestDistance) {
                bestDistance = d;
                best = heli;
            }
        });

        return best && bestDistance <= 12 ? best : null;
    }

    function boardHelicopter() {
        if (state.player.inHelicopter) {
            toast("Vous êtes déjà dans un hélicoptère.", "!");
            return false;
        }

        const heli = findNearestAccessibleHelicopter();

        if (!heli) {
            toast("Aucun hélicoptère accessible à proximité.", "!");
            return false;
        }

        if (!heli.landed || heli.altitude > 1.5 || heli.destroyed) {
            toast("L'hélicoptère doit être posé pour embarquer.", "!");
            return false;
        }

        state.player.inHelicopter = true;
        state.player.helicopterId = heli.id;
        heli.occupied = true;

        state.player.x = heli.x;
        state.player.z = heli.z;

        if (state.player.mesh) state.player.mesh.setEnabled(false);

        setText("playerStateBadge", "À BORD");
        showElement("helicopterHud");
        showElement("helicopterFlightControls");

        addLog("Selvandieu est monté dans " + heli.name + ".");
        toast("Embarquement effectué.", "✓");

        updateAllHUD();
        return true;
    }

    function exitHelicopter() {
        const heli = getCurrentHelicopter();

        if (!heli) {
            state.player.inHelicopter = false;
            state.player.helicopterId = null;
            hideElement("helicopterHud");
            hideElement("helicopterFlightControls");
            return false;
        }

        if (!heli.landed || heli.altitude > 1.5) {
            toast("Atterrissez avant de descendre.", "!");
            return false;
        }

        state.player.inHelicopter = false;
        state.player.helicopterId = null;
        heli.occupied = false;

        state.player.x = heli.x + 2.5;
        state.player.z = heli.z;

        if (state.player.mesh) {
            state.player.mesh.position.set(state.player.x, 0, state.player.z);
            state.player.mesh.setEnabled(true);
        }

        hideElement("helicopterHud");
        hideElement("helicopterFlightControls");

        setText("playerStateBadge", "AU SOL");

        addLog("Selvandieu est descendu de l'hélicoptère.");
        toast("Vous êtes au sol.", "✓");

        updateAllHUD();
        return true;
    }

    function helicopterTakeoff() {
        const heli = getCurrentHelicopter();

        if (!heli) {
            toast("Montez d'abord dans un hélicoptère.", "!");
            return false;
        }

        if (heli.destroyed) {
            toast("Ce véhicule est détruit.", "!");
            return false;
        }

        if (!heli.landed) {
            toast("L'hélicoptère est déjà en vol.", "!");
            return false;
        }

        heli.landed = false;
        heli.verticalTarget = Math.min(heli.maxAltitude, 12);

        addLog("Décollage initié.");
        toast("Décollage en cours.", "✓");

        return true;
    }

    function helicopterLand() {
        const heli = getCurrentHelicopter();

        if (!heli) {
            toast("Aucun hélicoptère piloté.", "!");
            return false;
        }

        heli.verticalTarget = 0;
        heli.landed = false;

        addLog("Atterrissage initié.");
        toast("Descente progressive en cours.", "✓");

        return true;
    }

    function helicopterHover() {
        const heli = getCurrentHelicopter();
        if (!heli) return;

        heli.verticalTarget = heli.altitude;
        heli.speed = 0;
        heli.velocityX = 0;
        heli.velocityZ = 0;

        toast("Hélicoptère stabilisé.", "✓");
    }

    function fireHelicopterWeapon() {
        const heli = getCurrentHelicopter();

        if (!heli || heli.landed || heli.destroyed) {
            toast("Le tir aérien nécessite un hélicoptère en vol.", "!");
            return false;
        }

        if (now() - state.lastHelicopterShotAt < 280) return false;

        state.lastHelicopterShotAt = now();

        const definition = getHelicopterDefinition(heli.definitionId);
        const target = getNearestEnemy(heli, 125);

        createVisualShot(
            new BABYLON.Vector3(heli.x, heli.altitude + 1, heli.z),
            target
                ? new BABYLON.Vector3(target.x, 1, target.z)
                : new BABYLON.Vector3(
                    heli.x + Math.sin(heli.yaw) * 35,
                    heli.altitude,
                    heli.z + Math.cos(heli.yaw) * 35
                )
        );

        if (target) {
            damageActor(target, definition.weaponDamage, state.player);
        }

        return true;
    }

    function updateHelicopterPhysics(dt) {
        state.helicopters.forEach(heli => {
            if (heli.destroyed) return;

            if (heli.id === state.player.helicopterId) {
                const flight = state.input.flight;

                if (flight.accelerate) {
                    heli.speed = clamp(heli.speed + 10 * dt, 0, heli.maxSpeed);
                }

                if (flight.brake) {
                    heli.speed = Math.max(0, heli.speed - 16 * dt);
                }

                if (flight.turnLeft) heli.yaw -= 1.5 * dt;
                if (flight.turnRight) heli.yaw += 1.5 * dt;

                if (flight.ascend) {
                    heli.verticalTarget = clamp(
                        heli.verticalTarget + 10 * dt,
                        0,
                        heli.maxAltitude
                    );
                    heli.landed = false;
                }

                if (flight.descend) {
                    heli.verticalTarget = Math.max(0, heli.verticalTarget - 10 * dt);
                    heli.landed = false;
                }

                const forwardX = Math.sin(heli.yaw);
                const forwardZ = Math.cos(heli.yaw);

                heli.x += forwardX * heli.speed * dt;
                heli.z += forwardZ * heli.speed * dt;

                heli.altitude +=
                    (heli.verticalTarget - heli.altitude) *
                    Math.min(1, dt * 1.8);

                if (heli.altitude <= 0.08 && heli.verticalTarget <= 0.01) {
                    heli.altitude = 0;
                    heli.landed = true;
                    heli.speed *= Math.max(0, 1 - dt * 2);
                } else {
                    heli.landed = false;
                }

                heli.fuel = Math.max(0, heli.fuel - dt * 0.015);

                if (heli.fuel <= 0) {
                    heli.speed = Math.max(0, heli.speed - 12 * dt);
                    heli.verticalTarget = Math.max(0, heli.verticalTarget - 2 * dt);
                }

                if (state.player.inHelicopter) {
                    state.player.x = heli.x;
                    state.player.z = heli.z;
                }

                if (heli.landed && state.player.inHelicopter) {
                    setText("helicopterStatus", "AU SOL");
                } else {
                    setText("helicopterStatus", "EN VOL");
                }

                setText("helicopterSpeed", Math.round(heli.speed * 3.6));
                setText("helicopterAltitude", Math.round(heli.altitude));
                setText("helicopterHealth", Math.round(heli.health) + " %");
                setText("helicopterFuel", Math.round(heli.fuel) + " %");

            } else {
                heli.rotorPhase = (heli.rotorPhase || 0) + dt * 12;
            }

            updateHelicopterMesh(heli);
        });

        const current = getCurrentHelicopter();

        if (!current) {
            hideElement("helicopterHud");
            hideElement("helicopterFlightControls");
        }
    }

    /* =========================================================
       11. ARMES ET TIRS
    ========================================================= */

    function getWeapon(id = state.selectedWeaponId) {
        return state.dynamicContent.weapons.find(weapon => weapon.id === id)
            || DEFAULT_WEAPONS[1];
    }

    function getEquipment(id = state.selectedEquipmentId) {
        return state.dynamicContent.equipment.find(item => item.id === id)
            || DEFAULT_EQUIPMENT[0];
    }

    function getNearestEnemy(origin = state.player, maxRange = Infinity) {
        let best = null;
        let bestDistance = maxRange;

        for (const enemy of state.enemies) {
            if (!enemy.alive || enemy.inHelicopter) continue;

            const d = distance2D(origin, enemy);

            if (d < bestDistance) {
                bestDistance = d;
                best = enemy;
            }
        }

        return best;
    }

    function createVisualShot(from, to) {
        if (!state.scene || !BABYLON.Vector3) return;

        const line = BABYLON.MeshBuilder.CreateLines(
            "shot_" + Date.now() + "_" + Math.random(),
            {
                points: [from, to],
                updatable: false
            },
            state.scene
        );

        line.color = new BABYLON.Color3(1, 0.72, 0.22);

        setTimeout(() => {
            if (line && !line.isDisposed()) line.dispose();
        }, 95);
    }

    function actorPosition(actor) {
        if (actor === state.player && actor.inHelicopter) {
            const heli = getCurrentHelicopter();

            if (heli) {
                return new BABYLON.Vector3(
                    heli.x,
                    heli.altitude + 1,
                    heli.z
                );
            }
        }

        return new BABYLON.Vector3(actor.x, 1.35, actor.z);
    }

    function fireWeapon(shooter = state.player, target = null) {
        if (!shooter || !shooter.alive || state.paused || !state.running) {
            return false;
        }

        if (shooter === state.player && shooter.inHelicopter) {
            return fireHelicopterWeapon();
        }

        const weapon = getWeapon(shooter.weaponId || state.selectedWeaponId);
        const timestamp = now();

        if (timestamp - (shooter.lastShotAt || 0) < weapon.fireRate) {
            return false;
        }

        if (shooter === state.player && state.ammo <= 0) {
            reloadWeapon(true);
            return false;
        }

        if (!target) {
            target = shooter.targetId
                ? state.enemies.find(enemy => enemy.id === shooter.targetId && enemy.alive)
                : null;
        }

        if (!target) target = getNearestEnemy(shooter, weapon.range);

        const origin = actorPosition(shooter);

        let destination;

        if (target) {
            const distance = distance2D(shooter, target);

            if (distance > weapon.range) {
                target = null;
            }
        }

        if (target) {
            const spread = (1 - weapon.accuracy) * 9;

            destination = new BABYLON.Vector3(
                target.x + random(-spread, spread),
                1.2 + random(-spread * 0.1, spread * 0.1),
                target.z + random(-spread, spread)
            );

            if (distance2D(shooter, target) <= weapon.range) {
                damageActor(target, weapon.damage, shooter);
            }

        } else {
            const yaw = shooter.yaw || 0;

            destination = new BABYLON.Vector3(
                shooter.x + Math.sin(yaw) * weapon.range,
                1.2,
                shooter.z + Math.cos(yaw) * weapon.range
            );
        }

        createVisualShot(origin, destination);

        shooter.lastShotAt = timestamp;

        if (shooter === state.player) {
            state.lastShotAt = timestamp;

            if (state.ammo > 0) state.ammo--;

            if (state.ammo <= 0) {
                setTimeout(() => reloadWeapon(true), 150);
            }
        }

        return true;
    }

    function reloadWeapon(automatic = false) {
        const weapon = getWeapon();

        if (state.ammo >= weapon.magazine) return false;

        if (CONFIG.infiniteReserveAmmo) {
            state.ammo = weapon.magazine;
            state.reserveAmmo = Infinity;

            updatePlayerHUD();

            if (!automatic) toast("Chargeur rechargé.", "✓");

            return true;
        }

        const amount = Math.min(
            weapon.magazine - state.ammo,
            state.reserveAmmo
        );

        if (amount <= 0) {
            toast("Aucune munition disponible.", "!");
            return false;
        }

        state.ammo += amount;
        state.reserveAmmo -= amount;

        updatePlayerHUD();

        if (!automatic) toast("Rechargement terminé.", "✓");

        return true;
    }

    function performMeleeAttack() {
        const target = getNearestEnemy(state.player, 3.5);

        if (!target) {
            toast("Aucun ennemi à portée de combat rapproché.", "!");
            return;
        }

        damageActor(target, 50, state.player);
        addLog("Attaque rapprochée exécutée.");
    }

    /* =========================================================
       12. PROTECTION ET DÉGÂTS
    ========================================================= */

    function damageActor(actor, damage, attacker = null) {
        if (!actor || !actor.alive) return false;

        if (actor.type === "enemy") {
            actor.health -= damage;

            if (actor.health <= 0) {
                actor.health = 0;
                actor.alive = false;

                state.kills++;
                state.score += 100;

                if (actor.mesh) actor.mesh.setEnabled(false);

                if (attacker && attacker.type === "ally") {
                    addLog(attacker.name + " a neutralisé un hostile.");
                } else {
                    addLog("Hostile neutralisé.");
                }

                updateObjectiveProgress("kill", 1);
                updateAllHUD();
            }

            return true;
        }

        const equipment = getEquipment(actor.equipmentId || state.selectedEquipmentId);
        const reduction = Math.max(
            CONFIG.damageReduction,
            Number(equipment.damageReduction) || 0
        );

        const reducedDamage = Math.max(1, damage * (1 - reduction));

        let remaining = reducedDamage;

        if (actor.armor > 0) {
            const absorbed = Math.min(actor.armor, remaining);
            actor.armor -= absorbed;
            remaining -= absorbed;
        }

        actor.health -= remaining;

        if (actor.health <= 0) {
            actor.health = 1;
            actor.alive = true;

            addLog(actor.name + " est protégé par son équipement tactique.");
        }

        if (actor === state.player) {
            state.health = actor.health;
            state.armor = actor.armor;
            updatePlayerHUD();
        }

        updateTeamStatus();
        return true;
    }

    function damagePlayer(damage) {
        return damageActor(state.player, damage);
    }

    function applyProtectionToTeam() {
        const equipment = getEquipment();

        [state.player, ...state.allies].forEach(actor => {
            actor.equipmentId = equipment.id;
            actor.armor = Math.max(actor.armor || 0, equipment.armor);
            actor.health = Math.max(1, actor.health || 100);
            actor.alive = true;
        });

        state.health = state.player.health;
        state.armor = state.player.armor;

        updateAllHUD();
    }

    /* =========================================================
       13. MOUVEMENT DU JOUEUR ET DES ALLIÉS
    ========================================================= */

    function getPlayerSpeed() {
        return state.input.sprint
            ? CONFIG.playerSprintSpeed
            : CONFIG.playerWalkSpeed;
    }

    function updatePlayerMovement(dt) {
        const player = state.player;

        if (!player.alive || player.inHelicopter) return;

        let x = 0;
        let z = 0;

        x += state.input.joystickX;
        z += state.input.joystickY;

        if (state.input.forward) z += 1;
        if (state.input.backward) z -= 1;
        if (state.input.left) x -= 1;
        if (state.input.right) x += 1;

        const magnitude = Math.hypot(x, z);

        if (magnitude > 1) {
            x /= magnitude;
            z /= magnitude;
        }

        if (magnitude > 0.05) {
            const speed = getPlayerSpeed();
            const cameraYaw = state.camera ? state.camera.alpha : 0;

            const worldX = x * Math.cos(cameraYaw) - z * Math.sin(cameraYaw);
            const worldZ = x * Math.sin(cameraYaw) + z * Math.cos(cameraYaw);

            player.x += worldX * speed * dt;
            player.z += worldZ * speed * dt;

            player.yaw = Math.atan2(worldX, worldZ);
        }

        player.x = clamp(player.x, -125, 125);
        player.z = clamp(player.z, -125, 125);

        if (player.jumping && now() > player.jumpUntil) {
            player.jumping = false;
        }

        updateActorMesh(player);
    }

    function moveActorToward(actor, targetX, targetZ, speed, dt) {
        const dx = targetX - actor.x;
        const dz = targetZ - actor.z;
        const d = Math.hypot(dx, dz);

        if (d < 0.05) return;

        const step = Math.min(d, speed * dt);

        actor.x += dx / d * step;
        actor.z += dz / d * step;
        actor.yaw = Math.atan2(dx, dz);

        updateActorMesh(actor);
    }

    function updateAllyMovement(dt) {
        state.allies.forEach((ally, index) => {
            if (!ally.alive || ally.inHelicopter) return;

            if (ally.behavior === "hold") return;

            if (ally.behavior === "attack") {
                const target = getNearestEnemy(ally, 100);

                if (target && distance2D(ally, target) > 12) {
                    moveActorToward(
                        ally,
                        target.x - Math.sign(target.x - ally.x) * 7,
                        target.z - Math.sign(target.z - ally.z) * 7,
                        CONFIG.allySpeed,
                        dt
                    );
                }

                return;
            }

            if (ally.behavior === "retreat") {
                const dx = ally.x - state.player.x;
                const dz = ally.z - state.player.z;
                const d = Math.max(1, Math.hypot(dx, dz));

                moveActorToward(
                    ally,
                    ally.x + dx / d * 8,
                    ally.z + dz / d * 8,
                    CONFIG.allySpeed,
                    dt
                );

                return;
            }

            const formationOffset = index === 0 ? -3 : 3;

            const targetX = state.player.x + formationOffset;
            const targetZ = state.player.z - 4;

            if (distance2D(ally, state.player) > 6) {
                moveActorToward(
                    ally,
                    targetX,
                    targetZ,
                    CONFIG.allySpeed,
                    dt
                );
            }
        });
    }

    /* =========================================================
       14. IA DES ALLIÉS : DÉTECTION ET TIRS AUTOMATIQUES
    ========================================================= */

    function updateAllyCombat() {
        const timestamp = now();

        state.allies.forEach(ally => {
            if (!ally.alive || ally.inHelicopter) return;
            if (ally.behavior === "hold" && !ally.targetId) {
                // Un allié immobile peut quand même défendre sa position.
            }

            let target = ally.targetId
                ? state.enemies.find(enemy =>
                    enemy.id === ally.targetId && enemy.alive
                )
                : null;

            if (!target) {
                target = getNearestEnemy(ally, 100);
                ally.targetId = target ? target.id : null;
            }

            if (!target) return;

            const weapon = getWeapon(ally.weaponId || "rifle");
            const d = distance2D(ally, target);

            if (d > weapon.range) return;

            ally.yaw = Math.atan2(target.x - ally.x, target.z - ally.z);

            if (timestamp - (ally.lastShotAt || 0) >= weapon.fireRate) {
                fireWeapon(ally, target);
            }
        });
    }

    /* =========================================================
       15. IA ENNEMIE
    ========================================================= */

    function findNearestLivingTarget(enemy) {
        const targets = [state.player, ...state.allies].filter(actor =>
            actor.alive && !actor.inHelicopter
        );

        let best = null;
        let bestDistance = Infinity;

        targets.forEach(actor => {
            const d = distance2D(enemy, actor);

            if (d < bestDistance) {
                best = actor;
                bestDistance = d;
            }
        });

        return best;
    }

    function updateEnemyAI(dt) {
        const timestamp = now();

        state.enemies.forEach(enemy => {
            if (!enemy.alive) return;

            const target = findNearestLivingTarget(enemy);
            if (!target) return;

            const d = distance2D(enemy, target);

            enemy.yaw = Math.atan2(target.x - enemy.x, target.z - enemy.z);

            if (d > 18) {
                moveActorToward(
                    enemy,
                    target.x - Math.sin(enemy.yaw) * 12,
                    target.z - Math.cos(enemy.yaw) * 12,
                    enemy.speed,
                    dt
                );
            }

            if (d < 48 && timestamp - enemy.lastShotAt > 900) {
                enemy.lastShotAt = timestamp;

                const weapon = getWeapon("rifle");

                createVisualShot(
                    actorPosition(enemy),
                    actorPosition(target)
                );

                damageActor(target, weapon.damage * 0.6, enemy);
            }
        });
    }

    /* =========================================================
       16. MISSIONS ET OBJECTIFS
    ========================================================= */

    function setupMission(index = state.missionIndex) {
        const templates = state.dynamicContent.missions.length
            ? state.dynamicContent.missions
            : MISSION_TEMPLATES;

        const template = templates[index % templates.length];

        state.missionIndex = index;
        state.missionComplete = false;
        state.missionStartTime = Date.now();
        state.missionElapsed = 0;

        state.mission = {
            title: template.title,
            description: template.description,
            objectives: template.objectives.map((objective, i) => ({
                id: "objective_" + i,
                type: objective.type,
                label: objective.label,
                target: objective.target,
                progress: 0,
                complete: false
            }))
        };

        renderMission();
        updateMissionHUD();
        setText("missionHeaderLabel", "OPÉRATION " +
            String(index + 1).padStart(3, "0"));

        addLog("Mission lancée : " + template.title);
    }

    function renderMission() {
        if (!state.mission) return;

        setText("missionTitle", state.mission.title.toUpperCase());
        setText("missionDescription", state.mission.description);

        const container = $("missionObjectives");
        if (!container) return;

        container.innerHTML = state.mission.objectives.map(objective => `
            <li class="objective-item ${objective.complete ? "completed" : ""}">
                <span class="objective-marker"></span>
                <span>
                    ${escapeHTML(objective.label)}
                    <small>
                        ${Math.min(objective.progress, objective.target)}
                        / ${objective.target}
                    </small>
                </span>
            </li>
        `).join("");
    }

    function updateObjectiveProgress(type, amount = 1) {
        if (!state.mission || state.missionComplete) return;

        state.mission.objectives.forEach(objective => {
            if (objective.type !== type || objective.complete) return;

            objective.progress = Math.min(
                objective.target,
                objective.progress + amount
            );

            objective.complete = objective.progress >= objective.target;
        });

        renderMission();
        updateMissionHUD();
        checkMissionCompletion();
    }

    function updateMissionHUD() {
        if (!state.mission) return;

        const objectives = state.mission.objectives;
        const completeCount = objectives.filter(item => item.complete).length;

        const percent = objectives.length
            ? completeCount / objectives.length * 100
            : 0;

        setText("missionProgressText", Math.round(percent) + "%");
        setWidth("missionProgressBar", percent);
        setText("playerScore", state.score);
    }

    function checkMissionCompletion() {
        if (!state.mission || state.missionComplete) return;

        if (state.mission.objectives.every(objective => objective.complete)) {
            state.missionComplete = true;
            state.running = false;

            showMissionResult(true);
            saveGame(true);
        }
    }

    function showMissionResult(success) {
        const objectives = state.mission
            ? state.mission.objectives
            : [];

        setText(
            "missionResultTitle",
            success ? "MISSION ACCOMPLIE" : "MISSION TERMINÉE"
        );

        setText(
            "missionResultDescription",
            success
                ? "Tous les objectifs ont été accomplis. Votre équipe a réussi l'opération."
                : "L'opération est terminée."
        );

        setText("missionResultPoints", state.score);
        setText(
            "missionResultObjectives",
            objectives.filter(item => item.complete).length + "/" + objectives.length
        );

        setText(
            "missionResultTime",
            formatTime((Date.now() - state.missionStartTime) / 1000)
        );

        showElement("missionResultOverlay");
    }

    function startNextMission() {
        hideElement("missionResultOverlay");

        state.missionIndex++;
        state.running = true;
        state.paused = false;
        state.missionComplete = false;

        state.player.x = 0;
        state.player.z = 0;
        state.player.health = 100;
        state.player.armor = getEquipment().armor;
        state.player.alive = true;
        state.player.inHelicopter = false;
        state.player.helicopterId = null;

        state.allies.forEach((ally, index) => {
            ally.x = index === 0 ? -4 : 4;
            ally.z = -3;
            ally.health = 100;
            ally.armor = getEquipment().armor;
            ally.alive = true;
            ally.inHelicopter = false;
            ally.helicopterId = null;
            ally.behavior = "follow";
            ally.targetId = null;
        });

        spawnEnemies();
        spawnHelicopters();
        rebuildActors();
        setupMission(state.missionIndex);
        applyProtectionToTeam();
        updateAllHUD();

        addLog("Mission suivante initialisée.");
    }

    /* =========================================================
       17. HUD, CARTE ET COORDONNÉES
    ========================================================= */

    function updatePlayerHUD() {
        setWidth("playerHealthBar", state.player.health);
        setText("playerHealthText", Math.round(state.player.health));

        setWidth("playerArmorBar", state.player.armor);
        setText("playerArmorText", Math.round(state.player.armor));

        const weapon = getWeapon();

        setText("currentWeaponName", weapon.name);
        setText("currentAmmo", state.ammo);
        setText(
            "reserveAmmo",
            CONFIG.infiniteReserveAmmo ? "∞" : state.reserveAmmo
        );

        setText("playerStateBadge", state.player.inHelicopter ? "À BORD" : "AU SOL");
    }

    function updateTeamStatus() {
        const ranise = state.allies.find(ally => ally.id === "ranise");
        const kerlande = state.allies.find(ally => ally.id === "kerlande");

        const raniseStatus = $("raniseOnlineStatus");
        const kerlandeStatus = $("kerlandeOnlineStatus");

        if (raniseStatus) {
            raniseStatus.style.opacity = ranise && ranise.alive ? "1" : "0.3";
        }

        if (kerlandeStatus) {
            kerlandeStatus.style.opacity = kerlande && kerlande.alive ? "1" : "0.3";
        }

        const panel = $("playerHud");

        if (panel) {
            panel.dataset.teamReady = String(
                state.allies.every(ally => ally.alive)
            );
        }
    }

    function updateCoordinates() {
        setText(
            "playerCoordinates",
            "X: " + state.player.x.toFixed(1) +
            " | Z: " + state.player.z.toFixed(1)
        );
    }

    function drawMinimap() {
        const canvas = $("minimapCanvas");
        if (!canvas || !state.settings.showMinimap) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#10231b";
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = "rgba(100,180,140,.22)";
        ctx.lineWidth = 1;

        for (let i = 0; i <= 10; i++) {
            const p = i * width / 10;

            ctx.beginPath();
            ctx.moveTo(p, 0);
            ctx.lineTo(p, height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, p);
            ctx.lineTo(width, p);
            ctx.stroke();
        }

        const toMap = actor => ({
            x: width / 2 + actor.x / CONFIG.worldSize * width,
            y: height / 2 + actor.z / CONFIG.worldSize * height
        });

        const drawDot = (actor, color, radius = 4) => {
            if (!actor.alive) return;

            const p = toMap(actor);

            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        };

        state.helicopters.forEach(heli => {
            if (heli.destroyed) return;
            drawDot(heli, "#f5d45c", 4);
        });

        state.enemies.forEach(enemy => drawDot(enemy, "#f34b4b", 3));
        state.allies.forEach(ally => drawDot(ally, "#55aaff", 4));
        drawDot(state.player, "#34e6a6", 5);
    }

    function updateHelicopterHUD() {
        const heli = getCurrentHelicopter();

        if (!heli) {
            hideElement("helicopterHud");
            hideElement("helicopterFlightControls");
            return;
        }

        showElement("helicopterHud");
        showElement("helicopterFlightControls");
    }

    function updateAllHUD() {
        updatePlayerHUD();
        updateCoordinates();
        updateMissionHUD();
        updateTeamStatus();
        updateHelicopterHUD();
        drawMinimap();
    }

    /* =========================================================
       18. COMMUNICATION TACTIQUE
    ========================================================= */

    function addChatMessage(sender, message, type = "expert") {
        const record = {
            sender,
            message,
            type,
            timestamp: new Date().toLocaleTimeString()
        };

        state.chatMessages.push(record);
        state.chatMessages = state.chatMessages.slice(-CONFIG.maxChatMessages);

        const container = $("communicationMessages");
        if (container) {
            const article = document.createElement("article");

            article.className = type === "system"
                ? "chat-system-message"
                : "chat-message";

            const heading = document.createElement("strong");
            heading.textContent = sender;

            const paragraph = document.createElement("p");
            paragraph.textContent = message;

            const time = document.createElement("small");
            time.textContent = record.timestamp;

            article.append(heading, paragraph, time);
            container.appendChild(article);

            container.scrollTop = container.scrollHeight;
        }

        if ($("communicationPanel")?.classList.contains("hidden")) {
            state.unreadMessages++;
            setText("unreadMessagesBadge", state.unreadMessages);
            showElement("unreadMessagesBadge");
        }
    }

    function getExpertName(id) {
        if (id === "selvandieu") return "Selvandieu";

        const ally = state.allies.find(item => item.id === id);
        return ally ? ally.name : "Système";
    }

    function getInteractionResponse(command, senderId) {
        const ally = state.allies.find(item => item.id === senderId);

        switch (command) {
            case "where":
            case "position":
                return ally
                    ? `${ally.name} : position X ${ally.x.toFixed(1)}, Z ${ally.z.toFixed(1)}.`
                    : `Selvandieu : position X ${state.player.x.toFixed(1)}, Z ${state.player.z.toFixed(1)}.`;

            case "follow":
            case "regroup":
            case "rally":
                if (ally) ally.behavior = "follow";
                else state.allies.forEach(item => item.behavior = "follow");
                return "Reçu. Retour en formation auprès de Selvandieu.";

            case "hold":
                if (ally) ally.behavior = "hold";
                else state.allies.forEach(item => item.behavior = "hold");
                return "Position maintenue. Surveillance active.";

            case "advance":
            case "cover":
            case "assist":
            case "protect":
                if (ally) ally.behavior = "follow";
                else state.allies.forEach(item => item.behavior = "follow");
                return "Ordre reçu. Progression tactique engagée.";

            case "retreat":
                if (ally) ally.behavior = "retreat";
                else state.allies.forEach(item => item.behavior = "retreat");
                return "Repli tactique en cours.";

            case "attack":
            case "focus":
            case "clear":
            case "flank":
            case "suppress":
            case "defend":
                if (ally) ally.behavior = "attack";
                else state.allies.forEach(item => item.behavior = "attack");
                return "Engagement autorisé. Recherche et neutralisation des hostiles.";

            case "ceasefire":
                if (ally) ally.behavior = "hold";
                else state.allies.forEach(item => item.behavior = "hold");
                return "Cessez-le-feu reçu. Les experts conservent leur position.";

            case "enemy": {
                const count = state.enemies.filter(item => item.alive).length;
                return `${count} hostile(s) encore détecté(s) dans la zone.`;
            }

            case "status":
            case "health":
            case "report":
            case "ready":
                return teamStatusText();

            case "mission":
            case "objectives":
                return state.mission
                    ? `Mission : ${state.mission.title}. ${state.mission.objectives.filter(o => o.complete).length}/${state.mission.objectives.length} objectifs terminés.`
                    : "Aucune mission active.";

            case "coordinates":
                return `Coordonnées : X ${state.player.x.toFixed(1)}, Z ${state.player.z.toFixed(1)}.`;

            case "locateheli": {
                const heli = findNearestAccessibleHelicopter(state.player);
                return heli
                    ? `${heli.name} repéré à ${distance2D(state.player, heli).toFixed(1)} mètres.`
                    : "Aucun hélicoptère posé à portée immédiate.";
            }

            case "prepare_boarding":
                return findNearestAccessibleHelicopter(state.player)
                    ? "Hélicoptère posé et accessible. Utilisez MONTER pour embarquer."
                    : "Aucun hélicoptère accessible pour l'instant.";

            case "board":
                if (ally) {
                    return boardAlly(ally)
                        ? `${ally.name} a embarqué dans l'hélicoptère.`
                        : "L'embarquement est impossible. Le véhicule doit être posé et proche.";
                }

                return boardHelicopter()
                    ? "Selvandieu est à bord."
                    : "Impossible d'embarquer maintenant.";

            case "takeoff":
                return helicopterTakeoff()
                    ? "Décollage initié."
                    : "Embarquez d'abord dans un hélicoptère.";

            case "land":
                helicopterLand();
                return "Ordre d'atterrissage transmis.";

            case "hover":
                helicopterHover();
                return "Stabilisation demandée.";

            case "exit":
                return exitHelicopter()
                    ? "Descente effectuée."
                    : "L'atterrissage est nécessaire avant de descendre.";

            case "vehicle_status": {
                const heli = getCurrentHelicopter();
                return heli
                    ? `${heli.name} : altitude ${heli.altitude.toFixed(1)} m, vitesse ${heli.speed.toFixed(1)} km/h.`
                    : "Aucun hélicoptère piloté.";
            }

            case "save":
                saveGame();
                return "Demande de sauvegarde envoyée.";

            case "next":
                return "Terminez les objectifs actifs avant de passer à la mission suivante.";

            case "secure":
            case "search":
            case "checkpoint":
            case "extract":
                return "Ordre reçu. Continuez vers la zone opérationnelle.";

            case "heal":
                if (ally) {
                    ally.health = 100;
                    ally.armor = Math.max(ally.armor, 100);
                } else {
                    state.allies.forEach(item => {
                        item.health = 100;
                        item.armor = Math.max(item.armor, 100);
                    });
                }
                updateTeamStatus();
                return "L'équipe a reçu une remise en condition tactique.";

            case "aircover":
                return "Couverture aérienne disponible lorsque l'hélicoptère est en vol.";

            case "sniper":
            case "danger":
            case "formation":
            case "patrol":
            case "split":
                return "Ordre tactique reçu. L'équipe adapte sa formation.";

            default:
                return "Message reçu. L'équipe reste opérationnelle.";
        }
    }

    function boardAlly(ally) {
        const heli = findNearestAccessibleHelicopter(ally);

        if (!heli || !heli.landed || heli.destroyed) return false;

        ally.inHelicopter = true;
        ally.helicopterId = heli.id;
        ally.x = heli.x;
        ally.z = heli.z;

        heli.passengers = heli.passengers || [];
        if (!heli.passengers.includes(ally.id)) {
            heli.passengers.push(ally.id);
        }

        if (ally.mesh) ally.mesh.setEnabled(false);

        addLog(ally.name + " a embarqué dans " + heli.name + ".");
        return true;
    }

    function teamStatusText() {
        const playerStatus = `Selvandieu : santé ${Math.round(state.player.health)} %, armure ${Math.round(state.player.armor)} %.`;

        const allyStatus = state.allies.map(ally =>
            `${ally.name} : ${ally.alive ? "opérationnel" : "hors combat"}, santé ${Math.round(ally.health)} %.`
        ).join(" ");

        return playerStatus + " " + allyStatus;
    }

    function sendInteraction(command, senderId = state.selectedExpertId) {
        const senderName = getExpertName(senderId);
        const response = getInteractionResponse(command, senderId);

        addChatMessage(senderName, "Ordre : " + command);
        addChatMessage("ÉQUIPE", response);

        addLog(senderName + " : " + command);
        updateAllHUD();
    }

    function customMessageResponse(message, recipient) {
        const text = message.toLowerCase();

        if (/où|position|coordonn/.test(text)) {
            return getInteractionResponse("where", recipient);
        }

        if (/attaque|ennemi|ennemis|hostile|tir/.test(text)) {
            return getInteractionResponse("attack", recipient);
        }

        if (/suis|suivez|rejoignez|rassemblez/.test(text)) {
            return getInteractionResponse("follow", recipient);
        }

        if (/hélicopt|avion|vol|atterri|décoll/.test(text)) {
            return getInteractionResponse("vehicle_status", recipient);
        }

        if (/santé|état|prêt|équipe/.test(text)) {
            return teamStatusText();
        }

        return "Message reçu. Je confirme la communication et je reste opérationnel.";
    }

    function sendCustomMessage(message) {
        const input = $("customMessageInput");
        const sender = $("messageSenderSelect")?.value || "selvandieu";
        const recipient = $("messageRecipientSelect")?.value || "all";

        const cleanMessage = String(message || "").trim();

        if (!cleanMessage) {
            toast("Écrivez un message avant l'envoi.", "!");
            return;
        }

        addChatMessage(getExpertName(sender), cleanMessage, "expert");

        const recipients = recipient === "all"
            ? ["ranise", "kerlande"]
            : [recipient];

        recipients.forEach(id => {
            const response = customMessageResponse(cleanMessage, id);

            setTimeout(() => {
                addChatMessage(getExpertName(id), response, "expert");
            }, 180 + Math.random() * 350);
        });

        if (input) input.value = "";
    }

    function renderInteractionButtons() {
        const container = $("interactionButtons");
        if (!container) return;

        const search = ($("interactionSearchInput")?.value || "").toLowerCase();
        const category = state.selectedInteractionCategory;

        const interactions = state.dynamicContent.interactions.filter(item => {
            const categoryMatches =
                category === "all" || item.category === category;

            const searchMatches =
                !search ||
                item.label.toLowerCase().includes(search) ||
                item.command.toLowerCase().includes(search);

            return categoryMatches && searchMatches;
        });

        container.innerHTML = "";

        if (!interactions.length) {
            container.innerHTML =
                '<p class="empty-state">Aucune interaction correspondante.</p>';
            return;
        }

        interactions.forEach(interaction => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "interaction-button";
            button.dataset.command = interaction.command;
            button.textContent = interaction.label;

            button.addEventListener("click", () => {
                const sender = $("messageSenderSelect")?.value || "selvandieu";
                sendInteraction(interaction.command, sender);
            });

            container.appendChild(button);
        });
    }

    /* =========================================================
       19. BIBLIOTHÈQUE D'ARMES
    ========================================================= */

    function renderWeaponLibrary() {
        const container = $("weaponLibraryList");
        if (!container) return;

        setText("weaponPurchasePoints", state.score);

        container.innerHTML = state.dynamicContent.weapons.map(weapon => `
            <button
                type="button"
                class="weapon-card ${state.selectedWeaponLibraryId === weapon.id ? "selected" : ""}"
                data-weapon-id="${escapeHTML(weapon.id)}"
            >
                <strong>${escapeHTML(weapon.name)}</strong>
                <span>Dégâts : ${weapon.damage}</span>
                <span>Portée : ${weapon.range} m</span>
                <span>Chargeur : ${weapon.magazine}</span>
                <small>${weapon.price ? "Coût : " + weapon.price + " points" : "Disponible"}</small>
            </button>
        `).join("");

        container.querySelectorAll("[data-weapon-id]").forEach(button => {
            button.addEventListener("click", () => {
                state.selectedWeaponLibraryId = button.dataset.weaponId;
                renderWeaponLibrary();
            });
        });
    }

    function equipSelectedWeapon() {
        const weapon = getWeapon(state.selectedWeaponLibraryId);

        if (weapon.price > state.score && weapon.id !== "rifle" && weapon.id !== "pistol") {
            toast("Vous n'avez pas assez de points pour cette arme.", "!");
            return;
        }

        state.selectedWeaponId = weapon.id;
        state.player.weaponId = weapon.id;

        state.allies.forEach((ally, index) => {
            ally.weaponId = index === 0 ? weapon.id : "heavy";
        });

        state.ammo = weapon.magazine;
        state.reserveAmmo = Infinity;

        rebuildActors();
        updateAllHUD();

        toast(weapon.name + " équipée.", "✓");
        addLog("Arme sélectionnée : " + weapon.name);
    }

    /* =========================================================
       20. BIBLIOTHÈQUE D'ÉQUIPEMENTS
    ========================================================= */

    function renderEquipmentLibrary() {
        const container = $("equipmentLibraryList");
        if (!container) return;

        setText("equipmentPurchasePoints", state.score);

        container.innerHTML = state.dynamicContent.equipment.map(item => `
            <button
                type="button"
                class="equipment-card ${state.selectedEquipmentLibraryId === item.id ? "selected" : ""}"
                data-equipment-id="${escapeHTML(item.id)}"
            >
                <strong>${escapeHTML(item.name)}</strong>
                <span>Armure : ${item.armor}</span>
                <span>Réduction : ${Math.round(item.damageReduction * 100)} %</span>
                <small>${item.price ? "Coût : " + item.price + " points" : "Disponible"}</small>
                <p>${escapeHTML(item.description)}</p>
            </button>
        `).join("");

        container.querySelectorAll("[data-equipment-id]").forEach(button => {
            button.addEventListener("click", () => {
                state.selectedEquipmentLibraryId = button.dataset.equipmentId;
                renderEquipmentLibrary();
            });
        });
    }

    function equipSelectedEquipment() {
        const item = getEquipment(state.selectedEquipmentLibraryId);

        if (item.price > state.score && item.id !== "standard") {
            toast("Points insuffisants pour cet équipement.", "!");
            return;
        }

        state.selectedEquipmentId = item.id;

        applyProtectionToTeam();

        toast(item.name + " appliquée à l'équipe.", "✓");
        addLog("Équipement appliqué : " + item.name);
    }

    /* =========================================================
       21. BIBLIOTHÈQUE D'HÉLICOPTÈRES
    ========================================================= */

    function renderHelicopterLibrary() {
        const container = $("helicopterLibraryList");
        if (!container) return;

        const current = getCurrentHelicopter();

        setText(
            "currentHelicopterName",
            current ? current.name.toUpperCase() : "AUCUN HÉLICOPTÈRE"
        );

        container.innerHTML = state.dynamicContent.helicopters.map(heli => `
            <button
                type="button"
                class="helicopter-card ${state.selectedHelicopterLibraryId === heli.id ? "selected" : ""}"
                data-helicopter-id="${escapeHTML(heli.id)}"
            >
                <strong>${escapeHTML(heli.name)}</strong>
                <span>Vitesse maximale : ${heli.speed} km/h</span>
                <span>Altitude maximale : ${heli.maxAltitude} m</span>
                <span>Armement : ${heli.weaponDamage}</span>
                <small>${heli.price ? "Coût : " + heli.price + " points" : "Disponible"}</small>
            </button>
        `).join("");

        container.querySelectorAll("[data-helicopter-id]").forEach(button => {
            button.addEventListener("click", () => {
                state.selectedHelicopterLibraryId = button.dataset.helicopterId;
                renderHelicopterLibrary();
            });
        });
    }

    function selectHelicopter() {
        const definition = getHelicopterDefinition(
            state.selectedHelicopterLibraryId
        );

        const existing = state.helicopters.find(heli =>
            heli.definitionId === definition.id && !heli.destroyed
        );

        if (existing) {
            state.selectedHelicopterId = definition.id;
            toast(definition.name + " sélectionné.", "✓");
            renderHelicopterLibrary();
            return;
        }

        const heli = {
            id: "heli_custom_" + Date.now(),
            definitionId: definition.id,
            name: definition.name,
            x: state.player.x + 8,
            z: state.player.z + 8,
            altitude: 0,
            yaw: 0,
            speed: 0,
            health: definition.health,
            fuel: definition.fuel,
            landed: true,
            destroyed: false,
            occupied: false,
            passengers: [],
            maxAltitude: definition.maxAltitude,
            maxSpeed: definition.speed,
            verticalTarget: 0,
            velocityX: 0,
            velocityZ: 0
        };

        state.helicopters.push(heli);

        if (state.scene) createHelicopterMesh(heli);

        state.selectedHelicopterId = definition.id;

        renderHelicopterLibrary();
        addLog("Véhicule ajouté : " + definition.name);
        toast("Hélicoptère disponible.", "✓");
    }

    /* =========================================================
       22. CAMÉRA ET GESTES TACTILES
    ========================================================= */

    function zoomCamera(direction) {
        if (!state.camera) return;

        state.camera.radius = clamp(
            state.camera.radius + direction,
            CONFIG.cameraMinRadius,
            CONFIG.cameraMaxRadius
        );
    }

    function resetCamera() {
        if (!state.camera) return;

        state.camera.alpha = -Math.PI / 2;
        state.camera.beta = Math.PI / 3;
        state.camera.radius = CONFIG.cameraInitialRadius;

        centerCamera();
    }

    function centerCamera() {
        if (!state.camera) return;

        const position = state.player.inHelicopter
            ? getCurrentHelicopter()
            : state.player;

        if (!position) return;

        state.camera.setTarget(
            new BABYLON.Vector3(
                position.x,
                position.altitude !== undefined
                    ? position.altitude + 1
                    : 1,
                position.z
            )
        );
    }

    function installTouchCameraControls() {
        const canvas = state.canvas;
        if (!canvas) return;

        let initialPinchDistance = 0;
        let initialRadius = CONFIG.cameraInitialRadius;
        let lastTouch = null;

        canvas.addEventListener("touchstart", event => {
            if (event.touches.length === 2 && state.camera) {
                const a = event.touches[0];
                const b = event.touches[1];

                initialPinchDistance = Math.hypot(
                    a.clientX - b.clientX,
                    a.clientY - b.clientY
                );

                initialRadius = state.camera.radius;
            } else if (event.touches.length === 1) {
                lastTouch = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
            }
        }, { passive: true });

        canvas.addEventListener("touchmove", event => {
            if (!state.camera) return;

            if (event.touches.length === 2 && initialPinchDistance > 0) {
                const a = event.touches[0];
                const b = event.touches[1];

                const currentDistance = Math.hypot(
                    a.clientX - b.clientX,
                    a.clientY - b.clientY
                );

                state.camera.radius = clamp(
                    initialRadius * initialPinchDistance / currentDistance,
                    CONFIG.cameraMinRadius,
                    CONFIG.cameraMaxRadius
                );
            } else if (event.touches.length === 1 && lastTouch) {
                const touch = event.touches[0];

                const dx = touch.clientX - lastTouch.x;
                const dy = touch.clientY - lastTouch.y;

                const sensitivity =
                    (11 - state.settings.cameraSensitivity) * 0.001;

                state.camera.alpha -= dx * sensitivity;
                state.camera.beta = clamp(
                    state.camera.beta + dy * sensitivity,
                    0.15,
                    Math.PI / 2.05
                );

                lastTouch = {
                    x: touch.clientX,
                    y: touch.clientY
                };
            }
        }, { passive: true });

        canvas.addEventListener("touchend", () => {
            initialPinchDistance = 0;
            lastTouch = null;
        }, { passive: true });
    }

    /* =========================================================
       23. JOYSTICK
    ========================================================= */

    function installJoystick() {
        const joystick = $("movementJoystick");
        const knob = $("joystickKnob");

        if (!joystick || !knob) return;

        let activePointer = null;

        const updateJoystick = event => {
            const rect = joystick.getBoundingClientRect();

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const maxRadius = rect.width * 0.3;

            let dx = event.clientX - centerX;
            let dy = event.clientY - centerY;

            const distance = Math.hypot(dx, dy);

            if (distance > maxRadius) {
                dx = dx / distance * maxRadius;
                dy = dy / distance * maxRadius;
            }

            state.input.joystickX = clamp(dx / maxRadius, -1, 1);
            state.input.joystickY = clamp(-dy / maxRadius, -1, 1);

            knob.style.transform =
                `translate(${dx}px, ${dy}px)`;
        };

        joystick.addEventListener("pointerdown", event => {
            activePointer = event.pointerId;

            try {
                joystick.setPointerCapture(event.pointerId);
            } catch (_) {}

            updateJoystick(event);
        });

        joystick.addEventListener("pointermove", event => {
            if (event.pointerId !== activePointer) return;
            updateJoystick(event);
        });

        const release = event => {
            if (activePointer !== null &&
                event.pointerId !== undefined &&
                event.pointerId !== activePointer) return;

            activePointer = null;
            state.input.joystickX = 0;
            state.input.joystickY = 0;

            knob.style.transform = "translate(0, 0)";
        };

        joystick.addEventListener("pointerup", release);
        joystick.addEventListener("pointercancel", release);
        joystick.addEventListener("lostpointercapture", release);
    }

    /* =========================================================
       24. CLAVIER
    ========================================================= */

    function installKeyboardControls() {
        const keys = new Set();

        window.addEventListener("keydown", event => {
            const key = event.key.toLowerCase();

            if ([
                "arrowup", "arrowdown", "arrowleft", "arrowright", " "
            ].includes(key)) {
                event.preventDefault();
            }

            keys.add(key);

            state.input.forward = keys.has("w") || keys.has("arrowup");
            state.input.backward = keys.has("s") || keys.has("arrowdown");
            state.input.left = keys.has("a") || keys.has("arrowleft");
            state.input.right = keys.has("d") || keys.has("arrowright");
            state.input.sprint = keys.has("shift");

            if (key === "r" && !event.repeat) reloadWeapon();
            if (key === "e" && !event.repeat) boardHelicopter();
            if (key === "q" && !event.repeat) exitHelicopter();
            if (key === "f" && !event.repeat) interactWithNearestObject();
            if (key === " " && !event.repeat) jumpPlayer();

            if (key === "escape") {
                if (state.paused) resumeGame();
                else pauseGame();
            }

            state.input.flight.accelerate = keys.has("w") && state.player.inHelicopter;
            state.input.flight.brake = keys.has("s") && state.player.inHelicopter;
            state.input.flight.turnLeft = keys.has("a") && state.player.inHelicopter;
            state.input.flight.turnRight = keys.has("d") && state.player.inHelicopter;
            state.input.flight.ascend = keys.has("shift") && state.player.inHelicopter;
            state.input.flight.descend = keys.has("control") && state.player.inHelicopter;
        });

        window.addEventListener("keyup", event => {
            keys.delete(event.key.toLowerCase());

            state.input.forward = keys.has("w") || keys.has("arrowup");
            state.input.backward = keys.has("s") || keys.has("arrowdown");
            state.input.left = keys.has("a") || keys.has("arrowleft");
            state.input.right = keys.has("d") || keys.has("arrowright");
            state.input.sprint = keys.has("shift");

            state.input.flight.accelerate = keys.has("w") && state.player.inHelicopter;
            state.input.flight.brake = keys.has("s") && state.player.inHelicopter;
            state.input.flight.turnLeft = keys.has("a") && state.player.inHelicopter;
            state.input.flight.turnRight = keys.has("d") && state.player.inHelicopter;
            state.input.flight.ascend = keys.has("shift") && state.player.inHelicopter;
            state.input.flight.descend = keys.has("control") && state.player.inHelicopter;
        });

        window.addEventListener("blur", () => {
            keys.clear();

            state.input.forward = false;
            state.input.backward = false;
            state.input.left = false;
            state.input.right = false;
            state.input.sprint = false;
            state.input.fire = false;

            Object.keys(state.input.flight).forEach(key => {
                state.input.flight[key] = false;
            });
        });
    }

    /* =========================================================
       25. ACTIONS DU JOUEUR
    ========================================================= */

    function jumpPlayer() {
        if (state.player.inHelicopter) return;

        state.player.jumping = true;
        state.player.jumpUntil = now() + 600;

        updateActorMesh(state.player);
    }

    function toggleCrouch() {
        state.player.crouching = !state.player.crouching;

        toast(
            state.player.crouching
                ? "Position accroupie."
                : "Position debout.",
            "✓"
        );
    }

    function aimWeapon() {
        state.input.aim = !state.input.aim;

        if (state.camera) {
            state.camera.radius = state.input.aim
                ? CONFIG.cameraMinRadius
                : CONFIG.cameraInitialRadius;
        }

        toast(state.input.aim ? "Visée activée." : "Visée désactivée.", "⌖");
    }

    function interactWithNearestObject() {
        if (state.player.inHelicopter) {
            if (getCurrentHelicopter()?.landed) exitHelicopter();
            else toast("Atterrissez avant de quitter l'hélicoptère.", "!");
            return;
        }

        const heli = findNearestAccessibleHelicopter();

        if (heli) {
            boardHelicopter();
            return;
        }

        const distance = Math.hypot(state.player.x - 25, state.player.z - 25);

        if (distance < 6) {
            updateObjectiveProgress("reach", 1);
            toast("Point de contrôle atteint.", "✓");
        } else {
            toast("Aucun objet interactif à portée.", "!");
        }
    }

    /* =========================================================
       26. PAUSE ET ÉCRANS
    ========================================================= */

    function pauseGame() {
        if (!state.gameStarted || state.paused) return;

        state.paused = true;
        state.running = false;

        showElement("pauseOverlay");
    }

    function resumeGame() {
        hideElement("pauseOverlay");

        state.paused = false;
        state.running = true;
        state.gameStarted = true;

        state.lastFrameTime = performance.now();
    }

    async function startGame() {
        if (!state.initialized) {
            await initializeBabylon();
        }

        if (!state.initialized) return;

        hideElement("mainMenu");
        hideElement("missionResultOverlay");
        hideElement("pauseOverlay");
        showElement("gameScreen");

        state.gameStarted = true;
        state.running = true;
        state.paused = false;

        state.player.alive = true;

        if (!state.mission) setupMission(state.missionIndex);

        state.lastFrameTime = performance.now();

        updateAllHUD();
        addLog("Session de jeu démarrée.");
    }

    async function continueGame() {
        const loaded = await loadGame();

        if (loaded) {
            await startGame();
        } else {
            await startGame();
        }
    }

    function returnToMenu() {
        state.running = false;
        state.paused = false;
        state.gameStarted = false;

        hideElement("pauseOverlay");
        hideElement("missionResultOverlay");
        hideElement("gameScreen");
        showElement("mainMenu");

        closeAllPanels();
    }

    function showConfirmation(title, message, callback) {
        setText("confirmationTitle", title);
        setText("confirmationMessage", message);

        state.confirmationCallback = callback;

        showElement("confirmationDialog");
    }

    /* =========================================================
       27. PARAMÈTRES
    ========================================================= */

    async function loadSettings() {
        try {
            if (!state.database) await initializeDatabase();

            if (state.database) {
                const record = await dbGet("settings", CONFIG.settingsKey);

                if (record && record.data) {
                    Object.assign(state.settings, record.data);
                }
            }
        } catch (error) {
            console.warn("Chargement des paramètres :", error);
        }

        applySettingsToControls();
    }

    function applySettingsToControls() {
        const mapping = {
            soundEnabled: state.settings.soundEnabled,
            musicEnabled: state.settings.musicEnabled,
            showCoordinates: state.settings.showCoordinates,
            showMinimap: state.settings.showMinimap,
            autoSaveEnabled: state.settings.autoSaveEnabled
        };

        Object.entries(mapping).forEach(([id, value]) => {
            const element = $(id);
            if (element) element.checked = Boolean(value);
        });

        if ($("graphicsQuality")) {
            $("graphicsQuality").value = state.settings.graphicsQuality;
        }

        if ($("cameraSensitivity")) {
            $("cameraSensitivity").value = state.settings.cameraSensitivity;
        }
    }

    async function applySettings() {
        state.settings.soundEnabled = $("soundEnabled")?.checked ?? true;
        state.settings.musicEnabled = $("musicEnabled")?.checked ?? false;
        state.settings.showCoordinates = $("showCoordinates")?.checked ?? true;
        state.settings.showMinimap = $("showMinimap")?.checked ?? true;
        state.settings.autoSaveEnabled = $("autoSaveEnabled")?.checked ?? true;
        state.settings.graphicsQuality = $("graphicsQuality")?.value || "medium";
        state.settings.cameraSensitivity = Number(
            $("cameraSensitivity")?.value || 5
        );

        const coordinates = $("playerCoordinates");
        if (coordinates) {
            coordinates.style.display = state.settings.showCoordinates ? "" : "none";
        }

        const minimap = $("minimapPanel");
        if (minimap) {
            minimap.style.display = state.settings.showMinimap ? "" : "none";
        }

        if (state.engine) {
            const ratio = state.settings.graphicsQuality === "high"
                ? 1
                : state.settings.graphicsQuality === "low"
                    ? 0.65
                    : 0.85;

            state.engine.setHardwareScalingLevel(1 / ratio);
            state.engine.resize();
        }

        if (state.database) {
            await dbPut("settings", {
                key: CONFIG.settingsKey,
                data: state.settings
            }).catch(console.error);
        }

        toast("Paramètres appliqués.", "✓");
    }

    async function toggleFullscreen() {
        const root = $("helicopterGameApp");

        try {
            if (!document.fullscreenElement) {
                await root.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.warn(error);
            toast("Le plein écran n'est pas disponible sur cet appareil.", "!");
        }
    }

    /* =========================================================
       28. CONTENU DYNAMIQUE
    ========================================================= */

    function mergeDynamicContent(remote = {}) {
        if (Array.isArray(remote.weapons) && remote.weapons.length) {
            state.dynamicContent.weapons = remote.weapons;
        }

        if (Array.isArray(remote.equipment) && remote.equipment.length) {
            state.dynamicContent.equipment = remote.equipment;
        }

        if (Array.isArray(remote.helicopters) && remote.helicopters.length) {
            state.dynamicContent.helicopters = remote.helicopters;
        }

        if (Array.isArray(remote.interactions) && remote.interactions.length) {
            state.dynamicContent.interactions = remote.interactions;
        }

        if (Array.isArray(remote.missions) && remote.missions.length) {
            state.dynamicContent.missions = remote.missions;
        }

        renderInteractionButtons();
        renderWeaponLibrary();
        renderEquipmentLibrary();
        renderHelicopterLibrary();
    }

    async function loadCachedContent() {
        if (!state.database) return;

        try {
            const record = await dbGet("content", CONFIG.contentKey);

            if (record && record.data) {
                mergeDynamicContent(record.data);
            }
        } catch (error) {
            console.warn("Contenu en cache indisponible :", error);
        }
    }

    async function syncDynamicContent() {
        setText("syncStatusText", "Contenu local opérationnel");
        const indicator = $("syncStatusIndicator");

        if (indicator) indicator.style.backgroundColor = "#2ad69b";

        // Aucun endpoint distant n'est défini dans le HTML.
        // Le jeu fonctionne en mode local et conserve les données en IndexedDB.

        if (state.database) {
            await dbPut("content", {
                key: CONFIG.contentKey,
                data: state.dynamicContent
            }).catch(console.error);
        }

        renderInteractionButtons();

        toast("Contenu tactique actualisé.", "✓");
    }

    async function initializeDynamicContent() {
        mergeDynamicContent({
            weapons: DEFAULT_WEAPONS,
            equipment: DEFAULT_EQUIPMENT,
            helicopters: DEFAULT_HELICOPTERS,
            interactions: DEFAULT_INTERACTIONS,
            missions: MISSION_TEMPLATES
        });

        await loadCachedContent();
        await syncDynamicContent();
    }

    /* =========================================================
       29. BOUCLE PRINCIPALE
    ========================================================= */

    function updateGameLoop() {
        if (!state.running || state.paused || !state.scene) return;

        const timestamp = performance.now();

        const dt = clamp(
            (timestamp - (state.lastFrameTime || timestamp)) / 1000,
            0,
            0.05
        );

        state.lastFrameTime = timestamp;
        state.elapsedSinceStart += dt;
        state.missionElapsed += dt;

        updatePlayerMovement(dt);
        updateAllyMovement(dt);

        updateAllyCombat();
        updateEnemyAI(dt);
        updateHelicopterPhysics(dt);

        if (state.input.fire) {
            fireWeapon(state.player);
        }

        if (state.player.inHelicopter) {
            state.player.x = getCurrentHelicopter()?.x ?? state.player.x;
            state.player.z = getCurrentHelicopter()?.z ?? state.player.z;
        }

        if (state.mission) {
            const reachDistance = Math.hypot(
                state.player.x - 25,
                state.player.z - 25
            );

            if (reachDistance < 6) {
                updateObjectiveProgress("reach", 0);
            }

            const flyObjective = state.mission.objectives.find(
                objective => objective.type === "fly" && !objective.complete
            );

            if (flyObjective && state.player.inHelicopter) {
                const heli = getCurrentHelicopter();

                if (heli && !heli.landed) {
                    flyObjective.progress = Math.min(
                        flyObjective.target,
                        flyObjective.progress + dt
                    );

                    flyObjective.complete =
                        flyObjective.progress >= flyObjective.target;
                }
            }
        }

        if (timestamp - state.lastReinforcementAt > 90000) {
            state.lastReinforcementAt = timestamp;
            maybeSpawnReinforcements();
        }

        if (
            state.settings.autoSaveEnabled &&
            timestamp - state.lastAutoSaveAt > CONFIG.autosaveInterval
        ) {
            state.lastAutoSaveAt = timestamp;
            saveGame(true);
        }

        if (Math.floor(state.elapsedSinceStart) % 2 === 0) {
            updateAllHUD();
        }

        syncActorMeshes();

        state.scene.render();
    }

    /* =========================================================
       30. INITIALISATION BABYLON.JS
    ========================================================= */

    async function initializeBabylon() {
        if (state.initializing) return;
        if (state.initialized && state.engine && !state.engine.isDisposed) return;

        state.initializing = true;

        showElement("loadingScreen");
        hideElement("gameErrorScreen");

        showLoadingProgress(10, "Chargement du moteur graphique…");

        try {
            if (!window.BABYLON) {
                const module = await import("@babylonjs/core");
                window.BABYLON = module;
            }

            showLoadingProgress(30, "Création du moteur 3D…");

            state.canvas = $("gameCanvas");

            if (!state.canvas) {
                throw new Error("Élément gameCanvas introuvable.");
            }

            if (state.engine) {
                try {
                    state.engine.stopRenderLoop();
                    state.engine.dispose();
                } catch (_) {}
            }

            state.engine = new BABYLON.Engine(
                state.canvas,
                true,
                {
                    preserveDrawingBuffer: false,
                    stencil: true,
                    antialias: true,
                    adaptToDeviceRatio: true
                }
            );

            state.scene = new BABYLON.Scene(state.engine);
            state.scene.clearColor = new BABYLON.Color4(0.025, 0.07, 0.05, 1);

            showLoadingProgress(45, "Construction du terrain…");

            createMaterials();
            createGround();
            createLighting();
            createCamera();

            showLoadingProgress(60, "Déploiement des unités…");

            spawnEnemies();
            spawnHelicopters();
            rebuildActors();

            showLoadingProgress(75, "Initialisation des interfaces…");

            installTouchCameraControls();
            bindAllControls();

            setupMission(state.missionIndex);

            state.initialized = true;

            state.engine.runRenderLoop(() => {
                if (!state.scene || state.scene.isDisposed) return;

                if (state.running && !state.paused) {
                    updateGameLoop();
                } else {
                    state.scene.render();
                }
            });

            window.addEventListener("resize", () => {
                if (state.engine) state.engine.resize();
            });

            showLoadingProgress(100, "Monde tactique prêt…");

            // L'écran central est masqué lorsque la scène 3D est prête.
            hideWorldLoading();

            hideElement("gameErrorScreen");
            showElement("mainMenu");

            updateAllHUD();

            addLog("Moteur Babylon.js initialisé avec succès.");

        } catch (error) {
            console.error("Initialisation Babylon.js :", error);

            setText(
                "gameErrorMessage",
                error && error.message
                    ? error.message
                    : "Erreur inconnue pendant l'initialisation."
            );

            showElement("gameErrorScreen");
            hideElement("worldLoadingNotice");

        } finally {
            state.initializing = false;
        }
    }

    /* =========================================================
       31. LIAISON DES BOUTONS
    ========================================================= */

    function onClick(id, callback) {
        const element = $(id);
        if (!element) return;

        element.addEventListener("click", event => {
            event.preventDefault();
            callback(event);
        });
    }

    function bindHoldButton(id, inputKey) {
        const element = $(id);
        if (!element) return;

        const start = event => {
            event.preventDefault();
            state.input.flight[inputKey] = true;
        };

        const stop = event => {
            event.preventDefault();
            state.input.flight[inputKey] = false;
        };

        element.addEventListener("pointerdown", start);
        element.addEventListener("pointerup", stop);
        element.addEventListener("pointercancel", stop);
        element.addEventListener("pointerleave", stop);
        element.addEventListener("lostpointercapture", stop);
    }

    function bindAllControls() {
        onClick("startGameButton", startGame);
        onClick("continueGameButton", continueGame);

        onClick("backToMenuButton", () => {
            showConfirmation(
                "Retour au menu",
                "Voulez-vous sauvegarder avant de revenir au menu ?",
                async () => {
                    await saveGame(true);
                    returnToMenu();
                }
            );
        });

        onClick("saveGameButton", () => openPanel("saveManagementPanel"));
        onClick("pauseGameButton", pauseGame);
        onClick("resumeGameButton", resumeGame);

        onClick("pauseSaveButton", async () => {
            await saveGame();
        });

        onClick("pauseSettingsButton", () => {
            hideElement("pauseOverlay");
            openPanel("settingsPanel");
        });

        onClick("pauseReturnMenuButton", () => {
            showConfirmation(
                "Retour au menu",
                "Revenir au menu principal ?",
                returnToMenu
            );
        });

        onClick("toggleMissionPanelButton", () => {
            const title = $("missionTitle");
            const description = $("missionDescription");
            const objectives = $("missionObjectives");

            [title, description, objectives].forEach(element => {
                if (element) element.classList.toggle("hidden");
            });
        });

        onClick("toggleMapButton", () => toggleElement("minimapCanvas"));
        onClick("centerCameraButton", centerCamera);
        onClick("zoomInButton", () => zoomCamera(-2));
        onClick("zoomOutButton", () => zoomCamera(2));
        onClick("resetCameraButton", resetCamera);

        onClick("interactButton", interactWithNearestObject);
        onClick("shootButton", () => fireWeapon(state.player));
        onClick("aimButton", aimWeapon);
        onClick("reloadButton", () => reloadWeapon());
        onClick("jumpButton", jumpPlayer);
        onClick("crouchButton", toggleCrouch);

        const sprintButton = $("sprintButton");

        if (sprintButton) {
            const start = event => {
                event.preventDefault();
                state.input.sprint = true;
            };

            const stop = event => {
                event.preventDefault();
                state.input.sprint = false;
            };

            sprintButton.addEventListener("pointerdown", start);
            sprintButton.addEventListener("pointerup", stop);
            sprintButton.addEventListener("pointercancel", stop);
            sprintButton.addEventListener("pointerleave", stop);
        }

        onClick("meleeButton", performMeleeAttack);

        onClick("openWeaponLibraryButton", () => {
            renderWeaponLibrary();
            openPanel("weaponLibraryPanel");
        });

        onClick("closeWeaponLibraryButton", () => closePanel("weaponLibraryPanel"));
        onClick("confirmWeaponButton", equipSelectedWeapon);

        onClick("openEquipmentButton", () => {
            renderEquipmentLibrary();
            openPanel("equipmentPanel");
        });

        onClick("closeEquipmentButton", () => closePanel("equipmentPanel"));
        onClick("confirmEquipmentButton", equipSelectedEquipment);

        onClick("openHelicopterLibraryButton", () => {
            renderHelicopterLibrary();
            openPanel("helicopterLibraryPanel");
        });

        onClick("closeHelicopterLibraryButton", () => closePanel("helicopterLibraryPanel"));
        onClick("selectHelicopterButton", selectHelicopter);
        onClick("boardHelicopterButton", boardHelicopter);
        onClick("exitHelicopterButton", exitHelicopter);

        onClick("helicopterTakeoffButton", helicopterTakeoff);
        onClick("helicopterLandButton", helicopterLand);
        onClick("helicopterHoverButton", helicopterHover);
        onClick("helicopterExitButton", exitHelicopter);

        bindHoldButton("helicopterAccelerateButton", "accelerate");
        bindHoldButton("helicopterBrakeButton", "brake");
        bindHoldButton("helicopterAscendButton", "ascend");
        bindHoldButton("helicopterDescendButton", "descend");
        bindHoldButton("helicopterTurnLeftButton", "turnLeft");
        bindHoldButton("helicopterTurnRightButton", "turnRight");

        onClick("closeFlightControlsButton", () => {
            hideElement("helicopterFlightControls");
        });

        onClick("openCommunicationButton", () => {
            state.unreadMessages = 0;
            hideElement("unreadMessagesBadge");

            openPanel("communicationPanel");
            renderInteractionButtons();
        });

        onClick("closeCommunicationButton", () => closePanel("communicationPanel"));

        onClick("selectSelvandieuButton", () => {
            state.selectedExpertId = "selvandieu";
            if ($("messageSenderSelect")) $("messageSenderSelect").value = "selvandieu";
        });

        onClick("selectRaniseButton", () => {
            state.selectedExpertId = "ranise";
            if ($("messageSenderSelect")) $("messageSenderSelect").value = "ranise";
        });

        onClick("selectKerlandeButton", () => {
            state.selectedExpertId = "kerlande";
            if ($("messageSenderSelect")) $("messageSenderSelect").value = "kerlande";
        });

        const customForm = $("customMessageForm");

        if (customForm) {
            customForm.addEventListener("submit", event => {
                event.preventDefault();
                sendCustomMessage($("customMessageInput")?.value || "");
            });
        }

        const searchInput = $("interactionSearchInput");

        if (searchInput) {
            searchInput.addEventListener("input", renderInteractionButtons);
        }

        document.querySelectorAll("[data-interaction-category]").forEach(button => {
            button.addEventListener("click", () => {
                state.selectedInteractionCategory =
                    button.dataset.interactionCategory;

                document.querySelectorAll("[data-interaction-category]")
                    .forEach(item => item.classList.remove("active"));

                button.classList.add("active");

                renderInteractionButtons();
            });
        });

        onClick("openTacticalLogButton", () => openPanel("tacticalLogPanel"));
        onClick("closeTacticalLogButton", () => closePanel("tacticalLogPanel"));

        onClick("clearTacticalLogButton", () => {
            state.tacticalLogs = [];
            renderTacticalLog();
        });

        onClick("openSettingsButton", () => openPanel("settingsPanel"));
        onClick("closeSettingsButton", () => closePanel("settingsPanel"));
        onClick("applySettingsButton", applySettings);
        onClick("fullscreenButton", toggleFullscreen);

        onClick("closeSaveManagementButton", () => closePanel("saveManagementPanel"));
        onClick("saveNowButton", () => saveGame());
        onClick("loadSavedGameButton", loadGame);

        onClick("resetGameButton", () => {
            showConfirmation(
                "Réinitialiser la partie",
                "Cette action réinitialisera la progression enregistrée. Continuer ?",
                resetGame
            );
        });

        onClick("syncNowButton", syncDynamicContent);

        onClick("confirmActionButton", async () => {
            hideElement("confirmationDialog");

            const callback = state.confirmationCallback;
            state.confirmationCallback = null;

            if (typeof callback === "function") {
                await callback();
            }
        });

        onClick("cancelActionButton", () => {
            hideElement("confirmationDialog");
            state.confirmationCallback = null;
        });

        onClick("nextMissionButton", startNextMission);

        onClick("retryMissionButton", () => {
            hideElement("missionResultOverlay");

            state.running = true;
            state.paused = false;

            state.player.health = 100;
            state.player.armor = getEquipment().armor;
            state.player.x = 0;
            state.player.z = 0;
            state.player.alive = true;
            state.player.inHelicopter = false;
            state.player.helicopterId = null;

            state.allies.forEach((ally, index) => {
                ally.health = 100;
                ally.armor = getEquipment().armor;
                ally.alive = true;
                ally.x = index === 0 ? -4 : 4;
                ally.z = -3;
                ally.inHelicopter = false;
                ally.helicopterId = null;
                ally.behavior = "follow";
                ally.targetId = null;
            });

            spawnEnemies();
            spawnHelicopters();
            rebuildActors();
            setupMission(state.missionIndex);
            updateAllHUD();
        });

        onClick("resultReturnMenuButton", returnToMenu);

        onClick("retryGameInitializationButton", initializeBabylon);
        onClick("errorReturnMenuButton", returnToMenu);

        // Maintenir le bouton de tir permet un tir continu.
        const shootButton = $("shootButton");

        if (shootButton) {
            shootButton.addEventListener("pointerdown", event => {
                event.preventDefault();
                state.input.fire = true;
                fireWeapon(state.player);
            });

            const stopFire = () => {
                state.input.fire = false;
            };

            shootButton.addEventListener("pointerup", stopFire);
            shootButton.addEventListener("pointercancel", stopFire);
            shootButton.addEventListener("pointerleave", stopFire);
            shootButton.addEventListener("lostpointercapture", stopFire);
        }

        installJoystick();
        installKeyboardControls();

        renderInteractionButtons();
        renderWeaponLibrary();
        renderEquipmentLibrary();
        renderHelicopterLibrary();
        renderTacticalLog();
    }

    /* =========================================================
       32. API PUBLIQUE DU JEU
    ========================================================= */

    window.FOBAS_ELITE_STRIKE = {
        config: CONFIG,

        get state() {
            return state;
        },

        start: startGame,
        pause: pauseGame,
        resume: resumeGame,
        save: saveGame,
        load: loadGame,
        reset: resetGame,

        nextMission: startNextMission,
        fire: () => fireWeapon(state.player),
        reload: () => reloadWeapon(),

        boardHelicopter,
        exitHelicopter,
        helicopterTakeoff,
        helicopterLand,

        sendInteraction,
        sendCustomMessage,

        addInteraction(interaction) {
            if (!interaction || !interaction.id || !interaction.command) {
                throw new Error("Une interaction doit avoir un id et une commande.");
            }

            state.dynamicContent.interactions.push(interaction);
            renderInteractionButtons();
        },

        addMission(mission) {
            if (!mission || !mission.title || !Array.isArray(mission.objectives)) {
                throw new Error("Mission invalide.");
            }

            state.dynamicContent.missions.push(mission);
        },

        getTeamStatus: teamStatusText,

        sync: syncDynamicContent
    };

    /* =========================================================
       33. DÉMARRAGE
    ========================================================= */

    async function boot() {
        try {
            showLoadingProgress(5, "Préparation du système tactique…");

            await initializeDatabase();
            await loadSettings();
            await initializeDynamicContent();

            showLoadingProgress(20, "Préparation du moteur 3D…");

            await initializeBabylon();

            if (state.initialized) {
                hideWorldLoading();
                showElement("mainMenu");
                updateAllHUD();
            }

            setInterval(() => {
                syncDynamicContent();
            }, CONFIG.syncInterval);

        } catch (error) {
            console.error("Erreur de démarrage :", error);

            setText(
                "gameErrorMessage",
                error && error.message
                    ? error.message
                    : "Impossible de démarrer le système tactique."
            );

            showElement("gameErrorScreen");
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }

})();




