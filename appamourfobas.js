/* ============================================================
   FOBAS INTERACTIVE — SUR L'AMOUR EN ACTION
   Fichier : appamourfobas.js
   Version : 3.1.0
   Moteur  : Babylon.js
   Compatible avec appamourfobas.html fourni
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     1. CONFIGURATION ET ÉLÉMENTS HTML
  ========================================================== */

  const TOTAL = 35;
  const SAVE_KEY = "FOBAS_LOVE_ACTION_SAVE_V31";
  const SETTINGS_KEY = "FOBAS_LOVE_ACTION_SETTINGS_V31";

  const $ = id => document.getElementById(id);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const distance = (a, b) =>
    Math.hypot(a.x - b.x, a.z - b.z);

  const ids = [
    "loadingScreen", "loadingMessage", "loadingProgress",
    "loadingPercent", "mainMenu", "settingsButton",
    "newGameButton", "continueGameButton", "missionsMenuButton",
    "creditsButton", "saveStatus", "gameScreen", "gameWorld",
    "loveGameCanvas", "worldLoadingOverlay", "worldLoadingText",
    "gameTopBar", "pauseButton", "missionNumber", "missionTitle",
    "openMissionsButton", "objectivePanel", "objectiveText",
    "objectiveProgressBar", "objectiveProgressText",
    "interactionPrompt", "interactionIcon", "interactionText",
    "dialoguePanel", "speakerAvatar", "speakerName", "dialogueText",
    "dialogueChoices", "dialogueVoiceStatus", "closeDialogueButton",
    "repeatDialogueButton", "nextDialogueButton", "touchControls",
    "movementControl", "joystickBase", "joystickThumb",
    "cameraControlHint", "runButton", "jumpButton", "talkButton",
    "gameNotification", "savingIndicator", "missionsScreen",
    "closeMissionsButton", "missionsSummary", "overallProgressBar",
    "missionsList", "pauseScreen", "resumeButton",
    "pauseMissionsButton", "saveGameButton", "returnToMenuButton",
    "settingsScreen", "closeSettingsButton", "voiceEnabled",
    "musicEnabled", "subtitlesEnabled", "qualitySelect",
    "sensitivityRange", "saveSettingsButton", "creditsScreen",
    "closeCreditsButton", "missionCompleteScreen",
    "completionTitle", "completionMessage", "completionProgress",
    "nextMissionButton", "completionMenuButton", "endingScreen",
    "restartGameButton", "endingMenuButton", "confirmationScreen",
    "confirmationTitle", "confirmationMessage",
    "cancelConfirmationButton", "acceptConfirmationButton",
    "errorScreen", "errorTitle", "errorMessage", "retryButton",
    "errorMenuButton"
  ];

  const DOM = {};
  ids.forEach(id => DOM[id] = $(id));

  const show = id => DOM[id]?.classList.remove("hidden");
  const hide = id => DOM[id]?.classList.add("hidden");

  const text = (id, value) => {
    if (DOM[id]) DOM[id].textContent = String(value ?? "");
  };

  const setWidth = (id, value) => {
    if (DOM[id]) DOM[id].style.width = clamp(value, 0, 100) + "%";
  };

  /* ==========================================================
     2. LES 35 MISSIONS
  ========================================================== */

  const missionData = [
    ["Un regard inattendu", "Approchez-vous de Camille et faites connaissance.", "Bonjour ! Je m'appelle Camille. Je suis heureuse de vous rencontrer."],
    ["Un sourire sincère", "Rejoignez le point lumineux et échangez avec Camille.", "Votre sourire rend cette journée plus lumineuse."],
    ["Le premier échange", "Rejoignez Camille pour parler de vos centres d'intérêt.", "J'aime les promenades, la musique et les conversations sincères."],
    ["Une promenade au parc", "Rejoignez le kiosque au centre du parc.", "Le jardin est magnifique aujourd'hui. Prenons le temps de marcher."],
    ["Une fleur pour le cœur", "Approchez-vous du marqueur près des fleurs.", "Une petite fleur peut porter un très beau message."],
    ["Une histoire à partager", "Retrouvez Camille près du point de rencontre.", "Chaque rencontre peut ouvrir un nouveau chapitre."],
    ["La confiance naissante", "Rejoignez le prochain point de rencontre.", "La confiance grandit avec l'écoute et la sincérité."],
    ["Un café chaleureux", "Rejoignez la terrasse du café.", "Un café et une conversation, voilà un joli moment."],
    ["Des rêves communs", "Approchez-vous de Camille et parlez de vos rêves.", "Les rêves deviennent plus forts quand on les partage."],
    ["Une mélodie douce", "Rejoignez le coin musical.", "Cette mélodie me rappelle les beaux moments de la vie."],
    ["Le chemin des souvenirs", "Parcourez le sentier jusqu'au prochain marqueur.", "J'aime les endroits qui nous invitent à réfléchir."],
    ["Une promesse de respect", "Retrouvez Camille pour parler du respect mutuel.", "Le respect est une base essentielle de toute relation."],
    ["Le jardin secret", "Rejoignez les fleurs roses.", "Ce jardin est mon endroit préféré pour me ressourcer."],
    ["Un moment de vérité", "Rejoignez le point indiqué pour échanger avec Camille.", "Dire la vérité avec bienveillance demande du courage."],
    ["La lettre oubliée", "Approchez-vous du marqueur de la lettre.", "Cette lettre contient des mots que je n'avais jamais osé dire."],
    ["Une écoute attentive", "Retrouvez Camille pour écouter son histoire.", "Merci de m'écouter sans me juger."],
    ["Un geste de bonté", "Rejoignez le kiosque du jardin.", "Les petits gestes de bonté ont parfois le plus grand effet."],
    ["La pluie et l'abri", "Rejoignez le pavillon.", "Même les jours gris peuvent devenir de beaux souvenirs."],
    ["Un nouveau départ", "Retrouvez Camille au point de rencontre.", "Chaque jour nous donne la possibilité de recommencer."],
    ["Le pont des décisions", "Traversez le sentier jusqu'au pont.", "Nos choix dessinent peu à peu notre avenir."],
    ["Le courage de parler", "Rejoignez Camille près du pont.", "Merci d'avoir le courage de parler avec ton cœur."],
    ["Un souvenir précieux", "Approchez-vous du banc des souvenirs.", "Certains instants restent précieux longtemps."],
    ["La fête du jardin", "Rejoignez la place décorée.", "La joie se partage et devient encore plus belle."],
    ["Une danse improvisée", "Rejoignez le point musical.", "Pourquoi pas ? Laissons-nous porter par la musique."],
    ["Le cadeau symbolique", "Approchez-vous du marqueur près des fleurs.", "Ce n'est pas la valeur du cadeau, mais l'intention qui compte."],
    ["Le choix du cœur", "Retrouvez Camille pour parler de vos priorités.", "Un choix sincère doit respecter les deux personnes."],
    ["Les mots qui réparent", "Rejoignez le point de rencontre.", "Les mots doux peuvent réparer bien des choses."],
    ["La force du pardon", "Retrouvez Camille pour parler du pardon.", "Pardonner ne signifie pas oublier, mais choisir d'avancer."],
    ["Une vision partagée", "Rejoignez le belvédère du jardin.", "J'espère que nous garderons toujours cette honnêteté."],
    ["L'avenir en confiance", "Retrouvez Camille près du pavillon.", "L'avenir se construit pas à pas, avec confiance."],
    ["Le chemin des étoiles", "Approchez-vous du point lumineux.", "Même une petite lumière peut guider notre chemin."],
    ["Un engagement sincère", "Rejoignez Camille pour parler de votre engagement.", "Un engagement a du sens quand il est libre et sincère."],
    ["La célébration des liens", "Rejoignez la place centrale.", "Célébrons les liens que nous avons appris à construire."],
    ["Une dernière promenade", "Retrouvez Camille au bout du sentier.", "Je suis heureuse de tout ce que nous avons partagé."],
    ["Sur l'amour en action", "Rejoignez Camille une dernière fois pour terminer l'aventure.", "L'amour en action se montre par le respect, l'écoute et les gestes du quotidien. Merci pour cette aventure !"]
  ].map(m => ({ title: m[0], objective: m[1], dialogue: m[2], speaker: "Camille" }));

  /* ==========================================================
     3. ÉTAT DU JEU
  ========================================================== */

  const state = {
    activeMission: 0,
    completed: [],
    started: false,
    running: false,
    paused: false,
    worldReady: false,
    dialogueOpen: false,
    currentDialogue: "",
    engine: null,
    scene: null,
    camera: null,
    player: null,
    playerHead: null,
    npc: null,
    npcHead: null,
    target: null,
    targetRing: null,
    meshes: [],
    keys: Object.create(null),
    joystick: { x: 0, z: 0, active: false, pointerId: null },
    yaw: Math.PI,
    pitch: 0.78,
    cameraDistance: 8,
    sensitivity: 1,
    runningFast: false,
    verticalVelocity: 0,
    onGround: true,
    lastTime: 0,
    notificationTimer: null,
    confirmationAction: null,
    settings: {
      voice: true,
      music: true,
      subtitles: true,
      quality: "medium",
      sensitivity: 1
    }
  };

  const missionPositions = Array.from({ length: TOTAL }, (_, i) => {
    const angle = i * 2.399963;
    const radius = 5 + Math.floor(i / 5) * 2.7;
    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius
    };
  });

  /* ==========================================================
     4. NOTIFICATIONS ET ÉCRANS
  ========================================================== */

  function notify(message, duration = 2600) {
    text("gameNotification", message);
    show("gameNotification");
    clearTimeout(state.notificationTimer);
    state.notificationTimer = setTimeout(() => hide("gameNotification"), duration);
  }

  function hideAllOverlays() {
    [
      "missionsScreen", "pauseScreen", "settingsScreen",
      "creditsScreen", "missionCompleteScreen", "endingScreen",
      "confirmationScreen", "errorScreen"
    ].forEach(hide);
  }

  function showError(message, title = "Impossible de démarrer le jeu") {
    console.error("[FOBAS Love]", message);
    text("errorTitle", title);
    text("errorMessage", message);
    hide("loadingScreen");
    hide("mainMenu");
    hide("gameScreen");
    hide("worldLoadingOverlay");
    show("errorScreen");
  }

  function openMainMenu() {
    state.running = false;
    state.paused = false;
    state.dialogueOpen = false;
    hideAllOverlays();
    hide("dialoguePanel");
    hide("gameScreen");
    show("mainMenu");
    updateContinueButton();
    text("saveStatus", loadSave() ? "Progression disponible" : "Sauvegarde locale prête");
  }

  /* ==========================================================
     5. SAUVEGARDE LOCALE
  ========================================================== */

  function readStorage(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn("Lecture locale indisponible :", error);
      return null;
    }
  }

  function loadSave() {
    const save = readStorage(SAVE_KEY);
    if (!save || !Array.isArray(save.completed)) return null;

    save.completed = [...new Set(save.completed)]
      .filter(n => Number.isInteger(n) && n >= 0 && n < TOTAL);

    save.activeMission = clamp(Number(save.activeMission) || 0, 0, TOTAL - 1);
    return save;
  }

  function saveGame(silent = false) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        version: 31,
        activeMission: state.activeMission,
        completed: state.completed,
        savedAt: new Date().toISOString()
      }));

      text("saveStatus", "Progression sauvegardée");
      updateContinueButton();

      if (!silent) {
        show("savingIndicator");
        setTimeout(() => hide("savingIndicator"), 900);
        notify("Progression sauvegardée sur cet appareil.");
      }
      return true;
    } catch (error) {
      if (!silent) notify("Sauvegarde impossible dans ce navigateur.");
      console.error(error);
      return false;
    }
  }

  function updateContinueButton() {
    if (DOM.continueGameButton) {
      DOM.continueGameButton.disabled = !loadSave();
    }
  }

  /* ==========================================================
     6. PARAMÈTRES
  ========================================================== */

  function loadSettings() {
    const saved = readStorage(SETTINGS_KEY);
    if (saved && typeof saved === "object") {
      state.settings = { ...state.settings, ...saved };
    }

    state.sensitivity = clamp(Number(state.settings.sensitivity) || 1, 0.5, 2);

    if (DOM.voiceEnabled) DOM.voiceEnabled.checked = !!state.settings.voice;
    if (DOM.musicEnabled) DOM.musicEnabled.checked = !!state.settings.music;
    if (DOM.subtitlesEnabled) DOM.subtitlesEnabled.checked = !!state.settings.subtitles;
    if (DOM.qualitySelect) DOM.qualitySelect.value = state.settings.quality;
    if (DOM.sensitivityRange) DOM.sensitivityRange.value = state.sensitivity;
  }

  function saveSettings() {
    state.settings = {
      voice: !!DOM.voiceEnabled?.checked,
      music: !!DOM.musicEnabled?.checked,
      subtitles: !!DOM.subtitlesEnabled?.checked,
      quality: DOM.qualitySelect?.value || "medium",
      sensitivity: clamp(Number(DOM.sensitivityRange?.value) || 1, 0.5, 2)
    };

    state.sensitivity = state.settings.sensitivity;

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    } catch (error) {
      console.warn("Paramètres non sauvegardés :", error);
    }

    applyQuality();
    hide("settingsScreen");
    notify("Paramètres enregistrés.");
  }

  function applyQuality() {
    if (!state.engine) return;

    const ratio = state.settings.quality === "high" ? 1 :
      state.settings.quality === "low" ? 0.65 : 0.85;

    state.engine.setHardwareScalingLevel(1 / ratio);
    state.engine.resize();
  }

  /* ==========================================================
     7. OUTILS BABYLON.JS
  ========================================================== */

  function makeMaterial(name, color, emissive = null) {
    const mat = new BABYLON.StandardMaterial(name, state.scene);
    mat.diffuseColor = BABYLON.Color3.FromHexString(color);
    mat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    if (emissive) mat.emissiveColor = BABYLON.Color3.FromHexString(emissive);
    return mat;
  }

  function remember(mesh) {
    state.meshes.push(mesh);
    return mesh;
  }

  function sphere(name, position, diameter, material) {
    const mesh = BABYLON.MeshBuilder.CreateSphere(name, {
      diameter,
      segments: 16
    }, state.scene);

    mesh.position.copyFrom(position);
    mesh.material = material;
    return remember(mesh);
  }

  function box(name, position, size, material) {
    const mesh = BABYLON.MeshBuilder.CreateBox(name, {
      width: size[0],
      height: size[1],
      depth: size[2]
    }, state.scene);

    mesh.position.copyFrom(position);
    mesh.material = material;
    return remember(mesh);
  }

  function cylinder(name, position, height, diameter, material) {
    const mesh = BABYLON.MeshBuilder.CreateCylinder(name, {
      height,
      diameter,
      tessellation: 20
    }, state.scene);

    mesh.position.copyFrom(position);
    mesh.material = material;
    return remember(mesh);
  }

  /* ==========================================================
     8. CONSTRUCTION DU MONDE 3D
  ========================================================== */

  function createWorld() {
    const B = BABYLON;

    state.scene = new B.Scene(state.engine);
    state.scene.clearColor = new B.Color4(0.48, 0.72, 0.92, 1);
    state.scene.collisionsEnabled = true;
    state.scene.gravity = new B.Vector3(0, -0.25, 0);

    const light = new B.HemisphericLight(
      "loveAmbientLight",
      new B.Vector3(0, 1, 0),
      state.scene
    );
    light.intensity = 0.95;

    const sun = new B.DirectionalLight(
      "loveSun",
      new B.Vector3(-0.5, -1, 0.4),
      state.scene
    );
    sun.position = new B.Vector3(15, 25, -10);
    sun.intensity = 0.65;

    state.camera = new B.FollowCamera(
      "loveFollowCamera",
      new B.Vector3(0, 5, -8),
      state.scene
    );
    state.camera.radius = state.cameraDistance;
    state.camera.heightOffset = 3;
    state.camera.rotationOffset = 180;
    state.camera.cameraAcceleration = 0.08;
    state.camera.maxCameraSpeed = 12;
    state.camera.lowerRadiusLimit = 4;
    state.camera.upperRadiusLimit = 16;
    state.camera.attachControl(DOM.loveGameCanvas, true);

    const grass = makeMaterial("grassMaterial", "#4B9958");
    const path = makeMaterial("pathMaterial", "#C6B38A");
    const wood = makeMaterial("woodMaterial", "#875335");
    const leaves = makeMaterial("leavesMaterial", "#267344");
    const pink = makeMaterial("pinkMaterial", "#F3A0C4");
    const gold = makeMaterial("goldMaterial", "#F2D18A");
    const skin = makeMaterial("skinMaterial", "#B97952");
    const clothes = makeMaterial("clothesMaterial", "#6447A6");
    const hair = makeMaterial("hairMaterial", "#35251F");
    const white = makeMaterial("whiteMaterial", "#FFF5F8");
    const flowerMat = makeMaterial("flowerMaterial", "#FF80B9", "#54213C");

    // Terrain
    const ground = B.MeshBuilder.CreateGround("loveGround", {
      width: 100,
      height: 100,
      subdivisions: 2
    }, state.scene);
    ground.material = grass;
    ground.checkCollisions = true;
    remember(ground);

    // Allée principale
    const mainPath = box(
      "mainGardenPath",
      new B.Vector3(0, 0.015, 0),
      [5, 0.04, 75],
      path
    );

    const crossPath = box(
      "crossGardenPath",
      new B.Vector3(0, 0.025, 0),
      [60, 0.04, 4],
      path
    );

    // Banc central
    box("benchSeat", new B.Vector3(4, 0.55, 0), [2.2, 0.18, 0.65], wood);
    box("benchBack", new B.Vector3(4, 1.0, 0.25), [2.2, 0.65, 0.16], wood);
    [-0.8, 0.8].forEach(x =>
      box("benchLeg", new B.Vector3(4 + x, 0.27, 0), [0.15, 0.55, 0.15], wood)
    );

    // Kiosque
    cylinder("kioskColumn1", new B.Vector3(-4, 1.5, -3), 3, 0.2, wood);
    cylinder("kioskColumn2", new B.Vector3(-4, 1.5, 3), 3, 0.2, wood);
    cylinder("kioskColumn3", new B.Vector3(4, 1.5, -3), 3, 0.2, wood);
    cylinder("kioskColumn4", new B.Vector3(4, 1.5, 3), 3, 0.2, wood);

    const roof = B.MeshBuilder.CreateCylinder("kioskRoof", {
      height: 0.3,
      diameter: 10,
      tessellation: 4
    }, state.scene);
    roof.position.y = 3.1;
    roof.rotation.y = Math.PI / 4;
    roof.material = pink;
    remember(roof);

    // Arbres et fleurs
    for (let i = 0; i < 48; i++) {
      const angle = i * 2.399963;
      const radius = 12 + (i % 5) * 4;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      if (Math.abs(x) < 5 && Math.abs(z) < 8) continue;

      cylinder(
        "treeTrunk",
        new B.Vector3(x, 1.2, z),
        2.4,
        0.5,
        wood
      );

      sphere(
        "treeCanopy",
        new B.Vector3(x, 2.8, z),
        2.6 + (i % 3) * 0.3,
        leaves
      );

      if (i % 2 === 0) {
        sphere(
          "gardenFlower",
          new B.Vector3(x + 1, 0.25, z + 0.5),
          0.45,
          flowerMat
        );
      }
    }

    // Pont décoratif
    box("bridgeDeck", new B.Vector3(0, 0.2, 24), [8, 0.3, 3], wood);
    [-3.5, 3.5].forEach(x => {
      box("bridgeRail", new B.Vector3(x, 0.8, 24), [0.15, 0.9, 3], gold);
    });

    // Lampadaires
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      cylinder(
        "gardenLampPost",
        new B.Vector3(3.4, 1.2, i * 9),
        2.4,
        0.12,
        wood
      );

      sphere(
        "gardenLamp",
        new B.Vector3(3.4, 2.45, i * 9),
        0.45,
        gold
      );
    }

    // Joueur
    state.player = cylinder(
      "lovePlayer",
      new B.Vector3(0, 0.85, -5),
      1.7,
      0.65,
      clothes
    );
    state.player.ellipsoid = new B.Vector3(0.38, 0.85, 0.38);
    state.player.checkCollisions = true;
    state.playerHead = sphere(
      "lovePlayerHead",
      new B.Vector3(0, 1.95, -5),
      0.65,
      skin
    );

    // Pseudo-avatar de Camille : géométrie créée sans modèle externe
    state.npc = cylinder(
      "camilleBody",
      new B.Vector3(0, 0.85, -1),
      1.7,
      0.65,
      pink
    );
    state.npcHead = sphere(
      "camilleHead",
      new B.Vector3(0, 1.95, -1),
      0.65,
      skin
    );

    cylinder(
      "camilleHair",
      new B.Vector3(0, 2.12, -1),
      0.55,
      0.69,
      hair
    );

    // Repère de mission
    state.target = sphere(
      "missionTarget",
      new B.Vector3(0, 0.5, 0),
      0.9,
      gold
    );

    state.targetRing = B.MeshBuilder.CreateTorus("missionRing", {
      diameter: 2.4,
      thickness: 0.1,
      tessellation: 40
    }, state.scene);

    state.targetRing.position.y = 0.12;
    state.targetRing.material = gold;
    remember(state.targetRing);

    state.camera.lockedTarget = state.player;
    updateMissionTarget();

    // Effets d'animation et de mouvement
    state.scene.onBeforeRenderObservable.add(() => {
      if (!state.target || !state.targetRing) return;
      const t = performance.now() * 0.002;
      state.target.position.y = 0.65 + Math.sin(t) * 0.2;
      state.targetRing.rotation.y += 0.008;
    });
  }

  /* ==========================================================
     9. MISSION ACTUELLE ET REPÈRES
  ========================================================== */

  function updateMissionTarget() {
    if (!state.target || !state.npc || !state.player) return;

    const p = missionPositions[state.activeMission];
    state.target.position.x = p.x;
    state.target.position.z = p.z;
    state.target.position.y = 0.65;

    if (state.targetRing) {
      state.targetRing.position.x = p.x;
      state.targetRing.position.z = p.z;
    }

    // Camille attend près du repère.
    state.npc.position.x = p.x + 1.8;
    state.npc.position.z = p.z + 0.5;
    state.npcHead.position.x = state.npc.position.x;
    state.npcHead.position.z = state.npc.position.z;
  }

  function updateMissionUI() {
    const m = missionData[state.activeMission];
    const done = state.completed.includes(state.activeMission);

    text("missionNumber",
      `MISSION ${String(state.activeMission + 1).padStart(2, "0")} / ${TOTAL}`);
    text("missionTitle", m.title);
    text("objectiveText", done ? "Mission terminée !" : m.objective);
    text("objectiveProgressText", done ? "1 / 1" : "0 / 1");
    setWidth("objectiveProgressBar", done ? 100 : 0);

    renderMissions();
  }

  function renderMissions() {
    const list = DOM.missionsList;
    if (!list) return;

    list.replaceChildren();

    const completedCount = state.completed.length;
    text("missionsSummary",
      `${completedCount} mission${completedCount > 1 ? "s" : ""} terminée${completedCount > 1 ? "s" : ""} sur ${TOTAL}`);

    setWidth("overallProgressBar", completedCount / TOTAL * 100);

    missionData.forEach((m, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mission-list-item";
      button.style.cssText =
        "display:block;width:100%;text-align:left;margin:6px 0;padding:12px;border-radius:12px;border:1px solid #ffffff30;background:#24172d;color:inherit;";

      const completed = state.completed.includes(i);
      const current = i === state.activeMission;

      button.textContent =
        `${completed ? "✓" : current ? "▶" : "♡"}  ${String(i + 1).padStart(2, "0")}. ${m.title}`;

      if (current) button.style.borderColor = "#e6a4c5";
      if (completed) button.style.opacity = "0.75";

      button.addEventListener("click", () => {
        if (!state.started) {
          hide("missionsScreen");
          startNewGame(i);
          return;
        }

        // Rejouer une mission terminée ou choisir la mission active.
        if (completed || i === state.activeMission) {
          state.activeMission = i;
          hide("missionsScreen");
          show("gameScreen");
          updateMissionTarget();
          updateMissionUI();
          notify("Mission sélectionnée : " + m.title);
        } else {
          notify("Terminez d'abord la mission actuelle.");
        }
      });

      list.appendChild(button);
    });
  }

  /* ==========================================================
     10. CAMÉRA
  ========================================================== */

  function updateCamera() {
    if (!state.camera || !state.player) return;

    state.camera.radius = state.cameraDistance;
    state.camera.heightOffset = 1.8 + state.pitch * 2.4;
    state.camera.rotationOffset = 180 + state.yaw * 180 / Math.PI;
  }

  /* ==========================================================
     11. DÉPLACEMENT DU JOUEUR
  ========================================================== */

  function updateMovement(dt) {
    if (!state.running || state.paused || !state.player) return;

    let forward = 0;
    let side = 0;

    if (state.keys.KeyW || state.keys.ArrowUp) forward += 1;
    if (state.keys.KeyS || state.keys.ArrowDown) forward -= 1;
    if (state.keys.KeyA || state.keys.ArrowLeft) side -= 1;
    if (state.keys.KeyD || state.keys.ArrowRight) side += 1;

    forward += state.joystick.z;
    side += state.joystick.x;

    const length = Math.hypot(forward, side);
    if (length > 1) {
      forward /= length;
      side /= length;
    }

    const speed = state.runningFast ? 8 : 4.2;
    const direction = state.yaw;

    const dx =
      Math.sin(direction) * forward +
      Math.cos(direction) * side;

    const dz =
      Math.cos(direction) * forward -
      Math.sin(direction) * side;

    state.player.position.x += dx * speed * dt;
    state.player.position.z += dz * speed * dt;

    state.player.position.x = clamp(state.player.position.x, -43, 43);
    state.player.position.z = clamp(state.player.position.z, -43, 43);

    // Gravité et saut.
    if (!state.onGround) {
      state.verticalVelocity -= 16 * dt;
      state.player.position.y += state.verticalVelocity * dt;

      if (state.player.position.y <= 0.85) {
        state.player.position.y = 0.85;
        state.verticalVelocity = 0;
        state.onGround = true;
      }
    }

    // La tête suit le joueur.
    if (state.playerHead) {
      state.playerHead.position.x = state.player.position.x;
      state.playerHead.position.z = state.player.position.z;
      state.playerHead.position.y = state.player.position.y + 1.1;
    }

    if (length > 0.08) {
      state.player.rotation.y = Math.atan2(dx, dz);
    }

    updateCamera();
    updateInteractionPrompt();
  }

  function jump() {
    if (!state.running || state.paused || !state.onGround) return;

    state.verticalVelocity = 7.2;
    state.onGround = false;
  }

  function updateInteractionPrompt() {
    if (!state.player || !state.npc || !state.running) {
      hide("interactionPrompt");
      return;
    }

    const d = distance(state.player.position, state.npc.position);

    if (d < 3.5 && !state.dialogueOpen) {
      text("interactionText", "Parler à Camille");
      text("interactionIcon", "♡");
      show("interactionPrompt");
    } else {
      hide("interactionPrompt");
    }
  }

  /* ==========================================================
     12. DIALOGUES ET INTERACTIONS
  ========================================================== */

  function speak(message) {
    if (!message) return;

    if (!state.settings.voice || !("speechSynthesis" in window)) {
      text("dialogueVoiceStatus", "Dialogue en français");
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "fr-FR";
      utterance.rate = 0.94;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
      text("dialogueVoiceStatus", "Lecture vocale en français");
    } catch (error) {
      console.warn("Voix indisponible :", error);
    }
  }

  function openDialogue() {
    const m = missionData[state.activeMission];

    state.dialogueOpen = true;
    state.currentDialogue = m.dialogue;

    text("speakerName", m.speaker);
    text("speakerAvatar", "♡");
    text("dialogueText", m.dialogue);
    text("dialogueVoiceStatus", "Dialogue en français");

    if (DOM.dialogueChoices) {
      DOM.dialogueChoices.replaceChildren();
    }

    if (state.settings.subtitles) {
      show("dialoguePanel");
    } else {
      show("dialoguePanel");
      if (DOM.dialogueText) DOM.dialogueText.textContent = "";
    }

    hide("interactionPrompt");
    speak(m.dialogue);
  }

  function closeDialogue() {
    state.dialogueOpen = false;
    hide("dialoguePanel");

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    updateInteractionPrompt();
  }

  function interact() {
    if (!state.started || !state.running || state.paused) return;

    if (state.dialogueOpen) {
      nextDialogue();
      return;
    }

    const playerPosition = state.player?.position;
    const npcPosition = state.npc?.position;

    if (!playerPosition || !npcPosition) {
      notify("Le monde 3D n'est pas encore prêt.");
      return;
    }

    const d = distance(playerPosition, npcPosition);

    if (d > 3.5) {
      const tp = state.target?.position;
      const dt = tp ? distance(playerPosition, tp) : Infinity;

      if (dt < 3.5) {
        openDialogue();
        return;
      }

      notify("Approchez-vous de Camille ou du repère lumineux.");
      return;
    }

    openDialogue();
  }

  function nextDialogue() {
    if (!state.dialogueOpen) return;

    closeDialogue();
    completeMission();
  }

  /* ==========================================================
     13. PROGRESSION DES MISSIONS
  ========================================================== */

  function completeMission() {
    const index = state.activeMission;

    if (!state.completed.includes(index)) {
      state.completed.push(index);
    }

    saveGame(true);
    updateMissionUI();

    text("completionTitle", "Mission accomplie !");
    text("completionMessage",
      `Vous avez terminé : ${missionData[index].title}`);
    text("completionProgress", `${state.completed.length} / ${TOTAL}`);

    state.running = false;
    hide("dialoguePanel");

    if (state.completed.length >= TOTAL) {
      show("endingScreen");
    } else {
      show("missionCompleteScreen");
    }
  }

  function goNextMission() {
    hide("missionCompleteScreen");

    if (state.completed.length >= TOTAL) {
      show("endingScreen");
      return;
    }

    // Avancer à la première mission non terminée.
    let next = state.activeMission + 1;

    while (next < TOTAL && state.completed.includes(next)) {
      next++;
    }

    if (next >= TOTAL) {
      next = state.completed.findIndex((_, i) => !state.completed.includes(i));
      if (next < 0) {
        show("endingScreen");
        return;
      }
    }

    state.activeMission = next;
    state.running = true;
    state.paused = false;

    show("gameScreen");
    updateMissionTarget();
    updateMissionUI();
    updateCamera();

    saveGame(true);
    notify(`Mission ${next + 1} : ${missionData[next].title}`);
  }

  /* ==========================================================
     14. DÉMARRAGE DU MOTEUR 3D
  ========================================================== */

  async function ensureWorld() {
    if (state.worldReady && state.engine && state.scene) {
      return true;
    }

    if (typeof BABYLON === "undefined") {
      throw new Error(
        "Babylon.js ne s'est pas chargé. Vérifiez votre connexion Internet et le CDN dans le HTML."
      );
    }

    if (!DOM.loveGameCanvas) {
      throw new Error("Le canvas #loveGameCanvas est absent du HTML.");
    }

    try {
      state.engine = new BABYLON.Engine(
        DOM.loveGameCanvas,
        true,
        {
          preserveDrawingBuffer: true,
          stencil: true,
          adaptToDeviceRatio: true
        }
      );

      createWorld();

      state.engine.runRenderLoop(() => {
        if (state.scene && state.running && !state.paused) {
          const now = performance.now();
          const dt = Math.min((now - (state.lastTime || now)) / 1000, 0.05);
          state.lastTime = now;

          updateMovement(dt);
          state.scene.render();
        } else if (state.scene) {
          state.scene.render();
        }
      });

      window.addEventListener("resize", () => {
        if (state.engine) state.engine.resize();
      });

      state.worldReady = true;
      applyQuality();
      return true;
    } catch (error) {
      console.error("Échec du moteur 3D :", error);

      try {
        state.engine?.dispose();
      } catch (_) {}

      state.engine = null;
      state.scene = null;
      state.worldReady = false;
      throw error;
    }
  }

  /* ==========================================================
     15. NOUVELLE AVENTURE / CONTINUER
  ========================================================== */

  async function startNewGame(startIndex = 0) {
    hideAllOverlays();
    hide("mainMenu");
    show("gameScreen");
    show("worldLoadingOverlay");
    text("worldLoadingText", "Préparation du monde 3D...");

    state.running = false;
    state.paused = false;
    state.started = true;
    state.completed = [];
    state.activeMission = clamp(Number(startIndex) || 0, 0, TOTAL - 1);

    try {
      await ensureWorld();

      if (!state.worldReady || !state.scene || !state.player) {
        throw new Error("Le monde 3D n'a pas pu être initialisé.");
      }

      state.player.position.set(0, 0.85, -5);
      state.yaw = Math.PI;
      state.pitch = 0.78;
      state.cameraDistance = 8;
      state.verticalVelocity = 0;
      state.onGround = true;

      updateMissionTarget();
      updateMissionUI();
      updateCamera();

      state.running = true;
      state.lastTime = performance.now();

      hide("worldLoadingOverlay");
      hide("errorScreen");
      DOM.loveGameCanvas?.focus({ preventScroll: true });

      saveGame(true);
      notify("Bienvenue dans Sur l'Amour en Action !");
    } catch (error) {
      hide("worldLoadingOverlay");
      showError(
        error?.message || "Une erreur inconnue empêche le démarrage du jeu."
      );
    }
  }

  async function continueGame() {
    const save = loadSave();

    if (!save) {
      notify("Aucune sauvegarde disponible. Lancez une nouvelle aventure.");
      updateContinueButton();
      return;
    }

    state.activeMission = save.activeMission;
    state.completed = save.completed;

    await startFromSave();
  }

  async function startFromSave() {
    hideAllOverlays();
    hide("mainMenu");
    show("gameScreen");
    show("worldLoadingOverlay");

    try {
      await ensureWorld();

      if (!state.worldReady || !state.player) {
        throw new Error("Le monde 3D n'est pas disponible.");
      }

      state.started = true;
      state.running = true;
      state.paused = false;
      state.player.position.set(0, 0.85, -5);

      updateMissionTarget();
      updateMissionUI();
      updateCamera();

      state.lastTime = performance.now();
      hide("worldLoadingOverlay");
      notify("Votre aventure a repris.");
    } catch (error) {
      hide("worldLoadingOverlay");
      showError(error?.message || "Impossible de reprendre la partie.");
    }
  }

  /* ==========================================================
     16. PAUSE, MENU ET ÉCRANS
  ========================================================== */

  function pauseGame() {
    if (!state.started || !state.running) return;

    state.running = false;
    state.paused = true;
    closeDialogue();
    show("pauseScreen");
    saveGame(true);
  }

  function resumeGame() {
    hide("pauseScreen");
    hide("missionsScreen");
    hide("settingsScreen");
    state.paused = false;
    state.running = true;
    state.lastTime = performance.now();
    show("gameScreen");
    updateCamera();
  }

  function returnToMenu() {
    saveGame(true);
    closeDialogue();
    state.running = false;
    state.paused = false;
    hideAllOverlays();
    hide("gameScreen");
    show("mainMenu");
    updateContinueButton();
  }

  function confirmReturn() {
    text("confirmationTitle", "Retour au menu");
    text(
      "confirmationMessage",
      "Votre progression sera sauvegardée. Voulez-vous quitter la partie actuelle ?"
    );

    state.confirmationAction = returnToMenu;
    show("confirmationScreen");
  }

  function openMissions() {
    renderMissions();
    show("missionsScreen");
  }

  function openSettings() {
    loadSettings();
    show("settingsScreen");
  }

  /* ==========================================================
     17. JOYSTICK TACTILE
  ========================================================== */

  function bindJoystick() {
    const base = DOM.joystickBase;
    const thumb = DOM.joystickThumb;

    if (!base || !thumb) return;

    const reset = () => {
      state.joystick.x = 0;
      state.joystick.z = 0;
      state.joystick.active = false;
      state.joystick.pointerId = null;
      thumb.style.transform = "translate(-50%, -50%)";
    };

    function move(e) {
      const r = base.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const max = Math.max(20, r.width * 0.32);

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const len = Math.hypot(dx, dy);
      const factor = len > max ? max / len : 1;
      const nx = dx * factor;
      const ny = dy * factor;

      state.joystick.x = nx / max;
      state.joystick.z = -ny / max;

      thumb.style.transform =
        `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
    }

    base.style.touchAction = "none";

    base.addEventListener("pointerdown", e => {
      e.preventDefault();
      state.joystick.active = true;
      state.joystick.pointerId = e.pointerId;

      try {
        base.setPointerCapture(e.pointerId);
      } catch (_) {}

      move(e);
    });

    base.addEventListener("pointermove", e => {
      if (!state.joystick.active) return;
      if (e.pointerId !== state.joystick.pointerId) return;
      move(e);
    });

    ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => {
      base.addEventListener(type, reset);
    });
  }

  /* ==========================================================
     18. CAMÉRA TACTILE : GLISSER ET PINCER
  ========================================================== */

  function bindCameraTouch() {
    const canvas = DOM.loveGameCanvas;
    if (!canvas) return;

    canvas.style.touchAction = "none";

    const pointers = new Map();
    let previousDistance = 0;

    canvas.addEventListener("pointerdown", e => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (_) {}

      if (pointers.size === 2) {
        const pts = [...pointers.values()];
        previousDistance = Math.hypot(
          pts[0].x - pts[1].x,
          pts[0].y - pts[1].y
        );
      }
    });

    canvas.addEventListener("pointermove", e => {
      if (!pointers.has(e.pointerId)) return;

      const previous = pointers.get(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size >= 2) {
        const pts = [...pointers.values()];
        const d = Math.hypot(
          pts[0].x - pts[1].x,
          pts[0].y - pts[1].y
        );

        if (previousDistance > 0 && d > 0) {
          state.cameraDistance = clamp(
            state.cameraDistance * previousDistance / d,
            4,
            16
          );
          updateCamera();
        }

        previousDistance = d;
        return;
      }

      const dx = e.clientX - previous.x;
      const dy = e.clientY - previous.y;

      state.yaw -= dx * 0.008 * state.sensitivity;
      state.pitch = clamp(
        state.pitch - dy * 0.006 * state.sensitivity,
        0.25,
        1.3
      );

      updateCamera();
    });

    const end = e => {
      pointers.delete(e.pointerId);
      previousDistance = 0;
    };

    ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => {
      canvas.addEventListener(type, end);
    });

    canvas.addEventListener("wheel", e => {
      state.cameraDistance = clamp(
        state.cameraDistance + Math.sign(e.deltaY) * 0.6,
        4,
        16
      );
      updateCamera();
      e.preventDefault();
    }, { passive: false });
  }

  /* ==========================================================
     19. BOUTONS ET CLAVIER
  ========================================================== */

  function bindEvents() {
    DOM.newGameButton?.addEventListener("click", () => startNewGame(0));
    DOM.continueGameButton?.addEventListener("click", continueGame);

    DOM.missionsMenuButton?.addEventListener("click", () => {
      renderMissions();
      show("missionsScreen");
    });

    DOM.creditsButton?.addEventListener("click", () => show("creditsScreen"));
    DOM.settingsButton?.addEventListener("click", openSettings);

    DOM.pauseButton?.addEventListener("click", pauseGame);
    DOM.openMissionsButton?.addEventListener("click", openMissions);
    DOM.closeMissionsButton?.addEventListener("click", () => hide("missionsScreen"));

    DOM.resumeButton?.addEventListener("click", resumeGame);
    DOM.pauseMissionsButton?.addEventListener("click", openMissions);
    DOM.saveGameButton?.addEventListener("click", () => saveGame(false));
    DOM.returnToMenuButton?.addEventListener("click", confirmReturn);

    DOM.closeSettingsButton?.addEventListener("click", () => hide("settingsScreen"));
    DOM.saveSettingsButton?.addEventListener("click", saveSettings);
    DOM.closeCreditsButton?.addEventListener("click", () => hide("creditsScreen"));

    DOM.interactionPrompt?.addEventListener("click", interact);
    DOM.talkButton?.addEventListener("click", interact);

    DOM.closeDialogueButton?.addEventListener("click", closeDialogue);
    DOM.nextDialogueButton?.addEventListener("click", nextDialogue);
    DOM.repeatDialogueButton?.addEventListener("click", () => speak(state.currentDialogue));

    DOM.nextMissionButton?.addEventListener("click", goNextMission);
    DOM.completionMenuButton?.addEventListener("click", returnToMenu);
    DOM.restartGameButton?.addEventListener("click", () => startNewGame(0));
    DOM.endingMenuButton?.addEventListener("click", returnToMenu);

    DOM.cancelConfirmationButton?.addEventListener("click", () => {
      state.confirmationAction = null;
      hide("confirmationScreen");
    });

    DOM.acceptConfirmationButton?.addEventListener("click", () => {
      hide("confirmationScreen");
      const action = state.confirmationAction;
      state.confirmationAction = null;
      if (typeof action === "function") action();
    });

    DOM.retryButton?.addEventListener("click", () => startNewGame(state.activeMission));
    DOM.errorMenuButton?.addEventListener("click", () => {
      hide("errorScreen");
      openMainMenu();
    });

    DOM.jumpButton?.addEventListener("pointerdown", e => {
      e.preventDefault();
      jump();
    });

    DOM.runButton?.addEventListener("pointerdown", e => {
      e.preventDefault();
      state.runningFast = true;
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach(type => {
      DOM.runButton?.addEventListener(type, () => state.runningFast = false);
    });

    window.addEventListener("keydown", e => {
      state.keys[e.code] = true;

      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)
      ) {
        e.preventDefault();
      }

      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        state.runningFast = true;
      }

      if (e.code === "KeyE" || e.code === "Enter") {
        if (state.dialogueOpen) nextDialogue();
        else interact();
      }

      if (e.code === "Space") jump();

      if (e.code === "Escape") {
        if (state.dialogueOpen) closeDialogue();
        else if (state.running) pauseGame();
        else if (state.paused) resumeGame();
      }
    });

    window.addEventListener("keyup", e => {
      state.keys[e.code] = false;

      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        state.runningFast = false;
      }
    });

    bindJoystick();
    bindCameraTouch();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && state.running) {
        saveGame(true);
        pauseGame();
      }
    });
  }

  /* ==========================================================
     20. INITIALISATION
  ========================================================== */

  function initialize() {
    bindEvents();
    loadSettings();
    updateContinueButton();
    renderMissions();

    text("loadingMessage", "Préparation de votre histoire...");
    text("loadingPercent", "100 %");
    setWidth("loadingProgress", 100);

    setTimeout(() => {
      hide("loadingScreen");
      show("mainMenu");
    }, 450);

    window.addEventListener("error", event => {
      console.error(
        "[FOBAS Love] Erreur JavaScript :",
        event.error || event.message
      );
    });

    window.addEventListener("unhandledrejection", event => {
      console.error("[FOBAS Love] Promesse rejetée :", event.reason);
    });
  }

  /* ==========================================================
     21. API DE TEST
  ========================================================== */

  window.FOBASLove = {
    start: startNewGame,
    continue: continueGame,
    save: saveGame,
    pause: pauseGame,
    resume: resumeGame,
    interact,
    nextMission: goNextMission,
    getState: () => ({
      activeMission: state.activeMission,
      completed: [...state.completed],
      worldReady: state.worldReady,
      running: state.running,
      paused: state.paused
    })
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();













