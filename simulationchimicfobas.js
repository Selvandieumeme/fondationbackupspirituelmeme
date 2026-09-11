(() => {
    "use strict";

    /*
     * ================================================================
     * FOBAS — SIMULATION CHIMIQUE
     * simulationchimicfobas.js
     * ================================================================
     *
     * Moteur autonome:
     * - Catalogue de matériaux
     * - Verrerie
     * - Réactifs
     * - Solides
     * - Instruments
     * - Équipements
     * - Transfert
     * - Mélange
     * - Réactions
     * - pH
     * - Température
     * - Masse / volume / densité
     * - Gaz / précipité / changement de couleur
     * - Chauffage
     * - Mesures
     * - Sauvegarde locale
     * - Interface tactile
     *
     * Compatible avec:
     * simulationchimicfobas.html
     * ================================================================
     */

    const APP = {};

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => [...document.querySelectorAll(selector)];

    const STORAGE_KEY = "FOBAS_CHEM_LAB_SESSION_V4";
    const SESSION_KEY = "FOBAS_CHEM_LAB_NAME_V4";

    const DEFAULT_TEMPERATURE = 25;
    const MIN_TEMPERATURE = 5;
    const MAX_SIMULATION_TEMPERATURE = 150;

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

        sessionName: "Laboratoire chimique FOBAS",

        logs: [],

        running: false,
        initialized: false,

        lastTick: Date.now()
    };

    /* ================================================================
       UTILITAIRES
       ================================================================ */

    function uid(prefix = "obj") {
        return `${prefix}_${state.nextId++}_${Date.now().toString(36)}`;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function round(value, decimals = 2) {
        const p = Math.pow(10, decimals);
        return Math.round((Number(value) || 0) * p) / p;
    }

    function nowTime() {
        return new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function hexToRgba(hex, alpha = 1) {
        if (!hex) return `rgba(180,200,220,${alpha})`;

        let h = hex.replace("#", "");

        if (h.length === 3) {
            h = h.split("").map(c => c + c).join("");
        }

        const n = parseInt(h, 16);

        if (Number.isNaN(n)) {
            return `rgba(180,200,220,${alpha})`;
        }

        return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
    }

    function getObject(id) {
        return state.objects.find(o => o.id === id) || null;
    }

    function getSelected() {
        return getObject(state.selectedId);
    }

    function isLiquidObject(obj) {
        if (!obj) return false;

        if (obj.phase === "liquid") return true;

        return Number(obj.volumeMl || 0) > 0 &&
            (
                obj.category === "reagent" ||
                obj.kind === "container"
            );
    }

    function isContainer(obj) {
        return obj && obj.kind === "container";
    }

    function isInstrument(obj) {
        return obj && obj.category === "instrument";
    }

    function totalComponentMoles(obj) {
        if (!obj || !Array.isArray(obj.components)) return 0;

        return obj.components.reduce(
            (sum, c) => sum + Number(c.moles || 0),
            0
        );
    }

    function totalComponentMass(obj) {
        if (!obj || !Array.isArray(obj.components)) return 0;

        return obj.components.reduce(
            (sum, c) => sum + Number(c.massG || 0),
            0
        );
    }

    function calculateTotalMass(obj) {
        if (!obj) return 0;

        if (obj.kind === "container") {
            return Number(obj.emptyMassG || 0) +
                totalComponentMass(obj);
        }

        if (obj.massG != null) {
            return Number(obj.massG || 0);
        }

        return totalComponentMass(obj);
    }

    function calculateDensity(obj) {
        if (!obj) return 0;

        const volume = Number(obj.volumeMl || 0);

        if (volume <= 0) {
            return Number(obj.density || 0);
        }

        const liquidMass = totalComponentMass(obj);

        if (liquidMass <= 0) {
            return Number(obj.density || 1);
        }

        return liquidMass / volume;
    }

    function totalVolume(obj) {
        if (!obj) return 0;

        if (obj.kind === "container") {
            return Number(obj.volumeMl || 0);
        }

        return Number(obj.volumeMl || 0);
    }

    /* ================================================================
       CATALOGUE DES MATÉRIAUX
       ================================================================ */

    const MATERIALS = [

        /* ------------------------------------------------------------
           VERRERIE
           ------------------------------------------------------------ */

        {
            id: "beaker50",
            name: "Bécher 50 mL",
            shortName: "Bécher 50",
            category: "glassware",
            kind: "container",
            icon: "🧪",
            formula: "",
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
            state: "vide",
            width: 90,
            height: 95,
            color: "#d9edf7"
        },

        /* ------------------------------------------------------------
           RÉACTIFS
           ------------------------------------------------------------ */

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
            defaultVolumeMl: 250,
            maxVolumeMl: 1000,
            density: 1.0,
            pH: 7.0,
            temperatureC: 25,
            color: "#bde9ff",
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
            state: "liquide",
            defaultVolumeMl: 100,
            maxVolumeMl: 500,
            density: 1.0,
            pH: 1.0,
            temperatureC: 25,
            color: "#f3f5ff",
            molarity: 0.10,
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
            density: 1.0,
            pH: 13.0,
            temperatureC: 25,
            color: "#fff5d7",
            molarity: 0.10,
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
            pH: 5.0,
            temperatureC: 25,
            color: "#2196f3",
            molarity: 0.10,
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
            density: 1.0,
            pH: 7.0,
            temperatureC: 25,
            color: "#eef7ff",
            molarity: 0.10,
            aqueousSalt: true
        },

        {
            id: "sodiumBicarbonate",
            name: "Bicarbonate de sodium",
            shortName: "NaHCO₃",
            category: "reagent",
            kind: "reagent",
            icon: "⚪",
            formula: "NaHCO₃",
            phase: "solid",
            state: "solide",
            defaultMassG: 25,
            density: 2.2,
            pH: 8.3,
            color: "#f2f2f2",
            molarMass: 84.0066,
            solid: true
        },

        {
            id: "calciumCarbonate",
            name: "Carbonate de calcium",
            shortName: "CaCO₃",
            category: "solid",
            kind: "reagent",
            icon: "⚪",
            formula: "CaCO₃",
            phase: "solid",
            state: "solide",
            defaultMassG: 25,
            density: 2.71,
            pH: 8.0,
            color: "#eeeeee",
            molarMass: 100.0869,
            solid: true
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
            density: 1.0,
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
            density: 1.0,
            pH: 7,
            temperatureC: 25,
            color: "#f5f5f5",
            indicator: true,
            phenolphthalein: true
        },

        /* ------------------------------------------------------------
           SOLIDES / MÉTAUX
           ------------------------------------------------------------ */

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
            density: 2.70,
            molarMass: 26.9815,
            color: "#cbd5e1",
            metal: true
        },

        {
            id: "saltSolid",
            name: "Chlorure de sodium solide",
            shortName: "NaCl solide",
            category: "solid",
            kind: "solid",
            icon: "🧂",
            formula: "NaCl",
            phase: "solid",
            state: "solide",
            defaultMassG: 10,
            density: 2.165,
            molarMass: 58.44,
            color: "#ffffff",
            solid: true
        },

        /* ------------------------------------------------------------
           INSTRUMENTS
           ------------------------------------------------------------ */

        {
            id: "balance",
            name: "Balance électronique",
            shortName: "Balance",
            category: "instrument",
            kind: "instrument",
            icon: "⚖️",
            state: "prête",
            width: 150,
            height: 90,
            measurementType: "mass",
            precisionMass: 0.01
        },

        {
            id: "thermometer",
            name: "Thermomètre",
            shortName: "Thermomètre",
            category: "instrument",
            kind: "instrument",
            icon: "🌡️",
            state: "prêt",
            width: 65,
            height: 170,
            measurementType: "temperature",
            precisionTemperature: 0.1
        },

        {
            id: "phMeter",
            name: "pH-mètre",
            shortName: "pH-mètre",
            category: "instrument",
            kind: "instrument",
            icon: "📟",
            state: "prêt",
            width: 130,
            height: 95,
            measurementType: "ph",
            precisionPH: 0.01
        },

        {
            id: "magneticStirrer",
            name: "Agitateur magnétique",
            shortName: "Agitateur",
            category: "instrument",
            kind: "instrument",
            icon: "🔄",
            state: "arrêté",
            width: 150,
            height: 80,
            measurementType: null
        },

        {
            id: "pipette",
            name: "Pipette graduée",
            shortName: "Pipette",
            category: "instrument",
            kind: "instrument",
            icon: "💉",
            state: "prête",
            width: 55,
            height: 180,
            measurementType: "volume",
            precisionVolume: 0.1
        },

        /* ------------------------------------------------------------
           ÉQUIPEMENTS
           ------------------------------------------------------------ */

        {
            id: "hotPlate",
            name: "Plaque chauffante",
            shortName: "Chauffe",
            category: "equipment",
            kind: "equipment",
            icon: "🔥",
            state: "arrêtée",
            width: 155,
            height: 80,
            heater: true
        },

        {
            id: "support",
            name: "Support universel",
            shortName: "Support",
            category: "equipment",
            kind: "equipment",
            icon: "🔩",
            state: "stable",
            width: 90,
            height: 190
        },

        {
            id: "clamp",
            name: "Pince de laboratoire",
            shortName: "Pince",
            category: "equipment",
            kind: "equipment",
            icon: "🗜️",
            state: "prête",
            width: 100,
            height: 75
        },

        {
            id: "spatula",
            name: "Spatule",
            shortName: "Spatule",
            category: "equipment",
            kind: "equipment",
            icon: "🥄",
            state: "propre",
            width: 115,
            height: 45
        }
    ];

    /* ================================================================
       INDEX RAPIDE
       ================================================================ */

    const MATERIAL_MAP = new Map(
        MATERIALS.map(material => [material.id, material])
    );

    /* ================================================================
       POSITIONNEMENT
       ================================================================ */

    function workspaceElement() {
        return $("#workspaceObjects") ||
            $("#chemistryCanvas") ||
            $("#workspaceDropZone");
    }

    function getWorkspaceSize() {
        const el = workspaceElement();

        return {
            width: el?.clientWidth || 1000,
            height: el?.clientHeight || 650
        };
    }

    function nextPosition() {
        const size = getWorkspaceSize();

        const index = state.objects.length;

        const column = index % 5;
        const row = Math.floor(index / 5);

        return {
            x: clamp(
                60 + column * 165,
                10,
                Math.max(10, size.width - 150)
            ),
            y: clamp(
                50 + row * 150,
                10,
                Math.max(10, size.height - 190)
            )
        };
    }

    /* ================================================================
       CRÉATION D'OBJETS
       ================================================================ */

    function createComponentsFromMaterial(material) {

        const components = [];

        if (material.kind === "reagent" &&
            material.phase === "liquid") {

            components.push({
                id: material.id,
                name: material.name,
                formula: material.formula,
                moles: 0,
                massG: 0,
                volumeMl: 0,
                concentrationM: Number(material.molarity || 0),
                density: Number(material.density || 1),
                pH: Number(material.pH ?? 7),
                phase: "liquid",
                color: material.color,
                role: material.role || "solute",
                strongAcid: !!material.strongAcid,
                strongBase: !!material.strongBase,
                acidEquivalent: Number(material.acidEquivalent || 0),
                baseEquivalent: Number(material.baseEquivalent || 0),
                indicator: !!material.indicator,
                phenolphthalein: !!material.phenolphthalein
            });

        }

        if (material.kind === "solid" ||
            (material.kind === "reagent" && material.phase === "solid")) {

            const mass = Number(material.defaultMassG || 0);
            const molarMass = Number(material.molarMass || 1);

            components.push({
                id: material.id,
                name: material.name,
                formula: material.formula,
                moles: mass / molarMass,
                massG: mass,
                volumeMl: 0,
                concentrationM: 0,
                density: Number(material.density || 1),
                pH: Number(material.pH ?? 7),
                phase: "solid",
                color: material.color,
                role: "solid",
                metal: !!material.metal
            });
        }

        return components;
    }

    function createObject(materialId, position = null) {

        const material = MATERIAL_MAP.get(materialId);

        if (!material) return null;

        const pos = position || nextPosition();

        const isContainerMaterial =
            material.kind === "container";

        const initialVolume =
            isContainerMaterial
                ? 0
                : Number(material.defaultVolumeMl || 0);

        const initialMass =
            isContainerMaterial
                ? Number(material.emptyMassG || 0)
                : Number(material.defaultMassG || 0);

        const object = {
            id: uid(material.id),

            materialId: material.id,

            name: material.name,
            shortName: material.shortName || material.name,
            formula: material.formula || "",

            kind: material.kind,
            category: material.category,

            icon: material.icon || "🧪",

            x: pos.x,
            y: pos.y,

            width: material.width || 105,
            height: material.height || 135,

            capacityMl: Number(material.capacityMl || 0),

            volumeMl: initialVolume,
            massG: initialMass,

            emptyMassG: Number(material.emptyMassG || 0),

            density: Number(material.density || 0),

            temperatureC:
                Number(material.temperatureC ?? DEFAULT_TEMPERATURE),

            pH:
                Number(material.pH ?? 7),

            color:
                material.color || "#dbeafe",

            phase:
                material.phase ||
                (isContainerMaterial ? "empty" : "liquid"),

            state:
                material.state || "stable",

            molarity:
                Number(material.molarity || 0),

            components:
                createComponentsFromMaterial(material),

            reactionState: {
                active: false,
                gas: false,
                precipitate: false,
                bubbling: false,
                phase: "stable",
                color: material.color || "#dbeafe",
                description: ""
            },

            properties: {
                strongAcid: !!material.strongAcid,
                strongBase: !!material.strongBase,
                metal: !!material.metal,
                indicator: !!material.indicator,
                phenolphthalein: !!material.phenolphthalein,
                aqueousSalt: !!material.aqueousSalt,
                solvent: material.role === "solvent"
            },

            precisionVolume:
                Number(material.precisionVolume || 0.5),

            precisionMass:
                Number(material.precisionMass || 0.01),

            precisionTemperature:
                Number(material.precisionTemperature || 0.1),

            precisionPH:
                Number(material.precisionPH || 0.01),

            heater:
                !!material.heater,

            measurementType:
                material.measurementType || null,

            createdAt: Date.now()
        };

        if (object.kind === "container") {
            object.volumeMl = 0;
            object.massG = object.emptyMassG;
            object.phase = "empty";
            object.components = [];
        }

        return object;
    }

    /* ================================================================
       AJOUT AU LABORATOIRE
       ================================================================ */

    function addMaterial(materialId, position = null) {

        const object = createObject(materialId, position);

        if (!object) {
            toast("Matériau introuvable.", "error");
            return null;
        }

        state.objects.push(object);

        selectObject(object.id);

        logObservation(
            `${object.name} a été ajouté au laboratoire.`
        );

        renderAll();

        toast(
            `${object.name} ajouté au laboratoire.`,
            "success"
        );

        return object;
    }

    /* ================================================================
       BIBLIOTHÈQUE
       ================================================================ */

    function filteredMaterials() {

        const query =
            String(state.search || "")
                .trim()
                .toLowerCase();

        return MATERIALS.filter(material => {

            const categoryOK =
                state.category === "all" ||
                material.category === state.category;

            if (!categoryOK) return false;

            if (!query) return true;

            return [
                material.name,
                material.shortName,
                material.formula,
                material.category
            ]
                .join(" ")
                .toLowerCase()
                .includes(query);
        });
    }

    function renderLibrary() {

        const library = $("#materialsLibrary");

        if (!library) return;

        const list = filteredMaterials();

        const count = $("#materialCount");

        if (count) {
            count.textContent = String(list.length);
        }

        if (!list.length) {
            library.innerHTML = `
                <div class="chem-empty-library">
                    Aucun élément trouvé.
                </div>
            `;
            return;
        }

        library.innerHTML = list.map(material => {

            const description =
                material.formula
                    ? `${material.formula} · ${material.state || ""}`
                    : material.state || "";

            return `
                <button
                    type="button"
                    class="chem-material-card"
                    data-material-id="${escapeHTML(material.id)}"
                    title="Ajouter ${escapeHTML(material.name)}"
                >
                    <span class="chem-material-icon">
                        ${escapeHTML(material.icon || "🧪")}
                    </span>

                    <span class="chem-material-info">
                        <strong>
                            ${escapeHTML(material.name)}
                        </strong>

                        <small>
                            ${escapeHTML(description)}
                        </small>
                    </span>

                    <span class="chem-material-add">
                        +
                    </span>
                </button>
            `;
        }).join("");
    }

    /* ================================================================
       INVENTAIRE
       ================================================================ */

    function renderInventory() {

        const list = $("#inventoryList");

        if (!list) return;

        const count = $("#inventoryCount");

        if (count) {
            count.textContent = String(state.objects.length);
        }

        if (!state.objects.length) {

            list.innerHTML = `
                <div class="chem-empty-inventory">
                    Aucun objet dans le laboratoire.
                </div>
            `;

            return;
        }

        list.innerHTML = state.objects.map(object => {

            const selected =
                object.id === state.selectedId
                    ? " selected"
                    : "";

            return `
                <button
                    type="button"
                    class="chem-inventory-item${selected}"
                    data-object-id="${escapeHTML(object.id)}"
                >
                    <span>
                        ${escapeHTML(object.icon || "🧪")}
                    </span>

                    <span>
                        <strong>
                            ${escapeHTML(object.name)}
                        </strong>

                        <small>
                            ${escapeHTML(
                                object.formula ||
                                object.state ||
                                object.category
                            )}
                        </small>
                    </span>
                </button>
            `;
        }).join("");
    }

    /* ================================================================
       RENDU DU LABORATOIRE
       ================================================================ */

    function renderWorkspace() {

        const workspace =
            $("#workspaceObjects") ||
            $("#chemistryCanvas");

        if (!workspace) return;

        workspace.innerHTML = state.objects.map(renderObjectHTML).join("");

        bindWorkspaceObjects();

        updateWorkspaceVisuals();
    }

    function renderObjectHTML(object) {

        const selected =
            object.id === state.selectedId
                ? " selected"
                : "";

        const hasLiquid =
            Number(object.volumeMl || 0) > 0;

        const fill =
            object.kind === "container"
                ? liquidFillPercentage(object)
                : 0;

        const color =
            object.color || "#dbeafe";

        const reaction =
            object.reactionState || {};

        const classes = [
            "chem-object",
            `chem-kind-${object.kind}`,
            `chem-category-${object.category}`,
            selected,

            hasLiquid ? "has-liquid" : "",
            reaction.active ? "reaction-active" : "",
            reaction.gas ? "is-bubbling" : "",
            reaction.precipitate ? "has-precipitate" : "",
            object.heating ? "is-heating" : ""
        ]
            .filter(Boolean)
            .join(" ");

        const liquidHTML =
            hasLiquid
                ? `
                    <div
                        class="object-liquid"
                        style="
                            height:${fill}%;
                            background:
                                linear-gradient(
                                    to top,
                                    ${hexToRgba(color, 0.82)},
                                    ${hexToRgba(color, 0.48)}
                                );
                        "
                    ></div>
                `
                : "";

        const precipitateHTML =
            reaction.precipitate
                ? `
                    <div class="object-precipitate"></div>
                `
                : "";

        const gasHTML =
            reaction.gas
                ? `
                    <div class="object-bubbles">
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                    </div>
                `
                : "";

        const label =
            object.formula
                ? `${object.shortName} (${object.formula})`
                : object.shortName;

        return `
            <div
                class="${classes}"
                data-object-id="${escapeHTML(object.id)}"
                style="
                    left:${round(object.x, 1)}px;
                    top:${round(object.y, 1)}px;
                    width:${round(object.width, 1)}px;
                    height:${round(object.height, 1)}px;
                "
                tabindex="0"
                role="button"
                aria-label="${escapeHTML(object.name)}"
            >

                <div class="object-shadow"></div>

                <div class="object-body">

                    <div class="object-liquid-wrap">
                        ${liquidHTML}
                        ${precipitateHTML}
                        ${gasHTML}
                    </div>

                    <div class="object-symbol">
                        ${escapeHTML(object.icon || "🧪")}
                    </div>

                    <div class="object-label">
                        ${escapeHTML(label)}
                    </div>

                    <div class="object-volume">
                        ${
                            hasLiquid
                                ? `${round(object.volumeMl, 1)} mL`
                                : ""
                        }
                    </div>

                    <div class="object-state">
                        ${escapeHTML(object.state || "")}
                    </div>

                </div>

                ${
                    object.heating
                        ? `<div class="object-heat-wave"></div>`
                        : ""
                }

            </div>
        `;
    }

    function liquidFillPercentage(object) {

        if (!object.capacityMl) {

            if (object.volumeMl <= 0) {
                return 0;
            }

            return 50;
        }

        return clamp(
            (object.volumeMl / object.capacityMl) * 100,
            3,
            94
        );
    }

    function updateWorkspaceVisuals() {

        const temperatureOverlay =
            $("#temperatureOverlay");

        const reactionOverlay =
            $("#reactionOverlay");

        const averageTemp =
            averageWorkspaceTemperature();

        if (temperatureOverlay) {

            const intensity =
                clamp(
                    (averageTemp - 25) / 80,
                    0,
                    1
                );

            temperatureOverlay.style.opacity =
                String(round(intensity * 0.45, 2));
        }

        if (reactionOverlay) {

            const active =
                state.objects.some(
                    object =>
                        object.reactionState?.active
                );

            reactionOverlay.classList.toggle(
                "active",
                active
            );
        }
    }

    function averageWorkspaceTemperature() {

        if (!state.objects.length) {
            return 25;
        }

        const relevant =
            state.objects.filter(
                object =>
                    Number.isFinite(object.temperatureC)
            );

        if (!relevant.length) return 25;

        return relevant.reduce(
            (sum, object) =>
                sum + object.temperatureC,
            0
        ) / relevant.length;
    }

    /* ================================================================
       SÉLECTION
       ================================================================ */

    function selectObject(id) {

        const object = getObject(id);

        if (!object) {
            state.selectedId = null;
            renderInspector();
            return;
        }

        state.selectedId = id;

        renderWorkspace();
        renderInventory();
        renderInspector();

        announce(
            `${object.name} sélectionné.`
        );
    }

    /* ================================================================
       OUTILS
       ================================================================ */

    function setTool(tool) {

        const validTools = [
            "select",
            "move",
            "transfer",
            "mix",
            "measure",
            "heat"
        ];

        if (!validTools.includes(tool)) {
            tool = "select";
        }

        state.tool = tool;

        $$(".tool-button").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.tool === tool
            );
        });

        announce(`Outil ${tool}.`);

        if (tool === "measure") {

            const selected = getSelected();

            if (selected) {
                openMeasurementModal(selected);
            } else {
                toast(
                    "Sélectionnez d'abord un objet à mesurer.",
                    "warning"
                );
            }
        }

        if (tool === "transfer") {

            const selected = getSelected();

            if (selected) {
                openTransferModal(selected);
            } else {
                toast(
                    "Sélectionnez d'abord une source.",
                    "warning"
                );
            }
        }

        if (tool === "mix") {

            const selected = getSelected();

            if (selected) {
                mixObject(selected);
            } else {
                toast(
                    "Sélectionnez un récipient.",
                    "warning"
                );
            }
        }

        if (tool === "heat") {

            const selected = getSelected();

            if (selected) {
                toggleHeating(selected);
            } else {
                toast(
                    "Sélectionnez un récipient à chauffer.",
                    "warning"
                );
            }
        }
    }

    /* ================================================================
       DÉPLACEMENT — POINTER EVENTS
       ================================================================ */

    let dragData = null;

    function bindWorkspaceObjects() {

        $$(".chem-object").forEach(element => {

            element.addEventListener(
                "pointerdown",
                onObjectPointerDown
            );

            element.addEventListener(
                "dblclick",
                onObjectDoubleClick
            );
        });
    }

    function onObjectPointerDown(event) {

        if (
            event.target.closest("button") ||
            event.target.closest("input") ||
            event.target.closest("select")
        ) {
            return;
        }

        const element =
            event.currentTarget;

        const id =
            element.dataset.objectId;

        const object =
            getObject(id);

        if (!object) return;

        selectObject(id);

        if (
            state.tool !== "move" &&
            state.tool !== "select"
        ) {
            return;
        }

        dragData = {
            id,
            startX: event.clientX,
            startY: event.clientY,
            originalX: object.x,
            originalY: object.y
        };

        try {
            element.setPointerCapture(
                event.pointerId
            );
        } catch (_) {}

        element.addEventListener(
            "pointermove",
            onObjectPointerMove
        );

        element.addEventListener(
            "pointerup",
            onObjectPointerUp,
            { once: true }
        );

        element.addEventListener(
            "pointercancel",
            onObjectPointerUp,
            { once: true }
        );
    }

    function onObjectPointerMove(event) {

        if (!dragData) return;

        const object =
            getObject(dragData.id);

        if (!object) return;

        const dx =
            (event.clientX - dragData.startX) /
            state.zoom;

        const dy =
            (event.clientY - dragData.startY) /
            state.zoom;

        const size =
            getWorkspaceSize();

        object.x =
            clamp(
                dragData.originalX + dx,
                5,
                Math.max(
                    5,
                    size.width - object.width - 5
                )
            );

        object.y =
            clamp(
                dragData.originalY + dy,
                5,
                Math.max(
                    5,
                    size.height - object.height - 5
                )
            );

        const element =
            document.querySelector(
                `[data-object-id="${CSS.escape(object.id)}"]`
            );

        if (element) {

            element.style.left =
                `${object.x}px`;

            element.style.top =
                `${object.y}px`;
        }
    }

    function onObjectPointerUp(event) {

        const element =
            event.currentTarget;

        element.removeEventListener(
            "pointermove",
            onObjectPointerMove
        );

        dragData = null;

        renderInventory();
        renderInspector();
    }

    function onObjectDoubleClick(event) {

        const id =
            event.currentTarget.dataset.objectId;

        const object =
            getObject(id);

        if (!object) return;

        selectObject(id);

        if (object.kind === "container") {
            openTransferModal(object);
        }
    }

    /* ================================================================
       TRANSFERT
       ================================================================ */

    function getTransferTargets(source) {

        return state.objects.filter(
            object =>
                object.id !== source.id &&
                object.kind === "container" &&
                Number(object.capacityMl || 0) >
                    Number(object.volumeMl || 0)
        );
    }

    function openTransferModal(source) {

        if (!source) return;

        if (
            source.kind === "solid" ||
            (
                source.kind === "reagent" &&
                source.phase === "solid"
            )
        ) {

            toast(
                "Ce matériau est solide. Le transfert liquide n'est pas disponible.",
                "warning"
            );

            return;
        }

        if (
            source.volumeMl <= 0 &&
            source.kind !== "reagent"
        ) {

            toast(
                "La source ne contient aucun liquide.",
                "warning"
            );

            return;
        }

        state.transferSourceId =
            source.id;

        const modal =
            $("#transferModal");

        if (!modal) return;

        const sourceName =
            $("#transferSourceName");

        const sourceAmount =
            $("#transferSourceAmount");

        const target =
            $("#transferTarget");

        const amount =
            $("#transferAmount");

        const range =
            $("#transferRange");

        const maxLabel =
            $("#transferMaxLabel");

        if (sourceName) {
            sourceName.textContent =
                source.name;
        }

        const maxTransfer =
            getMaximumTransfer(source);

        if (sourceAmount) {

            sourceAmount.textContent =
                `${round(source.volumeMl, 1)} mL`;
        }

        if (amount) {

            amount.value =
                String(
                    Math.min(
                        10,
                        Math.max(
                            0.1,
                            maxTransfer
                        )
                    )
                );
        }

        if (range) {

            range.min = "0.1";
            range.max = String(
                Math.max(
                    0.1,
                    maxTransfer
                )
            );

            range.step = "0.1";

            range.value = String(
                Math.min(
                    10,
                    Math.max(
                        0.1,
                        maxTransfer
                    )
                )
            );
        }

        if (maxLabel) {

            maxLabel.textContent =
                `Maximum : ${round(maxTransfer, 1)} mL`;
        }

        if (target) {

            const targets =
                getTransferTargets(source);

            target.innerHTML =
                `<option value="">Choisir un récipient...</option>` +
                targets.map(
                    item =>
                        `<option value="${escapeHTML(item.id)}">
                            ${escapeHTML(item.name)}
                            — ${round(item.volumeMl, 1)}/${round(item.capacityMl, 1)} mL
                        </option>`
                ).join("");
        }

        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
    }

    function closeTransferModal() {

        const modal =
            $("#transferModal");

        if (!modal) return;

        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");

        state.transferSourceId = null;
    }

    function getMaximumTransfer(source) {

        if (!source) return 0;

        if (source.kind === "reagent") {

            return Number(
                source.volumeMl || 0
            );
        }

        return Number(
            source.volumeMl || 0
        );
    }

    function executeTransfer() {

        const source =
            getObject(state.transferSourceId);

        if (!source) {
            closeTransferModal();
            return;
        }

        const targetId =
            $("#transferTarget")?.value;

        const target =
            getObject(targetId);

        if (!target || target.kind !== "container") {

            toast(
                "Choisissez un récipient cible.",
                "warning"
            );

            return;
        }

        const requested =
            Number(
                $("#transferAmount")?.value || 0
            );

        const maxSource =
            Number(source.volumeMl || 0);

        const freeCapacity =
            Math.max(
                0,
                Number(target.capacityMl || 0) -
                Number(target.volumeMl || 0)
            );

        const amount =
            Math.min(
                requested,
                maxSource,
                freeCapacity
            );

        if (amount <= 0) {

            toast(
                "Quantité de transfert invalide.",
                "error"
            );

            return;
        }

        transferLiquid(
            source,
            target,
            amount
        );

        closeTransferModal();

        renderAll();

        toast(
            `${round(amount, 1)} mL transférés.`,
            "success"
        );
    }

    function transferLiquid(source, target, amountMl) {

        if (!source || !target) return;

        const sourceVolume =
            Number(source.volumeMl || 0);

        if (sourceVolume <= 0) return;

        const ratio =
            clamp(
                amountMl / sourceVolume,
                0,
                1
            );

        if (
            source.components &&
            source.components.length
        ) {

            source.components.forEach(sourceComponent => {

                const movedMoles =
                    Number(sourceComponent.moles || 0) *
                    ratio;

                const movedMass =
                    Number(sourceComponent.massG || 0) *
                    ratio;

                const movedVolume =
                    Number(sourceComponent.volumeMl || 0) *
                    ratio;

                const existing =
                    target.components.find(
                        component =>
                            component.id ===
                            sourceComponent.id
                    );

                if (existing) {

                    existing.moles +=
                        movedMoles;

                    existing.massG +=
                        movedMass;

                    existing.volumeMl +=
                        movedVolume;

                } else {

                    target.components.push({
                        ...sourceComponent,
                        moles: movedMoles,
                        massG: movedMass,
                        volumeMl: movedVolume
                    });
                }
            });

        } else {

            const material =
                MATERIAL_MAP.get(
                    source.materialId
                );

            if (material) {

                const moles =
                    material.molarity
                        ? amountMl / 1000 *
                          material.molarity
                        : 0;

                target.components.push({
                    id: material.id,
                    name: material.name,
                    formula: material.formula,
                    moles,
                    massG:
                        amountMl *
                        Number(material.density || 1),
                    volumeMl: amountMl,
                    concentrationM:
                        Number(material.molarity || 0),
                    density:
                        Number(material.density || 1),
                    pH:
                        Number(material.pH ?? 7),
                    phase: "liquid",
                    color: material.color,
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
        }

        source.volumeMl =
            Math.max(
                0,
                source.volumeMl - amountMl
            );

        if (source.components) {

            source.components.forEach(component => {

                component.moles *= (1 - ratio);
                component.massG *= (1 - ratio);
                component.volumeMl *= (1 - ratio);
            });

            source.components =
                source.components.filter(
                    component =>
                        component.moles > 1e-12 ||
                        component.massG > 1e-9
                );
        }

        target.volumeMl += amountMl;

        recalculateContainer(target);
        recalculateStandaloneLiquid(source);

        logObservation(
            `${round(amountMl, 1)} mL de ${source.name} transférés vers ${target.name}.`
        );

        detectAndApplyReactions(target);
    }

    function recalculateStandaloneLiquid(object) {

        if (!object) return;

        if (object.components?.length) {

            const mass =
                totalComponentMass(object);

            if (mass > 0) {
                object.massG = mass;
            }
        }

        if (object.volumeMl <= 0) {

            object.volumeMl = 0;
            object.state = "vide";
        }
    }

    /* ================================================================
       MÉLANGE / CHIMIE
       ================================================================ */

    function mixObject(object) {

        if (!object) return;

        if (!isContainer(object)) {

            toast(
                "Le mélange nécessite un récipient.",
                "warning"
            );

            return;
        }

        if (
            !object.components?.length ||
            object.volumeMl <= 0
        ) {

            toast(
                "Le récipient ne contient pas encore de mélange.",
                "warning"
            );

            return;
        }

        object.mixing = true;

        setTimeout(() => {

            object.mixing = false;

            detectAndApplyReactions(object);

            recalculateContainer(object);

            renderAll();

        }, 350);

        logObservation(
            `${object.name} est agité/mélangé.`
        );

        toast(
            `${object.name} mélangé.`,
            "success"
        );
    }

    /* ================================================================
       MOTEUR CHIMIQUE
       ================================================================ */

    function detectAndApplyReactions(container) {

        if (!container ||
            container.kind !== "container") {
            return;
        }

        if (!container.components?.length) {
            return;
        }

        normalizeComponentAmounts(container);

        reactionNeutralization(container);

        reactionCopperZinc(container);

        reactionAcidBicarbonate(container);

        reactionAcidCarbonate(container);

        reactionCalciumCarbonatePrecipitation(container);

        updateSolutionPH(container);

        updateIndicatorColor(container);

        updateReactionVisuals(container);

        recalculateContainer(container);
    }

    function normalizeComponentAmounts(container) {

        container.components.forEach(component => {

            component.moles =
                Math.max(
                    0,
                    Number(component.moles || 0)
                );

            component.massG =
                Math.max(
                    0,
                    Number(component.massG || 0)
                );

            component.volumeMl =
                Math.max(
                    0,
                    Number(component.volumeMl || 0)
                );
        });
    }

    /* ------------------------------------------------------------
       HCl + NaOH
       ------------------------------------------------------------ */

    function reactionNeutralization(container) {

        const acid =
            findComponent(
                container,
                ["hydrochloricAcid", "HCl"]
            );

        const base =
            findComponent(
                container,
                ["sodiumHydroxide", "NaOH"]
            );

        if (!acid || !base) return;

        const acidMoles =
            Number(acid.moles || 0);

        const baseMoles =
            Number(base.moles || 0);

        const neutralized =
            Math.min(
                acidMoles,
                baseMoles
            );

        if (neutralized <= 0) return;

        acid.moles -= neutralized;
        base.moles -= neutralized;

        const water =
            findComponent(
                container,
                ["generatedWater", "H2O"]
            );

        if (water) {

            water.moles += neutralized;
            water.massG += neutralized * 18.015;
            water.volumeMl += neutralized * 18.015;

        } else {

            container.components.push({

                id: "generatedWater",

                name: "Eau formée",
                formula: "H₂O",

                moles: neutralized,

                massG:
                    neutralized * 18.015,

                volumeMl:
                    neutralized * 18.015,

                concentrationM: 0,

                density: 1,

                pH: 7,

                phase: "liquid",

                color: "#bde9ff",

                role: "product"
            });
        }

        const salt =
            findComponent(
                container,
                ["generatedNaCl", "NaCl"]
            );

        if (salt) {

            salt.moles += neutralized;

            salt.massG +=
                neutralized * 58.44;

        } else {

            container.components.push({

                id: "generatedNaCl",

                name: "Chlorure de sodium formé",

                formula: "NaCl",

                moles: neutralized,

                massG:
                    neutralized * 58.44,

                volumeMl: 0,

                concentrationM: 0,

                density: 2.165,

                pH: 7,

                phase: "dissolved",

                color: "#ffffff",

                role: "product"
            });
        }

        container.reactionState.active = true;
        container.reactionState.phase = "neutralisation";

        /*
         * Le changement thermique reste volontairement modéré
         * dans le modèle de simulation.
         */
        const thermalRise =
            clamp(
                neutralized * 20,
                0,
                8
            );

        container.temperatureC +=
            thermalRise;

        logObservation(
            `${container.name} : neutralisation HCl + NaOH détectée.`
        );
    }

    /* ------------------------------------------------------------
       CuSO4 + Zn
       ------------------------------------------------------------ */

    function reactionCopperZinc(container) {

        const copperSulfate =
            findComponent(
                container,
                ["copperSulfate", "CuSO4"]
            );

        const zinc =
            findComponent(
                container,
                ["zinc", "Zn"]
            );

        if (!copperSulfate || !zinc) return;

        if (
            copperSulfate.moles <= 0 ||
            zinc.moles <= 0
        ) {
            return;
        }

        const reacted =
            Math.min(
                copperSulfate.moles,
                zinc.moles
            );

        if (reacted <= 0) return;

        copperSulfate.moles -= reacted;
        zinc.moles -= reacted;

        copperSulfate.massG =
            Math.max(
                0,
                copperSulfate.moles *
                159.609
            );

        zinc.massG =
            Math.max(
                0,
                zinc.moles *
                65.38
            );

        let copper =
            findComponent(
                container,
                ["generatedCopper", "Cu"]
            );

        if (!copper) {

            copper = {

                id: "generatedCopper",

                name: "Cuivre formé",

                formula: "Cu",

                moles: 0,

                massG: 0,

                volumeMl: 0,

                concentrationM: 0,

                density: 8.96,

                pH: 7,

                phase: "solid",

                color: "#b87333",

                role: "precipitate",

                metal: true
            };

            container.components.push(copper);
        }

        copper.moles += reacted;

        copper.massG +=
            reacted * 63.546;

        container.reactionState.active = true;
        container.reactionState.precipitate = true;
        container.reactionState.phase = "redox";

        /*
         * La couleur bleue du CuSO4 diminue
         * avec sa consommation.
         */
        if (
            copperSulfate.moles <
            0.05
        ) {
            copperSulfate.color = "#b8d9ff";
        }

        container.temperatureC +=
            clamp(
                reacted * 8,
                0,
                5
            );

        logObservation(
            `${container.name} : réaction redox CuSO₄ + Zn → Cu + ZnSO₄ simulée.`
        );
    }

    /* ------------------------------------------------------------
       ACIDE + BICARBONATE
       ------------------------------------------------------------ */

    function reactionAcidBicarbonate(container) {

        const acid =
            findComponent(
                container,
                ["hydrochloricAcid", "HCl"]
            );

        const bicarbonate =
            findComponent(
                container,
                ["sodiumBicarbonate", "NaHCO3"]
            );

        if (!acid || !bicarbonate) return;

        if (
            acid.moles <= 0 ||
            bicarbonate.moles <= 0
        ) {
            return;
        }

        const reacted =
            Math.min(
                acid.moles,
                bicarbonate.moles
            );

        if (reacted <= 0) return;

        acid.moles -= reacted;
        bicarbonate.moles -= reacted;

        const co2 =
            findComponent(
                container,
                ["generatedCO2", "CO2"]
            );

        if (co2) {

            co2.moles += reacted;

        } else {

            container.components.push({

                id: "generatedCO2",

                name: "Dioxyde de carbone",

                formula: "CO₂",

                moles: reacted,

                massG:
                    reacted * 44.01,

                volumeMl: 0,

                concentrationM: 0,

                density: 0.00198,

                pH: 7,

                phase: "gas",

                color: "#ffffff",

                role: "gas"
            });
        }

        container.reactionState.active = true;
        container.reactionState.gas = true;
        container.reactionState.bubbling = true;
        container.reactionState.phase = "gas-evolution";

        container.temperatureC =
            Math.max(
                MIN_TEMPERATURE,
                container.temperatureC - 0.5
            );

        logObservation(
            `${container.name} : dégagement de CO₂ détecté.`
        );
    }

    /* ------------------------------------------------------------
       ACIDE + CARBONATE DE CALCIUM
       ------------------------------------------------------------ */

    function reactionAcidCarbonate(container) {

        const acid =
            findComponent(
                container,
                ["hydrochloricAcid", "HCl"]
            );

        const carbonate =
            findComponent(
                container,
                ["calciumCarbonate", "CaCO3"]
            );

        if (!acid || !carbonate) return;

        if (
            acid.moles <= 0 ||
            carbonate.moles <= 0
        ) {
            return;
        }

        /*
         * Modèle stœchiométrique simplifié:
         * CaCO3 + 2HCl → CaCl2 + CO2 + H2O
         */

        const reacted =
            Math.min(
                carbonate.moles,
                acid.moles / 2
            );

        if (reacted <= 0) return;

        carbonate.moles -= reacted;

        acid.moles -=
            reacted * 2;

        carbonate.massG =
            carbonate.moles *
            100.0869;

        const co2 =
            findComponent(
                container,
                ["generatedCO2", "CO2"]
            );

        if (co2) {

            co2.moles += reacted;
            co2.massG += reacted * 44.01;

        } else {

            container.components.push({

                id: "generatedCO2",

                name: "Dioxyde de carbone",

                formula: "CO₂",

                moles: reacted,

                massG: reacted * 44.01,

                volumeMl: 0,

                concentrationM: 0,

                density: 0.00198,

                pH: 7,

                phase: "gas",

                color: "#ffffff",

                role: "gas"
            });
        }

        const calciumChloride =
            findComponent(
                container,
                ["generatedCaCl2", "CaCl2"]
            );

        if (calciumChloride) {

            calciumChloride.moles += reacted;

        } else {

            container.components.push({

                id: "generatedCaCl2",

                name: "Chlorure de calcium formé",

                formula: "CaCl₂",

                moles: reacted,

                massG:
                    reacted * 110.98,

                volumeMl: 0,

                concentrationM: 0,

                density: 2.15,

                pH: 7,

                phase: "dissolved",

                color: "#ffffff",

                role: "product"
            });
        }

        container.reactionState.active = true;
        container.reactionState.gas = true;
        container.reactionState.bubbling = true;
        container.reactionState.phase = "carbonate-acid";

        logObservation(
            `${container.name} : carbonate + acide → dégagement de CO₂.`
        );
    }

    /* ------------------------------------------------------------
       PRÉCIPITATION CaCO3
       ------------------------------------------------------------ */

    function reactionCalciumCarbonatePrecipitation(container) {

        const calcium =
            findComponent(
                container,
                ["calciumIon", "CaCl2"]
            );

        const carbonate =
            findComponent(
                container,
                ["carbonateIon", "Na2CO3"]
            );

        /*
         * Cette règle permet aussi au moteur de gérer
         * des produits générés ou des solutions abstraites
         * contenant Ca²⁺ / CO₃²⁻.
         */

        if (!calcium || !carbonate) return;

        if (
            calcium.moles <= 0 ||
            carbonate.moles <= 0
        ) {
            return;
        }

        const precipitated =
            Math.min(
                calcium.moles,
                carbonate.moles
            );

        calcium.moles -= precipitated;
        carbonate.moles -= precipitated;

        let precipitate =
            findComponent(
                container,
                ["generatedCaCO3", "CaCO3"]
            );

        if (!precipitate) {

            precipitate = {

                id: "generatedCaCO3",

                name: "Carbonate de calcium précipité",

                formula: "CaCO₃",

                moles: 0,

                massG: 0,

                volumeMl: 0,

                concentrationM: 0,

                density: 2.71,

                pH: 8,

                phase: "solid",

                color: "#f4f4f4",

                role: "precipitate"
            };

            container.components.push(
                precipitate
            );
        }

        precipitate.moles +=
            precipitated;

        precipitate.massG +=
            precipitated *
            100.0869;

        container.reactionState.active = true;
        container.reactionState.precipitate = true;
        container.reactionState.phase = "precipitation";

        logObservation(
            `${container.name} : formation d'un précipité de CaCO₃.`
        );
    }

    function findComponent(container, ids) {

        if (!container?.components) {
            return null;
        }

        return container.components.find(
            component =>
                ids.includes(component.id) ||
                ids.includes(component.formula)
        ) || null;
    }

    /* ================================================================
       pH
       ================================================================ */

    function calculateSolutionPH(container) {

        if (!container ||
            container.volumeMl <= 0) {
            return 7;
        }

        let strongAcidMoles = 0;
        let strongBaseMoles = 0;

        let hasAcid = false;
        let hasBase = false;

        let fallbackWeighted = 0;
        let fallbackVolume = 0;

        container.components.forEach(component => {

            const moles =
                Number(component.moles || 0);

            const volume =
                Number(component.volumeMl || 0);

            if (
                component.strongAcid ||
                component.formula === "HCl"
            ) {

                strongAcidMoles +=
                    moles *
                    Number(
                        component.acidEquivalent || 1
                    );

                hasAcid = true;
            }

            if (
                component.strongBase ||
                component.formula === "NaOH"
            ) {

                strongBaseMoles +=
                    moles *
                    Number(
                        component.baseEquivalent || 1
                    );

                hasBase = true;
            }

            if (
                !component.strongAcid &&
                !component.strongBase &&
                component.phase !== "solid" &&
                component.phase !== "gas"
            ) {

                const ph =
                    Number(component.pH);

                if (
                    Number.isFinite(ph) &&
                    volume > 0
                ) {

                    fallbackWeighted +=
                        ph * volume;

                    fallbackVolume +=
                        volume;
                }
            }
        });

        const totalVolumeL =
            Math.max(
                container.volumeMl / 1000,
                1e-9
            );

        const netAcid =
            strongAcidMoles -
            strongBaseMoles;

        if (hasAcid || hasBase) {

            if (Math.abs(netAcid) < 1e-12) {
                return 7;
            }

            if (netAcid > 0) {

                const H =
                    netAcid /
                    totalVolumeL;

                return clamp(
                    -Math.log10(
                        Math.max(H, 1e-14)
                    ),
                    0,
                    14
                );
            }

            const OH =
                (-netAcid) /
                totalVolumeL;

            const pOH =
                -Math.log10(
                    Math.max(OH, 1e-14)
                );

            return clamp(
                14 - pOH,
                0,
                14
            );
        }

        if (fallbackVolume > 0) {

            return clamp(
                fallbackWeighted /
                fallbackVolume,
                0,
                14
            );
        }

        return 7;
    }

    function updateSolutionPH(container) {

        container.pH =
            round(
                calculateSolutionPH(container),
                3
            );
    }

    /* ================================================================
       INDICATEURS
       ================================================================ */

    function updateIndicatorColor(container) {

        const indicator =
            container.components.find(
                component =>
                    component.indicator ||
                    component.phenolphthalein
            );

        if (!indicator) return;

        const pH =
            Number(container.pH || 7);

        if (indicator.phenolphthalein) {

            if (pH >= 8.2) {

                indicator.color = "#f472b6";

            } else {

                indicator.color = "#f8fafc";
            }

            container.color =
                indicator.color;

            return;
        }

        /*
         * Indicateur universel — modèle de couleur
         * visuelle simplifié.
         */

        if (pH < 3) {

            container.color = "#ef4444";

        } else if (pH < 5) {

            container.color = "#f97316";

        } else if (pH < 6.5) {

            container.color = "#facc15";

        } else if (pH < 7.5) {

            container.color = "#22c55e";

        } else if (pH < 9) {

            container.color = "#38bdf8";

        } else if (pH < 11) {

            container.color = "#6366f1";

        } else {

            container.color = "#8b5cf6";
        }
    }

    /* ================================================================
       VISUELS DE RÉACTION
       ================================================================ */

    function updateReactionVisuals(container) {

        const reaction =
            container.reactionState;

        if (!reaction) return;

        const hasGas =
            container.components.some(
                component =>
                    component.phase === "gas" &&
                    Number(component.moles || 0) > 0
            );

        const hasSolid =
            container.components.some(
                component =>
                    component.phase === "solid" &&
                    component.role === "precipitate" &&
                    Number(component.massG || 0) > 0
            );

        reaction.gas =
            reaction.gas || hasGas;

        reaction.precipitate =
            reaction.precipitate || hasSolid;

        reaction.color =
            container.color;
    }

    /* ================================================================
       RECALCUL CONTENEUR
       ================================================================ */

    function recalculateContainer(container) {

        if (!container ||
            container.kind !== "container") {
            return;
        }

        container.volumeMl =
            Math.max(
                0,
                Number(container.volumeMl || 0)
            );

        container.massG =
            container.emptyMassG +
            totalComponentMass(container);

        container.density =
            container.volumeMl > 0
                ? totalComponentMass(container) /
                  container.volumeMl
                : 0;

        if (container.volumeMl <= 0) {

            container.phase = "empty";
            container.state = "vide";
            container.pH = 7;

        } else {

            const hasGas =
                container.components.some(
                    c => c.phase === "gas" &&
                        c.moles > 0
                );

            const hasSolid =
                container.components.some(
                    c => c.phase === "solid" &&
                        c.moles > 0
                );

            if (hasGas && hasSolid) {

                container.state =
                    "réaction en cours";

            } else if (hasGas) {

                container.state =
                    "dégagement gazeux";

            } else if (hasSolid) {

                container.state =
                    "suspension / précipité";

            } else {

                container.state =
                    "solution";
            }

            updateSolutionPH(container);
        }
    }

    /* ================================================================
       CHAUFFAGE
       ================================================================ */

    function toggleHeating(object) {

        if (!object) return;

        if (
            object.kind !== "container" &&
            !object.heater
        ) {

            toast(
                "Cet objet ne peut pas être chauffé directement.",
                "warning"
            );

            return;
        }

        object.heating =
            !object.heating;

        if (object.heating) {

            object.state =
                "chauffage";

            logObservation(
                `${object.name} commence à être chauffé.`
            );

            toast(
                `${object.name} en chauffage.`,
                "success"
            );

        } else {

            object.state =
                object.volumeMl > 0
                    ? "solution"
                    : "vide";

            toast(
                "Chauffage arrêté.",
                "success"
            );
        }

        renderAll();
    }

    function chemistryTick() {

        const now =
            Date.now();

        const elapsed =
            Math.min(
                5,
                Math.max(
                    0,
                    (now - state.lastTick) / 1000
                )
            );

        state.lastTick = now;

        if (!elapsed) return;

        state.objects.forEach(object => {

            if (object.heating) {

                const target =
                    object.phase === "liquid"
                        ? 95
                        : 80;

                const rate =
                    object.volumeMl > 0
                        ? 4.5
                        : 2.5;

                object.temperatureC +=
                    (target -
                        object.temperatureC) *
                    Math.min(
                        1,
                        rate *
                        elapsed /
                        60
                    );

                object.temperatureC =
                    clamp(
                        object.temperatureC,
                        MIN_TEMPERATURE,
                        MAX_SIMULATION_TEMPERATURE
                    );

                /*
                 * Modèle de changement d'état visuel
                 * pour une solution aqueuse chauffée.
                 */

                if (
                    object.volumeMl > 0 &&
                    object.temperatureC >= 100
                ) {

                    const evaporation =
                        Math.min(
                            object.volumeMl,
                            object.volumeMl *
                            0.003 *
                            elapsed
                        );

                    if (evaporation > 0) {

                        object.volumeMl -=
                            evaporation;

                        object.components.forEach(
                            component => {

                                if (
                                    component.phase ===
                                    "liquid"
                                ) {

                                    const ratio =
                                        clamp(
                                            evaporation /
                                            Math.max(
                                                object.volumeMl +
                                                evaporation,
                                                0.001
                                            ),
                                            0,
                                            1
                                        );

                                    component.volumeMl *=
                                        (1 - ratio);

                                    component.massG *=
                                        (1 - ratio);
                                }
                            }
                        );

                        object.reactionState.gas =
                            true;
                    }

                    object.state =
                        "ébullition simulée";
                }
            } else {

                /*
                 * Retour progressif vers la température ambiante.
                 */

                if (
                    Math.abs(
                        object.temperatureC -
                        DEFAULT_TEMPERATURE
                    ) > 0.05
                ) {

                    object.temperatureC +=
                        (
                            DEFAULT_TEMPERATURE -
                            object.temperatureC
                        ) *
                        Math.min(
                            1,
                            elapsed * 0.02
                        );
                }
            }

            if (object.kind === "container") {

                recalculateContainer(object);

                if (
                    object.reactionState?.gas &&
                    object.temperatureC <
                    40
                ) {

                    /*
                     * Le dégagement gazeux visuel
                     * diminue progressivement.
                     */

                    object.reactionState.gas =
                        object.components.some(
                            c =>
                                c.phase === "gas" &&
                                c.moles > 0
                        );
                }
            }
        });

        updateStatus();

        updateWorkspaceVisuals();

        updateInspectorLive();
    }

    /* ================================================================
       MESURES
       ================================================================ */

    function openMeasurementModal(object) {

        if (!object) return;

        const modal =
            $("#measurementModal");

        if (!modal) return;

        const type =
            state.measurementType ||
            "volume";

        $$(".measurement-option").forEach(
            option => {

                option.classList.toggle(
                    "active",
                    option.dataset.measurement ===
                    type
                );
            }
        );

        updateMeasurementDisplay(
            object,
            type
        );

        modal.classList.add("open");
        modal.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    function closeMeasurementModal() {

        const modal =
            $("#measurementModal");

        if (!modal) return;

        modal.classList.remove("open");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    function updateMeasurementDisplay(
        object,
        measurement
    ) {

        if (!object) return;

        state.measurementType =
            measurement;

        let value = 0;
        let unit = "";
        let label = "";
        let precision = "";

        switch (measurement) {

            case "volume":

                value =
                    totalVolume(object);

                unit = "mL";
                label = "Volume";

                precision =
                    `± ${object.precisionVolume || 0.5} mL`;

                break;

            case "temperature":

                value =
                    Number(
                        object.temperatureC ??
                        DEFAULT_TEMPERATURE
                    );

                unit = "°C";
                label = "Température";

                precision =
                    `± ${object.precisionTemperature || 0.1} °C`;

                break;

            case "ph":

                value =
                    object.kind === "container"
                        ? calculateSolutionPH(object)
                        : Number(object.pH ?? 7);

                unit = "pH";
                label = "Acidité";

                precision =
                    `± ${object.precisionPH || 0.01}`;

                break;

            case "mass":

                value =
                    calculateTotalMass(object);

                unit = "g";
                label = "Masse";

                precision =
                    `± ${object.precisionMass || 0.01} g`;

                break;

            case "density":

                value =
                    calculateDensity(object);

                unit = "g/mL";
                label = "Densité";

                precision =
                    "± 0.001 g/mL";

                break;

            default:

                value = 0;
                unit = "";
                label = "Mesure";
                precision = "";
        }

        const screenLabel =
            $("#instrumentScreenLabel");

        const screenValue =
            $("#instrumentScreenValue");

        const screenUnit =
            $("#instrumentScreenUnit");

        const measurementLabel =
            $("#measurementLabel");

        const measurementValue =
            $("#measurementValue");

        const measurementPrecision =
            $("#measurementPrecision");

        if (screenLabel) {
            screenLabel.textContent = label;
        }

        if (screenValue) {
            screenValue.textContent =
                formatMeasurementValue(
                    value,
                    measurement
                );
        }

        if (screenUnit) {
            screenUnit.textContent = unit;
        }

        if (measurementLabel) {
            measurementLabel.textContent =
                label;
        }

        if (measurementValue) {
            measurementValue.textContent =
                `${formatMeasurementValue(
                    value,
                    measurement
                )} ${unit}`;
        }

        if (measurementPrecision) {
            measurementPrecision.textContent =
                precision;
        }
    }

    function formatMeasurementValue(
        value,
        measurement
    ) {

        if (!Number.isFinite(value)) {
            return "—";
        }

        if (measurement === "ph") {
            return round(value, 2).toFixed(2);
        }

        if (measurement === "temperature") {
            return round(value, 1).toFixed(1);
        }

        if (measurement === "density") {
            return round(value, 3).toFixed(3);
        }

        if (measurement === "mass") {
            return round(value, 2).toFixed(2);
        }

        return round(value, 1).toFixed(1);
    }

    /* ================================================================
       INSPECTEUR
       ================================================================ */

    function renderInspector() {

        const object =
            getSelected();

        const type =
            $("#selectedObjectType");

        const inspector =
            $("#objectInspector");

        const materialProperties =
            $("#materialProperties");

        const compositionSection =
            $("#compositionSection");

        const measurementSection =
            $("#measurementSection");

        const reactionSection =
            $("#reactionSection");

        const objectActions =
            $("#objectActions");

        if (!object) {

            if (type) {
                type.textContent =
                    "Aucun objet sélectionné";
            }

            if (inspector) {
                inspector.innerHTML =
                    `
                    <div class="chem-inspector-empty">
                        Sélectionnez un élément du laboratoire.
                    </div>
                    `;
            }

            if (materialProperties) {
                materialProperties.hidden = true;
            }

            if (compositionSection) {
                compositionSection.hidden = true;
            }

            if (measurementSection) {
                measurementSection.hidden = true;
            }

            if (reactionSection) {
                reactionSection.hidden = true;
            }

            if (objectActions) {
                objectActions.hidden = true;
            }

            return;
        }

        if (type) {
            type.textContent =
                `${object.icon || "🧪"} ${object.name}`;
        }

        if (inspector) {

            inspector.innerHTML = `
                <div class="chem-inspector-title">
                    ${escapeHTML(object.name)}
                </div>

                <div class="chem-inspector-subtitle">
                    ${
                        escapeHTML(
                            object.formula ||
                            object.category
                        )
                    }
                </div>
            `;
        }

        if (materialProperties) {
            materialProperties.hidden = false;
        }

        setText(
            "#propName",
            object.name
        );

        setText(
            "#propState",
            object.state || object.phase || "—"
        );

        setText(
            "#propTemperature",
            `${round(object.temperatureC, 1)} °C`
        );

        setText(
            "#propMass",
            `${round(calculateTotalMass(object), 2)} g`
        );

        setText(
            "#propVolume",
            `${round(object.volumeMl || 0, 1)} mL`
        );

        setText(
            "#propDensity",
            object.volumeMl > 0
                ? `${round(calculateDensity(object), 3)} g/mL`
                : "—"
        );

        setText(
            "#propPH",
            object.kind === "container"
                ? round(calculateSolutionPH(object), 2)
                : round(object.pH ?? 7, 2)
        );

        setText(
            "#propColor",
            colorName(object.color)
        );

        if (compositionSection) {

            compositionSection.hidden =
                object.kind !== "container";

            if (object.kind === "container") {
                renderComposition(object);
            }
        }

        if (measurementSection) {
            measurementSection.hidden = false;
        }

        if (reactionSection) {

            const hasReaction =
                object.reactionState?.active ||
                object.kind === "container";

            reactionSection.hidden =
                !hasReaction;

            if (hasReaction) {
                renderReactionInfo(object);
            }
        }

        if (objectActions) {
            objectActions.hidden = false;
        }
    }

    function updateInspectorLive() {

        if (!state.selectedId) return;

        const object =
            getSelected();

        if (!object) return;

        setText(
            "#propTemperature",
            `${round(object.temperatureC, 1)} °C`
        );

        setText(
            "#propMass",
            `${round(calculateTotalMass(object), 2)} g`
        );

        setText(
            "#propVolume",
            `${round(object.volumeMl || 0, 1)} mL`
        );

        setText(
            "#propDensity",
            object.volumeMl > 0
                ? `${round(calculateDensity(object), 3)} g/mL`
                : "—"
        );

        setText(
            "#propPH",
            object.kind === "container"
                ? round(calculateSolutionPH(object), 2)
                : round(object.pH ?? 7, 2)
        );

        if (object.kind === "container") {
            renderComposition(object);
            renderReactionInfo(object);
        }
    }

    function setText(selector, value) {

        const element = $(selector);

        if (element) {
            element.textContent =
                String(value ?? "—");
        }
    }

    function renderComposition(object) {

        const list =
            $("#compositionList");

        const total =
            $("#compositionTotal");

        if (!list) return;

        if (
            !object.components ||
            !object.components.length
        ) {

            list.innerHTML =
                `<div class="chem-empty-composition">
                    Aucun composant.
                </div>`;

            if (total) {
                total.textContent =
                    "0";
            }

            return;
        }

        const entries =
            object.components.filter(
                component =>
                    Number(component.moles || 0) > 0 ||
                    Number(component.massG || 0) > 0
            );

        const totalMass =
            totalComponentMass(object);

        if (total) {
            total.textContent =
                `${round(totalMass, 3)} g`;
        }

        list.innerHTML =
            entries.map(component => `
                <div class="chem-composition-item">

                    <div>
                        <strong>
                            ${escapeHTML(
                                component.name ||
                                component.formula ||
                                component.id
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                component.formula || ""
                            )}
                        </small>
                    </div>

                    <div>
                        ${
                            component.moles
                                ? `${round(component.moles, 5)} mol`
                                : `${round(component.massG || 0, 3)} g`
                        }
                    </div>

                </div>
            `).join("");
    }

    function renderReactionInfo(object) {

        const reaction =
            object.reactionState || {};

        setText(
            "#reactionStatus",
            reaction.active
                ? "Réaction détectée"
                : "Aucune réaction active"
        );

        setText(
            "#reactionPhase",
            reaction.phase || "stable"
        );

        const gas =
            object.components?.some(
                component =>
                    component.phase === "gas" &&
                    component.moles > 0
            );

        const precipitate =
            object.components?.some(
                component =>
                    component.phase === "solid" &&
                    component.role === "precipitate" &&
                    component.massG > 0
            );

        setText(
            "#reactionGas",
            gas ? "Oui — gaz détecté" : "Non"
        );

        setText(
            "#reactionPrecipitate",
            precipitate
                ? "Oui — solide détecté"
                : "Non"
        );

        setText(
            "#reactionColor",
            colorName(object.color)
        );
    }

    function colorName(hex) {

        const names = {
            "#bde9ff": "Bleu très clair",
            "#2196f3": "Bleu",
            "#ef4444": "Rouge",
            "#f97316": "Orange",
            "#facc15": "Jaune",
            "#22c55e": "Vert",
            "#38bdf8": "Bleu cyan",
            "#6366f1": "Indigo",
            "#8b5cf6": "Violet",
            "#f472b6": "Rose",
            "#ffffff": "Blanc",
            "#f8fafc": "Incolore / clair",
            "#b87333": "Cuivre"
        };

        return names[hex] ||
            hex ||
            "Non défini";
    }

    /* ================================================================
       SUPPRESSION
       ================================================================ */

    function removeSelected() {

        const object =
            getSelected();

        if (!object) {

            toast(
                "Aucun objet sélectionné.",
                "warning"
            );

            return;
        }

        state.objects =
            state.objects.filter(
                item =>
                    item.id !== object.id
            );

        state.selectedId = null;

        logObservation(
            `${object.name} a été retiré du laboratoire.`
        );

        renderAll();

        toast(
            `${object.name} retiré.`,
            "success"
        );
    }

    /* ================================================================
       STATUT DU LABORATOIRE
       ================================================================ */

    function updateStatus() {

        setText(
            "#statusObjects",
            String(state.objects.length)
        );

        const totalVolume =
            state.objects.reduce(
                (sum, object) =>
                    sum +
                    Number(
                        object.volumeMl || 0
                    ),
                0
            );

        setText(
            "#statusVolume",
            `${round(totalVolume, 1)} mL`
        );

        const avgTemp =
            averageWorkspaceTemperature();

        setText(
            "#statusTemperature",
            `${round(avgTemp, 1)} °C`
        );

        const selected =
            getSelected();

        const ph =
            selected?.kind === "container"
                ? calculateSolutionPH(selected)
                : selected
                    ? Number(selected.pH ?? 7)
                    : 7;

        setText(
            "#statusPH",
            round(ph, 2)
        );

        const totalMass =
            state.objects.reduce(
                (sum, object) =>
                    sum +
                    calculateTotalMass(object),
                0
            );

        setText(
            "#statusMass",
            `${round(totalMass, 2)} g`
        );
    }

    /* ================================================================
       OBSERVATION / LOG
       ================================================================ */

    function logObservation(message) {

        const entry = {
            id: uid("log"),
            time: nowTime(),
            message: String(message)
        };

        state.logs.unshift(entry);

        if (state.logs.length > 100) {
            state.logs.length = 100;
        }

        renderObservationLog();

        pulseObservation();
    }

    function renderObservationLog() {

        const log =
            $("#observationLog");

        if (!log) return;

        if (!state.logs.length) {

            log.innerHTML =
                `<div class="chem-log-empty">
                    Aucune observation.
                </div>`;

            return;
        }

        log.innerHTML =
            state.logs.map(
                entry => `
                    <div class="chem-log-entry">
                        <time>
                            ${escapeHTML(entry.time)}
                        </time>

                        <span>
                            ${escapeHTML(entry.message)}
                        </span>
                    </div>
                `
            ).join("");
    }

    function pulseObservation() {

        const pulse =
            $("#observationPulse");

        if (!pulse) return;

        pulse.classList.remove("active");

        void pulse.offsetWidth;

        pulse.classList.add("active");
    }

    function announce(message) {

        const live =
            $("#chemLiveRegion");

        if (live) {
            live.textContent =
                String(message);
        }
    }

    /* ================================================================
       TOAST
       ================================================================ */

    function toast(
        message,
        type = "info"
    ) {

        const stack =
            $("#chemToastStack");

        if (!stack) return;

        const item =
            document.createElement("div");

        item.className =
            `chem-toast chem-toast-${type}`;

        item.innerHTML = `
            <span>
                ${escapeHTML(message)}
            </span>
        `;

        stack.appendChild(item);

        requestAnimationFrame(() => {
            item.classList.add("show");
        });

        setTimeout(() => {

            item.classList.remove("show");

            setTimeout(
                () => item.remove(),
                300
            );

        }, 3200);
    }

    /* ================================================================
       ZOOM
       ================================================================ */

    function setZoom(value) {

        state.zoom =
            clamp(
                Number(value) || 1,
                0.5,
                2
            );

        const workspace =
            $("#workspaceObjects") ||
            $("#chemistryCanvas");

        if (workspace) {

            workspace.style.transform =
                `scale(${state.zoom})`;

            workspace.style.transformOrigin =
                "top left";
        }

        setText(
            "#zoomValue",
            `${Math.round(state.zoom * 100)}%`
        );
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
            $("#workspaceViewport");

        const workspace =
            $("#workspaceObjects") ||
            $("#chemistryCanvas");

        if (!viewport || !workspace) return;

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

    /* ================================================================
       EFFACER LABORATOIRE
       ================================================================ */

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

        if (!confirmed) return;

        state.objects = [];
        state.selectedId = null;

        logObservation(
            "Le laboratoire a été vidé."
        );

        renderAll();

        toast(
            "Laboratoire vidé.",
            "success"
        );
    }

    /* ================================================================
       RESET
       ================================================================ */

    function resetLab() {

        const confirmed =
            window.confirm(
                "Réinitialiser complètement la simulation ?"
            );

        if (!confirmed) return;

        state.objects = [];
        state.selectedId = null;
        state.nextId = 1;
        state.logs = [];
        state.tool = "select";
        state.category = "all";
        state.search = "";
        state.zoom = 1;

        try {
            localStorage.removeItem(
                STORAGE_KEY
            );

            localStorage.removeItem(
                SESSION_KEY
            );
        } catch (_) {}

        renderAll();

        toast(
            "Simulation réinitialisée.",
            "success"
        );

        logObservation(
            "Nouvelle session de laboratoire."
        );
    }

    /* ================================================================
       SAUVEGARDE
       ================================================================ */

    function saveSession() {

        const name =
            $("#sessionName")?.value ||
            $("#sessionName")?.textContent ||
            state.sessionName;

        state.sessionName =
            String(name || state.sessionName)
                .trim() ||
            "Laboratoire chimique FOBAS";

        const payload = {
            version: 4,
            savedAt: new Date().toISOString(),
            sessionName: state.sessionName,
            zoom: state.zoom,
            objects: state.objects,
            logs: state.logs,
            nextId: state.nextId
        };

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(payload)
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

            toast(
                "Impossible d'enregistrer la session.",
                "error"
            );

            return;
        }

        downloadJSON(
            payload,
            "simulation-chimique-fobas-session.json"
        );

        logObservation(
            "Session enregistrée."
        );

        toast(
            "Session enregistrée avec succès.",
            "success"
        );
    }

    function downloadJSON(data, filename) {

        try {

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
                URL.createObjectURL(blob);

            const anchor =
                document.createElement("a");

            anchor.href = url;
            anchor.download = filename;

            document.body.appendChild(anchor);

            anchor.click();

            anchor.remove();

            setTimeout(
                () =>
                    URL.revokeObjectURL(url),
                1000
            );

        } catch (_) {
            /*
             * Le localStorage reste la sauvegarde principale.
             */
        }
    }

    /* ================================================================
       CHARGEMENT
       ================================================================ */

    function loadSession() {

        try {

            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!raw) return false;

            const payload =
                JSON.parse(raw);

            if (
                !payload ||
                !Array.isArray(payload.objects)
            ) {
                return false;
            }

            state.objects =
                payload.objects;

            state.logs =
                Array.isArray(payload.logs)
                    ? payload.logs
                    : [];

            state.nextId =
                Number(payload.nextId || 1);

            state.zoom =
                Number(payload.zoom || 1);

            state.sessionName =
                payload.sessionName ||
                "Laboratoire chimique FOBAS";

            state.objects.forEach(
                normalizeLoadedObject
            );

            return true;

        } catch (error) {

            console.warn(
                "FOBAS Chemistry load error:",
                error
            );

            return false;
        }
    }

    function normalizeLoadedObject(object) {

        object.components =
            Array.isArray(object.components)
                ? object.components
                : [];

        object.reactionState =
            object.reactionState ||
            {
                active: false,
                gas: false,
                precipitate: false,
                bubbling: false,
                phase: "stable",
                color: object.color || "#dbeafe",
                description: ""
            };

        object.properties =
            object.properties || {};

        object.temperatureC =
            Number(
                object.temperatureC ??
                DEFAULT_TEMPERATURE
            );

        object.volumeMl =
            Number(object.volumeMl || 0);

        object.massG =
            Number(object.massG || 0);

        object.x =
            Number(object.x || 20);

        object.y =
            Number(object.y || 20);

        object.width =
            Number(object.width || 105);

        object.height =
            Number(object.height || 135);

        if (
            object.kind === "container"
        ) {

            recalculateContainer(
                object
            );
        }
    }

    /* ================================================================
       AIDE
       ================================================================ */

    function openHelp() {

        const modal =
            $("#helpModal");

        if (!modal) return;

        modal.classList.add("open");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    function closeHelp() {

        const modal =
            $("#helpModal");

        if (!modal) return;

        modal.classList.remove("open");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    /* ================================================================
       ACTIONS INSPECTEUR
       ================================================================ */

    function actionTransfer() {

        const selected =
            getSelected();

        if (selected) {
            openTransferModal(selected);
        }
    }

    function actionMix() {

        const selected =
            getSelected();

        if (selected) {
            mixObject(selected);
        }
    }

    function actionMeasure() {

        const selected =
            getSelected();

        if (selected) {
            openMeasurementModal(selected);
        }
    }

    function actionHeat() {

        const selected =
            getSelected();

        if (selected) {
            toggleHeating(selected);
        }
    }

    /* ================================================================
       BOUTONS / ÉVÉNEMENTS
       ================================================================ */

    function bindEvents() {

        /* ------------------------------------------------------------
           BIBLIOTHÈQUE
           ------------------------------------------------------------ */

        const library =
            $("#materialsLibrary");

        if (library) {

            library.addEventListener(
                "click",
                event => {

                    const button =
                        event.target.closest(
                            "[data-material-id]"
                        );

                    if (!button) return;

                    const materialId =
                        button.dataset.materialId;

                    addMaterial(
                        materialId
                    );
                }
            );
        }

        /* ------------------------------------------------------------
           INVENTAIRE
           ------------------------------------------------------------ */

        const inventory =
            $("#inventoryList");

        if (inventory) {

            inventory.addEventListener(
                "click",
                event => {

                    const button =
                        event.target.closest(
                            "[data-object-id]"
                        );

                    if (!button) return;

                    selectObject(
                        button.dataset.objectId
                    );
                }
            );
        }

        /* ------------------------------------------------------------
           RECHERCHE
           ------------------------------------------------------------ */

        const search =
            $("#materialSearch");

        if (search) {

            search.addEventListener(
                "input",
                event => {

                    state.search =
                        event.target.value || "";

                    renderLibrary();
                }
            );
        }

        /* ------------------------------------------------------------
           CATÉGORIES
           ------------------------------------------------------------ */

        $$(".category-button").forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        state.category =
                            button.dataset.category ||
                            "all";

                        $$(".category-button")
                            .forEach(
                                item =>
                                    item.classList.toggle(
                                        "active",
                                        item === button
                                    )
                            );

                        renderLibrary();
                    }
                );
            }
        );

        /* ------------------------------------------------------------
           OUTILS
           ------------------------------------------------------------ */

        $$(".tool-button").forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        setTool(
                            button.dataset.tool
                        )
                );
            }
        );

        /* ------------------------------------------------------------
           ZOOM
           ------------------------------------------------------------ */

        $("#zoomInBtn")?.addEventListener(
            "click",
            zoomIn
        );

        $("#zoomOutBtn")?.addEventListener(
            "click",
            zoomOut
        );

        $("#fitWorkspaceBtn")?.addEventListener(
            "click",
            fitWorkspace
        );

        /* ------------------------------------------------------------
           WORKSPACE
           ------------------------------------------------------------ */

        const viewport =
            $("#workspaceViewport");

        if (viewport) {

            viewport.addEventListener(
                "dblclick",
                event => {

                    if (
                        event.target.closest(
                            ".chem-object"
                        )
                    ) {
                        return;
                    }

                    const rect =
                        viewport.getBoundingClientRect();

                    const x =
                        (
                            event.clientX -
                            rect.left +
                            viewport.scrollLeft
                        ) / state.zoom;

                    const y =
                        (
                            event.clientY -
                            rect.top +
                            viewport.scrollTop
                        ) / state.zoom;

                    addMaterial(
                        "beaker250",
                        {
                            x: Math.max(10, x - 55),
                            y: Math.max(10, y - 70)
                        }
                    );
                }
            );
        }

        /* ------------------------------------------------------------
           TRANSFERT
           ------------------------------------------------------------ */

        $("#closeTransferModal")
            ?.addEventListener(
                "click",
                closeTransferModal
            );

        $("#cancelTransferBtn")
            ?.addEventListener(
                "click",
                closeTransferModal
            );

        $("#confirmTransferBtn")
            ?.addEventListener(
                "click",
                executeTransfer
            );

        $("#transferRange")
            ?.addEventListener(
                "input",
                event => {

                    const amount =
                        $("#transferAmount");

                    if (amount) {
                        amount.value =
                            event.target.value;
                    }
                }
            );

        $("#transferAmount")
            ?.addEventListener(
                "input",
                event => {

                    const range =
                        $("#transferRange");

                    if (range) {
                        range.value =
                            event.target.value;
                    }
                }
            );

        /* ------------------------------------------------------------
           MESURE
           ------------------------------------------------------------ */

        $$(".measurement-option")
            .forEach(option => {

                option.addEventListener(
                    "click",
                    () => {

                        state.measurementType =
                            option.dataset.measurement ||
                            "volume";

                        const selected =
                            getSelected();

                        if (selected) {

                            updateMeasurementDisplay(
                                selected,
                                state.measurementType
                            );
                        }

                        $$(".measurement-option")
                            .forEach(
                                item =>
                                    item.classList.toggle(
                                        "active",
                                        item === option
                                    )
                            );
                    }
                );
            });

        $("#closeMeasurementModal")
            ?.addEventListener(
                "click",
                closeMeasurementModal
            );

        $("#closeMeasurementBtn")
            ?.addEventListener(
                "click",
                closeMeasurementModal
            );

        /* ------------------------------------------------------------
           AIDE
           ------------------------------------------------------------ */

        $("#chemHelpBtn")
            ?.addEventListener(
                "click",
                openHelp
            );

        $("#closeHelpModal")
            ?.addEventListener(
                "click",
                closeHelp
            );

        $("#closeHelpBtn")
            ?.addEventListener(
                "click",
                closeHelp
            );

        /* ------------------------------------------------------------
           RESET / SAVE / CLEAR
           ------------------------------------------------------------ */

        $("#chemResetBtn")
            ?.addEventListener(
                "click",
                resetLab
            );

        $("#chemSaveBtn")
            ?.addEventListener(
                "click",
                saveSession
            );

        $("#clearWorkspaceBtn")
            ?.addEventListener(
                "click",
                clearWorkspace
            );

        /* ------------------------------------------------------------
           INSPECTEUR
           ------------------------------------------------------------ */

        $("#actionTransferBtn")
            ?.addEventListener(
                "click",
                actionTransfer
            );

        $("#actionMixBtn")
            ?.addEventListener(
                "click",
                actionMix
            );

        $("#actionMeasureBtn")
            ?.addEventListener(
                "click",
                actionMeasure
            );

        $("#actionHeatBtn")
            ?.addEventListener(
                "click",
                actionHeat
            );

        $("#actionRemoveBtn")
            ?.addEventListener(
                "click",
                removeSelected
            );

        /* ------------------------------------------------------------
           FERMETURE DES MODALES EN CLIQUANT À L'EXTÉRIEUR
           ------------------------------------------------------------ */

        $$(".chem-modal, .modal")
            .forEach(modal => {

                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target !== modal
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
                    }
                );
            });

        /* ------------------------------------------------------------
           CLAVIER
           ------------------------------------------------------------ */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Delete" ||
                    event.key === "Backspace"
                ) {

                    const active =
                        document.activeElement;

                    const editing =
                        active &&
                        (
                            active.tagName === "INPUT" ||
                            active.tagName === "TEXTAREA" ||
                            active.tagName === "SELECT"
                        );

                    if (!editing) {
                        removeSelected();
                    }
                }

                if (event.key === "Escape") {

                    closeTransferModal();
                    closeMeasurementModal();
                    closeHelp();
                }

                if (
                    (event.ctrlKey || event.metaKey) &&
                    event.key.toLowerCase() === "s"
                ) {

                    event.preventDefault();

                    saveSession();
                }
            }
        );
    }

    /* ================================================================
       RENDU GLOBAL
       ================================================================ */

    function renderAll() {

        renderLibrary();

        renderInventory();

        renderWorkspace();

        renderInspector();

        renderObservationLog();

        updateStatus();

        setZoom(state.zoom);
    }

    /* ================================================================
       SESSION
       ================================================================ */

    function initializeSessionName() {

        const element =
            $("#sessionName");

        if (!element) return;

        try {

            const saved =
                localStorage.getItem(
                    SESSION_KEY
                );

            if (saved) {
                state.sessionName = saved;
            }

        } catch (_) {}

        if (
            element.tagName === "INPUT" ||
            element.tagName === "TEXTAREA"
        ) {

            element.value =
                state.sessionName;

        } else {

            element.textContent =
                state.sessionName;
        }
    }

    /* ================================================================
       ÉTAT DU SYSTÈME
       ================================================================ */

    function setLaboratoryOnline() {

        const dot =
            $("#laboratoryStateDot");

        const text =
            $("#laboratoryStateText");

        if (dot) {

            dot.classList.add(
                "online"
            );

            dot.classList.remove(
                "offline"
            );
        }

        if (text) {
            text.textContent =
                "Laboratoire prêt";
        }
    }

    /* ================================================================
       INITIALISATION
       ================================================================ */

    function init() {

        if (state.initialized) {
            return;
        }

        state.initialized = true;
        state.running = true;

        bindEvents();

        initializeSessionName();

        const loaded =
            loadSession();

        setLaboratoryOnline();

        renderAll();

        if (!loaded) {

            logObservation(
                "Laboratoire chimique FOBAS prêt."
            );

            logObservation(
                "Sélectionnez un matériau dans la bibliothèque pour commencer."
            );
        } else {

            logObservation(
                "Session précédente restaurée."
            );
        }

        state.lastTick =
            Date.now();

        setInterval(
            chemistryTick,
            1000
        );
    }

    /* ================================================================
       API PUBLIQUE
       ================================================================ */

    APP.version = "4.0.0";

    APP.state = state;

    APP.materials = MATERIALS;

    APP.addMaterial =
        addMaterial;

    APP.select =
        selectObject;

    APP.setTool =
        setTool;

    APP.transfer =
        executeTransfer;

    APP.mix =
        mixObject;

    APP.measure =
        openMeasurementModal;

    APP.heat =
        toggleHeating;

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
        calculateSolutionPH;

    APP.detectReactions =
        detectAndApplyReactions;

    APP.openTransfer =
        openTransferModal;

    APP.openMeasurement =
        openMeasurementModal;

    window.FOBASChemistry =
        APP;

    /* ================================================================
       DÉMARRAGE
       ================================================================ */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );

    } else {

        init();
    }

})();

