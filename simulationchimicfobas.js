/* ================================================================
   CHIMIQUE FOBAS
   Virtual Chemistry Laboratory
   simulationchimicfobas.js
   Version 2.0.0
   ---------------------------------------------------------------
   STABLE / ANDROID SAFE / NO EXTERNAL DEPENDENCIES

   FEATURES
   ---------------------------------------------------------------
   • Chemical / glassware / equipment library
   • Instant search
   • Visual chemical representations
   • Click-to-add
   • Drag & drop
   • Touch / pointer support
   • Object selection
   • Object movement
   • Containers
   • Add substance to container
   • Remove substance
   • Measure
   • Mix
   • Temperature
   • Pipette
   • Reaction engine
   • Explicit reaction models only
   • Analysis
   • Cleaning
   • Delete
   • Undo / Redo
   • Save / Load
   • Reset
   • Zoom
   • Center / Reset view
   • Context menu
   • Keyboard shortcuts
   • Notifications
   • Journal
   • Safety
   • Android compatible
   ================================================================ */

"use strict";

(function () {

    /* ============================================================
       01. CORE
       ============================================================ */

    const APP = {
        VERSION: "2.0.0",
        STORAGE_KEY: "CHIMIQUE_FOBAS_EXPERIMENT_V2",
        MAX_HISTORY: 80,

        state: {
            experiment: {
                id: "",
                name: "Nouvelle expérience",
                createdAt: null,
                updatedAt: null
            },

            objects: [],
            selectedId: null,

            tool: "select",

            zoom: 1,

            stage: {
                offsetX: 0,
                offsetY: 0
            },

            reactionResult: null,

            journal: [],

            history: [],
            future: [],

            counters: {
                actions: 0,
                objects: 0,
                reactions: 0
            },

            pipetteSourceId: null
        },

        dom: {},

        pointer: {
            active: false,
            objectId: null,
            startX: 0,
            startY: 0,
            objectStartX: 0,
            objectStartY: 0,
            moved: false
        },

        initialized: false
    };


    /* ============================================================
       02. UTILITIES
       ============================================================ */

    const U = {

        $: function (selector, root) {
            try {
                return (root || document).querySelector(selector);
            } catch (e) {
                return null;
            }
        },

        $$: function (selector, root) {
            try {
                return Array.from(
                    (root || document).querySelectorAll(selector)
                );
            } catch (e) {
                return [];
            }
        },

        id: function (prefix) {
            return (
                (prefix || "CF") +
                "_" +
                Date.now().toString(36) +
                "_" +
                Math.random().toString(36).slice(2, 9)
            ).toUpperCase();
        },

        num: function (value, fallback) {
            const n = Number(value);
            return Number.isFinite(n)
                ? n
                : (fallback === undefined ? 0 : fallback);
        },

        clamp: function (value, min, max) {
            return Math.max(min, Math.min(max, value));
        },

        round: function (value, decimals) {
            decimals = decimals === undefined ? 2 : decimals;
            const p = Math.pow(10, decimals);
            return Math.round(value * p) / p;
        },

        clone: function (obj) {
            try {
                return JSON.parse(JSON.stringify(obj));
            } catch (e) {
                return null;
            }
        },

        esc: function (value) {
            return String(value == null ? "" : value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        },

        time: function () {
            return new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
        },

        date: function () {
            return new Date().toISOString();
        },

        lower: function (value) {
            return String(value || "").toLocaleLowerCase();
        },

        format: function (value, decimals) {
            return U.round(value, decimals === undefined ? 2 : decimals)
                .toLocaleString(undefined, {
                    maximumFractionDigits:
                        decimals === undefined ? 2 : decimals
                });
        }
    };


    /* ============================================================
       03. DOM CACHE
       ============================================================ */

    function cacheDOM() {

        APP.dom.root = document.getElementById("chimique-fobas");

        APP.dom.librarySearch =
            document.getElementById("library-search");

        APP.dom.clearLibrarySearch =
            document.getElementById("clear-library-search");

        APP.dom.libraryItems =
            document.getElementById("library-items");

        APP.dom.libraryEmpty =
            document.getElementById("library-empty");

        APP.dom.libraryTabs =
            document.getElementById("library-tabs");

        APP.dom.reactionSearch =
            document.getElementById("reaction-search");

        APP.dom.reactionItems =
            document.getElementById("reaction-items");

        APP.dom.stage =
            document.getElementById("laboratory-stage");

        APP.dom.stageObjects =
            document.getElementById("laboratory-objects");

        APP.dom.background =
            document.getElementById("laboratory-background");

        APP.dom.emptyLaboratory =
            document.getElementById("empty-laboratory");

        APP.dom.selectionOverlay =
            document.getElementById("selection-overlay");

        APP.dom.stageMode =
            document.getElementById("stage-mode");

        APP.dom.dropIndicator =
            document.getElementById("drop-zone-indicator");

        APP.dom.engineStatus =
            document.getElementById("engine-status");

        APP.dom.engineStatusText =
            document.getElementById("engine-status-text");

        APP.dom.reactionResultEmpty =
            document.getElementById("reaction-result-empty");

        APP.dom.reactionResultContent =
            document.getElementById("reaction-result-content");

        APP.dom.reactionResultStatus =
            document.getElementById("reaction-result-status");

        APP.dom.reactionResultName =
            document.getElementById("reaction-result-name");

        APP.dom.reactionResultReactants =
            document.getElementById("reaction-result-reactants");

        APP.dom.reactionResultProducts =
            document.getElementById("reaction-result-products");

        APP.dom.reactionResultObservations =
            document.getElementById("reaction-result-observations");

        APP.dom.reactionResultFinalState =
            document.getElementById("reaction-result-final-state");

        APP.dom.journal =
            document.getElementById("action-journal");

        APP.dom.containerStatus =
            document.getElementById("container-status");

        APP.dom.experienceFileInput =
            document.getElementById("experience-file-input");

        APP.dom.notification =
            document.getElementById("notification-container");

        APP.dom.objectContextMenu =
            document.getElementById("object-context-menu");

        APP.dom.addModal =
            document.getElementById("add-object-modal");

        APP.dom.reactionModal =
            document.getElementById("reaction-modal");

        APP.dom.safetyModal =
            document.getElementById("safety-modal");

        APP.dom.saveModal =
            document.getElementById("save-modal");

        APP.dom.resetModal =
            document.getElementById("reset-confirm-modal");

        APP.dom.applicationError =
            document.getElementById("application-error");
    }


    /* ============================================================
       04. CHEMICAL DATABASE
       ============================================================ */

    const CHEMICALS = [

        {
            id: "water",
            name: "Eau distillée",
            formula: "H₂O",
            category: "solvent",
            state: "liquid",
            color: "#dff6ff",
            ph: 7,
            density: 1,
            molarMass: 18.015,
            defaultVolume: 50,
            description: "Eau distillée utilisée comme solvant.",
            safety: "Manipulation pédagogique normale."
        },

        {
            id: "hydrochloric_acid",
            name: "Acide chlorhydrique",
            formula: "HCl",
            category: "acid",
            state: "aqueous",
            color: "#d7f0ff",
            ph: 1,
            density: 1.05,
            molarMass: 36.46,
            defaultVolume: 10,
            description: "Acide fort en solution aqueuse.",
            safety: "Corrosif. Simulation pédagogique."
        },

        {
            id: "sulfuric_acid",
            name: "Acide sulfurique",
            formula: "H₂SO₄",
            category: "acid",
            state: "liquid",
            color: "#e6f3ff",
            ph: 0.5,
            density: 1.84,
            molarMass: 98.08,
            defaultVolume: 5,
            description: "Acide fort fortement corrosif.",
            safety: "Très corrosif. Simulation uniquement."
        },

        {
            id: "acetic_acid",
            name: "Acide acétique",
            formula: "CH₃COOH",
            category: "acid",
            state: "liquid",
            color: "#eef8ff",
            ph: 2.4,
            density: 1.05,
            molarMass: 60.05,
            defaultVolume: 10,
            description: "Acide faible.",
            safety: "Simulation pédagogique."
        },

        {
            id: "sodium_hydroxide",
            name: "Hydroxyde de sodium",
            formula: "NaOH",
            category: "base",
            state: "aqueous",
            color: "#eefcff",
            ph: 13,
            density: 1,
            molarMass: 40,
            defaultVolume: 10,
            description: "Base forte.",
            safety: "Corrosif. Simulation pédagogique."
        },

        {
            id: "ammonia_solution",
            name: "Solution d'ammoniaque",
            formula: "NH₃(aq)",
            category: "base",
            state: "aqueous",
            color: "#edfaff",
            ph: 11,
            density: 0.99,
            molarMass: 17.03,
            defaultVolume: 10,
            description: "Base faible en solution.",
            safety: "Simulation pédagogique."
        },

        {
            id: "sodium_bicarbonate",
            name: "Bicarbonate de sodium",
            formula: "NaHCO₃",
            category: "salt",
            state: "solid",
            color: "#f7f8fa",
            ph: 8.3,
            density: 2.2,
            molarMass: 84.01,
            defaultMass: 2,
            description: "Solide utilisé dans le modèle acide-carbonate.",
            safety: "Faible risque dans le modèle."
        },

        {
            id: "sodium_chloride",
            name: "Chlorure de sodium",
            formula: "NaCl",
            category: "salt",
            state: "solid",
            color: "#ffffff",
            ph: 7,
            density: 2.16,
            molarMass: 58.44,
            defaultMass: 2,
            description: "Sel commun.",
            safety: "Manipulation pédagogique normale."
        },

        {
            id: "copper_sulfate",
            name: "Sulfate de cuivre(II)",
            formula: "CuSO₄",
            category: "salt",
            state: "solid",
            color: "#247fe5",
            ph: 4,
            density: 3.6,
            molarMass: 159.61,
            defaultMass: 2,
            description: "Sel de cuivre représenté en bleu.",
            safety: "Simulation pédagogique."
        },

        {
            id: "silver_nitrate",
            name: "Nitrate d'argent",
            formula: "AgNO₃",
            category: "salt",
            state: "aqueous",
            color: "#eef5ff",
            ph: 7,
            density: 1,
            molarMass: 169.87,
            defaultVolume: 5,
            description: "Solution utilisée dans un modèle de précipitation.",
            safety: "Simulation pédagogique."
        },

        {
            id: "sodium_carbonate",
            name: "Carbonate de sodium",
            formula: "Na₂CO₃",
            category: "salt",
            state: "solid",
            color: "#f7f8fb",
            ph: 11.6,
            density: 2.54,
            molarMass: 105.99,
            defaultMass: 2,
            description: "Sel basique.",
            safety: "Simulation pédagogique."
        },

        {
            id: "calcium_chloride",
            name: "Chlorure de calcium",
            formula: "CaCl₂",
            category: "salt",
            state: "solid",
            color: "#f5f6f8",
            ph: 7,
            density: 2.15,
            molarMass: 110.98,
            defaultMass: 2,
            description: "Sel soluble.",
            safety: "Simulation pédagogique."
        },

        {
            id: "potassium_iodide",
            name: "Iodure de potassium",
            formula: "KI",
            category: "salt",
            state: "solid",
            color: "#ffffff",
            ph: 7,
            density: 3.12,
            molarMass: 166,
            defaultMass: 2,
            description: "Sel ionique.",
            safety: "Simulation pédagogique."
        },

        {
            id: "potassium_nitrate",
            name: "Nitrate de potassium",
            formula: "KNO₃",
            category: "salt",
            state: "solid",
            color: "#ffffff",
            ph: 7,
            density: 2.11,
            molarMass: 101.1,
            defaultMass: 2,
            description: "Sel nitrate.",
            safety: "Simulation pédagogique."
        },

        {
            id: "calcium_carbonate",
            name: "Carbonate de calcium",
            formula: "CaCO₃",
            category: "salt",
            state: "solid",
            color: "#f1f1f1",
            ph: 8.3,
            density: 2.71,
            molarMass: 100.09,
            defaultMass: 2,
            description: "Solide carbonaté.",
            safety: "Simulation pédagogique."
        },

        {
            id: "magnesium_sulfate",
            name: "Sulfate de magnésium",
            formula: "MgSO₄",
            category: "salt",
            state: "solid",
            color: "#f8f8fa",
            ph: 7,
            density: 2.66,
            molarMass: 120.37,
            defaultMass: 2,
            description: "Sel de magnésium.",
            safety: "Simulation pédagogique."
        },

        {
            id: "universal_indicator",
            name: "Indicateur universel",
            formula: "Ind.",
            category: "indicator",
            state: "solution",
            color: "#54d66b",
            ph: 7,
            density: 1,
            molarMass: null,
            defaultVolume: 2,
            description: "Indicateur coloré de pH.",
            safety: "Simulation pédagogique."
        },

        {
            id: "phenolphthalein",
            name: "Phénolphtaléine",
            formula: "C₂₀H₁₂O₄",
            category: "indicator",
            state: "solution",
            color: "#eee7ff",
            ph: 7,
            density: 1,
            molarMass: 318.32,
            defaultVolume: 2,
            description: "Indicateur coloré acido-basique.",
            safety: "Simulation pédagogique."
        },

        {
            id: "ethanol",
            name: "Éthanol",
            formula: "C₂H₅OH",
            category: "solvent",
            state: "liquid",
            color: "#eefaff",
            ph: 7,
            density: 0.789,
            molarMass: 46.07,
            defaultVolume: 10,
            description: "Solvant organique.",
            safety: "Inflammable. Simulation uniquement."
        },

        {
            id: "acetone",
            name: "Acétone",
            formula: "C₃H₆O",
            category: "solvent",
            state: "liquid",
            color: "#edfaff",
            ph: 7,
            density: 0.79,
            molarMass: 58.08,
            defaultVolume: 10,
            description: "Solvant organique volatil.",
            safety: "Inflammable. Simulation uniquement."
        },

        {
            id: "carbon_dioxide",
            name: "Dioxyde de carbone",
            formula: "CO₂",
            category: "gas",
            state: "gas",
            color: "#dcecf6",
            ph: null,
            density: 0.00198,
            molarMass: 44.01,
            defaultVolume: 0,
            description: "Gaz produit par certains modèles.",
            safety: "Gaz simulé."
        },

        {
            id: "oxygen",
            name: "Dioxygène",
            formula: "O₂",
            category: "gas",
            state: "gas",
            color: "#e8f4ff",
            ph: null,
            density: 0.00143,
            molarMass: 32,
            defaultVolume: 0,
            description: "Gaz comburant.",
            safety: "Simulation uniquement."
        },

        {
            id: "hydrogen",
            name: "Dihydrogène",
            formula: "H₂",
            category: "gas",
            state: "gas",
            color: "#edfaff",
            ph: null,
            density: 0.00009,
            molarMass: 2.016,
            defaultVolume: 0,
            description: "Gaz moléculaire.",
            safety: "Très inflammable. Simulation uniquement."
        },

        {
            id: "copper",
            name: "Cuivre",
            formula: "Cu",
            category: "metal",
            state: "solid",
            color: "#b87333",
            ph: null,
            density: 8.96,
            molarMass: 63.55,
            defaultMass: 5,
            description: "Métal cuivreux.",
            safety: "Manipulation pédagogique."
        },

        {
            id: "iron",
            name: "Fer",
            formula: "Fe",
            category: "metal",
            state: "solid",
            color: "#89939c",
            ph: null,
            density: 7.87,
            molarMass: 55.85,
            defaultMass: 5,
            description: "Métal ferreux.",
            safety: "Manipulation pédagogique."
        },

        {
            id: "zinc",
            name: "Zinc",
            formula: "Zn",
            category: "metal",
            state: "solid",
            color: "#a3adb7",
            density: 7.14,
            molarMass: 65.38,
            defaultMass: 5,
            description: "Métal zinc.",
            safety: "Manipulation pédagogique."
        },

        {
            id: "magnesium",
            name: "Magnésium",
            formula: "Mg",
            category: "metal",
            state: "solid",
            color: "#bfc5ca",
            density: 1.74,
            molarMass: 24.31,
            defaultMass: 3,
            description: "Métal alcalino-terreux.",
            safety: "Simulation uniquement."
        },

        {
            id: "aluminum",
            name: "Aluminium",
            formula: "Al",
            category: "metal",
            state: "solid",
            color: "#c5ccd2",
            density: 2.70,
            molarMass: 26.98,
            defaultMass: 5,
            description: "Métal léger.",
            safety: "Manipulation pédagogique."
        },

        {
            id: "iodine",
            name: "Iode",
            formula: "I₂",
            category: "special",
            state: "solid",
            color: "#5b3a75",
            density: 4.93,
            molarMass: 253.8,
            defaultMass: 1,
            description: "Élément halogéné représenté comme solide.",
            safety: "Simulation uniquement."
        },

        {
            id: "phenol_red",
            name: "Rouge de phénol",
            formula: "Ind.",
            category: "indicator",
            state: "solution",
            color: "#f39b9b",
            ph: 7,
            density: 1,
            molarMass: null,
            defaultVolume: 2,
            description: "Indicateur coloré.",
            safety: "Simulation pédagogique."
        }

    ];


    function chemical(id) {
        return U.clone(
            CHEMICALS.find(function (item) {
                return item.id === id;
            }) || null
        );
    }


    /* ============================================================
       05. GLASSWARE
       ============================================================ */

    const GLASSWARE = [

        {
            id: "beaker_100",
            name: "Bécher 100 mL",
            category: "glassware",
            type: "beaker",
            capacity: 100,
            width: 105,
            height: 120
        },

        {
            id: "beaker_250",
            name: "Bécher 250 mL",
            category: "glassware",
            type: "beaker",
            capacity: 250,
            width: 125,
            height: 140
        },

        {
            id: "beaker_500",
            name: "Bécher 500 mL",
            category: "glassware",
            type: "beaker",
            capacity: 500,
            width: 145,
            height: 160
        },

        {
            id: "erlenmeyer_250",
            name: "Erlenmeyer 250 mL",
            category: "glassware",
            type: "flask",
            capacity: 250,
            width: 120,
            height: 150
        },

        {
            id: "erlenmeyer_500",
            name: "Erlenmeyer 500 mL",
            category: "glassware",
            type: "flask",
            capacity: 500,
            width: 140,
            height: 170
        },

        {
            id: "test_tube",
            name: "Tube à essai",
            category: "glassware",
            type: "test-tube",
            capacity: 25,
            width: 65,
            height: 130
        },

        {
            id: "graduated_cylinder_100",
            name: "Éprouvette graduée 100 mL",
            category: "glassware",
            type: "graduated-cylinder",
            capacity: 100,
            width: 70,
            height: 155
        },

        {
            id: "graduated_cylinder_250",
            name: "Éprouvette graduée 250 mL",
            category: "glassware",
            type: "graduated-cylinder",
            capacity: 250,
            width: 80,
            height: 175
        },

        {
            id: "round_flask",
            name: "Ballon à fond rond",
            category: "glassware",
            type: "round-flask",
            capacity: 250,
            width: 125,
            height: 150
        },

        {
            id: "watch_glass",
            name: "Verre de montre",
            category: "glassware",
            type: "watch-glass",
            capacity: 30,
            width: 115,
            height: 45
        },

        {
            id: "evaporating_dish",
            name: "Capsule d'évaporation",
            category: "glassware",
            type: "dish",
            capacity: 80,
            width: 125,
            height: 55
        },

        {
            id: "funnel",
            name: "Entonnoir",
            category: "glassware",
            type: "funnel",
            capacity: 100,
            width: 90,
            height: 120
        }

    ];


    function glass(id) {
        return U.clone(
            GLASSWARE.find(function (item) {
                return item.id === id;
            }) || null
        );
    }


    /* ============================================================
       06. EQUIPMENT / TOOLS
       ============================================================ */

    const EQUIPMENT = [

        {
            id: "bunsen_burner",
            name: "Bec Bunsen",
            category: "equipment",
            type: "burner"
        },

        {
            id: "tripod",
            name: "Trépied",
            category: "equipment",
            type: "tripod"
        },

        {
            id: "thermometer",
            name: "Thermomètre",
            category: "equipment",
            type: "thermometer"
        },

        {
            id: "balance",
            name: "Balance électronique",
            category: "equipment",
            type: "balance"
        },

        {
            id: "magnetic_stirrer",
            name: "Agitateur magnétique",
            category: "equipment",
            type: "stirrer"
        },

        {
            id: "spatula",
            name: "Spatule",
            category: "tools",
            type: "spatula"
        },

        {
            id: "pipette",
            name: "Pipette",
            category: "tools",
            type: "pipette"
        },

        {
            id: "dropper",
            name: "Compte-gouttes",
            category: "tools",
            type: "dropper"
        },

        {
            id: "forceps",
            name: "Pince",
            category: "tools",
            type: "forceps"
        },

        {
            id: "test_tube_rack",
            name: "Porte-tubes",
            category: "equipment",
            type: "rack"
        },

        {
            id: "scale",
            name: "Balance de laboratoire",
            category: "equipment",
            type: "scale"
        }

    ];


    function equipment(id) {
        return U.clone(
            EQUIPMENT.find(function (item) {
                return item.id === id;
            }) || null
        );
    }


    /* ============================================================
       07. REACTION DATABASE
       ------------------------------------------------------------
       NO AUTOMATIC / INVENTED CHEMISTRY.
       Only explicitly defined models execute.
       ============================================================ */

    const REACTIONS = [

        {
            id: "acid_bicarbonate",
            name: "Acide acétique + bicarbonate de sodium",
            type: "acid-carbonate",
            level: "Débutant",

            reactants: [
                {
                    id: "acetic_acid",
                    ratio: 1
                },
                {
                    id: "sodium_bicarbonate",
                    ratio: 1
                }
            ],

            products: [
                {
                    name: "Acétate de sodium",
                    formula: "CH₃COONa"
                },
                {
                    name: "Dioxyde de carbone",
                    formula: "CO₂"
                },
                {
                    name: "Eau",
                    formula: "H₂O"
                }
            ],

            equation:
                "CH₃COOH + NaHCO₃ → CH₃COONa + CO₂ + H₂O",

            observations: [
                "Effervescence visible.",
                "Dégagement simulé de CO₂.",
                "Formation d'un mélange homogène après agitation."
            ],

            finalState:
                "Réaction acide-carbonate modélisée.",

            calculate: function (context) {

                const a = U.num(
                    context.amounts.acetic_acid,
                    1
                );

                const b = U.num(
                    context.amounts.sodium_bicarbonate,
                    1
                );

                return {
                    extent: Math.min(a, b),
                    pH: 7,
                    temperatureDelta: 1,
                    gas: "CO₂"
                };
            }
        },


        {
            id: "hcl_naoh",
            name: "Neutralisation HCl + NaOH",
            type: "neutralization",
            level: "Intermédiaire",

            reactants: [
                {
                    id: "hydrochloric_acid",
                    ratio: 1
                },
                {
                    id: "sodium_hydroxide",
                    ratio: 1
                }
            ],

            products: [
                {
                    name: "Chlorure de sodium",
                    formula: "NaCl"
                },
                {
                    name: "Eau",
                    formula: "H₂O"
                }
            ],

            equation:
                "HCl + NaOH → NaCl + H₂O",

            observations: [
                "Neutralisation acide-base modélisée.",
                "Le pH dépend du rapport entre les quantités.",
                "Une légère variation thermique pédagogique est affichée."
            ],

            finalState:
                "Neutralisation acide-base effectuée.",

            calculate: function (context) {

                const a = U.num(
                    context.amounts.hydrochloric_acid,
                    1
                );

                const b = U.num(
                    context.amounts.sodium_hydroxide,
                    1
                );

                let pH = 7;

                if (a > b) {
                    pH = 3;
                }

                if (b > a) {
                    pH = 11;
                }

                return {
                    extent: Math.min(a, b),
                    pH: pH,
                    temperatureDelta: 2
                };
            }
        },


        {
            id: "indicator_acid",
            name: "Indicateur universel + acide acétique",
            type: "indicator",
            level: "Débutant",

            reactants: [
                {
                    id: "universal_indicator",
                    ratio: 1
                },
                {
                    id: "acetic_acid",
                    ratio: 1
                }
            ],

            products: [
                {
                    name: "Solution indicatrice acide",
                    formula: "Ind.(aq)"
                }
            ],

            equation:
                "Indicateur universel + CH₃COOH → coloration acide",

            observations: [
                "L'indicateur change de couleur.",
                "Le milieu est classé comme acide.",
                "Le pH simulé est inférieur à 7."
            ],

            finalState:
                "Milieu acide détecté par l'indicateur.",

            calculate: function () {

                return {
                    extent: 1,
                    pH: 2.4,
                    color: "#ef5b73"
                };
            }
        },


        {
            id: "indicator_base",
            name: "Indicateur universel + NaOH",
            type: "indicator",
            level: "Débutant",

            reactants: [
                {
                    id: "universal_indicator",
                    ratio: 1
                },
                {
                    id: "sodium_hydroxide",
                    ratio: 1
                }
            ],

            products: [
                {
                    name: "Solution indicatrice basique",
                    formula: "Ind.(aq)"
                }
            ],

            equation:
                "Indicateur universel + NaOH → coloration basique",

            observations: [
                "L'indicateur change de couleur.",
                "Le milieu est classé comme basique.",
                "Le pH simulé est supérieur à 7."
            ],

            finalState:
                "Milieu basique détecté.",

            calculate: function () {

                return {
                    extent: 1,
                    pH: 13,
                    color: "#6357e8"
                };
            }
        },


        {
            id: "copper_sulfate_dissolution",
            name: "Dissolution du sulfate de cuivre",
            type: "dissolution",
            level: "Débutant",

            reactants: [
                {
                    id: "copper_sulfate",
                    ratio: 1
                },
                {
                    id: "water",
                    ratio: 1
                }
            ],

            products: [
                {
                    name: "Solution aqueuse de sulfate de cuivre",
                    formula: "CuSO₄(aq)"
                }
            ],

            equation:
                "CuSO₄(s) + H₂O(l) → CuSO₄(aq)",

            observations: [
                "Le solide est considéré comme dissous dans le modèle.",
                "La solution devient bleue.",
                "Le mélange devient homogène."
            ],

            finalState:
                "Solution aqueuse bleue.",

            calculate: function () {

                return {
                    extent: 1,
                    pH: 4,
                    color: "#287fe8"
                };
            }
        },


        {
            id: "silver_chloride_precipitation",
            name: "Précipitation du chlorure d'argent",
            type: "precipitation",
            level: "Intermédiaire",

            reactants: [
                {
                    id: "silver_nitrate",
                    ratio: 1
                },
                {
                    id: "sodium_chloride",
                    ratio: 1
                }
            ],

            products: [
                {
                    name: "Chlorure d'argent",
                    formula: "AgCl(s)"
                },
                {
                    name: "Nitrate de sodium",
                    formula: "NaNO₃(aq)"
                }
            ],

            equation:
                "AgNO₃ + NaCl → AgCl↓ + NaNO₃",

            observations: [
                "Un précipité blanc est simulé.",
                "La solution contient un solide précipité.",
                "Le modèle représente une réaction de précipitation."
            ],

            finalState:
                "Précipité blanc de AgCl modélisé.",

            calculate: function (context) {

                const a = U.num(
                    context.amounts.silver_nitrate,
                    1
                );

                const b = U.num(
                    context.amounts.sodium_chloride,
                    1
                );

                return {
                    extent: Math.min(a, b),
                    pH: 7,
                    precipitate: "AgCl",
                    color: "#f4f4f4"
                };
            }
        },


        {
            id: "zinc_hcl",
            name: "Zinc + acide chlorhydrique",
            type: "metal-acid",
            level: "Intermédiaire",

            reactants: [
                {
                    id: "zinc",
                    ratio: 1
                },
                {
                    id: "hydrochloric_acid",
                    ratio: 2
                }
            ],

            products: [
                {
                    name: "Chlorure de zinc",
                    formula: "ZnCl₂"
                },
                {
                    name: "Dihydrogène",
                    formula: "H₂"
                }
            ],

            equation:
                "Zn + 2HCl → ZnCl₂ + H₂↑",

            observations: [
                "Effervescence simulée.",
                "Dégagement de dihydrogène modélisé.",
                "Le métal zinc est consommé selon le modèle."
            ],

            finalState:
                "Réaction métal-acide modélisée.",

            calculate: function (context) {

                const zinc = U.num(
                    context.amounts.zinc,
                    1
                );

                const acid = U.num(
                    context.amounts.hydrochloric_acid,
                    2
                );

                return {
                    extent: Math.min(
                        zinc,
                        acid / 2
                    ),
                    gas: "H₂",
                    pH: 2
                };
            }
        }

    ];


    /* ============================================================
       08. DATABASE SEARCH
       ============================================================ */

    function libraryData() {

        return []
            .concat(
                CHEMICALS.map(function (x) {
                    return {
                        source: "chemical",
                        data: x
                    };
                })
            )
            .concat(
                GLASSWARE.map(function (x) {
                    return {
                        source: "glassware",
                        data: x
                    };
                })
            )
            .concat(
                EQUIPMENT.map(function (x) {
                    return {
                        source: "equipment",
                        data: x
                    };
                })
            );
    }


    function searchLibrary(query, category) {

        query = U.lower(query || "").trim();
        category = category || "all";

        return libraryData().filter(function (entry) {

            const item = entry.data;

            if (
                category !== "all" &&
                category !== "" &&
                item.category !== category
            ) {
                return false;
            }

            if (!query) {
                return true;
            }

            return U.lower(
                [
                    item.name,
                    item.formula,
                    item.category,
                    item.type,
                    item.description,
                    item.id
                ].join(" ")
            ).indexOf(query) !== -1;
        });
    }


    /* ============================================================
       09. STATE
       ============================================================ */

    function defaultState() {

        const now = U.date();

        return {
            experiment: {
                id: U.id("EXP"),
                name: "Nouvelle expérience",
                createdAt: now,
                updatedAt: now
            },

            objects: [],

            selectedId: null,

            tool: "select",

            zoom: 1,

            stage: {
                offsetX: 0,
                offsetY: 0
            },

            reactionResult: null,

            journal: [],

            history: [],

            future: [],

            counters: {
                actions: 0,
                objects: 0,
                reactions: 0
            },

            pipetteSourceId: null
        };
    }


    function resetState() {
        APP.state = defaultState();
    }


    function snapshot() {

        const copy = U.clone(APP.state);

        copy.history = [];
        copy.future = [];

        return copy;
    }


    function restoreSnapshot(state) {

        if (!state) return;

        const currentHistory = APP.state.history || [];
        const currentFuture = APP.state.future || [];

        APP.state = U.clone(state);

        APP.state.history = currentHistory;
        APP.state.future = currentFuture;

        normalizeState();
    }


    function normalizeState() {

        if (!APP.state) {
            APP.state = defaultState();
        }

        if (!Array.isArray(APP.state.objects)) {
            APP.state.objects = [];
        }

        if (!Array.isArray(APP.state.journal)) {
            APP.state.journal = [];
        }

        if (!Array.isArray(APP.state.history)) {
            APP.state.history = [];
        }

        if (!Array.isArray(APP.state.future)) {
            APP.state.future = [];
        }

        if (!APP.state.stage) {
            APP.state.stage = {
                offsetX: 0,
                offsetY: 0
            };
        }

        APP.state.zoom = U.clamp(
            U.num(APP.state.zoom, 1),
            0.5,
            2.5
        );

        APP.state.objects.forEach(function (object) {

            object.x = U.num(object.x, 80);
            object.y = U.num(object.y, 80);
            object.scale = U.clamp(
                U.num(object.scale, 1),
                0.5,
                2
            );

            object.rotation = U.num(
                object.rotation,
                0
            );

            if (!Array.isArray(object.contents)) {
                object.contents = [];
            }

            if (!object.properties) {
                object.properties = {};
            }

            if (object.type === "container") {

                object.volume = U.num(
                    object.volume,
                    0
                );

                object.capacity = U.num(
                    object.capacity,
                    100
                );

                object.temperature = U.num(
                    object.temperature,
                    25
                );

                object.ph = object.ph == null
                    ? 7
                    : U.num(object.ph, 7);
            }
        });
    }


    /* ============================================================
       10. HISTORY
       ============================================================ */

    function commit(label) {

        const before = snapshot();

        APP.state.history.push(before);

        if (
            APP.state.history.length >
            APP.MAX_HISTORY
        ) {
            APP.state.history.shift();
        }

        APP.state.future = [];

        APP.state.counters.actions++;

        APP.state.experiment.updatedAt = U.date();

        if (label) {
            journal(label);
        }
    }


    function undo() {

        if (!APP.state.history.length) {
            notify("Aucune action à annuler.", "info");
            return;
        }

        const current = snapshot();

        const previous =
            APP.state.history.pop();

        APP.state.future.push(current);

        restoreSnapshot(previous);

        renderAll();

        notify("Action annulée.", "success");
    }


    function redo() {

        if (!APP.state.future.length) {
            notify("Aucune action à rétablir.", "info");
            return;
        }

        const current = snapshot();

        const next =
            APP.state.future.pop();

        APP.state.history.push(current);

        restoreSnapshot(next);

        renderAll();

        notify("Action rétablie.", "success");
    }


    /* ============================================================
       11. JOURNAL
       ============================================================ */

    function journal(text) {

        if (!text) return;

        APP.state.journal.push({
            id: U.id("LOG"),
            time: U.time(),
            text: text
        });

        if (APP.state.journal.length > 200) {
            APP.state.journal.shift();
        }
    }


    function renderJournal() {

        if (!APP.dom.journal) return;

        if (!APP.state.journal.length) {

            APP.dom.journal.innerHTML =
                '<div class="journal-empty">' +
                'Aucune action enregistrée.' +
                '</div>';

            return;
        }

        APP.dom.journal.innerHTML =
            APP.state.journal
                .slice()
                .reverse()
                .map(function (entry) {

                    return (
                        '<div class="journal-entry">' +
                        '<span class="journal-time">' +
                        U.esc(entry.time) +
                        '</span>' +
                        '<span class="journal-text">' +
                        U.esc(entry.text) +
                        '</span>' +
                        '</div>'
                    );
                })
                .join("");
    }


    /* ============================================================
       12. NOTIFICATION
       ============================================================ */

    function notify(message, type) {

        type = type || "info";

        if (!APP.dom.notification) {

            console.log(
                "[CHIMIQUE FOBAS]",
                message
            );

            return;
        }

        const item =
            document.createElement("div");

        item.className =
            "cf-notification cf-notification-" +
            type;

        item.textContent = message;

        APP.dom.notification.appendChild(item);

        requestAnimationFrame(function () {
            item.classList.add("show");
        });

        setTimeout(function () {

            item.classList.remove("show");

            setTimeout(function () {
                if (item.parentNode) {
                    item.parentNode.removeChild(item);
                }
            }, 250);

        }, 3000);
    }


    /* ============================================================
       13. VISUAL ICON ENGINE
       ------------------------------------------------------------
       No external images.
       SVG is generated locally so the search can ALWAYS
       produce a visual representation.
       ============================================================ */

    function iconSVG(entry) {

        const item = entry.data;

        if (entry.source === "chemical") {

            let color =
                item.color || "#dfefff";

            let symbol =
                item.formula || "?";

            if (item.state === "solid") {

                return (
                    '<svg viewBox="0 0 100 100" class="cf-svg">' +
                    '<defs>' +
                    '<linearGradient id="solid_' + item.id + '" x1="0" y1="0" x2="1" y2="1">' +
                    '<stop offset="0%" stop-color="' + U.esc(color) + '"/>' +
                    '<stop offset="100%" stop-color="#ffffff"/>' +
                    '</linearGradient>' +
                    '</defs>' +
                    '<path d="M24 36 L72 27 L84 61 L35 75 Z" fill="url(#solid_' + item.id + ')" stroke="#6d7883" stroke-width="2"/>' +
                    '<circle cx="42" cy="49" r="3" fill="#fff" opacity=".8"/>' +
                    '<circle cx="59" cy="43" r="3" fill="#fff" opacity=".65"/>' +
                    '<circle cx="68" cy="58" r="3" fill="#fff" opacity=".7"/>' +
                    '</svg>'
                );
            }

            if (item.state === "gas") {

                return (
                    '<svg viewBox="0 0 100 100" class="cf-svg">' +
                    '<circle cx="35" cy="55" r="15" fill="' + U.esc(color) + '" opacity=".55"/>' +
                    '<circle cx="58" cy="38" r="19" fill="' + U.esc(color) + '" opacity=".4"/>' +
                    '<circle cx="70" cy="65" r="11" fill="' + U.esc(color) + '" opacity=".5"/>' +
                    '<text x="50" y="90" text-anchor="middle" font-size="13" font-weight="700" fill="#344454">' +
                    U.esc(symbol) +
                    '</text>' +
                    '</svg>'
                );
            }

            return (
                '<svg viewBox="0 0 100 100" class="cf-svg">' +

                '<defs>' +
                '<linearGradient id="liq_' + item.id + '" x1="0" y1="0" x2="0" y2="1">' +
                '<stop offset="0%" stop-color="#ffffff" stop-opacity=".9"/>' +
                '<stop offset="45%" stop-color="' + U.esc(color) + '" stop-opacity=".85"/>' +
                '<stop offset="100%" stop-color="' + U.esc(color) + '" stop-opacity=".98"/>' +
                '</linearGradient>' +
                '</defs>' +

                '<path d="M25 22 L75 22 L70 73 Q50 88 30 73 Z" fill="url(#liq_' + item.id + ')" stroke="#687887" stroke-width="2"/>' +

                '<path d="M31 55 Q50 48 69 55 L67 72 Q50 82 33 72 Z" fill="' + U.esc(color) + '" opacity=".75"/>' +

                '<ellipse cx="50" cy="22" rx="25" ry="6" fill="#ffffff" fill-opacity=".35" stroke="#657584" stroke-width="2"/>' +

                '<text x="50" y="49" text-anchor="middle" font-size="12" font-weight="800" fill="#344454">' +
                U.esc(symbol) +
                '</text>' +

                '</svg>'
            );
        }


        if (entry.source === "glassware") {

            if (item.type === "beaker") {

                return (
                    '<svg viewBox="0 0 100 120" class="cf-svg">' +
                    '<path d="M22 15 L78 15 L73 98 Q50 108 27 98 Z" fill="#dff5ff" fill-opacity=".55" stroke="#60798c" stroke-width="2"/>' +
                    '<path d="M28 63 Q50 55 72 63 L70 94 Q50 103 30 94 Z" fill="#8bd9ef" fill-opacity=".65"/>' +
                    '<path d="M22 15 L78 15" stroke="#526d80" stroke-width="4"/>' +
                    '<path d="M29 30 L38 30 M29 40 L35 40 M29 50 L38 50" stroke="#70899a" stroke-width="2"/>' +
                    '</svg>'
                );
            }

            if (item.type === "flask" || item.type === "round-flask") {

                return (
                    '<svg viewBox="0 0 100 130" class="cf-svg">' +
                    '<path d="M42 12 L58 12 L58 48 Q82 62 78 92 Q74 112 50 116 Q26 112 22 92 Q18 62 42 48 Z" fill="#dff5ff" fill-opacity=".55" stroke="#60798c" stroke-width="2"/>' +
                    '<path d="M26 82 Q50 72 74 82 Q73 106 50 111 Q27 106 26 82Z" fill="#91dced" fill-opacity=".7"/>' +
                    '</svg>'
                );
            }

            if (item.type === "test-tube") {

                return (
                    '<svg viewBox="0 0 80 130" class="cf-svg">' +
                    '<path d="M25 12 L55 12 L55 91 Q54 112 40 118 Q26 112 25 91 Z" fill="#dff5ff" fill-opacity=".6" stroke="#60798c" stroke-width="2"/>' +
                    '<path d="M27 68 Q40 62 53 68 L53 92 Q40 108 27 92 Z" fill="#79cce5" fill-opacity=".7"/>' +
                    '<path d="M23 12 L57 12" stroke="#506b7c" stroke-width="5"/>' +
                    '</svg>'
                );
            }

            if (item.type === "graduated-cylinder") {

                return (
                    '<svg viewBox="0 0 80 150" class="cf-svg">' +
                    '<path d="M24 12 L56 12 L53 130 Q40 140 27 130 Z" fill="#e8f8ff" fill-opacity=".6" stroke="#60798c" stroke-width="2"/>' +
                    '<path d="M28 92 Q40 88 52 92 L51 128 Q40 136 29 128Z" fill="#8bd8e8" fill-opacity=".7"/>' +
                    '<path d="M28 32 L39 32 M28 43 L36 43 M28 54 L39 54 M28 65 L36 65" stroke="#718998" stroke-width="2"/>' +
                    '</svg>'
                );
            }

            if (item.type === "watch-glass" ||
                item.type === "dish") {

                return (
                    '<svg viewBox="0 0 120 60" class="cf-svg">' +
                    '<path d="M10 26 Q60 5 110 26 Q105 49 60 52 Q15 49 10 26Z" fill="#dff5ff" fill-opacity=".65" stroke="#60798c" stroke-width="2"/>' +
                    '<ellipse cx="60" cy="30" rx="40" ry="11" fill="#ffffff" fill-opacity=".25"/>' +
                    '</svg>'
                );
            }

            if (item.type === "funnel") {

                return (
                    '<svg viewBox="0 0 100 130" class="cf-svg">' +
                    '<path d="M10 18 L90 18 L58 60 L55 112 L45 112 L42 60 Z" fill="#dff5ff" fill-opacity=".55" stroke="#60798c" stroke-width="2"/>' +
                    '</svg>'
                );
            }
        }


        if (entry.source === "equipment") {

            if (item.type === "burner") {

                return (
                    '<svg viewBox="0 0 100 100" class="cf-svg">' +
                    '<path d="M32 72 L68 72 L62 85 L38 85Z" fill="#56636d"/>' +
                    '<rect x="40" y="48" width="20" height="25" rx="3" fill="#7d8992"/>' +
                    '<path d="M50 47 C35 34 48 20 50 10 C66 28 63 38 50 47Z" fill="#ff9e32"/>' +
                    '</svg>'
                );
            }

            if (item.type === "thermometer") {

                return (
                    '<svg viewBox="0 0 80 140" class="cf-svg">' +
                    '<circle cx="40" cy="115" r="15" fill="#e75b5b"/>' +
                    '<rect x="34" y="25" width="12" height="91" rx="6" fill="#ffffff" stroke="#657786" stroke-width="2"/>' +
                    '<rect x="37" y="50" width="6" height="67" rx="3" fill="#e75b5b"/>' +
                    '</svg>'
                );
            }

            if (item.type === "pipette") {

                return (
                    '<svg viewBox="0 0 130 80" class="cf-svg">' +
                    '<path d="M15 32 L92 32 L112 40 L92 48 L15 48 Z" fill="#e7f6ff" stroke="#60798c" stroke-width="2"/>' +
                    '<rect x="25" y="28" width="45" height="24" rx="8" fill="#d5ebf7" stroke="#60798c" stroke-width="2"/>' +
                    '<path d="M112 36 L125 40 L112 44Z" fill="#78909f"/>' +
                    '</svg>'
                );
            }

            if (item.type === "stirrer") {

                return (
                    '<svg viewBox="0 0 120 90" class="cf-svg">' +
                    '<rect x="15" y="35" width="90" height="35" rx="8" fill="#66737e"/>' +
                    '<rect x="27" y="44" width="66" height="12" rx="4" fill="#27343f"/>' +
                    '<circle cx="89" cy="62" r="5" fill="#9edcf0"/>' +
                    '</svg>'
                );
            }

            return (
                '<svg viewBox="0 0 100 100" class="cf-svg">' +
                '<circle cx="50" cy="50" r="30" fill="#e7f6ff" stroke="#65798a" stroke-width="3"/>' +
                '<text x="50" y="56" text-anchor="middle" font-size="15" font-weight="800" fill="#40515f">' +
                U.esc(item.name.slice(0, 3)) +
                '</text>' +
                '</svg>'
            );
        }

        return "";
    }


    /* ============================================================
       14. LIBRARY RENDERER
       ============================================================ */

    let activeLibraryCategory = "all";


    function renderLibrary() {

        if (!APP.dom.libraryItems) return;

        const query =
            APP.dom.librarySearch
                ? APP.dom.librarySearch.value
                : "";

        const results =
            searchLibrary(
                query,
                activeLibraryCategory
            );

        if (!results.length) {

            APP.dom.libraryItems.innerHTML = "";

            if (APP.dom.libraryEmpty) {
                APP.dom.libraryEmpty.style.display = "";
            }

            return;
        }

        if (APP.dom.libraryEmpty) {
            APP.dom.libraryEmpty.style.display = "none";
        }

        APP.dom.libraryItems.innerHTML =
            results.map(function (entry) {

                const item = entry.data;

                return (
                    '<div class="library-item cf-library-item" ' +
                    'data-library-source="' +
                    U.esc(entry.source) +
                    '" ' +
                    'data-library-id="' +
                    U.esc(item.id) +
                    '" ' +
                    'draggable="true">' +

                    '<div class="library-item-visual">' +
                    iconSVG(entry) +
                    '</div>' +

                    '<div class="library-item-info">' +

                    '<div class="library-item-name">' +
                    U.esc(item.name) +
                    '</div>' +

                    (
                        item.formula
                            ? '<div class="library-item-formula">' +
                              U.esc(item.formula) +
                              '</div>'
                            : ""
                    ) +

                    '<div class="library-item-category">' +
                    U.esc(item.category || item.type || "") +
                    '</div>' +

                    '</div>' +

                    '</div>'
                );

            }).join("");
    }


    function setLibraryCategory(category) {

        activeLibraryCategory =
            category || "all";

        U.$$(".library-tab").forEach(
            function (tab) {

                const value =
                    tab.dataset.category ||
                    tab.dataset.filter ||
                    tab.dataset.tab;

                tab.classList.toggle(
                    "active",
                    value === activeLibraryCategory
                );
            }
        );

        U.$$(".filter-button").forEach(
            function (button) {

                const value =
                    button.dataset.category ||
                    button.dataset.filter;

                button.classList.toggle(
                    "active",
                    value === activeLibraryCategory
                );
            }
        );

        renderLibrary();
    }


    /* ============================================================
       15. REACTION LIBRARY
       ============================================================ */

    function renderReactionLibrary() {

        if (!APP.dom.reactionItems) return;

        const query =
            APP.dom.reactionSearch
                ? U.lower(
                    APP.dom.reactionSearch.value
                )
                : "";

        const results =
            REACTIONS.filter(function (reaction) {

                if (!query) return true;

                return U.lower(
                    [
                        reaction.name,
                        reaction.type,
                        reaction.level,
                        reaction.equation
                    ].join(" ")
                ).indexOf(query) !== -1;
            });

        APP.dom.reactionItems.innerHTML =
            results.map(function (reaction) {

                return (
                    '<div class="reaction-item cf-reaction-item" ' +
                    'data-reaction-id="' +
                    U.esc(reaction.id) +
                    '">' +

                    '<div class="reaction-item-name">' +
                    U.esc(reaction.name) +
                    '</div>' +

                    '<div class="reaction-item-equation">' +
                    U.esc(reaction.equation) +
                    '</div>' +

                    '<div class="reaction-item-level">' +
                    U.esc(reaction.level) +
                    '</div>' +

                    '</div>'
                );

            }).join("");
    }


    /* ============================================================
       16. OBJECT CREATION
       ============================================================ */

    function createChemicalObject(item) {

        return {
            id: U.id("OBJ"),

            source: "chemical",

            type: "substance",

            itemId: item.id,

            name: item.name,

            formula: item.formula,

            category: item.category,

            state: item.state,

            color: item.color,

            x: 100,

            y: 100,

            scale: 1,

            rotation: 0,

            contents: [],

            properties: {
                ph: item.ph,
                density: item.density,
                molarMass: item.molarMass,
                mass: U.num(item.defaultMass, 0),
                volume: U.num(item.defaultVolume, 0)
            }
        };
    }


    function createGlassObject(item) {

        return {
            id: U.id("OBJ"),

            source: "glassware",

            type: "container",

            itemId: item.id,

            name: item.name,

            category: item.category,

            glassType: item.type,

            capacity: U.num(item.capacity, 100),

            volume: 0,

            temperature: 25,

            ph: 7,

            x: 100,

            y: 100,

            scale: 1,

            rotation: 0,

            contents: [],

            properties: {}
        };
    }


    function createEquipmentObject(item) {

        return {
            id: U.id("OBJ"),

            source: "equipment",

            type: "equipment",

            itemId: item.id,

            name: item.name,

            category: item.category,

            equipmentType: item.type,

            x: 100,

            y: 100,

            scale: 1,

            rotation: 0,

            contents: [],

            properties: {}
        };
    }


    /* ============================================================
       17. STAGE POSITION
       ============================================================ */

    function stagePoint(event) {

        if (!APP.dom.stageObjects) {
            return {
                x: 100,
                y: 100
            };
        }

        const rect =
            APP.dom.stageObjects.getBoundingClientRect();

        const zoom =
            APP.state.zoom || 1;

        return {
            x:
                (event.clientX - rect.left) /
                    zoom -
                (APP.state.stage.offsetX || 0),

            y:
                (event.clientY - rect.top) /
                    zoom -
                (APP.state.stage.offsetY || 0)
        };
    }


    function placeObject(object, x, y) {

        object.x =
            U.clamp(
                U.num(x, 100),
                20,
                Math.max(
                    30,
                    (APP.dom.stageObjects
                        ? APP.dom.stageObjects.clientWidth
                        : 1200) - 40
                )
            );

        object.y =
            U.clamp(
                U.num(y, 100),
                20,
                Math.max(
                    30,
                    (APP.dom.stageObjects
                        ? APP.dom.stageObjects.clientHeight
                        : 800) - 40
                )
            );
    }


    /* ============================================================
       18. ADD OBJECT
       ============================================================ */

    function addLibraryObject(source, id, x, y) {

        let object = null;

        if (source === "chemical") {

            const item = chemical(id);

            if (!item) {
                notify(
                    "Substance introuvable.",
                    "error"
                );
                return;
            }

            object =
                createChemicalObject(item);
        }

        else if (source === "glassware") {

            const item = glass(id);

            if (!item) {
                notify(
                    "Verrerie introuvable.",
                    "error"
                );
                return;
            }

            object =
                createGlassObject(item);
        }

        else if (source === "equipment") {

            const item = equipment(id);

            if (!item) {
                notify(
                    "Équipement introuvable.",
                    "error"
                );
                return;
            }

            object =
                createEquipmentObject(item);
        }

        if (!object) return;

        placeObject(
            object,
            x === undefined ? 100 : x,
            y === undefined ? 100 : y
        );

        commit(
            "Ajout de " + object.name
        );

        APP.state.objects.push(object);

        APP.state.selectedId =
            object.id;

        APP.state.counters.objects++;

        renderAll();

        notify(
            object.name +
            " ajouté au laboratoire.",
            "success"
        );
    }


    /* ============================================================
       19. OBJECT RENDERING
       ============================================================ */

    function objectIcon(object) {

        if (object.source === "chemical") {

            return iconSVG({
                source: "chemical",
                data: chemical(object.itemId)
            });
        }

        if (object.source === "glassware") {

            return iconSVG({
                source: "glassware",
                data: glass(object.itemId)
            });
        }

        if (object.source === "equipment") {

            return iconSVG({
                source: "equipment",
                data: equipment(object.itemId)
            });
        }

        return "";
    }


    function contentsVisual(object) {

        if (
            object.type !== "container" ||
            !object.contents.length
        ) {
            return "";
        }

        let color = "#bfeaf5";

        const first =
            chemical(
                object.contents[0].substanceId
            );

        if (first && first.color) {
            color = first.color;
        }

        if (
            object.contents.some(function (x) {
                return x.substanceId ===
                    "copper_sulfate";
            })
        ) {
            color = "#278cff";
        }

        if (
            object.contents.some(function (x) {
                return x.substanceId ===
                    "universal_indicator";
            })
        ) {

            const pH =
                U.num(object.ph, 7);

            if (pH < 3) {
                color = "#ef5b73";
            }
            else if (pH < 6) {
                color = "#f39b38";
            }
            else if (pH < 8) {
                color = "#54d66b";
            }
            else if (pH < 11) {
                color = "#45a8ef";
            }
            else {
                color = "#625be8";
            }
        }

        const ratio =
            object.capacity > 0
                ? U.clamp(
                    object.volume /
                    object.capacity,
                    0.05,
                    0.85
                )
                : 0.1;

        return (
            '<div class="cf-container-liquid" ' +
            'style="' +
            'height:' +
            (ratio * 100) +
            '%;' +
            'background:' +
            U.esc(color) +
            ';">' +
            '</div>'
        );
    }


    function renderObjects() {

        if (!APP.dom.stageObjects) return;

        APP.dom.stageObjects.innerHTML =
            APP.state.objects
                .map(function (object) {

                    const selected =
                        object.id ===
                        APP.state.selectedId;

                    let visual = "";

                    if (
                        object.type ===
                        "container"
                    ) {

                        visual =
                            '<div class="cf-container-visual">' +

                            contentsVisual(object) +

                            objectIcon(object) +

                            '</div>';
                    }
                    else {

                        visual =
                            '<div class="cf-object-visual">' +
                            objectIcon(object) +
                            '</div>';
                    }

                    const label =
                        object.formula
                            ? object.name +
                              " (" +
                              object.formula +
                              ")"
                            : object.name;

                    return (
                        '<div class="cf-stage-object ' +
                        'stage-object ' +
                        (selected ? "selected " : "") +
                        'source-' +
                        U.esc(object.source) +
                        '" ' +

                        'data-object-id="' +
                        U.esc(object.id) +
                        '" ' +

                        'style="' +
                        'left:' +
                        object.x +
                        'px;' +
                        'top:' +
                        object.y +
                        'px;' +
                        'transform:translate(-50%,-50%) rotate(' +
                        object.rotation +
                        'deg) scale(' +
                        object.scale +
                        ');' +
                        '">' +

                        visual +

                        '<div class="cf-object-label">' +
                        U.esc(label) +
                        '</div>' +

                        '</div>'
                    );
                })
                .join("");

        updateEmptyStage();
    }


    function updateEmptyStage() {

        if (!APP.dom.emptyLaboratory) return;

        APP.dom.emptyLaboratory.style.display =
            APP.state.objects.length
                ? "none"
                : "";
    }


    /* ============================================================
       20. SELECTION
       ============================================================ */

    function selectedObject() {

        return APP.state.objects.find(
            function (object) {
                return object.id ===
                    APP.state.selectedId;
            }
        ) || null;
    }


    function selectObject(id) {

        if (
            !APP.state.objects.some(
                function (object) {
                    return object.id === id;
                }
            )
        ) {
            APP.state.selectedId = null;
        }
        else {
            APP.state.selectedId = id;
        }

        renderAll();
    }


    /* ============================================================
       21. INSPECTOR
       ============================================================ */

    function renderInspector() {

        const object =
            selectedObject();

        const panel =
            document.getElementById(
                "object-inspector"
            ) ||
            document.querySelector(
                ".object-inspector"
            ) ||
            document.querySelector(
                "[data-inspector]"
            );

        if (!panel) {

            renderContainerStatus();

            return;
        }

        if (!object) {

            panel.innerHTML =
                '<div class="inspector-empty">' +
                'Sélectionnez un objet du laboratoire.' +
                '</div>';

            renderContainerStatus();

            return;
        }

        let html =
            '<div class="inspector-title">' +
            U.esc(object.name) +
            '</div>';

        if (object.formula) {

            html +=
                '<div class="inspector-formula">' +
                U.esc(object.formula) +
                '</div>';
        }

        html +=
            '<div class="inspector-row">' +
            '<span>Type</span>' +
            '<strong>' +
            U.esc(object.source) +
            '</strong>' +
            '</div>';

        if (object.type === "container") {

            html +=
                '<div class="inspector-row">' +
                '<span>Volume</span>' +
                '<strong>' +
                U.format(object.volume, 2) +
                ' mL</strong>' +
                '</div>';

            html +=
                '<div class="inspector-row">' +
                '<span>Capacité</span>' +
                '<strong>' +
                U.format(object.capacity, 0) +
                ' mL</strong>' +
                '</div>';

            html +=
                '<div class="inspector-row">' +
                '<span>Température</span>' +
                '<strong>' +
                U.format(object.temperature, 1) +
                ' °C</strong>' +
                '</div>';

            html +=
                '<div class="inspector-row">' +
                '<span>pH</span>' +
                '<strong>' +
                U.format(object.ph, 2) +
                '</strong>' +
                '</div>';

            html +=
                '<div class="inspector-subtitle">' +
                'Contenu' +
                '</div>';

            if (!object.contents.length) {

                html +=
                    '<div class="inspector-empty">' +
                    'Conteneur vide.' +
                    '</div>';
            }
            else {

                html +=
                    '<div class="cf-content-list">' +
                    object.contents
                        .map(function (content) {

                            const c =
                                chemical(
                                    content.substanceId
                                );

                            return (
                                '<div class="cf-content-row">' +

                                '<span>' +
                                U.esc(
                                    c
                                        ? c.name
                                        : content.substanceId
                                ) +
                                '</span>' +

                                '<button type="button" ' +
                                'data-inspector-action="remove-content" ' +
                                'data-substance-id="' +
                                U.esc(
                                    content.substanceId
                                ) +
                                '">' +
                                '×' +
                                '</button>' +

                                '</div>'
                            );
                        })
                        .join("") +
                    '</div>';
            }
        }

        html +=
            '<div class="inspector-actions">' +

            '<button type="button" ' +
            'data-inspector-action="measure">' +
            'Mesurer' +
            '</button>' +

            '<button type="button" ' +
            'data-inspector-action="mix">' +
            'Mélanger' +
            '</button>' +

            '<button type="button" ' +
            'data-inspector-action="analyze">' +
            'Analyser' +
            '</button>' +

            '</div>';

        panel.innerHTML = html;

        renderContainerStatus();
    }


    function renderContainerStatus() {

        if (!APP.dom.containerStatus) return;

        const object =
            selectedObject();

        if (
            !object ||
            object.type !== "container"
        ) {

            APP.dom.containerStatus.innerHTML =
                '<div class="container-status-empty">' +
                'Aucun conteneur sélectionné.' +
                '</div>';

            return;
        }

        APP.dom.containerStatus.innerHTML =
            '<div class="container-status-title">' +
            U.esc(object.name) +
            '</div>' +

            '<div class="container-status-grid">' +

            '<div>' +
            '<span>Volume</span>' +
            '<strong>' +
            U.format(object.volume, 2) +
            ' mL</strong>' +
            '</div>' +

            '<div>' +
            '<span>Temp.</span>' +
            '<strong>' +
            U.format(object.temperature, 1) +
            ' °C</strong>' +
            '</div>' +

            '<div>' +
            '<span>pH</span>' +
            '<strong>' +
            U.format(object.ph, 2) +
            '</strong>' +
            '</div>' +

            '<div>' +
            '<span>Substances</span>' +
            '<strong>' +
            object.contents.length +
            '</strong>' +
            '</div>' +

            '</div>';
    }


    /* ============================================================
       22. CONTAINER OPERATIONS
       ============================================================ */

    function addSubstanceToContainer(
        container,
        substanceId
    ) {

        if (
            !container ||
            container.type !== "container"
        ) {
            return false;
        }

        const substance =
            chemical(substanceId);

        if (!substance) return false;

        const amount =
            substance.state === "solid"
                ? U.num(
                    substance.defaultMass,
                    1
                )
                : U.num(
                    substance.defaultVolume,
                    5
                );

        if (
            substance.state !== "solid" &&
            container.volume + amount >
                container.capacity
        ) {

            notify(
                "Le conteneur ne peut pas recevoir cette quantité.",
                "error"
            );

            return false;
        }

        const existing =
            container.contents.find(
                function (content) {
                    return content.substanceId ===
                        substanceId;
                }
            );

        if (existing) {

            existing.amount += amount;
        }
        else {

            container.contents.push({
                substanceId: substanceId,
                amount: amount,
                unit:
                    substance.state === "solid"
                        ? "g"
                        : "mL"
            });
        }

        if (substance.state !== "solid") {
            container.volume += amount;
        }

        if (
            substance.ph != null &&
            container.contents.length === 1
        ) {
            container.ph =
                substance.ph;
        }

        return true;
    }


    function removeSubstanceFromContainer(
        container,
        substanceId
    ) {

        if (!container) return;

        const index =
            container.contents.findIndex(
                function (content) {
                    return content.substanceId ===
                        substanceId;
                }
            );

        if (index < 0) return;

        const content =
            container.contents[index];

        if (content.unit === "mL") {

            container.volume =
                Math.max(
                    0,
                    container.volume -
                    U.num(content.amount, 0)
                );
        }

        container.contents.splice(
            index,
            1
        );

        if (!container.contents.length) {

            container.volume = 0;
            container.ph = 7;
        }
    }


    /* ============================================================
       23. DROP SUBSTANCE ON CONTAINER
       ============================================================ */

    function findContainerAtPoint(x, y) {

        const containers =
            APP.state.objects.filter(
                function (object) {
                    return object.type ===
                        "container";
                }
            );

        let nearest = null;
        let distance = Infinity;

        containers.forEach(
            function (container) {

                const dx =
                    container.x - x;

                const dy =
                    container.y - y;

                const d =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );

                if (
                    d < 130 &&
                    d < distance
                ) {

                    distance = d;
                    nearest = container;
                }
            }
        );

        return nearest;
    }


    function dropObjectOnObject(
        source,
        target
    ) {

        if (!source || !target) {
            return false;
        }

        if (
            target.type === "container" &&
            source.source === "chemical"
        ) {

            commit(
                "Ajout de " +
                source.name +
                " dans " +
                target.name
            );

            addSubstanceToContainer(
                target,
                source.itemId
            );

            renderAll();

            notify(
                source.name +
                " ajouté dans " +
                target.name +
                ".",
                "success"
            );

            return true;
        }

        return false;
    }


    /* ============================================================
       24. MEASUREMENT
       ============================================================ */

    function measure() {

        const object =
            selectedObject();

        if (!object) {

            notify(
                "Sélectionnez un objet à mesurer.",
                "warning"
            );

            return;
        }

        if (object.type === "container") {

            notify(
                object.name +
                " : " +
                U.format(object.volume, 2) +
                " mL, " +
                U.format(object.temperature, 1) +
                " °C, pH " +
                U.format(object.ph, 2),
                "info"
            );

            journal(
                "Mesure de " +
                object.name +
                " : " +
                U.format(object.volume, 2) +
                " mL / " +
                U.format(object.temperature, 1) +
                " °C / pH " +
                U.format(object.ph, 2)
            );

            renderJournal();

            return;
        }

        if (object.source === "chemical") {

            const item =
                chemical(object.itemId);

            notify(
                item.name +
                " — masse molaire : " +
                (
                    item.molarMass == null
                        ? "N/D"
                        : U.format(
                            item.molarMass,
                            3
                        ) + " g/mol"
                ),
                "info"
            );

            return;
        }

        notify(
            object.name +
            " sélectionné.",
            "info"
        );
    }


    /* ============================================================
       25. MIXING
       ============================================================ */

    function mix() {

        const object =
            selectedObject();

        if (
            !object ||
            object.type !== "container"
        ) {

            notify(
                "Sélectionnez un conteneur à mélanger.",
                "warning"
            );

            return;
        }

        if (!object.contents.length) {

            notify(
                "Le conteneur est vide.",
                "warning"
            );

            return;
        }

        commit(
            "Mélange de " +
            object.name
        );

        object.properties.mixed = true;

        renderAll();

        notify(
            "Mélange effectué.",
            "success"
        );
    }


    /* ============================================================
       26. TEMPERATURE
       ============================================================ */

    function setTemperature() {

        const object =
            selectedObject();

        if (
            !object ||
            object.type !== "container"
        ) {

            notify(
                "Sélectionnez un conteneur.",
                "warning"
            );

            return;
        }

        const input =
            window.prompt(
                "Température souhaitée (°C) :",
                String(
                    object.temperature
                )
            );

        if (input === null) return;

        const temperature =
            Number(input);

        if (!Number.isFinite(temperature)) {

            notify(
                "Température invalide.",
                "error"
            );

            return;
        }

        commit(
            "Température de " +
            object.name
        );

        object.temperature =
            U.clamp(
                temperature,
                -273.15,
                1000
            );

        renderAll();

        notify(
            "Température réglée à " +
            U.format(
                object.temperature,
                1
            ) +
            " °C.",
            "success"
        );
    }


    /* ============================================================
       27. PIPETTE
       ============================================================ */

    function pipette() {

        const selected =
            selectedObject();

        if (!selected) {

            notify(
                "Sélectionnez une source ou un conteneur.",
                "warning"
            );

            return;
        }

        if (
            selected.type !== "container"
        ) {

            notify(
                "La pipette nécessite un conteneur source.",
                "warning"
            );

            return;
        }

        if (!selected.contents.length) {

            notify(
                "Le conteneur source est vide.",
                "warning"
            );

            return;
        }

        const target =
            APP.state.objects.find(
                function (object) {

                    return (
                        object.type ===
                            "container" &&
                        object.id !==
                            selected.id &&
                        Math.abs(
                            object.x -
                            selected.x
                        ) < 180 &&
                        Math.abs(
                            object.y -
                            selected.y
                        ) < 180
                    );
                }
            );

        if (!target) {

            APP.state.pipetteSourceId =
                selected.id;

            notify(
                "Source enregistrée. Sélectionnez un autre conteneur comme cible puis relancez Pipette.",
                "info"
            );

            return;
        }

        const sourceContent =
            selected.contents[0];

        const amount =
            sourceContent.unit === "mL"
                ? Math.min(
                    1,
                    sourceContent.amount
                )
                : Math.min(
                    0.1,
                    sourceContent.amount
                );

        commit(
            "Transfert par pipette"
        );

        sourceContent.amount -= amount;

        if (
            sourceContent.unit ===
            "mL"
        ) {

            selected.volume =
                Math.max(
                    0,
                    selected.volume -
                    amount
                );
        }

        if (sourceContent.amount <= 0) {

            selected.contents
                .splice(0, 1);
        }

        const existing =
            target.contents.find(
                function (content) {
                    return content.substanceId ===
                        sourceContent.substanceId;
                }
            );

        if (existing) {

            existing.amount += amount;
        }
        else {

            target.contents.push({
                substanceId:
                    sourceContent.substanceId,
                amount: amount,
                unit: sourceContent.unit
            });
        }

        if (
            sourceContent.unit ===
            "mL"
        ) {

            target.volume += amount;
        }

        APP.state.pipetteSourceId =
            null;

        renderAll();

        notify(
            U.format(amount, 2) +
            " " +
            sourceContent.unit +
            " transféré.",
            "success"
        );
    }


    /* ============================================================
       28. CLEANING
       ============================================================ */

    function clean() {

        const object =
            selectedObject();

        if (
            !object ||
            object.type !== "container"
        ) {

            notify(
                "Sélectionnez un conteneur à nettoyer.",
                "warning"
            );

            return;
        }

        if (!object.contents.length) {

            notify(
                "Le conteneur est déjà vide.",
                "info"
            );

            return;
        }

        commit(
            "Nettoyage de " +
            object.name
        );

        object.contents = [];

        object.volume = 0;

        object.ph = 7;

        object.temperature = 25;

        object.properties =
            {};

        renderAll();

        notify(
            "Conteneur nettoyé.",
            "success"
        );
    }


    /* ============================================================
       29. ANALYSIS
       ============================================================ */

    function analyze() {

        const object =
            selectedObject();

        if (!object) {

            notify(
                "Sélectionnez un objet à analyser.",
                "warning"
            );

            return;
        }

        if (
            object.type !==
            "container"
        ) {

            notify(
                "L'analyse détaillée concerne les conteneurs.",
                "info"
            );

            return;
        }

        const substances =
            object.contents.map(
                function (content) {

                    const c =
                        chemical(
                            content.substanceId
                        );

                    return c
                        ? c.name +
                          " (" +
                          c.formula +
                          ")"
                        : content.substanceId;
                }
            );

        const message =
            object.name +
            " — " +
            (
                substances.length
                    ? substances.join(", ")
                    : "conteneur vide"
            ) +
            " — pH " +
            U.format(
                object.ph,
                2
            );

        journal(
            "Analyse : " +
            message
        );

        renderJournal();

        notify(
            message,
            "info"
        );
    }


    /* ============================================================
       30. REACTION ENGINE
       ============================================================ */

    function getReactionForContainer(
        container
    ) {

        if (
            !container ||
            container.type !== "container"
        ) {
            return null;
        }

        const ids =
            container.contents.map(
                function (content) {
                    return content.substanceId;
                }
            );

        return REACTIONS.find(
            function (reaction) {

                return reaction.reactants.every(
                    function (reactant) {

                        return ids.indexOf(
                            reactant.id
                        ) !== -1;
                    }
                );
            }
        ) || null;
    }


    function reaction() {

        const container =
            selectedObject();

        if (
            !container ||
            container.type !== "container"
        ) {

            notify(
                "Sélectionnez un conteneur contenant les réactifs.",
                "warning"
            );

            return;
        }

        if (
            container.contents.length <
            2
        ) {

            notify(
                "Il faut au moins deux substances pour tester une réaction.",
                "warning"
            );

            return;
        }

        const model =
            getReactionForContainer(
                container
            );

        if (!model) {

            APP.state.reactionResult = {
                status: "unmodeled",
                name: "Réaction non modélisée",
                reactants: container.contents
                    .map(function (content) {
                        const c =
                            chemical(
                                content.substanceId
                            );

                        return c
                            ? c.name
                            : content.substanceId;
                    }),
                products: [],
                observations: [
                    "Aucun modèle chimique explicite correspondant n'est enregistré dans CHIMIQUE FOBAS.",
                    "Aucun produit n'est inventé."
                ],
                finalState:
                    "Aucune réaction simulée."
            };

            renderReactionResult();

            notify(
                "Aucun modèle de réaction correspondant.",
                "info"
            );

            return;
        }

        const amounts = {};

        container.contents.forEach(
            function (content) {

                amounts[
                    content.substanceId
                ] =
                    U.num(
                        content.amount,
                        1
                    );
            }
        );

        const calculation =
            model.calculate({
                amounts: amounts,
                reactants:
                    container.contents
                        .map(function (content) {
                            return {
                                substanceId:
                                    content.substanceId,
                                amount:
                                    content.amount
                            };
                        })
            });

        commit(
            "Réaction : " +
            model.name
        );

        APP.state.counters.reactions++;

        if (
            calculation &&
            calculation.pH != null
        ) {
            container.ph =
                calculation.pH;
        }

        if (
            calculation &&
            calculation.temperatureDelta
        ) {

            container.temperature +=
                calculation.temperatureDelta;
        }

        APP.state.reactionResult = {

            status: "success",

            name: model.name,

            equation: model.equation,

            reactants:
                model.reactants.map(
                    function (reactant) {

                        const c =
                            chemical(
                                reactant.id
                            );

                        return c
                            ? c.name +
                              " (" +
                              c.formula +
                              ")"
                            : reactant.id;
                    }
                ),

            products:
                model.products.map(
                    function (product) {

                        return (
                            product.name +
                            " (" +
                            product.formula +
                            ")"
                        );
                    }
                ),

            observations:
                model.observations.slice(),

            finalState:
                model.finalState,

            calculation:
                calculation
        };

        renderAll();

        notify(
            "Réaction modélisée : " +
            model.name,
            "success"
        );
    }


    /* ============================================================
       31. REACTION RESULT
       ============================================================ */

    function renderReactionResult() {

        const result =
            APP.state.reactionResult;

        if (!result) {

            if (
                APP.dom.reactionResultEmpty
            ) {
                APP.dom.reactionResultEmpty
                    .style.display = "";
            }

            if (
                APP.dom.reactionResultContent
            ) {
                APP.dom.reactionResultContent
                    .style.display = "none";
            }

            return;
        }

        if (
            APP.dom.reactionResultEmpty
        ) {
            APP.dom.reactionResultEmpty
                .style.display = "none";
        }

        if (
            APP.dom.reactionResultContent
        ) {
            APP.dom.reactionResultContent
                .style.display = "";
        }

        if (
            APP.dom.reactionResultStatus
        ) {

            APP.dom.reactionResultStatus.textContent =
                result.status ===
                "success"
                    ? "Réaction modélisée"
                    : "Non modélisée";
        }

        if (
            APP.dom.reactionResultName
        ) {

            APP.dom.reactionResultName.textContent =
                result.name || "";
        }

        if (
            APP.dom.reactionResultReactants
        ) {

            APP.dom.reactionResultReactants.innerHTML =
                (result.reactants || [])
                    .map(function (x) {
                        return (
                            '<div>' +
                            U.esc(x) +
                            '</div>'
                        );
                    })
                    .join("");
        }

        if (
            APP.dom.reactionResultProducts
        ) {

            APP.dom.reactionResultProducts.innerHTML =
                (result.products || [])
                    .map(function (x) {
                        return (
                            '<div>' +
                            U.esc(x) +
                            '</div>'
                        );
                    })
                    .join("");
        }

        if (
            APP.dom.reactionResultObservations
        ) {

            APP.dom.reactionResultObservations.innerHTML =
                (result.observations || [])
                    .map(function (x) {
                        return (
                            '<div>' +
                            U.esc(x) +
                            '</div>'
                        );
                    })
                    .join("");
        }

        if (
            APP.dom.reactionResultFinalState
        ) {

            APP.dom.reactionResultFinalState.textContent =
                result.finalState || "";
        }
    }


    /* ============================================================
       32. DELETE
       ============================================================ */

    function deleteSelected() {

        const object =
            selectedObject();

        if (!object) {

            notify(
                "Aucun objet sélectionné.",
                "warning"
            );

            return;
        }

        commit(
            "Suppression de " +
            object.name
        );

        APP.state.objects =
            APP.state.objects.filter(
                function (item) {
                    return item.id !==
                        object.id;
                }
            );

        APP.state.selectedId =
            null;

        renderAll();

        notify(
            object.name +
            " supprimé.",
            "success"
        );
    }


    /* ============================================================
       33. ZOOM ENGINE
       ============================================================ */

    function applyZoom() {

        if (!APP.dom.stageObjects) return;

        const zoom =
            U.clamp(
                APP.state.zoom,
                0.5,
                2.5
            );

        APP.dom.stageObjects.style.transform =
            "translate(" +
            APP.state.stage.offsetX +
            "px," +
            APP.state.stage.offsetY +
            "px) scale(" +
            zoom +
            ")";

        APP.dom.stageObjects.style.transformOrigin =
            "0 0";

        if (APP.dom.stageMode) {

            APP.dom.stageMode.textContent =
                "Zoom " +
                Math.round(
                    zoom * 100
                ) +
                "%";
        }

        const zoomElements =
            document.querySelectorAll(
                "[data-zoom-value]"
            );

        zoomElements.forEach(
            function (element) {

                element.textContent =
                    Math.round(
                        zoom * 100
                    ) +
                    "%";
            }
        );
    }


    function zoomIn() {

        APP.state.zoom =
            U.clamp(
                U.round(
                    APP.state.zoom +
                    0.1,
                    2
                ),
                0.5,
                2.5
            );

        applyZoom();

        journal(
            "Zoom : " +
            Math.round(
                APP.state.zoom * 100
            ) +
            "%"
        );

        renderJournal();
    }


    function zoomOut() {

        APP.state.zoom =
            U.clamp(
                U.round(
                    APP.state.zoom -
                    0.1,
                    2
                ),
                0.5,
                2.5
            );

        applyZoom();

        journal(
            "Zoom : " +
            Math.round(
                APP.state.zoom * 100
            ) +
            "%"
        );

        renderJournal();
    }


    function centerStage() {

        APP.state.stage.offsetX = 0;
        APP.state.stage.offsetY = 0;

        applyZoom();

        notify(
            "Laboratoire recentré.",
            "success"
        );
    }


    function resetView() {

        APP.state.zoom = 1;

        APP.state.stage.offsetX = 0;
        APP.state.stage.offsetY = 0;

        applyZoom();

        notify(
            "Vue réinitialisée à 100 %.",
            "success"
        );
    }


    /* ============================================================
       34. TOOL ENGINE
       ============================================================ */

    function setTool(tool) {

        const valid = [
            "select",
            "add",
            "move",
            "measure",
            "mix",
            "reaction",
            "analyze",
            "temperature",
            "pipette",
            "clean",
            "delete"
        ];

        if (
            valid.indexOf(tool) === -1
        ) {
            tool = "select";
        }

        APP.state.tool = tool;

        U.$$("[data-tool]").forEach(
            function (button) {

                button.classList.toggle(
                    "active",
                    button.dataset.tool ===
                        tool
                );

                button.setAttribute(
                    "aria-pressed",
                    button.dataset.tool ===
                        tool
                        ? "true"
                        : "false"
                );
            }
        );

        if (APP.dom.stage) {

            APP.dom.stage.dataset.tool =
                tool;

            APP.dom.stage.classList.toggle(
                "tool-add-active",
                tool === "add"
            );

            APP.dom.stage.classList.toggle(
                "tool-move-active",
                tool === "move"
            );
        }
    }


    /* ============================================================
       35. OBJECT POINTER ENGINE
       ============================================================ */

    function beginObjectPointer(
        event,
        element
    ) {

        const id =
            element.dataset.objectId;

        const object =
            APP.state.objects.find(
                function (item) {
                    return item.id === id;
                }
            );

        if (!object) return;

        selectObject(id);

        APP.pointer.active = true;

        APP.pointer.objectId = id;

        APP.pointer.startX =
            event.clientX;

        APP.pointer.startY =
            event.clientY;

        APP.pointer.objectStartX =
            object.x;

        APP.pointer.objectStartY =
            object.y;

        APP.pointer.moved = false;

        try {
            element.setPointerCapture(
                event.pointerId
            );
        } catch (e) {}
    }


    function moveObjectPointer(
        event
    ) {

        if (
            !APP.pointer.active ||
            !APP.pointer.objectId
        ) {
            return;
        }

        const object =
            APP.state.objects.find(
                function (item) {
                    return item.id ===
                        APP.pointer.objectId;
                }
            );

        if (!object) return;

        const zoom =
            APP.state.zoom || 1;

        const dx =
            (event.clientX -
                APP.pointer.startX) /
            zoom;

        const dy =
            (event.clientY -
                APP.pointer.startY) /
            zoom;

        if (
            Math.abs(dx) > 3 ||
            Math.abs(dy) > 3
        ) {
            APP.pointer.moved = true;
        }

        object.x =
            APP.pointer.objectStartX +
            dx;

        object.y =
            APP.pointer.objectStartY +
            dy;

        object.x =
            U.clamp(
                object.x,
                20,
                Math.max(
                    30,
                    APP.dom.stageObjects
                        ? APP.dom.stageObjects.clientWidth - 20
                        : 1200
                )
            );

        object.y =
            U.clamp(
                object.y,
                20,
                Math.max(
                    30,
                    APP.dom.stageObjects
                        ? APP.dom.stageObjects.clientHeight - 20
                        : 800
                )
            );

        renderObjects();
    }


    function endObjectPointer() {

        if (!APP.pointer.active) {
            return;
        }

        if (APP.pointer.moved) {

            commit(
                "Déplacement de l'objet"
            );

            renderAll();
        }

        APP.pointer.active = false;
        APP.pointer.objectId = null;
        APP.pointer.moved = false;
    }


    /* ============================================================
       36. STAGE CLICK
       ============================================================ */

    function handleStageClick(event) {

        const target =
            event.target.closest(
                ".cf-stage-object"
            );

        if (target) {

            const id =
                target.dataset.objectId;

            if (
                APP.state.tool ===
                "delete"
            ) {

                selectObject(id);
                deleteSelected();
                return;
            }

            if (
                APP.state.tool ===
                "measure"
            ) {

                selectObject(id);
                measure();
                return;
            }

            if (
                APP.state.tool ===
                "mix"
            ) {

                selectObject(id);
                mix();
                return;
            }

            if (
                APP.state.tool ===
                "reaction"
            ) {

                selectObject(id);
                reaction();
                return;
            }

            if (
                APP.state.tool ===
                "analyze"
            ) {

                selectObject(id);
                analyze();
                return;
            }

            if (
                APP.state.tool ===
                "temperature"
            ) {

                selectObject(id);
                setTemperature();
                return;
            }

            if (
                APP.state.tool ===
                "pipette"
            ) {

                selectObject(id);
                pipette();
                return;
            }

            if (
                APP.state.tool ===
                "clean"
            ) {

                selectObject(id);
                clean();
                return;
            }

            return;
        }

        if (
            APP.state.tool ===
            "add"
        ) {

            openAddModal();

            return;
        }

        if (
            APP.state.tool ===
            "select"
        ) {

            APP.state.selectedId =
                null;

            renderAll();
        }
    }


    /* ============================================================
       37. LIBRARY DRAG & DROP
       ============================================================ */

    function libraryDragStart(event) {

        const item =
            event.target.closest(
                ".cf-library-item"
            );

        if (!item) return;

        const payload = JSON.stringify({
            source:
                item.dataset.librarySource,
            id:
                item.dataset.libraryId
        });

        try {

            event.dataTransfer.setData(
                "application/json",
                payload
            );

            event.dataTransfer.setData(
                "text/plain",
                payload
            );

            event.dataTransfer.effectAllowed =
                "copy";
        } catch (e) {}
    }


    function stageDragOver(event) {

        event.preventDefault();

        if (APP.dom.dropIndicator) {

            APP.dom.dropIndicator.style.display =
                "";
        }

        try {
            event.dataTransfer.dropEffect =
                "copy";
        } catch (e) {}
    }


    function stageDragLeave() {

        if (APP.dom.dropIndicator) {

            APP.dom.dropIndicator.style.display =
                "none";
        }
    }


    function stageDrop(event) {

        event.preventDefault();

        if (APP.dom.dropIndicator) {

            APP.dom.dropIndicator.style.display =
                "none";
        }

        let raw = "";

        try {

            raw =
                event.dataTransfer.getData(
                    "application/json"
                ) ||
                event.dataTransfer.getData(
                    "text/plain"
                );
        } catch (e) {}

        if (!raw) return;

        let data = null;

        try {
            data = JSON.parse(raw);
        } catch (e) {
            return;
        }

        if (
            !data ||
            !data.source ||
            !data.id
        ) {
            return;
        }

        const point =
            stagePoint(event);

        addLibraryObject(
            data.source,
            data.id,
            point.x,
            point.y
        );
    }


    /* ============================================================
       38. MODALS
       ============================================================ */

    function openModal(modal) {

        if (!modal) return;

        modal.classList.add("open");

        modal.removeAttribute(
            "aria-hidden"
        );
    }


    function closeModal(modal) {

        if (!modal) return;

        modal.classList.remove("open");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    function openAddModal() {

        if (APP.dom.addModal) {

            openModal(
                APP.dom.addModal
            );

            return;
        }

        const query =
            APP.dom.librarySearch;

        if (query) {

            query.focus();
        }
    }


    function closeAllModals() {

        [
            APP.dom.addModal,
            APP.dom.reactionModal,
            APP.dom.safetyModal,
            APP.dom.saveModal,
            APP.dom.resetModal,
            APP.dom.objectContextMenu
        ].forEach(closeModal);
    }


    /* ============================================================
       39. SAVE / LOAD
       ============================================================ */

    function saveLocal() {

        try {

            const data =
                snapshot();

            data.history = [];
            data.future = [];

            localStorage.setItem(
                APP.STORAGE_KEY,
                JSON.stringify(data)
            );

            notify(
                "Expérience sauvegardée localement.",
                "success"
            );

            journal(
                "Sauvegarde locale effectuée."
            );

            renderJournal();

        } catch (error) {

            notify(
                "Impossible de sauvegarder l'expérience.",
                "error"
            );
        }
    }


    function loadLocal() {

        try {

            const raw =
                localStorage.getItem(
                    APP.STORAGE_KEY
                );

            if (!raw) {

                notify(
                    "Aucune sauvegarde locale trouvée.",
                    "info"
                );

                return;
            }

            const data =
                JSON.parse(raw);

            APP.state =
                data;

            normalizeState();

            APP.state.history = [];
            APP.state.future = [];

            renderAll();

            notify(
                "Expérience chargée.",
                "success"
            );

        } catch (error) {

            notify(
                "La sauvegarde est invalide.",
                "error"
            );
        }
    }


    function downloadExperiment() {

        try {

            const data =
                snapshot();

            data.history = [];
            data.future = [];

            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            data,
                            null,
                            2
                        )
                    ],
                    {
                        type:
                            "application/json"
                    }
                );

            const url =
                URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                "chimique-fobas-" +
                Date.now() +
                ".json";

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();

            setTimeout(function () {
                URL.revokeObjectURL(url);
            }, 1000);

            notify(
                "Fichier d'expérience créé.",
                "success"
            );

        } catch (error) {

            notify(
                "Impossible de créer le fichier.",
                "error"
            );
        }
    }


    function importExperimentFile(
        file
    ) {

        if (!file) return;

        const reader =
            new FileReader();

        reader.onload =
            function () {

                try {

                    const data =
                        JSON.parse(
                            reader.result
                        );

                    if (
                        !data ||
                        !Array.isArray(
                            data.objects
                        )
                    ) {
                        throw new Error(
                            "Format invalide"
                        );
                    }

                    APP.state =
                        data;

                    normalizeState();

                    APP.state.history = [];
                    APP.state.future = [];

                    renderAll();

                    notify(
                        "Expérience importée.",
                        "success"
                    );

                } catch (error) {

                    notify(
                        "Le fichier n'est pas une expérience CHIMIQUE FOBAS valide.",
                        "error"
                    );
                }
            };

        reader.onerror =
            function () {

                notify(
                    "Erreur de lecture du fichier.",
                    "error"
                );
            };

        reader.readAsText(file);
    }


    /* ============================================================
       40. RESET
       ============================================================ */

    function resetExperiment(
        confirmed
    ) {

        if (!confirmed) {

            if (APP.dom.resetModal) {

                openModal(
                    APP.dom.resetModal
                );

                return;
            }

            const answer =
                window.confirm(
                    "Réinitialiser complètement l'expérience ?"
                );

            if (!answer) return;
        }

        resetState();

        renderAll();

        notify(
            "Expérience réinitialisée.",
            "success"
        );
    }


    /* ============================================================
       41. SAFETY
       ============================================================ */

    function openSafety() {

        if (APP.dom.safetyModal) {

            openModal(
                APP.dom.safetyModal
            );

            return;
        }

        window.alert(
            "CHIMIQUE FOBAS — Sécurité\n\n" +
            "Cette application est une simulation pédagogique. " +
            "Les substances corrosives, inflammables ou dangereuses " +
            "sont représentées uniquement dans un contexte virtuel."
        );
    }


    /* ============================================================
       42. CONTEXT MENU
       ============================================================ */

    function showContextMenu(
        event,
        objectId
    ) {

        if (!APP.dom.objectContextMenu) {
            return;
        }

        APP.state.selectedId =
            objectId;

        const menu =
            APP.dom.objectContextMenu;

        menu.dataset.objectId =
            objectId;

        menu.style.left =
            event.clientX + "px";

        menu.style.top =
            event.clientY + "px";

        openModal(menu);
    }


    /* ============================================================
       43. ACTION ROUTER
       ============================================================ */

    function action(action) {

        if (!action) return;

        try {

            switch (action) {

                case "new-experiment":
                    resetExperiment(false);
                    break;

                case "save":
                    saveLocal();
                    break;

                case "load":
                    loadLocal();
                    break;

                case "reset":
                    resetExperiment(false);
                    break;

                case "safety":
                    openSafety();
                    break;

                case "undo":
                    undo();
                    break;

                case "redo":
                    redo();
                    break;

                case "measure":
                    measure();
                    break;

                case "mix":
                    mix();
                    break;

                case "reaction":
                    reaction();
                    break;

                case "analyze":
                    analyze();
                    break;

                case "temperature":
                    setTemperature();
                    break;

                case "pipette":
                    pipette();
                    break;

                case "clean":
                    clean();
                    break;

                case "delete-selected":
                    deleteSelected();
                    break;

                case "zoom-in":
                    zoomIn();
                    break;

                case "zoom-out":
                    zoomOut();
                    break;

                case "center":
                    centerStage();
                    break;

                case "reset-view":
                    resetView();
                    break;

                case "close-modal":
                    closeAllModals();
                    break;

                case "download":
                    downloadExperiment();
                    break;

                case "clear-journal":

                    APP.state.journal = [];

                    renderJournal();

                    break;

                case "confirm-reset":
                    resetExperiment(true);
                    closeAllModals();
                    break;

                case "load-file":

                    if (
                        APP.dom.experienceFileInput
                    ) {
                        APP.dom.experienceFileInput
                            .click();
                    }

                    break;

                default:

                    break;
            }

        } catch (error) {

            console.error(
                "[CHIMIQUE FOBAS ACTION ERROR]",
                action,
                error
            );

            notify(
                "Une erreur est survenue pendant l'action.",
                "error"
            );
        }
    }


    /* ============================================================
       44. CENTRAL CLICK HANDLER
       ------------------------------------------------------------
       One event delegation layer.
       ============================================================ */

    function handleClick(event) {

        const actionElement =
            event.target.closest(
                "[data-action]"
            );

        if (actionElement) {

            event.preventDefault();

            action(
                actionElement.dataset.action
            );

            return;
        }


        const toolElement =
            event.target.closest(
                "[data-tool]"
            );

        if (toolElement) {

            event.preventDefault();

            setTool(
                toolElement.dataset.tool
            );

            return;
        }


        const stageControl =
            event.target.closest(
                "[data-stage-control]"
            );

        if (stageControl) {

            event.preventDefault();

            const control =
                stageControl.dataset
                    .stageControl;

            switch (control) {

                case "zoom-in":
                    zoomIn();
                    break;

                case "zoom-out":
                    zoomOut();
                    break;

                case "center":
                    centerStage();
                    break;

                case "reset-view":
                    resetView();
                    break;
            }

            return;
        }


        const libraryTab =
            event.target.closest(
                ".library-tab, .filter-button"
            );

        if (libraryTab) {

            event.preventDefault();

            const category =
                libraryTab.dataset.category ||
                libraryTab.dataset.filter ||
                libraryTab.dataset.tab ||
                "all";

            setLibraryCategory(
                category
            );

            return;
        }


        const libraryItem =
            event.target.closest(
                ".cf-library-item"
            );

        if (libraryItem) {

            event.preventDefault();

            addLibraryObject(
                libraryItem.dataset.librarySource,
                libraryItem.dataset.libraryId,
                120,
                120
            );

            return;
        }


        const reactionItem =
            event.target.closest(
                ".cf-reaction-item"
            );

        if (reactionItem) {

            const id =
                reactionItem.dataset.reactionId;

            const reactionModel =
                REACTIONS.find(
                    function (r) {
                        return r.id === id;
                    }
                );

            if (reactionModel) {

                notify(
                    reactionModel.equation,
                    "info"
                );
            }

            return;
        }


        const inspectorAction =
            event.target.closest(
                "[data-inspector-action]"
            );

        if (inspectorAction) {

            event.preventDefault();

            const actionName =
                inspectorAction
                    .dataset
                    .inspectorAction;

            const object =
                selectedObject();

            if (
                actionName ===
                "remove-content"
            ) {

                if (object) {

                    commit(
                        "Retrait d'une substance"
                    );

                    removeSubstanceFromContainer(
                        object,
                        inspectorAction
                            .dataset
                            .substanceId
                    );

                    renderAll();
                }

                return;
            }

            if (
                actionName ===
                "measure"
            ) {

                measure();

                return;
            }

            if (
                actionName ===
                "mix"
            ) {

                mix();

                return;
            }

            if (
                actionName ===
                "analyze"
            ) {

                analyze();

                return;
            }
        }


        const contextAction =
            event.target.closest(
                "[data-context-action]"
            );

        if (contextAction) {

            event.preventDefault();

            const id =
                APP.dom.objectContextMenu
                    ? APP.dom.objectContextMenu
                        .dataset.objectId
                    : APP.state.selectedId;

            if (id) {
                APP.state.selectedId = id;
            }

            const context =
                contextAction
                    .dataset
                    .contextAction;

            closeAllModals();

            switch (context) {

                case "delete":
                    deleteSelected();
                    break;

                case "measure":
                    measure();
                    break;

                case "mix":
                    mix();
                    break;

                case "analyze":
                    analyze();
                    break;
            }

            return;
        }


        const closeElement =
            event.target.closest(
                "[data-modal-close]"
            );

        if (closeElement) {

            event.preventDefault();

            closeAllModals();

            return;
        }
    }


    /* ============================================================
       45. POINTER EVENTS
       ============================================================ */

    function handlePointerDown(event) {

        const object =
            event.target.closest(
                ".cf-stage-object"
            );

        if (!object) return;

        if (
            APP.state.tool ===
            "delete"
        ) {
            return;
        }

        beginObjectPointer(
            event,
            object
        );
    }


    function handlePointerMove(event) {

        if (!APP.pointer.active) {
            return;
        }

        moveObjectPointer(
            event
        );
    }


    function handlePointerUp() {

        endObjectPointer();
    }


    /* ============================================================
       46. CONTEXT MENU EVENT
       ============================================================ */

    function handleContextMenu(event) {

        const object =
            event.target.closest(
                ".cf-stage-object"
            );

        if (!object) return;

        event.preventDefault();

        showContextMenu(
            event,
            object.dataset.objectId
        );
    }


    /* ============================================================
       47. KEYBOARD
       ============================================================ */

    function handleKeyboard(event) {

        const tag =
            event.target &&
            event.target.tagName
                ? event.target.tagName
                    .toLowerCase()
                : "";

        if (
            tag === "input" ||
            tag === "textarea" ||
            tag === "select" ||
            event.target.isContentEditable
        ) {

            return;
        }

        if (
            event.key === "Delete" ||
            event.key === "Backspace"
        ) {

            if (
                APP.state.selectedId
            ) {

                event.preventDefault();

                deleteSelected();
            }

            return;
        }

        if (event.key === "Escape") {

            closeAllModals();

            setTool("select");

            return;
        }

        if (
            (event.ctrlKey ||
                event.metaKey) &&
            !event.shiftKey &&
            event.key.toLowerCase() === "z"
        ) {

            event.preventDefault();

            undo();

            return;
        }

        if (
            (event.ctrlKey ||
                event.metaKey) &&
            (
                event.key.toLowerCase() ===
                    "y" ||
                (
                    event.shiftKey &&
                    event.key.toLowerCase() ===
                        "z"
                )
            )
        ) {

            event.preventDefault();

            redo();

            return;
        }
    }


    /* ============================================================
       48. SEARCH EVENTS
       ============================================================ */

    function handleLibrarySearch() {

        renderLibrary();
    }


    function clearLibrarySearch() {

        if (
            APP.dom.librarySearch
        ) {

            APP.dom.librarySearch.value =
                "";
        }

        renderLibrary();

        if (
            APP.dom.librarySearch
        ) {
            APP.dom.librarySearch.focus();
        }
    }


    function handleReactionSearch() {

        renderReactionLibrary();
    }


    /* ============================================================
       49. FILE INPUT
       ============================================================ */

    function handleFileInput(event) {

        const file =
            event.target.files &&
            event.target.files[0];

        if (!file) return;

        importExperimentFile(
            file
        );

        event.target.value = "";
    }


    /* ============================================================
       50. TOUCH-FRIENDLY DOUBLE TAP
       ============================================================ */

    let lastTapTime = 0;

    function handleStageDoubleTap(event) {

        const now =
            Date.now();

        if (
            now -
            lastTapTime <
            320
        ) {

            const object =
                event.target.closest(
                    ".cf-stage-object"
                );

            if (object) {

                showObjectQuickInfo(
                    object.dataset.objectId
                );
            }
        }

        lastTapTime = now;
    }


    function showObjectQuickInfo(
        objectId
    ) {

        const object =
            APP.state.objects.find(
                function (item) {
                    return item.id ===
                        objectId;
                }
            );

        if (!object) return;

        let message =
            object.name;

        if (object.formula) {
            message +=
                " — " +
                object.formula;
        }

        if (
            object.type ===
            "container"
        ) {

            message +=
                " — " +
                U.format(
                    object.volume,
                    2
                ) +
                " mL";
        }

        notify(
            message,
            "info"
        );
    }


    /* ============================================================
       51. RENDER COUNTERS / STATUS
       ============================================================ */

    function renderStatus() {

        if (
            APP.dom.engineStatusText
        ) {

            APP.dom.engineStatusText.textContent =
                "Système opérationnel";
        }

        if (
            APP.dom.engineStatus
        ) {

            APP.dom.engineStatus.classList.add(
                "ready"
            );
        }

        const counters =
            document.querySelectorAll(
                "[data-count]"
            );

        counters.forEach(
            function (element) {

                const type =
                    element.dataset.count;

                let value = 0;

                if (
                    type === "objects"
                ) {
                    value =
                        APP.state.objects.length;
                }

                if (
                    type === "actions"
                ) {
                    value =
                        APP.state.counters.actions;
                }

                if (
                    type === "reactions"
                ) {
                    value =
                        APP.state.counters.reactions;
                }

                element.textContent =
                    value;
            }
        );
    }


    /* ============================================================
       52. ACCESSIBILITY
       ============================================================ */

    function accessibility() {

        if (!APP.dom.root) return;

        let live =
            document.getElementById(
                "cf-live-region"
            );

        if (!live) {

            live =
                document.createElement(
                    "div"
                );

            live.id =
                "cf-live-region";

            live.setAttribute(
                "aria-live",
                "polite"
            );

            live.setAttribute(
                "aria-atomic",
                "true"
            );

            live.style.position =
                "absolute";

            live.style.width =
                "1px";

            live.style.height =
                "1px";

            live.style.overflow =
                "hidden";

            live.style.clip =
                "rect(0,0,0,0)";

            APP.dom.root.appendChild(
                live
            );
        }

        live.textContent =
            APP.state.objects.length +
            " objet(s) dans le laboratoire.";
    }


    /* ============================================================
       53. MAIN RENDER
       ============================================================ */

    function renderAll() {

        normalizeState();

        renderLibrary();

        renderReactionLibrary();

        renderObjects();

        renderInspector();

        renderReactionResult();

        renderJournal();

        renderContainerStatus();

        renderStatus();

        applyZoom();

        setTool(
            APP.state.tool
        );

        accessibility();
    }


    /* ============================================================
       54. EVENT BINDING
       ============================================================ */

    function bindEvents() {

        document.addEventListener(
            "click",
            handleClick
        );

        document.addEventListener(
            "pointerdown",
            handlePointerDown,
            {
                passive: true
            }
        );

        document.addEventListener(
            "pointermove",
            handlePointerMove,
            {
                passive: true
            }
        );

        document.addEventListener(
            "pointerup",
            handlePointerUp,
            {
                passive: true
            }
        );

        document.addEventListener(
            "pointercancel",
            handlePointerUp,
            {
                passive: true
            }
        );

        document.addEventListener(
            "contextmenu",
            handleContextMenu
        );

        document.addEventListener(
            "keydown",
            handleKeyboard
        );

        document.addEventListener(
            "dblclick",
            handleStageDoubleTap
        );


        if (
            APP.dom.librarySearch
        ) {

            APP.dom.librarySearch
                .addEventListener(
                    "input",
                    handleLibrarySearch
                );
        }


        if (
            APP.dom.clearLibrarySearch
        ) {

            APP.dom.clearLibrarySearch
                .addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        clearLibrarySearch();
                    }
                );
        }


        if (
            APP.dom.reactionSearch
        ) {

            APP.dom.reactionSearch
                .addEventListener(
                    "input",
                    handleReactionSearch
                );
        }


        if (
            APP.dom.experienceFileInput
        ) {

            APP.dom.experienceFileInput
                .addEventListener(
                    "change",
                    handleFileInput
                );
        }


        if (
            APP.dom.libraryItems
        ) {

            APP.dom.libraryItems
                .addEventListener(
                    "dragstart",
                    libraryDragStart
                );
        }


        if (
            APP.dom.stage
        ) {

            APP.dom.stage.addEventListener(
                "dragover",
                stageDragOver
            );

            APP.dom.stage.addEventListener(
                "dragleave",
                stageDragLeave
            );

            APP.dom.stage.addEventListener(
                "drop",
                stageDrop
            );

            APP.dom.stage.addEventListener(
                "click",
                handleStageClick
            );
        }


        window.addEventListener(
            "resize",
            function () {

                applyZoom();
            }
        );


        /* Close modal when clicking its overlay */

        [
            APP.dom.addModal,
            APP.dom.reactionModal,
            APP.dom.safetyModal,
            APP.dom.saveModal,
            APP.dom.resetModal
        ].forEach(
            function (modal) {

                if (!modal) return;

                modal.addEventListener(
                    "click",
                    function (event) {

                        if (
                            event.target ===
                            modal
                        ) {

                            closeModal(
                                modal
                            );
                        }
                    }
                );
            }
        );
    }


    /* ============================================================
       55. API BRIDGE
       ------------------------------------------------------------
       Simulation works without API.
       ============================================================ */

    const FOBASApiBridge = {

        API_BASE:
            "https://api.fondationbackupspirituel.com",

        async request(
            endpoint,
            options
        ) {

            try {

                const response =
                    await fetch(
                        this.API_BASE +
                        endpoint,
                        Object.assign(
                            {
                                headers: {
                                    "Content-Type":
                                        "application/json"
                                }
                            },
                            options || {}
                        )
                    );

                if (!response.ok) {
                    throw new Error(
                        "HTTP " +
                        response.status
                    );
                }

                return await response.json();

            } catch (error) {

                console.warn(
                    "FOBAS API indisponible:",
                    error
                );

                return null;
            }
        }
    };


    /* ============================================================
       56. PUBLIC API
       ============================================================ */

    window.ChimiqueFOBAS = {

        version:
            APP.VERSION,

        state:
            APP.state,

        init:
            init,

        add:
            addLibraryObject,

        select:
            selectObject,

        measure:
            measure,

        mix:
            mix,

        reaction:
            reaction,

        analyze:
            analyze,

        temperature:
            setTemperature,

        pipette:
            pipette,

        clean:
            clean,

        deleteSelected:
            deleteSelected,

        zoomIn:
            zoomIn,

        zoomOut:
            zoomOut,

        resetView:
            resetView,

        center:
            centerStage,

        undo:
            undo,

        redo:
            redo,

        save:
            saveLocal,

        load:
            loadLocal,

        reset:
            resetExperiment,

        search:
            searchLibrary,

        chemicals:
            function () {
                return U.clone(CHEMICALS);
            },

        glassware:
            function () {
                return U.clone(GLASSWARE);
            },

        equipment:
            function () {
                return U.clone(EQUIPMENT);
            },

        reactions:
            function () {
                return U.clone(REACTIONS);
            },

        api:
            FOBASApiBridge
    };


    /* ============================================================
       57. APPLICATION BOOT
       ============================================================ */

    function init() {

        if (APP.initialized) {
            return;
        }

        APP.initialized = true;

        try {

            cacheDOM();

            resetState();

            bindEvents();

            renderAll();

            journal(
                "CHIMIQUE FOBAS démarré."
            );

            renderJournal();

            notify(
                "Laboratoire virtuel prêt.",
                "success"
            );

            console.log(
                "%cCHIMIQUE FOBAS " +
                APP.VERSION +
                " — READY",
                "font-weight:bold"
            );

        } catch (error) {

            console.error(
                "CHIMIQUE FOBAS BOOT ERROR",
                error
            );

            if (
                APP.dom.applicationError
            ) {

                APP.dom.applicationError
                    .style.display = "";

                APP.dom.applicationError
                    .textContent =
                    "Erreur d'initialisation : " +
                    error.message;
            }
        }
    }


    /* ============================================================
       58. DOM READY
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