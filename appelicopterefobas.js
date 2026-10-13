/* ============================================================
   FOBAS ELITE STRIKE 3D
   Fichier : appelicopterefobas.js
   Moteur : Babylon.js 9.30.0
   Stockage : IndexedDB
   Contrôles : clavier, souris, tactile, Android
   ============================================================ */

(() => {
    "use strict";

    /* =========================================================
       1. CONFIGURATION
    ========================================================= */

    const CONFIG = Object.freeze({
        appName: "FOBAS ELITE STRIKE 3D",
        version: "1.0.0",

        databaseName: "FOBASEliteStrikeDB",
        databaseVersion: 1,

        saveKey: "game-save",
        settingsKey: "game-settings",
        contentKey: "dynamic-content",

        syncInterval: 10 * 60 * 1000,

        // Laisser vide tant qu'aucune API n'est configurée.
        // Exemple : "/api/elite-strike/content"
        contentEndpoint: "",

        worldSize: 260,
        enemyCount: 18,
        helicopterCount: 5,

        maxHealth: 100,
        maxArmor: 100,

        playerWalkSpeed: 6,
        playerSprintSpeed: 10,

        cameraMinRadius: 5,
        cameraMaxRadius: 28,
        cameraInitialRadius: 12,

        autoSaveInterval: 60 * 1000,

        maxLogEntries: 150,
        maxChatMessages: 200
    });

    const $ = id => document.getElementById(id);

    const clamp = (value, min, max) =>
        Math.min(max, Math.max(min, value));

    const random = (min, max) =>
        Math.random() * (max - min) + min;

    const randomInt = (min, max) =>
        Math.floor(random(min, max + 1));

    const distance2D = (a, b) => {
        const dx = a.x - b.x;
        const dz = a.z - b.z;

        return Math.sqrt(dx * dx + dz * dz);
    };

    const formatTime = seconds => {
        const value = Math.max(0, Math.floor(seconds));
        const minutes = Math.floor(value / 60);
        const remainingSeconds = value % 60;

        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(remainingSeconds).padStart(2, "0")
        );
    };

    const escapeHTML = value =>
        String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);

    const deepClone = value =>
        JSON.parse(JSON.stringify(value));

    /* =========================================================
       2. ÉTAT DU JEU
    ========================================================= */

    const state = {
        initialized: false,
        initializing: false,
        running: false,
        paused: false,
        gameStarted: false,

        engine: null,
        scene: null,
        camera: null,
        canvas: null,

        materials: {},
        meshes: {},
        actors: new Map(),
        enemies: [],
        helicopters: [],
        bullets: [],

        selectedWeaponId: "rifle",
        selectedEquipmentId: "standard",
        selectedHelicopterId: null,

        selectedExpert: "ranise",
        selectedInteractionCategory: "position",
        selectedWeaponForPurchase: "rifle",
        selectedEquipmentForPurchase: "standard",
        selectedHelicopterForPurchase: null,

        currentMissionIndex: 0,
        mission: null,
        missionStartTime: 0,
        elapsedSeconds: 0,

        score: 0,
        health: CONFIG.maxHealth,
        armor: CONFIG.maxArmor,

        ammo: 30,
        reserveAmmo: 120,

        player: {
            id: "selvandieu",
            name: "Selvandieu",
            type: "player",
            x: 0,
            z: 0,
            rotation: 0,
            health: 100,
            armor: 100,
            alive: true,
            inHelicopter: false,
            helicopterId: null,
            crouching: false,
            sprinting: false,
            aiming: false,
            reloading: false,
            moving: false,
            weaponId: "rifle",
            equipmentId: "standard",
            lastShotAt: 0,
            lastDamageAt: 0
        },

        allies: {
            ranise: {
                id: "ranise",
                name: "Ranise",
                type: "ally",
                x: -4,
                z: -3,
                rotation: 0,
                health: 100,
                armor: 100,
                alive: true,
                inHelicopter: false,
                helicopterId: null,
                behavior: "follow",
                targetId: null,
                lastActionAt: 0,
                weaponId: "rifle"
            },

            kerlande: {
                id: "kerlande",
                name: "Kerlande",
                type: "ally",
                x: 4,
                z: -3,
                rotation: 0,
                health: 100,
                armor: 100,
                alive: true,
                inHelicopter: false,
                helicopterId: null,
                behavior: "follow",
                targetId: null,
                lastActionAt: 0,
                weaponId: "rifle"
            }
        },

        input: {
            forward: 0,
            strafe: 0,
            sprint: false,
            fire: false,
            aim: false,
            joystickX: 0,
            joystickY: 0,
            cameraX: 0,
            cameraY: 0,
            helicopter: {
                accelerate: false,
                brake: false,
                ascend: false,
                descend: false,
                turnLeft: false,
                turnRight: false
            }
        },

        cameraTarget: {
            x: 0,
            y: 1,
            z: 0
        },

        settings: {
            soundEnabled: true,
            musicEnabled: false,
            showCoordinates: true,
            showMinimap: true,
            autoSaveEnabled: true,
            graphicsQuality: "medium",
            cameraSensitivity: 5
        },

        dynamicContent: {
            version: 1,
            missions: [],
            interactions: [],
            weapons: [],
            equipment: [],
            helicopters: []
        },

        selectedInteractionIds: new Set(),

        database: null,
        lastSaveAt: null,
        lastSyncAt: null,

        toastTimer: null,
        pendingConfirmation: null,
        damageFlashTimer: null,

        audioContext: null,

        stats: {
            enemiesKilled: 0,
            missionsCompleted: 0,
            shotsFired: 0,
            alliesRescued: 0
        }
    };

    /* =========================================================
       3. ARMES
    ========================================================= */

    const DEFAULT_WEAPONS = [
        {
            id: "pistol",
            name: "Pistolet tactique",
            description: "Arme secondaire légère.",
            price: 0,
            damage: 18,
            range: 38,
            fireRate: 380,
            magazine: 12,
            reserve: 72,
            accuracy: 0.96,
            unlocked: true
        },
        {
            id: "rifle",
            name: "Fusil d'assaut",
            description: "Arme polyvalente pour les opérations terrestres.",
            price: 0,
            damage: 28,
            range: 90,
            fireRate: 240,
            magazine: 30,
            reserve: 120,
            accuracy: 0.94,
            unlocked: true
        },
        {
            id: "smg",
            name: "Mitraillette",
            description: "Cadence élevée à courte distance.",
            price: 300,
            damage: 17,
            range: 42,
            fireRate: 100,
            magazine: 35,
            reserve: 175,
            accuracy: 0.84,
            unlocked: false
        },
        {
            id: "shotgun",
            name: "Fusil à pompe",
            description: "Puissant à très courte distance.",
            price: 450,
            damage: 52,
            range: 20,
            fireRate: 800,
            magazine: 8,
            reserve: 48,
            accuracy: 0.80,
            unlocked: false
        },
        {
            id: "marksman",
            name: "Fusil de précision",
            description: "Tirs précis à longue distance.",
            price: 700,
            damage: 75,
            range: 160,
            fireRate: 1100,
            magazine: 5,
            reserve: 35,
            accuracy: 0.995,
            unlocked: false
        },
        {
            id: "heavy",
            name: "Mitrailleuse lourde",
            description: "Grande puissance de feu.",
            price: 1000,
            damage: 38,
            range: 100,
            fireRate: 180,
            magazine: 60,
            reserve: 240,
            accuracy: 0.86,
            unlocked: false
        }
    ];

    /* =========================================================
       4. ÉQUIPEMENTS
    ========================================================= */

    const DEFAULT_EQUIPMENT = [
        {
            id: "standard",
            name: "Équipement standard",
            description: "Configuration de départ.",
            price: 0,
            armorBonus: 0,
            healthBonus: 0,
            speedBonus: 0,
            unlocked: true
        },
        {
            id: "armor",
            name: "Gilet renforcé",
            description: "Améliore la protection.",
            price: 250,
            armorBonus: 35,
            healthBonus: 0,
            speedBonus: -0.3,
            unlocked: false
        },
        {
            id: "medic",
            name: "Kit médical",
            description: "Restaure une partie de la santé.",
            price: 180,
            armorBonus: 0,
            healthBonus: 25,
            speedBonus: 0,
            unlocked: false
        },
        {
            id: "scout",
            name: "Équipement éclaireur",
            description: "Améliore la vitesse de déplacement.",
            price: 300,
            armorBonus: 0,
            healthBonus: 0,
            speedBonus: 2,
            unlocked: false
        },
        {
            id: "tactical",
            name: "Équipement tactique avancé",
            description: "Protection et endurance améliorées.",
            price: 600,
            armorBonus: 20,
            healthBonus: 15,
            speedBonus: 0.8,
            unlocked: false
        }
    ];

    /* =========================================================
       5. HÉLICOPTÈRES
    ========================================================= */

    const DEFAULT_HELICOPTERS = [
        {
            id: "scout",
            name: "Hélicoptère de reconnaissance",
            description: "Rapide et maniable.",
            price: 0,
            maxSpeed: 100,
            acceleration: 18,
            maxAltitude: 80,
            health: 100,
            fuel: 100,
            unlocked: true
        },
        {
            id: "transport",
            name: "Hélicoptère de transport",
            description: "Transport tactique polyvalent.",
            price: 500,
            maxSpeed: 85,
            acceleration: 12,
            maxAltitude: 100,
            health: 140,
            fuel: 100,
            unlocked: false
        },
        {
            id: "heavy",
            name: "Hélicoptère lourd",
            description: "Blindage renforcé et grande capacité.",
            price: 1200,
            maxSpeed: 75,
            acceleration: 9,
            maxAltitude: 120,
            health: 220,
            fuel: 100,
            unlocked: false
        }
    ];

    /* =========================================================
       6. MISSIONS GÉNÉRÉES
    ========================================================= */

    const MISSION_TEMPLATES = [
        {
            title: "PREMIER CONTACT",
            description: "Explorez la zone et coordonnez vos deux coéquipiers.",
            objectives: [
                { id: "explore", text: "Explorer le terrain", type: "reach", target: 25 },
                { id: "enemy", text: "Neutraliser 3 ennemis", type: "kill", target: 3 },
                { id: "team", text: "Regrouper les trois experts", type: "team", target: 1 }
            ]
        },
        {
            title: "ZONE CONTESTÉE",
            description: "Repoussez les unités ennemies et sécurisez la zone.",
            objectives: [
                { id: "enemy", text: "Neutraliser 6 ennemis", type: "kill", target: 6 },
                { id: "reach", text: "Atteindre la zone tactique", type: "reach", target: 45 }
            ]
        },
        {
            title: "MENACE AÉRIENNE",
            description: "Repérez les hélicoptères ennemis et sécurisez le périmètre.",
            objectives: [
                { id: "enemy", text: "Neutraliser 8 ennemis", type: "kill", target: 8 },
                { id: "air", text: "Rejoindre la zone aérienne", type: "reach", target: 55 },
                { id: "team", text: "Vérifier la situation de l'équipe", type: "team", target: 1 }
            ]
        },
        {
            title: "EXTRACTION",
            description: "Rejoignez un hélicoptère accessible pour quitter la zone.",
            objectives: [
                { id: "reach", text: "Atteindre un hélicoptère", type: "board", target: 1 },
                { id: "air", text: "Décoller et prendre de l'altitude", type: "fly", target: 1 }
            ]
        },
        {
            title: "OPÉRATION DÉCISIVE",
            description: "Éliminez la résistance et sécurisez le terrain.",
            objectives: [
                { id: "enemy", text: "Neutraliser 10 ennemis", type: "kill", target: 10 },
                { id: "reach", text: "Atteindre le point d'opération", type: "reach", target: 65 },
                { id: "team", text: "Maintenir la cohésion de l'équipe", type: "team", target: 1 }
            ]
        }
    ];

    function createMission(index) {
        const template = MISSION_TEMPLATES[index % MISSION_TEMPLATES.length];

        const difficulty = Math.floor(index / MISSION_TEMPLATES.length);
        const multiplier = 1 + difficulty * 0.25;

        return {
            id: "mission-" + String(index + 1).padStart(3, "0"),
            index,
            title: template.title,
            description: template.description,
            difficulty: difficulty + 1,
            reward: Math.round(150 + index * 30),
            startedAt: Date.now(),
            completed: false,
            failed: false,
            objectives: template.objectives.map(objective => ({
                ...objective,
                target: objective.type === "kill"
                    ? Math.ceil(objective.target * multiplier)
                    : objective.target,
                progress: 0,
                completed: false
            }))
        };
    }

    function createMissionSeries(count = 40) {
        return Array.from({ length: count }, (_, index) => createMission(index));
    }

    /* =========================================================
       7. LES 50 INTERACTIONS TACTIQUES
    ========================================================= */

    const DEFAULT_INTERACTIONS = [
        { id: "pos1", category: "position", text: "Où es-tu ?", command: "ask_position" },
        { id: "pos2", category: "position", text: "Où es-tu positionné ?", command: "ask_coordinates" },
        { id: "pos3", category: "position", text: "Es-tu au sol ?", command: "ask_ground" },
        { id: "pos4", category: "position", text: "Es-tu dans un hélicoptère ?", command: "ask_vehicle" },
        { id: "pos5", category: "position", text: "Quelle est ta distance par rapport à moi ?", command: "ask_distance" },
        { id: "pos6", category: "position", text: "Dans quelle direction te trouves-tu ?", command: "ask_direction" },
        { id: "pos7", category: "position", text: "Peux-tu me rejoindre ?", command: "follow_player" },
        { id: "pos8", category: "position", text: "Où se trouve notre troisième coéquipier ?", command: "ask_third_expert" },
        { id: "pos9", category: "position", text: "Peux-tu confirmer ta position ?", command: "ask_coordinates" },
        { id: "pos10", category: "position", text: "Quelle est ta situation actuelle ?", command: "ask_status" },

        { id: "threat1", category: "threat", text: "Es-tu en danger ?", command: "ask_danger" },
        { id: "threat2", category: "threat", text: "As-tu repéré des ennemis ?", command: "ask_enemies" },
        { id: "threat3", category: "threat", text: "Combien d'ennemis as-tu détectés ?", command: "ask_enemy_count" },
        { id: "threat4", category: "threat", text: "Dans quelle direction arrivent-ils ?", command: "ask_enemy_direction" },
        { id: "threat5", category: "threat", text: "Un hélicoptère ennemi approche-t-il ?", command: "ask_enemy_helicopter" },
        { id: "threat6", category: "threat", text: "Notre position est-elle menacée ?", command: "ask_group_danger" },
        { id: "threat7", category: "threat", text: "Peux-tu surveiller cette zone ?", command: "guard_position" },
        { id: "threat8", category: "threat", text: "Protège notre position !", command: "guard_position" },
        { id: "threat9", category: "threat", text: "Préviens-moi si tu détectes une menace.", command: "watch_threats" },
        { id: "threat10", category: "threat", text: "Quelle est la situation du groupe ?", command: "ask_team_status" },

        { id: "team1", category: "team", text: "Viens me rejoindre !", command: "follow_player" },
        { id: "team2", category: "team", text: "Reste près de moi.", command: "stay_near" },
        { id: "team3", category: "team", text: "Protège Kerlande.", command: "protect_kerlande" },
        { id: "team4", category: "team", text: "Protège Ranise.", command: "protect_ranise" },
        { id: "team5", category: "team", text: "Couvre notre progression.", command: "cover_advance" },
        { id: "team6", category: "team", text: "Rejoins notre formation.", command: "follow_player" },
        { id: "team7", category: "team", text: "Attends mon signal.", command: "hold_position" },
        { id: "team8", category: "team", text: "Prépare-toi à avancer.", command: "prepare_advance" },
        { id: "team9", category: "team", text: "Suis-moi.", command: "follow_player" },
        { id: "team10", category: "team", text: "Aide notre équipe à terminer l'objectif.", command: "help_objective" },

        { id: "heli1", category: "helicopter", text: "Où se trouve l'hélicoptère accessible le plus proche ?", command: "ask_nearest_helicopter" },
        { id: "heli2", category: "helicopter", text: "Peux-tu rejoindre l'hélicoptère ?", command: "ally_board_helicopter" },
        { id: "heli3", category: "helicopter", text: "Prépare-toi à embarquer.", command: "prepare_boarding" },
        { id: "heli4", category: "helicopter", text: "Monte dans l'hélicoptère si tu peux y accéder.", command: "ally_board_helicopter" },
        { id: "heli5", category: "helicopter", text: "Es-tu prêt à décoller ?", command: "ask_takeoff_ready" },
        { id: "heli6", category: "helicopter", text: "Peux-tu piloter cet hélicoptère ?", command: "ask_can_pilot" },
        { id: "heli7", category: "helicopter", text: "Quelle est la situation de notre hélicoptère ?", command: "ask_helicopter_status" },
        { id: "heli8", category: "helicopter", text: "Rejoins-moi au point d'atterrissage.", command: "follow_player" },
        { id: "heli9", category: "helicopter", text: "Prépare-toi à quitter l'hélicoptère.", command: "prepare_exit" },
        { id: "heli10", category: "helicopter", text: "Quel est le meilleur moyen de rejoindre notre objectif ?", command: "ask_best_route" },

        { id: "mission1", category: "mission", text: "Quel est notre objectif actuel ?", command: "ask_objective" },
        { id: "mission2", category: "mission", text: "Quel objectif reste-t-il à accomplir ?", command: "ask_remaining_objectives" },
        { id: "mission3", category: "mission", text: "Combien d'ennemis restent-ils ?", command: "ask_enemy_count" },
        { id: "mission4", category: "mission", text: "Notre mission est-elle presque terminée ?", command: "ask_mission_progress" },
        { id: "mission5", category: "mission", text: "Quelle arme utilises-tu ?", command: "ask_weapon" },
        { id: "mission6", category: "mission", text: "Combien de munitions te reste-t-il ?", command: "ask_ammo" },
        { id: "mission7", category: "mission", text: "As-tu besoin d'équipement ?", command: "ask_equipment" },
        { id: "mission8", category: "mission", text: "Quel est ton état de santé ?", command: "ask_health" },
        { id: "mission9", category: "mission", text: "Sommes-nous prêts à continuer ?", command: "ask_team_ready" },
        { id: "mission10", category: "mission", text: "Quelle est ta recommandation pour la suite de la mission ?", command: "ask_recommendation" }
    ];

    /* =========================================================
       8. BASE DE DONNÉES INDEXEDDB
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

            request.onupgradeneeded = () => {
                const db = request.result;

                if (!db.objectStoreNames.contains("saves")) {
                    db.createObjectStore("saves", { keyPath: "id" });
                }

                if (!db.objectStoreNames.contains("content")) {
                    db.createObjectStore("content", { keyPath: "id" });
                }

                if (!db.objectStoreNames.contains("settings")) {
                    db.createObjectStore("settings", { keyPath: "id" });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    function databaseRequest(storeName, mode, operation) {
        return new Promise((resolve, reject) => {
            if (!state.database) {
                reject(new Error("La base de données n'est pas prête."));
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

            if (request) {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            } else {
                transaction.oncomplete = () => resolve(true);
                transaction.onerror = () => reject(transaction.error);
            }
        });
    }

    async function dbGet(storeName, id) {
        return databaseRequest(storeName, "readonly", store => store.get(id));
    }

    async function dbPut(storeName, value) {
        return databaseRequest(storeName, "readwrite", store => store.put(value));
    }

    async function dbDelete(storeName, id) {
        return databaseRequest(storeName, "readwrite", store => store.delete(id));
    }

    async function initializeDatabase() {
        try {
            state.database = await openDatabase();

            if ($("saveStorageStatus")) {
                $("saveStorageStatus").textContent =
                    "Stockage IndexedDB opérationnel.";
            }

            return true;
        } catch (error) {
            console.error("[FOBAS] IndexedDB :", error);

            if ($("saveStorageStatus")) {
                $("saveStorageStatus").textContent =
                    "Stockage indisponible : progression temporaire.";
            }

            return false;
        }
    }

    /* =========================================================
       9. SAUVEGARDE ET CHARGEMENT
    ========================================================= */

    function makeSaveSnapshot() {
        return {
            id: CONFIG.saveKey,
            version: CONFIG.version,
            savedAt: Date.now(),

            currentMissionIndex: state.currentMissionIndex,
            mission: state.mission ? deepClone(state.mission) : null,
            score: state.score,
            health: state.health,
            armor: state.armor,
            ammo: state.ammo,
            reserveAmmo: state.reserveAmmo,

            player: deepClone(state.player),
            allies: deepClone(state.allies),

            selectedWeaponId: state.selectedWeaponId,
            selectedEquipmentId: state.selectedEquipmentId,
            selectedHelicopterId: state.selectedHelicopterId,

            enemiesKilled: state.stats.enemiesKilled,
            missionsCompleted: state.stats.missionsCompleted,
            elapsedSeconds: state.elapsedSeconds
        };
    }

    async function saveGame(showMessage = true) {
        const snapshot = makeSaveSnapshot();

        try {
            if (state.database) {
                await dbPut("saves", snapshot);
            } else {
                localStorage.setItem(CONFIG.saveKey, JSON.stringify(snapshot));
            }

            state.lastSaveAt = Date.now();

            if ($("lastSaveTime")) {
                $("lastSaveTime").textContent =
                    new Date(state.lastSaveAt).toLocaleString();
            }

            if ($("saveStorageStatus")) {
                $("saveStorageStatus").textContent =
                    state.database
                        ? "Sauvegarde enregistrée dans IndexedDB."
                        : "Sauvegarde enregistrée dans le stockage local.";
            }

            addLog("Sauvegarde de la progression effectuée.");

            if (showMessage) {
                showToast("Partie sauvegardée.", "success");
            }

            return true;
        } catch (error) {
            console.error("[FOBAS] Sauvegarde :", error);
            showToast("Impossible de sauvegarder la partie.", "error");
            return false;
        }
    }

    async function loadGame(showMessage = true) {
        let snapshot = null;

        try {
            if (state.database) {
                snapshot = await dbGet("saves", CONFIG.saveKey);
            }

            if (!snapshot) {
                const raw = localStorage.getItem(CONFIG.saveKey);
                snapshot = raw ? JSON.parse(raw) : null;
            }

            if (!snapshot) {
                if (showMessage) {
                    showToast("Aucune sauvegarde disponible.", "warning");
                }

                return false;
            }

            state.currentMissionIndex = Math.max(
                0,
                Number(snapshot.currentMissionIndex) || 0
            );

            state.mission = snapshot.mission
                ? snapshot.mission
                : createMission(state.currentMissionIndex);

            state.score = Math.max(0, Number(snapshot.score) || 0);
            state.health = clamp(Number(snapshot.health) || 100, 0, 100);
            state.armor = clamp(Number(snapshot.armor) || 100, 0, 100);

            state.ammo = Math.max(0, Number(snapshot.ammo) || 0);
            state.reserveAmmo = Math.max(
                0,
                Number(snapshot.reserveAmmo) || 0
            );

            if (snapshot.player) {
                Object.assign(state.player, snapshot.player);
            }

            if (snapshot.allies) {
                for (const id of ["ranise", "kerlande"]) {
                    if (snapshot.allies[id]) {
                        Object.assign(state.allies[id], snapshot.allies[id]);
                    }
                }
            }

            state.selectedWeaponId = snapshot.selectedWeaponId || "rifle";
            state.selectedEquipmentId = snapshot.selectedEquipmentId || "standard";
            state.selectedHelicopterId = snapshot.selectedHelicopterId || null;

            state.stats.enemiesKilled = Number(snapshot.enemiesKilled) || 0;
            state.stats.missionsCompleted = Number(snapshot.missionsCompleted) || 0;
            state.elapsedSeconds = Number(snapshot.elapsedSeconds) || 0;

            state.player.health = state.health;
            state.player.armor = state.armor;

            if (state.scene) {
                syncActorMeshes();
            }

            updateAllHUD();

            if (showMessage) {
                showToast("Sauvegarde chargée.", "success");
            }

            return true;
        } catch (error) {
            console.error("[FOBAS] Chargement :", error);
            showToast("La sauvegarde n'a pas pu être chargée.", "error");
            return false;
        }
    }

    async function resetGame() {
        state.currentMissionIndex = 0;
        state.mission = createMission(0);
        state.score = 0;
        state.health = 100;
        state.armor = 100;
        state.ammo = 30;
        state.reserveAmmo = 120;
        state.elapsedSeconds = 0;

        state.stats.enemiesKilled = 0;
        state.stats.missionsCompleted = 0;
        state.stats.shotsFired = 0;
        state.stats.alliesRescued = 0;

        Object.assign(state.player, {
            x: 0,
            z: 0,
            rotation: 0,
            health: 100,
            armor: 100,
            alive: true,
            inHelicopter: false,
            helicopterId: null,
            crouching: false,
            sprinting: false,
            aiming: false,
            reloading: false,
            weaponId: "rifle",
            equipmentId: "standard"
        });

        for (const ally of Object.values(state.allies)) {
            ally.health = 100;
            ally.armor = 100;
            ally.alive = true;
            ally.inHelicopter = false;
            ally.helicopterId = null;
            ally.behavior = "follow";
            ally.x = ally.id === "ranise" ? -4 : 4;
            ally.z = -3;
        }

        state.enemies = [];
        state.bullets = [];

        if (state.scene) {
            for (const actor of state.actors.values()) {
                actor.dispose();
            }

            state.actors.clear();

            for (const helicopter of state.helicopters) {
                if (helicopter.mesh) helicopter.mesh.dispose();
            }

            state.helicopters = [];
            spawnEnemies(CONFIG.enemyCount);
            spawnHelicopters(CONFIG.helicopterCount);
            rebuildActors();
        }

        await dbDeleteSafe("saves", CONFIG.saveKey);

        closePanel("saveManagementPanel");
        updateAllHUD();
        showToast("Partie réinitialisée.", "success");
        addLog("La partie a été réinitialisée.");
    }

    async function dbDeleteSafe(storeName, id) {
        try {
            if (state.database) {
                await dbDelete(storeName, id);
            }

            localStorage.removeItem(id);
        } catch (error) {
            console.warn("[FOBAS] Suppression de sauvegarde :", error);
        }
    }

    /* =========================================================
       10. MATÉRIAUX BABYLON.JS
    ========================================================= */

    function makeMaterial(name, color, emissive = null) {
        const material = new BABYLON.StandardMaterial(name, state.scene);

        material.diffuseColor = BABYLON.Color3.FromHexString(color);

        if (emissive) {
            material.emissiveColor = BABYLON.Color3.FromHexString(emissive);
        }

        material.specularColor = new BABYLON.Color3(0.12, 0.12, 0.12);

        return material;
    }

    function createMaterials() {
        state.materials.ground = makeMaterial("groundMaterial", "#536b46");
        state.materials.grass = makeMaterial("grassMaterial", "#3b5937");
        state.materials.road = makeMaterial("roadMaterial", "#444b4b");
        state.materials.building = makeMaterial("buildingMaterial", "#777b73");
        state.materials.roof = makeMaterial("roofMaterial", "#444944");
        state.materials.treeTrunk = makeMaterial("treeTrunkMaterial", "#59452f");
        state.materials.treeLeaves = makeMaterial("treeLeavesMaterial", "#254b2d");
        state.materials.player = makeMaterial("playerMaterial", "#d6b98c");
        state.materials.ally = makeMaterial("allyMaterial", "#70c8a1");
        state.materials.enemy = makeMaterial("enemyMaterial", "#d94a46");
        state.materials.helicopter = makeMaterial("helicopterMaterial", "#344a3e");
        state.materials.enemyHelicopter = makeMaterial("enemyHelicopterMaterial", "#6c3937");
        state.materials.metal = makeMaterial("metalMaterial", "#5c6667");
        state.materials.glass = makeMaterial("glassMaterial", "#527f8a");
        state.materials.white = makeMaterial("whiteMaterial", "#e6e8dc");
        state.materials.bullet = makeMaterial("bulletMaterial", "#ffd166", "#ffb000");
        state.materials.marker = makeMaterial("markerMaterial", "#46d9ff", "#1785aa");
        state.materials.danger = makeMaterial("dangerMaterial", "#ff4136", "#b51e18");
    }

    /* =========================================================
       11. CRÉATION DU TERRAIN 3D
    ========================================================= */

    function createGround() {
        const ground = BABYLON.MeshBuilder.CreateGround(
            "terrainPrincipal",
            {
                width: CONFIG.worldSize,
                height: CONFIG.worldSize,
                subdivisions: 45
            },
            state.scene
        );

        ground.material = state.materials.ground;
        ground.receiveShadows = true;
        state.meshes.ground = ground;

        const groundDecor = BABYLON.MeshBuilder.CreateGround(
            "terrainDecor",
            {
                width: CONFIG.worldSize,
                height: CONFIG.worldSize,
                subdivisions: 1
            },
            state.scene
        );

        groundDecor.position.y = -0.015;
        groundDecor.material = state.materials.grass;

        createRoad(0, 0, 7, CONFIG.worldSize);
        createRoad(-45, 30, 5, 90);
        createRoad(45, -25, 5, 85);

        createBuilding(-24, -17, 13, 11, 9);
        createBuilding(27, -24, 14, 12, 10);
        createBuilding(36, 25, 11, 13, 8);
        createBuilding(-38, 29, 12, 10, 8);
        createBuilding(2, 49, 17, 12, 11);
        createBuilding(-54, -44, 10, 10, 7);

        createTreeClusters(95);
        createMissionMarker(32, 34);

        const boundaryMaterial = makeMaterial(
            "boundaryMaterial",
            "#243c2c"
        );

        for (const [x, z, width, depth] of [
            [0, -CONFIG.worldSize / 2, CONFIG.worldSize, 2],
            [0, CONFIG.worldSize / 2, CONFIG.worldSize, 2],
            [-CONFIG.worldSize / 2, 0, 2, CONFIG.worldSize],
            [CONFIG.worldSize / 2, 0, 2, CONFIG.worldSize]
        ]) {
            const wall = BABYLON.MeshBuilder.CreateBox(
                "terrainBoundary",
                { width, height: 3, depth },
                state.scene
            );

            wall.position.set(x, 1.5, z);
            wall.material = boundaryMaterial;
        }
    }

    function createRoad(x, z, width, length) {
        const road = BABYLON.MeshBuilder.CreateGround(
            "road",
            { width, height: length },
            state.scene
        );

        road.position.set(x, 0.025, z);
        road.material = state.materials.road;

        for (let offset = -length / 2; offset <= length / 2; offset += 8) {
            const marking = BABYLON.MeshBuilder.CreateBox(
                "roadMarking",
                { width: 0.18, height: 0.025, depth: 3 },
                state.scene
            );

            marking.position.set(x, 0.06, z + offset);
            marking.material = state.materials.white;
        }
    }

    function createBuilding(x, z, width, depth, height) {
        const building = BABYLON.MeshBuilder.CreateBox(
            "building",
            { width, depth, height },
            state.scene
        );

        building.position.set(x, height / 2, z);
        building.material = state.materials.building;
        building.checkCollisions = true;

        const roof = BABYLON.MeshBuilder.CreateBox(
            "buildingRoof",
            {
                width: width + 0.6,
                depth: depth + 0.6,
                height: 0.5
            },
            state.scene
        );

        roof.position.set(x, height + 0.2, z);
        roof.material = state.materials.roof;

        for (const side of [-1, 1]) {
            for (let row = 0; row < 2; row++) {
                const windowMesh = BABYLON.MeshBuilder.CreateBox(
                    "buildingWindow",
                    {
                        width: 1.4,
                        height: 1.5,
                        depth: 0.12
                    },
                    state.scene
                );

                windowMesh.position.set(
                    x + side * (width / 2 + 0.07),
                    2.5 + row * 3,
                    z
                );

                windowMesh.material = state.materials.glass;
            }
        }

        const door = BABYLON.MeshBuilder.CreateBox(
            "buildingDoor",
            { width: 1.7, height: 2.5, depth: 0.15 },
            state.scene
        );

        door.position.set(x, 1.25, z + depth / 2 + 0.08);
        door.material = state.materials.roof;
    }

    function createTreeClusters(count) {
        for (let i = 0; i < count; i++) {
            const x = random(-CONFIG.worldSize / 2 + 8, CONFIG.worldSize / 2 - 8);
            const z = random(-CONFIG.worldSize / 2 + 8, CONFIG.worldSize / 2 - 8);

            if (Math.abs(x) < 13 || Math.abs(z) < 13) continue;

            const trunk = BABYLON.MeshBuilder.CreateCylinder(
                "treeTrunk",
                {
                    height: random(2.3, 4.5),
                    diameter: random(0.35, 0.7)
                },
                state.scene
            );

            trunk.position.set(x, 1.5, z);
            trunk.material = state.materials.treeTrunk;

            const crown = BABYLON.MeshBuilder.CreateSphere(
                "treeCrown",
                {
                    diameter: random(3, 5),
                    segments: 7
                },
                state.scene
            );

            crown.position.set(x, random(3.2, 4.4), z);
            crown.material = state.materials.treeLeaves;
        }
    }

    function createMissionMarker(x, z) {
        const marker = BABYLON.MeshBuilder.CreateCylinder(
            "missionMarker",
            {
                height: 0.2,
                diameter: 4,
                tessellation: 32
            },
            state.scene
        );

        marker.position.set(x, 0.15, z);
        marker.material = state.materials.marker;

        const pillar = BABYLON.MeshBuilder.CreateCylinder(
            "missionMarkerPillar",
            {
                height: 5,
                diameterTop: 0.1,
                diameterBottom: 0.5,
                tessellation: 12
            },
            state.scene
        );

        pillar.position.set(x, 2.7, z);
        pillar.material = state.materials.marker;
    }

    /* =========================================================
       12. PERSONNAGES PROCÉDURAUX
    ========================================================= */

    function createCharacterMesh(actor) {
        const root = new BABYLON.TransformNode(
            "actor_" + actor.id,
            state.scene
        );

        const isEnemy = actor.type === "enemy";
        const isPlayer = actor.type === "player";

        const material = isEnemy
            ? state.materials.enemy
            : isPlayer
                ? state.materials.player
                : state.materials.ally;

        const body = BABYLON.MeshBuilder.CreateCapsule(
            "body_" + actor.id,
            {
                height: 1.6,
                radius: 0.32,
                tessellation: 8
            },
            state.scene
        );

        body.parent = root;
        body.position.y = 1.1;
        body.material = material;

        const head = BABYLON.MeshBuilder.CreateSphere(
            "head_" + actor.id,
            {
                diameter: 0.55,
                segments: 10
            },
            state.scene
        );

        head.parent = root;
        head.position.y = 2.12;
        head.material = state.materials.player;

        const leftArm = BABYLON.MeshBuilder.CreateBox(
            "leftArm_" + actor.id,
            { width: 0.2, height: 0.8, depth: 0.24 },
            state.scene
        );

        leftArm.parent = root;
        leftArm.position.set(-0.4, 1.25, 0);
        leftArm.material = material;

        const rightArm = leftArm.clone("rightArm_" + actor.id);
        rightArm.parent = root;
        rightArm.position.x = 0.4;

        const weapon = BABYLON.MeshBuilder.CreateBox(
            "weapon_" + actor.id,
            { width: 0.12, height: 0.12, depth: 0.9 },
            state.scene
        );

        weapon.parent = root;
        weapon.position.set(0.15, 1.45, 0.55);
        weapon.material = state.materials.metal;

        root.position.set(actor.x, 0, actor.z);

        return root;
    }

    function rebuildActors() {
        state.actors.clear();

        const playerMesh = createCharacterMesh(state.player);
        state.actors.set("selvandieu", playerMesh);

        for (const ally of Object.values(state.allies)) {
            const mesh = createCharacterMesh(ally);
            state.actors.set(ally.id, mesh);
        }

        for (const enemy of state.enemies) {
            const mesh = createCharacterMesh(enemy);
            state.actors.set(enemy.id, mesh);
        }
    }

    function syncActorMeshes() {
        for (const actor of [
            state.player,
            ...Object.values(state.allies),
            ...state.enemies
        ]) {
            const mesh = state.actors.get(actor.id);

            if (!mesh) continue;

            mesh.position.x = actor.x;
            mesh.position.z = actor.z;
            mesh.rotation.y = actor.rotation || 0;

            mesh.setEnabled(actor.alive !== false && !actor.inHelicopter);
        }
    }

    /* =========================================================
       13. HÉLICOPTÈRES PROCÉDURAUX
    ========================================================= */

    function createHelicopterMesh(helicopter) {
        const root = new BABYLON.TransformNode(
            "helicopter_" + helicopter.id,
            state.scene
        );

        const material = helicopter.enemy
            ? state.materials.enemyHelicopter
            : state.materials.helicopter;

        const fuselage = BABYLON.MeshBuilder.CreateCapsule(
            "helicopterBody_" + helicopter.id,
            {
                height: 4.2,
                radius: 0.65,
                tessellation: 12
            },
            state.scene
        );

        fuselage.parent = root;
        fuselage.rotation.z = Math.PI / 2;
        fuselage.material = material;

        const cockpit = BABYLON.MeshBuilder.CreateSphere(
            "helicopterCockpit_" + helicopter.id,
            {
                diameter: 1.5,
                segments: 12
            },
            state.scene
        );

        cockpit.parent = root;
        cockpit.position.set(0, 0.1, 1.25);
        cockpit.scaling.set(1.25, 0.8, 0.8);
        cockpit.material = state.materials.glass;

        const tail = BABYLON.MeshBuilder.CreateBox(
            "helicopterTail_" + helicopter.id,
            {
                width: 0.28,
                height: 0.3,
                depth: 3.4
            },
            state.scene
        );

        tail.parent = root;
        tail.position.z = -3.2;
        tail.material = material;

        const tailFin = BABYLON.MeshBuilder.CreateBox(
            "helicopterTailFin_" + helicopter.id,
            {
                width: 0.3,
                height: 1.2,
                depth: 0.7
            },
            state.scene
        );

        tailFin.parent = root;
        tailFin.position.set(0, 0.55, -4.6);
        tailFin.material = material;

        const rotor = BABYLON.MeshBuilder.CreateBox(
            "helicopterRotor_" + helicopter.id,
            {
                width: 0.25,
                height: 0.12,
                depth: 8.5
            },
            state.scene
        );

        rotor.parent = root;
        rotor.position.y = 0.85;
        rotor.material = state.materials.metal;

        const rotorHub = BABYLON.MeshBuilder.CreateCylinder(
            "helicopterRotorHub_" + helicopter.id,
            {
                height: 0.35,
                diameter: 0.35
            },
            state.scene
        );

        rotorHub.parent = root;
        rotorHub.position.y = 0.95;
        rotorHub.material = state.materials.metal;

        const tailRotor = BABYLON.MeshBuilder.CreateBox(
            "helicopterTailRotor_" + helicopter.id,
            {
                width: 0.12,
                height: 1.8,
                depth: 0.12
            },
            state.scene
        );

        tailRotor.parent = root;
        tailRotor.position.set(0.35, 0.3, -4.5);
        tailRotor.material = state.materials.metal;

        root.position.set(helicopter.x, helicopter.altitude, helicopter.z);

        return { root, rotor, tailRotor };
    }

    function spawnHelicopters(count) {
        state.helicopters = [];

        for (let i = 0; i < count; i++) {
            const enemy = i >= 2;

            const helicopter = {
                id: "heli-" + (i + 1),
                name: enemy
                    ? "Hélicoptère ennemi " + (i - 1)
                    : "Hélicoptère tactique " + (i + 1),

                enemy,

                x: random(-70, 70),
                z: random(-70, 70),

                altitude: enemy ? random(0, 15) : 0,
                speed: enemy ? random(10, 22) : 0,
                heading: random(0, Math.PI * 2),

                health: enemy ? 100 : 140,
                fuel: 100,

                landed: true,
                occupied: false,
                accessible: true,
                destroyed: false,

                maxSpeed: enemy ? 85 : 100,
                acceleration: 14,
                maxAltitude: 100,

                mesh: null,
                rotor: null,
                tailRotor: null
            };

            const visual = createHelicopterMesh(helicopter);

            helicopter.mesh = visual.root;
            helicopter.rotor = visual.rotor;
            helicopter.tailRotor = visual.tailRotor;

            state.helicopters.push(helicopter);
        }
    }

    function updateHelicopterMeshes(deltaSeconds) {
        for (const helicopter of state.helicopters) {
            if (helicopter.destroyed || !helicopter.mesh) continue;

            helicopter.mesh.position.set(
                helicopter.x,
                helicopter.altitude,
                helicopter.z
            );

            helicopter.mesh.rotation.y = helicopter.heading;

            if (helicopter.rotor) {
                helicopter.rotor.rotation.y += deltaSeconds *
                    (helicopter.altitude > 1 ? 35 : 4);
            }

            if (helicopter.tailRotor) {
                helicopter.tailRotor.rotation.z += deltaSeconds * 25;
            }
        }
    }

    /* =========================================================
       14. ENNEMIS ET RENFORTS
    ========================================================= */

    function spawnEnemies(count) {
        state.enemies = [];

        for (let i = 0; i < count; i++) {
            const x = random(-95, 95);
            const z = random(-95, 95);

            if (Math.abs(x) < 14 && Math.abs(z) < 14) continue;

            state.enemies.push({
                id: "enemy-" + (i + 1),
                name: "Unité ennemie " + (i + 1),
                type: "enemy",

                x,
                z,
                rotation: random(0, Math.PI * 2),

                health: 100,
                armor: 0,
                alive: true,

                inHelicopter: false,
                helicopterId: null,

                behavior: "patrol",
                targetId: null,

                lastShotAt: 0,
                lastMoveAt: 0
            });
        }
    }

    function spawnEnemyReinforcement() {
        const living = state.enemies.filter(enemy => enemy.alive).length;

        if (living >= 35) return;

        const side = randomInt(0, 3);
        const distance = 95;

        const position = side === 0
            ? { x: -distance, z: random(-80, 80) }
            : side === 1
                ? { x: distance, z: random(-80, 80) }
                : side === 2
                    ? { x: random(-80, 80), z: -distance }
                    : { x: random(-80, 80), z: distance };

        const enemy = {
            id: "enemy-" + Date.now() + "-" + randomInt(1, 999),
            name: "Renfort ennemi",
            type: "enemy",

            ...position,

            rotation: 0,
            health: 100,
            armor: 0,
            alive: true,

            inHelicopter: false,
            helicopterId: null,

            behavior: "patrol",
            targetId: null,

            lastShotAt: 0,
            lastMoveAt: 0
        };

        state.enemies.push(enemy);

        const mesh = createCharacterMesh(enemy);
        state.actors.set(enemy.id, mesh);

        addLog("Des renforts ennemis sont arrivés.");
        showToast("Renforts ennemis détectés !", "warning");
    }

    function disembarkEnemiesFromHelicopter(helicopter) {
        if (!helicopter || !helicopter.enemy || helicopter.destroyed) return;

        if (helicopter.altitude > 1.5) return;

        const alreadyDisembarked = state.enemies.filter(
            enemy => enemy.helicopterId === helicopter.id
        ).length;

        if (alreadyDisembarked >= 4) return;

        for (let i = alreadyDisembarked; i < 4; i++) {
            const enemy = {
                id: "enemy-" + helicopter.id + "-" + i + "-" + Date.now(),
                name: "Soldat ennemi débarqué",
                type: "enemy",

                x: helicopter.x + random(-4, 4),
                z: helicopter.z + random(-4, 4),

                rotation: random(0, Math.PI * 2),
                health: 100,
                armor: 0,
                alive: true,

                inHelicopter: false,
                helicopterId: helicopter.id,

                behavior: "patrol",
                targetId: null,

                lastShotAt: 0,
                lastMoveAt: 0
            };

            state.enemies.push(enemy);
            state.actors.set(enemy.id, createCharacterMesh(enemy));
        }

        helicopter.occupied = false;
        addLog("Des soldats ont débarqué d'un hélicoptère ennemi.");
    }

    /* =========================================================
       15. CAMÉRA ET LUMIÈRE
    ========================================================= */

    function createLighting() {
        const hemispheric = new BABYLON.HemisphericLight(
            "environmentLight",
            new BABYLON.Vector3(0, 1, 0),
            state.scene
        );

        hemispheric.intensity = 0.9;

        const sun = new BABYLON.DirectionalLight(
            "sunLight",
            new BABYLON.Vector3(-0.5, -1, 0.3),
            state.scene
        );

        sun.position = new BABYLON.Vector3(40, 90, -30);
        sun.intensity = 1.1;

        if (state.settings.graphicsQuality !== "low") {
            const shadowGenerator = new BABYLON.ShadowGenerator(
                state.settings.graphicsQuality === "high" ? 1024 : 512,
                sun
            );

            shadowGenerator.useBlurExponentialShadowMap = true;
            shadowGenerator.blurKernel = 8;

            state.meshes.shadowGenerator = shadowGenerator;
        }
    }

    function createCamera() {
        state.camera = new BABYLON.ArcRotateCamera(
            "mainCamera",
            -Math.PI / 2,
            1.05,
            CONFIG.cameraInitialRadius,
            new BABYLON.Vector3(0, 1, 0),
            state.scene
        );

        state.camera.lowerRadiusLimit = CONFIG.cameraMinRadius;
        state.camera.upperRadiusLimit = CONFIG.cameraMaxRadius;
        state.camera.wheelPrecision = 25;
        state.camera.panningSensibility = 0;
        state.camera.inertia = 0.75;
        state.camera.angularSensibilityX = 800;
        state.camera.angularSensibilityY = 800;

        state.camera.attachControl(state.canvas, true);

        // Les gestes sont gérés explicitement ci-dessous pour éviter
        // de bloquer le zoom natif à deux doigts.
        state.camera.inputs.removeByType("ArcRotateCameraPointersInput");

        state.camera.lowerBetaLimit = 0.18;
        state.camera.upperBetaLimit = 1.48;

        state.camera.setTarget(new BABYLON.Vector3(0, 1, 0));
    }

    /* =========================================================
       16. INITIALISATION DU MOTEUR
    ========================================================= */

    async function initializeBabylon() {
        if (state.initializing) return;

        state.initializing = true;
        updateLoading(10, "Chargement de Babylon.js…");

        try {
            if (!window.BABYLON) {
                const core = await import("@babylonjs/core");

                // L'import ESM ne garantit pas que window.BABYLON existe.
                // Nous utilisons donc les classes importées explicitement.
                state.Babylon = core;
            }

            const B = state.Babylon || window.BABYLON;

            if (!B || !B.Engine || !B.Scene) {
                throw new Error(
                    "Les modules Babylon.js n'ont pas pu être chargés."
                );
            }

            state.canvas = $("gameCanvas");

            if (!state.canvas) {
                throw new Error("Le canvas gameCanvas est introuvable.");
            }

            updateLoading(25, "Création du moteur graphique…");

            state.engine = new B.Engine(
                state.canvas,
                true,
                {
                    preserveDrawingBuffer: false,
                    stencil: true,
                    antialias: true,
                    adaptToDeviceRatio: true,
                    powerPreference: "high-performance"
                }
            );

            state.scene = new B.Scene(state.engine);
            state.scene.clearColor = new B.Color4(0.48, 0.68, 0.82, 1);
            state.scene.collisionsEnabled = false;

            // La classe Vector3 est utilisée par le code sous le nom global.
            // On expose le module importé pour uniformiser l'usage.
            window.BABYLON = B;

            updateLoading(35, "Création des matériaux…");
            createMaterials();

            updateLoading(45, "Construction du terrain…");
            createGround();

            updateLoading(60, "Création de la caméra et de la lumière…");
            createLighting();
            createCamera();

            updateLoading(70, "Déploiement des unités…");
            spawnEnemies(CONFIG.enemyCount);
            spawnHelicopters(CONFIG.helicopterCount);
            rebuildActors();

            updateLoading(82, "Chargement de l'interface tactique…");
            setupMission();
            renderWeaponLibrary();
            renderEquipmentLibrary();
            renderHelicopterLibrary();
            renderInteractionButtons();

            updateLoading(90, "Connexion des commandes…");
            bindAllControls();

            state.engine.runRenderLoop(() => {
                if (!state.scene || !state.engine) return;

                if (!state.paused && state.running) {
                    updateGameLoop();
                }

                state.scene.render();
            });

            window.addEventListener("resize", () => {
                if (state.engine) state.engine.resize();
            });

            state.initialized = true;
            state.initializing = false;

            updateLoading(100, "Le champ de bataille est prêt.");

            window.setTimeout(() => {
                hideElement("loadingScreen");
                showElement("mainMenu");
                hideElement("gameScreen");
            }, 500);

            addLog("Moteur Babylon.js initialisé.");
        } catch (error) {
            state.initializing = false;
            console.error("[FOBAS] Initialisation :", error);

            const message = error && error.message
                ? error.message
                : "Erreur inconnue pendant l'initialisation.";

            if ($("gameErrorMessage")) {
                $("gameErrorMessage").textContent = message;
            }

            hideElement("loadingScreen");
            showElement("gameErrorScreen");
        }
    }

    function updateLoading(progress, message) {
        if ($("loadingProgressBar")) {
            $("loadingProgressBar").style.width = clamp(progress, 0, 100) + "%";
        }

        if ($("loadingProgressText")) {
            $("loadingProgressText").textContent =
                "Préparation du terrain… " + clamp(progress, 0, 100) + " %";
        }

        if ($("loadingMessage")) {
            $("loadingMessage").textContent = message;
        }
    }

    /* =========================================================
       17. INTERFACE UTILITAIRE
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

    function openPanel(id) {
        const panel = $(id);
        if (!panel) return;

        panel.classList.remove("hidden");
        panel.setAttribute("aria-hidden", "false");
    }

    function closePanel(id) {
        const panel = $(id);
        if (!panel) return;

        panel.classList.add("hidden");
        panel.setAttribute("aria-hidden", "true");
    }

    function closeAllPanels() {
        [
            "weaponLibraryPanel",
            "equipmentPanel",
            "helicopterLibraryPanel",
            "communicationPanel",
            "tacticalLogPanel",
            "settingsPanel",
            "saveManagementPanel"
        ].forEach(closePanel);
    }

    function showToast(message, type = "info") {
        const toast = $("globalToast");
        const messageElement = $("globalToastMessage");
        const icon = $("globalToastIcon");

        if (!toast || !messageElement) return;

        messageElement.textContent = message;

        if (icon) {
            icon.textContent = type === "success"
                ? "✓"
                : type === "error"
                    ? "!"
                    : type === "warning"
                        ? "⚠"
                        : "ℹ";
        }

        toast.dataset.type = type;
        toast.classList.remove("hidden");

        clearTimeout(state.toastTimer);

        state.toastTimer = setTimeout(() => {
            toast.classList.add("hidden");
        }, 3500);
    }

    function addLog(message) {
        const container = $("tacticalLogEntries");
        const timestamp = new Date().toLocaleTimeString();

        if (container) {
            const empty = container.querySelector(".empty-state");
            if (empty) empty.remove();

            const entry = document.createElement("article");
            entry.className = "tactical-log-entry";

            const time = document.createElement("small");
            time.textContent = timestamp;

            const text = document.createElement("p");
            text.textContent = message;

            entry.append(time, text);
            container.prepend(entry);

            while (container.children.length > CONFIG.maxLogEntries) {
                container.lastElementChild.remove();
            }
        }

        console.info("[FOBAS]", message);
    }

    function notify(message, type = "info") {
        showToast(message, type);
        addLog(message);
    }

    /* =========================================================
       18. HUD
    ========================================================= */

    function updateAllHUD() {
        updatePlayerHUD();
        updateMissionHUD();
        updateHelicopterHUD();
        updateMinimap();
        updateCoordinates();
        updateTeamStatus();
    }

    function updatePlayerHUD() {
        if ($("playerHealthBar")) {
            $("playerHealthBar").style.width =
                clamp(state.health, 0, 100) + "%";
        }

        if ($("playerHealthText")) {
            $("playerHealthText").textContent = Math.ceil(state.health);
        }

        if ($("playerArmorBar")) {
            $("playerArmorBar").style.width =
                clamp(state.armor, 0, 100) + "%";
        }

        if ($("playerArmorText")) {
            $("playerArmorText").textContent = Math.ceil(state.armor);
        }

        if ($("currentAmmo")) {
            $("currentAmmo").textContent = state.ammo;
        }

        if ($("reserveAmmo")) {
            $("reserveAmmo").textContent = state.reserveAmmo;
        }

        const weapon = getWeapon(state.selectedWeaponId);

        if ($("currentWeaponName")) {
            $("currentWeaponName").textContent =
                weapon ? weapon.name.toUpperCase() : "ARME INCONNUE";
        }

        if ($("playerStateBadge")) {
            $("playerStateBadge").textContent =
                state.player.inHelicopter ? "EN VOL" : "AU SOL";
        }

        if ($("playerScore")) {
            $("playerScore").textContent = state.score;
        }
    }

    function updateCoordinates() {
        if ($("playerCoordinates")) {
            $("playerCoordinates").textContent =
                "X: " + state.player.x.toFixed(1) +
                " | Z: " + state.player.z.toFixed(1);
        }

        const setting = $("showCoordinates");

        if (setting && $("playerCoordinates")) {
            $("playerCoordinates").parentElement.style.display =
                setting.checked ? "" : "none";
        }
    }

    function updateMissionHUD() {
        if (!state.mission) return;

        if ($("missionHeaderLabel")) {
            $("missionHeaderLabel").textContent =
                "OPÉRATION " + String(state.currentMissionIndex + 1).padStart(3, "0");
        }

        if ($("missionTitle")) {
            $("missionTitle").textContent =
                "OPÉRATION : " + state.mission.title;
        }

        if ($("missionDescription")) {
            $("missionDescription").textContent = state.mission.description;
        }

        const total = state.mission.objectives.length;

        const completed = state.mission.objectives.filter(
            objective => objective.completed
        ).length;

        const progress = total
            ? Math.round(completed / total * 100)
            : 0;

        if ($("missionProgressText")) {
            $("missionProgressText").textContent = progress + " %";
        }

        if ($("missionProgressBar")) {
            $("missionProgressBar").style.width = progress + "%";
        }

        const list = $("missionObjectives");

        if (list) {
            list.replaceChildren();

            for (const objective of state.mission.objectives) {
                const item = document.createElement("li");
                item.className = "objective-item";

                if (objective.completed) {
                    item.classList.add("completed");
                }

                const marker = document.createElement("span");
                marker.className = "objective-marker";

                const text = document.createElement("span");
                text.textContent =
                    objective.text +
                    (objective.type === "kill"
                        ? " (" + objective.progress + "/" + objective.target + ")"
                        : "");

                item.append(marker, text);
                list.append(item);
            }
        }
    }

    function updateHelicopterHUD() {
        const current = getCurrentHelicopter();

        if (!current || !state.player.inHelicopter) {
            hideElement("helicopterHud");
            hideElement("helicopterFlightControls");
            return;
        }

        showElement("helicopterHud");
        showElement("helicopterFlightControls");

        if ($("helicopterStatus")) {
            $("helicopterStatus").textContent =
                current.altitude > 1 ? "EN VOL" : "AU SOL";
        }

        if ($("helicopterSpeed")) {
            $("helicopterSpeed").textContent = Math.round(current.speed);
        }

        if ($("helicopterAltitude")) {
            $("helicopterAltitude").textContent =
                Math.round(current.altitude);
        }

        if ($("helicopterHealth")) {
            $("helicopterHealth").textContent =
                Math.round(current.health) + " %";
        }

        if ($("helicopterFuel")) {
            $("helicopterFuel").textContent =
                Math.round(current.fuel) + " %";
        }
    }

    function updateTeamStatus() {
        for (const id of ["ranise", "kerlande"]) {
            const ally = state.allies[id];

            const badge = $(id + "OnlineStatus");

            if (badge) {
                badge.style.opacity = ally.alive ? "1" : "0.25";
            }
        }
    }

    /* =========================================================
       19. CARTE TACTIQUE
    ========================================================= */

    function updateMinimap() {
        const canvas = $("minimapCanvas");

        if (!canvas || !state.settings.showMinimap) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const width = canvas.width;
        const height = canvas.height;

        context.clearRect(0, 0, width, height);

        context.fillStyle = "#14251d";
        context.fillRect(0, 0, width, height);

        const scale = width / CONFIG.worldSize;

        context.strokeStyle = "#566d5a";
        context.lineWidth = 1;

        for (let i = 0; i <= 10; i++) {
            const offset = i * width / 10;

            context.beginPath();
            context.moveTo(offset, 0);
            context.lineTo(offset, height);
            context.stroke();

            context.beginPath();
            context.moveTo(0, offset);
            context.lineTo(width, offset);
            context.stroke();
        }

        function point(x, z) {
            return {
                x: width / 2 + x * scale,
                y: height / 2 + z * scale
            };
        }

        function drawDot(x, z, color, radius = 4) {
            const p = point(x, z);

            context.beginPath();
            context.arc(p.x, p.y, radius, 0, Math.PI * 2);
            context.fillStyle = color;
            context.fill();
        }

        for (const enemy of state.enemies) {
            if (enemy.alive && !enemy.inHelicopter) {
                drawDot(enemy.x, enemy.z, "#ff514d", 2.7);
            }
        }

        for (const ally of Object.values(state.allies)) {
            if (ally.alive && !ally.inHelicopter) {
                drawDot(ally.x, ally.z, "#55e6a4", 4);
            }
        }

        for (const helicopter of state.helicopters) {
            if (!helicopter.destroyed) {
                drawDot(
                    helicopter.x,
                    helicopter.z,
                    helicopter.enemy ? "#ff914d" : "#67d8ff",
                    4
                );
            }
        }

        drawDot(state.player.x, state.player.z, "#ffffff", 5);
    }

    /* =========================================================
       20. MISSIONS
    ========================================================= */

    function setupMission() {
        if (!state.mission) {
            state.mission = createMission(state.currentMissionIndex);
        }

        state.missionStartTime = Date.now();
        state.elapsedSeconds = 0;

        updateMissionHUD();
    }

    function updateObjectiveProgress(type, amount = 1) {
        if (!state.mission || state.mission.completed) return;

        for (const objective of state.mission.objectives) {
            if (objective.completed || objective.type !== type) continue;

            objective.progress = Math.min(
                objective.target,
                objective.progress + amount
            );

            if (objective.progress >= objective.target) {
                objective.completed = true;
                addLog("Objectif terminé : " + objective.text);
                showToast("Objectif accompli : " + objective.text, "success");
            }
        }

        updateMissionHUD();
        checkMissionCompletion();
    }

    function checkMissionCompletion() {
        if (!state.mission || state.mission.completed) return;

        const completed = state.mission.objectives.every(
            objective => objective.completed
        );

        if (!completed) return;

        state.mission.completed = true;
        state.score += state.mission.reward;
        state.stats.missionsCompleted++;

        updateAllHUD();
        showMissionResult(true);
        saveGame(false);
    }

    function showMissionResult(success) {
        const overlay = $("missionResultOverlay");

        if (!overlay) return;

        $("missionResultEyebrow").textContent =
            success ? "RAPPORT D'OPÉRATION" : "RAPPORT DE MISSION";

        $("missionResultTitle").textContent =
            success ? "MISSION TERMINÉE" : "MISSION ÉCHOUÉE";

        $("missionResultDescription").textContent = success
            ? "Objectifs accomplis. Votre équipe a sécurisé la zone."
            : "Vous ne pouvez plus poursuivre cette opération.";

        $("missionResultPoints").textContent =
            success ? state.mission.reward : "0";

        const total = state.mission.objectives.length;
        const completed = state.mission.objectives.filter(
            objective => objective.completed
        ).length;

        $("missionResultObjectives").textContent = completed + "/" + total;
        $("missionResultTime").textContent = formatTime(state.elapsedSeconds);

        showElement("missionResultOverlay");
    }

    function startNextMission() {
        state.currentMissionIndex++;
        state.mission = createMission(state.currentMissionIndex);

        state.player.x = 0;
        state.player.z = 0;
        state.player.health = 100;
        state.health = 100;
        state.armor = 100;

        state.player.inHelicopter = false;
        state.player.helicopterId = null;

        for (const ally of Object.values(state.allies)) {
            ally.alive = true;
            ally.health = 100;
            ally.behavior = "follow";
        }

        state.enemies = [];

        for (const mesh of state.actors.values()) {
            mesh.dispose();
        }

        state.actors.clear();

        for (const helicopter of state.helicopters) {
            if (helicopter.mesh) helicopter.mesh.dispose();
        }

        spawnEnemies(Math.min(18 + state.currentMissionIndex * 2, 35));
        spawnHelicopters(CONFIG.helicopterCount);
        rebuildActors();

        hideElement("missionResultOverlay");

        state.missionStartTime = Date.now();
        state.elapsedSeconds = 0;

        setupMission();
        updateAllHUD();

        notify("Nouvelle mission : " + state.mission.title, "success");
        saveGame(false);
    }

    /* =========================================================
       21. MOUVEMENT DU JOUEUR
    ========================================================= */

    function getPlayerSpeed() {
        const equipment = getEquipment(state.selectedEquipmentId);

        let speed = state.player.sprinting
            ? CONFIG.playerSprintSpeed
            : CONFIG.playerWalkSpeed;

        if (equipment) speed += equipment.speedBonus || 0;
        if (state.player.crouching) speed *= 0.45;

        return Math.max(1, speed);
    }

    function updatePlayerMovement(deltaSeconds) {
        const player = state.player;

        if (!player.alive || player.inHelicopter) return;

        let forward = state.input.forward - state.input.joystickY;
        let strafe = state.input.strafe + state.input.joystickX;

        forward = clamp(forward, -1, 1);
        strafe = clamp(strafe, -1, 1);

        const magnitude = Math.sqrt(forward * forward + strafe * strafe);

        if (magnitude > 1) {
            forward /= magnitude;
            strafe /= magnitude;
        }

        player.moving = magnitude > 0.05;

        if (!player.moving) return;

        const cameraAngle = state.camera ? state.camera.alpha : 0;

        const sin = Math.sin(cameraAngle);
        const cos = Math.cos(cameraAngle);

        const worldX = strafe * cos + forward * sin;
        const worldZ = -strafe * sin + forward * cos;

        const speed = getPlayerSpeed() * deltaSeconds;

        player.x = clamp(
            player.x + worldX * speed,
            -CONFIG.worldSize / 2 + 3,
            CONFIG.worldSize / 2 - 3
        );

        player.z = clamp(
            player.z + worldZ * speed,
            -CONFIG.worldSize / 2 + 3,
            CONFIG.worldSize / 2 - 3
        );

        if (magnitude > 0.1) {
            player.rotation = Math.atan2(worldX, worldZ);
        }

        if (state.camera) {
            state.camera.target.x = player.x;
            state.camera.target.y = player.inHelicopter ? 4 : 1;
            state.camera.target.z = player.z;
        }

        const markerDistance = distance2D(
            player,
            { x: 32, z: 34 }
        );

        if (markerDistance < 5) {
            updateObjectiveProgress("reach", 1);
        }

        updateObjectiveProgress("reach", 0);
    }

    function updateAllyMovement(deltaSeconds) {
        const player = state.player;

        for (const ally of Object.values(state.allies)) {
            if (!ally.alive || ally.inHelicopter) continue;

            if (ally.behavior === "hold") continue;

            let target = player;

            if (ally.behavior === "protect_ranise") {
                target = state.allies.ranise;
            } else if (ally.behavior === "protect_kerlande") {
                target = state.allies.kerlande;
            } else if (ally.behavior === "guard") {
                continue;
            }

            const distance = distance2D(ally, target);

            if (distance > 4) {
                const angle = Math.atan2(
                    target.x - ally.x,
                    target.z - ally.z
                );

                ally.x += Math.sin(angle) * 3.8 * deltaSeconds;
                ally.z += Math.cos(angle) * 3.8 * deltaSeconds;
                ally.rotation = angle;
            }
        }

        const ranise = state.allies.ranise;
        const kerlande = state.allies.kerlande;

        if (
            distance2D(player, ranise) < 7 &&
            distance2D(player, kerlande) < 7
        ) {
            updateObjectiveProgress("team", 1);
        }
    }

    /* =========================================================
       22. COMBAT ET PROJECTILES
    ========================================================= */

    function getWeapon(id) {
        return state.dynamicContent.weapons.find(item => item.id === id)
            || DEFAULT_WEAPONS.find(item => item.id === id)
            || null;
    }

    function getEquipment(id) {
        return state.dynamicContent.equipment.find(item => item.id === id)
            || DEFAULT_EQUIPMENT.find(item => item.id === id)
            || null;
    }

    function getHelicopterDefinition(id) {
        return state.dynamicContent.helicopters.find(item => item.id === id)
            || DEFAULT_HELICOPTERS.find(item => item.id === id)
            || null;
    }

    function getCurrentHelicopter() {
        if (!state.player.helicopterId) return null;

        return state.helicopters.find(
            helicopter => helicopter.id === state.player.helicopterId
        ) || null;
    }

    function getNearestEnemy(maxDistance = Infinity) {
        let best = null;
        let bestDistance = maxDistance;

        for (const enemy of state.enemies) {
            if (!enemy.alive || enemy.inHelicopter) continue;

            const distance = distance2D(state.player, enemy);

            if (distance < bestDistance) {
                bestDistance = distance;
                best = enemy;
            }
        }

        return best;
    }

    function fireWeapon(shooter = state.player, target = null) {
        if (!shooter.alive) return false;

        if (shooter.id === "selvandieu" && shooter.inHelicopter) {
            return fireHelicopterWeapon();
        }

        const weapon = getWeapon(shooter.weaponId || state.selectedWeaponId);

        if (!weapon) {
            showToast("Aucune arme sélectionnée.", "warning");
            return false;
        }

        const now = Date.now();

        if (
            shooter.lastShotAt &&
            now - shooter.lastShotAt < weapon.fireRate
        ) {
            return false;
        }

        if (shooter.id === "selvandieu") {
            if (state.ammo <= 0) {
                showToast("Chargeur vide. Rechargez votre arme.", "warning");
                return false;
            }

            state.ammo--;
            state.stats.shotsFired++;
        }

        shooter.lastShotAt = now;

        if (!target) {
            target = getNearestEnemy(weapon.range);
        }

        if (!target) {
            createVisualShot(shooter, null);
            updatePlayerHUD();
            return true;
        }

        const distance = distance2D(shooter, target);

        if (distance > weapon.range) {
            if (shooter.id === "selvandieu") {
                showToast("La cible est hors de portée.", "warning");
            }

            return true;
        }

        const hit = Math.random() <= weapon.accuracy;

        createVisualShot(shooter, target);

        if (hit) {
            target.health -= weapon.damage;

            if (target.health <= 0) {
                target.health = 0;
                target.alive = false;

                const mesh = state.actors.get(target.id);
                if (mesh) mesh.setEnabled(false);

                state.score += 25;
                state.stats.enemiesKilled++;

                updateObjectiveProgress("kill", 1);

                addLog(target.name + " neutralisé.");
                showToast("Ennemi neutralisé : +25 points.", "success");

                maybeSpawnReinforcements();
            }
        }

        updatePlayerHUD();
        updateMissionHUD();

        return true;
    }

    function createVisualShot(shooter, target) {
        if (!state.scene || !window.BABYLON) return;

        const start = new BABYLON.Vector3(
            shooter.x,
            shooter.inHelicopter ? 2.5 : 1.5,
            shooter.z
        );

        let end;

        if (target) {
            end = new BABYLON.Vector3(target.x, 1.4, target.z);
        } else {
            const angle = shooter.rotation || 0;

            end = new BABYLON.Vector3(
                shooter.x + Math.sin(angle) * 25,
                start.y,
                shooter.z + Math.cos(angle) * 25
            );
        }

        const line = BABYLON.MeshBuilder.CreateLines(
            "shotLine",
            { points: [start, end] },
            state.scene
        );

        line.color = new BABYLON.Color3(1, 0.7, 0.2);

        setTimeout(() => {
            if (line && !line.isDisposed()) line.dispose();
        }, 100);
    }

    function maybeSpawnReinforcements() {
        const kills = state.stats.enemiesKilled;

        if (kills > 0 && kills % 5 === 0) {
            spawnEnemyReinforcement();
        }
    }

    function reloadWeapon() {
        const weapon = getWeapon(state.selectedWeaponId);

        if (!weapon) return;

        if (state.ammo >= weapon.magazine) {
            showToast("Le chargeur est déjà plein.", "info");
            return;
        }

        if (state.reserveAmmo <= 0) {
            showToast("Plus de munitions en réserve.", "warning");
            return;
        }

        if (state.player.reloading) return;

        state.player.reloading = true;
        showToast("Rechargement en cours…", "info");

        setTimeout(() => {
            const needed = weapon.magazine - state.ammo;
            const available = Math.min(needed, state.reserveAmmo);

            state.ammo += available;
            state.reserveAmmo -= available;
            state.player.reloading = false;

            updatePlayerHUD();
            showToast("Rechargement terminé.", "success");
        }, 1200);
    }

    function performMeleeAttack() {
        const target = getNearestEnemy(2.5);

        if (!target) {
            showToast("Aucun ennemi à portée de combat rapproché.", "warning");
            return;
        }

        target.health -= 45;

        if (target.health <= 0) {
            target.health = 0;
            target.alive = false;

            const mesh = state.actors.get(target.id);
            if (mesh) mesh.setEnabled(false);

            state.score += 25;
            state.stats.enemiesKilled++;
            updateObjectiveProgress("kill", 1);
        }

        updateAllHUD();
        showToast("Combat rapproché exécuté.", "success");
    }

    function updateEnemyAI(deltaSeconds) {
        const targets = [
            state.player,
            ...Object.values(state.allies)
        ].filter(actor => actor.alive && !actor.inHelicopter);

        const now = Date.now();

        for (const enemy of state.enemies) {
            if (!enemy.alive || enemy.inHelicopter) continue;

            let nearest = null;
            let nearestDistance = Infinity;

            for (const target of targets) {
                const distance = distance2D(enemy, target);

                if (distance < nearestDistance) {
                    nearest = target;
                    nearestDistance = distance;
                }
            }

            if (!nearest) continue;

            enemy.targetId = nearest.id;

            if (nearestDistance > 9) {
                const angle = Math.atan2(
                    nearest.x - enemy.x,
                    nearest.z - enemy.z
                );

                enemy.x += Math.sin(angle) * 1.7 * deltaSeconds;
                enemy.z += Math.cos(angle) * 1.7 * deltaSeconds;
                enemy.rotation = angle;
            } else if (now - enemy.lastShotAt > 1600) {
                enemy.lastShotAt = now;

                const damage = randomInt(3, 8);

                if (nearest.id === "selvandieu") {
                    damagePlayer(damage);
                } else {
                    nearest.health = Math.max(0, nearest.health - damage);

                    if (nearest.health <= 0) {
                        nearest.alive = false;
                        addLog(nearest.name + " est hors de combat.");
                    }
                }
            }
        }
    }

    function damagePlayer(amount) {
        let remaining = amount;

        if (state.armor > 0) {
            const absorbed = Math.min(state.armor, remaining * 0.7);

            state.armor -= absorbed;
            remaining -= absorbed;
        }

        state.health = Math.max(0, state.health - remaining);

        state.player.health = state.health;
        state.player.armor = state.armor;
        state.player.lastDamageAt = Date.now();

        updatePlayerHUD();

        if (state.health <= 0) {
            state.player.alive = false;
            state.running = false;
            showMissionResult(false);
        }
    }

    /* =========================================================
       23. PILOTAGE D'HÉLICOPTÈRE
    ========================================================= */

    function boardHelicopter(helicopter = null) {
        if (state.player.inHelicopter) {
            showToast("Vous êtes déjà dans un hélicoptère.", "warning");
            return false;
        }

        if (!helicopter) {
            helicopter = findNearestAccessibleHelicopter(5);
        }

        if (!helicopter) {
            showToast(
                "Aucun hélicoptère accessible à proximité. Approchez-vous d'un appareil posé.",
                "warning"
            );
            return false;
        }

        if (helicopter.destroyed) {
            showToast("Cet hélicoptère est détruit.", "error");
            return false;
        }

        if (!helicopter.landed || helicopter.altitude > 1.5) {
            showToast("L'hélicoptère doit être posé pour embarquer.", "warning");
            return false;
        }

        if (helicopter.occupied && helicopter.enemy) {
            showToast("L'hélicoptère est encore occupé par l'ennemi.", "warning");
            return false;
        }

        state.player.inHelicopter = true;
        state.player.helicopterId = helicopter.id;

        helicopter.occupied = true;
        state.selectedHelicopterId = helicopter.id;

        state.player.x = helicopter.x;
        state.player.z = helicopter.z;

        updateHelicopterHUD();
        updateAllHUD();

        updateObjectiveProgress("board", 1);

        showToast("Vous avez embarqué dans " + helicopter.name + ".", "success");
        addLog("Selvandieu a embarqué dans " + helicopter.name + ".");

        return true;
    }

    function findNearestAccessibleHelicopter(maxDistance = Infinity) {
        let closest = null;
        let bestDistance = maxDistance;

        for (const helicopter of state.helicopters) {
            if (
                helicopter.destroyed ||
                !helicopter.accessible ||
                !helicopter.landed ||
                helicopter.altitude > 1.5
            ) {
                continue;
            }

            const distance = distance2D(state.player, helicopter);

            if (distance < bestDistance) {
                bestDistance = distance;
                closest = helicopter;
            }
        }

        return closest;
    }

    function exitHelicopter() {
        const helicopter = getCurrentHelicopter();

        if (!helicopter) {
            state.player.inHelicopter = false;
            state.player.helicopterId = null;
            updateHelicopterHUD();
            return false;
        }

        if (helicopter.altitude > 2) {
            showToast("Atterrissez avant de descendre.", "warning");
            return false;
        }

        helicopter.occupied = false;

        state.player.inHelicopter = false;
        state.player.helicopterId = null;

        state.player.x = helicopter.x + 2;
        state.player.z = helicopter.z + 2;

        updateHelicopterHUD();
        updateAllHUD();

        showToast("Vous êtes descendu de l'hélicoptère.", "success");
        addLog("Selvandieu a quitté l'hélicoptère.");

        return true;
    }

    function helicopterTakeoff() {
        const helicopter = getCurrentHelicopter();

        if (!helicopter) {
            showToast("Vous devez être dans un hélicoptère.", "warning");
            return;
        }

        if (!helicopter.landed) {
            showToast("L'hélicoptère est déjà en vol.", "info");
            return;
        }

        helicopter.landed = false;
        helicopter.altitude = 2;

        showToast("Décollage en cours.", "success");
        addLog("Décollage de l'hélicoptère.");
        updateObjectiveProgress("fly", 1);
    }

    function helicopterLand() {
        const helicopter = getCurrentHelicopter();

        if (!helicopter) {
            showToast("Vous devez être dans un hélicoptère.", "warning");
            return;
        }

        if (helicopter.altitude <= 0.5) {
            helicopter.altitude = 0;
            helicopter.landed = true;
            helicopter.speed = 0;

            showToast("L'hélicoptère est déjà au sol.", "info");
            return;
        }

        helicopter.altitude = Math.max(0, helicopter.altitude - 2);

        if (helicopter.altitude <= 0.5) {
            helicopter.altitude = 0;
            helicopter.landed = true;
            helicopter.speed = 0;

            showToast("Atterrissage terminé.", "success");
            addLog("L'hélicoptère a atterri.");
        }
    }

    function updateHelicopterPhysics(deltaSeconds) {
        for (const helicopter of state.helicopters) {
            if (helicopter.destroyed) continue;

            const isPlayerVehicle =
                state.player.inHelicopter &&
                state.player.helicopterId === helicopter.id;

            if (isPlayerVehicle) {
                const input = state.input.helicopter;

                if (input.accelerate) {
                    helicopter.speed += helicopter.acceleration * deltaSeconds;
                }

                if (input.brake) {
                    helicopter.speed -= helicopter.acceleration * 1.6 * deltaSeconds;
                }

                helicopter.speed = clamp(
                    helicopter.speed,
                    0,
                    helicopter.maxSpeed
                );

                if (input.turnLeft) {
                    helicopter.heading -= 1.1 * deltaSeconds;
                }

                if (input.turnRight) {
                    helicopter.heading += 1.1 * deltaSeconds;
                }

                if (input.ascend && !helicopter.landed) {
                    helicopter.altitude += 12 * deltaSeconds;
                }

                if (input.descend && !helicopter.landed) {
                    helicopter.altitude -= 12 * deltaSeconds;
                }

                helicopter.altitude = clamp(
                    helicopter.altitude,
                    0,
                    helicopter.maxAltitude
                );

                if (helicopter.altitude <= 0.1) {
                    helicopter.altitude = 0;

                    if (helicopter.speed < 2) {
                        helicopter.landed = true;
                    }
                } else {
                    helicopter.landed = false;
                }

                helicopter.x +=
                    Math.sin(helicopter.heading) *
                    helicopter.speed / 3.6 *
                    deltaSeconds;

                helicopter.z +=
                    Math.cos(helicopter.heading) *
                    helicopter.speed / 3.6 *
                    deltaSeconds;

                helicopter.fuel = Math.max(
                    0,
                    helicopter.fuel - deltaSeconds * 0.08
                );

                state.player.x = helicopter.x;
                state.player.z = helicopter.z;

                if (helicopter.fuel <= 0) {
                    helicopter.speed = 0;
                    helicopter.altitude = Math.max(0, helicopter.altitude - 4 * deltaSeconds);

                    showToast("Carburant épuisé !", "warning");
                }
            } else if (helicopter.enemy && !helicopter.landed) {
                helicopter.x +=
                    Math.sin(helicopter.heading) *
                    helicopter.speed / 3.6 *
                    deltaSeconds;

                helicopter.z +=
                    Math.cos(helicopter.heading) *
                    helicopter.speed / 3.6 *
                    deltaSeconds;

                if (Math.random() < 0.001) {
                    helicopter.landed = true;
                    helicopter.altitude = 0;
                    helicopter.speed = 0;

                    disembarkEnemiesFromHelicopter(helicopter);
                }
            }

            helicopter.x = clamp(
                helicopter.x,
                -CONFIG.worldSize / 2 + 5,
                CONFIG.worldSize / 2 - 5
            );

            helicopter.z = clamp(
                helicopter.z,
                -CONFIG.worldSize / 2 + 5,
                CONFIG.worldSize / 2 - 5
            );
        }

        updateHelicopterMeshes(deltaSeconds);
    }

    function fireHelicopterWeapon() {
        const helicopter = getCurrentHelicopter();

        if (!helicopter) return false;

        const target = getNearestEnemy(120);

        if (!target) {
            showToast("Aucune cible à portée.", "info");
            return false;
        }

        target.health -= 45;

        createVisualShot(state.player, target);

        if (target.health <= 0) {
            target.health = 0;
            target.alive = false;

            const mesh = state.actors.get(target.id);
            if (mesh) mesh.setEnabled(false);

            state.score += 25;
            state.stats.enemiesKilled++;

            updateObjectiveProgress("kill", 1);
        }

        updateAllHUD();
        return true;
    }

    /* =========================================================
       24. IA DES DEUX EXPERTS
    ========================================================= */

    function getExpert(id) {
        if (id === "selvandieu") return state.player;
        return state.allies[id] || null;
    }

    function getExpertName(id) {
        const expert = getExpert(id);
        return expert ? expert.name : id;
    }

    function expertPositionDescription(expert) {
        if (expert.inHelicopter) {
            const helicopter = state.helicopters.find(
                item => item.id === expert.helicopterId
            );

            return helicopter
                ? "Je suis dans " + helicopter.name +
                    ", à l'altitude de " + Math.round(helicopter.altitude) + " m."
                : "Je suis dans un hélicoptère.";
        }

        return (
            "Je suis aux coordonnées X " +
            expert.x.toFixed(1) +
            ", Z " +
            expert.z.toFixed(1) +
            "."
        );
    }

    function findNearestLivingEnemyFrom(expert) {
        let nearest = null;
        let bestDistance = Infinity;

        for (const enemy of state.enemies) {
            if (!enemy.alive || enemy.inHelicopter) continue;

            const distance = distance2D(expert, enemy);

            if (distance < bestDistance) {
                bestDistance = distance;
                nearest = enemy;
            }
        }

        return { enemy: nearest, distance: bestDistance };
    }

    function getInteractionResponse(command, senderId, recipientId) {
        const sender = getExpert(senderId);
        const recipient = getExpert(recipientId);

        if (!sender) {
            return "Je ne parviens pas à identifier l'expéditeur.";
        }

        if (senderId === "selvandieu" && recipientId === "selvandieu") {
            return "Je suis Selvandieu. Je peux consulter ma position et mon état.";
        }

        if (!recipient) {
            return "Je ne parviens pas à identifier le destinataire.";
        }

        const target = recipient;
        const distance = distance2D(sender, target);

        const livingEnemies = state.enemies.filter(enemy => enemy.alive);
        const nearbyEnemies = livingEnemies.filter(
            enemy => distance2D(target, enemy) < 25
        );

        const nearestEnemy = findNearestLivingEnemyFrom(target);

        switch (command) {
            case "ask_position":
            case "ask_coordinates":
                return expertPositionDescription(target);

            case "ask_ground":
                return target.inHelicopter
                    ? "Non, je suis dans un hélicoptère."
                    : "Oui, je suis au sol.";

            case "ask_vehicle":
                return target.inHelicopter
                    ? "Oui, je suis dans un hélicoptère."
                    : "Non, je suis au sol pour le moment.";

            case "ask_distance":
                return "Je suis à " + distance.toFixed(1) +
                    " mètres environ de " + sender.name + ".";

            case "ask_direction": {
                const dx = target.x - sender.x;
                const dz = target.z - sender.z;

                const horizontal = dx > 3
                    ? "à l'est"
                    : dx < -3
                        ? "à l'ouest"
                        : "presque sur le même axe est-ouest";

                const vertical = dz > 3
                    ? "au sud"
                    : dz < -3
                        ? "au nord"
                        : "presque sur le même axe nord-sud";

                return "Je suis " + horizontal + " et " + vertical + ".";
            }

            case "ask_third_expert": {
                const other = Object.values(state.allies).find(
                    ally => ally.id !== recipientId
                );

                return other
                    ? other.name + " se trouve à X " +
                        other.x.toFixed(1) + ", Z " + other.z.toFixed(1) + "."
                    : "Je ne trouve pas le troisième expert.";
            }

            case "ask_status":
                return target.name +
                    " : santé " + Math.round(target.health) +
                    " %, " +
                    (target.inHelicopter ? "dans un hélicoptère" : "au sol") +
                    ", comportement " +
                    (target.behavior || "normal") + ".";

            case "ask_danger":
                return nearbyEnemies.length
                    ? "Oui, j'ai repéré " + nearbyEnemies.length +
                        " ennemi(s) à proximité. Je reste vigilant."
                    : "Pour le moment, aucun ennemi n'est proche de ma position.";

            case "ask_enemies":
                return nearbyEnemies.length
                    ? "Oui, j'ai repéré des ennemis à proximité."
                    : "Je n'ai pas détecté d'ennemi à proximité immédiate.";

            case "ask_enemy_count":
                return "Il reste " + livingEnemies.length +
                    " ennemi(s) actif(s) sur le terrain.";

            case "ask_enemy_direction":
                if (!nearestEnemy.enemy) {
                    return "Je ne détecte aucun ennemi actif.";
                }

                return "Le plus proche se trouve à " +
                    nearestEnemy.distance.toFixed(1) +
                    " mètres de moi.";

            case "ask_enemy_helicopter": {
                const hostileHelicopter = state.helicopters.find(
                    helicopter => helicopter.enemy && !helicopter.destroyed
                );

                return hostileHelicopter
                    ? "Oui, " + hostileHelicopter.name +
                        " est détecté dans la zone."
                    : "Aucun hélicoptère ennemi détecté actuellement.";
            }

            case "ask_group_danger":
                return livingEnemies.length > 0
                    ? "La zone contient encore " + livingEnemies.length +
                        " ennemi(s). Restons prudents."
                    : "La zone semble sécurisée. Aucun ennemi actif.";

            case "guard_position":
                target.behavior = "guard";
                return "Compris. Je surveille ma position et je couvre cette zone.";

            case "watch_threats":
                target.behavior = "guard";
                return "Compris. Je surveille les menaces et je signalerai les ennemis proches.";

            case "ask_team_status":
                return teamStatusText();

            case "follow_player":
                target.behavior = "follow";
                return target.id === "selvandieu"
                    ? "Je suis le joueur principal."
                    : "Compris. Je me dirige vers Selvandieu.";

            case "stay_near":
                target.behavior = "follow";
                return "Compris. Je reste près de toi.";

            case "protect_kerlande":
                state.allies.kerlande.behavior = "protect_kerlande";
                return target.id === "kerlande"
                    ? "Compris, je reste avec toi."
                    : "Compris. Je vais protéger Kerlande.";

            case "protect_ranise":
                state.allies.ranise.behavior = "protect_ranise";
                return target.id === "ranise"
                    ? "Compris, je reste avec toi."
                    : "Compris. Je vais protéger Ranise.";

            case "cover_advance":
                target.behavior = "follow";
                return "Je couvre la progression et je reste attentif aux menaces.";

            case "hold_position":
                target.behavior = "hold";
                return "Compris. Je garde ma position jusqu'à nouvel ordre.";

            case "prepare_advance":
                target.behavior = "follow";
                return "Je suis prêt à avancer dès que tu donnes le signal.";

            case "help_objective":
                target.behavior = "follow";
                updateObjectiveProgress("team", 1);
                return "Je me rapproche de l'équipe pour contribuer à l'objectif.";

            case "ask_nearest_helicopter": {
                const helicopter = findNearestAccessibleHelicopter(Infinity);

                return helicopter
                    ? helicopter.name + " se trouve à " +
                        distance2D(target, helicopter).toFixed(1) +
                        " mètres."
                    : "Aucun hélicoptère accessible et posé n'est disponible.";
            }

            case "ally_board_helicopter": {
                const helicopter = findNearestAccessibleHelicopter(5);

                if (!helicopter) {
                    return "Je ne suis pas assez près d'un hélicoptère posé et accessible.";
                }

                target.inHelicopter = true;
                target.helicopterId = helicopter.id;
                helicopter.occupied = true;

                return "Je suis monté dans " + helicopter.name + ".";
            }

            case "prepare_boarding":
                return "Je me dirige vers l'hélicoptère accessible le plus proche.";

            case "ask_takeoff_ready":
                return target.inHelicopter
                    ? "Je suis embarqué. Nous pouvons préparer le décollage."
                    : "Je ne suis pas encore embarqué dans un hélicoptère.";

            case "ask_can_pilot":
                return target.inHelicopter
                    ? "Je suis dans l'hélicoptère. Le pilote doit utiliser les commandes de vol."
                    : "Je dois d'abord rejoindre un hélicoptère accessible.";

            case "ask_helicopter_status": {
                const helicopter = target.inHelicopter
                    ? state.helicopters.find(
                        item => item.id === target.helicopterId
                    )
                    : findNearestAccessibleHelicopter(Infinity);

                return helicopter
                    ? helicopter.name +
                        " : vitesse " + Math.round(helicopter.speed) +
                        " km/h, altitude " + Math.round(helicopter.altitude) +
                        " m, carburant " + Math.round(helicopter.fuel) + " %."
                    : "Aucun hélicoptère disponible.";
            }

            case "prepare_exit":
                return target.inHelicopter
                    ? "Je suis prêt à descendre lorsque l'hélicoptère sera posé."
                    : "Je suis déjà au sol.";

            case "ask_best_route":
                return target.inHelicopter
                    ? "Le trajet aérien est disponible. Surveille l'altitude et la vitesse."
                    : "Restez ensemble, utilisez la carte tactique et évitez les zones avec des ennemis.";

            case "ask_objective":
                return state.mission
                    ? "Objectif actuel : " + state.mission.title +
                        ". " + state.mission.description
                    : "Aucune mission active.";

            case "ask_remaining_objectives": {
                const remaining = state.mission
                    ? state.mission.objectives.filter(
                        objective => !objective.completed
                    )
                    : [];

                return remaining.length
                    ? "Il reste : " + remaining.map(item => item.text).join(" ; ") + "."
                    : "Tous les objectifs sont terminés.";
            }

            case "ask_mission_progress": {
                if (!state.mission) return "Aucune mission active.";

                const total = state.mission.objectives.length;
                const completed = state.mission.objectives.filter(
                    objective => objective.completed
                ).length;

                return "La mission est accomplie à " +
                    Math.round(completed / total * 100) + " %.";
            }

            case "ask_weapon":
                return target.id === "selvandieu"
                    ? "Tu utilises " + (getWeapon(state.selectedWeaponId)?.name || "une arme") + "."
                    : target.name + " utilise " +
                        (getWeapon(target.weaponId)?.name || "un fusil d'assaut") + ".";

            case "ask_ammo":
                return target.id === "selvandieu"
                    ? "Il te reste " + state.ammo +
                        " cartouches dans le chargeur et " +
                        state.reserveAmmo + " en réserve."
                    : "Je suis prêt à combattre. Les munitions de l'IA sont simulées.";

            case "ask_equipment":
                return target.id === "selvandieu"
                    ? "Équipement actuel : " +
                        (getEquipment(state.selectedEquipmentId)?.name || "standard") + "."
                    : "Mon équipement tactique est opérationnel.";

            case "ask_health":
                return "Santé : " + Math.round(target.health) +
                    " %, blindage : " + Math.round(target.armor || 0) + " %.";

            case "ask_team_ready":
                return teamReady()
                    ? "L'équipe est prête. Nous pouvons continuer."
                    : "Un membre de l'équipe est hors de combat. Sécurisons la zone.";

            case "ask_recommendation":
                if (livingEnemies.length > 0) {
                    return "Je recommande de rester groupés, de neutraliser les ennemis proches et de suivre la carte.";
                }

                return "La zone est dégagée. Avançons vers l'objectif de mission.";

            default:
                return "Message reçu. Je vérifie la situation tactique et reste prêt à aider.";
        }
    }

    function teamStatusText() {
        const ranise = state.allies.ranise;
        const kerlande = state.allies.kerlande;

        return (
            "État de l'équipe : Selvandieu " + Math.round(state.health) +
            " % de santé ; Ranise " + Math.round(ranise.health) +
            " % ; Kerlande " + Math.round(kerlande.health) +
            " %. Il reste " +
            state.enemies.filter(enemy => enemy.alive).length +
            " ennemi(s)."
        );
    }

    function teamReady() {
        return state.player.alive &&
            state.allies.ranise.alive &&
            state.allies.kerlande.alive;
    }

    /* =========================================================
       25. COMMUNICATION
    ========================================================= */

    function addChatMessage(sender, message, type = "expert") {
        const container = $("communicationMessages");
        if (!container) return;

        const article = document.createElement("article");
        article.className = type === "system"
            ? "chat-system-message"
            : "chat-message";

        const title = document.createElement("strong");
        title.textContent = String(sender).toUpperCase();

        const paragraph = document.createElement("p");
        paragraph.textContent = message;

        article.append(title, paragraph);
        container.append(article);

        while (container.children.length > CONFIG.maxChatMessages) {
            container.firstElementChild.remove();
        }

        container.scrollTop = container.scrollHeight;
    }

    function sendInteraction(interactionId) {
        const interaction = state.dynamicContent.interactions.find(
            item => item.id === interactionId
        );

        if (!interaction) {
            showToast("Interaction inconnue.", "warning");
            return;
        }

        const senderSelect = $("messageSenderSelect");
        const recipientSelect = $("messageRecipientSelect");

        const senderId = senderSelect ? senderSelect.value : "selvandieu";
        let recipientId = recipientSelect ? recipientSelect.value : "ranise";

        if (recipientId === "all") {
            const recipients = ["ranise", "kerlande"];

            addChatMessage(
                getExpertName(senderId),
                interaction.text,
                "expert"
            );

            for (const id of recipients) {
                const response = getInteractionResponse(
                    interaction.command,
                    senderId,
                    id
                );

                addChatMessage(getExpertName(id), response, "expert");
                performInteractionAction(interaction.command, id);
            }

            return;
        }

        if (senderId === recipientId) {
            recipientId = senderId === "ranise" ? "kerlande" : "ranise";
        }

        addChatMessage(getExpertName(senderId), interaction.text, "expert");

        const response = getInteractionResponse(
            interaction.command,
            senderId,
            recipientId
        );

        addChatMessage(getExpertName(recipientId), response, "expert");

        performInteractionAction(interaction.command, recipientId);

        state.selectedExpert = recipientId;
    }

    function sendCustomMessage(message) {
        const clean = String(message || "").trim().slice(0, 300);

        if (!clean) return;

        const senderId = $("messageSenderSelect")?.value || "selvandieu";
        const recipientId = $("messageRecipientSelect")?.value || "ranise";

        addChatMessage(getExpertName(senderId), clean, "expert");

        const recipients = recipientId === "all"
            ? ["ranise", "kerlande"]
            : [recipientId];

        for (const id of recipients) {
            const lower = clean.toLowerCase();

            let command = null;

            if (lower.includes("où es-tu") || lower.includes("position")) {
                command = "ask_position";
            } else if (lower.includes("danger") || lower.includes("ennemi")) {
                command = "ask_danger";
            } else if (lower.includes("rejoins") || lower.includes("suis-moi")) {
                command = "follow_player";
            } else if (lower.includes("hélicoptère")) {
                command = "ask_helicopter_status";
            } else if (lower.includes("mission") || lower.includes("objectif")) {
                command = "ask_objective";
            } else if (lower.includes("santé")) {
                command = "ask_health";
            }

            const response = command
                ? getInteractionResponse(command, senderId, id)
                : customMessageResponse(clean, senderId, id);

            addChatMessage(getExpertName(id), response, "expert");

            if (command) {
                performInteractionAction(command, id);
            }
        }
    }

    function customMessageResponse(message, senderId, recipientId) {
        const recipient = getExpert(recipientId);

        if (!recipient) {
            return "Je n'ai pas compris le destinataire du message.";
        }

        return recipient.name +
            " : message reçu de " +
            getExpertName(senderId) +
            ". Je suis attentif à la situation tactique. Pour une action précise, utilisez les boutons d'interaction.";
    }

    function performInteractionAction(command, expertId) {
        const expert = getExpert(expertId);

        if (!expert) return;

        switch (command) {
            case "follow_player":
            case "stay_near":
            case "prepare_advance":
            case "cover_advance":
            case "help_objective":
                expert.behavior = "follow";
                break;

            case "hold_position":
            case "guard_position":
            case "watch_threats":
                expert.behavior = "hold";
                break;

            case "protect_kerlande":
                state.allies.kerlande.behavior = "protect_kerlande";
                break;

            case "protect_ranise":
                state.allies.ranise.behavior = "protect_ranise";
                break;

            case "ally_board_helicopter": {
                const helicopter = findNearestAccessibleHelicopter(5);

                if (helicopter && expert.id !== "selvandieu") {
                    expert.inHelicopter = true;
                    expert.helicopterId = helicopter.id;
                    helicopter.occupied = true;
                }

                break;
            }

            default:
                break;
        }
    }

    function renderInteractionButtons() {
        const container = $("interactionButtons");
        if (!container) return;

        container.replaceChildren();

        const search = ($("interactionSearchInput")?.value || "")
            .trim()
            .toLowerCase();

        const category = state.selectedInteractionCategory;

        const interactions = state.dynamicContent.interactions.filter(item => {
            const matchesCategory =
                category === "all" || item.category === category;

            const matchesSearch =
                !search ||
                item.text.toLowerCase().includes(search) ||
                item.id.toLowerCase().includes(search);

            return matchesCategory && matchesSearch;
        });

        if (!interactions.length) {
            const empty = document.createElement("p");
            empty.className = "empty-state";
            empty.textContent = "Aucune interaction trouvée.";
            container.append(empty);
            return;
        }

        for (const interaction of interactions) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "interaction-button";
            button.dataset.interactionId = interaction.id;
            button.textContent = interaction.text;
            button.addEventListener("click", () => {
                sendInteraction(interaction.id);
            });

            container.append(button);
        }
    }

    /* =========================================================
       26. ARSENAL
    ========================================================= */

    function renderWeaponLibrary() {
        const container = $("weaponLibraryList");
        if (!container) return;

        container.replaceChildren();

        const weapons = state.dynamicContent.weapons;

        for (const weapon of weapons) {
            const card = document.createElement("article");
            card.className = "weapon-card";

            const heading = document.createElement("h3");
            heading.textContent = weapon.name;

            const description = document.createElement("p");
            description.textContent = weapon.description || "";

            const details = document.createElement("small");
            details.textContent =
                "Dégâts : " + weapon.damage +
                " · Portée : " + weapon.range +
                " · Chargeur : " + weapon.magazine;

            const status = document.createElement("p");

            const unlocked = weapon.unlocked ||
                weapon.price === 0 ||
                weapon.id === state.selectedWeaponId;

            status.textContent = weapon.id === state.selectedWeaponId
                ? "ARME ÉQUIPÉE"
                : unlocked
                    ? "DISPONIBLE"
                    : "Prix : " + weapon.price + " points";

            const select = document.createElement("button");
            select.type = "button";
            select.className = "btn btn-secondary btn-full";
            select.textContent = "SÉLECTIONNER";

            select.addEventListener("click", () => {
                state.selectedWeaponForPurchase = weapon.id;

                container.querySelectorAll(".weapon-card").forEach(item => {
                    item.classList.remove("selected");
                });

                card.classList.add("selected");
            });

            card.append(heading, description, details, status, select);
            container.append(card);
        }

        if ($("weaponPurchasePoints")) {
            $("weaponPurchasePoints").textContent = state.score;
        }
    }

    function equipSelectedWeapon() {
        const weapon = getWeapon(state.selectedWeaponForPurchase);

        if (!weapon) {
            showToast("Arme introuvable.", "error");
            return;
        }

        const unlocked = weapon.unlocked ||
            weapon.price === 0 ||
            weapon.id === state.selectedWeaponId;

        if (!unlocked) {
            if (state.score < weapon.price) {
                showToast("Vous n'avez pas assez de points.", "warning");
                return;
            }

            state.score -= weapon.price;
            weapon.unlocked = true;
        }

        state.selectedWeaponId = weapon.id;
        state.player.weaponId = weapon.id;

        state.ammo = weapon.magazine;
        state.reserveAmmo = weapon.reserve;

        renderWeaponLibrary();
        updatePlayerHUD();

        closePanel("weaponLibraryPanel");
        showToast(weapon.name + " équipé.", "success");
    }

    /* =========================================================
       27. ÉQUIPEMENTS
    ========================================================= */

    function renderEquipmentLibrary() {
        const container = $("equipmentLibraryList");
        if (!container) return;

        container.replaceChildren();

        for (const equipment of state.dynamicContent.equipment) {
            const card = document.createElement("article");
            card.className = "equipment-card";

            const heading = document.createElement("h3");
            heading.textContent = equipment.name;

            const description = document.createElement("p");
            description.textContent = equipment.description || "";

            const details = document.createElement("small");
            details.textContent =
                "Blindage +" + (equipment.armorBonus || 0) +
                " · Santé +" + (equipment.healthBonus || 0) +
                " · Vitesse +" + (equipment.speedBonus || 0);

            const status = document.createElement("p");

            status.textContent = equipment.id === state.selectedEquipmentId
                ? "ÉQUIPEMENT ACTUEL"
                : equipment.unlocked
                    ? "DISPONIBLE"
                    : "Prix : " + equipment.price + " points";

            const select = document.createElement("button");
            select.type = "button";
            select.className = "btn btn-secondary btn-full";
            select.textContent = "SÉLECTIONNER";

            select.addEventListener("click", () => {
                state.selectedEquipmentForPurchase = equipment.id;

                container.querySelectorAll(".equipment-card").forEach(item => {
                    item.classList.remove("selected");
                });

                card.classList.add("selected");
            });

            card.append(heading, description, details, status, select);
            container.append(card);
        }

        if ($("equipmentPurchasePoints")) {
            $("equipmentPurchasePoints").textContent = state.score;
        }
    }

    function equipSelectedEquipment() {
        const equipment = getEquipment(state.selectedEquipmentForPurchase);

        if (!equipment) {
            showToast("Équipement introuvable.", "error");
            return;
        }

        const unlocked = equipment.unlocked ||
            equipment.price === 0 ||
            equipment.id === state.selectedEquipmentId;

        if (!unlocked) {
            if (state.score < equipment.price) {
                showToast("Vous n'avez pas assez de points.", "warning");
                return;
            }

            state.score -= equipment.price;
            equipment.unlocked = true;
        }

        state.selectedEquipmentId = equipment.id;
        state.player.equipmentId = equipment.id;

        state.armor = clamp(
            state.armor + (equipment.armorBonus || 0),
            0,
            100
        );

        state.health = clamp(
            state.health + (equipment.healthBonus || 0),
            0,
            100
        );

        state.player.health = state.health;
        state.player.armor = state.armor;

        renderEquipmentLibrary();
        updateAllHUD();

        closePanel("equipmentPanel");
        showToast(equipment.name + " appliqué.", "success");
    }

    /* =========================================================
       28. BIBLIOTHÈQUE DES HÉLICOPTÈRES
    ========================================================= */

    function renderHelicopterLibrary() {
        const container = $("helicopterLibraryList");
        if (!container) return;

        container.replaceChildren();

        for (const definition of state.dynamicContent.helicopters) {
            const card = document.createElement("article");
            card.className = "helicopter-card";

            const heading = document.createElement("h3");
            heading.textContent = definition.name;

            const description = document.createElement("p");
            description.textContent = definition.description || "";

            const details = document.createElement("small");
            details.textContent =
                "Vitesse maximale : " + definition.maxSpeed +
                " km/h · Altitude : " + definition.maxAltitude + " m";

            const unlocked = definition.unlocked ||
                definition.price === 0;

            const status = document.createElement("p");
            status.textContent = unlocked
                ? "DISPONIBLE"
                : "Prix : " + definition.price + " points";

            const select = document.createElement("button");
            select.type = "button";
            select.className = "btn btn-secondary btn-full";
            select.textContent = "SÉLECTIONNER";

            select.addEventListener("click", () => {
                state.selectedHelicopterForPurchase = definition.id;

                container.querySelectorAll(".helicopter-card").forEach(item => {
                    item.classList.remove("selected");
                });

                card.classList.add("selected");
            });

            card.append(heading, description, details, status, select);
            container.append(card);
        }

        updateCurrentHelicopterName();
    }

    function updateCurrentHelicopterName() {
        const current = getCurrentHelicopter();

        if ($("currentHelicopterName")) {
            $("currentHelicopterName").textContent =
                current ? current.name.toUpperCase() : "AUCUN HÉLICOPTÈRE";
        }
    }

    function selectHelicopter() {
        const definition = getHelicopterDefinition(
            state.selectedHelicopterForPurchase
        );

        if (!definition) {
            showToast("Sélectionnez un hélicoptère.", "warning");
            return;
        }

        if (
            !definition.unlocked &&
            definition.price > 0 &&
            state.score < definition.price
        ) {
            showToast("Vous n'avez pas assez de points.", "warning");
            return;
        }

        if (!definition.unlocked && definition.price > 0) {
            state.score -= definition.price;
            definition.unlocked = true;
        }

        let helicopter = state.helicopters.find(
            item => item.id === definition.id
        );

        if (!helicopter) {
            helicopter = {
                id: definition.id,
                name: definition.name,
                enemy: false,

                x: state.player.x + 4,
                z: state.player.z + 4,

                altitude: 0,
                speed: 0,
                heading: 0,

                health: definition.health,
                fuel: definition.fuel,

                landed: true,
                occupied: false,
                accessible: true,
                destroyed: false,

                maxSpeed: definition.maxSpeed,
                acceleration: definition.acceleration,
                maxAltitude: definition.maxAltitude,

                mesh: null,
                rotor: null,
                tailRotor: null
            };

            const visual = createHelicopterMesh(helicopter);

            helicopter.mesh = visual.root;
            helicopter.rotor = visual.rotor;
            helicopter.tailRotor = visual.tailRotor;

            state.helicopters.push(helicopter);
        }

        state.selectedHelicopterId = helicopter.id;

        updateCurrentHelicopterName();
        renderHelicopterLibrary();

        showToast("Hélicoptère sélectionné.", "success");
    }

    /* =========================================================
       29. COMMANDES DE CAMÉRA ET PINCH ZOOM
    ========================================================= */

    function zoomCamera(delta) {
        if (!state.camera) return;

        state.camera.radius = clamp(
            state.camera.radius + delta,
            CONFIG.cameraMinRadius,
            CONFIG.cameraMaxRadius
        );
    }

    function resetCamera() {
        if (!state.camera) return;

        state.camera.alpha = -Math.PI / 2;
        state.camera.beta = 1.05;
        state.camera.radius = CONFIG.cameraInitialRadius;

        state.camera.target.x = state.player.x;
        state.camera.target.y = state.player.inHelicopter ? 4 : 1;
        state.camera.target.z = state.player.z;
    }

    function centerCamera() {
        if (!state.camera) return;

        state.camera.target.x = state.player.x;
        state.camera.target.y = state.player.inHelicopter ? 4 : 1;
        state.camera.target.z = state.player.z;
    }

    function installTouchCameraControls() {
        const canvas = state.canvas;

        if (!canvas) return;

        const activeTouches = new Map();

        let previousPinchDistance = 0;
        let previousX = 0;
        let previousY = 0;
        let singlePointerActive = false;

        canvas.style.touchAction = "none";

        canvas.addEventListener("pointerdown", event => {
            activeTouches.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY
            });

            if (activeTouches.size === 1) {
                previousX = event.clientX;
                previousY = event.clientY;
                singlePointerActive = true;
            } else if (activeTouches.size === 2) {
                const points = [...activeTouches.values()];

                previousPinchDistance = Math.hypot(
                    points[0].x - points[1].x,
                    points[0].y - points[1].y
                );

                singlePointerActive = false;
            }

            try {
                canvas.setPointerCapture(event.pointerId);
            } catch (_) {
                // Certains navigateurs ne prennent pas en charge la capture.
            }
        });

        canvas.addEventListener("pointermove", event => {
            if (!activeTouches.has(event.pointerId)) return;

            activeTouches.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY
            });

            if (activeTouches.size >= 2) {
                const points = [...activeTouches.values()];

                const currentDistance = Math.hypot(
                    points[0].x - points[1].x,
                    points[0].y - points[1].y
                );

                if (previousPinchDistance > 0) {
                    const difference =
                        previousPinchDistance - currentDistance;

                    zoomCamera(difference * 0.035);
                }

                previousPinchDistance = currentDistance;
                singlePointerActive = false;

                return;
            }

            if (!singlePointerActive) return;

            const deltaX = event.clientX - previousX;
            const deltaY = event.clientY - previousY;

            previousX = event.clientX;
            previousY = event.clientY;

            if (state.camera) {
                const sensitivity =
                    Number(state.settings.cameraSensitivity) / 5;

                state.camera.alpha -= deltaX * 0.004 * sensitivity;
                state.camera.beta = clamp(
                    state.camera.beta + deltaY * 0.003 * sensitivity,
                    0.18,
                    1.48
                );
            }
        });

        function releasePointer(event) {
            activeTouches.delete(event.pointerId);

            if (activeTouches.size < 2) {
                previousPinchDistance = 0;
            }

            if (activeTouches.size === 1) {
                const point = [...activeTouches.values()][0];

                previousX = point.x;
                previousY = point.y;
                singlePointerActive = true;
            } else {
                singlePointerActive = false;
            }
        }

        canvas.addEventListener("pointerup", releasePointer);
        canvas.addEventListener("pointercancel", releasePointer);
        canvas.addEventListener("lostpointercapture", releasePointer);
    }

    /* =========================================================
       30. JOYSTICK TACTILE
    ========================================================= */

    function installJoystick() {
        const joystick = $("movementJoystick");
        const knob = $("joystickKnob");

        if (!joystick || !knob) return;

        let activePointer = null;

        function updateJoystick(event) {
            const rect = joystick.getBoundingClientRect();

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const radius = rect.width * 0.32;

            let dx = event.clientX - centerX;
            let dy = event.clientY - centerY;

            const length = Math.hypot(dx, dy);

            if (length > radius) {
                dx = dx / length * radius;
                dy = dy / length * radius;
            }

            knob.style.transform =
                "translate(" + dx + "px, " + dy + "px)";

            state.input.joystickX = clamp(dx / radius, -1, 1);
            state.input.joystickY = clamp(dy / radius, -1, 1);
        }

        function resetJoystick() {
            activePointer = null;

            knob.style.transform = "translate(0, 0)";

            state.input.joystickX = 0;
            state.input.joystickY = 0;
        }

        joystick.addEventListener("pointerdown", event => {
            activePointer = event.pointerId;
            updateJoystick(event);

            try {
                joystick.setPointerCapture(event.pointerId);
            } catch (_) {}
        });

        joystick.addEventListener("pointermove", event => {
            if (event.pointerId !== activePointer) return;
            updateJoystick(event);
        });

        joystick.addEventListener("pointerup", event => {
            if (event.pointerId === activePointer) resetJoystick();
        });

        joystick.addEventListener("pointercancel", resetJoystick);
    }

    /* =========================================================
       31. CLAVIER
    ========================================================= */

    function installKeyboardControls() {
        const keys = new Set();

        window.addEventListener("keydown", event => {
            const key = event.key.toLowerCase();

            if (
                ["w", "a", "s", "d", "arrowup", "arrowdown",
                    "arrowleft", "arrowright", " "].includes(key)
            ) {
                event.preventDefault();
            }

            keys.add(key);

            if (key === "escape") {
                if (!state.paused) pauseGame();
                else resumeGame();
            }

            if (key === "r") reloadWeapon();
            if (key === "f") interactWithNearestObject();
            if (key === "e") boardHelicopter();
            if (key === "q") exitHelicopter();

            if (key === " " && !state.player.inHelicopter) {
                jumpPlayer();
            }
        });

        window.addEventListener("keyup", event => {
            keys.delete(event.key.toLowerCase());
        });

        state.readKeyboard = () => {
            state.input.forward =
                (keys.has("w") || keys.has("arrowup") ? 1 : 0) -
                (keys.has("s") || keys.has("arrowdown") ? 1 : 0);

            state.input.strafe =
                (keys.has("d") || keys.has("arrowright") ? 1 : 0) -
                (keys.has("a") || keys.has("arrowleft") ? 1 : 0);

            state.player.sprinting =
                keys.has("shift") || state.input.sprint;

            state.input.fire = keys.has(" ");

            const flight = state.input.helicopter;

            flight.accelerate = keys.has("w") || keys.has("arrowup");
            flight.brake = keys.has("s") || keys.has("arrowdown");
            flight.turnLeft = keys.has("a") || keys.has("arrowleft");
            flight.turnRight = keys.has("d") || keys.has("arrowright");
            flight.ascend = keys.has(" ");
            flight.descend = keys.has("control");
        };
    }

    /* =========================================================
       32. ACTIONS DU JOUEUR
    ========================================================= */

    function jumpPlayer() {
        if (state.player.inHelicopter) {
            showToast("Vous êtes dans un hélicoptère.", "info");
            return;
        }

        const mesh = state.actors.get("selvandieu");
        if (!mesh) return;

        mesh.position.y = 0.9;

        setTimeout(() => {
            if (mesh && !mesh.isDisposed()) {
                mesh.position.y = 0;
            }
        }, 350);
    }

    function toggleCrouch() {
        state.player.crouching = !state.player.crouching;

        const mesh = state.actors.get("selvandieu");

        if (mesh) {
            mesh.scaling.y = state.player.crouching ? 0.7 : 1;
        }

        showToast(
            state.player.crouching
                ? "Position accroupie."
                : "Position debout.",
            "info"
        );
    }

    function aimWeapon() {
        state.player.aiming = !state.player.aiming;

        if (state.camera) {
            state.camera.radius = state.player.aiming ? 6 : CONFIG.cameraInitialRadius;
        }

        showToast(
            state.player.aiming ? "Visée activée." : "Visée désactivée.",
            "info"
        );
    }

    function interactWithNearestObject() {
        const helicopter = findNearestAccessibleHelicopter(5);

        if (helicopter && !state.player.inHelicopter) {
            boardHelicopter(helicopter);
            return;
        }

        if (state.player.inHelicopter) {
            exitHelicopter();
            return;
        }

        const target = getNearestEnemy(3);

        if (target) {
            performMeleeAttack();
            return;
        }

        showToast("Aucune interaction disponible à proximité.", "info");
    }

    /* =========================================================
       33. PAUSE ET ÉCRANS
    ========================================================= */

    function pauseGame() {
        state.paused = true;
        showElement("pauseOverlay");
        addLog("Mission mise en pause.");
    }

    function resumeGame() {
        state.paused = false;
        hideElement("pauseOverlay");
        showToast("Mission reprise.", "success");
    }

    function startGame() {
        if (!state.initialized) {
            showToast("Le moteur 3D n'est pas prêt.", "warning");
            return;
        }

        state.gameStarted = true;
        state.running = true;
        state.paused = false;

        if (!state.mission) {
            state.currentMissionIndex = 0;
            state.mission = createMission(0);
        }

        setupMission();

        hideElement("mainMenu");
        hideElement("loadingScreen");
        hideElement("missionResultOverlay");
        hideElement("pauseOverlay");
        hideElement("gameErrorScreen");

        showElement("gameScreen");

        closeAllPanels();

        updateAllHUD();
        centerCamera();

        addLog("Mission démarrée : " + state.mission.title);
        showToast("Mission lancée. Bonne opération !", "success");
    }

    async function continueGame() {
        const loaded = await loadGame(false);

        if (!loaded) {
            state.currentMissionIndex = 0;
            state.mission = createMission(0);
        }

        startGame();
    }

    function returnToMenu() {
        state.running = false;
        state.paused = false;

        hideElement("gameScreen");
        hideElement("pauseOverlay");
        hideElement("missionResultOverlay");

        showElement("mainMenu");
    }

    function requestConfirmation(title, message, action) {
        if ($("confirmationTitle")) {
            $("confirmationTitle").textContent = title;
        }

        if ($("confirmationMessage")) {
            $("confirmationMessage").textContent = message;
        }

        state.pendingConfirmation = action;

        showElement("confirmationDialog");
    }

    function executeConfirmation() {
        const action = state.pendingConfirmation;
        state.pendingConfirmation = null;

        hideElement("confirmationDialog");

        if (typeof action === "function") {
            action();
        }
    }

    /* =========================================================
       34. PARAMÈTRES
    ========================================================= */

    async function loadSettings() {
        try {
            let saved = null;

            if (state.database) {
                saved = await dbGet("settings", CONFIG.settingsKey);
            }

            if (!saved) {
                const raw = localStorage.getItem(CONFIG.settingsKey);
                saved = raw ? JSON.parse(raw) : null;
            }

            if (saved && saved.value) {
                Object.assign(state.settings, saved.value);
            }
        } catch (error) {
            console.warn("[FOBAS] Paramètres :", error);
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

        for (const [id, value] of Object.entries(mapping)) {
            if ($(id)) $(id).checked = Boolean(value);
        }

        if ($("graphicsQuality")) {
            $("graphicsQuality").value = state.settings.graphicsQuality;
        }

        if ($("cameraSensitivity")) {
            $("cameraSensitivity").value = state.settings.cameraSensitivity;
        }

        if ($("minimapPanel")) {
            $("minimapPanel").style.display =
                state.settings.showMinimap ? "" : "none";
        }

        updateCoordinates();
    }

    async function applySettings() {
        state.settings.soundEnabled = $("soundEnabled")?.checked ?? true;
        state.settings.musicEnabled = $("musicEnabled")?.checked ?? false;
        state.settings.showCoordinates = $("showCoordinates")?.checked ?? true;
        state.settings.showMinimap = $("showMinimap")?.checked ?? true;
        state.settings.autoSaveEnabled = $("autoSaveEnabled")?.checked ?? true;

        state.settings.graphicsQuality =
            $("graphicsQuality")?.value || "medium";

        state.settings.cameraSensitivity =
            Number($("cameraSensitivity")?.value || 5);

        applySettingsToControls();

        const saved = {
            id: CONFIG.settingsKey,
            value: state.settings,
            savedAt: Date.now()
        };

        try {
            if (state.database) {
                await dbPut("settings", saved);
            }

            localStorage.setItem(CONFIG.settingsKey, JSON.stringify(saved));
        } catch (error) {
            console.warn("[FOBAS] Impossible d'enregistrer les paramètres.", error);
        }

        if (state.engine) {
            state.engine.setHardwareScalingLevel(
                state.settings.graphicsQuality === "low"
                    ? 1.5
                    : state.settings.graphicsQuality === "high"
                        ? 0.8
                        : 1
            );
        }

        showToast("Paramètres appliqués.", "success");
    }

    async function toggleFullscreen() {
        const element = $("gameScreen");

        try {
            if (!document.fullscreenElement) {
                await (element || document.documentElement).requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            showToast("Le mode plein écran n'est pas disponible.", "warning");
        }
    }

    /* =========================================================
       35. SYNCHRONISATION DYNAMIQUE TOUTES LES 10 MINUTES
    ========================================================= */

    function initializeDynamicContent() {
        state.dynamicContent = {
            version: 1,
            missions: createMissionSeries(40),
            interactions: deepClone(DEFAULT_INTERACTIONS),
            weapons: deepClone(DEFAULT_WEAPONS),
            equipment: deepClone(DEFAULT_EQUIPMENT),
            helicopters: deepClone(DEFAULT_HELICOPTERS)
        };
    }

    async function loadCachedContent() {
        try {
            let cached = null;

            if (state.database) {
                cached = await dbGet("content", CONFIG.contentKey);
            }

            if (!cached) {
                const raw = localStorage.getItem(CONFIG.contentKey);
                cached = raw ? JSON.parse(raw) : null;
            }

            if (cached && cached.value) {
                mergeDynamicContent(cached.value);
            }
        } catch (error) {
            console.warn("[FOBAS] Cache de contenu :", error);
        }
    }

    function mergeDynamicContent(remote) {
        if (!remote || typeof remote !== "object") return;

        const mergeById = (defaults, incoming) => {
            if (!Array.isArray(incoming)) return defaults;

            const map = new Map(defaults.map(item => [item.id, item]));

            for (const item of incoming) {
                if (
                    item &&
                    typeof item.id === "string" &&
                    item.id.length > 0
                ) {
                    map.set(item.id, {
                        ...(map.get(item.id) || {}),
                        ...item
                    });
                }
            }

            return [...map.values()];
        };

        state.dynamicContent.interactions = mergeById(
            state.dynamicContent.interactions,
            remote.interactions
        );

        state.dynamicContent.weapons = mergeById(
            state.dynamicContent.weapons,
            remote.weapons
        );

        state.dynamicContent.equipment = mergeById(
            state.dynamicContent.equipment,
            remote.equipment
        );

        state.dynamicContent.helicopters = mergeById(
            state.dynamicContent.helicopters,
            remote.helicopters
        );

        if (Array.isArray(remote.missions)) {
            state.dynamicContent.missions = remote.missions;
        }

        if (remote.version) {
            state.dynamicContent.version = remote.version;
        }
    }

    async function syncDynamicContent(manual = false) {
        if ($("syncStatusText")) {
            $("syncStatusText").textContent = "Vérification du contenu…";
        }

        try {
            if (!CONFIG.contentEndpoint) {
                state.lastSyncAt = Date.now();

                if ($("syncStatusText")) {
                    $("syncStatusText").textContent =
                        "Contenu local prêt · " +
                        new Date(state.lastSyncAt).toLocaleTimeString();
                }

                if (manual) {
                    showToast(
                        "Contenu local vérifié. Aucune API distante configurée.",
                        "info"
                    );
                }

                return false;
            }

            const response = await fetch(CONFIG.contentEndpoint, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store",
                signal: AbortSignal.timeout(15000)
            });

            if (!response.ok) {
                throw new Error("Erreur HTTP " + response.status);
            }

            const remote = await response.json();

            // Les données sont fusionnées, sans toucher à la sauvegarde
            // de la progression du joueur.
            mergeDynamicContent(remote);

            const cached = {
                id: CONFIG.contentKey,
                value: state.dynamicContent,
                savedAt: Date.now()
            };

            if (state.database) {
                await dbPut("content", cached);
            }

            localStorage.setItem(CONFIG.contentKey, JSON.stringify(cached));

            state.lastSyncAt = Date.now();

            renderInteractionButtons();
            renderWeaponLibrary();
            renderEquipmentLibrary();
            renderHelicopterLibrary();

            if ($("syncStatusText")) {
                $("syncStatusText").textContent =
                    "Synchronisé · " +
                    new Date(state.lastSyncAt).toLocaleTimeString();
            }

            if ($("syncStatusIndicator")) {
                $("syncStatusIndicator").classList.add("connected");
            }

            addLog("Contenu dynamique synchronisé.");

            if (manual) {
                showToast("Contenu dynamique actualisé.", "success");
            }

            return true;
        } catch (error) {
            console.warn("[FOBAS] Synchronisation :", error);

            if ($("syncStatusText")) {
                $("syncStatusText").textContent =
                    "Mode local · synchronisation indisponible";
            }

            if (manual) {
                showToast(
                    "Synchronisation impossible. Le contenu local reste disponible.",
                    "warning"
                );
            }

            return false;
        }
    }

    /* =========================================================
       36. BOUCLE PRINCIPALE DU JEU
    ========================================================= */

    let lastFrameTime = 0;
    let hudUpdateTimer = 0;
    let reinforcementTimer = 0;

    function updateGameLoop() {
        const now = performance.now();

        if (!lastFrameTime) {
            lastFrameTime = now;
            return;
        }

        const deltaSeconds = clamp(
            (now - lastFrameTime) / 1000,
            0,
            0.05
        );

        lastFrameTime = now;

        if (state.readKeyboard) {
            state.readKeyboard();
        }

        if (state.input.fire) {
            fireWeapon();
        }

        if (state.player.alive) {
            updatePlayerMovement(deltaSeconds);
        }

        updateAllyMovement(deltaSeconds);
        updateEnemyAI(deltaSeconds);
        updateHelicopterPhysics(deltaSeconds);
        syncActorMeshes();

        state.elapsedSeconds += deltaSeconds;

        hudUpdateTimer += deltaSeconds;
        reinforcementTimer += deltaSeconds;

        if (hudUpdateTimer >= 0.25) {
            hudUpdateTimer = 0;

            updateAllHUD();
            updateTargetIndicator();
        }

        if (reinforcementTimer >= 90) {
            reinforcementTimer = 0;

            if (Math.random() < 0.5) {
                spawnEnemyReinforcement();
            }
        }

        if (
            state.settings.autoSaveEnabled &&
            state.elapsedSeconds > 0 &&
            Math.floor(state.elapsedSeconds) % 60 === 0
        ) {
            if (!state._lastAutosaveMinute ||
                state._lastAutosaveMinute !== Math.floor(state.elapsedSeconds / 60)) {
                state._lastAutosaveMinute =
                    Math.floor(state.elapsedSeconds / 60);

                saveGame(false);
            }
        }
    }

    function updateTargetIndicator() {
        const target = getNearestEnemy(120);
        const indicator = $("targetIndicator");

        if (!indicator) return;

        if (!target) {
            hideElement("targetIndicator");
            return;
        }

        showElement("targetIndicator");

        if ($("targetName")) {
            $("targetName").textContent = target.name.toUpperCase();
        }

        if ($("targetDistance")) {
            $("targetDistance").textContent =
                "DISTANCE : " +
                distance2D(state.player, target).toFixed(1) +
                " M";
        }
    }

    /* =========================================================
       37. CONNEXION DE TOUS LES BOUTONS HTML
    ========================================================= */

    function bindClick(id, callback) {
        const element = $(id);

        if (!element) {
            console.warn("[FOBAS] Élément HTML absent :", id);
            return;
        }

        element.addEventListener("click", event => {
            event.preventDefault();

            try {
                callback(event);
            } catch (error) {
                console.error("[FOBAS] Bouton " + id + " :", error);
                showToast("Une erreur est survenue pendant cette action.", "error");
            }
        });
    }

    function bindAllControls() {
        /* Menu */
        bindClick("startGameButton", startGame);
        bindClick("continueGameButton", continueGame);

        bindClick("backToMenuButton", () => {
            pauseGame();
        });

        /* Sauvegarde */
        bindClick("saveGameButton", () => {
            openPanel("saveManagementPanel");
        });

        bindClick("saveNowButton", () => saveGame(true));
        bindClick("loadSavedGameButton", () => loadGame(true));

        bindClick("resetGameButton", () => {
            requestConfirmation(
                "RÉINITIALISER LA PARTIE",
                "Voulez-vous vraiment réinitialiser la progression ?",
                resetGame
            );
        });

        bindClick("closeSaveManagementButton", () => {
            closePanel("saveManagementPanel");
        });

        bindClick("pauseSaveButton", () => saveGame(true));

        /* Pause */
        bindClick("pauseGameButton", pauseGame);
        bindClick("resumeGameButton", resumeGame);

        bindClick("pauseSettingsButton", () => {
            hideElement("pauseOverlay");
            openPanel("settingsPanel");
        });

        bindClick("pauseReturnMenuButton", returnToMenu);
        bindClick("resultReturnMenuButton", returnToMenu);

        /* Résultats */
        bindClick("nextMissionButton", startNextMission);

        bindClick("retryMissionButton", () => {
            state.mission = createMission(state.currentMissionIndex);
            state.health = 100;
            state.armor = 100;
            state.player.health = 100;
            state.player.armor = 100;
            state.player.alive = true;

            hideElement("missionResultOverlay");

            state.running = true;
            state.paused = false;

            setupMission();
            showToast("Mission recommencée.", "success");
        });

        /* Confirmation */
        bindClick("confirmActionButton", executeConfirmation);

        bindClick("cancelActionButton", () => {
            state.pendingConfirmation = null;
            hideElement("confirmationDialog");
        });

        /* Panneau de mission */
        bindClick("toggleMissionPanelButton", () => {
            toggleElement("missionObjectives");
            toggleElement("missionDescription");
            toggleElement("missionProgressHeading");
        });

        /* Carte */
        bindClick("toggleMapButton", () => {
            const canvas = $("minimapCanvas");
            const legend = document.querySelector(".map-legend");
            const coordinates = document.querySelector(".coordinates-row");

            if (!canvas) return;

            const hidden = canvas.style.display === "none";

            canvas.style.display = hidden ? "" : "none";

            if (legend) legend.style.display = hidden ? "" : "none";
            if (coordinates) coordinates.style.display = hidden ? "" : "none";
        });

        bindClick("centerCameraButton", centerCamera);
        bindClick("resetCameraButton", resetCamera);
        bindClick("zoomInButton", () => zoomCamera(-2));
        bindClick("zoomOutButton", () => zoomCamera(2));

        /* Actions du joueur */
        bindClick("interactButton", interactWithNearestObject);
        bindClick("shootButton", () => fireWeapon());
        bindClick("aimButton", aimWeapon);
        bindClick("reloadButton", reloadWeapon);
        bindClick("jumpButton", jumpPlayer);
        bindClick("crouchButton", toggleCrouch);

        bindClick("sprintButton", () => {
            state.player.sprinting = !state.player.sprinting;

            showToast(
                state.player.sprinting
                    ? "Sprint activé."
                    : "Sprint désactivé.",
                "info"
            );
        });

        bindClick("meleeButton", performMeleeAttack);

        /* Arsenal */
        bindClick("openWeaponLibraryButton", () => {
            closeAllPanels();
            openPanel("weaponLibraryPanel");
            renderWeaponLibrary();
        });

        bindClick("closeWeaponLibraryButton", () => {
            closePanel("weaponLibraryPanel");
        });

        bindClick("confirmWeaponButton", equipSelectedWeapon);

        /* Équipements */
        bindClick("openEquipmentButton", () => {
            closeAllPanels();
            openPanel("equipmentPanel");
            renderEquipmentLibrary();
        });

        bindClick("closeEquipmentButton", () => {
            closePanel("equipmentPanel");
        });

        bindClick("confirmEquipmentButton", equipSelectedEquipment);

        /* Hélicoptères */
        bindClick("openHelicopterLibraryButton", () => {
            closeAllPanels();
            openPanel("helicopterLibraryPanel");
            renderHelicopterLibrary();
        });

        bindClick("closeHelicopterLibraryButton", () => {
            closePanel("helicopterLibraryPanel");
        });

        bindClick("selectHelicopterButton", selectHelicopter);

        bindClick("boardHelicopterButton", () => boardHelicopter());

        bindClick("exitHelicopterButton", exitHelicopter);

        /* Pilotage */
        bindClick("closeFlightControlsButton", () => {
            hideElement("helicopterFlightControls");
        });

        bindClick("helicopterTakeoffButton", helicopterTakeoff);
        bindClick("helicopterLandButton", helicopterLand);

        bindClick("helicopterAccelerateButton", () => {
            const helicopter = getCurrentHelicopter();

            if (!helicopter) {
                showToast("Vous devez être dans un hélicoptère.", "warning");
                return;
            }

            helicopter.speed = clamp(
                helicopter.speed + 10,
                0,
                helicopter.maxSpeed
            );

            updateHelicopterHUD();
        });

        bindClick("helicopterBrakeButton", () => {
            const helicopter = getCurrentHelicopter();

            if (helicopter) {
                helicopter.speed = Math.max(0, helicopter.speed - 15);
                updateHelicopterHUD();
            }
        });

        bindClick("helicopterAscendButton", () => {
            const helicopter = getCurrentHelicopter();

            if (!helicopter) return;

            helicopter.landed = false;
            helicopter.altitude = clamp(
                helicopter.altitude + 8,
                0,
                helicopter.maxAltitude
            );

            updateHelicopterHUD();
        });

        bindClick("helicopterDescendButton", () => {
            const helicopter = getCurrentHelicopter();

            if (!helicopter) return;

            helicopter.altitude = Math.max(0, helicopter.altitude - 8);

            if (helicopter.altitude === 0 && helicopter.speed < 2) {
                helicopter.landed = true;
            }

            updateHelicopterHUD();
        });

        bindClick("helicopterTurnLeftButton", () => {
            const helicopter = getCurrentHelicopter();
            if (helicopter) helicopter.heading -= 0.25;
        });

        bindClick("helicopterTurnRightButton", () => {
            const helicopter = getCurrentHelicopter();
            if (helicopter) helicopter.heading += 0.25;
        });

        bindClick("helicopterHoverButton", () => {
            const helicopter = getCurrentHelicopter();

            if (!helicopter) return;

            helicopter.speed = 0;
            showToast("Vitesse stabilisée.", "success");
        });

        bindClick("helicopterExitButton", exitHelicopter);

        /* Communication */
        bindClick("openCommunicationButton", () => {
            closeAllPanels();
            openPanel("communicationPanel");
        });

        bindClick("closeCommunicationButton", () => {
            closePanel("communicationPanel");
        });

        bindClick("selectSelvandieuButton", () => {
            $("messageSenderSelect").value = "selvandieu";
            state.selectedExpert = "selvandieu";
        });

        bindClick("selectRaniseButton", () => {
            $("messageRecipientSelect").value = "ranise";
            state.selectedExpert = "ranise";
        });

        bindClick("selectKerlandeButton", () => {
            $("messageRecipientSelect").value = "kerlande";
            state.selectedExpert = "kerlande";
        });

        /* Interactions */
        document.querySelectorAll("[data-interaction-category]").forEach(button => {
            button.addEventListener("click", () => {
                document.querySelectorAll("[data-interaction-category]").forEach(tab => {
                    tab.classList.remove("active");
                });

                button.classList.add("active");

                state.selectedInteractionCategory =
                    button.dataset.interactionCategory;

                renderInteractionButtons();
            });
        });

        if ($("interactionSearchInput")) {
            $("interactionSearchInput").addEventListener(
                "input",
                renderInteractionButtons
            );
        }

        if ($("customMessageForm")) {
            $("customMessageForm").addEventListener("submit", event => {
                event.preventDefault();

                const input = $("customMessageInput");

                if (!input) return;

                sendCustomMessage(input.value);
                input.value = "";
            });
        }

        /* Journal */
        bindClick("openTacticalLogButton", () => {
            closeAllPanels();
            openPanel("tacticalLogPanel");
        });

        bindClick("closeTacticalLogButton", () => {
            closePanel("tacticalLogPanel");
        });

        bindClick("clearTacticalLogButton", () => {
            const container = $("tacticalLogEntries");

            if (container) {
                container.replaceChildren();

                const empty = document.createElement("p");
                empty.className = "empty-state";
                empty.textContent = "Aucun événement enregistré.";

                container.append(empty);
            }

            showToast("Journal tactique effacé.", "success");
        });

        /* Paramètres */
        bindClick("openSettingsButton", () => {
            closeAllPanels();
            openPanel("settingsPanel");
        });

        bindClick("closeSettingsButton", () => {
            closePanel("settingsPanel");
        });

        bindClick("applySettingsButton", applySettings);
        bindClick("fullscreenButton", toggleFullscreen);

        /* Synchronisation */
        bindClick("syncNowButton", () => syncDynamicContent(true));

        /* Erreur */
        bindClick("retryGameInitializationButton", async () => {
            hideElement("gameErrorScreen");
            showElement("loadingScreen");

            await initializeBabylon();
        });

        bindClick("errorReturnMenuButton", () => {
            hideElement("gameErrorScreen");
            showElement("mainMenu");
        });

        installJoystick();
        installKeyboardControls();

        // Le canvas et les événements tactiles ne sont disponibles
        // qu'après l'initialisation du moteur.
        installTouchCameraControls();

        // Tir continu tactile.
        const shootButton = $("shootButton");

        if (shootButton) {
            shootButton.addEventListener("pointerdown", () => {
                state.input.fire = true;
            });

            const stopFiring = () => {
                state.input.fire = false;
            };

            shootButton.addEventListener("pointerup", stopFiring);
            shootButton.addEventListener("pointercancel", stopFiring);
            shootButton.addEventListener("pointerleave", stopFiring);
        }

        // Maintien des commandes de vol.
        bindHoldButton("helicopterAccelerateButton", "accelerate");
        bindHoldButton("helicopterBrakeButton", "brake");
        bindHoldButton("helicopterAscendButton", "ascend");
        bindHoldButton("helicopterDescendButton", "descend");
        bindHoldButton("helicopterTurnLeftButton", "turnLeft");
        bindHoldButton("helicopterTurnRightButton", "turnRight");
    }

    function bindHoldButton(id, inputName) {
        const button = $(id);
        if (!button) return;

        const start = event => {
            event.preventDefault();
            state.input.helicopter[inputName] = true;
        };

        const stop = event => {
            if (event) event.preventDefault();
            state.input.helicopter[inputName] = false;
        };

        button.addEventListener("pointerdown", start);
        button.addEventListener("pointerup", stop);
        button.addEventListener("pointerleave", stop);
        button.addEventListener("pointercancel", stop);
    }

    /* =========================================================
       38. INITIALISATION GÉNÉRALE
    ========================================================= */

    async function boot() {
        try {
            initializeDynamicContent();

            await initializeDatabase();
            await loadSettings();
            await loadCachedContent();

            if (!state.mission) {
                state.mission = createMission(0);
            }

            await initializeBabylon();

            if (state.initialized) {
                updateAllHUD();

                // Synchronisation initiale et répétition toutes les 10 minutes.
                await syncDynamicContent(false);

                setInterval(() => {
                    syncDynamicContent(false);
                }, CONFIG.syncInterval);

                setInterval(() => {
                    if (
                        state.running &&
                        !state.paused &&
                        state.settings.autoSaveEnabled
                    ) {
                        saveGame(false);
                    }
                }, CONFIG.autoSaveInterval);
            }
        } catch (error) {
            console.error("[FOBAS] Erreur de démarrage :", error);

            if ($("gameErrorMessage")) {
                $("gameErrorMessage").textContent =
                    error.message || "Erreur au démarrage du jeu.";
            }

            hideElement("loadingScreen");
            showElement("gameErrorScreen");
        }
    }

    /* =========================================================
       39. EXPORT POUR EXTENSIONS ET DEBUG
    ========================================================= */

    window.FOBAS_ELITE_STRIKE = {
        version: CONFIG.version,

        getState() {
            return state;
        },

        saveGame,
        loadGame,
        resetGame,

        startGame,
        pauseGame,
        resumeGame,

        sendInteraction,
        sendCustomMessage,

        syncDynamicContent,

        addInteraction(interaction) {
            if (
                !interaction ||
                typeof interaction.id !== "string" ||
                typeof interaction.text !== "string" ||
                typeof interaction.command !== "string"
            ) {
                throw new TypeError(
                    "Une interaction doit avoir id, text et command."
                );
            }

            const existing = state.dynamicContent.interactions.findIndex(
                item => item.id === interaction.id
            );

            if (existing >= 0) {
                state.dynamicContent.interactions[existing] = {
                    ...state.dynamicContent.interactions[existing],
                    ...interaction
                };
            } else {
                state.dynamicContent.interactions.push(interaction);
            }

            renderInteractionButtons();

            return true;
        },

        addMission(mission) {
            if (!mission || !mission.title || !Array.isArray(mission.objectives)) {
                throw new TypeError(
                    "Une mission doit avoir un titre et une liste d'objectifs."
                );
            }

            state.dynamicContent.missions.push(mission);

            return state.dynamicContent.missions.length;
        },

        getTeamStatus: teamStatusText
    };

    /* =========================================================
       40. DÉMARRAGE
    ========================================================= */

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }
})();