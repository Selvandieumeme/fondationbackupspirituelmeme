/* ============================================================
   NINA — FOBAS 3D | ACTION SURVIVAL ENGINE
   Fichier : appactionninafobas.js
   Version  : 1.0.0
   Auteur   : FOBAS GAME STUDIO

   Fonctionnalités :
   - Moteur 3D Three.js avec chargement local puis CDN
   - Personnage NINA construit en 3D
   - Terrain, végétation, rochers et éclairage dynamique
   - Créatures ennemies avec déplacement et attaques
   - Tir, visée, rechargement et changement d'arme
   - 10 missions avec progression déverrouillable
   - Joystick mobile, commandes tactiles et clavier
   - Caméra troisième personne et zoom à deux doigts
   - Santé, armure, munitions, radar, score et chronomètre
   - Pause, victoire, défaite et paramètres
   - Sauvegarde IndexedDB avec solution de secours
   - Aucun besoin de modifier les autres applications

   IMPORTANT :
   Exécuter depuis un serveur HTTP/HTTPS.
   Fichier CSS attendu : appactionninafobas.css
   ============================================================ */

'use strict';

(async function NINA_FOBAS_GAME() {
  /* ==========================================================
     1. CONFIGURATION GÉNÉRALE
  ========================================================== */

  const APP_VERSION = '1.0.0';
  const DB_NAME = 'FOBAS_NINA_3D_DB';
  const DB_VERSION = 1;
  const STORE_NAME = 'gameSaves';

  const $ = (id) => document.getElementById(id);

  const app = $('ninaGameApp');

  if (!app) {
    console.error('[NINA 3D] Élément #ninaGameApp introuvable.');
    return;
  }

  const dom = {
    loadingScreen: $('loadingScreen'),
    loadingMessage: $('loadingMessage'),
    loadingProgress: $('loadingProgress'),

    mainMenu: $('mainMenu'),
    menuSettingsBtn: $('menuSettingsBtn'),
    startGameBtn: $('startGameBtn'),
    missionsMenuBtn: $('missionsMenuBtn'),
    engineStatus: $('engineStatus'),

    missionScreen: $('missionScreen'),
    missionsBackBtn: $('missionsBackBtn'),
    missionGrid: $('missionGrid'),
    missionsUnlockedCount: $('missionsUnlockedCount'),
    campaignProgressText: $('campaignProgressText'),
    campaignProgressBar: $('campaignProgressBar'),

    gameScreen: $('gameScreen'),
    gameWorld: $('gameWorld'),
    canvas: $('nina3DCanvas'),
    worldLoading: $('worldLoading'),
    worldLoadingMessage: $('worldLoadingMessage'),
    gameToast: $('gameToast'),

    gameMenuBtn: $('gameMenuBtn'),
    pauseGameBtn: $('pauseGameBtn'),

    currentMissionLabel: $('currentMissionLabel'),
    currentMissionName: $('currentMissionName'),
    missionObjective: $('missionObjective'),

    healthText: $('healthText'),
    healthBar: $('healthBar'),
    armorText: $('armorText'),
    armorBar: $('armorBar'),

    objectiveProgress: $('objectiveProgress'),

    bossHealthPanel: $('bossHealthPanel'),
    bossName: $('bossName'),
    bossHealthBar: $('bossHealthBar'),

    aimReticle: $('aimReticle'),
    damageIndicator: $('damageIndicator'),

    minimap: $('minimap'),
    minimapCanvas: $('minimapCanvas'),
    radarStatus: $('radarStatus'),

    weaponName: $('weaponName'),
    weaponMode: $('weaponMode'),
    ammoCurrent: $('ammoCurrent'),
    ammoReserve: $('ammoReserve'),

    movementZone: $('movementZone'),
    joystickBase: $('joystickBase'),
    joystickThumb: $('joystickThumb'),

    runBtn: $('runBtn'),
    jumpBtn: $('jumpBtn'),
    aimBtn: $('aimBtn'),
    reloadBtn: $('reloadBtn'),
    weaponSwitchBtn: $('weaponSwitchBtn'),
    fireBtn: $('fireBtn'),

    keyboardHints: $('keyboardHints'),

    pauseScreen: $('pauseScreen'),
    resumeGameBtn: $('resumeGameBtn'),
    restartMissionBtn: $('restartMissionBtn'),
    pauseMissionsBtn: $('pauseMissionsBtn'),
    pauseMainMenuBtn: $('pauseMainMenuBtn'),

    victoryScreen: $('victoryScreen'),
    victoryMessage: $('victoryMessage'),
    victoryKills: $('victoryKills'),
    victoryScore: $('victoryScore'),
    victoryTime: $('victoryTime'),
    nextMissionBtn: $('nextMissionBtn'),
    victoryMissionsBtn: $('victoryMissionsBtn'),
    victoryMenuBtn: $('victoryMenuBtn'),

    gameOverScreen: $('gameOverScreen'),
    gameOverMessage: $('gameOverMessage'),
    failedKills: $('failedKills'),
    failedScore: $('failedScore'),
    failedTime: $('failedTime'),
    retryMissionBtn: $('retryMissionBtn'),
    gameOverMissionsBtn: $('gameOverMissionsBtn'),
    gameOverMenuBtn: $('gameOverMenuBtn'),

    settingsScreen: $('settingsScreen'),
    closeSettingsBtn: $('closeSettingsBtn'),
    graphicsQuality: $('graphicsQuality'),
    sensitivityRange: $('sensitivityRange'),
    soundToggle: $('soundToggle'),
    vibrationToggle: $('vibrationToggle'),
    showMinimapToggle: $('showMinimapToggle'),
    saveSettingsBtn: $('saveSettingsBtn'),

    orientationNotice: $('orientationNotice'),
    ninaAnnouncement: $('ninaAnnouncement')
  };

  const missionData = [
    {
      name: 'JUNGLE HOSTILE',
      description: 'Reconnaissance et survie',
      objective: 'Éliminez 5 créatures et sécurisez la jungle.',
      creatures: 5,
      difficulty: 1,
      color: 0x426b38,
      boss: false
    },
    {
      name: 'LA MEUTE SAUVAGE',
      description: 'Éliminer les prédateurs',
      objective: 'Éliminez 7 prédateurs hostiles.',
      creatures: 7,
      difficulty: 1.2,
      color: 0x53643b,
      boss: false
    },
    {
      name: 'TERRE VOLCANIQUE',
      description: 'Traverser la zone brûlante',
      objective: 'Survivez à la zone volcanique et éliminez 8 créatures.',
      creatures: 8,
      difficulty: 1.4,
      color: 0x684536,
      boss: false
    },
    {
      name: 'EAUX MORTELLES',
      description: 'Créatures aquatiques',
      objective: 'Neutralisez 9 créatures de la zone marécageuse.',
      creatures: 9,
      difficulty: 1.55,
      color: 0x365c53,
      boss: false
    },
    {
      name: 'NUIT DE TERREUR',
      description: 'Opération nocturne',
      objective: 'Survivez à la nuit et éliminez 10 créatures.',
      creatures: 10,
      difficulty: 1.75,
      color: 0x263448,
      boss: false
    },
    {
      name: 'LE COLOSSE',
      description: 'Affronter une bête géante',
      objective: 'Vainquez le colosse et ses créatures.',
      creatures: 8,
      difficulty: 2,
      color: 0x635343,
      boss: true
    },
    {
      name: 'AVANT-POSTE OUBLIÉ',
      description: 'Explorer et sécuriser la zone',
      objective: 'Nettoyez l’avant-poste et éliminez 11 créatures.',
      creatures: 11,
      difficulty: 2.15,
      color: 0x4a5a42,
      boss: false
    },
    {
      name: 'LE PRÉDATEUR ALPHA',
      description: 'Chasser le monstre dominant',
      objective: 'Vainquez le prédateur Alpha.',
      creatures: 10,
      difficulty: 2.4,
      color: 0x3e483e,
      boss: true
    },
    {
      name: 'DERNIÈRE FRONTIÈRE',
      description: 'Défendre la zone finale',
      objective: 'Défendez la frontière contre 12 créatures.',
      creatures: 12,
      difficulty: 2.65,
      color: 0x514b42,
      boss: true
    },
    {
      name: 'REINE DES BÊTES',
      description: 'Combat final et survie totale',
      objective: 'Vainquez la Reine des bêtes et survivez.',
      creatures: 13,
      difficulty: 3,
      color: 0x53374c,
      boss: true
    }
  ];

  const weapons = [
    {
      name: 'TACTICAL RIFLE',
      mode: 'MODE AUTOMATIQUE',
      magazine: 30,
      reserve: 120,
      damage: 28,
      rate: 145,
      reload: 1400,
      range: 65,
      spread: 0.018
    },
    {
      name: 'ASSAULT RIFLE',
      mode: 'MODE RAPIDE',
      magazine: 40,
      reserve: 160,
      damage: 20,
      rate: 95,
      reload: 1650,
      range: 55,
      spread: 0.028
    },
    {
      name: 'HEAVY BLASTER',
      mode: 'MODE PUISSANT',
      magazine: 12,
      reserve: 48,
      damage: 75,
      rate: 480,
      reload: 1900,
      range: 80,
      spread: 0.009
    }
  ];








const ammoType = getNinaAmmo();








  const state = {
    THREE: null,
    renderer: null,
    scene: null,
    camera: null,
    clock: null,

    running: false,
    paused: false,
    gameStarted: false,
    missionIndex: 0,

    health: 100,
    armor: 100,

    kills: 0,
    score: 0,
    elapsed: 0,

    ammo: 30,
    reserve: 120,
    weaponIndex: 0,

    unlockedMissions: 1,
    completedMissions: [],

    enemies: [],
    decorations: [],
    effects: [],

    player: null,
    playerParts: {},
    playerVelocityY: 0,
    grounded: true,

    moveX: 0,
    moveY: 0,
    moving: false,
    sprinting: false,
    aiming: false,
    firing: false,

    yaw: 0,
    pitch: -0.15,
    cameraDistance: 7.5,
    sensitivity: 0.004,

    keys: new Set(),
    pointer: null,
    joystickPointer: null,
    cameraPointers: new Map(),
    pinchDistance: 0,

    lastShot: 0,
    lastEnemyAttack: 0,
    reloadInProgress: false,

    missionStartTime: 0,
    toastTimer: null,
    animationFrame: 0,
    lastFrame: 0,

    db: null,
    saveQueue: Promise.resolve(),

    settings: {
      quality: 'medium',
      sensitivity: 5,
      sound: true,
      vibration: true,
      minimap: true
    },

    audioContext: null,
    audioUnlocked: false,

    raycaster: null,
    screenCenter: null,

    disposed: false
  };









/* ==========================================================
   FOBAS ACTION NINA 3D — ARSENAL DYNAMIQUE
   20 munitions + 10 équipements
========================================================== */

const NINA_AMMO_TYPES = [
  { id: 'standard', name: 'Munitions standard', category: 'BASE', damage: 1, range: 1, rate: 1, stock: 180, description: 'Munition polyvalente pour les combats courants.' },
  { id: 'perforante', name: 'Munitions perforantes', category: 'PÉNÉTRATION', damage: 1.35, range: 1.1, rate: 1.05, stock: 100, description: 'Augmente les dégâts contre les cibles résistantes.' },
  { id: 'explosive', name: 'Munitions explosives', category: 'EXPLOSIF', damage: 1.8, range: 0.9, rate: 1.25, stock: 55, description: 'Dégâts élevés à chaque impact.' },
  { id: 'incendiaire', name: 'Munitions incendiaires', category: 'FEU', damage: 1.55, range: 1, rate: 1.1, stock: 65, description: 'Munitions à forte puissance thermique.' },
  { id: 'cryo', name: 'Munitions cryogéniques', category: 'GLACE', damage: 1.2, range: 1, rate: 1.1, stock: 65, description: 'Munition spéciale adaptée au contrôle des menaces.' },
  { id: 'electrique', name: 'Munitions électriques', category: 'ÉLECTRIQUE', damage: 1.45, range: 1.05, rate: 1.15, stock: 60, description: 'Décharge énergétique concentrée.' },
  { id: 'plasma', name: 'Munitions plasma', category: 'ÉNERGIE', damage: 2, range: 1.15, rate: 1.35, stock: 40, description: 'Énergie concentrée pour infliger de lourds dégâts.' },
  { id: 'uranium', name: 'Munitions denses', category: 'LOURDE', damage: 2.2, range: 1.2, rate: 1.5, stock: 35, description: 'Munition lourde, puissante mais plus lente.' },
  { id: 'precision', name: 'Munitions de précision', category: 'PRÉCISION', damage: 1.7, range: 1.5, rate: 1.15, stock: 50, description: 'Portée augmentée pour les cibles éloignées.' },
  { id: 'chasse', name: 'Munitions de chasse', category: 'IMPACT', damage: 1.4, range: 0.75, rate: 0.95, stock: 80, description: 'Dégâts renforcés à courte portée.' },
  { id: 'emp', name: 'Munitions IEM', category: 'IEM', damage: 1.25, range: 1.1, rate: 1.1, stock: 45, description: 'Munition technologique contre les menaces avancées.' },
  { id: 'toxique', name: 'Munitions toxiques', category: 'TOXIQUE', damage: 1.6, range: 0.95, rate: 1.2, stock: 45, description: 'Charge spécialisée à dégâts élevés.' },
  { id: 'anti-boss', name: 'Munitions anti-boss', category: 'ANTI-BOSS', damage: 2.5, range: 1.1, rate: 1.6, stock: 25, description: 'Optimisées pour les grandes menaces.' },
  { id: 'rapide', name: 'Munitions légères', category: 'RAPIDITÉ', damage: 0.85, range: 0.95, rate: 0.72, stock: 160, description: 'Tir plus rapide avec des dégâts réduits.' },
  { id: 'renforcee', name: 'Munitions renforcées', category: 'RENFORCÉE', damage: 1.65, range: 1.05, rate: 1.2, stock: 55, description: 'Équilibre entre portée et puissance.' },
  { id: 'ricochet', name: 'Munitions à impact', category: 'IMPACT+', damage: 1.3, range: 1.2, rate: 1.05, stock: 65, description: 'Conçues pour les tirs soutenus à distance.' },
  { id: 'sonique', name: 'Munitions soniques', category: 'SONIQUE', damage: 1.35, range: 1.1, rate: 1.1, stock: 45, description: 'Munition expérimentale à énergie vibratoire.' },
  { id: 'nanite', name: 'Munitions nanotechnologiques', category: 'NANOTECH', damage: 1.9, range: 1.1, rate: 1.3, stock: 30, description: 'Technologie avancée à haute puissance.' },
  { id: 'quantique', name: 'Munitions quantiques', category: 'QUANTIQUE', damage: 2.3, range: 1.3, rate: 1.45, stock: 20, description: 'Munition rare destinée aux combats difficiles.' },
  { id: 'ultime', name: 'Munitions ultimes', category: 'ULTIME', damage: 3, range: 1.25, rate: 1.7, stock: 12, description: 'Munition de puissance maximale, à utiliser stratégiquement.' }
];

const NINA_EQUIPMENT = [
  { id: 'vest', name: 'Gilet renforcé', category: 'DÉFENSE', kind: 'passive', icon: '🛡️', description: 'Réduit les dégâts reçus de 15 %.', effect: 'defense', value: 0.15 },
  { id: 'visor', name: 'Viseur tactique', category: 'ATTAQUE', kind: 'passive', icon: '🎯', description: 'Augmente la portée de tir de 15 %.', effect: 'range', value: 0.15 },
  { id: 'damage', name: 'Module de puissance', category: 'ATTAQUE', kind: 'passive', icon: '⚡', description: 'Augmente les dégâts infligés de 20 %.', effect: 'damage', value: 0.2 },
  { id: 'trigger', name: 'Déclencheur rapide', category: 'ATTAQUE', kind: 'passive', icon: '🔫', description: 'Améliore la cadence de tir de 12 %.', effect: 'rate', value: 0.12 },
  { id: 'boots', name: 'Bottes tactiques', category: 'MOBILITÉ', kind: 'passive', icon: '👢', description: 'Augmente la vitesse de déplacement de 15 %.', effect: 'speed', value: 0.15 },
  { id: 'medkit', name: 'Kit médical', category: 'SOINS', kind: 'consumable', icon: '❤️', quantity: 5, description: 'Restaure 35 points de santé.', effect: 'heal', value: 35 },
  { id: 'armorpack', name: 'Recharge d’armure', category: 'DÉFENSE', kind: 'consumable', icon: '🛡️', quantity: 5, description: 'Restaure 40 points d’armure.', effect: 'armor', value: 40 },
  { id: 'shield', name: 'Bouclier énergétique', category: 'DÉFENSE', kind: 'consumable', icon: '🔰', quantity: 3, description: 'Absorbe les dégâts pendant 8 secondes.', effect: 'shield', value: 8000 },
  { id: 'grenade', name: 'Grenade tactique', category: 'ATTAQUE', kind: 'consumable', icon: '💥', quantity: 5, description: 'Inflige 120 dégâts à chaque créature vivante.', effect: 'grenade', value: 120 },
  { id: 'pulse', name: 'Impulsion de combat', category: 'ATTAQUE', kind: 'consumable', icon: '🌟', quantity: 3, description: 'Inflige 220 dégâts à chaque créature vivante.', effect: 'pulse', value: 220 }
];

const ninaAmmoInventory = {};

for (const ammoType of NINA_AMMO_TYPES) {
  ninaAmmoInventory[ammoType.id] = ammoType.stock;
}

state.arsenal = {
  selectedAmmo: 'standard',
  ammoInventory: ninaAmmoInventory,
  equipmentInventory: Object.fromEntries(
    NINA_EQUIPMENT.map(item => [
      item.id,
      item.kind === 'consumable' ? item.quantity : 1
    ])
  ),
  equippedEquipment: ['vest'],
  shieldUntil: 0,
  activeTab: 'ammo'
};

function getNinaAmmo() {
  return NINA_AMMO_TYPES.find(
    item => item.id === state.arsenal.selectedAmmo
  ) || NINA_AMMO_TYPES[0];
}

function getNinaEquipmentEffect(effect) {
  let total = 0;

  for (const id of state.arsenal.equippedEquipment) {
    const item = NINA_EQUIPMENT.find(entry => entry.id === id);

    if (item && item.effect === effect) {
      total += item.value;
    }
  }

  return total;
}












/* ==========================================================
   INTERFACE DYNAMIQUE DE L'ARSENAL
========================================================== */

function createNinaArsenalUI() {
  if (document.getElementById('ninaArsenalPanel')) return;

  const style = document.createElement('style');

  style.id = 'ninaArsenalStyles';

  style.textContent = `
    #ninaArsenalOpenBtn {
      position: fixed;
      z-index: 500;
      right: 14px;
      top: 88px;
      border: 1px solid rgba(125,255,190,.65);
      border-radius: 12px;
      padding: 11px 14px;
      color: #eafff2;
      background: linear-gradient(145deg,#126b49,#092e22);
      box-shadow: 0 6px 20px #0008;
      font-weight: 900;
      font-size: 12px;
      touch-action: manipulation;
    }

    #ninaArsenalPanel {
      position: fixed;
      z-index: 1000;
      inset: max(10px,env(safe-area-inset-top))
             max(10px,env(safe-area-inset-right))
             max(10px,env(safe-area-inset-bottom))
             max(10px,env(safe-area-inset-left));
      display: none;
      flex-direction: column;
      color: #effff5;
      background: rgba(5,18,14,.97);
      border: 1px solid #38b77b;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 16px 60px #000c;
      font-family: Arial,sans-serif;
    }

    #ninaArsenalPanel.open { display:flex; }

    .nina-arsenal-head {
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:10px;
      padding:14px;
      background:linear-gradient(120deg,#124f39,#091f18);
      border-bottom:1px solid #28754f;
    }

    .nina-arsenal-head strong { font-size:16px; }

    .nina-arsenal-close {
      border:1px solid #5bc993;
      background:#183d2d;
      color:white;
      border-radius:9px;
      padding:9px 12px;
      font-weight:900;
    }

    .nina-arsenal-tabs {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:8px;
      padding:10px;
    }

    .nina-arsenal-tabs button {
      padding:11px 6px;
      color:#d9f9e6;
      background:#132c22;
      border:1px solid #315d45;
      border-radius:10px;
      font-weight:800;
    }

    .nina-arsenal-tabs button.active {
      background:#1b8054;
      border-color:#6bffb0;
    }

    .nina-arsenal-status {
      padding:0 12px 10px;
      color:#b8e7cc;
      font-size:12px;
    }

    .nina-arsenal-list {
      flex:1;
      min-height:0;
      overflow:auto;
      overscroll-behavior:contain;
      padding:10px;
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:9px;
      align-content:start;
    }

    .nina-arsenal-card {
      min-width:0;
      padding:11px;
      border:1px solid #28553e;
      border-radius:12px;
      background:linear-gradient(145deg,#132b20,#0a1913);
    }

    .nina-arsenal-card.selected {
      border-color:#70ffad;
      box-shadow:inset 0 0 0 1px #70ffad55;
    }

    .nina-arsenal-card h4 {
      margin:0 0 6px;
      font-size:13px;
      line-height:1.35;
      overflow-wrap:anywhere;
    }

    .nina-arsenal-card p {
      color:#b5d6c1;
      font-size:11px;
      line-height:1.45;
      margin:6px 0;
    }

    .nina-arsenal-tag {
      display:inline-block;
      margin:2px 0 5px;
      padding:4px 6px;
      border-radius:6px;
      color:#b7ffd2;
      background:#174832;
      font-size:9px;
      font-weight:900;
    }

    .nina-arsenal-card button {
      width:100%;
      margin-top:7px;
      padding:10px 6px;
      border:1px solid #48c58a;
      border-radius:8px;
      color:white;
      background:#17613f;
      font-weight:800;
      font-size:11px;
      touch-action:manipulation;
    }

    .nina-arsenal-card button:disabled {
      opacity:.45;
    }

    @media(max-width:420px) {
      .nina-arsenal-list { grid-template-columns:1fr; }
      #ninaArsenalOpenBtn { top:78px; right:8px; }
    }
  `;

  document.head.appendChild(style);

  const openButton = document.createElement('button');

  openButton.id = 'ninaArsenalOpenBtn';
  openButton.type = 'button';
  openButton.textContent = '⚔ ARSENAL';
  openButton.setAttribute('aria-label', 'Ouvrir la bibliothèque arsenal');

  const panel = document.createElement('section');

  panel.id = 'ninaArsenalPanel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Bibliothèque arsenal');

  panel.innerHTML = `
    <div class="nina-arsenal-head">
      <strong>⚔ ARSENAL NINA</strong>
      <button type="button" class="nina-arsenal-close"
              data-arsenal-action="close">FERMER ✕</button>
    </div>
    <div class="nina-arsenal-tabs">
      <button type="button" data-arsenal-tab="ammo">🔫 MUNITIONS</button>
      <button type="button" data-arsenal-tab="equipment">🛡 ÉQUIPEMENTS</button>
    </div>
    <div class="nina-arsenal-status" id="ninaArsenalStatus"></div>
    <div class="nina-arsenal-list" id="ninaArsenalList"></div>
  `;

  app.appendChild(openButton);
  app.appendChild(panel);

  openButton.addEventListener('click', () => {
    panel.classList.add('open');
    renderNinaArsenal();
  });

  panel.addEventListener('click', event => {
    const button = event.target.closest('button');

    if (!button) return;

    if (button.dataset.arsenalAction === 'close') {
      panel.classList.remove('open');
      return;
    }

    if (button.dataset.arsenalTab) {
      state.arsenal.activeTab = button.dataset.arsenalTab;
      renderNinaArsenal();
      return;
    }

    if (button.dataset.selectAmmo) {
      selectNinaAmmo(button.dataset.selectAmmo);
      return;
    }

    if (button.dataset.equipItem) {
      toggleNinaEquipment(button.dataset.equipItem);
      return;
    }

    if (button.dataset.useItem) {
      useNinaEquipment(button.dataset.useItem);
    }
  });

  renderNinaArsenal();
}

function renderNinaArsenal() {
  const panel = document.getElementById('ninaArsenalPanel');
  const list = document.getElementById('ninaArsenalList');
  const status = document.getElementById('ninaArsenalStatus');

  if (!panel || !list || !status) return;

  const tab = state.arsenal.activeTab;

  panel.querySelectorAll('[data-arsenal-tab]').forEach(button => {
    button.classList.toggle('active', button.dataset.arsenalTab === tab);
  });

  if (tab === 'ammo') {
    const current = getNinaAmmo();

    status.textContent =
      `Munition équipée : ${current.name} • Chargeur : ${state.ammo} • Réserve : ${state.reserve}`;

    list.innerHTML = NINA_AMMO_TYPES.map(item => {
      const quantity = state.arsenal.ammoInventory[item.id] || 0;
      const selected = item.id === state.arsenal.selectedAmmo;

      return `
        <article class="nina-arsenal-card ${selected ? 'selected' : ''}">
          <h4>🔫 ${item.name}</h4>
          <span class="nina-arsenal-tag">${item.category}</span>
          <p>${item.description}</p>
          <p>
            Puissance : ×${item.damage.toFixed(2)}<br>
            Portée : ×${item.range.toFixed(2)}<br>
            Cadence : ×${item.rate.toFixed(2)}<br>
            Réserve disponible : ${quantity}
          </p>
          <button type="button" data-select-ammo="${item.id}"
                  ${selected ? 'disabled' : ''}>
            ${selected ? '✓ MUNITION ÉQUIPÉE' : 'ÉQUIPER'}
          </button>
        </article>
      `;
    }).join('');

    return;
  }

  status.textContent =
    `Équipements actifs : ${state.arsenal.equippedEquipment.length} • Maximum : 3`;

  list.innerHTML = NINA_EQUIPMENT.map(item => {
    const quantity = state.arsenal.equipmentInventory[item.id] || 0;
    const equipped = state.arsenal.equippedEquipment.includes(item.id);

    let actionButton = '';

    if (item.kind === 'passive') {
      actionButton = `
        <button type="button" data-equip-item="${item.id}"
                ${!equipped && state.arsenal.equippedEquipment.length >= 3 ? 'disabled' : ''}>
          ${equipped ? 'RETIRER' : 'ÉQUIPER'}
        </button>
      `;
    } else {
      actionButton = `
        <button type="button" data-use-item="${item.id}"
                ${quantity <= 0 ? 'disabled' : ''}>
          UTILISER (${quantity})
        </button>
      `;
    }

    return `
      <article class="nina-arsenal-card ${equipped ? 'selected' : ''}">
        <h4>${item.icon} ${item.name}</h4>
        <span class="nina-arsenal-tag">${item.category}</span>
        <p>${item.description}</p>
        <p>${item.kind === 'passive'
          ? (equipped ? 'Statut : équipé' : 'Statut : disponible')
          : `Quantité : ${quantity}`}</p>
        ${actionButton}
      </article>
    `;
  }).join('');
}

function selectNinaAmmo(id) {
  const ammo = NINA_AMMO_TYPES.find(item => item.id === id);

  if (!ammo) return;

  if ((state.arsenal.ammoInventory[id] || 0) <= 0) {
    toast('Cette munition est épuisée.');
    return;
  }

  state.arsenal.selectedAmmo = id;
  state.reserve = state.arsenal.ammoInventory[id] || 0;

  updateHUD();
  renderNinaArsenal();

  toast(`Munition équipée : ${ammo.name}`);
}

function toggleNinaEquipment(id) {
  const item = NINA_EQUIPMENT.find(entry => entry.id === id);

  if (!item || item.kind !== 'passive') return;

  const equipped = state.arsenal.equippedEquipment;
  const index = equipped.indexOf(id);

  if (index >= 0) {
    equipped.splice(index, 1);
    toast(`${item.name} retiré.`);
  } else {
    if (equipped.length >= 3) {
      toast('Maximum de trois équipements passifs.');
      return;
    }

    equipped.push(id);
    toast(`${item.name} équipé.`);
  }

  updateHUD();
  renderNinaArsenal();
}

function useNinaEquipment(id) {
  const item = NINA_EQUIPMENT.find(entry => entry.id === id);

  if (!item || item.kind !== 'consumable') return;

  if ((state.arsenal.equipmentInventory[id] || 0) <= 0) {
    toast('Cet équipement est épuisé.');
    return;
  }

  if (!state.running || state.paused || !state.player) {
    toast('Lancez une mission pour utiliser cet équipement.');
    return;
  }

  switch (item.effect) {
    case 'heal':
      if (state.health >= 100) {
        toast('Votre santé est déjà au maximum.');
        return;
      }

      state.health = Math.min(100, state.health + item.value);
      break;

    case 'armor':
      if (state.armor >= 100) {
        toast('Votre armure est déjà au maximum.');
        return;
      }

      state.armor = Math.min(100, state.armor + item.value);
      break;

    case 'shield':
      state.arsenal.shieldUntil = performance.now() + item.value;
      break;

    case 'grenade':
    case 'pulse': {
      const enemies = state.enemies.filter(enemy => !enemy.dead);

      if (!enemies.length) {
        toast('Aucune créature à attaquer.');
        return;
      }

      for (const enemy of enemies) {
        enemy.health -= item.value;

        if (enemy.health <= 0) {
          killEnemy(enemy);
        }
      }

      break;
    }

    default:
      return;
  }

  state.arsenal.equipmentInventory[id]--;

  updateHUD();
  renderNinaArsenal();

  toast(`${item.name} utilisé.`);
  saveGame(false);
}









  /* ==========================================================
     2. OUTILS DOM ET INTERFACE
  ========================================================== */

  function setText(element, value) {
    if (element) element.textContent = String(value);
  }

  function show(element) {
    if (!element) return;
    element.hidden = false;
    element.removeAttribute('hidden');
  }

  function hide(element) {
    if (!element) return;
    element.hidden = true;
    element.setAttribute('hidden', '');
  }

  function setProgress(value) {
    if (dom.loadingProgress) {
      dom.loadingProgress.style.width =
        `${Math.max(0, Math.min(100, value))}%`;
    }
  }

  function announce(message) {
    setText(dom.ninaAnnouncement, message);
  }

  function toast(message, duration = 2400) {
    if (!dom.gameToast) return;

    setText(dom.gameToast, message);
    dom.gameToast.classList.add('is-visible');

    if (state.toastTimer) clearTimeout(state.toastTimer);

    state.toastTimer = setTimeout(() => {
      dom.gameToast?.classList.remove('is-visible');
    }, duration);

    announce(message);
  }

  function formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(total / 60);
    const remaining = total % 60;

    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function distanceXZ(a, b) {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  function safeVibrate(pattern = 25) {
    if (!state.settings.vibration) return;

    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (_) {
      // Les appareils sans vibration restent compatibles.
    }
  }

  function hideAllOverlays() {
    hide(dom.pauseScreen);
    hide(dom.victoryScreen);
    hide(dom.gameOverScreen);
    hide(dom.settingsScreen);
  }

  function showOnlyScreen(screen) {
    hide(dom.mainMenu);
    hide(dom.missionScreen);
    hide(dom.gameScreen);

    if (screen) show(screen);
  }

  function setEngineStatus(message) {
    setText(dom.engineStatus, message);
  }

  /* ==========================================================
     3. SAUVEGARDE INDEXEDDB
  ========================================================== */

  function openDatabase() {
    return new Promise((resolve) => {
      if (!('indexedDB' in window)) {
        resolve(null);
        return;
      }

      let request;

      try {
        request = indexedDB.open(DB_NAME, DB_VERSION);
      } catch (_) {
        resolve(null);
        return;
      }

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    });
  }

  function readFallbackSave() {
    try {
      const raw = localStorage.getItem('ninaFobasSave');

      if (!raw) return null;

      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function writeFallbackSave(data) {
    try {
      localStorage.setItem('ninaFobasSave', JSON.stringify(data));
    } catch (_) {
      // Le jeu continue même si le stockage est indisponible.
    }
  }

  function readDatabaseSave() {
    return new Promise((resolve) => {
      if (!state.db) {
        resolve(null);
        return;
      }

      try {
        const transaction = state.db.transaction(STORE_NAME, 'readonly');
        const request = transaction.objectStore(STORE_NAME).get('main');

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      } catch (_) {
        resolve(null);
      }
    });
  }

  function writeDatabaseSave(data) {
    return new Promise((resolve) => {
      if (!state.db) {
        resolve(false);
        return;
      }

      try {
        const transaction = state.db.transaction(STORE_NAME, 'readwrite');

        transaction.objectStore(STORE_NAME).put({
          ...data,
          id: 'main',
          updatedAt: Date.now()
        });

        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => resolve(false);
        transaction.onabort = () => resolve(false);
      } catch (_) {
        resolve(false);
      }
    });
  }

  function getSaveData() {
    return {
      version: APP_VERSION,
      unlockedMissions: state.unlockedMissions,
      completedMissions: state.completedMissions,
      totalKills: state.kills,
      totalScore: state.score,
      settings: state.settings
    };
  }

  async function saveGame(showMessage = false) {
    const data = getSaveData();

    state.saveQueue = state.saveQueue
      .then(async () => {
        const saved = await writeDatabaseSave(data);

        if (!saved) {
          writeFallbackSave(data);
        }
      })
      .catch(() => writeFallbackSave(data));

    await state.saveQueue;

    if (showMessage) {
      toast('Progression sauvegardée.');
    }
  }

  async function loadGameSave() {
    let saved = await readDatabaseSave();

    if (!saved) saved = readFallbackSave();
    if (!saved || typeof saved !== 'object') return;

    state.unlockedMissions = clamp(
      Number(saved.unlockedMissions) || 1,
      1,
      missionData.length
    );

    if (Array.isArray(saved.completedMissions)) {
      state.completedMissions = saved.completedMissions
        .filter((n) => Number.isInteger(n) && n >= 0 && n < 10);
    }

    if (saved.settings && typeof saved.settings === 'object') {
      state.settings = {
        ...state.settings,
        ...saved.settings
      };
    }

    updateMissionProgress();
    applySettingsToUI();
  }

  /* ==========================================================
     4. CHARGEMENT DE THREE.JS
  ========================================================== */

  async function loadThree() {
    const candidates = [
      './node_modules/three/build/three.module.js',
      '/node_modules/three/build/three.module.js',
      './three.module.js',
      'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js'
    ];

    let lastError = null;

    for (const url of candidates) {
      try {
        const module = await import(url);

        if (module && module.Scene && module.WebGLRenderer) {
          console.info('[NINA 3D] Three.js chargé :', url);
          return module;
        }
      } catch (error) {
        lastError = error;
        console.warn('[NINA 3D] Chargement impossible :', url, error);
      }
    }

    throw new Error(
      'Three.js est introuvable. Vérifiez le chemin local ou le CDN. ' +
      (lastError?.message || '')
    );
  }

  /* ==========================================================
     5. MATÉRIAUX ET OBJETS 3D
  ========================================================== */

  function createMaterial(color, roughness = 0.85, metalness = 0) {
    return new state.THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness
    });
  }

  function addMesh(parent, geometry, material, x, y, z) {
    const mesh = new state.THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function makeBox(parent, material, position, size) {
    return addMesh(
      parent,
      new state.THREE.BoxGeometry(size[0], size[1], size[2]),
      material,
      position[0],
      position[1],
      position[2]
    );
  }

  function makeSphere(parent, material, position, scale) {
    const mesh = addMesh(
      parent,
      new state.THREE.SphereGeometry(1, 16, 12),
      material,
      position[0],
      position[1],
      position[2]
    );

    mesh.scale.set(scale[0], scale[1], scale[2]);
    return mesh;
  }

  function makeCylinder(
    parent,
    material,
    position,
    radiusTop,
    radiusBottom,
    height,
    segments = 12
  ) {
    return addMesh(
      parent,
      new state.THREE.CylinderGeometry(
        radiusTop,
        radiusBottom,
        height,
        segments
      ),
      material,
      position[0],
      position[1],
      position[2]
    );
  }

  function createTree(x, z, scale = 1) {
    const THREE = state.THREE;
    const group = new THREE.Group();

    const bark = createMaterial(0x4b3525);
    const leaves = createMaterial(
      [0x234b2b, 0x2b5a30, 0x315f34, 0x385d32][
        Math.floor(Math.random() * 4)
      ]
    );

    const trunk = makeCylinder(
      group,
      bark,
      [0, 1.35 * scale, 0],
      0.22 * scale,
      0.35 * scale,
      2.7 * scale,
      7
    );

    trunk.rotation.z = random(-0.12, 0.12);

    const crown1 = makeSphere(
      group,
      leaves,
      [0, 3.0 * scale, 0],
      [1.0 * scale, 1.2 * scale, 0.95 * scale]
    );

    const crown2 = makeSphere(
      group,
      leaves,
      [-0.42 * scale, 3.25 * scale, 0.1 * scale],
      [0.72 * scale, 0.85 * scale, 0.75 * scale]
    );

    const crown3 = makeSphere(
      group,
      leaves,
      [0.45 * scale, 3.35 * scale, -0.1 * scale],
      [0.75 * scale, 0.9 * scale, 0.72 * scale]
    );

    group.position.set(x, 0, z);
    group.userData.swayParts = [crown1, crown2, crown3];

    state.scene.add(group);
    state.decorations.push({
      type: 'tree',
      object: group,
      phase: random(0, 6.28)
    });
  }

  function createRock(x, z, scale = 1) {
    const THREE = state.THREE;

    const rock = addMesh(
      state.scene,
      new THREE.DodecahedronGeometry(scale, 0),
      createMaterial(0x595b50),
      x,
      scale * 0.55,
      z
    );

    rock.rotation.set(
      random(0, 2),
      random(0, 6),
      random(0, 1)
    );

    rock.scale.set(
      random(0.7, 1.35),
      random(0.6, 1.0),
      random(0.7, 1.4)
    );

    state.decorations.push({
      type: 'rock',
      object: rock
    });
  }

  function createBush(x, z, scale = 1) {
    const group = new state.THREE.Group();

    const material = createMaterial(0x2e6033);

    for (let i = 0; i < 4; i++) {
      makeSphere(
        group,
        material,
        [
          random(-0.35, 0.35) * scale,
          random(0.25, 0.65) * scale,
          random(-0.35, 0.35) * scale
        ],
        [
          random(0.35, 0.55) * scale,
          random(0.25, 0.5) * scale,
          random(0.35, 0.55) * scale
        ]
      );
    }

    group.position.set(x, 0, z);
    state.scene.add(group);

    state.decorations.push({
      type: 'bush',
      object: group
    });
  }

  function clearWorld() {
    for (const enemy of state.enemies) {
      if (enemy.group) state.scene?.remove(enemy.group);
    }

    for (const decoration of state.decorations) {
      if (decoration.object) state.scene?.remove(decoration.object);
    }

    for (const effect of state.effects) {
      if (effect.object) state.scene?.remove(effect.object);
    }

    state.enemies = [];
    state.decorations = [];
    state.effects = [];
    state.player = null;
    state.playerParts = {};
  }

  /* ==========================================================
     6. CRÉATION DE NINA
  ========================================================== */

  function createPlayer() {
    const THREE = state.THREE;
    const group = new THREE.Group();

    const uniform = createMaterial(0x354a35);
    const uniformDark = createMaterial(0x202b24);
    const skin = createMaterial(0xc28d69);
    const boots = createMaterial(0x282722);
    const armor = createMaterial(0x56634a, 0.65);
    const metal = createMaterial(0x353a3c, 0.35, 0.65);
    const hair = createMaterial(0x28201b);
    const visor = new THREE.MeshStandardMaterial({
      color: 0x263e43,
      roughness: 0.2,
      metalness: 0.65
    });

    // Jambes articulées
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.18, 0.95, 0);
    group.add(leftLeg);

    makeBox(leftLeg, uniformDark, [0, -0.2, 0], [0.24, 0.62, 0.28]);
    makeBox(leftLeg, boots, [0, -0.55, 0.06], [0.29, 0.16, 0.4]);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.18, 0.95, 0);
    group.add(rightLeg);

    makeBox(rightLeg, uniformDark, [0, -0.2, 0], [0.24, 0.62, 0.28]);
    makeBox(rightLeg, boots, [0, -0.55, 0.06], [0.29, 0.16, 0.4]);

    // Buste
    makeBox(group, uniform, [0, 1.45, 0], [0.68, 0.78, 0.36]);
    makeBox(group, armor, [0, 1.52, -0.2], [0.53, 0.53, 0.12]);

    // Pochettes tactiques
    makeBox(group, uniformDark, [-0.2, 1.35, -0.275], [0.16, 0.17, 0.06]);
    makeBox(group, uniformDark, [0.2, 1.35, -0.275], [0.16, 0.17, 0.06]);

    // Cou et tête
    makeCylinder(
      group,
      skin,
      [0, 1.92, 0],
      0.1,
      0.12,
      0.16,
      10
    );

    makeSphere(
      group,
      skin,
      [0, 2.13, 0],
      [0.23, 0.29, 0.22]
    );

    makeSphere(
      group,
      hair,
      [0, 2.29, 0.035],
      [0.235, 0.18, 0.235]
    );

    // Casque
    makeSphere(
      group,
      uniformDark,
      [0, 2.33, -0.005],
      [0.255, 0.15, 0.245]
    );

    makeBox(
      group,
      visor,
      [0, 2.17, -0.205],
      [0.29, 0.09, 0.035]
    );

    // Bras articulés
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.43, 1.72, 0);
    group.add(leftArm);

    makeBox(leftArm, uniform, [0, -0.24, 0], [0.21, 0.52, 0.25]);
    makeSphere(leftArm, skin, [0, -0.52, -0.015], [0.12, 0.13, 0.13]);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.43, 1.72, 0);
    group.add(rightArm);

    makeBox(rightArm, uniform, [0, -0.24, 0], [0.21, 0.52, 0.25]);
    makeSphere(rightArm, skin, [0, -0.52, -0.015], [0.12, 0.13, 0.13]);

    // Arme 3D
    const weapon = new THREE.Group();

    makeBox(weapon, metal, [0, 0, 0], [0.14, 0.15, 0.85]);
    makeBox(weapon, uniformDark, [0, -0.12, 0.13], [0.1, 0.2, 0.2]);
    makeBox(weapon, metal, [0, 0.035, -0.52], [0.075, 0.075, 0.4]);
    makeBox(weapon, uniformDark, [0, 0.11, 0.1], [0.1, 0.06, 0.23]);

    weapon.position.set(0.43, 1.52, -0.45);
    group.add(weapon);

    group.position.set(0, 0, 0);

    state.scene.add(group);
    state.player = group;

    state.playerParts = {
      leftLeg,
      rightLeg,
      leftArm,
      rightArm,
      weapon
    };

    return group;
  }

  /* ==========================================================
     7. CRÉATURES 3D
  ========================================================== */

  function createEnemy(index, boss = false) {
    const THREE = state.THREE;
    const group = new THREE.Group();

    const baseColors = [
      0x61513c,
      0x4b5540,
      0x62514b,
      0x444d49,
      0x73523f
    ];

    const hideMaterial = createMaterial(
      boss ? 0x632e34 : baseColors[index % baseColors.length]
    );

    const darkMaterial = createMaterial(0x292c28);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4228,
      emissive: 0xff1700,
      emissiveIntensity: 1.4
    });

    const scale = boss ? 1.85 : random(0.8, 1.15);

    // Corps basculé vers l'avant
    const body = makeSphere(
      group,
      hideMaterial,
      [0, 0.9 * scale, 0],
      [0.65 * scale, 0.48 * scale, 0.9 * scale]
    );

    body.rotation.x = -0.1;

    // Épaules et cou
    makeSphere(
      group,
      hideMaterial,
      [0, 1.13 * scale, -0.45 * scale],
      [0.48 * scale, 0.45 * scale, 0.48 * scale]
    );

    // Tête
    makeSphere(
      group,
      hideMaterial,
      [0, 1.18 * scale, -0.86 * scale],
      [0.36 * scale, 0.32 * scale, 0.4 * scale]
    );

    // Yeux lumineux
    makeSphere(
      group,
      eyeMaterial,
      [-0.16 * scale, 1.28 * scale, -1.15 * scale],
      [0.055 * scale, 0.055 * scale, 0.045 * scale]
    );

    makeSphere(
      group,
      eyeMaterial,
      [0.16 * scale, 1.28 * scale, -1.15 * scale],
      [0.055 * scale, 0.055 * scale, 0.045 * scale]
    );

    // Mâchoire
    makeSphere(
      group,
      darkMaterial,
      [0, 0.98 * scale, -1.15 * scale],
      [0.22 * scale, 0.12 * scale, 0.2 * scale]
    );

    // Crocs
    for (const side of [-1, 1]) {
      const fang = makeCylinder(
        group,
        createMaterial(0xe0d9bf),
        [side * 0.12 * scale, 0.9 * scale, -1.26 * scale],
        0.015 * scale,
        0.045 * scale,
        0.16 * scale,
        6
      );

      fang.rotation.x = Math.PI;
    }

    // Quatre pattes
    const legs = [];

    for (const x of [-0.42, 0.42]) {
      for (const z of [-0.52, 0.48]) {
        const leg = new THREE.Group();
        leg.position.set(x * scale, 0.65 * scale, z * scale);
        group.add(leg);

        makeBox(
          leg,
          hideMaterial,
          [0, -0.23 * scale, 0],
          [0.22 * scale, 0.55 * scale, 0.23 * scale]
        );

        makeSphere(
          leg,
          darkMaterial,
          [0, -0.48 * scale, -0.04 * scale],
          [0.17 * scale, 0.1 * scale, 0.21 * scale]
        );

        legs.push(leg);
      }
    }

    // Queue
    const tail = makeSphere(
      group,
      hideMaterial,
      [0, 0.82 * scale, 0.82 * scale],
      [0.14 * scale, 0.14 * scale, 0.58 * scale]
    );

    tail.rotation.x = 0.25;

    const angle = random(0, Math.PI * 2);
    const radius = random(10, 27);

    group.position.set(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );

    group.scale.setScalar(1);
    state.scene.add(group);

    const enemy = {
      group,
      legs,
      tail,
      body,
      health: boss ? 520 : Math.round(75 * missionData[state.missionIndex].difficulty),
      maxHealth: boss ? 520 : Math.round(75 * missionData[state.missionIndex].difficulty),
      speed: boss ? 1.55 : random(1.7, 2.5) * missionData[state.missionIndex].difficulty,
      damage: boss ? 22 : 7 + state.missionIndex * 1.1,
      attackRange: boss ? 2.6 : 1.7,
      attackCooldown: random(0.5, 1.5),
      attackTimer: random(0.5, 1.5),
      walkPhase: random(0, 6.28),
      boss,
      dead: false,
      hitFlash: 0
    };

    group.userData.enemy = enemy;
    state.enemies.push(enemy);

    return enemy;
  }

  function createMissionEnemies() {
    const mission = missionData[state.missionIndex];

    const count = mission.creatures;

    for (let i = 0; i < count; i++) {
      createEnemy(i, false);
    }

    if (mission.boss) {
      createEnemy(count + 1, true);
    }
  }

  /* ==========================================================
     8. TERRAIN ET ENVIRONNEMENT
  ========================================================== */

  function createGround() {
    const THREE = state.THREE;
    const mission = missionData[state.missionIndex];

    const groundMaterial = new THREE.MeshStandardMaterial({
      color: mission.color,
      roughness: 1,
      metalness: 0
    });

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(180, 180, 24, 24),
      groundMaterial
    );

    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.04;
    ground.receiveShadow = true;

    state.scene.add(ground);

    // Sol irrégulier : petites zones de terre et herbe
    const patchMaterial = createMaterial(
      state.missionIndex === 2 ? 0x5a3b31 : 0x314b2d
    );

    for (let i = 0; i < 50; i++) {
      const patch = new THREE.Mesh(
        new THREE.CircleGeometry(random(0.5, 2.3), 8),
        patchMaterial
      );

      patch.rotation.x = -Math.PI / 2;
      patch.position.set(random(-65, 65), 0.005, random(-65, 65));
      patch.receiveShadow = true;

      state.scene.add(patch);

      state.decorations.push({
        type: 'ground',
        object: patch
      });
    }

    // Petite piste traversant la zone
    const pathMaterial = createMaterial(0x756449);

    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 90),
      pathMaterial
    );

    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.012, -5);

    state.scene.add(path);

    state.decorations.push({
      type: 'ground',
      object: path
    });

    // Végétation distribuée en laissant une zone centrale
    for (let i = 0; i < 100; i++) {
      const x = random(-70, 70);
      const z = random(-70, 70);

      if (Math.abs(x) < 5 && Math.abs(z) < 8) continue;

      if (i < 58) {
        createTree(x, z, random(0.7, 1.45));
      } else {
        createBush(x, z, random(0.7, 1.4));
      }
    }

    for (let i = 0; i < 28; i++) {
      createRock(random(-65, 65), random(-65, 65), random(0.4, 1.5));
    }

    // Soleil / lune
    const sun = new THREE.DirectionalLight(
      state.missionIndex === 4 ? 0x7f9ac9 : 0xffe6b5,
      state.settings.quality === 'low' ? 1.8 : 2.5
    );

    sun.position.set(-20, 35, -15);
    sun.castShadow = state.settings.quality !== 'low';

    if (sun.castShadow) {
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -45;
      sun.shadow.camera.right = 45;
      sun.shadow.camera.top = 45;
      sun.shadow.camera.bottom = -45;
    }

    state.scene.add(sun);

    const hemisphere = new THREE.HemisphereLight(
      state.missionIndex === 4 ? 0x40506e : 0xa6c5b5,
      0x3a3024,
      1.6
    );

    state.scene.add(hemisphere);

    if (state.missionIndex === 2) {
      const lavaMaterial = new THREE.MeshStandardMaterial({
        color: 0xf04c17,
        emissive: 0xd92a00,
        emissiveIntensity: 0.7
      });

      for (let i = 0; i < 7; i++) {
        const lava = new THREE.Mesh(
          new THREE.CircleGeometry(random(0.5, 1.4), 12),
          lavaMaterial
        );

        lava.rotation.x = -Math.PI / 2;
        lava.position.set(random(-30, 30), 0.02, random(-35, 35));

        state.scene.add(lava);

        state.decorations.push({
          type: 'lava',
          object: lava,
          phase: random(0, 6.28)
        });
      }
    }

    if (state.missionIndex === 6) {
      createOutpost();
    }

    // Ciel
    state.scene.background = new THREE.Color(
      state.missionIndex === 4 ? 0x101a2d : 0x8faeaf
    );

    state.scene.fog = new THREE.Fog(
      state.missionIndex === 4 ? 0x182234 : 0x9aa99a,
      35,
      115
    );
  }

  function createOutpost() {
    const THREE = state.THREE;

    const wallMaterial = createMaterial(0x60594b);
    const roofMaterial = createMaterial(0x343a32);
    const metalMaterial = createMaterial(0x4b514b, 0.55, 0.45);

    // Bâtiment principal
    makeBox(
      state.scene,
      wallMaterial,
      [10, 2, -13],
      [10, 4, 8]
    );

    makeBox(
      state.scene,
      roofMaterial,
      [10, 4.2, -13],
      [10.8, 0.5, 8.8]
    );

    // Ouverture d'entrée simulée
    makeBox(
      state.scene,
      metalMaterial,
      [10, 1.2, -8.92],
      [1.6, 2.4, 0.15]
    );

    // Barrières
    for (let i = 0; i < 6; i++) {
      makeBox(
        state.scene,
        metalMaterial,
        [random(4, 17), 0.6, -6 - i * 2.4],
        [random(1.3, 2.4), 1.2, 0.18]
      );
    }
  }

  /* ==========================================================
     9. INITIALISATION DU RENDERER
  ========================================================== */

  function initRenderer() {
    const THREE = state.THREE;

    state.renderer = new THREE.WebGLRenderer({
      canvas: dom.canvas,
      antialias: state.settings.quality !== 'low',
      alpha: false,
      powerPreference: 'high-performance'
    });

    state.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, pixelRatioLimit())
    );

    state.renderer.setSize(
      dom.gameWorld.clientWidth || window.innerWidth,
      dom.gameWorld.clientHeight || window.innerHeight,
      false
    );

    if ('outputColorSpace' in state.renderer) {
      state.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    state.renderer.toneMappingExposure = 1.15;

    if ('shadowMap' in state.renderer) {
      state.renderer.shadowMap.enabled = state.settings.quality !== 'low';
      state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    state.scene = new THREE.Scene();

    state.camera = new THREE.PerspectiveCamera(
      66,
      1,
      0.1,
      220
    );

    state.camera.position.set(0, 4, 8);

    state.clock = new THREE.Clock();
    state.raycaster = new THREE.Raycaster();
    state.screenCenter = new THREE.Vector2(0, 0);

    resizeRenderer();
  }

  function pixelRatioLimit() {
    if (state.settings.quality === 'low') return 1;
    if (state.settings.quality === 'high') return 1.75;
    return 1.35;
  }

  function resizeRenderer() {
    if (!state.renderer || !state.camera || !dom.gameWorld) return;

    const width = Math.max(1, dom.gameWorld.clientWidth || window.innerWidth);
    const height = Math.max(1, dom.gameWorld.clientHeight || window.innerHeight);

    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();

    state.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, pixelRatioLimit())
    );

    state.renderer.setSize(width, height, false);
  }

  /* ==========================================================
     10. CAMÉRA TROISIÈME PERSONNE
  ========================================================== */

  function updateCamera(delta) {
    if (!state.player || !state.camera) return;

    const THREE = state.THREE;
    const playerPos = state.player.position;

    const forward = new THREE.Vector3(
      Math.sin(state.yaw),
      0,
      -Math.cos(state.yaw)
    );

    const right = new THREE.Vector3(
      Math.cos(state.yaw),
      0,
      Math.sin(state.yaw)
    );

    const shoulderOffset = state.aiming ? 0.75 : 0.35;

    const target = new THREE.Vector3(
      playerPos.x + right.x * shoulderOffset,
      playerPos.y + 1.65 + state.pitch * 0.6,
      playerPos.z + right.z * shoulderOffset
    );

    const distance = state.aiming
      ? Math.min(state.cameraDistance, 4.6)
      : state.cameraDistance;

    const desired = new THREE.Vector3(
      playerPos.x - forward.x * distance,
      playerPos.y + 3.0 + distance * 0.17,
      playerPos.z - forward.z * distance
    );

    desired.y += state.pitch * 2.0;

    const smooth = 1 - Math.exp(-7 * Math.max(delta, 0.001));

    state.camera.position.lerp(desired, smooth);
    state.camera.lookAt(target);

    // L'arme pointe dans la direction de la caméra.
    if (state.playerParts.weapon) {
      state.playerParts.weapon.rotation.y = 0;
      state.playerParts.weapon.rotation.x = state.aiming ? -0.06 : 0;
    }
  }

  /* ==========================================================
     11. DÉMARRAGE ET RÉINITIALISATION D'UNE MISSION
  ========================================================== */

  async function startMission(index = state.missionIndex) {
    index = clamp(index, 0, missionData.length - 1);

    if (index >= state.unlockedMissions) {
      toast('Cette mission est verrouillée.');
      return;
    }

    state.missionIndex = index;
    state.health = 100;
    state.armor = 100;
    state.kills = 0;
    state.elapsed = 0;
    state.ammo = weapons[state.weaponIndex].magazine;
    state.reserve = weapons[state.weaponIndex].reserve;
    state.reloadInProgress = false;

    state.playerVelocityY = 0;
    state.grounded = true;

    state.moveX = 0;
    state.moveY = 0;
    state.moving = false;
    state.sprinting = false;
    state.aiming = false;
    state.firing = false;

    state.yaw = 0;
    state.pitch = -0.15;

    hideAllOverlays();
    showOnlyScreen(dom.gameScreen);
    show(dom.worldLoading);

    setText(dom.worldLoadingMessage, 'Construction du terrain...');
    updateMissionHUD();

    try {
      clearWorld();

      state.scene.clear();

      createGround();
      createPlayer();
      createMissionEnemies();

      state.player.position.set(0, 0, 0);

      state.cameraDistance = 7.5;

      state.score = Math.max(0, state.score);
      state.missionStartTime = performance.now();
      state.elapsed = 0;
      state.running = true;
      state.paused = false;
      state.gameStarted = true;

      updateCamera(1 / 60);
      updateHUD();
      updateBossHUD();
      resizeRenderer();

      hide(dom.worldLoading);

      toast(`MISSION ${String(index + 1).padStart(2, '0')} — ${missionData[index].name}`, 3200);

      saveGame(false);

      if (!state.animationFrame) {
        state.clock.start();
        state.lastFrame = performance.now();
        state.animationFrame = requestAnimationFrame(gameLoop);
      }
    } catch (error) {
      console.error('[NINA 3D] Erreur de mission :', error);

      show(dom.worldLoading);
      setText(
        dom.worldLoadingMessage,
        'Erreur de création du monde. Consultez la console.'
      );

      toast('Impossible de créer la mission.');
    }
  }

  function updateMissionHUD() {
    const mission = missionData[state.missionIndex];

    setText(
      dom.currentMissionLabel,
      `MISSION ${String(state.missionIndex + 1).padStart(2, '0')}`
    );

    setText(dom.currentMissionName, mission.name);
    setText(dom.missionObjective, mission.objective);

    setText(
      dom.objectiveProgress,
      `${state.kills} / ${mission.creatures} CRÉATURES`
    );
  }

  function updateHUD() {
    setText(dom.healthText, Math.ceil(state.health));
    setText(dom.armorText, Math.ceil(state.armor));

    if (dom.healthBar) {
      dom.healthBar.style.width = `${clamp(state.health, 0, 100)}%`;
    }

    if (dom.armorBar) {
      dom.armorBar.style.width = `${clamp(state.armor, 0, 100)}%`;
    }

    setText(dom.ammoCurrent, state.ammo);
    setText(dom.ammoReserve, state.reserve);

    const weapon = weapons[state.weaponIndex];

    setText(dom.weaponName, weapon.name);
    setText(dom.weaponMode, weapon.mode);

    if (dom.aimReticle) {
      dom.aimReticle.classList.toggle('is-aiming', state.aiming);
    }

    if (dom.minimap) {
      dom.minimap.style.display = state.settings.minimap ? '' : 'none';
    }

    updateMissionHUD();
    updateBossHUD();
    drawMinimap();
  }

  function updateBossHUD() {
    const boss = state.enemies.find((enemy) => enemy.boss && !enemy.dead);

    if (!boss) {
      hide(dom.bossHealthPanel);
      return;
    }

    show(dom.bossHealthPanel);
    setText(dom.bossName, missionData[state.missionIndex].boss
      ? 'MENACE MAJEURE'
      : 'PRÉDATEUR ALPHA');

    if (dom.bossHealthBar) {
      dom.bossHealthBar.style.width =
        `${clamp((boss.health / boss.maxHealth) * 100, 0, 100)}%`;
    }
  }

  /* ==========================================================
     12. IA DES CRÉATURES
  ========================================================== */

  function updateEnemies(delta) {
    if (!state.player) return;

    const playerPos = state.player.position;

    for (const enemy of state.enemies) {
      if (enemy.dead) continue;

      enemy.walkPhase += delta * 7;

      const enemyPos = enemy.group.position;
      const dx = playerPos.x - enemyPos.x;
      const dz = playerPos.z - enemyPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      enemy.attackTimer -= delta;

      if (distance > enemy.attackRange + 0.3) {
        const directionX = dx / Math.max(distance, 0.001);
        const directionZ = dz / Math.max(distance, 0.001);

        enemyPos.x += directionX * enemy.speed * delta;
        enemyPos.z += directionZ * enemy.speed * delta;

        enemy.group.rotation.y = Math.atan2(-directionX, -directionZ);

        const legSwing = Math.sin(enemy.walkPhase) * 0.48;

        enemy.legs.forEach((leg, index) => {
          leg.rotation.x = legSwing * (index % 2 === 0 ? 1 : -1);
        });

        enemy.tail.rotation.x = Math.sin(enemy.walkPhase * 0.45) * 0.18;
      } else if (enemy.attackTimer <= 0) {
        enemy.attackTimer = enemy.attackCooldown;

        damagePlayer(enemy.damage);

        enemy.group.position.x += (Math.random() - 0.5) * 0.6;
        enemy.group.position.z += (Math.random() - 0.5) * 0.6;
      }

      if (enemy.hitFlash > 0) {
        enemy.hitFlash -= delta;
        enemy.body.scale.setScalar(
          enemy.hitFlash > 0 ? 1.12 : 1
        );
      }
    }
  }

  /* ==========================================================
     13. COMBAT : TIR ET DÉGÂTS
  ========================================================== */

  function getEnemyHitByRay() {
    if (!state.camera) return null;

    const THREE = state.THREE;

    state.raycaster.setFromCamera(state.screenCenter, state.camera);
    state.raycaster.far = weapons[state.weaponIndex].range;

    const meshes = [];

    for (const enemy of state.enemies) {
      if (enemy.dead) continue;

      enemy.group.traverse((object) => {
        if (object.isMesh) {
          object.userData.enemyOwner = enemy;
          meshes.push(object);
        }
      });
    }

    const intersections = state.raycaster.intersectObjects(meshes, false);

    for (const hit of intersections) {
      const enemy = hit.object.userData.enemyOwner;

      if (enemy && !enemy.dead) {
        return {
          enemy,
          point: hit.point
        };
      }
    }

    return null;
  }

  function createShotEffect(origin, destination, hit = false) {
    const THREE = state.THREE;

    const material = new THREE.LineBasicMaterial({
      color: hit ? 0xff9d50 : 0xffe4a1,
      transparent: true,
      opacity: 0.9
    });

    const geometry = new THREE.BufferGeometry().setFromPoints([
      origin.clone(),
      destination.clone()
    ]);

    const line = new THREE.Line(geometry, material);
    state.scene.add(line);

    state.effects.push({
      object: line,
      life: 0.07,
      maxLife: 0.07,
      kind: 'line'
    });

    // Flash à l'extrémité du canon
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd66b
    });

    const flash = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 8, 6),
      flashMaterial
    );

    flash.position.copy(origin);
    state.scene.add(flash);

    state.effects.push({
      object: flash,
      life: 0.055,
      maxLife: 0.055,
      kind: 'flash'
    });
  }

  function createHitEffect(point, boss = false) {
    const THREE = state.THREE;

    const effect = new THREE.Mesh(
      new THREE.SphereGeometry(boss ? 0.24 : 0.12, 10, 8),
      new THREE.MeshBasicMaterial({
        color: boss ? 0xff3b22 : 0xffc36d,
        transparent: true,
        opacity: 0.95
      })
    );

    effect.position.copy(point);
    state.scene.add(effect);

    state.effects.push({
      object: effect,
      life: 0.22,
      maxLife: 0.22,
      kind: 'impact'
    });
  }

  function playTone(frequency = 180, duration = 0.06, type = 'square') {
    if (!state.settings.sound) return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      if (!state.audioContext) {
        state.audioContext = new AudioContextClass();
      }

      if (state.audioContext.state === 'suspended') {
        state.audioContext.resume().catch(() => {});
      }

      const ctx = state.audioContext;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.055, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    } catch (_) {
      // Le son est facultatif.
    }
  }

  function shoot() {
    if (!state.running || state.paused || !state.player) return;
    if (state.reloadInProgress) return;

    const weapon = weapons[state.weaponIndex];
    const now = performance.now();

    if (now - state.lastShot < weapon.rate) return;

    state.lastShot = now;

    if (state.ammo <= 0) {
      toast('Chargeur vide — rechargez votre arme.');
      playTone(100, 0.08);
      return;
    }

    state.ammo -= 1;

    const THREE = state.THREE;
    const hit = getEnemyHitByRay();

    const origin = state.player.position.clone();
    origin.y += 1.55;

    const direction = new THREE.Vector3();
    state.camera.getWorldDirection(direction);

    const destination = hit
      ? hit.point.clone()
      : origin.clone().add(direction.multiplyScalar(weapon.range));

    createShotEffect(origin, destination, Boolean(hit));
    playTone(145 + Math.random() * 50, 0.045, 'square');
    safeVibrate(12);

    if (hit) {
      const enemy = hit.enemy;
      const damage = weapon.damage * (enemy.boss ? 1 : 1);

      enemy.health -= damage;
      enemy.hitFlash = 0.1;

      createHitEffect(hit.point, enemy.boss);

      if (enemy.health <= 0) {
        killEnemy(enemy);
      }
    }

    updateHUD();
  }

  function killEnemy(enemy) {
    if (!enemy || enemy.dead) return;

    enemy.dead = true;
    enemy.health = 0;

    state.kills += 1;

    const points = enemy.boss ? 1000 : 150;
    state.score += points;

    toast(enemy.boss
      ? `MENACE MAJEURE ÉLIMINÉE +${points}`
      : `CRÉATURE ÉLIMINÉE +${points}`, 1300);

    playTone(enemy.boss ? 75 : 110, 0.16, 'sawtooth');
    safeVibrate(enemy.boss ? [50, 40, 80] : 25);

    const mission = missionData[state.missionIndex];
    const alive = state.enemies.filter((item) => !item.dead);

    if (state.kills >= mission.creatures && alive.length === 0) {
      setTimeout(() => completeMission(), 500);
    }

    updateHUD();
  }

  function damagePlayer(amount) {
    if (!state.running || state.paused) return;

    let remaining = amount;

    if (state.armor > 0) {
      const absorbed = Math.min(state.armor, remaining * 0.75);
      state.armor -= absorbed;
      remaining -= absorbed;
    }

    state.health = Math.max(0, state.health - remaining);

    if (dom.damageIndicator) {
      dom.damageIndicator.classList.remove('damage-active');

      // Force le navigateur à rejouer l'animation.
      void dom.damageIndicator.offsetWidth;

      dom.damageIndicator.classList.add('damage-active');
    }

    playTone(75, 0.1, 'sawtooth');
    safeVibrate([45, 30, 45]);

    updateHUD();

    if (state.health <= 0) {
      failMission();
    }
  }

  /* ==========================================================
     14. RECHARGEMENT ET CHANGEMENT D'ARME
  ========================================================== */

  function reloadWeapon() {
    if (!state.running || state.paused || state.reloadInProgress) return;

    const weapon = weapons[state.weaponIndex];

    if (state.ammo >= weapon.magazine) {
      toast('Le chargeur est déjà plein.');
      return;
    }

    if (state.reserve <= 0) {
      toast('Aucune munition de réserve.');
      return;
    }

    state.reloadInProgress = true;
    state.firing = false;

    toast('Rechargement en cours...');
    playTone(260, 0.08, 'triangle');

    if (dom.reloadBtn) {
      dom.reloadBtn.classList.add('is-active');
    }

    setTimeout(() => {
      if (!state.gameStarted || !state.running) {
        state.reloadInProgress = false;
        dom.reloadBtn?.classList.remove('is-active');
        return;
      }

      const needed = weapon.magazine - state.ammo;
      const loaded = Math.min(needed, state.reserve);

      state.ammo += loaded;
      state.reserve -= loaded;
      state.reloadInProgress = false;

      dom.reloadBtn?.classList.remove('is-active');

      updateHUD();
      toast('Arme rechargée.');
    }, weapon.reload);
  }

  function switchWeapon() {
    if (!state.running || state.paused) return;

    state.weaponIndex = (state.weaponIndex + 1) % weapons.length;

    const weapon = weapons[state.weaponIndex];

    state.ammo = Math.min(state.ammo, weapon.magazine);
    state.reserve = Math.max(state.reserve, weapon.reserve);

    state.reloadInProgress = false;

    updateHUD();
    toast(`Arme équipée : ${weapon.name}`);
    playTone(320, 0.06, 'triangle');
  }

  /* ==========================================================
     15. DÉPLACEMENT, COURSE ET SAUT
  ========================================================== */

  function jump() {
    if (!state.running || state.paused || !state.player) return;

    if (state.grounded) {
      state.playerVelocityY = 6.4;
      state.grounded = false;
      playTone(200, 0.04, 'triangle');
    }
  }

  function toggleSprint(force) {
    state.sprinting = typeof force === 'boolean'
      ? force
      : !state.sprinting;

    dom.runBtn?.classList.toggle('is-active', state.sprinting);
  }

  function toggleAim(force) {
    state.aiming = typeof force === 'boolean'
      ? force
      : !state.aiming;

    dom.aimBtn?.classList.toggle('is-active', state.aiming);

    if (state.aiming) {
      state.cameraDistance = Math.min(state.cameraDistance, 4.6);
    }

    if (dom.aimReticle) {
      dom.aimReticle.classList.toggle('is-aiming', state.aiming);
    }
  }

  function updatePlayer(delta) {
    if (!state.player) return;

    const THREE = state.THREE;

    let horizontal = state.moveX;
    let vertical = state.moveY;

    if (state.keys.has('KeyW') || state.keys.has('ArrowUp')) vertical -= 1;
    if (state.keys.has('KeyS') || state.keys.has('ArrowDown')) vertical += 1;
    if (state.keys.has('KeyA') || state.keys.has('ArrowLeft')) horizontal -= 1;
    if (state.keys.has('KeyD') || state.keys.has('ArrowRight')) horizontal += 1;

    const length = Math.hypot(horizontal, vertical);

    if (length > 1) {
      horizontal /= length;
      vertical /= length;
    }

    const moving = length > 0.06;
    state.moving = moving;

    const forward = new THREE.Vector3(
      Math.sin(state.yaw),
      0,
      -Math.cos(state.yaw)
    );

    const right = new THREE.Vector3(
      Math.cos(state.yaw),
      0,
      Math.sin(state.yaw)
    );

    const direction = new THREE.Vector3();

    direction.addScaledVector(right, horizontal);
    direction.addScaledVector(forward, -vertical);

    if (direction.lengthSq() > 0) {
      direction.normalize();

      const baseSpeed = state.sprinting ? 8.2 : 4.7;

      state.player.position.addScaledVector(
        direction,
        baseSpeed * delta
      );

      // NINA tourne vers la direction de déplacement.
      if (!state.aiming) {
        const targetYaw = Math.atan2(-direction.x, -direction.z);

        let difference = targetYaw - state.player.rotation.y;

        while (difference > Math.PI) difference -= Math.PI * 2;
        while (difference < -Math.PI) difference += Math.PI * 2;

        state.player.rotation.y += difference * Math.min(1, delta * 9);
      }
    }

    // Limites de la zone jouable
    state.player.position.x = clamp(state.player.position.x, -78, 78);
    state.player.position.z = clamp(state.player.position.z, -78, 78);

    // Gravité et saut
    if (!state.grounded) {
      state.playerVelocityY -= 15 * delta;
      state.player.position.y += state.playerVelocityY * delta;

      if (state.player.position.y <= 0) {
        state.player.position.y = 0;
        state.playerVelocityY = 0;
        state.grounded = true;
      }
    }

    // Animation de marche
    if (moving) {
      const swingSpeed = state.sprinting ? 13 : 8;
      const swing = Math.sin(performance.now() * 0.001 * swingSpeed) * 0.48;

      if (state.playerParts.leftLeg) {
        state.playerParts.leftLeg.rotation.x = swing;
      }

      if (state.playerParts.rightLeg) {
        state.playerParts.rightLeg.rotation.x = -swing;
      }

      if (state.playerParts.leftArm) {
        state.playerParts.leftArm.rotation.x = -swing * 0.45;
      }

      if (state.playerParts.rightArm) {
        state.playerParts.rightArm.rotation.x = swing * 0.25;
      }

      state.player.position.y += Math.sin(performance.now() * 0.014) * 0.006;
    } else {
      for (const part of [
        state.playerParts.leftLeg,
        state.playerParts.rightLeg,
        state.playerParts.leftArm,
        state.playerParts.rightArm
      ]) {
        if (part) {
          part.rotation.x += (0 - part.rotation.x) * Math.min(1, delta * 8);
        }
      }
    }
  }

  /* ==========================================================
     16. EFFETS VISUELS
  ========================================================== */

  function updateEffects(delta) {
    for (let i = state.effects.length - 1; i >= 0; i--) {
      const effect = state.effects[i];

      effect.life -= delta;

      if (effect.kind === 'impact' && effect.object) {
        const ratio = Math.max(0, effect.life / effect.maxLife);

        effect.object.scale.setScalar(1 + (1 - ratio) * 2);

        if (effect.object.material) {
          effect.object.material.opacity = ratio;
        }
      }

      if (effect.life <= 0) {
        if (effect.object) {
          state.scene.remove(effect.object);

          effect.object.traverse?.((child) => {
            child.geometry?.dispose?.();
            child.material?.dispose?.();
          });

          effect.object.geometry?.dispose?.();
          effect.object.material?.dispose?.();
        }

        state.effects.splice(i, 1);
      }
    }

    for (const decoration of state.decorations) {
      if (decoration.type === 'tree' && decoration.object.userData.swayParts) {
        const time = performance.now() * 0.0005 + decoration.phase;

        decoration.object.userData.swayParts.forEach((part, index) => {
          part.rotation.z = Math.sin(time + index) * 0.025;
        });
      }

      if (decoration.type === 'lava') {
        const time = performance.now() * 0.003 + decoration.phase;
        decoration.object.material.emissiveIntensity =
          0.4 + (Math.sin(time) + 1) * 0.3;
      }
    }
  }

  /* ==========================================================
     17. MINI-CARTE / RADAR
  ========================================================== */

  function drawMinimap() {
    const canvas = dom.minimapCanvas;

    if (!canvas || !state.player) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(9, 25, 20, 0.93)';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(105, 205, 145, 0.24)';
    ctx.lineWidth = 1;

    for (let radius = 24; radius < 90; radius += 24) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    const scale = 1.2;
    const playerX = state.player.position.x;
    const playerZ = state.player.position.z;

    for (const enemy of state.enemies) {
      if (enemy.dead) continue;

      const dx = (enemy.group.position.x - playerX) * scale;
      const dz = (enemy.group.position.z - playerZ) * scale;

      const x = clamp(centerX + dx, 4, width - 4);
      const y = clamp(centerY + dz, 4, height - 4);

      ctx.fillStyle = enemy.boss ? '#ff453d' : '#ff8b4b';

      ctx.beginPath();
      ctx.arc(x, y, enemy.boss ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Position de NINA
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-state.yaw);

    ctx.fillStyle = '#a5ffd0';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(5.5, 6);
    ctx.lineTo(0, 3);
    ctx.lineTo(-5.5, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    setText(dom.radarStatus, `${state.enemies.filter((e) => !e.dead).length} MENACE(S)`);
  }

  /* ==========================================================
     18. PROGRESSION DES MISSIONS
  ========================================================== */

  function updateMissionProgress() {
    const completed = state.completedMissions.length;
    const percentage = Math.round((completed / missionData.length) * 100);

    setText(dom.missionsUnlockedCount, `${state.unlockedMissions}/10`);
    setText(dom.campaignProgressText, `${percentage}%`);

    if (dom.campaignProgressBar) {
      dom.campaignProgressBar.style.width = `${percentage}%`;
    }

    if (!dom.missionGrid) return;

    const cards = dom.missionGrid.querySelectorAll('[data-mission]');

    cards.forEach((card) => {
      const index = Number(card.dataset.mission);
      const unlocked = index < state.unlockedMissions;
      const completedMission = state.completedMissions.includes(index);

      card.classList.toggle('locked', !unlocked);
      card.classList.toggle('completed', completedMission);

      const lock = card.querySelector('.mission-lock');

      if (lock) {
        lock.textContent = completedMission
          ? '✓'
          : unlocked
            ? '▶'
            : '🔒';
      }

      card.setAttribute('aria-disabled', String(!unlocked));
    });
  }

  function completeMission() {
    if (!state.running || state.paused) return;

    state.running = false;
    state.paused = false;
    state.firing = false;

    const index = state.missionIndex;

    if (!state.completedMissions.includes(index)) {
      state.completedMissions.push(index);
    }

    state.unlockedMissions = Math.max(
      state.unlockedMissions,
      Math.min(missionData.length, index + 2)
    );

    const elapsed = (performance.now() - state.missionStartTime) / 1000;

    setText(dom.victoryKills, state.kills);
    setText(dom.victoryScore, state.score);
    setText(dom.victoryTime, formatTime(elapsed));

    setText(
      dom.victoryMessage,
      `Zone sécurisée. NINA a terminé ${missionData[index].name}.`
    );

    if (index >= missionData.length - 1) {
      setText(dom.nextMissionBtn, 'CAMPAGNE TERMINÉE');
      dom.nextMissionBtn.disabled = true;
    } else {
      setText(dom.nextMissionBtn, '▶ MISSION SUIVANTE');
      dom.nextMissionBtn.disabled = false;
    }

    hideAllOverlays();
    show(dom.victoryScreen);

    updateMissionProgress();
    saveGame(false);

    playTone(560, 0.18, 'triangle');
    safeVibrate([40, 40, 80]);

    announce('Mission réussie.');
  }

  function failMission() {
    if (!state.running) return;

    state.running = false;
    state.paused = false;
    state.firing = false;

    const elapsed = (performance.now() - state.missionStartTime) / 1000;

    setText(dom.failedKills, state.kills);
    setText(dom.failedScore, state.score);
    setText(dom.failedTime, formatTime(elapsed));

    setText(
      dom.gameOverMessage,
      'NINA est tombée au combat. Réessayez pour terminer la mission.'
    );

    hideAllOverlays();
    show(dom.gameOverScreen);

    saveGame(false);
    announce('Mission échouée.');
  }

  /* ==========================================================
     19. PAUSE ET NAVIGATION
  ========================================================== */

  function pauseGame() {
    if (!state.gameStarted || !state.running) return;

    state.paused = true;
    state.firing = false;

    hideAllOverlays();
    show(dom.pauseScreen);
  }

  function resumeGame() {
    hideAllOverlays();

    if (!state.gameStarted) return;

    state.paused = false;
    state.running = true;
    state.lastFrame = performance.now();

    if (state.clock) state.clock.start();

    toast('Mission reprise.');
  }

  function returnToMainMenu() {
    state.running = false;
    state.paused = false;
    state.gameStarted = false;
    state.firing = false;

    hideAllOverlays();
    showOnlyScreen(dom.mainMenu);

    updateMissionProgress();
    saveGame(false);
  }

  function openMissions() {
    state.running = false;
    state.paused = false;
    state.firing = false;

    hideAllOverlays();
    showOnlyScreen(dom.missionScreen);

    updateMissionProgress();
  }

  function openSettings() {
    applySettingsToUI();

    hideAllOverlays();
    show(dom.settingsScreen);
  }

  /* ==========================================================
     20. PARAMÈTRES
  ========================================================== */

  function applySettingsToUI() {
    if (dom.graphicsQuality) {
      dom.graphicsQuality.value = state.settings.quality;
    }

    if (dom.sensitivityRange) {
      dom.sensitivityRange.value = String(state.settings.sensitivity);
    }

    if (dom.soundToggle) {
      dom.soundToggle.checked = Boolean(state.settings.sound);
    }

    if (dom.vibrationToggle) {
      dom.vibrationToggle.checked = Boolean(state.settings.vibration);
    }

    if (dom.showMinimapToggle) {
      dom.showMinimapToggle.checked = Boolean(state.settings.minimap);
    }
  }

  function saveSettings() {
    state.settings.quality = dom.graphicsQuality?.value || 'medium';

    state.settings.sensitivity = clamp(
      Number(dom.sensitivityRange?.value || 5),
      1,
      10
    );

    state.settings.sound = Boolean(dom.soundToggle?.checked);
    state.settings.vibration = Boolean(dom.vibrationToggle?.checked);
    state.settings.minimap = Boolean(dom.showMinimapToggle?.checked);

    state.sensitivity = 0.0015 + state.settings.sensitivity * 0.0008;

    if (state.renderer) {
      state.renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, pixelRatioLimit())
      );

      state.renderer.shadowMap.enabled = state.settings.quality !== 'low';
      state.renderer.setSize(
        dom.gameWorld.clientWidth || window.innerWidth,
        dom.gameWorld.clientHeight || window.innerHeight,
        false
      );
    }

    updateHUD();
    saveGame(false);

    toast('Paramètres enregistrés.');
    hide(dom.settingsScreen);

    if (state.gameStarted && !state.paused && state.running) {
      return;
    }

    if (state.gameStarted && state.paused) {
      show(dom.pauseScreen);
    } else {
      show(dom.mainMenu);
    }
  }

  /* ==========================================================
     21. JOYSTICK TACTILE
  ========================================================== */

  function updateJoystick(clientX, clientY) {
    if (!dom.joystickBase || !dom.joystickThumb) return;

    const rect = dom.joystickBase.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRadius = rect.width * 0.32;

    let dx = clientX - centerX;
    let dy = clientY - centerY;

    const distance = Math.hypot(dx, dy);

    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    dom.joystickThumb.style.transform =
      `translate(${dx}px, ${dy}px)`;

    state.moveX = dx / maxRadius;
    state.moveY = dy / maxRadius;
  }

  function resetJoystick() {
    state.moveX = 0;
    state.moveY = 0;
    state.joystickPointer = null;

    if (dom.joystickThumb) {
      dom.joystickThumb.style.transform = 'translate(0, 0)';
    }
  }

  function pointerPosition(event) {
    return {
      x: event.clientX,
      y: event.clientY
    };
  }

  /* ==========================================================
     22. GESTES CAMÉRA ET ZOOM À DEUX DOIGTS
  ========================================================== */

  function getPinchDistance() {
    const points = [...state.cameraPointers.values()];

    if (points.length < 2) return 0;

    return Math.hypot(
      points[0].x - points[1].x,
      points[0].y - points[1].y
    );
  }

  function handleCanvasPointerDown(event) {
    if (!state.running || state.paused) return;

    // Le joystick et les boutons ne contrôlent pas la caméra.
    if (event.target.closest('button, .movement-zone, .right-action-buttons, .left-action-buttons')) {
      return;
    }

    state.cameraPointers.set(event.pointerId, pointerPosition(event));

    if (state.cameraPointers.size === 1) {
      state.pointer = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY
      };
    }

    if (state.cameraPointers.size >= 2) {
      state.pinchDistance = getPinchDistance();
      state.pointer = null;
    }

    try {
      dom.canvas.setPointerCapture(event.pointerId);
    } catch (_) {
      // Certains navigateurs ne permettent pas la capture.
    }
  }

  function handleCanvasPointerMove(event) {
    if (!state.cameraPointers.has(event.pointerId)) return;

    state.cameraPointers.set(event.pointerId, pointerPosition(event));

    if (state.cameraPointers.size >= 2) {
      const nextDistance = getPinchDistance();

      if (state.pinchDistance > 0 && nextDistance > 0) {
        const difference = nextDistance - state.pinchDistance;

        state.cameraDistance = clamp(
          state.cameraDistance - difference * 0.025,
          3.4,
          12.5
        );
      }

      state.pinchDistance = nextDistance;
      state.pointer = null;
      return;
    }

    if (!state.pointer || state.pointer.id !== event.pointerId) return;

    const dx = event.clientX - state.pointer.x;
    const dy = event.clientY - state.pointer.y;

    state.yaw -= dx * state.sensitivity;
    state.pitch = clamp(
      state.pitch - dy * state.sensitivity,
      -0.75,
      0.45
    );

    state.pointer.x = event.clientX;
    state.pointer.y = event.clientY;
  }

  function handleCanvasPointerUp(event) {
    state.cameraPointers.delete(event.pointerId);

    if (state.cameraPointers.size < 2) {
      state.pinchDistance = 0;
    }

    if (state.pointer?.id === event.pointerId) {
      state.pointer = null;
    }
  }

  /* ==========================================================
     23. CLAVIER
  ========================================================== */

  function handleKeyDown(event) {
    const target = event.target;

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    state.keys.add(event.code);

    if ([
      'Space',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight'
    ].includes(event.code)) {
      event.preventDefault();
    }

    if (event.repeat) return;

    switch (event.code) {
      case 'Space':
        jump();
        break;

      case 'ShiftLeft':
      case 'ShiftRight':
        toggleSprint(true);
        break;

      case 'KeyR':
        reloadWeapon();
        break;

      case 'KeyF':
        switchWeapon();
        break;

      case 'Escape':
        if (state.running && !state.paused) {
          pauseGame();
        } else if (state.paused) {
          resumeGame();
        }
        break;

      case 'KeyE':
        toggleAim();
        break;
    }
  }

  function handleKeyUp(event) {
    state.keys.delete(event.code);

    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
      toggleSprint(false);
    }
  }

  /* ==========================================================
     24. BOUTONS : TOUS LES ÉVÉNEMENTS
  ========================================================== */

  function bindButton(element, callback) {
    if (!element) return;

    element.addEventListener('click', (event) => {
      event.preventDefault();
      callback();
    });
  }

  function bindControls() {
    // Menu principal
    bindButton(dom.startGameBtn, () => {
      unlockAudio();
      startMission(state.missionIndex);
    });

    bindButton(dom.missionsMenuBtn, openMissions);
    bindButton(dom.missionsBackBtn, returnToMainMenu);

    bindButton(dom.menuSettingsBtn, openSettings);
    bindButton(dom.closeSettingsBtn, () => {
      hide(dom.settingsScreen);

      if (state.gameStarted && state.paused) {
        show(dom.pauseScreen);
      } else {
        show(dom.mainMenu);
      }
    });

    bindButton(dom.saveSettingsBtn, saveSettings);

    // Sélection des missions
    dom.missionGrid?.addEventListener('click', (event) => {
      const card = event.target.closest('[data-mission]');
      if (!card) return;

      const index = Number(card.dataset.mission);

      if (!Number.isInteger(index)) return;

      if (index >= state.unlockedMissions) {
        toast('Terminez la mission précédente pour débloquer celle-ci.');
        return;
      }

      unlockAudio();
      startMission(index);
    });

    // HUD
    bindButton(dom.gameMenuBtn, pauseGame);
    bindButton(dom.pauseGameBtn, pauseGame);

    // Pause
    bindButton(dom.resumeGameBtn, resumeGame);

    bindButton(dom.restartMissionBtn, () => {
      startMission(state.missionIndex);
    });

    bindButton(dom.pauseMissionsBtn, openMissions);
    bindButton(dom.pauseMainMenuBtn, returnToMainMenu);

    // Victoire
    bindButton(dom.nextMissionBtn, () => {
      if (state.missionIndex >= missionData.length - 1) {
        toast('Vous avez terminé les dix missions !');
        return;
      }

      startMission(state.missionIndex + 1);
    });

    bindButton(dom.victoryMissionsBtn, openMissions);
    bindButton(dom.victoryMenuBtn, returnToMainMenu);

    // Échec
    bindButton(dom.retryMissionBtn, () => {
      startMission(state.missionIndex);
    });

    bindButton(dom.gameOverMissionsBtn, openMissions);
    bindButton(dom.gameOverMenuBtn, returnToMainMenu);

    // Actions tactiles
    bindButton(dom.jumpBtn, jump);
    bindButton(dom.aimBtn, () => toggleAim());
    bindButton(dom.reloadBtn, reloadWeapon);
    bindButton(dom.weaponSwitchBtn, switchWeapon);

    // Sprint : appui long ou bascule au toucher.
    if (dom.runBtn) {
      dom.runBtn.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        toggleSprint(true);
      });

      const stopSprint = () => toggleSprint(false);

      dom.runBtn.addEventListener('pointerup', stopSprint);
      dom.runBtn.addEventListener('pointercancel', stopSprint);
      dom.runBtn.addEventListener('pointerleave', stopSprint);
    }

    // Tir continu tant que le bouton est pressé.
    if (dom.fireBtn) {
      dom.fireBtn.addEventListener('pointerdown', (event) => {
        event.preventDefault();

        unlockAudio();

        state.firing = true;
        shoot();

        try {
          dom.fireBtn.setPointerCapture(event.pointerId);
        } catch (_) {}
      });

      const stopFire = () => {
        state.firing = false;
      };

      dom.fireBtn.addEventListener('pointerup', stopFire);
      dom.fireBtn.addEventListener('pointercancel', stopFire);
      dom.fireBtn.addEventListener('lostpointercapture', stopFire);
      dom.fireBtn.addEventListener('contextmenu', (event) => {
        event.preventDefault();
      });
    }

    // Joystick
    if (dom.joystickBase) {
      dom.joystickBase.addEventListener('pointerdown', (event) => {
        event.preventDefault();

        state.joystickPointer = event.pointerId;

        try {
          dom.joystickBase.setPointerCapture(event.pointerId);
        } catch (_) {}

        updateJoystick(event.clientX, event.clientY);
      });

      dom.joystickBase.addEventListener('pointermove', (event) => {
        if (state.joystickPointer !== event.pointerId) return;

        event.preventDefault();
        updateJoystick(event.clientX, event.clientY);
      });

      const stopJoystick = (event) => {
        if (state.joystickPointer !== event.pointerId) return;
        resetJoystick();
      };

      dom.joystickBase.addEventListener('pointerup', stopJoystick);
      dom.joystickBase.addEventListener('pointercancel', stopJoystick);
      dom.joystickBase.addEventListener('lostpointercapture', resetJoystick);
    }

    // Caméra et zoom sur le monde
    dom.canvas?.addEventListener('pointerdown', handleCanvasPointerDown);
    dom.canvas?.addEventListener('pointermove', handleCanvasPointerMove);
    dom.canvas?.addEventListener('pointerup', handleCanvasPointerUp);
    dom.canvas?.addEventListener('pointercancel', handleCanvasPointerUp);
    dom.canvas?.addEventListener('lostpointercapture', handleCanvasPointerUp);

    dom.canvas?.addEventListener('wheel', (event) => {
      if (!state.running) return;

      event.preventDefault();

      state.cameraDistance = clamp(
        state.cameraDistance + event.deltaY * 0.008,
        3.4,
        12.5
      );
    }, { passive: false });

    // Tir souris sur ordinateur
    dom.canvas?.addEventListener('click', (event) => {
      if (!state.running || state.paused) return;

      if (event.pointerType === 'touch') return;

      shoot();
    });

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    window.addEventListener('blur', () => {
      state.keys.clear();
      state.firing = false;
      resetJoystick();
    });

    window.addEventListener('resize', () => {
      resizeRenderer();
      updateOrientationNotice();
    });

    window.addEventListener('orientationchange', updateOrientationNotice);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state.running && !state.paused) {
        pauseGame();
      }
    });
  }

  /* ==========================================================
     25. SON : ACTIVATION APRÈS INTERACTION
  ========================================================== */

  function unlockAudio() {
    if (state.audioUnlocked) return;

    state.audioUnlocked = true;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      state.audioContext = state.audioContext || new AudioContextClass();

      if (state.audioContext.state === 'suspended') {
        state.audioContext.resume().catch(() => {});
      }
    } catch (_) {
      // Le jeu peut fonctionner sans audio.
    }
  }

  /* ==========================================================
     26. BOUCLE PRINCIPALE
  ========================================================== */

  function gameLoop(timestamp) {
    state.animationFrame = requestAnimationFrame(gameLoop);

    if (!state.renderer || !state.scene || !state.camera) return;

    const delta = Math.min(
      0.04,
      Math.max(0, (timestamp - state.lastFrame) / 1000)
    );

    state.lastFrame = timestamp;

    if (state.running && !state.paused) {
      updatePlayer(delta);
      updateEnemies(delta);
      updateEffects(delta);
      updateCamera(delta);

      state.elapsed = (performance.now() - state.missionStartTime) / 1000;

      // Tir automatique pendant l'appui continu.
      if (state.firing) {
        shoot();
      }

      // Vérification de victoire après élimination de toutes les créatures.
      const remaining = state.enemies.filter((enemy) => !enemy.dead);

      if (
        remaining.length === 0 &&
        state.kills >= missionData[state.missionIndex].creatures
      ) {
        completeMission();
      }

      updateHUD();
    } else {
      updateEffects(delta * 0.25);
    }

    try {
      state.renderer.render(state.scene, state.camera);
    } catch (error) {
      console.error('[NINA 3D] Erreur de rendu :', error);
    }
  }

  /* ==========================================================
     27. ORIENTATION MOBILE
  ========================================================== */

  function updateOrientationNotice() {
    if (!dom.orientationNotice) return;

    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    const portrait = window.innerHeight > window.innerWidth;

    if (isMobile && portrait && state.gameStarted && state.running) {
      show(dom.orientationNotice);
    } else {
      hide(dom.orientationNotice);
    }
  }

  /* ==========================================================
     28. ACCESSIBILITÉ ET ÉTAT INITIAL
  ========================================================== */

  function initializeMissionCards() {
    updateMissionProgress();
  }

  function initializeUI() {
    hide(dom.missionScreen);
    hide(dom.gameScreen);
    hide(dom.pauseScreen);
    hide(dom.victoryScreen);
    hide(dom.gameOverScreen);
    hide(dom.settingsScreen);

    show(dom.loadingScreen);

    if (dom.keyboardHints) {
      const isTouch = 'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;

      dom.keyboardHints.style.display = isTouch ? 'none' : '';
    }
  }

  function checkWebGL() {
    try {
      const canvas = document.createElement('canvas');

      return Boolean(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') ||
         canvas.getContext('webgl') ||
         canvas.getContext('experimental-webgl'))
      );
    } catch (_) {
      return false;
    }
  }

  /* ==========================================================
     29. INITIALISATION GLOBALE
  ========================================================== */

  async function initializeGame() {
    initializeUI();

    setProgress(8);
    setText(dom.loadingMessage, 'Chargement des données...');
    setEngineStatus('CHARGEMENT DU MOTEUR 3D');

    state.db = await openDatabase();

    setProgress(18);
    setText(dom.loadingMessage, 'Récupération de la progression...');

    await loadGameSave();

    setProgress(32);
    setText(dom.loadingMessage, 'Initialisation de Three.js...');

    if (!checkWebGL()) {
      throw new Error(
        'WebGL est désactivé ou indisponible dans ce navigateur.'
      );
    }

    state.THREE = await loadThree();

    setProgress(55);
    setText(dom.loadingMessage, 'Création de la scène 3D...');

    initRenderer();

    setProgress(76);
    setText(dom.loadingMessage, 'Préparation des commandes...');

    bindControls();

    setProgress(90);
    setText(dom.loadingMessage, 'Finalisation du système...');

    initializeMissionCards();

    // Prépare la scène de menu sans lancer une mission.
    state.scene.background = new state.THREE.Color(0x14251d);
    state.scene.fog = new state.THREE.Fog(0x14251d, 25, 90);

    const ambient = new state.THREE.HemisphereLight(
      0xa7c6b4,
      0x283327,
      2
    );

    state.scene.add(ambient);

    const keyLight = new state.THREE.DirectionalLight(0xffe4bc, 2);
    keyLight.position.set(-8, 15, 9);
    state.scene.add(keyLight);

    // Sol visible derrière l'interface si le menu montre le canvas.
    const floor = new state.THREE.Mesh(
      new state.THREE.PlaneGeometry(100, 100),
      createMaterial(0x243d2b)
    );

    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.1;
    state.scene.add(floor);

    setProgress(100);
    setText(dom.loadingMessage, 'Système prêt.');
    setEngineStatus('MOTEUR 3D OPÉRATIONNEL');

    setTimeout(() => {
      hide(dom.loadingScreen);
      showOnlyScreen(dom.mainMenu);
      updateMissionProgress();
      resizeRenderer();

      state.lastFrame = performance.now();

      if (!state.animationFrame) {
        state.animationFrame = requestAnimationFrame(gameLoop);
      }
    }, 450);

    console.info('[NINA 3D] Initialisation terminée.');
  }

  /* ==========================================================
     30. GESTION DES ERREURS
  ========================================================== */

  function showFatalError(error) {
    console.error('[NINA 3D] Initialisation impossible :', error);

    setEngineStatus('ERREUR DU MOTEUR');

    setText(
      dom.loadingMessage,
      `Impossible de lancer le moteur 3D : ${error.message || error}`
    );

    setProgress(100);

    if (dom.loadingScreen) {
      show(dom.loadingScreen);
    }

    if (dom.loadingProgress) {
      dom.loadingProgress.style.background = '#ef5147';
    }

    announce('Erreur au démarrage du jeu 3D.');
  }

  /* ==========================================================
     31. LANCEMENT
  ========================================================== */

  try {
    await initializeGame();
  } catch (error) {
    showFatalError(error);
  }

})();