/* ================================================================
   FOBAS — LABORATOIRE GÉNIE CIVIL
   ---------------------------------------------------------------
   JAVASCRIPT PRINCIPAL
   Compatible avec :
   simulationgeniecivilfobas.html

   VERSION : 2.1.0
   ENGINE  : FOBAS_CIVIL_ENGINE

   RÈGLES DE DOSAGE :
   - 1 sac de ciment = 42 KG
   - Le ciment réellement transféré dans le récipient
     est la SOURCE DE VÉRITÉ du dosage.
   - Nombre de sacs = ciment réel / 42
   - Mortier      : 1 : 3
   - Béton        : 1 : 2 : 3
   - Béton armé   : 1 : 2 : 3

   DOSAGES POUR 1 SAC DE 42 KG :

   MORTIER :
   - Ciment  : 42 kg
   - Sable   : 126 kg
   - Gravier : 0 kg
   - Eau     : 21 L

   BÉTON :
   - Ciment  : 42 kg
   - Sable   : 84 kg
   - Gravier : 126 kg
   - Eau     : 21 L

   BÉTON ARMÉ :
   - Ciment  : 42 kg
   - Sable   : 84 kg
   - Gravier : 126 kg
   - Eau     : 21 L

   IMPORTANT :
   - Aucun calcul basé sur 50 KG.
   - L'utilisateur n'a pas besoin de saisir le nombre de sacs.
   - Le nombre de sacs est calculé automatiquement.
   - Le dosage attendu est calculé à partir du ciment réellement présent.
   - "Mauvaise Melange" et "Reaction reussie" sont conservés exactement.
================================================================ */

(function () {

    "use strict";


    /* ============================================================
       01 — CONFIGURATION GÉNÉRALE
    ============================================================ */

    const APP_ID = "FOBAS_CIVIL_ENGINE";

    const STORAGE_KEY =
        "FOBAS_CIVIL_STATE";

    /*
       RÈGLE ABSOLUE :
       1 SAC DE CIMENT = 42 KG
    */
    const CEMENT_BAG_KG = 42;

    /*
       Tolérance de validation :
       5 %
    */
    const MIX_TOLERANCE = 0.05;


    /* ============================================================
       02 — OUTILS DOM
    ============================================================ */

    function $(selector, root) {

        return (root || document)
            .querySelector(selector);

    }


    function $$(selector, root) {

        return Array.from(
            (root || document)
                .querySelectorAll(selector)
        );

    }


    function byId(id) {

        return document.getElementById(id);

    }


    function setText(id, value) {

        const element = byId(id);

        if (element) {

            element.textContent =
                String(value);

        }

    }


    function setHTML(id, value) {

        const element = byId(id);

        if (element) {

            element.innerHTML =
                String(value);

        }

    }


    function number(value, fallback) {

        const n = Number(value);

        return Number.isFinite(n)
            ? n
            : (
                fallback !== undefined
                    ? fallback
                    : 0
            );

    }


    function round(value, decimals) {

        const d =
            Number.isFinite(
                Number(decimals)
            )
                ? Number(decimals)
                : 2;

        const factor =
            Math.pow(10, d);

        return Math.round(
            number(value) * factor
        ) / factor;

    }


    function clamp(value, min, max) {

        return Math.max(
            min,
            Math.min(max, value)
        );

    }


    function formatNumber(value, decimals) {

        return String(
            round(
                number(value),
                decimals === undefined
                    ? 2
                    : decimals
            )
        );

    }


    /* ============================================================
       03 — ÉTAT INITIAL
    ============================================================ */

    const htmlInitialState =
        window.FOBAS_CIVIL_INITIAL_STATE ||
        {};

    const state =
        window.FOBAS_CIVIL_STATE ||
        htmlInitialState;

    window.FOBAS_CIVIL_STATE =
        state;


    state.app =
        state.app || {};

    state.app.id =
        state.app.id || APP_ID;

    state.app.zoom =
        number(
            state.app.zoom,
            1
        );


    state.laboratory =
        state.laboratory || {};


    state.laboratory.selectedMaterial =
        state.laboratory.selectedMaterial ||
        null;


    state.laboratory.selectedEquipment =
        state.laboratory.selectedEquipment ||
        null;


    state.laboratory.workspaceObjects =
        Array.isArray(
            state.laboratory.workspaceObjects
        )
            ? state.laboratory.workspaceObjects
            : [];


    state.laboratory.recipients =
        state.laboratory.recipients ||
        {};


    if (
        !state.laboratory
            .recipients
            .recipient01
    ) {

        state.laboratory
            .recipients
            .recipient01 = {

                id:
                    "recipient01",

                type:
                    "mixing-container",

                state:
                    "empty",

                mixed:
                    false,

                reactionState:
                    "pending",

                components:
                    [],

                totalMassKg:
                    0,

                totalVolumeL:
                    0,

                lastAction:
                    null

            };

    }


    const recipient =
        state.laboratory
            .recipients
            .recipient01;


    recipient.components =
        Array.isArray(
            recipient.components
        )
            ? recipient.components
            : [];


    state.materials =
        state.materials || {};


    state.equipment =
        state.equipment || {};


    state.dosage =
        state.dosage || {};


    state.reaction =
        state.reaction || {};


    state.result =
        state.result || {};


    state.reports =
        Array.isArray(
            state.reports
        )
            ? state.reports
            : [];


    /* ============================================================
       04 — MATÉRIAUX
    ============================================================ */

    const MATERIALS = {

        cement: {
            id: "cement",
            name: "Ciment",
            category: "beton",
            unit: "kg",
            available: 1000,
            icon: "🧱"
        },

        sand: {
            id: "sand",
            name: "Sable",
            category: "beton",
            unit: "kg",
            available: 1000,
            icon: "🏖️"
        },

        gravel: {
            id: "gravel",
            name: "Gravier",
            category: "beton",
            unit: "kg",
            available: 1000,
            icon: "🪨"
        },

        water: {
            id: "water",
            name: "Eau",
            category: "beton",
            unit: "L",
            available: 1000,
            icon: "💧"
        },

        "fine-sand": {
            id: "fine-sand",
            name: "Sable fin",
            category: "granulats",
            unit: "kg",
            available: 1000,
            icon: "🏖️"
        },

        "medium-sand": {
            id: "medium-sand",
            name: "Sable moyen",
            category: "granulats",
            unit: "kg",
            available: 1000,
            icon: "🏖️"
        },

        "coarse-sand": {
            id: "coarse-sand",
            name: "Sable grossier",
            category: "granulats",
            unit: "kg",
            available: 1000,
            icon: "🪨"
        },

        stone: {
            id: "stone",
            name: "Pierre",
            category: "granulats",
            unit: "kg",
            available: 1000,
            icon: "🪨"
        },

        earth: {
            id: "earth",
            name: "Terre",
            category: "sols",
            unit: "kg",
            available: 1000,
            icon: "🌍"
        },

        clay: {
            id: "clay",
            name: "Argile",
            category: "sols",
            unit: "kg",
            available: 1000,
            icon: "🟤"
        },

        silt: {
            id: "silt",
            name: "Limon",
            category: "sols",
            unit: "kg",
            available: 1000,
            icon: "🟫"
        },

        "steel-bar": {
            id: "steel-bar",
            name: "Barre d'acier",
            category: "acier",
            unit: "kg",
            available: 1000,
            icon: "🔩"
        },

        "steel-wire": {
            id: "steel-wire",
            name: "Fil d'acier",
            category: "acier",
            unit: "kg",
            available: 1000,
            icon: "〰️"
        },

        brick: {
            id: "brick",
            name: "Brique",
            category: "maconnerie",
            unit: "unit",
            available: 1000,
            icon: "🧱"
        },

        "concrete-block": {
            id: "concrete-block",
            name: "Bloc béton",
            category: "maconnerie",
            unit: "unit",
            available: 1000,
            icon: "🧱"
        },

        wood: {
            id: "wood",
            name: "Bois",
            category: "autres",
            unit: "kg",
            available: 1000,
            icon: "🪵"
        },

        glass: {
            id: "glass",
            name: "Verre",
            category: "autres",
            unit: "kg",
            available: 1000,
            icon: "🪟"
        },

        bitumen: {
            id: "bitumen",
            name: "Bitume",
            category: "autres",
            unit: "kg",
            available: 1000,
            icon: "⬛"
        }

    };


    Object.keys(MATERIALS)
        .forEach(function (id) {

            if (!state.materials[id]) {

                state.materials[id] =
                    Object.assign(
                        {},
                        MATERIALS[id]
                    );

            }

        });


    function getMaterial(id) {

        return (
            state.materials[id] ||
            MATERIALS[id] ||
            null
        );

    }


    /* ============================================================
       05 — RECETTES DE DOSAGE
       ------------------------------------------------------------
       SOURCE SCIENTIFIQUE DU MOTEUR :

       1 sac = 42 kg ciment

       MORTIER :
       42 kg ciment
       126 kg sable
       0 kg gravier
       21 L eau

       BÉTON :
       42 kg ciment
       84 kg sable
       126 kg gravier
       21 L eau

       Les ratios sont exprimés par KG de ciment.
    ============================================================ */

    const DOSAGE = {

        mortier: {

            name:
                "Mortier",

            cementPerBag:
                42,

            sandPerBag:
                126,

            gravelPerBag:
                0,

            waterPerBag:
                21,

            sandRatio:
                3,

            gravelRatio:
                0,

            waterRatio:
                0.5,

            ratio:
                "1 : 3"

        },

        beton: {

            name:
                "Béton",

            cementPerBag:
                42,

            sandPerBag:
                84,

            gravelPerBag:
                126,

            waterPerBag:
                21,

            sandRatio:
                2,

            gravelRatio:
                3,

            waterRatio:
                0.5,

            ratio:
                "1 : 2 : 3"

        },

        "beton-arme": {

            name:
                "Béton armé",

            cementPerBag:
                42,

            sandPerBag:
                84,

            gravelPerBag:
                126,

            waterPerBag:
                21,

            sandRatio:
                2,

            gravelRatio:
                3,

            waterRatio:
                0.5,

            ratio:
                "1 : 2 : 3"

        }

    };


    /* ============================================================
       06 — SAUVEGARDE
    ============================================================ */

    function saveState() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state)
            );

        } catch (error) {

            console.warn(
                "FOBAS Civil : sauvegarde impossible",
                error
            );

        }

    }


    function mergeObjects(
        target,
        source
    ) {

        Object.keys(
            source || {}
        ).forEach(function (key) {

            const sourceValue =
                source[key];


            if (
                sourceValue &&
                typeof sourceValue ===
                    "object" &&
                !Array.isArray(
                    sourceValue
                ) &&
                target[key] &&
                typeof target[key] ===
                    "object" &&
                !Array.isArray(
                    target[key]
                )
            ) {

                mergeObjects(
                    target[key],
                    sourceValue
                );

            } else {

                target[key] =
                    sourceValue;

            }

        });

    }


    function loadState() {

        try {

            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (!raw) return;


            const saved =
                JSON.parse(raw);


            if (
                !saved ||
                !saved.app ||
                saved.app.id !== APP_ID
            ) {

                return;

            }


            mergeObjects(
                state,
                saved
            );

        } catch (error) {

            console.warn(
                "FOBAS Civil : état sauvegardé invalide",
                error
            );

        }

    }


    loadState();


    /* ============================================================
       07 — NORMALISATION AUTOMATIQUE
    ============================================================ */

    state.dosage =
        state.dosage || {};


    state.dosage.cementBagKg =
        CEMENT_BAG_KG;


    /*
       On ne fait volontairement PAS confiance à
       state.dosage.cementBags.

       Le nombre de sacs est maintenant toujours
       recalculé depuis le ciment réellement présent
       dans le récipient.
    */


    /* ============================================================
       08 — NOTIFICATION
    ============================================================ */

    function notify(
        message,
        type
    ) {

        const box =
            byId(
                "civilNotification"
            );


        const messageBox =
            byId(
                "civilNotificationMessage"
            );


        const icon =
            byId(
                "civilNotificationIcon"
            );


        if (messageBox) {

            messageBox.textContent =
                message;

        }


        if (icon) {

            icon.textContent =
                type === "error"
                    ? "⚠"
                    : type === "warning"
                        ? "!"
                        : "✓";

        }


        if (!box) {

            console.log(
                "FOBAS Civil:",
                message
            );

            return;

        }


        box.hidden =
            false;


        clearTimeout(
            box.__fobasTimer
        );


        box.__fobasTimer =
            setTimeout(
                function () {

                    box.hidden =
                        true;

                },
                2800
            );

    }


    /* ============================================================
       09 — NAVIGATION
    ============================================================ */

    function activatePanel(
        panelId
    ) {

        $$("[data-panel-content]")
            .forEach(function (panel) {

                const active =
                    panel.id ===
                    panelId;


                panel.hidden =
                    !active;


                panel.classList.toggle(
                    "active",
                    active
                );

            });


        $$("[data-panel]")
            .forEach(function (button) {

                button.classList.toggle(
                    "active",
                    button.getAttribute(
                        "data-panel"
                    ) === panelId
                );

            });


        state.activePanel =
            panelId;


        saveState();

    }


    function bindNavigation() {

        $$("[data-panel]")
            .forEach(function (button) {

                if (
                    button.dataset
                        .fobasCivilNavigation
                ) {

                    return;

                }


                button.dataset
                    .fobasCivilNavigation =
                    "1";


                button.addEventListener(
                    "click",
                    function () {

                        const panelId =
                            button.getAttribute(
                                "data-panel"
                            );


                        if (panelId) {

                            activatePanel(
                                panelId
                            );

                        }

                    }
                );

            });

    }


    /* ============================================================
       10 — OBJETS MATÉRIAUX
    ============================================================ */

    function createObjectId(
        materialId
    ) {

        return (
            "civil-object-" +
            materialId +
            "-" +
            Date.now() +
            "-" +
            Math.floor(
                Math.random() * 100000
            )
        );

    }


    function addWorkspaceMaterial(
        materialId
    ) {

        const material =
            getMaterial(
                materialId
            );


        if (!material) {

            notify(
                "Matériau introuvable.",
                "error"
            );

            return null;

        }


        const scene =
            byId(
                "civilLaboratoryScene"
            );


        if (!scene) {

            notify(
                "Scène du laboratoire introuvable.",
                "error"
            );

            return null;

        }


        const sceneWidth =
            Math.max(
                scene.clientWidth || 700,
                300
            );


        const sceneHeight =
            Math.max(
                scene.clientHeight || 450,
                300
            );


        const object = {

            id:
                createObjectId(
                    materialId
                ),

            materialId:
                materialId,

            name:
                material.name,

            unit:
                material.unit,

            icon:
                material.icon ||
                "📦",

            x:
                Math.round(
                    clamp(
                        80 +
                        Math.random() *
                        Math.max(
                            sceneWidth - 160,
                            120
                        ),
                        50,
                        Math.max(
                            sceneWidth - 50,
                            100
                        )
                    )
                ),

            y:
                Math.round(
                    clamp(
                        100 +
                        Math.random() *
                        Math.max(
                            sceneHeight - 180,
                            120
                        ),
                        70,
                        Math.max(
                            sceneHeight - 60,
                            100
                        )
                    )
                ),

            createdAt:
                new Date().toISOString()

        };


        state.laboratory
            .workspaceObjects
            .push(object);


        state.laboratory
            .selectedMaterial =
            materialId;


        renderWorkspaceObjects();


        saveState();


        notify(
            material.name +
            " ajouté au laboratoire.",
            "success"
        );


        return object;

    }


    /* ============================================================
       11 — RENDU DES OBJETS
    ============================================================ */

    function renderWorkspaceObjects() {

        const scene =
            byId(
                "civilLaboratoryScene"
            );


        if (!scene) return;


        $$(".fobas-civil-workspace-material", scene)
            .forEach(function (element) {

                element.remove();

            });


        state.laboratory
            .workspaceObjects
            .forEach(function (object) {

                const material =
                    getMaterial(
                        object.materialId
                    );


                if (!material) return;


                const element =
                    document.createElement(
                        "button"
                    );


                element.type =
                    "button";


                element.className =
                    "fobas-civil-workspace-material";


                element.dataset.objectId =
                    object.id;


                element.dataset.materialId =
                    object.materialId;


                element.draggable =
                    true;


                element.style.position =
                    "absolute";


                element.style.left =
                    number(
                        object.x,
                        100
                    ) +
                    "px";


                element.style.top =
                    number(
                        object.y,
                        100
                    ) +
                    "px";


                element.style.zIndex =
                    "40";


                element.innerHTML =
                    `
                    <span class="fobas-civil-object-icon">
                        ${material.icon || "📦"}
                    </span>
                    <span class="fobas-civil-object-name">
                        ${material.name}
                    </span>
                    `;


                element.addEventListener(
                    "click",
                    function (event) {

                        event.stopPropagation();


                        openTransferForObject(
                            object.id
                        );

                    }
                );


                element.addEventListener(
                    "dragstart",
                    function (event) {

                        event.dataTransfer.setData(
                            "text/plain",
                            JSON.stringify({
                                type:
                                    "workspace-material",

                                objectId:
                                    object.id,

                                materialId:
                                    object.materialId
                            })
                        );


                        element.classList.add(
                            "material-dragging"
                        );

                    }
                );


                element.addEventListener(
                    "dragend",
                    function () {

                        element.classList.remove(
                            "material-dragging"
                        );

                    }
                );


                scene.appendChild(
                    element
                );

            });

    }


    /* ============================================================
       12 — CARTES MATÉRIAUX
    ============================================================ */

    function bindMaterialCards() {

        $$(
            ".civil-material-card[data-material-id]"
        )
        .forEach(function (card) {

            if (
                card.dataset
                    .fobasCivilBound === "1"
            ) {

                return;

            }


            card.dataset
                .fobasCivilBound =
                "1";


            card.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();


                    const materialId =
                        card.getAttribute(
                            "data-material-id"
                        );


                    if (!materialId) {

                        return;

                    }


                    const material =
                        getMaterial(
                            materialId
                        );


                    if (!material) {

                        notify(
                            "Matériau introuvable.",
                            "error"
                        );

                        return;

                    }


                    state.laboratory
                        .selectedMaterial =
                        materialId;


                    state.selectedMaterialId =
                        materialId;


                    addWorkspaceMaterial(
                        materialId
                    );


                    $$(".civil-material-card")
                        .forEach(
                            function (item) {

                                item.classList.remove(
                                    "material-selected"
                                );

                            }
                        );


                    card.classList.add(
                        "material-selected"
                    );


                    setText(
                        "laboratoryDropMessage",
                        material.name +
                        " ajouté au laboratoire."
                    );


                    activatePanel(
                        "laboratoryPanel"
                    );


                    saveState();

                }
            );


            card.addEventListener(
                "dragstart",
                function (event) {

                    const materialId =
                        card.getAttribute(
                            "data-material-id"
                        );


                    if (!materialId) return;


                    event.dataTransfer.setData(
                        "text/plain",
                        JSON.stringify({

                            type:
                                "material",

                            materialId:
                                materialId

                        })
                    );


                    event.dataTransfer.effectAllowed =
                        "copy";

                }
            );

        });

    }


    /* ============================================================
       13 — MODAL TRANSFERT
    ============================================================ */

    function openTransferModal(
        materialId,
        objectId
    ) {

        const material =
            getMaterial(
                materialId
            );


        if (!material) return;


        const modal =
            byId(
                "transferModal"
            );


        if (!modal) {

            transferMaterial(
                materialId,
                1,
                material.unit,
                objectId
            );

            return;

        }


        const name =
            byId(
                "transferMaterialName"
            );


        const input =
            byId(
                "transferQuantityInput"
            );


        const unit =
            byId(
                "transferUnitSelect"
            );


        if (name) {

            name.textContent =
                material.name;

        }


        if (input) {

            input.value =
                "1";

            input.min =
                "0.01";

        }


        if (unit) {

            unit.innerHTML =
                "";


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                material.unit;


            option.textContent =
                material.unit;


            unit.appendChild(
                option
            );

        }


        modal.hidden =
            false;


        modal.dataset.materialId =
            materialId;


        modal.dataset.objectId =
            objectId || "";

    }


    function openTransferForObject(
        objectId
    ) {

        const object =
            state.laboratory
                .workspaceObjects
                .find(function (item) {

                    return (
                        item.id ===
                        objectId
                    );

                });


        if (!object) return;


        openTransferModal(
            object.materialId,
            object.id
        );

    }


    function closeTransferModal() {

        const modal =
            byId(
                "transferModal"
            );


        if (modal) {

            modal.hidden =
                true;

        }

    }


    function setupTransferModal() {

        const modal =
            byId(
                "transferModal"
            );


        if (!modal) return;


        const confirm =
            byId(
                "confirmTransferBtn"
            );


        if (
            confirm &&
            !confirm.dataset
                .fobasCivilBound
        ) {

            confirm.dataset
                .fobasCivilBound =
                "1";


            confirm.addEventListener(
                "click",
                function () {

                    const materialId =
                        modal.dataset
                            .materialId;


                    const objectId =
                        modal.dataset
                            .objectId ||
                        null;


                    const input =
                        byId(
                            "transferQuantityInput"
                        );


                    const select =
                        byId(
                            "transferUnitSelect"
                        );


                    const quantity =
                        number(
                            input
                                ? input.value
                                : 0
                        );


                    const unit =
                        select
                            ? select.value
                            : "";


                    if (
                        !materialId ||
                        quantity <= 0
                    ) {

                        notify(
                            "Quantité invalide.",
                            "error"
                        );

                        return;

                    }


                    transferMaterial(
                        materialId,
                        quantity,
                        unit,
                        objectId
                    );


                    closeTransferModal();

                }
            );

        }


        $$(
            "[data-close-transfer]"
        )
        .forEach(function (button) {

            if (
                button.dataset
                    .fobasCivilBound
            ) {

                return;

            }


            button.dataset
                .fobasCivilBound =
                "1";


            button.addEventListener(
                "click",
                closeTransferModal
            );

        });


        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    modal
                ) {

                    closeTransferModal();

                }

            }
        );

    }


    /* ============================================================
       14 — UTILITAIRE COMPOSANT
    ============================================================ */

    function componentQuantity(
        materialId
    ) {

        const component =
            recipient.components.find(
                function (item) {

                    return (
                        item.materialId ===
                        materialId
                    );

                }
            );


        return component
            ? number(
                component.quantity
            )
            : 0;

    }


    /* ============================================================
       15 — CALCUL DYNAMIQUE DU DOSAGE
       ------------------------------------------------------------
       IMPORTANT :

       LE CIMENT RÉEL DANS LE RÉCIPIENT
       EST LA SOURCE DE VÉRITÉ.

       Exemple :

       84 kg ciment / 42
       = 2 sacs

       Béton :

       84 × 2 = 168 kg sable
       84 × 3 = 252 kg gravier
       84 × 0.5 = 42 L eau
    ============================================================ */

    function updateDynamicDosageFromRecipient(
        silent
    ) {

        const select =
            byId(
                "mixTypeSelect"
            );


        const type =
            select &&
            DOSAGE[select.value]
                ? select.value
                : (
                    DOSAGE[
                        state.dosage.type
                    ]
                        ? state.dosage.type
                        : "mortier"
                );


        const recipe =
            DOSAGE[type] ||
            DOSAGE.mortier;


        const cementKg =
            round(
                componentQuantity(
                    "cement"
                ),
                3
            );


        const cementBags =
            cementKg > 0
                ? cementKg /
                    CEMENT_BAG_KG
                : 0;


        const sandKg =
            cementKg *
            recipe.sandRatio;


        const gravelKg =
            cementKg *
            recipe.gravelRatio;


        const waterL =
            cementKg *
            recipe.waterRatio;


        state.dosage = {

            type:
                type,

            cementBags:
                round(
                    cementBags,
                    3
                ),

            cementBagKg:
                CEMENT_BAG_KG,

            cementKg:
                round(
                    cementKg,
                    3
                ),

            sandKg:
                round(
                    sandKg,
                    3
                ),

            gravelKg:
                round(
                    gravelKg,
                    3
                ),

            waterL:
                round(
                    waterL,
                    3
                ),

            status:
                cementKg > 0
                    ? "calculated"
                    : "pending"

        };


        /*
           Si l'ancien HTML possède encore
           cementBagsInput, il devient un affichage
           automatique et non une source de données.
        */

        const bagsInput =
            byId(
                "cementBagsInput"
            );


        if (bagsInput) {

            bagsInput.value =
                cementBags > 0
                    ? formatNumber(
                        cementBags,
                        3
                    )
                    : "0";


            bagsInput.readOnly =
                true;


            bagsInput.setAttribute(
                "readonly",
                "readonly"
            );


            bagsInput.title =
                "Calculé automatiquement à partir du ciment réellement ajouté au récipient.";

        }


        setText(
            "dosageCement",
            formatNumber(
                cementKg,
                2
            ) +
            " kg"
        );


        setText(
            "dosageSand",
            formatNumber(
                sandKg,
                2
            ) +
            " kg"
        );


        setText(
            "dosageGravel",
            formatNumber(
                gravelKg,
                2
            ) +
            " kg"
        );


        setText(
            "dosageWater",
            formatNumber(
                waterL,
                2
            ) +
            " L"
        );


        setText(
            "dosageStatusBadge",
            "1 sac = 42 kg • " +
            "Ratio " +
            recipe.ratio +
            " • Gravier = " +
            formatNumber(
                recipe.gravelRatio,
                2
            ) +
            " kg/kg ciment"
        );


        if (!silent) {

            saveState();

        }


        return state.dosage;

    }


    /* ============================================================
       16 — TRANSFERT VERS LE RÉCIPIENT
    ============================================================ */

    function transferMaterial(
        materialId,
        quantity,
        unit,
        objectId
    ) {

        const material =
            getMaterial(
                materialId
            );


        if (!material) {

            notify(
                "Matériau introuvable.",
                "error"
            );

            return false;

        }


        const qty =
            number(
                quantity
            );


        if (qty <= 0) {

            notify(
                "La quantité doit être supérieure à zéro.",
                "error"
            );

            return false;

        }


        const finalUnit =
            unit ||
            material.unit;


        let component =
            recipient.components.find(
                function (item) {

                    return (
                        item.materialId ===
                        materialId
                    );

                }
            );


        if (!component) {

            component = {

                materialId:
                    materialId,

                name:
                    material.name,

                quantity:
                    0,

                unit:
                    finalUnit

            };


            recipient.components.push(
                component
            );

        }


        component.quantity +=
            qty;


        component.quantity =
            round(
                component.quantity,
                3
            );


        recipient.lastAction =
            "Transfert de " +
            material.name;


        recipient.state =
            "filled";


        recipient.mixed =
            false;


        recipient.reactionState =
            "pending";


        recalculateRecipient();


        /*
           NOUVEAU POINT ESSENTIEL :

           Dès qu'un matériau est transféré,
           le dosage est recalculé à partir
           du ciment réellement présent.
        */

        updateDynamicDosageFromRecipient(
            true
        );


        if (objectId) {

            state.laboratory
                .workspaceObjects =
                state.laboratory
                    .workspaceObjects
                    .filter(
                        function (object) {

                            return (
                                object.id !==
                                objectId
                            );

                        }
                    );

        }


        state.laboratory
            .selectedMaterial =
            materialId;


        renderWorkspaceObjects();

        renderRecipientStatus();

        renderMeasurements();


        saveState();


        notify(
            formatNumber(
                qty,
                2
            ) +
            " " +
            finalUnit +
            " de " +
            material.name +
            " transféré dans le récipient.",
            "success"
        );


        return true;

    }


    /* ============================================================
       17 — RECALCUL DU RÉCIPIENT
    ============================================================ */

    function recalculateRecipient() {

        let mass =
            0;


        let volume =
            0;


        recipient.components
            .forEach(
                function (component) {

                    const quantity =
                        number(
                            component.quantity
                        );


                    const material =
                        getMaterial(
                            component.materialId
                        );


                    if (!material) return;


                    if (
                        material.unit ===
                        "kg"
                    ) {

                        mass +=
                            quantity;

                    }


                    if (
                        material.unit ===
                        "L"
                    ) {

                        volume +=
                            quantity;

                    }

                }
            );


        recipient.totalMassKg =
            round(
                mass,
                3
            );


        recipient.totalVolumeL =
            round(
                volume,
                3
            );


        recipient.state =
            recipient.components.length
                ? "filled"
                : "empty";

    }


    /* ============================================================
       18 — AFFICHAGE DU RÉCIPIENT
    ============================================================ */

    function renderRecipientStatus() {

        recalculateRecipient();


        setText(
            "recipientTotalMass",
            formatNumber(
                recipient.totalMassKg,
                2
            ) +
            " kg"
        );


        setText(
            "recipientTotalVolume",
            formatNumber(
                recipient.totalVolumeL,
                2
            ) +
            " L"
        );


        setText(
            "recipientComponentCount",
            String(
                recipient.components.length
            )
        );


        const badge =
            byId(
                "recipientStateBadge"
            );


        if (badge) {

            let text =
                "Vide";


            if (
                recipient.components.length
            ) {

                text =
                    recipient.mixed
                        ? "Mélangé"
                        : "Contient des matériaux";

            }


            badge.textContent =
                text;

        }


        const list =
            byId(
                "recipientContentList"
            );


        if (list) {

            list.innerHTML =
                "";


            if (
                recipient.components.length ===
                0
            ) {

                const empty =
                    document.createElement(
                        "div"
                    );


                empty.className =
                    "fobas-civil-recipient-item";


                empty.textContent =
                    "Aucun matériau dans le récipient.";


                list.appendChild(
                    empty
                );

            } else {

                recipient.components
                    .forEach(
                        function (component) {

                            const row =
                                document.createElement(
                                    "div"
                                );


                            row.className =
                                "fobas-civil-recipient-item";


                            row.innerHTML =
                                `
                                <span>
                                    ${component.name}
                                </span>
                                <strong>
                                    ${formatNumber(component.quantity, 2)}
                                    ${component.unit}
                                </strong>
                                `;


                            list.appendChild(
                                row
                            );

                        }
                    );

            }

        }


        const contents =
            byId(
                "recipient01Contents"
            );


        if (contents) {

            contents.innerHTML =
                "";


            recipient.components
                .forEach(
                    function (component) {

                        const item =
                            document.createElement(
                                "span"
                            );


                        item.textContent =
                            component.name +
                            " " +
                            formatNumber(
                                component.quantity,
                                2
                            ) +
                            " " +
                            component.unit;


                        contents.appendChild(
                            item
                        );

                    }
                );

        }

    }


    /* ============================================================
       19 — DRAG & DROP RÉCIPIENT
    ============================================================ */

    function setupRecipientDrop() {

        const target =
            byId(
                "recipient01"
            );


        if (!target) return;


        if (
            target.dataset
                .fobasCivilDropBound
        ) {

            return;

        }


        target.dataset
            .fobasCivilDropBound =
            "1";


        target.addEventListener(
            "dragover",
            function (event) {

                event.preventDefault();


                target.classList.add(
                    "drop-ready"
                );

            }
        );


        target.addEventListener(
            "dragleave",
            function () {

                target.classList.remove(
                    "drop-ready"
                );

            }
        );


        target.addEventListener(
            "drop",
            function (event) {

                event.preventDefault();
                event.stopPropagation();


                target.classList.remove(
                    "drop-ready"
                );


                const raw =
                    event.dataTransfer
                        ? event.dataTransfer
                            .getData(
                                "text/plain"
                            )
                        : "";


                if (!raw) return;


                try {

                    const data =
                        JSON.parse(
                            raw
                        );


                    if (
                        data.type ===
                            "material" &&
                        data.materialId
                    ) {

                        const material =
                            getMaterial(
                                data.materialId
                            );


                        if (!material) {

                            return;

                        }


                        transferMaterial(
                            data.materialId,
                            1,
                            material.unit,
                            null
                        );


                        return;

                    }


                    if (
                        data.type ===
                            "workspace-material" &&
                        data.materialId
                    ) {

                        const material =
                            getMaterial(
                                data.materialId
                            );


                        if (!material) {

                            return;

                        }


                        transferMaterial(
                            data.materialId,
                            1,
                            material.unit,
                            data.objectId
                        );

                    }

                } catch (error) {

                    console.warn(
                        "FOBAS Civil drop récipient :",
                        error
                    );

                }

            }
        );

    }


    /* ============================================================
       20 — DROP LABORATOIRE
    ============================================================ */

    function setupLaboratoryDrop() {

        const workspace =
            byId(
                "civilLaboratoryWorkspace"
            );


        if (!workspace) return;


        if (
            workspace.dataset
                .fobasCivilDropBound
        ) {

            return;

        }


        workspace.dataset
            .fobasCivilDropBound =
            "1";


        workspace.addEventListener(
            "dragover",
            function (event) {

                event.preventDefault();

            }
        );


        workspace.addEventListener(
            "drop",
            function (event) {

                if (
                    event.target.closest(
                        "#recipient01"
                    )
                ) {

                    return;

                }


                event.preventDefault();


                const raw =
                    event.dataTransfer
                        ? event.dataTransfer
                            .getData(
                                "text/plain"
                            )
                        : "";


                if (!raw) return;


                try {

                    const data =
                        JSON.parse(
                            raw
                        );


                    if (
                        data.type ===
                            "material" &&
                        data.materialId
                    ) {

                        addWorkspaceMaterial(
                            data.materialId
                        );

                    }

                } catch (error) {

                    console.warn(
                        "FOBAS Civil drop laboratoire :",
                        error
                    );

                }

            }
        );

    }


    /* ============================================================
       21 — MÉLANGE
    ============================================================ */

    function mixRecipient() {

        if (
            recipient.components.length ===
            0
        ) {

            notify(
                "Ajoutez d'abord des matériaux dans le récipient.",
                "warning"
            );


            return false;

        }


        recalculateRecipient();


        /*
           Le dosage est recalculé avant mélange
           afin que le ciment réel soit toujours
           pris comme référence.
        */

        updateDynamicDosageFromRecipient(
            true
        );


        recipient.mixed =
            true;


        recipient.state =
            "mixed";


        recipient.reactionState =
            "pending";


        recipient.lastAction =
            "Mélange effectué";


        saveState();


        renderRecipientStatus();


        setText(
            "reactionStatusTitle",
            "Mélange effectué"
        );


        setText(
            "reactionStatusMessage",
            "Le mélange est prêt pour la vérification du dosage."
        );


        notify(
            "Mélange effectué avec succès.",
            "success"
        );


        return true;

    }


    /* ============================================================
       22 — MESURES
    ============================================================ */

    function renderMeasurements() {

        recalculateRecipient();


        setText(
            "measurementMass",
            formatNumber(
                recipient.totalMassKg,
                2
            ) +
            " kg"
        );


        setText(
            "measurementVolume",
            formatNumber(
                recipient.totalVolumeL,
                2
            ) +
            " L"
        );


        setText(
            "measurementMaterials",
            String(
                recipient.components.length
            )
        );


        const balance =
            byId(
                "balanceDisplay"
            );


        if (balance) {

            balance.textContent =
                formatNumber(
                    recipient.totalMassKg -
                    number(
                        state.balanceTare
                    ),
                    2
                ) +
                " kg";

        }


        const cylinder =
            byId(
                "cylinderLiquid"
            );


        if (cylinder) {

            const volume =
                clamp(
                    recipient.totalVolumeL,
                    0,
                    100
                );


            cylinder.style.height =
                volume +
                "%";

        }

    }


    /* ============================================================
       23 — TARE BALANCE
    ============================================================ */

    function tareBalance() {

        state.balanceTare =
            recipient.totalMassKg;


        const display =
            byId(
                "balanceDisplay"
            );


        if (display) {

            display.textContent =
                "0.00 kg";

        }


        saveState();


        notify(
            "Balance mise à zéro.",
            "success"
        );

    }


    /* ============================================================
       24 — DOSAGE
       ------------------------------------------------------------
       IMPORTANT :

       Le bouton de calcul ne demande plus
       de nombre de sacs.

       Il actualise simplement le dosage
       à partir du ciment présent dans
       le récipient.
    ============================================================ */

    function calculateDosage() {

        const dosage =
            updateDynamicDosageFromRecipient(
                false
            );


        const recipe =
            DOSAGE[
                dosage.type
            ] ||
            DOSAGE.mortier;


        if (
            dosage.cementKg <= 0
        ) {

            notify(
                "Ajoutez d'abord du ciment dans le récipient.",
                "warning"
            );


            return dosage;

        }


        notify(
            recipe.name +
            " calculé automatiquement pour " +
            formatNumber(
                dosage.cementBags,
                3
            ) +
            " sac(s) équivalent(s) de 42 kg.",
            "success"
        );


        return dosage;

    }


    /* ============================================================
       25 — TOLÉRANCE
    ============================================================ */

    function withinTolerance(
        actual,
        expected
    ) {

        actual =
            number(actual);


        expected =
            number(expected);


        if (
            expected === 0
        ) {

            return (
                Math.abs(actual) <
                0.001
            );

        }


        const difference =
            Math.abs(
                actual -
                expected
            );


        return (
            difference /
            Math.abs(expected)
        ) <= MIX_TOLERANCE;

    }


    /* ============================================================
       26 — VALIDATION DU MÉLANGE
       ------------------------------------------------------------
       C'EST ICI QUE LE GRAVIER EST MAINTENANT
       OBLIGATOIRE POUR LE BÉTON.

       Exemple :

       Ciment = 84 kg

       Béton :
       Sable   = 84 × 2 = 168 kg
       Gravier = 84 × 3 = 252 kg
       Eau     = 84 × 0.5 = 42 L
       Sacs    = 84 / 42 = 2
    ============================================================ */

    function validateMix() {

        /*
           On récupère le type sélectionné,
           sans utiliser le nombre de sacs
           comme source de vérité.
        */

        const select =
            byId(
                "mixTypeSelect"
            );


        const type =
            select &&
            DOSAGE[select.value]
                ? select.value
                : (
                    DOSAGE[
                        state.dosage.type
                    ]
                        ? state.dosage.type
                        : "mortier"
                );


        const recipe =
            DOSAGE[type] ||
            DOSAGE.mortier;


        /*
           QUANTITÉ RÉELLE DE CIMENT.
        */

        const actualCement =
            componentQuantity(
                "cement"
            );


        if (
            actualCement <= 0
        ) {

            return {

                valid:
                    false,

                type:
                    type,

                bags:
                    0,

                reason:
                    "Aucun ciment n'est présent dans le récipient.",

                expected: {

                    cement:
                        0,

                    sand:
                        0,

                    gravel:
                        0,

                    water:
                        0

                },

                actual: {

                    cement:
                        0,

                    sand:
                        componentQuantity(
                            "sand"
                        ),

                    gravel:
                        componentQuantity(
                            "gravel"
                        ),

                    water:
                        componentQuantity(
                            "water"
                        )

                },

                checks: {

                    cement:
                        false,

                    sand:
                        false,

                    gravel:
                        false,

                    water:
                        false

                }

            };

        }


        /*
           CALCUL AUTOMATIQUE DU NOMBRE DE SACS.
        */

        const bags =
            actualCement /
            CEMENT_BAG_KG;


        /*
           CALCUL DES PROPORTIONS
           À PARTIR DU CIMENT RÉEL.
        */

        const expectedCement =
            actualCement;


        const expectedSand =
            actualCement *
            recipe.sandRatio;


        const expectedGravel =
            actualCement *
            recipe.gravelRatio;


        const expectedWater =
            actualCement *
            recipe.waterRatio;


        const actualSand =
            componentQuantity(
                "sand"
            );


        const actualGravel =
            componentQuantity(
                "gravel"
            );


        const actualWater =
            componentQuantity(
                "water"
            );


        /*
           Le ciment est la référence :
           il est donc toujours conforme
           puisqu'il sert lui-même à construire
           les quantités attendues.
        */

        const cementOK =
            actualCement > 0;


        const sandOK =
            withinTolerance(
                actualSand,
                expectedSand
            );


        const gravelOK =
            withinTolerance(
                actualGravel,
                expectedGravel
            );


        const waterOK =
            withinTolerance(
                actualWater,
                expectedWater
            );


        const valid =
            cementOK &&
            sandOK &&
            gravelOK &&
            waterOK;


        return {

            valid:
                valid,

            type:
                type,

            bags:
                round(
                    bags,
                    3
                ),

            cementKg:
                round(
                    actualCement,
                    3
                ),

            expected: {

                cement:
                    round(
                        expectedCement,
                        3
                    ),

                sand:
                    round(
                        expectedSand,
                        3
                    ),

                gravel:
                    round(
                        expectedGravel,
                        3
                    ),

                water:
                    round(
                        expectedWater,
                        3
                    )

            },

            actual: {

                cement:
                    round(
                        actualCement,
                        3
                    ),

                sand:
                    round(
                        actualSand,
                        3
                    ),

                gravel:
                    round(
                        actualGravel,
                        3
                    ),

                water:
                    round(
                        actualWater,
                        3
                    )

            },

            checks: {

                cement:
                    cementOK,

                sand:
                    sandOK,

                gravel:
                    gravelOK,

                water:
                    waterOK

            }

        };

    }


    /* ============================================================
       27 — AFFICHAGE DES RÉSULTATS
    ============================================================ */

    function updateResult(
        mixState,
        dosageState,
        reactionState,
        finalState
    ) {

        setText(
            "resultMixState",
            mixState
        );


        setText(
            "resultDosageState",
            dosageState
        );


        setText(
            "resultReactionState",
            reactionState
        );


        setText(
            "resultFinalState",
            finalState
        );

    }


    /* ============================================================
       28 — EXÉCUTION DE LA RÉACTION
    ============================================================ */

    function executeReaction() {

        if (
            !recipient.mixed
        ) {

            const message =
                "Effectuez d'abord le mélange avant d'exécuter la réaction.";


            recipient.reactionState =
                "pending";


            setText(
                "reactionStatusTitle",
                "Mélange requis"
            );


            setText(
                "reactionStatusMessage",
                message
            );


            setText(
                "reactionStatusIcon",
                "⚠"
            );


            notify(
                message,
                "warning"
            );


            return {

                valid:
                    false,

                status:
                    "pending"

            };

        }


        /*
           Recalcul final du dosage
           avant validation.
        */

        updateDynamicDosageFromRecipient(
            true
        );


        const validation =
            validateMix();


        if (
            !validation.valid
        ) {

            recipient.reactionState =
                "failed";


            recipient.lastAction =
                "Mauvaise Melange";


            state.reaction = {

                status:
                    "failed",

                message:
                    "Mauvaise Melange",

                timestamp:
                    new Date().toISOString()

            };


            state.result = {

                available:
                    true,

                title:
                    "Mauvaise Melange",

                message:
                    "Les proportions des matériaux ne correspondent pas au dosage demandé.",

                mixState:
                    "Mélange effectué",

                dosageState:
                    "Dosage non conforme",

                reactionState:
                    "Mauvaise Melange",

                finalState:
                    "Échec"

            };


            setText(
                "reactionStatusIcon",
                "⚠"
            );


            setText(
                "reactionStatusTitle",
                "Mauvaise Melange"
            );


            setText(
                "reactionStatusMessage",
                "Les proportions sont incorrectes. Vérifiez le ciment, le sable, le gravier et l'eau."
            );


            updateResult(
                "Mélange effectué",
                "Dosage non conforme",
                "Mauvaise Melange",
                "Échec"
            );


            saveState();


            notify(
                "Mauvaise Melange",
                "error"
            );


            return validation;

        }


        /*
           BON DOSAGE.
        */

        recipient.reactionState =
            "success";


        recipient.lastAction =
            "Reaction reussie";


        state.reaction = {

            status:
                "success",

            message:
                "Reaction reussie",

            timestamp:
                new Date().toISOString()

        };


        state.result = {

            available:
                true,

            title:
                "Reaction reussie",

            message:
                "Les proportions du mélange sont conformes au dosage sélectionné.",

            mixState:
                "Mélange effectué",

            dosageState:
                "Dosage conforme",

            reactionState:
                "Reaction reussie",

            finalState:
                "Réaction réussie"

        };


        setText(
            "reactionStatusIcon",
            "✓"
        );


        setText(
            "reactionStatusTitle",
            "Reaction reussie"
        );


        setText(
            "reactionStatusMessage",
            "Le dosage des matériaux est conforme. Le mélange peut être considéré comme réussi."
        );


        updateResult(
            "Mélange effectué",
            "Dosage conforme",
            "Reaction reussie",
            "Réaction réussie"
        );


        saveState();


        notify(
            "Reaction reussie",
            "success"
        );


        return validation;

    }


    /* ============================================================
       29 — VIDER LE RÉCIPIENT
    ============================================================ */

    function clearRecipient() {

        recipient.components =
            [];


        recipient.state =
            "empty";


        recipient.mixed =
            false;


        recipient.reactionState =
            "pending";


        recipient.totalMassKg =
            0;


        recipient.totalVolumeL =
            0;


        recipient.lastAction =
            "Récipient vidé";


        state.reaction = {

            status:
                "pending",

            message:
                "Préparez et mélangez les matériaux avant d'exécuter la réaction.",

            timestamp:
                null

        };


        state.result = {

            available:
                false,

            title:
                "Aucun résultat",

            message:
                "Exécutez une réaction pour obtenir un résultat.",

            mixState:
                "—",

            dosageState:
                "—",

            reactionState:
                "—",

            finalState:
                "—"

        };


        /*
           Réinitialisation complète du dosage
           calculé automatiquement.
        */

        updateDynamicDosageFromRecipient(
            true
        );


        renderRecipientStatus();

        renderMeasurements();


        setText(
            "reactionStatusTitle",
            "Prêt"
        );


        setText(
            "reactionStatusMessage",
            "Ajoutez les matériaux puis mélangez-les."
        );


        setText(
            "reactionStatusIcon",
            "●"
        );


        updateResult(
            "—",
            "—",
            "—",
            "—"
        );


        saveState();


        notify(
            "Le récipient a été vidé.",
            "success"
        );

    }


    /* ============================================================
       30 — RAPPORT
       ------------------------------------------------------------
       Le rapport ne lit PLUS jamais un nombre de sacs
       saisi manuellement.

       Il calcule :

       sacs = ciment réel / 42
    ============================================================ */

    function generateReport() {

        updateDynamicDosageFromRecipient(
            true
        );


        const validation =
            validateMix();


        const actualCement =
            componentQuantity(
                "cement"
            );


        const automaticBags =
            actualCement > 0
                ? actualCement /
                    CEMENT_BAG_KG
                : 0;


        const report = {

            date:
                new Date()
                    .toLocaleString(),

            type:
                validation.type ||
                state.dosage.type ||
                "mortier",

            bags:
                round(
                    automaticBags,
                    3
                ),

            cementKg:
                round(
                    actualCement,
                    3
                ),

            sandKg:
                round(
                    componentQuantity(
                        "sand"
                    ),
                    3
                ),

            gravelKg:
                round(
                    componentQuantity(
                        "gravel"
                    ),
                    3
                ),

            waterL:
                round(
                    componentQuantity(
                        "water"
                    ),
                    3
                ),

            expectedSandKg:
                round(
                    validation.expected
                        ? validation.expected.sand
                        : 0,
                    3
                ),

            expectedGravelKg:
                round(
                    validation.expected
                        ? validation.expected.gravel
                        : 0,
                    3
                ),

            expectedWaterL:
                round(
                    validation.expected
                        ? validation.expected.water
                        : 0,
                    3
                ),

            result:
                validation.valid
                    ? "Reaction reussie"
                    : "Mauvaise Melange"

        };


        state.reports.push(
            report
        );


        renderReports();


        saveState();


        notify(
            "Rapport généré.",
            "success"
        );


        return report;

    }


    function renderReports() {

        const container =
            byId(
                "reportContent"
            );


        if (!container) return;


        container.innerHTML =
            "";


        if (
            state.reports.length ===
            0
        ) {

            container.textContent =
                "Aucun rapport disponible.";

            return;

        }


        state.reports
            .slice()
            .reverse()
            .forEach(
                function (report) {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "fobas-civil-report-card";


                    card.innerHTML =
                        `
                        <strong>
                            Rapport Génie Civil FOBAS
                        </strong>

                        <span>
                            Date : ${report.date}
                        </span>

                        <span>
                            Type : ${report.type}
                        </span>

                        <span>
                            Sacs : ${formatNumber(report.bags, 3)}
                        </span>

                        <span>
                            Ciment : ${formatNumber(report.cementKg, 2)} kg
                        </span>

                        <span>
                            Sable : ${formatNumber(report.sandKg, 2)} kg
                        </span>

                        <span>
                            Gravier : ${formatNumber(report.gravelKg, 2)} kg
                        </span>

                        <span>
                            Eau : ${formatNumber(report.waterL, 2)} L
                        </span>

                        <strong>
                            ${report.result}
                        </strong>
                        `;


                    container.appendChild(
                        card
                    );

                }
            );

    }


    function clearReports() {

        state.reports =
            [];


        renderReports();


        saveState();


        notify(
            "Rapports supprimés.",
            "success"
        );

    }


    /* ============================================================
       31 — ÉQUIPEMENTS
    ============================================================ */

    function bindEquipment() {

        $$(
            "[data-equipment-id]"
        )
        .forEach(function (card) {

            if (
                card.dataset
                    .fobasCivilEquipment
            ) {

                return;

            }


            card.dataset
                .fobasCivilEquipment =
                "1";


            card.addEventListener(
                "click",
                function () {

                    const id =
                        card.getAttribute(
                            "data-equipment-id"
                        );


                    if (!id) return;


                    state.laboratory
                        .selectedEquipment =
                        id;


                    saveState();


                    const equipment =
                        state.equipment[id];


                    notify(
                        equipment &&
                        equipment.name
                            ? equipment.name +
                              " sélectionné."
                            : "Équipement sélectionné.",
                        "success"
                    );

                }
            );


            card.addEventListener(
                "dragstart",
                function (event) {

                    const id =
                        card.getAttribute(
                            "data-equipment-id"
                        );


                    event.dataTransfer.setData(
                        "text/plain",
                        JSON.stringify({

                            type:
                                "equipment",

                            equipmentId:
                                id

                        })
                    );

                }
            );

        });

    }


    /* ============================================================
       32 — ZOOM GLOBAL
    ============================================================ */

    function applyZoom(value) {

        const zoom =
            clamp(
                number(
                    value,
                    1
                ),
                0.70,
                1.50
            );


        state.app.zoom =
            round(
                zoom,
                2
            );


        const app =
            byId(
                "fobasCivilApp"
            );


        if (app) {

            app.style.setProperty(
                "--fobas-civil-zoom",
                String(zoom)
            );


            app.style.zoom =
                String(zoom);

        }


        setText(
            "zoomValue",
            Math.round(
                zoom * 100
            ) +
            "%"
        );


        setText(
            "footerZoomState",
            Math.round(
                zoom * 100
            ) +
            "%"
        );


        saveState();

    }


    function bindZoom() {

        const zoomIn =
            byId(
                "zoomInBtn"
            );


        const zoomOut =
            byId(
                "zoomOutBtn"
            );


        const zoomReset =
            byId(
                "zoomResetBtn"
            );


        if (
            zoomIn &&
            !zoomIn.dataset
                .fobasCivilZoom
        ) {

            zoomIn.dataset
                .fobasCivilZoom =
                "1";


            zoomIn.addEventListener(
                "click",
                function () {

                    applyZoom(
                        state.app.zoom +
                        0.10
                    );

                }
            );

        }


        if (
            zoomOut &&
            !zoomOut.dataset
                .fobasCivilZoom
        ) {

            zoomOut.dataset
                .fobasCivilZoom =
                "1";


            zoomOut.addEventListener(
                "click",
                function () {

                    applyZoom(
                        state.app.zoom -
                        0.10
                    );

                }
            );

        }


        if (
            zoomReset &&
            !zoomReset.dataset
                .fobasCivilZoom
        ) {

            zoomReset.dataset
                .fobasCivilZoom =
                "1";


            zoomReset.addEventListener(
                "click",
                function () {

                    applyZoom(
                        1
                    );

                }
            );

        }

    }


    /* ============================================================
       33 — CONTRÔLES PRINCIPAUX
    ============================================================ */

    function bindControls() {

        const mix =
            byId(
                "mixRecipientBtn"
            );


        if (
            mix &&
            !mix.dataset
                .fobasCivilBound
        ) {

            mix.dataset
                .fobasCivilBound =
                "1";


            mix.addEventListener(
                "click",
                mixRecipient
            );

        }


        const clear =
            byId(
                "clearRecipientBtn"
            );


        if (
            clear &&
            !clear.dataset
                .fobasCivilBound
        ) {

            clear.dataset
                .fobasCivilBound =
                "1";


            clear.addEventListener(
                "click",
                clearRecipient
            );

        }


        const measure =
            byId(
                "measureRecipientBtn"
            );


        if (
            measure &&
            !measure.dataset
                .fobasCivilBound
        ) {

            measure.dataset
                .fobasCivilBound =
                "1";


            measure.addEventListener(
                "click",
                function () {

                    renderMeasurements();


                    const panel =
                        measure.closest(
                            "[data-panel-content]"
                        );


                    if (panel) {

                        activatePanel(
                            panel.id
                        );

                    }


                    notify(
                        "Mesures actualisées.",
                        "success"
                    );

                }
            );

        }


        const tare =
            byId(
                "balanceTareBtn"
            );


        if (
            tare &&
            !tare.dataset
                .fobasCivilBound
        ) {

            tare.dataset
                .fobasCivilBound =
                "1";


            tare.addEventListener(
                "click",
                tareBalance
            );

        }


        const dosage =
            byId(
                "calculateDosageBtn"
            );


        if (
            dosage &&
            !dosage.dataset
                .fobasCivilBound
        ) {

            dosage.dataset
                .fobasCivilBound =
                "1";


            dosage.addEventListener(
                "click",
                calculateDosage
            );

        }


        const reaction =
            byId(
                "executeReactionBtn"
            );


        if (
            reaction &&
            !reaction.dataset
                .fobasCivilBound
        ) {

            reaction.dataset
                .fobasCivilBound =
                "1";


            reaction.addEventListener(
                "click",
                executeReaction
            );

        }


        const report =
            byId(
                "generateReportBtn"
            );


        if (
            report &&
            !report.dataset
                .fobasCivilBound
        ) {

            report.dataset
                .fobasCivilBound =
                "1";


            report.addEventListener(
                "click",
                generateReport
            );

        }


        const clearReport =
            byId(
                "clearReportBtn"
            );


        if (
            clearReport &&
            !clearReport.dataset
                .fobasCivilBound
        ) {

            clearReport.dataset
                .fobasCivilBound =
                "1";


            clearReport.addEventListener(
                "click",
                clearReports
            );

        }

    }


    /* ============================================================
       34 — STYLES DYNAMIQUES
    ============================================================ */

    function installDynamicStyles() {

        if (
            byId(
                "fobasCivilDynamicStyles"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "fobasCivilDynamicStyles";


        style.textContent = `

            #civilLaboratoryScene {
                position: relative;
            }

            .fobas-civil-workspace-material {
                position: absolute;
                transform: translate(-50%, -50%);
                min-width: 76px;
                min-height: 60px;
                padding: 8px;
                border: 1px solid rgba(255,255,255,.22);
                border-radius: 14px;
                background:
                    linear-gradient(
                        145deg,
                        rgba(12,27,50,.98),
                        rgba(30,55,88,.96)
                    );
                color: #fff;
                box-shadow:
                    0 12px 30px rgba(0,0,0,.30),
                    inset 0 1px 0 rgba(255,255,255,.15);
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 4px;
                font: inherit;
                transition:
                    transform .18s ease,
                    box-shadow .18s ease;
            }

            .fobas-civil-workspace-material:hover {
                transform:
                    translate(-50%, -50%)
                    scale(1.07);
                box-shadow:
                    0 16px 34px rgba(0,0,0,.38),
                    0 0 0 2px rgba(50,140,255,.30);
            }

            .fobas-civil-object-icon {
                font-size: 26px;
                line-height: 1;
            }

            .fobas-civil-object-name {
                font-size: 11px;
                font-weight: 800;
                white-space: nowrap;
            }

            .fobas-civil-recipient-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 9px 10px;
                margin-bottom: 7px;
                border-radius: 10px;
                background: rgba(30,50,80,.08);
            }

            .fobas-civil-report-card {
                display: grid;
                gap: 6px;
                padding: 14px;
                margin-bottom: 10px;
                border-radius: 12px;
                background: rgba(30,50,80,.08);
            }

            .material-selected {
                outline:
                    3px solid rgba(40,150,255,.55);
                outline-offset: 2px;
            }

            .material-dragging {
                opacity: .45;
            }

            .drop-ready {
                outline:
                    3px dashed rgba(40,150,255,.75);
                outline-offset: 5px;
            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* ============================================================
       35 — RENDU DOSAGE
       ------------------------------------------------------------
       Le rendu est lui aussi entièrement dynamique.

       Il ne lit plus :

           state.dosage.cementBags

       comme une valeur saisie.

       Il lit :

           componentQuantity("cement")
    ============================================================ */

    function renderDosage() {

        updateDynamicDosageFromRecipient(
            true
        );

    }


    /* ============================================================
       36 — RENDU INITIAL
    ============================================================ */

    function renderAll() {

        renderWorkspaceObjects();

        renderRecipientStatus();

        renderMeasurements();

        renderReports();

        renderDosage();


        if (
            state.result &&
            state.result.available
        ) {

            updateResult(

                state.result.mixState ||
                    "—",

                state.result.dosageState ||
                    "—",

                state.result.reactionState ||
                    "—",

                state.result.finalState ||
                    "—"

            );

        }

    }


    /* ============================================================
       37 — API PUBLIQUE
    ============================================================ */

    window.FOBAS_CIVIL_API = {

        addMaterial:
            addWorkspaceMaterial,

        addWorkspaceMaterial:
            addWorkspaceMaterial,

        transferMaterial:
            transferMaterial,

        mixRecipient:
            mixRecipient,

        clearRecipient:
            clearRecipient,

        calculateDosage:
            calculateDosage,

        updateDynamicDosage:
            updateDynamicDosageFromRecipient,

        validateMix:
            validateMix,

        executeReaction:
            executeReaction,

        generateReport:
            generateReport,

        clearReports:
            clearReports,

        renderWorkspaceObjects:
            renderWorkspaceObjects,

        renderRecipientStatus:
            renderRecipientStatus,

        renderDosage:
            renderDosage,

        saveState:
            saveState,

        getMaterial:
            getMaterial,

        getState:
            function () {

                return state;

            },

        constants: {

            CEMENT_BAG_KG:
                CEMENT_BAG_KG,

            MIX_TOLERANCE:
                MIX_TOLERANCE

        }

    };


    /* ============================================================
       38 — INITIALISATION
    ============================================================ */

    function init() {

        installDynamicStyles();

        bindNavigation();

        bindControls();

        bindZoom();

        bindMaterialCards();

        bindEquipment();

        setupRecipientDrop();

        setupTransferModal();

        setupLaboratoryDrop();


        /*
           Important :
           le dosage est synchronisé avec
           le contenu réel du récipient dès
           le lancement.
        */

        updateDynamicDosageFromRecipient(
            true
        );


        renderAll();


        applyZoom(
            number(
                state.app.zoom,
                1
            )
        );


        activatePanel(
            state.activePanel ||
            "laboratoryPanel"
        );


        setText(
            "engineStatusText",
            "Système prêt"
        );


        setText(
            "engineStateText",
            "Opérationnel"
        );


        setText(
            "footerEngineState",
            APP_ID
        );


        saveState();


        console.info(
            "FOBAS Civil Engine initialisé."
        );


        console.info(
            "RÈGLE : 1 sac de ciment = 42 kg."
        );


        console.info(
            "DOSAGE BÉTON : 42 kg ciment = 84 kg sable + 126 kg gravier + 21 L eau."
        );

    }


    /* ============================================================
       39 — DÉMARRAGE
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


