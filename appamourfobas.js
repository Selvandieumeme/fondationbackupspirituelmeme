/* ============================================================
   FOBAS INTERACTIVE — SUR L'AMOUR EN ACTION
   Fichier : appamourfobas.js
   Version : 3.0.0 — moteur complet de remplacement

   Dépendance :
   Babylon.js doit être chargé avant ce fichier dans le HTML.

   Fonctions :
   - Monde 3D procédural
   - Personnage joueur et personnages non joueurs
   - 35 missions progressives
   - Déplacements clavier et joystick tactile
   - Caméra orbitale et zoom par pincement
   - Dialogues, choix et voix
   - Pause, paramètres, sauvegarde et reprise
   - Menus, notifications et gestion des erreurs
============================================================ */

(() => {
  "use strict";

  if (window.__FOBAS_LOVE_ENGINE_V3__) return;
  window.__FOBAS_LOVE_ENGINE_V3__ = true;

  /* ==========================================================
     1. OUTILS ET DOM
  ========================================================== */

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
    gameTopBar: $("gameTopBar"),

    pauseButton: $("pauseButton"),
    openMissionsButton: $("openMissionsButton"),
    missionNumber: $("missionNumber"),
    missionTitle: $("missionTitle"),

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
    joystickBase: $("joystickBase"),
    joystickThumb: $("joystickThumb"),
    runButton: $("runButton"),
    jumpButton: $("jumpButton"),
    talkButton: $("talkButton"),

    gameNotification: $("gameNotification"),
    savingIndicator: $("savingIndicator"),

    missionsScreen: $("missionsScreen"),
    missionsList: $("missionsList"),
    missionsSummary: $("missionsSummary"),
    overallProgressBar: $("overallProgressBar"),
    closeMissionsButton: $("closeMissionsButton"),

    pauseScreen: $("pauseScreen"),
    resumeButton: $("resumeButton"),
    pauseMissionsButton: $("pauseMissionsButton"),
    saveGameButton: $("saveGameButton"),
    returnToMenuButton: $("returnToMenuButton"),

    settingsScreen: $("settingsScreen"),
    closeSettingsButton: $("closeSettingsButton"),
    saveSettingsButton: $("saveSettingsButton"),
    voiceEnabled: $("voiceEnabled"),
    musicEnabled: $("musicEnabled"),
    subtitlesEnabled: $("subtitlesEnabled"),
    qualitySelect: $("qualitySelect"),
    sensitivityRange: $("sensitivityRange"),

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

  const Utils = {
    clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    },

    distance(a, b) {
      return Math.hypot(
        (a?.x || 0) - (b?.x || 0),
        (a?.z || 0) - (b?.z || 0)
      );
    },

    show(element) {
      if (element) element.classList.remove("hidden");
    },

    hide(element) {
      if (element) element.classList.add("hidden");
    },

    text(element, value) {
      if (element) element.textContent = String(value ?? "");
    },

    button(element, callback) {
      if (!element) return;
      element.addEventListener("click", (event) => {
        event.preventDefault();
        try {
          callback();
        } catch (error) {
          console.error("Erreur du bouton :", error);
          UI.notify("Une erreur est survenue. Réessayez.");
        }
      });
    },

    vector(x = 0, y = 0, z = 0) {
      return new BABYLON.Vector3(x, y, z);
    }
  };

  /* ==========================================================
     2. CONFIGURATION ET ÉTAT
  ========================================================== */

  const CONFIG = {
    name: "FOBAS — Sur l'Amour en Action",
    version: "3.0.0",
    worldLimit: 45,
    walkSpeed: 4.0,
    runSpeed: 7.0,
    jumpHeight: 1.8,
    gravity: 9.81,
    interactionDistance: 3.0,
    saveKey: "fobas-love-save-v3",
    settingsKey: "fobas-love-settings-v3"
  };

  const State = {
    engine: null,
    scene: null,
    camera: null,
    player: null,
    playerVisual: null,
    npcs: [],
    targetMarker: null,
    worldMeshes: [],

    gameReady: false,
    gameStarted: false,
    paused: false,
    dialogueOpen: false,
    ending: false,

    activeMissionIndex: 0,
    activeStepIndex: 0,
    completedMissions: [],

    playerCharacterId: "alex",
    currentTarget: null,
    lastDialogue: "",
    lastSpeaker: "camille",
    dialogueCallback: null,
    pendingConfirmation: null,

    movement: { x: 0, z: 0 },
    running: false,
    jumping: false,
    verticalVelocity: 0,

    pointers: new Map(),
    cameraPointer: null,
    cameraLast: { x: 0, y: 0 },
    pinchDistance: 0,
    joystickPointer: null,
    joystickOrigin: { x: 0, y: 0 },

    lastFrame: 0,
    renderLoopStarted: false,
    notificationTimer: null,
    storageReady: false,

    settings: {
      voice: true,
      music: true,
      subtitles: true,
      quality: "medium",
      sensitivity: 1
    }
  };

  /* ==========================================================
     3. PERSONNAGES
  ========================================================== */

  const CHARACTERS = [
    {
      id: "alex",
      name: "Alex",
      avatar: "♥",
      skin: "#E4AE85",
      hair: "#30201C",
      clothes: "#355C9A"
    },
    {
      id: "camille",
      name: "Camille",
      avatar: "♡",
      skin: "#EBC19D",
      hair: "#4A2C24",
      clothes: "#C94F83"
    },
    {
      id: "noah",
      name: "Noah",
      avatar: "✦",
      skin: "#A96F4D",
      hair: "#241D19",
      clothes: "#397C73"
    },
    {
      id: "lea",
      name: "Léa",
      avatar: "❀",
      skin: "#D7A078",
      hair: "#35221B",
      clothes: "#DBA84B"
    },
    {
      id: "mika",
      name: "Mika",
      avatar: "✧",
      skin: "#F0C9A5",
      hair: "#6C4430",
      clothes: "#7961AC"
    },
    {
      id: "sarah",
      name: "Sarah",
      avatar: "♡",
      skin: "#8E5A43",
      hair: "#241A18",
      clothes: "#D66D62"
    }
  ];

  const getCharacter = (id) =>
    CHARACTERS.find((character) => character.id === id) ||
    CHARACTERS[0];

  /* ==========================================================
     4. DONNÉES DES 35 MISSIONS
  ========================================================== */

  const missionBlueprints = [
    ["Un regard inattendu", "garden", "Découvrez le jardin et rencontrez Camille."],
    ["Une première conversation", "park", "Prenez le temps de discuter au parc."],
    ["Le chemin des fleurs", "garden", "Explorez le sentier fleuri."],
    ["Un sourire partagé", "village", "Retrouvez Noah près des maisons."],
    ["Le banc des confidences", "park", "Rejoignez Léa pour un moment calme."],
    ["Un petit cadeau", "garden", "Préparez un cadeau symbolique."],
    ["La promenade du matin", "beach", "Découvrez la promenade près de la mer."],
    ["Les mots sincères", "village", "Partagez une pensée sincère."],
    ["Une rencontre musicale", "park", "Retrouvez Mika et écoutez sa mélodie."],
    ["Le souvenir parfait", "garden", "Choisissez un endroit pour une photo."],
    ["La lumière du soir", "beach", "Admirez le paysage au bord de l'eau."],
    ["Un geste généreux", "village", "Apportez votre aide à Sarah."],
    ["Le sentier secret", "forest", "Explorez un sentier paisible."],
    ["Le choix du cœur", "garden", "Choisissez une réponse avec attention."],
    ["Une danse improvisée", "park", "Partagez une danse amicale."],
    ["Les petites attentions", "village", "Accomplissez une attention particulière."],
    ["Le jardin secret", "garden", "Retrouvez votre endroit préféré."],
    ["Un moment de repos", "beach", "Prenez le temps d'observer la mer."],
    ["Une promesse sincère", "park", "Exprimez une intention positive."],
    ["La fête des couleurs", "village", "Explorez les rues colorées."],
    ["Un souvenir à garder", "garden", "Créez un souvenir photographique."],
    ["Le pont des rencontres", "forest", "Traversez le chemin jusqu'au point de rencontre."],
    ["Une écoute attentive", "park", "Écoutez votre interlocuteur."],
    ["Le cadeau inattendu", "village", "Offrez un petit cadeau symbolique."],
    ["La mélodie du bonheur", "beach", "Partagez un moment musical."],
    ["Le courage de parler", "garden", "Exprimez votre point de vue."],
    ["Le chemin du pardon", "forest", "Retrouvez un ami et échangez calmement."],
    ["Une décision importante", "park", "Faites un choix réfléchi."],
    ["L'horizon partagé", "beach", "Admirez ensemble l'horizon."],
    ["Les liens se renforcent", "village", "Aidez un personnage du village."],
    ["La grande promenade", "forest", "Explorez les chemins du paysage."],
    ["Un message du cœur", "garden", "Partagez un message encourageant."],
    ["Le dernier souvenir", "beach", "Prenez une dernière photo souvenir."],
    ["Une histoire commune", "park", "Retrouvez vos amis et échangez."],
    ["Sur l'Amour en Action", "garden", "Terminez votre aventure et célébrez les liens créés."]
  ];

  const missionCharacters = [
    "camille", "camille", "lea", "noah", "lea",
    "camille", "sarah", "noah", "mika", "camille",
    "sarah", "sarah", "noah", "camille", "mika",
    "lea", "camille", "sarah", "noah", "lea",
    "camille", "noah", "lea", "sarah", "mika",
    "camille", "noah", "lea", "sarah", "noah",
    "mika", "camille", "sarah", "lea", "camille"
  ];

  const MISSION_DATA = missionBlueprints.map((item, index) => {
    const npc = missionCharacters[index];
    const x = ((index % 5) - 2) * 2.5;
    const z = 5 + (index % 4) * 2.2;

    const steps = [
      {
        type: "move",
        text: "Rejoignez le point lumineux.",
        target: { x, z }
      },
      {
        type: "talk",
        text: `Parlez avec ${getCharacter(npc).name}.`,
        npc
      }
    ];

    if (index % 3 === 0) {
      steps.push({
        type: "choice",
        text: "Choisissez votre réponse.",
        npc,
        choices: [
          "Répondre avec sincérité",
          "Écouter avec attention",
          "Prendre le temps de réfléchir"
        ]
      });
    } else {
      steps.push({
        type: index % 2 === 0 ? "observe" : "help",
        text: "Accomplissez cette dernière action.",
        target: { x: x + 1.5, z: z + 1.5 },
        npc
      });
    }

    return {
      id: index + 1,
      title: item[0],
      landscape: item[1],
      description: item[2],
      reward: "Un nouveau souvenir",
      steps
    };
  });

  /* ==========================================================
     5. SAUVEGARDE LOCALE
  ========================================================== */

  const Storage = {
    db: null,

    async open() {
      if (!("indexedDB" in window)) return false;

      return new Promise((resolve) => {
        try {
          const request = indexedDB.open("FOBASLoveDatabase", 1);

          request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains("saves")) {
              db.createObjectStore("saves");
            }

            if (!db.objectStoreNames.contains("settings")) {
              db.createObjectStore("settings");
            }
          };

          request.onsuccess = () => {
            this.db = request.result;
            State.storageReady = true;
            resolve(true);
          };

          request.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    },

    async read(storeName, key) {
      if (!this.db) return null;

      return new Promise((resolve) => {
        try {
          const request = this.db
            .transaction(storeName, "readonly")
            .objectStore(storeName)
            .get(key);

          request.onsuccess = () => resolve(request.result ?? null);
          request.onerror = () => resolve(null);
        } catch (_) {
          resolve(null);
        }
      });
    },

    async write(storeName, key, value) {
      if (!this.db) return false;

      return new Promise((resolve) => {
        try {
          const transaction = this.db.transaction(storeName, "readwrite");
          transaction.objectStore(storeName).put(value, key);
          transaction.oncomplete = () => resolve(true);
          transaction.onerror = () => resolve(false);
          transaction.onabort = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    },

    async loadSave() {
      let save = await this.read("saves", "main");

      if (!save) {
        try {
          save = JSON.parse(
            localStorage.getItem(CONFIG.saveKey) || "null"
          );
        } catch (_) {
          save = null;
        }
      }

      return save;
    },

    async saveGame() {
      const save = {
        version: CONFIG.version,
        activeMissionIndex: State.activeMissionIndex,
        activeStepIndex: State.activeStepIndex,
        completedMissions: [...State.completedMissions],
        playerCharacterId: State.playerCharacterId,
        gameStarted: State.gameStarted,
        playerPosition: State.player
          ? {
              x: State.player.position.x,
              z: State.player.position.z
            }
          : { x: 0, z: 0 },
        updatedAt: new Date().toISOString()
      };

      let success = await this.write("saves", "main", save);

      try {
        localStorage.setItem(CONFIG.saveKey, JSON.stringify(save));
        success = true;
      } catch (error) {
        console.warn("Sauvegarde locale indisponible :", error);
      }

      Utils.text(
        DOM.saveStatus,
        success ? "Progression sauvegardée" : "Sauvegarde indisponible"
      );

      return success;
    },

    async loadSettings() {
      let settings = await this.read("settings", "main");

      if (!settings) {
        try {
          settings = JSON.parse(
            localStorage.getItem(CONFIG.settingsKey) || "null"
          );
        } catch (_) {
          settings = null;
        }
      }

      return settings;
    },

    async saveSettings() {
      const settings = { ...State.settings };

      await this.write("settings", "main", settings);

      try {
        localStorage.setItem(
          CONFIG.settingsKey,
          JSON.stringify(settings)
        );
      } catch (_) {}

      return true;
    }
  };

  /* ==========================================================
     6. INTERFACE UTILISATEUR
  ========================================================== */

  const UI = {
    notify(message, duration = 2400) {
      Utils.text(DOM.gameNotification, message);
      Utils.show(DOM.gameNotification);

      clearTimeout(State.notificationTimer);

      State.notificationTimer = setTimeout(() => {
        Utils.hide(DOM.gameNotification);
      }, duration);
    },

    loading(percent, message) {
      Utils.text(DOM.loadingMessage, message);
      Utils.text(DOM.loadingPercent, `${percent} %`);

      if (DOM.loadingProgress) {
        DOM.loadingProgress.style.width = `${percent}%`;
      }
    },

    worldLoading(show, message = "Préparation du monde 3D...") {
      Utils.text(DOM.worldLoadingText, message);

      if (show) Utils.show(DOM.worldLoadingOverlay);
      else Utils.hide(DOM.worldLoadingOverlay);
    },

    showError(title, message) {
      Utils.text(DOM.errorTitle, title);
      Utils.text(DOM.errorMessage, message);
      Utils.show(DOM.errorScreen);
      console.error(title, message);
    },

    confirm(title, message, callback) {
      Utils.text(DOM.confirmationTitle, title);
      Utils.text(DOM.confirmationMessage, message);
      State.pendingConfirmation = callback;
      Utils.show(DOM.confirmationScreen);
    },

    closeConfirmation(accepted) {
      Utils.hide(DOM.confirmationScreen);

      const callback = State.pendingConfirmation;
      State.pendingConfirmation = null;

      if (accepted && typeof callback === "function") {
        Promise.resolve(callback()).catch((error) => {
          console.error(error);
          this.notify("Impossible d'effectuer cette action.");
        });
      }
    },

    updateMissionHeader() {
      const mission = MISSION_DATA[State.activeMissionIndex];
      if (!mission) return;

      Utils.text(
        DOM.missionNumber,
        `MISSION ${String(mission.id).padStart(2, "0")} / ${MISSION_DATA.length}`
      );

      Utils.text(DOM.missionTitle, mission.title);
      this.updateObjective();
    },

    updateObjective() {
      const mission = MISSION_DATA[State.activeMissionIndex];
      if (!mission) return;

      const step = mission.steps[State.activeStepIndex];
      const total = mission.steps.length;
      const current = Math.min(State.activeStepIndex + 1, total);

      Utils.text(
        DOM.objectiveText,
        step ? step.text : "Mission terminée."
      );

      Utils.text(
        DOM.objectiveProgressText,
        `${Math.min(State.activeStepIndex, total)} / ${total}`
      );

      if (DOM.objectiveProgressBar) {
        DOM.objectiveProgressBar.style.width =
          `${Math.min(100, State.activeStepIndex / total * 100)}%`;
      }
    },

    updateMissionsList() {
      if (!DOM.missionsList) return;

      DOM.missionsList.replaceChildren();

      MISSION_DATA.forEach((mission, index) => {
        const completed = State.completedMissions.includes(mission.id);
        const unlocked = index <= State.activeMissionIndex || completed;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "mission-list-item";
        button.disabled = !unlocked;

        const title = document.createElement("strong");
        title.textContent = `${String(mission.id).padStart(2, "0")}. ${mission.title}`;

        const description = document.createElement("span");
        description.textContent = mission.description;

        const status = document.createElement("small");
        status.textContent = completed
          ? "✓ Terminée"
          : unlocked
            ? "Disponible"
            : "Verrouillée";

        button.append(title, description, status);

        button.addEventListener("click", () => {
          if (!unlocked) {
            this.notify("Terminez les missions précédentes.");
            return;
          }

          Game.startMission(index);
        });

        DOM.missionsList.appendChild(button);
      });

      const count = State.completedMissions.length;

      Utils.text(
        DOM.missionsSummary,
        `${count} mission${count > 1 ? "s" : ""} terminée${count > 1 ? "s" : ""}`
      );

      if (DOM.overallProgressBar) {
        DOM.overallProgressBar.style.width =
          `${count / MISSION_DATA.length * 100}%`;
      }
    },

    openPause() {
      if (!State.gameStarted || State.dialogueOpen) return;

      State.paused = true;
      Utils.show(DOM.pauseScreen);
    },

    closePause() {
      Utils.hide(DOM.pauseScreen);
      State.paused = false;
      State.lastFrame = performance.now();
    },

    openMissions() {
      State.paused = true;
      this.updateMissionsList();
      Utils.show(DOM.missionsScreen);
    },

    closeMissions() {
      Utils.hide(DOM.missionsScreen);
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

      if (DOM.qualitySelect) {
        DOM.qualitySelect.value = State.settings.quality;
      }

      if (DOM.sensitivityRange) {
        DOM.sensitivityRange.value = State.settings.sensitivity;
      }
    },

    async saveSettingsFromForm() {
      State.settings.voice = !!DOM.voiceEnabled?.checked;
      State.settings.music = !!DOM.musicEnabled?.checked;
      State.settings.subtitles = !!DOM.subtitlesEnabled?.checked;

      State.settings.quality =
        DOM.qualitySelect?.value || "medium";

      State.settings.sensitivity = Utils.clamp(
        Number(DOM.sensitivityRange?.value || 1),
        0.5,
        2
      );

      if (State.engine) {
        const scaling = {
          low: 1.6,
          medium: 1,
          high: 0.8
        };

        State.engine.setHardwareScalingLevel(
          scaling[State.settings.quality] || 1
        );

        State.engine.resize();
      }

      await Storage.saveSettings();
      this.closeSettings();
      this.notify("Paramètres enregistrés.");
    },

    showMissionComplete(mission) {
      State.paused = true;

      Utils.text(DOM.completionTitle, "Mission accomplie !");
      Utils.text(
        DOM.completionMessage,
        `${mission.title} — ${mission.reward}.`
      );

      Utils.text(
        DOM.completionProgress,
        `${State.completedMissions.length} / ${MISSION_DATA.length}`
      );

      Utils.show(DOM.missionCompleteScreen);
    },

    showEnding() {
      State.ending = true;
      State.paused = true;
      State.gameStarted = false;

      Utils.hide(DOM.gameScreen);
      Utils.hide(DOM.missionCompleteScreen);
      Utils.show(DOM.endingScreen);

      Storage.saveGame();
    }
  };

  /* ==========================================================
     7. AUDIO ET DIALOGUES VOCAUX
  ========================================================== */

  const AudioSystem = {
    context: null,

    initialize() {
      if (this.context || !State.settings.music) return;

      try {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;

        if (AudioContextClass) {
          this.context = new AudioContextClass();
        }
      } catch (_) {}
    },

    async resume() {
      this.initialize();

      if (this.context?.state === "suspended") {
        try {
          await this.context.resume();
        } catch (_) {}
      }
    },

    tone(frequency = 600, duration = 0.08) {
      if (!State.settings.music) return;

      this.initialize();
      if (!this.context) return;

      try {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";

        gain.gain.setValueAtTime(0.05, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          this.context.currentTime + duration
        );

        oscillator.connect(gain);
        gain.connect(this.context.destination);

        oscillator.start();
        oscillator.stop(this.context.currentTime + duration);
      } catch (_) {}
    },

    click() {
      this.tone(520, 0.045);
    },

    success() {
      this.tone(760, 0.12);
    },

    stopSpeech() {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    },

    speak(text, characterId) {
      this.stopSpeech();

      if (!State.settings.voice || !("speechSynthesis" in window)) {
        Utils.text(DOM.dialogueVoiceStatus, "Dialogue affiché à l'écran");
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "fr-FR";
        utterance.rate = 0.94;
        utterance.pitch = characterId === "camille" ? 1.08 : 1;

        utterance.onstart = () => {
          Utils.text(DOM.dialogueVoiceStatus, "Lecture du dialogue...");
        };

        utterance.onend = () => {
          Utils.text(DOM.dialogueVoiceStatus, "Dialogue en français");
        };

        utterance.onerror = () => {
          Utils.text(DOM.dialogueVoiceStatus, "Dialogue affiché à l'écran");
        };

        window.speechSynthesis.speak(utterance);
      } catch (_) {
        Utils.text(DOM.dialogueVoiceStatus, "Dialogue affiché à l'écran");
      }
    }
  };

  /* ==========================================================
     8. PERSONNAGES 3D
  ========================================================== */

  const CharacterSystem = {
    makeMaterial(name, color) {
      const material = new BABYLON.StandardMaterial(
        name,
        State.scene
      );

      material.diffuseColor = BABYLON.Color3.FromHexString(color);
      material.specularColor = new BABYLON.Color3(0.16, 0.16, 0.16);

      return material;
    },

    buildCharacter(character, name) {
      const scene = State.scene;

      const root = new BABYLON.TransformNode(
        `${name}-root`,
        scene
      );

      const skin = this.makeMaterial(`${name}-skin`, character.skin);
      const hair = this.makeMaterial(`${name}-hair`, character.hair);
      const clothes = this.makeMaterial(`${name}-clothes`, character.clothes);
      const dark = this.makeMaterial(`${name}-shoes`, "#302A34");
      const eyes = this.makeMaterial(`${name}-eyes`, "#30201C");

      const parts = {};

      const sphere = (partName, diameter, x, y, z, material, scale = null) => {
        const mesh = BABYLON.MeshBuilder.CreateSphere(
          `${name}-${partName}`,
          { diameter, segments: 12 },
          scene
        );

        mesh.parent = root;
        mesh.position.set(x, y, z);
        mesh.material = material;

        if (scale) mesh.scaling.set(scale.x, scale.y, scale.z);

        parts[partName] = mesh;
        return mesh;
      };

      const box = (partName, options, x, y, z, material) => {
        const mesh = BABYLON.MeshBuilder.CreateBox(
          `${name}-${partName}`,
          options,
          scene
        );

        mesh.parent = root;
        mesh.position.set(x, y, z);
        mesh.material = material;
        parts[partName] = mesh;
        return mesh;
      };

      box("body", { width: 0.62, height: 0.85, depth: 0.36 }, 0, 1.12, 0, clothes);

      sphere(
        "head",
        0.52,
        0,
        1.86,
        0,
        skin,
        { x: 0.88, y: 1.08, z: 0.92 }
      );

      sphere(
        "hair",
        0.54,
        0,
        2.02,
        -0.015,
        hair,
        { x: 0.94, y: 0.68, z: 0.96 }
      );

      // Visage dégagé : la partie inférieure des cheveux est retirée.
      if (parts.hair) parts.hair.position.y = 2.08;

      sphere("eye-left", 0.055, -0.105, 1.88, 0.232, eyes);
      sphere("eye-right", 0.055, 0.105, 1.88, 0.232, eyes);

      const leftArm = box(
        "arm-left",
        { width: 0.19, height: 0.73, depth: 0.22 },
        -0.43,
        1.12,
        0,
        clothes
      );

      const rightArm = box(
        "arm-right",
        { width: 0.19, height: 0.73, depth: 0.22 },
        0.43,
        1.12,
        0,
        clothes
      );

      leftArm.rotation.z = -0.08;
      rightArm.rotation.z = 0.08;

      box("leg-left", { width: 0.23, height: 0.68, depth: 0.27 }, -0.17, 0.39, 0, dark);
      box("leg-right", { width: 0.23, height: 0.68, depth: 0.27 }, 0.17, 0.39, 0, dark);

      return { root, parts, character };
    },

    getNPC(id) {
      return State.npcs.find((npc) => npc.id === id) || null;
    },

    choosePlayer(id) {
      const character = getCharacter(id);

      if (!State.scene || !State.player) {
        State.playerCharacterId = character.id;
        return;
      }

      const position = State.player.position.clone();
      const rotation = State.player.rotation.y;

      State.playerVisual.root.dispose(false, true);

      State.playerCharacterId = character.id;
      State.playerVisual = this.buildCharacter(character, "player");
      State.player = State.playerVisual.root;

      State.player.position.copyFrom(position);
      State.player.rotation.y = rotation;

      this.updateCharacterButton();
    },

    updateCharacterButton() {
      // Le HTML fourni ne contient pas de bouton de sélection.
      // Cette fonction est volontairement sans effet secondaire.
    },

    animate(visual, delta, moving, running) {
      if (!visual?.parts) return;

      const parts = visual.parts;
      const time = performance.now() * 0.008;
      const swing = moving ? Math.sin(time * (running ? 1.8 : 1)) * 0.22 : 0;

      if (parts["leg-left"]) parts["leg-left"].rotation.x = swing;
      if (parts["leg-right"]) parts["leg-right"].rotation.x = -swing;
      if (parts["arm-left"]) parts["arm-left"].rotation.x = -swing * 0.65;
      if (parts["arm-right"]) parts["arm-right"].rotation.x = swing * 0.65;
    }
  };

  /* ==========================================================
     9. MONDE 3D
  ========================================================== */

  const World = {
    material(name, hex, roughness = 1) {
      const material = new BABYLON.StandardMaterial(name, State.scene);
      material.diffuseColor = BABYLON.Color3.FromHexString(hex);
      material.specularColor = new BABYLON.Color3(0.12, 0.12, 0.12);
      material.roughness = roughness;
      return material;
    },

    track(mesh) {
      State.worldMeshes.push(mesh);
      return mesh;
    },

    clear() {
      State.worldMeshes.forEach((mesh) => {
        if (mesh && !mesh.isDisposed()) mesh.dispose(false, true);
      });

      State.worldMeshes = [];

      if (State.targetMarker && !State.targetMarker.isDisposed()) {
        State.targetMarker.dispose(false, true);
      }

      State.targetMarker = null;
    },

    createEnvironment(landscape = "garden") {
      this.clear();

      const scene = State.scene;

      const palettes = {
        garden: { ground: "#72A96B", path: "#D7C29A", sky: "#A9D9EF" },
        park: { ground: "#60985A", path: "#D4C09C", sky: "#A8D7F1" },
        village: { ground: "#8EAF72", path: "#C6AC8B", sky: "#B6DCF0" },
        beach: { ground: "#E8D39C", path: "#F5E4B5", sky: "#9AD8F1" },
        forest: { ground: "#416E48", path: "#9E8A69", sky: "#A2C9D7" }
      };

      const palette = palettes[landscape] || palettes.garden;

      scene.clearColor = BABYLON.Color4.FromHexString(palette.sky + "FF");

      const groundMat = this.material("world-ground", palette.ground);
      const pathMat = this.material("world-path", palette.path);
      const trunkMat = this.material("tree-trunk", "#77513A");
      const leafMat = this.material("tree-leaves", "#34764A");
      const roofMat = this.material("house-roof", "#98515B");
      const wallMat = this.material("house-wall", "#F1DCC0");
      const waterMat = this.material("sea-water", "#48B4D2");

      const ground = BABYLON.MeshBuilder.CreateGround(
        "world-ground",
        { width: 100, height: 100, subdivisions: 2 },
        scene
      );

      ground.material = groundMat;
      ground.position.y = -0.04;
      this.track(ground);

      const path = BABYLON.MeshBuilder.CreateGround(
        "world-path",
        { width: 4.2, height: 70 },
        scene
      );

      path.material = pathMat;
      path.position.y = -0.015;
      this.track(path);

      if (landscape === "beach") {
        const sea = BABYLON.MeshBuilder.CreateGround(
          "world-sea",
          { width: 100, height: 35 },
          scene
        );

        sea.material = waterMat;
        sea.position.set(0, -0.02, 32);
        this.track(sea);
      }

      // Arbres et décor générés procéduralement.
      for (let i = 0; i < 24; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (5 + (i % 4) * 3.2);
        const z = -27 + i * 2.4;

        const trunk = BABYLON.MeshBuilder.CreateCylinder(
          `tree-trunk-${i}`,
          { height: 2.1, diameter: 0.35 },
          scene
        );

        trunk.position.set(x, 1.05, z);
        trunk.material = trunkMat;
        this.track(trunk);

        const crown = BABYLON.MeshBuilder.CreateSphere(
          `tree-crown-${i}`,
          { diameter: 2.2, segments: 10 },
          scene
        );

        crown.position.set(x, 2.65, z);
        crown.material = leafMat;
        this.track(crown);
      }

      // Quelques maisons pour enrichir le décor.
      for (let i = 0; i < 5; i++) {
        const x = i % 2 === 0 ? -13 : 13;
        const z = -15 + i * 8;

        const house = BABYLON.MeshBuilder.CreateBox(
          `house-${i}`,
          { width: 3.2, height: 2.5, depth: 3.2 },
          scene
        );

        house.position.set(x, 1.25, z);
        house.material = wallMat;
        this.track(house);

        const roof = BABYLON.MeshBuilder.CreateCylinder(
          `house-roof-${i}`,
          { height: 3.7, diameter: 3.5, tessellation: 4 },
          scene
        );

        roof.position.set(x, 3.0, z);
        roof.rotation.y = Math.PI / 4;
        roof.scaling.y = 0.55;
        roof.material = roofMat;
        this.track(roof);
      }

      const marker = BABYLON.MeshBuilder.CreateTorus(
        "mission-target-marker",
        { diameter: 1.8, thickness: 0.12, tessellation: 36 },
        scene
      );

      marker.rotation.x = Math.PI / 2;
      marker.position.set(0, 0.08, 7);
      marker.material = this.material("target-material", "#FFD45D");
      State.targetMarker = marker;

      return true;
    },

    updateTargetMarker(position) {
      if (!State.targetMarker || State.targetMarker.isDisposed()) return;

      State.targetMarker.position.x = position.x;
      State.targetMarker.position.z = position.z;
    }
  };

  /* ==========================================================
     10. PERSONNAGES NON JOUEURS
  ========================================================== */

  const NPCSystem = {
    spawn() {
      State.npcs.forEach((npc) => {
        if (npc.visual?.root && !npc.visual.root.isDisposed()) {
          npc.visual.root.dispose(false, true);
        }
      });

      State.npcs = [];

      const positions = [
        { x: 3, z: 8 },
        { x: -5, z: 10 },
        { x: 8, z: 5 },
        { x: -9, z: 4 },
        { x: 5, z: 14 }
      ];

      CHARACTERS
        .filter((character) => character.id !== State.playerCharacterId)
        .forEach((character, index) => {
          const position = positions[index % positions.length];

          const visual = CharacterSystem.buildCharacter(
            character,
            `npc-${character.id}`
          );

          visual.root.position.set(position.x, 0, position.z);

          State.npcs.push({
            id: character.id,
            name: character.name,
            character,
            visual,
            active: true,
            phase: Math.random() * Math.PI * 2
          });
        });
    },

    get(id) {
      return State.npcs.find((npc) => npc.id === id) || null;
    },

    nearest() {
      if (!State.player) return null;

      let best = null;
      let bestDistance = CONFIG.interactionDistance;

      for (const npc of State.npcs) {
        if (!npc.active || !npc.visual?.root) continue;

        const distance = Utils.distance(
          State.player.position,
          npc.visual.root.position
        );

        if (distance < bestDistance) {
          best = npc;
          bestDistance = distance;
        }
      }

      return best ? { npc: best, distance: bestDistance } : null;
    },

    placeForStep(step) {
      if (!step?.npc) return;

      const npc = this.get(step.npc);
      if (!npc?.visual?.root) return;

      if (step.target) {
        npc.visual.root.position.x = step.target.x + 1.3;
        npc.visual.root.position.z = step.target.z + 0.5;
      }
    },

    update(delta) {
      for (const npc of State.npcs) {
        if (!npc.visual?.root) continue;

        CharacterSystem.animate(npc.visual, delta, false, false);

        if (npc.id !== State.currentTarget?.npc?.id) {
          npc.visual.root.position.y =
            Math.sin(performance.now() * 0.0015 + npc.phase) * 0.015;
        }
      }
    }
  };

  /* ==========================================================
     11. CAMÉRA ET CONTRÔLES
  ========================================================== */

  const Controls = {
    setupCamera() {
      State.camera = new BABYLON.ArcRotateCamera(
        "love-camera",
        -Math.PI / 2,
        1.1,
        12,
        new BABYLON.Vector3(0, 1.1, 0),
        State.scene
      );

      State.camera.lowerRadiusLimit = 4.5;
      State.camera.upperRadiusLimit = 25;
      State.camera.lowerBetaLimit = 0.38;
      State.camera.upperBetaLimit = 1.47;
      State.camera.wheelPrecision = 35;
      State.camera.panningSensibility = 0;
      State.camera.inertia = 0.75;

      // Les gestes sont gérés ci-dessous.
      State.camera.detachControl();
      State.camera.inputs.clear();
      State.camera.minZ = 0.1;
      State.camera.maxZ = 400;
    },

    setupTouchControls() {
      const canvas = DOM.canvas;
      if (!canvas) return;

      canvas.style.touchAction = "none";

      canvas.addEventListener("pointerdown", (event) => {
        State.pointers.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY
        });

        if (State.pointers.size === 1) {
          State.cameraPointer = event.pointerId;
          State.cameraLast = {
            x: event.clientX,
            y: event.clientY
          };
        }

        if (State.pointers.size === 2) {
          const points = [...State.pointers.values()];

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
        if (!State.pointers.has(event.pointerId)) return;

        State.pointers.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY
        });

        if (State.pointers.size >= 2) {
          const points = [...State.pointers.values()];

          const distance = Math.hypot(
            points[1].x - points[0].x,
            points[1].y - points[0].y
          );

          if (State.pinchDistance > 0 && State.camera) {
            State.camera.radius = Utils.clamp(
              State.camera.radius +
                (State.pinchDistance - distance) * 0.035,
              4.5,
              25
            );
          }

          State.pinchDistance = distance;
          return;
        }

        if (
          event.pointerId === State.cameraPointer &&
          !State.paused &&
          !State.dialogueOpen &&
          State.gameStarted
        ) {
          const dx = event.clientX - State.cameraLast.x;
          const dy = event.clientY - State.cameraLast.y;

          State.camera.alpha -=
            dx * 0.004 * State.settings.sensitivity;

          State.camera.beta = Utils.clamp(
            State.camera.beta +
              dy * 0.003 * State.settings.sensitivity,
            0.38,
            1.47
          );

          State.cameraLast = {
            x: event.clientX,
            y: event.clientY
          };
        }
      });

      const releasePointer = (event) => {
        State.pointers.delete(event.pointerId);

        if (State.cameraPointer === event.pointerId) {
          State.cameraPointer = null;
        }

        if (State.pointers.size < 2) {
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

      if (DOM.joystickBase) {
        DOM.joystickBase.style.touchAction = "none";

        DOM.joystickBase.addEventListener("pointerdown", (event) => {
          if (State.paused || State.dialogueOpen) return;

          event.preventDefault();
          State.joystickPointer = event.pointerId;

          try {
            DOM.joystickBase.setPointerCapture(event.pointerId);
          } catch (_) {}

          this.updateJoystick(event);
        });

        DOM.joystickBase.addEventListener("pointermove", (event) => {
          if (event.pointerId !== State.joystickPointer) return;

          event.preventDefault();
          this.updateJoystick(event);
        });

        const releaseJoystick = (event) => {
          if (event.pointerId !== State.joystickPointer) return;

          State.joystickPointer = null;
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

      window.addEventListener("keydown", (event) => {
        if (event.repeat || State.paused || State.dialogueOpen) return;

        const key = event.key.toLowerCase();

        if (["w", "arrowup", "z"].includes(key)) State.movement.z = 1;
        if (["s", "arrowdown"].includes(key)) State.movement.z = -1;
        if (["a", "arrowleft", "q"].includes(key)) State.movement.x = -1;
        if (["d", "arrowright"].includes(key)) State.movement.x = 1;

        if (key === "shift") State.running = true;
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

        if (key === "shift") State.running = false;
      });

      window.addEventListener("blur", () => {
        State.movement.x = 0;
        State.movement.z = 0;
        State.running = false;
      });
    },

    updateJoystick(event) {
      const rect = DOM.joystickBase.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxRadius = Math.max(1, Math.min(rect.width, rect.height) * 0.32);

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
      if (
        !State.player ||
        !State.camera ||
        State.paused ||
        !State.gameStarted
      ) {
        return;
      }

      const x = State.movement.x;
      const z = State.movement.z;
      const magnitude = Math.hypot(x, z);

      if (magnitude > 0.08) {
        const direction = new BABYLON.Vector3(x, 0, z).normalize();

        const speed = State.running
          ? CONFIG.runSpeed
          : CONFIG.walkSpeed;

        const forward = new BABYLON.Vector3(
          -Math.sin(State.camera.alpha),
          0,
          -Math.cos(State.camera.alpha)
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

          const desiredRotation = Math.atan2(movement.x, movement.z);
          let difference = desiredRotation - State.player.rotation.y;

          while (difference > Math.PI) difference -= Math.PI * 2;
          while (difference < -Math.PI) difference += Math.PI * 2;

          State.player.rotation.y += difference * Math.min(1, delta * 8);
        }
      }

      if (State.jumping) {
        State.verticalVelocity -= CONFIG.gravity * delta;
        State.player.position.y += State.verticalVelocity * delta;

        if (State.player.position.y <= 0) {
          State.player.position.y = 0;
          State.verticalVelocity = 0;
          State.jumping = false;
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
        State.running
      );

      const target = State.player.position.clone();
      target.y += 1.15;

      State.camera.setTarget(target);
    }
  };

  /* ==========================================================
     12. DIALOGUES
  ========================================================== */

  const Dialogue = {
    open(characterId, customText = null, choices = null, callback = null) {
      const character = getCharacter(characterId);

      State.dialogueOpen = true;
      State.paused = true;
      State.lastSpeaker = characterId;
      State.lastDialogue = customText ||
        `${character.name} vous sourit. Prenons le temps de partager ce moment.`;

      State.dialogueCallback = callback;

      Utils.text(DOM.speakerName, character.name);
      Utils.text(DOM.speakerAvatar, character.avatar);
      Utils.text(DOM.dialogueText, State.lastDialogue);

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

            const callbackToRun = State.dialogueCallback;
            State.dialogueCallback = null;

            if (typeof callbackToRun === "function") {
              callbackToRun(choice, index);
            }

            this.close();
            Game.advanceStep();
          });

          DOM.dialogueChoices?.appendChild(button);
        });

        Utils.hide(DOM.nextDialogueButton);
      } else {
        Utils.show(DOM.nextDialogueButton);
      }

      Utils.show(DOM.dialoguePanel);
      AudioSystem.speak(State.lastDialogue, characterId);
    },

    continue() {
      if (!State.dialogueOpen) return;

      const step = Game.currentStep();
      this.close();

      if (step?.type === "talk") {
        Game.advanceStep();
      }
    },

    close() {
      Utils.hide(DOM.dialoguePanel);
      State.dialogueOpen = false;
      State.paused = false;
      State.dialogueCallback = null;

      AudioSystem.stopSpeech();
    },

    repeat() {
      if (State.lastDialogue) {
        AudioSystem.speak(State.lastDialogue, State.lastSpeaker);
      }
    }
  };

  /* ==========================================================
     13. JEU ET MISSIONS
  ========================================================== */

  const Game = {
    currentMission() {
      return MISSION_DATA[State.activeMissionIndex] || null;
    },

    currentStep() {
      return this.currentMission()?.steps[State.activeStepIndex] || null;
    },

    async startNewGame() {
      AudioSystem.resume();

      const save = await Storage.loadSave();

      if (save?.gameStarted) {
        UI.confirm(
          "Nouvelle aventure",
          "Commencer une nouvelle aventure effacera votre progression actuelle. Continuer ?",
          async () => {
            this.resetProgress();

            const ready = await this.ensureWorld();
            if (!ready) return;

            this.beginMission(0);
          }
        );

        return;
      }

      this.resetProgress();

      const ready = await this.ensureWorld();
      if (!ready) return;

      this.beginMission(0);
    },

    resetProgress() {
      State.activeMissionIndex = 0;
      State.activeStepIndex = 0;
      State.completedMissions = [];
      State.gameStarted = false;
      State.ending = false;
      State.paused = false;
      State.jumping = false;
      State.verticalVelocity = 0;
    },

    async continueGame() {
      const save = await Storage.loadSave();

      if (!save) {
        UI.notify("Aucune sauvegarde trouvée.");
        return;
      }

      State.activeMissionIndex = Utils.clamp(
        Number(save.activeMissionIndex) || 0,
        0,
        MISSION_DATA.length - 1
      );

      State.activeStepIndex = Math.max(
        0,
        Number(save.activeStepIndex) || 0
      );

      State.completedMissions = Array.isArray(save.completedMissions)
        ? save.completedMissions.filter((id) =>
            MISSION_DATA.some((mission) => mission.id === id)
          )
        : [];

      State.playerCharacterId = getCharacter(
        save.playerCharacterId
      ).id;

      const ready = await this.ensureWorld();
      if (!ready) return;

      if (save.playerPosition && State.player) {
        State.player.position.set(
          Number(save.playerPosition.x) || 0,
          0,
          Number(save.playerPosition.z) || 0
        );
      }

      this.beginMission(State.activeMissionIndex, true);
      UI.notify("Votre aventure a été restaurée.");
    },

    async ensureWorld() {
      // Le test isDisposed() doit appeler la méthode.
      if (
        State.gameReady &&
        State.scene &&
        !State.scene.isDisposed()
      ) {
        return true;
      }

      if (!window.BABYLON) {
        UI.showError(
          "Babylon.js indisponible",
          "Le moteur 3D n'est pas chargé. Vérifiez la connexion Internet et rechargez la page."
        );
        return false;
      }

      if (!DOM.canvas) {
        UI.showError(
          "Canvas introuvable",
          "Le canvas loveGameCanvas est absent du HTML."
        );
        return false;
      }

      UI.worldLoading(true);

      try {
        if (!State.engine) {
          State.engine = new BABYLON.Engine(
            DOM.canvas,
            true,
            {
              preserveDrawingBuffer: true,
              stencil: true,
              antialias: true,
              adaptToDeviceRatio: true,
              powerPreference: "high-performance"
            }
          );
        }

        // Un seul moteur et une seule boucle de rendu.
        if (State.scene && !State.scene.isDisposed()) {
          State.scene.dispose();
        }

        State.scene = new BABYLON.Scene(State.engine);
        State.scene.collisionsEnabled = false;

        State.scene.ambientColor = new BABYLON.Color3(0.3, 0.3, 0.3);

        const hemi = new BABYLON.HemisphericLight(
          "love-hemi-light",
          new BABYLON.Vector3(0, 1, 0),
          State.scene
        );

        hemi.intensity = 0.95;
        hemi.groundColor = new BABYLON.Color3(0.34, 0.39, 0.34);

        const sun = new BABYLON.DirectionalLight(
          "love-sun-light",
          new BABYLON.Vector3(-0.5, -1, 0.4),
          State.scene
        );

        sun.position = new BABYLON.Vector3(20, 35, -10);
        sun.intensity = 1.0;

        Controls.setupCamera();

        State.playerVisual = CharacterSystem.buildCharacter(
          getCharacter(State.playerCharacterId),
          "player"
        );

        State.player = State.playerVisual.root;
        State.player.position.set(0, 0, 0);

        World.createEnvironment(this.currentMission()?.landscape || "garden");
        NPCSystem.spawn();

        if (!State.renderLoopStarted) {
          State.engine.runRenderLoop(() => {
            if (!State.scene || State.scene.isDisposed()) return;

            const now = performance.now();
            const delta = Math.min(
              (now - (State.lastFrame || now)) / 1000,
              0.05
            );

            State.lastFrame = now;

            if (State.gameStarted && !State.paused) {
              Controls.updatePlayer(delta);
              NPCSystem.update(delta);
              this.updateInteractionPrompt();
              this.updateMissionProximity();
            }

            State.scene.render();
          });

          State.renderLoopStarted = true;
        }

        State.engine.resize();
        State.gameReady = true;

        UI.worldLoading(false);
        return true;
      } catch (error) {
        console.error("Erreur de création du monde 3D :", error);

        State.gameReady = false;
        UI.worldLoading(false);

        UI.showError(
          "Erreur du monde 3D",
          error?.message ||
            "Le monde 3D n'a pas pu être créé sur cet appareil."
        );

        return false;
      }
    },

    beginMission(index, restoring = false) {
      if (index < 0 || index >= MISSION_DATA.length) {
        UI.showEnding();
        return;
      }

      if (!State.scene || State.scene.isDisposed()) {
        UI.showError(
          "Monde 3D indisponible",
          "Le monde doit être créé avant de lancer une mission."
        );
        return;
      }

      State.activeMissionIndex = index;

      const mission = this.currentMission();

      State.activeStepIndex = Utils.clamp(
        State.activeStepIndex,
        0,
        mission.steps.length - 1
      );

      State.gameStarted = true;
      State.paused = false;
      State.ending = false;

      Utils.hide(DOM.mainMenu);
      Utils.hide(DOM.missionsScreen);
      Utils.hide(DOM.pauseScreen);
      Utils.hide(DOM.missionCompleteScreen);
      Utils.hide(DOM.endingScreen);

      Utils.show(DOM.gameScreen);

      World.createEnvironment(mission.landscape);
      NPCSystem.spawn();

      if (!restoring && State.player) {
        State.player.position.set(0, 0, 0);
        State.player.rotation.y = Math.PI;
      }

      UI.updateMissionHeader();
      UI.updateMissionsList();

      const step = this.currentStep();

      if (step?.npc) NPCSystem.placeForStep(step);

      if (step?.target) {
        World.updateTargetMarker(step.target);
      } else {
        World.updateTargetMarker({ x: 0, z: 7 });
      }

      State.lastFrame = performance.now();
      State.engine.resize();

      UI.notify(`Mission ${mission.id} : ${mission.title}`, 3000);

      Storage.saveGame();
    },

    startMission(index) {
      if (index < 0 || index >= MISSION_DATA.length) return;

      if (index > State.activeMissionIndex) {
        UI.notify("Terminez d'abord les missions précédentes.");
        return;
      }

      State.activeStepIndex = 0;

      const launch = async () => {
        const ready = await this.ensureWorld();
        if (ready) this.beginMission(index);
      };

      launch();
    },

    updateInteractionPrompt() {
      const step = this.currentStep();

      if (!step || !State.player || State.dialogueOpen) {
        Utils.hide(DOM.interactionPrompt);
        State.currentTarget = null;
        return;
      }

      let target = null;
      let distance = Infinity;

      if (step.npc) {
        const npc = NPCSystem.get(step.npc);

        if (npc?.visual?.root) {
          target = {
            kind: "npc",
            npc,
            position: npc.visual.root.position
          };

          distance = Utils.distance(
            State.player.position,
            npc.visual.root.position
          );
        }
      } else if (step.target) {
        target = {
          kind: "point",
          position: step.target
        };

        distance = Utils.distance(
          State.player.position,
          step.target
        );
      }

      State.currentTarget = target
        ? { ...target, distance, step }
        : null;

      if (target && distance <= CONFIG.interactionDistance) {
        Utils.show(DOM.interactionPrompt);

        Utils.text(
          DOM.interactionText,
          step.type === "talk" ? "Parler" : "Interagir"
        );

        Utils.text(DOM.interactionIcon, "♡");
      } else {
        Utils.hide(DOM.interactionPrompt);
      }
    },

    updateMissionProximity() {
      const step = this.currentStep();

      if (!step?.target) return;

      if (!["move", "visit", "explore", "arrive"].includes(step.type)) {
        return;
      }

      if (
        Utils.distance(State.player.position, step.target) <= 1.7
      ) {
        this.advanceStep();
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

      if (step.target) {
        UI.notify("Approchez-vous du repère lumineux.");
      } else if (step.npc) {
        UI.notify("Approchez-vous du personnage.");
      } else {
        this.performStepAction(step, null);
      }
    },

    performStepAction(step, target) {
      AudioSystem.click();

      if (step.type === "talk") {
        const npcId = step.npc || target?.npc?.id;

        if (!npcId) {
          UI.notify("Aucun personnage disponible.");
          return;
        }

        const character = getCharacter(npcId);

        Dialogue.open(
          npcId,
          `${character.name} vous sourit. « Je suis heureux de partager ce moment avec toi. Que souhaites-tu raconter ? »`
        );

        return;
      }

      if (step.type === "choice") {
        const npcId = step.npc || State.playerCharacterId;
        const character = getCharacter(npcId);

        Dialogue.open(
          npcId,
          `${character.name} vous écoute. Que souhaitez-vous répondre ?`,
          step.choices || [
            "Répondre avec sincérité",
            "Écouter avec attention",
            "Prendre le temps de réfléchir"
          ],
          (choice) => {
            State.lastChoice = choice;
            UI.notify(`Votre choix : ${choice}`, 1800);
          }
        );

        return;
      }

      if (step.type === "photo") {
        this.takePhotoMoment();
      }

      UI.notify("Action accomplie !");
      AudioSystem.success();
      this.advanceStep();
    },

    advanceStep() {
      const mission = this.currentMission();
      if (!mission) return;

      State.activeStepIndex += 1;

      if (State.activeStepIndex >= mission.steps.length) {
        this.completeMission();
        return;
      }

      const step = this.currentStep();

      UI.updateObjective();

      if (step?.npc) NPCSystem.placeForStep(step);

      if (step?.target) {
        World.updateTargetMarker(step.target);
      }

      Storage.saveGame();

      UI.notify(`Nouvel objectif : ${step.text}`);
    },

    completeMission() {
      const mission = this.currentMission();
      if (!mission) return;

      if (!State.completedMissions.includes(mission.id)) {
        State.completedMissions.push(mission.id);
      }

      State.activeStepIndex = mission.steps.length;

      UI.updateMissionsList();
      UI.updateObjective();

      Storage.saveGame();
      UI.showMissionComplete(mission);
      AudioSystem.success();
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

    jump() {
      if (
        !State.gameStarted ||
        State.paused ||
        State.jumping ||
        !State.player
      ) {
        return;
      }

      State.jumping = true;
      State.verticalVelocity = Math.sqrt(
        2 * CONFIG.gravity * CONFIG.jumpHeight
      );

      AudioSystem.tone(380, 0.08);
    },

    takePhotoMoment() {
      try {
        const dataURL = DOM.canvas.toDataURL("image/png");
        const key = "fobas-love-photos";

        let photos = [];

        try {
          photos = JSON.parse(localStorage.getItem(key) || "[]");
        } catch (_) {}

        photos.push({
          date: new Date().toISOString(),
          image: dataURL
        });

        localStorage.setItem(key, JSON.stringify(photos.slice(-10)));
        UI.notify("Souvenir photographique enregistré.");
      } catch (error) {
        console.warn("Capture impossible :", error);
        UI.notify("La capture n'est pas disponible sur cet appareil.");
      }
    },

    async save() {
      Utils.show(DOM.savingIndicator);

      const success = await Storage.saveGame();

      setTimeout(() => Utils.hide(DOM.savingIndicator), 500);

      UI.notify(
        success
          ? "Progression sauvegardée."
          : "La sauvegarde n'a pas pu être confirmée."
      );
    },

    returnToMenu() {
      UI.confirm(
        "Retour au menu",
        "Sauvegarder votre progression avant de quitter la partie ?",
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

      if (DOM.confirmationScreen &&
          !DOM.confirmationScreen.classList.contains("hidden")) {
        UI.closeConfirmation(false);
        return;
      }

      if (DOM.missionsScreen &&
          !DOM.missionsScreen.classList.contains("hidden")) {
        UI.closeMissions();
        return;
      }

      if (DOM.settingsScreen &&
          !DOM.settingsScreen.classList.contains("hidden")) {
        UI.closeSettings();
        return;
      }

      if (DOM.pauseScreen &&
          !DOM.pauseScreen.classList.contains("hidden")) {
        UI.closePause();
        return;
      }

      if (State.gameStarted) UI.openPause();
    },

    async retry() {
      Utils.hide(DOM.errorScreen);

      if (State.scene && !State.scene.isDisposed()) {
        State.scene.dispose();
      }

      State.scene = null;
      State.gameReady = false;

      const ready = await this.ensureWorld();

      if (ready) {
        this.beginMission(State.activeMissionIndex);
      } else {
        UI.showError(
          "Impossible de démarrer le jeu",
          "Vérifiez Babylon.js, la connexion Internet et la compatibilité graphique du navigateur."
        );
      }
    }
  };

  /* ==========================================================
     14. CONNEXION DE TOUS LES BOUTONS
  ========================================================== */

  function bindButtons() {
    Utils.button(DOM.newGameButton, () => {
      Game.startNewGame();
    });

    Utils.button(DOM.continueGameButton, () => {
      Game.continueGame();
    });

    Utils.button(DOM.missionsMenuButton, () => {
      UI.openMissions();
    });

    Utils.button(DOM.settingsButton, () => {
      UI.openSettings();
    });

    Utils.button(DOM.creditsButton, () => {
      Utils.hide(DOM.mainMenu);
      Utils.show(DOM.creditsScreen);
    });

    Utils.button(DOM.closeCreditsButton, () => {
      Utils.hide(DOM.creditsScreen);
      Utils.show(DOM.mainMenu);
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

    Utils.button(DOM.jumpButton, () => {
      Game.jump();
    });

    Utils.button(DOM.runButton, () => {
      State.running = !State.running;

      DOM.runButton.classList.toggle("active", State.running);
      UI.notify(State.running ? "Course activée." : "Course désactivée.");
    });

    if (DOM.runButton) {
      DOM.runButton.addEventListener("pointerdown", () => {
        State.running = true;
        DOM.runButton.classList.add("active");
      });

      const stopRunning = () => {
        State.running = false;
        DOM.runButton.classList.remove("active");
      };

      DOM.runButton.addEventListener("pointerup", stopRunning);
      DOM.runButton.addEventListener("pointercancel", stopRunning);
      DOM.runButton.addEventListener("pointerleave", stopRunning);
    }

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

    Utils.button(DOM.restartGameButton, async () => {
      State.ending = false;
      Game.resetProgress();

      Utils.hide(DOM.endingScreen);

      const ready = await Game.ensureWorld();

      if (ready) Game.beginMission(0);
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

    window.addEventListener("resize", () => {
      State.engine?.resize();
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        State.engine?.resize();
        State.lastFrame = performance.now();
      } else {
        State.movement.x = 0;
        State.movement.z = 0;
        State.running = false;
      }
    });
  }

  /* ==========================================================
     15. INITIALISATION
  ========================================================== */

  async function initialize() {
    UI.loading(5, "Initialisation de FOBAS Interactive...");

    if (!DOM.canvas) {
      throw new Error("Le canvas loveGameCanvas est introuvable.");
    }

    bindButtons();
    Controls.setupTouchControls();

    UI.loading(20, "Préparation de la sauvegarde locale...");

    await Storage.open();

    UI.loading(38, "Chargement des paramètres...");

    const settings = await Storage.loadSettings();

    if (settings && typeof settings === "object") {
      State.settings = {
        ...State.settings,
        ...settings
      };
    }

    UI.populateSettings();

    UI.loading(58, "Vérification de la progression...");

    const save = await Storage.loadSave();

    if (DOM.continueGameButton) {
      DOM.continueGameButton.disabled = !save;
    }

    UI.loading(75, "Préparation des missions...");

    UI.updateMissionsList();

    UI.loading(92, "Vérification du moteur 3D...");

    await new Promise((resolve) => setTimeout(resolve, 200));

    UI.loading(100, "Votre aventure est prête.");

    setTimeout(() => {
      Utils.hide(DOM.loadingScreen);
      Utils.show(DOM.mainMenu);
    }, 250);

    console.info(
      `${CONFIG.name} — Version ${CONFIG.version} initialisée.`
    );
  }

  /* ==========================================================
     16. API PUBLIQUE
  ========================================================== */

  window.FOBASLove = {
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
        activeMissionId:
          MISSION_DATA[State.activeMissionIndex]?.id ?? null,
        activeStepIndex: State.activeStepIndex,
        completedMissions: [...State.completedMissions],
        totalMissions: MISSION_DATA.length
      };
    },

    startNewGame() {
      return Game.startNewGame();
    },

    continueGame() {
      return Game.continueGame();
    },

    startMission(index) {
      return Game.startMission(index);
    },

    save() {
      return Storage.saveGame();
    },

    chooseCharacter(id) {
      if (!CHARACTERS.some((character) => character.id === id)) {
        throw new Error(`Personnage inconnu : ${id}`);
      }

      CharacterSystem.choosePlayer(id);
    },

    notify(message) {
      UI.notify(message);
    },

    addMission(mission) {
      if (!mission || typeof mission !== "object") {
        throw new TypeError("La mission doit être un objet.");
      }

      if (
        !mission.title ||
        !Array.isArray(mission.steps) ||
        mission.steps.length === 0
      ) {
        throw new Error("Une mission doit avoir un titre et des étapes.");
      }

      const id = mission.id ??
        Math.max(0, ...MISSION_DATA.map((item) => item.id)) + 1;

      if (MISSION_DATA.some((item) => item.id === id)) {
        throw new Error(`L'identifiant ${id} existe déjà.`);
      }

      const allowed = new Set([
        "move", "visit", "talk", "interact", "collect",
        "help", "sit", "dance", "sing", "photo", "listen",
        "give", "choice", "promise", "explore", "wait",
        "hug", "observe", "arrive"
      ]);

      const steps = mission.steps.map((step) => {
        if (!allowed.has(step.type)) {
          throw new Error(`Action non reconnue : ${step.type}`);
        }

        if (!step.text) {
          throw new Error("Chaque étape doit contenir un texte.");
        }

        return { ...step };
      });

      const created = {
        id,
        title: String(mission.title),
        landscape: String(mission.landscape || "garden"),
        description: String(mission.description || ""),
        reward: String(mission.reward || ""),
        steps
      };

      MISSION_DATA.push(created);
      UI.updateMissionsList();

      Storage.saveGame();

      return created;
    }
  };

  /* ==========================================================
     17. DÉMARRAGE SÉCURISÉ
  ========================================================== */

  function startSafely() {
    initialize().catch((error) => {
      console.error("Erreur d'initialisation FOBAS Love :", error);

      UI.hide(DOM.loadingScreen);

      UI.showError(
        "Erreur d'initialisation",
        error?.message ||
          "Le jeu n'a pas pu démarrer. Rechargez la page puis réessayez."
      );
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startSafely, {
      once: true
    });
  } else {
    startSafely();
  }
})();



