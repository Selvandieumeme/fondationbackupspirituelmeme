/* ================================================================
   FOBAS — LABORATOIRE CHIMIQUE
   ================================================================
   MOTEUR JAVASCRIPT PRINCIPAL — VERSION CHIMIQUE AVANCÉE
   Compatible avec :
   simulationchimicfobas.html

   VERSION
   ---------------------------------------------------------------
   FOBAS Chemistry Engine — Advanced Scientific Simulation Core

   OBJECTIF
   ---------------------------------------------------------------
   Transformer l'interface FOBAS en véritable moteur de simulation
   chimique pédagogique et expérimental :

   • Sélection réelle
   • Déplacement réel
   • Transfert réel de matière
   • Conservation de la composition
   • Masse / volume / densité
   • Moles / masse molaire
   • Concentration molaire
   • Mélange réel
   • Réactions chimiques
   • Équations équilibrées
   • Stœchiométrie
   • Réactif limitant
   • Précipitation
   • Gaz
   • Couleur
   • Chaleur de réaction
   • pH dynamique pour les systèmes pris en charge
   • Chauffage
   • Changements de phase
   • Mesures instrumentales
   • Sauvegarde / restauration
   • Drag souris / tactile / stylet
   • Outils Select / Move / Transfer / Mix / Measure / Heat
   • API publique

   NIVEAUX
   ---------------------------------------------------------------
   Débutant
   • manipulation
   • observation
   • volume
   • masse
   • température
   • mélange simple

   Intermédiaire
   • concentration
   • moles
   • densité
   • pH
   • transfert quantitatif
   • réactions classiques

   Avancé
   • stœchiométrie
   • réactif limitant
   • précipitation
   • gaz
   • changements de phase
   • bilan de matière

   Expert
   • composition multi-espèces
   • équations équilibrées
   • calculs molaires
   • conservation de matière
   • diagnostics du moteur
   • interactions chimiques structurées

   IMPORTANT
   ---------------------------------------------------------------
   Ce moteur reste une simulation numérique scientifique.
   Les modèles thermiques, pH, solubilité et cinétique sont des
   modèles pédagogiques paramétrés et non un remplacement d'un
   laboratoire physique réel.

   ARCHITECTURE
   ---------------------------------------------------------------
   01. Configuration
   02. Base scientifique des matériaux
   03. Base des réactions
   04. État de simulation
   05. Références DOM
   06. Utilitaires
   07. Normalisation scientifique
   08. Bibliothèque
   09. Création des objets
   10. Rendu workspace
   11. Sélection
   12. Drag / Move
   13. Outils
   14. Inspecteur
   15. Transfert
   16. Mélange
   17. Moteur de réaction
   18. Stœchiométrie
   19. pH
   20. Chauffage
   21. Changements de phase
   22. Instruments
   23. Zoom
   24. Bibliothèque mobile
   25. Sauvegarde
   26. Observations
   27. Modales
   28. Inventaire
   29. Clavier
   30. Diagnostics
   31. Initialisation
   32. API publique
================================================================ */

(() => {

    "use strict";


    /* ============================================================
       01 — CONFIGURATION
    ============================================================ */

    const CHEM_CONFIG = {

        storageKey:
            "FOBAS_CHEMISTRY_LAB_STATE",

        engineVersion:
            "3.0.0-advanced",

        defaultSessionName:
            "Expérience chimique",

        workspaceWidth:
            1100,

        workspaceHeight:
            760,

        minZoom:
            0.65,

        maxZoom:
            1.60,

        zoomStep:
            0.10,

        defaultTemperature:
            25,

        minTemperature:
            -273.15,

        maxTemperature:
            3000,

        dragPadding:
            12,

        precision:
            6,

        maxObservations:
            50,

        reactionTolerance:
            1e-9,

        standardPressure:
            1,

        /*
         * R = 0.082057 L·atm·mol⁻¹·K⁻¹
         */
        gasConstant:
            0.082057,

        /*
         * Modèle pédagogique de chauffage.
         * Chaque pression sur Heat représente une étape
         * d'apport d'énergie.
         */
        heatingStepC:
            25,

        /*
         * Fraction approximative évaporée lorsqu'un liquide
         * dépasse son point d'ébullition.
         */
        evaporationFraction:
            0.05

    };


    /* ============================================================
       02 — BASE SCIENTIFIQUE DES MATÉRIAUX
    ============================================================ */

    /*
     * IMPORTANT :
     * Les valeurs de concentration des solutions sont des valeurs
     * de simulation utilisées pour permettre des expériences
     * quantitatives cohérentes.
     */

    const MATERIALS = [

        /* ========================================================
           VERRERIE
        ======================================================== */

        {
            id: "beaker-100",
            name: "Bécher 100 mL",
            category: "glassware",
            type: "container",
            icon: "🧪",
            state: "Vide",
            volume: 0,
            capacity: 100,
            mass: 0,
            density: 1,
            temperature: 25,
            ph: null,
            color: "Transparent",
            formula: "SiO₂ / verre",
            molarMass: null,
            description:
                "Petit bécher de laboratoire de 100 mL.",
            thermal: {
                meltingPoint: 1400,
                boilingPoint: 2200,
                heatCapacity: 0.84
            }
        },

        {
            id: "beaker-250",
            name: "Bécher 250 mL",
            category: "glassware",
            type: "container",
            icon: "🧪",
            state: "Vide",
            volume: 0,
            capacity: 250,
            mass: 0,
            density: 1,
            temperature: 25,
            ph: null,
            color: "Transparent",
            formula: "SiO₂ / verre",
            molarMass: null,
            description:
                "Bécher standard de laboratoire de 250 mL.",
            thermal: {
                meltingPoint: 1400,
                boilingPoint: 2200,
                heatCapacity: 0.84
            }
        },

        {
            id: "beaker-500",
            name: "Bécher 500 mL",
            category: "glassware",
            type: "container",
            icon: "🧪",
            state: "Vide",
            volume: 0,
            capacity: 500,
            mass: 0,
            density: 1,
            temperature: 25,
            ph: null,
            color: "Transparent",
            formula: "SiO₂ / verre",
            molarMass: null,
            description:
                "Grand bécher de laboratoire de 500 mL.",
            thermal: {
                meltingPoint: 1400,
                boilingPoint: 2200,
                heatCapacity: 0.84
            }
        },

        {
            id: "erlenmeyer-250",
            name: "Erlenmeyer 250 mL",
            category: "glassware",
            type: "container",
            icon: "⚗️",
            state: "Vide",
            volume: 0,
            capacity: 250,
            mass: 0,
            density: 1,
            temperature: 25,
            ph: null,
            color: "Transparent",
            formula: "SiO₂ / verre",
            molarMass: null,
            description:
                "Fiole Erlenmeyer de 250 mL.",
            thermal: {
                meltingPoint: 1400,
                boilingPoint: 2200,
                heatCapacity: 0.84
            }
        },

        {
            id: "test-tube",
            name: "Tube à essai",
            category: "glassware",
            type: "container",
            icon: "🧫",
            state: "Vide",
            volume: 0,
            capacity: 25,
            mass: 0,
            density: 1,
            temperature: 25,
            ph: null,
            color: "Transparent",
            formula: "SiO₂ / verre",
            molarMass: null,
            description:
                "Tube à essai pour petites quantités.",
            thermal: {
                meltingPoint: 1400,
                boilingPoint: 2200,
                heatCapacity: 0.84
            }
        },

        {
            id: "flask-100",
            name: "Fiole 100 mL",
            category: "glassware",
            type: "container",
            icon: "⚗️",
            state: "Vide",
            volume: 0,
            capacity: 100,
            mass: 0,
            density: 1,
            temperature: 25,
            ph: null,
            color: "Transparent",
            formula: "SiO₂ / verre",
            molarMass: null,
            description:
                "Fiole de laboratoire de 100 mL.",
            thermal: {
                meltingPoint: 1400,
                boilingPoint: 2200,
                heatCapacity: 0.84
            }
        },


        /* ========================================================
           RÉACTIFS LIQUIDES
        ======================================================== */

        {
            id: "water",
            name: "Eau distillée",
            category: "reagent",
            type: "liquid",
            icon: "💧",
            state: "Liquide",
            volume: 100,
            capacity: 100,
            mass: 100,
            density: 1.000,
            temperature: 25,
            ph: 7,
            color: "Incolore",
            formula: "H₂O",
            molarMass: 18.01528,
            defaultMolarity: 0,
            description:
                "Eau distillée de laboratoire.",
            thermal: {
                meltingPoint: 0,
                boilingPoint: 100,
                heatCapacity: 4.18
            }
        },

        {
            id: "hydrochloric-acid",
            name: "Acide chlorhydrique",
            category: "reagent",
            type: "liquid",
            icon: "🧴",
            state: "Liquide",
            volume: 100,
            capacity: 100,
            mass: 119,
            density: 1.19,
            temperature: 25,
            ph: 1,
            color: "Incolore",
            formula: "HCl",
            molarMass: 36.46094,
            defaultMolarity: 1.0,
            acidStrength: "strong",
            acidKa: Infinity,
            description:
                "Solution aqueuse d'acide chlorhydrique à 1,00 mol/L pour la simulation.",
            thermal: {
                meltingPoint: -27,
                boilingPoint: 108,
                heatCapacity: 3.5
            }
        },

        {
            id: "sodium-hydroxide",
            name: "Hydroxyde de sodium",
            category: "reagent",
            type: "liquid",
            icon: "🧴",
            state: "Liquide",
            volume: 100,
            capacity: 100,
            mass: 105,
            density: 1.05,
            temperature: 25,
            ph: 13,
            color: "Incolore",
            formula: "NaOH",
            molarMass: 39.997,
            defaultMolarity: 1.0,
            baseStrength: "strong",
            description:
                "Solution aqueuse de NaOH à 1,00 mol/L pour la simulation.",
            thermal: {
                meltingPoint: 318,
                boilingPoint: 1388,
                heatCapacity: 3.7
            }
        },

        {
            id: "ethanol",
            name: "Éthanol",
            category: "reagent",
            type: "liquid",
            icon: "🧴",
            state: "Liquide",
            volume: 100,
            capacity: 100,
            mass: 78.9,
            density: 0.789,
            temperature: 25,
            ph: 7,
            color: "Incolore",
            formula: "C₂H₅OH",
            molarMass: 46.06844,
            defaultMolarity: 17.12,
            description:
                "Éthanol de laboratoire.",
            thermal: {
                meltingPoint: -114.1,
                boilingPoint: 78.37,
                heatCapacity: 2.44
            }
        },

        {
            id: "copper-sulfate",
            name: "Sulfate de cuivre",
            category: "reagent",
            type: "solution",
            icon: "🔵",
            state: "Solution",
            volume: 100,
            capacity: 100,
            mass: 115,
            density: 1.15,
            temperature: 25,
            ph: 4,
            color: "Bleu",
            formula: "CuSO₄",
            molarMass: 159.609,
            defaultMolarity: 0.5,
            description:
                "Solution aqueuse de CuSO₄ à 0,50 mol/L.",
            thermal: {
                meltingPoint: 110,
                boilingPoint: 100,
                heatCapacity: 3.8
            }
        },














/* ================================================================
   SOLIDES — RÉACTIFS SOLIDES
   ================================================================ */


    {
        id: "sodium-chloride",
        name: "Chlorure de sodium",
        category: "solid",
        type: "solid",
        icon: "⬜",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 50,
        density: 2.16,
        temperature: 25,
        ph: 7,
        color: "Blanc",
        formula: "NaCl",
        molarMass: 58.4428,
        defaultMolarity: null,
        description: "Sel de laboratoire.",
        thermal: {
            meltingPoint: 801,
            boilingPoint: 1413,
            heatCapacity: 0.864
        }
    },

    {
        id: "copper",
        name: "Cuivre",
        category: "solid",
        type: "solid",
        icon: "🟠",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 25,
        density: 8.96,
        temperature: 25,
        ph: null,
        color: "Cuivre",
        formula: "Cu",
        molarMass: 63.546,
        defaultMolarity: null,
        description: "Échantillon métallique de cuivre.",
        thermal: {
            meltingPoint: 1084.62,
            boilingPoint: 2562,
            heatCapacity: 0.385
        }
    },

    {
        id: "iron",
        name: "Fer",
        category: "solid",
        type: "solid",
        icon: "⚙️",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 25,
        density: 7.87,
        temperature: 25,
        ph: null,
        color: "Gris métallique",
        formula: "Fe",
        molarMass: 55.845,
        defaultMolarity: null,
        description: "Échantillon de fer.",
        thermal: {
            meltingPoint: 1538,
            boilingPoint: 2862,
            heatCapacity: 0.449
        }
    },

    {
        id: "sodium",
        name: "Sodium",
        category: "solid",
        type: "solid",
        icon: "🟡",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 20,
        density: 0.968,
        temperature: 25,
        ph: null,
        color: "Argenté",
        formula: "Na",
        molarMass: 22.98976928,
        defaultMolarity: null,
        description: "Métal alcalin réactif.",
        thermal: {
            meltingPoint: 97.79,
            boilingPoint: 883,
            heatCapacity: 1.228
        }
    },

    {
        id: "sulfur",
        name: "Soufre",
        category: "solid",
        type: "solid",
        icon: "🟨",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 25,
        density: 2.07,
        temperature: 25,
        ph: null,
        color: "Jaune",
        formula: "S",
        molarMass: 32.06,
        defaultMolarity: null,
        description: "Soufre élémentaire.",
        thermal: {
            meltingPoint: 115.21,
            boilingPoint: 444.72,
            heatCapacity: 0.71
        }
    },

    {
        id: "carbon",
        name: "Carbone",
        category: "solid",
        type: "solid",
        icon: "⬛",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 20,
        density: 2.26,
        temperature: 25,
        ph: null,
        color: "Noir",
        formula: "C",
        molarMass: 12.011,
        defaultMolarity: null,
        description: "Carbone sous forme graphite.",
        thermal: {
            meltingPoint: 3550,
            boilingPoint: 4027,
            heatCapacity: 0.709
        }
    },

    {
        id: "aluminum",
        name: "Aluminium",
        category: "solid",
        type: "solid",
        icon: "🔘",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 25,
        density: 2.70,
        temperature: 25,
        ph: null,
        color: "Argenté",
        formula: "Al",
        molarMass: 26.9815385,
        defaultMolarity: null,
        description: "Échantillon métallique d'aluminium.",
        thermal: {
            meltingPoint: 660.32,
            boilingPoint: 2519,
            heatCapacity: 0.897
        }
    },

    {
        id: "zinc",
        name: "Zinc",
        category: "solid",
        type: "solid",
        icon: "⚪",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 25,
        density: 7.14,
        temperature: 25,
        ph: null,
        color: "Gris argenté",
        formula: "Zn",
        molarMass: 65.38,
        defaultMolarity: null,
        description: "Échantillon métallique de zinc.",
        thermal: {
            meltingPoint: 419.53,
            boilingPoint: 907,
            heatCapacity: 0.388
        }
    },

    {
        id: "magnesium",
        name: "Magnésium",
        category: "solid",
        type: "solid",
        icon: "⬜",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 20,
        density: 1.738,
        temperature: 25,
        ph: null,
        color: "Argenté",
        formula: "Mg",
        molarMass: 24.305,
        defaultMolarity: null,
        description: "Échantillon métallique de magnésium.",
        thermal: {
            meltingPoint: 650,
            boilingPoint: 1091,
            heatCapacity: 1.023
        }
    },

    {
        id: "calcium-carbonate",
        name: "Carbonate de calcium",
        category: "solid",
        type: "solid",
        icon: "⬜",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 50,
        density: 2.71,
        temperature: 25,
        ph: null,
        color: "Blanc",
        formula: "CaCO₃",
        molarMass: 100.0869,
        defaultMolarity: null,
        description: "Carbonate de calcium, composé minéral courant.",
        thermal: {
            meltingPoint: 825,
            boilingPoint: 1339,
            heatCapacity: 0.82
        }
    },

    {
        id: "sucrose",
        name: "Saccharose",
        category: "solid",
        type: "solid",
        icon: "⬜",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 50,
        density: 1.587,
        temperature: 25,
        ph: null,
        color: "Blanc",
        formula: "C₁₂H₂₂O₁₁",
        molarMass: 342.2965,
        defaultMolarity: null,
        description: "Sucre cristallin.",
        thermal: {
            meltingPoint: 186,
            boilingPoint: null,
            heatCapacity: 1.24
        }
    },

    {
        id: "potassium-chloride",
        name: "Chlorure de potassium",
        category: "solid",
        type: "solid",
        icon: "⬜",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 50,
        density: 1.984,
        temperature: 25,
        ph: 7,
        color: "Blanc",
        formula: "KCl",
        molarMass: 74.5513,
        defaultMolarity: null,
        description: "Sel ionique de potassium.",
        thermal: {
            meltingPoint: 770,
            boilingPoint: 1420,
            heatCapacity: 0.69
        }
    },

    {
        id: "sodium-carbonate",
        name: "Carbonate de sodium",
        category: "solid",
        type: "solid",
        icon: "⬜",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 50,
        density: 2.54,
        temperature: 25,
        ph: 11.6,
        color: "Blanc",
        formula: "Na₂CO₃",
        molarMass: 105.9888,
        defaultMolarity: null,
        description: "Carbonate de sodium.",
        thermal: {
            meltingPoint: 851,
            boilingPoint: 1600,
            heatCapacity: 1.09
        }
    },

    {
        id: "sodium-bicarbonate",
        name: "Bicarbonate de sodium",
        category: "solid",
        type: "solid",
        icon: "⬜",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 50,
        density: 2.20,
        temperature: 25,
        ph: 8.3,
        color: "Blanc",
        formula: "NaHCO₃",
        molarMass: 84.0066,
        defaultMolarity: null,
        description: "Bicarbonate de sodium.",
        thermal: {
            meltingPoint: 50,
            boilingPoint: null,
            heatCapacity: 1.05
        }
    },

    {
        id: "silver-nitrate",
        name: "Nitrate d'argent",
        category: "solid",
        type: "solid",
        icon: "⬜",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 25,
        density: 4.35,
        temperature: 25,
        ph: null,
        color: "Blanc",
        formula: "AgNO₃",
        molarMass: 169.8731,
        defaultMolarity: null,
        description: "Sel d'argent utilisé comme réactif analytique.",
        thermal: {
            meltingPoint: 212,
            boilingPoint: 444,
            heatCapacity: 0.435
        }
    },

    {
        id: "zinc-sulfate",
        name: "Sulfate de zinc",
        category: "solid",
        type: "solid",
        icon: "⬜",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 50,
        density: 3.54,
        temperature: 25,
        ph: null,
        color: "Blanc",
        formula: "ZnSO₄",
        molarMass: 161.44,
        defaultMolarity: null,
        description: "Sulfate de zinc.",
        thermal: {
            meltingPoint: 680,
            boilingPoint: 740,
            heatCapacity: 0.74
        }
    },

    {
        id: "silver",
        name: "Argent",
        category: "solid",
        type: "solid",
        icon: "⚪",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 20,
        density: 10.49,
        temperature: 25,
        ph: null,
        color: "Argent",
        formula: "Ag",
        molarMass: 107.8682,
        defaultMolarity: null,
        description: "Échantillon métallique d'argent.",
        thermal: {
            meltingPoint: 961.78,
            boilingPoint: 2162,
            heatCapacity: 0.235
        }
    },

    {
        id: "gold",
        name: "Or",
        category: "solid",
        type: "solid",
        icon: "🟨",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 20,
        density: 19.32,
        temperature: 25,
        ph: null,
        color: "Doré",
        formula: "Au",
        molarMass: 196.96657,
        defaultMolarity: null,
        description: "Échantillon métallique d'or.",
        thermal: {
            meltingPoint: 1064.18,
            boilingPoint: 2856,
            heatCapacity: 0.129
        }
    },

    {
        id: "lead",
        name: "Plomb",
        category: "solid",
        type: "solid",
        icon: "⬛",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 25,
        density: 11.34,
        temperature: 25,
        ph: null,
        color: "Gris",
        formula: "Pb",
        molarMass: 207.2,
        defaultMolarity: null,
        description: "Échantillon métallique de plomb.",
        thermal: {
            meltingPoint: 327.46,
            boilingPoint: 1749,
            heatCapacity: 0.128
        }
    },

    {
        id: "tin",
        name: "Étain",
        category: "solid",
        type: "solid",
        icon: "⚪",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 25,
        density: 7.31,
        temperature: 25,
        ph: null,
        color: "Argenté",
        formula: "Sn",
        molarMass: 118.71,
        defaultMolarity: null,
        description: "Échantillon métallique d'étain.",
        thermal: {
            meltingPoint: 231.93,
            boilingPoint: 2602,
            heatCapacity: 0.228
        }
    },

    {
        id: "nickel",
        name: "Nickel",
        category: "solid",
        type: "solid",
        icon: "⚙️",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 25,
        density: 8.908,
        temperature: 25,
        ph: null,
        color: "Argenté",
        formula: "Ni",
        molarMass: 58.6934,
        defaultMolarity: null,
        description: "Échantillon métallique de nickel.",
        thermal: {
            meltingPoint: 1455,
            boilingPoint: 2913,
            heatCapacity: 0.444
        }
    },

    {
        id: "chromium",
        name: "Chrome",
        category: "solid",
        type: "solid",
        icon: "⚙️",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 25,
        density: 7.19,
        temperature: 25,
        ph: null,
        color: "Argenté",
        formula: "Cr",
        molarMass: 51.9961,
        defaultMolarity: null,
        description: "Échantillon métallique de chrome.",
        thermal: {
            meltingPoint: 1907,
            boilingPoint: 2671,
            heatCapacity: 0.449
        }
    },

    {
        id: "copper-oxide",
        name: "Oxyde de cuivre(II)",
        category: "solid",
        type: "solid",
        icon: "⬛",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 25,
        density: 6.31,
        temperature: 25,
        ph: null,
        color: "Noir",
        formula: "CuO",
        molarMass: 79.545,
        defaultMolarity: null,
        description: "Oxyde de cuivre(II).",
        thermal: {
            meltingPoint: 1326,
            boilingPoint: 2000,
            heatCapacity: 0.535
        }
    },

    {
        id: "iron-oxide",
        name: "Oxyde de fer(III)",
        category: "solid",
        type: "solid",
        icon: "🟤",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 25,
        density: 5.24,
        temperature: 25,
        ph: null,
        color: "Rouge-brun",
        formula: "Fe₂O₃",
        molarMass: 159.688,
        defaultMolarity: null,
        description: "Oxyde de fer(III).",
        thermal: {
            meltingPoint: 1565,
            boilingPoint: 1987,
            heatCapacity: 0.65
        }
    },

    {
        id: "silicon-dioxide",
        name: "Dioxyde de silicium",
        category: "solid",
        type: "solid",
        icon: "⬜",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 25,
        density: 2.65,
        temperature: 25,
        ph: null,
        color: "Blanc",
        formula: "SiO₂",
        molarMass: 60.0843,
        defaultMolarity: null,
        description: "Dioxyde de silicium.",
        thermal: {
            meltingPoint: 1713,
            boilingPoint: 2950,
            heatCapacity: 0.703
        }
    },

    {
        id: "potassium-permanganate",
        name: "Permanganate de potassium",
        category: "solid",
        type: "solid",
        icon: "🟣",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 25,
        density: 2.70,
        temperature: 25,
        ph: null,
        color: "Violet foncé",
        formula: "KMnO₄",
        molarMass: 158.034,
        defaultMolarity: null,
        description: "Oxydant solide de laboratoire.",
        thermal: {
            meltingPoint: 240,
            boilingPoint: null,
            heatCapacity: 0.75
        }
    },

    {
        id: "iodine",
        name: "Iode",
        category: "solid",
        type: "solid",
        icon: "🟣",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 15,
        density: 4.93,
        temperature: 25,
        ph: null,
        color: "Violet-noir",
        formula: "I₂",
        molarMass: 253.80894,
        defaultMolarity: null,
        description: "Iode élémentaire.",
        thermal: {
            meltingPoint: 113.7,
            boilingPoint: 184.3,
            heatCapacity: 0.54
        }
    },

    {
        id: "glucose",
        name: "Glucose",
        category: "solid",
        type: "solid",
        icon: "⬜",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 50,
        density: 1.54,
        temperature: 25,
        ph: null,
        color: "Blanc",
        formula: "C₆H₁₂O₆",
        molarMass: 180.156,
        defaultMolarity: null,
        description: "Glucose cristallin.",
        thermal: {
            meltingPoint: 146,
            boilingPoint: null,
            heatCapacity: 1.25
        }
    },

    {
        id: "urea",
        name: "Urée",
        category: "solid",
        type: "solid",
        icon: "⬜",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 50,
        density: 1.32,
        temperature: 25,
        ph: null,
        color: "Blanc",
        formula: "CH₄N₂O",
        molarMass: 60.056,
        defaultMolarity: null,
        description: "Composé organique azoté.",
        thermal: {
            meltingPoint: 133,
            boilingPoint: null,
            heatCapacity: 1.33
        }
    },

    {
        id: "citric-acid",
        name: "Acide citrique",
        category: "solid",
        type: "solid",
        icon: "⬜",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 50,
        density: 1.665,
        temperature: 25,
        ph: 2.2,
        color: "Blanc",
        formula: "C₆H₈O₇",
        molarMass: 192.123,
        defaultMolarity: null,
        description: "Acide organique solide.",
        thermal: {
            meltingPoint: 153,
            boilingPoint: null,
            heatCapacity: 1.25
        }
    },

    {
        id: "benzoic-acid",
        name: "Acide benzoïque",
        category: "solid",
        type: "solid",
        icon: "⬜",
        state: "Solide",
        volume: 0,
        capacity: 0,
        mass: 50,
        density: 1.27,
        temperature: 25,
        ph: 2.8,
        color: "Blanc",
        formula: "C₇H₆O₂",
        molarMass: 122.123,
        defaultMolarity: null,
        description: "Acide carboxylique aromatique.",
        thermal: {
            meltingPoint: 122.4,
            boilingPoint: 249.2,
            heatCapacity: 1.15
        }
    },











      
        /* ========================================================
           INSTRUMENTS
        ======================================================== */

        {
            id: "thermometer",
            name: "Thermomètre",
            category: "instrument",
            type: "instrument",
            icon: "🌡️",
            state: "Instrument",
            volume: 0,
            capacity: 0,
            mass: 0,
            density: null,
            temperature: 25,
            ph: null,
            color: "Blanc",
            formula: null,
            molarMass: null,
            description:
                "Instrument de mesure de température.",
            measurementType: "temperature"
        },

        {
            id: "ph-meter",
            name: "pH-mètre",
            category: "instrument",
            type: "instrument",
            icon: "📟",
            state: "Instrument",
            volume: 0,
            capacity: 0,
            mass: 0,
            density: null,
            temperature: 25,
            ph: 7,
            color: "Noir",
            formula: null,
            molarMass: null,
            description:
                "Instrument de mesure du pH.",
            measurementType: "ph"
        },

        {
            id: "balance",
            name: "Balance électronique",
            category: "instrument",
            type: "instrument",
            icon: "⚖️",
            state: "Instrument",
            volume: 0,
            capacity: 0,
            mass: 0,
            density: null,
            temperature: 25,
            ph: null,
            color: "Noir",
            formula: null,
            molarMass: null,
            description:
                "Balance électronique de précision.",
            measurementType: "mass"
        },

        {
            id: "graduated-cylinder",
            name: "Éprouvette graduée",
            category: "instrument",
            type: "container",
            icon: "🥛",
            state: "Vide",
            volume: 0,
            capacity: 100,
            mass: 0,
            density: 1,
            temperature: 25,
            ph: null,
            color: "Transparent",
            formula: "SiO₂ / verre",
            molarMass: null,
            description:
                "Éprouvette graduée de 100 mL.",
            thermal: {
                meltingPoint: 1400,
                boilingPoint: 2200,
                heatCapacity: 0.84
            }
        },


        /* ========================================================
           ÉQUIPEMENTS
        ======================================================== */

        {
            id: "bunsen",
            name: "Bec Bunsen",
            category: "equipment",
            type: "heater",
            icon: "🔥",
            state: "Éteint",
            volume: 0,
            capacity: 0,
            mass: 0,
            density: null,
            temperature: 25,
            ph: null,
            color: "Métallique",
            formula: null,
            molarMass: null,
            description:
                "Source de chaleur de laboratoire.",
            heatPower: 1
        },

        {
            id: "hot-plate",
            name: "Plaque chauffante",
            category: "equipment",
            type: "heater",
            icon: "♨️",
            state: "Éteinte",
            volume: 0,
            capacity: 0,
            mass: 0,
            density: null,
            temperature: 25,
            ph: null,
            color: "Noir",
            formula: null,
            molarMass: null,
            description:
                "Plaque chauffante de laboratoire.",
            heatPower: 0.8
        },

        {
            id: "stirrer",
            name: "Agitateur magnétique",
            category: "equipment",
            type: "mixer",
            icon: "🔄",
            state: "Arrêté",
            volume: 0,
            capacity: 0,
            mass: 0,
            density: null,
            temperature: 25,
            ph: null,
            color: "Noir",
            formula: null,
            molarMass: null,
            description:
                "Agitateur magnétique."
        }

    ];


    /* ============================================================
       03 — BASE DES RÉACTIONS
    ============================================================ */

    /*
     * Une réaction n'est plus identifiée uniquement par deux IDs.
     * Elle possède :
     *
     * reactants:
     * [
     *   { materialId, coefficient }
     * ]
     *
     * products:
     * [
     *   { materialId, coefficient }
     * ]
     *
     * Le moteur calcule ensuite :
     * • moles disponibles
     * • ratio stœchiométrique
     * • réactif limitant
     * • avancement
     * • produits
     */

    const REACTIONS = [

        {
            id: "neutralization-hcl-naoh",

            name:
                "Neutralisation acide-base",

            equation:
                "HCl + NaOH → NaCl + H₂O",

            reactants: [
                {
                    materialId: "hydrochloric-acid",
                    coefficient: 1
                },
                {
                    materialId: "sodium-hydroxide",
                    coefficient: 1
                }
            ],

            products: [
                {
                    materialId: "sodium-chloride",
                    coefficient: 1
                },
                {
                    materialId: "water",
                    coefficient: 1
                }
            ],

            type:
                "neutralisation",

            enthalpyKJPerMol:
                -57.3,

            gas:
                null,

            precipitate:
                null,

            color:
                "Incolore",

            priority:
                10
        },


        {
            id: "precipitation-cuso4-naoh",

            name:
                "Précipitation de l'hydroxyde de cuivre(II)",

            equation:
                "CuSO₄ + 2 NaOH → Cu(OH)₂↓ + Na₂SO₄",

            reactants: [
                {
                    materialId: "copper-sulfate",
                    coefficient: 1
                },
                {
                    materialId: "sodium-hydroxide",
                    coefficient: 2
                }
            ],

            products: [
                {
                    materialId: "copper-hydroxide",
                    coefficient: 1
                },
                {
                    materialId: "sodium-sulfate",
                    coefficient: 1
                }
            ],

            type:
                "precipitation",

            enthalpyKJPerMol:
                -20,

            gas:
                null,

            precipitate:
                "Cu(OH)₂",

            color:
                "Bleu",

            priority:
                20
        },


        {
            id: "displacement-fe-cuso4",

            name:
                "Déplacement du cuivre par le fer",

            equation:
                "Fe + CuSO₄ → FeSO₄ + Cu",

            reactants: [
                {
                    materialId: "iron",
                    coefficient: 1
                },
                {
                    materialId: "copper-sulfate",
                    coefficient: 1
                }
            ],

            products: [
                {
                    materialId: "iron-sulfate",
                    coefficient: 1
                },
                {
                    materialId: "copper",
                    coefficient: 1
                }
            ],

            type:
                "redox",

            enthalpyKJPerMol:
                -20,

            gas:
                null,

            precipitate:
                "Cu",

            color:
                "Vert pâle / cuivre métallique",

            priority:
                15
        }

    ];


    /*
     * Produits supplémentaires nécessaires aux réactions.
     * Ils ne sont pas forcément affichés comme cartes de bibliothèque.
     */

    const GENERATED_SUBSTANCES = {

        "copper-hydroxide": {
            id: "copper-hydroxide",
            name: "Hydroxyde de cuivre(II)",
            category: "product",
            type: "solid",
            icon: "🔷",
            state: "Précipité",
            density: 3.37,
            mass: 0,
            volume: 0,
            capacity: 0,
            temperature: 25,
            ph: null,
            color: "Bleu",
            formula: "Cu(OH)₂",
            molarMass: 97.561,
            description:
                "Précipité bleu formé lors de la réaction CuSO₄/NaOH."
        },

        "sodium-sulfate": {
            id: "sodium-sulfate",
            name: "Sulfate de sodium",
            category: "product",
            type: "solution",
            icon: "🧂",
            state: "Dissous",
            density: 1,
            mass: 0,
            volume: 0,
            capacity: 0,
            temperature: 25,
            ph: 7,
            color: "Incolore",
            formula: "Na₂SO₄",
            molarMass: 142.042,
            description:
                "Produit dissous de la réaction de précipitation."
        },

        "iron-sulfate": {
            id: "iron-sulfate",
            name: "Sulfate de fer(II)",
            category: "product",
            type: "solution",
            icon: "🟢",
            state: "Dissous",
            density: 1,
            mass: 0,
            volume: 0,
            capacity: 0,
            temperature: 25,
            ph: 4,
            color: "Vert pâle",
            formula: "FeSO₄",
            molarMass: 151.908,
            description:
                "Solution de sulfate de fer(II)."
        }

    };


    /* ============================================================
       04 — ÉTAT DE LA SIMULATION
    ============================================================ */

    const state = {

        engineVersion:
            CHEM_CONFIG.engineVersion,

        sessionName:
            CHEM_CONFIG.defaultSessionName,

        selectedMaterialId:
            null,

        activeTool:
            "select",

        activeCategory:
            "all",

        search:
            "",

        zoom:
            1,

        nextObjectNumber:
            1,

        objects:
            [],

        observations:
            [],

        temperature:
            CHEM_CONFIG.defaultTemperature,

        totalEnergy:
            0,

        reaction: {

            active:
                false,

            status:
                "Aucune",

            phase:
                "Stable",

            gas:
                "Aucun",

            precipitate:
                "Aucun",

            color:
                "Inchangée",

            equation:
                "",

            limitingReagent:
                null,

            extentMol:
                0
        },

        drag: {

            active:
                false,

            objectId:
                null,

            pointerId:
                null,

            offsetX:
                0,

            offsetY:
                0,

            originalX:
                0,

            originalY:
                0
        }

    };


    /* ============================================================
       05 — RÉFÉRENCES DOM
    ============================================================ */

    const $ = (id) =>
        document.getElementById(id);

    const app =
        $("chemApp");

    const materialsPanel =
        $("materialsPanel");

    const materialsLibrary =
        $("materialsLibrary");

    const materialSearch =
        $("materialSearch");

    const materialCategories =
        $("materialCategories");

    const inventoryList =
        $("inventoryList");

    const chemistryCanvas =
        $("chemistryCanvas");

    const workspaceObjects =
        $("workspaceObjects");

    const workspaceDropZone =
        $("workspaceDropZone");

    const sessionName =
        $("sessionName");

    const selectedObjectType =
        $("selectedObjectType");

    const objectInspector =
        $("objectInspector");

    const materialProperties =
        $("materialProperties");

    const compositionSection =
        $("compositionSection");

    const measurementSection =
        $("measurementSection");

    const reactionSection =
        $("reactionSection");

    const objectActions =
        $("objectActions");

    const observationLog =
        $("observationLog");


    /* ============================================================
       06 — UTILITAIRES
    ============================================================ */

    function clamp(
        value,
        min,
        max
    ) {

        return Math.min(
            Math.max(
                value,
                min
            ),
            max
        );

    }


    function round(
        value,
        decimals = CHEM_CONFIG.precision
    ) {

        const factor =
            Math.pow(
                10,
                decimals
            );

        return Math.round(
            Number(value) * factor
        ) / factor;

    }


    function escapeHTML(value) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    function formatNumber(
        value,
        decimals = 1
    ) {

        if (
            !Number.isFinite(
                Number(value)
            )
        ) {

            return "—";

        }


        return Number(value)
            .toFixed(
                decimals
            );

    }


    function formatScientific(
        value
    ) {

        if (
            !Number.isFinite(
                Number(value)
            )
        ) {

            return "—";

        }


        return Number(value)
            .toExponential(3);

    }


    function getMaterial(
        materialId
    ) {

        return MATERIALS.find(
            material =>
                material.id ===
                materialId
        ) ||
        GENERATED_SUBSTANCES[
            materialId
        ] ||
        null;

    }


    function getObject(
        objectId
    ) {

        return state.objects.find(
            object =>
                object.id ===
                objectId
        ) || null;

    }


    function getSelectedObject() {

        if (
            !state.selectedMaterialId
        ) {

            return null;

        }


        return getObject(
            state.selectedMaterialId
        );

    }


    function isContainer(
        object
    ) {

        return !!object &&
            (
                object.type ===
                    "container" ||
                object.category ===
                    "glassware" ||
                object.materialId ===
                    "graduated-cylinder"
            );

    }


    function isLiquidObject(
        object
    ) {

        return !!object &&
            (
                object.type ===
                    "liquid" ||
                object.type ===
                    "solution"
            );

    }


    function isSolidObject(
        object
    ) {

        return !!object &&
            object.type ===
                "solid";

    }


    function isInstrument(
        object
    ) {

        return !!object &&
            object.type ===
                "instrument";

    }


    function announce(
        message
    ) {

        const region =
            $("chemLiveRegion");


        if (region) {

            region.textContent =
                message;

        }

    }


    function getCanvasScale() {

        return Number(
            state.zoom
        ) || 1;

    }


    /* ============================================================
       07 — NORMALISATION SCIENTIFIQUE
    ============================================================ */

    function getMaterialThermalData(
        materialId
    ) {

        const material =
            getMaterial(
                materialId
            );


        return material?.thermal ||
            {
                meltingPoint: null,
                boilingPoint: null,
                heatCapacity: 4.18
            };

    }


    function calculateMolesFromMass(
        massG,
        molarMass
    ) {

        if (
            !Number.isFinite(
                Number(massG)
            ) ||
            !Number.isFinite(
                Number(molarMass)
            ) ||
            Number(molarMass) <= 0
        ) {

            return 0;

        }


        return Math.max(
            0,
            Number(massG) /
                Number(molarMass)
        );

    }


    function calculateMassFromMoles(
        moles,
        molarMass
    ) {

        if (
            !Number.isFinite(
                Number(moles)
            ) ||
            !Number.isFinite(
                Number(molarMass)
            )
        ) {

            return 0;

        }


        return Math.max(
            0,
            Number(moles) *
                Number(molarMass)
        );

    }


    function calculateMolarity(
        moles,
        volumeMl
    ) {

        const volumeL =
            Number(volumeMl) /
            1000;


        if (
            volumeL <= 0
        ) {

            return 0;

        }


        return Math.max(
            0,
            Number(moles) /
                volumeL
        );

    }


    function getComponentById(
        object,
        materialId
    ) {

        if (
            !object ||
            !Array.isArray(
                object.composition
            )
        ) {

            return null;

        }


        return object.composition.find(
            component =>
                component.materialId ===
                materialId
        ) || null;

    }


    function ensureComposition(
        object
    ) {

        if (
            !Array.isArray(
                object.composition
            )
        ) {

            object.composition = [];

        }


        return object.composition;

    }


    function getCompositionMoles(
        component
    ) {

        if (
            Number.isFinite(
                Number(component.moles)
            )
        ) {

            return Math.max(
                0,
                Number(component.moles)
            );

        }


        const material =
            getMaterial(
                component.materialId
            );


        if (
            !material
        ) {

            return 0;

        }


        return calculateMolesFromMass(
            component.mass,
            material.molarMass
        );

    }


    function getObjectTotalCompositionMass(
        object
    ) {

        return ensureComposition(
            object
        ).reduce(
            (
                total,
                component
            ) =>
                total +
                (
                    Number(
                        component.mass
                    ) || 0
                ),
            0
        );

    }


    function calculateObjectMass(
        object
    ) {

        if (
            isContainer(
                object
            )
        ) {

            return getObjectTotalCompositionMass(
                object
            );

        }


        if (
            Number.isFinite(
                Number(object.mass)
            )
        ) {

            return Math.max(
                0,
                Number(object.mass)
            );

        }


        return 0;

    }


    function calculateObjectVolume(
        object
    ) {

        if (
            isContainer(
                object
            )
        ) {

            /*
             * Approximation additive des volumes liquides.
             */
            return ensureComposition(
                object
            ).reduce(
                (
                    total,
                    component
                ) =>
                    total +
                    (
                        Number(
                            component.volumeMl
                        ) || 0
                    ),
                0
            );

        }


        return Math.max(
            0,
            Number(object.volume) || 0
        );

    }


    function calculateEffectiveDensity(
        object
    ) {

        const volume =
            calculateObjectVolume(
                object
            );

        const mass =
            calculateObjectMass(
                object
            );


        if (
            volume <= 0
        ) {

            return Number.isFinite(
                Number(object.density)
            )
                ? Number(object.density)
                : null;

        }


        return mass /
            volume;

    }


    function recalculateContainer(
        object
    ) {

        if (
            !object ||
            !isContainer(
                object
            )
        ) {

            return;

        }


        ensureComposition(
            object
        );


        object.volume =
            calculateObjectVolume(
                object
            );


        object.mass =
            calculateObjectMass(
                object
            );


        object.density =
            calculateEffectiveDensity(
                object
            );


        /*
         * Température pondérée approximative
         * par masse.
         */
        const totalMass =
            object.mass;


        if (
            totalMass > 0
        ) {

            let weighted =
                0;


            object.composition
                .forEach(
                    component => {

                        const componentMass =
                            Number(
                                component.mass
                            ) || 0;

                        const componentTemp =
                            Number(
                                component.temperature
                            );

                        if (
                            Number.isFinite(
                                componentTemp
                            )
                        ) {

                            weighted +=
                                componentMass *
                                componentTemp;

                        }

                    }
                );


            if (
                weighted > 0
            ) {

                object.temperature =
                    weighted /
                    totalMass;

            }

        }


        /*
         * Couleur dominante.
         */
        updateObjectAppearance(
            object
        );


        /*
         * pH dynamique.
         */
        object.ph =
            calculateObjectPH(
                object
            );








        /*
         * Etat.
         *
         * IMPORTANT :
         * Un récipient peut contenir uniquement un solide.
         * Dans ce cas, son volume liquide reste naturellement à 0 mL,
         * mais le récipient n'est PAS vide.
         *
         * On distingue donc :
         * - aucun composant       → Vide
         * - solide(s) uniquement  → Solide / solide(s)
         * - liquide(s) uniquement → Liquide ou Solution / mélange
         * - plusieurs phases      → Solution / mélange
         */

        const composition =
            ensureComposition(
                object
            );

        const hasComponents =
            composition.length > 0;

        const hasSolid =
            composition.some(
                component =>
                    component.phase ===
                        "solid" &&
                    (
                        (
                            Number(
                                component.mass
                            ) || 0
                        ) >
                            CHEM_CONFIG.reactionTolerance ||
                        (
                            Number(
                                component.moles
                            ) || 0
                        ) >
                            CHEM_CONFIG.reactionTolerance
                    )
            );

        const hasLiquid =
            composition.some(
                component =>
                    (
                        component.phase ===
                            "liquid" ||
                        component.phase ===
                            "solution"
                    ) &&
                    (
                        (
                            Number(
                                component.volumeMl
                            ) || 0
                        ) >
                            CHEM_CONFIG.reactionTolerance
                    )
            );


        if (
            !hasComponents
        ) {

            object.state =
                "Vide";













        } else if (
            hasSolid &&
            !hasLiquid
        ) {

            object.state =
                object.mixed
                    ? "Mélange effectué"
                    : (
                        composition.length === 1
                            ? "Solide"
                            : "Mélange solide"
                    );

        } else if (
            hasLiquid &&
            hasSolid
        ) {

            object.state =
                "Solution / mélange";

        } else if (
            object.volume >
                CHEM_CONFIG.reactionTolerance
        ) {

            object.state =
                composition.length > 1
                    ? "Solution / mélange"
                    : "Liquide";

        } else {

            object.state =
                "Matière présente";

        }





    }


    function updateObjectAppearance(
        object
    ) {

        if (
            !object ||
            !object.composition ||
            !object.composition.length
        ) {

            return;

        }


        const colors =
            object.composition
                .map(
                    component => {

                        const material =
                            getMaterial(
                                component.materialId
                            );

                        return material?.color;

                    }
                )
                .filter(Boolean);


        if (
            colors.length === 1
        ) {

            object.color =
                colors[0];

        } else if (
            colors.length > 1
        ) {

            const unique =
                [...new Set(colors)];

            object.color =
                unique.join(" / ");

        }


        /*
         * Les réactions peuvent imposer une couleur
         * particulière.
         */
        if (
            object.reaction?.color &&
            object.reaction.color !==
                "Inchangée"
        ) {

            object.color =
                object.reaction.color;

        }

    }


    /* ============================================================
       08 — BIBLIOTHÈQUE
    ============================================================ */

    function renderMaterialsLibrary() {

        if (
            !materialsLibrary
        ) {

            return;

        }


        const search =
            state.search
                .trim()
                .toLowerCase();


        const filtered =
            MATERIALS.filter(
                material => {

                    const categoryMatch =
                        state.activeCategory ===
                            "all" ||
                        material.category ===
                            state.activeCategory;


                    const searchMatch =
                        !search ||
                        material.name
                            .toLowerCase()
                            .includes(
                                search
                            ) ||
                        material.description
                            .toLowerCase()
                            .includes(
                                search
                            ) ||
                        (
                            material.formula ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                search
                            );


                    return (
                        categoryMatch &&
                        searchMatch
                    );

                }
            );


        if (
            $("materialCount")
        ) {

            $("materialCount")
                .textContent =
                filtered.length;

        }


        if (
            !filtered.length
        ) {

            materialsLibrary.innerHTML = `
                <div class="chem-empty-library">
                    <div>⚗</div>
                    <strong>Aucun matériau trouvé</strong>
                    <span>Modifiez la recherche ou la catégorie.</span>
                </div>
            `;

            return;

        }


        materialsLibrary.innerHTML =
            filtered.map(
                material => `

            <article
                class="chem-material-card"
                data-material-id="${escapeHTML(material.id)}"
                tabindex="0"
                role="button"
                aria-label="Ajouter ${escapeHTML(material.name)}"
            >

                <div class="chem-material-icon">
                    ${material.icon}
                </div>

                <div class="chem-material-info">

                    <strong>
                        ${escapeHTML(material.name)}
                    </strong>

                    <span>
                        ${escapeHTML(material.description)}
                    </span>

                    ${
                        material.formula
                            ? `
                                <small>
                                    ${escapeHTML(material.formula)}
                                    ${
                                        Number.isFinite(
                                            material.molarMass
                                        )
                                            ? ` · M = ${formatNumber(material.molarMass, 3)} g/mol`
                                            : ""
                                    }
                                </small>
                              `
                            : ""
                    }

                </div>

                <button
                    type="button"
                    class="chem-material-add"
                    data-add-material="${escapeHTML(material.id)}"
                    title="Ajouter"
                    aria-label="Ajouter ${escapeHTML(material.name)}"
                >
                    +
                </button>

            </article>

        `
            ).join("");

    }


    function renderCategories() {

        if (
            !materialCategories
        ) {

            return;

        }


        materialCategories
            .querySelectorAll(
                ".category-button"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.category ===
                            state.activeCategory
                    );

                }
            );

    }


    /* ============================================================
       09 — COMPOSITION DES OBJETS
    ============================================================ */

    function createPureComposition(
        material,
        volumeOverride = null,
        massOverride = null
    ) {

        const volume =
            Number.isFinite(
                Number(volumeOverride)
            )
                ? Number(volumeOverride)
                : Number(
                    material.volume
                ) || 0;


        let mass =
            Number.isFinite(
                Number(massOverride)
            )
                ? Number(massOverride)
                : Number(
                    material.mass
                ) || 0;


        if (
            mass <= 0 &&
            volume > 0 &&
            Number.isFinite(
                Number(material.density)
            )
        ) {

            mass =
                volume *
                Number(
                    material.density
                );

        }


        let moles =
            calculateMolesFromMass(
                mass,
                material.molarMass
            );


        if (
            Number.isFinite(
                Number(material.defaultMolarity)
            ) &&
            volume > 0
        ) {

            moles =
                Number(
                    material.defaultMolarity
                ) *
                (
                    volume / 1000
                );

        }


        return {

            materialId:
                material.id,

            name:
                material.name,

            formula:
                material.formula ||
                "",

            amount:
                volume,

            volumeMl:
                volume,

            mass:
                mass,

            moles:
                moles,

            molarity:
                volume > 0
                    ? calculateMolarity(
                        moles,
                        volume
                    )
                    : null,

            temperature:
                Number(
                    material.temperature
                ) || 25,

            phase:
                material.type ===
                    "solid"
                    ? "solid"
                    : "liquid"

        };

    }


    /* ============================================================
       10 — CRÉATION DES OBJETS
    ============================================================ */

    function createLabObject(
        materialId,
        x = null,
        y = null
    ) {

        const material =
            getMaterial(
                materialId
            );


        if (
            !material
        ) {

            return null;

        }


        const number =
            state.nextObjectNumber++;


        const isContainerMaterial =
            material.type ===
                "container";


        const isLiquid =
            material.type ===
                "liquid" ||
            material.type ===
                "solution";


        const isSolid =
            material.type ===
                "solid";


        const object = {

            id:
                `chem-object-${Date.now()}-${number}`,

            materialId:
                material.id,

            name:
                material.name,

            category:
                material.category,

            type:
                material.type,

            icon:
                material.icon,

            state:
                material.state,

            volume:
                isContainerMaterial
                    ? 0
                    : (
                        Number(
                            material.volume
                        ) || 0
                    ),

            capacity:
                Number(
                    material.capacity
                ) || 0,

            mass:
                isContainerMaterial
                    ? 0
                    : (
                        Number(
                            material.mass
                        ) || 0
                    ),

            density:
                material.density,

            temperature:
                Number(
                    material.temperature
                ) || 25,

            ph:
                material.ph,

            color:
                material.color,

            description:
                material.description,

            formula:
                material.formula ||
                null,

            molarMass:
                material.molarMass ||
                null,

            mixed:
                false,

            heated:
                false,

            selected:
                false,

            interactionLocked:
                false,

            reaction: {

                active:
                    false,

                status:
                    "Aucune",

                phase:
                    "Stable",

                gas:
                    "Aucun",

                precipitate:
                    "Aucun",

                color:
                    "Inchangée",

                equation:
                    "",

                limitingReagent:
                    null,

                extentMol:
                    0
            },

            composition:
                [],

            products:
                [],

            x:
                Number.isFinite(x)
                    ? x
                    : 120 +
                        (
                            number *
                            43
                        ) %
                        600,

            y:
                Number.isFinite(y)
                    ? y
                    : 100 +
                        (
                            number *
                            31
                        ) %
                        400,

            width:
                material.type ===
                    "instrument"
                    ? 130
                    : 110,

            height:
                material.type ===
                    "instrument"
                    ? 82
                    : 115

        };


        if (
            isLiquid ||
            isSolid
        ) {

            object.composition =
                [
                    createPureComposition(
                        material
                    )
                ];

        }


        if (
            isContainerMaterial
        ) {

            object.composition =
                [];

        }


        state.objects.push(
            object
        );


        selectObject(
            object.id
        );


        renderWorkspace();

        updateAllUI();


        addObservation(
            `${material.name} ajouté au laboratoire.`
        );


        announce(
            `${material.name} ajouté au laboratoire.`
        );


        saveState(false);


        return object;

    }


    /* ============================================================
       11 — RENDU DU WORKSPACE
    ============================================================ */

    function renderWorkspace() {

        if (
            !workspaceObjects
        ) {

            return;

        }


        workspaceObjects.innerHTML =
            "";


        state.objects.forEach(
            object => {

                const element =
                    document.createElement(
                        "div"
                    );


                element.className =
                    "chem-object";


                element.dataset.objectId =
                    object.id;


                element.dataset.materialId =
                    object.materialId;


                element.tabIndex =
                    0;


                if (
                    object.selected
                ) {

                    element.classList.add(
                        "selected"
                    );

                }


                if (
                    object.heated
                ) {

                    element.classList.add(
                        "heated"
                    );

                }


                if (
                    object.mixed
                ) {

                    element.classList.add(
                        "mixed"
                    );

                }


                if (
                    object.reaction?.active
                ) {

                    element.classList.add(
                        "reacting"
                    );

                }


                element.style.left =
                    `${object.x}px`;


                element.style.top =
                    `${object.y}px`;


                element.style.width =
                    `${object.width}px`;


                element.style.minHeight =
                    `${object.height}px`;


                const quantity =
                    calculateObjectVolume(
                        object
                    );


                const mass =
                    calculateObjectMass(
                        object
                    );


                element.innerHTML = `

                    <div class="chem-object-glow"></div>

                    <div class="chem-object-icon">
                        ${object.icon}
                    </div>

                    <div class="chem-object-name">
                        ${escapeHTML(object.name)}
                    </div>

                    <div class="chem-object-state">
                        ${escapeHTML(object.state)}
                    </div>

                    ${
                        quantity > 0
                            ? `
                                <div class="chem-object-quantity">
                                    ${formatNumber(quantity)} mL
                                </div>
                              `
                            : ""
                    }

                    ${
                        mass > 0 &&
                        isSolidObject(object)
                            ? `
                                <div class="chem-object-quantity">
                                    ${formatNumber(mass)} g
                                </div>
                              `
                            : ""
                    }

                    ${
                        object.reaction?.active
                            ? `
                                <div class="chem-object-heat">
                                    ⚗
                                </div>
                              `
                            : ""
                    }

                    ${
                        object.heated
                            ? `
                                <div class="chem-object-heat">
                                    ♨
                                </div>
                              `
                            : ""
                    }

                    <div class="chem-object-drag-handle">
                        ⠿
                    </div>

                `;


                workspaceObjects.appendChild(
                    element
                );

            }
        );


        updateDropZone();

    }


    function updateDropZone() {

        if (
            !workspaceDropZone
        ) {

            return;

        }


        workspaceDropZone.classList.toggle(
            "has-objects",
            state.objects.length >
                0
        );

    }


    /* ============================================================
       12 — SÉLECTION
    ============================================================ */

    function selectObject(
        objectId
    ) {

        const object =
            getObject(
                objectId
            );


        if (
            !object
        ) {

            return;

        }


        state.objects.forEach(
            item => {

                item.selected =
                    item.id ===
                    objectId;

            }
        );


        state.selectedMaterialId =
            objectId;


        renderWorkspace();

        updateInspector();


        announce(
            `${object.name} sélectionné.`
        );

    }


    function clearSelection() {

        state.objects.forEach(
            object =>
                object.selected =
                    false
        );


        state.selectedMaterialId =
            null;


        updateInspector();

        renderWorkspace();

    }


    /* ============================================================
       13 — DRAG / MOVE
    ============================================================ */

    function setupObjectDragging() {

        if (
            !workspaceObjects
        ) {

            return;

        }


        workspaceObjects.addEventListener(
            "pointerdown",
            handleObjectPointerDown
        );


        document.addEventListener(
            "pointermove",
            handleObjectPointerMove
        );


        document.addEventListener(
            "pointerup",
            handleObjectPointerUp
        );


        document.addEventListener(
            "pointercancel",
            handleObjectPointerUp
        );

    }


    function handleObjectPointerDown(
        event
    ) {

        const objectElement =
            event.target.closest(
                ".chem-object"
            );


        if (
            !objectElement
        ) {

            return;

        }


        const objectId =
            objectElement.dataset.objectId;


        const object =
            getObject(
                objectId
            );


        if (
            !object
        ) {

            return;

        }


        if (
            event.target.closest(
                "button"
            ) ||
            event.target.closest(
                "input"
            ) ||
            event.target.closest(
                "select"
            )
        ) {

            return;

        }


        event.preventDefault();


        selectObject(
            objectId
        );


        /*
         * Les outils chimiques déclenchent leur action
         * directement sur l'objet touché.
         */
        if (
            state.activeTool !==
                "select" &&
            state.activeTool !==
                "move"
        ) {

            executeToolOnObject(
                state.activeTool,
                object
            );


            return;

        }


        const canvasRect =
            chemistryCanvas.getBoundingClientRect();


        const scale =
            getCanvasScale();


        const pointerX =
            (
                event.clientX -
                canvasRect.left
            ) /
            scale;


        const pointerY =
            (
                event.clientY -
                canvasRect.top
            ) /
            scale;


        /*
         * Select = sélection simple.
         * Move = déplacement.
         *
         * Pour conserver la possibilité historique de déplacer
         * directement un objet, Select permet également le drag
         * si le mouvement démarre réellement.
         */
        state.drag.active =
            true;

        state.drag.objectId =
            objectId;

        state.drag.pointerId =
            event.pointerId;

        state.drag.offsetX =
            pointerX -
            object.x;

        state.drag.offsetY =
            pointerY -
            object.y;

        state.drag.originalX =
            object.x;

        state.drag.originalY =
            object.y;


        objectElement.classList.add(
            "dragging"
        );


        objectElement.style.zIndex =
            "9999";


        try {

            objectElement.setPointerCapture(
                event.pointerId
            );

        } catch (
            error
        ) {}


        chemistryCanvas.classList.add(
            "is-dragging"
        );


        announce(
            `Déplacement de ${object.name}.`
        );

    }


    function handleObjectPointerMove(
        event
    ) {

        if (
            !state.drag.active
        ) {

            return;

        }


        if (
            state.drag.pointerId !==
                null &&
            event.pointerId !==
                state.drag.pointerId
        ) {

            return;

        }


        const object =
            getObject(
                state.drag.objectId
            );


        if (
            !object
        ) {

            return;

        }


        const element =
            workspaceObjects.querySelector(
                `[data-object-id="${CSS.escape(object.id)}"]`
            );


        if (
            !element
        ) {

            return;

        }


        event.preventDefault();


        const canvasRect =
            chemistryCanvas.getBoundingClientRect();


        const scale =
            getCanvasScale();


        let x =
            (
                event.clientX -
                canvasRect.left
            ) /
                scale -
            state.drag.offsetX;


        let y =
            (
                event.clientY -
                canvasRect.top
            ) /
                scale -
            state.drag.offsetY;


        const canvasWidth =
            chemistryCanvas.clientWidth /
            scale;


        const canvasHeight =
            chemistryCanvas.clientHeight /
            scale;


        const maxX =
            Math.max(
                CHEM_CONFIG.dragPadding,
                canvasWidth -
                    object.width -
                    CHEM_CONFIG.dragPadding
            );


        const maxY =
            Math.max(
                CHEM_CONFIG.dragPadding,
                canvasHeight -
                    object.height -
                    CHEM_CONFIG.dragPadding
            );


        x =
            clamp(
                x,
                CHEM_CONFIG.dragPadding,
                maxX
            );


        y =
            clamp(
                y,
                CHEM_CONFIG.dragPadding,
                maxY
            );


        object.x =
            x;

        object.y =
            y;


        element.style.left =
            `${x}px`;

        element.style.top =
            `${y}px`;

    }


    function handleObjectPointerUp(
        event
    ) {

        if (
            !state.drag.active
        ) {

            return;

        }


        if (
            state.drag.pointerId !==
                null &&
            event.pointerId !==
                state.drag.pointerId
        ) {

            return;

        }


        const object =
            getObject(
                state.drag.objectId
            );


        const element =
            object
                ? workspaceObjects.querySelector(
                    `[data-object-id="${CSS.escape(object.id)}"]`
                  )
                : null;


        if (
            element
        ) {

            element.classList.remove(
                "dragging"
            );

            element.style.zIndex =
                "";


            try {

                element.releasePointerCapture(
                    event.pointerId
                );

            } catch (
                error
            ) {}

        }


        const moved =
            object &&
            (
                Math.abs(
                    object.x -
                    state.drag.originalX
                ) > 2 ||
                Math.abs(
                    object.y -
                    state.drag.originalY
                ) > 2
            );


        state.drag.active =
            false;

        state.drag.objectId =
            null;

        state.drag.pointerId =
            null;

        state.drag.offsetX =
            0;

        state.drag.offsetY =
            0;


        chemistryCanvas?.classList.remove(
            "is-dragging"
        );


        /*
         * Une fois le déplacement terminé, on vérifie
         * si l'objet est posé sur un récipient.
         */
        if (
            moved &&
            object
        ) {

            attemptObjectDropInteraction(
                object
            );


            addObservation(
                `${object.name} déplacé dans le laboratoire.`
            );


            announce(
                `${object.name} positionné dans le laboratoire.`
            );

        }


        saveState(false);

    }


    function attemptObjectDropInteraction(
        source
    ) {

        if (
            !source
        ) {

            return;

        }


        const target =
            findOverlappingContainer(
                source
            );


        if (
            !target
        ) {

            return;

        }


        /*
         * Un récipient sur un autre récipient n'est pas
         * automatiquement transféré.
         */
        if (
            isContainer(source)
        ) {

            return;

        }


        /*
         * Un liquide peut être déposé dans un récipient.
         */
        if (
            isLiquidObject(source)
        ) {

            const available =
                source.volume;


            if (
                available > 0
            ) {

                transferAllLiquid(
                    source,
                    target,
                    available
                );

            }


            return;

        }


        /*
         * Un solide est introduit dans le récipient.
         */
        if (
            isSolidObject(source)
        ) {

            transferSolidIntoContainer(
                source,
                target
            );

        }

    }


    function findOverlappingContainer(
        source
    ) {

        const centerX =
            source.x +
            source.width /
                2;

        const centerY =
            source.y +
            source.height /
                2;


        return state.objects.find(
            candidate => {

                if (
                    candidate.id ===
                    source.id
                ) {

                    return false;

                }


                if (
                    !isContainer(
                        candidate
                    )
                ) {

                    return false;

                }


                return (
                    centerX >=
                        candidate.x &&
                    centerX <=
                        candidate.x +
                        candidate.width &&
                    centerY >=
                        candidate.y &&
                    centerY <=
                        candidate.y +
                        candidate.height
                );

            }
        ) || null;

    }
















/* ============================================================
   14 — OUTILS
   ------------------------------------------------------------
   Connexion des outils de la barre principale.

   IMPORTANT :
   - Réagir travaille sur UN SEUL récipient sélectionné.
   - Le récipient peut contenir plusieurs composants mélangés.
   - Le moteur de réaction existant du Bloc 19 analyse
     object.composition et applique la stœchiométrie réelle.
   - Ne modifie PAS :
     • mixSelectedObject()
     • transfert
     • mesure
     • chauffage
     • déplacement
     • sélection normale
============================================================ */


function setupTools() {

    document
        .querySelectorAll(
            ".tool-button[data-tool]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();
                        event.stopPropagation();


                        const tool =
                            button.dataset.tool;


                        /*
                         * MÉLANGER
                         *
                         * Le comportement existant est conservé :
                         * si un récipient est déjà sélectionné,
                         * le mélange est exécuté immédiatement.
                         */
                        if (
                            tool ===
                            "mix"
                        ) {

                            const selected =
                                getSelectedObject();


                            if (
                                selected
                            ) {

                                setActiveTool(
                                    "mix"
                                );


                                mixSelectedObject();


                                return;

                            }


                            setActiveTool(
                                "mix"
                            );


                            return;

                        }


                        /*
                         * RÉAGIR
                         *
                         * Même principe que Mélanger :
                         * un seul récipient sélectionné,
                         * mais son contenu peut comporter plusieurs
                         * composants.
                         */
                        if (
                            tool ===
                            "react"
                        ) {

                            setActiveTool(
                                "react"
                            );


                            const selected =
                                getSelectedObject();


                            if (
                                selected
                            ) {

                                reactSelectedObject();

                            }


                            return;

                        }


                        setActiveTool(
                            tool
                        );

                    }
                );

            }
        );

}


function setActiveTool(
    tool
) {

    const allowed = [
        "select",
        "move",
        "transfer",
        "mix",
        "react",
        "measure",
        "heat"
    ];


    if (
        !allowed.includes(
            tool
        )
    ) {

        tool =
            "select";

    }


    state.activeTool =
        tool;


    document
        .querySelectorAll(
            ".tool-button[data-tool]"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.tool ===
                        tool
                );

            }
        );


    const labels = {

        select:
            "Sélection",

        move:
            "Déplacement",

        transfer:
            "Transfert",

        mix:
            "Mélange",

        react:
            "Réaction",

        measure:
            "Mesure",

        heat:
            "Chauffage"

    };


    announce(
        `Outil actif : ${
            labels[tool] ||
            tool
        }.`
    );

}


/* ============================================================
   RÉACTION D'UN SEUL RÉCIPIENT
   ------------------------------------------------------------
   Le récipient peut contenir plusieurs substances.
   La réaction est évaluée directement à partir de
   object.composition.
============================================================ */

function reactSelectedObject() {

    const object =
        getSelectedObject();


    if (
        !object
    ) {

        showToast(
            "Sélectionnez un récipient.",
            "warning"
        );

        return false;

    }


    if (
        !isContainer(
            object
        )
    ) {

        showToast(
            "La réaction s'effectue dans un récipient.",
            "warning"
        );

        return false;

    }


    ensureComposition(
        object
    );


    if (
        object.composition.length ===
        0
    ) {

        showToast(
            "Le récipient est vide.",
            "warning"
        );

        return false;

    }


    /*
     * Le moteur Bloc 19 analyse maintenant
     * tous les composants présents dans
     * CE MÊME récipient.
     */
    const result =
        evaluateCompositionReaction(
            object,
            true
        );


    if (
        result
    ) {

        renderWorkspace();

        updateAllUI();

        saveState(false);

        return true;

    }


    /*
     * Aucun couple de réactifs compatible
     * n'a été trouvé dans ce récipient.
     */
    showToast(
        "Aucune réaction compatible détectée dans ce récipient.",
        "warning"
    );


    announce(
        "Aucune réaction compatible détectée dans le récipient."
    );


    return false;

}


function executeToolOnObject(
    tool,
    object
) {

    switch (
        tool
    ) {

        case "select":

            selectObject(
                object.id
            );

            break;


        case "move":

            break;


        case "transfer":

            openTransferModal();

            break;


        case "mix":

            mixSelectedObject();

            break;


        case "react":

            reactSelectedObject();

            break;


        case "measure":

            openMeasurementModal();

            break;


        case "heat":

            heatSelectedObject();

            break;

    }

}




























    /* ============================================================
       15 — INSPECTEUR
    ============================================================ */

    function updateInspector() {

        const object =
            getSelectedObject();


        if (
            !object
        ) {

            if (
                selectedObjectType
            ) {

                selectedObjectType
                    .textContent =
                    "Aucun";

            }


            objectInspector?.classList.remove(
                "hidden"
            );

            materialProperties?.classList.add(
                "hidden"
            );

            compositionSection?.classList.add(
                "hidden"
            );

            measurementSection?.classList.add(
                "hidden"
            );

            reactionSection?.classList.add(
                "hidden"
            );

            objectActions?.classList.add(
                "hidden"
            );

            return;

        }


        selectedObjectType.textContent =
            object.name;


        objectInspector.classList.add(
            "hidden"
        );

        materialProperties.classList.remove(
            "hidden"
        );

        objectActions.classList.remove(
            "hidden"
        );


        recalculateObjectScientificState(
            object
        );


        $("propName").textContent =
            object.name;


        $("propState").textContent =
            object.state;


        $("propTemperature").textContent =
            `${formatNumber(object.temperature)} °C`;


        $("propMass").textContent =
            `${formatNumber(object.mass)} g`;


        $("propVolume").textContent =
            object.volume > 0
                ? `${formatNumber(object.volume)} mL`
                : "—";


        $("propDensity").textContent =
            Number.isFinite(
                object.density
            )
                ? `${formatNumber(object.density, 3)} g/mL`
                : "—";


        $("propPH").textContent =
            Number.isFinite(
                object.ph
            )
                ? formatNumber(
                    object.ph,
                    2
                )
                : "—";


        $("propColor").textContent =
            object.color ||
            "—";


        renderCompositionInspector(
            object
        );


        renderReactionInspector(
            object
        );

    }


    function recalculateObjectScientificState(
        object
    ) {

        if (
            isContainer(
                object
            )
        ) {

            recalculateContainer(
                object
            );

        }


        if (
            isLiquidObject(
                object
            ) ||
            isSolidObject(
                object
            )
        ) {

            const material =
                getMaterial(
                    object.materialId
                );


            if (
                material
            ) {

                object.volume =
                    Number(
                        object.volume
                    ) || 0;

                object.mass =
                    Number(
                        object.mass
                    ) || 0;

                object.density =
                    Number.isFinite(
                        Number(
                            material.density
                        )
                    )
                        ? Number(
                            material.density
                        )
                        : object.density;

            }

        }

    }


    function renderCompositionInspector(
        object
    ) {

        if (
            !compositionSection
        ) {

            return;

        }


        if (
            !object.composition ||
            !object.composition.length
        ) {

            compositionSection.classList.add(
                "hidden"
            );

            return;

        }


        compositionSection.classList.remove(
            "hidden"
        );


        /*
         * Ancien HTML utilise compositionTotal comme nombre
         * de composants. On le conserve pour compatibilité.
         */
        $("compositionTotal").textContent =
            object.composition.length;


        $("compositionList").innerHTML =
            object.composition.map(
                component => {

                    const material =
                        getMaterial(
                            component.materialId
                        );


                    const moles =
                        getComponentById(
                            object,
                            component.materialId
                        )?.moles ||
                        getCompositionMoles(
                            component
                        );


                    const molarity =
                        Number.isFinite(
                            Number(
                                component.molarity
                            )
                        )
                            ? component.molarity
                            : calculateMolarity(
                                moles,
                                object.volume
                            );


                    return `

                        <div class="composition-item">

                            <span>
                                ${escapeHTML(
                                    component.name
                                )}

                                ${
                                    material?.formula
                                        ? `
                                            <small>
                                                ${escapeHTML(
                                                    material.formula
                                                )}
                                            </small>
                                          `
                                        : ""
                                }
                            </span>

                            <strong>
                                ${
                                    Number(
                                        component.volumeMl
                                    ) > 0
                                        ? `${formatNumber(
                                            component.volumeMl
                                        )} mL`
                                        : `${formatNumber(
                                            component.mass
                                        )} g`
                                }

                                ${
                                    Number.isFinite(
                                        Number(
                                            moles
                                        )
                                    )
                                        ? `
                                            <small>
                                                n = ${formatScientific(
                                                    moles
                                                )} mol
                                            </small>
                                          `
                                        : ""
                                }

                                ${
                                    object.volume > 0 &&
                                    Number.isFinite(
                                        Number(
                                            molarity
                                        )
                                    )
                                        ? `
                                            <small>
                                                C = ${formatNumber(
                                                    molarity,
                                                    3
                                                )} mol/L
                                            </small>
                                          `
                                        : ""
                                }

                            </strong>

                        </div>

                    `;

                }
            ).join("");

    }


    function renderReactionInspector(
        object
    ) {

        const reaction =
            object.reaction;


        if (
            !reaction ||
            (
                !reaction.active &&
                reaction.status ===
                    "Aucune"
            )
        ) {

            reactionSection?.classList.add(
                "hidden"
            );

            return;

        }


        reactionSection.classList.remove(
            "hidden"
        );


        $("reactionStatus").textContent =
            reaction.status ||
            "Aucune";


        $("reactionPhase").textContent =
            reaction.phase ||
            "Stable";


        $("reactionGas").textContent =
            reaction.gas ||
            "Aucun";


        $("reactionPrecipitate").textContent =
            reaction.precipitate ||
            "Aucun";


        $("reactionColor").textContent =
            reaction.color ||
            "Inchangée";


        /*
         * On peut réutiliser reactionStatus pour
         * communiquer le réactif limitant si disponible.
         */
        if (
            reaction.limitingReagent
        ) {

            $("reactionStatus").textContent =
                `${
                    reaction.status
                } — limitant : ${
                    reaction.limitingReagent
                }`;

        }

    }


    /* ============================================================
       16 — TRANSFERT
    ============================================================ */


function openTransferModal() {

        const source =
            getSelectedObject();


        if (
            !source
        ) {

            showToast(
                "Sélectionnez d'abord un matériau.",
                "warning"
            );

            return;

        }


        /*
         * ============================================================
         * DÉTERMINATION DU TYPE DE TRANSFERT
         * ------------------------------------------------------------
         * Liquide / récipient contenant un liquide :
         * transfert volumétrique en mL.
         *
         * Solide :
         * utilisation du moteur existant
         * transferSolidIntoContainer().
         *
         * AUCUNE autre catégorie de matière n'est autorisée ici.
         * ============================================================
         */

        const sourceIsSolid =
            isSolidObject(
                source
            );


        const sourceIsLiquid =
            isLiquidObject(
                source
            );


        const sourceIsContainer =
            isContainer(
                source
            );


        if (
            !sourceIsSolid &&
            !sourceIsLiquid &&
            !sourceIsContainer
        ) {

            showToast(
                "Le transfert nécessite une matière liquide ou solide.",
                "warning"
            );

            return;

        }


        /*
         * ============================================================
         * VALIDATION DE LA MATIÈRE DISPONIBLE
         * ============================================================
         */

        if (
            sourceIsSolid
        ) {

            const solidMass =
                Number(
                    source.mass
                ) || 0;


            if (
                solidMass <= 0
            ) {

                showToast(
                    "Aucune matière solide disponible.",
                    "warning"
                );

                return;

            }

        } else {

            if (
                (
                    Number(
                        source.volume
                    ) || 0
                ) <= 0
            ) {

                showToast(
                    "Aucune matière liquide disponible.",
                    "warning"
                );

                return;

            }

        }


        const modal =
            $("transferModal");


        const targetSelect =
            $("transferTarget");


        targetSelect.innerHTML =
            "";


        /*
         * ============================================================
         * CONSTRUCTION DE LA LISTE DES DESTINATIONS
         * ------------------------------------------------------------
         * Seuls les récipients différents de la source sont proposés.
         * ============================================================
         */

        state.objects
            .filter(
                object =>
                    object.id !==
                        source.id &&
                    isContainer(
                        object
                    )
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
                        `${object.name}${
                            object.volume > 0
                                ? ` — ${formatNumber(object.volume)} mL`
                                : ""
                        }`;


                    targetSelect.appendChild(
                        option
                    );

                }
            );


        if (
            !targetSelect.options.length
        ) {

            showToast(
                "Ajoutez d'abord un récipient destination.",
                "warning"
            );

            return;

        }


        /*
         * ============================================================
         * INFORMATIONS DE LA SOURCE
         * ============================================================
         */

        $("transferSourceName").textContent =
            source.name;


        /*
         * ============================================================
         * MODE SOLIDE
         * ------------------------------------------------------------
         * On réutilise le même modal existant.
         *
         * Le bloc quantité volumétrique est masqué car le moteur
         * transferSolidIntoContainer() transfère actuellement
         * l'objet solide complet.
         * ============================================================
         */

        if (
            sourceIsSolid
        ) {

            modal.dataset.transferMode =
                "solid";


            modal.dataset.transferSourceId =
                source.id;


            $("transferSourceAmount").textContent =
                `${formatNumber(
                    Number(
                        source.mass
                    ) || 0
                )} g disponible`;


            const quantityBlock =
                modal.querySelector(
                    ".transfer-quantity"
                );


            if (
                quantityBlock
            ) {

                quantityBlock.style.display =
                    "none";

            }


            const confirmButton =
                $("confirmTransferBtn");


            if (
                confirmButton
            ) {

                confirmButton.textContent =
                    "Transférer le solide";

            }


            openModal(
                modal
            );


            return;

        }


        /*
         * ============================================================
         * MODE LIQUIDE
         * ------------------------------------------------------------
         * On conserve ici le comportement volumétrique original.
         * ============================================================
         */

        modal.dataset.transferMode =
            "liquid";


        modal.dataset.transferSourceId =
            source.id;


        const quantityBlock =
            modal.querySelector(
                ".transfer-quantity"
            );


        if (
            quantityBlock
        ) {

            quantityBlock.style.display =
                "";

        }


        const confirmButton =
            $("confirmTransferBtn");


        if (
            confirmButton
        ) {

            confirmButton.textContent =
                "Effectuer le transfert";

        }


        $("transferSourceAmount").textContent =
            `${formatNumber(
                source.volume
            )} mL disponible`;


        const max =
            Math.max(
                0,
                Number(
                    source.volume
                ) || 0
            );


        $("transferAmount").max =
            max;


        $("transferRange").max =
            max;


        const initial =
            Math.min(
                10,
                max
            );


        $("transferAmount").value =
            initial;


        $("transferRange").value =
            initial;


        $("transferMaxLabel").textContent =
            `${formatNumber(
                max
            )} mL`;


        openModal(
            modal
        );

    }


    function performTransfer() {

        const source =
            getSelectedObject();


        if (
            !source
        ) {

            return;

        }


        const target =
            getObject(
                $("transferTarget").value
            );


        if (
            !target
        ) {

            showToast(
                "Destination invalide.",
                "error"
            );

            return;

        }


        /*
         * ============================================================
         * TRANSFERT D'UN SOLIDE
         * ------------------------------------------------------------
         * IMPORTANT :
         * On utilise le moteur solide déjà présent dans le système.
         *
         * transferSolidIntoContainer() est volontairement conservé
         * sans aucune modification.
         * ============================================================
         */

        if (
            isSolidObject(
                source
            )
        ) {

            if (
                !isContainer(
                    target
                )
            ) {

                showToast(
                    "La destination doit être un récipient.",
                    "warning"
                );

                return;

            }


            const solidMass =
                Number(
                    source.mass
                ) || 0;


            if (
                solidMass <= 0
            ) {

                showToast(
                    "Aucune matière solide disponible.",
                    "warning"
                );

                return;

            }


            const transferred =
                transferSolidIntoContainer(
                    source,
                    target
                );


            if (
                !transferred
            ) {

                return;

            }


            /*
             * Le moteur solide existant effectue déjà :
             * - modification de la composition
             * - recalcul du récipient
             * - réaction éventuelle
             * - rendu
             * - mise à jour UI
             * - sauvegarde
             *
             * On ferme donc simplement le modal ici.
             */

            closeModal(
                $("transferModal")
            );


            return;

        }


        /*
         * ============================================================
         * TRANSFERT LIQUIDE
         * ------------------------------------------------------------
         * Cette partie conserve le comportement original.
         * ============================================================
         */

        let amount =
            Number(
                $("transferAmount").value
            );


        if (
            !Number.isFinite(
                amount
            ) ||
            amount <= 0
        ) {

            showToast(
                "Quantité invalide.",
                "warning"
            );

            return;

        }


        amount =
            Math.min(
                amount,
                Number(
                    source.volume
                ) || 0
            );


        if (
            amount <=
                CHEM_CONFIG.reactionTolerance
        ) {

            showToast(
                "Aucune matière liquide disponible.",
                "warning"
            );

            return;

        }


        const availableCapacity =
            target.capacity > 0
                ? target.capacity -
                    target.volume
                : Infinity;


        if (
            amount >
            availableCapacity
        ) {

            showToast(
                `Capacité insuffisante : seulement ${
                    formatNumber(
                        Math.max(
                            0,
                            availableCapacity
                        )
                    )
                } mL disponibles.`,
                "warning"
            );

            return;

        }


        const transferred =
            transferLiquid(
                source,
                target,
                amount
            );


        if (
            transferred <= 0
        ) {

            showToast(
                "Le transfert n'a pas pu être effectué.",
                "error"
            );

            return;

        }


        closeModal(
            $("transferModal")
        );


        renderWorkspace();


        updateAllUI();


        addObservation(
            `Transfert réel de ${
                formatNumber(
                    transferred
                )
            } mL de ${
                source.name
            } vers ${
                target.name
            }.`
        );


        showToast(
            "Transfert effectué.",
            "success"
        );


        saveState(false);

    }


    function transferLiquid(
        source,
        target,
        amountMl
    ) {

        if (
            !source ||
            !target ||
            amountMl <= 0
        ) {

            return 0;

        }


        if (
            !isContainer(target)
        ) {

            return 0;

        }


        const amount =
            Math.min(
                Number(
                    amountMl
                ),
                Number(
                    source.volume
                ) || 0
            );


        if (
            amount <= 0
        ) {

            return 0;

        }


        const sourceInitialVolume =
            Number(
                source.volume
            ) || 0;


        /*
         * Pour chaque composant, on transfère exactement
         * la fraction :
         *
         * quantité transférée / quantité source avant transfert
         */
        const ratio =
            sourceInitialVolume >
                0
                ? amount /
                    sourceInitialVolume
                : 0;


        ensureComposition(
            source
        );

        ensureComposition(
            target
        );


        const transferredComponents =
            [];


        source.composition.forEach(
            component => {

                const transferredVolume =
                    (
                        Number(
                            component.volumeMl
                        ) || 0
                    ) *
                    ratio;


                const transferredMass =
                    (
                        Number(
                            component.mass
                        ) || 0
                    ) *
                    ratio;


                const transferredMoles =
                    (
                        Number(
                            component.moles
                        ) || 0
                    ) *
                    ratio;


                if (
                    transferredVolume <= 0 &&
                    transferredMass <= 0 &&
                    transferredMoles <= 0
                ) {

                    return;

                }


                transferredComponents.push(
                    {
                        ...component,
                        volumeMl:
                            transferredVolume,
                        amount:
                            transferredVolume,
                        mass:
                            transferredMass,
                        moles:
                            transferredMoles
                    }
                );

            }
        );


        transferredComponents.forEach(
            component => {

                mergeComponentIntoContainer(
                    target,
                    component
                );

            }
        );


        /*
         * Retirer la même fraction de la source.
         */
        source.composition =
            source.composition
                .map(
                    component => {

                        const newComponent = {
                            ...component
                        };


                        newComponent.volumeMl =
                            Math.max(
                                0,
                                (
                                    Number(
                                        component.volumeMl
                                    ) || 0
                                ) *
                                (
                                    1 -
                                    ratio
                                )
                            );


                        newComponent.amount =
                            newComponent.volumeMl;


                        newComponent.mass =
                            Math.max(
                                0,
                                (
                                    Number(
                                        component.mass
                                    ) || 0
                                ) *
                                (
                                    1 -
                                    ratio
                                )
                            );


                        newComponent.moles =
                            Math.max(
                                0,
                                (
                                    Number(
                                        component.moles
                                    ) || 0
                                ) *
                                (
                                    1 -
                                    ratio
                                )
                            );


                        return newComponent;

                    }
                )
                .filter(
                    component =>
                        component.volumeMl >
                            CHEM_CONFIG.reactionTolerance ||
                        component.mass >
                            CHEM_CONFIG.reactionTolerance
                );


        source.volume =
            Math.max(
                0,
                sourceInitialVolume -
                    amount
            );


        recalculateLiquidObject(
            source
        );


        recalculateContainer(
            target
        );


        evaluateCompositionReaction(
            target
        );


        /*
         * Le récipient source vide redevient cohérent.
         */
        if (
            source.volume <=
                CHEM_CONFIG.reactionTolerance
        ) {

            source.volume =
                0;

            source.mass =
                0;

            source.composition =
                [];

            source.ph =
                null;

            source.state =
                "Vide";

        }


        return amount;

    }


    function transferAllLiquid(
        source,
        target,
        amount
    ) {

        if (
            !target ||
            !isContainer(
                target
            )
        ) {

            return 0;

        }


        const capacity =
            target.capacity > 0
                ? target.capacity -
                    target.volume
                : Infinity;


        const actual =
            Math.min(
                amount,
                capacity
            );


        if (
            actual <= 0
        ) {

            showToast(
                "Le récipient destination est plein.",
                "warning"
            );

            return 0;

        }


        const transferred =
            transferLiquid(
                source,
                target,
                actual
            );


        if (
            transferred > 0
        ) {

            addObservation(
                `Dépôt automatique : ${
                    formatNumber(
                        transferred
                    )
                } mL transférés vers ${
                    target.name
                }.`
            );


            renderWorkspace();

            updateAllUI();

            saveState(false);

        }


        return transferred;

    }


    function mergeComponentIntoContainer(
        target,
        incoming
    ) {

        const existing =
            target.composition.find(
                component =>
                    component.materialId ===
                    incoming.materialId
            );


        if (
            existing
        ) {

            existing.volumeMl +=
                Number(
                    incoming.volumeMl
                ) || 0;


            existing.amount =
                existing.volumeMl;


            existing.mass +=
                Number(
                    incoming.mass
                ) || 0;


            existing.moles +=
                Number(
                    incoming.moles
                ) || 0;


            existing.molarity =
                calculateMolarity(
                    existing.moles,
                    target.volume +
                        (
                            Number(
                                incoming.volumeMl
                            ) || 0
                        )
                );

        } else {

            target.composition.push(
                {
                    ...incoming,
                    amount:
                        Number(
                            incoming.volumeMl
                        ) || 0
                }
            );

        }

    }


    function recalculateLiquidObject(
        object
    ) {

        const material =
            getMaterial(
                object.materialId
            );


        if (
            !material
        ) {

            return;

        }


        object.mass =
            Math.max(
                0,
                object.volume *
                    (
                        Number(
                            material.density
                        ) || 1
                    )
            );


        object.density =
            material.density;


        object.ph =
            calculateObjectPH(
                object
            );


        object.state =
            object.volume > 0
                ? "Liquide"
                : "Vide";

    }














    /* ============================================================
       17 — TRANSFERT DES SOLIDES
    ============================================================ */

    function transferSolidIntoContainer(
        source,
        target
    ) {

        if (
            !source ||
            !target ||
            !isSolidObject(
                source
            ) ||
            !isContainer(
                target
            )
        ) {

            return false;

        }


        ensureComposition(
            source
        );

        ensureComposition(
            target
        );


        const material =
            getMaterial(
                source.materialId
            );


        if (
            !material
        ) {

            return false;

        }


        const solidMass =
            Number(
                source.mass
            ) || 0;


        const solidMoles =
            calculateMolesFromMass(
                solidMass,
                material.molarMass
            );


        const existing =
            getComponentById(
                target,
                source.materialId
            );


        if (
            existing
        ) {

            existing.mass +=
                solidMass;

            existing.moles +=
                solidMoles;

        } else {

            target.composition.push(
                {
                    materialId:
                        material.id,

                    name:
                        material.name,

                    formula:
                        material.formula,

                    amount:
                        0,

                    volumeMl:
                        0,

                    mass:
                        solidMass,

                    moles:
                        solidMoles,

                    molarity:
                        null,

                    temperature:
                        source.temperature,

                    phase:
                        "solid"
                }
            );

        }


        /*
         * Le solide est consommé dans la manipulation.
         */
        state.objects =
            state.objects.filter(
                object =>
                    object.id !==
                    source.id
            );


        state.selectedMaterialId =
            target.id;


        recalculateContainer(
            target
        );


        evaluateCompositionReaction(
            target
        );


        addObservation(
            `${
                source.name
            } introduit dans ${
                target.name
            } : ${
                formatNumber(
                    solidMass
                )
            } g.`
        );


        showToast(
            `${
                source.name
            } ajouté à ${
                target.name
            }.`,
            "success"
        );


        renderWorkspace();

        updateAllUI();

        saveState(false);


        return true;

    }














/* ============================================================
   16 — MÉLANGE
   ------------------------------------------------------------
   Correction :
   - Le bouton Mélange doit toujours exécuter son action.
   - Une erreur éventuelle du moteur de réaction ne doit plus
     bloquer le rendu, la sauvegarde ou la confirmation.
   - Ne modifie PAS la composition scientifique du récipient.
   - Ne modifie PAS recalculateContainer().
   ============================================================ */

function mixSelectedObject() {

    const object = getSelectedObject();

    if (!object) {
        showToast(
            "Sélectionnez un récipient.",
            "warning"
        );
        return;
    }

    if (!isContainer(object)) {
        showToast(
            "Le mélange s'effectue dans un récipient.",
            "warning"
        );
        return;
    }

    if (
        !object.composition ||
        !Array.isArray(object.composition) ||
        object.composition.length === 0
    ) {
        showToast(
            "Le récipient est vide.",
            "warning"
        );
        return;
    }

    /* --------------------------------------------------------
       1 — ÉTAT DE MÉLANGE
       -------------------------------------------------------- */

    object.mixed = true;

    /* --------------------------------------------------------
       2 — RECALCUL SCIENTIFIQUE
       -------------------------------------------------------- */

    recalculateContainer(object);

    /* --------------------------------------------------------
       3 — ÉVALUATION DE LA RÉACTION
       --------------------------------------------------------
       Une erreur éventuelle du moteur de réaction ne doit
       absolument pas empêcher le bouton Mélange de terminer
       son travail.
       -------------------------------------------------------- */

    try {

        if (
            typeof evaluateCompositionReaction === "function"
        ) {
            evaluateCompositionReaction(
                object,
                true
            );
        }

    } catch (error) {

        console.error(
            "FOBAS — Erreur du moteur de réaction pendant le mélange :",
            error
        );

        /*
         * Le mélange lui-même reste valide.
         * On conserve donc object.mixed = true et les
         * recalculs déjà effectués.
         */
    }

    /* --------------------------------------------------------
       4 — OBSERVATION
       -------------------------------------------------------- */

    addObservation(
        `${object.name} mélangé : ${object.composition.length} composant(s).`
    );

    /* --------------------------------------------------------
       5 — RENDU
       -------------------------------------------------------- */

    renderWorkspace();

    updateAllUI();

    /* --------------------------------------------------------
       6 — SAUVEGARDE
       -------------------------------------------------------- */

    saveState(false);

    /* --------------------------------------------------------
       7 — CONFIRMATION
       -------------------------------------------------------- */

    showToast(
        "Mélange effectué.",
        "success"
    );
}





    /* ============================================================
       19 — MOTEUR DE RÉACTION
    ============================================================ */

    function evaluateCompositionReaction(
        object,
        forcedMix = false
    ) {

        if (
            !object ||
            !isContainer(
                object
            )
        ) {

            return null;

        }


        ensureComposition(
            object
        );


        /*
         * On recherche toutes les réactions dont les réactifs
         * existent réellement dans la composition.
         */
        const possible =
            REACTIONS.filter(
                reaction =>
                    reaction.reactants.every(
                        reactant =>
                            getComponentById(
                                object,
                                reactant.materialId
                            )
                    )
            );


        if (
            !possible.length
        ) {

            return null;

        }


        /*
         * Priorité : réaction la plus spécifique.
         */
        possible.sort(
            (
                a,
                b
            ) =>
                (
                    b.priority || 0
                ) -
                (
                    a.priority || 0
                )
        );


        let reactionExecuted =
            false;


        for (
            const reaction of possible
        ) {

            const result =
                runReaction(
                    object,
                    reaction,
                    forcedMix
                );


            if (
                result?.executed
            ) {

                reactionExecuted =
                    true;

                break;

            }

        }


        if (
            reactionExecuted
        ) {

            recalculateContainer(
                object
            );


            renderWorkspace();

            updateInspector();

            saveState(false);

        }


        return reactionExecuted;

    }


    function runReaction(
        object,
        reaction,
        forcedMix = false
    ) {

        /*
         * Certaines réactions sont volontairement activées
         * dès le contact, les autres après mélange.
         */
        if (
            !forcedMix &&
            reaction.type ===
                "neutralisation"
        ) {

            /*
             * Neutralisation : contact liquide-liquide
             * suffit dans cette simulation.
             */

        }


        const availableMoles =
            {};


        reaction.reactants.forEach(
            reactant => {

                const component =
                    getComponentById(
                        object,
                        reactant.materialId
                    );


                availableMoles[
                    reactant.materialId
                ] =
                    component
                        ? getCompositionMoles(
                            component
                          )
                        : 0;

            }
        );


        let extent =
            Infinity;

        let limiting =
            null;


        reaction.reactants.forEach(
            reactant => {

                const n =
                    Number(
                        availableMoles[
                            reactant.materialId
                        ]
                    ) || 0;


                const possibleExtent =
                    n /
                    reactant.coefficient;


                if (
                    possibleExtent <
                    extent
                ) {

                    extent =
                        possibleExtent;

                    limiting =
                        reactant.materialId;

                }

            }
        );


        if (
            !Number.isFinite(
                extent
            ) ||
            extent <=
                CHEM_CONFIG.reactionTolerance
        ) {

            return {

                executed:
                    false,

                limiting:

                    limiting

            };

        }


        /*
         * On n'exécute pas une réaction infinitésimale.
         */
        extent =
            Math.max(
                0,
                extent
            );


        /*
         * Consommation stœchiométrique.
         */
        reaction.reactants.forEach(
            reactant => {

                const component =
                    getComponentById(
                        object,
                        reactant.materialId
                    );


                if (
                    !component
                ) {

                    return;

                }


                const consumed =
                    extent *
                    reactant.coefficient;


                component.moles =
                    Math.max(
                        0,
                        (
                            Number(
                                component.moles
                            ) || 0
                        ) -
                        consumed
                    );


                const material =
                    getMaterial(
                        reactant.materialId
                    );


                if (
                    material?.molarMass
                ) {

                    component.mass =
                        calculateMassFromMoles(
                            component.moles,
                            material.molarMass
                        );

                }


                if (
                    Number(
                        component.volumeMl
                    ) > 0 &&
                    Number(
                        component.moles
                    ) >= 0
                ) {

                    /*
                     * Pour les solutions, on garde le volume
                     * de solution approximativement constant.
                     */

                    component.molarity =
                        calculateMolarity(
                            component.moles,
                            object.volume
                        );

                }

            }
        );


        /*
         * Ajouter les produits.
         */
        reaction.products.forEach(
            product => {

                const producedMoles =
                    extent *
                    product.coefficient;


                const material =
                    getMaterial(
                        product.materialId
                    );


                if (
                    !material
                ) {

                    return;

                }


                const producedMass =
                    calculateMassFromMoles(
                        producedMoles,
                        material.molarMass
                    );


                const isSolid =
                    material.type ===
                        "solid";


                const existing =
                    getComponentById(
                        object,
                        product.materialId
                    );


                if (
                    existing
                ) {

                    existing.moles +=
                        producedMoles;

                    existing.mass +=
                        producedMass;

                    existing.amount =
                        existing.volumeMl;

                } else {

                    object.composition.push(
                        {
                            materialId:
                                product.materialId,

                            name:
                                material.name,

                            formula:
                                material.formula,

                            amount:
                                0,

                            volumeMl:
                                isSolid
                                    ? 0
                                    : object.volume,

                            mass:
                                producedMass,

                            moles:
                                producedMoles,

                            molarity:
                                isSolid
                                    ? null
                                    : calculateMolarity(
                                        producedMoles,
                                        object.volume
                                    ),

                            temperature:
                                object.temperature,

                            phase:
                                isSolid
                                    ? "solid"
                                    : "aqueous"

                        }
                    );

                }

            }
        );


        /*
         * Supprimer les espèces épuisées.
         */
        object.composition =
            object.composition.filter(
                component =>
                    (
                        Number(
                            component.moles
                        ) || 0
                    ) >
                        CHEM_CONFIG.reactionTolerance ||
                    (
                        Number(
                            component.mass
                        ) || 0
                    ) >
                        CHEM_CONFIG.reactionTolerance &&
                    component.phase ===
                        "solid"
            );


        /*
         * Etat de réaction.
         */
        const precipitate =
            reaction.precipitate ||
            "Aucun";


        let gas =
            reaction.gas ||
            "Aucun";


        /*
         * Exemple d'utilisation future :
         * si une réaction possède un gaz et que le produit
         * existe avec une phase gazeuse, on pourrait calculer
         * son volume par PV=nRT.
         */
        let gasVolume =
            null;


        if (
            gas !==
                "Aucun"
        ) {

            const gasProduct =
                reaction.products.find(
                    product => {

                        const material =
                            getMaterial(
                                product.materialId
                            );

                        return (
                            material &&
                            material.gas
                        );

                    }
                );


            if (
                gasProduct
            ) {

                const gasMoles =
                    extent *
                    gasProduct.coefficient;


                const temperatureK =
                    object.temperature +
                    273.15;


                gasVolume =
                    (
                        gasMoles *
                        CHEM_CONFIG.gasConstant *
                        temperatureK
                    ) /
                    CHEM_CONFIG.standardPressure;

            }

        }


        /*
         * Energie de réaction.
         */
        if (
            Number.isFinite(
                reaction.enthalpyKJPerMol
            )
        ) {

            const deltaEnergy =
                reaction.enthalpyKJPerMol *
                extent;


            state.totalEnergy +=
                deltaEnergy;


            /*
             * Modèle thermique simplifié.
             * Une réaction exothermique augmente la température.
             */
            const massKg =
                Math.max(
                    0.001,
                    (
                        object.mass ||
                        1
                    ) /
                    1000
                );


            const heatCapacity =
                4.18;


            const deltaT =
                -(
                    deltaEnergy *
                    1000
                ) /
                (
                    massKg *
                    1000 *
                    heatCapacity
                );


            if (
                Number.isFinite(
                    deltaT
                )
            ) {

                object.temperature =
                    clamp(
                        object.temperature +
                            deltaT,
                        CHEM_CONFIG.minTemperature,
                        CHEM_CONFIG.maxTemperature
                    );

            }

        }


        object.reaction = {

            active:
                true,

            status:
                reaction.name,

            phase:
                "Réaction effectuée",

            gas:
                gasVolume !== null
                    ? `${gas} — ${formatNumber(gasVolume, 2)} L`
                    : gas,

            precipitate:
                precipitate,

            color:
                reaction.color,

            equation:
                reaction.equation,

            limitingReagent:
                getMaterial(
                    limiting
                )?.name ||
                limiting,

            extentMol:
                extent

        };


        state.reaction = {
            ...object.reaction
        };


        addObservation(
            `Réaction : ${
                reaction.equation
            }. Réactif limitant : ${
                getMaterial(
                    limiting
                )?.name ||
                limiting
            }. Avancement : ${
                formatScientific(
                    extent
                )
            } mol.`
        );


        if (
            precipitate &&
            precipitate !==
                "Aucun"
        ) {

            addObservation(
                `Précipité observé : ${
                    precipitate
                }.`
            );

        }


        if (
            gas &&
            gas !==
                "Aucun"
        ) {

            addObservation(
                `Gaz produit : ${
                    gas
                }.`
            );

        }


        showToast(
            `Réaction : ${
                reaction.name
            }`,
            "success"
        );


        return {

            executed:
                true,

            reaction:
                reaction,

            extentMol:
                extent,

            limitingReagent:
                limiting,

            gasVolume:

                gasVolume,

            precipitate:
                precipitate

        };

    }


    /* ============================================================
       20 — PH
    ============================================================ */

    function calculateObjectPH(
        object
    ) {

        if (
            !object
        ) {

            return null;

        }


        /*
         * Pour un liquide pur, utiliser la valeur connue.
         */
        if (
            !isContainer(
                object
            )
        ) {

            const material =
                getMaterial(
                    object.materialId
                );


            if (
                Number.isFinite(
                    material?.ph
                )
            ) {

                return material.ph;

            }


            return null;

        }


        const volumeL =
            (
                Number(
                    object.volume
                ) || 0
            ) /
            1000;


        if (
            volumeL <= 0
        ) {

            return null;

        }


        let acidMoles =
            0;

        let baseMoles =
            0;


        const hcl =
            getComponentById(
                object,
                "hydrochloric-acid"
            );


        const naoh =
            getComponentById(
                object,
                "sodium-hydroxide"
            );


        if (
            hcl
        ) {

            acidMoles +=
                Number(
                    hcl.moles
                ) || 0;

        }


        if (
            naoh
        ) {

            baseMoles +=
                Number(
                    naoh.moles
                ) || 0;

        }


        /*
         * Neutralisation forte :
         * H+ + OH- → H2O
         */
        const neutralized =
            Math.min(
                acidMoles,
                baseMoles
            );


        acidMoles -=
            neutralized;


        baseMoles -=
            neutralized;


        /*
         * Si acide fort restant.
         */
        if (
            acidMoles >
                CHEM_CONFIG.reactionTolerance
        ) {

            const concentration =
                acidMoles /
                volumeL;


            return clamp(
                -Math.log10(
                    concentration
                ),
                0,
                14
            );

        }


        /*
         * Si base forte restante.
         */
        if (
            baseMoles >
                CHEM_CONFIG.reactionTolerance
        ) {

            const concentration =
                baseMoles /
                volumeL;


            const pOH =
                -Math.log10(
                    concentration
                );


            return clamp(
                14 -
                    pOH,
                0,
                14
            );

        }


        /*
         * Si sulfate de cuivre en solution :
         * approximation pédagogique faiblement acide.
         */
        const cuso4 =
            getComponentById(
                object,
                "copper-sulfate"
            );


        if (
            cuso4 &&
            Number(cuso4.moles) >
                0
        ) {

            return 4.0;

        }


        /*
         * Eau / sel neutre.
         */
        return 7;

    }


    /* ============================================================
       21 — CHAUFFAGE
    ============================================================ */

    function heatSelectedObject() {

        const object =
            getSelectedObject();


        if (
            !object
        ) {

            showToast(
                "Sélectionnez un objet à chauffer.",
                "warning"
            );

            return;

        }


        /*
         * Si on sélectionne un appareil chauffant,
         * il passe simplement à l'état actif.
         */
        if (
            object.type ===
                "heater"
        ) {

            object.heated =
                !object.heated;


            object.state =
                object.heated
                    ? "Allumé"
                    : "Éteint";


            addObservation(
                `${
                    object.name
                } ${
                    object.heated
                        ? "activé"
                        : "désactivé"
                }.`
            );


            renderWorkspace();

            updateAllUI();

            saveState(false);


            showToast(
                object.heated
                    ? "Chauffage activé."
                    : "Chauffage désactivé.",
                "success"
            );


            return;

        }


        /*
         * Un récipient vide peut quand même être chauffé.
         */
        const previousTemperature =
            Number(
                object.temperature
            ) || 25;


        const material =
            getMaterial(
                object.materialId
            );


        const thermal =
            material?.thermal ||
            {
                meltingPoint: null,
                boilingPoint: null,
                heatCapacity: 4.18
            };


        let step =
            CHEM_CONFIG.heatingStepC;


        /*
         * Les mélanges peuvent avoir une capacité thermique
         * différente ; on reste dans un modèle pédagogique.
         */
        if (
            isContainer(
                object
            )
        ) {

            step =
                20;

        }


        object.temperature =
            clamp(
                previousTemperature +
                    step,
                CHEM_CONFIG.minTemperature,
                CHEM_CONFIG.maxTemperature
            );


        object.heated =
            true;


        state.temperature =
            object.temperature;


        state.totalEnergy +=
            step;


        /*
         * Vérification des phases et évaporation.
         */
        processThermalPhaseChanges(
            object
        );


        /*
         * Une réaction dépendant de la température
         * peut être réévaluée.
         */
        if (
            isContainer(
                object
            )
        ) {

            evaluateCompositionReaction(
                object
            );

        }


        addObservation(
            `${
                object.name
            } chauffé de ${
                formatNumber(
                    previousTemperature
                )
            } °C à ${
                formatNumber(
                    object.temperature
                )
            } °C.`
        );


        renderWorkspace();

        updateAllUI();

        saveState(false);


        showToast(
            `${
                object.name
            } : ${
                formatNumber(
                    object.temperature
                )
            } °C`,
            "success"
        );

    }


    function processThermalPhaseChanges(
        object
    ) {

        if (
            !object
        ) {

            return;

        }


        if (
            !object.composition ||
            !object.composition.length
        ) {

            return;

        }


        const temperature =
            Number(
                object.temperature
            ) || 25;


        object.composition.forEach(
            component => {

                const material =
                    getMaterial(
                        component.materialId
                    );


                if (
                    !material
                ) {

                    return;

                }


                const thermal =
                    material.thermal;


                if (
                    !thermal
                ) {

                    return;

                }


                /*
                 * Eau / éthanol / liquide :
                 * évaporation progressive au-dessus du point
                 * d'ébullition.
                 */
                if (
                    Number.isFinite(
                        thermal.boilingPoint
                    ) &&
                    temperature >=
                        thermal.boilingPoint &&
                    Number(
                        component.volumeMl
                    ) > 0
                ) {

                    const evaporatedVolume =
                        component.volumeMl *
                        CHEM_CONFIG.evaporationFraction;


                    const evaporationRatio =
                        evaporatedVolume /
                        component.volumeMl;


                    component.volumeMl =
                        Math.max(
                            0,
                            component.volumeMl -
                                evaporatedVolume
                        );


                    component.amount =
                        component.volumeMl;


                    component.mass =
                        Math.max(
                            0,
                            component.mass *
                                (
                                    1 -
                                    evaporationRatio
                                )
                        );


                    component.moles =
                        Math.max(
                            0,
                            component.moles *
                                (
                                    1 -
                                    evaporationRatio
                                )
                        );


                    component.phase =
                        "vapeur partielle";


                    addObservation(
                        `${
                            material.name
                        } : évaporation partielle à ${
                            formatNumber(
                                temperature
                            )
                        } °C.`
                    );

                }


                /*
                 * Fusion simplifiée.
                 */
                if (
                    Number.isFinite(
                        thermal.meltingPoint
                    ) &&
                    temperature >=
                        thermal.meltingPoint &&
                    component.phase ===
                        "solid"
                ) {

                    component.phase =
                        "liquide";


                    addObservation(
                        `${
                            material.name
                        } : changement de phase solide → liquide.`
                    );

                }

            }
        );


        recalculateContainer(
            object
        );

    }


    /* ============================================================
       22 — MESURES
    ============================================================ */

    function openMeasurementModal() {

        const object =
            getSelectedObject();


        if (
            !object
        ) {

            showToast(
                "Sélectionnez un objet à mesurer.",
                "warning"
            );

            return;

        }


        updateMeasurement(
            "volume"
        );


        openModal(
            $("measurementModal")
        );

    }


    function getMeasurementValue(
        object,
        type
    ) {

        switch (
            type
        ) {

            case "volume":

                return {
                    label:
                        "VOLUME",

                    value:
                        formatNumber(
                            calculateObjectVolume(
                                object
                            )
                        ),

                    unit:
                        "mL",

                    precision:
                        "± 0.1 mL"
                };


            case "temperature":

                return {
                    label:
                        "TEMPÉRATURE",

                    value:
                        formatNumber(
                            object.temperature
                        ),

                    unit:
                        "°C",

                    precision:
                        "± 0.1 °C"
                };


            case "ph":

                return {
                    label:
                        "pH",

                    value:
                        Number.isFinite(
                            object.ph
                        )
                            ? formatNumber(
                                object.ph,
                                2
                            )
                            : "—",

                    unit:
                        "pH",

                    precision:
                        "± 0.01"
                };


            case "mass":

                return {
                    label:
                        "MASSE",

                    value:
                        formatNumber(
                            calculateObjectMass(
                                object
                            )
                        ),

                    unit:
                        "g",

                    precision:
                        "± 0.01 g"
                };


            case "density":

                return {
                    label:
                        "DENSITÉ",

                    value:
                        Number.isFinite(
                            calculateEffectiveDensity(
                                object
                            )
                        )
                            ? formatNumber(
                                calculateEffectiveDensity(
                                    object
                                ),
                                3
                            )
                            : "—",

                    unit:
                        "g/mL",

                    precision:
                        "± 0.001 g/mL"
                };


            default:

                return {
                    label:
                        "MESURE",

                    value:
                        "—",

                    unit:
                        "",

                    precision:
                        "—"
                };

        }

    }


    function updateMeasurement(
        type
    ) {

        const object =
            getSelectedObject();


        if (
            !object
        ) {

            return;

        }


        recalculateObjectScientificState(
            object
        );


        const measurement =
            getMeasurementValue(
                object,
                type
            );


        $("instrumentScreenLabel")
            .textContent =
            measurement.label;


        $("instrumentScreenValue")
            .textContent =
            measurement.value;


        $("instrumentScreenUnit")
            .textContent =
            measurement.unit;


        $("measurementLabel")
            .textContent =
            measurement.label;


        $("measurementValue")
            .textContent =
            measurement.value;


        $("measurementPrecision")
            .textContent =
            measurement.precision;


        measurementSection?.classList.remove(
            "hidden"
        );

    }


    /* ============================================================
       23 — ZOOM
    ============================================================ */

    function applyZoom() {

        const value =
            `${Math.round(
                state.zoom *
                    100
            )}%`;


        if (
            $("zoomValue")
        ) {

            $("zoomValue")
                .textContent =
                value;

        }


        chemistryCanvas?.style.setProperty(
            "--chem-zoom",
            state.zoom
        );


        if (
            workspaceObjects
        ) {

            workspaceObjects.style.transform =
                `scale(${state.zoom})`;

            workspaceObjects.style.transformOrigin =
                "top left";

        }


        if (
            $("workspaceGrid")
        ) {

            $("workspaceGrid").style.transform =
                `scale(${state.zoom})`;

            $("workspaceGrid").style.transformOrigin =
                "top left";

        }

    }


    function changeZoom(
        delta
    ) {

        state.zoom =
            clamp(
                state.zoom +
                    delta,
                CHEM_CONFIG.minZoom,
                CHEM_CONFIG.maxZoom
            );


        applyZoom();

        saveState(false);

    }


    function fitWorkspace() {

        const viewport =
            $("workspaceViewport");


        if (
            !viewport
        ) {

            return;

        }


        const availableWidth =
            viewport.clientWidth -
            80;


        const availableHeight =
            viewport.clientHeight -
            80;


        const scaleX =
            availableWidth /
            CHEM_CONFIG.workspaceWidth;


        const scaleY =
            availableHeight /
            CHEM_CONFIG.workspaceHeight;


        state.zoom =
            clamp(
                Math.min(
                    scaleX,
                    scaleY
                ),
                CHEM_CONFIG.minZoom,
                1
            );


        applyZoom();

        saveState(false);

    }


    /* ============================================================
       24 — BIBLIOTHÈQUE MOBILE
    ============================================================ */

    function openMaterials() {

        if (
            !materialsPanel
        ) {

            return;

        }


        materialsPanel.classList.add(
            "mobile-library-open"
        );


        materialsPanel.classList.add(
            "is-open"
        );


        $("materialsBackdrop")?.classList.add(
            "is-visible"
        );


        $("openMaterialsBtn")?.setAttribute(
            "aria-expanded",
            "true"
        );


        document.body.classList.add(
            "materials-open"
        );

    }


    function closeMaterials() {

        if (
            !materialsPanel
        ) {

            return;

        }


        materialsPanel.classList.remove(
            "mobile-library-open"
        );


        materialsPanel.classList.remove(
            "is-open"
        );


        $("materialsBackdrop")?.classList.remove(
            "is-visible"
        );


        $("openMaterialsBtn")?.setAttribute(
            "aria-expanded",
            "false"
        );


        document.body.classList.remove(
            "materials-open"
        );

    }


    function setupMobileLibrary() {

        $("openMaterialsBtn")?.addEventListener(
            "click",
            openMaterials
        );


        $("closeMaterialsBtn")?.addEventListener(
            "click",
            closeMaterials
        );


        $("materialsBackdrop")?.addEventListener(
            "click",
            closeMaterials
        );

    }


    /* ============================================================
       25 — SAUVEGARDE
    ============================================================ */

    function serializeState() {

        return {

            engineVersion:
                CHEM_CONFIG.engineVersion,

            sessionName:
                sessionName?.value ||
                state.sessionName ||
                CHEM_CONFIG.defaultSessionName,

            activeTool:
                state.activeTool,

            activeCategory:
                state.activeCategory,

            zoom:
                state.zoom,

            nextObjectNumber:
                state.nextObjectNumber,

            objects:
                state.objects,

            observations:
                state.observations,

            temperature:
                state.temperature,

            totalEnergy:
                state.totalEnergy,

            reaction:
                state.reaction

        };

    }


    function saveState(
        showMessage = true
    ) {

        try {

            localStorage.setItem(
                CHEM_CONFIG.storageKey,
                JSON.stringify(
                    serializeState()
                )
            );


            if (
                showMessage
            ) {

                showToast(
                    "Session enregistrée.",
                    "success"
                );

            }

        } catch (
            error
        ) {

            console.error(
                "FOBAS Chemistry Save Error:",
                error
            );


            if (
                showMessage
            ) {

                showToast(
                    "Impossible d'enregistrer la session.",
                    "error"
                );

            }

        }

    }


    /* ============================================================
       26 — RESTAURATION / MIGRATION
    ============================================================ */

    function normalizeLoadedObject(
        raw
    ) {

        if (
            !raw ||
            !raw.id
        ) {

            return null;

        }


        const material =
            getMaterial(
                raw.materialId
            );


        if (
            !material
        ) {

            return null;

        }


        const object = {

            ...raw,

            materialId:
                material.id,

            name:
                raw.name ||
                material.name,

            category:
                raw.category ||
                material.category,

            type:
                raw.type ||
                material.type,

            icon:
                raw.icon ||
                material.icon,

            state:
                raw.state ||
                material.state,

            volume:
                Number(
                    raw.volume
                ) || 0,

            capacity:
                Number(
                    raw.capacity
                ) ||
                Number(
                    material.capacity
                ) ||
                0,

            mass:
                Number(
                    raw.mass
                ) || 0,

            density:
                Number.isFinite(
                    Number(
                        raw.density
                    )
                )
                    ? Number(
                        raw.density
                    )
                    : material.density,

            temperature:
                Number.isFinite(
                    Number(
                        raw.temperature
                    )
                )
                    ? Number(
                        raw.temperature
                    )
                    : 25,

            ph:
                Number.isFinite(
                    Number(
                        raw.ph
                    )
                )
                    ? Number(
                        raw.ph
                    )
                    : material.ph,

            color:
                raw.color ||
                material.color,

            description:
                raw.description ||
                material.description,

            formula:
                raw.formula ||
                material.formula ||
                null,

            molarMass:
                raw.molarMass ||
                material.molarMass ||
                null,

            selected:
                !!raw.selected,

            mixed:
                !!raw.mixed,

            heated:
                !!raw.heated,

            composition:
                Array.isArray(
                    raw.composition
                )
                    ? raw.composition
                    : [],

            reaction:
                raw.reaction ||
                {
                    active:
                        false,

                    status:
                        "Aucune",

                    phase:
                        "Stable",

                    gas:
                        "Aucun",

                    precipitate:
                        "Aucun",

                    color:
                        "Inchangée",

                    equation:
                        "",

                    limitingReagent:
                        null,

                    extentMol:
                        0
                },

            products:
                Array.isArray(
                    raw.products
                )
                    ? raw.products
                    : [],

            x:
                Number.isFinite(
                    Number(raw.x)
                )
                    ? Number(raw.x)
                    : 100,

            y:
                Number.isFinite(
                    Number(raw.y)
                )
                    ? Number(raw.y)
                    : 100,

            width:
                Number(raw.width) ||
                (
                    material.type ===
                        "instrument"
                        ? 130
                        : 110
                ),

            height:
                Number(raw.height) ||
                (
                    material.type ===
                        "instrument"
                        ? 82
                        : 115
                )

        };


        /*
         * Migration des anciennes compositions.
         *
         * Ancien système :
         * amount = volume
         *
         * Nouveau système :
         * volumeMl / mass / moles.
         */
        object.composition =
            object.composition
                .map(
                    component => {

                        const componentMaterial =
                            getMaterial(
                                component.materialId
                            );


                        if (
                            !componentMaterial
                        ) {

                            return null;

                        }


                        const volumeMl =
                            Number.isFinite(
                                Number(
                                    component.volumeMl
                                )
                            )
                                ? Number(
                                    component.volumeMl
                                )
                                : Number(
                                    component.amount
                                ) || 0;


                        let mass =
                            Number(
                                component.mass
                            ) || 0;


                        if (
                            mass <= 0 &&
                            volumeMl > 0 &&
                            Number.isFinite(
                                Number(
                                    componentMaterial.density
                                )
                            )
                        ) {

                            mass =
                                volumeMl *
                                componentMaterial.density;

                        }


                        let moles =
                            Number(
                                component.moles
                            );


                        if (
                            !Number.isFinite(
                                moles
                            )
                        ) {

                            moles =
                                calculateMolesFromMass(
                                    mass,
                                    componentMaterial.molarMass
                                );

                        }


                        if (
                            Number.isFinite(
                                Number(
                                    componentMaterial.defaultMolarity
                                )
                            ) &&
                            volumeMl > 0 &&
                            (
                                !Number.isFinite(
                                    Number(
                                        component.moles
                                    )
                                )
                            )
                        ) {

                            moles =
                                componentMaterial.defaultMolarity *
                                (
                                    volumeMl /
                                    1000
                                );

                        }


                        return {

                            ...component,

                            name:
                                component.name ||
                                componentMaterial.name,

                            formula:
                                component.formula ||
                                componentMaterial.formula,

                            volumeMl:
                                volumeMl,

                            amount:
                                volumeMl,

                            mass:
                                mass,

                            moles:
                                Math.max(
                                    0,
                                    moles
                                ),

                            molarity:
                                volumeMl > 0
                                    ? calculateMolarity(
                                        moles,
                                        volumeMl
                                    )
                                    : null,

                            temperature:
                                Number(
                                    component.temperature
                                ) ||
                                object.temperature ||
                                25,

                            phase:
                                component.phase ||
                                (
                                    componentMaterial.type ===
                                        "solid"
                                        ? "solid"
                                        : "liquid"
                                )

                        };

                    }
                )
                .filter(Boolean);


        /*
         * Les anciens objets liquides avaient parfois composition
         * correcte mais masse calculée incorrectement.
         */
        if (
            isLiquidObject(
                object
            ) &&
            !isContainer(
                object
            ) &&
            !object.composition.length
        ) {

            object.composition =
                [
                    createPureComposition(
                        material,
                        object.volume,
                        object.mass
                    )
                ];

        }


        if (
            isContainer(
                object
            )
        ) {

            recalculateContainer(
                object
            );

        }


        return object;

    }


    function loadState() {

        try {

            const raw =
                localStorage.getItem(
                    CHEM_CONFIG.storageKey
                );


            if (
                !raw
            ) {

                return false;

            }


            const saved =
                JSON.parse(
                    raw
                );


            if (
                !saved
            ) {

                return false;

            }


            state.activeTool =
                saved.activeTool ||
                "select";


            state.activeCategory =
                saved.activeCategory ||
                "all";


            state.zoom =
                clamp(
                    Number(
                        saved.zoom
                    ) || 1,
                    CHEM_CONFIG.minZoom,
                    CHEM_CONFIG.maxZoom
                );


            state.nextObjectNumber =
                Number(
                    saved.nextObjectNumber
                ) || 1;


            state.objects =
                Array.isArray(
                    saved.objects
                )
                    ? saved.objects
                        .map(
                            normalizeLoadedObject
                        )
                        .filter(Boolean)
                    : [];


            state.observations =
                Array.isArray(
                    saved.observations
                )
                    ? saved.observations
                    : [];


            state.temperature =
                Number.isFinite(
                    Number(
                        saved.temperature
                    )
                )
                    ? Number(
                        saved.temperature
                    )
                    : 25;


            state.totalEnergy =
                Number(
                    saved.totalEnergy
                ) || 0;


            state.reaction =
                saved.reaction ||
                state.reaction;


            state.selectedMaterialId =
                null;


            if (
                sessionName
            ) {

                sessionName.value =
                    saved.sessionName ||
                    CHEM_CONFIG.defaultSessionName;

            }


            state.sessionName =
                sessionName?.value ||
                CHEM_CONFIG.defaultSessionName;


            renderMaterialsLibrary();

            renderCategories();

            renderWorkspace();

            applyZoom();

            renderObservationLog();

            updateAllUI();


            addObservation(
                "Session chimique restaurée."
            );


            return true;

        } catch (
            error
        ) {

            console.warn(
                "FOBAS Chemistry Load Error:",
                error
            );


            return false;

        }

    }


    /* ============================================================
       27 — RESET
    ============================================================ */

    function resetLaboratory() {

        const confirmed =
            window.confirm(
                "Voulez-vous réellement réinitialiser le laboratoire ? Tous les objets de la session actuelle seront supprimés."
            );


        if (
            !confirmed
        ) {

            return;

        }


        state.objects =
            [];

        state.selectedMaterialId =
            null;

        state.nextObjectNumber =
            1;

        state.observations =
            [];

        state.temperature =
            25;

        state.totalEnergy =
            0;

        state.reaction = {

            active:
                false,

            status:
                "Aucune",

            phase:
                "Stable",

            gas:
                "Aucun",

            precipitate:
                "Aucun",

            color:
                "Inchangée",

            equation:
                "",

            limitingReagent:
                null,

            extentMol:
                0

        };


        state.zoom =
            1;


        localStorage.removeItem(
            CHEM_CONFIG.storageKey
        );


        renderWorkspace();

        updateAllUI();

        renderObservationLog();

        applyZoom();


        addObservation(
            "Laboratoire réinitialisé."
        );


        showToast(
            "Laboratoire réinitialisé.",
            "success"
        );


        saveState(false);

    }


    function clearWorkspace() {

        if (
            !state.objects.length
        ) {

            return;

        }


        const confirmed =
            window.confirm(
                "Voulez-vous vider l'espace de manipulation ?"
            );


        if (
            !confirmed
        ) {

            return;

        }


        state.objects =
            [];

        state.selectedMaterialId =
            null;


        renderWorkspace();

        updateAllUI();


        addObservation(
            "Espace de manipulation vidé."
        );


        saveState(false);

    }


    /* ============================================================
       28 — OBSERVATION
    ============================================================ */

    function addObservation(
        message
    ) {

        const entry = {

            time:
                new Date()
                    .toLocaleTimeString(
                        "fr-FR",
                        {
                            hour:
                                "2-digit",

                            minute:
                                "2-digit",

                            second:
                                "2-digit"
                        }
                    ),

            message:
                String(
                    message
                )

        };


        state.observations.unshift(
            entry
        );


        state.observations =
            state.observations.slice(
                0,
                CHEM_CONFIG.maxObservations
            );


        renderObservationLog();

    }


    function renderObservationLog() {

        if (
            !observationLog
        ) {

            return;

        }


        if (
            !state.observations.length
        ) {

            observationLog.innerHTML = `
                <div class="chem-observation-empty">
                    Aucune observation.
                </div>
            `;

            return;

        }


        observationLog.innerHTML =
            state.observations
                .map(
                    entry => `

                <div class="chem-observation-entry">

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

                </div>

            `
                )
                .join("");

    }


    /* ============================================================
       29 — TOAST
    ============================================================ */

    function showToast(
        message,
        type = "info"
    ) {

        const stack =
            $("chemToastStack");


        if (
            !stack
        ) {

            return;

        }


        const toast =
            document.createElement(
                "div"
            );


        toast.className =
            `chem-toast ${type}`;


        toast.innerHTML = `

            <span class="chem-toast-indicator"></span>

            <span class="chem-toast-message">
                ${escapeHTML(
                    message
                )}
            </span>

        `;


        stack.appendChild(
            toast
        );


        requestAnimationFrame(
            () => {

                toast.classList.add(
                    "visible"
                );

            }
        );


        setTimeout(
            () => {

                toast.classList.remove(
                    "visible"
                );


                setTimeout(
                    () => {

                        toast.remove();

                    },
                    250
                );

            },
            3000
        );

    }


    /* ============================================================
       30 — MODALES
    ============================================================ */

    function openModal(
        modal
    ) {

        if (
            !modal
        ) {

            return;

        }


        modal.classList.add(
            "open"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "modal-open"
        );

    }


    function closeModal(
        modal
    ) {

        if (
            !modal
        ) {

            return;

        }


        modal.classList.remove(
            "open"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        const openModals =
            document.querySelectorAll(
                ".chem-modal.open"
            );


        if (
            !openModals.length
        ) {

            document.body.classList.remove(
                "modal-open"
            );

        }

    }


    function setupModals() {

        $("chemHelpBtn")?.addEventListener(
            "click",
            () =>
                openModal(
                    $("helpModal")
                )
        );


        $("closeHelpModal")?.addEventListener(
            "click",
            () =>
                closeModal(
                    $("helpModal")
                )
        );


        $("closeHelpBtn")?.addEventListener(
            "click",
            () =>
                closeModal(
                    $("helpModal")
                )
        );


        $("closeTransferModal")?.addEventListener(
            "click",
            () =>
                closeModal(
                    $("transferModal")
                )
        );


        $("cancelTransferBtn")?.addEventListener(
            "click",
            () =>
                closeModal(
                    $("transferModal")
                )
        );


        $("confirmTransferBtn")?.addEventListener(
            "click",
            performTransfer
        );


        $("closeMeasurementModal")?.addEventListener(
            "click",
            () =>
                closeModal(
                    $("measurementModal")
                )
        );


        $("closeMeasurementBtn")?.addEventListener(
            "click",
            () =>
                closeModal(
                    $("measurementModal")
                )
        );


        document
            .querySelectorAll(
                ".chem-modal .modal-backdrop"
            )
            .forEach(
                backdrop => {

                    backdrop.addEventListener(
                        "click",
                        () => {

                            const modal =
                                backdrop.closest(
                                    ".chem-modal"
                                );


                            closeModal(
                                modal
                            );

                        }
                    );

                }
            );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key !==
                    "Escape"
                ) {

                    return;

                }


                document
                    .querySelectorAll(
                        ".chem-modal.open"
                    )
                    .forEach(
                        closeModal
                    );

            }
        );

    }












/* ============================================================
   15 — ACTIONS DE L'INSPECTEUR
   ------------------------------------------------------------
   Connexion directe des boutons de l'inspecteur.
   Ne modifie PAS :
   - renderWorkspace()
   - createLabObject()
   - système Drag / Move
   - composition
   - moteur de réaction
   ============================================================ */

function setupInspectorActions() {

    const transferButton =
        $("actionTransferBtn");

    const mixButton =
        $("actionMixBtn");

    const measureButton =
        $("actionMeasureBtn");

    const heatButton =
        $("actionHeatBtn");

    const removeButton =
        $("actionRemoveBtn");


    /* --------------------------------------------------------
       TRANSFERT
       -------------------------------------------------------- */

    if (
        transferButton
    ) {

        transferButton.onclick =
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                openTransferModal();

            };

    }


/* --------------------------------------------------------
   MÉLANGE
   -------------------------------------------------------- */

if (mixButton) {

    mixButton.onclick = function(event) {

        event.preventDefault();
        event.stopPropagation();

        console.log(
            "FOBAS — Bouton Mélange cliqué"
        );

        mixSelectedObject();

    };

}







    /* --------------------------------------------------------
       MESURE
       -------------------------------------------------------- */

    if (
        measureButton
    ) {

        measureButton.onclick =
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                openMeasurementModal();

            };

    }


    /* --------------------------------------------------------
       CHAUFFAGE
       -------------------------------------------------------- */

    if (
        heatButton
    ) {

        heatButton.onclick =
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                heatSelectedObject();

            };

    }


    /* --------------------------------------------------------
       SUPPRESSION
       -------------------------------------------------------- */

    if (
        removeButton
    ) {

        removeButton.onclick =
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                removeSelectedObject();

            };

    }

}























    /* ============================================================
       32 — RECHERCHE / CATÉGORIES
    ============================================================ */

    function setupLibraryFilters() {

        materialSearch?.addEventListener(
            "input",
            event => {

                state.search =
                    event.target.value ||
                    "";


                renderMaterialsLibrary();

            }
        );


        materialCategories?.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        ".category-button"
                    );


                if (
                    !button
                ) {

                    return;

                }


                state.activeCategory =
                    button.dataset.category ||
                    "all";


                renderCategories();

                renderMaterialsLibrary();

            }
        );


        materialsLibrary?.addEventListener(
            "click",
            event => {

                const addButton =
                    event.target.closest(
                        "[data-add-material]"
                    );


                if (
                    addButton
                ) {

                    event.stopPropagation();


                    createLabObject(
                        addButton.dataset
                            .addMaterial
                    );


                    return;

                }


                const card =
                    event.target.closest(
                        ".chem-material-card"
                    );


                if (
                    !card
                ) {

                    return;

                }


                createLabObject(
                    card.dataset.materialId
                );

            }
        );


        materialsLibrary?.addEventListener(
            "keydown",
            event => {

                const card =
                    event.target.closest(
                        ".chem-material-card"
                    );


                if (
                    !card ||
                    (
                        event.key !==
                            "Enter" &&
                        event.key !==
                            " "
                    )
                ) {

                    return;

                }


                event.preventDefault();


                createLabObject(
                    card.dataset.materialId
                );

            }
        );

    }


    /* ============================================================
       33 — CANVAS
    ============================================================ */

    function setupCanvasSelection() {

        chemistryCanvas?.addEventListener(
            "pointerdown",
            event => {

                if (
                    event.target ===
                        chemistryCanvas ||
                    event.target ===
                        workspaceObjects
                ) {

                    clearSelection();

                }

            }
        );


        workspaceObjects?.addEventListener(
            "click",
            event => {

                const element =
                    event.target.closest(
                        ".chem-object"
                    );


                if (
                    !element
                ) {

                    return;

                }


                selectObject(
                    element.dataset.objectId
                );

            }
        );


        workspaceObjects?.addEventListener(
            "keydown",
            event => {

                const element =
                    event.target.closest(
                        ".chem-object"
                    );


                if (
                    !element ||
                    event.key !==
                        "Enter"
                ) {

                    return;

                }


                selectObject(
                    element.dataset.objectId
                );

            }
        );

    }


    /* ============================================================
       34 — TRANSFERT CONTROLS
    ============================================================ */

    function setupTransferControls() {

        const amount =
            $("transferAmount");


        const range =
            $("transferRange");


        range?.addEventListener(
            "input",
            () => {

                amount.value =
                    range.value;

            }
        );


        amount?.addEventListener(
            "input",
            () => {

                const max =
                    Number(
                        amount.max
                    ) || 0;


                let value =
                    Number(
                        amount.value
                    );


                if (
                    !Number.isFinite(
                        value
                    )
                ) {

                    value = 0;

                }


                value =
                    clamp(
                        value,
                        0,
                        max
                    );


                amount.value =
                    value;

                range.value =
                    value;

            }
        );

    }


    /* ============================================================
       35 — MESURES
    ============================================================ */

    function setupMeasurementControls() {

        document
            .querySelectorAll(
                ".measurement-option"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            document
                                .querySelectorAll(
                                    ".measurement-option"
                                )
                                .forEach(
                                    item => {

                                        item.classList.toggle(
                                            "active",
                                            item ===
                                                button
                                        );

                                    }
                                );


                            updateMeasurement(
                                button.dataset
                                    .measurement
                            );

                        }
                    );

                }
            );

    }


    /* ============================================================
       36 — CONTRÔLES GLOBAUX
    ============================================================ */

    function setupGlobalControls() {

        $("zoomOutBtn")?.addEventListener(
            "click",
            () =>
                changeZoom(
                    -CHEM_CONFIG.zoomStep
                )
        );


        $("zoomInBtn")?.addEventListener(
            "click",
            () =>
                changeZoom(
                    CHEM_CONFIG.zoomStep
                )
        );


        $("fitWorkspaceBtn")?.addEventListener(
            "click",
            fitWorkspace
        );


        $("clearWorkspaceBtn")?.addEventListener(
            "click",
            clearWorkspace
        );


        $("chemSaveBtn")?.addEventListener(
            "click",
            () =>
                saveState(true)
        );


        $("chemResetBtn")?.addEventListener(
            "click",
            resetLaboratory
        );


        sessionName?.addEventListener(
            "input",
            () => {

                state.sessionName =
                    sessionName.value;

                saveState(false);

            }
        );

    }


    /* ============================================================
       37 — UI GLOBALE
    ============================================================ */

    function updateAllUI() {

        if (
            $("inventoryCount")
        ) {

            $("inventoryCount")
                .textContent =
                state.objects.length;

        }


        if (
            $("statusObjects")
        ) {

            $("statusObjects")
                .textContent =
                state.objects.length;

        }


        const totalVolume =
            state.objects.reduce(
                (
                    sum,
                    object
                ) =>
                    sum +
                    (
                        Number(
                            object.volume
                        ) || 0
                    ),
                0
            );


        const totalMass =
            state.objects.reduce(
                (
                    sum,
                    object
                ) =>
                    sum +
                    (
                        Number(
                            object.mass
                        ) || 0
                    ),
                0
            );


        if (
            $("statusVolume")
        ) {

            $("statusVolume")
                .textContent =
                `${formatNumber(
                    totalVolume
                )} mL`;

        }


        if (
            $("statusMass")
        ) {

            $("statusMass")
                .textContent =
                `${formatNumber(
                    totalMass
                )} g`;

        }


        if (
            $("statusTemperature")
        ) {

            $("statusTemperature")
                .textContent =
                `${formatNumber(
                    state.temperature
                )} °C`;

        }


        const selected =
            getSelectedObject();


        if (
            $("statusPH")
        ) {

            $("statusPH")
                .textContent =
                selected &&
                Number.isFinite(
                    selected.ph
                )
                    ? formatNumber(
                        selected.ph,
                        2
                    )
                    : "—";

        }


        renderInventory();

        updateInspector();

    }


    /* ============================================================
       38 — INVENTAIRE
    ============================================================ */

    function renderInventory() {

        if (
            !inventoryList
        ) {

            return;

        }


        if (
            !state.objects.length
        ) {

            inventoryList.innerHTML = `
                <div class="chem-empty-inventory">
                    Aucun objet dans le laboratoire.
                </div>
            `;

            return;

        }


        inventoryList.innerHTML =
            state.objects.map(
                object => `

                <button
                    type="button"
                    class="chem-inventory-item ${
                        object.selected
                            ? "selected"
                            : ""
                    }"
                    data-inventory-id="${escapeHTML(
                        object.id
                    )}"
                >

                    <span class="chem-inventory-icon">
                        ${object.icon}
                    </span>

                    <span class="chem-inventory-info">

                        <strong>
                            ${escapeHTML(
                                object.name
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                object.state
                            )}
                        </small>

                    </span>

                    <span class="chem-inventory-position">
                        ${Math.round(
                            object.x
                        )},
                        ${Math.round(
                            object.y
                        )}
                    </span>

                </button>

            `
            ).join("");

    }


    function setupInventory() {

        inventoryList?.addEventListener(
            "click",
            event => {

                const item =
                    event.target.closest(
                        ".chem-inventory-item"
                    );


                if (
                    !item
                ) {

                    return;

                }


                selectObject(
                    item.dataset.inventoryId
                );


                const object =
                    getObject(
                        item.dataset
                            .inventoryId
                    );


                if (
                    object
                ) {

                    chemistryCanvas.scrollTo(
                        {
                            left:
                                Math.max(
                                    0,
                                    object.x -
                                        150
                                ),

                            top:
                                Math.max(
                                    0,
                                    object.y -
                                        120
                                ),

                            behavior:
                                "smooth"
                        }
                    );

                }

            }
        );

    }


    /* ============================================================
       39 — RACCOURCIS CLAVIER
    ============================================================ */

    function setupKeyboardShortcuts() {

        document.addEventListener(
            "keydown",
            event => {

                const tag =
                    event.target?.tagName;


                if (
                    tag ===
                        "INPUT" ||
                    tag ===
                        "TEXTAREA" ||
                    tag ===
                        "SELECT"
                ) {

                    return;

                }


                const selected =
                    getSelectedObject();


                if (
                    (
                        event.key ===
                            "Delete" ||
                        event.key ===
                            "Backspace"
                    ) &&
                    selected
                ) {

                    event.preventDefault();


                    removeSelectedObject();

                }


                if (
                    event.key ===
                        "Escape" &&
                    state.drag.active
                ) {

                    cancelDrag();

                }


                /*
                 * Raccourcis pratiques.
                 */
                const shortcuts = {

                    "1":
                        "select",

                    "2":
                        "move",

                    "3":
                        "transfer",

                    "4":
                        "mix",

                    "5":
                        "measure",

                    "6":
                        "heat"

                };


                if (
                    shortcuts[event.key]
                ) {

                    setActiveTool(
                        shortcuts[
                            event.key
                        ]
                    );

                }

            }
        );

    }


    function cancelDrag() {

        const object =
            getObject(
                state.drag.objectId
            );


        if (
            object
        ) {

            object.x =
                state.drag.originalX;

            object.y =
                state.drag.originalY;

        }


        state.drag.active =
            false;

        state.drag.objectId =
            null;

        state.drag.pointerId =
            null;

        state.drag.offsetX =
            0;

        state.drag.offsetY =
            0;


        chemistryCanvas?.classList.remove(
            "is-dragging"
        );


        workspaceObjects
            ?.querySelectorAll(
                ".chem-object.dragging"
            )
            .forEach(
                element => {

                    element.classList.remove(
                        "dragging"
                    );

                    element.style.zIndex =
                        "";

                }
            );


        renderWorkspace();

    }


    /* ============================================================
       40 — RESIZE
    ============================================================ */

    function setupResize() {

        let resizeTimer =
            null;


        window.addEventListener(
            "resize",
            () => {

                clearTimeout(
                    resizeTimer
                );


                resizeTimer =
                    setTimeout(
                        () => {

                            applyZoom();

                        },
                        120
                    );

            }
        );

    }


    /* ============================================================
       41 — ÉTAT DU LABORATOIRE
    ============================================================ */

    function setLaboratoryState(
        active = true
    ) {

        const dot =
            $("laboratoryStateDot");


        const text =
            $("laboratoryStateText");


        if (
            dot
        ) {

            dot.classList.toggle(
                "online",
                active
            );


            dot.classList.toggle(
                "offline",
                !active
            );

        }


        if (
            text
        ) {

            text.textContent =
                active
                    ? "Laboratoire actif"
                    : "Laboratoire en pause";

        }

    }


    /* ============================================================
       42 — DIAGNOSTICS SCIENTIFIQUES
    ============================================================ */

    function runScientificDiagnostics() {

        const diagnostics = {

            engine:
                CHEM_CONFIG.engineVersion,

            materialCount:
                MATERIALS.length,

            reactionCount:
                REACTIONS.length,

            objectCount:
                state.objects.length,

            selected:
                getSelectedObject()?.name ||
                null,

            conservationWarnings:
                [],

            valid:
                true

        };


        state.objects.forEach(
            object => {

                if (
                    isContainer(
                        object
                    )
                ) {

                    const compositionMass =
                        getObjectTotalCompositionMass(
                            object
                        );


                    if (
                        Math.abs(
                            compositionMass -
                            object.mass
                        ) >
                        0.05
                    ) {

                        diagnostics
                            .conservationWarnings
                            .push(
                                `${
                                    object.name
                                } : masse de composition ${
                                    formatNumber(
                                        compositionMass,
                                        3
                                    )
                                } g ≠ masse objet ${
                                    formatNumber(
                                        object.mass,
                                        3
                                    )
                                } g`
                            );

                    }

                }

            }
        );


        diagnostics.valid =
            diagnostics
                .conservationWarnings
                .length ===
                0;


        return diagnostics;

    }


    /* ============================================================
       43 — INITIALISATION
    ============================================================ */

    function initializeChemistryLaboratory() {

        if (
            !app
        ) {

            console.error(
                "FOBAS Chemistry Engine : #chemApp introuvable."
            );


            return;

        }


        /*
         * IMPORTANT :
         * Aucun système externe n'est appelé ici.
         * Le laboratoire reste totalement autonome.
         */

        setupTools();

        setupObjectDragging();

        setupCanvasSelection();

        setupLibraryFilters();

        setupInventory();

        setupInspectorActions();

        setupTransferControls();

        setupMeasurementControls();

        setupGlobalControls();

        setupMobileLibrary();

        setupModals();

        setupKeyboardShortcuts();

        setupResize();


        const restored =
            loadState();


        if (
            !restored
        ) {

            renderMaterialsLibrary();

            renderCategories();

            renderWorkspace();

            updateAllUI();

            addObservation(
                "Laboratoire chimique FOBAS initialisé."
            );

        }


        setLaboratoryState(
            true
        );


        applyZoom();


        if (
            workspaceObjects
        ) {

            workspaceObjects.style.touchAction =
                "none";

        }


        /*
         * Outil par défaut.
         */
        setActiveTool(
            state.activeTool ||
                "select"
        );


        console.log(
            "FOBAS — Laboratoire Chimique : moteur avancé actif."
        );


        console.log(
            "FOBAS — Drag / Move : actif."
        );


        console.log(
            "FOBAS — Chemistry Reaction Engine : actif."
        );


        console.log(
            "FOBAS — Scientific diagnostics :",
            runScientificDiagnostics()
        );

    }


    /* ============================================================
       44 — DÉMARRAGE
    ============================================================ */

    if (
        document.readyState ===
            "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeChemistryLaboratory,
            {
                once:
                    true
            }
        );

    } else {

        initializeChemistryLaboratory();

    }


    /* ============================================================
       45 — API PUBLIQUE
    ============================================================ */

    window.FOBASChemistryEngine = {

        /*
         * Ajouter un matériau.
         */
        addMaterial(
            materialId,
            x,
            y
        ) {

            return createLabObject(
                materialId,
                x,
                y
            );

        },


        /*
         * Sélectionner un objet.
         */
        selectObject(
            objectId
        ) {

            selectObject(
                objectId
            );

        },


        /*
         * Retirer l'objet sélectionné.
         */
        removeSelected() {

            removeSelectedObject();

        },


        /*
         * Sauvegarder.
         */
        save() {

            saveState(
                true
            );

        },


        /*
         * Réinitialiser.
         */
        reset() {

            resetLaboratory();

        },


        /*
         * Activer un outil.
         */
        setTool(
            tool
        ) {

            setActiveTool(
                tool
            );

        },


        /*
         * Mélanger.
         */
        mix() {

            mixSelectedObject();

        },


        /*
         * Chauffer.
         */
        heat() {

            heatSelectedObject();

        },


        /*
         * Mesurer.
         */
        measure(
            type = "volume"
        ) {

            updateMeasurement(
                type
            );


            const object =
                getSelectedObject();


            return object
                ? getMeasurementValue(
                    object,
                    type
                )
                : null;

        },


        /*
         * Evaluer une réaction.
         */
        evaluateReaction() {

            const object =
                getSelectedObject();


            return object
                ? evaluateCompositionReaction(
                    object,
                    true
                  )
                : null;

        },


        /*
         * Obtenir les diagnostics.
         */
        diagnostics() {

            return runScientificDiagnostics();

        },


        /*
         * Obtenir l'état complet.
         */
        getState() {

            return serializeState();

        },


        /*
         * Obtenir les matériaux publics.
         */
        getMaterials() {

            return MATERIALS.map(
                material => ({
                    id:
                        material.id,

                    name:
                        material.name,

                    formula:
                        material.formula,

                    category:
                        material.category,

                    type:
                        material.type,

                    molarMass:
                        material.molarMass,

                    density:
                        material.density
                })
            );

        },


        /*
         * Obtenir les réactions disponibles.
         */
        getReactions() {

            return REACTIONS.map(
                reaction => ({
                    id:
                        reaction.id,

                    name:
                        reaction.name,

                    equation:
                        reaction.equation,

                    type:
                        reaction.type
                })
            );

        },

        version:
            CHEM_CONFIG.engineVersion

    };

})();


