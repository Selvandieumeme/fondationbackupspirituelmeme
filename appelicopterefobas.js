/* ============================================================
   FOBAS ELITE STRIKE 3D
   JavaScript principal — Version 2.0.0
   Babylon.js 9.30.0
   40 missions | 3 experts | IA | Armes | Hélicoptères
   IndexedDB | Android | Touch | Sauvegarde automatique
============================================================ */

import {
    Engine,
    Scene,
    Vector3,
    Color3,
    Color4,
    HemisphericLight,
    DirectionalLight,
    StandardMaterial,
    MeshBuilder,
    TransformNode,
    ArcRotateCamera,
    DynamicTexture,
    Ray,
    Scalar,
    Animation
} from "@babylonjs/core";

(() => {
    "use strict";

    /* =========================================================
       1. CONFIGURATION GÉNÉRALE
    ========================================================= */

    const CONFIG = Object.freeze({
        name: "FOBAS ELITE STRIKE 3D",
        version: "2.0.0",
        database: "FOBASEliteStrikeDB",
        databaseVersion: 1,
        saveKey: "main-save",
        worldSize: 280,
        enemyCount: 7,
        maxEnemies: 12,
        maxHealth: 100,
        maxArmor: 100,
        walkSpeed: 6,
        sprintSpeed: 10,
        enemySpeed: 2.2,
        allySpeed: 4.4,
        cameraMin: 5,
        cameraMax: 32,
        cameraStart: 13,
        autosaveInterval: 60000,
        syncInterval: 600000,
        reloadDuration: 1400,
        fireInterval: 170,
        enemyFireInterval: 1250,
        allyFireInterval: 750,
        interactionDistance: 5,
        helicopterBoardDistance: 7,
        playerDamage: 7,
        enemyDamage: 5
    });

    const $ = id => document.getElementById(id);

    const ui = new Proxy({}, {
        get(_, id) {
            return $(id);
        }
    });

    const state = {
        initialized: false,
        running: false,
        paused: false,
        gameOver: false,
        missionIndex: 0,
        score: 0,
        kills: 0,
        missionKills: 0,
        missionStart: 0,
        missionElapsed: 0,
        lastShot: 0,
        lastAutoSave: 0,
        lastSync: 0,
        reloading: false,
        aiming: false,
        crouching: false,
        sprinting: false,
        moving: false,
        interactionDone: false,
        surviveStarted: 0,
        selectedWeapon: "rifle",
        selectedEquipment: "standard",
        selectedHelicopter: "falcon",
        currentHelicopter: null,
        selectedExpert: "selvandieu",
        messageCount: 0,
        unreadMessages: 0,
        interactionCategory: "position",
        interactionSearch: "",
        pendingConfirmation: null,
        graphicsQuality: "medium",
        cameraSensitivity: 5,
        soundEnabled: true,
        musicEnabled: false,
        showCoordinates: true,
        showMinimap: true,
        autoSaveEnabled: true,
        touchFire: false,
        joystick: { x: 0, z: 0 },
        keys: new Set(),
        lastFrame: performance.now(),
        time: 0,
        activeMission: null,
        missionCompleted: false,
        missionFailed: false
    };

    const world = {
        engine: null,
        scene: null,
        camera: null,
        canvas: null,
        materials: {},
        player: null,
        allies: [],
        enemies: [],
        helicopters: [],
        buildings: [],
        trees: [],
        effects: [],
        missionMarker: null,
        ground: null,
        lastEnemyUpdate: 0,
        lastAllyUpdate: 0,
        lastMinimapUpdate: 0,
        animationTime: 0
    };

    const player = {
        id: "selvandieu",
        name: "Selvandieu",
        health: 100,
        armor: 100,
        speed: CONFIG.walkSpeed,
        alive: true,
        weapon: "rifle",
        ammo: 30,
        reserve: 9999,
        kills: 0,
        position: new Vector3(0, 0, 0),
        heading: 0,
        jumping: false,
        jumpVelocity: 0,
        isBoarded: false,
        crouching: false
    };

    const teamData = [
        {
            id: "ranise",
            name: "Ranise",
            color: new Color3(0.15, 0.55, 1),
            role: "Expert tactique",
            health: 100,
            armor: 100,
            alive: true
        },
        {
            id: "kerlande",
            name: "Kerlande",
            color: new Color3(0.8, 0.3, 1),
            role: "Expert de soutien",
            health: 100,
            armor: 100,
            alive: true
        }
    ];

    /* =========================================================
       2. ARMES ET ÉQUIPEMENTS
    ========================================================= */

    const WEAPONS = [
        {
            id: "pistol",
            name: "Pistolet tactique",
            damage: 22,
            magazine: 15,
            interval: 320,
            range: 48,
            price: 0,
            description: "Arme secondaire polyvalente."
        },
        {
            id: "rifle",
            name: "Fusil d'assaut",
            damage: 30,
            magazine: 30,
            interval: 170,
            range: 85,
            price: 0,
            description: "Arme principale équilibrée."
        },
        {
            id: "smg",
            name: "Fusil compact",
            damage: 18,
            magazine: 40,
            interval: 105,
            range: 48,
            price: 300,
            description: "Cadence de tir élevée."
        },
        {
            id: "shotgun",
            name: "Fusil à pompe",
            damage: 58,
            magazine: 8,
            interval: 650,
            range: 20,
            price: 500,
            description: "Puissant à courte portée."
        },
        {
            id: "sniper",
            name: "Fusil de précision",
            damage: 90,
            magazine: 5,
            interval: 1100,
            range: 150,
            price: 1000,
            description: "Précision et portée élevées."
        },
        {
            id: "lmg",
            name: "Mitrailleuse légère",
            damage: 24,
            magazine: 60,
            interval: 135,
            range: 95,
            price: 1200,
            description: "Soutien à cadence soutenue."
        }
    ];

    const EQUIPMENT = [
        {
            id: "standard",
            name: "Équipement standard",
            armor: 0,
            health: 0,
            speed: 0,
            price: 0
        },
        {
            id: "armor",
            name: "Gilet pare-balles renforcé",
            armor: 50,
            health: 0,
            speed: -0.3,
            price: 350
        },
        {
            id: "medkit",
            name: "Trousse médicale",
            armor: 0,
            health: 35,
            speed: 0,
            price: 250
        },
        {
            id: "light",
            name: "Équipement léger",
            armor: 10,
            health: 0,
            speed: 1.4,
            price: 300
        },
        {
            id: "heavy",
            name: "Équipement lourd",
            armor: 80,
            health: 0,
            speed: -1,
            price: 650
        }
    ];

    const HELICOPTERS = [
        {
            id: "falcon",
            name: "FALCON — Transport tactique",
            speed: 32,
            health: 100,
            fuel: 100,
            altitude: 0,
            price: 0,
            color: new Color3(0.22, 0.29, 0.25)
        },
        {
            id: "raptor",
            name: "RAPTOR — Soutien aérien",
            speed: 42,
            health: 120,
            fuel: 100,
            altitude: 0,
            price: 900,
            color: new Color3(0.3, 0.22, 0.18)
        },
        {
            id: "titan",
            name: "TITAN — Transport lourd",
            speed: 25,
            health: 180,
            fuel: 140,
            altitude: 0,
            price: 1400,
            color: new Color3(0.18, 0.25, 0.34)
        },
        {
            id: "ghost",
            name: "GHOST — Reconnaissance",
            speed: 48,
            health: 90,
            fuel: 120,
            altitude: 0,
            price: 1800,
            color: new Color3(0.28, 0.3, 0.32)
        },
        {
            id: "guardian",
            name: "GUARDIAN — Escorte",
            speed: 35,
            health: 150,
            fuel: 110,
            altitude: 0,
            price: 2200,
            color: new Color3(0.3, 0.25, 0.12)
        }
    ];

    /* =========================================================
       3. LES 40 MISSIONS
    ========================================================= */

    const MISSION_TITLES = [
        "Premier contact",
        "Sécurisation du périmètre",
        "Reconnaissance avancée",
        "Extraction d'urgence",
        "Neutralisation des menaces",
        "Protection du convoi",
        "Infiltration du secteur",
        "Récupération des renseignements",
        "Défense du point stratégique",
        "Opération nocturne",
        "Recherche des survivants",
        "Sécurisation du dépôt",
        "Interception ennemie",
        "Assistance aux alliés",
        "Reconquête du territoire",
        "Opération haute altitude",
        "Périmètre sous contrôle",
        "Assaut coordonné",
        "Évacuation tactique",
        "Défense avancée",
        "Mission de reconnaissance",
        "Zone de ravitaillement",
        "Opération de sauvetage",
        "Patrouille spéciale",
        "Infiltration du camp",
        "Protection de la base",
        "Poursuite tactique",
        "Récupération stratégique",
        "Assaut sur la colline",
        "Contrôle aérien",
        "Sécurisation des installations",
        "Mission de renfort",
        "Opération de nuit avancée",
        "Défense du secteur central",
        "Évacuation de l'équipe",
        "Reconquête avancée",
        "Opération de soutien",
        "Assaut final préparatoire",
        "Dernière ligne de défense",
        "Opération Elite Strike"
    ];

    const MISSION_DESCRIPTIONS = [
        "Explorez le secteur, identifiez les menaces et sécurisez la zone.",
        "Éliminez les unités hostiles et atteignez le point tactique indiqué.",
        "Coordonnez Ranise et Kerlande pour accomplir les objectifs.",
        "Utilisez votre équipement et vos déplacements pour terminer la mission.",
        "Restez vigilant : les ennemis peuvent riposter."
    ];

    const MISSION_TYPES = [
        "eliminate",
        "reach",
        "interact",
        "survive",
        "eliminate",
        "board",
        "reach",
        "eliminate",
        "interact",
        "survive"
    ];

    function createMission(index) {
        const number = index + 1;
        const type = MISSION_TYPES[index % MISSION_TYPES.length];
        const enemyCount = Math.min(
            4 + Math.floor(index / 3),
            CONFIG.maxEnemies
        );

        const radius = 28 + (index % 5) * 8;

        const objectives = [
            {
                id: "eliminate",
                type: "eliminate",
                text: `Neutraliser ${enemyCount} unités hostiles`,
                required: enemyCount,
                current: 0,
                completed: false
            }
        ];

        if (type === "reach") {
            objectives.push({
                id: "reach",
                type: "reach",
                text: "Atteindre la zone tactique indiquée",
                required: 1,
                current: 0,
                completed: false
            });
        } else if (type === "interact") {
            objectives.push({
                id: "interact",
                type: "interact",
                text: "Interagir avec le point de mission",
                required: 1,
                current: 0,
                completed: false
            });
        } else if (type === "survive") {
            objectives.push({
                id: "survive",
                type: "survive",
                text: `Survivre pendant ${25 + index * 2} secondes`,
                required: 25 + index * 2,
                current: 0,
                completed: false
            });
        } else if (type === "board") {
            objectives.push({
                id: "board",
                type: "board",
                text: "Monter dans un hélicoptère puis revenir au sol",
                required: 1,
                current: 0,
                completed: false
            });
        } else {
            objectives.push({
                id: "reach",
                type: "reach",
                text: "Rejoindre le point d'extraction",
                required: 1,
                current: 0,
                completed: false
            });
        }

        return {
            id: number,
            title: MISSION_TITLES[index],
            description:
                MISSION_DESCRIPTIONS[index % MISSION_DESCRIPTIONS.length],
            enemyCount,
            radius,
            zone: new Vector3(
                ((index * 17) % 100) - 50,
                0,
                ((index * 23) % 100) - 50
            ),
            type,
            objectives,
            reward: 150 + index * 50,
            completed: false
        };
    }

    const MISSIONS = Array.from(
        { length: 40 },
        (_, index) => createMission(index)
    );

    /* =========================================================
       4. OUTILS GÉNÉRAUX
    ========================================================= */

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function random(min, max) {
        return min + Math.random() * (max - min);
    }

    function randomInt(min, max) {
        return Math.floor(random(min, max + 1));
    }

    function distance(a, b) {
        return Vector3.Distance(a, b);
    }

    function formatTime(seconds) {
        const total = Math.max(0, Math.floor(seconds));
        const minutes = String(Math.floor(total / 60)).padStart(2, "0");
        const secs = String(total % 60).padStart(2, "0");
        return `${minutes}:${secs}`;
    }

    function setText(id, value) {
        const element = $(id);
        if (element) element.textContent = String(value);
    }

    function setWidth(id, value) {
        const element = $(id);
        if (element) {
            element.style.width = `${clamp(value, 0, 100)}%`;
        }
    }

    function show(element) {
        if (element) element.classList.remove("hidden");
    }

    function hide(element) {
        if (element) element.classList.add("hidden");
    }

    function toggle(element) {
        if (element) element.classList.toggle("hidden");
    }

    function toast(message, icon = "ℹ") {
        setText("globalToastMessage", message);
        setText("globalToastIcon", icon);
        show(ui.globalToast);

        if (state.toastTimer) clearTimeout(state.toastTimer);

        state.toastTimer = setTimeout(() => {
            hide(ui.globalToast);
        }, 3000);
    }

    function logEvent(message, type = "info") {
        const container = ui.tacticalLogEntries;
        if (!container) return;

        const empty = container.querySelector(".empty-state");
        if (empty) empty.remove();

        const entry = document.createElement("article");
        entry.className = `tactical-log-entry tactical-log-${type}`;

        const time = document.createElement("small");
        time.textContent = new Date().toLocaleTimeString();

        const text = document.createElement("p");
        text.textContent = message;

        entry.append(time, text);
        container.prepend(entry);

        while (container.children.length > 100) {
            container.lastElementChild.remove();
        }
    }

    function notify(message) {
        const stack = ui.notificationStack;
        if (!stack) {
            toast(message);
            return;
        }

        const item = document.createElement("div");
        item.className = "game-notification";
        item.textContent = message;
        stack.prepend(item);

        setTimeout(() => item.remove(), 4500);
    }

    function playTone(frequency = 500, duration = 0.08) {
        if (!state.soundEnabled) return;

        try {
            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) return;

            const context = new AudioContextClass();
            const oscillator = context.createOscillator();
            const gain = context.createGain();

            oscillator.type = "square";
            oscillator.frequency.value = frequency;
            gain.gain.value = 0.025;

            oscillator.connect(gain);
            gain.connect(context.destination);

            oscillator.start();
            gain.gain.exponentialRampToValueAtTime(
                0.001,
                context.currentTime + duration
            );

            oscillator.stop(context.currentTime + duration);

            setTimeout(() => context.close(), duration * 1000 + 100);
        } catch (_) {
            // Le jeu continue même si l'audio n'est pas disponible.
        }
    }

    /* =========================================================
       5. INDEXEDDB
    ========================================================= */

    let databasePromise = null;

    function openDatabase() {
        if (databasePromise) return databasePromise;

        databasePromise = new Promise((resolve, reject) => {
            if (!("indexedDB" in window)) {
                reject(new Error("IndexedDB indisponible"));
                return;
            }

            const request = indexedDB.open(
                CONFIG.database,
                CONFIG.databaseVersion
            );

            request.onupgradeneeded = () => {
                const db = request.result;

                if (!db.objectStoreNames.contains("saves")) {
                    db.createObjectStore("saves", {
                        keyPath: "id"
                    });
                }

                if (!db.objectStoreNames.contains("events")) {
                    db.createObjectStore("events", {
                        autoIncrement: true
                    });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        return databasePromise;
    }

    async function dbSave(data) {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction("saves", "readwrite");
            const store = transaction.objectStore("saves");

            store.put({
                id: CONFIG.saveKey,
                savedAt: new Date().toISOString(),
                data
            });

            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
        });
    }

    async function dbLoad() {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction("saves", "readonly");
            const request = transaction
                .objectStore("saves")
                .get(CONFIG.saveKey);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => reject(request.error);
        });
    }

    async function dbDelete() {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction("saves", "readwrite");

            transaction.objectStore("saves").delete(CONFIG.saveKey);

            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => reject(transaction.error);
        });
    }

    function getSaveData() {
        return {
            version: CONFIG.version,
            missionIndex: state.missionIndex,
            score: state.score,
            kills: state.kills,
            player: {
                health: player.health,
                armor: player.armor,
                ammo: player.ammo,
                reserve: player.reserve,
                weapon: player.weapon,
                position: {
                    x: player.position.x,
                    y: player.position.y,
                    z: player.position.z
                }
            },
            team: teamData.map(member => ({
                id: member.id,
                health: member.health,
                armor: member.armor,
                alive: member.alive
            })),
            selectedEquipment: state.selectedEquipment,
            selectedHelicopter: state.selectedHelicopter,
            missionCompleted: MISSIONS.map(m => m.completed),
            timestamp: Date.now()
        };
    }

    async function saveGame(showMessage = true) {
        try {
            await dbSave(getSaveData());

            setText("lastSaveTime", new Date().toLocaleTimeString());
            setText("saveStorageStatus", "Sauvegarde locale confirmée");

            if (showMessage) toast("Partie sauvegardée avec succès.", "✓");

            logEvent("Progression sauvegardée.", "success");
            return true;
        } catch (error) {
            console.error("Sauvegarde:", error);
            setText("saveStorageStatus", "Stockage indisponible");
            if (showMessage) toast("Impossible de sauvegarder la partie.", "!");
            return false;
        }
    }

    async function loadGame() {
        try {
            const record = await dbLoad();

            if (!record || !record.data) {
                toast("Aucune sauvegarde disponible.");
                return false;
            }

            const data = record.data;

            state.missionIndex = clamp(
                Number(data.missionIndex) || 0,
                0,
                MISSIONS.length - 1
            );

            state.score = Math.max(0, Number(data.score) || 0);
            state.kills = Math.max(0, Number(data.kills) || 0);

            if (data.player) {
                player.health = clamp(Number(data.player.health) || 100, 1, 100);
                player.armor = clamp(Number(data.player.armor) || 100, 0, 100);
                player.ammo = clamp(Number(data.player.ammo) || 30, 0, 60);
                player.reserve = 9999;
                player.weapon = data.player.weapon || "rifle";

                if (data.player.position) {
                    player.position.set(
                        Number(data.player.position.x) || 0,
                        0,
                        Number(data.player.position.z) || 0
                    );
                }
            }

            if (Array.isArray(data.team)) {
                data.team.forEach(saved => {
                    const member = teamData.find(m => m.id === saved.id);
                    if (member) {
                        member.health = clamp(Number(saved.health) || 100, 0, 100);
                        member.armor = clamp(Number(saved.armor) || 100, 0, 100);
                        member.alive = saved.alive !== false && member.health > 0;
                    }
                });
            }

            if (Array.isArray(data.missionCompleted)) {
                data.missionCompleted.forEach((completed, index) => {
                    if (MISSIONS[index]) {
                        MISSIONS[index].completed = Boolean(completed);
                    }
                });
            }

            state.selectedEquipment = data.selectedEquipment || "standard";
            state.selectedHelicopter = data.selectedHelicopter || "falcon";

            toast("Sauvegarde chargée.", "✓");
            return true;
        } catch (error) {
            console.error("Chargement:", error);
            toast("Erreur lors du chargement de la sauvegarde.", "!");
            return false;
        }
    }

    /* =========================================================
       6. MATÉRIAUX BABYLON.JS
    ========================================================= */

    function makeMaterial(name, color, options = {}) {
        const material = new StandardMaterial(name, world.scene);

        material.diffuseColor = color;
        material.specularColor = options.specular ||
            new Color3(0.25, 0.25, 0.25);

        if (options.emissive) {
            material.emissiveColor = options.emissive;
        }

        if (options.alpha !== undefined) {
            material.alpha = options.alpha;
        }

        return material;
    }

    function createMaterials() {
        world.materials.ground = makeMaterial(
            "groundMaterial",
            new Color3(0.24, 0.31, 0.22)
        );

        world.materials.road = makeMaterial(
            "roadMaterial",
            new Color3(0.20, 0.21, 0.19)
        );

        world.materials.roadLine = makeMaterial(
            "roadLineMaterial",
            new Color3(0.72, 0.69, 0.47),
            { emissive: new Color3(0.08, 0.07, 0.02) }
        );

        world.materials.player = makeMaterial(
            "playerMaterial",
            new Color3(0.15, 0.35, 0.22)
        );

        world.materials.allyBlue = makeMaterial(
            "allyBlueMaterial",
            new Color3(0.12, 0.34, 0.75)
        );

        world.materials.allyPurple = makeMaterial(
            "allyPurpleMaterial",
            new Color3(0.42, 0.16, 0.67)
        );

        world.materials.enemy = makeMaterial(
            "enemyMaterial",
            new Color3(0.62, 0.12, 0.09)
        );

        world.materials.enemyAccent = makeMaterial(
            "enemyAccentMaterial",
            new Color3(0.19, 0.06, 0.05)
        );

        world.materials.skin = makeMaterial(
            "skinMaterial",
            new Color3(0.48, 0.31, 0.22)
        );

        world.materials.weapon = makeMaterial(
            "weaponMaterial",
            new Color3(0.09, 0.10, 0.10),
            { specular: new Color3(0.6, 0.6, 0.6) }
        );

        world.materials.building1 = makeMaterial(
            "buildingMaterial1",
            new Color3(0.39, 0.38, 0.31)
        );

        world.materials.building2 = makeMaterial(
            "buildingMaterial2",
            new Color3(0.29, 0.32, 0.29)
        );

        world.materials.roof = makeMaterial(
            "roofMaterial",
            new Color3(0.19, 0.21, 0.19)
        );

        world.materials.tree = makeMaterial(
            "treeMaterial",
            new Color3(0.16, 0.29, 0.16)
        );

        world.materials.trunk = makeMaterial(
            "trunkMaterial",
            new Color3(0.28, 0.19, 0.12)
        );

        world.materials.glass = makeMaterial(
            "glassMaterial",
            new Color3(0.15, 0.37, 0.43),
            {
                alpha: 0.65,
                specular: new Color3(0.8, 0.8, 0.8)
            }
        );

        world.materials.marker = makeMaterial(
            "missionMarkerMaterial",
            new Color3(0.2, 0.9, 0.5),
            {
                emissive: new Color3(0.1, 0.55, 0.2),
                alpha: 0.85
            }
        );

        world.materials.bullet = makeMaterial(
            "bulletMaterial",
            new Color3(1, 0.67, 0.13),
            { emissive: new Color3(1, 0.3, 0.02) }
        );

        world.materials.helicopter = makeMaterial(
            "helicopterMaterial",
            new Color3(0.22, 0.29, 0.25)
        );

        world.materials.helicopterGlass = makeMaterial(
            "helicopterGlass",
            new Color3(0.14, 0.32, 0.38),
            { alpha: 0.75 }
        );
    }

    /* =========================================================
       7. TERRAIN ET ENVIRONNEMENT 3D
    ========================================================= */

    function createGround() {
        const ground = MeshBuilder.CreateGround(
            "battlefieldGround",
            {
                width: CONFIG.worldSize,
                height: CONFIG.worldSize,
                subdivisions: 4
            },
            world.scene
        );

        ground.material = world.materials.ground;
        ground.receiveShadows = true;
        world.ground = ground;

        // Route principale
        const road = MeshBuilder.CreateGround(
            "mainRoad",
            { width: 15, height: CONFIG.worldSize },
            world.scene
        );

        road.position.y = 0.025;
        road.material = world.materials.road;

        const crossRoad = MeshBuilder.CreateGround(
            "crossRoad",
            { width: CONFIG.worldSize, height: 12 },
            world.scene
        );

        crossRoad.position.y = 0.03;
        crossRoad.material = world.materials.road;

        for (let z = -120; z < 125; z += 10) {
            const line = MeshBuilder.CreateBox(
                `roadLine_${z}`,
                { width: 0.22, height: 0.025, depth: 4 },
                world.scene
            );

            line.position.set(0, 0.055, z);
            line.material = world.materials.roadLine;
        }

        createBuildings();
        createTrees();
        createMissionMarker();
    }

    function createBuildings() {
        for (let i = 0; i < 30; i++) {
            let x = random(-115, 115);
            let z = random(-115, 115);

            if (Math.abs(x) < 18 || Math.abs(z) < 15) {
                x += x >= 0 ? 30 : -30;
                z += z >= 0 ? 25 : -25;
            }

            const width = random(7, 15);
            const depth = random(7, 15);
            const height = random(4, 12);

            const building = MeshBuilder.CreateBox(
                `building_${i}`,
                {
                    width,
                    depth,
                    height
                },
                world.scene
            );

            building.position.set(x, height / 2, z);
            building.material =
                i % 2 === 0
                    ? world.materials.building1
                    : world.materials.building2;

            const roof = MeshBuilder.CreateBox(
                `buildingRoof_${i}`,
                {
                    width: width + 0.4,
                    depth: depth + 0.4,
                    height: 0.4
                },
                world.scene
            );

            roof.position.set(x, height + 0.2, z);
            roof.material = world.materials.roof;

            const windowRows = Math.max(1, Math.floor(height / 3));

            for (let row = 0; row < windowRows; row++) {
                for (let side = -1; side <= 1; side += 2) {
                    const windowMesh = MeshBuilder.CreateBox(
                        `window_${i}_${row}_${side}`,
                        {
                            width: 1.1,
                            height: 0.9,
                            depth: 0.08
                        },
                        world.scene
                    );

                    windowMesh.position.set(
                        x + side * (width / 2 + 0.045),
                        1.8 + row * 2.4,
                        z
                    );

                    windowMesh.material = world.materials.glass;
                }
            }

            world.buildings.push(building, roof);
        }
    }

    function createTrees() {
        for (let i = 0; i < 85; i++) {
            const x = random(-130, 130);
            const z = random(-130, 130);

            if (Math.abs(x) < 12 || Math.abs(z) < 10) continue;

            const trunk = MeshBuilder.CreateCylinder(
                `treeTrunk_${i}`,
                {
                    height: random(2.5, 4.2),
                    diameter: 0.7
                },
                world.scene
            );

            trunk.position.set(x, 1.5, z);
            trunk.material = world.materials.trunk;

            const crown = MeshBuilder.CreateSphere(
                `treeCrown_${i}`,
                {
                    diameter: random(3, 5),
                    segments: 6
                },
                world.scene
            );

            crown.position.set(x, random(3.2, 4.5), z);
            crown.material = world.materials.tree;

            world.trees.push(trunk, crown);
        }
    }

    function createMissionMarker() {
        if (world.missionMarker) {
            world.missionMarker.dispose();
        }

        const root = new TransformNode("missionMarkerRoot", world.scene);

        const ring = MeshBuilder.CreateTorus(
            "missionMarkerRing",
            {
                diameter: 5,
                thickness: 0.16,
                tessellation: 32
            },
            world.scene
        );

        ring.parent = root;
        ring.position.y = 0.12;
        ring.material = world.materials.marker;

        const pillar = MeshBuilder.CreateCylinder(
            "missionMarkerPillar",
            {
                height: 4,
                diameterTop: 0.12,
                diameterBottom: 0.65,
                tessellation: 10
            },
            world.scene
        );

        pillar.parent = root;
        pillar.position.y = 2;
        pillar.material = world.materials.marker;

        const light = MeshBuilder.CreateSphere(
            "missionMarkerLight",
            { diameter: 0.8, segments: 10 },
            world.scene
        );

        light.parent = root;
        light.position.y = 4;
        light.material = world.materials.marker;

        root.position.copyFrom(MISSIONS[state.missionIndex].zone);
        world.missionMarker = root;
    }

    /* =========================================================
       8. PERSONNAGES 3D
    ========================================================= */

    function createCharacterMesh(actor) {
        const root = new TransformNode(
            `character_${actor.id}_${Date.now()}_${Math.random()}`,
            world.scene
        );

        const isEnemy = actor.type === "enemy";
        const isPlayer = actor.id === "selvandieu";

        const bodyMaterial = isEnemy
            ? world.materials.enemy
            : actor.id === "ranise"
                ? world.materials.allyBlue
                : actor.id === "kerlande"
                    ? world.materials.allyPurple
                    : world.materials.player;

        function part(name, size, position, material, shape = "box") {
            let mesh;

            if (shape === "sphere") {
                mesh = MeshBuilder.CreateSphere(
                    name,
                    {
                        diameter: size.x,
                        segments: 12
                    },
                    world.scene
                );
            } else if (shape === "cylinder") {
                mesh = MeshBuilder.CreateCylinder(
                    name,
                    {
                        height: size.y,
                        diameter: size.x,
                        tessellation: 12
                    },
                    world.scene
                );
            } else {
                mesh = MeshBuilder.CreateBox(
                    name,
                    {
                        width: size.x,
                        height: size.y,
                        depth: size.z
                    },
                    world.scene
                );
            }

            mesh.parent = root;
            mesh.position.set(position.x, position.y, position.z);
            mesh.material = material;
            mesh.isPickable = false;

            return mesh;
        }

        part(
            "torso",
            new Vector3(0.9, 1.05, 0.5),
            new Vector3(0, 1.55, 0),
            bodyMaterial
        );

        part(
            "head",
            new Vector3(0.52, 0.52, 0.52),
            new Vector3(0, 2.38, 0),
            world.materials.skin,
            "sphere"
        );

        part(
            "helmet",
            new Vector3(0.61, 0.23, 0.61),
            new Vector3(0, 2.63, 0),
            isEnemy ? world.materials.enemyAccent : bodyMaterial,
            "sphere"
        );

        // Jambes
        const legLeft = part(
            "leftLeg",
            new Vector3(0.31, 0.82, 0.36),
            new Vector3(-0.23, 0.65, 0),
            bodyMaterial
        );

        const legRight = part(
            "rightLeg",
            new Vector3(0.31, 0.82, 0.36),
            new Vector3(0.23, 0.65, 0),
            bodyMaterial
        );

        // Bras
        const armLeft = part(
            "leftArm",
            new Vector3(0.28, 0.83, 0.31),
            new Vector3(-0.62, 1.55, 0),
            bodyMaterial
        );

        const armRight = part(
            "rightArm",
            new Vector3(0.28, 0.83, 0.31),
            new Vector3(0.62, 1.55, 0),
            bodyMaterial
        );

        // Arme visible dans les mains
        const weapon = part(
            "heldWeapon",
            new Vector3(0.14, 0.15, 1.0),
            new Vector3(0.38, 1.46, 0.65),
            world.materials.weapon
        );

        weapon.rotation.x = Math.PI / 2;

        // Chargeur
        const magazine = part(
            "weaponMagazine",
            new Vector3(0.09, 0.26, 0.13),
            new Vector3(0.38, 1.29, 0.54),
            world.materials.weapon
        );

        magazine.rotation.x = Math.PI / 2;

        // Petit indicateur de santé pour les alliés et ennemis
        const healthRoot = new TransformNode(
            `healthRoot_${actor.id}_${Math.random()}`,
            world.scene
        );

        const healthBar = MeshBuilder.CreateBox(
            `healthBar_${actor.id}_${Math.random()}`,
            {
                width: 1.25,
                height: 0.1,
                depth: 0.06
            },
            world.scene
        );

        healthBar.parent = healthRoot;
        healthBar.position.y = 3.15;
        healthBar.material = isEnemy
            ? world.materials.enemy
            : world.materials.marker;

        healthRoot.parent = root;
        healthRoot.position.y = 0;

        return {
            root,
            legLeft,
            legRight,
            armLeft,
            armRight,
            weapon,
            healthBar,
            healthRoot,
            animationOffset: Math.random() * 10,
            bodyMaterial
        };
    }

    function createPlayer() {
        player.position.set(0, 0, 0);

        const actor = {
            id: "selvandieu",
            name: "Selvandieu",
            type: "player",
            health: player.health,
            armor: player.armor,
            alive: true,
            position: player.position,
            rotation: 0
        };

        world.player = {
            actor,
            ...createCharacterMesh(actor)
        };

        world.player.root.position.copyFrom(player.position);
    }

    function createAllies() {
        world.allies = [];

        teamData.forEach((member, index) => {
            const actor = {
                id: member.id,
                name: member.name,
                type: "ally",
                health: member.health,
                armor: member.armor,
                alive: member.alive,
                position: new Vector3(index === 0 ? -3 : 3, 0, -4),
                rotation: 0,
                lastShot: 0
            };

            const mesh = createCharacterMesh(actor);
            mesh.root.position.copyFrom(actor.position);

            world.allies.push({
                actor,
                ...mesh
            });
        });
    }

    function spawnEnemies(count) {
        world.enemies.forEach(enemy => {
            if (enemy.root) enemy.root.dispose();
        });

        world.enemies = [];

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + random(-0.3, 0.3);
            const radius = random(28, 52);

            const position = new Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );

            const actor = {
                id: `enemy_${state.missionIndex}_${i}_${Date.now()}`,
                name: `Unité hostile ${i + 1}`,
                type: "enemy",
                health: 100 + Math.floor(state.missionIndex * 2),
                armor: 0,
                alive: true,
                position,
                rotation: 0,
                lastShot: 0,
                lastSeen: 0,
                patrolAngle: angle
            };

            const mesh = createCharacterMesh(actor);
            mesh.root.position.copyFrom(position);

            world.enemies.push({
                actor,
                ...mesh
            });
        }
    }

    /* =========================================================
       9. HÉLICOPTÈRES 3D
    ========================================================= */

    function createHelicopterMesh(vehicle) {
        const root = new TransformNode(
            `helicopterRoot_${vehicle.id}_${Math.random()}`,
            world.scene
        );

        function box(name, size, pos, material) {
            const mesh = MeshBuilder.CreateBox(
                name,
                {
                    width: size.x,
                    height: size.y,
                    depth: size.z
                },
                world.scene
            );

            mesh.parent = root;
            mesh.position.copyFrom(pos);
            mesh.material = material;
            mesh.isPickable = false;

            return mesh;
        }

        function cylinder(name, diameter, height, pos, material) {
            const mesh = MeshBuilder.CreateCylinder(
                name,
                {
                    diameter,
                    height,
                    tessellation: 16
                },
                world.scene
            );

            mesh.parent = root;
            mesh.position.copyFrom(pos);
            mesh.material = material;

            return mesh;
        }

        box(
            "helicopterBody",
            new Vector3(2.4, 1.5, 4.1),
            new Vector3(0, 0, 0),
            world.materials.helicopter
        );

        const nose = MeshBuilder.CreateSphere(
            `helicopterNose_${vehicle.id}`,
            { diameter: 1.7, segments: 12 },
            world.scene
        );

        nose.parent = root;
        nose.position.set(0, 0.05, 2);
        nose.scaling.set(1, 0.72, 1.2);
        nose.material = world.materials.helicopter;

        box(
            "helicopterCockpit",
            new Vector3(1.9, 0.9, 1.2),
            new Vector3(0, 0.38, 1.55),
            world.materials.helicopterGlass
        );

        box(
            "helicopterTail",
            new Vector3(0.4, 0.4, 4.4),
            new Vector3(0, 0.1, -3.5),
            world.materials.helicopter
        );

        box(
            "helicopterTailFin",
            new Vector3(0.35, 1.3, 0.9),
            new Vector3(0, 0.8, -5.3),
            world.materials.helicopter
        );

        const mast = cylinder(
            "rotorMast",
            0.25,
            1.3,
            new Vector3(0, 1.05, 0),
            world.materials.weapon
        );

        const rotorRoot = new TransformNode(
            `mainRotor_${vehicle.id}`,
            world.scene
        );

        rotorRoot.parent = root;
        rotorRoot.position.y = 1.7;

        for (let i = 0; i < 4; i++) {
            const blade = MeshBuilder.CreateBox(
                `rotorBlade_${vehicle.id}_${i}`,
                {
                    width: 0.24,
                    height: 0.08,
                    depth: 7.5
                },
                world.scene
            );

            blade.parent = rotorRoot;
            blade.rotation.y = (Math.PI / 2) * i;
            blade.material = world.materials.weapon;
        }

        const tailRotor = MeshBuilder.CreateBox(
            `tailRotor_${vehicle.id}`,
            {
                width: 0.12,
                height: 1.8,
                depth: 0.18
            },
            world.scene
        );

        tailRotor.parent = root;
        tailRotor.position.set(0.32, 0.8, -5.2);
        tailRotor.material = world.materials.weapon;

        box(
            "leftLandingSkid",
            new Vector3(0.15, 0.15, 3.6),
            new Vector3(-1.15, -0.85, 0),
            world.materials.weapon
        );

        box(
            "rightLandingSkid",
            new Vector3(0.15, 0.15, 3.6),
            new Vector3(1.15, -0.85, 0),
            world.materials.weapon
        );

        return {
            root,
            rotorRoot,
            tailRotor,
            mast
        };
    }

    function createHelicopters() {
        world.helicopters = [];

        HELICOPTERS.forEach((definition, index) => {
            const vehicle = {
                ...definition,
                position: new Vector3(
                    12 + index * 8,
                    0,
                    12 + index * 4
                ),
                velocity: 0,
                verticalVelocity: 0,
                heading: 0,
                landed: true,
                selected: index === 0,
                occupied: false,
                rotorSpeed: 0,
                health: definition.health,
                fuel: definition.fuel,
                altitude: 0,
                targetAltitude: 0,
                targetSpeed: 0
            };

            const mesh = createHelicopterMesh(vehicle);
            mesh.root.position.copyFrom(vehicle.position);

            world.helicopters.push({
                vehicle,
                ...mesh
            });
        });
    }

    function getCurrentHelicopter() {
        return world.helicopters.find(
            item => item.vehicle.id === state.selectedHelicopter
        ) || world.helicopters[0] || null;
    }

    function setSelectedHelicopter(id) {
        const selected = HELICOPTERS.find(item => item.id === id);

        if (!selected) return;

        if (selected.price > state.score) {
            toast(`Il faut ${selected.price} points pour débloquer ce véhicule.`);
            return;
        }

        state.selectedHelicopter = id;

        world.helicopters.forEach(item => {
            item.vehicle.selected = item.vehicle.id === id;
        });

        const heli = getCurrentHelicopter();

        if (heli) {
            setText("currentHelicopterName", heli.vehicle.name);
        }

        renderHelicopterLibrary();
        toast(`Hélicoptère sélectionné : ${selected.name}`, "✓");
    }

    /* =========================================================
       10. INITIALISATION DU MOTEUR 3D
    ========================================================= */

    async function initializeBabylon() {
        if (world.engine) {
            try {
                world.engine.stopRenderLoop();
                world.scene && world.scene.dispose();
                world.engine.dispose();
            } catch (_) {}
        }

        const canvas = ui.gameCanvas;

        if (!canvas) {
            throw new Error("Canvas gameCanvas introuvable.");
        }

        world.canvas = canvas;

        const quality = state.graphicsQuality;
        const antialias = quality !== "low";

        world.engine = new Engine(
            canvas,
            antialias,
            {
                preserveDrawingBuffer: false,
                stencil: true,
                adaptToDeviceRatio: true,
                powerPreference: "high-performance"
            }
        );

        world.scene = new Scene(world.engine);
        world.scene.clearColor = new Color4(0.48, 0.65, 0.75, 1);
        world.scene.ambientColor = new Color3(0.38, 0.38, 0.38);
        world.scene.collisionsEnabled = true;

        const hemi = new HemisphericLight(
            "ambientLight",
            new Vector3(0, 1, 0),
            world.scene
        );

        hemi.intensity = quality === "high" ? 0.9 : 0.75;
        hemi.diffuse = new Color3(0.86, 0.9, 1);
        hemi.groundColor = new Color3(0.25, 0.28, 0.2);

        const sun = new DirectionalLight(
            "sunLight",
            new Vector3(-0.6, -1, 0.45),
            world.scene
        );

        sun.position = new Vector3(50, 90, -40);
        sun.intensity = quality === "high" ? 1.25 : 1.05;

        world.camera = new ArcRotateCamera(
            "followCamera",
            -Math.PI / 2,
            1.08,
            CONFIG.cameraStart,
            Vector3.Zero(),
            world.scene
        );

        world.camera.lowerRadiusLimit = CONFIG.cameraMin;
        world.camera.upperRadiusLimit = CONFIG.cameraMax;
        world.camera.lowerBetaLimit = 0.25;
        world.camera.upperBetaLimit = 1.52;
        world.camera.wheelPrecision = 35;
        world.camera.panningSensibility = 0;
        world.camera.inertia = 0.82;
        world.camera.angularSensibilityX = 650 / state.cameraSensitivity;
        world.camera.angularSensibilityY = 650 / state.cameraSensitivity;
        world.camera.attachControl(canvas, true);

        createMaterials();
        createGround();
        createPlayer();
        createAllies();
        createHelicopters();
        spawnEnemies(MISSIONS[state.missionIndex].enemyCount);

        updateCameraTarget();
        updatePlayerHUD();
        updateMissionUI();

        world.engine.runRenderLoop(() => {
            if (!world.scene || !world.scene.activeCamera) return;

            const now = performance.now();
            const dt = clamp((now - state.lastFrame) / 1000, 0, 0.05);

            state.lastFrame = now;

            if (state.running && !state.paused && !state.gameOver) {
                updateGameLoop(dt, now);
            }

            animateWorld(dt);
            world.scene.render();
        });

        window.addEventListener("resize", () => {
            if (world.engine) world.engine.resize();
        });

        hide(ui.worldLoadingNotice);
        state.initialized = true;
    }

    /* =========================================================
       11. CAMÉRA ET VISIBILITÉ
    ========================================================= */

    function updateCameraTarget() {
        if (!world.camera) return;

        const target = player.isBoarded && state.currentHelicopter
            ? state.currentHelicopter.root.position
            : world.player
                ? world.player.root.position
                : Vector3.Zero();

        world.camera.setTarget(
            new Vector3(target.x, target.y + 1.6, target.z)
        );
    }

    function zoomCamera(direction) {
        if (!world.camera) return;

        world.camera.radius = clamp(
            world.camera.radius + direction,
            CONFIG.cameraMin,
            CONFIG.cameraMax
        );
    }

    function resetCamera() {
        if (!world.camera) return;

        world.camera.radius = CONFIG.cameraStart;
        world.camera.beta = 1.08;
        world.camera.alpha = -Math.PI / 2;
        updateCameraTarget();

        toast("Caméra recentrée.");
    }

    function centerCamera() {
        if (!world.camera || !world.player) return;

        world.camera.setTarget(
            world.player.root.position.add(new Vector3(0, 1.6, 0))
        );

        toast("Caméra recentrée sur Selvandieu.");
    }

    /* =========================================================
       12. MOUVEMENT ET ANIMATION
    ========================================================= */

    function updatePlayerMovement(dt) {
        if (!player.alive || player.isBoarded || !world.player) return;

        let x = state.joystick.x;
        let z = state.joystick.z;

        if (state.keys.has("KeyW") || state.keys.has("ArrowUp")) z += 1;
        if (state.keys.has("KeyS") || state.keys.has("ArrowDown")) z -= 1;
        if (state.keys.has("KeyA") || state.keys.has("ArrowLeft")) x -= 1;
        if (state.keys.has("KeyD") || state.keys.has("ArrowRight")) x += 1;

        const length = Math.hypot(x, z);
        state.moving = length > 0.1;

        if (!state.moving) return;

        x /= length;
        z /= length;

        const cameraAlpha = world.camera ? world.camera.alpha : 0;

        const forward = new Vector3(
            -Math.sin(cameraAlpha),
            0,
            -Math.cos(cameraAlpha)
        );

        const right = new Vector3(
            -forward.z,
            0,
            forward.x
        );

        const direction = forward.scale(z).add(right.scale(x));

        if (direction.lengthSquared() > 0) direction.normalize();

        const sprint =
            state.sprinting ||
            state.keys.has("ShiftLeft") ||
            state.keys.has("ShiftRight");

        const equipment = EQUIPMENT.find(
            item => item.id === state.selectedEquipment
        );

        const speed = (
            sprint ? CONFIG.sprintSpeed : CONFIG.walkSpeed
        ) + (equipment ? equipment.speed : 0);

        player.position.addInPlace(direction.scale(speed * dt));

        player.position.x = clamp(
            player.position.x,
            -CONFIG.worldSize / 2 + 3,
            CONFIG.worldSize / 2 - 3
        );

        player.position.z = clamp(
            player.position.z,
            -CONFIG.worldSize / 2 + 3,
            CONFIG.worldSize / 2 - 3
        );

        if (state.crouching) {
            player.position.y = 0;
        }

        world.player.root.position.copyFrom(player.position);

        player.heading = Math.atan2(direction.x, direction.z);
        world.player.root.rotation.y = player.heading;

        updateCameraTarget();
    }

    function updateJump(dt) {
        if (!player.jumping || !world.player) return;

        player.jumpVelocity -= 18 * dt;
        player.position.y += player.jumpVelocity * dt;

        if (player.position.y <= 0) {
            player.position.y = 0;
            player.jumpVelocity = 0;
            player.jumping = false;
        }

        world.player.root.position.y = player.position.y;
    }

    function animateCharacter(mesh, dt) {
        if (!mesh || !mesh.root) return;

        const moving = mesh.actor
            ? mesh.actor.type === "player"
                ? state.moving
                : mesh.actor.alive
            : false;

        const t = state.time * 8 + mesh.animationOffset;

        if (moving) {
            mesh.legLeft.rotation.x = Math.sin(t) * 0.48;
            mesh.legRight.rotation.x = -Math.sin(t) * 0.48;
            mesh.armLeft.rotation.x = -Math.sin(t) * 0.2;
            mesh.armRight.rotation.x = Math.sin(t) * 0.2;
        } else {
            mesh.legLeft.rotation.x = 0;
            mesh.legRight.rotation.x = 0;
            mesh.armLeft.rotation.x = 0;
            mesh.armRight.rotation.x = 0;
        }

        if (mesh.healthBar) {
            const health = mesh.actor.health || 0;

            mesh.healthBar.scaling.x = Math.max(0.01, health / 100);
            mesh.healthBar.setEnabled(
                mesh.actor.type === "enemy" && mesh.actor.alive
            );
        }
    }

    function animateWorld(dt) {
        state.time += dt;

        world.allies.forEach(mesh => animateCharacter(mesh, dt));
        world.enemies.forEach(mesh => animateCharacter(mesh, dt));

        if (world.player) animateCharacter(world.player, dt);

        world.helicopters.forEach(mesh => {
            const v = mesh.vehicle;

            v.rotorSpeed = v.occupied || v.altitude > 0.2
                ? Math.min(1, v.rotorSpeed + dt * 1.5)
                : Math.max(0.05, v.rotorSpeed - dt);

            mesh.rotorRoot.rotation.y += dt * 35 * v.rotorSpeed;
            mesh.tailRotor.rotation.z += dt * 35 * v.rotorSpeed;

            if (v.occupied) {
                mesh.root.position.copyFrom(v.position);
                mesh.root.position.y = v.altitude;
                mesh.root.rotation.y = v.heading;
            }
        });

        world.effects = world.effects.filter(effect => {
            effect.life -= dt;

            if (effect.life <= 0) {
                effect.mesh.dispose();
                return false;
            }

            if (effect.mesh.material) {
                effect.mesh.material.alpha = clamp(effect.life * 4, 0, 1);
            }

            return true;
        });
    }

    /* =========================================================
       13. TIR ET RECHARGEMENT
    ========================================================= */

    function currentWeapon() {
        return WEAPONS.find(w => w.id === player.weapon) || WEAPONS[1];
    }

    function reloadWeapon(manual = true) {
        if (state.reloading || player.ammo >= currentWeapon().magazine) {
            return;
        }

        state.reloading = true;

        toast("Rechargement en cours…", "↻");
        logEvent("Rechargement de l'arme.", "info");

        const duration = CONFIG.reloadDuration;

        setTimeout(() => {
            player.ammo = currentWeapon().magazine;
            player.reserve = 9999;
            state.reloading = false;

            updatePlayerHUD();

            if (manual) toast("Rechargement terminé.", "✓");
            playTone(700, 0.05);
        }, duration);
    }

    function getNearestEnemy(maxDistance = Infinity) {
        if (!world.player) return null;

        let nearest = null;
        let nearestDistance = maxDistance;

        world.enemies.forEach(enemy => {
            if (!enemy.actor.alive) return;

            const d = distance(
                world.player.root.position,
                enemy.root.position
            );

            if (d < nearestDistance) {
                nearest = enemy;
                nearestDistance = d;
            }
        });

        return nearest;
    }

    function createTracer(start, end) {
        const line = MeshBuilder.CreateLines(
            `tracer_${Date.now()}_${Math.random()}`,
            {
                points: [start.clone(), end.clone()],
                updatable: false
            },
            world.scene
        );

        line.color = new Color3(1, 0.7, 0.2);
        line.isPickable = false;

        world.effects.push({
            mesh: line,
            life: 0.09
        });
    }

    function muzzleEffect(position) {
        const flash = MeshBuilder.CreateSphere(
            `muzzle_${Date.now()}`,
            { diameter: 0.3, segments: 6 },
            world.scene
        );

        flash.position.copyFrom(position);
        flash.material = world.materials.bullet;

        world.effects.push({
            mesh: flash,
            life: 0.08
        });
    }

    function shootPlayer() {
        if (!state.running || state.paused || state.gameOver) return;
        if (!player.alive || player.isBoarded) return;

        if (state.reloading) {
            toast("Patientez pendant le rechargement.");
            return;
        }

        const weapon = currentWeapon();
        const now = performance.now();

        if (now - state.lastShot < weapon.interval) return;
        state.lastShot = now;

        if (player.ammo <= 0) {
            reloadWeapon(false);
            return;
        }

        player.ammo--;

        const origin = world.player.root.position.add(
            new Vector3(0, 1.5, 0)
        );

        let target = getNearestEnemy(weapon.range);

        if (target) {
            const enemyPos = target.root.position.add(
                new Vector3(0, 1.3, 0)
            );

            const direction = enemyPos.subtract(origin).normalize();

            // La visée favorise l'ennemi le plus proche de l'axe de la caméra.
            const cameraDirection = world.camera
                ? world.camera.target.subtract(world.camera.position).normalize()
                : new Vector3(0, 0, 1);

            const dot = Vector3.Dot(direction, cameraDirection);

            if (dot < -0.15 && state.aiming) {
                target = null;
            }
        }

        if (target) {
            const enemyPos = target.root.position.add(
                new Vector3(0, 1.2, 0)
            );

            createTracer(origin, enemyPos);
            muzzleEffect(origin.add(new Vector3(0.35, 0, 0.6)));

            const d = distance(origin, enemyPos);
            const falloff = clamp(1 - d / (weapon.range * 1.5), 0.4, 1);

            damageEnemy(target, Math.round(weapon.damage * falloff));

            playTone(170, 0.035);
        } else {
            const forward = world.camera
                ? world.camera.target.subtract(world.camera.position).normalize()
                : new Vector3(0, 0, 1);

            const end = origin.add(forward.scale(weapon.range));
            createTracer(origin, end);
            muzzleEffect(origin.add(new Vector3(0.35, 0, 0.6)));

            playTone(170, 0.035);
        }

        updatePlayerHUD();

        if (player.ammo <= 0) {
            reloadWeapon(false);
        }
    }

    function damageEnemy(enemy, damage) {
        if (!enemy || !enemy.actor.alive) return;

        enemy.actor.health -= damage;

        if (enemy.actor.health <= 0) {
            enemy.actor.health = 0;
            enemy.actor.alive = false;
            enemy.root.setEnabled(false);

            state.kills++;
            state.missionKills++;
            state.score += 25;
            player.kills++;

            toast(`${enemy.actor.name} neutralisé.`, "✓");
            logEvent(`${enemy.actor.name} neutralisé.`, "success");

            updateKillObjective();
            updatePlayerHUD();
            updateMissionUI();

            playTone(850, 0.07);
        }
    }

    function updateKillObjective() {
        const mission = state.activeMission;
        if (!mission) return;

        const objective = mission.objectives.find(
            item => item.type === "eliminate"
        );

        if (!objective) return;

        objective.current = Math.min(
            objective.required,
            mission.enemyCount -
                world.enemies.filter(e => e.actor.alive).length
        );

        objective.completed = objective.current >= objective.required;

        checkMissionCompletion();
    }

    /* =========================================================
       14. DOMMAGES, SANTÉ ET IA ENNEMIE
    ========================================================= */

    function damagePlayer(amount) {
        if (!player.alive || state.gameOver) return;

        let remaining = amount;

        if (player.armor > 0) {
            const absorbed = Math.min(player.armor, remaining * 0.7);
            player.armor -= absorbed;
            remaining -= absorbed;
        }

        player.health -= remaining;
        player.health = clamp(player.health, 0, 100);
        player.armor = clamp(player.armor, 0, 100);

        updatePlayerHUD();

        if (player.health <= 0) {
            player.alive = false;
            state.missionFailed = true;
            state.gameOver = true;

            showMissionResult(false);
            logEvent("Selvandieu est hors de combat.", "danger");
        }
    }

    function damageAlly(mesh, amount) {
        if (!mesh.actor.alive) return;

        mesh.actor.health -= amount;

        const member = teamData.find(m => m.id === mesh.actor.id);

        if (member) member.health = Math.max(0, mesh.actor.health);

        if (mesh.actor.health <= 0) {
            mesh.actor.health = 0;
            mesh.actor.alive = false;
            mesh.root.setEnabled(false);

            if (member) member.alive = false;

            toast(`${mesh.actor.name} est hors de combat.`, "!");
            logEvent(`${mesh.actor.name} est hors de combat.`, "danger");
        }
    }

    function updateEnemyAI(dt, now) {
        world.enemies.forEach(enemy => {
            const actor = enemy.actor;

            if (!actor.alive) return;

            const target = world.player.root.position;
            const d = distance(actor.position, target);

            if (d < 60) {
                const direction = target.subtract(actor.position);
                direction.y = 0;

                if (direction.lengthSquared() > 0) {
                    direction.normalize();
                    actor.rotation = Math.atan2(direction.x, direction.z);
                    enemy.root.rotation.y = actor.rotation;
                }

                if (d > 10) {
                    actor.position.addInPlace(
                        direction.scale(CONFIG.enemySpeed * dt)
                    );

                    enemy.root.position.copyFrom(actor.position);
                }

                if (
                    d < 40 &&
                    now - actor.lastShot > CONFIG.enemyFireInterval
                ) {
                    actor.lastShot = now;

                    const accuracy = Math.random();

                    if (accuracy < 0.55) {
                        damagePlayer(CONFIG.enemyDamage);
                    }

                    const start = enemy.root.position.add(
                        new Vector3(0, 1.5, 0)
                    );

                    const end = world.player.root.position.add(
                        new Vector3(0, 1.2, 0)
                    );

                    createTracer(start, end);
                }
            } else {
                actor.patrolAngle += dt * 0.25;

                actor.position.x += Math.cos(actor.patrolAngle) * dt * 0.4;
                actor.position.z += Math.sin(actor.patrolAngle) * dt * 0.4;

                enemy.root.position.copyFrom(actor.position);
            }

            actor.position.x = clamp(actor.position.x, -135, 135);
            actor.position.z = clamp(actor.position.z, -135, 135);
        });
    }

    /* =========================================================
       15. ALLIÉS IA : SUIVI ET TIR AUTOMATIQUE
    ========================================================= */

    function updateAllyAI(dt, now) {
        world.allies.forEach((ally, index) => {
            const actor = ally.actor;

            if (!actor.alive) return;

            const playerPosition = player.position;

            const desired = playerPosition.add(
                new Vector3(
                    index === 0 ? -3 : 3,
                    0,
                    -3 - index
                )
            );

            const dPlayer = distance(actor.position, playerPosition);

            if (dPlayer > 5) {
                const direction = desired.subtract(actor.position);
                direction.y = 0;

                if (direction.lengthSquared() > 0) {
                    direction.normalize();

                    actor.position.addInPlace(
                        direction.scale(CONFIG.allySpeed * dt)
                    );

                    actor.rotation = Math.atan2(direction.x, direction.z);
                    ally.root.rotation.y = actor.rotation;
                    ally.root.position.copyFrom(actor.position);
                }
            }

            const target = world.enemies
                .filter(enemy => enemy.actor.alive)
                .map(enemy => ({
                    enemy,
                    distance: distance(actor.position, enemy.actor.position)
                }))
                .filter(item => item.distance < 45)
                .sort((a, b) => a.distance - b.distance)[0];

            if (target && now - actor.lastShot >= CONFIG.allyFireInterval) {
                actor.lastShot = now;

                const enemy = target.enemy;

                const start = ally.root.position.add(
                    new Vector3(0.35, 1.45, 0.5)
                );

                const end = enemy.root.position.add(
                    new Vector3(0, 1.3, 0)
                );

                createTracer(start, end);

                if (Math.random() < 0.72) {
                    damageEnemy(enemy, 18);
                }
            }
        });
    }

    /* =========================================================
       16. HÉLICOPTÈRES : EMBARQUEMENT ET PILOTAGE
    ========================================================= */

    function findNearestHelicopter() {
        return world.helicopters
            .map(mesh => ({
                mesh,
                distance: distance(player.position, mesh.vehicle.position)
            }))
            .sort((a, b) => a.distance - b.distance)[0] || null;
    }

    function boardHelicopter() {
        if (player.isBoarded) {
            toast("Vous êtes déjà dans un hélicoptère.");
            return;
        }

        const nearest = findNearestHelicopter();

        if (
            !nearest ||
            nearest.distance > CONFIG.helicopterBoardDistance ||
            !nearest.mesh.vehicle.landed
        ) {
            toast("Approchez-vous d'un hélicoptère posé au sol.");
            return;
        }

        const heli = nearest.mesh.vehicle;

        state.currentHelicopter = nearest.mesh;
        state.selectedHelicopter = heli.id;
        player.isBoarded = true;
        heli.occupied = true;

        show(ui.helicopterHud);
        show(ui.helicopterFlightControls);

        setText("playerStateBadge", "PILOTE");
        setText("helicopterStatus", "AU SOL");
        setText("currentHelicopterName", heli.name);

        toast(`Vous êtes monté dans ${heli.name}.`, "✓");
        logEvent(`Embarquement dans ${heli.name}.`, "success");

        updatePlayerHUD();
    }

    function exitHelicopter(force = false) {
        if (!player.isBoarded || !state.currentHelicopter) {
            toast("Vous n'êtes dans aucun hélicoptère.");
            return;
        }

        const mesh = state.currentHelicopter;
        const heli = mesh.vehicle;

        if (!heli.landed && !force) {
            toast("Atterrissez avant de quitter l'hélicoptère.");
            return;
        }

        heli.occupied = false;
        player.isBoarded = false;

        player.position.set(
            heli.position.x + 3,
            0,
            heli.position.z
        );

        world.player.root.position.copyFrom(player.position);

        state.currentHelicopter = null;

        hide(ui.helicopterHud);
        hide(ui.helicopterFlightControls);

        setText("playerStateBadge", "AU SOL");

        toast("Vous êtes descendu de l'hélicoptère.");
        logEvent("Débarquement de l'hélicoptère.", "info");

        updatePlayerHUD();
    }

    function helicopterTakeoff() {
        if (!player.isBoarded || !state.currentHelicopter) {
            toast("Montez dans un hélicoptère avant de décoller.");
            return;
        }

        const heli = state.currentHelicopter.vehicle;

        if (!heli.landed) {
            toast("L'hélicoptère est déjà en vol.");
            return;
        }

        heli.landed = false;
        heli.targetAltitude = 12;
        heli.targetSpeed = 10;

        setText("helicopterStatus", "DÉCOLLAGE");
        toast("Décollage engagé.", "↑");
    }

    function helicopterLand() {
        if (!player.isBoarded || !state.currentHelicopter) {
            toast("Vous devez piloter un hélicoptère.");
            return;
        }

        const heli = state.currentHelicopter.vehicle;

        heli.targetAltitude = 0;
        heli.targetSpeed = 0;

        setText("helicopterStatus", "ATTERRISSAGE");
        toast("Procédure d'atterrissage engagée.", "↓");
    }

    function updateHelicopterPhysics(dt) {
        const mesh = state.currentHelicopter;

        if (!player.isBoarded || !mesh) return;

        const heli = mesh.vehicle;

        heli.altitude = Scalar.Lerp(
            heli.altitude,
            heli.targetAltitude,
            clamp(dt * 0.7, 0, 1)
        );

        heli.velocity = Scalar.Lerp(
            heli.velocity,
            heli.targetSpeed,
            clamp(dt * 0.6, 0, 1)
        );

        if (heli.altitude < 0.15 && heli.targetAltitude === 0) {
            heli.altitude = 0;
            heli.landed = true;
            heli.velocity = 0;

            setText("helicopterStatus", "AU SOL");
        } else if (heli.altitude > 0.5) {
            heli.landed = false;

            if (heli.altitude < heli.targetAltitude - 0.3) {
                setText("helicopterStatus", "MONTÉE");
            } else {
                setText("helicopterStatus", "EN VOL");
            }
        }

        const forward = new Vector3(
            Math.sin(heli.heading),
            0,
            Math.cos(heli.heading)
        );

        heli.position.addInPlace(
            forward.scale(heli.velocity * dt)
        );

        heli.position.x = clamp(heli.position.x, -130, 130);
        heli.position.z = clamp(heli.position.z, -130, 130);

        heli.fuel = Math.max(0, heli.fuel - dt * 0.025);

        mesh.root.position.set(
            heli.position.x,
            heli.altitude,
            heli.position.z
        );

        player.position.set(
            heli.position.x,
            heli.altitude,
            heli.position.z
        );

        updateCameraTarget();
        updateHelicopterHUD();

        if (heli.fuel <= 0 && !heli.landed) {
            heli.targetSpeed = 0;
            heli.targetAltitude = Math.max(0, heli.altitude - 3 * dt);
            toast("Carburant épuisé : atterrissez immédiatement.", "!");
        }

        checkBoardMission();
    }

    function helicopterAccelerate() {
        if (!state.currentHelicopter || !player.isBoarded) {
            toast("Vous devez être dans l'hélicoptère.");
            return;
        }

        const heli = state.currentHelicopter.vehicle;

        if (heli.landed) {
            helicopterTakeoff();
            return;
        }

        heli.targetSpeed = clamp(heli.targetSpeed + 5, 0, 50);
    }

    function helicopterBrake() {
        if (!state.currentHelicopter) return;

        const heli = state.currentHelicopter.vehicle;
        heli.targetSpeed = Math.max(0, heli.targetSpeed - 10);
    }

    function helicopterAscend() {
        if (!state.currentHelicopter) return;

        const heli = state.currentHelicopter.vehicle;

        heli.landed = false;
        heli.targetAltitude = clamp(heli.targetAltitude + 5, 0, 80);
    }

    function helicopterDescend() {
        if (!state.currentHelicopter) return;

        const heli = state.currentHelicopter.vehicle;
        heli.targetAltitude = Math.max(0, heli.targetAltitude - 5);
    }

    function helicopterTurn(direction) {
        if (!state.currentHelicopter) return;

        state.currentHelicopter.vehicle.heading += direction * 0.18;
    }

    function helicopterHover() {
        if (!state.currentHelicopter) return;

        const heli = state.currentHelicopter.vehicle;

        heli.targetSpeed = 0;
        heli.targetAltitude = heli.altitude;

        toast("Stabilisation activée.");
    }

    function updateHelicopterHUD() {
        if (!state.currentHelicopter) return;

        const heli = state.currentHelicopter.vehicle;

        setText("helicopterSpeed", Math.round(heli.velocity * 3.6));
        setText("helicopterAltitude", Math.round(heli.altitude * 10));
        setText("helicopterHealth", `${Math.round(heli.health)} %`);
        setText("helicopterFuel", `${Math.round(heli.fuel)} %`);
    }

    function checkBoardMission() {
        const mission = state.activeMission;
        if (!mission) return;

        const objective = mission.objectives.find(
            item => item.type === "board"
        );

        if (!objective) return;

        if (player.isBoarded && !state.currentHelicopter.vehicle.landed) {
            objective.current = 0.5;
        } else if (
            player.isBoarded &&
            state.currentHelicopter.vehicle.landed
        ) {
            objective.current = 1;
            objective.completed = true;
        } else if (objective.current > 0) {
            objective.current = 1;
            objective.completed = true;
        }

        updateMissionUI();
        checkMissionCompletion();
    }

    /* =========================================================
       17. OBJECTIFS DE MISSION
    ========================================================= */

    function startMission(index) {
        if (index < 0 || index >= MISSIONS.length) {
            toast("Toutes les missions sont terminées.", "★");
            return;
        }

        state.missionIndex = index;
        state.activeMission = createMission(index);
        state.missionKills = 0;
        state.missionStart = performance.now();
        state.missionElapsed = 0;
        state.interactionDone = false;
        state.missionCompleted = false;
        state.missionFailed = false;
        state.gameOver = false;
        state.running = true;
        state.paused = false;
        state.reloading = false;

        player.alive = true;
        player.health = Math.max(1, player.health);
        player.armor = Math.max(0, player.armor);
        player.ammo = currentWeapon().magazine;
        player.reserve = 9999;

        if (world.player) {
            world.player.root.setEnabled(true);
            world.player.root.position.copyFrom(player.position);
        }

        teamData.forEach(member => {
            member.health = Math.max(1, member.health);
            member.alive = true;
        });

        if (world.allies.length) {
            world.allies.forEach((mesh, index) => {
                const member = teamData.find(m => m.id === mesh.actor.id);

                if (member) {
                    mesh.actor.health = member.health;
                    mesh.actor.alive = true;
                    mesh.root.setEnabled(true);
                    mesh.root.position.set(
                        player.position.x + (index === 0 ? -3 : 3),
                        0,
                        player.position.z - 4
                    );
                }
            });
        }

        if (world.engine) {
            spawnEnemies(state.activeMission.enemyCount);

            if (world.missionMarker) {
                world.missionMarker.position.copyFrom(
                    state.activeMission.zone
                );
            }
        }

        hide(ui.pauseOverlay);
        hide(ui.missionResultOverlay);
        hide(ui.gameErrorScreen);

        show(ui.gameScreen);
        hide(ui.mainMenu);

        updateMissionUI();
        updatePlayerHUD();
        updateCameraTarget();

        logEvent(
            `Mission ${String(index + 1).padStart(3, "0")} : ${state.activeMission.title}`,
            "success"
        );

        toast(`Mission ${index + 1}/40 : ${state.activeMission.title}`, "▶");
    }

    function restartCurrentMission() {
        startMission(state.missionIndex);
    }

    function nextMission() {
        if (state.missionIndex >= MISSIONS.length - 1) {
            toast("Félicitations ! Les 40 missions sont terminées.", "★");
            return;
        }

        state.score += state.activeMission
            ? state.activeMission.reward
            : 0;

        saveGame(false).finally(() => {
            startMission(state.missionIndex + 1);
        });
    }

    function updateMissionUI() {
        const mission = state.activeMission ||
            MISSIONS[state.missionIndex];

        if (!mission) return;

        setText(
            "missionHeaderLabel",
            `OPÉRATION ${String(state.missionIndex + 1).padStart(3, "0")}/040`
        );

        setText("missionTitle", mission.title.toUpperCase());
        setText("missionDescription", mission.description);
        setText("playerScore", state.score);

        const list = ui.missionObjectives;

        if (list) {
            list.replaceChildren();

            mission.objectives.forEach(objective => {
                const item = document.createElement("li");
                item.className = "objective-item";

                const marker = document.createElement("span");
                marker.className = "objective-marker";

                if (objective.completed) {
                    marker.textContent = "✓";
                    item.classList.add("objective-completed");
                }

                const text = document.createElement("span");

                let progress = "";

                if (objective.type === "eliminate") {
                    progress = ` (${objective.current}/${objective.required})`;
                } else if (objective.type === "survive") {
                    progress = ` (${Math.floor(objective.current)}/${objective.required} s)`;
                } else if (objective.current > 0 && !objective.completed) {
                    progress = " (en cours)";
                }

                text.textContent = objective.text + progress;

                item.append(marker, text);
                list.append(item);
            });
        }

        const completed = mission.objectives.filter(
            objective => objective.completed
        ).length;

        const percent = Math.round(
            (completed / mission.objectives.length) * 100
        );

        setText("missionProgressText", `${percent} %`);
        setWidth("missionProgressBar", percent);
    }

    function checkMissionCompletion() {
        const mission = state.activeMission;

        if (!mission || state.missionCompleted || state.missionFailed) {
            return;
        }

        const allComplete = mission.objectives.every(
            objective => objective.completed
        );

        if (allComplete) {
            mission.completed = true;
            MISSIONS[state.missionIndex].completed = true;

            state.missionCompleted = true;
            state.running = false;

            state.score += mission.reward;

            updateMissionUI();
            showMissionResult(true);

            saveGame(false);

            logEvent(
                `Mission ${state.missionIndex + 1} accomplie : ${mission.title}.`,
                "success"
            );
        }
    }

    function showMissionResult(success) {
        state.running = false;
        state.gameOver = true;

        const mission = state.activeMission;

        setText(
            "missionResultEyebrow",
            success ? "RAPPORT D'OPÉRATION" : "ÉCHEC DE MISSION"
        );

        setText(
            "missionResultTitle",
            success ? "MISSION TERMINÉE" : "MISSION ÉCHOUÉE"
        );

        setText(
            "missionResultDescription",
            success
                ? `Mission ${state.missionIndex + 1}/40 accomplie. Votre équipe a terminé les objectifs disponibles.`
                : "Selvandieu est hors de combat. Vous pouvez recommencer la mission."
        );

        setText(
            "missionResultPoints",
            success && mission ? mission.reward : 0
        );

        setText(
            "missionResultObjectives",
            mission
                ? `${mission.objectives.filter(o => o.completed).length}/${mission.objectives.length}`
                : "0/0"
        );

        setText(
            "missionResultTime",
            formatTime(state.missionElapsed)
        );

        if (state.missionIndex >= MISSIONS.length - 1) {
            setText("nextMissionButton", "CAMPAGNE TERMINÉE");
            ui.nextMissionButton.disabled = true;
        } else {
            setText("nextMissionButton", "MISSION SUIVANTE");
            ui.nextMissionButton.disabled = false;
        }

        show(ui.missionResultOverlay);
    }

    function updateMissionObjectives(dt) {
        const mission = state.activeMission;
        if (!mission) return;

        mission.objectives.forEach(objective => {
            if (objective.completed) return;

            if (objective.type === "reach") {
                const d = distance(
                    player.position,
                    mission.zone
                );

                if (d < 7) {
                    objective.current = 1;
                    objective.completed = true;
                    toast("Zone tactique atteinte.", "✓");
                    logEvent("Zone tactique atteinte.", "success");
                }
            }

            if (objective.type === "interact") {
                if (state.interactionDone) {
                    objective.current = 1;
                    objective.completed = true;
                }
            }

            if (objective.type === "survive") {
                objective.current += dt;

                if (objective.current >= objective.required) {
                    objective.current = objective.required;
                    objective.completed = true;
                    toast("Objectif de survie accompli.", "✓");
                }
            }
        });

        updateMissionUI();
        checkMissionCompletion();
    }

    /* =========================================================
       18. HUD ET MINICARTE
    ========================================================= */

    function updatePlayerHUD() {
        setText("playerHealthText", Math.round(player.health));
        setText("playerArmorText", Math.round(player.armor));

        setWidth("playerHealthBar", player.health);
        setWidth("playerArmorBar", player.armor);

        setText("currentWeaponName", currentWeapon().name);
        setText("currentAmmo", player.ammo);
        setText("reserveAmmo", "∞");

        setText(
            "playerStateBadge",
            player.isBoarded ? "PILOTE" :
                state.crouching ? "ACCROUPI" :
                    state.sprinting ? "SPRINT" : "AU SOL"
        );

        setText("playerScore", state.score);

        const remaining = world.enemies.filter(e => e.actor.alive).length;
        setText("connectionStatus", remaining ? "EN LIGNE" : "ZONE STABLE");

        if (ui.playerCoordinates) {
            ui.playerCoordinates.textContent =
                `X: ${player.position.x.toFixed(1)} | Z: ${player.position.z.toFixed(1)}`;
        }

        updateTargetHUD();
        drawMinimap();
    }

    function updateTargetHUD() {
        const target = getNearestEnemy(100);

        if (!target) {
            hide(ui.targetIndicator);
            return;
        }

        const d = distance(player.position, target.actor.position);

        setText("targetName", target.actor.name);
        setText("targetDistance", `DISTANCE : ${Math.round(d)} m`);

        show(ui.targetIndicator);
    }

    function drawMinimap() {
        const canvas = ui.minimapCanvas;

        if (!canvas || !state.showMinimap) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const scale = width / CONFIG.worldSize;

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = "#17271c";
        ctx.fillRect(0, 0, width, height);

        // Routes
        ctx.fillStyle = "#45483f";
        ctx.fillRect(width / 2 - scale * 7.5, 0, scale * 15, height);
        ctx.fillRect(0, height / 2 - scale * 6, width, scale * 12);

        // Bâtiments simplifiés
        ctx.fillStyle = "#77776a";

        world.buildings.forEach(mesh => {
            if (!mesh || mesh.name.includes("Roof")) return;

            const x = (mesh.position.x + CONFIG.worldSize / 2) * scale;
            const z = (mesh.position.z + CONFIG.worldSize / 2) * scale;

            ctx.fillRect(x - 2, z - 2, 4, 4);
        });

        function mapPoint(position) {
            return {
                x: (position.x + CONFIG.worldSize / 2) * scale,
                y: (position.z + CONFIG.worldSize / 2) * scale
            };
        }

        // Ennemis
        world.enemies.forEach(enemy => {
            if (!enemy.actor.alive) return;

            const p = mapPoint(enemy.actor.position);

            ctx.fillStyle = "#f04444";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Alliés
        world.allies.forEach(ally => {
            if (!ally.actor.alive) return;

            const p = mapPoint(ally.actor.position);

            ctx.fillStyle = "#4ca3ff";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Hélicoptères
        world.helicopters.forEach(mesh => {
            const p = mapPoint(mesh.vehicle.position);

            ctx.fillStyle = "#f4cf58";
            ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        });

        // Objectif
        if (state.activeMission) {
            const p = mapPoint(state.activeMission.zone);

            ctx.strokeStyle = "#37ff8b";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Joueur
        const p = mapPoint(player.position);

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y - 8);
        ctx.stroke();
    }

    /* =========================================================
       19. ARSENAL
    ========================================================= */

    let selectedWeaponId = player.weapon;

    function renderWeaponLibrary() {
        const container = ui.weaponLibraryList;
        if (!container) return;

        container.replaceChildren();

        WEAPONS.forEach(weapon => {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "weapon-card";

            if (weapon.id === selectedWeaponId) {
                card.classList.add("selected");
            }

            const title = document.createElement("strong");
            title.textContent = weapon.name;

            const details = document.createElement("p");
            details.textContent =
                `Dégâts ${weapon.damage} · Chargeur ${weapon.magazine} · Portée ${weapon.range} m`;

            const price = document.createElement("small");
            price.textContent = weapon.price
                ? `${weapon.price} points`
                : "Disponible";

            card.append(title, details, price);

            card.addEventListener("click", () => {
                selectedWeaponId = weapon.id;
                renderWeaponLibrary();
            });

            container.append(card);
        });

        setText("weaponPurchasePoints", state.score);
    }

    function equipSelectedWeapon() {
        const weapon = WEAPONS.find(w => w.id === selectedWeaponId);

        if (!weapon) return;

        if (weapon.price > 0 && player.weapon !== weapon.id) {
            if (state.score < weapon.price) {
                toast(`Il faut ${weapon.price} points pour débloquer cette arme.`);
                return;
            }

            state.score -= weapon.price;
        }

        player.weapon = weapon.id;
        player.ammo = weapon.magazine;
        player.reserve = 9999;
        state.reloading = false;

        updatePlayerHUD();
        renderWeaponLibrary();

        toast(`${weapon.name} équipée.`, "✓");
        logEvent(`Arme équipée : ${weapon.name}.`, "success");
    }

    /* =========================================================
       20. ÉQUIPEMENTS
    ========================================================= */

    let selectedEquipmentId = state.selectedEquipment;

    function renderEquipmentLibrary() {
        const container = ui.equipmentLibraryList;
        if (!container) return;

        container.replaceChildren();

        EQUIPMENT.forEach(item => {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "equipment-card";

            if (item.id === selectedEquipmentId) {
                card.classList.add("selected");
            }

            const title = document.createElement("strong");
            title.textContent = item.name;

            const details = document.createElement("p");
            details.textContent =
                `Armure +${item.armor} · Santé +${item.health} · Vitesse ${item.speed >= 0 ? "+" : ""}${item.speed}`;

            const price = document.createElement("small");
            price.textContent = item.price ? `${item.price} points` : "Gratuit";

            card.append(title, details, price);

            card.addEventListener("click", () => {
                selectedEquipmentId = item.id;
                renderEquipmentLibrary();
            });

            container.append(card);
        });

        setText("equipmentPurchasePoints", state.score);
    }

    function equipSelectedEquipment() {
        const item = EQUIPMENT.find(
            equipment => equipment.id === selectedEquipmentId
        );

        if (!item) return;

        if (item.price > state.score) {
            toast(`Il faut ${item.price} points pour cet équipement.`);
            return;
        }

        if (
            item.id !== state.selectedEquipment &&
            item.price > 0
        ) {
            state.score -= item.price;
        }

        state.selectedEquipment = item.id;

        player.armor = clamp(
            player.armor + item.armor,
            0,
            CONFIG.maxArmor
        );

        player.health = clamp(
            player.health + item.health,
            0,
            CONFIG.maxHealth
        );

        updatePlayerHUD();
        renderEquipmentLibrary();

        toast(`${item.name} appliqué.`, "✓");
    }

    /* =========================================================
       21. BIBLIOTHÈQUE D'HÉLICOPTÈRES
    ========================================================= */

    function renderHelicopterLibrary() {
        const container = ui.helicopterLibraryList;
        if (!container) return;

        container.replaceChildren();

        HELICOPTERS.forEach(heli => {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "helicopter-card";

            if (heli.id === state.selectedHelicopter) {
                card.classList.add("selected");
            }

            const title = document.createElement("strong");
            title.textContent = heli.name;

            const details = document.createElement("p");
            details.textContent =
                `Vitesse ${heli.speed} · Résistance ${heli.health}`;

            const price = document.createElement("small");
            price.textContent = heli.price
                ? `${heli.price} points`
                : "Disponible";

            card.append(title, details, price);

            card.addEventListener("click", () => {
                selectedHelicopterId = heli.id;
                renderHelicopterLibrary();
            });

            container.append(card);
        });
    }

    let selectedHelicopterId = state.selectedHelicopter;

    function confirmHelicopterSelection() {
        setSelectedHelicopter(selectedHelicopterId);
    }

    /* =========================================================
       22. COMMUNICATION TACTIQUE
    ========================================================= */

    const INTERACTIONS = [
        { id: "position1", category: "position", text: "Où es-tu ?", command: "position" },
        { id: "position2", category: "position", text: "Rejoins ma position.", command: "follow" },
        { id: "position3", category: "position", text: "Maintiens ta position.", command: "hold" },
        { id: "position4", category: "position", text: "Avance vers l'objectif.", command: "advance" },
        { id: "position5", category: "position", text: "Recule vers la sécurité.", command: "retreat" },
        { id: "position6", category: "position", text: "Reste près de moi.", command: "stay" },
        { id: "position7", category: "position", text: "Prends position à gauche.", command: "left" },
        { id: "position8", category: "position", text: "Prends position à droite.", command: "right" },
        { id: "position9", category: "position", text: "Couvre mon déplacement.", command: "cover" },
        { id: "position10", category: "position", text: "Signale ta position.", command: "report" },

        { id: "threat1", category: "threat", text: "Repère les ennemis.", command: "spot" },
        { id: "threat2", category: "threat", text: "Attaque les ennemis.", command: "attack" },
        { id: "threat3", category: "threat", text: "Concentre le feu.", command: "focus" },
        { id: "threat4", category: "threat", text: "Protège l'équipe.", command: "protect" },
        { id: "threat5", category: "threat", text: "Élimine la menace proche.", command: "nearest" },
        { id: "threat6", category: "threat", text: "Reste en défense.", command: "defend" },
        { id: "threat7", category: "threat", text: "Surveille les hauteurs.", command: "highground" },
        { id: "threat8", category: "threat", text: "Vérifie les environs.", command: "scan" },
        { id: "threat9", category: "threat", text: "Ne tire pas.", command: "ceasefire" },
        { id: "threat10", category: "threat", text: "Prépare-toi au combat.", command: "ready" },

        { id: "team1", category: "team", text: "État de l'équipe ?", command: "status" },
        { id: "team2", category: "team", text: "Besoin de soutien.", command: "support" },
        { id: "team3", category: "team", text: "Bien reçu.", command: "ack" },
        { id: "team4", category: "team", text: "Restez ensemble.", command: "together" },
        { id: "team5", category: "team", text: "Protégez Ranise.", command: "protectranise" },
        { id: "team6", category: "team", text: "Protégez Kerlande.", command: "protectkerlande" },
        { id: "team7", category: "team", text: "Rassemblement.", command: "regroup" },
        { id: "team8", category: "team", text: "Je suis prêt.", command: "readyteam" },
        { id: "team9", category: "team", text: "Mission en cours.", command: "missionstatus" },
        { id: "team10", category: "team", text: "Bon travail.", command: "goodwork" },

        { id: "heli1", category: "helicopter", text: "Localise un hélicoptère.", command: "findheli" },
        { id: "heli2", category: "helicopter", text: "Prépare l'extraction.", command: "extract" },
        { id: "heli3", category: "helicopter", text: "L'hélicoptère est prêt.", command: "heliready" },
        { id: "heli4", category: "helicopter", text: "Zone d'atterrissage ?", command: "landingzone" },
        { id: "heli5", category: "helicopter", text: "Sécurise la zone d'atterrissage.", command: "securelanding" },
        { id: "heli6", category: "helicopter", text: "Reste au sol.", command: "stayground" },
        { id: "heli7", category: "helicopter", text: "Décollage imminent.", command: "takeoff" },
        { id: "heli8", category: "helicopter", text: "Retour à la base.", command: "returnbase" },
        { id: "heli9", category: "helicopter", text: "Soutien aérien demandé.", command: "airsupport" },
        { id: "heli10", category: "helicopter", text: "Extraction terminée.", command: "extracted" },

        { id: "mission1", category: "mission", text: "Quel est l'objectif ?", command: "objective" },
        { id: "mission2", category: "mission", text: "Avance sur la mission.", command: "missionadvance" },
        { id: "mission3", category: "mission", text: "Sécurise le point.", command: "securepoint" },
        { id: "mission4", category: "mission", text: "Interagis avec l'objectif.", command: "interact" },
        { id: "mission5", category: "mission", text: "Prépare l'extraction.", command: "missionextract" },
        { id: "mission6", category: "mission", text: "Mission presque terminée.", command: "almostdone" },
        { id: "mission7", category: "mission", text: "Vérifie les objectifs.", command: "checkobjectives" },
        { id: "mission8", category: "mission", text: "Reste vigilant.", command: "vigilant" },
        { id: "mission9", category: "mission", text: "Récupère les renseignements.", command: "intel" },
        { id: "mission10", category: "mission", text: "Termine l'opération.", command: "finishmission" }
    ];

    function selectedRecipientName() {
        const recipient = ui.messageRecipientSelect
            ? ui.messageRecipientSelect.value
            : "all";

        if (recipient === "all") return "Toute l'équipe";

        const member = teamData.find(m => m.id === recipient);

        return member ? member.name : "Équipe";
    }

    function selectedSenderName() {
        const sender = ui.messageSenderSelect
            ? ui.messageSenderSelect.value
            : "selvandieu";

        if (sender === "selvandieu") return "Selvandieu";

        const member = teamData.find(m => m.id === sender);

        return member ? member.name : "Système";
    }

    function addChatMessage(sender, text, type = "normal") {
        const container = ui.communicationMessages;
        if (!container) return;

        const article = document.createElement("article");
        article.className = `chat-message chat-message-${type}`;

        const strong = document.createElement("strong");
        strong.textContent = sender;

        const paragraph = document.createElement("p");
        paragraph.textContent = text;

        const time = document.createElement("small");
        time.textContent = new Date().toLocaleTimeString();

        article.append(strong, paragraph, time);
        container.append(article);
        container.scrollTop = container.scrollHeight;

        state.messageCount++;

        if (ui.unreadMessagesBadge) {
            state.unreadMessages++;
            ui.unreadMessagesBadge.textContent = state.unreadMessages;
            show(ui.unreadMessagesBadge);
        }
    }

    function executeInteraction(command, text) {
        switch (command) {
            case "follow":
            case "stay":
            case "regroup":
            case "together":
                world.allies.forEach((ally, index) => {
                    ally.actor.position.set(
                        player.position.x + (index === 0 ? -2 : 2),
                        0,
                        player.position.z - 3
                    );

                    ally.root.position.copyFrom(ally.actor.position);
                });
                break;

            case "attack":
            case "focus":
            case "nearest":
            case "spot":
                world.allies.forEach(ally => {
                    ally.actor.lastShot = 0;
                });
                toast("Ordre d'engagement transmis aux alliés.");
                break;

            case "retreat":
                world.allies.forEach((ally, index) => {
                    ally.actor.position.set(
                        player.position.x + (index === 0 ? -6 : 6),
                        0,
                        player.position.z - 8
                    );
                    ally.root.position.copyFrom(ally.actor.position);
                });
                break;

            case "interact":
            case "securepoint":
            case "intel":
                interactWithObjective();
                break;

            case "takeoff":
                if (player.isBoarded) helicopterTakeoff();
                break;

            case "extract":
            case "missionextract":
                if (player.isBoarded) {
                    helicopterLand();
                } else {
                    toast("Approchez-vous de l'hélicoptère d'extraction.");
                }
                break;

            case "status":
                toast(
                    `Selvandieu ${Math.round(player.health)} HP · ` +
                    `Ranise ${Math.round(teamData[0].health)} HP · ` +
                    `Kerlande ${Math.round(teamData[1].health)} HP`
                );
                break;

            case "objective":
            case "checkobjectives":
                updateMissionUI();
                toast("Objectifs de mission actualisés.");
                break;

            case "finishmission":
            case "missionadvance":
                toast("Accomplissez tous les objectifs avant de continuer.");
                break;

            default:
                toast(`Ordre tactique transmis : ${text}`);
        }

        const sender = selectedSenderName();
        const recipient = selectedRecipientName();

        addChatMessage(sender, `${text} → ${recipient}`, "normal");

        if (recipient === "Toute l'équipe" || recipient !== sender) {
            const responses = [
                "Bien reçu. J'exécute l'ordre.",
                "Compris. Je reste vigilant.",
                "Ordre confirmé.",
                "Je m'en occupe.",
                "Reçu. Je couvre le secteur."
            ];

            setTimeout(() => {
                addChatMessage(
                    recipient === "Toute l'équipe" ? "Ranise" : recipient,
                    responses[randomInt(0, responses.length - 1)],
                    "reply"
                );
            }, 400);
        }

        logEvent(`Communication : ${text}`, "info");
    }

    function renderInteractions() {
        const container = ui.interactionButtons;
        if (!container) return;

        container.replaceChildren();

        const search = state.interactionSearch.toLowerCase();

        const items = INTERACTIONS.filter(item => {
            const categoryMatch =
                state.interactionCategory === "all" ||
                item.category === state.interactionCategory;

            const searchMatch =
                !search ||
                item.text.toLowerCase().includes(search) ||
                item.command.toLowerCase().includes(search);

            return categoryMatch && searchMatch;
        });

        if (!items.length) {
            const empty = document.createElement("p");
            empty.className = "empty-state";
            empty.textContent = "Aucune interaction trouvée.";
            container.append(empty);
            return;
        }

        items.forEach(item => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "interaction-button";
            button.textContent = item.text;

            button.addEventListener("click", () => {
                executeInteraction(item.command, item.text);
            });

            container.append(button);
        });
    }

    function sendCustomMessage(event) {
        event.preventDefault();

        const input = ui.customMessageInput;
        if (!input) return;

        const text = input.value.trim();

        if (!text) {
            toast("Écrivez un message avant de l'envoyer.");
            return;
        }

        addChatMessage(
            selectedSenderName(),
            `${text} → ${selectedRecipientName()}`,
            "normal"
        );

        logEvent(`Message personnalisé envoyé : ${text}`, "info");

        input.value = "";
        toast("Message envoyé.", "✓");
    }

    /* =========================================================
       23. INTERACTIONS DE MISSION
    ========================================================= */

    function interactWithObjective() {
        if (!state.running || state.paused) return;

        const mission = state.activeMission;

        if (!mission) return;

        if (distance(player.position, mission.zone) > 12) {
            toast("Approchez-vous du marqueur vert pour interagir.");
            return;
        }

        state.interactionDone = true;

        const objective = mission.objectives.find(
            item => item.type === "interact"
        );

        if (objective) {
            objective.current = 1;
            objective.completed = true;
        }

        toast("Interaction avec l'objectif réussie.", "✓");
        logEvent("Objectif tactique activé.", "success");

        updateMissionUI();
        checkMissionCompletion();
    }

    function performInteraction() {
        if (player.isBoarded) {
            if (state.currentHelicopter &&
                state.currentHelicopter.vehicle.landed) {
                exitHelicopter();
            } else {
                toast("Atterrissez avant de descendre.");
            }
            return;
        }

        const nearest = findNearestHelicopter();

        if (
            nearest &&
            nearest.distance < CONFIG.helicopterBoardDistance
        ) {
            boardHelicopter();
            return;
        }

        interactWithObjective();
    }

    function meleeAttack() {
        if (!state.running || state.paused || player.isBoarded) return;

        const enemy = getNearestEnemy(3.5);

        if (!enemy) {
            toast("Aucun ennemi à portée de combat rapproché.");
            return;
        }

        damageEnemy(enemy, 45);
        toast("Attaque de combat rapproché.", "✦");
    }

    /* =========================================================
       24. PARAMÈTRES
    ========================================================= */

    function applySettings() {
        state.soundEnabled = Boolean(ui.soundEnabled?.checked);
        state.musicEnabled = Boolean(ui.musicEnabled?.checked);
        state.showCoordinates = Boolean(ui.showCoordinates?.checked);
        state.showMinimap = Boolean(ui.showMinimap?.checked);
        state.autoSaveEnabled = Boolean(ui.autoSaveEnabled?.checked);

        state.graphicsQuality = ui.graphicsQuality?.value || "medium";

        state.cameraSensitivity = Number(
            ui.cameraSensitivity?.value || 5
        );

        if (world.camera) {
            world.camera.angularSensibilityX =
                650 / state.cameraSensitivity;

            world.camera.angularSensibilityY =
                650 / state.cameraSensitivity;
        }

        if (ui.playerCoordinates) {
            ui.playerCoordinates.style.display =
                state.showCoordinates ? "" : "none";
        }

        if (ui.minimapCanvas) {
            ui.minimapCanvas.style.display =
                state.showMinimap ? "" : "none";
        }

        toast("Paramètres appliqués.", "✓");
    }

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                await ui.helicopterGameApp.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (_) {
            toast("Le mode plein écran n'est pas disponible.");
        }
    }

    /* =========================================================
       25. PAUSE, CONFIRMATION ET NAVIGATION
    ========================================================= */

    function pauseGame() {
        if (!state.running) return;

        state.paused = true;
        show(ui.pauseOverlay);
        logEvent("Mission mise en pause.", "info");
    }

    function resumeGame() {
        state.paused = false;
        hide(ui.pauseOverlay);
        state.lastFrame = performance.now();
        toast("Mission reprise.");
    }

    function openConfirmation(title, message, callback) {
        setText("confirmationTitle", title);
        setText("confirmationMessage", message);

        state.pendingConfirmation = callback;

        show(ui.confirmationDialog);
    }

    function closeConfirmation() {
        hide(ui.confirmationDialog);
        state.pendingConfirmation = null;
    }

    function confirmPendingAction() {
        const action = state.pendingConfirmation;

        closeConfirmation();

        if (typeof action === "function") {
            action();
        }
    }

    function returnToMenu() {
        state.running = false;
        state.paused = false;

        hide(ui.gameScreen);
        hide(ui.pauseOverlay);
        hide(ui.missionResultOverlay);
        show(ui.mainMenu);

        saveGame(false);
    }

    /* =========================================================
       26. SYNCHRONISATION
    ========================================================= */

    async function synchronizeGame() {
        setText("syncStatusText", "Vérification des données locales…");

        try {
            // Les missions et interactions sont générées localement.
            // L'application ne dépend pas d'un serveur externe.
            renderInteractions();
            renderWeaponLibrary();
            renderEquipmentLibrary();
            renderHelicopterLibrary();

            setText(
                "syncStatusText",
                `Prêt · ${MISSIONS.length} missions · ${INTERACTIONS.length} interactions`
            );

            if (ui.syncStatusIndicator) {
                ui.syncStatusIndicator.style.backgroundColor = "#3edb8b";
            }

            state.lastSync = Date.now();
            return true;
        } catch (error) {
            console.error("Synchronisation:", error);

            setText("syncStatusText", "Mode local — synchronisation partielle");

            if (ui.syncStatusIndicator) {
                ui.syncStatusIndicator.style.backgroundColor = "#f4bb43";
            }

            return false;
        }
    }

    /* =========================================================
       27. BOUCLE PRINCIPALE
    ========================================================= */

    function updateGameLoop(dt, now) {
        updatePlayerMovement(dt);
        updateJump(dt);

        if (now - world.lastEnemyUpdate > 100) {
            updateEnemyAI(dt, now);
            world.lastEnemyUpdate = now;
        }

        if (now - world.lastAllyUpdate > 100) {
            updateAllyAI(dt, now);
            world.lastAllyUpdate = now;
        }

        updateHelicopterPhysics(dt);
        updateMissionObjectives(dt);

        state.missionElapsed = (now - state.missionStart) / 1000;

        if (now - world.lastMinimapUpdate > 250) {
            updatePlayerHUD();
            world.lastMinimapUpdate = now;
        }

        if (
            state.autoSaveEnabled &&
            now - state.lastAutoSave > CONFIG.autosaveInterval
        ) {
            state.lastAutoSave = now;
            saveGame(false);
        }

        if (Date.now() - state.lastSync > CONFIG.syncInterval) {
            synchronizeGame();
        }
    }

    /* =========================================================
       28. CONTRÔLES TACTILES ET CLAVIER
    ========================================================= */

    function installKeyboardControls() {
        window.addEventListener("keydown", event => {
            state.keys.add(event.code);

            if (
                ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]
                    .includes(event.code)
            ) {
                event.preventDefault();
            }

            if (event.repeat) return;

            switch (event.code) {
                case "Space":
                    if (!player.jumping && !player.isBoarded) {
                        player.jumping = true;
                        player.jumpVelocity = 7;
                    }
                    break;

                case "KeyR":
                    reloadWeapon(true);
                    break;

                case "KeyF":
                    performInteraction();
                    break;

                case "KeyC":
                    state.crouching = !state.crouching;
                    break;

                case "KeyE":
                    performInteraction();
                    break;

                case "KeyQ":
                    meleeAttack();
                    break;

                case "Escape":
                    if (state.running && !state.paused) {
                        pauseGame();
                    } else if (state.paused) {
                        resumeGame();
                    }
                    break;
            }
        });

        window.addEventListener("keyup", event => {
            state.keys.delete(event.code);
        });

        window.addEventListener("blur", () => {
            state.keys.clear();
            state.joystick.x = 0;
            state.joystick.z = 0;
            state.sprinting = false;
        });
    }

    function installJoystick() {
        const joystick = ui.movementJoystick;
        const knob = ui.joystickKnob;

        if (!joystick || !knob) return;

        let activePointer = null;

        function updateFromPointer(event) {
            const rect = joystick.getBoundingClientRect();

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const maxRadius = Math.min(rect.width, rect.height) * 0.32;

            let dx = event.clientX - centerX;
            let dy = event.clientY - centerY;

            const length = Math.hypot(dx, dy);

            if (length > maxRadius) {
                dx = dx / length * maxRadius;
                dy = dy / length * maxRadius;
            }

            state.joystick.x = dx / maxRadius;
            state.joystick.z = -dy / maxRadius;

            knob.style.transform =
                `translate(${dx}px, ${dy}px)`;
        }

        joystick.addEventListener("pointerdown", event => {
            activePointer = event.pointerId;

            try {
                joystick.setPointerCapture(activePointer);
            } catch (_) {}

            updateFromPointer(event);
        });

        joystick.addEventListener("pointermove", event => {
            if (event.pointerId !== activePointer) return;
            updateFromPointer(event);
        });

        function releasePointer(event) {
            if (
                activePointer !== null &&
                event.pointerId !== undefined &&
                event.pointerId !== activePointer
            ) {
                return;
            }

            activePointer = null;
            state.joystick.x = 0;
            state.joystick.z = 0;
            knob.style.transform = "translate(0, 0)";
        }

        joystick.addEventListener("pointerup", releasePointer);
        joystick.addEventListener("pointercancel", releasePointer);
        joystick.addEventListener("lostpointercapture", releasePointer);
    }

    function installCameraTouchControls() {
        const canvas = ui.gameCanvas;
        if (!canvas) return;

        let pointers = new Map();
        let lastX = 0;
        let lastY = 0;
        let lastPinch = 0;

        canvas.addEventListener("pointerdown", event => {
            pointers.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY
            });

            if (pointers.size === 2) {
                const pts = Array.from(pointers.values());

                lastPinch = Math.hypot(
                    pts[0].x - pts[1].x,
                    pts[0].y - pts[1].y
                );
            }

            lastX = event.clientX;
            lastY = event.clientY;
        });

        canvas.addEventListener("pointermove", event => {
            if (!pointers.has(event.pointerId)) return;

            const previous = pointers.get(event.pointerId);

            pointers.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY
            });

            if (pointers.size >= 2) {
                const pts = Array.from(pointers.values());

                const pinch = Math.hypot(
                    pts[0].x - pts[1].x,
                    pts[0].y - pts[1].y
                );

                if (lastPinch > 0 && world.camera) {
                    const difference = lastPinch - pinch;

                    world.camera.radius = clamp(
                        world.camera.radius + difference * 0.035,
                        CONFIG.cameraMin,
                        CONFIG.cameraMax
                    );
                }

                lastPinch = pinch;
                return;
            }

            const dx = event.clientX - previous.x;
            const dy = event.clientY - previous.y;

            if (world.camera) {
                world.camera.alpha -= dx * 0.004;
                world.camera.beta = clamp(
                    world.camera.beta + dy * 0.003,
                    0.25,
                    1.52
                );
            }

            lastX = event.clientX;
            lastY = event.clientY;
        });

        function removePointer(event) {
            pointers.delete(event.pointerId);

            if (pointers.size < 2) {
                lastPinch = 0;
            }
        }

        canvas.addEventListener("pointerup", removePointer);
        canvas.addEventListener("pointercancel", removePointer);
    }

    /* =========================================================
       29. LIAISON DES BOUTONS HTML
    ========================================================= */

    function bind(id, event, callback) {
        const element = $(id);

        if (!element) {
            console.warn(`[FOBAS] Élément HTML manquant : #${id}`);
            return;
        }

        element.addEventListener(event, callback);
    }

    function bindClick(id, callback) {
        bind(id, "click", callback);
    }

    function bindPanel(openId, closeId, panelId) {
        bindClick(openId, () => show($(panelId)));
        bindClick(closeId, () => hide($(panelId)));
    }

    function installButtons() {
        // Menu
        bindClick("startGameButton", async () => {
            if (!state.initialized) {
                show(ui.loadingScreen);

                try {
                    await initializeBabylon();
                } catch (error) {
                    showGameError(error);
                    return;
                }

                hide(ui.loadingScreen);
            }

            startMission(0);
        });

        bindClick("continueGameButton", async () => {
            if (!state.initialized) {
                try {
                    await initializeBabylon();
                } catch (error) {
                    showGameError(error);
                    return;
                }
            }

            const loaded = await loadGame();

            if (loaded) {
                startMission(state.missionIndex);
            } else {
                startMission(0);
            }
        });

        // Navigation principale
        bindClick("backToMenuButton", () => {
            openConfirmation(
                "Retour au menu",
                "Voulez-vous sauvegarder votre progression avant de revenir au menu ?",
                returnToMenu
            );
        });

        bindClick("saveGameButton", () => saveGame(true));
        bindClick("pauseGameButton", pauseGame);
        bindClick("resumeGameButton", resumeGame);
        bindClick("pauseSaveButton", () => saveGame(true));

        bindClick("pauseSettingsButton", () => {
            hide(ui.pauseOverlay);
            show(ui.settingsPanel);
        });

        bindClick("pauseReturnMenuButton", returnToMenu);
        bindClick("resultReturnMenuButton", returnToMenu);

        // Mission
        bindClick("toggleMissionPanelButton", () => {
            const panel = ui.missionPanel;
            if (!panel) return;

            panel.classList.toggle("mission-panel-collapsed");
        });

        bindClick("nextMissionButton", nextMission);
        bindClick("retryMissionButton", restartCurrentMission);

        // Carte
        bindClick("toggleMapButton", () => {
            toggle(ui.minimapCanvas);
        });

        bindClick("centerCameraButton", centerCamera);

        // Caméra
        bindClick("zoomInButton", () => zoomCamera(-2));
        bindClick("zoomOutButton", () => zoomCamera(2));
        bindClick("resetCameraButton", resetCamera);

        // Contrôles du joueur
        bindClick("shootButton", shootPlayer);
        bindClick("aimButton", () => {
            state.aiming = !state.aiming;
            ui.aimButton?.classList.toggle("active", state.aiming);

            if (world.camera) {
                world.camera.radius = state.aiming
                    ? CONFIG.cameraMin
                    : CONFIG.cameraStart;
            }

            toast(state.aiming ? "Visée activée." : "Visée désactivée.");
        });

        bindClick("reloadButton", () => reloadWeapon(true));

        bindClick("jumpButton", () => {
            if (!player.jumping && !player.isBoarded) {
                player.jumping = true;
                player.jumpVelocity = 7;
            }
        });

        bindClick("crouchButton", () => {
            state.crouching = !state.crouching;
            ui.crouchButton?.classList.toggle("active", state.crouching);
            toast(state.crouching ? "Position accroupie." : "Position debout.");
        });

        bindClick("sprintButton", () => {
            state.sprinting = !state.sprinting;
            ui.sprintButton?.classList.toggle("active", state.sprinting);
            toast(state.sprinting ? "Sprint activé." : "Sprint désactivé.");
        });

        bindClick("meleeButton", meleeAttack);
        bindClick("interactButton", performInteraction);

        // Bibliothèques
        bindPanel(
            "openWeaponLibraryButton",
            "closeWeaponLibraryButton",
            "weaponLibraryPanel"
        );

        bindPanel(
            "openEquipmentButton",
            "closeEquipmentButton",
            "equipmentPanel"
        );

        bindPanel(
            "openHelicopterLibraryButton",
            "closeHelicopterLibraryButton",
            "helicopterLibraryPanel"
        );

        bindClick("confirmWeaponButton", equipSelectedWeapon);
        bindClick("confirmEquipmentButton", equipSelectedEquipment);
        bindClick("selectHelicopterButton", confirmHelicopterSelection);
        bindClick("boardHelicopterButton", boardHelicopter);
        bindClick("exitHelicopterButton", () => exitHelicopter());
        bindClick("helicopterExitButton", () => exitHelicopter());

        // Vol
        bindClick("helicopterTakeoffButton", helicopterTakeoff);
        bindClick("helicopterLandButton", helicopterLand);
        bindClick("helicopterAccelerateButton", helicopterAccelerate);
        bindClick("helicopterBrakeButton", helicopterBrake);
        bindClick("helicopterAscendButton", helicopterAscend);
        bindClick("helicopterDescendButton", helicopterDescend);
        bindClick("helicopterTurnLeftButton", () => helicopterTurn(-1));
        bindClick("helicopterTurnRightButton", () => helicopterTurn(1));
        bindClick("helicopterHoverButton", helicopterHover);

        bindClick("closeFlightControlsButton", () => {
            if (!player.isBoarded) {
                hide(ui.helicopterFlightControls);
            } else {
                toast("Les commandes de vol restent disponibles pendant le pilotage.");
            }
        });

        // Communication
        bindPanel(
            "openCommunicationButton",
            "closeCommunicationButton",
            "communicationPanel"
        );

        bindClick("selectSelvandieuButton", () => {
            state.selectedExpert = "selvandieu";
            if (ui.messageSenderSelect) {
                ui.messageSenderSelect.value = "selvandieu";
            }
        });

        bindClick("selectRaniseButton", () => {
            state.selectedExpert = "ranise";
            if (ui.messageSenderSelect) {
                ui.messageSenderSelect.value = "ranise";
            }
        });

        bindClick("selectKerlandeButton", () => {
            state.selectedExpert = "kerlande";
            if (ui.messageSenderSelect) {
                ui.messageSenderSelect.value = "kerlande";
            }
        });

        bind("customMessageForm", "submit", sendCustomMessage);

        bind("interactionSearchInput", "input", event => {
            state.interactionSearch = event.target.value || "";
            renderInteractions();
        });

        document.querySelectorAll("[data-interaction-category]")
            .forEach(button => {
                button.addEventListener("click", () => {
                    state.interactionCategory =
                        button.dataset.interactionCategory;

                    document.querySelectorAll("[data-interaction-category]")
                        .forEach(tab => tab.classList.remove("active"));

                    button.classList.add("active");

                    renderInteractions();
                });
            });

        // Journal
        bindPanel(
            "openTacticalLogButton",
            "closeTacticalLogButton",
            "tacticalLogPanel"
        );

        bindClick("clearTacticalLogButton", () => {
            if (ui.tacticalLogEntries) {
                ui.tacticalLogEntries.replaceChildren();

                const empty = document.createElement("p");
                empty.className = "empty-state";
                empty.textContent = "Aucun événement enregistré.";

                ui.tacticalLogEntries.append(empty);
            }

            toast("Journal tactique effacé.");
        });

        // Paramètres
        bindPanel(
            "openSettingsButton",
            "closeSettingsButton",
            "settingsPanel"
        );

        bindClick("applySettingsButton", applySettings);
        bindClick("fullscreenButton", toggleFullscreen);

        // Sauvegarde
        bindClick("closeSaveManagementButton", () => {
            hide(ui.saveManagementPanel);
        });

        bindClick("saveNowButton", () => saveGame(true));
        bindClick("loadSavedGameButton", async () => {
            const loaded = await loadGame();

            if (loaded) {
                startMission(state.missionIndex);
            }
        });

        bindClick("resetGameButton", () => {
            openConfirmation(
                "Réinitialiser la partie",
                "Cette action supprimera la sauvegarde locale et réinitialisera votre progression. Continuer ?",
                async () => {
                    await dbDelete();

                    state.score = 0;
                    state.kills = 0;
                    state.missionIndex = 0;

                    player.health = 100;
                    player.armor = 100;
                    player.ammo = 30;
                    player.weapon = "rifle";

                    MISSIONS.forEach(mission => {
                        mission.completed = false;
                    });

                    toast("Progression réinitialisée.", "✓");
                    returnToMenu();
                }
            );
        });

        // Synchronisation
        bindClick("syncNowButton", synchronizeGame);

        // Dialogues
        bindClick("confirmActionButton", confirmPendingAction);
        bindClick("cancelActionButton", closeConfirmation);

        // Erreur moteur
        bindClick("retryGameInitializationButton", async () => {
            hide(ui.gameErrorScreen);

            try {
                await initializeBabylon();
                startMission(state.missionIndex);
            } catch (error) {
                showGameError(error);
            }
        });

        bindClick("errorReturnMenuButton", () => {
            hide(ui.gameErrorScreen);
            show(ui.mainMenu);
            hide(ui.gameScreen);
        });
    }

    /* =========================================================
       30. GESTION DES ERREURS
    ========================================================= */

    function showGameError(error) {
        console.error("[FOBAS ELITE STRIKE 3D]", error);

        hide(ui.loadingScreen);
        show(ui.gameErrorScreen);

        setText(
            "gameErrorMessage",
            error && error.message
                ? error.message
                : "Une erreur inconnue empêche l'initialisation du moteur 3D."
        );
    }

    window.addEventListener("error", event => {
        console.error("[FOBAS JS]", event.error || event.message);
    });

    window.addEventListener("unhandledrejection", event => {
        console.error("[FOBAS Promise]", event.reason);
    });

    /* =========================================================
       31. INITIALISATION DE L'INTERFACE
    ========================================================= */

    function updateLoading(percent, message) {
        if (ui.loadingProgressBar) {
            ui.loadingProgressBar.style.width = `${percent}%`;
        }

        setText("loadingProgressText", `${message} ${percent} %`);
        setText("loadingMessage", message);
    }

    async function boot() {
        try {
            updateLoading(15, "Préparation du système…");

            installButtons();
            installKeyboardControls();
            installJoystick();
            installCameraTouchControls();

            updateLoading(30, "Initialisation des données locales…");

            try {
                await openDatabase();

                setText(
                    "saveStorageStatus",
                    "IndexedDB disponible"
                );
            } catch (error) {
                console.warn("IndexedDB non disponible :", error);

                setText(
                    "saveStorageStatus",
                    "Mode sans sauvegarde persistante"
                );
            }

            updateLoading(50, "Chargement des missions…");

            renderWeaponLibrary();
            renderEquipmentLibrary();
            renderHelicopterLibrary();
            renderInteractions();

            await synchronizeGame();

            updateLoading(70, "Préparation de l'interface…");

            const saved = await dbLoad().catch(() => null);

            if (saved && saved.data) {
                setText("continueGameButton", "CONTINUER LA PARTIE");
                setText("saveStorageStatus", "Sauvegarde détectée");
            } else {
                if (ui.continueGameButton) {
                    ui.continueGameButton.disabled = false;
                }
            }

            updateLoading(100, "Système prêt…");

            setTimeout(() => {
                hide(ui.loadingScreen);
                show(ui.mainMenu);
            }, 250);

            state.initialized = false;

            logEvent(
                "Système FOBAS ELITE STRIKE 3D initialisé.",
                "success"
            );
        } catch (error) {
            showGameError(error);
        }
    }

    /* =========================================================
       32. API PUBLIQUE DU JEU
       Utile pour le débogage et les extensions futures.
    ========================================================= */

    window.FOBAS_ELITE_STRIKE = {
        version: CONFIG.version,

        getState() {
            return {
                missionIndex: state.missionIndex,
                score: state.score,
                kills: state.kills,
                running: state.running,
                paused: state.paused,
                playerHealth: player.health,
                playerArmor: player.armor,
                playerAmmo: player.ammo,
                remainingEnemies: world.enemies.filter(
                    enemy => enemy.actor.alive
                ).length
            };
        },

        startMission,
        nextMission,
        restartCurrentMission,
        saveGame,
        loadGame,
        pauseGame,
        resumeGame,
        shootPlayer,
        reloadWeapon,
        boardHelicopter,
        exitHelicopter,
        helicopterTakeoff,
        helicopterLand,
        synchronizeGame,

        getMissions() {
            return MISSIONS.map(mission => ({
                id: mission.id,
                title: mission.title,
                completed: mission.completed
            }));
        }
    };

    /* =========================================================
       33. DÉMARRAGE
    ========================================================= */

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, {
            once: true
        });
    } else {
        boot();
    }

})();















