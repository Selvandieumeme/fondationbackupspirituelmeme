/*
 * ================================================================
 * CHIMIQUE FOBAS — SIMULATION CHIMIQUE VIRTUELLE
 * ================================================================
 * Fichier : simulationchimicfobas.js
 * Version : 1.0.0
 *
 * Compatible avec le HTML CHIMIQUE FOBAS fourni.
 * JavaScript navigateur natif — aucune dépendance externe.
 *
 * Fonctions principales :
 *  - Bibliothèque dynamique de matériaux
 *  - Verrerie
 *  - Réactifs
 *  - Solides
 *  - Métaux
 *  - Sels
 *  - Acides
 *  - Bases
 *  - Oxydes
 *  - Carbonates / bicarbonates
 *  - Indicateurs
 *  - Solvants
 *  - Instruments
 *  - Équipements
 *  - Drag & Drop
 *  - Touch / mobile
 *  - Transfert de matière
 *  - Mélange
 *  - Réactions chimiques
 *  - Précipités
 *  - Gaz
 *  - Changement de couleur
 *  - Chauffage
 *  - Température
 *  - pH
 *  - Masse
 *  - Volume
 *  - Densité
 *  - Mesures
 *  - Sauvegarde locale
 *  - Réinitialisation
 *  - Recherche dynamique
 *  - Validation de bibliothèque
 * ================================================================
 */

(() => {
  "use strict";

  /* ================================================================
     UTILITAIRES
  ================================================================ */

  const $ = id => document.getElementById(id);

  const $$ = selector =>
    [...document.querySelectorAll(selector)];

  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

  const round = (value, decimals = 2) =>
    Number.isFinite(Number(value))
      ? Number(Number(value).toFixed(decimals))
      : 0;

  const uid = prefix =>
    `${prefix}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;

  const num = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const lower = value =>
    String(value ?? "").trim().toLowerCase();

  /* ================================================================
     CONTRAT EXACT AVEC LE HTML FOURNI
  ================================================================ */

  const E = {
    app: $("chemApp"),

    laboratoryStateDot:
      $("laboratoryStateDot"),

    laboratoryStateText:
      $("laboratoryStateText"),

    sessionName:
      $("sessionName"),

    openMaterialsBtn:
      $("openMaterialsBtn"),

    closeMaterialsBtn:
      $("closeMaterialsBtn"),

    materialsPanel:
      $("materialsPanel"),

    materialsBackdrop:
      $("materialsBackdrop"),

    materialCount:
      $("materialCount"),

    materialSearch:
      $("materialSearch"),

    materialCategories:
      $("materialCategories"),

    materialsLibrary:
      $("materialsLibrary"),

    inventoryCount:
      $("inventoryCount"),

    inventoryList:
      $("inventoryList"),

    laboratoryWorkspace:
      $("laboratoryWorkspace"),

    workspaceViewport:
      $("workspaceViewport"),

    chemistryCanvas:
      $("chemistryCanvas"),

    workspaceGrid:
      $("workspaceGrid"),

    workspaceObjects:
      $("workspaceObjects"),

    workspaceDropZone:
      $("workspaceDropZone"),

    temperatureOverlay:
      $("temperatureOverlay"),

    reactionOverlay:
      $("reactionOverlay"),

    zoomInBtn:
      $("zoomInBtn"),

    zoomOutBtn:
      $("zoomOutBtn"),

    zoomValue:
      $("zoomValue"),

    fitWorkspaceBtn:
      $("fitWorkspaceBtn"),

    clearWorkspaceBtn:
      $("clearWorkspaceBtn"),

    statusObjects:
      $("statusObjects"),

    statusVolume:
      $("statusVolume"),

    statusTemperature:
      $("statusTemperature"),

    statusPH:
      $("statusPH"),

    statusMass:
      $("statusMass"),

    inspectorPanel:
      $("inspectorPanel"),

    selectedObjectType:
      $("selectedObjectType"),

    objectInspector:
      $("objectInspector"),

    materialProperties:
      $("materialProperties"),

    compositionSection:
      $("compositionSection"),

    measurementSection:
      $("measurementSection"),

    reactionSection:
      $("reactionSection"),

    objectActions:
      $("objectActions"),

    propName:
      $("propName"),

    propState:
      $("propState"),

    propTemperature:
      $("propTemperature"),

    propMass:
      $("propMass"),

    propVolume:
      $("propVolume"),

    propDensity:
      $("propDensity"),

    propPH:
      $("propPH"),

    propColor:
      $("propColor"),

    compositionTotal:
      $("compositionTotal"),

    compositionList:
      $("compositionList"),

    measurementLabel:
      $("measurementLabel"),

    measurementValue:
      $("measurementValue"),

    measurementPrecision:
      $("measurementPrecision"),

    reactionStatus:
      $("reactionStatus"),

    reactionPhase:
      $("reactionPhase"),

    reactionGas:
      $("reactionGas"),

    reactionPrecipitate:
      $("reactionPrecipitate"),

    reactionColor:
      $("reactionColor"),

    actionTransferBtn:
      $("actionTransferBtn"),

    actionMixBtn:
      $("actionMixBtn"),

    actionMeasureBtn:
      $("actionMeasureBtn"),

    actionHeatBtn:
      $("actionHeatBtn"),

    actionRemoveBtn:
      $("actionRemoveBtn"),

    observationPulse:
      $("observationPulse"),

    observationLog:
      $("observationLog"),

    transferModal:
      $("transferModal"),

    closeTransferModal:
      $("closeTransferModal"),

    cancelTransferBtn:
      $("cancelTransferBtn"),

    confirmTransferBtn:
      $("confirmTransferBtn"),

    transferSourceName:
      $("transferSourceName"),

    transferSourceAmount:
      $("transferSourceAmount"),

    transferTarget:
      $("transferTarget"),

    transferAmount:
      $("transferAmount"),

    transferRange:
      $("transferRange"),

    transferMaxLabel:
      $("transferMaxLabel"),

    measurementModal:
      $("measurementModal"),

    closeMeasurementModal:
      $("closeMeasurementModal"),

    closeMeasurementBtn:
      $("closeMeasurementBtn"),

    instrumentScreenLabel:
      $("instrumentScreenLabel"),

    instrumentScreenValue:
      $("instrumentScreenValue"),

    instrumentScreenUnit:
      $("instrumentScreenUnit"),

    helpModal:
      $("helpModal"),

    chemHelpBtn:
      $("chemHelpBtn"),

    closeHelpModal:
      $("closeHelpModal"),

    closeHelpBtn:
      $("closeHelpBtn"),

    chemResetBtn:
      $("chemResetBtn"),

    chemSaveBtn:
      $("chemSaveBtn"),

    chemToastStack:
      $("chemToastStack"),

    chemLiveRegion:
      $("chemLiveRegion")
  };

  /* ================================================================
     ÉTAT GLOBAL DE LA SIMULATION
  ================================================================ */

  const S = {
    objects: [],
    selectedId: null,
    activeTool: "select",
    zoom: 1,
    savedVersion: "1.0.0",
    session: {
      name: "Session de laboratoire",
      createdAt: Date.now()
    },
    suppressLibraryClick: false,
    dragState: null,
    measurement: {
      label: "",
      value: 0,
      unit: "",
      precision: 0
    }
  };

  /* ================================================================
     BIBLIOTHÈQUE CHIMIQUE
  ================================================================ */

  const M = [

    /* ============================================================
       MÉTAUX
    ============================================================ */

    {
      id: "fer",
      name: "Fer",
      formula: "Fe",
      cat: "solid",
      chemicalCategory: "metal",
      kind: "solid",
      molarMass: 55.845,
      density: 7.874,
      state: "solid",
      color: "#777777",
      solubility: "insoluble",
      valence: [2, 3],
      reactiveWith: [
        "acide-chlorhydrique",
        "solution-sulfate-cuivre",
        "sulfate-cuivre"
      ]
    },

    {
      id: "cuivre",
      name: "Cuivre",
      formula: "Cu",
      cat: "solid",
      chemicalCategory: "metal",
      kind: "solid",
      molarMass: 63.546,
      density: 8.96,
      state: "solid",
      color: "#b87333",
      solubility: "insoluble",
      valence: [1, 2],
      reactiveWith: [
        "acide-nitrique",
        "nitrate-argent"
      ]
    },

    {
      id: "zinc",
      name: "Zinc",
      formula: "Zn",
      cat: "solid",
      chemicalCategory: "metal",
      kind: "solid",
      molarMass: 65.38,
      density: 7.14,
      state: "solid",
      color: "#9b9b9b",
      solubility: "insoluble",
      valence: [2],
      reactiveWith: [
        "acide-chlorhydrique",
        "acide-sulfurique",
        "solution-sulfate-cuivre"
      ]
    },

    {
      id: "aluminium",
      name: "Aluminium",
      formula: "Al",
      cat: "solid",
      chemicalCategory: "metal",
      kind: "solid",
      molarMass: 26.9815,
      density: 2.70,
      state: "solid",
      color: "#c5c5c5",
      solubility: "insoluble",
      valence: [3],
      reactiveWith: [
        "acide-chlorhydrique",
        "hydroxyde-sodium"
      ]
    },

    {
      id: "magnesium",
      name: "Magnésium",
      formula: "Mg",
      cat: "solid",
      chemicalCategory: "metal",
      kind: "solid",
      molarMass: 24.305,
      density: 1.738,
      state: "solid",
      color: "#bfc1c2",
      solubility: "insoluble",
      valence: [2],
      reactiveWith: [
        "acide-chlorhydrique",
        "acide-sulfurique"
      ]
    },

    {
      id: "calcium",
      name: "Calcium",
      formula: "Ca",
      cat: "solid",
      chemicalCategory: "metal",
      kind: "solid",
      molarMass: 40.078,
      density: 1.55,
      state: "solid",
      color: "#d7d7d7",
      solubility: "reactif-eau",
      valence: [2],
      reactiveWith: [
        "eau",
        "acide-chlorhydrique"
      ]
    },

    {
      id: "argent",
      name: "Argent",
      formula: "Ag",
      cat: "solid",
      chemicalCategory: "metal",
      kind: "solid",
      molarMass: 107.8682,
      density: 10.49,
      state: "solid",
      color: "#c0c0c0",
      solubility: "insoluble",
      valence: [1],
      reactiveWith: [
        "acide-nitrique",
        "chlorure-sodium"
      ]
    },

    {
      id: "or",
      name: "Or",
      formula: "Au",
      cat: "solid",
      chemicalCategory: "metal",
      kind: "solid",
      molarMass: 196.96657,
      density: 19.32,
      state: "solid",
      color: "#d4af37",
      solubility: "insoluble",
      valence: [1, 3],
      reactiveWith: []
    },

    {
      id: "plomb",
      name: "Plomb",
      formula: "Pb",
      cat: "solid",
      chemicalCategory: "metal",
      kind: "solid",
      molarMass: 207.2,
      density: 11.34,
      state: "solid",
      color: "#55585a",
      solubility: "insoluble",
      valence: [2, 4],
      reactiveWith: [
        "acide-nitrique"
      ]
    },

    {
      id: "etain",
      name: "Étain",
      formula: "Sn",
      cat: "solid",
      chemicalCategory: "metal",
      kind: "solid",
      molarMass: 118.710,
      density: 7.265,
      state: "solid",
      color: "#8d9091",
      solubility: "insoluble",
      valence: [2, 4],
      reactiveWith: [
        "acide-chlorhydrique"
      ]
    },

    {
      id: "nickel",
      name: "Nickel",
      formula: "Ni",
      cat: "solid",
      chemicalCategory: "metal",
      kind: "solid",
      molarMass: 58.6934,
      density: 8.908,
      state: "solid",
      color: "#8f9b9d",
      solubility: "insoluble",
      valence: [2, 3],
      reactiveWith: [
        "acide-chlorhydrique"
      ]
    },

    {
      id: "cobalt",
      name: "Cobalt",
      formula: "Co",
      cat: "solid",
      chemicalCategory: "metal",
      kind: "solid",
      molarMass: 58.933,
      density: 8.90,
      state: "solid",
      color: "#65717b",
      solubility: "insoluble",
      valence: [2, 3],
      reactiveWith: [
        "acide-chlorhydrique"
      ]
    },

    /* ============================================================
       NON-MÉTAUX
    ============================================================ */

    {
      id: "soufre",
      name: "Soufre",
      formula: "S",
      cat: "solid",
      chemicalCategory: "nonmetal",
      kind: "solid",
      molarMass: 32.06,
      density: 2.07,
      state: "solid",
      color: "#e6d84c",
      solubility: "insoluble",
      valence: [-2, 4, 6],
      reactiveWith: [
        "oxygene"
      ]
    },

    {
      id: "carbone",
      name: "Carbone",
      formula: "C",
      cat: "solid",
      chemicalCategory: "nonmetal",
      kind: "solid",
      molarMass: 12.011,
      density: 2.267,
      state: "solid",
      color: "#222222",
      solubility: "insoluble",
      valence: [2, 4],
      reactiveWith: [
        "oxygene"
      ]
    },

    {
      id: "iode-solide",
      name: "Iode",
      formula: "I₂",
      cat: "solid",
      chemicalCategory: "halogen",
      kind: "solid",
      molarMass: 253.8089,
      density: 4.93,
      state: "solid",
      color: "#4b245f",
      solubility: "faible",
      valence: [-1, 1, 3, 5, 7],
      reactiveWith: [
        "iodure-potassium"
      ]
    },

    /* ============================================================
       SELS
    ============================================================ */

    {
      id: "chlorure-sodium",
      name: "Chlorure de sodium",
      formula: "NaCl",
      cat: "solid",
      chemicalCategory: "salt",
      kind: "solid",
      molarMass: 58.44,
      density: 2.165,
      state: "solid",
      color: "#f4f4f4",
      solubility: "soluble",
      valence: [1],
      reactiveWith: [
        "nitrate-argent"
      ]
    },

    {
      id: "chlorure-potassium",
      name: "Chlorure de potassium",
      formula: "KCl",
      cat: "solid",
      chemicalCategory: "salt",
      kind: "solid",
      molarMass: 74.5513,
      density: 1.984,
      state: "solid",
      color: "#f5f5f5",
      solubility: "soluble",
      valence: [1],
      reactiveWith: []
    },

    {
      id: "sulfate-sodium",
      name: "Sulfate de sodium",
      formula: "Na₂SO₄",
      cat: "solid",
      chemicalCategory: "salt",
      kind: "solid",
      molarMass: 142.04,
      density: 2.664,
      state: "solid",
      color: "#ffffff",
      solubility: "soluble",
      valence: [1, 2],
      reactiveWith: []
    },

    {
      id: "sulfate-cuivre",
      name: "Sulfate de cuivre(II)",
      formula: "CuSO₄",
      cat: "solid",
      chemicalCategory: "salt",
      kind: "solid",
      molarMass: 159.609,
      density: 3.60,
      state: "solid",
      color: "#3f70c9",
      solubility: "soluble",
      valence: [2],
      reactiveWith: [
        "hydroxyde-sodium",
        "fer",
        "zinc"
      ]
    },

    {
      id: "sulfate-cuivre-pentahydrate",
      name: "Sulfate de cuivre pentahydraté",
      formula: "CuSO₄·5H₂O",
      cat: "solid",
      chemicalCategory: "salt-hydrate",
      kind: "solid",
      molarMass: 249.685,
      density: 2.284,
      state: "solid",
      color: "#2878d0",
      solubility: "soluble",
      valence: [2],
      reactiveWith: [
        "hydroxyde-sodium",
        "fer",
        "zinc"
      ]
    },

    {
      id: "sulfate-fer",
      name: "Sulfate de fer(II)",
      formula: "FeSO₄",
      cat: "solid",
      chemicalCategory: "salt",
      kind: "solid",
      molarMass: 151.908,
      density: 1.90,
      state: "solid",
      color: "#8fa878",
      solubility: "soluble",
      valence: [2],
      reactiveWith: [
        "hydroxyde-sodium"
      ]
    },

    {
      id: "chlorure-fer",
      name: "Chlorure de fer(III)",
      formula: "FeCl₃",
      cat: "solid",
      chemicalCategory: "salt",
      kind: "solid",
      molarMass: 162.204,
      density: 2.90,
      state: "solid",
      color: "#6d5b42",
      solubility: "soluble",
      valence: [3],
      reactiveWith: [
        "hydroxyde-sodium",
        "thiocyanate-potassium"
      ]
    },

    {
      id: "chlorure-fer2",
      name: "Chlorure de fer(II)",
      formula: "FeCl₂",
      cat: "solid",
      chemicalCategory: "salt",
      kind: "solid",
      molarMass: 126.751,
      density: 3.16,
      state: "solid",
      color: "#a9b6a0",
      solubility: "soluble",
      valence: [2],
      reactiveWith: [
        "hydroxyde-sodium"
      ]
    },

    {
      id: "chlorure-calcium",
      name: "Chlorure de calcium",
      formula: "CaCl₂",
      cat: "solid",
      chemicalCategory: "salt",
      kind: "solid",
      molarMass: 110.98,
      density: 2.15,
      state: "solid",
      color: "#eeeeee",
      solubility: "très soluble",
      valence: [2],
      reactiveWith: [
        "carbonate-sodium"
      ]
    },

    {
      id: "carbonate-sodium",
      name: "Carbonate de sodium",
      formula: "Na₂CO₃",
      cat: "solid",
      chemicalCategory: "carbonate",
      kind: "solid",
      molarMass: 105.988,
      density: 2.54,
      state: "solid",
      color: "#ffffff",
      solubility: "soluble",
      valence: [1, 2],
      reactiveWith: [
        "acide-chlorhydrique",
        "acide-sulfurique"
      ]
    },

    {
      id: "bicarbonate-sodium",
      name: "Bicarbonate de sodium",
      formula: "NaHCO₃",
      cat: "solid",
      chemicalCategory: "bicarbonate",
      kind: "solid",
      molarMass: 84.0066,
      density: 2.20,
      state: "solid",
      color: "#ffffff",
      solubility: "soluble",
      valence: [1],
      reactiveWith: [
        "acide-chlorhydrique",
        "acide-acetique",
        "acide-citrique"
      ]
    },

    {
      id: "carbonate-calcium",
      name: "Carbonate de calcium",
      formula: "CaCO₃",
      cat: "solid",
      chemicalCategory: "carbonate",
      kind: "solid",
      molarMass: 100.0869,
      density: 2.71,
      state: "solid",
      color: "#eeeeee",
      solubility: "insoluble",
      valence: [2],
      reactiveWith: [
        "acide-chlorhydrique",
        "acide-sulfurique"
      ]
    },

    {
      id: "carbonate-potassium",
      name: "Carbonate de potassium",
      formula: "K₂CO₃",
      cat: "solid",
      chemicalCategory: "carbonate",
      kind: "solid",
      molarMass: 138.205,
      density: 2.43,
      state: "solid",
      color: "#ffffff",
      solubility: "très soluble",
      valence: [1, 2],
      reactiveWith: [
        "acide-chlorhydrique",
        "acide-sulfurique"
      ]
    },

    {
      id: "nitrate-potassium",
      name: "Nitrate de potassium",
      formula: "KNO₃",
      cat: "solid",
      chemicalCategory: "salt",
      kind: "solid",
      molarMass: 101.1032,
      density: 2.109,
      state: "solid",
      color: "#ffffff",
      solubility: "soluble",
      valence: [1],
      reactiveWith: []
    },

    {
      id: "nitrate-argent",
      name: "Nitrate d'argent",
      formula: "AgNO₃",
      cat: "solid",
      chemicalCategory: "salt",
      kind: "solid",
      molarMass: 169.8731,
      density: 4.35,
      state: "solid",
      color: "#eeeeee",
      solubility: "soluble",
      valence: [1],
      reactiveWith: [
        "chlorure-sodium",
        "cuivre"
      ]
    },

    {
      id: "iodure-potassium",
      name: "Iodure de potassium",
      formula: "KI",
      cat: "solid",
      chemicalCategory: "salt",
      kind: "solid",
      molarMass: 166.0028,
      density: 3.13,
      state: "solid",
      color: "#ffffff",
      solubility: "très soluble",
      valence: [1],
      reactiveWith: [
        "peroxyde-hydrogene"
      ]
    },

    {
      id: "chlorure-ammonium",
      name: "Chlorure d'ammonium",
      formula: "NH₄Cl",
      cat: "solid",
      chemicalCategory: "salt",
      kind: "solid",
      molarMass: 53.491,
      density: 1.53,
      state: "solid",
      color: "#ffffff",
      solubility: "soluble",
      valence: [1],
      reactiveWith: [
        "hydroxyde-sodium"
      ]
    },

    /* ============================================================
       OXYDES
    ============================================================ */

    {
      id: "oxyde-cuivre",
      name: "Oxyde de cuivre(II)",
      formula: "CuO",
      cat: "solid",
      chemicalCategory: "oxide",
      kind: "solid",
      molarMass: 79.545,
      density: 6.31,
      state: "solid",
      color: "#202020",
      solubility: "insoluble",
      valence: [2],
      reactiveWith: [
        "acide-chlorhydrique",
        "acide-sulfurique"
      ]
    },

    {
      id: "oxyde-calcium",
      name: "Oxyde de calcium",
      formula: "CaO",
      cat: "solid",
      chemicalCategory: "oxide",
      kind: "solid",
      molarMass: 56.077,
      density: 3.34,
      state: "solid",
      color: "#eeeeee",
      solubility: "réactif-eau",
      valence: [2],
      reactiveWith: [
        "eau",
        "acide-chlorhydrique"
      ]
    },

    {
      id: "oxyde-magnesium",
      name: "Oxyde de magnésium",
      formula: "MgO",
      cat: "solid",
      chemicalCategory: "oxide",
      kind: "solid",
      molarMass: 40.304,
      density: 3.58,
      state: "solid",
      color: "#ffffff",
      solubility: "faiblement soluble",
      valence: [2],
      reactiveWith: [
        "acide-chlorhydrique"
      ]
    },

    {
      id: "oxyde-fer3",
      name: "Oxyde de fer(III)",
      formula: "Fe₂O₃",
      cat: "solid",
      chemicalCategory: "oxide",
      kind: "solid",
      molarMass: 159.687,
      density: 5.24,
      state: "solid",
      color: "#8b3a2b",
      solubility: "insoluble",
      valence: [3],
      reactiveWith: [
        "acide-chlorhydrique"
      ]
    },

    {
      id: "oxyde-fer2-3",
      name: "Oxyde de fer magnétique",
      formula: "Fe₃O₄",
      cat: "solid",
      chemicalCategory: "oxide",
      kind: "solid",
      molarMass: 231.533,
      density: 5.17,
      state: "solid",
      color: "#202020",
      solubility: "insoluble",
      valence: [2, 3],
      reactiveWith: [
        "acide-chlorhydrique"
      ]
    },

    /* ============================================================
       ACIDES
    ============================================================ */

    {
      id: "acide-chlorhydrique",
      name: "Acide chlorhydrique",
      formula: "HCl",
      cat: "reagent",
      chemicalCategory: "acid",
      kind: "liquid",
      molarMass: 36.4609,
      density: 1.18,
      state: "liquid",
      color: "#e8f7ff",
      solubility: "miscible",
      valence: [1],
      reactiveWith: [
        "hydroxyde-sodium",
        "bicarbonate-sodium",
        "carbonate-sodium",
        "carbonate-calcium",
        "oxyde-calcium",
        "oxyde-cuivre",
        "fer",
        "zinc",
        "magnesium"
      ]
    },

    {
      id: "acide-sulfurique",
      name: "Acide sulfurique",
      formula: "H₂SO₄",
      cat: "reagent",
      chemicalCategory: "acid",
      kind: "liquid",
      molarMass: 98.079,
      density: 1.84,
      state: "liquid",
      color: "#f4f4ef",
      solubility: "miscible",
      valence: [2],
      reactiveWith: [
        "hydroxyde-sodium",
        "carbonate-sodium",
        "carbonate-calcium",
        "zinc",
        "magnesium"
      ]
    },

    {
      id: "acide-nitrique",
      name: "Acide nitrique",
      formula: "HNO₃",
      cat: "reagent",
      chemicalCategory: "acid",
      kind: "liquid",
      molarMass: 63.012,
      density: 1.51,
      state: "liquid",
      color: "#f5f5ee",
      solubility: "miscible",
      valence: [1],
      reactiveWith: [
        "cuivre",
        "argent"
      ]
    },

    {
      id: "acide-acetique",
      name: "Acide acétique",
      formula: "CH₃COOH",
      cat: "reagent",
      chemicalCategory: "acid",
      kind: "liquid",
      molarMass: 60.052,
      density: 1.049,
      state: "liquid",
      color: "#ffffff",
      solubility: "miscible",
      valence: [1],
      reactiveWith: [
        "bicarbonate-sodium"
      ]
    },

    {
      id: "acide-citrique",
      name: "Acide citrique",
      formula: "C₆H₈O₇",
      cat: "solid",
      chemicalCategory: "organic-acid",
      kind: "solid",
      molarMass: 192.124,
      density: 1.665,
      state: "solid",
      color: "#ffffff",
      solubility: "très soluble",
      valence: [1, 2, 3],
      reactiveWith: [
        "bicarbonate-sodium"
      ]
    },

    {
      id: "acide-phosphorique",
      name: "Acide phosphorique",
      formula: "H₃PO₄",
      cat: "reagent",
      chemicalCategory: "acid",
      kind: "liquid",
      molarMass: 97.994,
      density: 1.885,
      state: "liquid",
      color: "#ffffff",
      solubility: "miscible",
      valence: [1, 2, 3],
      reactiveWith: [
        "hydroxyde-sodium"
      ]
    },

    /* ============================================================
       BASES
    ============================================================ */

    {
      id: "hydroxyde-sodium",
      name: "Hydroxyde de sodium",
      formula: "NaOH",
      cat: "reagent",
      chemicalCategory: "base",
      kind: "solid",
      molarMass: 39.997,
      density: 2.13,
      state: "solid",
      color: "#ffffff",
      solubility: "très soluble",
      valence: [1],
      reactiveWith: [
        "acide-chlorhydrique",
        "acide-sulfurique",
        "acide-nitrique",
        "acide-phosphorique",
        "sulfate-cuivre",
        "chlorure-ammonium"
      ]
    },

    {
      id: "hydroxyde-potassium",
      name: "Hydroxyde de potassium",
      formula: "KOH",
      cat: "reagent",
      chemicalCategory: "base",
      kind: "solid",
      molarMass: 56.1056,
      density: 2.044,
      state: "solid",
      color: "#ffffff",
      solubility: "très soluble",
      valence: [1],
      reactiveWith: [
        "acide-chlorhydrique",
        "acide-sulfurique"
      ]
    },

    {
      id: "hydroxyde-calcium",
      name: "Hydroxyde de calcium",
      formula: "Ca(OH)₂",
      cat: "solid",
      chemicalCategory: "base",
      kind: "solid",
      molarMass: 74.092,
      density: 2.211,
      state: "solid",
      color: "#ffffff",
      solubility: "faiblement soluble",
      valence: [2],
      reactiveWith: [
        "acide-chlorhydrique",
        "acide-sulfurique"
      ]
    },

    {
      id: "ammoniac-aqueux",
      name: "Solution d'ammoniac",
      formula: "NH₃(aq)",
      cat: "reagent",
      chemicalCategory: "base",
      kind: "liquid",
      molarMass: 17.031,
      density: 0.91,
      state: "liquid",
      color: "#eefaff",
      solubility: "miscible",
      valence: [3],
      reactiveWith: [
        "acide-chlorhydrique",
        "acide-sulfurique"
      ]
    },

    /* ============================================================
       EAU / LIQUIDES / SOLVANTS
    ============================================================ */

    {
      id: "eau",
      name: "Eau distillée",
      formula: "H₂O",
      cat: "reagent",
      chemicalCategory: "solvent",
      kind: "liquid",
      molarMass: 18.01528,
      density: 0.997,
      state: "liquid",
      color: "#bfe8ff",
      solubility: "miscible",
      valence: [1, 2],
      reactiveWith: [
        "oxyde-calcium",
        "calcium"
      ]
    },

    {
      id: "ethanol",
      name: "Éthanol",
      formula: "C₂H₅OH",
      cat: "reagent",
      chemicalCategory: "solvent",
      kind: "liquid",
      molarMass: 46.068,
      density: 0.789,
      state: "liquid",
      color: "#f4fbff",
      solubility: "miscible",
      valence: [1],
      reactiveWith: []
    },

    {
      id: "acetone",
      name: "Acétone",
      formula: "C₃H₆O",
      cat: "reagent",
      chemicalCategory: "solvent",
      kind: "liquid",
      molarMass: 58.080,
      density: 0.7845,
      state: "liquid",
      color: "#ffffff",
      solubility: "miscible",
      valence: [1],
      reactiveWith: []
    },

    {
      id: "glycerol",
      name: "Glycérol",
      formula: "C₃H₈O₃",
      cat: "reagent",
      chemicalCategory: "solvent",
      kind: "liquid",
      molarMass: 92.094,
      density: 1.261,
      state: "liquid",
      color: "#f7fbff",
      solubility: "miscible",
      valence: [1],
      reactiveWith: []
    },

    {
      id: "huile-vegetale",
      name: "Huile végétale",
      formula: "mélange",
      cat: "reagent",
      chemicalCategory: "organic-liquid",
      kind: "liquid",
      density: 0.92,
      state: "liquid",
      color: "#e9d46a",
      solubility: "insoluble-eau",
      valence: [],
      reactiveWith: []
    },

    /* ============================================================
       GAZ
    ============================================================ */

    {
      id: "dioxyde-carbone",
      name: "Dioxyde de carbone",
      formula: "CO₂",
      cat: "reagent",
      chemicalCategory: "gas",
      kind: "gas",
      molarMass: 44.0095,
      density: 1.977,
      state: "gas",
      color: "#d9eef7",
      solubility: "soluble",
      valence: [4],
      reactiveWith: [
        "hydroxyde-sodium",
        "eau"
      ]
    },

    {
      id: "oxygene",
      name: "Oxygène",
      formula: "O₂",
      cat: "reagent",
      chemicalCategory: "gas",
      kind: "gas",
      molarMass: 31.998,
      density: 1.429,
      state: "gas",
      color: "#dcefff",
      solubility: "faible",
      valence: [-2],
      reactiveWith: [
        "fer",
        "soufre",
        "carbone"
      ]
    },

    {
      id: "hydrogene",
      name: "Hydrogène",
      formula: "H₂",
      cat: "reagent",
      chemicalCategory: "gas",
      kind: "gas",
      molarMass: 2.016,
      density: 0.0899,
      state: "gas",
      color: "#f5fbff",
      solubility: "faible",
      valence: [1, -1],
      reactiveWith: [
        "oxygene"
      ]
    },

    {
      id: "ammoniac-gaz",
      name: "Ammoniac",
      formula: "NH₃",
      cat: "reagent",
      chemicalCategory: "gas",
      kind: "gas",
      molarMass: 17.031,
      density: 0.769,
      state: "gas",
      color: "#eefaff",
      solubility: "très soluble",
      valence: [-3, 3],
      reactiveWith: [
        "acide-chlorhydrique"
      ]
    },

    /* ============================================================
       PEROXYDE / OXYDANTS
    ============================================================ */

    {
      id: "peroxyde-hydrogene",
      name: "Peroxyde d'hydrogène",
      formula: "H₂O₂",
      cat: "reagent",
      chemicalCategory: "oxidizer",
      kind: "liquid",
      molarMass: 34.0147,
      density: 1.45,
      state: "liquid",
      color: "#eaf8ff",
      solubility: "miscible",
      valence: [-1],
      reactiveWith: [
        "iodure-potassium"
      ]
    },

    /* ============================================================
       INDICATEURS
    ============================================================ */

    {
      id: "phenolphtaleine",
      name: "Phénolphtaléine",
      formula: "C₂₀H₁₂O₄",
      cat: "reagent",
      chemicalCategory: "indicator",
      kind: "liquid",
      molarMass: 318.326,
      density: 1.277,
      state: "liquid",
      color: "#f8f8ff",
      solubility: "faible",
      valence: [],
      reactiveWith: [
        "hydroxyde-sodium"
      ]
    },

    {
      id: "orange-methyl",
      name: "Orange de méthyle",
      formula: "C₁₄H₁₄N₃NaO₃S",
      cat: "reagent",
      chemicalCategory: "indicator",
      kind: "liquid",
      molarMass: 327.334,
      density: 1.28,
      state: "liquid",
      color: "#f08b22",
      solubility: "soluble",
      valence: [],
      reactiveWith: [
        "acide-chlorhydrique",
        "hydroxyde-sodium"
      ]
    },

    {
      id: "bleu-bromothymol",
      name: "Bleu de bromothymol",
      formula: "C₂₇H₂₈Br₂O₅S",
      cat: "reagent",
      chemicalCategory: "indicator",
      kind: "liquid",
      molarMass: 624.38,
      density: 1.25,
      state: "liquid",
      color: "#f0e65a",
      solubility: "faible",
      valence: [],
      reactiveWith: [
        "acide-chlorhydrique",
        "hydroxyde-sodium"
      ]
    },

    {
      id: "indicateur-universel",
      name: "Indicateur universel",
      formula: "mélange",
      cat: "reagent",
      chemicalCategory: "indicator",
      kind: "liquid",
      density: 1.00,
      state: "liquid",
      color: "#6f8cff",
      solubility: "miscible",
      valence: [],
      reactiveWith: []
    },

    {
      id: "papier-tournesol",
      name: "Papier tournesol",
      formula: "indicateur",
      cat: "solid",
      chemicalCategory: "indicator",
      kind: "solid",
      state: "solid",
      color: "#7050a8",
      solubility: "réactif",
      valence: [],
      reactiveWith: [
        "acide-chlorhydrique",
        "hydroxyde-sodium"
      ]
    },

    /* ============================================================
       VERRERIE
    ============================================================ */

    {
      id: "becher-50",
      name: "Bécher 50 mL",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 50,
      state: "empty",
      color: "#dcefff"
    },

    {
      id: "becher-100",
      name: "Bécher 100 mL",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 100,
      state: "empty",
      color: "#dcefff"
    },

    {
      id: "becher-250",
      name: "Bécher 250 mL",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 250,
      state: "empty",
      color: "#dcefff"
    },

    {
      id: "becher-500",
      name: "Bécher 500 mL",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 500,
      state: "empty",
      color: "#dcefff"
    },

    {
      id: "erlenmeyer-100",
      name: "Erlenmeyer 100 mL",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 100,
      state: "empty",
      color: "#dcefff"
    },

    {
      id: "erlenmeyer-250",
      name: "Erlenmeyer 250 mL",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 250,
      state: "empty",
      color: "#dcefff"
    },

    {
      id: "erlenmeyer-500",
      name: "Erlenmeyer 500 mL",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 500,
      state: "empty",
      color: "#dcefff"
    },

    {
      id: "fiole-jaugee-100",
      name: "Fiole jaugée 100 mL",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 100,
      state: "empty",
      color: "#dcefff"
    },

    {
      id: "eprouvette-10",
      name: "Éprouvette graduée 10 mL",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 10,
      state: "empty",
      color: "#dcefff"
    },

    {
      id: "eprouvette-50",
      name: "Éprouvette graduée 50 mL",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 50,
      state: "empty",
      color: "#dcefff"
    },

    {
      id: "eprouvette-100",
      name: "Éprouvette graduée 100 mL",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 100,
      state: "empty",
      color: "#dcefff"
    },

    {
      id: "tube-essai",
      name: "Tube à essai",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 20,
      state: "empty",
      color: "#dcefff"
    },

    {
      id: "tube-essai-grand",
      name: "Grand tube à essai",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 30,
      state: "empty",
      color: "#dcefff"
    },

    {
      id: "pipette-10",
      name: "Pipette graduée 10 mL",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 10,
      state: "empty",
      color: "#e8f6ff"
    },

    {
      id: "pipette-25",
      name: "Pipette graduée 25 mL",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 25,
      state: "empty",
      color: "#e8f6ff"
    },

    {
      id: "burette-50",
      name: "Burette 50 mL",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 50,
      state: "empty",
      color: "#e8f6ff"
    },

    {
      id: "fiole-erlenmeyer-1000",
      name: "Erlenmeyer 1 L",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "container",
      capacity: 1000,
      state: "empty",
      color: "#dcefff"
    },

    {
      id: "verre-montre",
      name: "Verre de montre",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "dish",
      capacity: 30,
      state: "empty",
      color: "#e5f5ff"
    },

    {
      id: "entonnoir",
      name: "Entonnoir",
      formula: "",
      cat: "glassware",
      chemicalCategory: "glassware",
      kind: "transfer",
      capacity: 100,
      state: "empty",
      color: "#dcefff"
    },

    /* ============================================================
       INSTRUMENTS
    ============================================================ */

    {
      id: "balance",
      name: "Balance électronique",
      formula: "",
      cat: "instrument",
      chemicalCategory: "measurement",
      kind: "instrument",
      state: "ready",
      color: "#aeb5bd"
    },

    {
      id: "thermometre",
      name: "Thermomètre",
      formula: "",
      cat: "instrument",
      chemicalCategory: "measurement",
      kind: "instrument",
      state: "ready",
      color: "#d8e7f0"
    },

    {
      id: "ph-metre",
      name: "pH-mètre",
      formula: "",
      cat: "instrument",
      chemicalCategory: "measurement",
      kind: "instrument",
      state: "ready",
      color: "#e7eef3"
    },

    {
      id: "conductimetre",
      name: "Conductimètre",
      formula: "",
      cat: "instrument",
      chemicalCategory: "measurement",
      kind: "instrument",
      state: "ready",
      color: "#cfd8df"
    },

    {
      id: "chronometre",
      name: "Chronomètre",
      formula: "",
      cat: "instrument",
      chemicalCategory: "measurement",
      kind: "instrument",
      state: "ready",
      color: "#c4cbd1"
    },

    {
      id: "agitateur-magnetique",
      name: "Agitateur magnétique",
      formula: "",
      cat: "instrument",
      chemicalCategory: "mixing",
      kind: "instrument",
      state: "ready",
      color: "#9da5ad"
    },

    /* ============================================================
       ÉQUIPEMENTS
    ============================================================ */

    {
      id: "bec-bunsen",
      name: "Bec Bunsen",
      formula: "",
      cat: "equipment",
      chemicalCategory: "heating",
      kind: "equipment",
      state: "off",
      color: "#60666b"
    },

    {
      id: "plaque-chauffante",
      name: "Plaque chauffante",
      formula: "",
      cat: "equipment",
      chemicalCategory: "heating",
      kind: "equipment",
      state: "off",
      color: "#34383c"
    },

    {
      id: "trepied",
      name: "Trépied de laboratoire",
      formula: "",
      cat: "equipment",
      chemicalCategory: "support",
      kind: "equipment",
      state: "ready",
      color: "#454a4e"
    },

    {
      id: "support-universel",
      name: "Support universel",
      formula: "",
      cat: "equipment",
      chemicalCategory: "support",
      kind: "equipment",
      state: "ready",
      color: "#4b5054"
    },

    {
      id: "pince-creuset",
      name: "Pince à creuset",
      formula: "",
      cat: "equipment",
      chemicalCategory: "handling",
      kind: "equipment",
      state: "ready",
      color: "#777b7f"
    },

    {
      id: "porte-tubes",
      name: "Porte-tubes",
      formula: "",
      cat: "equipment",
      chemicalCategory: "support",
      kind: "equipment",
      state: "ready",
      color: "#666b70"
    },

    {
      id: "mortier",
      name: "Mortier",
      formula: "",
      cat: "equipment",
      chemicalCategory: "preparation",
      kind: "equipment",
      state: "ready",
      color: "#b4b4b4"
    },

    {
      id: "pilon",
      name: "Pilon",
      formula: "",
      cat: "equipment",
      chemicalCategory: "preparation",
      kind: "equipment",
      state: "ready",
      color: "#999999"
    },

    {
      id: "spatule",
      name: "Spatule",
      formula: "",
      cat: "equipment",
      chemicalCategory: "handling",
      kind: "equipment",
      state: "ready",
      color: "#a7adb2"
    },

    {
      id: "pissette",
      name: "Pissette",
      formula: "",
      cat: "equipment",
      chemicalCategory: "washing",
      kind: "equipment",
      state: "ready",
      color: "#d8f0ff"
    },

    {
      id: "lunettes-securite",
      name: "Lunettes de sécurité",
      formula: "",
      cat: "equipment",
      chemicalCategory: "safety",
      kind: "equipment",
      state: "ready",
      color: "#b9d9e8"
    },

    {
      id: "gants-laboratoire",
      name: "Gants de laboratoire",
      formula: "",
      cat: "equipment",
      chemicalCategory: "safety",
      kind: "equipment",
      state: "ready",
      color: "#d6d6d6"
    }
  ];

  /* ================================================================
     FONCTIONS DE BASE DE LA BIBLIOTHÈQUE
  ================================================================ */

  const materialById = id =>
    M.find(material => material.id === id) || null;

  const materialName = id =>
    materialById(id)?.name || id;

  const isContainer = object => {
    if (!object) return false;

    const material = materialById(object.materialId);

    return Boolean(
      object.capacity ||
      material?.capacity ||
      material?.kind === "container" ||
      material?.kind === "dish"
    );
  };

  const createComposition = () => ({
    components: {},
    totalMass: 0,
    totalVolume: 0
  });

  const createObject = (materialId, x = 100, y = 100) => {
    const material = materialById(materialId);

    if (!material) {
      return null;
    }

    const container =
      material.kind === "container" ||
      material.kind === "dish";

    return {
      id: uid("obj"),
      materialId,
      name: material.name,
      formula: material.formula || "",
      cat: material.cat,
      kind: material.kind,
      state: material.state || "ready",

      x,
      y,

      width: container ? 130 : 90,
      height: container ? 100 : 90,

      capacity:
        num(material.capacity, 0),

      temperature: 25,

      mass:
        num(material.molarMass, 0) > 0
          ? 0
          : 0,

      volume: 0,

      density:
        num(material.density, 0),

      pH:
        material.chemicalCategory === "acid"
          ? 2
          : material.chemicalCategory === "base"
            ? 12
            : 7,

      color:
        material.color ||
        "#dfe8ee",

      composition:
        createComposition(),

      mixed: false,

      reaction: {
        active: false,
        title: "",
        equation: "",
        phase: "",
        gas: "",
        precipitate: "",
        color: ""
      },

      measurement: {
        label: "",
        value: 0,
        unit: "",
        precision: 0
      }
    };
  };

  /* ================================================================
     ÉTAT INITIAL / OBJETS
  ================================================================ */

  function selectedObject() {
    return S.objects.find(
      object => object.id === S.selectedId
    ) || null;
  }

  function findObject(id) {
    return S.objects.find(
      object => object.id === id
    ) || null;
  }

  function setSelected(id) {
    S.selectedId = id || null;
    render();
  }

  /* ================================================================
     TOAST / JOURNAL D'OBSERVATION
  ================================================================ */

  function log(message, type = "info") {
    if (!E.observationLog) return;

    const item = document.createElement("div");

    item.className =
      `observation-entry observation-${type}`;

    item.textContent =
      `[${new Date().toLocaleTimeString()}] ${message}`;

    E.observationLog.prepend(item);

    while (
      E.observationLog.children.length > 80
    ) {
      E.observationLog.lastElementChild.remove();
    }

    if (E.chemLiveRegion) {
      E.chemLiveRegion.textContent = message;
    }
  }

  function toast(message, type = "info") {
    if (!E.chemToastStack) {
      log(message, type);
      return;
    }

    const item = document.createElement("div");

    item.className =
      `chem-toast chem-toast-${type}`;

    item.textContent = message;

    E.chemToastStack.appendChild(item);

    setTimeout(() => {
      item.remove();
    }, 3200);
  }

  /* ================================================================
     MODALES
  ================================================================ */

  function modal(node, visible) {
    if (!node) return;

    node.classList.toggle(
      "is-open",
      Boolean(visible)
    );

    node.setAttribute(
      "aria-hidden",
      visible ? "false" : "true"
    );
  }

  function openLibrary() {
    modal(E.materialsPanel, true);
    modal(E.materialsBackdrop, true);
  }

  function closeLibrary() {
    modal(E.materialsPanel, false);
    modal(E.materialsBackdrop, false);
  }

  /* ================================================================
     CALCULS CHIMIQUES
  ================================================================ */

  function calculateMass(object) {
    if (!object) return 0;

    let mass = num(object.mass);

    if (
      object.composition &&
      object.composition.components
    ) {
      mass = Object.entries(
        object.composition.components
      ).reduce((sum, [id, quantity]) => {
        const material = materialById(id);

        if (!material) {
          return sum;
        }

        const q = num(quantity);

        if (
          material.density &&
          material.kind === "liquid"
        ) {
          return sum + q * material.density;
        }

        if (material.molarMass) {
          return sum + q * material.molarMass;
        }

        return sum;
      }, 0);
    }

    return round(mass, 3);
  }

  function calculateVolume(object) {
    if (!object) return 0;

    return round(
      num(object.volume) ||
      num(object.composition?.totalVolume),
      2
    );
  }

  function calculatePH(object) {
    if (!object) return 7;

    if (
      object.reaction &&
      Number.isFinite(object.reaction.ph)
    ) {
      return object.reaction.ph;
    }

    const components =
      Object.keys(
        object.composition?.components || {}
      );

    if (!components.length) {
      return 7;
    }

    const materials =
      components
        .map(materialById)
        .filter(Boolean);

    const acid =
      materials.find(
        material =>
          material.chemicalCategory === "acid"
      );

    const base =
      materials.find(
        material =>
          material.chemicalCategory === "base"
      );

    if (acid && base) {
      return 7;
    }

    if (acid) {
      return num(acid.ph, 2);
    }

    if (base) {
      return num(base.ph, 12);
    }

    return 7;
  }

  /* ================================================================
     AJOUT D'UN MATÉRIAU DANS LE LABORATOIRE
  ================================================================ */

  function add(materialId, x = null, y = null) {
    const material = materialById(materialId);

    if (!material) {
      toast(
        `Matériau introuvable : ${materialId}`,
        "error"
      );
      return null;
    }

    const workspace =
      E.workspaceObjects ||
      E.laboratoryWorkspace;

    const rect =
      workspace?.getBoundingClientRect();

    const defaultX =
      rect
        ? Math.max(20, rect.width / 2 - 60)
        : 120;

    const defaultY =
      rect
        ? Math.max(20, rect.height / 2 - 50)
        : 120;

    const object = createObject(
      materialId,
      x ?? defaultX,
      y ?? defaultY
    );

    if (!object) {
      return null;
    }

    S.objects.push(object);

    S.selectedId = object.id;

    render();

    log(
      `${material.name} ajouté au laboratoire.`,
      "success"
    );

    return object;
  }

  /* ================================================================
     SUPPRESSION
  ================================================================ */

  function remove(id) {
    const index =
      S.objects.findIndex(
        object => object.id === id
      );

    if (index < 0) {
      return false;
    }

    const object =
      S.objects[index];

    S.objects.splice(index, 1);

    if (S.selectedId === id) {
      S.selectedId = null;
    }

    render();

    log(
      `${object.name} retiré du laboratoire.`,
      "warning"
    );

    return true;
  }

  /* ================================================================
     MISE À JOUR DES PROPRIÉTÉS
  ================================================================ */

  function updateObject(object) {
    if (!object) return;

    object.mass =
      calculateMass(object);

    object.volume =
      calculateVolume(object);

    object.pH =
      calculatePH(object);

    object.density =
      object.volume > 0
        ? round(object.mass / object.volume, 4)
        : num(
            materialById(object.materialId)?.density
          );

    if (
      object.temperature < -273
    ) {
      object.temperature = -273;
    }

    if (
      object.temperature > 500
    ) {
      object.temperature = 500;
    }
  }

  /* ================================================================
     TRANSFERT DE COMPOSANTS
  ================================================================ */

  function transfer(
    sourceId,
    targetId,
    amount
  ) {
    const source =
      findObject(sourceId);

    const target =
      findObject(targetId);

    const quantity =
      num(amount);

    if (!source || !target) {
      toast(
        "Source ou cible introuvable.",
        "error"
      );
      return false;
    }

    if (source.id === target.id) {
      toast(
        "La source et la cible doivent être différentes.",
        "warning"
      );
      return false;
    }

    if (!isContainer(target)) {
      toast(
        "La cible doit être un récipient.",
        "warning"
      );
      return false;
    }

    if (quantity <= 0) {
      toast(
        "La quantité transférée doit être positive.",
        "warning"
      );
      return false;
    }

    const available =
      calculateVolume(source);

    if (quantity > available) {
      toast(
        `Volume disponible : ${available} mL.`,
        "warning"
      );
      return false;
    }

    const targetVolume =
      calculateVolume(target);

    const capacity =
      num(target.capacity);

    if (
      capacity > 0 &&
      targetVolume + quantity > capacity
    ) {
      toast(
        "La capacité du récipient cible est dépassée.",
        "error"
      );
      return false;
    }

    const components =
      source.composition?.components || {};

    const entries =
      Object.entries(components);

    if (!entries.length) {
      toast(
        "La source ne contient aucun composant transférable.",
        "warning"
      );
      return false;
    }

    const ratio =
      available > 0
        ? quantity / available
        : 0;

    entries.forEach(
      ([materialId, amountValue]) => {
        const transferred =
          num(amountValue) * ratio;

        if (transferred <= 0) {
          return;
        }

        target.composition.components[materialId] =
          num(
            target.composition.components[materialId]
          ) + transferred;

        source.composition.components[materialId] =
          num(amountValue) - transferred;

        if (
          source.composition.components[materialId]
          <= 0.000001
        ) {
          delete source.composition.components[
            materialId
          ];
        }
      }
    );

    source.composition.totalVolume =
      Math.max(
        0,
        num(source.composition.totalVolume) -
          quantity
      );

    target.composition.totalVolume =
      num(target.composition.totalVolume) +
      quantity;

    source.volume =
      source.composition.totalVolume;

    target.volume =
      target.composition.totalVolume;

    updateObject(source);
    updateObject(target);

    log(
      `${round(quantity, 2)} mL transférés de ${source.name} vers ${target.name}.`,
      "success"
    );

    render();

    return true;
  }

  /* ================================================================
     MÉLANGE
  ================================================================ */

  function mix(objectId = S.selectedId) {
    const object =
      findObject(objectId);

    if (!object) {
      toast(
        "Aucun objet sélectionné.",
        "warning"
      );
      return false;
    }

    if (!isContainer(object)) {
      toast(
        "Sélectionnez un récipient pour mélanger.",
        "warning"
      );
      return false;
    }

    object.mixed = true;

    object.state =
      "mélangé";

    updateObject(object);

    log(
      `${object.name} a été mélangé.`,
      "success"
    );

    render();

    return true;
  }

  /* ================================================================
     CHAUFFAGE
  ================================================================ */

  function heat(
    objectId = S.selectedId,
    delta = 25
  ) {
    const object =
      findObject(objectId);

    if (!object) {
      toast(
        "Aucun objet sélectionné.",
        "warning"
      );
      return false;
    }

    object.temperature =
      clamp(
        num(object.temperature, 25) +
          num(delta, 25),
        -273,
        500
      );

    object.state =
      "chauffé";

    updateObject(object);

    log(
      `${object.name} chauffé à ${round(object.temperature, 1)} °C.`,
      "success"
    );

    render();

    return true;
  }

  /* ================================================================
     RÉACTIONS CHIMIQUES
  ================================================================ */

  const R = [
    {
      id: "neutralisation-hcl-naoh",
      names: [
        "acide-chlorhydrique",
        "hydroxyde-sodium"
      ],
      title: "Neutralisation acide-base",
      eq: "HCl + NaOH → NaCl + H₂O",
      products: [
        "chlorure-sodium",
        "eau"
      ],
      obs: "Neutralisation avec évolution du pH vers la neutralité.",
      ph: 7,
      gas: "",
      precipitate: "",
      color: ""
    },

    {
      id: "hcl-bicarbonate",
      names: [
        "acide-chlorhydrique",
        "bicarbonate-sodium"
      ],
      title: "Acide chlorhydrique + bicarbonate de sodium",
      eq: "HCl + NaHCO₃ → NaCl + H₂O + CO₂↑",
      products: [
        "chlorure-sodium",
        "eau",
        "dioxyde-carbone"
      ],
      obs: "Effervescence avec dégagement de dioxyde de carbone.",
      ph: 5,
      gas: "CO₂",
      precipitate: "",
      color: ""
    },

    {
      id: "hcl-carbonate-sodium",
      names: [
        "acide-chlorhydrique",
        "carbonate-sodium"
      ],
      title: "Acide chlorhydrique + carbonate de sodium",
      eq: "2HCl + Na₂CO₃ → 2NaCl + H₂O + CO₂↑",
      products: [
        "chlorure-sodium",
        "eau",
        "dioxyde-carbone"
      ],
      obs: "Forte effervescence et dégagement de CO₂.",
      ph: 5,
      gas: "CO₂",
      precipitate: "",
      color: ""
    },

    {
      id: "acide-acetique-bicarbonate",
      names: [
        "acide-acetique",
        "bicarbonate-sodium"
      ],
      title: "Acide acétique + bicarbonate",
      eq: "CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂↑",
      products: [
        "eau",
        "dioxyde-carbone"
      ],
      obs: "Effervescence visible avec dégagement de CO₂.",
      ph: 6,
      gas: "CO₂",
      precipitate: "",
      color: ""
    },

    {
      id: "h2so4-naoh",
      names: [
        "acide-sulfurique",
        "hydroxyde-sodium"
      ],
      title: "Neutralisation par acide sulfurique",
      eq: "H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O",
      products: [
        "sulfate-sodium",
        "eau"
      ],
      obs: "Neutralisation exothermique.",
      ph: 7,
      gas: "",
      precipitate: "",
      color: ""
    },

    {
      id: "hno3-naoh",
      names: [
        "acide-nitrique",
        "hydroxyde-sodium"
      ],
      title: "Neutralisation acide nitrique",
      eq: "HNO₃ + NaOH → NaNO₃ + H₂O",
      products: [
        "eau"
      ],
      obs: "Neutralisation acide-base.",
      ph: 7,
      gas: "",
      precipitate: "",
      color: ""
    },

    {
      id: "hcl-caoh2",
      names: [
        "acide-chlorhydrique",
        "hydroxyde-calcium"
      ],
      title: "Acide chlorhydrique + hydroxyde de calcium",
      eq: "2HCl + Ca(OH)₂ → CaCl₂ + 2H₂O",
      products: [
        "chlorure-calcium",
        "eau"
      ],
      obs: "Neutralisation acide-base.",
      ph: 7,
      gas: "",
      precipitate: "",
      color: ""
    },

    {
      id: "hcl-caco3",
      names: [
        "acide-chlorhydrique",
        "carbonate-calcium"
      ],
      title: "Acide chlorhydrique + carbonate de calcium",
      eq: "2HCl + CaCO₃ → CaCl₂ + H₂O + CO₂↑",
      products: [
        "chlorure-calcium",
        "eau",
        "dioxyde-carbone"
      ],
      obs: "Effervescence avec dégagement de CO₂.",
      ph: 5,
      gas: "CO₂",
      precipitate: "",
      color: ""
    },

    {
      id: "hcl-cao",
      names: [
        "acide-chlorhydrique",
        "oxyde-calcium"
      ],
      title: "Acide chlorhydrique + oxyde de calcium",
      eq: "2HCl + CaO → CaCl₂ + H₂O",
      products: [
        "chlorure-calcium",
        "eau"
      ],
      obs: "Réaction acide-base exothermique.",
      ph: 7,
      gas: "",
      precipitate: "",
      color: ""
    },

    {
      id: "agno3-nacl",
      names: [
        "nitrate-argent",
        "chlorure-sodium"
      ],
      title: "Précipitation du chlorure d'argent",
      eq: "AgNO₃ + NaCl → AgCl↓ + NaNO₃",
      products: [],
      obs: "Formation d'un précipité blanc de chlorure d'argent.",
      ph: 7,
      gas: "",
      precipitate: "AgCl",
      color: "#ffffff"
    },

    {
      id: "cuso4-naoh",
      names: [
        "sulfate-cuivre",
        "hydroxyde-sodium"
      ],
      title: "Précipitation de l'hydroxyde de cuivre",
      eq: "CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄",
      products: [],
      obs: "Formation d'un précipité bleu.",
      ph: 8,
      gas: "",
      precipitate: "Cu(OH)₂",
      color: "#2485d1"
    },

    {
      id: "fer-cuso4",
      names: [
        "fer",
        "sulfate-cuivre"
      ],
      title: "Déplacement du cuivre par le fer",
      eq: "Fe + CuSO₄ → FeSO₄ + Cu",
      products: [
        "sulfate-fer",
        "cuivre"
      ],
      obs: "Dépôt de cuivre et changement progressif de couleur de la solution.",
      ph: 6,
      gas: "",
      precipitate: "Cu",
      color: "#b87333"
    },

    {
      id: "zinc-cuso4",
      names: [
        "zinc",
        "sulfate-cuivre"
      ],
      title: "Déplacement du cuivre par le zinc",
      eq: "Zn + CuSO₄ → ZnSO₄ + Cu",
      products: [],
      obs: "Dépôt de cuivre métallique sur le zinc.",
      ph: 7,
      gas: "",
      precipitate: "Cu",
      color: "#b87333"
    },

    {
      id: "h2o2-ki",
      names: [
        "peroxyde-hydrogene",
        "iodure-potassium"
      ],
      title: "Réaction modèle du peroxyde avec l'iodure",
      eq: "H₂O₂ + I⁻ → réaction d'oxydoréduction",
      products: [],
      obs: "Réaction d'oxydoréduction modélisée.",
      ph: 7,
      gas: "",
      precipitate: "",
      color: "#d8a83b"
    },

    {
      id: "citrique-bicarbonate",
      names: [
        "acide-citrique",
        "bicarbonate-sodium"
      ],
      title: "Acide citrique + bicarbonate",
      eq: "Acide citrique + NaHCO₃ → citrate + H₂O + CO₂↑",
      products: [
        "eau",
        "dioxyde-carbone"
      ],
      obs: "Effervescence importante.",
      ph: 5,
      gas: "CO₂",
      precipitate: "",
      color: ""
    },

    {
      id: "h2so4-carbonate",
      names: [
        "acide-sulfurique",
        "carbonate-sodium"
      ],
      title: "Acide sulfurique + carbonate de sodium",
      eq: "H₂SO₄ + Na₂CO₃ → Na₂SO₄ + H₂O + CO₂↑",
      products: [
        "sulfate-sodium",
        "eau",
        "dioxyde-carbone"
      ],
      obs: "Effervescence et dégagement de CO₂.",
      ph: 5,
      gas: "CO₂",
      precipitate: "",
      color: ""
    },

    {
      id: "h2so4-caco3",
      names: [
        "acide-sulfurique",
        "carbonate-calcium"
      ],
      title: "Acide sulfurique + carbonate de calcium",
      eq: "H₂SO₄ + CaCO₃ → CaSO₄↓ + H₂O + CO₂↑",
      products: [
        "eau",
        "dioxyde-carbone"
      ],
      obs: "Effervescence et formation de sulfate de calcium peu soluble.",
      ph: 5,
      gas: "CO₂",
      precipitate: "CaSO₄",
      color: "#eeeeee"
    },

    {
      id: "naoh-nh4cl",
      names: [
        "hydroxyde-sodium",
        "chlorure-ammonium"
      ],
      title: "Hydroxyde de sodium + chlorure d'ammonium",
      eq: "NaOH + NH₄Cl → NH₃↑ + H₂O + NaCl",
      products: [
        "ammoniac-gaz",
        "eau",
        "chlorure-sodium"
      ],
      obs: "Libération d'ammoniac.",
      ph: 11,
      gas: "NH₃",
      precipitate: "",
      color: ""
    },

    {
      id: "cao-eau",
      names: [
        "oxyde-calcium",
        "eau"
      ],
      title: "Hydratation de l'oxyde de calcium",
      eq: "CaO + H₂O → Ca(OH)₂",
      products: [
        "hydroxyde-calcium"
      ],
      obs: "Réaction exothermique avec formation d'hydroxyde de calcium.",
      ph: 12,
      gas: "",
      precipitate: "",
      color: ""
    }
  ];

  /* ================================================================
     RECHERCHE D'UNE RÉACTION
  ================================================================ */

  function findReaction(object) {
    if (!object) {
      return null;
    }

    const components =
      Object.keys(
        object.composition?.components || {}
      );

    if (!components.length) {
      return null;
    }

    const reaction =
      R.find(item =>
        item.names.every(
          required =>
            components.includes(required)
        )
      );

    return reaction || null;
  }

  /* ================================================================
     EXÉCUTION DE RÉACTION
  ================================================================ */

  function react(objectId = S.selectedId) {
    const object =
      findObject(objectId);

    if (!object) {
      toast(
        "Aucun récipient sélectionné.",
        "warning"
      );
      return false;
    }

    if (!isContainer(object)) {
      toast(
        "Sélectionnez un récipient contenant des substances.",
        "warning"
      );
      return false;
    }

    const reaction =
      findReaction(object);

    if (!reaction) {
      object.reaction = {
        active: false,
        title: "",
        equation: "",
        phase: "mélange sans réaction référencée",
        gas: "",
        precipitate: "",
        color: ""
      };

      object.state =
        "mélange sans réaction référencée";

      log(
        "Aucune réaction référencée ne correspond aux substances présentes.",
        "warning"
      );

      render();

      return false;
    }

    object.reaction = {
      active: true,
      title: reaction.title,
      equation: reaction.eq,
      phase: "réaction en cours",
      gas: reaction.gas || "",
      precipitate: reaction.precipitate || "",
      color: reaction.color || "",
      ph: reaction.ph
    };

    object.state =
      "réaction en cours";

    if (
      reaction.gas
    ) {
      log(
        `${reaction.title} — dégagement de ${reaction.gas}.`,
        "success"
      );
    }

    if (
      reaction.precipitate
    ) {
      log(
        `${reaction.title} — précipité : ${reaction.precipitate}.`,
        "success"
      );
    }

    if (
      reaction.color
    ) {
      object.color =
        reaction.color;
    }

    if (
      Number.isFinite(reaction.ph)
    ) {
      object.pH =
        reaction.ph;
    }

    setTimeout(() => {
      if (
        object.reaction &&
        object.reaction.active
      ) {
        object.reaction.phase =
          "réaction terminée";

        object.state =
          "réaction terminée";

        render();
      }
    }, 900);

    render();

    return true;
  }












/* ================================================================
   CHIMIQUE FOBAS — PARTIE 2
   Suite directe de simulationchimicfobas.js
   ================================================================ */

  /* ================================================================
     NORMALISATION ET GESTION DES COMPOSANTS
  ================================================================ */

  function ensureComposition(object) {
    if (!object.composition) {
      object.composition = createComposition();
    }

    if (!object.composition.components) {
      object.composition.components = {};
    }

    if (!Number.isFinite(
      Number(object.composition.totalMass)
    )) {
      object.composition.totalMass = 0;
    }

    if (!Number.isFinite(
      Number(object.composition.totalVolume)
    )) {
      object.composition.totalVolume = 0;
    }

    return object.composition;
  }

  function addComponent(
    object,
    materialId,
    quantity = 0
  ) {
    if (!object) {
      return false;
    }

    const material =
      materialById(materialId);

    if (!material) {
      return false;
    }

    ensureComposition(object);

    const q = num(quantity);

    if (q <= 0) {
      return false;
    }

    object.composition.components[
      materialId
    ] =
      num(
        object.composition.components[
          materialId
        ]
      ) + q;

    if (material.kind === "liquid") {
      object.composition.totalVolume =
        num(
          object.composition.totalVolume
        ) + q;
    }

    if (material.density) {
      object.composition.totalMass =
        num(
          object.composition.totalMass
        ) +
        q * num(material.density);
    } else if (material.molarMass) {
      object.composition.totalMass =
        num(
          object.composition.totalMass
        ) +
        q * num(material.molarMass);
    }

    updateObject(object);

    return true;
  }

  function removeComponent(
    object,
    materialId,
    quantity
  ) {
    if (!object?.composition?.components) {
      return false;
    }

    const current =
      num(
        object.composition.components[
          materialId
        ]
      );

    const q =
      clamp(
        num(quantity),
        0,
        current
      );

    if (q <= 0) {
      return false;
    }

    const remaining =
      current - q;

    if (remaining <= 0.000001) {
      delete object.composition.components[
        materialId
      ];
    } else {
      object.composition.components[
        materialId
      ] = remaining;
    }

    updateObject(object);

    return true;
  }

  function hasComponent(
    object,
    materialId
  ) {
    return Boolean(
      object?.composition?.components &&
      num(
        object.composition.components[
          materialId
        ]
      ) > 0
    );
  }

  function componentQuantity(
    object,
    materialId
  ) {
    return num(
      object?.composition?.components?.[
        materialId
      ]
    );
  }

  function componentCount(object) {
    return Object.keys(
      object?.composition?.components || {}
    ).length;
  }

  /* ================================================================
     CAPACITÉ DES RÉCIPIENTS
  ================================================================ */

  function getCapacity(object) {
    if (!object) {
      return 0;
    }

    if (num(object.capacity) > 0) {
      return num(object.capacity);
    }

    const material =
      materialById(object.materialId);

    return num(
      material?.capacity
    );
  }

  function getRemainingCapacity(object) {
    if (!object) {
      return 0;
    }

    const capacity =
      getCapacity(object);

    if (capacity <= 0) {
      return Infinity;
    }

    return Math.max(
      0,
      capacity -
        calculateVolume(object)
    );
  }

  /* ================================================================
     CALCUL DU VOLUME PAR TYPE DE COMPOSANT
  ================================================================ */

  function estimateComponentVolume(
    materialId,
    quantity
  ) {
    const material =
      materialById(materialId);

    const q =
      num(quantity);

    if (!material || q <= 0) {
      return 0;
    }

    if (
      material.kind === "liquid" &&
      material.density > 0
    ) {
      return q;
    }

    return 0;
  }

  function recalculateComposition(
    object
  ) {
    if (!object) {
      return;
    }

    ensureComposition(object);

    let totalMass = 0;
    let totalVolume = 0;

    Object.entries(
      object.composition.components
    ).forEach(
      ([materialId, quantity]) => {
        const material =
          materialById(materialId);

        const q =
          num(quantity);

        if (!material || q <= 0) {
          return;
        }

        if (
          material.density &&
          material.kind === "liquid"
        ) {
          totalMass +=
            q *
            num(material.density);

          totalVolume += q;
          return;
        }

        if (material.molarMass) {
          totalMass +=
            q *
            num(material.molarMass);
        }
      }
    );

    object.composition.totalMass =
      round(totalMass, 4);

    object.composition.totalVolume =
      round(totalVolume, 4);

    object.mass =
      round(totalMass, 4);

    if (totalVolume > 0) {
      object.volume =
        round(totalVolume, 4);
    }

    if (totalVolume > 0) {
      object.density =
        round(
          totalMass / totalVolume,
          4
        );
    }

    object.pH =
      calculatePH(object);
  }

  /* ================================================================
     CALCUL DE PH PLUS DYNAMIQUE
  ================================================================ */

  const PH = {
    neutral: 7,
    strongAcid: 1,
    weakAcid: 4,
    strongBase: 13,
    weakBase: 10
  };

  function materialPH(material) {
    if (!material) {
      return 7;
    }

    if (
      material.chemicalCategory ===
      "acid"
    ) {
      if (
        material.id ===
        "acide-sulfurique"
      ) {
        return 1;
      }

      if (
        material.id ===
        "acide-nitrique"
      ) {
        return 1;
      }

      if (
        material.id ===
        "acide-chlorhydrique"
      ) {
        return 1;
      }

      if (
        material.id ===
        "acide-acetique"
      ) {
        return 3;
      }

      if (
        material.id ===
        "acide-citrique"
      ) {
        return 3;
      }

      return PH.weakAcid;
    }

    if (
      material.chemicalCategory ===
      "organic-acid"
    ) {
      return 3;
    }

    if (
      material.chemicalCategory ===
      "base"
    ) {
      if (
        material.id ===
        "hydroxyde-sodium"
      ) {
        return 14;
      }

      if (
        material.id ===
        "hydroxyde-potassium"
      ) {
        return 14;
      }

      if (
        material.id ===
        "hydroxyde-calcium"
      ) {
        return 12.4;
      }

      if (
        material.id ===
        "ammoniac-aqueux"
      ) {
        return 11;
      }

      return PH.weakBase;
    }

    return 7;
  }

  function calculateMixturePH(
    object
  ) {
    const components =
      object?.composition?.components ||
      {};

    const entries =
      Object.entries(components)
        .filter(
          ([, quantity]) =>
            num(quantity) > 0
        );

    if (!entries.length) {
      return 7;
    }

    let acidScore = 0;
    let baseScore = 0;

    entries.forEach(
      ([materialId, quantity]) => {
        const material =
          materialById(materialId);

        if (!material) {
          return;
        }

        const q =
          Math.max(
            0.001,
            num(quantity)
          );

        const ph =
          materialPH(material);

        if (ph < 7) {
          acidScore +=
            (7 - ph) * q;
        }

        if (ph > 7) {
          baseScore +=
            (ph - 7) * q;
        }
      }
    );

    if (
      acidScore === 0 &&
      baseScore === 0
    ) {
      return 7;
    }

    const difference =
      acidScore - baseScore;

    if (Math.abs(difference) < 0.01) {
      return 7;
    }

    if (difference > 0) {
      return clamp(
        7 -
          Math.min(
            6,
            difference
          ),
        1,
        7
      );
    }

    return clamp(
      7 +
        Math.min(
          7,
          Math.abs(difference)
        ),
      7,
      14
    );
  }

  /* ================================================================
     COULEUR DES MÉLANGES
  ================================================================ */

  function hexToRgb(hex) {
    if (
      typeof hex !== "string"
    ) {
      return null;
    }

    let value =
      hex.trim()
        .replace("#", "");

    if (value.length === 3) {
      value =
        value
          .split("")
          .map(char => char + char)
          .join("");
    }

    if (
      !/^[0-9a-fA-F]{6}$/.test(value)
    ) {
      return null;
    }

    return {
      r: parseInt(
        value.slice(0, 2),
        16
      ),
      g: parseInt(
        value.slice(2, 4),
        16
      ),
      b: parseInt(
        value.slice(4, 6),
        16
      )
    };
  }

  function rgbToHex(
    r,
    g,
    b
  ) {
    const values = [
      clamp(Math.round(r), 0, 255),
      clamp(Math.round(g), 0, 255),
      clamp(Math.round(b), 0, 255)
    ];

    return (
      "#" +
      values
        .map(value =>
          value
            .toString(16)
            .padStart(2, "0")
        )
        .join("")
    );
  }

  function calculateMixtureColor(
    object
  ) {
    const components =
      object?.composition?.components ||
      {};

    const entries =
      Object.entries(components)
        .filter(
          ([, quantity]) =>
            num(quantity) > 0
        );

    if (!entries.length) {
      return (
        materialById(
          object?.materialId
        )?.color ||
        "#dcefff"
      );
    }

    let totalWeight = 0;
    let r = 0;
    let g = 0;
    let b = 0;

    entries.forEach(
      ([materialId, quantity]) => {
        const material =
          materialById(materialId);

        if (!material) {
          return;
        }

        const rgb =
          hexToRgb(
            material.color
          );

        if (!rgb) {
          return;
        }

        const weight =
          Math.max(
            0.001,
            num(quantity)
          );

        r += rgb.r * weight;
        g += rgb.g * weight;
        b += rgb.b * weight;

        totalWeight += weight;
      }
    );

    if (totalWeight <= 0) {
      return "#dcefff";
    }

    return rgbToHex(
      r / totalWeight,
      g / totalWeight,
      b / totalWeight
    );
  }

  /* ================================================================
     RENDU DE LA BIBLIOTHÈQUE
  ================================================================ */

  function currentCategory() {
    const active =
      document.querySelector(
        ".category-button.is-active, " +
        ".category-button.active, " +
        ".category-button[aria-selected='true']"
      );

    return (
      active?.dataset.category ||
      "all"
    );
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
      material.formula,
      material.id,
      material.chemicalCategory,
      material.state
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(
      search.toLowerCase()
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

    return material.cat === category;
  }

  function materialIcon(material) {
    if (!material) {
      return "⚗";
    }

    if (
      material.cat ===
      "glassware"
    ) {
      return "⚗";
    }

    if (
      material.cat ===
      "instrument"
    ) {
      return "⌁";
    }

    if (
      material.cat ===
      "equipment"
    ) {
      return "⚙";
    }

    if (
      material.chemicalCategory ===
      "metal"
    ) {
      return "◈";
    }

    if (
      material.chemicalCategory ===
      "acid"
    ) {
      return "🧪";
    }

    if (
      material.chemicalCategory ===
      "base"
    ) {
      return "⬡";
    }

    if (
      material.chemicalCategory ===
      "salt"
    ) {
      return "◆";
    }

    return "◇";
  }

  function createMaterialCard(
    material
  ) {
    const card =
      document.createElement("button");

    card.type = "button";

    card.className =
      "material-card";

    card.dataset.materialId =
      material.id;

    card.draggable = true;

    const icon =
      document.createElement("span");

    icon.className =
      "material-card-icon";

    icon.textContent =
      materialIcon(material);

    const body =
      document.createElement("span");

    body.className =
      "material-card-body";

    const name =
      document.createElement("strong");

    name.className =
      "material-card-name";

    name.textContent =
      material.name;

    const formula =
      document.createElement("small");

    formula.className =
      "material-card-formula";

    formula.textContent =
      material.formula ||
      material.chemicalCategory ||
      "";

    const meta =
      document.createElement("small");

    meta.className =
      "material-card-meta";

    const parts = [];

    if (
      material.state
    ) {
      parts.push(
        material.state
      );
    }

    if (
      material.molarMass
    ) {
      parts.push(
        `${round(
          material.molarMass,
          3
        )} g/mol`
      );
    }

    if (
      material.capacity
    ) {
      parts.push(
        `${material.capacity} mL`
      );
    }

    meta.textContent =
      parts.join(" • ");

    body.appendChild(name);
    body.appendChild(formula);
    body.appendChild(meta);

    card.appendChild(icon);
    card.appendChild(body);

    card.addEventListener(
      "click",
      event => {
        event.preventDefault();

        if (S.suppressLibraryClick) {
          S.suppressLibraryClick =
            false;
          return;
        }

        add(material.id);
      }
    );

    card.addEventListener(
      "dragstart",
      event => {
        S.suppressLibraryClick =
          true;

        event.dataTransfer?.setData(
          "text/plain",
          material.id
        );

        event.dataTransfer.effectAllowed =
          "copy";
      }
    );

    card.addEventListener(
      "dragend",
      () => {
        setTimeout(() => {
          S.suppressLibraryClick =
            false;
        }, 0);
      }
    );

    return card;
  }

  function renderLibrary() {
    if (!E.materialsLibrary) {
      return;
    }

    const search =
      lower(
        E.materialSearch?.value
      );

    const category =
      currentCategory();

    const filtered =
      M.filter(
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

    E.materialsLibrary.innerHTML =
      "";

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

  /* ================================================================
     RENDU DE L'INVENTAIRE
  ================================================================ */

  function renderInventory() {
    if (!E.inventoryList) {
      return;
    }

    E.inventoryList.innerHTML =
      "";

    const fragment =
      document.createDocumentFragment();

    S.objects.forEach(
      object => {
        const item =
          document.createElement("button");

        item.type = "button";

        item.className =
          "inventory-item";

        if (
          object.id ===
          S.selectedId
        ) {
          item.classList.add(
            "is-selected"
          );
        }

        item.dataset.objectId =
          object.id;

        const material =
          materialById(
            object.materialId
          );

        const title =
          document.createElement("strong");

        title.textContent =
          object.name ||
          material?.name ||
          "Objet";

        const info =
          document.createElement("small");

        const volume =
          calculateVolume(object);

        const mass =
          calculateMass(object);

        const extras = [];

        if (volume > 0) {
          extras.push(
            `${round(volume, 2)} mL`
          );
        }

        if (mass > 0) {
          extras.push(
            `${round(mass, 3)} g`
          );
        }

        info.textContent =
          extras.join(" • ") ||
          object.state ||
          "";

        item.appendChild(title);
        item.appendChild(info);

        item.addEventListener(
          "click",
          () => {
            setSelected(
              object.id
            );
          }
        );

        fragment.appendChild(item);
      }
    );

    E.inventoryList.appendChild(
      fragment
    );

    if (E.inventoryCount) {
      E.inventoryCount.textContent =
        String(S.objects.length);
    }
  }

  /* ================================================================
     RENDU DES OBJETS DANS LE WORKSPACE
  ================================================================ */

  function renderWorkspace() {
    if (!E.workspaceObjects) {
      return;
    }

    E.workspaceObjects.innerHTML =
      "";

    const fragment =
      document.createDocumentFragment();

    S.objects.forEach(
      object => {
        const material =
          materialById(
            object.materialId
          );

        const node =
          document.createElement("div");

        node.className =
          "chem-workspace-object";

        node.dataset.objectId =
          object.id;

        node.style.position =
          "absolute";

        node.style.left =
          `${num(object.x)}px`;

        node.style.top =
          `${num(object.y)}px`;

        node.style.width =
          `${num(object.width, 100)}px`;

        node.style.height =
          `${num(object.height, 80)}px`;

        node.style.setProperty(
          "--material-color",
          object.color ||
          material?.color ||
          "#dcefff"
        );

        if (
          object.id ===
          S.selectedId
        ) {
          node.classList.add(
            "is-selected"
          );
        }

        if (
          object.reaction?.active
        ) {
          node.classList.add(
            "is-reacting"
          );
        }

        if (
          object.reaction?.gas
        ) {
          node.classList.add(
            "has-gas"
          );
        }

        if (
          object.reaction?.precipitate
        ) {
          node.classList.add(
            "has-precipitate"
          );
        }

        const icon =
          document.createElement("div");

        icon.className =
          "chem-object-icon";

        icon.textContent =
          materialIcon(material);

        const title =
          document.createElement("div");

        title.className =
          "chem-object-title";

        title.textContent =
          object.name;

        const formula =
          document.createElement("div");

        formula.className =
          "chem-object-formula";

        formula.textContent =
          object.formula || "";

        const state =
          document.createElement("div");

        state.className =
          "chem-object-state";

        state.textContent =
          object.state || "";

        node.appendChild(icon);
        node.appendChild(title);

        if (object.formula) {
          node.appendChild(
            formula
          );
        }

        node.appendChild(state);

        node.addEventListener(
          "pointerdown",
          event =>
            beginObjectDrag(
              event,
              object
            )
        );

        node.addEventListener(
          "click",
          event => {
            event.stopPropagation();
            setSelected(
              object.id
            );
          }
        );

        fragment.appendChild(node);
      }
    );

    E.workspaceObjects.appendChild(
      fragment
    );
  }

  /* ================================================================
     DRAG DES OBJETS EXISTANTS
  ================================================================ */

  function workspacePoint(event) {
    const rect =
      E.workspaceObjects
        ?.getBoundingClientRect();

    if (!rect) {
      return {
        x: 0,
        y: 0
      };
    }

    return {
      x:
        (event.clientX -
          rect.left) /
        S.zoom,

      y:
        (event.clientY -
          rect.top) /
        S.zoom
    };
  }

  function beginObjectDrag(
    event,
    object
  ) {
    if (
      event.button !== undefined &&
      event.button !== 0
    ) {
      return;
    }

    if (!object) {
      return;
    }

    const point =
      workspacePoint(event);

    S.dragState = {
      type: "object",
      objectId: object.id,
      startX: point.x,
      startY: point.y,
      originX: num(object.x),
      originY: num(object.y),
      moved: false,
      pointerId:
        event.pointerId
    };

    try {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    } catch (_) {
      /* Capture non disponible */
    }

    event.preventDefault();
  }

  function moveObjectDrag(event) {
    const drag =
      S.dragState;

    if (
      !drag ||
      drag.type !== "object"
    ) {
      return;
    }

    const object =
      findObject(
        drag.objectId
      );

    if (!object) {
      return;
    }

    const point =
      workspacePoint(event);

    const dx =
      point.x -
      drag.startX;

    const dy =
      point.y -
      drag.startY;

    if (
      Math.abs(dx) > 3 ||
      Math.abs(dy) > 3
    ) {
      drag.moved = true;
    }

    object.x =
      Math.max(
        0,
        drag.originX + dx
      );

    object.y =
      Math.max(
        0,
        drag.originY + dy
      );

    renderWorkspace();
  }

  function endObjectDrag() {
    const drag =
      S.dragState;

    if (!drag) {
      return;
    }

    if (
      drag.type === "object" &&
      drag.moved
    ) {
      S.suppressLibraryClick =
        true;

      setTimeout(() => {
        S.suppressLibraryClick =
          false;
      }, 100);
    }

    S.dragState = null;

    render();
  }

  /* ================================================================
     DROP D'UN MATÉRIAU DE LA BIBLIOTHÈQUE
  ================================================================ */

  function bindWorkspaceDrop() {
    const target =
      E.workspaceDropZone ||
      E.workspaceObjects ||
      E.laboratoryWorkspace;

    if (!target) {
      return;
    }

    target.addEventListener(
      "dragover",
      event => {
        event.preventDefault();

        if (
          event.dataTransfer
        ) {
          event.dataTransfer.dropEffect =
            "copy";
        }

        target.classList.add(
          "is-drop-target"
        );
      }
    );

    target.addEventListener(
      "dragleave",
      () => {
        target.classList.remove(
          "is-drop-target"
        );
      }
    );

    target.addEventListener(
      "drop",
      event => {
        event.preventDefault();

        target.classList.remove(
          "is-drop-target"
        );

        const materialId =
          event.dataTransfer?.getData(
            "text/plain"
          );

        if (!materialId) {
          return;
        }

        const rect =
          E.workspaceObjects
            ?.getBoundingClientRect();

        if (!rect) {
          add(materialId);
          return;
        }

        const x =
          (event.clientX -
            rect.left) /
          S.zoom;

        const y =
          (event.clientY -
            rect.top) /
          S.zoom;

        add(
          materialId,
          Math.max(0, x - 45),
          Math.max(0, y - 40)
        );
      }
    );
  }

  /* ================================================================
     INSPECTEUR
  ================================================================ */

  function setText(
    node,
    value
  ) {
    if (node) {
      node.textContent =
        value == null
          ? ""
          : String(value);
    }
  }

  function renderInspector() {
    const object =
      selectedObject();

    if (!object) {
      setText(
        E.selectedObjectType,
        "Aucun objet sélectionné"
      );

      if (E.objectInspector) {
        E.objectInspector.style.display =
          "none";
      }

      return;
    }

    if (E.objectInspector) {
      E.objectInspector.style.display =
        "";
    }

    const material =
      materialById(
        object.materialId
      );

    setText(
      E.selectedObjectType,
      object.name
    );

    setText(
      E.propName,
      object.name
    );

    setText(
      E.propState,
      object.state
    );

    setText(
      E.propTemperature,
      `${round(
        object.temperature,
        1
      )} °C`
    );

    setText(
      E.propMass,
      `${round(
        calculateMass(object),
        3
      )} g`
    );

    setText(
      E.propVolume,
      `${round(
        calculateVolume(object),
        2
      )} mL`
    );

    setText(
      E.propDensity,
      object.density > 0
        ? `${round(
            object.density,
            4
          )} g/mL`
        : "—"
    );

    setText(
      E.propPH,
      round(
        calculatePH(object),
        2
      )
    );

    setText(
      E.propColor,
      object.color ||
        material?.color ||
        "—"
    );

    renderComposition(
      object
    );

    renderReaction(
      object
    );

    renderMeasurement(
      object
    );
  }

  /* ================================================================
     COMPOSITION
  ================================================================ */

  function renderComposition(
    object
  ) {
    if (!E.compositionList) {
      return;
    }

    const components =
      object?.composition?.components ||
      {};

    E.compositionList.innerHTML =
      "";

    const entries =
      Object.entries(components)
        .filter(
          ([, quantity]) =>
            num(quantity) > 0
        );

    entries.forEach(
      ([materialId, quantity]) => {
        const material =
          materialById(
            materialId
          );

        const row =
          document.createElement("div");

        row.className =
          "composition-row";

        const name =
          document.createElement("span");

        name.textContent =
          material?.name ||
          materialId;

        const value =
          document.createElement("span");

        value.textContent =
          `${round(
            quantity,
            4
          )} ${
            material?.kind === "solid"
              ? "g"
              : "mL"
          }`;

        row.appendChild(name);
        row.appendChild(value);

        E.compositionList.appendChild(
          row
        );
      }
    );

    setText(
      E.compositionTotal,
      entries.length
        ? `${entries.length} composant(s)`
        : "Aucun composant"
    );
  }

  /* ================================================================
     RÉACTION DANS L'INSPECTEUR
  ================================================================ */

  function renderReaction(
    object
  ) {
    const reaction =
      object?.reaction;

    if (!reaction) {
      return;
    }

    setText(
      E.reactionStatus,
      reaction.active
        ? "Réaction détectée"
        : "Aucune réaction"
    );

    setText(
      E.reactionPhase,
      reaction.phase ||
        "—"
    );

    setText(
      E.reactionGas,
      reaction.gas ||
        "—"
    );

    setText(
      E.reactionPrecipitate,
      reaction.precipitate ||
        "—"
    );

    setText(
      E.reactionColor,
      reaction.color ||
        "—"
    );
  }

  /* ================================================================
     MESURES
  ================================================================ */

  function measure(
    type = "volume",
    objectId = S.selectedId
  ) {
    const object =
      findObject(objectId);

    if (!object) {
      toast(
        "Aucun objet sélectionné.",
        "warning"
      );
      return null;
    }

    let value = 0;
    let unit = "";

    switch (lower(type)) {
      case "volume":
        value =
          calculateVolume(object);
        unit = "mL";
        break;

      case "temperature":
        value =
          round(
            num(
              object.temperature,
              25
            ),
            1
          );
        unit = "°C";
        break;

      case "ph":
      case "p-h":
        value =
          round(
            calculatePH(object),
            2
          );
        unit = "pH";
        break;

      case "mass":
        value =
          calculateMass(object);
        unit = "g";
        break;

      case "density":
        value =
          round(
            num(
              object.density
            ),
            4
          );
        unit = "g/mL";
        break;

      case "conductivity":
        value =
          estimateConductivity(
            object
          );
        unit = "mS/cm";
        break;

      case "time":
        value =
          0;
        unit = "s";
        break;

      default:
        value = 0;
        unit = "";
    }

    S.measurement = {
      label: type,
      value,
      unit,
      precision:
        unit === "pH"
          ? 2
          : unit === "°C"
            ? 1
            : 2
    };

    object.measurement = {
      ...S.measurement
    };

    renderMeasurement(
      object
    );

    openMeasurementModal();

    log(
      `Mesure : ${value} ${unit}`.trim(),
      "info"
    );

    return S.measurement;
  }

  function estimateConductivity(
    object
  ) {
    const components =
      object?.composition?.components ||
      {};

    let score = 0;

    Object.entries(
      components
    ).forEach(
      ([materialId, quantity]) => {
        const material =
          materialById(
            materialId
          );

        if (!material) {
          return;
        }

        const category =
          material.chemicalCategory;

        const q =
          num(quantity);

        if (
          category === "salt"
        ) {
          score +=
            q * 12;
        } else if (
          category === "acid"
        ) {
          score +=
            q * 18;
        } else if (
          category === "base"
        ) {
          score +=
            q * 18;
        } else if (
          material.id === "eau"
        ) {
          score +=
            q * 0.01;
        }
      }
    );

    return round(
      clamp(
        score,
        0,
        200
      ),
      2
    );
  }

  function renderMeasurement(
    object
  ) {
    const measurement =
      object?.measurement ||
      S.measurement;

    setText(
      E.measurementLabel,
      measurement?.label ||
        "—"
    );

    setText(
      E.measurementValue,
      measurement?.value ??
        "—"
    );

    setText(
      E.measurementPrecision,
      measurement?.precision ??
        "—"
    );
  }

  function openMeasurementModal() {
    modal(
      E.measurementModal,
      true
    );

    setText(
      E.instrumentScreenLabel,
      S.measurement.label
    );

    setText(
      E.instrumentScreenValue,
      S.measurement.value
    );

    setText(
      E.instrumentScreenUnit,
      S.measurement.unit
    );
  }

  function closeMeasurementModal() {
    modal(
      E.measurementModal,
      false
    );
  }

  /* ================================================================
     MODALE DE TRANSFERT
  ================================================================ */

  function openTransferModal() {
    const source =
      selectedObject();

    if (!source) {
      toast(
        "Sélectionnez d'abord un récipient source.",
        "warning"
      );
      return;
    }

    const volume =
      calculateVolume(source);

    setText(
      E.transferSourceName,
      source.name
    );

    setText(
      E.transferSourceAmount,
      `${round(
        volume,
        2
      )} mL`
    );

    if (E.transferAmount) {
      E.transferAmount.value =
        volume > 0
          ? Math.min(
              10,
              volume
            )
          : 0;
    }

    if (E.transferRange) {
      E.transferRange.min =
        "0";

      E.transferRange.max =
        String(
          round(
            volume,
            2
          )
        );

      E.transferRange.value =
        String(
          volume > 0
            ? Math.min(
                10,
                volume
              )
            : 0
        );
    }

    setText(
      E.transferMaxLabel,
      `${round(
        volume,
        2
      )} mL maximum`
    );

    populateTransferTargets(
      source.id
    );

    modal(
      E.transferModal,
      true
    );
  }

  function populateTransferTargets(
    sourceId
  ) {
    if (!E.transferTarget) {
      return;
    }

    E.transferTarget.innerHTML =
      "";

    S.objects
      .filter(
        object =>
          object.id !== sourceId &&
          isContainer(object)
      )
      .forEach(
        object => {
          const option =
            document.createElement(
              "option"
            );

          option.value =
            object.id;

          option.textContent =
            object.name;

          E.transferTarget.appendChild(
            option
          );
        }
      );
  }

  function closeTransferModal() {
    modal(
      E.transferModal,
      false
    );
  }

  function confirmTransfer() {
    const source =
      selectedObject();

    const target =
      findObject(
        E.transferTarget?.value
      );

    const amount =
      num(
        E.transferAmount?.value
      );

    if (!source || !target) {
      toast(
        "Sélectionnez une source et une cible.",
        "warning"
      );
      return;
    }

    if (
      transfer(
        source.id,
        target.id,
        amount
      )
    ) {
      closeTransferModal();
    }
  }

  /* ================================================================
     ZOOM DU LABORATOIRE
  ================================================================ */

  function applyZoom() {
    const viewport =
      E.workspaceViewport;

    if (!viewport) {
      return;
    }

    viewport.style.setProperty(
      "--chem-zoom",
      String(S.zoom)
    );

    const objects =
      E.workspaceObjects;

    if (objects) {
      objects.style.transform =
        `scale(${S.zoom})`;

      objects.style.transformOrigin =
        "0 0";
    }

    setText(
      E.zoomValue,
      `${Math.round(
        S.zoom * 100
      )}%`
    );
  }

  function zoomIn() {
    S.zoom =
      clamp(
        round(
          S.zoom + 0.1,
          2
        ),
        0.5,
        2.5
      );

    applyZoom();
  }

  function zoomOut() {
    S.zoom =
      clamp(
        round(
          S.zoom - 0.1,
          2
        ),
        0.5,
        2.5
      );

    applyZoom();
  }

  function fitWorkspace() {
    S.zoom = 1;

    if (E.workspaceObjects) {
      E.workspaceObjects.style.transform =
        "scale(1)";
    }

    applyZoom();
  }

  /* ================================================================
     EFFACER LE LABORATOIRE
  ================================================================ */

  function clearWorkspace() {
    if (!S.objects.length) {
      return;
    }

    const confirmed =
      window.confirm(
        "Voulez-vous vraiment vider le laboratoire ?"
      );

    if (!confirmed) {
      return;
    }

    S.objects = [];
    S.selectedId = null;

    render();

    log(
      "Le laboratoire a été vidé.",
      "warning"
    );
  }

  /* ================================================================
     SAUVEGARDE LOCALE
  ================================================================ */

  const STORAGE_KEY =
    "CHIMIQUE_FOBAS_SIMULATION_V1";

  function serializeState() {
    return {
      version:
        S.savedVersion,

      session: {
        ...S.session
      },

      zoom:
        S.zoom,

      objects:
        S.objects.map(
          object => ({
            ...object,
            composition: {
              ...object.composition,
              components: {
                ...object.composition
                  .components
              }
            },
            reaction: {
              ...object.reaction
            },
            measurement: {
              ...object.measurement
            }
          })
        )
    };
  }

  function saveSimulation() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          serializeState()
        )
      );

      log(
        "Session enregistrée localement.",
        "success"
      );

      toast(
        "Session sauvegardée.",
        "success"
      );

      return true;
    } catch (error) {
      console.error(
        "CHIMIQUE FOBAS save error:",
        error
      );

      toast(
        "Impossible d'enregistrer la session.",
        "error"
      );

      return false;
    }
  }

  function loadSimulation() {
    try {
      const raw =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!raw) {
        return false;
      }

      const data =
        JSON.parse(raw);

      if (
        !data ||
        !Array.isArray(
          data.objects
        )
      ) {
        return false;
      }

      S.objects =
        data.objects.map(
          object => {
            const material =
              materialById(
                object.materialId
              );

            const restored = {
              ...object,

              width:
                num(
                  object.width,
                  100
                ),

              height:
                num(
                  object.height,
                  80
                ),

              x:
                num(
                  object.x
                ),

              y:
                num(
                  object.y
                ),

              temperature:
                num(
                  object.temperature,
                  25
                ),

              composition:
                object.composition ||
                createComposition(),

              reaction:
                object.reaction || {
                  active: false,
                  title: "",
                  equation: "",
                  phase: "",
                  gas: "",
                  precipitate: "",
                  color: ""
                },

              measurement:
                object.measurement || {
                  label: "",
                  value: 0,
                  unit: "",
                  precision: 0
                },

              color:
                object.color ||
                material?.color ||
                "#dcefff"
            };

            ensureComposition(
              restored
            );

            recalculateComposition(
              restored
            );

            return restored;
          }
        );

      S.selectedId = null;

      S.zoom =
        clamp(
          num(
            data.zoom,
            1
          ),
          0.5,
          2.5
        );

      if (data.session) {
        S.session = {
          ...S.session,
          ...data.session
        };
      }

      render();

      log(
        "Session restaurée.",
        "success"
      );

      return true;
    } catch (error) {
      console.error(
        "CHIMIQUE FOBAS load error:",
        error
      );

      toast(
        "La session sauvegardée est invalide.",
        "error"
      );

      return false;
    }
  }

  /* ================================================================
     RÉINITIALISATION
  ================================================================ */

  function resetSimulation() {
    const confirmed =
      window.confirm(
        "Réinitialiser complètement la simulation ?"
      );

    if (!confirmed) {
      return;
    }

    S.objects = [];
    S.selectedId = null;
    S.zoom = 1;

    S.session = {
      name:
        "Session de laboratoire",
      createdAt:
        Date.now()
    };

    try {
      localStorage.removeItem(
        STORAGE_KEY
      );
    } catch (_) {
      /* localStorage indisponible */
    }

    render();

    log(
      "Simulation réinitialisée.",
      "warning"
    );

    toast(
      "Laboratoire réinitialisé.",
      "success"
    );
  }

  /* ================================================================
     OUTILS DU LABORATOIRE
  ================================================================ */

  function setTool(tool) {
    const validTools = [
      "select",
      "move",
      "transfer",
      "mix",
      "react",
      "measure",
      "heat"
    ];

    if (
      !validTools.includes(tool)
    ) {
      tool = "select";
    }

    S.activeTool =
      tool;

    $$(".tool-button").forEach(
      button => {
        const active =
          button.dataset.tool ===
          tool;

        button.classList.toggle(
          "is-active",
          active
        );

        button.classList.toggle(
          "active",
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

    log(
      `Outil actif : ${tool}.`,
      "info"
    );
  }

  function useActiveTool(
    objectId
  ) {
    switch (
      S.activeTool
    ) {
      case "transfer":
        openTransferModal();
        break;

      case "mix":
        mix(objectId);
        break;

      case "react":
        react(objectId);
        break;

      case "measure":
        measure(
          "volume",
          objectId
        );
        break;

      case "heat":
        heat(objectId);
        break;

      default:
        setSelected(objectId);
    }
  }

  /* ================================================================
     ÉVÉNEMENTS GLOBAUX
  ================================================================ */

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
      renderLibrary
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

    E.actionTransferBtn?.addEventListener(
      "click",
      openTransferModal
    );

    E.actionMixBtn?.addEventListener(
      "click",
      () => mix()
    );

    E.actionMeasureBtn?.addEventListener(
      "click",
      () =>
        measure("volume")
    );

    E.actionHeatBtn?.addEventListener(
      "click",
      () => heat()
    );

    E.actionRemoveBtn?.addEventListener(
      "click",
      () => {
        if (S.selectedId) {
          remove(
            S.selectedId
          );
        }
      }
    );

    E.closeTransferModal?.addEventListener(
      "click",
      closeTransferModal
    );

    E.cancelTransferBtn?.addEventListener(
      "click",
      closeTransferModal
    );

    E.confirmTransferBtn?.addEventListener(
      "click",
      confirmTransfer
    );

    E.transferRange?.addEventListener(
      "input",
      () => {
        if (E.transferAmount) {
          E.transferAmount.value =
            E.transferRange.value;
        }
      }
    );

    E.transferAmount?.addEventListener(
      "input",
      () => {
        if (E.transferRange) {
          E.transferRange.value =
            E.transferAmount.value;
        }
      }
    );

    E.closeMeasurementModal?.addEventListener(
      "click",
      closeMeasurementModal
    );

    E.closeMeasurementBtn?.addEventListener(
      "click",
      closeMeasurementModal
    );

    E.chemHelpBtn?.addEventListener(
      "click",
      () =>
        modal(
          E.helpModal,
          true
        )
    );

    E.closeHelpModal?.addEventListener(
      "click",
      () =>
        modal(
          E.helpModal,
          false
        )
    );

    E.closeHelpBtn?.addEventListener(
      "click",
      () =>
        modal(
          E.helpModal,
          false
        )
    );

    E.chemSaveBtn?.addEventListener(
      "click",
      saveSimulation
    );

    E.chemResetBtn?.addEventListener(
      "click",
      resetSimulation
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

            renderLibrary();
          }
        );
      }
    );

    E.workspaceObjects?.addEventListener(
      "click",
      event => {
        if (
          event.target ===
          E.workspaceObjects
        ) {
          setSelected(null);
        }
      }
    );

    document.addEventListener(
      "pointermove",
      moveObjectDrag
    );

    document.addEventListener(
      "pointerup",
      endObjectDrag
    );

    document.addEventListener(
      "pointercancel",
      endObjectDrag
    );

    document.addEventListener(
      "keydown",
      event => {
        if (
          event.key ===
          "Escape"
        ) {
          closeLibrary();
          closeTransferModal();
          closeMeasurementModal();
          modal(
            E.helpModal,
            false
          );
        }

        if (
          event.key ===
          "Delete"
        ) {
          if (
            S.selectedId &&
            !(
              event.target instanceof
              HTMLInputElement
            ) &&
            !(
              event.target instanceof
              HTMLTextAreaElement
            )
          ) {
            remove(
              S.selectedId
            );
          }
        }
      }
    );
  }

  /* ================================================================
     ÉTAT DE L'INTERFACE
  ================================================================ */

  function updateLaboratoryState() {
    const hasObjects =
      S.objects.length > 0;

    const reacting =
      S.objects.some(
        object =>
          object.reaction?.active
      );

    if (reacting) {
      setText(
        E.laboratoryStateText,
        "Réaction en cours"
      );

      E.laboratoryStateDot
        ?.classList.add(
          "is-reacting"
        );

      return;
    }

    if (hasObjects) {
      setText(
        E.laboratoryStateText,
        "Laboratoire actif"
      );

      E.laboratoryStateDot
        ?.classList.remove(
          "is-reacting"
        );

      return;
    }

    setText(
      E.laboratoryStateText,
      "Laboratoire prêt"
    );

    E.laboratoryStateDot
      ?.classList.remove(
        "is-reacting"
      );
  }

  /* ================================================================
     STATISTIQUES DU LABORATOIRE
  ================================================================ */

  function renderStatus() {
    const selected =
      selectedObject();

    const totalVolume =
      S.objects.reduce(
        (sum, object) =>
          sum +
          calculateVolume(
            object
          ),
        0
      );

    const totalMass =
      S.objects.reduce(
        (sum, object) =>
          sum +
          calculateMass(
            object
          ),
        0
      );

    const temperature =
      selected
        ? num(
            selected.temperature,
            25
          )
        : 25;

    const ph =
      selected
        ? calculatePH(
            selected
          )
        : 7;

    setText(
      E.statusObjects,
      S.objects.length
    );

    setText(
      E.statusVolume,
      `${round(
        totalVolume,
        2
      )} mL`
    );

    setText(
      E.statusTemperature,
      `${round(
        temperature,
        1
      )} °C`
    );

    setText(
      E.statusPH,
      round(
        ph,
        2
      )
    );

    setText(
      E.statusMass,
      `${round(
        totalMass,
        3
      )} g`
    );
  }

  /* ================================================================
     INDICATEURS VISUELS
  ================================================================ */

  function updateTemperatureOverlay() {
    if (!E.temperatureOverlay) {
      return;
    }

    const selected =
      selectedObject();

    const temperature =
      selected
        ? num(
            selected.temperature,
            25
          )
        : 25;

    const intensity =
      clamp(
        (
          temperature - 25
        ) / 100,
        -1,
        1
      );

    E.temperatureOverlay.style.setProperty(
      "--temperature-intensity",
      String(intensity)
    );

    E.temperatureOverlay.classList.toggle(
      "is-hot",
      temperature > 60
    );

    E.temperatureOverlay.classList.toggle(
      "is-cold",
      temperature < 5
    );
  }

  function updateReactionOverlay() {
    if (!E.reactionOverlay) {
      return;
    }

    const selected =
      selectedObject();

    const active =
      Boolean(
        selected?.reaction?.active
      );

    E.reactionOverlay.classList.toggle(
      "is-active",
      active
    );

    E.reactionOverlay.classList.toggle(
      "has-gas",
      Boolean(
        selected?.reaction?.gas
      )
    );

    E.reactionOverlay.classList.toggle(
      "has-precipitate",
      Boolean(
        selected?.reaction?.precipitate
      )
    );
  }

  /* ================================================================
     RENDU GLOBAL
  ================================================================ */

  function render() {
    S.objects.forEach(
      updateObject
    );

    S.objects.forEach(
      recalculateComposition
    );

    renderLibrary();
    renderInventory();
    renderWorkspace();
    renderInspector();
    renderStatus();

    updateLaboratoryState();
    updateTemperatureOverlay();
    updateReactionOverlay();

    applyZoom();
  }

  /* ================================================================
     VALIDATION DE LA BIBLIOTHÈQUE
  ================================================================ */

  function validateLibrary() {
    const ids =
      new Set();

    const duplicates = [];

    const invalidCategories = [];

    const validCategories = [
      "glassware",
      "reagent",
      "solid",
      "instrument",
      "equipment"
    ];

    M.forEach(
      material => {
        if (
          ids.has(
            material.id
          )
        ) {
          duplicates.push(
            material.id
          );
        }

        ids.add(
          material.id
        );

        if (
          !validCategories.includes(
            material.cat
          )
        ) {
          invalidCategories.push(
            material.id
          );
        }
      }
    );

    const result = {
      totalMaterials:
        M.length,

      duplicateIds:
        duplicates,

      invalidCategories,

      valid:
        duplicates.length === 0 &&
        invalidCategories.length === 0
    };

    if (!result.valid) {
      console.warn(
        "CHIMIQUE FOBAS library validation:",
        result
      );
    }

    return result;
  }

  /* ================================================================
     API PUBLIQUE POUR DEBUG / EXTENSION
  ================================================================ */

  const API = {
    state: S,
    elements: E,
    materials: M,
    reactions: R,

    add,
    remove,
    transfer,
    mix,
    heat,
    react,
    measure,

    save:
      saveSimulation,

    load:
      loadSimulation,

    reset:
      resetSimulation,

    render,

    setTool,

    validateLibrary,

    materialById,

    findObject,

    selectedObject
  };

  /* ================================================================
     EXPOSITION GLOBALE
  ================================================================ */

  window.CHIMIQUE_FOBAS =
    API;

  window.simulationChimicFobas =
    API;

  /* ================================================================
     INITIALISATION
  ================================================================ */

  function init() {
    const validation =
      validateLibrary();

    if (!validation.valid) {
      console.warn(
        "La bibliothèque contient des problèmes.",
        validation
      );
    }

    bindEvents();

    bindWorkspaceDrop();

    setTool("select");

    const loaded =
      loadSimulation();

    if (!loaded) {
      render();

      log(
        "Laboratoire CHIMIQUE FOBAS prêt.",
        "success"
      );
    }

    if (
      E.sessionName &&
      S.session.name
    ) {
      E.sessionName.textContent =
        S.session.name;
    }

    render();
  }

  /* ================================================================
     DÉMARRAGE SÉCURISÉ
  ================================================================ */

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