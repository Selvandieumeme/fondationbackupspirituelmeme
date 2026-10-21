
/* ============================================================
   NINA JUMPER 3D
   Fichye prensipal : appjumperfobas.js
   Konpatibilite : appjumperfobas.html
   Moteur 3D : PlayCanvas 2.14.4
   50 misyon dinamik, kontwòl Android, zoom, pinch,
   sove/restore, meni, paramèt ak rekòmansman.
============================================================ */

"use strict";

(async function NINA_JUMPER_3D() {
    const $ = id => document.getElementById(id);
    const $$ = selector => [...document.querySelectorAll(selector)];

    const STORAGE_KEY = "ninaJumper3D_save_v1";
    const SETTINGS_KEY = "ninaJumper3D_settings_v1";
    const TOTAL_MISSIONS = 50;

    const ui = {
        loading: $("loadingScreen"),
        loadingMessage: $("loadingMessage"),
        loadingProgress: $("loadingProgress"),
        loadingPercent: $("loadingPercent"),
        gameScreen: $("gameScreen"),
        canvas: $("jumperCanvas"),
        start: $("startPanel"),
        pause: $("pausePanel"),
        complete: $("missionCompletePanel"),
        gameOver: $("gameOverPanel"),
        missions: $("missionsPanel"),
        missionList: $("missionsList"),
        sideMenu: $("sideMenu"),
        notification: $("gameNotification")
    };

    const state = {
        engineReady: false,
        running: false,
        paused: false,
        gameOver: false,
        completed: false,
        initialized: false,
        score: 0,
        coins: 0,
        lives: 3,
        best: 0,
        mission: 1,
        selectedMission: 1,
        completedMissions: [],
        unlockedMission: 1,
        distance: 0,
        speed: 8,
        lane: 0,
        laneTarget: 0,
        jumpY: 0,
        jumpVelocity: 0,
        jumping: false,
        sliding: false,
        slideUntil: 0,
        invulnerableUntil: 0,
        spawnDistance: 0,
        elapsed: 0,
        cameraZoom: 1,
        cameraAngle: 0,
        soundEnabled: true,
        vibrationEnabled: true,
        quality: "medium",
        sensitivity: 5,
        volume: 60,
        filter: "all",
        confirmAction: null,
        lastFrame: 0,
        animationFrame: 0,
        entities: [],
        obstacles: [],
        collectibles: [],
        tracks: [],
        app: null,
        pc: null,
        player: null,
        camera: null,
        cameraPivot: null,
        materials: {},
        audioContext: null,
        scoreAtStart: 0,
        coinsAtStart: 0,
        livesAtStart: 3
    };

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const random = (min, max) => min + Math.random() * (max - min);

    function safeText(id, value) {
        const element = $(id);
        if (element) element.textContent = String(value);
    }

    function show(element, visible) {
        if (!element) return;
        element.classList.toggle("hidden", !visible);
        element.setAttribute("aria-hidden", visible ? "false" : "true");
    }

    function notify(message, duration = 2200) {
        if (!ui.notification) return;
        ui.notification.textContent = message;
        ui.notification.classList.add("visible");
        ui.notification.style.display = "block";

        clearTimeout(notify.timer);
        notify.timer = setTimeout(() => {
            if (!ui.notification) return;
            ui.notification.classList.remove("visible");
            ui.notification.style.display = "";
        }, duration);
    }

    function setLoading(percent, message) {
        if (ui.loadingProgress) {
            ui.loadingProgress.style.width = clamp(percent, 0, 100) + "%";
        }
        safeText("loadingPercent", Math.round(clamp(percent, 0, 100)) + " %");
        safeText("loadingMessage", message);
    }

    function hideLoading() {
        if (!ui.loading) return;
        ui.loading.style.display = "none";
        ui.loading.setAttribute("aria-hidden", "true");
    }

    function showFatalError(error) {
        console.error("[NINA JUMPER 3D]", error);

        hideLoading();
        show(ui.start, true);

        const status = $("saveStatus");
        if (status) {
            status.textContent =
                "Le moteur 3D n'a pas pu se charger. Vérifiez Internet et rechargez la page.";
        }

        notify("Chargement 3D impossible. L'interface reste accessible.", 5000);
    }

    /* --------------------------------------------------------
       LES 50 MISSIONS
    -------------------------------------------------------- */

    const missionNames = [
        "Le premier saut", "Les pièces perdues", "La piste rapide",
        "Les premiers obstacles", "Le pont suspendu", "Course de précision",
        "La vallée des pièces", "Les barrières basses", "Le chemin étroit",
        "Le sprint de Nina", "La zone dangereuse", "La série dorée",
        "Les obstacles doubles", "La course nocturne", "Le grand fossé",
        "La route sinueuse", "Les pièces rares", "Le saut parfait",
        "Le parcours rapide", "La forêt mystérieuse", "La piste technique",
        "La pluie d'obstacles", "Les trois voies", "Le tunnel secret",
        "La course du courage", "Le défi des pièces", "La grande montée",
        "Les obstacles mobiles", "Le parcours expert", "Le pont des étoiles",
        "La course extrême", "Le chemin des trésors", "Le saut impossible",
        "La piste infernale", "La chasse aux pièces", "Le couloir dangereux",
        "Le défi du champion", "La course éclair", "Les trois récompenses",
        "La route légendaire", "Le temple perdu", "Le défi de Nina",
        "La grande traversée", "Le sprint ultime", "La route des champions",
        "Le labyrinthe", "La dernière ligne droite", "Le parcours légendaire",
        "Le défi final", "La légende de Nina"
    ];

    const missions = Array.from({ length: TOTAL_MISSIONS }, (_, index) => {
        const number = index + 1;
        return {
            id: number,
            name: missionNames[index],
            targetCoins: 3 + Math.floor(index * 0.65),
            targetDistance: 100 + index * 35,
            targetScore: 100 + index * 90,
            speed: Math.min(8 + index * 0.12, 15),
            description:
                "Parcourez " + (100 + index * 35) +
                " m et ramassez " + (3 + Math.floor(index * 0.65)) +
                " pièces."
        };
    });

    function getMission() {
        return missions[clamp(state.mission, 1, TOTAL_MISSIONS) - 1];
    }

    /* --------------------------------------------------------
       SAUVEGARDE ROBUSTE
    -------------------------------------------------------- */

    function readJSON(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            console.warn("Lecture du stockage impossible :", error);
            return fallback;
        }
    }

    function saveGame(silent = false) {
        const data = {
            version: 1,
            mission: state.mission,
            selectedMission: state.selectedMission,
            unlockedMission: state.unlockedMission,
            completedMissions: state.completedMissions,
            score: state.score,
            coins: state.coins,
            best: state.best,
            lives: state.lives,
            savedAt: new Date().toISOString()
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            safeText("saveStatus", "Progression sauvegardée sur cet appareil.");
            safeText("databaseStatus", "Base de données : sauvegarde locale disponible.");
            safeText("systemMessage", "Sauvegarde effectuée avec succès.");

            if (!silent) notify("Progression sauvegardée !");
            updateHUD();
            return true;
        } catch (error) {
            console.error("Sauvegarde impossible :", error);
            safeText("systemMessage", "Sauvegarde impossible : stockage indisponible.");
            if (!silent) notify("Impossible de sauvegarder les données.");
            return false;
        }
    }

    function loadGame() {
        const data = readJSON(STORAGE_KEY, null);

        if (!data || typeof data !== "object") {
            safeText("saveStatus", "Nouvelle partie disponible.");
            return;
        }

        state.mission = clamp(Number(data.mission) || 1, 1, TOTAL_MISSIONS);
        state.selectedMission = clamp(
            Number(data.selectedMission) || state.mission,
            1,
            TOTAL_MISSIONS
        );
        state.unlockedMission = clamp(
            Number(data.unlockedMission) || state.mission,
            1,
            TOTAL_MISSIONS
        );

        state.completedMissions = Array.isArray(data.completedMissions)
            ? data.completedMissions
                .map(Number)
                .filter(n => Number.isInteger(n) && n >= 1 && n <= TOTAL_MISSIONS)
            : [];

        state.score = Math.max(0, Number(data.score) || 0);
        state.coins = Math.max(0, Number(data.coins) || 0);
        state.best = Math.max(0, Number(data.best) || 0);
        state.lives = clamp(Number(data.lives) || 3, 1, 3);

        safeText("saveStatus", "Sauvegarde locale détectée.");
    }

    function loadSettings() {
        const data = readJSON(SETTINGS_KEY, {});

        state.quality = ["low", "medium", "high"].includes(data.quality)
            ? data.quality : "medium";
        state.sensitivity = clamp(Number(data.sensitivity) || 5, 1, 10);
        state.volume = clamp(Number(data.volume ?? 60), 0, 100);
        state.soundEnabled = data.soundEnabled !== false;
        state.vibrationEnabled = data.vibrationEnabled !== false;

        if ($("qualitySelect")) $("qualitySelect").value = state.quality;
        if ($("sensitivityRange")) $("sensitivityRange").value = state.sensitivity;
        if ($("volumeRange")) $("volumeRange").value = state.volume;
        if ($("soundEnabled")) $("soundEnabled").checked = state.soundEnabled;
        if ($("vibrationEnabled")) $("vibrationEnabled").checked = state.vibrationEnabled;

        updateSettingsLabels();
    }

    function updateSettingsLabels() {
        safeText("sensitivityValue", state.sensitivity);
        safeText("volumeValue", state.volume + " %");
    }

    function applySettings() {
        state.quality = $("qualitySelect")?.value || "medium";
        state.sensitivity = clamp(Number($("sensitivityRange")?.value) || 5, 1, 10);
        state.volume = clamp(Number($("volumeRange")?.value) || 0, 0, 100);
        state.soundEnabled = $("soundEnabled")?.checked !== false;
        state.vibrationEnabled = $("vibrationEnabled")?.checked !== false;

        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify({
                quality: state.quality,
                sensitivity: state.sensitivity,
                volume: state.volume,
                soundEnabled: state.soundEnabled,
                vibrationEnabled: state.vibrationEnabled
            }));
        } catch (error) {
            console.warn("Paramètres non sauvegardés :", error);
        }

        updateSettingsLabels();
        applyQuality();
        notify("Paramètres appliqués.");
        show($("settingsPanel"), false);
    }

    /* --------------------------------------------------------
       INTERFACE ET HUD
    -------------------------------------------------------- */

    function updateHUD() {
        const mission = getMission();

        safeText("currentMission",
            String(state.mission).padStart(2, "0") + " / " + TOTAL_MISSIONS);
        safeText("scoreValue", Math.floor(state.score));
        safeText("coinsValue", state.coins);
        safeText("livesValue", "❤ ".repeat(Math.max(0, state.lives)).trim() || "—");
        safeText("missionName", mission.name);
        safeText("objectiveText", mission.description);
        safeText("inventoryCoins", state.coins);

        const progress = clamp(
            Math.round(state.distance / mission.targetDistance * 100),
            0,
            100
        );

        safeText("missionProgressText", progress + " %");

        if ($("missionProgressBar")) {
            $("missionProgressBar").style.width = progress + "%";
        }
        if ($("missionProgressTrack")) {
            $("missionProgressTrack").setAttribute("aria-valuenow", progress);
        }

        safeText("missionsSummary",
            state.completedMissions.length + " / " + TOTAL_MISSIONS +
            " missions terminées.");

        safeText("gameOverScore", Math.floor(state.score));
        safeText("gameOverBest", Math.floor(state.best));
    }

    function renderMissions() {
        const list = ui.missionList;
        if (!list) return;

        list.replaceChildren();

        missions.forEach(mission => {
            const completed = state.completedMissions.includes(mission.id);
            const available = mission.id <= state.unlockedMission;
            if (state.filter === "available" && (!available || completed)) return;
            if (state.filter === "completed" && !completed) return;

            const item = document.createElement("button");
            item.type = "button";
            item.className = "mission-item";
            item.dataset.missionId = String(mission.id);
            item.style.width = "100%";
            item.style.textAlign = "left";
            item.style.padding = "12px";
            item.style.marginBottom = "7px";
            item.style.borderRadius = "10px";
            item.style.border = mission.id === state.selectedMission
                ? "2px solid #55d9ff"
                : "1px solid rgba(255,255,255,.16)";
            item.style.background = completed
                ? "rgba(38,180,120,.16)"
                : "rgba(255,255,255,.05)";
            item.style.color = "inherit";
            item.style.opacity = available ? "1" : ".48";

            const status = completed ? "✓ Terminée"
                : available ? "▶ Disponible" : "🔒 Verrouillée";

            item.textContent =
                String(mission.id).padStart(2, "0") + " — " +
                mission.name + " | " + status;

            item.disabled = !available;
            item.addEventListener("click", () => {
                state.selectedMission = mission.id;
                renderMissions();
            });

            list.appendChild(item);
        });

        if (!list.children.length) {
            const message = document.createElement("p");
            message.textContent = "Aucune mission dans cette catégorie.";
            list.appendChild(message);
        }
    }

    function hideAllPanels(except = null) {
        [
            "pausePanel", "missionCompletePanel", "gameOverPanel",
            "missionsPanel", "settingsPanel", "inventoryPanel",
            "helpPanel", "systemPanel", "confirmPanel"
        ].forEach(id => {
            if (id !== except) show($(id), false);
        });
    }

    function showPanel(id) {
        hideAllPanels(id);
        show($(id), true);
    }

    function openHome() {
        state.running = false;
        state.paused = false;
        hideAllPanels();
        show(ui.start, true);
        show(ui.sideMenu, false);
        safeText("saveStatus", "Votre progression reste sauvegardée sur cet appareil.");
    }

    /* --------------------------------------------------------
       MOTEUR 3D PLAYCANVAS
    -------------------------------------------------------- */

    function makeMaterial(pc, color, emissive = null) {
        const material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(color[0], color[1], color[2]);

        if (emissive) {
            material.emissive = new pc.Color(emissive[0], emissive[1], emissive[2]);
        }

        material.metalness = 0.08;
        material.gloss = 0.35;
        material.update();
        return material;
    }

    function addPrimitive(type, name, position, scale, material, parent = null) {
        const pc = state.pc;
        const entity = new pc.Entity(name);

        entity.addComponent("render", {
            type,
            material
        });

        entity.setLocalPosition(position[0], position[1], position[2]);
        entity.setLocalScale(scale[0], scale[1], scale[2]);

        (parent || state.app.root).addChild(entity);
        return entity;
    }

    function createScene() {
        const pc = state.pc;
        const canvas = ui.canvas;

        if (!canvas) throw new Error("Élément #jumperCanvas introuvable.");

        state.app = new pc.Application(canvas, {
            graphicsDeviceOptions: {
                antialias: state.quality !== "low",
                alpha: false,
                powerPreference: "high-performance"
            }
        });

        const app = state.app;
        app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        app.setCanvasResolution(pc.RESOLUTION_AUTO);
        app.scene.ambientLight = new pc.Color(0.48, 0.51, 0.62);

        app.scene.exposure = 1;
        app.scene.toneMapping = pc.TONEMAP_ACES;

        const camera = new pc.Entity("NINA_CAMERA");
        camera.addComponent("camera", {
            clearColor: new pc.Color(0.035, 0.075, 0.14),
            fov: 62,
            nearClip: 0.1,
            farClip: 300
        });
        camera.setLocalPosition(0, 5.1, 9.5);
        camera.lookAt(0, 1.5, -7);
        app.root.addChild(camera);
        state.camera = camera;

        const light = new pc.Entity("NINA_DIRECTIONAL_LIGHT");
        light.addComponent("light", {
            type: "directional",
            color: new pc.Color(1, 0.93, 0.8),
            intensity: 1.5,
            castShadows: state.quality === "high"
        });
        light.setLocalEulerAngles(42, 28, 0);
        app.root.addChild(light);

        const fillLight = new pc.Entity("NINA_FILL_LIGHT");
        fillLight.addComponent("light", {
            type: "omni",
            color: new pc.Color(0.18, 0.48, 1),
            intensity: 0.7,
            range: 35
        });
        fillLight.setLocalPosition(-5, 7, 2);
        app.root.addChild(fillLight);

        state.materials.ground = makeMaterial(pc, [0.10, 0.16, 0.23]);
        state.materials.lane = makeMaterial(pc, [0.13, 0.24, 0.34]);
        state.materials.line = makeMaterial(pc, [0.1, 0.65, 0.95], [0.02, 0.2, 0.5]);
        state.materials.player = makeMaterial(pc, [0.15, 0.72, 1], [0.02, 0.12, 0.28]);
        state.materials.skin = makeMaterial(pc, [0.94, 0.65, 0.43]);
        state.materials.hair = makeMaterial(pc, [0.12, 0.055, 0.03]);
        state.materials.obstacle = makeMaterial(pc, [0.94, 0.18, 0.24], [0.16, 0.01, 0.01]);
        state.materials.coin = makeMaterial(pc, [1, 0.73, 0.08], [0.4, 0.22, 0.01]);
        state.materials.platform = makeMaterial(pc, [0.10, 0.35, 0.44]);

        addPrimitive("box", "NINA_TRACK", [0, -0.18, -70], [9, 0.35, 160],
            state.materials.ground);

        for (let lane = -1; lane <= 1; lane++) {
            addPrimitive("box", "NINA_LANE_" + lane, [lane * 2.3, 0.005, -70],
                [2.12, 0.025, 160], state.materials.lane);

            if (lane < 1) {
                addPrimitive("box", "NINA_LANE_LINE_" + lane,
                    [lane * 2.3 + 1.15, 0.025, -70],
                    [0.035, 0.025, 160], state.materials.line);
            }
        }

        for (let z = 0; z > -150; z -= 5) {
            for (let lane = -1; lane <= 1; lane++) {
                const mark = addPrimitive(
                    "box", "NINA_TRACK_MARK",
                    [lane * 2.3, 0.045, z],
                    [0.07, 0.025, 1.3],
                    state.materials.line
                );
                state.tracks.push(mark);
            }
        }

        createPlayer();
        app.on("update", updateGame);
        app.start();

        state.engineReady = true;
        state.initialized = true;
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
    }

    function createPlayer() {
        const pc = state.pc;
        const player = new pc.Entity("NINA_PLAYER");
        player.setLocalPosition(0, 0, 1);
        state.app.root.addChild(player);
        state.player = player;

        const body = addPrimitive(
            "capsule", "NINA_BODY", [0, 1.0, 0],
            [0.72, 1.0, 0.5], state.materials.player, player
        );

        const head = addPrimitive(
            "sphere", "NINA_HEAD", [0, 1.85, 0],
            [0.47, 0.47, 0.43], state.materials.skin, player
        );

        addPrimitive("sphere", "NINA_HAIR", [0, 2.08, -0.04],
            [0.49, 0.27, 0.45], state.materials.hair, player);

        addPrimitive("box", "NINA_LEFT_EYE", [-0.15, 1.88, 0.37],
            [0.055, 0.07, 0.035], state.materials.hair, player);

        addPrimitive("box", "NINA_RIGHT_EYE", [0.15, 1.88, 0.37],
            [0.055, 0.07, 0.035], state.materials.hair, player);

        addPrimitive("box", "NINA_LEFT_LEG", [-0.20, 0.34, 0],
            [0.20, 0.58, 0.25], state.materials.hair, player);

        addPrimitive("box", "NINA_RIGHT_LEG", [0.20, 0.34, 0],
            [0.20, 0.58, 0.25], state.materials.hair, player);

        player.bodyPart = body;
        player.headPart = head;
    }

    function resizeCanvas() {
        if (!state.app || !ui.canvas) return;
        try {
            state.app.resizeCanvas(
                Math.max(1, ui.canvas.clientWidth),
                Math.max(1, ui.canvas.clientHeight)
            );
        } catch (error) {
            console.warn("Redimensionnement du canvas :", error);
        }
    }

    function applyQuality() {
        if (!state.app || !state.pc) return;

        try {
            const canvas = ui.canvas;
            const ratio = state.quality === "low" ? 1
                : state.quality === "high" ? Math.min(window.devicePixelRatio || 1, 2)
                : Math.min(window.devicePixelRatio || 1, 1.5);

            state.app.graphicsDevice.maxPixelRatio = ratio;
            state.app.graphicsDevice.updateClientRect();
            resizeCanvas();
        } catch (error) {
            console.warn("Réglage graphique partiel :", error);
        }
    }

    /* --------------------------------------------------------
       OBSTACLES ET PIÈCES
    -------------------------------------------------------- */

    function clearDynamicObjects() {
        [...state.obstacles, ...state.collectibles].forEach(object => {
            if (object.entity && object.entity.destroy) object.entity.destroy();
        });
        state.obstacles = [];
        state.collectibles = [];
    }

    function spawnObstacle(lane, z) {
        const height = Math.random() < 0.5 ? 0.8 : 1.55;
        const entity = addPrimitive(
            "box",
            "NINA_OBSTACLE",
            [lane * 2.3, height / 2, z],
            [1.15, height, 0.75],
            state.materials.obstacle
        );

        state.obstacles.push({
            entity,
            lane,
            z,
            height,
            passed: false
        });
    }

    function spawnCoin(lane, z, y = 1.15) {
        const entity = addPrimitive(
            "cylinder",
            "NINA_COIN",
            [lane * 2.3, y, z],
            [0.45, 0.12, 0.45],
            state.materials.coin
        );

        state.collectibles.push({
            entity,
            lane,
            z,
            y,
            collected: false,
            phase: random(0, Math.PI * 2)
        });
    }

    function spawnPattern() {
        const z = -65;
        const difficulty = state.mission;
        const lane = Math.floor(random(0, 3)) - 1;
        const roll = Math.random();

        if (roll < 0.55) {
            spawnObstacle(lane, z);
        } else if (roll < 0.75) {
            spawnObstacle(lane, z);
            spawnCoin(-lane, z - 1.5);
        } else {
            spawnCoin(lane, z);
            spawnCoin(lane, z - 2.2);
            spawnCoin(lane, z - 4.4);
        }

        if (difficulty > 5 && Math.random() < 0.22) {
            const otherLane = [-1, 0, 1].filter(n => n !== lane)[
                Math.floor(Math.random() * 2)
            ];
            spawnObstacle(otherLane, z - random(5, 9));
        }
    }

    function resetWorld() {
        clearDynamicObjects();

        state.distance = 0;
        state.spawnDistance = 0;
        state.elapsed = 0;
        state.speed = getMission().speed;
        state.lane = 0;
        state.laneTarget = 0;
        state.jumpY = 0;
        state.jumpVelocity = 0;
        state.jumping = false;
        state.sliding = false;
        state.slideUntil = 0;
        state.invulnerableUntil = 0;
        state.lives = 3;
        state.score = 0;
        state.coins = 0;
        state.gameOver = false;
        state.completed = false;
        updateHUD();
    }

    /* --------------------------------------------------------
       MOUVEMENT ET COLLISIONS
    -------------------------------------------------------- */

    function moveLane(direction) {
        if (!state.running || state.paused || state.gameOver || state.completed) return;

        state.laneTarget = clamp(
            state.laneTarget + direction,
            -1,
            1
        );
        soundEffect(420, 0.045);
    }

    function jump() {
        if (!state.running || state.paused || state.gameOver ||
            state.completed || state.jumping) return;

        state.jumping = true;
        state.jumpVelocity = 9.4;
        state.sliding = false;
        soundEffect(560, 0.08);
        vibrate(20);
    }

    function slide() {
        if (!state.running || state.paused || state.gameOver || state.completed) return;

        state.sliding = true;
        state.slideUntil = performance.now() + 750;
        soundEffect(220, 0.07);
    }

    function vibrate(ms = 30) {
        if (!state.vibrationEnabled) return;
        try {
            if (navigator.vibrate) navigator.vibrate(ms);
        } catch (_) {}
    }

    function collideWithObstacle(obstacle) {
        if (performance.now() < state.invulnerableUntil) return false;
        if (Math.abs(state.lane - obstacle.lane) > 0.42) return false;
        if (Math.abs(obstacle.z - 1) > 1.0) return false;

        const safelyJumping = state.jumping && state.jumpY > 0.85;
        const safelySliding = state.sliding && obstacle.height < 1.1;

        return !safelyJumping && !safelySliding;
    }

    function endGame() {
        state.running = false;
        state.paused = false;
        state.gameOver = true;
        state.best = Math.max(state.best, Math.floor(state.score));

        safeText("gameOverScore", Math.floor(state.score));
        safeText("gameOverBest", state.best);

        show(ui.gameOver, true);
        saveGame(true);
        notify("Course terminée. Vous pouvez réessayer.");
        vibrate([100, 60, 100]);
    }

    function completeMission() {
        if (state.completed) return;

        state.running = false;
        state.completed = true;
        state.best = Math.max(state.best, Math.floor(state.score));

        if (!state.completedMissions.includes(state.mission)) {
            state.completedMissions.push(state.mission);
        }

        state.unlockedMission = Math.max(
            state.unlockedMission,
            Math.min(TOTAL_MISSIONS, state.mission + 1)
        );

        const stars = state.lives >= 3 ? 3 : state.lives === 2 ? 2 : 1;

        safeText("missionFinalScore", Math.floor(state.score));
        safeText("missionFinalCoins", state.coins);
        safeText("missionFinalStars", stars + " / 3");
        safeText("completeDescription",
            "Mission " + state.mission + " terminée. Vous avez gagné " +
            state.coins + " pièces.");

        const nextButton = $("nextMissionButton");
        if (nextButton) {
            nextButton.disabled = state.mission >= TOTAL_MISSIONS;
            nextButton.textContent = state.mission >= TOTAL_MISSIONS
                ? "TOUTES LES MISSIONS TERMINÉES"
                : "MISSION SUIVANTE";
        }

        show(ui.complete, true);
        saveGame(true);
        notify("Mission réussie !");
        soundEffect(820, 0.2);
        vibrate([40, 50, 80]);
    }

    function updateGame(dt) {
        if (!Number.isFinite(dt) || dt < 0) return;
        dt = Math.min(dt, 0.05);

        if (!state.running || state.paused || state.gameOver || state.completed) {
            return;
        }

        state.elapsed += dt;
        state.distance += state.speed * dt;
        state.score += state.speed * dt * 2;
        state.spawnDistance += dt;

        state.lane += (state.laneTarget - state.lane) *
            Math.min(1, dt * (5 + state.sensitivity * 0.5));

        if (state.jumping) {
            state.jumpVelocity -= 22 * dt;
            state.jumpY += state.jumpVelocity * dt;

            if (state.jumpY <= 0) {
                state.jumpY = 0;
                state.jumpVelocity = 0;
                state.jumping = false;
            }
        }

        if (state.sliding && performance.now() > state.slideUntil) {
            state.sliding = false;
        }

        if (state.player) {
            state.player.setLocalPosition(
                state.lane * 2.3,
                state.jumpY,
                1
            );

            state.player.setLocalScale(
                1,
                state.sliding ? 0.55 : 1,
                1
            );
        }

        if (state.camera) {
            const angle = state.cameraAngle * Math.PI / 180;
            const zoom = state.cameraZoom;

            state.camera.setLocalPosition(
                Math.sin(angle) * 2.0,
                5.1 / zoom,
                9.5 / zoom
            );
            state.camera.lookAt(state.lane * 0.8, 1.4, -7);
        }

        state.tracks.forEach(mark => {
            const p = mark.getLocalPosition();
            const z = p.z + state.speed * dt;
            mark.setLocalPosition(p.x, p.y, z > 5 ? z - 150 : z);
        });

        if (state.spawnDistance > Math.max(0.72, 1.5 - state.mission * 0.012)) {
            spawnPattern();
            state.spawnDistance = 0;
        }

        state.obstacles.forEach(obstacle => {
            if (!obstacle.entity) return;

            obstacle.z += state.speed * dt;
            obstacle.entity.setLocalPosition(
                obstacle.lane * 2.3,
                obstacle.height / 2,
                obstacle.z
            );

            if (!obstacle.passed && collideWithObstacle(obstacle)) {
                obstacle.passed = true;
                state.lives--;
                state.invulnerableUntil = performance.now() + 1300;
                vibrate(100);
                notify("Attention ! Vous avez heurté un obstacle.");

                if (state.lives <= 0) {
                    endGame();
                }
            }

            if (obstacle.z > 12 && obstacle.entity) {
                obstacle.entity.destroy();
                obstacle.entity = null;
            }
        });

        state.obstacles = state.obstacles.filter(item => item.entity);

        state.collectibles.forEach(coin => {
            if (!coin.entity) return;

            coin.z += state.speed * dt;
            coin.phase += dt * 3.5;

            coin.entity.setLocalPosition(
                coin.lane * 2.3,
                coin.y + Math.sin(coin.phase) * 0.12,
                coin.z
            );
            coin.entity.rotate(0, 120 * dt, 0);

            if (!coin.collected &&
                Math.abs(state.lane - coin.lane) < 0.45 &&
                Math.abs(coin.z - 1) < 1.1 &&
                Math.abs(state.jumpY + 1 - coin.y) < 1.8) {
                coin.collected = true;
                state.coins++;
                state.score += 25;
                soundEffect(900, 0.06);
                if (coin.entity) coin.entity.destroy();
                coin.entity = null;
            }

            if (coin.z > 12 && coin.entity) {
                coin.entity.destroy();
                coin.entity = null;
            }
        });

        state.collectibles = state.collectibles.filter(item => item.entity);

        const mission = getMission();

        if (state.distance >= mission.targetDistance &&
            state.coins >= mission.targetCoins) {
            completeMission();
        } else if (state.distance >= mission.targetDistance * 1.5) {
            completeMission();
        }

        updateHUD();

        if (Math.floor(state.elapsed) % 10 === 0 &&
            Math.abs(state.elapsed - Math.round(state.elapsed)) < dt) {
            saveGame(true);
        }
    }

    /* --------------------------------------------------------
       DEMARRAGE, PAUSE, REPRISE
    -------------------------------------------------------- */

    function startGame(missionNumber = state.mission, continueGame = false) {
        if (!state.engineReady) {
            notify("Le moteur 3D n'est pas encore prêt.", 3500);
            return;
        }

        const target = clamp(Number(missionNumber) || 1, 1, TOTAL_MISSIONS);
        if (target > state.unlockedMission) {
            notify("Cette mission est verrouillée.");
            return;
        }

        state.mission = target;
        state.selectedMission = target;
        resetWorld();

        if (continueGame) {
            const saved = readJSON(STORAGE_KEY, null);
            if (saved && saved.mission === target) {
                state.score = Math.max(0, Number(saved.score) || 0);
                state.coins = Math.max(0, Number(saved.coins) || 0);
            }
        }

        hideAllPanels();
        show(ui.start, false);
        show(ui.sideMenu, false);

        state.running = true;
        state.paused = false;
        state.gameOver = false;
        state.completed = false;

        notify("Mission " + target + " : " + getMission().name);
        updateHUD();
    }

    function pauseGame() {
        if (!state.running || state.paused) return;
        state.paused = true;
        show(ui.pause, true);
    }

    function resumeGame() {
        if (!state.engineReady || state.gameOver || state.completed) return;
        hideAllPanels();
        state.paused = false;
        state.running = true;
    }

    function restartMission() {
        startGame(state.mission);
    }

    function nextMission() {
        if (state.mission >= TOTAL_MISSIONS) {
            notify("Félicitations ! Vous avez terminé les 50 missions.");
            return;
        }
        startGame(state.mission + 1);
    }

    /* --------------------------------------------------------
       SON
    -------------------------------------------------------- */

    function soundEffect(frequency = 440, duration = 0.07) {
        if (!state.soundEnabled || state.volume <= 0) return;

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;

            if (!state.audioContext) state.audioContext = new AudioContextClass();
            const ctx = state.audioContext;
            if (ctx.state === "suspended") ctx.resume().catch(() => {});

            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = frequency;
            gain.gain.value = (state.volume / 100) * 0.06;

            oscillator.connect(gain);
            gain.connect(ctx.destination);

            oscillator.start();
            gain.gain.exponentialRampToValueAtTime(
                0.001,
                ctx.currentTime + duration
            );
            oscillator.stop(ctx.currentTime + duration);
        } catch (error) {
            console.warn("Son indisponible :", error);
        }
    }

    /* --------------------------------------------------------
       IMPORT / EXPORT ET INITIALISATION
    -------------------------------------------------------- */

    function exportSave() {
        const data = readJSON(STORAGE_KEY, null);
        if (!data) {
            notify("Aucune sauvegarde à exporter.");
            return;
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "nina-jumper-sauvegarde.json";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        notify("Fichier de sauvegarde exporté.");
    }

    function importSave() {
        $("importSaveFile")?.click();
    }

    async function handleImportFile(file) {
        if (!file) return;

        try {
            if (file.size > 1024 * 1024) {
                throw new Error("Fichier trop volumineux.");
            }

            const data = JSON.parse(await file.text());

            if (!data || typeof data !== "object" ||
                !Number.isFinite(Number(data.mission))) {
                throw new Error("Format de sauvegarde invalide.");
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            loadGame();
            updateHUD();
            renderMissions();
            notify("Sauvegarde importée avec succès.");
        } catch (error) {
            console.error(error);
            notify("Impossible d'importer ce fichier.");
        }

        if ($("importSaveFile")) $("importSaveFile").value = "";
    }

    function requestInitialize() {
        safeText("confirmTitle", "INITIALISER LE JEU");
        safeText("confirmMessage",
            "Supprimer la progression locale et recommencer depuis la mission 1 ?");
        state.confirmAction = () => {
            try {
                localStorage.removeItem(STORAGE_KEY);
                state.mission = 1;
                state.selectedMission = 1;
                state.unlockedMission = 1;
                state.completedMissions = [];
                state.score = 0;
                state.coins = 0;
                state.best = 0;
                state.lives = 3;

                saveGame(true);
                renderMissions();
                updateHUD();
                openHome();
                notify("Progression réinitialisée.");
            } catch (error) {
                notify("Réinitialisation impossible.");
            }
        };

        showPanel("confirmPanel");
    }

    /* --------------------------------------------------------
       GESTION CENTRALISÉE DES BOUTONS HTML
    -------------------------------------------------------- */

    function handleAction(action, element) {
        switch (action) {
            case "start-game":
                startGame(1);
                break;

            case "continue-game":
                startGame(state.mission, true);
                break;

            case "pause":
                pauseGame();
                break;

            case "resume":
                resumeGame();
                break;

            case "restart-mission":
                restartMission();
                break;

            case "next-mission":
                nextMission();
                break;

            case "save":
                saveGame();
                break;

            case "toggle-menu":
                show(ui.sideMenu, ui.sideMenu?.classList.contains("hidden"));
                break;

            case "close-menu":
                show(ui.sideMenu, false);
                break;

            case "open-missions":
                state.filter = "all";
                renderMissions();
                show(ui.sideMenu, false);
                showPanel("missionsPanel");
                break;

            case "filter-missions":
                state.filter = element.dataset.filter || "all";
                renderMissions();
                break;

            case "start-selected-mission":
                startGame(state.selectedMission);
                break;

            case "open-inventory":
                safeText("inventoryCoins", state.coins);
                show(ui.sideMenu, false);
                showPanel("inventoryPanel");
                break;

            case "open-settings":
                show(ui.sideMenu, false);
                showPanel("settingsPanel");
                break;

            case "open-help":
                show(ui.sideMenu, false);
                showPanel("helpPanel");
                break;

            case "open-system":
                show(ui.sideMenu, false);
                showPanel("systemPanel");
                break;

            case "close-panel":
                show($(element.dataset.panel), false);
                break;

            case "return-home":
                openHome();
                break;

            case "apply-settings":
                applySettings();
                break;

            case "zoom-in":
                setZoom(state.cameraZoom + 0.12);
                break;

            case "zoom-out":
                setZoom(state.cameraZoom - 0.12);
                break;

            case "zoom-reset":
                setZoom(1);
                state.cameraAngle = 0;
                break;

            case "rotate-camera":
                state.cameraAngle = (state.cameraAngle + 15) % 360;
                break;

            case "move-left":
                moveLane(-1);
                break;

            case "move-right":
                moveLane(1);
                break;

            case "jump":
                jump();
                break;

            case "slide":
                slide();
                break;

            case "fullscreen":
                toggleFullscreen();
                break;

            case "toggle-sound":
                state.soundEnabled = !state.soundEnabled;
                notify(state.soundEnabled ? "Son activé." : "Son désactivé.");
                break;

            case "export-save":
                exportSave();
                break;

            case "import-save":
                importSave();
                break;

            case "initialize":
                requestInitialize();
                break;

            case "confirm-yes":
                show($("confirmPanel"), false);
                if (typeof state.confirmAction === "function") {
                    const callback = state.confirmAction;
                    state.confirmAction = null;
                    callback();
                }
                break;

            case "confirm-no":
                state.confirmAction = null;
                show($("confirmPanel"), false);
                break;

            default:
                console.debug("Action sans gestionnaire :", action);
        }
    }

    function setZoom(value) {
        state.cameraZoom = clamp(value, 0.65, 1.6);
    }

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                const target = $("appJumper") || document.documentElement;
                if (target.requestFullscreen) await target.requestFullscreen();
                else notify("Le plein écran n'est pas disponible sur ce navigateur.");
            } else if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        } catch (error) {
            notify("Le plein écran est bloqué par le navigateur.");
        }
    }

    function bindButtons() {
        document.addEventListener("click", event => {
            const button = event.target.closest("[data-action]");
            if (!button || button.disabled) return;
            event.preventDefault();
            handleAction(button.dataset.action, button);
        });

        $("sensitivityRange")?.addEventListener("input", event => {
            state.sensitivity = Number(event.target.value);
            updateSettingsLabels();
        });

        $("volumeRange")?.addEventListener("input", event => {
            state.volume = Number(event.target.value);
            updateSettingsLabels();
        });

        $("importSaveFile")?.addEventListener("change", event => {
            handleImportFile(event.target.files?.[0]);
        });

        document.addEventListener("keydown", event => {
            if (event.repeat) return;

            switch (event.key) {
                case "ArrowLeft":
                case "a":
                case "A":
                    event.preventDefault();
                    moveLane(-1);
                    break;

                case "ArrowRight":
                case "d":
                case "D":
                    event.preventDefault();
                    moveLane(1);
                    break;

                case "ArrowUp":
                case " ":
                case "w":
                case "W":
                    event.preventDefault();
                    jump();
                    break;

                case "ArrowDown":
                case "s":
                case "S":
                    event.preventDefault();
                    slide();
                    break;

                case "Escape":
                    if (state.running && !state.paused) pauseGame();
                    else if (state.paused) resumeGame();
                    else show(ui.sideMenu, false);
                    break;
            }
        });
    }

    /* --------------------------------------------------------
       GESTES ANDROID : GLISSEMENT ET PINCH À DEUX DOIGTS
    -------------------------------------------------------- */

    function bindGestures() {
        const surface = $("gestureSurface");
        if (!surface) return;

        let startX = 0;
        let startY = 0;
        let startTime = 0;
        let pinchStartDistance = 0;
        let pinchStartZoom = 1;

        const distance = (a, b) =>
            Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);

        surface.addEventListener("touchstart", event => {
            if (event.touches.length === 2) {
                pinchStartDistance = distance(event.touches[0], event.touches[1]);
                pinchStartZoom = state.cameraZoom;
            } else if (event.touches.length === 1) {
                startX = event.touches[0].clientX;
                startY = event.touches[0].clientY;
                startTime = performance.now();
            }
        }, { passive: true });

        surface.addEventListener("touchmove", event => {
            if (event.touches.length === 2 && pinchStartDistance > 0) {
                const currentDistance = distance(event.touches[0], event.touches[1]);
                setZoom(pinchStartZoom * currentDistance / pinchStartDistance);
            }
        }, { passive: true });

        surface.addEventListener("touchend", event => {
            if (event.changedTouches.length !== 1 || !startTime) return;

            const touch = event.changedTouches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            const elapsed = performance.now() - startTime;

            if (elapsed > 800) return;

            if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
                moveLane(dx < 0 ? -1 : 1);
            } else if (Math.abs(dy) > 35) {
                if (dy < 0) jump();
                else slide();
            }

            startTime = 0;
        }, { passive: true });

        let pointerStart = null;

        surface.addEventListener("pointerdown", event => {
            if (event.pointerType === "touch") return;
            pointerStart = {
                x: event.clientX,
                y: event.clientY,
                time: performance.now()
            };
        });

        surface.addEventListener("pointerup", event => {
            if (!pointerStart || event.pointerType === "touch") return;

            const dx = event.clientX - pointerStart.x;
            const dy = event.clientY - pointerStart.y;

            if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
                moveLane(dx < 0 ? -1 : 1);
            } else if (Math.abs(dy) > 35) {
                if (dy < 0) jump();
                else slide();
            }

            pointerStart = null;
        });
    }

    /* --------------------------------------------------------
       INITIALISATION PRINCIPALE
    -------------------------------------------------------- */

    async function initialize() {
        try {
            setLoading(5, "Préparation de l'interface...");
            bindButtons();
            bindGestures();
            loadGame();
            loadSettings();
            updateHUD();
            renderMissions();

            setLoading(18, "Chargement du moteur 3D PlayCanvas...");

            const pc = await import(
                "https://cdn.jsdelivr.net/npm/playcanvas@2.14.4/+esm"
            );

            state.pc = pc;
            setLoading(45, "Construction de l'univers 3D...");

            createScene();
            applyQuality();

            setLoading(82, "Préparation des missions...");
            updateHUD();
            renderMissions();

            setLoading(100, "Prêt !");
            hideLoading();

            show(ui.start, true);
            show(ui.pause, false);
            show(ui.complete, false);
            show(ui.gameOver, false);

            safeText("databaseStatus", "Base de données : stockage local prêt.");
            safeText("saveStatus", "Prêt à commencer votre aventure.");

            console.info(
                "NINA JUMPER 3D prêt :",
                TOTAL_MISSIONS,
                "missions chargées."
            );
        } catch (error) {
            showFatalError(error);
        }
    }

    window.NINA_JUMPER_3D = {
        start: startGame,
        pause: pauseGame,
        resume: resumeGame,
        save: saveGame,
        missions,
        getState: () => ({ ...state })
    };

    await initialize();
})();
