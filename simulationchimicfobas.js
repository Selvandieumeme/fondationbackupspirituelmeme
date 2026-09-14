/* ================================================================
   FOBAS — LABORATOIRE CHIMIQUE
   ---------------------------------------------------------------
   MOTEUR JAVASCRIPT PRINCIPAL
   Compatible avec simulationchimicfobas.html
   Version : 4.0.0
   ================================================================ */

(() => {
    "use strict";

    /* ============================================================
       01 — CONFIGURATION
    ============================================================ */

    const APP = {};

    const STORAGE_KEY = "FOBAS_CHEMISTRY_LAB_STATE";
    const SESSION_KEY = "FOBAS_CHEMISTRY_LAB_SESSION";

    const DEFAULT_TEMPERATURE = 25;
    const MIN_TEMPERATURE = 5;
    const MAX_TEMPERATURE = 150;

    const $ = selector => document.querySelector(selector);
    const $$ = selector => [...document.querySelectorAll(selector)];

    const state = {
        objects: [],
        selectedId: null,
        nextId: 1,

        tool: "select",
        category: "all",
        search: "",

        zoom: 1,

        measurementType: "volume",

        transferSourceId: null,
        transferTargetId: null,

        sessionName: "Laboratoire chimique FOBAS",

        logs: [],

        running: true,
        initialized: false,

        heating: false
    };

    /* ============================================================
       02 — ÉLÉMENTS HTML
    ============================================================ */

    const E = {};

    function cacheElements() {

        const ids = [
            "chemApp",

            "laboratoryStateDot",
            "laboratoryStateText",
            "sessionName",

            "openMaterialsBtn",
            "chemHelpBtn",
            "chemResetBtn",
            "chemSaveBtn",

            "materialsPanel",
            "closeMaterialsBtn",
            "materialsBackdrop",
            "materialSearch",
            "materialCategories",
            "materialsLibrary",
            "materialCount",

            "inventoryList",
            "inventoryCount",

            "laboratoryWorkspace",
            "zoomOutBtn",
            "zoomValue",
            "zoomInBtn",
            "fitWorkspaceBtn",
            "clearWorkspaceBtn",

            "workspaceViewport",
            "chemistryCanvas",
            "workspaceGrid",
            "workspaceObjects",
            "workspaceDropZone",

            "temperatureOverlay",
            "reactionOverlay",

            "statusObjects",
            "statusVolume",
            "statusTemperature",
            "statusPH",
            "statusMass",

            "inspectorPanel",
            "selectedObjectType",
            "objectInspector",
            "materialProperties",
            "compositionSection",
            "measurementSection",
            "reactionSection",
            "objectActions",

            "propName",
            "propState",
            "propTemperature",
            "propMass",
            "propVolume",
            "propDensity",
            "propPH",
            "propColor",

            "compositionTotal",
            "compositionList",

            "measurementLabel",
            "measurementValue",
            "measurementPrecision",

            "reactionStatus",
            "reactionPhase",
            "reactionGas",
            "reactionPrecipitate",
            "reactionColor",

            "actionTransferBtn",
            "actionMixBtn",
            "actionMeasureBtn",
            "actionHeatBtn",
            "actionRemoveBtn",

            "observationPulse",
            "observationLog",

            "transferModal",
            "closeTransferModal",
            "transferSourceName",
            "transferSourceAmount",
            "transferTarget",
            "transferAmount",
            "transferRange",
            "transferMaxLabel",
            "cancelTransferBtn",
            "confirmTransferBtn",

            "measurementModal",
            "closeMeasurementModal",
            "instrumentScreenLabel",
            "instrumentScreenValue",
            "instrumentScreenUnit",
            "closeMeasurementBtn",

            "helpModal",
            "closeHelpModal",
            "closeHelpBtn",

            "chemToastStack",
            "chemLiveRegion"
        ];

        ids.forEach(id => {
            E[id] = document.getElementById(id);
        });
    }

    /* ============================================================
       03 — OUTILS GÉNÉRAUX
    ============================================================ */

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function round(value, decimals = 2) {
        const p = Math.pow(10, decimals);
        return Math.round((Number(value) || 0) * p) / p;
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function uid(prefix = "obj") {
        const id = state.nextId++;
        return `${prefix}_${id}_${Date.now().toString(36)}`;
    }

    function getMaterial(id) {
        return MATERIAL_MAP.get(id) || null;
    }

    function getObject(id) {
        return state.objects.find(obj => obj.id === id) || null;
    }

    function getSelected() {
        return getObject(state.selectedId);
    }

    function nowTime() {
        return new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    /* ============================================================
       04 — MATÉRIAUX
    ============================================================ */

    const MATERIALS = [



/* ---------------- VERRERIE ---------------- */

{
    id: "beaker50",
    name: "Bécher 50 mL",
    shortName: "Bécher 50",
    category: "glassware",
    kind: "container",
    icon: "🧪",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 50,
    emptyMassG: 45,
    width: 92,
    height: 118,
    color: "#d9edf7"
},

{
    id: "beaker100",
    name: "Bécher 100 mL",
    shortName: "Bécher 100",
    category: "glassware",
    kind: "container",
    icon: "🧪",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 100,
    emptyMassG: 65,
    width: 100,
    height: 128,
    color: "#d9edf7"
},

{
    id: "beaker250",
    name: "Bécher 250 mL",
    shortName: "Bécher 250",
    category: "glassware",
    kind: "container",
    icon: "🧪",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 250,
    emptyMassG: 105,
    width: 116,
    height: 145,
    color: "#d9edf7"
},

{
    id: "beaker500",
    name: "Bécher 500 mL",
    shortName: "Bécher 500",
    category: "glassware",
    kind: "container",
    icon: "🧪",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 500,
    emptyMassG: 165,
    width: 130,
    height: 160,
    color: "#d9edf7"
},

{
    id: "erlenmeyer100",
    name: "Erlenmeyer 100 mL",
    shortName: "Erlenmeyer 100",
    category: "glassware",
    kind: "container",
    icon: "⚗️",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 100,
    emptyMassG: 85,
    width: 108,
    height: 138,
    color: "#d9edf7"
},

{
    id: "erlenmeyer250",
    name: "Erlenmeyer 250 mL",
    shortName: "Erlenmeyer 250",
    category: "glassware",
    kind: "container",
    icon: "⚗️",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 250,
    emptyMassG: 125,
    width: 122,
    height: 155,
    color: "#d9edf7"
},

{
    id: "testTube",
    name: "Tube à essai",
    shortName: "Tube",
    category: "glassware",
    kind: "container",
    icon: "🧫",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 20,
    emptyMassG: 18,
    width: 55,
    height: 150,
    color: "#d9edf7"
},

{
    id: "graduated10",
    name: "Éprouvette graduée 10 mL",
    shortName: "Éprouvette 10",
    category: "glassware",
    kind: "container",
    icon: "🥃",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 10,
    emptyMassG: 25,
    width: 60,
    height: 170,
    color: "#d9edf7",
    precisionVolume: 0.1
},

{
    id: "graduated100",
    name: "Éprouvette graduée 100 mL",
    shortName: "Éprouvette 100",
    category: "glassware",
    kind: "container",
    icon: "🥃",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 100,
    emptyMassG: 70,
    width: 70,
    height: 190,
    color: "#d9edf7",
    precisionVolume: 0.5
},

{
    id: "volumetricFlask",
    name: "Fiole jaugée 100 mL",
    shortName: "Fiole jaugée",
    category: "glassware",
    kind: "container",
    icon: "⚗️",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 100,
    emptyMassG: 80,
    width: 110,
    height: 170,
    color: "#d9edf7",
    precisionVolume: 0.1
},

{
    id: "funnel",
    name: "Entonnoir",
    shortName: "Entonnoir",
    category: "glassware",
    kind: "equipment",
    icon: "🔻",
    formula: "",
    phase: "solid",
    state: "propre",
    width: 90,
    height: 95,
    color: "#d9edf7"
},

{
    id: "beaker1000",
    name: "Bécher 1000 mL",
    shortName: "Bécher 1000",
    category: "glassware",
    kind: "container",
    icon: "🧪",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 1000,
    emptyMassG: 320,
    width: 145,
    height: 180,
    color: "#d9edf7"
},

{
    id: "erlenmeyer500",
    name: "Erlenmeyer 500 mL",
    shortName: "Erlenmeyer 500",
    category: "glassware",
    kind: "container",
    icon: "⚗️",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 500,
    emptyMassG: 210,
    width: 140,
    height: 180,
    color: "#d9edf7"
},

{
    id: "volumetricFlask250",
    name: "Fiole jaugée 250 mL",
    shortName: "Fiole jaugée 250",
    category: "glassware",
    kind: "container",
    icon: "⚗️",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 250,
    emptyMassG: 135,
    width: 120,
    height: 185,
    color: "#d9edf7",
    precisionVolume: 0.2
},

{
    id: "volumetricFlask500",
    name: "Fiole jaugée 500 mL",
    shortName: "Fiole jaugée 500",
    category: "glassware",
    kind: "container",
    icon: "⚗️",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 500,
    emptyMassG: 190,
    width: 130,
    height: 205,
    color: "#d9edf7",
    precisionVolume: 0.5
},

{
    id: "pasteurPipette",
    name: "Pipette Pasteur",
    shortName: "Pipette Pasteur",
    category: "glassware",
    kind: "equipment",
    icon: "💧",
    formula: "",
    phase: "solid",
    state: "propre",
    width: 45,
    height: 170,
    color: "#d9edf7"
},

{
    id: "burette50",
    name: "Burette graduée 50 mL",
    shortName: "Burette 50",
    category: "glassware",
    kind: "equipment",
    icon: "🧪",
    formula: "",
    phase: "solid",
    state: "propre",
    capacityMl: 50,
    width: 55,
    height: 300,
    color: "#d9edf7",
    precisionVolume: 0.1
},

{
    id: "volumetricPipette10",
    name: "Pipette jaugée 10 mL",
    shortName: "Pipette jaugée 10",
    category: "glassware",
    kind: "equipment",
    icon: "💧",
    formula: "",
    phase: "solid",
    state: "propre",
    capacityMl: 10,
    width: 45,
    height: 230,
    color: "#d9edf7",
    precisionVolume: 0.02
},

{
    id: "volumetricPipette25",
    name: "Pipette jaugée 25 mL",
    shortName: "Pipette jaugée 25",
    category: "glassware",
    kind: "equipment",
    icon: "💧",
    formula: "",
    phase: "solid",
    state: "propre",
    capacityMl: 25,
    width: 48,
    height: 250,
    color: "#d9edf7",
    precisionVolume: 0.05
},

{
    id: "roundBottomFlask250",
    name: "Ballon à fond rond 250 mL",
    shortName: "Ballon 250",
    category: "glassware",
    kind: "container",
    icon: "⚗️",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 250,
    emptyMassG: 145,
    width: 125,
    height: 175,
    color: "#d9edf7"
},

{
    id: "roundBottomFlask500",
    name: "Ballon à fond rond 500 mL",
    shortName: "Ballon 500",
    category: "glassware",
    kind: "container",
    icon: "⚗️",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 500,
    emptyMassG: 205,
    width: 145,
    height: 195,
    color: "#d9edf7"
},

{
    id: "watchGlass",
    name: "Verre de montre",
    shortName: "Verre de montre",
    category: "glassware",
    kind: "equipment",
    icon: "◯",
    formula: "",
    phase: "solid",
    state: "propre",
    width: 120,
    height: 35,
    color: "#d9edf7"
},

{
    id: "crystallizingDish",
    name: "Cristallisoir",
    shortName: "Cristallisoir",
    category: "glassware",
    kind: "container",
    icon: "🥣",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 250,
    emptyMassG: 120,
    width: 145,
    height: 75,
    color: "#d9edf7"
},

{
    id: "evaporationDish",
    name: "Capsule d'évaporation",
    shortName: "Capsule évaporation",
    category: "glassware",
    kind: "container",
    icon: "🥣",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 100,
    emptyMassG: 85,
    width: 120,
    height: 55,
    color: "#d9edf7"
},

{
    id: "crucible",
    name: "Creuset",
    shortName: "Creuset",
    category: "glassware",
    kind: "container",
    icon: "🫙",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 50,
    emptyMassG: 75,
    width: 90,
    height: 70,
    color: "#e5e7eb"
},

{
    id: "mortar",
    name: "Mortier",
    shortName: "Mortier",
    category: "glassware",
    kind: "equipment",
    icon: "🥣",
    formula: "",
    phase: "solid",
    state: "propre",
    width: 105,
    height: 80,
    color: "#d9edf7"
},

{
    id: "pestle",
    name: "Pilon",
    shortName: "Pilon",
    category: "glassware",
    kind: "equipment",
    icon: "🔨",
    formula: "",
    phase: "solid",
    state: "propre",
    width: 55,
    height: 130,
    color: "#d9edf7"
},

{
    id: "petriDish",
    name: "Boîte de Petri",
    shortName: "Boîte de Petri",
    category: "glassware",
    kind: "container",
    icon: "🧫",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 50,
    emptyMassG: 35,
    width: 120,
    height: 45,
    color: "#d9edf7"
},

{
    id: "separatoryFunnel",
    name: "Ampoule à décanter",
    shortName: "Ampoule à décanter",
    category: "glassware",
    kind: "container",
    icon: "⚗️",
    formula: "",
    phase: "empty",
    state: "vide",
    capacityMl: 250,
    emptyMassG: 180,
    width: 110,
    height: 210,
    color: "#d9edf7"
},

{
    id: "refluxCondenser",
    name: "Réfrigérant à reflux",
    shortName: "Réfrigérant à reflux",
    category: "glassware",
    kind: "equipment",
    icon: "🧪",
    formula: "",
    phase: "solid",
    state: "propre",
    width: 80,
    height: 230,
    color: "#d9edf7"
},







/* ---------------- LIQUIDES / RÉACTIFS ---------------- */

{
    id: "water",
    name: "Eau distillée",
    shortName: "Eau",
    category: "reagent",
    kind: "reagent",
    icon: "💧",
    formula: "H₂O",
    phase: "liquid",
    state: "liquide",
    defaultVolumeMl: 100,
    maxVolumeMl: 1000,
    density: 1,
    pH: 7,
    temperatureC: 25,
    color: "#7dd3fc",
    molarity: 55.5,
    role: "solvent"
},

{
    id: "hydrochloricAcid",
    name: "Acide chlorhydrique",
    shortName: "HCl",
    category: "reagent",
    kind: "reagent",
    icon: "⚗️",
    formula: "HCl",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 1,
    temperatureC: 25,
    color: "#eef2ff",
    molarity: 1,
    strongAcid: true,
    acidEquivalent: 1
},

{
    id: "sodiumHydroxide",
    name: "Hydroxyde de sodium",
    shortName: "NaOH",
    category: "reagent",
    kind: "reagent",
    icon: "⚗️",
    formula: "NaOH",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 13,
    temperatureC: 25,
    color: "#fff1b8",
    molarity: 1,
    strongBase: true,
    baseEquivalent: 1
},

{
    id: "copperSulfate",
    name: "Sulfate de cuivre(II)",
    shortName: "CuSO₄",
    category: "reagent",
    kind: "reagent",
    icon: "🔵",
    formula: "CuSO₄",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1.02,
    pH: 5,
    temperatureC: 25,
    color: "#2196f3",
    molarity: 0.5,
    aqueousSalt: true
},

{
    id: "sodiumChloride",
    name: "Chlorure de sodium",
    shortName: "NaCl",
    category: "reagent",
    kind: "reagent",
    icon: "🧂",
    formula: "NaCl",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 7,
    temperatureC: 25,
    color: "#eef7ff",
    molarity: 1,
    aqueousSalt: true
},

{
    id: "ethanol",
    name: "Éthanol",
    shortName: "Éthanol",
    category: "reagent",
    kind: "reagent",
    icon: "🧴",
    formula: "C₂H₅OH",
    phase: "liquid",
    state: "liquide",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 0.789,
    pH: 7,
    temperatureC: 25,
    color: "#f8fafc"
},

{
    id: "universalIndicator",
    name: "Indicateur universel",
    shortName: "Indicateur",
    category: "reagent",
    kind: "reagent",
    icon: "🟣",
    formula: "Ind.",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 25,
    maxVolumeMl: 100,
    density: 1,
    pH: 7,
    temperatureC: 25,
    color: "#38bdf8",
    indicator: true
},

{
    id: "phenolphthalein",
    name: "Phénolphtaléine",
    shortName: "Phénolphtaléine",
    category: "reagent",
    kind: "reagent",
    icon: "🩷",
    formula: "Ind.",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 25,
    maxVolumeMl: 100,
    density: 1,
    pH: 7,
    temperatureC: 25,
    color: "#f8fafc",
    indicator: true,
    phenolphthalein: true
},

{
    id: "sulfuricAcid",
    name: "Acide sulfurique",
    shortName: "H₂SO₄",
    category: "reagent",
    kind: "reagent",
    icon: "⚗️",
    formula: "H₂SO₄",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1.84,
    pH: 0.5,
    temperatureC: 25,
    color: "#f1f5f9",
    molarity: 1,
    strongAcid: true,
    acidEquivalent: 2
},

{
    id: "nitricAcid",
    name: "Acide nitrique",
    shortName: "HNO₃",
    category: "reagent",
    kind: "reagent",
    icon: "⚗️",
    formula: "HNO₃",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1.05,
    pH: 1,
    temperatureC: 25,
    color: "#f8fafc",
    molarity: 1,
    strongAcid: true,
    acidEquivalent: 1
},

{
    id: "aceticAcid",
    name: "Acide acétique",
    shortName: "Acide acétique",
    category: "reagent",
    kind: "reagent",
    icon: "🧴",
    formula: "CH₃COOH",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1.05,
    pH: 2.4,
    temperatureC: 25,
    color: "#fffdf5",
    molarity: 1,
    weakAcid: true,
    acidEquivalent: 1
},

{
    id: "ammoniaSolution",
    name: "Ammoniaque",
    shortName: "NH₃(aq)",
    category: "reagent",
    kind: "reagent",
    icon: "🧴",
    formula: "NH₃",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 0.98,
    pH: 11,
    temperatureC: 25,
    color: "#f8fafc",
    molarity: 1,
    weakBase: true,
    baseEquivalent: 1
},

{
    id: "potassiumHydroxide",
    name: "Hydroxyde de potassium",
    shortName: "KOH",
    category: "reagent",
    kind: "reagent",
    icon: "⚗️",
    formula: "KOH",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 13,
    temperatureC: 25,
    color: "#fff1b8",
    molarity: 1,
    strongBase: true,
    baseEquivalent: 1
},

{
    id: "silverNitrate",
    name: "Nitrate d'argent",
    shortName: "AgNO₃",
    category: "reagent",
    kind: "reagent",
    icon: "⚗️",
    formula: "AgNO₃",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 7,
    temperatureC: 25,
    color: "#f8fafc",
    molarity: 0.5,
    aqueousSalt: true
},

{
    id: "copperNitrate",
    name: "Nitrate de cuivre(II)",
    shortName: "Cu(NO₃)₂",
    category: "reagent",
    kind: "reagent",
    icon: "🔵",
    formula: "Cu(NO₃)₂",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 5,
    temperatureC: 25,
    color: "#38bdf8",
    molarity: 0.5,
    aqueousSalt: true
},

{
    id: "ferricChloride",
    name: "Chlorure de fer(III)",
    shortName: "FeCl₃",
    category: "reagent",
    kind: "reagent",
    icon: "🟤",
    formula: "FeCl₃",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 2,
    temperatureC: 25,
    color: "#b45309",
    molarity: 0.5,
    aqueousSalt: true
},

{
    id: "ferrousChloride",
    name: "Chlorure de fer(II)",
    shortName: "FeCl₂",
    category: "reagent",
    kind: "reagent",
    icon: "🟢",
    formula: "FeCl₂",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 4,
    temperatureC: 25,
    color: "#86efac",
    molarity: 0.5,
    aqueousSalt: true
},

{
    id: "ironSulfate",
    name: "Sulfate de fer(II)",
    shortName: "FeSO₄",
    category: "reagent",
    kind: "reagent",
    icon: "🟢",
    formula: "FeSO₄",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 4,
    temperatureC: 25,
    color: "#86efac",
    molarity: 0.5,
    aqueousSalt: true
},

{
    id: "magnesiumSulfate",
    name: "Sulfate de magnésium",
    shortName: "MgSO₄",
    category: "reagent",
    kind: "reagent",
    icon: "⚗️",
    formula: "MgSO₄",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 7,
    temperatureC: 25,
    color: "#f8fafc",
    molarity: 0.5,
    aqueousSalt: true
},

{
    id: "sodiumNitrate",
    name: "Nitrate de sodium",
    shortName: "NaNO₃",
    category: "reagent",
    kind: "reagent",
    icon: "⚗️",
    formula: "NaNO₃",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 7,
    temperatureC: 25,
    color: "#f8fafc",
    molarity: 0.5,
    aqueousSalt: true
},

{
    id: "potassiumNitrate",
    name: "Nitrate de potassium",
    shortName: "KNO₃",
    category: "reagent",
    kind: "reagent",
    icon: "⚗️",
    formula: "KNO₃",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 7,
    temperatureC: 25,
    color: "#f8fafc",
    molarity: 0.5,
    aqueousSalt: true
},

{
    id: "sodiumCarbonateSolution",
    name: "Carbonate de sodium",
    shortName: "Na₂CO₃",
    category: "reagent",
    kind: "reagent",
    icon: "⚗️",
    formula: "Na₂CO₃",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 11,
    temperatureC: 25,
    color: "#f8fafc",
    molarity: 0.5,
    aqueousSalt: true
},

{
    id: "sodiumBromideSolution",
    name: "Bromure de sodium",
    shortName: "NaBr",
    category: "reagent",
    kind: "reagent",
    icon: "⚗️",
    formula: "NaBr",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 7,
    temperatureC: 25,
    color: "#f8fafc",
    molarity: 0.5,
    aqueousSalt: true
},

{
    id: "potassiumIodideSolution",
    name: "Iodure de potassium",
    shortName: "KI",
    category: "reagent",
    kind: "reagent",
    icon: "⚗️",
    formula: "KI",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 7,
    temperatureC: 25,
    color: "#f8fafc",
    molarity: 0.5,
    aqueousSalt: true
},

{
    id: "hydrogenPeroxide",
    name: "Peroxyde d'hydrogène",
    shortName: "H₂O₂",
    category: "reagent",
    kind: "reagent",
    icon: "💧",
    formula: "H₂O₂",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 6,
    temperatureC: 25,
    color: "#e0f2fe",
    molarity: 1
},

{
    id: "limewater",
    name: "Eau de chaux",
    shortName: "Ca(OH)₂",
    category: "reagent",
    kind: "reagent",
    icon: "⚗️",
    formula: "Ca(OH)₂",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 12.4,
    temperatureC: 25,
    color: "#f8fafc",
    molarity: 0.02,
    aqueousSalt: true
},

{
    id: "phosphoricAcid",
    name: "Acide phosphorique",
    shortName: "H₃PO₄",
    category: "reagent",
    kind: "reagent",
    icon: "⚗️",
    formula: "H₃PO₄",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 2,
    temperatureC: 25,
    color: "#f8fafc",
    molarity: 1,
    weakAcid: true,
    acidEquivalent: 3
},

{
    id: "citricAcid",
    name: "Acide citrique",
    shortName: "Acide citrique",
    category: "reagent",
    kind: "reagent",
    icon: "⚗️",
    formula: "C₆H₈O₇",
    phase: "liquid",
    state: "solution",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 1,
    pH: 2.2,
    temperatureC: 25,
    color: "#fefce8",
    molarity: 0.5,
    weakAcid: true,
    acidEquivalent: 3
},

{
    id: "methanol",
    name: "Méthanol",
    shortName: "Méthanol",
    category: "reagent",
    kind: "reagent",
    icon: "🧴",
    formula: "CH₃OH",
    phase: "liquid",
    state: "liquide",
    defaultVolumeMl: 100,
    maxVolumeMl: 500,
    density: 0.792,
    pH: 7,
    temperatureC: 25,
    color: "#f8fafc"
},








/* ---------------- SOLIDES ---------------- */

{
    id: "zinc",
    name: "Zinc",
    shortName: "Zn",
    category: "solid",
    kind: "solid",
    icon: "⚙️",
    formula: "Zn",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 7.14,
    molarMass: 65.38,
    color: "#9ca3af",
    metal: true
},

{
    id: "copper",
    name: "Cuivre",
    shortName: "Cu",
    category: "solid",
    kind: "solid",
    icon: "🟤",
    formula: "Cu",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 8.96,
    molarMass: 63.546,
    color: "#b87333",
    metal: true
},

{
    id: "iron",
    name: "Fer",
    shortName: "Fe",
    category: "solid",
    kind: "solid",
    icon: "⚙️",
    formula: "Fe",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 7.87,
    molarMass: 55.845,
    color: "#525252",
    metal: true
},

{
    id: "aluminium",
    name: "Aluminium",
    shortName: "Al",
    category: "solid",
    kind: "solid",
    icon: "⬜",
    formula: "Al",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 2.7,
    molarMass: 26.9815,
    color: "#cbd5e1",
    metal: true
},

{
    id: "magnesium",
    name: "Magnésium",
    shortName: "Mg",
    category: "solid",
    kind: "solid",
    icon: "⬜",
    formula: "Mg",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 1.738,
    molarMass: 24.305,
    color: "#e5e7eb",
    metal: true
},

{
    id: "sulfur",
    name: "Soufre",
    shortName: "S",
    category: "solid",
    kind: "solid",
    icon: "🟡",
    formula: "S",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 2.07,
    molarMass: 32.06,
    color: "#facc15"
},

{
    id: "carbon",
    name: "Carbone",
    shortName: "C",
    category: "solid",
    kind: "solid",
    icon: "⚫",
    formula: "C",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 2.26,
    molarMass: 12.011,
    color: "#171717"
},

{
    id: "sodium",
    name: "Sodium",
    shortName: "Na",
    category: "solid",
    kind: "solid",
    icon: "🩶",
    formula: "Na",
    phase: "solid",
    state: "solide",
    defaultMassG: 2,
    density: 0.968,
    molarMass: 22.99,
    color: "#cbd5e1",
    metal: true
},

{
    id: "calciumCarbonate",
    name: "Carbonate de calcium",
    shortName: "CaCO₃",
    category: "solid",
    kind: "solid",
    icon: "⚪",
    formula: "CaCO₃",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 2.71,
    molarMass: 100.0869,
    color: "#eeeeee"
},

{
    id: "sodiumBicarbonate",
    name: "Bicarbonate de sodium",
    shortName: "NaHCO₃",
    category: "solid",
    kind: "solid",
    icon: "⚪",
    formula: "NaHCO₃",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 2.2,
    molarMass: 84.0066,
    color: "#f2f2f2"
},

{
    id: "sodiumChlorideSolid",
    name: "Chlorure de sodium solide",
    shortName: "NaCl",
    category: "solid",
    kind: "solid",
    icon: "🧂",
    formula: "NaCl",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 2.165,
    molarMass: 58.44,
    color: "#ffffff"
},

{
    id: "calcium",
    name: "Calcium",
    shortName: "Ca",
    category: "solid",
    kind: "solid",
    icon: "⚙️",
    formula: "Ca",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 1.55,
    molarMass: 40.078,
    color: "#d1d5db",
    metal: true
},

{
    id: "potassium",
    name: "Potassium",
    shortName: "K",
    category: "solid",
    kind: "solid",
    icon: "🩶",
    formula: "K",
    phase: "solid",
    state: "solide",
    defaultMassG: 2,
    density: 0.862,
    molarMass: 39.0983,
    color: "#cbd5e1",
    metal: true
},

{
    id: "nickel",
    name: "Nickel",
    shortName: "Ni",
    category: "solid",
    kind: "solid",
    icon: "⚙️",
    formula: "Ni",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 8.908,
    molarMass: 58.6934,
    color: "#737373",
    metal: true
},

{
    id: "lead",
    name: "Plomb",
    shortName: "Pb",
    category: "solid",
    kind: "solid",
    icon: "⚙️",
    formula: "Pb",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 11.34,
    molarMass: 207.2,
    color: "#64748b",
    metal: true
},

{
    id: "tin",
    name: "Étain",
    shortName: "Sn",
    category: "solid",
    kind: "solid",
    icon: "⚙️",
    formula: "Sn",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 7.31,
    molarMass: 118.71,
    color: "#cbd5e1",
    metal: true
},

{
    id: "silver",
    name: "Argent",
    shortName: "Ag",
    category: "solid",
    kind: "solid",
    icon: "⚙️",
    formula: "Ag",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 10.49,
    molarMass: 107.8682,
    color: "#e5e7eb",
    metal: true
},

{
    id: "gold",
    name: "Or",
    shortName: "Au",
    category: "solid",
    kind: "solid",
    icon: "🟨",
    formula: "Au",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 19.32,
    molarMass: 196.96657,
    color: "#fbbf24",
    metal: true
},

{
    id: "manganeseDioxide",
    name: "Dioxyde de manganèse",
    shortName: "MnO₂",
    category: "solid",
    kind: "solid",
    icon: "⚫",
    formula: "MnO₂",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 5.03,
    molarMass: 86.9368,
    color: "#262626"
},

{
    id: "copperOxide",
    name: "Oxyde de cuivre(II)",
    shortName: "CuO",
    category: "solid",
    kind: "solid",
    icon: "⚫",
    formula: "CuO",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 6.31,
    molarMass: 79.545,
    color: "#171717"
},

{
    id: "ironOxide",
    name: "Oxyde de fer(III)",
    shortName: "Fe₂O₃",
    category: "solid",
    kind: "solid",
    icon: "🟤",
    formula: "Fe₂O₃",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 5.24,
    molarMass: 159.69,
    color: "#8b4513"
},

{
    id: "zincOxide",
    name: "Oxyde de zinc",
    shortName: "ZnO",
    category: "solid",
    kind: "solid",
    icon: "⚪",
    formula: "ZnO",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 5.61,
    molarMass: 81.38,
    color: "#f5f5f5"
},

{
    id: "calciumHydroxide",
    name: "Hydroxyde de calcium",
    shortName: "Ca(OH)₂",
    category: "solid",
    kind: "solid",
    icon: "⚪",
    formula: "Ca(OH)₂",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 2.21,
    molarMass: 74.092,
    color: "#f5f5f5"
},

{
    id: "sodiumCarbonateSolid",
    name: "Carbonate de sodium",
    shortName: "Na₂CO₃",
    category: "solid",
    kind: "solid",
    icon: "⚪",
    formula: "Na₂CO₃",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 2.54,
    molarMass: 105.9888,
    color: "#f5f5f5"
},

{
    id: "copperSulfatePentahydrate",
    name: "Sulfate de cuivre pentahydraté",
    shortName: "CuSO₄·5H₂O",
    category: "solid",
    kind: "solid",
    icon: "🔵",
    formula: "CuSO₄·5H₂O",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 2.286,
    molarMass: 249.68,
    color: "#2563eb"
},

{
    id: "potassiumPermanganate",
    name: "Permanganate de potassium",
    shortName: "KMnO₄",
    category: "solid",
    kind: "solid",
    icon: "🟣",
    formula: "KMnO₄",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 2.703,
    molarMass: 158.034,
    color: "#7c3aed"
},

{
    id: "iodine",
    name: "Iode",
    shortName: "I₂",
    category: "solid",
    kind: "solid",
    icon: "🟣",
    formula: "I₂",
    phase: "solid",
    state: "solide",
    defaultMassG: 2,
    density: 4.93,
    molarMass: 253.8089,
    color: "#4c1d95"
},

{
    id: "glucose",
    name: "Glucose",
    shortName: "Glucose",
    category: "solid",
    kind: "solid",
    icon: "⚪",
    formula: "C₆H₁₂O₆",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 1.54,
    molarMass: 180.156,
    color: "#f8fafc"
},

{
    id: "sucrose",
    name: "Saccharose",
    shortName: "Saccharose",
    category: "solid",
    kind: "solid",
    icon: "🍬",
    formula: "C₁₂H₂₂O₁₁",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 1.587,
    molarMass: 342.2965,
    color: "#ffffff"
},

{
    id: "starch",
    name: "Amidon",
    shortName: "Amidon",
    category: "solid",
    kind: "solid",
    icon: "⚪",
    formula: "(C₆H₁₀O₅)ₙ",
    phase: "solid",
    state: "solide",
    defaultMassG: 5,
    density: 1.5,
    molarMass: 162.14,
    color: "#f5f5f5"
},







/* ---------------- INSTRUMENTS ---------------- */

{
    id: "electronicBalance",
    name: "Balance électronique",
    shortName: "Balance",
    category: "instrument",
    kind: "equipment",
    icon: "⚖️",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#e5e7eb"
},
{
    id: "thermometer",
    name: "Thermomètre",
    shortName: "Thermomètre",
    category: "instrument",
    kind: "equipment",
    icon: "🌡️",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#f8fafc"
},
{
    id: "phMeter",
    name: "pH-mètre",
    shortName: "pH-mètre",
    category: "instrument",
    kind: "equipment",
    icon: "🧪",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#dbeafe"
},
{
    id: "graduatedPipette",
    name: "Pipette graduée",
    shortName: "Pipette",
    category: "instrument",
    kind: "equipment",
    icon: "💧",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#e0f2fe"
},
{
    id: "magneticStirrer",
    name: "Agitateur magnétique",
    shortName: "Agitateur",
    category: "instrument",
    kind: "equipment",
    icon: "🔄",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#cbd5e1"
},
{
    id: "conductimeter",
    name: "Conductimètre",
    shortName: "Conductimètre",
    category: "instrument",
    kind: "equipment",
    icon: "📟",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#dbeafe"
},
{
    id: "spectrophotometer",
    name: "Spectrophotomètre",
    shortName: "Spectrophotomètre",
    category: "instrument",
    kind: "equipment",
    icon: "🌈",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#e0e7ff"
},
{
    id: "centrifuge",
    name: "Centrifugeuse",
    shortName: "Centrifugeuse",
    category: "instrument",
    kind: "equipment",
    icon: "🌀",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#e5e7eb"
},
{
    id: "hotPlate",
    name: "Plaque chauffante",
    shortName: "Plaque chauffante",
    category: "instrument",
    kind: "equipment",
    icon: "🔥",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#fecaca"
},
{
    id: "digitalCaliper",
    name: "Pied à coulisse numérique",
    shortName: "Pied à coulisse",
    category: "instrument",
    kind: "equipment",
    icon: "📏",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#cbd5e1"
},
{
    id: "microscope",
    name: "Microscope",
    shortName: "Microscope",
    category: "instrument",
    kind: "equipment",
    icon: "🔬",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#e5e7eb"
},
{
    id: "analyticalBalance",
    name: "Balance analytique",
    shortName: "Balance analytique",
    category: "instrument",
    kind: "equipment",
    icon: "⚖️",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#f1f5f9"
},
{
    id: "meltingPointApparatus",
    name: "Appareil à point de fusion",
    shortName: "Point de fusion",
    category: "instrument",
    kind: "equipment",
    icon: "🌡️",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#fee2e2"
},
{
    id: "refractometer",
    name: "Réfractomètre",
    shortName: "Réfractomètre",
    category: "instrument",
    kind: "equipment",
    icon: "🔭",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#dbeafe"
},
{
    id: "colorimeter",
    name: "Colorimètre",
    shortName: "Colorimètre",
    category: "instrument",
    kind: "equipment",
    icon: "🎨",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#ede9fe"
},




{
    id: "hotPlateEquipment",
    name: "Plaque chauffante",
    shortName: "Plaque chauffante",
    category: "equipment",
    kind: "equipment",
    icon: "🔥",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#fecaca"
},
{
    id: "universalSupport",
    name: "Support universel",
    shortName: "Support universel",
    category: "equipment",
    kind: "equipment",
    icon: "🔩",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#cbd5e1"
},
{
    id: "labClamp",
    name: "Pince de laboratoire",
    shortName: "Pince",
    category: "equipment",
    kind: "equipment",
    icon: "🗜️",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#9ca3af"
},
{
    id: "spatula",
    name: "Spatule",
    shortName: "Spatule",
    category: "equipment",
    kind: "equipment",
    icon: "🥄",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#d1d5db"
},
{
    id: "labGloves",
    name: "Gants de laboratoire",
    shortName: "Gants",
    category: "equipment",
    kind: "equipment",
    icon: "🧤",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#bfdbfe"
},
{
    id: "safetyGlasses",
    name: "Lunettes de sécurité",
    shortName: "Lunettes",
    category: "equipment",
    kind: "equipment",
    icon: "🥽",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#dbeafe"
},
{
    id: "tripodStand",
    name: "Trépied de laboratoire",
    shortName: "Trépied",
    category: "equipment",
    kind: "equipment",
    icon: "🔺",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#9ca3af"
},
{
    id: "wireGauze",
    name: "Toile métallique",
    shortName: "Toile métallique",
    category: "equipment",
    kind: "equipment",
    icon: "▦",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#a3a3a3"
},
{
    id: "bunsenBurner",
    name: "Bec Bunsen",
    shortName: "Bec Bunsen",
    category: "equipment",
    kind: "equipment",
    icon: "🔥",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#d1d5db"
},
{
    id: "ringStand",
    name: "Anneau de support",
    shortName: "Anneau",
    category: "equipment",
    kind: "equipment",
    icon: "⭕",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#9ca3af"
},
{
    id: "testTubeRack",
    name: "Porte-tubes à essai",
    shortName: "Porte-tubes",
    category: "equipment",
    kind: "equipment",
    icon: "🧪",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#cbd5e1"
},
{
    id: "washBottle",
    name: "Pissette",
    shortName: "Pissette",
    category: "equipment",
    kind: "equipment",
    icon: "💧",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#bfdbfe"
},
{
    id: "dropper",
    name: "Compte-gouttes",
    shortName: "Compte-gouttes",
    category: "equipment",
    kind: "equipment",
    icon: "💧",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#dbeafe"
},
{
    id: "rubberStopper",
    name: "Bouchon en caoutchouc",
    shortName: "Bouchon",
    category: "equipment",
    kind: "equipment",
    icon: "⚫",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#404040"
},
{
    id: "glassRod",
    name: "Baguette en verre",
    shortName: "Baguette en verre",
    category: "equipment",
    kind: "equipment",
    icon: "🪄",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#e0f2fe"
},
{
    id: "labBrush",
    name: "Brosse de laboratoire",
    shortName: "Brosse",
    category: "equipment",
    kind: "equipment",
    icon: "🧹",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#d1d5db"
},
{
    id: "safetyShield",
    name: "Écran de protection",
    shortName: "Écran de protection",
    category: "equipment",
    kind: "equipment",
    icon: "🛡️",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#bfdbfe"
},
{
    id: "fumeHood",
    name: "Hotte aspirante",
    shortName: "Hotte",
    category: "equipment",
    kind: "equipment",
    icon: "🌬️",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#cbd5e1"
},
{
    id: "labTimer",
    name: "Minuteur de laboratoire",
    shortName: "Minuteur",
    category: "equipment",
    kind: "equipment",
    icon: "⏱️",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#e5e7eb"
},
{
    id: "labTongs",
    name: "Pinces à creuset",
    shortName: "Pinces à creuset",
    category: "equipment",
    kind: "equipment",
    icon: "🗜️",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#9ca3af"
},
{
    id: "retortClamp",
    name: "Pince à burette",
    shortName: "Pince à burette",
    category: "equipment",
    kind: "equipment",
    icon: "🗜️",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#a3a3a3"
},
{
    id: "labFunnelStand",
    name: "Support d'entonnoir",
    shortName: "Support d'entonnoir",
    category: "equipment",
    kind: "equipment",
    icon: "🔧",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#cbd5e1"
},
{
    id: "gasCollectionKit",
    name: "Kit de collecte des gaz",
    shortName: "Collecteur de gaz",
    category: "equipment",
    kind: "equipment",
    icon: "💨",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#dbeafe"
},
{
    id: "vacuumPump",
    name: "Pompe à vide",
    shortName: "Pompe à vide",
    category: "equipment",
    kind: "equipment",
    icon: "🔵",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#94a3b8"
},
{
    id: "labScaleTable",
    name: "Table de laboratoire",
    shortName: "Table de laboratoire",
    category: "equipment",
    kind: "equipment",
    icon: "🧰",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#d1d5db"
},
{
    id: "chemicalStorageCabinet",
    name: "Armoire de stockage chimique",
    shortName: "Armoire chimique",
    category: "equipment",
    kind: "equipment",
    icon: "🗄️",
    formula: "",
    phase: "solid",
    state: "stable",
    defaultMassG: 0,
    color: "#cbd5e1"
}


    ];

    const MATERIAL_MAP = new Map(
        MATERIALS.map(material => [material.id, material])
    );

    /* ============================================================
       05 — STYLES VISUELS 3D
    ============================================================ */

    function inject3DStyles() {

        if (document.getElementById("fobasChemistry3DStyles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "fobasChemistry3DStyles";

        style.textContent = `
            .chem-material-card {
                position: relative;
                overflow: hidden;
            }

            .chem-material-card .chem-material-icon,
            .material-card .chem-material-icon {
                display:flex;
                align-items:center;
                justify-content:center;
                width:64px;
                height:64px;
                border-radius:18px;
                font-size:32px;
                background:
                    radial-gradient(
                        circle at 30% 20%,
                        rgba(255,255,255,.95),
                        rgba(255,255,255,.20) 38%,
                        rgba(0,0,0,.15) 100%
                    );
                box-shadow:
                    inset 0 2px 4px rgba(255,255,255,.55),
                    inset 0 -7px 12px rgba(0,0,0,.12),
                    0 8px 18px rgba(0,0,0,.15);
                transform: translateZ(0);
            }

            .fobas-chem-object {
                position:absolute;
                user-select:none;
                touch-action:none;
                cursor:grab;
                transform-origin:center;
                transition:
                    box-shadow .18s ease,
                    transform .18s ease;
            }

            .fobas-chem-object:active {
                cursor:grabbing;
            }

            .fobas-chem-object.selected {
                z-index:50;
                box-shadow:
                    0 0 0 3px rgba(56,189,248,.55),
                    0 16px 35px rgba(0,0,0,.28);
            }

            .fobas-object-glass {
                border:1px solid rgba(255,255,255,.7);
                background:
                    linear-gradient(
                        135deg,
                        rgba(255,255,255,.75),
                        rgba(191,219,254,.24)
                    );
                backdrop-filter:blur(5px);
                box-shadow:
                    inset 0 0 18px rgba(255,255,255,.45),
                    0 14px 28px rgba(0,0,0,.22);
                border-radius:18px 18px 24px 24px;
            }

            .fobas-object-liquid {
                position:absolute;
                left:8%;
                right:8%;
                bottom:7%;
                border-radius:0 0 15px 15px;
                opacity:.82;
                box-shadow:
                    inset 0 5px 8px rgba(255,255,255,.45),
                    inset 0 -8px 12px rgba(0,0,0,.12);
            }

            .fobas-object-body {
                position:absolute;
                inset:0;
                display:flex;
                align-items:center;
                justify-content:center;
                flex-direction:column;
                pointer-events:none;
            }

            .fobas-object-icon {
                font-size:42px;
                filter:drop-shadow(0 6px 5px rgba(0,0,0,.25));
            }

            .fobas-object-name {
                font-weight:700;
                font-size:12px;
                max-width:90%;
                text-align:center;
                text-shadow:0 1px 2px rgba(0,0,0,.18);
            }

            .fobas-object-formula {
                font-size:11px;
                opacity:.72;
            }

            .fobas-solid-body {
                border-radius:18px;
                background:
                    radial-gradient(
                        circle at 28% 20%,
                        rgba(255,255,255,.75),
                        rgba(255,255,255,.12) 32%,
                        rgba(0,0,0,.22) 100%
                    );
                box-shadow:
                    inset 3px 3px 8px rgba(255,255,255,.35),
                    inset -5px -8px 12px rgba(0,0,0,.2),
                    0 14px 24px rgba(0,0,0,.22);
            }

            .fobas-equipment-body {
                border-radius:16px;
                background:
                    linear-gradient(
                        145deg,
                        #f8fafc,
                        #cbd5e1 55%,
                        #64748b
                    );
                box-shadow:
                    inset 0 2px 4px rgba(255,255,255,.8),
                    0 14px 25px rgba(0,0,0,.24);
            }

            .fobas-object-label {
                position:absolute;
                left:50%;
                bottom:-27px;
                transform:translateX(-50%);
                white-space:nowrap;
                padding:4px 8px;
                border-radius:7px;
                font-size:11px;
                background:rgba(15,23,42,.9);
                color:white;
                pointer-events:none;
            }

            .fobas-heating {
                animation:fobasHeat 1s infinite alternate;
            }

            @keyframes fobasHeat {
                from {
                    filter:brightness(1);
                }
                to {
                    filter:brightness(1.3) saturate(1.25);
                }
            }

            .fobas-reaction-active {
                animation:fobasReaction 0.75s infinite alternate;
            }

            @keyframes fobasReaction {
                from {
                    transform:scale(1);
                }
                to {
                    transform:scale(1.035);
                }
            }

            .fobas-bubbles {
                position:absolute;
                inset:0;
                pointer-events:none;
                overflow:hidden;
            }

            .fobas-bubble {
                position:absolute;
                bottom:8%;
                width:7px;
                height:7px;
                border-radius:50%;
                background:rgba(255,255,255,.75);
                animation:fobasBubble 1.8s infinite ease-in;
            }

            @keyframes fobasBubble {
                from {
                    transform:translateY(0);
                    opacity:.9;
                }
                to {
                    transform:translateY(-90px);
                    opacity:0;
                }
            }

            .chem-modal.open,
            .chem-modal.is-open,
            .chem-modal.active {
                display:flex !important;
                opacity:1 !important;
                visibility:visible !important;
            }
        `;

        document.head.appendChild(style);
    }

    /* ============================================================
       06 — CRÉATION DES COMPOSANTS
    ============================================================ */

    function createComponents(material) {

        const components = [];

        if (
            material.kind === "reagent" &&
            material.phase === "liquid"
        ) {

            const volume =
                Number(material.defaultVolumeMl || 0);

            const concentration =
                Number(material.molarity || 0);

            components.push({
                id: material.id,
                name: material.name,
                formula: material.formula || "",

                moles:
                    concentration *
                    (volume / 1000),

                massG:
                    volume *
                    Number(material.density || 1),

                volumeMl: volume,

                concentrationM: concentration,

                density:
                    Number(material.density || 1),

                pH:
                    Number(material.pH ?? 7),

                phase: "liquid",

                color:
                    material.color || "#bfdbfe",

                strongAcid:
                    !!material.strongAcid,

                strongBase:
                    !!material.strongBase,

                acidEquivalent:
                    Number(material.acidEquivalent || 0),

                baseEquivalent:
                    Number(material.baseEquivalent || 0),

                indicator:
                    !!material.indicator,

                phenolphthalein:
                    !!material.phenolphthalein
            });
        }

        if (
            material.kind === "solid" ||
            (
                material.kind === "reagent" &&
                material.phase === "solid"
            )
        ) {

            const mass =
                Number(material.defaultMassG || 0);

            const molarMass =
                Number(material.molarMass || 1);

            components.push({
                id: material.id,
                name: material.name,
                formula: material.formula || "",

                moles:
                    molarMass > 0
                        ? mass / molarMass
                        : 0,

                massG: mass,

                volumeMl: 0,

                concentrationM: 0,

                density:
                    Number(material.density || 1),

                pH:
                    Number(material.pH ?? 7),

                phase: "solid",

                color:
                    material.color || "#d1d5db",

                metal:
                    !!material.metal
            });
        }

        return components;
    }

    function createObject(materialId, position = null) {

        const material =
            getMaterial(materialId);

        if (!material) {
            return null;
        }

        const pos =
            position ||
            nextPosition();

        const isContainer =
            material.kind === "container";

        const volume =
            isContainer
                ? 0
                : Number(material.defaultVolumeMl || 0);

        const mass =
            isContainer
                ? Number(material.emptyMassG || 0)
                : Number(material.defaultMassG || 0);

        const object = {

            id:
                uid(material.id),

            materialId:
                material.id,

            name:
                material.name,

            shortName:
                material.shortName ||
                material.name,

            formula:
                material.formula || "",

            kind:
                material.kind,

            category:
                material.category,

            icon:
                material.icon || "🧪",

            x:
                pos.x,

            y:
                pos.y,

            width:
                material.width || 110,

            height:
                material.height || 130,

            capacityMl:
                Number(material.capacityMl || 0),

            volumeMl:
                volume,

            massG:
                mass,

            emptyMassG:
                Number(material.emptyMassG || 0),

            density:
                Number(material.density || 0),

            temperatureC:
                Number(
                    material.temperatureC ??
                    DEFAULT_TEMPERATURE
                ),

            pH:
                Number(material.pH ?? 7),

            color:
                material.color ||
                "#dbeafe",

            phase:
                material.phase ||
                (
                    isContainer
                        ? "empty"
                        : "solid"
                ),

            state:
                material.state ||
                "stable",

            molarity:
                Number(material.molarity || 0),

            components:
                createComponents(material),

            reactionState: {

                active: false,

                gas: false,

                precipitate: false,

                bubbling: false,

                phase: "stable",

                color:
                    material.color ||
                    "#dbeafe",

                description: ""
            },

            heating: false,

            measurement: null
        };

        return object;
    }

    /* ============================================================
       07 — POSITIONNEMENT
    ============================================================ */

    function workspaceElement() {

        return (
            E.workspaceObjects ||
            E.chemistryCanvas ||
            E.workspaceDropZone
        );
    }

    function getWorkspaceSize() {

        const el =
            workspaceElement();

        return {
            width:
                el?.clientWidth ||
                1000,

            height:
                el?.clientHeight ||
                650
        };
    }

    function nextPosition() {

        const size =
            getWorkspaceSize();

        const index =
            state.objects.length;

        const column =
            index % 5;

        const row =
            Math.floor(index / 5);

        return {

            x:
                clamp(
                    60 + column * 165,
                    10,
                    Math.max(
                        10,
                        size.width - 150
                    )
                ),

            y:
                clamp(
                    50 + row * 150,
                    10,
                    Math.max(
                        10,
                        size.height - 190
                    )
                )
        };
    }

    /* ============================================================
       08 — BIBLIOTHÈQUE
    ============================================================ */

    function currentCategory() {

        const active =
            document.querySelector(
                ".category-button.is-active," +
                ".category-button.active," +
                ".category-button[aria-selected='true']"
            );

        return (
            active?.dataset.category ||
            state.category ||
            "all"
        );
    }

    function materialMatchesCategory(
        material,
        category
    ) {

        if (
            !category ||
            category === "all"
        ) {
            return true;
        }

        if (category === "liquids") {
            return material.phase === "liquid";
        }

        if (category === "solids") {
            return (
                material.phase === "solid" ||
                material.category === "solid"
            );
        }

        return material.category === category;
    }

    function materialMatchesSearch(
        material,
        search
    ) {

        if (!search) {
            return true;
        }

        const text = [
            material.name,
            material.shortName,
            material.formula,
            material.id,
            material.category,
            material.state,
            material.phase
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return text.includes(
            search.toLowerCase()
        );
    }

    function materialVisual(material) {

        const color =
            material.color ||
            "#dbeafe";

        return `
            <div
                class="chem-material-icon"
                style="
                    background:
                    radial-gradient(
                        circle at 30% 20%,
                        rgba(255,255,255,.95),
                        ${color} 45%,
                        rgba(0,0,0,.18)
                    );
                "
            >
                ${material.icon || "🧪"}
            </div>
        `;
    }

    function createMaterialCard(material) {

        const card =
            document.createElement("button");

        card.type = "button";

        card.className =
            "material-card chem-material-card";

        card.dataset.materialId =
            material.id;

        card.draggable = true;

        card.innerHTML = `
            ${materialVisual(material)}

            <div
                class="chem-material-info"
            >
                <strong>
                    ${escapeHTML(material.name)}
                </strong>

                <span>
                    ${escapeHTML(material.formula || material.shortName || "")}
                </span>

                <small>
                    ${escapeHTML(material.state || material.category || "")}
                </small>
            </div>

            <span
                class="chem-material-add"
                aria-hidden="true"
            >
                +
            </span>
        `;

        card.addEventListener(
            "click",
            event => {

                event.preventDefault();

                addMaterialToWorkspace(
                    material.id
                );
            }
        );

        card.addEventListener(
            "dragstart",
            event => {

                event.dataTransfer.effectAllowed =
                    "copy";

                event.dataTransfer.setData(
                    "text/plain",
                    material.id
                );
            }
        );

        return card;
    }

    function renderLibrary() {

        if (!E.materialsLibrary) {
            return;
        }

        const search =
            String(
                E.materialSearch?.value ||
                state.search ||
                ""
            ).trim();

        const category =
            currentCategory();

        const filtered =
            MATERIALS.filter(
                material =>
                    materialMatchesCategory(
                        material,
                        category
                    ) &&
                    materialMatchesSearch(
                        material,
                        search
                    )
            );

        E.materialsLibrary.innerHTML = "";

        const fragment =
            document.createDocumentFragment();

        filtered.forEach(
            material => {
                fragment.appendChild(
                    createMaterialCard(
                        material
                    )
                );
            }
        );

        E.materialsLibrary.appendChild(
            fragment
        );

        if (E.materialCount) {
            E.materialCount.textContent =
                String(filtered.length);
        }
    }

    /* ============================================================
       09 — INVENTAIRE
    ============================================================ */

    function renderInventory() {

        if (!E.inventoryList) {
            return;
        }

        E.inventoryList.innerHTML = "";

        if (!state.objects.length) {

            E.inventoryList.innerHTML = `
                <div class="empty-state">
                    Laboratoire vide
                </div>
            `;

            if (E.inventoryCount) {
                E.inventoryCount.textContent = "0";
            }

            return;
        }

        state.objects.forEach(
            object => {

                const item =
                    document.createElement("button");

                item.type = "button";

                item.className =
                    "inventory-item";

                if (
                    object.id ===
                    state.selectedId
                ) {
                    item.classList.add(
                        "active",
                        "selected"
                    );
                }

                item.innerHTML = `
                    <span class="inventory-icon">
                        ${object.icon}
                    </span>

                    <span class="inventory-info">
                        <strong>
                            ${escapeHTML(object.name)}
                        </strong>

                        <small>
                            ${escapeHTML(object.formula || object.state || "")}
                        </small>
                    </span>
                `;

                item.addEventListener(
                    "click",
                    () => {

                        selectObject(
                            object.id
                        );
                    }
                );

                E.inventoryList.appendChild(
                    item
                );
            }
        );

        if (E.inventoryCount) {
            E.inventoryCount.textContent =
                String(state.objects.length);
        }
    }

    /* ============================================================
       10 — AJOUT MATÉRIAU
    ============================================================ */

    function addMaterialToWorkspace(
        materialId,
        position = null
    ) {

        const material =
            getMaterial(materialId);

        if (!material) {
            return;
        }

        const object =
            createObject(
                materialId,
                position
            );

        if (!object) {
            return;
        }

        state.objects.push(
            object
        );

        state.selectedId =
            object.id;

        logObservation(
            `${material.name} ajouté au laboratoire.`
        );

        toast(
            `${material.name} ajouté.`,
            "success"
        );

        renderAll();
    }

    /* ============================================================
       11 — SÉLECTION
    ============================================================ */

    function selectObject(id) {

        const object =
            getObject(id);

        if (!object) {
            return;
        }

        state.selectedId =
            object.id;

        state.tool =
            "select";

        renderAll();
    }









/* ============================================================
   12 — RENDU DES OBJETS
   ------------------------------------------------------------
   AJOUT ISOLÉ :
   - Statut dynamique propre à chaque récipient.
   - Affichage automatique du résultat d'une réaction.
   - Lecture de reactionState sans modifier le moteur chimique.
   - Les autres objets ne reçoivent aucun panneau de statut.
   
   IMPORTANT :
   - Le code existant de rendu est conservé.
   - bindObjectInteractions() est conservé.
   - renderWorkspace() est conservé.
   - Aucun calcul chimique n'est modifié.
============================================================ */


/* ============================================================
   12.1 — CALCUL DES MOLES
============================================================ */

function totalComponentMoles(object) {

    if (
        !object ||
        !Array.isArray(object.components)
    ) {
        return 0;
    }

    return object.components.reduce(
        (sum, component) =>
            sum +
            Number(
                component.moles || 0
            ),
        0
    );
}


/* ============================================================
   12.2 — CALCUL DE LA MASSE DES COMPOSANTS
============================================================ */

function totalComponentMass(object) {

    if (
        !object ||
        !Array.isArray(object.components)
    ) {
        return 0;
    }

    return object.components.reduce(
        (sum, component) =>
            sum +
            Number(
                component.massG || 0
            ),
        0
    );
}


/* ============================================================
   12.3 — CALCUL DE LA MASSE TOTALE
============================================================ */

function calculateMass(object) {

    if (!object) {
        return 0;
    }

    if (
        object.kind ===
        "container"
    ) {
        return (
            Number(
                object.emptyMassG || 0
            ) +
            totalComponentMass(
                object
            )
        );
    }

    if (
        object.massG != null
    ) {
        return Number(
            object.massG || 0
        );
    }

    return totalComponentMass(
        object
    );
}


/* ============================================================
   12.4 — CALCUL DE LA DENSITÉ
============================================================ */

function calculateDensity(object) {

    if (!object) {
        return 0;
    }

    const volume =
        Number(
            object.volumeMl || 0
        );

    if (volume <= 0) {
        return Number(
            object.density || 0
        );
    }

    const mass =
        totalComponentMass(
            object
        );

    if (mass <= 0) {
        return Number(
            object.density || 1
        );
    }

    return mass / volume;
}


/* ============================================================
   12.5 — PRÉSENCE DE LIQUIDE
============================================================ */

function objectHasLiquid(object) {

    return (
        Number(
            object?.volumeMl || 0
        ) > 0
    );
}


/* ============================================================
   12.6 — STATUT DYNAMIQUE DU BÉCHER
   ------------------------------------------------------------
   IMPORTANT :
   Cette fonction NE MODIFIE PAS l'objet.

   Elle lit uniquement les données déjà présentes dans :
   - reactionState
   - actionStatus
   - state
   - pH
   - temperatureC
   - volumeMl
============================================================ */

function getBeakerDynamicStatus(object) {

    if (!object) {

        return {
            active: false,
            type: "ready",
            title: "BÉCHER PRÊT",
            message: "Aucune action effectuée.",
            details: []
        };
    }


    /* ========================================================
       1 — RÉACTION
       --------------------------------------------------------
       PRIORITÉ MAXIMALE.
       
       Si Block 20 a terminé une réaction, le résultat
       doit rester visible dans le bécher.
    ======================================================== */

    const reaction =
        object.reactionState;


    if (
        reaction &&
        reaction.active === true
    ) {

        const details = [];


        /* ----------------------------------------------------
           DESCRIPTION / ÉQUATION
        ---------------------------------------------------- */

        const description =
            String(
                reaction.description || ""
            ).trim();


        if (description) {

            details.push(
                description
            );
        }


        /* ----------------------------------------------------
           ÉTAT
        ---------------------------------------------------- */

        const objectState =
            String(
                object.state || ""
            ).trim();


        if (objectState) {

            details.push(
                "État : " +
                objectState
            );
        }


        /* ----------------------------------------------------
           pH
        ---------------------------------------------------- */

        if (
            objectHasLiquid(
                object
            )
        ) {

            details.push(
                "pH : " +
                Number(
                    object.pH ?? 7
                ).toFixed(2)
            );
        }


        /* ----------------------------------------------------
           TEMPÉRATURE
        ---------------------------------------------------- */

        details.push(
            "Température : " +
            Number(
                object.temperatureC ??
                DEFAULT_TEMPERATURE
            ).toFixed(1) +
            " °C"
        );


        /* ----------------------------------------------------
           GAZ
        ---------------------------------------------------- */

        details.push(
            "Gaz : " +
            (
                reaction.gas
                    ? "Oui"
                    : "Non"
            )
        );


        /* ----------------------------------------------------
           BULLAGE
        ---------------------------------------------------- */

        details.push(
            "Bulles : " +
            (
                reaction.bubbling
                    ? "Oui"
                    : "Non"
            )
        );


        /* ----------------------------------------------------
           PRÉCIPITÉ
        ---------------------------------------------------- */

        details.push(
            "Précipité : " +
            (
                reaction.precipitate
                    ? "Oui"
                    : "Non"
            )
        );


        /* ----------------------------------------------------
           PHASE
        ---------------------------------------------------- */

        if (
            reaction.phase
        ) {

            details.push(
                "Phase : " +
                String(
                    reaction.phase
                )
            );
        }


        return {

            active: true,

            type:
                "reaction",

            title:
                "RÉACTION EFFECTUÉE",

            message:
                description ||
                "Réaction chimique effectuée.",

            details:
                details
        };
    }


    /* ========================================================
       2 — ACTION STATUS
       --------------------------------------------------------
       Si un autre bloc du moteur écrit :
       object.actionStatus
       
       le bécher l'affiche automatiquement.
    ======================================================== */

    const actionStatus =
        object.actionStatus;


    if (
        actionStatus &&
        (
            actionStatus.title ||
            actionStatus.message ||
            (
                Array.isArray(
                    actionStatus.details
                ) &&
                actionStatus.details.length > 0
            )
        )
    ) {

        const details =
            Array.isArray(
                actionStatus.details
            )
                ? actionStatus.details
                    .map(
                        detail =>
                            String(
                                detail ?? ""
                            ).trim()
                    )
                    .filter(
                        Boolean
                    )
                : [];


        return {

            active: true,

            type:
                String(
                    actionStatus.type ||
                    "action"
                ),

            title:
                String(
                    actionStatus.title ||
                    "ACTION EFFECTUÉE"
                ),

            message:
                String(
                    actionStatus.message ||
                    ""
                ),

            details:
                details
        };
    }


    /* ========================================================
       3 — ÉTAT DU RÉCIPIENT
       --------------------------------------------------------
       Permet d'afficher un état existant même si
       actionStatus n'est pas encore défini.
    ======================================================== */

    const currentState =
        String(
            object.state || ""
        ).trim();


    if (
        currentState &&
        currentState !== "stable" &&
        currentState !== "empty"
    ) {

        return {

            active: true,

            type:
                "state",

            title:
                "ÉTAT DU BÉCHER",

            message:
                currentState,

            details: [

                "Volume : " +
                Number(
                    object.volumeMl || 0
                ).toFixed(1) +
                " mL",

                "Température : " +
                Number(
                    object.temperatureC ??
                    DEFAULT_TEMPERATURE
                ).toFixed(1) +
                " °C",

                "pH : " +
                Number(
                    object.pH ?? 7
                ).toFixed(2)
            ]
        };
    }


    /* ========================================================
       4 — ÉTAT INITIAL
    ======================================================== */

    return {

        active: false,

        type:
            "ready",

        title:
            "BÉCHER PRÊT",

        message:
            "Aucune action effectuée.",

        details: []
    };
}


/* ============================================================
   12.7 — HTML DU STATUT DU BÉCHER
   ------------------------------------------------------------
   Bloc visuel isolé.
   Aucun élément existant n'est supprimé.
============================================================ */

function renderBeakerDynamicStatus(object) {

    const status =
        getBeakerDynamicStatus(
            object
        );


    const type =
        String(
            status.type ||
            "ready"
        );


    const title =
        String(
            status.title ||
            "BÉCHER PRÊT"
        );


    const message =
        String(
            status.message ||
            ""
        );


    const details =
        Array.isArray(
            status.details
        )
            ? status.details
                .map(
                    detail =>
                        String(
                            detail ?? ""
                        ).trim()
                )
                .filter(
                    Boolean
                )
                .filter(
                    (detail, index, array) =>
                        array.indexOf(
                            detail
                        ) === index
                )
            : [];


    return `
        <div
            class="fobas-beaker-dynamic-status fobas-beaker-status-${escapeHTML(type)}"
            data-beaker-status="true"
            data-status-type="${escapeHTML(type)}"
        >

            <div
                class="fobas-beaker-dynamic-status-title"
            >
                ${escapeHTML(title)}
            </div>


            ${
                message
                    ? `
                        <div
                            class="fobas-beaker-dynamic-status-message"
                        >
                            ${escapeHTML(message)}
                        </div>
                    `
                    : ""
            }


            ${
                details.length > 0
                    ? `
                        <div
                            class="fobas-beaker-dynamic-status-details"
                        >

                            ${
                                details
                                    .map(
                                        detail => `
                                            <div
                                                class="fobas-beaker-dynamic-status-line"
                                            >
                                                ${escapeHTML(detail)}
                                            </div>
                                        `
                                    )
                                    .join("")
                            }

                        </div>
                    `
                    : ""
            }

        </div>
    `;
}


/* ============================================================
   12.8 — RENDU VISUEL PRINCIPAL
============================================================ */

function objectVisual(object) {

    const isContainer =
        object.kind ===
        "container";

    const isSolid =
        object.phase ===
        "solid";

    const isEquipment =
        object.category ===
        "equipment";

    const isInstrument =
        object.category ===
        "instrument";

    const selected =
        object.id ===
        state.selectedId;

    const reaction =
        object.reactionState?.active;

    const heating =
        object.heating;


    /* ========================================================
       CORPS DE L'OBJET
       --------------------------------------------------------
       CONSERVÉ
    ======================================================== */

    let bodyClass =
        "fobas-object-body";


    if (isSolid) {

        bodyClass +=
            " fobas-solid-body";
    }


    if (
        isEquipment ||
        isInstrument
    ) {

        bodyClass +=
            " fobas-equipment-body";
    }


    /* ========================================================
       LIQUIDE
       --------------------------------------------------------
       CONSERVÉ
    ======================================================== */

    let liquid = "";


    if (
        isContainer &&
        objectHasLiquid(
            object
        )
    ) {

        const liquidHeight =
            clamp(
                (
                    object.volumeMl /
                    Math.max(
                        object.capacityMl,
                        1
                    )
                ) * 70,
                8,
                72
            );


        liquid = `
            <div
                class="fobas-object-liquid"
                style="
                    height:${liquidHeight}%;
                    background:${object.color};
                "
            ></div>
        `;
    }


    /* ========================================================
       BULLES
       --------------------------------------------------------
       CONSERVÉ
    ======================================================== */

    let bubbles = "";


    if (
        reaction &&
        object.reactionState?.gas
    ) {

        bubbles = `
            <div class="fobas-bubbles">

                <i
                    class="fobas-bubble"
                    style="
                        left:20%;
                        animation-delay:.1s
                    "
                ></i>

                <i
                    class="fobas-bubble"
                    style="
                        left:40%;
                        animation-delay:.5s
                    "
                ></i>

                <i
                    class="fobas-bubble"
                    style="
                        left:60%;
                        animation-delay:.8s
                    "
                ></i>

                <i
                    class="fobas-bubble"
                    style="
                        left:75%;
                        animation-delay:.25s
                    "
                ></i>

            </div>
        `;
    }


    /* ========================================================
       CLASSES PRINCIPALES
       --------------------------------------------------------
       CONSERVÉ
    ======================================================== */

    const classes = [
        "fobas-chem-object"
    ];


    if (selected) {

        classes.push(
            "selected"
        );
    }


    if (reaction) {

        classes.push(
            "fobas-reaction-active"
        );
    }


    if (heating) {

        classes.push(
            "fobas-heating"
        );
    }


    /* ========================================================
       DIMENSIONS
       --------------------------------------------------------
       CONSERVÉ
    ======================================================== */

    const width =
        Number(
            object.width || 110
        );


    const height =
        Number(
            object.height || 130
        );


    /* ========================================================
       ARRIÈRE-PLAN
       --------------------------------------------------------
       CONSERVÉ
    ======================================================== */

    const background =
        isSolid
            ? object.color
            : isContainer
                ? "rgba(219,234,254,.24)"
                : object.color;


    /* ========================================================
       STATUT DYNAMIQUE
       --------------------------------------------------------
       UNIQUEMENT POUR LES RÉCIPIENTS.
    ======================================================== */

    const beakerStatus =
        isContainer
            ? renderBeakerDynamicStatus(
                object
            )
            : "";


    /* ========================================================
       HTML FINAL
    ======================================================== */

    return `
        <div
            class="${classes.join(" ")}"
            data-object-id="${object.id}"
            style="
                left:${object.x}px;
                top:${object.y}px;
                width:${width}px;
                height:${height}px;
            "
        >

            ${
                isContainer
                    ? `<div
                        class="fobas-object-glass"
                        style="
                            position:absolute;
                            inset:0;
                        "
                    ></div>`
                    : ""
            }


            ${liquid}


            <div
                class="${bodyClass}"
                style="
                    ${
                        !isContainer &&
                        !isSolid &&
                        !isEquipment &&
                        !isInstrument
                            ? `background:${background};`
                            : ""
                    }
                "
            >

                <div
                    class="fobas-object-icon"
                >
                    ${object.icon}
                </div>


                <div
                    class="fobas-object-name"
                >
                    ${escapeHTML(
                        object.shortName ||
                        object.name
                    )}
                </div>


                ${
                    object.formula
                        ? `<div
                            class="fobas-object-formula"
                        >
                            ${escapeHTML(
                                object.formula
                            )}
                           </div>`
                        : ""
                }

            </div>


            ${bubbles}


            ${
                isContainer
                    ? beakerStatus
                    : ""
            }


            <div
                class="fobas-object-label"
            >
                ${escapeHTML(
                    object.name
                )}
            </div>

        </div>
    `;
}


/* ============================================================
   12.9 — INTERACTIONS DES OBJETS
   ------------------------------------------------------------
   CONSERVÉ SANS MODIFICATION DE LOGIQUE.
============================================================ */

function bindObjectInteractions() {

    $$(".fobas-chem-object").forEach(
        element => {

            const id =
                element.dataset.objectId;


            element.addEventListener(
                "pointerdown",
                event => {

                    const object =
                        getObject(id);


                    if (!object) {
                        return;
                    }


                    selectObject(id);


                    if (
                        state.tool !==
                        "move"
                    ) {
                        return;
                    }


                    event.preventDefault();


                    const startX =
                        event.clientX;

                    const startY =
                        event.clientY;


                    const originalX =
                        object.x;

                    const originalY =
                        object.y;


                    function move(
                        moveEvent
                    ) {

                        object.x =
                            originalX +
                            (
                                moveEvent.clientX -
                                startX
                            ) /
                            state.zoom;


                        object.y =
                            originalY +
                            (
                                moveEvent.clientY -
                                startY
                            ) /
                            state.zoom;


                        object.x =
                            Math.max(
                                0,
                                object.x
                            );


                        object.y =
                            Math.max(
                                0,
                                object.y
                            );


                        renderWorkspace();
                    }


                    function end() {

                        document.removeEventListener(
                            "pointermove",
                            move
                        );


                        document.removeEventListener(
                            "pointerup",
                            end
                        );


                        saveSession(
                            false
                        );
                    }


                    document.addEventListener(
                        "pointermove",
                        move
                    );


                    document.addEventListener(
                        "pointerup",
                        end,
                        {
                            once: true
                        }
                    );
                }
            );
        }
    );
}


/* ============================================================
   12.10 — RENDU DU WORKSPACE
   ------------------------------------------------------------
   CONSERVÉ
============================================================ */

function renderWorkspace() {

    if (!E.workspaceObjects) {
        return;
    }


    E.workspaceObjects.innerHTML =
        "";


    state.objects.forEach(
        object => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.innerHTML =
                objectVisual(
                    object
                );


            const element =
                wrapper.firstElementChild;


            if (element) {

                E.workspaceObjects.appendChild(
                    element
                );
            }
        }
    );


    bindObjectInteractions();


    applyZoom();
}

























    /* ============================================================
       13 — INSPECTEUR
    ============================================================ */

    function renderInspector() {

        const object =
            getSelected();

        if (!object) {

            if (E.selectedObjectType) {
                E.selectedObjectType.textContent =
                    "Aucun objet sélectionné";
            }

            if (E.objectInspector) {
                E.objectInspector.style.display =
                    "none";
            }

            if (E.objectActions) {
                E.objectActions.style.display =
                    "none";
            }

            return;
        }

        if (E.objectInspector) {
            E.objectInspector.style.display =
                "";
        }

        if (E.objectActions) {
            E.objectActions.style.display =
                "";
        }

        if (E.selectedObjectType) {
            E.selectedObjectType.textContent =
                object.name;
        }

        if (E.propName) {
            E.propName.textContent =
                object.name;
        }

        if (E.propState) {
            E.propState.textContent =
                object.state || "stable";
        }

        if (E.propTemperature) {
            E.propTemperature.textContent =
                `${round(
                    object.temperatureC,
                    1
                )} °C`;
        }

        if (E.propMass) {
            E.propMass.textContent =
                `${round(
                    calculateMass(object),
                    3
                )} g`;
        }

        if (E.propVolume) {
            E.propVolume.textContent =
                `${round(
                    object.volumeMl,
                    2
                )} mL`;
        }

        if (E.propDensity) {
            E.propDensity.textContent =
                `${round(
                    calculateDensity(object),
                    3
                )} g/mL`;
        }

        if (E.propPH) {
            E.propPH.textContent =
                objectHasLiquid(object)
                    ? round(
                        object.pH,
                        2
                    )
                    : "—";
        }

        if (E.propColor) {
            E.propColor.textContent =
                object.color ||
                "—";
        }

        renderComposition(
            object
        );

        renderReactionInfo(
            object
        );
    }

    function renderComposition(object) {

        if (!E.compositionList) {
            return;
        }

        E.compositionList.innerHTML = "";

        const components =
            Array.isArray(
                object.components
            )
                ? object.components
                : [];

        if (!components.length) {

            E.compositionList.innerHTML =
                `
                <div class="empty-state">
                    Aucun composant
                </div>
                `;

            if (E.compositionTotal) {
                E.compositionTotal.textContent =
                    "0";
            }

            return;
        }

        components.forEach(
            component => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "composition-item";

                item.innerHTML = `
                    <strong>
                        ${escapeHTML(
                            component.name
                        )}
                    </strong>

                    <span>
                        ${round(
                            component.moles || 0,
                            5
                        )} mol
                    </span>

                    <small>
                        ${round(
                            component.massG || 0,
                            3
                        )} g
                        ${
                            component.volumeMl
                                ? ` · ${round(
                                    component.volumeMl,
                                    2
                                  )} mL`
                                : ""
                        }
                    </small>
                `;

                E.compositionList.appendChild(
                    item
                );
            }
        );

        if (E.compositionTotal) {
            E.compositionTotal.textContent =
                String(
                    components.length
                );
        }
    }

    function renderReactionInfo(object) {

        const reaction =
            object.reactionState;

        if (!reaction) {
            return;
        }

        if (E.reactionStatus) {
            E.reactionStatus.textContent =
                reaction.active
                    ? (
                        reaction.description ||
                        "Réaction active"
                    )
                    : "Aucune réaction";
        }

        if (E.reactionPhase) {
            E.reactionPhase.textContent =
                reaction.phase ||
                "stable";
        }

        if (E.reactionGas) {
            E.reactionGas.textContent =
                reaction.gas
                    ? "Oui"
                    : "Non";
        }

        if (E.reactionPrecipitate) {
            E.reactionPrecipitate.textContent =
                reaction.precipitate
                    ? "Oui"
                    : "Non";
        }

        if (E.reactionColor) {
            E.reactionColor.textContent =
                reaction.color ||
                object.color ||
                "—";
        }
    }

    /* ============================================================
       14 — STATUS BAR
    ============================================================ */

    function renderStatus() {

        if (E.statusObjects) {
            E.statusObjects.textContent =
                String(
                    state.objects.length
                );
        }

        const liquids =
            state.objects.filter(
                object =>
                    Number(
                        object.volumeMl || 0
                    ) > 0
            );

        const volume =
            liquids.reduce(
                (sum, object) =>
                    sum +
                    Number(
                        object.volumeMl || 0
                    ),
                0
            );

        if (E.statusVolume) {
            E.statusVolume.textContent =
                `${round(
                    volume,
                    1
                )} mL`;
        }

        const selected =
            getSelected();

        const temperature =
            selected
                ? selected.temperatureC
                : DEFAULT_TEMPERATURE;

        if (E.statusTemperature) {
            E.statusTemperature.textContent =
                `${round(
                    temperature,
                    1
                )} °C`;
        }

        const ph =
            selected &&
            objectHasLiquid(selected)
                ? selected.pH
                : 7;

        if (E.statusPH) {
            E.statusPH.textContent =
                round(ph, 2);
        }

        const mass =
            state.objects.reduce(
                (sum, object) =>
                    sum +
                    calculateMass(object),
                0
            );

        if (E.statusMass) {
            E.statusMass.textContent =
                `${round(
                    mass,
                    2
                )} g`;
        }
    }

    /* ============================================================
       15 — OUTILS
    ============================================================ */

    function setTool(tool) {

        state.tool =
            tool || "select";

        $$(".tool-button").forEach(
            button => {

                const active =
                    button.dataset.tool ===
                    state.tool;

                button.classList.toggle(
                    "active",
                    active
                );

                button.classList.toggle(
                    "is-active",
                    active
                );

                button.setAttribute(
                    "aria-pressed",
                    active
                        ? "true"
                        : "false"
                );
            }
        );

        if (state.tool === "transfer") {
            openTransferModal();
        }

        if (state.tool === "mix") {
            mixSelected();
        }

        if (state.tool === "react") {
            reactSelected();
        }

        if (state.tool === "measure") {
            openMeasurementModal();
        }

        if (state.tool === "heat") {
            toggleHeating();
        }
    }

    /* ============================================================
       16 — TRANSFERT
    ============================================================ */

    function openTransferModal() {

        const source =
            getSelected();

        if (!source) {

            toast(
                "Sélectionnez d'abord un récipient ou une substance.",
                "warning"
            );

            state.tool =
                "select";

            return;
        }

        state.transferSourceId =
            source.id;

        if (E.transferSourceName) {
            E.transferSourceName.textContent =
                source.name;
        }

        if (E.transferSourceAmount) {
            E.transferSourceAmount.textContent =
                `${round(
                    source.volumeMl || 0,
                    2
                )} mL`;
        }

        const targets =
            state.objects.filter(
                object =>
                    object.id !==
                    source.id &&
                    object.kind ===
                    "container"
            );

        if (E.transferTarget) {

            E.transferTarget.innerHTML = `
                <option value="">
                    Choisir un récipient
                </option>
            `;

            targets.forEach(
                target => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        target.id;

                    option.textContent =
                        `${target.name} — ${round(
                            target.volumeMl || 0,
                            1
                        )}/${target.capacityMl} mL`;

                    E.transferTarget.appendChild(
                        option
                    );
                }
            );
        }

        updateTransferMaximum();

        openModal(
            E.transferModal
        );
    }

    function updateTransferMaximum() {

        const source =
            getObject(
                state.transferSourceId
            );

        if (!source) {
            return;
        }

        const max =
            Number(
                source.volumeMl || 0
            );

        if (E.transferRange) {
            E.transferRange.max =
                String(max);

            if (
                Number(
                    E.transferRange.value
                ) > max
            ) {
                E.transferRange.value =
                    String(max);
            }
        }

        if (E.transferAmount) {
            E.transferAmount.max =
                String(max);
        }

        if (E.transferMaxLabel) {
            E.transferMaxLabel.textContent =
                `${round(max, 2)} mL maximum`;
        }
    }

    function executeTransfer() {

        const source =
            getObject(
                state.transferSourceId
            );

        const target =
            getObject(
                E.transferTarget?.value
            );

        if (!source || !target) {

            toast(
                "Choisissez un récipient cible.",
                "warning"
            );

            return;
        }

        let amount =
            Number(
                E.transferAmount?.value ||
                E.transferRange?.value ||
                0
            );

        amount =
            clamp(
                amount,
                0,
                Number(
                    source.volumeMl || 0
                )
            );

        if (amount <= 0) {

            toast(
                "La quantité à transférer doit être supérieure à zéro.",
                "warning"
            );

            return;
        }

        if (
            target.capacityMl > 0 &&
            (
                target.volumeMl +
                amount
            ) >
            target.capacityMl
        ) {

            toast(
                "Le récipient cible n'a pas assez de capacité.",
                "error"
            );

            return;
        }

        const sourceVolume =
            Number(
                source.volumeMl || 0
            );

        const ratio =
            sourceVolume > 0
                ? amount / sourceVolume
                : 0;

        const transferred =
            source.components.map(
                component => ({
                    ...component,
                    moles:
                        Number(
                            component.moles || 0
                        ) * ratio,
                    massG:
                        Number(
                            component.massG || 0
                        ) * ratio,
                    volumeMl:
                        Number(
                            component.volumeMl || 0
                        ) * ratio
                })
            );

        source.components =
            source.components.map(
                component => ({
                    ...component,
                    moles:
                        Number(
                            component.moles || 0
                        ) *
                        (1 - ratio),

                    massG:
                        Number(
                            component.massG || 0
                        ) *
                        (1 - ratio),

                    volumeMl:
                        Number(
                            component.volumeMl || 0
                        ) *
                        (1 - ratio)
                })
            );

        source.volumeMl =
            Math.max(
                0,
                sourceVolume -
                amount
            );

        transferred.forEach(
            component => {

                const existing =
                    target.components.find(
                        item =>
                            item.id ===
                            component.id
                    );

                if (existing) {

                    existing.moles +=
                        component.moles;

                    existing.massG +=
                        component.massG;

                    existing.volumeMl +=
                        component.volumeMl;

                } else {

                    target.components.push(
                        component
                    );
                }
            }
        );

        target.volumeMl +=
            amount;

        target.massG =
            calculateMass(
                target
            );

        recalculateObject(
            source
        );

        recalculateObject(
            target
        );

        state.selectedId =
            target.id;

        closeModal(
            E.transferModal
        );

        logObservation(
            `${round(
                amount,
                2
            )} mL transférés de ${source.name} vers ${target.name}.`
        );

        toast(
            "Transfert effectué.",
            "success"
        );

        renderAll();
    }

    /* ============================================================
       17 — MÉLANGE
    ============================================================ */

    function mixSelected() {

        const object =
            getSelected();

        if (!object) {

            toast(
                "Sélectionnez un récipient à mélanger.",
                "warning"
            );

            return;
        }

        if (
            !object.components?.length
        ) {

            toast(
                "Le récipient ne contient aucun composant.",
                "warning"
            );

            return;
        }

        object.state =
            "mélangé";

        object.reactionState.phase =
            "mixed";

        object.reactionState.description =
            "Mélange homogénéisé.";

        recalculateObject(
            object
        );

        logObservation(
            `Mélange effectué dans ${object.name}.`
        );

        toast(
            "Mélange effectué.",
            "success"
        );

        renderAll();
    }

    /* ============================================================
       18 — CALCUL pH
    ============================================================ */

    function calculatePH(object) {

        if (
            !object ||
            !object.components?.length
        ) {
            return 7;
        }

        let acid =
            0;

        let base =
            0;

        object.components.forEach(
            component => {

                if (
                    component.strongAcid
                ) {

                    acid +=
                        Number(
                            component.moles || 0
                        ) *
                        Number(
                            component.acidEquivalent || 1
                        );
                }

                if (
                    component.strongBase
                ) {

                    base +=
                        Number(
                            component.moles || 0
                        ) *
                        Number(
                            component.baseEquivalent || 1
                        );
                }
            }
        );

        const volumeL =
            Math.max(
                Number(
                    object.volumeMl || 0
                ) / 1000,
                0.000001
            );

        const excessAcid =
            acid - base;

        if (
            Math.abs(excessAcid) <
            0.000000001
        ) {
            return 7;
        }

        if (excessAcid > 0) {

            const concentration =
                excessAcid /
                volumeL;

            return clamp(
                -Math.log10(
                    Math.max(
                        concentration,
                        0.0000000001
                    )
                ),
                0,
                14
            );
        }

        const concentration =
            Math.abs(
                excessAcid
            ) /
            volumeL;

        return clamp(
            14 +
            Math.log10(
                Math.max(
                    concentration,
                    0.0000000001
                )
            ),
            0,
            14
        );
    }

    /* ============================================================
       19 — RECALCUL DU RÉCIPIENT
    ============================================================ */

    function recalculateObject(
        object
    ) {

        if (!object) {
            return;
        }

        object.massG =
            calculateMass(
                object
            );

        object.density =
            calculateDensity(
                object
            );

        if (
            object.components?.length
        ) {

            const hasLiquid =
                object.components.some(
                    component =>
                        component.phase ===
                        "liquid"
                );

            if (hasLiquid) {
                object.pH =
                    calculatePH(
                        object
                    );
            }
        }

        const temperatures =
            object.components
                ?.map(
                    component =>
                        Number(
                            component.temperatureC ||
                            object.temperatureC ||
                            25
                        )
                ) || [];

        if (
            temperatures.length
        ) {

            object.temperatureC =
                temperatures.reduce(
                    (sum, value) =>
                        sum + value,
                    0
                ) /
                temperatures.length;
        }

        if (
            object.components?.length
        ) {

            const colors =
                object.components
                    .map(
                        component =>
                            component.color
                    )
                    .filter(Boolean);

            if (colors.length === 1) {
                object.color =
                    colors[0];
            }
        }
    }






/* ============================================================
   20 — MOTEUR DE RÉACTIONS CHIMIQUES FOBAS
   ------------------------------------------------------------
   VERSION ROBUSTE
   ------------------------------------------------------------
   IMPORTANT :
   - Ce bloc ne modifie pas les autres blocs du moteur.
   - Les noms visibles peuvent être scientifiques :
       Acide chlorhydrique
       Hydroxyde de sodium
       Sulfate de cuivre(II)
       Zinc
       etc.
   - Le moteur identifie les substances par :
       1. ID interne
       2. formule chimique
       3. nom normalisé
   - Une seule réaction principale est exécutée par pression.
   - Les quantités sont calculées en moles.
   ============================================================ */


/* ============================================================
   20.1 — NORMALISATION
============================================================ */

function normalizeChemicalText(value) {

    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}


/* ============================================================
   20.2 — IDENTIFICATION CHIMIQUE ROBUSTE
============================================================ */

function chemicalIdentityMatches(
    component,
    identities
) {

    if (!component) {
        return false;
    }

    const componentId =
        normalizeChemicalText(
            component.id
        );

    const componentFormula =
        normalizeChemicalText(
            component.formula
        );

    const componentName =
        normalizeChemicalText(
            component.name
        );

    return identities.some(
        identity => {

            const id =
                normalizeChemicalText(
                    identity.id
                );

            const formula =
                normalizeChemicalText(
                    identity.formula
                );

            const names =
                (identity.names || [])
                    .map(
                        name =>
                            normalizeChemicalText(
                                name
                            )
                    );

            if (
                id &&
                componentId === id
            ) {
                return true;
            }

            if (
                formula &&
                componentFormula === formula
            ) {
                return true;
            }

            if (
                componentName &&
                names.includes(
                    componentName
                )
            ) {
                return true;
            }

            return false;
        }
    );
}


/* ============================================================
   20.3 — IDENTITÉS CHIMIQUES INTERNES
============================================================ */

const CHEMICAL_IDENTITIES = {

    hydrochloricAcid: {

        ids: [
            "hydrochloricAcid",
            "hcl",
            "acideChlorhydrique",
            "acide_chlorhydrique"
        ],

        formula:
            "HCl",

        names: [
            "Acide chlorhydrique",
            "Acide chlorhydrique (HCl)",
            "Hydrochloric acid",
            "Hydrogen chloride"
        ]
    },


    sodiumHydroxide: {

        ids: [
            "sodiumHydroxide",
            "naoh",
            "hydroxydeDeSodium",
            "hydroxyde_de_sodium"
        ],

        formula:
            "NaOH",

        names: [
            "Hydroxyde de sodium",
            "Hydroxyde de sodium (NaOH)",
            "Sodium hydroxide"
        ]
    },


    zinc: {

        ids: [
            "zinc",
            "Zn"
        ],

        formula:
            "Zn",

        names: [
            "Zinc",
            "Zinc métallique",
            "Zinc metal"
        ]
    },


    copperSulfate: {

        ids: [
            "copperSulfate",
            "cuso4",
            "cuSo4",
            "sulfateDeCuivre",
            "sulfateDeCuivreII"
        ],

        formula:
            "CuSO4",

        names: [
            "Sulfate de cuivre",
            "Sulfate de cuivre(II)",
            "Sulfate de cuivre (II)",
            "Cuivre sulfate",
            "Copper sulfate",
            "Copper(II) sulfate"
        ]
    },


    sodiumChloride: {

        ids: [
            "sodiumChloride",
            "nacl",
            "chlorureDeSodium"
        ],

        formula:
            "NaCl",

        names: [
            "Chlorure de sodium",
            "Chlorure de sodium (NaCl)",
            "Sodium chloride"
        ]
    },


    water: {

        ids: [
            "water",
            "h2o",
            "eau",
            "eauDistillee"
        ],

        formula:
            "H2O",

        names: [
            "Eau",
            "Eau distillée",
            "Eau distillee",
            "Water",
            "Distilled water"
        ]
    },


    copper: {

        ids: [
            "copper",
            "cu",
            "cuivre"
        ],

        formula:
            "Cu",

        names: [
            "Cuivre",
            "Cuivre métallique",
            "Copper",
            "Copper metal"
        ]
    }
};


/* ============================================================
   20.4 — RECHERCHE D'UN COMPOSANT PAR IDENTITÉ CHIMIQUE
============================================================ */

function findChemicalComponent(
    object,
    chemicalKey
) {

    if (
        !object ||
        !Array.isArray(
            object.components
        )
    ) {
        return null;
    }

    const identity =
        CHEMICAL_IDENTITIES[
            chemicalKey
        ];

    if (!identity) {
        return null;
    }

    const identities = [

        {
            id: identity.ids[0],
            formula:
                identity.formula,
            names:
                identity.names
        },

        ...identity.ids.map(
            id => ({
                id: id,
                formula:
                    identity.formula,
                names:
                    identity.names
            })
        )
    ];

    return (
        object.components.find(
            component => {

                if (
                    Number(
                        component.moles || 0
                    ) <= 0
                ) {
                    return false;
                }

                return chemicalIdentityMatches(
                    component,
                    identities
                );
            }
        ) || null
    );
}


/* ============================================================
   20.5 — COMPATIBILITÉ D'UNE SUBSTANCE
============================================================ */

function hasChemical(
    object,
    chemicalKey
) {

    return !!findChemicalComponent(
        object,
        chemicalKey
    );
}


/* ============================================================
   20.6 — COMPATIBILITÉ ANCIENNE API
   ------------------------------------------------------------
   Conservée pour ne pas casser le moteur.
============================================================ */

function hasComponent(
    object,
    id
) {

    if (
        !object ||
        !Array.isArray(
            object.components
        )
    ) {
        return false;
    }

    const direct =
        object.components.some(
            component =>
                normalizeChemicalText(
                    component.id
                ) ===
                normalizeChemicalText(
                    id
                ) &&
                Number(
                    component.moles || 0
                ) > 0
        );

    if (direct) {
        return true;
    }

    const identityKey =
        Object.keys(
            CHEMICAL_IDENTITIES
        ).find(
            key =>
                CHEMICAL_IDENTITIES[
                    key
                ].ids.some(
                    chemicalId =>
                        normalizeChemicalText(
                            chemicalId
                        ) ===
                        normalizeChemicalText(
                            id
                        )
                )
        );

    if (!identityKey) {
        return false;
    }

    return hasChemical(
        object,
        identityKey
    );
}


/* ============================================================
   20.7 — GET COMPONENT
============================================================ */

function getComponent(
    object,
    id
) {

    if (
        !object ||
        !Array.isArray(
            object.components
        )
    ) {
        return null;
    }

    const direct =
        object.components.find(
            component =>
                normalizeChemicalText(
                    component.id
                ) ===
                normalizeChemicalText(
                    id
                )
        );

    if (direct) {
        return direct;
    }

    const identityKey =
        Object.keys(
            CHEMICAL_IDENTITIES
        ).find(
            key =>
                CHEMICAL_IDENTITIES[
                    key
                ].ids.some(
                    chemicalId =>
                        normalizeChemicalText(
                            chemicalId
                        ) ===
                        normalizeChemicalText(
                            id
                        )
                )
        );

    if (!identityKey) {
        return null;
    }

    return findChemicalComponent(
        object,
        identityKey
    );
}


/* ============================================================
   20.8 — CONSOMMATION DE MOLES
============================================================ */

function consumeMoles(
    object,
    id,
    amount
) {

    const component =
        getComponent(
            object,
            id
        );

    if (!component) {
        return 0;
    }

    const available =
        Number(
            component.moles || 0
        );

    const requested =
        Number(
            amount || 0
        );

    if (
        available <= 0 ||
        requested <= 0
    ) {
        return 0;
    }

    const consumed =
        Math.min(
            available,
            requested
        );

    const ratio =
        available > 0
            ? consumed / available
            : 0;

    component.moles =
        Math.max(
            0,
            available - consumed
        );

    component.massG =
        Math.max(
            0,
            Number(
                component.massG || 0
            ) * (1 - ratio)
        );

    component.volumeMl =
        Math.max(
            0,
            Number(
                component.volumeMl || 0
            ) * (1 - ratio)
        );

    return consumed;
}


/* ============================================================
   20.9 — AJOUT DE PRODUIT
============================================================ */

function addProduct(
    object,
    materialId,
    moles,
    massG = 0,
    volumeMl = 0
) {

    if (
        !object ||
        !Array.isArray(
            object.components
        )
    ) {
        return null;
    }

    if (
        Number(moles || 0) <= 0
    ) {
        return null;
    }

    const material =
        getMaterial(
            materialId
        );

    if (!material) {
        return null;
    }

    let component =
        getComponent(
            object,
            materialId
        );

    if (!component) {

        component = {

            id:
                material.id,

            name:
                material.name,

            formula:
                material.formula ||
                "",

            moles:
                0,

            massG:
                0,

            volumeMl:
                0,

            concentrationM:
                Number(
                    material.molarity ||
                    0
                ),

            density:
                Number(
                    material.density ||
                    1
                ),

            pH:
                Number(
                    material.pH ??
                    7
                ),

            phase:
                material.phase ||
                "liquid",

            color:
                material.color ||
                "#dbeafe"
        };

        object.components.push(
            component
        );
    }

    component.moles +=
        Number(moles || 0);

    component.massG +=
        Number(massG || 0);

    component.volumeMl +=
        Number(volumeMl || 0);

    return component;
}


/* ============================================================
   20.10 — BASE DE DONNÉES DES RÉACTIONS
   ------------------------------------------------------------
   Les coefficients représentent les rapports molaires.
============================================================ */

const REACTION_DATABASE = [

    /* --------------------------------------------------------
       RÉACTION 001
       HCl + NaOH → NaCl + H₂O
    -------------------------------------------------------- */

    {

        id:
            "neutralisation_hcl_naoh",

        name:
            "Neutralisation acide-base",

        reactants: [

            {
                chemical:
                    "hydrochloricAcid",

                coefficient:
                    1
            },

            {
                chemical:
                    "sodiumHydroxide",

                coefficient:
                    1
            }
        ],

        products: [

            {
                material:
                    "sodiumChloride",

                coefficient:
                    1,

                molarMass:
                    58.44
            },

            {
                material:
                    "water",

                coefficient:
                    1,

                molarMass:
                    18.015
            }
        ],

        temperatureDelta:
            4,

        phase:
            "aqueous",

        gas:
            false,

        precipitate:
            false,

        bubbling:
            false,

        color:
            "#eef7ff",

        description:
            "Neutralisation acide-base : HCl + NaOH → NaCl + H₂O."
    },


    /* --------------------------------------------------------
       RÉACTION 002
       Zn + 2HCl → ZnCl₂ + H₂
    -------------------------------------------------------- */

    {

        id:
            "zinc_hcl",

        name:
            "Réaction zinc-acide chlorhydrique",

        reactants: [

            {
                chemical:
                    "zinc",

                coefficient:
                    1
            },

            {
                chemical:
                    "hydrochloricAcid",

                coefficient:
                    2
            }
        ],

        products: [],

        temperatureDelta:
            6,

        phase:
            "gas_evolution",

        gas:
            true,

        precipitate:
            false,

        bubbling:
            true,

        color:
            null,

        description:
            "Dégagement de dihydrogène : Zn + 2HCl → ZnCl₂ + H₂."
    },


    /* --------------------------------------------------------
       RÉACTION 003
       Zn + CuSO₄ → ZnSO₄ + Cu
    -------------------------------------------------------- */

    {

        id:
            "zinc_copper_sulfate",

        name:
            "Déplacement métallique",

        reactants: [

            {
                chemical:
                    "zinc",

                coefficient:
                    1
            },

            {
                chemical:
                    "copperSulfate",

                coefficient:
                    1
            }
        ],

        products: [

            {
                material:
                    "copper",

                coefficient:
                    1,

                molarMass:
                    63.546
            }
        ],

        temperatureDelta:
            0,

        phase:
            "redox",

        gas:
            false,

        precipitate:
            true,

        bubbling:
            false,

        color:
            "#b87333",

        description:
            "Réaction d'oxydoréduction : Zn + CuSO₄ → ZnSO₄ + Cu."
    }
];


/* ============================================================
   20.11 — CALCUL DU MAXIMUM RÉACTIONNEL
============================================================ */

function calculateReactionExtent(
    object,
    reaction
) {

    let extent =
        Infinity;

    for (
        const reactant
        of reaction.reactants
    ) {

        const component =
            findChemicalComponent(
                object,
                reactant.chemical
            );

        if (!component) {
            return 0;
        }

        const available =
            Number(
                component.moles || 0
            );

        const coefficient =
            Number(
                reactant.coefficient || 1
            );

        if (
            available <= 0 ||
            coefficient <= 0
        ) {
            return 0;
        }

        const possible =
            available /
            coefficient;

        extent =
            Math.min(
                extent,
                possible
            );
    }

    return Number.isFinite(
        extent
    )
        ? Math.max(
            0,
            extent
        )
        : 0;
}


/* ============================================================
   20.12 — EXÉCUTION D'UNE RÉACTION
============================================================ */

function executeReaction(
    object,
    reaction,
    extent
) {

    if (
        !object ||
        !reaction ||
        extent <= 0
    ) {
        return false;
    }

    /* --------------------------------------------------------
       CONSOMMATION DES RÉACTIFS
    -------------------------------------------------------- */

    for (
        const reactant
        of reaction.reactants
    ) {

        const amount =
            extent *
            Number(
                reactant.coefficient ||
                1
            );

        const identity =
            CHEMICAL_IDENTITIES[
                reactant.chemical
            ];

        if (!identity) {
            return false;
        }

        const component =
            findChemicalComponent(
                object,
                reactant.chemical
            );

        if (!component) {
            return false;
        }

        const consumed =
            consumeMoles(
                object,
                component.id,
                amount
            );

        if (
            consumed + 1e-12 <
            amount
        ) {
            return false;
        }
    }


    /* --------------------------------------------------------
       FORMATION DES PRODUITS
    -------------------------------------------------------- */

    for (
        const product
        of (
            reaction.products ||
            []
        )
    ) {

        const amount =
            extent *
            Number(
                product.coefficient ||
                1
            );

        let mass =
            0;

        if (
            Number(
                product.molarMass || 0
            ) > 0
        ) {

            mass =
                amount *
                Number(
                    product.molarMass
                );
        }

        /*
         * L'eau produite par neutralisation
         * est ajoutée comme composant réel
         * si elle existe dans MATERIALS.
         */

        addProduct(
            object,
            product.material,
            amount,
            mass
        );
    }


    /* --------------------------------------------------------
       EFFETS PHYSICO-CHIMIQUES
    -------------------------------------------------------- */

    const oldTemperature =
        Number(
            object.temperatureC ||
            25
        );

    const deltaT =
        Number(
            reaction.temperatureDelta ||
            0
        );

    object.temperatureC =
        clamp(
            oldTemperature + deltaT,
            MIN_TEMPERATURE,
            MAX_TEMPERATURE
        );


    object.reactionState = {

        active:
            true,

        gas:
            !!reaction.gas,

        precipitate:
            !!reaction.precipitate,

        bubbling:
            !!reaction.bubbling,

        phase:
            reaction.phase ||
            "aqueous",

        color:
            reaction.color ||
            object.color,

        description:
            reaction.description ||
            reaction.name
    };


    object.state =
        reaction.gas
            ? "dégagement gazeux"
            : reaction.precipitate
                ? "réaction d'oxydoréduction"
                : "réaction effectuée";


    /* --------------------------------------------------------
       pH SPÉCIAL POUR NEUTRALISATION
    -------------------------------------------------------- */

    if (
        reaction.id ===
        "neutralisation_hcl_naoh"
    ) {

        object.pH =
            7;
    }


    /* --------------------------------------------------------
       JOURNAL
    -------------------------------------------------------- */

    logObservation(
        "Réaction effectuée : " +
        reaction.description
    );

    toast(
        "Réaction effectuée : " +
        reaction.name +
        ".",
        "success"
    );

    return true;
}


/* ============================================================
   20.13 — MOTEUR PRINCIPAL
============================================================ */


function reactSelected() {

    const object =
        getSelected();


    /* ========================================================
       1 — RÉCIPIENT OBLIGATOIRE
    ======================================================== */

    if (!object) {

        toast(
            "Sélectionnez un récipient contenant des substances.",
            "warning"
        );

        return;
    }


    /* ========================================================
       2 — SI UNE RÉACTION EST DÉJÀ TERMINÉE
       --------------------------------------------------------
       IMPORTANT :
       NE JAMAIS EFFACER LE RÉSULTAT D'UNE RÉACTION
       DÉJÀ EFFECTUÉE.
    ======================================================== */

    if (
        object.reactionState &&
        object.reactionState.active === true &&
        object.reactionState.description
    ) {

        const previousDescription =
            object.reactionState.description;


        object.state =
            object.state ||
            "réaction effectuée";


        logObservation(
            "Réaction déjà effectuée dans ce récipient : " +
            previousDescription
        );


        toast(
            "Cette réaction a déjà été effectuée. Le résultat reste conservé dans le bécher.",
            "info"
        );


        /*
         * On conserve volontairement :
         * - reactionState
         * - state
         * - pH
         * - température
         * - produits
         * - couleur
         * - gaz
         * - précipité
         * - bulles
         */

        recalculateObject(
            object
        );

        /*
         * IMPORTANT :
         * recalculateObject() ne doit pas recevoir
         * l'autorisation de supprimer reactionState.
         */

        renderAll();

        return;
    }


    /* ========================================================
       3 — VÉRIFICATION DES COMPOSANTS
    ======================================================== */

    if (
        !Array.isArray(
            object.components
        ) ||
        object.components.length === 0
    ) {

        toast(
            "Aucune substance à faire réagir.",
            "warning"
        );

        return;
    }


    /* ========================================================
       4 — RECHERCHE D'UNE RÉACTION COMPATIBLE
    ======================================================== */

    let compatibleReaction =
        null;

    let compatibleExtent =
        0;


    for (
        const reaction
        of REACTION_DATABASE
    ) {

        const extent =
            calculateReactionExtent(
                object,
                reaction
            );


        if (
            extent > 0
        ) {

            compatibleReaction =
                reaction;

            compatibleExtent =
                extent;

            break;
        }
    }


    /* ========================================================
       5 — AUCUNE NOUVELLE RÉACTION
       --------------------------------------------------------
       IMPORTANT :
       Si aucune nouvelle réaction n'est disponible,
       on ne détruit PAS un résultat existant.
    ======================================================== */

    if (
        !compatibleReaction ||
        compatibleExtent <= 0
    ) {

        /*
         * Si le récipient contient déjà un résultat
         * réactionnel, on le conserve.
         */

        if (
            object.reactionState &&
            object.reactionState.active === true
        ) {

            toast(
                "Aucune nouvelle réaction à effectuer. Le résultat de la réaction précédente est conservé.",
                "info"
            );

            renderAll();

            return;
        }


        /*
         * Seulement dans le cas où aucune réaction
         * n'a encore été effectuée.
         */

        object.reactionState = {

            active:
                false,

            gas:
                false,

            precipitate:
                false,

            bubbling:
                false,

            phase:
                "stable",

            color:
                object.color,

            description:
                "Aucune réaction compatible détectée."
        };


        object.state =
            "stable";


        toast(
            "Aucune réaction compatible avec les substances présentes.",
            "info"
        );


        logObservation(
            "Aucune réaction compatible détectée."
        );


        recalculateObject(
            object
        );

        renderAll();

        return;
    }


    /* ========================================================
       6 — EXÉCUTION DE LA RÉACTION
    ======================================================== */

    const success =
        executeReaction(
            object,
            compatibleReaction,
            compatibleExtent
        );


    /* ========================================================
       7 — ÉCHEC D'EXÉCUTION
    ======================================================== */

    if (!success) {

        /*
         * Ne pas détruire une ancienne réaction valide.
         */

        if (
            object.reactionState &&
            object.reactionState.active === true
        ) {

            toast(
                "Le résultat de la réaction précédente est conservé.",
                "warning"
            );

            renderAll();

            return;
        }


        object.reactionState = {

            active:
                false,

            gas:
                false,

            precipitate:
                false,

            bubbling:
                false,

            phase:
                "stable",

            color:
                object.color,

            description:
                "La réaction n'a pas pu être exécutée."
        };


        object.state =
            "stable";


        toast(
            "La réaction n'a pas pu être exécutée correctement.",
            "warning"
        );


        logObservation(
            "Échec de l'exécution de la réaction : " +
            compatibleReaction.name
        );
    }


    /* ========================================================
       8 — RECALCUL FINAL
       --------------------------------------------------------
       Le statut réactionnel doit rester présent.
    ======================================================== */

    recalculateObject(
        object
    );


    /*
     * RÉAFFIRMATION DU STATUT
     *
     * On s'assure que le statut ne disparaisse pas
     * après le recalcul.
     */

    if (
        success &&
        compatibleReaction
    ) {

        object.state =
            compatibleReaction.gas
                ? "dégagement gazeux"
                : compatibleReaction.precipitate
                    ? "réaction d'oxydoréduction"
                    : "réaction effectuée";


        if (
            !object.reactionState
        ) {

            object.reactionState = {

                active:
                    true,

                gas:
                    !!compatibleReaction.gas,

                precipitate:
                    !!compatibleReaction.precipitate,

                bubbling:
                    !!compatibleReaction.bubbling,

                phase:
                    compatibleReaction.phase ||
                    "aqueous",

                color:
                    compatibleReaction.color ||
                    object.color,

                description:
                    compatibleReaction.description
            };
        }


        object.reactionState.active =
            true;
    }


    /* ========================================================
       9 — AFFICHAGE FINAL
    ======================================================== */

    renderAll();
}























    /* ============================================================
       21 — MESURES
    ============================================================ */

    function measureObject(
        object,
        type
    ) {

        if (!object) {
            return {
                value: 0,
                unit: ""
            };
        }

        switch (type) {

            case "volume":
                return {
                    value:
                        round(
                            object.volumeMl || 0,
                            2
                        ),
                    unit: "mL"
                };

            case "temperature":
                return {
                    value:
                        round(
                            object.temperatureC || 25,
                            1
                        ),
                    unit: "°C"
                };

            case "ph":
                return {
                    value:
                        round(
                            object.pH ?? 7,
                            2
                        ),
                    unit: "pH"
                };

            case "mass":
                return {
                    value:
                        round(
                            calculateMass(object),
                            3
                        ),
                    unit: "g"
                };

            case "density":
                return {
                    value:
                        round(
                            calculateDensity(object),
                            3
                        ),
                    unit: "g/mL"
                };

            default:
                return {
                    value: 0,
                    unit: ""
                };
        }
    }

    function openMeasurementModal() {

        const object =
            getSelected();

        if (!object) {

            toast(
                "Sélectionnez un objet à mesurer.",
                "warning"
            );

            return;
        }

        const type =
            state.measurementType ||
            "volume";

        updateMeasurementDisplay(
            object,
            type
        );

        openModal(
            E.measurementModal
        );
    }

    function updateMeasurementDisplay(
        object,
        type
    ) {

        const result =
            measureObject(
                object,
                type
            );

        if (E.instrumentScreenLabel) {

            const labels = {
                volume: "Volume",
                temperature: "Température",
                ph: "pH",
                mass: "Masse",
                density: "Densité"
            };

            E.instrumentScreenLabel.textContent =
                labels[type] ||
                type;
        }

        if (E.instrumentScreenValue) {
            E.instrumentScreenValue.textContent =
                String(
                    result.value
                );
        }

        if (E.instrumentScreenUnit) {
            E.instrumentScreenUnit.textContent =
                result.unit;
        }

        if (E.measurementLabel) {
            E.measurementLabel.textContent =
                type;
        }

        if (E.measurementValue) {
            E.measurementValue.textContent =
                String(
                    result.value
                );
        }

        if (E.measurementPrecision) {

            const precision = {
                volume: "± 0,1 mL",
                temperature: "± 0,1 °C",
                ph: "± 0,01 pH",
                mass: "± 0,01 g",
                density: "calculée"
            };

            E.measurementPrecision.textContent =
                precision[type] ||
                "";
        }
    }

    /* ============================================================
       22 — CHAUFFAGE
    ============================================================ */

    function toggleHeating() {

        const object =
            getSelected();

        if (!object) {

            toast(
                "Sélectionnez un objet à chauffer.",
                "warning"
            );

            return;
        }

        object.heating =
            !object.heating;

        if (object.heating) {

            object.state =
                "chauffage";

            object.temperatureC =
                clamp(
                    Number(
                        object.temperatureC ||
                        25
                    ) + 10,
                    MIN_TEMPERATURE,
                    MAX_TEMPERATURE
                );

            logObservation(
                `${object.name} placé en chauffage.`
            );

            toast(
                "Chauffage activé.",
                "success"
            );

        } else {

            object.state =
                "refroidissement";

            logObservation(
                `Chauffage arrêté pour ${object.name}.`
            );

            toast(
                "Chauffage arrêté.",
                "info"
            );
        }

        renderAll();
    }

    /* ============================================================
       23 — SUPPRESSION
    ============================================================ */

    function removeSelected() {

        const object =
            getSelected();

        if (!object) {
            return;
        }

        state.objects =
            state.objects.filter(
                item =>
                    item.id !==
                    object.id
            );

        state.selectedId =
            null;

        logObservation(
            `${object.name} retiré du laboratoire.`
        );

        toast(
            "Objet retiré.",
            "success"
        );

        renderAll();
    }

    /* ============================================================
       24 — ZOOM
    ============================================================ */

    function applyZoom() {

        const target =
            E.workspaceObjects ||
            E.chemistryCanvas;

        if (!target) {
            return;
        }

        target.style.transform =
            `scale(${state.zoom})`;

        target.style.transformOrigin =
            "top left";

        if (E.zoomValue) {
            E.zoomValue.textContent =
                `${Math.round(
                    state.zoom * 100
                )}%`;
        }
    }

    function setZoom(value) {

        state.zoom =
            clamp(
                Number(value) || 1,
                0.5,
                2
            );

        applyZoom();
    }

    function zoomIn() {
        setZoom(
            state.zoom + 0.1
        );
    }

    function zoomOut() {
        setZoom(
            state.zoom - 0.1
        );
    }

    function fitWorkspace() {

        setZoom(1);

        const viewport =
            E.workspaceViewport;

        const workspace =
            E.workspaceObjects ||
            E.chemistryCanvas;

        if (!viewport || !workspace) {
            return;
        }

        const viewportWidth =
            viewport.clientWidth;

        const estimatedWidth =
            Math.max(
                workspace.scrollWidth,
                900
            );

        if (
            estimatedWidth >
            viewportWidth
        ) {

            setZoom(
                clamp(
                    viewportWidth /
                    estimatedWidth,
                    0.5,
                    1
                )
            );
        }
    }

    /* ============================================================
       25 — CLEAR WORKSPACE
    ============================================================ */

    function clearWorkspace() {

        if (!state.objects.length) {

            toast(
                "Le laboratoire est déjà vide.",
                "info"
            );

            return;
        }

        const confirmed =
            window.confirm(
                "Voulez-vous retirer tous les objets du laboratoire ?"
            );

        if (!confirmed) {
            return;
        }

        state.objects = [];

        state.selectedId =
            null;

        logObservation(
            "Le laboratoire a été vidé."
        );

        renderAll();

        toast(
            "Laboratoire vidé.",
            "success"
        );
    }

    /* ============================================================
       26 — MODALES
    ============================================================ */

    function openModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.add(
            "open",
            "is-open",
            "active"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        modal.style.display =
            "flex";
    }

    function closeModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "open",
            "is-open",
            "active"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        modal.style.display =
            "";
    }

    function openLibrary() {

        E.materialsPanel?.classList.add(
            "mobile-library-open"
        );

        E.materialsBackdrop?.classList.add(
            "mobile-library-open"
        );
    }

    function closeLibrary() {

        E.materialsPanel?.classList.remove(
            "mobile-library-open"
        );

        E.materialsBackdrop?.classList.remove(
            "mobile-library-open"
        );
    }

    /* ============================================================
       27 — TOASTS
    ============================================================ */

    function toast(
        message,
        type = "info"
    ) {

        if (!E.chemToastStack) {
            return;
        }

        const item =
            document.createElement(
                "div"
            );

        item.className =
            `chem-toast ${type}`;

        item.textContent =
            message;

        E.chemToastStack.appendChild(
            item
        );

        setTimeout(
            () => {

                item.classList.add(
                    "closing"
                );

                setTimeout(
                    () =>
                        item.remove(),
                    300
                );

            },
            3200
        );

        if (E.chemLiveRegion) {
            E.chemLiveRegion.textContent =
                message;
        }
    }

    /* ============================================================
       28 — JOURNAL D'OBSERVATION
    ============================================================ */

    function logObservation(
        message
    ) {

        const entry = {
            time: nowTime(),
            message: String(message)
        };

        state.logs.unshift(
            entry
        );

        if (
            state.logs.length >
            100
        ) {
            state.logs =
                state.logs.slice(
                    0,
                    100
                );
        }

        renderObservationLog();
    }

    function renderObservationLog() {

        if (!E.observationLog) {
            return;
        }

        E.observationLog.innerHTML = "";

        state.logs.forEach(
            entry => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "observation-entry";

                row.innerHTML = `
                    <time>
                        ${escapeHTML(
                            entry.time
                        )}
                    </time>

                    <span>
                        ${escapeHTML(
                            entry.message
                        )}
                    </span>
                `;

                E.observationLog.appendChild(
                    row
                );
            }
        );
    }

    /* ============================================================
       29 — SAUVEGARDE
    ============================================================ */

    function saveSession(
        showToast = true
    ) {

        const name =
            E.sessionName?.value ||
            state.sessionName;

        state.sessionName =
            String(
                name ||
                "Laboratoire chimique FOBAS"
            ).trim();

        const payload = {

            version: 4,

            savedAt:
                new Date().toISOString(),

            sessionName:
                state.sessionName,

            zoom:
                state.zoom,

            objects:
                state.objects,

            logs:
                state.logs,

            nextId:
                state.nextId
        };

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    payload
                )
            );

            localStorage.setItem(
                SESSION_KEY,
                state.sessionName
            );

        } catch (error) {

            console.error(
                "FOBAS Chemistry save error:",
                error
            );

            if (showToast) {
                toast(
                    "Impossible d'enregistrer la session.",
                    "error"
                );
            }

            return false;
        }

        if (showToast) {

            logObservation(
                "Session enregistrée."
            );

            toast(
                "Session enregistrée avec succès.",
                "success"
            );
        }

        return true;
    }

    /* ============================================================
       30 — CHARGEMENT
    ============================================================ */

    function loadSession() {

        try {

            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!raw) {
                return false;
            }

            const payload =
                JSON.parse(raw);

            if (!payload) {
                return false;
            }

            state.objects =
                Array.isArray(
                    payload.objects
                )
                    ? payload.objects
                    : [];

            state.logs =
                Array.isArray(
                    payload.logs
                )
                    ? payload.logs
                    : [];

            state.nextId =
                Number(
                    payload.nextId || 1
                );

            state.zoom =
                Number(
                    payload.zoom || 1
                );

            state.sessionName =
                payload.sessionName ||
                "Laboratoire chimique FOBAS";

            state.objects.forEach(
                object => {

                    if (!object.components) {
                        object.components = [];
                    }

                    if (!object.reactionState) {

                        object.reactionState = {
                            active: false,
                            gas: false,
                            precipitate: false,
                            bubbling: false,
                            phase: "stable",
                            color:
                                object.color ||
                                "#dbeafe",
                            description: ""
                        };
                    }

                    if (
                        object.temperatureC ==
                        null
                    ) {
                        object.temperatureC =
                            DEFAULT_TEMPERATURE;
                    }
                }
            );

            if (E.sessionName) {
                E.sessionName.value =
                    state.sessionName;
            }

            return true;

        } catch (error) {

            console.error(
                "FOBAS Chemistry load error:",
                error
            );

            return false;
        }
    }

    /* ============================================================
       31 — RESET
    ============================================================ */

    function resetLab() {

        const confirmed =
            window.confirm(
                "Réinitialiser complètement la simulation ?"
            );

        if (!confirmed) {
            return;
        }

        state.objects = [];

        state.selectedId =
            null;

        state.nextId =
            1;

        state.logs = [];

        state.tool =
            "select";

        state.category =
            "all";

        state.search =
            "";

        state.zoom =
            1;

        try {

            localStorage.removeItem(
                STORAGE_KEY
            );

            localStorage.removeItem(
                SESSION_KEY
            );

        } catch (_) {}

        if (E.sessionName) {
            E.sessionName.value =
                "Laboratoire chimique FOBAS";
        }

        renderAll();

        toast(
            "Simulation réinitialisée.",
            "success"
        );

        logObservation(
            "Nouvelle session de laboratoire."
        );
    }

    /* ============================================================
       32 — ÉTAT DU LABORATOIRE
    ============================================================ */

    function updateLaboratoryState() {

        const active =
            state.running;

        if (E.laboratoryStateDot) {

            E.laboratoryStateDot.classList.toggle(
                "active",
                active
            );

            E.laboratoryStateDot.classList.toggle(
                "online",
                active
            );
        }

        if (E.laboratoryStateText) {

            E.laboratoryStateText.textContent =
                active
                    ? "Laboratoire actif"
                    : "Laboratoire arrêté";
        }
    }

    /* ============================================================
       33 — OVERLAYS
    ============================================================ */

    function updateTemperatureOverlay() {

        if (!E.temperatureOverlay) {
            return;
        }

        const hot =
            state.objects.some(
                object =>
                    Number(
                        object.temperatureC || 25
                    ) > 40
            );

        E.temperatureOverlay.classList.toggle(
            "active",
            hot
        );
    }

    function updateReactionOverlay() {

        if (!E.reactionOverlay) {
            return;
        }

        const reaction =
            state.objects.some(
                object =>
                    object.reactionState?.active
            );

        E.reactionOverlay.classList.toggle(
            "active",
            reaction
        );
    }

    /* ============================================================
       34 — DROP WORKSPACE
    ============================================================ */

    function bindWorkspaceDrop() {

        const zone =
            E.workspaceDropZone ||
            E.workspaceObjects ||
            E.chemistryCanvas;

        if (!zone) {
            return;
        }

        zone.addEventListener(
            "dragover",
            event => {
                event.preventDefault();

                event.dataTransfer.dropEffect =
                    "copy";
            }
        );

        zone.addEventListener(
            "drop",
            event => {

                event.preventDefault();

                const materialId =
                    event.dataTransfer.getData(
                        "text/plain"
                    );

                if (!materialId) {
                    return;
                }

                const rect =
                    zone.getBoundingClientRect();

                const position = {

                    x:
                        (
                            event.clientX -
                            rect.left
                        ) /
                        state.zoom,

                    y:
                        (
                            event.clientY -
                            rect.top
                        ) /
                        state.zoom
                };

                addMaterialToWorkspace(
                    materialId,
                    position
                );
            }
        );
    }

    /* ============================================================
       35 — ÉVÉNEMENTS
    ============================================================ */

    function bindEvents() {

        E.openMaterialsBtn?.addEventListener(
            "click",
            openLibrary
        );

        E.closeMaterialsBtn?.addEventListener(
            "click",
            closeLibrary
        );

        E.materialsBackdrop?.addEventListener(
            "click",
            closeLibrary
        );

        E.materialSearch?.addEventListener(
            "input",
            event => {

                state.search =
                    event.target.value;

                renderLibrary();
            }
        );

        $$(".category-button").forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        $$(".category-button")
                            .forEach(
                                item => {

                                    item.classList.remove(
                                        "is-active"
                                    );

                                    item.classList.remove(
                                        "active"
                                    );

                                    item.setAttribute(
                                        "aria-selected",
                                        "false"
                                    );
                                }
                            );

                        button.classList.add(
                            "is-active"
                        );

                        button.classList.add(
                            "active"
                        );

                        button.setAttribute(
                            "aria-selected",
                            "true"
                        );

                        state.category =
                            button.dataset.category ||
                            "all";

                        renderLibrary();
                    }
                );
            }
        );

        $$(".tool-button").forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        setTool(
                            button.dataset.tool
                        );
                    }
                );
            }
        );

        E.zoomInBtn?.addEventListener(
            "click",
            zoomIn
        );

        E.zoomOutBtn?.addEventListener(
            "click",
            zoomOut
        );

        E.fitWorkspaceBtn?.addEventListener(
            "click",
            fitWorkspace
        );

        E.clearWorkspaceBtn?.addEventListener(
            "click",
            clearWorkspace
        );

        E.chemResetBtn?.addEventListener(
            "click",
            resetLab
        );

        E.chemSaveBtn?.addEventListener(
            "click",
            () =>
                saveSession(true)
        );

        E.sessionName?.addEventListener(
            "input",
            () =>
                saveSession(false)
        );

        E.actionTransferBtn?.addEventListener(
            "click",
            openTransferModal
        );

        E.actionMixBtn?.addEventListener(
            "click",
            mixSelected
        );

        E.actionMeasureBtn?.addEventListener(
            "click",
            openMeasurementModal
        );

        E.actionHeatBtn?.addEventListener(
            "click",
            toggleHeating
        );

        E.actionRemoveBtn?.addEventListener(
            "click",
            removeSelected
        );

        E.closeTransferModal?.addEventListener(
            "click",
            () =>
                closeModal(
                    E.transferModal
                )
        );

        E.cancelTransferBtn?.addEventListener(
            "click",
            () =>
                closeModal(
                    E.transferModal
                )
        );

        E.confirmTransferBtn?.addEventListener(
            "click",
            executeTransfer
        );

        E.transferTarget?.addEventListener(
            "change",
            updateTransferMaximum
        );

        E.transferRange?.addEventListener(
            "input",
            event => {

                if (E.transferAmount) {
                    E.transferAmount.value =
                        event.target.value;
                }
            }
        );

        E.transferAmount?.addEventListener(
            "input",
            event => {

                if (E.transferRange) {
                    E.transferRange.value =
                        event.target.value;
                }
            }
        );

        E.closeMeasurementModal?.addEventListener(
            "click",
            () =>
                closeModal(
                    E.measurementModal
                )
        );

        E.closeMeasurementBtn?.addEventListener(
            "click",
            () =>
                closeModal(
                    E.measurementModal
                )
        );

        $$(".measurement-option").forEach(
            option => {

                option.addEventListener(
                    "click",
                    () => {

                        state.measurementType =
                            option.dataset.measurement ||
                            "volume";

                        const object =
                            getSelected();

                        updateMeasurementDisplay(
                            object,
                            state.measurementType
                        );
                    }
                );
            }
        );

        E.chemHelpBtn?.addEventListener(
            "click",
            () =>
                openModal(
                    E.helpModal
                )
        );

        E.closeHelpModal?.addEventListener(
            "click",
            () =>
                closeModal(
                    E.helpModal
                )
        );

        E.closeHelpBtn?.addEventListener(
            "click",
            () =>
                closeModal(
                    E.helpModal
                )
        );

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeLibrary();

                    closeModal(
                        E.transferModal
                    );

                    closeModal(
                        E.measurementModal
                    );

                    closeModal(
                        E.helpModal
                    );
                }

                if (
                    event.key ===
                    "Delete"
                ) {

                    if (
                        document.activeElement?.tagName !==
                        "INPUT"
                    ) {
                        removeSelected();
                    }
                }
            }
        );
    }

    /* ============================================================
       36 — RENDU GLOBAL
    ============================================================ */

    function renderAll() {

        renderLibrary();

        renderInventory();

        renderWorkspace();

        renderInspector();

        renderStatus();

        renderObservationLog();

        updateLaboratoryState();

        updateTemperatureOverlay();

        updateReactionOverlay();

        applyZoom();

        if (
            E.sessionName &&
            state.sessionName
        ) {
            E.sessionName.value =
                state.sessionName;
        }
    }

    /* ============================================================
       37 — INITIALISATION
    ============================================================ */

    function init() {

        if (state.initialized) {
            return;
        }

        state.initialized =
            true;

        cacheElements();

        inject3DStyles();

        bindEvents();

        bindWorkspaceDrop();

        setTool(
            "select"
        );

        const loaded =
            loadSession();

        renderAll();

        if (!loaded) {

            logObservation(
                "Laboratoire CHIMIQUE FOBAS prêt."
            );

            logObservation(
                "Sélectionnez un matériau dans la bibliothèque pour commencer."
            );

        } else {

            logObservation(
                "Session précédente restaurée."
            );
        }

        setInterval(
            () => {

                state.objects.forEach(
                    object => {

                        if (
                            object.heating
                        ) {

                            object.temperatureC =
                                clamp(
                                    Number(
                                        object.temperatureC ||
                                        25
                                    ) + 1,
                                    MIN_TEMPERATURE,
                                    MAX_TEMPERATURE
                                );

                        } else if (
                            object.temperatureC >
                            DEFAULT_TEMPERATURE
                        ) {

                            object.temperatureC =
                                Math.max(
                                    DEFAULT_TEMPERATURE,
                                    Number(
                                        object.temperatureC
                                    ) - 0.25
                                );
                        }

                        recalculateObject(
                            object
                        );
                    }
                );

                renderStatus();

                updateTemperatureOverlay();

                saveSession(false);

            },
            1000
        );
    }

    /* ============================================================
       38 — API PUBLIQUE
    ============================================================ */

    APP.version =
        "4.0.0";

    APP.state =
        state;

    APP.materials =
        MATERIALS;

    APP.addMaterial =
        addMaterialToWorkspace;

    APP.select =
        selectObject;

    APP.setTool =
        setTool;

    APP.transfer =
        executeTransfer;

    APP.mix =
        mixSelected;

    APP.react =
        reactSelected;

    APP.measure =
        openMeasurementModal;

    APP.heat =
        toggleHeating;

    APP.remove =
        removeSelected;

    APP.save =
        saveSession;

    APP.reset =
        resetLab;

    APP.clear =
        clearWorkspace;

    APP.render =
        renderAll;

    APP.getSelected =
        getSelected;

    APP.getObject =
        getObject;

    APP.calculatePH =
        calculatePH;

    APP.detectReactions =
        reactSelected;

    APP.openTransfer =
        openTransferModal;

    APP.openMeasurement =
        openMeasurementModal;

    window.CHIMIQUE_FOBAS =
        APP;

    window.FOBASChemistry =
        APP;

    window.simulationChimicFobas =
        APP;

    /* ============================================================
       39 — DÉMARRAGE
    ============================================================ */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );

    } else {

        init();
    }

})();





