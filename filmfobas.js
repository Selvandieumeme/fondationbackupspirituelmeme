/* ============================================================
   FOBAS CINÉMA 3D — DE KÈ, YON SÈL DESTIN
   JavaScript principal — Version 1.0.0

   Moteur 3D : PlayCanvas 2.23.2
   Chargement : ES MODULE + import() dynamique
   Durée : 20 minutes
   Scènes : 12 × 100 secondes
   Personnages : Mikaël et Nadia
   Export vidéo : MediaRecorder + canvas.captureStream()
   Compatible avec filmfobas.html

   Remarque :
   Le format MP4 dépend du navigateur et de MediaRecorder.
   WebM est proposé si MP4 n'est pas pris en charge.
============================================================ */

(() => {
    "use strict";

    /* ========================================================
       1. PROTECTION CONTRE LES INITIALISATIONS MULTIPLES
    ======================================================== */

    if (window.__FOBAS_CINEMA_INITIALIZED__) {
        return;
    }

    window.__FOBAS_CINEMA_INITIALIZED__ = true;

    /* ========================================================
       2. CONFIGURATION
    ======================================================== */

    const CONFIG = Object.freeze({
        appName: "FOBAS CINÉMA 3D",
        version: "1.0.0",

        engine: "playcanvas",
        engineVersion: "2.23.2",

        duration: 20 * 60,
        sceneCount: 12,
        sceneDuration: 100,

        characters: {
            male: "Mikaël",
            female: "Nadia"
        },

        databaseName: "FOBAS_CINEMA_3D_DB",

        engineURL:
            "https://cdn.jsdelivr.net/npm/playcanvas@2.23.2/build/playcanvas.mjs",

        defaultGraphics: "high",
        defaultSpeed: 1,

        maxDelta: 0.05,
        cameraDistance: 12
    });

    /* ========================================================
       3. OUTILS DOM
    ======================================================== */

    const $ = (id) => document.getElementById(id);

    const dom = {
        app: $("filmApp"),
        header: $("filmHeader"),
        main: $("filmMain"),

        stage: $("cinemaStage"),
        canvas: $("filmCanvas"),

        loadingScreen: $("loadingScreen"),
        loadingMessage: $("loadingMessage"),
        loadingProgress: $("loadingProgress"),
        loadingPercent: $("loadingPercent"),
        btnStartFilm: $("btnStartFilm"),

        errorScreen: $("errorScreen"),
        errorMessage: $("errorMessage"),
        btnRetry: $("btnRetry"),

        btnFullscreen: $("btnFullscreen"),
        btnSettings: $("btnSettings"),

        sceneTitle: $("sceneTitle"),
        sceneNumber: $("sceneNumber"),
        sceneName: $("sceneName"),
        sceneLocation: $("sceneLocation"),

        dialogueBox: $("dialogueBox"),
        dialogueAvatar: $("dialogueAvatar"),
        dialogueSpeaker: $("dialogueSpeaker"),
        dialogueIndex: $("dialogueIndex"),
        dialogueText: $("dialogueText"),
        btnNextDialogue: $("btnNextDialogue"),

        cinemaOverlay: $("cinemaOverlay"),
        playbackStatus: $("playbackStatus"),
        qualityIndicator: $("qualityIndicator"),
        renderIndicator: $("renderIndicator"),
        currentSceneLabel: $("currentSceneLabel"),
        currentLocationLabel: $("currentLocationLabel"),

        pauseOverlay: $("pauseOverlay"),
        btnResumeCenter: $("btnResumeCenter"),

        performanceNotice: $("performanceNotice"),

        filmTitle: $("filmTitle"),
        filmDescription: $("filmDescription"),

        timelinePanel: $("timelinePanel"),
        timelineTrack: $("timelineTrack"),
        timelineProgress: $("timelineProgress"),
        timelineMarkers: $("timelineMarkers"),
        timelineSceneCount: $("timelineSceneCount"),
        currentTime: $("currentTime"),
        totalTime: $("totalTime"),
        timelineStart: $("timelineStart"),
        timelineEnd: $("timelineEnd"),
        timelineStatus: $("timelineStatus"),

        btnPreviousScene: $("btnPreviousScene"),
        btnRewind: $("btnRewind"),
        btnPlayPause: $("btnPlayPause"),
        btnForward: $("btnForward"),
        btnNextScene: $("btnNextScene"),

        playbackSpeed: $("playbackSpeed"),
        btnCaptions: $("btnCaptions"),
        btnRestart: $("btnRestart"),

        sceneList: $("sceneList"),
        sceneListCount: $("sceneListCount"),

        exportResolution: $("exportResolution"),
        exportFrameRate: $("exportFrameRate"),
        exportFormat: $("exportFormat"),

        btnExportVideo: $("btnExportVideo"),
        btnCancelExport: $("btnCancelExport"),

        exportProgressPanel: $("exportProgressPanel"),
        exportStatus: $("exportStatus"),
        exportPercent: $("exportPercent"),
        exportProgressBar: $("exportProgressBar"),
        exportDetails: $("exportDetails"),

        exportResult: $("exportResult"),
        exportResultTitle: $("exportResultTitle"),
        exportResultMessage: $("exportResultMessage"),
        btnDownloadVideo: $("btnDownloadVideo"),

        settingsDialog: $("settingsDialog"),
        btnCloseSettings: $("btnCloseSettings"),
        settingCaptions: $("settingCaptions"),
        settingCameraMotion: $("settingCameraMotion"),
        settingGraphics: $("settingGraphics"),
        settingMobile: $("settingMobile"),
        btnSaveSettings: $("btnSaveSettings"),

        filmToast: $("filmToast")
    };

    /* ========================================================
       4. VALIDATION DES ÉLÉMENTS HTML
    ======================================================== */

    const requiredElements = [
        "app",
        "stage",
        "canvas",
        "loadingScreen",
        "loadingMessage",
        "loadingProgress",
        "loadingPercent",
        "btnStartFilm",
        "errorScreen",
        "errorMessage",
        "btnRetry",
        "sceneNumber",
        "sceneName",
        "sceneLocation",
        "dialogueBox",
        "dialogueSpeaker",
        "dialogueIndex",
        "dialogueText",
        "btnNextDialogue",
        "pauseOverlay",
        "btnResumeCenter",
        "timelineTrack",
        "timelineProgress",
        "timelineMarkers",
        "timelineSceneCount",
        "currentTime",
        "totalTime",
        "timelineStatus",
        "btnPreviousScene",
        "btnRewind",
        "btnPlayPause",
        "btnForward",
        "btnNextScene",
        "playbackSpeed",
        "btnCaptions",
        "btnRestart",
        "sceneList",
        "btnExportVideo",
        "btnCancelExport",
        "settingsDialog",
        "filmToast"
    ];

    const missingElements = requiredElements.filter(
        (key) => !dom[key]
    );

    if (missingElements.length > 0) {
        console.error(
            "[FOBAS CINÉMA] Éléments HTML manquants :",
            missingElements
        );

        window.__FOBAS_CINEMA_INITIALIZED__ = false;

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
            description:
                "Mikaël rankontre Nadia nan yon plas piblik.",
            dialogues: [
                {
                    speaker: "NARATÈ",
                    avatar: "♥",
                    text:
                        "Gen kèk rankont ki sanble òdinè, men ki kapab chanje tout lavi yon moun."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Eskize m, mwen espere mwen pa deranje w. Mwen te jis vle di w bonjou."
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Bonjou. Ou pa deranje m ditou. Mwen kontan fè konesans avè w."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Mwen rele Mikaël. E ou menm?"
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Mwen se Nadia. Petèt se yon bèl kòmansman pou yon nouvo istwa."
                }
            ]
        },
        {
            name: "Premye konvèsasyon",
            location: "Nan jaden an",
            environment: "garden",
            description:
                "De jèn moun kòmanse dekouvri youn lòt.",
            dialogues: [
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Mwen renmen kote ki trankil, kote moun kapab pale san prese."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Mwen menm tou. Mwen kwè yon bon konvèsasyon kapab fè yon jounen vin espesyal."
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Sa fè lontan mwen pa rankontre yon moun ki pale konsa."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Mwen ta renmen konnen plis sou ou, si ou dakò."
                }
            ]
        },
        {
            name: "Yon ti mache ansanm",
            location: "Sou yon bèl chemen",
            environment: "road",
            description:
                "Mikaël ak Nadia mache ansanm pandan y ap pale.",
            dialogues: [
                {
                    speaker: "NARATÈ",
                    avatar: "♥",
                    text:
                        "Pafwa, se lè de moun pran tan pou yo mache ansanm yo kòmanse konprann youn lòt."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Mwen pa t planifye jounen sa a konsa, men mwen kontan mwen rankontre w."
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Mwen menm tou. Konpayi w fè m santi m alèz."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Ann kontinye mache. Mwen ta renmen moman sa a dire yon ti kras plis."
                }
            ]
        },
        {
            name: "Yon envitasyon espesyal",
            location: "Devan yon ti restoran",
            environment: "restaurant",
            description:
                "Mikaël envite Nadia pataje yon repa avè l.",
            dialogues: [
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Nadia, èske ou ta renmen nou manje ansanm nan restoran sa a?"
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Sa se yon bèl lide. Mwen kontan ou envite m."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Mwen vle nou pase yon bon moman, san okenn presyon."
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Se egzakteman jan mwen renmen bagay yo kòmanse."
                }
            ]
        },
        {
            name: "Yon repa ki gen sans",
            location: "Anndan restoran an",
            environment: "restaurantInside",
            description:
                "Pandan repa a, yo pataje rèv ak eksperyans yo.",
            dialogues: [
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Mwen reve bati yon lavi kote respè ak konfyans toujou gen plas yo."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Se menm kalite lavi sa a mwen ta renmen bati."
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Mwen kwè lanmou dwe kòmanse ak amitye ak respè."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Mwen dakò. Se pa bèl pawòl sèlman, se aksyon ki montre sa."
                }
            ]
        },
        {
            name: "Yon apremidi bò lanmè",
            location: "Sou plaj la",
            environment: "beach",
            description:
                "Yo pase yon moman trankil pandan solèy la ap desann.",
            dialogues: [
                {
                    speaker: "NARATÈ",
                    avatar: "♥",
                    text:
                        "Bò lanmè a, bri vag yo te sanble ak mizik ki t ap akonpaye konvèsasyon yo."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Mwen renmen jan ou kapab apresye ti bagay ki senp yo."
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Se ti bagay sa yo ki konn bay lavi plis valè."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Mwen ta renmen nou sonje bèl moman sa a."
                }
            ]
        },
        {
            name: "Yon konfyans k ap grandi",
            location: "Nan yon jaden flè",
            environment: "flowers",
            description:
                "Yo kòmanse pale pi ouvètman sou santiman yo.",
            dialogues: [
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Mikaël, mwen santi mwen kapab pale avè w san mwen pa bezwen kache sa m panse."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Mwen vle ou toujou santi ou lib pou w di m laverite."
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Konfyans pa bati nan yon sèl jou. Li mande pasyans."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Mwen pare pou m pran tan sa a."
                }
            ]
        },
        {
            name: "Yon ti moman tandrès",
            location: "Sou yon ban nan jaden an",
            environment: "garden",
            description:
                "Yo pataje yon moman tandrès ak respè.",
            dialogues: [
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Mwen pa vle prese anyen. Mwen vle chak etap fèt ak respè."
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Sa fè m plezi. Mwen renmen lè santiman yo grandi natirèlman."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Èske mwen kapab pran men w?"
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Wi, Mikaël."
                }
            ]
        },
        {
            name: "Yon defi nan lavi",
            location: "Sou yon wout nan vil la",
            environment: "road",
            description:
                "Yo dekouvri lanmou mande pasyans lè difikilte parèt.",
            dialogues: [
                {
                    speaker: "NARATÈ",
                    avatar: "♥",
                    text:
                        "Lavi pa toujou mache jan nou espere. Se nan moman difisil yo nou dekouvri fòs relasyon nou."
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Gen bagay nan lavi mwen ki fè m pè pafwa."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Ou pa oblije pote tout chay la poukont ou."
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Mwen apresye lefèt ke ou koute m san ou pa jije m."
                }
            ]
        },
        {
            name: "Yon pwomès sensè",
            location: "Nan yon bèl lakou",
            environment: "garden",
            description:
                "Yo pale sou lavni ak angajman yo anvizaje.",
            dialogues: [
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Mwen pa ka pwomèt lavi ap toujou fasil, men mwen kapab pwomèt pou m aji avèk senserite."
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Mwen pa mande pèfeksyon. Mwen mande respè, laverite ak fidelite."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Se sou fondasyon sa yo mwen ta renmen konstwi relasyon nou."
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Ann kontinye aprann youn nan men lòt."
                }
            ]
        },
        {
            name: "Lavni devan nou",
            location: "Devan yon bèl kay",
            environment: "house",
            description:
                "Mikaël ak Nadia imajine pwojè yo ta renmen reyalize.",
            dialogues: [
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Mwen ta renmen nou bati yon kay ki chaje ak lapè, lajwa ak respè."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Epi pou nou toujou jwenn tan pou n koute youn lòt."
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Mwen ta renmen nou soutni rèv youn lòt."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Nou kapab fè anpil bagay ansanm si nou kontinye travay ak pasyans."
                }
            ]
        },
        {
            name: "De kè, yon sèl destin",
            location: "Yon bèl solèy k ap kouche",
            environment: "sunset",
            description:
                "Istwa a fini sou espwa, respè ak yon lanmou k ap grandi.",
            dialogues: [
                {
                    speaker: "NARATÈ",
                    avatar: "♥",
                    text:
                        "Yon bèl istwa pa toujou kòmanse ak gwo evènman. Pafwa, li kòmanse ak yon senp bonjou."
                },
                {
                    speaker: "Mikaël",
                    avatar: "M",
                    text:
                        "Nadia, mwen kontan lavi te ban nou chans pou n rankontre."
                },
                {
                    speaker: "Nadia",
                    avatar: "N",
                    text:
                        "Mwen menm tou, Mikaël. Ann kontinye avanse ansanm, ak respè ak konfyans."
                },
                {
                    speaker: "NARATÈ",
                    avatar: "♥",
                    text:
                        "De moun, de rèv, de kè ki aprann mache ansanm. De Kè, Yon Sèl Destin."
                }
            ]
        }
    ];

    /* ========================================================
       6. ÉTAT DE L'APPLICATION
    ======================================================== */

    const state = {
        engineModule: null,
        app: null,

        initialized: false,
        initializing: false,

        playing: false,
        paused: false,
        ended: false,

        currentTime: 0,
        currentScene: 0,
        currentDialogue: 0,

        playbackSpeed: 1,

        captionsEnabled: true,
        cameraMotion: true,
        graphicsQuality: "high",
        mobileControls: true,

        sceneEntities: [],
        characters: {},
        environmentEntities: [],

        camera: null,
        cameraTarget: null,

        exportRecorder: null,
        exportStream: null,
        exportChunks: [],
        exportCancelled: false,
        exportBusy: false,

        toastTimer: null,
        lastFrameTime: 0,

        savedCameraPosition: null,
        lastScene: -1,

        listenersAttached: false
    };

    /* ========================================================
       7. OUTILS GÉNÉRAUX
    ======================================================== */

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function formatTime(seconds) {
        const safe = Math.max(0, Math.floor(seconds));

        const minutes = Math.floor(safe / 60);
        const secs = safe % 60;

        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(secs).padStart(2, "0")
        );
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        }

        if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + " KB";
        }

        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    function showToast(message, duration = 2800) {
        if (!dom.filmToast) return;

        dom.filmToast.textContent = message;
        dom.filmToast.hidden = false;

        clearTimeout(state.toastTimer);

        state.toastTimer = setTimeout(() => {
            dom.filmToast.hidden = true;
        }, duration);
    }

    function setLoading(percent, message) {
        const value = clamp(Number(percent) || 0, 0, 100);

        dom.loadingProgress.style.width = value + "%";
        dom.loadingPercent.textContent = Math.round(value) + "%";

        const progressTrack =
            dom.loadingProgress.parentElement;

        if (progressTrack) {
            progressTrack.setAttribute(
                "aria-valuenow",
                String(Math.round(value))
            );
        }

        if (message) {
            dom.loadingMessage.textContent = message;
        }
    }

    function showError(error) {
        console.error("[FOBAS CINÉMA]", error);

        const message =
            error instanceof Error
                ? error.message
                : String(error || "Erè enkoni.");

        dom.errorMessage.textContent =
            "Detay teknik: " + message;

        dom.errorScreen.hidden = false;
        dom.loadingScreen.hidden = true;

        dom.btnStartFilm.disabled = true;

        state.initializing = false;

        if (dom.playbackStatus) {
            dom.playbackStatus.textContent = "ERÈ";
        }
    }

    function getSceneIndexFromTime(time) {
        return clamp(
            Math.floor(time / CONFIG.sceneDuration),
            0,
            CONFIG.sceneCount - 1
        );
    }

    /* ========================================================
       8. STOCKAGE LOCAL DES PARAMÈTRES
    ======================================================== */

    function loadSettings() {
        try {
            const raw = localStorage.getItem(
                CONFIG.databaseName + "_SETTINGS"
            );

            if (!raw) return;

            const saved = JSON.parse(raw);

            if (typeof saved.captionsEnabled === "boolean") {
                state.captionsEnabled = saved.captionsEnabled;
            }

            if (typeof saved.cameraMotion === "boolean") {
                state.cameraMotion = saved.cameraMotion;
            }

            if (
                ["high", "medium", "low"].includes(
                    saved.graphicsQuality
                )
            ) {
                state.graphicsQuality = saved.graphicsQuality;
            }

            if (typeof saved.mobileControls === "boolean") {
                state.mobileControls = saved.mobileControls;
            }

        } catch (error) {
            console.warn(
                "[FOBAS CINÉMA] Paramètres non chargés :",
                error
            );
        }

        dom.settingCaptions.checked =
            state.captionsEnabled;

        dom.settingCameraMotion.checked =
            state.cameraMotion;

        dom.settingGraphics.value =
            state.graphicsQuality;

        dom.settingMobile.checked =
            state.mobileControls;

        dom.btnCaptions.setAttribute(
            "aria-pressed",
            String(state.captionsEnabled)
        );
    }

    function saveSettings() {
        state.captionsEnabled =
            dom.settingCaptions.checked;

        state.cameraMotion =
            dom.settingCameraMotion.checked;

        state.graphicsQuality =
            dom.settingGraphics.value;

        state.mobileControls =
            dom.settingMobile.checked;

        try {
            localStorage.setItem(
                CONFIG.databaseName + "_SETTINGS",
                JSON.stringify({
                    captionsEnabled: state.captionsEnabled,
                    cameraMotion: state.cameraMotion,
                    graphicsQuality: state.graphicsQuality,
                    mobileControls: state.mobileControls
                })
            );
        } catch (error) {
            console.warn(
                "[FOBAS CINÉMA] Paramètres non sauvegardés :",
                error
            );
        }

        dom.btnCaptions.setAttribute(
            "aria-pressed",
            String(state.captionsEnabled)
        );

        dom.dialogueBox.hidden =
            !state.captionsEnabled ||
            !state.playing ||
            !state.characters.male;

        if (state.app) {
            applyGraphicsQuality();
        }

        if (dom.settingsDialog.open) {
            dom.settingsDialog.close();
        }

        showToast("Paramèt yo sove.");
    }

    /* ========================================================
       9. CHARGEMENT DYNAMIQUE DE PLAYCANVAS
    ======================================================== */

    async function loadPlayCanvas() {
        setLoading(8, "Chajman motè PlayCanvas 3D...");

        const pc = await import(CONFIG.engineURL);

        if (!pc || !pc.Application || !pc.Entity) {
            throw new Error(
                "PlayCanvas pa t ekspòte eleman ki nesesè yo."
            );
        }

        state.engineModule = pc;

        setLoading(18, "Motè 3D a chaje.");

        return pc;
    }

    /* ========================================================
       10. CRÉATION DU MOTEUR 3D
    ======================================================== */

    function createEngine(pc) {
        const canvas = dom.canvas;

        canvas.width = Math.max(
            320,
            canvas.clientWidth || window.innerWidth
        );

        canvas.height = Math.max(
            240,
            canvas.clientHeight || 500
        );

        const options = {
            graphicsDeviceOptions: {
                alpha: false,
                antialias: true,
                depth: true,
                stencil: false,
                powerPreference: "high-performance"
            }
        };

        const app = new pc.Application(canvas, options);

        app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        app.setCanvasResolution(pc.RESOLUTION_AUTO);

        app.scene.ambientLight = new pc.Color(
            0.48,
            0.48,
            0.52
        );

        app.scene.gammaCorrection = pc.GAMMA_SRGB;
        app.scene.toneMapping = pc.TONEMAP_FILMIC;

        state.app = app;

        app.start();

        configureRenderer();

        return app;
    }

    function configureRenderer() {
        if (!state.app) return;

        const pc = state.engineModule;

        const canvas = dom.canvas;

        if (state.graphicsQuality === "low") {
            canvas.style.imageRendering = "auto";
        }

        if (pc && state.camera) {
            state.camera.camera.fov = 45;
        }

        applyGraphicsQuality();
    }

    function applyGraphicsQuality() {
        if (!state.app) return;

        const quality = state.graphicsQuality;

        if (dom.qualityIndicator) {
            dom.qualityIndicator.textContent =
                quality === "high"
                    ? "3D HD"
                    : quality === "medium"
                        ? "3D"
                        : "3D ECO";
        }

        if (quality === "low") {
            dom.performanceNotice.textContent =
                "Mòd grafik ekonomik aktif pou amelyore pèfòmans.";
            dom.performanceNotice.hidden = false;
        } else {
            dom.performanceNotice.hidden = true;
        }
    }

    /* ========================================================
       11. MATÉRIAUX ET OBJETS 3D
    ======================================================== */

    function makeMaterial(color, options = {}) {
        const pc = state.engineModule;

        const material = new pc.StandardMaterial();

        material.diffuse = new pc.Color(
            color[0],
            color[1],
            color[2]
        );

        if (options.emissive) {
            material.emissive = new pc.Color(
                options.emissive[0],
                options.emissive[1],
                options.emissive[2]
            );
        }

        if (options.metalness !== undefined) {
            material.metalness = options.metalness;
        }

        if (options.gloss !== undefined) {
            material.gloss = options.gloss;
        }

        material.update();

        return material;
    }

    function createEntity(name, parent = null) {
        const pc = state.engineModule;

        const entity = new pc.Entity(name);

        (parent || state.app.root).addChild(entity);

        state.sceneEntities.push(entity);

        return entity;
    }

    function createPrimitive(
        name,
        type,
        position,
        scale,
        material,
        parent = null
    ) {
        const pc = state.engineModule;

        const entity = createEntity(name, parent);

        entity.addComponent("render", {
            type: type
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

        if (material) {
            entity.render.material = material;
        }

        return entity;
    }

    /* ========================================================
       12. ÉCLAIRAGE CINÉMATOGRAPHIQUE
    ======================================================== */

    function createLighting() {
        const pc = state.engineModule;

        const sun = createEntity("FOBAS_SUN_LIGHT");

        sun.addComponent("light", {
            type: "directional",
            color: new pc.Color(1, 0.87, 0.69),
            intensity: 1.8,
            castShadows: state.graphicsQuality === "high"
        });

        sun.setEulerAngles(45, 35, 0);

        const fill = createEntity("FOBAS_FILL_LIGHT");

        fill.addComponent("light", {
            type: "omni",
            color: new pc.Color(0.55, 0.68, 1),
            intensity: 0.55,
            range: 30
        });

        fill.setPosition(-5, 5, 5);

        const ambient = createEntity("FOBAS_AMBIENT_LIGHT");

        ambient.addComponent("light", {
            type: "omni",
            color: new pc.Color(1, 0.75, 0.55),
            intensity: 0.35,
            range: 25
        });

        ambient.setPosition(4, 3, -5);
    }

    /* ========================================================
       13. CAMÉRA 3D
    ======================================================== */

    function createCamera() {
        const pc = state.engineModule;

        const camera = createEntity("FOBAS_CINEMA_CAMERA");

        camera.addComponent("camera", {
            clearColor: new pc.Color(
                0.24,
                0.43,
                0.62
            ),

            fov: 45,
            nearClip: 0.1,
            farClip: 300,

            frustumCulling: true
        });

        camera.setPosition(0, 4.4, 12);
        camera.lookAt(0, 1.6, 0);

        state.camera = camera;
        state.cameraTarget = new pc.Vec3(0, 1.6, 0);

        return camera;
    }

    /* ========================================================
       14. SOL, CIEL ET DÉCOR
    ======================================================== */

    function clearSceneEntities() {
        for (const entity of state.sceneEntities) {
            if (
                entity &&
                entity.parent &&
                !entity.destroyed
            ) {
                entity.destroy();
            }
        }

        state.sceneEntities = [];
        state.environmentEntities = [];
        state.characters = {};
    }

    function createGround(color = [0.25, 0.48, 0.27]) {
        const pc = state.engineModule;

        const groundMaterial = makeMaterial(color);

        const ground = createPrimitive(
            "FOBAS_GROUND",
            "plane",
            [0, 0, 0],
            [80, 1, 80],
            groundMaterial
        );

        ground.setEulerAngles(-90, 0, 0);

        const skyMaterial = makeMaterial(
            [0.38, 0.64, 0.86],
            {
                emissive: [0.12, 0.18, 0.25]
            }
        );

        const sky = createPrimitive(
            "FOBAS_SKY",
            "sphere",
            [0, 0, 0],
            [180, 180, 180],
            skyMaterial
        );

        sky.render.cull = pc.CULLFACE_FRONT;

        sky.render.castShadows = false;
        sky.render.receiveShadows = false;

        sky.render.material = skyMaterial;

        const trees = makeMaterial([0.12, 0.34, 0.17]);
        const trunk = makeMaterial([0.34, 0.21, 0.12]);

        for (let i = 0; i < 9; i++) {
            const x = (i - 4) * 5;

            createPrimitive(
                "FOBAS_TREE_TRUNK_" + i,
                "cylinder",
                [x, 1.2, -8 - (i % 3)],
                [0.35, 2.4, 0.35],
                trunk
            );

            createPrimitive(
                "FOBAS_TREE_TOP_" + i,
                "cone",
                [x, 3.3, -8 - (i % 3)],
                [2.0, 3.2, 2.0],
                trees
            );
        }
    }

    function createPark() {
        createGround([0.20, 0.43, 0.24]);

        const benchMaterial = makeMaterial([0.35, 0.19, 0.10]);
        const metalMaterial = makeMaterial([0.22, 0.25, 0.28]);

        createPrimitive(
            "PARK_BENCH_SEAT",
            "box",
            [2.3, 0.7, -1],
            [2.2, 0.16, 0.6],
            benchMaterial
        );

        createPrimitive(
            "PARK_BENCH_BACK",
            "box",
            [2.3, 1.2, -1.25],
            [2.2, 0.8, 0.15],
            benchMaterial
        );

        for (let i = 0; i < 4; i++) {
            createPrimitive(
                "PARK_BENCH_LEG_" + i,
                "box",
                [
                    1.5 + (i % 2) * 1.6,
                    0.35,
                    -1.1 + Math.floor(i / 2) * 0.25
                ],
                [0.12, 0.7, 0.12],
                metalMaterial
            );
        }
    }

    function createRoad() {
        createGround([0.26, 0.39, 0.25]);

        const roadMaterial = makeMaterial([0.22, 0.23, 0.25]);
        const lineMaterial = makeMaterial([0.95, 0.83, 0.35]);

        createPrimitive(
            "FOBAS_ROAD",
            "box",
            [0, 0.02, -2],
            [8, 0.08, 45],
            roadMaterial
        );

        for (let i = 0; i < 9; i++) {
            createPrimitive(
                "ROAD_LINE_" + i,
                "box",
                [0, 0.08, -20 + i * 5],
                [0.14, 0.02, 2.2],
                lineMaterial
            );
        }
    }

    function createRestaurant() {
        createGround([0.38, 0.30, 0.22]);

        const wall = makeMaterial([0.75, 0.56, 0.37]);
        const roof = makeMaterial([0.32, 0.13, 0.11]);
        const glass = makeMaterial(
            [0.18, 0.52, 0.72],
            { gloss: 80 }
        );

        createPrimitive(
            "RESTAURANT_BUILDING",
            "box",
            [0, 2, -8],
            [12, 4, 4],
            wall
        );

        createPrimitive(
            "RESTAURANT_ROOF",
            "box",
            [0, 4.2, -8],
            [13, 0.45, 4.8],
            roof
        );

        for (let i = 0; i < 3; i++) {
            createPrimitive(
                "RESTAURANT_WINDOW_" + i,
                "box",
                [-3.5 + i * 3.5, 2.5, -5.96],
                [1.6, 1.5, 0.08],
                glass
            );
        }

        const table = makeMaterial([0.34, 0.18, 0.09]);

        createPrimitive(
            "RESTAURANT_TABLE",
            "cylinder",
            [0, 1.1, 1],
            [1.5, 0.14, 1.5],
            table
        );

        for (let i = 0; i < 4; i++) {
            const angle = i * Math.PI / 2;

            createPrimitive(
                "RESTAURANT_CHAIR_" + i,
                "box",
                [
                    Math.cos(angle) * 2,
                    0.6,
                    1 + Math.sin(angle) * 2
                ],
                [0.8, 1.0, 0.8],
                table
            );
        }
    }

    function createBeach() {
        createGround([0.80, 0.69, 0.46]);

        const seaMaterial = makeMaterial(
            [0.04, 0.40, 0.68],
            { gloss: 90 }
        );

        createPrimitive(
            "FOBAS_OCEAN",
            "plane",
            [0, -0.08, -18],
            [80, 1, 35],
            seaMaterial
        ).setEulerAngles(-90, 0, 0);

        const sunMaterial = makeMaterial(
            [1, 0.62, 0.22],
            {
                emissive: [0.8, 0.32, 0.08]
            }
        );

        createPrimitive(
            "FOBAS_SUNSET_SUN",
            "sphere",
            [0, 10, -25],
            [3.0, 3.0, 3.0],
            sunMaterial
        );
    }

    function createHouse() {
        createGround([0.25, 0.40, 0.24]);

        const wall = makeMaterial([0.83, 0.72, 0.55]);
        const roof = makeMaterial([0.45, 0.15, 0.12]);
        const door = makeMaterial([0.24, 0.12, 0.07]);

        createPrimitive(
            "FOBAS_HOUSE",
            "box",
            [0, 2, -7],
            [9, 4, 4],
            wall
        );

        createPrimitive(
            "FOBAS_HOUSE_ROOF",
            "cone",
            [0, 5.1, -7],
            [7.4, 2.5, 5],
            roof
        );

        createPrimitive(
            "FOBAS_HOUSE_DOOR",
            "box",
            [0, 1.15, -4.94],
            [1.3, 2.3, 0.12],
            door
        );
    }

    function createEnvironment(environment) {
        switch (environment) {
            case "road":
                createRoad();
                break;

            case "restaurant":
            case "restaurantInside":
                createRestaurant();
                break;

            case "beach":
            case "sunset":
                createBeach();
                break;

            case "house":
                createHouse();
                break;

            case "flowers":
                createGround([0.18, 0.42, 0.22]);

                for (let i = 0; i < 24; i++) {
                    const x = (Math.random() - 0.5) * 18;
                    const z = (Math.random() - 0.5) * 18;

                    const flowerMaterial = makeMaterial([
                        0.65 + Math.random() * 0.3,
                        0.15 + Math.random() * 0.3,
                        0.35 + Math.random() * 0.4
                    ]);

                    createPrimitive(
                        "FOBAS_FLOWER_" + i,
                        "sphere",
                        [x, 0.25, z],
                        [0.22, 0.22, 0.22],
                        flowerMaterial
                    );
                }
                break;

            default:
                createPark();
                break;
        }
    }

    /* ========================================================
       15. PERSONNAGES 3D PROCÉDURAUX
    ======================================================== */

    function createCharacter(name, options = {}) {
        const pc = state.engineModule;

        const root = createEntity(name + "_ROOT");

        const skin = makeMaterial(
            options.skin || [0.55, 0.32, 0.20]
        );

        const shirt = makeMaterial(
            options.shirt || [0.12, 0.32, 0.78]
        );

        const trousers = makeMaterial(
            options.trousers || [0.12, 0.14, 0.20]
        );

        const hair = makeMaterial(
            options.hair || [0.10, 0.07, 0.05]
        );

        const shoes = makeMaterial([0.08, 0.07, 0.06]);

        const body = createPrimitive(
            name + "_BODY",
            "capsule",
            [0, 1.35, 0],
            [0.72, 1.1, 0.55],
            shirt,
            root
        );

        const head = createPrimitive(
            name + "_HEAD",
            "sphere",
            [0, 2.25, 0],
            [0.58, 0.62, 0.56],
            skin,
            root
        );

        createPrimitive(
            name + "_HAIR",
            "sphere",
            [0, 2.53, 0],
            [0.60, 0.28, 0.58],
            hair,
            root
        );

        const leftArm = createPrimitive(
            name + "_ARM_LEFT",
            "capsule",
            [-0.52, 1.48, 0],
            [0.22, 0.80, 0.22],
            skin,
            root
        );

        const rightArm = createPrimitive(
            name + "_ARM_RIGHT",
            "capsule",
            [0.52, 1.48, 0],
            [0.22, 0.80, 0.22],
            skin,
            root
        );

        const leftLeg = createPrimitive(
            name + "_LEG_LEFT",
            "capsule",
            [-0.20, 0.48, 0],
            [0.26, 0.90, 0.28],
            trousers,
            root
        );

        const rightLeg = createPrimitive(
            name + "_LEG_RIGHT",
            "capsule",
            [0.20, 0.48, 0],
            [0.26, 0.90, 0.28],
            trousers,
            root
        );

        createPrimitive(
            name + "_SHOE_LEFT",
            "box",
            [-0.20, 0.08, 0.10],
            [0.32, 0.16, 0.50],
            shoes,
            root
        );

        createPrimitive(
            name + "_SHOE_RIGHT",
            "box",
            [0.20, 0.08, 0.10],
            [0.32, 0.16, 0.50],
            shoes,
            root
        );

        const character = {
            name,
            root,
            body,
            head,
            leftArm,
            rightArm,
            leftLeg,
            rightLeg,

            basePosition: new pc.Vec3(0, 0, 0),

            phase: Math.random() * Math.PI * 2,

            walkAmplitude: 0,

            targetX: 0,
            targetZ: 0
        };

        return character;
    }

    function positionCharacter(character, x, z, yaw = 0) {
        if (!character) return;

        character.root.setPosition(x, 0, z);
        character.root.setEulerAngles(0, yaw, 0);

        character.basePosition.set(x, 0, z);

        character.targetX = x;
        character.targetZ = z;
    }

    function createCharacters() {
        const pc = state.engineModule;

        const male = createCharacter("MIKAEL", {
            skin: [0.49, 0.29, 0.18],
            shirt: [0.10, 0.28, 0.80],
            trousers: [0.12, 0.14, 0.21],
            hair: [0.07, 0.045, 0.025]
        });

        const female = createCharacter("NADIA", {
            skin: [0.61, 0.38, 0.24],
            shirt: [0.78, 0.16, 0.39],
            trousers: [0.22, 0.12, 0.22],
            hair: [0.08, 0.045, 0.025]
        });

        positionCharacter(male, -1.5, 0, 15);
        positionCharacter(female, 1.5, -0.2, -15);

        male.walkAmplitude = 0.05;
        female.walkAmplitude = 0.05;

        state.characters.male = male;
        state.characters.female = female;

        /* Kamera oryante sou pèsonaj yo. */
        state.camera.lookAt(0, 1.6, 0);

        return { male, female };
    }

    /* ========================================================
       16. INITIALISATION D'UNE SCÈNE
    ======================================================== */

    function buildScene(sceneIndex) {
        const index = clamp(
            sceneIndex,
            0,
            SCENES.length - 1
        );

        const scene = SCENES[index];

        clearSceneEntities();

        createLighting();

        createCamera();

        createEnvironment(scene.environment);

        createCharacters();

        state.currentScene = index;
        state.currentDialogue = 0;
        state.lastScene = index;

        updateSceneInformation(index);
        updateDialogue();

        updateCameraPosition(true);

        dom.sceneTitle.style.opacity = "1";

        setTimeout(() => {
            if (dom.sceneTitle) {
                dom.sceneTitle.style.opacity = "0.96";
            }
        }, 50);
    }

    /* ========================================================
       17. INFORMATIONS ET LISTE DES SCÈNES
    ======================================================== */

    function updateSceneInformation(index) {
        const scene = SCENES[index];

        const number = String(index + 1).padStart(2, "0");

        dom.sceneNumber.textContent = "SÈN " + number;

        dom.sceneName.textContent = scene.name;

        dom.sceneLocation.textContent = scene.location;

        dom.currentSceneLabel.textContent =
            "SÈN " + number;

        dom.currentLocationLabel.textContent =
            scene.location.toLocaleUpperCase("ht");

        dom.timelineSceneCount.textContent =
            (index + 1) + " / " + CONFIG.sceneCount + " sèn";

        dom.timelineStatus.textContent =
            state.playing
                ? "Fim nan ap jwe"
                : state.paused
                    ? "Fim nan an poz"
                    : state.ended
                        ? "Fim nan fini"
                        : "Pare pou jwe";

        const buttons = dom.sceneList.querySelectorAll(
            "[data-scene-index]"
        );

        buttons.forEach((button) => {
            const active =
                Number(button.dataset.sceneIndex) === index;

            button.classList.toggle("active", active);

            button.setAttribute(
                "aria-current",
                active ? "true" : "false"
            );
        });
    }

    function createSceneList() {
        dom.sceneList.replaceChildren();

        SCENES.forEach((scene, index) => {
            const button = document.createElement("button");

            button.type = "button";

            button.className = "scene-card";

            button.dataset.sceneIndex = String(index);

            button.setAttribute(
                "aria-label",
                "Jwe sèn " + (index + 1) + ": " + scene.name
            );

            const number = document.createElement("span");

            number.className = "scene-card-number";

            number.textContent =
                String(index + 1).padStart(2, "0");

            const title = document.createElement("strong");

            title.className = "scene-card-title";

            title.textContent = scene.name;

            const location = document.createElement("span");

            location.className = "scene-card-location";

            location.textContent = scene.location;

            button.append(number, title, location);

            button.addEventListener("click", () => {
                seekToScene(index);
            });

            dom.sceneList.appendChild(button);
        });

        dom.sceneListCount.textContent =
            SCENES.length + " SÈN";

        createTimelineMarkers();
    }

    function createTimelineMarkers() {
        dom.timelineMarkers.replaceChildren();

        SCENES.forEach((scene, index) => {
            const marker = document.createElement("button");

            marker.type = "button";

            marker.className = "timeline-marker";

            marker.style.left =
                ((index / CONFIG.sceneCount) * 100) + "%";

            marker.setAttribute(
                "aria-label",
                "Ale nan sèn " + (index + 1) +
                ": " + scene.name
            );

            marker.title = scene.name;

            marker.addEventListener("click", () => {
                seekToScene(index);
            });

            dom.timelineMarkers.appendChild(marker);
        });
    }

    /* ========================================================
       18. SYSTÈME DE DYALÒG
    ======================================================== */

    function updateDialogue() {
        const scene = SCENES[state.currentScene];

        const dialogues = scene.dialogues;

        if (!dialogues || dialogues.length === 0) {
            dom.dialogueBox.hidden = true;
            return;
        }

        state.currentDialogue = clamp(
            state.currentDialogue,
            0,
            dialogues.length - 1
        );

        const dialogue = dialogues[state.currentDialogue];

        dom.dialogueSpeaker.textContent =
            dialogue.speaker;

        dom.dialogueText.textContent =
            dialogue.text;

        dom.dialogueIndex.textContent =
            (state.currentDialogue + 1) +
            " / " +
            dialogues.length;

        if (dom.dialogueAvatar) {
            dom.dialogueAvatar.textContent =
                dialogue.avatar || "♥";
        }

        dom.dialogueBox.hidden =
            !state.captionsEnabled ||
            (!state.playing && !state.paused);
    }

    function nextDialogue() {
        const scene = SCENES[state.currentScene];

        if (!scene || !scene.dialogues) return;

        if (
            state.currentDialogue <
            scene.dialogues.length - 1
        ) {
            state.currentDialogue++;
        } else {
            state.currentDialogue = 0;
        }

        updateDialogue();
    }

    function toggleCaptions() {
        state.captionsEnabled =
            !state.captionsEnabled;

        dom.btnCaptions.setAttribute(
            "aria-pressed",
            String(state.captionsEnabled)
        );

        dom.dialogueBox.hidden =
            !state.captionsEnabled ||
            (!state.playing && !state.paused);

        if (state.captionsEnabled) {
            updateDialogue();
        }

        showToast(
            state.captionsEnabled
                ? "Tèks dyalòg aktive."
                : "Tèks dyalòg dezaktive."
        );
    }

    /* ========================================================
       19. KAMERA AK ANIMASYON
    ======================================================== */

    function updateCameraPosition(force = false) {
        if (!state.camera || !state.characters.male) {
            return;
        }

        const pc = state.engineModule;

        const male = state.characters.male;
        const female = state.characters.female;

        const midX =
            (male.root.getPosition().x +
                female.root.getPosition().x) / 2;

        const midZ =
            (male.root.getPosition().z +
                female.root.getPosition().z) / 2;

        const scene = SCENES[state.currentScene];

        let cameraDistance = CONFIG.cameraDistance;

        if (scene.environment === "restaurantInside") {
            cameraDistance = 10;
        }

        if (scene.environment === "beach") {
            cameraDistance = 14;
        }

        if (scene.environment === "sunset") {
            cameraDistance = 15;
        }

        const targetPosition = new pc.Vec3(
            midX,
            4.1,
            midZ + cameraDistance
        );

        const targetLook = new pc.Vec3(
            midX,
            1.55,
            midZ - 1
        );

        if (force || !state.cameraMotion) {
            state.camera.setPosition(
                targetPosition.x,
                targetPosition.y,
                targetPosition.z
            );

            state.camera.lookAt(targetLook);

            state.cameraTarget = targetLook;

            return;
        }

        const current = state.camera.getPosition();

        const factor = 0.025;

        state.camera.setPosition(
            lerp(current.x, targetPosition.x, factor),
            lerp(current.y, targetPosition.y, factor),
            lerp(current.z, targetPosition.z, factor)
        );

        state.camera.lookAt(targetLook);

        state.cameraTarget = targetLook;
    }

    function animateCharacter(character, time, offset) {
        if (!character) return;

        const phase = time * 2.0 + offset;

        const armSwing = Math.sin(phase) * 10;

        const legSwing = Math.sin(phase) * 12;

        character.leftArm.setEulerAngles(
            armSwing,
            0,
            -8
        );

        character.rightArm.setEulerAngles(
            -armSwing,
            0,
            8
        );

        character.leftLeg.setEulerAngles(
            legSwing,
            0,
            0
        );

        character.rightLeg.setEulerAngles(
            -legSwing,
            0,
            0
        );

        const bodyY = 1.35 + Math.sin(phase * 2) * 0.025;

        character.body.setLocalPosition(
            0,
            bodyY,
            0
        );
    }

    function updateAnimation() {
        if (!state.app || !state.characters.male) {
            return;
        }

        const localTime =
            state.currentTime -
            state.currentScene * CONFIG.sceneDuration;

        animateCharacter(
            state.characters.male,
            localTime,
            0
        );

        animateCharacter(
            state.characters.female,
            localTime,
            Math.PI
        );

        updateCameraPosition(false);
    }

    /* ========================================================
       20. LECTURE DU FILM
    ======================================================== */

    function startFilm() {
        if (!state.initialized || !state.app) {
            showToast("Motè 3D a poko pare.");
            return;
        }

        if (state.ended) {
            state.currentTime = 0;
            state.currentScene = 0;
            state.currentDialogue = 0;

            buildScene(0);
        }

        state.playing = true;
        state.paused = false;
        state.ended = false;

        dom.loadingScreen.hidden = true;
        dom.errorScreen.hidden = true;
        dom.pauseOverlay.hidden = true;

        dom.playbackStatus.textContent = "AP JWE";

        dom.btnPlayPause.textContent = "Ⅱ";

        dom.btnPlayPause.setAttribute(
            "aria-label",
            "Mete fim nan an poz"
        );

        dom.dialogueBox.hidden =
            !state.captionsEnabled;

        updateDialogue();
        updateTimeline();

        showToast("Fim nan kòmanse.");

        state.lastFrameTime = performance.now();
    }

    function pauseFilm() {
        if (!state.playing) return;

        state.playing = false;
        state.paused = true;

        dom.pauseOverlay.hidden = false;

        dom.playbackStatus.textContent = "AN POZ";

        dom.btnPlayPause.textContent = "▶";

        dom.btnPlayPause.setAttribute(
            "aria-label",
            "Kontinye fim nan"
        );

        dom.dialogueBox.hidden =
            !state.captionsEnabled;

        updateTimeline();
    }

    function resumeFilm() {
        if (!state.app) return;

        state.playing = true;
        state.paused = false;
        state.ended = false;

        dom.pauseOverlay.hidden = true;

        dom.loadingScreen.hidden = true;

        dom.playbackStatus.textContent = "AP JWE";

        dom.btnPlayPause.textContent = "Ⅱ";

        dom.btnPlayPause.setAttribute(
            "aria-label",
            "Mete fim nan an poz"
        );

        dom.dialogueBox.hidden =
            !state.captionsEnabled;

        state.lastFrameTime = performance.now();

        updateTimeline();
    }

    function togglePlayPause() {
        if (!state.initialized) {
            showToast("Tanpri tann preparasyon fini.");
            return;
        }

        if (state.playing) {
            pauseFilm();
        } else {
            resumeFilm();
        }
    }

    function finishFilm() {
        state.playing = false;
        state.paused = false;
        state.ended = true;

        state.currentTime = CONFIG.duration;

        dom.pauseOverlay.hidden = true;

        dom.playbackStatus.textContent = "FINI";

        dom.btnPlayPause.textContent = "↻";

        dom.btnPlayPause.setAttribute(
            "aria-label",
            "Rekòmanse fim nan"
        );

        dom.timelineStatus.textContent = "Fim nan fini";

        dom.dialogueSpeaker.textContent = "NARATÈ";

        dom.dialogueText.textContent =
            "Mèsi paske ou te gade FOBAS CINÉMA 3D — De Kè, Yon Sèl Destin.";

        dom.dialogueBox.hidden =
            !state.captionsEnabled;

        updateTimeline();

        showToast("Fim nan fini. Mèsi paske ou te gade li.", 5000);
    }

    function restartFilm() {
        state.currentTime = 0;
        state.currentScene = 0;
        state.currentDialogue = 0;

        state.playing = false;
        state.paused = false;
        state.ended = false;

        buildScene(0);

        dom.loadingScreen.hidden = true;
        dom.pauseOverlay.hidden = true;

        dom.playbackStatus.textContent = "PARE";

        dom.btnPlayPause.textContent = "▶";

        dom.btnPlayPause.setAttribute(
            "aria-label",
            "Jwe fim nan"
        );

        updateTimeline();

        showToast("Fim nan retounen nan kòmansman.");
    }

    /* ========================================================
       21. CHANGEMENT DE SCÈNE
    ======================================================== */

    function seekToScene(index) {
        if (!state.initialized) return;

        const wasPlaying = state.playing;

        const safeIndex = clamp(
            Number(index),
            0,
            CONFIG.sceneCount - 1
        );

        state.currentScene = safeIndex;

        state.currentTime =
            safeIndex * CONFIG.sceneDuration;

        state.currentDialogue = 0;

        state.ended = false;

        buildScene(safeIndex);

        dom.pauseOverlay.hidden = true;

        if (wasPlaying) {
            state.playing = true;
            state.paused = false;

            dom.playbackStatus.textContent = "AP JWE";

            dom.btnPlayPause.textContent = "Ⅱ";
        } else {
            state.playing = false;
            state.paused = false;

            dom.playbackStatus.textContent = "PARE";

            dom.btnPlayPause.textContent = "▶";
        }

        updateTimeline();
    }

    function nextScene() {
        if (
            state.currentScene <
            CONFIG.sceneCount - 1
        ) {
            seekToScene(state.currentScene + 1);
        } else {
            finishFilm();
        }
    }

    function previousScene() {
        if (state.currentScene > 0) {
            seekToScene(state.currentScene - 1);
        } else {
            seekToScene(0);
        }
    }

    function seekSeconds(delta) {
        if (!state.initialized) return;

        const newTime = clamp(
            state.currentTime + delta,
            0,
            CONFIG.duration
        );

        if (newTime >= CONFIG.duration) {
            finishFilm();
            return;
        }

        const oldScene = state.currentScene;

        state.currentTime = newTime;

        const newScene = getSceneIndexFromTime(newTime);

        if (newScene !== oldScene) {
            state.currentScene = newScene;

            state.currentDialogue = 0;

            buildScene(newScene);
        }

        updateTimeline();
    }

    /* ========================================================
       22. MISE À JOUR DE LA LIGNE DE TEMPS
    ======================================================== */

    function updateTimeline() {
        const time = clamp(
            state.currentTime,
            0,
            CONFIG.duration
        );

        const percent =
            (time / CONFIG.duration) * 100;

        dom.timelineProgress.style.width =
            percent + "%";

        dom.timelineTrack.setAttribute(
            "aria-valuenow",
            String(Math.floor(time))
        );

        dom.currentTime.textContent =
            formatTime(time);

        dom.totalTime.textContent =
            formatTime(CONFIG.duration);

        dom.timelineStart.textContent = "00:00";

        dom.timelineEnd.textContent =
            formatTime(CONFIG.duration);

        dom.timelineSceneCount.textContent =
            Math.min(
                CONFIG.sceneCount,
                getSceneIndexFromTime(
                    Math.min(time, CONFIG.duration - 1)
                ) + 1
            ) +
            " / " +
            CONFIG.sceneCount +
            " sèn";

        if (state.playing) {
            dom.timelineStatus.textContent = "Fim nan ap jwe";
        } else if (state.paused) {
            dom.timelineStatus.textContent = "Fim nan an poz";
        } else if (state.ended) {
            dom.timelineStatus.textContent = "Fim nan fini";
        } else {
            dom.timelineStatus.textContent = "Pare pou jwe";
        }
    }

    /* ========================================================
       23. BOUCLE PRINCIPALE
    ======================================================== */

    function frameUpdate() {
        if (!state.app) return;

        const now = performance.now();

        if (!state.lastFrameTime) {
            state.lastFrameTime = now;
        }

        let dt = (now - state.lastFrameTime) / 1000;

        state.lastFrameTime = now;

        dt = clamp(dt, 0, CONFIG.maxDelta);

        if (state.playing) {
            state.currentTime +=
                dt * state.playbackSpeed;

            if (state.currentTime >= CONFIG.duration) {
                finishFilm();
                return;
            }

            const sceneIndex =
                getSceneIndexFromTime(state.currentTime);

            if (sceneIndex !== state.currentScene) {
                state.currentScene = sceneIndex;

                state.currentDialogue = 0;

                buildScene(sceneIndex);
            }

            updateTimeline();
        }

        if (state.initialized) {
            updateAnimation();
        }
    }

    /* ========================================================
       24. PARAMÈTRES DE VITESSE
    ======================================================== */

    function updatePlaybackSpeed() {
        const speed = Number(dom.playbackSpeed.value);

        if (!Number.isFinite(speed) || speed <= 0) {
            state.playbackSpeed = 1;
        } else {
            state.playbackSpeed = clamp(speed, 0.25, 2);
        }

        showToast(
            "Vitès lekti: " +
            state.playbackSpeed +
            "×"
        );
    }

    /* ========================================================
       25. MODE PLEIN ÉCRAN
    ======================================================== */

    async function toggleFullscreen() {
        try {
            const target = dom.stage;

            if (!document.fullscreenElement) {
                if (target.requestFullscreen) {
                    await target.requestFullscreen();
                } else if (target.webkitRequestFullscreen) {
                    target.webkitRequestFullscreen();
       



