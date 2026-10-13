/* ============================================================
   FOBAS INTERACTIVE — SUR L'AMOUR EN ACTION
   Fichier : appamourfobas.js
   Version : 2.0.0
   Moteur : Three.js r128
   Auteur du projet : MEME Selvandieu

   FONCTIONS :
   - Monde 3D procédural
   - Personnages 3D interactifs
   - 35 missions extensibles
   - Dialogues français avec synthèse vocale
   - Contrôles clavier et tactiles Android
   - Joystick, caméra tactile, zoom à deux doigts
   - Profil du joueur
   - Paramètres graphiques et audio
   - Sauvegarde locale et progression
   - Menu missions, pause, reprise et fin d'aventure

   IMPORTANT :
   Ce fichier utilise les identifiants présents dans
   appamourfobas.html. Il ne remplace pas le HTML ni le CSS.
============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     1. CONFIGURATION
  ========================================================== */

  const APP_VERSION = "2.0.0";
  const SAVE_KEY = "FOBAS_AMOUR_ACTION_SAVE_V2";
  const SETTINGS_KEY = "FOBAS_AMOUR_ACTION_SETTINGS_V2";
  const PROFILE_KEY = "FOBAS_AMOUR_ACTION_PROFILE_V2";

  const TOTAL_MISSIONS = 35;
  const THREE_ENGINE = window.THREE;

  const $ = (id) => document.getElementById(id);

  const clamp = (value, min, max) =>
    Math.min(max, Math.max(min, value));

  const distance2D = (a, b) => {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  };

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);

  const requiredIds = [
    "loadingScreen", "loadingProgress", "loadingPercent",
    "loadingMessage", "mainMenu", "gameScreen",
    "loveGameCanvas", "worldLoadingOverlay",
    "worldLoadingText", "newGameButton",
    "continueGameButton", "missionsMenuButton",
    "settingsButton", "creditsButton", "pauseButton",
    "missionNumber", "missionTitle", "objectiveText",
    "objectiveProgressBar", "objectiveProgressText",
    "interactionPrompt", "interactionText",
    "dialoguePanel", "speakerName", "dialogueText",
    "dialogueChoices", "nextDialogueButton",
    "repeatDialogueButton", "closeDialogueButton",
    "movementControl", "joystickBase", "joystickThumb",
    "runButton", "jumpButton", "talkButton",
    "gameNotification", "savingIndicator",
    "missionsScreen", "missionsList",
    "missionsSummary", "overallProgressBar",
    "closeMissionsButton", "pauseScreen",
    "resumeButton", "pauseMissionsButton",
    "saveGameButton", "returnToMenuButton",
    "settingsScreen", "closeSettingsButton",
    "voiceEnabled", "musicEnabled",
    "subtitlesEnabled", "qualitySelect",
    "sensitivityRange", "saveSettingsButton",
    "creditsScreen", "closeCreditsButton",
    "missionCompleteScreen", "completionTitle",
    "completionMessage", "completionProgress",
    "nextMissionButton", "completionMenuButton",
    "endingScreen", "restartGameButton",
    "endingMenuButton", "confirmationScreen",
    "confirmationTitle", "confirmationMessage",
    "cancelConfirmationButton", "acceptConfirmationButton",
    "errorScreen", "errorTitle", "errorMessage",
    "retryButton", "errorMenuButton", "saveStatus"
  ];

  let missingRequiredIds = requiredIds.filter((id) => !$(id));

  if (missingRequiredIds.length) {
    console.error(
      "[FOBAS] Éléments HTML manquants :",
      missingRequiredIds
    );
  }

  /* ==========================================================
     2. ÉTAT CENTRAL
  ========================================================== */

  const state = {
    initialized: false,
    running: false,
    paused: false,
    gameStarted: false,
    loading: false,
    currentMission: 0,
    objectiveProgress: 0,
    objectiveTarget: 1,
    completedMissions: [],
    unlockedMissions: [0],
    activeNPC: null,
    dialogueLines: [],
    dialogueIndex: 0,
    pendingConfirmation: null,
    notificationTimer: null,
    saveTimer: null,
    animationFrame: 0,
    lastFrameTime: 0,
    elapsed: 0,
    gameOver: false,
    interactionCooldown: 0,
    jumpVelocity: 0,
    verticalPosition: 0,
    runningHeld: false,
    joystickPointer: null,
    cameraPointer: null,
    touchPointers: new Map(),
    cameraYaw: 0,
    cameraPitch: 0.25,
    cameraDistance: 8,
    cameraTargetDistance: 8,
    movementX: 0,
    movementZ: 0,
    playerSpeed: 3.2,
    playerMoving: false,
    quality: "medium",
    renderer: null,
    scene: null,
    camera: null,
    clock: null,
    player: null,
    playerVisual: null,
    npcObjects: [],
    interactables: [],
    worldObjects: [],
    worldReady: false,
    profilePanel: null,
    profile: {
      fullName: "",
      age: "",
      country: ""
    },
    settings: {
      voice: true,
      music: true,
      subtitles: true,
      quality: "medium",
      sensitivity: 1
    },
    saveData: {
      version: APP_VERSION,
      currentMission: 0,
      completedMissions: [],
      unlockedMissions: [0],
      objectiveProgress: 0,
      position: { x: 0, y: 0, z: 0 },
      cameraYaw: 0,
      cameraPitch: 0.25,
      cameraDistance: 8,
      dialogueFlags: [],
      missionFlags: {},
      updatedAt: null
    }
  };

  /* ==========================================================
     3. DONNÉES DES MISSIONS

     Pour ajouter des missions :
     - ajouter une entrée dans EXTRA_MISSIONS ;
     - renseigner title, description, objective,
       character, dialogue, target et reward.

     Les missions supplémentaires sont ajoutées après les
     35 missions de base, sans devoir réécrire le moteur.
  ========================================================== */

  const BASE_MISSION_DATA = [
    {
      title: "Un regard inattendu",
      description: "Une rencontre peut changer une journée.",
      objective: "Rencontrez Camille près du jardin.",
      character: "Camille",
      location: "Le jardin des rencontres",
      target: 1,
      reward: "Votre histoire commence.",
      dialogue: [
        "Bonjour ! Je ne pensais pas rencontrer quelqu'un ici.",
        "J'aime les endroits où l'on peut parler tranquillement.",
        "Et vous, qu'est-ce qui vous amène dans ce jardin ?"
      ]
    },
    {
      title: "Le sourire mystérieux",
      description: "Apprenez à connaître une nouvelle personne.",
      objective: "Parlez à Gabriel et découvrez son histoire.",
      character: "Gabriel",
      location: "L'allée des fleurs",
      target: 1,
      reward: "Une nouvelle connaissance.",
      dialogue: [
        "Bonjour ! Vous semblez chercher quelque chose.",
        "Parfois, les meilleures histoires commencent par une simple conversation.",
        "Prenez votre temps. Chaque rencontre a son importance."
      ]
    },
    {
      title: "Une promenade à deux",
      description: "Découvrez les chemins du parc.",
      objective: "Rejoignez Camille dans le parc.",
      character: "Camille",
      location: "Le sentier du parc",
      target: 1,
      reward: "Un souvenir partagé.",
      dialogue: [
        "Ce sentier est magnifique, vous ne trouvez pas ?",
        "J'aime marcher ici lorsque le soleil commence à descendre.",
        "Allons découvrir ce qu'il y a un peu plus loin."
      ]
    },
    {
      title: "Le secret du banc",
      description: "Écoutez une confidence.",
      objective: "Retrouvez Gabriel et écoutez son histoire.",
      character: "Gabriel",
      location: "Le banc sous les arbres",
      target: 1,
      reward: "Une confiance nouvelle.",
      dialogue: [
        "Je viens souvent m'asseoir ici pour réfléchir.",
        "Il est parfois difficile de dire ce que l'on ressent.",
        "Merci de prendre le temps de m'écouter."
      ]
    },
    {
      title: "Une petite attention",
      description: "Montrez que les petits gestes comptent.",
      objective: "Retrouvez Camille et partagez un moment agréable.",
      character: "Camille",
      location: "La place romantique",
      target: 1,
      reward: "Une belle attention.",
      dialogue: [
        "Vous savez, les petites attentions peuvent illuminer une journée.",
        "Un geste sincère vaut parfois plus qu'un long discours.",
        "Je suis heureuse que nous ayons pu partager ce moment."
      ]
    },
    {
      title: "La lettre oubliée",
      description: "Aidez à retrouver un message important.",
      objective: "Parlez à Gabriel pour comprendre le mystère de la lettre.",
      character: "Gabriel",
      location: "La place centrale",
      target: 1,
      reward: "Le mystère avance.",
      dialogue: [
        "J'ai trouvé une lettre, mais je ne sais pas à qui elle appartient.",
        "Certains mots méritent d'être remis à la bonne personne.",
        "Nous finirons par découvrir son histoire."
      ]
    },
    {
      title: "Un parfum de souvenirs",
      description: "Évoquez les souvenirs qui rapprochent.",
      objective: "Retrouvez Camille dans le jardin fleuri.",
      character: "Camille",
      location: "Le jardin fleuri",
      target: 1,
      reward: "Un souvenir précieux.",
      dialogue: [
        "Les fleurs me rappellent les promenades de mon enfance.",
        "Les souvenirs nous accompagnent, même lorsque les lieux changent.",
        "Et vous, quel souvenir vous fait sourire ?"
      ]
    },
    {
      title: "Le rendez-vous surprise",
      description: "Préparez une rencontre inattendue.",
      objective: "Retrouvez Gabriel sur la place.",
      character: "Gabriel",
      location: "La place du rendez-vous",
      target: 1,
      reward: "Une surprise réussie.",
      dialogue: [
        "J'espère que cette surprise vous plaît.",
        "Je voulais simplement créer un beau souvenir.",
        "Parfois, il suffit d'un peu d'imagination."
      ]
    },
    {
      title: "Une vérité délicate",
      description: "Apprenez à parler avec sincérité.",
      objective: "Discutez avec Camille.",
      character: "Camille",
      location: "Le belvédère",
      target: 1,
      reward: "Une conversation sincère.",
      dialogue: [
        "La sincérité demande parfois du courage.",
        "Je préfère une parole honnête à une promesse vide.",
        "Merci de m'écouter sans me juger."
      ]
    },
    {
      title: "La confiance se construit",
      description: "Découvrez l'importance de la confiance.",
      objective: "Retrouvez Gabriel et parlez-lui.",
      character: "Gabriel",
      location: "Le vieux pont",
      target: 1,
      reward: "Une confiance renforcée.",
      dialogue: [
        "La confiance se construit petit à petit.",
        "Elle grandit grâce aux actes, pas seulement aux paroles.",
        "Continuons à apprendre à nous connaître."
      ]
    },
    {
      title: "Le chemin des fleurs",
      description: "Explorez un nouveau coin du parc.",
      objective: "Rejoignez Camille dans l'allée fleurie.",
      character: "Camille",
      location: "L'allée fleurie",
      target: 1,
      reward: "Un lieu découvert.",
      dialogue: [
        "Regardez toutes ces couleurs !",
        "J'aimerais que nous prenions le temps d'admirer cet endroit.",
        "Le bonheur se cache parfois dans les détails."
      ]
    },
    {
      title: "Un geste de courage",
      description: "Osez exprimer ce qui compte pour vous.",
      objective: "Parlez à Gabriel de votre prochaine décision.",
      character: "Gabriel",
      location: "La fontaine",
      target: 1,
      reward: "Un pas en avant.",
      dialogue: [
        "Il faut parfois du courage pour faire le premier pas.",
        "Personne ne peut choisir à votre place.",
        "L'important est d'agir avec respect et sincérité."
      ]
    },
    {
      title: "Le pique-nique improvisé",
      description: "Partagez un moment simple.",
      objective: "Retrouvez Camille près de la pelouse.",
      character: "Camille",
      location: "La grande pelouse",
      target: 1,
      reward: "Un moment de détente.",
      dialogue: [
        "Quel bel endroit pour faire une pause !",
        "Nous n'avons pas besoin d'un grand événement pour être heureux.",
        "Profitons simplement de cet instant."
      ]
    },
    {
      title: "La promesse",
      description: "Comprenez ce qu'une promesse signifie.",
      objective: "Discutez avec Gabriel.",
      character: "Gabriel",
      location: "Le chemin du lac",
      target: 1,
      reward: "Un engagement réfléchi.",
      dialogue: [
        "Une promesse doit être prise au sérieux.",
        "Il vaut mieux promettre peu et tenir parole.",
        "C'est ainsi que l'on gagne le respect."
      ]
    },
    {
      title: "Le message inattendu",
      description: "Découvrez une nouvelle surprise.",
      objective: "Retrouvez Camille pour découvrir son message.",
      character: "Camille",
      location: "Le jardin secret",
      target: 1,
      reward: "Un message découvert.",
      dialogue: [
        "J'avais quelque chose à vous raconter.",
        "Je ne savais pas comment commencer cette conversation.",
        "Maintenant que vous êtes là, je me sens plus à l'aise."
      ]
    },
    {
      title: "Au-delà des apparences",
      description: "Découvrez la personnalité derrière le sourire.",
      objective: "Parlez à Gabriel de ce qui compte vraiment.",
      character: "Gabriel",
      location: "La terrasse",
      target: 1,
      reward: "Une nouvelle perspective.",
      dialogue: [
        "Les apparences ne racontent jamais toute l'histoire.",
        "Il faut apprendre à regarder au-delà du premier regard.",
        "Chaque personne a une histoire qui mérite d'être entendue."
      ]
    },
    {
      title: "Un rêve partagé",
      description: "Imaginez un projet pour l'avenir.",
      objective: "Retrouvez Camille et échangez vos idées.",
      character: "Camille",
      location: "Le belvédère du parc",
      target: 1,
      reward: "Un projet imaginé.",
      dialogue: [
        "Si vous pouviez réaliser un grand rêve, lequel choisiriez-vous ?",
        "J'aime les personnes qui osent imaginer un avenir meilleur.",
        "Un projet commence souvent par une conversation."
      ]
    },
    {
      title: "La journée des surprises",
      description: "Découvrez ce que la journée vous réserve.",
      objective: "Retrouvez Gabriel près de la fontaine.",
      character: "Gabriel",
      location: "La fontaine centrale",
      target: 1,
      reward: "Une surprise partagée.",
      dialogue: [
        "Aujourd'hui, j'ai décidé de laisser un peu de place à l'imprévu.",
        "On ne sait jamais quelle belle rencontre nous attend.",
        "Prêt à découvrir la suite ?"
      ]
    },
    {
      title: "Le courage d'écouter",
      description: "Accordez toute votre attention à une personne.",
      objective: "Écoutez Camille jusqu'au bout.",
      character: "Camille",
      location: "Le jardin calme",
      target: 1,
      reward: "Une écoute sincère.",
      dialogue: [
        "Parfois, on n'a pas besoin de conseils, seulement d'une oreille attentive.",
        "Merci de me laisser parler librement.",
        "Écouter est aussi une belle manière de montrer son respect."
      ]
    },
    {
      title: "Le rendez-vous au coucher du soleil",
      description: "Partagez un moment au soleil couchant.",
      objective: "Rejoignez Gabriel au belvédère.",
      character: "Gabriel",
      location: "Le belvédère du coucher du soleil",
      target: 1,
      reward: "Un souvenir lumineux.",
      dialogue: [
        "Le ciel prend des couleurs extraordinaires ce soir.",
        "Certains moments deviennent précieux simplement parce qu'on les partage.",
        "Je suis content que vous soyez venu."
      ]
    },
    {
      title: "Le choix du cœur",
      description: "Réfléchissez à une décision importante.",
      objective: "Parlez à Camille de votre décision.",
      character: "Camille",
      location: "La place romantique",
      target: 1,
      reward: "Une décision réfléchie.",
      dialogue: [
        "Les décisions importantes méritent un peu de réflexion.",
        "Écoutez votre cœur, mais gardez aussi les pieds sur terre.",
        "Vous seul pouvez décider du chemin que vous voulez suivre."
      ]
    },
    {
      title: "Un malentendu",
      description: "Apprenez à clarifier une situation.",
      objective: "Retrouvez Gabriel et clarifiez la situation.",
      character: "Gabriel",
      location: "Le vieux pont",
      target: 1,
      reward: "Un malentendu éclairci.",
      dialogue: [
        "Je crois qu'il y a eu un malentendu.",
        "Poser des questions vaut mieux que tirer des conclusions trop vite.",
        "Je suis heureux que nous puissions en parler calmement."
      ]
    },
    {
      title: "Le pouvoir du pardon",
      description: "Découvrez la valeur du pardon.",
      objective: "Discutez avec Camille.",
      character: "Camille",
      location: "Le jardin des souvenirs",
      target: 1,
      reward: "Une nouvelle compréhension.",
      dialogue: [
        "Pardonner ne signifie pas oublier ce qui s'est passé.",
        "C'est parfois décider de ne plus laisser le passé tout contrôler.",
        "Le respect doit toujours rester au centre de nos relations."
      ]
    },
    {
      title: "Une fête improvisée",
      description: "Préparez un moment de joie.",
      objective: "Retrouvez Gabriel pour organiser la surprise.",
      character: "Gabriel",
      location: "La place centrale",
      target: 1,
      reward: "Une fête préparée.",
      dialogue: [
        "J'ai une idée pour rendre cette journée mémorable !",
        "Invitons tout le monde à partager un bon moment.",
        "La joie devient encore plus belle lorsqu'elle est partagée."
      ]
    },
    {
      title: "Le secret du jardin",
      description: "Explorez un endroit plein de mystère.",
      objective: "Retrouvez Camille dans le jardin secret.",
      character: "Camille",
      location: "Le jardin secret",
      target: 1,
      reward: "Un mystère éclairci.",
      dialogue: [
        "Ce jardin a quelque chose de spécial.",
        "J'ai toujours pensé que chaque endroit gardait une histoire.",
        "Inventons ensemble un nouveau souvenir ici."
      ]
    },
    {
      title: "Des chemins différents",
      description: "Apprenez à respecter les différences.",
      objective: "Discutez avec Gabriel.",
      character: "Gabriel",
      location: "Le carrefour des chemins",
      target: 1,
      reward: "Une meilleure compréhension.",
      dialogue: [
        "Nous ne voyons pas toujours les choses de la même manière.",
        "Cela ne veut pas dire que nous ne pouvons pas nous comprendre.",
        "Le respect ouvre souvent une porte au dialogue."
      ]
    },
    {
      title: "Le cadeau symbolique",
      description: "Découvrez la valeur d'un geste sincère.",
      objective: "Retrouvez Camille et partagez votre attention.",
      character: "Camille",
      location: "L'allée des roses",
      target: 1,
      reward: "Un geste mémorable.",
      dialogue: [
        "Un cadeau n'a pas besoin d'être cher pour être précieux.",
        "Ce qui compte, c'est l'intention et l'attention.",
        "Merci pour ce moment."
      ]
    },
    {
      title: "La grande conversation",
      description: "Parlez de vos attentes et de vos valeurs.",
      objective: "Retrouvez Gabriel pour une conversation importante.",
      character: "Gabriel",
      location: "La terrasse du parc",
      target: 1,
      reward: "Des idées mieux comprises.",
      dialogue: [
        "J'aimerais que nous parlions franchement de nos attentes.",
        "Une relation saine demande du dialogue et des limites respectées.",
        "Merci d'avoir pris le temps de discuter."
      ]
    },
    {
      title: "Le rêve d'avenir",
      description: "Imaginez les possibilités de demain.",
      objective: "Échangez avec Camille sur l'avenir.",
      character: "Camille",
      location: "Le belvédère",
      target: 1,
      reward: "Un nouvel horizon.",
      dialogue: [
        "L'avenir n'est pas écrit d'avance.",
        "Nous pouvons avancer pas à pas et apprendre en chemin.",
        "J'aime cette idée de construire quelque chose de positif."
      ]
    },
    {
      title: "L'épreuve de confiance",
      description: "Montrez que les actes comptent.",
      objective: "Retrouvez Gabriel et discutez de la confiance.",
      character: "Gabriel",
      location: "Le vieux pont",
      target: 1,
      reward: "Une confiance consolidée.",
      dialogue: [
        "La confiance demande de la patience.",
        "Elle ne se réclame pas : elle se construit par nos actes.",
        "Continuons à agir avec honnêteté."
      ]
    },
    {
      title: "Le grand événement",
      description: "Préparez un événement qui rassemble les amis.",
      objective: "Retrouvez Camille pour préparer la rencontre.",
      character: "Camille",
      location: "La place du festival",
      target: 1,
      reward: "Un événement organisé.",
      dialogue: [
        "J'ai envie de réunir les personnes qui comptent pour nous.",
        "Un beau moment peut commencer par une idée toute simple.",
        "Mettons-nous au travail ensemble !"
      ]
    },
    {
      title: "Une histoire à raconter",
      description: "Faites le bilan du chemin parcouru.",
      objective: "Retrouvez Gabriel et partagez vos souvenirs.",
      character: "Gabriel",
      location: "Le jardin des souvenirs",
      target: 1,
      reward: "Un chapitre de plus.",
      dialogue: [
        "Quand je repense à notre première rencontre, je souris.",
        "Nous avons appris beaucoup de choses au fil de nos conversations.",
        "Et notre histoire a encore de nombreuses pages à écrire."
      ]
    },
    {
      title: "Le moment de vérité",
      description: "Exprimez-vous avec maturité et respect.",
      objective: "Retrouvez Camille pour une dernière grande conversation.",
      character: "Camille",
      location: "Le belvédère du cœur",
      target: 1,
      reward: "Une étape importante franchie.",
      dialogue: [
        "Je pense que nous avons beaucoup appris ensemble.",
        "L'important est de rester honnête avec soi-même et avec les autres.",
        "Merci d'avoir partagé ce parcours avec moi."
      ]
    },
    {
      title: "Sur l'Amour en Action",
      description: "Célébrez le chemin parcouru et les liens créés.",
      objective: "Retrouvez Gabriel pour conclure cette aventure.",
      character: "Gabriel",
      location: "La place des souvenirs",
      target: 1,
      reward: "Les 35 missions sont terminées !",
      dialogue: [
        "Nous voici arrivés au terme de cette grande aventure.",
        "Chaque rencontre nous a appris quelque chose sur l'écoute, le respect et les émotions.",
        "Mais les plus belles histoires continuent au-delà du jeu. Merci d'avoir joué !"
      ]
    }
  ];

  /*
   * Missions supplémentaires :
   * Vous pouvez ajouter des objets à ce tableau.
   *
   * Exemple :
   * {
   *   title: "Une nouvelle aventure",
   *   description: "...",
   *   objective: "...",
   *   character: "Camille",
   *   location: "Le jardin secret",
   *   target: 1,
   *   reward: "...",
   *   dialogue: ["...", "..."]
   * }
   */
  const EXTRA_MISSIONS = [];

  function buildMissionList() {
    const missions = BASE_MISSION_DATA.map((mission, index) => ({
      ...mission,
      id: index,
      number: index + 1,
      extra: false
    }));

    EXTRA_MISSIONS.forEach((mission, index) => {
      missions.push({
        ...mission,
        id: missions.length,
        number: missions.length + 1,
        extra: true,
        target: Math.max(1, Number(mission.target) || 1),
        dialogue: Array.isArray(mission.dialogue)
          ? mission.dialogue
          : ["Bonjour ! Ravi de vous rencontrer."]
      });
    });

    return missions;
  }

  const missions = buildMissionList();

  /* ==========================================================
     4. OUTILS DOM
  ========================================================== */

  function showElement(id) {
    const element = $(id);
    if (element) element.classList.remove("hidden");
  }

  function hideElement(id) {
    const element = $(id);
    if (element) element.classList.add("hidden");
  }

  function setText(id, value) {
    const element = $(id);
    if (element) element.textContent = String(value ?? "");
  }

  function setProgress(id, percent) {
    const element = $(id);
    if (element) {
      element.style.width = `${clamp(percent, 0, 100)}%`;
    }
  }

  function showOnlyScreen(screenId) {
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
      if (id !== screenId) hideElement(id);
    });

    if (screenId) showElement(screenId);
  }

  function showNotification(message, duration = 2800) {
    const element = $("gameNotification");
    if (!element) return;

    element.textContent = message;
    element.classList.remove("hidden");

    if (state.notificationTimer) {
      clearTimeout(state.notificationTimer);
    }

    state.notificationTimer = setTimeout(() => {
      element.classList.add("hidden");
    }, duration);
  }

  function setSaveStatus(message) {
    setText("saveStatus", message);
  }

  function showError(title, message) {
    setText("errorTitle", title);
    setText("errorMessage", message);
    showOnlyScreen("errorScreen");
  }

  /* ==========================================================
     5. SAUVEGARDE ET PROFIL
  ========================================================== */

  function readJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn("[FOBAS] Lecture locale impossible :", error);
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("[FOBAS] Sauvegarde locale impossible :", error);
      setSaveStatus("Sauvegarde indisponible");
      return false;
    }
  }

  function loadSavedState() {
    const saved = readJSON(SAVE_KEY, null);

    if (saved && typeof saved === "object") {
      state.saveData = {
        ...state.saveData,
        ...saved
      };

      state.currentMission = clamp(
        Number(saved.currentMission) || 0,
        0,
        Math.max(0, missions.length - 1)
      );

      state.completedMissions = Array.isArray(saved.completedMissions)
        ? saved.completedMissions.filter(Number.isInteger)
        : [];

      state.unlockedMissions = Array.isArray(saved.unlockedMissions)
        ? saved.unlockedMissions.filter(Number.isInteger)
        : [0];

      if (!state.unlockedMissions.includes(0)) {
        state.unlockedMissions.unshift(0);
      }

      state.objectiveProgress = Math.max(
        0,
        Number(saved.objectiveProgress) || 0
      );

      state.gameStarted = state.completedMissions.length > 0 ||
        Number(saved.currentMission) > 0 ||
        Number(saved.objectiveProgress) > 0;

      state.cameraYaw = Number(saved.cameraYaw) || 0;
      state.cameraPitch = Number(saved.cameraPitch) || 0.25;
      state.cameraDistance = Number(saved.cameraDistance) || 8;
      state.cameraTargetDistance = state.cameraDistance;
    }

    const profile = readJSON(PROFILE_KEY, null);
    if (profile && typeof profile === "object") {
      state.profile = {
        ...state.profile,
        ...profile
      };
    }

    const settings = readJSON(SETTINGS_KEY, null);
    if (settings && typeof settings === "object") {
      state.settings = {
        ...state.settings,
        ...settings
      };
    }

    applySettingsToControls();
    updateContinueButton();
  }

  function saveGame(showMessage = true) {
    const playerPosition = state.player
      ? {
          x: state.player.position.x,
          y: state.player.position.y,
          z: state.player.position.z
        }
      : state.saveData.position;

    state.saveData = {
      ...state.saveData,
      version: APP_VERSION,
      currentMission: state.currentMission,
      completedMissions: [...state.completedMissions],
      unlockedMissions: [...new Set(state.unlockedMissions)],
      objectiveProgress: state.objectiveProgress,
      position: playerPosition,
      cameraYaw: state.cameraYaw,
      cameraPitch: state.cameraPitch,
      cameraDistance: state.cameraDistance,
      updatedAt: new Date().toISOString()
    };

    const success = writeJSON(SAVE_KEY, state.saveData);

    if (success) {
      setSaveStatus("Progression sauvegardée");

      if (showMessage) {
        showNotification("Votre progression a été sauvegardée.");
      }
    }

    updateContinueButton();
    return success;
  }

  function saveProfile() {
    const success = writeJSON(PROFILE_KEY, state.profile);

    if (success) {
      showNotification("Votre profil a été enregistré.");
    }
  }

  function updateContinueButton() {
    const button = $("continueGameButton");
    if (!button) return;

    const hasProgress = state.gameStarted ||
      state.completedMissions.length > 0;

    button.disabled = !hasProgress;
  }

  function scheduleAutoSave() {
    if (state.saveTimer) return;

    state.saveTimer = setTimeout(() => {
      state.saveTimer = null;
      saveGame(false);
    }, 12000);
  }

  /* ==========================================================
     6. PROFIL DYNAMIQUE

     Le HTML fourni ne contient pas de formulaire de profil.
     Celui-ci est créé par JavaScript sans modifier le HTML.
  ========================================================== */

  function createProfilePanel() {
    if (state.profilePanel) return;

    const section = document.createElement("section");
    section.id = "dynamicProfileScreen";
    section.className = "screen overlay-screen hidden";
    section.setAttribute("aria-label", "Profil du joueur");

    section.innerHTML = `
      <div class="panel-card settings-card">
        <header class="panel-header">
          <div>
            <p class="brand-kicker">VOTRE IDENTITÉ</p>
            <h2>Mon profil</h2>
          </div>
          <button id="closeProfileButton"
                  class="icon-button"
                  type="button"
                  aria-label="Fermer">×</button>
        </header>

        <form id="playerProfileForm">
          <label class="setting-row">
            <span>
              <strong>Nom complet</strong>
              <small>Le nom que vous souhaitez utiliser dans le jeu</small>
            </span>
            <input id="profileFullName"
                   type="text"
                   maxlength="100"
                   autocomplete="name"
                   placeholder="Votre nom complet">
          </label>

          <label class="setting-row">
            <span>
              <strong>Âge</strong>
              <small>Âge du joueur</small>
            </span>
            <input id="profileAge"
                   type="number"
                   min="13"
                   max="120"
                   inputmode="numeric"
                   placeholder="Votre âge">
          </label>

          <label class="setting-row">
            <span>
              <strong>Pays</strong>
              <small>Votre pays de résidence</small>
            </span>
            <input id="profileCountry"
                   type="text"
                   maxlength="100"
                   autocomplete="country-name"
                   placeholder="Votre pays">
          </label>

          <button class="primary-button"
                  type="submit">Enregistrer mon profil</button>
        </form>

        <p class="profile-privacy-note">
          Ces informations sont enregistrées localement sur cet appareil.
          Elles ne sont pas envoyées à un serveur par ce jeu.
        </p>
      </div>
    `;

    document.getElementById("loveGameApp").appendChild(section);
    state.profilePanel = section;

    $("closeProfileButton").addEventListener("click", () => {
      closeDynamicPanel("dynamicProfileScreen");
    });

    $("playerProfileForm").addEventListener("submit", (event) => {
      event.preventDefault();

      const fullName = $("profileFullName").value.trim();
      const ageValue = $("profileAge").value.trim();
      const country = $("profileCountry").value.trim();
      const age = Number(ageValue);

      if (!fullName) {
        showNotification("Veuillez saisir votre nom complet.");
        $("profileFullName").focus();
        return;
      }

      if (ageValue && (!Number.isInteger(age) || age < 13 || age > 120)) {
        showNotification("Veuillez vérifier l'âge indiqué.");
        $("profileAge").focus();
        return;
      }

      state.profile = {
        fullName,
        age: ageValue ? String(age) : "",
        country
      };

      saveProfile();
      closeDynamicPanel("dynamicProfileScreen");
    });

    const menuActions = document.querySelector(".menu-actions");

    if (menuActions) {
      const profileButton = document.createElement("button");
      profileButton.id = "profileButton";
      profileButton.type = "button";
      profileButton.className = "secondary-button";
      profileButton.textContent = "Mon profil";
      profileButton.addEventListener("click", openProfile);
      menuActions.insertBefore(profileButton, $("creditsButton"));
    }
  }

  function openProfile() {
    if (!state.profilePanel) createProfilePanel();

    $("profileFullName").value = state.profile.fullName || "";
    $("profileAge").value = state.profile.age || "";
    $("profileCountry").value = state.profile.country || "";

    showOnlyScreen("dynamicProfileScreen");
  }

  function closeDynamicPanel(id) {
    hideElement(id);

    if (state.gameStarted && !state.paused && state.running) {
      showOnlyScreen("gameScreen");
    } else {
      showOnlyScreen("mainMenu");
    }
  }

  /* ==========================================================
     7. THREE.JS : INITIALISATION
  ========================================================== */

  function initializeThree() {
    if (!THREE_ENGINE) {
      throw new Error(
        "Three.js est introuvable. Vérifiez le chargement de three.min.js."
      );
    }

    if (!THREE_ENGINE.WebGLRenderer) {
      throw new Error("Le moteur de rendu WebGL de Three.js est indisponible.");
    }

    const canvas = $("loveGameCanvas");

    if (!canvas) {
      throw new Error("Le canvas loveGameCanvas est introuvable.");
    }

    const renderer = new THREE_ENGINE.WebGLRenderer({
      canvas,
      antialias: state.settings.quality !== "low",
      alpha: false,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, state.settings.quality === "high" ? 2 : 1.35)
    );

    renderer.setSize(
      Math.max(1, canvas.clientWidth || window.innerWidth),
      Math.max(1, canvas.clientHeight || window.innerHeight),
      false
    );

    renderer.setClearColor(0x9bc7e8, 1);

    if ("outputEncoding" in renderer) {
      renderer.outputEncoding = THREE_ENGINE.sRGBEncoding;
    }

    state.renderer = renderer;
    state.scene = new THREE_ENGINE.Scene();
    state.scene.background = new THREE_ENGINE.Color(0x9bc7e8);
    state.scene.fog = new THREE_ENGINE.Fog(0x9bc7e8, 24, 95);

    state.camera = new THREE_ENGINE.PerspectiveCamera(
      58,
      1,
      0.1,
      180
    );

    state.clock = new THREE_ENGINE.Clock();

    createLighting();
    createWorld();
    createPlayer();
    createNPCs();
    createEnvironmentDetails();
    resizeRenderer();

    state.worldReady = true;

    if (state.saveData.position) {
      state.player.position.set(
        Number(state.saveData.position.x) || 0,
        0,
        Number(state.saveData.position.z) || 0
      );
    }

    state.cameraYaw = Number(state.saveData.cameraYaw) || 0;
    state.cameraPitch = Number(state.saveData.cameraPitch) || 0.25;
    state.cameraDistance = Number(state.saveData.cameraDistance) || 8;
    state.cameraTargetDistance = state.cameraDistance;

    updateCamera(1);

    window.addEventListener("resize", resizeRenderer, { passive: true });
    window.addEventListener("orientationchange", resizeRenderer, { passive: true });
  }

  function createLighting() {
    const THREE = THREE_ENGINE;

    const ambient = new THREE.HemisphereLight(
      0xffe8f0,
      0x49664b,
      1.65
    );
    state.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff0d4, 2.1);
    sun.position.set(-12, 22, 8);
    state.scene.add(sun);

    sun.castShadow = state.settings.quality !== "low";

    if (sun.castShadow) {
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -30;
      sun.shadow.camera.right = 30;
      sun.shadow.camera.top = 30;
      sun.shadow.camera.bottom = -30;
    }

    const fill = new THREE.PointLight(0xffa6c6, 0.65, 28);
    fill.position.set(5, 5, -5);
    state.scene.add(fill);
  }

  /* ==========================================================
     8. MONDE 3D PROCÉDURAL
  ========================================================== */

  function makeMaterial(color, roughness = 0.85) {
    return new THREE_ENGINE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0.02
    });
  }

  function addMesh(geometry, material, x, y, z, options = {}) {
    const mesh = new THREE_ENGINE.Mesh(geometry, material);

    mesh.position.set(x, y, z);

    if (options.scale) {
      mesh.scale.set(
        options.scale.x ?? 1,
        options.scale.y ?? 1,
        options.scale.z ?? 1
      );
    }

    if (options.rotation) {
      mesh.rotation.set(
        options.rotation.x ?? 0,
        options.rotation.y ?? 0,
        options.rotation.z ?? 0
      );
    }

    mesh.castShadow = state.settings.quality !== "low";
    mesh.receiveShadow = true;

    state.scene.add(mesh);
    state.worldObjects.push(mesh);

    return mesh;
  }

  function createWorld() {
    const THREE = THREE_ENGINE;

    const grass = makeMaterial(0x4c9a62);
    const pathMaterial = makeMaterial(0xd9c39c);
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x6bc6e6,
      roughness: 0.24,
      metalness: 0.1
    });

    addMesh(
      new THREE.PlaneGeometry(180, 180),
      grass,
      0, -0.08, 0,
      { rotation: { x: -Math.PI / 2 } }
    );

    addMesh(
      new THREE.PlaneGeometry(5, 100),
      pathMaterial,
      0, 0.005, 0,
      { rotation: { x: -Math.PI / 2 } }
    );

    addMesh(
      new THREE.PlaneGeometry(46, 4),
      pathMaterial,
      0, 0.008, -8,
      { rotation: { x: -Math.PI / 2 } }
    );

    addMesh(
      new THREE.CircleGeometry(9, 48),
      makeMaterial(0xead7b4),
      0, 0.014, -8,
      { rotation: { x: -Math.PI / 2 } }
    );

    addMesh(
      new THREE.CircleGeometry(4.4, 40),
      waterMaterial,
      10, 0.02, -18,
      { rotation: { x: -Math.PI / 2 } }
    );

    // Bordure du petit lac.
    const lakeRing = new THREE.Mesh(
      new THREE.RingGeometry(4.3, 4.7, 48),
      makeMaterial(0x8eaf8d)
    );
    lakeRing.rotation.x = -Math.PI / 2;
    lakeRing.position.set(10, 0.025, -18);
    state.scene.add(lakeRing);

    // Collines décoratives éloignées.
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const radius = 42 + (i % 3) * 3;
      const hill = addMesh(
        new THREE.SphereGeometry(1, 14, 10),
        makeMaterial(i % 2 ? 0x76ad7c : 0x689c73),
        Math.cos(angle) * radius,
        -1.5,
        Math.sin(angle) * radius,
        {
          scale: {
            x: 9 + (i % 4),
            y: 4 + (i % 3),
            z: 8 + (i % 2)
          }
        }
      );
      hill.castShadow = false;
    }

    // Bâtiments stylisés dans le lointain.
    const buildingColors = [0xf2c9c9, 0xe8d4ae, 0xc5d9e9, 0xf4e4c4];

    for (let i = 0; i < 10; i++) {
      const x = (i % 5) * 10 - 22;
      const z = -31 - Math.floor(i / 5) * 7;
      const height = 4 + (i % 3) * 1.5;

      addMesh(
        new THREE.BoxGeometry(5, height, 4),
        makeMaterial(buildingColors[i % buildingColors.length]),
        x, height / 2, z
      );

      addMesh(
        new THREE.ConeGeometry(3.8, 2.4, 4),
        makeMaterial(0x8e6c83),
        x, height + 1.1, z,
        { rotation: { y: Math.PI / 4 } }
      );
    }

    // Éclairage de la fontaine.
    const fountainBase = addMesh(
      new THREE.CylinderGeometry(2.1, 2.4, 0.4, 32),
      makeMaterial(0xe6e0d8),
      -7, 0.2, -8
    );

    const fountainWater = addMesh(
      new THREE.CylinderGeometry(1.75, 1.8, 0.1, 32),
      waterMaterial,
      -7, 0.44, -8
    );

    addMesh(
      new THREE.CylinderGeometry(0.32, 0.5, 1.5, 20),
      makeMaterial(0xe8e3dc),
      -7, 1.15, -8
    );

    addMesh(
      new THREE.SphereGeometry(0.45, 18, 14),
      makeMaterial(0x9bdff4),
      -7, 2, -8
    );

    fountainBase.receiveShadow = true;
    fountainWater.receiveShadow = true;

    // Repères visuels des lieux.
    const landmarkData = [
      { x: 0, z: -16, color: 0xffb6d1 },
      { x: 10, z: -18, color: 0xffd88b },
      { x: -7, z: -8, color: 0xffffff },
      { x: 7, z: 4, color: 0xffc8dc }
    ];

    landmarkData.forEach((item) => {
      addMesh(
        new THREE.SphereGeometry(0.15, 12, 10),
        new THREE.MeshBasicMaterial({ color: item.color }),
        item.x, 3.5, item.z
      );
    });

    // Le sol principal n'est pas bloquant : les limites du monde
    // sont gérées par le contrôleur de déplacement.
  }

  function createTree(x, z, scale = 1) {
    const THREE = THREE_ENGINE;
    const trunkMaterial = makeMaterial(0x79543a);
    const leavesMaterial = makeMaterial(0x2f7950);

    addMesh(
      new THREE.CylinderGeometry(0.22 * scale, 0.36 * scale, 2.4 * scale, 10),
      trunkMaterial,
      x, 1.2 * scale, z
    );

    const crown = addMesh(
      new THREE.SphereGeometry(1.2 * scale, 14, 12),
      leavesMaterial,
      x, 2.9 * scale, z
    );

    crown.castShadow = state.settings.quality !== "low";
  }

  function createFlower(x, z, color) {
    const THREE = THREE_ENGINE;

    addMesh(
      new THREE.CylinderGeometry(0.035, 0.05, 0.55, 6),
      makeMaterial(0x378451),
      x, 0.27, z
    );

    addMesh(
      new THREE.SphereGeometry(0.15, 10, 8),
      makeMaterial(color),
      x, 0.57, z
    );
  }

  function createEnvironmentDetails() {
    // Arbres répartis autour des chemins.
    const treePositions = [
      [-7, 2], [7, 3], [-9, -4], [9, -5],
      [-11, -13], [14, -10], [-15, 1], [15, 5],
      [-14, -21], [17, -23], [-5, -26], [4, -28],
      [-20, -8], [21, -5], [-22, -18], [22, -19],
      [-5, 12], [6, 14], [-16, 13], [17, 15]
    ];

    treePositions.forEach((position, index) => {
      createTree(position[0], position[1], 0.8 + (index % 4) * 0.12);
    });

    // Fleurs décoratives le long des allées.
    for (let i = 0; i < 64; i++) {
      const x = ((i * 7) % 29) - 14;
      const z = ((i * 11) % 38) - 24;

      if (Math.abs(x) < 3 && z > -26 && z < 12) continue;

      const colors = [0xff8db4, 0xffe39c, 0xfff5f7, 0xc9a5ff];
      createFlower(x, z, colors[i % colors.length]);
    }

    // Bancs stylisés.
    const benchMaterial = makeMaterial(0x855b45);

    [-14, 14].forEach((x) => {
      const z = -8;

      addMesh(
        new THREE_ENGINE.BoxGeometry(2.3, 0.18, 0.65),
        benchMaterial,
        x, 0.7, z
      );

      addMesh(
        new THREE_ENGINE.BoxGeometry(2.3, 0.8, 0.16),
        benchMaterial,
        x, 1.1, z - 0.25
      );

      [-0.8, 0.8].forEach((offset) => {
        addMesh(
          new THREE_ENGINE.BoxGeometry(0.12, 0.7, 0.12),
          benchMaterial,
          x + offset, 0.35, z
        );
      });
    });

    // Lampadaires.
    for (let i = 0; i < 8; i++) {
      const x = i % 2 ? 4.1 : -4.1;
      const z = 7 - Math.floor(i / 2) * 10;

      addMesh(
        new THREE_ENGINE.CylinderGeometry(0.07, 0.1, 3.3, 8),
        makeMaterial(0x4d4c58),
        x, 1.65, z
      );

      addMesh(
        new THREE_ENGINE.SphereGeometry(0.22, 12, 10),
        new THREE_ENGINE.MeshBasicMaterial({ color: 0xffedbd }),
        x, 3.4, z
      );
    }
  }

  /* ==========================================================
     9. PERSONNAGES 3D
  ========================================================== */

  function createCharacterModel(options = {}) {
    const THREE = THREE_ENGINE;
    const group = new THREE.Group();

    const skin = makeMaterial(options.skin || 0xd69a77);
    const hair = makeMaterial(options.hair || 0x4a3029);
    const clothes = makeMaterial(options.clothes || 0x8c77b7);
    const trousers = makeMaterial(options.trousers || 0x34465c);
    const shoes = makeMaterial(0x342a2b);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0x241d24,
      roughness: 0.6
    });

    // Tête.
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.27, 20, 16),
      skin
    );
    head.position.y = 1.62;
    group.add(head);

    // Cheveux.
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.285, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.57),
      hair
    );
    hairCap.position.y = 1.72;
    group.add(hairCap);

    // Yeux stylisés.
    [-0.09, 0.09].forEach((x) => {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.027, 8, 8),
        eyeMaterial
      );
      eye.position.set(x, 1.65, 0.245);
      group.add(eye);
    });

    // Corps.
    const torso = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.25, 0.5, 5, 10),
      clothes
    );
    torso.position.y = 1.05;
    group.add(torso);

    // Bras.
    const armGeometry = new THREE.CapsuleGeometry(0.075, 0.42, 4, 8);

    [-1, 1].forEach((side) => {
      const arm = new THREE.Mesh(armGeometry, clothes);
      arm.position.set(side * 0.32, 1.08, 0);
      arm.rotation.z = side * -0.08;
      group.add(arm);
    });

    // Jambes.
    const legGeometry = new THREE.CapsuleGeometry(0.09, 0.42, 4, 8);

    [-1, 1].forEach((side) => {
      const leg = new THREE.Mesh(legGeometry, trousers);
      leg.position.set(side * 0.12, 0.43, 0);
      group.add(leg);

      const shoe = new THREE.Mesh(
        new THREE.BoxGeometry(0.17, 0.11, 0.27),
        shoes
      );
      shoe.position.set(side * 0.12, 0.12, 0.05);
      group.add(shoe);
    });

    // Accessoire visuel pour distinguer les personnages.
    const accessory = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 10, 8),
      makeMaterial(options.accent || 0xff8cb7)
    );
    accessory.position.set(0.23, 1.28, 0.2);
    group.add(accessory);

    group.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = state.settings.quality !== "low";
        object.receiveShadow = true;
      }
    });

    return group;
  }

  function createPlayer() {
    const playerGroup = new THREE_ENGINE.Group();

    const visual = createCharacterModel({
      skin: 0xc88e6b,
      hair: 0x2f2424,
      clothes: 0x436f9b,
      trousers: 0x273448,
      accent: 0xffd6e2
    });

    playerGroup.add(visual);
    playerGroup.position.set(0, 0, 2);

    state.scene.add(playerGroup);
    state.player = playerGroup;
    state.playerVisual = visual;

    // Anneau discret pour repérer le joueur.
    const ring = new THREE_ENGINE.Mesh(
      new THREE_ENGINE.RingGeometry(0.36, 0.44, 32),
      new THREE_ENGINE.MeshBasicMaterial({
        color: 0xffb7d3,
        transparent: true,
        opacity: 0.75,
        side: THREE_ENGINE.DoubleSide
      })
    );

    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.035;
    playerGroup.add(ring);
  }

  const NPC_DEFINITIONS = [
    {
      name: "Camille",
      role: "Amie du jardin",
      x: 3.5,
      z: -5,
      color: 0xe98caf,
      skin: 0xdba17f,
      hair: 0x5a302c,
      clothes: 0xb96791,
      accent: 0xffd4e4
    },
    {
      name: "Gabriel",
      role: "Ami du parc",
      x: -3.7,
      z: -12,
      color: 0x8ab9ed,
      skin: 0xc58b6b,
      hair: 0x322720,
      clothes: 0x507da9,
      accent: 0xffdca1
    },
    {
      name: "Sofia",
      role: "Amie des fleurs",
      x: 12,
      z: -5,
      color: 0xd2a1ff,
      skin: 0x9d6249,
      hair: 0x241d20,
      clothes: 0x9774c9,
      accent: 0xffe3a6
    },
    {
      name: "Nathan",
      role: "Ami du belvédère",
      x: -12,
      z: -18,
      color: 0xffc58c,
      skin: 0xe0ad88,
      hair: 0x70442b,
      clothes: 0xd59a61,
      accent: 0xffe8c5
    },
    {
      name: "Léa",
      role: "Amie de la place",
      x: 6,
      z: 7,
      color: 0x9ad9c2,
      skin: 0xe2b397,
      hair: 0x523a30,
      clothes: 0x559f88,
      accent: 0xfff1d0
    }
  ];

  function createNPCs() {
    NPC_DEFINITIONS.forEach((definition, index) => {
      const group = createCharacterModel({
        skin: definition.skin,
        hair: definition.hair,
        clothes: definition.clothes,
        accent: definition.accent
      });

      group.position.set(definition.x, 0, definition.z);
      group.userData = {
        ...definition,
        index,
        isNPC: true,
        initialX: definition.x,
        initialZ: definition.z,
        phase: index * 1.3,
        talkCount: 0
      };

      state.scene.add(group);
      state.npcObjects.push(group);

      // Marqueur lumineux au-dessus du personnage.
      const marker = new THREE_ENGINE.Mesh(
        new THREE_ENGINE.SphereGeometry(0.11, 12, 10),
        new THREE_ENGINE.MeshBasicMaterial({ color: definition.color })
      );
      marker.position.set(0, 2.12, 0);
      group.add(marker);

      const ring = new THREE_ENGINE.Mesh(
        new THREE_ENGINE.RingGeometry(0.34, 0.4, 24),
        new THREE_ENGINE.MeshBasicMaterial({
          color: definition.color,
          transparent: true,
          opacity: 0.6,
          side: THREE_ENGINE.DoubleSide
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.025;
      group.add(ring);

      state.interactables.push(group);
    });
  }

  /* ==========================================================
     10. REDIMENSIONNEMENT ET CAMÉRA
  ========================================================== */

  function resizeRenderer() {
    if (!state.renderer || !state.camera) return;

    const canvas = $("loveGameCanvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width || window.innerWidth));
    const height = Math.max(1, Math.floor(rect.height || window.innerHeight));

    state.renderer.setSize(width, height, false);
    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();
  }

  function updateCamera(delta) {
    if (!state.player || !state.camera) return;

    const target = state.player.position;
    const pitch = clamp(state.cameraPitch, -0.05, 0.95);
    const distance = clamp(state.cameraDistance, 3.5, 16);

    state.cameraTargetDistance = clamp(state.cameraTargetDistance, 3.5, 16);
    state.cameraDistance +=
      (state.cameraTargetDistance - state.cameraDistance) *
      Math.min(1, delta * 8);

    const horizontal = Math.cos(pitch) * distance;
    const vertical = Math.sin(pitch) * distance;

    const desiredPosition = new THREE_ENGINE.Vector3(
      target.x + Math.sin(state.cameraYaw) * horizontal,
      target.y + 2.4 + vertical,
      target.z + Math.cos(state.cameraYaw) * horizontal
    );

    state.camera.position.lerp(
      desiredPosition,
      Math.min(1, delta * 7)
    );

    state.camera.lookAt(
      target.x,
      target.y + 1.05,
      target.z
    );
  }

  /* ==========================================================
     11. CONTRÔLE DU JOUEUR
  ========================================================== */

  const keysDown = new Set();

  function handleKeyDown(event) {
    const key = event.key.toLowerCase();

    if ([
      "arrowup", "arrowdown", "arrowleft", "arrowright",
      " ", "w", "a", "s", "d"
    ].includes(key)) {
      event.preventDefault();
    }

    keysDown.add(key);

    if (key === "escape") {
      if (!$("dialoguePanel").classList.contains("hidden")) {
        closeDialogue();
      } else if (state.running && !state.paused) {
        pauseGame();
      } else if (state.paused) {
        resumeGame();
      }
    }

    if (key === "e" || key === "enter") {
      if (state.running && !state.paused) interact();
    }

    if (key === " ") {
      if (state.running && !state.paused) jump();
    }
  }

  function handleKeyUp(event) {
    keysDown.delete(event.key.toLowerCase());
  }

  function getKeyboardMovement() {
    let x = 0;
    let z = 0;

    if (keysDown.has("arrowleft") || keysDown.has("a")) x -= 1;
    if (keysDown.has("arrowright") || keysDown.has("d")) x += 1;
    if (keysDown.has("arrowup") || keysDown.has("w")) z -= 1;
    if (keysDown.has("arrowdown") || keysDown.has("s")) z += 1;

    return { x, z };
  }

  function updateMovement(delta) {
    if (!state.player || state.paused || !state.running) return;

    const keyboard = getKeyboardMovement();
    let x = keyboard.x + state.movementX;
    let z = keyboard.z + state.movementZ;

    const length = Math.sqrt(x * x + z * z);
    if (length > 1) {
      x /= length;
      z /= length;
    }

    state.playerMoving = length > 0.05;

    if (state.playerMoving) {
      const speed = state.playerSpeed * (state.runningHeld ? 1.75 : 1);

      // Déplacement relatif à l'orientation de la caméra.
      const forwardX = -Math.sin(state.cameraYaw);
      const forwardZ = -Math.cos(state.cameraYaw);
      const rightX = Math.cos(state.cameraYaw);
      const rightZ = -Math.sin(state.cameraYaw);

      const moveX = rightX * x + forwardX * (-z);
      const moveZ = rightZ * x + forwardZ * (-z);

      state.player.position.x += moveX * speed * delta;
      state.player.position.z += moveZ * speed * delta;

      state.player.position.x = clamp(state.player.position.x, -32, 32);
      state.player.position.z = clamp(state.player.position.z, -38, 20);

      state.player.rotation.y = Math.atan2(moveX, moveZ);

      // Animation simple de marche.
      if (state.playerVisual) {
        const swing = Math.sin(state.elapsed * (state.runningHeld ? 13 : 8)) * 0.045;
        state.playerVisual.rotation.z = swing;
        state.playerVisual.position.y = Math.abs(
          Math.sin(state.elapsed * (state.runningHeld ? 13 : 8))
        ) * 0.035;
      }

      scheduleAutoSave();
    } else if (state.playerVisual) {
      state.playerVisual.rotation.z *= 0.85;
      state.playerVisual.position.y *= 0.85;
    }

    // Saut simple.
    if (state.verticalPosition > 0 || state.jumpVelocity > 0) {
      state.jumpVelocity -= 12 * delta;
      state.verticalPosition += state.jumpVelocity * delta;

      if (state.verticalPosition <= 0) {
        state.verticalPosition = 0;
        state.jumpVelocity = 0;
      }

      if (state.playerVisual) {
        state.playerVisual.position.y = state.verticalPosition;
      }
    }
  }

  function jump() {
    if (!state.running || state.paused || state.verticalPosition > 0.05) return;

    state.jumpVelocity = 5.3;
    showNotification("Saut !");
  }

  function setupJoystick() {
    const base = $("joystickBase");
    const thumb = $("joystickThumb");
    const control = $("movementControl");

    if (!base || !thumb || !control) return;

    const resetJoystick = () => {
      state.movementX = 0;
      state.movementZ = 0;
      state.joystickPointer = null;
      thumb.style.transform = "translate(0, 0)";
    };

    const updateJoystick = (clientX, clientY) => {
      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radius = Math.max(20, rect.width * 0.32);

      let dx = clientX - centerX;
      let dy = clientY - centerY;

      const length = Math.sqrt(dx * dx + dy * dy);

      if (length > radius) {
        dx = (dx / length) * radius;
        dy = (dy / length) * radius;
      }

      state.movementX = dx / radius;
      state.movementZ = dy / radius;

      thumb.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    base.addEventListener("pointerdown", (event) => {
      if (!state.running || state.paused) return;

      event.preventDefault();
      state.joystickPointer = event.pointerId;
      base.setPointerCapture?.(event.pointerId);
      updateJoystick(event.clientX, event.clientY);
    });

    base.addEventListener("pointermove", (event) => {
      if (event.pointerId !== state.joystickPointer) return;
      event.preventDefault();
      updateJoystick(event.clientX, event.clientY);
    });

    ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) => {
      base.addEventListener(type, (event) => {
        if (
          state.joystickPointer !== null &&
          event.pointerId !== undefined &&
          event.pointerId !== state.joystickPointer
        ) return;

        resetJoystick();
      });
    });

    control.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  /* ==========================================================
     12. CAMÉRA TACTILE ET ZOOM À DEUX DOIGTS
  ========================================================== */

  function setupCameraTouchControls() {
    const canvas = $("loveGameCanvas");
    const world = $("gameWorld");

    if (!canvas || !world) return;

    let lastSingleTouch = null;
    let lastPinchDistance = 0;
    let lastPinchCenter = null;

    const getTouchDistance = (a, b) => {
      const dx = a.clientX - b.clientX;
      const dy = a.clientY - b.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getTouchCenter = (a, b) => ({
      x: (a.clientX + b.clientX) / 2,
      y: (a.clientY + b.clientY) / 2
    });

    canvas.style.touchAction = "none";

    canvas.addEventListener("pointerdown", (event) => {
      if (!state.running || state.paused) return;

      state.touchPointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY
      });

      if (state.touchPointers.size === 1) {
        lastSingleTouch = {
          x: event.clientX,
          y: event.clientY
        };
      } else if (state.touchPointers.size === 2) {
        const points = [...state.touchPointers.values()];
        lastPinchDistance = getTouchDistance(
          { clientX: points[0].x, clientY: points[0].y },
          { clientX: points[1].x, clientY: points[1].y }
        );
        lastPinchCenter = {
          x: (points[0].x + points[1].x) / 2,
          y: (points[0].y + points[1].y) / 2
        };
        lastSingleTouch = null;
      }

      canvas.setPointerCapture?.(event.pointerId);
    });

    canvas.addEventListener("pointermove", (event) => {
      if (!state.touchPointers.has(event.pointerId)) return;

      const previous = state.touchPointers.get(event.pointerId);
      state.touchPointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY
      });

      if (state.touchPointers.size >= 2) {
        const points = [...state.touchPointers.values()];

        const currentDistance = getTouchDistance(
          { clientX: points[0].x, clientY: points[0].y },
          { clientX: points[1].x, clientY: points[1].y }
        );

        if (lastPinchDistance > 0) {
          const difference = currentDistance - lastPinchDistance;

          state.cameraTargetDistance = clamp(
            state.cameraTargetDistance - difference * 0.025,
            3.5,
            16
          );
        }

        const center = {
          x: (points[0].x + points[1].x) / 2,
          y: (points[0].y + points[1].y) / 2
        };

        if (lastPinchCenter) {
          state.cameraYaw -=
            (center.x - lastPinchCenter.x) * 0.003 *
            state.settings.sensitivity;
        }

        lastPinchDistance = currentDistance;
        lastPinchCenter = center;
        return;
      }

      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;

      state.cameraYaw -= dx * 0.005 * state.settings.sensitivity;
      state.cameraPitch = clamp(
        state.cameraPitch + dy * 0.003 * state.settings.sensitivity,
        -0.05,
        0.85
      );

      lastSingleTouch = {
        x: event.clientX,
        y: event.clientY
      };
    });

    const releasePointer = (event) => {
      state.touchPointers.delete(event.pointerId);

      if (state.touchPointers.size < 2) {
        lastPinchDistance = 0;
        lastPinchCenter = null;
      }

      if (state.touchPointers.size === 1) {
        const remaining = [...state.touchPointers.values()][0];
        lastSingleTouch = { x: remaining.x, y: remaining.y };
      } else {
        lastSingleTouch = null;
      }
    };

    ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) => {
      canvas.addEventListener(type, releasePointer);
    });

    // Zoom à la molette pour ordinateur.
    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();

      state.cameraTargetDistance = clamp(
        state.cameraTargetDistance + event.deltaY * 0.008,
        3.5,
        16
      );
    }, { passive: false });

    world.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  /* ==========================================================
     13. DÉTECTION DES PERSONNAGES PROCHES
  ========================================================== */

  function getNearestNPC(maxDistance = 3.2) {
    if (!state.player) return null;

    let nearest = null;
    let bestDistance = maxDistance;

    state.npcObjects.forEach((npc) => {
      const distance = distance2D(state.player.position, npc.position);

      if (distance < bestDistance) {
        nearest = npc;
        bestDistance = distance;
      }
    });

    return nearest;
  }

  function updateInteractionPrompt() {
    if (!state.running || state.paused || !state.player) {
      hideElement("interactionPrompt");
      return;
    }

    const npc = getNearestNPC();

    if (npc && $("dialoguePanel").classList.contains("hidden")) {
      state.activeNPC = npc;
      setText("interactionText", `Parler à ${npc.userData.name}`);
      setText("interactionIcon", "♡");
      showElement("interactionPrompt");
    } else {
      hideElement("interactionPrompt");
    }
  }

  /* ==========================================================
     14. DIALOGUES ET VOIX FRANÇAISES
  ========================================================== */

  function speakFrench(text) {
    if (!state.settings.voice) return;

    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setText("dialogueVoiceStatus", "Voix non disponible sur cet appareil");
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fr-FR";
      utterance.rate = 0.92;
      utterance.pitch = 1.04;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const frenchVoice = voices.find((voice) =>
        /^fr([-_]|$)/i.test(voice.lang)
      );

      if (frenchVoice) utterance.voice = frenchVoice;

      utterance.onstart = () => {
        setText("dialogueVoiceStatus", "Lecture vocale en français…");
      };

      utterance.onend = () => {
        setText("dialogueVoiceStatus", "Dialogue en français");
      };

      utterance.onerror = () => {
        setText("dialogueVoiceStatus", "Dialogue affiché à l'écran");
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn("[FOBAS] Synthèse vocale indisponible :", error);
    }
  }

  function getDialogueForNPC(npc) {
    const mission = missions[state.currentMission];
    const isTarget = mission && mission.character === npc.userData.name;

    if (isTarget) {
      return mission.dialogue;
    }

    const fallback = {
      Camille: [
        "Bonjour ! Quel plaisir de vous revoir.",
        "Prenons le temps de profiter de cette belle journée.",
        "Chaque rencontre nous donne l'occasion d'apprendre."
      ],
      Gabriel: [
        "Salut ! Comment se passe votre aventure ?",
        "Le parc est un endroit idéal pour discuter.",
        "J'espère que votre journée vous réserve de belles surprises."
      ],
      Sofia: [
        "Bonjour ! Avez-vous vu les fleurs près du lac ?",
        "J'aime découvrir de nouveaux endroits.",
        "N'hésitez pas à venir me parler quand vous voulez."
      ],
      Nathan: [
        "Bonjour ! La vue est magnifique d'ici.",
        "Les meilleures conversations arrivent parfois à l'improviste.",
        "Bonne continuation dans votre aventure."
      ],
      Léa: [
        "Coucou ! Vous explorez le parc ?",
        "Il y a beaucoup de choses à découvrir ici.",
        "Profitez bien de votre promenade."
      ]
    };

    return fallback[npc.userData.name] || [
      "Bonjour ! Heureux de vous rencontrer.",
      "Prenons le temps de faire connaissance."
    ];
  }

  function openDialogue(npc) {
    if (!npc || !npc.userData) return;

    state.activeNPC = npc;
    state.dialogueLines = getDialogueForNPC(npc);
    state.dialogueIndex = 0;

    const isMissionCharacter =
      missions[state.currentMission] &&
      missions[state.currentMission].character === npc.userData.name;

    setText("speakerName", npc.userData.name);
    setText("speakerAvatar", npc.userData.name.charAt(0).toUpperCase());
    setText("dialogueVoiceStatus", "Dialogue en français");

    const choices = $("dialogueChoices");
    if (choices) {
      choices.replaceChildren();

      const choiceButton = document.createElement("button");
      choiceButton.type = "button";
      choiceButton.className = "small-button";
      choiceButton.textContent = isMissionCharacter
        ? "Je vous écoute"
        : "Faire connaissance";

      choiceButton.addEventListener("click", () => {
        advanceDialogue();
      });

      choices.appendChild(choiceButton);
    }

    showElement("dialoguePanel");
    hideElement("interactionPrompt");
    renderDialogueLine();

    // Le personnage se tourne vers le joueur.
    const dx = state.player.position.x - npc.position.x;
    const dz = state.player.position.z - npc.position.z;
    npc.rotation.y = Math.atan2(dx, dz);
    npc.userData.talkCount += 1;
  }

  function renderDialogueLine() {
    const line = state.dialogueLines[state.dialogueIndex];
    if (!line) return;

    if (state.settings.subtitles) {
      setText("dialogueText", line);
      showElement("dialogueText");
    } else {
      setText("dialogueText", "");
    }

    setText("nextDialogueButton",
      state.dialogueIndex < state.dialogueLines.length - 1
        ? "Continuer →"
        : "Terminer la conversation");

    speakFrench(line);
  }

  function advanceDialogue() {
    if (!state.dialogueLines.length) {
      closeDialogue();
      return;
    }

    if (state.dialogueIndex < state.dialogueLines.length - 1) {
      state.dialogueIndex += 1;
      renderDialogueLine();
      return;
    }

    const npc = state.activeNPC;
    const mission = missions[state.currentMission];

    const completesCurrentMission =
      npc &&
      mission &&
      npc.userData.name === mission.character;

    closeDialogue();

    if (completesCurrentMission) {
      advanceObjective(1);
    } else {
      showNotification("Continuez à explorer pour découvrir la mission.");
    }
  }

  function closeDialogue() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    hideElement("dialoguePanel");
    state.dialogueLines = [];
    state.dialogueIndex = 0;
    updateInteractionPrompt();
  }

  function repeatDialogue() {
    const line = state.dialogueLines[state.dialogueIndex];
    if (line) speakFrench(line);
  }

  function interact() {
    if (!state.running || state.paused) return;

    const npc = state.activeNPC || getNearestNPC();

    if (!npc) {
      showNotification("Approchez-vous d'un personnage pour interagir.");
      return;
    }

    if (distance2D(state.player.position, npc.position) > 3.5) {
      showNotification("Rapprochez-vous du personnage.");
      return;
    }

    openDialogue(npc);
  }

  /* ==========================================================
     15. OBJECTIFS ET PROGRESSION
  ========================================================== */

  function getCurrentMission() {
    return missions[state.currentMission] || null;
  }

  function renderCurrentMission() {
    const mission = getCurrentMission();

    if (!mission) {
      showEnding();
      return;
    }

    state.objectiveTarget = Math.max(1, Number(mission.target) || 1);
    state.objectiveProgress = clamp(
      state.objectiveProgress,
      0,
      state.objectiveTarget
    );

    setText(
      "missionNumber",
      `MISSION ${String(state.currentMission + 1).padStart(2, "0")} / ${missions.length}`
    );

    setText("missionTitle", mission.title);
    setText("objectiveText", mission.objective);

    updateObjectiveProgress();
  }

  function updateObjectiveProgress() {
    const target = Math.max(1, state.objectiveTarget);
    const progress = clamp(state.objectiveProgress, 0, target);
    const percent = (progress / target) * 100;

    setProgress("objectiveProgressBar", percent);
    setText("objectiveProgressText", `${progress} / ${target}`);
  }

  function advanceObjective(amount = 1) {
    if (state.gameOver || state.paused) return;

    const mission = getCurrentMission();
    if (!mission) return;

    state.objectiveProgress = clamp(
      state.objectiveProgress + amount,
      0,
      state.objectiveTarget
    );

    updateObjectiveProgress();

    if (state.objectiveProgress >= state.objectiveTarget) {
      completeMission();
    } else {
      showNotification(
        `Objectif avancé : ${state.objectiveProgress}/${state.objectiveTarget}`
      );
      scheduleAutoSave();
    }
  }

  function completeMission() {
    const mission = getCurrentMission();
    if (!mission) return;

    if (!state.completedMissions.includes(mission.id)) {
      state.completedMissions.push(mission.id);
    }

    const nextIndex = state.currentMission + 1;

    if (nextIndex < missions.length &&
        !state.unlockedMissions.includes(nextIndex)) {
      state.unlockedMissions.push(nextIndex);
    }

    saveGame(false);

    setText("completionTitle", `Mission ${mission.number} accomplie !`);
    setText(
      "completionMessage",
      `${mission.reward || "Bravo !"} ${mission.description || ""}`
    );
    setText(
      "completionProgress",
      `${state.completedMissions.length} / ${missions.length}`
    );

    showOnlyScreen("missionCompleteScreen");
    state.running = false;
    state.paused = false;

    hideElement("dialoguePanel");
    hideElement("interactionPrompt");

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    renderMissionsList();
    updateContinueButton();
  }

  function goToNextMission() {
    const nextIndex = state.currentMission + 1;

    if (nextIndex >= missions.length) {
      showEnding();
      return;
    }

    state.currentMission = nextIndex;
    state.objectiveProgress = 0;

    if (!state.unlockedMissions.includes(nextIndex)) {
      state.unlockedMissions.push(nextIndex);
    }

    state.gameStarted = true;
    state.gameOver = false;

    renderCurrentMission();
    saveGame(false);

    hideElement("missionCompleteScreen");
    showOnlyScreen("gameScreen");

    state.running = true;
    state.paused = false;

    setText("worldLoadingText", "Chargement du prochain chapitre…");
    showElement("worldLoadingOverlay");

    setTimeout(() => {
      hideElement("worldLoadingOverlay");
      showNotification(`Nouvelle mission : ${getCurrentMission().title}`, 3500);
    }, 450);

    updateContinueButton();
  }

  function showEnding() {
    state.gameOver = true;
    state.running = false;
    state.paused = false;

    saveGame(false);
    showOnlyScreen("endingScreen");

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function restartAdventure() {
    state.currentMission = 0;
    state.objectiveProgress = 0;
    state.completedMissions = [];
    state.unlockedMissions = [0];
    state.gameStarted = true;
    state.gameOver = false;

    if (state.player) {
      state.player.position.set(0, 0, 2);
    }

    renderCurrentMission();
    saveGame(false);
    startGame();
  }

  /* ==========================================================
     16. LISTE DES MISSIONS
  ========================================================== */

  function renderMissionsList() {
    const list = $("missionsList");
    if (!list) return;

    list.replaceChildren();

    missions.forEach((mission, index) => {
      const completed = state.completedMissions.includes(index);
      const unlocked = state.unlockedMissions.includes(index);
      const current = index === state.currentMission;

      const item = document.createElement("article");
      item.className = "mission-list-item";
      item.style.padding = "12px";
      item.style.marginBottom = "8px";
      item.style.borderRadius = "12px";
      item.style.border = current
        ? "1px solid rgba(255,150,195,.85)"
        : "1px solid rgba(160,140,175,.25)";
      item.style.background = current
        ? "rgba(255,170,205,.12)"
        : "rgba(255,255,255,.035)";

      const title = document.createElement("h3");
      title.textContent =
        `${String(index + 1).padStart(2, "0")}. ${mission.title}`;
      title.style.margin = "0 0 5px";
      title.style.fontSize = "1rem";

      const description = document.createElement("p");
      description.textContent = mission.description || mission.objective;
      description.style.margin = "0 0 8px";
      description.style.fontSize = ".9rem";

      const status = document.createElement("p");
      status.style.margin = "0 0 8px";
      status.style.fontSize = ".8rem";
      status.textContent = completed
        ? "✓ Mission terminée"
        : current
          ? "● Mission actuelle"
          : unlocked
            ? "Mission disponible"
            : "🔒 Mission verrouillée";

      const button = document.createElement("button");
      button.type = "button";
      button.className = unlocked
        ? "secondary-button"
        : "text-button";
      button.textContent = completed
        ? "Rejouer cette mission"
        : current
          ? "Reprendre cette mission"
          : unlocked
            ? "Commencer"
            : "Verrouillée";
      button.disabled = !unlocked;

      button.addEventListener("click", () => {
        if (!unlocked) return;

        state.currentMission = index;
        state.objectiveProgress = 0;
        state.gameStarted = true;

        renderCurrentMission();
        saveGame(false);
        showOnlyScreen("gameScreen");
        state.running = true;
        state.paused = false;

        showNotification(`Mission sélectionnée : ${mission.title}`);
      });

      item.append(title, description, status, button);
      list.appendChild(item);
    });

    const completedCount = state.completedMissions.length;

    setText(
      "missionsSummary",
      `${completedCount} mission${completedCount > 1 ? "s" : ""} terminée${completedCount > 1 ? "s" : ""} sur ${missions.length}`
    );

    setProgress(
      "overallProgressBar",
      (completedCount / Math.max(1, missions.length)) * 100
    );
  }

  function openMissions() {
    renderMissionsList();
    showOnlyScreen("missionsScreen");
    state.running = false;
  }

  function closeMissions() {
    hideElement("missionsScreen");

    if (state.gameStarted && !state.paused) {
      showOnlyScreen("gameScreen");
      state.running = true;
    } else if (state.paused) {
      showOnlyScreen("pauseScreen");
    } else {
      showOnlyScreen("mainMenu");
    }
  }

  /* ==========================================================
     17. PAUSE ET REPRISE
  ========================================================== */

  function pauseGame() {
    if (!state.gameStarted || state.gameOver) return;

    state.paused = true;
    state.running = false;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    showOnlyScreen("pauseScreen");
  }

  function resumeGame() {
    if (state.gameOver) return;

    state.paused = false;
    state.running = true;

    showOnlyScreen("gameScreen");
    hideElement("worldLoadingOverlay");
    updateInteractionPrompt();
  }

  function returnToMainMenu() {
    saveGame(false);
    state.running = false;
    state.paused = false;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    hideElement("dialoguePanel");
    hideElement("interactionPrompt");
    showOnlyScreen("mainMenu");
    updateContinueButton();
  }

  /* ==========================================================
     18. CONFIRMATIONS
  ========================================================== */

  function requestConfirmation(title, message, callback) {
    state.pendingConfirmation = callback;

    setText("confirmationTitle", title);
    setText("confirmationMessage", message);

    showElement("confirmationScreen");
  }

  function resolveConfirmation(accepted) {
    hideElement("confirmationScreen");

    const callback = state.pendingConfirmation;
    state.pendingConfirmation = null;

    if (accepted && typeof callback === "function") {
      callback();
    } else if (state.gameStarted && !state.paused) {
      showOnlyScreen("gameScreen");
    } else {
      showOnlyScreen("mainMenu");
    }
  }

  /* ==========================================================
     19. PARAMÈTRES
  ========================================================== */

  function applySettingsToControls() {
    if ($("voiceEnabled")) {
      $("voiceEnabled").checked = !!state.settings.voice;
    }

    if ($("musicEnabled")) {
      $("musicEnabled").checked = !!state.settings.music;
    }

    if ($("subtitlesEnabled")) {
      $("subtitlesEnabled").checked = !!state.settings.subtitles;
    }

    if ($("qualitySelect")) {
      $("qualitySelect").value = state.settings.quality;
    }

    if ($("sensitivityRange")) {
      $("sensitivityRange").value = state.settings.sensitivity;
    }
  }

  function readSettingsFromControls() {
    state.settings.voice = $("voiceEnabled").checked;
    state.settings.music = $("musicEnabled").checked;
    state.settings.subtitles = $("subtitlesEnabled").checked;
    state.settings.quality = $("qualitySelect").value;
    state.settings.sensitivity = Number($("sensitivityRange").value) || 1;
  }

  function openSettings() {
    applySettingsToControls();
    showOnlyScreen("settingsScreen");
    state.running = false;
  }

  function saveSettings() {
    readSettingsFromControls();

    writeJSON(SETTINGS_KEY, state.settings);

    if (state.renderer) {
      const pixelRatio = state.settings.quality === "high"
        ? Math.min(window.devicePixelRatio || 1, 2)
        : state.settings.quality === "low"
          ? 1
          : Math.min(window.devicePixelRatio || 1, 1.35);

      state.renderer.setPixelRatio(pixelRatio);

      state.scene.traverse((object) => {
        if (object.isLight && object.isDirectionalLight) {
          object.castShadow = state.settings.quality !== "low";
        }
      });

      resizeRenderer();
    }

    showNotification("Paramètres enregistrés.");

    if (state.gameStarted && !state.paused) {
      showOnlyScreen("gameScreen");
      state.running = true;
    } else {
      showOnlyScreen("mainMenu");
    }
  }

  /* ==========================================================
     20. AMBIANCE SONORE

     Un son synthétique très discret est généré avec Web Audio.
     Aucun fichier musical externe n'est requis.
  ========================================================== */

  let audioContext = null;
  let ambientGain = null;
  let ambientOscillator = null;

  function startAmbientSound() {
    if (!state.settings.music) return;
    if (audioContext) return;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    try {
      audioContext = new AudioContextClass();

      ambientOscillator = audioContext.createOscillator();
      ambientGain = audioContext.createGain();

      ambientOscillator.type = "sine";
      ambientOscillator.frequency.value = 110;
      ambientGain.gain.value = 0.018;

      ambientOscillator.connect(ambientGain);
      ambientGain.connect(audioContext.destination);
      ambientOscillator.start();
    } catch (error) {
      console.warn("[FOBAS] Audio indisponible :", error);
    }
  }

  function stopAmbientSound() {
    if (ambientGain && audioContext) {
      try {
        ambientGain.gain.setTargetAtTime(
          0,
          audioContext.currentTime,
          0.05
        );
      } catch (_) {}
    }

    if (ambientOscillator) {
      try {
        ambientOscillator.stop();
      } catch (_) {}
    }

    ambientOscillator = null;
    ambientGain = null;
    audioContext = null;
  }

  function updateAmbientSound() {
    if (state.settings.music) {
      if (!audioContext) startAmbientSound();
    } else if (audioContext) {
      stopAmbientSound();
    }
  }

  /* ==========================================================
     21. DÉMARRAGE ET CHARGEMENT
  ========================================================== */

  function setLoadingProgress(percent, message) {
    setProgress("loadingProgress", percent);
    setText("loadingPercent", `${Math.round(percent)} %`);

    if (message) {
      setText("loadingMessage", message);
    }
  }

  async function runLoadingSequence() {
    showElement("loadingScreen");
    hideElement("mainMenu");

    const steps = [
      [12, "Initialisation du moteur graphique…"],
      [28, "Création du monde 3D…"],
      [45, "Préparation des personnages…"],
      [64, "Chargement des missions…"],
      [82, "Connexion des contrôles…"],
      [100, "Votre aventure est prête."]
    ];

    for (const step of steps) {
      setLoadingProgress(step[0], step[1]);
      await new Promise((resolve) => setTimeout(resolve, 90));
    }

    hideElement("loadingScreen");
    showElement("mainMenu");
  }

  function startGame() {
    if (!state.worldReady) {
      showNotification("Le monde 3D est encore en préparation.");
      return;
    }

    state.gameStarted = true;
    state.gameOver = false;
    state.paused = false;
    state.running = true;

    if (state.completedMissions.length >= missions.length) {
      showEnding();
      return;
    }

    renderCurrentMission();
    showOnlyScreen("gameScreen");

    setText("worldLoadingText", "Préparation du monde 3D…");
    showElement("worldLoadingOverlay");

    setTimeout(() => {
      hideElement("worldLoadingOverlay");
      showNotification(
        `Bienvenue ! Mission ${state.currentMission + 1} : ${getCurrentMission().title}`,
        3500
      );
    }, 500);

    updateAmbientSound();
    saveGame(false);
  }

  function continueGame() {
    if (!state.gameStarted && state.completedMissions.length === 0) {
      showNotification("Aucune progression sauvegardée pour le moment.");
      return;
    }

    startGame();
  }

  /* ==========================================================
     22. BOUTONS : CHAQUE ACTION EST CONNECTÉE
  ========================================================== */

  function bindButton(id, callback) {
    const element = $(id);

    if (!element) {
      console.warn(`[FOBAS] Bouton absent : ${id}`);
      return;
    }

    element.addEventListener("click", (event) => {
      event.preventDefault();

      try {
        callback(event);
      } catch (error) {
        console.error(`[FOBAS] Erreur sur ${id}:`, error);
        showNotification("Une erreur est survenue. Réessayez.");
      }
    });
  }

  function setupActionButtons() {
    bindButton("newGameButton", () => {
      if (state.gameStarted || state.completedMissions.length > 0) {
        requestConfirmation(
          "Nouvelle aventure",
          "Recommencer effacera la progression actuelle. Voulez-vous continuer ?",
          restartAdventure
        );
      } else {
        restartAdventure();
      }
    });

    bindButton("continueGameButton", continueGame);
    bindButton("missionsMenuButton", openMissions);
    bindButton("openMissionsButton", openMissions);
    bindButton("pauseMissionsButton", openMissions);
    bindButton("closeMissionsButton", closeMissions);

    bindButton("settingsButton", openSettings);
    bindButton("closeSettingsButton", () => {
      if (state.gameStarted && !state.paused) {
        showOnlyScreen("gameScreen");
        state.running = true;
      } else {
        showOnlyScreen("mainMenu");
      }
    });
    bindButton("saveSettingsButton", saveSettings);

    bindButton("creditsButton", () => {
      showOnlyScreen("creditsScreen");
    });
    bindButton("closeCreditsButton", () => {
      showOnlyScreen("mainMenu");
    });

    bindButton("pauseButton", pauseGame);
    bindButton("resumeButton", resumeGame);
    bindButton("saveGameButton", () => saveGame(true));
    bindButton("returnToMenuButton", returnToMainMenu);

    bindButton("interactionPrompt", interact);
    bindButton("talkButton", interact);
    bindButton("closeDialogueButton", closeDialogue);
    bindButton("nextDialogueButton", advanceDialogue);
    bindButton("repeatDialogueButton", repeatDialogue);

    bindButton("nextMissionButton", goToNextMission);
    bindButton("completionMenuButton", returnToMainMenu);

    bindButton("restartGameButton", restartAdventure);
    bindButton("endingMenuButton", returnToMainMenu);

    bindButton("cancelConfirmationButton", () => {
      resolveConfirmation(false);
    });
    bindButton("acceptConfirmationButton", () => {
      resolveConfirmation(true);
    });

    bindButton("retryButton", () => {
      hideElement("errorScreen");

      if (!state.worldReady) {
        boot();
      } else {
        showOnlyScreen("mainMenu");
      }
    });

    bindButton("errorMenuButton", () => {
      hideElement("errorScreen");
      showOnlyScreen("mainMenu");
    });

    bindButton("jumpButton", jump);

    const runButton = $("runButton");
    if (runButton) {
      runButton.addEventListener("pointerdown", () => {
        state.runningHeld = true;
      });

      ["pointerup", "pointercancel", "lostpointercapture", "pointerleave"].forEach((type) => {
        runButton.addEventListener(type, () => {
          state.runningHeld = false;
        });
      });

      runButton.addEventListener("contextmenu", (event) => {
        event.preventDefault();
      });
    }
  }

  /* ==========================================================
     23. BOUCLE D'ANIMATION
  ========================================================== */

  function updateNPCs(delta) {
    state.npcObjects.forEach((npc) => {
      const data = npc.userData;

      // Petite animation de respiration.
      const breathing = Math.sin(state.elapsed * 1.7 + data.phase) * 0.012;
      npc.scale.y = 1 + breathing;

      // Mouvement naturel très léger pour les personnages secondaires.
      if (
        npc !== state.activeNPC &&
        $("dialoguePanel").classList.contains("hidden")
      ) {
        const sway = Math.sin(state.elapsed * 0.45 + data.phase) * 0.12;

        npc.position.x = data.initialX + sway;
        npc.position.z = data.initialZ;
      }
    });
  }

  function renderFrame(timestamp) {
    state.animationFrame = requestAnimationFrame(renderFrame);

    if (!state.renderer || !state.scene || !state.camera) return;

    const delta = state.clock
      ? Math.min(state.clock.getDelta(), 0.05)
      : 0.016;

    state.elapsed += delta;

    if (state.running && !state.paused) {
      updateMovement(delta);
      updateInteractionPrompt();
      updateNPCs(delta);
    }

    updateCamera(delta);
    state.renderer.render(state.scene, state.camera);
  }

  /* ==========================================================
     24. ACCESSIBILITÉ ET ÉVÉNEMENTS GLOBAUX
  ========================================================== */

  function setupGlobalEvents() {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    window.addEventListener("blur", () => {
      keysDown.clear();
      state.runningHeld = false;

      if (state.joystickPointer !== null) {
        state.movementX = 0;
        state.movementZ = 0;
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        saveGame(false);

        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      }
    });

    window.addEventListener("beforeunload", () => {
      saveGame(false);
    });

    // Laisse les gestes natifs possibles hors du canvas.
    const canvas = $("loveGameCanvas");
    if (canvas) {
      canvas.style.touchAction = "none";
    }

    // Contrôle du menu de profil au clavier.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        document.body.classList.add("keyboard-navigation");
      }
    });

    document.addEventListener("pointerdown", () => {
      document.body.classList.remove("keyboard-navigation");
    }, { passive: true });
  }

  /* ==========================================================
     25. INITIALISATION PRINCIPALE
  ========================================================== */

  async function boot() {
    if (state.initialized) {
      if (state.worldReady) {
        showOnlyScreen("mainMenu");
        return;
      }
    }

    state.loading = true;

    try {
      loadSavedState();
      createProfilePanel();
      setupActionButtons();
      setupJoystick();
      setupCameraTouchControls();
      setupGlobalEvents();

      await runLoadingSequence();

      if (!state.worldReady) {
        initializeThree();
      }

      renderCurrentMission();
      renderMissionsList();
      updateContinueButton();

      state.initialized = true;
      state.loading = false;

      if (!state.animationFrame) {
        state.animationFrame = requestAnimationFrame(renderFrame);
      }

      console.info(
        `[FOBAS] ${APP_VERSION} prêt : ${missions.length} missions disponibles.`
      );
    } catch (error) {
      state.loading = false;
      console.error("[FOBAS] Initialisation impossible :", error);

      showError(
        "Impossible de démarrer le jeu",
        error && error.message
          ? error.message
          : "Une erreur inconnue est survenue."
      );
    }
  }

  /* ==========================================================
     26. API PUBLIQUE POUR AJOUTER DES MISSIONS À CHAUD

     Exemple depuis la console du navigateur :

     FOBASAmour.addMission({
       title: "Une nouvelle rencontre",
       description: "Découvrez un nouveau chapitre.",
       objective: "Parlez à Sofia.",
       character: "Sofia",
       location: "Le jardin secret",
       target: 1,
       reward: "Nouvelle mission terminée.",
       dialogue: [
         "Bonjour ! Je suis ravie de vous voir.",
         "J'ai une histoire à vous raconter."
       ]
     });

     La nouvelle mission est ajoutée à la liste en mémoire.
     Pour conserver une extension personnalisée entre les
     sessions, enregistrer également sa définition dans votre
     fichier de données de missions ou dans un backend.
  ========================================================== */

  function addMission(mission) {
    if (!mission || typeof mission !== "object") {
      throw new TypeError("La mission doit être un objet valide.");
    }

    if (!mission.title || !mission.objective || !mission.character) {
      throw new Error(
        "Une mission doit posséder title, objective et character."
      );
    }

    const newMission = {
      title: String(mission.title),
      description: String(mission.description || ""),
      objective: String(mission.objective),
      character: String(mission.character),
      location: String(mission.location || "Le parc"),
      target: Math.max(1, Number(mission.target) || 1),
      reward: String(mission.reward || "Mission terminée !"),
      dialogue: Array.isArray(mission.dialogue) && mission.dialogue.length
        ? mission.dialogue.map(String)
        : ["Bonjour ! Heureux de vous rencontrer."],
      id: missions.length,
      number: missions.length + 1,
      extra: true
    };

    missions.push(newMission);

    if (state.unlockedMissions.length === 0) {
      state.unlockedMissions.push(0);
    }

    renderMissionsList();
    showNotification(`Mission ajoutée : ${newMission.title}`);

    return {
      id: newMission.id,
      number: newMission.number,
      title: newMission.title
    };
  }

  function getGameStatus() {
    return {
      version: APP_VERSION,
      running: state.running,
      paused: state.paused,
      currentMission: state.currentMission + 1,
      totalMissions: missions.length,
      completedMissions: state.completedMissions.length,
      unlockedMissions: [...state.unlockedMissions],
      profile: { ...state.profile }
    };
  }

  window.FOBASAmour = {
    addMission,
    getGameStatus,
    saveGame,
    openProfile,
    openMissions,
    pauseGame,
    resumeGame
  };

  /* ==========================================================
     27. DÉMARRAGE AUTOMATIQUE
  ========================================================== */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();

