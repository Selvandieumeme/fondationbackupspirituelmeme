
/* ============================================================
   FOBAS INTERACTIVE — SUR L'AMOUR EN ACTION
   Moteur principal JavaScript
   Babylon.js • Android Touch • Missions dynamiques
   IndexedDB • Dialogues français • Sauvegarde locale
   Version 1.0.0
============================================================ */
(function () {
  "use strict";

  /* ==========================================================
     1. CONFIGURATION ET SÉCURITÉ DE BASE
  ========================================================== */

  const VERSION = "1.0.0";
  const DB_NAME = "FOBAS_AMOUR_ACTION_DB";
  const DB_VERSION = 1;
  const SAVE_KEY = "love-adventure-save";
  const SETTINGS_KEY = "love-adventure-settings";
  const PROFILE_KEY = "love-adventure-profile";

  const $ = (id) => document.getElementById(id);

  const ui = {};
  const requiredIds = [
    "loadingScreen", "loadingMessage", "loadingProgress",
    "loadingPercent", "mainMenu", "gameScreen", "loveGameCanvas",
    "worldLoadingOverlay", "worldLoadingText", "missionNumber",
    "missionTitle", "objectiveText", "objectiveProgressBar",
    "objectiveProgressText", "interactionPrompt", "interactionText",
    "interactionIcon", "dialoguePanel", "speakerAvatar",
    "speakerName", "dialogueText", "dialogueChoices",
    "dialogueVoiceStatus", "closeDialogueButton",
    "repeatDialogueButton", "nextDialogueButton", "movementControl",
    "joystickBase", "joystickThumb", "runButton", "jumpButton",
    "talkButton", "gameNotification", "savingIndicator",
    "missionsScreen", "missionsList", "missionsSummary",
    "overallProgressBar", "pauseScreen", "settingsScreen",
    "creditsScreen", "missionCompleteScreen", "endingScreen",
    "confirmationScreen", "confirmationTitle",
    "confirmationMessage", "acceptConfirmationButton",
    "cancelConfirmationButton", "errorScreen", "errorTitle",
    "errorMessage", "saveStatus", "continueGameButton"
  ];

  requiredIds.forEach((id) => {
    ui[id] = $(id);
  });

  const missing = requiredIds.filter((id) => !ui[id]);

  if (missing.length) {
    console.error(
      "[FOBAS AMOUR] Éléments HTML manquants :",
      missing.join(", ")
    );
  }

  const app = $("loveGameApp") || document.body;
  const canvas = $("loveGameCanvas");

  if (!canvas || !window.BABYLON) {
    showFatalError(
      "Moteur 3D indisponible",
      "Babylon.js ou le canvas 3D est introuvable. Vérifiez la connexion Internet, les scripts HTML et réessayez."
    );
    return;
  }

  const BABYLON = window.BABYLON;

  const state = {
    screen: "loading",
    previousScreen: "menu",
    running: false,
    paused: false,
    gameStarted: false,
    missionIndex: 0,
    completedMissions: [],
    completedSteps: [],
    choices: {},
    flags: {},
    profile: {
      name: "Voyageur",
      createdAt: Date.now()
    },
    settings: {
      voice: true,
      music: true,
      subtitles: true,
      quality: "medium",
      sensitivity: 1
    },
    currentDialogue: null,
    confirmationAction: null,
    saving: false,
    saveTimer: null,
    lastNotification: "",
    lastNotificationAt: 0,
    frameTime: 0,
    jumpVelocity: 0,
    verticalVelocity: 0,
    isJumping: false,
    isRunning: false,
    joystick: {
      x: 0,
      y: 0,
      active: false,
      pointerId: null
    },
    camera: {
      dragging: false,
      pointerId: null,
      lastX: 0,
      lastY: 0,
      pinchDistance: 0
    },
    missionRuntime: null,
    activeTarget: null,
    db: null,
    engine: null,
    scene: null,
    camera3D: null,
    player: null,
    playerParts: [],
    npcs: [],
    collectibles: [],
    landmarks: [],
    decorations: [],
    ambientSound: null,
    animationFrame: 0,
    lastAutosave: 0,
    lastPlayerPosition: null
  };

  let initialized = false;
  let voiceUtterance = null;
  let audioContext = null;
  let musicTimer = null;
  let musicStep = 0;

  const clamp = (v, min, max) =>
    Math.max(min, Math.min(max, v));

  const distanceXZ = (a, b) => {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  };

  const escapeHTML = (value) =>
    String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);

  function setVisible(element, visible) {
    if (!element) return;
    element.classList.toggle("hidden", !visible);
    element.setAttribute("aria-hidden", visible ? "false" : "true");
  }

  function setText(element, value) {
    if (element) element.textContent = String(value);
  }

  function safeNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function showFatalError(title, message) {
    const screen = $("errorScreen");
    if (screen) {
      screen.querySelectorAll(".screen").forEach((node) => {
        node.classList.add("hidden");
      });

      setText($("errorTitle"), title);
      setText($("errorMessage"), message);
      screen.classList.remove("hidden");
    } else {
      console.error("[FOBAS AMOUR]", title, message);
    }
  }

  window.addEventListener("error", (event) => {
    console.error("[FOBAS AMOUR] JavaScript :", event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("[FOBAS AMOUR] Promise :", event.reason);
  });

  /* ==========================================================
     2. LES 35 MISSIONS INITIALES
     Chaque mission possède son histoire, ses personnages,
     son lieu et son type d'activité.
  ========================================================== */

  const missionData = [
    {
      title: "Un regard inattendu",
      place: "Le jardin des premières rencontres",
      story: "Un regard échangé peut devenir le commencement d'une grande histoire. Explorez le jardin, rencontrez Camille et découvrez ce qui vous rapproche.",
      mode: "meeting",
      goal: "Rencontrer les personnes du jardin"
    },
    {
      title: "Le langage des fleurs",
      place: "Le jardin des roses",
      story: "Camille vous invite à découvrir le langage des fleurs. Écoutez ses amis, cherchez les fleurs lumineuses et choisissez un bouquet qui exprime vos sentiments.",
      mode: "flowers",
      goal: "Découvrir les fleurs et leur signification"
    },
    {
      title: "Une promesse au soleil couchant",
      place: "La plage dorée",
      story: "Au bord de l'eau, les paroles prennent un sens différent. Retrouvez vos compagnons, découvrez leurs souvenirs et formulez une promesse sincère.",
      mode: "sunset",
      goal: "Partager un moment au coucher du soleil"
    },
    {
      title: "Un geste qui compte",
      place: "La place des rencontres",
      story: "Un petit geste peut illuminer une journée. Des habitants ont besoin de votre aide. Écoutez-les, retrouvez les objets utiles et offrez votre soutien.",
      mode: "kindness",
      goal: "Accomplir des gestes de gentillesse"
    },
    {
      title: "Les secrets du vieux pont",
      place: "Le pont des souvenirs",
      story: "Un vieux pont cache plusieurs messages. Explorez ses alentours, parlez aux témoins et reconstituez le souvenir oublié.",
      mode: "mystery",
      goal: "Résoudre le mystère du pont"
    },
    {
      title: "Une promenade à deux",
      place: "Le sentier des lanternes",
      story: "Une promenade tranquille vous rapproche de Camille. Découvrez le sentier, rencontrez de nouveaux amis et apprenez à écouter sans juger.",
      mode: "walk",
      goal: "Explorer le sentier et ses rencontres"
    },
    {
      title: "La musique de nos cœurs",
      place: "Le kiosque musical",
      story: "Les musiciens préparent une soirée spéciale. Retrouvez les artistes, découvrez leurs histoires et participez à la préparation du concert.",
      mode: "music",
      goal: "Préparer le concert romantique"
    },
    {
      title: "Le café des confidences",
      place: "Le café des amoureux",
      story: "Autour d'une tasse chaude, chacun a une histoire à raconter. Respectez les confidences, posez les bonnes questions et découvrez ce que signifie la confiance.",
      mode: "cafe",
      goal: "Écouter les confidences des amis"
    },
    {
      title: "La lettre mystérieuse",
      place: "La bibliothèque ancienne",
      story: "Une lettre sans signature arrive à la bibliothèque. Cherchez les indices, consultez les témoins et découvrez son destinataire.",
      mode: "letter",
      goal: "Retrouver l'origine de la lettre"
    },
    {
      title: "Le bal des lumières",
      place: "La salle des lumières",
      story: "Le grand bal approche. Aidez les organisateurs, découvrez les préférences des invités et préparez une soirée où chacun se sent accueilli.",
      mode: "ball",
      goal: "Préparer le bal et accueillir les invités"
    },
    {
      title: "Le jardin des souvenirs",
      place: "Le jardin des souvenirs",
      story: "Chaque fleur rappelle un moment important. Rencontrez les jardiniers, restaurez les parterres et écoutez les histoires qu'ils souhaitent partager.",
      mode: "garden",
      goal: "Restaurer le jardin des souvenirs"
    },
    {
      title: "La fête des amis",
      place: "La grande place",
      story: "Une fête rassemble des personnes très différentes. Coordonnez les préparatifs, aidez les invités et apprenez à faire une place à chacun.",
      mode: "festival",
      goal: "Réussir la préparation de la fête"
    },
    {
      title: "Un cadeau inattendu",
      place: "L'atelier des artisans",
      story: "Vous souhaitez préparer un cadeau significatif. Écoutez les artisans, réunissez les éléments nécessaires et personnalisez votre création.",
      mode: "gift",
      goal: "Créer un cadeau personnalisé"
    },
    {
      title: "La vérité dans les yeux",
      place: "Le belvédère",
      story: "Un malentendu menace une belle amitié. Recueillez les témoignages, confrontez les faits avec calme et choisissez une réponse honnête.",
      mode: "truth",
      goal: "Clarifier le malentendu"
    },
    {
      title: "Le voyage des papillons",
      place: "La vallée fleurie",
      story: "Des papillons colorés traversent la vallée. Explorez leur habitat, découvrez les personnes qui le protègent et participez à une mission de préservation.",
      mode: "nature",
      goal: "Découvrir et protéger la vallée"
    },
    {
      title: "Le pont de la réconciliation",
      place: "Le pont des retrouvailles",
      story: "Deux amis ne se parlent plus depuis longtemps. Écoutez les deux versions de leur histoire, identifiez les blessures et aidez-les à renouer le dialogue.",
      mode: "reconcile",
      goal: "Favoriser une réconciliation sincère"
    },
    {
      title: "La maison aux fenêtres bleues",
      place: "Le quartier des maisons bleues",
      story: "Une famille prépare une rencontre importante. Découvrez ses traditions, rencontrez les voisins et contribuez à rendre l'accueil chaleureux.",
      mode: "family",
      goal: "Préparer une rencontre familiale"
    },
    {
      title: "Le défi de la confiance",
      place: "Le parcours de confiance",
      story: "La confiance se construit par des actions cohérentes. Suivez un parcours, écoutez les engagements de vos amis et montrez que vos paroles correspondent à vos actes.",
      mode: "trust",
      goal: "Réussir les étapes de confiance"
    },
    {
      title: "Le marché des mille couleurs",
      place: "Le marché fleuri",
      story: "Un marché animé réunit artisans, musiciens et visiteurs. Découvrez leurs besoins, réalisez des échanges amicaux et préparez une surprise collective.",
      mode: "market",
      goal: "Participer aux activités du marché"
    },
    {
      title: "Les étoiles de minuit",
      place: "L'observatoire romantique",
      story: "Le ciel est magnifique ce soir. Rejoignez les observateurs, apprenez leurs histoires et découvrez ce que chacun espère pour l'avenir.",
      mode: "stars",
      goal: "Observer le ciel avec vos compagnons"
    },
    {
      title: "Une journée de solidarité",
      place: "Le centre communautaire",
      story: "Le quartier organise une journée d'entraide. Répartissez les tâches, rencontrez les bénévoles et apportez une aide concrète aux habitants.",
      mode: "solidarity",
      goal: "Compléter les activités de solidarité"
    },
    {
      title: "Le secret de la vieille horloge",
      place: "La tour de l'horloge",
      story: "Une horloge ancienne s'est arrêtée au moment d'un événement mémorable. Examinez les indices, écoutez les anciens et reconstituez son histoire.",
      mode: "clock",
      goal: "Découvrir l'histoire de l'horloge"
    },
    {
      title: "Le retour du voyageur",
      place: "La gare des retrouvailles",
      story: "Un ami revient après une longue absence. Préparez son accueil, retrouvez ses proches et partagez des souvenirs qui lui sont chers.",
      mode: "return",
      goal: "Organiser des retrouvailles mémorables"
    },
    {
      title: "La cuisine des émotions",
      place: "La cuisine du village",
      story: "Une préparation collective rassemble les amis. Découvrez les préférences de chacun, réunissez les ingrédients et réalisez un repas de partage.",
      mode: "cooking",
      goal: "Préparer le repas collectif"
    },
    {
      title: "Le théâtre des sentiments",
      place: "Le théâtre du parc",
      story: "Une troupe prépare une pièce sur les relations humaines. Aidez les acteurs, découvrez les scènes et participez à la représentation.",
      mode: "theatre",
      goal: "Préparer la représentation"
    },
    {
      title: "La rivière des confidences",
      place: "La rivière paisible",
      story: "Au bord de la rivière, les amis parlent de leurs espoirs et de leurs inquiétudes. Prenez le temps de les écouter et d'offrir des paroles réconfortantes.",
      mode: "river",
      goal: "Partager des moments de confiance"
    },
    {
      title: "Le festival des talents",
      place: "L'esplanade des talents",
      story: "Chacun possède un talent particulier. Découvrez les artistes, aidez-les à se préparer et contribuez à un spectacle collectif.",
      mode: "talents",
      goal: "Réunir les talents du groupe"
    },
    {
      title: "La maison des promesses",
      place: "La maison des promesses",
      story: "Une rencontre invite chacun à réfléchir à ses engagements. Discutez des attentes, reconnaissez les limites de chacun et formulez des promesses réalistes.",
      mode: "promises",
      goal: "Construire des engagements sincères"
    },
    {
      title: "Le grand voyage du cœur",
      place: "La route des horizons",
      story: "Votre groupe entreprend une aventure collective. Explorez les étapes, retrouvez les compagnons dispersés et résolvez ensemble les défis du voyage.",
      mode: "journey",
      goal: "Réunir les compagnons du voyage"
    },
    {
      title: "Les retrouvailles au clair de lune",
      place: "La terrasse de lune",
      story: "Une soirée réunit toutes les personnes importantes de votre parcours. Retrouvez vos amis, revisitez les souvenirs et découvrez comment vos choix ont transformé leurs relations.",
      mode: "reunion",
      goal: "Retrouver les personnes importantes"
    },
    {
      title: "Le livre de nos histoires",
      place: "La bibliothèque du cœur",
      story: "Un livre rassemble les moments les plus précieux de votre aventure. Retrouvez les témoins, revisitez les souvenirs et choisissez les histoires à conserver.",
      mode: "book",
      goal: "Composer le livre des souvenirs"
    },
    {
      title: "Le jardin de demain",
      place: "Le jardin de l'avenir",
      story: "Votre groupe imagine un lieu où chacun pourra se sentir accepté. Consultez les habitants, recueillez leurs idées et préparez un projet commun.",
      mode: "future",
      goal: "Concevoir un projet collectif"
    },
    {
      title: "Le choix du cœur",
      place: "La place des décisions",
      story: "Plusieurs possibilités s'offrent à vous. Écoutez les personnes concernées, réfléchissez aux conséquences de chaque choix et décidez avec honnêteté.",
      mode: "choice",
      goal: "Prendre des décisions réfléchies"
    },
    {
      title: "La grande célébration",
      place: "Le jardin des célébrations",
      story: "Les amis se retrouvent pour célébrer le chemin parcouru. Préparez les lieux, remerciez les personnes qui vous ont aidé et partagez vos souvenirs préférés.",
      mode: "celebration",
      goal: "Préparer la grande célébration"
    },
    {
      title: "L'amour en action",
      place: "Le jardin de l'amour en action",
      story: "Votre aventure arrive à son grand chapitre final. Retrouvez les compagnons de votre histoire, accomplissez les dernières actions de solidarité et découvrez le message qui relie toutes vos rencontres : l'amour se révèle dans les actes.",
      mode: "finale",
      goal: "Achever les dernières actions et célébrer votre aventure"
    }
  ];

  const characterNames = [
    "Camille", "Alexandre", "Sofia", "Gabriel", "Élise",
    "Nathan", "Amélie", "Raphaël", "Chloé", "Thomas",
    "Juliette", "Louis", "Manon", "Antoine", "Léa",
    "Mathis", "Clara", "Noah", "Inès", "Samuel",
    "Zoé", "David", "Mélanie", "Daniel", "Sarah",
    "Lucas", "Anaïs", "Hugo", "Eva", "Benjamin",
    "Nina", "Maxime", "Alicia", "Jules", "Maya"
  ];

  const characterColors = [
    "#e9a0b9", "#78b9d7", "#d7a1ef", "#e5bd79",
    "#8bc5a0", "#ec947d", "#8d9de4", "#e3a4d4",
    "#b9cf82", "#d5a08d", "#7fcae3", "#c8a5f0"
  ];

  const characterPersonalities = [
    "sincère et attentionné",
    "optimiste et curieux",
    "calme et réfléchi",
    "créatif et chaleureux",
    "courageux et généreux",
    "rêveur et sensible",
    "drôle et spontané",
    "sage et bienveillant"
  ];

  const dialogueBank = [
    "Je suis heureux que tu sois venu. J'avais envie de partager ce moment avec quelqu'un qui sait écouter.",
    "Parfois, les plus belles histoires commencent par une simple conversation. Qu'en penses-tu ?",
    "Pour moi, aimer ne signifie pas tout savoir sur une personne. Cela signifie vouloir continuer à la découvrir.",
    "J'ai appris qu'une promesse n'a de valeur que lorsqu'on fait des efforts pour la tenir.",
    "Les souvenirs deviennent plus précieux lorsque nous prenons le temps de les partager.",
    "Tu sais, nous n'avons pas besoin d'être parfaits pour faire du bien autour de nous.",
    "J'apprécie les personnes qui expriment leurs sentiments avec respect, même lorsqu'elles sont hésitantes.",
    "Une bonne relation laisse de la place à la confiance, à la liberté et au dialogue.",
    "Quand quelque chose nous blesse, il vaut mieux en parler calmement que laisser le silence tout compliquer.",
    "Merci d'être présent. Ton attention me rappelle que les petits gestes comptent vraiment.",
    "J'aimerais savoir ce que tu considères comme le plus important dans une relation durable.",
    "On peut ne pas être d'accord et continuer à se respecter. C'est une belle force.",
    "Je crois que le courage consiste aussi à reconnaître ses erreurs et à demander pardon.",
    "Les moments ordinaires peuvent devenir extraordinaires quand on les partage avec sincérité.",
    "Je suis curieux de connaître ton avis. Prends ton temps, je t'écoute.",
    "Il y a plusieurs façons de montrer son affection : écouter, aider, respecter et encourager.",
    "Une rencontre peut changer notre regard sur les autres, même sans grands discours.",
    "Je voudrais que chacun puisse se sentir accueilli ici, sans pression et sans jugement.",
    "Quand on fait équipe, chacun apporte quelque chose d'unique.",
    "La confiance se construit petit à petit, grâce à des paroles claires et à des actes cohérents."
  ];

  const modeActions = {
    meeting: ["talk", "choice", "visit"],
    flowers: ["collect", "talk", "deliver"],
    sunset: ["visit", "talk", "choice"],
    kindness: ["help", "collect", "talk"],
    mystery: ["collect", "talk", "inspect"],
    walk: ["visit", "talk", "visit"],
    music: ["talk", "collect", "perform"],
    cafe: ["talk", "choice", "talk"],
    letter: ["collect", "inspect", "deliver"],
    ball: ["help", "talk", "perform"],
    garden: ["collect", "help", "visit"],
    festival: ["help", "talk", "perform"],
    gift: ["collect", "talk", "deliver"],
    truth: ["talk", "inspect", "choice"],
    nature: ["visit", "collect", "help"],
    reconcile: ["talk", "talk", "choice"],
    family: ["talk", "help", "talk"],
    trust: ["visit", "choice", "talk"],
    market: ["talk", "collect", "deliver"],
    stars: ["visit", "talk", "choice"],
    solidarity: ["help", "collect", "help"],
    clock: ["inspect", "collect", "talk"],
    return: ["visit", "talk", "choice"],
    cooking: ["collect", "help", "deliver"],
    theatre: ["talk", "perform", "perform"],
    river: ["visit", "talk", "choice"],
    talents: ["talk", "perform", "perform"],
    promises: ["talk", "choice", "talk"],
    journey: ["visit", "help", "visit"],
    reunion: ["talk", "talk", "choice"],
    book: ["collect", "inspect", "talk"],
    future: ["talk", "help", "choice"],
    choice: ["talk", "choice", "choice"],
    celebration: ["help", "talk", "perform"],
    finale: ["talk", "help", "choice", "visit"]
  };

  /* ==========================================================
     3. CRÉATION DU PLAN DE CHAQUE MISSION
     Le nombre d'étapes et de personnages augmente.
  ========================================================== */

  function buildMissionPlan(index) {
    const mission = missionData[index];
    if (!mission) return null;

    const number = index + 1;
    const characterCount = Math.min(
      2 + Math.floor((number - 1) / 3),
      10
    );

    const stageCount = Math.min(
      3 + Math.floor((number - 1) / 5),
      10
    );

    const actions = modeActions[mission.mode] || [
      "talk", "collect", "choice"
    ];

    const stages = [];

    for (let i = 0; i < stageCount; i++) {
      const action = actions[i % actions.length];
      const characterIndex = i % characterCount;

      const actionText = {
        talk: "Rencontrer et écouter un personnage",
        collect: "Trouver un objet spécial",
        visit: "Explorer le lieu indiqué",
        choice: "Prendre une décision",
        help: "Aider un personnage",
        inspect: "Examiner un indice",
        deliver: "Remettre un objet à un personnage",
        perform: "Participer à une activité"
      };

      stages.push({
        id: `m${number}-step${i + 1}`,
        action,
        characterIndex,
        label: actionText[action] || "Poursuivre l'aventure",
        done: false
      });
    }

    return {
      id: `mission-${number}`,
      number,
      title: mission.title,
      place: mission.place,
      story: mission.story,
      goal: mission.goal,
      mode: mission.mode,
      characterCount,
      stages
    };
  }

  function getCurrentMission() {
    return buildMissionPlan(state.missionIndex);
  }

  function getTotalMissionCount() {
    return missionData.length;
  }

  function registerMission(definition) {
    if (!definition || typeof definition !== "object") {
      throw new Error("La définition de la mission est invalide.");
    }

    if (!definition.title || !definition.story || !definition.mode) {
      throw new Error(
        "Une mission doit posséder un titre, une histoire et un mode."
      );
    }

    missionData.push({
      title: String(definition.title),
      place: String(definition.place || "Un nouveau lieu"),
      story: String(definition.story),
      goal: String(definition.goal || "Découvrir cette aventure"),
      mode: String(definition.mode)
    });

    refreshMissionList();
    updateMissionHeader();

    return missionData.length;
  }

  window.FOBASLoveGame = {
    version: VERSION,
    getMissions: () => missionData.map((mission, index) => ({
      ...mission,
      number: index + 1
    })),
    addMission: registerMission,
    save: saveGame,
    load: loadGame,
    getProfile: () => ({ ...state.profile }),
    getProgress: () => ({
      currentMission: state.missionIndex + 1,
      totalMissions: getTotalMissionCount(),
      completed: state.completedMissions.slice()
    })
  };

  /* ==========================================================
     4. NAVIGATION ENTRE LES ÉCRANS
  ========================================================== */

  const screenIds = [
    "loadingScreen",
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

  function showScreen(id) {
    screenIds.forEach((screenId) => {
      const element = $(screenId);
      if (element) {
        setVisible(element, screenId === id);
      }
    });

    state.screen = id;
  }

  function hideAllOverlays() {
    [
      "missionsScreen", "pauseScreen", "settingsScreen",
      "creditsScreen", "missionCompleteScreen",
      "endingScreen", "confirmationScreen", "errorScreen"
    ].forEach((id) => setVisible($(id), false));
  }

  function showGame() {
    showScreen("gameScreen");
    setVisible($("worldLoadingOverlay"), false);
    setVisible($("touchControls"), true);
    state.paused = false;
    state.running = true;

    if (state.scene) {
      state.scene.paused = false;
    }
  }

  function showMenu() {
    stopVoice();
    closeDialogue(false);
    state.running = false;
    state.paused = true;
    stopMusic();
    showScreen("mainMenu");
    updateContinueButton();
  }

  function showPause() {
    if (!state.gameStarted || state.screen !== "gameScreen") return;

    state.paused = true;
    state.running = false;
    stopVoice();
    showScreen("pauseScreen");
    saveGame();
  }

  function resumeGame() {
    if (!state.gameStarted) {
      startNewGame();
      return;
    }

    state.paused = false;
    state.running = true;
    showGame();
    startMusicIfEnabled();
  }

  /* ==========================================================
     5. INDEXEDDB — SAUVEGARDE LOCALE
  ========================================================== */

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB n'est pas disponible."));
        return;
      }

      let request;

      try {
        request = indexedDB.open(DB_NAME, DB_VERSION);
      } catch (error) {
        reject(error);
        return;
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains("saves")) {
          db.createObjectStore("saves", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("profiles")) {
          db.createObjectStore("profiles", { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        state.db = request.result;

        state.db.onversionchange = () => {
          state.db.close();
          state.db = null;
        };

        resolve(state.db);
      };

      request.onerror = () => reject(
        request.error || new Error("Ouverture IndexedDB impossible.")
      );

      request.onblocked = () => {
        console.warn("[FOBAS AMOUR] Ouverture IndexedDB bloquée.");
      };
    });
  }

  function dbPut(storeName, record) {
    return new Promise((resolve, reject) => {
      if (!state.db) {
        reject(new Error("Base de données indisponible."));
        return;
      }

      let transaction;

      try {
        transaction = state.db.transaction(storeName, "readwrite");
        transaction.objectStore(storeName).put(record);
      } catch (error) {
        reject(error);
        return;
      }

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(
        transaction.error || new Error("Écriture impossible.")
      );
      transaction.onabort = () => reject(
        transaction.error || new Error("Écriture annulée.")
      );
    });
  }

  function dbGet(storeName, id) {
    return new Promise((resolve, reject) => {
      if (!state.db) {
        reject(new Error("Base de données indisponible."));
        return;
      }

      let transaction;
      let request;

      try {
        transaction = state.db.transaction(storeName, "readonly");
        request = transaction.objectStore(storeName).get(id);
      } catch (error) {
        reject(error);
        return;
      }

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(
        request.error || new Error("Lecture impossible.")
      );
    });
  }

  function snapshotGame() {
    return {
      id: SAVE_KEY,
      version: VERSION,
      savedAt: Date.now(),
      gameStarted: state.gameStarted,
      missionIndex: state.missionIndex,
      completedMissions: state.completedMissions.slice(),
      completedSteps: state.completedSteps.slice(),
      choices: { ...state.choices },
      flags: { ...state.flags },
      profile: { ...state.profile },
      runtime: state.missionRuntime ? {
        missionIndex: state.missionRuntime.missionIndex,
        stageIndex: state.missionRuntime.stageIndex,
        stageProgress: state.missionRuntime.stageProgress,
        visited: state.missionRuntime.visited.slice(),
        collected: state.missionRuntime.collected.slice(),
        talked: state.missionRuntime.talked.slice(),
        storySeen: state.missionRuntime.storySeen
      } : null
    };
  }

  async function saveGame() {
    if (!state.db) {
      try {
        await openDatabase();
      } catch (error) {
        updateSaveStatus("Sauvegarde indisponible");
        notify("La sauvegarde locale n'est pas disponible dans ce navigateur.");
        return false;
      }
    }

    if (state.saving) return false;

    state.saving = true;
    setVisible($("savingIndicator"), true);

    try {
      const data = snapshotGame();

      await Promise.all([
        dbPut("saves", data),
        dbPut("profiles", {
          id: PROFILE_KEY,
          profile: { ...state.profile },
          updatedAt: Date.now()
        }),
        dbPut("settings", {
          id: SETTINGS_KEY,
          settings: { ...state.settings },
          updatedAt: Date.now()
        })
      ]);

      state.lastAutosave = Date.now();
      updateSaveStatus("Progression sauvegardée");
      return true;
    } catch (error) {
      console.error("[FOBAS AMOUR] Sauvegarde :", error);
      updateSaveStatus("Échec de la sauvegarde");
      notify("Impossible de sauvegarder. Vérifiez l'espace disponible.");
      return false;
    } finally {
      state.saving = false;
      setVisible($("savingIndicator"), false);
    }
  }

  async function loadGame() {
    try {
      if (!state.db) await openDatabase();

      const [record, profileRecord, settingsRecord] = await Promise.all([
        dbGet("saves", SAVE_KEY),
        dbGet("profiles", PROFILE_KEY),
        dbGet("settings", SETTINGS_KEY)
      ]);

      if (profileRecord && profileRecord.profile) {
        state.profile = {
          ...state.profile,
          ...profileRecord.profile
        };
      }

      if (settingsRecord && settingsRecord.settings) {
        state.settings = {
          ...state.settings,
          ...settingsRecord.settings
        };
      }

      applySettingsToUI();

      if (!record) {
        updateContinueButton();
        return false;
      }

      state.gameStarted = Boolean(record.gameStarted);
      state.missionIndex = clamp(
        safeNumber(record.missionIndex, 0),
        0,
        Math.max(0, getTotalMissionCount() - 1)
      );

      state.completedMissions = Array.isArray(record.completedMissions)
        ? record.completedMissions.filter(Number.isInteger)
        : [];

      state.completedSteps = Array.isArray(record.completedSteps)
        ? record.completedSteps
        : [];

      state.choices = record.choices || {};
      state.flags = record.flags || {};

      if (record.profile) {
        state.profile = { ...state.profile, ...record.profile };
      }

      if (state.gameStarted) {
        buildMissionWorld(state.missionIndex);

        if (record.runtime &&
            record.runtime.missionIndex === state.missionIndex) {
          restoreRuntime(record.runtime);
        }
      }

      updateContinueButton();
      updateSaveStatus("Progression récupérée");
      return true;
    } catch (error) {
      console.error("[FOBAS AMOUR] Chargement :", error);
      updateSaveStatus("Sauvegarde non accessible");
      return false;
    }
  }

  function restoreRuntime(runtime) {
    if (!state.missionRuntime || !runtime) return;

    const current = state.missionRuntime;

    current.stageIndex = clamp(
      safeNumber(runtime.stageIndex, 0),
      0,
      Math.max(0, current.plan.stages.length - 1)
    );

    current.stageProgress = safeNumber(runtime.stageProgress, 0);
    current.visited = Array.isArray(runtime.visited)
      ? runtime.visited : [];
    current.collected = Array.isArray(runtime.collected)
      ? runtime.collected : [];
    current.talked = Array.isArray(runtime.talked)
      ? runtime.talked : [];
    current.storySeen = Boolean(runtime.storySeen);

    current.collected.forEach((id) => {
      const object = state.collectibles.find((item) => item.id === id);
      if (object) object.setEnabled(false);
    });

    updateObjective();
  }

  function updateSaveStatus(message) {
    setText($("saveStatus"), message);
  }

  function updateContinueButton() {
    const button = $("continueGameButton");
    if (!button) return;

    const available = state.gameStarted ||
      state.completedMissions.length > 0;

    button.disabled = !available;
    button.setAttribute("aria-disabled", available ? "false" : "true");
  }

  function scheduleAutosave() {
    if (state.saveTimer) clearTimeout(state.saveTimer);

    state.saveTimer = setTimeout(() => {
      if (state.gameStarted) saveGame();
    }, 900);
  }

  /* ==========================================================
     6. PROFIL DU JOUEUR
  ========================================================== */

  function editProfile() {
    const current = state.profile.name || "Voyageur";
    const proposed = window.prompt(
      "Quel nom souhaitez-vous utiliser dans l'aventure ?",
      current
    );

    if (proposed === null) return;

    const name = proposed.trim().slice(0, 32);

    if (!name) {
      notify("Veuillez saisir un nom valide.");
      return;
    }

    state.profile.name = name;
    notify(`Bienvenue, ${name} !`);
    saveGame();
  }

  /* ==========================================================
     7. PARAMÈTRES
  ========================================================== */

  function applySettingsToUI() {
    const bindings = [
      ["voiceEnabled", "voice"],
      ["musicEnabled", "music"],
      ["subtitlesEnabled", "subtitles"]
    ];

    bindings.forEach(([id, key]) => {
      const element = $(id);
      if (element) element.checked = Boolean(state.settings[key]);
    });

    if ($("qualitySelect")) {
      $("qualitySelect").value = state.settings.quality;
    }

    if ($("sensitivityRange")) {
      $("sensitivityRange").value = state.settings.sensitivity;
    }

    applyGraphicsQuality();
  }

  function readSettingsFromUI() {
    state.settings.voice = Boolean($("voiceEnabled")?.checked);
    state.settings.music = Boolean($("musicEnabled")?.checked);
    state.settings.subtitles = Boolean($("subtitlesEnabled")?.checked);

    state.settings.quality =
      $("qualitySelect")?.value || "medium";

    state.settings.sensitivity = clamp(
      safeNumber($("sensitivityRange")?.value, 1),
      0.5,
      2
    );

    applyGraphicsQuality();

    if (!state.settings.music) stopMusic();
    else startMusicIfEnabled();

    if (!state.settings.voice) stopVoice();

    saveGame();
  }

  function applyGraphicsQuality() {
    if (!state.engine) return;

    const quality = state.settings.quality;

    if (quality === "low") {
      state.engine.setHardwareScalingLevel(1.5);
      state.engine.setSize(
        Math.max(320, Math.floor(window.innerWidth / 1.5)),
        Math.max(240, Math.floor(window.innerHeight / 1.5))
      );
    } else if (quality === "high") {
      state.engine.setHardwareScalingLevel(1);
    } else {
      state.engine.setHardwareScalingLevel(
        window.devicePixelRatio > 1.5 ? 1.25 : 1
      );
    }

    if (state.scene && state.scene.activeCamera) {
      state.scene.activeCamera.maxZ =
        quality === "high" ? 600 : 350;
    }
  }

  /* ==========================================================
     8. NOTIFICATIONS
  ========================================================== */

  let notificationTimer = null;

  function notify(message, duration = 2800) {
    const element = $("gameNotification");
    if (!element) return;

    const now = Date.now();

    if (
      state.lastNotification === message &&
      now - state.lastNotificationAt < 500
    ) {
      return;
    }

    state.lastNotification = message;
    state.lastNotificationAt = now;

    setText(element, message);
    setVisible(element, true);

    if (notificationTimer) clearTimeout(notificationTimer);

    notificationTimer = setTimeout(() => {
      setVisible(element, false);
    }, duration);
  }

  /* ==========================================================
     9. MOTEUR 3D BABYLON.JS
  ========================================================== */

  function createMaterial(name, color, options = {}) {
    const material = new BABYLON.StandardMaterial(name, state.scene);

    material.diffuseColor = BABYLON.Color3.FromHexString(color);
    material.specularColor = new BABYLON.Color3(0.25, 0.25, 0.25);

    if (options.emissive) {
      material.emissiveColor = BABYLON.Color3.FromHexString(
        options.emissive
      );
    }

    if (options.alpha !== undefined) {
      material.alpha = options.alpha;
    }

    return material;
  }

  function createBox(name, position, scaling, material) {
    const mesh = BABYLON.MeshBuilder.CreateBox(name, {
      width: scaling.x,
      height: scaling.y,
      depth: scaling.z
    }, state.scene);

    mesh.position.copyFrom(position);
    mesh.material = material;
    mesh.checkCollisions = false;

    return mesh;
  }

  function createSphere(name, position, diameter, material) {
    const mesh = BABYLON.MeshBuilder.CreateSphere(name, {
      diameter,
      segments: 12
    }, state.scene);

    mesh.position.copyFrom(position);
    mesh.material = material;

    return mesh;
  }

  function createCylinder(name, position, height, diameter, material) {
    const mesh = BABYLON.MeshBuilder.CreateCylinder(name, {
      height,
      diameter,
      tessellation: 12
    }, state.scene);

    mesh.position.copyFrom(position);
    mesh.material = material;

    return mesh;
  }

  function createWorldEnvironment(mission) {
    state.scene.clearColor = new BABYLON.Color4(0.55, 0.72, 0.90, 1);

    const groundMaterial = createMaterial(
      "groundMaterial",
      "#7ab783"
    );

    const ground = BABYLON.MeshBuilder.CreateGround("ground", {
      width: 260,
      height: 260,
      subdivisions: 2
    }, state.scene);

    ground.material = groundMaterial;
    ground.position.y = -0.08;
    ground.isPickable = false;

    const skyMaterial = createMaterial("skyMaterial", "#9ccbf5", {
      emissive: "#274a73"
    });

    const sky = BABYLON.MeshBuilder.CreateSphere("skyDome", {
      diameter: 500,
      segments: 16,
      sideOrientation: BABYLON.Mesh.BACKSIDE
    }, state.scene);

    sky.material = skyMaterial;
    sky.isPickable = false;
    sky.infiniteDistance = true;

    const sunMaterial = createMaterial("sunMaterial", "#fff0b5", {
      emissive: "#ffd779"
    });

    const sun = createSphere(
      "sun",
      new BABYLON.Vector3(38, 55, 55),
      13,
      sunMaterial
    );

    sun.isPickable = false;

    const pathMaterial = createMaterial("pathMaterial", "#d8c5a1");

    const path = createBox(
      "gardenPath",
      new BABYLON.Vector3(0, 0.005, 0),
      new BABYLON.Vector3(12, 0.035, 100),
      pathMaterial
    );

    path.isPickable = false;

    const waterMaterial = createMaterial("waterMaterial", "#65b8d7", {
      alpha: 0.84
    });

    const water = BABYLON.MeshBuilder.CreateGround("water", {
      width: 42,
      height: 24,
      subdivisions: 2
    }, state.scene);

    water.material = waterMaterial;
    water.position.set(-45, 0.025, 15);
    water.isPickable = false;

    const flowerColors = [
      "#ef8fb5", "#e6b7ef", "#fff1b1", "#f49b87"
    ];

    for (let i = 0; i < 90; i++) {
      const x = randomRange(-95, 95);
      const z = randomRange(-95, 95);

      if (Math.abs(x) < 9) continue;

      const stem = createCylinder(
        `flowerStem${i}`,
        new BABYLON.Vector3(x, 0.45, z),
        0.9,
        0.08,
        createMaterial(`stemMat${i}`, "#42814e")
      );

      const blossom = createSphere(
        `flowerBlossom${i}`,
        new BABYLON.Vector3(x, 0.95, z),
        0.38,
        createMaterial(
          `flowerMat${i}`,
          flowerColors[i % flowerColors.length]
        )
      );

      stem.isPickable = false;
      blossom.isPickable = false;
      state.decorations.push(stem, blossom);
    }

    for (let i = 0; i < 36; i++) {
      const x = randomRange(-100, 100);
      const z = randomRange(-100, 100);

      if (Math.abs(x) < 13) continue;

      const trunk = createCylinder(
        `treeTrunk${i}`,
        new BABYLON.Vector3(x, 2, z),
        4,
        0.7,
        createMaterial(`treeTrunkMaterial${i}`, "#8a5b40")
      );

      const leaves = createSphere(
        `treeLeaves${i}`,
        new BABYLON.Vector3(x, 4.7, z),
        randomRange(4, 6),
        createMaterial(`treeLeavesMaterial${i}`, "#3d8b57")
      );

      trunk.isPickable = false;
      leaves.isPickable = false;

      state.decorations.push(trunk, leaves);
    }

    const lampMaterial = createMaterial(
      "lampMaterial",
      "#f5dca0",
      { emissive: "#c99a45" }
    );

    for (let i = -4; i <= 4; i++) {
      const z = i * 11;

      const pole = createCylinder(
        `lampPole${i}`,
        new BABYLON.Vector3(8, 2.2, z),
        4.4,
        0.16,
        createMaterial(`lampPoleMat${i}`, "#54465a")
      );

      const lamp = createSphere(
        `lampLight${i}`,
        new BABYLON.Vector3(8, 4.5, z),
        0.75,
        lampMaterial
      );

      pole.isPickable = false;
      lamp.isPickable = false;

      state.decorations.push(pole, lamp);
    }

    const sign = createBox(
      "locationSign",
      new BABYLON.Vector3(0, 2.2, -12),
      new BABYLON.Vector3(7, 3.5, 0.5),
      createMaterial("signMaterial", "#805c80")
    );

    sign.isPickable = false;

    createLandmark(
      mission.place,
      new BABYLON.Vector3(0, 0, -12)
    );
  }

  function createPlayer() {
    const root = new BABYLON.TransformNode("playerRoot", state.scene);
    root.position.set(0, 0, 4);

    const skin = createMaterial("playerSkin", "#dca77f");
    const clothes = createMaterial("playerClothes", "#8c7ed5");
    const pants = createMaterial("playerPants", "#384b75");
    const shoes = createMaterial("playerShoes", "#392f39");
    const hair = createMaterial("playerHair", "#382b30");

    const body = BABYLON.MeshBuilder.CreateCapsule(
      "playerBody",
      { height: 1.35, radius: 0.36, tessellation: 10 },
      state.scene
    );

    body.parent = root;
    body.position.y = 1.25;
    body.material = clothes;

    const head = createSphere(
      "playerHead",
      new BABYLON.Vector3(0, 2.25, 0),
      0.72,
      skin
    );

    head.parent = root;

    const hairCap = createSphere(
      "playerHair",
      new BABYLON.Vector3(0, 2.51, 0),
      0.73,
      hair
    );

    hairCap.parent = root;
    hairCap.scaling.y = 0.65;

    const leftLeg = createCylinder(
      "playerLeftLeg",
      new BABYLON.Vector3(-0.17, 0.47, 0),
      0.9,
      0.22,
      pants
    );

    const rightLeg = createCylinder(
      "playerRightLeg",
      new BABYLON.Vector3(0.17, 0.47, 0),
      0.9,
      0.22,
      pants
    );

    leftLeg.parent = root;
    rightLeg.parent = root;

    const leftShoe = createBox(
      "playerLeftShoe",
      new BABYLON.Vector3(-0.17, 0.08, 0.1),
      new BABYLON.Vector3(0.3, 0.16, 0.5),
      shoes
    );

    const rightShoe = createBox(
      "playerRightShoe",
      new BABYLON.Vector3(0.17, 0.08, 0.1),
      new BABYLON.Vector3(0.3, 0.16, 0.5),
      shoes
    );

    leftShoe.parent = root;
    rightShoe.parent = root;

    const leftArm = createCylinder(
      "playerLeftArm",
      new BABYLON.Vector3(-0.45, 1.3, 0),
      0.95,
      0.18,
      skin
    );

    const rightArm = createCylinder(
      "playerRightArm",
      new BABYLON.Vector3(0.45, 1.3, 0),
      0.95,
      0.18,
      skin
    );

    leftArm.parent = root;
    rightArm.parent = root;

    state.playerParts = [
      body, head, hairCap, leftLeg, rightLeg,
      leftShoe, rightShoe, leftArm, rightArm
    ];

    state.player = root;
    state.lastPlayerPosition = root.position.clone();

    return root;
  }

  function createCharacter(name, index, position) {
    const root = new BABYLON.TransformNode(
      `npcRoot_${index}_${name}`,
      state.scene
    );

    root.position.copyFrom(position);

    const outfit = createMaterial(
      `npcOutfit_${index}`,
      characterColors[index % characterColors.length]
    );

    const skinColors = ["#e8b995", "#b97d5a", "#f0c9a8", "#8e6048"];
    const skin = createMaterial(
      `npcSkin_${index}`,
      skinColors[index % skinColors.length]
    );

    const hairColors = ["#392b2d", "#654333", "#2b2831", "#b28b55"];
    const hair = createMaterial(
      `npcHair_${index}`,
      hairColors[index % hairColors.length]
    );

    const pants = createMaterial(
      `npcPants_${index}`,
      index % 2 ? "#415b79" : "#655777"
    );

    const body = BABYLON.MeshBuilder.CreateCapsule(
      `npcBody_${index}`,
      { height: 1.3, radius: 0.34, tessellation: 10 },
      state.scene
    );

    body.parent = root;
    body.position.y = 1.2;
    body.material = outfit;

    const head = createSphere(
      `npcHead_${index}`,
      new BABYLON.Vector3(0, 2.2, 0),
      0.67,
      skin
    );

    head.parent = root;

    const hairCap = createSphere(
      `npcHair_${index}`,
      new BABYLON.Vector3(0, 2.45, 0),
      0.69,
      hair
    );

    hairCap.parent = root;
    hairCap.scaling.y = 0.6;

    const leftLeg = createCylinder(
      `npcLeftLeg_${index}`,
      new BABYLON.Vector3(-0.16, 0.43, 0),
      0.85,
      0.2,
      pants
    );

    const rightLeg = createCylinder(
      `npcRightLeg_${index}`,
      new BABYLON.Vector3(0.16, 0.43, 0),
      0.85,
      0.2,
      pants
    );

    leftLeg.parent = root;
    rightLeg.parent = root;

    const leftArm = createCylinder(
      `npcLeftArm_${index}`,
      new BABYLON.Vector3(-0.43, 1.27, 0),
      0.85,
      0.17,
      skin
    );

    const rightArm = createCylinder(
      `npcRightArm_${index}`,
      new BABYLON.Vector3(0.43, 1.27, 0),
      0.85,
      0.17,
      skin
    );

    leftArm.parent = root;
    rightArm.parent = root;

    const character = {
      id: `character-${index}`,
      name,
      index,
      root,
      body,
      head,
      outfit,
      personality: characterPersonalities[
        index % characterPersonalities.length
      ],
      dialogueIndex: index,
      visited: false,
      available: true,
      greeting: `Bonjour ${state.profile.name}. Je m'appelle ${name}. Je suis ${characterPersonalities[index % characterPersonalities.length]}.`,
      meshes: [body, head, hairCap, leftLeg, rightLeg, leftArm, rightArm]
    };

    character.meshes.forEach((mesh) => {
      mesh.metadata = {
        kind: "npc",
        characterId: character.id
      };
    });

    state.npcs.push(character);
    return character;
  }

  function createLandmark(name, position) {
    const markerMaterial = createMaterial(
      `landmarkMaterial_${state.landmarks.length}`,
      "#e7ca82",
      { emissive: "#8d6a31" }
    );

    const marker = BABYLON.MeshBuilder.CreateTorus(
      `landmark_${state.landmarks.length}`,
      {
        diameter: 3.5,
        thickness: 0.16,
        tessellation: 24
      },
      state.scene
    );

    marker.position.set(position.x, 0.18, position.z);
    marker.rotation.x = Math.PI / 2;
    marker.material = markerMaterial;

    marker.metadata = {
      kind: "landmark",
      label: name
    };

    state.landmarks.push({
      id: `landmark-${state.landmarks.length}`,
      name,
      mesh: marker,
      position: position.clone(),
      visited: false
    });

    return marker;
  }

  function createCollectible(index, position) {
    const material = createMaterial(
      `heartMaterial_${index}`,
      "#ff72ae",
      { emissive: "#b72563" }
    );

    const mesh = BABYLON.MeshBuilder.CreatePolyhedron(
      `collectibleHeart_${index}`,
      { type: 1, size: 0.8 },
      state.scene
    );

    mesh.position.copyFrom(position);
    mesh.position.y = 0.9;
    mesh.material = material;

    mesh.metadata = {
      kind: "collectible",
      collectibleId: `collectible-${index}`
    };

    state.collectibles.push({
      id: `collectible-${index}`,
      mesh,
      name: "Souvenir du cœur",
      collected: false
    });

    return mesh;
  }

  function disposeMissionObjects() {
    state.npcs.forEach((npc) => {
      if (npc.root) npc.root.dispose(false, true);
    });

    state.collectibles.forEach((item) => {
      if (item.mesh) item.mesh.dispose();
    });

    state.landmarks.forEach((item) => {
      if (item.mesh) item.mesh.dispose();
    });

    state.decorations.forEach((item) => {
      if (item && !item.isDisposed()) item.dispose();
    });

    state.npcs = [];
    state.collectibles = [];
    state.landmarks = [];
    state.decorations = [];
    state.missionRuntime = null;
  }

  function buildMissionWorld(index) {
    if (!state.scene) return;

    disposeMissionObjects();

    const plan = buildMissionPlan(index);
    if (!plan) return;

    state.scene.clearColor = new BABYLON.Color4(0.55, 0.72, 0.90, 1);

    createWorldEnvironment(plan);

    if (!state.player || state.player.isDisposed()) {
      createPlayer();
    } else {
      state.player.position.set(0, 0, 4);
      state.player.rotation.y = 0;
    }

    for (let i = 0; i < plan.characterCount; i++) {
      const angle = (Math.PI * 2 * i) / plan.characterCount;
      const radius = 12 + (i % 3) * 4;

      const position = new BABYLON.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius - 5
      );

      const name = characterNames[
        (index * 3 + i) % characterNames.length
      ];

      createCharacter(name, i, position);
    }

    const collectibleCount = Math.min(
      3 + Math.floor((index + 1) / 3),
      12
    );

    for (let i = 0; i < collectibleCount; i++) {
      const position = new BABYLON.Vector3(
        randomRange(-32, 32),
        0.8,
        randomRange(-32, 32)
      );

      createCollectible(i, position);
    }

    for (let i = 0; i < 4; i++) {
      createLandmark(
        `${plan.place} — zone ${i + 1}`,
        new BABYLON.Vector3(
          (i - 1.5) * 18,
          0,
          i % 2 ? -26 : 28
        )
      );
    }

    state.missionRuntime = {
      missionIndex: index,
      plan,
      stageIndex: 0,
      stageProgress: 0,
      visited: [],
      collected: [],
      talked: [],
      storySeen: false
    };

    state.activeTarget = null;

    updateMissionHeader();
    updateObjective();
    refreshMissionList();
  }

  /* ==========================================================
     10. INITIALISATION DE BABYLON
  ========================================================== */

  function initializeEngine() {
    return new Promise((resolve, reject) => {
      try {
        state.engine = new BABYLON.Engine(
          canvas,
          true,
          {
            preserveDrawingBuffer: false,
            stencil: true,
            adaptToDeviceRatio: true,
            antialias: state.settings.quality !== "low"
          }
        );

        state.scene = new BABYLON.Scene(state.engine);
        state.scene.collisionsEnabled = false;

        const hemispheric = new BABYLON.HemisphericLight(
          "ambientLight",
          new BABYLON.Vector3(0, 1, 0),
          state.scene
        );

        hemispheric.intensity = 0.95;

        const directional = new BABYLON.DirectionalLight(
          "sunLight",
          new BABYLON.Vector3(-0.5, -1, 0.35),
          state.scene
        );

        directional.intensity = 0.8;

        state.camera3D = new BABYLON.ArcRotateCamera(
          "loveCamera",
          -Math.PI / 2,
          1.12,
          20,
          new BABYLON.Vector3(0, 1.2, 0),
          state.scene
        );

        state.camera3D.lowerRadiusLimit = 6;
        state.camera3D.upperRadiusLimit = 48;
        state.camera3D.lowerBetaLimit = 0.3;
        state.camera3D.upperBetaLimit = 1.45;
        state.camera3D.wheelPrecision = 30;
        state.camera3D.panningSensibility = 0;
        state.camera3D.attachControl(canvas, false);

        state.scene.activeCamera = state.camera3D;

        state.engine.runRenderLoop(() => {
          if (!state.scene || state.scene.isDisposed) return;

          const dt = Math.min(
            state.engine.getDeltaTime() / 1000,
            0.05
          );

          if (state.running && !state.paused) {
            updatePlayer(dt);
            updateCharacters(dt);
            updateCollectibles(dt);
            updateCamera();
            checkAutomaticObjectives();
            updateInteractionTarget();
          }

          state.scene.render();
          state.animationFrame++;
        });

        window.addEventListener("resize", () => {
          if (state.engine) state.engine.resize();
        });

        applyGraphicsQuality();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  /* ==========================================================
     11. DÉPLACEMENT DU JOUEUR
  ========================================================== */

  function updatePlayer(dt) {
    if (!state.player || !state.joystick.active) {
      if (state.player && !state.isJumping) {
        animatePlayerIdle(dt);
      }
      return;
    }

    const inputX = state.joystick.x;
    const inputY = state.joystick.y;

    const cameraAlpha = state.camera3D.alpha;

    const forward = new BABYLON.Vector3(
      Math.sin(cameraAlpha),
      0,
      Math.cos(cameraAlpha)
    );

    const right = new BABYLON.Vector3(
      forward.z,
      0,
      -forward.x
    );

    const movement = forward.scale(-inputY).add(
      right.scale(inputX)
    );

    if (movement.lengthSquared() < 0.002) return;

    movement.normalize();

    const speed = state.isRunning ? 11 : 5.5;
    const movementSpeed = speed * dt;

    state.player.position.addInPlace(
      movement.scale(movementSpeed)
    );

    state.player.position.x = clamp(
      state.player.position.x, -115, 115
    );

    state.player.position.z = clamp(
      state.player.position.z, -115, 115
    );

    state.player.rotation.y = Math.atan2(
      movement.x,
      movement.z
    );

    animatePlayerWalk(dt);
  }

  function animatePlayerWalk(dt) {
    if (!state.playerParts.length) return;

    const t = performance.now() / 150;
    const swing = Math.sin(t) * 0.35;

    state.playerParts[3].rotation.x = swing;
    state.playerParts[4].rotation.x = -swing;
    state.playerParts[7].rotation.x = -swing;
    state.playerParts[8].rotation.x = swing;
  }

  function animatePlayerIdle(dt) {
    if (!state.playerParts.length) return;

    const t = performance.now() / 900;
    state.playerParts[1].position.y =
      2.25 + Math.sin(t) * 0.025;
  }

  function updateCharacters(dt) {
    const time = performance.now() / 1000;

    state.npcs.forEach((npc, index) => {
      if (!npc.root || npc.root.isDisposed()) return;

      npc.root.position.y = Math.sin(
        time * 1.5 + index
      ) * 0.035;

      if (
        state.player &&
        distanceXZ(state.player.position, npc.root.position) < 4
      ) {
        const dx = state.player.position.x - npc.root.position.x;
        const dz = state.player.position.z - npc.root.position.z;

        if (Math.abs(dx) + Math.abs(dz) > 0.1) {
          npc.root.rotation.y = Math.atan2(dx, dz);
        }
      }
    });
  }

  function updateCollectibles(dt) {
    const time = performance.now() / 1000;

    state.collectibles.forEach((item, index) => {
      if (!item.mesh || item.mesh.isDisposed()) return;

      if (item.collected) return;

      item.mesh.rotation.y += dt * 0.8;
      item.mesh.position.y =
        0.9 + Math.sin(time * 2 + index) * 0.18;
    });

    state.landmarks.forEach((item, index) => {
      if (!item.mesh || item.mesh.isDisposed()) return;

      item.mesh.rotation.z =
        Math.sin(time * 1.5 + index) * 0.05;

      item.mesh.rotation.y += dt * 0.15;
    });
  }

  function updateCamera() {
    if (!state.player || !state.camera3D) return;

    state.camera3D.target.x +=
      (state.player.position.x - state.camera3D.target.x) * 0.12;

    state.camera3D.target.y +=
      (state.player.position.y + 1.4 - state.camera3D.target.y) * 0.12;

    state.camera3D.target.z +=
      (state.player.position.z - state.camera3D.target.z) * 0.12;
  }

  function jumpPlayer() {
    if (!state.player || state.isJumping || state.paused) return;

    state.isJumping = true;
    state.verticalVelocity = 7;

    const initialY = state.player.position.y;

    const timer = setInterval(() => {
      if (!state.player || state.paused) {
        clearInterval(timer);
        return;
      }

      state.verticalVelocity -= 0.45;
      state.player.position.y += state.verticalVelocity * 0.045;

      if (state.player.position.y <= initialY) {
        state.player.position.y = initialY;
        state.verticalVelocity = 0;
        state.isJumping = false;
        clearInterval(timer);
      }
    }, 45);
  }

  /* ==========================================================
     12. CONTRÔLES TACTILES ANDROID
     Joystick + caméra + zoom à deux doigts
  ========================================================== */

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

      const maxRadius = rect.width * 0.32;
      const length = Math.sqrt(dx * dx + dy * dy);

      if (length > maxRadius) {
        dx = (dx / length) * maxRadius;
        dy = (dy / length) * maxRadius;
      }

      state.joystick.x = clamp(dx / maxRadius, -1, 1);
      state.joystick.y = clamp(dy / maxRadius, -1, 1);

      thumb.style.transform =
        `translate(${dx}px, ${dy}px)`;
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

    const stopJoystick = (event) => {
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
    };

    control.addEventListener("pointerup", stopJoystick);
    control.addEventListener("pointercancel", stopJoystick);
    control.addEventListener("lostpointercapture", stopJoystick);
  }

  function setupCameraGestures() {
    const pointers = new Map();

    canvas.style.touchAction = "none";

    function getPinchDistance() {
      const points = Array.from(pointers.values());
      if (points.length < 2) return 0;

      const dx = points[0].x - points[1].x;
      const dy = points[0].y - points[1].y;

      return Math.sqrt(dx * dx + dy * dy);
    }

    canvas.addEventListener("pointerdown", (event) => {
      if (state.screen !== "gameScreen" || state.paused) return;

      pointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY
      });

      if (pointers.size === 1) {
        state.camera.dragging = true;
        state.camera.pointerId = event.pointerId;
        state.camera.lastX = event.clientX;
        state.camera.lastY = event.clientY;
      }

      if (pointers.size >= 2) {
        state.camera.pinchDistance = getPinchDistance();
        state.camera.dragging = false;
      }

      try {
        canvas.setPointerCapture(event.pointerId);
      } catch (_) {}
    });

    canvas.addEventListener("pointermove", (event) => {
      if (!pointers.has(event.pointerId)) return;

      pointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY
      });

      if (pointers.size >= 2) {
        const nextDistance = getPinchDistance();

        if (state.camera.pinchDistance > 0 && state.camera3D) {
          const delta = nextDistance - state.camera.pinchDistance;
          const sensitivity = state.settings.sensitivity;

          state.camera3D.radius = clamp(
            state.camera3D.radius -
              delta * 0.035 * sensitivity,
            6,
            48
          );
        }

        state.camera.pinchDistance = nextDistance;
        return;
      }

      if (
        !state.camera.dragging ||
        event.pointerId !== state.camera.pointerId ||
        !state.camera3D
      ) {
        return;
      }

      const dx = event.clientX - state.camera.lastX;
      const dy = event.clientY - state.camera.lastY;

      const sensitivity = state.settings.sensitivity;

      state.camera3D.alpha -= dx * 0.005 * sensitivity;
      state.camera3D.beta = clamp(
        state.camera3D.beta + dy * 0.004 * sensitivity,
        0.3,
        1.45
      );

      state.camera.lastX = event.clientX;
      state.camera.lastY = event.clientY;
    });

    function finishPointer(event) {
      pointers.delete(event.pointerId);

      if (pointers.size < 2) {
        state.camera.pinchDistance = 0;
      }

      if (pointers.size === 0) {
        state.camera.dragging = false;
        state.camera.pointerId = null;
      } else if (pointers.size === 1) {
        const remaining = Array.from(pointers.entries())[0];

        state.camera.pointerId = remaining[0];
        state.camera.lastX = remaining[1].x;
        state.camera.lastY = remaining[1].y;
        state.camera.dragging = true;
      }
    }

    canvas.addEventListener("pointerup", finishPointer);
    canvas.addEventListener("pointercancel", finishPointer);
    canvas.addEventListener("lostpointercapture", finishPointer);

    canvas.addEventListener("wheel", (event) => {
      if (!state.camera3D) return;

      event.preventDefault();

      state.camera3D.radius = clamp(
        state.camera3D.radius + event.deltaY * 0.025,
        6,
        48
      );
    }, { passive: false });
  }

  /* ==========================================================
     13. OBJECTIFS ET PROGRESSION DES MISSIONS
  ========================================================== */

  function currentStage() {
    if (!state.missionRuntime) return null;

    return state.missionRuntime.plan.stages[
      state.missionRuntime.stageIndex
    ] || null;
  }

  function updateMissionHeader() {
    const mission = getCurrentMission();
    if (!mission) return;

    setText(
      $("missionNumber"),
      `MISSION ${String(mission.number).padStart(2, "0")} / ${getTotalMissionCount()}`
    );

    setText($("missionTitle"), mission.title);

    if ($("missionsScreen")) {
      const title = $("missionsScreen").querySelector(".panel-header h2");

      if (title) {
        title.textContent = `Les ${getTotalMissionCount()} missions`;
      }
    }
  }

  function updateObjective() {
    if (!state.missionRuntime) return;

    const runtime = state.missionRuntime;
    const plan = runtime.plan;
    const stage = currentStage();

    const completed = runtime.stageIndex;
    const total = plan.stages.length;

    if (!stage) {
      setText($("objectiveText"), "Mission accomplie !");
      setText($("objectiveProgressText"), `${total} / ${total}`);

      if ($("objectiveProgressBar")) {
        $("objectiveProgressBar").style.width = "100%";
      }

      return;
    }

    const objectiveText = {
      talk: "Approchez-vous du personnage et engagez la conversation.",
      collect: "Explorez les alentours et récupérez le souvenir lumineux.",
      visit: "Rejoignez la zone indiquée pour découvrir le lieu.",
      choice: "Rencontrez le personnage et faites un choix.",
      help: "Approchez-vous de la personne qui a besoin de votre aide.",
      inspect: "Cherchez un indice et examinez-le.",
      deliver: "Trouvez l'objet et remettez-le à la bonne personne.",
      perform: "Rejoignez les participants et prenez part à l'activité."
    };

    setText(
      $("objectiveText"),
      `${stage.label} — ${objectiveText[stage.action] || plan.goal}`
    );

    setText(
      $("objectiveProgressText"),
      `${completed} / ${total}`
    );

    if ($("objectiveProgressBar")) {
      $("objectiveProgressBar").style.width =
        `${(completed / total) * 100}%`;
    }

    updateInteractionTarget();
  }

  function refreshMissionList() {
    const list = $("missionsList");
    if (!list) return;

    list.replaceChildren();

    missionData.forEach((mission, index) => {
      const completed = state.completedMissions.includes(index);
      const current = state.gameStarted &&
        index === state.missionIndex;

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
          : "🔒 À découvrir";

      card.append(heading, description, status);

      card.addEventListener("click", () => {
        if (completed) {
          notify("Cette mission est déjà terminée.");
          return;
        }

        if (!state.gameStarted) {
          notify("Commencez une aventure avant de sélectionner une mission.");
          return;
        }

        if (index > state.missionIndex) {
          notify("Terminez les missions précédentes pour débloquer celle-ci.");
          return;
        }

        if (index < state.missionIndex) {
          showConfirmation(
            "Rejouer une mission ?",
            "Revenir à cette mission remplacera la mission actuellement chargée. Votre progression terminée restera enregistrée.",
            () => {
              state.missionIndex = index;
              buildMissionWorld(index);
              showGame();
              closeMissions();
              saveGame();
            }
          );
          return;
        }

        showGame();
        closeMissions();
      });

      list.appendChild(card);
    });

    const total = getTotalMissionCount();
    const done = state.completedMissions.length;

    setText(
      $("missionsSummary"),
      `${done} mission${done > 1 ? "s" : ""} terminée${done > 1 ? "s" : ""} sur ${total}`
    );

    if ($("overallProgressBar")) {
      $("overallProgressBar").style.width =
        `${(done / Math.max(1, total)) * 100}%`;
    }
  }

  function checkAutomaticObjectives() {
    if (!state.player || !state.missionRuntime || state.paused) return;

    const stage = currentStage();
    if (!stage) return;

    if (stage.action === "visit") {
      const landmark = state.landmarks.find((item) =>
        distanceXZ(state.player.position, item.position) < 3
      );

      if (landmark && !landmark.visited) {
        landmark.visited = true;

        if (!state.missionRuntime.visited.includes(landmark.id)) {
          state.missionRuntime.visited.push(landmark.id);
        }

        completeStage(
          `Vous avez découvert : ${landmark.name}.`
        );
      }
    }
  }

  function completeStage(message) {
    if (!state.missionRuntime) return;

    const runtime = state.missionRuntime;
    const stage = currentStage();

    if (!stage || stage.done) return;

    stage.done = true;
    runtime.stageIndex++;

    if (message) notify(message, 2300);

    updateObjective();
    refreshMissionList();
    scheduleAutosave();

    if (runtime.stageIndex >= runtime.plan.stages.length) {
      completeMission();
    } else {
      const next = currentStage();

      notify(
        `Étape terminée ! Prochaine activité : ${next.label}`,
        3000
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
      `${state.completedMissions.length} / ${getTotalMissionCount()}`
    );

    refreshMissionList();
    saveGame();

    state.running = false;
    state.paused = true;
    stopVoice();

    if (state.missionIndex >= getTotalMissionCount() - 1) {
      showScreen("endingScreen");
      notify("Félicitations ! Vous avez terminé toute l'aventure.");
    } else {
      showScreen("missionCompleteScreen");
    }
  }

  function goToNextMission() {
    if (state.missionIndex >= getTotalMissionCount() - 1) {
      showScreen("endingScreen");
      return;
    }

    state.missionIndex++;
    buildMissionWorld(state.missionIndex);
    state.gameStarted = true;

    showGame();
    showMissionIntroduction();
    saveGame();
  }

  /* ==========================================================
     14. PERSONNAGES ET INTERACTIONS
  ========================================================== */

  function findNearestTarget() {
    if (!state.player) return null;

    const playerPosition = state.player.position;
    let nearest = null;
    let nearestDistance = 5;

    state.npcs.forEach((npc) => {
      const d = distanceXZ(playerPosition, npc.root.position);

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
      if (item.collected || item.mesh.isDisposed()) return;

      const d = distanceXZ(playerPosition, item.mesh.position);

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
      const d = distanceXZ(playerPosition, item.position);

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
    if (!state.player || state.paused || state.screen !== "gameScreen") {
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
      target.kind === "npc" ? "♡" :
      target.kind === "collectible" ? "✦" : "◎"
    );

    setVisible($("interactionPrompt"), true);
  }

  function interact() {
    if (!state.gameStarted || state.paused || !state.missionRuntime) {
      return;
    }

    const target = findNearestTarget();

    if (!target) {
      notify("Approchez-vous d'un personnage, d'un objet ou d'une zone d'exploration.");
      return;
    }

    const stage = currentStage();

    if (!stage) return;

    if (target.kind === "npc") {
      interactWithCharacter(target.object, stage);
      return;
    }

    if (target.kind === "collectible") {
      collectItem(target.object, stage);
      return;
    }

    if (target.kind === "landmark") {
      interactWithLandmark(target.object, stage);
    }
  }

  function interactWithCharacter(character, stage) {
    const runtime = state.missionRuntime;

    if (!runtime) return;

    if (stage.action === "collect" || stage.action === "inspect") {
      notify("Pour cette étape, cherchez l'objet lumineux indiqué.");
      return;
    }

    if (stage.action === "visit") {
      notify("Explorez la zone indiquée au sol.");
      return;
    }

    if (stage.action === "deliver") {
      const collected = runtime.collected.length > 0;

      if (!collected) {
        notify("Vous devez d'abord récupérer un objet.");
        return;
      }
    }

    openDialogue(character, stage);
  }

  function interactWithLandmark(landmark, stage) {
    if (stage.action === "visit") {
      if (!landmark.visited) {
        landmark.visited = true;
        completeStage(`Vous avez découvert ${landmark.name}.`);
      }
      return;
    }

    if (stage.action === "inspect") {
      notify(`Vous examinez ${landmark.name}. Un nouvel indice apparaît dans votre carnet.`);
      state.flags[`inspected-${landmark.id}`] = true;
      completeStage("Indice découvert !");
      return;
    }

    notify("Explorez cette zone et cherchez les personnages à proximité.");
  }

  function collectItem(item, stage) {
    const runtime = state.missionRuntime;

    if (!runtime || item.collected) return;

    if (!["collect", "deliver", "help", "inspect"].includes(stage.action)) {
      notify("Ce souvenir est intéressant, mais votre objectif actuel est différent.");
      return;
    }

    item.collected = true;
    item.mesh.setEnabled(false);

    if (!runtime.collected.includes(item.id)) {
      runtime.collected.push(item.id);
    }

    if (stage.action === "deliver") {
      notify("Objet récupéré. Approchez-vous d'un personnage pour le remettre.");
      scheduleAutosave();
      return;
    }

    if (stage.action === "inspect") {
      notify("Vous avez découvert un nouvel indice.");
    }

    completeStage("Vous avez récupéré un objet précieux.");
  }

  /* ==========================================================
     15. DIALOGUES FRANÇAIS, CHOIX ET RÉÉCOUTE
  ========================================================== */

  function openDialogue(character, stage) {
    if (!character || !stage) return;

    stopVoice();

    const mission = getCurrentMission();

    const dialogue = {
      character,
      stage,
      line: 0,
      lines: [
        character.greeting,
        dialogueBank[
          (mission.number * 3 + character.dialogueIndex) %
          dialogueBank.length
        ],
        `${state.profile.name}, dans cette mission, nous devons ${mission.goal.toLowerCase()}. Je pense que nous pouvons y arriver en nous écoutant et en travaillant ensemble.`,
        "Avant de continuer, j'aimerais connaître ton point de vue. Chaque personne peut apporter une idée différente."
      ]
    };

    state.currentDialogue = dialogue;

    setText($("speakerName"), character.name);
    setText($("speakerAvatar"), character.name.slice(0, 1));
    setVisible($("dialoguePanel"), true);

    renderDialogueLine();

    const choices = $("dialogueChoices");
    if (choices) choices.replaceChildren();

    const choiceTexts = [
      "Je t'écoute avec attention.",
      "Je préfère agir et apporter mon aide.",
      "Je souhaite comprendre avant de décider."
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

    if (!state.settings.voice) {
      setText($("dialogueVoiceStatus"), "Voix désactivée");
    }
  }

  function renderDialogueLine() {
    const dialogue = state.currentDialogue;
    if (!dialogue) return;

    const line = dialogue.lines[dialogue.line] || "";

    setText($("dialogueText"), line);

    if (!state.settings.subtitles) {
      $("dialogueText").style.visibility = "hidden";
    } else {
      $("dialogueText").style.visibility = "visible";
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
    if (!dialogue) return;

    if (dialogue.line < dialogue.lines.length - 1) {
      dialogue.line++;
      renderDialogueLine();
    } else {
      closeDialogue(true);
    }
  }

  function chooseDialogueOption(index, text) {
    const dialogue = state.currentDialogue;
    if (!dialogue) return;

    const mission = getCurrentMission();
    const key = `${mission.number}-${dialogue.character.id}`;

    state.choices[key] = {
      index,
      text,
      timestamp: Date.now()
    };

    notify(`${dialogue.character.name} apprécie votre réponse.`);

    dialogue.line = Math.min(
      dialogue.lines.length - 1,
      dialogue.line + 1
    );

    renderDialogueLine();

    const choices = $("dialogueChoices");
    if (choices) choices.replaceChildren();

    const response = document.createElement("p");
    response.textContent = [
      "Merci de m'avoir écouté. Continuons ensemble.",
      "Je suis heureux de voir que tu souhaites agir concrètement.",
      "Prendre le temps de réfléchir peut nous aider à mieux nous comprendre."
    ][index];

    if (choices) choices.appendChild(response);

    dialogue.chosen = true;
    dialogue.choiceText = text;

    scheduleAutosave();
  }

  function closeDialogue(completed) {
    const dialogue = state.currentDialogue;

    if (completed && dialogue) {
      const runtime = state.missionRuntime;
      const stage = dialogue.stage;

      if (runtime && stage) {
        const characterId = dialogue.character.id;

        if (!runtime.talked.includes(characterId)) {
          runtime.talked.push(characterId);
        }

        if (stage.action === "deliver") {
          if (runtime.collected.length > 0) {
            const itemId = runtime.collected.shift();
            runtime.collected = runtime.collected.filter(
              (id) => id !== itemId
            );

            completeStage(
              `Vous avez remis un objet à ${dialogue.character.name}.`
            );
          } else {
            notify("Vous n'avez aucun objet à remettre.");
          }
        } else if (
          ["talk", "choice", "help", "perform"].includes(stage.action)
        ) {
          if (stage.action === "help") {
            notify(`Vous avez apporté votre aide à ${dialogue.character.name}.`);
          }

          if (stage.action === "perform") {
            notify(`Vous avez participé à l'activité avec ${dialogue.character.name}.`);
          }

          completeStage(
            `Conversation terminée avec ${dialogue.character.name}.`
          );
        } else {
          notify("Conversation terminée. Poursuivez votre objectif.");
        }
      }
    }

    state.currentDialogue = null;
    stopVoice();

    setVisible($("dialoguePanel"), false);

    const choices = $("dialogueChoices");
    if (choices) choices.replaceChildren();
  }

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
      voiceUtterance.rate = 0.92;
      voiceUtterance.pitch = 1.04;
      voiceUtterance.volume = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const frenchVoice = voices.find((voice) =>
        voice.lang && voice.lang.toLowerCase().startsWith("fr")
      );

      if (frenchVoice) voiceUtterance.voice = frenchVoice;

      voiceUtterance.onerror = () => {
        setText($("dialogueVoiceStatus"), "Lecture vocale interrompue");
      };

      voiceUtterance.onend = () => {
        setText(
          $("dialogueVoiceStatus"),
          state.settings.voice
            ? "Dialogue en français"
            : "Voix désactivée"
        );
      };

      window.speechSynthesis.speak(voiceUtterance);
    } catch (error) {
      console.warn("[FOBAS AMOUR] Synthèse vocale :", error);
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

  function showMissionIntroduction() {
    const mission = getCurrentMission();
    if (!mission) return;

    state.missionRuntime.storySeen = true;

    setText($("speakerName"), "Narrateur");
    setText($("speakerAvatar"), "♡");
    setText(
      $("dialogueText"),
      `Mission ${mission.number} : ${mission.title}. ${mission.story}`
    );

    setVisible($("dialoguePanel"), true);

    state.currentDialogue = {
      character: {
        id: "narrator",
        name: "Narrateur"
      },
      stage: null,
      line: 0,
      lines: [
        `Mission ${mission.number} : ${mission.title}. ${mission.story}`,
        `Votre objectif : ${mission.goal}.`,
        `Votre aventure se déroule à ${mission.place}. Explorez les lieux, rencontrez les personnages et utilisez le bouton Interagir pour avancer.`
      ]
    };

    renderDialogueLine();
  }

  /* ==========================================================
     16. MUSIQUE ET AMBIANCE GÉNÉRÉES
     Synthèse sonore locale — aucune piste externe requise.
  ========================================================== */

  function ensureAudioContext() {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }

    return audioContext;
  }

  function playTone(frequency, duration, volume = 0.035, type = "sine") {
    const context = ensureAudioContext();
    if (!context || !state.settings.music) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(
      0.0001,
      context.currentTime
    );

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

    const context = ensureAudioContext();
    if (!context) return;

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

      playTone(frequency, 1.2, 0.018, "sine");

      if (musicStep % 4 === 0) {
        playTone(frequency / 2, 1.5, 0.008, "triangle");
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

  /* ==========================================================
     17. MENUS, CONFIRMATIONS ET BOUTONS
  ========================================================== */

  function showConfirmation(title, message, action) {
    state.confirmationAction = action;

    setText($("confirmationTitle"), title);
    setText($("confirmationMessage"), message);

    state.previousScreen = state.screen;

    setVisible($("confirmationScreen"), true);
  }

  function cancelConfirmation() {
    setVisible($("confirmationScreen"), false);
    state.confirmationAction = null;
  }

  function acceptConfirmation() {
    const action = state.confirmationAction;

    setVisible($("confirmationScreen"), false);
    state.confirmationAction = null;

    if (typeof action === "function") {
      try {
        action();
      } catch (error) {
        console.error("[FOBAS AMOUR] Confirmation :", error);
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
        state.gameStarted = true;

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
    const loaded = await loadGame();

    if (!loaded && !state.gameStarted) {
      notify("Aucune progression sauvegardée. Commencez une nouvelle aventure.");
      return;
    }

    if (!state.missionRuntime) {
      buildMissionWorld(state.missionIndex);
    }

    state.gameStarted = true;
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
        state.gameStarted = true;

        buildMissionWorld(0);
        showGame();
        showMissionIntroduction();
        saveGame();
      }
    );
  }

  function bindClick(id, callback) {
    const element = $(id);

    if (!element) {
      console.warn(`[FOBAS AMOUR] Bouton introuvable : ${id}`);
      return;
    }

    element.addEventListener("click", (event) => {
      event.preventDefault();

      try {
        callback(event);
      } catch (error) {
        console.error(`[FOBAS AMOUR] Action ${id} :`, error);
        notify("Une erreur est survenue pendant cette action.");
      }
    });
  }

  function bindAllButtons() {
    bindClick("newGameButton", startNewGame);
    bindClick("continueGameButton", continueGame);

    bindClick("missionsMenuButton", () => {
      openMissions();
    });

    bindClick("settingsButton", openSettings);
    bindClick("creditsButton", openCredits);

    bindClick("pauseButton", showPause);
    bindClick("resumeButton", resumeGame);
    bindClick("pauseMissionsButton", () => openMissions());
    bindClick("openMissionsButton", () => openMissions());

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
        state.isRunning
          ? "Course activée"
          : "Course désactivée",
        1200
      );
    });

    bindClick("closeDialogueButton", () => closeDialogue(false));
    bindClick("nextDialogueButton", nextDialogueLine);
    bindClick("repeatDialogueButton", repeatDialogue);

    bindClick("retryButton", async () => {
      showScreen("loadingScreen");
      await initializeApplication();
    });

    bindClick("errorMenuButton", showMenu);

    bindClick("missionCompleteScreen", () => {});

    bindClick("missionCompleteScreen", () => {});

    if ($("loveGameCanvas")) {
      canvas.addEventListener("dblclick", interact);
    }
  }

  /* ==========================================================
     18. CLAVIER POUR LES TESTS SUR ORDINATEUR
  ========================================================== */

  const keys = new Set();

  window.addEventListener("keydown", (event) => {
    if ([
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
      "Space", "KeyW", "KeyA", "KeyS", "KeyD"
    ].includes(event.code)) {
      keys.add(event.code);
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
    if (event.code === "Space") jumpPlayer();
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.code);
  });

  function updateKeyboardMovement() {
    if (!state.player || state.paused || !state.running) return;

    let x = 0;
    let y = 0;

    if (keys.has("ArrowLeft") || keys.has("KeyA")) x -= 1;
    if (keys.has("ArrowRight") || keys.has("KeyD")) x += 1;
    if (keys.has("ArrowUp") || keys.has("KeyW")) y += 1;
    if (keys.has("ArrowDown") || keys.has("KeyS")) y -= 1;

    if (x !== 0 || y !== 0) {
      state.joystick.x = x;
      state.joystick.y = y;
      state.joystick.active = true;
    } else if (!state.joystick.pointerId && state.joystick.active) {
      state.joystick.active = false;
      state.joystick.x = 0;
      state.joystick.y = 0;
    }
  }

  /* ==========================================================
     19. BOUCLE D'ENTRETIEN ET INITIALISATION
  ========================================================== */

  async function initializeApplication() {
    if (initialized) {
      showMenu();
      return;
    }

    initialized = true;

    try {
      setText($("loadingMessage"), "Initialisation des systèmes...");
      setText($("loadingPercent"), "10 %");

      if ($("loadingProgress")) {
        $("loadingProgress").style.width = "10%";
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        await openDatabase();
      } catch (error) {
        console.warn(
          "[FOBAS AMOUR] IndexedDB indisponible. Le jeu peut continuer sans sauvegarde persistante.",
          error
        );
      }

      setText($("loadingMessage"), "Préparation du moteur 3D...");
      setText($("loadingPercent"), "30 %");

      if ($("loadingProgress")) {
        $("loadingProgress").style.width = "30%";
      }

      await initializeEngine();

      setText($("loadingMessage"), "Préparation de votre histoire...");
      setText($("loadingPercent"), "70 %");

      if ($("loadingProgress")) {
        $("loadingProgress").style.width = "70%";
      }

      bindAllButtons();
      setupJoystick();
      setupCameraGestures();

      await loadGame();

      if (!state.missionRuntime) {
        buildMissionWorld(0);
      }

      setText($("loadingMessage"), "Votre aventure est prête !");
      setText($("loadingPercent"), "100 %");

      if ($("loadingProgress")) {
        $("loadingProgress").style.width = "100%";
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      showMenu();
      updateContinueButton();

      setInterval(updateKeyboardMovement, 16);

      window.addEventListener("beforeunload", () => {
        if (state.gameStarted) {
          try {
            saveGame();
          } catch (_) {}
        }

        stopVoice();
        stopMusic();
      });
    } catch (error) {
      initialized = false;

      console.error("[FOBAS AMOUR] Initialisation :", error);

      showFatalError(
        "Impossible de démarrer le jeu",
        `${error.message || "Erreur inconnue"}. Vérifiez que Babylon.js est chargé, que le navigateur prend en charge WebGL et que les trois fichiers du jeu sont correctement reliés.`
      );
    }
  }

  /* ==========================================================
     20. DÉMARRAGE
  ========================================================== */

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


