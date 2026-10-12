
/* ============================================================
   FOBAS INTERACTIVE — SUR L'AMOUR EN ACTION
   JavaScript complet — Babylon.js — Android + ordinateur
   35 missions évolutives, personnages IA, dialogues, choix,
   collecte, exploration, sauvegarde IndexedDB et contrôles 3D.
============================================================ */
(() => {
  "use strict";

  /* ----------------------------------------------------------
     1. CONFIGURATION ET ÉLÉMENTS HTML
  ---------------------------------------------------------- */

  const VERSION = "2.0.0";
  const DB_NAME = "FOBAS_AMOUR_ACTION_DB";
  const DB_VERSION = 1;
  const SAVE_KEY = "main-save";

  const $ = (id) => document.getElementById(id);

  const canvas = $("loveGameCanvas");

  const REQUIRED_IDS = [
    "loadingScreen", "mainMenu", "gameScreen",
    "missionsScreen", "pauseScreen", "settingsScreen",
    "creditsScreen", "missionCompleteScreen", "endingScreen",
    "confirmationScreen", "errorScreen",
    "loadingMessage", "loadingProgress", "loadingPercent",
    "gameNotification", "dialoguePanel", "dialogueText",
    "dialogueChoices", "speakerName", "speakerAvatar",
    "missionNumber", "missionTitle", "objectiveText",
    "objectiveProgressBar", "objectiveProgressText",
    "interactionPrompt", "interactionText",
    "missionsList", "missionsSummary",
    "overallProgressBar", "continueGameButton",
    "saveStatus", "worldLoadingOverlay", "worldLoadingText",
    "completionTitle", "completionMessage", "completionProgress",
    "confirmationTitle", "confirmationMessage",
    "errorTitle", "errorMessage"
  ];

  const missingIds = REQUIRED_IDS.filter((id) => !$(id));

  let initialized = false;
  let initializing = false;
  let engine = null;
  let scene = null;
  let camera = null;
  let player = null;
  let db = null;
  let audioContext = null;
  let musicTimer = null;
  let musicStep = 0;
  let voiceUtterance = null;
  let notificationTimer = null;
  let jumpTimer = null;
  let autosaveTimer = null;
  let frameTimer = null;
  let lastFrame = 0;
  let frameDelta = 0;
  let jumpVelocity = 0;
  let isJumping = false;
  let dialogueTransition = false;
  let activePointers = new Map();
  let confirmationAction = null;
  let currentInteraction = null;
  let worldGeneration = 0;

  const keys = new Set();

  const state = {
    screen: "loadingScreen",
    previousScreen: "mainMenu",
    paused: true,
    running: false,
    gameStarted: false,
    missionIndex: 0,
    completedMissions: [],
    completedSteps: [],
    choices: {},
    flags: {},
    inventory: [],
    relationship: 0,
    profile: {
      name: "Alex",
      avatar: "♡"
    },
    settings: {
      voice: true,
      music: true,
      subtitles: true,
      quality: "medium",
      sensitivity: 1
    },
    joystick: {
      active: false,
      pointerId: null,
      x: 0,
      y: 0
    },
    cameraControl: {
      dragging: false,
      pointerId: null,
      lastX: 0,
      lastY: 0,
      pinchDistance: 0
    },
    npcs: [],
    collectibles: [],
    landmarks: [],
    decorations: [],
    activeTarget: null,
    missionRuntime: null,
    currentDialogue: null,
    isRunning: false,
    isInteracting: false,
    audioUnlocked: false
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function distanceXZ(a, b) {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  function setText(element, value) {
    if (element) element.textContent = String(value ?? "");
  }

  function setVisible(element, visible) {
    if (!element) return;
    element.classList.toggle("hidden", !visible);
    element.setAttribute("aria-hidden", visible ? "false" : "true");
  }

  function safeDispose(object) {
    try {
      if (object && typeof object.dispose === "function") {
        object.dispose(false, true);
      }
    } catch (error) {
      console.warn("[FOBAS] Nettoyage objet :", error);
    }
  }

  function meshIsDisposed(mesh) {
    if (!mesh) return true;

    try {
      return typeof mesh.isDisposed === "function"
        ? mesh.isDisposed()
        : mesh.isDisposed === true;
    } catch (_) {
      return false;
    }
  }

  function notify(message, duration = 2600) {
    const element = $("gameNotification");
    if (!element) return;

    setText(element, message);
    setVisible(element, true);

    if (notificationTimer) clearTimeout(notificationTimer);

    notificationTimer = setTimeout(() => {
      setVisible(element, false);
    }, duration);
  }

  function showFatalError(title, message) {
    setText($("errorTitle"), title);
    setText($("errorMessage"), message);

    setVisible($("loadingScreen"), false);
    setVisible($("mainMenu"), false);
    setVisible($("gameScreen"), false);
    setVisible($("errorScreen"), true);

    state.screen = "errorScreen";
  }

  /* ----------------------------------------------------------
     2. LES 35 MISSIONS
  ---------------------------------------------------------- */

  const missionData = [
    {
      title: "Un regard inattendu",
      place: "Jardin des Premiers Sourires",
      story: "Dans un jardin lumineux, une rencontre inattendue ouvre la porte à une aventure pleine de possibilités.",
      goal: "rencontrer Camille et apprendre à la connaître",
      mode: "talk"
    },
    {
      title: "Une promenade au jardin",
      place: "Allée des Roses",
      story: "Camille vous propose une promenade. Plusieurs visiteurs ont des histoires intéressantes à raconter.",
      goal: "parcourir le jardin et découvrir ses secrets",
      mode: "visit"
    },
    {
      title: "Le souvenir perdu",
      place: "Place des Souvenirs",
      story: "Un petit objet précieux a disparu. Aidez les habitants à le retrouver avant le coucher du soleil.",
      goal: "retrouver le souvenir perdu",
      mode: "collect"
    },
    {
      title: "Une conversation sincère",
      place: "Café des Rencontres",
      story: "Une discussion profonde vous apprend que l'écoute peut rapprocher des personnes très différentes.",
      goal: "écouter les confidences des personnages",
      mode: "talk"
    },
    {
      title: "Le choix du cœur",
      place: "Pont des Décisions",
      story: "Une situation délicate demande de choisir entre plusieurs façons d'aider un ami.",
      goal: "prendre une décision réfléchie",
      mode: "choice"
    },
    {
      title: "Une main tendue",
      place: "Village des Amis",
      story: "Une personne traverse une journée difficile. Votre présence peut transformer sa situation.",
      goal: "aider un habitant dans le besoin",
      mode: "help"
    },
    {
      title: "La lettre mystérieuse",
      place: "Bibliothèque des Émotions",
      story: "Une lettre ancienne contient des indices sur une histoire oubliée.",
      goal: "retrouver et examiner une lettre",
      mode: "inspect"
    },
    {
      title: "Le cadeau oublié",
      place: "Marché des Couleurs",
      story: "Un cadeau destiné à une amie attend d'être remis à la bonne personne.",
      goal: "retrouver un cadeau et le livrer",
      mode: "deliver"
    },
    {
      title: "La fête des sourires",
      place: "Place des Fêtes",
      story: "Les habitants organisent une fête. Chacun peut participer à sa manière.",
      goal: "participer à une activité collective",
      mode: "perform"
    },
    {
      title: "Les mots qui réparent",
      place: "Maison de l'Amitié",
      story: "Deux amis se sont mal compris. Une conversation calme peut les aider à se réconcilier.",
      goal: "écouter les deux personnes et proposer une solution",
      mode: "choice"
    },
    {
      title: "Le chemin du lac",
      place: "Lac des Reflets",
      story: "Un chemin tranquille conduit vers un lac où plusieurs personnages attendent votre visite.",
      goal: "explorer le lac et rencontrer ses visiteurs",
      mode: "visit"
    },
    {
      title: "Un secret partagé",
      place: "Pavillon des Confidences",
      story: "Un ami vous confie un problème personnel et attend une réponse respectueuse.",
      goal: "écouter un ami et choisir une réponse adaptée",
      mode: "choice"
    },
    {
      title: "La clé du pavillon",
      place: "Pavillon des Lumières",
      story: "Une clé manque pour ouvrir le pavillon. Les indices sont dispersés dans les environs.",
      goal: "trouver la clé et découvrir le pavillon",
      mode: "collect"
    },
    {
      title: "Le message oublié",
      place: "Jardin des Messages",
      story: "Un message incomplet doit être retrouvé et remis à son destinataire.",
      goal: "retrouver un message et le remettre",
      mode: "deliver"
    },
    {
      title: "Le défi de confiance",
      place: "Parcours de la Confiance",
      story: "Plusieurs épreuves simples invitent les participants à coopérer et à se faire confiance.",
      goal: "accomplir les étapes du parcours",
      mode: "perform"
    },
    {
      title: "La rencontre au marché",
      place: "Grand Marché",
      story: "Des commerçants et des visiteurs vous racontent leurs projets et leurs difficultés.",
      goal: "rencontrer plusieurs personnages et les écouter",
      mode: "talk"
    },
    {
      title: "Le carnet des promesses",
      place: "Maison des Souvenirs",
      story: "Un carnet oublié rappelle l'importance de tenir ses engagements.",
      goal: "examiner le carnet et découvrir ses indices",
      mode: "inspect"
    },
    {
      title: "Une surprise préparée",
      place: "Terrasse Fleurie",
      story: "Des amis préparent une surprise. Votre aide est nécessaire pour rassembler les éléments.",
      goal: "rassembler les objets nécessaires à la surprise",
      mode: "collect"
    },
    {
      title: "Le pont de la réconciliation",
      place: "Pont des Amis",
      story: "Deux personnes attendent un geste qui permettra de recommencer leur relation sur de meilleures bases.",
      goal: "faciliter une réconciliation",
      mode: "help"
    },
    {
      title: "La soirée des confidences",
      place: "Terrasse des Étoiles",
      story: "Sous le ciel du soir, plusieurs amis partagent leurs espoirs, leurs peurs et leurs projets.",
      goal: "participer aux conversations de la soirée",
      mode: "talk"
    },
    {
      title: "Le village solidaire",
      place: "Village de l'Espoir",
      story: "Une initiative collective cherche à soutenir les personnes les plus isolées du village.",
      goal: "visiter les lieux et participer à l'entraide",
      mode: "help"
    },
    {
      title: "Les indices du phare",
      place: "Phare de l'Espoir",
      story: "Des indices conduisent au phare. Votre curiosité permet de découvrir une histoire importante.",
      goal: "explorer le phare et examiner les indices",
      mode: "inspect"
    },
    {
      title: "Le cadeau de gratitude",
      place: "Jardin de la Gratitude",
      story: "Un cadeau symbolique doit être remis à une personne qui a beaucoup aidé la communauté.",
      goal: "préparer et remettre un cadeau",
      mode: "deliver"
    },
    {
      title: "La grande promenade",
      place: "Promenade des Horizons",
      story: "Une longue promenade permet de rencontrer des habitants et de découvrir de nouveaux paysages.",
      goal: "explorer les différentes zones de la promenade",
      mode: "visit"
    },
    {
      title: "Le festival des rencontres",
      place: "Esplanade du Festival",
      story: "Le festival rassemble des personnages aux talents et aux expériences variés.",
      goal: "participer au festival et rencontrer ses participants",
      mode: "perform"
    },
    {
      title: "Les voix du quartier",
      place: "Quartier des Artisans",
      story: "Les habitants souhaitent améliorer leur quartier et cherchent des idées pour travailler ensemble.",
      goal: "écouter les habitants et choisir une proposition",
      mode: "choice"
    },
    {
      title: "Le jardin à reconstruire",
      place: "Jardin Communautaire",
      story: "Une tempête a abîmé le jardin. Les voisins se réunissent pour lui redonner vie.",
      goal: "collecter les éléments et aider les voisins",
      mode: "help"
    },
    {
      title: "La vérité derrière la lettre",
      place: "Archives du Village",
      story: "De nouveaux documents éclairent la lettre mystérieuse découverte plus tôt.",
      goal: "examiner les archives et comprendre l'histoire",
      mode: "inspect"
    },
    {
      title: "Une promesse difficile",
      place: "Belvédère du Courage",
      story: "Une promesse exige du courage, de la patience et une discussion honnête.",
      goal: "rencontrer les personnes concernées et décider de la suite",
      mode: "choice"
    },
    {
      title: "La nuit des lanternes",
      place: "Sentier des Lanternes",
      story: "Une procession de lanternes illumine le sentier. Plusieurs objets ont été égarés pendant les préparatifs.",
      goal: "retrouver les objets manquants et aider les participants",
      mode: "collect"
    },
    {
      title: "Les chemins de la confiance",
      place: "Carrefour des Destins",
      story: "Les choix précédents influencent les relations. Les personnages se souviennent de vos actions.",
      goal: "rencontrer vos alliés et renforcer les liens",
      mode: "talk"
    },
    {
      title: "Le grand geste",
      place: "Place de la Solidarité",
      story: "Une situation collective demande de coordonner plusieurs personnes et de partager les responsabilités.",
      goal: "aider plusieurs habitants et terminer les tâches",
      mode: "help"
    },
    {
      title: "Le dernier message",
      place: "Tour des Souvenirs",
      story: "Un dernier message relie plusieurs événements de votre aventure.",
      goal: "retrouver le message et le remettre à son destinataire",
      mode: "deliver"
    },
    {
      title: "Le choix qui nous unit",
      place: "Jardin de l'Union",
      story: "Plusieurs possibilités s'offrent à vous. Votre choix doit tenir compte des sentiments et des besoins de chacun.",
      goal: "écouter les personnages et prendre une décision",
      mode: "choice"
    },
    {
      title: "L'amour en action",
      place: "Place de l'Avenir",
      story: "Votre aventure rassemble les rencontres, les gestes généreux et les décisions qui ont changé votre parcours.",
      goal: "retrouver vos alliés et célébrer les liens construits",
      mode: "perform"
    }
  ];

  const NPC_NAMES = [
    "Camille", "Maya", "Lucas", "Sofia", "Noah",
    "Emma", "Gabriel", "Lina", "Nathan", "Amélie",
    "Ethan", "Chloé", "Samuel", "Jade", "Daniel",
    "Sarah", "David", "Élise", "Adam", "Nina",
    "Thomas", "Inès", "Raphaël", "Zoé", "Julien",
    "Arielle", "Michaël", "Élodie", "Antoine", "Mélissa"
  ];

  const PERSONALITIES = [
    "bienveillant", "curieux", "réservé", "optimiste",
    "réfléchi", "drôle", "courageux", "créatif",
    "calme", "solidaire", "rêveur", "franc"
  ];

  const COLORS = [
    "#ef86a7", "#71a6ef", "#f2b66b", "#81cfa4",
    "#bd91ec", "#f17f70", "#70c9d4", "#d7b66f",
    "#e8a2d0", "#9db6ee", "#d5a08a", "#90c1a5"
  ];

  const DIALOGUE_BANK = [
    "Je crois que les relations deviennent plus fortes lorsque nous prenons le temps de nous écouter vraiment.",
    "Il n'est pas nécessaire d'avoir toutes les réponses. Parfois, être présent est déjà une grande aide.",
    "J'ai appris qu'un petit geste sincère peut illuminer une journée entière.",
    "Les différences ne nous empêchent pas de nous comprendre. Elles peuvent même nous apprendre beaucoup.",
    "Quand une difficulté arrive, j'essaie de chercher une solution qui respecte chacun.",
    "La confiance se construit progressivement, grâce à la vérité et aux actions.",
    "Je préfère une conversation honnête à une promesse que je ne pourrais pas tenir.",
    "Nous ne pouvons pas changer le passé, mais nous pouvons choisir la manière de continuer.",
    "J'aimerais que les personnes se sentent libres de parler sans craindre d'être jugées.",
    "L'amitié n'est pas seulement une question de mots. Elle se voit aussi dans nos gestes.",
    "Quand plusieurs personnes travaillent ensemble, elles peuvent accomplir davantage.",
    "Prendre le temps de comprendre les émotions des autres peut éviter beaucoup de malentendus.",
    "Je crois qu'un désaccord n'est pas forcément la fin d'une relation.",
    "Une décision juste tient compte des besoins des personnes concernées.",
    "Le courage ne signifie pas ne jamais avoir peur. Il signifie avancer malgré les difficultés.",
    "Chaque personne possède une histoire qui mérite d'être entendue.",
    "Il faut parfois demander pardon, mais il faut aussi apprendre à changer ses habitudes.",
    "La gratitude prend tout son sens lorsqu'elle se transforme en action.",
    "Une parole douce peut encourager quelqu'un qui traverse une période difficile.",
    "J'espère que nous pourrons construire quelque chose de positif ensemble."
  ];

  /* ----------------------------------------------------------
     3. GÉNÉRATION DES OBJECTIFS
  ---------------------------------------------------------- */

  function buildMissionPlan(index) {
    const mission = missionData[index];
    const difficulty = Math.floor(index / 5) + 1;
    const stages = [];

    const stageCount = Math.min(6, 2 + Math.floor(index / 6));

    const actionPool = {
      talk: ["talk", "visit", "choice", "talk", "help", "perform"],
      visit: ["visit", "talk", "visit", "inspect", "talk", "visit"],
      collect: ["collect", "visit", "collect", "talk", "collect", "deliver"],
      choice: ["talk", "choice", "visit", "talk", "choice", "help"],
      help: ["talk", "collect", "help", "visit", "talk", "help"],
      inspect: ["visit", "inspect", "collect", "talk", "inspect", "choice"],
      deliver: ["collect", "talk", "deliver", "visit", "deliver", "talk"],
      perform: ["visit", "talk", "perform", "collect", "talk", "perform"]
    };

    const actions = actionPool[mission.mode] || ["talk", "visit"];

    for (let i = 0; i < stageCount; i++) {
      const action = actions[i % actions.length];

      stages.push({
        id: `m${index + 1}-stage${i + 1}`,
        action,
        label: stageLabel(action, i),
        done: false,
        targetId: null
      });
    }

    return {
      number: index + 1,
      title: mission.title,
      place: mission.place,
      story: mission.story,
      goal: mission.goal,
      difficulty,
      stages,
      createdAt: Date.now()
    };
  }

  function stageLabel(action, index) {
    const labels = {
      talk: ["Rencontrer un personnage", "Écouter un ami", "Partager vos idées"],
      collect: ["Trouver un objet précieux", "Récupérer un souvenir", "Rassembler les objets"],
      visit: ["Explorer la zone", "Découvrir un lieu", "Rejoindre le point indiqué"],
      choice: ["Écouter les avis", "Choisir une réponse", "Prendre une décision"],
      help: ["Comprendre le problème", "Apporter votre aide", "Terminer la tâche"],
      inspect: ["Chercher un indice", "Examiner un objet", "Comprendre les indices"],
      deliver: ["Récupérer un objet", "Trouver le destinataire", "Remettre le cadeau"],
      perform: ["Rejoindre les participants", "Participer à l'activité", "Célébrer ensemble"]
    };

    const list = labels[action] || ["Continuer l'aventure"];
    return list[index % list.length];
  }

  function getCurrentMission() {
    return missionData[state.missionIndex] || null;
  }

  function getTotalMissionCount() {
    return missionData.length;
  }

  function currentStage() {
    if (!state.missionRuntime) return null;

    return state.missionRuntime.plan.stages[
      state.missionRuntime.stageIndex
    ] || null;
  }

  /* ----------------------------------------------------------
     4. NAVIGATION ET INTERFACES
  ---------------------------------------------------------- */

  function showScreen(id) {
    const allScreens = [
      "loadingScreen", "mainMenu", "gameScreen",
      "missionsScreen", "pauseScreen", "settingsScreen",
      "creditsScreen", "missionCompleteScreen", "endingScreen",
      "confirmationScreen", "errorScreen"
    ];

    allScreens.forEach((screenId) => {
      setVisible($(screenId), screenId === id);
    });

    state.screen = id;

    if (id !== "gameScreen") {
      setVisible($("interactionPrompt"), false);
    }

    if (id === "gameScreen") {
      setVisible($("worldLoadingOverlay"), false);
    }
  }

  function showMenu() {
    state.paused = true;
    state.running = false;
    state.screen = "mainMenu";
    setVisible($("mainMenu"), true);
    showScreen("mainMenu");
    updateContinueButton();
    stopVoice();
  }

  function showGame() {
    state.paused = false;
    state.running = true;
    showScreen("gameScreen");
    updateMissionHeader();
    updateObjective();
    updateInteractionTarget();

    if (scene) {
      scene.activeCamera = camera;
    }
  }

  function showPause() {
    if (!state.gameStarted || state.screen !== "gameScreen") return;

    state.paused = true;
    state.running = false;
    state.joystick.active = false;
    state.joystick.x = 0;
    state.joystick.y = 0;

    stopVoice();
    showScreen("pauseScreen");
    scheduleAutosave();
  }

  function resumeGame() {
    if (!state.gameStarted) {
      showMenu();
      return;
    }

    showGame();
    startMusicIfEnabled();
  }

  function hideAllOverlays() {
    [
      "missionsScreen", "pauseScreen", "settingsScreen",
      "creditsScreen", "missionCompleteScreen",
      "endingScreen", "confirmationScreen"
    ].forEach((id) => setVisible($(id), false));
  }

  function updateContinueButton() {
    const button = $("continueGameButton");
    if (!button) return;

    button.disabled = !state.gameStarted &&
      state.completedMissions.length === 0;
  }

  /* ----------------------------------------------------------
     5. INDEXEDDB — SAUVEGARDE LOCALE
  ---------------------------------------------------------- */

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB indisponible"));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains("saves")) {
          database.createObjectStore("saves", { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        db = request.result;
        resolve(db);
      };

      request.onerror = () => reject(
        request.error || new Error("Ouverture de la base impossible")
      );
    });
  }

  function createSaveData() {
    return {
      id: SAVE_KEY,
      version: VERSION,
      savedAt: new Date().toISOString(),
      missionIndex: state.missionIndex,
      completedMissions: [...state.completedMissions],
      completedSteps: [...state.completedSteps],
      choices: { ...state.choices },
      flags: { ...state.flags },
      inventory: [...state.inventory],
      relationship: state.relationship,
      profile: { ...state.profile },
      settings: { ...state.settings },
      gameStarted: state.gameStarted,
      missionRuntime: state.missionRuntime
        ? JSON.parse(JSON.stringify(state.missionRuntime))
        : null
    };
  }

  function saveGame() {
    const indicator = $("savingIndicator");
    setVisible(indicator, true);

    if (!db) {
      try {
        const data = createSaveData();
        window.localStorage.setItem(
          "FOBAS_AMOUR_FALLBACK",
          JSON.stringify(data)
        );

        setText($("saveStatus"), "Progression sauvegardée");
        notify("Progression sauvegardée sur cet appareil.");
      } catch (error) {
        console.error("[FOBAS] Sauvegarde locale :", error);
        setText($("saveStatus"), "Sauvegarde indisponible");
      }

      setTimeout(() => setVisible(indicator, false), 700);
      updateContinueButton();
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(["saves"], "readwrite");
        transaction.objectStore("saves").put(createSaveData());

        transaction.oncomplete = () => {
          setText($("saveStatus"), "Progression sauvegardée");
          setVisible(indicator, false);
          updateContinueButton();
          resolve(true);
        };

        transaction.onerror = () => {
          setText($("saveStatus"), "Erreur de sauvegarde");
          setVisible(indicator, false);
          resolve(false);
        };
      } catch (error) {
        console.error("[FOBAS] Sauvegarde :", error);
        setVisible(indicator, false);
        resolve(false);
      }
    });
  }

  function loadGame() {
    return new Promise((resolve) => {
      function applySave(data) {
        if (!data) {
          resolve(false);
          return;
        }

        state.missionIndex = clamp(
          Number(data.missionIndex) || 0,
          0,
          missionData.length - 1
        );

        state.completedMissions = Array.isArray(data.completedMissions)
          ? data.completedMissions.filter(
              (n) => Number.isInteger(n) && n >= 0 && n < missionData.length
            )
          : [];

        state.completedSteps = Array.isArray(data.completedSteps)
          ? data.completedSteps
          : [];

        state.choices = data.choices || {};
        state.flags = data.flags || {};
        state.inventory = Array.isArray(data.inventory)
          ? data.inventory
          : [];

        state.relationship = Number(data.relationship) || 0;
        state.profile = { ...state.profile, ...(data.profile || {}) };
        state.settings = { ...state.settings, ...(data.settings || {}) };
        state.gameStarted = Boolean(data.gameStarted);

        if (
          data.missionRuntime &&
          data.missionRuntime.plan &&
          Array.isArray(data.missionRuntime.plan.stages)
        ) {
          state.missionRuntime = data.missionRuntime;
        } else {
          state.missionRuntime = null;
        }

        applySettingsToUI();
        updateContinueButton();
        refreshMissionList();
        resolve(true);
      }

      if (!db) {
        try {
          const fallback = window.localStorage.getItem(
            "FOBAS_AMOUR_FALLBACK"
          );

          applySave(fallback ? JSON.parse(fallback) : null);
        } catch (_) {
          resolve(false);
        }
        return;
      }

      try {
        const transaction = db.transaction(["saves"], "readonly");
        const request = transaction.objectStore("saves").get(SAVE_KEY);

        request.onsuccess = () => applySave(request.result || null);
        request.onerror = () => resolve(false);
      } catch (_) {
        resolve(false);
      }
    });
  }

  function scheduleAutosave() {
    if (autosaveTimer) clearTimeout(autosaveTimer);

    autosaveTimer = setTimeout(() => {
      saveGame();
    }, 800);
  }

  /* ----------------------------------------------------------
     6. PARAMÈTRES
  ---------------------------------------------------------- */

  function applySettingsToUI() {
    if ($("voiceEnabled")) {
      $("voiceEnabled").checked = state.settings.voice;
    }

    if ($("musicEnabled")) {
      $("musicEnabled").checked = state.settings.music;
    }

    if ($("subtitlesEnabled")) {
      $("subtitlesEnabled").checked = state.settings.subtitles;
    }

    if ($("qualitySelect")) {
      $("qualitySelect").value = state.settings.quality;
    }

    if ($("sensitivityRange")) {
      $("sensitivityRange").value = state.settings.sensitivity;
    }
  }

  function readSettingsFromUI() {
    state.settings.voice = Boolean($("voiceEnabled")?.checked);
    state.settings.music = Boolean($("musicEnabled")?.checked);
    state.settings.subtitles = Boolean($("subtitlesEnabled")?.checked);

    state.settings.quality = $("qualitySelect")?.value || "medium";
    state.settings.sensitivity = clamp(
      Number($("sensitivityRange")?.value || 1),
      0.5,
      2
    );

    if (engine) {
      const ratio = state.settings.quality === "high"
        ? 1
        : state.settings.quality === "low"
          ? 1.6
          : 1.25;

      engine.setHardwareScalingLevel(ratio);
      engine.resize();
    }

    if (!state.settings.voice) stopVoice();

    if (state.settings.music) {
      startMusicIfEnabled();
    } else {
      stopMusic();
    }

    notify("Paramètres enregistrés.");
    scheduleAutosave();
  }

  /* ----------------------------------------------------------
     7. MATÉRIAUX ET OBJETS BABYLON.JS
  ---------------------------------------------------------- */

  function createMaterial(name, color, emissive = null) {
    const material = new BABYLON.StandardMaterial(name, scene);

    material.diffuseColor = BABYLON.Color3.FromHexString(color);

    if (emissive) {
      material.emissiveColor = BABYLON.Color3.FromHexString(emissive);
    }

    material.specularColor = new BABYLON.Color3(0.18, 0.18, 0.18);
    return material;
  }

  function rememberDecoration(mesh) {
    if (mesh) state.decorations.push(mesh);
    return mesh;
  }

  function createBox(name, position, size, material, parent = null) {
    const mesh = BABYLON.MeshBuilder.CreateBox(
      name,
      { width: size.x, height: size.y, depth: size.z },
      scene
    );

    mesh.position.copyFrom(position);

    if (material) mesh.material = material;
    if (parent) mesh.parent = parent;

    return rememberDecoration(mesh);
  }

  function createSphere(name, position, diameter, material, parent = null) {
    const mesh = BABYLON.MeshBuilder.CreateSphere(
      name,
      { diameter, segments: 12 },
      scene
    );

    mesh.position.copyFrom(position);

    if (material) mesh.material = material;
    if (parent) mesh.parent = parent;

    return rememberDecoration(mesh);
  }

  function createCylinder(name, position, height, diameter, material, parent = null) {
    const mesh = BABYLON.MeshBuilder.CreateCylinder(
      name,
      { height, diameter, tessellation: 10 },
      scene
    );

    mesh.position.copyFrom(position);

    if (material) mesh.material = material;
    if (parent) mesh.parent = parent;

    return rememberDecoration(mesh);
  }

  function createWorldEnvironment(index) {
    const mission = missionData[index];

    const groundMat = createMaterial("groundMat", "#7ebc86");
    const pathMat = createMaterial("pathMat", "#d6c09a");
    const treeMat = createMaterial("treeMat", "#3d8654");
    const trunkMat = createMaterial("trunkMat", "#79553b");
    const flowerMats = [
      createMaterial("flowerPink", "#f18db7"),
      createMaterial("flowerYellow", "#f7d66c"),
      createMaterial("flowerBlue", "#a1c8ff")
    ];
    const waterMat = createMaterial("waterMat", "#64c9d6", "#155c6b");
    const benchMat = createMaterial("benchMat", "#8a5c3a");
    const stoneMat = createMaterial("stoneMat", "#e4dfd5");
    const lampMat = createMaterial("lampMat", "#fff0ad", "#ffda70");

    const ground = BABYLON.MeshBuilder.CreateGround(
      "worldGround",
      { width: 100, height: 100, subdivisions: 2 },
      scene
    );

    ground.material = groundMat;
    ground.isPickable = false;
    rememberDecoration(ground);

    const path = BABYLON.MeshBuilder.CreateGround(
      "mainPath",
      { width: 7, height: 58 },
      scene
    );

    path.position.y = 0.025;
    path.material = pathMat;
    rememberDecoration(path);

    const skyMat = new BABYLON.StandardMaterial("skyMat", scene);
    skyMat.diffuseColor = BABYLON.Color3.FromHexString("#8fc9ee");
    skyMat.backFaceCulling = false;
    skyMat.disableLighting = true;

    const sky = BABYLON.MeshBuilder.CreateSphere(
      "skyDome",
      { diameter: 240, segments: 12 },
      scene
    );

    sky.material = skyMat;
    sky.infiniteDistance = true;
    sky.isPickable = false;
    rememberDecoration(sky);

    const sunMat = createMaterial("sunMat", "#fff2c3", "#ffe9a1");

    createSphere(
      "sun",
      new BABYLON.Vector3(-24, 22, 28),
      6,
      sunMat
    );

    const water = BABYLON.MeshBuilder.CreateGround(
      "water",
      { width: 20, height: 13 },
      scene
    );

    water.position.set(24, 0.035, -19);
    water.material = waterMat;
    rememberDecoration(water);

    for (let i = 0; i < 30; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const x = side * random(8, 35);
      const z = random(-32, 32);

      createCylinder(
        `treeTrunk${i}`,
        new BABYLON.Vector3(x, 1.1, z),
        2.2,
        0.55,
        trunkMat
      );

      createSphere(
        `treeLeaves${i}`,
        new BABYLON.Vector3(x, 3.1, z),
        random(3.1, 4.6),
        treeMat
      );

      if (i < 20) {
        for (let f = 0; f < 3; f++) {
          createSphere(
            `flower${i}-${f}`,
            new BABYLON.Vector3(
              x + random(-2.5, 2.5),
              0.3,
              z + random(-2.5, 2.5)
            ),
            0.32,
            pick(flowerMats)
          );
        }
      }
    }

    for (let i = 0; i < 9; i++) {
      const z = -26 + i * 6;

      createCylinder(
        `lampPole${i}`,
        new BABYLON.Vector3(i % 2 ? 5.2 : -5.2, 1.7, z),
        3.4,
        0.18,
        stoneMat
      );

      createSphere(
        `lampLight${i}`,
        new BABYLON.Vector3(i % 2 ? 5.2 : -5.2, 3.5, z),
        0.65,
        lampMat
      );
    }

    for (let i = 0; i < 6; i++) {
      const x = -15 + i * 6;

      createBox(
        `benchSeat${i}`,
        new BABYLON.Vector3(x, 0.65, 12),
        new BABYLON.Vector3(2.3, 0.22, 0.8),
        benchMat
      );

      createBox(
        `benchBack${i}`,
        new BABYLON.Vector3(x, 1.1, 12.35),
        new BABYLON.Vector3(2.3, 0.8, 0.2),
        benchMat
      );
    }

    const landmarkMat = createMaterial("landmarkMat", "#efb6d3", "#b66d95");

    const landmark = BABYLON.MeshBuilder.CreateTorus(
      "missionLandmark",
      { diameter: 3.2, thickness: 0.28, tessellation: 24 },
      scene
    );

    landmark.position.set(0, 0.4, -17);
    landmark.rotation.x = Math.PI / 2;
    landmark.material = landmarkMat;
    rememberDecoration(landmark);

    const titlePlane = BABYLON.MeshBuilder.CreatePlane(
      "missionTitlePlane",
      { width: 12, height: 2.2 },
      scene
    );

    titlePlane.position.set(0, 5.3, -24);
    titlePlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    const titleTexture = new BABYLON.DynamicTexture(
      "missionTitleTexture",
      { width: 1024, height: 180 },
      scene,
      true
    );

    titleTexture.hasAlpha = true;
    titleTexture.drawText(
      mission.place,
      null,
      115,
      "bold 52px Arial",
      "#ffffff",
      "transparent",
      true
    );

    const titleMaterial = new BABYLON.StandardMaterial(
      "missionTitleMaterial",
      scene
    );

    titleMaterial.diffuseTexture = titleTexture;
    titleMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    titleMaterial.opacityTexture = titleTexture;
    titleMaterial.backFaceCulling = false;
    titlePlane.material = titleMaterial;
    rememberDecoration(titlePlane);

    const platform = BABYLON.MeshBuilder.CreateCylinder(
      "centralPlatform",
      { height: 0.25, diameter: 8, tessellation: 32 },
      scene
    );

    platform.position.set(0, 0.14, -17);
    platform.material = stoneMat;
    rememberDecoration(platform);
  }

  /* ----------------------------------------------------------
     8. PERSONNAGE PRINCIPAL
  ---------------------------------------------------------- */

  function createPlayer() {
    const root = new BABYLON.TransformNode("playerRoot", scene);

    const skin = createMaterial("playerSkin", "#e9b48f");
    const clothes = createMaterial("playerClothes", "#5c7fe0");
    const pants = createMaterial("playerPants", "#34425e");
    const shoes = createMaterial("playerShoes", "#f5f3ed");
    const hair = createMaterial("playerHair", "#392c2a");

    const body = BABYLON.MeshBuilder.CreateCapsule
      ? BABYLON.MeshBuilder.CreateCapsule(
          "playerBody",
          { height: 1.6, radius: 0.42, tessellation: 10 },
          scene
        )
      : BABYLON.MeshBuilder.CreateCylinder(
          "playerBody",
          { height: 1.5, diameter: 0.8, tessellation: 12 },
          scene
        );

    body.position.y = 1.5;
    body.material = clothes;
    body.parent = root;

    createSphere(
      "playerHead",
      new BABYLON.Vector3(0, 2.65, 0),
      0.85,
      skin,
      root
    );

    createSphere(
      "playerHair",
      new BABYLON.Vector3(0, 2.94, -0.04),
      0.82,
      hair,
      root
    ).scaling.y = 0.55;

    const leftLeg = createCylinder(
      "playerLeftLeg",
      new BABYLON.Vector3(-0.22, 0.65, 0),
      0.9,
      0.24,
      pants,
      root
    );

    const rightLeg = createCylinder(
      "playerRightLeg",
      new BABYLON.Vector3(0.22, 0.65, 0),
      0.9,
      0.24,
      pants,
      root
    );

    createBox(
      "playerLeftShoe",
      new BABYLON.Vector3(-0.22, 0.18, 0.12),
      new BABYLON.Vector3(0.36, 0.22, 0.56),
      shoes,
      root
    );

    createBox(
      "playerRightShoe",
      new BABYLON.Vector3(0.22, 0.18, 0.12),
      new BABYLON.Vector3(0.36, 0.22, 0.56),
      shoes,
      root
    );

    const leftArm = createCylinder(
      "playerLeftArm",
      new BABYLON.Vector3(-0.55, 1.6, 0),
      0.9,
      0.22,
      skin,
      root
    );

    leftArm.rotation.z = -0.25;

    const rightArm = createCylinder(
      "playerRightArm",
      new BABYLON.Vector3(0.55, 1.6, 0),
      0.9,
      0.22,
      skin,
      root
    );

    rightArm.rotation.z = 0.25;

    root.position.set(0, 0, 8);

    player = {
      root,
      position: root.position,
      leftLeg,
      rightLeg,
      leftArm,
      rightArm,
      speed: 5,
      walkTime: 0,
      baseY: 0
    };

    if (camera) {
      camera.target = new BABYLON.Vector3(0, 1.4, 8);
    }

    return player;
  }

  /* ----------------------------------------------------------
     9. PERSONNAGES IA ET LEURS COMPORTEMENTS
  ---------------------------------------------------------- */

  function createCharacter(name, index, x, z) {
    const root = new BABYLON.TransformNode(
      `npcRoot-${index}-${name}`,
      scene
    );

    const skinColors = [
      "#edc19d", "#a96f4e", "#d59b75", "#f0d0b0"
    ];

    const skin = createMaterial(
      `npcSkin-${index}`,
      pick(skinColors)
    );

    const clothes = createMaterial(
      `npcClothes-${index}`,
      COLORS[index % COLORS.length]
    );

    const hair = createMaterial(
      `npcHair-${index}`,
      pick(["#3b2a24", "#241e22", "#604633", "#a36b43"])
    );

    const body = BABYLON.MeshBuilder.CreateCapsule
      ? BABYLON.MeshBuilder.CreateCapsule(
          `npcBody-${index}`,
          { height: 1.45, radius: 0.38, tessellation: 10 },
          scene
        )
      : BABYLON.MeshBuilder.CreateCylinder(
          `npcBody-${index}`,
          { height: 1.4, diameter: 0.76, tessellation: 12 },
          scene
        );

    body.position.y = 1.42;
    body.material = clothes;
    body.parent = root;

    createSphere(
      `npcHead-${index}`,
      new BABYLON.Vector3(0, 2.55, 0),
      0.78,
      skin,
      root
    );

    createSphere(
      `npcHair-${index}`,
      new BABYLON.Vector3(0, 2.82, -0.03),
      0.77,
      hair,
      root
    ).scaling.y = 0.48;

    const legMat = createMaterial(`npcLegMat-${index}`, "#3e4b62");

    createCylinder(
      `npcLegL-${index}`,
      new BABYLON.Vector3(-0.2, 0.6, 0),
      0.85,
      0.22,
      legMat,
      root
    );

    createCylinder(
      `npcLegR-${index}`,
      new BABYLON.Vector3(0.2, 0.6, 0),
      0.85,
      0.22,
      legMat,
      root
    );

    createCylinder(
      `npcArmL-${index}`,
      new BABYLON.Vector3(-0.49, 1.55, 0),
      0.82,
      0.2,
      skin,
      root
    );

    createCylinder(
      `npcArmR-${index}`,
      new BABYLON.Vector3(0.49, 1.55, 0),
      0.82,
      0.2,
      skin,
      root
    );

    root.position.set(x, 0, z);

    return {
      id: `npc-${index}-${name}`,
      name,
      root,
      personality: PERSONALITIES[index % PERSONALITIES.length],
      dialogueIndex: index % DIALOGUE_BANK.length,
      greeting: `Bonjour ${state.profile.name} ! Je suis ${name}. Je suis ravi de te rencontrer ici. Comment se passe ton aventure ?`,
      aiState: "idle",
      homeX: x,
      homeZ: z,
      targetX: x,
      targetZ: z,
      walkTimer: random(1, 4),
      phase: random(0, Math.PI * 2),
      colorIndex: index % COLORS.length,
      interactionCount: 0
    };
  }

  function createMissionCharacters(index) {
    const baseCount = 4 + Math.floor(index / 2);
    const count = Math.min(14, baseCount);

    const selectedNames = [];

    for (let i = 0; i < count; i++) {
      let name = NPC_NAMES[(index * 3 + i) % NPC_NAMES.length];

      if (selectedNames.includes(name)) {
        name = `${name} ${i + 1}`;
      }

      selectedNames.push(name);

      const angle = (i / count) * Math.PI * 2;
      const radius = 6 + (i % 3) * 2;

      const x = Math.cos(angle) * radius;
      const z = 1 + Math.sin(angle) * radius;

      state.npcs.push(createCharacter(name, i, x, z));
    }

    if (state.npcs.length > 0) {
      state.npcs[0].root.position.set(2.5, 0, 5);
      state.npcs[0].homeX = 2.5;
      state.npcs[0].homeZ = 5;
    }
  }

  function updateNPCs(delta) {
    state.npcs.forEach((npc) => {
      if (!npc.root || !npc.root.position) return;

      npc.phase += delta;

      if (npc.aiState === "talking" && player) {
        const dx = player.position.x - npc.root.position.x;
        const dz = player.position.z - npc.root.position.z;

        npc.root.rotation.y = Math.atan2(dx, dz);
        return;
      }

      npc.walkTimer -= delta;

      if (npc.walkTimer <= 0) {
        npc.walkTimer = random(2, 5);

        if (Math.random() < 0.55) {
          npc.targetX = clamp(npc.homeX + random(-4, 4), -35, 35);
          npc.targetZ = clamp(npc.homeZ + random(-4, 4), -35, 35);
          npc.aiState = "walking";
        } else {
          npc.targetX = npc.homeX;
          npc.targetZ = npc.homeZ;
          npc.aiState = "idle";
        }
      }

      if (npc.aiState === "walking") {
        const dx = npc.targetX - npc.root.position.x;
        const dz = npc.targetZ - npc.root.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance > 0.12) {
          const speed = 1.15 * delta;

          npc.root.position.x += (dx / distance) * speed;
          npc.root.position.z += (dz / distance) * speed;
          npc.root.rotation.y = Math.atan2(dx, dz);
        } else {
          npc.aiState = "idle";
        }
      }

      npc.root.position.y = Math.abs(Math.sin(npc.phase * 2)) * 0.035;
    });
  }

  /* ----------------------------------------------------------
     10. OBJETS À COLLECTER ET POINTS D'EXPLORATION
  ---------------------------------------------------------- */

  function createCollectible(index, x, z) {
    const mat = createMaterial(
      `collectibleMat-${index}`,
      pick(["#ffdb78", "#f4a9d0", "#a7e4ef", "#d8b4ff"]),
      "#80602e"
    );

    const mesh = BABYLON.MeshBuilder.CreatePolyhedron(
      `collectible-${index}`,
      { type: 1, size: 0.75 },
      scene
    );

    mesh.position.set(x, 1.15, z);
    mesh.material = mat;
    rememberDecoration(mesh);

    return {
      id: `item-${state.missionIndex}-${index}`,
      name: pick([
        "Souvenir lumineux",
        "Petite lettre",
        "Fleur précieuse",
        "Cadeau mystérieux",
        "Fragment de mémoire",
        "Objet de gratitude"
      ]),
      mesh,
      collected: false,
      baseY: 1.15,
      phase: random(0, Math.PI * 2)
    };
  }

  function createMissionCollectibles(index) {
    const count = Math.min(7, 2 + Math.floor(index / 5));

    for (let i = 0; i < count; i++) {
      const x = random(-19, 19);
      const z = random(-24, 24);

      state.collectibles.push(createCollectible(i, x, z));
    }
  }

  function createLandmarks(index) {
    const places = [
      { name: "Jardin central", x: 0, z: -17 },
      { name: "Allée des fleurs", x: -12, z: -8 },
      { name: "Belvédère", x: 12, z: -12 },
      { name: "Bord du lac", x: 22, z: -17 },
      { name: "Place de rencontre", x: 0, z: 23 }
    ];

    places.forEach((place, i) => {
      state.landmarks.push({
        id: `landmark-${index}-${i}`,
        name: place.name,
        position: new BABYLON.Vector3(place.x, 0, place.z),
        visited: false
      });
    });
  }

  function disposeMissionObjects() {
    state.decorations.forEach(safeDispose);
    state.decorations = [];

    state.npcs.forEach((npc) => safeDispose(npc.root));
    state.npcs = [];

    state.collectibles = [];
    state.landmarks = [];

    player = null;
    currentInteraction = null;
  }

  function buildMissionWorld(index) {
    if (!scene) {
      throw new Error("La scène 3D n'est pas prête.");
    }

    worldGeneration++;
    const generation = worldGeneration;

    setVisible($("worldLoadingOverlay"), true);
    setText($("worldLoadingText"), "Préparation du nouvel environnement...");

    disposeMissionObjects();

    state.missionIndex = clamp(index, 0, missionData.length - 1);

    const plan = buildMissionPlan(state.missionIndex);

    state.missionRuntime = {
      plan,
      stageIndex: 0,
      collected: [],
      talked: [],
      visited: [],
      storySeen: false,
      generation
    };

    createWorldEnvironment(state.missionIndex);
    createPlayer();
    createMissionCharacters(state.missionIndex);
    createMissionCollectibles(state.missionIndex);
    createLandmarks(state.missionIndex);

    if (camera && player) {
      camera.target = new BABYLON.Vector3(
        player.position.x,
        1.4,
        player.position.z
      );
    }

    updateMissionHeader();
    updateObjective();
    refreshMissionList();

    setTimeout(() => {
      if (generation === worldGeneration) {
        setVisible($("worldLoadingOverlay"), false);
      }
    }, 350);
  }

  /* ----------------------------------------------------------
     11. MOTEUR 3D BABYLON.JS
  ---------------------------------------------------------- */

  async function initializeEngine() {
    if (!canvas) {
      throw new Error("Le canvas loveGameCanvas est absent du HTML.");
    }

    if (!window.BABYLON || !BABYLON.Engine) {
      throw new Error(
        "Babylon.js n'est pas accessible dans window.BABYLON. Vérifiez son chargement dans le HTML."
      );
    }

    if (engine && !engine.isDisposed) {
      try {
        engine.dispose();
      } catch (_) {}
    }

    engine = new BABYLON.Engine(
      canvas,
      true,
      {
        preserveDrawingBuffer: false,
        stencil: true,
        antialias: true,
        adaptToDeviceRatio: true
      }
    );

    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.52, 0.76, 0.91, 1);

    scene.collisionsEnabled = false;
    scene.skipPointerMovePicking = true;

    const hemi = new BABYLON.HemisphericLight(
      "hemiLight",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );

    hemi.intensity = 0.85;

    const sun = new BABYLON.DirectionalLight(
      "sunLight",
      new BABYLON.Vector3(-0.4, -1, 0.3),
      scene
    );

    sun.position = new BABYLON.Vector3(-20, 35, -10);
    sun.intensity = 0.8;

    camera = new BABYLON.ArcRotateCamera(
      "gameCamera",
      -Math.PI / 2,
      1.08,
      15,
      new BABYLON.Vector3(0, 1.4, 8),
      scene
    );

    camera.lowerRadiusLimit = 6;
    camera.upperRadiusLimit = 48;
    camera.lowerBetaLimit = 0.3;
    camera.upperBetaLimit = 1.45;
    camera.wheelPrecision = 35;
    camera.panningSensibility = 0;
    camera.inertia = 0.7;

    camera.attachControl(canvas, false);
    camera.inputs.clear();

    engine.setHardwareScalingLevel(
      state.settings.quality === "high"
        ? 1
        : state.settings.quality === "low"
          ? 1.6
          : 1.25
    );

    engine.runRenderLoop(() => {
      if (!scene || scene.isDisposed) return;

      const now = performance.now();

      frameDelta = lastFrame
        ? Math.min((now - lastFrame) / 1000, 0.05)
        : 0.016;

      lastFrame = now;

      if (!state.paused && state.screen === "gameScreen") {
        updateKeyboardMovement();
        updatePlayer(frameDelta);
        updateNPCs(frameDelta);
        updateCollectibles(frameDelta);
        checkAutomaticObjectives();
      }

      if (player && camera && !camera.isDisposed) {
        camera.target.x +=
          (player.position.x - camera.target.x) * 0.08;

        camera.target.y +=
          (1.5 - camera.target.y) * 0.08;

        camera.target.z +=
          (player.position.z - camera.target.z) * 0.08;
      }

      scene.render();
    });

    window.addEventListener("resize", () => {
      if (engine) engine.resize();
    });
  }

  /* ----------------------------------------------------------
     12. DÉPLACEMENT DU JOUEUR
  ---------------------------------------------------------- */

  function updateKeyboardMovement() {
    if (state.joystick.pointerId !== null) return;

    let x = 0;
    let y = 0;

    if (keys.has("ArrowLeft") || keys.has("KeyA")) x -= 1;
    if (keys.has("ArrowRight") || keys.has("KeyD")) x += 1;
    if (keys.has("ArrowUp") || keys.has("KeyW")) y += 1;
    if (keys.has("ArrowDown") || keys.has("KeyS")) y -= 1;

    const magnitude = Math.sqrt(x * x + y * y);

    if (magnitude > 0) {
      state.joystick.x = x / magnitude;
      state.joystick.y = y / magnitude;
      state.joystick.active = true;
    } else {
      state.joystick.x = 0;
      state.joystick.y = 0;
      state.joystick.active = false;
    }
  }

  function updatePlayer(delta) {
    if (!player || !state.joystick.active) {
      animatePlayerIdle(delta);
      updateInteractionTarget();
      return;
    }

    const x = state.joystick.x;
    const y = state.joystick.y;

    const direction = camera
      ? camera.alpha
      : -Math.PI / 2;

    const forwardX = -Math.sin(direction);
    const forwardZ = -Math.cos(direction);
    const rightX = Math.cos(direction);
    const rightZ = -Math.sin(direction);

    let moveX = rightX * x + forwardX * y;
    let moveZ = rightZ * x + forwardZ * y;

    const magnitude = Math.sqrt(moveX * moveX + moveZ * moveZ);

    if (magnitude > 1) {
      moveX /= magnitude;
      moveZ /= magnitude;
    }

    const speed = player.speed * (state.isRunning ? 1.8 : 1);

    player.position.x = clamp(
      player.position.x + moveX * speed * delta,
      -43,
      43
    );

    player.position.z = clamp(
      player.position.z + moveZ * speed * delta,
      -43,
      43
    );

    if (magnitude > 0.02) {
      player.root.rotation.y = Math.atan2(moveX, moveZ);
      animatePlayerWalk(delta);
    }

    if (isJumping) {
      jumpVelocity -= 15 * delta;
      player.root.position.y += jumpVelocity * delta;

      if (player.root.position.y <= 0) {
        player.root.position.y = 0;
        jumpVelocity = 0;
        isJumping = false;
      }
    }

    updateInteractionTarget();
  }

  function animatePlayerWalk(delta) {
    if (!player) return;

    player.walkTime += delta * (state.isRunning ? 13 : 8);

    const swing = Math.sin(player.walkTime) * 0.48;

    player.leftLeg.rotation.x = swing;
    player.rightLeg.rotation.x = -swing;
    player.leftArm.rotation.x = -swing * 0.75;
    player.rightArm.rotation.x = swing * 0.75;
  }

  function animatePlayerIdle(delta) {
    if (!player) return;

    player.walkTime += delta * 1.8;

    player.leftLeg.rotation.x *= 0.85;
    player.rightLeg.rotation.x *= 0.85;
    player.leftArm.rotation.x *= 0.85;
    player.rightArm.rotation.x *= 0.85;
  }

  function jumpPlayer() {
    if (!player || state.paused || isJumping) return;

    isJumping = true;
    jumpVelocity = 6.5;
  }

  function updateCollectibles(delta) {
    state.collectibles.forEach((item) => {
      if (item.collected || meshIsDisposed(item.mesh)) return;

      item.phase += delta * 1.8;
      item.mesh.position.y = item.baseY + Math.sin(item.phase) * 0.22;
      item.mesh.rotation.y += delta * 0.8;
    });
  }

  /* ----------------------------------------------------------
     13. JOYSTICK TACTILE
  ---------------------------------------------------------- */

  function setupJoystick() {
    const base = $("joystickBase");
    const thumb = $("joystickThumb");
    const control = $("movementControl");

    if (!base || !thumb || !control) return;

    function updateJoystick(event) {
      const rect = base.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = event.clientX - centerX;
      let dy = event.clientY - centerY;

      const maxRadius = Math.max(1, rect.width * 0.32);
      const length = Math.sqrt(dx * dx + dy * dy);

      if (length > maxRadius) {
        dx = dx / length * maxRadius;
        dy = dy / length * maxRadius;
      }

      state.joystick.x = clamp(dx / maxRadius, -1, 1);
      state.joystick.y = clamp(-dy / maxRadius, -1, 1);

      thumb.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    control.addEventListener("pointerdown", (event) => {
      if (state.paused || state.screen !== "gameScreen") return;

      event.preventDefault();

      state.joystick.active = true;
      state.joystick.pointerId = event.pointerId;

      try {
        control.setPointerCapture(event.pointerId);
      } catch (_) {}

      updateJoystick(event);
    });

    control.addEventListener("pointermove", (event) => {
      if (!state.joystick.active) return;
      if (event.pointerId !== state.joystick.pointerId) return;

      event.preventDefault();
      updateJoystick(event);
    });

    function stopJoystick(event) {
      if (
        event &&
        state.joystick.pointerId !== null &&
        event.pointerId !== state.joystick.pointerId
      ) {
        return;
      }

      state.joystick.active = false;
      state.joystick.pointerId = null;
      state.joystick.x = 0;
      state.joystick.y = 0;

      thumb.style.transform = "translate(0px, 0px)";
    }

    control.addEventListener("pointerup", stopJoystick);
    control.addEventListener("pointercancel", stopJoystick);
    control.addEventListener("lostpointercapture", stopJoystick);
  }

  /* ----------------------------------------------------------
     14. CAMÉRA, GLISSEMENT ET ZOOM À DEUX DOIGTS
  ---------------------------------------------------------- */

  function setupCameraGestures() {
    if (!canvas) return;

    canvas.style.touchAction = "none";

    function pinchDistance() {
      const points = [...activePointers.values()];

      if (points.length < 2) return 0;

      const dx = points[0].x - points[1].x;
      const dy = points[0].y - points[1].y;

      return Math.sqrt(dx * dx + dy * dy);
    }

    canvas.addEventListener("pointerdown", (event) => {
      if (state.screen !== "gameScreen" || state.paused) return;

      activePointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY
      });

      if (activePointers.size === 1) {
        state.cameraControl.dragging = true;
        state.cameraControl.pointerId = event.pointerId;
        state.cameraControl.lastX = event.clientX;
        state.cameraControl.lastY = event.clientY;
      } else if (activePointers.size >= 2) {
        state.cameraControl.pinchDistance = pinchDistance();
        state.cameraControl.dragging = false;
      }
    });

    canvas.addEventListener("pointermove", (event) => {
      if (!activePointers.has(event.pointerId)) return;

      activePointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY
      });

      if (activePointers.size >= 2) {
        const nextDistance = pinchDistance();

        if (state.cameraControl.pinchDistance > 0 && camera) {
          const delta = nextDistance - state.cameraControl.pinchDistance;

          camera.radius = clamp(
            camera.radius - delta * 0.035 * state.settings.sensitivity,
            6,
            48
          );
        }

        state.cameraControl.pinchDistance = nextDistance;
        return;
      }

      if (
        !state.cameraControl.dragging ||
        event.pointerId !== state.cameraControl.pointerId ||
        !camera
      ) {
        return;
      }

      const dx = event.clientX - state.cameraControl.lastX;
      const dy = event.clientY - state.cameraControl.lastY;

      camera.alpha -= dx * 0.005 * state.settings.sensitivity;

      camera.beta = clamp(
        camera.beta + dy * 0.004 * state.settings.sensitivity,
        0.3,
        1.45
      );

      state.cameraControl.lastX = event.clientX;
      state.cameraControl.lastY = event.clientY;
    });

    function finishPointer(event) {
      activePointers.delete(event.pointerId);

      if (activePointers.size < 2) {
        state.cameraControl.pinchDistance = 0;
      }

      if (activePointers.size === 0) {
        state.cameraControl.dragging = false;
        state.cameraControl.pointerId = null;
      } else if (activePointers.size === 1) {
        const remaining = [...activePointers.entries()][0];

        state.cameraControl.pointerId = remaining[0];
        state.cameraControl.lastX = remaining[1].x;
        state.cameraControl.lastY = remaining[1].y;
        state.cameraControl.dragging = true;
      }
    }

    canvas.addEventListener("pointerup", finishPointer);
    canvas.addEventListener("pointercancel", finishPointer);
    canvas.addEventListener("lostpointercapture", finishPointer);

    canvas.addEventListener("wheel", (event) => {
      if (!camera || state.screen !== "gameScreen") return;

      event.preventDefault();

      camera.radius = clamp(
        camera.radius + event.deltaY * 0.025,
        6,
        48
      );
    }, { passive: false });
  }

  /* ----------------------------------------------------------
     15. OBJECTIFS ET PROGRESSION
  ---------------------------------------------------------- */

  function updateMissionHeader() {
    const mission = getCurrentMission();
    if (!mission) return;

    setText(
      $("missionNumber"),
      `MISSION ${String(missionData.indexOf(mission) + 1).padStart(2, "0")} / ${missionData.length}`
    );

    setText($("missionTitle"), mission.title);

    const listTitle = $("missionsScreen")?.querySelector(".panel-header h2");

    if (listTitle) {
      listTitle.textContent = `Les ${missionData.length} missions`;
    }
  }

  function updateObjective() {
    if (!state.missionRuntime) return;

    const runtime = state.missionRuntime;
    const plan = runtime.plan;
    const stage = currentStage();
    const total = plan.stages.length;
    const completed = runtime.stageIndex;

    if (!stage) {
      setText($("objectiveText"), "Mission accomplie !");
      setText($("objectiveProgressText"), `${total} / ${total}`);

      if ($("objectiveProgressBar")) {
        $("objectiveProgressBar").style.width = "100%";
      }

      return;
    }

    const objectiveText = {
      talk: "Approchez-vous d'un personnage et engagez une conversation.",
      collect: "Explorez les alentours et récupérez un objet lumineux.",
      visit: "Rejoignez la zone indiquée pour découvrir ce lieu.",
      choice: "Rencontrez les personnages et faites un choix réfléchi.",
      help: "Approchez-vous de la personne qui a besoin de votre aide.",
      inspect: "Cherchez un indice et examinez-le.",
      deliver: "Trouvez un objet et remettez-le à la bonne personne.",
      perform: "Rejoignez les participants et prenez part à l'activité."
    };

    setText(
      $("objectiveText"),
      `${stage.label} — ${objectiveText[stage.action] || plan.goal}`
    );

    setText($("objectiveProgressText"), `${completed} / ${total}`);

    if ($("objectiveProgressBar")) {
      $("objectiveProgressBar").style.width =
        `${completed / Math.max(1, total) * 100}%`;
    }

    updateInteractionTarget();
  }

  function refreshMissionList() {
    const list = $("missionsList");
    if (!list) return;

    list.replaceChildren();

    missionData.forEach((mission, index) => {
      const completed = state.completedMissions.includes(index);
      const current = index === state.missionIndex;

      const card = document.createElement("button");
      card.type = "button";
      card.className = "mission-list-item";
      card.style.width = "100%";
      card.style.textAlign = "left";
      card.style.margin = "5px 0";
      card.style.padding = "12px";
      card.style.borderRadius = "12px";
      card.style.border = current
        ? "2px solid #dca6c5"
        : "1px solid rgba(160,130,160,.25)";
      card.style.background = completed
        ? "rgba(100,170,120,.15)"
        : current
          ? "rgba(210,150,190,.16)"
          : "rgba(120,100,140,.06)";
      card.style.color = "inherit";

      const heading = document.createElement("strong");
      heading.textContent =
        `${String(index + 1).padStart(2, "0")}. ${mission.title}`;

      const description = document.createElement("p");
      description.textContent = mission.story;
      description.style.margin = "6px 0";

      const status = document.createElement("small");
      status.textContent = completed
        ? "✓ Mission terminée"
        : current
          ? "● Mission actuelle"
          : index > state.missionIndex
            ? "🔒 À découvrir"
            : "Disponible";

      card.append(heading, description, status);

      card.addEventListener("click", () => {
        if (index > state.missionIndex) {
          notify("Terminez les missions précédentes pour débloquer celle-ci.");
          return;
        }

        if (completed) {
          notify("Cette mission est déjà terminée.");
          return;
        }

        if (index < state.missionIndex) {
          showConfirmation(
            "Rejouer une mission ?",
            "La mission actuelle sera remplacée. Votre progression terminée restera conservée.",
            () => {
              state.missionIndex = index;
              state.gameStarted = true;
              state.paused = false;
              buildMissionWorld(index);
              showGame();
              saveGame();
            }
          );
          return;
        }

        closeMissions();
      });

      list.appendChild(card);
    });

    const done = state.completedMissions.length;

    setText(
      $("missionsSummary"),
      `${done} mission${done !== 1 ? "s" : ""} terminée${done !== 1 ? "s" : ""} sur ${missionData.length}`
    );

    if ($("overallProgressBar")) {
      $("overallProgressBar").style.width =
        `${done / missionData.length * 100}%`;
    }
  }

  function checkAutomaticObjectives() {
    if (!player || !state.missionRuntime || state.paused) return;

    const stage = currentStage();
    if (!stage || stage.action !== "visit") return;

    const landmark = state.landmarks.find((item) =>
      distanceXZ(player.position, item.position) < 3 &&
      !item.visited
    );

    if (landmark) {
      landmark.visited = true;
      completeStage(`Vous avez découvert : ${landmark.name}.`);
    }
  }

  function completeStage(message) {
    if (!state.missionRuntime) return;

    const runtime = state.missionRuntime;
    const stage = currentStage();

    if (!stage || stage.done) return;

    stage.done = true;
    runtime.stageIndex++;

    if (message) notify(message, 2400);

    updateObjective();
    refreshMissionList();
    scheduleAutosave();

    if (runtime.stageIndex >= runtime.plan.stages.length) {
      completeMission();
    } else {
      const next = currentStage();

      notify(
        `Étape terminée ! Prochaine activité : ${next.label}`,
        2800
      );
    }
  }

  function completeMission() {
    if (!state.missionRuntime) return;

    const mission = state.missionRuntime.plan;
    const index = mission.number - 1;

    if (!state.completedMissions.includes(index)) {
      state.completedMissions.push(index);
    }

    setText(
      $("completionTitle"),
      `Mission ${mission.number} accomplie !`
    );

    setText(
      $("completionMessage"),
      `Vous avez terminé « ${mission.title} ». ${mission.story}`
    );

    setText(
      $("completionProgress"),
      `${state.completedMissions.length} / ${missionData.length}`
    );

    state.paused = true;
    state.running = false;

    stopVoice();
    stopMusic();

    refreshMissionList();
    saveGame();

    if (index >= missionData.length - 1) {
      showScreen("endingScreen");
      notify("Félicitations ! Vous avez terminé les 35 missions.", 4500);
    } else {
      showScreen("missionCompleteScreen");
    }
  }

  function goToNextMission() {
    if (state.missionIndex >= missionData.length - 1) {
      showScreen("endingScreen");
      return;
    }

    state.missionIndex++;
    state.gameStarted = true;
    state.paused = false;

    buildMissionWorld(state.missionIndex);
    showGame();
    showMissionIntroduction();
    startMusicIfEnabled();
    saveGame();
  }

  /* ----------------------------------------------------------
     16. CIBLES ET INTERACTIONS
  ---------------------------------------------------------- */

  function findNearestTarget() {
    if (!player) return null;

    let nearest = null;
    let nearestDistance = 5;

    state.npcs.forEach((npc) => {
      const d = distanceXZ(player.position, npc.root.position);

      if (d < nearestDistance) {
        nearestDistance = d;

        nearest = {
          kind: "npc",
          id: npc.id,
          name: npc.name,
          object: npc,
          distance: d
        };
      }
    });

    state.collectibles.forEach((item) => {
      if (item.collected || meshIsDisposed(item.mesh)) return;

      const d = distanceXZ(player.position, item.mesh.position);

      if (d < nearestDistance) {
        nearestDistance = d;

        nearest = {
          kind: "collectible",
          id: item.id,
          name: item.name,
          object: item,
          distance: d
        };
      }
    });

    state.landmarks.forEach((item) => {
      const d = distanceXZ(player.position, item.position);

      if (d < nearestDistance) {
        nearestDistance = d;

        nearest = {
          kind: "landmark",
          id: item.id,
          name: item.name,
          object: item,
          distance: d
        };
      }
    });

    return nearest;
  }

  function updateInteractionTarget() {
    if (!player || state.paused || state.screen !== "gameScreen") {
      setVisible($("interactionPrompt"), false);
      return;
    }

    const target = findNearestTarget();
    state.activeTarget = target;

    if (!target) {
      setVisible($("interactionPrompt"), false);
      return;
    }

    setText(
      $("interactionText"),
      target.kind === "npc"
        ? `Parler à ${target.name}`
        : target.kind === "collectible"
          ? "Récupérer le souvenir"
          : `Explorer : ${target.name}`
    );

    setText(
      $("interactionIcon"),
      target.kind === "npc"
        ? "♡"
        : target.kind === "collectible"
          ? "✦"
          : "◎"
    );

    setVisible($("interactionPrompt"), true);
  }

  function interact() {
    if (!state.gameStarted || state.paused || !state.missionRuntime) {
      return;
    }

    const target = findNearestTarget();

    if (!target) {
      notify("Approchez-vous d'un personnage, d'un objet ou d'une zone.");
      return;
    }

    const stage = currentStage();
    if (!stage) return;

    if (target.kind === "npc") {
      interactWithCharacter(target.object, stage);
    } else if (target.kind === "collectible") {
      collectItem(target.object, stage);
    } else {
      interactWithLandmark(target.object, stage);
    }
  }

  function interactWithCharacter(character, stage) {
    if (!character || !stage) return;

    if (stage.action === "collect" || stage.action === "inspect") {
      notify("Pour cette étape, cherchez un objet ou un indice.");
      return;
    }

    if (stage.action === "visit") {
      notify("Explorez la zone indiquée au sol.");
      return;
    }

    if (
      stage.action === "deliver" &&
      state.missionRuntime.collected.length === 0
    ) {
      notify("Vous devez d'abord récupérer un objet.");
      return;
    }

    character.interactionCount++;
    character.aiState = "talking";

    openDialogue(character, stage);
  }

  function interactWithLandmark(landmark, stage) {
    if (!landmark || !stage) return;

    if (stage.action === "visit") {
      if (!landmark.visited) {
        landmark.visited = true;
        completeStage(`Vous avez découvert ${landmark.name}.`);
      }
      return;
    }

    if (stage.action === "inspect") {
      state.flags[`inspected-${landmark.id}`] = true;
      completeStage(`Vous avez examiné ${landmark.name}. Un indice est découvert !`);
      return;
    }

    notify("Explorez cette zone et cherchez les personnages à proximité.");
  }

  function collectItem(item, stage) {
    const runtime = state.missionRuntime;

    if (!runtime || !item || item.collected) return;

    if (!["collect", "deliver", "help", "inspect"].includes(stage.action)) {
      notify("Cet objet est intéressant, mais votre objectif actuel est différent.");
      return;
    }

    item.collected = true;
    item.mesh.setEnabled(false);

    if (!runtime.collected.includes(item.id)) {
      runtime.collected.push(item.id);
    }

    if (!state.inventory.includes(item.name)) {
      state.inventory.push(item.name);
    }

    if (stage.action === "deliver") {
      notify("Objet récupéré. Approchez-vous du destinataire.");
      scheduleAutosave();
      return;
    }

    completeStage(`Vous avez récupéré : ${item.name}.`);
  }

  /* ----------------------------------------------------------
     17. DIALOGUES, CHOIX ET CONSÉQUENCES
  ---------------------------------------------------------- */

  function openDialogue(character, stage) {
    if (!character || !stage) return;

    stopVoice();
    dialogueTransition = false;

    const mission = getCurrentMission();
    const relationshipLine = state.relationship >= 5
      ? "Je remarque que nos conversations nous ont rapprochés. J'apprécie la confiance que nous construisons."
      : "Je pense que nous pouvons mieux nous comprendre si nous prenons le temps de nous écouter.";

    const lines = [
      character.greeting,
      DIALOGUE_BANK[
        (state.missionIndex * 3 + character.dialogueIndex) %
        DIALOGUE_BANK.length
      ],
      `${state.profile.name}, dans cette mission, nous devons ${mission.goal.toLowerCase()}. Je crois que nous pouvons y arriver en travaillant ensemble.`,
      relationshipLine,
      `Personnellement, je suis plutôt ${character.personality}. J'essaie de comprendre les autres avant de prendre une décision.`,
      "J'aimerais connaître ton point de vue. Que ferais-tu à ma place ?",
      "Merci de prendre le temps de discuter avec moi. Les paroles ont de la valeur lorsqu'elles sont suivies d'actions."
    ];

    state.currentDialogue = {
      character,
      stage,
      line: 0,
      lines,
      chosen: false,
      choiceText: ""
    };

    setText($("speakerName"), character.name);
    setText($("speakerAvatar"), character.name.slice(0, 1) || "♡");

    const choices = $("dialogueChoices");
    if (choices) choices.replaceChildren();

    const choiceTexts = [
      "Je t'écoute avec attention.",
      "Je préfère agir et apporter mon aide.",
      "Je veux comprendre avant de décider."
    ];

    choiceTexts.forEach((text, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "dialogue-choice-button";
      button.textContent = text;

      button.addEventListener("click", () => {
        chooseDialogueOption(index, text);
      });

      if (choices) choices.appendChild(button);
    });

    setVisible($("dialoguePanel"), true);
    renderDialogueLine();
  }

  function renderDialogueLine() {
    const dialogue = state.currentDialogue;
    if (!dialogue) return;

    const line = dialogue.lines[dialogue.line] || "";

    setText($("dialogueText"), line);

    if ($("dialogueText")) {
      $("dialogueText").style.visibility =
        state.settings.subtitles ? "visible" : "hidden";
    }

    setText(
      $("dialogueVoiceStatus"),
      state.settings.voice
        ? "Dialogue en français"
        : "Voix désactivée"
    );

    if (state.settings.voice) speakFrench(line);
  }

  function nextDialogueLine() {
    const dialogue = state.currentDialogue;
    if (!dialogue || dialogueTransition) return;

    if (dialogue.line < dialogue.lines.length - 1) {
      dialogue.line++;
      renderDialogueLine();
    } else {
      closeDialogue(true);
    }
  }

  function chooseDialogueOption(index, text) {
    const dialogue = state.currentDialogue;
    if (!dialogue || dialogue.chosen) return;

    const mission = getCurrentMission();
    const key = `${state.missionIndex + 1}-${dialogue.character.id}`;

    state.choices[key] = {
      index,
      text,
      timestamp: Date.now()
    };

    state.relationship += index === 0 ? 2 : index === 1 ? 3 : 1;
    dialogue.chosen = true;
    dialogue.choiceText = text;

    const responses = [
      "Merci de m'avoir écouté. Je me sens compris et respecté.",
      "Je suis heureux de voir que tu souhaites agir concrètement.",
      "Prendre le temps de réfléchir peut nous aider à mieux nous comprendre."
    ];

    const choices = $("dialogueChoices");
    if (choices) {
      choices.replaceChildren();

      const response = document.createElement("p");
      response.textContent = responses[index];
      choices.appendChild(response);
    }

    dialogue.lines.push(
      `${dialogue.character.name} : ${responses[index]} Continuons notre aventure autour de « ${mission.title} ».`
    );

    dialogue.lines.push(
      "Je garderai en mémoire cette conversation. Ce sont souvent les petits gestes qui construisent les relations durables."
    );

    notify("Votre choix a été enregistré. Votre relation évolue.");
    scheduleAutosave();
  }

  function closeDialogue(completed) {
    const dialogue = state.currentDialogue;
    if (!dialogue) {
      setVisible($("dialoguePanel"), false);
      return;
    }

    if (completed) {
      const runtime = state.missionRuntime;
      const stage = dialogue.stage;

      if (runtime && stage) {
        const characterId = dialogue.character.id;

        if (!runtime.talked.includes(characterId)) {
          runtime.talked.push(characterId);
        }

        const character = dialogue.character;
        character.aiState = "idle";

        if (stage.action === "deliver") {
          if (runtime.collected.length > 0) {
            const itemId = runtime.collected.shift();

            runtime.collected = runtime.collected.filter(
              (id) => id !== itemId
            );

            completeStage(
              `Vous avez remis un objet à ${character.name}.`
            );
          } else {
            notify("Vous n'avez aucun objet à remettre.");
          }
        } else if (
          ["talk", "choice", "help", "perform"].includes(stage.action)
        ) {
          if (stage.action === "help") {
            notify(`Vous avez aidé ${character.name}.`);
          }

          if (stage.action === "perform") {
            notify(`Vous avez participé à l'activité avec ${character.name}.`);
          }

          completeStage(
            `Conversation terminée avec ${character.name}.`
          );
        } else {
          notify("Conversation terminée. Poursuivez votre objectif.");
        }
      }
    } else if (dialogue.character && dialogue.character.root) {
      dialogue.character.aiState = "idle";
    }

    state.currentDialogue = null;
    dialogueTransition = false;

    stopVoice();
    setVisible($("dialoguePanel"), false);

    const choices = $("dialogueChoices");
    if (choices) choices.replaceChildren();

    scheduleAutosave();
  }

  function showMissionIntroduction() {
    const mission = getCurrentMission();
    if (!mission || !state.missionRuntime) return;

    state.missionRuntime.storySeen = true;

    const lines = [
      `Mission ${state.missionIndex + 1} : ${mission.title}. ${mission.story}`,
      `Votre objectif : ${mission.goal}.`,
      `Votre aventure se déroule à ${mission.place}. Explorez les lieux, rencontrez les personnages et utilisez le bouton Interagir pour avancer.`,
      `Conseil : observez les objets lumineux, approchez-vous des personnages et prenez le temps d'écouter leurs histoires.`
    ];

    state.currentDialogue = {
      character: {
        id: "narrator",
        name: "Narrateur"
      },
      stage: null,
      line: 0,
      lines
    };

    setText($("speakerName"), "Narrateur");
    setText($("speakerAvatar"), "♡");
    setVisible($("dialoguePanel"), true);

    renderDialogueLine();
  }

  /* ----------------------------------------------------------
     18. SYNTHÈSE VOCALE FRANÇAISE
  ---------------------------------------------------------- */

  function speakFrench(text) {
    if (!state.settings.voice) return;

    if (!("speechSynthesis" in window)) {
      setText($("dialogueVoiceStatus"), "Voix française indisponible");
      return;
    }

    stopVoice();

    try {
      voiceUtterance = new SpeechSynthesisUtterance(text);
      voiceUtterance.lang = "fr-FR";
      voiceUtterance.rate = 0.93;
      voiceUtterance.pitch = 1.03;
      voiceUtterance.volume = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const frenchVoice = voices.find((voice) =>
        voice.lang && voice.lang.toLowerCase().startsWith("fr")
      );

      if (frenchVoice) voiceUtterance.voice = frenchVoice;

      voiceUtterance.onerror = () => {
        setText($("dialogueVoiceStatus"), "Lecture vocale interrompue");
      };

      window.speechSynthesis.speak(voiceUtterance);
    } catch (error) {
      console.warn("[FOBAS] Synthèse vocale :", error);
    }
  }

  function stopVoice() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    voiceUtterance = null;
  }

  function repeatDialogue() {
    const dialogue = state.currentDialogue;

    if (!dialogue) {
      notify("Aucun dialogue à réécouter.");
      return;
    }

    speakFrench(dialogue.lines[dialogue.line] || "");
  }

  /* ----------------------------------------------------------
     19. MUSIQUE GÉNÉRÉE LOCALEMENT
  ---------------------------------------------------------- */

  function ensureAudioContext() {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!audioContext) audioContext = new AudioContextClass();

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }

    return audioContext;
  }

  function playTone(frequency, duration, volume = 0.02, type = "sine") {
    if (!state.settings.music) return;

    const context = ensureAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      volume,
      context.currentTime + 0.08
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + duration + 0.05);
  }

  function startMusicIfEnabled() {
    if (!state.settings.music || musicTimer) return;

    if (!ensureAudioContext()) return;

    const melody = [
      261.63, 329.63, 392.00, 329.63,
      293.66, 349.23, 440.00, 349.23,
      261.63, 329.63, 392.00, 523.25,
      440.00, 392.00, 349.23, 293.66
    ];

    musicTimer = setInterval(() => {
      if (
        !state.settings.music ||
        !state.gameStarted ||
        state.paused
      ) {
        return;
      }

      const frequency = melody[musicStep % melody.length];

      playTone(frequency, 0.75, 0.012, "sine");

      if (musicStep % 4 === 0) {
        playTone(frequency / 2, 0.9, 0.006, "triangle");
      }

      musicStep++;
    }, 850);
  }

  function stopMusic() {
    if (musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
  }

  /* ----------------------------------------------------------
     20. CONFIRMATIONS ET MENUS
  ---------------------------------------------------------- */

  function showConfirmation(title, message, action) {
    confirmationAction = action;

    setText($("confirmationTitle"), title);
    setText($("confirmationMessage"), message);

    state.previousScreen = state.screen;
    setVisible($("confirmationScreen"), true);
  }

  function cancelConfirmation() {
    setVisible($("confirmationScreen"), false);
    confirmationAction = null;
  }

  function acceptConfirmation() {
    const action = confirmationAction;

    confirmationAction = null;
    setVisible($("confirmationScreen"), false);

    if (typeof action === "function") {
      try {
        const result = action();

        if (result && typeof result.catch === "function") {
          result.catch((error) => {
            console.error("[FOBAS] Confirmation :", error);
            notify("Cette action n'a pas pu être effectuée.");
          });
        }
      } catch (error) {
        console.error("[FOBAS] Confirmation :", error);
        notify("Cette action n'a pas pu être effectuée.");
      }
    }
  }

  function openMissions() {
    refreshMissionList();
    state.previousScreen = state.screen;
    setVisible($("missionsScreen"), true);
  }

  function closeMissions() {
    setVisible($("missionsScreen"), false);

    if (state.gameStarted && !state.paused) {
      showGame();
    } else if (state.screen === "mainMenu") {
      showScreen("mainMenu");
    } else if (state.paused) {
      showScreen("pauseScreen");
    }
  }

  function openSettings() {
    applySettingsToUI();
    state.previousScreen = state.screen;
    setVisible($("settingsScreen"), true);
  }

  function closeSettings() {
    setVisible($("settingsScreen"), false);
  }

  function openCredits() {
    state.previousScreen = state.screen;
    setVisible($("creditsScreen"), true);
  }

  function closeCredits() {
    setVisible($("creditsScreen"), false);
  }

  function startNewGame() {
    showConfirmation(
      "Nouvelle aventure",
      "Commencer une nouvelle aventure remplacera votre progression actuelle. Souhaitez-vous continuer ?",
      () => {
        state.missionIndex = 0;
        state.completedMissions = [];
        state.completedSteps = [];
        state.choices = {};
        state.flags = {};
        state.inventory = [];
        state.relationship = 0;
        state.gameStarted = true;
        state.paused = false;

        stopVoice();
        buildMissionWorld(0);
        showGame();
        showMissionIntroduction();
        startMusicIfEnabled();
        saveGame();

        notify("Votre aventure commence !");
      }
    );
  }

  async function continueGame() {
    await loadGame();

    if (!state.gameStarted && state.completedMissions.length === 0) {
      notify("Aucune progression sauvegardée. Commencez une nouvelle aventure.");
      return;
    }

    if (!state.missionRuntime) {
      buildMissionWorld(state.missionIndex);
    }

    state.gameStarted = true;
    state.paused = false;

    showGame();
    startMusicIfEnabled();

    notify("Bon retour dans votre aventure !");
  }

  function returnToMainMenu() {
    showConfirmation(
      "Retour au menu",
      "Votre progression sera sauvegardée avant de revenir au menu principal.",
      async () => {
        await saveGame();
        stopVoice();
        stopMusic();

        state.paused = true;
        state.running = false;

        showMenu();
      }
    );
  }

  function restartAdventure() {
    showConfirmation(
      "Recommencer l'aventure",
      "Voulez-vous recommencer depuis la première mission ?",
      () => {
        state.missionIndex = 0;
        state.completedMissions = [];
        state.completedSteps = [];
        state.choices = {};
        state.flags = {};
        state.inventory = [];
        state.relationship = 0;
        state.gameStarted = true;
        state.paused = false;

        buildMissionWorld(0);
        showGame();
        showMissionIntroduction();
        saveGame();
      }
    );
  }

  /* ----------------------------------------------------------
     21. CONNEXION DES BOUTONS HTML
  ---------------------------------------------------------- */

  function bindClick(id, callback) {
    const element = $(id);

    if (!element) {
      console.warn(`[FOBAS] Élément HTML introuvable : ${id}`);
      return;
    }

    element.addEventListener("click", (event) => {
      event.preventDefault();

      try {
        const result = callback(event);

        if (result && typeof result.catch === "function") {
          result.catch((error) => {
            console.error(`[FOBAS] Action ${id} :`, error);
            notify("Une erreur est survenue pendant cette action.");
          });
        }
      } catch (error) {
        console.error(`[FOBAS] Action ${id} :`, error);
        notify("Une erreur est survenue pendant cette action.");
      }
    });
  }

  function bindAllButtons() {
    bindClick("newGameButton", startNewGame);
    bindClick("continueGameButton", continueGame);
    bindClick("missionsMenuButton", openMissions);
    bindClick("settingsButton", openSettings);
    bindClick("creditsButton", openCredits);

    bindClick("pauseButton", showPause);
    bindClick("resumeButton", resumeGame);
    bindClick("pauseMissionsButton", openMissions);
    bindClick("openMissionsButton", openMissions);

    bindClick("closeMissionsButton", closeMissions);
    bindClick("closeSettingsButton", closeSettings);
    bindClick("closeCreditsButton", closeCredits);

    bindClick("saveGameButton", saveGame);
    bindClick("saveSettingsButton", readSettingsFromUI);
    bindClick("returnToMenuButton", returnToMainMenu);

    bindClick("nextMissionButton", goToNextMission);
    bindClick("completionMenuButton", showMenu);

    bindClick("restartGameButton", restartAdventure);
    bindClick("endingMenuButton", showMenu);

    bindClick("acceptConfirmationButton", acceptConfirmation);
    bindClick("cancelConfirmationButton", cancelConfirmation);

    bindClick("interactionPrompt", interact);
    bindClick("talkButton", interact);
    bindClick("jumpButton", jumpPlayer);

    bindClick("runButton", () => {
      state.isRunning = !state.isRunning;

      const button = $("runButton");

      if (button) {
        button.classList.toggle("active", state.isRunning);

        const label = button.querySelector("small");
        if (label) {
          label.textContent = state.isRunning ? "Marche" : "Courir";
        }
      }

      notify(
        state.isRunning ? "Course activée" : "Course désactivée",
        1200
      );
    });

    bindClick("closeDialogueButton", () => closeDialogue(false));
    bindClick("nextDialogueButton", nextDialogueLine);
    bindClick("repeatDialogueButton", repeatDialogue);

    bindClick("retryButton", async () => {
      setVisible($("errorScreen"), false);
      initializing = false;
      initialized = false;
      await initializeApplication();
    });

    bindClick("errorMenuButton", showMenu);

    if (canvas) {
      canvas.addEventListener("dblclick", () => {
        if (state.screen === "gameScreen") interact();
      });
    }
  }

  /* ----------------------------------------------------------
     22. CLAVIER ORDINATEUR
  ---------------------------------------------------------- */

  window.addEventListener("keydown", (event) => {
    const movementCodes = [
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
      "Space", "KeyW", "KeyA", "KeyS", "KeyD"
    ];

    if (movementCodes.includes(event.code)) {
      keys.add(event.code);

      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"]
          .includes(event.code)
      ) {
        event.preventDefault();
      }
    }

    if (event.code === "Escape") {
      if (state.currentDialogue) {
        closeDialogue(false);
      } else if (state.screen === "gameScreen") {
        showPause();
      } else if (state.screen === "pauseScreen") {
        resumeGame();
      }
    }

    if (event.code === "KeyE") interact();
    if (event.code === "Space" && state.screen === "gameScreen") jumpPlayer();
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.code);
  });

  window.addEventListener("blur", () => {
    keys.clear();

    state.joystick.active = false;
    state.joystick.pointerId = null;
    state.joystick.x = 0;
    state.joystick.y = 0;
  });

  /* ----------------------------------------------------------
     23. INITIALISATION GÉNÉRALE
  ---------------------------------------------------------- */

  async function initializeApplication() {
    if (initialized || initializing) return;

    initializing = true;

    try {
      if (missingIds.length > 0) {
        console.warn(
          "[FOBAS] Certains éléments HTML optionnels sont absents :",
          missingIds
        );
      }

      setVisible($("loadingScreen"), true);
      setVisible($("errorScreen"), false);

      setText($("loadingMessage"), "Initialisation des systèmes...");
      setText($("loadingPercent"), "10 %");

      if ($("loadingProgress")) {
        $("loadingProgress").style.width = "10%";
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      setText($("loadingMessage"), "Préparation du moteur 3D...");
      setText($("loadingPercent"), "30 %");

      if ($("loadingProgress")) {
        $("loadingProgress").style.width = "30%";
      }

      try {
        await openDatabase();
      } catch (error) {
        console.warn(
          "[FOBAS] IndexedDB indisponible. Utilisation de la sauvegarde locale de secours.",
          error
        );
      }

      await initializeEngine();

      setText($("loadingMessage"), "Préparation de votre histoire...");
      setText($("loadingPercent"), "65 %");

      bindAllButtons();
      setupJoystick();
      setupCameraGestures();

      await loadGame();

      if (!state.missionRuntime) {
        buildMissionWorld(state.missionIndex);
      }

      setText($("loadingMessage"), "Votre aventure est prête !");
      setText($("loadingPercent"), "100 %");

      if ($("loadingProgress")) {
        $("loadingProgress").style.width = "100%";
      }

      await new Promise((resolve) => setTimeout(resolve, 250));

      state.paused = true;
      state.running = false;

      showMenu();
      updateContinueButton();

      initialized = true;
      initializing = false;

      if (!window.__FOBAS_AMOUR_UNLOAD_BOUND__) {
        window.__FOBAS_AMOUR_UNLOAD_BOUND__ = true;

        window.addEventListener("beforeunload", () => {
          if (state.gameStarted) {
            try {
              saveGame();
            } catch (_) {}
          }

          stopVoice();
          stopMusic();

          if (jumpTimer) clearInterval(jumpTimer);
          if (autosaveTimer) clearTimeout(autosaveTimer);
          if (notificationTimer) clearTimeout(notificationTimer);
          if (frameTimer) clearInterval(frameTimer);
        });
      }

      console.info(
        `[FOBAS INTERACTIVE] Version ${VERSION} initialisée avec ${missionData.length} missions.`
      );

    } catch (error) {
      initialized = false;
      initializing = false;

      console.error("[FOBAS] Erreur d'initialisation :", error);

      showFatalError(
        "Impossible de démarrer le jeu",
        `${error.message || "Erreur inconnue"}. Vérifiez le chargement de Babylon.js, la prise en charge WebGL et les chemins des fichiers HTML, CSS et JavaScript.`
      );
    }
  }

  /* ----------------------------------------------------------
     24. API PUBLIQUE DE DÉBOGAGE
  ---------------------------------------------------------- */

  window.FOBASLoveGame = {
    version: VERSION,

    getState() {
      return {
        screen: state.screen,
        missionIndex: state.missionIndex,
        completedMissions: [...state.completedMissions],
        gameStarted: state.gameStarted,
        paused: state.paused,
        relationship: state.relationship,
        missionCount: missionData.length,
        npcCount: state.npcs.length,
        inventory: [...state.inventory]
      };
    },

    save: saveGame,
    load: loadGame,

    nextMission() {
      if (state.missionIndex < missionData.length - 1) {
        goToNextMission();
      }
    },

    interact,
    pause: showPause,
    resume: resumeGame
  };

  /* ----------------------------------------------------------
     25. DÉMARRAGE
  ---------------------------------------------------------- */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeApplication,
      { once: true }
    );
  } else {
    initializeApplication();
  }

})();















