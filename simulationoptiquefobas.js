/* ========================================================================
   FOBAS ÉLECTRONIQUE & ROBOTIQUE
   ------------------------------------------------------------------------
   FICHIER : simulationrobotiquefobas.js
   VERSION  : 2.0.0
   ENGINE   : FOBAS_ROBOTICS_ENGINE

   COMPATIBILITÉ :
   - simulationrobotiquefobas.html
   - simulationrobotiquefobas.css
   - simulationrobotiquefobas-data.js

   IMPORTANT :
   Ce fichier remplace complètement l'ancien moteur.
   Il ne contient AUCUN code du moteur FOBAS OPTIQUE.

   FONCTIONS PRINCIPALES :
   - Bibliothèque composants
   - Bibliothèque outils
   - Ajout réel dans le laboratoire
   - Déplacement tactile
   - Sélection tactile
   - Connexions
   - Déconnexion
   - Suppression
   - Test
   - Exécution
   - Undo / Redo
   - Pinch Zoom Android
   - Pan tactile
   - Inspector
   - Mesures
   - Diagnostic
   - Missions
   - Programmation
   - Projet
   - Sauvegarde locale
   - Import / Export
   ======================================================================== */

(function () {

    "use strict";


    /* =====================================================================
       01 — CONFIGURATION
       ===================================================================== */

    const CONFIG = {

        appName:
            "FOBAS Électronique & Robotique",

        version:
            "2.0.0",

        storageKey:
            "FOBAS_ROBOTICS_PROJECT_V2",

        zoomMin:
            0.45,

        zoomMax:
            2.8,

        zoomDefault:
            1,

        gridSize:
            32,

        objectMinWidth:
            82,

        objectMinHeight:
            68,

        touchMoveThreshold:
            4

    };


    /* =====================================================================
       02 — ÉTAT CENTRAL
       ===================================================================== */

    const STATE = {

        initialized:
            false,

        activeView:
            "laboratoire",

        interactionMode:
            "select",

        selectedObject:
            null,

        selectedLibraryType:
            null,

        selectedToolType:
            null,

        objects:
            [],

        connections:
            [],

        measurements:
            [],

        missions:
            [],

        history:
            [],

        historyIndex:
            -1,

        projectName:
            "Nouveau projet FOBAS",

        dirty:
            false,

        workspaceZoom:
            CONFIG.zoomDefault,

        workspacePan:
            {
                x: 0,
                y: 0
            },

        pointer:
            {
                active:
                    false,

                pointerId:
                    null,

                startX:
                    0,

                startY:
                    0,

                lastX:
                    0,

                lastY:
                    0,

                moved:
                    false,

                objectId:
                    null
            },

        touches:
            new Map(),

        gesture:
            {
                active:
                    false,

                startDistance:
                    0,

                startZoom:
                    1,

                startCenter:
                    {
                        x: 0,
                        y: 0
                    },

                startPan:
                    {
                        x: 0,
                        y: 0
                    }
            },

        counters:
            {
                object:
                    0,

                connection:
                    0,

                measurement:
                    0
            },

        settings:
            {
                snap:
                    true,

                sound:
                    true,

                touch:
                    true
            },

        testStatus:
            "Prêt",

        running:
            false

    };


    /* =====================================================================
       03 — DOM
       ===================================================================== */

    const DOM = {};


    function cacheDOM() {

        DOM.app =
            document.getElementById(
                "fobasRoboticsApp"
            );

        DOM.appRoot =
            document.getElementById(
                "appRoot"
            );

        DOM.mainToolbar =
            document.querySelector(
                ".main-toolbar"
            );

        DOM.views =
            Array.from(
                document.querySelectorAll(
                    ".app-view[data-view]"
                )
            );

        DOM.workspace =
            document.getElementById(
                "laboratoryWorkspace"
            );

        DOM.workspaceShell =
            document.getElementById(
                "workspaceShell"
            );

        DOM.workspaceBoard =
            document.getElementById(
                "workspaceBoard"
            );

        DOM.workspaceGrid =
            document.getElementById(
                "workspaceGrid"
            );

        DOM.wireLayer =
            document.getElementById(
                "wireLayer"
            );

        DOM.wireObjects =
            document.getElementById(
                "wireObjects"
            );

        DOM.connectionLayer =
            document.getElementById(
                "connectionLayer"
            );

        DOM.selectionLayer =
            document.getElementById(
                "selectionLayer"
            );

        DOM.workspaceEmptyState =
            document.getElementById(
                "workspaceEmptyState"
            );

        DOM.inspector =
            document.getElementById(
                "workspaceInspector"
            );

        DOM.inspectorContent =
            document.getElementById(
                "inspectorContent"
            );

        DOM.toolsLibrary =
            document.getElementById(
                "toolsLibrary"
            );

        DOM.componentsLibrary =
            document.getElementById(
                "componentsLibrary"
            );

        DOM.componentCategories =
            document.getElementById(
                "componentCategories"
            );

        DOM.codeLibrary =
            document.getElementById(
                "codeLibrary"
            );

        DOM.missionsLibrary =
            document.getElementById(
                "missionsLibrary"
            );

        DOM.toastContainer =
            document.getElementById(
                "toastContainer"
            );

        DOM.dialogSystem =
            document.getElementById(
                "dialogSystem"
            );

        DOM.dialogBackdrop =
            document.getElementById(
                "dialogBackdrop"
            );

        DOM.mainDialog =
            document.getElementById(
                "mainDialog"
            );

        DOM.dialogTitle =
            document.getElementById(
                "dialogTitle"
            );

        DOM.dialogContent =
            document.getElementById(
                "dialogContent"
            );

        DOM.dialogActions =
            document.getElementById(
                "dialogActions"
            );

        DOM.mobilePanelSystem =
            document.getElementById(
                "mobilePanelSystem"
            );

        DOM.mobilePanelBackdrop =
            document.getElementById(
                "mobilePanelBackdrop"
            );

        DOM.mobilePanel =
            document.getElementById(
                "mobilePanel"
            );

        DOM.mobilePanelContent =
            document.getElementById(
                "mobilePanelContent"
            );

        DOM.mobilePanelTitle =
            document.getElementById(
                "mobilePanelTitle"
            );

        DOM.mobilePanelCloseBtn =
            document.getElementById(
                "mobilePanelCloseBtn"
            );

        DOM.componentCountStatus =
            document.getElementById(
                "componentCountStatus"
            );

        DOM.connectionCountStatus =
            document.getElementById(
                "connectionCountStatus"
            );

        DOM.wireCountStatus =
            document.getElementById(
                "wireCountStatus"
            );

        DOM.workspaceModeStatus =
            document.getElementById(
                "workspaceModeStatus"
            );

        DOM.codeEditor =
            document.getElementById(
                "roboticsCodeEditor"
            );

        DOM.codeLineNumbers =
            document.getElementById(
                "codeLineNumbers"
            );

        DOM.codeConsole =
            document.getElementById(
                "codeConsole"
            );

        DOM.codeValidationPanel =
            document.getElementById(
                "codeValidationPanel"
            );

        DOM.codeValidationStatus =
            document.getElementById(
                "codeValidationStatus"
            );

        DOM.voltageValue =
            document.getElementById(
                "voltageValue"
            );

        DOM.currentValue =
            document.getElementById(
                "currentValue"
            );

        DOM.resistanceValue =
            document.getElementById(
                "resistanceValue"
            );

        DOM.frequencyValue =
            document.getElementById(
                "frequencyValue"
            );

        DOM.pwmValue =
            document.getElementById(
                "pwmValue"
            );

        DOM.temperatureValue =
            document.getElementById(
                "temperatureValue"
            );

        DOM.diagnosticSummary =
            document.getElementById(
                "diagnosticSummary"
            );

        DOM.diagnosticResults =
            document.getElementById(
                "diagnosticResults"
            );

        DOM.settingSnap =
            document.getElementById(
                "settingSnap"
            );

        DOM.settingSound =
            document.getElementById(
                "settingSound"
            );

        DOM.settingTouch =
            document.getElementById(
                "settingTouch"
            );

        DOM.projectPanel =
            document.getElementById(
                "projectPanel"
            );

        DOM.projectFileInput =
            document.getElementById(
                "projectFileInput"
            );

        DOM.newProjectBtn =
            document.getElementById(
                "newProjectBtn"
            );

        DOM.saveProjectBtn =
            document.getElementById(
                "saveProjectBtn"
            );

        DOM.loadProjectBtn =
            document.getElementById(
                "loadProjectBtn"
            );

        DOM.exportProjectBtn =
            document.getElementById(
                "exportProjectBtn"
            );

        DOM.importProjectBtn =
            document.getElementById(
                "importProjectBtn"
            );

        DOM.editorPasteBtn =
            document.getElementById(
                "editorPasteBtn"
            );

        DOM.editorClearBtn =
            document.getElementById(
                "editorClearBtn"
            );

        DOM.editorVerifyBtn =
            document.getElementById(
                "editorVerifyBtn"
            );

        DOM.editorRunBtn =
            document.getElementById(
                "editorRunBtn"
            );

        DOM.editorStopBtn =
            document.getElementById(
                "editorStopBtn"
            );

        DOM.mobilePanelDragHandle =
            document.getElementById(
                "mobilePanelDragHandle"
            );

        DOM.ariaLiveRegion =
            document.getElementById(
                "ariaLiveRegion"
            );

        DOM.workspaceAddBtn =
            document.getElementById(
                "workspaceAddBtn"
            );

        DOM.workspaceConnectBtn =
            document.getElementById(
                "workspaceConnectBtn"
            );

        DOM.workspaceMeasureBtn =
            document.getElementById(
                "workspaceMeasureBtn"
            );

        DOM.workspaceTestBtn =
            document.getElementById(
                "workspaceTestBtn"
            );

        DOM.workspaceRunBtn =
            document.getElementById(
                "workspaceRunBtn"
            );

        DOM.emptyAddBtn =
            document.getElementById(
                "emptyAddBtn"
            );

        DOM.mainButtons =
            Array.from(
                document.querySelectorAll(
                    "[data-module]"
                )
            );

        DOM.actionButtons =
            Array.from(
                document.querySelectorAll(
                    "[data-action]"
                )
            );

        DOM.templates = {

            component:
                document.getElementById(
                    "componentCardTemplate"
                ),

            tool:
                document.getElementById(
                    "toolCardTemplate"
                ),

            code:
                document.getElementById(
                    "codeCardTemplate"
                ),

            mission:
                document.getElementById(
                    "missionCardTemplate"
                ),

            object:
                document.getElementById(
                    "workspaceObjectTemplate"
                ),

            pin:
                document.getElementById(
                    "pinTemplate"
                )

        };
    }


    /* =====================================================================
       04 — OUTILS GÉNÉRAUX
       ===================================================================== */

    function uid(prefix) {

        const random =
            Math.random()
                .toString(36)
                .slice(2, 9);

        return (
            prefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            random
        );
    }


    function clamp(value, min, max) {

        return Math.min(
            max,
            Math.max(
                min,
                Number(value) || 0
            )
        );
    }


    function safeNumber(value, fallback) {

        const number =
            Number(value);

        return Number.isFinite(number)
            ? number
            : fallback;
    }


    function escapeHTML(value) {

        return String(
            value === undefined ||
            value === null
                ? ""
                : value
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


    function deepClone(value) {

        try {

            return JSON.parse(
                JSON.stringify(value)
            );

        } catch (error) {

            return value;
        }
    }


    function notify(message, type) {

        if (!DOM.toastContainer) {
            console.log(
                "[FOBAS]",
                message
            );
            return;
        }

        const toast =
            document.createElement("div");

        toast.className =
            "fobas-robotics-toast " +
            (
                type ||
                "info"
            );

        toast.textContent =
            message;

        DOM.toastContainer.appendChild(
            toast
        );

        requestAnimationFrame(
            function () {

                toast.classList.add(
                    "show"
                );

            }
        );

        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

                setTimeout(
                    function () {

                        if (
                            toast.parentNode
                        ) {

                            toast.parentNode.removeChild(
                                toast
                            );
                        }

                    },
                    300
                );

            },
            3000
        );

        if (DOM.ariaLiveRegion) {

            DOM.ariaLiveRegion.textContent =
                message;
        }
    }


    /* =====================================================================
       05 — DATA / BIBLIOTHÈQUES
       ===================================================================== */

    const FALLBACK_COMPONENTS = [

        {
            type: "arduino-uno",
            name: "Arduino UNO",
            description: "Carte de contrôle programmable",
            category: "microcontroller",
            icon: "🟦",
            width: 118,
            height: 82
        },

        {
            type: "raspberry-pi",
            name: "Raspberry Pi",
            description: "Ordinateur monocarte",
            category: "microcontroller",
            icon: "🟩",
            width: 118,
            height: 82
        },

        {
            type: "led",
            name: "LED",
            description: "Diode électroluminescente",
            category: "output",
            icon: "💡",
            width: 82,
            height: 68
        },

        {
            type: "resistor",
            name: "Résistance",
            description: "Composant résistif",
            category: "passive",
            icon: "〰️",
            width: 92,
            height: 68
        },

        {
            type: "push-button",
            name: "Bouton poussoir",
            description: "Interrupteur momentané",
            category: "input",
            icon: "🔘",
            width: 96,
            height: 68
        },

        {
            type: "battery",
            name: "Batterie",
            description: "Source d'alimentation",
            category: "power",
            icon: "🔋",
            width: 100,
            height: 72
        },

        {
            type: "motor",
            name: "Moteur DC",
            description: "Moteur électrique",
            category: "output",
            icon: "⚙️",
            width: 100,
            height: 76
        },

        {
            type: "servo",
            name: "Servo moteur",
            description: "Actionneur servo",
            category: "output",
            icon: "🔧",
            width: 104,
            height: 76
        },

        {
            type: "buzzer",
            name: "Buzzer",
            description: "Sortie sonore",
            category: "output",
            icon: "🔊",
            width: 92,
            height: 68
        },

        {
            type: "potentiometer",
            name: "Potentiomètre",
            description: "Résistance variable",
            category: "input",
            icon: "🎛️",
            width: 104,
            height: 72
        },

        {
            type: "light-sensor",
            name: "Capteur lumière",
            description: "Détection de luminosité",
            category: "sensor",
            icon: "☀️",
            width: 104,
            height: 72
        },

        {
            type: "ultrasonic-sensor",
            name: "Capteur ultrason",
            description: "Mesure de distance",
            category: "sensor",
            icon: "📡",
            width: 112,
            height: 76
        },

        {
            type: "temperature-sensor",
            name: "Capteur température",
            description: "Mesure thermique",
            category: "sensor",
            icon: "🌡️",
            width: 110,
            height: 76
        },

        {
            type: "relay",
            name: "Relais",
            description: "Commande électromécanique",
            category: "control",
            icon: "🔌",
            width: 94,
            height: 70
        },

        {
            type: "breadboard",
            name: "Breadboard",
            description: "Plaque d'expérimentation",
            category: "board",
            icon: "▦",
            width: 160,
            height: 92
        }

    ];


    const FALLBACK_TOOLS = [

        {
            type: "multimeter",
            name: "Multimètre",
            description: "Mesure tension, courant et résistance",
            icon: "📟"
        },

        {
            type: "oscilloscope",
            name: "Oscilloscope",
            description: "Observation des signaux électriques",
            icon: "📈"
        },

        {
            type: "power-supply",
            name: "Alimentation",
            description: "Source d'alimentation réglable",
            icon: "⚡"
        },

        {
            type: "logic-analyzer",
            name: "Analyseur logique",
            description: "Analyse des signaux numériques",
            icon: "〽️"
        },

        {
            type: "signal-generator",
            name: "Générateur de signaux",
            description: "Production de signaux de test",
            icon: "〰️"
        },

        {
            type: "screwdriver",
            name: "Tournevis",
            description: "Outil de montage virtuel",
            icon: "🪛"
        },

        {
            type: "wire-cutter",
            name: "Coupe-fil",
            description: "Outil de préparation des connexions",
            icon: "✂️"
        },

        {
            type: "probe",
            name: "Sonde",
            description: "Sonde de mesure",
            icon: "🔎"
        }

    ];


    function discoverDataArray(names, fallback) {

        for (
            let i = 0;
            i < names.length;
            i++
        ) {

            const value =
                window[names[i]];

            if (
                Array.isArray(value) &&
                value.length
            ) {

                return value;
            }
        }

        return fallback;
    }


    let COMPONENTS =
        discoverDataArray(
            [
                "FOBAS_ROBOTICS_COMPONENTS",
                "ROBOTICS_COMPONENTS",
                "COMPONENTS",
                "componentsData",
                "FOBAS_COMPONENTS"
            ],
            FALLBACK_COMPONENTS
        );


    let TOOLS =
        discoverDataArray(
            [
                "FOBAS_ROBOTICS_TOOLS",
                "ROBOTICS_TOOLS",
                "TOOLS",
                "toolsData",
                "FOBAS_TOOLS"
            ],
            FALLBACK_TOOLS
        );


    const CODES =
        discoverDataArray(
            [
                "FOBAS_ROBOTICS_CODES",
                "ROBOTICS_CODES",
                "CODES",
                "codesData"
            ],
            []
        );


    const MISSIONS =
        discoverDataArray(
            [
                "FOBAS_ROBOTICS_MISSIONS",
                "ROBOTICS_MISSIONS",
                "MISSIONS",
                "missionsData"
            ],
            []
        );


    function normalizeComponent(item) {

        return {

            type:
                item.type ||
                item.id ||
                uid("component"),

            name:
                item.name ||
                item.title ||
                "Composant",

            description:
                item.description ||
                "",

            category:
                item.category ||
                "general",

            icon:
                item.icon ||
                item.emoji ||
                "◉",

            width:
                safeNumber(
                    item.width,
                    100
                ),

            height:
                safeNumber(
                    item.height,
                    72
                ),

            pins:
                Array.isArray(item.pins)
                    ? deepClone(item.pins)
                    : []

        };
    }


    function normalizeTool(item) {

        return {

            type:
                item.type ||
                item.id ||
                uid("tool"),

            name:
                item.name ||
                item.title ||
                "Outil",

            description:
                item.description ||
                "",

            icon:
                item.icon ||
                item.emoji ||
                "🛠️"

        };
    }


    COMPONENTS =
        COMPONENTS.map(
            normalizeComponent
        );


    TOOLS =
        TOOLS.map(
            normalizeTool
        );


    /* =====================================================================
       06 — CRÉATION OBJETS
       ===================================================================== */

    function getComponentDefinition(type) {

        return (
            COMPONENTS.find(
                function (item) {

                    return item.type === type;

                }
            ) ||
            normalizeComponent({
                type:
                    type,

                name:
                    type
            })
        );
    }


    function createObject(type) {

        const definition =
            getComponentDefinition(
                type
            );

        const object = {

            id:
                uid("robot"),

            numericId:
                ++STATE.counters.object,

            type:
                definition.type,

            name:
                definition.name,

            description:
                definition.description,

            category:
                definition.category,

            icon:
                definition.icon,

            width:
                definition.width,

            height:
                definition.height,

            position:
                {
                    x: 0,
                    y: 0
                },

            rotation:
                0,

            scale:
                1,

            visible:
                true,

            locked:
                false,

            pins:
                deepClone(
                    definition.pins || []
                ),

            values:
                {},

            createdAt:
                Date.now()

        };

        return object;
    }


    /* =====================================================================
       07 — POSITIONNEMENT DANS WORKSPACE
       ===================================================================== */

    function getWorkspaceCenter() {

        if (!DOM.workspace) {

            return {
                x: 200,
                y: 180
            };
        }

        return {

            x:
                Math.max(
                    50,
                    DOM.workspace.clientWidth /
                        2
                ),

            y:
                Math.max(
                    80,
                    DOM.workspace.clientHeight /
                        2
                )

        };
    }


    function findFreePosition() {

        const center =
            getWorkspaceCenter();

        const index =
            STATE.objects.length;

        const offset =
            (index % 5) * 34;

        const row =
            Math.floor(
                index / 5
            ) * 30;

        return {

            x:
                center.x -
                50 +
                offset,

            y:
                center.y -
                40 +
                row

        };
    }


    function worldToScreenPosition(object) {

        const pan =
            STATE.workspacePan;

        return {

            x:
                object.position.x *
                    STATE.workspaceZoom +
                pan.x,

            y:
                object.position.y *
                    STATE.workspaceZoom +
                pan.y

        };
    }


    function screenToWorkspacePosition(x, y) {

        return {

            x:
                (
                    x -
                    STATE.workspacePan.x
                ) /
                STATE.workspaceZoom,

            y:
                (
                    y -
                    STATE.workspacePan.y
                ) /
                STATE.workspaceZoom

        };
    }


    /* =====================================================================
       08 — AJOUT DANS LABORATOIRE
       ===================================================================== */

    function addComponent(type) {

        if (!type) {

            notify(
                "Composant invalide.",
                "warning"
            );

            return null;
        }

        const object =
            createObject(type);

        if (!object) {

            notify(
                "Impossible de créer le composant.",
                "error"
            );

            return null;
        }

        const position =
            findFreePosition();

        object.position.x =
            position.x;

        object.position.y =
            position.y;

        STATE.objects.push(
            object
        );

        saveHistory();

        renderWorkspace();

        selectObject(
            object
        );

        STATE.dirty =
            true;

        updateStatus();

        saveProjectSilently();

        notify(
            object.name +
            " ajouté au laboratoire.",
            "success"
        );

        return object;
    }


    function addSelectedComponent() {

        if (
            !STATE.selectedLibraryType
        ) {

            notify(
                "Sélectionnez d'abord un composant.",
                "warning"
            );

            return null;
        }

        return addComponent(
            STATE.selectedLibraryType
        );
    }


    function addTool(type) {

        if (!type) {

            notify(
                "Outil invalide.",
                "warning"
            );

            return null;
        }

        /*
         * Un outil est également matérialisé dans
         * le laboratoire comme un objet réel.
         */

        const tool =
            TOOLS.find(
                function (item) {

                    return item.type === type;

                }
            );

        if (!tool) {

            notify(
                "Outil introuvable.",
                "error"
            );

            return null;
        }

        const object = {

            id:
                uid("tool"),

            numericId:
                ++STATE.counters.object,

            type:
                tool.type,

            name:
                tool.name,

            description:
                tool.description,

            category:
                "tool",

            icon:
                tool.icon,

            width:
                110,

            height:
                76,

            position:
                findFreePosition(),

            rotation:
                0,

            scale:
                1,

            visible:
                true,

            locked:
                false,

            pins:
                [],

            values:
                {},

            createdAt:
                Date.now(),

            isTool:
                true

        };

        STATE.objects.push(
            object
        );

        STATE.selectedToolType =
            type;

        saveHistory();

        /*
         * RENDU IMMÉDIAT.
         * C'est précisément ce qui manquait dans
         * l'ancien flux Ajouter.
         */

        renderWorkspace();

        selectObject(
            object
        );

        STATE.dirty =
            true;

        updateStatus();

        saveProjectSilently();

        notify(
            tool.name +
            " ajouté au laboratoire.",
            "success"
        );

        return object;
    }


    /* =====================================================================
       09 — RENDU WORKSPACE
       ===================================================================== */

    function renderWorkspace() {

        if (!DOM.workspaceBoard) {
            return;
        }

        DOM.workspaceBoard.innerHTML =
            "";

        STATE.objects.forEach(
            function (object) {

                if (
                    object.visible === false
                ) {
                    return;
                }

                const element =
                    createWorkspaceObjectElement(
                        object
                    );

                DOM.workspaceBoard.appendChild(
                    element
                );

            }
        );

        renderConnections();

        applyWorkspaceTransform();

        updateEmptyState();

        updateStatus();
    }


    function createWorkspaceObjectElement(object) {

        let element = null;

        if (
            DOM.templates.object &&
            "content" in
            DOM.templates.object
        ) {

            const fragment =
                DOM.templates.object.content.cloneNode(
                    true
                );

            element =
                fragment.querySelector(
                    ".workspace-object"
                );

        }

        if (!element) {

            element =
                document.createElement(
                    "div"
                );

            element.className =
                "workspace-object";

            element.innerHTML =
                "<div class=\"workspace-object-visual\" data-object-visual></div>" +
                "<div class=\"workspace-object-label\" data-object-label></div>" +
                "<div class=\"workspace-object-pins\" data-object-pins></div>" +
                "<div class=\"workspace-object-resize-handle\" data-resize-handle aria-hidden=\"true\"></div>";
        }

        element.dataset.objectId =
            object.id;

        element.dataset.componentId =
            object.type;

        element.dataset.objectType =
            object.type;

        element.tabIndex =
            0;

        const visual =
            element.querySelector(
                "[data-object-visual]"
            );

        const label =
            element.querySelector(
                "[data-object-label]"
            );

        const pins =
            element.querySelector(
                "[data-object-pins]"
            );

        if (visual) {

            visual.textContent =
                object.icon ||
                "◉";
        }

        if (label) {

            label.textContent =
                object.name;
        }

        if (pins) {

            renderObjectPins(
                pins,
                object
            );
        }

        element.style.width =
            object.width + "px";

        element.style.height =
            object.height + "px";

        element.style.left =
            object.position.x + "px";

        element.style.top =
            object.position.y + "px";

        element.style.transform =
            "rotate(" +
            object.rotation +
            "deg) scale(" +
            object.scale +
            ")";

        element.classList.toggle(
            "selected",
            STATE.selectedObject &&
            STATE.selectedObject.id ===
                object.id
        );

        if (object.locked) {

            element.classList.add(
                "locked"
            );
        }

        bindWorkspaceObjectEvents(
            element,
            object
        );

        return element;
    }


    function renderObjectPins(container, object) {

        container.innerHTML =
            "";

        const pins =
            object.pins &&
            object.pins.length
                ? object.pins
                : [
                    {
                        id: "default",
                        type: "io"
                    }
                ];

        pins.forEach(
            function (pin, index) {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
                    "component-pin";

                button.dataset.pin =
                    "true";

                button.dataset.pinId =
                    pin.id ||
                    String(index);

                button.dataset.pinType =
                    pin.type ||
                    "io";

                button.title =
                    pin.name ||
                    "Pin";

                container.appendChild(
                    button
                );

            }
        );
    }


    function bindWorkspaceObjectEvents(
        element,
        object
    ) {

        element.addEventListener(
            "pointerdown",
            function (event) {

                if (
                    event.target.closest(
                        ".component-pin"
                    )
                ) {
                    return;
                }

                event.stopPropagation();

                handleObjectPointerDown(
                    event,
                    object
                );
            }
        );

        element.addEventListener(
            "dblclick",
            function (event) {

                event.stopPropagation();

                selectObject(
                    object
                );

                openInspector(
                    object
                );

            }
        );

        element.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    selectObject(
                        object
                    );
                }

                if (
                    event.key ===
                    "Delete"
                ) {

                    deleteSelectedObject();
                }

            }
        );
    }


    /* =====================================================================
       10 — SÉLECTION
       ===================================================================== */

    function selectObject(object) {

        if (!object) {

            STATE.selectedObject =
                null;

        } else {

            STATE.selectedObject =
                object;
        }

        renderWorkspaceSelection();

        updateInspector();

        updateStatus();
    }


    function renderWorkspaceSelection() {

        if (!DOM.workspaceBoard) {
            return;
        }

        DOM.workspaceBoard
            .querySelectorAll(
                ".workspace-object"
            )
            .forEach(
                function (element) {

                    const id =
                        element.dataset.objectId;

                    element.classList.toggle(
                        "selected",
                        Boolean(
                            STATE.selectedObject &&
                            STATE.selectedObject.id ===
                                id
                        )
                    );

                }
            );
    }


    /* =====================================================================
       11 — DÉPLACEMENT TACTILE / SOURIS
       ===================================================================== */

    function handleObjectPointerDown(
        event,
        object
    ) {

        if (
            !STATE.settings.touch &&
            event.pointerType ===
                "touch"
        ) {
            return;
        }

        if (
            STATE.interactionMode ===
            "connect"
        ) {

            handleConnectObject(
                object
            );

            return;
        }

        if (
            STATE.interactionMode ===
            "select"
        ) {

            selectObject(
                object
            );

            return;
        }

        if (
            STATE.interactionMode !==
                "move"
        ) {

            selectObject(
                object
            );

            return;
        }

        if (object.locked) {

            notify(
                "Cet objet est verrouillé.",
                "warning"
            );

            return;
        }

        selectObject(
            object
        );

        STATE.pointer.active =
            true;

        STATE.pointer.pointerId =
            event.pointerId;

        STATE.pointer.startX =
            event.clientX;

        STATE.pointer.startY =
            event.clientY;

        STATE.pointer.lastX =
            event.clientX;

        STATE.pointer.lastY =
            event.clientY;

        STATE.pointer.moved =
            false;

        STATE.pointer.objectId =
            object.id;

        try {

            event.currentTarget.setPointerCapture(
                event.pointerId
            );

        } catch (error) {
            /* Certains navigateurs Android peuvent refuser capture. */
        }

        saveHistory();
    }


    function handleWorkspacePointerMove(
        event
    ) {

        if (
            !STATE.pointer.active
        ) {
            return;
        }

        if (
            STATE.gesture.active
        ) {
            return;
        }

        if (
            event.pointerId !==
            STATE.pointer.pointerId
        ) {
            return;
        }

        const object =
            STATE.objects.find(
                function (item) {

                    return (
                        item.id ===
                        STATE.pointer.objectId
                    );

                }
            );

        if (!object) {
            return;
        }

        const dx =
            event.clientX -
            STATE.pointer.lastX;

        const dy =
            event.clientY -
            STATE.pointer.lastY;

        if (
            Math.abs(
                event.clientX -
                STATE.pointer.startX
            ) >
            CONFIG.touchMoveThreshold ||
            Math.abs(
                event.clientY -
                STATE.pointer.startY
            ) >
            CONFIG.touchMoveThreshold
        ) {

            STATE.pointer.moved =
                true;
        }

        object.position.x +=
            dx /
            STATE.workspaceZoom;

        object.position.y +=
            dy /
            STATE.workspaceZoom;

        if (STATE.settings.snap) {

            object.position.x =
                snapValue(
                    object.position.x
                );

            object.position.y =
                snapValue(
                    object.position.y
                );
        }

        STATE.pointer.lastX =
            event.clientX;

        STATE.pointer.lastY =
            event.clientY;

        renderWorkspace();

        selectObject(
            object
        );

        STATE.dirty =
            true;
    }


    function handleWorkspacePointerUp(
        event
    ) {

        if (
            !STATE.pointer.active
        ) {
            return;
        }

        if (
            event.pointerId !==
            STATE.pointer.pointerId
        ) {
            return;
        }

        STATE.pointer.active =
            false;

        STATE.pointer.pointerId =
            null;

        STATE.pointer.objectId =
            null;

        saveProjectSilently();
    }


    function snapValue(value) {

        const grid =
            CONFIG.gridSize;

        return Math.round(
            value /
            grid
        ) *
        grid;
    }


    /* =====================================================================
       12 — PINCH ZOOM + PAN ANDROID
       ===================================================================== */

    function getTouchDistance() {

        const points =
            Array.from(
                STATE.touches.values()
            );

        if (
            points.length <
            2
        ) {
            return 0;
        }

        const a =
            points[0];

        const b =
            points[1];

        return Math.hypot(
            b.x - a.x,
            b.y - a.y
        );
    }


    function getTouchCenter() {

        const points =
            Array.from(
                STATE.touches.values()
            );

        if (
            points.length <
            2
        ) {

            return {
                x: 0,
                y: 0
            };
        }

        return {

            x:
                (
                    points[0].x +
                    points[1].x
                ) / 2,

            y:
                (
                    points[0].y +
                    points[1].y
                ) / 2

        };
    }


    function beginPinchGesture() {

        const distance =
            getTouchDistance();

        if (
            distance <= 0
        ) {
            return;
        }

        STATE.pointer.active =
            false;

        const center =
            getTouchCenter();

        STATE.gesture.active =
            true;

        STATE.gesture.startDistance =
            distance;

        STATE.gesture.startZoom =
            STATE.workspaceZoom;

        STATE.gesture.startCenter =
            center;

        STATE.gesture.startPan =
            {
                x:
                    STATE.workspacePan.x,

                y:
                    STATE.workspacePan.y
            };

        /*
         * Important :
         * Deux doigts doivent contrôler le workspace,
         * pas le navigateur.
         */
    }


    function updatePinchGesture() {

        if (
            !STATE.gesture.active
        ) {
            return;
        }

        const distance =
            getTouchDistance();

        if (
            distance <= 0 ||
            STATE.gesture.startDistance <= 0
        ) {
            return;
        }

        const center =
            getTouchCenter();

        const ratio =
            distance /
            STATE.gesture.startDistance;

        const newZoom =
            clamp(
                STATE.gesture.startZoom *
                ratio,
                CONFIG.zoomMin,
                CONFIG.zoomMax
            );

        /*
         * Zoom autour du centre des deux doigts.
         */

        const oldZoom =
            STATE.workspaceZoom;

        const workspacePointX =
            (
                STATE.gesture.startCenter.x -
                STATE.gesture.startPan.x
            ) /
            oldZoom;

        const workspacePointY =
            (
                STATE.gesture.startCenter.y -
                STATE.gesture.startPan.y
            ) /
            oldZoom;

        STATE.workspaceZoom =
            newZoom;

        STATE.workspacePan.x =
            center.x -
            workspacePointX *
            newZoom;

        STATE.workspacePan.y =
            center.y -
            workspacePointY *
            newZoom;

        /*
         * Petit pan naturel du centre des doigts.
         */

        STATE.workspacePan.x +=
            center.x -
            STATE.gesture.startCenter.x;

        STATE.workspacePan.y +=
            center.y -
            STATE.gesture.startCenter.y;

        applyWorkspaceTransform();

        STATE.dirty =
            true;
    }


    function endPinchGesture() {

        if (
            STATE.touches.size <
            2
        ) {

            STATE.gesture.active =
                false;

            saveProjectSilently();
        }
    }


    function handleTouchStart(event) {

        if (
            !STATE.settings.touch
        ) {
            return;
        }

        Array.from(
            event.changedTouches
        ).forEach(
            function (touch) {

                STATE.touches.set(
                    touch.identifier,
                    {
                        x:
                            touch.clientX,

                        y:
                            touch.clientY
                    }
                );

            }
        );

        if (
            STATE.touches.size >=
            2
        ) {

            beginPinchGesture();

            event.preventDefault();
        }
    }


    function handleTouchMove(event) {

        if (
            !STATE.settings.touch
        ) {
            return;
        }

        Array.from(
            event.changedTouches
        ).forEach(
            function (touch) {

                STATE.touches.set(
                    touch.identifier,
                    {
                        x:
                            touch.clientX,

                        y:
                            touch.clientY
                    }
                );

            }
        );

        if (
            STATE.touches.size >=
            2
        ) {

            updatePinchGesture();

            event.preventDefault();
        }
    }


    function handleTouchEnd(event) {

        Array.from(
            event.changedTouches
        ).forEach(
            function (touch) {

                STATE.touches.delete(
                    touch.identifier
                );

            }
        );

        if (
            STATE.touches.size <
            2
        ) {

            endPinchGesture();
        }
    }


    /* =====================================================================
       13 — TRANSFORMATION WORKSPACE
       ===================================================================== */

    function applyWorkspaceTransform() {

        if (!DOM.workspaceBoard) {
            return;
        }

        DOM.workspaceBoard.style.transform =
            "translate3d(" +
            STATE.workspacePan.x +
            "px," +
            STATE.workspacePan.y +
            "px,0) scale(" +
            STATE.workspaceZoom +
            ")";

        DOM.workspaceBoard.style.transformOrigin =
            "0 0";

        if (DOM.workspaceGrid) {

            DOM.workspaceGrid.style.transform =
                "translate3d(" +
                STATE.workspacePan.x +
                "px," +
                STATE.workspacePan.y +
                "px,0) scale(" +
                STATE.workspaceZoom +
                ")";

            DOM.workspaceGrid.style.transformOrigin =
                "0 0";
        }

        updateZoomIndicator();
    }


    function updateZoomIndicator() {

        const percent =
            Math.round(
                STATE.workspaceZoom *
                100
            );

        if (
            DOM.workspaceModeStatus
        ) {

            DOM.workspaceModeStatus.textContent =
                "MODE " +
                STATE.interactionMode.toUpperCase() +
                " · " +
                percent +
                "%";
        }
    }


    function resetWorkspaceView() {

        STATE.workspaceZoom =
            CONFIG.zoomDefault;

        STATE.workspacePan =
            {
                x: 0,
                y: 0
            };

        applyWorkspaceTransform();

        notify(
            "Vue du laboratoire réinitialisée.",
            "success"
        );
    }


    /* =====================================================================
       14 — CONNEXIONS
       ===================================================================== */

    function handleConnectObject(object) {

        if (
            STATE.interactionMode !==
            "connect"
        ) {
            return;
        }

        if (
            !STATE.connectStart
        ) {

            STATE.connectStart =
                object;

            selectObject(
                object
            );

            notify(
                "Sélectionnez maintenant le deuxième composant.",
                "info"
            );

            return;
        }

        if (
            STATE.connectStart.id ===
            object.id
        ) {

            notify(
                "Un composant ne peut pas être connecté à lui-même.",
                "warning"
            );

            return;
        }

        createConnection(
            STATE.connectStart,
            object
        );

        STATE.connectStart =
            null;
    }


    function createConnection(a, b) {

        if (!a || !b) {
            return;
        }

        const exists =
            STATE.connections.some(
                function (connection) {

                    return (
                        (
                            connection.a === a.id &&
                            connection.b === b.id
                        ) ||
                        (
                            connection.a === b.id &&
                            connection.b === a.id
                        )
                    );

                }
            );

        if (exists) {

            notify(
                "Ces composants sont déjà connectés.",
                "warning"
            );

            return;
        }

        STATE.connections.push({

            id:
                uid("connection"),

            a:
                a.id,

            b:
                b.id,

            type:
                "wire",

            createdAt:
                Date.now()

        });

        STATE.counters.connection++;

        saveHistory();

        renderConnections();

        updateStatus();

        STATE.dirty =
            true;

        saveProjectSilently();

        notify(
            a.name +
            " connecté à " +
            b.name +
            ".",
            "success"
        );
    }


    function removeConnectionBetween(a, b) {

        STATE.connections =
            STATE.connections.filter(
                function (connection) {

                    return !(
                        (
                            connection.a === a.id &&
                            connection.b === b.id
                        ) ||
                        (
                            connection.a === b.id &&
                            connection.b === a.id
                        )
                    );

                }
            );
    }


    function disconnectSelected() {

        if (
            !STATE.selectedObject
        ) {

            notify(
                "Sélectionnez un composant.",
                "warning"
            );

            return;
        }

        const id =
            STATE.selectedObject.id;

        const before =
            STATE.connections.length;

        STATE.connections =
            STATE.connections.filter(
                function (connection) {

                    return (
                        connection.a !== id &&
                        connection.b !== id
                    );

                }
            );

        if (
            STATE.connections.length ===
            before
        ) {

            notify(
                "Aucune connexion à supprimer.",
                "info"
            );

            return;
        }

        saveHistory();

        renderConnections();

        updateStatus();

        saveProjectSilently();

        notify(
            "Connexions supprimées.",
            "success"
        );
    }


    function renderConnections() {

        if (!DOM.connectionLayer) {
            return;
        }

        DOM.connectionLayer.innerHTML =
            "";

        STATE.connections.forEach(
            function (connection) {

                const a =
                    STATE.objects.find(
                        function (object) {

                            return (
                                object.id ===
                                connection.a
                            );

                        }
                    );

                const b =
                    STATE.objects.find(
                        function (object) {

                            return (
                                object.id ===
                                connection.b
                            );

                        }
                    );

                if (!a || !b) {
                    return;
                }

                const line =
                    document.createElement(
                        "div"
                    );

                line.className =
                    "fobas-robotics-connection";

                const x1 =
                    a.position.x +
                    a.width / 2;

                const y1 =
                    a.position.y +
                    a.height / 2;

                const x2 =
                    b.position.x +
                    b.width / 2;

                const y2 =
                    b.position.y +
                    b.height / 2;

                const dx =
                    x2 - x1;

                const dy =
                    y2 - y1;

                const length =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );

                const angle =
                    Math.atan2(
                        dy,
                        dx
                    ) *
                    180 /
                    Math.PI;

                line.style.position =
                    "absolute";

                line.style.left =
                    x1 + "px";

                line.style.top =
                    y1 + "px";

                line.style.width =
                    length + "px";

                line.style.height =
                    "3px";

                line.style.transformOrigin =
                    "0 50%";

                line.style.transform =
                    "rotate(" +
                    angle +
                    "deg)";

                line.dataset.connectionId =
                    connection.id;

                DOM.connectionLayer.appendChild(
                    line
                );
            }
        );

        applyConnectionTransform();
    }


    function applyConnectionTransform() {

        if (!DOM.connectionLayer) {
            return;
        }

        DOM.connectionLayer.style.transform =
            "translate3d(" +
            STATE.workspacePan.x +
            "px," +
            STATE.workspacePan.y +
            "px,0) scale(" +
            STATE.workspaceZoom +
            ")";

        DOM.connectionLayer.style.transformOrigin =
            "0 0";
    }


    /* =====================================================================
       15 — SUPPRESSION
       ===================================================================== */

    function deleteSelectedObject() {

        if (
            !STATE.selectedObject
        ) {

            notify(
                "Aucun élément sélectionné.",
                "warning"
            );

            return;
        }

        const object =
            STATE.selectedObject;

        const objectName =
            object.name;

        saveHistory();

        STATE.objects =
            STATE.objects.filter(
                function (item) {

                    return (
                        item.id !==
                        object.id
                    );

                }
            );

        STATE.connections =
            STATE.connections.filter(
                function (connection) {

                    return (
                        connection.a !==
                            object.id &&
                        connection.b !==
                            object.id
                    );

                }
            );

        STATE.selectedObject =
            null;

        renderWorkspace();

        updateInspector();

        updateStatus();

        STATE.dirty =
            true;

        saveProjectSilently();

        notify(
            objectName +
            " supprimé.",
            "success"
        );
    }


    /* =====================================================================
       16 — MODES D'INTERACTION
       ===================================================================== */

    function setInteractionMode(mode) {

        const validModes = [

            "select",
            "move",
            "rotate",
            "measure",
            "connect"

        ];

        if (
            !validModes.includes(
                mode
            )
        ) {
            return;
        }

        STATE.interactionMode =
            mode;

        STATE.connectStart =
            null;

        document
            .querySelectorAll(
                "[data-action]"
            )
            .forEach(
                function (button) {

                    if (
                        button.dataset.action ===
                        mode
                    ) {

                        button.classList.add(
                            "active"
                        );

                    } else if (
                        [
                            "select",
                            "move",
                            "rotate",
                            "measure",
                            "connect"
                        ].includes(
                            button.dataset.action
                        )
                    ) {

                        button.classList.remove(
                            "active"
                        );
                    }

                }
            );

        updateZoomIndicator();

        notify(
            "Mode : " +
            mode.toUpperCase(),
            "info"
        );
    }


    /* =====================================================================
       17 — BIBLIOTHÈQUE COMPOSANTS
       ===================================================================== */

    function renderComponentLibrary() {

        if (!DOM.componentsLibrary) {
            return;
        }

        const searchInput =
            document.querySelector(
                "#componentSearchInput, " +
                "#componentSearch, " +
                ".component-search"
            );

        const search =
            searchInput &&
            searchInput.value
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";

        const activeCategory =
            getActiveComponentCategory();

        const list =
            COMPONENTS.filter(
                function (item) {

                    const categoryMatch =
                        !activeCategory ||
                        activeCategory ===
                            "all" ||
                        item.category ===
                            activeCategory;

                    const searchMatch =
                        !search ||
                        (
                            item.name +
                            " " +
                            item.description
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

        DOM.componentsLibrary.innerHTML =
            "";

        if (!list.length) {

            const empty =
                document.createElement(
                    "div"
                );

            empty.className =
                "library-empty";

            empty.innerHTML =
                "<div class=\"library-empty-icon\">🔧</div>" +
                "<div class=\"library-empty-title\">Aucun composant</div>" +
                "<div class=\"library-empty-text\">Aucun composant ne correspond à votre recherche.</div>";

            DOM.componentsLibrary.appendChild(
                empty
            );

            return;
        }

        list.forEach(
            function (item) {

                const card =
                    document.createElement(
                        "button"
                    );

                card.type =
                    "button";

                card.className =
                    "component-card";

                card.dataset.type =
                    item.type;

                card.innerHTML =
                    "<span class=\"component-icon\">" +
                    escapeHTML(
                        item.icon
                    ) +
                    "</span>" +

                    "<span class=\"component-name\">" +
                    escapeHTML(
                        item.name
                    ) +
                    "</span>" +

                    "<span class=\"component-description\">" +
                    escapeHTML(
                        item.description
                    ) +
                    "</span>";

                card.addEventListener(
                    "click",
                    function () {

                        STATE.selectedLibraryType =
                            item.type;

                        DOM.componentsLibrary
                            .querySelectorAll(
                                ".component-card"
                            )
                            .forEach(
                                function (element) {

                                    element.classList.remove(
                                        "selected"
                                    );

                                }
                            );

                        card.classList.add(
                            "selected"
                        );

                    }
                );

                card.addEventListener(
                    "dblclick",
                    function () {

                        STATE.selectedLibraryType =
                            item.type;

                        addSelectedComponent();

                    }
                );

                DOM.componentsLibrary.appendChild(
                    card
                );

            }
        );
    }


    function getActiveComponentCategory() {

        if (!DOM.componentCategories) {
            return "all";
        }

        const active =
            DOM.componentCategories.querySelector(
                ".active, " +
                "[aria-selected=\"true\"], " +
                "[data-category].selected"
            );

        if (!active) {
            return "all";
        }

        return (
            active.dataset.category ||
            "all"
        );
    }


    /* =====================================================================
       18 — BIBLIOTHÈQUE OUTILS
       ===================================================================== */

    function renderToolsLibrary() {

        if (!DOM.toolsLibrary) {
            return;
        }

        DOM.toolsLibrary.innerHTML =
            "";

        TOOLS.forEach(
            function (tool) {

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "tool-card";

                card.dataset.toolType =
                    tool.type;

                card.innerHTML =
                    "<div class=\"tool-card-icon\" data-tool-icon>" +
                    escapeHTML(
                        tool.icon
                    ) +
                    "</div>" +

                    "<div class=\"tool-card-content\">" +
                    "<div data-tool-name>" +
                    escapeHTML(
                        tool.name
                    ) +
                    "</div>" +

                    "<div data-tool-description>" +
                    escapeHTML(
                        tool.description
                    ) +
                    "</div>" +
                    "</div>" +

                    "<button type=\"button\" class=\"tool-add-btn\" data-tool-add>" +
                    "Ajouter" +
                    "</button>";

                const addButton =
                    card.querySelector(
                        "[data-tool-add]"
                    );

                if (addButton) {

                    addButton.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();

                            event.stopPropagation();

                            addTool(
                                tool.type
                            );

                        }
                    );
                }

                DOM.toolsLibrary.appendChild(
                    card
                );

            }
        );
    }


    /* =====================================================================
       19 — NAVIGATION MODULES
       ===================================================================== */

    function showView(name) {

        const validViews = [

            "laboratoire",
            "outils",
            "composants",
            "codes",
            "programmation",
            "missions",
            "mesures",
            "diagnostic",
            "parametres",
            "projet"

        ];

        if (
            !validViews.includes(
                name
            )
        ) {
            return;
        }

        STATE.activeView =
            name;

        DOM.views.forEach(
            function (view) {

                const active =
                    view.dataset.view ===
                    name;

                view.classList.toggle(
                    "active-view",
                    active
                );

                view.hidden =
                    !active;

            }
        );

        DOM.mainButtons.forEach(
            function (button) {

                button.classList.toggle(
                    "active",
                    button.dataset.module ===
                        name
                );

            }
        );

        if (
            name ===
            "outils"
        ) {
            renderToolsLibrary();
        }

        if (
            name ===
            "composants"
        ) {
            renderComponentLibrary();
        }

        if (
            name ===
            "codes"
        ) {
            renderCodesLibrary();
        }

        if (
            name ===
            "missions"
        ) {
            renderMissions();
        }

        if (
            name ===
            "mesures"
        ) {
            updateMeasurements();
        }

        if (
            name ===
            "diagnostic"
        ) {
            runDiagnostic();
        }

        if (
            name ===
            "parametres"
        ) {
            synchronizeSettings();
        }

        if (
            name ===
            "projet"
        ) {
            updateProjectPanel();
        }
    }


    /* =====================================================================
       20 — CODES
       ===================================================================== */

    function renderCodesLibrary() {

        if (!DOM.codeLibrary) {
            return;
        }

        DOM.codeLibrary.innerHTML =
            "";

        if (!CODES.length) {

            const empty =
                document.createElement(
                    "div"
                );

            empty.className =
                "library-empty";

            empty.innerHTML =
                "<div class=\"library-empty-icon\">💻</div>" +
                "<div class=\"library-empty-title\">Bibliothèque de codes</div>" +
                "<div class=\"library-empty-text\">Les exemples de programmation seront disponibles ici.</div>";

            DOM.codeLibrary.appendChild(
                empty
            );

            return;
        }

        CODES.forEach(
            function (item) {

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "code-card";

                card.innerHTML =
                    "<h3>" +
                    escapeHTML(
                        item.name ||
                        item.title ||
                        "Exemple"
                    ) +
                    "</h3>" +

                    "<p>" +
                    escapeHTML(
                        item.description ||
                        ""
                    ) +
                    "</p>" +

                    "<button type=\"button\" class=\"code-load-button\">" +
                    "Charger" +
                    "</button>";

                const button =
                    card.querySelector(
                        ".code-load-button"
                    );

                if (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            if (
                                DOM.codeEditor
                            ) {

                                DOM.codeEditor.value =
                                    item.code ||
                                    item.content ||
                                    "";

                                updateLineNumbers();

                                showView(
                                    "programmation"
                                );

                                notify(
                                    "Code chargé dans l'éditeur.",
                                    "success"
                                );
                            }

                        }
                    );
                }

                DOM.codeLibrary.appendChild(
                    card
                );
            }
        );
    }


    /* =====================================================================
       21 — MISSIONS
       ===================================================================== */

    function renderMissions() {

        if (!DOM.missionsLibrary) {
            return;
        }

        DOM.missionsLibrary.innerHTML =
            "";

        if (!MISSIONS.length) {

            const empty =
                document.createElement(
                    "div"
                );

            empty.className =
                "library-empty";

            empty.innerHTML =
                "<div class=\"library-empty-icon\">🎯</div>" +
                "<div class=\"library-empty-title\">Missions FOBAS</div>" +
                "<div class=\"library-empty-text\">Les missions apparaîtront ici.</div>";

            DOM.missionsLibrary.appendChild(
                empty
            );

            return;
        }

        MISSIONS.forEach(
            function (mission, index) {

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "mission-card";

                card.innerHTML =
                    "<div class=\"mission-number\">" +
                    String(
                        index + 1
                    ) +
                    "</div>" +

                    "<div class=\"mission-content\">" +
                    "<h3>" +
                    escapeHTML(
                        mission.name ||
                        mission.title ||
                        "Mission"
                    ) +
                    "</h3>" +

                    "<p>" +
                    escapeHTML(
                        mission.description ||
                        ""
                    ) +
                    "</p>" +

                    "<button type=\"button\" class=\"mission-start-button\">" +
                    "Démarrer" +
                    "</button>" +

                    "</div>";

                const button =
                    card.querySelector(
                        ".mission-start-button"
                    );

                if (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            startMission(
                                mission
                            );

                        }
                    );
                }

                DOM.missionsLibrary.appendChild(
                    card
                );
            }
        );
    }


    function startMission(mission) {

        STATE.currentMission =
            deepClone(
                mission
            );

        showView(
            "laboratoire"
        );

        notify(
            "Mission démarrée : " +
            (
                mission.name ||
                mission.title ||
                "Mission"
            ),
            "success"
        );
    }


    /* =====================================================================
       22 — INSPECTOR
       ===================================================================== */

    function updateInspector() {

        if (!DOM.inspectorContent) {
            return;
        }

        const object =
            STATE.selectedObject;

        if (!object) {

            DOM.inspectorContent.innerHTML =
                "<div class=\"inspector-empty\">" +
                "<div>🔬</div>" +
                "<p>Sélectionnez un élément dans le laboratoire.</p>" +
                "</div>";

            return;
        }

        DOM.inspectorContent.innerHTML =
            "<div class=\"fobas-inspector-card\">" +

            "<div class=\"fobas-inspector-icon\">" +
            escapeHTML(
                object.icon
            ) +
            "</div>" +

            "<h3>" +
            escapeHTML(
                object.name
            ) +
            "</h3>" +

            "<p>" +
            escapeHTML(
                object.description
            ) +
            "</p>" +

            "<label>" +
            "X" +
            "<input id=\"fobasInspectorX\" type=\"number\" step=\"1\" value=\"" +
            object.position.x +
            "\">" +
            "</label>" +

            "<label>" +
            "Y" +
            "<input id=\"fobasInspectorY\" type=\"number\" step=\"1\" value=\"" +
            object.position.y +
            "\">" +
            "</label>" +

            "<label>" +
            "Rotation" +
            "<input id=\"fobasInspectorRotation\" type=\"number\" step=\"1\" value=\"" +
            object.rotation +
            "\">" +
            "</label>" +

            "<button type=\"button\" id=\"fobasInspectorApply\">" +
            "Appliquer" +
            "</button>" +

            "<button type=\"button\" id=\"fobasInspectorDelete\">" +
            "Supprimer" +
            "</button>" +

            "</div>";

        const apply =
            document.getElementById(
                "fobasInspectorApply"
            );

        const remove =
            document.getElementById(
                "fobasInspectorDelete"
            );

        if (apply) {

            apply.addEventListener(
                "click",
                function () {

                    object.position.x =
                        safeNumber(
                            document.getElementById(
                                "fobasInspectorX"
                            ).value,
                            object.position.x
                        );

                    object.position.y =
                        safeNumber(
                            document.getElementById(
                                "fobasInspectorY"
                            ).value,
                            object.position.y
                        );

                    object.rotation =
                        safeNumber(
                            document.getElementById(
                                "fobasInspectorRotation"
                            ).value,
                            object.rotation
                        );

                    renderWorkspace();

                    selectObject(
                        object
                    );

                    STATE.dirty =
                        true;

                    saveProjectSilently();

                    notify(
                        "Propriétés appliquées.",
                        "success"
                    );

                }
            );
        }

        if (remove) {

            remove.addEventListener(
                "click",
                deleteSelectedObject
            );
        }
    }


    function openInspector(object) {

        selectObject(
            object
        );

        if (
            window.innerWidth <=
            900
        ) {

            openMobilePanel(
                "Inspecteur",
                DOM.inspectorContent
                    ? DOM.inspectorContent.innerHTML
                    : ""
            );

        }
    }


    /* =====================================================================
       23 — MESURES
       ===================================================================== */

    function updateMeasurements() {

        const count =
            STATE.objects.length;

        let voltage =
            0;

        let current =
            0;

        let resistance =
            0;

        let frequency =
            0;

        let pwm =
            0;

        let temperature =
            25;

        const battery =
            STATE.objects.find(
                function (object) {

                    return object.type ===
                        "battery";

                }
            );

        const resistor =
            STATE.objects.find(
                function (object) {

                    return object.type ===
                        "resistor";

                }
            );

        const motor =
            STATE.objects.find(
                function (object) {

                    return object.type ===
                        "motor";

                }
            );

        const tempSensor =
            STATE.objects.find(
                function (object) {

                    return object.type ===
                        "temperature-sensor";

                }
            );

        if (battery) {

            voltage =
                safeNumber(
                    battery.values &&
                    battery.values.voltage,
                    5
                );
        }

        if (resistor) {

            resistance =
                safeNumber(
                    resistor.values &&
                    resistor.values.resistance,
                    220
                );
        }

        if (
            voltage &&
            resistance
        ) {

            current =
                voltage /
                resistance;
        }

        if (motor) {

            frequency =
                50;

            pwm =
                75;
        }

        if (tempSensor) {

            temperature =
                safeNumber(
                    tempSensor.values &&
                    tempSensor.values.temperature,
                    25
                );
        }

        if (DOM.voltageValue) {

            DOM.voltageValue.textContent =
                voltage.toFixed(2) +
                " V";
        }

        if (DOM.currentValue) {

            DOM.currentValue.textContent =
                current.toFixed(4) +
                " A";
        }

        if (DOM.resistanceValue) {

            DOM.resistanceValue.textContent =
                resistance.toFixed(2) +
                " Ω";
        }

        if (DOM.frequencyValue) {

            DOM.frequencyValue.textContent =
                frequency.toFixed(1) +
                " Hz";
        }

        if (DOM.pwmValue) {

            DOM.pwmValue.textContent =
                pwm.toFixed(0) +
                " %";
        }

        if (DOM.temperatureValue) {

            DOM.temperatureValue.textContent =
                temperature.toFixed(1) +
                " °C";
        }

        STATE.measurements = {

            objects:
                count,

            voltage:
                voltage,

            current:
                current,

            resistance:
                resistance,

            frequency:
                frequency,

            pwm:
                pwm,

            temperature:
                temperature

        };
    }


    /* =====================================================================
       24 — DIAGNOSTIC
       ===================================================================== */

    function runDiagnostic() {

        const problems = [];

        if (
            !STATE.objects.length
        ) {

            problems.push(
                "Aucun composant n'est présent dans le laboratoire."
            );
        }

        STATE.connections.forEach(
            function (connection) {

                const a =
                    STATE.objects.some(
                        function (object) {

                            return (
                                object.id ===
                                connection.a
                            );

                        }
                    );

                const b =
                    STATE.objects.some(
                        function (object) {

                            return (
                                object.id ===
                                connection.b
                            );

                        }
                    );

                if (!a || !b) {

                    problems.push(
                        "Une connexion référence un composant inexistant."
                    );
                }

            }
        );

        if (DOM.diagnosticSummary) {

            DOM.diagnosticSummary.textContent =
                problems.length
                    ? problems.length +
                      " problème(s) détecté(s)."
                    : "Aucun problème détecté.";
        }

        if (DOM.diagnosticResults) {

            DOM.diagnosticResults.innerHTML =
                "";

            if (!problems.length) {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "diagnostic-success";

                item.textContent =
                    "✓ Le laboratoire est cohérent.";

                DOM.diagnosticResults.appendChild(
                    item
                );

            } else {

                problems.forEach(
                    function (problem) {

                        const item =
                            document.createElement(
                                "div"
                            );

                        item.className =
                            "diagnostic-error";

                        item.textContent =
                            "⚠ " +
                            problem;

                        DOM.diagnosticResults.appendChild(
                            item
                        );

                    }
                );
            }
        }

        return problems;
    }


    /* =====================================================================
       25 — TEST DU CIRCUIT
       ===================================================================== */

    function testLaboratory() {

        const problems =
            runDiagnostic();

        if (
            problems.length
        ) {

            STATE.testStatus =
                "ÉCHEC";

            notify(
                "Test terminé : des problèmes ont été détectés.",
                "warning"
            );

            return false;
        }

        if (
            !STATE.objects.length
        ) {

            STATE.testStatus =
                "VIDE";

            return false;
        }

        STATE.testStatus =
            "RÉUSSI";

        notify(
            "Test du laboratoire réussi.",
            "success"
        );

        return true;
    }


    /* =====================================================================
       26 — EXÉCUTION
       ===================================================================== */

    function runLaboratory() {

        if (
            !testLaboratory()
        ) {
            return;
        }

        STATE.running =
            true;

        notify(
            "Simulation exécutée.",
            "success"
        );

        updateMeasurements();

        setTimeout(
            function () {

                STATE.running =
                    false;

            },
            1500
        );
    }


    /* =====================================================================
       27 — CODE EDITOR
       ===================================================================== */

    function updateLineNumbers() {

        if (
            !DOM.codeEditor ||
            !DOM.codeLineNumbers
        ) {
            return;
        }

        const lines =
            DOM.codeEditor.value.split(
                "\n"
            ).length;

        let html =
            "";

        for (
            let i = 1;
            i <= lines;
            i++
        ) {

            html +=
                "<div>" +
                i +
                "</div>";
        }

        DOM.codeLineNumbers.innerHTML =
            html;
    }


    function verifyCode() {

        if (!DOM.codeEditor) {
            return false;
        }

        const code =
            DOM.codeEditor.value ||
            "";

        const errors = [];

        let braces = 0;
        let parentheses = 0;

        for (
            let i = 0;
            i < code.length;
            i++
        ) {

            if (
                code[i] === "{"
            ) {
                braces++;
            }

            if (
                code[i] === "}"
            ) {
                braces--;
            }

            if (
                code[i] === "("
            ) {
                parentheses++;
            }

            if (
                code[i] === ")"
            ) {
                parentheses--;
            }

            if (
                braces < 0 ||
                parentheses < 0
            ) {

                errors.push(
                    "Structure de code déséquilibrée."
                );

                break;
            }
        }

        if (
            braces !== 0
        ) {

            errors.push(
                "Accolades déséquilibrées."
            );
        }

        if (
            parentheses !== 0
        ) {

            errors.push(
                "Parenthèses déséquilibrées."
            );
        }

        if (DOM.codeValidationStatus) {

            DOM.codeValidationStatus.textContent =
                errors.length
                    ? errors.join(" ")
                    : "Code structurellement valide.";

        }

        if (DOM.codeValidationPanel) {

            DOM.codeValidationPanel.classList.toggle(
                "error",
                errors.length > 0
            );

            DOM.codeValidationPanel.classList.toggle(
                "success",
                errors.length === 0
            );
        }

        notify(
            errors.length
                ? "Le code contient des erreurs structurelles."
                : "Code vérifié avec succès.",
            errors.length
                ? "warning"
                : "success"
        );

        return !errors.length;
    }


    function runCode() {

        if (
            !verifyCode()
        ) {
            return;
        }

        const code =
            DOM.codeEditor
                ? DOM.codeEditor.value
                : "";

        if (DOM.codeConsole) {

            DOM.codeConsole.textContent =
                "FOBAS ROBOTICS\n" +
                "────────────────\n" +
                "Exécution du programme...\n" +
                "Taille : " +
                code.length +
                " caractères\n" +
                "État : EXECUTION";
        }

        notify(
            "Programme exécuté dans le simulateur.",
            "success"
        );
    }


    function stopCode() {

        if (DOM.codeConsole) {

            DOM.codeConsole.textContent =
                "Exécution arrêtée.";
        }

        notify(
            "Programme arrêté.",
            "info"
        );
    }


    /* =====================================================================
       28 — PARAMÈTRES
       ===================================================================== */

    function synchronizeSettings() {

        if (DOM.settingSnap) {

            DOM.settingSnap.checked =
                STATE.settings.snap;
        }

        if (DOM.settingSound) {

            DOM.settingSound.checked =
                STATE.settings.sound;
        }

        if (DOM.settingTouch) {

            DOM.settingTouch.checked =
                STATE.settings.touch;
        }
    }


    /* =====================================================================
       29 — PROJET
       ===================================================================== */

    function serializeProject() {

        return {

            application:
                CONFIG.appName,

            version:
                CONFIG.version,

            projectName:
                STATE.projectName,

            objects:
                deepClone(
                    STATE.objects
                ),

            connections:
                deepClone(
                    STATE.connections
                ),

            measurements:
                deepClone(
                    STATE.measurements
                ),

            settings:
                deepClone(
                    STATE.settings
                ),

            workspace:
                {
                    zoom:
                        STATE.workspaceZoom,

                    pan:
                        deepClone(
                            STATE.workspacePan
                        )
                },

            exportedAt:
                new Date().toISOString()

        };
    }


    function saveProjectSilently() {

        try {

            localStorage.setItem(
                CONFIG.storageKey,
                JSON.stringify(
                    serializeProject()
                )
            );

        } catch (error) {

            console.warn(
                "FOBAS Robotics : sauvegarde impossible.",
                error
            );
        }
    }


    function saveProject() {

        saveProjectSilently();

        notify(
            "Projet sauvegardé.",
            "success"
        );
    }


    function restoreProject(data) {

        if (!data) {
            return;
        }

        if (
            Array.isArray(
                data.objects
            )
        ) {

            STATE.objects =
                data.objects.map(
                    function (object) {

                        return normalizeObject(
                            object
                        );

                    }
                );
        }

        if (
            Array.isArray(
                data.connections
            )
        ) {

            STATE.connections =
                data.connections;
        }

        if (
            data.measurements
        ) {

            STATE.measurements =
                data.measurements;
        }

        if (
            data.settings
        ) {

            Object.assign(
                STATE.settings,
                data.settings
            );
        }

        if (
            data.workspace
        ) {

            STATE.workspaceZoom =
                clamp(
                    safeNumber(
                        data.workspace.zoom,
                        1
                    ),
                    CONFIG.zoomMin,
                    CONFIG.zoomMax
                );

            if (
                data.workspace.pan
            ) {

                STATE.workspacePan = {

                    x:
                        safeNumber(
                            data.workspace.pan.x,
                            0
                        ),

                    y:
                        safeNumber(
                            data.workspace.pan.y,
                            0
                        )

                };
            }
        }

        STATE.projectName =
            data.projectName ||
            "Projet FOBAS";

        STATE.selectedObject =
            null;

        renderWorkspace();

        updateInspector();

        updateMeasurements();

        updateStatus();

        applyWorkspaceTransform();
    }


    function normalizeObject(object) {

        return {

            id:
                object.id ||
                uid("robot"),

            numericId:
                safeNumber(
                    object.numericId,
                    ++STATE.counters.object
                ),

            type:
                object.type ||
                "unknown",

            name:
                object.name ||
                "Objet",

            description:
                object.description ||
                "",

            category:
                object.category ||
                "general",

            icon:
                object.icon ||
                "◉",

            width:
                safeNumber(
                    object.width,
                    100
                ),

            height:
                safeNumber(
                    object.height,
                    72
                ),

            position:
                {
                    x:
                        safeNumber(
                            object.position &&
                            object.position.x,
                            0
                        ),

                    y:
                        safeNumber(
                            object.position &&
                            object.position.y,
                            0
                        )
                },

            rotation:
                safeNumber(
                    object.rotation,
                    0
                ),

            scale:
                safeNumber(
                    object.scale,
                    1
                ),

            visible:
                object.visible !==
                false,

            locked:
                object.locked ===
                true,

            pins:
                Array.isArray(
                    object.pins
                )
                    ? object.pins
                    : [],

            values:
                object.values ||
                {},

            createdAt:
                object.createdAt ||
                Date.now(),

            isTool:
                object.isTool ===
                true

        };
    }


    function loadProject() {

        try {

            const raw =
                localStorage.getItem(
                    CONFIG.storageKey
                );

            if (!raw) {

                notify(
                    "Aucun projet sauvegardé.",
                    "info"
                );

                return false;
            }

            const data =
                JSON.parse(
                    raw
                );

            restoreProject(
                data
            );

            notify(
                "Projet chargé.",
                "success"
            );

            return true;

        } catch (error) {

            console.error(
                error
            );

            notify(
                "Impossible de charger le projet.",
                "error"
            );

            return false;
        }
    }


    function exportProject() {

        const data =
            serializeProject();

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

        link.href =
            url;

        link.download =
            "fobas-robotique-projet.json";

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        setTimeout(
            function () {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );

        notify(
            "Projet exporté.",
            "success"
        );
    }


    function importProjectFile(file) {

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

                    restoreProject(
                        data
                    );

                    saveProjectSilently();

                    notify(
                        "Projet importé avec succès.",
                        "success"
                    );

                } catch (error) {

                    console.error(
                        error
                    );

                    notify(
                        "Fichier projet invalide.",
                        "error"
                    );
                }
            };

        reader.onerror =
            function () {

                notify(
                    "Impossible de lire le fichier.",
                    "error"
                );

            };

        reader.readAsText(
            file
        );
    }


    function newProject() {

        STATE.objects =
            [];

        STATE.connections =
            [];

        STATE.measurements =
            [];

        STATE.selectedObject =
            null;

        STATE.selectedLibraryType =
            null;

        STATE.workspaceZoom =
            1;

        STATE.workspacePan =
            {
                x: 0,
                y: 0
            };

        STATE.projectName =
            "Nouveau projet FOBAS";

        STATE.dirty =
            true;

        localStorage.removeItem(
            CONFIG.storageKey
        );

        renderWorkspace();

        updateInspector();

        updateStatus();

        updateMeasurements();

        applyWorkspaceTransform();

        notify(
            "Nouveau projet créé.",
            "success"
        );
    }


    function updateProjectPanel() {

        if (
            DOM.projectPanel
        ) {

            DOM.projectPanel.dataset.projectName =
                STATE.projectName;
        }
    }


    /* =====================================================================
       30 — UNDO / REDO
       ===================================================================== */

    function makeHistorySnapshot() {

        return {

            objects:
                deepClone(
                    STATE.objects
                ),

            connections:
                deepClone(
                    STATE.connections
                )

        };
    }


    function saveHistory() {

        const snapshot =
            makeHistorySnapshot();

        /*
         * Le snapshot courant n'est pas ajouté deux fois.
         */

        if (
            STATE.historyIndex >=
            0
        ) {

            const current =
                STATE.history[
                    STATE.historyIndex
                ];

            if (
                JSON.stringify(
                    current
                ) ===
                JSON.stringify(
                    snapshot
                )
            ) {
                return;
            }
        }

        STATE.history =
            STATE.history.slice(
                0,
                STATE.historyIndex + 1
            );

        STATE.history.push(
            snapshot
        );

        if (
            STATE.history.length >
            50
        ) {

            STATE.history.shift();

        } else {

            STATE.historyIndex++;
        }
    }


    function restoreHistorySnapshot(
        snapshot
    ) {

        if (!snapshot) {
            return;
        }

        STATE.objects =
            deepClone(
                snapshot.objects
            );

        STATE.connections =
            deepClone(
                snapshot.connections
            );

        STATE.selectedObject =
            null;

        renderWorkspace();

        updateInspector();

        updateStatus();

        saveProjectSilently();
    }


    function undo() {

        if (
            STATE.historyIndex <=
            0
        ) {

            notify(
                "Aucune action à annuler.",
                "info"
            );

            return;
        }

        STATE.historyIndex--;

        restoreHistorySnapshot(
            STATE.history[
                STATE.historyIndex
            ]
        );

        notify(
            "Action annulée.",
            "success"
        );
    }


    function redo() {

        if (
            STATE.historyIndex + 1 >=
            STATE.history.length
        ) {

            notify(
                "Aucune action à rétablir.",
                "info"
            );

            return;
        }

        STATE.historyIndex++;

        restoreHistorySnapshot(
            STATE.history[
                STATE.historyIndex
            ]
        );

        notify(
            "Action rétablie.",
            "success"
        );
    }


    /* =====================================================================
       31 — EMPTY STATE
       ===================================================================== */

    function updateEmptyState() {

        if (
            !DOM.workspaceEmptyState
        ) {
            return;
        }

        DOM.workspaceEmptyState.style.display =
            STATE.objects.length
                ? "none"
                : "";
    }


    /* =====================================================================
       32 — STATUS
       ===================================================================== */

    function updateStatus() {

        if (
            DOM.componentCountStatus
        ) {

            DOM.componentCountStatus.textContent =
                String(
                    STATE.objects.length
                );
        }

        if (
            DOM.connectionCountStatus
        ) {

            DOM.connectionCountStatus.textContent =
                String(
                    STATE.connections.length
                );
        }

        if (
            DOM.wireCountStatus
        ) {

            DOM.wireCountStatus.textContent =
                String(
                    STATE.connections.length
                );
        }

        updateZoomIndicator();
    }


    /* =====================================================================
       33 — MOBILE PANEL
       ===================================================================== */

    function openMobilePanel(
        title,
        html
    ) {

        if (
            !DOM.mobilePanelSystem
        ) {
            return;
        }

        if (
            DOM.mobilePanelTitle
        ) {

            DOM.mobilePanelTitle.textContent =
                title;
        }

        if (
            DOM.mobilePanelContent
        ) {

            DOM.mobilePanelContent.innerHTML =
                html ||
                "";
        }

        DOM.mobilePanelSystem.classList.add(
            "open"
        );

        DOM.mobilePanelSystem.classList.add(
            "active"
        );
    }


    function closeMobilePanel() {

        if (
            !DOM.mobilePanelSystem
        ) {
            return;
        }

        DOM.mobilePanelSystem.classList.remove(
            "open"
        );

        DOM.mobilePanelSystem.classList.remove(
            "active"
        );
    }


    /* =====================================================================
       34 — ÉVÉNEMENTS PRINCIPAUX
       ===================================================================== */

    function bindMainEvents() {

        DOM.mainButtons.forEach(
            function (button) {

                const module =
                    button.dataset.module;

                if (!module) {
                    return;
                }

                button.addEventListener(
                    "click",
                    function () {

                        showView(
                            module
                        );

                    }
                );
            }
        );


        DOM.actionButtons.forEach(
            function (button) {

                const action =
                    button.dataset.action;

                if (!action) {
                    return;
                }

                button.addEventListener(
                    "click",
                    function () {

                        handleAction(
                            action
                        );

                    }
                );
            }
        );


        if (DOM.workspaceAddBtn) {

            DOM.workspaceAddBtn.addEventListener(
                "click",
                function () {

                    showView(
                        "composants"
                    );

                }
            );
        }


        if (
            DOM.workspaceConnectBtn
        ) {

            DOM.workspaceConnectBtn.addEventListener(
                "click",
                function () {

                    setInteractionMode(
                        "connect"
                    );

                }
            );
        }


        if (
            DOM.workspaceMeasureBtn
        ) {

            DOM.workspaceMeasureBtn.addEventListener(
                "click",
                function () {

                    setInteractionMode(
                        "measure"
                    );

                }
            );
        }


        if (
            DOM.workspaceTestBtn
        ) {

            DOM.workspaceTestBtn.addEventListener(
                "click",
                testLaboratory
            );
        }


        if (
            DOM.workspaceRunBtn
        ) {

            DOM.workspaceRunBtn.addEventListener(
                "click",
                runLaboratory
            );
        }


        if (DOM.emptyAddBtn) {

            DOM.emptyAddBtn.addEventListener(
                "click",
                function () {

                    showView(
                        "composants"
                    );

                }
            );
        }


        if (
            DOM.mobilePanelCloseBtn
        ) {

            DOM.mobilePanelCloseBtn.addEventListener(
                "click",
                closeMobilePanel
            );
        }


        if (
            DOM.mobilePanelBackdrop
        ) {

            DOM.mobilePanelBackdrop.addEventListener(
                "click",
                closeMobilePanel
            );
        }


        if (DOM.newProjectBtn) {

            DOM.newProjectBtn.addEventListener(
                "click",
                newProject
            );
        }


        if (DOM.saveProjectBtn) {

            DOM.saveProjectBtn.addEventListener(
                "click",
                saveProject
            );
        }


        if (DOM.loadProjectBtn) {

            DOM.loadProjectBtn.addEventListener(
                "click",
                loadProject
            );
        }


        if (DOM.exportProjectBtn) {

            DOM.exportProjectBtn.addEventListener(
                "click",
                exportProject
            );
        }


        if (DOM.importProjectBtn) {

            DOM.importProjectBtn.addEventListener(
                "click",
                function () {

                    if (
                        DOM.projectFileInput
                    ) {

                        DOM.projectFileInput.click();
                    }

                }
            );
        }


        if (
            DOM.projectFileInput
        ) {

            DOM.projectFileInput.addEventListener(
                "change",
                function () {

                    const file =
                        DOM.projectFileInput.files &&
                        DOM.projectFileInput.files[0];

                    if (file) {

                        importProjectFile(
                            file
                        );
                    }

                    DOM.projectFileInput.value =
                        "";

                }
            );
        }
    }


    function handleAction(action) {

        switch (action) {

            case "add":

                showView(
                    "composants"
                );

                break;

            case "select":

                setInteractionMode(
                    "select"
                );

                break;

            case "move":

                setInteractionMode(
                    "move"
                );

                break;

            case "rotate":

                setInteractionMode(
                    "rotate"
                );

                break;

            case "measure":

                setInteractionMode(
                    "measure"
                );

                break;

            case "connect":

                setInteractionMode(
                    "connect"
                );

                break;

            case "disconnect":

                disconnectSelected();

                break;

            case "test":

                testLaboratory();

                break;

            case "run":

                runLaboratory();

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

            default:

                break;
        }
    }


    /* =====================================================================
       35 — WORKSPACE EVENTS
       ===================================================================== */

    function bindWorkspaceEvents() {

        if (!DOM.workspace) {
            return;
        }

        /*
         * IMPORTANT ANDROID :
         * On empêche le navigateur de remplacer le geste
         * du workspace par son propre scroll/pan.
         */

        DOM.workspace.addEventListener(
            "pointerdown",
            function (event) {

                if (
                    event.pointerType ===
                    "touch"
                ) {
                    return;
                }

                if (
                    STATE.interactionMode ===
                    "move"
                ) {

                    return;
                }

                if (
                    event.target ===
                    DOM.workspace
                ) {

                    selectObject(
                        null
                    );
                }

            }
        );


        DOM.workspace.addEventListener(
            "pointermove",
            handleWorkspacePointerMove
        );


        DOM.workspace.addEventListener(
            "pointerup",
            handleWorkspacePointerUp
        );


        DOM.workspace.addEventListener(
            "pointercancel",
            handleWorkspacePointerUp
        );


        DOM.workspace.addEventListener(
            "touchstart",
            handleTouchStart,
            {
                passive:
                    false
            }
        );


        DOM.workspace.addEventListener(
            "touchmove",
            handleTouchMove,
            {
                passive:
                    false
            }
        );


        DOM.workspace.addEventListener(
            "touchend",
            handleTouchEnd,
            {
                passive:
                    false
            }
        );


        DOM.workspace.addEventListener(
            "touchcancel",
            handleTouchEnd,
            {
                passive:
                    false
            }
        );


        DOM.workspace.addEventListener(
            "wheel",
            function (event) {

                event.preventDefault();

                const factor =
                    event.deltaY > 0
                        ? 1.08
                        : 0.92;

                zoomWorkspace(
                    factor
                );

            },
            {
                passive:
                    false
            }
        );


        DOM.workspace.addEventListener(
            "dblclick",
            function (event) {

                if (
                    event.target ===
                    DOM.workspace ||
                    event.target ===
                    DOM.workspaceGrid
                ) {

                    resetWorkspaceView();
                }

            }
        );
    }


    function zoomWorkspace(factor) {

        const oldZoom =
            STATE.workspaceZoom;

        const newZoom =
            clamp(
                oldZoom *
                factor,
                CONFIG.zoomMin,
                CONFIG.zoomMax
            );

        STATE.workspaceZoom =
            newZoom;

        applyWorkspaceTransform();
    }


    /* =====================================================================
       36 — BIBLIOTHÈQUE EVENTS
       ===================================================================== */

    function bindLibraryEvents() {

        if (
            DOM.componentCategories
        ) {

            DOM.componentCategories
                .querySelectorAll(
                    "[data-category]"
                )
                .forEach(
                    function (button) {

                        button.addEventListener(
                            "click",
                            function () {

                                DOM.componentCategories
                                    .querySelectorAll(
                                        "[data-category]"
                                    )
                                    .forEach(
                                        function (item) {

                                            item.classList.remove(
                                                "active"
                                            );

                                            item.classList.remove(
                                                "selected"
                                            );

                                        }
                                    );

                                button.classList.add(
                                    "active"
                                );

                                renderComponentLibrary();

                            }
                        );
                    }
                );
        }


        const searchInputs =
            document.querySelectorAll(
                "#componentSearchInput, " +
                "#componentSearch, " +
                ".component-search"
            );

        searchInputs.forEach(
            function (input) {

                input.addEventListener(
                    "input",
                    renderComponentLibrary
                );

            }
        );
    }


    /* =====================================================================
       37 — CODE EVENTS
       ===================================================================== */

    function bindCodeEvents() {

        if (
            DOM.codeEditor
        ) {

            DOM.codeEditor.addEventListener(
                "input",
                updateLineNumbers
            );

            DOM.codeEditor.addEventListener(
                "scroll",
                function () {

                    if (
                        DOM.codeLineNumbers
                    ) {

                        DOM.codeLineNumbers.scrollTop =
                            DOM.codeEditor.scrollTop;
                    }

                }
            );
        }


        if (
            DOM.editorClearBtn
        ) {

            DOM.editorClearBtn.addEventListener(
                "click",
                function () {

                    if (
                        DOM.codeEditor
                    ) {

                        DOM.codeEditor.value =
                            "";

                        updateLineNumbers();
                    }

                }
            );
        }


        if (
            DOM.editorVerifyBtn
        ) {

            DOM.editorVerifyBtn.addEventListener(
                "click",
                verifyCode
            );
        }


        if (
            DOM.editorRunBtn
        ) {

            DOM.editorRunBtn.addEventListener(
                "click",
                runCode
            );
        }


        if (
            DOM.editorStopBtn
        ) {

            DOM.editorStopBtn.addEventListener(
                "click",
                stopCode
            );
        }


        if (
            DOM.editorPasteBtn
        ) {

            DOM.editorPasteBtn.addEventListener(
                "click",
                async function () {

                    if (
                        !DOM.codeEditor
                    ) {
                        return;
                    }

                    try {

                        const text =
                            await navigator.clipboard.readText();

                        DOM.codeEditor.value +=
                            text;

                        updateLineNumbers();

                        notify(
                            "Code collé.",
                            "success"
                        );

                    } catch (error) {

                        notify(
                            "Le collage automatique n'est pas autorisé par le navigateur.",
                            "warning"
                        );
                    }

                }
            );
        }
    }


    /* =====================================================================
       38 — SETTINGS EVENTS
       ===================================================================== */

    function bindSettingsEvents() {

        if (
            DOM.settingSnap
        ) {

            DOM.settingSnap.addEventListener(
                "change",
                function () {

                    STATE.settings.snap =
                        DOM.settingSnap.checked;

                    saveProjectSilently();

                }
            );
        }


        if (
            DOM.settingSound
        ) {

            DOM.settingSound.addEventListener(
                "change",
                function () {

                    STATE.settings.sound =
                        DOM.settingSound.checked;

                    saveProjectSilently();

                }
            );
        }


        if (
            DOM.settingTouch
        ) {

            DOM.settingTouch.addEventListener(
                "change",
                function () {

                    STATE.settings.touch =
                        DOM.settingTouch.checked;

                    saveProjectSilently();

                }
            );
        }
    }


    /* =====================================================================
       39 — CLAVIER
       ===================================================================== */

    function bindKeyboardEvents() {

        document.addEventListener(
            "keydown",
            function (event) {

                const target =
                    event.target;

                if (
                    target &&
                    (
                        target.tagName ===
                            "INPUT" ||
                        target.tagName ===
                            "TEXTAREA" ||
                        target.tagName ===
                            "SELECT"
                    )
                ) {

                    return;
                }

                if (
                    event.key ===
                    "Delete"
                ) {

                    deleteSelectedObject();

                    return;
                }

                if (
                    event.ctrlKey &&
                    event.key.toLowerCase() ===
                        "z"
                ) {

                    event.preventDefault();

                    undo();

                    return;
                }

                if (
                    event.ctrlKey &&
                    event.key.toLowerCase() ===
                        "y"
                ) {

                    event.preventDefault();

                    redo();

                    return;
                }

                switch (
                    event.key.toLowerCase()
                ) {

                    case "s":

                        setInteractionMode(
                            "select"
                        );

                        break;

                    case "m":

                        setInteractionMode(
                            "move"
                        );

                        break;

                    case "r":

                        setInteractionMode(
                            "rotate"
                        );

                        break;

                    case "c":

                        setInteractionMode(
                            "connect"
                        );

                        break;

                    case "escape":

                        STATE.connectStart =
                            null;

                        STATE.pointer.active =
                            false;

                        setInteractionMode(
                            "select"
                        );

                        closeMobilePanel();

                        break;

                }

            }
        );
    }


    /* =====================================================================
       40 — PROTECTION TOUCH / CSS DYNAMIQUE
       ===================================================================== */

    function prepareWorkspaceTouch() {

        if (!DOM.workspace) {
            return;
        }

        /*
         * Ces propriétés sont appliquées ici également afin que
         * l'application reste fonctionnelle même si une ancienne
         * feuille CSS possède une règle conflictuelle.
         */

        DOM.workspace.style.touchAction =
            "none";

        DOM.workspace.style.userSelect =
            "none";

        DOM.workspace.style.webkitUserSelect =
            "none";

        DOM.workspace.style.webkitTouchCallout =
            "none";

        if (DOM.workspaceBoard) {

            DOM.workspaceBoard.style.touchAction =
                "none";

            DOM.workspaceBoard.style.position =
                "absolute";

            DOM.workspaceBoard.style.left =
                "0";

            DOM.workspaceBoard.style.top =
                "0";

            DOM.workspaceBoard.style.transformOrigin =
                "0 0";

            DOM.workspaceBoard.style.pointerEvents =
                "auto";
        }

        if (DOM.connectionLayer) {

            DOM.connectionLayer.style.pointerEvents =
                "none";
        }
    }


    /* =====================================================================
       41 — INITIALISATION
       ===================================================================== */

    function initializeHistory() {

        STATE.history =
            [];

        STATE.historyIndex =
            -1;

        saveHistory();
    }


    function initializeDefaultProject() {

        if (
            STATE.objects.length
        ) {
            return;
        }

        /*
         * Aucun composant forcé ici.
         * Le laboratoire reste propre.
         */

        renderWorkspace();

        updateStatus();
    }


    function initializeApplication() {

        cacheDOM();

        if (!DOM.app) {

            console.error(
                "FOBAS Robotics : #fobasRoboticsApp introuvable."
            );

            return;
        }

        prepareWorkspaceTouch();

        bindMainEvents();

        bindWorkspaceEvents();

        bindLibraryEvents();

        bindCodeEvents();

        bindSettingsEvents();

        bindKeyboardEvents();

        renderToolsLibrary();

        renderComponentLibrary();

        renderCodesLibrary();

        renderMissions();

        synchronizeSettings();

        updateLineNumbers();

        initializeDefaultProject();

        initializeHistory();

        loadProject();

        /*
         * Si aucun projet n'existait, render quand même.
         */

        renderWorkspace();

        updateInspector();

        updateMeasurements();

        updateStatus();

        applyWorkspaceTransform();

        STATE.initialized =
            true;

        /*
         * Petit marqueur permettant de vérifier
         * facilement dans la console que ce nouveau moteur
         * est bien celui chargé.
         */

        window.FOBAS_ROBOTICS_ENGINE =
            API;

        console.info(
            "FOBAS Électronique & Robotique — Engine " +
            CONFIG.version +
            " chargé."
        );

        notify(
            "Laboratoire FOBAS prêt.",
            "success"
        );
    }


    /* =====================================================================
       42 — API PUBLIQUE
       ===================================================================== */

    const API = {

        version:
            CONFIG.version,

        state:
            STATE,

        components:
            COMPONENTS,

        tools:
            TOOLS,

        addComponent:
            addComponent,

        addTool:
            addTool,

        selectObject:
            selectObject,

        deleteSelected:
            deleteSelectedObject,

        connect:
            createConnection,

        disconnect:
            disconnectSelected,

        test:
            testLaboratory,

        run:
            runLaboratory,

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
            importProjectFile,

        newProject:
            newProject,

        zoom:
            zoomWorkspace,

        resetView:
            resetWorkspaceView,

        setMode:
            setInteractionMode,

        showView:
            showView,

        render:
            renderWorkspace

    };


    /* =====================================================================
       43 — DÉMARRAGE
       ===================================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeApplication,
            {
                once:
                    true
            }
        );

    } else {

        initializeApplication();
    }


})();
