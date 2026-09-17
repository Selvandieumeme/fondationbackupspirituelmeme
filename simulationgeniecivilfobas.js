/* ================================================================
   FOBAS — LABORATOIRE GÉNIE CIVIL
   ---------------------------------------------------------------
   FICHIER : simulationgeniecivilfobas.js
   VERSION : 1.0.0 — CIVIL ENGINEERING SIMULATION CORE

   OBJECTIFS :
   - Connexion complète avec simulationgeniecivilfobas.html
   - Gestion des matériaux
   - Bibliothèque des matériaux
   - Drag & Drop
   - Transfert vers recipient01
   - Mesures
   - Dosage béton / mortier
   - Mélange
   - Validation des proportions
   - Réaction
   - Résultat
   - Rapport
   - Zoom
   - Sauvegarde / restauration
   - Reset
   - Notifications
   - Compatibilité mobile / tablette / ordinateur

   IMPORTANT :
   - Aucun Three.js
   - Aucun framework externe
   - Ne remplace pas le HTML
   - Ne remplace pas le CSS
   - Travaille uniquement avec les éléments existants
================================================================ */


/* ================================================================
   01 — IDENTITÉ DU MOTEUR
================================================================ */

(() => {

    "use strict";

    const ENGINE_NAME = "FOBAS Civil Engineering Simulation Engine";
    const ENGINE_VERSION = "1.0.0";

    const STORAGE_KEY = "FOBAS_CIVIL_ENGINE_STATE";

    window.FOBAS_CIVIL_ENGINE = {
        name: ENGINE_NAME,
        version: ENGINE_VERSION,
        ready: false
    };


/* ================================================================
   02 — ÉTAT CENTRAL
================================================================ */

    const defaultState = {

        version: ENGINE_VERSION,

        zoom: 1,

        activeTool: "select",

        selectedObjectId: null,

        selectedMaterialId: null,

        transferSource: null,

        workspaceObjects: [],

        inventory: {},

        recipient: {

            id: "recipient01",

            name: "Récipient principal",

            capacity: 100,

            unit: "L",

            contents: {},

            totalMass: 0,

            totalVolume: 0,

            mixed: false,

            heated: false,

            reaction: null,

            result: null

        },

        measurement: {

            label: "Aucune mesure",

            value: 0,

            unit: "",

            precision: "—"

        },

        dosage: {

            mixType: "béton",

            cementBags: 1,

            cementKg: 50,

            sandKg: 0,

            gravelKg: 0,

            waterL: 0,

            ratio: null,

            valid: false

        },

        reaction: {

            state: "idle",

            status: "Aucune réaction",

            phase: "—",

            gas: "Non",

            precipitate: "Non",

            color: "—"

        },

        result: {

            state: "idle",

            title: "Aucun résultat",

            message: "Aucune expérience terminée.",

            details: [],

            mixState: "—",

            dosageState: "—",

            reactionState: "—",

            finalState: "—"

        },

        report: {

            generated: false,

            content: ""

        },

        observations: [],

        sessionName: "Laboratoire Génie Civil FOBAS",

        timestamp: Date.now()

    };


    let state = loadState() || deepClone(defaultState);

    window.FOBAS_CIVIL_STATE = state;


/* ================================================================
   03 — MATÉRIAUX GÉNIE CIVIL
================================================================ */

    const MATERIALS = [

        {
            id: "cement",
            name: "Ciment",
            category: "Liants",
            unit: "kg",
            density: 1440,
            color: "#8d9298",
            icon: "🧱",
            description: "Liant hydraulique utilisé pour le béton et le mortier."
        },

        {
            id: "sand",
            name: "Sable",
            category: "Granulats",
            unit: "kg",
            density: 1600,
            color: "#d8b56b",
            icon: "🏖️",
            description: "Granulat fin utilisé dans les mortiers et bétons."
        },

        {
            id: "fine-sand",
            name: "Sable fin",
            category: "Granulats",
            unit: "kg",
            density: 1500,
            color: "#e2c17c",
            icon: "🏖️",
            description: "Sable à granulométrie fine."
        },

        {
            id: "medium-sand",
            name: "Sable moyen",
            category: "Granulats",
            unit: "kg",
            density: 1550,
            color: "#d4ad62",
            icon: "🏖️",
            description: "Sable à granulométrie moyenne."
        },

        {
            id: "coarse-sand",
            name: "Sable grossier",
            category: "Granulats",
            unit: "kg",
            density: 1650,
            color: "#bd954e",
            icon: "🏖️",
            description: "Sable à granulométrie grossière."
        },

        {
            id: "gravel",
            name: "Gravier",
            category: "Granulats",
            unit: "kg",
            density: 1500,
            color: "#747474",
            icon: "🪨",
            description: "Granulat grossier destiné principalement au béton."
        },

        {
            id: "stone",
            name: "Pierre",
            category: "Granulats",
            unit: "kg",
            density: 1600,
            color: "#686868",
            icon: "🪨",
            description: "Pierre concassée ou granulat rocheux."
        },

        {
            id: "water",
            name: "Eau",
            category: "Liquides",
            unit: "L",
            density: 1000,
            color: "#4da6ff",
            icon: "💧",
            description: "Eau utilisée pour l'hydratation du ciment."
        },

        {
            id: "earth",
            name: "Terre",
            category: "Sols",
            unit: "kg",
            density: 1500,
            color: "#8b6240",
            icon: "🌍",
            description: "Sol naturel destiné aux études géotechniques."
        },

        {
            id: "clay",
            name: "Argile",
            category: "Sols",
            unit: "kg",
            density: 1700,
            color: "#a66a4c",
            icon: "🟤",
            description: "Sol fin à forte plasticité."
        },

        {
            id: "silt",
            name: "Limon",
            category: "Sols",
            unit: "kg",
            density: 1500,
            color: "#aa8d68",
            icon: "🟫",
            description: "Sol fin intermédiaire entre sable et argile."
        },

        {
            id: "steel-bar",
            name: "Barre d'acier",
            category: "Acier & Ferraillage",
            unit: "kg",
            density: 7850,
            color: "#626970",
            icon: "🔩",
            description: "Acier utilisé pour le ferraillage du béton armé."
        },

        {
            id: "steel-wire",
            name: "Fil d'acier",
            category: "Acier & Ferraillage",
            unit: "kg",
            density: 7850,
            color: "#777e86",
            icon: "〰️",
            description: "Fil d'attache utilisé pour les armatures."
        },

        {
            id: "brick",
            name: "Brique",
            category: "Maçonnerie",
            unit: "kg",
            density: 1800,
            color: "#b85c42",
            icon: "🧱",
            description: "Élément de maçonnerie en terre cuite."
        },

        {
            id: "concrete-block",
            name: "Bloc de béton",
            category: "Maçonnerie",
            unit: "kg",
            density: 1400,
            color: "#9b9b9b",
            icon: "▰",
            description: "Bloc utilisé pour les murs et cloisons."
        },

        {
            id: "wood",
            name: "Bois",
            category: "Charpente & Coffrage",
            unit: "kg",
            density: 600,
            color: "#9b633c",
            icon: "🪵",
            description: "Matériau utilisé notamment pour coffrage et charpente."
        },

        {
            id: "glass",
            name: "Verre",
            category: "Finition",
            unit: "kg",
            density: 2500,
            color: "#9adcf5",
            icon: "🪟",
            description: "Matériau verrier pour applications de construction."
        },

        {
            id: "bitumen",
            name: "Bitume",
            category: "Routes & Étanchéité",
            unit: "kg",
            density: 1050,
            color: "#222222",
            icon: "⬛",
            description: "Liant bitumineux utilisé dans les travaux routiers."
        }

    ];

    window.FOBAS_CIVIL_MATERIALS = MATERIALS;


/* ================================================================
   04 — ÉQUIPEMENTS
================================================================ */

    const EQUIPMENT = [

        {
            id: "balance",
            name: "Balance",
            category: "Mesure",
            icon: "⚖️"
        },

        {
            id: "graduated-cylinder",
            name: "Éprouvette graduée",
            category: "Mesure",
            icon: "🧪"
        },

        {
            id: "bucket",
            name: "Seau",
            category: "Manutention",
            icon: "🪣"
        },

        {
            id: "mixer",
            name: "Bétonnière",
            category: "Mélange",
            icon: "🔄"
        }

    ];

    window.FOBAS_CIVIL_EQUIPMENT = EQUIPMENT;


/* ================================================================
   05 — UTILITAIRES DOM
================================================================ */

    const $ = id => document.getElementById(id);

    const $$ = selector =>
        Array.from(document.querySelectorAll(selector));


    function exists(id) {
        return !!$(id);
    }


    function setText(id, value) {

        const element = $(id);

        if (!element) return;

        element.textContent =
            value === undefined ||
            value === null
                ? ""
                : String(value);
    }


    function setHTML(id, value) {

        const element = $(id);

        if (!element) return;

        element.innerHTML = value || "";
    }


    function show(id, display = "") {

        const element = $(id);

        if (!element) return;

        element.hidden = false;
        element.style.display = display;
    }


    function hide(id) {

        const element = $(id);

        if (!element) return;

        element.hidden = true;
        element.style.display = "none";
    }


    function toggle(id, force) {

        const element = $(id);

        if (!element) return;

        const visible =
            force !== undefined
                ? force
                : element.hidden;

        if (visible) {
            show(id);
        } else {
            hide(id);
        }
    }


/* ================================================================
   06 — CLONAGE ÉTAT
================================================================ */

    function deepClone(value) {

        return JSON.parse(
            JSON.stringify(value)
        );

    }


/* ================================================================
   07 — SAUVEGARDE
================================================================ */

    function saveState() {

        state.timestamp = Date.now();

        window.FOBAS_CIVIL_STATE = state;

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state)
            );

        } catch (error) {

            console.warn(
                "FOBAS Civil: sauvegarde impossible",
                error
            );

        }

        updateFooterState();

    }


    function loadState() {

        try {

            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!raw) return null;

            const saved =
                JSON.parse(raw);

            return mergeState(
                deepClone(defaultState),
                saved
            );

        } catch (error) {

            console.warn(
                "FOBAS Civil: restauration impossible",
                error
            );

            return null;
        }

    }


    function mergeState(base, source) {

        if (!source || typeof source !== "object") {
            return base;
        }

        Object.keys(source).forEach(key => {

            if (
                source[key] &&
                typeof source[key] === "object" &&
                !Array.isArray(source[key]) &&
                base[key] &&
                typeof base[key] === "object"
            ) {

                base[key] =
                    mergeState(
                        base[key],
                        source[key]
                    );

            } else {

                base[key] = source[key];

            }

        });

        return base;

    }


/* ================================================================
   08 — NOTIFICATION
================================================================ */

    function notify(
        message,
        type = "info"
    ) {

        const stack =
            $("chemToastStack") ||
            $("civilToastStack");

        const live =
            $("chemLiveRegion") ||
            $("civilLiveRegion");

        if (live) {
            live.textContent = message;
        }

        if (!stack) {

            console.log(
                `[FOBAS CIVIL ${type}] ${message}`
            );

            return;
        }

        const toast =
            document.createElement("div");

        toast.className =
            `civil-toast civil-toast-${type}`;

        toast.textContent = message;

        stack.appendChild(toast);

        setTimeout(() => {

            toast.classList.add(
                "civil-toast-hide"
            );

            setTimeout(() => {
                toast.remove();
            }, 350);

        }, 3000);

    }


/* ================================================================
   09 — OBSERVATIONS
================================================================ */

    function addObservation(message) {

        state.observations.push({
            message,
            time: new Date().toLocaleTimeString()
        });

        if (
            state.observations.length > 100
        ) {
            state.observations.shift();
        }

        renderObservationLog();

    }


    function renderObservationLog() {

        const log =
            $("observationLog");

        if (!log) return;

        if (!state.observations.length) {

            log.innerHTML =
                "<div>Aucune observation.</div>";

            return;
        }

        log.innerHTML =
            state.observations
                .slice()
                .reverse()
                .map(item => `
                    <div class="civil-observation">
                        <span>${escapeHTML(item.time)}</span>
                        <strong>${escapeHTML(item.message)}</strong>
                    </div>
                `)
                .join("");

    }


/* ================================================================
   10 — ÉCHAPPEMENT HTML
================================================================ */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


/* ================================================================
   11 — BIBLIOTHÈQUE DES MATÉRIAUX
================================================================ */

    function renderMaterialLibrary() {

        const container =
            $("materialsLibrary");

        if (!container) return;

        const search =
            (
                $("materialSearch")?.value ||
                ""
            )
            .trim()
            .toLowerCase();

        const category =
            state.materialCategory ||
            "all";

        const materials =
            MATERIALS.filter(material => {

                const matchesSearch =
                    !search ||
                    material.name
                        .toLowerCase()
                        .includes(search) ||
                    material.category
                        .toLowerCase()
                        .includes(search);

                const matchesCategory =
                    category === "all" ||
                    material.category === category;

                return (
                    matchesSearch &&
                    matchesCategory
                );

            });

        container.innerHTML =
            materials.map(material => `

                <article
                    class="civil-material-card"
                    draggable="true"
                    data-material-id="${material.id}"
                    title="${escapeHTML(material.description)}"
                >

                    <div class="civil-material-icon">
                        ${material.icon}
                    </div>

                    <div class="civil-material-content">

                        <strong>
                            ${escapeHTML(material.name)}
                        </strong>

                        <span>
                            ${escapeHTML(material.category)}
                        </span>

                        <small>
                            ${escapeHTML(material.unit)}
                        </small>

                    </div>

                    <button
                        type="button"
                        class="civil-material-add"
                        data-add-material="${material.id}"
                    >
                        Ajouter
                    </button>

                </article>

            `).join("");

        bindMaterialCards();

        updateMaterialCount(
            materials.length
        );

    }


    function renderMaterialCategories() {

        const container =
            $("materialCategories");

        if (!container) return;

        const categories = [
            "all",
            ...new Set(
                MATERIALS.map(
                    material => material.category
                )
            )
        ];

        container.innerHTML =
            categories.map(category => {

                const label =
                    category === "all"
                        ? "Tous"
                        : category;

                const active =
                    (
                        state.materialCategory ||
                        "all"
                    ) === category;

                return `
                    <button
                        type="button"
                        class="civil-category-button ${active ? "active" : ""}"
                        data-material-category="${escapeHTML(category)}"
                    >
                        ${escapeHTML(label)}
                    </button>
                `;

            }).join("");

        $$("#materialCategories [data-material-category]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        state.materialCategory =
                            button.dataset.materialCategory;

                        renderMaterialCategories();
                        renderMaterialLibrary();

                    }
                );

            });

    }


    function updateMaterialCount(count) {

        setText(
            "materialCount",
            `${count} matériau${count > 1 ? "x" : ""}`
        );

    }


/* ================================================================
   12 — AJOUT MATÉRIAU À L'INVENTAIRE
================================================================ */

    function addMaterial(materialId) {

        const material =
            getMaterial(materialId);

        if (!material) return;

        if (
            !state.inventory[materialId]
        ) {

            state.inventory[materialId] = {
                id: material.id,
                name: material.name,
                quantity: 1,
                unit: material.unit
            };

        } else {

            state.inventory[materialId].quantity += 1;

        }

        addWorkspaceMaterial(
            materialId
        );

        addObservation(
            `${material.name} ajouté au laboratoire.`
        );

        notify(
            `${material.name} ajouté au laboratoire.`,
            "success"
        );

        renderInventory();
        saveState();

    }


/* ================================================================
   13 — RECHERCHE MATÉRIAU
================================================================ */

    function getMaterial(id) {

        return MATERIALS.find(
            material =>
                material.id === id
        );

    }


/* ================================================================
   14 — INVENTAIRE
================================================================ */

    function renderInventory() {

        const list =
            $("inventoryList");

        if (!list) return;

        const entries =
            Object.values(
                state.inventory
            );

        setText(
            "inventoryCount",
            entries.length
        );

        if (!entries.length) {

            list.innerHTML =
                "<div>Aucun matériau ajouté.</div>";

            return;
        }

        list.innerHTML =
            entries.map(item => `

                <div
                    class="civil-inventory-item"
                    data-inventory-material="${item.id}"
                >

                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>

                    <span>
                        ${formatNumber(item.quantity)}
                        ${escapeHTML(item.unit)}
                    </span>

                </div>

            `).join("");

    }


/* ================================================================
   15 — OBJET DU LABORATOIRE
================================================================ */

    function addWorkspaceMaterial(
        materialId,
        x = null,
        y = null
    ) {

        const material =
            getMaterial(materialId);

        if (!material) return null;

        const id =
            `civil-${materialId}-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 7)}`;

        const object = {

            id,

            type: "material",

            materialId,

            name: material.name,

            quantity: 1,

            unit: material.unit,

            x:
                x ??
                120 +
                Math.random() * 350,

            y:
                y ??
                100 +
                Math.random() * 250,

            createdAt: Date.now()

        };

        state.workspaceObjects.push(
            object
        );

        renderWorkspaceObjects();

        return object;

    }


/* ================================================================
   16 — RENDU WORKSPACE
================================================================ */

    function renderWorkspaceObjects() {

        const workspace =
            $("workspaceObjects");

        if (!workspace) return;

        workspace.innerHTML = "";

        state.workspaceObjects.forEach(
            object => {

                const material =
                    getMaterial(
                        object.materialId
                    );

                if (!material) return;

                const element =
                    document.createElement("div");

                element.className =
                    "civil-workspace-material";

                element.dataset.objectId =
                    object.id;

                element.draggable = true;

                element.style.left =
                    `${object.x}px`;

                element.style.top =
                    `${object.y}px`;

                element.innerHTML = `

                    <div
                        class="civil-object-icon"
                        style="background:${material.color}"
                    >
                        ${material.icon}
                    </div>

                    <div class="civil-object-label">
                        ${escapeHTML(material.name)}
                    </div>

                    <small>
                        ${formatNumber(object.quantity)}
                        ${escapeHTML(object.unit)}
                    </small>

                `;

                element.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        selectObject(
                            object.id
                        );

                    }
                );

                element.addEventListener(
                    "dragstart",
                    event => {

                        event.dataTransfer.setData(
                            "text/civil-object-id",
                            object.id
                        );

                        state.selectedObjectId =
                            object.id;

                    }
                );

                workspace.appendChild(
                    element
                );

            }
        );

    }


/* ================================================================
   17 — SÉLECTION OBJET
================================================================ */

    function selectObject(id) {

        state.selectedObjectId = id;

        const object =
            state.workspaceObjects.find(
                item => item.id === id
            );

        if (!object) return;

        const material =
            getMaterial(
                object.materialId
            );

        setText(
            "selectedObjectType",
            material?.name ||
            object.name
        );

        setText(
            "propName",
            material?.name ||
            object.name
        );

        setText(
            "propState",
            "Disponible"
        );

        setText(
            "propTemperature",
            "Ambiante"
        );

        setText(
            "propMass",
            `${formatNumber(object.quantity)} ${object.unit}`
        );

        setText(
            "propVolume",
            calculateObjectVolume(
                object
            ).toFixed(3) +
            " m³"
        );

        setText(
            "propDensity",
            material?.density
                ? `${material.density} kg/m³`
                : "—"
        );

        setText(
            "propPH",
            material?.id === "water"
                ? "7"
                : "—"
        );

        setText(
            "propColor",
            material?.color ||
            "—"
        );

        renderComposition();

    }


/* ================================================================
   18 — VOLUME OBJET
================================================================ */

    function calculateObjectVolume(
        object
    ) {

        const material =
            getMaterial(
                object.materialId
            );

        if (!material?.density) {
            return 0;
        }

        return (
            Number(object.quantity || 0) /
            material.density
        );

    }


/* ================================================================
   19 — COMPOSITION DU RÉCIPIENT
================================================================ */

    function renderComposition() {

        const recipient =
            state.recipient;

        const entries =
            Object.values(
                recipient.contents
            );

        const total =
            entries.reduce(
                (sum, item) =>
                    sum +
                    Number(item.quantity || 0),
                0
            );

        setText(
            "compositionTotal",
            `${formatNumber(total)} unités`
        );

        const list =
            $("compositionList");

        if (!list) return;

        if (!entries.length) {

            list.innerHTML =
                "<div>Récipient vide.</div>";

            updateRecipientStatus();

            return;
        }

        list.innerHTML =
            entries.map(item => `

                <div class="civil-composition-item">

                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>

                    <span>
                        ${formatNumber(item.quantity)}
                        ${escapeHTML(item.unit)}
                    </span>

                </div>

            `).join("");

        updateRecipientStatus();

    }


/* ================================================================
   20 — TRANSFERT MATÉRIAU
================================================================ */

    function openTransferModal(
        materialId,
        sourceObject = null
    ) {

        const material =
            getMaterial(materialId);

        if (!material) return;

        state.transferSource = {
            materialId,
            objectId:
                sourceObject?.id ||
                null,
            available:
                sourceObject
                    ? Number(
                        sourceObject.quantity
                    )
                    : Number(
                        state.inventory[materialId]
                            ?.quantity || 0
                    )
        };

        setText(
            "transferModalTitle",
            "Transfert de matériau"
        );

        setText(
            "transferMaterialName",
            material.name
        );

        setText(
            "transferSourceName",
            material.name
        );

        setText(
            "transferSourceAmount",
            `${formatNumber(
                state.transferSource.available
            )} ${material.unit}`
        );

        setText(
            "transferTarget",
            state.recipient.name
        );

        const input =
            $("transferAmount");

        const range =
            $("transferRange");

        const max =
            Math.max(
                0,
                state.transferSource.available
            );

        if (input) {

            input.value =
                max > 0
                    ? Math.min(
                        1,
                        max
                    )
                    : 0;

            input.max = max;

        }

        if (range) {

            range.min = 0;
            range.max = max;
            range.value =
                max > 0
                    ? Math.min(
                        1,
                        max
                    )
                    : 0;

        }

        setText(
            "transferMaxLabel",
            `Maximum : ${formatNumber(max)} ${material.unit}`
        );

        show(
            "transferModal",
            "flex"
        );

    }


    function closeTransferModal() {

        hide("transferModal");

        state.transferSource = null;

    }


    function confirmTransfer() {

        const source =
            state.transferSource;

        if (!source) {

            notify(
                "Aucun matériau sélectionné.",
                "warning"
            );

            return;
        }

        const material =
            getMaterial(
                source.materialId
            );

        if (!material) return;

        const input =
            $("transferAmount");

        let amount =
            Number(
                input?.value || 0
            );

        amount =
            Math.max(
                0,
                Math.min(
                    amount,
                    source.available
                )
            );

        if (amount <= 0) {

            notify(
                "La quantité doit être supérieure à zéro.",
                "warning"
            );

            return;
        }

        transferMaterialToRecipient(
            material.id,
            amount
        );

        if (source.objectId) {

            const object =
                state.workspaceObjects.find(
                    item =>
                        item.id ===
                        source.objectId
                );

            if (object) {

                object.quantity -= amount;

                if (object.quantity <= 0) {

                    state.workspaceObjects =
                        state.workspaceObjects.filter(
                            item =>
                                item.id !==
                                source.objectId
                        );

                }

            }

        } else {

            const inventory =
                state.inventory[
                    material.id
                ];

            if (inventory) {

                inventory.quantity -= amount;

                if (
                    inventory.quantity <= 0
                ) {

                    delete state.inventory[
                        material.id
                    ];

                }

            }

        }

        closeTransferModal();

        renderWorkspaceObjects();
        renderInventory();
        renderComposition();

        addObservation(
            `${formatNumber(amount)} ${material.unit} de ${material.name} transféré vers ${state.recipient.name}.`
        );

        notify(
            `${material.name} transféré avec succès.`,
            "success"
        );

        saveState();

    }


/* ================================================================
   21 — TRANSFERT DIRECT
================================================================ */

    function transferMaterialToRecipient(
        materialId,
        amount
    ) {

        const material =
            getMaterial(materialId);

        if (!material) return false;

        if (
            !state.recipient.contents[
                materialId
            ]
        ) {

            state.recipient.contents[
                materialId
            ] = {

                id: material.id,

                name: material.name,

                quantity: 0,

                unit: material.unit,

                density: material.density

            };

        }

        state.recipient.contents[
            materialId
        ].quantity +=
            Number(amount);

        state.recipient.totalMass =
            calculateRecipientMass();

        state.recipient.totalVolume =
            calculateRecipientVolume();

        return true;

    }


/* ================================================================
   22 — MASSE RÉCIPIENT
================================================================ */

    function calculateRecipientMass() {

        return Object.values(
            state.recipient.contents
        ).reduce(
            (sum, item) =>
                sum +
                Number(item.quantity || 0),
            0
        );

    }


/* ================================================================
   23 — VOLUME RÉCIPIENT
================================================================ */

    function calculateRecipientVolume() {

        return Object.values(
            state.recipient.contents
        ).reduce(
            (sum, item) => {

                const material =
                    getMaterial(
                        item.id
                    );

                if (!material?.density) {
                    return sum;
                }

                return sum +
                    (
                        Number(item.quantity || 0) /
                        material.density
                    );

            },
            0
        );

    }


/* ================================================================
   24 — ÉTAT RÉCIPIENT
================================================================ */

    function updateRecipientStatus() {

        const recipient =
            state.recipient;

        const entries =
            Object.values(
                recipient.contents
            );

        setText(
            "statusObjects",
            entries.length
        );

        setText(
            "statusMass",
            `${formatNumber(
                recipient.totalMass
            )} kg`
        );

        setText(
            "statusVolume",
            `${formatNumber(
                recipient.totalVolume * 1000
            )} L`
        );

        setText(
            "statusTemperature",
            recipient.heated
                ? "Élevée"
                : "Ambiante"
        );

        setText(
            "statusPH",
            calculateMixturePH()
        );

    }


/* ================================================================
   25 — PH SIMPLE
================================================================ */

    function calculateMixturePH() {

        const contents =
            state.recipient.contents;

        const hasWater =
            !!contents.water;

        const hasCement =
            !!contents.cement;

        if (
            !hasWater &&
            !hasCement
        ) {
            return "—";
        }

        if (
            hasWater &&
            Object.keys(contents).length === 1
        ) {
            return "7";
        }

        if (hasCement) {
            return "≈ 12–13";
        }

        return "≈ 7";

    }


/* ================================================================
   26 — MESURE
================================================================ */

    function measureRecipient() {

        const recipient =
            state.recipient;

        const mass =
            calculateRecipientMass();

        const volume =
            calculateRecipientVolume();

        state.measurement = {

            label: "Masse du récipient",

            value: mass,

            unit: "kg",

            precision: "± 0,01 kg"

        };

        if (mass <= 0) {

            state.measurement = {

                label: "Récipient vide",

                value: 0,

                unit: "kg",

                precision: "—"

            };

        }

        setText(
            "measurementLabel",
            state.measurement.label
        );

        setText(
            "measurementValue",
            formatNumber(
                state.measurement.value
            )
        );

        setText(
            "measurementPrecision",
            state.measurement.precision
        );

        show(
            "measurementModal",
            "flex"
        );

        setText(
            "instrumentScreenLabel",
            "Volume"
        );

        setText(
            "instrumentScreenValue",
            formatNumber(
                volume * 1000
            )
        );

        setText(
            "instrumentScreenUnit",
            "L"
        );

        addObservation(
            `Mesure : ${formatNumber(mass)} kg ; ${formatNumber(volume * 1000)} L.`
        );

        saveState();

    }


/* ================================================================
   27 — CALCUL DOSAGE
================================================================ */

    function calculateDosage() {

        const bagsInput =
            $("cementBagsInput");

        const mixTypeSelect =
            $("mixTypeSelect");

        let bags =
            Number(
                bagsInput?.value || 1
            );

        bags =
            Math.max(
                1,
                bags
            );

        const type =
            (
                mixTypeSelect?.value ||
                "béton"
            )
            .toLowerCase();

        const cementKg =
            bags * 50;

        let sandRatio;
        let gravelRatio;
        let waterRatio;

        if (
            type.includes("mortier")
        ) {

            /*
             * Mortier courant :
             * 1 volume ciment
             * 3 volumes sable
             *
             * Pour une approximation pratique
             * par masse :
             * sable ≈ 150 kg / sac
             * eau ≈ 25 L / sac
             */

            sandRatio = 150;
            gravelRatio = 0;
            waterRatio = 25;

        } else {

            /*
             * Béton courant :
             *
             * 1 sac ciment de 50 kg
             * ≈ 100 kg sable
             * ≈ 150 kg gravier
             * ≈ 25 L eau
             *
             * Les valeurs sont des valeurs
             * pratiques de simulation.
             */

            sandRatio = 100;
            gravelRatio = 150;
            waterRatio = 25;

        }

        const sandKg =
            bags * sandRatio;

        const gravelKg =
            bags * gravelRatio;

        const waterL =
            bags * waterRatio;

        state.dosage = {

            mixType:
                type.includes("mortier")
                    ? "mortier"
                    : "béton",

            cementBags:
                bags,

            cementKg,

            sandKg,

            gravelKg,

            waterL,

            ratio:
                type.includes("mortier")
                    ? "1 : 3"
                    : "1 : 2 : 3",

            valid: true

        };

        setText(
            "dosageCement",
            `${formatNumber(cementKg)} kg`
        );

        setText(
            "dosageSand",
            `${formatNumber(sandKg)} kg`
        );

        setText(
            "dosageGravel",
            gravelKg > 0
                ? `${formatNumber(gravelKg)} kg`
                : "—"
        );

        setText(
            "dosageWater",
            `${formatNumber(waterL)} L`
        );

        setText(
            "dosageStatusBadge",
            "Dosage calculé"
        );

        if ($("dosageResult")) {
            show(
                "dosageResult"
            );
        }

        addObservation(
            `Dosage ${state.dosage.mixType} calculé pour ${bags} sac(s) de ciment.`
        );

        notify(
            `Dosage calculé pour ${bags} sac(s).`,
            "success"
        );

        saveState();

    }


/* ================================================================
   28 — VALIDATION DES PROPORTIONS
================================================================ */

    function validateConcreteMix() {

        const contents =
            state.recipient.contents;

        const cement =
            Number(
                contents.cement?.quantity || 0
            );

        const sand =
            Number(
                contents.sand?.quantity || 0
            );

        const gravel =
            Number(
                contents.gravel?.quantity || 0
            );

        const water =
            Number(
                contents.water?.quantity || 0
            );

        if (cement <= 0) {

            return {

                valid: false,

                reason:
                    "Le mélange ne contient pas de ciment."

            };

        }

        if (sand <= 0) {

            return {

                valid: false,

                reason:
                    "Le mélange ne contient pas suffisamment de sable."

            };

        }

        const expectedSand =
            cement * 2;

        const expectedGravel =
            cement * 3;

        const expectedWater =
            cement * 0.5;

        const sandTolerance =
            expectedSand * 0.25;

        const gravelTolerance =
            expectedGravel * 0.25;

        const waterTolerance =
            expectedWater * 0.30;

        const sandOK =
            Math.abs(
                sand - expectedSand
            ) <= sandTolerance;

        const gravelOK =
            Math.abs(
                gravel - expectedGravel
            ) <= gravelTolerance;

        const waterOK =
            Math.abs(
                water - expectedWater
            ) <= waterTolerance;

        /*
         * Cas mortier :
         * ciment + sable + eau
         */
        const mortarExpectedSand =
            cement * 3;

        const mortarSandTolerance =
            mortarExpectedSand * 0.25;

        const mortarSandOK =
            Math.abs(
                sand -
                mortarExpectedSand
            ) <= mortarSandTolerance;

        const noGravel =
            gravel <= 0;

        const mortarWaterExpected =
            cement * 0.5;

        const mortarWaterOK =
            Math.abs(
                water -
                mortarWaterExpected
            ) <=
            mortarWaterExpected * 0.30;

        if (
            noGravel &&
            mortarSandOK &&
            mortarWaterOK
        ) {

            return {

                valid: true,

                type: "mortier",

                reason:
                    "Proportions compatibles avec un mortier courant."

            };

        }

        if (
            sandOK &&
            gravelOK &&
            waterOK
        ) {

            return {

                valid: true,

                type: "béton",

                reason:
                    "Proportions compatibles avec un béton courant."

            };

        }

        return {

            valid: false,

            reason:
                "Les proportions ciment/sable/gravier/eau ne correspondent pas au dosage attendu."

        };

    }


/* ================================================================
   29 — MÉLANGE
================================================================ */

    function mixRecipient() {

        const entries =
            Object.values(
                state.recipient.contents
            );

        if (!entries.length) {

            notify(
                "Le récipient est vide.",
                "warning"
            );

            return;

        }

        state.recipient.mixed = true;

        const validation =
            validateConcreteMix();

        if (validation.valid) {

            state.result.mixState =
                "Mélange conforme";

            notify(
                "Mélange effectué : proportions compatibles.",
                "success"
            );

            addObservation(
                "Mélange effectué avec proportions compatibles."
            );

        } else {

            state.result.mixState =
                "Mauvaise Melange";

            notify(
                "Mauvaise Melange",
                "error"
            );

            addObservation(
                `Mauvaise Melange — ${validation.reason}`
            );

        }

        renderReactionState();
        renderResult();
        saveState();

    }


/* ================================================================
   30 — RÉACTION
================================================================ */

    function runReaction() {

        if (
            !state.recipient.mixed
        ) {

            notify(
                "Vous devez d'abord effectuer le mélange.",
                "warning"
            );

            return;

        }

        const validation =
            validateConcreteMix();

        if (!validation.valid) {

            state.reaction = {

                state: "failed",

                status: "Mauvaise Melange",

                phase: "—",

                gas: "Non",

                precipitate: "Non",

                color: "Non déterminé"

            };

            state.result = {

                state: "failed",

                title: "Mauvaise Melange",

                message:
                    validation.reason,

                details: [
                    "Le dosage n'est pas conforme.",
                    "La réaction ne peut pas être appliquée."
                ],

                mixState:
                    "Mauvaise Melange",

                dosageState:
                    "Non conforme",

                reactionState:
                    "Refusée",

                finalState:
                    "Échec"

            };

            renderReactionState();
            renderResult();

            notify(
                "Mauvaise Melange — réaction refusée.",
                "error"
            );

            addObservation(
                "Réaction refusée : dosage incorrect."
            );

            saveState();

            return;

        }

        state.reaction = {

            state: "success",

            status: "Reaction reussie",

            phase: "Solide / pâte / béton frais",

            gas: "Non",

            precipitate: "Non",

            color: "Gris ciment"

        };

        state.recipient.reaction =
            "Reaction reussie";

        state.result = {

            state: "success",

            title: "Reaction reussie",

            message:
                `Le mélange ${validation.type} a été validé.`,

            details: [

                `Type : ${validation.type}`,

                `Ciment : ${formatNumber(
                    state.recipient.contents.cement?.quantity || 0
                )} kg`,

                `Sable : ${formatNumber(
                    state.recipient.contents.sand?.quantity || 0
                )} kg`,

                `Gravier : ${formatNumber(
                    state.recipient.contents.gravel?.quantity || 0
                )} kg`,

                `Eau : ${formatNumber(
                    state.recipient.contents.water?.quantity || 0
                )} L`,

                "Mélange validé.",

                "Réaction appliquée."

            ],

            mixState:
                "Mélange conforme",

            dosageState:
                "Conforme",

            reactionState:
                "Reaction reussie",

            finalState:
                "Réussi"

        };

        notify(
            "Reaction reussie",
            "success"
        );

        addObservation(
            "Reaction reussie : mélange validé."
        );

        renderReactionState();
        renderResult();

        saveState();

    }


/* ================================================================
   31 — AFFICHAGE RÉACTION
================================================================ */

    function renderReactionState() {

        setText(
            "reactionState",
            state.reaction.state
        );

        setText(
            "reactionStatus",
            state.reaction.status
        );

        setText(
            "reactionPhase",
            state.reaction.phase
        );

        setText(
            "reactionGas",
            state.reaction.gas
        );

        setText(
            "reactionPrecipitate",
            state.reaction.precipitate
        );

        setText(
            "reactionColor",
            state.reaction.color
        );

    }


/* ================================================================
   32 — RÉSULTAT
================================================================ */

    function renderResult() {

        setText(
            "resultState",
            state.result.state
        );

        setText(
            "resultTitle",
            state.result.title
        );

        setText(
            "resultMessage",
            state.result.message
        );

        setHTML(
            "resultDetails",
            state.result.details
                .map(
                    item =>
                        `<div>${escapeHTML(item)}</div>`
                )
                .join("")
        );

        setText(
            "resultMixState",
            state.result.mixState
        );

        setText(
            "resultDosageState",
            state.result.dosageState
        );

        setText(
            "resultReactionState",
            state.result.reactionState
        );

        setText(
            "resultFinalState",
            state.result.finalState
        );

    }


/* ================================================================
   33 — CHAUFFAGE
================================================================ */

    function heatRecipient() {

        const contents =
            Object.keys(
                state.recipient.contents
            );

        if (!contents.length) {

            notify(
                "Aucun matériau à chauffer.",
                "warning"
            );

            return;

        }

        state.recipient.heated = true;

        const overlay =
            $("temperatureOverlay");

        if (overlay) {

            overlay.classList.add(
                "active"
            );

        }

        setText(
            "statusTemperature",
            "Élevée"
        );

        addObservation(
            "Le récipient a été chauffé."
        );

        notify(
            "Chauffage appliqué au récipient.",
            "success"
        );

        saveState();

    }


/* ================================================================
   34 — SUPPRESSION OBJET
================================================================ */

    function removeSelectedObject() {

        const id =
            state.selectedObjectId;

        if (!id) {

            notify(
                "Aucun objet sélectionné.",
                "warning"
            );

            return;

        }

        state.workspaceObjects =
            state.workspaceObjects.filter(
                object =>
                    object.id !== id
            );

        state.selectedObjectId =
            null;

        renderWorkspaceObjects();

        addObservation(
            "Objet retiré du laboratoire."
        );

        notify(
            "Objet retiré.",
            "success"
        );

        saveState();

    }


/* ================================================================
   35 — NETTOYAGE WORKSPACE
================================================================ */

    function clearWorkspace() {

        state.workspaceObjects = [];

        state.selectedObjectId = null;

        renderWorkspaceObjects();

        addObservation(
            "Espace de travail nettoyé."
        );

        notify(
            "Espace de travail nettoyé.",
            "success"
        );

        saveState();

    }


/* ================================================================
   36 — RESET COMPLET
================================================================ */

    function resetSimulation() {

        state =
            deepClone(
                defaultState
            );

        window.FOBAS_CIVIL_STATE =
            state;

        try {

            localStorage.removeItem(
                STORAGE_KEY
            );

        } catch (error) {

            console.warn(error);

        }

        renderAll();

        notify(
            "Laboratoire réinitialisé.",
            "success"
        );

    }


/* ================================================================
   37 — ZOOM
================================================================ */

    function applyZoom() {

        const zoom =
            Number(
                state.zoom || 1
            );

        const app =
            $("civilApp") ||
            $("chemApp") ||
            document.body;

        if (app) {

            app.style.setProperty(
                "--civil-zoom",
                zoom
            );

        }

        setText(
            "zoomValue",
            `${Math.round(zoom * 100)}%`
        );

        setText(
            "footerZoomState",
            `${Math.round(zoom * 100)}%`
        );

        updateFooterState();

    }


    function zoomIn() {

        state.zoom =
            Math.min(
                1.5,
                Number(
                    (
                        state.zoom +
                        0.1
                    ).toFixed(2)
                )
            );

        applyZoom();
        saveState();

    }


    function zoomOut() {

        state.zoom =
            Math.max(
                0.7,
                Number(
                    (
                        state.zoom -
                        0.1
                    ).toFixed(2)
                )
            );

        applyZoom();
        saveState();

    }


    function fitWorkspace() {

        state.zoom = 1;

        applyZoom();

        notify(
            "Zoom réinitialisé à 100%.",
            "info"
        );

        saveState();

    }


/* ================================================================
   38 — NAVIGATION
================================================================ */

    function navigateTo(target) {

        const map = {

            laboratory:
                "laboratoryWorkspace",

            materials:
                "materialsPanel",

            tools:
                "laboratoryWorkspace",

            measure:
                "measurementSection",

            dosage:
                "dosageControls",

            reaction:
                "reactionSection",

            result:
                "resultWorkspace",

            report:
                "reportPanel"

        };

        const id =
            map[target];

        if (!id) return;

        const element =
            $(id);

        if (
            element &&
            typeof element.scrollIntoView ===
            "function"
        ) {

            element.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

        if (
            target === "materials"
        ) {

            show(
                "materialsPanel",
                "flex"
            );

        }

    }


/* ================================================================
   39 — RAPPORT
================================================================ */

    function generateReport() {

        const recipient =
            state.recipient;

        const composition =
            Object.values(
                recipient.contents
            );

        const lines = [

            "FOBAS — LABORATOIRE GÉNIE CIVIL",

            `Session : ${state.sessionName}`,

            `Date : ${new Date().toLocaleString()}`,

            "",

            "COMPOSITION",

            ...(
                composition.length
                    ? composition.map(
                        item =>
                            `- ${item.name} : ${formatNumber(item.quantity)} ${item.unit}`
                    )
                    : [
                        "- Récipient vide"
                    ]
            ),

            "",

            "DOSAGE",

            `Type : ${state.dosage.mixType}`,

            `Ciment : ${formatNumber(state.dosage.cementKg)} kg`,

            `Sable : ${formatNumber(state.dosage.sandKg)} kg`,

            `Gravier : ${formatNumber(state.dosage.gravelKg)} kg`,

            `Eau : ${formatNumber(state.dosage.waterL)} L`,

            "",

            "RÉACTION",

            `État : ${state.reaction.status}`,

            `Phase : ${state.reaction.phase}`,

            `Gaz : ${state.reaction.gas}`,

            `Précipité : ${state.reaction.precipitate}`,

            "",

            "RÉSULTAT",

            state.result.title,

            state.result.message

        ];

        state.report = {

            generated: true,

            content:
                lines.join("\n")

        };

        setText(
            "reportContent",
            state.report.content
        );

        show(
            "reportPanel"
        );

        notify(
            "Rapport généré.",
            "success"
        );

        saveState();

    }


    function clearReport() {

        state.report = {

            generated: false,

            content: ""

        };

        setText(
            "reportContent",
            ""
        );

        notify(
            "Rapport supprimé.",
            "info"
        );

        saveState();

    }


/* ================================================================
   40 — DRAG & DROP WORKSPACE
================================================================ */

    function setupWorkspaceDrop() {

        const dropZone =
            $("workspaceDropZone");

        if (!dropZone) return;

        dropZone.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                dropZone.classList.add(
                    "drag-over"
                );

            }
        );

        dropZone.addEventListener(
            "dragleave",
            () => {

                dropZone.classList.remove(
                    "drag-over"
                );

            }
        );

        dropZone.addEventListener(
            "drop",
            event => {

                event.preventDefault();

                dropZone.classList.remove(
                    "drag-over"
                );

                const materialId =
                    event.dataTransfer.getData(
                        "text/material-id"
                    );

                const objectId =
                    event.dataTransfer.getData(
                        "text/civil-object-id"
                    );

                const rect =
                    dropZone.getBoundingClientRect();

                const x =
                    event.clientX -
                    rect.left;

                const y =
                    event.clientY -
                    rect.top;

                if (materialId) {

                    addWorkspaceMaterial(
                        materialId,
                        x,
                        y
                    );

                    notify(
                        "Matériau placé dans le laboratoire.",
                        "success"
                    );

                    return;

                }

                if (objectId) {

                    const object =
                        state.workspaceObjects.find(
                            item =>
                                item.id ===
                                objectId
                        );

                    if (object) {

                        object.x = x;
                        object.y = y;

                        renderWorkspaceObjects();

                        saveState();

                    }

                }

            }
        );

    }


/* ================================================================
   41 — CARTES MATÉRIAUX DRAGGABLES
================================================================ */

    function bindMaterialCards() {

        $$("#materialsLibrary [data-material-id]")
            .forEach(card => {

                card.addEventListener(
                    "dragstart",
                    event => {

                        event.dataTransfer.setData(
                            "text/material-id",
                            card.dataset.materialId
                        );

                    }
                );

            });

        $$("[data-add-material]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        addMaterial(
                            button.dataset.addMaterial
                        );

                    }
                );

            });

    }


/* ================================================================
   42 — OUTILS
================================================================ */

    function setTool(tool) {

        state.activeTool =
            tool;

        $$(".tool-button[data-tool]")
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.tool ===
                    tool
                );

            });

        switch (tool) {

            case "transfer":

                if (
                    state.selectedObjectId
                ) {

                    const object =
                        state.workspaceObjects.find(
                            item =>
                                item.id ===
                                state.selectedObjectId
                        );

                    if (object) {

                        openTransferModal(
                            object.materialId,
                            object
                        );

                    }

                } else {

                    notify(
                        "Sélectionnez un matériau à transférer.",
                        "warning"
                    );

                }

                break;


            case "mix":

                mixRecipient();

                break;


            case "react":

                runReaction();

                break;


            case "measure":

                measureRecipient();

                break;


            case "heat":

                heatRecipient();

                break;


            case "move":

                notify(
                    "Mode déplacement activé.",
                    "info"
                );

                break;


            case "select":

            default:

                notify(
                    "Mode sélection activé.",
                    "info"
                );

                break;

        }

        saveState();

    }


/* ================================================================
   43 — ÉVÉNEMENTS PRINCIPAUX
================================================================ */

    function bindEvents() {

        /* --------------------------------------------------------
           MATÉRIAUX
        -------------------------------------------------------- */

        $("openMaterialsBtn")
            ?.addEventListener(
                "click",
                () => {

                    show(
                        "materialsPanel",
                        "flex"
                    );

                    renderMaterialCategories();
                    renderMaterialLibrary();

                }
            );


        $("closeMaterialsBtn")
            ?.addEventListener(
                "click",
                () => {

                    hide(
                        "materialsPanel"
                    );

                }
            );


        $("materialsBackdrop")
            ?.addEventListener(
                "click",
                () => {

                    hide(
                        "materialsPanel"
                    );

                }
            );


        $("materialSearch")
            ?.addEventListener(
                "input",
                renderMaterialLibrary
            );


        /* --------------------------------------------------------
           ZOOM
        -------------------------------------------------------- */

        $("zoomInBtn")
            ?.addEventListener(
                "click",
                zoomIn
            );


        $("zoomOutBtn")
            ?.addEventListener(
                "click",
                zoomOut
            );


        $("fitWorkspaceBtn")
            ?.addEventListener(
                "click",
                fitWorkspace
            );


        /* --------------------------------------------------------
           NETTOYAGE
        -------------------------------------------------------- */

        $("clearWorkspaceBtn")
            ?.addEventListener(
                "click",
                clearWorkspace
            );


        $("chemResetBtn")
            ?.addEventListener(
                "click",
                resetSimulation
            );


        $("civilResetBtn")
            ?.addEventListener(
                "click",
                resetSimulation
            );


        /* --------------------------------------------------------
           DOSAGE
        -------------------------------------------------------- */

        $("calculateDosageBtn")
            ?.addEventListener(
                "click",
                calculateDosage
            );


        $("cementBagsInput")
            ?.addEventListener(
                "change",
                calculateDosage
            );


        $("mixTypeSelect")
            ?.addEventListener(
                "change",
                calculateDosage
            );


        /* --------------------------------------------------------
           ACTIONS OBJET
        -------------------------------------------------------- */

        $("actionTransferBtn")
            ?.addEventListener(
                "click",
                () => {

                    const object =
                        state.workspaceObjects.find(
                            item =>
                                item.id ===
                                state.selectedObjectId
                        );

                    if (!object) {

                        notify(
                            "Sélectionnez un matériau.",
                            "warning"
                        );

                        return;

                    }

                    openTransferModal(
                        object.materialId,
                        object
                    );

                }
            );


        $("actionMixBtn")
            ?.addEventListener(
                "click",
                mixRecipient
            );


        $("actionMeasureBtn")
            ?.addEventListener(
                "click",
                measureRecipient
            );


        $("actionHeatBtn")
            ?.addEventListener(
                "click",
                heatRecipient
            );


        $("actionRemoveBtn")
            ?.addEventListener(
                "click",
                removeSelectedObject
            );


        /* --------------------------------------------------------
           MODAL TRANSFERT
        -------------------------------------------------------- */

        $("closeTransferModal")
            ?.addEventListener(
                "click",
                closeTransferModal
            );


        $("cancelTransferBtn")
            ?.addEventListener(
                "click",
                closeTransferModal
            );


        $("confirmTransferBtn")
            ?.addEventListener(
                "click",
                confirmTransfer
            );


        $("transferRange")
            ?.addEventListener(
                "input",
                event => {

                    setText(
                        "transferAmount",
                        event.target.value
                    );

                    const input =
                        $("transferAmount");

                    if (input) {
                        input.value =
                            event.target.value;
                    }

                }
            );


        $("transferAmount")
            ?.addEventListener(
                "input",
                event => {

                    const range =
                        $("transferRange");

                    if (range) {

                        range.value =
                            event.target.value;

                    }

                }
            );


        /* --------------------------------------------------------
           MESURE MODAL
        -------------------------------------------------------- */

        $("closeMeasurementModal")
            ?.addEventListener(
                "click",
                () => hide(
                    "measurementModal"
                )
            );


        $("closeMeasurementBtn")
            ?.addEventListener(
                "click",
                () => hide(
                    "measurementModal"
                )
            );


        /* --------------------------------------------------------
           RAPPORT
        -------------------------------------------------------- */

        $("generateReportBtn")
            ?.addEventListener(
                "click",
                generateReport
            );


        $("clearReportBtn")
            ?.addEventListener(
                "click",
                clearReport
            );


        /* --------------------------------------------------------
           OUTILS
        -------------------------------------------------------- */

        $$(".tool-button[data-tool]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        setTool(
                            button.dataset.tool
                        );

                    }
                );

            });


        /* --------------------------------------------------------
           NAVIGATION
        -------------------------------------------------------- */

        const navigation = {

            laboratoryNavBtn:
                "laboratory",

            materialsNavBtn:
                "materials",

            toolsNavBtn:
                "tools",

            measureNavBtn:
                "measure",

            dosageNavBtn:
                "dosage",

            reactionNavBtn:
                "reaction",

            resultNavBtn:
                "result",

            reportNavBtn:
                "report"

        };


        Object.entries(
            navigation
        ).forEach(
            ([id, target]) => {

                $(id)?.addEventListener(
                    "click",
                    () => navigateTo(target)
                );

            }
        );


        /* --------------------------------------------------------
           REACTION
        -------------------------------------------------------- */

        $("actionReactionBtn")
            ?.addEventListener(
                "click",
                runReaction
            );


        $("reactionBtn")
            ?.addEventListener(
                "click",
                runReaction
            );


        /* --------------------------------------------------------
           RÉSULTAT
        -------------------------------------------------------- */

        $("resultBtn")
            ?.addEventListener(
                "click",
                renderResult
            );


        /* --------------------------------------------------------
           ESCAPE POUR FERMER LES MODALS
        -------------------------------------------------------- */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key !==
                    "Escape"
                ) {
                    return;
                }

                hide(
                    "transferModal"
                );

                hide(
                    "measurementModal"
                );

                hide(
                    "materialsPanel"
                );

            }
        );

    }


/* ================================================================
   44 — ÉTAT FOOTER
================================================================ */

    function updateFooterState() {

        setText(
            "footerEngineState",
            `FOBAS Civil Engine ${ENGINE_VERSION}`
        );

        setText(
            "footerZoomState",
            `${Math.round(
                state.zoom * 100
            )}%`
        );

        setText(
            "laboratoryStateText",
            "Laboratoire actif"
        );

        const dot =
            $("laboratoryStateDot");

        if (dot) {

            dot.classList.add(
                "active"
            );

        }

    }


/* ================================================================
   45 — FORMAT NOMBRE
================================================================ */

    function formatNumber(
        value,
        decimals = 2
    ) {

        const number =
            Number(value || 0);

        return number.toLocaleString(
            "fr-FR",
            {
                minimumFractionDigits:
                    number % 1 === 0
                        ? 0
                        : decimals,

                maximumFractionDigits:
                    decimals
            }
        );

    }


/* ================================================================
   46 — RESTAURATION AFFICHAGE
================================================================ */

    function renderAll() {

        renderMaterialCategories();

        renderMaterialLibrary();

        renderInventory();

        renderWorkspaceObjects();

        renderComposition();

        renderReactionState();

        renderResult();

        renderObservationLog();

        calculateDosage();

        updateRecipientStatus();

        applyZoom();

        updateFooterState();

    }


/* ================================================================
   47 — EXPOSITION API PUBLIQUE
================================================================ */

    window.FOBAS_CIVIL_API = {

        state,

        materials: MATERIALS,

        equipment: EQUIPMENT,

        addMaterial,

        addWorkspaceMaterial,

        transferMaterialToRecipient,

        openTransferModal,

        closeTransferModal,

        confirmTransfer,

        measureRecipient,

        calculateDosage,

        mixRecipient,

        runReaction,

        heatRecipient,

        removeSelectedObject,

        clearWorkspace,

        resetSimulation,

        zoomIn,

        zoomOut,

        fitWorkspace,

        generateReport,

        clearReport,

        navigateTo,

        notify,

        saveState,

        renderAll

    };


/* ================================================================
   48 — INITIALISATION
================================================================ */

    function init() {

        try {

            setupWorkspaceDrop();

            bindEvents();

            renderAll();

            state.timestamp =
                Date.now();

            window.FOBAS_CIVIL_STATE =
                state;

            window.FOBAS_CIVIL_ENGINE.ready =
                true;

            addObservation(
                "Moteur FOBAS Génie Civil initialisé."
            );

            updateFooterState();

            console.log(
                `${ENGINE_NAME} ${ENGINE_VERSION} — READY`
            );

        } catch (error) {

            console.error(
                "FOBAS Civil Engine initialization error:",
                error
            );

            notify(
                "Erreur d'initialisation du laboratoire.",
                "error"
            );

        }

    }


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