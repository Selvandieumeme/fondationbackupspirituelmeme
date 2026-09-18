


/* ================================================================
   FOBAS — LABORATOIRE ÉLECTRONIQUE & ROBOTIQUE
   SIMULATION ELECTRONIQUE ENGINE
   VERSION 2.0.0
   ----------------------------------------------------------------
   ARCHITECTURE :
   - Aucun Three.js
   - Aucun module 3D externe
   - Bibliothèque composants dynamique
   - Visualisation 3D légère HTML/CSS/SVG
   - Montage libre
   - Déplacement tactile Android avec Pointer Events
   - Sélection / Déplacement / Rotation / Suppression / Duplication
   - Fils et connexions
   - Zoom laboratoire
   - Pinch 2 doigts pour zoom global de l'application
   - Code Library dynamique
   - Code Editor
   - Arduino code interpreter
   - Hardware mapping
   - Simulation des réactions des composants
   - Missions
   - Mesures
   - Diagnostic
   - Pannes
   - Sauvegarde / chargement JSON
   - Aucun changement requis dans le HTML fourni
================================================================ */

(() => {
    "use strict";

    /* ============================================================
       01. ENGINE CONFIGURATION
    ============================================================ */

    const ENGINE_NAME = "FOBAS_ELECTRONIC_ENGINE";
    const ENGINE_VERSION = "2.0.0";
    const STORAGE_KEY = "FOBAS_ELECTRONIC_LABORATORY_STATE_V2";
    const PROJECT_FORMAT = "FOBAS_ELECTRONIC_PROJECT_V2";

    const app = document.getElementById("fobasElectronicApp");

    if (!app) {
        console.error("FOBAS Electronic Engine : #fobasElectronicApp introuvable.");
        return;
    }

    app.dataset.engine = ENGINE_NAME;
    app.dataset.version = ENGINE_VERSION;

    /* ============================================================
       02. DOM HELPERS
    ============================================================ */

    const $ = (id) => document.getElementById(id);

    const dom = {
        header: $("electronicHeader"),
        logo: $("fobasElectronicLogo"),

        status: $("simulationStatus"),
        statusDot: $("simulationStatusDot"),
        statusText: $("simulationStatusText"),

        laboratoryBtn: $("laboratoryBtn"),
        libraryBtn: $("libraryBtn"),
        codeLibraryBtn: $("codeLibraryBtn"),
        codeEditorBtn: $("codeEditorBtn"),
        missionsBtn: $("missionsBtn"),
        measurementsBtn: $("measurementsBtn"),
        diagnosticBtn: $("diagnosticBtn"),
        faultsBtn: $("faultsBtn"),

        levelSelector: $("levelSelector"),
        beginnerLevelBtn: $("beginnerLevelBtn"),
        intermediateLevelBtn: $("intermediateLevelBtn"),
        expertLevelBtn: $("expertLevelBtn"),

        electronicMain: $("electronicMain"),
        sidebar: $("electronicSidebar"),

        batteryBtn: $("batteryBtn"),
        dcSupplyBtn: $("dcSupplyBtn"),
        acSupplyBtn: $("acSupplyBtn"),
        signalGeneratorBtn: $("signalGeneratorBtn"),

        multimeterBtn: $("multimeterBtn"),
        oscilloscopeBtn: $("oscilloscopeBtn"),
        voltmeterBtn: $("voltmeterBtn"),
        ammeterBtn: $("ammeterBtn"),
        ohmmeterBtn: $("ohmmeterBtn"),
        frequencyMeterBtn: $("frequencyMeterBtn"),
        logicAnalyzerBtn: $("logicAnalyzerBtn"),

        workspaceArea: $("laboratoryWorkspaceArea"),
        workspaceToolbar: $("workspaceToolbar"),
        selectToolBtn: $("selectToolBtn"),
        wireToolBtn: $("wireToolBtn"),
        moveToolBtn: $("moveToolBtn"),
        rotateToolBtn: $("rotateToolBtn"),
        deleteToolBtn: $("deleteToolBtn"),
        duplicateToolBtn: $("duplicateToolBtn"),
        zoomInBtn: $("zoomInBtn"),
        zoomOutBtn: $("zoomOutBtn"),
        zoomResetBtn: $("zoomResetBtn"),
        fitWorkspaceBtn: $("fitWorkspaceBtn"),

        viewport: $("laboratoryViewport"),
        canvas: $("laboratoryCanvas"),
        grid: $("laboratoryGrid"),
        componentLayer: $("componentLayer"),
        wireLayer: $("wireLayer"),
        connectionLayer: $("connectionLayer"),
        measurementLayer: $("measurementLayer"),
        effectsLayer: $("simulationEffectsLayer"),

        workspaceStatusBar: $("workspaceStatusBar"),
        componentCount: $("componentCount"),
        connectionCount: $("connectionCount"),
        workspaceVoltage: $("workspaceVoltage"),
        workspaceCurrent: $("workspaceCurrent"),
        circuitState: $("circuitState"),

        controlPanel: $("electronicControlPanel"),
        powerOnBtn: $("powerOnBtn"),
        powerOffBtn: $("powerOffBtn"),
        runCircuitBtn: $("runCircuitBtn"),
        stopCircuitBtn: $("stopCircuitBtn"),
        resetCircuitBtn: $("resetCircuitBtn"),

        voltageDisplay: $("voltageDisplay"),
        currentDisplay: $("currentDisplay"),
        resistanceDisplay: $("resistanceDisplay"),
        frequencyDisplay: $("frequencyDisplay"),
        measureVoltageBtn: $("measureVoltageBtn"),
        measureCurrentBtn: $("measureCurrentBtn"),
        measureResistanceBtn: $("measureResistanceBtn"),

        openCodeEditorBtn: $("openCodeEditorBtn"),
        executeCodeBtn: $("executeCodeBtn"),
        stopCodeBtn: $("stopCodeBtn"),
        clearCodeBtn: $("clearCodeBtn"),

        saveProjectBtn: $("saveProjectBtn"),
        loadProjectBtn: $("loadProjectBtn"),
        clearWorkspaceBtn: $("clearWorkspaceBtn"),
        projectFileInput: $("projectFileInput"),

        componentLibraryPanel: $("componentLibraryPanel"),
        closeComponentLibraryBtn: $("closeComponentLibraryBtn"),
        componentSearchBtn: $("componentSearchBtn"),
        componentSearchInput: $("componentSearchInput"),
        componentCategories: $("componentCategories"),
        componentLibraryGrid: $("componentLibraryGrid"),

        codeLibraryPanel: $("codeLibraryPanel"),
        closeCodeLibraryBtn: $("closeCodeLibraryBtn"),
        codeLibraryLevels: $("codeLibraryLevels"),
        codeBeginnerBtn: $("codeBeginnerBtn"),
        codeIntermediateBtn: $("codeIntermediateBtn"),
        codeExpertBtn: $("codeExpertBtn"),
        codeLibraryList: $("codeLibraryList"),

        codeEditorPanel: $("codeEditorPanel"),
        closeCodeEditorBtn: $("closeCodeEditorBtn"),
        pasteCodeBtn: $("pasteCodeBtn"),
        copyCodeBtn: $("copyCodeBtn"),
        validateCodeBtn: $("validateCodeBtn"),
        executeEditorCodeBtn: $("executeEditorCodeBtn"),
        stopEditorCodeBtn: $("stopEditorCodeBtn"),
        clearEditorCodeBtn: $("clearEditorCodeBtn"),
        electronicCodeEditor: $("electronicCodeEditor"),
        codeExecutionConsole: $("codeExecutionConsole"),
        codeConsoleOutput: $("codeConsoleOutput"),

        missionsPanel: $("missionsPanel"),
        closeMissionsBtn: $("closeMissionsBtn"),
        beginnerMissionsBtn: $("beginnerMissionsBtn"),
        intermediateMissionsBtn: $("intermediateMissionsBtn"),
        expertMissionsBtn: $("expertMissionsBtn"),
        missionsList: $("missionsList"),
        missionWorkspace: $("missionWorkspace"),
        activeMissionTitle: $("activeMissionTitle"),
        activeMissionDescription: $("activeMissionDescription"),
        missionRequirements: $("missionRequirements"),
        startMissionBtn: $("startMissionBtn"),
        validateMissionBtn: $("validateMissionBtn"),

        diagnosticPanel: $("diagnosticPanel"),
        closeDiagnosticBtn: $("closeDiagnosticBtn"),
        diagnosticResults: $("diagnosticResults"),
        runDiagnosticBtn: $("runDiagnosticBtn"),

        faultsPanel: $("faultsPanel"),
        closeFaultsBtn: $("closeFaultsBtn"),
        createOpenCircuitFaultBtn: $("createOpenCircuitFaultBtn"),
        createShortCircuitFaultBtn: $("createShortCircuitFaultBtn"),
        createPolarityFaultBtn: $("createPolarityFaultBtn"),
        createComponentFaultBtn: $("createComponentFaultBtn"),
        clearFaultsBtn: $("clearFaultsBtn"),

        measurementsPanel: $("measurementsPanel"),
        closeMeasurementsBtn: $("closeMeasurementsBtn"),
        measurementsDashboard: $("measurementsDashboard"),
        dashboardVoltage: $("dashboardVoltage"),
        dashboardCurrent: $("dashboardCurrent"),
        dashboardResistance: $("dashboardResistance"),
        dashboardFrequency: $("dashboardFrequency"),
        dashboardPower: $("dashboardPower"),
        dashboardContinuity: $("dashboardContinuity"),

        componentDetailsModal: $("componentDetailsModal"),
        closeComponentDetailsBtn: $("closeComponentDetailsBtn"),
        componentDetailsVisual: $("componentDetailsVisual"),
        componentDetailsTitle: $("componentDetailsTitle"),
        componentDetailsProperties: $("componentDetailsProperties"),
        addComponentFromDetailsBtn: $("addComponentFromDetailsBtn"),

        missionResultModal: $("missionResultModal"),
        missionResultIcon: $("missionResultIcon"),
        missionResultTitle: $("missionResultTitle"),
        missionResultMessage: $("missionResultMessage"),
        closeMissionResultBtn: $("closeMissionResultBtn"),

        toast: $("electronicToast"),
        engineVersion: $("engineVersion")
    };

    /* ============================================================
       03. ENGINE STATE
    ============================================================ */

    const state = {
        components: [],
        wires: [],
        selectedComponentId: null,

        activeTool: "select",

        zoom: 1,
        panX: 0,
        panY: 0,

        globalScale: 1,

        powerOn: false,
        circuitRunning: false,
        codeRunning: false,

        currentLevel: "beginner",
        currentCodeLevel: "beginner",

        currentLibraryCategory: "all",
        currentCodeId: null,

        activeMissionId: null,
        missionStarted: false,

        selectedComponentType: null,

        faults: {
            openCircuit: false,
            shortCircuit: false,
            reversedPolarity: false,
            defectiveComponent: false
        },

        measurements: {
            voltage: 0,
            current: 0,
            resistance: null,
            frequency: 0,
            power: 0,
            continuity: null
        },

        code: "",

        wireStart: null,

        drag: {
            active: false,
            componentId: null,
            pointerId: null,
            offsetX: 0,
            offsetY: 0
        },

        pinch: {
            active: false,
            pointerIds: [],
            startDistance: 0,
            startScale: 1
        },

        simulationTimer: null,

        initialized: false
    };

    /* ============================================================
       04. UTILITY FUNCTIONS
    ============================================================ */

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function uid(prefix = "obj") {
        return `${prefix}_${Date.now().toString(36)}_${Math.random()
            .toString(36)
            .slice(2, 9)}`;
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function normalizeText(value) {
        return String(value ?? "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function distance(a, b) {
        return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }

    function showToast(message, type = "info") {
        if (!dom.toast) return;

        dom.toast.textContent = message;
        dom.toast.dataset.type = type;
        dom.toast.classList.add("show");

        clearTimeout(showToast.timer);

        showToast.timer = setTimeout(() => {
            dom.toast.classList.remove("show");
        }, 2600);
    }

    function setStatus(message, mode = "ready") {
        if (dom.statusText) {
            dom.statusText.textContent = message;
        }

        if (dom.statusDot) {
            dom.statusDot.dataset.status = mode;
        }
    }

    function consoleLog(message, type = "info") {
        if (!dom.codeConsoleOutput) return;

        const row = document.createElement("div");
        row.className = `console-line console-${type}`;
        row.textContent = message;

        dom.codeConsoleOutput.appendChild(row);
        dom.codeConsoleOutput.scrollTop = dom.codeConsoleOutput.scrollHeight;
    }

    function clearConsole() {
        if (!dom.codeConsoleOutput) return;
        dom.codeConsoleOutput.innerHTML = "";
    }

    function findComponent(id) {
        return state.components.find(component => component.id === id) || null;
    }

    function findComponentByType(type) {
        return state.components.find(component => component.type === type) || null;
    }

    function selectedComponent() {
        return findComponent(state.selectedComponentId);
    }

    function componentHasType(type) {
        return state.components.some(component => component.type === type);
    }

    function componentTypeAliases(type) {
        const aliases = {
            "arduino-uno": ["arduino", "arduino-uno", "controller"],
            "arduino-nano": ["arduino", "arduino-nano", "controller"],
            "arduino-mega": ["arduino", "arduino-mega", "controller"],
            "esp32": ["esp32", "controller"],
            "esp8266": ["esp8266", "controller"],
            "raspberry-pi": ["raspberry", "controller"],
            "led": ["led", "diode"],
            "resistor": ["resistor", "resistors"],
            "push-button": ["button", "buttons", "switch"],
            "servo": ["servo", "motor"],
            "dc-motor": ["motor", "dc-motor"],
            "buzzer": ["buzzer"],
            "hc-sr04": ["sensor", "ultrasonic"],
            "ldr": ["sensor", "ldr"],
            "potentiometer": ["potentiometer"],
            "relay": ["relay"]
        };

        return aliases[type] || [type];
    }





/* ============================================================
   05. COMPONENT DATABASE
   ============================================================
   BASE DE DONNÉES COMPLÈTE DES COMPOSANTS
   ------------------------------------------------------------
   Compatible avec :
   - Bloc 08 : DYNAMIC COMPONENT LIBRARY
   - Bloc 09 : COMPONENT VISUAL ENGINE
   - Création dynamique des composants
   - Connexions / pins
   - Simulation
   - Arduino / ESP32 / Raspberry Pi
   - Robotique
   - Capteurs
   - Modules électroniques
   - LED multicolores
   - Breadboard / PCB
   ============================================================ */

const COMPONENTS = [

    /* =========================================================
       01. ALIMENTATION / POWER
       ========================================================= */

    {
        id: "battery",
        name: "Batterie",
        category: "power",
        icon: "🔋",
        color: "#263238",
        width: 120,
        height: 76,
        voltage: 9,
        resistance: 0.5,
        pins: [
            { id: "positive", name: "+", side: "right" },
            { id: "negative", name: "−", side: "left" }
        ]
    },

    {
        id: "battery-3v",
        name: "Pile 3V",
        category: "power",
        icon: "🔋",
        color: "#37474f",
        width: 110,
        height: 70,
        voltage: 3,
        resistance: 0.3,
        pins: [
            { id: "positive", name: "+", side: "right" },
            { id: "negative", name: "−", side: "left" }
        ]
    },

    {
        id: "battery-5v",
        name: "Batterie 5V",
        category: "power",
        icon: "🔋",
        color: "#455a64",
        width: 115,
        height: 72,
        voltage: 5,
        resistance: 0.35,
        pins: [
            { id: "positive", name: "+", side: "right" },
            { id: "negative", name: "−", side: "left" }
        ]
    },

    {
        id: "battery-12v",
        name: "Batterie 12V",
        category: "power",
        icon: "🔋",
        color: "#263238",
        width: 125,
        height: 78,
        voltage: 12,
        resistance: 0.6,
        pins: [
            { id: "positive", name: "+", side: "right" },
            { id: "negative", name: "−", side: "left" }
        ]
    },

    {
        id: "dc-supply",
        name: "Alimentation DC",
        category: "power",
        icon: "⚡",
        color: "#37474f",
        width: 150,
        height: 90,
        voltage: 5,
        adjustableVoltage: true,
        pins: [
            { id: "V+", name: "V+", side: "right" },
            { id: "GND", name: "GND", side: "left" }
        ]
    },

    {
        id: "ac-supply",
        name: "Alimentation AC",
        category: "power",
        icon: "∿",
        color: "#455a64",
        width: 150,
        height: 90,
        voltage: 120,
        frequency: 60,
        pins: [
            { id: "L", name: "L", side: "right" },
            { id: "N", name: "N", side: "left" }
        ]
    },

    {
        id: "signal-generator",
        name: "Générateur de signaux",
        category: "power",
        icon: "〰",
        color: "#263238",
        width: 160,
        height: 90,
        voltage: 5,
        frequency: 1000,
        pins: [
            { id: "OUT", name: "OUT", side: "right" },
            { id: "GND", name: "GND", side: "left" }
        ]
    },

    /* =========================================================
       02. RÉSISTANCES
       ========================================================= */

    {
        id: "resistor",
        name: "Résistance",
        category: "resistors",
        icon: "Ω",
        color: "#8d6e63",
        width: 125,
        height: 64,
        resistance: 220,
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "resistor-100",
        name: "Résistance 100 Ω",
        category: "resistors",
        icon: "Ω",
        color: "#8d6e63",
        width: 125,
        height: 64,
        resistance: 100,
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "resistor-220",
        name: "Résistance 220 Ω",
        category: "resistors",
        icon: "Ω",
        color: "#8d6e63",
        width: 125,
        height: 64,
        resistance: 220,
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "resistor-330",
        name: "Résistance 330 Ω",
        category: "resistors",
        icon: "Ω",
        color: "#795548",
        width: 125,
        height: 64,
        resistance: 330,
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "resistor-1k",
        name: "Résistance 1 kΩ",
        category: "resistors",
        icon: "Ω",
        color: "#6d4c41",
        width: 125,
        height: 64,
        resistance: 1000,
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "resistor-10k",
        name: "Résistance 10 kΩ",
        category: "resistors",
        icon: "Ω",
        color: "#5d4037",
        width: 125,
        height: 64,
        resistance: 10000,
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    /* =========================================================
       03. CAPACITORS / INDUCTORS
       ========================================================= */

    {
        id: "capacitor",
        name: "Condensateur",
        category: "capacitors",
        icon: "║",
        color: "#1565c0",
        width: 100,
        height: 76,
        capacitance: "100 µF",
        pins: [
            { id: "positive", name: "+", side: "left" },
            { id: "negative", name: "−", side: "right" }
        ]
    },

    {
        id: "capacitor-10uf",
        name: "Condensateur 10 µF",
        category: "capacitors",
        icon: "║",
        color: "#1976d2",
        width: 100,
        height: 76,
        capacitance: "10 µF",
        pins: [
            { id: "positive", name: "+", side: "left" },
            { id: "negative", name: "−", side: "right" }
        ]
    },

    {
        id: "capacitor-100uf",
        name: "Condensateur 100 µF",
        category: "capacitors",
        icon: "║",
        color: "#1565c0",
        width: 100,
        height: 76,
        capacitance: "100 µF",
        pins: [
            { id: "positive", name: "+", side: "left" },
            { id: "negative", name: "−", side: "right" }
        ]
    },

    {
        id: "capacitor-1000uf",
        name: "Condensateur 1000 µF",
        category: "capacitors",
        icon: "║",
        color: "#0d47a1",
        width: 105,
        height: 80,
        capacitance: "1000 µF",
        pins: [
            { id: "positive", name: "+", side: "left" },
            { id: "negative", name: "−", side: "right" }
        ]
    },

    {
        id: "ceramic-capacitor",
        name: "Condensateur céramique",
        category: "capacitors",
        icon: "C",
        color: "#d4a017",
        width: 95,
        height: 65,
        capacitance: "100 nF",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "inductor",
        name: "Bobine",
        category: "inductors",
        icon: "〰",
        color: "#6a1b9a",
        width: 125,
        height: 64,
        inductance: "10 mH",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    /* =========================================================
       04. DIODES
       ========================================================= */

    {
        id: "diode",
        name: "Diode",
        category: "diodes",
        icon: "▷|",
        color: "#455a64",
        width: 110,
        height: 64,
        voltageDrop: 0.7,
        pins: [
            { id: "anode", name: "A", side: "left" },
            { id: "cathode", name: "K", side: "right" }
        ]
    },

    {
        id: "zener-diode",
        name: "Diode Zener",
        category: "diodes",
        icon: "Z",
        color: "#37474f",
        width: 110,
        height: 64,
        voltageDrop: 5.1,
        zenerVoltage: 5.1,
        pins: [
            { id: "anode", name: "A", side: "left" },
            { id: "cathode", name: "K", side: "right" }
        ]
    },

    {
        id: "schottky-diode",
        name: "Diode Schottky",
        category: "diodes",
        icon: "S",
        color: "#263238",
        width: 110,
        height: 64,
        voltageDrop: 0.3,
        pins: [
            { id: "anode", name: "A", side: "left" },
            { id: "cathode", name: "K", side: "right" }
        ]
    },

    /* =========================================================
       05. LEDS — VARIANTS
       ========================================================= */

    {
        id: "led",
        name: "LED",
        category: "leds",
        icon: "💡",
        color: "#c62828",
        width: 110,
        height: 90,
        voltageDrop: 2,
        current: 0.02,
        state: "off",
        variant: "red",
        pins: [
            { id: "anode", name: "A", side: "left" },
            { id: "cathode", name: "K", side: "right" }
        ]
    },

    {
        id: "led-red",
        name: "LED Rouge",
        category: "leds",
        icon: "🔴",
        color: "#ff1744",
        width: 110,
        height: 90,
        voltageDrop: 2,
        current: 0.02,
        state: "off",
        variant: "red",
        pins: [
            { id: "anode", name: "A", side: "left" },
            { id: "cathode", name: "K", side: "right" }
        ]
    },

    {
        id: "led-green",
        name: "LED Verte",
        category: "leds",
        icon: "🟢",
        color: "#00e676",
        width: 110,
        height: 90,
        voltageDrop: 2.1,
        current: 0.02,
        state: "off",
        variant: "green",
        pins: [
            { id: "anode", name: "A", side: "left" },
            { id: "cathode", name: "K", side: "right" }
        ]
    },

    {
        id: "led-blue",
        name: "LED Bleue",
        category: "leds",
        icon: "🔵",
        color: "#2979ff",
        width: 110,
        height: 90,
        voltageDrop: 3.0,
        current: 0.02,
        state: "off",
        variant: "blue",
        pins: [
            { id: "anode", name: "A", side: "left" },
            { id: "cathode", name: "K", side: "right" }
        ]
    },

    {
        id: "led-yellow",
        name: "LED Jaune",
        category: "leds",
        icon: "🟡",
        color: "#ffd600",
        width: 110,
        height: 90,
        voltageDrop: 2.1,
        current: 0.02,
        state: "off",
        variant: "yellow",
        pins: [
            { id: "anode", name: "A", side: "left" },
            { id: "cathode", name: "K", side: "right" }
        ]
    },

    {
        id: "led-white",
        name: "LED Blanche",
        category: "leds",
        icon: "⚪",
        color: "#f5f7ff",
        width: 110,
        height: 90,
        voltageDrop: 3.2,
        current: 0.02,
        state: "off",
        variant: "white",
        pins: [
            { id: "anode", name: "A", side: "left" },
            { id: "cathode", name: "K", side: "right" }
        ]
    },

    {
        id: "led-orange",
        name: "LED Orange",
        category: "leds",
        icon: "🟠",
        color: "#ff6d00",
        width: 110,
        height: 90,
        voltageDrop: 2.0,
        current: 0.02,
        state: "off",
        variant: "orange",
        pins: [
            { id: "anode", name: "A", side: "left" },
            { id: "cathode", name: "K", side: "right" }
        ]
    },

    {
        id: "led-violet",
        name: "LED Violette",
        category: "leds",
        icon: "🟣",
        color: "#aa00ff",
        width: 110,
        height: 90,
        voltageDrop: 3.2,
        current: 0.02,
        state: "off",
        variant: "violet",
        pins: [
            { id: "anode", name: "A", side: "left" },
            { id: "cathode", name: "K", side: "right" }
        ]
    },

    {
        id: "led-rgb",
        name: "LED RGB",
        category: "leds",
        icon: "🌈",
        color: "#00e5ff",
        width: 115,
        height: 95,
        voltageDrop: 2.5,
        current: 0.02,
        state: "off",
        variant: "rgb",
        pins: [
            { id: "R", name: "R", side: "left" },
            { id: "G", name: "G", side: "left" },
            { id: "B", name: "B", side: "right" },
            { id: "GND", name: "GND", side: "right" }
        ]
    },

    {
        id: "led-rgbw",
        name: "LED RGBW",
        category: "leds",
        icon: "🌈",
        color: "#ffffff",
        width: 120,
        height: 100,
        voltageDrop: 2.8,
        current: 0.02,
        state: "off",
        variant: "rgbw",
        pins: [
            { id: "R", name: "R", side: "left" },
            { id: "G", name: "G", side: "left" },
            { id: "B", name: "B", side: "right" },
            { id: "W", name: "W", side: "right" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    {
        id: "led-ir",
        name: "LED Infrarouge",
        category: "leds",
        icon: "IR",
        color: "#8b0000",
        width: 110,
        height: 90,
        voltageDrop: 1.2,
        current: 0.02,
        state: "off",
        variant: "ir",
        pins: [
            { id: "anode", name: "A", side: "left" },
            { id: "cathode", name: "K", side: "right" }
        ]
    },

    {
        id: "led-uv",
        name: "LED Ultraviolet",
        category: "leds",
        icon: "UV",
        color: "#7c4dff",
        width: 110,
        height: 90,
        voltageDrop: 3.2,
        current: 0.02,
        state: "off",
        variant: "uv",
        pins: [
            { id: "anode", name: "A", side: "left" },
            { id: "cathode", name: "K", side: "right" }
        ]
    },

    /* =========================================================
       06. AMPOULE / INDICATEURS
       ========================================================= */

    {
        id: "bulb",
        name: "Ampoule",
        category: "bulbs",
        icon: "💡",
        color: "#f9a825",
        width: 115,
        height: 95,
        voltageDrop: 3,
        current: 0.1,
        state: "off",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "lamp",
        name: "Lampe",
        category: "bulbs",
        icon: "💡",
        color: "#ffb300",
        width: 120,
        height: 95,
        voltageDrop: 3,
        current: 0.1,
        state: "off",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    /* =========================================================
       07. TRANSISTORS / MOSFET
       ========================================================= */

    {
        id: "transistor",
        name: "Transistor NPN",
        category: "transistors",
        icon: "NPN",
        color: "#263238",
        width: 120,
        height: 90,
        transistorType: "NPN",
        pins: [
            { id: "B", name: "B", side: "left" },
            { id: "C", name: "C", side: "right" },
            { id: "E", name: "E", side: "bottom" }
        ]
    },

    {
        id: "transistor-pnp",
        name: "Transistor PNP",
        category: "transistors",
        icon: "PNP",
        color: "#37474f",
        width: 120,
        height: 90,
        transistorType: "PNP",
        pins: [
            { id: "B", name: "B", side: "left" },
            { id: "C", name: "C", side: "right" },
            { id: "E", name: "E", side: "bottom" }
        ]
    },

    {
        id: "mosfet",
        name: "MOSFET",
        category: "mosfet",
        icon: "MOS",
        color: "#37474f",
        width: 120,
        height: 90,
        pins: [
            { id: "G", name: "G", side: "left" },
            { id: "D", name: "D", side: "right" },
            { id: "S", name: "S", side: "bottom" }
        ]
    },

    {
        id: "mosfet-n",
        name: "MOSFET N-Channel",
        category: "mosfet",
        icon: "N-MOS",
        color: "#263238",
        width: 125,
        height: 90,
        mosfetType: "N",
        pins: [
            { id: "G", name: "G", side: "left" },
            { id: "D", name: "D", side: "right" },
            { id: "S", name: "S", side: "bottom" }
        ]
    },

    {
        id: "mosfet-p",
        name: "MOSFET P-Channel",
        category: "mosfet",
        icon: "P-MOS",
        color: "#455a64",
        width: 125,
        height: 90,
        mosfetType: "P",
        pins: [
            { id: "G", name: "G", side: "left" },
            { id: "D", name: "D", side: "right" },
            { id: "S", name: "S", side: "bottom" }
        ]
    },

    /* =========================================================
       08. RELAIS / INTERRUPTEURS
       ========================================================= */

    {
        id: "relay",
        name: "Relais",
        category: "relays",
        icon: "REL",
        color: "#5d4037",
        width: 135,
        height: 90,
        state: "off",
        pins: [
            { id: "coil+", name: "+", side: "left" },
            { id: "coil-", name: "−", side: "left" },
            { id: "COM", name: "COM", side: "right" },
            { id: "NO", name: "NO", side: "right" },
            { id: "NC", name: "NC", side: "right" }
        ]
    },

    {
        id: "relay-2ch",
        name: "Module Relais 2 Canaux",
        category: "relays",
        icon: "REL2",
        color: "#4e342e",
        width: 160,
        height: 105,
        state: "off",
        channels: 2,
        pins: [
            { id: "VCC", name: "VCC", side: "top" },
            { id: "GND", name: "GND", side: "bottom" },
            { id: "IN1", name: "IN1", side: "left" },
            { id: "IN2", name: "IN2", side: "left" },
            { id: "COM1", name: "COM1", side: "right" },
            { id: "NO1", name: "NO1", side: "right" },
            { id: "COM2", name: "COM2", side: "right" },
            { id: "NO2", name: "NO2", side: "right" }
        ]
    },

    {
        id: "switch",
        name: "Interrupteur",
        category: "switches",
        icon: "⏻",
        color: "#455a64",
        width: 115,
        height: 70,
        state: "open",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "push-button",
        name: "Bouton poussoir",
        category: "buttons",
        icon: "●",
        color: "#c62828",
        width: 120,
        height: 80,
        state: "released",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "push-button-no",
        name: "Bouton NO",
        category: "buttons",
        icon: "NO",
        color: "#d32f2f",
        width: 120,
        height: 80,
        state: "released",
        contactType: "NO",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "push-button-nc",
        name: "Bouton NC",
        category: "buttons",
        icon: "NC",
        color: "#7b1fa2",
        width: 120,
        height: 80,
        state: "released",
        contactType: "NC",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    /* =========================================================
       09. POTENTIOMÈTRES
       ========================================================= */

    {
        id: "potentiometer",
        name: "Potentiomètre",
        category: "potentiometers",
        icon: "◉",
        color: "#1565c0",
        width: 125,
        height: 85,
        value: 50,
        resistance: 10000,
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "W", name: "W", side: "top" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "potentiometer-10k",
        name: "Potentiomètre 10 kΩ",
        category: "potentiometers",
        icon: "◉",
        color: "#1565c0",
        width: 125,
        height: 85,
        value: 50,
        resistance: 10000,
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "W", name: "W", side: "top" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    /* =========================================================
       10. PROTECTION
       ========================================================= */

    {
        id: "fuse",
        name: "Fusible",
        category: "fuses",
        icon: "▬",
        color: "#6d4c41",
        width: 120,
        height: 60,
        state: "good",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "fuse-1a",
        name: "Fusible 1 A",
        category: "fuses",
        icon: "▬",
        color: "#795548",
        width: 120,
        height: 60,
        state: "good",
        currentRating: 1,
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    /* =========================================================
       11. TRANSFORMATEUR / REDRESSEMENT / RÉGULATION
       ========================================================= */

    {
        id: "transformer",
        name: "Transformateur",
        category: "transformers",
        icon: "ΩΩ",
        color: "#4e342e",
        width: 145,
        height: 95,
        pins: [
            { id: "P1", name: "P1", side: "left" },
            { id: "P2", name: "P2", side: "left" },
            { id: "S1", name: "S1", side: "right" },
            { id: "S2", name: "S2", side: "right" }
        ]
    },

    {
        id: "rectifier",
        name: "Pont redresseur",
        category: "rectifiers",
        icon: "▱",
        color: "#37474f",
        width: 125,
        height: 85,
        pins: [
            { id: "AC1", name: "~", side: "left" },
            { id: "AC2", name: "~", side: "left" },
            { id: "PLUS", name: "+", side: "right" },
            { id: "MINUS", name: "−", side: "right" }
        ]
    },

    {
        id: "regulator",
        name: "Régulateur 5V",
        category: "regulators",
        icon: "REG",
        color: "#283593",
        width: 130,
        height: 80,
        outputVoltage: 5,
        pins: [
            { id: "IN", name: "IN", side: "left" },
            { id: "GND", name: "GND", side: "bottom" },
            { id: "OUT", name: "OUT", side: "right" }
        ]
    },

    {
        id: "regulator-3v3",
        name: "Régulateur 3,3V",
        category: "regulators",
        icon: "REG",
        color: "#303f9f",
        width: 130,
        height: 80,
        outputVoltage: 3.3,
        pins: [
            { id: "IN", name: "IN", side: "left" },
            { id: "GND", name: "GND", side: "bottom" },
            { id: "OUT", name: "OUT", side: "right" }
        ]
    },

    /* =========================================================
       12. AMPLIFICATION / IC / LOGIQUE
       ========================================================= */

    {
        id: "opamp",
        name: "Amplificateur opérationnel",
        category: "opamps",
        icon: "▷",
        color: "#4527a0",
        width: 125,
        height: 90,
        pins: [
            { id: "IN-", name: "−", side: "left" },
            { id: "IN+", name: "+", side: "left" },
            { id: "V+", name: "V+", side: "top" },
            { id: "V-", name: "V-", side: "bottom" },
            { id: "OUT", name: "OUT", side: "right" }
        ]
    },

    {
        id: "ic",
        name: "Circuit intégré",
        category: "ics",
        icon: "IC",
        color: "#212121",
        width: 145,
        height: 95,
        pins: [
            { id: "1", name: "1", side: "left" },
            { id: "2", name: "2", side: "left" },
            { id: "3", name: "3", side: "left" },
            { id: "4", name: "4", side: "left" },
            { id: "5", name: "5", side: "right" },
            { id: "6", name: "6", side: "right" },
            { id: "7", name: "7", side: "right" },
            { id: "8", name: "8", side: "right" }
        ]
    },

    {
        id: "ic-555",
        name: "Timer NE555",
        category: "ics",
        icon: "555",
        color: "#263238",
        width: 145,
        height: 100,
        pins: [
            { id: "GND", name: "GND", side: "left" },
            { id: "TRIG", name: "TRIG", side: "left" },
            { id: "OUT", name: "OUT", side: "right" },
            { id: "RESET", name: "RESET", side: "right" },
            { id: "CTRL", name: "CTRL", side: "right" },
            { id: "THR", name: "THR", side: "left" },
            { id: "DIS", name: "DIS", side: "left" },
            { id: "VCC", name: "VCC", side: "top" }
        ]
    },

    {
        id: "logic-gate",
        name: "Porte logique AND",
        category: "logic",
        icon: "AND",
        color: "#00838f",
        width: 135,
        height: 90,
        gateType: "AND",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "left" },
            { id: "Y", name: "Y", side: "right" }
        ]
    },

    {
        id: "logic-gate-or",
        name: "Porte logique OR",
        category: "logic",
        icon: "OR",
        color: "#00695c",
        width: 135,
        height: 90,
        gateType: "OR",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "left" },
            { id: "Y", name: "Y", side: "right" }
        ]
    },

    {
        id: "logic-gate-not",
        name: "Porte logique NOT",
        category: "logic",
        icon: "NOT",
        color: "#00796b",
        width: 125,
        height: 80,
        gateType: "NOT",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "Y", name: "Y", side: "right" }
        ]
    },

    {
        id: "logic-gate-xor",
        name: "Porte logique XOR",
        category: "logic",
        icon: "XOR",
        color: "#00838f",
        width: 140,
        height: 90,
        gateType: "XOR",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "left" },
            { id: "Y", name: "Y", side: "right" }
        ]
    },

    /* =========================================================
       13. CONTRÔLEURS
       ========================================================= */

    {
        id: "arduino-uno",
        name: "Arduino UNO",
        category: "controllers",
        icon: "UNO",
        color: "#00695c",
        width: 210,
        height: 145,
        controller: "arduino",
        pins: [
            { id: "D0", name: "D0", side: "right" },
            { id: "D1", name: "D1", side: "right" },
            { id: "D2", name: "D2", side: "right" },
            { id: "D3", name: "D3", side: "right" },
            { id: "D4", name: "D4", side: "right" },
            { id: "D5", name: "D5", side: "right" },
            { id: "D6", name: "D6", side: "right" },
            { id: "D7", name: "D7", side: "right" },
            { id: "D8", name: "D8", side: "right" },
            { id: "D9", name: "D9", side: "right" },
            { id: "D10", name: "D10", side: "right" },
            { id: "D11", name: "D11", side: "right" },
            { id: "D12", name: "D12", side: "right" },
            { id: "D13", name: "D13", side: "right" },
            { id: "A0", name: "A0", side: "left" },
            { id: "A1", name: "A1", side: "left" },
            { id: "A2", name: "A2", side: "left" },
            { id: "A3", name: "A3", side: "left" },
            { id: "A4", name: "A4", side: "left" },
            { id: "A5", name: "A5", side: "left" },
            { id: "5V", name: "5V", side: "top" },
            { id: "3V3", name: "3V3", side: "top" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    {
        id: "arduino-nano",
        name: "Arduino Nano",
        category: "controllers",
        icon: "NANO",
        color: "#00695c",
        width: 180,
        height: 115,
        controller: "arduino",
        pins: [
            { id: "D2", name: "D2", side: "right" },
            { id: "D3", name: "D3", side: "right" },
            { id: "D5", name: "D5", side: "right" },
            { id: "D6", name: "D6", side: "right" },
            { id: "D9", name: "D9", side: "right" },
            { id: "D10", name: "D10", side: "right" },
            { id: "D11", name: "D11", side: "right" },
            { id: "D12", name: "D12", side: "right" },
            { id: "D13", name: "D13", side: "right" },
            { id: "A0", name: "A0", side: "left" },
            { id: "A1", name: "A1", side: "left" },
            { id: "A2", name: "A2", side: "left" },
            { id: "A3", name: "A3", side: "left" },
            { id: "A4", name: "A4", side: "left" },
            { id: "A5", name: "A5", side: "left" },
            { id: "5V", name: "5V", side: "top" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    {
        id: "arduino-mega",
        name: "Arduino Mega",
        category: "controllers",
        icon: "MEGA",
        color: "#00695c",
        width: 230,
        height: 150,
        controller: "arduino",
        pins: [
            { id: "D2", name: "D2", side: "right" },
            { id: "D3", name: "D3", side: "right" },
            { id: "D4", name: "D4", side: "right" },
            { id: "D5", name: "D5", side: "right" },
            { id: "D6", name: "D6", side: "right" },
            { id: "D7", name: "D7", side: "right" },
            { id: "D8", name: "D8", side: "right" },
            { id: "D9", name: "D9", side: "right" },
            { id: "D10", name: "D10", side: "right" },
            { id: "D11", name: "D11", side: "right" },
            { id: "D12", name: "D12", side: "right" },
            { id: "D13", name: "D13", side: "right" },
            { id: "5V", name: "5V", side: "top" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    {
        id: "esp32",
        name: "ESP32",
        category: "controllers",
        icon: "ESP32",
        color: "#263238",
        width: 195,
        height: 125,
        controller: "esp32",
        pins: [
            { id: "GPIO2", name: "GPIO2", side: "right" },
            { id: "GPIO4", name: "GPIO4", side: "right" },
            { id: "GPIO5", name: "GPIO5", side: "right" },
            { id: "GPIO18", name: "GPIO18", side: "right" },
            { id: "GPIO19", name: "GPIO19", side: "right" },
            { id: "GPIO21", name: "GPIO21", side: "right" },
            { id: "GPIO22", name: "GPIO22", side: "right" },
            { id: "GPIO23", name: "GPIO23", side: "right" },
            { id: "3V3", name: "3V3", side: "top" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    {
        id: "esp8266",
        name: "ESP8266",
        category: "controllers",
        icon: "ESP8266",
        color: "#37474f",
        width: 185,
        height: 120,
        controller: "esp8266",
        pins: [
            { id: "D0", name: "D0", side: "right" },
            { id: "D1", name: "D1", side: "right" },
            { id: "D2", name: "D2", side: "right" },
            { id: "D3", name: "D3", side: "right" },
            { id: "D4", name: "D4", side: "right" },
            { id: "D5", name: "D5", side: "right" },
            { id: "D6", name: "D6", side: "right" },
            { id: "D7", name: "D7", side: "right" },
            { id: "3V3", name: "3V3", side: "top" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    {
        id: "raspberry-pi",
        name: "Raspberry Pi",
        category: "controllers",
        icon: "PI",
        color: "#6a1b9a",
        width: 215,
        height: 135,
        controller: "raspberry",
        pins: [
            { id: "GPIO17", name: "GPIO17", side: "right" },
            { id: "GPIO18", name: "GPIO18", side: "right" },
            { id: "GPIO27", name: "GPIO27", side: "right" },
            { id: "GPIO22", name: "GPIO22", side: "right" },
            { id: "3V3", name: "3V3", side: "top" },
            { id: "5V", name: "5V", side: "top" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    /* =========================================================
       14. ROBOTIQUE — MOTEURS
       ========================================================= */

    {
        id: "servo",
        name: "Servo moteur",
        category: "robotics",
        icon: "SERVO",
        color: "#1565c0",
        width: 145,
        height: 110,
        state: "0",
        angle: 0,
        pins: [
            { id: "SIG", name: "SIG", side: "right" },
            { id: "VCC", name: "VCC", side: "top" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    {
        id: "micro-servo",
        name: "Micro Servo SG90",
        category: "robotics",
        icon: "SERVO",
        color: "#1976d2",
        width: 140,
        height: 105,
        state: "0",
        angle: 0,
        pins: [
            { id: "SIG", name: "SIG", side: "right" },
            { id: "VCC", name: "VCC", side: "top" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    {
        id: "dc-motor",
        name: "Moteur DC",
        category: "robotics",
        icon: "M",
        color: "#455a64",
        width: 130,
        height: 95,
        state: "off",
        speed: 0,
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "stepper-motor",
        name: "Moteur pas à pas",
        category: "robotics",
        icon: "STEP",
        color: "#37474f",
        width: 145,
        height: 105,
        state: "off",
        step: 0,
        pins: [
            { id: "A+", name: "A+", side: "left" },
            { id: "A-", name: "A-", side: "left" },
            { id: "B+", name: "B+", side: "right" },
            { id: "B-", name: "B-", side: "right" }
        ]
    },

    /* =========================================================
       15. AUDIO
       ========================================================= */

    {
        id: "buzzer",
        name: "Buzzer",
        category: "robotics",
        icon: "🔊",
        color: "#37474f",
        width: 115,
        height: 85,
        state: "off",
        frequency: 0,
        pins: [
            { id: "SIG", name: "SIG", side: "right" },
            { id: "GND", name: "GND", side: "left" }
        ]
    },

    {
        id: "speaker",
        name: "Haut-parleur",
        category: "robotics",
        icon: "🔊",
        color: "#263238",
        width: 125,
        height: 95,
        state: "off",
        frequency: 0,
        volume: 0,
        pins: [
            { id: "IN", name: "IN", side: "right" },
            { id: "GND", name: "GND", side: "left" }
        ]
    },

    /* =========================================================
       16. CAPTEURS
       ========================================================= */

    {
        id: "hc-sr04",
        name: "Capteur Ultrason HC-SR04",
        category: "robotics",
        icon: "US",
        color: "#0277bd",
        width: 165,
        height: 105,
        distance: 25,
        pins: [
            { id: "VCC", name: "VCC", side: "top" },
            { id: "TRIG", name: "TRIG", side: "right" },
            { id: "ECHO", name: "ECHO", side: "right" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    {
        id: "ldr",
        name: "Capteur LDR",
        category: "robotics",
        icon: "☀",
        color: "#ef6c00",
        width: 120,
        height: 85,
        value: 500,
        resistance: 10000,
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "ir-sensor",
        name: "Capteur infrarouge",
        category: "robotics",
        icon: "IR",
        color: "#6d4c41",
        width: 130,
        height: 85,
        value: 0,
        pins: [
            { id: "VCC", name: "VCC", side: "top" },
            { id: "OUT", name: "OUT", side: "right" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    {
        id: "pir-sensor",
        name: "Capteur de mouvement PIR",
        category: "robotics",
        icon: "PIR",
        color: "#5e35b1",
        width: 145,
        height: 95,
        detected: false,
        pins: [
            { id: "VCC", name: "VCC", side: "top" },
            { id: "OUT", name: "OUT", side: "right" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    {
        id: "temperature-sensor",
        name: "Capteur de température",
        category: "robotics",
        icon: "TEMP",
        color: "#e65100",
        width: 135,
        height: 90,
        temperature: 25,
        pins: [
            { id: "VCC", name: "VCC", side: "top" },
            { id: "OUT", name: "OUT", side: "right" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    /* =========================================================
       17. AFFICHAGE / INTERFACE
       ========================================================= */

    {
        id: "lcd",
        name: "LCD 16x2",
        category: "robotics",
        icon: "LCD",
        color: "#2e7d32",
        width: 175,
        height: 105,
        displayText: "",
        pins: [
            { id: "VCC", name: "VCC", side: "top" },
            { id: "GND", name: "GND", side: "bottom" },
            { id: "SDA", name: "SDA", side: "left" },
            { id: "SCL", name: "SCL", side: "right" }
        ]
    },

    {
        id: "lcd-i2c",
        name: "LCD 16x2 I2C",
        category: "robotics",
        icon: "LCD",
        color: "#388e3c",
        width: 175,
        height: 105,
        displayText: "",
        pins: [
            { id: "VCC", name: "VCC", side: "top" },
            { id: "GND", name: "GND", side: "bottom" },
            { id: "SDA", name: "SDA", side: "left" },
            { id: "SCL", name: "SCL", side: "right" }
        ]
    },

    {
        id: "seven-segment",
        name: "Afficheur 7 segments",
        category: "robotics",
        icon: "8",
        color: "#c62828",
        width: 125,
        height: 105,
        displayValue: "0",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "left" },
            { id: "C", name: "C", side: "left" },
            { id: "D", name: "D", side: "right" },
            { id: "E", name: "E", side: "right" },
            { id: "F", name: "F", side: "right" },
            { id: "G", name: "G", side: "right" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    {
        id: "joystick",
        name: "Joystick",
        category: "robotics",
        icon: "◉",
        color: "#5e35b1",
        width: 125,
        height: 110,
        xValue: 512,
        yValue: 512,
        pins: [
            { id: "VCC", name: "VCC", side: "top" },
            { id: "GND", name: "GND", side: "bottom" },
            { id: "VRX", name: "VRX", side: "left" },
            { id: "VRY", name: "VRY", side: "right" }
        ]
    },

    /* =========================================================
       18. BREADBOARD / PCB / PROTOTYPAGE
       ========================================================= */

    {
        id: "breadboard",
        name: "Breadboard",
        category: "breadboards",
        icon: "BOARD",
        color: "#eceff1",
        width: 250,
        height: 145,
        rows: 30,
        columns: 10,
        pins: [
            { id: "VCC", name: "VCC", side: "top" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    {
        id: "mini-breadboard",
        name: "Mini Breadboard",
        category: "breadboards",
        icon: "MINI",
        color: "#f5f5f5",
        width: 180,
        height: 115,
        rows: 17,
        columns: 10,
        pins: [
            { id: "VCC", name: "VCC", side: "top" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    {
        id: "protoboard",
        name: "Protoboard",
        category: "breadboards",
        icon: "PROTO",
        color: "#d7ccc8",
        width: 220,
        height: 135,
        pins: [
            { id: "VCC", name: "VCC", side: "top" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    {
        id: "pcb",
        name: "Carte PCB",
        category: "pcb",
        icon: "PCB",
        color: "#1b5e20",
        width: 230,
        height: 145,
        pins: [
            { id: "VCC", name: "VCC", side: "top" },
            { id: "GND", name: "GND", side: "bottom" },
            { id: "IN", name: "IN", side: "left" },
            { id: "OUT", name: "OUT", side: "right" }
        ]
    },

    {
        id: "terminal-board",
        name: "Terminal Board",
        category: "terminals",
        icon: "TERM",
        color: "#424242",
        width: 155,
        height: 95,
        pins: [
            { id: "1", name: "1", side: "left" },
            { id: "2", name: "2", side: "left" },
            { id: "3", name: "3", side: "right" },
            { id: "4", name: "4", side: "right" }
        ]
    },

    /* =========================================================
       19. FILS / BORNES
       ========================================================= */

    {
        id: "wire",
        name: "Fil de connexion",
        category: "wires",
        icon: "━",
        color: "#263238",
        width: 130,
        height: 45,
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "wire-red",
        name: "Fil Rouge",
        category: "wires",
        icon: "━",
        color: "#d32f2f",
        width: 130,
        height: 45,
        wireColor: "#d32f2f",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "wire-black",
        name: "Fil Noir",
        category: "wires",
        icon: "━",
        color: "#212121",
        width: 130,
        height: 45,
        wireColor: "#212121",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "wire-green",
        name: "Fil Vert",
        category: "wires",
        icon: "━",
        color: "#2e7d32",
        width: 130,
        height: 45,
        wireColor: "#2e7d32",
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "terminal",
        name: "Borne",
        category: "terminals",
        icon: "●",
        color: "#424242",
        width: 95,
        height: 70,
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    /* =========================================================
       20. INSTRUMENTS
       ========================================================= */

    {
        id: "multimeter",
        name: "Multimètre",
        category: "instruments",
        icon: "MM",
        color: "#263238",
        width: 145,
        height: 180,
        instrument: "multimeter",
        mode: "voltage",
        value: 0,
        pins: [
            { id: "COM", name: "COM", side: "bottom" },
            { id: "VΩ", name: "VΩ", side: "top" }
        ]
    },

    {
        id: "oscilloscope",
        name: "Oscilloscope",
        category: "instruments",
        icon: "OSC",
        color: "#263238",
        width: 175,
        height: 125,
        instrument: "oscilloscope",
        frequency: 0,
        voltage: 0,
        pins: [
            { id: "CH1", name: "CH1", side: "left" },
            { id: "GND", name: "GND", side: "bottom" }
        ]
    },

    /* =========================================================
       21. COMPOSANTS SUPPLÉMENTAIRES
       ========================================================= */

    {
        id: "crystal",
        name: "Quartz",
        category: "oscillators",
        icon: "XTAL",
        color: "#78909c",
        width: 105,
        height: 65,
        frequency: 16000000,
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "thermistor",
        name: "Thermistance NTC",
        category: "sensors",
        icon: "NTC",
        color: "#ef6c00",
        width: 115,
        height: 70,
        resistance: 10000,
        temperature: 25,
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    },

    {
        id: "photoresistor",
        name: "Photorésistance",
        category: "sensors",
        icon: "LDR",
        color: "#f57c00",
        width: 115,
        height: 75,
        resistance: 5000,
        value: 500,
        pins: [
            { id: "A", name: "A", side: "left" },
            { id: "B", name: "B", side: "right" }
        ]
    }

];

/* ============================================================
   COMPONENT DEFINITION ACCESS
   ============================================================ */

function getComponentDefinition(type) {
    return COMPONENTS.find(component => component.id === type) || null;
}



    /* ============================================================
       06. CODE LIBRARY
    ============================================================ */

    const CODE_LIBRARY = [
        {
            id: "arduino-led-on",
            title: "Allumer une LED",
            level: "beginner",
            category: "Arduino",
            description: "Allume une LED connectée à la broche D13.",
            requiredTypes: ["arduino-uno", "led"],
            preferredPins: ["D13"],
            tags: ["led", "arduino", "digitalWrite"],
            code:
`void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
}`,
            actions: [
                { type: "pinMode", pin: "13", mode: "OUTPUT" },
                { type: "digitalWrite", pin: "13", value: 1 }
            ]
        },
        {
            id: "arduino-led-blink",
            title: "Faire clignoter une LED",
            level: "beginner",
            category: "Arduino",
            description: "Fait clignoter la LED sur D13.",
            requiredTypes: ["arduino-uno", "led"],
            preferredPins: ["D13"],
            tags: ["led", "blink", "arduino"],
            code:
`void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
            actions: [
                { type: "pinMode", pin: "13", mode: "OUTPUT" },
                { type: "digitalWrite", pin: "13", value: 1 },
                { type: "delay", value: 1000 },
                { type: "digitalWrite", pin: "13", value: 0 },
                { type: "delay", value: 1000 }
            ]
        },
        {
            id: "arduino-button-led",
            title: "Bouton → LED",
            level: "beginner",
            category: "Arduino",
            description: "Allume la LED quand le bouton est activé.",
            requiredTypes: ["arduino-uno", "push-button", "led"],
            preferredPins: ["2", "13"],
            tags: ["button", "led", "digitalRead"],
            code:
`void setup() {
  pinMode(2, INPUT);
  pinMode(13, OUTPUT);
}

void loop() {
  if (digitalRead(2) == HIGH) {
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
}`,
            actions: [
                { type: "pinMode", pin: "2", mode: "INPUT" },
                { type: "pinMode", pin: "13", mode: "OUTPUT" }
            ]
        },
        {
            id: "arduino-pwm-led",
            title: "Luminosité LED PWM",
            level: "intermediate",
            category: "Arduino",
            description: "Contrôle la luminosité d'une LED avec PWM.",
            requiredTypes: ["arduino-uno", "led"],
            preferredPins: ["9"],
            tags: ["pwm", "analogWrite", "led"],
            code:
`void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  analogWrite(9, 180);
}`,
            actions: [
                { type: "pinMode", pin: "9", mode: "OUTPUT" },
                { type: "analogWrite", pin: "9", value: 180 }
            ]
        },
        {
            id: "arduino-buzzer",
            title: "Faire sonner un buzzer",
            level: "beginner",
            category: "Arduino",
            description: "Produit une tonalité de 1000 Hz.",
            requiredTypes: ["arduino-uno", "buzzer"],
            preferredPins: ["8"],
            tags: ["buzzer", "tone"],
            code:
`void setup() {
}

void loop() {
  tone(8, 1000);
}`,
            actions: [
                { type: "tone", pin: "8", frequency: 1000 }
            ]
        },
        {
            id: "arduino-servo",
            title: "Positionner un servo à 90°",
            level: "intermediate",
            category: "Robotique",
            description: "Commande un servo connecté à D9.",
            requiredTypes: ["arduino-uno", "servo"],
            preferredPins: ["9"],
            tags: ["servo", "robotique"],
            code:
`#include <Servo.h>

Servo monServo;

void setup() {
  monServo.attach(9);
}

void loop() {
  monServo.write(90);
}`,
            actions: [
                { type: "servoAttach", pin: "9" },
                { type: "servoWrite", pin: "9", angle: 90 }
            ]
        },
        {
            id: "arduino-motor",
            title: "Activer un moteur DC",
            level: "intermediate",
            category: "Robotique",
            description: "Active un moteur via une sortie digitale.",
            requiredTypes: ["arduino-uno", "dc-motor"],
            preferredPins: ["5"],
            tags: ["motor", "robotique"],
            code:
`void setup() {
  pinMode(5, OUTPUT);
}

void loop() {
  digitalWrite(5, HIGH);
}`,
            actions: [
                { type: "pinMode", pin: "5", mode: "OUTPUT" },
                { type: "digitalWrite", pin: "5", value: 1 }
            ]
        },
        {
            id: "arduino-ultrasonic",
            title: "Lire un capteur ultrason",
            level: "intermediate",
            category: "Robotique",
            description: "Configure TRIG sur D9 et ECHO sur D10.",
            requiredTypes: ["arduino-uno", "hc-sr04"],
            preferredPins: ["9", "10"],
            tags: ["ultrason", "hc-sr04", "robotique"],
            code:
`const int trigPin = 9;
const int echoPin = 10;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  digitalWrite(trigPin, LOW);
  digitalWrite(trigPin, HIGH);
  digitalWrite(trigPin, LOW);

  long distance = pulseIn(echoPin, HIGH);
}`,
            actions: [
                { type: "pinMode", pin: "9", mode: "OUTPUT" },
                { type: "pinMode", pin: "10", mode: "INPUT" }
            ]
        },
        {
            id: "arduino-potentiometer",
            title: "Lire un potentiomètre",
            level: "beginner",
            category: "Arduino",
            description: "Lit une valeur analogique sur A0.",
            requiredTypes: ["arduino-uno", "potentiometer"],
            preferredPins: ["A0"],
            tags: ["potentiometer", "analogRead"],
            code:
`void setup() {
}

void loop() {
  int valeur = analogRead(A0);
}`,
            actions: [
                { type: "analogRead", pin: "A0" }
            ]
        },
        {
            id: "arduino-ldr",
            title: "Lire une LDR",
            level: "intermediate",
            category: "Robotique",
            description: "Lit un capteur de lumière sur A0.",
            requiredTypes: ["arduino-uno", "ldr"],
            preferredPins: ["A0"],
            tags: ["ldr", "sensor", "analogRead"],
            code:
`void setup() {
}

void loop() {
  int lumiere = analogRead(A0);
}`,
            actions: [
                { type: "analogRead", pin: "A0" }
            ]
        },
        {
            id: "arduino-relay",
            title: "Commander un relais",
            level: "intermediate",
            category: "Électronique",
            description: "Active un relais connecté à D7.",
            requiredTypes: ["arduino-uno", "relay"],
            preferredPins: ["7"],
            tags: ["relay", "digitalWrite"],
            code:
`void setup() {
  pinMode(7, OUTPUT);
}

void loop() {
  digitalWrite(7, HIGH);
}`,
            actions: [
                { type: "pinMode", pin: "7", mode: "OUTPUT" },
                { type: "digitalWrite", pin: "7", value: 1 }
            ]
        },
        {
            id: "arduino-expert-multi",
            title: "Deux sorties indépendantes",
            level: "expert",
            category: "Arduino",
            description: "Commande deux sorties séparément.",
            requiredTypes: ["arduino-uno", "led"],
            preferredPins: ["12", "13"],
            tags: ["multi-output", "arduino"],
            code:
`void setup() {
  pinMode(12, OUTPUT);
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(12, HIGH);
  digitalWrite(13, LOW);
}`,
            actions: [
                { type: "pinMode", pin: "12", mode: "OUTPUT" },
                { type: "pinMode", pin: "13", mode: "OUTPUT" },
                { type: "digitalWrite", pin: "12", value: 1 },
                { type: "digitalWrite", pin: "13", value: 0 }
            ]
        }
    ];

    /* ============================================================
       07. MISSIONS
    ============================================================ */

    const MISSIONS = [
        {
            id: "mission-led",
            level: "beginner",
            title: "Allumer une LED avec Arduino",
            description:
                "Réalisez un montage Arduino UNO + résistance + LED puis utilisez le code correspondant.",
            requirements: [
                "Arduino UNO",
                "LED",
                "Résistance",
                "LED commandée sur D13"
            ],
            requiredTypes: ["arduino-uno", "led", "resistor"],
            codeId: "arduino-led-on"
        },
        {
            id: "mission-button",
            level: "beginner",
            title: "Commander une LED avec un bouton",
            description:
                "Utilisez un bouton poussoir pour commander une LED.",
            requirements: [
                "Arduino UNO",
                "Bouton poussoir",
                "LED",
                "Résistance"
            ],
            requiredTypes: ["arduino-uno", "push-button", "led", "resistor"],
            codeId: "arduino-button-led"
        },
        {
            id: "mission-buzzer",
            level: "intermediate",
            title: "Commander un buzzer",
            description:
                "Réalisez un montage Arduino avec buzzer puis exécutez un programme sonore.",
            requirements: [
                "Arduino UNO",
                "Buzzer"
            ],
            requiredTypes: ["arduino-uno", "buzzer"],
            codeId: "arduino-buzzer"
        },
        {
            id: "mission-servo",
            level: "intermediate",
            title: "Positionner un servo moteur",
            description:
                "Connectez un servo à Arduino et commandez une position de 90 degrés.",
            requirements: [
                "Arduino UNO",
                "Servo moteur"
            ],
            requiredTypes: ["arduino-uno", "servo"],
            codeId: "arduino-servo"
        },
        {
            id: "mission-ultrasonic",
            level: "expert",
            title: "Capteur ultrason",
            description:
                "Connectez un HC-SR04 à Arduino et préparez ses broches TRIG/ECHO.",
            requirements: [
                "Arduino UNO",
                "HC-SR04"
            ],
            requiredTypes: ["arduino-uno", "hc-sr04"],
            codeId: "arduino-ultrasonic"
        }
    ];

    /* ============================================================
       08. DYNAMIC COMPONENT LIBRARY
    ============================================================ */

    let dynamicLibraryCategoriesCreated = false;

    function ensureDynamicLibraryCategories() {
        if (!dom.componentCategories || dynamicLibraryCategoriesCreated) return;

        const extraCategories = [
            ["all", "Tous"],
            ["controllers", "Contrôleurs"],
            ["robotics", "Robotique"]
        ];

        extraCategories.reverse().forEach(([value, label]) => {
            if (dom.componentCategories.querySelector(
                `[data-category="${value}"]`
            )) {
                return;
            }

            const button = document.createElement("button");
            button.type = "button";
            button.className = "component-category-btn";
            button.dataset.category = value;
            button.textContent = label;

            dom.componentCategories.prepend(button);
        });

        dynamicLibraryCategoriesCreated = true;
    }

    function renderComponentLibrary() {
        if (!dom.componentLibraryGrid) return;

        ensureDynamicLibraryCategories();

        const search = normalizeText(dom.componentSearchInput?.value || "");
        let components = COMPONENTS.slice();

        if (state.currentLibraryCategory !== "all") {
            components = components.filter(component =>
                component.category === state.currentLibraryCategory
            );
        }

        if (search) {
            components = components.filter(component => {
                const text = normalizeText(
                    `${component.name} ${component.category} ${component.id}`
                );

                return text.includes(search);
            });
        }

        dom.componentLibraryGrid.innerHTML = "";

        if (!components.length) {
            dom.componentLibraryGrid.innerHTML = `
                <div class="library-empty-state">
                    Aucun composant trouvé.
                </div>
            `;
            return;
        }

        components.forEach(definition => {
            const card = document.createElement("article");
            card.className = "component-library-card";
            card.dataset.componentType = definition.id;
            card.dataset.category = definition.category;

            card.innerHTML = `
                <div class="component-library-visual">
                    ${createComponentVisualHTML(definition, true)}
                </div>

                <div class="component-library-name">
                    ${escapeHTML(definition.name)}
                </div>

                <div class="component-library-category">
                    ${escapeHTML(definition.category)}
                </div>

                <button
                    class="component-add-btn"
                    type="button"
                    data-add-component="${escapeHTML(definition.id)}"
                >
                    ＋ AJOUTER
                </button>
            `;

            card.addEventListener("click", event => {
                if (event.target.closest("[data-add-component]")) {
                    return;
                }

                state.selectedComponentType = definition.id;
                openComponentDetails(definition.id);
            });

            dom.componentLibraryGrid.appendChild(card);
        });
    }

    function openComponentLibrary() {
        closeAllPanelsExcept("componentLibraryPanel");

        dom.componentLibraryPanel?.classList.remove("hidden");
        dom.componentLibraryPanel?.setAttribute("aria-hidden", "false");

        if (dom.libraryBtn) {
            dom.libraryBtn.setAttribute("aria-expanded", "true");
        }

        renderComponentLibrary();
    }

    function closeComponentLibrary() {
        dom.componentLibraryPanel?.classList.add("hidden");
        dom.componentLibraryPanel?.setAttribute("aria-hidden", "true");

        if (dom.libraryBtn) {
            dom.libraryBtn.setAttribute("aria-expanded", "false");
        }
    }








/* ============================================================
   09. COMPONENT VISUAL ENGINE
   ------------------------------------------------------------
   FOBAS ELECTRONIQUE & ROBOTIQUE
   VISUAL ENGINE V2.0
   ------------------------------------------------------------
   IMPORTANT:
   - CONSERVE les IDs existants
   - CONSERVE data-component-id
   - CONSERVE data-component-type
   - CONSERVE data-visual-type
   - CONSERVE les pins existantes
   - CONSERVE les propriétés de component existantes
   - NE MODIFIE PAS Block 08
   - Aucun Three.js
============================================================ */

/* ============================================================
   09.1 — INTERNAL 3D VISUAL ENGINE
============================================================ */

let FOBAS_ELECTRONIC_3D_UID = 0;

function fobas3DSafe(value) {
    if (typeof escapeHTML === "function") {
        return escapeHTML(String(value ?? ""));
    }

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   09.2 — DETECT COMPONENT VISUAL FAMILY
============================================================ */

function getFOBASComponentVisualFamily(definition) {
    const type = String(definition?.type || "").toLowerCase();
    const id = String(definition?.id || "").toLowerCase();
    const name = String(definition?.name || "").toLowerCase();
    const category = String(definition?.category || "").toLowerCase();

    const text = `${type} ${id} ${name} ${category}`;

    /* LED */
    if (
        type === "led" ||
        text.includes("led-") ||
        text.includes("led ")
    ) {
        return "led";
    }

    /* Bulb */
    if (
        type === "bulb" ||
        text.includes("ampoule") ||
        text.includes("bulb") ||
        text.includes("lampe")
    ) {
        return "bulb";
    }

    /* Resistor */
    if (
        type === "resistor" ||
        text.includes("resistance") ||
        text.includes("résistance") ||
        text.includes("resistor")
    ) {
        return "resistor";
    }

    /* Potentiometer */
    if (
        type === "potentiometer" ||
        text.includes("potentiometre") ||
        text.includes("potentiomètre")
    ) {
        return "potentiometer";
    }

    /* Capacitor */
    if (
        type === "capacitor" ||
        text.includes("condensateur") ||
        text.includes("capacitor")
    ) {
        return "capacitor";
    }

    /* Diode */
    if (
        type === "diode" ||
        text.includes("diode") ||
        text.includes("zener") ||
        text.includes("schottky")
    ) {
        return "diode";
    }

    /* Transistor */
    if (
        type === "transistor" ||
        text.includes("transistor") ||
        text.includes("mosfet") ||
        text.includes("igbt")
    ) {
        return "transistor";
    }

    /* IC / Chip */
    if (
        type === "ic" ||
        type === "chip" ||
        text.includes("microcontrôleur") ||
        text.includes("microcontroleur") ||
        text.includes("integrated") ||
        text.includes("circuit intégré") ||
        text.includes("circuit integre")
    ) {
        return "ic";
    }

    /* Arduino */
    if (text.includes("arduino")) {
        return "arduino";
    }

    /* ESP */
    if (text.includes("esp32") || text.includes("esp8266")) {
        return "esp";
    }

    /* Raspberry Pi */
    if (
        text.includes("raspberry") ||
        text.includes("raspberry pi")
    ) {
        return "raspberry";
    }

    /* Breadboard */
    if (
        type === "breadboard" ||
        text.includes("breadboard") ||
        text.includes("protoboard")
    ) {
        return "breadboard";
    }

    /* PCB */
    if (
        type === "pcb" ||
        text.includes("pcb") ||
        text.includes("circuit imprimé") ||
        text.includes("circuit imprime")
    ) {
        return "pcb";
    }

    /* Relay */
    if (
        type === "relay" ||
        text.includes("relais") ||
        text.includes("relay")
    ) {
        return "relay";
    }

    /* Switch */
    if (
        type === "switch" ||
        text.includes("interrupteur") ||
        text.includes("switch")
    ) {
        return "switch";
    }

    /* Push button */
    if (
        type === "push-button" ||
        text.includes("push-button") ||
        text.includes("push button") ||
        text.includes("bouton poussoir") ||
        text.includes("bouton-poussoir")
    ) {
        return "push-button";
    }

    /* DC Motor */
    if (
        type === "dc-motor" ||
        text.includes("dc motor") ||
        text.includes("moteur dc") ||
        text.includes("motor dc")
    ) {
        return "dc-motor";
    }

    /* Stepper */
    if (
        type === "stepper" ||
        text.includes("stepper") ||
        text.includes("pas-à-pas") ||
        text.includes("pas a pas")
    ) {
        return "stepper";
    }

    /* Servo */
    if (
        type === "servo" ||
        text.includes("servo")
    ) {
        return "servo";
    }

    /* Buzzer */
    if (
        type === "buzzer" ||
        text.includes("buzzer") ||
        text.includes("sonnerie")
    ) {
        return "buzzer";
    }

    /* Speaker */
    if (
        type === "speaker" ||
        text.includes("speaker") ||
        text.includes("haut-parleur")
    ) {
        return "speaker";
    }

    /* Sensors */
    if (
        type === "sensor" ||
        text.includes("sensor") ||
        text.includes("capteur") ||
        text.includes("ldr") ||
        text.includes("thermistor") ||
        text.includes("thermistance") ||
        text.includes("ultrason") ||
        text.includes("infrared") ||
        text.includes("infrarouge")
    ) {
        return "sensor";
    }

    /* Battery */
    if (
        type === "battery" ||
        text.includes("battery") ||
        text.includes("batterie") ||
        text.includes("pile")
    ) {
        return "battery";
    }

    /* Multimeter */
    if (
        type === "multimeter" ||
        text.includes("multimètre") ||
        text.includes("multimetre")
    ) {
        return "multimeter";
    }

    /* LCD / Display */
    if (
        type === "lcd" ||
        text.includes("lcd") ||
        text.includes("display") ||
        text.includes("écran") ||
        text.includes("ecran")
    ) {
        return "lcd";
    }

    return "generic";
}


/* ============================================================
   09.3 — LED VARIANT DETECTOR
============================================================ */

function getFOBASElectronicLEDVariant(definition) {
    const type = String(definition?.type || "").toLowerCase();
    const id = String(definition?.id || "").toLowerCase();
    const name = String(definition?.name || "").toLowerCase();
    const color = String(definition?.color || "").toLowerCase();

    const value = `${type} ${id} ${name} ${color}`;

    if (
        value.includes("rgbw")
    ) return "rgbw";

    if (
        value.includes("rgb")
    ) return "rgb";

    if (
        value.includes("infrared") ||
        value.includes("infrarouge") ||
        value.includes("led-ir") ||
        value.includes("-ir")
    ) return "ir";

    if (
        value.includes("ultraviolet") ||
        value.includes("ultraviolet") ||
        value.includes("led-uv") ||
        value.includes("-uv")
    ) return "uv";

    if (
        value.includes("red") ||
        value.includes("rouge")
    ) return "red";

    if (
        value.includes("blue") ||
        value.includes("bleu")
    ) return "blue";

    if (
        value.includes("yellow") ||
        value.includes("jaune")
    ) return "yellow";

    if (
        value.includes("white") ||
        value.includes("blanc")
    ) return "white";

    if (
        value.includes("green") ||
        value.includes("vert")
    ) return "green";

    if (
        value.includes("brown") ||
        value.includes("marron")
    ) return "brown";

    if (
        value.includes("orange")
    ) return "orange";

    if (
        value.includes("violet") ||
        value.includes("purple")
    ) return "violet";

    if (
        value.includes("gray") ||
        value.includes("grey") ||
        value.includes("gris")
    ) return "gray";

    return "red";
}


/* ============================================================
   09.4 — LED COLOR
============================================================ */

function getFOBASElectronicLEDColor(variant) {
    const colors = {
        red: "#ff1744",
        blue: "#2979ff",
        yellow: "#ffd600",
        white: "#f5f7ff",
        green: "#00e676",
        brown: "#795548",
        orange: "#ff6d00",
        violet: "#aa00ff",
        gray: "#9e9e9e",
        rgb: "#00e5ff",
        rgbw: "#ffffff",
        ir: "#8b0000",
        uv: "#7c4dff"
    };

    return colors[variant] || "#ff1744";
}


/* ============================================================
   09.5 — UNIVERSAL SVG 3D ICON BUILDER
============================================================ */

function createFOBAS3DComponentSVG(definition, family) {
    const uid = ++FOBAS_ELECTRONIC_3D_UID;

    const variant =
        family === "led"
            ? getFOBASElectronicLEDVariant(definition)
            : "";

    const ledColor =
        family === "led"
            ? getFOBASElectronicLEDColor(variant)
            : "#263238";

    const safeColor =
        fobas3DSafe(
            definition?.color ||
            ledColor ||
            "#263238"
        );

    const common = `
        width="100%"
        height="100%"
        viewBox="0 0 160 110"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
        style="pointer-events:none;overflow:visible;"
    `;

    /* ========================================================
       LED
    ======================================================== */

    if (family === "led") {

        let domeFill = safeColor;

        if (variant === "rgb") {
            domeFill = "#00d9ff";
        }

        if (variant === "rgbw") {
            domeFill = "#ffffff";
        }

        if (variant === "ir") {
            domeFill = "#5b1111";
        }

        if (variant === "uv") {
            domeFill = "#7048ff";
        }

        return `
            <svg ${common}
                class="fobas-svg-3d fobas-svg-led"
                data-led-variant="${fobas3DSafe(variant)}"
                data-svg-uid="${uid}"
            >
                <ellipse
                    cx="80"
                    cy="92"
                    rx="43"
                    ry="8"
                    fill="#000"
                    opacity=".28"
                />

                <line
                    x1="68"
                    y1="75"
                    x2="59"
                    y2="102"
                    stroke="#bfc5ca"
                    stroke-width="4"
                    stroke-linecap="round"
                />

                <line
                    x1="92"
                    y1="75"
                    x2="101"
                    y2="102"
                    stroke="#8d969d"
                    stroke-width="4"
                    stroke-linecap="round"
                />

                <path
                    d="M58 52
                       C58 31 67 19 80 19
                       C93 19 102 31 102 52
                       L98 68
                       C94 76 88 80 80 80
                       C72 80 66 76 62 68Z"
                    fill="${domeFill}"
                    stroke="#263238"
                    stroke-width="3"
                />

                <path
                    d="M64 49
                       C66 31 73 24 80 24
                       C86 24 91 29 94 39"
                    fill="none"
                    stroke="#ffffff"
                    stroke-width="5"
                    opacity=".7"
                    stroke-linecap="round"
                />

                <rect
                    x="72"
                    y="59"
                    width="16"
                    height="13"
                    rx="2"
                    fill="#263238"
                    opacity=".9"
                />

                <path
                    d="M76 58V48
                       M84 58V43"
                    stroke="#d7dde2"
                    stroke-width="2"
                />

                ${
                    variant === "rgb"
                    ? `
                        <circle
                            cx="80"
                            cy="49"
                            r="8"
                            fill="#00e5ff"
                            class="fobas-led-light"
                        />
                    `
                    : ""
                }

                ${
                    variant === "rgbw"
                    ? `
                        <circle
                            cx="80"
                            cy="49"
                            r="8"
                            fill="#ffffff"
                            class="fobas-led-light"
                        />
                    `
                    : ""
                }
            </svg>
        `;
    }


    /* ========================================================
       BULB
    ======================================================== */

    if (family === "bulb") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-bulb">

                <ellipse
                    cx="80"
                    cy="96"
                    rx="45"
                    ry="7"
                    fill="#000"
                    opacity=".25"
                />

                <path
                    d="M58 50
                       C58 29 68 17 80 17
                       C92 17 102 29 102 50
                       C102 62 96 68 92 75
                       L68 75
                       C64 68 58 62 58 50Z"
                    fill="#e9f7ff"
                    stroke="#8fa1ad"
                    stroke-width="3"
                />

                <path
                    d="M69 75H91V84H69Z"
                    fill="#aeb8bf"
                    stroke="#66737b"
                    stroke-width="2"
                />

                <path
                    d="M68 84H92
                       M69 88H91
                       M71 92H89"
                    stroke="#69757d"
                    stroke-width="3"
                />

                <path
                    d="M72 48
                       C76 54 84 54 88 48"
                    fill="none"
                    stroke="#9b7b42"
                    stroke-width="3"
                />

                <path
                    d="M75 39
                       L80 49
                       L85 39"
                    fill="none"
                    stroke="#d6a94c"
                    stroke-width="3"
                />
            </svg>
        `;
    }


    /* ========================================================
       RESISTOR
    ======================================================== */

    if (family === "resistor") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-resistor">

                <ellipse
                    cx="80"
                    cy="83"
                    rx="55"
                    ry="7"
                    fill="#000"
                    opacity=".24"
                />

                <line
                    x1="15"
                    y1="54"
                    x2="47"
                    y2="54"
                    stroke="#aeb5ba"
                    stroke-width="5"
                />

                <line
                    x1="113"
                    y1="54"
                    x2="145"
                    y2="54"
                    stroke="#aeb5ba"
                    stroke-width="5"
                />

                <path
                    d="M45 40
                       L115 40
                       L115 68
                       L45 68
                       Z"
                    rx="12"
                    fill="#d8b27c"
                    stroke="#765d3d"
                    stroke-width="3"
                />

                <rect
                    x="56"
                    y="40"
                    width="7"
                    height="28"
                    fill="#6d2636"
                />

                <rect
                    x="72"
                    y="40"
                    width="7"
                    height="28"
                    fill="#222"
                />

                <rect
                    x="88"
                    y="40"
                    width="7"
                    height="28"
                    fill="#d99b28"
                />

                <rect
                    x="103"
                    y="40"
                    width="7"
                    height="28"
                    fill="#c58b35"
                />

                <path
                    d="M49 43H108"
                    stroke="#fff"
                    stroke-width="4"
                    opacity=".45"
                />
            </svg>
        `;
    }


    /* ========================================================
       POTENTIOMETER
    ======================================================== */

    if (family === "potentiometer") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-potentiometer">

                <ellipse
                    cx="80"
                    cy="91"
                    rx="45"
                    ry="8"
                    fill="#000"
                    opacity=".25"
                />

                <rect
                    x="45"
                    y="48"
                    width="70"
                    height="35"
                    rx="8"
                    fill="#333b40"
                    stroke="#11181c"
                    stroke-width="3"
                />

                <circle
                    cx="80"
                    cy="48"
                    r="27"
                    fill="#606970"
                    stroke="#1e2529"
                    stroke-width="4"
                />

                <circle
                    cx="80"
                    cy="48"
                    r="20"
                    fill="#89939a"
                />

                <line
                    x1="80"
                    y1="48"
                    x2="91"
                    y2="31"
                    stroke="#f2f4f5"
                    stroke-width="4"
                    stroke-linecap="round"
                />

                <line
                    x1="58"
                    y1="84"
                    x2="53"
                    y2="103"
                    stroke="#aaa"
                    stroke-width="4"
                />

                <line
                    x1="80"
                    y1="84"
                    x2="80"
                    y2="103"
                    stroke="#aaa"
                    stroke-width="4"
                />

                <line
                    x1="102"
                    y1="84"
                    x2="107"
                    y2="103"
                    stroke="#aaa"
                    stroke-width="4"
                />
            </svg>
        `;
    }


    /* ========================================================
       CAPACITOR
    ======================================================== */

    if (family === "capacitor") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-capacitor">

                <ellipse
                    cx="80"
                    cy="94"
                    rx="30"
                    ry="7"
                    fill="#000"
                    opacity=".25"
                />

                <rect
                    x="57"
                    y="25"
                    width="46"
                    height="62"
                    rx="8"
                    fill="#263238"
                    stroke="#11181c"
                    stroke-width="3"
                />

                <ellipse
                    cx="80"
                    cy="25"
                    rx="23"
                    ry="8"
                    fill="#39464d"
                    stroke="#151b1e"
                    stroke-width="2"
                />

                <path
                    d="M65 31V80"
                    stroke="#65737b"
                    stroke-width="5"
                    opacity=".6"
                />

                <path
                    d="M72 18H88"
                    stroke="#d5dadd"
                    stroke-width="3"
                />

                <line
                    x1="70"
                    y1="87"
                    x2="66"
                    y2="104"
                    stroke="#aeb5ba"
                    stroke-width="4"
                />

                <line
                    x1="90"
                    y1="87"
                    x2="94"
                    y2="104"
                    stroke="#aeb5ba"
                    stroke-width="4"
                />
            </svg>
        `;
    }


    /* ========================================================
       DIODE
    ======================================================== */

    if (family === "diode") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-diode">

                <ellipse
                    cx="80"
                    cy="78"
                    rx="55"
                    ry="6"
                    fill="#000"
                    opacity=".22"
                />

                <line
                    x1="15"
                    y1="53"
                    x2="55"
                    y2="53"
                    stroke="#adb5ba"
                    stroke-width="5"
                />

                <line
                    x1="105"
                    y1="53"
                    x2="145"
                    y2="53"
                    stroke="#adb5ba"
                    stroke-width="5"
                />

                <rect
                    x="52"
                    y="36"
                    width="56"
                    height="34"
                    rx="12"
                    fill="#20272b"
                    stroke="#0d1113"
                    stroke-width="3"
                />

                <rect
                    x="96"
                    y="36"
                    width="7"
                    height="34"
                    fill="#d9dde0"
                />

                <path
                    d="M59 41H89"
                    stroke="#626e75"
                    stroke-width="4"
                    opacity=".7"
                />
            </svg>
        `;
    }


    /* ========================================================
       TRANSISTOR
    ======================================================== */

    if (family === "transistor") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-transistor">

                <ellipse
                    cx="80"
                    cy="92"
                    rx="35"
                    ry="7"
                    fill="#000"
                    opacity=".25"
                />

                <path
                    d="M57 30
                       C57 22 64 18 80 18
                       C96 18 103 22 103 30
                       V70
                       H57Z"
                    fill="#1e2529"
                    stroke="#0b0f11"
                    stroke-width="3"
                />

                <path
                    d="M64 27H91"
                    stroke="#626d74"
                    stroke-width="4"
                />

                <line
                    x1="66"
                    y1="70"
                    x2="60"
                    y2="103"
                    stroke="#aeb5ba"
                    stroke-width="4"
                />

                <line
                    x1="80"
                    y1="70"
                    x2="80"
                    y2="103"
                    stroke="#aeb5ba"
                    stroke-width="4"
                />

                <line
                    x1="94"
                    y1="70"
                    x2="100"
                    y2="103"
                    stroke="#aeb5ba"
                    stroke-width="4"
                />
            </svg>
        `;
    }


    /* ========================================================
       IC / CHIP
    ======================================================== */

    if (family === "ic") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-ic">

                <ellipse
                    cx="80"
                    cy="94"
                    rx="55"
                    ry="7"
                    fill="#000"
                    opacity=".25"
                />

                <rect
                    x="35"
                    y="25"
                    width="90"
                    height="55"
                    rx="7"
                    fill="#171d20"
                    stroke="#090c0d"
                    stroke-width="3"
                />

                <path
                    d="M45 31H112"
                    stroke="#4d5a61"
                    stroke-width="4"
                    opacity=".6"
                />

                <path
                    d="M74 25
                       C74 32 86 32 86 25"
                    fill="none"
                    stroke="#66737b"
                    stroke-width="3"
                />

                ${Array.from({ length: 7 }, (_, i) => `
                    <line
                        x1="${45 + i * 11}"
                        y1="80"
                        x2="${45 + i * 11}"
                        y2="103"
                        stroke="#b9c0c4"
                        stroke-width="3"
                    />
                    <line
                        x1="${45 + i * 11}"
                        y1="25"
                        x2="${45 + i * 11}"
                        y2="8"
                        stroke="#b9c0c4"
                        stroke-width="3"
                    />
                `).join("")}
            </svg>
        `;
    }


    /* ========================================================
       ARDUINO
    ======================================================== */

    if (family === "arduino") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-arduino">

                <ellipse
                    cx="80"
                    cy="92"
                    rx="65"
                    ry="8"
                    fill="#000"
                    opacity=".25"
                />

                <rect
                    x="20"
                    y="18"
                    width="120"
                    height="65"
                    rx="8"
                    fill="#177245"
                    stroke="#0b4329"
                    stroke-width="3"
                />

                <rect
                    x="27"
                    y="25"
                    width="36"
                    height="20"
                    rx="3"
                    fill="#20272b"
                />

                <rect
                    x="93"
                    y="26"
                    width="30"
                    height="18"
                    rx="3"
                    fill="#b8c0c5"
                />

                <rect
                    x="69"
                    y="39"
                    width="25"
                    height="22"
                    rx="3"
                    fill="#172126"
                />

                <text
                    x="80"
                    y="74"
                    text-anchor="middle"
                    font-size="10"
                    font-family="Arial,sans-serif"
                    fill="#e8fff2"
                >ARDUINO</text>

                ${Array.from({ length: 12 }, (_, i) => `
                    <circle
                        cx="${28 + i * 9.5}"
                        cy="18"
                        r="2.4"
                        fill="#d6b65c"
                    />
                    <circle
                        cx="${28 + i * 9.5}"
                        cy="83"
                        r="2.4"
                        fill="#d6b65c"
                    />
                `).join("")}
            </svg>
        `;
    }


    /* ========================================================
       ESP
    ======================================================== */

    if (family === "esp") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-esp">

                <ellipse
                    cx="80"
                    cy="92"
                    rx="60"
                    ry="7"
                    fill="#000"
                    opacity=".25"
                />

                <rect
                    x="27"
                    y="22"
                    width="106"
                    height="60"
                    rx="5"
                    fill="#23814d"
                    stroke="#104c2d"
                    stroke-width="3"
                />

                <rect
                    x="61"
                    y="31"
                    width="48"
                    height="28"
                    rx="3"
                    fill="#20272b"
                />

                <path
                    d="M67 36H103
                       M67 42H103
                       M67 48H103
                       M67 54H103"
                    stroke="#65737b"
                    stroke-width="2"
                />

                <path
                    d="M34 28H50V72H34"
                    fill="#b8c0c5"
                    opacity=".7"
                />

                ${Array.from({ length: 10 }, (_, i) => `
                    <circle
                        cx="${34 + i * 10}"
                        cy="22"
                        r="2.2"
                        fill="#d6b65c"
                    />
                    <circle
                        cx="${34 + i * 10}"
                        cy="82"
                        r="2.2"
                        fill="#d6b65c"
                    />
                `).join("")}
            </svg>
        `;
    }


    /* ========================================================
       RASPBERRY PI
    ======================================================== */

    if (family === "raspberry") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-raspberry">

                <ellipse
                    cx="80"
                    cy="92"
                    rx="63"
                    ry="7"
                    fill="#000"
                    opacity=".25"
                />

                <rect
                    x="18"
                    y="20"
                    width="124"
                    height="62"
                    rx="6"
                    fill="#416d45"
                    stroke="#214428"
                    stroke-width="3"
                />

                <rect
                    x="53"
                    y="35"
                    width="40"
                    height="25"
                    rx="2"
                    fill="#1d2428"
                />

                <rect
                    x="105"
                    y="31"
                    width="28"
                    height="18"
                    fill="#777"
                />

                <rect
                    x="23"
                    y="54"
                    width="28"
                    height="18"
                    fill="#777"
                />

                ${Array.from({ length: 20 }, (_, i) => `
                    <circle
                        cx="${32 + (i % 10) * 10}"
                        cy="${20 + Math.floor(i / 10) * 62}"
                        r="2"
                        fill="#d7b65a"
                    />
                `).join("")}
            </svg>
        `;
    }


    /* ========================================================
       BREADBOARD
    ======================================================== */

    if (family === "breadboard") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-breadboard">

                <ellipse
                    cx="80"
                    cy="94"
                    rx="66"
                    ry="8"
                    fill="#000"
                    opacity=".22"
                />

                <rect
                    x="15"
                    y="18"
                    width="130"
                    height="67"
                    rx="8"
                    fill="#f1f2ef"
                    stroke="#c1c5c2"
                    stroke-width="3"
                />

                <rect
                    x="22"
                    y="26"
                    width="7"
                    height="51"
                    fill="#c62828"
                    opacity=".7"
                />

                <rect
                    x="131"
                    y="26"
                    width="7"
                    height="51"
                    fill="#1565c0"
                    opacity=".7"
                />

                ${Array.from({ length: 8 }, (_, r) =>
                    Array.from({ length: 10 }, (_, c) => `
                        <circle
                            cx="${39 + c * 9.5}"
                            cy="${34 + r * 6}"
                            r="1.8"
                            fill="#6d7478"
                        />
                    `).join("")
                ).join("")}
            </svg>
        `;
    }


    /* ========================================================
       PCB
    ======================================================== */

    if (family === "pcb") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-pcb">

                <ellipse
                    cx="80"
                    cy="94"
                    rx="65"
                    ry="7"
                    fill="#000"
                    opacity=".25"
                />

                <rect
                    x="17"
                    y="18"
                    width="126"
                    height="65"
                    rx="5"
                    fill="#155b3a"
                    stroke="#0b3523"
                    stroke-width="3"
                />

                <path
                    d="M25 35H62V60H105V29H135
                       M25 69H49V47H82V73H130"
                    fill="none"
                    stroke="#d0b84c"
                    stroke-width="2"
                    opacity=".8"
                />

                <circle cx="30" cy="28" r="4" fill="#d0b84c"/>
                <circle cx="130" cy="28" r="4" fill="#d0b84c"/>
                <circle cx="30" cy="73" r="4" fill="#d0b84c"/>
                <circle cx="130" cy="73" r="4" fill="#d0b84c"/>
            </svg>
        `;
    }


    /* ========================================================
       RELAY
    ======================================================== */

    if (family === "relay") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-relay">

                <ellipse
                    cx="80"
                    cy="94"
                    rx="45"
                    ry="7"
                    fill="#000"
                    opacity=".25"
                />

                <rect
                    x="42"
                    y="25"
                    width="76"
                    height="58"
                    rx="7"
                    fill="#242c30"
                    stroke="#111719"
                    stroke-width="3"
                />

                <rect
                    x="52"
                    y="34"
                    width="56"
                    height="25"
                    rx="4"
                    fill="#536169"
                />

                <path
                    d="M61 47H99"
                    stroke="#d8dde0"
                    stroke-width="3"
                />

                <circle cx="61" cy="69" r="3" fill="#d5b85c"/>
                <circle cx="80" cy="69" r="3" fill="#d5b85c"/>
                <circle cx="99" cy="69" r="3" fill="#d5b85c"/>
            </svg>
        `;
    }


    /* ========================================================
       SWITCH
    ======================================================== */

    if (family === "switch" || family === "push-button") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-switch">

                <ellipse
                    cx="80"
                    cy="91"
                    rx="42"
                    ry="7"
                    fill="#000"
                    opacity=".24"
                />

                <rect
                    x="40"
                    y="48"
                    width="80"
                    height="32"
                    rx="7"
                    fill="#252d31"
                    stroke="#101416"
                    stroke-width="3"
                />

                <rect
                    x="52"
                    y="32"
                    width="56"
                    height="28"
                    rx="8"
                    fill="#59656c"
                    stroke="#20272b"
                    stroke-width="3"
                />

                <rect
                    x="59"
                    y="38"
                    width="42"
                    height="14"
                    rx="6"
                    fill="#909ba1"
                />

                <line
                    x1="55"
                    y1="80"
                    x2="50"
                    y2="101"
                    stroke="#b5bdc1"
                    stroke-width="4"
                />

                <line
                    x1="105"
                    y1="80"
                    x2="110"
                    y2="101"
                    stroke="#b5bdc1"
                    stroke-width="4"
                />
            </svg>
        `;
    }


    /* ========================================================
       DC MOTOR
    ======================================================== */

    if (family === "dc-motor") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-motor">

                <ellipse
                    cx="80"
                    cy="91"
                    rx="53"
                    ry="7"
                    fill="#000"
                    opacity=".25"
                />

                <rect
                    x="39"
                    y="30"
                    width="74"
                    height="47"
                    rx="22"
                    fill="#8b969c"
                    stroke="#485258"
                    stroke-width="3"
                />

                <path
                    d="M50 34V73"
                    stroke="#d8dde0"
                    stroke-width="5"
                    opacity=".65"
                />

                <circle
                    cx="76"
                    cy="53"
                    r="20"
                    fill="#59656b"
                    stroke="#333d42"
                    stroke-width="3"
                />

                <circle
                    cx="76"
                    cy="53"
                    r="8"
                    fill="#c6cdd1"
                />

                <rect
                    x="105"
                    y="46"
                    width="30"
                    height="14"
                    rx="4"
                    fill="#b9c0c4"
                />

                <line
                    x1="135"
                    y1="53"
                    x2="151"
                    y2="53"
                    stroke="#8c979d"
                    stroke-width="5"
                />
            </svg>
        `;
    }


    /* ========================================================
       SERVO
    ======================================================== */

    if (family === "servo") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-servo">

                <ellipse
                    cx="80"
                    cy="94"
                    rx="43"
                    ry="7"
                    fill="#000"
                    opacity=".25"
                />

                <rect
                    x="43"
                    y="30"
                    width="74"
                    height="55"
                    rx="7"
                    fill="#263238"
                    stroke="#11181c"
                    stroke-width="3"
                />

                <rect
                    x="51"
                    y="39"
                    width="58"
                    height="29"
                    rx="4"
                    fill="#1877a5"
                />

                <circle
                    cx="80"
                    cy="35"
                    r="15"
                    fill="#d8dde0"
                    stroke="#626d73"
                    stroke-width="3"
                />

                <line
                    x1="80"
                    y1="35"
                    x2="95"
                    y2="25"
                    stroke="#ffffff"
                    stroke-width="4"
                    stroke-linecap="round"
                />

                <line
                    x1="58"
                    y1="85"
                    x2="54"
                    y2="103"
                    stroke="#d0b85c"
                    stroke-width="4"
                />

                <line
                    x1="80"
                    y1="85"
                    x2="80"
                    y2="103"
                    stroke="#d0b85c"
                    stroke-width="4"
                />

                <line
                    x1="102"
                    y1="85"
                    x2="106"
                    y2="103"
                    stroke="#d0b85c"
                    stroke-width="4"
                />
            </svg>
        `;
    }


    /* ========================================================
       STEPPER MOTOR
    ======================================================== */

    if (family === "stepper") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-stepper">

                <ellipse
                    cx="80"
                    cy="93"
                    rx="52"
                    ry="7"
                    fill="#000"
                    opacity=".25"
                />

                <rect
                    x="40"
                    y="25"
                    width="80"
                    height="57"
                    rx="7"
                    fill="#454e53"
                    stroke="#20272b"
                    stroke-width="3"
                />

                <circle
                    cx="80"
                    cy="53"
                    r="24"
                    fill="#8d979c"
                    stroke="#343d42"
                    stroke-width="4"
                />

                <circle
                    cx="80"
                    cy="53"
                    r="9"
                    fill="#d0d5d8"
                />

                <path
                    d="M54 31H106
                       M54 75H106"
                    stroke="#c7cdd0"
                    stroke-width="3"
                />

                <line x1="57" y1="82" x2="53" y2="103"
                      stroke="#bfc5c8" stroke-width="4"/>
                <line x1="103" y1="82" x2="107" y2="103"
                      stroke="#bfc5c8" stroke-width="4"/>
            </svg>
        `;
    }


    /* ========================================================
       BUZZER
    ======================================================== */

    if (family === "buzzer") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-buzzer">

                <ellipse
                    cx="80"
                    cy="91"
                    rx="34"
                    ry="7"
                    fill="#000"
                    opacity=".25"
                />

                <circle
                    cx="80"
                    cy="52"
                    r="35"
                    fill="#252d31"
                    stroke="#111719"
                    stroke-width="4"
                />

                <circle
                    cx="80"
                    cy="52"
                    r="24"
                    fill="#11181b"
                />

                <circle
                    cx="80"
                    cy="52"
                    r="6"
                    fill="#4d5a60"
                />

                <line
                    x1="64"
                    y1="80"
                    x2="59"
                    y2="103"
                    stroke="#c1c6c9"
                    stroke-width="4"
                />

                <line
                    x1="96"
                    y1="80"
                    x2="101"
                    y2="103"
                    stroke="#c1c6c9"
                    stroke-width="4"
                />
            </svg>
        `;
    }


    /* ========================================================
       SPEAKER
    ======================================================== */

    if (family === "speaker") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-speaker">

                <ellipse
                    cx="80"
                    cy="94"
                    rx="48"
                    ry="7"
                    fill="#000"
                    opacity=".25"
                />

                <circle
                    cx="80"
                    cy="52"
                    r="38"
                    fill="#1c2327"
                    stroke="#0b0f11"
                    stroke-width="4"
                />

                <circle
                    cx="80"
                    cy="52"
                    r="27"
                    fill="#303b40"
                />

                <path
                    d="M66 38
                       L94 38
                       L104 67
                       L56 67
                       Z"
                    fill="#111719"
                />

                <circle
                    cx="80"
                    cy="53"
                    r="7"
                    fill="#69757a"
                />
            </svg>
        `;
    }


    /* ========================================================
       SENSOR
    ======================================================== */

    if (family === "sensor") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-sensor">

                <ellipse
                    cx="80"
                    cy="93"
                    rx="48"
                    ry="7"
                    fill="#000"
                    opacity=".24"
                />

                <rect
                    x="37"
                    y="26"
                    width="86"
                    height="58"
                    rx="6"
                    fill="#1d6847"
                    stroke="#0d3927"
                    stroke-width="3"
                />

                <circle
                    cx="62"
                    cy="51"
                    r="13"
                    fill="#8f9ba1"
                    stroke="#263238"
                    stroke-width="3"
                />

                <circle
                    cx="98"
                    cy="51"
                    r="13"
                    fill="#8f9ba1"
                    stroke="#263238"
                    stroke-width="3"
                />

                <rect
                    x="69"
                    y="67"
                    width="22"
                    height="8"
                    rx="3"
                    fill="#20282c"
                />

                <line
                    x1="52"
                    y1="84"
                    x2="48"
                    y2="103"
                    stroke="#c4c9cc"
                    stroke-width="4"
                />

                <line
                    x1="80"
                    y1="84"
                    x2="80"
                    y2="103"
                    stroke="#c4c9cc"
                    stroke-width="4"
                />

                <line
                    x1="108"
                    y1="84"
                    x2="112"
                    y2="103"
                    stroke="#c4c9cc"
                    stroke-width="4"
                />
            </svg>
        `;
    }


    /* ========================================================
       BATTERY
    ======================================================== */

    if (family === "battery") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-battery">

                <ellipse
                    cx="80"
                    cy="93"
                    rx="30"
                    ry="7"
                    fill="#000"
                    opacity=".25"
                />

                <rect
                    x="52"
                    y="25"
                    width="56"
                    height="62"
                    rx="8"
                    fill="#303a3f"
                    stroke="#111719"
                    stroke-width="3"
                />

                <rect
                    x="60"
                    y="39"
                    width="40"
                    height="25"
                    rx="3"
                    fill="#151b1e"
                />

                <text
                    x="80"
                    y="56"
                    text-anchor="middle"
                    font-size="12"
                    font-family="Arial,sans-serif"
                    fill="#f4f5f5"
                >DC</text>

                <circle
                    cx="66"
                    cy="20"
                    r="5"
                    fill="#bfc5c8"
                />

                <circle
                    cx="94"
                    cy="20"
                    r="5"
                    fill="#bfc5c8"
                />
            </svg>
        `;
    }


    /* ========================================================
       MULTIMETER
    ======================================================== */

    if (family === "multimeter") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-multimeter">

                <ellipse
                    cx="80"
                    cy="94"
                    rx="42"
                    ry="7"
                    fill="#000"
                    opacity=".25"
                />

                <rect
                    x="43"
                    y="15"
                    width="74"
                    height="78"
                    rx="8"
                    fill="#333d42"
                    stroke="#151b1e"
                    stroke-width="4"
                />

                <rect
                    x="53"
                    y="25"
                    width="54"
                    height="25"
                    rx="3"
                    fill="#101719"
                />

                <text
                    x="80"
                    y="42"
                    text-anchor="middle"
                    font-size="14"
                    font-family="monospace"
                    fill="#d7f7dc"
                >0.00</text>

                <circle
                    cx="80"
                    cy="66"
                    r="13"
                    fill="#8c979d"
                    stroke="#20272b"
                    stroke-width="3"
                />

                <line
                    x1="80"
                    y1="66"
                    x2="88"
                    y2="57"
                    stroke="#ffffff"
                    stroke-width="3"
                />

                <circle cx="62" cy="85" r="4" fill="#c62828"/>
                <circle cx="80" cy="85" r="4" fill="#111"/>
                <circle cx="98" cy="85" r="4" fill="#111"/>
            </svg>
        `;
    }


    /* ========================================================
       LCD
    ======================================================== */

    if (family === "lcd") {
        return `
            <svg ${common} class="fobas-svg-3d fobas-svg-lcd">

                <ellipse
                    cx="80"
                    cy="91"
                    rx="54"
                    ry="7"
                    fill="#000"
                    opacity=".25"
                />

                <rect
                    x="22"
                    y="22"
                    width="116"
                    height="61"
                    rx="6"
                    fill="#303a3f"
                    stroke="#111719"
                    stroke-width="3"
                />

                <rect
                    x="34"
                    y="33"
                    width="92"
                    height="34"
                    rx="3"
                    fill="#153f32"
                />

                <path
                    d="M41 41H117
                       M41 49H117
                       M41 57H117"
                    stroke="#6ed99b"
                    stroke-width="2"
                    opacity=".65"
                />

                ${Array.from({ length: 10 }, (_, i) => `
                    <circle
                        cx="${30 + i * 11}"
                        cy="83"
                        r="2"
                        fill="#d0b85c"
                    />
                `).join("")}
            </svg>
        `;
    }


    /* ========================================================
       GENERIC ELECTRONIC COMPONENT
    ======================================================== */

    return `
        <svg ${common} class="fobas-svg-3d fobas-svg-generic">

            <ellipse
                cx="80"
                cy="92"
                rx="48"
                ry="7"
                fill="#000"
                opacity=".25"
            />

            <rect
                x="38"
                y="28"
                width="84"
                height="52"
                rx="9"
                fill="${safeColor}"
                stroke="#111719"
                stroke-width="3"
            />

            <path
                d="M45 34H109"
                stroke="#ffffff"
                stroke-width="5"
                opacity=".22"
                stroke-linecap="round"
            />

            <circle
                cx="80"
                cy="53"
                r="12"
                fill="#ffffff"
                opacity=".13"
            />

            <line
                x1="48"
                y1="80"
                x2="43"
                y2="103"
                stroke="#b8c0c4"
                stroke-width="4"
            />

            <line
                x1="112"
                y1="80"
                x2="117"
                y2="103"
                stroke="#b8c0c4"
                stroke-width="4"
            />
        </svg>
    `;
}


/* ============================================================
   09.6 — MAIN VISUAL HTML
============================================================ */

function createComponentVisualHTML(definition, libraryMode = false) {

    const safeDefinition = definition || {};

    const icon =
        fobas3DSafe(
            safeDefinition.icon || "●"
        );

    const family =
        getFOBASComponentVisualFamily(
            safeDefinition
        );

    const visualSVG =
        createFOBAS3DComponentSVG(
            safeDefinition,
            family
        );

    const componentId =
        fobas3DSafe(
            safeDefinition.id || ""
        );

    const componentName =
        fobas3DSafe(
            safeDefinition.name || ""
        );

    const componentCategory =
        fobas3DSafe(
            safeDefinition.category || ""
        );

    const componentColor =
        fobas3DSafe(
            safeDefinition.color || "#263238"
        );

    const width =
        Math.max(
            60,
            Number(safeDefinition.width) || 110
        );

    const height =
        Math.max(
            45,
            Number(safeDefinition.height) || 70
        );

    return `
        <div
            class="fobas-electronic-3d fobas-component-family-${fobas3DSafe(family)}"
            data-visual-type="${componentId}"
            data-visual-family="${fobas3DSafe(family)}"
            style="
                --component-color:${componentColor};
                --component-width:${width}px;
                --component-height:${height}px;
            "
        >

            <div class="component-3d-shadow"></div>

            <div class="component-3d-body">

                <div class="component-3d-highlight"></div>

                <div
                    class="component-3d-icon"
                    data-component-icon="${componentId}"
                >
                    ${visualSVG}
                </div>

                <div
                    class="component-3d-original-icon"
                    aria-hidden="true"
                    style="display:none;"
                >
                    ${icon}
                </div>

                <div
                    class="component-3d-label"
                    data-component-label="${componentId}"
                    title="${componentName}"
                >
                    ${componentName}
                </div>

            </div>

            ${
                componentCategory
                    ? `
                        <div class="component-3d-category">
                            ${componentCategory}
                        </div>
                    `
                    : ""
            }

        </div>
    `;
}


/* ============================================================
   09.7 — PIN HTML
   ------------------------------------------------------------
   CONSERVÉ : aucune modification de la structure des pins.
============================================================ */

function createComponentPinHTML(pin) {
    return `
        <button
            type="button"
            class="electronic-pin"
            data-pin-id="${fobas3DSafe(pin.id)}"
            data-pin-name="${fobas3DSafe(pin.name)}"
            data-pin-side="${fobas3DSafe(pin.side || "right")}"
            title="${fobas3DSafe(pin.name)}"
            aria-label="Pin ${fobas3DSafe(pin.name)}"
        >
            <span>${fobas3DSafe(pin.name)}</span>
        </button>
    `;
}


/* ============================================================
   09.8 — CREATE COMPONENT INSTANCE
   ------------------------------------------------------------
   CONSERVÉ.
============================================================ */

function createComponentInstance(type, options = {}) {
    const definition = getComponentDefinition(type);

    if (!definition) {
        console.warn(`Composant inconnu : ${type}`);
        return null;
    }

    const index = state.components.length;

    const viewportRect =
        dom.viewport?.getBoundingClientRect();

    const defaultX =
        options.x ??
        Math.max(
            30,
            ((viewportRect?.width || 700) / 2) -
            (definition.width / 2) +
            (index % 4) * 35
        );

    const defaultY =
        options.y ??
        Math.max(
            30,
            ((viewportRect?.height || 500) / 2) -
            (definition.height / 2) +
            (index % 3) * 35
        );

    const component = {
        id: options.id || uid(type),
        type: definition.id,
        name: definition.name,
        category: definition.category,

        x: Number.isFinite(options.x)
            ? options.x
            : defaultX,

        y: Number.isFinite(options.y)
            ? options.y
            : defaultY,

        width: definition.width || 110,
        height: definition.height || 70,

        rotation: Number.isFinite(options.rotation)
            ? options.rotation
            : 0,

        state:
            options.state ??
            definition.state ??
            "off",

        value:
            options.value ??
            definition.value ??
            null,

        angle:
            Number.isFinite(options.angle)
                ? options.angle
                : Number(definition.angle || 0),

        speed:
            Number.isFinite(options.speed)
                ? options.speed
                : Number(definition.speed || 0),

        frequency:
            Number.isFinite(options.frequency)
                ? options.frequency
                : Number(definition.frequency || 0),

        displayText:
            options.displayText ??
            definition.displayText ??
            "",

        pinStates:
            options.pinStates
                ? { ...options.pinStates }
                : {},

        pinModes:
            options.pinModes
                ? { ...options.pinModes }
                : {},

        analogValues:
            options.analogValues
                ? { ...options.analogValues }
                : {},

        digitalValues:
            options.digitalValues
                ? { ...options.digitalValues }
                : {},

        faults:
            options.faults
                ? { ...options.faults }
                : {
                    open: false,
                    short: false,
                    polarity: false,
                    defective: false
                }
    };

    state.components.push(component);

    renderComponent(component);

    updateWorkspaceState();

    return component;
}


/* ============================================================
   09.9 — RENDER COMPONENT
============================================================ */

function renderComponent(component) {
    if (!dom.componentLayer || !component) return;

    let element =
        document.getElementById(component.id);

    if (!element) {
        element = document.createElement("div");

        element.id = component.id;

        element.className =
            "electronic-component";

        element.dataset.componentId =
            component.id;

        element.dataset.componentType =
            component.type;

        element.setAttribute(
            "tabindex",
            "0"
        );

        dom.componentLayer.appendChild(element);
    }

    const definition =
        getComponentDefinition(
            component.type
        );

    if (!definition) return;

    element.style.position = "absolute";

    element.style.left =
        `${component.x}px`;

    element.style.top =
        `${component.y}px`;

    element.style.width =
        `${component.width}px`;

    element.style.height =
        `${component.height}px`;

    element.style.transform =
        `rotate(${component.rotation}deg)`;

    element.style.touchAction =
        "none";

    element.style.userSelect =
        "none";

    const selected =
        component.id ===
        state.selectedComponentId;

    element.classList.toggle(
        "selected",
        selected
    );

    element.classList.toggle(
        "component-running",
        state.circuitRunning
    );

    element.dataset.state =
        String(
            component.state || "off"
        );

    const pins =
        definition.pins || [];

    element.innerHTML = `
        <div class="electronic-component-shell">

            <div class="electronic-component-visual">
                ${createComponentVisualHTML(definition)}
            </div>

            <div class="electronic-component-pins">
                ${pins
                    .map(createComponentPinHTML)
                    .join("")}
            </div>

            <div class="electronic-component-state">
                ${getComponentStateLabel(component)}
            </div>

        </div>
    `;

    applyComponentVisualState(
        element,
        component
    );

    positionComponentPins(
        element,
        definition
    );

    attachComponentEvents(
        element,
        component
    );
}


/* ============================================================
   09.10 — POSITION PINS
   ------------------------------------------------------------
   CONSERVÉ.
============================================================ */

function positionComponentPins(element, definition) {

    const pinElements =
        Array.from(
            element.querySelectorAll(
                ".electronic-pin"
            )
        );

    const sideGroups = {
        left: [],
        right: [],
        top: [],
        bottom: []
    };

    pinElements.forEach(pinElement => {

        const side =
            pinElement.dataset.pinSide ||
            "right";

        if (!sideGroups[side]) {
            sideGroups[side] = [];
        }

        sideGroups[side].push(
            pinElement
        );
    });

    Object.entries(sideGroups)
        .forEach(([side, elements]) => {

            elements.forEach(
                (pinElement, index) => {

                    const total =
                        elements.length;

                    const ratio =
                        (index + 1) /
                        (total + 1);

                    pinElement.style.position =
                        "absolute";

                    if (side === "left") {
                        pinElement.style.left =
                            "-8px";

                        pinElement.style.top =
                            `${ratio * 100}%`;

                        pinElement.style.transform =
                            "translateY(-50%)";
                    }

                    if (side === "right") {
                        pinElement.style.right =
                            "-8px";

                        pinElement.style.top =
                            `${ratio * 100}%`;

                        pinElement.style.transform =
                            "translateY(-50%)";
                    }

                    if (side === "top") {
                        pinElement.style.top =
                            "-8px";

                        pinElement.style.left =
                            `${ratio * 100}%`;

                        pinElement.style.transform =
                            "translateX(-50%)";
                    }

                    if (side === "bottom") {
                        pinElement.style.bottom =
                            "-8px";

                        pinElement.style.left =
                            `${ratio * 100}%`;

                        pinElement.style.transform =
                            "translateX(-50%)";
                    }
                }
            );
        });
}


/* ============================================================
   09.11 — STATE LABEL
============================================================ */

function getComponentStateLabel(component) {
    if (!component) return "";

    if (component.type === "led") {
        return component.state === "on"
            ? "● ON"
            : "○ OFF";
    }

    if (component.type === "bulb") {
        return component.state === "on"
            ? "● ALLUMÉE"
            : "○ ÉTEINTE";
    }

    if (component.type === "switch") {
        return component.state === "closed"
            ? "FERMÉ"
            : "OUVERT";
    }

    if (component.type === "push-button") {
        return component.state === "pressed"
            ? "PRESSÉ"
            : "LIBRE";
    }

    if (component.type === "servo") {
        return `ANGLE ${Math.round(
            component.angle || 0
        )}°`;
    }

    if (component.type === "dc-motor") {
        return component.speed
            ? `VITESSE ${Math.round(
                component.speed
            )}%`
            : "ARRÊT";
    }

    if (component.type === "buzzer") {
        return component.state === "on"
            ? `${component.frequency || 0} Hz`
            : "OFF";
    }

    if (component.type === "lcd") {
        return (
            component.displayText ||
            "LCD"
        );
    }

    return component.name;
}


/* ============================================================
   09.12 — APPLY VISUAL STATE
   ------------------------------------------------------------
   IMPORTANT:
   Le type reste la référence de simulation.
   La variante LED est détectée uniquement pour le visuel.
============================================================ */

function applyComponentVisualState(
    element,
    component
) {
    if (!element || !component) return;

    const visual =
        element.querySelector(
            ".fobas-electronic-3d"
        );

    const body =
        element.querySelector(
            ".component-3d-body"
        );

    if (!visual || !body) return;


    /* ========================================================
       GLOBAL STATE
    ======================================================== */

    visual.dataset.state =
        String(
            component.state || "off"
        );


    /* ========================================================
       LED
    ======================================================== */

    if (component.type === "led") {

        const isLit =
            component.state === "on";

        visual.dataset.lit =
            isLit
                ? "true"
                : "false";

        visual.classList.toggle(
            "is-lit",
            isLit
        );

        visual.classList.toggle(
            "is-off",
            !isLit
        );

        const variant =
            getFOBASElectronicLEDVariant(
                getComponentDefinition(
                    component.type
                ) || component
            );

        visual.dataset.ledVariant =
            variant;

        body.style.setProperty(
            "--led-color",
            getFOBASElectronicLEDColor(
                variant
            )
        );
    }


    /* ========================================================
       BULB
    ======================================================== */

    if (component.type === "bulb") {

        const isLit =
            component.state === "on";

        visual.dataset.lit =
            isLit
                ? "true"
                : "false";

        visual.classList.toggle(
            "is-lit",
            isLit
        );

        visual.classList.toggle(
            "is-off",
            !isLit
        );
    }


    /* ========================================================
       BUZZER
    ======================================================== */

    if (component.type === "buzzer") {

        const active =
            component.state === "on";

        visual.dataset.active =
            active
                ? "true"
                : "false";

        visual.classList.toggle(
            "is-active",
            active
        );
    }


    /* ========================================================
       DC MOTOR
    ======================================================== */

    if (component.type === "dc-motor") {

        const active =
            Number(component.speed || 0) > 0;

        visual.dataset.active =
            active
                ? "true"
                : "false";

        body.style.setProperty(
            "--motor-speed",
            `${Math.max(
                0,
                Math.min(
                    100,
                    Number(component.speed || 0)
                )
            )}`
        );

        visual.classList.toggle(
            "is-active",
            active
        );
    }


    /* ========================================================
       STEPPER
    ======================================================== */

    if (component.type === "stepper") {

        const active =
            Number(component.speed || 0) > 0 ||
            component.state === "on";

        visual.dataset.active =
            active
                ? "true"
                : "false";

        visual.classList.toggle(
            "is-active",
            active
        );
    }


    /* ========================================================
       SERVO
    ======================================================== */

    if (component.type === "servo") {

        const angle =
            Number(component.angle || 0);

        visual.dataset.angle =
            String(angle);

        body.style.setProperty(
            "--servo-angle",
            `${Math.max(
                -90,
                Math.min(
                    90,
                    angle
                )
            )}deg`
        );
    }


    /* ========================================================
       RELAY
    ======================================================== */

    if (component.type === "relay") {

        const active =
            component.state === "on";

        visual.dataset.active =
            active
                ? "true"
                : "false";

        visual.classList.toggle(
            "is-active",
            active
        );
    }


    /* ========================================================
       PUSH BUTTON
    ======================================================== */

    if (
        component.type ===
        "push-button"
    ) {

        const pressed =
            component.state ===
            "pressed";

        visual.dataset.pressed =
            pressed
                ? "true"
                : "false";

        visual.classList.toggle(
            "is-pressed",
            pressed
        );
    }


    /* ========================================================
       SWITCH
    ======================================================== */

    if (component.type === "switch") {

        const closed =
            component.state ===
            "closed";

        visual.dataset.closed =
            closed
                ? "true"
                : "false";

        visual.classList.toggle(
            "is-closed",
            closed
        );
    }


    /* ========================================================
       LCD
    ======================================================== */

    if (component.type === "lcd") {

        const label =
            element.querySelector(
                ".component-3d-label"
            );

        if (label) {
            label.textContent =
                component.displayText ||
                component.name;
        }
    }
}














/* ================================================================
   FOBAS ELECTRONIQUE & ROBOTIQUE
   WIRE & CABLE INTERACTION ENGINE — V1.0.0
   ---------------------------------------------------------------
   BLOC ISOLÉ / INDÉPENDANT

   FONCTIONS :
   - Création visuelle des fils
   - Fils rouge / noir / jaune / bleu / vert / orange / blanc / violet
   - Sélection du fil
   - Déplacement du fil entier
   - Poignée A interactive
   - Poignée B interactive
   - Redimensionnement libre
   - Détection des broches des composants
   - Connexion PIN → WIRE → PIN
   - Suivi des composants connectés
   - Superposition des fils autorisée
   - Aucun Three.js
   - Aucune image externe
================================================================ */

(function FOBASWireCableInteractionEngine() {

    "use strict";

    /* ============================================================
       01. ENGINE STATE
    ============================================================ */

    const ENGINE_NAME = "FOBAS_WIRE_CABLE_INTERACTION_ENGINE";
    const ENGINE_VERSION = "1.0.0";

    const state = {
        activeWire: null,
        action: null,
        startX: 0,
        startY: 0,
        originalA: null,
        originalB: null,
        wireCounter: 0,
        initialized: false
    };

    const wireRegistry = new Map();

    const COLORS = {
        red: "#d32f2f",
        black: "#212121",
        yellow: "#f9a825",
        blue: "#1565c0",
        green: "#2e7d32",
        orange: "#ef6c00",
        white: "#f5f5f5",
        violet: "#7b1fa2"
    };


    /* ============================================================
       02. SAFE DOM HELPERS
    ============================================================ */

    function getWorkspace() {

        const selectors = [
            "#electronicLaboratoryWorkspace",
            "#electronicsLaboratoryWorkspace",
            "#roboticsLaboratoryWorkspace",
            "#laboratoryWorkspace",
            "#labWorkspace",
            "#workspace",
            "#simulationWorkspace",
            ".electronic-laboratory-workspace",
            ".electronics-laboratory-workspace"
        ];

        for (const selector of selectors) {

            const element = document.querySelector(selector);

            if (element) {
                return element;
            }
        }

        return null;
    }


    function createSVGElement(tag, attributes = {}) {

        const element = document.createElementNS(
            "http://www.w3.org/2000/svg",
            tag
        );

        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        });

        return element;
    }


    function getPointFromEvent(event, workspace) {

        const rect = workspace.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }


    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }


    /* ============================================================
       03. WIRE COLOR
    ============================================================ */

    function normalizeWireColor(definition) {

        if (!definition) {
            return COLORS.black;
        }

        if (definition.wireColor) {
            return definition.wireColor;
        }

        const id = String(definition.id || "").toLowerCase();

        if (id.includes("red")) {
            return COLORS.red;
        }

        if (id.includes("black")) {
            return COLORS.black;
        }

        if (id.includes("yellow")) {
            return COLORS.yellow;
        }

        if (id.includes("blue")) {
            return COLORS.blue;
        }

        if (id.includes("green")) {
            return COLORS.green;
        }

        if (id.includes("orange")) {
            return COLORS.orange;
        }

        if (id.includes("white")) {
            return COLORS.white;
        }

        if (id.includes("violet") || id.includes("purple")) {
            return COLORS.violet;
        }

        return COLORS.black;
    }


    /* ============================================================
       04. WIRE DEFINITION
    ============================================================ */

    function getWireDefinition(type = "wire") {

        if (
            typeof getComponentDefinition === "function"
        ) {

            const definition =
                getComponentDefinition(type);

            if (definition) {
                return definition;
            }
        }

        if (
            typeof COMPONENTS !== "undefined" &&
            Array.isArray(COMPONENTS)
        ) {

            const definition =
                COMPONENTS.find(item => item.id === type);

            if (definition) {
                return definition;
            }
        }

        return {
            id: type,
            name: "Fil de connexion",
            category: "wires",
            color: COLORS.black,
            wireColor: COLORS.black,
            width: 130,
            height: 45,
            pins: [
                {
                    id: "A",
                    name: "A",
                    side: "left"
                },
                {
                    id: "B",
                    name: "B",
                    side: "right"
                }
            ]
        };
    }


    /* ============================================================
       05. WIRE SVG LAYER
    ============================================================ */

    function ensureWireLayer(workspace) {

        let layer =
            workspace.querySelector(
                '[data-fobas-wire-layer="true"]'
            );

        if (layer) {
            return layer;
        }

        layer = createSVGElement("svg", {
            "data-fobas-wire-layer": "true",
            class: "fobas-wire-cable-layer",
            width: "100%",
            height: "100%",
            viewBox:
                `0 0 ${workspace.clientWidth || 1200} ${workspace.clientHeight || 700}`,
            preserveAspectRatio: "none"
        });

        layer.style.position = "absolute";
        layer.style.left = "0";
        layer.style.top = "0";
        layer.style.width = "100%";
        layer.style.height = "100%";
        layer.style.pointerEvents = "none";
        layer.style.overflow = "visible";
        layer.style.zIndex = "20";

        workspace.style.position =
            workspace.style.position || "relative";

        workspace.insertBefore(
            layer,
            workspace.firstChild
        );

        return layer;
    }


    /* ============================================================
       06. CREATE WIRE OBJECT
    ============================================================ */

    function createWire(type = "wire", options = {}) {

        const workspace = getWorkspace();

        if (!workspace) {
            console.warn(
                `[${ENGINE_NAME}] Workspace introuvable.`
            );

            return null;
        }

        const definition =
            getWireDefinition(type);

        state.wireCounter++;

        const id =
            options.id ||
            `fobas-wire-${Date.now()}-${state.wireCounter}`;

        const width =
            Number(options.width) ||
            Number(definition.width) ||
            130;

        const height =
            Number(options.height) ||
            Number(definition.height) ||
            45;

        const x =
            Number.isFinite(options.x)
                ? options.x
                : Math.max(
                    20,
                    (workspace.clientWidth / 2) - width / 2
                );

        const y =
            Number.isFinite(options.y)
                ? options.y
                : Math.max(
                    20,
                    (workspace.clientHeight / 2) - 25
                );

        const wire = {
            id,
            type,
            definition,

            color:
                options.color ||
                normalizeWireColor(definition),

            a: {
                x: x,
                y: y
            },

            b: {
                x: x + width,
                y: y
            },

            connections: {
                A: null,
                B: null
            },

            selected: false,

            group: null,

            element: null,
            path: null,
            shadow: null,
            handleA: null,
            handleB: null,

            createdAt: Date.now()
        };

        wireRegistry.set(id, wire);

        renderWire(wire);

        return wire;
    }


    /* ============================================================
       07. RENDER WIRE
    ============================================================ */

    function renderWire(wire) {

        if (!wire) {
            return;
        }

        const workspace = getWorkspace();

        if (!workspace) {
            return;
        }

        const layer =
            ensureWireLayer(workspace);

        let group = wire.element;

        if (!group) {

            group =
                createSVGElement("g", {
                    "data-fobas-wire-id": wire.id,
                    class: "fobas-wire-object"
                });

            group.style.pointerEvents = "all";
            group.style.cursor = "move";

            const shadow =
                createSVGElement("path", {
                    fill: "none",
                    stroke: "#000000",
                    "stroke-width": "12",
                    "stroke-linecap": "round",
                    opacity: "0.18"
                });

            const path =
                createSVGElement("path", {
                    fill: "none",
                    "stroke-width": "7",
                    "stroke-linecap": "round"
                });

            const highlight =
                createSVGElement("path", {
                    fill: "none",
                    stroke: "#ffffff",
                    "stroke-width": "2",
                    "stroke-linecap": "round",
                    opacity: "0.45"
                });

            const handleA =
                createSVGElement("circle", {
                    r: "8",
                    cx: "0",
                    cy: "0"
                });

            const handleB =
                createSVGElement("circle", {
                    r: "8",
                    cx: "0",
                    cy: "0"
                });

            handleA.setAttribute(
                "data-fobas-wire-handle",
                "A"
            );

            handleB.setAttribute(
                "data-fobas-wire-handle",
                "B"
            );

            handleA.style.cursor = "crosshair";
            handleB.style.cursor = "crosshair";

            handleA.style.display = "none";
            handleB.style.display = "none";

            group.appendChild(shadow);
            group.appendChild(path);
            group.appendChild(highlight);
            group.appendChild(handleA);
            group.appendChild(handleB);

            layer.appendChild(group);

            wire.element = group;
            wire.shadow = shadow;
            wire.path = path;
            wire.highlight = highlight;
            wire.handleA = handleA;
            wire.handleB = handleB;

            attachWireEvents(wire);
        }

        const pathData =
            createWirePath(
                wire.a,
                wire.b
            );

        wire.shadow.setAttribute(
            "d",
            pathData
        );

        wire.path.setAttribute(
            "d",
            pathData
        );

        wire.highlight.setAttribute(
            "d",
            pathData
        );

        wire.path.setAttribute(
            "stroke",
            wire.color
        );

        wire.handleA.setAttribute(
            "cx",
            wire.a.x
        );

        wire.handleA.setAttribute(
            "cy",
            wire.a.y
        );

        wire.handleB.setAttribute(
            "cx",
            wire.b.x
        );

        wire.handleB.setAttribute(
            "cy",
            wire.b.y
        );

        updateWireSelectionVisual(wire);
    }


    /* ============================================================
       08. WIRE PATH
    ============================================================ */

    function createWirePath(a, b) {

        const dx =
            Math.abs(b.x - a.x);

        const curve =
            Math.max(
                25,
                Math.min(
                    100,
                    dx * 0.35
                )
            );

        return [
            `M ${a.x} ${a.y}`,
            `C ${a.x + curve} ${a.y}`,
            `${b.x - curve} ${b.y}`,
            `${b.x} ${b.y}`
        ].join(" ");
    }


    /* ============================================================
       09. SELECTION VISUAL
    ============================================================ */

    function updateWireSelectionVisual(wire) {

        if (!wire) {
            return;
        }

        if (wire.selected) {

            wire.path.setAttribute(
                "stroke-width",
                "9"
            );

            wire.highlight.setAttribute(
                "opacity",
                "0.75"
            );

            wire.handleA.style.display =
                "block";

            wire.handleB.style.display =
                "block";

            wire.handleA.setAttribute(
                "fill",
                "#ffffff"
            );

            wire.handleB.setAttribute(
                "fill",
                "#ffffff"
            );

            wire.handleA.setAttribute(
                "stroke",
                wire.color
            );

            wire.handleB.setAttribute(
                "stroke",
                wire.color
            );

            wire.handleA.setAttribute(
                "stroke-width",
                "3"
            );

            wire.handleB.setAttribute(
                "stroke-width",
                "3"
            );

        } else {

            wire.path.setAttribute(
                "stroke-width",
                "7"
            );

            wire.highlight.setAttribute(
                "opacity",
                "0.45"
            );

            wire.handleA.style.display =
                "none";

            wire.handleB.style.display =
                "none";
        }
    }


    /* ============================================================
       10. WIRE EVENTS
    ============================================================ */

    function attachWireEvents(wire) {

        const group =
            wire.element;

        group.addEventListener(
            "pointerdown",
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                const target =
                    event.target;

                const handle =
                    target.closest
                        ? target.closest(
                            "[data-fobas-wire-handle]"
                        )
                        : null;

                if (handle) {

                    const side =
                        handle.getAttribute(
                            "data-fobas-wire-handle"
                        );

                    beginWireResize(
                        wire,
                        side,
                        event
                    );

                    return;
                }

                selectWire(wire);

                beginWireMove(
                    wire,
                    event
                );
            }
        );
    }


    /* ============================================================
       11. SELECT WIRE
    ============================================================ */

    function selectWire(wire) {

        wireRegistry.forEach(item => {

            if (item !== wire) {
                item.selected = false;

                if (item.element) {
                    updateWireSelectionVisual(
                        item
                    );
                }
            }
        });

        wire.selected = true;

        updateWireSelectionVisual(wire);

        state.activeWire =
            wire;

        document.dispatchEvent(
            new CustomEvent(
                "fobas:wire-selected",
                {
                    detail: {
                        wire
                    }
                }
            )
        );
    }


    /* ============================================================
       12. BEGIN MOVE
    ============================================================ */

    function beginWireMove(wire, event) {

        const workspace =
            getWorkspace();

        if (!workspace) {
            return;
        }

        state.action = "move";
        state.activeWire = wire;

        const point =
            getPointFromEvent(
                event,
                workspace
            );

        state.startX =
            point.x;

        state.startY =
            point.y;

        state.originalA = {
            x: wire.a.x,
            y: wire.a.y
        };

        state.originalB = {
            x: wire.b.x,
            y: wire.b.y
        };

        window.addEventListener(
            "pointermove",
            handlePointerMove,
            true
        );

        window.addEventListener(
            "pointerup",
            finishPointerAction,
            true
        );
    }


    /* ============================================================
       13. BEGIN RESIZE
    ============================================================ */

    function beginWireResize(
        wire,
        side,
        event
    ) {

        const workspace =
            getWorkspace();

        if (!workspace) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        selectWire(wire);

        state.action =
            side === "A"
                ? "resizeA"
                : "resizeB";

        state.activeWire =
            wire;

        const point =
            getPointFromEvent(
                event,
                workspace
            );

        state.startX =
            point.x;

        state.startY =
            point.y;

        state.originalA = {
            x: wire.a.x,
            y: wire.a.y
        };

        state.originalB = {
            x: wire.b.x,
            y: wire.b.y
        };

        window.addEventListener(
            "pointermove",
            handlePointerMove,
            true
        );

        window.addEventListener(
            "pointerup",
            finishPointerAction,
            true
        );
    }


    /* ============================================================
       14. POINTER MOVE
    ============================================================ */

    function handlePointerMove(event) {

        const wire =
            state.activeWire;

        const workspace =
            getWorkspace();

        if (
            !wire ||
            !workspace ||
            !state.action
        ) {
            return;
        }

        event.preventDefault();

        const point =
            getPointFromEvent(
                event,
                workspace
            );

        const dx =
            point.x - state.startX;

        const dy =
            point.y - state.startY;

        if (state.action === "move") {

            const newA = {
                x: state.originalA.x + dx,
                y: state.originalA.y + dy
            };

            const newB = {
                x: state.originalB.x + dx,
                y: state.originalB.y + dy
            };

            wire.a =
                constrainPoint(
                    newA,
                    workspace
                );

            wire.b =
                constrainPoint(
                    newB,
                    workspace
                );

        }

        else if (
            state.action === "resizeA"
        ) {

            wire.a =
                constrainPoint(
                    {
                        x: state.originalA.x + dx,
                        y: state.originalA.y + dy
                    },
                    workspace
                );

        }

        else if (
            state.action === "resizeB"
        ) {

            wire.b =
                constrainPoint(
                    {
                        x: state.originalB.x + dx,
                        y: state.originalB.y + dy
                    },
                    workspace
                );
        }

        renderWire(wire);

        updateWireConnections(wire);
    }


    /* ============================================================
       15. CONSTRAIN POINT
    ============================================================ */

    function constrainPoint(
        point,
        workspace
    ) {

        const padding = 5;

        return {
            x: clamp(
                point.x,
                padding,
                Math.max(
                    padding,
                    workspace.clientWidth - padding
                )
            ),

            y: clamp(
                point.y,
                padding,
                Math.max(
                    padding,
                    workspace.clientHeight - padding
                )
            )
        };
    }


    /* ============================================================
       16. FINISH POINTER ACTION
    ============================================================ */

    function finishPointerAction() {

        const wire =
            state.activeWire;

        if (wire) {

            detectEndpointConnections(
                wire,
                "A"
            );

            detectEndpointConnections(
                wire,
                "B"
            );

            updateWireConnections(
                wire
            );
        }

        window.removeEventListener(
            "pointermove",
            handlePointerMove,
            true
        );

        window.removeEventListener(
            "pointerup",
            finishPointerAction,
            true
        );

        state.action =
            null;
    }


    /* ============================================================
       17. COMPONENT ELEMENT DETECTION
    ============================================================ */

    function getComponentElements() {

        const selectors = [
            "[data-component-id]",
            "[data-component-type]",
            ".fobas-electronic-component",
            ".fobas-component",
            ".electronic-component"
        ];

        const elements = [];

        selectors.forEach(selector => {

            document
                .querySelectorAll(selector)
                .forEach(element => {

                    if (
                        !elements.includes(
                            element
                        )
                    ) {
                        elements.push(
                            element
                        );
                    }
                });
        });

        return elements;
    }


    /* ============================================================
       18. GET COMPONENT ID
    ============================================================ */

    function getComponentId(element) {

        if (!element) {
            return null;
        }

        return (
            element.dataset.componentId ||
            element.dataset.componentInstanceId ||
            element.getAttribute(
                "data-component-id"
            ) ||
            element.id ||
            null
        );
    }


    /* ============================================================
       19. GET COMPONENT TYPE
    ============================================================ */

    function getComponentType(element) {

        if (!element) {
            return null;
        }

        return (
            element.dataset.componentType ||
            element.dataset.type ||
            element.getAttribute(
                "data-component-type"
            ) ||
            element.getAttribute(
                "data-type"
            ) ||
            null
        );
    }


    /* ============================================================
       20. COMPONENT PIN DETECTION
    ============================================================ */

    function getComponentPins(element) {

        if (!element) {
            return [];
        }

        const selectors = [
            "[data-pin-id]",
            "[data-pin]",
            ".fobas-pin",
            ".component-pin",
            ".electronic-pin"
        ];

        const pins = [];

        selectors.forEach(selector => {

            element
                .querySelectorAll(selector)
                .forEach(pin => {

                    if (
                        !pins.includes(pin)
                    ) {
                        pins.push(pin);
                    }
                });
        });

        return pins;
    }


    /* ============================================================
       21. PIN CENTER
    ============================================================ */

    function getElementCenter(
        element,
        workspace
    ) {

        const rect =
            element.getBoundingClientRect();

        const workspaceRect =
            workspace.getBoundingClientRect();

        return {
            x:
                rect.left +
                rect.width / 2 -
                workspaceRect.left,

            y:
                rect.top +
                rect.height / 2 -
                workspaceRect.top
        };
    }


    /* ============================================================
       22. FIND NEAREST PIN
    ============================================================ */

    function findNearestPin(
        point,
        maxDistance = 28
    ) {

        const workspace =
            getWorkspace();

        if (!workspace) {
            return null;
        }

        const components =
            getComponentElements();

        let nearest = null;
        let nearestDistance =
            maxDistance;

        components.forEach(
            component => {

                const pins =
                    getComponentPins(
                        component
                    );

                pins.forEach(pin => {

                    const center =
                        getElementCenter(
                            pin,
                            workspace
                        );

                    const distance =
                        Math.hypot(
                            center.x -
                            point.x,

                            center.y -
                            point.y
                        );

                    if (
                        distance <
                        nearestDistance
                    ) {

                        nearestDistance =
                            distance;

                        nearest = {
                            element:
                                pin,

                            component:
                                component,

                            componentId:
                                getComponentId(
                                    component
                                ),

                            componentType:
                                getComponentType(
                                    component
                                ),

                            pinId:
                                pin.dataset.pinId ||
                                pin.dataset.pin ||
                                pin.getAttribute(
                                    "data-pin-id"
                                ) ||
                                pin.getAttribute(
                                    "data-pin"
                                ),

                            point:
                                center
                        };
                    }
                });
            }
        );

        return nearest;
    }


    /* ============================================================
       23. CONNECT ENDPOINT TO PIN
    ============================================================ */

    function connectEndpoint(
        wire,
        side,
        pinInfo
    ) {

        if (
            !wire ||
            !pinInfo
        ) {
            return false;
        }

        wire.connections[side] = {
            component:
                pinInfo.component,

            componentId:
                pinInfo.componentId,

            componentType:
                pinInfo.componentType,

            pin:
                pinInfo.element,

            pinId:
                pinInfo.pinId
        };

        wire[side.toLowerCase()] = {
            x: pinInfo.point.x,
            y: pinInfo.point.y
        };

        markPinConnected(
            pinInfo.element,
            wire,
            side
        );

        renderWire(wire);

        document.dispatchEvent(
            new CustomEvent(
                "fobas:wire-connected",
                {
                    detail: {
                        wire,
                        side,
                        connection:
                            wire.connections[
                                side
                            ]
                    }
                }
            )
        );

        return true;
    }


    /* ============================================================
       24. DISCONNECT ENDPOINT
    ============================================================ */

    function disconnectEndpoint(
        wire,
        side
    ) {

        if (
            !wire ||
            !wire.connections[side]
        ) {
            return;
        }

        const connection =
            wire.connections[side];

        if (connection.pin) {

            connection.pin.removeAttribute(
                "data-fobas-connected"
            );

            connection.pin.removeAttribute(
                "data-fobas-wire-id"
            );
        }

        wire.connections[side] =
            null;

        document.dispatchEvent(
            new CustomEvent(
                "fobas:wire-disconnected",
                {
                    detail: {
                        wire,
                        side
                    }
                }
            )
        );
    }


    /* ============================================================
       25. DETECT ENDPOINT CONNECTION
    ============================================================ */

    function detectEndpointConnections(
        wire,
        side
    ) {

        if (!wire) {
            return;
        }

        const point =
            side === "A"
                ? wire.a
                : wire.b;

        const nearest =
            findNearestPin(
                point,
                30
            );

        if (nearest) {

            connectEndpoint(
                wire,
                side,
                nearest
            );

        } else {

            if (
                wire.connections[side]
            ) {
                disconnectEndpoint(
                    wire,
                    side
                );
            }
        }
    }


    /* ============================================================
       26. MARK PIN CONNECTED
    ============================================================ */

    function markPinConnected(
        pin,
        wire,
        side
    ) {

        if (!pin) {
            return;
        }

        pin.setAttribute(
            "data-fobas-connected",
            "true"
        );

        pin.setAttribute(
            "data-fobas-wire-id",
            wire.id
        );

        pin.setAttribute(
            "data-fobas-wire-side",
            side
        );
    }


    /* ============================================================
       27. UPDATE CONNECTED WIRES
    ============================================================ */

    function updateWireConnections(wire) {

        if (!wire) {
            return;
        }

        ["A", "B"].forEach(side => {

            const connection =
                wire.connections[side];

            if (
                !connection ||
                !connection.pin
            ) {
                return;
            }

            const workspace =
                getWorkspace();

            if (!workspace) {
                return;
            }

            const point =
                getElementCenter(
                    connection.pin,
                    workspace
                );

            if (side === "A") {
                wire.a = point;
            } else {
                wire.b = point;
            }
        });

        renderWire(wire);
    }


    /* ============================================================
       28. UPDATE ALL CONNECTED WIRES
    ============================================================ */

    function updateAllConnectedWires() {

        wireRegistry.forEach(
            wire => {

                updateWireConnections(
                    wire
                );
            }
        );
    }


    /* ============================================================
       29. COMPONENT MOVE OBSERVER
    ============================================================ */

    function installComponentObserver() {

        if (
            typeof MutationObserver ===
            "undefined"
        ) {
            return;
        }

        const workspace =
            getWorkspace();

        if (!workspace) {
            return;
        }

        const observer =
            new MutationObserver(
                function() {

                    updateAllConnectedWires();
                }
            );

        observer.observe(
            workspace,
            {
                attributes: true,
                childList: true,
                subtree: true
            }
        );
    }


    /* ============================================================
       30. CREATE WIRE FROM DEFINITION
    ============================================================ */

    function addWire(type = "wire", options = {}) {

        return createWire(
            type,
            options
        );
    }


    /* ============================================================
       31. QUICK COLOR FUNCTIONS
    ============================================================ */

    function addRedWire(options = {}) {

        return addWire(
            "wire-red",
            {
                ...options,
                color:
                    COLORS.red
            }
        );
    }


    function addBlackWire(options = {}) {

        return addWire(
            "wire-black",
            {
                ...options,
                color:
                    COLORS.black
            }
        );
    }


    function addGreenWire(options = {}) {

        return addWire(
            "wire-green",
            {
                ...options,
                color:
                    COLORS.green
            }
        );
    }


    function addColoredWire(
        color,
        options = {}
    ) {

        const normalized =
            String(
                color || "black"
            ).toLowerCase();

        const selectedColor =
            COLORS[normalized] ||
            COLORS.black;

        return addWire(
            "wire",
            {
                ...options,
                color:
                    selectedColor
            }
        );
    }


    /* ============================================================
       32. DELETE WIRE
    ============================================================ */

    function deleteWire(wireOrId) {

        const wire =
            typeof wireOrId === "string"
                ? wireRegistry.get(
                    wireOrId
                )
                : wireOrId;

        if (!wire) {
            return false;
        }

        disconnectEndpoint(
            wire,
            "A"
        );

        disconnectEndpoint(
            wire,
            "B"
        );

        if (
            wire.element &&
            wire.element.parentNode
        ) {

            wire.element.parentNode.removeChild(
                wire.element
            );
        }

        wireRegistry.delete(
            wire.id
        );

        if (
            state.activeWire === wire
        ) {
            state.activeWire =
                null;
        }

        document.dispatchEvent(
            new CustomEvent(
                "fobas:wire-deleted",
                {
                    detail: {
                        wire
                    }
                }
            )
        );

        return true;
    }


    /* ============================================================
       33. GET WIRE
    ============================================================ */

    function getWire(id) {

        return wireRegistry.get(
            id
        ) || null;
    }


    /* ============================================================
       34. GET ALL WIRES
    ============================================================ */

    function getAllWires() {

        return Array.from(
            wireRegistry.values()
        );
    }


    /* ============================================================
       35. CLEAR WIRES
    ============================================================ */

    function clearAllWires() {

        getAllWires().forEach(
            wire => {
                deleteWire(wire);
            }
        );
    }


    /* ============================================================
       36. PUBLIC API
    ============================================================ */

    window.FOBASWireCableEngine = {

        name:
            ENGINE_NAME,

        version:
            ENGINE_VERSION,

        state,

        colors:
            COLORS,

        addWire,

        addRedWire,

        addBlackWire,

        addGreenWire,

        addColoredWire,

        createWire,

        selectWire,

        deleteWire,

        getWire,

        getAllWires,

        clearAllWires,

        updateAllConnectedWires,

        connectEndpoint,

        disconnectEndpoint,

        detectEndpointConnections,

        renderWire
    };


    /* ============================================================
       37. INITIALIZATION
    ============================================================ */

    function initialize() {

        if (
            state.initialized
        ) {
            return;
        }

        const workspace =
            getWorkspace();

        if (!workspace) {

            setTimeout(
                initialize,
                500
            );

            return;
        }

        ensureWireLayer(
            workspace
        );

        installComponentObserver();

        state.initialized =
            true;

        document.dispatchEvent(
            new CustomEvent(
                "fobas:wire-engine-ready",
                {
                    detail: {
                        engine:
                            ENGINE_NAME,

                        version:
                            ENGINE_VERSION
                    }
                }
            )
        );
    }


    /* ============================================================
       38. SAFE START
    ============================================================ */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();
    }

})();







    /* ============================================================
       10. COMPONENT EVENTS
    ============================================================ */

    function attachComponentEvents(element, component) {
        if (!element || !component) return;

        element.onpointerdown = event => {
            if (event.button !== undefined && event.button !== 0) {
                return;
            }

            const pin = event.target.closest(".electronic-pin");

            if (pin) {
                event.preventDefault();
                event.stopPropagation();

                handlePinPointerDown(event, component, pin);
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            if (state.activeTool === "delete") {
                deleteComponent(component.id);
                return;
            }

            if (state.activeTool === "rotate") {
                rotateComponent(component.id);
                return;
            }

            if (state.activeTool === "duplicate") {
                duplicateComponent(component.id);
                return;
            }

            selectComponent(component.id);

            if (state.activeTool === "move") {
                beginComponentDrag(event, component, element);
            }
        };

        element.onclick = event => {
            if (event.target.closest(".electronic-pin")) {
                return;
            }

            if (state.activeTool === "select") {
                selectComponent(component.id);
            }
        };

        element.ondblclick = event => {
            if (event.target.closest(".electronic-pin")) {
                return;
            }

            openComponentDetails(component.type);
        };

        element.onkeydown = event => {
            if (event.key === "Delete") {
                deleteComponent(component.id);
            }

            if (event.key === "r" || event.key === "R") {
                rotateComponent(component.id);
            }

            if (event.key === "Escape") {
                selectComponent(null);
            }
        };

        if (component.type === "push-button") {
            element.addEventListener("pointerdown", event => {
                if (state.activeTool !== "move") return;
                if (event.target.closest(".electronic-pin")) return;

                component.state = "pressed";
                renderComponent(component);
                runSimulation();
            });

            element.addEventListener("pointerup", () => {
                if (component.type !== "push-button") return;

                component.state = "released";
                renderComponent(component);
                runSimulation();
            });
        }
    }

    /* ============================================================
       11. SELECTION
    ============================================================ */

    function selectComponent(id) {
        state.selectedComponentId = id || null;

        state.components.forEach(component => {
            const element = document.getElementById(component.id);

            if (element) {
                element.classList.toggle(
                    "selected",
                    component.id === state.selectedComponentId
                );
            }
        });

        updateWorkspaceState();
    }

    /* ============================================================
       12. DRAG ENGINE
    ============================================================ */

    function beginComponentDrag(event, component, element) {
        if (!component || !element) return;

        state.drag.active = true;
        state.drag.componentId = component.id;
        state.drag.pointerId = event.pointerId;

        const point = clientToWorkspace(event.clientX, event.clientY);

        state.drag.offsetX = point.x - component.x;
        state.drag.offsetY = point.y - component.y;

        try {
            element.setPointerCapture(event.pointerId);
        } catch (_) {
            /* Pointer capture unavailable: document listeners remain active. */
        }

        element.onpointermove = dragComponentPointerMove;
        element.onpointerup = endComponentDrag;
        element.onpointercancel = endComponentDrag;

        setStatus("Déplacement du composant", "working");
    }

    function dragComponentPointerMove(event) {
        if (!state.drag.active) return;
        if (event.pointerId !== state.drag.pointerId) return;

        event.preventDefault();

        const component = findComponent(state.drag.componentId);

        if (!component) {
            endComponentDrag(event);
            return;
        }

        const point = clientToWorkspace(event.clientX, event.clientY);

        component.x = point.x - state.drag.offsetX;
        component.y = point.y - state.drag.offsetY;

        clampComponentPosition(component);

        const element = document.getElementById(component.id);

        if (element) {
            element.style.left = `${component.x}px`;
            element.style.top = `${component.y}px`;
        }

        renderWires();
    }

    function endComponentDrag(event) {
        if (!state.drag.active) return;
        if (
            event &&
            event.pointerId !== undefined &&
            event.pointerId !== state.drag.pointerId
        ) {
            return;
        }

        const component = findComponent(state.drag.componentId);

        if (component) {
            renderComponent(component);
        }

        state.drag.active = false;
        state.drag.componentId = null;
        state.drag.pointerId = null;
        state.drag.offsetX = 0;
        state.drag.offsetY = 0;

        renderWires();
        updateWorkspaceState();

        setStatus("Simulation prête", "ready");
    }

    function clampComponentPosition(component) {
        const viewportWidth =
            dom.canvas?.clientWidth || dom.viewport?.clientWidth || 1000;

        const viewportHeight =
            dom.canvas?.clientHeight || dom.viewport?.clientHeight || 700;

        component.x = Math.max(
            -component.width + 15,
            Math.min(component.x, viewportWidth - 15)
        );

        component.y = Math.max(
            -component.height + 15,
            Math.min(component.y, viewportHeight - 15)
        );
    }

    /* ============================================================
       13. POINTER COORDINATE CONVERSION
    ============================================================ */

    function clientToWorkspace(clientX, clientY) {
        if (!dom.viewport || !dom.canvas) {
            return { x: clientX, y: clientY };
        }

        const rect = dom.viewport.getBoundingClientRect();

        return {
            x:
                (clientX - rect.left - state.panX) /
                state.zoom,
            y:
                (clientY - rect.top - state.panY) /
                state.zoom
        };
    }

    /* ============================================================
       14. TOOL MANAGEMENT
    ============================================================ */

    function setActiveTool(tool) {
        const validTools = [
            "select",
            "wire",
            "move",
            "rotate",
            "delete",
            "duplicate"
        ];

        if (!validTools.includes(tool)) {
            tool = "select";
        }

        state.activeTool = tool;

        const buttons = [
            [dom.selectToolBtn, "select"],
            [dom.wireToolBtn, "wire"],
            [dom.moveToolBtn, "move"],
            [dom.rotateToolBtn, "rotate"],
            [dom.deleteToolBtn, "delete"],
            [dom.duplicateToolBtn, "duplicate"]
        ];

        buttons.forEach(([button, value]) => {
            if (!button) return;

            button.classList.toggle(
                "active",
                value === state.activeTool
            );
        });

        state.wireStart = null;

        if (tool === "wire") {
            setStatus(
                "Fil actif : sélectionnez deux pins",
                "working"
            );
        } else if (tool === "delete") {
            setStatus(
                "Suppression active : touchez un composant",
                "working"
            );
        } else if (tool === "move") {
            setStatus(
                "Déplacement actif : touchez puis glissez",
                "working"
            );
        } else {
            setStatus("Simulation prête", "ready");
        }
    }

    /* ============================================================
       15. ROTATE / DELETE / DUPLICATE
    ============================================================ */

    function rotateComponent(id) {
        const component = findComponent(id);

        if (!component) {
            showToast("Sélectionnez un composant à tourner.", "warning");
            return;
        }

        component.rotation =
            (Number(component.rotation || 0) + 90) % 360;

        renderComponent(component);
        renderWires();
        updateWorkspaceState();

        showToast(
            `${component.name} tourné à ${component.rotation}°.`,
            "success"
        );
    }

    function deleteComponent(id) {
        const component = findComponent(id);

        if (!component) {
            showToast("Aucun composant sélectionné.", "warning");
            return;
        }

        state.components = state.components.filter(
            item => item.id !== id
        );

        state.wires = state.wires.filter(
            wire =>
                wire.from.componentId !== id &&
                wire.to.componentId !== id
        );

        const element = document.getElementById(id);

        if (element) {
            element.remove();
        }

        if (state.selectedComponentId === id) {
            state.selectedComponentId = null;
        }

        renderWires();
        updateWorkspaceState();
        runSimulation();

        showToast(`${component.name} supprimé.`, "success");
    }

    function duplicateComponent(id) {
        const source = findComponent(id);

        if (!source) {
            showToast("Sélectionnez un composant à dupliquer.", "warning");
            return;
        }

        const copy = createComponentInstance(source.type, {
            x: source.x + 35,
            y: source.y + 35,
            rotation: source.rotation,
            state: source.state,
            value: source.value,
            angle: source.angle,
            speed: source.speed,
            frequency: source.frequency,
            displayText: source.displayText,
            pinStates: { ...source.pinStates },
            pinModes: { ...source.pinModes },
            analogValues: { ...source.analogValues },
            digitalValues: { ...source.digitalValues }
        });

        if (copy) {
            selectComponent(copy.id);
            showToast(`${source.name} dupliqué.`, "success");
        }
    }

    /* ============================================================
       16. WIRING ENGINE
    ============================================================ */

    function handlePinPointerDown(event, component, pinElement) {
        if (state.activeTool !== "wire") {
            selectComponent(component.id);
            return;
        }

        const pinId = pinElement.dataset.pinId;

        if (!pinId) return;

        if (!state.wireStart) {
            state.wireStart = {
                componentId: component.id,
                pinId
            };

            pinElement.classList.add("wire-start");

            setStatus(
                `Pin ${pinElement.dataset.pinName} sélectionné — choisissez le second pin`,
                "working"
            );

            return;
        }

        if (
            state.wireStart.componentId === component.id &&
            state.wireStart.pinId === pinId
        ) {
            state.wireStart = null;
            renderAllComponents();
            setStatus("Connexion annulée", "ready");
            return;
        }

        createWire(
            state.wireStart.componentId,
            state.wireStart.pinId,
            component.id,
            pinId
        );

        state.wireStart = null;

        renderAllComponents();
        renderWires();
        updateWorkspaceState();
        runSimulation();
    }

    function createWire(fromComponentId, fromPinId, toComponentId, toPinId) {
        const duplicate = state.wires.some(wire =>
            (
                wire.from.componentId === fromComponentId &&
                wire.from.pinId === fromPinId &&
                wire.to.componentId === toComponentId &&
                wire.to.pinId === toPinId
            ) ||
            (
                wire.from.componentId === toComponentId &&
                wire.from.pinId === toPinId &&
                wire.to.componentId === fromComponentId &&
                wire.to.pinId === fromPinId
            )
        );

        if (duplicate) {
            showToast("Cette connexion existe déjà.", "warning");
            return;
        }

        state.wires.push({
            id: uid("wire"),
            from: {
                componentId: fromComponentId,
                pinId: fromPinId
            },
            to: {
                componentId: toComponentId,
                pinId: toPinId
            },
            active: false
        });

        showToast("Connexion créée.", "success");
    }

    function getPinPosition(componentId, pinId) {
        const component = findComponent(componentId);

        if (!component) return null;

        const definition = getComponentDefinition(component.type);

        if (!definition) return null;

        const pinIndex = definition.pins.findIndex(
            pin => pin.id === pinId
        );

        if (pinIndex < 0) return null;

        const pin = definition.pins[pinIndex];

        const sidePins = definition.pins.filter(
            item => item.side === pin.side
        );

        const indexOnSide = sidePins.findIndex(
            item => item.id === pin.id
        );

        const ratio =
            (indexOnSide + 1) /
            (sidePins.length + 1);

        let x = component.x + component.width / 2;
        let y = component.y + component.height / 2;

        if (pin.side === "left") {
            x = component.x;
            y = component.y + component.height * ratio;
        }

        if (pin.side === "right") {
            x = component.x + component.width;
            y = component.y + component.height * ratio;
        }

        if (pin.side === "top") {
            x = component.x + component.width * ratio;
            y = component.y;
        }

        if (pin.side === "bottom") {
            x = component.x + component.width * ratio;
            y = component.y + component.height;
        }

        return { x, y };
    }

    function renderWires() {
        if (!dom.wireLayer) return;

        const width =
            dom.canvas?.clientWidth ||
            dom.viewport?.clientWidth ||
            1000;

        const height =
            dom.canvas?.clientHeight ||
            dom.viewport?.clientHeight ||
            700;

        dom.wireLayer.setAttribute("width", String(width));
        dom.wireLayer.setAttribute("height", String(height));
        dom.wireLayer.setAttribute(
            "viewBox",
            `0 0 ${width} ${height}`
        );

        dom.wireLayer.innerHTML = "";

        state.wires.forEach(wire => {
            const from = getPinPosition(
                wire.from.componentId,
                wire.from.pinId
            );

            const to = getPinPosition(
                wire.to.componentId,
                wire.to.pinId
            );

            if (!from || !to) return;

            const midX = (from.x + to.x) / 2;

            const path = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path"
            );

            path.setAttribute(
                "d",
                `M ${from.x} ${from.y}
                 C ${midX} ${from.y},
                   ${midX} ${to.y},
                   ${to.x} ${to.y}`
            );

            path.setAttribute(
                "class",
                wire.active ? "electronic-wire active" : "electronic-wire"
            );

            path.dataset.wireId = wire.id;

            dom.wireLayer.appendChild(path);
        });
    }

    /* ============================================================
       17. ADD COMPONENT
    ============================================================ */

    function addComponent(type, options = {}) {
        const component = createComponentInstance(type, options);

        if (!component) return null;

        selectComponent(component.id);
        renderWires();
        updateWorkspaceState();

        return component;
    }

    /* ============================================================
       18. COMPONENT DETAILS
    ============================================================ */

    function openComponentDetails(type) {
        const definition = getComponentDefinition(type);

        if (!definition || !dom.componentDetailsModal) return;

        state.selectedComponentType = type;

        if (dom.componentDetailsTitle) {
            dom.componentDetailsTitle.textContent =
                definition.name;
        }

        if (dom.componentDetailsVisual) {
            dom.componentDetailsVisual.innerHTML =
                createComponentVisualHTML(definition);
        }

        if (dom.componentDetailsProperties) {
            dom.componentDetailsProperties.innerHTML = `
                <div><strong>Catégorie :</strong> ${escapeHTML(definition.category)}</div>
                <div><strong>Dimensions :</strong> ${definition.width} × ${definition.height}</div>
                <div><strong>Pins :</strong> ${definition.pins
                    .map(pin => escapeHTML(pin.name))
                    .join(", ")}</div>
                ${
                    definition.resistance
                        ? `<div><strong>Résistance :</strong> ${definition.resistance} Ω</div>`
                        : ""
                }
                ${
                    definition.voltage
                        ? `<div><strong>Tension :</strong> ${definition.voltage} V</div>`
                        : ""
                }
            `;
        }

        dom.componentDetailsModal.classList.remove("hidden");
        dom.componentDetailsModal.setAttribute("aria-hidden", "false");
    }

    function closeComponentDetails() {
        dom.componentDetailsModal?.classList.add("hidden");
        dom.componentDetailsModal?.setAttribute("aria-hidden", "true");
    }

    /* ============================================================
       19. PANEL MANAGEMENT
    ============================================================ */

    const PANEL_IDS = [
        "componentLibraryPanel",
        "codeLibraryPanel",
        "codeEditorPanel",
        "missionsPanel",
        "diagnosticPanel",
        "faultsPanel",
        "measurementsPanel"
    ];

    function closeAllPanelsExcept(exceptId = null) {
        PANEL_IDS.forEach(id => {
            if (id === exceptId) return;

            const panel = $(id);

            if (!panel) return;

            panel.classList.add("hidden");
            panel.setAttribute("aria-hidden", "true");
        });

        if (exceptId !== "componentLibraryPanel") {
            dom.libraryBtn?.setAttribute("aria-expanded", "false");
        }
    }

    function openPanel(id) {
        const panel = $(id);

        if (!panel) return;

        closeAllPanelsExcept(id);

        panel.classList.remove("hidden");
        panel.setAttribute("aria-hidden", "false");
    }

    function closePanel(id) {
        const panel = $(id);

        if (!panel) return;

        panel.classList.add("hidden");
        panel.setAttribute("aria-hidden", "true");
    }

    /* ============================================================
       20. CODE LIBRARY RENDERING
    ============================================================ */

    function renderCodeLibrary() {
        if (!dom.codeLibraryList) return;

        const currentComponents = state.components.map(
            component => component.type
        );

        const searchText = "";

        const codes = CODE_LIBRARY.filter(code =>
            code.level === state.currentCodeLevel
        ).filter(code => {
            if (!searchText) return true;

            return normalizeText(
                `${code.title} ${code.description} ${code.tags.join(" ")}`
            ).includes(normalizeText(searchText));
        });

        dom.codeLibraryList.innerHTML = "";

        codes.forEach(code => {
            const compatibility = getCodeCompatibility(
                code,
                currentComponents
            );

            const card = document.createElement("article");
            card.className = "code-library-card";
            card.dataset.codeId = code.id;

            const statusText =
                compatibility.score >= 100
                    ? "✓ Montage compatible"
                    : compatibility.score >= 50
                        ? "◐ Compatibilité partielle"
                        : "○ Faites le montage correspondant";

            card.innerHTML = `
                <div class="code-card-header">
                    <div>
                        <h3>${escapeHTML(code.title)}</h3>
                        <span>${escapeHTML(code.category)}</span>
                    </div>

                    <strong class="code-compatibility">
                        ${escapeHTML(statusText)}
                    </strong>
                </div>

                <p>${escapeHTML(code.description)}</p>

                <div class="code-required-components">
                    ${code.requiredTypes.map(type => {
                        const definition = getComponentDefinition(type);
                        return `
                            <span>
                                ${escapeHTML(definition?.name || type)}
                            </span>
                        `;
                    }).join("")}
                </div>

                <pre class="code-library-preview"><code>${escapeHTML(code.code)}</code></pre>

                <div class="code-card-actions">

                    <button
                        type="button"
                        class="code-copy-btn"
                        data-copy-code="${escapeHTML(code.id)}"
                    >
                        📋 COPIER
                    </button>

                    <button
                        type="button"
                        class="code-use-btn"
                        data-use-code="${escapeHTML(code.id)}"
                    >
                        📝 UTILISER DANS L'ÉDITEUR
                    </button>

                </div>
            `;

            dom.codeLibraryList.appendChild(card);
        });
    }

    function getCodeCompatibility(code, currentTypes) {
        if (!code.requiredTypes.length) {
            return { score: 100, missing: [] };
        }

        let matched = 0;
        const missing = [];

        code.requiredTypes.forEach(requiredType => {
            if (currentTypes.includes(requiredType)) {
                matched++;
                return;
            }

            const aliases = componentTypeAliases(requiredType);

            const found = currentTypes.some(currentType =>
                aliases.includes(currentType) ||
                componentTypeAliases(currentType).includes(requiredType)
            );

            if (found) {
                matched++;
            } else {
                missing.push(requiredType);
            }
        });

        return {
            score: Math.round(
                (matched / code.requiredTypes.length) * 100
            ),
            missing
        };
    }

    function openCodeLibrary() {
        closeAllPanelsExcept("codeLibraryPanel");
        renderCodeLibrary();
        openPanel("codeLibraryPanel");
    }

    function useCode(codeId) {
        const code = CODE_LIBRARY.find(item => item.id === codeId);

        if (!code || !dom.electronicCodeEditor) return;

        state.currentCodeId = code.id;
        state.code = code.code;

        dom.electronicCodeEditor.value = code.code;

        openCodeEditor();

        consoleLog(`Code chargé : ${code.title}`, "success");
        consoleLog(
            "Vérifiez que votre montage correspond avant l'exécution.",
            "info"
        );
    }

    function copyCode(codeId) {
        const code = CODE_LIBRARY.find(item => item.id === codeId);

        if (!code) return;

        copyText(code.code).then(success => {
            if (success) {
                showToast("Code copié.", "success");
            } else {
                showToast("Copie automatique indisponible.", "warning");
            }
        });
    }

    async function copyText(text) {
        try {
            if (
                navigator.clipboard &&
                typeof navigator.clipboard.writeText === "function"
            ) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (_) {
            /* Fallback below. */
        }

        try {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";

            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();

            const success = document.execCommand("copy");
            textarea.remove();

            return success;
        } catch (_) {
            return false;
        }
    }

    /* ============================================================
       21. CODE EDITOR
    ============================================================ */

    function openCodeEditor() {
        closeAllPanelsExcept("codeEditorPanel");

        if (dom.codeEditorPanel) {
            dom.codeEditorPanel.classList.remove("hidden");
            dom.codeEditorPanel.setAttribute(
                "aria-hidden",
                "false"
            );
        }

        if (dom.electronicCodeEditor) {
            setTimeout(() => {
                dom.electronicCodeEditor.focus();
            }, 50);
        }
    }

    function validateCode(code = dom.electronicCodeEditor?.value || "") {
        const result = analyzeArduinoCode(code);

        clearConsole();

        if (!result.valid) {
            result.errors.forEach(error =>
                consoleLog(`ERREUR : ${error}`, "error")
            );

            showToast(
                "Le code contient des erreurs.",
                "error"
            );

            return false;
        }

        result.warnings.forEach(warning =>
            consoleLog(`AVERTISSEMENT : ${warning}`, "warning")
        );

        result.instructions.forEach(instruction =>
            consoleLog(
                `✓ ${instruction.description}`,
                "success"
            )
        );

        if (!result.instructions.length) {
            consoleLog(
                "Code syntaxiquement accepté, mais aucune instruction simulable détectée.",
                "warning"
            );
        }

        showToast("Code vérifié.", "success");

        return true;
    }

    function analyzeArduinoCode(code) {
        const source = String(code || "");

        const result = {
            valid: true,
            errors: [],
            warnings: [],
            instructions: [],
            pinModes: {},
            digitalWrites: {},
            analogWrites: {},
            tones: {},
            servoWrites: {},
            digitalReads: [],
            analogReads: [],
            delays: []
        };

        if (!source.trim()) {
            result.valid = false;
            result.errors.push("Le code est vide.");
            return result;
        }

        let braceBalance = 0;

        for (const char of source) {
            if (char === "{") braceBalance++;
            if (char === "}") braceBalance--;

            if (braceBalance < 0) {
                break;
            }
        }

        if (braceBalance !== 0) {
            result.valid = false;
            result.errors.push(
                "Les accolades { } ne sont pas équilibrées."
            );
        }

        const pinModeRegex =
            /pinMode\s*\(\s*([A-Za-z0-9_]+)\s*,\s*(INPUT_PULLUP|INPUT|OUTPUT)\s*\)/gi;

        let match;

        while ((match = pinModeRegex.exec(source))) {
            const pin = normalizePin(match[1]);

            result.pinModes[pin] = match[2].toUpperCase();

            result.instructions.push({
                type: "pinMode",
                pin,
                mode: match[2].toUpperCase(),
                description:
                    `pinMode(${pin}, ${match[2].toUpperCase()})`
            });
        }

        const digitalWriteRegex =
            /digitalWrite\s*\(\s*([A-Za-z0-9_]+)\s*,\s*(HIGH|LOW|1|0)\s*\)/gi;

        while ((match = digitalWriteRegex.exec(source))) {
            const pin = normalizePin(match[1]);
            const value =
                /HIGH|1/i.test(match[2]) ? 1 : 0;

            result.digitalWrites[pin] = value;

            result.instructions.push({
                type: "digitalWrite",
                pin,
                value,
                description:
                    `digitalWrite(${pin}, ${value ? "HIGH" : "LOW"})`
            });
        }

        const analogWriteRegex =
            /analogWrite\s*\(\s*([A-Za-z0-9_]+)\s*,\s*(\d+(?:\.\d+)?)\s*\)/gi;

        while ((match = analogWriteRegex.exec(source))) {
            const pin = normalizePin(match[1]);
            const value = clamp(
                Number(match[2]),
                0,
                255
            );

            result.analogWrites[pin] = value;

            result.instructions.push({
                type: "analogWrite",
                pin,
                value,
                description:
                    `analogWrite(${pin}, ${value})`
            });
        }

        const digitalReadRegex =
            /digitalRead\s*\(\s*([A-Za-z0-9_]+)\s*\)/gi;

        while ((match = digitalReadRegex.exec(source))) {
            const pin = normalizePin(match[1]);

            result.digitalReads.push(pin);

            result.instructions.push({
                type: "digitalRead",
                pin,
                description:
                    `digitalRead(${pin})`
            });
        }

        const analogReadRegex =
            /analogRead\s*\(\s*([A-Za-z0-9_]+)\s*\)/gi;

        while ((match = analogReadRegex.exec(source))) {
            const pin = normalizePin(match[1]);

            result.analogReads.push(pin);

            result.instructions.push({
                type: "analogRead",
                pin,
                description:
                    `analogRead(${pin})`
            });
        }

        const toneRegex =
            /tone\s*\(\s*([A-Za-z0-9_]+)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*(\d+(?:\.\d+)?))?\s*\)/gi;

        while ((match = toneRegex.exec(source))) {
            const pin = normalizePin(match[1]);
            const frequency = Number(match[2]);

            result.tones[pin] = frequency;

            result.instructions.push({
                type: "tone",
                pin,
                frequency,
                duration: match[3]
                    ? Number(match[3])
                    : null,
                description:
                    `tone(${pin}, ${frequency})`
            });
        }

        const noToneRegex =
            /noTone\s*\(\s*([A-Za-z0-9_]+)\s*\)/gi;

        while ((match = noToneRegex.exec(source))) {
            const pin = normalizePin(match[1]);

            result.tones[pin] = 0;

            result.instructions.push({
                type: "noTone",
                pin,
                description:
                    `noTone(${pin})`
            });
        }

        const servoAttachRegex =
            /\.attach\s*\(\s*([A-Za-z0-9_]+)\s*\)/gi;

        while ((match = servoAttachRegex.exec(source))) {
            const pin = normalizePin(match[1]);

            result.instructions.push({
                type: "servoAttach",
                pin,
                description:
                    `Servo.attach(${pin})`
            });
        }

        const servoWriteRegex =
            /\.write\s*\(\s*(\d+(?:\.\d+)?)\s*\)/gi;

        while ((match = servoWriteRegex.exec(source))) {
            const angle = clamp(
                Number(match[1]),
                0,
                180
            );

            const pin =
                findServoAttachPin(source) || "9";

            result.servoWrites[pin] = angle;

            result.instructions.push({
                type: "servoWrite",
                pin,
                angle,
                description:
                    `Servo.write(${angle}°)`
            });
        }

        const delayRegex =
            /delay\s*\(\s*(\d+(?:\.\d+)?)\s*\)/gi;

        while ((match = delayRegex.exec(source))) {
            result.delays.push(Number(match[1]));

            result.instructions.push({
                type: "delay",
                value: Number(match[1]),
                description:
                    `delay(${Number(match[1])} ms)`
            });
        }

        if (/pulseIn\s*\(/i.test(source)) {
            result.instructions.push({
                type: "pulseIn",
                description:
                    "Lecture pulseIn détectée"
            });
        }

        if (/lcd/i.test(source) && /print\s*\(/i.test(source)) {
            result.instructions.push({
                type: "lcdPrint",
                description:
                    "Instruction LCD détectée"
            });
        }

        if (
            !/void\s+setup\s*\(/i.test(source) &&
            !/void\s+loop\s*\(/i.test(source)
        ) {
            result.warnings.push(
                "Le code ne contient ni setup() ni loop()."
            );
        }

        return result;
    }

    function normalizePin(pin) {
        const value = String(pin || "").trim();

        if (/^D\d+$/i.test(value)) {
            return value.toUpperCase();
        }

        if (/^GPIO\d+$/i.test(value)) {
            return value.toUpperCase();
        }

        if (/^A\d+$/i.test(value)) {
            return value.toUpperCase();
        }

        if (/^\d+$/.test(value)) {
            return `D${value}`;
        }

        return value;
    }

    function findServoAttachPin(source) {
        const match =
            source.match(/\.attach\s*\(\s*([A-Za-z0-9_]+)\s*\)/i);

        return match
            ? normalizePin(match[1])
            : null;
    }

    /* ============================================================
       22. CODE EXECUTION
    ============================================================ */

    function executeCurrentCode() {
        if (!dom.electronicCodeEditor) return;

        const code = dom.electronicCodeEditor.value || "";

        state.code = code;

        const analysis = analyzeArduinoCode(code);

        clearConsole();

        if (!analysis.valid) {
            analysis.errors.forEach(error =>
                consoleLog(`ERREUR : ${error}`, "error")
            );

            showToast(
                "Exécution refusée : code invalide.",
                "error"
            );

            return;
        }

        state.codeRunning = true;

        consoleLog(
            "FOBAS Arduino Code Engine — démarrage...",
            "info"
        );

        const controller =
            findControllerForCode();

        if (!controller) {
            consoleLog(
                "Aucun contrôleur Arduino/ESP32 compatible trouvé dans le laboratoire.",
                "error"
            );

            state.codeRunning = false;

            showToast(
                "Ajoutez d'abord un Arduino ou contrôleur compatible.",
                "warning"
            );

            return;
        }

        consoleLog(
            `Contrôleur détecté : ${controller.name}`,
            "success"
        );

        const mapping = buildHardwareMapping(controller);

        if (!mapping.length) {
            consoleLog(
                "Aucune connexion matérielle détectable pour les instructions actuelles.",
                "warning"
            );
        }

        analysis.instructions.forEach(instruction => {
            executeInstruction(
                controller,
                instruction,
                mapping
            );
        });

        state.codeRunning = true;
        state.circuitRunning = true;

        renderAllComponents();
        renderWires();
        runSimulation();

        consoleLog(
            "Exécution terminée : les états du montage ont été mis à jour.",
            "success"
        );

        setStatus(
            "Code exécuté sur le montage",
            "working"
        );

        showToast(
            "Code exécuté sur le laboratoire.",
            "success"
        );

        updateWorkspaceState();
    }

    function findControllerForCode() {
        return state.components.find(component => {
            const definition = getComponentDefinition(component.type);
            return definition && definition.controller;
        }) || null;
    }

    function buildHardwareMapping(controller) {
        const mappings = [];

        state.wires.forEach(wire => {
            let controllerPin = null;
            let other = null;

            if (wire.from.componentId === controller.id) {
                controllerPin = wire.from.pinId;
                other = wire.to;
            }

            if (wire.to.componentId === controller.id) {
                controllerPin = wire.to.pinId;
                other = wire.from;
            }

            if (!controllerPin || !other) return;

            const target = findComponent(other.componentId);

            if (!target) return;

            mappings.push({
                controllerId: controller.id,
                controllerPin: normalizePin(controllerPin),
                componentId: target.id,
                componentPin: other.pinId,
                componentType: target.type
            });
        });

        return mappings;
    }

    function executeInstruction(controller, instruction, mapping) {
        const pin = normalizePin(instruction.pin || "");

        if (instruction.type === "pinMode") {
            controller.pinModes[pin] = instruction.mode;
            return;
        }

        if (instruction.type === "digitalWrite") {
            controller.digitalValues[pin] = instruction.value;

            const targets = mapping.filter(
                item => item.controllerPin === pin
            );

            targets.forEach(target =>
                applyDigitalOutput(
                    target,
                    instruction.value
                )
            );

            return;
        }

        if (instruction.type === "analogWrite") {
            controller.analogValues[pin] = instruction.value;

            const targets = mapping.filter(
                item => item.controllerPin === pin
            );

            targets.forEach(target =>
                applyAnalogOutput(
                    target,
                    instruction.value
                )
            );

            return;
        }

        if (instruction.type === "digitalRead") {
            const value =
                readDigitalInput(
                    controller,
                    pin,
                    mapping
                );

            controller.digitalValues[pin] = value;
            return;
        }

        if (instruction.type === "analogRead") {
            const value =
                readAnalogInput(
                    controller,
                    pin,
                    mapping
                );

            controller.analogValues[pin] = value;
            return;
        }

        if (
            instruction.type === "tone" ||
            instruction.type === "noTone"
        ) {
            const targets = mapping.filter(
                item => item.controllerPin === pin
            );

            targets.forEach(target => {
                const component =
                    findComponent(target.componentId);

                if (!component) return;

                if (component.type === "buzzer") {
                    component.state =
                        instruction.type === "tone" &&
                        instruction.frequency > 0
                            ? "on"
                            : "off";

                    component.frequency =
                        instruction.frequency || 0;
                }
            });

            return;
        }

        if (instruction.type === "servoAttach") {
            controller.pinModes[pin] = "SERVO";
            return;
        }

        if (instruction.type === "servoWrite") {
            const targets = mapping.filter(
                item => item.controllerPin === pin
            );

            targets.forEach(target => {
                const component =
                    findComponent(target.componentId);

                if (!component) return;

                if (component.type === "servo") {
                    component.angle = clamp(
                        instruction.angle,
                        0,
                        180
                    );

                    component.state = "on";
                }
            });

            return;
        }

        if (instruction.type === "lcdPrint") {
            const lcd = state.components.find(
                component => component.type === "lcd"
            );

            if (lcd) {
                lcd.displayText = "FOBAS";
            }
        }
    }

    function applyDigitalOutput(target, value) {
        const component =
            findComponent(target.componentId);

        if (!component) return;

        const on = Number(value) === 1;

        if (component.type === "led") {
            component.state = on ? "on" : "off";
        }

        if (component.type === "bulb") {
            component.state = on ? "on" : "off";
        }

        if (component.type === "buzzer") {
            component.state = on ? "on" : "off";
        }

        if (component.type === "relay") {
            component.state = on ? "on" : "off";
        }

        if (component.type === "dc-motor") {
            component.speed = on ? 100 : 0;
            component.state = on ? "on" : "off";
        }

        if (component.type === "switch") {
            component.state = on ? "closed" : "open";
        }

        component.pinStates[target.componentPin] = on ? 1 : 0;
    }

    function applyAnalogOutput(target, value) {
        const component =
            findComponent(target.componentId);

        if (!component) return;

        const normalized =
            clamp(Number(value), 0, 255);

        const percentage =
            (normalized / 255) * 100;

        if (component.type === "led") {
            component.state =
                normalized > 0 ? "on" : "off";

            component.value = normalized;
        }

        if (component.type === "dc-motor") {
            component.speed = percentage;
            component.state =
                percentage > 0 ? "on" : "off";
        }

        if (component.type === "servo") {
            component.angle =
                (normalized / 255) * 180;
        }
    }

    function readDigitalInput(controller, pin, mapping) {
        const targets = mapping.filter(
            item => item.controllerPin === pin
        );

        for (const target of targets) {
            const component =
                findComponent(target.componentId);

            if (!component) continue;

            if (component.type === "push-button") {
                return component.state === "pressed" ? 1 : 0;
            }

            if (component.type === "switch") {
                return component.state === "closed" ? 1 : 0;
            }

            return Number(
                component.digitalValues[target.componentPin] || 0
            );
        }

        return 0;
    }

    function readAnalogInput(controller, pin, mapping) {
        const targets = mapping.filter(
            item => item.controllerPin === pin
        );

        for (const target of targets) {
            const component =
                findComponent(target.componentId);

            if (!component) continue;

            if (component.type === "potentiometer") {
                return clamp(
                    Number(component.value ?? 50) * 10.23,
                    0,
                    1023
                );
            }

            if (component.type === "ldr") {
                return clamp(
                    Number(component.value ?? 500),
                    0,
                    1023
                );
            }

            if (component.type === "joystick") {
                return clamp(
                    Number(component.xValue ?? 512),
                    0,
                    1023
                );
            }
        }

        return 0;
    }

    /* ============================================================
       23. CIRCUIT SIMULATION
    ============================================================ */

    function runSimulation() {
        calculateMeasurements();

        const powered =
            state.powerOn ||
            state.circuitRunning ||
            state.codeRunning;

        state.wires.forEach(wire => {
            wire.active = powered;
        });

        if (powered) {
            propagateSimpleCircuitState();
        }

        renderAllComponents();
        renderWires();
        updateWorkspaceState();
        updateMeasurementDisplays();
    }

    function propagateSimpleCircuitState() {
        state.components.forEach(component => {
            if (component.type === "led") {
                if (component.state === "on") return;

                const poweredByWire =
                    isComponentConnectedToPower(component.id);

                if (poweredByWire && !hasBlockingFault(component)) {
                    component.state = "on";
                }
            }

            if (component.type === "bulb") {
                if (
                    isComponentConnectedToPower(component.id) &&
                    !hasBlockingFault(component)
                ) {
                    component.state = "on";
                }
            }
        });
    }

    function isComponentConnectedToPower(componentId) {
        const visited = new Set();
        const queue = [componentId];

        while (queue.length) {
            const currentId = queue.shift();

            if (visited.has(currentId)) continue;

            visited.add(currentId);

            const component =
                findComponent(currentId);

            if (!component) continue;

            if (
                component.type === "battery" ||
                component.type === "dc-supply"
            ) {
                return state.powerOn || state.circuitRunning;
            }

            state.wires.forEach(wire => {
                if (wire.from.componentId === currentId) {
                    queue.push(wire.to.componentId);
                }

                if (wire.to.componentId === currentId) {
                    queue.push(wire.from.componentId);
                }
            });
        }

        return false;
    }

    function hasBlockingFault(component) {
        return (
            component.faults?.open ||
            component.faults?.defective ||
            state.faults.openCircuit ||
            state.faults.defectiveComponent
        );
    }

    function calculateMeasurements() {
        const source =
            state.components.find(component =>
                component.type === "battery" ||
                component.type === "dc-supply" ||
                component.type === "ac-supply" ||
                component.type === "signal-generator"
            );

        const voltage =
            state.powerOn && source
                ? Number(source.voltage || 0)
                : 0;

        let resistance = null;

        const resistors =
            state.components.filter(
                component => component.type === "resistor"
            );

        if (resistors.length) {
            resistance = resistors.reduce(
                (sum, resistor) =>
                    sum + Number(resistor.resistance || 0),
                0
            );
        }

        const current =
            voltage > 0 && resistance > 0
                ? voltage / resistance
                : 0;

        const frequency =
            state.components.find(
                component =>
                    component.type === "signal-generator" ||
                    component.type === "buzzer"
            )?.frequency || 0;

        state.measurements.voltage = voltage;
        state.measurements.current = current;
        state.measurements.resistance = resistance;
        state.measurements.frequency = frequency;
        state.measurements.power = voltage * current;

        state.measurements.continuity =
            state.wires.length > 0
                ? "OK"
                : null;
    }

    /* ============================================================
       24. POWER / CIRCUIT CONTROLS
    ============================================================ */

    function powerOn() {
        state.powerOn = true;
        state.circuitRunning = true;

        setStatus(
            "Alimentation active",
            "working"
        );

        runSimulation();

        showToast(
            "Alimentation ON.",
            "success"
        );
    }

    function powerOff() {
        state.powerOn = false;
        state.circuitRunning = false;

        state.components.forEach(component => {
            if (component.type === "led") {
                component.state = "off";
            }

            if (component.type === "bulb") {
                component.state = "off";
            }

            if (component.type === "buzzer") {
                component.state = "off";
            }

            if (component.type === "dc-motor") {
                component.state = "off";
                component.speed = 0;
            }
        });

        setStatus(
            "Alimentation coupée",
            "ready"
        );

        runSimulation();

        showToast(
            "Alimentation OFF.",
            "success"
        );
    }

    function runCircuit() {
        state.circuitRunning = true;

        if (!state.powerOn) {
            state.powerOn = true;
        }

        setStatus(
            "Circuit en simulation",
            "working"
        );

        runSimulation();
    }

    function stopCircuit() {
        state.circuitRunning = false;

        state.components.forEach(component => {
            if (component.type === "led") {
                component.state = "off";
            }

            if (component.type === "bulb") {
                component.state = "off";
            }

            if (component.type === "dc-motor") {
                component.speed = 0;
                component.state = "off";
            }

            if (component.type === "buzzer") {
                component.state = "off";
            }
        });

        setStatus(
            "Circuit arrêté",
            "ready"
        );

        runSimulation();
    }

    function resetCircuit() {
        state.powerOn = false;
        state.circuitRunning = false;
        state.codeRunning = false;

        state.components.forEach(component => {
            component.state =
                getComponentDefinition(component.type)?.state ||
                "off";

            component.angle =
                Number(
                    getComponentDefinition(component.type)?.angle ||
                    0
                );

            component.speed = 0;
            component.frequency = 0;
        });

        setStatus(
            "Circuit réinitialisé",
            "ready"
        );

        runSimulation();
    }

    /* ============================================================
       25. WORKSPACE ZOOM
    ============================================================ */

    function setWorkspaceZoom(value, centerX = null, centerY = null) {
        const oldZoom = state.zoom;

        state.zoom = clamp(
            Number(value) || 1,
            0.35,
            3
        );

        if (
            centerX !== null &&
            centerY !== null &&
            dom.viewport
        ) {
            const rect =
                dom.viewport.getBoundingClientRect();

            const localX =
                centerX - rect.left;

            const localY =
                centerY - rect.top;

            state.panX =
                localX -
                (
                    (localX - state.panX) *
                    state.zoom /
                    oldZoom
                );

            state.panY =
                localY -
                (
                    (localY - state.panY) *
                    state.zoom /
                    oldZoom
                );
        }

        applyWorkspaceTransform();
        renderWires();
    }

    function zoomInWorkspace() {
        setWorkspaceZoom(
            state.zoom + 0.15
        );
    }

    function zoomOutWorkspace() {
        setWorkspaceZoom(
            state.zoom - 0.15
        );
    }

    function resetWorkspaceZoom() {
        state.zoom = 1;
        state.panX = 0;
        state.panY = 0;

        applyWorkspaceTransform();
        renderWires();
    }

    function fitWorkspace() {
        if (!state.components.length) {
            resetWorkspaceZoom();
            return;
        }

        const bounds = getComponentsBounds();

        const viewportWidth =
            dom.viewport?.clientWidth || 800;

        const viewportHeight =
            dom.viewport?.clientHeight || 600;

        const contentWidth =
            Math.max(bounds.width, 100);

        const contentHeight =
            Math.max(bounds.height, 100);

        const zoomX =
            (viewportWidth - 80) /
            contentWidth;

        const zoomY =
            (viewportHeight - 80) /
            contentHeight;

        state.zoom = clamp(
            Math.min(zoomX, zoomY),
            0.35,
            2
        );

        state.panX =
            ((viewportWidth - contentWidth * state.zoom) / 2) -
            bounds.minX * state.zoom;

        state.panY =
            ((viewportHeight - contentHeight * state.zoom) / 2) -
            bounds.minY * state.zoom;

        applyWorkspaceTransform();
        renderWires();
    }

    function getComponentsBounds() {
        if (!state.components.length) {
            return {
                minX: 0,
                minY: 0,
                maxX: 0,
                maxY: 0,
                width: 0,
                height: 0
            };
        }

        const minX =
            Math.min(
                ...state.components.map(
                    component => component.x
                )
            );

        const minY =
            Math.min(
                ...state.components.map(
                    component => component.y
                )
            );

        const maxX =
            Math.max(
                ...state.components.map(
                    component =>
                        component.x + component.width
                )
            );

        const maxY =
            Math.max(
                ...state.components.map(
                    component =>
                        component.y + component.height
                )
            );

        return {
            minX,
            minY,
            maxX,
            maxY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    function applyWorkspaceTransform() {
        if (!dom.canvas) return;

        dom.canvas.style.transform =
            `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;

        dom.canvas.style.transformOrigin = "0 0";

        if (dom.zoomResetBtn) {
            dom.zoomResetBtn.textContent =
                `${Math.round(state.zoom * 100)}%`;
        }
    }

    /* ============================================================
       26. GLOBAL TWO-FINGER PINCH ZOOM
    ============================================================ */

    const activePointers = new Map();

    function handleGlobalPointerDown(event) {
        if (!event.isPrimary && event.pointerType === "mouse") {
            return;
        }

        activePointers.set(
            event.pointerId,
            {
                clientX: event.clientX,
                clientY: event.clientY
            }
        );

        if (activePointers.size === 2) {
            const points =
                Array.from(activePointers.values());

            state.pinch.active = true;
            state.pinch.pointerIds =
                Array.from(activePointers.keys());

            state.pinch.startDistance =
                Math.hypot(
                    points[0].clientX - points[1].clientX,
                    points[0].clientY - points[1].clientY
                );

            state.pinch.startScale =
                state.globalScale;

            setStatus(
                "Zoom global actif",
                "working"
            );
        }
    }

    function handleGlobalPointerMove(event) {
        if (!activePointers.has(event.pointerId)) return;

        activePointers.set(
            event.pointerId,
            {
                clientX: event.clientX,
                clientY: event.clientY
            }
        );

        if (
            state.pinch.active &&
            activePointers.size >= 2
        ) {
            const points =
                Array.from(activePointers.values()).slice(0, 2);

            const currentDistance =
                Math.hypot(
                    points[0].clientX - points[1].clientX,
                    points[0].clientY - points[1].clientY
                );

            if (state.pinch.startDistance <= 0) {
                return;
            }

            const factor =
                currentDistance /
                state.pinch.startDistance;

            state.globalScale =
                clamp(
                    state.pinch.startScale * factor,
                    0.65,
                    1.6
                );

            applyGlobalScale();

            event.preventDefault();
        }
    }

    function handleGlobalPointerUp(event) {
        activePointers.delete(event.pointerId);

        if (activePointers.size < 2) {
            state.pinch.active = false;
            state.pinch.pointerIds = [];
        }
    }

    function applyGlobalScale() {
        if (!app) return;

        app.style.setProperty(
            "--fobas-global-scale",
            String(state.globalScale)
        );

        app.style.transform =
            `scale(${state.globalScale})`;

        app.style.transformOrigin = "center top";
    }

    /* ============================================================
       27. MEASUREMENTS
    ============================================================ */

    function updateMeasurementDisplays() {
        const m = state.measurements;

        const voltage =
            `${m.voltage.toFixed(2)} V`;

        const current =
            `${m.current.toFixed(3)} A`;

        const resistance =
            m.resistance === null
                ? "— Ω"
                : `${m.resistance.toFixed(1)} Ω`;

        const frequency =
            `${Number(m.frequency || 0).toFixed(0)} Hz`;

        const power =
            `${m.power.toFixed(3)} W`;

        if (dom.voltageDisplay)
            dom.voltageDisplay.textContent = voltage;

        if (dom.currentDisplay)
            dom.currentDisplay.textContent = current;

        if (dom.resistanceDisplay)
            dom.resistanceDisplay.textContent = resistance;

        if (dom.frequencyDisplay)
            dom.frequencyDisplay.textContent = frequency;

        if (dom.dashboardVoltage)
            dom.dashboardVoltage.textContent = voltage;

        if (dom.dashboardCurrent)
            dom.dashboardCurrent.textContent = current;

        if (dom.dashboardResistance)
            dom.dashboardResistance.textContent = resistance;

        if (dom.dashboardFrequency)
            dom.dashboardFrequency.textContent = frequency;

        if (dom.dashboardPower)
            dom.dashboardPower.textContent = power;

        if (dom.dashboardContinuity)
            dom.dashboardContinuity.textContent =
                m.continuity || "—";
    }

    function measureVoltage() {
        calculateMeasurements();
        updateMeasurementDisplays();

        showToast(
            `Tension mesurée : ${state.measurements.voltage.toFixed(2)} V`,
            "success"
        );
    }

    function measureCurrent() {
        calculateMeasurements();
        updateMeasurementDisplays();

        showToast(
            `Courant mesuré : ${state.measurements.current.toFixed(3)} A`,
            "success"
        );
    }

    function measureResistance() {
        calculateMeasurements();
        updateMeasurementDisplays();

        showToast(
            `Résistance mesurée : ${
                state.measurements.resistance === null
                    ? "aucune"
                    : state.measurements.resistance.toFixed(1) + " Ω"
            }`,
            "success"
        );
    }

    /* ============================================================
       28. WORKSPACE STATUS
    ============================================================ */

    function updateWorkspaceState() {
        if (dom.componentCount) {
            dom.componentCount.textContent =
                String(state.components.length);
        }

        if (dom.connectionCount) {
            dom.connectionCount.textContent =
                String(state.wires.length);
        }

        if (dom.workspaceVoltage) {
            dom.workspaceVoltage.textContent =
                `${state.measurements.voltage.toFixed(2)} V`;
        }

        if (dom.workspaceCurrent) {
            dom.workspaceCurrent.textContent =
                `${state.measurements.current.toFixed(3)} A`;
        }

        if (dom.circuitState) {
            if (state.powerOn && state.circuitRunning) {
                dom.circuitState.textContent =
                    "Circuit actif";
            } else if (state.powerOn) {
                dom.circuitState.textContent =
                    "Alimentation ON";
            } else if (state.wires.length) {
                dom.circuitState.textContent =
                    "Montage connecté";
            } else {
                dom.circuitState.textContent =
                    "Circuit ouvert";
            }
        }
    }

    /* ============================================================
       29. RENDER ALL
    ============================================================ */

    function renderAllComponents() {
        if (!dom.componentLayer) return;

        const currentIds =
            new Set(
                state.components.map(
                    component => component.id
                )
            );

        Array.from(
            dom.componentLayer.querySelectorAll(
                ".electronic-component"
            )
        ).forEach(element => {
            if (!currentIds.has(element.dataset.componentId)) {
                element.remove();
            }
        });

        state.components.forEach(component =>
            renderComponent(component)
        );

        renderWires();
    }

    /* ============================================================
       30. SAVE / LOAD
    ============================================================ */

    function getSerializableState() {
        return {
            format: PROJECT_FORMAT,
            version: ENGINE_VERSION,
            savedAt: new Date().toISOString(),

            components: state.components,
            wires: state.wires,

            selectedComponentId:
                state.selectedComponentId,

            activeTool: state.activeTool,

            zoom: state.zoom,
            panX: state.panX,
            panY: state.panY,

            powerOn: state.powerOn,
            circuitRunning: state.circuitRunning,
            codeRunning: false,

            currentLevel: state.currentLevel,
            currentCodeLevel: state.currentCodeLevel,
            currentCodeId: state.currentCodeId,

            code:
                dom.electronicCodeEditor?.value ||
                state.code ||
                "",

            faults: state.faults
        };
    }

    function saveProject() {
        const data = getSerializableState();

        const json =
            JSON.stringify(data, null, 2);

        const blob =
            new Blob(
                [json],
                {
                    type: "application/json"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const anchor =
            document.createElement("a");

        anchor.href = url;
        anchor.download =
            `FOBAS_Electronique_${Date.now()}.json`;

        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);

        try {
            localStorage.setItem(
                STORAGE_KEY,
                json
            );
        } catch (_) {
            /* Browser storage may be unavailable. */
        }

        showToast(
            "Projet sauvegardé.",
            "success"
        );
    }

    function loadProject() {
        if (!dom.projectFileInput) return;

        dom.projectFileInput.value = "";
        dom.projectFileInput.click();
    }

    function applyLoadedProject(data) {
        if (!data || typeof data !== "object") {
            throw new Error("Projet invalide.");
        }

        if (
            data.format &&
            data.format !== PROJECT_FORMAT
        ) {
            throw new Error(
                "Format de projet incompatible."
            );
        }

        state.components = Array.isArray(data.components)
            ? data.components
            : [];

        state.wires = Array.isArray(data.wires)
            ? data.wires
            : [];

        state.selectedComponentId =
            data.selectedComponentId || null;

        state.activeTool =
            data.activeTool || "select";

        state.zoom =
            clamp(
                Number(data.zoom) || 1,
                0.35,
                3
            );

        state.panX =
            Number(data.panX) || 0;

        state.panY =
            Number(data.panY) || 0;

        state.powerOn =
            Boolean(data.powerOn);

        state.circuitRunning =
            Boolean(data.circuitRunning);

        state.currentLevel =
            data.currentLevel || "beginner";

        state.currentCodeLevel =
            data.currentCodeLevel || "beginner";

        state.currentCodeId =
            data.currentCodeId || null;

        state.faults = {
            ...state.faults,
            ...(data.faults || {})
        };

        state.code =
            String(data.code || "");

        if (dom.electronicCodeEditor) {
            dom.electronicCodeEditor.value =
                state.code;
        }

        setActiveTool(state.activeTool);

        renderAllComponents();
        applyWorkspaceTransform();
        runSimulation();
        updateLevelUI();

        showToast(
            "Projet chargé avec succès.",
            "success"
        );
    }

    function handleProjectFile(event) {
        const file =
            event.target.files?.[0];

        if (!file) return;

        const reader =
            new FileReader();

        reader.onload = () => {
            try {
                const data =
                    JSON.parse(reader.result);

                applyLoadedProject(data);
            } catch (error) {
                console.error(error);

                showToast(
                    "Impossible de charger ce projet.",
                    "error"
                );
            }
        };

        reader.onerror = () => {
            showToast(
                "Erreur de lecture du fichier.",
                "error"
            );
        };

        reader.readAsText(file);
    }

    /* ============================================================
       31. LOCAL AUTOSAVE
    ============================================================ */

    function autoSaveState() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    getSerializableState()
                )
            );
        } catch (_) {
            /* Optional browser storage. */
        }
    }

    function restoreLocalState() {
        try {
            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!raw) return false;

            const data =
                JSON.parse(raw);

            if (
                !data ||
                data.format !== PROJECT_FORMAT
            ) {
                return false;
            }

            applyLoadedProject(data);

            return true;
        } catch (_) {
            return false;
        }
    }

    /* ============================================================
       32. CLEAR WORKSPACE
    ============================================================ */

    function clearWorkspace() {
        if (!state.components.length && !state.wires.length) {
            showToast(
                "Le laboratoire est déjà vide.",
                "info"
            );
            return;
        }

        state.components = [];
        state.wires = [];
        state.selectedComponentId = null;
        state.wireStart = null;

        state.powerOn = false;
        state.circuitRunning = false;
        state.codeRunning = false;

        if (dom.componentLayer) {
            dom.componentLayer.innerHTML = "";
        }

        if (dom.wireLayer) {
            dom.wireLayer.innerHTML = "";
        }

        resetWorkspaceZoom();
        calculateMeasurements();
        updateMeasurementDisplays();
        updateWorkspaceState();

        showToast(
            "Laboratoire vidé.",
            "success"
        );

        autoSaveState();
    }

    /* ============================================================
       33. LEVEL SYSTEM
    ============================================================ */

    function setCurrentLevel(level) {
        if (
            !["beginner", "intermediate", "expert"]
                .includes(level)
        ) {
            return;
        }

        state.currentLevel = level;

        updateLevelUI();
        renderMissions();
    }

    function setCurrentCodeLevel(level) {
        if (
            !["beginner", "intermediate", "expert"]
                .includes(level)
        ) {
            return;
        }

        state.currentCodeLevel = level;

        updateCodeLevelUI();
        renderCodeLibrary();
    }

    function updateLevelUI() {
        [
            [dom.beginnerLevelBtn, "beginner"],
            [dom.intermediateLevelBtn, "intermediate"],
            [dom.expertLevelBtn, "expert"]
        ].forEach(([button, level]) => {
            button?.classList.toggle(
                "active",
                state.currentLevel === level
            );
        });
    }

    function updateCodeLevelUI() {
        [
            [dom.codeBeginnerBtn, "beginner"],
            [dom.codeIntermediateBtn, "intermediate"],
            [dom.codeExpertBtn, "expert"]
        ].forEach(([button, level]) => {
            button?.classList.toggle(
                "active",
                state.currentCodeLevel === level
            );
        });
    }

    /* ============================================================
       34. MISSIONS
    ============================================================ */

    function renderMissions() {
        if (!dom.missionsList) return;

        const missions =
            MISSIONS.filter(
                mission =>
                    mission.level === state.currentLevel
            );

        dom.missionsList.innerHTML = "";

        missions.forEach(mission => {
            const card =
                document.createElement("article");

            card.className = "mission-card";
            card.dataset.missionId = mission.id;

            const compatibility =
                getCodeCompatibility(
                    {
                        requiredTypes:
                            mission.requiredTypes
                    },
                    state.components.map(
                        component =>
                            component.type
                    )
                );

            card.innerHTML = `
                <h3>${escapeHTML(mission.title)}</h3>
                <p>${escapeHTML(mission.description)}</p>

                <div class="mission-card-requirements">
                    ${mission.requiredTypes.map(type => {
                        const definition =
                            getComponentDefinition(type);

                        return `
                            <span>
                                ${escapeHTML(
                                    definition?.name || type
                                )}
                            </span>
                        `;
                    }).join("")}
                </div>

                <strong>
                    ${
                        compatibility.score >= 100
                            ? "✓ Montage compatible"
                            : `${compatibility.score}% préparé`
                    }
                </strong>
            `;

            card.addEventListener("click", () =>
                selectMission(mission.id)
            );

            dom.missionsList.appendChild(card);
        });
    }

    function selectMission(id) {
        const mission =
            MISSIONS.find(
                item => item.id === id
            );

        if (!mission) return;

        state.activeMissionId = id;
        state.missionStarted = false;

        if (dom.activeMissionTitle) {
            dom.activeMissionTitle.textContent =
                mission.title;
        }

        if (dom.activeMissionDescription) {
            dom.activeMissionDescription.textContent =
                mission.description;
        }

        if (dom.missionRequirements) {
            dom.missionRequirements.innerHTML =
                mission.requirements
                    .map(
                        requirement =>
                            `<div>✓ ${escapeHTML(requirement)}</div>`
                    )
                    .join("");
        }

        document
            .querySelectorAll(".mission-card")
            .forEach(card => {
                card.classList.toggle(
                    "active",
                    card.dataset.missionId === id
                );
            });
    }

    function startMission() {
        if (!state.activeMissionId) {
            showToast(
                "Sélectionnez une mission.",
                "warning"
            );
            return;
        }

        state.missionStarted = true;

        showToast(
            "Mission démarrée. Vous pouvez réaliser le montage.",
            "success"
        );
    }

    function validateMission() {
        if (!state.activeMissionId) {
            showToast(
                "Aucune mission sélectionnée.",
                "warning"
            );
            return;
        }

        const mission =
            MISSIONS.find(
                item =>
                    item.id === state.activeMissionId
            );

        if (!mission) return;

        const types =
            state.components.map(
                component =>
                    component.type
            );

        const compatibility =
            getCodeCompatibility(
                {
                    requiredTypes:
                        mission.requiredTypes
                },
                types
            );

        const code =
            CODE_LIBRARY.find(
                item =>
                    item.id === mission.codeId
            );

        let success =
            compatibility.score >= 100;

        if (code && state.code) {
            const normalizedCurrent =
                normalizeText(state.code);

            const normalizedMission =
                normalizeText(code.code);

            if (
                normalizedCurrent.includes(
                    "digitalwrite"
                ) &&
                normalizedMission.includes(
                    "digitalwrite"
                )
            ) {
                success = success &&
                    true;
            }
        }

        if (
            mission.codeId === "arduino-led-on"
        ) {
            const led =
                state.components.find(
                    component =>
                        component.type === "led"
                );

            if (led && led.state === "on") {
                success = true;
            }
        }

        showMissionResult(
            success,
            mission
        );
    }

    function showMissionResult(success, mission) {
        if (!dom.missionResultModal) return;

        if (dom.missionResultIcon) {
            dom.missionResultIcon.textContent =
                success ? "✓" : "!";
        }

        if (dom.missionResultTitle) {
            dom.missionResultTitle.textContent =
                success
                    ? "Mission réussie"
                    : "Mission non validée";
        }

        if (dom.missionResultMessage) {
            dom.missionResultMessage.textContent =
                success
                    ? `Bravo. Le montage "${mission.title}" répond aux conditions détectées.`
                    : `Le laboratoire ne répond pas encore à toutes les conditions de "${mission.title}".`;
        }

        dom.missionResultModal.classList.remove("hidden");
        dom.missionResultModal.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    function closeMissionResult() {
        dom.missionResultModal?.classList.add("hidden");
        dom.missionResultModal?.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    /* ============================================================
       35. DIAGNOSTIC
    ============================================================ */

    function runDiagnostic() {
        if (!dom.diagnosticResults) return;

        const results = [];

        if (!state.components.length) {
            results.push({
                type: "warning",
                text: "Aucun composant dans le laboratoire."
            });
        }

        const controllers =
            state.components.filter(component => {
                const definition =
                    getComponentDefinition(component.type);

                return Boolean(definition?.controller);
            });

        if (controllers.length) {
            results.push({
                type: "success",
                text:
                    `${controllers.length} contrôleur(s) détecté(s).`
            });
        } else {
            results.push({
                type: "warning",
                text:
                    "Aucun contrôleur Arduino/ESP32 détecté."
            });
        }

        if (state.wires.length) {
            results.push({
                type: "success",
                text:
                    `${state.wires.length} connexion(s) détectée(s).`
            });
        } else {
            results.push({
                type: "warning",
                text:
                    "Aucune connexion détectée."
            });
        }

        if (state.faults.openCircuit) {
            results.push({
                type: "error",
                text:
                    "Panne active : circuit ouvert."
            });
        }

        if (state.faults.shortCircuit) {
            results.push({
                type: "error",
                text:
                    "Panne active : court-circuit."
            });
        }

        if (state.faults.reversedPolarity) {
            results.push({
                type: "error",
                text:
                    "Panne active : polarité inversée."
            });
        }

        if (state.faults.defectiveComponent) {
            results.push({
                type: "error",
                text:
                    "Panne active : composant défectueux."
            });
        }

        if (
            state.powerOn &&
            state.components.length
        ) {
            results.push({
                type: "success",
                text:
                    "Alimentation active."
            });
        }

        dom.diagnosticResults.innerHTML =
            results.map(result => `
                <div class="diagnostic-result ${result.type}">
                    ${escapeHTML(result.text)}
                </div>
            `).join("");

        showToast(
            "Diagnostic terminé.",
            "success"
        );
    }

    /* ============================================================
       36. FAULT SYSTEM
    ============================================================ */

    function createFault(type) {
        if (
            ![
                "openCircuit",
                "shortCircuit",
                "reversedPolarity",
                "defectiveComponent"
            ].includes(type)
        ) {
            return;
        }

        state.faults[type] = true;

        setStatus(
            "Panne simulée",
            "working"
        );

        runSimulation();

        showToast(
            "Panne simulée dans le laboratoire.",
            "warning"
        );
    }

    function clearFaults() {
        state.faults = {
            openCircuit: false,
            shortCircuit: false,
            reversedPolarity: false,
            defectiveComponent: false
        };

        state.components.forEach(component => {
            component.faults = {
                open: false,
                short: false,
                polarity: false,
                defective: false
            };
        });

        runSimulation();

        setStatus(
            "Pannes supprimées",
            "ready"
        );

        showToast(
            "Toutes les pannes ont été supprimées.",
            "success"
        );
    }

    /* ============================================================
       37. SOURCE / INSTRUMENT BUTTONS
    ============================================================ */

    function setupStaticLibraryButtons() {
        const sourceButtons = [
            [dom.batteryBtn, "battery"],
            [dom.dcSupplyBtn, "dc-supply"],
            [dom.acSupplyBtn, "ac-supply"],
            [dom.signalGeneratorBtn, "signal-generator"]
        ];

        sourceButtons.forEach(([button, type]) => {
            button?.addEventListener(
                "click",
                () => {
                    openComponentLibrary();
                    addComponent(type);
                }
            );
        });

        const instrumentButtons = [
            [dom.multimeterBtn, "multimeter"],
            [dom.oscilloscopeBtn, "oscilloscope"],
            [dom.voltmeterBtn, "voltmeter"],
            [dom.ammeterBtn, "ammeter"],
            [dom.ohmmeterBtn, "ohmmeter"],
            [dom.frequencyMeterBtn, "frequency-meter"],
            [dom.logicAnalyzerBtn, "logic-analyzer"]
        ];

        instrumentButtons.forEach(([button, type]) => {
            button?.addEventListener(
                "click",
                () => {
                    addInstrument(type);
                }
            );
        });
    }

    function addInstrument(type) {
        const labels = {
            multimeter: "Multimètre",
            oscilloscope: "Oscilloscope",
            voltmeter: "Voltmètre",
            ammeter: "Ampèremètre",
            ohmmeter: "Ohmmètre",
            "frequency-meter": "Fréquencemètre",
            "logic-analyzer": "Analyseur logique"
        };

        const component = {
            id: uid("instrument"),
            type: `instrument-${type}`,
            name: labels[type] || "Instrument",
            category: "instrument",
            x: 80 + state.components.length * 25,
            y: 80 + state.components.length * 20,
            width: 170,
            height: 105,
            rotation: 0,
            state: "ready",
            value: null,
            angle: 0,
            speed: 0,
            frequency: 0,
            displayText: "",
            pinStates: {},
            pinModes: {},
            analogValues: {},
            digitalValues: {},
            faults: {
                open: false,
                short: false,
                polarity: false,
                defective: false
            }
        };

        state.components.push(component);

        renderInstrument(component);
        selectComponent(component.id);
        updateWorkspaceState();

        showToast(
            `${component.name} ajouté au laboratoire.`,
            "success"
        );
    }

    function renderInstrument(component) {
        if (!dom.componentLayer) return;

        let element =
            document.getElementById(component.id);

        if (!element) {
            element =
                document.createElement("div");

            element.id = component.id;
            element.className =
                "electronic-component electronic-instrument";

            element.dataset.componentId =
                component.id;

            element.dataset.componentType =
                component.type;

            dom.componentLayer.appendChild(element);
        }

        element.style.position = "absolute";
        element.style.left = `${component.x}px`;
        element.style.top = `${component.y}px`;
        element.style.width = `${component.width}px`;
        element.style.height = `${component.height}px`;
        element.style.transform =
            `rotate(${component.rotation}deg)`;
        element.style.touchAction = "none";

        element.innerHTML = `
            <div class="instrument-body">
                <div class="instrument-screen">
                    ${escapeHTML(getInstrumentReading(component.type))}
                </div>

                <strong>
                    ${escapeHTML(component.name)}
                </strong>

                <span>
                    ${escapeHTML(component.type.replace("instrument-", ""))}
                </span>
            </div>
        `;

        element.onpointerdown = event => {
            event.preventDefault();

            selectComponent(component.id);

            if (state.activeTool === "delete") {
                deleteComponent(component.id);
                return;
            }

            if (state.activeTool === "rotate") {
                rotateComponent(component.id);
                return;
            }

            if (state.activeTool === "duplicate") {
                duplicateComponent(component.id);
                return;
            }

            if (state.activeTool === "move") {
                beginComponentDrag(
                    event,
                    component,
                    element
                );
            }
        };
    }

    function getInstrumentReading(type) {
        const m = state.measurements;

        if (type === "instrument-multimeter")
            return `${m.voltage.toFixed(2)}V`;

        if (type === "instrument-voltmeter")
            return `${m.voltage.toFixed(2)} V`;

        if (type === "instrument-ammeter")
            return `${m.current.toFixed(3)} A`;

        if (type === "instrument-ohmmeter")
            return m.resistance === null
                ? "— Ω"
                : `${m.resistance.toFixed(1)} Ω`;

        if (type === "instrument-frequency-meter")
            return `${m.frequency.toFixed(0)} Hz`;

        if (type === "instrument-oscilloscope")
            return `CH1 ${m.voltage.toFixed(2)}V`;

        if (type === "instrument-logic-analyzer")
            return state.circuitRunning
                ? "HIGH/LOW"
                : "IDLE";

        return "READY";
    }

    /* ============================================================
       38. PANEL EVENTS
    ============================================================ */

    function setupPanelEvents() {
        dom.laboratoryBtn?.addEventListener(
            "click",
            () => {
                closeAllPanelsExcept(null);
                setStatus("Simulation prête", "ready");
            }
        );

        dom.libraryBtn?.addEventListener(
            "click",
            () => openComponentLibrary()
        );

        dom.codeLibraryBtn?.addEventListener(
            "click",
            () => openCodeLibrary()
        );

        dom.codeEditorBtn?.addEventListener(
            "click",
            () => openCodeEditor()
        );

        dom.missionsBtn?.addEventListener(
            "click",
            () => {
                renderMissions();
                openPanel("missionsPanel");
            }
        );

        dom.measurementsBtn?.addEventListener(
            "click",
            () => {
                calculateMeasurements();
                updateMeasurementDisplays();
                openPanel("measurementsPanel");
            }
        );

        dom.diagnosticBtn?.addEventListener(
            "click",
            () => openPanel("diagnosticPanel")
        );

        dom.faultsBtn?.addEventListener(
            "click",
            () => openPanel("faultsPanel")
        );

        dom.closeComponentLibraryBtn?.addEventListener(
            "click",
            closeComponentLibrary
        );

        dom.closeCodeLibraryBtn?.addEventListener(
            "click",
            () => closePanel("codeLibraryPanel")
        );

        dom.closeCodeEditorBtn?.addEventListener(
            "click",
            () => closePanel("codeEditorPanel")
        );

        dom.closeMissionsBtn?.addEventListener(
            "click",
            () => closePanel("missionsPanel")
        );

        dom.closeDiagnosticBtn?.addEventListener(
            "click",
            () => closePanel("diagnosticPanel")
        );

        dom.closeFaultsBtn?.addEventListener(
            "click",
            () => closePanel("faultsPanel")
        );

        dom.closeMeasurementsBtn?.addEventListener(
            "click",
            () => closePanel("measurementsPanel")
        );

        dom.openCodeEditorBtn?.addEventListener(
            "click",
            openCodeEditor
        );

        dom.executeCodeBtn?.addEventListener(
            "click",
            executeCurrentCode
        );

        dom.stopCodeBtn?.addEventListener(
            "click",
            stopCodeExecution
        );

        dom.clearCodeBtn?.addEventListener(
            "click",
            clearCode
        );

        dom.pasteCodeBtn?.addEventListener(
            "click",
            pasteCode
        );

        dom.copyCodeBtn?.addEventListener(
            "click",
            copyEditorCode
        );

        dom.validateCodeBtn?.addEventListener(
            "click",
            () => validateCode()
        );

        dom.executeEditorCodeBtn?.addEventListener(
            "click",
            executeCurrentCode
        );

        dom.stopEditorCodeBtn?.addEventListener(
            "click",
            stopCodeExecution
        );

        dom.clearEditorCodeBtn?.addEventListener(
            "click",
            clearCode
        );
    }

    async function pasteCode() {
        if (!dom.electronicCodeEditor) return;

        try {
            if (
                navigator.clipboard &&
                typeof navigator.clipboard.readText === "function"
            ) {
                const text =
                    await navigator.clipboard.readText();

                dom.electronicCodeEditor.value =
                    text;

                state.code = text;

                showToast(
                    "Code collé.",
                    "success"
                );

                return;
            }
        } catch (_) {
            /* Browser may block clipboard read. */
        }

        dom.electronicCodeEditor.focus();

        showToast(
            "Autorisez l'accès au presse-papiers ou utilisez Coller du système.",
            "warning"
        );
    }

    function copyEditorCode() {
        const code =
            dom.electronicCodeEditor?.value || "";

        if (!code) {
            showToast(
                "Aucun code à copier.",
                "warning"
            );
            return;
        }

        copyText(code).then(success => {
            showToast(
                success
                    ? "Code copié."
                    : "Copie indisponible.",
                success
                    ? "success"
                    : "warning"
            );
        });
    }

    function stopCodeExecution() {
        state.codeRunning = false;

        if (state.simulationTimer) {
            clearTimeout(
                state.simulationTimer
            );

            state.simulationTimer = null;
        }

        setStatus(
            "Code arrêté",
            "ready"
        );

        consoleLog(
            "Exécution du code arrêtée.",
            "warning"
        );

        showToast(
            "Code arrêté.",
            "success"
        );
    }

    function clearCode() {
        if (dom.electronicCodeEditor) {
            dom.electronicCodeEditor.value = "";
        }

        state.code = "";
        state.currentCodeId = null;

        clearConsole();

        consoleLog(
            "Éditeur vidé.",
            "info"
        );
    }

    /* ============================================================
       39. TOOLBAR EVENTS
    ============================================================ */

    function setupToolbarEvents() {
        dom.selectToolBtn?.addEventListener(
            "click",
            () => setActiveTool("select")
        );

        dom.wireToolBtn?.addEventListener(
            "click",
            () => setActiveTool("wire")
        );

        dom.moveToolBtn?.addEventListener(
            "click",
            () => setActiveTool("move")
        );

        dom.rotateToolBtn?.addEventListener(
            "click",
            () => {
                if (state.selectedComponentId) {
                    rotateComponent(
                        state.selectedComponentId
                    );
                } else {
                    setActiveTool("rotate");

                    showToast(
                        "Sélectionnez un composant à tourner.",
                        "info"
                    );
                }
            }
        );

        dom.deleteToolBtn?.addEventListener(
            "click",
            () => setActiveTool("delete")
        );

        dom.duplicateToolBtn?.addEventListener(
            "click",
            () => {
                if (state.selectedComponentId) {
                    duplicateComponent(
                        state.selectedComponentId
                    );
                } else {
                    setActiveTool("duplicate");

                    showToast(
                        "Sélectionnez un composant à dupliquer.",
                        "info"
                    );
                }
            }
        );

        dom.zoomInBtn?.addEventListener(
            "click",
            zoomInWorkspace
        );

        dom.zoomOutBtn?.addEventListener(
            "click",
            zoomOutWorkspace
        );

        dom.zoomResetBtn?.addEventListener(
            "click",
            resetWorkspaceZoom
        );

        dom.fitWorkspaceBtn?.addEventListener(
            "click",
            fitWorkspace
        );
    }

    /* ============================================================
       40. LEVEL / LIBRARY EVENTS
    ============================================================ */

    function setupLevelEvents() {
        dom.beginnerLevelBtn?.addEventListener(
            "click",
            () => setCurrentLevel("beginner")
        );

        dom.intermediateLevelBtn?.addEventListener(
            "click",
            () => setCurrentLevel("intermediate")
        );

        dom.expertLevelBtn?.addEventListener(
            "click",
            () => setCurrentLevel("expert")
        );

        dom.codeBeginnerBtn?.addEventListener(
            "click",
            () => setCurrentCodeLevel("beginner")
        );

        dom.codeIntermediateBtn?.addEventListener(
            "click",
            () => setCurrentCodeLevel("intermediate")
        );

        dom.codeExpertBtn?.addEventListener(
            "click",
            () => setCurrentCodeLevel("expert")
        );
    }

    function setupComponentLibraryEvents() {
        dom.componentCategories?.addEventListener(
            "click",
            event => {
                const button =
                    event.target.closest(
                        "[data-category]"
                    );

                if (!button) return;

                state.currentLibraryCategory =
                    button.dataset.category || "all";

                dom.componentCategories
                    .querySelectorAll(
                        "[data-category]"
                    )
                    .forEach(categoryButton => {
                        categoryButton.classList.toggle(
                            "active",
                            categoryButton === button
                        );
                    });

                renderComponentLibrary();
            }
        );

        dom.componentSearchInput?.addEventListener(
            "input",
            () => renderComponentLibrary()
        );

        dom.componentSearchBtn?.addEventListener(
            "click",
            () => {
                dom.componentSearchInput?.focus();
            }
        );

        dom.componentLibraryGrid?.addEventListener(
            "click",
            event => {
                const addButton =
                    event.target.closest(
                        "[data-add-component]"
                    );

                if (!addButton) return;

                const type =
                    addButton.dataset.addComponent;

                addComponent(type);

                showToast(
                    `${getComponentDefinition(type)?.name || type} ajouté au laboratoire.`,
                    "success"
                );
            }
        );

        dom.addComponentFromDetailsBtn?.addEventListener(
            "click",
            () => {
                if (!state.selectedComponentType) return;

                addComponent(
                    state.selectedComponentType
                );

                closeComponentDetails();
            }
        );

        dom.closeComponentDetailsBtn?.addEventListener(
            "click",
            closeComponentDetails
        );
    }

    /* ============================================================
       41. CODE LIBRARY EVENTS
    ============================================================ */

    function setupCodeLibraryEvents() {
        dom.codeLibraryList?.addEventListener(
            "click",
            event => {
                const copyButton =
                    event.target.closest(
                        "[data-copy-code]"
                    );

                if (copyButton) {
                    copyCode(
                        copyButton.dataset.copyCode
                    );
                    return;
                }

                const useButton =
                    event.target.closest(
                        "[data-use-code]"
                    );

                if (useButton) {
                    useCode(
                        useButton.dataset.useCode
                    );
                }
            }
        );
    }

    /* ============================================================
       42. MISSION EVENTS
    ============================================================ */

    function setupMissionEvents() {
        dom.beginnerMissionsBtn?.addEventListener(
            "click",
            () => {
                setCurrentLevel("beginner");
                updateMissionLevelButtons();
            }
        );

        dom.intermediateMissionsBtn?.addEventListener(
            "click",
            () => {
                setCurrentLevel("intermediate");
                updateMissionLevelButtons();
            }
        );

        dom.expertMissionsBtn?.addEventListener(
            "click",
            () => {
                setCurrentLevel("expert");
                updateMissionLevelButtons();
            }
        );

        dom.startMissionBtn?.addEventListener(
            "click",
            startMission
        );

        dom.validateMissionBtn?.addEventListener(
            "click",
            validateMission
        );

        dom.closeMissionResultBtn?.addEventListener(
            "click",
            closeMissionResult
        );
    }

    function updateMissionLevelButtons() {
        [
            [dom.beginnerMissionsBtn, "beginner"],
            [dom.intermediateMissionsBtn, "intermediate"],
            [dom.expertMissionsBtn, "expert"]
        ].forEach(([button, level]) => {
            button?.classList.toggle(
                "active",
                state.currentLevel === level
            );
        });

        renderMissions();
    }

    /* ============================================================
       43. DIAGNOSTIC / FAULT / MEASUREMENT EVENTS
    ============================================================ */

    function setupDiagnosticEvents() {
        dom.runDiagnosticBtn?.addEventListener(
            "click",
            runDiagnostic
        );

        dom.createOpenCircuitFaultBtn?.addEventListener(
            "click",
            () => createFault("openCircuit")
        );

        dom.createShortCircuitFaultBtn?.addEventListener(
            "click",
            () => createFault("shortCircuit")
        );

        dom.createPolarityFaultBtn?.addEventListener(
            "click",
            () => createFault("reversedPolarity")
        );

        dom.createComponentFaultBtn?.addEventListener(
            "click",
            () => createFault("defectiveComponent")
        );

        dom.clearFaultsBtn?.addEventListener(
            "click",
            clearFaults
        );

        dom.measureVoltageBtn?.addEventListener(
            "click",
            measureVoltage
        );

        dom.measureCurrentBtn?.addEventListener(
            "click",
            measureCurrent
        );

        dom.measureResistanceBtn?.addEventListener(
            "click",
            measureResistance
        );
    }

    /* ============================================================
       44. POWER / PROJECT EVENTS
    ============================================================ */

    function setupControlEvents() {
        dom.powerOnBtn?.addEventListener(
            "click",
            powerOn
        );

        dom.powerOffBtn?.addEventListener(
            "click",
            powerOff
        );

        dom.runCircuitBtn?.addEventListener(
            "click",
            runCircuit
        );

        dom.stopCircuitBtn?.addEventListener(
            "click",
            stopCircuit
        );

        dom.resetCircuitBtn?.addEventListener(
            "click",
            resetCircuit
        );

        dom.saveProjectBtn?.addEventListener(
            "click",
            saveProject
        );

        dom.loadProjectBtn?.addEventListener(
            "click",
            loadProject
        );

        dom.clearWorkspaceBtn?.addEventListener(
            "click",
            clearWorkspace
        );

        dom.projectFileInput?.addEventListener(
            "change",
            handleProjectFile
        );
    }

    /* ============================================================
       45. VIEWPORT / CANVAS EVENTS
    ============================================================ */

    function setupViewportEvents() {
        dom.viewport?.addEventListener(
            "wheel",
            event => {
                if (!event.ctrlKey) return;

                event.preventDefault();

                const delta =
                    event.deltaY < 0
                        ? 0.1
                        : -0.1;

                setWorkspaceZoom(
                    state.zoom + delta,
                    event.clientX,
                    event.clientY
                );
            },
            { passive: false }
        );

        dom.canvas?.addEventListener(
            "pointerdown",
            event => {
                if (event.target !== dom.canvas) return;

                if (state.activeTool === "select") {
                    selectComponent(null);
                }
            }
        );
    }

    /* ============================================================
       46. GLOBAL EVENTS
    ============================================================ */

    function setupGlobalEvents() {
        document.addEventListener(
            "pointerdown",
            handleGlobalPointerDown,
            { passive: false }
        );

        document.addEventListener(
            "pointermove",
            handleGlobalPointerMove,
            { passive: false }
        );

        document.addEventListener(
            "pointerup",
            handleGlobalPointerUp,
            { passive: false }
        );

        document.addEventListener(
            "pointercancel",
            handleGlobalPointerUp,
            { passive: false }
        );

        document.addEventListener(
            "keydown",
            event => {
                const target =
                    event.target;

                const editing =
                    target instanceof HTMLInputElement ||
                    target instanceof HTMLTextAreaElement ||
                    target?.isContentEditable;

                if (editing) return;

                if (event.key === "Escape") {
                    state.wireStart = null;
                    selectComponent(null);
                    setActiveTool("select");
                }

                if (
                    event.key === "Delete" &&
                    state.selectedComponentId
                ) {
                    deleteComponent(
                        state.selectedComponentId
                    );
                }

                if (
                    event.key.toLowerCase() === "r" &&
                    state.selectedComponentId
                ) {
                    rotateComponent(
                        state.selectedComponentId
                    );
                }

                if (
                    (event.ctrlKey || event.metaKey) &&
                    event.key.toLowerCase() === "s"
                ) {
                    event.preventDefault();
                    saveProject();
                }
            }
        );

        window.addEventListener(
            "resize",
            () => {
                renderWires();
            }
        );

        window.addEventListener(
            "beforeunload",
            autoSaveState
        );
    }

    /* ============================================================
       47. INITIAL COMPONENT STATE
    ============================================================ */

    function initializeDefaultState() {
        state.components = [];
        state.wires = [];
        state.selectedComponentId = null;

        state.zoom = 1;
        state.panX = 0;
        state.panY = 0;

        state.powerOn = false;
        state.circuitRunning = false;
        state.codeRunning = false;

        state.faults = {
            openCircuit: false,
            shortCircuit: false,
            reversedPolarity: false,
            defectiveComponent: false
        };

        state.measurements = {
            voltage: 0,
            current: 0,
            resistance: null,
            frequency: 0,
            power: 0,
            continuity: null
        };
    }

    /* ============================================================
       48. ENGINE STYLE SAFETY
       ----------------------------------------------------------------
       This does not replace the external CSS.
       It only guarantees the core interactive geometry needed
       for components, pins, wires and global pinch behavior.
    ============================================================ */

    function injectEngineSafetyStyles() {
        if (document.getElementById("fobasElectronicEngineStyles")) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "fobasElectronicEngineStyles";

        style.textContent = `
            #fobasElectronicApp {
                --fobas-global-scale: 1;
            }

            #laboratoryViewport {
                touch-action: pan-x pan-y;
                position: relative;
                overflow: hidden;
            }

            #laboratoryCanvas {
                position: relative;
                transform-origin: 0 0;
                min-width: 100%;
                min-height: 100%;
            }

            #componentLayer {
                position: absolute;
                inset: 0;
                pointer-events: none;
            }

            .electronic-component {
                pointer-events: auto;
                box-sizing: border-box;
                cursor: pointer;
                z-index: 20;
            }

            .electronic-component.selected {
                z-index: 50;
            }

            .electronic-component-shell {
                position: relative;
                width: 100%;
                height: 100%;
            }

            .electronic-component-visual {
                position: absolute;
                inset: 0;
                pointer-events: none;
            }

            .fobas-electronic-3d {
                position: relative;
                width: 100%;
                height: 100%;
                min-height: 45px;
                pointer-events: none;
                perspective: 500px;
            }

            .component-3d-shadow {
                position: absolute;
                left: 7%;
                right: 0;
                bottom: 1%;
                height: 20%;
                border-radius: 50%;
                background: rgba(0,0,0,.24);
                filter: blur(5px);
                transform: translateY(7px);
            }

            .component-3d-body {
                position: absolute;
                inset: 0;
                border-radius: 10px;
                background:
                    linear-gradient(
                        145deg,
                        rgba(255,255,255,.34),
                        rgba(255,255,255,0) 35%
                    ),
                    var(--component-color, #263238);
                border: 1px solid rgba(255,255,255,.35);
                box-shadow:
                    inset 2px 2px 5px rgba(255,255,255,.18),
                    inset -3px -4px 8px rgba(0,0,0,.28),
                    0 5px 10px rgba(0,0,0,.24);
                transform:
                    translateZ(0)
                    rotateX(2deg);
                overflow: hidden;
            }

            .component-3d-highlight {
                position: absolute;
                inset: 5px;
                border-radius: 7px;
                background:
                    linear-gradient(
                        135deg,
                        rgba(255,255,255,.24),
                        transparent 45%
                    );
                pointer-events: none;
            }

            .component-3d-icon {
                position: absolute;
                left: 50%;
                top: 42%;
                transform: translate(-50%, -50%);
                font-size: clamp(18px, 4vw, 32px);
                font-weight: 800;
                color: #fff;
                text-shadow: 0 2px 3px rgba(0,0,0,.45);
                white-space: nowrap;
            }

            .component-3d-label {
                position: absolute;
                left: 4px;
                right: 4px;
                bottom: 4px;
                text-align: center;
                font-size: 10px;
                line-height: 1.15;
                color: #fff;
                font-weight: 700;
                text-shadow: 0 1px 2px rgba(0,0,0,.65);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .electronic-component.selected
            .component-3d-body {
                outline: 3px solid rgba(255,193,7,.95);
                outline-offset: 2px;
            }

            .electronic-component[data-state="on"]
            .fobas-electronic-3d[data-lit="true"]
            .component-3d-body {
                box-shadow:
                    0 0 20px rgba(255,193,7,.85),
                    inset 2px 2px 5px rgba(255,255,255,.2),
                    inset -3px -4px 8px rgba(0,0,0,.28);
            }

            .electronic-component[data-state="on"]
            .fobas-electronic-3d[data-active="true"]
            .component-3d-body {
                filter: brightness(1.28);
            }

            .electronic-component-state {
                position: absolute;
                left: 50%;
                bottom: -18px;
                transform: translateX(-50%);
                white-space: nowrap;
                font-size: 9px;
                font-weight: 700;
                color: currentColor;
                pointer-events: none;
            }

            .electronic-component-pins {
                position: absolute;
                inset: 0;
                pointer-events: none;
            }

            .electronic-pin {
                width: 18px;
                height: 18px;
                min-width: 18px;
                min-height: 18px;
                padding: 0;
                border-radius: 50%;
                border: 2px solid #fff;
                background: #263238;
                color: #fff;
                z-index: 60;
                pointer-events: auto;
                touch-action: none;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0,0,0,.35);
            }

            .electronic-pin span {
                position: absolute;
                white-space: nowrap;
                font-size: 8px;
                pointer-events: none;
                background: rgba(0,0,0,.75);
                padding: 2px 4px;
                border-radius: 3px;
                color: #fff;
            }

            .electronic-pin.wire-start {
                background: #ffc107;
                transform: scale(1.25);
            }

            .wire-layer,
            #wireLayer {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                overflow: visible;
                pointer-events: none;
                z-index: 10;
            }

            .electronic-wire {
                fill: none;
                stroke: #37474f;
                stroke-width: 4;
                stroke-linecap: round;
                filter: drop-shadow(0 1px 1px rgba(0,0,0,.35));
            }

            .electronic-wire.active {
                stroke: #ffc107;
                stroke-width: 5;
            }

            .instrument-body {
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border-radius: 10px;
                padding: 10px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                background:
                    linear-gradient(145deg,#37474f,#17232a);
                color: #fff;
                box-shadow:
                    inset 2px 2px 5px rgba(255,255,255,.12),
                    inset -3px -4px 8px rgba(0,0,0,.35),
                    0 6px 12px rgba(0,0,0,.25);
            }

            .instrument-screen {
                min-height: 34px;
                border-radius: 5px;
                padding: 6px;
                background: #08110c;
                color: #80cbc4;
                font-family: monospace;
                font-weight: 700;
                text-align: center;
            }

            .component-library-card,
            .code-library-card,
            .mission-card {
                cursor: pointer;
            }

            .component-add-btn,
            .code-copy-btn,
            .code-use-btn {
                cursor: pointer;
                touch-action: manipulation;
            }

            .library-empty-state {
                padding: 30px;
                text-align: center;
                opacity: .75;
            }

            .console-line {
                padding: 3px 0;
                font-family: monospace;
                font-size: 12px;
            }

            .console-success {
                color: #43a047;
            }

            .console-error {
                color: #e53935;
            }

            .console-warning {
                color: #fb8c00;
            }

            .console-info {
                color: #1976d2;
            }

            .diagnostic-result {
                padding: 9px;
                margin-bottom: 6px;
                border-radius: 6px;
            }

            .diagnostic-result.success {
                background: rgba(76,175,80,.12);
            }

            .diagnostic-result.warning {
                background: rgba(255,152,0,.12);
            }

            .diagnostic-result.error {
                background: rgba(244,67,54,.12);
            }

            .hidden {
                display: none !important;
            }
        `;

        document.head.appendChild(style);
    }

    /* ============================================================
       49. AUTOMATIC CODE / MONTAGE REACTION
    ============================================================ */

    function synchronizeArduinoInputs() {
        const controllers =
            state.components.filter(component => {
                const definition =
                    getComponentDefinition(component.type);

                return Boolean(definition?.controller);
            });

        controllers.forEach(controller => {
            const mapping =
                buildHardwareMapping(controller);

            mapping.forEach(item => {
                const target =
                    findComponent(item.componentId);

                if (!target) return;

                if (
                    target.type === "push-button" ||
                    target.type === "switch"
                ) {
                    controller.digitalValues[
                        item.controllerPin
                    ] =
                        target.state === "pressed" ||
                        target.state === "closed"
                            ? 1
                            : 0;
                }

                if (
                    target.type === "potentiometer"
                ) {
                    controller.analogValues[
                        item.controllerPin
                    ] =
                        clamp(
                            Number(target.value || 0) *
                            10.23,
                            0,
                            1023
                        );
                }

                if (target.type === "ldr") {
                    controller.analogValues[
                        item.controllerPin
                    ] =
                        clamp(
                            Number(target.value || 500),
                            0,
                            1023
                        );
                }
            });
        });
    }

    /* ============================================================
       50. TOUCH INTERACTION FOR PUSH BUTTON
    ============================================================ */

    function setupPhysicalSimulationInteractions() {
        dom.componentLayer?.addEventListener(
            "pointerdown",
            event => {
                const componentElement =
                    event.target.closest(
                        ".electronic-component"
                    );

                if (!componentElement) return;

                const component =
                    findComponent(
                        componentElement.dataset.componentId
                    );

                if (!component) return;

                if (
                    component.type === "push-button" &&
                    state.activeTool === "select"
                ) {
                    event.preventDefault();

                    component.state = "pressed";

                    renderComponent(component);
                    synchronizeArduinoInputs();

                    if (state.codeRunning) {
                        executeCurrentCode();
                    }

                    runSimulation();
                }
            }
        );

        dom.componentLayer?.addEventListener(
            "pointerup",
            event => {
                const componentElement =
                    event.target.closest(
                        ".electronic-component"
                    );

                if (!componentElement) return;

                const component =
                    findComponent(
                        componentElement.dataset.componentId
                    );

                if (!component) return;

                if (
                    component.type === "push-button"
                ) {
                    component.state = "released";

                    renderComponent(component);
                    synchronizeArduinoInputs();

                    if (state.codeRunning) {
                        executeCurrentCode();
                    }

                    runSimulation();
                }
            }
        );
    }

    /* ============================================================
       51. CODE LOOP SIMULATION
    ============================================================ */

    function startSimulationLoop() {
        clearInterval(
            startSimulationLoop.timer
        );

        startSimulationLoop.timer =
            setInterval(() => {
                if (
                    !state.codeRunning &&
                    !state.circuitRunning
                ) {
                    return;
                }

                synchronizeArduinoInputs();

                if (state.codeRunning) {
                    const code =
                        dom.electronicCodeEditor?.value ||
                        "";

                    const analysis =
                        analyzeArduinoCode(code);

                    const controller =
                        findControllerForCode();

                    if (
                        controller &&
                        analysis.valid
                    ) {
                        const mapping =
                            buildHardwareMapping(
                                controller
                            );

                        analysis.instructions
                            .filter(instruction =>
                                instruction.type ===
                                "digitalWrite" ||
                                instruction.type ===
                                "analogWrite" ||
                                instruction.type ===
                                "tone" ||
                                instruction.type ===
                                "servoWrite"
                            )
                            .forEach(instruction => {
                                executeInstruction(
                                    controller,
                                    instruction,
                                    mapping
                                );
                            });
                    }
                }

                runSimulation();
            }, 250);
    }

    /* ============================================================
       52. ENGINE INITIALIZATION
    ============================================================ */

    function initializeEngine() {
        if (state.initialized) {
            return;
        }

        state.initialized = true;

        injectEngineSafetyStyles();

        if (dom.engineVersion) {
            dom.engineVersion.textContent =
                `Electronic Engine v${ENGINE_VERSION}`;
        }

        initializeDefaultState();

        setupStaticLibraryButtons();
        setupPanelEvents();
        setupToolbarEvents();
        setupLevelEvents();
        setupComponentLibraryEvents();
        setupCodeLibraryEvents();
        setupMissionEvents();
        setupDiagnosticEvents();
        setupControlEvents();
        setupViewportEvents();
        setupGlobalEvents();
        setupPhysicalSimulationInteractions();

        ensureDynamicLibraryCategories();

        if (dom.componentCategories) {
            const allButton =
                dom.componentCategories.querySelector(
                    '[data-category="all"]'
                );

            if (allButton) {
                allButton.classList.add("active");
            }
        }

        renderComponentLibrary();
        renderCodeLibrary();
        renderMissions();

        updateLevelUI();
        updateCodeLevelUI();

        applyWorkspaceTransform();
        calculateMeasurements();
        updateMeasurementDisplays();
        updateWorkspaceState();

        setActiveTool("select");

        restoreLocalState();

        startSimulationLoop();

        setStatus(
            "Simulation prête",
            "ready"
        );

        consoleLog(
            `FOBAS Electronic Engine v${ENGINE_VERSION} prêt.`,
            "success"
        );

        consoleLog(
            "Laboratoire libre disponible : vous pouvez créer votre propre montage.",
            "info"
        );

        consoleLog(
            "Bibliothèque Code → Copier → Éditeur → Exécuter.",
            "info"
        );
    }

    /* ============================================================
       53. DOM READY
    ============================================================ */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeEngine,
            { once: true }
        );
    } else {
        initializeEngine();
    }

})();













