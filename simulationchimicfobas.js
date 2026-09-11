/* ================================================================
   FOBAS — LABORATOIRE CHIMIQUE
   simulationchimicfobas.js

   CHEMISTRY ENGINE — VERSION FINALE
   ---------------------------------------------------------------
   Compatible avec :
   simulationchimicfobas.html
   simulationchimicfobas.css

   Architecture :
   - Material Database
   - Laboratory Object Engine
   - Container / Solution Engine
   - Transfer Engine
   - Mixing Engine
   - Reaction Engine
   - Measurement Engine
   - Thermal Engine
   - Visual State Engine
   - Workspace Engine
   - Save / Restore Engine
   - Accessibility / Notification Engine

   Aucun framework externe.
================================================================ */

(() => {
    "use strict";

    /* ============================================================
       GLOBAL CONFIGURATION
    ============================================================ */

    const CONFIG = {
        storageKey: "FOBAS_CHEMISTRY_LAB_SESSION",
        version: "FOBAS-CHEM-ENGINE-1.0.0",

        workspaceWidth: 1600,
        workspaceHeight: 1000,

        defaultTemperature: 25,
        minTemperature: -20,
        maxTemperature: 250,

        defaultZoom: 1,
        minZoom: 0.55,
        maxZoom: 1.8,
        zoomStep: 0.1,

        thermalStep: 8,

        maxObservationLogs: 80,

        dragSnap: 2,

        transferDefault: 10,

        ambientTemperature: 25,

        precision: {
            volume: 1,
            mass: 3,
            temperature: 1,
            ph: 2,
            density: 3
        }
    };


    /* ============================================================
       DOM HELPER
    ============================================================ */

    const $ = (id) => document.getElementById(id);

    const qs = (selector, root = document) =>
        root.querySelector(selector);

    const qsa = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));


    /* ============================================================
       MATERIAL DATABASE
    ============================================================ */

    const MATERIALS = [

        /* --------------------------------------------------------
           GLASSWARE
        -------------------------------------------------------- */

        {
            id: "beaker-100",
            name: "Bécher 100 mL",
            category: "glassware",
            type: "container",
            icon: "⚗",
            capacity: 100,
            material: "Verre borosilicaté",
            state: "solide",
            mass: 85,
            density: 2.23,
            temperature: 25,
            color: "transparent",
            transparent: true
        },

        {
            id: "beaker-250",
            name: "Bécher 250 mL",
            category: "glassware",
            type: "container",
            icon: "⚗",
            capacity: 250,
            material: "Verre borosilicaté",
            state: "solide",
            mass: 120,
            density: 2.23,
            temperature: 25,
            color: "transparent",
            transparent: true
        },

        {
            id: "beaker-500",
            name: "Bécher 500 mL",
            category: "glassware",
            type: "container",
            icon: "⚗",
            capacity: 500,
            material: "Verre borosilicaté",
            state: "solide",
            mass: 190,
            density: 2.23,
            temperature: 25,
            color: "transparent",
            transparent: true
        },

        {
            id: "erlenmeyer-250",
            name: "Erlenmeyer 250 mL",
            category: "glassware",
            type: "container",
            icon: "△",
            capacity: 250,
            material: "Verre borosilicaté",
            state: "solide",
            mass: 140,
            density: 2.23,
            temperature: 25,
            color: "transparent",
            transparent: true
        },

        {
            id: "test-tube",
            name: "Tube à essai",
            category: "glassware",
            type: "container",
            icon: "▯",
            capacity: 25,
            material: "Verre",
            state: "solide",
            mass: 18,
            density: 2.23,
            temperature: 25,
            color: "transparent",
            transparent: true
        },

        {
            id: "graduated-cylinder-100",
            name: "Éprouvette graduée 100 mL",
            category: "glassware",
            type: "container",
            icon: "▥",
            capacity: 100,
            material: "Verre",
            state: "solide",
            mass: 90,
            density: 2.23,
            temperature: 25,
            color: "transparent",
            transparent: true,
            graduation: 1
        },

        {
            id: "graduated-cylinder-250",
            name: "Éprouvette graduée 250 mL",
            category: "glassware",
            type: "container",
            icon: "▥",
            capacity: 250,
            material: "Verre",
            state: "solide",
            mass: 145,
            density: 2.23,
            temperature: 25,
            color: "transparent",
            transparent: true,
            graduation: 2
        },

        {
            id: "flask-volumetric-100",
            name: "Fiole jaugée 100 mL",
            category: "glassware",
            type: "container",
            icon: "⚗",
            capacity: 100,
            material: "Verre",
            state: "solide",
            mass: 95,
            density: 2.23,
            temperature: 25,
            color: "transparent",
            transparent: true
        },

        {
            id: "funnel",
            name: "Entonnoir",
            category: "glassware",
            type: "transfer-tool",
            icon: "▽",
            capacity: 0,
            material: "Verre",
            state: "solide",
            mass: 40,
            density: 2.23,
            temperature: 25,
            color: "transparent"
        },

        {
            id: "watch-glass",
            name: "Verre de montre",
            category: "glassware",
            type: "dish",
            icon: "◯",
            capacity: 0,
            material: "Verre",
            state: "solide",
            mass: 35,
            density: 2.23,
            temperature: 25,
            color: "transparent"
        },


        /* --------------------------------------------------------
           REAGENTS
        -------------------------------------------------------- */

        {
            id: "water",
            name: "Eau distillée",
            formula: "H₂O",
            category: "reagent",
            type: "liquid",
            state: "liquide",
            icon: "💧",
            density: 0.997,
            molarMass: 18.015,
            ph: 7,
            temperature: 25,
            color: "rgba(160,220,255,.20)",
            concentration: 55.5,
            unit: "mol/L"
        },

        {
            id: "hydrochloric-acid",
            name: "Acide chlorhydrique",
            formula: "HCl",
            category: "reagent",
            type: "liquid",
            state: "liquide",
            icon: "🧪",
            density: 1.00,
            molarMass: 36.46,
            ph: 1,
            temperature: 25,
            color: "rgba(225,235,245,.14)",
            concentration: 0.10,
            unit: "mol/L"
        },

        {
            id: "sodium-hydroxide",
            name: "Hydroxyde de sodium",
            formula: "NaOH",
            category: "reagent",
            type: "liquid",
            state: "liquide",
            icon: "🧪",
            density: 1.00,
            molarMass: 40.00,
            ph: 13,
            temperature: 25,
            color: "rgba(220,235,255,.15)",
            concentration: 0.10,
            unit: "mol/L"
        },

        {
            id: "copper-sulfate",
            name: "Sulfate de cuivre",
            formula: "CuSO₄",
            category: "reagent",
            type: "liquid",
            icon: "🧪",
            state: "liquide",
            density: 1.02,
            molarMass: 159.61,
            ph: 5,
            temperature: 25,
            color: "rgba(30,120,255,.55)",
            concentration: 0.10,
            unit: "mol/L"
        },

        {
            id: "universal-indicator",
            name: "Indicateur universel",
            formula: "Ind.",
            category: "reagent",
            type: "liquid",
            icon: "🧪",
            state: "liquide",
            density: 1.00,
            molarMass: null,
            ph: 7,
            temperature: 25,
            color: "rgba(70,210,90,.45)",
            concentration: null,
            unit: null,
            indicator: true
        },

        {
            id: "ethanol",
            name: "Éthanol",
            formula: "C₂H₅OH",
            category: "reagent",
            type: "liquid",
            icon: "🧪",
            state: "liquide",
            density: 0.789,
            molarMass: 46.07,
            ph: 7,
            temperature: 25,
            color: "rgba(230,245,255,.16)",
            concentration: 1,
            unit: "mol/L"
        },


        /* --------------------------------------------------------
           SOLIDS
        -------------------------------------------------------- */

        {
            id: "zinc",
            name: "Zinc",
            formula: "Zn",
            category: "solid",
            type: "solid",
            icon: "⬡",
            state: "solide",
            density: 7.14,
            molarMass: 65.38,
            temperature: 25,
            color: "#b9c0c5",
            solidColor: "#aeb7bd"
        },

        {
            id: "copper",
            name: "Cuivre",
            formula: "Cu",
            category: "solid",
            type: "solid",
            icon: "⬡",
            state: "solide",
            density: 8.96,
            molarMass: 63.546,
            temperature: 25,
            color: "#b87333",
            solidColor: "#b87333"
        },

        {
            id: "iron",
            name: "Fer",
            formula: "Fe",
            category: "solid",
            type: "solid",
            icon: "⬡",
            state: "solide",
            density: 7.87,
            molarMass: 55.845,
            temperature: 25,
            color: "#72777b",
            solidColor: "#72777b"
        },

        {
            id: "sodium-chloride",
            name: "Chlorure de sodium",
            formula: "NaCl",
            category: "solid",
            type: "solid",
            icon: "◈",
            state: "solide",
            density: 2.165,
            molarMass: 58.44,
            temperature: 25,
            color: "#f3f5f7",
            solidColor: "#f3f5f7",
            solubleInWater: true
        },

        {
            id: "calcium-carbonate",
            name: "Carbonate de calcium",
            formula: "CaCO₃",
            category: "solid",
            type: "solid",
            icon: "◈",
            state: "solide",
            density: 2.71,
            molarMass: 100.09,
            temperature: 25,
            color: "#f0f0ec",
            solidColor: "#ecece5",
            solubleInWater: false
        },


        /* --------------------------------------------------------
           INSTRUMENTS
        -------------------------------------------------------- */

        {
            id: "thermometer",
            name: "Thermomètre",
            category: "instrument",
            type: "thermometer",
            icon: "🌡",
            state: "instrument",
            temperature: 25
        },

        {
            id: "ph-meter",
            name: "pH-mètre",
            category: "instrument",
            type: "ph-meter",
            icon: "pH",
            state: "instrument"
        },

        {
            id: "balance",
            name: "Balance électronique",
            category: "instrument",
            type: "balance",
            icon: "⚖",
            state: "instrument",
            precision: 0.01
        },

        {
            id: "pipette",
            name: "Pipette",
            category: "instrument",
            type: "pipette",
            icon: "│",
            state: "instrument",
            capacity: 10,
            precision: 0.1
        },

        {
            id: "burette",
            name: "Burette graduée",
            category: "instrument",
            type: "burette",
            icon: "│",
            state: "instrument",
            capacity: 50,
            precision: 0.1
        },


        /* --------------------------------------------------------
           EQUIPMENT
        -------------------------------------------------------- */

        {
            id: "magnetic-stirrer",
            name: "Agitateur magnétique",
            category: "equipment",
            type: "stirrer",
            icon: "↻",
            state: "équipement"
        },

        {
            id: "hot-plate",
            name: "Plaque chauffante",
            category: "equipment",
            type: "heater",
            icon: "♨",
            state: "équipement",
            power: 400
        },

        {
            id: "tripod",
            name: "Trépied de laboratoire",
            category: "equipment",
            type: "support",
            icon: "△",
            state: "équipement"
        },

        {
            id: "burner",
            name: "Chauffage de laboratoire",
            category: "equipment",
            type: "heater",
            icon: "🔥",
            state: "équipement",
            power: 500
        }
    ];


    /* ============================================================
       REACTION DATABASE
    ============================================================ */

    const REACTIONS = [

        {
            id: "acid-base",
            reactants: ["hydrochloric-acid", "sodium-hydroxide"],
            name: "Neutralisation acide-base",
            type: "neutralization",

            execute(solution) {

                const hcl = getComponent(
                    solution,
                    "hydrochloric-acid"
                );

                const naoh = getComponent(
                    solution,
                    "sodium-hydroxide"
                );

                if (!hcl || !naoh) {
                    return null;
                }

                const limiting = Math.min(
                    hcl.moles,
                    naoh.moles
                );

                if (limiting <= 0) {
                    return null;
                }

                hcl.moles = Math.max(
                    0,
                    hcl.moles - limiting
                );

                naoh.moles = Math.max(
                    0,
                    naoh.moles - limiting
                );

                solution.reaction = {
                    id: "acid-base",
                    name: "Neutralisation acide-base",
                    phase: "Réaction en cours",
                    gas: null,
                    precipitate: null,
                    color: null,
                    intensity: 0.85
                };

                solution.temperature = clamp(
                    solution.temperature + 2.5,
                    CONFIG.minTemperature,
                    CONFIG.maxTemperature
                );

                solution.pH = calculatePH(solution);

                return {
                    title: "Neutralisation",
                    message:
                        "Les composants acide et basique réagissent. " +
                        "Le système tend vers un état plus neutre.",
                    type: "reaction"
                };
            }
        },


        {
            id: "zinc-copper-sulfate",
            reactants: ["zinc", "copper-sulfate"],
            name: "Réaction métal / solution ionique",
            type: "redox",

            execute(solution) {

                const zinc = getComponent(
                    solution,
                    "zinc"
                );

                const sulfate = getComponent(
                    solution,
                    "copper-sulfate"
                );

                if (!zinc || !sulfate) {
                    return null;
                }

                const available = Math.min(
                    zinc.moles,
                    sulfate.moles
                );

                if (available <= 0) {
                    return null;
                }

                zinc.moles = Math.max(
                    0,
                    zinc.moles - available
                );

                sulfate.moles = Math.max(
                    0,
                    sulfate.moles - available
                );

                solution.reaction = {
                    id: "zinc-copper-sulfate",
                    name: "Transformation redox",
                    phase: "Réaction",
                    gas: null,
                    precipitate: "Cu",
                    color: "Brun rougeâtre",
                    intensity: 0.75
                };

                solution.temperature = clamp(
                    solution.temperature + 1.2,
                    CONFIG.minTemperature,
                    CONFIG.maxTemperature
                );

                return {
                    title: "Transformation chimique",
                    message:
                        "Une transformation redox simulée est détectée. " +
                        "La couleur de la solution évolue et un dépôt métallique peut apparaître.",
                    type: "reaction"
                };
            }
        },


        {
            id: "carbonate-acid",
            reactants: ["calcium-carbonate", "hydrochloric-acid"],
            name: "Réaction acide-carbonate",
            type: "gas",

            execute(solution) {

                const carbonate = getComponent(
                    solution,
                    "calcium-carbonate"
                );

                const acid = getComponent(
                    solution,
                    "hydrochloric-acid"
                );

                if (!carbonate || !acid) {
                    return null;
                }

                const available = Math.min(
                    carbonate.moles,
                    acid.moles
                );

                if (available <= 0) {
                    return null;
                }

                carbonate.moles = Math.max(
                    0,
                    carbonate.moles - available
                );

                acid.moles = Math.max(
                    0,
                    acid.moles - available
                );

                solution.reaction = {
                    id: "carbonate-acid",
                    name: "Réaction acide-carbonate",
                    phase: "Effervescence",
                    gas: "CO₂",
                    precipitate: null,
                    color: "Inchangée",
                    intensity: 1
                };

                solution.gas = {
                    formula: "CO₂",
                    amount: available,
                    active: true
                };

                solution.temperature = clamp(
                    solution.temperature + 1,
                    CONFIG.minTemperature,
                    CONFIG.maxTemperature
                );

                return {
                    title: "Effervescence",
                    message:
                        "Le moteur détecte une production simulée de gaz CO₂. " +
                        "Des bulles apparaissent dans la phase liquide.",
                    type: "gas"
                };
            }
        }
    ];


    /* ============================================================
       APPLICATION STATE
    ============================================================ */

    const state = {

        version: CONFIG.version,

        sessionName: "Expérience chimique",

        zoom: CONFIG.defaultZoom,

        tool: "select",

        category: "all",

        query: "",

        selectedId: null,

        nextObjectId: 1,

        objects: [],

        observations: [],

        reactionFlash: false,

        dragging: null,

        measurement: {
            type: "volume",
            value: null,
            unit: null,
            precision: null,
            label: "Mesure"
        },

        laboratory: {
            temperature: CONFIG.defaultTemperature,
            totalVolume: 0,
            totalMass: 0,
            ph: null
        }
    };


    /* ============================================================
       INITIALIZATION
    ============================================================ */

    function init() {

        bindEvents();

        state.sessionName =
            $("sessionName")?.value ||
            "Expérience chimique";

        renderLibrary();

        renderInventory();

        renderWorkspace();

        updateAll();

        logObservation(
            "Système",
            "Chemistry Engine initialisé. Laboratoire prêt.",
            "system"
        );

        announce(
            "Laboratoire chimique FOBAS actif."
        );
    }


    /* ============================================================
       EVENT BINDING
    ============================================================ */

    function bindEvents() {

        $("materialSearch")?.addEventListener(
            "input",
            (event) => {

                state.query =
                    event.target.value
                        .trim()
                        .toLowerCase();

                renderLibrary();
            }
        );


        $("materialCategories")?.addEventListener(
            "click",
            (event) => {

                const button =
                    event.target.closest(
                        ".category-button"
                    );

                if (!button) {
                    return;
                }

                state.category =
                    button.dataset.category ||
                    "all";

                qsa(".category-button").forEach(
                    (item) => {

                        item.classList.toggle(
                            "active",
                            item === button
                        );
                    }
                );

                renderLibrary();
            }
        );


        qsa(".tool-button").forEach(
            (button) => {

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


        $("zoomOutBtn")?.addEventListener(
            "click",
            () => changeZoom(-CONFIG.zoomStep)
        );


        $("zoomInBtn")?.addEventListener(
            "click",
            () => changeZoom(CONFIG.zoomStep)
        );


        $("fitWorkspaceBtn")?.addEventListener(
            "click",
            fitWorkspace
        );


        $("clearWorkspaceBtn")?.addEventListener(
            "click",
            clearWorkspace
        );


        $("chemResetBtn")?.addEventListener(
            "click",
            resetLaboratory
        );


        $("chemSaveBtn")?.addEventListener(
            "click",
            saveSession
        );


        $("chemHelpBtn")?.addEventListener(
            "click",
            () => openModal("helpModal")
        );


        $("sessionName")?.addEventListener(
            "input",
            (event) => {

                state.sessionName =
                    event.target.value ||
                    "Expérience chimique";
            }
        );


        $("workspaceObjects")?.addEventListener(
            "click",
            handleObjectClick
        );


        $("workspaceObjects")?.addEventListener(
            "dblclick",
            handleObjectDoubleClick
        );


        $("workspaceObjects")?.addEventListener(
            "pointerdown",
            handlePointerDown
        );


        document.addEventListener(
            "pointermove",
            handlePointerMove
        );


        document.addEventListener(
            "pointerup",
            handlePointerUp
        );


        $("chemistryCanvas")?.addEventListener(
            "dblclick",
            (event) => {

                if (
                    event.target ===
                    $("chemistryCanvas")
                ) {

                    const position =
                        canvasPosition(
                            event.clientX,
                            event.clientY
                        );

                    addMaterial(
                        "beaker-250",
                        position.x,
                        position.y
                    );
                }
            }
        );


        $("chemistryCanvas")?.addEventListener(
            "wheel",
            (event) => {

                if (!event.ctrlKey) {
                    return;
                }

                event.preventDefault();

                changeZoom(
                    event.deltaY > 0
                        ? -CONFIG.zoomStep
                        : CONFIG.zoomStep
                );
            },
            { passive: false }
        );


        $("chemistryCanvas")?.addEventListener(
            "keydown",
            handleKeyboard
        );


        $("actionTransferBtn")?.addEventListener(
            "click",
            openTransferForSelected
        );


        $("actionMixBtn")?.addEventListener(
            "click",
            () => {

                if (state.selectedId) {
                    mixObject(
                        state.selectedId
                    );
                }
            }
        );


        $("actionMeasureBtn")?.addEventListener(
            "click",
            openMeasurementForSelected
        );


        $("actionHeatBtn")?.addEventListener(
            "click",
            () => {

                if (state.selectedId) {
                    heatObject(
                        state.selectedId
                    );
                }
            }
        );


        $("actionRemoveBtn")?.addEventListener(
            "click",
            removeSelected
        );


        $("closeTransferModal")?.addEventListener(
            "click",
            closeTransferModal
        );

        $("cancelTransferBtn")?.addEventListener(
            "click",
            closeTransferModal
        );

        $("confirmTransferBtn")?.addEventListener(
            "click",
            confirmTransfer
        );


        $("transferAmount")?.addEventListener(
            "input",
            syncTransferRangeFromInput
        );


        $("transferRange")?.addEventListener(
            "input",
            syncTransferInputFromRange
        );


        $("closeMeasurementModal")?.addEventListener(
            "click",
            closeMeasurementModal
        );

        $("closeMeasurementBtn")?.addEventListener(
            "click",
            closeMeasurementModal
        );


        qsa(".measurement-option").forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        qsa(
                            ".measurement-option"
                        ).forEach(
                            (item) =>
                                item.classList.remove(
                                    "active"
                                )
                        );

                        button.classList.add(
                            "active"
                        );

                        state.measurement.type =
                            button.dataset.measurement;

                        updateMeasurementDisplay();
                    }
                );
            }
        );


        $("closeHelpModal")?.addEventListener(
            "click",
            closeHelpModal
        );

        $("closeHelpBtn")?.addEventListener(
            "click",
            closeHelpModal
        );


        qsa(".modal-backdrop").forEach(
            (backdrop) => {

                backdrop.addEventListener(
                    "click",
                    () => {

                        const modal =
                            backdrop.closest(
                                ".chem-modal"
                            );

                        if (modal) {
                            closeModal(
                                modal.id
                            );
                        }
                    }
                );
            }
        );


        document.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Escape") {
                    closeAllModals();
                }
            }
        );
    }


    /* ============================================================
       LIBRARY
    ============================================================ */

    function getVisibleMaterials() {

        return MATERIALS.filter(
            (material) => {

                const categoryOK =
                    state.category === "all" ||
                    material.category ===
                        state.category;

                const queryOK =
                    !state.query ||
                    material.name
                        .toLowerCase()
                        .includes(state.query) ||
                    (
                        material.formula &&
                        material.formula
                            .toLowerCase()
                            .includes(state.query)
                    );

                return categoryOK && queryOK;
            }
        );
    }


    function renderLibrary() {

        const container =
            $("materialsLibrary");

        if (!container) {
            return;
        }

        const materials =
            getVisibleMaterials();

        if ($("materialCount")) {
            $("materialCount").textContent =
                materials.length;
        }

        container.innerHTML = "";

        if (!materials.length) {

            container.innerHTML = `
                <div class="library-empty">
                    Aucun matériau trouvé.
                </div>
            `;

            return;
        }

        materials.forEach(
            (material) => {

                const item =
                    document.createElement("button");

                item.type = "button";

                item.className =
                    "material-item";

                item.dataset.materialId =
                    material.id;

                item.innerHTML = `
                    <span class="material-icon">
                        ${escapeHTML(material.icon || "•")}
                    </span>

                    <span class="material-info">
                        <strong>
                            ${escapeHTML(material.name)}
                        </strong>

                        <small>
                            ${
                                escapeHTML(
                                    material.formula ||
                                    material.category
                                )
                            }
                        </small>
                    </span>

                    <span class="material-add">
                        +
                    </span>
                `;

                item.addEventListener(
                    "click",
                    () => {

                        addMaterial(
                            material.id
                        );
                    }
                );

                container.appendChild(item);
            }
        );
    }


    /* ============================================================
       ADD MATERIAL
    ============================================================ */

    function addMaterial(
        materialId,
        x = null,
        y = null
    ) {

        const template =
            MATERIALS.find(
                (material) =>
                    material.id === materialId
            );

        if (!template) {
            return null;
        }

        const position =
            x !== null && y !== null
                ? {
                    x,
                    y
                }
                : findFreePosition();

        const object = createObject(
            template,
            position.x,
            position.y
        );

        state.objects.push(object);

        state.selectedId =
            object.id;

        renderWorkspace();

        updateAll();

        logObservation(
            "Matériel",
            `${template.name} ajouté au laboratoire.`,
            "material"
        );

        announce(
            `${template.name} ajouté au laboratoire.`
        );

        return object;
    }


    /* ============================================================
       OBJECT CREATION
    ============================================================ */

    function createObject(
        template,
        x,
        y
    ) {

        const object = {

            id:
                `chem-${state.nextObjectId++}`,

            materialId:
                template.id,

            name:
                template.name,

            category:
                template.category,

            type:
                template.type,

            icon:
                template.icon || "•",

            x:
                clamp(
                    x,
                    20,
                    CONFIG.workspaceWidth - 160
                ),

            y:
                clamp(
                    y,
                    20,
                    CONFIG.workspaceHeight - 160
                ),

            width:
                getObjectWidth(template),

            height:
                getObjectHeight(template),

            rotation: 0,

            selected: false,

            capacity:
                template.capacity || 0,

            temperature:
                Number(
                    template.temperature ??
                    CONFIG.defaultTemperature
                ),

            mass:
                Number(template.mass || 0),

            volume: 0,

            density:
                Number(template.density || 0),

            state:
                template.state || "stable",

            color:
                template.color || "transparent",

            composition: [],

            reaction: null,

            gas: null,

            precipitate: null,

            mixed: false,

            heated: false,

            measuring: false,

            fillLevel: 0,

            createdAt:
                Date.now()
        };


        if (
            template.type === "liquid" ||
            template.type === "solid"
        ) {

            object.quantity =
                template.type === "liquid"
                    ? 50
                    : 5;

            object.volume =
                template.type === "liquid"
                    ? 50
                    : 0;

            object.mass =
                template.type === "liquid"
                    ? calculateMassFromVolume(
                        50,
                        template.density || 1
                    )
                    : 5;

            object.composition = [
                createComponent(
                    template,
                    template.type === "liquid"
                        ? calculateMoles(
                            50,
                            template.density || 1,
                            template.molarMass
                        )
                        : calculateMolesFromMass(
                            5,
                            template.molarMass
                        ),
                    template.type === "liquid"
                        ? 50
                        : 0
                )
            ];
        }


        return object;
    }


    function createComponent(
        material,
        moles = 0,
        volume = 0
    ) {

        return {

            materialId:
                material.id,

            name:
                material.name,

            formula:
                material.formula ||
                "",

            moles:
                Number(moles || 0),

            volume:
                Number(volume || 0),

            density:
                Number(material.density || 0),

            concentration:
                Number(material.concentration || 0),

            ph:
                material.ph ?? null,

            color:
                material.color ||
                "transparent",

            state:
                material.state ||
                "stable"
        };
    }


    /* ============================================================
       OBJECT DIMENSIONS
    ============================================================ */

    function getObjectWidth(template) {

        switch (template.type) {

            case "container":
                if (template.capacity <= 25) {
                    return 85;
                }

                if (template.capacity <= 100) {
                    return 105;
                }

                return 125;

            case "solid":
                return 80;

            case "liquid":
                return 90;

            case "thermometer":
                return 65;

            case "ph-meter":
                return 90;

            case "balance":
                return 120;

            case "pipette":
                return 95;

            case "burette":
                return 90;

            default:
                return 100;
        }
    }


    function getObjectHeight(template) {

        switch (template.type) {

            case "container":
                if (template.capacity <= 25) {
                    return 125;
                }

                if (template.capacity <= 100) {
                    return 140;
                }

                return 155;

            case "solid":
                return 70;

            case "liquid":
                return 70;

            case "thermometer":
                return 150;

            case "ph-meter":
                return 125;

            case "balance":
                return 80;

            case "pipette":
                return 170;

            case "burette":
                return 190;

            default:
                return 100;
        }
    }


    /* ============================================================
       WORKSPACE POSITION
    ============================================================ */

    function findFreePosition() {

        const count =
            state.objects.length;

        const columns = 5;

        const column =
            count % columns;

        const row =
            Math.floor(count / columns);

        return {

            x: 70 + column * 250,

            y: 80 + row * 210
        };
    }


    function canvasPosition(
        clientX,
        clientY
    ) {

        const canvas =
            $("chemistryCanvas");

        const rect =
            canvas.getBoundingClientRect();

        return {

            x:
                (clientX - rect.left) /
                state.zoom,

            y:
                (clientY - rect.top) /
                state.zoom
        };
    }


    /* ============================================================
       WORKSPACE RENDERING
    ============================================================ */

    function renderWorkspace() {

        const container =
            $("workspaceObjects");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        state.objects.forEach(
            (object) => {

                const element =
                    createObjectElement(
                        object
                    );

                container.appendChild(
                    element
                );
            }
        );

        updateDropZone();

        applyZoom();
    }


    function createObjectElement(object) {

        const element =
            document.createElement("div");

        element.className =
            `chem-object chem-object-${object.type}`;

        element.dataset.objectId =
            object.id;

        if (object.id === state.selectedId) {
            element.classList.add("selected");
        }

        if (object.reaction) {
            element.classList.add(
                "reaction-active"
            );
        }

        if (object.heated) {
            element.classList.add(
                "heated"
            );
        }

        element.style.left =
            `${object.x}px`;

        element.style.top =
            `${object.y}px`;

        element.style.width =
            `${object.width}px`;

        element.style.height =
            `${object.height}px`;

        element.style.transform =
            `rotate(${object.rotation}deg)`;


        if (
            object.type === "container"
        ) {

            element.innerHTML =
                renderContainer(object);

        } else if (
            object.type === "liquid"
        ) {

            element.innerHTML =
                renderLiquidSource(object);

        } else if (
            object.type === "solid"
        ) {

            element.innerHTML =
                renderSolid(object);

        } else {

            element.innerHTML =
                renderInstrument(object);
        }


        const label =
            document.createElement("div");

        label.className =
            "chem-object-label";

        label.textContent =
            object.name;

        element.appendChild(
            label
        );


        return element;
    }


    function renderContainer(object) {

        const composition =
            object.composition || [];

        const liquidVolume =
            getObjectVolume(object);

        const fillRatio =
            object.capacity > 0
                ? clamp(
                    liquidVolume /
                    object.capacity,
                    0,
                    1
                )
                : 0;

        const color =
            calculateSolutionColor(
                object
            );

        const liquidHeight =
            Math.max(
                4,
                Math.round(
                    100 *
                    fillRatio
                )
            );

        const bubbles =
            object.gas
                ? `
                    <span class="chem-bubbles">
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                    </span>
                `
                : "";

        const precipitate =
            object.precipitate
                ? `
                    <span
                        class="chem-precipitate"
                        style="
                            background:
                            ${escapeHTML(
                                object.reaction
                                    ?.color ||
                                "#d8c18d"
                            )};
                        "
                    ></span>
                `
                : "";

        return `
            <div class="glass-container">

                <div class="glass-rim"></div>

                <div class="glass-body">

                    <div
                        class="glass-liquid"
                        style="
                            height:${liquidHeight}%;
                            background:${escapeHTML(color)};
                        "
                    ></div>

                    ${bubbles}

                    ${precipitate}

                    <div class="glass-reflection"></div>

                </div>

                <div class="glass-graduations">

                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>

                </div>

                <div class="glass-base"></div>

            </div>

            <div class="object-readout">

                <span>
                    ${formatNumber(liquidVolume, 1)} mL
                </span>

                ${
                    composition.length
                        ? `
                            <small>
                                ${composition.length}
                                composant(s)
                            </small>
                        `
                        : ""
                }

            </div>
        `;
    }


    function renderLiquidSource(object) {

        const color =
            object.color ||
            "rgba(120,200,255,.25)";

        return `
            <div class="liquid-source">

                <div
                    class="source-liquid"
                    style="
                        background:${escapeHTML(color)};
                    "
                ></div>

                <div class="source-cap"></div>

                <div class="source-glass"></div>

            </div>

            <div class="object-readout">
                ${formatNumber(
                    object.volume,
                    1
                )} mL
            </div>
        `;
    }


    function renderSolid(object) {

        const color =
            object.color ||
            "#c9c9c9";

        return `
            <div
                class="solid-material"
                style="
                    background:${escapeHTML(color)};
                "
            >

                <span>
                    ${escapeHTML(
                        object.icon || "◆"
                    )}
                </span>

            </div>

            <div class="object-readout">
                ${formatNumber(
                    object.mass,
                    3
                )} g
            </div>
        `;
    }


    function renderInstrument(object) {

        let visual = "";

        switch (object.type) {

            case "thermometer":

                visual = `
                    <div class="instrument thermometer-visual">
                        <div class="thermometer-bulb"></div>
                        <div class="thermometer-tube">
                            <div
                                class="thermometer-level"
                                style="
                                    height:${clamp(
                                        (object.temperature + 20) /
                                        270 *
                                        100,
                                        2,
                                        98
                                    )}%;
                                "
                            ></div>
                        </div>
                    </div>

                    <div class="instrument-reading">
                        ${formatNumber(
                            object.temperature,
                            1
                        )} °C
                    </div>
                `;

                break;


            case "ph-meter":

                visual = `
                    <div class="instrument ph-meter-visual">
                        <div class="ph-screen">
                            ${formatPH(
                                object.lastPH
                            )}
                        </div>

                        <div class="ph-probe"></div>
                    </div>
                `;

                break;


            case "balance":

                visual = `
                    <div class="instrument balance-visual">

                        <div class="balance-display">
                            ${formatNumber(
                                object.lastMass || 0,
                                2
                            )} g
                        </div>

                        <div class="balance-pan"></div>

                    </div>
                `;

                break;


            case "pipette":

                visual = `
                    <div class="instrument pipette-visual">

                        <div class="pipette-body"></div>
                        <div class="pipette-tip"></div>

                    </div>
                `;

                break;


            case "burette":

                visual = `
                    <div class="instrument burette-visual">

                        <div class="burette-tube"></div>

                        <div class="burette-scale">
                            <span>0</span>
                            <span>10</span>
                            <span>20</span>
                            <span>30</span>
                            <span>40</span>
                            <span>50</span>
                        </div>

                    </div>
                `;

                break;


            default:

                visual = `
                    <div class="equipment-visual">
                        ${escapeHTML(
                            object.icon || "⚙"
                        )}
                    </div>
                `;
        }

        return visual;
    }


    /* ============================================================
       OBJECT EVENTS
    ============================================================ */

    function handleObjectClick(event) {

        const element =
            event.target.closest(
                ".chem-object"
            );

        if (!element) {
            return;
        }

        const id =
            element.dataset.objectId;

        if (!id) {
            return;
        }

        const object =
            getObject(id);

        if (!object) {
            return;
        }

        if (state.tool === "transfer") {

            openTransferForObject(
                object
            );

            return;
        }

        if (state.tool === "mix") {

            mixObject(id);

            return;
        }

        if (state.tool === "measure") {

            measureObject(id);

            return;
        }

        if (state.tool === "heat") {

            heatObject(id);

            return;
        }

        state.selectedId =
            id;

        renderWorkspace();

        updateInspector();

        announce(
            `${object.name} sélectionné.`
        );
    }


    function handleObjectDoubleClick(event) {

        const element =
            event.target.closest(
                ".chem-object"
            );

        if (!element) {
            return;
        }

        const object =
            getObject(
                element.dataset.objectId
            );

        if (!object) {
            return;
        }

        if (
            object.type === "container" &&
            object.composition.length
        ) {

            mixObject(
                object.id
            );

            return;
        }

        openMeasurementForObject(
            object
        );
    }


    /* ============================================================
       DRAG ENGINE
    ============================================================ */

    function handlePointerDown(event) {

        const element =
            event.target.closest(
                ".chem-object"
            );

        if (!element) {
            return;
        }

        if (state.tool !== "move") {
            return;
        }

        const id =
            element.dataset.objectId;

        const object =
            getObject(id);

        if (!object) {
            return;
        }

        const position =
            canvasPosition(
                event.clientX,
                event.clientY
            );

        state.dragging = {

            id,

            offsetX:
                position.x -
                object.x,

            offsetY:
                position.y -
                object.y
        };

        element.setPointerCapture?.(
            event.pointerId
        );

        event.preventDefault();
    }


    function handlePointerMove(event) {

        if (!state.dragging) {
            return;
        }

        const object =
            getObject(
                state.dragging.id
            );

        if (!object) {
            return;
        }

        const position =
            canvasPosition(
                event.clientX,
                event.clientY
            );

        object.x =
            clamp(
                position.x -
                state.dragging.offsetX,
                0,
                CONFIG.workspaceWidth -
                    object.width
            );

        object.y =
            clamp(
                position.y -
                state.dragging.offsetY,
                0,
                CONFIG.workspaceHeight -
                    object.height
            );

        renderWorkspace();
    }


    function handlePointerUp() {

        if (!state.dragging) {
            return;
        }

        const object =
            getObject(
                state.dragging.id
            );

        if (object) {

            object.x =
                snap(
                    object.x,
                    CONFIG.dragSnap
                );

            object.y =
                snap(
                    object.y,
                    CONFIG.dragSnap
                );
        }

        state.dragging = null;

        renderWorkspace();
    }


    /* ============================================================
       TOOL ENGINE
    ============================================================ */

    function setTool(tool) {

        const allowed = [
            "select",
            "move",
            "transfer",
            "mix",
            "measure",
            "heat"
        ];

        if (!allowed.includes(tool)) {
            return;
        }

        state.tool = tool;

        qsa(".tool-button").forEach(
            (button) => {

                button.classList.toggle(
                    "active",
                    button.dataset.tool ===
                        tool
                );
            }
        );

        const labels = {
            select: "Sélection",
            move: "Déplacement",
            transfer: "Transfert",
            mix: "Mélange",
            measure: "Mesure",
            heat: "Chauffage"
        };

        setLaboratoryState(
            labels[tool] || "Laboratoire actif"
        );

        announce(
            `Outil ${labels[tool] || tool} activé.`
        );
    }


    /* ============================================================
       TRANSFER ENGINE
    ============================================================ */

    function openTransferForSelected() {

        const object =
            getObject(
                state.selectedId
            );

        if (!object) {
            toast(
                "Sélectionnez d'abord une matière ou un récipient.",
                "warning"
            );

            return;
        }

        openTransferForObject(
            object
        );
    }


    function openTransferForObject(
        source
    ) {

        if (!isTransferSource(source)) {

            toast(
                "Cet élément ne contient pas de matière transférable.",
                "warning"
            );

            return;
        }

        const targets =
            state.objects.filter(
                (object) =>
                    object.id !== source.id &&
                    object.type === "container" &&
                    getObjectVolume(object) <
                        object.capacity
            );

        if (!targets.length) {

            toast(
                "Aucun récipient disponible pour le transfert.",
                "warning"
            );

            return;
        }

        $("transferSourceName").textContent =
            source.name;

        $("transferSourceAmount").textContent =
            `${formatTransferAmount(source)}`;

        const select =
            $("transferTarget");

        select.innerHTML = "";

        targets.forEach(
            (target) => {

                const option =
                    document.createElement("option");

                option.value =
                    target.id;

                option.textContent =
                    `${target.name} — ${formatNumber(
                        getObjectVolume(target),
                        1
                    )}/${target.capacity} mL`;

                select.appendChild(
                    option
                );
            }
        );

        const max =
            getTransferableVolume(source);

        const amount =
            Math.min(
                CONFIG.transferDefault,
                max
            );

        $("transferAmount").value =
            amount.toFixed(1);

        $("transferRange").max =
            max.toFixed(1);

        $("transferRange").value =
            amount.toFixed(1);

        $("transferMaxLabel").textContent =
            `${formatNumber(max, 1)} mL`;

        $("confirmTransferBtn").dataset.source =
            source.id;

        openModal("transferModal");
    }


    function isTransferSource(object) {

        return (
            object.type === "liquid" ||
            object.type === "container" ||
            object.type === "pipette" ||
            object.type === "burette"
        );
    }


    function getTransferableVolume(object) {

        if (object.type === "liquid") {
            return Math.max(
                0,
                object.volume || 0
            );
        }

        if (
            object.type === "container"
        ) {

            return Math.max(
                0,
                getObjectVolume(object)
            );
        }

        return 0;
    }


    function formatTransferAmount(source) {

        if (
            source.type === "container"
        ) {

            return `${formatNumber(
                getObjectVolume(source),
                1
            )} mL disponible`;
        }

        if (
            source.type === "liquid"
        ) {

            return `${formatNumber(
                source.volume,
                1
            )} mL disponible`;
        }

        return "Matière disponible";
    }


    function syncTransferRangeFromInput() {

        const input =
            $("transferAmount");

        const range =
            $("transferRange");

        let value =
            Number(input.value);

        const max =
            Number(range.max);

        value =
            clamp(
                value,
                0,
                max
            );

        input.value =
            value.toFixed(1);

        range.value =
            value.toFixed(1);
    }


    function syncTransferInputFromRange() {

        $("transferAmount").value =
            Number(
                $("transferRange").value
            ).toFixed(1);
    }


    function confirmTransfer() {

        const source =
            getObject(
                $("confirmTransferBtn")
                    .dataset.source
            );

        const target =
            getObject(
                $("transferTarget").value
            );

        const amount =
            Number(
                $("transferAmount").value
            );

        if (!source || !target) {
            return;
        }

        if (!Number.isFinite(amount) || amount <= 0) {

            toast(
                "Quantité de transfert invalide.",
                "warning"
            );

            return;
        }

        if (
            target.type !== "container"
        ) {

            toast(
                "La destination doit être un récipient.",
                "warning"
            );

            return;
        }

        const capacityLeft =
            Math.max(
                0,
                target.capacity -
                getObjectVolume(target)
            );

        const transferable =
            Math.min(
                amount,
                getTransferableVolume(source),
                capacityLeft
            );

        if (transferable <= 0) {

            toast(
                "Transfert impossible : capacité ou quantité insuffisante.",
                "warning"
            );

            return;
        }

        transferMatter(
            source,
            target,
            transferable
        );

        closeTransferModal();

        renderWorkspace();

        updateAll();
    }


    function transferMatter(
        source,
        target,
        volume
    ) {

        const sourceVolume =
            getObjectVolume(source);

        if (sourceVolume <= 0) {
            return false;
        }

        const ratio =
            clamp(
                volume /
                sourceVolume,
                0,
                1
            );

        const transferred =
            cloneComposition(
                source.composition
            ).map(
                (component) => {

                    component.volume *= ratio;

                    component.moles *= ratio;

                    return component;
                }
            );

        removeCompositionFraction(
            source,
            ratio
        );

        addComposition(
            target,
            transferred
        );

        if (
            source.type === "liquid"
        ) {

            source.volume =
                Math.max(
                    0,
                    source.volume -
                    volume
                );

            source.mass =
                calculateCompositionMass(
                    source.composition
                );
        }

        normalizeObjectState(
            source
        );

        normalizeObjectState(
            target
        );

        detectReactions(
            target
        );

        logObservation(
            "Transfert",
            `${formatNumber(
                volume,
                1
            )} mL transférés de ${source.name} vers ${target.name}.`,
            "transfer"
        );

        toast(
            `Transfert de ${formatNumber(
                volume,
                1
            )} mL effectué.`,
            "success"
        );

        return true;
    }


    function removeCompositionFraction(
        object,
        ratio
    ) {

        if (!Array.isArray(object.composition)) {
            return;
        }

        object.composition.forEach(
            (component) => {

                component.moles *=
                    (1 - ratio);

                component.volume *=
                    (1 - ratio);
            }
        );

        object.composition =
            object.composition.filter(
                (component) =>
                    component.moles >
                        0.0000001 ||
                    component.volume >
                        0.000001
            );
    }


    function addComposition(
        target,
        components
    ) {

        if (!Array.isArray(
            target.composition
        )) {
            target.composition = [];
        }

        components.forEach(
            (incoming) => {

                const existing =
                    target.composition.find(
                        (component) =>
                            component.materialId ===
                            incoming.materialId
                    );

                if (existing) {

                    existing.moles +=
                        incoming.moles;

                    existing.volume +=
                        incoming.volume;

                } else {

                    target.composition.push(
                        {
                            ...incoming
                        }
                    );
                }
            }
        );
    }


    /* ============================================================
       MIXING ENGINE
    ============================================================ */

    function mixObject(id) {

        const object =
            getObject(id);

        if (!object) {
            return;
        }

        if (
            object.type !== "container"
        ) {

            toast(
                "Le mélange doit être effectué dans un récipient.",
                "warning"
            );

            return;
        }

        if (
            !object.composition.length
        ) {

            toast(
                "Le récipient ne contient aucune matière.",
                "warning"
            );

            return;
        }

        object.mixed = true;

        object.temperature =
            calculateEquilibriumTemperature(
                object
            );

        object.ph =
            calculatePH(
                object
            );

        detectReactions(
            object
        );

        normalizeObjectState(
            object
        );

        state.selectedId =
            object.id;

        renderWorkspace();

        updateAll();

        logObservation(
            "Mélange",
            `${object.name} mélangé. Le moteur recalcule la composition et l'état chimique.`,
            "mix"
        );

        toast(
            "Mélange effectué. État chimique recalculé.",
            "success"
        );
    }


    /* ============================================================
       REACTION ENGINE
    ============================================================ */

    function detectReactions(
        object
    ) {

        if (
            object.type !== "container" ||
            !object.composition.length
        ) {
            return;
        }

        let reactionDetected =
            false;

        for (
            const reaction
            of REACTIONS
        ) {

            const available =
                reaction.reactants.every(
                    (materialId) =>
                        hasMaterial(
                            object,
                            materialId
                        )
                );

            if (!available) {
                continue;
            }

            const result =
                reaction.execute(
                    object
                );

            if (!result) {
                continue;
            }

            reactionDetected = true;

            object.reaction =
                object.reaction ||
                {};

            object.reaction.name =
                reaction.name;

            if (object.reaction.gas) {
                object.gas =
                    object.gas ||
                    {
                        formula:
                            object.reaction.gas,
                        amount: 1,
                        active: true
                    };
            }

            if (
                object.reaction.precipitate
            ) {
                object.precipitate =
                    object.reaction.precipitate;
            }

            logObservation(
                result.title,
                result.message,
                result.type
            );

            triggerReactionVisual(
                object
            );
        }

        object.ph =
            calculatePH(
                object
            );

        object.color =
            calculateSolutionColor(
                object
            );

        return reactionDetected;
    }


    function hasMaterial(
        object,
        materialId
    ) {

        return object.composition.some(
            (component) =>
                component.materialId ===
                    materialId &&
                (
                    component.moles > 0.0000001 ||
                    component.volume > 0.000001
                )
        );
    }


    function getComponent(
        solution,
        materialId
    ) {

        return solution.composition.find(
            (component) =>
                component.materialId ===
                materialId
        );
    }


    function triggerReactionVisual(
        object
    ) {

        state.reactionFlash =
            true;

        const overlay =
            $("reactionOverlay");

        if (overlay) {

            overlay.classList.add(
                "active"
            );

            setTimeout(
                () => {

                    overlay.classList.remove(
                        "active"
                    );

                },
                900
            );
        }

        setTimeout(
            () => {

                state.reactionFlash =
                    false;

                renderWorkspace();

            },
            950
        );
    }


    /* ============================================================
       PH ENGINE
    ============================================================ */

    function calculatePH(
        object
    ) {

        if (
            !object ||
            !object.composition ||
            !object.composition.length
        ) {
            return null;
        }

        const hcl =
            getComponent(
                object,
                "hydrochloric-acid"
            );

        const naoh =
            getComponent(
                object,
                "sodium-hydroxide"
            );

        const water =
            getComponent(
                object,
                "water"
            );

        let acidic =
            hcl
                ? Math.max(
                    0,
                    hcl.moles
                )
                : 0;

        let basic =
            naoh
                ? Math.max(
                    0,
                    naoh.moles
                )
                : 0;

        const totalVolume =
            Math.max(
                getObjectVolume(object) /
                    1000,
                0.000001
            );

        if (
            acidic <= 0 &&
            basic <= 0
        ) {

            const phValues =
                object.composition
                    .map(
                        (component) =>
                            component.ph
                    )
                    .filter(
                        (value) =>
                            Number.isFinite(value)
                    );

            if (!phValues.length) {
                return null;
            }

            let average =
                phValues.reduce(
                    (sum, value) =>
                        sum + value,
                    0
                ) /
                phValues.length;

            if (water) {
                average =
                    (average + 7) /
                    2;
            }

            return round(
                clamp(
                    average,
                    0,
                    14
                ),
                2
            );
        }


        const net =
            basic -
            acidic;


        if (Math.abs(net) < 0.00000001) {
            return 7;
        }


        if (net > 0) {

            const concentration =
                Math.max(
                    net /
                    totalVolume,
                    0.000000000001
                );

            const pOH =
                -Math.log10(
                    concentration
                );

            return round(
                clamp(
                    14 - pOH,
                    0,
                    14
                ),
                2
            );
        }


        const concentration =
            Math.max(
                Math.abs(net) /
                totalVolume,
                0.000000000001
            );

        const ph =
            -Math.log10(
                concentration
            );

        return round(
            clamp(
                ph,
                0,
                14
            ),
            2
        );
    }


    /* ============================================================
       COLOR ENGINE
    ============================================================ */

    function calculateSolutionColor(
        object
    ) {

        if (
            !object ||
            !object.composition ||
            !object.composition.length
        ) {

            return "rgba(150,220,255,.10)";
        }

        const active =
            object.composition.filter(
                (component) =>
                    component.moles >
                        0.0000001 ||
                    component.volume >
                        0.000001
            );

        if (!active.length) {
            return "rgba(150,220,255,.10)";
        }


        if (
            object.reaction &&
            object.reaction.color
        ) {

            return colorToRGBA(
                object.reaction.color,
                0.48
            );
        }


        const weighted =
            active.map(
                (component) => {

                    const color =
                        parseColor(
                            component.color
                        );

                    const weight =
                        Math.max(
                            component.volume,
                            component.moles * 10,
                            0.01
                        );

                    return {
                        color,
                        weight
                    };
                }
            );


        const totalWeight =
            weighted.reduce(
                (sum, item) =>
                    sum + item.weight,
                0
            );

        if (!totalWeight) {
            return "rgba(150,220,255,.12)";
        }


        const rgb =
            weighted.reduce(
                (result, item) => {

                    result.r +=
                        item.color.r *
                        item.weight;

                    result.g +=
                        item.color.g *
                        item.weight;

                    result.b +=
                        item.color.b *
                        item.weight;

                    return result;

                },
                {
                    r: 0,
                    g: 0,
                    b: 0
                }
            );


        return `
            rgba(
                ${Math.round(
                    rgb.r /
                    totalWeight
                )},
                ${Math.round(
                    rgb.g /
                    totalWeight
                )},
                ${Math.round(
                    rgb.b /
                    totalWeight
                )},
                .48
            )
        `;
    }


    /* ============================================================
       THERMAL ENGINE
    ============================================================ */

    function heatObject(id) {

        const object =
            getObject(id);

        if (!object) {
            return;
        }

        if (
            object.type !== "container" &&
            object.type !== "liquid"
        ) {

            toast(
                "Cet élément ne peut pas être chauffé directement.",
                "warning"
            );

            return;
        }

        const oldTemperature =
            object.temperature;

        object.temperature =
            clamp(
                object.temperature +
                    CONFIG.thermalStep,
                CONFIG.minTemperature,
                CONFIG.maxTemperature
            );

        object.heated =
            true;

        if (
            object.composition?.length
        ) {

            object.composition.forEach(
                (component) => {

                    const material =
                        getMaterial(
                            component.materialId
                        );

                    if (!material) {
                        return;
                    }

                    component.state =
                        getThermalState(
                            material,
                            object.temperature
                        );
                }
            );

            if (
                object.temperature >= 80
            ) {

                object.reaction =
                    object.reaction ||
                    {};

                object.reaction.phase =
                    "Chauffage actif";
            }
        }

        updateTemperatureOverlay();

        renderWorkspace();

        updateAll();

        logObservation(
            "Chauffage",
            `${object.name} passe de ${formatNumber(
                oldTemperature,
                1
            )} °C à ${formatNumber(
                object.temperature,
                1
            )} °C.`,
            "thermal"
        );

        toast(
            `Température : ${formatNumber(
                object.temperature,
                1
            )} °C`,
            "thermal"
        );
    }


    function getThermalState(
        material,
        temperature
    ) {

        if (
            material.id === "water"
        ) {

            if (temperature >= 100) {
                return "gaz";
            }

            if (temperature <= 0) {
                return "solide";
            }

            return "liquide";
        }

        if (
            material.id === "ethanol"
        ) {

            if (temperature >= 78) {
                return "gaz";
            }

            return "liquide";
        }

        return material.state || "stable";
    }


    function calculateEquilibriumTemperature(
        object
    ) {

        if (
            !object.composition.length
        ) {
            return object.temperature;
        }

        let weightedTemp = 0;
        let totalMass = 0;

        object.composition.forEach(
            (component) => {

                const material =
                    getMaterial(
                        component.materialId
                    );

                if (!material) {
                    return;
                }

                const mass =
                    component.volume *
                    (
                        material.density ||
                        1
                    );

                weightedTemp +=
                    mass *
                    (
                        material.temperature ||
                        25
                    );

                totalMass +=
                    mass;
            }
        );

        if (!totalMass) {
            return object.temperature;
        }

        return round(
            weightedTemp /
            totalMass,
            1
        );
    }


    /* ============================================================
       MEASUREMENT ENGINE
    ============================================================ */

    function measureObject(id) {

        const object =
            getObject(id);

        if (!object) {
            return;
        }

        let result;

        switch (object.type) {

            case "container":
            case "liquid":

                result = {
                    type: "volume",
                    label: "Volume",
                    value:
                        getObjectVolume(
                            object
                        ),
                    unit: "mL",
                    precision: "± 0.1 mL"
                };

                break;


            case "thermometer":

                result = {
                    type: "temperature",
                    label: "Température",
                    value:
                        object.temperature,
                    unit: "°C",
                    precision: "± 0.1 °C"
                };

                break;


            case "balance":

                result = {
                    type: "mass",
                    label: "Masse",
                    value:
                        object.lastMass || 0,
                    unit: "g",
                    precision: "± 0.01 g"
                };

                break;


            case "ph-meter":

                result = {
                    type: "ph",
                    label: "pH",
                    value:
                        object.lastPH ?? null,
                    unit: "pH",
                    precision: "± 0.01 pH"
                };

                break;


            default:

                result = {
                    type: "mass",
                    label: "Masse",
                    value:
                        object.mass || 0,
                    unit: "g",
                    precision: "± 0.01 g"
                };
        }


        if (
            object.type === "container"
        ) {

            const ph =
                calculatePH(
                    object
                );

            if (
                state.measurement.type ===
                "ph"
            ) {

                result = {
                    type: "ph",
                    label: "pH",
                    value: ph,
                    unit: "pH",
                    precision: "± 0.01 pH"
                };
            }

            if (
                state.measurement.type ===
                "temperature"
            ) {

                result = {
                    type: "temperature",
                    label: "Température",
                    value:
                        object.temperature,
                    unit: "°C",
                    precision: "± 0.1 °C"
                };
            }

            if (
                state.measurement.type ===
                "mass"
            ) {

                result = {
                    type: "mass",
                    label: "Masse",
                    value:
                        getObjectTotalMass(
                            object
                        ),
                    unit: "g",
                    precision: "± 0.01 g"
                };
            }

            if (
                state.measurement.type ===
                "density"
            ) {

                result = {
                    type: "density",
                    label: "Densité",
                    value:
                        calculateObjectDensity(
                            object
                        ),
                    unit: "g/mL",
                    precision: "± 0.001 g/mL"
                };
            }

            if (
                state.measurement.type ===
                "volume"
            ) {

                result = {
                    type: "volume",
                    label: "Volume",
                    value:
                        getObjectVolume(
                            object
                        ),
                    unit: "mL",
                    precision: "± 0.1 mL"
                };
            }
        }


        if (
            object.type === "ph-meter"
        ) {

            object.lastPH =
                findSelectedSolutionPH();

            result = {
                type: "ph",
                label: "pH",
                value:
                    object.lastPH,
                unit: "pH",
                precision: "± 0.01 pH"
            };
        }


        if (
            object.type === "thermometer"
        ) {

            object.temperature =
                findSelectedTemperature();

            result = {
                type: "temperature",
                label: "Température",
                value:
                    object.temperature,
                unit: "°C",
                precision: "± 0.1 °C"
            };
        }


        if (
            object.type === "balance"
        ) {

            object.lastMass =
                findSelectedMass();

            result = {
                type: "mass",
                label: "Masse",
                value:
                    object.lastMass,
                unit: "g",
                precision: "± 0.01 g"
            };
        }


        state.measurement =
            {
                ...state.measurement,
                ...result
            };


        updateMeasurementDisplay();

        updateInspector();

        logObservation(
            "Mesure",
            `${result.label} : ${
                result.value === null
                    ? "—"
                    : formatNumber(
                        result.value,
                        measurementDigits(
                            result.type
                        )
                    )
            } ${result.unit || ""}`,
            "measurement"
        );

        toast(
            `${result.label} mesuré : ${
                result.value === null
                    ? "—"
                    : formatNumber(
                        result.value,
                        measurementDigits(
                            result.type
                        )
                    )
            } ${result.unit || ""}`,
            "info"
        );

        openModal(
            "measurementModal"
        );
    }


    function openMeasurementForSelected() {

        if (!state.selectedId) {

            toast(
                "Sélectionnez un élément à mesurer.",
                "warning"
            );

            return;
        }

        openMeasurementForObject(
            getObject(
                state.selectedId
            )
        );
    }


    function openMeasurementForObject(
        object
    ) {

        if (!object) {
            return;
        }

        state.measurement.type =
            "volume";

        qsa(".measurement-option")
            .forEach(
                (button) => {

                    button.classList.toggle(
                        "active",
                        button.dataset.measurement ===
                            "volume"
                    );
                }
            );

        measureObject(
            object.id
        );
    }


    function updateMeasurementDisplay() {

        const type =
            state.measurement.type;

        const selected =
            getSelectedObject();

        if (selected) {

            if (type === "volume") {

                state.measurement.value =
                    getObjectVolume(
                        selected
                    );

                state.measurement.label =
                    "Volume";

                state.measurement.unit =
                    "mL";

                state.measurement.precision =
                    "± 0.1 mL";
            }

            if (type === "temperature") {

                state.measurement.value =
                    selected.temperature ??
                    findSelectedTemperature();

                state.measurement.label =
                    "Température";

                state.measurement.unit =
                    "°C";

                state.measurement.precision =
                    "± 0.1 °C";
            }

            if (type === "ph") {

                state.measurement.value =
                    selected.type === "container"
                        ? calculatePH(selected)
                        : findSelectedSolutionPH();

                state.measurement.label =
                    "pH";

                state.measurement.unit =
                    "pH";

                state.measurement.precision =
                    "± 0.01 pH";
            }

            if (type === "mass") {

                state.measurement.value =
                    getObjectTotalMass(
                        selected
                    );

                state.measurement.label =
                    "Masse";

                state.measurement.unit =
                    "g";

                state.measurement.precision =
                    "± 0.01 g";
            }

            if (type === "density") {

                state.measurement.value =
                    calculateObjectDensity(
                        selected
                    );

                state.measurement.label =
                    "Densité";

                state.measurement.unit =
                    "g/mL";

                state.measurement.precision =
                    "± 0.001 g/mL";
            }
        }


        const value =
            state.measurement.value;

        $("measurementLabel").textContent =
            state.measurement.label ||
            "Mesure";

        $("measurementValue").textContent =
            value === null ||
            value === undefined
                ? "—"
                : formatNumber(
                    value,
                    measurementDigits(
                        type
                    )
                ) +
                ` ${
                    state.measurement.unit ||
                    ""
                }`;

        $("measurementPrecision").textContent =
            state.measurement.precision ||
            "—";


        $("instrumentScreenLabel").textContent =
            state.measurement.label ||
            "MESURE";

        $("instrumentScreenValue").textContent =
            value === null ||
            value === undefined
                ? "—"
                : formatNumber(
                    value,
                    measurementDigits(
                        type
                    )
                );

        $("instrumentScreenUnit").textContent =
            state.measurement.unit ||
            "—";
    }


    function measurementDigits(type) {

        switch (type) {

            case "ph":
                return 2;

            case "mass":
                return 2;

            case "density":
                return 3;

            case "temperature":
                return 1;

            default:
                return 1;
        }
    }


    /* ============================================================
       INSPECTOR ENGINE
    ============================================================ */

    function updateInspector() {

        const selected =
            getSelectedObject();

        const empty =
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

        if (!selected) {

            showElement(
                empty
            );

            hideElement(
                materialProperties
            );

            hideElement(
                compositionSection
            );

            hideElement(
                measurementSection
            );

            hideElement(
                reactionSection
            );

            hideElement(
                objectActions
            );

            if ($("selectedObjectType")) {
                $("selectedObjectType")
                    .textContent =
                    "Aucun";
            }

            return;
        }


        hideElement(empty);

        showElement(
            materialProperties
        );

        showElement(
            objectActions
        );


        if ($("selectedObjectType")) {

            $("selectedObjectType")
                .textContent =
                getTypeLabel(
                    selected.type
                );
        }


        $("propName").textContent =
            selected.name;

        $("propState").textContent =
            getObjectPhysicalState(
                selected
            );

        $("propTemperature").textContent =
            `${formatNumber(
                selected.temperature ??
                CONFIG.defaultTemperature,
                1
            )} °C`;

        $("propMass").textContent =
            `${formatNumber(
                getObjectTotalMass(
                    selected
                ),
                3
            )} g`;

        $("propVolume").textContent =
            selected.type === "container" ||
            selected.type === "liquid"
                ? `${formatNumber(
                    getObjectVolume(
                        selected
                ),
                    1
                )} mL`
                : "—";

        $("propDensity").textContent =
            calculateObjectDensity(
                selected
            ) !== null
                ? `${formatNumber(
                    calculateObjectDensity(
                        selected
                    ),
                    3
                )} g/mL`
                : "—";

        $("propPH").textContent =
            selected.type === "container"
                ? formatPH(
                    calculatePH(
                        selected
                    )
                )
                : "—";

        $("propColor").textContent =
            getColorLabel(
                selected
            );


        const hasComposition =
            selected.type === "container" &&
            selected.composition &&
            selected.composition.length;


        if (hasComposition) {

            showElement(
                compositionSection
            );

            renderComposition(
                selected
            );

            showElement(
                reactionSection
            );

            updateReactionInspector(
                selected
            );

        } else {

            hideElement(
                compositionSection
            );

            hideElement(
                reactionSection
            );
        }


        if (
            selected.type === "container" ||
            selected.type === "liquid" ||
            selected.type === "thermometer" ||
            selected.type === "ph-meter" ||
            selected.type === "balance"
        ) {

            showElement(
                measurementSection
            );

        } else {

            hideElement(
                measurementSection
            );
        }


        updateMeasurementDisplay();
    }


    function renderComposition(
        object
    ) {

        const list =
            $("compositionList");

        if (!list) {
            return;
        }

        list.innerHTML = "";

        const components =
            object.composition || [];

        $("compositionTotal")
            .textContent =
            components.length;


        components.forEach(
            (component) => {

                const item =
                    document.createElement("div");

                item.className =
                    "composition-item";

                const material =
                    getMaterial(
                        component.materialId
                    );

                const concentration =
                    component.volume > 0
                        ? component.moles /
                            (
                                component.volume /
                                1000
                            )
                        : 0;

                item.innerHTML = `

                    <div class="composition-main">

                        <strong>
                            ${escapeHTML(
                                component.name
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                component.formula ||
                                "—"
                            )}
                        </small>

                    </div>

                    <div class="composition-values">

                        <span>
                            ${formatNumber(
                                component.volume,
                                2
                            )} mL
                        </span>

                        <span>
                            ${formatNumber(
                                component.moles,
                                4
                            )} mol
                        </span>

                    </div>

                    <div class="composition-meta">

                        ${
                            material?.density
                                ? `
                                    ρ =
                                    ${formatNumber(
                                        material.density,
                                        3
                                    )} g/mL
                                `
                                : ""
                        }

                        ${
                            concentration
                                ? `
                                    C =
                                    ${formatNumber(
                                        concentration,
                                        3
                                    )} mol/L
                                `
                                : ""
                        }

                    </div>
                `;

                list.appendChild(
                    item
                );
            }
        );
    }


    function updateReactionInspector(
        object
    ) {

        const reaction =
            object.reaction;

        $("reactionStatus").textContent =
            reaction?.name ||
            "Aucune";

        $("reactionPhase").textContent =
            reaction?.phase ||
            (
                object.mixed
                    ? "Mélangé"
                    : "Stable"
            );

        $("reactionGas").textContent =
            object.gas?.formula ||
            "Aucun";

        $("reactionPrecipitate").textContent =
            object.precipitate ||
            "Aucun";

        $("reactionColor").textContent =
            reaction?.color ||
            getColorLabel(object);
    }


    /* ============================================================
       INVENTORY
    ============================================================ */

    function renderInventory() {

        const list =
            $("inventoryList");

        if (!list) {
            return;
        }

        list.innerHTML = "";

        if ($("inventoryCount")) {
            $("inventoryCount").textContent =
                state.objects.length;
        }

        if (!state.objects.length) {

            list.innerHTML = `
                <div class="inventory-empty">
                    Aucun matériel ajouté.
                </div>
            `;

            return;
        }


        state.objects.forEach(
            (object) => {

                const item =
                    document.createElement("button");

                item.type = "button";

                item.className =
                    "inventory-item";

                item.classList.toggle(
                    "active",
                    object.id ===
                        state.selectedId
                );

                item.innerHTML = `

                    <span class="inventory-icon">
                        ${escapeHTML(
                            object.icon || "•"
                        )}
                    </span>

                    <span class="inventory-info">

                        <strong>
                            ${escapeHTML(
                                object.name
                            )}
                        </strong>

                        <small>
                            ${getTypeLabel(
                                object.type
                            )}
                        </small>

                    </span>
                `;

                item.addEventListener(
                    "click",
                    () => {

                        state.selectedId =
                            object.id;

                        renderWorkspace();

                        updateAll();

                        centerOnObject(
                            object
                        );
                    }
                );

                list.appendChild(
                    item
                );
            }
        );
    }


    /* ============================================================
       STATUS ENGINE
    ============================================================ */

    function updateStatus() {

        const selected =
            getSelectedObject();

        const containers =
            state.objects.filter(
                (object) =>
                    object.type ===
                    "container"
            );

        const totalVolume =
            containers.reduce(
                (sum, object) =>
                    sum +
                    getObjectVolume(
                        object
                    ),
                0
            );

        const totalMass =
            state.objects.reduce(
                (sum, object) =>
                    sum +
                    (
                        object.type ===
                            "container"
                            ? getObjectTotalMass(
                                object
                            )
                            : object.type ===
                                "solid"
                                ? object.mass || 0
                                : 0
                    ),
                0
            );

        const temperature =
            selected?.temperature ??
            calculateLaboratoryTemperature();

        const ph =
            selected?.type === "container"
                ? calculatePH(
                    selected
                )
                : findLaboratoryPH();


        $("statusObjects").textContent =
            state.objects.length;

        $("statusVolume").textContent =
            `${formatNumber(
                totalVolume,
                1
            )} mL`;

        $("statusTemperature").textContent =
            `${formatNumber(
                temperature,
                1
            )} °C`;

        $("statusPH").textContent =
            formatPH(ph);

        $("statusMass").textContent =
            `${formatNumber(
                totalMass,
                1
            )} g`;


        state.laboratory = {

            temperature,

            totalVolume,

            totalMass,

            ph
        };
    }


    function calculateLaboratoryTemperature() {

        if (!state.objects.length) {
            return CONFIG.defaultTemperature;
        }

        const thermalObjects =
            state.objects.filter(
                (object) =>
                    Number.isFinite(
                        object.temperature
                    )
            );

        if (!thermalObjects.length) {
            return CONFIG.defaultTemperature;
        }

        const sum =
            thermalObjects.reduce(
                (total, object) =>
                    total +
                    object.temperature,
                0
            );

        return round(
            sum /
            thermalObjects.length,
            1
        );
    }


    function findLaboratoryPH() {

        const solution =
            state.objects.find(
                (object) =>
                    object.type ===
                        "container" &&
                    getObjectVolume(
                        object
                    ) > 0
            );

        return solution
            ? calculatePH(solution)
            : null;
    }


    function findSelectedSolutionPH() {

        const selected =
            getSelectedObject();

        if (
            selected?.type ===
            "container"
        ) {
            return calculatePH(
                selected
            );
        }

        return findLaboratoryPH();
    }


    function findSelectedTemperature() {

        const selected =
            getSelectedObject();

        return selected?.temperature ??
            calculateLaboratoryTemperature();
    }


    function findSelectedMass() {

        const selected =
            getSelectedObject();

        return selected
            ? getObjectTotalMass(
                selected
            )
            : 0;
    }


    /* ============================================================
       OBJECT STATE
    ============================================================ */

    function normalizeObjectState(
        object
    ) {

        if (!object) {
            return;
        }

        if (
            object.type === "container"
        ) {

            object.volume =
                getObjectVolume(
                    object
                );

            object.mass =
                getObjectTotalMass(
                    object
                );

            object.fillLevel =
                object.capacity > 0
                    ? clamp(
                        object.volume /
                        object.capacity,
                        0,
                        1
                    )
                    : 0;

            object.ph =
                calculatePH(
                    object
                );

            object.color =
                calculateSolutionColor(
                    object
                );
        }

        if (
            object.type === "liquid"
        ) {

            object.volume =
                Math.max(
                    0,
                    object.volume || 0
                );

            object.mass =
                calculateCompositionMass(
                    object.composition
                );
        }
    }


    /* ============================================================
       MATERIAL / MASS / VOLUME
    ============================================================ */

    function getObjectVolume(
        object
    ) {

        if (!object) {
            return 0;
        }

        if (
            object.type === "liquid"
        ) {
            return Math.max(
                0,
                Number(
                    object.volume || 0
                )
            );
        }

        if (
            object.type !== "container"
        ) {
            return 0;
        }

        return (
            object.composition || []
        ).reduce(
            (sum, component) =>
                sum +
                Number(
                    component.volume || 0
                ),
            0
        );
    }


    function getObjectTotalMass(
        object
    ) {

        if (!object) {
            return 0;
        }

        if (
            object.type === "container"
        ) {

            const glassMass =
                Number(
                    object.mass || 0
                );

            const liquidMass =
                calculateCompositionMass(
                    object.composition
                );

            return glassMass +
                liquidMass;
        }

        if (
            object.type === "liquid"
        ) {

            return calculateCompositionMass(
                object.composition
            );
        }

        return Number(
            object.mass || 0
        );
    }


    function calculateCompositionMass(
        composition
    ) {

        if (!Array.isArray(
            composition
        )) {
            return 0;
        }

        return composition.reduce(
            (sum, component) => {

                const material =
                    getMaterial(
                        component.materialId
                    );

                if (!material) {
                    return sum;
                }

                if (
                    component.volume >
                    0
                ) {

                    return sum +
                        component.volume *
                        (
                            material.density ||
                            1
                        );
                }

                if (
                    component.moles >
                    0 &&
                    material.molarMass
                ) {

                    return sum +
                        component.moles *
                        material.molarMass;
                }

                return sum;

            },
            0
        );
    }


    function calculateObjectDensity(
        object
    ) {

        if (!object) {
            return null;
        }

        const volume =
            getObjectVolume(
                object
            );

        if (volume <= 0) {
            return null;
        }

        const mass =
            calculateCompositionMass(
                object.composition
            );

        if (mass <= 0) {
            return null;
        }

        return mass /
            volume;
    }


    function calculateMassFromVolume(
        volume,
        density
    ) {

        return (
            Number(volume || 0) *
            Number(density || 1)
        );
    }


    function calculateMoles(
        volumeML,
        density,
        molarMass
    ) {

        if (
            !molarMass ||
            molarMass <= 0
        ) {
            return 0;
        }

        const mass =
            calculateMassFromVolume(
                volumeML,
                density
            );

        return mass /
            molarMass;
    }


    function calculateMolesFromMass(
        mass,
        molarMass
    ) {

        if (
            !molarMass ||
            molarMass <= 0
        ) {
            return 0;
        }

        return (
            Number(mass || 0) /
            molarMass
        );
    }


    /* ============================================================
       PHYSICAL STATE
    ============================================================ */

    function getObjectPhysicalState(
        object
    ) {

        if (
            object.type === "container"
        ) {

            const volume =
                getObjectVolume(
                    object
                );

            if (!volume) {
                return "Récipient vide";
            }

            const states =
                object.composition.map(
                    (component) =>
                        component.state
                );

            if (
                states.includes("gaz")
            ) {
                return "Gaz / système mixte";
            }

            if (
                states.includes("solide")
            ) {
                return "Système mixte";
            }

            return "Liquide";
        }

        return object.state ||
            "Stable";
    }


    /* ============================================================
       OBJECT SELECTION / REMOVAL
    ============================================================ */

    function getObject(id) {

        return state.objects.find(
            (object) =>
                object.id === id
        );
    }


    function getSelectedObject() {

        return state.selectedId
            ? getObject(
                state.selectedId
            )
            : null;
    }


    function removeSelected() {

        if (!state.selectedId) {

            toast(
                "Aucun objet sélectionné.",
                "warning"
            );

            return;
        }

        const object =
            getSelectedObject();

        if (!object) {
            return;
        }

        state.objects =
            state.objects.filter(
                (item) =>
                    item.id !==
                    object.id
            );

        state.selectedId =
            null;

        renderWorkspace();

        updateAll();

        logObservation(
            "Laboratoire",
            `${object.name} retiré du laboratoire.`,
            "remove"
        );

        toast(
            `${object.name} retiré.`,
            "info"
        );
    }


    /* ============================================================
       KEYBOARD
    ============================================================ */

    function handleKeyboard(event) {

        if (
            event.key === "Delete" ||
            event.key === "Backspace"
        ) {

            const active =
                document.activeElement;

            const isInput =
                active &&
                (
                    active.tagName ===
                        "INPUT" ||
                    active.tagName ===
                        "TEXTAREA" ||
                    active.tagName ===
                        "SELECT"
                );

            if (!isInput) {
                event.preventDefault();
                removeSelected();
            }
        }


        if (
            event.key === "+"
        ) {

            changeZoom(
                CONFIG.zoomStep
            );
        }


        if (
            event.key === "-"
        ) {

            changeZoom(
                -CONFIG.zoomStep
            );
        }
    }


    /* ============================================================
       ZOOM ENGINE
    ============================================================ */

    function changeZoom(
        delta
    ) {

        state.zoom =
            clamp(
                state.zoom + delta,
                CONFIG.minZoom,
                CONFIG.maxZoom
            );

        applyZoom();
    }


    function applyZoom() {

        const canvas =
            $("chemistryCanvas");

        if (!canvas) {
            return;
        }

        canvas.style.width =
            `${CONFIG.workspaceWidth}px`;

        canvas.style.height =
            `${CONFIG.workspaceHeight}px`;

        canvas.style.transform =
            `scale(${state.zoom})`;

        canvas.style.transformOrigin =
            "top left";

        if ($("zoomValue")) {

            $("zoomValue").textContent =
                `${Math.round(
                    state.zoom * 100
                )}%`;
        }
    }


    function fitWorkspace() {

        const viewport =
            $("workspaceViewport");

        if (!viewport) {
            return;
        }

        const availableWidth =
            viewport.clientWidth -
            24;

        const availableHeight =
            viewport.clientHeight -
            24;

        const scaleX =
            availableWidth /
            CONFIG.workspaceWidth;

        const scaleY =
            availableHeight /
            CONFIG.workspaceHeight;

        state.zoom =
            clamp(
                Math.min(
                    scaleX,
                    scaleY
                ),
                CONFIG.minZoom,
                CONFIG.maxZoom
            );

        applyZoom();

        toast(
            `Espace ajusté à ${Math.round(
                state.zoom * 100
            )}%.`,
            "info"
        );
    }


    /* ============================================================
       CENTER OBJECT
    ============================================================ */

    function centerOnObject(
        object
    ) {

        const viewport =
            $("workspaceViewport");

        if (!viewport || !object) {
            return;
        }

        const x =
            object.x *
            state.zoom -
            viewport.clientWidth /
                2 +
            object.width *
                state.zoom /
                2;

        const y =
            object.y *
            state.zoom -
            viewport.clientHeight /
                2 +
            object.height *
                state.zoom /
                2;

        viewport.scrollTo({
            left:
                Math.max(
                    0,
                    x
                ),
            top:
                Math.max(
                    0,
                    y
                ),
            behavior: "smooth"
        });
    }


    /* ============================================================
       DROP ZONE
    ============================================================ */

    function updateDropZone() {

        const dropZone =
            $("workspaceDropZone");

        if (!dropZone) {
            return;
        }

        dropZone.classList.toggle(
            "hidden",
            state.objects.length > 0
        );
    }


    /* ============================================================
       TEMPERATURE VISUAL
    ============================================================ */

    function updateTemperatureOverlay() {

        const overlay =
            $("temperatureOverlay");

        if (!overlay) {
            return;
        }

        const temperature =
            state.laboratory.temperature;

        if (
            temperature <= 28
        ) {

            overlay.style.opacity =
                "0";

            return;
        }

        const intensity =
            clamp(
                (
                    temperature -
                    28
                ) /
                100,
                0,
                0.55
            );

        overlay.style.opacity =
            intensity.toFixed(2);
    }


    /* ============================================================
       WORKSPACE CLEAR / RESET
    ============================================================ */

    function clearWorkspace() {

        if (!state.objects.length) {

            toast(
                "L'espace est déjà vide.",
                "info"
            );

            return;
        }

        state.objects = [];

        state.selectedId =
            null;

        state.nextObjectId =
            1;

        state.observations = [];

        renderWorkspace();

        renderInventory();

        updateAll();

        logObservation(
            "Laboratoire",
            "Espace de manipulation vidé.",
            "system"
        );

        toast(
            "Espace de manipulation vidé.",
            "info"
        );
    }


    function resetLaboratory() {

        const confirmed =
            window.confirm(
                "Réinitialiser complètement le laboratoire ?"
            );

        if (!confirmed) {
            return;
        }

        state.objects = [];

        state.observations = [];

        state.selectedId =
            null;

        state.nextObjectId =
            1;

        state.zoom =
            CONFIG.defaultZoom;

        state.tool =
            "select";

        state.category =
            "all";

        state.query =
            "";

        state.measurement = {

            type: "volume",

            value: null,

            unit: null,

            precision: null,

            label: "Mesure"
        };


        if ($("materialSearch")) {
            $("materialSearch").value =
                "";
        }

        if ($("sessionName")) {
            $("sessionName").value =
                "Expérience chimique";
        }

        state.sessionName =
            "Expérience chimique";


        setTool("select");

        renderLibrary();

        renderWorkspace();

        updateAll();

        $("observationLog").innerHTML =
            "";

        logObservation(
            "Système",
            "Laboratoire réinitialisé.",
            "system"
        );

        toast(
            "Laboratoire réinitialisé.",
            "success"
        );
    }


    /* ============================================================
       SAVE ENGINE
    ============================================================ */

    function saveSession() {

        const payload = {

            version:
                state.version,

            sessionName:
                state.sessionName,

            zoom:
                state.zoom,

            objects:
                state.objects,

            observations:
                state.observations,

            savedAt:
                new Date().toISOString()
        };


        try {

            localStorage.setItem(
                CONFIG.storageKey,
                JSON.stringify(
                    payload
                )
            );

        } catch (error) {

            toast(
                "Impossible d'enregistrer localement la session.",
                "error"
            );

            return;
        }


        downloadJSON(
            payload,
            createSafeFilename(
                state.sessionName
            )
        );


        logObservation(
            "Session",
            "Session chimique enregistrée.",
            "save"
        );

        toast(
            "Session enregistrée.",
            "success"
        );
    }


    function restoreSession() {

        try {

            const raw =
                localStorage.getItem(
                    CONFIG.storageKey
                );

            if (!raw) {
                return false;
            }

            const payload =
                JSON.parse(raw);

            if (
                !payload ||
                !Array.isArray(
                    payload.objects
                )
            ) {
                return false;
            }

            state.sessionName =
                payload.sessionName ||
                "Expérience chimique";

            state.zoom =
                clamp(
                    Number(
                        payload.zoom ||
                        1
                    ),
                    CONFIG.minZoom,
                    CONFIG.maxZoom
                );

            state.objects =
                payload.objects;

            state.observations =
                payload.observations ||
                [];

            state.nextObjectId =
                calculateNextObjectId();

            if ($("sessionName")) {
                $("sessionName").value =
                    state.sessionName;
            }

            renderWorkspace();

            updateAll();

            return true;

        } catch (error) {

            return false;
        }
    }


    function calculateNextObjectId() {

        let max = 0;

        state.objects.forEach(
            (object) => {

                const match =
                    String(
                        object.id
                    ).match(
                        /(\d+)$/
                    );

                if (match) {

                    max =
                        Math.max(
                            max,
                            Number(
                                match[1]
                            )
                        );
                }
            }
        );

        return max + 1;
    }


    /* ============================================================
       OBSERVATION ENGINE
    ============================================================ */

    function logObservation(
        title,
        message,
        type = "info"
    ) {

        const entry = {

            id:
                `log-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 7)}`,

            title,

            message,

            type,

            time:
                new Date().toISOString()
        };


        state.observations.push(
            entry
        );


        if (
            state.observations.length >
            CONFIG.maxObservationLogs
        ) {

            state.observations =
                state.observations.slice(
                    -CONFIG.maxObservationLogs
                );
        }


        renderObservationLog();

        announce(
            `${title}. ${message}`
        );
    }


    function renderObservationLog() {

        const log =
            $("observationLog");

        if (!log) {
            return;
        }

        log.innerHTML = "";

        const entries =
            state.observations
                .slice()
                .reverse();


        if (!entries.length) {

            log.innerHTML = `
                <div class="observation-empty">
                    Aucune observation.
                </div>
            `;

            return;
        }


        entries.forEach(
            (entry) => {

                const item =
                    document.createElement("div");

                item.className =
                    `observation-entry observation-${entry.type}`;

                item.innerHTML = `

                    <div class="observation-entry-head">

                        <strong>
                            ${escapeHTML(
                                entry.title
                            )}
                        </strong>

                        <time>
                            ${formatTime(
                                entry.time
                            )}
                        </time>

                    </div>

                    <p>
                        ${escapeHTML(
                            entry.message
                        )}
                    </p>
                `;

                log.appendChild(
                    item
                );
            }
        );
    }


    /* ============================================================
       MODALS
    ============================================================ */

    function openModal(id) {

        const modal =
            $(id);

        if (!modal) {
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


    function closeModal(id) {

        const modal =
            $(id);

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "open"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        if (
            !qsa(
                ".chem-modal.open"
            ).length
        ) {

            document.body.classList.remove(
                "modal-open"
            );
        }
    }


    function closeAllModals() {

        qsa(
            ".chem-modal.open"
        ).forEach(
            (modal) => {

                closeModal(
                    modal.id
                );
            }
        );
    }


    function closeTransferModal() {

        closeModal(
            "transferModal"
        );
    }


    function closeMeasurementModal() {

        closeModal(
            "measurementModal"
        );
    }


    function closeHelpModal() {

        closeModal(
            "helpModal"
        );
    }


    /* ============================================================
       TOAST ENGINE
    ============================================================ */

    function toast(
        message,
        type = "info"
    ) {

        const stack =
            $("chemToastStack");

        if (!stack) {
            return;
        }

        const item =
            document.createElement("div");

        item.className =
            `chem-toast toast-${type}`;

        item.innerHTML = `
            <span class="toast-indicator"></span>

            <span class="toast-message">
                ${escapeHTML(
                    message
                )}
            </span>

            <button
                type="button"
                class="toast-close"
                aria-label="Fermer"
            >
                ×
            </button>
        `;

        item.querySelector(
            ".toast-close"
        ).addEventListener(
            "click",
            () => item.remove()
        );

        stack.appendChild(
            item
        );

        requestAnimationFrame(
            () => {

                item.classList.add(
                    "visible"
                );
            }
        );

        setTimeout(
            () => {

                item.classList.remove(
                    "visible"
                );

                setTimeout(
                    () => item.remove(),
                    250
                );

            },
            4200
        );
    }


    /* ============================================================
       LABORATORY STATE
    ============================================================ */

    function setLaboratoryState(
        text
    ) {

        if ($("laboratoryStateText")) {
            $("laboratoryStateText")
                .textContent =
                text;
        }

        if ($("laboratoryStateDot")) {

            $("laboratoryStateDot")
                .classList.toggle(
                    "online",
                    true
                );
        }
    }


    /* ============================================================
       UPDATE ALL
    ============================================================ */

    function updateAll() {

        state.objects.forEach(
            normalizeObjectState
        );

        updateStatus();

        updateInspector();

        renderInventory();

        renderObservationLog();

        updateTemperatureOverlay();

        updateDropZone();

        updateMeasurementDisplay();

        applyZoom();
    }


    /* ============================================================
       MATERIAL HELPERS
    ============================================================ */

    function getMaterial(
        id
    ) {

        return MATERIALS.find(
            (material) =>
                material.id === id
        );
    }


    function getTypeLabel(
        type
    ) {

        const labels = {

            container: "Récipient",

            liquid: "Liquide",

            solid: "Solide",

            thermometer: "Thermomètre",

            "ph-meter": "pH-mètre",

            balance: "Balance",

            pipette: "Pipette",

            burette: "Burette",

            "transfer-tool":
                "Transfert",

            dish:
                "Verrerie",

            stirrer:
                "Agitateur",

            heater:
                "Chauffage",

            support:
                "Support"
        };

        return labels[type] ||
            "Matériel";
    }


    function getColorLabel(
        object
    ) {

        if (
            object.reaction?.color
        ) {

            return object.reaction.color;
        }

        if (
            object.type === "container"
        ) {

            if (
                !getObjectVolume(object)
            ) {
                return "Incolore / vide";
            }

            if (
                object.composition.some(
                    (component) =>
                        component.materialId ===
                        "copper-sulfate"
                )
            ) {

                return "Bleu";
            }

            if (
                object.composition.some(
                    (component) =>
                        component.materialId ===
                        "zinc"
                )
            ) {

                return "Gris métallique";
            }

            return "Solution mélangée";
        }

        return object.color ||
            "Non défini";
    }


    /* ============================================================
       UTILITY — COLOR PARSING
    ============================================================ */

    function parseColor(
        value
    ) {

        if (!value) {
            return {
                r: 130,
                g: 210,
                b: 240
            };
        }

        const rgba =
            String(value).match(
                /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/
            );

        if (rgba) {

            return {

                r:
                    Number(
                        rgba[1]
                    ),

                g:
                    Number(
                        rgba[2]
                    ),

                b:
                    Number(
                        rgba[3]
                    )
            };
        }


        const hex =
            String(value)
                .trim()
                .replace(
                    "#",
                    ""
                );

        if (
            /^[0-9a-fA-F]{6}$/.test(
                hex
            )
        ) {

            return {

                r:
                    parseInt(
                        hex.slice(0, 2),
                        16
                    ),

                g:
                    parseInt(
                        hex.slice(2, 4),
                        16
                    ),

                b:
                    parseInt(
                        hex.slice(4, 6),
                        16
                    )
            };
        }


        return {
            r: 150,
            g: 210,
            b: 235
        };
    }


    function colorToRGBA(
        value,
        alpha
    ) {

        const rgb =
            parseColor(
                value
            );

        return `
            rgba(
                ${rgb.r},
                ${rgb.g},
                ${rgb.b},
                ${alpha}
            )
        `;
    }


    /* ============================================================
       UTILITY — FORMATTING
    ============================================================ */

    function formatNumber(
        value,
        decimals = 1
    ) {

        if (
            value === null ||
            value === undefined ||
            !Number.isFinite(
                Number(value)
            )
        ) {

            return "—";
        }

        return Number(value)
            .toFixed(decimals)
            .replace(
                /(\.\d*?[1-9])0+$/,
                "$1"
            )
            .replace(
                /\.0+$/,
                ""
            );
    }


    function formatPH(
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            !Number.isFinite(
                Number(value)
            )
        ) {
            return "—";
        }

        return Number(value)
            .toFixed(2);
    }


    function formatTime(
        iso
    ) {

        try {

            return new Intl.DateTimeFormat(
                "fr-FR",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            ).format(
                new Date(iso)
            );

        } catch {
            return "--:--:--";
        }
    }


    function createSafeFilename(
        name
    ) {

        return (
            String(name || "experience-chimique")
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .replace(
                    /[^a-zA-Z0-9-_]+/g,
                    "-"
                )
                .replace(
                    /^-+|-+$/g,
                    ""
                )
                .toLowerCase()
            ||
            "experience-chimique"
        ) +
        ".json";
    }


    function downloadJSON(
        data,
        filename
    ) {

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
            document.createElement("a");

        link.href =
            url;

        link.download =
            filename;

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        setTimeout(
            () =>
                URL.revokeObjectURL(
                    url
                ),
            1000
        );
    }


    /* ============================================================
       UTILITY — GENERAL
    ============================================================ */

    function clamp(
        value,
        min,
        max
    ) {

        return Math.min(
            Math.max(
                Number(value),
                min
            ),
            max
        );
    }


    function round(
        value,
        decimals = 2
    ) {

        const factor =
            10 ** decimals;

        return Math.round(
            value * factor
        ) / factor;
    }


    function snap(
        value,
        grid
    ) {

        return Math.round(
            value / grid
        ) * grid;
    }


    function cloneComposition(
        composition
    ) {

        return (
            composition || []
        ).map(
            (item) => ({
                ...item
            })
        );
    }


    function escapeHTML(
        value
    ) {

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


    function showElement(
        element
    ) {

        if (!element) {
            return;
        }

        element.classList.remove(
            "hidden"
        );
    }


    function hideElement(
        element
    ) {

        if (!element) {
            return;
        }

        element.classList.add(
            "hidden"
        );
    }


    /* ============================================================
       ACCESSIBILITY
    ============================================================ */

    function announce(
        message
    ) {

        const region =
            $("chemLiveRegion");

        if (!region) {
            return;
        }

        region.textContent =
            "";

        setTimeout(
            () => {

                region.textContent =
                    message;

            },
            20
        );
    }


    /* ============================================================
       PUBLIC API
    ============================================================ */

    window.FOBASChemistry = {

        version:
            CONFIG.version,

        state,

        materials:
            MATERIALS,

        reactions:
            REACTIONS,

        addMaterial,

        removeSelected,

        mixObject,

        heatObject,

        measureObject,

        saveSession,

        restoreSession,

        resetLaboratory,

        clearWorkspace,

        getObject,

        getSelectedObject,

        calculatePH,

        getObjectVolume,

        getObjectTotalMass,

        setTool
    };


    /* ============================================================
       START APPLICATION
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