/* ============================================================
   FOBAS INTERACTIVE — SUR L'AMOUR EN ACTION
   Fichier : appamourfobas.js
   Version : 3.1.0 — démarrage 3D renforcé
   Babylon.js doit être chargé par le fichier HTML.
   ============================================================ */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const TOTAL = 35;
  const SAVE_KEY = "FOBAS_LOVE_ACTION_SAVE_V3";
  const SETTINGS_KEY = "FOBAS_LOVE_ACTION_SETTINGS_V3";
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const missionData = [
    { title: "Un regard inattendu", objective: "Approchez-vous de Camille et faites connaissance.", speaker: "Camille", dialogue: "Bonjour ! Quel plaisir de vous rencontrer. Je m'appelle Camille. Et vous ?" },
    { title: "Un sourire sincère", objective: "Retrouvez Camille près du jardin et échangez un sourire.", speaker: "Camille", dialogue: "Votre sourire rend cette journée plus lumineuse." },
    { title: "Le premier échange", objective: "Parlez de vos centres d'intérêt.", speaker: "Camille", dialogue: "J'aime les promenades, la musique et les conversations sincères." },
    { title: "Une promenade au parc", objective: "Rejoignez le petit kiosque au centre du parc.", speaker: "Camille", dialogue: "Marchons un peu. Le jardin est magnifique aujourd'hui." },
    { title: "Une fleur pour le cœur", objective: "Approchez-vous de la fleur près du kiosque.", speaker: "Camille", dialogue: "Une petite fleur peut porter un très beau message." },
    { title: "Une histoire à partager", objective: "Retrouvez Camille et écoutez son histoire.", speaker: "Camille", dialogue: "Chaque rencontre peut ouvrir un nouveau chapitre." },
    { title: "La confiance naissante", objective: "Revenez parler à Camille pour renforcer la confiance.", speaker: "Camille", dialogue: "La confiance grandit avec l'écoute et la sincérité." },
    { title: "Un café chaleureux", objective: "Rejoignez la terrasse du café.", speaker: "Camille", dialogue: "Un café et une conversation, voilà un joli moment." },
    { title: "Des rêves communs", objective: "Parlez avec Camille de vos rêves.", speaker: "Camille", dialogue: "Les rêves deviennent plus forts quand on les partage." },
    { title: "Une mélodie douce", objective: "Approchez-vous du coin musical.", speaker: "Camille", dialogue: "Cette mélodie me rappelle les beaux moments de la vie." },
    { title: "Le chemin des souvenirs", objective: "Parcourez le sentier jusqu'au banc.", speaker: "Camille", dialogue: "J'aime les endroits qui nous invitent à réfléchir." },
    { title: "Une promesse de respect", objective: "Parlez à Camille du respect mutuel.", speaker: "Camille", dialogue: "Le respect est une base essentielle de toute relation." },
    { title: "Le jardin secret", objective: "Retrouvez Camille près des fleurs roses.", speaker: "Camille", dialogue: "Ce jardin est mon endroit préféré pour me ressourcer." },
    { title: "Un moment de vérité", objective: "Échangez avec Camille en toute sincérité.", speaker: "Camille", dialogue: "Dire la vérité avec bienveillance demande du courage." },
    { title: "La lettre oubliée", objective: "Approchez-vous de la lettre posée sur le banc.", speaker: "Camille", dialogue: "Cette lettre contient des mots que je n'avais jamais osé dire." },
    { title: "Une écoute attentive", objective: "Parlez à Camille et écoutez jusqu'au bout.", speaker: "Camille", dialogue: "Merci de m'écouter sans me juger." },
    { title: "Un geste de bonté", objective: "Rejoignez le point de rencontre près du kiosque.", speaker: "Camille", dialogue: "Les petits gestes de bonté ont parfois le plus grand effet." },
    { title: "La pluie et l'abri", objective: "Retrouvez Camille sous le pavillon.", speaker: "Camille", dialogue: "Même les jours gris peuvent devenir de beaux souvenirs." },
    { title: "Un nouveau départ", objective: "Parlez avec Camille de ce qui vient ensuite.", speaker: "Camille", dialogue: "Chaque jour nous donne la possibilité de recommencer." },
    { title: "Le pont des décisions", objective: "Traversez le chemin jusqu'au pont.", speaker: "Camille", dialogue: "Nos choix dessinent peu à peu notre avenir." },
    { title: "Le courage de parler", objective: "Retrouvez Camille près du pont et engagez la conversation.", speaker: "Camille", dialogue: "Merci d'avoir le courage de parler avec ton cœur." },
    { title: "Un souvenir précieux", objective: "Approchez-vous du banc des souvenirs.", speaker: "Camille", dialogue: "Certains instants restent précieux longtemps." },
    { title: "La fête du jardin", objective: "Rejoignez la place décorée au centre du jardin.", speaker: "Camille", dialogue: "La joie se partage et devient encore plus belle." },
    { title: "Une danse improvisée", objective: "Approchez-vous de Camille et proposez une danse.", speaker: "Camille", dialogue: "Pourquoi pas ? Laissons-nous porter par la musique." },
    { title: "Le cadeau symbolique", objective: "Retrouvez le petit cadeau près des fleurs.", speaker: "Camille", dialogue: "Ce n'est pas la valeur du cadeau, mais l'intention qui compte." },
    { title: "Le choix du cœur", objective: "Parlez à Camille de vos priorités.", speaker: "Camille", dialogue: "Un choix sincère doit respecter les deux personnes." },
    { title: "Les mots qui réparent", objective: "Retrouvez Camille pour clarifier un malentendu.", speaker: "Camille", dialogue: "Les mots doux peuvent réparer bien des choses." },
    { title: "La force du pardon", objective: "Parlez à Camille du pardon.", speaker: "Camille", dialogue: "Pardonner ne signifie pas oublier, mais choisir d'avancer." },
    { title: "Une vision partagée", objective: "Rejoignez le belvédère du jardin.", speaker: "Camille", dialogue: "J'espère que nous garderons toujours cette honnêteté." },
    { title: "L'avenir en confiance", objective: "Retrouvez Camille près du pavillon.", speaker: "Camille", dialogue: "L'avenir se construit pas à pas, avec confiance." },
    { title: "Le chemin des étoiles", objective: "Approchez-vous du point lumineux dans le jardin.", speaker: "Camille", dialogue: "Même une petite lumière peut guider notre chemin." },
    { title: "Un engagement sincère", objective: "Parlez à Camille de votre engagement.", speaker: "Camille", dialogue: "Un engagement a du sens quand il est libre et sincère." },
    { title: "La célébration des liens", objective: "Rejoignez la place centrale.", speaker: "Camille", dialogue: "Célébrons les liens que nous avons appris à construire." },
    { title: "Une dernière promenade", objective: "Retrouvez Camille au bout du sentier.", speaker: "Camille", dialogue: "Je suis heureuse de tout ce que nous avons partagé." },
    { title: "Sur l'amour en action", objective: "Parlez une dernière fois à Camille pour terminer l'aventure.", speaker: "Camille", dialogue: "L'amour en action se montre par le respect, l'écoute et les gestes du quotidien. Merci pour cette aventure !" }
  ];

  const DOM = {};
  [
    "loadingScreen", "loadingMessage", "loadingProgress", "loadingPercent",
    "mainMenu", "settingsButton", "newGameButton", "continueGameButton",
    "missionsMenuButton", "creditsButton", "saveStatus", "gameScreen",
    "gameWorld", "loveGameCanvas", "worldLoadingOverlay", "worldLoadingText",
    "gameTopBar", "pauseButton", "missionNumber", "missionTitle",
    "openMissionsButton", "objectivePanel", "objectiveText",
    "objectiveProgressBar", "objectiveProgressText", "interactionPrompt",
    "interactionIcon", "interactionText", "dialoguePanel", "speakerAvatar",
    "speakerName", "dialogueText", "dialogueChoices", "dialogueVoiceStatus",
    "closeDialogueButton", "repeatDialogueButton", "nextDialogueButton",
    "touchControls", "movementControl", "joystickBase", "joystickThumb",
    "cameraControlHint", "runButton", "jumpButton", "talkButton",
    "gameNotification", "savingIndicator", "missionsScreen",
    "closeMissionsButton", "missionsSummary", "overallProgressBar",
    "missionsList", "pauseScreen", "resumeButton", "pauseMissionsButton",
    "saveGameButton", "returnToMenuButton", "settingsScreen",
    "closeSettingsButton", "voiceEnabled", "musicEnabled", "subtitlesEnabled",
    "qualitySelect", "sensitivityRange", "saveSettingsButton", "creditsScreen",
    "closeCreditsButton", "missionCompleteScreen", "completionTitle",
    "completionMessage", "completionProgress", "nextMissionButton",
    "completionMenuButton", "endingScreen", "restartGameButton",
    "endingMenuButton", "confirmationScreen", "confirmationTitle",
    "confirmationMessage", "cancelConfirmationButton",
    "acceptConfirmationButton", "errorScreen", "errorTitle", "errorMessage",
    "retryButton", "errorMenuButton"
  ].forEach(id => DOM[id] = $(id));

  const state = {
    activeMission: 0,
    completed: [],
    running: false,
    paused: false,
    started: false,
    worldReady: false,
    dialogueOpen: false,
    dialogueStep: 0,
    currentSpeaker: "Camille",
    currentDialogue: "",
    confirmationAction: null,
    engine: null,
    scene: null,
    camera: null,
    player: null,
    npc: null,
    target: null,
    targetRing: null,
    ground: null,
    meshes: [],
    keys: Object.create(null),
    joystick: { x: 0, z: 0, active: false, pointerId: null },
    cameraDrag: { active: false, x: 0, y: 0, pointerId: null },
    pinch: null,
    yaw: Math.PI,
    pitch: 0.85,
    cameraDistance: 8,
    sensitivity: 1,
    isRunning: false,
    verticalVelocity: 0,
    onGround: true,
    lastFrame: 0,
    lastSave: 0,
    noticeTimer: null,
    settings: { voice: true, music: true, subtitles: true, quality: "medium", sensitivity: 1 }
  };

  const positions = [
    [0, 0], [7, 2], [-7, 2], [2, 8], [-3, -7],
    [10, -5], [-10, -4], [4, -12], [13, 5], [-13, 7],
    [0, 14], [16, -9], [-16, -9], [18, 8], [-18, 9],
    [0, -18], [7, 19], [-8, 20], [21, 0], [-21, -1],
    [22, 12], [-22, 13], [0, 24], [11, -23], [-12, -23],
    [26, -10], [-26, -11], [27, 13], [-27, 14], [0, -28],
    [15, 28], [-15, 29], [30, 0], [-30, 0], [0, 32]
  ];

  function show(elOrId) {
    const el = typeof elOrId === "string" ? $(elOrId) : elOrId;
    if (el) el.classList.remove("hidden");
  }

  function hide(elOrId) {
    const el = typeof elOrId === "string" ? $(elOrId) : elOrId;
    if (el) el.classList.add("hidden");
  }

  function setText(id, value) {
    if (DOM[id]) DOM[id].textContent = String(value ?? "");
  }

  function notify(message, duration = 2600) {
    setText("gameNotification", message);
    show("gameNotification");
    clearTimeout(state.noticeTimer);
    state.noticeTimer = setTimeout(() => hide("gameNotification"), duration);
  }

  function setLoading(percent, message) {
    const p = clamp(Math.round(percent), 0, 100);
    if (DOM.loadingProgress) DOM.loadingProgress.style.width = p + "%";
    setText("loadingPercent", p + " %");
    if (message) setText("loadingMessage", message);
  }

  function showError(message, title = "Impossible de démarrer le jeu") {
    setText("errorTitle", title);
    setText("errorMessage", message);
    hide("loadingScreen");
    hide("mainMenu");
    hide("gameScreen");
    show("errorScreen");
  }

  function hideAllOverlays() {
    [
      "missionsScreen", "pauseScreen", "settingsScreen", "creditsScreen",
      "missionCompleteScreen", "endingScreen", "confirmationScreen", "errorScreen"
    ].forEach(hide);
  }

  function openMainMenu() {
    state.running = false;
    state.paused = false;
    hideAllOverlays();
    hide("gameScreen");
    show("mainMenu");
    setText("saveStatus", loadSave() ? "Progression locale disponible" : "Sauvegarde locale prête");
    updateContinueButton();
  }

  function safeRead(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function loadSave() {
    const data = safeRead(SAVE_KEY);
    if (!data || !Array.isArray(data.completed)) return null;
    return data;
  }

  function saveGame(silent = false) {
    try {
      const payload = {
        version: 3,
        activeMission: state.activeMission,
        completed: [...new Set(state.completed)].filter(n => Number.isInteger(n) && n >= 0 && n < TOTAL),
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      state.lastSave = Date.now();
      setText("saveStatus", "Progression sauvegardée");
      if (!silent) {
        show("savingIndicator");
        setTimeout(() => hide("savingIndicator"), 900);
        notify("Progression sauvegardée sur cet appareil.");
      }
      updateContinueButton();
      return true;
    } catch (_) {
      if (!silent) notify("Sauvegarde indisponible : vérifiez l'espace de stockage du navigateur.");
      return false;
    }
  }

  function updateContinueButton() {
    if (DOM.continueGameButton) DOM.continueGameButton.disabled = !loadSave();
  }

  function loadSettings() {
    const s = safeRead(SETTINGS_KEY);
    if (s && typeof s === "object") state.settings = { ...state.settings, ...s };
    state.sensitivity = clamp(Number(state.settings.sensitivity) || 1, 0.5, 2);
    if (DOM.voiceEnabled) DOM.voiceEnabled.checked = !!state.settings.voice;
    if (DOM.musicEnabled) DOM.musicEnabled.checked = !!state.settings.music;
    if (DOM.subtitlesEnabled) DOM.subtitlesEnabled.checked = !!state.settings.subtitles;
    if (DOM.qualitySelect) DOM.qualitySelect.value = state.settings.quality || "medium";
    if (DOM.sensitivityRange) DOM.sensitivityRange.value = String(state.sensitivity);
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
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings)); } catch (_) {}
    applyQuality();
    hide("settingsScreen");
    notify("Paramètres enregistrés.");
  }

  function updateMissionUI() {
    const index = clamp(state.activeMission, 0, TOTAL - 1);
    const m = missionData[index];
    setText("missionNumber", `MISSION ${String(index + 1).padStart(2, "0")} / ${TOTAL}`);
    setText("missionTitle", m.title);
    setText("objectiveText", m.objective);
    setText("objectiveProgressText", state.completed.includes(index) ? "1 / 1" : "0 / 1");
    if (DOM.objectiveProgressBar) {
      DOM.objectiveProgressBar.style.width = state.completed.includes(index) ? "100%" : "0%";
    }
    renderMissions();
  }

  function renderMissions() {
    if (!DOM.missionsList) return;
    DOM.missionsList.replaceChildren();
    const count = state.completed.length;
    setText("missionsSummary", `${count} mission${count > 1 ? "s" : ""} terminée${count > 1 ? "s" : ""} sur ${TOTAL}`);
    if (DOM.overallProgressBar) DOM.overallProgressBar.style.width = (count / TOTAL * 100) + "%";

    missionData.forEach((m, i) => {
      const done = state.completed.includes(i);
      const current = i === state.activeMission && !done;
      const item = document.createElement("button");
      item.type = "button";
      item.className = "mission-list-item";
      item.style.cssText =
        "display:flex;gap:12px;align-items:center;text-align:left;width:100%;" +
        "padding:12px;margin:5px 0;border:1px solid rgba(220,180,210,.22);" +
        "border-radius:12px;background:" +
        (done ? "rgba(62,150,105,.16)" : current ? "rgba(205,115,165,.18)" : "rgba(255,255,255,.04)") +
        ";color:inherit;cursor:pointer";

      const number = document.createElement("span");
      number.textContent = done ? "✓" : String(i + 1).padStart(2, "0");
      number.style.cssText = "font-weight:800;min-width:32px";

      const body = document.createElement("span");
      body.style.cssText = "display:flex;flex-direction:column;gap:4px;min-width:0";

      const title = document.createElement("strong");
      title.textContent = m.title;

      const desc = document.createElement("small");
      desc.textContent = done ? "Terminée" : current ? "Mission actuelle" : "Disponible — choisissez pour la commencer";

      body.append(title, desc);
      item.append(number, body);

      item.addEventListener("click", event => {
        event?.preventDefault?.();
        try {
          hide("missionsScreen");
          hide("mainMenu");
          hide("errorScreen");
          show("gameScreen");
          show("worldLoadingOverlay");
          setText("worldLoadingText", "Ouverture de la mission et préparation du monde 3D...");

          if (!state.worldReady || !state.scene || !state.player) ensureBabylon();

          if (!state.worldReady || !state.scene || !state.player) {
            throw new Error("Le monde 3D n'a pas pu être initialisé. Vérifiez que Babylon.js est chargé.");
          }

          state.completed = state.completed.filter(n => Number.isInteger(n) && n >= 0 && n < TOTAL);
          beginMission(i);
          hide("worldLoadingOverlay");
          notify(`Mission ${i + 1} : ${m.title}`);
        } catch (err) {
          console.error("[FOBAS Love] Ouverture de mission impossible :", err);
          showError(err?.message || "Impossible d'ouvrir cette mission.");
        }
      });

      DOM.missionsList.appendChild(item);
    });
  }

  function ensureBabylon() {
    if (!window.BABYLON) {
      throw new Error("Babylon.js n'est pas disponible. Vérifiez la connexion Internet et les scripts CDN dans le HTML.");
    }

    const canvas = DOM.loveGameCanvas;
    if (!canvas) throw new Error("Canvas #loveGameCanvas introuvable dans le HTML.");

    // Assurer que le canvas possède une zone visible avant de créer le moteur.
    if (DOM.gameScreen) DOM.gameScreen.classList.remove("hidden");
    if (DOM.gameWorld) {
      DOM.gameWorld.style.width = DOM.gameWorld.style.width || "100%";
      DOM.gameWorld.style.minHeight = DOM.gameWorld.style.minHeight || "320px";
    }
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = canvas.style.height || "100%";
    canvas.style.touchAction = "none";

    const engineAlive = !!state.engine &&
      !(typeof state.engine.isDisposed === "function" ? state.engine.isDisposed() : state.engine.isDisposed);
    const sceneAlive = !!state.scene &&
      !(typeof state.scene.isDisposed === "function" ? state.scene.isDisposed() : state.scene.isDisposed);

    // Ne réutiliser le moteur que si la scène et le monde sont réellement prêts.
    if (engineAlive && sceneAlive && state.worldReady && state.player && state.npc && state.camera) {
      try { state.engine.resize(); } catch (_) {}
      return true;
    }

    // Nettoyer un moteur partiellement créé après une erreur précédente.
    if (state.engine || state.scene) {
      try { if (state.scene && sceneAlive) state.scene.dispose(); } catch (_) {}
      try { if (state.engine && engineAlive) state.engine.dispose(); } catch (_) {}
      state.engine = null;
      state.scene = null;
      state.camera = null;
      state.player = null;
      state.npc = null;
      state.target = null;
      state.targetRing = null;
      state.ground = null;
      state.meshes = [];
      state.worldReady = false;
    }

    const B = window.BABYLON;
    const quality = state.settings.quality || "medium";
    state.engine = new B.Engine(canvas, quality !== "low", {
      preserveDrawingBuffer: false,
      stencil: false,
      powerPreference: quality === "high" ? "high-performance" : "low-power",
      adaptToDeviceRatio: true
    });

    state.scene = new B.Scene(state.engine);
    state.scene.clearColor = new B.Color4(0.035, 0.025, 0.07, 1);
    state.scene.collisionsEnabled = false;
    state.scene.skipPointerMovePicking = true;

    state.camera = new B.FreeCamera("loveCamera", new B.Vector3(0, 5, -8), state.scene);
    state.camera.minZ = 0.1;
    state.camera.fov = 0.82;
    state.camera.inputs.clear();

    const hemi = new B.HemisphericLight("ambientLight", new B.Vector3(0, 1, 0), state.scene);
    hemi.intensity = quality === "low" ? 0.8 : 1.05;

    const sun = new B.DirectionalLight("warmSun", new B.Vector3(-0.4, -1, 0.3), state.scene);
    sun.position = new B.Vector3(12, 22, -10);
    sun.intensity = 1.0;

    const fill = new B.PointLight("heartGlow", new B.Vector3(0, 5, 0), state.scene);
    fill.diffuse = new B.Color3(1, 0.3, 0.58);
    fill.intensity = 0.6;
    fill.range = 35;

    createEnvironment();
    createPlayer();
    createNPC();
    createTarget(0);
    applyQuality();

    state.engine.runRenderLoop(() => {
      const scene = state.scene;
      if (!scene || (typeof scene.isDisposed === "function" ? scene.isDisposed() : scene.isDisposed)) return;

      const now = performance.now();
      const dt = Math.min((now - (state.lastFrame || now)) / 1000, 0.05);
      state.lastFrame = now;

      if (state.running && !state.paused) updateGame(dt);
      scene.render();
    });

    window.addEventListener("resize", resizeEngine);
    state.worldReady = true;

    // Forcer un redimensionnement après que le navigateur a affiché le canvas.
    try { state.engine.resize(); } catch (_) {}
    return true;
  }

  function resizeEngine() {
    if (state.engine &&
        !(typeof state.engine.isDisposed === "function" ? state.engine.isDisposed() : state.engine.isDisposed)) {
      try { state.engine.resize(); } catch (_) {}
    }
  }

  function material(name, color, emissive = null) {
    const B = window.BABYLON;
    const mat = new B.StandardMaterial(name, state.scene);
    mat.diffuseColor = B.Color3.FromHexString(color);
    if (emissive) mat.emissiveColor = B.Color3.FromHexString(emissive);
    mat.specularColor = new B.Color3(0.25, 0.22, 0.3);
    return mat;
  }

  function mesh(meshObj, mat) {
    if (mat) meshObj.material = mat;
    state.meshes.push(meshObj);
    return meshObj;
  }

  function createEnvironment() {
    const B = window.BABYLON;
    const scene = state.scene;

    const ground = mesh(
      B.MeshBuilder.CreateGround("romanticGarden", { width: 100, height: 100, subdivisions: 2 }, scene),
      material("velvetGrass", "#355c4c")
    );
    ground.position.y = -0.08;
    state.ground = ground;

    const path = mesh(
      B.MeshBuilder.CreateGround("centralPath", { width: 5, height: 62 }, scene),
      material("warmStonePath", "#bda99a")
    );
    path.position.y = -0.035;
    path.rotation.y = Math.PI / 2;

    const pond = mesh(
      B.MeshBuilder.CreateCylinder("pond", { diameter: 12, height: 0.12, tessellation: 48 }, scene),
      material("pondWater", "#387f91", "#12323e")
    );
    pond.position.set(-13, -0.01, -10);
    pond.scaling.z = 0.68;

    const trunkMat = material("treeTrunk", "#76503b");
    const leafMats = [
      material("leafOne", "#2e7653"),
      material("leafTwo", "#3d875b"),
      material("leafThree", "#548f61")
    ];

    for (let i = 0; i < 52; i++) {
      const angle = i * 2.399963;
      const radius = 12 + (i % 7) * 2.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const trunk = mesh(
        B.MeshBuilder.CreateCylinder("treeTrunk" + i, {
          height: 1.9 + (i % 3) * 0.3,
          diameterTop: 0.22,
          diameterBottom: 0.38,
          tessellation: 7
        }, scene),
        trunkMat
      );
      trunk.position.set(x, 0.9, z);

      const crown = mesh(
        B.MeshBuilder.CreateSphere("treeCrown" + i, {
          diameter: 2.1 + (i % 3) * 0.35,
          segments: 7
        }, scene),
        leafMats[i % leafMats.length]
      );
      crown.position.set(x, 2.35 + (i % 3) * 0.25, z);
    }

    const flowerMats = [
      material("pinkFlowers", "#e98bbd", "#6b284f"),
      material("whiteFlowers", "#fff0d8", "#63503e"),
      material("purpleFlowers", "#b6a0ff", "#45356e")
    ];

    for (let i = 0; i < 72; i++) {
      const a = i * 2.4;
      const r = 5.5 + (i % 6) * 2.8;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;

      const stem = mesh(
        B.MeshBuilder.CreateCylinder("flowerStem" + i, {
          height: 0.45, diameter: 0.035, tessellation: 5
        }, scene),
        trunkMat
      );
      stem.position.set(x, 0.22, z);

      const bloom = mesh(
        B.MeshBuilder.CreateSphere("flowerBloom" + i, { diameter: 0.22, segments: 6 }, scene),
        flowerMats[i % flowerMats.length]
      );
      bloom.position.set(x, 0.49, z);
    }

    const wood = material("polishedWood", "#815344");
    const gold = material("warmGold", "#d9b36b", "#4e3215");

    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 0.4;
      const x = Math.cos(a) * 8;
      const z = Math.sin(a) * 8;

      const seat = mesh(
        B.MeshBuilder.CreateBox("gardenBench" + i, { width: 2.1, height: 0.18, depth: 0.62 }, scene),
        wood
      );
      seat.position.set(x, 0.65, z);
      seat.rotation.y = -a;

      for (let k = -1; k <= 1; k += 2) {
        const leg = mesh(
          B.MeshBuilder.CreateBox("benchLeg" + i + k, { width: 0.12, height: 0.65, depth: 0.12 }, scene),
          gold
        );
        leg.position.set(x + Math.cos(a) * k * 0.72, 0.32, z + Math.sin(a) * k * 0.72);
      }
    }

    const kioskX = 4;
    const kioskZ = 4;
    const pillarMat = material("kioskPillars", "#f2d9c5");

    for (const x of [-1.8, 1.8]) {
      for (const z of [-1.8, 1.8]) {
        const pillar = mesh(
          B.MeshBuilder.CreateCylinder("kioskPillar", {
            height: 3.2, diameter: 0.18, tessellation: 10
          }, scene),
          pillarMat
        );
        pillar.position.set(kioskX + x, 1.6, kioskZ + z);
      }
    }

    const roof = mesh(
      B.MeshBuilder.CreateCylinder("kioskRoof", {
        height: 0.25, diameter: 5.5, tessellation: 8
      }, scene),
      material("kioskRoofMat", "#9b4f79")
    );
    roof.position.set(kioskX, 3.25, kioskZ);
    roof.rotation.y = Math.PI / 8;

    for (let i = 0; i < 9; i++) {
      const lantern = mesh(
        B.MeshBuilder.CreateSphere("gardenLantern" + i, { diameter: 0.24, segments: 8 }, scene),
        gold
      );
      lantern.position.set(Math.cos(i * 2.4) * 10, 1.9, Math.sin(i * 2.4) * 10);
    }

    const archMat = material("heartArch", "#a9507c", "#391326");

    const arch1 = mesh(
      B.MeshBuilder.CreateBox("archLeft", { width: 0.3, height: 3.1, depth: 0.3 }, scene),
      archMat
    );
    arch1.position.set(0, 1.55, 17);

    const arch2 = mesh(
      B.MeshBuilder.CreateBox("archRight", { width: 0.3, height: 3.1, depth: 0.3 }, scene),
      archMat
    );
    arch2.position.set(2.4, 1.55, 17);

    const archTop = mesh(
      B.MeshBuilder.CreateBox("archTop", { width: 2.7, height: 0.3, depth: 0.3 }, scene),
      archMat
    );
    archTop.position.set(1.2, 3.05, 17);

    const heart = mesh(
      B.MeshBuilder.CreateSphere("archHeart", { diameter: 0.75, segments: 12 }, scene),
      material("archHeartGlow", "#ff80b5", "#b82f70")
    );
    heart.position.set(1.2, 3.7, 17);
  }

  function createPlayer() {
    const B = window.BABYLON;
    const scene = state.scene;
    const root = new B.TransformNode("playerRoot", scene);

    const skin = material("playerSkin", "#d9a17e");
    const clothes = material("playerClothes", "#384d8a");
    const hair = material("playerHair", "#30252b");

    const body = mesh(
      B.MeshBuilder.CreateCapsule
        ? B.MeshBuilder.CreateCapsule("playerBody", { height: 1.45, radius: 0.34, tessellation: 10 }, scene)
        : B.MeshBuilder.CreateCylinder("playerBody", { height: 1.45, diameter: 0.68, tessellation: 10 }, scene),
      clothes
    );
    body.parent = root;
    body.position.y = 1.0;

    const head = mesh(
      B.MeshBuilder.CreateSphere("playerHead", { diameter: 0.62, segments: 12 }, scene),
      skin
    );
    head.parent = root;
    head.position.y = 1.95;

    const hairCap = mesh(
      B.MeshBuilder.CreateSphere("playerHair", { diameter: 0.65, segments: 10 }, scene),
      hair
    );
    hairCap.parent = root;
    hairCap.position.y = 2.12;
    hairCap.scaling.y = 0.58;

    const legMat = material("playerLegs", "#242b4a");

    for (const side of [-1, 1]) {
      const leg = mesh(
        B.MeshBuilder.CreateCylinder("playerLeg" + side, { height: 0.72, diameter: 0.2, tessellation: 8 }, scene),
        legMat
      );
      leg.parent = root;
      leg.position.set(side * 0.18, 0.42, 0);

      const arm = mesh(
        B.MeshBuilder.CreateCylinder("playerArm" + side, { height: 0.8, diameter: 0.15, tessellation: 8 }, scene),
        skin
      );
      arm.parent = root;
      arm.position.set(side * 0.43, 1.12, 0);
      arm.rotation.z = side * -0.18;
    }

    root.position.set(0, 0, -4);
    state.player = root;
  }

  function createNPC() {
    const B = window.BABYLON;
    const scene = state.scene;
    const root = new B.TransformNode("camilleRoot", scene);

    const skin = material("camilleSkin", "#edbd9f");
    const dress = material("camilleDress", "#c85c91");
    const hair = material("camilleHair", "#55332e");

    const body = mesh(
      B.MeshBuilder.CreateCylinder("camilleBody", {
        height: 1.35, diameterTop: 0.48, diameterBottom: 0.82, tessellation: 12
      }, scene),
      dress
    );
    body.parent = root;
    body.position.y = 0.9;

    const head = mesh(
      B.MeshBuilder.CreateSphere("camilleHead", { diameter: 0.58, segments: 12 }, scene),
      skin
    );
    head.parent = root;
    head.position.y = 1.85;

    const hairBack = mesh(
      B.MeshBuilder.CreateSphere("camilleHair", { diameter: 0.68, segments: 10 }, scene),
      hair
    );
    hairBack.parent = root;
    hairBack.position.set(0, 2.02, 0.08);
    hairBack.scaling.y = 0.7;

    for (const side of [-1, 1]) {
      const strand = mesh(
        B.MeshBuilder.CreateSphere("camilleHairStrand" + side, { diameter: 0.22, segments: 8 }, scene),
        hair
      );
      strand.parent = root;
      strand.position.set(side * 0.27, 1.75, 0.02);
      strand.scaling.y = 1.7;

      const arm = mesh(
        B.MeshBuilder.CreateCylinder("camilleArm" + side, { height: 0.72, diameter: 0.13, tessellation: 8 }, scene),
        skin
      );
      arm.parent = root;
      arm.position.set(side * 0.37, 1.03, 0);
      arm.rotation.z = side * 0.15;
    }

    root.position.set(2, 0, 1);
    state.npc = root;
  }

  function createTarget(index) {
    if (!state.scene) throw new Error("La scène 3D n'est pas prête.");

    const B = window.BABYLON;
    const p = positions[index % positions.length];
    const isNpcMission = index < 3 || index % 3 === 0 || index === TOTAL - 1;

    if (state.target) {
      try { state.target.dispose(false, true); } catch (_) {}
    }
    if (state.targetRing) {
      try { state.targetRing.dispose(false, true); } catch (_) {}
    }

    state.targetRing = null;

    if (isNpcMission) {
      state.target = new B.TransformNode("missionTarget", state.scene);
      state.target.position.set(2 + p[0] * 0.65, 0, 1 + p[1] * 0.65);
      if (state.npc) state.npc.position.copyFrom(state.target.position);

      state.targetRing = mesh(
        B.MeshBuilder.CreateTorus("npcMissionRing" + index, {
          diameter: 1.5, thickness: 0.08, tessellation: 24
        }, state.scene),
        material("npcRingMat" + index, "#ffb4d8", "#8c315c")
      );
      state.targetRing.position.set(state.target.position.x, 0.08, state.target.position.z);
    } else {
      const marker = mesh(
        B.MeshBuilder.CreateSphere("missionMarker" + index, { diameter: 0.8, segments: 12 }, state.scene),
        material("missionMarkerMat" + index, "#ff83c2", "#a62e6d")
      );
      marker.position.set(p[0] * 0.65, 1.15, p[1] * 0.65);

      const glow = mesh(
        B.MeshBuilder.CreateTorus("missionMarkerRing" + index, {
          diameter: 1.5, thickness: 0.09, tessellation: 24
        }, state.scene),
        material("markerRingMat" + index, "#ffe2f0", "#e46fa8")
      );
      glow.position.set(marker.position.x, 0.08, marker.position.z);

      state.target = marker;
      state.targetRing = glow;
    }
  }

  function applyQuality() {
    if (!state.scene || !state.engine || !window.BABYLON) return;

    const q = state.settings.quality || "medium";
    const priorities = window.BABYLON.ScenePerformancePriority;

    // Toutes les versions de Babylon.js n'exposent pas ScenePerformancePriority.
    if (priorities) {
      const priority = q === "high"
        ? (priorities.Intermediate ?? priorities.BackwardCompatible)
        : priorities.BackwardCompatible;

      if (priority !== undefined) {
        try { state.scene.performancePriority = priority; } catch (_) {}
      }
    }

    state.scene.skipPointerMovePicking = q === "low";

    try {
      state.engine.setHardwareScalingLevel(q === "high" ? 1 : q === "low" ? 1.65 : 1.25);
    } catch (_) {}

    resizeEngine();
  }

  function updateCamera() {
    if (!state.player || !state.camera || !window.BABYLON) return;

    const B = window.BABYLON;
    const p = state.player.position;
    const d = state.cameraDistance;
    const x = p.x + Math.sin(state.yaw) * d * Math.cos(state.pitch);
    const z = p.z + Math.cos(state.yaw) * d * Math.cos(state.pitch);
    const y = p.y + 2.0 + Math.sin(state.pitch) * d;

    state.camera.position = new B.Vector3(x, y, z);
    state.camera.setTarget(new B.Vector3(p.x, p.y + 1.15, p.z));
  }

  function updateGame(dt) {
    if (!state.player || !state.scene) return;

    let x = state.joystick.x;
    let z = state.joystick.z;

    if (state.keys.KeyW || state.keys.ArrowUp) z += 1;
    if (state.keys.KeyS || state.keys.ArrowDown) z -= 1;
    if (state.keys.KeyA || state.keys.ArrowLeft) x -= 1;
    if (state.keys.KeyD || state.keys.ArrowRight) x += 1;

    const len = Math.hypot(x, z);
    if (len > 1) {
      x /= len;
      z /= len;
    }

    const moving = len > 0.05;
    const speed = state.isRunning ? 7.0 : 4.0;

    if (moving) {
      const forwardX = -Math.sin(state.yaw);
      const forwardZ = -Math.cos(state.yaw);
      const rightX = Math.cos(state.yaw);
      const rightZ = -Math.sin(state.yaw);

      state.player.position.x += (forwardX * z + rightX * x) * speed * dt;
      state.player.position.z += (forwardZ * z + rightZ * x) * speed * dt;
      state.player.position.x = clamp(state.player.position.x, -43, 43);
      state.player.position.z = clamp(state.player.position.z, -43, 43);
      state.player.rotation.y = Math.atan2(forwardX * z + rightX * x, forwardZ * z + rightZ * x);
    }

    if (!state.onGround) {
      state.verticalVelocity -= 18 * dt;
      state.player.position.y += state.verticalVelocity * dt;

      if (state.player.position.y <= 0) {
        state.player.position.y = 0;
        state.verticalVelocity = 0;
        state.onGround = true;
      }
    }

    if (state.npc && state.target && state.target.position) {
      const targetPos = state.target.position;
      state.npc.rotation.y = Math.atan2(
        state.player.position.x - targetPos.x,
        state.player.position.z - targetPos.z
      );
    }

    if (state.targetRing) state.targetRing.rotation.y += dt * 0.55;

    updateCamera();

    const target = state.target?.position;
    const distance = target && state.player
      ? Math.hypot(state.player.position.x - target.x, state.player.position.z - target.z)
      : Infinity;

    if (distance <= 3.1 && !state.dialogueOpen) {
      show("interactionPrompt");
      setText("interactionText", "Parler / Interagir");
    } else {
      hide("interactionPrompt");
    }

    if (state.npc && !state.dialogueOpen) {
      state.npc.position.y = Math.sin(performance.now() * 0.002) * 0.025;
    }

    if (Date.now() - state.lastSave > 45000 && state.started) saveGame(true);
  }

  function currentTargetDistance() {
    const p = state.player?.position;
    const t = state.target?.position;
    if (!p || !t) return Infinity;
    return Math.hypot(p.x - t.x, p.z - t.z);
  }

  function beginMission(index) {
    if (!state.worldReady || !state.scene || !state.player || !state.camera) {
      throw new Error("Le monde 3D n'est pas prêt. Vérifiez Babylon.js et relancez la mission.");
    }

    state.activeMission = clamp(index, 0, TOTAL - 1);
    state.paused = false;
    state.running = true;
    state.started = true;
    state.dialogueOpen = false;

    hideAllOverlays();
    hide("mainMenu");
    show("gameScreen");
    hide("worldLoadingOverlay");
    hide("dialoguePanel");

    state.player.position.set(0, 0, -4);
    state.yaw = Math.PI;
    state.verticalVelocity = 0;
    state.onGround = true;

    createTarget(state.activeMission);
    updateMissionUI();
    updateCamera();

    if (DOM.loveGameCanvas) {
      try { DOM.loveGameCanvas.focus({ preventScroll: true }); } catch (_) {}
    }

    saveGame(true);
  }

  async function startNewGame() {
    setText("worldLoadingText", "Création du jardin romantique...");
    show("worldLoadingOverlay");
    hide("mainMenu");
    hide("errorScreen");
    show("gameScreen");

    try {
      setLoading(35, "Initialisation du moteur 3D...");

      await new Promise(resolve => {
        if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => resolve());
        else setTimeout(resolve, 50);
      });

      ensureBabylon();

      if (!state.worldReady || !state.scene || !state.player || !state.camera) {
        throw new Error("Le monde 3D n'est pas prêt. Vérifiez le chargement de Babylon.js.");
      }

      state.completed = [];
      state.activeMission = 0;
      setLoading(85, "Préparation de votre première rencontre...");

      beginMission(0);

      if (!state.running) {
        throw new Error("La première mission n'a pas pu démarrer.");
      }

      setLoading(100, "Prêt !");
      hide("worldLoadingOverlay");
      notify("Bienvenue dans Sur l'Amour en Action !");
    } catch (err) {
      console.error("[FOBAS Love] Démarrage impossible :", err);
      showError(err?.message || "Une erreur inconnue a empêché le démarrage.");
    }
  }

  async function continueGame() {
    const saved = loadSave();

    if (!saved) {
      notify("Aucune sauvegarde trouvée.");
      updateContinueButton();
      return;
    }

    show("gameScreen");
    hide("mainMenu");
    show("worldLoadingOverlay");
    setText("worldLoadingText", "Restauration de votre aventure...");

    try {
      ensureBabylon();

      state.completed = [...new Set(saved.completed)]
        .filter(n => Number.isInteger(n) && n >= 0 && n < TOTAL);

      state.activeMission = clamp(Number(saved.activeMission) || 0, 0, TOTAL - 1);

      if (state.completed.includes(state.activeMission)) {
        let next = 0;
        while (next < TOTAL && state.completed.includes(next)) next++;

        if (next >= TOTAL) {
          hide("worldLoadingOverlay");
          hide("gameScreen");
          show("endingScreen");
          return;
        }

        state.activeMission = next;
      }

      beginMission(state.activeMission);
      notify("Votre aventure a été restaurée.");
    } catch (err) {
      console.error("[FOBAS Love] Restauration impossible :", err);
      showError(err?.message || "Impossible de restaurer la sauvegarde.");
    }
  }

  function interact() {
    if (!state.running || state.paused) return;

    if (state.dialogueOpen) {
      nextDialogue();
      return;
    }

    if (currentTargetDistance() > 3.5) {
      notify("Approchez-vous du marqueur rose ou de Camille pour interagir.");
      return;
    }

    const m = missionData[state.activeMission];

    state.currentSpeaker = m.speaker;
    state.currentDialogue = m.dialogue;
    state.dialogueStep = 0;

    setText("speakerName", m.speaker);
    setText("speakerAvatar", "♡");
    setText("dialogueText", m.dialogue);
    setText("dialogueVoiceStatus", state.settings.voice
      ? "Dialogue en français · voix du navigateur"
      : "Dialogue en français · voix désactivée");

    DOM.dialogueChoices?.replaceChildren();
    state.dialogueOpen = true;
    show("dialoguePanel");
    hide("interactionPrompt");
    speak(m.dialogue);
  }

  function speak(text) {
    if (!state.settings.voice || !("speechSynthesis" in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fr-FR";
      utterance.rate = 0.96;
      utterance.pitch = 1.04;
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  }

  function nextDialogue() {
    if (!state.dialogueOpen) return;

    if (state.dialogueStep === 0) {
      state.dialogueStep = 1;
      setText("dialogueText", "Que souhaitez-vous faire ?");

      const choices = DOM.dialogueChoices;

      if (choices) {
        choices.replaceChildren();

        const options = [
          ["Écouter avec attention", "L'écoute est une belle façon de montrer du respect."],
          ["Répondre avec sincérité", "La sincérité aide à construire une relation solide."]
        ];

        options.forEach(([label, response]) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "secondary-button";
          btn.textContent = label;

          btn.addEventListener("click", () => {
            setText("dialogueText", response);
            state.currentDialogue = response;
            speak(response);
            choices.querySelectorAll("button").forEach(b => b.disabled = true);
            state.dialogueStep = 2;
            if (DOM.nextDialogueButton) DOM.nextDialogueButton.textContent = "Terminer l'échange ✓";
          });

          choices.appendChild(btn);
        });
      }

      if (DOM.nextDialogueButton) DOM.nextDialogueButton.textContent = "Continuer →";
      return;
    }

    closeDialogue();
    completeMission();
  }

  function closeDialogue() {
    state.dialogueOpen = false;
    hide("dialoguePanel");

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (DOM.nextDialogueButton) DOM.nextDialogueButton.textContent = "Continuer →";
    if (DOM.dialogueChoices) DOM.dialogueChoices.replaceChildren();
  }

  function completeMission() {
    if (state.completed.includes(state.activeMission)) return;

    const doneIndex = state.activeMission;
    state.completed.push(doneIndex);
    state.completed = [...new Set(state.completed)].sort((a, b) => a - b);

    saveGame(true);
    setText("completionTitle", "Mission accomplie !");
    setText("completionMessage", `Bravo ! Vous avez terminé « ${missionData[doneIndex].title} ». Continuez votre histoire.`);
    setText("completionProgress", `${state.completed.length} / ${TOTAL}`);

    updateMissionUI();
    state.running = false;
    hide("dialoguePanel");

    if (doneIndex === TOTAL - 1 || state.completed.length >= TOTAL) {
      hide("missionCompleteScreen");
      show("endingScreen");
    } else {
      show("missionCompleteScreen");
    }
  }

  function goNextMission() {
    const next = state.activeMission + 1;

    if (next >= TOTAL) {
      hide("missionCompleteScreen");
      show("endingScreen");
      return;
    }

    hide("missionCompleteScreen");
    beginMission(next);
    notify(`Mission ${next + 1} sur ${TOTAL} : ${missionData[next].title}`);
  }

  function pauseGame() {
    if (!state.started || !state.running) return;

    state.paused = true;
    state.running = false;
    hide("dialoguePanel");
    state.dialogueOpen = false;
    show("pauseScreen");
  }

  function resumeGame() {
    if (!state.worldReady || !state.scene) {
      void startNewGame();
      return;
    }

    hide("pauseScreen");
    hide("missionsScreen");
    state.paused = false;
    state.running = true;
    show("gameScreen");
    updateCamera();
  }

  function returnToMenu() {
    if (state.started) saveGame(true);
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    state.running = false;
    state.paused = false;
    state.dialogueOpen = false;
    hide("dialoguePanel");
    openMainMenu();
  }

  function openMissions() {
    renderMissions();
    show("missionsScreen");
  }

  function openSettings() {
    loadSettings();
    show("settingsScreen");
  }

  function confirmReturn() {
    setText("confirmationTitle", "Retour au menu");
    setText("confirmationMessage", "Votre progression sera sauvegardée. Voulez-vous quitter la partie actuelle ?");
    state.confirmationAction = returnToMenu;
    show("confirmationScreen");
  }

  function bindEvents() {
    DOM.newGameButton?.addEventListener("click", event => {
      event?.preventDefault?.();
      void startNewGame();
    });

    DOM.continueGameButton?.addEventListener("click", event => {
      event?.preventDefault?.();
      void continueGame();
    });

    DOM.missionsMenuButton?.addEventListener("click", event => {
      event?.preventDefault?.();
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

    DOM.closeDialogueButton?.addEventListener("click", () => {
      closeDialogue();
      notify("Dialogue fermé. Approchez-vous pour reprendre.");
    });

    DOM.nextDialogueButton?.addEventListener("click", nextDialogue);
    DOM.repeatDialogueButton?.addEventListener("click", () => {
      speak(state.currentDialogue || missionData[state.activeMission].dialogue);
    });

    DOM.nextMissionButton?.addEventListener("click", goNextMission);
    DOM.completionMenuButton?.addEventListener("click", returnToMenu);

    DOM.restartGameButton?.addEventListener("click", event => {
      event?.preventDefault?.();
      void startNewGame();
    });

    DOM.endingMenuButton?.addEventListener("click", returnToMenu);

    DOM.cancelConfirmationButton?.addEventListener("click", () => hide("confirmationScreen"));
    DOM.acceptConfirmationButton?.addEventListener("click", () => {
      hide("confirmationScreen");
      const action = state.confirmationAction;
      state.confirmationAction = null;
      if (typeof action === "function") action();
    });

    DOM.retryButton?.addEventListener("click", event => {
      event?.preventDefault?.();
      void startNewGame();
    });

    DOM.errorMenuButton?.addEventListener("click", () => {
      hide("errorScreen");
      openMainMenu();
    });

    DOM.jumpButton?.addEventListener("pointerdown", jump);
    DOM.runButton?.addEventListener("pointerdown", () => state.isRunning = true);
    ["pointerup", "pointercancel", "pointerleave"].forEach(type => {
      DOM.runButton?.addEventListener(type, () => state.isRunning = false);
    });

    DOM.loveGameCanvas?.addEventListener("click", () => {
      try { DOM.loveGameCanvas?.focus({ preventScroll: true }); } catch (_) {}
    });

    window.addEventListener("keydown", event => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
        event.preventDefault();
      }

      state.keys[event.code] = true;

      if (event.code === "ShiftLeft" || event.code === "ShiftRight") state.isRunning = true;

      if (event.code === "KeyE" || event.code === "Enter") {
        if (!state.dialogueOpen) interact();
        else nextDialogue();
      }

      if (event.code === "Space") jump();

      if (event.code === "Escape") {
        if (state.dialogueOpen) closeDialogue();
        else if (DOM.pauseScreen && !DOM.pauseScreen.classList.contains("hidden")) resumeGame();
        else pauseGame();
      }
    });

    window.addEventListener("keyup", event => {
      state.keys[event.code] = false;
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") state.isRunning = false;
    });

    bindJoystick();
    bindCameraTouch();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && state.running) {
        saveGame(true);
        state.running = false;
        state.paused = true;
        show("pauseScreen");
      }
    });
  }

  function jump() {
    if (!state.running || state.paused || !state.onGround) return;
    state.verticalVelocity = 6.8;
    state.onGround = false;
  }

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

    base.addEventListener("pointerdown", event => {
      event.preventDefault();
      state.joystick.active = true;
      state.joystick.pointerId = event.pointerId;
      try { base.setPointerCapture(event.pointerId); } catch (_) {}
      move(event);
    });

    base.addEventListener("pointermove", event => {
      if (state.joystick.active && event.pointerId === state.joystick.pointerId) move(event);
    });

    ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => {
      base.addEventListener(type, reset);
    });

    function move(event) {
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const max = Math.max(20, rect.width * 0.32);
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const length = Math.hypot(dx, dy);
      const scale = length > max ? max / length : 1;
      const nx = dx * scale;
      const ny = dy * scale;

      state.joystick.x = nx / max;
      state.joystick.z = -ny / max;
      thumb.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
    }
  }

  function bindCameraTouch() {
    const canvas = DOM.loveGameCanvas;
    if (!canvas) return;

    canvas.style.touchAction = "none";
    const active = new Map();

    canvas.addEventListener("pointerdown", event => {
      active.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (active.size === 1) {
        state.cameraDrag = {
          active: true,
          x: event.clientX,
          y: event.clientY,
          pointerId: event.pointerId
        };
        try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
      } else if (active.size === 2) {
        const points = [...active.values()];
        state.pinch = {
          distance: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y),
          cameraDistance: state.cameraDistance
        };
        state.cameraDrag.active = false;
      }
    });

    canvas.addEventListener("pointermove", event => {
      if (!active.has(event.pointerId)) return;

      const old = active.get(event.pointerId);
      active.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (active.size >= 2 && state.pinch) {
        const points = [...active.values()];
        const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        state.cameraDistance = clamp(
          state.pinch.cameraDistance * state.pinch.distance / Math.max(1, distance),
          4,
          15
        );
      } else if (state.cameraDrag.active && state.cameraDrag.pointerId === event.pointerId) {
        const dx = event.clientX - old.x;
        const dy = event.clientY - old.y;
        state.yaw -= dx * 0.008 * state.sensitivity;
        state.pitch = clamp(state.pitch - dy * 0.006 * state.sensitivity, 0.25, 1.25);
      }
    });

    const finish = event => {
      active.delete(event.pointerId);

      if (active.size < 2) state.pinch = null;

      if (active.size === 0) {
        state.cameraDrag.active = false;
        state.cameraDrag.pointerId = null;
      } else if (active.size === 1) {
        const [id, point] = [...active.entries()][0];
        state.cameraDrag = {
          active: true,
          x: point.x,
          y: point.y,
          pointerId: id
        };
      }
    };

    ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => {
      canvas.addEventListener(type, finish);
    });

    canvas.addEventListener("wheel", event => {
      state.cameraDistance = clamp(state.cameraDistance + Math.sign(event.deltaY) * 0.7, 4, 15);
      event.preventDefault();
    }, { passive: false });
  }

  function initialize() {
    bindEvents();
    loadSettings();
    updateContinueButton();
    renderMissions();
    setLoading(100, "Votre aventure est prête.");

    setTimeout(() => {
      hide("loadingScreen");
      show("mainMenu");
    }, 350);

    window.addEventListener("error", event => {
      console.error("[FOBAS Love] Erreur JavaScript :", event.error || event.message);
    });

    window.addEventListener("unhandledrejection", event => {
      console.error("[FOBAS Love] Promesse rejetée :", event.reason);
    });
  }

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

