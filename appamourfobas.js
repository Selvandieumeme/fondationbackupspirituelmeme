/* ============================================================
   FOBAS INTERACTIVE — SUR L'AMOUR EN ACTION
   Fichier : appamourfobas.js
   Version : 3.0.0
   Moteur  : Three.js ES Module r166
   Compatible avec : appamourfobas.html
   Fonctionnalités :
   - 35 missions dynamiques
   - Monde 3D procédural sans modèle externe
   - Personnage joueur et personnages non joueurs
   - Déplacement clavier et joystick tactile
   - Caméra tactile, glissement et zoom par pincement
   - Dialogues, choix, voix et sous-titres
   - Sauvegarde locale et paramètres
   - Menu, pause, missions, confirmation et fin
============================================================ */

(() => {
  "use strict";

  /* ============================================================
     1. CONFIGURATION
  ============================================================ */

  const APP_VERSION = "3.0.0";
  const SAVE_KEY = "FOBAS_AMOUR_ACTION_SAVE_V3";
  const SETTINGS_KEY = "FOBAS_AMOUR_ACTION_SETTINGS_V3";
  const PROFILE_KEY = "FOBAS_AMOUR_ACTION_PROFILE_V3";
  const TOTAL_MISSIONS = 35;

  // Le moteur est chargé dynamiquement.
  // On ne dépend donc pas de window.THREE ni de la version globale
  // éventuellement chargée par le HTML.
  const THREE_URL =
    "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";

  let THREE_ENGINE = null;

  const $ = (id) => document.getElementById(id);

  const state = {
    initialized: false,
    initializing: false,
    loading: false,
    worldReady: false,
    animationFrame: 0,
    lastFrameTime: 0,

    renderer: null,
    scene: null,
    camera: null,
    clock: null,

    player: null,
    playerModel: null,
    playerRing: null,
    playerVelocityY: 0,
    isJumping: false,
    isRunning: false,
    moveX: 0,
    moveZ: 0,

    npcs: [],
    objects: [],
    particles: [],
    missionMarkers: [],
    interactableNPC: null,

    cameraYaw: 0,
    cameraPitch: 0.28,
    cameraDistance: 7.5,
    cameraSensitivity: 1,
    targetCameraPosition: null,

    currentMission: 0,
    completedMissions: [],
    missionProgress: 0,
    dialogueIndex: 0,
    activeDialogue: null,
    dialogueNPC: null,
    dialogueChoices: [],
    pendingConfirmation: null,

    paused: false,
    running: false,
    initializedEvents: false,
    previousScreen: "mainMenu",
    missionsReturnScreen: "mainMenu",

    audioContext: null,
    masterGain: null,

    lastNotificationTimer: null,
    saveTimer: null,
    autosaveTimer: null,

    settings: {
      voiceEnabled: true,
      musicEnabled: true,
      subtitlesEnabled: true,
      quality: "medium",
      sensitivity: 1
    },

    keys: Object.create(null),
    joystickPointer: null,
    cameraPointers: new Map(),
    lastTapTime: 0
  };

  const REQUIRED_IDS = [
    "loadingScreen", "loadingMessage", "loadingProgress",
    "loadingPercent", "mainMenu", "gameScreen", "gameWorld",
    "loveGameCanvas", "worldLoadingOverlay", "worldLoadingText",
    "pauseButton", "missionNumber", "missionTitle",
    "openMissionsButton", "objectiveText", "objectiveProgressBar",
    "objectiveProgressText", "interactionPrompt", "interactionIcon",
    "interactionText", "dialoguePanel", "speakerAvatar",
    "speakerName", "dialogueText", "dialogueChoices",
    "dialogueVoiceStatus", "closeDialogueButton",
    "repeatDialogueButton", "nextDialogueButton",
    "movementControl", "joystickBase", "joystickThumb",
    "cameraControlHint", "runButton", "jumpButton", "talkButton",
    "gameNotification", "savingIndicator", "missionsScreen",
    "missionsSummary", "overallProgressBar", "missionsList",
    "closeMissionsButton", "pauseScreen", "resumeButton",
    "pauseMissionsButton", "saveGameButton", "returnToMenuButton",
    "settingsButton", "settingsScreen", "closeSettingsButton",
    "voiceEnabled", "musicEnabled", "subtitlesEnabled",
    "qualitySelect", "sensitivityRange", "saveSettingsButton",
    "creditsButton", "creditsScreen", "closeCreditsButton",
    "missionCompleteScreen", "completionTitle", "completionMessage",
    "completionProgress", "nextMissionButton", "completionMenuButton",
    "endingScreen", "restartGameButton", "endingMenuButton",
    "confirmationScreen", "confirmationTitle", "confirmationMessage",
    "cancelConfirmationButton", "acceptConfirmationButton",
    "errorScreen", "errorTitle", "errorMessage", "retryButton",
    "errorMenuButton", "newGameButton", "continueGameButton",
    "missionsMenuButton", "saveStatus"
  ];

  /* ============================================================
     2. LES 35 MISSIONS
  ============================================================ */

  const BASE_MISSION_DATA = [
    {
      title: "Un regard inattendu",
      objective: "Rencontrez Camille et faites connaissance.",
      person: "Camille",
      location: "Place centrale",
      dialogue: "Bonjour ! Quel plaisir de vous rencontrer. Je ne m'attendais pas à faire une nouvelle connaissance aujourd'hui.",
      response: "Je suis heureux de vous rencontrer également."
    },
    {
      title: "Une première conversation",
      objective: "Retrouvez Camille et poursuivez la conversation.",
      person: "Camille",
      location: "Jardin des fleurs",
      dialogue: "J'aime les conversations sincères. Elles permettent de découvrir ce qui rend chaque personne unique.",
      response: "Je pense aussi que l'écoute est importante."
    },
    {
      title: "Le jardin des émotions",
      objective: "Rejoignez Sofia dans le jardin.",
      person: "Sofia",
      location: "Jardin des fleurs",
      dialogue: "Regardez ces fleurs. Chacune a sa couleur et son parfum. Les émotions humaines sont aussi diverses et précieuses.",
      response: "La diversité rend la vie plus belle."
    },
    {
      title: "Un sourire partagé",
      objective: "Parlez à Gabriel sur la place.",
      person: "Gabriel",
      location: "Place centrale",
      dialogue: "Un sourire peut changer une journée. Parfois, un petit geste apporte beaucoup de bonheur.",
      response: "Alors, commençons par offrir un sourire."
    },
    {
      title: "La promenade tranquille",
      objective: "Retrouvez Léa près du lac.",
      person: "Léa",
      location: "Lac romantique",
      dialogue: "J'aime marcher près de l'eau. Le calme aide à réfléchir et à mieux comprendre les autres.",
      response: "Prenons le temps de profiter du paysage."
    },
    {
      title: "Écouter avec le cœur",
      objective: "Écoutez Nathan et découvrez son histoire.",
      person: "Nathan",
      location: "Banc du parc",
      dialogue: "Il est parfois difficile de parler de ce que l'on ressent. Une personne qui écoute sans juger peut faire une grande différence.",
      response: "Je suis là pour écouter avec respect."
    },
    {
      title: "La confiance naissante",
      objective: "Retrouvez Camille pour parler de confiance.",
      person: "Camille",
      location: "Jardin des fleurs",
      dialogue: "La confiance ne se commande pas. Elle grandit avec le temps, les actes et la sincérité.",
      response: "Je préfère construire une confiance durable."
    },
    {
      title: "Un secret partagé",
      objective: "Parlez à Sofia au kiosque.",
      person: "Sofia",
      location: "Kiosque",
      dialogue: "Un secret confié est une responsabilité. Il faut savoir respecter l'intimité et la confiance d'une autre personne.",
      response: "Je respecterai toujours la confiance que l'on m'accorde."
    },
    {
      title: "Les mots qui rapprochent",
      objective: "Retrouvez Gabriel près de la fontaine.",
      person: "Gabriel",
      location: "Fontaine",
      dialogue: "Les mots peuvent rapprocher les gens, mais ils peuvent aussi blesser. Choisissons-les avec attention.",
      response: "Je veux communiquer avec bienveillance."
    },
    {
      title: "Le rendez-vous au parc",
      objective: "Rencontrez Léa dans le parc.",
      person: "Léa",
      location: "Parc romantique",
      dialogue: "Un rendez-vous réussi ne demande pas forcément quelque chose d'extraordinaire. La présence et l'attention comptent beaucoup.",
      response: "Le plus important est de partager un bon moment."
    },
    {
      title: "La valeur du respect",
      objective: "Discutez avec Nathan du respect mutuel.",
      person: "Nathan",
      location: "Place centrale",
      dialogue: "Aimer quelqu'un, c'est aussi respecter ses limites, ses opinions et sa liberté.",
      response: "Le respect doit toujours être réciproque."
    },
    {
      title: "Comprendre les différences",
      objective: "Retrouvez Sofia pour parler des différences.",
      person: "Sofia",
      location: "Jardin des fleurs",
      dialogue: "Nous ne pensons pas toujours de la même manière. Comprendre les différences permet de grandir ensemble.",
      response: "Je veux apprendre à mieux comprendre les autres."
    },
    {
      title: "Un geste attentionné",
      objective: "Parlez à Camille et choisissez un geste bienveillant.",
      person: "Camille",
      location: "Banc du parc",
      dialogue: "Un geste attentionné n'a pas besoin d'être coûteux. Il doit surtout être sincère et adapté à la personne.",
      response: "Je choisirai un geste simple et sincère."
    },
    {
      title: "Le temps de réfléchir",
      objective: "Retrouvez Gabriel pour prendre du recul.",
      person: "Gabriel",
      location: "Lac romantique",
      dialogue: "Avant de prendre une décision importante, il est utile de respirer, de réfléchir et de considérer les conséquences.",
      response: "Je vais réfléchir avant d'agir."
    },
    {
      title: "Une invitation sincère",
      objective: "Rencontrez Léa et formulez une invitation respectueuse.",
      person: "Léa",
      location: "Kiosque",
      dialogue: "Une invitation est belle lorsqu'elle est claire et respectueuse. L'autre personne doit toujours pouvoir choisir librement.",
      response: "Je proposerai simplement, sans pression."
    },
    {
      title: "Le courage d'être soi",
      objective: "Parlez à Nathan de l'authenticité.",
      person: "Nathan",
      location: "Place centrale",
      dialogue: "Nous n'avons pas besoin de prétendre être parfaits. Être honnête sur qui nous sommes permet de créer des relations plus solides.",
      response: "Je préfère être moi-même avec sincérité."
    },
    {
      title: "Une journée lumineuse",
      objective: "Retrouvez Sofia dans le jardin ensoleillé.",
      person: "Sofia",
      location: "Jardin des fleurs",
      dialogue: "Les bons souvenirs se construisent souvent avec des choses simples : une promenade, une conversation et un rire partagé.",
      response: "Créons aujourd'hui un beau souvenir."
    },
    {
      title: "Apprendre à pardonner",
      objective: "Discutez avec Gabriel du pardon.",
      person: "Gabriel",
      location: "Fontaine",
      dialogue: "Pardonner peut demander du temps. Cela ne signifie pas oublier ce qui s'est passé ni accepter que le mal se répète.",
      response: "Je veux avancer avec sagesse et respect."
    },
    {
      title: "La force du dialogue",
      objective: "Retrouvez Camille pour parler de communication.",
      person: "Camille",
      location: "Banc du parc",
      dialogue: "Quand un désaccord apparaît, parler calmement et écouter l'autre aide à chercher une solution.",
      response: "Je chercherai à comprendre avant de répondre."
    },
    {
      title: "Un souvenir précieux",
      objective: "Rencontrez Léa près du lac.",
      person: "Léa",
      location: "Lac romantique",
      dialogue: "Certains souvenirs restent précieux parce qu'ils nous rappellent les personnes et les moments qui ont compté.",
      response: "Gardons le meilleur de cette journée."
    },
    {
      title: "Choisir ensemble",
      objective: "Parlez à Nathan de la prise de décision.",
      person: "Nathan",
      location: "Kiosque",
      dialogue: "Dans une relation, les décisions importantes gagnent à être discutées ensemble. Chaque voix mérite d'être entendue.",
      response: "Je veux que chacun puisse exprimer son avis."
    },
    {
      title: "L'art de la patience",
      objective: "Retrouvez Sofia pour parler de patience.",
      person: "Sofia",
      location: "Jardin des fleurs",
      dialogue: "Les relations se construisent étape par étape. Il faut parfois laisser à chacun le temps nécessaire pour avancer.",
      response: "Je respecterai le rythme de chacun."
    },
    {
      title: "La promesse tenue",
      objective: "Rencontrez Gabriel et parlez des engagements.",
      person: "Gabriel",
      location: "Place centrale",
      dialogue: "Une promesse a de la valeur lorsqu'elle est suivie d'actes. Il vaut mieux promettre moins et tenir parole.",
      response: "Je veux que mes actes correspondent à mes paroles."
    },
    {
      title: "Une surprise bienveillante",
      objective: "Retrouvez Camille pour partager une attention.",
      person: "Camille",
      location: "Fontaine",
      dialogue: "Une surprise peut faire plaisir lorsqu'elle tient compte des goûts et du confort de l'autre personne.",
      response: "Je penserai à ce qui lui ferait réellement plaisir."
    },
    {
      title: "Les rêves d'avenir",
      objective: "Parlez avec Léa de vos projets.",
      person: "Léa",
      location: "Lac romantique",
      dialogue: "Les rêves d'avenir nous inspirent. Les partager permet de découvrir ce que chacun souhaite construire.",
      response: "Parlons de nos espoirs et de nos objectifs."
    },
    {
      title: "Soutenir sans contrôler",
      objective: "Retrouvez Nathan pour parler de soutien.",
      person: "Nathan",
      location: "Banc du parc",
      dialogue: "Soutenir quelqu'un, ce n'est pas décider à sa place. C'est l'encourager tout en respectant son autonomie.",
      response: "Je veux encourager sans imposer mes choix."
    },
    {
      title: "La beauté des petites choses",
      objective: "Rencontrez Sofia dans le jardin.",
      person: "Sofia",
      location: "Jardin des fleurs",
      dialogue: "Un coucher de soleil, une parole gentille ou un moment de calme peuvent rendre une journée mémorable.",
      response: "Apprenons à apprécier ces petits moments."
    },
    {
      title: "Faire face aux difficultés",
      objective: "Parlez à Gabriel de la résolution des problèmes.",
      person: "Gabriel",
      location: "Place centrale",
      dialogue: "Les difficultés existent dans toutes les relations. Chercher une solution ensemble vaut mieux que chercher un coupable.",
      response: "Concentrons-nous sur les solutions."
    },
    {
      title: "La liberté de choisir",
      objective: "Retrouvez Camille pour parler de liberté.",
      person: "Camille",
      location: "Kiosque",
      dialogue: "Un lien sincère ne retire pas la liberté. Chacun doit pouvoir faire ses choix et garder son identité.",
      response: "Une relation saine laisse de la place à chacun."
    },
    {
      title: "Reconnaître ses erreurs",
      objective: "Rencontrez Nathan et parlez de responsabilité.",
      person: "Nathan",
      location: "Fontaine",
      dialogue: "Reconnaître une erreur demande du courage. Présenter des excuses sincères et changer son comportement sont importants.",
      response: "Je prendrai la responsabilité de mes actes."
    },
    {
      title: "Construire la confiance",
      objective: "Retrouvez Léa pour faire le bilan de votre parcours.",
      person: "Léa",
      location: "Lac romantique",
      dialogue: "La confiance grandit lorsque les paroles, les décisions et les actes restent cohérents au fil du temps.",
      response: "Je continuerai à agir avec honnêteté."
    },
    {
      title: "Une relation équilibrée",
      objective: "Parlez à Sofia de l'équilibre dans une relation.",
      person: "Sofia",
      location: "Jardin des fleurs",
      dialogue: "Une relation équilibrée laisse chacun donner, recevoir, se reposer, évoluer et poursuivre ses propres projets.",
      response: "L'équilibre et la réciprocité sont essentiels."
    },
    {
      title: "L'amour en action",
      objective: "Retrouvez Gabriel et résumez ce que vous avez appris.",
      person: "Gabriel",
      location: "Place centrale",
      dialogue: "L'amour se manifeste dans les actions quotidiennes : écouter, respecter, soutenir, communiquer et rester sincère.",
      response: "Je veux mettre ces valeurs en pratique."
    },
    {
      title: "Le choix du cœur",
      objective: "Rencontrez Camille pour conclure votre parcours.",
      person: "Camille",
      location: "Fontaine",
      dialogue: "Vous avez appris que les relations demandent de l'attention, de la liberté et du respect. Chaque jour offre une nouvelle occasion de faire le bien.",
      response: "Je choisis la sincérité, le respect et la bienveillance."
    },
    {
      title: "Une nouvelle histoire",
      objective: "Retrouvez tous vos souvenirs et terminez l'aventure.",
      person: "Léa",
      location: "Lac romantique",
      dialogue: "Félicitations ! Vous avez parcouru les 35 missions de Sur l'Amour en Action. Votre aventure se termine ici, mais les valeurs que vous avez découvertes peuvent continuer à vivre dans votre quotidien.",
      response: "Mon histoire continue avec des choix plus réfléchis."
    }
  ];

  const NPC_DEFINITIONS = [
    {
      name: "Camille",
      color: 0xff7da8,
      hair: 0x392538,
      skin: 0xf0c5a5,
      clothes: 0xf15f91,
      x: -4,
      z: -3,
      avatar: "♥"
    },
    {
      name: "Gabriel",
      color: 0x64b9e8,
      hair: 0x3c2c24,
      skin: 0xdba981,
      clothes: 0x377fc2,
      x: 4,
      z: -2,
      avatar: "◆"
    },
    {
      name: "Sofia",
      color: 0xe5a3ff,
      hair: 0x53332c,
      skin: 0xe7b48f,
      clothes: 0xa16de0,
      x: -5,
      z: 4,
      avatar: "✿"
    },
    {
      name: "Nathan",
      color: 0x7ee0bc,
      hair: 0x292a32,
      skin: 0x9f6d4c,
      clothes: 0x288c70,
      x: 5,
      z: 4,
      avatar: "●"
    },
    {
      name: "Léa",
      color: 0xffd27e,
      hair: 0x8a5032,
      skin: 0xf0c5a5,
      clothes: 0xe8a83f,
      x: 0,
      z: -7,
      avatar: "♡"
    }
  ];

  const LOCATION_COORDS = {
    "Place centrale": { x: 0, z: 0 },
    "Jardin des fleurs": { x: -7, z: 3 },
    "Lac romantique": { x: 0, z: -9 },
    "Banc du parc": { x: 5, z: 6 },
    "Kiosque": { x: 8, z: -3 },
    "Fontaine": { x: 0, z: 5 },
    "Parc romantique": { x: -8, z: -5 }
  };

  /* ============================================================
     3. OUTILS GÉNÉRAUX
  ============================================================ */

  function safeText(id, value) {
    const element = $(id);
    if (element) element.textContent = String(value ?? "");
  }

  function showElement(id) {
    const element = $(id);
    if (element) element.classList.remove("hidden");
  }

  function hideElement(id) {
    const element = $(id);
    if (element) element.classList.add("hidden");
  }

  function setScreen(screenId) {
    const screenIds = [
      "mainMenu",
      "gameScreen",
      "missionsScreen",
      "pauseScreen",
      "settingsScreen",
      "creditsScreen",
      "missionCompleteScreen",
      "endingScreen",
      "confirmationScreen",
      "errorScreen"
    ];

    screenIds.forEach((id) => {
      const element = $(id);
      if (element) element.classList.add("hidden");
    });

    if (screenId) showElement(screenId);
    state.previousScreen = screenId || "mainMenu";
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distanceXZ(a, b) {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function notify(message, duration = 2600) {
    const element = $("gameNotification");
    if (!element) return;

    element.textContent = message;
    element.classList.remove("hidden");

    if (state.lastNotificationTimer) {
      clearTimeout(state.lastNotificationTimer);
    }

    state.lastNotificationTimer = setTimeout(() => {
      element.classList.add("hidden");
    }, duration);
  }

  function setLoadingProgress(percent, message) {
    const value = clamp(percent, 0, 100);
    const bar = $("loadingProgress");

    if (bar) bar.style.width = `${value}%`;
    safeText("loadingPercent", `${Math.round(value)} %`);

    if (message) safeText("loadingMessage", message);
  }

  function setWorldLoading(visible, message) {
    const overlay = $("worldLoadingOverlay");
    if (!overlay) return;

    if (message) safeText("worldLoadingText", message);
    overlay.classList.toggle("hidden", !visible);
  }

  function showError(title, message) {
    safeText("errorTitle", title);
    safeText("errorMessage", message);
    setScreen("errorScreen");
    state.running = false;
    state.paused = true;
    setWorldLoading(false);
  }

  /* ============================================================
     4. SAUVEGARDE LOCALE
  ============================================================ */

  function getSaveData() {
    return {
      version: APP_VERSION,
      currentMission: state.currentMission,
      completedMissions: [...state.completedMissions],
      missionProgress: state.missionProgress,
      playerPosition: state.player
        ? {
            x: state.player.position.x,
            y: state.player.position.y,
            z: state.player.position.z
          }
        : { x: 0, y: 0, z: 8 },
      camera: {
        yaw: state.cameraYaw,
        pitch: state.cameraPitch,
        distance: state.cameraDistance
      },
      updatedAt: new Date().toISOString()
    };
  }

  function saveGame(silent = false) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(getSaveData()));
      safeText("saveStatus", "Progression sauvegardée");

      const indicator = $("savingIndicator");
      if (indicator) {
        indicator.classList.remove("hidden");
        setTimeout(() => indicator.classList.add("hidden"), 1000);
      }

      updateContinueButton();

      if (!silent) notify("Progression sauvegardée avec succès.");
      return true;
    } catch (error) {
      console.error("[FOBAS Amour] Erreur de sauvegarde :", error);
      if (!silent) notify("La sauvegarde locale n'a pas pu être effectuée.");
      return false;
    }
  }

  function loadSaveData() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;

      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return null;

      const completed = Array.isArray(data.completedMissions)
        ? data.completedMissions
            .map(Number)
            .filter((number) =>
              Number.isInteger(number) &&
              number >= 0 &&
              number < TOTAL_MISSIONS
            )
        : [];

      return {
        currentMission: clamp(
          Number(data.currentMission) || 0,
          0,
          TOTAL_MISSIONS - 1
        ),
        completedMissions: [...new Set(completed)],
        missionProgress: clamp(Number(data.missionProgress) || 0, 0, 1),
        playerPosition: data.playerPosition || { x: 0, y: 0, z: 8 },
        camera: data.camera || null
      };
    } catch (error) {
      console.warn("[FOBAS Amour] Sauvegarde illisible :", error);
      return null;
    }
  }

  function updateContinueButton() {
    const button = $("continueGameButton");
    if (!button) return;

    const data = loadSaveData();
    const canContinue = Boolean(
      data &&
      (
        data.completedMissions.length > 0 ||
        data.currentMission > 0 ||
        data.missionProgress > 0
      )
    );

    button.disabled = !canContinue;
  }

  function scheduleAutosave() {
    if (state.saveTimer) clearTimeout(state.saveTimer);

    state.saveTimer = setTimeout(() => {
      saveGame(true);
    }, 800);
  }

  /* ============================================================
     5. PARAMÈTRES
  ============================================================ */

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;

      const settings = JSON.parse(raw);
      if (!settings || typeof settings !== "object") return;

      state.settings.voiceEnabled = settings.voiceEnabled !== false;
      state.settings.musicEnabled = settings.musicEnabled !== false;
      state.settings.subtitlesEnabled =
        settings.subtitlesEnabled !== false;

      state.settings.quality = ["low", "medium", "high"].includes(
        settings.quality
      ) ? settings.quality : "medium";

      state.settings.sensitivity = clamp(
        Number(settings.sensitivity) || 1,
        0.5,
        2
      );
    } catch (error) {
      console.warn("[FOBAS Amour] Paramètres illisibles :", error);
    }
  }

  function applySettingsToUI() {
    if ($("voiceEnabled")) {
      $("voiceEnabled").checked = state.settings.voiceEnabled;
    }

    if ($("musicEnabled")) {
      $("musicEnabled").checked = state.settings.musicEnabled;
    }

    if ($("subtitlesEnabled")) {
      $("subtitlesEnabled").checked = state.settings.subtitlesEnabled;
    }

    if ($("qualitySelect")) {
      $("qualitySelect").value = state.settings.quality;
    }

    if ($("sensitivityRange")) {
      $("sensitivityRange").value = String(
        state.settings.sensitivity
      );
    }
  }

  function saveSettings() {
    state.settings.voiceEnabled = Boolean($("voiceEnabled")?.checked);
    state.settings.musicEnabled = Boolean($("musicEnabled")?.checked);
    state.settings.subtitlesEnabled =
      Boolean($("subtitlesEnabled")?.checked);

    state.settings.quality = $("qualitySelect")?.value || "medium";

    state.settings.sensitivity = clamp(
      Number($("sensitivityRange")?.value) || 1,
      0.5,
      2
    );

    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(state.settings)
      );
    } catch (error) {
      console.warn("[FOBAS Amour] Paramètres non sauvegardés :", error);
    }

    applyGraphicsQuality();
    closeSettings();
    notify("Paramètres enregistrés.");
  }

  function applyGraphicsQuality() {
    if (!state.renderer) return;

    const pixelRatio = window.devicePixelRatio || 1;
    const ratio = state.settings.quality === "high"
      ? Math.min(pixelRatio, 2)
      : state.settings.quality === "low"
        ? 1
        : Math.min(pixelRatio, 1.5);

    state.renderer.setPixelRatio(ratio);

    if (state.renderer.shadowMap) {
      state.renderer.shadowMap.enabled =
        state.settings.quality !== "low";
    }

    resizeRenderer();
  }

  /* ============================================================
     6. AUDIO ET VOIX
  ============================================================ */

  function initializeAudio() {
    if (state.audioContext) return;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    try {
      state.audioContext = new AudioContextClass();
      state.masterGain = state.audioContext.createGain();
      state.masterGain.gain.value =
        state.settings.musicEnabled ? 0.12 : 0;
      state.masterGain.connect(state.audioContext.destination);
    } catch (error) {
      console.warn("[FOBAS Amour] Audio indisponible :", error);
    }
  }

  function playTone(frequency = 660, duration = 0.12) {
    if (!state.settings.musicEnabled) return;

    initializeAudio();

    const context = state.audioContext;
    if (!context || !state.masterGain) return;

    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.16,
        context.currentTime + 0.025
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + duration
      );

      oscillator.connect(gain);
      gain.connect(state.masterGain);
      oscillator.start();
      oscillator.stop(context.currentTime + duration + 0.03);
    } catch (error) {
      console.warn("[FOBAS Amour] Son indisponible :", error);
    }
  }

  function speak(text) {
    if (!state.settings.voiceEnabled) return;
    if (!("speechSynthesis" in window)) return;

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.lang = "fr-FR";
      utterance.rate = 0.95;
      utterance.pitch = 1.04;
      utterance.volume = 0.9;

      const voices = window.speechSynthesis.getVoices();
      const frenchVoice = voices.find((voice) =>
        /^fr(-|_)/i.test(voice.lang)
      );

      if (frenchVoice) utterance.voice = frenchVoice;

      window.speechSynthesis.speak(utterance);
      safeText("dialogueVoiceStatus", "Lecture vocale en français");
    } catch (error) {
      console.warn("[FOBAS Amour] Voix indisponible :", error);
    }
  }

  function stopVoice() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  /* ============================================================
     7. CHARGEMENT DYNAMIQUE DE THREE.JS
  ============================================================ */

  async function loadThreeModule() {
    if (THREE_ENGINE) return THREE_ENGINE;

    try {
      THREE_ENGINE = await import(THREE_URL);

      if (
        !THREE_ENGINE ||
        typeof THREE_ENGINE.Scene !== "function" ||
        typeof THREE_ENGINE.WebGLRenderer !== "function"
      ) {
        throw new Error("Le module Three.js chargé est incomplet.");
      }

      return THREE_ENGINE;
    } catch (error) {
      console.error("[FOBAS Amour] Chargement Three.js impossible :", error);
      throw new Error(
        "Impossible de charger le moteur 3D. Vérifiez la connexion Internet, " +
        "le chargement des modules JavaScript et la prise en charge de WebGL."
      );
    }
  }

  /* ============================================================
     8. INITIALISATION DU MOTEUR 3D
  ============================================================ */

  async function initializeThree() {
    if (state.worldReady) return true;
    if (state.initializing) {
      while (state.initializing) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return state.worldReady;
    }

    state.initializing = true;
    setWorldLoading(true, "Chargement du moteur graphique 3D...");

    try {
      const THREE = await loadThreeModule();
      const canvas = $("loveGameCanvas");

      if (!canvas) {
        throw new Error("Le canvas #loveGameCanvas est introuvable.");
      }

      const gl = canvas.getContext("webgl2") ||
                 canvas.getContext("webgl") ||
                 canvas.getContext("experimental-webgl");

      if (!gl) {
        throw new Error(
          "WebGL n'est pas disponible dans ce navigateur ou sur cet appareil."
        );
      }

      const renderer = new THREE.WebGLRenderer({
        canvas,
        context: gl,
        antialias: state.settings.quality !== "low",
        alpha: false,
        powerPreference: "high-performance"
      });

      renderer.setPixelRatio(
        state.settings.quality === "high"
          ? Math.min(window.devicePixelRatio || 1, 2)
          : state.settings.quality === "low"
            ? 1
            : Math.min(window.devicePixelRatio || 1, 1.5)
      );

      renderer.setClearColor(0x9bc7e8, 1);

      if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      }

      renderer.shadowMap.enabled = state.settings.quality !== "low";
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;

      state.renderer = renderer;
      state.scene = new THREE.Scene();
      state.scene.background = new THREE.Color(0x9bc7e8);
      state.scene.fog = new THREE.Fog(0x9bc7e8, 35, 105);

      state.camera = new THREE.PerspectiveCamera(58, 1, 0.1, 220);
      state.camera.position.set(0, 5, 12);

      state.clock = new THREE.Clock();

      createLighting();
      createWorld();
      createPlayer();
      createNPCs();
      createEnvironmentDetails();
      createMissionMarker();

      resizeRenderer();
      updateCamera(1);

      state.worldReady = true;
      applyGraphicsQuality();

      window.addEventListener("resize", resizeRenderer, {
        passive: true
      });
      window.addEventListener("orientationchange", resizeRenderer, {
        passive: true
      });

      setWorldLoading(false);
      return true;
    } catch (error) {
      console.error("[FOBAS Amour] Erreur d'initialisation 3D :", error);
      setWorldLoading(false);
      throw error;
    } finally {
      state.initializing = false;
    }
  }

  /* ============================================================
     9. LUMIÈRES
  ============================================================ */

  function createLighting() {
    const THREE = THREE_ENGINE;
    const scene = state.scene;

    const hemisphere = new THREE.HemisphereLight(
      0xeaf5ff,
      0x526443,
      2.1
    );
    scene.add(hemisphere);

    const sunlight = new THREE.DirectionalLight(0xfff2d5, 3.1);
    sunlight.position.set(-18, 28, 12);
    sunlight.castShadow = state.settings.quality !== "low";

    if (sunlight.shadow) {
      sunlight.shadow.mapSize.set(1024, 1024);
      sunlight.shadow.camera.left = -35;
      sunlight.shadow.camera.right = 35;
      sunlight.shadow.camera.top = 35;
      sunlight.shadow.camera.bottom = -35;
      sunlight.shadow.bias = -0.0003;
    }

    scene.add(sunlight);

    const fillLight = new THREE.DirectionalLight(0xbadfff, 0.75);
    fillLight.position.set(15, 12, -15);
    scene.add(fillLight);
  }

  /* ============================================================
     10. MATÉRIAUX ET OBJETS 3D
  ============================================================ */

  function makeMaterial(color, options = {}) {
    return new THREE_ENGINE.MeshStandardMaterial({
      color,
      roughness: options.roughness ?? 0.78,
      metalness: options.metalness ?? 0,
      transparent: options.transparent ?? false,
      opacity: options.opacity ?? 1,
      side: options.side ?? THREE_ENGINE.FrontSide
    });
  }

  function addMesh(
    geometry,
    material,
    x = 0,
    y = 0,
    z = 0,
    options = {}
  ) {
    const mesh = new THREE_ENGINE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    mesh.castShadow = options.castShadow !== false;
    mesh.receiveShadow = options.receiveShadow !== false;

    if (options.rotationX) mesh.rotation.x = options.rotationX;
    if (options.rotationY) mesh.rotation.y = options.rotationY;
    if (options.rotationZ) mesh.rotation.z = options.rotationZ;

    if (options.scale) mesh.scale.set(
      options.scale.x ?? 1,
      options.scale.y ?? 1,
      options.scale.z ?? 1
    );

    state.scene.add(mesh);
    state.objects.push(mesh);

    return mesh;
  }

  function createBox(
    width, height, depth, color, x, y, z, options = {}
  ) {
    const geometry = new THREE_ENGINE.BoxGeometry(
      width, height, depth
    );

    return addMesh(
      geometry,
      makeMaterial(color, options.material || {}),
      x, y, z, options
    );
  }

  function createSphere(
    radius, color, x, y, z, segments = 16
  ) {
    return addMesh(
      new THREE_ENGINE.SphereGeometry(radius, segments, segments),
      makeMaterial(color),
      x, y, z
    );
  }

  /* ============================================================
     11. MONDE 3D
  ============================================================ */

  function createWorld() {
    const THREE = THREE_ENGINE;

    // Sol principal.
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(180, 180),
      makeMaterial(0x5d9d60)
    );

    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.08;
    ground.receiveShadow = true;
    ground.name = "world-ground";
    state.scene.add(ground);

    // Grande place centrale.
    createBox(
      18, 0.12, 18, 0xd9c8aa,
      0, 0.02, 0,
      { castShadow: false }
    );

    // Chemins du parc.
    createBox(
      4, 0.04, 52, 0xd9c8aa,
      0, 0.09, -1,
      { castShadow: false }
    );

    createBox(
      48, 0.04, 3.5, 0xd9c8aa,
      0, 0.1, 0,
      { castShadow: false }
    );

    createBox(
      3, 0.05, 26, 0xd9c8aa,
      -8, 0.1, 1,
      { castShadow: false }
    );

    createBox(
      3, 0.05, 26, 0xd9c8aa,
      8, 0.1, -1,
      { castShadow: false }
    );

    // Lac.
    const lake = addMesh(
      new THREE.CircleGeometry(6.5, 48),
      makeMaterial(0x4aa7cb, {
        roughness: 0.25,
        metalness: 0.12
      }),
      0, 0.13, -17,
      { rotationX: -Math.PI / 2, castShadow: false }
    );
    lake.name = "romantic-lake";

    // Bord du lac.
    const lakeRim = addMesh(
      new THREE.TorusGeometry(6.55, 0.24, 8, 64),
      makeMaterial(0xd8c9a8),
      0, 0.18, -17,
      { rotationX: Math.PI / 2 }
    );
    lakeRim.name = "lake-rim";

    // Îlots de verdure.
    [
      [-14, 1, -8, 7, 0.15, 5],
      [14, 1, -12, 8, 0.15, 7],
      [-15, 1, 12, 7, 0.15, 6],
      [15, 1, 12, 8, 0.15, 6]
    ].forEach(([x, y, z, sx, sy, sz]) => {
      const patch = addMesh(
        new THREE.CircleGeometry(1, 24),
        makeMaterial(0x4d8d50),
        x, 0.02, z,
        {
          rotationX: -Math.PI / 2,
          castShadow: false,
          scale: { x: sx, y: sy, z: sz }
        }
      );
      patch.position.y = 0.015;
    });

    // Fontaine.
    createBox(3.5, 0.45, 3.5, 0xd6d1c7, 0, 0.25, 5);
    createBox(2.8, 0.25, 2.8, 0x5aa9d0, 0, 0.6, 5);
    createBox(0.7, 2.1, 0.7, 0xe3d8c2, 0, 1.4, 5);
    createSphere(0.38, 0x76d6f5, 0, 2.55, 5, 20);

    // Kiosque.
    createBox(4, 0.25, 3.5, 0x9d6c43, 8, 0.35, -3);
    createBox(0.18, 2.5, 0.18, 0xf2d8ac, 6.3, 1.5, -4.4);
    createBox(0.18, 2.5, 0.18, 0xf2d8ac, 9.7, 1.5, -4.4);
    createBox(0.18, 2.5, 0.18, 0xf2d8ac, 6.3, 1.5, -1.6);
    createBox(0.18, 2.5, 0.18, 0xf2d8ac, 9.7, 1.5, -1.6);
    createBox(4.3, 0.35, 3.8, 0xc65c72, 8, 2.85, -3);

    // Bancs.
    createBench(-5, 1);
    createBench(5, 6);
    createBench(-11, -4);
    createBench(10, 8);

    // Bâtiments d'arrière-plan.
    const buildingColors = [
      0xe8d6c4, 0xe3c6b8, 0xc8d9e8,
      0xe5dcae, 0xd3c9e8, 0xe8d8ad
    ];

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const x = Math.cos(angle) * 31;
      const z = Math.sin(angle) * 31;
      const height = 5 + (i % 3) * 1.5;

      createBox(
        7, height, 6,
        buildingColors[i],
        x, height / 2, z
      );

      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          createBox(
            0.85, 1.05, 0.06,
            0x78b6d6,
            x - 1.7 + col * 3.4,
            1.5 + row * 2,
            z + 3.04
          );
        }
      }
    }

    // Collines de fond.
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const x = Math.cos(angle) * 47;
      const z = Math.sin(angle) * 47;

      const hill = addMesh(
        new THREE.SphereGeometry(1, 16, 12),
        makeMaterial(i % 2 ? 0x5d9860 : 0x699f69),
        x, 1.2, z,
        {
          scale: {
            x: 9 + (i % 3),
            y: 4 + (i % 2),
            z: 8 + (i % 4)
          },
          castShadow: false
        }
      );
      hill.name = "background-hill";
    }

    // Petites pierres décoratives.
    for (let i = 0; i < 28; i++) {
      const angle = i * 2.399;
      const radius = 11 + (i % 7) * 1.2;

      const stone = addMesh(
        new THREE.DodecahedronGeometry(0.22 + (i % 3) * 0.08, 0),
        makeMaterial(0xaaa69a),
        Math.cos(angle) * radius,
        0.15,
        Math.sin(angle) * radius
      );
      stone.rotation.set(angle, angle * 0.5, 0);
    }
  }

  function createBench(x, z) {
    createBox(2.2, 0.16, 0.6, 0x8b5634, x, 0.8, z);
    createBox(2.2, 0.75, 0.14, 0x9b6440, x, 1.15, z + 0.23);
    createBox(0.14, 0.7, 0.14, 0x4d4035, x - 0.8, 0.38, z);
    createBox(0.14, 0.7, 0.14, 0x4d4035, x + 0.8, 0.38, z);
  }

  /* ============================================================
     12. ARBRES, FLEURS ET DÉCORATIONS
  ============================================================ */

  function createTree(x, z, scale = 1) {
    const THREE = THREE_ENGINE;

    const trunk = addMesh(
      new THREE.CylinderGeometry(
        0.18 * scale, 0.27 * scale, 2.5 * scale, 10
      ),
      makeMaterial(0x775038),
      x, 1.25 * scale, z
    );

    trunk.name = "tree-trunk";

    const crownColors = [0x327f48, 0x438f4f, 0x559a55];

    for (let i = 0; i < 3; i++) {
      const crown = addMesh(
        new THREE.SphereGeometry(1.15 * scale, 14, 12),
        makeMaterial(crownColors[i]),
        x + (i - 1) * 0.32 * scale,
        2.65 * scale + i * 0.48 * scale,
        z + ((i % 2) ? 0.25 : -0.15) * scale
      );

      crown.castShadow = true;
      crown.name = "tree-crown";
    }
  }

  function createFlower(x, z, color) {
    const THREE = THREE_ENGINE;

    createBox(
      0.06, 0.45, 0.06,
      0x347d3d, x, 0.25, z
    );

    const flower = addMesh(
      new THREE.SphereGeometry(0.18, 10, 8),
      makeMaterial(color),
      x, 0.55, z
    );

    flower.name = "flower";
  }

  function createEnvironmentDetails() {
    const treePositions = [
      [-13, -13], [-16, -5], [-13, 6], [-15, 15],
      [-10, 14], [-8, -13], [13, -14], [16, -7],
      [14, 4], [16, 14], [10, 15], [11, -11],
      [-5, 12], [5, 12], [-12, 0], [12, 1],
      [-19, -12], [19, -13], [-19, 11], [19, 12],
      [-6, -23], [7, -24], [-18, -21], [18, -21]
    ];

    treePositions.forEach(([x, z], index) => {
      createTree(x, z, 0.8 + (index % 3) * 0.13);
    });

    const flowerColors = [
      0xff8eb3, 0xffd36e, 0xbda1ff,
      0xffffff, 0xf76f8e, 0x8dd8ff
    ];

    for (let i = 0; i < 70; i++) {
      const angle = i * 2.399;
      const radius = 7.5 + (i % 9) * 0.9;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      if (Math.abs(x) < 2.6 || Math.abs(z) < 2.6) continue;

      createFlower(
        x,
        z,
        flowerColors[i % flowerColors.length]
      );
    }

    // Lampadaires.
    const lampPositions = [
      [-3, -5], [3, -5], [-3, 7], [3, 7],
      [-9, 0], [9, 0], [-9, -8], [9, 8]
    ];

    lampPositions.forEach(([x, z]) => {
      createBox(0.16, 2.9, 0.16, 0x4c4d58, x, 1.45, z);
      createBox(0.72, 0.16, 0.72, 0xffe8a2, x, 3, z);
      createSphere(0.3, 0xffe8b0, x, 3, z, 12);
    });

    // Arcs décoratifs au-dessus de l'entrée.
    createBox(7, 0.28, 0.3, 0xf0d6b0, 0, 4.1, 10);
    createBox(0.25, 4.1, 0.3, 0xf0d6b0, -3.4, 2.05, 10);
    createBox(0.25, 4.1, 0.3, 0xf0d6b0, 3.4, 2.05, 10);
  }

  /* ============================================================
     13. PERSONNAGES 3D
  ============================================================ */

  function createCharacterModel(options = {}) {
    const THREE = THREE_ENGINE;
    const group = new THREE.Group();

    const skinColor = options.skin ?? 0xe0b18e;
    const hairColor = options.hair ?? 0x392c2a;
    const clothesColor = options.clothes ?? 0x508ecb;
    const accentColor = options.accent ?? 0xf4d9a0;

    const skinMaterial = makeMaterial(skinColor);
    const hairMaterial = makeMaterial(hairColor);
    const clothesMaterial = makeMaterial(clothesColor);
    const accentMaterial = makeMaterial(accentColor);
    const eyeMaterial = makeMaterial(0x2d2530);
    const shoeMaterial = makeMaterial(0x332b35);

    // Jambes.
    const legGeometry = new THREE.CapsuleGeometry(0.105, 0.48, 4, 8);

    const leftLeg = new THREE.Mesh(legGeometry, clothesMaterial);
    leftLeg.position.set(-0.15, 0.55, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, clothesMaterial);
    rightLeg.position.set(0.15, 0.55, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Chaussures.
    const shoeGeometry = new THREE.BoxGeometry(0.24, 0.13, 0.36);

    const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    leftShoe.position.set(-0.15, 0.12, -0.06);
    group.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    rightShoe.position.set(0.15, 0.12, -0.06);
    group.add(rightShoe);

    // Torse.
    const torso = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.28, 0.55, 5, 12),
      clothesMaterial
    );
    torso.position.y = 1.28;
    torso.castShadow = true;
    group.add(torso);

    // Col.
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.11, 0.18, 12),
      skinMaterial
    );
    neck.position.y = 1.68;
    group.add(neck);

    // Bras.
    const armGeometry = new THREE.CapsuleGeometry(0.085, 0.43, 4, 8);

    const leftArm = new THREE.Mesh(armGeometry, clothesMaterial);
    leftArm.position.set(-0.36, 1.28, 0);
    leftArm.rotation.z = -0.12;
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, clothesMaterial);
    rightArm.position.set(0.36, 1.28, 0);
    rightArm.rotation.z = 0.12;
    rightArm.castShadow = true;
    group.add(rightArm);

    // Mains.
    const handGeometry = new THREE.SphereGeometry(0.09, 10, 8);

    const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
    leftHand.position.set(-0.38, 0.99, 0);
    group.add(leftHand);

    const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
    rightHand.position.set(0.38, 0.99, 0);
    group.add(rightHand);

    // Tête.
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.29, 20, 16),
      skinMaterial
    );
    head.position.y = 1.92;
    head.castShadow = true;
    group.add(head);

    // Cheveux.
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.3, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.62
      ),
      hairMaterial
    );
    hair.position.set(0, 2.04, -0.015);
    hair.castShadow = true;
    group.add(hair);

    // Yeux.
    [-0.105, 0.105].forEach((x) => {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 8, 8),
        eyeMaterial
      );
      eye.position.set(x, 1.94, 0.263);
      group.add(eye);
    });

    // Nez.
    const nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 8),
      skinMaterial
    );
    nose.position.set(0, 1.88, 0.29);
    group.add(nose);

    // Petit accessoire.
    const accessory = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 10, 8),
      accentMaterial
    );
    accessory.position.set(0.19, 2.12, 0.15);
    group.add(accessory);

    group.userData.parts = {
      leftLeg,
      rightLeg,
      leftArm,
      rightArm,
      leftHand,
      rightHand
    };

    group.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return group;
  }

  function createPlayer() {
    const THREE = THREE_ENGINE;

    state.player = new THREE.Group();
    state.player.position.set(0, 0, 8);
    state.player.name = "player-character";

    state.playerModel = createCharacterModel({
      skin: 0xc98f6a,
      hair: 0x2c2020,
      clothes: 0x3f8bc7,
      accent: 0xffd16e
    });

    state.player.add(state.playerModel);
    state.scene.add(state.player);

    state.playerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.035, 8, 36),
      new THREE.MeshBasicMaterial({
        color: 0xffd16e,
        transparent: true,
        opacity: 0.85
      })
    );

    state.playerRing.rotation.x = Math.PI / 2;
    state.playerRing.position.y = 0.08;
    state.player.add(state.playerRing);
  }

  function createNPCs() {
    const THREE = THREE_ENGINE;

    state.npcs = NPC_DEFINITIONS.map((definition, index) => {
      const group = new THREE.Group();

      group.position.set(definition.x, 0, definition.z);
      group.name = `npc-${definition.name.toLowerCase()}`;

      const model = createCharacterModel({
        skin: definition.skin,
        hair: definition.hair,
        clothes: definition.clothes,
        accent: definition.color
      });

      group.add(model);

      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 12, 10),
        new THREE.MeshBasicMaterial({
          color: definition.color
        })
      );

      marker.position.y = 2.75;
      group.add(marker);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.65, 0.025, 8, 36),
        new THREE.MeshBasicMaterial({
          color: definition.color,
          transparent: true,
          opacity: 0.72
        })
      );

      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.07;
      group.add(ring);

      state.scene.add(group);

      return {
        ...definition,
        group,
        model,
        marker,
        ring,
        index,
        baseY: 0
      };
    });
  }

  /* ============================================================
     14. MARQUEUR DE MISSION
  ============================================================ */

  function createMissionMarker() {
    const THREE = THREE_ENGINE;

    const group = new THREE.Group();

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.06, 10, 42),
      new THREE.MeshBasicMaterial({
        color: 0xffd16e,
        transparent: true,
        opacity: 0.9
      })
    );

    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.12;
    group.add(ring);

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.24, 2.5, 12, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xffd16e,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide
      })
    );

    beam.position.y = 1.3;
    group.add(beam);

    const top = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xfff0b5 })
    );

    top.position.y = 2.55;
    group.add(top);

    group.visible = false;
    state.scene.add(group);

    state.missionMarker = group;
  }

  function updateMissionMarker() {
    const mission = BASE_MISSION_DATA[state.currentMission];
    if (!mission || !state.missionMarker) return;

    const location = LOCATION_COORDS[mission.location] ||
      LOCATION_COORDS["Place centrale"];

    state.missionMarker.position.set(location.x, 0, location.z);
    state.missionMarker.visible = true;
  }

  /* ============================================================
     15. REDIMENSIONNEMENT ET CAMÉRA
  ============================================================ */

  function resizeRenderer() {
    if (!state.renderer || !state.camera) return;

    const canvas = $("loveGameCanvas");
    const world = $("gameWorld");

    if (!canvas || !world) return;

    const rect = world.getBoundingClientRect();

    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    state.renderer.setSize(width, height, false);
    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();
  }

  function updateCamera(delta = 1) {
    if (!state.player || !state.camera) return;

    const THREE = THREE_ENGINE;
    const target = state.player.position;

    const horizontal = Math.cos(state.cameraPitch) *
                       state.cameraDistance;

    const desired = new THREE.Vector3(
      target.x + Math.sin(state.cameraYaw) * horizontal,
      target.y + 1.5 +
        Math.sin(state.cameraPitch) * state.cameraDistance,
      target.z + Math.cos(state.cameraYaw) * horizontal
    );

    const factor = 1 - Math.exp(-Math.max(0.001, delta) * 7);

    state.camera.position.lerp(desired, factor);

    state.camera.lookAt(
      target.x,
      target.y + 1.25,
      target.z
    );
  }

  /* ============================================================
     16. CONTRÔLES DU JOUEUR
  ============================================================ */

  function isGameVisible() {
    return Boolean(
      $("gameScreen") &&
      !$("gameScreen").classList.contains("hidden")
    );
  }

  function setJoystick(clientX, clientY) {
    const base = $("joystickBase");
    const thumb = $("joystickThumb");
    if (!base || !thumb) return;

    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxDistance = Math.max(15, rect.width * 0.31);
    let dx = clientX - centerX;
    let dy = clientY - centerY;

    const length = Math.sqrt(dx * dx + dy * dy);

    if (length > maxDistance) {
      dx = (dx / length) * maxDistance;
      dy = (dy / length) * maxDistance;
    }

    thumb.style.transform =
      `translate(${dx}px, ${dy}px)`;

    state.moveX = dx / maxDistance;
    state.moveZ = dy / maxDistance;
  }

  function resetJoystick() {
    state.moveX = 0;
    state.moveZ = 0;
    state.joystickPointer = null;

    const thumb = $("joystickThumb");
    if (thumb) thumb.style.transform = "translate(0px, 0px)";
  }

  function movePlayer(delta) {
    if (!state.player || state.paused || !isGameVisible()) return;

    const THREE = THREE_ENGINE;

    let forward = 0;
    let sideways = 0;

    if (state.keys.KeyW || state.keys.ArrowUp) forward -= 1;
    if (state.keys.KeyS || state.keys.ArrowDown) forward += 1;
    if (state.keys.KeyA || state.keys.ArrowLeft) sideways -= 1;
    if (state.keys.KeyD || state.keys.ArrowRight) sideways += 1;

    forward += state.moveZ;
    sideways += state.moveX;

    const magnitude = Math.sqrt(
      forward * forward + sideways * sideways
    );

    if (magnitude > 1) {
      forward /= magnitude;
      sideways /= magnitude;
    }

    if (magnitude > 0.05) {
      const speed = state.isRunning ? 8.4 : 4.6;
      const angle = state.cameraYaw;

      const worldX =
        sideways * Math.cos(angle) +
        forward * Math.sin(angle);

      const worldZ =
        -forward * Math.cos(angle) +
        sideways * Math.sin(angle);

      const nextX = state.player.position.x +
        worldX * speed * delta;

      const nextZ = state.player.position.z +
        worldZ * speed * delta;

      state.player.position.x = clamp(nextX, -24, 24);
      state.player.position.z = clamp(nextZ, -29, 24);

      state.player.rotation.y = Math.atan2(worldX, worldZ);

      if (state.playerModel) {
        const parts = state.playerModel.userData.parts;
        const swing = Math.sin(performance.now() * 0.012) * 0.22;

        if (parts) {
          parts.leftArm.rotation.x = swing;
          parts.rightArm.rotation.x = -swing;
          parts.leftLeg.rotation.x = -swing;
          parts.rightLeg.rotation.x = swing;
        }
      }
    } else if (state.playerModel) {
      const parts = state.playerModel.userData.parts;

      if (parts) {
        parts.leftArm.rotation.x *= 0.8;
        parts.rightArm.rotation.x *= 0.8;
        parts.leftLeg.rotation.x *= 0.8;
        parts.rightLeg.rotation.x *= 0.8;
      }
    }

    // Gravité et saut.
    if (state.isJumping) {
      state.playerVelocityY -= 15 * delta;
      state.player.position.y += state.playerVelocityY * delta;

      if (state.player.position.y <= 0) {
        state.player.position.y = 0;
        state.playerVelocityY = 0;
        state.isJumping = false;
      }
    }

    if (state.playerRing) {
      state.playerRing.rotation.z += delta * 0.4;
    }

    updateCamera(delta);
    updateNearbyNPC();
  }

  function jumpPlayer() {
    if (!state.player || state.paused || state.isJumping) return;
    if (!isGameVisible()) return;

    state.playerVelocityY = 6.5;
    state.isJumping = true;
    playTone(510, 0.1);
  }

  function setRunning(value) {
    state.isRunning = Boolean(value);
    const button = $("runButton");

    if (button) {
      button.classList.toggle("active", state.isRunning);
      const label = button.querySelector("small");
      if (label) label.textContent =
        state.isRunning ? "Marche" : "Courir";
    }
  }

  /* ============================================================
     17. PROXIMITÉ ET INTERACTION
  ============================================================ */

  function updateNearbyNPC() {
    if (!state.player || !state.npcs.length) return;

    let nearest = null;
    let nearestDistance = Infinity;

    state.npcs.forEach((npc) => {
      const distance = distanceXZ(
        state.player.position,
        npc.group.position
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = npc;
      }
    });

    const inRange = nearest && nearestDistance < 3.2;

    state.interactableNPC = inRange ? nearest : null;

    const prompt = $("interactionPrompt");

    if (prompt) {
      prompt.classList.toggle("hidden", !inRange || state.paused);

      if (inRange) {
        safeText("interactionIcon", nearest.avatar || "♡");
        safeText("interactionText", `Parler à ${nearest.name}`);
      }
    }
  }

  function getMissionNPC() {
    const mission = BASE_MISSION_DATA[state.currentMission];
    if (!mission) return null;

    return state.npcs.find((npc) => npc.name === mission.person) || null;
  }

  function interactWithNPC() {
    if (state.paused || !isGameVisible()) return;

    const npc = state.interactableNPC || getMissionNPC();

    if (!npc) {
      notify("Approchez-vous d'un personnage pour interagir.");
      return;
    }

    const distance = state.player
      ? distanceXZ(state.player.position, npc.group.position)
      : Infinity;

    if (distance > 3.2 && state.player) {
      notify(`Approchez-vous de ${npc.name} pour discuter.`);
      return;
    }

    openDialogue(npc);
  }

  /* ============================================================
     18. DIALOGUES
  ============================================================ */

  function openDialogue(npc) {
    if (!npc) return;

    state.dialogueNPC = npc;
    state.dialogueIndex = 0;
    state.activeDialogue = BASE_MISSION_DATA[state.currentMission];

    if (!state.activeDialogue) return;

    state.paused = true;
    hideElement("interactionPrompt");
    showElement("dialoguePanel");

    safeText("speakerName", npc.name);
    safeText("speakerAvatar", npc.avatar || "♡");

    const text = state.activeDialogue.dialogue;
    safeText("dialogueText", text);

    const panel = $("dialogueText");
    if (panel) {
      panel.style.display = state.settings.subtitlesEnabled
        ? ""
        : "none";
    }

    renderDialogueChoices();
    speak(text);
    playTone(720, 0.14);
  }

  function renderDialogueChoices() {
    const container = $("dialogueChoices");
    if (!container) return;

    container.replaceChildren();

    const choices = [
      {
        label: "Répondre avec bienveillance",
        text: state.activeDialogue?.response ||
          "Je vous remercie pour cette conversation."
      },
      {
        label: "Poser une question",
        text: "J'aimerais en apprendre davantage. Pouvez-vous m'en dire plus ?"
      }
    ];

    state.dialogueChoices = choices;

    choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "secondary-button dialogue-choice-button";
      button.textContent = choice.label;

      button.addEventListener("click", () => {
        state.dialogueIndex = index + 1;

        safeText("dialogueText", choice.text);
        if (state.settings.subtitlesEnabled) speak(choice.text);

        container.querySelectorAll("button").forEach((item) => {
          item.disabled = true;
        });

        const nextButton = $("nextDialogueButton");
        if (nextButton) {
          nextButton.textContent = "Terminer la conversation ✓";
        }
      });

      container.appendChild(button);
    });

    const nextButton = $("nextDialogueButton");
    if (nextButton) nextButton.textContent = "Continuer →";
  }

  function closeDialogue() {
    hideElement("dialoguePanel");
    stopVoice();
    state.dialogueNPC = null;
    state.activeDialogue = null;
    state.paused = false;
    updateNearbyNPC();
  }

  function nextDialogue() {
    if (!state.activeDialogue) {
      closeDialogue();
      return;
    }

    if (state.dialogueIndex === 0) {
      const response = state.activeDialogue.response ||
        "Merci pour cette conversation.";

      state.dialogueIndex = 1;
      safeText("dialogueText", response);

      const choices = $("dialogueChoices");
      if (choices) {
        choices.querySelectorAll("button").forEach((button) => {
          button.disabled = true;
        });
      }

      if (state.settings.subtitlesEnabled) speak(response);

      const nextButton = $("nextDialogueButton");
      if (nextButton) {
        nextButton.textContent = "Terminer la conversation ✓";
      }

      return;
    }

    const missionIndex = state.currentMission;
    closeDialogue();
    completeMission(missionIndex);
  }

  function repeatDialogue() {
    const text = $("dialogueText")?.textContent;
    if (text) speak(text);
  }

  /* ============================================================
     19. MISSIONS ET PROGRESSION
  ============================================================ */

  function getMissionNumber(index) {
    return String(index + 1).padStart(2, "0");
  }

  function renderCurrentMission() {
    const mission = BASE_MISSION_DATA[state.currentMission];
    if (!mission) return;

    safeText(
      "missionNumber",
      `MISSION ${getMissionNumber(state.currentMission)} / ${TOTAL_MISSIONS}`
    );

    safeText("missionTitle", mission.title);
    safeText("objectiveText", mission.objective);

    updateObjectiveProgress();
    updateMissionMarker();
    renderMissionsList();
  }

  function updateObjectiveProgress() {
    const completed = state.completedMissions.includes(
      state.currentMission
    );

    const value = completed ? 1 : state.missionProgress;
    const percentage = clamp(value * 100, 0, 100);

    const bar = $("objectiveProgressBar");
    if (bar) bar.style.width = `${percentage}%`;

    safeText(
      "objectiveProgressText",
      `${completed ? 1 : Math.round(value)} / 1`
    );
  }

  function completeMission(index) {
    if (index !== state.currentMission) return;
    if (state.completedMissions.includes(index)) return;

    state.completedMissions.push(index);
    state.missionProgress = 1;

    saveGame(true);
    renderMissionsList();
    updateObjectiveProgress();

    const mission = BASE_MISSION_DATA[index];

    safeText("completionTitle", "Mission accomplie !");
    safeText(
      "completionMessage",
      `Vous avez terminé « ${mission.title} ». Continuez votre aventure pour découvrir la suite de votre histoire.`
    );

    safeText(
      "completionProgress",
      `${state.completedMissions.length} / ${TOTAL_MISSIONS}`
    );

    const nextButton = $("nextMissionButton");

    if (nextButton) {
      nextButton.textContent =
        index >= TOTAL_MISSIONS - 1
          ? "Terminer l'aventure ♥"
          : "Mission suivante →";
    }

    setScreen("missionCompleteScreen");
    playTone(880, 0.22);
  }

  function goToNextMission() {
    if (state.currentMission >= TOTAL_MISSIONS - 1) {
      showEnding();
      return;
    }

    state.currentMission += 1;
    state.missionProgress = 0;
    state.paused = false;

    setScreen("gameScreen");
    renderCurrentMission();

    if (state.player) {
      const npc = getMissionNPC();

      if (npc) {
        const direction = new THREE_ENGINE.Vector3(
          state.player.position.x - npc.group.position.x,
          0,
          state.player.position.z - npc.group.position.z
        ).normalize();

        state.player.position.set(
          clamp(npc.group.position.x + direction.x * 2.2, -24, 24),
          0,
          clamp(npc.group.position.z + direction.z * 2.2, -29, 24)
        );
      }
    }

    saveGame(true);
    notify(`Mission ${state.currentMission + 1} : ${BASE_MISSION_DATA[state.currentMission].title}`);
  }

  function renderMissionsList() {
    const container = $("missionsList");
    if (!container) return;

    container.replaceChildren();

    const completedCount = state.completedMissions.length;
    const percent = (completedCount / TOTAL_MISSIONS) * 100;

    const overallBar = $("overallProgressBar");
    if (overallBar) overallBar.style.width = `${percent}%`;

    safeText(
      "missionsSummary",
      `${completedCount} mission${completedCount > 1 ? "s" : ""} terminée${completedCount > 1 ? "s" : ""} sur ${TOTAL_MISSIONS}`
    );

    BASE_MISSION_DATA.forEach((mission, index) => {
      const completed = state.completedMissions.includes(index);
      const current = index === state.currentMission;

      const item = document.createElement("article");
      item.className = "mission-item";

      if (completed) item.classList.add("mission-completed");
      if (current) item.classList.add("mission-current");

      const button = document.createElement("button");
      button.type = "button";
      button.className = "mission-item-button";

      const number = document.createElement("span");
      number.className = "mission-item-number";
      number.textContent = getMissionNumber(index);

      const content = document.createElement("span");
      content.className = "mission-item-content";

      const title = document.createElement("strong");
      title.textContent = mission.title;

      const objective = document.createElement("small");
      objective.textContent = mission.objective;

      content.append(title, objective);

      const status = document.createElement("span");
      status.className = "mission-item-status";
      status.textContent = completed ? "✓" : current ? "●" : "○";

      button.append(number, content, status);
      button.disabled = !completed && !current;

      button.addEventListener("click", () => {
        if (!completed && !current) return;

        state.currentMission = index;
        state.missionProgress = completed ? 1 : 0;

        renderCurrentMission();
        setScreen("gameScreen");
        state.paused = false;
        saveGame(true);
      });

      item.appendChild(button);
      container.appendChild(item);
    });
  }

  function showEnding() {
    state.paused = true;
    saveGame(true);
    setScreen("endingScreen");
    playTone(920, 0.35);
  }

  function restartGame() {
    state.currentMission = 0;
    state.completedMissions = [];
    state.missionProgress = 0;
    state.paused = false;

    if (state.player) {
      state.player.position.set(0, 0, 8);
      state.player.rotation.set(0, 0, 0);
    }

    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (_) {}

    setScreen("gameScreen");
    renderCurrentMission();
    saveGame(true);
    notify("Nouvelle aventure commencée.");
  }

  /* ============================================================
     20. PAUSE ET NAVIGATION
  ============================================================ */

  function pauseGame() {
    if (!isGameVisible()) return;

    state.paused = true;
    setRunning(false);
    hideElement("dialoguePanel");
    stopVoice();
    setScreen("pauseScreen");
  }

  function resumeGame() {
    state.paused = false;
    setScreen("gameScreen");
    updateNearbyNPC();
    if (state.clock) state.clock.getDelta();
  }

  function openMissions(returnScreen) {
    state.missionsReturnScreen = returnScreen ||
      (isGameVisible() ? "gameScreen" : "mainMenu");

    renderMissionsList();
    setScreen("missionsScreen");
    state.paused = true;
  }

  function closeMissions() {
    const destination = state.missionsReturnScreen || "mainMenu";
    setScreen(destination);

    state.paused = destination !== "gameScreen";
    if (destination === "gameScreen") updateNearbyNPC();
  }

  function openSettings() {
    applySettingsToUI();
    setScreen("settingsScreen");
    state.paused = true;
  }

  function closeSettings() {
    const destination = state.previousScreen === "settingsScreen"
      ? (isGameVisible() ? "gameScreen" : "mainMenu")
      : state.previousScreen;

    setScreen(
      destination === "settingsScreen" ? "mainMenu" : destination
    );

    state.paused = destination !== "gameScreen";
  }

  function openCredits() {
    setScreen("creditsScreen");
    state.paused = true;
  }

  function closeCredits() {
    setScreen("mainMenu");
    state.paused = true;
  }

  function returnToMainMenu() {
    saveGame(true);
    stopVoice();
    setScreen("mainMenu");
    state.paused = true;
    setRunning(false);
  }

  /* ============================================================
     21. CONFIRMATION
  ============================================================ */

  function openConfirmation(title, message, callback) {
    state.pendingConfirmation =
      typeof callback === "function" ? callback : null;

    safeText("confirmationTitle", title);
    safeText("confirmationMessage", message);

    setScreen("confirmationScreen");
  }

  function closeConfirmation() {
    state.pendingConfirmation = null;
    setScreen("mainMenu");
  }

  function acceptConfirmation() {
    const callback = state.pendingConfirmation;
    state.pendingConfirmation = null;

    hideElement("confirmationScreen");

    if (typeof callback === "function") {
      callback();
    } else {
      setScreen("mainMenu");
    }
  }

  /* ============================================================
     22. DÉMARRAGE ET CHARGEMENT
  ============================================================ */

  async function runLoadingSequence() {
    const stages = [
      [8, "Préparation de votre histoire..."],
      [22, "Chargement des 35 missions..."],
      [38, "Initialisation du moteur graphique..."],
      [58, "Construction du monde 3D..."],
      [78, "Préparation des personnages..."],
      [92, "Configuration des contrôles..."],
      [100, "Votre aventure est prête."]
    ];

    for (const [percent, message] of stages) {
      setLoadingProgress(percent, message);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async function startGame(continueExisting = false) {
    if (state.loading) return;

    state.loading = true;
    state.paused = false;

    setScreen("gameScreen");
    setWorldLoading(true, "Préparation du monde 3D...");

    try {
      initializeAudio();

      if (state.audioContext?.state === "suspended") {
        state.audioContext.resume().catch(() => {});
      }

      await initializeThree();

      if (continueExisting) {
        const data = loadSaveData();

        if (data) {
          state.currentMission = data.currentMission;
          state.completedMissions = data.completedMissions;
          state.missionProgress = data.missionProgress;

          if (state.player && data.playerPosition) {
            state.player.position.set(
              clamp(Number(data.playerPosition.x) || 0, -24, 24),
              0,
              clamp(Number(data.playerPosition.z) || 8, -29, 24)
            );
          }

          if (data.camera) {
            state.cameraYaw = Number(data.camera.yaw) || 0;
            state.cameraPitch = clamp(
              Number(data.camera.pitch) || 0.28,
              -0.15,
              0.9
            );
            state.cameraDistance = clamp(
              Number(data.camera.distance) || 7.5,
              4,
              14
            );
          }
        }
      } else {
        state.currentMission = 0;
        state.completedMissions = [];
        state.missionProgress = 0;

        if (state.player) state.player.position.set(0, 0, 8);
      }

      renderCurrentMission();
      updateContinueButton();

      state.running = true;
      state.paused = false;

      if (!state.animationFrame) {
        state.clock.start();
        state.animationFrame = requestAnimationFrame(renderFrame);
      }

      setWorldLoading(false);
      saveGame(true);
    } catch (error) {
      console.error("[FOBAS Amour] Démarrage impossible :", error);

      showError(
        "Impossible de démarrer le jeu",
        error.message || "Une erreur est survenue pendant le chargement."
      );
    } finally {
      state.loading = false;
    }
  }

  /* ============================================================
     23. BOUCLE DE RENDU 3D
  ============================================================ */

  function renderFrame(timestamp) {
    state.animationFrame = requestAnimationFrame(renderFrame);

    if (!state.renderer || !state.scene || !state.camera) return;

    const delta = state.clock
      ? Math.min(state.clock.getDelta(), 0.05)
      : 0.016;

    state.lastFrameTime = timestamp;

    if (state.worldReady) {
      if (!state.paused) {
        movePlayer(delta);

        // Animation des personnages.
        state.npcs.forEach((npc, index) => {
          npc.marker.position.y =
            2.75 + Math.sin(timestamp * 0.002 + index) * 0.13;

          npc.ring.rotation.z += delta * 0.25;

          npc.model.position.y =
            Math.sin(timestamp * 0.0015 + index * 1.8) * 0.035;
        });

        // Animation du marqueur de mission.
        if (state.missionMarker) {
          state.missionMarker.rotation.y += delta * 0.5;

          state.missionMarker.children.forEach((child, index) => {
            if (index === 1) {
              child.material.opacity =
                0.16 + (Math.sin(timestamp * 0.003) + 1) * 0.06;
            }
          });
        }

        // Eau animée de la fontaine et du lac.
        if (state.scene) {
          const lake = state.scene.getObjectByName("romantic-lake");

          if (lake) {
            lake.material.color.setHSL(
              0.54,
              0.52,
              0.49 + Math.sin(timestamp * 0.0008) * 0.025
            );
          }
        }
      }

      try {
        state.renderer.render(state.scene, state.camera);
      } catch (error) {
        console.error("[FOBAS Amour] Erreur de rendu :", error);
      }
    }
  }

  /* ============================================================
     24. CLAVIER
  ============================================================ */

  function setupKeyboardEvents() {
    window.addEventListener("keydown", (event) => {
      state.keys[event.code] = true;

      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"]
          .includes(event.code)
      ) {
        if (isGameVisible()) event.preventDefault();
      }

      if (event.repeat) return;

      if (event.code === "Escape") {
        if (!$("dialoguePanel")?.classList.contains("hidden")) {
          closeDialogue();
        } else if (isGameVisible()) {
          pauseGame();
        } else if (!$("pauseScreen")?.classList.contains("hidden")) {
          resumeGame();
        } else if (!$("missionsScreen")?.classList.contains("hidden")) {
          closeMissions();
        }
      }

      if (event.code === "KeyE" || event.code === "Enter") {
        if (isGameVisible()) {
          if (!$("dialoguePanel")?.classList.contains("hidden")) {
            nextDialogue();
          } else {
            interactWithNPC();
          }
        }
      }

      if (event.code === "Space" && isGameVisible()) {
        jumpPlayer();
      }

      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        setRunning(true);
      }
    });

    window.addEventListener("keyup", (event) => {
      state.keys[event.code] = false;

      if (
        event.code === "ShiftLeft" ||
        event.code === "ShiftRight"
      ) {
        setRunning(false);
      }
    });

    window.addEventListener("blur", () => {
      state.keys = Object.create(null);
      resetJoystick();
      setRunning(false);
    });
  }

  /* ============================================================
     25. JOYSTICK TACTILE
  ============================================================ */

  function setupJoystickEvents() {
    const base = $("joystickBase");
    if (!base) return;

    base.addEventListener("pointerdown", (event) => {
      if (!isGameVisible() || state.paused) return;

      event.preventDefault();
      state.joystickPointer = event.pointerId;

      try {
        base.setPointerCapture(event.pointerId);
      } catch (_) {}

      setJoystick(event.clientX, event.clientY);
    });

    base.addEventListener("pointermove", (event) => {
      if (state.joystickPointer !== event.pointerId) return;

      event.preventDefault();
      setJoystick(event.clientX, event.clientY);
    });

    ["pointerup", "pointercancel", "lostpointercapture"].forEach((name) => {
      base.addEventListener(name, (event) => {
        if (
          state.joystickPointer === null ||
          state.joystickPointer === event.pointerId
        ) {
          resetJoystick();
        }
      });
    });
  }

  /* ============================================================
     26. CAMÉRA TACTILE ET ZOOM PAR PINCEMENT
  ============================================================ */

  function pointerDistance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function setupCameraTouchEvents() {
    const world = $("gameWorld");
    if (!world) return;

    let lastPinchDistance = 0;
    let lastSinglePointer = null;

    world.addEventListener("pointerdown", (event) => {
      if (!isGameVisible() || state.paused) return;

      // Ne pas capturer les gestes provenant des boutons ou du joystick.
      if (event.target.closest("button, .movement-control")) return;

      state.cameraPointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY
      });

      if (state.cameraPointers.size === 1) {
        lastSinglePointer = {
          x: event.clientX,
          y: event.clientY
        };
      } else if (state.cameraPointers.size === 2) {
        const points = [...state.cameraPointers.values()];
        lastPinchDistance = pointerDistance(points[0], points[1]);
      }

      try {
        world.setPointerCapture(event.pointerId);
      } catch (_) {}
    });

    world.addEventListener("pointermove", (event) => {
      if (!state.cameraPointers.has(event.pointerId)) return;

      const oldPoint = state.cameraPointers.get(event.pointerId);

      state.cameraPointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY
      });

      if (state.cameraPointers.size === 1 && lastSinglePointer) {
        const dx = event.clientX - lastSinglePointer.x;
        const dy = event.clientY - lastSinglePointer.y;

        state.cameraYaw -=
          dx * 0.006 * state.settings.sensitivity;

        state.cameraPitch = clamp(
          state.cameraPitch +
          dy * 0.004 * state.settings.sensitivity,
          -0.15,
          0.9
        );

        lastSinglePointer = {
          x: event.clientX,
          y: event.clientY
        };
      } else if (state.cameraPointers.size === 2) {
        const points = [...state.cameraPointers.values()];
        const newDistance = pointerDistance(points[0], points[1]);

        if (lastPinchDistance > 0) {
          const change = newDistance - lastPinchDistance;

          state.cameraDistance = clamp(
            state.cameraDistance - change * 0.018,
            4,
            14
          );
        }

        lastPinchDistance = newDistance;
      }

      if (oldPoint) event.preventDefault();
    }, { passive: false });

    function releasePointer(event) {
      state.cameraPointers.delete(event.pointerId);

      if (state.cameraPointers.size === 1) {
        const point = [...state.cameraPointers.values()][0];
        lastSinglePointer = { x: point.x, y: point.y };
      } else {
        lastSinglePointer = null;
      }

      if (state.cameraPointers.size < 2) {
        lastPinchDistance = 0;
      }
    }

    ["pointerup", "pointercancel", "lostpointercapture"].forEach((name) => {
      world.addEventListener(name, releasePointer);
    });

    // Zoom avec la molette sur ordinateur.
    world.addEventListener("wheel", (event) => {
      if (!isGameVisible() || state.paused) return;

      event.preventDefault();

      state.cameraDistance = clamp(
        state.cameraDistance + event.deltaY * 0.008,
        4,
        14
      );
    }, { passive: false });
  }

  /* ============================================================
     27. BOUTONS ET ÉVÉNEMENTS DE L'INTERFACE
  ============================================================ */

  function onClick(id, callback) {
    const element = $(id);
    if (!element) {
      console.warn(`[FOBAS Amour] Élément HTML absent : #${id}`);
      return;
    }

    element.addEventListener("click", (event) => {
      event.preventDefault();

      try {
        callback(event);
      } catch (error) {
        console.error(`[FOBAS Amour] Erreur bouton #${id} :`, error);
        notify("Une erreur est survenue. Réessayez.");
      }
    });
  }

  function setupButtons() {
    onClick("newGameButton", () => {
      openConfirmation(
        "Nouvelle aventure",
        "Commencer une nouvelle aventure ? La progression précédente sera remplacée.",
        () => startGame(false)
      );
    });

    onClick("continueGameButton", () => {
      if ($("continueGameButton")?.disabled) return;
      startGame(true);
    });

    onClick("missionsMenuButton", () => {
      openMissions("mainMenu");
    });

    onClick("settingsButton", openSettings);
    onClick("creditsButton", openCredits);
    onClick("closeCreditsButton", closeCredits);

    onClick("pauseButton", pauseGame);
    onClick("resumeButton", resumeGame);

    onClick("openMissionsButton", () => {
      openMissions("gameScreen");
    });

    onClick("closeMissionsButton", closeMissions);

    onClick("pauseMissionsButton", () => {
      openMissions("pauseScreen");
    });

    onClick("saveGameButton", () => {
      saveGame(false);
    });

    onClick("returnToMenuButton", () => {
      openConfirmation(
        "Retour au menu",
        "Voulez-vous retourner au menu principal ? Votre progression sera sauvegardée.",
        returnToMainMenu
      );
    });

    onClick("closeSettingsButton", closeSettings);
    onClick("saveSettingsButton", saveSettings);

    onClick("interactionPrompt", interactWithNPC);
    onClick("talkButton", interactWithNPC);
    onClick("jumpButton", jumpPlayer);
    onClick("repeatDialogueButton", repeatDialogue);
    onClick("nextDialogueButton", nextDialogue);
    onClick("closeDialogueButton", closeDialogue);

    onClick("nextMissionButton", goToNextMission);
    onClick("completionMenuButton", returnToMainMenu);

    onClick("restartGameButton", () => {
      openConfirmation(
        "Recommencer",
        "Voulez-vous recommencer les 35 missions depuis le début ?",
        restartGame
      );
    });

    onClick("endingMenuButton", returnToMainMenu);

    onClick("cancelConfirmationButton", () => {
      state.pendingConfirmation = null;
      setScreen("mainMenu");
    });

    onClick("acceptConfirmationButton", acceptConfirmation);

    onClick("retryButton", () => {
      state.worldReady = false;

      if (state.renderer) {
        try {
          state.renderer.dispose();
        } catch (_) {}
      }

      state.renderer = null;
      state.scene = null;
      state.camera = null;
      state.player = null;
      state.playerModel = null;
      state.npcs = [];
      state.objects = [];
      state.missionMarker = null;

      startGame(false);
    });

    onClick("errorMenuButton", returnToMainMenu);

    const runButton = $("runButton");
    if (runButton) {
      runButton.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        setRunning(true);
      });

      ["pointerup", "pointercancel", "pointerleave"].forEach((name) => {
        runButton.addEventListener(name, () => setRunning(false));
      });

      runButton.addEventListener("click", () => {
        setRunning(!state.isRunning);
      });
    }
  }

  /* ============================================================
     28. ÉVÉNEMENTS GLOBAUX
  ============================================================ */

  function setupGlobalEvents() {
    if (state.initializedEvents) return;
    state.initializedEvents = true;

    setupKeyboardEvents();
    setupJoystickEvents();
    setupCameraTouchEvents();
    setupButtons();

    window.addEventListener("beforeunload", () => {
      saveGame(true);
      stopVoice();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        saveGame(true);
        stopVoice();
      }
    });

    // Sauvegarde périodique.
    state.autosaveTimer = setInterval(() => {
      if (state.worldReady && state.running) {
        saveGame(true);
      }
    }, 30000);
  }

  /* ============================================================
     29. PROFIL LOCAL
  ============================================================ */

  function initializeProfile() {
    try {
      let profile = localStorage.getItem(PROFILE_KEY);

      if (!profile) {
        profile = JSON.stringify({
          id: `FOBAS-${Date.now()}`,
          createdAt: new Date().toISOString(),
          version: APP_VERSION
        });

        localStorage.setItem(PROFILE_KEY, profile);
      }
    } catch (error) {
      console.warn("[FOBAS Amour] Profil local indisponible :", error);
    }
  }

  /* ============================================================
     30. DÉMARRAGE DE L'APPLICATION
  ============================================================ */

  async function boot() {
    if (state.initialized || state.loading) return;

    loadSettings();
    applySettingsToUI();
    initializeProfile();
    updateContinueButton();
    renderMissionsList();
    setupGlobalEvents();

    showElement("loadingScreen");
    hideElement("mainMenu");
    hideElement("gameScreen");

    try {
      await runLoadingSequence();

      hideElement("loadingScreen");
      showElement("mainMenu");

      state.paused = true;
      state.initialized = true;

      safeText("saveStatus", "Sauvegarde locale prête");
      updateContinueButton();
    } catch (error) {
      console.error("[FOBAS Amour] Erreur de démarrage :", error);

      hideElement("loadingScreen");

      showError(
        "Erreur de démarrage",
        error.message || "Le jeu n'a pas pu démarrer."
      );
    }
  }

  /* ============================================================
     31. API PUBLIQUE
  ============================================================ */

  window.FOBASAmour = {
    version: APP_VERSION,

    start: () => startGame(false),
    continue: () => startGame(true),
    pause: pauseGame,
    resume: resumeGame,

    save: () => saveGame(false),

    getProgress: () => ({
      currentMission: state.currentMission + 1,
      completedMissions: [...state.completedMissions],
      totalMissions: TOTAL_MISSIONS,
      percentage: Math.round(
        state.completedMissions.length / TOTAL_MISSIONS * 100
      )
    }),

    getMissionList: () => BASE_MISSION_DATA.map((mission, index) => ({
      number: index + 1,
      title: mission.title,
      objective: mission.objective,
      person: mission.person,
      location: mission.location,
      completed: state.completedMissions.includes(index)
    })),

    reset: () => openConfirmation(
      "Réinitialiser l'aventure",
      "Voulez-vous effacer votre progression et recommencer ?",
      restartGame
    )
  };

  /* ============================================================
     32. LANCEMENT AUTOMATIQUE
  ============================================================ */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

})();















