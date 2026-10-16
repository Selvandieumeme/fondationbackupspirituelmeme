/* ============================================================
   FOBAS CINÉMA 3D
   DE KÈ, YON SÈL DESTIN
   JavaScript principal — Version 1.0.0

   Moteur : PlayCanvas 2.23.2
   Langue : Kreyòl ayisyen
   Durée : 20 minutes
   Nombre de scènes : 12

   Compatible avec :
   filmfobas.html
   filmfobas.css

   Aucun backend requis.
   Export vidéo selon les capacités du navigateur.
============================================================ */

(() => {
    "use strict";

    /* ========================================================
       1. PROTECTION CONTRE UNE DOUBLE INITIALISATION
    ======================================================== */

    if (window.__FOBAS_CINEMA_3D_INITIALIZED__) {
        return;
    }

    window.__FOBAS_CINEMA_3D_INITIALIZED__ = true;


    /* ========================================================
       2. CONFIGURATION GÉNÉRALE
    ======================================================== */

    const CONFIG = Object.freeze({
        title: "De Kè, Yon Sèl Destin",

        duration: 20 * 60,

        sceneCount: 12,

        engineVersion: "2.23.2",

        defaultSpeed: 1,

        dialogueInterval: 12,

        cameraSmoothing: 3.2,

        mobilePixelRatio: 1.5,

        desktopPixelRatio: 2,

        saveKey: "FOBAS_CINEMA_3D_SETTINGS",

        autoSave: true
    });


    /* ========================================================
       3. SÉLECTION DES ÉLÉMENTS HTML
    ======================================================== */

    const $ = (id) => document.getElementById(id);

    const el = {
        app: $("filmApp"),
        header: $("filmHeader"),
        main: $("filmMain"),

        stage: $("cinemaStage"),
        canvas: $("filmCanvas"),

        loading: $("loadingScreen"),
        loadingMessage: $("loadingMessage"),
        loadingProgress: $("loadingProgress"),
        loadingPercent: $("loadingPercent"),
        start: $("btnStartFilm"),

        error: $("errorScreen"),
        errorMessage: $("errorMessage"),
        retry: $("btnRetry"),

        sceneTitle: $("sceneTitle"),
        sceneNumber: $("sceneNumber"),
        sceneName: $("sceneName"),
        sceneLocation: $("sceneLocation"),

        dialogueBox: $("dialogueBox"),
        dialogueAvatar: $("dialogueAvatar"),
        dialogueSpeaker: $("dialogueSpeaker"),
        dialogueIndex: $("dialogueIndex"),
        dialogueText: $("dialogueText"),
        nextDialogue: $("btnNextDialogue"),

        playbackStatus: $("playbackStatus"),
        qualityIndicator: $("qualityIndicator"),
        renderIndicator: $("renderIndicator"),

        currentSceneLabel: $("currentSceneLabel"),
        currentLocationLabel: $("currentLocationLabel"),

        pauseOverlay: $("pauseOverlay"),
        resumeCenter: $("btnResumeCenter"),

        performanceNotice: $("performanceNotice"),

        timelinePanel: $("timelinePanel"),
        timelineTrack: $("timelineTrack"),
        timelineProgress: $("timelineProgress"),
        timelineMarkers: $("timelineMarkers"),
        timelineSceneCount: $("timelineSceneCount"),
        currentTime: $("currentTime"),
        totalTime: $("totalTime"),
        timelineStatus: $("timelineStatus"),
        timelineStart: $("timelineStart"),
        timelineEnd: $("timelineEnd"),

        previousScene: $("btnPreviousScene"),
        rewind: $("btnRewind"),
        playPause: $("btnPlayPause"),
        forward: $("btnForward"),
        nextScene: $("btnNextScene"),

        playbackSpeed: $("playbackSpeed"),
        captions: $("btnCaptions"),
        restart: $("btnRestart"),

        sceneList: $("sceneList"),
        sceneListCount: $("sceneListCount"),

        fullscreen: $("btnFullscreen"),
        settings: $("btnSettings"),

        settingsDialog: $("settingsDialog"),
        closeSettings: $("btnCloseSettings"),
        saveSettings: $("btnSaveSettings"),

        settingCaptions: $("settingCaptions"),
        settingCameraMotion: $("settingCameraMotion"),
        settingGraphics: $("settingGraphics"),
        settingMobile: $("settingMobile"),

        exportResolution: $("exportResolution"),
        exportFrameRate: $("exportFrameRate"),
        exportFormat: $("exportFormat"),

        exportButton: $("btnExportVideo"),
        cancelExport: $("btnCancelExport"),

        exportProgressPanel: $("exportProgressPanel"),
        exportStatus: $("exportStatus"),
        exportPercent: $("exportPercent"),
        exportProgressBar: $("exportProgressBar"),
        exportDetails: $("exportDetails"),

        exportResult: $("exportResult"),
        exportResultTitle: $("exportResultTitle"),
        exportResultMessage: $("exportResultMessage"),
        downloadVideo: $("btnDownloadVideo"),

        toast: $("filmToast")
    };


    /* ========================================================
       4. VALIDATION DES ÉLÉMENTS OBLIGATOIRES
    ======================================================== */

    const requiredElements = [
        "stage",
        "canvas",
        "loading",
        "loadingMessage",
        "loadingProgress",
        "loadingPercent",
        "start",
        "error",
        "errorMessage",
        "retry",
        "playPause",
        "timelineTrack",
        "timelineProgress",
        "sceneList",
        "exportButton"
    ];

    const missingElements = requiredElements.filter(
        (key) => !el[key]
    );

    if (missingElements.length > 0) {
        console.error(
            "[FOBAS CINÉMA 3D] Éléments HTML manquants :",
            missingElements
        );

        window.__FOBAS_CINEMA_3D_INITIALIZED__ = false;

        return;
    }


    /* ========================================================
       5. DONNÉES DES 12 SCÈNES
    ======================================================== */

    const SCENES = [
        {
            name: "Yon rankont inatandi",
            location: "Yon bèl plas piblik",
            environment: "park",
            color: [0.16, 0.35, 0.29],
            sky: [0.18, 0.29, 0.43],
            camera: "wide",
            dialogue: [
                {
                    speaker: "NARATÈ",
                    avatar: "♥",
                    text:
                        "Gen kèk rankont nan lavi ki parèt senp, " +
                        "men ki kapab chanje tout avni nou."
                },
                {
                    speaker: "MIKAËL",
                    avatar: "M",
                    text:
                        "Eskize m. Mwen pa t wè w t ap pase. " +
                        "Mwen espere mwen pa fè w mal."
                },
                {
                    speaker: "NADIA",
                    avatar: "N",
                    text:
                        "Non, pa gen pwoblèm. Pafwa se konsa " +
                        "bèl istwa yo kòmanse."
                }
            ]
        },

        {
            name: "Yon souri ki rete nan memwa",
            location: "Sou yon ti chemen nan pak la",
            environment: "park",
            color: [0.18, 0.38, 0.30],
            sky: [0.24, 0.35, 0.47],
            camera: "medium",
            dialogue: [
                {
                    speaker: "MIKAËL",
                    avatar: "M",
                    text:
                        "Mwen rele Mikaël. Mwen pa konn poukisa, " +
                        "men souri w fè jounen m vin pi bèl."
                },
                {
                    speaker: "NADIA",
                    avatar: "N",
                    text:
                        "Mwen rele Nadia. Ou toujou konn pale konsa " +
                        "ak moun ou fèk rankontre?"
                },
                {
                    speaker: "MIKAËL",
                    avatar: "M",
                    text:
                        "Non. Se premye fwa mwen santi pawòl yo " +
                        "soti nan kè m konsa."
                }
            ]
        },

        {
            name: "Premye konvèsasyon",
            location: "Sou yon ban nan jaden an",
            environment: "garden",
            color: [0.13, 0.31, 0.23],
            sky: [0.29, 0.36, 0.48],
            camera: "two-shot",
            dialogue: [
                {
                    speaker: "NADIA",
                    avatar: "N",
                    text:
                        "Mwen renmen moun ki pa pè montre " +
                        "ki moun yo ye toutbon."
                },
                {
                    speaker: "MIKAËL",
                    avatar: "M",
                    text:
                        "Mwen kwè respè ak onètete pi enpòtan " +
                        "pase tout bèl pawòl."
                },
                {
                    speaker: "NADIA",
                    avatar: "N",
                    text:
                        "Petèt nou gen plis bagay an komen " +
                        "pase sa nou te panse."
                }
            ]
        },

        {
            name: "Yon ti mache ansanm",
            location: "Yon chemen anba pye bwa",
            environment: "forest",
            color: [0.10, 0.26, 0.20],
            sky: [0.24, 0.34, 0.43],
            camera: "tracking",
            dialogue: [
                {
                    speaker: "MIKAËL",
                    avatar: "M",
                    text:
                        "Mwen pa sonje dènye fwa mwen te mache " +
                        "ak yon moun epi mwen te santi m alèz konsa."
                },
                {
                    speaker: "NADIA",
                    avatar: "N",
                    text:
                        "Petèt se paske nou pa bezwen pretann " +
                        "nou se lòt moun."
                },
                {
                    speaker: "NARATÈ",
                    avatar: "♥",
                    text:
                        "Pandan yo t ap mache, konfyans te kòmanse " +
                        "grandi ant de kè sa yo."
                }
            ]
        },

        {
            name: "Kè ki kòmanse pale",
            location: "Yon ti plas ki gen flè",
            environment: "flowers",
            color: [0.28, 0.32, 0.25],
            sky: [0.43, 0.35, 0.42],
            camera: "medium",
            dialogue: [
                {
                    speaker: "NADIA",
                    avatar: "N",
                    text:
                        "Mwen pa fasil fè konfyans. Lavi aprann " +
                        "mwen pou m pran tan m."
                },
                {
                    speaker: "MIKAËL",
                    avatar: "M",
                    text:
                        "Mwen pa mande w prese. Mwen pito nou " +
                        "konstwi yon bagay ki solid."
                },
                {
                    speaker: "NADIA",
                    avatar: "N",
                    text:
                        "Mwen apresye sa. Sa fè m santi mwen " +
                        "kapab pale avè w san mwen pa pè."
                }
            ]
        },

        {
            name: "Yon verite ki soti nan kè",
            location: "Yon ti pon an bwa",
            environment: "bridge",
            color: [0.24, 0.28, 0.24],
            sky: [0.46, 0.33, 0.34],
            camera: "wide",
            dialogue: [
                {
                    speaker: "MIKAËL",
                    avatar: "M",
                    text:
                        "Nadia, mwen vle ou konnen mwen pa la " +
                        "pou jwe ak santiman w."
                },
                {
                    speaker: "NADIA",
                    avatar: "N",
                    text:
                        "Mwen te bezwen tande sa. Mwen bezwen " +
                        "yon moun ki konprann valè pawòl li."
                },
                {
                    speaker: "MIKAËL",
                    avatar: "M",
                    text:
                        "Mwen pa ka pwomèt lavi ap toujou fasil, " +
                        "men mwen ka pwomèt mwen ap respekte w."
                }
            ]
        },

        {
            name: "Yon ti kafe, de souri",
            location: "Yon ti kafe ki cho",
            environment: "cafe",
            color: [0.34, 0.24, 0.18],
            sky: [0.20, 0.22, 0.31],
            camera: "interior",
            dialogue: [
                {
                    speaker: "NADIA",
                    avatar: "N",
                    text:
                        "Mwen pa t janm imajine yon ti kafe " +
                        "t ap fè m pase yon jounen konsa."
                },
                {
                    speaker: "MIKAËL",
                    avatar: "M",
                    text:
                        "Se pa kafe a ki espesyal. Se moun " +
                        "mwen chita avè l la."
                },
                {
                    speaker: "NADIA",
                    avatar: "N",
                    text:
                        "Ou fè m ri twòp, Mikaël!"
                }
            ]
        },

        {
            name: "Yon moman ki vin espesyal",
            location: "Sou teras la pandan solèy kouche",
            environment: "sunset",
            color: [0.40, 0.25, 0.19],
            sky: [0.58, 0.30, 0.22],
            camera: "romantic",
            dialogue: [
                {
                    speaker: "MIKAËL",
                    avatar: "M",
                    text:
                        "Gen yon bagay mwen ta renmen di w " +
                        "depi premye jou nou te rankontre a."
                },
                {
                    speaker: "NADIA",
                    avatar: "N",
                    text:
                        "M ap koute w. Ou pa bezwen pè pale."
                },
                {
                    speaker: "MIKAËL",
                    avatar: "M",
                    text:
                        "Mwen kòmanse wè lavi m yon lòt jan " +
                        "depi ou antre ladan l."
                }
            ]
        },

        {
            name: "Lè dout antre nan istwa a",
            location: "Sou yon wout trankil",
            environment: "road",
            color: [0.19, 0.22, 0.28],
            sky: [0.15, 0.19, 0.30],
            camera: "dramatic",
            dialogue: [
                {
                    speaker: "NADIA",
                    avatar: "N",
                    text:
                        "Mwen pè pou m pa soufri ankò. " +
                        "Pafwa sa fè m vle fè bak."
                },
                {
                    speaker: "MIKAËL",
                    avatar: "M",
                    text:
                        "Mwen konprann laperèz ou. Mwen pa vle " +
                        "fòse w pran okenn desizyon."
                },
                {
                    speaker: "NARATÈ",
                    avatar: "♥",
                    text:
                        "Lanmou pa retire tout dout. Pafwa li " +
                        "aprann nou travèse yo ansanm."
                }
            ]
        },

        {
            name: "Chwazi fè konfyans",
            location: "Yon jaden anba limyè lalin",
            environment: "moonGarden",
            color: [0.08, 0.16, 0.25],
            sky: [0.05, 0.09, 0.19],
            camera: "romantic",
            dialogue: [
                {
                    speaker: "NADIA",
                    avatar: "N",
                    text:
                        "Mwen pa konnen tout sa demen ap pote, " +
                        "men mwen vle ba nou yon chans."
                },
                {
                    speaker: "MIKAËL",
                    avatar: "M",
                    text:
                        "Nou pral aprann youn nan men lòt, " +
                        "san nou pa bliye kiyès nou ye."
                },
                {
                    speaker: "NADIA",
                    avatar: "N",
                    text:
                        "Ann avanse ansanm, yon pa apre lòt."
                }
            ]
        },

        {
            name: "Pwomès de kè",
            location: "Yon bèl jaden ak limyè dous",
            environment: "ceremony",
            color: [0.22, 0.24, 0.20],
            sky: [0.26, 0.25, 0.37],
            camera: "ceremony",
            dialogue: [
                {
                    speaker: "MIKAËL",
                    avatar: "M",
                    text:
                        "Mwen pwomèt m ap toujou chèche konprann ou, " +
                        "menm lè nou pa dakò."
                },
                {
                    speaker: "NADIA",
                    avatar: "N",
                    text:
                        "Mwen pwomèt m ap pale ak ou ak respè, " +
                        "m ap aprann epi m ap grandi avè w."
                },
                {
                    speaker: "NARATÈ",
                    avatar: "♥",
                    text:
                        "Se pa pèfeksyon ki fè yon relasyon solid, " +
                        "se lanmou, respè ak efò chak jou."
                }
            ]
        },

        {
            name: "De kè, yon sèl destin",
            location: "Yon bèl chemen nan limyè dou",
            environment: "final",
            color: [0.25, 0.31, 0.28],
            sky: [0.39, 0.35, 0.47],
            camera: "final",
            dialogue: [
                {
                    speaker: "NADIA",
                    avatar: "N",
                    text:
                        "Mikaël, mwen kontan nou te pran tan " +
                        "pou nou aprann konnen youn lòt."
                },
                {
                    speaker: "MIKAËL",
                    avatar: "M",
                    text:
                        "Mwen menm tou. Sa ki pi enpòtan an, " +
                        "se jan nou chwazi trete youn lòt."
                },
                {
                    speaker: "NARATÈ",
                    avatar: "♥",
                    text:
                        "De kè, yon sèl destin. Yon istwa lanmou " +
                        "ki kontinye ekri ak chak nouvo jounen."
                }
            ]
        }
    ];


    /* ========================================================
       6. ÉTAT CENTRAL DE L'APPLICATION
    ======================================================== */

    const state = {
        app: null,

        ready: false,

        started: false,

        playing: false,

        destroyed: false,

        exporting: false,

        exportCancelled: false,

        exportRecorder: null,

        exportChunks: [],

        exportStream: null,

        exportTimer: null,

        exportStartedAt: 0,

        exportStartFilmTime: 0,

        exportDuration: 0,

        exportBlobUrl: null,

        currentTime: 0,

        sceneIndex: 0,

        dialogueIndex: 0,

        playbackSpeed: CONFIG.defaultSpeed,

        captionsEnabled: true,

        cameraMotion: true,

        mobileControls: true,

        graphics: "high",

        camera: null,

        cameraTarget: null,

        characters: {},

        environmentEntities: [],

        materials: {},

        sceneEntities: [],

        animationTime: 0,

        lastFrameTime: 0,

        lastDialogueKey: "",

        toastTimer: null,

        noticeTimer: null,

        frameCount: 0,

        fpsAccumulator: 0,

        displayedFPS: 60,

        resizeObserver: null,

        pointerDown: false,

        pointerStartX: 0,

        pointerStartY: 0,

        listeners: [],

        saveTimer: null
    };


    /* ========================================================
       7. OUTILS GÉNÉRAUX
    ======================================================== */

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }


    function isMobileDevice() {
        return (
            window.matchMedia("(max-width: 760px)").matches ||
            /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        );
    }


    function formatTime(seconds) {
        const value = Math.max(0, Math.floor(seconds));

        const minutes = Math.floor(value / 60);

        const remainingSeconds = value % 60;

        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(remainingSeconds).padStart(2, "0")
        );
    }


    function setHidden(element, hidden) {
        if (!element) return;

        element.hidden = Boolean(hidden);
    }


    function setText(element, value) {
        if (!element) return;

        element.textContent = String(value);
    }


    function listen(element, eventName, callback, options) {
        if (!element) return;

        element.addEventListener(
            eventName,
            callback,
            options || false
        );

        state.listeners.push({
            element,
            eventName,
            callback,
            options: options || false
        });
    }


    function removeAllListeners() {
        for (const item of state.listeners) {
            item.element.removeEventListener(
                item.eventName,
                item.callback,
                item.options
            );
        }

        state.listeners.length = 0;
    }


    function showToast(message, duration = 2800) {
        if (!el.toast) {
            console.info("[FOBAS CINÉMA]", message);
            return;
        }

        setText(el.toast, message);

        setHidden(el.toast, false);

        clearTimeout(state.toastTimer);

        state.toastTimer = setTimeout(() => {
            setHidden(el.toast, true);
        }, duration);
    }


    function showPerformanceNotice(message, duration = 5000) {
        if (!el.performanceNotice) return;

        setText(el.performanceNotice, message);

        setHidden(el.performanceNotice, false);

        clearTimeout(state.noticeTimer);

        state.noticeTimer = setTimeout(() => {
            setHidden(el.performanceNotice, true);
        }, duration);
    }


    function setLoadingProgress(percent, message) {
        const value = clamp(Math.round(percent), 0, 100);

        if (el.loadingProgress) {
            el.loadingProgress.style.width = value + "%";
        }

        setText(el.loadingPercent, value + "%");

        if (message) {
            setText(el.loadingMessage, message);
        }
    }


    function getCurrentScene() {
        return SCENES[state.sceneIndex] || SCENES[0];
    }


    function getSceneDuration() {
        return CONFIG.duration / SCENES.length;
    }


    function getSceneAtTime(time) {
        const duration = getSceneDuration();

        return clamp(
            Math.floor(Math.max(0, time) / duration),
            0,
            SCENES.length - 1
        );
    }


    function safeCall(callback, fallback = null) {
        try {
            return callback();
        } catch (error) {
            console.warn("[FOBAS CINÉMA]", error);

            return fallback;
        }
    }


    /* ========================================================
       8. SAUVEGARDE DES PARAMÈTRES
    ======================================================== */

    function loadSettings() {
        try {
            const raw = localStorage.getItem(CONFIG.saveKey);

            if (!raw) return;

            const settings = JSON.parse(raw);

            if (typeof settings.captions === "boolean") {
                state.captionsEnabled = settings.captions;
            }

            if (typeof settings.cameraMotion === "boolean") {
                state.cameraMotion = settings.cameraMotion;
            }

            if (typeof settings.mobileControls === "boolean") {
                state.mobileControls = settings.mobileControls;
            }

            if (
                ["high", "medium", "low"].includes(
                    settings.graphics
                )
            ) {
                state.graphics = settings.graphics;
            }

            if (el.settingCaptions) {
                el.settingCaptions.checked =
                    state.captionsEnabled;
            }

            if (el.settingCameraMotion) {
                el.settingCameraMotion.checked =
                    state.cameraMotion;
            }

            if (el.settingMobile) {
                el.settingMobile.checked =
                    state.mobileControls;
            }

            if (el.settingGraphics) {
                el.settingGraphics.value = state.graphics;
            }

            applyCaptionVisibility();
        } catch (error) {
            console.warn(
                "[FOBAS CINÉMA] Paramètres locaux indisponibles.",
                error
            );
        }
    }


    function saveSettings() {
        const settings = {
            captions: state.captionsEnabled,

            cameraMotion: state.cameraMotion,

            mobileControls: state.mobileControls,

            graphics: state.graphics
        };

        try {
            localStorage.setItem(
                CONFIG.saveKey,
                JSON.stringify(settings)
            );
        } catch (error) {
            console.warn(
                "[FOBAS CINÉMA] Impossible de sauvegarder les paramètres.",
                error
            );
        }
    }


    /* ========================================================
       9. MATÉRIAUX PLAYCANVAS
    ======================================================== */

    function createMaterial(
        name,
        diffuse,
        options = {}
    ) {
        const material = new pc.StandardMaterial();

        material.name = name;

        material.diffuse = new pc.Color(
            diffuse[0],
            diffuse[1],
            diffuse[2]
        );

        if (options.emissive) {
            material.emissive = new pc.Color(
                options.emissive[0],
                options.emissive[1],
                options.emissive[2]
            );

            material.emissiveIntensity =
                options.emissiveIntensity || 1;
        }

        if (options.metalness !== undefined) {
            material.metalness = options.metalness;
        }

        if (options.gloss !== undefined) {
            material.gloss = options.gloss;
        }

        material.update();

        state.materials[name] = material;

        return material;
    }


    function createAllMaterials() {
        createMaterial("grass", [0.12, 0.30, 0.18]);

        createMaterial("grassLight", [0.18, 0.38, 0.23]);

        createMaterial("ground", [0.39, 0.32, 0.25]);

        createMaterial("path", [0.58, 0.48, 0.36]);

        createMaterial("wood", [0.32, 0.20, 0.12]);

        createMaterial("woodLight", [0.49, 0.33, 0.20]);

        createMaterial("leaf", [0.10, 0.30, 0.14]);

        createMaterial("leafLight", [0.19, 0.40, 0.20]);

        createMaterial("trunk", [0.25, 0.15, 0.09]);

        createMaterial("stone", [0.36, 0.38, 0.41]);

        createMaterial("white", [0.88, 0.86, 0.78]);

        createMaterial("black", [0.045, 0.055, 0.075]);

        createMaterial("skinMikael", [0.48, 0.29, 0.18]);

        createMaterial("skinNadia", [0.57, 0.34, 0.23]);

        createMaterial("hairMikael", [0.055, 0.045, 0.035]);

        createMaterial("hairNadia", [0.065, 0.035, 0.025]);

        createMaterial("shirtMikael", [0.13, 0.28, 0.62]);

        createMaterial("shirtNadia", [0.68, 0.16, 0.37]);

        createMaterial("pants", [0.10, 0.12, 0.18]);

        createMaterial("shoe", [0.055, 0.045, 0.04]);

        createMaterial("flowerRed", [0.86, 0.20, 0.30]);

        createMaterial("flowerPink", [0.98, 0.48, 0.65]);

        createMaterial("flowerYellow", [0.95, 0.71, 0.19]);

        createMaterial("water", [0.07, 0.29, 0.40], {
            metalness: 0.1,
            gloss: 80
        });

        createMaterial("gold", [0.85, 0.62, 0.22], {
            metalness: 0.15,
            gloss: 75
        });

        createMaterial("coffee", [0.19, 0.10, 0.055]);

        createMaterial("glass", [0.24, 0.40, 0.49], {
            emissive: [0.04, 0.08, 0.12],
            emissiveIntensity: 0.25
        });
    }


    /* ========================================================
       10. CRÉATION DES ENTITÉS 3D
    ======================================================== */

    function createPrimitive(
        name,
        type,
        position,
        scale,
        material,
        parent = null
    ) {
        const entity = new pc.Entity(name);

        entity.addComponent("model", {
            type,
            material
        });

        entity.setLocalPosition(
            position[0],
            position[1],
            position[2]
        );

        entity.setLocalScale(
            scale[0],
            scale[1],
            scale[2]
        );

        if (parent) {
            parent.addChild(entity);
        } else {
            state.app.root.addChild(entity);
        }

        state.sceneEntities.push(entity);

        return entity;
    }


    function createBox(
        name,
        position,
        scale,
        material,
        parent = null
    ) {
        return createPrimitive(
            name,
            "box",
            position,
            scale,
            material,
            parent
        );
    }


    function createSphere(
        name,
        position,
        scale,
        material,
        parent = null
    ) {
        return createPrimitive(
            name,
            "sphere",
            position,
            scale,
            material,
            parent
        );
    }


    function createCylinder(
        name,
        position,
        scale,
        material,
        parent = null
    ) {
        return createPrimitive(
            name,
            "cylinder",
            position,
            scale,
            material,
            parent
        );
    }


    function createPlane(
        name,
        position,
        scale,
        material,
        parent = null
    ) {
        return createPrimitive(
            name,
            "plane",
            position,
            scale,
            material,
            parent
        );
    }


    /* ========================================================
       11. LUMIÈRES ET CAMÉRA
    ======================================================== */

    function createLighting() {
        const ambient = new pc.Entity("FOBAS_Ambient_Light");

        ambient.addComponent("light", {
            type: "directional",

            color: new pc.Color(1, 0.91, 0.79),

            intensity: 1.15,

            castShadows: true,

            shadowResolution: 1024
        });

        ambient.setEulerAngles(45, 30, 0);

        state.app.root.addChild(ambient);

        state.sceneEntities.push(ambient);


        const fill = new pc.Entity("FOBAS_Fill_Light");

        fill.addComponent("light", {
            type: "omni",

            color: new pc.Color(0.57, 0.68, 1),

            intensity: 0.45,

            range: 30
        });

        fill.setPosition(-5, 6, 5);

        state.app.root.addChild(fill);

        state.sceneEntities.push(fill);
    }


    function createCamera() {
        const camera = new pc.Entity("FOBAS_Cinema_Camera");

        camera.addComponent("camera", {
            clearColor: new pc.Color(0.10, 0.13, 0.19),

            fov: 48,

            nearClip: 0.1,

            farClip: 300,

            frustumCulling: true
        });

        camera.setPosition(0, 4.0, 11);

        camera.lookAt(0, 1.6, 0);

        state.app.root.addChild(camera);

        state.sceneEntities.push(camera);

        state.camera = camera;

        state.cameraTarget = {
            position: new pc.Vec3(0, 4.0, 11),

            lookAt: new pc.Vec3(0, 1.6, 0)
        };
    }


    /* ========================================================
       12. CONSTRUCTION DU SOL
    ======================================================== */

    function createGround() {
        createPlane(
            "FOBAS_Ground",
            [0, -0.08, 0],
            [80, 1, 80],
            state.materials.grass
        );

        createBox(
            "FOBAS_Main_Path",
            [0, -0.005, 0],
            [3.3, 0.08, 45],
            state.materials.path
        );

        createBox(
            "FOBAS_Path_Left",
            [-1.8, 0.005, 0],
            [0.08, 0.06, 45],
            state.materials.woodLight
        );

        createBox(
            "FOBAS_Path_Right",
            [1.8, 0.005, 0],
            [0.08, 0.06, 45],
            state.materials.woodLight
        );
    }


    /* ========================================================
       13. CONSTRUCTION DES ARBRES
    ======================================================== */

    function createTree(x, z, size = 1) {
        const trunkHeight = 2.4 * size;

        createCylinder(
            "FOBAS_Tree_Trunk",
            [x, trunkHeight / 2, z],
            [0.28 * size, trunkHeight, 0.28 * size],
            state.materials.trunk
        );

        createSphere(
            "FOBAS_Tree_Crown",
            [x, trunkHeight + 0.8 * size, z],
            [1.6 * size, 1.8 * size, 1.5 * size],
            state.materials.leaf
        );

        createSphere(
            "FOBAS_Tree_Crown_Light",
            [
                x + 0.35 * size,
                trunkHeight + 1.25 * size,
                z - 0.2 * size
            ],
            [0.95 * size, 1.0 * size, 0.9 * size],
            state.materials.leafLight
        );
    }


    function createParkEnvironment() {
        createGround();

        [
            [-7, -7, 1.1],
            [-8, 0, 1.0],
            [-7, 8, 1.1],
            [7, -7, 1.0],
            [8, 1, 1.15],
            [7, 9, 1.0],
            [-4.5, 13, 1.0],
            [4.5, 13, 1.0],
            [-10, 5, 0.8],
            [10, -2, 0.8]
        ].forEach((item) => {
            createTree(item[0], item[1], item[2]);
        });

        createBench(-3.4, 0.4, 0);

        createBench(3.4, 0.4, 180);

        createFlowerPatch(-3.5, -2);

        createFlowerPatch(3.5, -3);
    }


    function createBench(x, z, rotation = 0) {
        const bench = new pc.Entity("FOBAS_Bench");

        bench.setPosition(x, 0, z);

        bench.setEulerAngles(0, rotation, 0);

        state.app.root.addChild(bench);

        state.sceneEntities.push(bench);

        createBox(
            "FOBAS_Bench_Seat",
            [0, 0.65, 0],
            [2.1, 0.14, 0.65],
            state.materials.wood,
            bench
        );

        createBox(
            "FOBAS_Bench_Back",
            [0, 1.12, -0.25],
            [2.1, 0.75, 0.13],
            state.materials.woodLight,
            bench
        );

        [-0.8, 0.8].forEach((offset) => {
            createBox(
                "FOBAS_Bench_Leg",
                [offset, 0.3, 0],
                [0.14, 0.6, 0.14],
                state.materials.stone,
                bench
            );
        });
    }


    function createFlowerPatch(x, z) {
        const colors = [
            state.materials.flowerRed,
            state.materials.flowerPink,
            state.materials.flowerYellow
        ];

        for (let i = 0; i < 8; i++) {
            const dx = (Math.random() - 0.5) * 2.3;

            const dz = (Math.random() - 0.5) * 2.3;

            createCylinder(
                "FOBAS_Flower_Stem",
                [x + dx, 0.22, z + dz],
                [0.035, 0.4, 0.035],
                state.materials.leaf
            );

            createSphere(
                "FOBAS_Flower_Bloom",
                [x + dx, 0.43, z + dz],
                [0.18, 0.15, 0.18],
                colors[i % colors.length]
            );
        }
    }


    /* ========================================================
       14. ENVIRONNEMENT DU CAFÉ
    ======================================================== */

    function createCafeEnvironment() {
        createPlane(
            "FOBAS_Cafe_Floor",
            [0, -0.05, 0],
            [22, 1, 22],
            state.materials.ground
        );

        createBox(
            "FOBAS_Cafe_Back_Wall",
            [0, 2.5, -5],
            [12, 5, 0.35],
            state.materials.wood
        );

        createBox(
            "FOBAS_Cafe_Left_Wall",
            [-6, 2.5, 0],
            [0.35, 5, 10],
            state.materials.woodLight
        );

        createBox(
            "FOBAS_Cafe_Right_Wall",
            [6, 2.5, 0],
            [0.35, 5, 10],
            state.materials.woodLight
        );

        createBox(
            "FOBAS_Cafe_Table",
            [0, 0.95, 0],
            [2.6, 0.16, 1.5],
            state.materials.wood
        );

        [
            [-1, 0.45, -0.5],
            [1, 0.45, -0.5],
            [-1, 0.45, 0.5],
            [1, 0.45, 0.5]
        ].forEach((position) => {
            createBox(
                "FOBAS_Cafe_Table_Leg",
                position,
                [0.14, 0.9, 0.14],
                state.materials.wood
            );
        });

        createCylinder(
            "FOBAS_Coffee_Cup",
            [0.45, 1.13, 0],
            [0.19, 0.22, 0.19],
            state.materials.white
        );

        createCylinder(
            "FOBAS_Coffee",
            [0.45, 1.245, 0],
            [0.14, 0.015, 0.14],
            state.materials.coffee
        );

        createBox(
            "FOBAS_Cafe_Window",
            [0, 2.3, -4.78],
            [3.2, 1.9, 0.08],
            state.materials.glass
        );

        createBox(
            "FOBAS_Cafe_Counter",
            [-3.6, 0.65, -3.2],
            [2.4, 1.3, 1.0],
            state.materials.wood
        );
    }


    /* ========================================================
       15. ENVIRONNEMENT DU PONT
    ======================================================== */

    function createBridgeEnvironment() {
        createGround();

        createBox(
            "FOBAS_Bridge_Deck",
            [0, 0.18, 0],
            [4.5, 0.35, 18],
            state.materials.wood
        );

        [-2.05, 2.05].forEach((x) => {
            createBox(
                "FOBAS_Bridge_Rail",
                [x, 1.1, 0],
                [0.18, 1.7, 18],
                state.materials.woodLight
            );

            for (let z = -8; z <= 8; z += 2) {
                createBox(
                    "FOBAS_Bridge_Post",
                    [x, 1.0, z],
                    [0.22, 2, 0.22],
                    state.materials.wood
                );
            }
        });

        createPlane(
            "FOBAS_Bridge_Water",
            [0, -0.1, -2],
            [20, 1, 35],
            state.materials.water
        );

        createTree(-7, -4, 1);

        createTree(7, 5, 1);
    }


    /* ========================================================
       16. ENVIRONNEMENT GÉNÉRAL SELON LA SCÈNE
    ======================================================== */

    function clearSceneEntities() {
        const oldEntities = state.sceneEntities.slice();

        state.sceneEntities.length = 0;

        for (const entity of oldEntities) {
            if (!entity || entity === state.camera) {
                continue;
            }

            if (entity.parent) {
                entity.destroy();
            }
        }

        state.characters = {};

        state.environmentEntities = [];
    }


    function buildEnvironment(scene) {
        clearSceneEntities();

        createLighting();

        createCamera();

        switch (scene.environment) {
            case "cafe":
                createCafeEnvironment();
                break;

            case "bridge":
                createBridgeEnvironment();
                break;

            case "forest":
                createParkEnvironment();

                createTree(-3, -12, 1.3);

                createTree(3, -12, 1.2);
                break;

            case "flowers":
                createParkEnvironment();

                createFlowerPatch(-1.8, -4);

                createFlowerPatch(1.8, -4);

                createFlowerPatch(0, 4);
                break;

            case "sunset":
            case "road":
            case "moonGarden":
            case "ceremony":
            case "final":
            case "garden":
            case "park":
            default:
                createParkEnvironment();
                break;
        }

        if (
            scene.environment === "moonGarden" ||
            scene.environment === "final"
        ) {
            createMoonlightProps();
        }

        if (scene.environment === "ceremony") {
            createCeremonyProps();
        }

        createCharacters();

        configureCameraForScene(scene);

        updateLightingForScene(scene);
    }


    function createMoonlightProps() {
        createSphere(
            "FOBAS_Moon",
            [8, 9, -12],
            [1.5, 1.5, 1.5],
            state.materials.white
        );

        for (let i = 0; i < 12; i++) {
            createSphere(
                "FOBAS_Garden_Light",
                [
                    -5 + i * 0.9,
                    0.65,
                    -4 + Math.sin(i) * 2
                ],
                [0.12, 0.12, 0.12],
                state.materials.gold
            );
        }
    }


    function createCeremonyProps() {
        createBox(
            "FOBAS_Ceremony_Platform",
            [0, 0.08, -2],
            [8, 0.16, 5],
            state.materials.woodLight
        );

        for (let i = 0; i < 8; i++) {
            const x = -3.5 + i;

            createCylinder(
                "FOBAS_Ceremony_Column",
                [x, 1.3, -3.8],
                [0.12, 2.6, 0.12],
                state.materials.gold
            );

            createSphere(
                "FOBAS_Ceremony_Light",
                [x, 2.7, -3.8],
                [0.18, 0.18, 0.18],
                state.materials.flowerYellow
            );
        }
    }


    function updateLightingForScene(scene) {
        if (!state.camera || !state.camera.camera) return;

        state.camera.camera.clearColor = new pc.Color(
            scene.sky[0],
            scene.sky[1],
            scene.sky[2]
        );
    }


    /* ========================================================
       17. CONSTRUCTION DES PERSONNAGES
    ======================================================== */

    function createCharacter(
        name,
        skinMaterial,
        hairMaterial,
        shirtMaterial,
        x,
        z
    ) {
        const root = new pc.Entity(name);

        root.setPosition(x, 0, z);

        state.app.root.addChild(root);

        state.sceneEntities.push(root);

        const body = createCylinder(
            name + "_Body",
            [0, 1.25, 0],
            [0.65, 1.15, 0.42],
            shirtMaterial,
            root
        );

        const head = createSphere(
            name + "_Head",
            [0, 2.25, 0],
            [0.56, 0.62, 0.54],
            skinMaterial,
            root
        );

        const hair = createSphere(
            name + "_Hair",
            [0, 2.57, -0.03],
            [0.59, 0.36, 0.57],
            hairMaterial,
            root
        );

        const leftArm = createCylinder(
            name + "_Left_Arm",
            [-0.47, 1.34, 0],
            [0.16, 0.88, 0.16],
            skinMaterial,
            root
        );

        leftArm.setLocalEulerAngles(0, 0, 8);

        const rightArm = createCylinder(
            name + "_Right_Arm",
            [0.47, 1.34, 0],
            [0.16, 0.88, 0.16],
            skinMaterial,
            root
        );

        rightArm.setLocalEulerAngles(0, 0, -8);

        const leftLeg = createCylinder(
            name + "_Left_Leg",
            [-0.20, 0.42, 0],
            [0.19, 0.78, 0.21],
            state.materials.pants,
            root
        );

        const rightLeg = createCylinder(
            name + "_Right_Leg",
            [0.20, 0.42, 0],
            [0.19, 0.78, 0.21],
            state.materials.pants,
            root
        );

        createBox(
            name + "_Left_Shoe",
            [-0.20, 0.08, 0.08],
            [0.27, 0.14, 0.42],
            state.materials.shoe,
            root
        );

        createBox(
            name + "_Right_Shoe",
            [0.20, 0.08, 0.08],
            [0.27, 0.14, 0.42],
            state.materials.shoe,
            root
        );

        const leftEye = createSphere(
            name + "_Left_Eye",
            [-0.15, 2.31, 0.49],
            [0.07, 0.08, 0.045],
            state.materials.black,
            root
        );

        const rightEye = createSphere(
            name + "_Right_Eye",
            [0.15, 2.31, 0.49],
            [0.07, 0.08, 0.045],
            state.materials.black,
            root
        );

        const nose = createSphere(
            name + "_Nose",
            [0, 2.20, 0.52],
            [0.09, 0.11, 0.10],
            skinMaterial,
            root
        );

        const character = {
            root,
            body,
            head,
            hair,
            leftArm,
            rightArm,
            leftLeg,
            rightLeg,
            leftEye,
            rightEye,
            nose,

            baseX: x,
            baseZ: z,

            phase: Math.random() * Math.PI * 2,

            name
        };

        state.characters[name] = character;

        return character;
    }


    function createCharacters() {
        const mikael = createCharacter(
            "Mikael",
            state.materials.skinMikael,
            state.materials.hairMikael,
            state.materials.shirtMikael,
            -1.35,
            0.5
        );

        const nadia = createCharacter(
            "Nadia",
            state.materials.skinNadia,
            state.materials.hairNadia,
            state.materials.shirtNadia,
            1.35,
            -0.2
        );

        mikael.root.setEulerAngles(0, 12, 0);

        nadia.root.setEulerAngles(0, -12, 0);

        state.characters.Mikael = mikael;

        state.characters.Nadia = nadia;
    }


    /* ========================================================
       18. CAMÉRA CINÉMATIQUE
    ======================================================== */

    function configureCameraForScene(scene) {
        if (!state.camera) return;

        const mode = scene.camera;

        let position = [0, 4.2, 11];

        let target = [0, 1.55, 0];

        if (mode === "wide") {
            position = [0, 5.5, 15];

            target = [0, 1.5, 0];
        }

        if (mode === "medium") {
            position = [0, 3.4, 8.2];

            target = [0, 1.7, 0];
        }

        if (mode === "two-shot") {
            position = [0, 3.4, 7.4];

            target = [0, 1.5, 0];
        }

        if (mode === "tracking") {
            position = [0, 4.0, 9.2];

            target = [0, 1.6, 0];
        }

        if (mode === "interior") {
            position = [0, 3.0, 8.0];

            target = [0, 1.4, -0.5];
        }

        if (mode === "romantic") {
            position = [0, 3.1, 7.0];

            target = [0, 1.65, 0];
        }

        if (mode === "dramatic") {
            position = [0, 3.8, 9.0];

            target = [0, 1.6, 0];
        }

        if (mode === "ceremony") {
            position = [0, 5.0, 12.5];

            target = [0, 1.5, -1];
        }

        if (mode === "final") {
            position = [0, 4.8, 13];

            target = [0, 1.5, 0];
        }

        state.cameraTarget.position.set(
            position[0],
            position[1],
            position[2]
        );

        state.cameraTarget.lookAt.set(
            target[0],
            target[1],
            target[2]
        );

        state.camera.setPosition(
            position[0],
            position[1],
            position[2]
        );

        state.camera.lookAt(
            target[0],
            target[1],
            target[2]
        );
    }


    function updateCamera(deltaTime) {
        if (!state.camera || !state.cameraMotion) return;

        const elapsed = state.currentTime;

        const waveX = Math.sin(elapsed * 0.12) * 0.20;

        const waveY = Math.sin(elapsed * 0.18) * 0.08;

        const targetPosition = state.cameraTarget.position;

        const nextPosition = new pc.Vec3(
            targetPosition.x + waveX,
            targetPosition.y + waveY,
            targetPosition.z
        );

        const alpha = 1 - Math.exp(
            -CONFIG.cameraSmoothing * deltaTime
        );

        const currentPosition = state.camera.getPosition();

        currentPosition.lerp(
            currentPosition,
            nextPosition,
            alpha
        );

        state.camera.setPosition(currentPosition);

        state.camera.lookAt(
            state.cameraTarget.lookAt
        );
    }


    /* ========================================================
       19. ANIMATION DES PERSONNAGES
    ======================================================== */

    function updateCharacters(deltaTime) {
        state.animationTime += deltaTime;

        const time = state.animationTime;

        const scene = getCurrentScene();

        const environment = scene.environment;

        const mikael = state.characters.Mikael;

        const nadia = state.characters.Nadia;

        if (!mikael || !nadia) return;

        const walking =
            environment === "forest" ||
            environment === "road";

        const movementAmount = walking ? 0.20 : 0.035;

        [mikael, nadia].forEach((character, index) => {
            const phase = time * (walking ? 3.0 : 1.2) +
                character.phase;

            const bob = Math.sin(phase) * movementAmount;

            character.root.setPosition(
                character.baseX,
                Math.abs(bob) * 0.15,
                character.baseZ
            );

            character.leftArm.setLocalEulerAngles(
                Math.sin(phase) * (walking ? 18 : 4),
                0,
                index === 0 ? 8 : -8
            );

            character.rightArm.setLocalEulerAngles(
                -Math.sin(phase) * (walking ? 18 : 4),
                0,
                index === 0 ? -8 : 8
            );

            character.leftLeg.setLocalEulerAngles(
                Math.sin(phase) * (walking ? 15 : 2),
                0,
                0
            );

            character.rightLeg.setLocalEulerAngles(
                -Math.sin(phase) * (walking ? 15 : 2),
                0,
                0
            );

            character.head.setLocalEulerAngles(
                Math.sin(time * 0.65 + index) * 2.5,
                Math.sin(time * 0.35 + index) * 3.5,
                0
            );
        });
    }


    /* ========================================================
       20. GESTION DE LA SCÈNE COURANTE
    ======================================================== */

    function renderSceneInformation() {
        const scene = getCurrentScene();

        const sceneNumber = state.sceneIndex + 1;

        const label = "SÈN " +
            String(sceneNumber).padStart(2, "0");

        setText(el.sceneNumber, label);

        setText(el.sceneName, scene.name);

        setText(el.sceneLocation, scene.location);

        setText(el.currentSceneLabel, label);

        setText(el.currentLocationLabel, scene.location);

        setText(el.timelineSceneCount,
            sceneNumber + " / " + SCENES.length + " sèn"
        );

        setText(el.sceneListCount,
            SCENES.length + " SÈN"
        );

        updateSceneCards();

        renderDialogue();
    }


    function changeScene(index, options = {}) {
        const newIndex = clamp(
            Math.floor(index),
            0,
            SCENES.length - 1
        );

        const changed = newIndex !== state.sceneIndex;

        state.sceneIndex = newIndex;

        if (changed || options.resetDialogue) {
            state.dialogueIndex = 0;

            state.lastDialogueKey = "";
        }

        buildEnvironment(getCurrentScene());

        renderSceneInformation();

        if (!options.keepTime) {
            const startTime = newIndex * getSceneDuration();

            state.currentTime = startTime;
        }

        updateTimeline();

        updatePlaybackButtons();

        if (changed && state.started) {
            showToast(
                "Sèn " +
                String(newIndex + 1).padStart(2, "0") +
                " : " +
                getCurrentScene().name
            );
        }
    }


    /* ========================================================
       21. DIALOGUES
    ======================================================== */

    function renderDialogue() {
        const scene = getCurrentScene();

        const dialogues = scene.dialogue || [];

        if (!state.captionsEnabled || dialogues.length === 0) {
            setHidden(el.dialogueBox, true);

            return;
        }

        state.dialogueIndex = clamp(
            state.dialogueIndex,
            0,
            dialogues.length - 1
        );

        const dialogue = dialogues[state.dialogueIndex];

        if (!dialogue) {
            setHidden(el.dialogueBox, true);

            return;
        }

        setText(el.dialogueSpeaker, dialogue.speaker);

        setText(el.dialogueAvatar, dialogue.avatar);

        setText(el.dialogueText, dialogue.text);

        setText(
            el.dialogueIndex,
            (state.dialogueIndex + 1) +
            " / " +
            dialogues.length
        );

        setHidden(el.dialogueBox, false);
    }


    function nextDialogue() {
        const scene = getCurrentScene();

        const dialogues = scene.dialogue || [];

        if (dialogues.length === 0) return;

        state.dialogueIndex++;

        if (state.dialogueIndex >= dialogues.length) {
            state.dialogueIndex = 0;
        }

        renderDialogue();

        state.lastDialogueKey =
            state.sceneIndex + ":" + state.dialogueIndex;
    }


    function applyCaptionVisibility() {
        if (!state.captionsEnabled) {
            setHidden(el.dialogueBox, true);

            if (el.captions) {
                el.captions.setAttribute("aria-pressed", "false");
            }

            return;
        }

        if (el.captions) {
            el.captions.setAttribute("aria-pressed", "true");
        }

        renderDialogue();
    }


    function toggleCaptions() {
        state.captionsEnabled = !state.captionsEnabled;

        applyCaptionVisibility();

        saveSettings();

        showToast(
            state.captionsEnabled
                ? "Dyalòg yo aktive."
                : "Dyalòg yo dezaktive."
        );
    }


    /* ========================================================
       22. LIGNE DE TEMPS
    ======================================================== */

    function updateTimeline() {
        const progress = clamp(
            state.currentTime / CONFIG.duration,
            0,
            1
        );

        if (el.timelineProgress) {
            el.timelineProgress.style.width =
                (progress * 100) + "%";
        }

        setText(
            el.currentTime,
            formatTime(state.currentTime)
        );

        setText(
            el.totalTime,
            formatTime(CONFIG.duration)
        );

        setText(
            el.timelineStart,
            "00:00"
        );

        setText(
            el.timelineEnd,
            formatTime(CONFIG.duration)
        );

        if (el.timelineTrack) {
            el.timelineTrack.setAttribute(
                "aria-valuenow",
                String(Math.floor(state.currentTime))
            );
        }

        if (el.timelineStatus) {
            if (!state.started) {
                setText(el.timelineStatus, "Pare pou jwe");
            } else if (state.exporting) {
                setText(el.timelineStatus, "Ekspòtasyon an ap fèt");
            } else if (state.playing) {
                setText(el.timelineStatus, "Fim nan ap jwe");
            } else if (state.currentTime >= CONFIG.duration) {
                setText(el.timelineStatus, "Fim nan fini");
            } else {
                setText(el.timelineStatus, "Fim nan an poz");
            }
        }

        updateSceneCards();
    }


    function seekTo(time) {
        const newTime = clamp(
            Number(time) || 0,
            0,
            CONFIG.duration
        );

        const previousScene = state.sceneIndex;

        const nextScene = getSceneAtTime(newTime);

        state.currentTime = newTime;

        if (nextScene !== previousScene) {
            state.sceneIndex = nextScene;

            state.dialogueIndex = 0;

            buildEnvironment(getCurrentScene());

            renderSceneInformation();
        } else {
            updateDialogueFromTime();
        }

        updateTimeline();

        updatePlaybackButtons();
    }


    function seekFromPointer(event) {
        if (!el.timelineTrack) return;

        const rect = el.timelineTrack.getBoundingClientRect();

        if (!rect.width) return;

        const position = clamp(
            (event.clientX - rect.left) / rect.width,
            0,
            1
        );

        seekTo(position * CONFIG.duration);
    }


    function createTimelineMarkers() {
        if (!el.timelineMarkers) return;

        el.timelineMarkers.replaceChildren();

        SCENES.forEach((scene, index) => {
            const marker = document.createElement("button");

            marker.type = "button";

            marker.className = "timeline-marker";

            marker.style.left =
                ((index / SCENES.length) * 100) + "%";

            marker.title =
                "Sèn " +
                (index + 1) +
                " : " +
                scene.name;

            marker.setAttribute(
                "aria-label",
                marker.title
            );

            marker.addEventListener("click", (event) => {
                event.stopPropagation();

                seekTo(index * getSceneDuration());

                showToast("Ou chwazi : " + scene.name);
            });

            el.timelineMarkers.appendChild(marker);
        });
    }


    /* ========================================================
       23. CHOIX AUTOMATIQUE DU DIALOGUE
    ======================================================== */

    function updateDialogueFromTime() {
        const scene = getCurrentScene();

        const dialogues = scene.dialogue || [];

        if (dialogues.length === 0) return;

        const localTime =
            state.currentTime -
            state.sceneIndex * getSceneDuration();

        const dialogueSlot = Math.floor(
            localTime / CONFIG.dialogueInterval
        );

        const index = dialogueSlot % dialogues.length;

        const key = state.sceneIndex + ":" + index;

        if (key !== state.lastDialogueKey) {
            state.dialogueIndex = index;

            state.lastDialogueKey = key;

            renderDialogue();
        }
    }


    /* ========================================================
       24. LISTE INTERACTIVE DES SCÈNES
    ======================================================== */

    function createSceneList() {
        if (!el.sceneList) return;

        el.sceneList.replaceChildren();

        SCENES.forEach((scene, index) => {
            const card = document.createElement("button");

            card.type = "button";

            card.className = "scene-card";

            card.dataset.sceneIndex = String(index);

            card.setAttribute(
                "aria-label",
                "Jwe sèn " +
                (index + 1) +
                " : " +
                scene.name
            );

            const number = document.createElement("span");

            number.className = "scene-card-number";

            number.textContent =
                String(index + 1).padStart(2, "0");


            const content = document.createElement("span");

            content.className = "scene-card-content";


            const title = document.createElement("strong");

            title.className = "scene-card-title";

            title.textContent = scene.name;


            const location = document.createElement("span");

            location.className = "scene-card-location";

            location.textContent = scene.location;


            content.append(title, location);

            card.append(number, content);

            card.addEventListener("click", () => {
                seekTo(index * getSceneDuration());

                if (!state.started) {
                    startFilm();
                } else {
                    playFilm();
                }

                if (el.stage) {
                    el.stage.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }
            });

            el.sceneList.appendChild(card);
        });

        updateSceneCards();
    }


    function updateSceneCards() {
        if (!el.sceneList) return;

        const cards = el.sceneList.querySelectorAll(
            "[data-scene-index]"
        );

        cards.forEach((card) => {
            const index = Number(card.dataset.sceneIndex);

            const active = index === state.sceneIndex;

            card.classList.toggle("active", active);

            card.setAttribute(
                "aria-current",
                active ? "true" : "false"
            );
        });
    }


    /* ========================================================
       25. BOUTONS DE LECTURE
    ======================================================== */

    function updatePlaybackButtons() {
        if (el.playPause) {
            el.playPause.textContent =
                state.playing ? "Ⅱ" : "▶";

            el.playPause.setAttribute(
                "aria-label",
                state.playing
                    ? "Mete fim nan an poz"
                    : "Jwe fim nan"
            );
        }

        if (el.playbackStatus) {
            setText(
                el.playbackStatus,
                state.playing ? "AP JWE" : "AN POZ"
            );
        }

        if (el.start) {
            el.start.disabled = !state.ready;
        }

        if (el.previousScene) {
            el.previousScene.disabled =
                state.sceneIndex <= 0;
        }

        if (el.nextScene) {
            el.nextScene.disabled =
                state.sceneIndex >= SCENES.length - 1;
        }

        setHidden(
            el.pauseOverlay,
            !state.started || state.playing
        );
    }


    function startFilm() {
        if (!state.ready) {
            showToast("Tanpri tann preparasyon sèn 3D a fini.");

            return;
        }

        if (state.currentTime >= CONFIG.duration) {
            state.currentTime = 0;

            state.sceneIndex = 0;

            state.dialogueIndex = 0;

            changeScene(0, {
                keepTime: true,
                resetDialogue: true
            });
        }

        state.started = true;

        playFilm();

        setHidden(el.loading, true);

        setHidden(el.error, true);

        setHidden(el.pauseOverlay, true);

        if (el.canvas) {
            safeCall(() => el.canvas.focus({
                preventScroll: true
            }));
        }

        updatePlaybackButtons();

        updateTimeline();

        showToast("Fim nan kòmanse. Bon vizyon!");
    }


    function playFilm() {
        if (!state.ready) return;

        if (state.currentTime >= CONFIG.duration) {
            state.currentTime = 0;

            state.sceneIndex = 0;

            state.dialogueIndex = 0;

            changeScene(0, {
                keepTime: true,
                resetDialogue: true
            });
        }

        state.started = true;

        state.playing = true;

        state.lastFrameTime = performance.now();

        setHidden(el.loading, true);

        setHidden(el.pauseOverlay, true);

        updatePlaybackButtons();

        updateTimeline();
    }


    function pauseFilm() {
        state.playing = false;

        updatePlaybackButtons();

        updateTimeline();
    }


    function togglePlayPause() {
        if (!state.ready) {
            showToast("Fim nan poko pare.");

            return;
        }

        if (!state.started) {
            startFilm();

            return;
        }

        if (state.playing) {
            pauseFilm();
        } else {
            playFilm();
        }
    }


    function previousScene() {
        const target = Math.max(0, state.sceneIndex - 1);

        seekTo(target * getSceneDuration());
    }


    function nextScene() {
        const target = Math.min(
            SCENES.length - 1,
            state.sceneIndex + 1
        );

        seekTo(target * getSceneDuration());
    }


    function restartFilm() {
        if (state.exporting) {
            showToast(
                "Anile ekspòtasyon an anvan ou rekòmanse fim nan."
            );

            return;
        }

        state.currentTime = 0;

        state.sceneIndex = 0;

        state.dialogueIndex = 0;

        state.lastDialogueKey = "";

        changeScene(0, {
            keepTime: true,
            resetDialogue: true
        });

        state.started = true;

        playFilm();

        updateTimeline();

        showToast("Fim nan rekòmanse depi nan kòmansman.");
    }


    function rewindTenSeconds() {
        seekTo(state.currentTime - 10);
    }


    function forwardTenSeconds() {
        seekTo(state.currentTime + 10);
    }


    function changePlaybackSpeed() {
        const speed = Number(el.playbackSpeed.value);

        state.playbackSpeed = clamp(
            Number.isFinite(speed) ? speed : 1,
            0.25,
            2
        );

        showToast(
            "Vitès lekti : " +
            state.playbackSpeed +
            "×"
        );
    }


    /* ========================================================
       26. MISE À JOUR DU TEMPS DU FILM
    ======================================================== */

    function updateFilmClock(deltaTime) {
        if (!state.playing) return;

        state.currentTime +=
            deltaTime * state.playbackSpeed;

        if (state.currentTime >= CONFIG.duration) {
            state.currentTime = CONFIG.duration;

            state.playing = false;

            state.started = true;

            updatePlaybackButtons();

            updateTimeline();

            showToast(
                "Fim nan fini. Mèsi paske ou gade FOBAS CINÉMA 3D."
            );

            if (state.exporting) {
                finishExport();
            }

            return;
        }

        const nextScene = getSceneAtTime(state.currentTime);

        if (nextScene !== state.sceneIndex) {
            state.sceneIndex = nextScene;

            state.dialogueIndex = 0;

            state.lastDialogueKey = "";

            buildEnvironment(getCurrentScene());

            renderSceneInformation();
        }

        updateDialogueFromTime();

        updateTimeline();
    }


    /* ========================================================
       27. BOUCLE PRINCIPALE PLAYCANVAS
    ======================================================== */

    function onUpdate(deltaTime) {
        if (state.destroyed) return;

        const dt = clamp(deltaTime, 0, 0.1);

        updateFilmClock(dt);

        updateCharacters(dt);

        updateCamera(dt);

        state.frameCount++;

        state.fpsAccumulator += dt;

        if (state.fpsAccumulator >= 1) {
            state.displayedFPS = state.frameCount /
                state.fpsAccumulator;

            state.frameCount = 0;

            state.fpsAccumulator = 0;

            if (state.displayedFPS < 20) {
                showPerformanceNotice(
                    "Pèfòmans lan ba. Eseye diminye kalite grafik yo.",
                    2500
                );
            }
        }
    }


    /* ========================================================
       28. QUALITÉ GRAPHIQUE
    ======================================================== */

    function applyGraphicsQuality() {
        if (!state.app || !state.app.graphicsDevice) return;

        const device = state.app.graphicsDevice;

        let pixelRatio = isMobileDevice()
            ? CONFIG.mobilePixelRatio
            : CONFIG.desktopPixelRatio;

        if (state.graphics === "medium") {
            pixelRatio = 1.15;
        }

        if (state.graphics === "low") {
            pixelRatio = 1;
        }

        pixelRatio = Math.min(
            pixelRatio,
            window.devicePixelRatio || 1
        );

        safeCall(() => {
            device.maxPixelRatio = pixelRatio;
        });

        safeCall(() => {
            state.app.graphicsDevice.maxPixelRatio = pixelRatio;
        });

        safeCall(() => {
            state.app.setCanvasResolution(
                pc.RESOLUTION_AUTO
            );
        });

        if (el.qualityIndicator) {
            setText(
                el.qualityIndicator,
                state.graphics.toUpperCase() + " 3D"
            );
        }

        if (el.renderIndicator) {
            setText(
                el.renderIndicator,
                "PLAYCANVAS " + CONFIG.engineVersion
            );
        }
    }


    /* ========================================================
       29. ADAPTATION DE L'ÉCRAN
    ======================================================== */

    function resizeCanvas() {
        if (!state.app || !el.canvas) return;

        safeCall(() => {
            state.app.resizeCanvas(
                el.canvas.clientWidth,
                el.canvas.clientHeight
            );
        });
    }


    function installResizeHandling() {
        listen(window, "resize", resizeCanvas);

        listen(window, "orientationchange", () => {
            setTimeout(resizeCanvas, 250);
        });

        if ("ResizeObserver" in window) {
            state.resizeObserver = new ResizeObserver(() => {
                resizeCanvas();
            });

            state.resizeObserver.observe(el.stage);
        }
    }


    /* ========================================================
       30. INITIALISATION PLAYCANVAS
    ======================================================== */

    function initializeEngine() {
        return new Promise((resolve, reject) => {
            if (!window.pc || !window.pc.Application) {
                reject(
                    new Error(
                        "PlayCanvas pa disponib. Verifye koneksyon " +
                        "ak bibliyotèk PlayCanvas 2.23.2 la."
                    )
                );

                return;
            }

            if (!el.canvas.getContext) {
                reject(
                    new Error(
                        "Navigatè a pa kapab kreye yon canvas 3D."
                    )
                );

                return;
            }

            let app;

            try {
                setLoadingProgress(
                    5,
                    "Preparasyon motè 3D a..."
                );

                const graphicsDeviceOptions = {
                    antialias: true,

                    alpha: false,

                    preserveDrawingBuffer: false,

                    powerPreference: "high-performance"
                };

                app = new pc.Application(
                    el.canvas,
                    {
                        graphicsDeviceOptions,

                        mouse: new pc.Mouse(el.canvas),

                        touch: new pc.TouchDevice(el.canvas),

                        keyboard: new pc.Keyboard(window)
                    }
                );

                state.app = app;

                app.scene.ambientLight = new pc.Color(
                    0.42,
                    0.45,
                    0.52
                );

                app.scene.gammaCorrection = pc.GAMMA_SRGB;

                app.scene.toneMapping = pc.TONEMAP_FILMIC;

                app.setCanvasFillMode(pc.FILLMODE_NONE);

                app.setCanvasResolution(pc.RESOLUTION_AUTO);

                app.on("update", onUpdate);

                setLoadingProgress(
                    18,
                    "Preparasyon limyè sinematik yo..."
                );

                createAllMaterials();

                setLoadingProgress(
                    32,
                    "Kreyasyon anviwònman 3D yo..."
                );

                buildEnvironment(SCENES[0]);

                setLoadingProgress(
                    55,
                    "Kreyasyon pèsonaj Mikaël ak Nadia..."
                );

                setLoadingProgress(
                    70,
                    "Preparasyon 12 sèn istwa a..."
                );

                createSceneList();

                createTimelineMarkers();

                renderSceneInformation();

                updateTimeline();

                setLoadingProgress(
                    88,
                    "Konfigirasyon kontwòl fim nan..."
                );

                applyGraphicsQuality();

                installResizeHandling();

                setLoadingProgress(
                    100,
                    "Estidyo a pare. Ou kapab kòmanse fim nan."
                );

                app.start();

                state.ready = true;

                state.started = false;

                state.playing = false;

                state.currentTime = 0;

                state.sceneIndex = 0;

                setHidden(el.error, true);

                setHidden(el.loading, false);

                setHidden(el.pauseOverlay, true);

                el.start.disabled = false;

                updatePlaybackButtons();

                updateTimeline();

                resolve(app);
            } catch (error) {
                if (app) {
                    safeCall(() => app.destroy());
                }

                state.app = null;

                reject(error);
            }
        });
    }


    /* ========================================================
       31. GESTION DES ERREURS
    ======================================================== */

    function showFatalError(error) {
        console.error(
            "[FOBAS CINÉMA 3D] Erreur :",
            error
        );

        state.ready = false;

        state.playing = false;

        setHidden(el.loading, true);

        setHidden(el.pauseOverlay, true);

        setHidden(el.error, false);

        setText(
            el.errorMessage,
            error && error.message
                ? error.message
                : "Yon erè enkoni anpeche fim nan demare."
        );

        if (el.start) {
            el.start.disabled = true;
        }

        updatePlaybackButtons();
    }


    function retryInitialization() {
        if (state.exporting) {
            showToast(
                "Fini oswa anile ekspòtasyon an anvan ou rekòmanse motè a."
            );

            return;
        }

        setHidden(el.error, true);

        setHidden(el.loading, false);

        setLoadingProgress(
            0,
            "Nou ap eseye prepare estidyo a ankò..."
        );

        state.destroyed = false;

        state.ready = false;

        state.started = false;

        state.playing = false;

        safeCall(() => {
            if (state.app) {
                state.app.destroy();
            }
        });

        state.app = null;

        state.sceneEntities = [];

        state.materials = {};

        state.characters = {};

        initializeEngine().catch(showFatalError);
    }


    /* ========================================================
       32. PLEIN ÉCRAN
    ======================================================== */

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                const target = el.stage || el.app;

                if (target.requestFullscreen) {
                    await target.requestFullscreen();
                } else if (el.canvas.requestFullscreen) {
                    await el.canvas.requestFullscreen();
                } else {
                    showToast(
                        "Navigatè sa a pa sipòte plen ekran."
                    );

                    return;
                }

                showToast("Plen ekran aktive.");
            } else {
                await document.exitFullscreen();

                showToast("Ou kite plen ekran.");
            }
        } catch (error) {
            console.warn("[FOBAS CINÉMA] Fullscreen :", error);

            showToast(
                "Navigatè a pa pèmèt chanjman plen ekran an."
            );
        }
    }


    /* ========================================================
       33. PARAMÈT
    ======================================================== */

    function openSettings() {
        if (!el.settingsDialog) return;

        if (typeof el.settingsDialog.showModal === "function") {
            if (!el.settingsDialog.open) {
                el.settingsDialog.showModal();
            }
        } else {
            el.settingsDialog.setAttribute("open", "");
        }
    }


    function closeSettings() {
        if (!el.settingsDialog) return;

        if (typeof el.settingsDialog.close === "function") {
            if (el.settingsDialog.open) {
                el.settingsDialog.close();
            }
        } else {
            el.settingsDialog.removeAttribute("open");
        }
    }


    function saveSettingsFromDialog() {
        state.captionsEnabled = Boolean(
            el.settingCaptions.checked
        );

        state.cameraMotion = Boolean(
            el.settingCameraMotion.checked
        );

        state.mobileControls = Boolean(
            el.settingMobile.checked
        );

        state.graphics = el.settingGraphics.value;

        saveSettings();

        applyCaptionVisibility();

        applyGraphicsQuality();

        closeSettings();

        showToast("Paramèt yo sove.");
    }


    /* ========================================================
       34. CONTRÔLES MOBILES ET CLAVIER
    ======================================================== */

    function installMobileControls() {
        listen(el.canvas, "pointerdown", (event) => {
            state.pointerDown = true;

            state.pointerStartX = event.clientX;

            state.pointerStartY = event.clientY;
        });

        listen(el.canvas, "pointerup", (event) => {
            if (!state.pointerDown) return;

            state.pointerDown = false;

            const dx = event.clientX - state.pointerStartX;

            const dy = event.clientY - state.pointerStartY;

            if (
                !state.mobileControls ||
                Math.abs(dx) < 65 ||
                Math.abs(dx) < Math.abs(dy)
            ) {
                return;
            }

            if (dx < 0) {
                nextScene();
            } else {
                previousScene();
            }
        });

        listen(el.canvas, "pointercancel", () => {
            state.pointerDown = false;
        });

        listen(document, "keydown", (event) => {
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLSelectElement ||
                event.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            if (el.settingsDialog && el.settingsDialog.open) {
                return;
            }

            switch (event.code) {
                case "Space":
                    event.preventDefault();

                    togglePlayPause();
                    break;

                case "ArrowLeft":
                    event.preventDefault();

                    rewindTenSeconds();
                    break;

                case "ArrowRight":
                    event.preventDefault();

                    forwardTenSeconds();
                    break;

                case "ArrowUp":
                    event.preventDefault();

                    previousScene();
                    break;

                case "ArrowDown":
                    event.preventDefault();

                    nextScene();
                    break;

                case "KeyC":
                    toggleCaptions();
                    break;

                case "KeyF":
                    toggleFullscreen();
                    break;

                case "Escape":
                    if (state.playing && !document.fullscreenElement) {
                        pauseFilm();
                    }
                    break;
            }
        });
    }


    /* ========================================================
       35. DIALOGUES ET TEMPS
    ======================================================== */

    function installDialogueInteractions() {
        listen(el.nextDialogue, "click", nextDialogue);

        listen(el.dialogueBox, "click", (event) => {
            if (
                event.target === el.nextDialogue ||
                event.target.closest("button")
            ) {
                return;
            }

            nextDialogue();
        });
    }


    /* ========================================================
       36. INSTALLATION DES BOUTONS
    ======================================================== */

    function installPlaybackControls() {
        listen(el.start, "click", startFilm);

        listen(el.retry, "click", retryInitialization);

        listen(el.playPause, "click", togglePlayPause);

        listen(el.resumeCenter, "click", playFilm);

        listen(el.previousScene, "click", previousScene);

        listen(el.nextScene, "click", nextScene);

        listen(el.rewind, "click", rewindTenSeconds);

        listen(el.forward, "click", forwardTenSeconds);

        listen(el.restart, "click", restartFilm);

        listen(el.captions, "click", toggleCaptions);

        listen(el.playbackSpeed, "change", changePlaybackSpeed);

        listen(el.timelineTrack, "click", seekFromPointer);

        listen(el.fullscreen, "click", toggleFullscreen);

        listen(el.settings, "click", openSettings);

        listen(el.closeSettings, "click", closeSettings);

        listen(el.saveSettings, "click", saveSettingsFromDialog);

        listen(el.settingsDialog, "click", (event) => {
            if (event.target === el.settingsDialog) {
                closeSettings();
            }
        });

        listen(document, "fullscreenchange", () => {
            if (el.fullscreen) {
                el.fullscreen.setAttribute(
                    "aria-label",
                    document.fullscreenElement
                        ? "Kite plen ekran"
                        : "Mete fim nan an plen ekran"
                );
            }

            resizeCanvas();
        });
    }


    /* ========================================================
       37. EXPORT VIDÉO — COMPATIBILITÉ RÉELLE
    ======================================================== */

    function getSupportedMimeType() {
        if (!window.MediaRecorder) {
            return null;
        }

        const preferredFormat = el.exportFormat.value;

        const candidates = [];

        if (preferredFormat === "mp4") {
            candidates.push(
                "video/mp4;codecs=avc1.42E01E",
                "video/mp4"
            );
        } else if (preferredFormat === "webm") {
            candidates.push(
                "video/webm;codecs=vp9",
                "video/webm;codecs=vp8",
                "video/webm"
            );
        } else {
            candidates.push(
                "video/mp4;codecs=avc1.42E01E",
                "video/mp4",
                "video/webm;codecs=vp9",
                "video/webm;codecs=vp8",
                "video/webm"
            );
        }

        for (const mimeType of candidates) {
            if (
                typeof MediaRecorder.isTypeSupported === "function" &&
                MediaRecorder.isTypeSupported(mimeType)
            ) {
                return mimeType;
            }
        }

        return "";
    }


    function updateExportProgress(percent, status, details) {
        const value = clamp(Math.round(percent), 0, 100);

        setHidden(el.exportProgressPanel, false);

        setText(el.exportPercent, value + "%");

        setText(el.exportStatus, status);

        setText(el.exportDetails, details);

        if (el.exportProgressBar) {
            el.exportProgressBar.style.width = value + "%";
        }
    }


    function updateExportClock() {
        if (!state.exporting) return;

        const elapsed =
            (performance.now() - state.exportStartedAt) / 1000;

        const progress = state.exportDuration > 0
            ? (elapsed / state.exportDuration) * 100
            : 0;

        const remaining = Math.max(
            0,
            state.exportDuration - elapsed
        );

        updateExportProgress(
            progress,
            "Anrejistreman videyo a ap fèt...",
            "Tan pase : " +
            formatTime(elapsed) +
            " — Tan estime ki rete : " +
            formatTime(remaining) +
            ". Kite paj la ouvè."
        );

        if (elapsed >= state.exportDuration) {
            finishExport();
        }
    }


    function startExport() {
        if (state.exporting) {
            showToast("Yon ekspòtasyon deja ap fèt.");

            return;
        }

        if (!state.ready) {
            showToast("Tann sèn 3D a pare anvan ekspòtasyon.");

            return;
        }

        if (!window.MediaRecorder) {
            showToast(
                "Navigatè sa a pa sipòte anrejistreman videyo MediaRecorder."
            );

            return;
        }

        if (!el.canvas.captureStream) {
            showToast(
                "Navigatè sa a pa sipòte captureStream pou canvas 3D a."
            );

            return;
        }

        const mimeType = getSupportedMimeType();

        if (mimeType === null) {
            showToast(
                "Fonksyon MediaRecorder la pa disponib."
            );

            return;
        }

        if (mimeType === "") {
            showToast(
                "Navigatè a pa bay yon fòma videyo konpatib."
            );

            return;
        }

        const requestedFormat = el.exportFormat.value;

        if (
            requestedFormat === "mp4" &&
            !mimeType.toLowerCase().includes("mp4")
        ) {
            showToast(
                "MP4 pa disponib sou navigatè sa a. " +
                "Chwazi WebM oswa Otomatik."
            );

            return;
        }

        const resolution = Number(el.exportResolution.value);

        const frameRate = Number(el.exportFrameRate.value);

        if (
            !Number.isFinite(resolution) ||
            !Number.isFinite(frameRate) ||
            ![720, 1080].includes(resolution) ||
            ![24, 30].includes(frameRate)
        ) {
            showToast("Rezolisyon oswa FPS la pa valab.");

            return;
        }

        if (
            el.canvas.clientWidth <= 0 ||
            el.canvas.clientHeight <= 0
        ) {
            showToast(
                "Canvas la pa vizib. Louvri sèn nan anvan ekspòtasyon."
            );

            return;
        }

        const originalWidth = el.canvas.width;

        const originalHeight = el.canvas.height;

        const originalCssWidth = el.canvas.style.width;

        const originalCssHeight = el.canvas.style.height;

        const originalPlaybackTime = state.currentTime;

        const originalPlayingState = state.playing;

        try {
            const stream = el.canvas.captureStream(frameRate);

            if (!stream || stream.getVideoTracks().length === 0) {
                throw new Error(
                    "Nou pa jwenn tras videyo pou anrejistreman an."
                );
            }

            const options = {
                mimeType
            };

            if (mimeType.includes("webm")) {
                options.videoBitsPerSecond =
                    resolution >= 1080
                        ? 6500000
                        : 3500000;
            } else if (mimeType.includes("mp4")) {
                options.videoBitsPerSecond =
                    resolution >= 1080
                        ? 6500000
                        : 3500000;
            }

            const recorder = new MediaRecorder(
                stream,
                options
            );

            state.exportStream = stream;

            state.exportRecorder = recorder;

            state.exportChunks = [];

            state.exportCancelled = false;

            state.exporting = true;

            state.exportStartedAt = performance.now();

            state.exportStartFilmTime = originalPlaybackTime;

            state.exportDuration = Math.max(
                1,
                CONFIG.duration - originalPlaybackTime
            );

            recorder.addEventListener("dataavailable", (event) => {
                if (
                    event.data &&
                    event.data.size > 0
                ) {
                    state.exportChunks.push(event.data);
                }
            });

            recorder.addEventListener("error", (event) => {
                console.error(
                    "[FOBAS CINÉMA] Erè MediaRecorder :",
                    event
                );

                showToast(
                    "Yon erè rive pandan anrejistreman videyo a."
                );
            });

            recorder.addEventListener("stop", () => {
                onExportRecorderStopped(
                    mimeType,
                    resolution,
                    frameRate
                );
            });

            setHidden(el.exportResult, true);

            setHidden(el.exportProgressPanel, false);

            el.exportButton.disabled = true;

            el.cancelExport.disabled = false;

            if (el.exportButton) {
                el.exportButton.setAttribute(
                    "aria-busy",
                    "true"
                );
            }

            updateExportProgress(
                0,
                "Preparasyon ekspòtasyon...",
                "Fòma : " +
                mimeType +
                " — " +
                resolution +
                "p — " +
                frameRate +
                " FPS."
            );

            /*
             * L'export enregistre réellement le canvas.
             * Il prend le temps réel restant du film.
             */
            if (!state.started || !state.playing) {
                playFilm();
            }

            recorder.start(1000);

            state.exportTimer = setInterval(
                updateExportClock,
                1000
            );

            showToast(
                "Ekspòtasyon kòmanse. Pa fèmen paj la."
            );
        } catch (error) {
            console.error(
                "[FOBAS CINÉMA] Export :",
                error
            );

            state.exporting = false;

            state.exportRecorder = null;

            if (state.exportStream) {
                state.exportStream.getTracks().forEach(
                    (track) => track.stop()
                );
            }

            state.exportStream = null;

            el.exportButton.disabled = false;

            el.cancelExport.disabled = true;

            showToast(
                "Nou pa kapab kòmanse ekspòtasyon an : " +
                (error.message || "erè enkoni")
            );
        }
    }


    function cancelExport() {
        if (!state.exporting) {
            showToast("Pa gen ekspòtasyon k ap fèt.");

            return;
        }

        state.exportCancelled = true;

        state.exporting = false;

        clearInterval(state.exportTimer);

        state.exportTimer = null;

        try {
            if (
                state.exportRecorder &&
                state.exportRecorder.state !== "inactive"
            ) {
                state.exportRecorder.stop();
            } else {
                cleanupExport();
            }
        } catch (error) {
            console.warn(
                "[FOBAS CINÉMA] Annulation export :",
                error
            );

            cleanupExport();
        }

        pauseFilm();

        updateExportProgress(
            0,
            "Ekspòtasyon anile.",
            "Ou kapab rekòmanse ekspòtasyon an nenpòt lè."
        );

        showToast("Ekspòtasyon an anile.");
    }


    function finishExport() {
        if (!state.exporting) return;

        state.exporting = false;

        clearInterval(state.exportTimer);

        state.exportTimer = null;

        if (
            state.exportRecorder &&
            state.exportRecorder.state !== "inactive"
        ) {
            safeCall(() => {
                state.exportRecorder.stop();
            });
        } else {
            onExportRecorderStopped(
                state.exportRecorder
                    ? state.exportRecorder.mimeType
                    : "video/webm",
                Number(el.exportResolution.value),
                Number(el.exportFrameRate.value)
            );
        }
    }


    function onExportRecorderStopped(
        mimeType,
        resolution,
        frameRate
    ) {
        clearInterval(state.exportTimer);

        state.exportTimer = null;

        const cancelled = state.exportCancelled;

        const chunks = state.exportChunks.slice();

        cleanupExport();

        if (cancelled) {
            setHidden(el.exportProgressPanel, true);

            setHidden(el.exportResult, true);

            el.exportButton.disabled = false;

            el.cancelExport.disabled = true;

            if (el.exportButton) {
                el.exportButton.removeAttribute("aria-busy");
            }

            return;
        }

        if (!chunks.length) {
            setHidden(el.exportProgressPanel, false);

            updateExportProgress(
                0,
                "Ekspòtasyon an echwe.",
                "Navigatè a pa bay okenn done videyo."
            );

            el.exportButton.disabled = false;

            el.cancelExport.disabled = true;

            showToast(
                "Fichye videyo a vid. Eseye yon lòt fòma."
            );

            return;
        }

        const type = mimeType && mimeType.includes("mp4")
            ? "video/mp4"
            : "video/webm";

        const extension = type === "video/mp4"
            ? "mp4"
            : "webm";

        const blob = new Blob(chunks, {
            type
        });

        if (!blob.size) {
            el.exportButton.disabled = false;

            el.cancelExport.disabled = true;

            showToast(
                "Fichye videyo a pa gen done. Eseye ankò."
            );

            return;
        }

        if (state.exportBlobUrl) {
            URL.revokeObjectURL(state.exportBlobUrl);
        }

        state.exportBlobUrl = URL.createObjectURL(blob);

        el.downloadVideo.href = state.exportBlobUrl;

        el.downloadVideo.download =
            "FOBAS-De-Ke-Yon-Seul-Destin." + extension;

        setText(
            el.exportResultTitle,
            "Videyo a pare!"
        );

        setText(
            el.exportResultMessage,
            "Fichye " +
            extension.toUpperCase() +
            " la pare. Gwosè : " +
            formatBytes(blob.size) +
            ". Rezolisyon mande : " +
            resolution +
            "p, " +
            frameRate +
            " FPS. Kalite final la depann de navigatè a."
        );

        setHidden(el.exportProgressPanel, false);

        setHidden(el.exportResult, false);

        updateExportProgress(
            100,
            "Ekspòtasyon fini.",
            "Fichye a pare pou telechaje."
        );

        el.exportButton.disabled = false;

        el.cancelExport.disabled = true;

        if (el.exportButton) {
            el.exportButton.removeAttribute("aria-busy");
        }

        showToast(
            "Videyo a pare. Peze TELECHAJE VIDEYO A."
        );

        pauseFilm();
    }


    function cleanupExport() {
        clearInterval(state.exportTimer);

        state.exportTimer = null;

        if (state.exportStream) {
            state.exportStream.getTracks().forEach(
                (track) => {
                    safeCall(() => track.stop());
                }
            );
        }

        state.exportStream = null;

        state.exportRecorder = null;

        state.exporting = false;

        state.exportChunks = [];

        el.exportButton.disabled = false;

        el.cancelExport.disabled = true;

        if (el.exportButton) {
            el.exportButton.removeAttribute("aria-busy");
        }
    }


    function formatBytes(bytes) {
        if (!Number.isFinite(bytes) || bytes <= 0) {
            return "0 B";
        }

        const units = ["B", "KB", "MB", "GB"];

        let size = bytes;

        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;

            unitIndex++;
        }

        return size.toFixed(unitIndex === 0 ? 0 : 2) +
            " " +
            units[unitIndex];
    }


    /* ========================================================
       38. INSTALLATION DES CONTRÔLES D'EXPORTATION
    ======================================================== */

    function installExportControls() {
        listen(el.exportButton, "click", startExport);

        listen(el.cancelExport, "click", cancelExport);

        listen(el.downloadVideo, "click", (event) => {
            if (
                !state.exportBlobUrl ||
                !el.downloadVideo.href
            ) {
                event.preventDefault();

                showToast("Pa gen videyo ki pare pou telechaje.");

                return;
            }

            showToast("Telechajman videyo a ap kòmanse.");
        });
    }


    /* ========================================================
       39. GESTION DU CYCLE DE VIE
    ======================================================== */

    function handleVisibilityChange() {
        if (document.hidden && state.playing && !state.exporting) {
            pauseFilm();

            showToast(
                "Fim nan an poz paske paj la pa vizib."
            );
        }
    }


    function cleanup() {
        if (state.destroyed) return;

        state.destroyed = true;

        state.playing = false;

        if (state.exporting) {
            state.exportCancelled = true;

            state.exporting = false;

            if (
                state.exportRecorder &&
                state.exportRecorder.state !== "inactive"
            ) {
                safeCall(() => state.exportRecorder.stop());
            }

            cleanupExport();
        }

        clearTimeout(state.toastTimer);

        clearTimeout(state.noticeTimer);

        clearTimeout(state.saveTimer);

        clearInterval(state.exportTimer);

        if (state.resizeObserver) {
            state.resizeObserver.disconnect();

            state.resizeObserver = null;
        }

        removeAllListeners();

        if (state.exportBlobUrl) {
            safeCall(() => URL.revokeObjectURL(state.exportBlobUrl));

            state.exportBlobUrl = null;
        }

        if (state.app) {
            safeCall(() => {
                state.app.off("update", onUpdate);

                state.app.destroy();
            });

            state.app = null;
        }
    }


    /* ========================================================
       40. INITIALISATION DES ÉVÉNEMENTS
    ======================================================== */

    function installAllControls() {
        installPlaybackControls();

        installDialogueInteractions();

        installMobileControls();

        installExportControls();

        listen(
            document,
            "visibilitychange",
            handleVisibilityChange
        );

        listen(window, "beforeunload", () => {
            if (state.exporting) {
                /*
                 * Navigatè a ka mande konfimasyon.
                 * Li pa posib garanti ekspòtasyon an ap kontinye
                 * si itilizatè a fèmen paj la.
                 */
                state.exportCancelled = true;
            }
        });
    }


    /* ========================================================
       41. DÉMARRAGE PRINCIPAL
    ======================================================== */

    async function initializeFilm() {
        loadSettings();

        installAllControls();

        setText(el.totalTime, formatTime(CONFIG.duration));

        setText(el.timelineEnd, formatTime(CONFIG.duration));

        setText(el.timelineStart, "00:00");

        setText(el.timelineSceneCount, "0 / 12 sèn");

        setHidden(el.error, true);

        setHidden(el.pauseOverlay, true);

        setHidden(el.dialogueBox, true);

        setHidden(el.exportProgressPanel, true);

        setHidden(el.exportResult, true);

        setLoadingProgress(
            0,
            "Preparasyon estidyo sinematik la..."
        );

        try {
            await initializeEngine();

            state.ready = true;

            state.started = false;

            state.playing = false;

            setHidden(el.loading, false);

            setHidden(el.error, true);

            setHidden(el.pauseOverlay, true);

            el.start.disabled = false;

            renderSceneInformation();

            updateTimeline();

            updatePlaybackButtons();

            showToast(
                "FOBAS CINÉMA 3D pare. Peze KÒMANSE FIM NAN."
            );
        } catch (error) {
            showFatalError(error);
        }
    }


    /* ========================================================
       42. LANCEMENT
    ======================================================== */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeFilm,
            { once: true }
        );
    } else {
        initializeFilm();
    }


    /* ========================================================
       43. INTERFACE DE CONTRÔLE OPTIONNELLE
       Pour diagnostic ou intégration future.
    ======================================================== */

    window.FOBASCinema3D = Object.freeze({
        play: playFilm,

        pause: pauseFilm,

        toggle: togglePlayPause,

        restart: restartFilm,

        nextScene,

        previousScene,

        seek: seekTo,

        nextDialogue,

        toggleCaptions,

        getState() {
            return {
                ready: state.ready,

                started: state.started,

                playing: state.playing,

                exporting: state.exporting,

                currentTime: state.currentTime,

                duration: CONFIG.duration,

                sceneIndex: state.sceneIndex,

                sceneCount: SCENES.length,

                playbackSpeed: state.playbackSpeed,

                graphics: state.graphics
            };
        }
    });

})();