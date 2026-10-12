

/* ============================================================
   FOBAS INTERACTIVE — SUR L'AMOUR EN ACTION
   Fichier : appamourfobas.js
   Version : 2.0.0
   Moteur  : Babylon.js
   Stockage : IndexedDB + solution de secours
   Interface : compatible avec appamourfobas.html
   Auteur : MEME Selvandieu

   FONCTIONNALITÉS
   - Monde 3D généré avec Babylon.js
   - 35 missions configurables et extensibles
   - Personnages 3D stylisés et sélectionnables
   - Déplacement tactile, caméra et zoom
   - Interactions, dialogues, choix et objectifs
   - Progression automatique entre les étapes
   - Sauvegarde locale avec IndexedDB
   - Paramètres, pause, reprise et notifications
   - Synthèse vocale française si disponible
   - Interface adaptée aux appareils mobiles
============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     1. CONFIGURATION GÉNÉRALE
  ========================================================== */

  const CONFIG = Object.freeze({
    appName: "FOBAS — Sur l'Amour en Action",
    version: "2.0.0",
    databaseName: "FOBAS_SUR_AMOUR_DB",
    databaseVersion: 1,
    saveStore: "gameSaves",
    settingsStore: "gameSettings",
    saveKey: "main-save",
    settingsKey: "main-settings",
    autoSaveDelay: 900,
    interactionDistance: 4.2,
    worldLimit: 95,
    movementSpeed: 5.4,
    runningSpeed: 9.2,
    jumpHeight: 1.4,
    gravity: 15,
    touchSensitivity: 1,
    defaultQuality: "medium",
    missionCount: 35
  });

  const $ = (id) => document.getElementById(id);

  const DOM = {
    app: $("loveGameApp"),
    loadingScreen: $("loadingScreen"),
    loadingMessage: $("loadingMessage"),
    loadingProgress: $("loadingProgress"),
    loadingPercent: $("loadingPercent"),

    mainMenu: $("mainMenu"),
    newGameButton: $("newGameButton"),
    continueGameButton: $("continueGameButton"),
    missionsMenuButton: $("missionsMenuButton"),
    settingsButton: $("settingsButton"),
    creditsButton: $("creditsButton"),
    saveStatus: $("saveStatus"),

    gameScreen: $("gameScreen"),
    gameWorld: $("gameWorld"),
    canvas: $("loveGameCanvas"),
    worldLoadingOverlay: $("worldLoadingOverlay"),
    worldLoadingText: $("worldLoadingText"),

    pauseButton: $("pauseButton"),
    missionNumber: $("missionNumber"),
    missionTitle: $("missionTitle"),
    openMissionsButton: $("openMissionsButton"),

    objectivePanel: $("objectivePanel"),
    objectiveText: $("objectiveText"),
    objectiveProgressBar: $("objectiveProgressBar"),
    objectiveProgressText: $("objectiveProgressText"),

    interactionPrompt: $("interactionPrompt"),
    interactionIcon: $("interactionIcon"),
    interactionText: $("interactionText"),

    dialoguePanel: $("dialoguePanel"),
    speakerAvatar: $("speakerAvatar"),
    speakerName: $("speakerName"),
    dialogueText: $("dialogueText"),
    dialogueChoices: $("dialogueChoices"),
    dialogueVoiceStatus: $("dialogueVoiceStatus"),
    closeDialogueButton: $("closeDialogueButton"),
    repeatDialogueButton: $("repeatDialogueButton"),
    nextDialogueButton: $("nextDialogueButton"),

    touchControls: $("touchControls"),
    movementControl: $("movementControl"),
    joystickBase: $("joystickBase"),
    joystickThumb: $("joystickThumb"),
    cameraControlHint: $("cameraControlHint"),
    runButton: $("runButton"),
    jumpButton: $("jumpButton"),
    talkButton: $("talkButton"),

    gameNotification: $("gameNotification"),
    savingIndicator: $("savingIndicator"),

    missionsScreen: $("missionsScreen"),
    missionsSummary: $("missionsSummary"),
    overallProgressBar: $("overallProgressBar"),
    missionsList: $("missionsList"),
    closeMissionsButton: $("closeMissionsButton"),

    pauseScreen: $("pauseScreen"),
    resumeButton: $("resumeButton"),
    pauseMissionsButton: $("pauseMissionsButton"),
    saveGameButton: $("saveGameButton"),
    returnToMenuButton: $("returnToMenuButton"),

    settingsScreen: $("settingsScreen"),
    closeSettingsButton: $("closeSettingsButton"),
    voiceEnabled: $("voiceEnabled"),
    musicEnabled: $("musicEnabled"),
    subtitlesEnabled: $("subtitlesEnabled"),
    qualitySelect: $("qualitySelect"),
    sensitivityRange: $("sensitivityRange"),
    saveSettingsButton: $("saveSettingsButton"),

    creditsScreen: $("creditsScreen"),
    closeCreditsButton: $("closeCreditsButton"),

    missionCompleteScreen: $("missionCompleteScreen"),
    completionTitle: $("completionTitle"),
    completionMessage: $("completionMessage"),
    completionProgress: $("completionProgress"),
    nextMissionButton: $("nextMissionButton"),
    completionMenuButton: $("completionMenuButton"),

    endingScreen: $("endingScreen"),
    restartGameButton: $("restartGameButton"),
    endingMenuButton: $("endingMenuButton"),

    confirmationScreen: $("confirmationScreen"),
    confirmationTitle: $("confirmationTitle"),
    confirmationMessage: $("confirmationMessage"),
    cancelConfirmationButton: $("cancelConfirmationButton"),
    acceptConfirmationButton: $("acceptConfirmationButton"),

    errorScreen: $("errorScreen"),
    errorTitle: $("errorTitle"),
    errorMessage: $("errorMessage"),
    retryButton: $("retryButton"),
    errorMenuButton: $("errorMenuButton")
  };

  /* ==========================================================
     2. OUTILS GÉNÉRAUX
  ========================================================== */

  const Utils = {
    clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    },

    random(min, max) {
      return min + Math.random() * (max - min);
    },

    distance2D(a, b) {
      const dx = a.x - b.x;
      const dz = a.z - b.z;
      return Math.sqrt(dx * dx + dz * dz);
    },

    escapeHTML(value) {
      return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]);
    },

    setText(element, value) {
      if (element) element.textContent = String(value ?? "");
    },

    setWidth(element, percent) {
      if (element) {
        element.style.width = `${Utils.clamp(percent, 0, 100)}%`;
      }
    },

    show(element) {
      if (!element) return;
      element.classList.remove("hidden");
      element.setAttribute("aria-hidden", "false");
    },

    hide(element) {
      if (!element) return;
      element.classList.add("hidden");
      element.setAttribute("aria-hidden", "true");
    },

    button(element, callback) {
      if (!element) return;
      element.addEventListener("click", (event) => {
        event.preventDefault();
        callback(event);
      });
    },

    color3(hex) {
      return BABYLON.Color3.FromHexString(hex);
    },

    vector(x, y, z) {
      return new BABYLON.Vector3(x, y, z);
    },

    safeNumber(value, fallback = 0) {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    }
  };

  /* ==========================================================
     3. PERSONNAGES DISPONIBLES
  ========================================================== */

  const CHARACTERS = [
    {
      id: "alex",
      name: "Alex",
      description: "Charismatique, calme et attentionné",
      gender: "masculin",
      skin: "#C68662",
      hair: "#25202B",
      outfit: "#315A94",
      pants: "#252F42",
      accent: "#E8B86D",
      avatar: "👨",
      voicePitch: 0.88
    },
    {
      id: "camille",
      name: "Camille",
      description: "Souriante, sensible et courageuse",
      gender: "féminin",
      skin: "#E0AF91",
      hair: "#4B2925",
      outfit: "#D96D91",
      pants: "#693A60",
      accent: "#F5D2A7",
      avatar: "👩",
      voicePitch: 1.2
    },
    {
      id: "noah",
      name: "Noah",
      description: "Spontané, généreux et curieux",
      gender: "masculin",
      skin: "#8C5A3C",
      hair: "#171719",
      outfit: "#397D73",
      pants: "#273A39",
      accent: "#E7C16E",
      avatar: "🧑",
      voicePitch: 0.95
    },
    {
      id: "lea",
      name: "Léa",
      description: "Créative, indépendante et chaleureuse",
      gender: "féminin",
      skin: "#F0C7A5",
      hair: "#8C5131",
      outfit: "#8C6AD7",
      pants: "#40375B",
      accent: "#EBCB78",
      avatar: "👩‍🦰",
      voicePitch: 1.25
    },
    {
      id: "mika",
      name: "Mika",
      description: "Optimiste, drôle et plein d'énergie",
      gender: "masculin",
      skin: "#B77952",
      hair: "#211C1B",
      outfit: "#D38B48",
      pants: "#334052",
      accent: "#E6D6A4",
      avatar: "🧑🏽",
      voicePitch: 1.02
    },
    {
      id: "sarah",
      name: "Sarah",
      description: "Élégante, douce et déterminée",
      gender: "féminin",
      skin: "#A86D4D",
      hair: "#22191B",
      outfit: "#9F4F75",
      pants: "#37283C",
      accent: "#F1CE83",
      avatar: "👩🏽",
      voicePitch: 1.16
    }
  ];

  /* ==========================================================
     4. MISSIONS — STRUCTURE MODIFIABLE

     Pour ajouter une mission :
     1. Ajouter un objet dans MISSION_DATA.
     2. Définir son titre, son décor et ses étapes.
     3. Chaque étape possède une action et un objectif.

     Actions reconnues :
     move, visit, talk, interact, collect, help,
     sit, dance, sing, photo, listen, give, choice,
     promise, explore, wait, hug, observe, arrive.
  ========================================================== */

  const MISSION_DATA = [
    {
      id: 1,
      title: "Un regard inattendu",
      location: "Le jardin des rencontres",
      landscape: "garden",
      description: "Découvrez le jardin et faites une rencontre inattendue.",
      reward: "Une première rencontre inoubliable",
      steps: [
        { type: "move", text: "Avancez jusqu'à l'allée fleurie.", target: { x: 0, z: 8 } },
        { type: "talk", text: "Approchez Camille et engagez la conversation.", npc: "camille" },
        { type: "choice", text: "Choisissez comment vous présenter.", npc: "camille", choices: ["Avec un sourire sincère", "Avec une plaisanterie", "Avec une question sur le jardin"] },
        { type: "visit", text: "Rejoignez le belvédère pour admirer le jardin.", target: { x: 8, z: 13 } }
      ]
    },
    {
      id: 2,
      title: "Une promenade à deux",
      location: "Le parc romantique",
      landscape: "park",
      description: "Apprenez à mieux connaître votre nouvelle rencontre.",
      reward: "Un souvenir partagé",
      steps: [
        { type: "talk", text: "Retrouvez Camille près du grand arbre.", npc: "camille" },
        { type: "move", text: "Promenez-vous jusqu'au petit pont.", target: { x: 7, z: 10 } },
        { type: "choice", text: "Choisissez un sujet de conversation.", npc: "camille", choices: ["Les rêves d'avenir", "Les voyages", "Les souvenirs d'enfance"] },
        { type: "visit", text: "Terminez la promenade au bord de l'eau.", target: { x: -8, z: 12 } }
      ]
    },
    {
      id: 3,
      title: "Le café des confidences",
      location: "Une terrasse ensoleillée",
      landscape: "cafe",
      description: "Partagez un moment chaleureux autour d'un café.",
      reward: "Une conversation sincère",
      steps: [
        { type: "visit", text: "Entrez dans la zone de la terrasse.", target: { x: 0, z: 7 } },
        { type: "talk", text: "Saluez la personne qui vous attend.", npc: "lea" },
        { type: "interact", text: "Commandez deux boissons au comptoir.", target: { x: 4, z: 3 }, actionLabel: "Commander" },
        { type: "choice", text: "Choisissez une boisson à partager.", npc: "lea", choices: ["Un chocolat chaud", "Un café au lait", "Un jus de fruits"] }
      ]
    },
    {
      id: 4,
      title: "Une lettre mystérieuse",
      location: "La maison aux volets bleus",
      landscape: "house",
      description: "Découvrez le message laissé devant la maison.",
      reward: "Le secret de la lettre",
      steps: [
        { type: "move", text: "Approchez de la maison aux volets bleus.", target: { x: 0, z: 9 } },
        { type: "collect", text: "Récupérez la lettre près de la porte.", target: { x: 2, z: 7 }, actionLabel: "Prendre la lettre" },
        { type: "talk", text: "Montrez la lettre à Alex.", npc: "alex" },
        { type: "choice", text: "Décidez de la suite.", npc: "alex", choices: ["Lire la lettre ensemble", "Chercher son auteur", "Garder le message pour plus tard"] }
      ]
    },
    {
      id: 5,
      title: "Le marché des couleurs",
      location: "Le marché du centre-ville",
      landscape: "market",
      description: "Explorez les étals et préparez une petite surprise.",
      reward: "Un cadeau attentionné",
      steps: [
        { type: "visit", text: "Rejoignez l'entrée du marché.", target: { x: 0, z: 9 } },
        { type: "collect", text: "Choisissez un bouquet de fleurs.", target: { x: -5, z: 5 }, actionLabel: "Prendre les fleurs" },
        { type: "talk", text: "Retrouvez Sarah près des étals.", npc: "sarah" },
        { type: "give", text: "Offrez le bouquet à Sarah.", npc: "sarah", actionLabel: "Offrir le bouquet" }
      ]
    },
    {
      id: 6,
      title: "Le chemin vers la plage",
      location: "La route côtière",
      landscape: "coast",
      description: "Suivez le sentier qui mène à la mer.",
      reward: "Un paysage magnifique",
      steps: [
        { type: "move", text: "Suivez le sentier côtier.", target: { x: 0, z: 10 } },
        { type: "visit", text: "Rejoignez le bord de mer.", target: { x: 8, z: 15 } },
        { type: "talk", text: "Retrouvez Noah face aux vagues.", npc: "noah" },
        { type: "observe", text: "Approchez-vous du point de vue sur la mer.", target: { x: -7, z: 17 }, actionLabel: "Admirer le paysage" }
      ]
    },
    {
      id: 7,
      title: "Le coucher du soleil",
      location: "La plage dorée",
      landscape: "beach",
      description: "Admirez les dernières couleurs du jour.",
      reward: "Un moment de tranquillité",
      steps: [
        { type: "move", text: "Marchez vers le sable doré.", target: { x: 0, z: 8 } },
        { type: "talk", text: "Rejoignez Léa sur la plage.", npc: "lea" },
        { type: "observe", text: "Installez-vous au point de vue.", target: { x: 7, z: 13 }, actionLabel: "Admirer le coucher du soleil" },
        { type: "choice", text: "Partagez ce que vous ressentez.", npc: "lea", choices: ["C'est un moment paisible", "J'aimerais revenir ici", "Ce paysage est magnifique"] }
      ]
    },
    {
      id: 8,
      title: "La promesse du phare",
      location: "Le vieux phare",
      landscape: "lighthouse",
      description: "Rejoignez le phare et découvrez son histoire.",
      reward: "Une promesse sincère",
      steps: [
        { type: "visit", text: "Approchez du pied du phare.", target: { x: 0, z: 9 } },
        { type: "talk", text: "Parlez au gardien du phare.", npc: "noah" },
        { type: "move", text: "Rejoignez le point de vue en hauteur.", target: { x: 7, z: 13 } },
        { type: "promise", text: "Faites une promesse pour l'avenir.", npc: "noah", actionLabel: "Faire une promesse" }
      ]
    },
    {
      id: 9,
      title: "Un repas fait avec le cœur",
      location: "La cuisine familiale",
      landscape: "house",
      description: "Préparez un repas simple avec une personne chère.",
      reward: "Un repas partagé",
      steps: [
        { type: "visit", text: "Rejoignez la cuisine.", target: { x: 0, z: 6 } },
        { type: "interact", text: "Préparez les ingrédients sur la table.", target: { x: 4, z: 4 }, actionLabel: "Préparer les ingrédients" },
        { type: "talk", text: "Demandez un coup de main à Camille.", npc: "camille" },
        { type: "interact", text: "Terminez la préparation du repas.", target: { x: -3, z: 4 }, actionLabel: "Terminer le repas" }
      ]
    },
    {
      id: 10,
      title: "Le dîner aux chandelles",
      location: "La salle à manger",
      landscape: "restaurant",
      description: "Organisez un dîner dans une ambiance chaleureuse.",
      reward: "Un dîner réussi",
      steps: [
        { type: "visit", text: "Rejoignez la table préparée.", target: { x: 0, z: 7 } },
        { type: "interact", text: "Allumez les bougies.", target: { x: 0, z: 5 }, actionLabel: "Allumer les bougies" },
        { type: "talk", text: "Accueillez votre invitée.", npc: "camille" },
        { type: "choice", text: "Choisissez un sujet de discussion.", npc: "camille", choices: ["Les projets communs", "La musique", "Les plus beaux voyages"] }
      ]
    },
    {
      id: 11,
      title: "Le bal des lumières",
      location: "La place illuminée",
      landscape: "festival",
      description: "Découvrez la fête et partagez une danse.",
      reward: "Une danse mémorable",
      steps: [
        { type: "visit", text: "Entrez sur la place du festival.", target: { x: 0, z: 8 } },
        { type: "talk", text: "Retrouvez Mika près des lumières.", npc: "mika" },
        { type: "dance", text: "Partagez une danse au centre de la place.", target: { x: 0, z: 3 }, actionLabel: "Danser ensemble" },
        { type: "observe", text: "Admirez les décorations du festival.", target: { x: 7, z: 10 }, actionLabel: "Admirer les lumières" }
      ]
    },
    {
      id: 12,
      title: "Une mélodie pour deux",
      location: "Le kiosque musical",
      landscape: "park",
      description: "Retrouvez une mélodie qui vous rappelle un souvenir.",
      reward: "Une mélodie partagée",
      steps: [
        { type: "visit", text: "Rejoignez le kiosque musical.", target: { x: 0, z: 7 } },
        { type: "talk", text: "Parlez de musique avec Léa.", npc: "lea" },
        { type: "sing", text: "Lancez une petite chanson.", npc: "lea", actionLabel: "Chanter" },
        { type: "choice", text: "Choisissez la prochaine mélodie.", npc: "lea", choices: ["Une chanson douce", "Une chanson joyeuse", "Une chanson nostalgique"] }
      ]
    },
    {
      id: 13,
      title: "Le voyage imprévu",
      location: "La gare des voyageurs",
      landscape: "station",
      description: "Préparez un voyage improvisé.",
      reward: "Un billet pour l'aventure",
      steps: [
        { type: "visit", text: "Rejoignez le hall de la gare.", target: { x: 0, z: 8 } },
        { type: "talk", text: "Retrouvez Alex devant les départs.", npc: "alex" },
        { type: "interact", text: "Consultez le panneau des destinations.", target: { x: 5, z: 6 }, actionLabel: "Consulter les destinations" },
        { type: "choice", text: "Choisissez votre destination.", npc: "alex", choices: ["Une ville au bord de mer", "Un village de montagne", "Une capitale animée"] }
      ]
    },
    {
      id: 14,
      title: "Le village des souvenirs",
      location: "Le vieux village",
      landscape: "village",
      description: "Explorez les ruelles d'un village plein de charme.",
      reward: "Une histoire retrouvée",
      steps: [
        { type: "explore", text: "Explorez la ruelle principale.", target: { x: 0, z: 9 } },
        { type: "visit", text: "Rejoignez la vieille fontaine.", target: { x: 8, z: 7 } },
        { type: "talk", text: "Écoutez l'histoire de Sarah.", npc: "sarah" },
        { type: "observe", text: "Contemplez les maisons anciennes.", target: { x: -7, z: 11 }, actionLabel: "Observer les maisons" }
      ]
    },
    {
      id: 15,
      title: "La photographie parfaite",
      location: "Le jardin des roses",
      landscape: "garden",
      description: "Créez un souvenir photographique.",
      reward: "Un souvenir à conserver",
      steps: [
        { type: "visit", text: "Rejoignez le jardin des roses.", target: { x: 0, z: 8 } },
        { type: "talk", text: "Demandez à Noah de poser avec vous.", npc: "noah" },
        { type: "photo", text: "Prenez une photo souvenir.", target: { x: 4, z: 11 }, actionLabel: "Prendre la photo" },
        { type: "choice", text: "Choisissez le titre de la photo.", npc: "noah", choices: ["Un jour heureux", "Deux sourires", "Un souvenir précieux"] }
      ]
    },
    {
      id: 16,
      title: "Une journée solidaire",
      location: "La place communautaire",
      landscape: "village",
      description: "Aidez les habitants et découvrez la force de l'entraide.",
      reward: "La gratitude des habitants",
      steps: [
        { type: "visit", text: "Rejoignez la place communautaire.", target: { x: 0, z: 8 } },
        { type: "talk", text: "Écoutez la demande de Sarah.", npc: "sarah" },
        { type: "help", text: "Aidez à préparer les provisions.", target: { x: -5, z: 5 }, actionLabel: "Préparer les provisions" },
        { type: "give", text: "Remettez les provisions à Sarah.", npc: "sarah", actionLabel: "Remettre les provisions" }
      ]
    },
    {
      id: 17,
      title: "La surprise d'anniversaire",
      location: "La maison décorée",
      landscape: "house",
      description: "Préparez une surprise pour une personne importante.",
      reward: "Un anniversaire réussi",
      steps: [
        { type: "collect", text: "Récupérez les décorations.", target: { x: -4, z: 5 }, actionLabel: "Prendre les décorations" },
        { type: "interact", text: "Décorez la pièce principale.", target: { x: 0, z: 7 }, actionLabel: "Décorer la pièce" },
        { type: "talk", text: "Invitez Léa à découvrir la surprise.", npc: "lea" },
        { type: "choice", text: "Choisissez vos mots pour l'occasion.", npc: "lea", choices: ["Tu comptes beaucoup pour moi", "Je te souhaite beaucoup de bonheur", "Que cette journée soit inoubliable"] }
      ]
    },
    {
      id: 18,
      title: "Le sentier de la montagne",
      location: "Les hauteurs verdoyantes",
      landscape: "mountain",
      description: "Parcourez un sentier et profitez de la vue.",
      reward: "La beauté des hauteurs",
      steps: [
        { type: "move", text: "Suivez le sentier de montagne.", target: { x: 0, z: 10 } },
        { type: "help", text: "Aidez Mika à franchir le passage.", npc: "mika", actionLabel: "Aider Mika" },
        { type: "visit", text: "Atteignez le belvédère.", target: { x: 8, z: 15 } },
        { type: "observe", text: "Admirez la vallée.", target: { x: -6, z: 17 }, actionLabel: "Admirer la vallée" }
      ]
    },
    {
      id: 19,
      title: "La nuit sous les étoiles",
      location: "Le campement paisible",
      landscape: "camp",
      description: "Installez-vous dans un lieu calme sous le ciel nocturne.",
      reward: "Une soirée étoilée",
      steps: [
        { type: "visit", text: "Rejoignez le campement.", target: { x: 0, z: 7 } },
        { type: "interact", text: "Installez les couvertures.", target: { x: -3, z: 5 }, actionLabel: "Installer les couvertures" },
        { type: "talk", text: "Parlez avec Alex autour du campement.", npc: "alex" },
        { type: "observe", text: "Levez les yeux vers les étoiles.", target: { x: 6, z: 9 }, actionLabel: "Observer les étoiles" }
      ]
    },
    {
      id: 20,
      title: "Les mots du cœur",
      location: "Le balcon fleuri",
      landscape: "balcony",
      description: "Exprimez vos sentiments avec sincérité et respect.",
      reward: "Des mots sincères",
      steps: [
        { type: "visit", text: "Rejoignez le balcon fleuri.", target: { x: 0, z: 8 } },
        { type: "talk", text: "Retrouvez Camille.", npc: "camille" },
        { type: "choice", text: "Choisissez comment exprimer vos sentiments.", npc: "camille", choices: ["Je suis heureux de te connaître", "J'apprécie chaque moment partagé", "J'aimerais continuer à te découvrir"] },
        { type: "promise", text: "Promettez de rester honnête et attentionné.", npc: "camille", actionLabel: "Faire une promesse" }
      ]
    },
    {
      id: 21,
      title: "Le jardin à reconstruire",
      location: "Le jardin communautaire",
      landscape: "garden",
      description: "Rendez au jardin sa beauté grâce au travail collectif.",
      reward: "Un jardin renouvelé",
      steps: [
        { type: "visit", text: "Inspectez le jardin.", target: { x: 0, z: 8 } },
        { type: "collect", text: "Récupérez les outils de jardinage.", target: { x: -4, z: 5 }, actionLabel: "Prendre les outils" },
        { type: "help", text: "Plantez les fleurs avec Sarah.", npc: "sarah", actionLabel: "Planter les fleurs" },
        { type: "observe", text: "Admirez le jardin rénové.", target: { x: 6, z: 11 }, actionLabel: "Admirer le jardin" }
      ]
    },
    {
      id: 22,
      title: "Une journée de pluie",
      location: "Le salon chaleureux",
      landscape: "house",
      description: "Transformez une journée pluvieuse en un moment agréable.",
      reward: "Un souvenir chaleureux",
      steps: [
        { type: "visit", text: "Entrez dans le salon.", target: { x: 0, z: 7 } },
        { type: "interact", text: "Préparez une boisson chaude.", target: { x: 4, z: 4 }, actionLabel: "Préparer une boisson" },
        { type: "talk", text: "Rejoignez Léa pour discuter.", npc: "lea" },
        { type: "choice", text: "Choisissez une activité.", npc: "lea", choices: ["Jouer à un jeu de société", "Écouter de la musique", "Raconter des histoires"] }
      ]
    },
    {
      id: 23,
      title: "La fête du village",
      location: "La grande place",
      landscape: "festival",
      description: "Participez aux préparatifs et à la fête.",
      reward: "La joie de la communauté",
      steps: [
        { type: "visit", text: "Rejoignez la grande place.", target: { x: 0, z: 8 } },
        { type: "help", text: "Aidez Mika à préparer les décorations.", npc: "mika", actionLabel: "Préparer les décorations" },
        { type: "dance", text: "Participez à la danse collective.", target: { x: 3, z: 4 }, actionLabel: "Participer à la danse" },
        { type: "talk", text: "Remerciez les participants.", npc: "mika" }
      ]
    },
    {
      id: 24,
      title: "Le cadeau inattendu",
      location: "La boutique artisanale",
      landscape: "market",
      description: "Choisissez un cadeau qui exprime votre attention.",
      reward: "Un cadeau plein de sens",
      steps: [
        { type: "visit", text: "Entrez dans la boutique artisanale.", target: { x: 0, z: 7 } },
        { type: "collect", text: "Choisissez un objet artisanal.", target: { x: 4, z: 4 }, actionLabel: "Choisir le cadeau" },
        { type: "talk", text: "Retrouvez Sarah à la sortie.", npc: "sarah" },
        { type: "give", text: "Offrez le cadeau choisi.", npc: "sarah", actionLabel: "Offrir le cadeau" }
      ]
    },
    {
      id: 25,
      title: "Une lettre d'excuses",
      location: "Le jardin tranquille",
      landscape: "garden",
      description: "Apprenez à reconnaître une erreur et à dialoguer.",
      reward: "Un pas vers la réconciliation",
      steps: [
        { type: "move", text: "Rejoignez le banc du jardin.", target: { x: -3, z: 7 } },
        { type: "talk", text: "Retrouvez Noah pour discuter.", npc: "noah" },
        { type: "choice", text: "Choisissez une réponse respectueuse.", npc: "noah", choices: ["Reconnaître son erreur", "Écouter d'abord", "Proposer une solution"] },
        { type: "promise", text: "Engagez-vous à mieux communiquer.", npc: "noah", actionLabel: "Confirmer son engagement" }
      ]
    },
    {
      id: 26,
      title: "La route des découvertes",
      location: "La campagne verdoyante",
      landscape: "countryside",
      description: "Explorez plusieurs points de vue dans la campagne.",
      reward: "Un nouvel horizon",
      steps: [
        { type: "visit", text: "Rejoignez le vieux chemin.", target: { x: 0, z: 9 } },
        { type: "explore", text: "Découvrez le petit pont.", target: { x: 8, z: 12 } },
        { type: "talk", text: "Retrouvez Alex près de la rivière.", npc: "alex" },
        { type: "visit", text: "Terminez au belvédère.", target: { x: -7, z: 15 } }
      ]
    },
    {
      id: 27,
      title: "Le spectacle de talents",
      location: "La scène du festival",
      landscape: "festival",
      description: "Encouragez vos amis et participez au spectacle.",
      reward: "Une ovation chaleureuse",
      steps: [
        { type: "visit", text: "Rejoignez la scène.", target: { x: 0, z: 7 } },
        { type: "talk", text: "Encouragez Mika avant son passage.", npc: "mika" },
        { type: "sing", text: "Participez à un refrain.", npc: "mika", actionLabel: "Chanter avec Mika" },
        { type: "choice", text: "Choisissez votre message de soutien.", npc: "mika", choices: ["Bravo pour ton courage", "Tu as donné le meilleur de toi-même", "Quel beau spectacle !"] }
      ]
    },
    {
      id: 28,
      title: "Le voyage en bateau",
      location: "Le petit port",
      landscape: "harbor",
      description: "Découvrez le port et préparez une petite excursion.",
      reward: "Un voyage paisible",
      steps: [
        { type: "visit", text: "Rejoignez le quai.", target: { x: 0, z: 8 } },
        { type: "talk", text: "Parlez avec Léa du voyage.", npc: "lea" },
        { type: "interact", text: "Préparez le départ.", target: { x: 5, z: 5 }, actionLabel: "Préparer le départ" },
        { type: "observe", text: "Contemplez la mer depuis le quai.", target: { x: -6, z: 12 }, actionLabel: "Observer la mer" }
      ]
    },
    {
      id: 29,
      title: "Les lumières de la ville",
      location: "Le quartier animé",
      landscape: "city",
      description: "Explorez la ville et ses rues illuminées.",
      reward: "Une soirée en ville",
      steps: [
        { type: "explore", text: "Explorez la rue principale.", target: { x: 0, z: 9 } },
        { type: "visit", text: "Rejoignez la place illuminée.", target: { x: 8, z: 8 } },
        { type: "talk", text: "Retrouvez Sarah sur la place.", npc: "sarah" },
        { type: "photo", text: "Prenez une photo des lumières.", target: { x: -6, z: 11 }, actionLabel: "Photographier la ville" }
      ]
    },
    {
      id: 30,
      title: "Le projet commun",
      location: "L'atelier créatif",
      landscape: "workshop",
      description: "Construisez un petit projet en équipe.",
      reward: "Une réussite collective",
      steps: [
        { type: "visit", text: "Entrez dans l'atelier.", target: { x: 0, z: 7 } },
        { type: "talk", text: "Discutez du projet avec Noah.", npc: "noah" },
        { type: "interact", text: "Assemblez les éléments du projet.", target: { x: 4, z: 4 }, actionLabel: "Assembler le projet" },
        { type: "help", text: "Terminez le projet ensemble.", npc: "noah", actionLabel: "Terminer le projet" }
      ]
    },
    {
      id: 31,
      title: "Une décision importante",
      location: "Le belvédère",
      landscape: "mountain",
      description: "Discutez des décisions qui peuvent changer l'avenir.",
      reward: "Une décision réfléchie",
      steps: [
        { type: "visit", text: "Rejoignez le belvédère.", target: { x: 0, z: 9 } },
        { type: "talk", text: "Retrouvez Camille.", npc: "camille" },
        { type: "choice", text: "Choisissez une priorité pour l'avenir.", npc: "camille", choices: ["Construire un projet commun", "Prendre le temps de réfléchir", "Explorer de nouvelles possibilités"] },
        { type: "promise", text: "Confirmez votre décision.", npc: "camille", actionLabel: "Confirmer la décision" }
      ]
    },
    {
      id: 32,
      title: "La grande réconciliation",
      location: "Le jardin des retrouvailles",
      landscape: "garden",
      description: "Rétablissez le dialogue et apprenez à vous écouter.",
      reward: "Une relation apaisée",
      steps: [
        { type: "visit", text: "Rejoignez le jardin des retrouvailles.", target: { x: 0, z: 8 } },
        { type: "talk", text: "Écoutez les explications de Noah.", npc: "noah" },
        { type: "choice", text: "Choisissez une réponse constructive.", npc: "noah", choices: ["Écouter sans interrompre", "Expliquer calmement son point de vue", "Chercher un compromis"] },
        { type: "promise", text: "Confirmez votre volonté d'avancer.", npc: "noah", actionLabel: "Sceller la réconciliation" }
      ]
    },
    {
      id: 33,
      title: "Le rêve partagé",
      location: "La terrasse panoramique",
      landscape: "balcony",
      description: "Imaginez ensemble un avenir riche en possibilités.",
      reward: "Un rêve commun",
      steps: [
        { type: "visit", text: "Rejoignez la terrasse panoramique.", target: { x: 0, z: 8 } },
        { type: "talk", text: "Parlez de vos rêves avec Léa.", npc: "lea" },
        { type: "choice", text: "Choisissez un rêve à poursuivre.", npc: "lea", choices: ["Voyager ensemble", "Créer un projet utile", "Découvrir de nouveaux horizons"] },
        { type: "promise", text: "Définissez la première étape du projet.", npc: "lea", actionLabel: "Définir la première étape" }
      ]
    },
    {
      id: 34,
      title: "La célébration des souvenirs",
      location: "Le jardin des souvenirs",
      landscape: "festival",
      description: "Revivez les étapes importantes de votre aventure.",
      reward: "Des souvenirs précieux",
      steps: [
        { type: "visit", text: "Rejoignez le jardin de célébration.", target: { x: 0, z: 8 } },
        { type: "talk", text: "Retrouvez vos amis.", npc: "mika" },
        { type: "photo", text: "Prenez une photo de groupe.", target: { x: 5, z: 10 }, actionLabel: "Photographier le groupe" },
        { type: "dance", text: "Partagez la danse de célébration.", target: { x: 0, z: 3 }, actionLabel: "Célébrer ensemble" }
      ]
    },
    {
      id: 35,
      title: "Sur l'Amour en Action",
      location: "Le grand jardin de l'avenir",
      landscape: "grandfinale",
      description: "Terminez votre aventure en célébrant les liens, les choix et les souvenirs.",
      reward: "Le chapitre final de votre aventure",
      steps: [
        { type: "visit", text: "Rejoignez le jardin de l'avenir.", target: { x: 0, z: 8 } },
        { type: "talk", text: "Retrouvez Camille pour le dernier dialogue.", npc: "camille" },
        { type: "choice", text: "Choisissez le message qui résume votre aventure.", npc: "camille", choices: ["L'amour se construit par les actes", "Le respect rend les liens plus forts", "Chaque jour offre une nouvelle possibilité"] },
        { type: "observe", text: "Rejoignez le belvédère et contemplez votre chemin.", target: { x: 8, z: 15 }, actionLabel: "Contempler l'avenir" }
      ]
    }
  ];

  /* ==========================================================
     5. ÉTAT DU JEU
  ========================================================== */

  const State = {
    engine: null,
    scene: null,
    camera: null,
    player: null,
    playerVisual: null,
    playerCharacterId: "alex",
    npcs: [],
    worldObjects: [],
    currentTarget: null,
    activeMissionIndex: 0,
    activeStepIndex: 0,
    completedMissions: [],
    currentChoices: [],
    lastDialogue: "",
    dialogueOpen: false,
    paused: false,
    gameStarted: false,
    gameReady: false,
    ending: false,
    isRunning: false,
    isJumping: false,
    verticalVelocity: 0,
    movement: { x: 0, z: 0 },
    joystickPointerId: null,
    joystickOrigin: { x: 0, y: 0 },
    cameraPointerId: null,
    cameraPointerLast: { x: 0, y: 0 },
    activePointers: new Map(),
    pinchDistance: 0,
    autoSaveTimer: null,
    notificationTimer: null,
    saving: false,
    db: null,
    dbAvailable: false,
    memoryStore: new Map(),
    settings: {
      voice: true,
      music: true,
      subtitles: true,
      quality: "medium",
      sensitivity: 1
    },
    lastFrameTime: 0,
    animationTime: 0,
    playerAction: "idle",
    confirmationCallback: null,
    sceneGeneration: 0
  };

  /* ==========================================================
     6. SAUVEGARDE INDEXEDDB
  ========================================================== */

  const Storage = {
    async open() {
      if (!("indexedDB" in window)) {
        State.dbAvailable = false;
        return false;
      }

      return new Promise((resolve) => {
        let request;

        try {
          request = indexedDB.open(
            CONFIG.databaseName,
            CONFIG.databaseVersion
          );
        } catch (error) {
          console.warn("IndexedDB indisponible :", error);
          resolve(false);
          return;
        }

        request.onupgradeneeded = () => {
          const db = request.result;

          if (!db.objectStoreNames.contains(CONFIG.saveStore)) {
            db.createObjectStore(CONFIG.saveStore, { keyPath: "id" });
          }

          if (!db.objectStoreNames.contains(CONFIG.settingsStore)) {
            db.createObjectStore(CONFIG.settingsStore, { keyPath: "id" });
          }
        };

        request.onsuccess = () => {
          State.db = request.result;
          State.dbAvailable = true;

          State.db.onversionchange = () => {
            State.db.close();
            State.db = null;
          };

          resolve(true);
        };

        request.onerror = () => {
          console.warn("Impossible d'ouvrir IndexedDB.");
          State.dbAvailable = false;
          resolve(false);
        };

        request.onblocked = () => {
          console.warn("Ouverture IndexedDB bloquée.");
          resolve(false);
        };
      });
    },

    async get(storeName, key) {
      if (State.dbAvailable && State.db) {
        return new Promise((resolve) => {
          try {
            const transaction = State.db.transaction(storeName, "readonly");
            const request = transaction.objectStore(storeName).get(key);

            request.onsuccess = () => resolve(request.result?.value ?? null);
            request.onerror = () => resolve(
              State.memoryStore.get(`${storeName}:${key}`) ?? null
            );
          } catch (error) {
            console.warn("Lecture impossible :", error);
            resolve(State.memoryStore.get(`${storeName}:${key}`) ?? null);
          }
        });
      }

      return State.memoryStore.get(`${storeName}:${key}`) ?? null;
    },

    async put(storeName, key, value) {
      State.memoryStore.set(`${storeName}:${key}`, value);

      if (State.dbAvailable && State.db) {
        return new Promise((resolve) => {
          try {
            const transaction = State.db.transaction(storeName, "readwrite");
            transaction.objectStore(storeName).put({
              id: key,
              value
            });

            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => resolve(false);
            transaction.onabort = () => resolve(false);
          } catch (error) {
            console.warn("Écriture impossible :", error);
            resolve(false);
          }
        });
      }

      return false;
    },

    async loadSave() {
      return this.get(CONFIG.saveStore, CONFIG.saveKey);
    },

    async saveGame() {
      const data = {
        version: CONFIG.version,
        savedAt: new Date().toISOString(),
        activeMissionIndex: State.activeMissionIndex,
        activeStepIndex: State.activeStepIndex,
        completedMissions: [...State.completedMissions],
        playerCharacterId: State.playerCharacterId,
        gameStarted: State.gameStarted,
        playerPosition: State.player
          ? {
              x: State.player.position.x,
              y: State.player.position.y,
              z: State.player.position.z
            }
          : null
      };

      const result = await this.put(
        CONFIG.saveStore,
        CONFIG.saveKey,
        data
      );

      try {
        localStorage.setItem(
          "fobas-love-save-fallback",
          JSON.stringify(data)
        );
      } catch (_) {
        // Le stockage local du navigateur peut être indisponible.
      }

      return result;
    },

    async loadSettings() {
      const settings = await this.get(
        CONFIG.settingsStore,
        CONFIG.settingsKey
      );

      if (settings) return settings;

      try {
        const fallback = localStorage.getItem("fobas-love-settings");
        if (fallback) return JSON.parse(fallback);
      } catch (_) {}

      return null;
    },

    async saveSettings(settings) {
      const result = await this.put(
        CONFIG.settingsStore,
        CONFIG.settingsKey,
        settings
      );

      try {
        localStorage.setItem(
          "fobas-love-settings",
          JSON.stringify(settings)
        );
      } catch (_) {}

      return result;
    },

    async restoreFallbackSave() {
      try {
        const raw = localStorage.getItem("fobas-love-save-fallback");
        return raw ? JSON.parse(raw) : null;
      } catch (_) {
        return null;
      }
    }
  };

  /* ==========================================================
     7. AUDIO ET VOIX
  ========================================================== */

  const AudioSystem = {
    context: null,
    masterGain: null,

    initialize() {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      try {
        this.context = new AudioContextClass();
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = State.settings.music ? 0.12 : 0;
        this.masterGain.connect(this.context.destination);
      } catch (error) {
        console.warn("Audio indisponible :", error);
      }
    },

    resume() {
      if (this.context?.state === "suspended") {
        this.context.resume().catch(() => {});
      }
    },

    setMusicEnabled(enabled) {
      if (this.masterGain) {
        this.masterGain.gain.setTargetAtTime(
          enabled ? 0.12 : 0,
          this.context.currentTime,
          0.1
        );
      }
    },

    tone(frequency = 660, duration = 0.12, type = "sine") {
      if (!State.settings.music || !this.context || !this.masterGain) {
        return;
      }

      try {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        const now = this.context.currentTime;

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.16, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        oscillator.connect(gain);
        gain.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + duration + 0.03);
      } catch (_) {}
    },

    success() {
      this.tone(523, 0.11);
      setTimeout(() => this.tone(659, 0.11), 90);
      setTimeout(() => this.tone(784, 0.18), 180);
    },

    click() {
      this.tone(540, 0.055);
    },

    speak(text, characterId = State.playerCharacterId) {
      if (!State.settings.voice || !("speechSynthesis" in window)) {
        Utils.setText(DOM.dialogueVoiceStatus, "Dialogue en français");
        return;
      }

      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(String(text));
        const character = CHARACTERS.find((c) => c.id === characterId);

        utterance.lang = "fr-FR";
        utterance.rate = 0.94;
        utterance.pitch = character?.voicePitch ?? 1;
        utterance.volume = 1;

        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find((voice) =>
          voice.lang?.toLowerCase().startsWith("fr")
        );

        if (frenchVoice) utterance.voice = frenchVoice;

        utterance.onstart = () => {
          Utils.setText(DOM.dialogueVoiceStatus, "Lecture vocale...");
          CharacterSystem.setExpression(characterId, "talking");
        };

        utterance.onend = () => {
          Utils.setText(DOM.dialogueVoiceStatus, "Dialogue en français");
          CharacterSystem.setExpression(characterId, "neutral");
        };

        utterance.onerror = () => {
          Utils.setText(DOM.dialogueVoiceStatus, "Texte affiché");
          CharacterSystem.setExpression(characterId, "neutral");
        };

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.warn("Voix indisponible :", error);
      }
    },

    stopSpeech() {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  /* ==========================================================
     8. INTERFACE — NOTIFICATIONS ET ÉCRANS
  ========================================================== */

  const UI = {
    activeOverlay: null,

    showOnlyScreen(screen) {
      const screens = [
        DOM.loadingScreen,
        DOM.mainMenu,
        DOM.gameScreen,
        DOM.missionsScreen,
        DOM.pauseScreen,
        DOM.settingsScreen,
        DOM.creditsScreen,
        DOM.missionCompleteScreen,
        DOM.endingScreen,
        DOM.confirmationScreen,
        DOM.errorScreen
      ];

      screens.forEach((element) => Utils.hide(element));

      if (screen) Utils.show(screen);

      this.activeOverlay = screen || null;
    },

    notification(message, duration = 2800) {
      if (!DOM.gameNotification) return;

      clearTimeout(State.notificationTimer);
      Utils.setText(DOM.gameNotification, message);
      Utils.show(DOM.gameNotification);

      State.notificationTimer = setTimeout(() => {
        Utils.hide(DOM.gameNotification);
      }, duration);
    },

    setLoading(percent, message) {
      const value = Utils.clamp(percent, 0, 100);

      Utils.setWidth(DOM.loadingProgress, value);
      Utils.setText(DOM.loadingPercent, `${Math.round(value)} %`);

      if (message) Utils.setText(DOM.loadingMessage, message);
    },

    worldLoading(visible, message = "Préparation du monde 3D...") {
      if (DOM.worldLoadingText) {
        Utils.setText(DOM.worldLoadingText, message);
      }

      if (visible) Utils.show(DOM.worldLoadingOverlay);
      else Utils.hide(DOM.worldLoadingOverlay);
    },

    saving(visible) {
      if (visible) Utils.show(DOM.savingIndicator);
      else Utils.hide(DOM.savingIndicator);

      if (DOM.saveStatus) {
        Utils.setText(
          DOM.saveStatus,
          visible ? "Sauvegarde en cours..." : "Sauvegarde locale prête"
        );
      }
    },

    updateMissionHeader() {
      const mission = MISSION_DATA[State.activeMissionIndex];

      if (!mission) return;

      Utils.setText(
        DOM.missionNumber,
        `MISSION ${String(mission.id).padStart(2, "0")} / ${MISSION_DATA.length}`
      );

      Utils.setText(DOM.missionTitle, mission.title);
      this.updateObjective();
    },

    updateObjective() {
      const mission = MISSION_DATA[State.activeMissionIndex];

      if (!mission) return;

      const steps = mission.steps || [];
      const step = steps[State.activeStepIndex];

      if (!step) {
        Utils.setText(DOM.objectiveText, "Mission terminée !");
        Utils.setWidth(DOM.objectiveProgressBar, 100);
        Utils.setText(DOM.objectiveProgressText, `${steps.length} / ${steps.length}`);
        return;
      }

      Utils.setText(DOM.objectiveText, step.text);

      const percent = steps.length
        ? (State.activeStepIndex / steps.length) * 100
        : 0;

      Utils.setWidth(DOM.objectiveProgressBar, percent);
      Utils.setText(
        DOM.objectiveProgressText,
        `${State.activeStepIndex} / ${steps.length}`
      );
    },

    updateMissionsList() {
      if (!DOM.missionsList) return;

      DOM.missionsList.replaceChildren();

      MISSION_DATA.forEach((mission, index) => {
        const completed = State.completedMissions.includes(mission.id);
        const current = index === State.activeMissionIndex;
        const locked = index > State.activeMissionIndex && !completed;

        const item = document.createElement("article");
        item.className = "mission-list-item";
        item.dataset.missionId = String(mission.id);

        if (completed) item.classList.add("mission-completed");
        if (current) item.classList.add("mission-current");
        if (locked) item.classList.add("mission-locked");

        const number = document.createElement("span");
        number.className = "mission-list-number";
        number.textContent = completed ? "✓" : String(mission.id).padStart(2, "0");

        const content = document.createElement("div");
        content.className = "mission-list-content";

        const title = document.createElement("strong");
        title.textContent = mission.title;

        const description = document.createElement("p");
        description.textContent = mission.description;

        const location = document.createElement("small");
        location.textContent = mission.location;

        content.append(title, description, location);

        const status = document.createElement("span");
        status.className = "mission-list-status";
        status.textContent = completed
          ? "Terminée"
          : current
            ? "En cours"
            : locked
              ? "Verrouillée"
              : "Disponible";

        item.append(number, content, status);

        if (!locked) {
          item.tabIndex = 0;
          item.setAttribute("role", "button");

          const activate = () => {
            this.closeMissions();

            if (!completed) {
              Game.startMission(index);
            } else {
              this.notification("Cette mission est déjà terminée.");
            }
          };

          item.addEventListener("click", activate);
          item.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              activate();
            }
          });
        }

        DOM.missionsList.appendChild(item);
      });

      const completedCount = State.completedMissions.length;
      const total = MISSION_DATA.length;
      const percent = total ? completedCount / total * 100 : 0;

      Utils.setText(
        DOM.missionsSummary,
        `${completedCount} mission${completedCount > 1 ? "s" : ""} terminée${completedCount > 1 ? "s" : ""}`
      );

      Utils.setWidth(DOM.overallProgressBar, percent);
    },

    openMissions() {
      if (State.dialogueOpen) Dialogue.close();

      State.paused = true;
      AudioSystem.stopSpeech();
      this.updateMissionsList();
      Utils.show(DOM.missionsScreen);
    },

    closeMissions() {
      Utils.hide(DOM.missionsScreen);

      if (State.gameStarted && !State.ending) {
        State.paused = false;
      }
    },

    openPause() {
      if (!State.gameStarted || State.ending) return;

      State.paused = true;
      Dialogue.close();
      AudioSystem.stopSpeech();
      Utils.show(DOM.pauseScreen);
    },

    closePause() {
      Utils.hide(DOM.pauseScreen);
      State.paused = false;
    },

    openSettings() {
      this.populateSettings();
      Utils.show(DOM.settingsScreen);
    },

    closeSettings() {
      Utils.hide(DOM.settingsScreen);
    },

    populateSettings() {
      if (DOM.voiceEnabled) DOM.voiceEnabled.checked = State.settings.voice;
      if (DOM.musicEnabled) DOM.musicEnabled.checked = State.settings.music;
      if (DOM.subtitlesEnabled) DOM.subtitlesEnabled.checked = State.settings.subtitles;
      if (DOM.qualitySelect) DOM.qualitySelect.value = State.settings.quality;
      if (DOM.sensitivityRange) DOM.sensitivityRange.value = String(State.settings.sensitivity);
    },

    async saveSettingsFromForm() {
      State.settings.voice = Boolean(DOM.voiceEnabled?.checked);
      State.settings.music = Boolean(DOM.musicEnabled?.checked);
      State.settings.subtitles = Boolean(DOM.subtitlesEnabled?.checked);

      State.settings.quality = DOM.qualitySelect?.value || "medium";
      State.settings.sensitivity = Utils.clamp(
        Utils.safeNumber(DOM.sensitivityRange?.value, 1),
        0.5,
        2
      );

      AudioSystem.setMusicEnabled(State.settings.music);
      Game.applyGraphicsQuality();

      await Storage.saveSettings(State.settings);

      this.closeSettings();
      this.notification("Paramètres enregistrés.");
    },

    showMissionComplete(mission) {
      State.paused = true;

      Utils.setText(
        DOM.completionTitle,
        `Mission ${mission.id} accomplie !`
      );

      Utils.setText(
        DOM.completionMessage,
        `${mission.description} ${mission.reward ? "Récompense : " + mission.reward + "." : ""}`
      );

      Utils.setText(
        DOM.completionProgress,
        `${State.completedMissions.length} / ${MISSION_DATA.length}`
      );

      Utils.setText(
        DOM.nextMissionButton,
        State.activeMissionIndex >= MISSION_DATA.length - 1
          ? "Terminer l'aventure →"
          : "Mission suivante →"
      );

      Utils.show(DOM.missionCompleteScreen);
      AudioSystem.success();
    },

    showEnding() {
      State.ending = true;
      State.paused = true;
      State.gameStarted = false;

      Utils.hide(DOM.gameScreen);
      Utils.hide(DOM.missionCompleteScreen);
      Utils.show(DOM.endingScreen);

      AudioSystem.success();
      Storage.saveGame();
    },

    showError(title, message) {
      Utils.setText(DOM.errorTitle, title);
      Utils.setText(DOM.errorMessage, message);
      this.showOnlyScreen(DOM.errorScreen);
    },

    confirm(title, message, callback) {
      Utils.setText(DOM.confirmationTitle, title);
      Utils.setText(DOM.confirmationMessage, message);
      State.confirmationCallback = callback;
      Utils.show(DOM.confirmationScreen);
    },

    closeConfirmation(accepted) {
      const callback = State.confirmationCallback;
      State.confirmationCallback = null;

      Utils.hide(DOM.confirmationScreen);

      if (accepted && typeof callback === "function") {
        callback();
      }
    }
  };

  /* ==========================================================
     9. PERSONNAGES 3D

     Les personnages sont construits avec des meshes Babylon.js.
     Ils sont stylisés : ce ne sont pas des modèles humains
     photoréalistes importés.
  ========================================================== */

  const CharacterSystem = {
    buildCharacter(character, scene, name, isPlayer = false) {
      const root = new BABYLON.TransformNode(
        `character-${name}-${Date.now()}-${Math.random()}`,
        scene
      );

      const material = (matName, hex, roughness = 0.75) => {
        const mat = new BABYLON.StandardMaterial(matName, scene);
        mat.diffuseColor = Utils.color3(hex);
        mat.specularColor = new BABYLON.Color3(0.22, 0.22, 0.22);
        mat.roughness = roughness;
        return mat;
      };

      const skinMat = material(`${name}-skin`, character.skin);
      const hairMat = material(`${name}-hair`, character.hair);
      const outfitMat = material(`${name}-outfit`, character.outfit);
      const pantsMat = material(`${name}-pants`, character.pants);
      const accentMat = material(`${name}-accent`, character.accent);
      const shoeMat = material(`${name}-shoes`, "#29232B");
      const eyeMat = material(`${name}-eyes`, "#211A20");
      const whiteMat = material(`${name}-eye-white`, "#FFF8EE");
      const mouthMat = material(`${name}-mouth`, "#713D43");

      const parts = [];
      const limbs = {};

      const sphere = (partName, diameter, mat, x, y, z, scale = null) => {
        const mesh = BABYLON.MeshBuilder.CreateSphere(
          `${name}-${partName}`,
          { diameter, segments: 16 },
          scene
        );

        mesh.material = mat;
        mesh.position.set(x, y, z);
        mesh.parent = root;

        if (scale) mesh.scaling.set(scale.x, scale.y, scale.z);

        parts.push(mesh);
        return mesh;
      };

      const box = (partName, width, height, depth, mat, x, y, z) => {
        const mesh = BABYLON.MeshBuilder.CreateBox(
          `${name}-${partName}`,
          { width, height, depth },
          scene
        );

        mesh.material = mat;
        mesh.position.set(x, y, z);
        mesh.parent = root;

        parts.push(mesh);
        return mesh;
      };

      const cylinder = (partName, diameterTop, diameterBottom, height, mat, x, y, z) => {
        const mesh = BABYLON.MeshBuilder.CreateCylinder(
          `${name}-${partName}`,
          {
            diameterTop,
            diameterBottom,
            height,
            tessellation: 16
          },
          scene
        );

        mesh.material = mat;
        mesh.position.set(x, y, z);
        mesh.parent = root;

        parts.push(mesh);
        return mesh;
      };

      // Jambes
      limbs.leftLeg = box(
        "left-leg", 0.19, 0.66, 0.23, pantsMat,
        -0.16, 0.47, 0
      );

      limbs.rightLeg = box(
        "right-leg", 0.19, 0.66, 0.23, pantsMat,
        0.16, 0.47, 0
      );

      // Chaussures
      limbs.leftFoot = box(
        "left-foot", 0.22, 0.14, 0.34, shoeMat,
        -0.16, 0.12, 0.035
      );

      limbs.rightFoot = box(
        "right-foot", 0.22, 0.14, 0.34, shoeMat,
        0.16, 0.12, 0.035
      );

      // Corps
      const torso = BABYLON.MeshBuilder.CreateCylinder(
        `${name}-torso`,
        {
          height: 0.79,
          diameterTop: 0.55,
          diameterBottom: 0.39,
          tessellation: 18
        },
        scene
      );

      torso.position.y = 1.23;
      torso.material = outfitMat;
      torso.parent = root;
      parts.push(torso);

      // Col
      cylinder("neck", 0.16, 0.16, 0.18, skinMat, 0, 1.68, 0);

      // Tête
      const head = sphere(
        "head", 0.61, skinMat, 0, 2.02, 0,
        { x: 0.82, y: 1, z: 0.78 }
      );

      // Cheveux
      const hair = sphere(
        "hair-cap", 0.65, hairMat, 0, 2.19, -0.025,
        { x: 0.88, y: 0.58, z: 0.83 }
      );

      // Mèche frontale
      sphere(
        "hair-front", 0.27, hairMat, 0, 2.2, 0.225,
        { x: 1.7, y: 0.45, z: 0.45 }
      );

      // Yeux
      sphere(
        "left-eye-white", 0.105, whiteMat, -0.12, 2.05, 0.232,
        { x: 1, y: 0.8, z: 0.6 }
      );

      sphere(
        "right-eye-white", 0.105, whiteMat, 0.12, 2.05, 0.232,
        { x: 1, y: 0.8, z: 0.6 }
      );

      sphere(
        "left-eye", 0.055, eyeMat, -0.12, 2.045, 0.273
      );

      sphere(
        "right-eye", 0.055, eyeMat, 0.12, 2.045, 0.273
      );

      // Nez et bouche
      sphere(
        "nose", 0.075, skinMat, 0, 1.97, 0.28,
        { x: 0.8, y: 1, z: 0.65 }
      );

      const mouth = box(
        "mouth", 0.13, 0.025, 0.025,
        mouthMat, 0, 1.89, 0.258
      );

      // Bras
      limbs.leftArm = cylinder(
        "left-arm", 0.17, 0.15, 0.68,
        skinMat, -0.39, 1.28, 0
      );

      limbs.rightArm = cylinder(
        "right-arm", 0.17, 0.15, 0.68,
        skinMat, 0.39, 1.28, 0
      );

      limbs.leftArm.rotation.z = -0.1;
      limbs.rightArm.rotation.z = 0.1;

      // Mains
      sphere("left-hand", 0.17, skinMat, -0.4, 0.9, 0);
      sphere("right-hand", 0.17, skinMat, 0.4, 0.9, 0);

      // Accessoire décoratif
      if (character.gender === "féminin") {
        sphere(
          "hair-side-left", 0.2, hairMat, -0.25, 1.99, -0.015,
          { x: 0.8, y: 1.3, z: 0.8 }
        );

        sphere(
          "hair-side-right", 0.2, hairMat, 0.25, 1.99, -0.015,
          { x: 0.8, y: 1.3, z: 0.8 }
        );
      } else {
        // Col et petit détail vestimentaire
        const collar = box(
          "collar", 0.23, 0.12, 0.07,
          accentMat, 0, 1.57, 0.24
        );
        collar.rotation.x = -0.2;
      }

      root.position.y = 0;
      root.rotation.y = Math.PI;

      return {
        id: character.id,
        character,
        root,
        parts,
        limbs,
        head,
        hair,
        mouth,
        isPlayer,
        expression: "neutral",
        animationTime: Math.random() * 5,
        baseY: 0
      };
    },

    setExpression(characterId, expression) {
      const visual = State.npcs.find(
        (npc) => npc.id === characterId
      )?.visual;

      if (!visual) return;

      visual.expression = expression;

      if (visual.mouth && !visual.mouth.isDisposed()) {
        visual.mouth.scaling.y = expression === "talking" ? 2.5 : 1;
      }
    },

    getCharacter(characterId) {
      return CHARACTERS.find((character) => character.id === characterId)
        || CHARACTERS[0];
    },

    getNPC(characterId) {
      return State.npcs.find((npc) => npc.id === characterId) || null;
    },

    choosePlayer(characterId) {
      const character = this.getCharacter(characterId);

      State.playerCharacterId = character.id;

      if (State.scene && State.player) {
        const oldPosition = State.player.position.clone();
        const oldRotation = State.player.rotation.y;

        if (State.playerVisual?.root) {
          State.playerVisual.root.dispose(false, true);
        }

        State.playerVisual = this.buildCharacter(
          character,
          State.scene,
          "player",
          true
        );

        State.playerVisual.root.position.copyFrom(oldPosition);
        State.playerVisual.root.rotation.y = oldRotation;
        State.player = State.playerVisual.root;
      }

      this.updateCharacterButton();
      Storage.saveGame();
    },

    updateCharacterButton() {
      let button = $("characterSelectButton");

      if (!button && DOM.gameTopBar) {
        button = document.createElement("button");
        button.id = "characterSelectButton";
        button.type = "button";
        button.className = "game-icon-button";
        button.title = "Changer de personnage";
        button.setAttribute("aria-label", "Changer de personnage");
        button.textContent = "♙";

        DOM.gameTopBar.insertBefore(
          button,
          DOM.gameTopBar.lastElementChild
        );

        button.addEventListener("click", () => {
          this.openSelector();
        });
      }

      if (button) {
        const character = this.getCharacter(State.playerCharacterId);
        button.title = `Personnage : ${character.name}`;
      }
    },

    openSelector() {
      let panel = $("characterSelectorPanel");

      if (!panel) {
        panel = document.createElement("section");
        panel.id = "characterSelectorPanel";
        panel.className = "character-selector-panel";
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-label", "Choisir un personnage");

        const heading = document.createElement("h2");
        heading.textContent = "Choisissez votre personnage";

        const description = document.createElement("p");
        description.textContent =
          "Votre choix modifie l'apparence du personnage principal.";

        const grid = document.createElement("div");
        grid.className = "character-selector-grid";
        grid.id = "characterSelectorGrid";

        const close = document.createElement("button");
        close.type = "button";
        close.className = "secondary-button";
        close.textContent = "Fermer";
        close.addEventListener("click", () => {
          Utils.hide(panel);
          State.paused = false;
        });

        panel.append(heading, description, grid, close);
        DOM.gameWorld.appendChild(panel);
      }

      const grid = $("characterSelectorGrid");
      grid.replaceChildren();

      CHARACTERS.forEach((character) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "character-choice-card";

        if (character.id === State.playerCharacterId) {
          button.classList.add("selected");
        }

        const avatar = document.createElement("span");
        avatar.className = "character-choice-avatar";
        avatar.textContent = character.avatar;

        const name = document.createElement("strong");
        name.textContent = character.name;

        const description = document.createElement("small");
        description.textContent = character.description;

        button.append(avatar, name, description);

        button.addEventListener("click", () => {
          this.choosePlayer(character.id);
          Utils.hide(panel);
          State.paused = false;
          UI.notification(`${character.name} est maintenant votre personnage.`);
        });

        grid.appendChild(button);
      });

      State.paused = true;
      Utils.show(panel);
    },

    animate(visual, delta, moving, running) {
      if (!visual) return;

      visual.animationTime += delta;

      const t = visual.animationTime;
      const limbs = visual.limbs;

      if (moving) {
        const speed = running ? 13 : 8;
        const swing = Math.sin(t * speed) * 0.48;

        limbs.leftLeg.rotation.x = swing;
        limbs.rightLeg.rotation.x = -swing;
        limbs.leftArm.rotation.x = -swing * 0.75;
        limbs.rightArm.rotation.x = swing * 0.75;

        visual.root.position.y =
          visual.baseY + Math.abs(Math.sin(t * speed * 2)) * 0.035;
      } else {
        limbs.leftLeg.rotation.x *= 0.82;
        limbs.rightLeg.rotation.x *= 0.82;
        limbs.leftArm.rotation.x *= 0.82;
        limbs.rightArm.rotation.x *= 0.82;

        visual.root.position.y =
          visual.baseY + Math.sin(t * 1.7) * 0.012;
      }
    }
  };

  /* ==========================================================
     10. MONDE 3D — DÉCORS PROCÉDURAUX
  ========================================================== */

  const World = {
    sceneMaterials: [],
    ground: null,

    createMaterial(name, hex, roughness = 0.85) {
      const material = new BABYLON.StandardMaterial(name, State.scene);
      material.diffuseColor = Utils.color3(hex);
      material.specularColor = new BABYLON.Color3(0.12, 0.12, 0.12);
      material.roughness = roughness;
      this.sceneMaterials.push(material);
      return material;
    },

    makeBox(name, x, y, z, width, height, depth, material, options = {}) {
      const mesh = BABYLON.MeshBuilder.CreateBox(
        name,
        { width, height, depth },
        State.scene
      );

      mesh.position.set(x, y, z);
      mesh.material = material;

      if (options.rotationY) mesh.rotation.y = options.rotationY;
      if (options.rotationX) mesh.rotation.x = options.rotationX;
      if (options.scaling) mesh.scaling.copyFrom(options.scaling);

      mesh.isPickable = options.pickable !== false;
      State.worldObjects.push(mesh);

      return mesh;
    },

    makeSphere(name, x, y, z, diameter, material, scaling = null) {
      const mesh = BABYLON.MeshBuilder.CreateSphere(
        name,
        { diameter, segments: 12 },
        State.scene
      );

      mesh.position.set(x, y, z);
      mesh.material = material;

      if (scaling) mesh.scaling.copyFrom(scaling);

      State.worldObjects.push(mesh);
      return mesh;
    },

    makeCylinder(name, x, y, z, diameter, height, material) {
      const mesh = BABYLON.MeshBuilder.CreateCylinder(
        name,
        { diameter, height, tessellation: 16 },
        State.scene
      );

      mesh.position.set(x, y, z);
      mesh.material = material;

      State.worldObjects.push(mesh);
      return mesh;
    },

    makeTree(x, z, scale = 1) {
      const trunk = this.createMaterial("tree-trunk-" + Math.random(), "#76513A");
      const leaves = this.createMaterial("tree-leaves-" + Math.random(), "#3D8055");

      this.makeCylinder(
        "tree-trunk", x, 1.1 * scale, z,
        0.35 * scale, 2.2 * scale, trunk
      );

      this.makeSphere(
        "tree-crown", x, 2.5 * scale, z,
        2.1 * scale, leaves,
        new BABYLON.Vector3(1, 1.1, 1)
      );
    },

    makePalm(x, z, scale = 1) {
      const trunkMat = this.createMaterial("palm-trunk-" + Math.random(), "#99724B");
      const leafMat = this.createMaterial("palm-leaves-" + Math.random(), "#37875D");

      this.makeCylinder(
        "palm-trunk", x, 2.2 * scale, z,
        0.32 * scale, 4.4 * scale, trunkMat
      );

      for (let i = 0; i < 6; i++) {
        const angle = i / 6 * Math.PI * 2;

        const leaf = this.makeBox(
          "palm-leaf",
          x + Math.cos(angle) * 1.2 * scale,
          4.1 * scale,
          z + Math.sin(angle) * 1.2 * scale,
          2.6 * scale,
          0.13 * scale,
          0.45 * scale,
          leafMat
        );

        leaf.rotation.y = -angle;
        leaf.rotation.z = Math.sin(angle) * 0.25;
      }
    },

    makeFlower(x, z, petalColor = "#EFA7CB") {
      const stem = this.createMaterial("flower-stem-" + Math.random(), "#34744A");
      const petals = this.createMaterial("flower-petals-" + Math.random(), petalColor);
      const center = this.createMaterial("flower-center-" + Math.random(), "#F5D578");

      this.makeCylinder("flower-stem", x, 0.25, z, 0.045, 0.5, stem);
      this.makeSphere("flower-head", x, 0.55, z, 0.22, petals);
      this.makeSphere("flower-center", x, 0.56, z, 0.09, center);
    },

    makeBench(x, z) {
      const wood = this.createMaterial("bench-wood-" + Math.random(), "#A7754B");
      const dark = this.createMaterial("bench-support-" + Math.random(), "#46382D");

      this.makeBox("bench-seat", x, 0.55, z, 2.1, 0.17, 0.65, wood);
      this.makeBox("bench-back", x, 0.92, z - 0.27, 2.1, 0.68, 0.13, wood);
      this.makeBox("bench-leg-a", x - 0.75, 0.28, z, 0.14, 0.55, 0.14, dark);
      this.makeBox("bench-leg-b", x + 0.75, 0.28, z, 0.14, 0.55, 0.14, dark);
    },

    makeBuilding(x, z, color = "#F2D7B6") {
      const wall = this.createMaterial("house-wall-" + Math.random(), color);
      const roof = this.createMaterial("house-roof-" + Math.random(), "#774B54");
      const door = this.createMaterial("house-door-" + Math.random(), "#513B36");
      const windowMat = this.createMaterial("house-window-" + Math.random(), "#A8DDE9");

      this.makeBox("house-wall", x, 2, z, 7, 4, 5, wall);
      this.makeBox("house-roof", x, 4.35, z, 8, 0.55, 6, roof);

      this.makeBox("house-door", x, 1.1, z - 2.56, 1.25, 2.2, 0.15, door);
      this.makeBox("house-window-left", x - 2.1, 2.4, z - 2.56, 1.1, 1, 0.12, windowMat);
      this.makeBox("house-window-right", x + 2.1, 2.4, z - 2.56, 1.1, 1, 0.12, windowMat);
    },

    makeLamp(x, z) {
      const pole = this.createMaterial("lamp-pole-" + Math.random(), "#4B4853");
      const bulb = this.createMaterial("lamp-bulb-" + Math.random(), "#FFE6A2");

      this.makeCylinder("lamp-pole", x, 1.8, z, 0.13, 3.6, pole);
      this.makeBox("lamp-head", x, 3.6, z, 0.9, 0.15, 0.45, pole);
      this.makeSphere("lamp-light", x, 3.45, z, 0.28, bulb);
    },

    makeWater() {
      const water = this.createMaterial("water-material", "#328DAA", 0.35);
      water.alpha = 0.83;

      this.makeBox(
        "water-surface",
        0, -0.12, 19,
        45, 0.12, 18,
        water,
        { pickable: false }
      );
    },

    clearWorldObjects() {
      State.worldObjects.forEach((mesh) => {
        if (mesh && !mesh.isDisposed()) mesh.dispose(false, false);
      });

      State.worldObjects = [];

      this.sceneMaterials.forEach((material) => {
        if (material && !material.isDisposed()) material.dispose();
      });

      this.sceneMaterials = [];
    },

    createEnvironment(landscape) {
      this.clearWorldObjects();

      const scene = State.scene;

      const skyColors = {
        garden: ["#A9D9EF", "#E6F4FA"],
        park: ["#A6D5EF", "#EAF4F9"],
        cafe: ["#A8D5E8", "#F6E7DA"],
        house: ["#9BC6E5", "#E8E9F0"],
        restaurant: ["#1D2849", "#584267"],
        market: ["#A5D8EB", "#F4E1C8"],
        coast: ["#7EC7EA", "#D6F0F6"],
        beach: ["#F2A77D", "#F9D9AD"],
        lighthouse: ["#84BCE0", "#E4EAF3"],
        festival: ["#27264E", "#81537E"],
        station: ["#A7CBE4", "#DDE5EF"],
        village: ["#A8D6E7", "#F2E9D3"],
        mountain: ["#91B9D9", "#DCE9F3"],
        camp: ["#111A3B", "#433D6E"],
        balcony: ["#E9A58C", "#F5D8C7"],
        countryside: ["#9ACDE4", "#E7F1DA"],
        harbor: ["#82BCE1", "#DAEDF7"],
        city: ["#1B2346", "#5D4776"],
        workshop: ["#A8CBE2", "#EEE3D7"],
        grandfinale: ["#E9A8C4", "#F6DFD5"]
      };

      const colors = skyColors[landscape] || skyColors.garden;

      scene.clearColor = BABYLON.Color4.FromHexString(
        colors[0] + "FF"
      );

      const groundColors = {
        beach: "#E7C88B",
        coast: "#D9C68B",
        harbor: "#B6C5A4",
        mountain: "#718B68",
        countryside: "#7BA96A",
        camp: "#4C6B54",
        city: "#777985",
        station: "#A2A1A5",
        house: "#BBAA8B",
        restaurant: "#655C72",
        workshop: "#A89B8D",
        market: "#C4AD82"
      };

      const groundColor = groundColors[landscape] || "#668C66";

      const groundMat = this.createMaterial("ground-material", groundColor);
      this.ground = BABYLON.MeshBuilder.CreateGround(
        "love-world-ground",
        { width: 150, height: 150, subdivisions: 2 },
        scene
      );

      this.ground.material = groundMat;
      this.ground.isPickable = false;

      const roadMat = this.createMaterial("path-material", "#D8C4A5");
      const path = this.makeBox(
        "central-path", 0, 0.012, 5,
        5, 0.025, 38, roadMat,
        { pickable: false }
      );

      path.isPickable = false;

      if (["beach", "coast", "harbor", "lighthouse"].includes(landscape)) {
        this.makeWater();

        const sandMat = this.createMaterial("sand-material", "#E8D2A1");
        this.makeBox(
          "beach-sand", 0, 0.015, 12,
          48, 0.025, 17, sandMat,
          { pickable: false }
        );

        for (let i = 0; i < 7; i++) {
          this.makePalm(-17 + i * 5.5, 3 + (i % 2) * 4, 0.75 + Math.random() * 0.3);
        }
      }

      if (["garden", "park", "countryside", "village", "grandfinale"].includes(landscape)) {
        for (let i = 0; i < 20; i++) {
          const x = Utils.random(-23, 23);
          const z = Utils.random(-15, 24);

          if (Math.abs(x) < 5 && z < 13) continue;

          this.makeTree(x, z, Utils.random(0.65, 1.1));
        }

        for (let i = 0; i < 55; i++) {
          this.makeFlower(
            Utils.random(-16, 16),
            Utils.random(-8, 18),
            ["#EFA7CB", "#F6DB85", "#E9EEF4", "#B9A0EA"][i % 4]
          );
        }

        this.makeBench(-5, 4);
        this.makeBench(7, 10);
      }

      if (["house", "cafe", "restaurant", "workshop"].includes(landscape)) {
        this.makeBuilding(0, 16, "#F0D8BB");
        this.makeBench(-5, 6);
      }

      if (landscape === "market") {
        const stallColors = ["#D76F73", "#D7B85D", "#5F9D94", "#A17BC2"];

        for (let i = 0; i < 4; i++) {
          const x = -9 + i * 6;

          const stallMat = this.createMaterial(
            "market-stall-" + i,
            stallColors[i]
          );

          this.makeBox("market-table", x, 1, 8, 3.4, 0.25, 1.7, stallMat);
          this.makeBox("market-awning", x, 2.4, 8, 3.8, 0.2, 2.1, stallMat);
          this.makeBox("market-post-a", x - 1.5, 1.7, 7.3, 0.1, 1.4, 0.1, stallMat);
          this.makeBox("market-post-b", x + 1.5, 1.7, 7.3, 0.1, 1.4, 0.1, stallMat);
        }
      }

      if (landscape === "lighthouse") {
        const tower = this.createMaterial("lighthouse-wall", "#EAE7DF");
        const red = this.createMaterial("lighthouse-red", "#BD5E66");

        this.makeCylinder("lighthouse-tower", 0, 5, 17, 4, 10, tower);
        this.makeCylinder("lighthouse-cap", 0, 10.2, 17, 3.1, 0.7, red);
        this.makeSphere("lighthouse-light", 0, 10.8, 17, 0.7, this.createMaterial("light", "#FFF3B2"));
      }

      if (landscape === "mountain") {
        const mountainColors = ["#718B7A", "#829B8B", "#8FA69A"];

        for (let i = 0; i < 7; i++) {
          const mat = this.createMaterial(
            "mountain-" + i,
            mountainColors[i % mountainColors.length]
          );

          const mountain = BABYLON.MeshBuilder.CreateCylinder(
            "distant-mountain-" + i,
            {
              diameterTop: 0,
              diameterBottom: Utils.random(12, 20),
              height: Utils.random(12, 24),
              tessellation: 4
            },
            scene
          );

          mountain.position.set(-35 + i * 12, 6, 35 + Math.random() * 8);
          mountain.material = mat;
          State.worldObjects.push(mountain);
        }
      }

      if (["city", "festival", "station", "grandfinale"].includes(landscape)) {
        for (let i = 0; i < 8; i++) {
          const x = -23 + i * 6.5;
          const h = Utils.random(5, 13);
          const buildingMat = this.createMaterial(
            "distant-building-" + i,
            ["#69677F", "#8A748A", "#5B7188", "#B08D85"][i % 4]
          );

          this.makeBox(
            "distant-building",
            x, h / 2, 33,
            Utils.random(4, 6), h, 3,
            buildingMat,
            { pickable: false }
          );
        }

        for (let i = 0; i < 7; i++) {
          this.makeLamp(-12 + i * 4, 4);
        }
      }

      if (landscape === "camp") {
        const tentMat = this.createMaterial("tent-fabric", "#C77E65");
        const tent = BABYLON.MeshBuilder.CreateCylinder(
          "camp-tent",
          {
            diameterTop: 0,
            diameterBottom: 5,
            height: 3.3,
            tessellation: 4
          },
          scene
        );

        tent.position.set(-7, 1.65, 8);
        tent.rotation.y = Math.PI / 4;
        tent.material = tentMat;
        State.worldObjects.push(tent);

        const fireMat = this.createMaterial("campfire-glow", "#F5A447");
        this.makeSphere("campfire", 4, 0.5, 8, 1.1, fireMat);
      }

      if (landscape === "balcony") {
        const stone = this.createMaterial("balcony-stone", "#D8B8AC");
        const rail = this.createMaterial("balcony-rail", "#EEE1D9");

        this.makeBox("balcony-floor", 0, 0.15, 11, 18, 0.3, 8, stone);
        this.makeBox("balcony-front-rail", 0, 0.8, 7, 18, 0.85, 0.18, rail);
        this.makeBox("balcony-left-rail", -9, 0.8, 11, 0.18, 0.85, 8, rail);
        this.makeBox("balcony-right-rail", 9, 0.8, 11, 0.18, 0.85, 8, rail);
      }

      if (landscape === "grandfinale") {
        const gold = this.createMaterial("finale-gold", "#E8C47A");

        for (let i = 0; i < 3; i++) {
          this.makeCylinder(
            "finale-pedestal",
            -6 + i * 6,
            0.45,
            7,
            1.5,
            0.9,
            gold
          );
        }
      }

      // Repères visuels au loin
      const horizonMat = this.createMaterial("horizon", colors[1]);
      const horizon = this.makeBox(
        "horizon-backdrop", 0, 8, 48,
        120, 18, 0.8,
        horizonMat,
        { pickable: false }
      );

      horizon.isPickable = false;

      this.addTargetMarker();
    },

    addTargetMarker() {
      const mat = this.createMaterial("target-marker-material", "#F6D18B");

      const marker = BABYLON.MeshBuilder.CreateTorus(
        "target-marker",
        { diameter: 1.5, thickness: 0.1, tessellation: 32 },
        State.scene
      );

      marker.position.set(0, 0.08, 8);
      marker.rotation.x = Math.PI / 2;
      marker.material = mat;
      marker.isPickable = false;

      State.worldObjects.push(marker);
      State.targetMarker = marker;
    },

    updateTargetMarker(position) {
      if (!State.targetMarker || State.targetMarker.isDisposed()) return;

      State.targetMarker.position.x = position.x;
      State.targetMarker.position.z = position.z;
    }
  };

  /* ==========================================================
     11. PERSONNAGES NON JOUEURS
  ========================================================== */

  const NPCSystem = {
    spawnNPCs() {
      State.npcs.forEach((npc) => {
        if (npc.visual?.root && !npc.visual.root.isDisposed()) {
          npc.visual.root.dispose(false, true);
        }
      });

      State.npcs = [];

      const roster = CHARACTERS.filter(
        (character) => character.id !== State.playerCharacterId
      );

      const positions = [
        { x: 3, z: 8 },
        { x: -5, z: 10 },
        { x: 8, z: 5 },
        { x: -9, z: 4 },
        { x: 5, z: 14 }
      ];

      roster.forEach((character, index) => {
        const visual = CharacterSystem.buildCharacter(
          character,
          State.scene,
          `npc-${character.id}`,
          false
        );

        const position = positions[index % positions.length];

        visual.root.position.set(position.x, 0, position.z);
        visual.root.rotation.y = Math.atan2(
          -position.x,
          -position.z
        );

        State.npcs.push({
          id: character.id,
          name: character.name,
          character,
          visual,
          position: { x: position.x, z: position.z },
          basePosition: { x: position.x, z: position.z },
          active: true,
          movementPhase: Math.random() * Math.PI * 2
        });
      });
    },

    placeNPCForStep(step) {
      if (!step?.npc) return;

      const npc = CharacterSystem.getNPC(step.npc);

      if (!npc || !npc.visual?.root) return;

      if (step.target) {
        npc.visual.root.position.x = step.target.x + 1.3;
        npc.visual.root.position.z = step.target.z + 0.5;
      }

      npc.visual.root.rotation.y = Math.atan2(
        State.player.position.x - npc.visual.root.position.x,
        State.player.position.z - npc.visual.root.position.z
      );
    },

    nearestNPC(maxDistance = CONFIG.interactionDistance) {
      if (!State.player) return null;

      let nearest = null;
      let nearestDistance = maxDistance;

      State.npcs.forEach((npc) => {
        if (!npc.active || !npc.visual?.root) return;

        const distance = Utils.distance2D(
          State.player.position,
          npc.visual.root.position
        );

        if (distance < nearestDistance) {
          nearest = npc;
          nearestDistance = distance;
        }
      });

      return nearest
        ? { npc: nearest, distance: nearestDistance }
        : null;
    },

    update(delta) {
      State.npcs.forEach((npc) => {
        if (!npc.visual?.root) return;

        const t = performance.now() * 0.001 + npc.movementPhase;

        if (npc.id !== State.currentTarget?.npc?.id) {
          npc.visual.root.position.y = Math.sin(t * 1.2) * 0.015;
        }

        CharacterSystem.animate(npc.visual, delta, false, false);
      });
    }
  };

  /* ==========================================================
     12. CAMÉRA ET MOUVEMENTS
  ========================================================== */

  const Controls = {
    setupCamera() {
      const camera = new BABYLON.ArcRotateCamera(
        "love-camera",
        -Math.PI / 2,
        1.12,
        12,
        new BABYLON.Vector3(0, 1.2, 0),
        State.scene
      );

      camera.lowerRadiusLimit = 4.5;
      camera.upperRadiusLimit = 25;
      camera.lowerBetaLimit = 0.38;
      camera.upperBetaLimit = 1.47;
      camera.wheelPrecision = 35;
      camera.panningSensibility = 0;
      camera.inertia = 0.82;
      camera.attachControl(DOM.canvas, true);

      // Le contrôle de la caméra est géré explicitement
      // pour assurer le support du glissement et du pincement.
      camera.detachControl();

      camera.inputs.clear();
      camera.fov = 0.8;
      camera.minZ = 0.1;
      camera.maxZ = 400;

      State.camera = camera;
    },

    updateCamera() {
      if (!State.camera || !State.player) return;

      const target = State.player.position.clone();
      target.y += 1.05;

      State.camera.setTarget(target);

      const desiredAlpha = State.player.rotation.y + Math.PI;
      State.camera.alpha +=
        (desiredAlpha - State.camera.alpha) * 0.025;
    },

    setupTouchControls() {
      const canvas = DOM.canvas;

      if (canvas) {
        canvas.style.touchAction = "none";

        canvas.addEventListener("pointerdown", (event) => {
          State.activePointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY
          });

          if (State.activePointers.size === 1) {
            State.cameraPointerId = event.pointerId;
            State.cameraPointerLast = {
              x: event.clientX,
              y: event.clientY
            };
          }

          if (State.activePointers.size === 2) {
            const points = [...State.activePointers.values()];
            State.pinchDistance = Math.hypot(
              points[1].x - points[0].x,
              points[1].y - points[0].y
            );
          }

          try {
            canvas.setPointerCapture(event.pointerId);
          } catch (_) {}
        });

        canvas.addEventListener("pointermove", (event) => {
          if (!State.activePointers.has(event.pointerId)) return;

          State.activePointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY
          });

          if (State.activePointers.size >= 2) {
            const points = [...State.activePointers.values()];
            const distance = Math.hypot(
              points[1].x - points[0].x,
              points[1].y - points[0].y
            );

            if (State.pinchDistance > 0 && State.camera) {
              const delta = State.pinchDistance - distance;

              State.camera.radius = Utils.clamp(
                State.camera.radius + delta * 0.035,
                4.5,
                25
              );
            }

            State.pinchDistance = distance;
            return;
          }

          if (
            event.pointerId === State.cameraPointerId &&
            !State.paused &&
            !State.dialogueOpen
          ) {
            const dx = event.clientX - State.cameraPointerLast.x;
            const dy = event.clientY - State.cameraPointerLast.y;

            State.camera.alpha -=
              dx * 0.004 * State.settings.sensitivity;

            State.camera.beta = Utils.clamp(
              State.camera.beta +
                dy * 0.003 * State.settings.sensitivity,
              0.38,
              1.47
            );

            State.cameraPointerLast = {
              x: event.clientX,
              y: event.clientY
            };
          }
        });

        const releasePointer = (event) => {
          State.activePointers.delete(event.pointerId);

          if (State.cameraPointerId === event.pointerId) {
            State.cameraPointerId = null;
          }

          if (State.activePointers.size < 2) {
            State.pinchDistance = 0;
          }
        };

        canvas.addEventListener("pointerup", releasePointer);
        canvas.addEventListener("pointercancel", releasePointer);
        canvas.addEventListener("lostpointercapture", releasePointer);

        canvas.addEventListener("wheel", (event) => {
          if (!State.camera) return;

          State.camera.radius = Utils.clamp(
            State.camera.radius + Math.sign(event.deltaY) * 0.7,
            4.5,
            25
          );
        }, { passive: true });
      }

      if (DOM.joystickBase) {
        DOM.joystickBase.style.touchAction = "none";

        DOM.joystickBase.addEventListener("pointerdown", (event) => {
          if (State.paused || State.dialogueOpen) return;

          event.preventDefault();

          State.joystickPointerId = event.pointerId;
          State.joystickOrigin = {
            x: event.clientX,
            y: event.clientY
          };

          try {
            DOM.joystickBase.setPointerCapture(event.pointerId);
          } catch (_) {}

          this.updateJoystick(event);
        });

        DOM.joystickBase.addEventListener("pointermove", (event) => {
          if (event.pointerId !== State.joystickPointerId) return;

          event.preventDefault();
          this.updateJoystick(event);
        });

        const releaseJoystick = (event) => {
          if (event.pointerId !== State.joystickPointerId) return;

          State.joystickPointerId = null;
          State.movement.x = 0;
          State.movement.z = 0;

          if (DOM.joystickThumb) {
            DOM.joystickThumb.style.transform = "translate(0px, 0px)";
          }
        };

        DOM.joystickBase.addEventListener("pointerup", releaseJoystick);
        DOM.joystickBase.addEventListener("pointercancel", releaseJoystick);
        DOM.joystickBase.addEventListener("lostpointercapture", releaseJoystick);
      }

      // Clavier pour les ordinateurs et les appareils avec clavier.
      window.addEventListener("keydown", (event) => {
        if (event.repeat || State.paused || State.dialogueOpen) return;

        const key = event.key.toLowerCase();

        if (["w", "arrowup", "z"].includes(key)) State.movement.z = 1;
        if (["s", "arrowdown"].includes(key)) State.movement.z = -1;
        if (["a", "arrowleft", "q"].includes(key)) State.movement.x = -1;
        if (["d", "arrowright"].includes(key)) State.movement.x = 1;

        if (key === "shift") State.isRunning = true;
        if (key === " " && State.gameStarted) Game.jump();
        if (key === "e" && State.gameStarted) Game.interact();
        if (key === "escape") Game.handleEscape();
      });

      window.addEventListener("keyup", (event) => {
        const key = event.key.toLowerCase();

        if (["w", "arrowup", "z", "s", "arrowdown"].includes(key)) {
          State.movement.z = 0;
        }

        if (["a", "arrowleft", "q", "d", "arrowright"].includes(key)) {
          State.movement.x = 0;
        }

        if (key === "shift") State.isRunning = false;
      });

      window.addEventListener("blur", () => {
        State.movement.x = 0;
        State.movement.z = 0;
        State.isRunning = false;
      });
    },

    updateJoystick(event) {
      const rect = DOM.joystickBase.getBoundingClientRect();

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

      State.movement.x = Utils.clamp(dx / maxRadius, -1, 1);
      State.movement.z = Utils.clamp(-dy / maxRadius, -1, 1);

      if (DOM.joystickThumb) {
        DOM.joystickThumb.style.transform =
          `translate(${dx}px, ${dy}px)`;
      }
    },

    updatePlayer(delta) {
      if (!State.player || State.paused || !State.gameStarted) return;

      const x = State.movement.x;
      const z = State.movement.z;

      const magnitude = Math.hypot(x, z);

      if (magnitude > 0.08) {
        const direction = new BABYLON.Vector3(x, 0, z).normalize();

        const speed = State.isRunning
          ? CONFIG.runningSpeed
          : CONFIG.movementSpeed;

        const forward = new BABYLON.Vector3(
          Math.sin(State.camera.alpha),
          0,
          Math.cos(State.camera.alpha)
        );

        const right = new BABYLON.Vector3(
          Math.cos(State.camera.alpha),
          0,
          -Math.sin(State.camera.alpha)
        );

        const movement = right.scale(direction.x)
          .add(forward.scale(direction.z));

        if (movement.lengthSquared() > 0.001) {
          movement.normalize();

          State.player.position.addInPlace(
            movement.scale(speed * delta)
          );

          const desiredRotation = Math.atan2(
            movement.x,
            movement.z
          );

          let rotationDelta = desiredRotation - State.player.rotation.y;

          while (rotationDelta > Math.PI) rotationDelta -= Math.PI * 2;
          while (rotationDelta < -Math.PI) rotationDelta += Math.PI * 2;

          State.player.rotation.y += rotationDelta * Math.min(1, delta * 9);
        }
      }

      // Gravité et saut
      if (State.isJumping) {
        State.verticalVelocity -= CONFIG.gravity * delta;
        State.player.position.y += State.verticalVelocity * delta;

        if (State.player.position.y <= 0) {
          State.player.position.y = 0;
          State.verticalVelocity = 0;
          State.isJumping = false;
        }
      }

      State.player.position.x = Utils.clamp(
        State.player.position.x,
        -CONFIG.worldLimit,
        CONFIG.worldLimit
      );

      State.player.position.z = Utils.clamp(
        State.player.position.z,
        -CONFIG.worldLimit,
        CONFIG.worldLimit
      );

      CharacterSystem.animate(
        State.playerVisual,
        delta,
        magnitude > 0.08,
        State.isRunning
      );

      this.updateCamera();
    },

    updateCamera() {
      if (State.camera && State.player) {
        const target = State.player.position.clone();
        target.y += 1.15;
        State.camera.setTarget(target);
      }
    }
  };

  /* ==========================================================
     13. DIALOGUES ET CHOIX
  ========================================================== */

  const Dialogue = {
    open(characterId, customText = null, choices = null, onChoice = null) {
      const character = CharacterSystem.getCharacter(characterId);

      State.dialogueOpen = true;
      State.paused = true;
      State.currentChoices = choices || [];
      State.lastDialogue = customText || this.defaultDialogue(characterId);
      State.dialogueOnChoice = onChoice || null;
      State.dialogueCharacterId = characterId;

      Utils.setText(DOM.speakerName, character.name);
      Utils.setText(DOM.speakerAvatar, character.avatar);
      Utils.setText(DOM.dialogueText, State.lastDialogue);

      if (DOM.dialogueText) {
        DOM.dialogueText.style.display =
          State.settings.subtitles ? "" : "none";
      }

      if (DOM.dialogueChoices) {
        DOM.dialogueChoices.replaceChildren();
      }

      if (choices?.length) {
        choices.forEach((choice, index) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "secondary-button dialogue-choice-button";
          button.textContent = choice;

          button.addEventListener("click", () => {
            AudioSystem.click();
            State.lastChoice = choice;

            if (typeof State.dialogueOnChoice === "function") {
              State.dialogueOnChoice(choice, index);
            }

            this.close();
            Game.advanceStep("choice");
          });

          DOM.dialogueChoices.appendChild(button);
        });

        Utils.hide(DOM.nextDialogueButton);
      } else {
        Utils.show(DOM.nextDialogueButton);
      }

      Utils.show(DOM.dialoguePanel);
      AudioSystem.speak(State.lastDialogue, characterId);
    },

    defaultDialogue(characterId) {
      const lines = {
        alex: "Je suis heureux de te retrouver. Prenons le temps de discuter et de profiter de ce moment.",
        camille: "Bonjour ! Je suis heureuse de te rencontrer. Cet endroit est magnifique, tu ne trouves pas ?",
        noah: "Salut ! La journée s'annonce belle. Qu'aimerais-tu découvrir aujourd'hui ?",
        lea: "Quel plaisir de partager cette promenade. Raconte-moi ce qui te fait sourire.",
        mika: "Hé, te voilà ! J'ai une idée pour rendre cette journée encore plus intéressante.",
        sarah: "Bonjour ! Je crois que les plus beaux souvenirs commencent par une conversation sincère."
      };

      return lines[characterId] || "Bonjour ! Heureux de partager ce moment avec toi.";
    },

    continue() {
      if (!State.dialogueOpen) return;

      this.close();

      const step = Game.currentStep();

      if (step && step.type === "talk") {
        Game.advanceStep("talk");
      } else if (step && step.type === "choice") {
        UI.notification("Choisissez une réponse pour continuer.");
      }
    },

    close() {
      Utils.hide(DOM.dialoguePanel);
      State.dialogueOpen = false;
      State.paused = false;
      State.dialogueOnChoice = null;
      AudioSystem.stopSpeech();
    },

    repeat() {
      if (!State.lastDialogue) return;

      AudioSystem.speak(
        State.lastDialogue,
        State.dialogueCharacterId || State.playerCharacterId
      );
    }
  };

  /* ==========================================================
     14. SYSTÈME DE MISSIONS
  ========================================================== */

  const Game = {
    currentMission() {
      return MISSION_DATA[State.activeMissionIndex] || null;
    },

    currentStep() {
      const mission = this.currentMission();
      return mission?.steps?.[State.activeStepIndex] || null;
    },

    async startNewGame() {
      const hasSave = await Storage.loadSave();

      if (hasSave && hasSave.gameStarted) {
        UI.confirm(
          "Nouvelle aventure",
          "Commencer une nouvelle aventure effacera la progression actuelle. Continuer ?",
          async () => {
            this.resetProgress();
            await this.ensureWorld();
            this.beginMission(0);
          }
        );
        return;
      }

      this.resetProgress();
      await this.ensureWorld();
      this.beginMission(0);
    },

    resetProgress() {
      State.activeMissionIndex = 0;
      State.activeStepIndex = 0;
      State.completedMissions = [];
      State.gameStarted = false;
      State.ending = false;
      State.paused = false;
    },

    async continueGame() {
      let save = await Storage.loadSave();

      if (!save) {
        save = await Storage.restoreFallbackSave();
      }

      if (!save) {
        UI.notification("Aucune sauvegarde trouvée. Commencez une nouvelle aventure.");
        return;
      }

      State.activeMissionIndex = Utils.clamp(
        Utils.safeNumber(save.activeMissionIndex, 0),
        0,
        MISSION_DATA.length - 1
      );

      State.activeStepIndex = Math.max(
        0,
        Utils.safeNumber(save.activeStepIndex, 0)
      );

      State.completedMissions = Array.isArray(save.completedMissions)
        ? save.completedMissions.filter((id) =>
            MISSION_DATA.some((mission) => mission.id === id)
          )
        : [];

      State.playerCharacterId = CharacterSystem.getCharacter(
        save.playerCharacterId
      ).id;

      State.gameStarted = true;
      State.ending = false;

      await this.ensureWorld();

      if (save.playerPosition && State.player) {
        State.player.position.set(
          Utils.safeNumber(save.playerPosition.x, 0),
          0,
          Utils.safeNumber(save.playerPosition.z, 0)
        );
      }

      this.beginMission(State.activeMissionIndex, true);
      UI.notification("Votre aventure a été restaurée.");
    },

    async ensureWorld() {
      if (State.gameReady && State.scene && !State.scene.isDisposed) {
        return true;
      }

      if (!window.BABYLON) {
        UI.showError(
          "Babylon.js indisponible",
          "Le moteur 3D n'a pas pu être chargé. Vérifiez votre connexion Internet puis réessayez."
        );
        return false;
      }

      UI.worldLoading(true, "Création du monde 3D...");

      try {
        if (!State.engine) {
          State.engine = new BABYLON.Engine(
            DOM.canvas,
            true,
            {
              preserveDrawingBuffer: false,
              stencil: true,
              antialias: true,
              adaptToDeviceRatio: true,
              powerPreference: "high-performance"
            }
          );

          State.engine.setHardwareScalingLevel(
            State.settings.quality === "high"
              ? 0.8
              : State.settings.quality === "low"
                ? 1.6
                : 1
          );
        }

        if (State.scene && !State.scene.isDisposed()) {
          State.scene.dispose();
        }

        State.scene = new BABYLON.Scene(State.engine);
        State.scene.collisionsEnabled = false;
        State.scene.skipPointerMovePicking = true;

        State.scene.ambientColor = new BABYLON.Color3(0.32, 0.32, 0.32);
        State.scene.imageProcessingConfiguration.contrast = 1.12;
        State.scene.imageProcessingConfiguration.exposure = 1.08;

        const hemispheric = new BABYLON.HemisphericLight(
          "love-sky-light",
          new BABYLON.Vector3(0, 1, 0),
          State.scene
        );

        hemispheric.intensity = 0.9;
        hemispheric.diffuse = new BABYLON.Color3(1, 0.91, 0.82);
        hemispheric.groundColor = new BABYLON.Color3(0.34, 0.39, 0.34);

        const sunlight = new BABYLON.DirectionalLight(
          "love-sunlight",
          new BABYLON.Vector3(-0.5, -1, 0.4),
          State.scene
        );

        sunlight.position = new BABYLON.Vector3(20, 35, -10);
        sunlight.intensity = 1.1;

        Controls.setupCamera();

        const playerCharacter = CharacterSystem.getCharacter(
          State.playerCharacterId
        );

        State.playerVisual = CharacterSystem.buildCharacter(
          playerCharacter,
          State.scene,
          "player",
          true
        );

        State.player = State.playerVisual.root;
        State.player.position.set(0, 0, 0);

        World.createEnvironment(this.currentMission()?.landscape || "garden");
        NPCSystem.spawnNPCs();

        State.scene.onBeforeRenderObservable.add(() => {
          // Réserve le point d'entrée pour les effets visuels futurs.
        });

        State.engine.runRenderLoop(() => {
          if (!State.scene || State.scene.isDisposed()) return;

          const now = performance.now();
          const delta = Math.min(
            (now - (State.lastFrameTime || now)) / 1000,
            0.05
          );

          State.lastFrameTime = now;

          if (State.gameStarted && !State.paused) {
            Controls.updatePlayer(delta);
            NPCSystem.update(delta);
            this.updateInteractionPrompt();
            this.updateMissionProximity();
          }

          State.scene.render();
        });

        window.addEventListener("resize", () => {
          State.engine?.resize();
        });

        State.gameReady = true;
        UI.worldLoading(false);

        return true;
      } catch (error) {
        console.error("Erreur de création du monde 3D :", error);

        UI.worldLoading(false);

        UI.showError(
          "Erreur du monde 3D",
          "Le monde n'a pas pu être créé. Vérifiez que Babylon.js est chargé et que votre appareil dispose de suffisamment de mémoire."
        );

        return false;
      }
    },

    applyGraphicsQuality() {
      if (!State.engine) return;

      const levels = {
        low: 1.6,
        medium: 1,
        high: 0.8
      };

      State.engine.setHardwareScalingLevel(
        levels[State.settings.quality] || 1
      );
    },

    beginMission(index, restoring = false) {
      if (index < 0 || index >= MISSION_DATA.length) {
        UI.showEnding();
        return;
      }

      State.activeMissionIndex = index;
      State.activeStepIndex = Utils.clamp(
        State.activeStepIndex,
        0,
        Math.max(0, MISSION_DATA[index].steps.length - 1)
      );

      State.gameStarted = true;
      State.paused = false;
      State.ending = false;

      UI.hide(DOM.mainMenu);
      UI.hide(DOM.missionsScreen);
      UI.hide(DOM.pauseScreen);
      UI.hide(DOM.missionCompleteScreen);
      UI.hide(DOM.endingScreen);
      UI.show(DOM.gameScreen);

      const mission = this.currentMission();

      if (State.scene && mission) {
        State.scene.clearColor = BABYLON.Color4.FromHexString(
          "#9BCFE8FF"
        );

        World.createEnvironment(mission.landscape);
        NPCSystem.spawnNPCs();

        if (!restoring) {
          State.player.position.set(0, 0, 0);
          State.player.rotation.y = Math.PI;
        }
      }

      UI.updateMissionHeader();
      UI.updateMissionsList();
      CharacterSystem.updateCharacterButton();

      const step = this.currentStep();

      if (step?.npc) NPCSystem.placeNPCForStep(step);

      if (step?.target) {
        World.updateTargetMarker(step.target);
      } else {
        World.updateTargetMarker({ x: 0, z: 8 });
      }

      UI.notification(
        `Mission ${mission.id} : ${mission.title}`,
        3500
      );

      Storage.saveGame();
    },

    updateInteractionPrompt() {
      const step = this.currentStep();

      if (!step || !State.player || State.dialogueOpen) {
        Utils.hide(DOM.interactionPrompt);
        State.currentTarget = null;
        return;
      }

      const npc = step.npc ? CharacterSystem.getNPC(step.npc) : null;
      let target = null;
      let distance = Infinity;

      if (npc?.visual?.root) {
        target = {
          kind: "npc",
          npc,
          position: npc.visual.root.position
        };

        distance = Utils.distance2D(
          State.player.position,
          npc.visual.root.position
        );
      } else if (step.target) {
        target = {
          kind: "point",
          position: step.target
        };

        distance = Utils.distance2D(
          State.player.position,
          step.target
        );
      } else if (step.type === "talk") {
        const nearest = NPCSystem.nearestNPC();

        if (nearest) {
          target = {
            kind: "npc",
            npc: nearest.npc,
            position: nearest.npc.visual.root.position
          };

          distance = nearest.distance;
        }
      }

      if (!target) {
        Utils.hide(DOM.interactionPrompt);
        State.currentTarget = null;
        return;
      }

      State.currentTarget = {
        ...target,
        distance,
        step
      };

      const closeEnough = distance <= CONFIG.interactionDistance;

      if (closeEnough) {
        Utils.show(DOM.interactionPrompt);

        const action = step.actionLabel || this.actionLabel(step.type);

        Utils.setText(DOM.interactionText, action);
        Utils.setText(
          DOM.interactionIcon,
          step.type === "talk" ? "♡" : "✦"
        );
      } else {
        Utils.hide(DOM.interactionPrompt);
      }
    },

    actionLabel(type) {
      const labels = {
        move: "Atteindre le lieu",
        visit: "Visiter le lieu",
        talk: "Parler",
        interact: "Interagir",
        collect: "Récupérer",
        help: "Aider",
        sit: "S'asseoir",
        dance: "Danser",
        sing: "Chanter",
        photo: "Prendre une photo",
        listen: "Écouter",
        give: "Offrir",
        choice: "Choisir une réponse",
        promise: "Faire une promesse",
        explore: "Explorer",
        wait: "Continuer",
        hug: "Partager un geste amical",
        observe: "Observer",
        arrive: "Arriver"
      };

      return labels[type] || "Interagir";
    },

    updateMissionProximity() {
      const step = this.currentStep();

      if (!step || !step.target) return;

      if (!["move", "visit", "explore", "arrive"].includes(step.type)) {
        return;
      }

      const distance = Utils.distance2D(
        State.player.position,
        step.target
      );

      if (distance <= 1.7) {
        this.advanceStep(step.type);
      }
    },

    interact() {
      if (!State.gameStarted || State.paused) return;

      if (State.dialogueOpen) {
        Dialogue.continue();
        return;
      }

      const step = this.currentStep();

      if (!step) return;

      const target = State.currentTarget;

      if (target && target.distance <= CONFIG.interactionDistance) {
        this.performStepAction(step, target);
        return;
      }

      if (step.npc) {
        const npc = CharacterSystem.getNPC(step.npc);

        if (npc?.visual?.root) {
          const dx = npc.visual.root.position.x - State.player.position.x;
          const dz = npc.visual.root.position.z - State.player.position.z;
          const length = Math.hypot(dx, dz) || 1;

          State.movement.x = dx / length;
          State.movement.z = dz / length;

          UI.notification("Approchez-vous du personnage pour interagir.");
          return;
        }
      }

      if (step.target) {
        UI.notification("Approchez-vous du repère lumineux pour continuer.");
      } else {
        this.performStepAction(step, null);
      }
    },

    performStepAction(step, target) {
      AudioSystem.click();

      switch (step.type) {
        case "talk": {
          const npcId = step.npc || target?.npc?.id;

          if (!npcId) {
            UI.notification("Aucun personnage à proximité.");
            return;
          }

          Dialogue.open(
            npcId,
            this.dialogueForStep(npcId, step),
            null
          );
          break;
        }

        case "choice": {
          const npcId = step.npc || State.playerCharacterId;

          Dialogue.open(
            npcId,
            this.dialogueForStep(npcId, step),
            step.choices || [
              "Écouter avec attention",
              "Répondre avec sincérité",
              "Prendre le temps de réfléchir"
            ]
          );
          break;
        }

        case "give":
        case "help":
        case "promise":
        case "hug":
        case "sing":
        case "dance":
        case "sit":
        case "collect":
        case "interact":
        case "photo":
        case "observe":
        case "listen":
        case "wait":
        case "explore":
        case "move":
        case "visit":
        case "arrive": {
          const npcId = step.npc;

          if (npcId) {
            const npc = CharacterSystem.getNPC(npcId);

            if (npc?.visual?.root) {
              npc.visual.root.rotation.y = Math.atan2(
                State.player.position.x - npc.visual.root.position.x,
                State.player.position.z - npc.visual.root.position.z
              );
            }
          }

          if (step.type === "photo") {
            this.takePhotoMoment();
          }

          if (step.type === "dance" || step.type === "sing") {
            CharacterSystem.animate(State.playerVisual, 0.5, true, false);
            AudioSystem.success();
          }

          UI.notification(
            this.actionCompletionMessage(step.type),
            1700
          );

          this.advanceStep(step.type);
          break;
        }

        default:
          this.advanceStep(step.type);
          break;
      }
    },

    dialogueForStep(characterId, step) {
      const character = CharacterSystem.getCharacter(characterId);

      if (step.type === "choice") {
        return `${character.name} vous écoute avec attention. Que souhaitez-vous répondre ?`;
      }

      if (step.type === "talk") {
        return `${character.name} vous sourit. « Je suis heureux de partager ce moment avec toi. Qu'aimerais-tu me raconter ? »`;
      }

      return `${character.name} est prêt à vous écouter.`;
    },

    actionCompletionMessage(type) {
      const messages = {
        give: "Votre cadeau a été offert.",
        help: "Votre aide a été apportée.",
        promise: "Votre engagement a été confirmé.",
        hug: "Un geste amical a été partagé.",
        sing: "Votre chanson a accompagné ce moment.",
        dance: "La danse a été partagée.",
        sit: "Vous avez pris un moment de repos.",
        collect: "Objet récupéré.",
        interact: "Interaction réussie.",
        photo: "Souvenir photographique enregistré.",
        observe: "Vous avez admiré le paysage.",
        listen: "Vous avez écouté attentivement.",
        wait: "Cette étape est terminée.",
        explore: "Lieu exploré.",
        move: "Destination atteinte.",
        visit: "Visite terminée.",
        arrive: "Vous êtes arrivé à destination."
      };

      return messages[type] || "Objectif accompli.";
    },

    takePhotoMoment() {
      // Capture d'écran via Babylon.js si le navigateur le permet.
      try {
        const canvas = DOM.canvas;

        if (!canvas) return;

        const dataURL = canvas.toDataURL("image/png");

        const photos = JSON.parse(
          localStorage.getItem("fobas-love-photos") || "[]"
        );

        photos.push({
          date: new Date().toISOString(),
          image: dataURL
        });

        localStorage.setItem(
          "fobas-love-photos",
          JSON.stringify(photos.slice(-10))
        );
      } catch (error) {
        console.warn("La capture de souvenir n'a pas pu être enregistrée :", error);
      }
    },

    advanceStep(actionType = "interaction") {
      const mission = this.currentMission();

      if (!mission) return;

      if (State.dialogueOpen) {
        Dialogue.close();
      }

      State.activeStepIndex += 1;

      if (State.activeStepIndex >= mission.steps.length) {
        this.completeMission();
        return;
      }

      const step = this.currentStep();

      UI.updateObjective();

      if (step?.npc) NPCSystem.placeNPCForStep(step);

      if (step?.target) {
        World.updateTargetMarker(step.target);
      }

      Storage.saveGame();

      UI.notification(
        `Nouvel objectif : ${step.text}`,
        2800
      );

      AudioSystem.tone(720, 0.08);
    },

    completeMission() {
      const mission = this.currentMission();

      if (!mission) return;

      if (!State.completedMissions.includes(mission.id)) {
        State.completedMissions.push(mission.id);
      }

      State.activeStepIndex = mission.steps.length;

      UI.updateObjective();
      UI.updateMissionsList();

      Storage.saveGame();
      UI.showMissionComplete(mission);
    },

    nextMission() {
      Utils.hide(DOM.missionCompleteScreen);

      if (State.activeMissionIndex >= MISSION_DATA.length - 1) {
        UI.showEnding();
        return;
      }

      State.activeMissionIndex += 1;
      State.activeStepIndex = 0;

      this.beginMission(State.activeMissionIndex);
    },

    startMission(index) {
      if (index < 0 || index >= MISSION_DATA.length) return;

      if (index > State.activeMissionIndex) {
        UI.notification("Terminez d'abord les missions précédentes.");
        return;
      }

      State.activeMissionIndex = index;
      State.activeStepIndex = 0;

      if (!State.gameReady) {
        this.ensureWorld().then((ready) => {
          if (ready) this.beginMission(index);
        });
      } else {
        this.beginMission(index);
      }
    },

    jump() {
      if (!State.gameStarted || State.paused || State.isJumping) return;

      State.isJumping = true;
      State.verticalVelocity = Math.sqrt(
        2 * CONFIG.gravity * CONFIG.jumpHeight
      );

      AudioSystem.tone(380, 0.08);
    },

    async save() {
      UI.saving(true);

      const success = await Storage.saveGame();

      setTimeout(() => UI.saving(false), 550);

      UI.notification(
        success ? "Progression sauvegardée." : "Sauvegarde de secours effectuée."
      );
    },

    returnToMenu() {
      UI.confirm(
        "Retour au menu",
        "Votre progression sera sauvegardée avant le retour au menu. Continuer ?",
        async () => {
          await Storage.saveGame();

          State.paused = true;
          State.gameStarted = false;

          Dialogue.close();
          AudioSystem.stopSpeech();

          Utils.hide(DOM.pauseScreen);
          Utils.hide(DOM.gameScreen);
          Utils.hide(DOM.missionsScreen);
          Utils.hide(DOM.missionCompleteScreen);

          Utils.show(DOM.mainMenu);

          const save = await Storage.loadSave();

          if (DOM.continueGameButton) {
            DOM.continueGameButton.disabled = !save;
          }
        }
      );
    },

    handleEscape() {
      if (State.dialogueOpen) {
        Dialogue.close();
        return;
      }

      if (DOM.missionsScreen && !DOM.missionsScreen.classList.contains("hidden")) {
        UI.closeMissions();
        return;
      }

      if (DOM.settingsScreen && !DOM.settingsScreen.classList.contains("hidden")) {
        UI.closeSettings();
        return;
      }

      if (DOM.pauseScreen && !DOM.pauseScreen.classList.contains("hidden")) {
        UI.closePause();
        return;
      }

      if (State.gameStarted && !State.paused) {
        UI.openPause();
      }
    },

    async retry() {
      Utils.hide(DOM.errorScreen);
      State.gameReady = false;

      const ready = await this.ensureWorld();

      if (ready) {
        this.beginMission(State.activeMissionIndex);
      } else {
        UI.showError(
          "Impossible de démarrer le jeu",
          "Le moteur 3D n'est toujours pas disponible. Vérifiez la connexion et rechargez la page."
        );
      }
    }
  };

  /* ==========================================================
     15. BOUTONS — CONNEXION DE TOUTES LES ACTIONS
  ========================================================== */

  function bindButtons() {
    Utils.button(DOM.newGameButton, () => {
      AudioSystem.resume();
      AudioSystem.initialize();
      Game.startNewGame();
    });

    Utils.button(DOM.continueGameButton, () => {
      AudioSystem.resume();
      AudioSystem.initialize();
      Game.continueGame();
    });

    Utils.button(DOM.missionsMenuButton, async () => {
      AudioSystem.resume();
      UI.updateMissionsList();
      Utils.hide(DOM.mainMenu);
      Utils.show(DOM.missionsScreen);
    });

    Utils.button(DOM.settingsButton, () => {
      UI.openSettings();
    });

    Utils.button(DOM.creditsButton, () => {
      Utils.hide(DOM.mainMenu);
      Utils.show(DOM.creditsScreen);
    });

    Utils.button(DOM.pauseButton, () => {
      UI.openPause();
    });

    Utils.button(DOM.openMissionsButton, () => {
      UI.openMissions();
    });

    Utils.button(DOM.interactionPrompt, () => {
      Game.interact();
    });

    Utils.button(DOM.talkButton, () => {
      Game.interact();
    });

    Utils.button(DOM.runButton, () => {
      State.isRunning = !State.isRunning;

      DOM.runButton.classList.toggle("active", State.isRunning);

      UI.notification(
        State.isRunning ? "Course activée." : "Course désactivée.",
        1100
      );
    });

    if (DOM.runButton) {
      DOM.runButton.addEventListener("pointerdown", () => {
        State.isRunning = true;
      });

      const stopRunning = () => {
        State.isRunning = false;
        DOM.runButton.classList.remove("active");
      };

      DOM.runButton.addEventListener("pointerup", stopRunning);
      DOM.runButton.addEventListener("pointercancel", stopRunning);
      DOM.runButton.addEventListener("pointerleave", stopRunning);
    }

    Utils.button(DOM.jumpButton, () => {
      Game.jump();
    });

    Utils.button(DOM.closeDialogueButton, () => {
      Dialogue.close();
    });

    Utils.button(DOM.repeatDialogueButton, () => {
      Dialogue.repeat();
    });

    Utils.button(DOM.nextDialogueButton, () => {
      Dialogue.continue();
    });

    Utils.button(DOM.closeMissionsButton, () => {
      UI.closeMissions();
    });

    Utils.button(DOM.resumeButton, () => {
      UI.closePause();
    });

    Utils.button(DOM.pauseMissionsButton, () => {
      Utils.hide(DOM.pauseScreen);
      UI.openMissions();
    });

    Utils.button(DOM.saveGameButton, () => {
      Game.save();
    });

    Utils.button(DOM.returnToMenuButton, () => {
      Game.returnToMenu();
    });

    Utils.button(DOM.closeSettingsButton, () => {
      UI.closeSettings();
    });

    Utils.button(DOM.saveSettingsButton, () => {
      UI.saveSettingsFromForm();
    });

    Utils.button(DOM.closeCreditsButton, () => {
      Utils.hide(DOM.creditsScreen);
      Utils.show(DOM.mainMenu);
    });

    Utils.button(DOM.nextMissionButton, () => {
      Game.nextMission();
    });

    Utils.button(DOM.completionMenuButton, () => {
      Utils.hide(DOM.missionCompleteScreen);
      Utils.hide(DOM.gameScreen);
      Utils.show(DOM.mainMenu);

      State.paused = true;
      State.gameStarted = false;
    });

    Utils.button(DOM.restartGameButton, () => {
      State.ending = false;
      Game.resetProgress();
      Utils.hide(DOM.endingScreen);

      Game.ensureWorld().then((ready) => {
        if (ready) Game.beginMission(0);
      });
    });

    Utils.button(DOM.endingMenuButton, () => {
      State.ending = false;
      State.paused = true;
      Utils.hide(DOM.endingScreen);
      Utils.show(DOM.mainMenu);
    });

    Utils.button(DOM.cancelConfirmationButton, () => {
      UI.closeConfirmation(false);
    });

    Utils.button(DOM.acceptConfirmationButton, () => {
      UI.closeConfirmation(true);
    });

    Utils.button(DOM.retryButton, () => {
      Game.retry();
    });

    Utils.button(DOM.errorMenuButton, () => {
      Utils.hide(DOM.errorScreen);
      Utils.show(DOM.mainMenu);
    });

    // Fermer les fenêtres avec Escape et éviter les interactions
    // accidentelles avec les boutons.
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (DOM.confirmationScreen &&
            !DOM.confirmationScreen.classList.contains("hidden")) {
          UI.closeConfirmation(false);
        }
      }
    });
  }

  /* ==========================================================
     16. INITIALISATION
  ========================================================== */

  async function initialize() {
    UI.setLoading(5, "Initialisation de FOBAS Interactive...");

    if (!DOM.canvas) {
      console.error("Canvas loveGameCanvas introuvable.");
      return;
    }

    bindButtons();
    Controls.setupTouchControls();
    CharacterSystem.updateCharacterButton();

    UI.setLoading(20, "Préparation de la sauvegarde locale...");

    await Storage.open();

    UI.setLoading(38, "Chargement des paramètres...");

    const savedSettings = await Storage.loadSettings();

    if (savedSettings && typeof savedSettings === "object") {
      State.settings = {
        ...State.settings,
        ...savedSettings
      };
    }

    AudioSystem.initialize();
    AudioSystem.setMusicEnabled(State.settings.music);

    UI.populateSettings();

    UI.setLoading(55, "Vérification de la progression...");

    let savedGame = await Storage.loadSave();

    if (!savedGame) {
      savedGame = await Storage.restoreFallbackSave();
    }

    if (DOM.continueGameButton) {
      DOM.continueGameButton.disabled = !savedGame;
    }

    UI.setLoading(72, "Préparation de l'interface...");

    UI.updateMissionsList();

    UI.setLoading(88, "Prêt à commencer votre aventure...");

    await new Promise((resolve) => setTimeout(resolve, 250));

    UI.setLoading(100, "Votre aventure est prête.");

    setTimeout(() => {
      Utils.hide(DOM.loadingScreen);
      Utils.show(DOM.mainMenu);
    }, 300);

    // En cas de retour de l'application en premier plan,
    // redimensionner le moteur pour l'écran mobile.
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        State.engine?.resize();
      } else {
        State.movement.x = 0;
        State.movement.z = 0;
        State.isRunning = false;
      }
    });

    console.info(
      `${CONFIG.appName} — Version ${CONFIG.version} initialisée.`
    );
  }

  /* ==========================================================
     17. VALIDATION DE LA CONFIGURATION
  ========================================================== */

  function validateMissions() {
    const ids = new Set();

    MISSION_DATA.forEach((mission, index) => {
      if (!mission.id || !mission.title || !Array.isArray(mission.steps)) {
        throw new Error(`Mission invalide à l'index ${index}.`);
      }

      if (ids.has(mission.id)) {
        throw new Error(`Identifiant de mission en double : ${mission.id}`);
      }

      ids.add(mission.id);

      if (mission.steps.length === 0) {
        console.warn(`La mission "${mission.title}" ne possède aucune étape.`);
      }

      mission.steps.forEach((step, stepIndex) => {
        if (!step.type || !step.text) {
          console.warn(
            `Étape incomplète dans "${mission.title}", position ${stepIndex}.`
          );
        }
      });
    });
  }

  /* ==========================================================
     18. API PUBLIQUE — AJOUT DE MISSIONS

     Exemple depuis la console ou un module complémentaire :

     FOBASLove.addMission({
       id: 36,
       title: "Une nouvelle aventure",
       location: "Le parc",
       landscape: "park",
       description: "Une nouvelle histoire commence.",
       reward: "Un souvenir",
       steps: [
         {
           type: "move",
           text: "Rejoignez le point de rencontre.",
           target: { x: 0, z: 8 }
         },
         {
           type: "talk",
           text: "Parlez à Camille.",
           npc: "camille"
         }
       ]
     });

     Pour commencer une mission ajoutée :
     FOBASLove.startMission(35);
  ========================================================== */

  const PublicAPI = {
    version: CONFIG.version,

    get missions() {
      return MISSION_DATA;
    },

    get characters() {
      return CHARACTERS;
    },

    get progress() {
      return {
        activeMissionIndex: State.activeMissionIndex,
        activeMissionId: this.missions[State.activeMissionIndex]?.id ?? null,
        activeStepIndex: State.activeStepIndex,
        completedMissions: [...State.completedMissions],
        totalMissions: MISSION_DATA.length
      };
    },

    addMission(mission) {
      if (!mission || typeof mission !== "object") {
        throw new TypeError("La mission doit être un objet.");
      }

      if (!mission.title || !Array.isArray(mission.steps) || !mission.steps.length) {
        throw new Error("Une mission doit avoir un titre et au moins une étape.");
      }

      const newId = mission.id ?? (
        Math.max(0, ...MISSION_DATA.map((item) => item.id)) + 1
      );

      if (MISSION_DATA.some((item) => item.id === newId)) {
        throw new Error(`L'identifiant ${newId} existe déjà.`);
      }

      const allowedTypes = new Set([
        "move", "visit", "talk", "interact", "collect", "help",
        "sit", "dance", "sing", "photo", "listen", "give",
        "choice", "promise", "explore", "wait", "hug", "observe", "arrive"
      ]);

      const steps = mission.steps.map((step) => {
        if (!step.type || !allowedTypes.has(step.type)) {
          throw new Error(`Type d'action non reconnu : ${step.type}`);
        }

        if (!step.text) {
          throw new Error("Chaque étape doit contenir un texte.");
        }

        return { ...step };
      });

      const newMission = {
        id: newId,
        title: String(mission.title),
        location: String(mission.location || "Nouveau lieu"),
        landscape: String(mission.landscape || "garden"),
        description: String(mission.description || ""),
        reward: String(mission.reward || ""),
        steps
      };

      MISSION_DATA.push(newMission);

      UI.updateMissionsList();
      Storage.saveGame();

      UI.notification(`Mission « ${newMission.title} » ajoutée.`);

      return newMission;
    },

    startMission(index) {
      Game.startMission(index);
    },

    save() {
      return Storage.saveGame();
    },

    chooseCharacter(id) {
      CharacterSystem.choosePlayer(id);
    },

    notify(message) {
      UI.notification(message);
    }
  };

  window.FOBASLove = PublicAPI;

  /* ==========================================================
     19. DÉMARRAGE SÉCURISÉ
  ========================================================== */

  try {
    validateMissions();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        initialize().catch((error) => {
          console.error("Erreur d'initialisation :", error);

          UI.showError(
            "Erreur d'initialisation",
            "Le jeu n'a pas pu démarrer correctement. Rechargez la page et réessayez."
          );
        });
      }, { once: true });
    } else {
      initialize().catch((error) => {
        console.error("Erreur d'initialisation :", error);

        UI.showError(
          "Erreur d'initialisation",
          "Le jeu n'a pas pu démarrer correctement. Rechargez la page et réessayez."
        );
      });
    }
  } catch (error) {
    console.error("Configuration des missions invalide :", error);

    UI.showError(
      "Erreur de configuration",
      error.message || "La liste des missions contient une erreur."
    );
  }
})();









