
/* ============================================================
   FOBAS INTERACTIVE — SUR L'AMOUR EN ACTION
   Fichier : appamourfobas.js
   Version : 3.0.0
   Moteur : Babylon.js
   Compatible avec appamourfobas.html
   Auteur : MEME Selvandieu
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     1. CONFIGURATION
  ========================================================== */

  const CONFIG = {
    version: "3.0.0",
    missionCount: 35,
    storageKey: "FOBAS_LOVE_GAME_V3",
    settingsKey: "FOBAS_LOVE_SETTINGS_V3",
    saveDelay: 450,
    interactionDistance: 4.2,
    playerSpeed: 5.0,
    runMultiplier: 1.8,
    jumpForce: 7.5,
    gravity: 18,
    cameraSensitivity: 0.003,
    cameraMinRadius: 4,
    cameraMaxRadius: 15,
    worldLimit: 85,
    autosaveInterval: 20000
  };

  const $ = (id) => document.getElementById(id);

  const DOM = {
    loadingScreen: $("loadingScreen"),
    loadingMessage: $("loadingMessage"),
    loadingProgress: $("loadingProgress"),
    loadingPercent: $("loadingPercent"),

    mainMenu: $("mainMenu"),
    settingsButton: $("settingsButton"),
    newGameButton: $("newGameButton"),
    continueGameButton: $("continueGameButton"),
    missionsMenuButton: $("missionsMenuButton"),
    creditsButton: $("creditsButton"),
    saveStatus: $("saveStatus"),

    gameScreen: $("gameScreen"),
    gameWorld: $("gameWorld"),
    canvas: $("loveGameCanvas"),
    worldLoadingOverlay: $("worldLoadingOverlay"),
    worldLoadingText: $("worldLoadingText"),
    gameTopBar: $("gameTopBar"),
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
    closeMissionsButton: $("closeMissionsButton"),
    missionsSummary: $("missionsSummary"),
    overallProgressBar: $("overallProgressBar"),
    missionsList: $("missionsList"),

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
     2. UTILITAIRES
  ========================================================== */

  const Utils = {
    clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    },

    distanceXZ(a, b) {
      const dx = a.x - b.x;
      const dz = a.z - b.z;
      return Math.sqrt(dx * dx + dz * dz);
    },

    random(min, max) {
      return min + Math.random() * (max - min);
    },

    setVisible(element, visible) {
      if (!element) return;
      element.classList.toggle("hidden", !visible);
      element.setAttribute("aria-hidden", visible ? "false" : "true");
    },

    setText(element, value) {
      if (element) element.textContent = String(value ?? "");
    },

    setProgress(element, percent) {
      if (!element) return;
      element.style.width = `${Utils.clamp(percent, 0, 100)}%`;
    },

    button(element, callback) {
      if (!element) return;
      element.addEventListener("click", (event) => {
        event.preventDefault();
        try {
          callback(event);
        } catch (error) {
          console.error("Erreur bouton FOBAS :", error);
          UI.notify("Une erreur est survenue. Réessayez.");
        }
      });
    },

    safeJSON(value, fallback = null) {
      try {
        return JSON.parse(value);
      } catch {
        return fallback;
      }
    },

    async wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  };

  /* ==========================================================
     3. LES 35 MISSIONS
  ========================================================== */

  const MISSION_DATA = [
    {
      title: "Un regard inattendu",
      objective: "Rencontrez Camille près du jardin.",
      person: "Camille",
      place: "Le jardin romantique",
      dialogue: "Bonjour ! Quel plaisir de vous rencontrer ici.",
      action: "Faire connaissance"
    },
    {
      title: "Un sourire sincère",
      objective: "Retrouvez Lucas et échangez quelques mots.",
      person: "Lucas",
      place: "L'allée des fleurs",
      dialogue: "Votre sourire vient d'embellir ma journée.",
      action: "Échanger un sourire"
    },
    {
      title: "Le premier bonjour",
      objective: "Approchez-vous de Sofia pour la saluer.",
      person: "Sofia",
      place: "La place centrale",
      dialogue: "Bonjour ! Je suis ravie que vous soyez venu.",
      action: "Saluer Sofia"
    },
    {
      title: "Une rencontre imprévue",
      objective: "Allez rencontrer Gabriel.",
      person: "Gabriel",
      place: "Le pavillon",
      dialogue: "Je ne m'attendais pas à faire une aussi belle rencontre.",
      action: "Faire connaissance"
    },
    {
      title: "Le jardin secret",
      objective: "Retrouvez Camille dans le jardin.",
      person: "Camille",
      place: "Le jardin secret",
      dialogue: "Cet endroit est magnifique, n'est-ce pas ?",
      action: "Découvrir le jardin"
    },
    {
      title: "Une conversation agréable",
      objective: "Discutez avec Lucas.",
      person: "Lucas",
      place: "Le banc des rencontres",
      dialogue: "J'aime les conversations qui nous permettent de mieux nous connaître.",
      action: "Discuter"
    },
    {
      title: "Le langage des fleurs",
      objective: "Retrouvez Sofia près des fleurs.",
      person: "Sofia",
      place: "Le parterre fleuri",
      dialogue: "Chaque fleur raconte une histoire différente.",
      action: "Parler des fleurs"
    },
    {
      title: "Une promesse d'amitié",
      objective: "Rencontrez Gabriel et parlez d'amitié.",
      person: "Gabriel",
      place: "La fontaine",
      dialogue: "Une belle amitié commence souvent par un simple geste.",
      action: "Partager une pensée"
    },
    {
      title: "Un moment de confiance",
      objective: "Retrouvez Camille.",
      person: "Camille",
      place: "Le sentier paisible",
      dialogue: "La confiance se construit avec le temps et la sincérité.",
      action: "Parler de confiance"
    },
    {
      title: "Le plaisir de partager",
      objective: "Allez parler à Lucas.",
      person: "Lucas",
      place: "La terrasse",
      dialogue: "Les meilleurs moments sont ceux que nous partageons.",
      action: "Partager un moment"
    },
    {
      title: "Une surprise délicate",
      objective: "Retrouvez Sofia.",
      person: "Sofia",
      place: "Le kiosque",
      dialogue: "Les petites attentions peuvent rendre une journée spéciale.",
      action: "Préparer une surprise"
    },
    {
      title: "L'écoute du cœur",
      objective: "Discutez avec Gabriel.",
      person: "Gabriel",
      place: "Le jardin calme",
      dialogue: "Écouter sincèrement est une belle manière de montrer son affection.",
      action: "Écouter"
    },
    {
      title: "Des souvenirs heureux",
      objective: "Retrouvez Camille.",
      person: "Camille",
      place: "L'allée des souvenirs",
      dialogue: "Les bons souvenirs nous accompagnent longtemps.",
      action: "Évoquer un souvenir"
    },
    {
      title: "Une promenade ensemble",
      objective: "Rejoignez Lucas pour une promenade.",
      person: "Lucas",
      place: "Le chemin du parc",
      dialogue: "Marcher ensemble permet parfois de mieux se comprendre.",
      action: "Faire une promenade"
    },
    {
      title: "Le courage de parler",
      objective: "Allez rencontrer Sofia.",
      person: "Sofia",
      place: "La roseraie",
      dialogue: "Il faut parfois du courage pour exprimer ce que l'on ressent.",
      action: "Exprimer ses sentiments"
    },
    {
      title: "La beauté de la sincérité",
      objective: "Discutez avec Gabriel.",
      person: "Gabriel",
      place: "La place fleurie",
      dialogue: "La sincérité donne de la valeur aux paroles.",
      action: "Parler avec sincérité"
    },
    {
      title: "Un geste attentionné",
      objective: "Retrouvez Camille.",
      person: "Camille",
      place: "Le petit pont",
      dialogue: "Un geste attentionné peut illuminer une journée.",
      action: "Faire attention à l'autre"
    },
    {
      title: "Le respect des différences",
      objective: "Allez parler à Lucas.",
      person: "Lucas",
      place: "Le jardin ouvert",
      dialogue: "Nous sommes différents, et c'est aussi ce qui rend les rencontres enrichissantes.",
      action: "Parler du respect"
    },
    {
      title: "L'art de comprendre",
      objective: "Retrouvez Sofia.",
      person: "Sofia",
      place: "Le pavillon fleuri",
      dialogue: "Comprendre quelqu'un commence par prendre le temps de l'écouter.",
      action: "Mieux se comprendre"
    },
    {
      title: "Une parole encourageante",
      objective: "Discutez avec Gabriel.",
      person: "Gabriel",
      place: "Le jardin des rêves",
      dialogue: "Quelques paroles encourageantes peuvent donner beaucoup de force.",
      action: "Encourager"
    },
    {
      title: "La force du pardon",
      objective: "Retrouvez Camille.",
      person: "Camille",
      place: "Le sentier du lac",
      dialogue: "Le pardon peut ouvrir la voie à une nouvelle compréhension.",
      action: "Parler du pardon"
    },
    {
      title: "Une confiance renouvelée",
      objective: "Allez rencontrer Lucas.",
      person: "Lucas",
      place: "La clairière",
      dialogue: "La confiance se nourrit de respect et de cohérence.",
      action: "Renforcer la confiance"
    },
    {
      title: "Un rêve partagé",
      objective: "Retrouvez Sofia.",
      person: "Sofia",
      place: "Le belvédère",
      dialogue: "Parler de nos rêves nous aide à imaginer l'avenir.",
      action: "Partager un rêve"
    },
    {
      title: "Le bonheur des petites choses",
      objective: "Discutez avec Gabriel.",
      person: "Gabriel",
      place: "Le jardin lumineux",
      dialogue: "Le bonheur se cache parfois dans les choses les plus simples.",
      action: "Parler du bonheur"
    },
    {
      title: "Le temps de la réflexion",
      objective: "Retrouvez Camille.",
      person: "Camille",
      place: "Le banc tranquille",
      dialogue: "Prendre le temps de réfléchir aide à choisir avec sagesse.",
      action: "Réfléchir ensemble"
    },
    {
      title: "Un choix important",
      objective: "Allez parler à Lucas.",
      person: "Lucas",
      place: "Le carrefour du parc",
      dialogue: "Chaque choix mérite attention et responsabilité.",
      action: "Discuter d'un choix"
    },
    {
      title: "La valeur de l'engagement",
      objective: "Retrouvez Sofia.",
      person: "Sofia",
      place: "Le jardin des promesses",
      dialogue: "L'engagement prend tout son sens lorsqu'il est libre et sincère.",
      action: "Parler d'engagement"
    },
    {
      title: "Construire ensemble",
      objective: "Discutez avec Gabriel.",
      person: "Gabriel",
      place: "La grande terrasse",
      dialogue: "Construire quelque chose ensemble demande du dialogue et du respect.",
      action: "Imaginer un projet"
    },
    {
      title: "Un cœur reconnaissant",
      objective: "Retrouvez Camille.",
      person: "Camille",
      place: "La roseraie centrale",
      dialogue: "Exprimer sa gratitude fait du bien à celui qui la reçoit comme à celui qui la donne.",
      action: "Exprimer sa gratitude"
    },
    {
      title: "La force de la solidarité",
      objective: "Allez rencontrer Lucas.",
      person: "Lucas",
      place: "La place de l'amitié",
      dialogue: "S'entraider rend les moments difficiles plus faciles à traverser.",
      action: "Parler de solidarité"
    },
    {
      title: "Le courage d'avancer",
      objective: "Retrouvez Sofia.",
      person: "Sofia",
      place: "Le chemin de l'espoir",
      dialogue: "Chaque nouvelle étape offre une occasion d'apprendre.",
      action: "Parler d'espoir"
    },
    {
      title: "Une vision commune",
      objective: "Discutez avec Gabriel.",
      person: "Gabriel",
      place: "Le jardin de l'avenir",
      dialogue: "Une vision commune se construit en partageant ses idées.",
      action: "Imaginer l'avenir"
    },
    {
      title: "Le sens de l'amour",
      objective: "Retrouvez Camille pour une dernière conversation.",
      person: "Camille",
      place: "Le jardin du cœur",
      dialogue: "L'amour véritable se nourrit de respect, de liberté, d'écoute et de bienveillance.",
      action: "Parler de l'amour"
    },
    {
      title: "Sur l'Amour en Action",
      objective: "Retrouvez tous les beaux souvenirs de votre aventure avec Lucas.",
      person: "Lucas",
      place: "La grande place des souvenirs",
      dialogue: "Merci d'avoir parcouru cette aventure. Que la bienveillance et le respect continuent de guider vos choix.",
      action: "Achever l'aventure"
    }
  ];

  /* ==========================================================
     4. ÉTAT DU JEU
  ========================================================== */

  const State = {
    active: false,
    paused: false,
    started: false,
    completed: false,
    missionIndex: 0,
    completedMissions: [],
    playerPosition: { x: 0, z: 0 },
    nearbyNPC: null,
    dialogueOpen: false,
    dialogueStep: 0,
    lastInteractionTime: 0,
    worldReady: false,
    engineReady: false,
    gameTime: 0,
    lastSave: 0,
    confirmationAction: null,
    saveTimer: null,
    frameCount: 0,
    error: null
  };

  /* ==========================================================
     5. STOCKAGE INDEXEDDB AVEC SOLUTION DE REPLI
  ========================================================== */

  const Storage = {
    db: null,
    supported: typeof indexedDB !== "undefined",

    async open() {
      if (!this.supported) return null;
      if (this.db) return this.db;

      return new Promise((resolve) => {
        try {
          const request = indexedDB.open("FOBAS_LOVE_DATABASE", 1);

          request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("saves")) {
              db.createObjectStore("saves");
            }
          };

          request.onsuccess = () => {
            this.db = request.result;
            resolve(this.db);
          };

          request.onerror = () => resolve(null);
          request.onblocked = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
    },

    async save(key, data) {
      const serialized = JSON.stringify(data);
      let db = await this.open();

      if (db) {
        const success = await new Promise(resolve => {
          try {
            const transaction = db.transaction("saves", "readwrite");
            transaction.objectStore("saves").put(serialized, key);
            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => resolve(false);
            transaction.onabort = () => resolve(false);
          } catch {
            resolve(false);
          }
        });

        if (success) return true;
      }

      try {
        localStorage.setItem(key, serialized);
        return true;
      } catch (error) {
        console.warn("Sauvegarde locale indisponible :", error);
        return false;
      }
    },

    async load(key) {
      const db = await this.open();

      if (db) {
        const result = await new Promise(resolve => {
          try {
            const request = db.transaction("saves", "readonly")
              .objectStore("saves").get(key);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => resolve(null);
          } catch {
            resolve(null);
          }
        });

        if (result) {
          return Utils.safeJSON(result, null);
        }
      }

      try {
        return Utils.safeJSON(localStorage.getItem(key), null);
      } catch {
        return null;
      }
    },

    async hasSave() {
      const data = await this.load(CONFIG.storageKey);
      return Boolean(data && data.started);
    },

    async remove(key) {
      const db = await this.open();

      if (db) {
        await new Promise(resolve => {
          try {
            const transaction = db.transaction("saves", "readwrite");
            transaction.objectStore("saves").delete(key);
            transaction.oncomplete = resolve;
            transaction.onerror = resolve;
          } catch {
            resolve();
          }
        });
      }

      try {
        localStorage.removeItem(key);
      } catch {
        // Stockage navigateur indisponible.
      }
    }
  };

  /* ==========================================================
     6. PARAMÈTRES
  ========================================================== */

  const Settings = {
    values: {
      voice: true,
      music: true,
      subtitles: true,
      quality: "medium",
      sensitivity: 1
    },

    async load() {
      let data = await Storage.load(CONFIG.settingsKey);

      if (!data) {
        try {
          data = Utils.safeJSON(
            localStorage.getItem(CONFIG.settingsKey),
            null
          );
        } catch {
          data = null;
        }
      }

      if (data && typeof data === "object") {
        this.values = { ...this.values, ...data };
      }

      this.applyToForm();
      return this.values;
    },

    applyToForm() {
      if (DOM.voiceEnabled) DOM.voiceEnabled.checked = this.values.voice;
      if (DOM.musicEnabled) DOM.musicEnabled.checked = this.values.music;
      if (DOM.subtitlesEnabled) {
        DOM.subtitlesEnabled.checked = this.values.subtitles;
      }
      if (DOM.qualitySelect) {
        DOM.qualitySelect.value = this.values.quality;
      }
      if (DOM.sensitivityRange) {
        DOM.sensitivityRange.value = this.values.sensitivity;
      }
    },

    readForm() {
      this.values.voice = DOM.voiceEnabled
        ? DOM.voiceEnabled.checked : true;
      this.values.music = DOM.musicEnabled
        ? DOM.musicEnabled.checked : true;
      this.values.subtitles = DOM.subtitlesEnabled
        ? DOM.subtitlesEnabled.checked : true;
      this.values.quality = DOM.qualitySelect
        ? DOM.qualitySelect.value : "medium";
      this.values.sensitivity = DOM.sensitivityRange
        ? Number(DOM.sensitivityRange.value) || 1 : 1;
    },

    async save() {
      this.readForm();
      const success = await Storage.save(
        CONFIG.settingsKey,
        this.values
      );

      if (Game.engine) {
        Game.applyQuality();
      }

      UI.notify(
        success
          ? "Paramètres enregistrés."
          : "Paramètres appliqués, mais la sauvegarde est indisponible."
      );

      return success;
    }
  };

  /* ==========================================================
     7. INTERFACE UTILISATEUR
  ========================================================== */

  const UI = {
    notificationTimer: null,

    showScreen(name) {
      const screens = [
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

      for (const key of screens) {
        if (DOM[key]) {
          Utils.setVisible(DOM[key], key === name);
        }
      }
    },

    showGame() {
      this.showScreen("gameScreen");
      State.active = true;
      State.paused = false;
      Game.resume();
    },

    showMenu() {
      State.active = false;
      State.paused = false;
      State.dialogueOpen = false;

      Dialogue.close();
      Game.stopMovement();
      this.showScreen("mainMenu");

      if (Game.engine) {
        Game.engine.stopRenderLoop();
      }

      this.updateContinueButton();
    },

    notify(message, duration = 2800) {
      if (!DOM.gameNotification) return;

      Utils.setText(DOM.gameNotification, message);
      Utils.setVisible(DOM.gameNotification, true);

      clearTimeout(this.notificationTimer);
      this.notificationTimer = setTimeout(() => {
        Utils.setVisible(DOM.gameNotification, false);
      }, duration);
    },

    loading(message, percent) {
      Utils.setText(DOM.loadingMessage, message);
      Utils.setText(DOM.loadingPercent, `${Math.round(percent)} %`);
      Utils.setProgress(DOM.loadingProgress, percent);
    },

    worldLoading(visible, message = "Préparation du monde 3D...") {
      Utils.setVisible(DOM.worldLoadingOverlay, visible);
      Utils.setText(DOM.worldLoadingText, message);
    },

    saving(visible) {
      Utils.setVisible(DOM.savingIndicator, visible);
      Utils.setText(
        DOM.saveStatus,
        visible ? "Sauvegarde en cours..." : "Sauvegarde locale prête"
      );
    },

    async updateContinueButton() {
      const available = await Storage.hasSave();

      if (DOM.continueGameButton) {
        DOM.continueGameButton.disabled = !available;
        DOM.continueGameButton.setAttribute(
          "aria-disabled",
          available ? "false" : "true"
        );
      }

      return available;
    },

    updateMissionUI() {
      const mission = MISSION_DATA[State.missionIndex];
      if (!mission) return;

      Utils.setText(
        DOM.missionNumber,
        `MISSION ${String(State.missionIndex + 1).padStart(2, "0")} / 35`
      );
      Utils.setText(DOM.missionTitle, mission.title);
      Utils.setText(DOM.objectiveText, mission.objective);

      const count = State.completedMissions.length;
      Utils.setText(DOM.objectiveProgressText, `${count} / 35`);
      Utils.setProgress(DOM.objectiveProgressBar, count / 35 * 100);

      this.updateMissionsList();
    },

    updateMissionsList() {
      if (!DOM.missionsList) return;

      DOM.missionsList.replaceChildren();

      MISSION_DATA.forEach((mission, index) => {
        const completed = State.completedMissions.includes(index);
        const current = index === State.missionIndex && !State.completed;
        const locked = index > State.missionIndex && !completed;

        const item = document.createElement("button");
        item.type = "button";
        item.className = "mission-list-item";
        item.classList.toggle("completed", completed);
        item.classList.toggle("current", current);
        item.classList.toggle("locked", locked);
        item.setAttribute(
          "aria-label",
          `Mission ${index + 1} : ${mission.title}`
        );

        const number = document.createElement("span");
        number.className = "mission-list-number";
        number.textContent = completed ? "✓" : String(index + 1);

        const details = document.createElement("span");
        details.className = "mission-list-details";

        const title = document.createElement("strong");
        title.textContent = mission.title;

        const description = document.createElement("small");
        description.textContent = completed
          ? "Mission terminée"
          : locked
            ? "À débloquer"
            : mission.objective;

        details.append(title, description);
        item.append(number, details);

        item.addEventListener("click", () => {
          if (completed || locked) {
            UI.notify(
              completed
                ? "Cette mission est déjà terminée."
                : "Terminez les missions précédentes pour continuer."
            );
            return;
          }

          UI.showScreen("gameScreen");
          State.active = true;
          State.paused = false;
          Game.resume();
        });

        DOM.missionsList.appendChild(item);
      });

      const completedCount = State.completedMissions.length;
      Utils.setText(
        DOM.missionsSummary,
        `${completedCount} mission${completedCount > 1 ? "s" : ""} terminée${completedCount > 1 ? "s" : ""} sur 35`
      );

      Utils.setProgress(
        DOM.overallProgressBar,
        completedCount / CONFIG.missionCount * 100
      );
    },

    showConfirmation(title, message, action) {
      State.confirmationAction = action;
      Utils.setText(DOM.confirmationTitle, title);
      Utils.setText(DOM.confirmationMessage, message);
      this.showScreen("confirmationScreen");
    },

    showError(title, message) {
      State.error = { title, message };
      Utils.setText(DOM.errorTitle, title);
      Utils.setText(DOM.errorMessage, message);
      this.showScreen("errorScreen");
    }
  };

  /* ==========================================================
     8. AUDIO ET DIALOGUES VOCAUX
  ========================================================== */

  const AudioSystem = {
    speak(text) {
      if (!Settings.values.voice) return;
      if (!("speechSynthesis" in window)) {
        Utils.setText(DOM.dialogueVoiceStatus, "Dialogue affiché à l'écran");
        return;
      }

      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "fr-FR";
        utterance.rate = 0.95;
        utterance.pitch = 1.05;

        utterance.onstart = () => {
          Utils.setText(DOM.dialogueVoiceStatus, "Lecture du dialogue...");
        };

        utterance.onend = () => {
          Utils.setText(DOM.dialogueVoiceStatus, "Dialogue en français");
        };

        utterance.onerror = () => {
          Utils.setText(DOM.dialogueVoiceStatus, "Dialogue affiché à l'écran");
        };

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.warn("Voix indisponible :", error);
      }
    },

    stop() {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    },

    async unlock() {
      // Les navigateurs mobiles autorisent l'audio après une action utilisateur.
      return true;
    }
  };

  /* ==========================================================
     9. CONTRÔLES DU JOUEUR
  ========================================================== */

  const Controls = {
    keys: Object.create(null),
    joystick: { x: 0, y: 0 },
    running: false,
    jumpRequested: false,
    joystickPointer: null,
    cameraPointers: new Map(),
    cameraDragging: false,
    lastCameraX: 0,
    lastCameraY: 0,
    pinchDistance: 0,
    jumpVelocity: 0,
    grounded: true,

    bind() {
      window.addEventListener("keydown", event => {
        const key = event.key.toLowerCase();

        if (
          ["arrowup", "arrowdown", "arrowleft", "arrowright", " "]
            .includes(key)
        ) {
          event.preventDefault();
        }

        this.keys[key] = true;

        if (key === " " || key === "shift") {
          if (key === " ") this.jumpRequested = true;
          if (key === "shift") this.running = true;
        }

        if (key === "e" || key === "enter") {
          if (State.active && !State.paused) {
            this.interact();
          }
        }

        if (key === "escape") {
          if (State.dialogueOpen) {
            Dialogue.close();
          } else if (State.active && !State.paused) {
            Game.pause();
          } else if (State.paused) {
            Game.resume();
          }
        }
      });

      window.addEventListener("keyup", event => {
        const key = event.key.toLowerCase();
        this.keys[key] = false;
        if (key === "shift") this.running = false;
      });

      window.addEventListener("blur", () => {
        this.keys = Object.create(null);
        this.joystick.x = 0;
        this.joystick.y = 0;
        this.running = false;
      });

      this.bindJoystick();
      this.bindCamera();
    },

    bindJoystick() {
      const base = DOM.joystickBase;
      const thumb = DOM.joystickThumb;

      if (!base || !thumb) return;

      const move = (event) => {
        if (this.joystickPointer !== event.pointerId) return;

        const rect = base.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const maxRadius = Math.max(20, rect.width * 0.31);

        let dx = event.clientX - cx;
        let dy = event.clientY - cy;

        const distance = Math.hypot(dx, dy);
        if (distance > maxRadius) {
          dx = dx / distance * maxRadius;
          dy = dy / distance * maxRadius;
        }

        this.joystick.x = Utils.clamp(dx / maxRadius, -1, 1);
        this.joystick.y = Utils.clamp(dy / maxRadius, -1, 1);

        thumb.style.transform = `translate(${dx}px, ${dy}px)`;
      };

      const finish = (event) => {
        if (this.joystickPointer !== event.pointerId) return;

        this.joystickPointer = null;
        this.joystick.x = 0;
        this.joystick.y = 0;
        thumb.style.transform = "translate(0, 0)";
      };

      base.addEventListener("pointerdown", event => {
        event.preventDefault();
        this.joystickPointer = event.pointerId;

        try {
          base.setPointerCapture(event.pointerId);
        } catch {
          // Capture tactile non prise en charge.
        }

        move(event);
      });

      base.addEventListener("pointermove", move);
      base.addEventListener("pointerup", finish);
      base.addEventListener("pointercancel", finish);
      base.addEventListener("lostpointercapture", finish);
    },

    bindCamera() {
      const canvas = DOM.canvas;
      if (!canvas) return;

      canvas.style.touchAction = "none";

      canvas.addEventListener("pointerdown", event => {
        this.cameraPointers.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY
        });

        if (this.cameraPointers.size === 1) {
          this.cameraDragging = true;
          this.lastCameraX = event.clientX;
          this.lastCameraY = event.clientY;
        }

        if (this.cameraPointers.size === 2) {
          const points = [...this.cameraPointers.values()];
          this.pinchDistance = Math.hypot(
            points[0].x - points[1].x,
            points[0].y - points[1].y
          );
        }
      });

      canvas.addEventListener("pointermove", event => {
        if (!this.cameraPointers.has(event.pointerId)) return;

        this.cameraPointers.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY
        });

        if (this.cameraPointers.size >= 2) {
          const points = [...this.cameraPointers.values()].slice(0, 2);
          const distance = Math.hypot(
            points[0].x - points[1].x,
            points[0].y - points[1].y
          );

          if (this.pinchDistance > 0 && Game.camera) {
            const delta = this.pinchDistance - distance;
            Game.camera.radius = Utils.clamp(
              Game.camera.radius + delta * 0.025,
              CONFIG.cameraMinRadius,
              CONFIG.cameraMaxRadius
            );
          }

          this.pinchDistance = distance;
          return;
        }

        if (!this.cameraDragging || !Game.camera) return;

        const dx = event.clientX - this.lastCameraX;
        const dy = event.clientY - this.lastCameraY;

        const sensitivity =
          CONFIG.cameraSensitivity * Settings.values.sensitivity;

        Game.camera.alpha -= dx * sensitivity;
        Game.camera.beta = Utils.clamp(
          Game.camera.beta + dy * sensitivity,
          0.45,
          1.35
        );

        this.lastCameraX = event.clientX;
        this.lastCameraY = event.clientY;
      });

      const endCamera = event => {
        this.cameraPointers.delete(event.pointerId);

        if (this.cameraPointers.size === 0) {
          this.cameraDragging = false;
          this.pinchDistance = 0;
        } else if (this.cameraPointers.size === 1) {
          const remaining = [...this.cameraPointers.values()][0];
          this.lastCameraX = remaining.x;
          this.lastCameraY = remaining.y;
          this.pinchDistance = 0;
        }
      };

      canvas.addEventListener("pointerup", endCamera);
      canvas.addEventListener("pointercancel", endCamera);
      canvas.addEventListener("wheel", event => {
        if (!Game.camera) return;

        event.preventDefault();
        Game.camera.radius = Utils.clamp(
          Game.camera.radius + event.deltaY * 0.01,
          CONFIG.cameraMinRadius,
          CONFIG.cameraMaxRadius
        );
      }, { passive: false });
    },

    stop() {
      this.keys = Object.create(null);
      this.joystick.x = 0;
      this.joystick.y = 0;
      this.running = false;
      this.jumpRequested = false;

      if (DOM.joystickThumb) {
        DOM.joystickThumb.style.transform = "translate(0, 0)";
      }
    },

    interact() {
      if (State.dialogueOpen) {
        Dialogue.next();
        return;
      }

      if (!State.active || State.paused) return;

      const npc = NPCSystem.findNearest();

      if (npc && npc.distance <= CONFIG.interactionDistance) {
        Dialogue.open(npc);
        return;
      }

      UI.notify("Approchez-vous d'un personnage pour interagir.");
    },

    update(delta) {
      if (!State.active || State.paused || !Game.player) return;
      if (State.dialogueOpen) return;

      const forwardInput =
        (this.keys.w || this.keys.arrowup ? 1 : 0) -
        (this.keys.s || this.keys.arrowdown ? 1 : 0) -
        this.joystick.y;

      const sideInput =
        (this.keys.d || this.keys.arrowright ? 1 : 0) -
        (this.keys.a || this.keys.arrowleft ? 1 : 0) +
        this.joystick.x;

      let forward = Utils.clamp(forwardInput, -1, 1);
      let side = Utils.clamp(sideInput, -1, 1);

      const magnitude = Math.hypot(forward, side);

      if (magnitude > 1) {
        forward /= magnitude;
        side /= magnitude;
      }

      const cameraAlpha = Game.camera ? Game.camera.alpha : 0;
      const forwardX = -Math.sin(cameraAlpha);
      const forwardZ = -Math.cos(cameraAlpha);
      const rightX = Math.cos(cameraAlpha);
      const rightZ = -Math.sin(cameraAlpha);

      const directionX = forwardX * forward + rightX * side;
      const directionZ = forwardZ * forward + rightZ * side;

      const moving = Math.hypot(directionX, directionZ) > 0.03;
      const speed = CONFIG.playerSpeed *
        ((this.running || this.keys.shift) ? CONFIG.runMultiplier : 1);

      if (moving) {
        Game.player.position.x += directionX * speed * delta;
        Game.player.position.z += directionZ * speed * delta;

        Game.player.position.x = Utils.clamp(
          Game.player.position.x,
          -CONFIG.worldLimit,
          CONFIG.worldLimit
        );

        Game.player.position.z = Utils.clamp(
          Game.player.position.z,
          -CONFIG.worldLimit,
          CONFIG.worldLimit
        );

        Game.player.rotation.y = Math.atan2(directionX, directionZ);
      }

      if (this.jumpRequested && this.grounded) {
        this.jumpVelocity = CONFIG.jumpForce;
        this.grounded = false;
      }

      this.jumpRequested = false;

      if (!this.grounded) {
        this.jumpVelocity -= CONFIG.gravity * delta;
        Game.player.position.y += this.jumpVelocity * delta;

        if (Game.player.position.y <= 0) {
          Game.player.position.y = 0;
          this.jumpVelocity = 0;
          this.grounded = true;
        }
      }

      State.playerPosition.x = Game.player.position.x;
      State.playerPosition.z = Game.player.position.z;

      NPCSystem.update(delta);
      this.updateInteractionPrompt();
    },

    updateInteractionPrompt() {
      if (!State.active || State.paused || State.dialogueOpen) {
        Utils.setVisible(DOM.interactionPrompt, false);
        return;
      }

      const nearest = NPCSystem.findNearest();

      if (nearest && nearest.distance <= CONFIG.interactionDistance) {
        Utils.setVisible(DOM.interactionPrompt, true);
        Utils.setText(DOM.interactionIcon, "♡");
        Utils.setText(DOM.interactionText, `Parler à ${nearest.name}`);

        if (DOM.interactionPrompt) {
          DOM.interactionPrompt.setAttribute(
            "aria-label",
            `Parler à ${nearest.name}`
          );
        }
      } else {
        Utils.setVisible(DOM.interactionPrompt, false);
      }
    }
  };

  /* ==========================================================
     10. MONDE 3D — DÉCORS PROCÉDURAUX
  ========================================================== */

  const World = {
    scene: null,
    materials: {},
    worldMeshes: [],
    landmarks: [],

    material(name, color, emissive = null) {
      const key = `${name}_${color}_${emissive || ""}`;
      if (this.materials[key]) return this.materials[key];

      const material = new BABYLON.StandardMaterial(
        `mat_${key}`,
        this.scene
      );

      material.diffuseColor = BABYLON.Color3.FromHexString(color);
      material.specularColor = new BABYLON.Color3(0.22, 0.22, 0.22);

      if (emissive) {
        material.emissiveColor = BABYLON.Color3.FromHexString(emissive);
      }

      this.materials[key] = material;
      return material;
    },

    track(mesh) {
      if (mesh) this.worldMeshes.push(mesh);
      return mesh;
    },

    makeBox(name, position, scaling, color, options = {}) {
      const mesh = BABYLON.MeshBuilder.CreateBox(
        name,
        { width: 1, height: 1, depth: 1 },
        this.scene
      );

      mesh.position.copyFrom(position);
      mesh.scaling.copyFrom(scaling);
      mesh.material = this.material(name, color, options.emissive);
      mesh.isPickable = false;

      return this.track(mesh);
    },

    makeSphere(name, position, scaling, color) {
      const mesh = BABYLON.MeshBuilder.CreateSphere(
        name,
        { diameter: 1, segments: 12 },
        this.scene
      );

      mesh.position.copyFrom(position);
      mesh.scaling.copyFrom(scaling);
      mesh.material = this.material(name, color);
      mesh.isPickable = false;

      return this.track(mesh);
    },

    createEnvironment() {
      this.scene = Game.scene;
      this.worldMeshes = [];
      this.landmarks = [];

      const ground = BABYLON.MeshBuilder.CreateGround(
        "love_world_ground",
        { width: 180, height: 180, subdivisions: 2 },
        this.scene
      );

      ground.material = this.material("grass", "#478B58");
      ground.isPickable = false;
      this.track(ground);

      const path = BABYLON.MeshBuilder.CreateGround(
        "central_path",
        { width: 8, height: 120 },
        this.scene
      );

      path.position.y = 0.015;
      path.material = this.material("path", "#D8BE9B");
      path.isPickable = false;
      this.track(path);

      const crossPath = BABYLON.MeshBuilder.CreateGround(
        "cross_path",
        { width: 120, height: 6 },
        this.scene
      );

      crossPath.position.y = 0.02;
      crossPath.material = this.material("cross_path", "#D8BE9B");
      crossPath.isPickable = false;
      this.track(crossPath);

      this.createFlowers();
      this.createTrees();
      this.createBenches();
      this.createFountain();
      this.createPavilion();
      this.createLandmarks();
      this.createLightingDecorations();

      const sky = BABYLON.MeshBuilder.CreateSphere(
        "love_sky",
        { diameter: 400, segments: 16 },
        this.scene
      );

      const skyMaterial = new BABYLON.StandardMaterial(
        "love_sky_material",
        this.scene
      );

      skyMaterial.backFaceCulling = false;
      skyMaterial.disableLighting = true;
      skyMaterial.emissiveColor = BABYLON.Color3.FromHexString("#9CC5EF");
      skyMaterial.diffuseColor = BABYLON.Color3.FromHexString("#9CC5EF");
      skyMaterial.specularColor = BABYLON.Color3.Black();

      sky.material = skyMaterial;
      sky.isPickable = false;
      sky.infiniteDistance = true;
      this.track(sky);
    },

    createTrees() {
      for (let i = 0; i < 52; i++) {
        const x = Utils.random(-75, 75);
        const z = Utils.random(-75, 75);

        if (Math.abs(x) < 8 || Math.abs(z) < 6) continue;

        const trunkHeight = Utils.random(2.0, 3.8);

        const trunk = BABYLON.MeshBuilder.CreateCylinder(
          `tree_trunk_${i}`,
          {
            height: trunkHeight,
            diameterTop: 0.22,
            diameterBottom: 0.5,
            tessellation: 7
          },
          this.scene
        );

        trunk.position.set(x, trunkHeight / 2, z);
        trunk.material = this.material("tree_trunk", "#795239");
        trunk.isPickable = false;
        this.track(trunk);

        const crown = BABYLON.MeshBuilder.CreateSphere(
          `tree_crown_${i}`,
          { diameter: Utils.random(2.5, 4.5), segments: 7 },
          this.scene
        );

        crown.position.set(x, trunkHeight + 0.7, z);
        crown.scaling.y = 1.15;
        crown.material = this.material(
          "tree_crown",
          i % 2 ? "#28784A" : "#398D54"
        );
        crown.isPickable = false;
        this.track(crown);
      }
    },

    createFlowers() {
      const colors = ["#F3A6C8", "#FFF0D6", "#E5A0F0", "#F4D35E"];

      for (let i = 0; i < 85; i++) {
        const x = Utils.random(-48, 48);
        const z = Utils.random(-48, 48);

        if (Math.abs(x) < 6 || Math.abs(z) < 5) continue;

        const stem = BABYLON.MeshBuilder.CreateCylinder(
          `flower_stem_${i}`,
          { height: 0.5, diameter: 0.045, tessellation: 5 },
          this.scene
        );

        stem.position.set(x, 0.25, z);
        stem.material = this.material("flower_stem", "#34734A");
        stem.isPickable = false;
        this.track(stem);

        const flower = BABYLON.MeshBuilder.CreateSphere(
          `flower_head_${i}`,
          { diameter: 0.22, segments: 6 },
          this.scene
        );

        flower.position.set(x, 0.55, z);
        flower.material = this.material(
          "flower_head",
          colors[i % colors.length]
        );
        flower.isPickable = false;
        this.track(flower);
      }
    },

    createBenches() {
      const positions = [
        [-12, 2], [12, 2], [-18, -15], [18, -15],
        [-15, 24], [15, 24], [-28, 10], [28, 10]
      ];

      positions.forEach((p, index) => {
        const x = p[0];
        const z = p[1];

        this.makeBox(
          `bench_seat_${index}`,
          new BABYLON.Vector3(x, 0.65, z),
          new BABYLON.Vector3(2.2, 0.18, 0.65),
          "#986443"
        );

        for (const side of [-0.75, 0.75]) {
          this.makeBox(
            `bench_leg_${index}_${side}`,
            new BABYLON.Vector3(x + side, 0.32, z),
            new BABYLON.Vector3(0.15, 0.65, 0.18),
            "#5B4337"
          );
        }

        this.makeBox(
          `bench_back_${index}`,
          new BABYLON.Vector3(x, 1.05, z - 0.25),
          new BABYLON.Vector3(2.2, 0.65, 0.13),
          "#986443"
        );
      });
    },

    createFountain() {
      const base = BABYLON.MeshBuilder.CreateCylinder(
        "fountain_base",
        { height: 0.45, diameter: 5, tessellation: 32 },
        this.scene
      );

      base.position.set(0, 0.22, 13);
      base.material = this.material("fountain_stone", "#D8D4D0");
      base.isPickable = false;
      this.track(base);

      const water = BABYLON.MeshBuilder.CreateCylinder(
        "fountain_water",
        { height: 0.07, diameter: 4.2, tessellation: 32 },
        this.scene
      );

      water.position.set(0, 0.48, 13);
      water.material = this.material(
        "fountain_water",
        "#68C7EA",
        "#2A7597"
      );
      water.isPickable = false;
      this.track(water);

      const column = BABYLON.MeshBuilder.CreateCylinder(
        "fountain_column",
        { height: 1.7, diameter: 0.55, tessellation: 16 },
        this.scene
      );

      column.position.set(0, 1.25, 13);
      column.material = this.material("fountain_column", "#EDE5DA");
      column.isPickable = false;
      this.track(column);

      const upper = BABYLON.MeshBuilder.CreateCylinder(
        "fountain_upper",
        { height: 0.18, diameter: 1.9, tessellation: 24 },
        this.scene
      );

      upper.position.set(0, 2.0, 13);
      upper.material = this.material("fountain_upper", "#F2E6D6");
      upper.isPickable = false;
      this.track(upper);
    },

    createPavilion() {
      this.makeBox(
        "pavilion_floor",
        new BABYLON.Vector3(-22, 0.12, -20),
        new BABYLON.Vector3(10, 0.24, 8),
        "#D8C7AD"
      );

      for (const x of [-26, -22, -18]) {
        for (const z of [-23, -17]) {
          const column = BABYLON.MeshBuilder.CreateCylinder(
            `pavilion_column_${x}_${z}`,
            { height: 4, diameter: 0.32, tessellation: 10 },
            this.scene
          );

          column.position.set(x, 2.1, z);
          column.material = this.material("pavilion_column", "#FFF0E5");
          column.isPickable = false;
          this.track(column);
        }
      }

      this.makeBox(
        "pavilion_roof",
        new BABYLON.Vector3(-22, 4.2, -20),
        new BABYLON.Vector3(11, 0.45, 9),
        "#C77791"
      );
    },

    createLandmarks() {
      const locations = [
        { name: "Le jardin romantique", x: -10, z: -8 },
        { name: "L'allée des fleurs", x: 8, z: -12 },
        { name: "La place centrale", x: 0, z: 0 },
        { name: "Le pavillon", x: -22, z: -20 },
        { name: "Le jardin secret", x: 18, z: 22 },
        { name: "Le banc des rencontres", x: -12, z: 2 },
        { name: "Le parterre fleuri", x: 20, z: -8 },
        { name: "La fontaine", x: 0, z: 13 },
        { name: "Le sentier paisible", x: -25, z: 15 },
        { name: "La terrasse", x: 26, z: -20 },
        { name: "Le kiosque", x: 25, z: 17 },
        { name: "Le jardin calme", x: -30, z: -8 },
        { name: "L'allée des souvenirs", x: -35, z: 25 },
        { name: "Le chemin du parc", x: 35, z: 25 },
        { name: "La roseraie", x: 34, z: -10 },
        { name: "La place fleurie", x: -38, z: -20 },
        { name: "Le petit pont", x: 0, z: 34 },
        { name: "Le jardin ouvert", x: -5, z: -35 },
        { name: "Le pavillon fleuri", x: 42, z: 8 },
        { name: "Le jardin des rêves", x: -42, z: 5 },
        { name: "Le sentier du lac", x: 0, z: 48 },
        { name: "La clairière", x: -48, z: -25 },
        { name: "Le belvédère", x: 48, z: -35 },
        { name: "Le jardin lumineux", x: 10, z: 43 },
        { name: "Le banc tranquille", x: -20, z: 42 },
        { name: "Le carrefour du parc", x: 0, z: -10 },
        { name: "Le jardin des promesses", x: 40, z: 40 },
        { name: "La grande terrasse", x: -42, z: 38 },
        { name: "La roseraie centrale", x: 0, z: 25 },
        { name: "La place de l'amitié", x: 30, z: 0 },
        { name: "Le chemin de l'espoir", x: -30, z: -38 },
        { name: "Le jardin de l'avenir", x: 20, z: -45 },
        { name: "Le jardin du cœur", x: -15, z: -45 },
        { name: "La grande place des souvenirs", x: 0, z: 0 }
      ];

      this.landmarks = locations;

      locations.forEach((place, index) => {
        const marker = BABYLON.MeshBuilder.CreateCylinder(
          `landmark_${index}`,
          { height: 0.05, diameter: 1.7, tessellation: 24 },
          this.scene
        );

        marker.position.set(place.x, 0.04, place.z);
        marker.material = this.material(
          `landmark_material_${index}`,
          index % 2 ? "#F0A4C7" : "#EBD28A",
          "#8A526D"
        );
        marker.isPickable = false;
        this.track(marker);
      });
    },

    createLightingDecorations() {
      for (let i = 0; i < 14; i++) {
        const angle = i / 14 * Math.PI * 2;
        const x = Math.cos(angle) * 36;
        const z = Math.sin(angle) * 36;

        const pole = BABYLON.MeshBuilder.CreateCylinder(
          `light_pole_${i}`,
          { height: 3.2, diameter: 0.12, tessellation: 8 },
          this.scene
        );

        pole.position.set(x, 1.6, z);
        pole.material = this.material("light_pole", "#65546D");
        pole.isPickable = false;
        this.track(pole);

        const lamp = BABYLON.MeshBuilder.CreateSphere(
          `light_lamp_${i}`,
          { diameter: 0.35, segments: 8 },
          this.scene
        );

        lamp.position.set(x, 3.25, z);
        lamp.material = this.material(
          "light_lamp",
          "#FFE8B0",
          "#F4CE73"
        );
        lamp.isPickable = false;
        this.track(lamp);
      }
    },

    clearWorldObjects() {
      this.worldMeshes.forEach(mesh => {
        if (mesh && !mesh.isDisposed()) mesh.dispose();
      });

      this.worldMeshes = [];
      this.landmarks = [];

      Object.values(this.materials).forEach(material => {
        if (material && !material.isDisposed()) material.dispose();
      });

      this.materials = {};
    }
  };

  /* ==========================================================
     11. PERSONNAGES NON-JOUEURS
  ========================================================== */

  const NPCSystem = {
    list: [],
    activeNPC: null,

    definitions: [
      { name: "Camille", color: "#D95E93", hair: "#55342C", x: -10, z: -8 },
      { name: "Lucas", color: "#4F8FCB", hair: "#4A3429", x: 8, z: -12 },
      { name: "Sofia", color: "#B47BE0", hair: "#352A2D", x: 0, z: 0 },
      { name: "Gabriel", color: "#55A77D", hair: "#4D3327", x: -22, z: -20 }
    ],

    createNPC(definition, index) {
      const root = new BABYLON.TransformNode(
        `npc_${definition.name}_${index}`,
        Game.scene
      );

      root.position.set(definition.x, 0, definition.z);

      const body = BABYLON.MeshBuilder.CreateCylinder(
        `npc_body_${index}`,
        {
          height: 1.35,
          diameterTop: 0.55,
          diameterBottom: 0.72,
          tessellation: 12
        },
        Game.scene
      );

      body.parent = root;
      body.position.y = 0.88;
      body.material = World.material(
        `npc_body_mat_${index}`,
        definition.color
      );
      body.isPickable = false;

      const head = BABYLON.MeshBuilder.CreateSphere(
        `npc_head_${index}`,
        { diameter: 0.72, segments: 12 },
        Game.scene
      );

      head.parent = root;
      head.position.y = 1.8;
      head.material = World.material(
        `npc_head_mat_${index}`,
        "#F0C6A5"
      );
      head.isPickable = false;

      const hair = BABYLON.MeshBuilder.CreateSphere(
        `npc_hair_${index}`,
        { diameter: 0.76, segments: 10 }
      , Game.scene);

      hair.parent = root;
      hair.position.y = 2.0;
      hair.scaling.y = 0.6;
      hair.material = World.material(
        `npc_hair_mat_${index}`,
        definition.hair
      );
      hair.isPickable = false;

      const eyeMaterial = World.material(
        `npc_eye_mat_${index}`,
        "#30252B"
      );

      for (const eyeX of [-0.13, 0.13]) {
        const eye = BABYLON.MeshBuilder.CreateSphere(
          `npc_eye_${index}_${eyeX}`,
          { diameter: 0.065, segments: 6 },
          Game.scene
        );

        eye.parent = root;
        eye.position.set(eyeX, 1.83, -0.335);
        eye.material = eyeMaterial;
        eye.isPickable = false;
      }

      const marker = BABYLON.MeshBuilder.CreateTorus(
        `npc_marker_${index}`,
        { diameter: 1.05, thickness: 0.075, tessellation: 24 },
        Game.scene
      );

      marker.parent = root;
      marker.position.y = 0.08;
      marker.rotation.x = Math.PI / 2;
      marker.material = World.material(
        `npc_marker_mat_${index}`,
        "#F4C2D7",
        "#C75A90"
      );
      marker.isPickable = false;

      return {
        name: definition.name,
        root,
        marker,
        homeX: definition.x,
        homeZ: definition.z,
        distance: Infinity,
        phase: Math.random() * Math.PI * 2,
        index
      };
    },

    create() {
      this.clear();

      this.list = this.definitions.map((definition, index) => {
        return this.createNPC(definition, index);
      });
    },

    clear() {
      this.list.forEach(npc => {
        if (npc.root && !npc.root.isDisposed()) {
          npc.root.getChildMeshes().forEach(mesh => mesh.dispose());
          npc.root.dispose();
        }
      });

      this.list = [];
      this.activeNPC = null;
    },

    update(delta) {
      if (!Game.player) return;

      for (const npc of this.list) {
        const dx = Game.player.position.x - npc.root.position.x;
        const dz = Game.player.position.z - npc.root.position.z;

        npc.distance = Math.hypot(dx, dz);

        npc.phase += delta * 1.2;
        npc.marker.position.y = 0.08 + Math.sin(npc.phase) * 0.04;

        if (npc.distance < 10 && npc.distance > 0.1) {
          npc.root.rotation.y = Math.atan2(dx, dz);
        }
      }
    },

    findNearest() {
      if (!Game.player || !this.list.length) return null;

      let nearest = null;
      let distance = Infinity;

      for (const npc of this.list) {
        const current = Utils.distanceXZ(
          Game.player.position,
          npc.root.position
        );

        if (current < distance) {
          distance = current;
          nearest = npc;
        }
      }

      if (!nearest) return null;

      return {
        ...nearest,
        distance,
        root: nearest.root
      };
    },

    getByName(name) {
      return this.list.find(npc => npc.name === name) || null;
    },

    moveToMissionTarget(missionIndex) {
      const mission = MISSION_DATA[missionIndex];
      if (!mission) return;

      const npc = this.getByName(mission.person);
      if (!npc) return;

      this.activeNPC = npc;
      npc.marker.material = World.material(
        "npc_active_marker",
        "#FFD36D",
        "#E6A83D"
      );
    }
  };

  /* ==========================================================
     12. PERSONNAGE JOUEUR
  ========================================================== */

  const CharacterSystem = {
    create() {
      const root = new BABYLON.TransformNode("love_player", Game.scene);
      root.position.set(0, 0, -5);

      const body = BABYLON.MeshBuilder.CreateCapsule(
        "player_body",
        { height: 1.7, radius: 0.42, tessellation: 12 },
        Game.scene
      );

      body.parent = root;
      body.position.y = 0.9;
      body.material = World.material("player_body_material", "#7D5AB6");
      body.isPickable = false;

      const head = BABYLON.MeshBuilder.CreateSphere(
        "player_head",
        { diameter: 0.68, segments: 12 },
        Game.scene
      );

      head.parent = root;
      head.position.y = 1.95;
      head.material = World.material("player_head_material", "#E9BFA0");
      head.isPickable = false;

      const hair = BABYLON.MeshBuilder.CreateSphere(
        "player_hair",
        { diameter: 0.72, segments: 10 },
        Game.scene
      );

      hair.parent = root;
      hair.position.y = 2.14;
      hair.scaling.y = 0.55;
      hair.material = World.material("player_hair_material", "#3E2C29");
      hair.isPickable = false;

      const footMaterial = World.material("player_foot_material", "#302C38");

      for (const x of [-0.18, 0.18]) {
        const foot = BABYLON.MeshBuilder.CreateBox(
          `player_foot_${x}`,
          { width: 0.22, height: 0.18, depth: 0.4 },
          Game.scene
        );

        foot.parent = root;
        foot.position.set(x, 0.13, 0.03);
        foot.material = footMaterial;
        foot.isPickable = false;
      }

      return root;
    },

    animate() {
      // Les animations de déplacement sont gérées par le moteur.
      // Cette méthode est conservée pour assurer la compatibilité.
    }
  };

  /* ==========================================================
     13. DIALOGUES
  ========================================================== */

  const Dialogue = {
    npc: null,
    mission: null,
    choices: [],
    step: 0,

    open(npc) {
      if (!npc || !State.active || State.paused) return;

      const mission = MISSION_DATA[State.missionIndex];
      if (!mission) return;

      if (npc.name !== mission.person) {
        UI.notify(`Pour cette mission, recherchez ${mission.person}.`);
        return;
      }

      this.npc = npc;
      this.mission = mission;
      this.step = 0;

      State.dialogueOpen = true;
      Game.stopMovement();

      Utils.setText(DOM.speakerName, npc.name);
      Utils.setText(DOM.speakerAvatar, "♡");
      Utils.setText(DOM.dialogueVoiceStatus, "Dialogue en français");
      Utils.setText(DOM.dialogueText, mission.dialogue);

      if (DOM.dialogueChoices) {
        DOM.dialogueChoices.replaceChildren();

        const choices = [
          "Je suis heureux de vous rencontrer.",
          "J'aimerais mieux vous connaître.",
          "Merci pour ce beau moment."
        ];

        choices.forEach((choice, index) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "dialogue-choice-button";
          button.textContent = choice;

          button.addEventListener("click", () => {
            this.choose(index, choice);
          });

          DOM.dialogueChoices.appendChild(button);
        });
      }

      Utils.setVisible(DOM.dialoguePanel, true);
      Utils.setVisible(DOM.interactionPrompt, false);

      AudioSystem.speak(mission.dialogue);
    },

    choose(index, choice) {
      if (!State.dialogueOpen) return;

      const replies = [
        "C'est gentil. J'apprécie les rencontres où chacun peut être lui-même.",
        "Avec plaisir. Prenons le temps d'échanger et de nous écouter.",
        "Merci à vous aussi. Le respect et la bienveillance rendent ce moment précieux."
      ];

      this.step = index + 1;

      Utils.setText(DOM.dialogueText, replies[index] || replies[0]);

      if (DOM.dialogueChoices) {
        DOM.dialogueChoices.replaceChildren();

        const selected = document.createElement("p");
        selected.className = "dialogue-selected-choice";
        selected.textContent = `Vous : « ${choice} »`;
        DOM.dialogueChoices.appendChild(selected);
      }

      AudioSystem.speak(replies[index] || replies[0]);

      if (DOM.nextDialogueButton) {
        DOM.nextDialogueButton.textContent =
          this.step >= 1 ? "Terminer la conversation ✓" : "Continuer →";
      }
    },

    next() {
      if (!State.dialogueOpen) return;

      if (this.step === 0) {
        this.choose(0, "Je suis heureux de vous rencontrer.");
        return;
      }

      const missionIndex = State.missionIndex;
      this.close();

      Game.completeMission(missionIndex);
    },

    repeat() {
      if (!this.mission) return;
      AudioSystem.speak(
        DOM.dialogueText ? DOM.dialogueText.textContent : this.mission.dialogue
      );
    },

    close() {
      State.dialogueOpen = false;
      AudioSystem.stop();
      Utils.setVisible(DOM.dialoguePanel, false);

      if (DOM.nextDialogueButton) {
        DOM.nextDialogueButton.textContent = "Continuer →";
      }

      this.npc = null;
      this.mission = null;
      this.step = 0;
    }
  };

  /* ==========================================================
     14. MOTEUR PRINCIPAL
  ========================================================== */

  const Game = {
    engine: null,
    scene: null,
    camera: null,
    player: null,
    light: null,
    resizeHandler: null,
    initialized: false,
    initializing: false,
    lastFrameTime: 0,
    autosaveTimer: null,

    async ensureWorld() {
      if (this.scene && !this.scene.isDisposed()) {
        return true;
      }

      if (typeof BABYLON === "undefined") {
        throw new Error(
          "Babylon.js n'est pas chargé. Vérifiez votre connexion Internet et les scripts Babylon.js dans le HTML."
        );
      }

      if (!DOM.canvas) {
        throw new Error("Le canvas #loveGameCanvas est introuvable.");
      }

      UI.worldLoading(true, "Création du moteur 3D...");

      try {
        this.engine = new BABYLON.Engine(
          DOM.canvas,
          true,
          {
            preserveDrawingBuffer: false,
            stencil: true,
            antialias: true,
            adaptToDeviceRatio: true
          }
        );

        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.58, 0.75, 0.92, 1);
        this.scene.collisionsEnabled = false;
        this.scene.skipPointerMovePicking = true;

        this.light = new BABYLON.HemisphericLight(
          "love_ambient_light",
          new BABYLON.Vector3(0, 1, 0),
          this.scene
        );

        this.light.intensity = 0.95;
        this.light.groundColor = new BABYLON.Color3(0.3, 0.34, 0.28);

        const sunlight = new BABYLON.DirectionalLight(
          "love_sunlight",
          new BABYLON.Vector3(-0.4, -1, 0.3),
          this.scene
        );

        sunlight.position = new BABYLON.Vector3(20, 35, -20);
        sunlight.intensity = 0.7;

        this.camera = new BABYLON.ArcRotateCamera(
          "love_camera",
          -Math.PI / 2,
          1.05,
          10,
          new BABYLON.Vector3(0, 1.2, 0),
          this.scene
        );

        this.camera.lowerRadiusLimit = CONFIG.cameraMinRadius;
        this.camera.upperRadiusLimit = CONFIG.cameraMaxRadius;
        this.camera.lowerBetaLimit = 0.45;
        this.camera.upperBetaLimit = 1.35;
        this.camera.wheelPrecision = 25;
        this.camera.panningSensibility = 0;
        this.camera.attachControl(DOM.canvas, false);

        UI.worldLoading(true, "Création du jardin romantique...");
        World.createEnvironment();

        UI.worldLoading(true, "Création du personnage...");
        this.player = CharacterSystem.create();

        this.camera.lockedTarget = this.player;
        this.camera.target = new BABYLON.Vector3(0, 1.1, -5);

        UI.worldLoading(true, "Préparation des personnages...");
        NPCSystem.create();

        this.applyQuality();

        this.engine.runRenderLoop(() => {
          if (!this.scene || this.scene.isDisposed()) return;

          const now = performance.now();
          const delta = Math.min(
            (now - (this.lastFrameTime || now)) / 1000,
            0.05
          );

          this.lastFrameTime = now;

          if (State.active && !State.paused) {
            State.gameTime += delta;
            Controls.update(delta);
          }

          try {
            this.scene.render();
          } catch (error) {
            console.error("Erreur rendu 3D :", error);
          }
        });

        if (this.resizeHandler) {
          window.removeEventListener("resize", this.resizeHandler);
        }

        this.resizeHandler = () => {
          if (this.engine) this.engine.resize();
        };

        window.addEventListener("resize", this.resizeHandler);

        this.initialized = true;
        this.initializing = false;
        State.worldReady = true;
        State.engineReady = true;

        UI.worldLoading(false);
        return true;
      } catch (error) {
        this.initializing = false;
        State.worldReady = false;
        State.engineReady = false;

        console.error("Impossible de créer le monde FOBAS :", error);

        UI.worldLoading(false);

        if (this.engine) {
          try {
            this.engine.stopRenderLoop();
            this.engine.dispose();
          } catch {
            // Nettoyage.
          }
        }

        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.player = null;

        throw error;
      }
    },

    applyQuality() {
      if (!this.engine || !this.scene) return;

      const quality = Settings.values.quality;

      if (quality === "low") {
        this.engine.setHardwareScalingLevel(1.4);
        this.scene.shadowsEnabled = false;
      } else if (quality === "high") {
        this.engine.setHardwareScalingLevel(0.75);
        this.scene.shadowsEnabled = true;
      } else {
        this.engine.setHardwareScalingLevel(1);
        this.scene.shadowsEnabled = false;
      }

      this.engine.resize();
    },

    async startNewGame() {
      if (this.initializing) return;
      this.initializing = true;

      try {
        UI.showScreen("gameScreen");
        UI.worldLoading(true, "Préparation de votre aventure...");

        await AudioSystem.unlock();
        await this.ensureWorld();

        State.missionIndex = 0;
        State.completedMissions = [];
        State.started = true;
        State.completed = false;
        State.active = true;
        State.paused = false;
        State.dialogueOpen = false;
        State.gameTime = 0;

        this.resetPlayer();
        this.beginMission(0);

        UI.worldLoading(false);
        UI.showGame();
        UI.notify("Votre aventure commence. Approchez-vous de Camille.");

        await this.saveGame();
      } catch (error) {
        console.error(error);
        UI.showError(
          "Impossible de démarrer le jeu",
          error && error.message
            ? error.message
            : "Le monde 3D n'a pas pu être créé. Vérifiez que Babylon.js est chargé et réessayez."
        );
      } finally {
        this.initializing = false;
      }
    },

    async continueGame() {
      if (this.initializing) return;
      this.initializing = true;

      try {
        UI.showScreen("gameScreen");
        UI.worldLoading(true, "Récupération de votre progression...");

        await this.ensureWorld();

        const save = await Storage.load(CONFIG.storageKey);

        if (!save || !save.started) {
          UI.notify("Aucune sauvegarde disponible. Commencez une nouvelle aventure.");
          UI.showScreen("mainMenu");
          return;
        }

        State.missionIndex = Utils.clamp(
          Number(save.missionIndex) || 0,
          0,
          CONFIG.missionCount - 1
        );

        State.completedMissions = Array.isArray(save.completedMissions)
          ? save.completedMissions.filter(
              index => Number.isInteger(index) &&
                index >= 0 &&
                index < CONFIG.missionCount
            )
          : [];

        State.started = true;
        State.completed = Boolean(save.completed);
        State.active = true;
        State.paused = false;
        State.gameTime = Number(save.gameTime) || 0;

        this.resetPlayer();

        if (save.playerPosition && this.player) {
          this.player.position.x = Utils.clamp(
            Number(save.playerPosition.x) || 0,
            -CONFIG.worldLimit,
            CONFIG.worldLimit
          );

          this.player.position.z = Utils.clamp(
            Number(save.playerPosition.z) || 0,
            -CONFIG.worldLimit,
            CONFIG.worldLimit
          );
        }

        State.playerPosition.x = this.player.position.x;
        State.playerPosition.z = this.player.position.z;

        if (State.completedMissions.includes(State.missionIndex)) {
          const next = State.completedMissions.findIndex(
            index => index !== State.missionIndex
          );

          if (next >= 0) {
            State.missionIndex = next;
          } else {
            State.missionIndex = Math.min(
              State.completedMissions.length,
              CONFIG.missionCount - 1
            );
          }
        }

        State.completed = State.completedMissions.length >= CONFIG.missionCount;

        if (State.completed) {
          UI.worldLoading(false);
          UI.showScreen("endingScreen");
          return;
        }

        this.beginMission(State.missionIndex);

        UI.worldLoading(false);
        UI.showGame();
        UI.notify("Progression récupérée avec succès.");
      } catch (error) {
        console.error("Erreur chargement :", error);
        UI.showError(
          "Impossible de continuer",
          error && error.message
            ? error.message
            : "La sauvegarde ou le monde 3D n'a pas pu être chargé."
        );
      } finally {
        this.initializing = false;
      }
    },

    resetPlayer() {
      if (!this.player) return;

      this.player.position.set(0, 0, -5);
      this.player.rotation.y = 0;

      State.playerPosition = { x: 0, z: -5 };

      if (this.camera) {
        this.camera.alpha = -Math.PI / 2;
        this.camera.beta = 1.05;
        this.camera.radius = 10;
        this.camera.target = new BABYLON.Vector3(0, 1.1, -5);
      }
    },

    beginMission(index) {
      if (!Number.isInteger(index) || index < 0 ||
          index >= CONFIG.missionCount) {
        UI.notify("Cette mission n'existe pas.");
        return false;
      }

      State.missionIndex = index;
      State.completed = false;
      State.dialogueOpen = false;
      Dialogue.close();

      NPCSystem.moveToMissionTarget(index);
      UI.updateMissionUI();
      UI.updateMissionsList();

      this.saveGame();
      return true;
    },

    async completeMission(index) {
      if (index !== State.missionIndex) return;
      if (State.completedMissions.includes(index)) return;

      State.completedMissions.push(index);
      State.completedMissions.sort((a, b) => a - b);

      await this.saveGame();

      if (State.completedMissions.length >= CONFIG.missionCount) {
        State.completed = true;
        State.active = false;
        UI.showScreen("endingScreen");
        UI.notify("Félicitations ! Vous avez terminé les 35 missions.", 5000);
        return;
      }

      Utils.setText(
        DOM.completionTitle,
        "Mission accomplie !"
      );

      Utils.setText(
        DOM.completionMessage,
        `Vous avez terminé « ${MISSION_DATA[index].title} ». Une nouvelle étape de votre histoire vous attend.`
      );

      Utils.setText(
        DOM.completionProgress,
        `${State.completedMissions.length} / ${CONFIG.missionCount}`
      );

      UI.showScreen("missionCompleteScreen");
      State.active = false;
      State.paused = false;

      UI.updateMissionsList();
    },

    async nextMission() {
      const nextIndex = State.missionIndex + 1;

      if (nextIndex >= CONFIG.missionCount) {
        UI.showScreen("endingScreen");
        return;
      }

      State.active = true;
      State.paused = false;

      this.beginMission(nextIndex);
      UI.showGame();

      UI.notify(
        `Mission ${nextIndex + 1} : ${MISSION_DATA[nextIndex].title}`
      );

      await this.saveGame();
    },

    startMission(index) {
      if (!Number.isInteger(index) ||
          index < 0 ||
          index >= CONFIG.missionCount) {
        UI.notify("Mission invalide.");
        return false;
      }

      if (State.completedMissions.includes(index)) {
        UI.notify("Cette mission est déjà terminée.");
        return false;
      }

      if (index !== State.missionIndex) {
        UI.notify("Terminez d'abord la mission actuelle.");
        return false;
      }

      return this.beginMission(index);
    },

    pause() {
      if (!State.started || !State.active || State.paused) return;

      State.paused = true;
      State.active = false;

      Controls.stop();
      AudioSystem.stop();

      UI.showScreen("pauseScreen");
    },

    resume() {
      if (!this.scene || this.scene.isDisposed()) return;

      State.paused = false;
      State.active = true;

      UI.showScreen("gameScreen");

      if (this.engine) {
        this.engine.runRenderLoop(() => {
          if (!this.scene || this.scene.isDisposed()) return;

          const now = performance.now();
          const delta = Math.min(
            (now - (this.lastFrameTime || now)) / 1000,
            0.05
          );

          this.lastFrameTime = now;

          if (State.active && !State.paused) {
            State.gameTime += delta;
            Controls.update(delta);
          }

          this.scene.render();
        });
      }
    },

    stopMovement() {
      Controls.stop();
    },

    async saveGame() {
      if (!State.started) return false;

      UI.saving(true);

      const data = {
        version: CONFIG.version,
        started: State.started,
        completed: State.completed,
        missionIndex: State.missionIndex,
        completedMissions: State.completedMissions,
        playerPosition: this.player
          ? {
              x: this.player.position.x,
              z: this.player.position.z
            }
          : State.playerPosition,
        gameTime: State.gameTime,
        savedAt: new Date().toISOString()
      };

      const success = await Storage.save(CONFIG.storageKey, data);

      State.lastSave = Date.now();
      UI.saving(false);
      UI.updateContinueButton();

      if (!success) {
        UI.notify(
          "Le navigateur a refusé la sauvegarde. Vérifiez l'espace disponible."
        );
      }

      return success;
    },

    async returnToMenu() {
      if (State.started) {
        await this.saveGame();
      }

      Controls.stop();
      Dialogue.close();
      State.active = false;
      State.paused = false;

      UI.showMenu();
    },

    restart() {
      UI.showConfirmation(
        "Recommencer l'aventure ?",
        "Votre progression actuelle sera effacée. Voulez-vous vraiment recommencer ?",
        async () => {
          await Storage.remove(CONFIG.storageKey);
          await this.startNewGame();
        }
      );
    }
  };

  /* ==========================================================
     15. BOUTONS ET NAVIGATION
  ========================================================== */

  function bindButtons() {
    Utils.button(DOM.newGameButton, () => {
      UI.showConfirmation(
        "Nouvelle aventure",
        "Commencer une nouvelle aventure ? Une progression existante sera remplacée.",
        async () => {
          await Storage.remove(CONFIG.storageKey);
          await Game.startNewGame();
        }
      );
    });

    Utils.button(DOM.continueGameButton, () => {
      Game.continueGame();
    });

    Utils.button(DOM.missionsMenuButton, async () => {
      UI.updateMissionsList();
      UI.showScreen("missionsScreen");
    });

    Utils.button(DOM.settingsButton, () => {
      Settings.applyToForm();
      UI.showScreen("settingsScreen");
    });

    Utils.button(DOM.creditsButton, () => {
      UI.showScreen("creditsScreen");
    });

    Utils.button(DOM.closeCreditsButton, () => {
      UI.showScreen("mainMenu");
    });

    Utils.button(DOM.pauseButton, () => {
      Game.pause();
    });

    Utils.button(DOM.resumeButton, () => {
      Game.resume();
    });

    Utils.button(DOM.openMissionsButton, () => {
      UI.updateMissionsList();
      State.active = false;
      State.paused = true;
      UI.showScreen("missionsScreen");
    });

    Utils.button(DOM.closeMissionsButton, () => {
      if (State.started && !State.completed) {
        Game.resume();
      } else {
        UI.showScreen("mainMenu");
      }
    });

    Utils.button(DOM.pauseMissionsButton, () => {
      UI.updateMissionsList();
      UI.showScreen("missionsScreen");
    });

    Utils.button(DOM.saveGameButton, async () => {
      const saved = await Game.saveGame();
      UI.notify(
        saved
          ? "Progression sauvegardée."
          : "Impossible de sauvegarder la progression."
      );
    });

    Utils.button(DOM.returnToMenuButton, () => {
      UI.showConfirmation(
        "Retour au menu",
        "Votre progression sera sauvegardée avant le retour au menu.",
        async () => Game.returnToMenu()
      );
    });

    Utils.button(DOM.saveSettingsButton, () => {
      Settings.save();
    });

    Utils.button(DOM.closeSettingsButton, () => {
      if (State.started && !State.completed) {
        Game.resume();
      } else {
        UI.showScreen("mainMenu");
      }
    });

    Utils.button(DOM.interactionPrompt, () => {
      Controls.interact();
    });

    Utils.button(DOM.talkButton, () => {
      Controls.interact();
    });

    Utils.button(DOM.runButton, () => {
      Controls.running = !Controls.running;
      DOM.runButton.classList.toggle("active", Controls.running);
      UI.notify(
        Controls.running
          ? "Course activée."
          : "Course désactivée."
      );
    });

    if (DOM.runButton) {
      DOM.runButton.addEventListener("pointerdown", () => {
        Controls.running = true;
      });

      const stopRun = () => {
        Controls.running = false;
      };

      DOM.runButton.addEventListener("pointerup", stopRun);
      DOM.runButton.addEventListener("pointercancel", stopRun);
      DOM.runButton.addEventListener("pointerleave", stopRun);
    }

    Utils.button(DOM.jumpButton, () => {
      if (State.active && !State.paused) {
        Controls.jumpRequested = true;
      }
    });

    Utils.button(DOM.closeDialogueButton, () => {
      Dialogue.close();
    });

    Utils.button(DOM.repeatDialogueButton, () => {
      Dialogue.repeat();
    });

    Utils.button(DOM.nextDialogueButton, () => {
      Dialogue.next();
    });

    Utils.button(DOM.nextMissionButton, () => {
      Game.nextMission();
    });

    Utils.button(DOM.completionMenuButton, () => {
      Game.returnToMenu();
    });

    Utils.button(DOM.restartGameButton, () => {
      Game.restart();
    });

    Utils.button(DOM.endingMenuButton, () => {
      Game.returnToMenu();
    });

    Utils.button(DOM.cancelConfirmationButton, () => {
      State.confirmationAction = null;

      if (State.started && !State.completed) {
        Game.resume();
      } else {
        UI.showScreen("mainMenu");
      }
    });

    Utils.button(DOM.acceptConfirmationButton, async () => {
      const action = State.confirmationAction;
      State.confirmationAction = null;

      if (typeof action === "function") {
        await action();
      } else {
        UI.showScreen("mainMenu");
      }
    });

    Utils.button(DOM.retryButton, () => {
      Game.startNewGame();
    });

    Utils.button(DOM.errorMenuButton, () => {
      UI.showMenu();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && State.active && !State.paused) {
        Game.pause();
        Game.saveGame();
      }
    });

    window.addEventListener("beforeunload", () => {
      if (!State.started) return;

      try {
        const data = {
          version: CONFIG.version,
          started: State.started,
          completed: State.completed,
          missionIndex: State.missionIndex,
          completedMissions: State.completedMissions,
          playerPosition: Game.player
            ? {
                x: Game.player.position.x,
                z: Game.player.position.z
              }
            : State.playerPosition,
          gameTime: State.gameTime
        };

        localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
      } catch {
        // Le stockage peut être bloqué par le navigateur.
      }
    });
  }

  /* ==========================================================
     16. VÉRIFICATION DES MISSIONS
  ========================================================== */

  function validateMissions() {
    if (MISSION_DATA.length !== CONFIG.missionCount) {
      console.error(
        `Nombre de missions incorrect : ${MISSION_DATA.length}`
      );
      return false;
    }

    for (const mission of MISSION_DATA) {
      if (
        !mission.title ||
        !mission.objective ||
        !mission.person ||
        !mission.dialogue
      ) {
        console.error("Mission incomplète :", mission);
        return false;
      }
    }

    return true;
  }

  /* ==========================================================
     17. INITIALISATION
  ========================================================== */

  async function initialize() {
    try {
      UI.loading("Chargement de l'interface...", 10);

      if (!validateMissions()) {
        throw new Error("Les données des missions sont incomplètes.");
      }

      Controls.bind();
      bindButtons();

      UI.loading("Chargement des paramètres...", 35);
      await Settings.load();

      UI.loading("Vérification de la sauvegarde...", 60);
      await UI.updateContinueButton();

      UI.loading("Préparation de l'aventure...", 85);
      await Utils.wait(150);

      UI.loading("Prêt à jouer !", 100);
      await Utils.wait(250);

      Utils.setVisible(DOM.loadingScreen, false);
      UI.showScreen("mainMenu");

      State.started = await Storage.hasSave();
      await UI.updateContinueButton();

      if (DOM.canvas) {
        DOM.canvas.addEventListener("contextmenu", event => {
          event.preventDefault();
        });
      }

      Game.autosaveTimer = setInterval(() => {
        if (State.started && State.active && !State.paused) {
          Game.saveGame();
        }
      }, CONFIG.autosaveInterval);

      console.info(
        `FOBAS Sur l'Amour en Action v${CONFIG.version} initialisé.`
      );
    } catch (error) {
      console.error("Erreur d'initialisation FOBAS :", error);

      Utils.setVisible(DOM.loadingScreen, false);

      UI.showError(
        "Erreur d'initialisation",
        error && error.message
          ? error.message
          : "Le jeu n'a pas pu être initialisé."
      );
    }
  }

  /* ==========================================================
     18. API PUBLIQUE
  ========================================================== */

  const PublicAPI = {
    version: CONFIG.version,

    start() {
      return Game.startNewGame();
    },

    continue() {
      return Game.continueGame();
    },

    pause() {
      return Game.pause();
    },

    resume() {
      return Game.resume();
    },

    save() {
      return Game.saveGame();
    },

    nextMission() {
      return Game.nextMission();
    },

    interact() {
      return Controls.interact();
    },

    getState() {
      return {
        version: CONFIG.version,
        started: State.started,
        active: State.active,
        paused: State.paused,
        missionIndex: State.missionIndex,
        missionsTotal: CONFIG.missionCount,
        completedMissions: [...State.completedMissions],
        worldReady: State.worldReady
      };
    }
  };

  window.FOBASLove = PublicAPI;

  /* ==========================================================
     19. DÉMARRAGE
  ========================================================== */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, {
      once: true
    });
  } else {
    initialize();
  }

})();



