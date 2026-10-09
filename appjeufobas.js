/* ============================================================
   FOBAS MISSION FORCE UNIE 3D
   Fichier : appjeufobas.js
   Moteur  : WebGL natif + géométrie 3D personnalisée
   Sauvegarde : IndexedDB
   Compatibilité : appjeufobas.html
   Dépendances externes : AUCUNE
   Three.js : NON
   ============================================================ */

'use strict';

const FOBAS_GAME = (() => {
  const VERSION = '1.0.0';
  const DB_NAME = 'FOBAS_MISSION_FORCE_UNIE_3D';
  const DB_VERSION = 1;
  const STORE_NAME = 'gameSaves';
  const SAVE_KEY = 'mainSave';

  const $ = (id) => document.getElementById(id);

  const dom = {
    app: $('gameApp'),
    header: $('gameHeader'),
    connectionStatus: $('connectionStatus'),
    connectionStatusText: $('connectionStatusText'),
    saveStatusButton: $('saveStatusButton'),
    headerPauseButton: $('headerPauseButton'),

    loadingScreen: $('loadingScreen'),
    loadingMessage: $('loadingMessage'),
    loadingProgress: $('loadingProgress'),
    loadingProgressBar: $('loadingProgressBar'),
    loadingError: $('loadingError'),
    loadingRetryButton: $('loadingRetryButton'),

    mainMenu: $('mainMenu'),
    newGameButton: $('newGameButton'),
    continueGameButton: $('continueGameButton'),
    saveSummary: $('saveSummary'),
    missionsMenuButton: $('missionsMenuButton'),
    garageMenuButton: $('garageMenuButton'),
    settingsMenuButton: $('settingsMenuButton'),
    helpMenuButton: $('helpMenuButton'),

    gameScreen: $('gameScreen'),
    gameViewport: $('gameViewport'),
    sceneContainer: $('sceneContainer'),
    sceneFallback: $('sceneFallback'),

    missionNumber: $('missionNumber'),
    missionTitle: $('missionTitle'),
    missionObjective: $('missionObjective'),
    backToMenuButton: $('backToMenuButton'),
    gamePauseButton: $('gamePauseButton'),
    speedValue: $('speedValue'),

    vehicleHealthBar: $('vehicleHealthBar'),
    vehicleHealthText: $('vehicleHealthText'),
    teamHealthBar: $('teamHealthBar'),
    teamHealthText: $('teamHealthText'),

    objectivePanel: $('objectivePanel'),
    toggleObjectivesButton: $('toggleObjectivesButton'),
    objectiveList: $('objectiveList'),
    objectiveEmptyMessage: $('objectiveEmptyMessage'),
    missionProgressBar: $('missionProgressBar'),
    missionProgressText: $('missionProgressText'),

    minimapPanel: $('minimapPanel'),
    toggleMinimapButton: $('toggleMinimapButton'),
    minimapCanvas: $('minimapCanvas'),

    teamStatusText: $('teamStatusText'),
    memeStatus: $('memeStatus'),
    novaStatus: $('novaStatus'),
    axelStatus: $('axelStatus'),

    memeAbilityButton: $('memeAbilityButton'),
    novaAbilityButton: $('novaAbilityButton'),
    axelAbilityButton: $('axelAbilityButton'),

    navigationPrompt: $('navigationPrompt'),
    navigationPromptText: $('navigationPromptText'),
    gameNotification: $('gameNotification'),
    notificationTitle: $('notificationTitle'),
    notificationMessage: $('notificationMessage'),

    touchControls: $('touchControls'),
    steerLeftButton: $('steerLeftButton'),
    steerRightButton: $('steerRightButton'),
    brakeButton: $('brakeButton'),
    accelerateButton: $('accelerateButton'),
    reverseButton: $('reverseButton'),

    cameraModeButton: $('cameraModeButton'),
    handbrakeButton: $('handbrakeButton'),
    interactButton: $('interactButton'),

    missionsScreen: $('missionsScreen'),
    missionList: $('missionList'),

    garageScreen: $('garageScreen'),
    garageVehicleName: $('garageVehicleName'),
    garageVehicleDescription: $('garageVehicleDescription'),
    garageSpeedBar: $('garageSpeedBar'),
    garageSpeedValue: $('garageSpeedValue'),
    garageArmorBar: $('garageArmorBar'),
    garageArmorValue: $('garageArmorValue'),
    garageHandlingBar: $('garageHandlingBar'),
    garageHandlingValue: $('garageHandlingValue'),
    repairVehicleButton: $('repairVehicleButton'),
    upgradeVehicleButton: $('upgradeVehicleButton'),
    garageMessage: $('garageMessage'),

    settingsScreen: $('settingsScreen'),
    graphicsQuality: $('graphicsQuality'),
    cameraDistance: $('cameraDistance'),
    cameraDistanceValue: $('cameraDistanceValue'),
    steeringSensitivity: $('steeringSensitivity'),
    steeringSensitivityValue: $('steeringSensitivityValue'),
    gameVolume: $('gameVolume'),
    gameVolumeValue: $('gameVolumeValue'),
    vibrationEnabled: $('vibrationEnabled'),
    touchZoomEnabled: $('touchZoomEnabled'),
    showSubtitles: $('showSubtitles'),
    saveSettingsButton: $('saveSettingsButton'),
    resetSettingsButton: $('resetSettingsButton'),
    settingsMessage: $('settingsMessage'),

    helpScreen: $('helpScreen'),

    pauseOverlay: $('pauseOverlay'),
    resumeGameButton: $('resumeGameButton'),
    pauseSaveButton: $('pauseSaveButton'),
    pauseRestartButton: $('pauseRestartButton'),
    pauseExitButton: $('pauseExitButton'),

    resultOverlay: $('resultOverlay'),
    resultEyebrow: $('resultEyebrow'),
    resultTitle: $('resultTitle'),
    resultMessage: $('resultMessage'),
    resultProgress: $('resultProgress'),
    resultReward: $('resultReward'),
    nextMissionButton: $('nextMissionButton'),
    replayMissionButton: $('replayMissionButton'),
    resultMenuButton: $('resultMenuButton'),

    confirmOverlay: $('confirmOverlay'),
    confirmTitle: $('confirmTitle'),
    confirmMessage: $('confirmMessage'),
    confirmCancelButton: $('confirmCancelButton'),
    confirmAcceptButton: $('confirmAcceptButton'),

    globalToast: $('globalToast'),
    globalToastMessage: $('globalToastMessage'),
    closeToastButton: $('closeToastButton'),

    footerSaveButton: $('footerSaveButton')
  };

  const missions = [
    {
      id: 'mission-01',
      number: 1,
      title: 'La première route',
      difficulty: 'INITIATION',
      description: 'Rejoignez le point de rendez-vous.',
      distance: 260,
      reward: 100,
      obstacles: 4
    },
    {
      id: 'mission-02',
      number: 2,
      title: 'Le véhicule disparu',
      difficulty: 'EXPLORATION',
      description: 'Explorez la zone et suivez les indices.',
      distance: 400,
      reward: 175,
      obstacles: 6
    },
    {
      id: 'mission-03',
      number: 3,
      title: 'Route endommagée',
      difficulty: 'TECHNIQUE',
      description: 'Traversez la route endommagée.',
      distance: 520,
      reward: 250,
      obstacles: 8
    },
    {
      id: 'mission-04',
      number: 4,
      title: 'La force du convoi',
      difficulty: 'CONVOI',
      description: 'Conduisez votre équipe à destination.',
      distance: 680,
      reward: 350,
      obstacles: 10
    },
    {
      id: 'mission-05',
      number: 5,
      title: 'Mission en montagne',
      difficulty: 'SAUVETAGE',
      description: 'Atteignez la zone de secours.',
      distance: 820,
      reward: 500,
      obstacles: 12
    },
    {
      id: 'mission-06',
      number: 6,
      title: 'Unis pour réussir',
      difficulty: 'OPÉRATION FINALE',
      description: 'Mobilisez les capacités des trois spécialistes.',
      distance: 1000,
      reward: 750,
      obstacles: 15
    }
  ];

  const defaultSettings = {
    graphicsQuality: 'medium',
    cameraDistance: 7,
    steeringSensitivity: 1,
    gameVolume: 65,
    vibrationEnabled: true,
    touchZoomEnabled: true,
    showSubtitles: true
  };

  const state = {
    screen: 'loading',
    running: false,
    paused: false,
    completed: false,
    db: null,
    dbAvailable: false,
    saveAvailable: false,
    saveTimer: null,
    toastTimer: null,
    notificationTimer: null,

    unlockedMission: 1,
    currentMission: 0,
    completedMissions: [],
    credits: 0,

    vehicle: {
      x: 0,
      z: 0,
      speed: 0,
      heading: 0,
      health: 100,
      armor: 75,
      handling: 70,
      engine: 65,
      distance: 0,
      collisions: 0
    },

    teamHealth: 100,
    objectiveProgress: 0,
    objectives: [],
    obstacles: [],
    collected: [],
    abilities: {
      memeReady: true,
      novaReady: true,
      axelReady: true,
      shieldUntil: 0,
      boostUntil: 0,
      scanUntil: 0
    },

    settings: { ...defaultSettings },

    camera: {
      mode: 0,
      zoom: 7,
      targetZoom: 7,
      sensitivity: 1
    },

    input: {
      left: false,
      right: false,
      accelerate: false,
      reverse: false,
      brake: false,
      handbrake: false,
      keys: new Set()
    },

    lastFrame: 0,
    animationFrame: 0,
    worldTime: 0,
    roadOffset: 0,
    targetX: 0,
    lastSave: null,
    confirmAction: null,
    renderer: null,
    audioContext: null
  };

  /* ==========================================================
     OUTILS
     ========================================================== */

  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

  const lerp = (a, b, t) => a + (b - a) * t;

  const random = (min, max) => min + Math.random() * (max - min);

  function setText(element, value) {
    if (element) element.textContent = String(value);
  }

  function setWidth(element, value) {
    if (element) {
      element.style.width = `${clamp(value, 0, 100)}%`;
    }
  }

  function show(element) {
    if (element) element.hidden = false;
  }

  function hide(element) {
    if (element) element.hidden = true;
  }

  function vibrate(pattern = 35) {
    if (
      state.settings.vibrationEnabled &&
      navigator.vibrate
    ) {
      navigator.vibrate(pattern);
    }
  }

  function formatNumber(value) {
    return Math.round(value).toLocaleString('fr-FR');
  }

  function setConnection(text, good = true) {
    setText(dom.connectionStatusText, text);

    if (dom.connectionStatus) {
      dom.connectionStatus.dataset.state = good ? 'online' : 'offline';
    }
  }

  function toast(message, duration = 3000) {
    if (!dom.globalToast || !dom.globalToastMessage) return;

    setText(dom.globalToastMessage, message);
    show(dom.globalToast);

    clearTimeout(state.toastTimer);

    state.toastTimer = setTimeout(() => {
      hide(dom.globalToast);
    }, duration);
  }

  function notify(title, message, duration = 3000) {
    if (!state.settings.showSubtitles) return;

    setText(dom.notificationTitle, title);
    setText(dom.notificationMessage, message);
    show(dom.gameNotification);

    clearTimeout(state.notificationTimer);

    state.notificationTimer = setTimeout(() => {
      hide(dom.gameNotification);
    }, duration);
  }

  function setLoadingProgress(value, message) {
    const percent = clamp(value, 0, 100);

    if (dom.loadingProgress) {
      dom.loadingProgress.setAttribute('aria-valuenow', String(percent));
    }

    if (dom.loadingProgressBar) {
      dom.loadingProgressBar.style.width = `${percent}%`;
    }

    if (message) setText(dom.loadingMessage, message);
  }

  function showLoadingError(message) {
    if (!dom.loadingError) return;

    setText(dom.loadingError, message);
    show(dom.loadingError);
    show(dom.loadingRetryButton);
  }

  /* ==========================================================
     NAVIGATION ENTRE LES ÉCRANS
     ========================================================== */

  const screens = [
    'loadingScreen',
    'mainMenu',
    'gameScreen',
    'missionsScreen',
    'garageScreen',
    'settingsScreen',
    'helpScreen'
  ];

  function navigate(screenName) {
    screens.forEach((id) => hide($(id)));

    const element = $(screenName);

    if (!element) {
      console.warn(`Écran introuvable : ${screenName}`);
      return;
    }

    show(element);
    state.screen = screenName;

    const inGame = screenName === 'gameScreen';

    if (dom.header) {
      dom.header.style.display = screenName === 'loadingScreen'
        ? 'none'
        : '';
    }

    if (dom.touchControls) {
      dom.touchControls.style.display = inGame ? '' : 'none';
    }

    if (inGame) {
      resizeRenderer();
      updateHUD();
    }

    if (screenName === 'mainMenu') {
      updateMenu();
    }

    if (screenName === 'missionsScreen') {
      updateMissionCards();
    }

    if (screenName === 'garageScreen') {
      updateGarage();
    }

    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }

  function openMainMenu() {
    state.running = false;
    state.paused = false;

    hide(dom.pauseOverlay);
    hide(dom.resultOverlay);
    hide(dom.confirmOverlay);

    releaseAllInputs();
    navigate('mainMenu');

    updateMenu();
  }

  function openConfirm(title, message, action) {
    setText(dom.confirmTitle, title);
    setText(dom.confirmMessage, message);

    state.confirmAction = action;

    show(dom.confirmOverlay);
  }

  function closeConfirm() {
    hide(dom.confirmOverlay);
    state.confirmAction = null;
  }

  /* ==========================================================
     INDEXEDDB
     ========================================================== */

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB non disponible.'));
        return;
      }

      let request;

      try {
        request = indexedDB.open(DB_NAME, DB_VERSION);
      } catch (error) {
        reject(error);
        return;
      }

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {
            keyPath: 'id'
          });
        }
      };

      request.onsuccess = () => resolve(request.result);

      request.onerror = () => {
        reject(request.error || new Error('Ouverture IndexedDB impossible.'));
      };

      request.onblocked = () => {
        console.warn('Ouverture IndexedDB bloquée par un autre onglet.');
      };
    });
  }

  function readSave() {
    return new Promise((resolve, reject) => {
      if (!state.dbAvailable || !state.db) {
        resolve(null);
        return;
      }

      let transaction;

      try {
        transaction = state.db.transaction(STORE_NAME, 'readonly');
      } catch (error) {
        reject(error);
        return;
      }

      const request = transaction.objectStore(STORE_NAME).get(SAVE_KEY);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  function writeSave(data) {
    return new Promise((resolve, reject) => {
      if (!state.dbAvailable || !state.db) {
        reject(new Error('La sauvegarde IndexedDB est indisponible.'));
        return;
      }

      let transaction;

      try {
        transaction = state.db.transaction(STORE_NAME, 'readwrite');
      } catch (error) {
        reject(error);
        return;
      }

      transaction.objectStore(STORE_NAME).put({
        id: SAVE_KEY,
        version: VERSION,
        updatedAt: new Date().toISOString(),
        data
      });

      transaction.oncomplete = () => resolve(true);

      transaction.onerror = () => {
        reject(transaction.error || new Error('Échec de sauvegarde.'));
      };

      transaction.onabort = () => {
        reject(new Error('La sauvegarde a été interrompue.'));
      };
    });
  }

  function serializeState() {
    return {
      version: VERSION,
      unlockedMission: state.unlockedMission,
      currentMission: state.currentMission,
      completedMissions: [...state.completedMissions],
      credits: state.credits,

      vehicle: {
        ...state.vehicle
      },

      teamHealth: state.teamHealth,
      settings: {
        ...state.settings
      },

      camera: {
        mode: state.camera.mode,
        zoom: state.camera.zoom
      },

      completed: state.completed
    };
  }

  function restoreState(data) {
    if (!data || typeof data !== 'object') return false;

    state.unlockedMission = clamp(
      Number(data.unlockedMission) || 1,
      1,
      missions.length
    );

    state.currentMission = clamp(
      Number(data.currentMission) || 0,
      0,
      missions.length - 1
    );

    state.completedMissions = Array.isArray(data.completedMissions)
      ? data.completedMissions.filter((id) =>
          missions.some((mission) => mission.id === id)
        )
      : [];

    state.credits = Math.max(0, Number(data.credits) || 0);

    if (data.vehicle && typeof data.vehicle === 'object') {
      Object.assign(state.vehicle, data.vehicle);

      state.vehicle.health = clamp(state.vehicle.health, 0, 100);
      state.vehicle.armor = clamp(state.vehicle.armor, 0, 100);
      state.vehicle.handling = clamp(state.vehicle.handling, 0, 100);
      state.vehicle.engine = clamp(state.vehicle.engine, 0, 100);
    }

    state.teamHealth = clamp(Number(data.teamHealth) || 100, 0, 100);

    if (data.settings && typeof data.settings === 'object') {
      state.settings = {
        ...defaultSettings,
        ...data.settings
      };
    }

    if (data.camera && typeof data.camera === 'object') {
      state.camera.mode = Number(data.camera.mode) || 0;

      state.camera.zoom = clamp(
        Number(data.camera.zoom) || 7,
        4,
        12
      );

      state.camera.targetZoom = state.camera.zoom;
    }

    applySettingsToControls();
    updateMissionCards();
    updateGarage();
    updateMenu();

    return true;
  }

  async function saveGame(showMessage = true) {
    const data = serializeState();

    try {
      await writeSave(data);

      state.lastSave = Date.now();
      state.saveAvailable = true;

      setConnection('Sauvegarde OK', true);

      if (dom.saveSummary) {
        setText(
          dom.saveSummary,
          `Progression enregistrée · ${formatNumber(state.credits)} crédits`
        );
      }

      if (showMessage) toast('Progression sauvegardée dans IndexedDB.');

      return true;
    } catch (error) {
      console.error('Erreur de sauvegarde :', error);

      setConnection('Sauvegarde indisponible', false);

      if (showMessage) {
        toast('La sauvegarde est indisponible dans ce navigateur.');
      }

      return false;
    }
  }

  function scheduleSave() {
    clearTimeout(state.saveTimer);

    state.saveTimer = setTimeout(() => {
      saveGame(false);
    }, 1200);
  }

  async function initializeStorage() {
    try {
      state.db = await openDatabase();
      state.dbAvailable = true;

      const record = await readSave();

      if (record && record.data) {
        restoreState(record.data);
        state.saveAvailable = true;
      }

      setConnection('Système opérationnel', true);
    } catch (error) {
      console.warn('IndexedDB indisponible :', error);

      state.dbAvailable = false;
      state.saveAvailable = false;

      setConnection('Mode sans sauvegarde', false);

      if (dom.saveSummary) {
        setText(
          dom.saveSummary,
          'Sauvegarde indisponible : votre progression pourrait être perdue.'
        );
      }
    }

    updateMenu();
  }

  /* ==========================================================
     MISSIONS
     ========================================================== */

  function getMission(index = state.currentMission) {
    return missions[clamp(index, 0, missions.length - 1)];
  }

  function isMissionUnlocked(index) {
    return index + 1 <= state.unlockedMission;
  }

  function updateMissionCards() {
    if (!dom.missionList) return;

    dom.missionList.querySelectorAll('[data-start-mission]').forEach((button) => {
      const id = button.dataset.startMission;
      const index = missions.findIndex((mission) => mission.id === id);

      if (index < 0) return;

      const unlocked = isMissionUnlocked(index);
      const completed = state.completedMissions.includes(id);

      button.disabled = !unlocked;

      if (!unlocked) {
        button.textContent = 'Verrouillée';
        button.classList.remove('primary-button');
        button.classList.add('secondary-button');
      } else {
        button.textContent = completed ? 'Rejouer' : 'Jouer';
        button.classList.add('primary-button');
        button.classList.remove('secondary-button');
      }

      const card = button.closest('.mission-card');

      if (card) {
        card.dataset.unlocked = String(unlocked);
        card.dataset.completed = String(completed);
      }
    });
  }

  function updateMenu() {
    if (dom.continueGameButton) {
      dom.continueGameButton.disabled = !state.saveAvailable;
    }

    if (dom.saveSummary && !state.saveAvailable) {
      setText(
        dom.saveSummary,
        state.dbAvailable
          ? 'Aucune sauvegarde existante. Commencez votre première mission.'
          : 'Mode sans sauvegarde : IndexedDB est indisponible.'
      );
    }

    updateMissionCards();
  }

  function startMission(index) {
    if (index < 0 || index >= missions.length) return;

    if (!isMissionUnlocked(index)) {
      toast('Cette mission est encore verrouillée.');
      return;
    }

    state.currentMission = index;
    state.running = true;
    state.paused = false;
    state.completed = false;

    state.objectiveProgress = 0;
    state.teamHealth = Math.max(state.teamHealth, 70);

    state.vehicle.x = 0;
    state.vehicle.z = 0;
    state.vehicle.speed = 0;
    state.vehicle.heading = 0;
    state.vehicle.distance = 0;
    state.vehicle.collisions = 0;
    state.vehicle.health = Math.max(state.vehicle.health, 50);

    state.abilities.memeReady = true;
    state.abilities.novaReady = true;
    state.abilities.axelReady = true;

    createMissionWorld(index);
    createObjectives(index);

    hide(dom.pauseOverlay);
    hide(dom.resultOverlay);
    hide(dom.confirmOverlay);

    navigate('gameScreen');

    notify(
      'Mission commencée',
      `${getMission().title} — rejoignez le point de rendez-vous.`
    );

    updateHUD();
    scheduleSave();
    vibrate(40);
  }

  function createObjectives(index) {
    const mission = getMission(index);

    const definitions = [
      {
        title: 'Rejoindre la destination',
        description: `${mission.distance} mètres à parcourir`,
        done: false
      },
      {
        title: 'Préserver le véhicule',
        description: 'Maintenez la résistance au-dessus de zéro.',
        done: false
      },
      {
        title: 'Protéger l’équipe',
        description: 'Terminez la mission avec votre équipe.',
        done: false
      }
    ];

    state.objectives = definitions;

    if (!dom.objectiveList) return;

    dom.objectiveList.replaceChildren();

    definitions.forEach((objective, index) => {
      const row = document.createElement('div');
      row.className = 'objective-item';
      row.dataset.objectiveIndex = String(index);

      const indicator = document.createElement('span');
      indicator.className = 'objective-indicator';
      indicator.textContent = '○';

      const copy = document.createElement('div');

      const title = document.createElement('strong');
      title.textContent = objective.title;

      const description = document.createElement('small');
      description.textContent = objective.description;

      copy.append(title, description);
      row.append(indicator, copy);

      dom.objectiveList.append(row);
    });

    hide(dom.objectiveEmptyMessage);
  }

  function updateObjectives() {
    const mission = getMission();

    if (!mission) return;

    const progress = clamp(
      state.vehicle.distance / mission.distance * 100,
      0,
      100
    );

    state.objectiveProgress = progress;

    if (state.objectives[0]) {
      state.objectives[0].done = progress >= 100;
    }

    if (state.objectives[1]) {
      state.objectives[1].done = state.vehicle.health > 0;
    }

    if (state.objectives[2]) {
      state.objectives[2].done = state.teamHealth > 0;
    }

    if (dom.objectiveList) {
      dom.objectiveList.querySelectorAll('.objective-item').forEach((row) => {
        const index = Number(row.dataset.objectiveIndex);
        const objective = state.objectives[index];

        if (!objective) return;

        row.classList.toggle('is-complete', objective.done);

        const indicator = row.querySelector('.objective-indicator');

        if (indicator) {
          indicator.textContent = objective.done ? '✓' : '○';
        }
      });
    }

    setWidth(dom.missionProgressBar, progress);
    setText(dom.missionProgressText, `${Math.floor(progress)} % terminé`);

    if (progress >= 100 && state.running && !state.completed) {
      completeMission();
    }
  }

  function completeMission() {
    if (state.completed) return;

    state.completed = true;
    state.running = false;
    state.paused = false;

    state.vehicle.speed = 0;

    const mission = getMission();

    if (!state.completedMissions.includes(mission.id)) {
      state.completedMissions.push(mission.id);
      state.credits += mission.reward;
    }

    state.unlockedMission = Math.min(
      missions.length,
      Math.max(state.unlockedMission, mission.number + 1)
    );

    setText(dom.resultEyebrow, 'RAPPORT DE MISSION');
    setText(dom.resultTitle, 'Mission réussie !');
    setText(
      dom.resultMessage,
      `L’unité Force Unie a terminé : ${mission.title}.`
    );
    setText(dom.resultProgress, '100 %');
    setText(dom.resultReward, `${formatNumber(mission.reward)} crédits`);

    const hasNext = state.currentMission < missions.length - 1;

    if (dom.nextMissionButton) {
      dom.nextMissionButton.disabled = !hasNext;
      dom.nextMissionButton.textContent = hasNext
        ? 'Mission suivante'
        : 'Toutes les missions terminées';
    }

    show(dom.resultOverlay);

    updateMissionCards();
    updateMenu();

    saveGame(false);

    vibrate([100, 60, 100]);
  }

  function restartMission() {
    startMission(state.currentMission);
  }

  function createMissionWorld(index) {
    const mission = getMission(index);

    state.obstacles = [];
    state.collected = [];

    const obstacleCount = mission.obstacles;

    for (let i = 0; i < obstacleCount; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;

      state.obstacles.push({
        id: `obstacle-${index}-${i}`,
        x: side * random(2.2, 4.4),
        z: -18 - i * random(18, 28),
        type: i % 3 === 0 ? 'barrier' : i % 3 === 1 ? 'rock' : 'crate',
        hit: false,
        size: random(0.8, 1.4)
      });
    }

    for (let i = 0; i < 8; i++) {
      state.collected.push({
        x: random(-2.5, 2.5),
        z: -35 - i * 65,
        collected: false
      });
    }

    state.targetX = 0;
  }

  /* ==========================================================
     MOTEUR WEBGL NATIF
     ========================================================== */

  const vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec3 aColor;

    uniform mat4 uProjection;
    uniform mat4 uView;
    uniform mat4 uModel;

    varying vec3 vNormal;
    varying vec3 vColor;
    varying vec3 vWorldPosition;

    void main() {
      vec4 worldPosition = uModel * vec4(aPosition, 1.0);
      vWorldPosition = worldPosition.xyz;
      vNormal = mat3(uModel) * aNormal;
      vColor = aColor;

      gl_Position = uProjection * uView * worldPosition;
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;

    varying vec3 vNormal;
    varying vec3 vColor;
    varying vec3 vWorldPosition;

    uniform vec3 uLightDirection;
    uniform vec3 uFogColor;
    uniform float uFogNear;
    uniform float uFogFar;

    void main() {
      vec3 normal = normalize(vNormal);
      float diffuse = max(dot(normal, normalize(uLightDirection)), 0.0);
      float lighting = 0.36 + diffuse * 0.78;

      vec3 color = vColor * lighting;

      float distanceFromCamera = length(vWorldPosition);
      float fog = clamp(
        (distanceFromCamera - uFogNear) / (uFogFar - uFogNear),
        0.0,
        0.78
      );

      color = mix(color, uFogColor, fog);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);

      gl.deleteShader(shader);

      throw new Error(`Erreur shader : ${message}`);
    }

    return shader;
  }

  function createProgram(gl) {
    const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program);

      gl.deleteProgram(program);

      throw new Error(`Erreur programme WebGL : ${message}`);
    }

    return program;
  }

  function createCubeGeometry() {
    const faces = [
      {
        normal: [0, 0, 1],
        vertices: [
          [-0.5, -0.5, 0.5],
          [0.5, -0.5, 0.5],
          [0.5, 0.5, 0.5],
          [-0.5, 0.5, 0.5]
        ]
      },
      {
        normal: [0, 0, -1],
        vertices: [
          [0.5, -0.5, -0.5],
          [-0.5, -0.5, -0.5],
          [-0.5, 0.5, -0.5],
          [0.5, 0.5, -0.5]
        ]
      },
      {
        normal: [1, 0, 0],
        vertices: [
          [0.5, -0.5, 0.5],
          [0.5, -0.5, -0.5],
          [0.5, 0.5, -0.5],
          [0.5, 0.5, 0.5]
        ]
      },
      {
        normal: [-1, 0, 0],
        vertices: [
          [-0.5, -0.5, -0.5],
          [-0.5, -0.5, 0.5],
          [-0.5, 0.5, 0.5],
          [-0.5, 0.5, -0.5]
        ]
      },
      {
        normal: [0, 1, 0],
        vertices: [
          [-0.5, 0.5, 0.5],
          [0.5, 0.5, 0.5],
          [0.5, 0.5, -0.5],
          [-0.5, 0.5, -0.5]
        ]
      },
      {
        normal: [0, -1, 0],
        vertices: [
          [-0.5, -0.5, -0.5],
          [0.5, -0.5, -0.5],
          [0.5, -0.5, 0.5],
          [-0.5, -0.5, 0.5]
        ]
      }
    ];

    const positions = [];
    const normals = [];
    const colors = [];

    const indices = [0, 1, 2, 0, 2, 3];

    faces.forEach((face) => {
      face.vertices.forEach((vertex) => {
        positions.push(...vertex);
        normals.push(...face.normal);
        colors.push(1, 1, 1);
      });
    });

    const expandedIndices = [];

    for (let face = 0; face < 6; face++) {
      const offset = face * 4;

      indices.forEach((index) => {
        expandedIndices.push(offset + index);
      });
    }

    return {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      colors: new Float32Array(colors),
      indices: new Uint16Array(expandedIndices)
    };
  }

  function identityMatrix() {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  function multiplyMatrix(a, b) {
    const out = new Float32Array(16);

    for (let column = 0; column < 4; column++) {
      for (let row = 0; row < 4; row++) {
        out[column * 4 + row] =
          a[row] * b[column * 4] +
          a[4 + row] * b[column * 4 + 1] +
          a[8 + row] * b[column * 4 + 2] +
          a[12 + row] * b[column * 4 + 3];
      }
    }

    return out;
  }

  function perspectiveMatrix(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    const range = 1 / (near - far);

    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * range, -1,
      0, 0, 2 * far * near * range, 0
    ]);
  }

  function lookAtMatrix(eye, target, up) {
    const normalize = (v) => {
      const length = Math.hypot(v[0], v[1], v[2]) || 1;

      return [
        v[0] / length,
        v[1] / length,
        v[2] / length
      ];
    };

    const subtract = (a, b) => [
      a[0] - b[0],
      a[1] - b[1],
      a[2] - b[2]
    ];

    const cross = (a, b) => [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];

    const z = normalize(subtract(eye, target));
    const x = normalize(cross(up, z));
    const y = cross(z, x);

    return new Float32Array([
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -x[0] * eye[0] - x[1] * eye[1] - x[2] * eye[2],
      -y[0] * eye[0] - y[1] * eye[1] - y[2] * eye[2],
      -z[0] * eye[0] - z[1] * eye[1] - z[2] * eye[2],
      1
    ]);
  }

  function modelMatrix(position, scale, rotationY = 0) {
    const c = Math.cos(rotationY);
    const s = Math.sin(rotationY);

    return new Float32Array([
      c * scale[0], 0, -s * scale[0], 0,
      0, scale[1], 0, 0,
      s * scale[2], 0, c * scale[2], 0,
      position[0], position[1], position[2], 1
    ]);
  }

  function hexColor(hex) {
    const value = hex.replace('#', '');

    const number = parseInt(value, 16);

    return [
      ((number >> 16) & 255) / 255,
      ((number >> 8) & 255) / 255,
      (number & 255) / 255
    ];
  }

  function initializeRenderer() {
    if (!dom.sceneContainer) {
      throw new Error('L’élément sceneContainer est introuvable.');
    }

    const canvas = document.createElement('canvas');

    canvas.id = 'fobasWebGLCanvas';
    canvas.setAttribute('aria-label', 'Monde 3D du jeu');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.touchAction = 'none';

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: true,
      depth: true,
      powerPreference: 'high-performance'
    });

    if (!gl) {
      throw new Error('WebGL n’est pas disponible sur cet appareil.');
    }

    const program = createProgram(gl);

    const cube = createCubeGeometry();

    const buffers = {
      position: gl.createBuffer(),
      normal: gl.createBuffer(),
      color: gl.createBuffer(),
      indices: gl.createBuffer()
    };

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, cube.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.bufferData(gl.ARRAY_BUFFER, cube.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.bufferData(gl.ARRAY_BUFFER, cube.colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      cube.indices,
      gl.STATIC_DRAW
    );

    const attributes = {
      position: gl.getAttribLocation(program, 'aPosition'),
      normal: gl.getAttribLocation(program, 'aNormal'),
      color: gl.getAttribLocation(program, 'aColor')
    };

    const uniforms = {
      projection: gl.getUniformLocation(program, 'uProjection'),
      view: gl.getUniformLocation(program, 'uView'),
      model: gl.getUniformLocation(program, 'uModel'),
      light: gl.getUniformLocation(program, 'uLightDirection'),
      fog: gl.getUniformLocation(program, 'uFogColor'),
      fogNear: gl.getUniformLocation(program, 'uFogNear'),
      fogFar: gl.getUniformLocation(program, 'uFogFar')
    };

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    dom.sceneContainer.appendChild(canvas);

    if (dom.sceneFallback) {
      hide(dom.sceneFallback);
    }

    state.renderer = {
      canvas,
      gl,
      program,
      buffers,
      attributes,
      uniforms,
      cube
    };

    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();

      state.running = false;

      notify(
        'Moteur graphique interrompu',
        'Le contexte 3D a été perdu. Rechargez la page si nécessaire.',
        5000
      );
    });

    canvas.addEventListener('webglcontextrestored', () => {
      toast('Contexte graphique restauré. Rechargez si le jeu ne reprend pas.');
    });

    resizeRenderer();
  }

  function resizeRenderer() {
    const renderer = state.renderer;

    if (!renderer) return;

    const { canvas, gl } = renderer;

    const width = Math.max(1, dom.gameViewport?.clientWidth || window.innerWidth);
    const height = Math.max(1, dom.gameViewport?.clientHeight || window.innerHeight);

    const ratio = Math.min(window.devicePixelRatio || 1, 1.7);

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function drawCube(position, scale, color, rotationY = 0) {
    const renderer = state.renderer;

    if (!renderer) return;

    const { gl, uniforms } = renderer;

    gl.uniformMatrix4fv(
      uniforms.model,
      false,
      modelMatrix(position, scale, rotationY)
    );

    const rgb = Array.isArray(color) ? color : hexColor(color);

    gl.vertexAttrib3f(
      renderer.attributes.color,
      rgb[0],
      rgb[1],
      rgb[2]
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.buffers.position);

    gl.enableVertexAttribArray(renderer.attributes.position);

    gl.vertexAttribPointer(
      renderer.attributes.position,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.buffers.normal);

    gl.enableVertexAttribArray(renderer.attributes.normal);

    gl.vertexAttribPointer(
      renderer.attributes.normal,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.disableVertexAttribArray(renderer.attributes.color);

    gl.vertexAttrib3f(
      renderer.attributes.color,
      rgb[0],
      rgb[1],
      rgb[2]
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderer.buffers.indices);

    gl.drawElements(
      gl.TRIANGLES,
      renderer.cube.indices.length,
      gl.UNSIGNED_SHORT,
      0
    );
  }

  function drawCar() {
    const vehicle = state.vehicle;

    const x = vehicle.x;
    const z = 0;

    const green = [0.08, 0.65, 0.38];
    const dark = [0.04, 0.10, 0.10];
    const glass = [0.12, 0.24, 0.28];
    const silver = [0.58, 0.70, 0.69];

    drawCube([x, 0.5, z], [1.9, 0.48, 3.4], green, vehicle.heading);

    drawCube(
      [x, 0.92, z - 0.12],
      [1.35, 0.48, 1.65],
      glass,
      vehicle.heading
    );

    drawCube(
      [x, 0.78, z + 1.12],
      [1.65, 0.24, 0.62],
      silver,
      vehicle.heading
    );

    drawCube(
      [x, 0.34, z - 1.4],
      [0.38, 0.45, 0.65],
      dark,
      vehicle.heading
    );

    drawCube(
      [x, 0.34, z + 1.4],
      [0.38, 0.45, 0.65],
      dark,
      vehicle.heading
    );

    drawCube(
      [x - 0.83, 0.32, z - 1.08],
      [0.28, 0.48, 0.76],
      dark,
      vehicle.heading
    );

    drawCube(
      [x + 0.83, 0.32, z - 1.08],
      [0.28, 0.48, 0.76],
      dark,
      vehicle.heading
    );

    drawCube(
      [x - 0.83, 0.32, z + 1.08],
      [0.28, 0.48, 0.76],
      dark,
      vehicle.heading
    );

    drawCube(
      [x + 0.83, 0.32, z + 1.08],
      [0.28, 0.48, 0.76],
      dark,
      vehicle.heading
    );
  }

  function renderScene() {
    const renderer = state.renderer;

    if (!renderer) return;

    const { gl, program, uniforms } = renderer;

    if (gl.isContextLost()) return;

    const canvas = renderer.canvas;

    const width = canvas.width;
    const height = canvas.height;

    if (!width || !height) return;

    gl.viewport(0, 0, width, height);

    gl.clearColor(0.42, 0.68, 0.73, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    const aspect = width / height;

    const projection = perspectiveMatrix(
      Math.PI / 3,
      aspect,
      0.1,
      180
    );

    const vehicle = state.vehicle;

    let eye;
    let target;

    if (state.camera.mode === 1) {
      eye = [
        vehicle.x,
        2.5,
        4.2
      ];

      target = [
        vehicle.x,
        0.6,
        -12
      ];
    } else {
      const cameraDistance = state.camera.zoom;

      eye = [
        vehicle.x + Math.sin(vehicle.heading) * 1.5,
        3.6 + cameraDistance * 0.18,
        cameraDistance + 1.5
      ];

      target = [
        vehicle.x,
        0.5,
        -10
      ];
    }

    const view = lookAtMatrix(
      eye,
      target,
      [0, 1, 0]
    );

    gl.uniformMatrix4fv(uniforms.projection, false, projection);
    gl.uniformMatrix4fv(uniforms.view, false, view);

    gl.uniform3fv(uniforms.light, [0.4, 0.9, 0.5]);
    gl.uniform3fv(uniforms.fog, [0.42, 0.68, 0.73]);

    gl.uniform1f(uniforms.fogNear, 22);
    gl.uniform1f(uniforms.fogFar, 110);

    /*
      Sol et route.
      Le monde utilise une route qui se prolonge vers -Z.
    */

    drawCube(
      [0, -0.28, -35],
      [150, 0.4, 150],
      [0.16, 0.38, 0.20]
    );

    drawCube(
      [0, -0.04, -40],
      [8, 0.16, 140],
      [0.19, 0.20, 0.21]
    );

    /*
      Bords de route.
    */

    drawCube(
      [-4.15, 0.02, -40],
      [0.16, 0.1, 140],
      [0.85, 0.84, 0.68]
    );

    drawCube(
      [4.15, 0.02, -40],
      [0.16, 0.1, 140],
      [0.85, 0.84, 0.68]
    );

    /*
      Marquages centraux animés.
    */

    for (let i = 0; i < 18; i++) {
      const z = -i * 8 - (state.vehicle.distance % 8);

      drawCube(
        [0, 0.055, z - 3],
        [0.13, 0.025, 3],
        [0.93, 0.91, 0.70]
      );
    }

    /*
      Arbres et bâtiments procéduraux.
    */

    for (let i = 0; i < 22; i++) {
      const z = -12 - i * 7;

      const side = i % 2 === 0 ? -1 : 1;

      const x = side * (7 + (i % 4) * 2);

      if (i % 3 === 0) {
        drawCube(
          [x, 1.3, z],
          [2.2, 2.6, 2.2],
          [0.42, 0.45, 0.43]
        );

        drawCube(
          [x, 2.85, z],
          [2.25, 0.45, 2.25],
          [0.25, 0.30, 0.29]
        );
      } else {
        drawCube(
          [x, 0.8, z],
          [0.42, 1.6, 0.42],
          [0.30, 0.20, 0.12]
        );

        drawCube(
          [x, 2.0, z],
          [1.8, 2.1, 1.8],
          [0.10, 0.39, 0.20]
        );

        drawCube(
          [x, 2.8, z],
          [1.35, 1.1, 1.35],
          [0.12, 0.45, 0.22]
        );
      }
    }

    /*
      Obstacles de la mission.
    */

    state.obstacles.forEach((obstacle) => {
      if (obstacle.hit) return;

      const relativeZ = obstacle.z + state.vehicle.distance;

      if (relativeZ > 15 || relativeZ < -120) return;

      if (obstacle.type === 'barrier') {
        drawCube(
          [obstacle.x, 0.55, relativeZ],
          [1.9, 1.1, 0.45],
          [0.88, 0.39, 0.10]
        );

        drawCube(
          [obstacle.x, 0.56, relativeZ - 0.24],
          [1.7, 0.12, 0.08],
          [0.95, 0.92, 0.77]
        );
      } else if (obstacle.type === 'rock') {
        drawCube(
          [obstacle.x, 0.55, relativeZ],
          [
            obstacle.size,
            obstacle.size,
            obstacle.size
          ],
          [0.42, 0.43, 0.40],
          0.3
        );
      } else {
        drawCube(
          [obstacle.x, 0.48, relativeZ],
          [1, 0.95, 1],
          [0.53, 0.31, 0.16]
        );
      }
    });

    /*
      Objets à collecter.
    */

    state.collected.forEach((item) => {
      if (item.collected) return;

      const relativeZ = item.z + state.vehicle.distance;

      if (relativeZ > 10 || relativeZ < -120) return;

      drawCube(
        [item.x, 0.65, relativeZ],
        [0.45, 0.45, 0.45],
        [0.97, 0.78, 0.19],
        state.worldTime * 0.7
      );
    });

    /*
      Véhicule du joueur.
    */

    drawCar();
  }

  /* ==========================================================
     PHYSIQUE ET COLLISIONS
     ========================================================== */

  function updatePhysics(delta) {
    if (!state.running || state.paused || state.completed) return;

    const dt = Math.min(delta, 0.05);

    const vehicle = state.vehicle;

    const maxSpeed = 25 + vehicle.engine * 0.15;

    if (state.input.accelerate) {
      vehicle.speed += 13 * dt;
    } else if (state.input.reverse) {
      vehicle.speed -= 9 * dt;
    } else {
      vehicle.speed *= Math.pow(0.984, dt * 60);
    }

    if (state.input.brake || state.input.handbrake) {
      vehicle.speed *= Math.pow(
        state.input.handbrake ? 0.90 : 0.82,
        dt * 60
      );
    }

    if (Date.now() < state.abilities.boostUntil) {
      vehicle.speed += 8 * dt;
    }

    vehicle.speed = clamp(vehicle.speed, -8, maxSpeed);

    const steering = state.settings.steeringSensitivity;

    const speedFactor = 0.3 + Math.abs(vehicle.speed) / Math.max(maxSpeed, 1);

    if (state.input.left) {
      vehicle.heading += 1.5 * steering * speedFactor * dt;
      vehicle.x -= 4.0 * steering * speedFactor * dt;
    }

    if (state.input.right) {
      vehicle.heading -= 1.5 * steering * speedFactor * dt;
      vehicle.x += 4.0 * steering * speedFactor * dt;
    }

    vehicle.heading = clamp(vehicle.heading, -0.65, 0.65);
    vehicle.x = clamp(vehicle.x, -3.1, 3.1);

    /*
      La distance de progression augmente uniquement
      lorsque le véhicule avance.
    */

    if (vehicle.speed > 0) {
      vehicle.distance += vehicle.speed * dt * 0.55;
    } else if (vehicle.speed < 0) {
      vehicle.distance = Math.max(
        0,
        vehicle.distance + vehicle.speed * dt * 0.2
      );
    }

    state.roadOffset += vehicle.speed * dt;
    state.worldTime += dt;

    checkCollisions();
    updateObjectives();
    updateHUD();
    updateMinimap();
  }

  function checkCollisions() {
    const vehicle = state.vehicle;

    for (const obstacle of state.obstacles) {
      if (obstacle.hit) continue;

      const relativeZ = obstacle.z + vehicle.distance;

      if (
        Math.abs(relativeZ) < 2.1 &&
        Math.abs(obstacle.x - vehicle.x) < 1.4
      ) {
        obstacle.hit = true;

        if (Date.now() < state.abilities.shieldUntil) {
          notify('Bouclier tactique', 'MEME a protégé le véhicule.');
        } else {
          vehicle.health = Math.max(
            0,
            vehicle.health - random(7, 14) * (1 - vehicle.armor / 150)
          );

          state.teamHealth = Math.max(
            0,
            state.teamHealth - random(2, 5)
          );

          vehicle.collisions += 1;

          notify(
            'Collision !',
            'Ralentissez et évitez les obstacles suivants.'
          );

          vibrate(80);
        }

        vehicle.speed *= 0.45;

        if (vehicle.health <= 0 || state.teamHealth <= 0) {
          failMission();
        }
      }
    }

    for (const item of state.collected) {
      if (item.collected) continue;

      const relativeZ = item.z + vehicle.distance;

      if (
        Math.abs(relativeZ) < 1.8 &&
        Math.abs(item.x - vehicle.x) < 1.4
      ) {
        item.collected = true;

        state.credits += 10;

        notify(
          'Objet récupéré',
          '+10 crédits pour l’unité Force Unie.'
        );

        scheduleSave();
      }
    }
  }

  function failMission() {
    state.running = false;
    state.paused = false;
    state.vehicle.speed = 0;

    setText(dom.resultEyebrow, 'RAPPORT DE MISSION');
    setText(dom.resultTitle, 'Mission échouée');
    setText(
      dom.resultMessage,
      'Le véhicule ou l’équipe ne peut plus continuer. Réparez votre véhicule et réessayez.'
    );
    setText(
      dom.resultProgress,
      `${Math.floor(state.objectiveProgress)} %`
    );
    setText(dom.resultReward, '0 crédit');

    if (dom.nextMissionButton) {
      dom.nextMissionButton.disabled = true;
    }

    show(dom.resultOverlay);

    scheduleSave();
  }

  /* ==========================================================
     HUD ET RADAR
     ========================================================== */

  function updateHUD() {
    const mission = getMission();

    setText(dom.missionNumber, `MISSION ${String(mission.number).padStart(2, '0')}`);
    setText(dom.missionTitle, mission.title);
    setText(dom.missionObjective, mission.description);

    setText(
      dom.speedValue,
      formatNumber(Math.abs(state.vehicle.speed) * 3.6)
    );

    setWidth(dom.vehicleHealthBar, state.vehicle.health);
    setText(dom.vehicleHealthText, `${Math.round(state.vehicle.health)} %`);

    setWidth(dom.teamHealthBar, state.teamHealth);
    setText(dom.teamHealthText, `${Math.round(state.teamHealth)} %`);

    setText(
      dom.teamStatusText,
      state.teamHealth > 70
        ? 'Équipe prête'
        : state.teamHealth > 30
          ? 'Équipe sous pression'
          : 'Équipe en danger'
    );

    setText(
      dom.memeStatus,
      state.abilities.memeReady ? 'Prêt' : 'Utilisé'
    );

    setText(
      dom.novaStatus,
      state.abilities.novaReady ? 'Prête' : 'Utilisée'
    );

    setText(
      dom.axelStatus,
      state.abilities.axelReady ? 'Prêt' : 'Utilisé'
    );

    if (dom.navigationPromptText) {
      const remaining = Math.max(
        0,
        mission.distance - state.vehicle.distance
      );

      setText(
        dom.navigationPromptText,
        `Destination à ${formatNumber(remaining)} m`
      );
    }
  }

  function updateMinimap() {
    const canvas = dom.minimapCanvas;

    if (!canvas || canvas.width === 0) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#071a15';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(99, 255, 180, 0.08)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += 22) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#34443f';
    ctx.fillRect(width * 0.34, 0, width * 0.32, height);

    ctx.strokeStyle = '#d5d2a1';
    ctx.setLineDash([8, 8]);

    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    ctx.setLineDash([]);

    state.obstacles.forEach((obstacle) => {
      if (obstacle.hit) return;

      const relativeZ = obstacle.z + state.vehicle.distance;

      if (relativeZ < -100 || relativeZ > 20) return;

      const x = width / 2 + obstacle.x * 12;
      const y = height * 0.65 + relativeZ * 1.5;

      ctx.fillStyle = '#ff865f';
      ctx.fillRect(x - 3, y - 3, 6, 6);
    });

    const mission = getMission();

    const remaining = Math.max(
      0,
      mission.distance - state.vehicle.distance
    );

    const targetY = clamp(
      height * 0.25 + remaining * 0.10,
      18,
      height - 18
    );

    ctx.fillStyle = '#ffda5b';
    ctx.beginPath();
    ctx.arc(width / 2, targetY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#68ffbd';
    ctx.beginPath();
    ctx.arc(
      width / 2 + state.vehicle.x * 12,
      height * 0.78,
      7,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.strokeStyle = '#68ffbd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      width / 2 + state.vehicle.x * 12,
      height * 0.78,
      11,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  /* ==========================================================
     BOUCLE DE JEU
     ========================================================== */

  function frame(timestamp) {
    state.animationFrame = requestAnimationFrame(frame);

    if (!state.lastFrame) {
      state.lastFrame = timestamp;
    }

    const delta = (timestamp - state.lastFrame) / 1000;

    state.lastFrame = timestamp;

    if (document.hidden) return;

    updatePhysics(delta);
    renderScene();
  }

  function startGameLoop() {
    if (state.animationFrame) {
      cancelAnimationFrame(state.animationFrame);
    }

    state.lastFrame = 0;
    state.animationFrame = requestAnimationFrame(frame);
  }

  /* ==========================================================
     CAPACITÉS DE L'ÉQUIPE
     ========================================================== */

  function useMemeAbility() {
    if (!state.running || state.paused) {
      toast('Commencez une mission pour utiliser cette capacité.');
      return;
    }

    if (!state.abilities.memeReady) {
      toast('La capacité de MEME a déjà été utilisée.');
      return;
    }

    state.abilities.memeReady = false;
    state.abilities.shieldUntil = Date.now() + 10000;

    notify(
      'MEME — Vision tactique',
      'Bouclier tactique actif pendant 10 secondes.'
    );

    updateHUD();
    vibrate(50);
  }

  function useNovaAbility() {
    if (!state.running || state.paused) {
      toast('Commencez une mission pour utiliser cette capacité.');
      return;
    }

    if (!state.abilities.novaReady) {
      toast('La capacité de NOVA a déjà été utilisée.');
      return;
    }

    state.abilities.novaReady = false;

    state.vehicle.health = Math.min(
      100,
      state.vehicle.health + 35
    );

    state.teamHealth = Math.min(
      100,
      state.teamHealth + 12
    );

    notify(
      'NOVA — Réparation rapide',
      'Le véhicule et l’équipe ont été réparés.'
    );

    updateHUD();
    scheduleSave();
    vibrate(60);
  }

  function useAxelAbility() {
    if (!state.running || state.paused) {
      toast('Commencez une mission pour utiliser cette capacité.');
      return;
    }

    if (!state.abilities.axelReady) {
      toast('La capacité d’AXEL a déjà été utilisée.');
      return;
    }

    state.abilities.axelReady = false;
    state.abilities.scanUntil = Date.now() + 10000;

    state.obstacles.forEach((obstacle) => {
      if (
        obstacle.z + state.vehicle.distance < 0 &&
        obstacle.z + state.vehicle.distance > -90
      ) {
        obstacle.scanned = true;
      }
    });

    notify(
      'AXEL — Scan de la zone',
      'Les obstacles proches ont été détectés sur le radar.'
    );

    updateHUD();
    updateMinimap();
    vibrate(45);
  }

  /* ==========================================================
     GARAGE
     ========================================================== */

  function updateGarage() {
    setText(dom.garageVehicleName, 'Force One');

    setText(
      dom.garageVehicleDescription,
      'Véhicule polyvalent de l’équipe Force Unie.'
    );

    setWidth(dom.garageSpeedBar, state.vehicle.engine);
    setText(
      dom.garageSpeedValue,
      `${Math.round(state.vehicle.engine)}/100`
    );

    setWidth(dom.garageArmorBar, state.vehicle.armor);
    setText(
      dom.garageArmorValue,
      `${Math.round(state.vehicle.armor)}/100`
    );

    setWidth(dom.garageHandlingBar, state.vehicle.handling);
    setText(
      dom.garageHandlingValue,
      `${Math.round(state.vehicle.handling)}/100`
    );
  }

  function repairVehicle() {
    const price = 50;

    if (state.vehicle.health >= 100) {
      setText(dom.garageMessage, 'Le véhicule est déjà en parfait état.');
      return;
    }

    if (state.credits < price) {
      setText(
        dom.garageMessage,
        `Il vous faut ${price} crédits pour réparer le véhicule.`
      );

      return;
    }

    state.credits -= price;
    state.vehicle.health = 100;

    setText(
      dom.garageMessage,
      'Véhicule réparé. Résistance : 100 %.'
    );

    updateGarage();
    updateMenu();
    scheduleSave();
    toast('Véhicule réparé.');
  }

  function upgradeVehicle() {
    const price = 100;

    if (
      state.vehicle.engine >= 100 &&
      state.vehicle.armor >= 100 &&
      state.vehicle.handling >= 100
    ) {
      setText(dom.garageMessage, 'Toutes les améliorations sont au maximum.');
      return;
    }

    if (state.credits < price) {
      setText(
        dom.garageMessage,
        `Il vous faut ${price} crédits pour cette amélioration.`
      );

      return;
    }

    state.credits -= price;

    state.vehicle.engine = Math.min(
      100,
      state.vehicle.engine + 8
    );

    state.vehicle.armor = Math.min(
      100,
      state.vehicle.armor + 8
    );

    state.vehicle.handling = Math.min(
      100,
      state.vehicle.handling + 8
    );

    setText(
      dom.garageMessage,
      'Amélioration effectuée avec succès.'
    );

    updateGarage();
    updateMenu();
    scheduleSave();

    toast('Véhicule amélioré.');
  }

  /* ==========================================================
     PARAMÈTRES
     ========================================================== */

  function applySettingsToControls() {
    const settings = state.settings;

    if (dom.graphicsQuality) {
      dom.graphicsQuality.value = settings.graphicsQuality;
    }

    if (dom.cameraDistance) {
      dom.cameraDistance.value = settings.cameraDistance;
    }

    if (dom.steeringSensitivity) {
      dom.steeringSensitivity.value = settings.steeringSensitivity;
    }

    if (dom.gameVolume) {
      dom.gameVolume.value = settings.gameVolume;
    }

    if (dom.vibrationEnabled) {
      dom.vibrationEnabled.checked = settings.vibrationEnabled;
    }

    if (dom.touchZoomEnabled) {
      dom.touchZoomEnabled.checked = settings.touchZoomEnabled;
    }

    if (dom.showSubtitles) {
      dom.showSubtitles.checked = settings.showSubtitles;
    }

    updateSettingOutputs();
  }

  function updateSettingOutputs() {
    setText(
      dom.cameraDistanceValue,
      Number(state.settings.cameraDistance).toFixed(1)
    );

    setText(
      dom.steeringSensitivityValue,
      Number(state.settings.steeringSensitivity).toFixed(1)
    );

    setText(
      dom.gameVolumeValue,
      `${state.settings.gameVolume} %`
    );
  }

  function readSettingsControls() {
    state.settings.graphicsQuality = dom.graphicsQuality?.value || 'medium';

    state.settings.cameraDistance = clamp(
      Number(dom.cameraDistance?.value) || 7,
      4,
      12
    );

    state.settings.steeringSensitivity = clamp(
      Number(dom.steeringSensitivity?.value) || 1,
      0.5,
      2
    );

    state.settings.gameVolume = clamp(
      Number(dom.gameVolume?.value) || 0,
      0,
      100
    );

    state.settings.vibrationEnabled = Boolean(
      dom.vibrationEnabled?.checked
    );

    state.settings.touchZoomEnabled = Boolean(
      dom.touchZoomEnabled?.checked
    );

    state.settings.showSubtitles = Boolean(
      dom.showSubtitles?.checked
    );

    state.camera.zoom = state.settings.cameraDistance;
    state.camera.targetZoom = state.settings.cameraDistance;
    state.camera.sensitivity = state.settings.steeringSensitivity;

    updateSettingOutputs();
  }

  function saveSettings() {
    readSettingsControls();

    if (dom.settingsMessage) {
      setText(dom.settingsMessage, 'Paramètres enregistrés.');
    }

    scheduleSave();

    toast('Paramètres enregistrés.');
  }

  function resetSettings() {
    state.settings = { ...defaultSettings };

    applySettingsToControls();

    state.camera.zoom = defaultSettings.cameraDistance;
    state.camera.targetZoom = defaultSettings.cameraDistance;

    if (dom.settingsMessage) {
      setText(dom.settingsMessage, 'Paramètres réinitialisés.');
    }

    scheduleSave();
  }

  /* ==========================================================
     COMMANDES CLAVIER
     ========================================================== */

  function isTypingTarget(target) {
    if (!target) return false;

    return Boolean(
      target.closest(
        'input, textarea, select, button, a, [contenteditable="true"]'
      )
    );
  }

  function releaseAllInputs() {
    Object.keys(state.input).forEach((key) => {
      if (key === 'keys') return;

      state.input[key] = false;
    });

    state.input.keys.clear();
  }

  function handleKeyDown(event) {
    if (isTypingTarget(event.target)) return;

    const key = event.key.toLowerCase();

    const controls = [
      'arrowup',
      'arrowdown',
      'arrowleft',
      'arrowright',
      ' ',
      'shift'
    ];

    if (controls.includes(key)) {
      event.preventDefault();
    }

    state.input.keys.add(key);

    if (key === 'w' || key === 'arrowup') {
      state.input.accelerate = true;
    }

    if (key === 's' || key === 'arrowdown') {
      state.input.reverse = true;
    }

    if (key === 'a' || key === 'arrowleft') {
      state.input.left = true;
    }

    if (key === 'd' || key === 'arrowright') {
      state.input.right = true;
    }

    if (key === ' ') {
      state.input.brake = true;
    }

    if (key === 'shift') {
      state.input.handbrake = true;
    }

    if (key === 'escape') {
      if (state.running && !state.paused) {
        pauseGame();
      } else if (state.paused) {
        resumeGame();
      }
    }

    if (key === 'e') {
      interact();
    }
  }

  function handleKeyUp(event) {
    const key = event.key.toLowerCase();

    state.input.keys.delete(key);

    if (key === 'w' || key === 'arrowup') {
      state.input.accelerate = false;
    }

    if (key === 's' || key === 'arrowdown') {
      state.input.reverse = false;
    }

    if (key === 'a' || key === 'arrowleft') {
      state.input.left = false;
    }

    if (key === 'd' || key === 'arrowright') {
      state.input.right = false;
    }

    if (key === ' ') {
      state.input.brake = false;
    }

    if (key === 'shift') {
      state.input.handbrake = false;
    }
  }

  function bindHoldButton(element, inputName) {
    if (!element) return;

    const start = (event) => {
      event.preventDefault();

      state.input[inputName] = true;

      try {
        element.setPointerCapture(event.pointerId);
      } catch (_) {
        // Capture facultative selon le navigateur.
      }
    };

    const end = (event) => {
      if (event) event.preventDefault();

      state.input[inputName] = false;
    };

    element.addEventListener('pointerdown', start);
    element.addEventListener('pointerup', end);
    element.addEventListener('pointercancel', end);
    element.addEventListener('lostpointercapture', end);
    element.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
  }

  /* ==========================================================
     ZOOM TACTILE À DEUX DOIGTS
     ========================================================== */

  function initializePinchZoom() {
    const canvas = () => state.renderer?.canvas;

    let initialDistance = 0;
    let initialZoom = state.camera.zoom;

    function distanceBetweenTouches(touches) {
      const a = touches[0];
      const b = touches[1];

      return Math.hypot(
        b.clientX - a.clientX,
        b.clientY - a.clientY
      );
    }

    document.addEventListener(
      'touchstart',
      (event) => {
        if (!state.settings.touchZoomEnabled) return;
        if (state.screen !== 'gameScreen') return;
        if (event.touches.length !== 2) return;

        initialDistance = distanceBetweenTouches(event.touches);
        initialZoom = state.camera.targetZoom;
      },
      { passive: true }
    );

    document.addEventListener(
      'touchmove',
      (event) => {
        if (!state.settings.touchZoomEnabled) return;
        if (state.screen !== 'gameScreen') return;
        if (event.touches.length !== 2) return;

        const currentCanvas = canvas();

        if (!currentCanvas) return;

        const distance = distanceBetweenTouches(event.touches);

        if (initialDistance <= 0) return;

        const ratio = initialDistance / Math.max(distance, 1);

        state.camera.targetZoom = clamp(
          initialZoom * ratio,
          4,
          12
        );

        state.camera.zoom = lerp(
          state.camera.zoom,
          state.camera.targetZoom,
          0.3
        );

        if (event.cancelable) {
          event.preventDefault();
        }
      },
      { passive: false }
    );

    document.addEventListener('touchend', (event) => {
      if (event.touches.length < 2) {
        initialDistance = 0;
      }
    });
  }

  /* ==========================================================
     CAMÉRA ET INTERACTION
     ========================================================== */

  function toggleCamera() {
    state.camera.mode = state.camera.mode === 0 ? 1 : 0;

    toast(
      state.camera.mode === 0
        ? 'Caméra arrière'
        : 'Caméra rapprochée'
    );
  }

  function interact() {
    if (!state.running || state.paused) return;

    const nearest = state.collected.find((item) => {
      const z = item.z + state.vehicle.distance;

      return (
        !item.collected &&
        Math.abs(z) < 8 &&
        Math.abs(item.x - state.vehicle.x) < 3
      );
    });

    if (nearest) {
      nearest.collected = true;
      state.credits += 10;

      notify('Interaction réussie', 'Vous avez récupéré 10 crédits.');

      scheduleSave();

      return;
    }

    notify(
      'Aucune interaction',
      'Continuez sur la route et approchez-vous des objets.'
    );
  }

  /* ==========================================================
     PAUSE ET RÉSULTATS
     ========================================================== */

  function pauseGame() {
    if (!state.running || state.paused) return;

    state.paused = true;

    releaseAllInputs();
    show(dom.pauseOverlay);
  }

  function resumeGame() {
    if (state.completed) return;

    state.paused = false;

    hide(dom.pauseOverlay);

    state.lastFrame = performance.now();
  }

  function exitToMenu() {
    openConfirm(
      'Quitter la mission ?',
      'Votre progression sera sauvegardée si IndexedDB est disponible.',
      async () => {
        await saveGame(false);
        openMainMenu();
      }
    );
  }

  /* ==========================================================
     ÉVÉNEMENTS ET BOUTONS HTML
     ========================================================== */

  function bindEvents() {
    dom.brandHomeButton?.addEventListener('click', (event) => {
      event.preventDefault();

      if (state.running) {
        exitToMenu();
      } else {
        openMainMenu();
      }
    });

    dom.newGameButton?.addEventListener('click', () => {
      startMission(0);
    });

    dom.continueGameButton?.addEventListener('click', () => {
      if (!state.saveAvailable) {
        toast('Aucune sauvegarde disponible.');
        return;
      }

      startMission(
        clamp(state.currentMission, 0, missions.length - 1)
      );
    });

    dom.missionsMenuButton?.addEventListener('click', () => {
      navigate('missionsScreen');
    });

    dom.garageMenuButton?.addEventListener('click', () => {
      navigate('garageScreen');
    });

    dom.settingsMenuButton?.addEventListener('click', () => {
      navigate('settingsScreen');
    });

    dom.helpMenuButton?.addEventListener('click', () => {
      navigate('helpScreen');
    });

    document.querySelectorAll('[data-back-menu]').forEach((button) => {
      button.addEventListener('click', openMainMenu);
    });

    document.querySelectorAll('[data-start-mission]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.startMission;

        const index = missions.findIndex((mission) => mission.id === id);

        if (index !== -1) {
          startMission(index);
        }
      });
    });

    dom.headerPauseButton?.addEventListener('click', pauseGame);
    dom.gamePauseButton?.addEventListener('click', pauseGame);

    dom.backToMenuButton?.addEventListener('click', exitToMenu);

    dom.resumeGameButton?.addEventListener('click', resumeGame);

    dom.pauseSaveButton?.addEventListener('click', async () => {
      await saveGame(true);
    });

    dom.pauseRestartButton?.addEventListener('click', () => {
      openConfirm(
        'Recommencer la mission ?',
        'La progression de cette mission sera remise à zéro.',
        restartMission
      );
    });

    dom.pauseExitButton?.addEventListener('click', exitToMenu);

    dom.resultMenuButton?.addEventListener('click', openMainMenu);

    dom.replayMissionButton?.addEventListener('click', restartMission);

    dom.nextMissionButton?.addEventListener('click', () => {
      if (state.currentMission < missions.length - 1) {
        startMission(state.currentMission + 1);
      }
    });

    dom.confirmCancelButton?.addEventListener('click', closeConfirm);

    dom.confirmAcceptButton?.addEventListener('click', async () => {
      const action = state.confirmAction;

      closeConfirm();

      if (typeof action === 'function') {
        await action();
      }
    });

    dom.closeToastButton?.addEventListener('click', () => {
      hide(dom.globalToast);
    });

    dom.saveStatusButton?.addEventListener('click', () => {
      saveGame(true);
    });

    dom.footerSaveButton?.addEventListener('click', () => {
      saveGame(true);
    });

    dom.repairVehicleButton?.addEventListener('click', repairVehicle);
    dom.upgradeVehicleButton?.addEventListener('click', upgradeVehicle);

    dom.saveSettingsButton?.addEventListener('click', saveSettings);
    dom.resetSettingsButton?.addEventListener('click', resetSettings);

    [
      dom.graphicsQuality,
      dom.cameraDistance,
      dom.steeringSensitivity,
      dom.gameVolume,
      dom.vibrationEnabled,
      dom.touchZoomEnabled,
      dom.showSubtitles
    ].forEach((element) => {
      element?.addEventListener('input', () => {
        readSettingsControls();
      });

      element?.addEventListener('change', () => {
        readSettingsControls();
      });
    });

    dom.toggleObjectivesButton?.addEventListener('click', () => {
      const isHidden = dom.objectiveList?.hidden || false;

      if (dom.objectiveList) {
        dom.objectiveList.hidden = !isHidden;
      }

      const expanded = isHidden;

      dom.toggleObjectivesButton.setAttribute(
        'aria-expanded',
        String(expanded)
      );

      dom.toggleObjectivesButton.textContent = expanded ? '−' : '+';
    });

    dom.toggleMinimapButton?.addEventListener('click', () => {
      const isHidden = dom.minimapCanvas?.hidden || false;

      if (dom.minimapCanvas) {
        dom.minimapCanvas.hidden = !isHidden;
      }

      const expanded = isHidden;

      dom.toggleMinimapButton.setAttribute(
        'aria-pressed',
        String(expanded)
      );
    });

    dom.memeAbilityButton?.addEventListener('click', useMemeAbility);
    dom.novaAbilityButton?.addEventListener('click', useNovaAbility);
    dom.axelAbilityButton?.addEventListener('click', useAxelAbility);

    dom.cameraModeButton?.addEventListener('click', toggleCamera);

    dom.handbrakeButton?.addEventListener('pointerdown', () => {
      state.input.handbrake = true;
    });

    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((name) => {
      dom.handbrakeButton?.addEventListener(name, () => {
        state.input.handbrake = false;
      });
    });

    dom.interactButton?.addEventListener('click', interact);

    bindHoldButton(dom.steerLeftButton, 'left');
    bindHoldButton(dom.steerRightButton, 'right');
    bindHoldButton(dom.brakeButton, 'brake');
    bindHoldButton(dom.accelerateButton, 'accelerate');
    bindHoldButton(dom.reverseButton, 'reverse');

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    window.addEventListener('blur', releaseAllInputs);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        releaseAllInputs();

        if (state.running && !state.paused) {
          pauseGame();
        }

        saveGame(false);
      }
    });

    window.addEventListener('resize', resizeRenderer);

    window.addEventListener('beforeunload', () => {
      releaseAllInputs();
    });

    dom.loadingRetryButton?.addEventListener('click', () => {
      location.reload();
    });
  }

  /* ==========================================================
     INITIALISATION
     ========================================================== */

  async function init() {
    try {
      setLoadingProgress(8, 'Initialisation des systèmes…');

      bindEvents();

      setLoadingProgress(22, 'Chargement de la sauvegarde…');

      await initializeStorage();

      setLoadingProgress(48, 'Création du monde 3D…');

      initializeRenderer();

      setLoadingProgress(70, 'Préparation des commandes…');

      initializePinchZoom();

      applySettingsToControls();

      createMissionWorld(0);
      createObjectives(0);

      setLoadingProgress(90, 'Synchronisation de l’interface…');

      updateHUD();
      updateMinimap();
      updateGarage();
      updateMissionCards();
      updateMenu();

      setLoadingProgress(100, 'Prêt à jouer !');

      setTimeout(() => {
        navigate('mainMenu');
      }, 250);

      startGameLoop();

      console.info(
        `FOBAS MISSION FORCE UNIE 3D — version ${VERSION} initialisée.`
      );
    } catch (error) {
      console.error('Erreur initialisation FOBAS :', error);

      setConnection('Erreur graphique', false);

      showLoadingError(
        `Impossible d’initialiser le jeu : ${error.message}`
      );

      if (dom.sceneFallback) {
        show(dom.sceneFallback);
      }
    }
  }

  return {
    init,
    startMission,
    saveGame,
    pauseGame,
    resumeGame,
    getState: () => state
  };
})();

/* ============================================================
   DÉMARRAGE
   ============================================================ */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    FOBAS_GAME.init();
  }, { once: true });
} else {
  FOBAS_GAME.init();
}








