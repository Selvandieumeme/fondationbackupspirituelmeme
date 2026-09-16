
/* ================================================================
   FOBAS OPTIQUE
   ---------------------------------------------------------------
   MOTEUR PRINCIPAL AUTONOME
   Version : 1.0.0
   Architecture : Canvas 2D + Projection 3D mathématique
   ---------------------------------------------------------------
   IMPORTANT :
   - AUCUNE dépendance Three.js
   - AUCUN CDN
   - AUCUN dossier lib/
   - AUCUN fichier externe obligatoire
   - Compatible avec simulationoptiquefobas.html fourni
   - Compatible avec simulationoptiquefobas.css fourni
   ================================================================ */

(function () {

    "use strict";

    /* ============================================================
       01 — CONFIGURATION
    ============================================================ */

    const CONFIG = window.FOBAS_OPTICS_CONFIG || {
        appName: "FOBAS OPTIQUE",
        appVersion: "1.0.0",
        engineName: "FOBAS_OPTICS_3D_ENGINE",
        storageKey: "FOBAS_OPTICS_LAB_STATE",
        units: {
            length: "cm",
            angle: "deg",
            wavelength: "nm",
            intensity: "%"
        },
        defaults: {
            wavelength: 650,
            intensity: 75,
            refractiveIndex: 1,
            showRays: true,
            showSecondaryRays: true,
            showFocalPoints: true
        }
    };


    /* ============================================================
       02 — ÉTAT GLOBAL DU MOTEUR
    ============================================================ */

    const STATE = {

        initialized: false,

        running: false,

        category: "sources",

        selectedLibraryType: null,

        selectedObject: null,

        interactionMode: "select",

        cameraMode: "orbit",

        camera: {
            yaw: -0.48,
            pitch: 0.34,
            distance: 23,
            target: {
                x: 0,
                y: 0,
                z: 0
            }
        },

        cameraDefaults: {
            yaw: -0.48,
            pitch: 0.34,
            distance: 23,
            target: {
                x: 0,
                y: 0,
                z: 0
            }
        },

        pointer: {
            x: 0,
            y: 0,
            downX: 0,
            downY: 0,
            lastX: 0,
            lastY: 0,
            dragging: false,
            button: 0
        },

        optical: {
            wavelength: Number(CONFIG.defaults.wavelength) || 650,
            intensity: Number(CONFIG.defaults.intensity) || 75,
            refractiveIndex: Number(CONFIG.defaults.refractiveIndex) || 1,
            showRays: CONFIG.defaults.showRays !== false,
            showSecondaryRays:
                CONFIG.defaults.showSecondaryRays !== false,
            showFocalPoints:
                CONFIG.defaults.showFocalPoints !== false
        },

        objects: [],

        rays: [],

        measurements: [],

        results: [],

        connections: [],

        experiment: "",

        nextObjectId: 1,

        nextMeasurementId: 1,

        fps: 0,

        lastFrameTime: performance.now(),

        frames: 0,

        fpsTimer: performance.now(),

        dirty: true,

        pendingConfirmation: null,

        rayAnimation: 0,

        dragObjectStart: null,

        measureStart: null,

        connectStart: null,

        renderError: null

    };


    /* ============================================================
       03 — DOM
    ============================================================ */

    const DOM = {};

    function cacheDOM() {

        const ids = [

            "fobasOptiqueApp",
            "engineStatus",
            "engineStatusIndicator",
            "engineStatusText",

            "btnNewExperiment",
            "btnSaveExperiment",
            "btnResetExperiment",

            "leftPanel",
            "rightPanel",
            "btnToggleLeftPanel",
            "btnToggleRightPanel",

            "componentSearch",
            "btnClearComponentSearch",
            "componentLibrary",

            "categorySources",
            "categoryLenses",
            "categoryMirrors",
            "categoryPrisms",
            "categoryFilters",
            "categoryInstruments",
            "categorySupports",

            "btnAddSelectedComponent",
            "btnRemoveSelectedComponent",

            "sceneContainer",
            "optics3DCanvas",

            "loadingOverlay",
            "loadingProgressBar",
            "loadingProgressText",

            "renderErrorOverlay",
            "renderErrorMessage",
            "btnRetry3D",

            "coordinateX",
            "coordinateY",
            "coordinateZ",

            "currentInteractionMode",
            "rayStatusIndicator",
            "rayStatusText",

            "sceneCrosshair",
            "selectionIndicator",

            "btnCameraOrbit",
            "btnCameraPan",
            "btnCameraZoomIn",
            "btnCameraZoomOut",
            "btnCameraReset",

            "toolSelect",
            "toolMove",
            "toolRotate",
            "toolMeasure",
            "toolConnect",

            "btnSceneHelp",

            "selectedObjectName",
            "selectedObjectPosition",
            "objectCount",
            "fpsCounter",

            "selectedObjectEmpty",
            "selectedObjectProperties",
            "selectedObjectIcon",
            "selectedObjectTitle",
            "selectedObjectDescription",

            "objectPositionX",
            "objectPositionY",
            "objectPositionZ",

            "objectRotationX",
            "objectRotationY",
            "objectRotationZ",

            "btnDuplicateObject",
            "btnDeleteObject",

            "wavelengthInput",
            "intensityInput",
            "intensityValue",
            "refractiveIndexInput",
            "btnApplyOpticalProperties",

            "measurementDistance",
            "measurementAngle",
            "measurementFocal",
            "measurementMagnification",

            "btnClearMeasurements",

            "showRaysToggle",
            "showSecondaryRaysToggle",
            "showFocalPointsToggle",
            "btnTraceRays",

            "experimentSelector",
            "btnLoadExperiment",

            "resultsPanel",
            "resultsContent",
            "resultsTableBody",
            "resultsEmptyRow",
            "summaryMeasurements",
            "summaryAverageError",
            "summaryPrecision",

            "btnClearResults",
            "btnExportResults",
            "btnToggleResults",

            "notificationContainer",

            "helpModal",
            "btnCloseHelpModal",

            "confirmationModal",
            "confirmationTitle",
            "confirmationMessage",
            "btnCancelConfirmation",
            "btnConfirmConfirmation",

            "objectInfoModal",
            "btnCloseObjectInfo",
            "objectInfoTitle",
            "objectInfoSubtitle",
            "infoObjectType",
            "infoObjectMaterial",
            "infoObjectIndex",
            "infoObjectFocal",

            "experimentFileInput"

        ];

        ids.forEach(function (id) {
            DOM[id] = document.getElementById(id);
        });

        DOM.categoryButtons =
            document.querySelectorAll(".category-btn");

        DOM.toolButtons =
            document.querySelectorAll(".interaction-tool");

        DOM.cameraButtons =
            document.querySelectorAll(".camera-btn");

        DOM.canvas =
            DOM.optics3DCanvas;

        if (!DOM.canvas) {
            throw new Error(
                "Le canvas #optics3DCanvas est introuvable."
            );
        }

        DOM.ctx = DOM.canvas.getContext("2d", {
            alpha: false,
            antialias: true
        });

        if (!DOM.ctx) {
            throw new Error(
                "Canvas 2D indisponible sur cet appareil."
            );
        }
    }


    /* ============================================================
       04 — BIBLIOTHÈQUE OPTIQUE
    ============================================================ */

    const LIBRARY = {

        sources: [

            {
                type: "laser",
                icon: "🔴",
                name: "Laser",
                description: "Source laser monochromatique",
                wavelength: 650,
                color: "#ff334f",
                power: 75
            },

            {
                type: "led-source",
                icon: "💡",
                name: "Source LED",
                description: "Source lumineuse étendue",
                wavelength: 550,
                color: "#fff4a8",
                power: 60
            },

            {
                type: "point-source",
                icon: "✦",
                name: "Source ponctuelle",
                description: "Source lumineuse ponctuelle",
                wavelength: 600,
                color: "#ffffff",
                power: 50
            },

            {
                type: "parallel-source",
                icon: "☰",
                name: "Source collimatée",
                description: "Faisceau parallèle",
                wavelength: 650,
                color: "#ff4050",
                power: 80
            }

        ],

        lenses: [

            {
                type: "convex-lens",
                icon: "◉",
                name: "Lentille convergente",
                description: "Lentille mince convergente",
                focalLength: 6,
                refractiveIndex: 1.5
            },

            {
                type: "concave-lens",
                icon: ")( ",
                name: "Lentille divergente",
                description: "Lentille mince divergente",
                focalLength: -6,
                refractiveIndex: 1.5
            },

            {
                type: "cylindrical-lens",
                icon: "║",
                name: "Lentille cylindrique",
                description: "Lentille à courbure cylindrique",
                focalLength: 8,
                refractiveIndex: 1.5
            }

        ],

        mirrors: [

            {
                type: "plane-mirror",
                icon: "▯",
                name: "Miroir plan",
                description: "Surface réfléchissante plane",
                focalLength: Infinity
            },

            {
                type: "concave-mirror",
                icon: "◖",
                name: "Miroir concave",
                description: "Miroir convergent",
                focalLength: 6
            },

            {
                type: "convex-mirror",
                icon: "◗",
                name: "Miroir convexe",
                description: "Miroir divergent",
                focalLength: -6
            }

        ],

        prisms: [

            {
                type: "prism",
                icon: "△",
                name: "Prisme optique",
                description: "Prisme triangulaire dispersif",
                refractiveIndex: 1.516
            },

            {
                type: "right-prism",
                icon: "◢",
                name: "Prisme droit",
                description: "Prisme à angle droit",
                refractiveIndex: 1.516
            }

        ],

        filters: [

            {
                type: "red-filter",
                icon: "🔴",
                name: "Filtre rouge",
                description: "Filtre spectral rouge",
                wavelengthMin: 600,
                wavelengthMax: 700
            },

            {
                type: "green-filter",
                icon: "🟢",
                name: "Filtre vert",
                description: "Filtre spectral vert",
                wavelengthMin: 500,
                wavelengthMax: 570
            },

            {
                type: "blue-filter",
                icon: "🔵",
                name: "Filtre bleu",
                description: "Filtre spectral bleu",
                wavelengthMin: 430,
                wavelengthMax: 500
            },

            {
                type: "polarizer",
                icon: "◈",
                name: "Polariseur",
                description: "Filtre polarisant linéaire",
                angle: 0
            }

        ],

        instruments: [

            {
                type: "screen",
                icon: "▣",
                name: "Écran",
                description: "Écran d'observation",
                size: 4
            },

            {
                type: "protractor",
                icon: "∩",
                name: "Rapporteur",
                description: "Mesure des angles",
                size: 4
            },

            {
                type: "ruler",
                icon: "📏",
                name: "Règle optique",
                description: "Mesure des distances",
                size: 10
            },

            {
                type: "photometer",
                icon: "◉",
                name: "Photomètre",
                description: "Mesure de l'intensité lumineuse",
                size: 2
            }

        ],

        supports: [

            {
                type: "optical-bench",
                icon: "═",
                name: "Banc optique",
                description: "Banc gradué pour expériences",
                size: 20
            },

            {
                type: "lens-holder",
                icon: "⊥",
                name: "Support de lentille",
                description: "Porte-lentille réglable",
                size: 1
            },

            {
                type: "mirror-holder",
                icon: "┴",
                name: "Support de miroir",
                description: "Porte-miroir réglable",
                size: 1
            },

            {
                type: "object-holder",
                icon: "⊞",
                name: "Porte-objet",
                description: "Support pour objet",
                size: 1
            }

        ]

    };


    /* ============================================================
       05 — UTILITAIRES
    ============================================================ */

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function uid(prefix) {
        return (
            prefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            Math.random().toString(36).slice(2, 8)
        );
    }

    function degToRad(deg) {
        return deg * Math.PI / 180;
    }

    function radToDeg(rad) {
        return rad * 180 / Math.PI;
    }

    function formatNumber(value, digits) {

        const n = Number(value);

        if (!Number.isFinite(n)) {
            return "—";
        }

        return n.toFixed(
            Number.isFinite(digits) ? digits : 2
        );
    }

    function wavelengthToColor(wavelength) {

        const wl = clamp(
            Number(wavelength) || 650,
            380,
            780
        );

        let r = 0;
        let g = 0;
        let b = 0;

        if (wl >= 380 && wl < 440) {
            r = -(wl - 440) / 60;
            g = 0;
            b = 1;
        } else if (wl < 490) {
            r = 0;
            g = (wl - 440) / 50;
            b = 1;
        } else if (wl < 510) {
            r = 0;
            g = 1;
            b = -(wl - 510) / 20;
        } else if (wl < 580) {
            r = (wl - 510) / 70;
            g = 1;
            b = 0;
        } else if (wl < 645) {
            r = 1;
            g = -(wl - 645) / 65;
            b = 0;
        } else {
            r = 1;
            g = 0;
            b = 0;
        }

        const factor =
            wl < 420
                ? 0.3 + 0.7 * (wl - 380) / 40
                : wl > 700
                    ? 0.3 + 0.7 * (780 - wl) / 80
                    : 1;

        return {
            r: Math.round(r * factor * 255),
            g: Math.round(g * factor * 255),
            b: Math.round(b * factor * 255)
        };
    }

    function rgb(color, alpha) {

        const a =
            Number.isFinite(alpha)
                ? alpha
                : 1;

        return (
            "rgba(" +
            color.r +
            "," +
            color.g +
            "," +
            color.b +
            "," +
            a +
            ")"
        );
    }

    function distance3D(a, b) {

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;

        return Math.sqrt(
            dx * dx +
            dy * dy +
            dz * dz
        );
    }

    function copyVector(v) {

        return {
            x: Number(v.x) || 0,
            y: Number(v.y) || 0,
            z: Number(v.z) || 0
        };
    }


    /* ============================================================
       06 — PROJECTION 3D
    ============================================================ */

    function rotatePoint(point) {

        const yaw = STATE.camera.yaw;
        const pitch = STATE.camera.pitch;

        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);

        const x1 =
            point.x * cosY -
            point.z * sinY;

        const z1 =
            point.x * sinY +
            point.z * cosY;

        const cosP = Math.cos(pitch);
        const sinP = Math.sin(pitch);

        const y2 =
            point.y * cosP -
            z1 * sinP;

        const z2 =
            point.y * sinP +
            z1 * cosP;

        return {
            x: x1,
            y: y2,
            z: z2
        };
    }

    function project(point) {

        const rotated = rotatePoint({
            x: point.x - STATE.camera.target.x,
            y: point.y - STATE.camera.target.y,
            z: point.z - STATE.camera.target.z
        });

        const depth =
            rotated.z +
            STATE.camera.distance;

        const width = DOM.canvas.clientWidth || 1;
        const height = DOM.canvas.clientHeight || 1;

        const focal =
            Math.min(width, height) * 0.9;

        const scale =
            focal /
            Math.max(depth, 2);

        return {
            x:
                width / 2 +
                rotated.x * scale,

            y:
                height / 2 -
                rotated.y * scale,

            depth: depth,

            scale: scale,

            visible: depth > 0.2
        };
    }


    /* ============================================================
       07 — RENDU CANVAS
    ============================================================ */

    function resizeCanvas() {

        const rect =
            DOM.canvas.getBoundingClientRect();

        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        DOM.canvas.width =
            Math.max(1, Math.floor(rect.width * dpr));

        DOM.canvas.height =
            Math.max(1, Math.floor(rect.height * dpr));

        DOM.ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

        STATE.dirty = true;
    }


    function clearScene() {

        const ctx = DOM.ctx;

        const width = DOM.canvas.clientWidth;
        const height = DOM.canvas.clientHeight;

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                height
            );

        gradient.addColorStop(
            0,
            "#020811"
        );

        gradient.addColorStop(
            0.5,
            "#071525"
        );

        gradient.addColorStop(
            1,
            "#030912"
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

        drawAmbientGrid();
    }


    function drawAmbientGrid() {

        const ctx = DOM.ctx;

        const size = 24;

        for (
            let x = -size;
            x <= size;
            x += 1
        ) {

            draw3DLine(
                {
                    x: x,
                    y: -1.8,
                    z: -size
                },
                {
                    x: x,
                    y: -1.8,
                    z: size
                },
                "rgba(70,130,170,0.10)",
                1
            );
        }

        for (
            let z = -size;
            z <= size;
            z += 1
        ) {

            draw3DLine(
                {
                    x: -size,
                    y: -1.8,
                    z: z
                },
                {
                    x: size,
                    y: -1.8,
                    z: z
                },
                "rgba(70,130,170,0.10)",
                1
            );
        }

        void ctx;
    }


    function draw3DLine(
        a,
        b,
        color,
        width,
        dash
    ) {

        const p1 = project(a);
        const p2 = project(b);

        if (
            !p1.visible &&
            !p2.visible
        ) {
            return;
        }

        const ctx = DOM.ctx;

        ctx.save();

        ctx.beginPath();

        ctx.moveTo(
            p1.x,
            p1.y
        );

        ctx.lineTo(
            p2.x,
            p2.y
        );

        ctx.strokeStyle = color;
        ctx.lineWidth = width || 1;

        if (dash) {
            ctx.setLineDash(dash);
        }

        ctx.stroke();

        ctx.restore();
    }


    function draw3DPoint(
        point,
        radius,
        color
    ) {

        const p = project(point);

        if (!p.visible) {
            return;
        }

        const ctx = DOM.ctx;

        ctx.save();

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            Math.max(
                2,
                radius * p.scale
            ),
            0,
            Math.PI * 2
        );

        ctx.fillStyle = color;

        ctx.shadowBlur = 15;

        ctx.shadowColor = color;

        ctx.fill();

        ctx.restore();
    }


    /* ============================================================
       08 — BANC OPTIQUE
    ============================================================ */

    function drawOpticalBench() {

        draw3DBox(
            {
                x: 0,
                y: -1.35,
                z: 0
            },
            {
                x: 21,
                y: 0.35,
                z: 1.2
            },
            "#1a2935",
            "#304655"
        );

        draw3DLine(
            {
                x: -10,
                y: -0.95,
                z: 0
            },
            {
                x: 10,
                y: -0.95,
                z: 0
            },
            "#92a6b6",
            3
        );

        for (
            let x = -10;
            x <= 10;
            x += 1
        ) {

            const longTick =
                x % 5 === 0;

            draw3DLine(
                {
                    x: x,
                    y: -0.95,
                    z: -0.22
                },
                {
                    x: x,
                    y:
                        -0.95 +
                        (longTick ? 0.3 : 0.16),
                    z: -0.22
                },
                "rgba(210,230,240,0.75)",
                longTick ? 2 : 1
            );
        }
    }


    function draw3DBox(
        center,
        size,
        topColor,
        sideColor
    ) {

        const x =
            size.x / 2;

        const y =
            size.y / 2;

        const z =
            size.z / 2;

        const vertices = [

            { x: center.x - x, y: center.y - y, z: center.z - z },
            { x: center.x + x, y: center.y - y, z: center.z - z },
            { x: center.x + x, y: center.y + y, z: center.z - z },
            { x: center.x - x, y: center.y + y, z: center.z - z },

            { x: center.x - x, y: center.y - y, z: center.z + z },
            { x: center.x + x, y: center.y - y, z: center.z + z },
            { x: center.x + x, y: center.y + y, z: center.z + z },
            { x: center.x - x, y: center.y + y, z: center.z + z }

        ];

        const faces = [

            {
                indices: [0, 1, 2, 3],
                color: sideColor
            },

            {
                indices: [4, 7, 6, 5],
                color: topColor
            },

            {
                indices: [0, 4, 5, 1],
                color: sideColor
            },

            {
                indices: [3, 2, 6, 7],
                color: topColor
            },

            {
                indices: [1, 5, 6, 2],
                color: sideColor
            },

            {
                indices: [0, 3, 7, 4],
                color: sideColor
            }

        ];

        const projected =
            vertices.map(project);

        faces
            .map(function (face) {

                let depth = 0;

                face.indices.forEach(
                    function (index) {
                        depth +=
                            projected[index].depth;
                    }
                );

                return {
                    face: face,
                    depth: depth / 4
                };

            })
            .sort(function (a, b) {
                return b.depth - a.depth;
            })
            .forEach(function (item) {

                const ctx = DOM.ctx;

                ctx.save();

                ctx.beginPath();

                item.face.indices.forEach(
                    function (index, i) {

                        const p =
                            projected[index];

                        if (i === 0) {
                            ctx.moveTo(
                                p.x,
                                p.y
                            );
                        } else {
                            ctx.lineTo(
                                p.x,
                                p.y
                            );
                        }

                    }
                );

                ctx.closePath();

                ctx.fillStyle =
                    item.face.color;

                ctx.fill();

                ctx.strokeStyle =
                    "rgba(150,190,215,0.18)";

                ctx.lineWidth = 1;

                ctx.stroke();

                ctx.restore();
            });
    }


    /* ============================================================
       09 — OBJETS OPTIQUES
    ============================================================ */

    function createObject(type) {

        const data =
            findLibraryComponent(type);

        if (!data) {
            return null;
        }

        const object = {

            id: uid("opt"),

            numericId:
                STATE.nextObjectId++,

            type: type,

            name: data.name,

            description: data.description,

            icon: data.icon || "◉",

            position: {
                x: 0,
                y: 0,
                z: 0
            },

            rotation: {
                x: 0,
                y: 0,
                z: 0
            },

            scale: {
                x: 1,
                y: 1,
                z: 1
            },

            wavelength:
                data.wavelength ||
                STATE.optical.wavelength,

            intensity:
                data.power ||
                STATE.optical.intensity,

            refractiveIndex:
                data.refractiveIndex ||
                STATE.optical.refractiveIndex,

            focalLength:
                Number.isFinite(data.focalLength)
                    ? data.focalLength
                    : null,

            material:
                getMaterialForType(type),

            visible: true,

            locked: false,

            selected: false,

            createdAt:
                Date.now(),

            data:
                JSON.parse(
                    JSON.stringify(data)
                )

        };

        positionNewObject(object);

        return object;
    }


    function positionNewObject(object) {

        const index =
            STATE.objects.length;

        object.position.x =
            -8 +
            (index % 9) * 2;

        object.position.y =
            0.25;

        object.position.z =
            ((index % 2) - 0.5) * 0.2;
    }


    function findLibraryComponent(type) {

        const categories =
            Object.keys(LIBRARY);

        for (
            let i = 0;
            i < categories.length;
            i++
        ) {

            const list =
                LIBRARY[categories[i]];

            const found =
                list.find(function (item) {
                    return item.type === type;
                });

            if (found) {
                return found;
            }
        }

        return null;
    }


    function getMaterialForType(type) {

        if (
            type.includes("mirror")
        ) {
            return "Aluminium réfléchissant";
        }

        if (
            type.includes("lens") ||
            type.includes("prism")
        ) {
            return "Verre optique";
        }

        if (
            type.includes("laser")
        ) {
            return "Semiconducteur laser";
        }

        return "Composant optique";
    }


    /* ============================================================
       10 — DESSIN DES OBJETS
    ============================================================ */

    function drawAllObjects() {

        const sorted =
            STATE.objects
                .slice()
                .sort(function (a, b) {

                    return (
                        project(b.position).depth -
                        project(a.position).depth
                    );

                });

        sorted.forEach(drawObject);
    }


    function drawObject(object) {

        if (!object.visible) {
            return;
        }

        switch (object.type) {

            case "laser":
            case "led-source":
            case "point-source":
            case "parallel-source":

                drawSource(object);

                break;

            case "convex-lens":
            case "concave-lens":
            case "cylindrical-lens":

                drawLens(object);

                break;

            case "plane-mirror":
            case "concave-mirror":
            case "convex-mirror":

                drawMirror(object);

                break;

            case "prism":
            case "right-prism":

                drawPrism(object);

                break;

            case "red-filter":
            case "green-filter":
            case "blue-filter":
            case "polarizer":

                drawFilter(object);

                break;

            case "screen":
                drawScreen(object);
                break;

            case "protractor":
                drawProtractor(object);
                break;

            case "ruler":
                drawRuler(object);
                break;

            case "photometer":
                drawPhotometer(object);
                break;

            case "optical-bench":
                drawOpticalBench();
                break;

            case "lens-holder":
            case "mirror-holder":
            case "object-holder":

                drawSupport(object);

                break;

            default:
                drawGenericObject(object);
        }

        if (object.selected) {
            drawSelection(object);
        }
    }


    function drawSource(object) {

        const ctx = DOM.ctx;

        const p =
            project(object.position);

        if (!p.visible) {
            return;
        }

        const color =
            wavelengthToColor(
                object.wavelength
            );

        const radius =
            0.28 * p.scale;

        ctx.save();

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            Math.max(5, radius),
            0,
            Math.PI * 2
        );

        const gradient =
            ctx.createRadialGradient(
                p.x,
                p.y,
                1,
                p.x,
                p.y,
                Math.max(18, radius * 5)
            );

        gradient.addColorStop(
            0,
            "rgba(255,255,255,1)"
        );

        gradient.addColorStop(
            0.2,
            rgb(color, 0.95)
        );

        gradient.addColorStop(
            1,
            rgb(color, 0)
        );

        ctx.fillStyle = gradient;

        ctx.shadowBlur = 22;

        ctx.shadowColor =
            rgb(color, 1);

        ctx.fill();

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            Math.max(2, radius * 0.45),
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ffffff";

        ctx.fill();

        ctx.restore();

        drawSourceHousing(object);
    }


    function drawSourceHousing(object) {

        draw3DBox(
            {
                x: object.position.x - 0.42,
                y: object.position.y,
                z: object.position.z
            },
            {
                x: 0.55,
                y: 0.8,
                z: 0.55
            },
            "#334957",
            "#182731"
        );
    }


    function drawLens(object) {

        const p =
            project(object.position);

        if (!p.visible) {
            return;
        }

        const ctx = DOM.ctx;

        const focal =
            Number(object.focalLength) || 6;

        const converging =
            focal > 0;

        const height =
            Math.max(
                25,
                2.7 * p.scale
            );

        const width =
            Math.max(
                10,
                0.65 * p.scale
            );

        ctx.save();

        ctx.beginPath();

        if (converging) {

            ctx.moveTo(
                p.x - width,
                p.y - height
            );

            ctx.quadraticCurveTo(
                p.x - width * 0.15,
                p.y,
                p.x - width,
                p.y + height
            );

            ctx.quadraticCurveTo(
                p.x + width * 0.15,
                p.y,
                p.x + width,
                p.y - height
            );

        } else {

            ctx.moveTo(
                p.x - width,
                p.y - height
            );

            ctx.quadraticCurveTo(
                p.x + width * 0.35,
                p.y,
                p.x - width,
                p.y + height
            );

            ctx.quadraticCurveTo(
                p.x - width * 0.35,
                p.y,
                p.x + width,
                p.y - height
            );

        }

        ctx.closePath();

        const gradient =
            ctx.createLinearGradient(
                p.x - width,
                p.y,
                p.x + width,
                p.y
            );

        gradient.addColorStop(
            0,
            "rgba(70,170,255,0.18)"
        );

        gradient.addColorStop(
            0.5,
            "rgba(210,245,255,0.72)"
        );

        gradient.addColorStop(
            1,
            "rgba(60,160,255,0.15)"
        );

        ctx.fillStyle = gradient;

        ctx.fill();

        ctx.strokeStyle =
            "rgba(190,235,255,0.9)";

        ctx.lineWidth = 2;

        ctx.stroke();

        ctx.restore();

        if (
            STATE.optical.showFocalPoints &&
            Number.isFinite(focal)
        ) {

            draw3DPoint(
                {
                    x:
                        object.position.x +
                        focal,
                    y: object.position.y,
                    z: object.position.z
                },
                0.08,
                "#ffdf63"
            );

            draw3DPoint(
                {
                    x:
                        object.position.x -
                        focal,
                    y: object.position.y,
                    z: object.position.z
                },
                0.08,
                "#ffdf63"
            );
        }
    }


    function drawMirror(object) {

        const p =
            project(object.position);

        if (!p.visible) {
            return;
        }

        const ctx = DOM.ctx;

        const h =
            Math.max(30, 3.2 * p.scale);

        const w =
            Math.max(8, 0.25 * p.scale);

        ctx.save();

        ctx.beginPath();

        ctx.roundRect(
            p.x - w,
            p.y - h,
            w * 2,
            h * 2,
            5
        );

        const gradient =
            ctx.createLinearGradient(
                p.x - w,
                p.y,
                p.x + w,
                p.y
            );

        gradient.addColorStop(
            0,
            "#dbe9ef"
        );

        gradient.addColorStop(
            0.45,
            "#ffffff"
        );

        gradient.addColorStop(
            0.65,
            "#7e9aa9"
        );

        gradient.addColorStop(
            1,
            "#243b47"
        );

        ctx.fillStyle =
            gradient;

        ctx.fill();

        ctx.strokeStyle =
            "#bde5f5";

        ctx.lineWidth = 2;

        ctx.stroke();

        ctx.restore();

        for (
            let i = -2;
            i <= 2;
            i++
        ) {

            draw3DLine(
                {
                    x:
                        object.position.x +
                        0.2,
                    y:
                        object.position.y +
                        i * 0.45,
                    z:
                        object.position.z
                },
                {
                    x:
                        object.position.x +
                        0.55,
                    y:
                        object.position.y +
                        i * 0.45 +
                        0.25,
                    z:
                        object.position.z
                },
                "rgba(100,160,180,0.55)",
                1
            );
        }
    }


    function drawPrism(object) {

        const p =
            project(object.position);

        if (!p.visible) {
            return;
        }

        const ctx = DOM.ctx;

        const size =
            Math.max(
                24,
                2.2 * p.scale
            );

        ctx.save();

        ctx.beginPath();

        ctx.moveTo(
            p.x,
            p.y - size
        );

        ctx.lineTo(
            p.x + size,
            p.y + size
        );

        ctx.lineTo(
            p.x - size,
            p.y + size
        );

        ctx.closePath();

        const gradient =
            ctx.createLinearGradient(
                p.x - size,
                p.y,
                p.x + size,
                p.y
            );

        gradient.addColorStop(
            0,
            "rgba(120,220,255,0.18)"
        );

        gradient.addColorStop(
            0.5,
            "rgba(230,255,255,0.70)"
        );

        gradient.addColorStop(
            1,
            "rgba(150,170,255,0.18)"
        );

        ctx.fillStyle = gradient;

        ctx.fill();

        ctx.strokeStyle =
            "rgba(200,245,255,0.95)";

        ctx.lineWidth = 2;

        ctx.stroke();

        ctx.restore();
    }


    function drawFilter(object) {

        const p =
            project(object.position);

        if (!p.visible) {
            return;
        }

        let color = "#ffffff";

        if (object.type === "red-filter") {
            color = "#ff3045";
        }

        if (object.type === "green-filter") {
            color = "#35e88a";
        }

        if (object.type === "blue-filter") {
            color = "#398bff";
        }

        if (object.type === "polarizer") {
            color = "#a8d8ff";
        }

        const ctx = DOM.ctx;

        ctx.save();

        ctx.fillStyle =
            color.replace(
                ")",
                ",0.28)"
            );

        ctx.globalAlpha = 0.55;

        ctx.fillRect(
            p.x - 12,
            p.y - 34,
            24,
            68
        );

        ctx.globalAlpha = 1;

        ctx.strokeStyle = color;

        ctx.lineWidth = 2;

        ctx.strokeRect(
            p.x - 12,
            p.y - 34,
            24,
            68
        );

        ctx.restore();
    }


    function drawScreen(object) {

        const p =
            project(object.position);

        if (!p.visible) {
            return;
        }

        const ctx = DOM.ctx;

        ctx.save();

        ctx.fillStyle =
            "rgba(210,225,235,0.82)";

        ctx.fillRect(
            p.x - 4,
            p.y - 45,
            8,
            90
        );

        ctx.strokeStyle =
            "#e8f6ff";

        ctx.lineWidth = 2;

        ctx.strokeRect(
            p.x - 4,
            p.y - 45,
            8,
            90
        );

        ctx.restore();
    }


    function drawProtractor(object) {

        const p =
            project(object.position);

        if (!p.visible) {
            return;
        }

        const ctx = DOM.ctx;

        ctx.save();

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            40,
            Math.PI,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "rgba(170,220,245,0.8)";

        ctx.lineWidth = 2;

        ctx.stroke();

        for (
            let angle = 0;
            angle <= 180;
            angle += 10
        ) {

            const a =
                Math.PI +
                degToRad(angle);

            const r1 =
                angle % 30 === 0
                    ? 30
                    : 35;

            const r2 = 40;

            ctx.beginPath();

            ctx.moveTo(
                p.x +
                Math.cos(a) * r1,
                p.y +
                Math.sin(a) * r1
            );

            ctx.lineTo(
                p.x +
                Math.cos(a) * r2,
                p.y +
                Math.sin(a) * r2
            );

            ctx.stroke();

        }

        ctx.restore();
    }


    function drawRuler(object) {

        const p =
            project(object.position);

        if (!p.visible) {
            return;
        }

        const ctx = DOM.ctx;

        ctx.save();

        ctx.fillStyle =
            "rgba(210,185,100,0.70)";

        ctx.fillRect(
            p.x - 80,
            p.y - 7,
            160,
            14
        );

        ctx.strokeStyle =
            "#e8d77b";

        ctx.strokeRect(
            p.x - 80,
            p.y - 7,
            160,
            14
        );

        for (
            let i = 0;
            i <= 20;
            i++
        ) {

            const x =
                p.x - 80 + i * 8;

            ctx.beginPath();

            ctx.moveTo(
                x,
                p.y - 7
            );

            ctx.lineTo(
                x,
                p.y -
                (i % 5 === 0 ? 1 : 3)
            );

            ctx.stroke();

        }

        ctx.restore();
    }


    function drawPhotometer(object) {

        const p =
            project(object.position);

        if (!p.visible) {
            return;
        }

        draw3DBox(
            object.position,
            {
                x: 0.8,
                y: 0.8,
                z: 0.8
            },
            "#243c49",
            "#152631"
        );

        draw3DPoint(
            {
                x: object.position.x,
                y: object.position.y + 0.42,
                z: object.position.z
            },
            0.12,
            "#56d7ff"
        );
    }


    function drawSupport(object) {

        draw3DBox(
            {
                x: object.position.x,
                y: object.position.y - 0.35,
                z: object.position.z
            },
            {
                x: 0.75,
                y: 0.75,
                z: 0.75
            },
            "#53636b",
            "#26343b"
        );

        draw3DLine(
            {
                x: object.position.x,
                y: object.position.y,
                z: object.position.z
            },
            {
                x: object.position.x,
                y: object.position.y + 1.5,
                z: object.position.z
            },
            "#899da8",
            4
        );
    }


    function drawGenericObject(object) {

        draw3DBox(
            object.position,
            {
                x: 1,
                y: 1,
                z: 1
            },
            "#4b7185",
            "#243945"
        );
    }


    function drawSelection(object) {

        const p =
            project(object.position);

        if (!p.visible) {
            return;
        }

        const ctx = DOM.ctx;

        const size =
            30 +
            5 *
            Math.sin(
                STATE.rayAnimation * 0.06
            );

        ctx.save();

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            size,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "rgba(75,205,255,0.85)";

        ctx.lineWidth = 2;

        ctx.setLineDash([
            6,
            5
        ]);

        ctx.stroke();

        ctx.restore();
    }


    /* ============================================================
       11 — RAYONS LUMINEUX
    ============================================================ */

    function clearRays() {

        STATE.rays = [];

        STATE.dirty = true;

        updateRayStatus();
    }


    function traceRays() {

        STATE.rays = [];

        const sources =
            STATE.objects.filter(function (object) {

                return (
                    object.type === "laser" ||
                    object.type === "led-source" ||
                    object.type === "point-source" ||
                    object.type === "parallel-source"
                );

            });

        if (!sources.length) {

            notify(
                "Ajoutez une source lumineuse avant de tracer les rayons.",
                "warning"
            );

            updateRayStatus();

            return;
        }

        sources.forEach(function (source) {

            const wavelength =
                Number(source.wavelength) ||
                STATE.optical.wavelength;

            const color =
                wavelengthToColor(
                    wavelength
                );

            const start = {
                x: source.position.x + 0.35,
                y: source.position.y,
                z: source.position.z
            };

            const direction = {
                x: 1,
                y: 0,
                z: 0
            };

            traceRayChain(
                start,
                direction,
                0,
                color,
                source
            );

        });

        STATE.dirty = true;

        updateRayStatus();

        notify(
            STATE.rays.length +
            " rayon(s) calculé(s).",
            "success"
        );
    }


    function traceRayChain(
        start,
        direction,
        depth,
        color,
        source
    ) {

        if (depth > 6) {
            return;
        }

        const maxDistance = 30;

        const nearest =
            findNearestOpticalIntersection(
                start,
                direction,
                source
            );

        if (!nearest) {

            STATE.rays.push({

                start: copyVector(start),

                end: {
                    x:
                        start.x +
                        direction.x *
                        maxDistance,

                    y:
                        start.y +
                        direction.y *
                        maxDistance,

                    z:
                        start.z +
                        direction.z *
                        maxDistance
                },

                color: color,

                intensity:
                    Math.max(
                        0.05,
                        STATE.optical.intensity /
                        100
                    ),

                depth: depth,

                animated: true

            });

            return;
        }

        STATE.rays.push({

            start: copyVector(start),

            end: copyVector(nearest.point),

            color: color,

            intensity:
                Math.max(
                    0.05,
                    STATE.optical.intensity /
                    100
                ),

            depth: depth,

            animated: true

        });

        const object =
            nearest.object;

        if (
            object.type.includes("mirror")
        ) {

            const reflected =
                reflect(
                    direction,
                    nearest.normal
                );

            traceRayChain(
                addVector(
                    nearest.point,
                    multiplyVector(
                        reflected,
                        0.03
                    )
                ),
                reflected,
                depth + 1,
                color,
                source
            );

            return;
        }

        if (
            object.type.includes("lens") ||
            object.type.includes("prism")
        ) {

            const n1 = 1;

            const n2 =
                Number(
                    object.refractiveIndex
                ) || 1.5;

            const refracted =
                refract(
                    direction,
                    nearest.normal,
                    n1,
                    n2
                );

            if (refracted) {

                traceRayChain(
                    addVector(
                        nearest.point,
                        multiplyVector(
                            refracted,
                            0.03
                        )
                    ),
                    refracted,
                    depth + 1,
                    color,
                    source
                );

            } else {

                const reflected =
                    reflect(
                        direction,
                        nearest.normal
                    );

                traceRayChain(
                    addVector(
                        nearest.point,
                        multiplyVector(
                            reflected,
                            0.03
                        )
                    ),
                    reflected,
                    depth + 1,
                    color,
                    source
                );
            }
        }
    }


    function findNearestOpticalIntersection(
        origin,
        direction,
        source
    ) {

        let nearest = null;

        STATE.objects.forEach(function (object) {

            if (
                object === source ||
                !object.visible
            ) {
                return;
            }

            const isOptical =
                object.type.includes("lens") ||
                object.type.includes("mirror") ||
                object.type.includes("prism") ||
                object.type.includes("filter");

            if (!isOptical) {
                return;
            }

            const dx =
                object.position.x -
                origin.x;

            const dy =
                object.position.y -
                origin.y;

            const dz =
                object.position.z -
                origin.z;

            const projection =
                dx * direction.x +
                dy * direction.y +
                dz * direction.z;

            if (projection <= 0.15) {
                return;
            }

            const closest = {
                x:
                    origin.x +
                    direction.x *
                    projection,

                y:
                    origin.y +
                    direction.y *
                    projection,

                z:
                    origin.z +
                    direction.z *
                    projection
            };

            const distance =
                distance3D(
                    closest,
                    object.position
                );

            const radius =
                object.type.includes("prism")
                    ? 1.5
                    : 0.65;

            if (distance <= radius) {

                if (
                    !nearest ||
                    projection <
                    nearest.distance
                ) {

                    nearest = {

                        object: object,

                        point: closest,

                        distance: projection,

                        normal: {
                            x: -1,
                            y: 0,
                            z: 0
                        }

                    };

                }
            }
        });

        return nearest;
    }


    function reflect(direction, normal) {

        const dot =
            direction.x * normal.x +
            direction.y * normal.y +
            direction.z * normal.z;

        return normalize({
            x:
                direction.x -
                2 * dot * normal.x,

            y:
                direction.y -
                2 * dot * normal.y,

            z:
                direction.z -
                2 * dot * normal.z
        });
    }


    function refract(
        direction,
        normal,
        n1,
        n2
    ) {

        let cosI =
            -(
                direction.x * normal.x +
                direction.y * normal.y +
                direction.z * normal.z
            );

        let n1Local = n1;
        let n2Local = n2;

        let localNormal = normal;

        if (cosI < 0) {

            cosI = -cosI;

            localNormal = {
                x: -normal.x,
                y: -normal.y,
                z: -normal.z
            };

            n1Local = n2;
            n2Local = n1;
        }

        const eta =
            n1Local / n2Local;

        const k =
            1 -
            eta * eta *
            (1 - cosI * cosI);

        if (k < 0) {
            return null;
        }

        return normalize({

            x:
                eta * direction.x +
                (
                    eta * cosI -
                    Math.sqrt(k)
                ) *
                localNormal.x,

            y:
                eta * direction.y +
                (
                    eta * cosI -
                    Math.sqrt(k)
                ) *
                localNormal.y,

            z:
                eta * direction.z +
                (
                    eta * cosI -
                    Math.sqrt(k)
                ) *
                localNormal.z

        });
    }


    function normalize(v) {

        const length =
            Math.sqrt(
                v.x * v.x +
                v.y * v.y +
                v.z * v.z
            );

        if (length === 0) {
            return {
                x: 0,
                y: 0,
                z: 0
            };
        }

        return {
            x: v.x / length,
            y: v.y / length,
            z: v.z / length
        };
    }


    function addVector(a, b) {

        return {
            x: a.x + b.x,
            y: a.y + b.y,
            z: a.z + b.z
        };
    }


    function multiplyVector(v, factor) {

        return {
            x: v.x * factor,
            y: v.y * factor,
            z: v.z * factor
        };
    }


    function drawRays() {

        if (!STATE.optical.showRays) {
            return;
        }

        STATE.rays.forEach(function (ray) {

            const a =
                project(ray.start);

            const b =
                project(ray.end);

            if (
                !a.visible &&
                !b.visible
            ) {
                return;
            }

            const ctx = DOM.ctx;

            const pulse =
                0.78 +
                Math.sin(
                    STATE.rayAnimation * 0.08
                ) * 0.15;

            ctx.save();

            ctx.beginPath();

            ctx.moveTo(
                a.x,
                a.y
            );

            ctx.lineTo(
                b.x,
                b.y
            );

            ctx.strokeStyle =
                rgb(
                    ray.color,
                    pulse *
                    ray.intensity
                );

            ctx.lineWidth =
                ray.depth === 0
                    ? 2.5
                    : 1.4;

            ctx.shadowBlur =
                ray.depth === 0
                    ? 14
                    : 7;

            ctx.shadowColor =
                rgb(
                    ray.color,
                    0.8
                );

            ctx.stroke();

            ctx.restore();

            if (
                ray.animated
            ) {

                const t =
                    (
                        STATE.rayAnimation *
                        0.012
                    ) % 1;

                const x =
                    ray.start.x +
                    (
                        ray.end.x -
                        ray.start.x
                    ) * t;

                const y =
                    ray.start.y +
                    (
                        ray.end.y -
                        ray.start.y
                    ) * t;

                const z =
                    ray.start.z +
                    (
                        ray.end.z -
                        ray.start.z
                    ) * t;

                draw3DPoint(
                    {
                        x: x,
                        y: y,
                        z: z
                    },
                    0.045,
                    rgb(
                        ray.color,
                        1
                    )
                );
            }
        });
    }


    function updateRayStatus() {

        if (!DOM.rayStatusText) {
            return;
        }

        const active =
            STATE.optical.showRays &&
            STATE.rays.length > 0;

        DOM.rayStatusText.textContent =
            active
                ? "ACTIFS"
                : "INACTIFS";

        if (DOM.rayStatusIndicator) {

            DOM.rayStatusIndicator.style.opacity =
                active ? "1" : "0.35";
        }
    }


    /* ============================================================
       12 — SÉLECTION
    ============================================================ */

    function selectObject(object) {

        STATE.objects.forEach(function (item) {
            item.selected = false;
        });

        if (!object) {

            STATE.selectedObject = null;

            updatePropertiesPanel();

            updateStatusBar();

            return;
        }

        object.selected = true;

        STATE.selectedObject = object;

        updatePropertiesPanel();

        updateStatusBar();

        STATE.dirty = true;
    }


    function objectAtScreenPosition(
        screenX,
        screenY
    ) {

        let closest = null;

        let closestDistance = Infinity;

        STATE.objects.forEach(function (object) {

            if (!object.visible) {
                return;
            }

            const p =
                project(object.position);

            if (!p.visible) {
                return;
            }

            const dx =
                p.x - screenX;

            const dy =
                p.y - screenY;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            const threshold =
                object.type === "optical-bench"
                    ? 80
                    : 45;

            if (
                distance <= threshold &&
                distance < closestDistance
            ) {

                closest =
                    object;

                closestDistance =
                    distance;
            }
        });

        return closest;
    }


    /* ============================================================
       13 — PROPRIÉTÉS
    ============================================================ */

    function updatePropertiesPanel() {

        const object =
            STATE.selectedObject;

        if (!object) {

            if (DOM.selectedObjectEmpty) {
                DOM.selectedObjectEmpty.classList.remove(
                    "hidden"
                );
            }

            if (DOM.selectedObjectProperties) {
                DOM.selectedObjectProperties.classList.add(
                    "hidden"
                );
            }

            return;
        }

        if (DOM.selectedObjectEmpty) {
            DOM.selectedObjectEmpty.classList.add(
                "hidden"
            );
        }

        if (DOM.selectedObjectProperties) {
            DOM.selectedObjectProperties.classList.remove(
                "hidden"
            );
        }

        if (DOM.selectedObjectIcon) {
            DOM.selectedObjectIcon.textContent =
                object.icon || "◉";
        }

        if (DOM.selectedObjectTitle) {
            DOM.selectedObjectTitle.textContent =
                object.name;
        }

        if (DOM.selectedObjectDescription) {
            DOM.selectedObjectDescription.textContent =
                object.description;
        }

        setInputValue(
            DOM.objectPositionX,
            object.position.x
        );

        setInputValue(
            DOM.objectPositionY,
            object.position.y
        );

        setInputValue(
            DOM.objectPositionZ,
            object.position.z
        );

        setInputValue(
            DOM.objectRotationX,
            radToDeg(object.rotation.x)
        );

        setInputValue(
            DOM.objectRotationY,
            radToDeg(object.rotation.y)
        );

        setInputValue(
            DOM.objectRotationZ,
            radToDeg(object.rotation.z)
        );

        updateMeasurementPanel();
    }


    function setInputValue(
        input,
        value
    ) {

        if (!input) {
            return;
        }

        input.value =
            Number.isFinite(Number(value))
                ? Number(value).toFixed(2)
                : "0";
    }


    function updateSelectedObjectFromInputs() {

        const object =
            STATE.selectedObject;

        if (!object) {
            return;
        }

        object.position.x =
            Number(DOM.objectPositionX.value) || 0;

        object.position.y =
            Number(DOM.objectPositionY.value) || 0;

        object.position.z =
            Number(DOM.objectPositionZ.value) || 0;

        object.rotation.x =
            degToRad(
                Number(DOM.objectRotationX.value) || 0
            );

        object.rotation.y =
            degToRad(
                Number(DOM.objectRotationY.value) || 0
            );

        object.rotation.z =
            degToRad(
                Number(DOM.objectRotationZ.value) || 0
            );

        updateStatusBar();

        STATE.dirty = true;

        saveStateSilently();
    }


    /* ============================================================
       14 — MESURES
    ============================================================ */

    function calculateObjectMeasurement() {

        const object =
            STATE.selectedObject;

        if (!object) {
            return;
        }

        let focal =
            Number.isFinite(object.focalLength)
                ? object.focalLength
                : null;

        let distance = null;

        let angle = null;

        let magnification = null;

        if (
            STATE.measureStart &&
            object.position
        ) {

            distance =
                distance3D(
                    STATE.measureStart,
                    object.position
                );

        }

        if (
            focal !== null &&
            focal !== 0
        ) {

            magnification =
                -1;
        }

        if (
            object.type.includes("mirror") ||
            object.type.includes("lens")
        ) {

            angle =
                radToDeg(
                    object.rotation.z
                );

        }

        DOM.measurementDistance.textContent =
            distance !== null
                ? formatNumber(distance, 2)
                : "—";

        DOM.measurementAngle.textContent =
            angle !== null
                ? formatNumber(angle, 2)
                : "—";

        DOM.measurementFocal.textContent =
            focal !== null
                ? formatNumber(focal, 2)
                : "—";

        DOM.measurementMagnification.textContent =
            magnification !== null
                ? formatNumber(magnification, 2)
                : "—";
    }


    function updateMeasurementPanel() {

        calculateObjectMeasurement();
    }


    function createMeasurement(
        a,
        b
    ) {

        const distance =
            distance3D(a, b);

        const dx =
            b.x - a.x;

        const dz =
            b.z - a.z;

        const angle =
            radToDeg(
                Math.atan2(dz, dx)
            );

        const measurement = {

            id:
                "measure_" +
                STATE.nextMeasurementId++,

            distance:
                distance,

            angle:
                angle,

            start:
                copyVector(a),

            end:
                copyVector(b),

            createdAt:
                Date.now()

        };

        STATE.measurements.push(
            measurement
        );

        DOM.measurementDistance.textContent =
            formatNumber(distance, 2);

        DOM.measurementAngle.textContent =
            formatNumber(angle, 2);

        addResult(
            "Distance",
            distance,
            distance,
            "cm"
        );

        addResult(
            "Angle",
            angle,
            angle,
            "°"
        );

        updateResults();

        notify(
            "Mesure : " +
            formatNumber(distance, 2) +
            " cm",
            "success"
        );

        return measurement;
    }


    /* ============================================================
       15 — PHYSIQUE EXPÉRIMENTALE
    ============================================================ */

    function calculateLensImage(
        focalLength,
        objectDistance
    ) {

        const f =
            Number(focalLength);

        const d =
            Number(objectDistance);

        if (
            !Number.isFinite(f) ||
            !Number.isFinite(d) ||
            d === 0
        ) {
            return null;
        }

        const denominator =
            (1 / f) -
            (1 / d);

        if (
            Math.abs(denominator) <
            1e-9
        ) {

            return {
                imageDistance: Infinity,
                magnification: Infinity
            };
        }

        const imageDistance =
            1 / denominator;

        const magnification =
            -imageDistance / d;

        return {
            imageDistance:
                imageDistance,

            magnification:
                magnification
        };
    }


    function runReflectionExperiment() {

        const mirror =
            findObjectByTypes([
                "plane-mirror",
                "concave-mirror",
                "convex-mirror"
            ]);

        const source =
            findObjectByTypes([
                "laser",
                "parallel-source",
                "point-source",
                "led-source"
            ]);

        if (!mirror || !source) {

            notify(
                "Cette expérience nécessite une source et un miroir.",
                "warning"
            );

            return;
        }

        const incidence =
            30;

        const reflection =
            incidence;

        addResult(
            "Angle d'incidence",
            incidence,
            incidence,
            "°"
        );

        addResult(
            "Angle de réflexion",
            reflection,
            reflection,
            "°"
        );

        addResult(
            "Loi de réflexion",
            "i = r",
            "i = r",
            ""
        );

        updateResults();

        traceRays();

        notify(
            "Expérience de réflexion chargée.",
            "success"
        );
    }


    function runRefractionExperiment() {

        const n1 = 1.000;

        const n2 =
            Number(
                DOM.refractiveIndexInput.value
            ) || 1.5;

        const incidence =
            30;

        const sinR =
            (
                n1 /
                n2
            ) *
            Math.sin(
                degToRad(incidence)
            );

        if (Math.abs(sinR) > 1) {

            notify(
                "Réflexion totale interne.",
                "warning"
            );

            addResult(
                "Réfraction",
                "Réflexion totale",
                "Réflexion totale",
                ""
            );

            updateResults();

            return;
        }

        const refraction =
            radToDeg(
                Math.asin(sinR)
            );

        addResult(
            "Angle incident",
            incidence,
            incidence,
            "°"
        );

        addResult(
            "Angle réfracté",
            refraction,
            refraction,
            "°"
        );

        addResult(
            "Indice n₂",
            n2,
            n2,
            ""
        );

        updateResults();

        traceRays();

        notify(
            "Expérience de réfraction calculée.",
            "success"
        );
    }


    function runLensExperiment(
        converging
    ) {

        let lens = null;

        if (converging) {

            lens =
                findObjectByTypes([
                    "convex-lens"
                ]);

        } else {

            lens =
                findObjectByTypes([
                    "concave-lens"
                ]);
        }

        const source =
            findObjectByTypes([
                "laser",
                "parallel-source",
                "point-source"
            ]);

        if (!lens || !source) {

            notify(
                "Ajoutez la lentille et la source correspondantes.",
                "warning"
            );

            return;
        }

        const objectDistance =
            Math.max(
                2,
                Math.abs(
                    lens.position.x -
                    source.position.x
                )
            );

        const result =
            calculateLensImage(
                lens.focalLength,
                objectDistance
            );

        if (!result) {
            return;
        }

        addResult(
            "Distance objet",
            objectDistance,
            objectDistance,
            "cm"
        );

        if (
            Number.isFinite(
                result.imageDistance
            )
        ) {

            addResult(
                "Distance image",
                result.imageDistance,
                result.imageDistance,
                "cm"
            );

            addResult(
                "Grossissement",
                result.magnification,
                result.magnification,
                "×"
            );

        }

        updateResults();

        traceRays();

        notify(
            converging
                ? "Expérience de lentille convergente calculée."
                : "Expérience de lentille divergente calculée.",
            "success"
        );
    }


    function runMirrorExperiment(
        type
    ) {

        const mirror =
            findObjectByTypes([
                type
            ]);

        if (!mirror) {

            notify(
                "Ajoutez le miroir demandé.",
                "warning"
            );

            return;
        }

        const focal =
            Number(mirror.focalLength);

        if (
            Number.isFinite(focal)
        ) {

            const radius =
                focal * 2;

            addResult(
                "Distance focale",
                focal,
                focal,
                "cm"
            );

            addResult(
                "Rayon de courbure",
                radius,
                radius,
                "cm"
            );
        }

        traceRays();

        updateResults();

        notify(
            "Expérience du miroir chargée.",
            "success"
        );
    }


    function runPrismExperiment() {

        const prism =
            findObjectByTypes([
                "prism",
                "right-prism"
            ]);

        const source =
            findObjectByTypes([
                "laser",
                "parallel-source"
            ]);

        if (!prism || !source) {

            notify(
                "Ajoutez un prisme et une source.",
                "warning"
            );

            return;
        }

        const wavelengths = [
            450,
            500,
            550,
            600,
            650
        ];

        wavelengths.forEach(
            function (wavelength) {

                const color =
                    wavelengthToColor(
                        wavelength
                    );

                STATE.rays.push({

                    start: {
                        x: source.position.x,
                        y: source.position.y,
                        z: source.position.z
                    },

                    end: {
                        x:
                            prism.position.x + 6,

                        y:
                            prism.position.y +
                            (
                                650 -
                                wavelength
                            ) * 0.006,

                        z:
                            prism.position.z
                    },

                    color: color,

                    intensity: 0.85,

                    depth: 0,

                    animated: true

                });

            }
        );

        addResult(
            "Dispersion",
            "Spectre visible",
            "Spectre visible",
            ""
        );

        updateResults();

        notify(
            "Dispersion simulée dans le prisme.",
            "success"
        );
    }


    function runFiberExperiment() {

        const source =
            findObjectByTypes([
                "laser"
            ]);

        if (!source) {

            notify(
                "Ajoutez un laser pour l'expérience de fibre optique.",
                "warning"
            );

            return;
        }

        const nCore = 1.48;

        const nCladding = 1.46;

        const critical =
            radToDeg(
                Math.asin(
                    nCladding /
                    nCore
                )
            );

        addResult(
            "Indice cœur",
            nCore,
            nCore,
            ""
        );

        addResult(
            "Indice gaine",
            nCladding,
            nCladding,
            ""
        );

        addResult(
            "Angle critique",
            critical,
            critical,
            "°"
        );

        updateResults();

        notify(
            "Paramètres de fibre optique calculés.",
            "success"
        );
    }


    function findObjectByTypes(types) {

        return STATE.objects.find(
            function (object) {

                return types.includes(
                    object.type
                );

            }
        ) || null;
    }


    /* ============================================================
       16 — EXPÉRIENCES
    ============================================================ */

    function loadExperiment(name) {

        if (!name) {

            notify(
                "Sélectionnez une expérience.",
                "warning"
            );

            return;
        }

        STATE.experiment = name;

        switch (name) {

            case "reflection":
                runReflectionExperiment();
                break;

            case "refraction":
                runRefractionExperiment();
                break;

            case "converging-lens":
                runLensExperiment(true);
                break;

            case "diverging-lens":
                runLensExperiment(false);
                break;

            case "plane-mirror":
                runMirrorExperiment(
                    "plane-mirror"
                );
                break;

            case "concave-mirror":
                runMirrorExperiment(
                    "concave-mirror"
                );
                break;

            case "convex-mirror":
                runMirrorExperiment(
                    "convex-mirror"
                );
                break;

            case "prism-dispersion":
                runPrismExperiment();
                break;

            case "optical-fiber":
                runFiberExperiment();
                break;

            default:
                notify(
                    "Expérience inconnue.",
                    "error"
                );
        }
    }


    /* ============================================================
       17 — RÉSULTATS
    ============================================================ */

    function addResult(
        measurement,
        theoretical,
        experimental,
        unit
    ) {

        let error = "—";

        let difference = "—";

        if (
            typeof theoretical === "number" &&
            typeof experimental === "number"
        ) {

            difference =
                experimental -
                theoretical;

            if (
                theoretical !== 0
            ) {

                error =
                    Math.abs(
                        difference /
                        theoretical
                    ) *
                    100;

            } else {

                error = 0;
            }
        }

        STATE.results.push({

            id: uid("result"),

            measurement:
                measurement,

            theoretical:
                theoretical,

            experimental:
                experimental,

            difference:
                difference,

            error:
                error,

            unit:
                unit || ""

        });
    }


    function updateResults() {

        if (!DOM.resultsTableBody) {
            return;
        }

        DOM.resultsTableBody.innerHTML = "";

        if (!STATE.results.length) {

            const row =
                document.createElement("tr");

            const cell =
                document.createElement("td");

            cell.colSpan = 6;

            cell.className =
                "results-empty";

            cell.textContent =
                "Aucune mesure disponible. Lancez une expérience pour obtenir des résultats.";

            row.appendChild(cell);

            DOM.resultsTableBody.appendChild(
                row
            );

        } else {

            STATE.results.forEach(
                function (result) {

                    const row =
                        document.createElement("tr");

                    appendCell(
                        row,
                        result.measurement
                    );

                    appendCell(
                        row,
                        formatScientific(
                            result.theoretical
                        )
                    );

                    appendCell(
                        row,
                        formatScientific(
                            result.experimental
                        )
                    );

                    appendCell(
                        row,
                        formatScientific(
                            result.difference
                        )
                    );

                    appendCell(
                        row,
                        typeof result.error === "number"
                            ? formatNumber(
                                result.error,
                                2
                            ) + " %"
                            : result.error
                    );

                    appendCell(
                        row,
                        result.unit
                    );

                    DOM.resultsTableBody.appendChild(
                        row
                    );
                }
            );
        }

        updateResultsSummary();
    }


    function appendCell(row, text) {

        const cell =
            document.createElement("td");

        cell.textContent =
            text === undefined ||
            text === null
                ? "—"
                : String(text);

        row.appendChild(cell);
    }


    function formatScientific(value) {

        if (
            typeof value !== "number"
        ) {
            return String(value);
        }

        if (!Number.isFinite(value)) {
            return "∞";
        }

        return formatNumber(
            value,
            4
        );
    }


    function updateResultsSummary() {

        const count =
            STATE.results.length;

        if (DOM.summaryMeasurements) {
            DOM.summaryMeasurements.textContent =
                String(count);
        }

        const numericErrors =
            STATE.results
                .map(function (result) {
                    return result.error;
                })
                .filter(function (error) {
                    return typeof error === "number" &&
                        Number.isFinite(error);
                });

        if (!numericErrors.length) {

            if (DOM.summaryAverageError) {
                DOM.summaryAverageError.textContent =
                    "—";
            }

            if (DOM.summaryPrecision) {
                DOM.summaryPrecision.textContent =
                    "—";
            }

            return;
        }

        const average =
            numericErrors.reduce(
                function (sum, value) {
                    return sum + value;
                },
                0
            ) /
            numericErrors.length;

        const precision =
            Math.max(
                0,
                100 - average
            );

        if (DOM.summaryAverageError) {
            DOM.summaryAverageError.textContent =
                formatNumber(
                    average,
                    2
                ) + " %";
        }

        if (DOM.summaryPrecision) {
            DOM.summaryPrecision.textContent =
                formatNumber(
                    precision,
                    2
                ) + " %";
        }
    }


    /* ============================================================
       18 — BIBLIOTHÈQUE UI
    ============================================================ */

    function renderLibrary() {

        if (!DOM.componentLibrary) {
            return;
        }

        const list =
            LIBRARY[STATE.category] || [];

        const search =
            (
                DOM.componentSearch &&
                DOM.componentSearch.value
            )
                ? DOM.componentSearch.value
                    .trim()
                    .toLowerCase()
                : "";

        const filtered =
            list.filter(function (item) {

                if (!search) {
                    return true;
                }

                const text =
                    (
                        item.name +
                        " " +
                        item.description
                    ).toLowerCase();

                return text.includes(search);
            });

        DOM.componentLibrary.innerHTML = "";

        if (!filtered.length) {

            const empty =
                document.createElement("div");

            empty.className =
                "library-empty";

            empty.innerHTML =
                "<div class=\"library-empty-icon\">🔬</div>" +
                "<div class=\"library-empty-title\">Aucun composant</div>" +
                "<div class=\"library-empty-text\">Aucun élément ne correspond à votre recherche.</div>";

            DOM.componentLibrary.appendChild(
                empty
            );

            updateLibraryButtons();

            return;
        }

        filtered.forEach(function (item) {

            const card =
                document.createElement("button");

            card.type = "button";

            card.className =
                "component-card";

            card.dataset.type =
                item.type;

            card.innerHTML =
                "<span class=\"component-icon\">" +
                escapeHTML(item.icon || "◉") +
                "</span>" +

                "<span class=\"component-name\">" +
                escapeHTML(item.name) +
                "</span>" +

                "<span class=\"component-description\">" +
                escapeHTML(item.description) +
                "</span>";

            card.addEventListener(
                "click",
                function () {

                    STATE.selectedLibraryType =
                        item.type;

                    document
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

                    updateLibraryButtons();
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

            DOM.componentLibrary.appendChild(
                card
            );
        });

        updateLibraryButtons();
    }


    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function updateLibraryButtons() {

        const hasLibrarySelection =
            Boolean(
                STATE.selectedLibraryType
            );

        if (DOM.btnAddSelectedComponent) {
            DOM.btnAddSelectedComponent.disabled =
                !hasLibrarySelection;
        }

        if (DOM.btnRemoveSelectedComponent) {
            DOM.btnRemoveSelectedComponent.disabled =
                !STATE.selectedObject;
        }
    }


    function addSelectedComponent() {

        const type =
            STATE.selectedLibraryType;

        if (!type) {

            notify(
                "Sélectionnez d'abord un composant.",
                "warning"
            );

            return;
        }

        const object =
            createObject(type);

        if (!object) {

            notify(
                "Impossible de créer ce composant.",
                "error"
            );

            return;
        }

        STATE.objects.push(object);

        selectObject(object);

        updateStatusBar();

        STATE.dirty = true;

        notify(
            object.name +
            " ajouté au laboratoire.",
            "success"
        );

        saveStateSilently();
    }


    function removeSelectedComponent() {

        if (!STATE.selectedObject) {

            notify(
                "Aucun objet sélectionné.",
                "warning"
            );

            return;
        }

        confirmAction(
            "Supprimer l'objet",
            "Voulez-vous réellement supprimer « " +
            STATE.selectedObject.name +
            " » ?",
            function () {

                deleteObject(
                    STATE.selectedObject
                );

            }
        );
    }


    function deleteObject(object) {

        if (!object) {
            return;
        }

        STATE.objects =
            STATE.objects.filter(
                function (item) {
                    return item !== object;
                }
            );

        STATE.connections =
            STATE.connections.filter(
                function (connection) {
                    return (
                        connection.a !== object.id &&
                        connection.b !== object.id
                    );
                }
            );

        if (
            STATE.selectedObject === object
        ) {
            STATE.selectedObject = null;
        }

        updatePropertiesPanel();

        updateStatusBar();

        updateLibraryButtons();

        STATE.dirty = true;

        notify(
            object.name +
            " supprimé.",
            "success"
        );

        saveStateSilently();
    }


    /* ============================================================
       19 — DUPLICATION
    ============================================================ */

    function duplicateSelectedObject() {

        const source =
            STATE.selectedObject;

        if (!source) {

            notify(
                "Sélectionnez un objet à dupliquer.",
                "warning"
            );

            return;
        }

        const clone =
            JSON.parse(
                JSON.stringify(source)
            );

        clone.id =
            uid("opt");

        clone.numericId =
            STATE.nextObjectId++;

        clone.name =
            source.name +
            " — copie";

        clone.position.x += 1.2;

        clone.selected = false;

        STATE.objects.push(clone);

        selectObject(clone);

        STATE.dirty = true;

        notify(
            "Objet dupliqué.",
            "success"
        );

        saveStateSilently();
    }


    /* ============================================================
       20 — INTERACTION
    ============================================================ */

    function setInteractionMode(mode) {

        const validModes = [
            "select",
            "move",
            "rotate",
            "measure",
            "connect"
        ];

        if (
            !validModes.includes(mode)
        ) {
            return;
        }

        STATE.interactionMode =
            mode;

        DOM.toolButtons.forEach(
            function (button) {

                button.classList.toggle(
                    "active",
                    button.dataset.tool === mode
                );
            }
        );

        if (DOM.currentInteractionMode) {

            const names = {

                select: "SÉLECTION",

                move: "DÉPLACEMENT",

                rotate: "ROTATION",

                measure: "MESURE",

                connect: "CONNEXION"

            };

            DOM.currentInteractionMode.textContent =
                names[mode];
        }

        if (mode === "measure") {

            DOM.sceneCrosshair.classList.remove(
                "hidden"
            );

        } else {

            DOM.sceneCrosshair.classList.add(
                "hidden"
            );
        }

        STATE.measureStart = null;

        STATE.connectStart = null;

        notify(
            "Mode : " +
            mode.toUpperCase(),
            "info"
        );
    }


    function handleCanvasPointerDown(event) {

        const point =
            getCanvasPoint(event);

        STATE.pointer.downX =
            point.x;

        STATE.pointer.downY =
            point.y;

        STATE.pointer.lastX =
            point.x;

        STATE.pointer.lastY =
            point.y;

        STATE.pointer.dragging = true;

        STATE.pointer.button =
            event.button;

        if (
            STATE.cameraMode === "orbit" &&
            event.button === 0 &&
            STATE.interactionMode === "select"
        ) {

            const object =
                objectAtScreenPosition(
                    point.x,
                    point.y
                );

            if (object) {
                selectObject(object);
            }
        }

        if (
            STATE.interactionMode === "measure"
        ) {

            const world =
                screenToGround(
                    point.x,
                    point.y
                );

            if (!STATE.measureStart) {

                STATE.measureStart =
                    world;

                notify(
                    "Premier point de mesure enregistré.",
                    "info"
                );

            } else {

                createMeasurement(
                    STATE.measureStart,
                    world
                );

                STATE.measureStart = null;
            }
        }

        if (
            STATE.interactionMode === "connect"
        ) {

            const object =
                objectAtScreenPosition(
                    point.x,
                    point.y
                );

            if (!object) {
                return;
            }

            if (!STATE.connectStart) {

                STATE.connectStart =
                    object;

                selectObject(object);

                notify(
                    "Sélectionnez le deuxième composant.",
                    "info"
                );

            } else {

                connectObjects(
                    STATE.connectStart,
                    object
                );

                STATE.connectStart = null;
            }
        }

        if (
            STATE.interactionMode === "move" &&
            STATE.selectedObject
        ) {

            STATE.dragObjectStart = {
                position:
                    copyVector(
                        STATE.selectedObject.position
                    ),

                pointer:
                    {
                        x: point.x,
                        y: point.y
                    }
            };
        }
    }


    function handleCanvasPointerMove(event) {

        const point =
            getCanvasPoint(event);

        const dx =
            point.x -
            STATE.pointer.lastX;

        const dy =
            point.y -
            STATE.pointer.lastY;

        if (!STATE.pointer.dragging) {
            return;
        }

        if (
            STATE.interactionMode === "move" &&
            STATE.selectedObject &&
            STATE.dragObjectStart
        ) {

            moveSelectedObject(
                dx,
                dy
            );

        } else if (
            STATE.interactionMode === "rotate" &&
            STATE.selectedObject
        ) {

            rotateSelectedObject(
                dx,
                dy
            );

        } else if (
            STATE.cameraMode === "orbit"
        ) {

            STATE.camera.yaw +=
                dx * 0.008;

            STATE.camera.pitch =
                clamp(
                    STATE.camera.pitch +
                    dy * 0.006,
                    -1.2,
                    1.2
                );

        } else if (
            STATE.cameraMode === "pan"
        ) {

            STATE.camera.target.x -=
                dx * 0.018;

            STATE.camera.target.y +=
                dy * 0.018;
        }

        STATE.pointer.lastX =
            point.x;

        STATE.pointer.lastY =
            point.y;

        STATE.dirty = true;
    }


    function handleCanvasPointerUp() {

        STATE.pointer.dragging =
            false;

        STATE.dragObjectStart =
            null;

        STATE.pointer.button = 0;

        saveStateSilently();
    }


    function moveSelectedObject(
        dx,
        dy
    ) {

        const object =
            STATE.selectedObject;

        if (!object || object.locked) {
            return;
        }

        const scale =
            Math.max(
                0.01,
                STATE.camera.distance / 450
            );

        object.position.x +=
            dx * scale;

        object.position.y -=
            dy * scale;

        updatePropertiesPanel();

        updateStatusBar();

        STATE.dirty = true;
    }


    function rotateSelectedObject(
        dx,
        dy
    ) {

        const object =
            STATE.selectedObject;

        if (!object || object.locked) {
            return;
        }

        object.rotation.z +=
            dx * 0.01;

        object.rotation.y +=
            dy * 0.01;

        updatePropertiesPanel();

        STATE.dirty = true;
    }


    function getCanvasPoint(event) {

        const rect =
            DOM.canvas.getBoundingClientRect();

        return {
            x:
                event.clientX -
                rect.left,

            y:
                event.clientY -
                rect.top
        };
    }


    function screenToGround(
        x,
        y
    ) {

        const width =
            DOM.canvas.clientWidth;

        const height =
            DOM.canvas.clientHeight;

        const nx =
            (
                x -
                width / 2
            ) /
            (
                Math.min(
                    width,
                    height
                ) * 0.45
            );

        const ny =
            (
                height / 2 -
                y
            ) /
            (
                Math.min(
                    width,
                    height
                ) * 0.45
            );

        return {
            x:
                nx *
                STATE.camera.distance *
                0.65,

            y: 0,

            z:
                ny *
                STATE.camera.distance *
                0.65
        };
    }


    /* ============================================================
       21 — CONNEXIONS
    ============================================================ */

    function connectObjects(a, b) {

        if (
            !a ||
            !b ||
            a === b
        ) {

            notify(
                "Connexion invalide.",
                "warning"
            );

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
                "Ces deux composants sont déjà connectés.",
                "warning"
            );

            return;
        }

        STATE.connections.push({

            id: uid("connection"),

            a: a.id,

            b: b.id,

            createdAt: Date.now()

        });

        STATE.dirty = true;

        notify(
            a.name +
            " connecté à " +
            b.name +
            ".",
            "success"
        );

        saveStateSilently();
    }


    function drawConnections() {

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

                draw3DLine(
                    a.position,
                    b.position,
                    "rgba(70,210,255,0.72)",
                    2,
                    [6, 4]
                );
            }
        );
    }


    /* ============================================================
       22 — CAMÉRA
    ============================================================ */

    function setCameraMode(mode) {

        if (
            mode !== "orbit" &&
            mode !== "pan"
        ) {
            return;
        }

        STATE.cameraMode =
            mode;

        if (DOM.btnCameraOrbit) {

            DOM.btnCameraOrbit.classList.toggle(
                "active",
                mode === "orbit"
            );
        }

        if (DOM.btnCameraPan) {

            DOM.btnCameraPan.classList.toggle(
                "active",
                mode === "pan"
            );
        }
    }


    function cameraZoom(factor) {

        STATE.camera.distance =
            clamp(
                STATE.camera.distance *
                factor,
                7,
                60
            );

        STATE.dirty = true;
    }


    function resetCamera() {

        STATE.camera.yaw =
            STATE.cameraDefaults.yaw;

        STATE.camera.pitch =
            STATE.cameraDefaults.pitch;

        STATE.camera.distance =
            STATE.cameraDefaults.distance;

        STATE.camera.target =
            copyVector(
                STATE.cameraDefaults.target
            );

        STATE.dirty = true;

        notify(
            "Caméra réinitialisée.",
            "success"
        );
    }


    /* ============================================================
       23 — RENDU PRINCIPAL
    ============================================================ */

    function renderScene() {

        clearScene();

        drawOpticalBench();

        drawConnections();

        drawRays();

        drawAllObjects();

        updateHUD();

        STATE.dirty = false;
    }


    function updateHUD() {

        const selected =
            STATE.selectedObject;

        if (selected) {

            if (DOM.coordinateX) {
                DOM.coordinateX.textContent =
                    "X: " +
                    formatNumber(
                        selected.position.x,
                        2
                    );
            }

            if (DOM.coordinateY) {
                DOM.coordinateY.textContent =
                    "Y: " +
                    formatNumber(
                        selected.position.y,
                        2
                    );
            }

            if (DOM.coordinateZ) {
                DOM.coordinateZ.textContent =
                    "Z: " +
                    formatNumber(
                        selected.position.z,
                        2
                    );
            }

        } else {

            if (DOM.coordinateX) {
                DOM.coordinateX.textContent =
                    "X: 0.00";
            }

            if (DOM.coordinateY) {
                DOM.coordinateY.textContent =
                    "Y: 0.00";
            }

            if (DOM.coordinateZ) {
                DOM.coordinateZ.textContent =
                    "Z: 0.00";
            }
        }
    }


    /* ============================================================
       24 — STATUS BAR
    ============================================================ */

    function updateStatusBar() {

        if (DOM.selectedObjectName) {

            DOM.selectedObjectName.textContent =
                STATE.selectedObject
                    ? STATE.selectedObject.name
                    : "Aucun";
        }

        if (DOM.selectedObjectPosition) {

            DOM.selectedObjectPosition.textContent =
                STATE.selectedObject
                    ? (
                        formatNumber(
                            STATE.selectedObject.position.x,
                            2
                        ) +
                        " / " +
                        formatNumber(
                            STATE.selectedObject.position.y,
                            2
                        ) +
                        " / " +
                        formatNumber(
                            STATE.selectedObject.position.z,
                            2
                        )
                    )
                    : "—";
        }

        if (DOM.objectCount) {

            DOM.objectCount.textContent =
                String(
                    STATE.objects.length
                );
        }

        if (DOM.fpsCounter) {

            DOM.fpsCounter.textContent =
                String(
                    Math.round(STATE.fps)
                );
        }

        updateLibraryButtons();
    }


    /* ============================================================
       25 — PARAMÈTRES OPTIQUES
    ============================================================ */

    function applyOpticalProperties() {

        const wavelength =
            clamp(
                Number(
                    DOM.wavelengthInput.value
                ) || 650,
                100,
                2000
            );

        const intensity =
            clamp(
                Number(
                    DOM.intensityInput.value
                ) || 75,
                0,
                100
            );

        const refractiveIndex =
            clamp(
                Number(
                    DOM.refractiveIndexInput.value
                ) || 1,
                1,
                5
            );

        STATE.optical.wavelength =
            wavelength;

        STATE.optical.intensity =
            intensity;

        STATE.optical.refractiveIndex =
            refractiveIndex;

        if (DOM.intensityValue) {

            DOM.intensityValue.textContent =
                String(intensity);
        }

        if (STATE.selectedObject) {

            STATE.selectedObject.wavelength =
                wavelength;

            STATE.selectedObject.intensity =
                intensity;

            STATE.selectedObject.refractiveIndex =
                refractiveIndex;
        }

        clearRays();

        STATE.dirty = true;

        saveStateSilently();

        notify(
            "Paramètres optiques appliqués.",
            "success"
        );
    }


    /* ============================================================
       26 — SAUVEGARDE LOCALE
    ============================================================ */

    function serializeState() {

        return {

            version:
                CONFIG.appVersion,

            camera: {
                yaw:
                    STATE.camera.yaw,

                pitch:
                    STATE.camera.pitch,

                distance:
                    STATE.camera.distance,

                target:
                    copyVector(
                        STATE.camera.target
                    )
            },

            optical:
                JSON.parse(
                    JSON.stringify(
                        STATE.optical
                    )
                ),

            objects:
                JSON.parse(
                    JSON.stringify(
                        STATE.objects
                    )
                ),

            connections:
                JSON.parse(
                    JSON.stringify(
                        STATE.connections
                    )
                ),

            measurements:
                JSON.parse(
                    JSON.stringify(
                        STATE.measurements
                    )
                ),

            results:
                JSON.parse(
                    JSON.stringify(
                        STATE.results
                    )
                ),

            experiment:
                STATE.experiment

        };
    }


    function saveStateSilently() {

        try {

            localStorage.setItem(
                CONFIG.storageKey,
                JSON.stringify(
                    serializeState()
                )
            );

        } catch (error) {

            console.warn(
                "FOBAS OPTIQUE : sauvegarde locale impossible.",
                error
            );
        }
    }


    function saveExperiment() {

        saveStateSilently();

        const data =
            serializeState();

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

        const anchor =
            document.createElement("a");

        anchor.href = url;

        anchor.download =
            "fobas-optique-experience.json";

        document.body.appendChild(
            anchor
        );

        anchor.click();

        anchor.remove();

        setTimeout(
            function () {
                URL.revokeObjectURL(url);
            },
            1000
        );

        notify(
            "Expérience sauvegardée.",
            "success"
        );
    }


    function loadSavedState() {

        try {

            const raw =
                localStorage.getItem(
                    CONFIG.storageKey
                );

            if (!raw) {
                return false;
            }

            const data =
                JSON.parse(raw);

            restoreState(data);

            return true;

        } catch (error) {

            console.warn(
                "FOBAS OPTIQUE : état local invalide.",
                error
            );

            return false;
        }
    }


    function restoreState(data) {

        if (!data) {
            return;
        }

        if (data.camera) {

            STATE.camera.yaw =
                Number(data.camera.yaw) ||
                STATE.cameraDefaults.yaw;

            STATE.camera.pitch =
                Number(data.camera.pitch) ||
                STATE.cameraDefaults.pitch;

            STATE.camera.distance =
                Number(data.camera.distance) ||
                STATE.cameraDefaults.distance;

            if (data.camera.target) {

                STATE.camera.target =
                    copyVector(
                        data.camera.target
                    );
            }
        }

        if (data.optical) {

            Object.assign(
                STATE.optical,
                data.optical
            );
        }

        if (Array.isArray(data.objects)) {

            STATE.objects =
                data.objects.map(
                    function (object) {

                        return normalizeLoadedObject(
                            object
                        );

                    }
                );
        }

        if (Array.isArray(data.connections)) {

            STATE.connections =
                data.connections;
        }

        if (Array.isArray(data.measurements)) {

            STATE.measurements =
                data.measurements;
        }

        if (Array.isArray(data.results)) {

            STATE.results =
                data.results;
        }

        STATE.experiment =
            data.experiment || "";

        STATE.selectedObject =
            null;

        updatePropertiesPanel();

        updateStatusBar();

        updateResults();

        updateRayStatus();

        STATE.dirty = true;
    }


    function normalizeLoadedObject(object) {

        return {

            id:
                object.id ||
                uid("opt"),

            numericId:
                object.numericId ||
                STATE.nextObjectId++,

            type:
                object.type ||
                "point-source",

            name:
                object.name ||
                "Objet optique",

            description:
                object.description ||
                "",

            icon:
                object.icon ||
                "◉",

            position:
                copyVector(
                    object.position ||
                    {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                ),

            rotation:
                copyVector(
                    object.rotation ||
                    {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                ),

            scale:
                copyVector(
                    object.scale ||
                    {
                        x: 1,
                        y: 1,
                        z: 1
                    }
                ),

            wavelength:
                Number(object.wavelength) ||
                650,

            intensity:
                Number(object.intensity) ||
                75,

            refractiveIndex:
                Number(object.refractiveIndex) ||
                1,

            focalLength:
                object.focalLength === null ||
                object.focalLength === undefined
                    ? null
                    : Number(object.focalLength),

            material:
                object.material ||
                "Composant optique",

            visible:
                object.visible !== false,

            locked:
                object.locked === true,

            selected: false,

            createdAt:
                object.createdAt ||
                Date.now(),

            data:
                object.data ||
                {}

        };
    }


    function importExperiment(file) {

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

                    restoreState(data);

                    saveStateSilently();

                    notify(
                        "Expérience importée avec succès.",
                        "success"
                    );

                } catch (error) {

                    notify(
                        "Le fichier JSON est invalide.",
                        "error"
                    );

                    console.error(
                        error
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

        reader.readAsText(file);
    }


    /* ============================================================
       27 — NOUVELLE EXPÉRIENCE
    ============================================================ */

    function newExperiment() {

        confirmAction(
            "Nouvelle expérience",
            "Tous les objets et résultats actuels seront remplacés.",
            function () {

                clearExperiment();

                addDefaultLaboratory();

                notify(
                    "Nouvelle expérience créée.",
                    "success"
                );
            }
        );
    }


    function resetExperiment() {

        confirmAction(
            "Réinitialiser",
            "La configuration actuelle sera réinitialisée.",
            function () {

                clearExperiment();

                addDefaultLaboratory();

                resetCamera();

                notify(
                    "Laboratoire réinitialisé.",
                    "success"
                );
            }
        );
    }


    function clearExperiment() {

        STATE.objects = [];

        STATE.rays = [];

        STATE.measurements = [];

        STATE.results = [];

        STATE.connections = [];

        STATE.selectedObject = null;

        STATE.selectedLibraryType = null;

        STATE.experiment = "";

        localStorage.removeItem(
            CONFIG.storageKey
        );

        updatePropertiesPanel();

        updateStatusBar();

        updateResults();

        updateRayStatus();

        STATE.dirty = true;
    }


    function addDefaultLaboratory() {

        const bench =
            createObject(
                "optical-bench"
            );

        if (bench) {

            bench.position = {
                x: 0,
                y: 0,
                z: 0
            };

            STATE.objects.push(
                bench
            );
        }

        const laser =
            createObject(
                "laser"
            );

        if (laser) {

            laser.position = {
                x: -7,
                y: 0.4,
                z: 0
            };

            STATE.objects.push(
                laser
            );
        }

        const lens =
            createObject(
                "convex-lens"
            );

        if (lens) {

            lens.position = {
                x: 0,
                y: 0.5,
                z: 0
            };

            STATE.objects.push(
                lens
            );
        }

        const screen =
            createObject(
                "screen"
            );

        if (screen) {

            screen.position = {
                x: 6,
                y: 0.5,
                z: 0
            };

            STATE.objects.push(
                screen
            );
        }

        updateStatusBar();

        traceRays();
    }


    /* ============================================================
       28 — MODALES
    ============================================================ */

    function openModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "hidden"
        );
    }


    function closeModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.add(
            "hidden"
        );
    }


    function confirmAction(
        title,
        message,
        callback
    ) {

        STATE.pendingConfirmation =
            callback;

        if (DOM.confirmationTitle) {

            DOM.confirmationTitle.textContent =
                title;
        }

        if (DOM.confirmationMessage) {

            DOM.confirmationMessage.textContent =
                message;
        }

        openModal(
            DOM.confirmationModal
        );
    }


    function executeConfirmation() {

        const callback =
            STATE.pendingConfirmation;

        STATE.pendingConfirmation =
            null;

        closeModal(
            DOM.confirmationModal
        );

        if (
            typeof callback ===
            "function"
        ) {
            callback();
        }
    }


    /* ============================================================
       29 — INFORMATIONS OBJET
    ============================================================ */

    function openObjectInfo() {

        const object =
            STATE.selectedObject;

        if (!object) {
            return;
        }

        if (DOM.objectInfoTitle) {

            DOM.objectInfoTitle.textContent =
                object.name;
        }

        if (DOM.objectInfoSubtitle) {

            DOM.objectInfoSubtitle.textContent =
                "Informations scientifiques";
        }

        if (DOM.infoObjectType) {

            DOM.infoObjectType.textContent =
                object.type;
        }

        if (DOM.infoObjectMaterial) {

            DOM.infoObjectMaterial.textContent =
                object.material;
        }

        if (DOM.infoObjectIndex) {

            DOM.infoObjectIndex.textContent =
                Number.isFinite(
                    object.refractiveIndex
                )
                    ? formatNumber(
                        object.refractiveIndex,
                        3
                    )
                    : "—";
        }

        if (DOM.infoObjectFocal) {

            DOM.infoObjectFocal.textContent =
                Number.isFinite(
                    object.focalLength
                )
                    ? formatNumber(
                        object.focalLength,
                        2
                    ) +
                    " cm"
                    : "—";
        }

        openModal(
            DOM.objectInfoModal
        );
    }


    /* ============================================================
       30 — NOTIFICATIONS
    ============================================================ */

    function notify(
        message,
        type
    ) {

        if (!DOM.notificationContainer) {
            return;
        }

        const notification =
            document.createElement("div");

        notification.className =
            "fobas-notification " +
            (
                type ||
                "info"
            );

        notification.textContent =
            message;

        DOM.notificationContainer.appendChild(
            notification
        );

        requestAnimationFrame(
            function () {

                notification.classList.add(
                    "show"
                );

            }
        );

        setTimeout(
            function () {

                notification.classList.remove(
                    "show"
                );

                setTimeout(
                    function () {

                        if (
                            notification.parentNode
                        ) {

                            notification.parentNode.removeChild(
                                notification
                            );
                        }

                    },
                    350
                );

            },
            3200
        );
    }


    /* ============================================================
       31 — PANNEAUX
    ============================================================ */

    function toggleLeftPanel() {

        if (!DOM.leftPanel) {
            return;
        }

        DOM.leftPanel.classList.toggle(
            "collapsed"
        );
    }


    function toggleRightPanel() {

        if (!DOM.rightPanel) {
            return;
        }

        DOM.rightPanel.classList.toggle(
            "collapsed"
        );
    }


    function toggleResults() {

        if (!DOM.resultsPanel) {
            return;
        }

        DOM.resultsPanel.classList.toggle(
            "collapsed"
        );
    }


    /* ============================================================
       32 — RÉSULTATS EXPORT
    ============================================================ */

    function exportResults() {

        const payload = {

            application:
                CONFIG.appName,

            version:
                CONFIG.appVersion,

            exportedAt:
                new Date().toISOString(),

            experiment:
                STATE.experiment,

            results:
                STATE.results,

            measurements:
                STATE.measurements

        };

        const blob =
            new Blob(
                [
                    JSON.stringify(
                        payload,
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

        const anchor =
            document.createElement("a");

        anchor.href =
            url;

        anchor.download =
            "fobas-optique-resultats.json";

        document.body.appendChild(
            anchor
        );

        anchor.click();

        anchor.remove();

        setTimeout(
            function () {
                URL.revokeObjectURL(url);
            },
            1000
        );

        notify(
            "Résultats exportés.",
            "success"
        );
    }


    /* ============================================================
       33 — ÉVÉNEMENTS
    ============================================================ */

    function bindEvents() {

        DOM.categoryButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        DOM.categoryButtons.forEach(
                            function (item) {
                                item.classList.remove(
                                    "active"
                                );
                            }
                        );

                        button.classList.add(
                            "active"
                        );

                        STATE.category =
                            button.dataset.category;

                        STATE.selectedLibraryType =
                            null;

                        renderLibrary();
                    }
                );
            }
        );


        DOM.toolButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        setInteractionMode(
                            button.dataset.tool
                        );
                    }
                );
            }
        );


        if (DOM.componentSearch) {

            DOM.componentSearch.addEventListener(
                "input",
                renderLibrary
            );
        }


        if (
            DOM.btnClearComponentSearch
        ) {

            DOM.btnClearComponentSearch.addEventListener(
                "click",
                function () {

                    DOM.componentSearch.value =
                        "";

                    renderLibrary();

                    DOM.componentSearch.focus();
                }
            );
        }


        if (
            DOM.btnAddSelectedComponent
        ) {

            DOM.btnAddSelectedComponent.addEventListener(
                "click",
                addSelectedComponent
            );
        }


        if (
            DOM.btnRemoveSelectedComponent
        ) {

            DOM.btnRemoveSelectedComponent.addEventListener(
                "click",
                removeSelectedComponent
            );
        }


        if (DOM.btnDuplicateObject) {

            DOM.btnDuplicateObject.addEventListener(
                "click",
                duplicateSelectedObject
            );
        }


        if (DOM.btnDeleteObject) {

            DOM.btnDeleteObject.addEventListener(
                "click",
                removeSelectedComponent
            );
        }


        [
            DOM.objectPositionX,
            DOM.objectPositionY,
            DOM.objectPositionZ,
            DOM.objectRotationX,
            DOM.objectRotationY,
            DOM.objectRotationZ
        ].forEach(
            function (input) {

                if (!input) {
                    return;
                }

                input.addEventListener(
                    "change",
                    updateSelectedObjectFromInputs
                );

                input.addEventListener(
                    "keydown",
                    function (event) {

                        if (
                            event.key ===
                            "Enter"
                        ) {

                            updateSelectedObjectFromInputs();
                        }
                    }
                );
            }
        );


        if (
            DOM.btnApplyOpticalProperties
        ) {

            DOM.btnApplyOpticalProperties.addEventListener(
                "click",
                applyOpticalProperties
            );
        }


        if (DOM.intensityInput) {

            DOM.intensityInput.addEventListener(
                "input",
                function () {

                    if (DOM.intensityValue) {

                        DOM.intensityValue.textContent =
                            DOM.intensityInput.value;
                    }
                }
            );
        }


        if (DOM.showRaysToggle) {

            DOM.showRaysToggle.addEventListener(
                "change",
                function () {

                    STATE.optical.showRays =
                        DOM.showRaysToggle.checked;

                    updateRayStatus();

                    STATE.dirty = true;
                }
            );
        }


        if (
            DOM.showSecondaryRaysToggle
        ) {

            DOM.showSecondaryRaysToggle.addEventListener(
                "change",
                function () {

                    STATE.optical.showSecondaryRays =
                        DOM.showSecondaryRaysToggle.checked;

                    STATE.dirty = true;
                }
            );
        }


        if (
            DOM.showFocalPointsToggle
        ) {

            DOM.showFocalPointsToggle.addEventListener(
                "change",
                function () {

                    STATE.optical.showFocalPoints =
                        DOM.showFocalPointsToggle.checked;

                    STATE.dirty = true;
                }
            );
        }


        if (DOM.btnTraceRays) {

            DOM.btnTraceRays.addEventListener(
                "click",
                traceRays
            );
        }


        if (
            DOM.btnClearMeasurements
        ) {

            DOM.btnClearMeasurements.addEventListener(
                "click",
                function () {

                    STATE.measurements = [];

                    DOM.measurementDistance.textContent =
                        "—";

                    DOM.measurementAngle.textContent =
                        "—";

                    DOM.measurementFocal.textContent =
                        "—";

                    DOM.measurementMagnification.textContent =
                        "—";

                    notify(
                        "Mesures effacées.",
                        "success"
                    );
                }
            );
        }


        if (DOM.btnLoadExperiment) {

            DOM.btnLoadExperiment.addEventListener(
                "click",
                function () {

                    loadExperiment(
                        DOM.experimentSelector.value
                    );
                }
            );
        }


        if (DOM.btnNewExperiment) {

            DOM.btnNewExperiment.addEventListener(
                "click",
                newExperiment
            );
        }


        if (DOM.btnSaveExperiment) {

            DOM.btnSaveExperiment.addEventListener(
                "click",
                saveExperiment
            );
        }


        if (DOM.btnResetExperiment) {

            DOM.btnResetExperiment.addEventListener(
                "click",
                resetExperiment
            );
        }


        if (
            DOM.btnToggleLeftPanel
        ) {

            DOM.btnToggleLeftPanel.addEventListener(
                "click",
                toggleLeftPanel
            );
        }


        if (
            DOM.btnToggleRightPanel
        ) {

            DOM.btnToggleRightPanel.addEventListener(
                "click",
                toggleRightPanel
            );
        }


        if (DOM.btnCameraOrbit) {

            DOM.btnCameraOrbit.addEventListener(
                "click",
                function () {
                    setCameraMode("orbit");
                }
            );
        }


        if (DOM.btnCameraPan) {

            DOM.btnCameraPan.addEventListener(
                "click",
                function () {
                    setCameraMode("pan");
                }
            );
        }


        if (DOM.btnCameraZoomIn) {

            DOM.btnCameraZoomIn.addEventListener(
                "click",
                function () {
                    cameraZoom(0.82);
                }
            );
        }


        if (DOM.btnCameraZoomOut) {

            DOM.btnCameraZoomOut.addEventListener(
                "click",
                function () {
                    cameraZoom(1.22);
                }
            );
        }


        if (DOM.btnCameraReset) {

            DOM.btnCameraReset.addEventListener(
                "click",
                resetCamera
            );
        }


        if (DOM.btnSceneHelp) {

            DOM.btnSceneHelp.addEventListener(
                "click",
                function () {
                    openModal(
                        DOM.helpModal
                    );
                }
            );
        }


        if (DOM.btnCloseHelpModal) {

            DOM.btnCloseHelpModal.addEventListener(
                "click",
                function () {
                    closeModal(
                        DOM.helpModal
                    );
                }
            );
        }


        if (
            DOM.btnCancelConfirmation
        ) {

            DOM.btnCancelConfirmation.addEventListener(
                "click",
                function () {

                    STATE.pendingConfirmation =
                        null;

                    closeModal(
                        DOM.confirmationModal
                    );
                }
            );
        }


        if (
            DOM.btnConfirmConfirmation
        ) {

            DOM.btnConfirmConfirmation.addEventListener(
                "click",
                executeConfirmation
            );
        }


        if (
            DOM.btnCloseObjectInfo
        ) {

            DOM.btnCloseObjectInfo.addEventListener(
                "click",
                function () {

                    closeModal(
                        DOM.objectInfoModal
                    );
                }
            );
        }


        if (
            DOM.btnClearResults
        ) {

            DOM.btnClearResults.addEventListener(
                "click",
                function () {

                    STATE.results = [];

                    updateResults();

                    notify(
                        "Résultats effacés.",
                        "success"
                    );
                }
            );
        }


        if (
            DOM.btnExportResults
        ) {

            DOM.btnExportResults.addEventListener(
                "click",
                exportResults
            );
        }


        if (
            DOM.btnToggleResults
        ) {

            DOM.btnToggleResults.addEventListener(
                "click",
                toggleResults
            );
        }


        if (
            DOM.experimentFileInput
        ) {

            DOM.experimentFileInput.addEventListener(
                "change",
                function () {

                    const file =
                        DOM.experimentFileInput.files &&
                        DOM.experimentFileInput.files[0];

                    if (file) {
                        importExperiment(file);
                    }

                    DOM.experimentFileInput.value =
                        "";
                }
            );
        }


        DOM.canvas.addEventListener(
            "pointerdown",
            handleCanvasPointerDown
        );

        DOM.canvas.addEventListener(
            "pointermove",
            handleCanvasPointerMove
        );

        DOM.canvas.addEventListener(
            "pointerup",
            handleCanvasPointerUp
        );

        DOM.canvas.addEventListener(
            "pointercancel",
            handleCanvasPointerUp
        );


        DOM.canvas.addEventListener(
            "wheel",
            function (event) {

                event.preventDefault();

                cameraZoom(
                    event.deltaY > 0
                        ? 1.08
                        : 0.92
                );

            },
            {
                passive: false
            }
        );


        DOM.canvas.addEventListener(
            "dblclick",
            function (event) {

                const point =
                    getCanvasPoint(event);

                const object =
                    objectAtScreenPosition(
                        point.x,
                        point.y
                    );

                if (object) {

                    selectObject(object);

                    openObjectInfo();
                }
            }
        );


        DOM.canvas.addEventListener(
            "contextmenu",
            function (event) {
                event.preventDefault();
            }
        );


        document.addEventListener(
            "keydown",
            handleKeyboard
        );


        document.addEventListener(
            "click",
            function (event) {

                if (
                    event.target.classList &&
                    event.target.classList.contains(
                        "modal-overlay"
                    )
                ) {

                    closeModal(
                        event.target
                    );
                }
            }
        );


        window.addEventListener(
            "resize",
            function () {

                resizeCanvas();

            }
        );


        if (DOM.btnRetry3D) {

            DOM.btnRetry3D.addEventListener(
                "click",
                function () {

                    hideRenderError();

                    initializeRendering();

                }
            );
        }
    }


    /* ============================================================
       34 — CLAVIER
    ============================================================ */

    function handleKeyboard(event) {

        if (
            event.key === "Escape"
        ) {

            STATE.pointer.dragging =
                false;

            STATE.measureStart =
                null;

            STATE.connectStart =
                null;

            closeModal(
                DOM.helpModal
            );

            closeModal(
                DOM.confirmationModal
            );

            closeModal(
                DOM.objectInfoModal
            );

            setInteractionMode(
                "select"
            );

            return;
        }

        if (
            event.target &&
            (
                event.target.tagName ===
                "INPUT" ||
                event.target.tagName ===
                "TEXTAREA" ||
                event.target.tagName ===
                "SELECT"
            )
        ) {
            return;
        }

        if (
            event.key === "Delete" &&
            STATE.selectedObject
        ) {

            removeSelectedComponent();

            return;
        }

        if (
            event.key.toLowerCase() === "r"
        ) {

            setInteractionMode(
                "rotate"
            );

            return;
        }

        if (
            event.key.toLowerCase() === "m"
        ) {

            setInteractionMode(
                "move"
            );

            return;
        }

        if (
            event.key.toLowerCase() === "s"
        ) {

            setInteractionMode(
                "select"
            );

            return;
        }

        if (
            event.key.toLowerCase() === "t"
        ) {

            traceRays();

            return;
        }
    }


    /* ============================================================
       35 — INITIALISATION GRAPHIQUE
    ============================================================ */

    function initializeRendering() {

        try {

            hideRenderError();

            resizeCanvas();

            setLoading(
                15,
                "Initialisation du canvas..."
            );

            setTimeout(
                function () {

                    setLoading(
                        35,
                        "Construction du laboratoire..."
                    );

                    setTimeout(
                        function () {

                            setLoading(
                                60,
                                "Initialisation de la physique..."
                            );

                            setTimeout(
                                function () {

                                    setLoading(
                                        82,
                                        "Préparation des composants..."
                                    );

                                    setTimeout(
                                        function () {

                                            setLoading(
                                                100,
                                                "Laboratoire prêt."
                                            );

                                            setTimeout(
                                                function () {

                                                    hideLoading();

                                                    STATE.initialized =
                                                        true;

                                                    STATE.running =
                                                        true;

                                                    setEngineStatus(
                                                        true
                                                    );

                                                    renderScene();

                                                },
                                                250
                                            );

                                        },
                                        100
                                    );

                                },
                                100
                            );

                        },
                        100
                    );

                },
                100
            );

        } catch (error) {

            showRenderError(
                error
            );
        }
    }


    function setLoading(
        percent,
        message
    ) {

        if (
            DOM.loadingProgressBar
        ) {

            DOM.loadingProgressBar.style.width =
                clamp(
                    percent,
                    0,
                    100
                ) +
                "%";
        }

        if (
            DOM.loadingProgressText
        ) {

            DOM.loadingProgressText.textContent =
                message;
        }
    }


    function hideLoading() {

        if (
            DOM.loadingOverlay
        ) {

            DOM.loadingOverlay.classList.add(
                "hidden"
            );
        }
    }


    function showRenderError(
        error
    ) {

        STATE.running = false;

        STATE.renderError =
            error;

        if (
            DOM.renderErrorOverlay
        ) {

            DOM.renderErrorOverlay.classList.remove(
                "hidden"
            );
        }

        if (
            DOM.renderErrorMessage
        ) {

            DOM.renderErrorMessage.textContent =
                error &&
                error.message
                    ? error.message
                    : "Impossible d'initialiser le moteur graphique.";
        }

        setEngineStatus(
            false
        );

        console.error(
            "FOBAS OPTIQUE :",
            error
        );
    }


    function hideRenderError() {

        if (
            DOM.renderErrorOverlay
        ) {

            DOM.renderErrorOverlay.classList.add(
                "hidden"
            );
        }
    }


    function setEngineStatus(
        active
    ) {

        if (
            DOM.engineStatusText
        ) {

            DOM.engineStatusText.textContent =
                active
                    ? "MOTEUR ACTIF"
                    : "ERREUR MOTEUR";
        }

        if (
            DOM.engineStatusIndicator
        ) {

            DOM.engineStatusIndicator.style.opacity =
                active
                    ? "1"
                    : "0.35";
        }
    }


    /* ============================================================
       36 — BOUCLE D'ANIMATION
    ============================================================ */

    function animationLoop(now) {

        requestAnimationFrame(
            animationLoop
        );

        const delta =
            now -
            STATE.lastFrameTime;

        STATE.lastFrameTime =
            now;

        STATE.rayAnimation++;

        STATE.frames++;

        if (
            now -
            STATE.fpsTimer >=
            1000
        ) {

            STATE.fps =
                STATE.frames *
                1000 /
                (
                    now -
                    STATE.fpsTimer
                );

            STATE.frames = 0;

            STATE.fpsTimer =
                now;

            updateStatusBar();
        }

        if (
            STATE.running
        ) {

            renderScene();
        }

        void delta;
    }


    /* ============================================================
       37 — CONFIGURATION UI INITIALE
    ============================================================ */

    function synchronizeUI() {

        if (DOM.wavelengthInput) {

            DOM.wavelengthInput.value =
                STATE.optical.wavelength;
        }

        if (DOM.intensityInput) {

            DOM.intensityInput.value =
                STATE.optical.intensity;
        }

        if (DOM.intensityValue) {

            DOM.intensityValue.textContent =
                STATE.optical.intensity;
        }

        if (
            DOM.refractiveIndexInput
        ) {

            DOM.refractiveIndexInput.value =
                STATE.optical.refractiveIndex.toFixed(
                    3
                );
        }

        if (DOM.showRaysToggle) {

            DOM.showRaysToggle.checked =
                STATE.optical.showRays;
        }

        if (
            DOM.showSecondaryRaysToggle
        ) {

            DOM.showSecondaryRaysToggle.checked =
                STATE.optical.showSecondaryRays;
        }

        if (
            DOM.showFocalPointsToggle
        ) {

            DOM.showFocalPointsToggle.checked =
                STATE.optical.showFocalPoints;
        }

        updateRayStatus();

        updateStatusBar();

        updateResults();
    }


    /* ============================================================
       38 — API PUBLIQUE FOBAS
    ============================================================ */

    window.FOBAS_OPTICS_ENGINE = {

        state: STATE,

        library: LIBRARY,

        traceRays: traceRays,

        addComponent:
            function (type) {

                STATE.selectedLibraryType =
                    type;

                addSelectedComponent();

            },

        selectObject:
            selectObject,

        deleteObject:
            deleteObject,

        reset:
            resetExperiment,

        save:
            saveExperiment,

        loadExperiment:
            loadExperiment,

        exportResults:
            exportResults,

        calculateLensImage:
            calculateLensImage,

        reflect:
            reflect,

        refract:
            refract

    };


    /* ============================================================
       39 — DÉMARRAGE
    ============================================================ */

    function boot() {

        try {

            cacheDOM();

            bindEvents();

            synchronizeUI();

            renderLibrary();

            const restored =
                loadSavedState();

            if (!restored) {
                addDefaultLaboratory();
            }

            resizeCanvas();

            setEngineStatus(
                false
            );

            setLoading(
                5,
                "Démarrage de FOBAS OPTIQUE..."
            );

            initializeRendering();

            requestAnimationFrame(
                animationLoop
            );

        } catch (error) {

            console.error(
                "FOBAS OPTIQUE — erreur de démarrage :",
                error
            );

            if (
                DOM.renderErrorOverlay
            ) {

                showRenderError(
                    error
                );

            } else {

                document.body.innerHTML =
                    "<div style=\"" +
                    "font-family:Arial;" +
                    "padding:30px;" +
                    "background:#07111f;" +
                    "color:white;" +
                    "\">" +
                    "<h2>FOBAS OPTIQUE</h2>" +
                    "<p>Erreur d'initialisation.</p>" +
                    "<pre>" +
                    escapeHTML(
                        error.message ||
                        String(error)
                    ) +
                    "</pre>" +
                    "</div>";
            }
        }
    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            boot,
            {
                once: true
            }
        );

    } else {

        boot();
    }


})();



















