/* ============================================================
   SIMULATION ÉLECTRICITÉ FOBAS
   Professional Virtual Electrical Laboratory
   Version 1.0

   APPLICATION INDÉPENDANTE

   IMPORTANT:
   - Aucun lien avec Campus Numérique FOBAS.
   - Aucun lien avec Microsoft Word.
   - Aucun système pédagogique externe.
   - Aucun système Ranise.
   - Simulation 100 % virtuelle.
   ============================================================ */

"use strict";


/* ============================================================
   APPLICATION STATE
   ============================================================ */

const ElectriciteFOBAS = {

    version: "1.0",

    storageKey:
        "FOBAS_ELECTRICITE_SIMULATION_STATE",

    activeView: "laboratoire",

    activeTool: "select",

    running: false,

    voltage: 230,

    zoom: 1,

    selectedComponentId: null,

    wireStart: null,

    components: [],

    wires: [],

    missions: [],

    activeMissionId: null,

    measurements: {

        voltage: 230,

        current: 0,

        resistance: Infinity,

        power: 0,

        frequency: 50,

        circuitState: "OUVERT"

    }

};


/* ============================================================
   COMPONENT DEFINITIONS
   ============================================================ */

const COMPONENT_DEFINITIONS = {

    source: {

        name: "Source",

        icon: "🔋",

        description:
            "Source d'alimentation virtuelle du circuit.",

        resistance: 0,

        power: 0,

        terminals: 2

    },


    switch: {

        name: "Interrupteur",

        icon: "⏻",

        description:
            "Commande permettant d'ouvrir ou de fermer le circuit.",

        resistance: 0.05,

        power: 0,

        terminals: 2,

        switchState: "off"

    },


    lamp: {

        name: "Lampe",

        icon: "💡",

        description:
            "Récepteur lumineux représentant une lampe électrique.",

        resistance: 883,

        power: 60,

        terminals: 2

    },


    resistor: {

        name: "Résistance",

        icon: "▱",

        description:
            "Charge résistive utilisée pour les exercices électriques.",

        resistance: 100,

        power: 0,

        terminals: 2

    },


    outlet: {

        name: "Prise",

        icon: "⊙",

        description:
            "Point de connexion simulé pour une installation électrique.",

        resistance: 0,

        power: 0,

        terminals: 2

    },


    breaker: {

        name: "Disjoncteur",

        icon: "▣",

        description:
            "Protection électrique virtuelle contre les surintensités.",

        resistance: 0.05,

        power: 0,

        terminals: 2,

        switchState: "off"

    },


    ground: {

        name: "Terre",

        icon: "⏚",

        description:
            "Point de référence et de protection du circuit.",

        resistance: 0,

        power: 0,

        terminals: 1

    },


    motor: {

        name: "Moteur",

        icon: "⚙",

        description:
            "Récepteur électromécanique virtuel.",

        resistance: 46,

        power: 1150,

        terminals: 2

    }

};


/* ============================================================
   MISSIONS
   ============================================================ */

ElectriciteFOBAS.missions = [

    {

        id: "mission-001",

        number: "MISSION 01",

        title:
            "Allumer une lampe",

        description:
            "Construisez un circuit simple permettant d'alimenter une lampe.",

        objective:
            "Créer une source, un interrupteur et une lampe avec des connexions cohérentes, puis fermer l'interrupteur.",

        requiredComponents: [
            "source",
            "switch",
            "lamp"
        ]

    },


    {

        id: "mission-002",

        number: "MISSION 02",

        title:
            "Circuit protégé",

        description:
            "Construisez un circuit comprenant une protection électrique.",

        objective:
            "Créer une source, un disjoncteur, un interrupteur et une lampe.",

        requiredComponents: [
            "source",
            "breaker",
            "switch",
            "lamp"
        ]

    },


    {

        id: "mission-003",

        number: "MISSION 03",

        title:
            "Mesurer une charge",

        description:
            "Construisez une charge résistive et analysez ses valeurs électriques.",

        objective:
            "Créer une source et une résistance puis lancer la simulation.",

        requiredComponents: [
            "source",
            "resistor"
        ]

    },


    {

        id: "mission-004",

        number: "MISSION 04",

        title:
            "Commande d'un moteur",

        description:
            "Simulez une commande simple d'un moteur électrique.",

        objective:
            "Créer une source, un interrupteur et un moteur.",

        requiredComponents: [
            "source",
            "switch",
            "motor"
        ]

    }

];


/* ============================================================
   DOM HELPERS
   ============================================================ */

const $ = selector =>
    document.querySelector(selector);


const $$ = selector =>
    Array.from(
        document.querySelectorAll(selector)
    );


/* ============================================================
   INITIALISATION
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeApplication();

    }
);


function initializeApplication() {

    bindNavigation();

    bindTools();

    bindComponentPalette();

    bindToolbar();

    bindInspector();

    bindTableau();

    bindDiagnostic();

    bindMissions();

    bindSearch();

    bindZoom();

    loadSimulation();

    renderMissionCards();

    renderLargeComponents();

    renderAll();

    updateMeasurements();

    updateStatus(
        "Simulation prête",
        "ready"
    );

}


/* ============================================================
   NAVIGATION
   ============================================================ */

function bindNavigation() {

    $$(".nav-item").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const view =
                    button.dataset.view;

                switchView(view);

            }
        );

    });

}


function switchView(viewName) {

    ElectriciteFOBAS.activeView =
        viewName;


    $$(".nav-item").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.view === viewName
        );

    });


    $$(".app-view").forEach(view => {

        view.classList.toggle(
            "active",
            view.id ===
            `view-${viewName}`
        );

    });


    if (
        viewName === "mesures"
    ) {

        updateMeasurements();

    }


    if (
        viewName === "diagnostic"
    ) {

        renderDiagnosticPreview();

    }

}


/* ============================================================
   TOOL MANAGEMENT
   ============================================================ */

function bindTools() {

    $$(".tool-button[data-tool]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                activateTool(
                    button.dataset.tool
                );

            }
        );

    });


    $$("[data-tool-select]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                activateTool(
                    button.dataset.toolSelect
                );

                switchView(
                    "laboratoire"
                );

            }
        );

    });

}


function activateTool(tool) {

    ElectriciteFOBAS.activeTool =
        tool;


    $$(".tool-button[data-tool]").forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.tool === tool
            );

        }
    );


    const toolNames = {

        select: "Select",

        wire: "Wire",

        delete: "Delete"

    };


    $("#toolModeLabel").textContent =
        `Outil : ${toolNames[tool] || tool}`;


    $("#footerMode").textContent =
        tool === "select"
            ? "Sélection"
            : tool === "wire"
                ? "Connexion"
                : "Suppression";


    if (
        tool !== "wire"
    ) {

        ElectriciteFOBAS.wireStart =
            null;

        clearTemporaryWire();

    }

}


/* ============================================================
   COMPONENT PALETTE
   ============================================================ */

function bindComponentPalette() {

    $$(".component-card").forEach(card => {

        card.addEventListener(
            "click",
            () => {

                addComponent(
                    card.dataset.component
                );

            }
        );

    });

}


function addComponent(type) {

    const definition =
        COMPONENT_DEFINITIONS[type];

    if (!definition) {

        return;

    }


    const index =
        ElectriciteFOBAS.components.length;


    const position =
        calculateNewComponentPosition(
            index
        );


    const component = {

        id:
            `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,

        type,

        name:
            definition.name,

        icon:
            definition.icon,

        description:
            definition.description,

        x:
            position.x,

        y:
            position.y,

        resistance:
            definition.resistance || 0,

        power:
            definition.power || 0,

        switchState:
            definition.switchState || "off",

        rotation: 0

    };


    ElectriciteFOBAS.components.push(
        component
    );


    ElectriciteFOBAS.selectedComponentId =
        component.id;


    renderAll();

    showToast(
        `${definition.name} ajouté au laboratoire.`,
        "success"
    );


    saveSimulationSilently();

}


function calculateNewComponentPosition(index) {

    const columns = 4;

    const spacingX = 230;

    const spacingY = 150;

    const column =
        index % columns;

    const row =
        Math.floor(index / columns);


    return {

        x:
            150 +
            column * spacingX,

        y:
            150 +
            row * spacingY

    };

}


/* ============================================================
   COMPONENT RENDERING
   ============================================================ */

function renderAll() {

    renderComponents();

    renderWires();

    updateCounters();

    updateInspector();

    updateCanvasEmptyState();

    updateSidebarState();

}


function renderComponents() {

    const layer =
        $("#componentsLayer");

    if (!layer) {

        return;

    }


    layer.innerHTML = "";


    ElectriciteFOBAS.components.forEach(
        component => {

            const group =
                createComponentSVG(
                    component
                );

            layer.appendChild(
                group
            );

        }
    );

}


function createComponentSVG(component) {

    const group =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
        );


    group.setAttribute(
        "class",
        "component-node"
    );


    group.dataset.componentId =
        component.id;


    group.setAttribute(
        "transform",
        `translate(${component.x} ${component.y})`
    );


    if (
        ElectriciteFOBAS.selectedComponentId ===
        component.id
    ) {

        group.classList.add(
            "selected"
        );

    }


    if (
        isComponentPowered(component)
    ) {

        group.classList.add(
            "powered"
        );

    }


    const body =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
        );


    body.setAttribute(
        "class",
        "component-body"
    );


    body.setAttribute(
        "x",
        "-48"
    );


    body.setAttribute(
        "y",
        "-32"
    );


    body.setAttribute(
        "width",
        "96"
    );


    body.setAttribute(
        "height",
        "64"
    );


    body.setAttribute(
        "rx",
        "12"
    );


    group.appendChild(
        body
    );


    if (
        component.type === "lamp"
    ) {

        const glow =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

        glow.setAttribute(
            "class",
            "lamp-glow"
        );

        glow.setAttribute(
            "cx",
            "0"
        );

        glow.setAttribute(
            "cy",
            "-3"
        );

        glow.setAttribute(
            "r",
            "15"
        );

        group.appendChild(
            glow
        );

    }


    const iconText =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );


    iconText.setAttribute(
        "x",
        "0"
    );


    iconText.setAttribute(
        "y",
        "7"
    );


    iconText.setAttribute(
        "text-anchor",
        "middle"
    );


    iconText.setAttribute(
        "font-size",
        "22"
    );


    iconText.textContent =
        component.icon;


    group.appendChild(
        iconText
    );


    const label =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );


    label.setAttribute(
        "class",
        "component-label"
    );


    label.setAttribute(
        "x",
        "0"
    );


    label.setAttribute(
        "y",
        "52"
    );


    label.setAttribute(
        "text-anchor",
        "middle"
    );


    label.textContent =
        component.name;


    group.appendChild(
        label
    );


    createTerminals(
        group,
        component
    );


    group.addEventListener(
        "pointerdown",
        event => {

            handleComponentPointerDown(
                event,
                component
            );

        }
    );


    group.addEventListener(
        "click",
        event => {

            event.stopPropagation();

        }
    );


    return group;

}


function createTerminals(
    group,
    component
) {

    if (
        component.type === "ground"
    ) {

        const terminal =
            createTerminal(
                0,
                32,
                0
            );

        group.appendChild(
            terminal
        );

        return;

    }


    const left =
        createTerminal(
            -62,
            0,
            0
        );


    const right =
        createTerminal(
            62,
            0,
            1
        );


    group.appendChild(
        left
    );

    group.appendChild(
        right
    );

}


function createTerminal(
    x,
    y,
    index
) {

    const terminal =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );


    terminal.setAttribute(
        "class",
        "component-terminal"
    );


    terminal.setAttribute(
        "cx",
        x
    );


    terminal.setAttribute(
        "cy",
        y
    );


    terminal.setAttribute(
        "r",
        "6"
    );


    terminal.dataset.terminalIndex =
        index;


    return terminal;

}


/* ============================================================
   COMPONENT INTERACTION
   ============================================================ */

function handleComponentPointerDown(
    event,
    component
) {

    event.stopPropagation();


    if (
        ElectriciteFOBAS.activeTool ===
        "delete"
    ) {

        deleteComponent(
            component.id
        );

        return;

    }


    if (
        ElectriciteFOBAS.activeTool ===
        "wire"
    ) {

        handleWireStart(
            component
        );

        return;

    }


    selectComponent(
        component.id
    );


    startComponentDrag(
        event,
        component
    );

}


function selectComponent(id) {

    ElectriciteFOBAS.selectedComponentId =
        id;


    renderComponents();

    updateInspector();

}


/* ============================================================
   COMPONENT DRAG
   ============================================================ */

function startComponentDrag(
    event,
    component
) {

    if (
        ElectriciteFOBAS.activeTool !==
        "select"
    ) {

        return;

    }


    const svg =
        $("#circuitCanvas");

    const startPoint =
        getSVGPoint(
            svg,
            event.clientX,
            event.clientY
        );


    const originalX =
        component.x;

    const originalY =
        component.y;


    function move(
        moveEvent
    ) {

        const point =
            getSVGPoint(
                svg,
                moveEvent.clientX,
                moveEvent.clientY
            );


        component.x =
            Math.max(
                60,
                Math.min(
                    1140,
                    originalX +
                    (
                        point.x -
                        startPoint.x
                    )
                )
            );


        component.y =
            Math.max(
                60,
                Math.min(
                    640,
                    originalY +
                    (
                        point.y -
                        startPoint.y
                    )
                )
            );


        renderComponents();

        renderWires();

    }


    function stop() {

        document.removeEventListener(
            "pointermove",
            move
        );


        document.removeEventListener(
            "pointerup",
            stop
        );


        saveSimulationSilently();

    }


    document.addEventListener(
        "pointermove",
        move
    );


    document.addEventListener(
        "pointerup",
        stop
    );

}


/* ============================================================
   SVG POINT
   ============================================================ */

function getSVGPoint(
    svg,
    clientX,
    clientY
) {

    const rect =
        svg.getBoundingClientRect();


    return {

        x:
            (
                (
                    clientX -
                    rect.left
                ) /
                rect.width
            ) *
            1200,

        y:
            (
                (
                    clientY -
                    rect.top
                ) /
                rect.height
            ) *
            700

    };

}


/* ============================================================
   WIRING
   ============================================================ */

function handleWireStart(
    component
) {

    if (
        !ElectriciteFOBAS.wireStart
    ) {

        ElectriciteFOBAS.wireStart =
            component;

        showToast(
            `Point de départ sélectionné : ${component.name}.`,
            "success"
        );

        return;

    }


    const start =
        ElectriciteFOBAS.wireStart;


    if (
        start.id === component.id
    ) {

        ElectriciteFOBAS.wireStart =
            null;

        return;

    }


    const exists =
        ElectriciteFOBAS.wires.some(
            wire =>
                (
                    wire.from === start.id &&
                    wire.to === component.id
                ) ||
                (
                    wire.from === component.id &&
                    wire.to === start.id
                )
        );


    if (exists) {

        showToast(
            "Cette connexion existe déjà.",
            "warning"
        );

        ElectriciteFOBAS.wireStart =
            null;

        return;

    }


    ElectriciteFOBAS.wires.push({

        id:
            `wire-${Date.now()}-${Math.floor(Math.random() * 1000)}`,

        from:
            start.id,

        to:
            component.id

    });


    ElectriciteFOBAS.wireStart =
        null;


    renderAll();

    showToast(
        `Connexion créée entre ${start.name} et ${component.name}.`,
        "success"
    );


    saveSimulationSilently();

}


function renderWires() {

    const layer =
        $("#wiresLayer");

    if (!layer) {

        return;

    }


    layer.innerHTML = "";


    ElectriciteFOBAS.wires.forEach(
        wire => {

            const from =
                getComponent(
                    wire.from
                );

            const to =
                getComponent(
                    wire.to
                );


            if (
                !from ||
                !to
            ) {

                return;

            }


            const line =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "line"
                );


            line.setAttribute(
                "class",
                "wire-line"
            );


            if (
                ElectriciteFOBAS.running &&
                isCircuitConnected()
            ) {

                line.classList.add(
                    "powered"
                );

            }


            line.setAttribute(
                "x1",
                from.x
            );


            line.setAttribute(
                "y1",
                from.y
            );


            line.setAttribute(
                "x2",
                to.x
            );


            line.setAttribute(
                "y2",
                to.y
            );


            line.dataset.wireId =
                wire.id;


            line.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    if (
                        ElectriciteFOBAS.activeTool ===
                        "delete"
                    ) {

                        deleteWire(
                            wire.id
                        );

                    }

                }
            );


            layer.appendChild(
                line
            );

        }
    );

}


/* ============================================================
   DELETE
   ============================================================ */

function deleteComponent(id) {

    const component =
        getComponent(id);


    if (!component) {

        return;

    }


    ElectriciteFOBAS.components =
        ElectriciteFOBAS.components.filter(
            item =>
                item.id !== id
        );


    ElectriciteFOBAS.wires =
        ElectriciteFOBAS.wires.filter(
            wire =>
                wire.from !== id &&
                wire.to !== id
        );


    if (
        ElectriciteFOBAS.selectedComponentId ===
        id
    ) {

        ElectriciteFOBAS.selectedComponentId =
            null;

    }


    renderAll();

    showToast(
        `${component.name} supprimé.`,
        "warning"
    );


    saveSimulationSilently();

}


function deleteWire(id) {

    ElectriciteFOBAS.wires =
        ElectriciteFOBAS.wires.filter(
            wire =>
                wire.id !== id
        );


    renderAll();

    showToast(
        "Connexion supprimée.",
        "warning"
    );


    saveSimulationSilently();

}


/* ============================================================
   INSPECTOR
   ============================================================ */

function bindInspector() {

    $("#deleteSelectedBtn")
        .addEventListener(
            "click",
            () => {

                if (
                    ElectriciteFOBAS.selectedComponentId
                ) {

                    deleteComponent(
                        ElectriciteFOBAS.selectedComponentId
                    );

                }

            }
        );


    $("#inspectorResistance")
        .addEventListener(
            "change",
            event => {

                const component =
                    getSelectedComponent();

                if (!component) {

                    return;

                }


                component.resistance =
                    Math.max(
                        .1,
                        Number(
                            event.target.value
                        ) || .1
                    );


                renderAll();

                updateMeasurements();

                saveSimulationSilently();

            }
        );


    $("#inspectorPower")
        .addEventListener(
            "change",
            event => {

                const component =
                    getSelectedComponent();

                if (!component) {

                    return;

                }


                component.power =
                    Math.max(
                        1,
                        Number(
                            event.target.value
                        ) || 1
                    );


                renderAll();

                updateMeasurements();

                saveSimulationSilently();

            }
        );


    $("#inspectorSwitchState")
        .addEventListener(
            "change",
            event => {

                const component =
                    getSelectedComponent();

                if (!component) {

                    return;

                }


                component.switchState =
                    event.target.value;


                renderAll();

                updateMeasurements();

                saveSimulationSilently();

            }
        );

}


function updateInspector() {

    const component =
        getSelectedComponent();


    if (!component) {

        $("#inspectorEmpty")
            .classList.remove(
                "hidden"
            );

        $("#inspectorContent")
            .classList.add(
                "hidden"
            );

        return;

    }


    $("#inspectorEmpty")
        .classList.add(
            "hidden"
        );


    $("#inspectorContent")
        .classList.remove(
            "hidden"
        );


    $("#inspectorIcon")
        .textContent =
        component.icon;


    $("#inspectorTitle")
        .textContent =
        component.name;


    $("#inspectorDescription")
        .textContent =
        component.description;


    $("#inspectorId")
        .value =
        component.id;


    $("#inspectorResistance")
        .value =
        component.resistance || "";


    $("#inspectorPower")
        .value =
        component.power || "";


    $("#inspectorSwitchState")
        .value =
        component.switchState || "off";


    $("#resistanceProperty")
        .style.display =
        (
            component.type === "resistor" ||
            component.type === "lamp" ||
            component.type === "motor"
        )
            ? "block"
            : "none";


    $("#powerProperty")
        .style.display =
        (
            component.type === "lamp" ||
            component.type === "motor"
        )
            ? "block"
            : "none";


    $("#switchProperty")
        .style.display =
        (
            component.type === "switch" ||
            component.type === "breaker"
        )
            ? "block"
            : "none";

}


/* ============================================================
   TOOLBAR
   ============================================================ */

function bindToolbar() {

    $("#runSimulationBtn")
        .addEventListener(
            "click",
            runSimulation
        );


    $("#stopSimulationBtn")
        .addEventListener(
            "click",
            stopSimulation
        );


    $("#voltageSelector")
        .addEventListener(
            "change",
            event => {

                ElectriciteFOBAS.voltage =
                    Number(
                        event.target.value
                    );


                $("#sidebarVoltage")
                    .textContent =
                    `${ElectriciteFOBAS.voltage} V`;


                $("#footerVoltage")
                    .textContent =
                    `${ElectriciteFOBAS.voltage} V AC`;


                updateMeasurements();

                saveSimulationSilently();

            }
        );


    $("#saveSimulationBtn")
        .addEventListener(
            "click",
            () => {

                saveSimulation();

            }
        );


    $("#resetSimulationBtn")
        .addEventListener(
            "click",
            openResetModal
        );


    $("#cancelResetBtn")
        .addEventListener(
            "click",
            closeResetModal
        );


    $("#confirmResetBtn")
        .addEventListener(
            "click",
            resetSimulation
        );

}


/* ============================================================
   SIMULATION ENGINE
   ============================================================ */

function runSimulation() {

    ElectriciteFOBAS.running =
        true;


    const diagnostic =
        calculateCircuit();


    if (
        diagnostic.error
    ) {

        ElectriciteFOBAS.running =
            false;


        updateStatus(
            diagnostic.message,
            "error"
        );


        showToast(
            diagnostic.message,
            "error"
        );

    } else {

        updateStatus(
            "Simulation en cours",
            "running"
        );


        showToast(
            "Simulation démarrée.",
            "success"
        );

    }


    updateMeasurements();

    renderAll();

}


function stopSimulation() {

    ElectriciteFOBAS.running =
        false;


    updateStatus(
        "Simulation arrêtée",
        "ready"
    );


    renderAll();

    updateMeasurements();

    showToast(
        "Simulation arrêtée.",
        "warning"
    );

}


/* ============================================================
   CIRCUIT CALCULATION
   ============================================================ */

function calculateCircuit() {

    const source =
        ElectriciteFOBAS.components.find(
            component =>
                component.type === "source"
        );


    if (!source) {

        return {

            error: true,

            message:
                "Aucune source d'alimentation n'est présente."

        };

    }


    if (
        ElectriciteFOBAS.wires.length === 0
    ) {

        return {

            error: true,

            message:
                "Aucune connexion électrique n'est présente."

        };

    }


    if (
        !isCircuitConnected()
    ) {

        return {

            error: true,

            message:
                "Le circuit ne forme pas encore un chemin électrique cohérent."

        };

    }


    const switches =
        ElectriciteFOBAS.components.filter(
            component =>
                (
                    component.type === "switch" ||
                    component.type === "breaker"
                )
        );


    const openSwitch =
        switches.some(
            component =>
                component.switchState !== "on"
        );


    if (openSwitch) {

        return {

            error: false,

            open:
                true,

            message:
                "Le circuit est correctement connecté mais une commande est ouverte."

        };

    }


    return {

        error: false,

        open: false,

        message:
            "Circuit fermé et prêt pour la simulation."

    };

}


/* ============================================================
   GRAPH CONNECTIVITY
   ============================================================ */

function isCircuitConnected() {

    if (
        ElectriciteFOBAS.components.length < 2
    ) {

        return false;

    }


    const source =
        ElectriciteFOBAS.components.find(
            component =>
                component.type === "source"
        );


    if (!source) {

        return false;

    }


    const adjacency =
        new Map();


    ElectriciteFOBAS.components.forEach(
        component => {

            adjacency.set(
                component.id,
                []
            );

        }
    );


    ElectriciteFOBAS.wires.forEach(
        wire => {

            if (
                adjacency.has(wire.from) &&
                adjacency.has(wire.to)
            ) {

                adjacency
                    .get(wire.from)
                    .push(wire.to);

                adjacency
                    .get(wire.to)
                    .push(wire.from);

            }

        }
    );


    const visited =
        new Set();


    const queue =
        [source.id];


    while (
        queue.length > 0
    ) {

        const current =
            queue.shift();


        if (
            visited.has(current)
        ) {

            continue;

        }


        visited.add(current);


        const neighbors =
            adjacency.get(current) || [];


        neighbors.forEach(
            neighbor => {

                if (
                    !visited.has(neighbor)
                ) {

                    queue.push(
                        neighbor
                    );

                }

            }
        );

    }


    const activeReceivers =
        ElectriciteFOBAS.components.filter(
            component =>
                (
                    component.type === "lamp" ||
                    component.type === "resistor" ||
                    component.type === "motor"
                )
        );


    if (
        activeReceivers.length === 0
    ) {

        return false;

    }


    return activeReceivers.some(
        receiver =>
            visited.has(
                receiver.id
            )
    );

}


/* ============================================================
   POWERED STATE
   ============================================================ */

function isComponentPowered(
    component
) {

    if (
        !ElectriciteFOBAS.running
    ) {

        return false;

    }


    if (
        !isCircuitConnected()
    ) {

        return false;

    }


    const calculation =
        calculateCircuit();


    if (
        calculation.open
    ) {

        return false;

    }


    return (
        component.type === "lamp" ||
        component.type === "resistor" ||
        component.type === "motor" ||
        component.type === "outlet"
    );

}


/* ============================================================
   MEASUREMENTS
   ============================================================ */

function updateMeasurements() {

    const result =
        calculateMeasurementValues();


    ElectriciteFOBAS.measurements =
        result;


    $("#measureVoltage")
        .textContent =
        formatNumber(
            result.voltage,
            2
        );


    $("#measureCurrent")
        .textContent =
        formatNumber(
            result.current,
            2
        );


    $("#measureResistance")
        .textContent =
        result.resistance === Infinity
            ? "∞"
            : formatNumber(
                result.resistance,
                2
            );


    $("#measurePower")
        .textContent =
        formatNumber(
            result.power,
            2
        );


    $("#powerValue")
        .textContent =
        `${formatNumber(result.power, 1)} W`;


    $("#measureCircuitState")
        .textContent =
        result.circuitState;


    addMeasurementLog(
        result
    );

}


function calculateMeasurementValues() {

    const voltage =
        ElectriciteFOBAS.voltage;


    const calculation =
        calculateCircuit();


    if (
        calculation.error ||
        calculation.open
    ) {

        return {

            voltage,

            current: 0,

            resistance: Infinity,

            power: 0,

            frequency: 50,

            circuitState:
                calculation.error
                    ? "OUVERT"
                    : "OUVERT"

        };

    }


    const receivers =
        ElectriciteFOBAS.components.filter(
            component =>
                (
                    component.type === "lamp" ||
                    component.type === "resistor" ||
                    component.type === "motor"
                )
        );


    if (
        receivers.length === 0
    ) {

        return {

            voltage,

            current: 0,

            resistance: Infinity,

            power: 0,

            frequency: 50,

            circuitState: "OUVERT"

        };

    }


    const totalResistance =
        receivers.reduce(
            (
                total,
                component
            ) => {

                return total +
                    Math.max(
                        .1,
                        Number(
                            component.resistance
                        ) || .1
                    );

            },
            0
        );


    const current =
        voltage /
        totalResistance;


    const power =
        voltage *
        current;


    return {

        voltage,

        current,

        resistance:
            totalResistance,

        power,

        frequency: 50,

        circuitState:
            "FERMÉ"

    };

}


function addMeasurementLog(
    values
) {

    const log =
        $("#measurementLog");


    if (!log) {

        return;

    }


    const now =
        new Date();


    const time =
        now.toLocaleTimeString(
            "fr-FR",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );


    log.innerHTML = `
        <div>
            [${time}] Tension : ${formatNumber(values.voltage, 2)} V
        </div>

        <div>
            [${time}] Courant : ${formatNumber(values.current, 3)} A
        </div>

        <div>
            [${time}] Résistance : ${
                values.resistance === Infinity
                    ? "∞"
                    : formatNumber(values.resistance, 2)
            } Ω
        </div>

        <div>
            [${time}] Puissance : ${formatNumber(values.power, 2)} W
        </div>

        <div>
            [${time}] État : ${values.circuitState}
        </div>
    `;

}


function formatNumber(
    value,
    decimals
) {

    if (
        !Number.isFinite(value)
    ) {

        return "0";

    }


    return Number(value)
        .toFixed(decimals);

}


/* ============================================================
   SIDEBAR STATUS
   ============================================================ */

function updateSidebarState() {

    const calculation =
        calculateCircuit();


    $("#sidebarCircuitState")
        .textContent =
        calculation.error
            ? "Ouvert"
            : calculation.open
                ? "Ouvert"
                : "Fermé";


    $("#sidebarVoltage")
        .textContent =
        `${ElectriciteFOBAS.voltage} V`;

}


/* ============================================================
   STATUS
   ============================================================ */

function updateStatus(
    message,
    state
) {

    $("#simulationStatusText")
        .textContent =
        message;


    const light =
        $("#simulationStatusLight");


    light.classList.remove(
        "running",
        "error"
    );


    if (
        state === "running"
    ) {

        light.classList.add(
            "running"
        );

    }


    if (
        state === "error"
    ) {

        light.classList.add(
            "error"
        );

    }

}


/* ============================================================
   COUNTERS
   ============================================================ */

function updateCounters() {

    $("#componentCount")
        .textContent =
        ElectriciteFOBAS.components.length;


    $("#connectionCount")
        .textContent =
        ElectriciteFOBAS.wires.length;

}


/* ============================================================
   EMPTY CANVAS
   ============================================================ */

function updateCanvasEmptyState() {

    const message =
        $("#canvasEmptyMessage");


    if (
        ElectriciteFOBAS.components.length > 0
    ) {

        message.classList.add(
            "hidden"
        );

    } else {

        message.classList.remove(
            "hidden"
        );

    }

}


/* ============================================================
   SEARCH
   ============================================================ */

function bindSearch() {

    $("#componentSearch")
        .addEventListener(
            "input",
            event => {

                const query =
                    event.target.value
                        .trim()
                        .toLowerCase();


                $$(".component-card")
                    .forEach(
                        card => {

                            const text =
                                card.textContent
                                    .toLowerCase();


                            card.style.display =
                                text.includes(query)
                                    ? "flex"
                                    : "none";

                        }
                    );

            }
        );

}


/* ============================================================
   ZOOM
   ============================================================ */

function bindZoom() {

    $("#zoomInBtn")
        .addEventListener(
            "click",
            () => {

                ElectriciteFOBAS.zoom =
                    Math.min(
                        1.8,
                        ElectriciteFOBAS.zoom + .1
                    );

                applyZoom();

            }
        );


    $("#zoomOutBtn")
        .addEventListener(
            "click",
            () => {

                ElectriciteFOBAS.zoom =
                    Math.max(
                        .6,
                        ElectriciteFOBAS.zoom - .1
                    );

                applyZoom();

            }
        );


    $("#centerCircuitBtn")
        .addEventListener(
            "click",
            () => {

                centerCircuit();

            }
        );

}


function applyZoom() {

    $("#zoomValue")
        .textContent =
        `${Math.round(
            ElectriciteFOBAS.zoom * 100
        )}%`;


    const svg =
        $("#circuitCanvas");


    svg.style.transform =
        `scale(${ElectriciteFOBAS.zoom})`;


    svg.style.transformOrigin =
        "center center";

}


function centerCircuit() {

    const components =
        ElectriciteFOBAS.components;


    if (
        components.length === 0
    ) {

        return;

    }


    const minX =
        Math.min(
            ...components.map(
                component =>
                    component.x
            )
        );


    const maxX =
        Math.max(
            ...components.map(
                component =>
                    component.x
            )
        );


    const minY =
        Math.min(
            ...components.map(
                component =>
                    component.y
            )
        );


    const maxY =
        Math.max(
            ...components.map(
                component =>
                    component.y
            )
        );


    const centerX =
        (minX + maxX) / 2;


    const centerY =
        (minY + maxY) / 2;


    const offsetX =
        600 - centerX;


    const offsetY =
        350 - centerY;


    components.forEach(
        component => {

            component.x =
                Math.max(
                    60,
                    Math.min(
                        1140,
                        component.x + offsetX
                    )
                );


            component.y =
                Math.max(
                    60,
                    Math.min(
                        640,
                        component.y + offsetY
                    )
                );

        }
    );


    renderAll();

    saveSimulationSilently();

}


/* ============================================================
   TABLEAU ÉLECTRIQUE
   ============================================================ */

function bindTableau() {

    $("#mainBreakerToggle")
        .addEventListener(
            "click",
            toggleMainBreaker
        );

}


function toggleMainBreaker() {

    const breaker =
        ElectriciteFOBAS.components.find(
            component =>
                component.type === "breaker"
        );


    if (!breaker) {

        addComponent("breaker");

        showToast(
            "Disjoncteur principal ajouté au laboratoire.",
            "success"
        );

        return;

    }


    breaker.switchState =
        breaker.switchState === "on"
            ? "off"
            : "on";


    updateBreakerUI();

    renderAll();

    updateMeasurements();

    saveSimulationSilently();

}


function updateBreakerUI() {

    const breaker =
        ElectriciteFOBAS.components.find(
            component =>
                component.type === "breaker"
        );


    const button =
        $("#mainBreakerToggle");


    const status =
        $("#mainBreakerStatus");


    const isOn =
        breaker &&
        breaker.switchState === "on";


    button.classList.toggle(
        "on",
        Boolean(isOn)
    );


    status.textContent =
        isOn
            ? "ON"
            : "OFF";


    status.classList.toggle(
        "on",
        Boolean(isOn)
    );


    status.classList.toggle(
        "off",
        !isOn
    );


    $$(".breaker-indicator")
        .forEach(
            indicator => {

                indicator.classList.toggle(
                    "on",
                    Boolean(isOn)
                );

            }
        );

}


/* ============================================================
   DIAGNOSTIC
   ============================================================ */

function bindDiagnostic() {

    $("#runDiagnosticBtn")
        .addEventListener(
            "click",
            runDiagnostic
        );

}


function runDiagnostic() {

    const details =
        [];


    const components =
        ElectriciteFOBAS.components;


    const wires =
        ElectriciteFOBAS.wires;


    const source =
        components.find(
            component =>
                component.type === "source"
        );


    if (source) {

        details.push({
            type: "ok",
            text:
                "Source d'alimentation détectée."
        });

    } else {

        details.push({
            type: "error",
            text:
                "Aucune source d'alimentation n'est présente."
        });

    }


    if (
        wires.length > 0
    ) {

        details.push({
            type: "ok",
            text:
                `${wires.length} connexion(s) détectée(s).`
        });

    } else {

        details.push({
            type: "warning",
            text:
                "Aucune connexion n'a encore été créée."
        });

    }


    const receiver =
        components.some(
            component =>
                (
                    component.type === "lamp" ||
                    component.type === "resistor" ||
                    component.type === "motor"
                )
        );


    if (receiver) {

        details.push({
            type: "ok",
            text:
                "Au moins un récepteur électrique est présent."
        });

    } else {

        details.push({
            type: "warning",
            text:
                "Aucun récepteur électrique détecté."
        });

    }


    const connected =
        isCircuitConnected();


    if (connected) {

        details.push({
            type: "ok",
            text:
                "Un chemin électrique entre la source et un récepteur a été détecté."
        });

    } else {

        details.push({
            type: "warning",
            text:
                "Le circuit ne forme pas encore un chemin complet."
        });

    }


    const result =
        $("#diagnosticResult");


    const hasError =
        details.some(
            item =>
                item.type === "error"
        );


    const hasWarning =
        details.some(
            item =>
                item.type === "warning"
        );


    result.innerHTML = `

        <div class="diagnostic-icon">
            ${hasError ? "!" : hasWarning ? "⚠" : "✓"}
        </div>

        <div>

            <h2>
                ${
                    hasError
                        ? "Problème détecté"
                        : hasWarning
                            ? "Analyse terminée avec avertissements"
                            : "Circuit correctement analysé"
                }
            </h2>

            <p>
                Diagnostic automatique du laboratoire virtuel.
            </p>

        </div>

    `;


    $("#diagnosticDetails")
        .innerHTML =
        details.map(
            item => `
                <div class="diagnostic-item ${item.type}">
                    ${item.text}
                </div>
            `
        ).join("");

}


function renderDiagnosticPreview() {

    if (
        $("#diagnosticDetails").children.length === 0
    ) {

        $("#diagnosticDetails")
            .innerHTML = `
                <div class="diagnostic-item warning">
                    Aucun diagnostic récent. Cliquez sur
                    "Run Diagnostic" pour analyser le circuit.
                </div>
            `;

    }

}


/* ============================================================
   MISSIONS
   ============================================================ */

function bindMissions() {

    $("#closeMissionBtn")
        .addEventListener(
            "click",
            closeMission
        );


    $("#validateMissionBtn")
        .addEventListener(
            "click",
            validateActiveMission
        );

}


function renderMissionCards() {

    const grid =
        $("#missionGrid");


    if (!grid) {

        return;

    }


    grid.innerHTML =
        ElectriciteFOBAS.missions.map(
            mission => `

                <article class="mission-card">

                    <div class="mission-number">
                        ${mission.number}
                    </div>

                    <h3>
                        ${mission.title}
                    </h3>

                    <p>
                        ${mission.description}
                    </p>

                    <button
                        type="button"
                        class="tool-button primary"
                        data-start-mission="${mission.id}"
                    >
                        Start Mission
                    </button>

                </article>

            `
        ).join("");


    $$("[data-start-mission]")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        startMission(
                            button.dataset.startMission
                        );

                    }
                );

            }
        );

}


function startMission(id) {

    const mission =
        ElectriciteFOBAS.missions.find(
            item =>
                item.id === id
        );


    if (!mission) {

        return;

    }


    ElectriciteFOBAS.activeMissionId =
        id;


    $("#activeMissionTitle")
        .textContent =
        mission.title;


    $("#activeMissionDescription")
        .textContent =
        mission.description;


    $("#activeMissionObjective")
        .textContent =
        mission.objective;


    $("#missionFeedback")
        .innerHTML =
        "";


    $("#missionWorkspace")
        .classList.remove(
            "hidden"
        );


    showToast(
        `${mission.number} démarrée.`,
        "success"
    );

}


function closeMission() {

    ElectriciteFOBAS.activeMissionId =
        null;


    $("#missionWorkspace")
        .classList.add(
            "hidden"
        );

}


function validateActiveMission() {

    const mission =
        ElectriciteFOBAS.missions.find(
            item =>
                item.id ===
                ElectriciteFOBAS.activeMissionId
        );


    if (!mission) {

        return;

    }


    const presentTypes =
        new Set(
            ElectriciteFOBAS.components.map(
                component =>
                    component.type
            )
        );


    const missing =
        mission.requiredComponents.filter(
            type =>
                !presentTypes.has(type)
        );


    if (
        missing.length > 0
    ) {

        const names =
            missing.map(
                type =>
                    COMPONENT_DEFINITIONS[type].name
            );


        $("#missionFeedback")
            .innerHTML = `
                <div class="feedback-error">
                    Mission non validée.
                    Composants manquants :
                    ${names.join(", ")}.
                </div>
            `;

        return;

    }


    if (
        mission.id === "mission-001"
    ) {

        const switchComponent =
            getFirstComponent(
                "switch"
            );


        if (
            !switchComponent ||
            switchComponent.switchState !== "on"
        ) {

            $("#missionFeedback")
                .innerHTML = `
                    <div class="feedback-warning">
                        Les composants sont présents,
                        mais l'interrupteur doit être sur ON.
                    </div>
                `;

            return;

        }

    }


    $("#missionFeedback")
        .innerHTML = `
            <div class="feedback-success">
                Mission validée avec succès.
                La configuration demandée est présente
                dans le laboratoire virtuel.
            </div>
        `;


    showToast(
        "Mission validée.",
        "success"
    );

}


/* ============================================================
   LARGE COMPONENT LIBRARY
   ============================================================ */

function renderLargeComponents() {

    const grid =
        $("#largeComponentGrid");


    if (!grid) {

        return;

    }


    grid.innerHTML =
        Object.entries(
            COMPONENT_DEFINITIONS
        ).map(
            (
                [type, definition]
            ) => `

                <article
                    class="large-component-card"
                    data-library-component="${type}"
                >

                    <div
                        class="large-component-card-icon"
                    >
                        ${definition.icon}
                    </div>

                    <h3>
                        ${definition.name}
                    </h3>

                    <p>
                        ${definition.description}
                    </p>

                </article>

            `
        ).join("");


    $$("[data-library-component]")
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        addComponent(
                            card.dataset.libraryComponent
                        );

                        switchView(
                            "laboratoire"
                        );

                    }
                );

            }
        );

}


/* ============================================================
   RESET
   ============================================================ */

function openResetModal() {

    $("#confirmationModal")
        .classList.remove(
            "hidden"
        );

}


function closeResetModal() {

    $("#confirmationModal")
        .classList.add(
            "hidden"
        );

}


function resetSimulation() {

    ElectriciteFOBAS.components =
        [];


    ElectriciteFOBAS.wires =
        [];


    ElectriciteFOBAS.selectedComponentId =
        null;


    ElectriciteFOBAS.wireStart =
        null;


    ElectriciteFOBAS.running =
        false;


    ElectriciteFOBAS.voltage =
        230;


    ElectriciteFOBAS.activeMissionId =
        null;


    localStorage.removeItem(
        ElectriciteFOBAS.storageKey
    );


    $("#voltageSelector")
        .value =
        "230";


    $("#missionWorkspace")
        .classList.add(
            "hidden"
        );


    closeResetModal();

    activateTool(
        "select"
    );


    updateStatus(
        "Simulation prête",
        "ready"
    );


    renderAll();

    updateMeasurements();

    updateBreakerUI();


    showToast(
        "Simulation réinitialisée.",
        "success"
    );

}


/* ============================================================
   SAVE / LOAD
   ============================================================ */

function createSaveData() {

    return {

        version:
            ElectriciteFOBAS.version,

        voltage:
            ElectriciteFOBAS.voltage,

        components:
            ElectriciteFOBAS.components,

        wires:
            ElectriciteFOBAS.wires

    };

}


function saveSimulation() {

    try {

        localStorage.setItem(
            ElectriciteFOBAS.storageKey,
            JSON.stringify(
                createSaveData()
            )
        );


        showToast(
            "Simulation sauvegardée localement.",
            "success"
        );

    } catch (error) {

        showToast(
            "Impossible de sauvegarder la simulation.",
            "error"
        );

    }

}


function saveSimulationSilently() {

    try {

        localStorage.setItem(
            ElectriciteFOBAS.storageKey,
            JSON.stringify(
                createSaveData()
            )
        );

    } catch (error) {

        console.warn(
            "FOBAS Electricité: sauvegarde locale impossible.",
            error
        );

    }

}


function loadSimulation() {

    try {

        const saved =
            localStorage.getItem(
                ElectriciteFOBAS.storageKey
            );


        if (!saved) {

            return;

        }


        const data =
            JSON.parse(saved);


        if (
            !data ||
            typeof data !== "object"
        ) {

            return;

        }


        if (
            Number.isFinite(
                Number(
                    data.voltage
                )
            )
        ) {

            ElectriciteFOBAS.voltage =
                Number(
                    data.voltage
                );

        }


        if (
            Array.isArray(
                data.components
            )
        ) {

            ElectriciteFOBAS.components =
                data.components;

        }


        if (
            Array.isArray(
                data.wires
            )
        ) {

            ElectriciteFOBAS.wires =
                data.wires;

        }


        $("#voltageSelector")
            .value =
            String(
                ElectriciteFOBAS.voltage
            );


        showToast(
            "Simulation précédente restaurée.",
            "success"
        );

    } catch (error) {

        console.warn(
            "FOBAS Electricité: données de sauvegarde invalides.",
            error
        );

    }

}


/* ============================================================
   HELPERS
   ============================================================ */

function getComponent(id) {

    return ElectriciteFOBAS.components.find(
        component =>
            component.id === id
    );

}


function getSelectedComponent() {

    return getComponent(
        ElectriciteFOBAS.selectedComponentId
    );

}


function getFirstComponent(type) {

    return ElectriciteFOBAS.components.find(
        component =>
            component.type === type
    );

}


/* ============================================================
   TEMPORARY WIRE
   ============================================================ */

function clearTemporaryWire() {

    const layer =
        $("#temporaryWireLayer");


    if (layer) {

        layer.innerHTML = "";

    }

}


/* ============================================================
   TOAST
   ============================================================ */

function showToast(
    message,
    type = "success"
) {

    const container =
        $("#toastContainer");


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    toast.textContent =
        message;


    container.appendChild(
        toast
    );


    window.setTimeout(
        () => {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateY(6px)";


            window.setTimeout(
                () => {

                    toast.remove();

                },
                220
            );

        },
        2800
    );

}


/* ============================================================
   GLOBAL CANVAS CLICK
   ============================================================ */

$("#circuitCanvas")
    ?.addEventListener(
        "pointerdown",
        event => {

            if (
                event.target ===
                $("#circuitCanvas")
            ) {

                ElectriciteFOBAS.selectedComponentId =
                    null;

                ElectriciteFOBAS.wireStart =
                    null;

                clearTemporaryWire();

                renderAll();

            }

        }
    );


/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            ElectriciteFOBAS.selectedComponentId =
                null;

            ElectriciteFOBAS.wireStart =
                null;

            clearTemporaryWire();

            renderAll();

        }


        if (
            event.key === "Delete"
        ) {

            if (
                ElectriciteFOBAS.selectedComponentId
            ) {

                deleteComponent(
                    ElectriciteFOBAS.selectedComponentId
                );

            }

        }


        if (
            event.key.toLowerCase() === "w" &&
            !isTypingTarget(event.target)
        ) {

            activateTool(
                "wire"
            );

        }


        if (
            event.key.toLowerCase() === "v" &&
            !isTypingTarget(event.target)
        ) {

            activateTool(
                "select"
            );

        }

    }
);


function isTypingTarget(
    target
) {

    return (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
    );

}


/* ============================================================
   EXPORT DEBUG ACCESS
   ============================================================ */

window.FOBASElectricite =
    ElectriciteFOBAS;


/* ============================================================
   FIN DU MOTEUR
   ============================================================ */



