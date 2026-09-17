/* ================================================================
   FOBAS — LABORATOIRE ÉLECTRONIQUE & ROBOTIQUE
   ---------------------------------------------------------------
   FICHIER : simulationrobotiquefobas.js
   VERSION : 1.0.0
   TYPE    : MOTEUR PRINCIPAL

   RESPONSABILITÉS :
   - Navigation des 20 boutons
   - Bibliothèques outils / composants / codes / missions
   - Workspace interactif
   - Ajout / sélection / déplacement / suppression
   - Connexions et fils SVG
   - Pins
   - Mesures
   - Diagnostic
   - Éditeur de code
   - Runtime contrôlé du code
   - Simulation électronique
   - Simulation robotique
   - Missions
   - Undo / Redo
   - Sauvegarde / chargement / import / export
   - Touch Android
   - Zoom à deux doigts
   - Déplacement tactile
   - Fenêtre mobile
   - Inspector
   - Notifications
   - Protection contre les erreurs de données

   IMPORTANT :
   Ce moteur ne modifie pas les données du fichier
   simulationrobotiquefobas-data.js.
================================================================ */


/* ================================================================
   01 — ENVELOPPE GLOBALE
================================================================ */

(function () {

    "use strict";


    /* ============================================================
       01.1 — PROTECTION GLOBALE
    ============================================================ */

    const APP = window.FOBAS_ROBOTICS = window.FOBAS_ROBOTICS || {};

    APP.version = "1.0.0";
    APP.name = "FOBAS — Laboratoire Électronique & Robotique";


    /* ============================================================
       01.2 — RACCOURCIS DOM
    ============================================================ */

    const $ = function (selector, root) {
        return (root || document).querySelector(selector);
    };

    const $$ = function (selector, root) {
        return Array.from(
            (root || document).querySelectorAll(selector)
        );
    };

    const byId = function (id) {
        return document.getElementById(id);
    };


    /* ============================================================
       01.3 — ÉTAT CENTRAL
    ============================================================ */

    const state = {

        initialized: false,

        activeView: "laboratoire",

        activeAction: "select",

        selectedObjectId: null,

        selectedPin: null,

        connectionStart: null,

        running: false,

        projectName: "Projet FOBAS",

        projectVersion: 1,

        workspaceScale: 1,

        workspaceOffsetX: 0,

        workspaceOffsetY: 0,

        zoomMin: 0.45,

        zoomMax: 2.50,

        gridVisible: true,

        snapEnabled: true,

        soundEnabled: true,

        touchEnabled: true,

        objects: [],

        wires: [],

        connections: [],

        history: [],

        future: [],

        consoleLines: [],

        measurements: {

            voltage: 0,

            current: 0,

            resistance: 0,

            frequency: 0,

            pwm: 0,

            temperature: 25

        },

        runtime: {

            pinModes: {},

            pinValues: {},

            analogValues: {},

            pwmValues: {},

            digitalValues: {},

            sensorValues: {},

            motorValues: {},

            variables: {},

            intervals: [],

            time: 0

        },

        mission: {

            activeId: null,

            completed: false

        }

    };


    APP.state = state;


    /* ============================================================
       01.4 — DATA PROVIDER
       ------------------------------------------------------------
       Le fichier data est chargé avant ce fichier.
       On accepte plusieurs noms de variables afin de rendre
       l'architecture tolérante.
    ============================================================ */

    function getDataSource() {

        const candidates = [

            window.FOBAS_ROBOTICS_DATA,

            window.FOBAS_ROBOTICS_DATASET,

            window.FOBAS_DATA,

            window.FOBAS_ELECTRONIQUE_ROBOTIQUE_DATA,

            window.ROBOTICS_DATA

        ];

        for (let i = 0; i < candidates.length; i++) {

            if (
                candidates[i] &&
                typeof candidates[i] === "object"
            ) {
                return candidates[i];
            }
        }

        return {};
    }


    const DATA = getDataSource();


    APP.data = DATA;


    /* ============================================================
       01.5 — NORMALISATION DES DONNÉES
    ============================================================ */

    function normalizeArray(value) {

        return Array.isArray(value) ? value : [];

    }


    function getToolsData() {

        return normalizeArray(
            DATA.tools ||
            DATA.outils ||
            DATA.TOOLS
        );

    }


    function getComponentsData() {

        return normalizeArray(
            DATA.components ||
            DATA.composants ||
            DATA.COMPONENTS
        );

    }


    function getCodesData() {

        return normalizeArray(
            DATA.codes ||
            DATA.codeLibrary ||
            DATA.codeBlocks ||
            DATA.CODES
        );

    }


    function getMissionsData() {

        return normalizeArray(
            DATA.missions ||
            DATA.MISSIONS
        );

    }


    function getCategoriesData() {

        return normalizeArray(
            DATA.categories ||
            DATA.componentCategories
        );

    }


    /* ============================================================
       01.6 — OUTILS DE SÉCURITÉ
    ============================================================ */

    function safeNumber(value, fallback) {

        const n = Number(value);

        return Number.isFinite(n)
            ? n
            : (
                fallback !== undefined
                    ? fallback
                    : 0
            );

    }


    function safeString(value, fallback) {

        if (
            value === null ||
            value === undefined
        ) {
            return fallback || "";
        }

        return String(value);

    }


    function escapeHTML(value) {

        return safeString(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function uid(prefix) {

        return (
            safeString(prefix, "fobas") +
            "-" +
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 9)
        );

    }


    /* ============================================================
       02 — NOTIFICATIONS
    ============================================================ */

    function showToast(message, type) {

        const container = byId("toastContainer");

        if (!container) {
            return;
        }

        const toast = document.createElement("div");

        toast.className =
            "fobas-toast" +
            (
                type
                    ? " toast-" + type
                    : ""
            );

        toast.textContent = safeString(message);

        container.appendChild(toast);

        requestAnimationFrame(function () {
            toast.classList.add("show");
        });

        window.setTimeout(function () {

            toast.classList.remove("show");

            window.setTimeout(function () {

                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }

            }, 250);

        }, 2800);

    }


    APP.showToast = showToast;


    function announce(message) {

        const region = byId("ariaLiveRegion");

        if (region) {
            region.textContent = safeString(message);
        }

    }


    /* ============================================================
       03 — VUES PRINCIPALES
    ============================================================ */

    const VIEW_IDS = [

        "laboratoireView",
        "outilsView",
        "composantsView",
        "codesView",
        "programmationView",
        "missionsView",
        "mesuresView",
        "diagnosticView",
        "parametresView",
        "projetView"

    ];


    const VIEW_BUTTONS = {

        laboratoire: "btnLaboratoire",
        outils: "btnOutils",
        composants: "btnComposants",
        codes: "btnCodes",
        programmation: "btnProgrammation",
        missions: "btnMissions",
        mesures: "btnMesures",
        diagnostic: "btnDiagnostic",
        parametres: "btnParametres",
        projet: "btnProjet"

    };


    function setActiveView(viewName) {

        const targetId =
            VIEW_BUTTONS[viewName]
                ? VIEW_BUTTONS[viewName].replace(
                    "btn",
                    ""
                )
                : "";

        VIEW_IDS.forEach(function (id) {

            const element = byId(id);

            if (!element) {
                return;
            }

            const isTarget =
                id === (
                    viewName === "laboratoire"
                        ? "laboratoireView"
                        : viewName + "View"
                );

            element.hidden = !isTarget;

            element.classList.toggle(
                "active-view",
                isTarget
            );

        });


        $$(".main-tool-btn").forEach(function (button) {

            const module =
                button.dataset.module;

            button.classList.toggle(
                "active",
                module === viewName
            );

        });


        state.activeView = viewName;

        announce(
            "Module " +
            safeString(viewName) +
            " ouvert."
        );


        if (viewName === "outils") {
            renderToolsLibrary();
        }

        if (viewName === "composants") {
            renderComponentsLibrary();
        }

        if (viewName === "codes") {
            renderCodeLibrary();
        }

        if (viewName === "missions") {
            renderMissions();
        }

        if (viewName === "mesures") {
            updateMeasurementsUI();
        }

        if (viewName === "diagnostic") {
            renderDiagnostic();
        }

    }


    /* ============================================================
       04 — ACTIONS DES 20 BOUTONS
    ============================================================ */

    function handleModuleButton(button) {

        const module =
            button.dataset.module;

        if (!module) {
            return;
        }

        setActiveView(module);

    }


    function handleActionButton(button) {

        const action =
            button.dataset.action;

        if (!action) {
            return;
        }

        executeAction(action);

    }


    function executeAction(action) {

        switch (action) {

            case "add":
                openAddPanel();
                break;

            case "select":
                activateActionMode("select");
                break;

            case "move":
                activateActionMode("move");
                break;

            case "connect":
                activateActionMode("connect");
                break;

            case "disconnect":
                activateActionMode("disconnect");
                break;

            case "test":
                runDiagnostic();
                break;

            case "run":
                runProgram();
                break;

            case "undo":
                undo();
                break;

            case "redo":
                redo();
                break;

            case "delete":
                deleteSelectedObject();
                break;

            case "measure":
                setActiveView("mesures");
                break;

            default:
                break;

        }

    }


    function activateActionMode(mode) {

        state.activeAction = mode;

        $$(".action-tool-btn").forEach(
            function (button) {

                button.classList.toggle(
                    "action-active",
                    button.dataset.action === mode
                );

            }
        );


        $$(".workspace-mini-btn").forEach(
            function (button) {

                button.classList.toggle(
                    "action-active",
                    button.dataset.action === mode
                );

            }
        );


        const messages = {

            select: "Mode sélection activé.",

            move: "Mode déplacement activé.",

            connect: "Mode connexion activé. Sélectionnez un premier pin puis un deuxième pin.",

            disconnect: "Mode déconnexion activé. Sélectionnez un fil ou une connexion.",

            add: "Mode ajout activé."

        };


        showToast(
            messages[mode] ||
            "Mode " + mode + " activé.",
            "info"
        );

    }


    /* ============================================================
       05 — BIBLIOTHÈQUE OUTILS
    ============================================================ */

    function renderToolsLibrary() {

        const container =
            byId("toolsLibrary");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        const tools =
            getToolsData();

        if (!tools.length) {

            renderFallbackTools(container);

            return;

        }


        tools.forEach(function (tool) {

            const template =
                byId("toolCardTemplate");

            let card;

            if (template) {

                card =
                    template.content
                        .firstElementChild
                        .cloneNode(true);

            } else {

                card =
                    document.createElement("article");

                card.className = "tool-card";

            }


            const icon =
                card.querySelector("[data-tool-icon]");

            const name =
                card.querySelector("[data-tool-name]");

            const description =
                card.querySelector(
                    "[data-tool-description]"
                );

            const addButton =
                card.querySelector("[data-tool-add]");


            if (icon) {
                icon.textContent =
                    safeString(
                        tool.icon,
                        "🧰"
                    );
            }

            if (name) {
                name.textContent =
                    safeString(
                        tool.name ||
                        tool.nom ||
                        tool.title,
                        "Outil"
                    );
            }

            if (description) {
                description.textContent =
                    safeString(
                        tool.description ||
                        tool.descriptionFR ||
                        tool.descriptionFr,
                        ""
                    );
            }


            if (addButton) {

                addButton.addEventListener(
                    "click",
                    function (event) {

                        event.stopPropagation();

                        addLibraryItem(
                            tool,
                            "tool"
                        );

                    }
                );

            }


            container.appendChild(card);

        });

    }


    function renderFallbackTools(container) {

        const fallbackTools = [

            {
                id: "multimeter",
                name: "Multimètre",
                icon: "📟",
                description:
                    "Mesure tension, courant et résistance."
            },

            {
                id: "oscilloscope",
                name: "Oscilloscope",
                icon: "📈",
                description:
                    "Observation des signaux électriques."
            },

            {
                id: "power-supply",
                name: "Alimentation",
                icon: "🔋",
                description:
                    "Source d'alimentation réglable."
            },

            {
                id: "logic-analyzer",
                name: "Analyseur logique",
                icon: "📊",
                description:
                    "Analyse des signaux numériques."
            },

            {
                id: "signal-generator",
                name: "Générateur de signaux",
                icon: "〰️",
                description:
                    "Génération de signaux de test."
            }

        ];


        fallbackTools.forEach(function (tool) {

            const card =
                document.createElement("article");

            card.className = "tool-card";

            card.innerHTML =
                '<div class="tool-card-icon">' +
                    escapeHTML(tool.icon) +
                '</div>' +

                '<div class="tool-card-content">' +

                    '<h3>' +
                        escapeHTML(tool.name) +
                    '</h3>' +

                    '<p>' +
                        escapeHTML(tool.description) +
                    '</p>' +

                    '<button ' +
                        'type="button" ' +
                        'class="tool-add-btn">' +
                        '➕ Ajouter' +
                    '</button>' +

                '</div>';


            const button =
                card.querySelector("button");

            button.addEventListener(
                "click",
                function () {

                    addLibraryItem(
                        tool,
                        "tool"
                    );

                }
            );


            container.appendChild(card);

        });

    }


    /* ============================================================
       06 — BIBLIOTHÈQUE COMPOSANTS
    ============================================================ */

    function renderComponentCategories() {

        const bar =
            byId("componentCategories");

        if (!bar) {
            return;
        }

        bar.innerHTML = "";


        const categories =
            getCategoriesData();


        if (!categories.length) {

            const defaults = [

                "Tous",
                "Cartes",
                "Composants",
                "Capteurs",
                "Actionneurs",
                "Robotique",
                "Alimentation",
                "Connectique"

            ];

            defaults.forEach(
                function (category, index) {

                    createCategoryButton(
                        bar,
                        category,
                        index === 0,
                        "components"
                    );

                }
            );

            return;

        }


        createCategoryButton(
            bar,
            "Tous",
            true,
            "components"
        );


        categories.forEach(
            function (category) {

                const name =
                    typeof category === "string"
                        ? category
                        : (
                            category.name ||
                            category.nom ||
                            category.id
                        );

                if (name) {

                    createCategoryButton(
                        bar,
                        name,
                        false,
                        "components"
                    );

                }

            }
        );

    }


    function createCategoryButton(
        container,
        label,
        active,
        type
    ) {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "category-btn" +
            (
                active
                    ? " active"
                    : ""
            );

        button.textContent =
            safeString(label);

        button.dataset.category =
            safeString(label);

        button.addEventListener(
            "click",
            function () {

                $$(".category-btn", container)
                    .forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );

                button.classList.add("active");

                if (type === "components") {

                    filterComponents(
                        safeString(label)
                    );

                }

                if (type === "codes") {

                    filterCodes(
                        safeString(label)
                    );

                }

            }
        );


        container.appendChild(button);

    }


    function renderComponentsLibrary(
        categoryFilter
    ) {

        renderComponentCategories();

        const container =
            byId("componentsLibrary");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        const components =
            getComponentsData();


        if (!components.length) {

            renderFallbackComponents(
                container
            );

            return;

        }


        const filter =
            safeString(
                categoryFilter,
                "Tous"
            );


        components
            .filter(function (component) {

                if (
                    !filter ||
                    filter === "Tous"
                ) {
                    return true;
                }

                const category =
                    safeString(
                        component.category ||
                        component.categorie ||
                        component.type
                    )
                    .toLowerCase();

                return category ===
                    filter.toLowerCase();

            })
            .forEach(function (component) {

                const template =
                    byId(
                        "componentCardTemplate"
                    );

                let card;

                if (template) {

                    card =
                        template.content
                            .firstElementChild
                            .cloneNode(true);

                } else {

                    card =
                        document.createElement("article");

                    card.className =
                        "component-card";

                }


                fillComponentCard(
                    card,
                    component
                );


                container.appendChild(card);

            });

    }


    function fillComponentCard(
        card,
        component
    ) {

        const visual =
            card.querySelector(
                "[data-component-visual]"
            );

        const name =
            card.querySelector(
                "[data-component-name]"
            );

        const description =
            card.querySelector(
                "[data-component-description]"
            );

        const category =
            card.querySelector(
                "[data-component-category]"
            );

        const type =
            card.querySelector(
                "[data-component-type]"
            );

        const add =
            card.querySelector(
                "[data-component-add]"
            );


        const icon =
            component.icon ||
            component.emoji ||
            getComponentIcon(component);


        if (visual) {

            if (
                component.image ||
                component.imageUrl
            ) {

                visual.style.backgroundImage =
                    "url('" +
                    safeString(
                        component.image ||
                        component.imageUrl
                    )
                    .replace(/'/g, "\\'") +
                    "')";

                visual.classList.add(
                    "has-component-image"
                );

            } else {

                visual.textContent =
                    safeString(icon, "🔌");

            }

        }


        if (name) {

            name.textContent =
                safeString(
                    component.name ||
                    component.nom ||
                    component.title,
                    "Composant"
                );

        }


        if (description) {

            description.textContent =
                safeString(
                    component.description ||
                    component.descriptionFR ||
                    component.descriptionFr,
                    ""
                );

        }


        if (category) {

            category.textContent =
                safeString(
                    component.category ||
                    component.categorie,
                    "Composant"
                );

        }


        if (type) {

            type.textContent =
                safeString(
                    component.type ||
                    component.family,
                    ""
                );

        }


        if (add) {

            add.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    addLibraryItem(
                        component,
                        "component"
                    );

                }
            );

        }

    }


    function getComponentIcon(component) {

        const type =
            safeString(
                component.type ||
                component.category
            )
            .toLowerCase();


        if (type.includes("led")) {
            return "💡";
        }

        if (
            type.includes("arduino") ||
            type.includes("esp") ||
            type.includes("micro")
        ) {
            return "🧠";
        }

        if (type.includes("motor")) {
            return "⚙️";
        }

        if (type.includes("sensor")) {
            return "📡";
        }

        if (type.includes("resistor")) {
            return "〰️";
        }

        if (type.includes("battery")) {
            return "🔋";
        }

        if (type.includes("breadboard")) {
            return "▦";
        }

        return "🔌";

    }


    function renderFallbackComponents(
        container
    ) {

        const fallback = [

            {
                id: "arduino-uno",
                name: "Arduino UNO",
                type: "microcontroller",
                category: "Cartes",
                icon: "🧠",
                pins: [
                    "5V",
                    "GND",
                    "D2",
                    "D3",
                    "D4",
                    "D5",
                    "D6",
                    "D7",
                    "D8",
                    "D9",
                    "D10",
                    "D11",
                    "D12",
                    "D13"
                ]
            },

            {
                id: "led-red",
                name: "LED Rouge",
                type: "led",
                category: "Composants",
                icon: "🔴",
                pins: [
                    "A",
                    "K"
                ]
            },

            {
                id: "resistor-220",
                name: "Résistance 220 Ω",
                type: "resistor",
                category: "Composants",
                icon: "〰️",
                pins: [
                    "1",
                    "2"
                ]
            },

            {
                id: "ultrasonic-hc-sr04",
                name: "HC-SR04",
                type: "ultrasonic",
                category: "Capteurs",
                icon: "📡",
                pins: [
                    "VCC",
                    "TRIG",
                    "ECHO",
                    "GND"
                ]
            },

            {
                id: "dc-motor",
                name: "Moteur DC",
                type: "motor",
                category: "Actionneurs",
                icon: "⚙️",
                pins: [
                    "+",
                    "-"
                ]
            },

            {
                id: "breadboard-full",
                name: "Breadboard Full",
                type: "breadboard",
                category: "Cartes",
                icon: "▦",
                pins: []
            }

        ];


        fallback.forEach(
            function (component) {

                const template =
                    byId(
                        "componentCardTemplate"
                    );

                let card;

                if (template) {

                    card =
                        template.content
                            .firstElementChild
                            .cloneNode(true);

                    fillComponentCard(
                        card,
                        component
                    );

                } else {

                    card =
                        document.createElement("article");

                    card.className =
                        "component-card";

                    card.innerHTML =
                        "<h3>" +
                        escapeHTML(component.name) +
                        "</h3>";

                }


                container.appendChild(card);

            }
        );

    }


    function filterComponents(category) {

        renderComponentsLibrary(category);

    }


    /* ============================================================
       07 — AJOUT D'UN ÉLÉMENT AU WORKSPACE
    ============================================================ */

    function addLibraryItem(item, itemType) {

        if (!item) {
            return null;
        }


        const objectId =
            uid(
                item.id ||
                itemType
            );


        const workspace =
            byId("laboratoryWorkspace");

        if (!workspace) {
            return null;
        }


        const rect =
            workspace.getBoundingClientRect();


        const object = {

            id: objectId,

            sourceId:
                safeString(
                    item.id,
                    itemType
                ),

            type:
                safeString(
                    item.type,
                    itemType
                ),

            itemType:
                safeString(
                    itemType,
                    "component"
                ),

            name:
                safeString(
                    item.name ||
                    item.nom ||
                    item.title,
                    itemType
                ),

            icon:
                safeString(
                    item.icon ||
                    item.emoji,
                    getComponentIcon(item)
                ),

            x:
                Math.max(
                    30,
                    (
                        state.objects.length * 25
                    ) % Math.max(
                        100,
                        rect.width - 150
                    )
                ),

            y:
                Math.max(
                    30,
                    (
                        state.objects.length * 25
                    ) % Math.max(
                        100,
                        rect.height - 100
                    )
                ),

            width:
                safeNumber(
                    item.width,
                    120
                ),

            height:
                safeNumber(
                    item.height,
                    80
                ),

            rotation: 0,

            scale: 1,

            pins:
                normalizePins(item),

            properties:
                Object.assign({}, item),

            state: {

                powered: false,

                digitalValue: 0,

                analogValue: 0,

                pwm: 0,

                visible: true

            }

        };


        saveHistory();


        state.objects.push(object);

        renderWorkspaceObject(object);

        selectObject(object.id);

        updateWorkspaceStatus();

        showToast(
            object.name +
            " ajouté au laboratoire.",
            "success"
        );

        return object;

    }


    function normalizePins(item) {

        const source =
            item.pins ||
            item.pinout ||
            item.connections ||
            [];


        if (Array.isArray(source)) {

            return source.map(
                function (pin, index) {

                    if (
                        typeof pin === "string"
                    ) {

                        return {

                            id:
                                pin,

                            name:
                                pin,

                            type:
                                "generic",

                            index:
                                index,

                            x:
                                0,

                            y:
                                0

                        };

                    }


                    return {

                        id:
                            safeString(
                                pin.id ||
                                pin.name ||
                                ("pin-" + index)
                            ),

                        name:
                            safeString(
                                pin.name ||
                                pin.label ||
                                pin.id ||
                                ("Pin " + index)
                            ),

                        type:
                            safeString(
                                pin.type,
                                "generic"
                            ),

                        index:
                            index,

                        x:
                            safeNumber(pin.x),

                        y:
                            safeNumber(pin.y)

                    };

                }
            );

        }


        if (
            source &&
            typeof source === "object"
        ) {

            return Object.keys(source)
                .map(
                    function (key, index) {

                        const pin =
                            source[key];

                        if (
                            pin &&
                            typeof pin === "object"
                        ) {

                            return Object.assign(
                                {},
                                pin,
                                {
                                    id:
                                        safeString(
                                            pin.id ||
                                            key
                                        ),
                                    name:
                                        safeString(
                                            pin.name ||
                                            key
                                        ),
                                    index:
                                        index
                                }
                            );

                        }

                        return {

                            id: key,

                            name: key,

                            type: "generic",

                            index: index

                        };

                    }
                );

        }


        return [];

    }


    /* ============================================================
       08 — RENDU WORKSPACE
    ============================================================ */

    function renderWorkspaceObject(object) {

        if (!object) {
            return null;
        }


        const board =
            byId("workspaceBoard");

        if (!board) {
            return null;
        }


        let element =
            board.querySelector(
                '[data-object-id="' +
                CSS.escape(object.id) +
                '"]'
            );


        if (!element) {

            const template =
                byId(
                    "workspaceObjectTemplate"
                );

            if (template) {

                element =
                    template.content
                        .firstElementChild
                        .cloneNode(true);

            } else {

                element =
                    document.createElement("div");

                element.className =
                    "workspace-object";

            }


            element.dataset.objectId =
                object.id;

            element.dataset.componentId =
                object.sourceId;

            element.dataset.objectType =
                object.type;

            element.dataset.workspaceObject =
                "true";


            board.appendChild(element);

            setupWorkspaceObjectEvents(
                element,
                object
            );

        }


        updateWorkspaceObjectElement(
            element,
            object
        );


        return element;

    }


    function updateWorkspaceObjectElement(
        element,
        object
    ) {

        if (!element || !object) {
            return;
        }


        element.style.left =
            safeNumber(object.x) + "px";

        element.style.top =
            safeNumber(object.y) + "px";

        element.style.width =
            safeNumber(object.width, 120) +
            "px";

        element.style.height =
            safeNumber(object.height, 80) +
            "px";

        element.style.transform =
            "rotate(" +
            safeNumber(object.rotation) +
            "deg) " +
            "scale(" +
            safeNumber(object.scale, 1) +
            ")";


        element.dataset.objectId =
            object.id;


        const visual =
            element.querySelector(
                "[data-object-visual]"
            );

        const label =
            element.querySelector(
                "[data-object-label]"
            );


        if (visual) {

            visual.textContent =
                safeString(
                    object.icon,
                    getComponentIcon(object)
                );

            visual.title =
                safeString(object.name);

        }


        if (label) {

            label.textContent =
                safeString(
                    object.name
                );

        }


        renderObjectPins(
            element,
            object
        );


        element.classList.toggle(
            "selected",
            state.selectedObjectId === object.id
        );


        element.classList.toggle(
            "powered",
            !!object.state.powered
        );

    }


    function renderObjectPins(
        element,
        object
    ) {

        const pinContainer =
            element.querySelector(
                "[data-object-pins]"
            );

        if (!pinContainer) {
            return;
        }

        pinContainer.innerHTML = "";


        object.pins.forEach(
            function (pin, index) {

                const button =
                    document.createElement("button");

                button.type = "button";

                button.className =
                    "component-pin";

                button.dataset.pin =
                    "true";

                button.dataset.pinId =
                    safeString(
                        pin.id ||
                        ("pin-" + index)
                    );

                button.dataset.objectId =
                    object.id;

                button.dataset.pinType =
                    safeString(
                        pin.type,
                        "generic"
                    );

                button.title =
                    safeString(
                        pin.name,
                        pin.id
                    );

                button.setAttribute(
                    "aria-label",
                    safeString(
                        pin.name,
                        "Pin"
                    )
                );


                if (
                    pin.x !== undefined &&
                    pin.y !== undefined
                ) {

                    button.style.left =
                        safeNumber(pin.x) +
                        "px";

                    button.style.top =
                        safeNumber(pin.y) +
                        "px";

                }


                button.addEventListener(
                    "click",
                    function (event) {

                        event.stopPropagation();

                        handlePinInteraction(
                            object,
                            pin,
                            button
                        );

                    }
                );


                pinContainer.appendChild(button);

            }
        );

    }


    /* ============================================================
       09 — SÉLECTION / DÉPLACEMENT
    ============================================================ */

    function setupWorkspaceObjectEvents(
        element,
        object
    ) {

        element.addEventListener(
            "pointerdown",
            function (event) {

                if (
                    event.target.closest(
                        "[data-pin]"
                    )
                ) {
                    return;
                }

                if (
                    event.target.closest(
                        "[data-resize-handle]"
                    )
                ) {
                    return;
                }


                if (
                    state.activeAction ===
                    "connect"
                ) {
                    return;
                }


                selectObject(
                    object.id
                );


                if (
                    state.activeAction ===
                    "move"
                ) {

                    startObjectDrag(
                        event,
                        object,
                        element
                    );

                }

            }
        );


        element.addEventListener(
            "dblclick",
            function () {

                selectObject(
                    object.id
                );

                openInspector(
                    object
                );

            }
        );


        const resizeHandle =
            element.querySelector(
                "[data-resize-handle]"
            );


        if (resizeHandle) {

            resizeHandle.addEventListener(
                "pointerdown",
                function (event) {

                    event.stopPropagation();

                    startObjectResize(
                        event,
                        object,
                        element
                    );

                }
            );

        }

    }


    function selectObject(objectId) {

        const object =
            state.objects.find(
                function (item) {

                    return item.id === objectId;

                }
            );


        state.selectedObjectId =
            object
                ? object.id
                : null;


        $$(".workspace-object")
            .forEach(
                function (element) {

                    element.classList.toggle(
                        "selected",
                        element.dataset.objectId ===
                        state.selectedObjectId
                    );

                }
            );


        updateInspector(
            object || null
        );


        const info =
            byId("selectedObjectInfo");

        if (info) {

            info.textContent =
                object
                    ? (
                        object.name +
                        " sélectionné"
                    )
                    : "Aucun élément sélectionné";

        }

    }


    function getSelectedObject() {

        return state.objects.find(
            function (object) {

                return object.id ===
                    state.selectedObjectId;

            }
        ) || null;

    }


    /* ============================================================
       10 — DÉPLACEMENT POINTEUR / SOURIS / ANDROID
    ============================================================ */

    function startObjectDrag(
        event,
        object,
        element
    ) {

        if (
            event.pointerType === "mouse" &&
            event.button !== 0
        ) {
            return;
        }


        event.preventDefault();

        try {
            element.setPointerCapture(
                event.pointerId
            );
        } catch (error) {
            /* no-op */
        }


        const startX =
            event.clientX;

        const startY =
            event.clientY;

        const originalX =
            object.x;

        const originalY =
            object.y;


        saveHistory();


        function move(pointerEvent) {

            const scale =
                state.workspaceScale || 1;


            let nextX =
                originalX +
                (
                    pointerEvent.clientX -
                    startX
                ) / scale;


            let nextY =
                originalY +
                (
                    pointerEvent.clientY -
                    startY
                ) / scale;


            if (state.snapEnabled) {

                nextX =
                    snapValue(
                        nextX,
                        10
                    );

                nextY =
                    snapValue(
                        nextY,
                        10
                    );

            }


            object.x =
                Math.max(0, nextX);

            object.y =
                Math.max(0, nextY);


            updateWorkspaceObjectElement(
                element,
                object
            );


            redrawAllWires();

        }


        function end() {

            try {
                element.releasePointerCapture(
                    event.pointerId
                );
            } catch (error) {
                /* no-op */
            }


            window.removeEventListener(
                "pointermove",
                move
            );

            window.removeEventListener(
                "pointerup",
                end
            );

            updateWorkspaceStatus();

        }


        window.addEventListener(
            "pointermove",
            move,
            {
                passive: false
            }
        );

        window.addEventListener(
            "pointerup",
            end,
            {
                once: true
            }
        );

    }


    function startObjectResize(
        event,
        object,
        element
    ) {

        event.preventDefault();


        const startX =
            event.clientX;

        const startY =
            event.clientY;

        const originalWidth =
            object.width;

        const originalHeight =
            object.height;


        saveHistory();


        function move(pointerEvent) {

            const scale =
                state.workspaceScale || 1;


            object.width =
                Math.max(
                    50,
                    originalWidth +
                    (
                        pointerEvent.clientX -
                        startX
                    ) / scale
                );


            object.height =
                Math.max(
                    40,
                    originalHeight +
                    (
                        pointerEvent.clientY -
                        startY
                    ) / scale
                );


            updateWorkspaceObjectElement(
                element,
                object
            );


            redrawAllWires();

        }


        function end() {

            window.removeEventListener(
                "pointermove",
                move
            );

            window.removeEventListener(
                "pointerup",
                end
            );

        }


        window.addEventListener(
            "pointermove",
            move,
            {
                passive: false
            }
        );

        window.addEventListener(
            "pointerup",
            end,
            {
                once: true
            }
        );

    }


    function snapValue(
        value,
        grid
    ) {

        return Math.round(
            value / grid
        ) * grid;

    }


    /* ============================================================
       11 — INSPECTOR
    ============================================================ */

    function updateInspector(object) {

        const content =
            byId("inspectorContent");

        if (!content) {
            return;
        }


        if (!object) {

            content.innerHTML =
                '<div class="inspector-empty">' +
                'Sélectionnez un élément pour afficher ses propriétés.' +
                '</div>';

            return;

        }


        content.innerHTML =
            '<div class="inspector-property">' +
                '<span>ID</span>' +
                '<strong>' +
                    escapeHTML(object.id) +
                '</strong>' +
            '</div>' +

            '<div class="inspector-property">' +
                '<span>Nom</span>' +
                '<strong>' +
                    escapeHTML(object.name) +
                '</strong>' +
            '</div>' +

            '<div class="inspector-property">' +
                '<span>Type</span>' +
                '<strong>' +
                    escapeHTML(object.type) +
                '</strong>' +
            '</div>' +

            '<div class="inspector-property">' +
                '<span>X</span>' +
                '<strong>' +
                    Math.round(object.x) +
                    ' px' +
                '</strong>' +
            '</div>' +

            '<div class="inspector-property">' +
                '<span>Y</span>' +
                '<strong>' +
                    Math.round(object.y) +
                    ' px' +
                '</strong>' +
            '</div>' +

            '<div class="inspector-property">' +
                '<span>Rotation</span>' +
                '<strong>' +
                    Math.round(object.rotation) +
                    '°' +
                '</strong>' +
            '</div>' +

            '<div class="inspector-property">' +
                '<span>État</span>' +
                '<strong>' +
                    (
                        object.state.powered
                            ? "ACTIF"
                            : "ARRÊT"
                    ) +
                '</strong>' +
            '</div>';

    }


    function openInspector(object) {

        updateInspector(object);

        showToast(
            "Propriétés de " +
            safeString(object && object.name) +
            " ouvertes.",
            "info"
        );

    }


    /* ============================================================
       12 — PINS / CONNEXIONS
    ============================================================ */

    function handlePinInteraction(
        object,
        pin,
        button
    ) {

        if (
            state.activeAction !==
            "connect"
        ) {

            selectObject(object.id);

            return;

        }


        const pinRef = {

            objectId:
                object.id,

            pinId:
                safeString(
                    pin.id ||
                    pin.name
                )

        };


        if (!state.connectionStart) {

            state.connectionStart =
                pinRef;

            button.classList.add(
                "connection-start"
            );


            showToast(
                "Premier pin sélectionné. Choisissez le pin de destination.",
                "info"
            );

            return;

        }


        if (
            state.connectionStart.objectId ===
                pinRef.objectId &&
            state.connectionStart.pinId ===
                pinRef.pinId
        ) {

            state.connectionStart = null;

            button.classList.remove(
                "connection-start"
            );

            return;

        }


        createConnection(
            state.connectionStart,
            pinRef
        );


        clearConnectionStart();

    }


    function clearConnectionStart() {

        state.connectionStart = null;

        $$(".connection-start")
            .forEach(
                function (element) {

                    element.classList.remove(
                        "connection-start"
                    );

                }
            );

    }


    function createConnection(
        start,
        end
    ) {

        if (!start || !end) {
            return null;
        }


        const exists =
            state.connections.some(
                function (connection) {

                    return (
                        (
                            connection.start.objectId ===
                                start.objectId &&
                            connection.start.pinId ===
                                start.pinId &&
                            connection.end.objectId ===
                                end.objectId &&
                            connection.end.pinId ===
                                end.pinId
                        ) ||
                        (
                            connection.start.objectId ===
                                end.objectId &&
                            connection.start.pinId ===
                                end.pinId &&
                            connection.end.objectId ===
                                start.objectId &&
                            connection.end.pinId ===
                                start.pinId
                        )
                    );

                }
            );


        if (exists) {

            showToast(
                "Cette connexion existe déjà.",
                "warning"
            );

            return null;

        }


        saveHistory();


        const connection = {

            id:
                uid("connection"),

            start:
                Object.assign({}, start),

            end:
                Object.assign({}, end),

            type:
                "electrical",

            active:
                true

        };


        state.connections.push(
            connection
        );


        createWireForConnection(
            connection
        );


        updateWorkspaceStatus();

        simulateCircuit();

        showToast(
            "Connexion créée.",
            "success"
        );


        return connection;

    }


    /* ============================================================
       13 — FILS SVG
    ============================================================ */

    function createWireForConnection(
        connection
    ) {

        const svg =
            byId("wireLayer");

        const group =
            byId("wireObjects");

        if (
            !svg ||
            !group
        ) {
            return;
        }


        let wire =
            document.querySelector(
                '[data-wire-id="' +
                CSS.escape(connection.id) +
                '"]'
            );


        if (!wire) {

            wire =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "path"
                );

            wire.dataset.wireId =
                connection.id;

            wire.classList.add(
                "simulation-wire"
            );

            wire.setAttribute(
                "fill",
                "none"
            );

            wire.setAttribute(
                "stroke-width",
                "5"
            );

            wire.setAttribute(
                "stroke-linecap",
                "round"
            );

            wire.setAttribute(
                "stroke-linejoin",
                "round"
            );


            wire.addEventListener(
                "pointerdown",
                function (event) {

                    event.stopPropagation();

                    if (
                        state.activeAction ===
                        "disconnect"
                    ) {

                        deleteConnection(
                            connection.id
                        );

                    }

                }
            );


            group.appendChild(wire);

        }


        updateWireGeometry(
            wire,
            connection
        );

    }


    function updateWireGeometry(
        wire,
        connection
    ) {

        const start =
            getPinPosition(
                connection.start
            );

        const end =
            getPinPosition(
                connection.end
            );


        if (
            !start ||
            !end
        ) {
            return;
        }


        const middleX =
            (
                start.x +
                end.x
            ) / 2;


        const path =
            "M " +
            start.x +
            " " +
            start.y +
            " C " +
            middleX +
            " " +
            start.y +
            ", " +
            middleX +
            " " +
            end.y +
            ", " +
            end.x +
            " " +
            end.y;


        wire.setAttribute(
            "d",
            path
        );


        wire.setAttribute(
            "stroke",
            getWireColor(
                connection
            )
        );

    }


    function getPinPosition(
        reference
    ) {

        const object =
            state.objects.find(
                function (item) {

                    return item.id ===
                        reference.objectId;

                }
            );


        if (!object) {
            return null;
        }


        const pin =
            object.pins.find(
                function (item) {

                    return safeString(
                        item.id ||
                        item.name
                    ) ===
                    safeString(
                        reference.pinId
                    );

                }
            );


        const x =
            object.x +
            safeNumber(
                pin && pin.x,
                object.width / 2
            );


        const y =
            object.y +
            safeNumber(
                pin && pin.y,
                object.height / 2
            );


        return {
            x: x,
            y: y
        };

    }


    function getWireColor(
        connection
    ) {

        const startObject =
            state.objects.find(
                function (object) {

                    return object.id ===
                        connection.start.objectId;

                }
            );


        const endObject =
            state.objects.find(
                function (object) {

                    return object.id ===
                        connection.end.objectId;

                }
            );


        const type =
            (
                safeString(
                    startObject &&
                    startObject.type
                ) +
                " " +
                safeString(
                    endObject &&
                    endObject.type
                )
            )
            .toLowerCase();


        if (
            type.includes("ground") ||
            type.includes("gnd")
        ) {
            return "#111111";
        }


        if (
            type.includes("power") ||
            type.includes("vcc") ||
            type.includes("5v")
        ) {
            return "#d62828";
        }


        if (
            type.includes("signal") ||
            type.includes("digital")
        ) {
            return "#2878d7";
        }


        return "#26a269";

    }


    function redrawAllWires() {

        state.connections.forEach(
            function (connection) {

                createWireForConnection(
                    connection
                );

            }
        );

    }


    function deleteConnection(
        connectionId
    ) {

        const index =
            state.connections.findIndex(
                function (connection) {

                    return connection.id ===
                        connectionId;

                }
            );


        if (index < 0) {
            return;
        }


        saveHistory();


        state.connections.splice(
            index,
            1
        );


        const wire =
            document.querySelector(
                '[data-wire-id="' +
                CSS.escape(connectionId) +
                '"]'
            );


        if (wire) {
            wire.remove();
        }


        updateWorkspaceStatus();

        simulateCircuit();

        showToast(
            "Connexion supprimée.",
            "info"
        );

    }


    /* ============================================================
       14 — SUPPRESSION D'OBJET
    ============================================================ */

    function deleteSelectedObject() {

        const objectId =
            state.selectedObjectId;


        if (!objectId) {

            showToast(
                "Aucun élément sélectionné.",
                "warning"
            );

            return;

        }


        const object =
            state.objects.find(
                function (item) {

                    return item.id ===
                        objectId;

                }
            );


        if (!object) {
            return;
        }


        saveHistory();


        state.connections =
            state.connections.filter(
                function (connection) {

                    const related =
                        connection.start.objectId === objectId ||
                        connection.end.objectId === objectId;


                    if (related) {

                        const wire =
                            document.querySelector(
                                '[data-wire-id="' +
                                CSS.escape(connection.id) +
                                '"]'
                            );

                        if (wire) {
                            wire.remove();
                        }

                    }


                    return !related;

                }
            );


        state.objects =
            state.objects.filter(
                function (item) {

                    return item.id !==
                        objectId;

                }
            );


        const element =
            document.querySelector(
                '[data-object-id="' +
                CSS.escape(objectId) +
                '"]'
            );


        if (element) {
            element.remove();
        }


        state.selectedObjectId =
            null;


        updateInspector(null);

        updateWorkspaceStatus();

        simulateCircuit();

        showToast(
            object.name +
            " supprimé.",
            "info"
        );

    }


    /* ============================================================
       15 — WORKSPACE STATUS
    ============================================================ */

    function updateWorkspaceStatus() {

        const componentCount =
            byId("componentCountStatus");

        const connectionCount =
            byId("connectionCountStatus");

        const wireCount =
            byId("wireCountStatus");


        if (componentCount) {

            componentCount.textContent =
                "Composants : " +
                state.objects.length;

        }


        if (connectionCount) {

            connectionCount.textContent =
                "Connexions : " +
                state.connections.length;

        }


        if (wireCount) {

            wireCount.textContent =
                "Fils : " +
                state.connections.length;

        }


        const emptyState =
            byId("workspaceEmptyState");


        if (emptyState) {

            emptyState.hidden =
                state.objects.length > 0;

        }

    }


    /* ============================================================
       16 — BIBLIOTHÈQUE DE CODES
    ============================================================ */

    function renderCodeCategories() {

        const bar =
            byId("codeCategoryBar");

        if (!bar) {
            return;
        }

        bar.innerHTML = "";


        const codes =
            getCodesData();


        const categories = [

            "Tous"

        ];


        codes.forEach(
            function (code) {

                const category =
                    safeString(
                        code.category ||
                        code.categorie ||
                        code.level
                    );


                if (
                    category &&
                    !categories.includes(
                        category
                    )
                ) {

                    categories.push(
                        category
                    );

                }

            }
        );


        categories.forEach(
            function (category, index) {

                createCategoryButton(
                    bar,
                    category,
                    index === 0,
                    "codes"
                );

            }
        );

    }


    function renderCodeLibrary(
        categoryFilter
    ) {

        renderCodeCategories();


        const container =
            byId("codeLibrary");

        if (!container) {
            return;
        }

        container.innerHTML = "";


        const codes =
            getCodesData();


        if (!codes.length) {

            renderFallbackCodes(
                container
            );

            return;

        }


        const filter =
            safeString(
                categoryFilter,
                "Tous"
            );


        codes
            .filter(
                function (code) {

                    if (
                        !filter ||
                        filter === "Tous"
                    ) {
                        return true;
                    }


                    return (
                        safeString(
                            code.category ||
                            code.categorie ||
                            code.level
                        )
                        .toLowerCase() ===
                        filter.toLowerCase()
                    );

                }
            )
            .forEach(
                function (code) {

                    const card =
                        createCodeCard(
                            code
                        );

                    container.appendChild(
                        card
                    );

                }
            );

    }


    function createCodeCard(
        code
    ) {

        const template =
            byId("codeCardTemplate");

        let card;


        if (template) {

            card =
                template.content
                    .firstElementChild
                    .cloneNode(true);

        } else {

            card =
                document.createElement("article");

            card.className =
                "code-card";

        }


        const title =
            card.querySelector(
                "[data-code-title]"
            );

        const icon =
            card.querySelector(
                "[data-code-icon]"
            );

        const level =
            card.querySelector(
                "[data-code-level]"
            );

        const description =
            card.querySelector(
                "[data-code-description]"
            );

        const components =
            card.querySelector(
                "[data-code-components]"
            );

        const preview =
            card.querySelector(
                "[data-code-preview]"
            );

        const copyButton =
            card.querySelector(
                "[data-code-copy]"
            );

        const editorButton =
            card.querySelector(
                "[data-code-editor]"
            );


        const source =
            safeString(
                code.code ||
                code.source ||
                code.content ||
                ""
            );


        if (title) {

            title.textContent =
                safeString(
                    code.title ||
                    code.name ||
                    code.action,
                    "Action"
                );

        }


        if (icon) {

            icon.textContent =
                safeString(
                    code.icon,
                    "💻"
                );

        }


        if (level) {

            level.textContent =
                safeString(
                    code.level ||
                    code.niveau,
                    "Débutant"
                );

        }


        if (description) {

            description.textContent =
                safeString(
                    code.description ||
                    code.descriptionFR,
                    ""
                );

        }


        if (components) {

            const required =
                code.components ||
                code.requiredComponents ||
                [];


            components.textContent =
                Array.isArray(required)
                    ? required.join(" • ")
                    : safeString(required);

        }


        if (preview) {

            preview.textContent =
                source;

        }


        if (copyButton) {

            copyButton.addEventListener(
                "click",
                function () {

                    copyText(
                        source
                    );

                }
            );

        }


        if (editorButton) {

            editorButton.addEventListener(
                "click",
                function () {

                    setActiveView(
                        "programmation"
                    );

                    setEditorCode(
                        source
                    );

                }
            );

        }


        return card;

    }


    function renderFallbackCodes(
        container
    ) {

        const codes = [

            {
                id: "led-on",
                title: "Allumage 1 LED",
                level: "Débutant",
                icon: "💡",
                description:
                    "Allume une LED connectée à une sortie numérique.",
                components: [
                    "Arduino UNO",
                    "LED",
                    "Résistance 220 Ω"
                ],
                code:
`const int LED_PIN = 13;

void setup() {
    pinMode(LED_PIN, OUTPUT);
}

void loop() {
    digitalWrite(LED_PIN, HIGH);
}`
            },

            {
                id: "led-blink",
                title: "Clignotement d'une LED",
                level: "Débutant",
                icon: "💡",
                description:
                    "Fait clignoter une LED.",
                components: [
                    "Arduino UNO",
                    "LED",
                    "Résistance"
                ],
                code:
`const int LED_PIN = 13;

void setup() {
    pinMode(LED_PIN, OUTPUT);
}

void loop() {
    digitalWrite(LED_PIN, HIGH);
    delay(500);

    digitalWrite(LED_PIN, LOW);
    delay(500);
}`
            },

            {
                id: "button-led",
                title: "Bouton → LED",
                level: "Débutant",
                icon: "🔘",
                description:
                    "Commande une LED avec un bouton.",
                components: [
                    "Arduino UNO",
                    "Bouton",
                    "LED"
                ],
                code:
`const int BUTTON_PIN = 2;
const int LED_PIN = 13;

void setup() {
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    pinMode(LED_PIN, OUTPUT);
}

void loop() {
    int state = digitalRead(BUTTON_PIN);

    if (state == LOW) {
        digitalWrite(LED_PIN, HIGH);
    } else {
        digitalWrite(LED_PIN, LOW);
    }
}`
            }

        ];


        codes.forEach(
            function (code) {

                container.appendChild(
                    createCodeCard(code)
                );

            }
        );

    }


    function filterCodes(category) {

        renderCodeLibrary(
            category
        );

    }


    /* ============================================================
       17 — RECHERCHE DE CODES
    ============================================================ */

    function setupCodeSearch() {

        const input =
            byId("codeSearchInput");

        if (!input) {
            return;
        }


        input.addEventListener(
            "input",
            function () {

                const query =
                    input.value
                        .trim()
                        .toLowerCase();


                $$(".code-card")
                    .forEach(
                        function (card) {

                            const text =
                                card.textContent
                                    .toLowerCase();

                            card.hidden =
                                query &&
                                !text.includes(
                                    query
                                );

                        }
                    );

            }
        );

    }


    /* ============================================================
       18 — ÉDITEUR DE CODE
    ============================================================ */

    function getEditor() {

        return byId(
            "roboticsCodeEditor"
        );

    }


    function setEditorCode(code) {

        const editor =
            getEditor();

        if (!editor) {
            return;
        }

        editor.value =
            safeString(code);

        updateLineNumbers();

        editor.focus();

    }


    function updateLineNumbers() {

        const editor =
            getEditor();

        const lineNumbers =
            byId("codeLineNumbers");


        if (
            !editor ||
            !lineNumbers
        ) {
            return;
        }


        const count =
            Math.max(
                1,
                editor.value.split("\n").length
            );


        lineNumbers.textContent =
            Array.from(
                {
                    length: count
                },
                function (_, index) {

                    return index + 1;

                }
            ).join("\n");

    }


    function setupEditor() {

        const editor =
            getEditor();

        if (!editor) {
            return;
        }


        editor.addEventListener(
            "input",
            function () {

                updateLineNumbers();

                validateCode(
                    false
                );

            }
        );


        editor.addEventListener(
            "scroll",
            function () {

                const lineNumbers =
                    byId("codeLineNumbers");

                if (lineNumbers) {

                    lineNumbers.scrollTop =
                        editor.scrollTop;

                }

            }
        );


        const clear =
            byId("editorClearBtn");

        const verify =
            byId("editorVerifyBtn");

        const run =
            byId("editorRunBtn");

        const stop =
            byId("editorStopBtn");

        const paste =
            byId("editorPasteBtn");


        if (clear) {

            clear.addEventListener(
                "click",
                function () {

                    editor.value = "";

                    updateLineNumbers();

                    updateCodeStatus(
                        "Éditeur effacé."
                    );

                }
            );

        }


        if (verify) {

            verify.addEventListener(
                "click",
                function () {

                    validateCode(
                        true
                    );

                }
            );

        }


        if (run) {

            run.addEventListener(
                "click",
                function () {

                    runProgram();

                }
            );

        }


        if (stop) {

            stop.addEventListener(
                "click",
                function () {

                    stopProgram();

                }
            );

        }


        if (paste) {

            paste.addEventListener(
                "click",
                async function () {

                    try {

                        if (
                            navigator.clipboard &&
                            navigator.clipboard.readText
                        ) {

                            const text =
                                await navigator
                                    .clipboard
                                    .readText();

                            editor.value +=
                                text;

                            updateLineNumbers();

                            showToast(
                                "Code collé.",
                                "success"
                            );

                        } else {

                            editor.focus();

                            showToast(
                                "Utilisez le collage natif Android dans l'éditeur.",
                                "info"
                            );

                        }

                    } catch (error) {

                        showToast(
                            "Le navigateur bloque l'accès au presse-papiers. Utilisez Coller.",
                            "warning"
                        );

                    }

                }
            );

        }


        updateLineNumbers();

    }


    function updateCodeStatus(message, type) {

        const status =
            byId("codeValidationStatus");

        if (!status) {
            return;
        }


        status.textContent =
            safeString(message);


        status.dataset.status =
            safeString(type, "info");

    }


    function validateCode(
        showMessage
    ) {

        const editor =
            getEditor();

        if (!editor) {
            return false;
        }


        const code =
            editor.value.trim();


        if (!code) {

            updateCodeStatus(
                "Aucun code à vérifier.",
                "warning"
            );

            return false;

        }


        const result =
            analyzeSupportedCode(
                code
            );


        if (result.errors.length) {

            updateCodeStatus(
                result.errors.join(" "),
                "error"
            );


            if (showMessage) {

                showToast(
                    result.errors[0],
                    "error"
                );

            }


            return false;

        }


        updateCodeStatus(
            "Code reconnu. " +
            result.instructions.length +
            " instruction(s) simulable(s).",
            "success"
        );


        if (showMessage) {

            showToast(
                "Code vérifié avec succès.",
                "success"
            );

        }


        return true;

    }


    /* ============================================================
       19 — ANALYSEUR DE CODE CONTRÔLÉ
       ------------------------------------------------------------
       Le navigateur n'exécute PAS directement du C/C++ Arduino.
       Le moteur interprète un sous-ensemble réel et déterministe.
    ============================================================ */

    function analyzeSupportedCode(
        code
    ) {

        const instructions = [];

        const errors = [];


        const normalized =
            code
                .replace(/\r/g, "")
                .replace(
                    /\/\/.*$/gm,
                    ""
                );


        if (
            normalized.includes(
                "#include"
            )
        ) {

            /* Les bibliothèques peuvent être ignorées
               si le reste du code est compatible. */

        }


        const patterns = [

            /pinMode\s*\(\s*([^,]+)\s*,\s*([^)]+)\)/g,

            /digitalWrite\s*\(\s*([^,]+)\s*,\s*([^)]+)\)/g,

            /analogWrite\s*\(\s*([^,]+)\s*,\s*([^)]+)\)/g,

            /digitalRead\s*\(\s*([^)]+)\)/g,

            /analogRead\s*\(\s*([^)]+)\)/g,

            /delay\s*\(\s*([^)]+)\)/g,

            /tone\s*\(\s*([^,]+)\s*,\s*([^)]+)\)/g,

            /noTone\s*\(\s*([^)]+)\)/g

        ];


        patterns.forEach(
            function (pattern) {

                let match;

                while (
                    (
                        match =
                        pattern.exec(
                            normalized
                        )
                    ) !== null
                ) {

                    instructions.push({
                        functionName:
                            match[0]
                                .split("(")[0]
                                .trim(),

                        args:
                            match
                                .slice(1)
                                .map(
                                    function (item) {
                                        return item.trim();
                                    }
                                ),

                        raw:
                            match[0]

                    });

                }

            }
        );


        if (
            /while\s*\(\s*true\s*\)/.test(
                normalized
            )
        ) {

            /* loop Arduino classique */

        }


        if (
            normalized.includes(
                "Serial."
            )
        ) {

            instructions.push({
                functionName:
                    "Serial",
                args: [],
                raw: "Serial"
            });

        }


        return {

            instructions:
                instructions,

            errors:
                errors

        };

    }


    /* ============================================================
       20 — RUNTIME DU CODE
    ============================================================ */

    function runProgram() {

        const editor =
            getEditor();

        if (!editor) {
            return;
        }


        const code =
            editor.value.trim();


        if (!code) {

            showToast(
                "Aucun code à exécuter.",
                "warning"
            );

            return;

        }


        const result =
            analyzeSupportedCode(
                code
            );


        if (result.errors.length) {

            updateCodeStatus(
                result.errors.join(" "),
                "error"
            );

            return;

        }


        saveHistory();


        state.running = true;

        setSimulationStatus(
            "running",
            "Simulation en cours"
        );


        resetRuntime();


        const variables =
            parseConstantsAndVariables(
                code
            );


        Object.assign(
            state.runtime.variables,
            variables
        );


        executeArduinoLikeCode(
            code
        );


        simulateCircuit();


        updateMeasurementsUI();


        updateCodeStatus(
            "Programme exécuté sur le montage simulé.",
            "success"
        );


        appendConsole(
            "▶ Programme démarré."
        );


        showToast(
            "Simulation exécutée.",
            "success"
        );


        updateMissionProgress();

    }


    function stopProgram() {

        state.running = false;


        state.runtime.intervals
            .forEach(
                function (timer) {

                    window.clearInterval(
                        timer
                    );

                }
            );


        state.runtime.intervals = [];


        setSimulationStatus(
            "ready",
            "Système prêt"
        );


        appendConsole(
            "■ Programme arrêté."
        );


        showToast(
            "Programme arrêté.",
            "info"
        );

    }


    function resetRuntime() {

        state.runtime.pinModes = {};

        state.runtime.pinValues = {};

        state.runtime.analogValues = {};

        state.runtime.pwmValues = {};

        state.runtime.digitalValues = {};

        state.runtime.sensorValues = {};

        state.runtime.motorValues = {};

        state.runtime.variables = {};

        state.runtime.time = 0;


        state.objects.forEach(
            function (object) {

                object.state.digitalValue = 0;

                object.state.analogValue = 0;

                object.state.pwm = 0;

                object.state.powered = false;

            }
        );


        updateAllWorkspaceObjects();

    }


    function parseConstantsAndVariables(
        code
    ) {

        const variables = {};


        const regex =
            /(?:const\s+)?(?:int|long|float|double|bool|byte)\s+([A-Za-z_]\w*)\s*=\s*([^;]+);/g;


        let match;


        while (
            (
                match =
                regex.exec(code)
            ) !== null
        ) {

            variables[
                match[1]
            ] =
                parseRuntimeValue(
                    match[2],
                    variables
                );

        }


        return variables;

    }


    function parseRuntimeValue(
        expression,
        variables
    ) {

        const value =
            safeString(expression)
                .trim();


        if (
            Object.prototype.hasOwnProperty.call(
                variables || {},
                value
            )
        ) {

            return variables[value];

        }


        if (
            value === "HIGH"
        ) {
            return 1;
        }


        if (
            value === "LOW"
        ) {
            return 0;
        }


        if (
            value === "true"
        ) {
            return true;
        }


        if (
            value === "false"
        ) {
            return false;
        }


        const number =
            Number(
                value
            );


        if (
            Number.isFinite(number)
        ) {

            return number;

        }


        return value;

    }


    function executeArduinoLikeCode(
        code
    ) {

        const variables =
            state.runtime.variables;


        const setupMatch =
            extractFunctionBlock(
                code,
                "setup"
            );


        const loopMatch =
            extractFunctionBlock(
                code,
                "loop"
            );


        if (setupMatch) {

            executeStatements(
                setupMatch,
                variables
            );

        }


        if (loopMatch) {

            executeStatements(
                loopMatch,
                variables
            );

        } else {

            executeStatements(
                code,
                variables
            );

        }

    }


    function extractFunctionBlock(
        code,
        name
    ) {

        const pattern =
            new RegExp(
                name +
                "\\s*\\(\\s*\\)\\s*\\{([\\s\\S]*?)\\}",
                "m"
            );


        const match =
            code.match(pattern);


        return match
            ? match[1]
            : "";

    }


    function executeStatements(
        code,
        variables
    ) {

        const statements =
            splitStatements(
                code
            );


        statements.forEach(
            function (statement) {

                executeStatement(
                    statement.trim(),
                    variables
                );

            }
        );

    }


    function splitStatements(
        code
    ) {

        return safeString(code)
            .split(";")
            .map(
                function (statement) {

                    return statement.trim();

                }
            )
            .filter(Boolean);

    }


    function executeStatement(
        statement,
        variables
    ) {

        let match;


        match =
            statement.match(
                /^pinMode\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)$/i
            );


        if (match) {

            const pin =
                resolvePinNumber(
                    match[1],
                    variables
                );


            const mode =
                safeString(
                    match[2]
                )
                .trim()
                .toUpperCase();


            state.runtime.pinModes[
                pin
            ] = mode;

            return;

        }


        match =
            statement.match(
                /^digitalWrite\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)$/i
            );


        if (match) {

            const pin =
                resolvePinNumber(
                    match[1],
                    variables
                );


            const value =
                parseRuntimeValue(
                    match[2],
                    variables
                );


            state.runtime.digitalValues[
                pin
            ] =
                (
                    value === 1 ||
                    value === true ||
                    safeString(value)
                        .toUpperCase() === "HIGH"
                )
                    ? 1
                    : 0;


            state.runtime.pinValues[
                pin
            ] =
                state.runtime.digitalValues[
                    pin
                ];


            return;

        }


        match =
            statement.match(
                /^analogWrite\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)$/i
            );


        if (match) {

            const pin =
                resolvePinNumber(
                    match[1],
                    variables
                );


            const value =
                safeNumber(
                    parseRuntimeValue(
                        match[2],
                        variables
                    )
                );


            state.runtime.pwmValues[
                pin
            ] =
                Math.max(
                    0,
                    Math.min(
                        255,
                        value
                    )
                );


            state.runtime.pinValues[
                pin
            ] =
                state.runtime.pwmValues[
                    pin
                ];


            return;

        }


        match =
            statement.match(
                /^delay\s*\(\s*([^)]+)\s*\)$/i
            );


        if (match) {

            state.runtime.time +=
                safeNumber(
                    parseRuntimeValue(
                        match[1],
                        variables
                    )
                );

            return;

        }


        match =
            statement.match(
                /^tone\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)$/i
            );


        if (match) {

            const pin =
                resolvePinNumber(
                    match[1],
                    variables
                );


            const frequency =
                safeNumber(
                    parseRuntimeValue(
                        match[2],
                        variables
                    )
                );


            state.measurements.frequency =
                frequency;


            state.runtime.pinValues[
                pin
            ] =
                1;


            return;

        }


        match =
            statement.match(
                /^noTone\s*\(\s*([^)]+)\s*\)$/i
            );


        if (match) {

            const pin =
                resolvePinNumber(
                    match[1],
                    variables
                );


            state.runtime.pinValues[
                pin
            ] =
                0;

        }

    }


    function resolvePinNumber(
        expression,
        variables
    ) {

        const value =
            parseRuntimeValue(
                expression,
                variables
            );


        return safeString(
            value
        )
        .replace(
            /["']/g,
            ""
        )
        .trim();

    }


    /* ============================================================
       21 — SIMULATION ÉLECTRONIQUE
    ============================================================ */

    function simulateCircuit() {

        propagateDigitalSignals();

        simulateLEDs();

        simulateMotors();

        simulateSensors();

        calculateMeasurements();

        updateAllWorkspaceObjects();

        redrawAllWires();

    }


    function propagateDigitalSignals() {

        state.connections.forEach(
            function (connection) {

                const start =
                    getObjectById(
                        connection.start.objectId
                    );

                const end =
                    getObjectById(
                        connection.end.objectId
                    );


                if (
                    !start ||
                    !end
                ) {
                    return;
                }


                const startPin =
                    safeString(
                        connection.start.pinId
                    );


                const endPin =
                    safeString(
                        connection.end.pinId
                    );


                const startValue =
                    getObjectPinSignal(
                        start,
                        startPin
                    );


                const endValue =
                    getObjectPinSignal(
                        end,
                        endPin
                    );


                if (
                    startValue !== null &&
                    startValue !== undefined
                ) {

                    setObjectPinSignal(
                        end,
                        endPin,
                        startValue
                    );

                }


                if (
                    endValue !== null &&
                    endValue !== undefined
                ) {

                    setObjectPinSignal(
                        start,
                        startPin,
                        endValue
                    );

                }

            }
        );

    }


    function getObjectById(
        id
    ) {

        return state.objects.find(
            function (object) {

                return object.id === id;

            }
        ) || null;

    }


    function getObjectPinSignal(
        object,
        pinId
    ) {

        const type =
            safeString(
                object.type
            )
            .toLowerCase();


        if (
            type.includes("arduino") ||
            type.includes("microcontroller") ||
            type.includes("esp")
        ) {

            const numeric =
                normalizePinName(
                    pinId
                );


            if (
                Object.prototype.hasOwnProperty.call(
                    state.runtime.pinValues,
                    numeric
                )
            ) {

                return state.runtime.pinValues[
                    numeric
                ];

            }

        }


        if (
            object.state &&
            Object.prototype.hasOwnProperty.call(
                object.state,
                "digitalValue"
            )
        ) {

            return object.state.digitalValue;

        }


        return null;

    }


    function setObjectPinSignal(
        object,
        pinId,
        value
    ) {

        const normalized =
            normalizePinName(
                pinId
            );


        if (
            safeString(object.type)
                .toLowerCase()
                .includes("arduino") ||
            safeString(object.type)
                .toLowerCase()
                .includes("micro")
        ) {

            state.runtime.pinValues[
                normalized
            ] =
                safeNumber(
                    value
                );

            return;

        }


        object.state.digitalValue =
            safeNumber(
                value
            );

    }


    function normalizePinName(
        pin
    ) {

        return safeString(
            pin
        )
        .trim()
        .toUpperCase()
        .replace(
            /^D/,
            ""
        );

    }


    function simulateLEDs() {

        state.objects.forEach(
            function (object) {

                const type =
                    safeString(
                        object.type
                    )
                    .toLowerCase();


                if (
                    !type.includes("led")
                ) {
                    return;
                }


                let active =
                    false;


                state.connections.forEach(
                    function (connection) {

                        if (
                            connection.start.objectId ===
                                object.id ||
                            connection.end.objectId ===
                                object.id
                        ) {

                            const otherId =
                                connection.start.objectId ===
                                    object.id
                                    ? connection.end.objectId
                                    : connection.start.objectId;


                            const other =
                                getObjectById(
                                    otherId
                                );


                            if (!other) {
                                return;
                            }


                            const otherType =
                                safeString(
                                    other.type
                                )
                                .toLowerCase();


                            if (
                                otherType.includes(
                                    "arduino"
                                ) ||
                                otherType.includes(
                                    "micro"
                                )
                            ) {

                                const pin =
                                    connection.start.objectId ===
                                        other.id
                                        ? connection.start.pinId
                                        : connection.end.pinId;


                                const value =
                                    state.runtime
                                        .pinValues[
                                            normalizePinName(
                                                pin
                                            )
                                        ];


                                if (
                                    safeNumber(
                                        value
                                    ) > 0
                                ) {

                                    active =
                                        true;

                                }

                            }

                        }

                    }
                );


                object.state.powered =
                    active;

            }
        );

    }


    function simulateMotors() {

        state.objects.forEach(
            function (object) {

                const type =
                    safeString(
                        object.type
                    )
                    .toLowerCase();


                if (
                    !type.includes("motor")
                ) {
                    return;
                }


                let pwm = 0;


                state.connections.forEach(
                    function (connection) {

                        if (
                            connection.start.objectId ===
                                object.id ||
                            connection.end.objectId ===
                                object.id
                        ) {

                            const otherId =
                                connection.start.objectId ===
                                    object.id
                                    ? connection.end.objectId
                                    : connection.start.objectId;


                            const other =
                                getObjectById(
                                    otherId
                                );


                            if (!other) {
                                return;
                            }


                            if (
                                safeString(
                                    other.type
                                )
                                .toLowerCase()
                                .includes("arduino")
                            ) {

                                const pin =
                                    connection.start.objectId ===
                                        other.id
                                        ? connection.start.pinId
                                        : connection.end.pinId;


                                pwm =
                                    Math.max(
                                        pwm,
                                        safeNumber(
                                            state.runtime
                                                .pwmValues[
                                                    normalizePinName(
                                                        pin
                                                    )
                                                ]
                                        )
                                    );

                            }

                        }

                    }
                );


                object.state.pwm =
                    pwm;

                object.state.powered =
                    pwm > 0 ||
                    object.state.digitalValue > 0;

                state.runtime.motorValues[
                    object.id
                ] =
                    pwm;

            }
        );

    }


    function simulateSensors() {

        state.objects.forEach(
            function (object) {

                const type =
                    safeString(
                        object.type
                    )
                    .toLowerCase();


                if (
                    type.includes("ultrasonic") ||
                    type.includes("hc-sr04")
                ) {

                    const distance =
                        safeNumber(
                            object.properties
                                .distance,
                            100
                        );


                    state.runtime.sensorValues[
                        object.id
                    ] =
                        distance;

                }

            }
        );

    }


    /* ============================================================
       22 — MESURES
    ============================================================ */

    function calculateMeasurements() {

        let voltage = 0;

        let current = 0;

        let resistance = 0;

        let pwm = 0;


        state.objects.forEach(
            function (object) {

                const type =
                    safeString(
                        object.type
                    )
                    .toLowerCase();


                if (
                    type.includes("battery") ||
                    type.includes("power") ||
                    type.includes("supply")
                ) {

                    voltage =
                        Math.max(
                            voltage,
                            safeNumber(
                                object.properties
                                    .voltage,
                                5
                            )
                        );

                }


                if (
                    type.includes("resistor")
                ) {

                    resistance =
                        Math.max(
                            resistance,
                            safeNumber(
                                object.properties
                                    .resistance,
                                220
                            )
                        );

                }


                pwm =
                    Math.max(
                        pwm,
                        safeNumber(
                            object.state.pwm
                        )
                    );

            }
        );


        if (
            voltage > 0 &&
            resistance > 0
        ) {

            current =
                voltage /
                resistance;

        }


        state.measurements.voltage =
            voltage;

        state.measurements.current =
            current;

        state.measurements.resistance =
            resistance;

        state.measurements.pwm =
            Math.round(
                (
                    pwm /
                    255
                ) *
                100
            );


        if (
            state.measurements.frequency ===
            undefined
        ) {

            state.measurements.frequency =
                0;

        }


        if (
            state.measurements.temperature ===
            undefined
        ) {

            state.measurements.temperature =
                25;

        }


        updateMeasurementsUI();

    }


    function updateMeasurementsUI() {

        setText(
            "voltageValue",
            state.measurements.voltage.toFixed(2) +
            " V"
        );

        setText(
            "currentValue",
            state.measurements.current.toFixed(3) +
            " A"
        );

        setText(
            "resistanceValue",
            state.measurements.resistance.toFixed(2) +
            " Ω"
        );

        setText(
            "frequencyValue",
            state.measurements.frequency.toFixed(2) +
            " Hz"
        );

        setText(
            "pwmValue",
            state.measurements.pwm +
            " %"
        );

        setText(
            "temperatureValue",
            state.measurements.temperature.toFixed(1) +
            " °C"
        );

    }


    function setText(
        id,
        text
    ) {

        const element =
            byId(id);

        if (element) {
            element.textContent =
                text;
        }

    }


    /* ============================================================
       23 — MISE À JOUR OBJETS
    ============================================================ */

    function updateAllWorkspaceObjects() {

        state.objects.forEach(
            function (object) {

                const element =
                    document.querySelector(
                        '[data-object-id="' +
                        CSS.escape(object.id) +
                        '"]'
                    );


                if (element) {

                    updateWorkspaceObjectElement(
                        element,
                        object
                    );

                } else {

                    renderWorkspaceObject(
                        object
                    );

                }

            }
        );

    }


    /* ============================================================
       24 — DIAGNOSTIC
    ============================================================ */

    function runDiagnostic() {

        const results =
            [];


        if (!state.objects.length) {

            results.push({

                type: "warning",

                title: "Laboratoire vide",

                message:
                    "Aucun composant n'est présent dans le montage."

            });

        }


        state.objects.forEach(
            function (object) {

                if (
                    !object.pins ||
                    !object.pins.length
                ) {

                    return;

                }


                const connectedPins =
                    new Set();


                state.connections.forEach(
                    function (connection) {

                        if (
                            connection.start.objectId ===
                            object.id
                        ) {

                            connectedPins.add(
                                connection.start.pinId
                            );

                        }

                        if (
                            connection.end.objectId ===
                            object.id
                        ) {

                            connectedPins.add(
                                connection.end.pinId
                            );

                        }

                    }
                );


                const type =
                    safeString(
                        object.type
                    )
                    .toLowerCase();


                if (
                    type.includes("led") &&
                    connectedPins.size < 2
                ) {

                    results.push({

                        type: "warning",

                        title:
                            "LED non complètement connectée",

                        message:
                            object.name +
                            " nécessite une connexion sur ses bornes."

                    });

                }


                if (
                    type.includes("motor") &&
                    connectedPins.size < 2
                ) {

                    results.push({

                        type: "warning",

                        title:
                            "Moteur non connecté",

                        message:
                            object.name +
                            " nécessite une alimentation / commande."

                    });

                }

            }
        );


        state.connections.forEach(
            function (connection) {

                if (
                    connection.start.objectId ===
                    connection.end.objectId
                ) {

                    results.push({

                        type: "error",

                        title:
                            "Connexion interne invalide",

                        message:
                            "Un composant ne peut pas être connecté à lui-même."

                    });

                }

            }
        );


        const summary =
            byId("diagnosticSummary");


        const resultContainer =
            byId("diagnosticResults");


        if (summary) {

            summary.textContent =
                results.length
                    ? (
                        results.length +
                        " problème(s) ou avertissement(s) détecté(s)."
                    )
                    : "Aucune anomalie évidente détectée.";

        }


        if (resultContainer) {

            resultContainer.innerHTML = "";


            results.forEach(
                function (result) {

                    const item =
                        document.createElement(
                            "article"
                        );


                    item.className =
                        "diagnostic-item " +
                        "diagnostic-" +
                        result.type;


                    item.innerHTML =
                        "<strong>" +
                            escapeHTML(
                                result.title
                            ) +
                        "</strong>" +

                        "<p>" +
                            escapeHTML(
                                result.message
                            ) +
                        "</p>";


                    resultContainer.appendChild(
                        item
                    );

                }
            );

        }


        setActiveView(
            "diagnostic"
        );


        showToast(
            results.length
                ? "Diagnostic terminé avec anomalies."
                : "Diagnostic terminé : aucune anomalie évidente.",
            results.length
                ? "warning"
                : "success"
        );


        return results;

    }


    function renderDiagnostic() {

        const summary =
            byId("diagnosticSummary");

        if (summary) {

            summary.textContent =
                "Aucun diagnostic exécuté.";

        }

    }


    /* ============================================================
       25 — MISSIONS
    ============================================================ */

    function renderMissions() {

        const container =
            byId("missionsLibrary");

        if (!container) {
            return;
        }


        container.innerHTML = "";


        const missions =
            getMissionsData();


        if (!missions.length) {

            renderFallbackMissions(
                container
            );

            return;

        }


        missions.forEach(
            function (mission) {

                container.appendChild(
                    createMissionCard(
                        mission
                    )
                );

            }
        );

    }


    function createMissionCard(
        mission
    ) {

        const template =
            byId(
                "missionCardTemplate"
            );

        let card;


        if (template) {

            card =
                template.content
                    .firstElementChild
                    .cloneNode(true);

        } else {

            card =
                document.createElement("article");

            card.className =
                "mission-card";

        }


        const icon =
            card.querySelector(
                "[data-mission-icon]"
            );

        const title =
            card.querySelector(
                "[data-mission-title]"
            );

        const level =
            card.querySelector(
                "[data-mission-level]"
            );

        const description =
            card.querySelector(
                "[data-mission-description]"
            );

        const objective =
            card.querySelector(
                "[data-mission-objective]"
            );

        const start =
            card.querySelector(
                "[data-mission-start]"
            );


        if (icon) {

            icon.textContent =
                safeString(
                    mission.icon,
                    "🎯"
                );

        }


        if (title) {

            title.textContent =
                safeString(
                    mission.title ||
                    mission.name ||
                    mission.nom,
                    "Mission"
                );

        }


        if (level) {

            level.textContent =
                safeString(
                    mission.level ||
                    mission.niveau,
                    "Niveau"
                );

        }


        if (description) {

            description.textContent =
                safeString(
                    mission.description,
                    ""
                );

        }


        if (objective) {

            objective.textContent =
                safeString(
                    mission.objective ||
                    mission.objectif,
                    ""
                );

        }


        if (start) {

            start.addEventListener(
                "click",
                function () {

                    startMission(
                        mission
                    );

                }
            );

        }


        return card;

    }


    function renderFallbackMissions(
        container
    ) {

        const missions = [

            {
                id: "mission-led",
                title:
                    "Allumer une LED",
                level:
                    "Débutant",
                icon:
                    "💡",
                description:
                    "Construisez un circuit avec une carte, une résistance et une LED.",
                objective:
                    "La LED doit s'allumer avec une sortie numérique."
            },

            {
                id: "mission-button",
                title:
                    "Bouton de commande",
                level:
                    "Débutant",
                icon:
                    "🔘",
                description:
                    "Utilisez un bouton pour commander une LED.",
                objective:
                    "La LED doit suivre l'état du bouton."
            },

            {
                id: "mission-ultrasonic",
                title:
                    "Détection ultrason",
                level:
                    "Intermédiaire",
                icon:
                    "📡",
                description:
                    "Utilisez un capteur ultrasonique.",
                objective:
                    "Mesurer une distance et l'utiliser dans le programme."
            },

            {
                id: "mission-motor",
                title:
                    "Commande moteur",
                level:
                    "Intermédiaire",
                icon:
                    "⚙️",
                description:
                    "Commande d'un moteur DC par PWM.",
                objective:
                    "Faire varier la vitesse du moteur."
            }

        ];


        missions.forEach(
            function (mission) {

                container.appendChild(
                    createMissionCard(
                        mission
                    )
                );

            }
        );

    }


    function startMission(
        mission
    ) {

        state.mission.activeId =
            safeString(
                mission.id ||
                mission.name
            );

        state.mission.completed =
            false;


        setActiveView(
            "laboratoire"
        );


        showToast(
            "Mission : " +
            safeString(
                mission.title ||
                mission.name
            ) +
            " démarrée.",
            "info"
        );


        announce(
            "Mission démarrée."
        );

    }


    function updateMissionProgress() {

        if (
            !state.mission.activeId
        ) {
            return;
        }


        const activeMission =
            getMissionsData()
                .find(
                    function (mission) {

                        return safeString(
                            mission.id ||
                            mission.name
                        ) ===
                        state.mission.activeId;

                    }
                );


        if (!activeMission) {
            return;
        }


        const objective =
            safeString(
                activeMission.objective ||
                activeMission.objectif
            )
            .toLowerCase();


        let completed = false;


        if (
            objective.includes("led") &&
            state.objects.some(
                function (object) {

                    return (
                        safeString(
                            object.type
                        )
                        .toLowerCase()
                        .includes("led") &&
                        object.state.powered
                    );

                }
            )
        ) {

            completed = true;

        }


        if (completed) {

            state.mission.completed =
                true;


            showToast(
                "Mission réussie !",
                "success"
            );

        }

    }


    /* ============================================================
       26 — UNDO / REDO
    ============================================================ */

    function createSnapshot() {

        return {

            objects:
                deepClone(
                    state.objects
                ),

            connections:
                deepClone(
                    state.connections
                ),

            measurements:
                deepClone(
                    state.measurements
                )

        };

    }


    function restoreSnapshot(
        snapshot
    ) {

        if (!snapshot) {
            return;
        }


        state.objects =
            deepClone(
                snapshot.objects || []
            );

        state.connections =
            deepClone(
                snapshot.connections || []
            );

        state.measurements =
            deepClone(
                snapshot.measurements ||
                state.measurements
            );


        state.selectedObjectId =
            null;


        renderEntireWorkspace();

    }


    function deepClone(
        value
    ) {

        try {

            return JSON.parse(
                JSON.stringify(value)
            );

        } catch (error) {

            return value;

        }

    }


    function saveHistory() {

        state.history.push(
            createSnapshot()
        );


        if (
            state.history.length > 50
        ) {

            state.history.shift();

        }


        state.future = [];

    }


    function undo() {

        if (
            !state.history.length
        ) {

            showToast(
                "Aucune action à annuler.",
                "info"
            );

            return;

        }


        state.future.push(
            createSnapshot()
        );


        const snapshot =
            state.history.pop();


        restoreSnapshot(
            snapshot
        );


        showToast(
            "Action annulée.",
            "info"
        );

    }


    function redo() {

        if (
            !state.future.length
        ) {

            showToast(
                "Aucune action à rétablir.",
                "info"
            );

            return;

        }


        state.history.push(
            createSnapshot()
        );


        const snapshot =
            state.future.pop();


        restoreSnapshot(
            snapshot
        );


        showToast(
            "Action rétablie.",
            "info"
        );

    }


    /* ============================================================
       27 — RENDU COMPLET DU WORKSPACE
    ============================================================ */

    function renderEntireWorkspace() {

        const board =
            byId("workspaceBoard");

        const wireGroup =
            byId("wireObjects");


        if (board) {
            board.innerHTML = "";
        }


        if (wireGroup) {
            wireGroup.innerHTML = "";
        }


        state.objects.forEach(
            function (object) {

                renderWorkspaceObject(
                    object
                );

            }
        );


        state.connections.forEach(
            function (connection) {

                createWireForConnection(
                    connection
                );

            }
        );


        updateWorkspaceStatus();

        updateInspector(
            getSelectedObject()
        );


        simulateCircuit();

    }


    /* ============================================================
       28 — SAUVEGARDE / PROJET
    ============================================================ */

    function getProjectData() {

        return {

            app:
                APP.name,

            version:
                APP.version,

            projectVersion:
                state.projectVersion,

            projectName:
                state.projectName,

            timestamp:
                new Date().toISOString(),

            objects:
                deepClone(
                    state.objects
                ),

            connections:
                deepClone(
                    state.connections
                ),

            measurements:
                deepClone(
                    state.measurements
                )

        };

    }


    function saveProject() {

        const data =
            getProjectData();


        try {

            localStorage.setItem(
                "FOBAS_ROBOTICS_PROJECT",
                JSON.stringify(
                    data
                )
            );


            showToast(
                "Projet sauvegardé localement.",
                "success"
            );

        } catch (error) {

            showToast(
                "Impossible de sauvegarder le projet.",
                "error"
            );

        }

    }


    function loadProject() {

        try {

            const raw =
                localStorage.getItem(
                    "FOBAS_ROBOTICS_PROJECT"
                );


            if (!raw) {

                showToast(
                    "Aucun projet sauvegardé.",
                    "info"
                );

                return;

            }


            const data =
                JSON.parse(raw);


            loadProjectData(
                data
            );


            showToast(
                "Projet chargé.",
                "success"
            );

        } catch (error) {

            showToast(
                "Le projet sauvegardé est invalide.",
                "error"
            );

        }

    }


    function loadProjectData(
        data
    ) {

        if (
            !data ||
            typeof data !== "object"
        ) {
            return;
        }


        saveHistory();


        state.projectName =
            safeString(
                data.projectName,
                "Projet FOBAS"
            );


        state.objects =
            Array.isArray(
                data.objects
            )
                ? deepClone(
                    data.objects
                )
                : [];


        state.connections =
            Array.isArray(
                data.connections
            )
                ? deepClone(
                    data.connections
                )
                : [];


        if (
            data.measurements
        ) {

            state.measurements =
                Object.assign(
                    {},
                    state.measurements,
                    data.measurements
                );

        }


        renderEntireWorkspace();

    }


    function exportProject() {

        const data =
            getProjectData();


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
            (
                state.projectName ||
                "projet-fobas"
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


        window.setTimeout(
            function () {

                URL.revokeObjectURL(
                    url
                );

            },
            500
        );


        showToast(
            "Projet exporté.",
            "success"
        );

    }


    function importProject() {

        const input =
            byId(
                "projectFileInput"
            );


        if (!input) {
            return;
        }


        input.value = "";

        input.click();

    }


    function handleProjectFile(
        event
    ) {

        const file =
            event.target.files &&
            event.target.files[0];


        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function () {

                try {

                    const data =
                        JSON.parse(
                            reader.result
                        );


                    loadProjectData(
                        data
                    );


                    showToast(
                        "Projet importé.",
                        "success"
                    );

                } catch (error) {

                    showToast(
                        "Fichier projet invalide.",
                        "error"
                    );

                }

            };


        reader.readAsText(
            file
        );

    }


    function createNewProject() {

        showDialog(
            "Nouveau projet",
            "Voulez-vous réellement créer un nouveau laboratoire ?",
            [
                {
                    label: "Annuler",
                    action: closeDialog
                },
                {
                    label: "Créer",
                    primary: true,
                    action: function () {

                        saveHistory();

                        state.objects = [];

                        state.connections = [];

                        state.selectedObjectId =
                            null;

                        state.projectName =
                            "Projet FOBAS";

                        renderEntireWorkspace();

                        closeDialog();

                        showToast(
                            "Nouveau projet créé.",
                            "success"
                        );

                    }
                }
            ]
        );

    }


    /* ============================================================
       29 — DIALOGUE
    ============================================================ */

    function showDialog(
        title,
        message,
        actions
    ) {

        const system =
            byId("dialogSystem");

        const titleElement =
            byId("dialogTitle");

        const content =
            byId("dialogContent");

        const actionsElement =
            byId("dialogActions");


        if (
            !system ||
            !content ||
            !actionsElement
        ) {
            return;
        }


        if (titleElement) {
            titleElement.textContent =
                safeString(title);
        }


        content.textContent =
            safeString(message);


        actionsElement.innerHTML = "";


        (actions || [])
            .forEach(
                function (item) {

                    const button =
                        document.createElement(
                            "button"
                        );

                    button.type =
                        "button";

                    button.className =
                        "dialog-action" +
                        (
                            item.primary
                                ? " primary-dialog-action"
                                : ""
                        );

                    button.textContent =
                        safeString(
                            item.label,
                            "OK"
                        );


                    button.addEventListener(
                        "click",
                        function () {

                            if (
                                typeof item.action ===
                                "function"
                            ) {

                                item.action();

                            }

                        }
                    );


                    actionsElement.appendChild(
                        button
                    );

                }
            );


        system.setAttribute(
            "aria-hidden",
            "false"
        );

        system.classList.add(
            "open"
        );

    }


    function closeDialog() {

        const system =
            byId("dialogSystem");

        if (!system) {
            return;
        }


        system.setAttribute(
            "aria-hidden",
            "true"
        );

        system.classList.remove(
            "open"
        );

    }


    /* ============================================================
       30 — PANNEAU MOBILE
    ============================================================ */

    function openAddPanel() {

        const panel =
            byId("mobilePanelSystem");

        const content =
            byId("mobilePanelContent");

        const title =
            byId("mobilePanelTitle");


        if (
            !panel ||
            !content
        ) {
            setActiveView(
                "composants"
            );

            return;

        }


        if (title) {

            title.textContent =
                "Ajouter au laboratoire";

        }


        content.innerHTML =
            '<div class="mobile-add-grid">' +

                '<button type="button" ' +
                    'class="mobile-add-option" ' +
                    'data-mobile-add="component">' +
                    '<span>🔌</span>' +
                    '<strong>Composants</strong>' +
                '</button>' +

                '<button type="button" ' +
                    'class="mobile-add-option" ' +
                    'data-mobile-add="tool">' +
                    '<span>🧰</span>' +
                    '<strong>Outils</strong>' +
                '</button>' +

                '<button type="button" ' +
                    'class="mobile-add-option" ' +
                    'data-mobile-add="board">' +
                    '<span>▦</span>' +
                    '<strong>Boards</strong>' +
                '</button>' +

            '</div>';


        $$(
            "[data-mobile-add]",
            content
        ).forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const type =
                            button.dataset.mobileAdd;

                        closeMobilePanel();


                        if (
                            type ===
                            "component"
                        ) {

                            setActiveView(
                                "composants"
                            );

                        } else if (
                            type === "tool"
                        ) {

                            setActiveView(
                                "outils"
                            );

                        } else {

                            setActiveView(
                                "composants"
                            );

                        }

                    }
                );

            }
        );


        openMobilePanel();

    }


    function openMobilePanel() {

        const system =
            byId("mobilePanelSystem");

        if (!system) {
            return;
        }


        system.setAttribute(
            "aria-hidden",
            "false"
        );

        system.classList.add(
            "open"
        );

    }


    function closeMobilePanel() {

        const system =
            byId("mobilePanelSystem");

        if (!system) {
            return;
        }


        system.setAttribute(
            "aria-hidden",
            "true"
        );

        system.classList.remove(
            "open"
        );

    }


    function setupMobilePanel() {

        const close =
            byId(
                "mobilePanelCloseBtn"
            );

        const backdrop =
            byId(
                "mobilePanelBackdrop"
            );


        if (close) {

            close.addEventListener(
                "click",
                closeMobilePanel
            );

        }


        if (backdrop) {

            backdrop.addEventListener(
                "click",
                closeMobilePanel
            );

        }


        setupPanelDrag();

    }


    function setupPanelDrag() {

        const panel =
            byId("mobilePanel");

        const handle =
            byId(
                "mobilePanelDragHandle"
            );


        if (
            !panel ||
            !handle
        ) {
            return;
        }


        let startY = 0;

        let startTransform = 0;

        let dragging = false;


        handle.addEventListener(
            "pointerdown",
            function (event) {

                dragging = true;

                startY =
                    event.clientY;

                startTransform = 0;

                try {

                    handle.setPointerCapture(
                        event.pointerId
                    );

                } catch (error) {
                    /* no-op */
                }

            }
        );


        handle.addEventListener(
            "pointermove",
            function (event) {

                if (!dragging) {
                    return;
                }


                const delta =
                    event.clientY -
                    startY;


                if (delta > 0) {

                    panel.style.transform =
                        "translateY(" +
                        delta +
                        "px)";

                }

            }
        );


        handle.addEventListener(
            "pointerup",
            function (event) {

                if (!dragging) {
                    return;
                }


                dragging = false;


                const delta =
                    event.clientY -
                    startY;


                panel.style.transform =
                    "";


                if (
                    delta > 120
                ) {

                    closeMobilePanel();

                }

            }
        );

    }


    /* ============================================================
       31 — ZOOM ANDROID À DEUX DOIGTS
       ------------------------------------------------------------
       Le CSS prépare le conteneur.
       Le JS gère ici le vrai calcul du pinch-to-zoom.
    ============================================================ */

    function setupWorkspaceTouchZoom() {

        const workspace =
            byId(
                "laboratoryWorkspace"
            );


        if (!workspace) {
            return;
        }


        let pinchStartDistance =
            null;

        let pinchStartScale =
            state.workspaceScale;


        let panStart = null;


        workspace.addEventListener(
            "touchstart",
            function (event) {

                if (
                    event.touches.length ===
                    2
                ) {

                    event.preventDefault();


                    pinchStartDistance =
                        getTouchDistance(
                            event.touches[0],
                            event.touches[1]
                        );


                    pinchStartScale =
                        state.workspaceScale;

                    return;

                }


                if (
                    event.touches.length ===
                    1 &&
                    state.activeAction ===
                    "move"
                ) {

                    const touch =
                        event.touches[0];


                    panStart = {

                        x:
                            touch.clientX,

                        y:
                            touch.clientY,

                        offsetX:
                            state.workspaceOffsetX,

                        offsetY:
                            state.workspaceOffsetY

                    };

                }

            },
            {
                passive: false
            }
        );


        workspace.addEventListener(
            "touchmove",
            function (event) {

                if (
                    event.touches.length ===
                    2 &&
                    pinchStartDistance !==
                    null
                ) {

                    event.preventDefault();


                    const distance =
                        getTouchDistance(
                            event.touches[0],
                            event.touches[1]
                        );


                    if (
                        pinchStartDistance <= 0
                    ) {
                        return;
                    }


                    const ratio =
                        distance /
                        pinchStartDistance;


                    const newScale =
                        Math.max(
                            state.zoomMin,
                            Math.min(
                                state.zoomMax,
                                pinchStartScale *
                                ratio
                            )
                        );


                    setWorkspaceZoom(
                        newScale
                    );


                    return;

                }


                if (
                    event.touches.length ===
                    1 &&
                    panStart &&
                    state.activeAction ===
                    "move"
                ) {

                    event.preventDefault();


                    const touch =
                        event.touches[0];


                    state.workspaceOffsetX =
                        panStart.offsetX +
                        (
                            touch.clientX -
                            panStart.x
                        );


                    state.workspaceOffsetY =
                        panStart.offsetY +
                        (
                            touch.clientY -
                            panStart.y
                        );


                    applyWorkspaceTransform();

                }

            },
            {
                passive: false
            }
        );


        workspace.addEventListener(
            "touchend",
            function (event) {

                if (
                    event.touches.length <
                    2
                ) {

                    pinchStartDistance =
                        null;

                }


                if (
                    event.touches.length ===
                    0
                ) {

                    panStart =
                        null;

                }

            },
            {
                passive: false
            }
        );

    }


    function getTouchDistance(
        first,
        second
    ) {

        const dx =
            second.clientX -
            first.clientX;

        const dy =
            second.clientY -
            first.clientY;


        return Math.sqrt(
            dx * dx +
            dy * dy
        );

    }


    function setWorkspaceZoom(
        scale
    ) {

        state.workspaceScale =
            Math.max(
                state.zoomMin,
                Math.min(
                    state.zoomMax,
                    scale
                )
            );


        applyWorkspaceTransform();

    }


    function applyWorkspaceTransform() {

        const board =
            byId("workspaceBoard");

        const grid =
            byId("workspaceGrid");

        const wire =
            byId("wireLayer");

        const connection =
            byId("connectionLayer");

        const selection =
            byId("selectionLayer");


        const elements = [

            board,
            grid,
            wire,
            connection,
            selection

        ];


        const transform =
            "translate(" +
            state.workspaceOffsetX +
            "px, " +
            state.workspaceOffsetY +
            "px) " +
            "scale(" +
            state.workspaceScale +
            ")";


        elements.forEach(
            function (element) {

                if (element) {

                    element.style.transform =
                        transform;

                    element.style.transformOrigin =
                        "0 0";

                }

            }
        );


        redrawAllWires();

    }


    /* ============================================================
       32 — ZOOM MOLETTE / CTRL
       ------------------------------------------------------------ */

    function setupWheelZoom() {

        const workspace =
            byId(
                "laboratoryWorkspace"
            );


        if (!workspace) {
            return;
        }


        workspace.addEventListener(
            "wheel",
            function (event) {

                if (
                    !event.ctrlKey
                ) {
                    return;
                }


                event.preventDefault();


                const factor =
                    event.deltaY < 0
                        ? 1.08
                        : 0.92;


                setWorkspaceZoom(
                    state.workspaceScale *
                    factor
                );

            },
            {
                passive: false
            }
        );

    }


    /* ============================================================
       33 — PARAMÈTRES
    ============================================================ */

    function setupSettings() {

        const grid =
            byId("settingGrid");

        const snap =
            byId("settingSnap");

        const sound =
            byId("settingSound");

        const touch =
            byId("settingTouch");


        if (grid) {

            grid.checked =
                state.gridVisible;


            grid.addEventListener(
                "change",
                function () {

                    state.gridVisible =
                        grid.checked;


                    const workspaceGrid =
                        byId(
                            "workspaceGrid"
                        );


                    if (workspaceGrid) {

                        workspaceGrid.classList.toggle(
                            "grid-hidden",
                            !grid.checked
                        );

                    }

                }
            );

        }


        if (snap) {

            snap.checked =
                state.snapEnabled;


            snap.addEventListener(
                "change",
                function () {

                    state.snapEnabled =
                        snap.checked;

                }
            );

        }


        if (sound) {

            sound.checked =
                state.soundEnabled;


            sound.addEventListener(
                "change",
                function () {

                    state.soundEnabled =
                        sound.checked;

                }
            );

        }


        if (touch) {

            touch.checked =
                state.touchEnabled;


            touch.addEventListener(
                "change",
                function () {

                    state.touchEnabled =
                        touch.checked;

                }
            );

        }

    }


    /* ============================================================
       34 — STATUS SIMULATION
    ============================================================ */

    function setSimulationStatus(
        status,
        text
    ) {

        const indicator =
            byId(
                "simulationStatus"
            );

        const textElement =
            byId(
                "simulationStatusText"
            );


        if (indicator) {

            indicator.dataset.status =
                safeString(
                    status,
                    "ready"
                );

        }


        if (textElement) {

            textElement.textContent =
                safeString(
                    text,
                    "Système prêt"
                );

        }

    }


    /* ============================================================
       35 — CONSOLE
    ============================================================ */

    function appendConsole(
        line
    ) {

        state.consoleLines.push(
            safeString(line)
        );


        if (
            state.consoleLines.length >
            200
        ) {

            state.consoleLines.shift();

        }


        const consoleElement =
            byId("codeConsole");


        if (consoleElement) {

            consoleElement.textContent =
                state.consoleLines.join(
                    "\n"
                );

            consoleElement.scrollTop =
                consoleElement.scrollHeight;

        }

    }


    /* ============================================================
       36 — COPIE
    ============================================================ */

    async function copyText(
        text
    ) {

        try {

            if (
                navigator.clipboard &&
                navigator.clipboard.writeText
            ) {

                await navigator.clipboard.writeText(
                    safeString(text)
                );

            } else {

                const textarea =
                    document.createElement(
                        "textarea"
                    );

                textarea.value =
                    safeString(text);

                textarea.style.position =
                    "fixed";

                textarea.style.opacity =
                    "0";


                document.body.appendChild(
                    textarea
                );

                textarea.select();

                document.execCommand(
                    "copy"
                );

                textarea.remove();

            }


            showToast(
                "Code copié.",
                "success"
            );

        } catch (error) {

            showToast(
                "Copie impossible.",
                "error"
            );

        }

    }


    /* ============================================================
       37 — PROJET / BOUTONS
    ============================================================ */

    function setupProjectButtons() {

        const newButton =
            byId("newProjectBtn");

        const saveButton =
            byId("saveProjectBtn");

        const loadButton =
            byId("loadProjectBtn");

        const exportButton =
            byId("exportProjectBtn");

        const importButton =
            byId("importProjectBtn");

        const fileInput =
            byId("projectFileInput");


        if (newButton) {

            newButton.addEventListener(
                "click",
                createNewProject
            );

        }


        if (saveButton) {

            saveButton.addEventListener(
                "click",
                saveProject
            );

        }


        if (loadButton) {

            loadButton.addEventListener(
                "click",
                loadProject
            );

        }


        if (exportButton) {

            exportButton.addEventListener(
                "click",
                exportProject
            );

        }


        if (importButton) {

            importButton.addEventListener(
                "click",
                importProject
            );

        }


        if (fileInput) {

            fileInput.addEventListener(
                "change",
                handleProjectFile
            );

        }

    }


    /* ============================================================
       38 — NAVIGATION
    ============================================================ */

    function setupNavigation() {

        $$(".main-tool-btn")
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            if (
                                button.dataset.module
                            ) {

                                handleModuleButton(
                                    button
                                );

                                return;

                            }


                            if (
                                button.dataset.action
                            ) {

                                handleActionButton(
                                    button
                                );

                            }

                        }
                    );

                }
            );


        $$(".workspace-mini-btn")
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            executeAction(
                                button.dataset.action
                            );

                        }
                    );

                }
            );


        const emptyAdd =
            byId("emptyAddBtn");

        if (emptyAdd) {

            emptyAdd.addEventListener(
                "click",
                openAddPanel
            );

        }

    }


    /* ============================================================
       39 — CLAVIER
    ============================================================ */

    function setupKeyboard() {

        document.addEventListener(
            "keydown",
            function (event) {

                const active =
                    document.activeElement;


                const editing =
                    active &&
                    (
                        active.tagName ===
                        "TEXTAREA" ||
                        active.tagName ===
                        "INPUT"
                    );


                if (
                    event.ctrlKey &&
                    event.key.toLowerCase() ===
                    "z"
                ) {

                    if (!editing) {

                        event.preventDefault();

                        undo();

                    }

                    return;

                }


                if (
                    event.ctrlKey &&
                    event.key.toLowerCase() ===
                    "y"
                ) {

                    if (!editing) {

                        event.preventDefault();

                        redo();

                    }

                    return;

                }


                if (
                    event.key ===
                    "Delete"
                ) {

                    if (!editing) {

                        event.preventDefault();

                        deleteSelectedObject();

                    }

                }


                if (
                    event.key ===
                    "Escape"
                ) {

                    clearConnectionStart();

                    closeMobilePanel();

                    closeDialog();

                }

            }
        );

    }


    /* ============================================================
       40 — TOUCH / POINTER GÉNÉRAL
    ============================================================ */

    function setupPointerSafety() {

        document.addEventListener(
            "contextmenu",
            function (event) {

                if (
                    event.target.closest(
                        "#laboratoryWorkspace"
                    )
                ) {

                    event.preventDefault();

                }

            }
        );

    }


    /* ============================================================
       41 — DÉTECTION DU DOUBLE CLIC / MOBILE
    ============================================================ */

    function setupMobileEnhancements() {

        document.documentElement.classList.toggle(
            "fobas-touch-device",
            "ontouchstart" in window ||
            navigator.maxTouchPoints > 0
        );


        if (
            "ontouchstart" in window ||
            navigator.maxTouchPoints > 0
        ) {

            document.body.classList.add(
                "touch-device"
            );

        }

    }


    /* ============================================================
       42 — INITIALISATION
    ============================================================ */

    function initialize() {

        if (state.initialized) {
            return;
        }


        state.initialized = true;


        setupNavigation();

        setupEditor();

        setupCodeSearch();

        setupProjectButtons();

        setupSettings();

        setupMobilePanel();

        setupWorkspaceTouchZoom();

        setupWheelZoom();

        setupKeyboard();

        setupPointerSafety();

        setupMobileEnhancements();


        renderToolsLibrary();

        renderComponentsLibrary();

        renderCodeLibrary();

        renderMissions();

        updateMeasurementsUI();

        updateWorkspaceStatus();

        renderEntireWorkspace();


        setActiveView(
            "laboratoire"
        );


        setSimulationStatus(
            "ready",
            "Système prêt"
        );


        appendConsole(
            "FOBAS Robotics Engine " +
            APP.version +
            " prêt."
        );


        showToast(
            "Laboratoire FOBAS prêt.",
            "success"
        );

    }


    /* ============================================================
       43 — DOM READY
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


    /* ============================================================
       44 — API PUBLIQUE
       ------------------------------------------------------------
       Le moteur peut être utilisé depuis le fichier data ou
       depuis d'autres modules sans exposer les variables internes.
    ============================================================ */

    APP.api = {

        addLibraryItem:
            addLibraryItem,

        addComponent:
            function (component) {

                return addLibraryItem(
                    component,
                    "component"
                );

            },

        addTool:
            function (tool) {

                return addLibraryItem(
                    tool,
                    "tool"
                );

            },

        selectObject:
            selectObject,

        deleteSelectedObject:
            deleteSelectedObject,

        createConnection:
            createConnection,

        deleteConnection:
            deleteConnection,

        setView:
            setActiveView,

        run:
            runProgram,

        stop:
            stopProgram,

        test:
            runDiagnostic,

        undo:
            undo,

        redo:
            redo,

        save:
            saveProject,

        load:
            loadProject,

        exportProject:
            exportProject,

        importProject:
            importProject,

        zoom:
            setWorkspaceZoom,

        simulate:
            simulateCircuit

    };


    /* ============================================================
       45 — EXPORTS COMPATIBILITÉ
    ============================================================ */

    window.FOBASRoboticsEngine = APP;

    window.FOBASRobotics = APP;


})();