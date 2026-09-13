/* ================================================================
   CHIMIQUE FOBAS
   Virtual Chemistry Laboratory
   simulationchimicfobas.js
   Version 1.0.0

   ARCHITECTURE
   ---------------------------------------------------------------
   01. DOM / Utilities
   02. Chemical Database
   03. Glassware Database
   04. Equipment / Tools Database
   05. Reaction Database
   06. Application State
   07. History / Undo / Redo
   08. Notification Engine
   09. Journal Engine
   10. Library Engine
   11. Object Rendering Engine
   12. Drag / Drop Engine
   13. Selection Engine
   14. Container Engine
   15. Measurement Engine
   16. Mixing Engine
   17. Temperature Engine
   18. Pipette Engine
   19. Reaction Engine
   20. Analysis Engine
   21. Cleaning Engine
   22. Save / Load Engine
   23. Modal Engine
   24. Context Menu
   25. Keyboard / Accessibility
   26. Stage View Controls
   27. Main Action Router
   28. Application Boot
   ================================================================ */

"use strict";

/* ================================================================
   01. DOM / UTILITIES
   ================================================================ */

const CF = {
    VERSION: "1.0.0",
    STORAGE_KEY: "CHIMIQUE_FOBAS_EXPERIMENT_V1",
    MAX_HISTORY: 80,

    $: (selector, root = document) => {
        try {
            return root.querySelector(selector);
        } catch (error) {
            return null;
        }
    },

    $$: (selector, root = document) => {
        try {
            return Array.from(root.querySelectorAll(selector));
        } catch (error) {
            return [];
        }
    },

    byId(id) {
        return document.getElementById(id);
    },

    exists(id) {
        return !!document.getElementById(id);
    },

    uid(prefix = "CF") {
        return (
            prefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            Math.random().toString(36).slice(2, 8)
        ).toUpperCase();
    },

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    num(value, fallback = 0) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    },

    round(value, decimals = 2) {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    },

    escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    },

    clone(value) {
        return JSON.parse(JSON.stringify(value));
    },

    now() {
        return new Date();
    },

    time() {
        return new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    },

    formatNumber(value, decimals = 2) {
        return CF.round(value, decimals).toLocaleString(undefined, {
            maximumFractionDigits: decimals
        });
    },

    stop(event) {
        if (!event) return;
        event.preventDefault();
        event.stopPropagation();
    }
};


/* ================================================================
   02. CHEMICAL DATABASE
   ---------------------------------------------------------------
   IMPORTANT:
   The reaction engine does NOT invent arbitrary chemistry.
   Only explicitly registered reaction models can execute.
   ================================================================ */

const ChemicalDatabase = (() => {

    const substances = [

        /* ---------------- ACIDS ---------------- */

        {
            id: "water",
            name: "Eau distillée",
            formula: "H₂O",
            category: "solvent",
            family: "water",
            state: "liquid",
            density: 1.00,
            defaultVolume: 50,
            ph: 7,
            color: "transparent",
            molarMass: 18.015,
            safety: "Manipulation pédagogique normale.",
            description: "Eau distillée utilisée comme solvant et milieu de laboratoire."
        },

        {
            id: "hydrochloric_acid",
            name: "Acide chlorhydrique",
            formula: "HCl",
            category: "acid",
            family: "strong-acid",
            state: "aqueous",
            density: 1.05,
            defaultVolume: 10,
            ph: 1,
            color: "#d9f4ff",
            molarMass: 36.46,
            safety: "Modèle pédagogique. Éviter tout contact.",
            description: "Acide fort représenté dans le laboratoire virtuel."
        },

        {
            id: "acetic_acid",
            name: "Acide acétique",
            formula: "CH₃COOH",
            category: "acid",
            family: "weak-acid",
            state: "liquid",
            density: 1.05,
            defaultVolume: 10,
            ph: 2.4,
            color: "#f1f7ff",
            molarMass: 60.05,
            safety: "Modèle pédagogique.",
            description: "Acide faible présent notamment dans le vinaigre."
        },

        {
            id: "sulfuric_acid",
            name: "Acide sulfurique",
            formula: "H₂SO₄",
            category: "acid",
            family: "strong-acid",
            state: "liquid",
            density: 1.84,
            defaultVolume: 5,
            ph: 0.5,
            color: "#eaf4ff",
            molarMass: 98.08,
            safety: "Substance hautement corrosive. Simulation uniquement.",
            description: "Acide fort modélisé à des fins éducatives."
        },

        /* ---------------- BASES ---------------- */

        {
            id: "sodium_hydroxide",
            name: "Hydroxyde de sodium",
            formula: "NaOH",
            category: "base",
            family: "strong-base",
            state: "aqueous",
            density: 1.00,
            defaultVolume: 10,
            ph: 13,
            color: "#eef7ff",
            molarMass: 40.00,
            safety: "Modèle pédagogique. Substance corrosive.",
            description: "Base forte utilisée dans les modèles de neutralisation."
        },

        {
            id: "ammonia_solution",
            name: "Solution d'ammoniaque",
            formula: "NH₃(aq)",
            category: "base",
            family: "weak-base",
            state: "aqueous",
            density: 0.99,
            defaultVolume: 10,
            ph: 11,
            color: "#edfaff",
            molarMass: 17.03,
            safety: "Simulation uniquement.",
            description: "Base faible représentée sous forme de solution aqueuse."
        },

        /* ---------------- SALTS ---------------- */

        {
            id: "sodium_bicarbonate",
            name: "Bicarbonate de sodium",
            formula: "NaHCO₃",
            category: "salt",
            family: "bicarbonate",
            state: "solid",
            density: 2.20,
            defaultMass: 2,
            ph: 8.3,
            color: "#f5f8fb",
            molarMass: 84.01,
            safety: "Modèle pédagogique à faible risque.",
            description: "Sel utilisé dans le modèle acide + bicarbonate."
        },

        {
            id: "sodium_chloride",
            name: "Chlorure de sodium",
            formula: "NaCl",
            category: "salt",
            family: "chloride-salt",
            state: "solid",
            density: 2.16,
            defaultMass: 2,
            ph: 7,
            color: "#ffffff",
            molarMass: 58.44,
            safety: "Manipulation pédagogique normale.",
            description: "Sel commun représenté comme solide cristallin."
        },

        {
            id: "copper_sulfate",
            name: "Sulfate de cuivre(II)",
            formula: "CuSO₄",
            category: "salt",
            family: "copper-salt",
            state: "solid",
            density: 3.60,
            defaultMass: 2,
            ph: 4,
            color: "#268cff",
            molarMass: 159.61,
            safety: "Ne pas ingérer. Simulation pédagogique.",
            description: "Sel représenté par sa solution bleue dans certains modèles."
        },

        {
            id: "silver_nitrate",
            name: "Nitrate d'argent",
            formula: "AgNO₃",
            category: "salt",
            family: "silver-salt",
            state: "aqueous",
            density: 1.00,
            defaultVolume: 5,
            ph: 7,
            color: "#edf4ff",
            molarMass: 169.87,
            safety: "Modèle pédagogique.",
            description: "Sel utilisé dans des modèles de précipitation contrôlés."
        },

        /* ---------------- INDICATORS ---------------- */

        {
            id: "universal_indicator",
            name: "Indicateur universel",
            formula: "Ind.",
            category: "indicator",
            family: "indicator",
            state: "solution",
            density: 1.00,
            defaultVolume: 2,
            ph: 7,
            color: "#62e66f",
            molarMass: null,
            safety: "Simulation pédagogique.",
            description: "Indicateur coloré permettant d'observer une zone de pH."
        },

        {
            id: "phenolphthalein",
            name: "Phénolphtaléine",
            formula: "C₂₀H₁₂O₄",
            category: "indicator",
            family: "indicator",
            state: "solution",
            density: 1.00,
            defaultVolume: 2,
            ph: 7,
            color: "#f3efff",
            molarMass: 318.32,
            safety: "Simulation pédagogique.",
            description: "Indicateur coloré utilisé dans les modèles acido-basiques."
        },

        /* ---------------- SOLVENTS ---------------- */

        {
            id: "ethanol",
            name: "Éthanol",
            formula: "C₂H₅OH",
            category: "solvent",
            family: "alcohol",
            state: "liquid",
            density: 0.789,
            defaultVolume: 10,
            ph: 7,
            color: "transparent",
            molarMass: 46.07,
            safety: "Liquide inflammable — simulation uniquement.",
            description: "Solvant organique représenté dans le laboratoire virtuel."
        },

        /* ---------------- GASES / SPECIAL ---------------- */

        {
            id: "carbon_dioxide",
            name: "Dioxyde de carbone",
            formula: "CO₂",
            category: "gas",
            family: "carbon-dioxide",
            state: "gas",
            density: 0.00198,
            defaultVolume: 0,
            ph: null,
            color: "rgba(220,235,245,.25)",
            molarMass: 44.01,
            safety: "Produit gazeux simulé.",
            description: "Gaz produit par certains modèles de réaction."
        },

        {
            id: "oxygen",
            name: "Dioxygène",
            formula: "O₂",
            category: "gas",
            family: "oxygen",
            state: "gas",
            density: 0.00143,
            defaultVolume: 0,
            ph: null,
            color: "rgba(225,240,255,.2)",
            molarMass: 32.00,
            safety: "Gaz comburant — simulation uniquement.",
            description: "Gaz atmosphérique représenté dans le laboratoire."
        },

        /* ---------------- METALS ---------------- */

        {
            id: "copper",
            name: "Cuivre",
            formula: "Cu",
            category: "metal",
            family: "copper",
            state: "solid",
            density: 8.96,
            defaultMass: 5,
            ph: null,
            color: "#b87333",
            molarMass: 63.55,
            safety: "Manipulation pédagogique.",
            description: "Métal cuivreux utilisable dans les expériences définies."
        },

        {
            id: "iron",
            name: "Fer",
            formula: "Fe",
            category: "metal",
            family: "iron",
            state: "solid",
            density: 7.87,
            defaultMass: 5,
            ph: null,
            color: "#88929c",
            molarMass: 55.85,
            safety: "Manipulation pédagogique.",
            description: "Métal représenté sous forme de solide."
        },

        {
            id: "zinc",
            name: "Zinc",
            formula: "Zn",
            category: "metal",
            family: "zinc",
            state: "solid",
            density: 7.14,
            defaultMass: 5,
            ph: null,
            color: "#9ca7b3",
            molarMass: 65.38,
            safety: "Manipulation pédagogique.",
            description: "Métal utilisé dans certains modèles réactionnels."
        }
    ];

    function all() {
        return substances.map(CF.clone);
    }

    function get(id) {
        const item = substances.find(x => x.id === id);
        return item ? CF.clone(item) : null;
    }

    function search(query = "", category = "all") {
        const q = query.trim().toLowerCase();

        return substances
            .filter(item => {
                const categoryMatch =
                    category === "all" ||
                    category === "" ||
                    item.category === category;

                if (!categoryMatch) return false;

                if (!q) return true;

                return [
                    item.name,
                    item.formula,
                    item.category,
                    item.family,
                    item.description
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(q);
            })
            .map(CF.clone);
    }

    return {
        all,
        get,
        search
    };
})();


/* ================================================================
   03. GLASSWARE DATABASE
   ================================================================ */

const GlasswareDatabase = (() => {

    const glassware = [
        {
            id: "beaker_100",
            name: "Bécher 100 mL",
            category: "glassware",
            type: "beaker",
            capacity: 100,
            width: 105,
            height: 120,
            icon: "beaker"
        },
        {
            id: "beaker_250",
            name: "Bécher 250 mL",
            category: "glassware",
            type: "beaker",
            capacity: 250,
            width: 125,
            height: 140,
            icon: "beaker"
        },
        {
            id: "beaker_500",
            name: "Bécher 500 mL",
            category: "glassware",
            type: "beaker",
            capacity: 500,
            width: 145,
            height: 160,
            icon: "beaker"
        },
        {
            id: "erlenmeyer_250",
            name: "Erlenmeyer 250 mL",
            category: "glassware",
            type: "flask",
            capacity: 250,
            width: 120,
            height: 150,
            icon: "flask"
        },
        {
            id: "erlenmeyer_500",
            name: "Erlenmeyer 500 mL",
            category: "glassware",
            type: "flask",
            capacity: 500,
            width: 140,
            height: 170,
            icon: "flask"
        },
        {
            id: "test_tube",
            name: "Tube à essai",
            category: "glassware",
            type: "test-tube",
            capacity: 25,
            width: 70,
            height: 130,
            icon: "test-tube"
        },
        {
            id: "graduated_cylinder_100",
            name: "Éprouvette graduée 100 mL",
            category: "glassware",
            type: "graduated-cylinder",
            capacity: 100,
            width: 75,
            height: 155,
            icon: "cylinder"
        },
        {
            id: "watch_glass",
            name: "Verre de montre",
            category: "glassware",
            type: "watch-glass",
            capacity: 30,
            width: 115,
            height: 45,
            icon: "watch-glass"
        }
    ];

    function all() {
        return glassware.map(CF.clone);
    }

    function get(id) {
        const item = glassware.find(x => x.id === id);
        return item ? CF.clone(item) : null;
    }

    return {
        all,
        get
    };
})();


/* ================================================================
   04. EQUIPMENT / TOOLS DATABASE
   ================================================================ */

const EquipmentDatabase = (() => {

    const equipment = [
        {
            id: "bunsen_burner",
            name: "Bec Bunsen",
            category: "equipment",
            type: "burner",
            icon: "flame"
        },
        {
            id: "tripod",
            name: "Trépied",
            category: "equipment",
            type: "support",
            icon: "tripod"
        },
        {
            id: "thermometer",
            name: "Thermomètre",
            category: "equipment",
            type: "thermometer",
            icon: "thermometer"
        },
        {
            id: "balance",
            name: "Balance électronique",
            category: "equipment",
            type: "balance",
            icon: "balance"
        },
        {
            id: "magnetic_stirrer",
            name: "Agitateur magnétique",
            category: "equipment",
            type: "stirrer",
            icon: "mix"
        },
        {
            id: "funnel",
            name: "Entonnoir",
            category: "equipment",
            type: "funnel",
            icon: "funnel"
        },
        {
            id: "spatula",
            name: "Spatule",
            category: "tools",
            type: "spatula",
            icon: "spatula"
        },
        {
            id: "pipette",
            name: "Pipette",
            category: "tools",
            type: "pipette",
            icon: "pipette"
        },
        {
            id: "dropper",
            name: "Compte-gouttes",
            category: "tools",
            type: "dropper",
            icon: "dropper"
        },
        {
            id: "forceps",
            name: "Pince",
            category: "tools",
            type: "forceps",
            icon: "forceps"
        }
    ];

    function all() {
        return equipment.map(CF.clone);
    }

    function get(id) {
        const item = equipment.find(x => x.id === id);
        return item ? CF.clone(item) : null;
    }

    return {
        all,
        get
    };
})();


/* ================================================================
   05. REACTION DATABASE
   ---------------------------------------------------------------
   Only explicit models execute.
   ================================================================ */

const ReactionDatabase = (() => {

    const reactions = [

        /* ========================================================
           MODEL 01
           ACETIC ACID + SODIUM BICARBONATE
           ======================================================== */

        {
            id: "acid_bicarbonate",
            name: "Réaction acide + bicarbonate",
            type: "acid-carbonate",
            level: "débutant",
            educational: true,

            reactants: [
                {
                    substance: "acetic_acid",
                    minimum: 1,
                    ratio: 1
                },
                {
                    substance: "sodium_bicarbonate",
                    minimum: 1,
                    ratio: 1
                }
            ],

            products: [
                {
                    substance: "sodium_acetate",
                    name: "Acétate de sodium",
                    formula: "CH₃COONa",
                    amountFactor: 1
                },
                {
                    substance: "carbon_dioxide",
                    name: "Dioxyde de carbone",
                    formula: "CO₂",
                    amountFactor: 1
                },
                {
                    substance: "water",
                    name: "Eau",
                    formula: "H₂O",
                    amountFactor: 1
                }
            ],

            equation:
                "CH₃COOH + NaHCO₃ → CH₃COONa + CO₂ + H₂O",

            observations: [
                "Effervescence visible.",
                "Formation simulée de CO₂.",
                "Le mélange devient homogène après agitation.",
                "Le modèle indique une réaction acide-carbonate."
            ],

            finalState: "Réaction effectuée — dégagement gazeux simulé.",

            calculate(context) {
                const acid = context.reactants.find(
                    x => x.substanceId === "acetic_acid"
                );

                const bicarbonate = context.reactants.find(
                    x => x.substanceId === "sodium_bicarbonate"
                );

                const acidAmount = CF.num(
                    acid?.amount,
                    1
                );

                const bicarbonateAmount = CF.num(
                    bicarbonate?.amount,
                    1
                );

                const limiting = Math.min(
                    acidAmount,
                    bicarbonateAmount
                );

                return {
                    extent: limiting,
                    gasVolume: CF.round(limiting * 22.4, 2),
                    pH: 7
                };
            }
        },

        /* ========================================================
           MODEL 02
           COPPER SULFATE + WATER
           ======================================================== */

        {
            id: "copper_sulfate_solution",
            name: "Dissolution du sulfate de cuivre",
            type: "dissolution",
            level: "débutant",
            educational: true,

            reactants: [
                {
                    substance: "copper_sulfate",
                    minimum: 1,
                    ratio: 1
                },
                {
                    substance: "water",
                    minimum: 1,
                    ratio: 1
                }
            ],

            products: [
                {
                    substance: "copper_sulfate_solution",
                    name: "Solution aqueuse de sulfate de cuivre",
                    formula: "CuSO₄(aq)",
                    amountFactor: 1
                }
            ],

            equation:
                "CuSO₄(s) + H₂O(l) → CuSO₄(aq)",

            observations: [
                "Le solide est considéré comme dissous dans le modèle.",
                "La solution prend une coloration bleue.",
                "Le mélange est homogène."
            ],

            finalState:
                "Solution aqueuse bleue — dissolution modélisée.",

            calculate(context) {
                const water = context.reactants.find(
                    x => x.substanceId === "water"
                );

                const copperSulfate = context.reactants.find(
                    x => x.substanceId === "copper_sulfate"
                );

                return {
                    extent: Math.min(
                        CF.num(water?.amount, 1),
                        CF.num(copperSulfate?.amount, 1)
                    ),
                    pH: 4,
                    color: "#278cff"
                };
            }
        },

        /* ========================================================
           MODEL 03
           INDICATOR + ACETIC ACID
           ======================================================== */

        {
            id: "indicator_acid",
            name: "Indicateur universel en milieu acide",
            type: "acid-indicator",
            level: "débutant",
            educational: true,

            reactants: [
                {
                    substance: "universal_indicator",
                    minimum: 1,
                    ratio: 1
                },
                {
                    substance: "acetic_acid",
                    minimum: 1,
                    ratio: 1
                }
            ],

            products: [
                {
                    substance: "acidic_indicator_solution",
                    name: "Solution indicatrice acide",
                    formula: "Ind.(aq)",
                    amountFactor: 1
                }
            ],

            equation:
                "Indicateur universel + CH₃COOH → couleur correspondant à un milieu acide",

            observations: [
                "L'indicateur change de couleur.",
                "La solution est classée dans une zone acide.",
                "Le pH simulé est inférieur à 7."
            ],

            finalState:
                "Milieu acide détecté par indicateur.",

            calculate(context) {
                return {
                    extent: 1,
                    pH: 2.4,
                    color: "#ef5b73"
                };
            }
        },

        /* ========================================================
           MODEL 04
           HCl + NaOH
           ======================================================== */

        {
            id: "hcl_naoh_neutralization",
            name: "Neutralisation acide-base",
            type: "neutralization",
            level: "intermédiaire",
            educational: true,

            reactants: [
                {
                    substance: "hydrochloric_acid",
                    minimum: 1,
                    ratio: 1
                },
                {
                    substance: "sodium_hydroxide",
                    minimum: 1,
                    ratio: 1
                }
            ],

            products: [
                {
                    substance: "sodium_chloride",
                    name: "Chlorure de sodium",
                    formula: "NaCl",
                    amountFactor: 1
                },
                {
                    substance: "water",
                    name: "Eau",
                    formula: "H₂O",
                    amountFactor: 1
                }
            ],

            equation:
                "HCl + NaOH → NaCl + H₂O",

            observations: [
                "Neutralisation acide-base modélisée.",
                "Le pH se rapproche de la neutralité lorsque les quantités sont équivalentes.",
                "Une variation thermique pédagogique peut être affichée."
            ],

            finalState:
                "Neutralisation effectuée dans le modèle.",

            calculate(context) {
                const acid = context.reactants.find(
                    x => x.substanceId === "hydrochloric_acid"
                );

                const base = context.reactants.find(
                    x => x.substanceId === "sodium_hydroxide"
                );

                const a = CF.num(acid?.amount, 1);
                const b = CF.num(base?.amount, 1);

                let pH = 7;

                if (a > b) {
                    pH = 3;
                } else if (b > a) {
                    pH = 11;
                }

                return {
                    extent: Math.min(a, b),
                    pH,
                    temperatureDelta: 2
                };
            }
        },

        /* ========================================================
           MODEL 05
           INDICATOR + NaOH
           ======================================================== */

        {
            id: "indicator_base",
            name: "Indicateur universel en milieu basique",
            type: "base-indicator",
            level: "débutant",
            educational: true,

            reactants: [
                {
                    substance: "universal_indicator",
                    minimum: 1,
                    ratio: 1
                },
                {
                    substance: "sodium_hydroxide",
                    minimum: 1,
                    ratio: 1
                }
            ],

            products: [
                {
                    substance: "basic_indicator_solution",
                    name: "Solution indicatrice basique",
                    formula: "Ind.(aq)",
                    amountFactor: 1
                }
            ],

            equation:
                "Indicateur universel + NaOH → couleur correspondant à un milieu basique",

            observations: [
                "L'indicateur change de couleur.",
                "Le milieu est classé basique.",
                "Le pH simulé est supérieur à 7."
            ],

            finalState:
                "Milieu basique détecté par indicateur.",

            calculate() {
                return {
                    extent: 1,
                    pH: 13,
                    color: "#4e9eff"
                };
            }
        },

        /* ========================================================
           MODEL 06
           HCl + INDICATOR
           ======================================================== */

        {
            id: "indicator_strong_acid",
            name: "Indicateur en milieu fortement acide",
            type: "acid-indicator",
            level: "débutant",
            educational: true,

            reactants: [
                {
                    substance: "universal_indicator",
                    minimum: 1,
                    ratio: 1
                },
                {
                    substance: "hydrochloric_acid",
                    minimum: 1,
                    ratio: 1
                }
            ],

            products: [
                {
                    substance: "acidic_indicator_solution",
                    name: "Solution indicatrice fortement acide",
                    formula: "Ind.(aq)",
                    amountFactor: 1
                }
            ],

            equation:
                "Indicateur universel + HCl → couleur correspondant à un milieu fortement acide",

            observations: [
                "L'indicateur révèle un milieu fortement acide.",
                "Le pH simulé est proche de 1."
            ],

            finalState:
                "Milieu fortement acide détecté.",

            calculate() {
                return {
                    extent: 1,
                    pH: 1,
                    color: "#d9435f"
                };
            }
        }
    ];

    function all() {
        return reactions.map(CF.clone);
    }

    function get(id) {
        const item = reactions.find(x => x.id === id);
        return item ? item : null;
    }

    function search(query = "") {
        const q = query.trim().toLowerCase();

        if (!q) return all();

        return reactions
            .filter(reaction =>
                [
                    reaction.name,
                    reaction.type,
                    reaction.level,
                    reaction.equation,
                    reaction.observations.join(" ")
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(q)
            )
            .map(CF.clone);
    }

    function findCompatible(contents) {
        const ids = contents.map(x => x.substanceId);

        return reactions.filter(reaction => {
            return reaction.reactants.every(required =>
                ids.includes(required.substance)
            );
        });
    }

    return {
        all,
        get,
        search,
        findCompatible
    };
})();


/* ================================================================
   06. APPLICATION STATE
   ================================================================ */

const LabState = (() => {

    const defaultState = {
        version: CF.VERSION,

        experiment: {
            id: CF.uid("EXP"),
            name: "Nouvelle expérience",
            studentName: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },

        level: "Débutant",

        objects: [],

        selectedObjectId: null,

        activeTool: "select",

        activeLibraryCategory: "substances",

        activeChemicalFilter: "all",

        stage: {
            zoom: 1,
            offsetX: 0,
            offsetY: 0
        },

        counters: {
            actions: 0
        },

        reactionResult: null,

        journal: [],

        metadata: {
            application: "CHIMIQUE FOBAS",
            engine: "Chemical Simulation Engine",
            version: CF.VERSION
        }
    };

    let state = CF.clone(defaultState);

    function get() {
        return state;
    }

    function reset() {
        state = CF.clone(defaultState);

        state.experiment.id = CF.uid("EXP");
        state.experiment.createdAt = new Date().toISOString();
        state.experiment.updatedAt = new Date().toISOString();

        return state;
    }

    function replace(newState) {
        if (!newState || typeof newState !== "object") {
            throw new Error("État expérimental invalide.");
        }

        const safe = CF.clone(defaultState);

        state = {
            ...safe,
            ...newState,
            experiment: {
                ...safe.experiment,
                ...(newState.experiment || {})
            },
            counters: {
                ...safe.counters,
                ...(newState.counters || {})
            },
            stage: {
                ...safe.stage,
                ...(newState.stage || {})
            },
            metadata: {
                ...safe.metadata,
                ...(newState.metadata || {})
            }
        };

        if (!Array.isArray(state.objects)) {
            state.objects = [];
        }

        if (!Array.isArray(state.journal)) {
            state.journal = [];
        }

        return state;
    }

    function objectById(id) {
        return state.objects.find(object => object.id === id) || null;
    }

    function selected() {
        return objectById(state.selectedObjectId);
    }

    function containers() {
        return state.objects.filter(object => object.isContainer);
    }

    function substancesInLab() {
        return state.objects.filter(
            object => object.objectCategory === "substance"
        );
    }

    function setSelected(id) {
        state.selectedObjectId = id || null;
    }

    function touch() {
        state.experiment.updatedAt = new Date().toISOString();
    }

    return {
        defaultState,
        get,
        reset,
        replace,
        objectById,
        selected,
        containers,
        substancesInLab,
        setSelected,
        touch
    };
})();


/* ================================================================
   07. HISTORY / UNDO / REDO
   ================================================================ */

const HistoryEngine = (() => {

    let undoStack = [];
    let redoStack = [];
    let restoring = false;

    function snapshot() {
        return CF.clone(LabState.get());
    }

    function begin(label = "Action") {
        if (restoring) return;

        undoStack.push({
            label,
            state: snapshot(),
            time: new Date().toISOString()
        });

        if (undoStack.length > CF.MAX_HISTORY) {
            undoStack.shift();
        }

        redoStack = [];
        updateButtons();
    }

    function undo() {
        if (!undoStack.length) {
            NotificationEngine.info("Aucune action à annuler.");
            return;
        }

        const current = snapshot();
        const previous = undoStack.pop();

        redoStack.push({
            label: previous.label,
            state: current,
            time: new Date().toISOString()
        });

        restoring = true;

        try {
            LabState.replace(previous.state);
            UIEngine.renderAll();
            JournalEngine.add("Annulation : " + previous.label, false);
            NotificationEngine.success("Action annulée.");
        } finally {
            restoring = false;
        }

        updateButtons();
    }

    function redo() {
        if (!redoStack.length) {
            NotificationEngine.info("Aucune action à rétablir.");
            return;
        }

        const current = snapshot();
        const next = redoStack.pop();

        undoStack.push({
            label: next.label,
            state: current,
            time: new Date().toISOString()
        });

        restoring = true;

        try {
            LabState.replace(next.state);
            UIEngine.renderAll();
            JournalEngine.add("Rétablissement : " + next.label, false);
            NotificationEngine.success("Action rétablie.");
        } finally {
            restoring = false;
        }

        updateButtons();
    }

    function clear() {
        undoStack = [];
        redoStack = [];
        updateButtons();
    }

    function updateButtons() {
        const undo = CF.$('[data-action="undo"]');
        const redo = CF.$('[data-action="redo"]');

        if (undo) undo.disabled = undoStack.length === 0;
        if (redo) redo.disabled = redoStack.length === 0;
    }

    return {
        begin,
        undo,
        redo,
        clear,
        updateButtons
    };
})();


/* ================================================================
   08. NOTIFICATION ENGINE
   ================================================================ */

const NotificationEngine = (() => {

    function show(message, type = "info", duration = 3000) {

        const container = CF.byId("notification-container");

        if (!container) {
            console.log("[CHIMIQUE FOBAS]", message);
            return;
        }

        const item = document.createElement("div");

        item.className = "notification " + type;

        const icon = document.createElement("div");
        icon.className = "notification-icon";

        const messageNode = document.createElement("div");
        messageNode.className = "notification-message";
        messageNode.textContent = message;

        icon.textContent =
            type === "success"
                ? "✓"
                : type === "error"
                    ? "!"
                    : type === "warning"
                        ? "⚠"
                        : "i";

        item.appendChild(icon);
        item.appendChild(messageNode);

        container.appendChild(item);

        window.setTimeout(() => {
            item.style.opacity = "0";
            item.style.transform = "translateX(12px)";

            window.setTimeout(() => {
                item.remove();
            }, 180);
        }, duration);
    }

    return {
        show,

        success(message, duration) {
            show(message, "success", duration);
        },

        error(message, duration) {
            show(message, "error", duration);
        },

        warning(message, duration) {
            show(message, "warning", duration);
        },

        info(message, duration) {
            show(message, "info", duration);
        }
    };
})();


/* ================================================================
   09. JOURNAL ENGINE
   ================================================================ */

const JournalEngine = (() => {

    function add(message, increaseCounter = true) {

        const state = LabState.get();

        state.journal.push({
            id: CF.uid("LOG"),
            message,
            time: CF.time(),
            timestamp: new Date().toISOString()
        });

        if (state.journal.length > 250) {
            state.journal.shift();
        }

        if (increaseCounter) {
            state.counters.actions += 1;
        }

        LabState.touch();
        render();
    }

    function clear() {
        HistoryEngine.begin("Effacement du journal");

        LabState.get().journal = [];

        LabState.touch();

        render();

        NotificationEngine.success("Journal vidé.");
    }

    function render() {

        const container = CF.byId("action-journal");

        if (!container) return;

        const entries = LabState.get().journal;

        if (!entries.length) {
            container.innerHTML = `
                <div class="journal-entry">
                    <div class="journal-entry-message">
                        Aucune action enregistrée.
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = entries
            .slice()
            .reverse()
            .map(entry => `
                <div class="journal-entry">
                    <div class="journal-entry-time">
                        ${CF.escapeHTML(entry.time)}
                    </div>
                    <div class="journal-entry-message">
                        ${CF.escapeHTML(entry.message)}
                    </div>
                </div>
            `)
            .join("");
    }

    return {
        add,
        clear,
        render
    };
})();


/* ================================================================
   10. LIBRARY ENGINE
   ================================================================ */

const LibraryEngine = (() => {

    function getItems(category) {

        if (category === "substances") {
            return ChemicalDatabase.search(
                CF.byId("library-search")?.value || "",
                LabState.get().activeChemicalFilter
            );
        }

        if (category === "glassware") {
            return GlasswareDatabase.all();
        }

        if (category === "equipment") {
            return EquipmentDatabase.all().filter(
                x => x.category === "equipment"
            );
        }

        if (category === "tools") {
            return EquipmentDatabase.all().filter(
                x => x.category === "tools"
            );
        }

        return [];
    }

    function iconFor(item) {
        const icon = document.createElement("div");
        icon.className = "library-item-icon";

        const symbol = document.createElement("span");

        if (item.category === "substances") {
            symbol.textContent = item.formula || "⚗";
        } else {
            symbol.textContent =
                item.type === "flask"
                    ? "⚗"
                    : item.type === "beaker"
                        ? "▱"
                        : item.type === "test-tube"
                            ? "│"
                            : item.type === "thermometer"
                                ? "🌡"
                                : item.type === "burner"
                                    ? "♨"
                                    : item.type === "pipette"
                                        ? "↧"
                                        : "⚙";
        }

        icon.appendChild(symbol);

        return icon;
    }

    function render() {

        const container = CF.byId("library-items");
        const empty = CF.byId("library-empty");

        if (!container) return;

        const category = LabState.get().activeLibraryCategory;
        const items = getItems(category);

        container.innerHTML = "";

        if (empty) {
            empty.style.display = items.length ? "none" : "block";
        }

        items.forEach(item => {

            const element = document.createElement("div");

            element.className = "library-item";
            element.tabIndex = 0;
            element.draggable = true;

            element.dataset.libraryId = item.id;
            element.dataset.libraryCategory = category;

            const icon = iconFor({
                ...item,
                category:
                    category === "substances"
                        ? "substance"
                        : item.category
            });

            const info = document.createElement("div");

            info.innerHTML = `
                <div class="library-item-name">
                    ${CF.escapeHTML(item.name)}
                </div>
                <div class="library-item-formula">
                    ${CF.escapeHTML(
                        item.formula ||
                        item.type ||
                        ""
                    )}
                </div>
            `;

            const badge = document.createElement("div");

            badge.className = "library-item-badge";
            badge.textContent =
                category === "substances"
                    ? item.category
                    : item.type;

            element.appendChild(icon);
            element.appendChild(info);
            element.appendChild(badge);

            element.addEventListener("click", event => {
                CF.stop(event);
                addFromLibrary(item.id, category);
            });

            element.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    CF.stop(event);
                    addFromLibrary(item.id, category);
                }
            });

            element.addEventListener("dragstart", event => {
                event.dataTransfer.effectAllowed = "copy";
                event.dataTransfer.setData(
                    "text/plain",
                    JSON.stringify({
                        source: "library",
                        id: item.id,
                        category
                    })
                );

                element.classList.add("dragging");
            });

            element.addEventListener("dragend", () => {
                element.classList.remove("dragging");
            });

            container.appendChild(element);
        });
    }

    function addFromLibrary(id, category) {

        HistoryEngine.begin("Ajout de " + id);

        let item = null;

        if (category === "substances") {
            item = ChemicalDatabase.get(id);
        } else if (category === "glassware") {
            item = GlasswareDatabase.get(id);
        } else {
            item = EquipmentDatabase.get(id);
        }

        if (!item) {
            NotificationEngine.error(
                "Objet introuvable dans la bibliothèque."
            );
            return;
        }

        ObjectEngine.createFromLibrary(item, category);

        UIEngine.renderAll();

        NotificationEngine.success(
            `${item.name} ajouté au laboratoire.`
        );
    }

    function activateCategory(category) {

        if (![
            "substances",
            "glassware",
            "equipment",
            "tools"
        ].includes(category)) {
            category = "substances";
        }

        LabState.get().activeLibraryCategory = category;

        CF.$$("[data-library-category]").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.libraryCategory === category
            );
        });

        render();
    }

    function activateFilter(filter) {

        LabState.get().activeChemicalFilter = filter || "all";

        CF.$$("[data-filter]").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.filter === filter
            );
        });

        render();
    }

    function clearSearch() {

        const input = CF.byId("library-search");

        if (input) {
            input.value = "";
            input.focus();
        }

        render();
    }

    return {
        render,
        addFromLibrary,
        activateCategory,
        activateFilter,
        clearSearch
    };
})();


/* ================================================================
   11. OBJECT RENDERING ENGINE
   ================================================================ */

const ObjectEngine = (() => {

    function createBaseObject(item, category) {

        const state = LabState.get();

        const index = state.objects.length;

        const object = {
            id: CF.uid(
                category === "substances"
                    ? "SUB"
                    : category === "glassware"
                        ? "GLS"
                        : "EQP"
            ),

            libraryId: item.id,

            name: item.name,

            objectCategory:
                category === "substances"
                    ? "substance"
                    : category,

            objectType:
                item.type ||
                category,

            formula: item.formula || "",

            icon: item.icon || item.type || "object",

            x: 20 + ((index * 13) % 65),

            y: 25 + ((index * 11) % 55),

            rotation: 0,

            scale: 1,

            selected: false,

            isContainer:
                category === "glassware",

            capacity:
                item.capacity || null,

            volume: 0,

            temperature: 20,

            ph:
                item.ph ??
                null,

            mixtureState:
                category === "glassware"
                    ? "empty"
                    : "pure",

            reactionState:
                category === "glassware"
                    ? "none"
                    : "not-applicable",

            status:
                category === "glassware"
                    ? "Conteneur vide"
                    : "Objet prêt",

            contents: [],

            visualColor:
                item.color ||
                "rgba(255,255,255,.08)",

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()
        };

        return object;
    }

    function createFromLibrary(item, category) {

        const object = createBaseObject(item, category);

        LabState.get().objects.push(object);

        select(object.id);

        JournalEngine.add(
            `${item.name} ajouté au laboratoire.`
        );

        return object;
    }

    function createSubstance(substanceId, options = {}) {

        const substance = ChemicalDatabase.get(substanceId);

        if (!substance) {
            throw new Error(
                "Substance inconnue : " + substanceId
            );
        }

        const object = createBaseObject(
            substance,
            "substances"
        );

        object.amount =
            options.amount ??
            (
                substance.state === "solid"
                    ? substance.defaultMass || 1
                    : substance.defaultVolume || 1
            );

        object.unit =
            options.unit ||
            (
                substance.state === "solid"
                    ? "g"
                    : "mL"
            );

        object.volume =
            substance.state === "solid"
                ? 0
                : CF.num(
                    substance.defaultVolume,
                    1
                );

        object.ph = substance.ph;

        return object;
    }

    function select(id) {

        LabState.setSelected(id);

        LabState.get().objects.forEach(object => {
            object.selected = object.id === id;
        });

        renderObjects();
        InspectorEngine.render();
        UIEngine.renderContainerStatus();
    }

    function remove(id) {

        const state = LabState.get();

        const index = state.objects.findIndex(
            object => object.id === id
        );

        if (index < 0) return false;

        const object = state.objects[index];

        state.objects.splice(index, 1);

        if (state.selectedObjectId === id) {
            state.selectedObjectId = null;
        }

        JournalEngine.add(
            `${object.name} supprimé du laboratoire.`
        );

        UIEngine.renderAll();

        return true;
    }

    function duplicate(id) {

        const original = LabState.objectById(id);

        if (!original) return null;

        const copy = CF.clone(original);

        copy.id = CF.uid("COPY");

        copy.x = CF.clamp(
            CF.num(copy.x, 50) + 7,
            5,
            95
        );

        copy.y = CF.clamp(
            CF.num(copy.y, 50) + 7,
            5,
            90
        );

        copy.selected = false;

        LabState.get().objects.push(copy);

        select(copy.id);

        JournalEngine.add(
            `${original.name} dupliqué.`
        );

        UIEngine.renderAll();

        return copy;
    }

    function renderObjects() {

        const container =
            CF.byId("laboratory-objects");

        if (!container) return;

        container.innerHTML = "";

        LabState.get().objects.forEach(object => {

            const element =
                renderObject(object);

            container.appendChild(element);
        });

        const empty =
            CF.byId("empty-laboratory");

        if (empty) {
            empty.style.display =
                LabState.get().objects.length
                    ? "none"
                    : "grid";
        }
    }

    function renderObject(object) {

        const element =
            document.createElement("div");

        element.className = "lab-object";

        if (object.selected) {
            element.classList.add("selected");
        }

        if (
            object.mixtureState === "mixed"
        ) {
            element.classList.add(
                "container-mixed"
            );
        }

        if (
            object.reactionState === "completed"
        ) {
            element.classList.add(
                "container-reacted"
            );
        }

        if (
            object.temperature > 35
        ) {
            element.classList.add(
                "temperature-hot"
            );
        }

        if (
            object.temperature < 10
        ) {
            element.classList.add(
                "temperature-cold"
            );
        }

        if (
            object.reactionVisual === "effervescence"
        ) {
            element.classList.add(
                "effervescence"
            );
        }

        element.dataset.objectId = object.id;
        element.dataset.objectType = object.objectType;
        element.dataset.objectCategory =
            object.objectCategory;

        const width =
            object.isContainer
                ? (
                    object.objectType === "test-tube"
                        ? 70
                        : 120
                )
                : 90;

        const height =
            object.isContainer
                ? (
                    object.objectType === "test-tube"
                        ? 130
                        : 130
                )
                : 90;

        element.style.setProperty(
            "--object-width",
            `${width}px`
        );

        element.style.setProperty(
            "--object-height",
            `${height}px`
        );

        element.style.setProperty(
            "--object-rotation",
            `${CF.num(object.rotation, 0)}deg`
        );

        element.style.left =
            `${CF.num(object.x, 50)}%`;

        element.style.top =
            `${CF.num(object.y, 50)}%`;

        element.style.transform =
            `
                translate(-50%, -50%)
                rotate(${CF.num(object.rotation, 0)}deg)
                scale(${CF.num(object.scale, 1)})
            `;

        const visual =
            document.createElement("div");

        visual.className =
            "lab-object-visual";

        visual.innerHTML =
            VisualEngine.objectVisual(object);

        element.appendChild(visual);

        const label =
            document.createElement("div");

        label.className =
            "lab-object-label";

        label.textContent =
            object.name;

        element.appendChild(label);

        bindObjectEvents(
            element,
            object
        );

        return element;
    }

    function bindObjectEvents(element, object) {

        element.addEventListener(
            "pointerdown",
            event => {

                if (
                    event.button !== undefined &&
                    event.button !== 0
                ) {
                    return;
                }

                event.stopPropagation();

                if (
                    LabState.get().activeTool ===
                    "add"
                ) {
                    return;
                }

                select(object.id);

                DragEngine.beginObjectDrag(
                    event,
                    element,
                    object
                );
            }
        );

        element.addEventListener(
            "contextmenu",
            event => {
                event.preventDefault();

                select(object.id);

                ContextMenuEngine.open(
                    event.clientX,
                    event.clientY,
                    object.id
                );
            }
        );

        element.addEventListener(
            "dblclick",
            event => {

                event.preventDefault();
                event.stopPropagation();

                select(object.id);

                if (object.isContainer) {
                    InspectorEngine.render();
                    NotificationEngine.info(
                        `${object.name} est sélectionné.`
                    );
                } else {
                    AnalysisEngine.analyzeObject(
                        object.id
                    );
                }
            }
        );
    }

    function move(id, x, y) {

        const object =
            LabState.objectById(id);

        if (!object) return;

        object.x = CF.clamp(
            CF.num(x, object.x),
            2,
            98
        );

        object.y = CF.clamp(
            CF.num(y, object.y),
            5,
            94
        );

        object.updatedAt =
            new Date().toISOString();

        LabState.touch();

        renderObjects();

        InspectorEngine.render();
    }

    return {
        createFromLibrary,
        createSubstance,
        select,
        remove,
        duplicate,
        move,
        renderObjects,
        renderObject
    };
})();


/* ================================================================
   12. VISUAL ENGINE
   ================================================================ */

const VisualEngine = (() => {

    function objectVisual(object) {

        if (object.isContainer) {
            return containerVisual(object);
        }

        if (object.objectCategory === "substance") {
            return substanceVisual(object);
        }

        return equipmentVisual(object);
    }

    function containerVisual(object) {

        const contents =
            object.contents || [];

        let liquidColor =
            object.visualColor ||
            "rgba(67,165,235,.48)";

        if (object.mixtureColor) {
            liquidColor =
                object.mixtureColor;
        }

        const fillHeight =
            contents.length
                ? CF.clamp(
                    18 +
                    Math.min(
                        object.volume / Math.max(
                            object.capacity || 100,
                            1
                        ),
                        1
                    ) * 48,
                    18,
                    70
                )
                : 10;

        if (
            object.objectType ===
            "test-tube"
        ) {
            return `
                <div class="chem-test-tube">
                    <div
                        class="chem-test-tube-liquid mixture-visual"
                        style="
                            height:${fillHeight}%;
                            background:
                                linear-gradient(
                                    180deg,
                                    ${liquidColor},
                                    ${liquidColor}
                                );
                        "
                    ></div>
                </div>
            `;
        }

        if (
            object.objectType ===
            "flask"
        ) {
            return `
                <div class="chem-glass">
                    <div
                        class="chem-liquid mixture-visual"
                        style="
                            height:${fillHeight}%;
                            background:
                                linear-gradient(
                                    180deg,
                                    ${liquidColor},
                                    ${liquidColor}
                                );
                        "
                    ></div>
                </div>
            `;
        }

        return `
            <div class="chem-beaker">
                <div
                    class="chem-beaker-liquid mixture-visual"
                    style="
                        height:${fillHeight}%;
                        background:
                            linear-gradient(
                                180deg,
                                ${liquidColor},
                                ${liquidColor}
                            );
                    "
                ></div>
            </div>
        `;
    }

    function substanceVisual(object) {

        const color =
            object.visualColor ||
            "rgba(220,230,240,.8)";

        const category =
            object.objectCategory;

        if (
            object.objectType === "solid" ||
            object.state === "solid"
        ) {
            return `
                <div
                    style="
                        width:52px;
                        height:52px;
                        border-radius:12px;
                        background:
                            radial-gradient(
                                circle at 30% 25%,
                                rgba(255,255,255,.75),
                                transparent 22%
                            ),
                            ${color};
                        border:1px solid
                            rgba(255,255,255,.28);
                        box-shadow:
                            0 12px 20px
                            rgba(0,0,0,.28),
                            inset 0 2px 4px
                            rgba(255,255,255,.25);
                        transform:
                            rotate(-7deg)
                            skew(-4deg);
                    "
                ></div>
            `;
        }

        if (category === "substance") {
            return `
                <div
                    style="
                        width:55px;
                        height:55px;
                        border-radius:50%;
                        background:
                            radial-gradient(
                                circle at 30% 25%,
                                rgba(255,255,255,.7),
                                transparent 19%
                            ),
                            ${color};
                        border:
                            2px solid
                            rgba(255,255,255,.25);
                        box-shadow:
                            0 12px 25px
                            rgba(0,0,0,.3),
                            inset 0 4px 9px
                            rgba(255,255,255,.18);
                    "
                ></div>
            `;
        }

        return `
            <div
                style="
                    width:55px;
                    height:55px;
                    border-radius:12px;
                    background:${color};
                "
            ></div>
        `;
    }

    function equipmentVisual(object) {

        const type = object.objectType;

        const symbols = {
            burner: "♨",
            support: "△",
            thermometer: "🌡",
            balance: "⚖",
            stirrer: "↻",
            funnel: "▽",
            spatula: "⌁",
            pipette: "↧",
            dropper: "◉",
            forceps: "⌁"
        };

        return `
            <div
                style="
                    width:62px;
                    height:62px;
                    display:grid;
                    place-items:center;
                    border-radius:15px;
                    color:#eaf3ff;
                    font-size:30px;
                    background:
                        linear-gradient(
                            145deg,
                            #1b3a5c,
                            #0a1728
                        );
                    border:
                        1px solid
                        rgba(255,255,255,.14);
                    box-shadow:
                        0 13px 23px
                        rgba(0,0,0,.28),
                        inset 0 1px 0
                        rgba(255,255,255,.1);
                "
            >
                ${symbols[type] || "⚙"}
            </div>
        `;
    }

    return {
        objectVisual,
        containerVisual
    };
})();


/* ================================================================
   13. DRAG / DROP ENGINE
   ================================================================ */

const DragEngine = (() => {

    let objectDrag = null;
    let stageDrag = null;

    function init() {

        const stage =
            CF.byId("laboratory-stage");

        if (!stage) return;

        stage.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                stage.classList.add(
                    "drag-over"
                );

                stage.dataset.dragOver =
                    "true";

                if (
                    event.dataTransfer
                ) {
                    event.dataTransfer.dropEffect =
                        "copy";
                }
            }
        );

        stage.addEventListener(
            "dragleave",
            event => {

                if (
                    event.target === stage
                ) {
                    stage.classList.remove(
                        "drag-over"
                    );

                    stage.dataset.dragOver =
                        "false";
                }
            }
        );

        stage.addEventListener(
            "drop",
            event => {

                event.preventDefault();

                stage.classList.remove(
                    "drag-over"
                );

                stage.dataset.dragOver =
                    "false";

                let data = null;

                try {
                    data = JSON.parse(
                        event.dataTransfer.getData(
                            "text/plain"
                        )
                    );
                } catch (error) {
                    return;
                }

                if (
                    !data ||
                    data.source !== "library"
                ) {
                    return;
                }

                const rect =
                    stage.getBoundingClientRect();

                const x =
                    ((event.clientX - rect.left) /
                        rect.width) *
                    100;

                const y =
                    ((event.clientY - rect.top) /
                        rect.height) *
                    100;

                HistoryEngine.begin(
                    "Ajout par glisser-déposer"
                );

                let item = null;

                if (
                    data.category ===
                    "substances"
                ) {
                    item =
                        ChemicalDatabase.get(
                            data.id
                        );
                } else if (
                    data.category ===
                    "glassware"
                ) {
                    item =
                        GlasswareDatabase.get(
                            data.id
                        );
                } else {
                    item =
                        EquipmentDatabase.get(
                            data.id
                        );
                }

                if (!item) return;

                const object =
                    ObjectEngine.createFromLibrary(
                        item,
                        data.category
                    );

                object.x =
                    CF.clamp(x, 3, 97);

                object.y =
                    CF.clamp(y, 5, 92);

                UIEngine.renderAll();

                NotificationEngine.success(
                    `${item.name} placé dans le laboratoire.`
                );
            }
        );
    }

    function beginObjectDrag(
        event,
        element,
        object
    ) {

        if (
            LabState.get().activeTool ===
            "select" &&
            event.pointerType === "mouse"
        ) {
            /* mouse dragging remains enabled */
        }

        const stage =
            CF.byId("laboratory-stage");

        if (!stage) return;

        const rect =
            stage.getBoundingClientRect();

        const startX =
            event.clientX;

        const startY =
            event.clientY;

        const initialX =
            object.x;

        const initialY =
            object.y;

        let moved = false;

        objectDrag = {
            pointerId: event.pointerId,
            object,
            element,
            rect,
            startX,
            startY,
            initialX,
            initialY
        };

        HistoryEngine.begin(
            `Déplacement de ${object.name}`
        );

        try {
            element.setPointerCapture(
                event.pointerId
            );
        } catch (error) {
            /* Some browsers do not support it */
        }

        element.classList.add(
            "dragging"
        );

        const moveHandler =
            moveEvent => {

                if (
                    !objectDrag ||
                    moveEvent.pointerId !==
                    objectDrag.pointerId
                ) {
                    return;
                }

                const dx =
                    moveEvent.clientX -
                    objectDrag.startX;

                const dy =
                    moveEvent.clientY -
                    objectDrag.startY;

                if (
                    Math.abs(dx) > 3 ||
                    Math.abs(dy) > 3
                ) {
                    moved = true;
                }

                const x =
                    objectDrag.initialX +
                    (dx / rect.width) *
                    100;

                const y =
                    objectDrag.initialY +
                    (dy / rect.height) *
                    100;

                object.x =
                    CF.clamp(x, 2, 98);

                object.y =
                    CF.clamp(y, 5, 94);

                object.updatedAt =
                    new Date().toISOString();

                element.style.left =
                    `${object.x}%`;

                element.style.top =
                    `${object.y}%`;

                InspectorEngine.render();
            };

        const endHandler =
            endEvent => {

                if (
                    !objectDrag ||
                    endEvent.pointerId !==
                    objectDrag.pointerId
                ) {
                    return;
                }

                element.classList.remove(
                    "dragging"
                );

                try {
                    element.releasePointerCapture(
                        endEvent.pointerId
                    );
                } catch (error) {
                    /* ignored */
                }

                element.removeEventListener(
                    "pointermove",
                    moveHandler
                );

                element.removeEventListener(
                    "pointerup",
                    endHandler
                );

                element.removeEventListener(
                    "pointercancel",
                    endHandler
                );

                object.updatedAt =
                    new Date().toISOString();

                LabState.touch();

                if (moved) {
                    JournalEngine.add(
                        `${object.name} déplacé.`
                    );
                }

                objectDrag = null;

                UIEngine.renderStageStatus();
                InspectorEngine.render();
            };

        element.addEventListener(
            "pointermove",
            moveHandler
        );

        element.addEventListener(
            "pointerup",
            endHandler
        );

        element.addEventListener(
            "pointercancel",
            endHandler
        );
    }

    return {
        init,
        beginObjectDrag
    };
})();


/* ================================================================
   14. SELECTION ENGINE
   ================================================================ */

const SelectionEngine = (() => {

    function init() {

        const stage =
            CF.byId("laboratory-stage");

        if (!stage) return;

        stage.addEventListener(
            "pointerdown",
            event => {

                if (
                    event.target.closest(
                        ".lab-object"
                    )
                ) {
                    return;
                }

                if (
                    event.target.closest(
                        "[data-stage-control]"
                    )
                ) {
                    return;
                }

                ObjectEngine.select(null);

                InspectorEngine.render();

                ContextMenuEngine.close();
            }
        );
    }

    function clear() {
        ObjectEngine.select(null);
    }

    return {
        init,
        clear
    };
})();


/* ================================================================
   15. CONTAINER ENGINE
   ================================================================ */

const ContainerEngine = (() => {

    function selectedContainer() {

        const selected =
            LabState.selected();

        if (
            selected &&
            selected.isContainer
        ) {
            return selected;
        }

        const first =
            LabState
                .containers()
                .find(Boolean);

        return first || null;
    }

    function ensureContainer() {

        const container =
            selectedContainer();

        if (!container) {
            NotificationEngine.warning(
                "Ajoutez d'abord un récipient au laboratoire."
            );
            return null;
        }

        return container;
    }

    function addSubstance(
        substanceId,
        amount,
        unit,
        containerId = null
    ) {

        const container =
            containerId
                ? LabState.objectById(
                    containerId
                )
                : selectedContainer();

        if (
            !container ||
            !container.isContainer
        ) {
            NotificationEngine.warning(
                "Sélectionnez un récipient avant d'ajouter une substance."
            );
            return false;
        }

        const substance =
            ChemicalDatabase.get(
                substanceId
            );

        if (!substance) {
            NotificationEngine.error(
                "Substance introuvable."
            );
            return false;
        }

        amount =
            CF.num(
                amount,
                substance.state === "solid"
                    ? substance.defaultMass || 1
                    : substance.defaultVolume || 1
            );

        unit =
            unit ||
            (
                substance.state === "solid"
                    ? "g"
                    : "mL"
            );

        const isSolid =
            substance.state === "solid";

        const addedVolume =
            isSolid
                ? 0
                : amount;

        if (
            container.capacity &&
            container.volume +
            addedVolume >
            container.capacity
        ) {
            NotificationEngine.error(
                `Capacité dépassée : ${container.capacity} mL maximum.`
            );
            return false;
        }

        const existing =
            container.contents.find(
                content =>
                    content.substanceId ===
                    substanceId
            );

        if (existing) {

            existing.amount =
                CF.num(existing.amount) +
                amount;

            existing.unit = unit;

        } else {

            container.contents.push({
                id: CF.uid("CNT"),
                substanceId,
                name: substance.name,
                formula: substance.formula,
                amount,
                unit,
                state: substance.state,
                category: substance.category
            });
        }

        container.volume +=
            addedVolume;

        container.volume =
            CF.round(
                container.volume,
                2
            );

        if (
            container.contents.length === 1
        ) {
            container.mixtureState =
                "pure";
        } else {
            container.mixtureState =
                "mixture";
        }

        container.status =
            `Contient ${container.contents.length} substance(s)`;

        container.reactionState =
            "none";

        container.reactionVisual =
            null;

        updateContainerPH(container);

        LabState.setSelected(
            container.id
        );

        container.selected = true;

        LabState.get().objects.forEach(
            object => {
                if (
                    object.id !==
                    container.id
                ) {
                    object.selected = false;
                }
            }
        );

        LabState.touch();

        JournalEngine.add(
            `${substance.name} ajouté dans ${container.name} : ${amount} ${unit}.`
        );

        UIEngine.renderAll();

        NotificationEngine.success(
            `${substance.name} ajouté dans ${container.name}.`
        );

        return true;
    }

    function removeSubstance(
        containerId,
        contentId
    ) {

        const container =
            LabState.objectById(
                containerId
            );

        if (
            !container ||
            !container.isContainer
        ) {
            return false;
        }

        const index =
            container.contents.findIndex(
                item =>
                    item.id === contentId
            );

        if (index < 0) {
            return false;
        }

        const removed =
            container.contents[index];

        const substance =
            ChemicalDatabase.get(
                removed.substanceId
            );

        if (
            substance &&
            substance.state !== "solid"
        ) {
            container.volume -=
                CF.num(
                    removed.amount
                );
        }

        container.volume =
            Math.max(
                0,
                CF.round(
                    container.volume,
                    2
                )
            );

        container.contents.splice(
            index,
            1
        );

        container.mixtureState =
            container.contents.length
                ? (
                    container.contents.length > 1
                        ? "mixture"
                        : "pure"
                )
                : "empty";

        container.reactionState =
            "none";

        container.reactionVisual =
            null;

        container.status =
            container.contents.length
                ? `Contient ${container.contents.length} substance(s)`
                : "Conteneur vide";

        updateContainerPH(container);

        LabState.touch();

        JournalEngine.add(
            `${removed.name} retiré de ${container.name}.`
        );

        UIEngine.renderAll();

        NotificationEngine.success(
            `${removed.name} retiré.`
        );

        return true;
    }

    function clearContainer(containerId) {

        const container =
            LabState.objectById(
                containerId
            );

        if (
            !container ||
            !container.isContainer
        ) {
            return false;
        }

        if (!container.contents.length) {
            NotificationEngine.info(
                "Le récipient est déjà vide."
            );
            return false;
        }

        container.contents = [];
        container.volume = 0;
        container.ph = 7;
        container.temperature = 20;
        container.mixtureState = "empty";
        container.reactionState = "none";
        container.reactionVisual = null;
        container.reactionResult = null;
        container.status = "Conteneur vide";

        LabState.touch();

        JournalEngine.add(
            `${container.name} nettoyé.`
        );

        UIEngine.renderAll();

        NotificationEngine.success(
            `${container.name} est maintenant propre.`
        );

        return true;
    }

    function updateContainerPH(container) {

        if (!container.contents.length) {
            container.ph = 7;
            return;
        }

        const pHs = [];

        container.contents.forEach(
            content => {

                const substance =
                    ChemicalDatabase.get(
                        content.substanceId
                    );

                if (
                    substance &&
                    substance.ph !== null &&
                    substance.ph !== undefined
                ) {
                    pHs.push(
                        CF.num(
                            substance.ph,
                            7
                        )
                    );
                }
            }
        );

        if (!pHs.length) {
            container.ph = 7;
            return;
        }

        const acids =
            pHs.filter(
                pH => pH < 7
            );

        const bases =
            pHs.filter(
                pH => pH > 7
            );

        if (
            acids.length &&
            !bases.length
        ) {
            container.ph =
                Math.min(...pHs);
            return;
        }

        if (
            bases.length &&
            !acids.length
        ) {
            container.ph =
                Math.max(...pHs);
            return;
        }

        container.ph = 7;
    }

    function getContentsSummary(container) {

        return container.contents
            .map(
                item =>
                    `${item.name} (${item.amount} ${item.unit})`
            )
            .join(", ");
    }

    return {
        selectedContainer,
        ensureContainer,
        addSubstance,
        removeSubstance,
        clearContainer,
        updateContainerPH,
        getContentsSummary
    };
})();


/* ================================================================
   16. MEASUREMENT ENGINE
   ================================================================ */

const MeasurementEngine = (() => {

    function measure() {

        const object =
            LabState.selected();

        if (!object) {
            NotificationEngine.warning(
                "Sélectionnez un objet ou un récipient à mesurer."
            );
            return;
        }

        if (object.isContainer) {

            const volume =
                CF.num(
                    object.volume
                );

            object.lastMeasurement = {
                type: "volume",
                value: volume,
                unit: "mL",
                time: new Date().toISOString()
            };

            object.status =
                `Mesure : ${volume} mL`;

            JournalEngine.add(
                `Mesure de ${object.name} : ${volume} mL.`
            );

            UIEngine.renderAll();

            NotificationEngine.success(
                `Volume mesuré : ${volume} mL.`
            );

            return;
        }

        const substance =
            ChemicalDatabase.get(
                object.libraryId
            );

        if (substance) {

            const amount =
                object.amount ??
                (
                    substance.state === "solid"
                        ? substance.defaultMass || 1
                        : substance.defaultVolume || 1
                );

            object.lastMeasurement = {
                type:
                    substance.state === "solid"
                        ? "mass"
                        : "volume",
                value: amount,
                unit:
                    substance.state === "solid"
                        ? "g"
                        : "mL",
                time: new Date().toISOString()
            };

            JournalEngine.add(
                `Mesure de ${object.name} : ${amount} ${object.lastMeasurement.unit}.`
            );

            NotificationEngine.success(
                `${object.name} : ${amount} ${object.lastMeasurement.unit}.`
            );

            UIEngine.renderAll();

            return;
        }

        NotificationEngine.info(
            "Cet objet ne possède pas de grandeur mesurable dans le modèle actuel."
        );
    }

    return {
        measure
    };
})();


/* ================================================================
   17. MIXING ENGINE
   ================================================================ */

const MixingEngine = (() => {

    function mix() {

        const container =
            ContainerEngine.ensureContainer();

        if (!container) return;

        if (!container.contents.length) {
            NotificationEngine.warning(
                "Impossible de mélanger : le récipient est vide."
            );
            return;
        }

        HistoryEngine.begin(
            `Mélange de ${container.name}`
        );

        container.mixtureState =
            container.contents.length > 1
                ? "mixed"
                : "mixed";

        container.status =
            "Mélange effectué";

        container.mixedAt =
            new Date().toISOString();

        container.reactionState =
            "ready";

        container.reactionVisual =
            null;

        LabState.touch();

        JournalEngine.add(
            `Mélange effectué dans ${container.name}.`
        );

        UIEngine.renderAll();

        NotificationEngine.success(
            `Mélange effectué : ${container.name} est maintenant à l'état mélangé.`
        );
    }

    return {
        mix
    };
})();


/* ================================================================
   18. TEMPERATURE ENGINE
   ================================================================ */

const TemperatureEngine = (() => {

    function setTemperature(
        temperature,
        objectId = null
    ) {

        const object =
            objectId
                ? LabState.objectById(
                    objectId
                )
                : LabState.selected();

        if (!object) {
            NotificationEngine.warning(
                "Sélectionnez un objet avant de modifier sa température."
            );
            return;
        }

        temperature =
            CF.num(
                temperature,
                object.temperature ?? 20
            );

        temperature =
            CF.clamp(
                temperature,
                -100,
                500
            );

        object.temperature =
            CF.round(
                temperature,
                1
            );

        object.status =
            `Température : ${object.temperature} °C`;

        LabState.touch();

        JournalEngine.add(
            `Température de ${object.name} réglée à ${object.temperature} °C.`
        );

        UIEngine.renderAll();

        NotificationEngine.success(
            `${object.name} : ${object.temperature} °C.`
        );
    }

    function promptTemperature() {

        const object =
            LabState.selected();

        if (!object) {
            NotificationEngine.warning(
                "Sélectionnez un objet ou un récipient."
            );
            return;
        }

        const current =
            object.temperature ?? 20;

        const value =
            window.prompt(
                "Entrez la température en °C :",
                String(current)
            );

        if (value === null) return;

        if (
            value.trim() === "" ||
            !Number.isFinite(
                Number(value)
            )
        ) {
            NotificationEngine.error(
                "Température invalide."
            );
            return;
        }

        HistoryEngine.begin(
            "Modification de température"
        );

        setTemperature(
            Number(value)
        );
    }

    return {
        setTemperature,
        promptTemperature
    };
})();


/* ================================================================
   19. PIPETTE ENGINE
   ================================================================ */

const PipetteEngine = (() => {

    function usePipette() {

        const selected =
            LabState.selected();

        if (
            !selected ||
            !selected.isContainer
        ) {
            NotificationEngine.warning(
                "Sélectionnez d'abord un récipient contenant une substance."
            );
            return;
        }

        if (!selected.contents.length) {
            NotificationEngine.warning(
                "Le récipient sélectionné ne contient aucune substance."
            );
            return;
        }

        const destination =
            LabState
                .containers()
                .find(
                    container =>
                        container.id !==
                        selected.id
                );

        if (!destination) {
            NotificationEngine.warning(
                "Ajoutez un deuxième récipient pour effectuer un transfert à la pipette."
            );
            return;
        }

        const sourceContent =
            selected.contents[0];

        const transferAmount =
            Math.min(
                CF.num(
                    sourceContent.amount,
                    0
                ),
                1
            );

        if (
            transferAmount <= 0
        ) {
            NotificationEngine.warning(
                "Quantité insuffisante pour le transfert."
            );
            return;
        }

        const substance =
            ChemicalDatabase.get(
                sourceContent.substanceId
            );

        if (!substance) return;

        if (
            substance.state !== "solid" &&
            destination.volume +
            transferAmount >
            destination.capacity
        ) {
            NotificationEngine.error(
                "La pipette ne peut pas dépasser la capacité du récipient destinataire."
            );
            return;
        }

        HistoryEngine.begin(
            "Transfert à la pipette"
        );

        sourceContent.amount =
            CF.round(
                CF.num(
                    sourceContent.amount
                ) -
                transferAmount,
                2
            );

        if (
            sourceContent.amount <= 0
        ) {
            selected.contents =
                selected.contents.filter(
                    item =>
                        item.id !==
                        sourceContent.id
                );
        }

        if (
            substance.state !== "solid"
        ) {
            selected.volume =
                Math.max(
                    0,
                    CF.round(
                        selected.volume -
                        transferAmount,
                        2
                    )
                );

            destination.volume =
                CF.round(
                    destination.volume +
                    transferAmount,
                    2
                );
        }

        const existing =
            destination.contents.find(
                item =>
                    item.substanceId ===
                    sourceContent.substanceId
            );

        if (existing) {
            existing.amount =
                CF.round(
                    CF.num(
                        existing.amount
                    ) +
                    transferAmount,
                    2
                );
        } else {
            destination.contents.push({
                ...CF.clone(sourceContent),
                id: CF.uid("CNT"),
                amount: transferAmount
            });
        }

        ContainerEngine.updateContainerPH(
            selected
        );

        ContainerEngine.updateContainerPH(
            destination
        );

        selected.mixtureState =
            selected.contents.length
                ? "mixed"
                : "empty";

        destination.mixtureState =
            destination.contents.length > 1
                ? "mixture"
                : "pure";

        selected.status =
            selected.contents.length
                ? "Transfert effectué"
                : "Conteneur vide";

        destination.status =
            "Substance reçue par pipette";

        LabState.touch();

        JournalEngine.add(
            `Pipette : ${transferAmount} ${sourceContent.unit} de ${sourceContent.name} transféré de ${selected.name} vers ${destination.name}.`
        );

        ObjectEngine.select(
            destination.id
        );

        UIEngine.renderAll();

        NotificationEngine.success(
            `Transfert effectué vers ${destination.name}.`
        );
    }

    return {
        usePipette
    };
})();


/* ================================================================
   20. REACTION ENGINE
   ================================================================ */

const ReactionEngine = (() => {

    function getSelectedContainer() {
        return ContainerEngine.selectedContainer();
    }

    function findReaction(container) {

        if (
            !container ||
            !container.contents.length
        ) {
            return null;
        }

        const reactions =
            ReactionDatabase.findCompatible(
                container.contents
            );

        for (const reaction of reactions) {

            const valid =
                reaction.reactants.every(
                    required => {

                        const content =
                            container.contents.find(
                                item =>
                                    item.substanceId ===
                                    required.substance
                            );

                        return (
                            content &&
                            CF.num(
                                content.amount,
                                0
                            ) >=
                            required.minimum
                        );
                    }
                );

            if (valid) {
                return reaction;
            }
        }

        return null;
    }

    function react() {

        const container =
            getSelectedContainer();

        if (!container) {
            NotificationEngine.warning(
                "Sélectionnez un récipient pour effectuer une réaction."
            );
            return;
        }

        if (
            container.contents.length <
            2
        ) {
            NotificationEngine.warning(
                "Une réaction définie nécessite au moins deux substances dans le récipient."
            );
            return;
        }

        const reaction =
            findReaction(container);

        if (!reaction) {

            container.reactionState =
                "unsupported";

            container.status =
                "Aucune réaction définie pour cette combinaison";

            LabState.get().reactionResult = {
                status: "not-supported",
                name: "Combinaison non modélisée",
                reactants:
                    ContainerEngine.getContentsSummary(
                        container
                    ),
                products: [],
                observations: [
                    "Aucun modèle chimique validé dans la base CHIMIQUE FOBAS ne correspond exactement à cette combinaison."
                ],
                finalState:
                    "Aucune réaction simulée."
            };

            JournalEngine.add(
                `Aucune réaction définie pour le mélange de ${container.name}.`
            );

            UIEngine.renderAll();

            NotificationEngine.warning(
                "Aucune réaction définie pour cette combinaison. Le moteur ne fabrique pas de résultat arbitraire."
            );

            return;
        }

        HistoryEngine.begin(
            `Réaction : ${reaction.name}`
        );

        const calculation =
            typeof reaction.calculate ===
            "function"
                ? reaction.calculate({
                    container,
                    reactants:
                        container.contents.map(
                            CF.clone
                        )
                })
                : {
                    extent: 1
                };

        const products =
            reaction.products.map(
                product => ({
                    ...CF.clone(product),
                    id: CF.uid("PROD"),
                    amountFactor:
                        product.amountFactor ||
                        1
                })
            );

        const productNames =
            products
                .map(
                    product =>
                        `${product.name} (${product.formula})`
                );

        container.reactionState =
            "completed";

        container.reactionVisual =
            reaction.type ===
            "acid-carbonate"
                ? "effervescence"
                : "reaction";

        container.mixtureState =
            "mixed";

        container.status =
            "Réaction effectuée";

        if (
            calculation.pH !==
            undefined
        ) {
            container.ph =
                calculation.pH;
        }

        if (
            calculation.temperatureDelta
        ) {
            container.temperature =
                CF.round(
                    CF.num(
                        container.temperature,
                        20
                    ) +
                    calculation.temperatureDelta,
                    1
                );
        }

        if (
            calculation.color
        ) {
            container.mixtureColor =
                calculation.color;
        }

        container.reactionResult = {
            id: reaction.id,
            name: reaction.name,
            equation: reaction.equation,
            reactants:
                container.contents.map(
                    content => ({
                        ...CF.clone(content)
                    })
                ),
            products,
            observations:
                reaction.observations.slice(),
            finalState:
                reaction.finalState,
            calculated:
                CF.clone(calculation),
            time:
                new Date().toISOString()
        };

        LabState.get().reactionResult =
            container.reactionResult;

        /*
         * For the supported models, the reactants
         * are consumed conceptually and the result
         * is stored in the reaction result.
         *
         * We preserve a concise product representation
         * rather than pretending to perform arbitrary
         * stoichiometric chemistry.
         */

        if (
            reaction.id ===
            "acid_bicarbonate"
        ) {
            container.contents =
                [
                    {
                        id: CF.uid("RES"),
                        substanceId:
                            "reaction_result_acid_bicarbonate",
                        name:
                            "Mélange réactionnel",
                        formula:
                            "CH₃COONa + CO₂ + H₂O",
                        amount:
                            calculation.extent || 1,
                        unit: "modèle",
                        state: "mixture",
                        category: "reaction-product"
                    }
                ];

            container.volume =
                CF.round(
                    container.volume +
                    CF.num(
                        calculation.gasVolume,
                        0
                    ),
                    2
                );
        }

        if (
            reaction.id ===
            "copper_sulfate_solution"
        ) {
            container.contents =
                [
                    {
                        id: CF.uid("RES"),
                        substanceId:
                            "copper_sulfate_solution",
                        name:
                            "Solution de sulfate de cuivre",
                        formula:
                            "CuSO₄(aq)",
                        amount:
                            calculation.extent || 1,
                        unit: "modèle",
                        state: "solution",
                        category: "reaction-product"
                    }
                ];

            container.mixtureColor =
                "#268cff";
        }

        if (
            reaction.id ===
            "indicator_acid" ||
            reaction.id ===
            "indicator_strong_acid"
        ) {
            container.contents =
                [
                    {
                        id: CF.uid("RES"),
                        substanceId:
                            "acidic_indicator_solution",
                        name:
                            "Solution indicatrice acide",
                        formula:
                            "Ind.(aq)",
                        amount: 1,
                        unit: "modèle",
                        state: "solution",
                        category: "reaction-product"
                    }
                ];

            container.mixtureColor =
                calculation.color ||
                "#ef5b73";
        }

        if (
            reaction.id ===
            "indicator_base"
        ) {
            container.contents =
                [
                    {
                        id: CF.uid("RES"),
                        substanceId:
                            "basic_indicator_solution",
                        name:
                            "Solution indicatrice basique",
                        formula:
                            "Ind.(aq)",
                        amount: 1,
                        unit: "modèle",
                        state: "solution",
                        category: "reaction-product"
                    }
                ];

            container.mixtureColor =
                calculation.color ||
                "#4e9eff";
        }

        if (
            reaction.id ===
            "hcl_naoh_neutralization"
        ) {
            container.contents =
                [
                    {
                        id: CF.uid("RES"),
                        substanceId:
                            "neutralization_solution",
                        name:
                            "Solution de neutralisation",
                        formula:
                            "NaCl + H₂O",
                        amount:
                            calculation.extent || 1,
                        unit: "modèle",
                        state: "solution",
                        category: "reaction-product"
                    }
                ];
        }

        LabState.touch();

        JournalEngine.add(
            `Réaction effectuée dans ${container.name} : ${reaction.name}.`
        );

        UIEngine.renderAll();

        NotificationEngine.success(
            `Réaction effectuée : ${reaction.name}.`,
            4500
        );

        return container.reactionResult;
    }

    function openReactionDatabase() {

        ModalEngine.open(
            "reaction-modal"
        );

        renderReactionList();
    }

    function renderReactionList() {

        const container =
            CF.byId(
                "reaction-modal-list"
            );

        if (!container) return;

        const search =
            CF.byId(
                "reaction-search"
            )?.value || "";

        const reactions =
            ReactionDatabase.search(
                search
            );

        container.innerHTML = "";

        if (!reactions.length) {

            container.innerHTML = `
                <div class="reaction-modal-item">
                    <h4>Aucune réaction trouvée</h4>
                    <div class="description">
                        Aucun modèle correspondant à votre recherche.
                    </div>
                </div>
            `;

            return;
        }

        reactions.forEach(
            reaction => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "reaction-modal-item";

                item.innerHTML = `
                    <h4>
                        ${CF.escapeHTML(
                            reaction.name
                        )}
                    </h4>

                    <div class="equation">
                        ${CF.escapeHTML(
                            reaction.equation
                        )}
                    </div>

                    <div class="description">
                        Niveau :
                        ${CF.escapeHTML(
                            reaction.level
                        )}
                        <br>
                        ${CF.escapeHTML(
                            reaction.observations[0] ||
                            ""
                        )}
                    </div>
                `;

                item.addEventListener(
                    "click",
                    () => {

                        const container =
                            ContainerEngine
                                .selectedContainer();

                        if (!container) {

                            NotificationEngine.warning(
                                "Sélectionnez un récipient avant de tester une réaction."
                            );

                            return;
                        }

                        const compatible =
                            reaction.reactants.every(
                                required =>
                                    container.contents.some(
                                        content =>
                                            content.substanceId ===
                                            required.substance
                                    )
                            );

                        if (!compatible) {

                            NotificationEngine.warning(
                                "Les substances nécessaires ne sont pas toutes présentes dans le récipient."
                            );

                            return;
                        }

                        ModalEngine.close(
                            "reaction-modal"
                        );

                        react();
                    }
                );

                container.appendChild(
                    item
                );
            }
        );
    }

    return {
        react,
        findReaction,
        openReactionDatabase,
        renderReactionList
    };
})();


/* ================================================================
   21. ANALYSIS ENGINE
   ================================================================ */

const AnalysisEngine = (() => {

    function analyze() {

        const object =
            LabState.selected();

        if (!object) {
            NotificationEngine.warning(
                "Sélectionnez un objet à analyser."
            );
            return;
        }

        if (object.isContainer) {
            analyzeContainer(
                object
            );
            return;
        }

        analyzeObject(
            object.id
        );
    }

    function analyzeContainer(
        container
    ) {

        ContainerEngine.updateContainerPH(
            container
        );

        const contentCount =
            container.contents.length;

        let classification =
            "Conteneur vide";

        if (contentCount === 1) {
            classification =
                "Substance / solution unique";
        }

        if (contentCount > 1) {
            classification =
                "Mélange";
        }

        if (
            container.reactionState ===
            "completed"
        ) {
            classification =
                "Mélange réactionnel";
        }

        const analysis = {
            classification,
            volume:
                container.volume,
            capacity:
                container.capacity,
            temperature:
                container.temperature,
            pH:
                container.ph,
            contents:
                container.contents.map(
                    item => ({
                        name: item.name,
                        formula: item.formula,
                        amount: item.amount,
                        unit: item.unit
                    })
                ),
            mixtureState:
                container.mixtureState,
            reactionState:
                container.reactionState
        };

        container.lastAnalysis =
            analysis;

        container.status =
            "Analyse effectuée";

        JournalEngine.add(
            `Analyse de ${container.name} : ${classification}.`
        );

        UIEngine.renderAll();

        NotificationEngine.success(
            `Analyse : ${classification}. pH ${container.ph ?? "—"}.`
        );
    }

    function analyzeObject(
        objectId
    ) {

        const object =
            LabState.objectById(
                objectId
            );

        if (!object) return;

        const substance =
            ChemicalDatabase.get(
                object.libraryId
            );

        const analysis = {
            name: object.name,
            formula:
                object.formula ||
                substance?.formula ||
                "—",
            category:
                object.objectCategory,
            state:
                substance?.state ||
                "—",
            pH:
                object.ph ??
                substance?.ph ??
                "—",
            safety:
                substance?.safety ||
                "Information pédagogique disponible."
        };

        object.lastAnalysis =
            analysis;

        JournalEngine.add(
            `Analyse de ${object.name}.`
        );

        UIEngine.renderAll();

        NotificationEngine.success(
            `${object.name} : ${analysis.formula}.`
        );
    }

    return {
        analyze,
        analyzeContainer,
        analyzeObject
    };
})();


/* ================================================================
   22. CLEANING ENGINE
   ================================================================ */

const CleaningEngine = (() => {

    function clean() {

        const selected =
            LabState.selected();

        if (!selected) {
            NotificationEngine.warning(
                "Sélectionnez un objet à nettoyer."
            );
            return;
        }

        if (
            selected.isContainer
        ) {

            HistoryEngine.begin(
                `Nettoyage de ${selected.name}`
            );

            ContainerEngine.clearContainer(
                selected.id
            );

            return;
        }

        HistoryEngine.begin(
            `Réinitialisation de ${selected.name}`
        );

        selected.status =
            "Objet nettoyé";

        selected.temperature = 20;

        selected.reactionState =
            "not-applicable";

        JournalEngine.add(
            `${selected.name} nettoyé.`
        );

        UIEngine.renderAll();

        NotificationEngine.success(
            `${selected.name} nettoyé.`
        );
    }

    return {
        clean
    };
})();


/* ================================================================
   23. SAVE / LOAD ENGINE
   ================================================================ */

const SaveLoadEngine = (() => {

    function serialize() {

        const state =
            CF.clone(
                LabState.get()
            );

        state.metadata =
            state.metadata || {};

        state.metadata.savedAt =
            new Date().toISOString();

        return state;
    }

    function saveToLocalStorage() {

        try {

            const data =
                serialize();

            localStorage.setItem(
                CF.STORAGE_KEY,
                JSON.stringify(data)
            );

            NotificationEngine.success(
                "Expérience enregistrée localement."
            );

            JournalEngine.add(
                "Expérience sauvegardée localement."
            );

            return true;

        } catch (error) {

            NotificationEngine.error(
                "Impossible de sauvegarder l'expérience sur cet appareil."
            );

            console.error(
                "[CHIMIQUE FOBAS] Save error:",
                error
            );

            return false;
        }
    }

    function openSaveModal() {

        const name =
            CF.byId(
                "save-experiment-name"
            );

        const student =
            CF.byId(
                "save-student-name"
            );

        if (name) {
            name.value =
                LabState.get().experiment.name ||
                "";
        }

        if (student) {
            student.value =
                LabState.get().experiment.studentName ||
                "";
        }

        ModalEngine.open(
            "save-modal"
        );
    }

    function confirmSave() {

        const name =
            CF.byId(
                "save-experiment-name"
            );

        const student =
            CF.byId(
                "save-student-name"
            );

        const experiment =
            LabState.get().experiment;

        experiment.name =
            name?.value.trim() ||
            "Expérience sans titre";

        experiment.studentName =
            student?.value.trim() ||
            "";

        experiment.updatedAt =
            new Date().toISOString();

        const success =
            saveToLocalStorage();

        if (success) {
            ModalEngine.close(
                "save-modal"
            );

            UIEngine.renderHeader();
        }
    }

    function loadFromLocalStorage() {

        try {

            const raw =
                localStorage.getItem(
                    CF.STORAGE_KEY
                );

            if (!raw) {
                NotificationEngine.info(
                    "Aucune expérience sauvegardée sur cet appareil."
                );
                return false;
            }

            const data =
                JSON.parse(raw);

            HistoryEngine.begin(
                "Chargement de l'expérience"
            );

            LabState.replace(
                data
            );

            UIEngine.renderAll();

            NotificationEngine.success(
                "Expérience chargée avec succès."
            );

            JournalEngine.add(
                "Expérience chargée depuis le stockage local."
            );

            return true;

        } catch (error) {

            console.error(
                "[CHIMIQUE FOBAS] Load error:",
                error
            );

            NotificationEngine.error(
                "Le fichier de sauvegarde local est invalide."
            );

            return false;
        }
    }

    function exportFile() {

        const data =
            serialize();

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
            (
                data.experiment.name ||
                "experience-chimique-fobas"
            )
                .replace(
                    /[^a-z0-9-_]+/gi,
                    "-"
                )
                .toLowerCase() +
            ".json";

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(
            url
        );

        NotificationEngine.success(
            "Fichier d'expérience exporté."
        );
    }

    function openFileInput() {

        const input =
            CF.byId(
                "experience-file-input"
            );

        if (input) {
            input.click();
        }
    }

    function loadFile(file) {

        if (!file) return;

        const reader =
            new FileReader();

        reader.onload =
            event => {

                try {

                    const data =
                        JSON.parse(
                            event.target.result
                        );

                    if (
                        !data ||
                        typeof data !==
                        "object" ||
                        !Array.isArray(
                            data.objects
                        )
                    ) {
                        throw new Error(
                            "Format invalide"
                        );
                    }

                    HistoryEngine.begin(
                        "Importation d'expérience"
                    );

                    LabState.replace(
                        data
                    );

                    UIEngine.renderAll();

                    NotificationEngine.success(
                        "Expérience importée avec succès."
                    );

                    JournalEngine.add(
                        "Expérience importée depuis un fichier."
                    );

                } catch (error) {

                    console.error(
                        error
                    );

                    NotificationEngine.error(
                        "Impossible de lire ce fichier d'expérience."
                    );
                }
            };

        reader.readAsText(
            file
        );
    }

    return {
        serialize,
        saveToLocalStorage,
        openSaveModal,
        confirmSave,
        loadFromLocalStorage,
        exportFile,
        openFileInput,
        loadFile
    };
})();


/* ================================================================
   24. MODAL ENGINE
   ================================================================ */

const ModalEngine = (() => {

    function get(id) {
        return CF.byId(id);
    }

    function open(id) {

        const modal =
            get(id);

        if (!modal) return;

        modal.classList.add(
            "open"
        );

        modal.classList.add(
            "active"
        );

        modal.dataset.open =
            "true";

        document.body.style.overflow =
            "hidden";

        const focusable =
            modal.querySelector(
                "input,button,select,textarea"
            );

        if (focusable) {
            window.setTimeout(
                () => focusable.focus(),
                40
            );
        }
    }

    function close(id) {

        const modal =
            get(id);

        if (!modal) return;

        modal.classList.remove(
            "open",
            "active"
        );

        modal.dataset.open =
            "false";

        if (
            !document.querySelector(
                ".modal-overlay.open"
            )
        ) {
            document.body.style.overflow =
                "";
        }
    }

    function closeAll() {

        CF.$$(".modal-overlay")
            .forEach(
                modal => {
                    modal.classList.remove(
                        "open",
                        "active"
                    );

                    modal.dataset.open =
                        "false";
                }
            );

        document.body.style.overflow =
            "";
    }

    function init() {

        CF.$$(".modal-overlay")
            .forEach(
                overlay => {

                    overlay.addEventListener(
                        "click",
                        event => {

                            if (
                                event.target ===
                                overlay
                            ) {
                                close(
                                    overlay.id
                                );
                            }
                        }
                    );
                }
            );

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {
                    closeAll();
                }
            }
        );
    }

    return {
        get,
        open,
        close,
        closeAll,
        init
    };
})();


/* ================================================================
   25. CONTEXT MENU ENGINE
   ================================================================ */

const ContextMenuEngine = (() => {

    let selectedObjectId = null;

    function open(
        x,
        y,
        objectId
    ) {

        const menu =
            CF.byId(
                "object-context-menu"
            );

        if (!menu) return;

        selectedObjectId =
            objectId;

        menu.classList.add(
            "open"
        );

        menu.classList.add(
            "active"
        );

        const maxX =
            window.innerWidth -
            menu.offsetWidth -
            8;

        const maxY =
            window.innerHeight -
            menu.offsetHeight -
            8;

        menu.style.left =
            `${CF.clamp(
                x,
                8,
                Math.max(8, maxX)
            )}px`;

        menu.style.top =
            `${CF.clamp(
                y,
                8,
                Math.max(8, maxY)
            )}px`;
    }

    function close() {

        const menu =
            CF.byId(
                "object-context-menu"
            );

        if (!menu) return;

        menu.classList.remove(
            "open",
            "active"
        );

        selectedObjectId =
            null;
    }

    function execute(action) {

        const objectId =
            selectedObjectId;

        const object =
            LabState.objectById(
                objectId
            );

        if (!object) {
            close();
            return;
        }

        ObjectEngine.select(
            objectId
        );

        switch (action) {

            case "select":
                break;

            case "add-to-container":
                AddEngine.openForSubstance();
                break;

            case "measure":
                MeasurementEngine.measure();
                break;

            case "duplicate":
                HistoryEngine.begin(
                    "Duplication d'objet"
                );
                ObjectEngine.duplicate(
                    objectId
                );
                break;

            case "delete":
                HistoryEngine.begin(
                    "Suppression d'objet"
                );
                ObjectEngine.remove(
                    objectId
                );
                break;

            default:
                break;
        }

        close();
    }

    function init() {

        document.addEventListener(
            "click",
            event => {

                const action =
                    event.target.closest(
                        "[data-context-action]"
                    );

                if (action) {

                    execute(
                        action.dataset
                            .contextAction
                    );

                    return;
                }

                const menu =
                    CF.byId(
                        "object-context-menu"
                    );

                if (
                    menu &&
                    !menu.contains(
                        event.target
                    )
                ) {
                    close();
                }
            }
        );
    }

    return {
        open,
        close,
        execute,
        init
    };
})();


/* ================================================================
   26. ADD ENGINE
   ================================================================ */

const AddEngine = (() => {

    function open() {
        ModalEngine.open(
            "add-object-modal"
        );

        renderModalLibrary(
            "substances"
        );
    }

    function openForSubstance() {
        ModalEngine.open(
            "add-object-modal"
        );

        renderModalLibrary(
            "substances"
        );
    }

    function renderModalLibrary(
        category = "substances"
    ) {

        const grid =
            CF.byId(
                "modal-library-grid"
            );

        if (!grid) return;

        let items = [];

        if (
            category ===
            "substances"
        ) {
            items =
                ChemicalDatabase.search(
                    ""
                );
        } else if (
            category ===
            "glassware"
        ) {
            items =
                GlasswareDatabase.all();
        } else {
            items =
                EquipmentDatabase.all();
        }

        grid.innerHTML = "";

        items.forEach(
            item => {

                const element =
                    document.createElement(
                        "div"
                    );

                element.className =
                    "modal-library-item";

                element.innerHTML = `
                    <div class="library-item-icon">
                        <span>
                            ${CF.escapeHTML(
                                item.formula ||
                                item.type ||
                                "⚗"
                            )}
                        </span>
                    </div>

                    <div class="library-item-name">
                        ${CF.escapeHTML(
                            item.name
                        )}
                    </div>

                    <div class="library-item-formula">
                        ${CF.escapeHTML(
                            item.formula ||
                            item.type ||
                            ""
                        )}
                    </div>
                `;

                element.addEventListener(
                    "click",
                    () => {

                        HistoryEngine.begin(
                            `Ajout de ${item.name}`
                        );

                        ObjectEngine
                            .createFromLibrary(
                                item,
                                category
                            );

                        ModalEngine.close(
                            "add-object-modal"
                        );

                        UIEngine.renderAll();

                        NotificationEngine.success(
                            `${item.name} ajouté au laboratoire.`
                        );
                    }
                );

                grid.appendChild(
                    element
                );
            }
        );
    }

    return {
        open,
        openForSubstance,
        renderModalLibrary
    };
})();


/* ================================================================
   27. INSPECTOR ENGINE
   ================================================================ */

const InspectorEngine = (() => {

    function render() {

        const empty =
            CF.byId(
                "inspector-empty"
            );

        const content =
            CF.byId(
                "inspector-content"
            );

        const object =
            LabState.selected();

        if (!object) {

            if (empty) {
                empty.style.display =
                    "block";
            }

            if (content) {
                content.style.display =
                    "none";
            }

            renderStatus(null);

            return;
        }

        if (empty) {
            empty.style.display =
                "none";
        }

        if (content) {
            content.style.display =
                "block";
            content.classList.add(
                "visible"
            );
            content.classList.add(
                "active"
            );
        }

        setText(
            "selected-object-type",
            object.isContainer
                ? "CONTENEUR"
                : object.objectCategory ===
                    "substance"
                    ? "SUBSTANCE"
                    : "ÉQUIPEMENT"
        );

        setText(
            "inspector-object-name",
            object.name
        );

        setText(
            "inspector-object-formula",
            object.formula || "—"
        );

        setText(
            "property-id",
            object.id
        );

        setText(
            "property-category",
            object.objectCategory
        );

        setText(
            "property-x",
            `${CF.round(
                object.x,
                1
            )}%`
        );

        setText(
            "property-y",
            `${CF.round(
                object.y,
                1
            )}%`
        );

        setText(
            "property-rotation",
            `${CF.round(
                object.rotation,
                1
            )}°`
        );

        if (object.isContainer) {

            setText(
                "property-capacity",
                object.capacity
                    ? `${object.capacity} mL`
                    : "—"
            );

            setText(
                "property-volume",
                `${CF.round(
                    object.volume,
                    2
                )} mL`
            );

            setText(
                "property-temperature",
                `${CF.round(
                    object.temperature,
                    1
                )} °C`
            );

            setText(
                "property-ph",
                object.ph === null ||
                object.ph === undefined
                    ? "—"
                    : CF.round(
                        object.ph,
                        2
                    )
            );

            setText(
                "property-mixture-state",
                translateMixtureState(
                    object.mixtureState
                )
            );

            setText(
                "property-reaction-state",
                translateReactionState(
                    object.reactionState
                )
            );

            setText(
                "property-container-status",
                object.status || "—"
            );

            renderContents(
                object
            );

        } else {

            setText(
                "property-capacity",
                "—"
            );

            setText(
                "property-volume",
                object.amount !==
                    undefined
                    ? `${object.amount} ${object.unit || ""}`
                    : "—"
            );

            setText(
                "property-temperature",
                `${CF.round(
                    object.temperature ?? 20,
                    1
                )} °C`
            );

            setText(
                "property-ph",
                object.ph ??
                "—"
            );

            setText(
                "property-mixture-state",
                "—"
            );

            setText(
                "property-reaction-state",
                "—"
            );

            setText(
                "property-container-status",
                object.status ||
                "Objet disponible"
            );

            renderContents(
                null
            );
        }

        renderStatus(
            object
        );
    }

    function renderContents(
        container
    ) {

        const target =
            CF.byId(
                "container-contents"
            );

        if (!target) return;

        if (!container) {

            target.innerHTML = "";

            return;
        }

        if (!container.contents.length) {

            target.innerHTML = `
                <div class="container-content-item">
                    <div class="container-content-name">
                        Aucun contenu
                    </div>
                </div>
            `;

            return;
        }

        target.innerHTML =
            container.contents
                .map(
                    content => `
                        <div
                            class="container-content-item"
                            data-content-id="${CF.escapeHTML(
                                content.id
                            )}"
                        >
                            <div
                                class="container-content-name"
                                title="${CF.escapeHTML(
                                    content.name
                                )}"
                            >
                                ${CF.escapeHTML(
                                    content.name
                                )}
                            </div>

                            <div
                                class="container-content-amount"
                            >
                                ${CF.escapeHTML(
                                    String(
                                        content.amount
                                    )
                                )}
                                ${CF.escapeHTML(
                                    content.unit ||
                                    ""
                                )}
                            </div>

                            <button
                                type="button"
                                class="content-remove-button"
                                data-remove-content="${CF.escapeHTML(
                                    content.id
                                )}"
                                aria-label="Retirer"
                            >
                                ×
                            </button>
                        </div>
                    `
                )
                .join("");
    }

    function renderStatus(
        object
    ) {

        const badge =
            CF.byId(
                "container-state-badge"
            );

        if (!badge) return;

        if (
            !object ||
            !object.isContainer
        ) {

            badge.textContent =
                "Aucun conteneur sélectionné";

            return;
        }

        badge.textContent =
            translateReactionState(
                object.reactionState
            ) ||
            translateMixtureState(
                object.mixtureState
            );
    }

    function setText(
        id,
        value
    ) {

        const element =
            CF.byId(id);

        if (element) {
            element.textContent =
                String(
                    value ??
                    "—"
                );
        }
    }

    function translateMixtureState(
        state
    ) {

        const map = {
            empty: "Vide",
            pure: "Substance unique",
            mixture: "Mélange",
            mixed: "Mélangé"
        };

        return (
            map[state] ||
            state ||
            "—"
        );
    }

    function translateReactionState(
        state
    ) {

        const map = {
            none: "Aucune réaction",
            ready: "Prêt pour réaction",
            completed: "Réaction effectuée",
            unsupported:
                "Non modélisée",
            "not-applicable":
                "Non applicable"
        };

        return (
            map[state] ||
            state ||
            "—"
        );
    }

    function handleInspectorAction(
        action
    ) {

        const object =
            LabState.selected();

        if (!object) {
            NotificationEngine.warning(
                "Aucun objet sélectionné."
            );
            return;
        }

        switch (action) {

            case "add":
                AddEngine.open();
                break;

            case "remove":

                if (
                    object.isContainer
                ) {

                    const first =
                        object.contents[0];

                    if (first) {

                        HistoryEngine.begin(
                            "Retrait de substance"
                        );

                        ContainerEngine
                            .removeSubstance(
                                object.id,
                                first.id
                            );
                    } else {
                        NotificationEngine.info(
                            "Le conteneur est vide."
                        );
                    }

                } else {

                    NotificationEngine.info(
                        "Pour supprimer cet objet du laboratoire, utilisez Supprimer."
                    );
                }

                break;

            case "move":
                LabState.get().activeTool =
                    "move";

                UIEngine.renderToolbar();

                NotificationEngine.info(
                    "Mode déplacement activé : faites glisser l'objet."
                );

                break;

            case "duplicate":
                HistoryEngine.begin(
                    "Duplication"
                );
                ObjectEngine.duplicate(
                    object.id
                );
                break;

            case "delete":
                HistoryEngine.begin(
                    "Suppression"
                );
                ObjectEngine.remove(
                    object.id
                );
                break;

            default:
                break;
        }
    }

    return {
        render,
        renderContents,
        renderStatus,
        handleInspectorAction
    };
})();


/* ================================================================
   28. UI ENGINE
   ================================================================ */

const UIEngine = (() => {

    function renderAll() {
        renderHeader();
        renderToolbar();
        renderObjects();
        renderStageStatus();
        renderContainerStatus();
        renderReactionResult();
        renderCounts();
        InspectorEngine.render();
        LibraryEngine.render();
        JournalEngine.render();
        HistoryEngine.updateButtons();
        updateAccessibility();
    }

    function renderHeader() {

        const experiment =
            LabState.get().experiment;

        const name =
            CF.byId(
                "current-experiment-name"
            );

        if (name) {
            name.textContent =
                experiment.name ||
                "Nouvelle expérience";
        }

        const level =
            CF.byId(
                "experiment-level"
            );

        if (level) {
            level.textContent =
                LabState.get().level;
        }
    }

    function renderToolbar() {

        const activeTool =
            LabState.get().activeTool;

        CF.$$(
            "[data-tool]"
        ).forEach(
            button => {

                const active =
                    button.dataset.tool ===
                    activeTool;

                button.classList.toggle(
                    "active",
                    active
                );

                button.dataset.toolActive =
                    active
                        ? "true"
                        : "false";
            }
        );

        const stage =
            CF.byId(
                "laboratory-stage"
            );

        if (stage) {

            stage.classList.toggle(
                "tool-add-active",
                activeTool ===
                    "add"
            );

            stage.classList.toggle(
                "tool-move-active",
                activeTool ===
                    "move"
            );
        }
    }

    function renderObjects() {
        ObjectEngine.renderObjects();
    }

    function renderStageStatus() {

        const state =
            LabState.get();

        const mode =
            CF.byId(
                "stage-mode"
            );

        if (mode) {
            const toolNames = {
                select: "Sélection",
                add: "Ajout",
                move: "Déplacement"
            };

            mode.textContent =
                "Mode : " +
                (
                    toolNames[
                        state.activeTool
                    ] ||
                    state.activeTool
                );
        }

        const engineStatus =
            CF.byId(
                "engine-status-text"
            );

        if (engineStatus) {

            const selected =
                LabState.selected();

            engineStatus.textContent =
                selected
                    ? `Actif — ${selected.name}`
                    : "Moteur prêt";
        }
    }

    function renderContainerStatus() {

        const container =
            ContainerEngine
                .selectedContainer();

        const name =
            CF.byId(
                "status-container-name"
            );

        const description =
            CF.byId(
                "status-container-description"
            );

        const mixture =
            CF.byId(
                "live-mixture"
            );

        const reaction =
            CF.byId(
                "live-reaction"
            );

        const temperature =
            CF.byId(
                "live-temperature"
            );

        const volume =
            CF.byId(
                "live-volume"
            );

        if (!container) {

            if (name) {
                name.textContent =
                    "Aucun récipient";
            }

            if (description) {
                description.textContent =
                    "Sélectionnez un récipient.";
            }

            setLiveValue(
                mixture,
                "—"
            );

            setLiveValue(
                reaction,
                "—"
            );

            setLiveValue(
                temperature,
                "—"
            );

            setLiveValue(
                volume,
                "—"
            );

            return;
        }

        if (name) {
            name.textContent =
                container.name;
        }

        if (description) {
            description.textContent =
                container.status ||
                "Conteneur actif.";
        }

        setLiveValue(
            mixture,
            InspectorEngine
                .renderStatus
                ? translateMixture(
                    container.mixtureState
                )
                : container.mixtureState
        );

        setLiveValue(
            reaction,
            translateReaction(
                container.reactionState
            )
        );

        setLiveValue(
            temperature,
            `${CF.round(
                container.temperature,
                1
            )} °C`
        );

        setLiveValue(
            volume,
            `${CF.round(
                container.volume,
                2
            )} mL`
        );

        const icon =
            CF.byId(
                "status-container-icon"
            );

        if (icon) {
            icon.innerHTML =
                container.objectType ===
                "flask"
                    ? "⚗"
                    : container.objectType ===
                        "test-tube"
                        ? "│"
                        : "▱";
        }
    }

    function setLiveValue(
        row,
        value
    ) {

        if (!row) return;

        const target =
            row.querySelector(
                ".live-status-value"
            );

        if (target) {
            target.textContent =
                value;
        } else {
            row.textContent =
                value;
        }
    }

    function translateMixture(
        value
    ) {

        const map = {
            empty: "Vide",
            pure: "Substance unique",
            mixture: "Mélange",
            mixed: "Mélangé"
        };

        return (
            map[value] ||
            value ||
            "—"
        );
    }

    function translateReaction(
        value
    ) {

        const map = {
            none: "Aucune",
            ready: "Prêt",
            completed:
                "Réaction effectuée",
            unsupported:
                "Non modélisée",
            "not-applicable":
                "N/A"
        };

        return (
            map[value] ||
            value ||
            "—"
        );
    }

    function renderReactionResult() {

        const empty =
            CF.byId(
                "reaction-result-empty"
            );

        const content =
            CF.byId(
                "reaction-result-content"
            );

        const result =
            LabState.get().reactionResult;

        if (!result) {

            if (empty) {
                empty.style.display =
                    "block";
            }

            if (content) {
                content.style.display =
                    "none";
            }

            return;
        }

        if (empty) {
            empty.style.display =
                "none";
        }

        if (content) {
            content.style.display =
                "block";
            content.classList.add(
                "visible"
            );
            content.classList.add(
                "active"
            );
        }

        setText(
            "reaction-result-status",
            result.status ===
                "not-supported"
                ? "NON MODÉLISÉ"
                : "RÉACTION EFFECTUÉE"
        );

        setText(
            "reaction-result-name",
            result.name ||
            "Résultat"
        );

        const reactants =
            CF.byId(
                "reaction-result-reactants"
            );

        if (reactants) {

            const list =
                result.reactants ||
                [];

            reactants.innerHTML =
                list.length
                    ? list
                        .map(
                            item =>
                                `<div>
                                    ${CF.escapeHTML(
                                        item.name
                                    )}
                                    — ${CF.escapeHTML(
                                        String(
                                            item.amount
                                        )
                                    )}
                                    ${CF.escapeHTML(
                                        item.unit ||
                                        ""
                                    )}
                                </div>`
                        )
                        .join("")
                    : "—";
        }

        const products =
            CF.byId(
                "reaction-result-products"
            );

        if (products) {

            const list =
                result.products ||
                [];

            products.innerHTML =
                list.length
                    ? list
                        .map(
                            item =>
                                `<div>
                                    ${CF.escapeHTML(
                                        item.name
                                    )}
                                    (${CF.escapeHTML(
                                        item.formula
                                    )})
                                </div>`
                        )
                        .join("")
                    : "Aucun produit simulé.";
        }

        const observations =
            CF.byId(
                "reaction-result-observations"
            );

        if (observations) {

            observations.innerHTML =
                (
                    result.observations ||
                    []
                )
                    .map(
                        observation =>
                            `<div>• ${CF.escapeHTML(
                                observation
                            )}</div>`
                    )
                    .join("");
        }

        setText(
            "reaction-result-final-state",
            result.finalState ||
            "—"
        );
    }

    function renderCounts() {

        const state =
            LabState.get();

        const objects =
            state.objects.length;

        const containers =
            state.objects.filter(
                x => x.isContainer
            ).length;

        const substances =
            state.objects.filter(
                x =>
                    x.objectCategory ===
                    "substance"
            ).length;

        const actions =
            state.counters.actions;

        setCount(
            "object-count",
            objects
        );

        setCount(
            "container-count",
            containers
        );

        setCount(
            "substance-count",
            substances
        );

        setCount(
            "action-count",
            actions
        );

        const global =
            CF.byId(
                "laboratory-global-status"
            );

        if (global) {

            const selected =
                LabState.selected();

            global.textContent =
                selected
                    ? selected.status ||
                        "Objet sélectionné"
                    : objects
                        ? `${objects} objet(s) dans le laboratoire`
                        : "Laboratoire prêt";
        }

        const engine =
            CF.byId(
                "chemical-engine-state"
            );

        if (engine) {

            const span =
                engine.querySelector(
                    "span"
                );

            if (span) {
                span.textContent =
                    `Chemical Simulation Engine ${CF.VERSION} — actif`;
            }
        }
    }

    function setCount(
        id,
        value
    ) {

        const element =
            CF.byId(id);

        if (!element) return;

        const strong =
            element.querySelector(
                "strong"
            );

        if (strong) {
            strong.textContent =
                String(value);
        } else {
            element.textContent =
                String(value);
        }
    }

    function updateAccessibility() {

        const region =
            CF.byId(
                "accessibility-live-region"
            );

        if (!region) return;

        const selected =
            LabState.selected();

        region.textContent =
            selected
                ? `${selected.name} sélectionné. ${selected.status || ""}`
                : "Aucun objet sélectionné.";
    }

    return {
        renderAll,
        renderHeader,
        renderToolbar,
        renderObjects,
        renderStageStatus,
        renderContainerStatus,
        renderReactionResult,
        renderCounts,
        updateAccessibility
    };
})();


/* ================================================================
   29. STAGE VIEW ENGINE
   ================================================================ */

const StageViewEngine = (() => {

    function apply() {

        const objects =
            CF.byId(
                "laboratory-objects"
            );

        if (!objects) return;

        const stage =
            LabState.get().stage;

        objects.style.transform =
            `
                translate(
                    ${stage.offsetX}px,
                    ${stage.offsetY}px
                )
                scale(${stage.zoom})
            `;
    }

    function zoomIn() {

        const stage =
            LabState.get().stage;

        stage.zoom =
            CF.clamp(
                stage.zoom + 0.1,
                0.5,
                2.5
            );

        apply();
    }

    function zoomOut() {

        const stage =
            LabState.get().stage;

        stage.zoom =
            CF.clamp(
                stage.zoom - 0.1,
                0.5,
                2.5
            );

        apply();
    }

    function center() {

        const stage =
            LabState.get().stage;

        stage.offsetX = 0;
        stage.offsetY = 0;

        apply();

        NotificationEngine.info(
            "Vue recentrée."
        );
    }

    function resetView() {

        const stage =
            LabState.get().stage;

        stage.zoom = 1;
        stage.offsetX = 0;
        stage.offsetY = 0;

        apply();

        NotificationEngine.success(
            "Vue du laboratoire réinitialisée."
        );
    }

    function handle(
        action
    ) {

        switch (action) {

            case "zoom-in":
                zoomIn();
                break;

            case "zoom-out":
                zoomOut();
                break;

            case "center":
                center();
                break;

            case "reset-view":
                resetView();
                break;

            default:
                break;
        }
    }

    return {
        apply,
        zoomIn,
        zoomOut,
        center,
        resetView,
        handle
    };
})();


/* ================================================================
   30. SAFETY ENGINE
   ================================================================ */

const SafetyEngine = (() => {

    function open() {

        ModalEngine.open(
            "safety-modal"
        );
    }

    return {
        open
    };
})();


/* ================================================================
   31. NEW EXPERIMENT ENGINE
   ================================================================ */

const ExperimentEngine = (() => {

    function newExperiment() {

        const confirmed =
            window.confirm(
                "Créer une nouvelle expérience ?\n\nLes modifications non sauvegardées seront remplacées."
            );

        if (!confirmed) return;

        HistoryEngine.clear();

        LabState.reset();

        JournalEngine.add(
            "Nouvelle expérience créée."
        );

        UIEngine.renderAll();

        NotificationEngine.success(
            "Nouvelle expérience prête."
        );
    }

    function reset() {

        ModalEngine.open(
            "reset-confirm-modal"
        );
    }

    function confirmReset() {

        HistoryEngine.clear();

        LabState.reset();

        JournalEngine.add(
            "Laboratoire réinitialisé."
        );

        ModalEngine.close(
            "reset-confirm-modal"
        );

        UIEngine.renderAll();

        NotificationEngine.success(
            "Le laboratoire a été complètement réinitialisé."
        );
    }

    return {
        newExperiment,
        reset,
        confirmReset
    };
})();


/* ================================================================
   32. MAIN ACTION ROUTER
   ================================================================ */

const ActionRouter = (() => {

    function execute(
        action
    ) {

        switch (action) {

            /* -----------------------------------------------
               EXPERIMENT
               ----------------------------------------------- */

            case "new-experiment":
                ExperimentEngine
                    .newExperiment();
                break;

            case "save":
                SaveLoadEngine
                    .openSaveModal();
                break;

            case "load":
                handleLoad();
                break;

            case "reset":
                ExperimentEngine
                    .reset();
                break;

            /* -----------------------------------------------
               LAB TOOLS
               ----------------------------------------------- */

            case "activate-add":

                LabState.get().activeTool =
                    "add";

                UIEngine.renderToolbar();

                AddEngine.open();

                break;

            case "measure":

                HistoryEngine.begin(
                    "Mesure"
                );

                MeasurementEngine
                    .measure();

                break;

            case "mix":

                MixingEngine.mix();

                break;

            case "reaction":

                ReactionEngine.react();

                break;

            case "analyze":

                HistoryEngine.begin(
                    "Analyse"
                );

                AnalysisEngine.analyze();

                break;

            case "temperature":

                TemperatureEngine
                    .promptTemperature();

                break;

            case "pipette":

                PipetteEngine
                    .usePipette();

                break;

            case "clean":

                HistoryEngine.begin(
                    "Nettoyage"
                );

                CleaningEngine.clean();

                break;

            case "delete-selected":

                deleteSelected();

                break;

            /* -----------------------------------------------
               OTHER
               ----------------------------------------------- */

            case "open-safety":

                SafetyEngine.open();

                break;

            case "clear-journal":

                JournalEngine.clear();

                break;

            case "undo":

                HistoryEngine.undo();

                break;

            case "redo":

                HistoryEngine.redo();

                break;

            case "confirm-save":

                SaveLoadEngine
                    .confirmSave();

                break;

            case "confirm-reset":

                ExperimentEngine
                    .confirmReset();

                break;

            case "reload-application":

                window.location.reload();

                break;

            default:

                console.warn(
                    "[CHIMIQUE FOBAS] Action inconnue :",
                    action
                );

                break;
        }
    }

    function deleteSelected() {

        const object =
            LabState.selected();

        if (!object) {

            NotificationEngine.warning(
                "Sélectionnez un objet à supprimer."
            );

            return;
        }

        const confirmed =
            window.confirm(
                `Supprimer "${object.name}" du laboratoire ?`
            );

        if (!confirmed) return;

        HistoryEngine.begin(
            `Suppression de ${object.name}`
        );

        ObjectEngine.remove(
            object.id
        );

        NotificationEngine.success(
            `${object.name} supprimé.`
        );
    }

    function handleLoad() {

        const loaded =
            SaveLoadEngine
                .loadFromLocalStorage();

        if (!loaded) {

            const input =
                CF.byId(
                    "experience-file-input"
                );

            if (input) {
                input.value = "";
                input.click();
            }
        }
    }

    return {
        execute
    };
})();


/* ================================================================
   33. EVENT BINDING
   ================================================================ */

const EventEngine = (() => {

    function init() {

        /* --------------------------------------------------------
           Generic data-action
           -------------------------------------------------------- */

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );

                if (!button) return;

                if (
                    button.dataset.action ===
                    "cancel"
                ) {
                    return;
                }

                ActionRouter.execute(
                    button.dataset.action
                );
            }
        );

        /* --------------------------------------------------------
           Library category
           -------------------------------------------------------- */

        CF.$$(
            "[data-library-category]"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        LibraryEngine
                            .activateCategory(
                                button.dataset
                                    .libraryCategory
                            );
                    }
                );
            }
        );

        /* --------------------------------------------------------
           Chemical filters
           -------------------------------------------------------- */

        CF.$$(
            "[data-filter]"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        LibraryEngine
                            .activateFilter(
                                button.dataset
                                    .filter
                            );
                    }
                );
            }
        );

        /* --------------------------------------------------------
           Library search
           -------------------------------------------------------- */

        const search =
            CF.byId(
                "library-search"
            );

        if (search) {

            search.addEventListener(
                "input",
                () => {
                    LibraryEngine.render();
                }
            );
        }

        const clearSearch =
            CF.byId(
                "clear-library-search"
            );

        if (clearSearch) {

            clearSearch.addEventListener(
                "click",
                () => {
                    LibraryEngine
                        .clearSearch();
                }
            );
        }

        /* --------------------------------------------------------
           Reaction search
           -------------------------------------------------------- */

        const reactionSearch =
            CF.byId(
                "reaction-search"
            );

        if (reactionSearch) {

            reactionSearch.addEventListener(
                "input",
                () => {
                    ReactionEngine
                        .renderReactionList();
                }
            );
        }

        /* --------------------------------------------------------
           Modal categories
           -------------------------------------------------------- */

        CF.$$(
            "[data-modal-category]"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const category =
                            button.dataset
                                .modalCategory;

                        CF.$$(
                            "[data-modal-category]"
                        ).forEach(
                            item => {
                                item.classList.toggle(
                                    "active",
                                    item === button
                                );
                            }
                        );

                        AddEngine
                            .renderModalLibrary(
                                category
                            );
                    }
                );
            }
        );

        /* --------------------------------------------------------
           Modal close
           -------------------------------------------------------- */

        CF.$$(
            "[data-modal-close]"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const modal =
                            button.closest(
                                ".modal-overlay"
                            );

                        if (modal) {
                            ModalEngine.close(
                                modal.id
                            );
                        }
                    }
                );
            }
        );

        CF.$$(
            "[data-modal-cancel]"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const modal =
                            button.closest(
                                ".modal-overlay"
                            );

                        if (modal) {
                            ModalEngine.close(
                                modal.id
                            );
                        }
                    }
                );
            }
        );

        /* --------------------------------------------------------
           Tool buttons
           -------------------------------------------------------- */

        CF.$$(
            "[data-tool]"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const tool =
                            button.dataset
                                .tool;

                        if (
                            tool ===
                            "add"
                        ) {
                            LabState.get()
                                .activeTool =
                                "add";

                            UIEngine
                                .renderToolbar();

                            AddEngine.open();

                            return;
                        }

                        if (
                            tool ===
                            "select"
                        ) {
                            LabState.get()
                                .activeTool =
                                "select";

                            UIEngine
                                .renderToolbar();

                            return;
                        }

                        if (
                            tool ===
                            "move"
                        ) {

                            LabState.get()
                                .activeTool =
                                "move";

                            UIEngine
                                .renderToolbar();

                            NotificationEngine.info(
                                "Mode déplacement activé."
                            );

                            return;
                        }
                    }
                );
            }
        );

        /* --------------------------------------------------------
           Stage controls
           -------------------------------------------------------- */

        CF.$$(
            "[data-stage-control]"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        StageViewEngine
                            .handle(
                                button.dataset
                                    .stageControl
                            );
                    }
                );
            }
        );

        /* --------------------------------------------------------
           Inspector actions
           -------------------------------------------------------- */

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-inspector-action]"
                    );

                if (!button) return;

                InspectorEngine
                    .handleInspectorAction(
                        button.dataset
                            .inspectorAction
                    );
            }
        );

        /* --------------------------------------------------------
           Remove content from container
           -------------------------------------------------------- */

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-remove-content]"
                    );

                if (!button) return;

                const container =
                    ContainerEngine
                        .selectedContainer();

                if (!container) return;

                HistoryEngine.begin(
                    "Retrait de substance du conteneur"
                );

                ContainerEngine
                    .removeSubstance(
                        container.id,
                        button.dataset
                            .removeContent
                    );
            }
        );

        /* --------------------------------------------------------
           File input
           -------------------------------------------------------- */

        const fileInput =
            CF.byId(
                "experience-file-input"
            );

        if (fileInput) {

            fileInput.addEventListener(
                "change",
                event => {

                    const file =
                        event.target.files?.[0];

                    if (file) {
                        SaveLoadEngine
                            .loadFile(file);
                    }

                    event.target.value =
                        "";
                }
            );
        }

        /* --------------------------------------------------------
           Keyboard
           -------------------------------------------------------- */

        document.addEventListener(
            "keydown",
            handleKeyboard
        );
    }

    function handleKeyboard(
        event
    ) {

        const tag =
            event.target?.tagName;

        if (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT"
        ) {
            return;
        }

        const ctrl =
            event.ctrlKey ||
            event.metaKey;

        if (
            ctrl &&
            event.key.toLowerCase() ===
            "z"
        ) {

            event.preventDefault();

            if (event.shiftKey) {
                HistoryEngine.redo();
            } else {
                HistoryEngine.undo();
            }

            return;
        }

        if (
            ctrl &&
            event.key.toLowerCase() ===
            "y"
        ) {

            event.preventDefault();

            HistoryEngine.redo();

            return;
        }

        if (
            event.key ===
            "Delete"
        ) {

            event.preventDefault();

            ActionRouter.execute(
                "delete-selected"
            );

            return;
        }

        if (
            event.key ===
            "Escape"
        ) {

            LabState.get().activeTool =
                "select";

            UIEngine.renderToolbar();
        }
    }

    return {
        init
    };
})();


/* ================================================================
   34. AUTO-SAVE ENGINE
   --------------------------------------------------------------- */

const AutoSaveEngine = (() => {

    let timer = null;

    function init() {

        timer =
            window.setInterval(
                () => {

                    const state =
                        LabState.get();

                    if (
                        !state.objects.length &&
                        !state.journal.length
                    ) {
                        return;
                    }

                    try {

                        localStorage.setItem(
                            CF.STORAGE_KEY,
                            JSON.stringify(
                                SaveLoadEngine
                                    .serialize()
                            )
                        );

                    } catch (error) {

                        console.warn(
                            "[CHIMIQUE FOBAS] Auto-save unavailable.",
                            error
                        );
                    }

                },
                60000
            );
    }

    function stop() {

        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    return {
        init,
        stop
    };
})();


/* ================================================================
   35. ERROR ENGINE
   ================================================================ */

const ErrorEngine = (() => {

    let reported = false;

    function show(error) {

        if (reported) return;

        reported = true;

        console.error(
            "[CHIMIQUE FOBAS] Application error:",
            error
        );

        const panel =
            CF.byId(
                "application-error"
            );

        const message =
            CF.byId(
                "application-error-message"
            );

        if (message) {

            message.textContent =
                error?.message ||
                "Une erreur inattendue s'est produite.";
        }

        if (panel) {

            panel.classList.add(
                "visible"
            );

            panel.classList.add(
                "active"
            );
        }
    }

    function init() {

        window.addEventListener(
            "error",
            event => {

                console.error(
                    event.error ||
                    event.message
                );

                /*
                 * Do not immediately cover the complete
                 * application for every non-critical browser
                 * error. Log it instead.
                 */
            }
        );

        window.addEventListener(
            "unhandledrejection",
            event => {

                console.error(
                    "[CHIMIQUE FOBAS] Promise rejection:",
                    event.reason
                );
            }
        );
    }

    return {
        show,
        init
    };
})();


/* ================================================================
   36. CHEMICAL API BRIDGE
   ---------------------------------------------------------------
   Optional integration point for the FOBAS backend.

   The simulation remains functional locally.
   No external API call is required for core simulation.
   ================================================================ */

const FOBASApiBridge = (() => {

    const API_BASE =
        "https://api.fondationbackupspirituel.com";

    async function request(
        path,
        options = {}
    ) {

        const url =
            API_BASE +
            (
                path.startsWith("/")
                    ? path
                    : "/" + path
            );

        const config = {
            method:
                options.method ||
                "GET",

            headers: {
                "Content-Type":
                    "application/json",
                ...(options.headers || {})
            }
        };

        if (
            options.body !==
            undefined
        ) {
            config.body =
                JSON.stringify(
                    options.body
                );
        }

        try {

            const response =
                await fetch(
                    url,
                    config
                );

            const text =
                await response.text();

            let data = null;

            try {
                data =
                    text
                        ? JSON.parse(text)
                        : null;
            } catch {
                data = text;
            }

            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    `API HTTP ${response.status}`
                );
            }

            return data;

        } catch (error) {

            console.warn(
                "[CHIMIQUE FOBAS API]",
                error
            );

            throw error;
        }
    }

    return {
        API_BASE,
        request
    };
})();


/* ================================================================
   37. DATA VALIDATION ENGINE
   ================================================================ */

const ValidationEngine = (() => {

    function validateState(state) {

        if (
            !state ||
            typeof state !== "object"
        ) {
            return {
                valid: false,
                message:
                    "État inexistant."
            };
        }

        if (
            !Array.isArray(
                state.objects
            )
        ) {
            return {
                valid: false,
                message:
                    "La liste des objets est invalide."
            };
        }

        for (
            const object of state.objects
        ) {

            if (
                !object.id ||
                !object.name
            ) {
                return {
                    valid: false,
                    message:
                        "Un objet ne possède pas d'identifiant ou de nom."
                };
            }

            if (
                object.isContainer &&
                !Array.isArray(
                    object.contents
                )
            ) {
                return {
                    valid: false,
                    message:
                        `Le contenu du conteneur ${object.name} est invalide.`
                };
            }
        }

        return {
            valid: true,
            message: "État valide."
        };
    }

    function normalize() {

        const state =
            LabState.get();

        state.objects.forEach(
            object => {

                object.x =
                    CF.clamp(
                        CF.num(
                            object.x,
                            50
                        ),
                        2,
                        98
                    );

                object.y =
                    CF.clamp(
                        CF.num(
                            object.y,
                            50
                        ),
                        5,
                        94
                    );

                object.rotation =
                    CF.num(
                        object.rotation,
                        0
                    );

                object.scale =
                    CF.clamp(
                        CF.num(
                            object.scale,
                            1
                        ),
                        0.5,
                        2
                    );

                object.temperature =
                    CF.num(
                        object.temperature,
                        20
                    );

                if (
                    object.isContainer
                ) {

                    if (
                        !Array.isArray(
                            object.contents
                        )
                    ) {
                        object.contents =
                            [];
                    }

                    object.volume =
                        Math.max(
                            0,
                            CF.num(
                                object.volume,
                                0
                            )
                        );

                    if (
                        object.capacity
                    ) {
                        object.volume =
                            Math.min(
                                object.volume,
                                object.capacity
                            );
                    }
                }
            }
        );
    }

    return {
        validateState,
        normalize
    };
})();


/* ================================================================
   38. APPLICATION INITIALIZATION
   ================================================================ */

const ChimiqueFOBAS = (() => {

    let initialized = false;

    function init() {

        if (initialized) {
            return;
        }

        initialized = true;

        try {

            ValidationEngine.normalize();

            ModalEngine.init();

            ContextMenuEngine.init();

            DragEngine.init();

            SelectionEngine.init();

            EventEngine.init();

            ErrorEngine.init();

            AutoSaveEngine.init();

            bindGlobalShortcuts();

            UIEngine.renderAll();

            StageViewEngine.apply();

            /*
             * The first-run state must start with the
             * application ready, not with a fake loading
             * screen.
             */

            const engineStatus =
                CF.byId(
                    "engine-status-text"
                );

            if (engineStatus) {
                engineStatus.textContent =
                    "Moteur chimique prêt";
            }

            console.info(
                `[CHIMIQUE FOBAS] ${CF.VERSION} initialisé.`
            );

        } catch (error) {

            console.error(
                "[CHIMIQUE FOBAS] Boot error:",
                error
            );

            ErrorEngine.show(
                error
            );
        }
    }

    function bindGlobalShortcuts() {

        document.addEventListener(
            "keydown",
            event => {

                /*
                 * Ctrl/Cmd + S
                 */
                if (
                    (event.ctrlKey ||
                        event.metaKey) &&
                    event.key.toLowerCase() ===
                    "s"
                ) {

                    event.preventDefault();

                    SaveLoadEngine
                        .openSaveModal();

                    return;
                }

                /*
                 * Ctrl/Cmd + O
                 */
                if (
                    (event.ctrlKey ||
                        event.metaKey) &&
                    event.key.toLowerCase() ===
                    "o"
                ) {

                    event.preventDefault();

                    SaveLoadEngine
                        .openFileInput();

                    return;
                }
            }
        );
    }

    function getState() {
        return LabState.get();
    }

    return {
        init,
        getState
    };
})();


/* ================================================================
   39. GLOBAL PUBLIC API
   ---------------------------------------------------------------
   Makes the main engines available for controlled debugging
   and future FOBAS integration without putting logic into HTML.
   ================================================================ */

window.ChimiqueFOBAS = {
    version: CF.VERSION,

    state: LabState,

    chemicalDatabase:
        ChemicalDatabase,

    glasswareDatabase:
        GlasswareDatabase,

    equipmentDatabase:
        EquipmentDatabase,

    reactionDatabase:
        ReactionDatabase,

    objectEngine:
        ObjectEngine,

    containerEngine:
        ContainerEngine,

    reactionEngine:
        ReactionEngine,

    analysisEngine:
        AnalysisEngine,

    measurementEngine:
        MeasurementEngine,

    mixingEngine:
        MixingEngine,

    temperatureEngine:
        TemperatureEngine,

    pipetteEngine:
        PipetteEngine,

    saveLoad:
        SaveLoadEngine,

    history:
        HistoryEngine,

    api:
        FOBASApiBridge
};


/* ================================================================
   40. START APPLICATION
   ================================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {
            ChimiqueFOBAS.init();
        },
        {
            once: true
        }
    );

} else {

    ChimiqueFOBAS.init();
}


/* ================================================================
   END OF CHIMIQUE FOBAS JAVASCRIPT
   ================================================================ */

