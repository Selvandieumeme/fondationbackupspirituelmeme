/* ================================================================
   FOBAS OPTIQUE
   ---------------------------------------------------------------
   MOTEUR 3D INTERACTIF DE LABORATOIRE OPTIQUE
   Version : 2.0.0 — REAL 3D OPTICAL LAB ENGINE
   ---------------------------------------------------------------
   Architecture :
   01 — Configuration
   02 — État global
   03 — Chargement Three.js
   04 — Initialisation 3D
   05 — Éclairage / environnement
   06 — Banc optique
   07 — Bibliothèque de composants
   08 — Création des composants 3D
   09 — Ray Tracing
   10 — Réflexion
   11 — Réfraction
   12 — Lentilles
   13 — Miroirs
   14 — Interaction
   15 — Sélection
   16 — Déplacement
   17 — Rotation
   18 — Mise à l'échelle
   19 — Caméra
   20 — Mesures
   21 — Propriétés
   22 — Expériences
   23 — Missions
   24 — Résultats
   25 — Sauvegarde
   26 — Import / Export
   27 — Interface
   28 — Boutons
   29 — Raccourcis clavier
   30 — Responsive
   31 — Animation
   32 — Sécurité / récupération
   33 — Démarrage
   ---------------------------------------------------------------
   IMPORTANT :
   - Ce fichier est autonome.
   - Il ne modifie aucun système pédagogique FOBAS.
   - Les objets sont générés en 3D.
   - Les actions principales sont reliées aux contrôles HTML.
================================================================ */


/* ================================================================
   01 — CONFIGURATION GLOBALE
================================================================ */

(() => {

    "use strict";

    const FOBAS_OPTICS_VERSION = "2.0.0";

    const CONFIG = {

        canvasSelector: "#optics3dCanvas",

        storageKey: "FOBAS_OPTIQUE_3D_STATE",

        sceneWidth: 30,
        sceneHeight: 14,
        sceneDepth: 18,

        benchLength: 24,
        benchWidth: 3.2,
        benchHeight: 0.55,

        defaultRayIntensity: 1,

        rayColor: 0xff3cff,

        backgroundColor: 0x06101d,

        gridColor: 0x1a4b6b,

        selectionColor: 0x00e5ff,

        maxObjects: 300,

        raySegments: 120,

        animationSpeed: 1,

        units: "cm",

        autoSaveDelay: 800

    };


/* ================================================================
   02 — ÉTAT GLOBAL
================================================================ */

    const STATE = {

        initialized: false,

        threeLoaded: false,

        running: true,

        renderMode: "realistic",

        interactionMode: "select",

        cameraMode: "perspective",

        selectedObject: null,

        selectedId: null,

        hoveredObject: null,

        objects: [],

        rays: [],

        measurements: [],

        experiments: [],

        missions: [],

        results: [],

        history: [],

        historyIndex: -1,

        rayTracingEnabled: true,

        shadowsEnabled: true,

        gridEnabled: true,

        labelsEnabled: true,

        snapEnabled: true,

        autoSave: true,

        showHelp: false,

        intensity: 1,

        time: 0,

        lastFrame: performance.now(),

        cameraDistance: 25,

        cameraTheta: Math.PI / 4,

        cameraPhi: Math.PI / 3,

        pointer: {

            x: 0,

            y: 0,

            down: false,

            moved: false,

            startX: 0,

            startY: 0

        },

        drag: {

            active: false,

            object: null,

            plane: null,

            offset: null

        },

        measurementsLive: {

            distance: 0,

            angle: 0,

            focalLength: 0,

            imageDistance: 0,

            objectDistance: 0,

            magnification: 0,

            refractiveIndex: 1

        }

    };


/* ================================================================
   03 — RÉFÉRENCES THREE.JS
================================================================ */

    let THREE = window.THREE || null;

    let OrbitControls = null;

    let scene = null;

    let camera = null;

    let renderer = null;

    let controls = null;

    let raycaster = null;

    let pointerVector = null;

    let world = null;

    let laboratoryGroup = null;

    let objectsGroup = null;

    let raysGroup = null;

    let helpersGroup = null;

    let labelsGroup = null;

    let selectionGroup = null;

    let gridHelper = null;

    let benchGroup = null;

    let measurementGroup = null;

    let animationFrame = null;

    let autoSaveTimer = null;

    let transformPlane = null;

    let selectionBox = null;


/* ================================================================
   04 — OUTILS GÉNÉRAUX
================================================================ */

    const $ = selector => document.querySelector(selector);

    const $$ = selector => Array.from(document.querySelectorAll(selector));

    function byId(id) {

        return document.getElementById(id);

    }

    function exists(element) {

        return !!element;

    }

    function clamp(value, min, max) {

        return Math.max(min, Math.min(max, value));

    }

    function uid(prefix = "opt") {

        return `${prefix}_${Date.now().toString(36)}_${Math.random()
            .toString(36)
            .slice(2, 8)}`;

    }

    function degToRad(value) {

        return Number(value) * Math.PI / 180;

    }

    function radToDeg(value) {

        return Number(value) * 180 / Math.PI;

    }

    function round(value, decimals = 2) {

        const factor = Math.pow(10, decimals);

        return Math.round(Number(value) * factor) / factor;

    }

    function safeNumber(value, fallback = 0) {

        const n = Number(value);

        return Number.isFinite(n) ? n : fallback;

    }

    function escapeHTML(value) {

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }

    function notify(message, type = "info", duration = 3000) {

        const container =
            byId("notificationContainer") ||
            document.querySelector(".notification-container");

        if (!container) {

            console.log(`[FOBAS OPTIQUE] ${message}`);

            return;

        }

        const notification = document.createElement("div");

        notification.className = `fobas-notification ${type}`;

        notification.textContent = message;

        container.appendChild(notification);

        requestAnimationFrame(() => {

            notification.classList.add("show");

        });

        setTimeout(() => {

            notification.classList.remove("show");

            setTimeout(() => notification.remove(), 350);

        }, duration);

    }


/* ================================================================
   05 — CHARGEMENT THREE.JS
================================================================ */

    function loadScript(src) {

        return new Promise((resolve, reject) => {

            const existing =
                document.querySelector(`script[src="${src}"]`);

            if (existing) {

                existing.addEventListener("load", resolve, { once: true });

                existing.addEventListener("error", reject, { once: true });

                if (window.THREE) {

                    resolve();

                }

                return;

            }

            const script = document.createElement("script");

            script.src = src;

            script.async = true;

            script.onload = resolve;

            script.onerror = reject;

            document.head.appendChild(script);

        });

    }

    async function loadThreeJS() {

        if (window.THREE) {

            THREE = window.THREE;

            STATE.threeLoaded = true;

            return true;

        }

        try {

            await loadScript(
                "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.min.js"
            );

            THREE = window.THREE;

            if (!THREE) {

                throw new Error("Three.js non disponible.");

            }

            STATE.threeLoaded = true;

            return true;

        } catch (error) {

            console.error(error);

            showRenderError(
                "Le moteur 3D n'a pas pu être chargé.",
                "Vérifiez votre connexion Internet ou ajoutez Three.js localement."
            );

            return false;

        }

    }

    async function loadOrbitControls() {

        if (!THREE) return false;

        try {

            if (THREE.OrbitControls) {

                OrbitControls = THREE.OrbitControls;

                return true;

            }

            await loadScript(
                "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/js/controls/OrbitControls.js"
            );

            OrbitControls =
                THREE.OrbitControls ||
                window.OrbitControls ||
                null;

            return !!OrbitControls;

        } catch (error) {

            console.warn(
                "OrbitControls non disponible. Contrôle caméra manuel activé.",
                error
            );

            return false;

        }

    }


/* ================================================================
   06 — INITIALISATION PRINCIPALE
================================================================ */

    async function initFOBASOptique() {

        if (STATE.initialized) return;

        showLoading(true, 5, "Initialisation du laboratoire...");

        const loaded = await loadThreeJS();

        if (!loaded) return;

        showLoading(true, 18, "Chargement du moteur de caméra...");

        await loadOrbitControls();

        showLoading(true, 30, "Construction de la scène 3D...");

        if (!initScene()) {

            return;

        }

        showLoading(true, 45, "Construction du laboratoire optique...");

        createLaboratory();

        showLoading(true, 58, "Chargement des composants optiques...");

        registerComponentLibrary();

        showLoading(true, 68, "Activation de la physique optique...");

        createPhysicsHelpers();

        showLoading(true, 78, "Connexion des interactions...");

        bindInterface();

        showLoading(true, 88, "Restauration du laboratoire...");

        restoreState();

        showLoading(true, 95, "Finalisation...");

        createDefaultScene();

        STATE.initialized = true;

        updateAllUI();

        showLoading(true, 100, "Laboratoire prêt");

        setTimeout(() => {

            showLoading(false);

            notify(
                "FOBAS OPTIQUE — laboratoire 3D prêt.",
                "success",
                4000
            );

        }, 450);

        animate();

    }


/* ================================================================
   07 — SCÈNE 3D
================================================================ */

    function initScene() {

        const canvas =
            byId("optics3dCanvas") ||
            document.querySelector(CONFIG.canvasSelector);

        if (!canvas) {

            showRenderError(
                "Canvas 3D introuvable.",
                "L'élément #optics3dCanvas doit être présent dans le HTML."
            );

            return false;

        }

        scene = new THREE.Scene();

        scene.background =
            new THREE.Color(CONFIG.backgroundColor);

        scene.fog =
            new THREE.FogExp2(
                CONFIG.backgroundColor,
                0.018
            );

        camera =
            new THREE.PerspectiveCamera(
                48,
                1,
                0.1,
                1000
            );

        camera.position.set(
            17,
            12,
            18
        );

        renderer =
            new THREE.WebGLRenderer({

                canvas,

                antialias: true,

                alpha: false,

                powerPreference: "high-performance"

            });

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, 2)
        );

        renderer.shadowMap.enabled = true;

        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        renderer.outputColorSpace =
            THREE.SRGBColorSpace;

        renderer.toneMapping =
            THREE.ACESFilmicToneMapping;

        renderer.toneMappingExposure = 1.12;

        if (OrbitControls) {

            controls =
                new OrbitControls(
                    camera,
                    renderer.domElement
                );

            controls.enableDamping = true;

            controls.dampingFactor = 0.06;

            controls.minDistance = 6;

            controls.maxDistance = 65;

            controls.maxPolarAngle =
                Math.PI * 0.49;

            controls.target.set(
                0,
                2,
                0
            );

        }

        raycaster = new THREE.Raycaster();

        pointerVector = new THREE.Vector2();

        world = new THREE.Group();

        laboratoryGroup = new THREE.Group();

        objectsGroup = new THREE.Group();

        raysGroup = new THREE.Group();

        helpersGroup = new THREE.Group();

        labelsGroup = new THREE.Group();

        selectionGroup = new THREE.Group();

        measurementGroup = new THREE.Group();

        scene.add(world);

        world.add(laboratoryGroup);

        world.add(objectsGroup);

        world.add(raysGroup);

        world.add(helpersGroup);

        world.add(labelsGroup);

        world.add(selectionGroup);

        world.add(measurementGroup);

        transformPlane =
            new THREE.Plane(
                new THREE.Vector3(0, 1, 0),
                -0.8
            );

        window.addEventListener(
            "resize",
            resizeRenderer
        );

        renderer.domElement.addEventListener(
            "pointerdown",
            handlePointerDown
        );

        renderer.domElement.addEventListener(
            "pointermove",
            handlePointerMove
        );

        renderer.domElement.addEventListener(
            "pointerup",
            handlePointerUp
        );

        renderer.domElement.addEventListener(
            "dblclick",
            handleDoubleClick
        );

        renderer.domElement.addEventListener(
            "wheel",
            handleWheel,
            { passive: false }
        );

        resizeRenderer();

        return true;

    }


/* ================================================================
   08 — ÉCLAIRAGE / ENVIRONNEMENT
================================================================ */

    function createPhysicsHelpers() {

        if (!scene) return;

        const ambient =
            new THREE.HemisphereLight(
                0xbfe9ff,
                0x08101c,
                1.6
            );

        ambient.name = "FOBAS_Ambient_Light";

        laboratoryGroup.add(ambient);

        const keyLight =
            new THREE.DirectionalLight(
                0xffffff,
                3.0
            );

        keyLight.position.set(
            8,
            15,
            10
        );

        keyLight.castShadow = true;

        keyLight.shadow.mapSize.width = 2048;

        keyLight.shadow.mapSize.height = 2048;

        keyLight.shadow.camera.left = -25;

        keyLight.shadow.camera.right = 25;

        keyLight.shadow.camera.top = 25;

        keyLight.shadow.camera.bottom = -25;

        keyLight.shadow.bias = -0.0005;

        laboratoryGroup.add(keyLight);

        const fill =
            new THREE.PointLight(
                0x238cff,
                80,
                35
            );

        fill.position.set(
            -10,
            8,
            7
        );

        laboratoryGroup.add(fill);

        const warm =
            new THREE.PointLight(
                0xffb45c,
                55,
                28
            );

        warm.position.set(
            12,
            5,
            -7
        );

        laboratoryGroup.add(warm);

        createGrid();

    }

    function createGrid() {

        if (gridHelper) {

            helpersGroup.remove(gridHelper);

        }

        gridHelper =
            new THREE.GridHelper(
                40,
                80,
                CONFIG.gridColor,
                0x0c2334
            );

        gridHelper.position.y = 0;

        gridHelper.name = "FOBAS_Grid";

        helpersGroup.add(gridHelper);

    }


/* ================================================================
   09 — LABORATOIRE / BANC OPTIQUE
================================================================ */

    function createLaboratory() {

        benchGroup = new THREE.Group();

        benchGroup.name =
            "FOBAS_OPTICAL_BENCH";

        laboratoryGroup.add(benchGroup);

        createFloor();

        createOpticalBench();

        createBenchScale();

        createLaboratoryBackWall();

        createBenchMarkers();

    }

    function createFloor() {

        const geometry =
            new THREE.PlaneGeometry(
                60,
                50
            );

        const material =
            new THREE.MeshStandardMaterial({

                color: 0x08121c,

                roughness: 0.78,

                metalness: 0.15

            });

        const floor =
            new THREE.Mesh(
                geometry,
                material
            );

        floor.rotation.x = -Math.PI / 2;

        floor.receiveShadow = true;

        floor.name =
            "FOBAS_Laboratory_Floor";

        laboratoryGroup.add(floor);

    }

    function createOpticalBench() {

        const topGeometry =
            new THREE.BoxGeometry(
                CONFIG.benchLength,
                CONFIG.benchHeight,
                CONFIG.benchWidth
            );

        const topMaterial =
            new THREE.MeshPhysicalMaterial({

                color: 0x202a34,

                metalness: 0.82,

                roughness: 0.28,

                clearcoat: 0.45,

                clearcoatRoughness: 0.2

            });

        const top =
            new THREE.Mesh(
                topGeometry,
                topMaterial
            );

        top.position.y = 1.05;

        top.castShadow = true;

        top.receiveShadow = true;

        top.name =
            "FOBAS_Optical_Bench_Surface";

        benchGroup.add(top);

        const railGeometry =
            new THREE.BoxGeometry(
                CONFIG.benchLength - 0.6,
                0.22,
                0.65
            );

        const railMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x697986,

                metalness: 0.92,

                roughness: 0.23

            });

        const rail =
            new THREE.Mesh(
                railGeometry,
                railMaterial
            );

        rail.position.set(
            0,
            1.25,
            0
        );

        rail.castShadow = true;

        benchGroup.add(rail);

        const legMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x111820,

                metalness: 0.72,

                roughness: 0.38

            });

        [-8.5, 8.5].forEach(x => {

            [-0.95, 0.95].forEach(z => {

                const leg =
                    new THREE.Mesh(
                        new THREE.BoxGeometry(
                            0.45,
                            1.05,
                            0.45
                        ),
                        legMaterial
                    );

                leg.position.set(
                    x,
                    0.52,
                    z
                );

                leg.castShadow = true;

                benchGroup.add(leg);

            });

        });

        const support =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    18,
                    0.22,
                    2.1
                ),
                legMaterial
            );

        support.position.y = 0.18;

        support.castShadow = true;

        benchGroup.add(support);

    }

    function createBenchScale() {

        for (
            let x = -11;
            x <= 11;
            x += 0.5
        ) {

            const major =
                Math.abs(x % 1) < 0.01;

            const height =
                major ? 0.16 : 0.08;

            const marker =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.018,
                        height,
                        0.35
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0xb7d8ec
                    })
                );

            marker.position.set(
                x,
                1.38,
                0
            );

            benchGroup.add(marker);

        }

    }

    function createLaboratoryBackWall() {

        const wall =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    45,
                    18,
                    0.25
                ),
                new THREE.MeshStandardMaterial({

                    color: 0x0b1824,

                    roughness: 0.82,

                    metalness: 0.05

                })
            );

        wall.position.set(
            0,
            7,
            -10
        );

        wall.receiveShadow = true;

        laboratoryGroup.add(wall);

        for (
            let x = -18;
            x <= 18;
            x += 3
        ) {

            const panel =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        2.7,
                        12,
                        0.08
                    ),
                    new THREE.MeshStandardMaterial({

                        color: 0x102332,

                        roughness: 0.55,

                        metalness: 0.18

                    })
                );

            panel.position.set(
                x,
                6.8,
                -9.82
            );

            laboratoryGroup.add(panel);

        }

    }

    function createBenchMarkers() {

        const positions = [
            -9,
            -6,
            -3,
            0,
            3,
            6,
            9
        ];

        positions.forEach(x => {

            const marker =
                new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        0.08,
                        0.08,
                        0.05,
                        16
                    ),
                    new THREE.MeshStandardMaterial({

                        color: 0x00c8ff,

                        emissive: 0x003b52,

                        emissiveIntensity: 2

                    })
                );

            marker.rotation.x =
                Math.PI / 2;

            marker.position.set(
                x,
                1.38,
                0
            );

            benchGroup.add(marker);

        });

    }


/* ================================================================
   10 — BIBLIOTHÈQUE DE COMPOSANTS
================================================================ */

    const COMPONENTS = {};

    function registerComponentLibrary() {

        Object.assign(
            COMPONENTS,
            {

                laser: {

                    id: "laser",

                    name: "Source Laser",

                    description:
                        "Source lumineuse cohérente",

                    icon: "🔴",

                    category: "source",

                    color: 0xff2b3d

                },

                lamp: {

                    id: "lamp",

                    name: "Lampe",

                    description:
                        "Source lumineuse blanche",

                    icon: "💡",

                    category: "source",

                    color: 0xffd86b

                },

                lensConvex: {

                    id: "lensConvex",

                    name: "Lentille convergente",

                    description:
                        "Lentille biconvexe",

                    icon: "🔵",

                    category: "lens",

                    focalLength: 5,

                    refractiveIndex: 1.5,

                    color: 0x4fc3ff

                },

                lensConcave: {

                    id: "lensConcave",

                    name: "Lentille divergente",

                    description:
                        "Lentille biconcave",

                    icon: "🟦",

                    category: "lens",

                    focalLength: -5,

                    refractiveIndex: 1.5,

                    color: 0x63d5ff

                },

                mirrorPlane: {

                    id: "mirrorPlane",

                    name: "Miroir plan",

                    description:
                        "Surface réfléchissante plane",

                    icon: "◼",

                    category: "mirror",

                    color: 0xcad8e6

                },

                mirrorConcave: {

                    id: "mirrorConcave",

                    name: "Miroir concave",

                    description:
                        "Miroir convergent",

                    icon: "◖",

                    category: "mirror",

                    color: 0xd9e5f2,

                    focalLength: 4

                },

                mirrorConvex: {

                    id: "mirrorConvex",

                    name: "Miroir convexe",

                    description:
                        "Miroir divergent",

                    icon: "◗",

                    category: "mirror",

                    color: 0xd9e5f2,

                    focalLength: -4

                },

                prism: {

                    id: "prism",

                    name: "Prisme",

                    description:
                        "Prisme dispersif",

                    icon: "🔺",

                    category: "prism",

                    color: 0x75d9ff,

                    refractiveIndex: 1.52

                },

                screen: {

                    id: "screen",

                    name: "Écran",

                    description:
                        "Écran de projection",

                    icon: "▣",

                    category: "instrument",

                    color: 0xd9e0e6

                },

                sensor: {

                    id: "sensor",

                    name: "Capteur",

                    description:
                        "Capteur optique",

                    icon: "◉",

                    category: "instrument",

                    color: 0x55ffb1

                },

                ruler: {

                    id: "ruler",

                    name: "Règle optique",

                    description:
                        "Mesure des distances",

                    icon: "📏",

                    category: "instrument",

                    color: 0xd0d6dc

                },

                protractor: {

                    id: "protractor",

                    name: "Rapporteur",

                    description:
                        "Mesure angulaire",

                    icon: "◡",

                    category: "instrument",

                    color: 0xd0d6dc

                },

                aperture: {

                    id: "aperture",

                    name: "Diaphragme",

                    description:
                        "Contrôle de l'ouverture",

                    icon: "◎",

                    category: "instrument",

                    color: 0x4c5964

                },

                object: {

                    id: "object",

                    name: "Objet lumineux",

                    description:
                        "Objet utilisé pour former une image",

                    icon: "⭐",

                    category: "object",

                    color: 0xffd35a

                }

            }
        );

        renderComponentLibrary();

    }


/* ================================================================
   11 — AFFICHAGE BIBLIOTHÈQUE
================================================================ */

    function renderComponentLibrary(filter = "") {

        const library =
            document.querySelector(".component-library");

        if (!library) return;

        const normalized =
            String(filter).trim().toLowerCase();

        const items =
            Object.values(COMPONENTS)
                .filter(component => {

                    if (!normalized) return true;

                    return (
                        component.name
                            .toLowerCase()
                            .includes(normalized) ||

                        component.description
                            .toLowerCase()
                            .includes(normalized) ||

                        component.category
                            .toLowerCase()
                            .includes(normalized)

                    );

                });

        library.innerHTML = "";

        if (!items.length) {

            library.innerHTML = `
                <div class="library-empty">
                    <div>🔍</div>
                    <strong>Aucun composant</strong>
                    <span>Essayez une autre recherche.</span>
                </div>
            `;

            return;

        }

        items.forEach(component => {

            const card =
                document.createElement("button");

            card.type = "button";

            card.className = "component-card";

            card.dataset.component =
                component.id;

            card.innerHTML = `
                <span class="component-icon">
                    ${component.icon}
                </span>

                <span class="component-name">
                    ${escapeHTML(component.name)}
                </span>

                <span class="component-description">
                    ${escapeHTML(component.description)}
                </span>
            `;

            card.addEventListener(
                "click",
                () => addComponent(component.id)
            );

            library.appendChild(card);

        });

    }


/* ================================================================
   12 — CRÉATION DES OBJETS
================================================================ */

    function createOpticalObject(type, position = null) {

        if (!THREE) return null;

        const definition =
            COMPONENTS[type];

        if (!definition) {

            notify(
                `Composant inconnu : ${type}`,
                "error"
            );

            return null;

        }

        let group =
            new THREE.Group();

        group.name =
            `${definition.name}_${uid("obj")}`;

        group.userData = {

            fobasObject: true,

            id: uid("object"),

            type,

            name: definition.name,

            category: definition.category,

            description: definition.description,

            focalLength:
                definition.focalLength ?? 0,

            refractiveIndex:
                definition.refractiveIndex ?? 1.5,

            rotationZ: 0,

            scaleValue: 1,

            movable: true,

            selectable: true

        };

        switch (type) {

            case "laser":

                buildLaser(group);

                break;

            case "lamp":

                buildLamp(group);

                break;

            case "lensConvex":

                buildConvexLens(group);

                break;

            case "lensConcave":

                buildConcaveLens(group);

                break;

            case "mirrorPlane":

                buildPlaneMirror(group);

                break;

            case "mirrorConcave":

                buildConcaveMirror(group);

                break;

            case "mirrorConvex":

                buildConvexMirror(group);

                break;

            case "prism":

                buildPrism(group);

                break;

            case "screen":

                buildScreen(group);

                break;

            case "sensor":

                buildSensor(group);

                break;

            case "ruler":

                buildRuler(group);

                break;

            case "protractor":

                buildProtractor(group);

                break;

            case "aperture":

                buildAperture(group);

                break;

            case "object":

                buildObjectMarker(group);

                break;

            default:

                buildGenericObject(
                    group,
                    definition.color
                );

        }

        const p =
            position ||
            findFreeBenchPosition();

        group.position.copy(p);

        objectsGroup.add(group);

        STATE.objects.push(group);

        enableShadows(group);

        registerHistory();

        scheduleAutoSave();

        selectObject(group);

        recalculatePhysics();

        return group;

    }


/* ================================================================
   13 — OBJETS OPTIQUES 3D
================================================================ */

    function buildLaser(group) {

        const bodyMaterial =
            new THREE.MeshPhysicalMaterial({

                color: 0x202932,

                metalness: 0.85,

                roughness: 0.24,

                clearcoat: 0.65

            });

        const body =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.34,
                    0.34,
                    2.2,
                    32
                ),
                bodyMaterial
            );

        body.rotation.z =
            Math.PI / 2;

        body.castShadow = true;

        group.add(body);

        const emitter =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.19,
                    0.19,
                    0.2,
                    24
                ),
                new THREE.MeshStandardMaterial({

                    color: 0x33070d,

                    emissive: 0xff0033,

                    emissiveIntensity: 2.5

                })
            );

        emitter.rotation.z =
            Math.PI / 2;

        emitter.position.x = 1.15;

        group.add(emitter);

        const glow =
            new THREE.PointLight(
                0xff1744,
                2,
                4
            );

        glow.position.x = 1.3;

        group.add(glow);

        const mount =
            createMount();

        mount.position.y = -0.7;

        group.add(mount);

        createRayEmitter(group);

    }

    function buildLamp(group) {

        const stand =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.12,
                    0.2,
                    1.2,
                    20
                ),
                new THREE.MeshStandardMaterial({

                    color: 0x788b99,

                    metalness: 0.7,

                    roughness: 0.3

                })
            );

        stand.position.y = 0.4;

        group.add(stand);

        const bulb =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.42,
                    32,
                    20
                ),
                new THREE.MeshPhysicalMaterial({

                    color: 0xffe6a4,

                    emissive: 0xffa600,

                    emissiveIntensity: 2.8,

                    transmission: 0.18,

                    roughness: 0.18

                })
            );

        bulb.position.y = 1.1;

        group.add(bulb);

        const light =
            new THREE.PointLight(
                0xffc96b,
                6,
                12
            );

        light.position.y = 1.1;

        group.add(light);

        createMount(group);

    }

    function buildConvexLens(group) {

        const lens =
            createLensGeometry(
                false,
                1.05,
                0.22
            );

        const material =
            createGlassMaterial(
                0x65d8ff
            );

        const mesh =
            new THREE.Mesh(
                lens,
                material
            );

        mesh.rotation.y =
            Math.PI / 2;

        mesh.castShadow = true;

        group.add(mesh);

        addLensRim(group);

        const mount =
            createMount();

        mount.position.y = -1.25;

        group.add(mount);

    }

    function buildConcaveLens(group) {

        const lens =
            createLensGeometry(
                true,
                1.05,
                0.22
            );

        const material =
            createGlassMaterial(
                0x58cfff
            );

        const mesh =
            new THREE.Mesh(
                lens,
                material
            );

        mesh.rotation.y =
            Math.PI / 2;

        mesh.castShadow = true;

        group.add(mesh);

        addLensRim(group);

        const mount =
            createMount();

        mount.position.y = -1.25;

        group.add(mount);

    }

    function buildPlaneMirror(group) {

        const frame =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.25,
                    3.2,
                    2.6
                ),
                new THREE.MeshStandardMaterial({

                    color: 0x303b45,

                    metalness: 0.75,

                    roughness: 0.27

                })
            );

        group.add(frame);

        const mirror =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.08,
                    2.8,
                    2.25
                ),
                new THREE.MeshPhysicalMaterial({

                    color: 0xbfd6e7,

                    metalness: 0.95,

                    roughness: 0.08,

                    clearcoat: 1

                })
            );

        mirror.position.x = 0.16;

        mirror.castShadow = true;

        group.add(mirror);

        const mount =
            createMount();

        mount.position.y = -2;

        group.add(mount);

    }

    function buildConcaveMirror(group) {

        const mirror =
            createCurvedMirror(
                true
            );

        group.add(mirror);

        const mount =
            createMount();

        mount.position.y = -1.8;

        group.add(mount);

    }

    function buildConvexMirror(group) {

        const mirror =
            createCurvedMirror(
                false
            );

        group.add(mirror);

        const mount =
            createMount();

        mount.position.y = -1.8;

        group.add(mount);

    }

    function buildPrism(group) {

        const geometry =
            new THREE.CylinderGeometry(
                1.25,
                1.25,
                2.2,
                3
            );

        const material =
            createGlassMaterial(
                0x62d7ff
            );

        const prism =
            new THREE.Mesh(
                geometry,
                material
            );

        prism.rotation.z =
            Math.PI / 2;

        prism.castShadow = true;

        group.add(prism);

        const mount =
            createMount();

        mount.position.y = -1.55;

        group.add(mount);

    }

    function buildScreen(group) {

        const panel =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.2,
                    3.2,
                    3.5
                ),
                new THREE.MeshPhysicalMaterial({

                    color: 0xe8eef3,

                    roughness: 0.48,

                    metalness: 0.08

                })
            );

        panel.castShadow = true;

        group.add(panel);

        const frame =
            new THREE.LineSegments(
                new THREE.EdgesGeometry(
                    new THREE.BoxGeometry(
                        0.24,
                        3.3,
                        3.6
                    )
                ),
                new THREE.LineBasicMaterial({
                    color: 0x79a0b8
                })
            );

        group.add(frame);

        const mount =
            createMount();

        mount.position.y = -1.9;

        group.add(mount);

    }

    function buildSensor(group) {

        const body =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.65,
                    0.65,
                    0.65
                ),
                new THREE.MeshStandardMaterial({

                    color: 0x202d35,

                    metalness: 0.7,

                    roughness: 0.28

                })
            );

        body.castShadow = true;

        group.add(body);

        const detector =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.22,
                    0.22,
                    0.1,
                    32
                ),
                new THREE.MeshStandardMaterial({

                    color: 0x13251f,

                    emissive: 0x00ff9a,

                    emissiveIntensity: 1.5

                })
            );

        detector.rotation.z =
            Math.PI / 2;

        detector.position.x = 0.36;

        group.add(detector);

        const mount =
            createMount();

        mount.position.y = -0.85;

        group.add(mount);

    }

    function buildRuler(group) {

        const body =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    6,
                    0.08,
                    0.35
                ),
                new THREE.MeshStandardMaterial({

                    color: 0xd9e0e5,

                    metalness: 0.25,

                    roughness: 0.45

                })
            );

        group.add(body);

        for (
            let x = -3;
            x <= 3;
            x += 0.25
        ) {

            const major =
                Math.abs(x % 1) < 0.01;

            const tick =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.015,
                        major ? 0.16 : 0.08,
                        0.03
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0x17232d
                    })
                );

            tick.position.set(
                x,
                major ? 0.09 : 0.07,
                0
            );

            group.add(tick);

        }

    }

    function buildProtractor(group) {

        const curve =
            new THREE.EllipseCurve(
                0,
                0,
                1.7,
                1.7,
                0,
                Math.PI,
                false,
                0
            );

        const points =
            curve.getPoints(64);

        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints(points);

        const line =
            new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial({
                    color: 0xcbd6df
                })
            );

        line.rotation.x =
            -Math.PI / 2;

        group.add(line);

    }

    function buildAperture(group) {

        const ring =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    0.85,
                    0.12,
                    16,
                    48
                ),
                new THREE.MeshStandardMaterial({

                    color: 0x394852,

                    metalness: 0.85,

                    roughness: 0.23

                })
            );

        ring.rotation.y =
            Math.PI / 2;

        group.add(ring);

        const hole =
            new THREE.Mesh(
                new THREE.CircleGeometry(
                    0.58,
                    48
                ),
                new THREE.MeshBasicMaterial({
                    color: 0x02070b
                })
            );

        hole.rotation.y =
            Math.PI / 2;

        hole.position.x = 0.01;

        group.add(hole);

        const mount =
            createMount();

        mount.position.y = -1.2;

        group.add(mount);

    }

    function buildObjectMarker(group) {

        const geometry =
            new THREE.ConeGeometry(
                0.65,
                2.5,
                3
            );

        const material =
            new THREE.MeshStandardMaterial({

                color: 0xffc928,

                emissive: 0x5c3b00,

                emissiveIntensity: 0.8,

                metalness: 0.15,

                roughness: 0.32

            });

        const object =
            new THREE.Mesh(
                geometry,
                material
            );

        object.rotation.z =
            -Math.PI / 2;

        object.castShadow = true;

        group.add(object);

        createMount(group);

    }

    function buildGenericObject(group, color) {

        const mesh =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1,
                    1,
                    1
                ),
                new THREE.MeshStandardMaterial({
                    color
                })
            );

        group.add(mesh);

    }


/* ================================================================
   14 — GÉOMÉTRIE OPTIQUE
================================================================ */

    function createLensGeometry(
        concave = false,
        radius = 1,
        thickness = 0.22
    ) {

        const shape =
            new THREE.Shape();

        const width =
            concave ? 0.35 : 0.75;

        const height = radius;

        shape.moveTo(
            -width,
            -height
        );

        shape.quadraticCurveTo(
            0,
            -height * 0.35,
            width,
            -height
        );

        shape.lineTo(
            width,
            height
        );

        shape.quadraticCurveTo(
            0,
            height * 0.35,
            -width,
            height
        );

        shape.closePath();

        const geometry =
            new THREE.ExtrudeGeometry(
                shape,
                {

                    depth: thickness,

                    bevelEnabled: true,

                    bevelSegments: 5,

                    bevelSize: 0.035,

                    bevelThickness: 0.025,

                    curveSegments: 12

                }
            );

        geometry.center();

        if (concave) {

            geometry.scale(
                0.65,
                1,
                1
            );

        }

        return geometry;

    }

    function createGlassMaterial(color) {

        return new THREE.MeshPhysicalMaterial({

            color,

            transmission: 0.68,

            opacity: 0.55,

            transparent: true,

            roughness: 0.08,

            metalness: 0.04,

            thickness: 0.35,

            ior: 1.5,

            clearcoat: 0.8,

            clearcoatRoughness: 0.1,

            side: THREE.DoubleSide

        });

    }

    function createCurvedMirror(concave) {

        const shape =
            new THREE.Shape();

        const width = 0.75;

        const height = 1.6;

        shape.moveTo(
            0,
            -height
        );

        shape.quadraticCurveTo(
            concave ? -width : width,
            0,
            0,
            height
        );

        shape.lineTo(
            0.18,
            height
        );

        shape.quadraticCurveTo(
            concave ? -(width + 0.18) : (width + 0.18),
            0,
            0.18,
            -height
        );

        shape.closePath();

        const geometry =
            new THREE.ExtrudeGeometry(
                shape,
                {

                    depth: 2.25,

                    bevelEnabled: true,

                    bevelSize: 0.04,

                    bevelThickness: 0.03

                }
            );

        geometry.center();

        const material =
            new THREE.MeshPhysicalMaterial({

                color: 0xcbd8e4,

                metalness: 0.96,

                roughness: 0.07,

                clearcoat: 1

            });

        const mesh =
            new THREE.Mesh(
                geometry,
                material
            );

        mesh.rotation.y =
            Math.PI / 2;

        mesh.castShadow = true;

        return mesh;

    }

    function createMount() {

        const group =
            new THREE.Group();

        const base =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.48,
                    0.56,
                    0.18,
                    32
                ),
                new THREE.MeshStandardMaterial({

                    color: 0x303c47,

                    metalness: 0.82,

                    roughness: 0.27

                })
            );

        base.position.y = 0;

        group.add(base);

        const stem =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.12,
                    0.12,
                    1.3,
                    20
                ),
                new THREE.MeshStandardMaterial({

                    color: 0x697985,

                    metalness: 0.9,

                    roughness: 0.22

                })
            );

        stem.position.y = 0.68;

        group.add(stem);

        return group;

    }

    function addLensRim(group) {

        const rim =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    1.03,
                    0.045,
                    12,
                    48
                ),
                new THREE.MeshStandardMaterial({

                    color: 0x9ed9ed,

                    metalness: 0.75,

                    roughness: 0.2

                })
            );

        rim.rotation.y =
            Math.PI / 2;

        group.add(rim);

    }

    function createRayEmitter(group) {

        group.userData.emitter = true;

    }


/* ================================================================
   15 — OMBRES
================================================================ */

    function enableShadows(object) {

        object.traverse(child => {

            if (child.isMesh) {

                child.castShadow = true;

                child.receiveShadow = true;

            }

        });

    }


/* ================================================================
   16 — AJOUT D'UN COMPOSANT
================================================================ */

    function addComponent(type) {

        if (!STATE.initialized && !scene) return null;

        if (STATE.objects.length >= CONFIG.maxObjects) {

            notify(
                "Nombre maximal de composants atteint.",
                "warning"
            );

            return null;

        }

        const object =
            createOpticalObject(type);

        if (object) {

            notify(
                `${COMPONENTS[type].name} ajouté au laboratoire.`,
                "success"
            );

            focusObject(object);

        }

        return object;

    }

    function findFreeBenchPosition() {

        const occupied =
            STATE.objects.map(
                object => object.position.x
            );

        let x = -9;

        while (
            occupied.some(
                value => Math.abs(value - x) < 1.8
            ) &&
            x < 10
        ) {

            x += 1.8;

        }

        return new THREE.Vector3(
            x,
            1.4,
            0
        );

    }


/* ================================================================
   17 — SÉLECTION
================================================================ */

    function selectObject(object) {

        if (!object) {

            clearSelection();

            return;

        }

        if (!object.userData?.fobasObject) {

            return;

        }

        clearSelection();

        STATE.selectedObject = object;

        STATE.selectedId =
            object.userData.id;

        createSelectionIndicator(object);

        updatePropertiesPanel(object);

        notify(
            `${object.userData.name} sélectionné.`,
            "info",
            1800
        );

    }

    function clearSelection() {

        STATE.selectedObject = null;

        STATE.selectedId = null;

        clearSelectionIndicator();

        updatePropertiesPanel(null);

    }

    function createSelectionIndicator(object) {

        clearSelectionIndicator();

        const box =
            new THREE.Box3()
                .setFromObject(object);

        const size =
            new THREE.Vector3();

        const center =
            new THREE.Vector3();

        box.getSize(size);

        box.getCenter(center);

        selectionBox =
            new THREE.Box3Helper(
                box,
                CONFIG.selectionColor
            );

        selectionBox.name =
            "FOBAS_SELECTION";

        selectionGroup.add(
            selectionBox
        );

    }

    function clearSelectionIndicator() {

        if (!selectionBox) return;

        selectionGroup.remove(
            selectionBox
        );

        selectionBox.geometry?.dispose();

        selectionBox = null;

    }


/* ================================================================
   18 — INTERACTION SOURIS / TACTILE
================================================================ */

    function updatePointer(event) {

        const rect =
            renderer.domElement.getBoundingClientRect();

        STATE.pointer.x =
            (
                (event.clientX - rect.left) /
                rect.width
            ) * 2 - 1;

        STATE.pointer.y =
            -(
                (event.clientY - rect.top) /
                rect.height
            ) * 2 + 1;

        pointerVector.set(
            STATE.pointer.x,
            STATE.pointer.y
        );

    }

    function raycastObjects() {

        if (!raycaster || !camera) return [];

        raycaster.setFromCamera(
            pointerVector,
            camera
        );

        const meshes = [];

        STATE.objects.forEach(object => {

            object.traverse(child => {

                if (
                    child.isMesh ||
                    child.isLine
                ) {

                    meshes.push(child);

                }

            });

        });

        return raycaster.intersectObjects(
            meshes,
            true
        );

    }

    function findParentOpticalObject(object) {

        let current = object;

        while (
            current &&
            current !== objectsGroup
        ) {

            if (
                current.userData &&
                current.userData.fobasObject
            ) {

                return current;

            }

            current = current.parent;

        }

        return null;

    }

    function handlePointerDown(event) {

        if (!renderer) return;

        updatePointer(event);

        STATE.pointer.down = true;

        STATE.pointer.moved = false;

        STATE.pointer.startX =
            event.clientX;

        STATE.pointer.startY =
            event.clientY;

        const hits =
            raycastObjects();

        if (!hits.length) {

            if (
                STATE.interactionMode ===
                "select"
            ) {

                clearSelection();

            }

            return;

        }

        const object =
            findParentOpticalObject(
                hits[0].object
            );

        if (!object) return;

        selectObject(object);

        if (
            STATE.interactionMode ===
            "move"
        ) {

            beginDrag(object);

        }

    }

    function handlePointerMove(event) {

        if (!renderer) return;

        updatePointer(event);

        if (!STATE.pointer.down) {

            updateHover();

            return;

        }

        const dx =
            event.clientX -
            STATE.pointer.startX;

        const dy =
            event.clientY -
            STATE.pointer.startY;

        if (
            Math.abs(dx) > 4 ||
            Math.abs(dy) > 4
        ) {

            STATE.pointer.moved = true;

        }

        if (
            STATE.drag.active &&
            STATE.selectedObject
        ) {

            moveDraggedObject();

        }

    }

    function handlePointerUp() {

        STATE.pointer.down = false;

        endDrag();

    }

    function handleDoubleClick() {

        if (
            STATE.selectedObject
        ) {

            focusObject(
                STATE.selectedObject
            );

        }

    }

    function updateHover() {

        const hits =
            raycastObjects();

        if (!hits.length) {

            STATE.hoveredObject = null;

            renderer.domElement.style.cursor =
                "default";

            return;

        }

        const object =
            findParentOpticalObject(
                hits[0].object
            );

        STATE.hoveredObject =
            object;

        renderer.domElement.style.cursor =
            object ? "pointer" : "default";

    }


/* ================================================================
   19 — DÉPLACEMENT
================================================================ */

    function beginDrag(object) {

        if (!object?.userData?.movable) return;

        STATE.drag.active = true;

        STATE.drag.object = object;

        renderer.domElement.style.cursor =
            "grabbing";

    }

    function moveDraggedObject() {

        const object =
            STATE.drag.object;

        if (!object) return;

        const point =
            new THREE.Vector3();

        raycaster.setFromCamera(
            pointerVector,
            camera
        );

        if (
            raycaster.ray.intersectPlane(
                transformPlane,
                point
            )
        ) {

            object.position.x =
                snapValue(point.x);

            object.position.z =
                snapValue(point.z);

            object.position.y =
                1.4;

            updateSelectionBox();

            updatePropertiesPanel(
                object
            );

            recalculatePhysics();

        }

    }

    function endDrag() {

        if (!STATE.drag.active) return;

        STATE.drag.active = false;

        STATE.drag.object = null;

        renderer.domElement.style.cursor =
            "default";

        registerHistory();

        scheduleAutoSave();

    }

    function snapValue(value) {

        if (!STATE.snapEnabled) {

            return value;

        }

        return Math.round(
            value * 2
        ) / 2;

    }


/* ================================================================
   20 — ROTATION / SCALE
================================================================ */

    function rotateSelected(deltaDegrees) {

        const object =
            STATE.selectedObject;

        if (!object) {

            notify(
                "Sélectionnez d'abord un composant.",
                "warning"
            );

            return;

        }

        object.rotation.y +=
            degToRad(deltaDegrees);

        object.userData.rotationZ =
            radToDeg(
                object.rotation.y
            );

        updateSelectionBox();

        updatePropertiesPanel(object);

        recalculatePhysics();

        registerHistory();

        scheduleAutoSave();

    }

    function scaleSelected(factor) {

        const object =
            STATE.selectedObject;

        if (!object) return;

        const next =
            clamp(
                object.scale.x * factor,
                0.35,
                3
            );

        object.scale.setScalar(next);

        object.userData.scaleValue =
            next;

        updateSelectionBox();

        updatePropertiesPanel(object);

        registerHistory();

        scheduleAutoSave();

    }

    function deleteSelected() {

        const object =
            STATE.selectedObject;

        if (!object) {

            notify(
                "Aucun objet sélectionné.",
                "warning"
            );

            return;

        }

        const name =
            object.userData.name;

        removeObject(object);

        notify(
            `${name} supprimé.`,
            "success"
        );

    }

    function removeObject(object) {

        const index =
            STATE.objects.indexOf(object);

        if (index >= 0) {

            STATE.objects.splice(
                index,
                1
            );

        }

        object.parent?.remove(object);

        disposeObject(object);

        clearSelection();

        recalculatePhysics();

        registerHistory();

        scheduleAutoSave();

    }

    function disposeObject(object) {

        object.traverse(child => {

            if (child.geometry) {

                child.geometry.dispose();

            }

            if (child.material) {

                const materials =
                    Array.isArray(
                        child.material
                    )
                        ? child.material
                        : [child.material];

                materials.forEach(material => {

                    Object.keys(material)
                        .forEach(key => {

                            const value =
                                material[key];

                            if (
                                value &&
                                value.isTexture
                            ) {

                                value.dispose();

                            }

                        });

                    material.dispose();

                });

            }

        });

    }


/* ================================================================
   21 — CAMÉRA
================================================================ */

    function resetCamera() {

        if (!camera) return;

        camera.position.set(
            17,
            12,
            18
        );

        if (controls) {

            controls.target.set(
                0,
                2,
                0
            );

            controls.update();

        }

    }

    function setCameraView(view) {

        if (!camera) return;

        const target =
            new THREE.Vector3(
                0,
                2,
                0
            );

        switch (view) {

            case "top":

                camera.position.set(
                    0,
                    28,
                    0.01
                );

                break;

            case "front":

                camera.position.set(
                    0,
                    5,
                    30
                );

                break;

            case "side":

                camera.position.set(
                    30,
                    5,
                    0
                );

                break;

            case "isometric":

            default:

                camera.position.set(
                    17,
                    12,
                    18
                );

                break;

        }

        if (controls) {

            controls.target.copy(target);

            controls.update();

        } else {

            camera.lookAt(target);

        }

    }

    function focusObject(object) {

        if (!object || !camera) return;

        const box =
            new THREE.Box3()
                .setFromObject(object);

        const center =
            new THREE.Vector3();

        box.getCenter(center);

        const size =
            new THREE.Vector3();

        box.getSize(size);

        const distance =
            Math.max(
                5,
                Math.max(
                    size.x,
                    size.y,
                    size.z
                ) * 4
            );

        const direction =
            new THREE.Vector3(
                1,
                0.65,
                1
            )
                .normalize();

        camera.position.copy(
            center.clone()
                .add(
                    direction.multiplyScalar(
                        distance
                    )
                )
        );

        if (controls) {

            controls.target.copy(center);

            controls.update();

        } else {

            camera.lookAt(center);

        }

    }

    function handleWheel(event) {

        if (!controls) return;

        if (
            event.ctrlKey ||
            event.metaKey
        ) {

            event.preventDefault();

        }

    }


/* ================================================================
   22 — PHYSIQUE OPTIQUE
================================================================ */

    function recalculatePhysics() {

        clearRays();

        if (!STATE.rayTracingEnabled) {

            updateMeasurements();

            return;

        }

        const sources =
            STATE.objects.filter(
                object =>
                    object.userData.type === "laser" ||
                    object.userData.type === "lamp" ||
                    object.userData.type === "object"
            );

        sources.forEach(source => {

            traceSource(source);

        });

        updateMeasurements();

    }

    function traceSource(source) {

        if (!source) return;

        const origin =
            source.getWorldPosition(
                new THREE.Vector3()
            );

        const direction =
            new THREE.Vector3(
                1,
                0,
                0
            );

        direction.applyQuaternion(
            source.getWorldQuaternion(
                new THREE.Quaternion()
            )
        );

        direction.normalize();

        const color =
            source.userData.type === "laser"
                ? 0xff2855
                : 0xffe59a;

        traceRay(
            origin,
            direction,
            color,
            CONFIG.raySegments,
            1
        );

    }

    function traceRay(
        origin,
        direction,
        color,
        remaining,
        intensity
    ) {

        if (
            remaining <= 0 ||
            intensity < 0.025
        ) {

            return;

        }

        const start =
            origin.clone();

        const dir =
            direction.clone().normalize();

        const intersections =
            getOpticalIntersections(
                start,
                dir
            );

        if (!intersections.length) {

            const end =
                start.clone()
                    .add(
                        dir.multiplyScalar(
                            18
                        )
                    );

            createRaySegment(
                start,
                end,
                color,
                intensity
            );

            return;

        }

        const hit =
            intersections[0];

        const hitPoint =
            hit.point.clone();

        createRaySegment(
            start,
            hitPoint,
            color,
            intensity
        );

        processOpticalInteraction(
            hit.objectRoot,
            hitPoint,
            dir,
            color,
            intensity,
            remaining
        );

    }

    function getOpticalIntersections(
        origin,
        direction
    ) {

        raycaster.set(
            origin,
            direction
        );

        const meshes = [];

        STATE.objects.forEach(object => {

            if (
                object.userData.type ===
                "laser" ||
                object.userData.type ===
                "lamp" ||
                object.userData.type ===
                "object"
            ) {

                return;

            }

            object.traverse(child => {

                if (
                    child.isMesh &&
                    child.visible
                ) {

                    meshes.push(child);

                }

            });

        });

        const hits =
            raycaster.intersectObjects(
                meshes,
                true
            );

        return hits
            .map(hit => {

                const root =
                    findParentOpticalObject(
                        hit.object
                    );

                return {

                    ...hit,

                    objectRoot: root

                };

            })
            .filter(
                hit => !!hit.objectRoot
            );

    }

    function processOpticalInteraction(
        object,
        point,
        incoming,
        color,
        intensity,
        remaining
    ) {

        if (!object) return;

        const type =
            object.userData.type;

        if (
            type === "mirrorPlane" ||
            type === "mirrorConcave" ||
            type === "mirrorConvex"
        ) {

            const normal =
                getApproximateNormal(
                    object,
                    point
                );

            const reflected =
                reflectVector(
                    incoming,
                    normal
                ).normalize();

            traceRay(
                point.clone()
                    .add(
                        reflected.clone()
                            .multiplyScalar(0.03)
                    ),
                reflected,
                color,
                remaining - 1,
                intensity * 0.92
            );

            return;

        }

        if (
            type === "lensConvex" ||
            type === "lensConcave"
        ) {

            const n1 = 1;

            const n2 =
                safeNumber(
                    object.userData.refractiveIndex,
                    1.5
                );

            const normal =
                getApproximateNormal(
                    object,
                    point
                );

            const refracted =
                refractVector(
                    incoming,
                    normal,
                    n1,
                    n2
                );

            if (refracted) {

                traceRay(
                    point.clone()
                        .add(
                            refracted.clone()
                                .multiplyScalar(
                                    0.04
                                )
                        ),
                    refracted,
                    color,
                    remaining - 1,
                    intensity * 0.86
                );

            }

            return;

        }

        if (type === "prism") {

            const refracted =
                refractVector(
                    incoming,
                    new THREE.Vector3(
                        1,
                        0,
                        0
                    ),
                    1,
                    object.userData
                        .refractiveIndex || 1.52
                );

            if (refracted) {

                traceDispersion(
                    point,
                    refracted,
                    intensity
                );

            }

            return;

        }

        if (
            type === "screen" ||
            type === "sensor"
        ) {

            registerHit(
                object,
                point,
                intensity
            );

        }

    }

    function getApproximateNormal(
        object,
        point
    ) {

        const worldQuaternion =
            object.getWorldQuaternion(
                new THREE.Quaternion()
            );

        const normal =
            new THREE.Vector3(
                1,
                0,
                0
            );

        normal.applyQuaternion(
            worldQuaternion
        );

        normal.normalize();

        return normal;

    }

    function reflectVector(
        incident,
        normal
    ) {

        return incident.clone()
            .sub(
                normal.clone()
                    .multiplyScalar(
                        2 *
                        incident.dot(normal)
                    )
            );

    }

    function refractVector(
        incident,
        normal,
        n1,
        n2
    ) {

        let N =
            normal.clone().normalize();

        let I =
            incident.clone().normalize();

        let cosI =
            clamp(
                -I.dot(N),
                -1,
                1
            );

        let eta =
            n1 / n2;

        if (cosI < 0) {

            cosI = -cosI;

            N.negate();

            eta =
                n2 / n1;

        }

        const k =
            1 -
            eta * eta *
            (1 - cosI * cosI);

        if (k < 0) {

            return reflectVector(
                I,
                N
            ).normalize();

        }

        return I
            .multiplyScalar(eta)
            .add(
                N.multiplyScalar(
                    eta * cosI -
                    Math.sqrt(k)
                )
            )
            .normalize();

    }

    function traceDispersion(
        point,
        direction,
        intensity
    ) {

        const wavelengths = [

            {
                color: 0xff3030,
                offset: 0.16
            },

            {
                color: 0xffd33d,
                offset: 0
            },

            {
                color: 0x4fa3ff,
                offset: -0.16

            }

        ];

        wavelengths.forEach(item => {

            const dir =
                direction.clone();

            dir.y +=
                item.offset;

            dir.normalize();

            const end =
                point.clone()
                    .add(
                        dir.multiplyScalar(
                            12
                        )
                    );

            createRaySegment(
                point,
                end,
                item.color,
                intensity
            );

        });

    }


/* ================================================================
   23 — RAYONS 3D
================================================================ */

    function createRaySegment(
        start,
        end,
        color,
        intensity
    ) {

        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints([
                    start,
                    end
                ]);

        const material =
            new THREE.LineBasicMaterial({

                color,

                transparent: true,

                opacity:
                    clamp(
                        intensity,
                        0.08,
                        1
                    ),

                linewidth: 2

            });

        const line =
            new THREE.Line(
                geometry,
                material
            );

        line.userData.isOpticalRay = true;

        raysGroup.add(line);

        STATE.rays.push(line);

    }

    function clearRays() {

        STATE.rays.forEach(ray => {

            ray.geometry?.dispose();

            ray.material?.dispose();

            raysGroup.remove(ray);

        });

        STATE.rays = [];

    }

    function registerHit(
        object,
        point,
        intensity
    ) {

        object.userData.lastHit = {

            x: point.x,

            y: point.y,

            z: point.z,

            intensity

        };

    }


/* ================================================================
   24 — MESURES
================================================================ */

    function updateMeasurements() {

        const selected =
            STATE.selectedObject;

        if (!selected) {

            updateMeasurementValues({

                distance: 0,

                angle: 0,

                focalLength: 0,

                imageDistance: 0,

                objectDistance: 0,

                magnification: 0,

                refractiveIndex: 0

            });

            return;

        }

        let focal =
            safeNumber(
                selected.userData.focalLength,
                0
            );

        let objectDistance = 0;

        let imageDistance = 0;

        let magnification = 0;

        const object =
            STATE.objects.find(
                item =>
                    item.userData.type ===
                    "object"
            );

        if (object) {

            objectDistance =
                Math.abs(
                    selected.position.x -
                    object.position.x
                );

        }

        if (focal !== 0 && objectDistance !== 0) {

            const denominator =
                1 / focal -
                1 / objectDistance;

            if (
                Math.abs(denominator) >
                0.000001
            ) {

                imageDistance =
                    1 / denominator;

                magnification =
                    -imageDistance /
                    objectDistance;

            }

        }

        updateMeasurementValues({

            distance:
                selected.position.length(),

            angle:
                radToDeg(
                    selected.rotation.y
                ),

            focalLength:
                focal,

            imageDistance,

            objectDistance,

            magnification,

            refractiveIndex:
                safeNumber(
                    selected.userData
                        .refractiveIndex,
                    0
                )

        });

    }

    function updateMeasurementValues(values) {

        STATE.measurementsLive = values;

        setText(
            "distanceValue",
            `${round(values.distance)} cm`
        );

        setText(
            "angleValue",
            `${round(values.angle)}°`
        );

        setText(
            "focalLengthValue",
            values.focalLength
                ? `${round(values.focalLength)} cm`
                : "—"
        );

        setText(
            "imageDistanceValue",
            values.imageDistance
                ? `${round(values.imageDistance)} cm`
                : "—"
        );

        setText(
            "objectDistanceValue",
            values.objectDistance
                ? `${round(values.objectDistance)} cm`
                : "—"
        );

        setText(
            "magnificationValue",
            values.magnification
                ? `${round(values.magnification)}×`
                : "—"
        );

        setText(
            "refractiveIndexValue",
            values.refractiveIndex
                ? round(
                    values.refractiveIndex,
                    3
                )
                : "—"
        );

    }


/* ================================================================
   25 — PANNEAU PROPRIÉTÉS
================================================================ */

    function updatePropertiesPanel(object) {

        const empty =
            document.querySelector(
                ".property-empty"
            );

        const content =
            document.querySelector(
                ".property-content"
            );

        if (!content) return;

        if (!object) {

            if (empty) {

                empty.style.display =
                    "";

            }

            content.style.display =
                "none";

            return;

        }

        if (empty) {

            empty.style.display =
                "none";

        }

        content.style.display =
            "";

        setText(
            "selectedObjectTitle",
            object.userData.name
        );

        setText(
            "selectedObjectDescription",
            object.userData.description
        );

        setInputValue(
            "objectPosX",
            round(object.position.x)
        );

        setInputValue(
            "objectPosY",
            round(object.position.y)
        );

        setInputValue(
            "objectPosZ",
            round(object.position.z)
        );

        setInputValue(
            "objectRotation",
            round(
                radToDeg(
                    object.rotation.y
                )
            )
        );

        setInputValue(
            "objectFocalLength",
            object.userData.focalLength || ""
        );

        setInputValue(
            "objectRefractiveIndex",
            object.userData.refractiveIndex || ""
        );

        setText(
            "selectedObjectType",
            object.userData.type
        );

    }

    function applyPropertyChanges() {

        const object =
            STATE.selectedObject;

        if (!object) return;

        const x =
            safeNumber(
                getInputValue(
                    "objectPosX"
                ),
                object.position.x
            );

        const y =
            safeNumber(
                getInputValue(
                    "objectPosY"
                ),
                object.position.y
            );

        const z =
            safeNumber(
                getInputValue(
                    "objectPosZ"
                ),
                object.position.z
            );

        const rotation =
            safeNumber(
                getInputValue(
                    "objectRotation"
                ),
                radToDeg(
                    object.rotation.y
                )
            );

        object.position.set(
            x,
            y,
            z
        );

        object.rotation.y =
            degToRad(rotation);

        if (
            getInputValue(
                "objectFocalLength"
            ) !== ""
        ) {

            object.userData.focalLength =
                safeNumber(
                    getInputValue(
                        "objectFocalLength"
                    )
                );

        }

        if (
            getInputValue(
                "objectRefractiveIndex"
            ) !== ""
        ) {

            object.userData.refractiveIndex =
                safeNumber(
                    getInputValue(
                        "objectRefractiveIndex"
                    ),
                    1.5
                );

        }

        updateSelectionBox();

        recalculatePhysics();

        registerHistory();

        scheduleAutoSave();

        notify(
            "Propriétés appliquées.",
            "success"
        );

    }


/* ================================================================
   26 — EXPÉRIENCES OPTIQUES
================================================================ */

    const EXPERIMENTS = {

        reflection: {

            id: "reflection",

            name: "Loi de la réflexion",

            description:
                "Vérification de l'égalité entre angle d'incidence et angle de réflexion.",

            setup() {

                clearLaboratory();

                const laser =
                    addComponent("laser");

                const mirror =
                    addComponent("mirrorPlane");

                if (laser && mirror) {

                    laser.position.set(
                        -6,
                        1.4,
                        0
                    );

                    mirror.position.set(
                        1,
                        1.4,
                        0
                    );

                    mirror.rotation.y =
                        degToRad(90);

                }

                recalculatePhysics();

            }

        },

        refraction: {

            id: "refraction",

            name: "Réfraction",

            description:
                "Étude du changement de direction d'un rayon lumineux à l'entrée d'un milieu transparent.",

            setup() {

                clearLaboratory();

                const laser =
                    addComponent("laser");

                const lens =
                    addComponent("lensConvex");

                const screen =
                    addComponent("screen");

                if (
                    laser &&
                    lens &&
                    screen
                ) {

                    laser.position.set(
                        -7,
                        1.4,
                        0
                    );

                    lens.position.set(
                        0,
                        1.4,
                        0
                    );

                    screen.position.set(
                        6,
                        1.4,
                        0
                    );

                }

                recalculatePhysics();

            }

        },

        lens: {

            id: "lens",

            name: "Formation d'une image",

            description:
                "Étude de la formation d'une image par une lentille convergente.",

            setup() {

                clearLaboratory();

                const object =
                    addComponent("object");

                const lens =
                    addComponent("lensConvex");

                const screen =
                    addComponent("screen");

                if (
                    object &&
                    lens &&
                    screen
                ) {

                    object.position.set(
                        -6,
                        1.4,
                        0
                    );

                    lens.position.set(
                        0,
                        1.4,
                        0
                    );

                    screen.position.set(
                        7,
                        1.4,
                        0
                    );

                    lens.userData.focalLength =
                        4;

                }

                recalculatePhysics();

            }

        },

        dispersion: {

            id: "dispersion",

            name: "Dispersion de la lumière",

            description:
                "Séparation de la lumière blanche par un prisme.",

            setup() {

                clearLaboratory();

                const lamp =
                    addComponent("lamp");

                const prism =
                    addComponent("prism");

                const screen =
                    addComponent("screen");

                if (
                    lamp &&
                    prism &&
                    screen
                ) {

                    lamp.position.set(
                        -7,
                        1.4,
                        0
                    );

                    prism.position.set(
                        0,
                        1.4,
                        0
                    );

                    screen.position.set(
                        7,
                        1.4,
                        0
                    );

                }

                recalculatePhysics();

            }

        }

    };


/* ================================================================
   27 — MISSIONS
================================================================ */

    const MISSIONS = {

        tpReflection: {

            id: "tpReflection",

            name:
                "TP — Vérifier la loi de réflexion",

            objective:
                "Mesurer les angles d'incidence et de réflexion puis comparer leurs valeurs.",

            validate() {

                const laser =
                    findObjectByType("laser");

                const mirror =
                    findObjectByType(
                        "mirrorPlane"
                    );

                if (!laser || !mirror) {

                    return {

                        success: false,

                        message:
                            "Placez une source laser et un miroir plan."

                    };

                }

                return {

                    success: true,

                    message:
                        "Configuration optique détectée. Vous pouvez effectuer les mesures."

                };

            }

        },

        tpLens: {

            id: "tpLens",

            name:
                "TP — Lentille convergente",

            objective:
                "Déterminer la distance focale d'une lentille convergente.",

            validate() {

                const lens =
                    findObjectByType(
                        "lensConvex"
                    );

                const screen =
                    findObjectByType(
                        "screen"
                    );

                if (!lens || !screen) {

                    return {

                        success: false,

                        message:
                            "Une lentille convergente et un écran sont nécessaires."

                    };

                }

                return {

                    success: true,

                    message:
                        "Montage valide. Procédez aux mesures."

                };

            }

        }

    };


/* ================================================================
   28 — UTILITAIRES OBJETS
================================================================ */

    function findObjectByType(type) {

        return STATE.objects.find(
            object =>
                object.userData.type === type
        ) || null;

    }

    function findObjectsByType(type) {

        return STATE.objects.filter(
            object =>
                object.userData.type === type
        );

    }

    function clearLaboratory() {

        [...STATE.objects].forEach(
            object => removeObject(object)
        );

        clearRays();

        clearSelection();

        notify(
            "Laboratoire réinitialisé.",
            "info"
        );

    }

    function createDefaultScene() {

        if (STATE.objects.length) {

            recalculatePhysics();

            return;

        }

        const laser =
            addComponent("laser");

        const lens =
            addComponent("lensConvex");

        const screen =
            addComponent("screen");

        if (laser) {

            laser.position.set(
                -7,
                1.4,
                0
            );

        }

        if (lens) {

            lens.position.set(
                0,
                1.4,
                0
            );

        }

        if (screen) {

            screen.position.set(
                7,
                1.4,
                0
            );

        }

        recalculatePhysics();

        clearSelection();

    }


/* ================================================================
   29 — INTERFACE
================================================================ */

    function bindInterface() {

        bindSearch();

        bindCategoryButtons();

        bindCameraButtons();

        bindInteractionButtons();

        bindGlobalControls();

        bindPropertyControls();

        bindPhysicsControls();

        bindExperimentControls();

        bindMissionControls();

        bindResultsControls();

        bindKeyboard();

    }

    function bindSearch() {

        const search =
            byId("componentSearch");

        const clear =
            document.querySelector(
                ".clear-search-btn"
            );

        if (search) {

            search.addEventListener(
                "input",
                () =>
                    renderComponentLibrary(
                        search.value
                    )
            );

        }

        if (clear) {

            clear.addEventListener(
                "click",
                () => {

                    if (search) {

                        search.value = "";

                        renderComponentLibrary();

                        search.focus();

                    }

                }
            );

        }

    }

    function bindCategoryButtons() {

        $$(".category-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        $$(".category-btn")
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        const category =
                            button.dataset.category ||
                            button.dataset.filter ||
                            "all";

                        if (
                            category === "all"
                        ) {

                            renderComponentLibrary();

                            return;

                        }

                        const library =
                            document.querySelector(
                                ".component-library"
                            );

                        if (!library) return;

                        library.innerHTML = "";

                        Object.values(
                            COMPONENTS
                        )
                            .filter(
                                component =>
                                    component.category ===
                                    category
                            )
                            .forEach(
                                component =>
                                    createComponentCard(
                                        library,
                                        component
                                    )
                            );

                    }
                );

            });

    }

    function createComponentCard(
        library,
        component
    ) {

        const card =
            document.createElement("button");

        card.type = "button";

        card.className =
            "component-card";

        card.dataset.component =
            component.id;

        card.innerHTML = `
            <span class="component-icon">
                ${component.icon}
            </span>
            <span class="component-name">
                ${escapeHTML(component.name)}
            </span>
            <span class="component-description">
                ${escapeHTML(component.description)}
            </span>
        `;

        card.addEventListener(
            "click",
            () =>
                addComponent(
                    component.id
                )
        );

        library.appendChild(card);

    }

    function bindCameraButtons() {

        $$(
            ".camera-btn"
        ).forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action ||
                        button.dataset.camera ||
                        button.dataset.view;

                    handleCameraAction(
                        action
                    );

                }
            );

        });

    }

    function handleCameraAction(action) {

        switch (action) {

            case "reset":

            case "home":

                resetCamera();

                break;

            case "top":

                setCameraView("top");

                break;

            case "front":

                setCameraView("front");

                break;

            case "side":

                setCameraView("side");

                break;

            case "isometric":

                setCameraView("isometric");

                break;

            case "zoomIn":

                zoomCamera(
                    0.82
                );

                break;

            case "zoomOut":

                zoomCamera(
                    1.18
                );

                break;

            case "focus":

                focusObject(
                    STATE.selectedObject
                );

                break;

            default:

                break;

        }

    }

    function zoomCamera(factor) {

        if (!camera) return;

        const target =
            controls
                ? controls.target
                : new THREE.Vector3(
                    0,
                    2,
                    0
                );

        const direction =
            camera.position
                .clone()
                .sub(target);

        direction.multiplyScalar(
            factor
        );

        camera.position.copy(
            target.clone()
                .add(direction)
        );

        if (controls) {

            controls.update();

        }

    }


/* ================================================================
   30 — BARRE D'INTERACTION
================================================================ */

    function bindInteractionButtons() {

        $$(".interaction-tool")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const mode =
                            button.dataset.mode ||
                            button.dataset.tool ||
                            button.dataset.action;

                        setInteractionMode(
                            mode
                        );

                    }
                );

            });

    }

    function setInteractionMode(mode) {

        const normalized =
            String(mode || "")
                .toLowerCase();

        if (
            [
                "select",
                "move",
                "rotate",
                "scale",
                "connect",
                "measure"
            ].includes(normalized)
        ) {

            STATE.interactionMode =
                normalized;

        }

        $$(".interaction-tool")
            .forEach(button => {

                const value =
                    button.dataset.mode ||
                    button.dataset.tool ||
                    button.dataset.action;

                button.classList.toggle(
                    "active",
                    String(value)
                        .toLowerCase() ===
                    STATE.interactionMode
                );

            });

        setText(
            "interactionModeValue",
            STATE.interactionMode
        );

    }


/* ================================================================
   31 — CONTRÔLES GLOBAUX
================================================================ */

    function bindGlobalControls() {

        $$(
            ".top-control-btn"
        ).forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action ||
                        button.dataset.command;

                    handleGlobalAction(
                        action
                    );

                }
            );

        });

        const helpButton =
            byId("helpBtn") ||
            document.querySelector(
                ".scene-help-btn"
            );

        if (helpButton) {

            helpButton.addEventListener(
                "click",
                showHelpModal
            );

        }

        const clearButton =
            byId("clearLabBtn");

        if (clearButton) {

            clearButton.addEventListener(
                "click",
                () => {

                    if (
                        window.confirm(
                            "Voulez-vous réellement vider le laboratoire ?"
                        )
                    ) {

                        clearLaboratory();

                    }

                }
            );

        }

    }

    function handleGlobalAction(action) {

        switch (action) {

            case "new":

            case "newLab":

            case "clear":

                if (
                    window.confirm(
                        "Créer un nouveau laboratoire ?"
                    )
                ) {

                    clearLaboratory();

                }

                break;

            case "save":

                saveState(true);

                break;

            case "load":

                restoreState(true);

                break;

            case "reset":

                resetApplication();

                break;

            case "help":

                showHelpModal();

                break;

            case "measure":

                setInteractionMode(
                    "measure"
                );

                break;

            case "run":

            case "simulate":

                recalculatePhysics();

                notify(
                    "Simulation optique exécutée.",
                    "success"
                );

                break;

            default:

                break;

        }

    }


/* ================================================================
   32 — CONTRÔLES PROPRIÉTÉS
================================================================ */

    function bindPropertyControls() {

        const apply =
            byId("applyPropertiesBtn") ||
            document.querySelector(
                ".apply-properties-btn"
            );

        if (apply) {

            apply.addEventListener(
                "click",
                applyPropertyChanges
            );

        }

        const deleteButton =
            byId("deleteObjectBtn");

        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                deleteSelected
            );

        }

        const duplicateButton =
            byId("duplicateObjectBtn");

        if (duplicateButton) {

            duplicateButton.addEventListener(
                "click",
                duplicateSelected
            );

        }

    }

    function duplicateSelected() {

        const original =
            STATE.selectedObject;

        if (!original) {

            notify(
                "Sélectionnez un objet à dupliquer.",
                "warning"
            );

            return;

        }

        const clone =
            createOpticalObject(
                original.userData.type,
                original.position.clone()
                    .add(
                        new THREE.Vector3(
                            1.5,
                            0,
                            0
                        )
                    )
            );

        if (!clone) return;

        clone.rotation.copy(
            original.rotation
        );

        clone.scale.copy(
            original.scale
        );

        clone.userData.focalLength =
            original.userData.focalLength;

        clone.userData.refractiveIndex =
            original.userData.refractiveIndex;

        selectObject(clone);

        recalculatePhysics();

        notify(
            "Composant dupliqué.",
            "success"
        );

    }


/* ================================================================
   33 — CONTRÔLES PHYSIQUES
================================================================ */

    function bindPhysicsControls() {

        const rayToggle =
            byId("rayTracingToggle");

        if (rayToggle) {

            rayToggle.addEventListener(
                "change",
                () => {

                    STATE.rayTracingEnabled =
                        rayToggle.checked;

                    recalculatePhysics();

                }
            );

        }

        const gridToggle =
            byId("gridToggle");

        if (gridToggle) {

            gridToggle.addEventListener(
                "change",
                () => {

                    STATE.gridEnabled =
                        gridToggle.checked;

                    if (gridHelper) {

                        gridHelper.visible =
                            STATE.gridEnabled;

                    }

                }
            );

        }

        const shadowToggle =
            byId("shadowsToggle");

        if (shadowToggle) {

            shadowToggle.addEventListener(
                "change",
                () => {

                    STATE.shadowsEnabled =
                        shadowToggle.checked;

                    if (renderer) {

                        renderer.shadowMap.enabled =
                            STATE.shadowsEnabled;

                    }

                }
            );

        }

        const snapToggle =
            byId("snapToggle");

        if (snapToggle) {

            snapToggle.addEventListener(
                "change",
                () => {

                    STATE.snapEnabled =
                        snapToggle.checked;

                }
            );

        }

        const intensity =
            byId("intensityInput");

        if (intensity) {

            intensity.addEventListener(
                "input",
                () => {

                    STATE.intensity =
                        safeNumber(
                            intensity.value,
                            1
                        );

                    setText(
                        "intensityValue",
                        STATE.intensity
                    );

                    recalculatePhysics();

                }
            );

        }

    }


/* ================================================================
   34 — EXPÉRIENCES
================================================================ */

    function bindExperimentControls() {

        const selector =
            byId("experimentSelector");

        if (selector) {

            selector.addEventListener(
                "change",
                () => {

                    const id =
                        selector.value;

                    if (
                        EXPERIMENTS[id]
                    ) {

                        EXPERIMENTS[id]
                            .setup();

                        updateExperimentInfo(
                            EXPERIMENTS[id]
                        );

                    }

                }
            );

        }

        $$(".experiment-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.experiment;

                        if (
                            EXPERIMENTS[id]
                        ) {

                            EXPERIMENTS[id]
                                .setup();

                            updateExperimentInfo(
                                EXPERIMENTS[id]
                            );

                        }

                    }
                );

            });

    }

    function updateExperimentInfo(
        experiment
    ) {

        setText(
            "experimentTitle",
            experiment.name
        );

        setText(
            "experimentDescription",
            experiment.description
        );

    }


/* ================================================================
   35 — MISSIONS
================================================================ */

    function bindMissionControls() {

        $$(".mission-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.mission;

                        validateMission(id);

                    }
                );

            });

        const validate =
            byId("validateMissionBtn");

        if (validate) {

            validate.addEventListener(
                "click",
                () => {

                    const id =
                        validate.dataset.mission ||
                        byId("missionSelector")
                            ?.value;

                    validateMission(id);

                }
            );

        }

    }

    function validateMission(id) {

        const mission =
            MISSIONS[id];

        if (!mission) {

            notify(
                "Mission non définie.",
                "warning"
            );

            return;

        }

        const result =
            mission.validate();

        STATE.results.push({

            id: mission.id,

            name: mission.name,

            success: result.success,

            message: result.message,

            timestamp:
                new Date().toISOString()

        });

        renderResults();

        notify(
            result.message,
            result.success
                ? "success"
                : "warning",
            4500
        );

    }


/* ================================================================
   36 — RÉSULTATS
================================================================ */

    function bindResultsControls() {

        const clearResults =
            byId("clearResultsBtn");

        if (clearResults) {

            clearResults.addEventListener(
                "click",
                () => {

                    STATE.results = [];

                    renderResults();

                }
            );

        }

        const exportButton =
            byId("exportResultsBtn");

        if (exportButton) {

            exportButton.addEventListener(
                "click",
                exportResults
            );

        }

    }

    function renderResults() {

        const content =
            byId("resultsContent") ||
            document.querySelector(
                ".results-content"
            );

        if (!content) return;

        if (!STATE.results.length) {

            content.innerHTML = `
                <div class="results-empty">
                    Aucun résultat disponible.
                </div>
            `;

            return;

        }

        content.innerHTML = `
            <div class="results-table-wrapper">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Expérience</th>
                            <th>Résultat</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${STATE.results.map(
                            result => `
                            <tr>
                                <td>
                                    ${escapeHTML(
                                        result.name
                                    )}
                                </td>
                                <td>
                                    ${
                                        result.success
                                            ? "✓ Réussi"
                                            : "⚠ À corriger"
                                    }
                                </td>
                                <td>
                                    ${escapeHTML(
                                        result.message
                                    )}
                                </td>
                            </tr>
                        `
                        ).join("")}
                    </tbody>
                </table>
            </div>
        `;

    }

    function exportResults() {

        const data =
            JSON.stringify(
                STATE.results,
                null,
                2
            );

        const blob =
            new Blob(
                [data],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "fobas-optique-resultats.json";

        link.click();

        URL.revokeObjectURL(url);

    }


/* ================================================================
   37 — HISTORIQUE UNDO / REDO
================================================================ */

    function serializeObjects() {

        return STATE.objects.map(
            object => ({

                id:
                    object.userData.id,

                type:
                    object.userData.type,

                position: {

                    x: object.position.x,

                    y: object.position.y,

                    z: object.position.z

                },

                rotation: {

                    x: object.rotation.x,

                    y: object.rotation.y,

                    z: object.rotation.z

                },

                scale: {

                    x: object.scale.x,

                    y: object.scale.y,

                    z: object.scale.z

                },

                focalLength:
                    object.userData.focalLength,

                refractiveIndex:
                    object.userData.refractiveIndex

            })
        );

    }

    function registerHistory() {

        const snapshot =
            JSON.stringify(
                serializeObjects()
            );

        if (
            STATE.history[
                STATE.historyIndex
            ] === snapshot
        ) {

            return;

        }

        STATE.history =
            STATE.history.slice(
                0,
                STATE.historyIndex + 1
            );

        STATE.history.push(
            snapshot
        );

        STATE.historyIndex =
            STATE.history.length - 1;

        if (STATE.history.length > 50) {

            STATE.history.shift();

            STATE.historyIndex--;

        }

    }

    function undo() {

        if (
            STATE.historyIndex <= 0
        ) {

            notify(
                "Aucune action à annuler.",
                "info"
            );

            return;

        }

        STATE.historyIndex--;

        restoreSnapshot(
            STATE.history[
                STATE.historyIndex
            ]
        );

    }

    function redo() {

        if (
            STATE.historyIndex >=
            STATE.history.length - 1
        ) {

            notify(
                "Aucune action à rétablir.",
                "info"
            );

            return;

        }

        STATE.historyIndex++;

        restoreSnapshot(
            STATE.history[
                STATE.historyIndex
            ]
        );

    }

    function restoreSnapshot(snapshot) {

        let data;

        try {

            data =
                JSON.parse(snapshot);

        } catch {

            return;

        }

        [...STATE.objects].forEach(
            object =>
                removeObjectWithoutHistory(
                    object
                )
        );

        data.forEach(item => {

            const object =
                createOpticalObject(
                    item.type,
                    new THREE.Vector3(
                        item.position.x,
                        item.position.y,
                        item.position.z
                    )
                );

            if (!object) return;

            object.rotation.set(
                item.rotation.x,
                item.rotation.y,
                item.rotation.z
            );

            object.scale.set(
                item.scale.x,
                item.scale.y,
                item.scale.z
            );

            object.userData.focalLength =
                item.focalLength;

            object.userData.refractiveIndex =
                item.refractiveIndex;

        });

        clearSelection();

        recalculatePhysics();

    }

    function removeObjectWithoutHistory(
        object
    ) {

        const index =
            STATE.objects.indexOf(object);

        if (index >= 0) {

            STATE.objects.splice(
                index,
                1
            );

        }

        object.parent?.remove(object);

        disposeObject(object);

    }


/* ================================================================
   38 — SAUVEGARDE
================================================================ */

    function buildSaveData() {

        return {

            version:
                FOBAS_OPTICS_VERSION,

            timestamp:
                new Date().toISOString(),

            settings: {

                rayTracingEnabled:
                    STATE.rayTracingEnabled,

                gridEnabled:
                    STATE.gridEnabled,

                shadowsEnabled:
                    STATE.shadowsEnabled,

                snapEnabled:
                    STATE.snapEnabled,

                intensity:
                    STATE.intensity

            },

            objects:
                serializeObjects(),

            results:
                STATE.results

        };

    }

    function saveState(showMessage = false) {

        try {

            localStorage.setItem(
                CONFIG.storageKey,
                JSON.stringify(
                    buildSaveData()
                )
            );

            if (showMessage) {

                notify(
                    "Laboratoire sauvegardé.",
                    "success"
                );

            }

        } catch (error) {

            console.error(error);

            notify(
                "Impossible de sauvegarder le laboratoire.",
                "error"
            );

        }

    }

    function restoreState(showMessage = false) {

        try {

            const raw =
                localStorage.getItem(
                    CONFIG.storageKey
                );

            if (!raw) {

                if (showMessage) {

                    notify(
                        "Aucune sauvegarde trouvée.",
                        "info"
                    );

                }

                return false;

            }

            const data =
                JSON.parse(raw);

            if (
                !Array.isArray(
                    data.objects
                )
            ) {

                return false;

            }

            [...STATE.objects].forEach(
                object =>
                    removeObjectWithoutHistory(
                        object
                    )
            );

            data.objects.forEach(item => {

                const object =
                    createOpticalObject(
                        item.type,
                        new THREE.Vector3(
                            safeNumber(
                                item.position?.x
                            ),
                            safeNumber(
                                item.position?.y,
                                1.4
                            ),
                            safeNumber(
                                item.position?.z
                            )
                        )
                    );

                if (!object) return;

                object.rotation.set(
                    safeNumber(
                        item.rotation?.x
                    ),
                    safeNumber(
                        item.rotation?.y
                    ),
                    safeNumber(
                        item.rotation?.z
                    )
                );

                object.scale.set(
                    safeNumber(
                        item.scale?.x,
                        1
                    ),
                    safeNumber(
                        item.scale?.y,
                        1
                    ),
                    safeNumber(
                        item.scale?.z,
                        1
                    )
                );

                object.userData.focalLength =
                    safeNumber(
                        item.focalLength
                    );

                object.userData.refractiveIndex =
                    safeNumber(
                        item.refractiveIndex,
                        1.5
                    );

            });

            if (data.settings) {

                STATE.rayTracingEnabled =
                    data.settings
                        .rayTracingEnabled ??
                    true;

                STATE.gridEnabled =
                    data.settings
                        .gridEnabled ??
                    true;

                STATE.shadowsEnabled =
                    data.settings
                        .shadowsEnabled ??
                    true;

                STATE.snapEnabled =
                    data.settings
                        .snapEnabled ??
                    true;

                STATE.intensity =
                    safeNumber(
                        data.settings.intensity,
                        1
                    );

            }

            STATE.results =
                Array.isArray(
                    data.results
                )
                    ? data.results
                    : [];

            recalculatePhysics();

            renderResults();

            if (showMessage) {

                notify(
                    "Laboratoire restauré.",
                    "success"
                );

            }

            return true;

        } catch (error) {

            console.error(
                "Restauration impossible :",
                error
            );

            if (showMessage) {

                notify(
                    "La sauvegarde est invalide.",
                    "error"
                );

            }

            return false;

        }

    }

    function scheduleAutoSave() {

        if (!STATE.autoSave) return;

        clearTimeout(
            autoSaveTimer
        );

        autoSaveTimer =
            setTimeout(
                () =>
                    saveState(false),
                CONFIG.autoSaveDelay
            );

    }


/* ================================================================
   39 — IMPORT / EXPORT
================================================================ */

    function exportLaboratory() {

        const data =
            JSON.stringify(
                buildSaveData(),
                null,
                2
            );

        downloadText(
            data,
            "fobas-optique-laboratoire.json"
        );

        notify(
            "Laboratoire exporté.",
            "success"
        );

    }

    function importLaboratoryFile() {

        const input =
            document.createElement("input");

        input.type = "file";

        input.accept =
            "application/json,.json";

        input.addEventListener(
            "change",
            () => {

                const file =
                    input.files?.[0];

                if (!file) return;

                const reader =
                    new FileReader();

                reader.onload = () => {

                    try {

                        const data =
                            JSON.parse(
                                reader.result
                            );

                        localStorage.setItem(
                            CONFIG.storageKey,
                            JSON.stringify(data)
                        );

                        restoreState(true);

                    } catch {

                        notify(
                            "Fichier laboratoire invalide.",
                            "error"
                        );

                    }

                };

                reader.readAsText(file);

            }
        );

        input.click();

    }

    function downloadText(
        text,
        filename
    ) {

        const blob =
            new Blob(
                [text],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            filename;

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

    }


/* ================================================================
   40 — RACCOURCIS CLAVIER
================================================================ */

    function bindKeyboard() {

        document.addEventListener(
            "keydown",
            event => {

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

                if (
                    event.ctrlKey &&
                    event.key.toLowerCase() ===
                    "s"
                ) {

                    event.preventDefault();

                    saveState(true);

                    return;

                }

                switch (
                    event.key.toLowerCase()
                ) {

                    case "delete":

                    case "backspace":

                        deleteSelected();

                        break;

                    case "escape":

                        clearSelection();

                        break;

                    case "v":

                        setInteractionMode(
                            "select"
                        );

                        break;

                    case "g":

                        setInteractionMode(
                            "move"
                        );

                        break;

                    case "r":

                        setInteractionMode(
                            "rotate"
                        );

                        break;

                    case "s":

                        if (!event.ctrlKey) {

                            setInteractionMode(
                                "scale"
                            );

                        }

                        break;

                    case "q":

                        rotateSelected(
                            -5
                        );

                        break;

                    case "e":

                        rotateSelected(
                            5
                        );

                        break;

                    case "f":

                        focusObject(
                            STATE.selectedObject
                        );

                        break;

                    case "1":

                        setCameraView(
                            "front"
                        );

                        break;

                    case "2":

                        setCameraView(
                            "side"
                        );

                        break;

                    case "3":

                        setCameraView(
                            "top"
                        );

                        break;

                    case "4":

                        setCameraView(
                            "isometric"
                        );

                        break;

                }

            }
        );

    }


/* ================================================================
   41 — MODALE D'AIDE
================================================================ */

    function showHelpModal() {

        let overlay =
            document.querySelector(
                ".modal-overlay.fobas-help-modal"
            );

        if (!overlay) {

            overlay =
                document.createElement("div");

            overlay.className =
                "modal-overlay fobas-help-modal";

            overlay.innerHTML = `
                <div class="modal-card">

                    <div class="modal-header">

                        <div>
                            <div class="modal-title">
                                FOBAS OPTIQUE — Aide
                            </div>

                            <div class="modal-subtitle">
                                Laboratoire 3D interactif
                            </div>
                        </div>

                        <button
                            type="button"
                            class="modal-close-btn"
                            data-close-help
                        >
                            ×
                        </button>

                    </div>

                    <div class="modal-content">

                        <div class="help-item">
                            <strong>🖱 Sélection</strong>
                            <span>
                                Cliquez sur un composant 3D.
                            </span>
                        </div>

                        <div class="help-item">
                            <strong>↔ Déplacement</strong>
                            <span>
                                Activez Move puis déplacez un composant sur le banc.
                            </span>
                        </div>

                        <div class="help-item">
                            <strong>⟳ Rotation</strong>
                            <span>
                                Utilisez Q / E ou les propriétés de l'objet.
                            </span>
                        </div>

                        <div class="help-item">
                            <strong>🔍 Caméra</strong>
                            <span>
                                Utilisez la souris pour tourner autour du laboratoire.
                            </span>
                        </div>

                        <div class="help-item">
                            <strong>💡 Physique</strong>
                            <span>
                                Les sources lumineuses génèrent des rayons 3D.
                            </span>
                        </div>

                        <div class="help-item">
                            <strong>↩ Historique</strong>
                            <span>
                                Ctrl+Z annule et Ctrl+Y rétablit.
                            </span>
                        </div>

                    </div>

                </div>
            `;

            document.body.appendChild(
                overlay
            );

            overlay
                .querySelector(
                    "[data-close-help]"
                )
                .addEventListener(
                    "click",
                    () =>
                        overlay.remove()
                );

            overlay.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        overlay
                    ) {

                        overlay.remove();

                    }

                }
            );

        }

        overlay.classList.add(
            "visible"
        );

    }


/* ================================================================
   42 — UI HELPERS
================================================================ */

    function setText(
        id,
        value
    ) {

        const element =
            byId(id);

        if (element) {

            element.textContent =
                value;

        }

    }

    function setInputValue(
        id,
        value
    ) {

        const element =
            byId(id);

        if (element) {

            element.value =
                value;

        }

    }

    function getInputValue(id) {

        const element =
            byId(id);

        return element
            ? element.value
            : "";

    }

    function updateSelectionBox() {

        if (
            !selectionBox ||
            !STATE.selectedObject
        ) {

            return;

        }

        selectionBox.box.setFromObject(
            STATE.selectedObject
        );

    }

    function updateAllUI() {

        updatePropertiesPanel(
            STATE.selectedObject
        );

        updateMeasurements();

        renderResults();

        const intensity =
            byId("intensityInput");

        if (intensity) {

            intensity.value =
                STATE.intensity;

        }

        setText(
            "intensityValue",
            STATE.intensity
        );

        setText(
            "objectCountValue",
            STATE.objects.length
        );

        setText(
            "rayCountValue",
            STATE.rays.length
        );

    }


/* ================================================================
   43 — CHARGEMENT / OVERLAY
================================================================ */

    function showLoading(
        visible,
        progress = 0,
        message = ""
    ) {

        const overlay =
            document.querySelector(
                ".loading-overlay"
            );

        if (!overlay) return;

        overlay.style.display =
            visible
                ? "flex"
                : "none";

        const bar =
            overlay.querySelector(
                ".loading-progress-bar"
            );

        const text =
            overlay.querySelector(
                ".loading-progress-text"
            );

        const subtitle =
            overlay.querySelector(
                ".loading-subtitle"
            );

        if (bar) {

            bar.style.width =
                `${clamp(
                    progress,
                    0,
                    100
                )}%`;

        }

        if (text) {

            text.textContent =
                `${Math.round(progress)}%`;

        }

        if (subtitle && message) {

            subtitle.textContent =
                message;

        }

    }

    function showRenderError(
        title,
        message
    ) {

        const existing =
            document.querySelector(
                ".render-error-overlay"
            );

        if (existing) {

            existing.remove();

        }

        const overlay =
            document.createElement("div");

        overlay.className =
            "render-error-overlay";

        overlay.innerHTML = `
            <div class="error-card">

                <div class="error-icon">
                    ⚠
                </div>

                <div class="error-title">
                    ${escapeHTML(title)}
                </div>

                <div class="error-message">
                    ${escapeHTML(message)}
                </div>

                <button
                    type="button"
                    class="primary-action-btn"
                    data-retry-render
                >
                    Réessayer
                </button>

            </div>
        `;

        document.body.appendChild(
            overlay
        );

        overlay
            .querySelector(
                "[data-retry-render]"
            )
            .addEventListener(
                "click",
                () => {

                    overlay.remove();

                    initFOBASOptique();

                }
            );

    }


/* ================================================================
   44 — ANIMATION / RENDU
================================================================ */

    function animate(now = performance.now()) {

        animationFrame =
            requestAnimationFrame(
                animate
            );

        if (!renderer || !scene || !camera) {

            return;

        }

        const delta =
            Math.min(
                0.1,
                (now - STATE.lastFrame) /
                1000
            );

        STATE.lastFrame = now;

        STATE.time +=
            delta *
            CONFIG.animationSpeed;

        animateOpticalObjects(
            delta
        );

        if (controls) {

            controls.update();

        }

        updateSelectionBox();

        updateHUD();

        renderer.render(
            scene,
            camera
        );

    }

    function animateOpticalObjects(
        delta
    ) {

        STATE.objects.forEach(
            object => {

                const type =
                    object.userData.type;

                if (type === "laser") {

                    const emitter =
                        object.children.find(
                            child =>
                                child.isMesh &&
                                child.material &&
                                child.material.emissive
                        );

                    if (
                        emitter &&
                        emitter.material
                            .emissiveIntensity !==
                        undefined
                    ) {

                        emitter.material
                            .emissiveIntensity =
                            2.1 +
                            Math.sin(
                                STATE.time * 8
                            ) * 0.7;

                    }

                }

                if (type === "lamp") {

                    const bulb =
                        object.children.find(
                            child =>
                                child.isMesh &&
                                child.material &&
                                child.material
                                    .emissiveIntensity !==
                                undefined
                        );

                    if (bulb) {

                        bulb.material
                            .emissiveIntensity =
                            2.4 +
                            Math.sin(
                                STATE.time * 2
                            ) * 0.15;

                    }

                }

            }
        );

    }


/* ================================================================
   45 — HUD
================================================================ */

    function updateHUD() {

        setText(
            "objectCountValue",
            STATE.objects.length
        );

        setText(
            "rayCountValue",
            STATE.rays.length
        );

        setText(
            "modeValue",
            STATE.interactionMode
        );

        setText(
            "interactionModeValue",
            STATE.interactionMode
        );

        const rayStatus =
            STATE.rayTracingEnabled
                ? "ACTIF"
                : "OFF";

        setText(
            "rayStatusValue",
            rayStatus
        );

        const dot =
            document.querySelector(
                ".hud-status-dot"
            );

        if (dot) {

            dot.classList.toggle(
                "inactive",
                !STATE.rayTracingEnabled
            );

        }

    }


/* ================================================================
   46 — RESPONSIVE
================================================================ */

    function resizeRenderer() {

        if (!renderer || !camera) return;

        const canvas =
            renderer.domElement;

        const parent =
            canvas.parentElement;

        if (!parent) return;

        const width =
            Math.max(
                1,
                parent.clientWidth
            );

        const height =
            Math.max(
                1,
                parent.clientHeight
            );

        camera.aspect =
            width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(
            width,
            height,
            false
        );

    }


/* ================================================================
   47 — RESET COMPLET
================================================================ */

    function resetApplication() {

        if (
            !window.confirm(
                "Réinitialiser complètement FOBAS OPTIQUE ?"
            )
        ) {

            return;

        }

        localStorage.removeItem(
            CONFIG.storageKey
        );

        STATE.history = [];

        STATE.historyIndex = -1;

        STATE.results = [];

        clearLaboratory();

        resetCamera();

        createDefaultScene();

        notify(
            "FOBAS OPTIQUE réinitialisé.",
            "success"
        );

    }


/* ================================================================
   48 — CONNEXIONS HTML AUTOMATIQUES
================================================================ */

    function bindDataActionButtons() {

        $$("[data-optics-action]")
            .forEach(button => {

                if (
                    button.dataset
                        .fobasBound === "1"
                ) {

                    return;

                }

                button.dataset
                    .fobasBound = "1";

                button.addEventListener(
                    "click",
                    () => {

                        executeDataAction(
                            button.dataset
                                .opticsAction
                        );

                    }
                );

            });

    }

    function executeDataAction(action) {

        switch (action) {

            case "add-laser":

                addComponent("laser");

                break;

            case "add-lamp":

                addComponent("lamp");

                break;

            case "add-convex-lens":

                addComponent("lensConvex");

                break;

            case "add-concave-lens":

                addComponent("lensConcave");

                break;

            case "add-plane-mirror":

                addComponent("mirrorPlane");

                break;

            case "add-concave-mirror":

                addComponent("mirrorConcave");

                break;

            case "add-convex-mirror":

                addComponent("mirrorConvex");

                break;

            case "add-prism":

                addComponent("prism");

                break;

            case "add-screen":

                addComponent("screen");

                break;

            case "add-sensor":

                addComponent("sensor");

                break;

            case "add-ruler":

                addComponent("ruler");

                break;

            case "delete":

                deleteSelected();

                break;

            case "duplicate":

                duplicateSelected();

                break;

            case "rotate-left":

                rotateSelected(-5);

                break;

            case "rotate-right":

                rotateSelected(5);

                break;

            case "scale-up":

                scaleSelected(1.1);

                break;

            case "scale-down":

                scaleSelected(0.9);

                break;

            case "save":

                saveState(true);

                break;

            case "load":

                restoreState(true);

                break;

            case "export":

                exportLaboratory();

                break;

            case "import":

                importLaboratoryFile();

                break;

            case "undo":

                undo();

                break;

            case "redo":

                redo();

                break;

            case "run":

                recalculatePhysics();

                notify(
                    "Simulation exécutée.",
                    "success"
                );

                break;

            case "help":

                showHelpModal();

                break;

            case "reset":

                resetApplication();

                break;

            default:

                console.warn(
                    "Action FOBAS inconnue :",
                    action
                );

        }

    }


/* ================================================================
   49 — INITIALISATION DOM
================================================================ */

    function initializeDOMFeatures() {

        bindDataActionButtons();

        const closeButtons =
            $$(
                ".panel-collapse-btn"
            );

        closeButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const panel =
                            button.closest(
                                ".side-panel"
                            );

                        if (!panel) return;

                        panel.classList.toggle(
                            "collapsed"
                        );

                    }
                );

            }
        );

        const mobileLibraryButton =
            byId("openMaterialsBtn");

        if (mobileLibraryButton) {

            mobileLibraryButton.addEventListener(
                "click",
                () => {

                    const panel =
                        document.querySelector(
                            ".left-panel"
                        );

                    panel?.classList.toggle(
                        "mobile-open"
                    );

                }
            );

        }

        const backdrop =
            byId("materialsBackdrop");

        if (backdrop) {

            backdrop.addEventListener(
                "click",
                () => {

                    document
                        .querySelector(
                            ".left-panel"
                        )
                        ?.classList.remove(
                            "mobile-open"
                        );

                }
            );

        }

    }


/* ================================================================
   50 — API PUBLIQUE FOBAS OPTIQUE
================================================================ */

    window.FOBAS_OPTIQUE = {

        version:
            FOBAS_OPTICS_VERSION,

        state:
            STATE,

        components:
            COMPONENTS,

        experiments:
            EXPERIMENTS,

        missions:
            MISSIONS,

        addComponent,

        removeObject,

        selectObject,

        clearSelection,

        rotateSelected,

        scaleSelected,

        deleteSelected,

        duplicateSelected,

        recalculatePhysics,

        saveState,

        restoreState,

        exportLaboratory,

        importLaboratoryFile,

        undo,

        redo,

        resetCamera,

        setCameraView,

        focusObject,

        clearLaboratory,

        resetApplication,

        setInteractionMode

    };


/* ================================================================
   51 — DÉMARRAGE
================================================================ */

    function boot() {

        try {

            initializeDOMFeatures();

            if (
                document.readyState ===
                "loading"
            ) {

                document.addEventListener(
                    "DOMContentLoaded",
                    () =>
                        initFOBASOptique(),
                    {
                        once: true
                    }
                );

            } else {

                initFOBASOptique();

            }

        } catch (error) {

            console.error(
                "FOBAS OPTIQUE — erreur de démarrage :",
                error
            );

            showRenderError(
                "Erreur de démarrage du laboratoire.",
                error.message ||
                    "Une erreur inattendue est survenue."
            );

        }

    }

    boot();


})();