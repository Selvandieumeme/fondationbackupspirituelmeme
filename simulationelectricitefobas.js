/* ============================================================
   SIMULATION ÉLECTRICITÉ FOBAS
   ------------------------------------------------------------
   Moteur principal indépendant
   Compatible avec :
   simulationelectricitefobas.html
   simulationelectricitefobas.css

   Architecture :
   - Moteur topologique
   - Phase / Neutre / Terre
   - Composants
   - Câblage
   - Tableau électrique
   - Protections
   - Mesures
   - Multimètre
   - Diagnostic
   - Missions
   - Sauvegarde / réinitialisation
   - Interface dynamique

   IMPORTANT :
   Ce fichier est totalement indépendant du Campus Numérique FOBAS.
============================================================ */

(() => {
    "use strict";

    /* =========================================================
       1. CONFIGURATION
    ========================================================= */

    const APP_KEY = "FOBAS_ELECTRICITE_TOPOLOGICAL_SIMULATION_V3";
    const VERSION = "3.0.0";

    const CONFIG = {
        defaultVoltage: 230,
        minVoltage: 0,
        maxVoltage: 400,

        grid: 20,
        majorGrid: 100,

        defaultZoom: 1,
        minZoom: 0.5,
        maxZoom: 2,

        defaultBreakerRating: 16,
        defaultRcdRating: 30,

        simulationInterval: 250,

        wireResistance: 0.01,

        colors: {
            phase: "#ff5d73",
            neutral: "#5ee7ff",
            earth: "#25d695",
            wire: "#8ca7c5",
            energized: "#ff647a",
            selected: "#ffffff"
        }
    };

    /* =========================================================
       2. OUTILS DOM
    ========================================================= */

    const $ = (selector, root = document) => root.querySelector(selector);

    const $$ = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));

    const byId = id => document.getElementById(id);

    const exists = id => !!byId(id);

    const text = (id, value) => {
        const el = byId(id);
        if (el) el.textContent = value;
    };

    const html = (id, value) => {
        const el = byId(id);
        if (el) el.innerHTML = value;
    };

    const show = id => {
        const el = byId(id);
        if (el) el.classList.remove("hidden");
    };

    const hide = id => {
        const el = byId(id);
        if (el) el.classList.add("hidden");
    };

    const setValue = (id, value) => {
        const el = byId(id);
        if (el) el.value = value;
    };

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const round = (value, decimals = 2) => {
        const p = Math.pow(10, decimals);
        return Math.round(value * p) / p;
    };

    const uid = prefix =>
        `${prefix}_${Date.now().toString(36)}_${Math.random()
            .toString(36)
            .slice(2, 8)}`;

    const escapeHTML = value =>
        String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    /* =========================================================
       3. TYPES DE COMPOSANTS
    ========================================================= */

    const TYPES = {
        source: {
            label: "Source d'alimentation",
            icon: "⚡",
            description:
                "Source monophasée virtuelle fournissant la phase et le neutre.",
            terminals: ["L", "N"],
            defaultResistance: 0
        },

        breaker: {
            label: "Disjoncteur",
            icon: "🛡️",
            description:
                "Protection contre les surintensités et les courts-circuits.",
            terminals: ["L_IN", "L_OUT"],
            defaultRating: 16
        },

        rcd: {
            label: "Interrupteur différentiel",
            icon: "🛡️",
            description:
                "Protection différentielle contre les courants de fuite vers la terre.",
            terminals: ["L_IN", "L_OUT", "N_IN", "N_OUT"],
            defaultRating: 30
        },

        switch: {
            label: "Interrupteur simple",
            icon: "🔘",
            description:
                "Commande un circuit d'éclairage.",
            terminals: ["L_IN", "L_OUT"]
        },

        twoWaySwitch: {
            label: "Va-et-vient",
            icon: "↔️",
            description:
                "Permet de commander un même éclairage depuis deux points.",
            terminals: ["COM", "L1", "L2"]
        },

        lamp: {
            label: "Lampe",
            icon: "💡",
            description:
                "Récepteur lumineux monophasé.",
            terminals: ["L", "N"],
            defaultPower: 60
        },

        outlet: {
            label: "Prise 2P+T",
            icon: "🔌",
            description:
                "Prise de courant avec phase, neutre et terre.",
            terminals: ["L", "N", "PE"],
            defaultPower: 1200
        },

        resistor: {
            label: "Résistance",
            icon: "Ω",
            description:
                "Charge résistive réglable.",
            terminals: ["L", "N"],
            defaultResistance: 100
        },

        motor: {
            label: "Moteur monophasé",
            icon: "⚙️",
            description:
                "Récepteur moteur monophasé.",
            terminals: ["L", "N", "PE"],
            defaultPower: 750
        },

        ground: {
            label: "Terre",
            icon: "⏚",
            description:
                "Point de raccordement au conducteur de protection.",
            terminals: ["PE"]
        },

        neutralBus: {
            label: "Barrette neutre",
            icon: "N",
            description:
                "Barrette de distribution du neutre.",
            terminals: ["N"]
        },

        earthBus: {
            label: "Barrette de terre",
            icon: "⏚",
            description:
                "Barrette de distribution du conducteur de protection.",
            terminals: ["PE"]
        }
    };

    /* =========================================================
       4. ÉTAT GLOBAL
    ========================================================= */

    const state = {
        version: VERSION,

        voltage: CONFIG.defaultVoltage,

        running: false,

        activeView: "laboratoire",

        tool: "select",

        meterMode: "voltage",

        zoom: CONFIG.defaultZoom,

        panX: 0,
        panY: 0,

        selectedComponentId: null,
        selectedWireId: null,

        wireStart: null,

        meterPointA: null,
        meterPointB: null,

        components: [],

        wires: [],

        faults: {
            shortCircuit: false,
            earthFault: false,
            overload: false,
            openConductor: false
        },

        trips: {
            main: false,
            rcd: false,
            lighting: false,
            outlet: false,
            heating: false,
            motor: false
        },

        measurements: {
            voltage: 0,
            current: 0,
            resistance: Infinity,
            power: 0,
            continuity: false,
            leakage: 0
        },

        diagnostic: {
            status: "unknown",
            title: "Diagnostic non exécuté",
            summary: "Lancez le diagnostic pour analyser le circuit.",
            details: [],
            procedure: []
        },

        mission: {
            activeId: null,
            level: "Tous niveaux",
            stepIndex: 0,
            score: 0,
            completed: false
        },

        logs: []
    };

    /* =========================================================
       5. MISSIONS
    ========================================================= */

    const MISSIONS = [
        {
            id: "mission-1",
            title: "Alimentation sécurisée",
            level: "Débutant",
            description:
                "Construisez une alimentation protégée avec source, disjoncteur et récepteur.",
            objective:
                "Réaliser un circuit simple correctement protégé.",
            steps: [
                "Ajouter une source",
                "Ajouter un disjoncteur",
                "Ajouter une lampe",
                "Relier correctement la phase",
                "Relier correctement le neutre",
                "Démarrer la simulation"
            ]
        },

        {
            id: "mission-2",
            title: "Simple allumage",
            level: "Débutant",
            description:
                "Réalisez un circuit d'éclairage commandé par un interrupteur.",
            objective:
                "La lampe doit être alimentée à travers l'interrupteur.",
            steps: [
                "Ajouter une source",
                "Ajouter un disjoncteur",
                "Ajouter un interrupteur",
                "Ajouter une lampe",
                "Câbler la phase",
                "Câbler le neutre",
                "Fermer l'interrupteur",
                "Démarrer la simulation"
            ]
        },

        {
            id: "mission-3",
            title: "Prise 2P+T",
            level: "Débutant",
            description:
                "Construisez une prise avec phase, neutre et conducteur de protection.",
            objective:
                "La prise doit recevoir L, N et PE.",
            steps: [
                "Ajouter une source",
                "Ajouter un disjoncteur",
                "Ajouter une prise 2P+T",
                "Connecter la phase",
                "Connecter le neutre",
                "Connecter la terre",
                "Démarrer la simulation"
            ]
        },

        {
            id: "mission-4",
            title: "Diagnostic de surcharge",
            level: "Intermédiaire",
            description:
                "Identifiez une charge dépassant le calibre de protection.",
            objective:
                "Détecter une surcharge et identifier la protection concernée.",
            steps: [
                "Installer un disjoncteur 16 A",
                "Installer une charge importante",
                "Alimenter le circuit",
                "Observer le courant",
                "Identifier le déclenchement",
                "Lancer le diagnostic"
            ]
        },

        {
            id: "mission-5",
            title: "Défaut Phase-Terre",
            level: "Avancé",
            description:
                "Analysez un défaut d'isolement entre la phase et la terre.",
            objective:
                "Identifier la fuite vers la terre et la réaction différentielle.",
            steps: [
                "Construire le circuit",
                "Relier le conducteur de protection",
                "Activer le défaut Phase-Terre",
                "Démarrer la simulation",
                "Observer le différentiel",
                "Lancer le diagnostic"
            ]
        },

        {
            id: "mission-6",
            title: "Continuité et conducteur coupé",
            level: "Intermédiaire",
            description:
                "Utilisez le multimètre pour localiser un conducteur interrompu.",
            objective:
                "Identifier une rupture de continuité.",
            steps: [
                "Construire un circuit",
                "Sélectionner le mode continuité",
                "Tester le circuit",
                "Activer un conducteur coupé",
                "Tester à nouveau",
                "Localiser la rupture"
            ]
        },

        {
            id: "mission-7",
            title: "Moteur monophasé",
            level: "Avancé",
            description:
                "Réalisez l'alimentation protégée d'un moteur monophasé.",
            objective:
                "Alimenter le moteur avec protection et terre.",
            steps: [
                "Ajouter la source",
                "Ajouter la protection",
                "Ajouter le moteur",
                "Connecter la phase",
                "Connecter le neutre",
                "Connecter la terre",
                "Démarrer la simulation",
                "Vérifier les mesures"
            ]
        }
    ];

    /* =========================================================
       6. JOURNAL
    ========================================================= */

    function log(message, type = "info") {
        state.logs.unshift({
            id: uid("log"),
            time: new Date().toLocaleTimeString("fr-FR"),
            message,
            type
        });

        if (state.logs.length > 100) {
            state.logs.length = 100;
        }

        renderConsole();
    }

    /* =========================================================
       7. NOTIFICATIONS
    ========================================================= */

    function toast(message, type = "info") {
        const container = byId("toastContainer");

        if (!container) return;

        const item = document.createElement("div");

        item.className = `fobas-toast fobas-toast-${type}`;

        item.textContent = message;

        container.appendChild(item);

        requestAnimationFrame(() => {
            item.classList.add("show");
        });

        setTimeout(() => {
            item.classList.remove("show");

            setTimeout(() => {
                item.remove();
            }, 250);
        }, 3000);
    }

    /* =========================================================
       8. CRÉATION DE COMPOSANTS
    ========================================================= */

    function createComponent(type, x = 250, y = 180) {
        const definition = TYPES[type];

        if (!definition) {
            toast("Type de composant inconnu.", "danger");
            return null;
        }

        const component = {
            id: uid(type),

            type,

            name: definition.label,

            x,

            y,

            rotation: 0,

            resistance:
                definition.defaultResistance ??
                100,

            power:
                definition.defaultPower ??
                0,

            rating:
                definition.defaultRating ??
                CONFIG.defaultBreakerRating,

            rcdRating:
                type === "rcd"
                    ? CONFIG.defaultRcdRating
                    : 30,

            state:
                type === "switch" ||
                type === "twoWaySwitch"
                    ? "open"
                    : "on",

            terminals:
                definition.terminals.map(name => ({
                    name
                })),

            selected: false
        };

        state.components.push(component);

        log(`Composant ajouté : ${definition.label}.`, "success");

        renderAll();

        return component;
    }

    function addComponent(type) {
        const offset =
            state.components.length * 18;

        return createComponent(
            type,
            180 + (offset % 360),
            150 + (offset % 240)
        );
    }

    function deleteComponent(id) {
        const component =
            state.components.find(c => c.id === id);

        if (!component) return;

        state.wires =
            state.wires.filter(
                wire =>
                    wire.from.componentId !== id &&
                    wire.to.componentId !== id
            );

        state.components =
            state.components.filter(
                c => c.id !== id
            );

        if (state.selectedComponentId === id) {
            state.selectedComponentId = null;
        }

        log(
            `Composant supprimé : ${component.name}.`,
            "warning"
        );

        renderAll();
    }

    /* =========================================================
       9. TOPOLOGIE
    ========================================================= */

    function terminalKey(componentId, terminal) {
        return `${componentId}:${terminal}`;
    }

    function getComponent(id) {
        return state.components.find(
            component => component.id === id
        );
    }

    function getTerminal(componentId, terminalName) {
        const component = getComponent(componentId);

        if (!component) return null;

        return {
            componentId,
            terminal: terminalName,
            key: terminalKey(componentId, terminalName)
        };
    }

    function hasWireBetween(a, b) {
        return state.wires.some(wire => {
            const direct =
                wire.from.key === a.key &&
                wire.to.key === b.key;

            const reverse =
                wire.from.key === b.key &&
                wire.to.key === a.key;

            return direct || reverse;
        });
    }

    function createWire(from, to, gauge = "2.5 mm²") {
        if (!from || !to) return null;

        if (from.key === to.key) {
            toast(
                "Impossible de connecter une borne à elle-même.",
                "warning"
            );
            return null;
        }

        if (hasWireBetween(from, to)) {
            toast("Cette connexion existe déjà.", "warning");
            return null;
        }

        const wire = {
            id: uid("wire"),

            from: {
                componentId: from.componentId,
                terminal: from.terminal,
                key: from.key
            },

            to: {
                componentId: to.componentId,
                terminal: to.terminal,
                key: to.key
            },

            gauge,

            continuity: true,

            resistance: CONFIG.wireResistance
        };

        state.wires.push(wire);

        log(
            `Connexion créée : ${from.terminal} → ${to.terminal}.`,
            "success"
        );

        calculate();
        renderAll();

        return wire;
    }

    function deleteWire(id) {
        const wire =
            state.wires.find(w => w.id === id);

        if (!wire) return;

        state.wires =
            state.wires.filter(w => w.id !== id);

        if (state.selectedWireId === id) {
            state.selectedWireId = null;
        }

        log("Conducteur supprimé.", "warning");

        calculate();
        renderAll();
    }

    function neighbors(key) {
        const result = [];

        for (const wire of state.wires) {
            if (!wire.continuity) continue;

            if (wire.from.key === key) {
                result.push(wire.to.key);
            }

            if (wire.to.key === key) {
                result.push(wire.from.key);
            }
        }

        return result;
    }

    function reachable(startKey) {
        const visited = new Set();

        const queue = [startKey];

        while (queue.length) {
            const current = queue.shift();

            if (visited.has(current)) continue;

            visited.add(current);

            for (const next of neighbors(current)) {
                if (!visited.has(next)) {
                    queue.push(next);
                }
            }
        }

        return visited;
    }

    function connected(a, b) {
        if (!a || !b) return false;

        return reachable(a.key).has(b.key);
    }

    function connectedToType(component, type, terminalName) {
        if (!component) return false;

        const terminal =
            terminalName ||
            TYPES[component.type]?.terminals?.[0];

        if (!terminal) return false;

        const start =
            terminalKey(component.id, terminal);

        const nodes = reachable(start);

        return state.components.some(c => {
            if (c.type !== type) return false;

            return TYPES[type].terminals.some(t =>
                nodes.has(terminalKey(c.id, t))
            );
        });
    }

    function findSource() {
        return state.components.find(
            c => c.type === "source"
        );
    }

    function findNeutralNode() {
        const source = findSource();

        if (!source) return null;

        return terminalKey(source.id, "N");
    }

    function findPhaseNode() {
        const source = findSource();

        if (!source) return null;

        return terminalKey(source.id, "L");
    }

    function findEarthNode() {
        const earth =
            state.components.find(
                c => c.type === "earthBus"
            ) ||
            state.components.find(
                c => c.type === "ground"
            );

        if (!earth) return null;

        return terminalKey(
            earth.id,
            TYPES[earth.type].terminals[0]
        );
    }

    /* =========================================================
       10. ÉTAT DES INTERRUPTEURS
    ========================================================= */

    function isComponentClosed(component) {
        if (!component) return false;

        if (
            component.type === "switch" ||
            component.type === "twoWaySwitch"
        ) {
            return component.state === "closed";
        }

        return true;
    }

    function isBreakerClosed(component) {
        if (!component) return false;

        if (component.type !== "breaker") {
            return true;
        }

        return (
            component.state !== "tripped" &&
            component.state !== "off"
        );
    }

    function findBreakers() {
        return state.components.filter(
            c => c.type === "breaker"
        );
    }

    function findRCDs() {
        return state.components.filter(
            c => c.type === "rcd"
        );
    }

    /* =========================================================
       11. CALCUL ÉLECTRIQUE
    ========================================================= */

    function calculate() {
        const source = findSource();

        if (!source) {
            state.measurements.voltage = 0;
            state.measurements.current = 0;
            state.measurements.power = 0;
            state.measurements.resistance = Infinity;
            state.measurements.continuity = false;
            state.measurements.leakage = 0;

            updateProtectionState();

            return state.measurements;
        }

        const voltage = state.voltage;

        let totalPower = 0;

        let energizedLoads = [];

        const phaseNodes =
            reachable(
                terminalKey(source.id, "L")
            );

        const neutralNodes =
            reachable(
                terminalKey(source.id, "N")
            );

        for (const component of state.components) {
            if (
                ![
                    "lamp",
                    "outlet",
                    "resistor",
                    "motor"
                ].includes(component.type)
            ) {
                continue;
            }

            const terminals =
                TYPES[component.type].terminals;

            if (!terminals.includes("L") ||
                !terminals.includes("N")) {
                continue;
            }

            const lKey =
                terminalKey(component.id, "L");

            const nKey =
                terminalKey(component.id, "N");

            const phaseConnected =
                phaseNodes.has(lKey);

            const neutralConnected =
                neutralNodes.has(nKey);

            const energized =
                phaseConnected &&
                neutralConnected &&
                state.running &&
                !state.trips.main &&
                !state.trips.rcd;

            if (energized) {
                const power =
                    Number(component.power) || 0;

                totalPower += power;

                energizedLoads.push({
                    component,
                    power
                });
            }
        }

        let current =
            voltage > 0
                ? totalPower / voltage
                : 0;

        if (state.faults.shortCircuit) {
            current = 999;
        }

        if (state.faults.earthFault) {
            state.measurements.leakage =
                Math.min(500, voltage / 0.5);
        } else {
            state.measurements.leakage = 0;
        }

        if (state.faults.overload) {
            current = Math.max(
                current,
                30
            );
        }

        const resistance =
            current > 0
                ? voltage / current
                : Infinity;

        state.measurements.voltage =
            energizedLoads.length > 0
                ? voltage
                : 0;

        state.measurements.current =
            round(current, 3);

        state.measurements.power =
            round(totalPower, 1);

        state.measurements.resistance =
            resistance === Infinity
                ? Infinity
                : round(resistance, 2);

        state.measurements.continuity =
            calculateGlobalContinuity();

        updateProtectionState();

        return state.measurements;
    }

    function calculateGlobalContinuity() {
        const source = findSource();

        if (!source) return false;

        const phase =
            terminalKey(source.id, "L");

        const neutral =
            terminalKey(source.id, "N");

        if (state.faults.openConductor) {
            return false;
        }

        const phaseNodes =
            reachable(phase);

        const neutralNodes =
            reachable(neutral);

        return (
            phaseNodes.size > 1 &&
            neutralNodes.size > 1
        );
    }

    /* =========================================================
       12. PROTECTIONS
    ========================================================= */

    function updateProtectionState() {
        const current =
            state.measurements.current;

        const breakers =
            findBreakers();

        let mainBreaker =
            breakers[0] || null;

        if (mainBreaker) {
            const rating =
                Number(mainBreaker.rating) || 16;

            if (
                state.faults.shortCircuit ||
                current > rating * 1.15 ||
                state.faults.overload
            ) {
                state.trips.main = true;
                mainBreaker.state = "tripped";
            }
        }

        const rcd =
            findRCDs()[0] || null;

        if (rcd) {
            if (
                state.faults.earthFault ||
                state.measurements.leakage >
                    Number(rcd.rcdRating || 30) / 1000
            ) {
                state.trips.rcd = true;
                rcd.state = "tripped";
            }
        }
    }

    function resetProtections() {
        state.trips.main = false;
        state.trips.rcd = false;

        state.trips.lighting = false;
        state.trips.outlet = false;
        state.trips.heating = false;
        state.trips.motor = false;

        for (const component of state.components) {
            if (
                component.type === "breaker" ||
                component.type === "rcd"
            ) {
                component.state = "on";
            }
        }

        log("Protections réarmées.", "success");

        calculate();
        renderAll();
    }

    /* =========================================================
       13. SVG
    ========================================================= */

    function svgNS() {
        return "http://www.w3.org/2000/svg";
    }

    function svgElement(name, attributes = {}) {
        const element =
            document.createElementNS(
                svgNS(),
                name
            );

        for (const [key, value] of Object.entries(
            attributes
        )) {
            element.setAttribute(
                key,
                String(value)
            );
        }

        return element;
    }

    function componentPosition(component) {
        return {
            x: Number(component.x) || 0,
            y: Number(component.y) || 0
        };
    }

    function terminalPosition(component, terminal) {
        const { x, y } =
            componentPosition(component);

        const terminals =
            TYPES[component.type]?.terminals || [];

        const index =
            terminals.indexOf(terminal);

        if (index === -1) {
            return { x, y };
        }

        const count = terminals.length;

        if (count === 1) {
            return {
                x,
                y: y + 45
            };
        }

        if (count === 2) {
            return {
                x:
                    x +
                    (index === 0
                        ? -50
                        : 50),
                y
            };
        }

        return {
            x:
                x +
                (index === 0
                    ? -55
                    : index === 1
                    ? 0
                    : 55),
            y: y + 42
        };
    }

    function renderCircuit() {
        const svg =
            byId("circuitCanvas");

        if (!svg) return;

        const wiresLayer =
            byId("wiresLayer");

        const componentsLayer =
            byId("componentsLayer");

        const terminalsLayer =
            byId("terminalsLayer");

        if (!wiresLayer ||
            !componentsLayer ||
            !terminalsLayer) {
            return;
        }

        wiresLayer.innerHTML = "";
        componentsLayer.innerHTML = "";
        terminalsLayer.innerHTML = "";

        renderWires(wiresLayer);

        for (const component of state.components) {
            renderComponent(
                componentsLayer,
                terminalsLayer,
                component
            );
        }

        renderTemporaryWire();
        updateSVGTransform();
        updateEmptyCanvas();
    }

    function renderWires(layer) {
        for (const wire of state.wires) {
            const fromComponent =
                getComponent(
                    wire.from.componentId
                );

            const toComponent =
                getComponent(
                    wire.to.componentId
                );

            if (!fromComponent ||
                !toComponent) {
                continue;
            }

            const p1 =
                terminalPosition(
                    fromComponent,
                    wire.from.terminal
                );

            const p2 =
                terminalPosition(
                    toComponent,
                    wire.to.terminal
                );

            const selected =
                state.selectedWireId === wire.id;

            const line =
                svgElement("line", {
                    x1: p1.x,
                    y1: p1.y,
                    x2: p2.x,
                    y2: p2.y,
                    class:
                        `circuit-wire ${
                            selected
                                ? "selected"
                                : ""
                        } ${
                            wire.continuity
                                ? ""
                                : "broken"
                        }`,
                    "data-wire-id": wire.id
                });

            line.style.stroke =
                selected
                    ? CONFIG.colors.selected
                    : CONFIG.colors.wire;

            line.style.strokeWidth =
                selected ? "5" : "3";

            if (!wire.continuity) {
                line.setAttribute(
                    "stroke-dasharray",
                    "8 8"
                );
            }

            line.addEventListener(
                "click",
                event => {
                    event.stopPropagation();

                    if (state.tool === "delete") {
                        deleteWire(wire.id);
                        return;
                    }

                    state.selectedWireId = wire.id;
                    state.selectedComponentId = null;

                    renderInspector();
                    renderCircuit();
                }
            );

            layer.appendChild(line);
        }
    }

    function renderComponent(
        componentLayer,
        terminalsLayer,
        component
    ) {
        const group =
            svgElement("g", {
                class:
                    `circuit-component ${
                        state.selectedComponentId ===
                        component.id
                            ? "selected"
                            : ""
                    }`,
                "data-component-id":
                    component.id,
                transform:
                    `translate(${component.x},${component.y})`
            });

        const box =
            svgElement("rect", {
                x: -42,
                y: -28,
                width: 84,
                height: 56,
                rx: 10,
                class: "component-body"
            });

        const icon =
            svgElement("text", {
                x: 0,
                y: -2,
                "text-anchor": "middle",
                class: "component-icon"
            });

        icon.textContent =
            TYPES[component.type]?.icon || "?";

        const label =
            svgElement("text", {
                x: 0,
                y: 45,
                "text-anchor": "middle",
                class: "component-label"
            });

        label.textContent =
            component.name;

        group.appendChild(box);
        group.appendChild(icon);
        group.appendChild(label);

        group.addEventListener(
            "click",
            event => {
                event.stopPropagation();

                if (state.tool === "delete") {
                    deleteComponent(component.id);
                    return;
                }

                if (state.tool === "wire") {
                    startWireFromComponent(component);
                    return;
                }

                state.selectedComponentId =
                    component.id;

                state.selectedWireId = null;

                renderInspector();
                renderCircuit();
            }
        );

        componentLayer.appendChild(group);

        const terminals =
            TYPES[component.type]?.terminals || [];

        terminals.forEach(
            terminalName => {
                const local =
                    terminalPosition(
                        {
                            ...component,
                            x: 0,
                            y: 0
                        },
                        terminalName
                    );

                const circle =
                    svgElement("circle", {
                        cx:
                            component.x +
                            local.x,
                        cy:
                            component.y +
                            local.y,
                        r: 7,
                        class:
                            `component-terminal terminal-${terminalName}`,
                        "data-component-id":
                            component.id,
                        "data-terminal":
                            terminalName
                    });

                circle.addEventListener(
                    "click",
                    event => {
                        event.stopPropagation();

                        if (
                            state.tool ===
                            "wire"
                        ) {
                            selectTerminal(
                                component.id,
                                terminalName
                            );
                        }
                    }
                );

                terminalsLayer.appendChild(circle);
            }
        );
    }

    function startWireFromComponent(component) {
        const terminals =
            TYPES[component.type]?.terminals || [];

        if (!terminals.length) return;

        selectTerminal(
            component.id,
            terminals[0]
        );
    }

    function selectTerminal(
        componentId,
        terminalName
    ) {
        const point =
            getTerminal(
                componentId,
                terminalName
            );

        if (!point) return;

        if (!state.wireStart) {
            state.wireStart = point;

            toast(
                `Première borne sélectionnée : ${terminalName}.`,
                "info"
            );

            renderWireHelp();
            return;
        }

        createWire(
            state.wireStart,
            point
        );

        state.wireStart = null;

        renderWireHelp();
    }

    function renderTemporaryWire() {
        const layer =
            byId("temporaryWireLayer");

        if (!layer) return;

        layer.innerHTML = "";

        if (!state.wireStart) return;

        const component =
            getComponent(
                state.wireStart.componentId
            );

        if (!component) return;

        const p =
            terminalPosition(
                component,
                state.wireStart.terminal
            );

        const circle =
            svgElement("circle", {
                cx: p.x,
                cy: p.y,
                r: 10,
                class: "wire-start-marker"
            });

        layer.appendChild(circle);
    }

    function renderWireHelp() {
        const help =
            byId("canvasWireHelp");

        if (!help) return;

        if (state.tool === "wire") {
            help.classList.remove("hidden");
        } else {
            help.classList.add("hidden");
        }
    }

    function updateEmptyCanvas() {
        const message =
            byId("canvasEmptyMessage");

        if (!message) return;

        if (state.components.length === 0) {
            message.classList.remove("hidden");
        } else {
            message.classList.add("hidden");
        }
    }

    function updateSVGTransform() {
        const svg =
            byId("circuitCanvas");

        if (!svg) return;

        const group =
            svg.querySelector(
                ".simulation-transform-group"
            );

        if (!group) {
            const g =
                svgElement("g", {
                    class:
                        "simulation-transform-group"
                });

            while (svg.firstChild) {
                const child =
                    svg.firstChild;

                if (
                    child.id ===
                    "gridPattern"
                ) {
                    break;
                }

                svg.removeChild(child);
            }
        }
    }

    /* =========================================================
       14. INSPECTEUR
    ========================================================= */

    function renderInspector() {
        const component =
            getComponent(
                state.selectedComponentId
            );

        if (!component) {
            hide("inspectorContent");
            show("inspectorEmpty");
            renderWireInspector();
            return;
        }

        show("inspectorContent");
        hide("inspectorEmpty");
        hide("wireInspectorContent");

        text(
            "inspectorIcon",
            TYPES[component.type]?.icon || "⚡"
        );

        text(
            "inspectorTitle",
            component.name
        );

        text(
            "inspectorDescription",
            TYPES[component.type]?.description || ""
        );

        text(
            "inspectorId",
            component.id
        );

        text(
            "inspectorType",
            component.type
        );

        setValue(
            "inspectorX",
            Math.round(component.x)
        );

        setValue(
            "inspectorY",
            Math.round(component.y)
        );

        hide("resistanceProperty");
        hide("powerProperty");
        hide("breakerRatingProperty");
        hide("rcdRatingProperty");
        hide("switchProperty");
        hide("breakerStateProperty");

        if (
            component.type ===
            "resistor"
        ) {
            show("resistanceProperty");

            setValue(
                "inspectorResistance",
                component.resistance
            );
        }

        if (
            [
                "lamp",
                "outlet",
                "motor"
            ].includes(component.type)
        ) {
            show("powerProperty");

            setValue(
                "inspectorPower",
                component.power
            );
        }

        if (
            component.type ===
            "breaker"
        ) {
            show("breakerRatingProperty");
            show("breakerStateProperty");

            setValue(
                "inspectorBreakerRating",
                component.rating
            );

            setValue(
                "inspectorBreakerState",
                component.state
            );
        }

        if (
            component.type ===
            "rcd"
        ) {
            show("rcdRatingProperty");

            setValue(
                "inspectorRcdRating",
                component.rcdRating
            );
        }

        if (
            component.type ===
            "switch" ||
            component.type ===
            "twoWaySwitch"
        ) {
            show("switchProperty");

            setValue(
                "inspectorSwitchState",
                component.state
            );
        }

        renderWireInspector();
    }

    function renderWireInspector() {
        const wire =
            state.wires.find(
                w =>
                    w.id ===
                    state.selectedWireId
            );

        if (!wire) {
            hide("wireInspectorContent");
            return;
        }

        hide("inspectorContent");
        hide("inspectorEmpty");
        show("wireInspectorContent");

        text(
            "inspectorWireId",
            wire.id
        );

        text(
            "inspectorWireFrom",
            `${wire.from.componentId} / ${wire.from.terminal}`
        );

        text(
            "inspectorWireTo",
            `${wire.to.componentId} / ${wire.to.terminal}`
        );

        setValue(
            "inspectorWireGauge",
            wire.gauge
        );

        setValue(
            "inspectorWireContinuity",
            wire.continuity
                ? "true"
                : "false"
        );
    }

    function updateSelectedComponentProperty(
        property,
        value
    ) {
        const component =
            getComponent(
                state.selectedComponentId
            );

        if (!component) return;

        if (
            [
                "x",
                "y",
                "power",
                "resistance",
                "rating",
                "rcdRating"
            ].includes(property)
        ) {
            value = Number(value);
        }

        component[property] = value;

        calculate();
        renderAll();
    }

    /* =========================================================
       15. VUES
    ========================================================= */

    function setView(view) {
        state.activeView = view;

        $$(".nav-item").forEach(item => {
            item.classList.toggle(
                "active",
                item.dataset.view === view
            );
        });

        $$(".app-view").forEach(item => {
            item.classList.toggle(
                "active",
                item.id === `view-${view}`
            );
        });

        renderAll();
    }

    /* =========================================================
       16. OUTILS
    ========================================================= */

    function setTool(tool) {
        state.tool = tool;

        $$(".tool-button").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.tool === tool
            );
        });

        $$(".tool-large-card").forEach(card => {
            card.classList.toggle(
                "active",
                card.dataset.toolSelect === tool
            );
        });

        text(
            "toolModeLabel",
            toolLabel(tool)
        );

        if (tool !== "wire") {
            state.wireStart = null;
        }

        renderWireHelp();
        renderCircuit();
    }

    function toolLabel(tool) {
        const labels = {
            select: "Sélection",
            wire: "Câblage",
            delete: "Suppression",
            voltmeter: "Voltmètre",
            ammeter: "Ampèremètre",
            ohmmeter: "Ohmmètre",
            continuity: "Continuité"
        };

        return labels[tool] || tool;
    }

    /* =========================================================
       17. MULTIMÈTRE
    ========================================================= */

    function setMeterMode(mode) {
        state.meterMode = mode;

        $$(".meter-mode-button").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.meterMode === mode
            );
        });

        text(
            "multimeterMode",
            meterModeLabel(mode)
        );

        calculateMeter();

        toast(
            `Mode multimètre : ${meterModeLabel(mode)}.`,
            "info"
        );
    }

    function meterModeLabel(mode) {
        return {
            voltage: "Tension",
            current: "Courant",
            resistance: "Résistance",
            continuity: "Continuité"
        }[mode] || mode;
    }

    function calculateMeter() {
        calculate();

        let value = 0;
        let unit = "";

        switch (state.meterMode) {
            case "voltage":
                value =
                    state.measurements.voltage;
                unit = "V";
                break;

            case "current":
                value =
                    state.measurements.current;
                unit = "A";
                break;

            case "resistance":
                value =
                    state.measurements.resistance;

                unit =
                    value === Infinity
                        ? "OL"
                        : "Ω";
                break;

            case "continuity":
                value =
                    state.measurements.continuity
                        ? "BEEP"
                        : "OPEN";

                unit = "";
                break;
        }

        text(
            "multimeterValue",
            typeof value === "number"
                ? round(value, 3)
                : value
        );

        text(
            "multimeterUnit",
            unit
        );

        text(
            "multimeterDisplay",
            typeof value === "number"
                ? `${round(value, 3)} ${unit}`
                : value
        );
    }

    /* =========================================================
       18. TABLEAU ÉLECTRIQUE
    ========================================================= */

    function updatePanel() {
        const current =
            state.measurements.current;

        const power =
            state.measurements.power;

        const protection =
            state.trips.main
                ? "Disjoncteur déclenché"
                : state.trips.rcd
                ? "Différentiel déclenché"
                : "Protection normale";

        text(
            "mainBreakerStatus",
            state.trips.main
                ? "TRIPPED"
                : "ON"
        );

        text(
            "mainBreakerRating",
            `${getMainBreakerRating()} A`
        );

        text(
            "rcdStatus",
            state.trips.rcd
                ? "TRIPPED"
                : "ON"
        );

        text(
            "rcdSensitivity",
            `${getRcdRating()} mA`
        );

        text(
            "rcdFaultIndicator",
            state.faults.earthFault
                ? "DÉFAUT"
                : "OK"
        );

        text(
            "phaseBusState",
            state.trips.main
                ? "COUPÉ"
                : "ACTIF"
        );

        text(
            "neutralBusState",
            "ACTIF"
        );

        text(
            "earthBusState",
            "ACTIF"
        );

        text(
            "panelVoltage",
            `${round(state.voltage, 1)} V`
        );

        text(
            "panelCurrent",
            `${round(current, 3)} A`
        );

        text(
            "panelPower",
            `${round(power, 1)} W`
        );

        text(
            "panelProtectionState",
            protection
        );

        updateBranchBreaker(
            "lighting",
            state.trips.lighting
        );

        updateBranchBreaker(
            "outlet",
            state.trips.outlet
        );

        updateBranchBreaker(
            "heating",
            state.trips.heating
        );

        updateBranchBreaker(
            "motor",
            state.trips.motor
        );
    }

    function updateBranchBreaker(name, tripped) {
        text(
            `${name}BreakerIndicator`,
            tripped ? "●" : "●"
        );

        text(
            `${name}BreakerState`,
            tripped ? "TRIPPED" : "ON"
        );
    }

    function getMainBreakerRating() {
        const breaker =
            findBreakers()[0];

        return Number(
            breaker?.rating ||
            CONFIG.defaultBreakerRating
        );
    }

    function getRcdRating() {
        const rcd =
            findRCDs()[0];

        return Number(
            rcd?.rcdRating ||
            CONFIG.defaultRcdRating
        );
    }

    function toggleMainBreaker() {
        if (state.trips.main) {
            state.trips.main = false;

            const breaker =
                findBreakers()[0];

            if (breaker) {
                breaker.state = "on";
            }

            toast(
                "Disjoncteur principal réarmé.",
                "success"
            );
        } else {
            state.trips.main = true;

            const breaker =
                findBreakers()[0];

            if (breaker) {
                breaker.state = "tripped";
            }

            toast(
                "Disjoncteur principal ouvert.",
                "warning"
            );
        }

        calculate();
        renderAll();
    }

    /* =========================================================
       19. MESURES
    ========================================================= */

    function renderMeasurements() {
        calculate();

        text(
            "measureVoltage",
            `${round(state.measurements.voltage, 2)} V`
        );

        text(
            "measureCurrent",
            `${round(state.measurements.current, 3)} A`
        );

        text(
            "measureResistance",
            state.measurements.resistance === Infinity
                ? "∞ Ω"
                : `${round(
                    state.measurements.resistance,
                    2
                )} Ω`
        );

        text(
            "measurePower",
            `${round(state.measurements.power, 1)} W`
        );

        text(
            "measureCircuitState",
            state.running
                ? "Simulation active"
                : "Simulation arrêtée"
        );

        text(
            "measureContinuity",
            state.measurements.continuity
                ? "CONTINUE"
                : "OUVERTE"
        );

        text(
            "measureLeakage",
            `${round(
                state.measurements.leakage,
                3
            )} A`
        );

        renderMeasurementLog();
    }

    function renderMeasurementLog() {
        const container =
            byId("measurementLog");

        if (!container) return;

        const entries =
            state.logs.filter(
                entry =>
                    entry.type === "measurement"
            );

        if (!entries.length) {
            container.innerHTML =
                "<div>Aucune mesure enregistrée.</div>";

            return;
        }

        container.innerHTML =
            entries
                .slice(0, 20)
                .map(
                    entry =>
                        `<div class="measurement-log-entry">
                            <span>${escapeHTML(entry.time)}</span>
                            <strong>${escapeHTML(entry.message)}</strong>
                        </div>`
                )
                .join("");
    }

    /* =========================================================
       20. DIAGNOSTIC
    ========================================================= */

    function runDiagnostic() {
        calculate();

        const details = [];
        const procedure = [];

        let status = "ok";
        let title = "Circuit conforme";
        let summary =
            "Aucune anomalie critique détectée.";

        if (state.faults.shortCircuit) {
            status = "danger";

            title = "Court-circuit détecté";

            summary =
                "Une liaison anormale provoque une très forte surintensité.";

            details.push(
                "Présence d'un défaut Phase-Neutre."
            );

            procedure.push(
                "Mettre le circuit hors tension."
            );

            procedure.push(
                "Localiser la liaison directe entre phase et neutre."
            );

            procedure.push(
                "Supprimer le défaut avant réarmement."
            );
        } else if (state.faults.earthFault) {
            status = "warning";

            title = "Défaut Phase-Terre";

            summary =
                "Une fuite de courant vers le conducteur de protection est détectée.";

            details.push(
                "Le différentiel peut déclencher."
            );

            procedure.push(
                "Couper l'alimentation."
            );

            procedure.push(
                "Contrôler l'isolement du circuit."
            );

            procedure.push(
                "Identifier l'appareil en défaut."
            );
        } else if (
            state.faults.overload ||
            state.measurements.current >
                getMainBreakerRating()
        ) {
            status = "warning";

            title = "Surcharge détectée";

            summary =
                "Le courant demandé dépasse le calibre de protection.";

            details.push(
                `Courant mesuré : ${round(
                    state.measurements.current,
                    3
                )} A.`
            );

            details.push(
                `Calibre : ${getMainBreakerRating()} A.`
            );

            procedure.push(
                "Identifier les charges connectées."
            );

            procedure.push(
                "Réduire la puissance demandée."
            );

            procedure.push(
                "Vérifier le calibre du disjoncteur."
            );
        } else if (
            state.faults.openConductor
        ) {
            status = "warning";

            title = "Conducteur coupé";

            summary =
                "La continuité du circuit est interrompue.";

            details.push(
                "Le test de continuité indique une ouverture."
            );

            procedure.push(
                "Effectuer un test de continuité segment par segment."
            );

            procedure.push(
                "Localiser le conducteur interrompu."
            );
        } else if (
            state.components.length === 0
        ) {
            status = "warning";

            title = "Aucun circuit";

            summary =
                "Ajoutez des composants afin de construire un circuit.";
        }

        state.diagnostic = {
            status,
            title,
            summary,
            details,
            procedure
        };

        renderDiagnostic();

        log(
            `Diagnostic : ${title}.`,
            status === "danger"
                ? "danger"
                : status === "warning"
                ? "warning"
                : "success"
        );

        toast(
            title,
            status === "danger"
                ? "danger"
                : status === "warning"
                ? "warning"
                : "success"
        );
    }

    function renderDiagnostic() {
        text(
            "diagnosticTitle",
            state.diagnostic.title
        );

        text(
            "diagnosticSummary",
            state.diagnostic.summary
        );

        html(
            "diagnosticDetails",
            state.diagnostic.details.length
                ? state.diagnostic.details
                    .map(
                        item =>
                            `<div>• ${escapeHTML(item)}</div>`
                    )
                    .join("")
                : "<div>Aucun défaut critique.</div>"
        );

        html(
            "diagnosticProcedure",
            state.diagnostic.procedure.length
                ? state.diagnostic.procedure
                    .map(
                        (item, index) =>
                            `<div>
                                <strong>${index + 1}.</strong>
                                ${escapeHTML(item)}
                            </div>`
                    )
                    .join("")
                : "<div>Le circuit peut être vérifié normalement.</div>"
        );

        const icon =
            byId("diagnosticIcon");

        if (icon) {
            icon.textContent =
                state.diagnostic.status ===
                "danger"
                    ? "⚠️"
                    : state.diagnostic.status ===
                      "warning"
                    ? "🔎"
                    : "✓";
        }
    }

    /* =========================================================
       21. DÉFAUTS
    ========================================================= */

    function toggleFault(name) {
        if (
            !Object.prototype.hasOwnProperty.call(
                state.faults,
                name
            )
        ) {
            return;
        }

        state.faults[name] =
            !state.faults[name];

        log(
            `${name} : ${
                state.faults[name]
                    ? "ACTIVÉ"
                    : "DÉSACTIVÉ"
            }`,
            state.faults[name]
                ? "warning"
                : "info"
        );

        calculate();
        renderAll();
    }

    /* =========================================================
       22. MISSIONS
    ========================================================= */

    function renderMissionGrid() {
        const grid =
            byId("missionGrid");

        if (!grid) return;

        const filter =
            document.querySelector(
                ".mission-filter.active"
            )?.dataset.missionLevel ||
            "all";

        const missions =
            MISSIONS.filter(
                mission =>
                    filter === "all" ||
                    mission.level === filter
            );

        grid.innerHTML =
            missions
                .map(
                    mission => `
                    <button
                        class="mission-card"
                        type="button"
                        data-mission-id="${mission.id}">
                        <span class="mission-card-icon">⚡</span>
                        <strong>${escapeHTML(
                            mission.title
                        )}</strong>
                        <small>${escapeHTML(
                            mission.level
                        )}</small>
                        <p>${escapeHTML(
                            mission.description
                        )}</p>
                    </button>
                `
                )
                .join("");

        $$(".mission-card", grid).forEach(card => {
            card.addEventListener(
                "click",
                () =>
                    startMission(
                        card.dataset.missionId
                    )
            );
        });

        const progress =
            MISSIONS.filter(
                mission =>
                    localStorage.getItem(
                        `${APP_KEY}_${mission.id}_completed`
                    ) === "true"
            ).length;

        text(
            "missionProgressValue",
            `${progress}/${MISSIONS.length}`
        );
    }

    function startMission(id) {
        const mission =
            MISSIONS.find(
                item => item.id === id
            );

        if (!mission) return;

        state.mission = {
            activeId: id,
            level: mission.level,
            stepIndex: 0,
            score: 0,
            completed: false
        };

        show("missionWorkspace");

        text(
            "activeMissionTitle",
            mission.title
        );

        text(
            "activeMissionDescription",
            mission.description
        );

        text(
            "activeMissionObjective",
            mission.objective
        );

        text(
            "activeMissionLevel",
            mission.level
        );

        text(
            "activeMissionStepCount",
            `${mission.steps.length} étapes`
        );

        text(
            "activeMissionScore",
            "0"
        );

        text(
            "activeMissionState",
            "En cours"
        );

        renderMissionSteps();

        toast(
            `Mission ouverte : ${mission.title}.`,
            "info"
        );
    }

    function renderMissionSteps() {
        const container =
            byId("missionSteps");

        if (!container) return;

        const mission =
            MISSIONS.find(
                item =>
                    item.id ===
                    state.mission.activeId
            );

        if (!mission) return;

        container.innerHTML =
            mission.steps
                .map(
                    (step, index) => `
                    <div class="
                        mission-step
                        ${
                            index <
                            state.mission.stepIndex
                                ? "completed"
                                : ""
                        }
                        ${
                            index ===
                            state.mission.stepIndex
                                ? "current"
                                : ""
                        }">
                        <span>${index + 1}</span>
                        <strong>${escapeHTML(
                            step
                        )}</strong>
                    </div>
                `
                )
                .join("");
    }

    function validateMission() {
        const mission =
            MISSIONS.find(
                item =>
                    item.id ===
                    state.mission.activeId
            );

        if (!mission) {
            toast(
                "Aucune mission active.",
                "warning"
            );
            return;
        }

        const valid =
            evaluateMission(mission);

        if (!valid) {
            text(
                "missionFeedback",
                "Les conditions de cette étape ne sont pas encore satisfaites."
            );

            toast(
                "Étape non validée.",
                "warning"
            );

            return;
        }

        state.mission.score += 100;

        state.mission.stepIndex++;

        if (
            state.mission.stepIndex >=
            mission.steps.length
        ) {
            state.mission.completed = true;

            localStorage.setItem(
                `${APP_KEY}_${mission.id}_completed`,
                "true"
            );

            text(
                "activeMissionState",
                "Mission terminée"
            );

            text(
                "missionFeedback",
                "Mission réussie. Toutes les étapes ont été validées."
            );

            toast(
                "Mission réussie !",
                "success"
            );
        } else {
            text(
                "missionFeedback",
                "Étape validée. Continuez avec l'étape suivante."
            );

            toast(
                "Étape validée.",
                "success"
            );
        }

        text(
            "activeMissionScore",
            String(state.mission.score)
        );

        renderMissionSteps();
        renderMissionGrid();
    }

    function evaluateMission(mission) {
        const index =
            state.mission.stepIndex;

        const components =
            state.components;

        switch (mission.id) {
            case "mission-1":
                return evaluateMission1(
                    index,
                    components
                );

            case "mission-2":
                return evaluateMission2(
                    index,
                    components
                );

            case "mission-3":
                return evaluateMission3(
                    index,
                    components
                );

            case "mission-4":
                return evaluateMission4(
                    index
                );

            case "mission-5":
                return evaluateMission5(
                    index
                );

            case "mission-6":
                return evaluateMission6(
                    index
                );

            case "mission-7":
                return evaluateMission7(
                    index,
                    components
                );

            default:
                return false;
        }
    }

    function hasType(type) {
        return state.components.some(
            c => c.type === type
        );
    }

    function evaluateMission1(index, components) {
        switch (index) {
            case 0:
                return hasType("source");

            case 1:
                return hasType("breaker");

            case 2:
                return hasType("lamp");

            case 3:
                return hasPhasePath();

            case 4:
                return hasNeutralPath();

            case 5:
                return state.running;

            default:
                return false;
        }
    }

    function evaluateMission2(index) {
        switch (index) {
            case 0:
                return hasType("source");

            case 1:
                return hasType("breaker");

            case 2:
                return hasType("switch");

            case 3:
                return hasType("lamp");

            case 4:
                return hasPhasePath();

            case 5:
                return hasNeutralPath();

            case 6: {
                const sw =
                    state.components.find(
                        c => c.type === "switch"
                    );

                return sw?.state === "closed";
            }

            case 7:
                return (
                    state.running &&
                    state.measurements.power > 0
                );

            default:
                return false;
        }
    }

    function evaluateMission3(index) {
        switch (index) {
            case 0:
                return hasType("source");

            case 1:
                return hasType("breaker");

            case 2:
                return hasType("outlet");

            case 3:
                return hasPhasePath();

            case 4:
                return hasNeutralPath();

            case 5:
                return hasEarthPath();

            case 6:
                return state.running;

            default:
                return false;
        }
    }

    function evaluateMission4(index) {
        switch (index) {
            case 0:
                return (
                    getMainBreakerRating() ===
                    16
                );

            case 1:
                return (
                    state.measurements.power >
                    16 * state.voltage
                );

            case 2:
                return state.running;

            case 3:
                return (
                    state.measurements.current >
                    16
                );

            case 4:
                return state.trips.main;

            case 5:
                runDiagnostic();

                return (
                    state.diagnostic.title ===
                    "Surcharge détectée"
                );

            default:
                return false;
        }
    }

    function evaluateMission5(index) {
        switch (index) {
            case 0:
                return (
                    hasType("source") &&
                    hasType("breaker")
                );

            case 1:
                return hasEarthPath();

            case 2:
                return state.faults.earthFault;

            case 3:
                return state.running;

            case 4:
                return state.trips.rcd;

            case 5:
                runDiagnostic();

                return (
                    state.diagnostic.title ===
                    "Défaut Phase-Terre"
                );

            default:
                return false;
        }
    }

    function evaluateMission6(index) {
        switch (index) {
            case 0:
                return state.components.length >= 2;

            case 1:
                return (
                    state.meterMode ===
                    "continuity"
                );

            case 2:
                return true;

            case 3:
                return state.faults.openConductor;

            case 4:
                return (
                    !state.measurements.continuity
                );

            case 5:
                return (
                    !state.measurements.continuity
                );

            default:
                return false;
        }
    }

    function evaluateMission7(index) {
        switch (index) {
            case 0:
                return hasType("source");

            case 1:
                return hasType("breaker");

            case 2:
                return hasType("motor");

            case 3:
                return hasPhasePath();

            case 4:
                return hasNeutralPath();

            case 5:
                return hasEarthPath();

            case 6:
                return (
                    state.running &&
                    state.measurements.power > 0
                );

            case 7:
                return (
                    state.measurements.voltage >
                    0
                );

            default:
                return false;
        }
    }

    function hasPhasePath() {
        const source =
            findSource();

        if (!source) return false;

        const nodes =
            reachable(
                terminalKey(
                    source.id,
                    "L"
                )
            );

        return state.components.some(
            component => {
                if (
                    [
                        "source",
                        "ground",
                        "neutralBus",
                        "earthBus"
                    ].includes(component.type)
                ) {
                    return false;
                }

                return nodes.has(
                    terminalKey(
                        component.id,
                        TYPES[
                            component.type
                        ]?.terminals?.[0]
                    )
                );
            }
        );
    }

    function hasNeutralPath() {
        const source =
            findSource();

        if (!source) return false;

        const nodes =
            reachable(
                terminalKey(
                    source.id,
                    "N"
                )
            );

        return state.components.some(
            component =>
                ["lamp", "outlet", "resistor", "motor"]
                    .includes(component.type) &&
                nodes.has(
                    terminalKey(
                        component.id,
                        "N"
                    )
                )
        );
    }

    function hasEarthPath() {
        const earthNode =
            findEarthNode();

        if (!earthNode) return false;

        const nodes =
            reachable(earthNode);

        return state.components.some(
            component =>
                [
                    "outlet",
                    "motor"
                ].includes(component.type) &&
                nodes.has(
                    terminalKey(
                        component.id,
                        "PE"
                    )
                )
        );
    }

    /* =========================================================
       23. CONSOLE
    ========================================================= */

    function renderConsole() {
        const consoleElement =
            byId("topologyConsole");

        if (!consoleElement) return;

        consoleElement.innerHTML =
            state.logs
                .slice(0, 30)
                .map(
                    entry => `
                    <div class="console-line console-${escapeHTML(
                        entry.type
                    )}">
                        <span>[${escapeHTML(
                            entry.time
                        )}]</span>
                        ${escapeHTML(
                            entry.message
                        )}
                    </div>
                `
                )
                .join("");
    }

    /* =========================================================
       24. STATISTIQUES
    ========================================================= */

    function renderStats() {
        text(
            "componentCount",
            String(state.components.length)
        );

        text(
            "connectionCount",
            String(state.wires.length)
        );

        text(
            "currentValue",
            `${round(
                state.measurements.current,
                3
            )} A`
        );

        text(
            "powerValue",
            `${round(
                state.measurements.power,
                1
            )} W`
        );

        text(
            "sidebarVoltage",
            `${round(state.voltage, 1)} V`
        );

        text(
            "sidebarPhaseState",
            state.trips.main
                ? "Coupée"
                : "Active"
        );

        text(
            "sidebarNeutralState",
            "Active"
        );

        text(
            "sidebarEarthState",
            "Active"
        );

        text(
            "sidebarCircuitState",
            state.running
                ? "En marche"
                : "Arrêté"
        );

        text(
            "footerMode",
            toolLabel(state.tool)
        );

        text(
            "footerVoltage",
            `${round(state.voltage, 1)} V`
        );

        text(
            "footerTopologyState",
            state.components.length
                ? `${state.components.length} composants / ${state.wires.length} connexions`
                : "Circuit vide"
        );
    }

    /* =========================================================
       25. COMPOSANTS — VUE CATALOGUE
    ========================================================= */

    function renderLargeComponentGrid() {
        const grid =
            byId("largeComponentGrid");

        if (!grid) return;

        grid.innerHTML =
            Object.entries(TYPES)
                .map(
                    ([type, definition]) => `
                    <button
                        type="button"
                        class="large-component-card"
                        data-component="${type}">
                        <span class="large-component-icon">
                            ${definition.icon}
                        </span>
                        <strong>
                            ${escapeHTML(
                                definition.label
                            )}
                        </strong>
                        <small>
                            ${escapeHTML(
                                definition.description
                            )}
                        </small>
                    </button>
                `
                )
                .join("");

        $$(
            "[data-component]",
            grid
        ).forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    addComponent(
                        button.dataset.component
                    );

                    setView("laboratoire");
                }
            );
        });
    }

    /* =========================================================
       26. RECHERCHE COMPOSANTS
    ========================================================= */

    function filterComponentList(query) {
        const value =
            String(query || "")
                .trim()
                .toLowerCase();

        $(
            "#componentList"
        )?.querySelectorAll(
            "[data-component]"
        ).forEach(button => {
            const type =
                button.dataset.component;

            const label =
                TYPES[type]?.label || "";

            const visible =
                !value ||
                label
                    .toLowerCase()
                    .includes(value) ||
                type
                    .toLowerCase()
                    .includes(value);

            button.style.display =
                visible ? "" : "none";
        });
    }

    /* =========================================================
       27. MODALE COMPOSANT
    ========================================================= */

    let componentInfoType = null;

    function openComponentInfo(type) {
        const definition =
            TYPES[type];

        if (!definition) return;

        componentInfoType = type;

        text(
            "componentInfoIcon",
            definition.icon
        );

        text(
            "componentInfoTitle",
            definition.label
        );

        text(
            "componentInfoDescription",
            definition.description
        );

        text(
            "componentInfoTerminals",
            definition.terminals.join(" • ")
        );

        show("componentInfoModal");
    }

    function closeComponentInfo() {
        hide("componentInfoModal");

        componentInfoType = null;
    }

    function addComponentFromInfo() {
        if (!componentInfoType) return;

        addComponent(
            componentInfoType
        );

        closeComponentInfo();

        setView("laboratoire");
    }

    /* =========================================================
       28. SIMULATION
    ========================================================= */

    function runSimulation() {
        state.running = true;

        calculate();

        text(
            "simulationStatusText",
            "Simulation active"
        );

        const light =
            byId("simulationStatusLight");

        if (light) {
            light.classList.add("active");
        }

        log(
            "Simulation démarrée.",
            "success"
        );

        toast(
            "Simulation démarrée.",
            "success"
        );

        renderAll();
    }

    function stopSimulation() {
        state.running = false;

        text(
            "simulationStatusText",
            "Simulation arrêtée"
        );

        const light =
            byId("simulationStatusLight");

        if (light) {
            light.classList.remove("active");
        }

        log(
            "Simulation arrêtée.",
            "warning"
        );

        toast(
            "Simulation arrêtée.",
            "info"
        );

        renderAll();
    }

    /* =========================================================
       29. ZOOM
    ========================================================= */

    function changeZoom(delta) {
        state.zoom =
            clamp(
                round(
                    state.zoom + delta,
                    2
                ),
                CONFIG.minZoom,
                CONFIG.maxZoom
            );

        text(
            "zoomValue",
            `${Math.round(
                state.zoom * 100
            )}%`
        );

        const svg =
            byId("circuitCanvas");

        if (svg) {
            svg.style.transform =
                `scale(${state.zoom})`;
            svg.style.transformOrigin =
                "center center";
        }
    }

    function centerCircuit() {
        state.zoom = 1;

        text(
            "zoomValue",
            "100%"
        );

        const svg =
            byId("circuitCanvas");

        if (svg) {
            svg.style.transform =
                "scale(1)";
            svg.style.transformOrigin =
                "center center";
        }

        toast(
            "Vue du circuit recentrée.",
            "info"
        );
    }

    /* =========================================================
       30. SAUVEGARDE
    ========================================================= */

    function saveSimulation() {
        const data = {
            version: VERSION,
            state: {
                ...state,

                diagnostic: {
                    ...state.diagnostic
                },

                mission: {
                    ...state.mission
                }
            }
        };

        try {
            localStorage.setItem(
                APP_KEY,
                JSON.stringify(data)
            );

            log(
                "Simulation sauvegardée.",
                "success"
            );

            toast(
                "Simulation sauvegardée.",
                "success"
            );
        } catch (error) {
            console.error(error);

            toast(
                "Impossible de sauvegarder la simulation.",
                "danger"
            );
        }
    }

    function loadSimulation() {
        try {
            const raw =
                localStorage.getItem(
                    APP_KEY
                );

            if (!raw) return false;

            const data =
                JSON.parse(raw);

            if (!data?.state) {
                return false;
            }

            Object.assign(
                state,
                data.state
            );

            log(
                "Simulation restaurée.",
                "success"
            );

            renderAll();

            return true;
        } catch (error) {
            console.error(error);

            toast(
                "La sauvegarde est invalide.",
                "danger"
            );

            return false;
        }
    }

    /* =========================================================
       31. RESET
    ========================================================= */

    function openResetModal() {
        show("confirmationModal");
    }

    function closeResetModal() {
        hide("confirmationModal");
    }

    function resetSimulation() {
        state.running = false;

        state.voltage =
            CONFIG.defaultVoltage;

        state.tool = "select";

        state.meterMode = "voltage";

        state.zoom =
            CONFIG.defaultZoom;

        state.selectedComponentId = null;

        state.selectedWireId = null;

        state.wireStart = null;

        state.meterPointA = null;
        state.meterPointB = null;

        state.components = [];
        state.wires = [];

        state.faults = {
            shortCircuit: false,
            earthFault: false,
            overload: false,
            openConductor: false
        };

        state.trips = {
            main: false,
            rcd: false,
            lighting: false,
            outlet: false,
            heating: false,
            motor: false
        };

        state.measurements = {
            voltage: 0,
            current: 0,
            resistance: Infinity,
            power: 0,
            continuity: false,
            leakage: 0
        };

        state.diagnostic = {
            status: "unknown",
            title: "Diagnostic non exécuté",
            summary:
                "Lancez le diagnostic pour analyser le circuit.",
            details: [],
            procedure: []
        };

        state.logs = [];

        state.mission = {
            activeId: null,
            level: "Tous niveaux",
            stepIndex: 0,
            score: 0,
            completed: false
        };

        localStorage.removeItem(
            APP_KEY
        );

        closeResetModal();

        log(
            "Simulation réinitialisée.",
            "info"
        );

        toast(
            "Simulation réinitialisée.",
            "success"
        );

        setView("laboratoire");

        renderAll();
    }

    /* =========================================================
       32. VOLTAGE
    ========================================================= */

    function setVoltage(value) {
        const voltage =
            Number(value);

        if (!Number.isFinite(voltage)) {
            return;
        }

        state.voltage =
            clamp(
                voltage,
                CONFIG.minVoltage,
                CONFIG.maxVoltage
            );

        const selector =
            byId("voltageSelector");

        if (
            selector &&
            selector.value !==
                String(state.voltage)
        ) {
            selector.value =
                String(state.voltage);
        }

        calculate();

        log(
            `Tension réglée à ${state.voltage} V.`,
            "info"
        );

        renderAll();
    }

    /* =========================================================
       33. EVENTS
    ========================================================= */

    function bindNavigation() {
        $$(".nav-item").forEach(item => {
            item.addEventListener(
                "click",
                () =>
                    setView(
                        item.dataset.view
                    )
            );
        });
    }

    function bindToolbar() {
        $$(
            ".tool-button"
        ).forEach(button => {
            button.addEventListener(
                "click",
                () =>
                    setTool(
                        button.dataset.tool
                    )
            );
        });

        byId("voltageSelector")
            ?.addEventListener(
                "change",
                event =>
                    setVoltage(
                        event.target.value
                    )
            );

        byId("runSimulationBtn")
            ?.addEventListener(
                "click",
                runSimulation
            );

        byId("stopSimulationBtn")
            ?.addEventListener(
                "click",
                stopSimulation
            );
    }

    function bindHeader() {
        byId("saveSimulationBtn")
            ?.addEventListener(
                "click",
                saveSimulation
            );

        byId("resetSimulationBtn")
            ?.addEventListener(
                "click",
                openResetModal
            );

        byId("cancelResetBtn")
            ?.addEventListener(
                "click",
                closeResetModal
            );

        byId("confirmResetBtn")
            ?.addEventListener(
                "click",
                resetSimulation
            );
    }

    function bindComponentButtons() {
        $$(
            "#componentList [data-component]"
        ).forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    addComponent(
                        button.dataset.component
                    );
                }
            );

            button.addEventListener(
                "contextmenu",
                event => {
                    event.preventDefault();

                    openComponentInfo(
                        button.dataset.component
                    );
                }
            );
        });

        $$("#largeComponentGrid [data-component]")
            .forEach(button => {
                button.addEventListener(
                    "contextmenu",
                    event => {
                        event.preventDefault();

                        openComponentInfo(
                            button.dataset.component
                        );
                    }
                );
            });
    }

    function bindSearch() {
        byId("componentSearch")
            ?.addEventListener(
                "input",
                event =>
                    filterComponentList(
                        event.target.value
                    )
            );
    }

    function bindInspector() {
        const bindings = {
            inspectorX: "x",
            inspectorY: "y",
            inspectorResistance:
                "resistance",
            inspectorPower: "power",
            inspectorBreakerRating:
                "rating",
            inspectorRcdRating:
                "rcdRating",
            inspectorSwitchState:
                "state",
            inspectorBreakerState:
                "state"
        };

        for (
            const [id, property]
            of Object.entries(bindings)
        ) {
            byId(id)?.addEventListener(
                "change",
                event =>
                    updateSelectedComponentProperty(
                        property,
                        event.target.value
                    )
            );
        }

        byId("deleteSelectedBtn")
            ?.addEventListener(
                "click",
                () => {
                    if (
                        state.selectedComponentId
                    ) {
                        deleteComponent(
                            state.selectedComponentId
                        );
                    }
                }
            );

        byId("deleteSelectedWireBtn")
            ?.addEventListener(
                "click",
                () => {
                    if (
                        state.selectedWireId
                    ) {
                        deleteWire(
                            state.selectedWireId
                        );
                    }
                }
            );

        byId("inspectorWireGauge")
            ?.addEventListener(
                "change",
                event => {
                    const wire =
                        state.wires.find(
                            w =>
                                w.id ===
                                state.selectedWireId
                        );

                    if (!wire) return;

                    wire.gauge =
                        event.target.value;

                    renderAll();
                }
            );

        byId("inspectorWireContinuity")
            ?.addEventListener(
                "change",
                event => {
                    const wire =
                        state.wires.find(
                            w =>
                                w.id ===
                                state.selectedWireId
                        );

                    if (!wire) return;

                    wire.continuity =
                        event.target.value ===
                        "true";

                    calculate();
                    renderAll();
                }
            );
    }

    function bindToolsView() {
        $$(".tool-large-card").forEach(card => {
            card.addEventListener(
                "click",
                () => {
                    setTool(
                        card.dataset.toolSelect
                    );

                    if (
                        card.dataset.toolSelect ===
                        "voltmeter"
                    ) {
                        setMeterMode(
                            "voltage"
                        );
                    }

                    if (
                        card.dataset.toolSelect ===
                        "ammeter"
                    ) {
                        setMeterMode(
                            "current"
                        );
                    }

                    if (
                        card.dataset.toolSelect ===
                        "ohmmeter"
                    ) {
                        setMeterMode(
                            "resistance"
                        );
                    }

                    if (
                        card.dataset.toolSelect ===
                        "continuity"
                    ) {
                        setMeterMode(
                            "continuity"
                        );
                    }
                }
            );
        });

        $$(".meter-mode-button")
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () =>
                        setMeterMode(
                            button.dataset.meterMode
                        )
                );
            });
    }

    function bindPanel() {
        byId("mainBreakerToggle")
            ?.addEventListener(
                "click",
                toggleMainBreaker
            );
    }

    function bindMeasurements() {
        const measurementCards = [
            "measureVoltage",
            "measureCurrent",
            "measureResistance",
            "measurePower",
            "measureCircuitState",
            "measureContinuity",
            "measureLeakage"
        ];

        measurementCards.forEach(id => {
            byId(id)?.addEventListener(
                "click",
                () => {
                    calculateMeter();

                    state.logs.unshift({
                        id: uid("measurement"),
                        time:
                            new Date()
                                .toLocaleTimeString(
                                    "fr-FR"
                                ),
                        message:
                            `${id} : mesure consultée`,
                        type: "measurement"
                    });

                    renderMeasurementLog();
                }
            );
        });
    }

    function bindDiagnostic() {
        byId("runDiagnosticBtn")
            ?.addEventListener(
                "click",
                runDiagnostic
            );
    }

    function bindMissionFilters() {
        $$(".mission-filter")
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        $$(".mission-filter")
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        renderMissionGrid();
                    }
                );
            });
    }

    function bindMissions() {
        byId("validateMissionBtn")
            ?.addEventListener(
                "click",
                validateMission
            );

        byId("missionResetCircuitBtn")
            ?.addEventListener(
                "click",
                () => {
                    resetCircuitForMission();
                }
            );

        byId("closeMissionBtn")
            ?.addEventListener(
                "click",
                () => {
                    state.mission.activeId =
                        null;

                    hide("missionWorkspace");

                    renderMissionGrid();
                }
            );

        bindMissionFilters();
    }

    function resetCircuitForMission() {
        state.components = [];
        state.wires = [];

        state.running = false;

        state.trips.main = false;
        state.trips.rcd = false;

        state.faults = {
            shortCircuit: false,
            earthFault: false,
            overload: false,
            openConductor: false
        };

        state.selectedComponentId = null;
        state.selectedWireId = null;

        state.wireStart = null;

        calculate();

        renderAll();

        toast(
            "Circuit de mission réinitialisé.",
            "info"
        );
    }

    function bindCanvas() {
        const svg =
            byId("circuitCanvas");

        if (!svg) return;

        svg.addEventListener(
            "click",
            event => {
                if (
                    event.target === svg
                ) {
                    state.selectedComponentId =
                        null;

                    state.selectedWireId =
                        null;

                    renderInspector();
                    renderCircuit();
                }
            }
        );
    }

    function bindZoom() {
        byId("zoomOutBtn")
            ?.addEventListener(
                "click",
                () => changeZoom(-0.1)
            );

        byId("zoomInBtn")
            ?.addEventListener(
                "click",
                () => changeZoom(0.1)
            );

        byId("centerCircuitBtn")
            ?.addEventListener(
                "click",
                centerCircuit
            );
    }

    function bindComponentInfo() {
        byId("closeComponentInfoBtn")
            ?.addEventListener(
                "click",
                closeComponentInfo
            );

        byId("addComponentFromInfoBtn")
            ?.addEventListener(
                "click",
                addComponentFromInfo
            );
    }

    /* =========================================================
       34. RACCOURCIS CLAVIER
    ========================================================= */

    function bindKeyboard() {
        document.addEventListener(
            "keydown",
            event => {
                if (
                    event.target.matches(
                        "input, select, textarea"
                    )
                ) {
                    return;
                }

                switch (
                    event.key.toLowerCase()
                ) {
                    case "v":
                        setTool("select");
                        break;

                    case "w":
                        setTool("wire");
                        break;

                    case "delete":
                    case "backspace":
                        if (
                            state.selectedComponentId
                        ) {
                            deleteComponent(
                                state.selectedComponentId
                            );
                        } else if (
                            state.selectedWireId
                        ) {
                            deleteWire(
                                state.selectedWireId
                            );
                        }
                        break;

                    case "+":
                        changeZoom(0.1);
                        break;

                    case "-":
                        changeZoom(-0.1);
                        break;

                    case "escape":
                        state.wireStart =
                            null;

                        state.selectedComponentId =
                            null;

                        state.selectedWireId =
                            null;

                        renderInspector();
                        renderCircuit();
                        break;
                }
            }
        );
    }

    /* =========================================================
       35. RENDU GLOBAL
    ========================================================= */

    function renderAll() {
        calculate();

        renderCircuit();

        renderInspector();

        renderStats();

        renderMeasurements();

        renderDiagnostic();

        renderConsole();

        renderMissionGrid();

        updatePanel();

        calculateMeter();

        renderWireHelp();

        text(
            "zoomValue",
            `${Math.round(
                state.zoom * 100
            )}%`
        );

        const selector =
            byId("voltageSelector");

        if (selector) {
            selector.value =
                String(state.voltage);
        }

        $$(".tool-button").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.tool ===
                    state.tool
            );
        });

        $$(".meter-mode-button")
            .forEach(button => {
                button.classList.toggle(
                    "active",
                    button.dataset.meterMode ===
                        state.meterMode
                );
            });
    }

    /* =========================================================
       36. BOUCLE DE SIMULATION
    ========================================================= */

    let simulationTimer = null;

    function startSimulationLoop() {
        if (simulationTimer) {
            clearInterval(
                simulationTimer
            );
        }

        simulationTimer =
            setInterval(() => {
                if (!state.running) return;

                calculate();

                renderStats();

                updatePanel();

                renderMeasurements();

                calculateMeter();

                if (
                    state.faults.shortCircuit ||
                    state.faults.earthFault ||
                    state.faults.overload
                ) {
                    renderDiagnostic();
                }
            }, CONFIG.simulationInterval);
    }

    /* =========================================================
       37. INITIALISATION D'UN CIRCUIT EXEMPLE
    ========================================================= */

    function createInitialCircuit() {
        if (state.components.length) {
            return;
        }

        const source =
            createComponent(
                "source",
                120,
                220
            );

        const breaker =
            createComponent(
                "breaker",
                280,
                180
            );

        const rcd =
            createComponent(
                "rcd",
                430,
                180
            );

        const switchComponent =
            createComponent(
                "switch",
                580,
                180
            );

        const lamp =
            createComponent(
                "lamp",
                730,
                180
            );

        const neutralBus =
            createComponent(
                "neutralBus",
                430,
                330
            );

        if (
            source &&
            breaker &&
            rcd &&
            switchComponent &&
            lamp &&
            neutralBus
        ) {
            createWire(
                getTerminal(
                    source.id,
                    "L"
                ),
                getTerminal(
                    breaker.id,
                    "L_IN"
                )
            );

            createWire(
                getTerminal(
                    breaker.id,
                    "L_OUT"
                ),
                getTerminal(
                    rcd.id,
                    "L_IN"
                )
            );

            createWire(
                getTerminal(
                    rcd.id,
                    "L_OUT"
                ),
                getTerminal(
                    switchComponent.id,
                    "L_IN"
                )
            );

            createWire(
                getTerminal(
                    switchComponent.id,
                    "L_OUT"
                ),
                getTerminal(
                    lamp.id,
                    "L"
                )
            );

            createWire(
                getTerminal(
                    source.id,
                    "N"
                ),
                getTerminal(
                    rcd.id,
                    "N_IN"
                )
            );

            createWire(
                getTerminal(
                    rcd.id,
                    "N_OUT"
                ),
                getTerminal(
                    neutralBus.id,
                    "N"
                )
            );

            createWire(
                getTerminal(
                    neutralBus.id,
                    "N"
                ),
                getTerminal(
                    lamp.id,
                    "N"
                )
            );

            switchComponent.state =
                "closed";

            log(
                "Circuit de démonstration créé.",
                "success"
            );
        }
    }

    /* =========================================================
       38. API GLOBALE DE DEBUG
    ========================================================= */

    window.FOBASElectricite = {
        version: VERSION,

        state,

        types: TYPES,

        missions: MISSIONS,

        addComponent,

        createComponent,

        deleteComponent,

        createWire,

        deleteWire,

        runSimulation,

        stopSimulation,

        resetSimulation,

        saveSimulation,

        loadSimulation,

        runDiagnostic,

        calculate,

        toggleFault,

        setTool,

        setMeterMode,

        setVoltage,

        resetProtections,

        startMission,

        validateMission,

        renderAll
    };

    /* =========================================================
       39. INITIALISATION
    ========================================================= */

    function init() {
        bindNavigation();

        bindToolbar();

        bindHeader();

        bindComponentButtons();

        bindSearch();

        bindInspector();

        bindToolsView();

        bindPanel();

        bindMeasurements();

        bindDiagnostic();

        bindMissions();

        bindCanvas();

        bindZoom();

        bindComponentInfo();

        bindKeyboard();

        renderLargeComponentGrid();

        setTool("select");

        setMeterMode("voltage");

        if (!loadSimulation()) {
            renderAll();
        }

        startSimulationLoop();

        log(
            `SIMULATION ÉLECTRICITÉ FOBAS ${VERSION} initialisée.`,
            "success"
        );

        renderAll();
    }

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