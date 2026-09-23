/* ============================================================
   SIMULATION VIDEO FOBAS
   simulationvideofobas.js
   Contrôleur principal de l'application
   HTML/CSS séparés
   ============================================================ */

(() => {
    "use strict";

    /* =========================================================
       CONFIGURATION
    ========================================================== */

    const CONFIG = {
        APP_NAME: "Video Fobas",
        VERSION: "1.0.0",
        LANGUAGE: "fr",
        MAX_DURATION: 300,
        STORAGE_KEY: "simulationVideoFobasProject",
        STORAGE_LIST_KEY: "simulationVideoFobasProjects",
        HISTORY_LIMIT: 50,
        DEFAULT_PREVIEW_ZOOM: 1,
        DEFAULT_TIMELINE_ZOOM: 1,
        MIN_ZOOM: 0.5,
        MAX_ZOOM: 3,
        ZOOM_STEP: 0.1,
        MIN_TIMELINE_ZOOM: 0.25,
        MAX_TIMELINE_ZOOM: 5,
        TIMELINE_ZOOM_STEP: 0.25,
        FRAME_STEP_24: 1 / 24,
        DEFAULT_CLIP_DURATION: 5,
        MAX_TEXT_LENGTH: 500,
        MAX_VOICE_LENGTH: 5000
    };

    /* =========================================================
       ÉTAT CENTRAL
    ========================================================== */

    const state = {
        application: {
            name: CONFIG.APP_NAME,
            version: CONFIG.VERSION,
            language: CONFIG.LANGUAGE,
            maxDuration: CONFIG.MAX_DURATION
        },

        project: {
            id: null,
            name: "Nouveau projet",
            format: "16:9",
            resolution: "1080p",
            fps: 30,
            duration: 0
        },

        playback: {
            currentTime: 0,
            isPlaying: false,
            isMuted: true,
            volume: 1
        },

        zoom: {
            preview: 1,
            timeline: 1
        },

        selection: {
            type: null,
            id: null,
            trackId: null
        },

        editor: {
            activeTab: "media",
            activeEffect: "none",
            activeTransition: "none",
            inspectorOpen: true,
            previewFullscreen: false,
            mediaObjectUrls: {},
            audioObjectUrls: {},
            generatedObjectUrls: {}
        },

        media: [],

        tracks: [
            {
                id: "video-track-1",
                type: "video",
                name: "Vidéo",
                locked: false,
                muted: false,
                clips: []
            },
            {
                id: "overlay-track-1",
                type: "overlay",
                name: "Overlay",
                locked: false,
                muted: false,
                clips: []
            },
            {
                id: "text-track-1",
                type: "text",
                name: "Texte",
                locked: false,
                muted: false,
                clips: []
            },
            {
                id: "voice-track-1",
                type: "voice",
                name: "Voix",
                locked: false,
                muted: false,
                clips: []
            },
            {
                id: "music-track-1",
                type: "music",
                name: "Musique",
                locked: false,
                muted: false,
                clips: []
            }
        ],

        history: {
            undo: [],
            redo: []
        }
    };

    let isRestoringState = false;
    let playbackRAF = null;
    let autosaveTimer = null;
    let dragState = null;
    let pinchState = null;
    let notificationTimer = null;

    /* =========================================================
       DOM
    ========================================================== */

    const $ = (id) => document.getElementById(id);

    const dom = {};

    function cacheDOM() {
        const ids = [
            "simulationVideoFobas",
            "app",
            "projectName",
            "projectStatus",
            "newProjectButton",
            "saveProjectButton",
            "loadProjectButton",
            "undoButton",
            "redoButton",
            "exportButton",

            "videoFormat",
            "videoResolution",
            "frameRate",
            "maxDurationLabel",

            "zoomOutButton",
            "zoomValue",
            "zoomInButton",
            "zoomResetButton",

            "mediaTabButton",
            "textTabButton",
            "audioTabButton",
            "voiceTabButton",
            "imageAITabButton",
            "videoAITabButton",
            "effectsTabButton",
            "transitionsTabButton",
            "threeDTabButton",
            "colorTabButton",

            "mediaPanel",
            "textPanel",
            "audioPanel",
            "voicePanel",
            "imageAIPanel",
            "videoAIPanel",
            "effectsPanel",
            "transitionsPanel",
            "threeDPanel",
            "colorPanel",

            "clearMediaButton",
            "mediaDropZone",
            "mediaFileInput",
            "importMediaButton",
            "mediaLibrary",

            "addTextButton",
            "textContent",
            "textFont",
            "textSize",
            "textColor",
            "textAnimation",

            "audioFileInput",
            "importAudioButton",
            "audioLibrary",

            "voiceText",
            "voiceLanguage",
            "voiceStyle",
            "generateVoiceButton",
            "voicePreviewAudio",

            "imagePrompt",
            "imageStyle",
            "generateImageButton",
            "generatedImageLibrary",

            "videoPrompt",
            "aiVideoDuration",
            "generateVideoButton",
            "generatedVideoLibrary",

            "effectsList",
            "transitionList",

            "rotationX",
            "rotationY",
            "rotationZ",
            "perspective3D",

            "brightnessControl",
            "contrastControl",
            "saturationControl",
            "resetColorButton",

            "previewResolution",
            "fitPreviewButton",
            "fullscreenPreviewButton",
            "previewViewport",
            "previewStage",
            "previewVideo",
            "previewCanvas",
            "previewOverlay",
            "previewEmptyState",

            "previousFrameButton",
            "playButton",
            "nextFrameButton",
            "currentTimeDisplay",
            "playerSeek",
            "totalTimeDisplay",
            "muteButton",
            "playbackSettingsButton",

            "timelineSection",
            "addTrackButton",
            "splitClipButton",
            "deleteClipButton",
            "duplicateClipButton",
            "timelineZoomOut",
            "timelineZoomValue",
            "timelineZoomIn",
            "timelineViewport",
            "timelineRuler",
            "timelineTracks",
            "timelinePlayhead",

            "videoTrack",
            "videoTrackContent",
            "overlayTrack",
            "overlayTrackContent",
            "textTrack",
            "textTrackContent",
            "voiceTrack",
            "voiceTrackContent",
            "musicTrack",
            "musicTrackContent",

            "videoTrackMuteButton",
            "videoTrackLockButton",
            "overlayTrackMuteButton",
            "overlayTrackLockButton",
            "textTrackLockButton",
            "voiceTrackMuteButton",
            "musicTrackMuteButton",

            "rightSidebar",
            "closeInspectorButton",
            "positionX",
            "positionY",
            "scaleX",
            "scaleY",
            "rotation",
            "opacity",
            "clipStart",
            "clipDuration",
            "volumeControl",
            "fadeInDuration",
            "fadeOutDuration",
            "duplicateSelectedButton",
            "deleteSelectedButton",

            "systemStatus",
            "storageStatus",
            "connectionStatus",
            "renderStatus",

            "newProjectDialog",
            "newProjectForm",
            "newProjectName",
            "newProjectFormat",
            "closeNewProjectDialogButton",
            "cancelNewProjectButton",
            "confirmNewProjectButton",

            "exportDialog",
            "exportForm",
            "exportFormat",
            "exportQuality",
            "exportProjectName",
            "exportDuration",
            "exportResolution",
            "exportProgressContainer",
            "exportProgress",
            "exportProgressLabel",
            "closeExportDialogButton",
            "cancelExportButton",
            "confirmExportButton",

            "loadProjectDialog",
            "closeLoadProjectDialogButton",
            "savedProjectsList",
            "clearSavedProjectsButton",

            "notificationContainer",

            "applicationLoader",
            "loaderTitle",
            "loaderMessage",

            "initialApplicationState"
        ];

        ids.forEach((id) => {
            dom[id] = $(id);
        });
    }

    /* =========================================================
       UTILITAIRES
    ========================================================== */

    function uid(prefix = "id") {
        return `${prefix}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}`;
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function number(value, fallback = 0) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    function round(value, decimals = 3) {
        const factor = 10 ** decimals;
        return Math.round(value * factor) / factor;
    }

    function formatTime(seconds, milliseconds = true) {
        seconds = Math.max(0, number(seconds));

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);

        if (milliseconds) {
            return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
                2,
                "0"
            )}.${String(ms).padStart(3, "0")}`;
        }

        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
            2,
            "0"
        )}`;
    }

    function deepClone(object) {
        return JSON.parse(JSON.stringify(object));
    }

    function safeParseJSON(value, fallback = null) {
        try {
            return JSON.parse(value);
        } catch {
            return fallback;
        }
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function isImageFile(file) {
        return file && file.type.startsWith("image/");
    }

    function isVideoFile(file) {
        return file && file.type.startsWith("video/");
    }

    function isAudioFile(file) {
        return file && file.type.startsWith("audio/");
    }

    function getResolutionSize(resolution) {
        const map = {
            "720p": { width: 1280, height: 720 },
            "1080p": { width: 1920, height: 1080 },
            "1440p": { width: 2560, height: 1440 },
            "2160p": { width: 3840, height: 2160 }
        };

        return map[resolution] || map["1080p"];
    }

    function getAspectRatio(format) {
        const map = {
            "16:9": 16 / 9,
            "9:16": 9 / 16,
            "1:1": 1,
            "4:5": 4 / 5,
            "4:3": 4 / 3
        };

        return map[format] || map["16:9"];
    }

    function getTrack(trackId) {
        return state.tracks.find((track) => track.id === trackId) || null;
    }

    function getClip(trackId, clipId) {
        const track = getTrack(trackId);
        if (!track) return null;

        return track.clips.find((clip) => clip.id === clipId) || null;
    }

    function getSelectedClip() {
        if (!state.selection.id || !state.selection.trackId) {
            return null;
        }

        return getClip(state.selection.trackId, state.selection.id);
    }

    function getSelectedTrack() {
        return state.selection.trackId
            ? getTrack(state.selection.trackId)
            : null;
    }

    function getProjectDuration() {
        let duration = 0;

        state.tracks.forEach((track) => {
            track.clips.forEach((clip) => {
                duration = Math.max(
                    duration,
                    number(clip.start) + number(clip.duration)
                );
            });
        });

        return clamp(duration, 0, CONFIG.MAX_DURATION);
    }

    function getTimelinePixelsPerSecond() {
        return 80 * state.zoom.timeline;
    }

    function getTimelineWidth() {
        return Math.max(
            900,
            CONFIG.MAX_DURATION * getTimelinePixelsPerSecond()
        );
    }

    function markDirty() {
        dom.projectStatus.textContent = "Modifications non enregistrées";
        dom.projectStatus.dataset.status = "dirty";

        scheduleAutosave();
        updateUndoRedoButtons();
    }

    function markSaved() {
        dom.projectStatus.textContent = "Enregistré";
        dom.projectStatus.dataset.status = "saved";
    }

    function setSystemStatus(message) {
        if (dom.systemStatus) {
            dom.systemStatus.textContent = message;
        }
    }

    function setRenderStatus(message) {
        if (dom.renderStatus) {
            dom.renderStatus.textContent = message;
        }
    }

    function notify(message, type = "info", duration = 3000) {
        if (!dom.notificationContainer) return;

        const notification = document.createElement("div");

        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        dom.notificationContainer.appendChild(notification);

        requestAnimationFrame(() => {
            notification.classList.add("show");
        });

        setTimeout(() => {
            notification.classList.remove("show");

            setTimeout(() => {
                notification.remove();
            }, 250);
        }, duration);
    }

    /* =========================================================
       ÉTAT INITIAL
    ========================================================== */

    function readInitialState() {
        if (!dom.initialApplicationState) return;

        const parsed = safeParseJSON(
            dom.initialApplicationState.textContent.trim(),
            null
        );

        if (!parsed) return;

        mergeState(parsed);
    }

    function mergeState(source) {
        if (!source) return;

        if (source.application) {
            state.application = {
                ...state.application,
                ...source.application
            };
        }

        if (source.project) {
            state.project = {
                ...state.project,
                ...source.project
            };
        }

        if (source.playback) {
            state.playback = {
                ...state.playback,
                ...source.playback
            };
        }

        if (source.zoom) {
            state.zoom = {
                ...state.zoom,
                ...source.zoom
            };
        }

        if (source.selection) {
            state.selection = {
                ...state.selection,
                ...source.selection
            };
        }

        if (Array.isArray(source.tracks)) {
            state.tracks = source.tracks;
        }

        if (Array.isArray(source.media)) {
            state.media = source.media;
        }

        if (source.history) {
            state.history = {
                undo: Array.isArray(source.history.undo)
                    ? source.history.undo
                    : [],
                redo: Array.isArray(source.history.redo)
                    ? source.history.redo
                    : []
            };
        }
    }

    function getSerializableState() {
        return {
            application: deepClone(state.application),

            project: {
                ...deepClone(state.project),
                duration: getProjectDuration()
            },

            playback: {
                ...deepClone(state.playback),
                isPlaying: false
            },

            zoom: deepClone(state.zoom),

            selection: deepClone(state.selection),

            tracks: deepClone(state.tracks),

            media: state.media.map((media) => ({
                id: media.id,
                name: media.name,
                type: media.type,
                mimeType: media.mimeType,
                size: media.size,
                duration: media.duration || 0,
                width: media.width || 0,
                height: media.height || 0,
                createdAt: media.createdAt || Date.now()
            })),

            history: {
                undo: [],
                redo: []
            }
        };
    }

    /* =========================================================
       LOCAL STORAGE
    ========================================================== */

    function saveProject(showNotification = true) {
        try {
            state.project.duration = getProjectDuration();

            const serializable = getSerializableState();

            localStorage.setItem(
                CONFIG.STORAGE_KEY,
                JSON.stringify(serializable)
            );

            saveProjectToList(serializable);

            markSaved();

            dom.storageStatus.textContent = "Stockage local activé";

            setSystemStatus("Projet sauvegardé");

            if (showNotification) {
                notify("Projet sauvegardé localement.", "success");
            }

            return true;
        } catch (error) {
            console.error(error);

            dom.storageStatus.textContent = "Stockage local indisponible";

            notify(
                "Impossible de sauvegarder le projet dans le stockage local.",
                "error"
            );

            return false;
        }
    }

    function saveProjectToList(projectState) {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_LIST_KEY);
            const list = safeParseJSON(raw, []);

            const project = {
                id: projectState.project.id || uid("project"),
                name: projectState.project.name || "Nouveau projet",
                format: projectState.project.format,
                resolution: projectState.project.resolution,
                fps: projectState.project.fps,
                duration: projectState.project.duration,
                updatedAt: Date.now(),
                state: projectState
            };

            state.project.id = project.id;

            const index = list.findIndex((item) => item.id === project.id);

            if (index >= 0) {
                list[index] = project;
            } else {
                list.unshift(project);
            }

            const limited = list.slice(0, 30);

            localStorage.setItem(
                CONFIG.STORAGE_LIST_KEY,
                JSON.stringify(limited)
            );
        } catch (error) {
            console.warn("Liste locale non sauvegardée", error);
        }
    }

    function loadSavedProject() {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_KEY);

            if (!raw) {
                notify("Aucun projet local trouvé.", "info");
                return false;
            }

            const parsed = safeParseJSON(raw, null);

            if (!parsed) {
                throw new Error("Projet local invalide.");
            }

            stopPlayback();

            isRestoringState = true;

            releaseObjectUrls();

            state.history.undo = [];
            state.history.redo = [];

            mergeState(parsed);

            state.playback.isPlaying = false;

            isRestoringState = false;

            syncAllUI();
            renderAll();

            markSaved();

            notify("Projet chargé.", "success");

            setSystemStatus("Projet chargé");

            return true;
        } catch (error) {
            isRestoringState = false;

            console.error(error);

            notify(
                "Impossible de charger le projet local.",
                "error"
            );

            return false;
        }
    }

    function scheduleAutosave() {
        clearTimeout(autosaveTimer);

        autosaveTimer = setTimeout(() => {
            saveProject(false);
        }, 1200);
    }

    function clearSavedProjects() {
        const confirmed = window.confirm(
            "Effacer tous les projets sauvegardés localement ?"
        );

        if (!confirmed) return;

        localStorage.removeItem(CONFIG.STORAGE_KEY);
        localStorage.removeItem(CONFIG.STORAGE_LIST_KEY);

        renderSavedProjects();

        notify("Les projets locaux ont été supprimés.", "success");
    }

    /* =========================================================
       HISTORIQUE
    ========================================================== */

    function createHistorySnapshot() {
        return {
            project: deepClone(state.project),
            playback: {
                currentTime: state.playback.currentTime,
                isMuted: state.playback.isMuted,
                volume: state.playback.volume
            },
            zoom: deepClone(state.zoom),
            selection: deepClone(state.selection),
            tracks: deepClone(state.tracks),
            media: deepClone(state.media)
        };
    }

    function restoreHistorySnapshot(snapshot) {
        if (!snapshot) return;

        state.project = deepClone(snapshot.project);

        state.playback.currentTime = number(
            snapshot.playback?.currentTime,
            0
        );

        state.playback.isMuted = Boolean(
            snapshot.playback?.isMuted
        );

        state.playback.volume = number(
            snapshot.playback?.volume,
            1
        );

        state.zoom = deepClone(snapshot.zoom);

        state.selection = deepClone(snapshot.selection);

        state.tracks = deepClone(snapshot.tracks);

        state.media = deepClone(snapshot.media);

        syncAllUI();
        renderAll();
    }

    function pushHistory() {
        if (isRestoringState) return;

        const snapshot = createHistorySnapshot();

        state.history.undo.push(snapshot);

        if (state.history.undo.length > CONFIG.HISTORY_LIMIT) {
            state.history.undo.shift();
        }

        state.history.redo = [];

        updateUndoRedoButtons();
    }

    function undo() {
        if (!state.history.undo.length) return;

        const current = createHistorySnapshot();

        state.history.redo.push(current);

        const previous = state.history.undo.pop();

        restoreHistorySnapshot(previous);

        markDirty();

        notify("Action annulée.", "info");

        updateUndoRedoButtons();
    }

    function redo() {
        if (!state.history.redo.length) return;

        const current = createHistorySnapshot();

        state.history.undo.push(current);

        const next = state.history.redo.pop();

        restoreHistorySnapshot(next);

        markDirty();

        notify("Action rétablie.", "info");

        updateUndoRedoButtons();
    }

    function updateUndoRedoButtons() {
        if (dom.undoButton) {
            dom.undoButton.disabled =
                state.history.undo.length === 0;
        }

        if (dom.redoButton) {
            dom.redoButton.disabled =
                state.history.redo.length === 0;
        }
    }

    /* =========================================================
       PROJET
    ========================================================== */

    function createNewProject(name, format) {
        pushHistory();

        stopPlayback();

        releaseObjectUrls();

        state.project = {
            id: uid("project"),
            name: name || "Nouveau projet",
            format: format || "16:9",
            resolution: "1080p",
            fps: 30,
            duration: 0
        };

        state.playback = {
            currentTime: 0,
            isPlaying: false,
            isMuted: true,
            volume: 1
        };

        state.zoom = {
            preview: 1,
            timeline: 1
        };

        state.selection = {
            type: null,
            id: null,
            trackId: null
        };

        state.media = [];

        state.tracks = [
            createTrack("video-track-1", "video", "Vidéo"),
            createTrack("overlay-track-1", "overlay", "Overlay"),
            createTrack("text-track-1", "text", "Texte"),
            createTrack("voice-track-1", "voice", "Voix"),
            createTrack("music-track-1", "music", "Musique")
        ];

        syncAllUI();
        renderAll();

        saveProject(false);

        notify("Nouveau projet créé.", "success");

        setSystemStatus("Nouveau projet");
    }

    function createTrack(id, type, name) {
        return {
            id,
            type,
            name,
            locked: false,
            muted: false,
            clips: []
        };
    }

    function openNewProjectDialog() {
        if (!dom.newProjectDialog) return;

        dom.newProjectName.value = state.project.name;
        dom.newProjectFormat.value = state.project.format;

        if (typeof dom.newProjectDialog.showModal === "function") {
            dom.newProjectDialog.showModal();
        } else {
            dom.newProjectDialog.setAttribute("open", "");
        }
    }

    function closeDialog(dialog) {
        if (!dialog) return;

        if (typeof dialog.close === "function") {
            try {
                dialog.close();
                return;
            } catch {
                /* fallback */
            }
        }

        dialog.removeAttribute("open");
    }

    function confirmNewProject(event) {
        if (event) event.preventDefault();

        const name =
            dom.newProjectName.value.trim() ||
            "Nouveau projet";

        const format =
            dom.newProjectFormat.value || "16:9";

        createNewProject(name, format);

        closeDialog(dom.newProjectDialog);
    }

    /* =========================================================
       IMPORT MÉDIAS
    ========================================================== */

    function openMediaPicker() {
        dom.mediaFileInput?.click();
    }

    function openAudioPicker() {
        dom.audioFileInput?.click();
    }

    function importMediaFiles(files) {
        if (!files || !files.length) return;

        let imported = 0;

        pushHistory();

        Array.from(files).forEach((file) => {
            if (!isImageFile(file) && !isVideoFile(file)) {
                notify(
                    `${file.name} n'est pas une image ou une vidéo.`,
                    "error"
                );
                return;
            }

            const media = {
                id: uid("media"),
                name: file.name,
                type: isImageFile(file) ? "image" : "video",
                mimeType: file.type,
                size: file.size,
                duration: 0,
                width: 0,
                height: 0,
                createdAt: Date.now()
            };

            state.media.push(media);

            state.editor.mediaObjectUrls[media.id] =
                URL.createObjectURL(file);

            imported++;

            if (isVideoFile(file)) {
                readVideoMetadata(media, file);
            } else {
                readImageMetadata(media, file);
            }
        });

        renderMediaLibrary();

        markDirty();

        if (imported > 0) {
            notify(
                `${imported} média${imported > 1 ? "s" : ""} importé${
                    imported > 1 ? "s" : ""
                }.`,
                "success"
            );
        }
    }

    function importAudioFiles(files) {
        if (!files || !files.length) return;

        let imported = 0;

        pushHistory();

        Array.from(files).forEach((file) => {
            if (!isAudioFile(file)) {
                notify(
                    `${file.name} n'est pas un fichier audio.`,
                    "error"
                );
                return;
            }

            const media = {
                id: uid("audio"),
                name: file.name,
                type: "audio",
                mimeType: file.type,
                size: file.size,
                duration: 0,
                createdAt: Date.now()
            };

            state.media.push(media);

            state.editor.audioObjectUrls[media.id] =
                URL.createObjectURL(file);

            imported++;

            readAudioMetadata(media, file);
        });

        renderAudioLibrary();

        markDirty();

        if (imported > 0) {
            notify(
                `${imported} fichier${imported > 1 ? "s" : ""} audio importé${
                    imported > 1 ? "s" : ""
                }.`,
                "success"
            );
        }
    }

    function readImageMetadata(media, file) {
        const url = state.editor.mediaObjectUrls[media.id];

        const image = new Image();

        image.onload = () => {
            media.width = image.naturalWidth;
            media.height = image.naturalHeight;

            renderMediaLibrary();
        };

        image.src = url;
    }

    function readVideoMetadata(media, file) {
        const url = state.editor.mediaObjectUrls[media.id];

        const video = document.createElement("video");

        video.preload = "metadata";

        video.onloadedmetadata = () => {
            media.duration = clamp(
                number(video.duration, 0),
                0,
                CONFIG.MAX_DURATION
            );

            media.width = video.videoWidth;
            media.height = video.videoHeight;

            renderMediaLibrary();
        };

        video.src = url;
    }

    function readAudioMetadata(media, file) {
        const url = state.editor.audioObjectUrls[media.id];

        const audio = document.createElement("audio");

        audio.preload = "metadata";

        audio.onloadedmetadata = () => {
            media.duration = clamp(
                number(audio.duration, 0),
                0,
                CONFIG.MAX_DURATION
            );

            renderAudioLibrary();
        };

        audio.src = url;
    }

    function clearMedia() {
        if (!state.media.length) {
            notify("La bibliothèque média est déjà vide.", "info");
            return;
        }

        const confirmed = window.confirm(
            "Supprimer tous les médias de la bibliothèque ?"
        );

        if (!confirmed) return;

        pushHistory();

        state.media.forEach((media) => {
            if (media.type === "audio") {
                if (state.editor.audioObjectUrls[media.id]) {
                    URL.revokeObjectURL(
                        state.editor.audioObjectUrls[media.id]
                    );
                }
            } else {
                if (state.editor.mediaObjectUrls[media.id]) {
                    URL.revokeObjectURL(
                        state.editor.mediaObjectUrls[media.id]
                    );
                }
            }
        });

        state.media = [];

        state.editor.mediaObjectUrls = {};
        state.editor.audioObjectUrls = {};

        renderMediaLibrary();
        renderAudioLibrary();

        markDirty();

        notify("Bibliothèque média effacée.", "success");
    }

    function releaseObjectUrls() {
        Object.values(state.editor.mediaObjectUrls).forEach((url) => {
            try {
                URL.revokeObjectURL(url);
            } catch {}
        });

        Object.values(state.editor.audioObjectUrls).forEach((url) => {
            try {
                URL.revokeObjectURL(url);
            } catch {}
        });

        Object.values(state.editor.generatedObjectUrls).forEach((url) => {
            try {
                URL.revokeObjectURL(url);
            } catch {}
        });

        state.editor.mediaObjectUrls = {};
        state.editor.audioObjectUrls = {};
        state.editor.generatedObjectUrls = {};
    }

    /* =========================================================
       MÉDIAS -> TIMELINE
    ========================================================== */

    function addMediaToTimeline(mediaId) {
        const media = state.media.find((item) => item.id === mediaId);

        if (!media) return;

        const trackType =
            media.type === "audio"
                ? "music"
                : media.type === "video"
                ? "video"
                : "overlay";

        const track = state.tracks.find(
            (item) => item.type === trackType
        );

        if (!track) return;

        if (track.locked) {
            notify("Cette piste est verrouillée.", "error");
            return;
        }

        pushHistory();

        const duration =
            media.duration > 0
                ? Math.min(media.duration, CONFIG.DEFAULT_CLIP_DURATION)
                : CONFIG.DEFAULT_CLIP_DURATION;

        const start = findFreeTimelinePosition(
            track,
            duration
        );

        if (start + duration > CONFIG.MAX_DURATION) {
            notify(
                "La durée maximale de 5 minutes est atteinte.",
                "error"
            );
            return;
        }

        const clip = createClipFromMedia(
            media,
            track,
            start,
            duration
        );

        track.clips.push(clip);

        state.selection = {
            type: clip.type,
            id: clip.id,
            trackId: track.id
        };

        recalculateDuration();

        renderAll();

        markDirty();

        notify("Élément ajouté à la timeline.", "success");
    }

    function findFreeTimelinePosition(track, duration) {
        if (!track.clips.length) return 0;

        const sorted = [...track.clips].sort(
            (a, b) => a.start - b.start
        );

        let position = 0;

        for (const clip of sorted) {
            if (position + duration <= clip.start) {
                return position;
            }

            position = Math.max(
                position,
                clip.start + clip.duration
            );
        }

        return position;
    }

    function createClipFromMedia(media, track, start, duration) {
        return {
            id: uid("clip"),
            type: track.type,
            mediaId: media.id,
            name: media.name,
            start: round(start),
            duration: round(duration),
            sourceStart: 0,
            sourceDuration: media.duration || duration,

            x: 0,
            y: 0,
            scaleX: 100,
            scaleY: 100,
            rotation: 0,
            opacity: 100,

            volume: 100,
            fadeIn: 0,
            fadeOut: 0,

            effect: "none",
            transition: "none",

            text: "",
            font: "Arial",
            fontSize: 48,
            color: "#ffffff",
            animation: "none",

            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            perspective: 1000
        };
    }

    /* =========================================================
       TEXTE
    ========================================================== */

    function addTextClip() {
        const text =
            dom.textContent.value.trim() ||
            "Votre texte";

        const track = getTrack("text-track-1");

        if (!track) return;

        if (track.locked) {
            notify("La piste Texte est verrouillée.", "error");
            return;
        }

        pushHistory();

        const duration = 5;
        const start = findFreeTimelinePosition(
            track,
            duration
        );

        if (start + duration > CONFIG.MAX_DURATION) {
            notify(
                "La durée maximale de 5 minutes est atteinte.",
                "error"
            );
            return;
        }

        const clip = {
            id: uid("text"),
            type: "text",
            name: text.slice(0, 40),
            start,
            duration,

            x: 0,
            y: 0,
            scaleX: 100,
            scaleY: 100,
            rotation: 0,
            opacity: 100,

            volume: 100,
            fadeIn: 0,
            fadeOut: 0,

            effect: "none",
            transition: "none",

            text: text.slice(0, CONFIG.MAX_TEXT_LENGTH),
            font: dom.textFont.value || "Arial",
            fontSize: number(dom.textSize.value, 48),
            color: dom.textColor.value || "#ffffff",
            animation: dom.textAnimation.value || "none",

            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            perspective: 1000
        };

        track.clips.push(clip);

        state.selection = {
            type: "text",
            id: clip.id,
            trackId: track.id
        };

        recalculateDuration();

        renderAll();

        markDirty();

        notify("Texte ajouté à la timeline.", "success");
    }

    /* =========================================================
       MODIFICATION DU CLIP
    ========================================================== */

    function updateSelectedProperty(property, value) {
        const clip = getSelectedClip();

        if (!clip) return;

        const track = getSelectedTrack();

        if (track?.locked) {
            notify("Cette piste est verrouillée.", "error");
            return;
        }

        if (
            property === "clip-start" ||
            property === "clip-duration"
        ) {
            value = number(value);
        }

        switch (property) {
            case "position-x":
                clip.x = number(value);
                break;

            case "position-y":
                clip.y = number(value);
                break;

            case "scale-x":
                clip.scaleX = clamp(number(value, 100), 1, 1000);
                break;

            case "scale-y":
                clip.scaleY = clamp(number(value, 100), 1, 1000);
                break;

            case "rotation":
                clip.rotation = clamp(number(value), -360, 360);
                break;

            case "opacity":
                clip.opacity = clamp(number(value, 100), 0, 100);
                break;

            case "clip-start":
                clip.start = clamp(
                    number(value),
                    0,
                    CONFIG.MAX_DURATION - 0.001
                );
                break;

            case "clip-duration":
                clip.duration = clamp(
                    number(value, 0.001),
                    0.001,
                    CONFIG.MAX_DURATION - clip.start
                );
                break;

            case "volume":
                clip.volume = clamp(number(value, 100), 0, 200);
                break;

            case "fade-in":
                clip.fadeIn = clamp(number(value), 0, 30);
                break;

            case "fade-out":
                clip.fadeOut = clamp(number(value), 0, 30);
                break;
        }

        recalculateDuration();

        renderTimeline();
        renderPreview();
        updateInspector();

        markDirty();
    }

    function updateTextPropertiesFromControls() {
        const clip = getSelectedClip();

        if (!clip || clip.type !== "text") return;

        const track = getSelectedTrack();

        if (track?.locked) return;

        clip.text =
            dom.textContent.value.slice(
                0,
                CONFIG.MAX_TEXT_LENGTH
            );

        clip.font = dom.textFont.value;
        clip.fontSize = number(dom.textSize.value, 48);
        clip.color = dom.textColor.value;
        clip.animation = dom.textAnimation.value;

        clip.name = clip.text.slice(0, 40) || "Texte";

        renderTimeline();
        renderPreview();

        markDirty();
    }

    /* =========================================================
       EFFETS
    ========================================================== */

    function applyEffect(effect) {
        const clip = getSelectedClip();

        if (!clip) {
            notify(
                "Sélectionnez d'abord un élément dans la timeline.",
                "info"
            );
            return;
        }

        pushHistory();

        clip.effect = effect;

        state.editor.activeEffect = effect;

        renderEffects();

        renderPreview();

        markDirty();

        notify(`Effet « ${effect} » appliqué.`, "success");
    }

    function applyTransition(transition) {
        const clip = getSelectedClip();

        if (!clip) {
            notify(
                "Sélectionnez d'abord un élément.",
                "info"
            );
            return;
        }

        pushHistory();

        clip.transition = transition;

        state.editor.activeTransition = transition;

        renderTransitions();

        markDirty();

        notify("Transition appliquée.", "success");
    }

    /* =========================================================
       COULEUR
    ========================================================== */

    function applyColorControls() {
        const clip = getSelectedClip();

        if (!clip) return;

        clip.brightness = number(
            dom.brightnessControl.value,
            100
        );

        clip.contrast = number(
            dom.contrastControl.value,
            100
        );

        clip.saturation = number(
            dom.saturationControl.value,
            100
        );

        renderPreview();

        markDirty();
    }

    function resetColor() {
        const clip = getSelectedClip();

        if (!clip) return;

        pushHistory();

        clip.brightness = 100;
        clip.contrast = 100;
        clip.saturation = 100;
        clip.effect = "none";

        syncInspectorColorControls();

        renderPreview();

        markDirty();

        notify("Réglages couleur réinitialisés.", "success");
    }

    /* =========================================================
       3D
    ========================================================== */

    function apply3DControls() {
        const clip = getSelectedClip();

        if (!clip) return;

        clip.rotationX = number(dom.rotationX.value);
        clip.rotationY = number(dom.rotationY.value);
        clip.rotationZ = number(dom.rotationZ.value);
        clip.perspective = number(
            dom.perspective3D.value,
            1000
        );

        renderPreview();

        markDirty();
    }

    /* =========================================================
       TIMELINE
    ========================================================== */

    function addTrack() {
        pushHistory();

        const numberOfTracks = state.tracks.length + 1;

        const track = createTrack(
            uid("track"),
            "custom",
            `Piste ${numberOfTracks}`
        );

        state.tracks.push(track);

        renderTimeline();

        markDirty();

        notify("Nouvelle piste ajoutée.", "success");
    }

    function selectClip(trackId, clipId) {
        const clip = getClip(trackId, clipId);

        if (!clip) return;

        state.selection = {
            type: clip.type,
            id: clip.id,
            trackId
        };

        state.playback.currentTime = clamp(
            clip.start,
            0,
            CONFIG.MAX_DURATION
        );

        updateInspector();
        renderTimeline();
        renderPreview();
        updatePlayerUI();
    }

    function deleteSelectedClip() {
        const clip = getSelectedClip();

        if (!clip) {
            notify("Aucun élément sélectionné.", "info");
            return;
        }

        const track = getSelectedTrack();

        if (!track) return;

        if (track.locked) {
            notify("Cette piste est verrouillée.", "error");
            return;
        }

        pushHistory();

        track.clips = track.clips.filter(
            (item) => item.id !== clip.id
        );

        state.selection = {
            type: null,
            id: null,
            trackId: null
        };

        recalculateDuration();

        renderAll();

        markDirty();

        notify("Élément supprimé.", "success");
    }

    function duplicateSelectedClip() {
        const clip = getSelectedClip();

        if (!clip) {
            notify("Aucun élément sélectionné.", "info");
            return;
        }

        const track = getSelectedTrack();

        if (!track) return;

        if (track.locked) {
            notify("Cette piste est verrouillée.", "error");
            return;
        }

        pushHistory();

        const duplicate = deepClone(clip);

        duplicate.id = uid("clip");

        duplicate.start = clamp(
            clip.start + clip.duration,
            0,
            CONFIG.MAX_DURATION
        );

        if (
            duplicate.start + duplicate.duration >
            CONFIG.MAX_DURATION
        ) {
            duplicate.start = Math.max(
                0,
                CONFIG.MAX_DURATION - duplicate.duration
            );
        }

        track.clips.push(duplicate);

        state.selection = {
            type: duplicate.type,
            id: duplicate.id,
            trackId: track.id
        };

        recalculateDuration();

        renderAll();

        markDirty();

        notify("Élément dupliqué.", "success");
    }

    function splitSelectedClip() {
        const clip = getSelectedClip();

        if (!clip) {
            notify("Sélectionnez un clip à diviser.", "info");
            return;
        }

        const track = getSelectedTrack();

        if (!track || track.locked) {
            notify("Cette piste est verrouillée.", "error");
            return;
        }

        const currentTime = state.playback.currentTime;

        if (
            currentTime <= clip.start + 0.01 ||
            currentTime >=
                clip.start + clip.duration - 0.01
        ) {
            notify(
                "Placez la tête de lecture à l'intérieur du clip.",
                "info"
            );
            return;
        }

        pushHistory();

        const firstDuration =
            currentTime - clip.start;

        const secondDuration =
            clip.duration - firstDuration;

        const second = deepClone(clip);

        second.id = uid("clip");

        second.start = currentTime;
        second.duration = secondDuration;

        if (clip.sourceDuration) {
            const sourceRatio =
                clip.sourceDuration / clip.duration;

            clip.sourceDuration =
                firstDuration * sourceRatio;

            second.sourceStart =
                clip.sourceStart +
                firstDuration * sourceRatio;

            second.sourceDuration =
                secondDuration * sourceRatio;
        }

        clip.duration = firstDuration;

        track.clips.push(second);

        state.selection = {
            type: second.type,
            id: second.id,
            trackId: track.id
        };

        recalculateDuration();

        renderAll();

        markDirty();

        notify("Clip divisé.", "success");
    }

    function deleteSelected() {
        deleteSelectedClip();
    }

    /* =========================================================
       TRACK CONTROLS
    ========================================================== */

    function toggleTrackMute(trackId) {
        const track = getTrack(trackId);

        if (!track) return;

        pushHistory();

        track.muted = !track.muted;

        renderTimeline();

        markDirty();
    }

    function toggleTrackLock(trackId) {
        const track = getTrack(trackId);

        if (!track) return;

        pushHistory();

        track.locked = !track.locked;

        renderTimeline();

        markDirty();
    }

    /* =========================================================
       LECTEUR
    ========================================================== */

    function play() {
        if (state.playback.isPlaying) {
            stopPlayback();
            return;
        }

        if (getProjectDuration() <= 0) {
            notify(
                "Ajoutez d'abord un élément à la timeline.",
                "info"
            );
            return;
        }

        state.playback.isPlaying = true;

        updatePlayerUI();

        setSystemStatus("Lecture");

        let lastTimestamp = performance.now();

        const tick = (timestamp) => {
            if (!state.playback.isPlaying) return;

            const delta =
                (timestamp - lastTimestamp) / 1000;

            lastTimestamp = timestamp;

            state.playback.currentTime += delta;

            const duration = getProjectDuration();

            if (
                state.playback.currentTime >=
                Math.max(duration, 0.001)
            ) {
                state.playback.currentTime = 0;
                stopPlayback();
                return;
            }

            updatePlayerUI();
            updatePlayheadPosition();
            renderPreviewFrame();

            playbackRAF = requestAnimationFrame(tick);
        };

        playbackRAF = requestAnimationFrame(tick);
    }

    function stopPlayback() {
        state.playback.isPlaying = false;

        if (playbackRAF) {
            cancelAnimationFrame(playbackRAF);
            playbackRAF = null;
        }

        updatePlayerUI();

        setSystemStatus("Prêt");
    }

    function seekTo(time) {
        state.playback.currentTime = clamp(
            number(time),
            0,
            CONFIG.MAX_DURATION
        );

        updatePlayerUI();
        updatePlayheadPosition();
        renderPreviewFrame();
    }

    function previousFrame() {
        const frame =
            1 / Math.max(1, state.project.fps || 30);

        seekTo(
            Math.max(
                0,
                state.playback.currentTime - frame
            )
        );
    }

    function nextFrame() {
        const frame =
            1 / Math.max(1, state.project.fps || 30);

        seekTo(
            Math.min(
                getProjectDuration(),
                state.playback.currentTime + frame
            )
        );
    }

    function toggleMute() {
        state.playback.isMuted =
            !state.playback.isMuted;

        if (dom.previewVideo) {
            dom.previewVideo.muted =
                state.playback.isMuted;
        }

        updatePlayerUI();
    }

    /* =========================================================
       ZOOM PREVIEW
    ========================================================== */

    function setPreviewZoom(value) {
        state.zoom.preview = clamp(
            number(value, 1),
            CONFIG.MIN_ZOOM,
            CONFIG.MAX_ZOOM
        );

        updatePreviewZoomUI();
    }

    function zoomPreview(delta) {
        setPreviewZoom(
            state.zoom.preview + delta
        );
    }

    function resetPreviewZoom() {
        setPreviewZoom(1);
    }

    function updatePreviewZoomUI() {
        const percentage =
            Math.round(state.zoom.preview * 100);

        if (dom.zoomValue) {
            dom.zoomValue.textContent =
                `${percentage}%`;
        }

        if (dom.previewStage) {
            dom.previewStage.style.setProperty(
                "--preview-zoom",
                state.zoom.preview
            );
        }
    }

    function fitPreview() {
        setPreviewZoom(1);

        if (!dom.previewViewport || !dom.previewStage) {
            return;
        }

        const viewport =
            dom.previewViewport.getBoundingClientRect();

        const aspect =
            getAspectRatio(state.project.format);

        const padding = 32;

        const availableWidth =
            Math.max(100, viewport.width - padding);

        const availableHeight =
            Math.max(100, viewport.height - padding);

        let width = availableWidth;
        let height = width / aspect;

        if (height > availableHeight) {
            height = availableHeight;
            width = height * aspect;
        }

        const resolution =
            getResolutionSize(state.project.resolution);

        const baseWidth = resolution.width;

        const fitScale =
            width / Math.max(1, baseWidth);

        setPreviewZoom(
            clamp(
                fitScale,
                CONFIG.MIN_ZOOM,
                CONFIG.MAX_ZOOM
            )
        );
    }

    /* =========================================================
       PINCH ZOOM 2 DOIGTS ANDROID
    ========================================================== */

    function setupPinchZoom() {
        const target =
            dom.previewViewport || dom.previewStage;

        if (!target) return;

        target.addEventListener(
            "touchstart",
            (event) => {
                if (event.touches.length !== 2) {
                    return;
                }

                const a = event.touches[0];
                const b = event.touches[1];

                pinchState = {
                    initialDistance: distanceBetweenTouches(
                        a,
                        b
                    ),
                    initialZoom: state.zoom.preview
                };
            },
            { passive: true }
        );

        target.addEventListener(
            "touchmove",
            (event) => {
                if (
                    !pinchState ||
                    event.touches.length !== 2
                ) {
                    return;
                }

                const a = event.touches[0];
                const b = event.touches[1];

                const currentDistance =
                    distanceBetweenTouches(a, b);

                if (!pinchState.initialDistance) {
                    return;
                }

                const ratio =
                    currentDistance /
                    pinchState.initialDistance;

                setPreviewZoom(
                    pinchState.initialZoom * ratio
                );

                event.preventDefault();
            },
            { passive: false }
        );

        target.addEventListener(
            "touchend",
            () => {
                if (!eventTouchesRemainTwo()) {
                    pinchState = null;
                }
            },
            { passive: true }
        );

        target.addEventListener(
            "touchcancel",
            () => {
                pinchState = null;
            },
            { passive: true }
        );
    }

    function eventTouchesRemainTwo() {
        return false;
    }

    function distanceBetweenTouches(a, b) {
        const dx = b.clientX - a.clientX;
        const dy = b.clientY - a.clientY;

        return Math.sqrt(dx * dx + dy * dy);
    }

    /* =========================================================
       TIMELINE ZOOM
    ========================================================== */

    function setTimelineZoom(value) {
        state.zoom.timeline = clamp(
            number(value, 1),
            CONFIG.MIN_TIMELINE_ZOOM,
            CONFIG.MAX_TIMELINE_ZOOM
        );

        updateTimelineZoomUI();
        renderTimelineRuler();
        renderTimelineClips();
        updatePlayheadPosition();
    }

    function zoomTimeline(delta) {
        setTimelineZoom(
            state.zoom.timeline + delta
        );
    }

    function updateTimelineZoomUI() {
        if (dom.timelineZoomValue) {
            dom.timelineZoomValue.textContent =
                `${Math.round(
                    state.zoom.timeline * 100
                )}%`;
        }

        if (dom.timelineTracks) {
            dom.timelineTracks.style.setProperty(
                "--timeline-zoom",
                state.zoom.timeline
            );
        }
    }

    /* =========================================================
       PREVIEW
    ========================================================== */

    function updatePreviewResolution() {
        const resolution =
            getResolutionSize(state.project.resolution);

        if (dom.previewResolution) {
            dom.previewResolution.textContent =
                `${resolution.width} × ${resolution.height}`;
        }

        if (dom.previewCanvas) {
            dom.previewCanvas.width = resolution.width;
            dom.previewCanvas.height = resolution.height;
        }

        if (dom.previewStage) {
            dom.previewStage.style.aspectRatio =
                getAspectRatio(state.project.format);
        }
    }

    function renderPreview() {
        updatePreviewResolution();
        renderPreviewFrame();
        renderPreviewOverlay();
        updatePreviewEmptyState();
    }

    function renderPreviewFrame() {
        if (!dom.previewCanvas) return;

        const canvas = dom.previewCanvas;
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = "#05070d";
        ctx.fillRect(0, 0, width, height);

        const currentTime =
            state.playback.currentTime;

        const activeClips = [];

        state.tracks.forEach((track) => {
            if (track.muted) return;

            track.clips.forEach((clip) => {
                if (
                    currentTime >= clip.start &&
                    currentTime <
                        clip.start + clip.duration
                ) {
                    activeClips.push({
                        track,
                        clip
                    });
                }
            });
        });

        const mediaClips =
            activeClips.filter(
                ({ clip }) =>
                    clip.type === "video" ||
                    clip.type === "overlay"
            );

        if (!mediaClips.length) {
            drawPreviewBackground(ctx, width, height);
            return;
        }

        mediaClips.forEach(({ clip }) => {
            drawMediaClip(
                ctx,
                clip,
                width,
                height
            );
        });
    }

    function drawPreviewBackground(ctx, width, height) {
        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                width,
                height
            );

        gradient.addColorStop(0, "#111827");
        gradient.addColorStop(1, "#020617");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillRect(
            width * 0.1,
            height * 0.1,
            width * 0.8,
            height * 0.8
        );
    }

    function drawMediaClip(
        ctx,
        clip,
        width,
        height
    ) {
        const media =
            state.media.find(
                (item) =>
                    item.id === clip.mediaId
            );

        if (!media) {
            return;
        }

        const url =
            state.editor.mediaObjectUrls[
                media.id
            ];

        if (!url) return;

        const image =
            media.type === "image"
                ? getCachedImage(media.id, url)
                : null;

        if (image && image.complete) {
            drawImageElement(
                ctx,
                image,
                clip,
                width,
                height
            );

            return;
        }

        if (media.type === "video") {
            drawVideoElement(
                ctx,
                url,
                clip,
                width,
                height
            );
        }
    }

    const imageCache = new Map();
    const videoCache = new Map();

    function getCachedImage(id, url) {
        if (!imageCache.has(id)) {
            const image = new Image();

            image.src = url;

            imageCache.set(id, image);
        }

        return imageCache.get(id);
    }

    function getCachedVideo(id, url) {
        if (!videoCache.has(id)) {
            const video = document.createElement("video");

            video.src = url;
            video.preload = "auto";
            video.muted = true;
            video.playsInline = true;

            videoCache.set(id, video);
        }

        return videoCache.get(id);
    }

    function drawImageElement(
        ctx,
        image,
        clip,
        width,
        height
    ) {
        ctx.save();

        applyCanvasEffects(ctx, clip);

        const x =
            width / 2 + number(clip.x);

        const y =
            height / 2 + number(clip.y);

        const sourceWidth =
            image.naturalWidth || width;

        const sourceHeight =
            image.naturalHeight || height;

        const fitScale =
            Math.min(
                width / sourceWidth,
                height / sourceHeight
            );

        const drawWidth =
            sourceWidth *
            fitScale *
            (clip.scaleX / 100);

        const drawHeight =
            sourceHeight *
            fitScale *
            (clip.scaleY / 100);

        ctx.globalAlpha =
            clamp(
                number(clip.opacity, 100) / 100,
                0,
                1
            );

        ctx.translate(x, y);

        apply3DCanvasTransform(ctx, clip);

        ctx.drawImage(
            image,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
        );

        ctx.restore();
    }

    function drawVideoElement(
        ctx,
        url,
        clip,
        width,
        height
    ) {
        const media =
            state.media.find(
                (item) =>
                    item.id === clip.mediaId
            );

        if (!media) return;

        const video =
            getCachedVideo(media.id, url);

        const desiredTime =
            clip.sourceStart +
            (
                state.playback.currentTime -
                clip.start
            );

        if (
            Number.isFinite(desiredTime) &&
            Math.abs(
                video.currentTime -
                    desiredTime
            ) > 0.08
        ) {
            try {
                video.currentTime =
                    clamp(
                        desiredTime,
                        0,
                        Math.max(
                            0,
                            media.duration || desiredTime
                        )
                    );
            } catch {}
        }

        if (!video.readyState) {
            return;
        }

        ctx.save();

        applyCanvasEffects(ctx, clip);

        const x =
            width / 2 + number(clip.x);

        const y =
            height / 2 + number(clip.y);

        const sourceWidth =
            video.videoWidth || width;

        const sourceHeight =
            video.videoHeight || height;

        const fitScale =
            Math.min(
                width / sourceWidth,
                height / sourceHeight
            );

        const drawWidth =
            sourceWidth *
            fitScale *
            (clip.scaleX / 100);

        const drawHeight =
            sourceHeight *
            fitScale *
            (clip.scaleY / 100);

        ctx.globalAlpha =
            clamp(
                number(clip.opacity, 100) / 100,
                0,
                1
            );

        ctx.translate(x, y);

        apply3DCanvasTransform(ctx, clip);

        ctx.drawImage(
            video,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
        );

        ctx.restore();
    }

    function apply3DCanvasTransform(ctx, clip) {
        ctx.rotate(
            (number(clip.rotation, 0) *
                Math.PI) /
                180
        );
    }

    function applyCanvasEffects(ctx, clip) {
        const brightness =
            number(clip.brightness, 100);

        const contrast =
            number(clip.contrast, 100);

        const saturation =
            number(clip.saturation, 100);

        let filter =
            `brightness(${brightness}%) ` +
            `contrast(${contrast}%) ` +
            `saturate(${saturation}%)`;

        switch (clip.effect) {
            case "blur":
                filter += " blur(4px)";
                break;

            case "grayscale":
                filter += " grayscale(100%)";
                break;

            case "vintage":
                filter +=
                    " sepia(35%) contrast(110%)";
                break;

            case "brightness":
                filter += " brightness(125%)";
                break;

            case "contrast":
                filter += " contrast(130%)";
                break;
        }

        ctx.filter = filter;
    }

    function renderPreviewOverlay() {
        if (!dom.previewOverlay) return;

        dom.previewOverlay.innerHTML = "";

        const currentTime =
            state.playback.currentTime;

        state.tracks.forEach((track) => {
            if (track.muted) return;

            track.clips.forEach((clip) => {
                if (
                    clip.type !== "text" ||
                    currentTime < clip.start ||
                    currentTime >=
                        clip.start + clip.duration
                ) {
                    return;
                }

                const element =
                    document.createElement("div");

                element.className =
                    "preview-text-object";

                element.dataset.clipId =
                    clip.id;

                element.textContent =
                    clip.text || "";

                element.style.position = "absolute";
                element.style.left = "50%";
                element.style.top = "50%";

                element.style.transform =
                    `translate(-50%, -50%) ` +
                    `translate(${clip.x}px, ${clip.y}px) ` +
                    `rotate(${clip.rotation}deg) ` +
                    `scale(${clip.scaleX / 100}, ${
                        clip.scaleY / 100
                    })`;

                element.style.fontFamily =
                    clip.font || "Arial";

                element.style.fontSize =
                    `${clip.fontSize || 48}px`;

                element.style.color =
                    clip.color || "#ffffff";

                element.style.opacity =
                    clamp(
                        clip.opacity / 100,
                        0,
                        1
                    );

                element.style.whiteSpace =
                    "pre-wrap";

                element.style.pointerEvents =
                    "none";

                element.style.textAlign =
                    "center";

                element.style.textShadow =
                    "0 2px 12px rgba(0,0,0,.75)";

                applyTextAnimation(
                    element,
                    clip
                );

                dom.previewOverlay.appendChild(
                    element
                );
            });
        });
    }

    function applyTextAnimation(element, clip) {
        const localTime =
            state.playback.currentTime -
            clip.start;

        const progress =
            clamp(
                localTime / Math.max(0.001, clip.duration),
                0,
                1
            );

        switch (clip.animation) {
            case "fade":
                element.style.opacity =
                    progress < 0.15
                        ? progress / 0.15
                        : 1;
                break;

            case "slide":
                element.style.transform +=
                    ` translateX(${
                        (1 - progress) * 80
                    }px)`;
                break;

            case "scale":
                element.style.transform +=
                    ` scale(${
                        0.5 + progress * 0.5
                    })`;
                break;

            case "typewriter": {
                const text =
                    element.textContent || "";

                const chars = Math.floor(
                    text.length * progress
                );

                element.textContent =
                    text.slice(0, chars);

                break;
            }
        }
    }

    function updatePreviewEmptyState() {
        if (!dom.previewEmptyState) return;

        const hasContent =
            state.tracks.some(
                (track) =>
                    track.clips.length > 0
            );

        dom.previewEmptyState.hidden =
            hasContent;
    }

    /* =========================================================
       TIMELINE RENDER
    ========================================================== */

    function renderTimeline() {
        renderTimelineRuler();
        renderTimelineClips();
        renderTimelineTrackControls();
        updatePlayheadPosition();
    }

    function renderTimelineRuler() {
        if (!dom.timelineRuler) return;

        dom.timelineRuler.innerHTML = "";

        const width = getTimelineWidth();

        dom.timelineRuler.style.width =
            `${width}px`;

        const pixelsPerSecond =
            getTimelinePixelsPerSecond();

        for (
            let second = 0;
            second <= CONFIG.MAX_DURATION;
            second++
        ) {
            const mark =
                document.createElement("div");

            mark.className =
                "timeline-ruler-mark";

            mark.style.left =
                `${second * pixelsPerSecond}px`;

            mark.innerHTML =
                `<span>${formatTime(
                    second,
                    false
                )}</span>`;

            dom.timelineRuler.appendChild(mark);
        }
    }

    function renderTimelineClips() {
        const contentMap = {
            video: dom.videoTrackContent,
            overlay: dom.overlayTrackContent,
            text: dom.textTrackContent,
            voice: dom.voiceTrackContent,
            music: dom.musicTrackContent
        };

        Object.values(contentMap).forEach((element) => {
            if (element) {
                element.innerHTML = "";
            }
        });

        state.tracks.forEach((track) => {
            let container =
                contentMap[track.type];

            if (!container) {
                container =
                    document.querySelector(
                        `[data-track-id="${track.id}"] .track-content`
                    );
            }

            if (!container) return;

            container.style.width =
                `${getTimelineWidth()}px`;

            const pixelsPerSecond =
                getTimelinePixelsPerSecond();

            track.clips
                .sort(
                    (a, b) =>
                        a.start - b.start
                )
                .forEach((clip) => {
                    const element =
                        createTimelineClipElement(
                            clip,
                            track,
                            pixelsPerSecond
                        );

                    container.appendChild(
                        element
                    );
                });
        });
    }

    function createTimelineClipElement(
        clip,
        track,
        pixelsPerSecond
    ) {
        const element =
            document.createElement("div");

        element.className =
            "timeline-clip";

        element.dataset.clipId =
            clip.id;

        element.dataset.trackId =
            track.id;

        element.style.left =
            `${clip.start * pixelsPerSecond}px`;

        element.style.width =
            `${Math.max(
                20,
                clip.duration * pixelsPerSecond
            )}px`;

        if (
            state.selection.id === clip.id &&
            state.selection.trackId === track.id
        ) {
            element.classList.add("selected");
        }

        if (track.locked) {
            element.classList.add("locked");
        }

        const title =
            clip.type === "text"
                ? clip.text || "Texte"
                : clip.name || clip.type;

        element.innerHTML = `
            <span class="timeline-clip-title">
                ${escapeHTML(title)}
            </span>
            <span class="timeline-clip-duration">
                ${formatTime(clip.duration, false)}
            </span>
        `;

        element.addEventListener("click", (event) => {
            event.stopPropagation();

            selectClip(
                track.id,
                clip.id
            );
        });

        element.addEventListener(
            "dblclick",
            (event) => {
                event.stopPropagation();

                seekTo(clip.start);
            }
        );

        setupClipDragging(
            element,
            clip,
            track,
            pixelsPerSecond
        );

        return element;
    }

    function setupClipDragging(
        element,
        clip,
        track,
        pixelsPerSecond
    ) {
        element.addEventListener(
            "pointerdown",
            (event) => {
                if (track.locked) return;

                if (
                    event.button !== 0 &&
                    event.pointerType === "mouse"
                ) {
                    return;
                }

                dragState = {
                    pointerId: event.pointerId,
                    startX: event.clientX,
                    originalStart: clip.start,
                    clipId: clip.id,
                    trackId: track.id,
                    changed: false
                };

                element.setPointerCapture?.(
                    event.pointerId
                );
            }
        );

        element.addEventListener(
            "pointermove",
            (event) => {
                if (
                    !dragState ||
                    dragState.pointerId !==
                        event.pointerId
                ) {
                    return;
                }

                const deltaPixels =
                    event.clientX -
                    dragState.startX;

                const deltaSeconds =
                    deltaPixels /
                    pixelsPerSecond;

                let newStart =
                    dragState.originalStart +
                    deltaSeconds;

                newStart = clamp(
                    newStart,
                    0,
                    CONFIG.MAX_DURATION -
                        clip.duration
                );

                if (
                    Math.abs(
                        newStart -
                            clip.start
                    ) > 0.001
                ) {
                    clip.start =
                        round(newStart);

                    dragState.changed = true;

                    renderTimelineClips();
                    updatePlayheadPosition();
                    markDirty();
                }
            }
        );

        element.addEventListener(
            "pointerup",
            (event) => {
                if (
                    dragState &&
                    dragState.pointerId ===
                        event.pointerId
                ) {
                    if (dragState.changed) {
                        pushHistory();
                    }

                    dragState = null;
                }
            }
        );

        element.addEventListener(
            "pointercancel",
            () => {
                dragState = null;
            }
        );
    }

    function renderTimelineTrackControls() {
        state.tracks.forEach((track) => {
            const trackElement =
                document.querySelector(
                    `[data-track-id="${track.id}"]`
                );

            if (!trackElement) return;

            trackElement.dataset.locked =
                track.locked
                    ? "true"
                    : "false";

            trackElement.dataset.muted =
                track.muted
                    ? "true"
                    : "false";

            const muteButton =
                trackElement.querySelector(
                    `[data-action="mute-track"]`
                );

            const lockButton =
                trackElement.querySelector(
                    `[data-action="lock-track"]`
                );

            if (muteButton) {
                muteButton.textContent =
                    track.muted
                        ? "🔇"
                        : "🔊";
            }

            if (lockButton) {
                lockButton.textContent =
                    track.locked
                        ? "🔒"
                        : "🔓";
            }
        });
    }

    function updatePlayheadPosition() {
        if (!dom.timelinePlayhead) return;

        const pixelsPerSecond =
            getTimelinePixelsPerSecond();

        dom.timelinePlayhead.style.left =
            `${
                state.playback.currentTime *
                pixelsPerSecond
            }px`;
    }

    /* =========================================================
       BIBLIOTHÈQUES
    ========================================================== */

    function renderMediaLibrary() {
        if (!dom.mediaLibrary) return;

        dom.mediaLibrary.innerHTML = "";

        const mediaItems =
            state.media.filter(
                (media) =>
                    media.type === "image" ||
                    media.type === "video"
            );

        if (!mediaItems.length) {
            dom.mediaLibrary.innerHTML =
                `<div class="empty-library">
                    Aucun média importé.
                </div>`;

            return;
        }

        mediaItems.forEach((media) => {
            const item =
                document.createElement("article");

            item.className =
                "media-library-item";

            const url =
                state.editor.mediaObjectUrls[
                    media.id
                ];

            if (media.type === "image") {
                item.innerHTML = `
                    <div class="media-thumbnail">
                        <img
                            src="${url || ""}"
                            alt="${escapeHTML(media.name)}"
                        >
                    </div>
                    <div class="media-item-info">
                        <strong>${escapeHTML(
                            media.name
                        )}</strong>
                        <small>Image</small>
                    </div>
                    <button
                        type="button"
                        class="small-button"
                        data-media-add="${media.id}"
                    >
                        Ajouter
                    </button>
                `;
            } else {
                item.innerHTML = `
                    <div class="media-thumbnail">
                        <video
                            src="${url || ""}"
                            muted
                            playsinline
                        ></video>
                    </div>
                    <div class="media-item-info">
                        <strong>${escapeHTML(
                            media.name
                        )}</strong>
                        <small>
                            ${formatTime(
                                media.duration || 0,
                                false
                            )}
                        </small>
                    </div>
                    <button
                        type="button"
                        class="small-button"
                        data-media-add="${media.id}"
                    >
                        Ajouter
                    </button>
                `;
            }

            dom.mediaLibrary.appendChild(item);
        });

        dom.mediaLibrary
            .querySelectorAll("[data-media-add]")
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        addMediaToTimeline(
                            button.dataset.mediaAdd
                        );
                    }
                );
            });
    }

    function renderAudioLibrary() {
        if (!dom.audioLibrary) return;

        dom.audioLibrary.innerHTML = "";

        const audioItems =
            state.media.filter(
                (media) =>
                    media.type === "audio"
            );

        if (!audioItems.length) {
            dom.audioLibrary.innerHTML =
                `<div class="empty-library">
                    Aucun audio importé.
                </div>`;

            return;
        }

        audioItems.forEach((media) => {
            const item =
                document.createElement("div");

            item.className = "asset-list-item";

            item.innerHTML = `
                <div>
                    <strong>${escapeHTML(
                        media.name
                    )}</strong>
                    <small>
                        ${formatTime(
                            media.duration || 0,
                            false
                        )}
                    </small>
                </div>

                <button
                    type="button"
                    class="small-button"
                    data-audio-add="${media.id}"
                >
                    Ajouter
                </button>
            `;

            dom.audioLibrary.appendChild(item);
        });

        dom.audioLibrary
            .querySelectorAll("[data-audio-add]")
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        addMediaToTimeline(
                            button.dataset.audioAdd
                        );
                    }
                );
            });
    }

    /* =========================================================
       VOIX IA LOCALE
    ========================================================== */

    function generateVoice() {
        const text =
            dom.voiceText.value.trim();

        if (!text) {
            notify(
                "Saisissez un texte de narration.",
                "error"
            );
            return;
        }

        if (!("speechSynthesis" in window)) {
            notify(
                "La synthèse vocale n'est pas disponible sur ce navigateur.",
                "error"
            );
            return;
        }

        pushHistory();

        const utterance =
            new SpeechSynthesisUtterance(text);

        utterance.lang =
            dom.voiceLanguage.value || "fr-FR";

        const style =
            dom.voiceStyle.value;

        switch (style) {
            case "energetic":
                utterance.rate = 1.15;
                utterance.pitch = 1.08;
                break;

            case "calm":
                utterance.rate = 0.85;
                utterance.pitch = 0.95;
                break;

            case "commercial":
                utterance.rate = 1.05;
                utterance.pitch = 1.02;
                break;

            case "professional":
                utterance.rate = 0.98;
                utterance.pitch = 1;
                break;

            default:
                utterance.rate = 1;
                utterance.pitch = 1;
        }

        const voices =
            window.speechSynthesis.getVoices();

        const preferred =
            voices.find(
                (voice) =>
                    voice.lang ===
                    utterance.lang
            ) ||
            voices.find(
                (voice) =>
                    voice.lang.startsWith(
                        utterance.lang.slice(0, 2)
                    )
            );

        if (preferred) {
            utterance.voice = preferred;
        }

        window.speechSynthesis.cancel();

        utterance.onstart = () => {
            setSystemStatus(
                "Génération de la voix..."
            );

            dom.generateVoiceButton.disabled =
                true;
        };

        utterance.onend = () => {
            dom.generateVoiceButton.disabled =
                false;

            setSystemStatus("Voix prête");

            createVoiceClip(
                text,
                estimateSpeechDuration(text),
                utterance.lang,
                style
            );
        };

        utterance.onerror = () => {
            dom.generateVoiceButton.disabled =
                false;

            notify(
                "La synthèse vocale a rencontré une erreur.",
                "error"
            );
        };

        window.speechSynthesis.speak(
            utterance
        );

        notify(
            "Prévisualisation de la voix en cours...",
            "info"
        );
    }

    function estimateSpeechDuration(text) {
        const words =
            text.trim().split(/\s+/).length;

        return clamp(
            words / 2.5,
            1,
            CONFIG.MAX_DURATION
        );
    }

    function createVoiceClip(
        text,
        duration,
        language,
        style
    ) {
        const track =
            getTrack("voice-track-1");

        if (!track) return;

        const start =
            findFreeTimelinePosition(
                track,
                duration
            );

        if (
            start + duration >
            CONFIG.MAX_DURATION
        ) {
            notify(
                "La narration dépasse la limite de 5 minutes.",
                "error"
            );
            return;
        }

        const clip = {
            id: uid("voice"),
            type: "voice",
            name: "Voix IA",
            start,
            duration,

            text,
            language,
            style,

            x: 0,
            y: 0,
            scaleX: 100,
            scaleY: 100,
            rotation: 0,
            opacity: 100,

            volume: 100,
            fadeIn: 0,
            fadeOut: 0
        };

        track.clips.push(clip);

        state.selection = {
            type: "voice",
            id: clip.id,
            trackId: track.id
        };

        recalculateDuration();

        renderAll();

        markDirty();

        notify(
            "Clip de voix IA ajouté à la timeline.",
            "success"
        );
    }

    /* =========================================================
       IMAGE IA LOCALE / SIMULATION
    ========================================================== */

    function generateImage() {
        const prompt =
            dom.imagePrompt.value.trim();

        if (!prompt) {
            notify(
                "Décrivez l'image à générer.",
                "error"
            );
            return;
        }

        const style =
            dom.imageStyle.value || "realistic";

        setSystemStatus(
            "Génération d'image..."
        );

        dom.generateImageButton.disabled =
            true;

        setTimeout(() => {
            const generated =
                createGeneratedImage(
                    prompt,
                    style
                );

            renderGeneratedImages();

            dom.generateImageButton.disabled =
                false;

            setSystemStatus("Image prête");

            notify(
                "Image générée localement.",
                "success"
            );
        }, 700);
    }

    function createGeneratedImage(
        prompt,
        style
    ) {
        const canvas =
            document.createElement("canvas");

        canvas.width = 1280;
        canvas.height = 720;

        const ctx =
            canvas.getContext("2d");

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                canvas.width,
                canvas.height
            );

        gradient.addColorStop(
            0,
            "#111827"
        );

        gradient.addColorStop(
            1,
            "#312e81"
        );

        ctx.fillStyle = gradient;
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "rgba(255,255,255,.08)";

        ctx.fillRect(
            80,
            80,
            canvas.width - 160,
            canvas.height - 160
        );

        ctx.fillStyle = "#ffffff";

        ctx.textAlign = "center";

        ctx.font =
            "700 46px Arial";

        ctx.fillText(
            "IMAGE IA",
            canvas.width / 2,
            canvas.height / 2 - 50
        );

        ctx.font =
            "28px Arial";

        const shortPrompt =
            prompt.length > 80
                ? prompt.slice(0, 80) + "…"
                : prompt;

        ctx.fillText(
            shortPrompt,
            canvas.width / 2,
            canvas.height / 2 + 10
        );

        ctx.font =
            "22px Arial";

        ctx.fillText(
            `Style : ${style}`,
            canvas.width / 2,
            canvas.height / 2 + 55
        );

        const url =
            canvas.toDataURL("image/png");

        const generated = {
            id: uid("generated-image"),
            type: "image",
            name: `Image IA — ${style}`,
            prompt,
            style,
            url,
            createdAt: Date.now()
        };

        state.editor.generatedObjectUrls[
            generated.id
        ] = url;

        if (!state.generatedImages) {
            state.generatedImages = [];
        }

        state.generatedImages.unshift(
            generated
        );

        return generated;
    }

    function renderGeneratedImages() {
        if (!dom.generatedImageLibrary) {
            return;
        }

        dom.generatedImageLibrary.innerHTML = "";

        const images =
            state.generatedImages || [];

        images.forEach((item) => {
            const element =
                document.createElement("article");

            element.className =
                "generated-library-item";

            element.innerHTML = `
                <img
                    src="${item.url}"
                    alt="${escapeHTML(
                        item.prompt
                    )}"
                >

                <div>
                    <strong>${escapeHTML(
                        item.name
                    )}</strong>
                    <small>${escapeHTML(
                        item.style
                    )}</small>
                </div>

                <button
                    type="button"
                    class="small-button"
                    data-generated-image-add="${item.id}"
                >
                    Ajouter
                </button>
            `;

            dom.generatedImageLibrary.appendChild(
                element
            );
        });

        dom.generatedImageLibrary
            .querySelectorAll(
                "[data-generated-image-add]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        addGeneratedImageToTimeline(
                            button.dataset.generatedImageAdd
                        );
                    }
                );
            });
    }

    function addGeneratedImageToTimeline(id) {
        const generated =
            (state.generatedImages || [])
                .find(
                    (item) =>
                        item.id === id
                );

        if (!generated) return;

        const track =
            getTrack("overlay-track-1");

        if (!track) return;

        pushHistory();

        const duration = 5;

        const start =
            findFreeTimelinePosition(
                track,
                duration
            );

        if (
            start + duration >
            CONFIG.MAX_DURATION
        ) {
            notify(
                "La durée maximale de 5 minutes est atteinte.",
                "error"
            );
            return;
        }

        const clip = {
            id: uid("generated-image-clip"),
            type: "overlay",
            name: generated.name,
            start,
            duration,
            mediaId: null,
            generatedUrl: generated.url,

            x: 0,
            y: 0,
            scaleX: 100,
            scaleY: 100,
            rotation: 0,
            opacity: 100,

            brightness: 100,
            contrast: 100,
            saturation: 100,

            effect: "none",
            transition: "none",

            volume: 100,
            fadeIn: 0,
            fadeOut: 0,

            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            perspective: 1000
        };

        track.clips.push(clip);

        state.selection = {
            type: clip.type,
            id: clip.id,
            trackId: track.id
        };

        recalculateDuration();
        renderAll();
        markDirty();

        notify(
            "Image IA ajoutée à la timeline.",
            "success"
        );
    }

    /* =========================================================
       VIDÉO IA LOCALE / SIMULATION
    ========================================================== */

    function generateVideo() {
        const prompt =
            dom.videoPrompt.value.trim();

        if (!prompt) {
            notify(
                "Décrivez la scène vidéo.",
                "error"
            );
            return;
        }

        const duration =
            clamp(
                number(
                    dom.aiVideoDuration.value,
                    5
                ),
                1,
                10
            );

        dom.generateVideoButton.disabled =
            true;

        setSystemStatus(
            "Préparation de la vidéo IA..."
        );

        setTimeout(() => {
            const generated =
                createGeneratedVideo(
                    prompt,
                    duration
                );

            renderGeneratedVideos();

            dom.generateVideoButton.disabled =
                false;

            setSystemStatus("Vidéo IA prête");

            notify(
                "Séquence vidéo IA locale créée.",
                "success"
            );
        }, 900);
    }

    function createGeneratedVideo(
        prompt,
        duration
    ) {
        const canvas =
            document.createElement("canvas");

        canvas.width = 1280;
        canvas.height = 720;

        const stream =
            canvas.captureStream(30);

        const mimeType =
            getSupportedVideoMimeType();

        if (!mimeType) {
            notify(
                "Votre navigateur ne supporte pas l'enregistrement vidéo local.",
                "error"
            );
            return null;
        }

        const recorder =
            new MediaRecorder(
                stream,
                {
                    mimeType
                }
            );

        const chunks = [];

        const generated = {
            id: uid("generated-video"),
            type: "video",
            name: "Vidéo IA",
            prompt,
            duration,
            url: null,
            mimeType,
            createdAt: Date.now()
        };

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        recorder.onstop = () => {
            const blob =
                new Blob(
                    chunks,
                    { type: mimeType }
                );

            const url =
                URL.createObjectURL(blob);

            generated.url = url;

            state.editor.generatedObjectUrls[
                generated.id
            ] = url;

            if (!state.generatedVideos) {
                state.generatedVideos = [];
            }

            state.generatedVideos.unshift(
                generated
            );

            renderGeneratedVideos();
        };

        recorder.start();

        const start =
            performance.now();

        function draw() {
            if (
                recorder.state !==
                "recording"
            ) {
                return;
            }

            const elapsed =
                (performance.now() -
                    start) /
                1000;

            const progress =
                clamp(
                    elapsed /
                        Math.max(
                            0.1,
                            duration
                        ),
                    0,
                    1
                );

            drawGeneratedVideoFrame(
                canvas,
                prompt,
                progress
            );

            if (progress >= 1) {
                recorder.stop();
                return;
            }

            requestAnimationFrame(draw);
        }

        draw();

        return generated;
    }

    function drawGeneratedVideoFrame(
        canvas,
        prompt,
        progress
    ) {
        const ctx =
            canvas.getContext("2d");

        const width =
            canvas.width;

        const height =
            canvas.height;

        const hue =
            Math.floor(
                progress * 360
            );

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                width,
                height
            );

        gradient.addColorStop(
            0,
            `hsl(${hue},60%,15%)`
        );

        gradient.addColorStop(
            1,
            `hsl(${(hue + 80) % 360},70%,25%)`
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

        ctx.save();

        ctx.translate(
            width / 2,
            height / 2
        );

        ctx.rotate(
            progress * Math.PI * 2
        );

        ctx.fillStyle =
            "rgba(255,255,255,.10)";

        ctx.fillRect(
            -220,
            -220,
            440,
            440
        );

        ctx.restore();

        ctx.fillStyle =
            "rgba(0,0,0,.45)";

        ctx.fillRect(
            0,
            height - 170,
            width,
            170
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.textAlign =
            "center";

        ctx.font =
            "700 44px Arial";

        ctx.fillText(
            "VIDÉO IA",
            width / 2,
            height - 105
        );

        ctx.font =
            "24px Arial";

        const text =
            prompt.length > 80
                ? prompt.slice(0, 80) + "…"
                : prompt;

        ctx.fillText(
            text,
            width / 2,
            height - 60
        );
    }

    function getSupportedVideoMimeType() {
        const types = [
            "video/webm;codecs=vp9,opus",
            "video/webm;codecs=vp8,opus",
            "video/webm"
        ];

        return (
            types.find((type) =>
                window.MediaRecorder?.isTypeSupported(
                    type
                )
            ) || ""
        );
    }

    function renderGeneratedVideos() {
        if (!dom.generatedVideoLibrary) {
            return;
        }

        dom.generatedVideoLibrary.innerHTML = "";

        const videos =
            state.generatedVideos || [];

        videos.forEach((item) => {
            const element =
                document.createElement("article");

            element.className =
                "generated-library-item";

            element.innerHTML = `
                <video
                    src="${item.url || ""}"
                    muted
                    playsinline
                    controls
                ></video>

                <div>
                    <strong>${escapeHTML(
                        item.name
                    )}</strong>
                    <small>
                        ${formatTime(
                            item.duration,
                            false
                        )}
                    </small>
                </div>

                <button
                    type="button"
                    class="small-button"
                    data-generated-video-add="${item.id}"
                >
                    Ajouter
                </button>
            `;

            dom.generatedVideoLibrary.appendChild(
                element
            );
        });

        dom.generatedVideoLibrary
            .querySelectorAll(
                "[data-generated-video-add]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        addGeneratedVideoToTimeline(
                            button.dataset.generatedVideoAdd
                        );
                    }
                );
            });
    }

    function addGeneratedVideoToTimeline(id) {
        const generated =
            (state.generatedVideos || [])
                .find(
                    (item) =>
                        item.id === id
                );

        if (!generated?.url) return;

        const track =
            getTrack("video-track-1");

        if (!track) return;

        pushHistory();

        const duration =
            clamp(
                generated.duration,
                0.1,
                10
            );

        const start =
            findFreeTimelinePosition(
                track,
                duration
            );

        if (
            start + duration >
            CONFIG.MAX_DURATION
        ) {
            notify(
                "La durée maximale de 5 minutes est atteinte.",
                "error"
            );
            return;
        }

        const clip = {
            id: uid("ai-video-clip"),
            type: "video",
            name: generated.name,
            start,
            duration,
            generatedUrl: generated.url,

            x: 0,
            y: 0,
            scaleX: 100,
            scaleY: 100,
            rotation: 0,
            opacity: 100,

            brightness: 100,
            contrast: 100,
            saturation: 100,

            effect: "none",
            transition: "none",

            volume: 100,
            fadeIn: 0,
            fadeOut: 0
        };

        track.clips.push(clip);

        state.selection = {
            type: clip.type,
            id: clip.id,
            trackId: track.id
        };

        recalculateDuration();
        renderAll();
        markDirty();

        notify(
            "Vidéo IA ajoutée à la timeline.",
            "success"
        );
    }

    /* =========================================================
       ONGLETS
    ========================================================== */

    function switchTab(tab) {
        const panels = document.querySelectorAll(
            "[data-panel]"
        );

        const buttons = document.querySelectorAll(
            "[data-tab]"
        );

        panels.forEach((panel) => {
            const active =
                panel.dataset.panel === tab;

            panel.hidden = !active;
            panel.classList.toggle(
                "active",
                active
            );
        });

        buttons.forEach((button) => {
            button.classList.toggle(
                "active",
                button.dataset.tab === tab
            );
        });

        state.editor.activeTab = tab;
    }

    /* =========================================================
       INSPECTEUR
    ========================================================== */

    function updateInspector() {
        const clip = getSelectedClip();

        if (!clip) {
            resetInspectorToDefaults();
            return;
        }

        dom.positionX.value =
            number(clip.x, 0);

        dom.positionY.value =
            number(clip.y, 0);

        dom.scaleX.value =
            number(clip.scaleX, 100);

        dom.scaleY.value =
            number(clip.scaleY, 100);

        dom.rotation.value =
            number(clip.rotation, 0);

        dom.opacity.value =
            number(clip.opacity, 100);

        dom.clipStart.value =
            number(clip.start, 0);

        dom.clipDuration.value =
            number(clip.duration, 5);

        dom.volumeControl.value =
            number(clip.volume, 100);

        dom.fadeInDuration.value =
            number(clip.fadeIn, 0);

        dom.fadeOutDuration.value =
            number(clip.fadeOut, 0);

        if (clip.type === "text") {
            dom.textContent.value =
                clip.text || "";

            dom.textFont.value =
                clip.font || "Arial";

            dom.textSize.value =
                number(clip.fontSize, 48);

            dom.textColor.value =
                clip.color || "#ffffff";

            dom.textAnimation.value =
                clip.animation || "none";
        }

        dom.rotationX.value =
            number(clip.rotationX, 0);

        dom.rotationY.value =
            number(clip.rotationY, 0);

        dom.rotationZ.value =
            number(clip.rotationZ, 0);

        dom.perspective3D.value =
            number(clip.perspective, 1000);

        syncInspectorColorControls();
    }

    function resetInspectorToDefaults() {
        const defaults = {
            positionX: 0,
            positionY: 0,
            scaleX: 100,
            scaleY: 100,
            rotation: 0,
            opacity: 100,
            clipStart: 0,
            clipDuration: 5,
            volume: 100,
            fadeInDuration: 0,
            fadeOutDuration: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            perspective3D: 1000
        };

        Object.entries(defaults).forEach(
            ([id, value]) => {
                if (dom[id]) {
                    dom[id].value = value;
                }
            }
        );

        if (dom.textContent) {
            dom.textContent.value = "";
        }
    }

    function syncInspectorColorControls() {
        const clip = getSelectedClip();

        const brightness =
            number(
                clip?.brightness,
                100
            );

        const contrast =
            number(
                clip?.contrast,
                100
            );

        const saturation =
            number(
                clip?.saturation,
                100
            );

        dom.brightnessControl.value =
            brightness;

        dom.contrastControl.value =
            contrast;

        dom.saturationControl.value =
            saturation;
    }

    function closeInspector() {
        state.editor.inspectorOpen = false;

        if (dom.rightSidebar) {
            dom.rightSidebar.classList.add(
                "inspector-closed"
            );
        }
    }

    /* =========================================================
       RENDU GLOBAL
    ========================================================== */

    function renderAll() {
        state.project.duration =
            getProjectDuration();

        renderMediaLibrary();
        renderAudioLibrary();
        renderGeneratedImages();
        renderGeneratedVideos();

        renderTimeline();

        renderPreview();

        updateInspector();

        renderEffects();
        renderTransitions();

        updatePlayerUI();

        updatePreviewZoomUI();
        updateTimelineZoomUI();

        updateUndoRedoButtons();

        updateExportSummary();
    }

    function recalculateDuration() {
        state.project.duration =
            getProjectDuration();

        if (
            state.playback.currentTime >
            state.project.duration
        ) {
            state.playback.currentTime =
                state.project.duration;
        }

        updateExportSummary();
    }

    /* =========================================================
       EFFETS / TRANSITIONS UI
    ========================================================== */

    function renderEffects() {
        if (!dom.effectsList) return;

        const selected =
            getSelectedClip();

        dom.effectsList
            .querySelectorAll("[data-effect]")
            .forEach((button) => {
                const active =
                    button.dataset.effect ===
                    selected?.effect;

                button.classList.toggle(
                    "active",
                    active
                );
            });
    }

    function renderTransitions() {
        if (!dom.transitionList) return;

        const selected =
            getSelectedClip();

        dom.transitionList
            .querySelectorAll("[data-transition]")
            .forEach((button) => {
                const active =
                    button.dataset.transition ===
                    selected?.transition;

                button.classList.toggle(
                    "active",
                    active
                );
            });
    }

    /* =========================================================
       PLAYER UI
    ========================================================== */

    function updatePlayerUI() {
        if (dom.playButton) {
            dom.playButton.textContent =
                state.playback.isPlaying
                    ? "❚❚"
                    : "▶";
        }

        if (dom.currentTimeDisplay) {
            dom.currentTimeDisplay.textContent =
                formatTime(
                    state.playback.currentTime,
                    true
                );
        }

        if (dom.totalTimeDisplay) {
            dom.totalTimeDisplay.textContent =
                formatTime(
                    getProjectDuration(),
                    true
                );
        }

        if (dom.playerSeek) {
            dom.playerSeek.max =
                String(
                    Math.max(
                        CONFIG.MAX_DURATION,
                        getProjectDuration()
                    )
                );

            dom.playerSeek.value =
                state.playback.currentTime;
        }

        if (dom.muteButton) {
            dom.muteButton.textContent =
                state.playback.isMuted
                    ? "🔇"
                    : "🔊";
        }

        renderPreviewOverlay();
    }

    /* =========================================================
       FORMAT / RÉSOLUTION / FPS
    ========================================================== */

    function applyProjectFormat() {
        state.project.format =
            dom.videoFormat.value;

        updatePreviewResolution();

        renderPreview();

        markDirty();
    }

    function applyProjectResolution() {
        state.project.resolution =
            dom.videoResolution.value;

        updatePreviewResolution();

        renderPreview();

        markDirty();
    }

    function applyProjectFPS() {
        state.project.fps =
            number(
                dom.frameRate.value,
                30
            );

        markDirty();
    }

    /* =========================================================
       EXPORT
    ========================================================== */

    function openExportDialog() {
        updateExportSummary();

        if (
            typeof dom.exportDialog.showModal ===
            "function"
        ) {
            dom.exportDialog.showModal();
        } else {
            dom.exportDialog.setAttribute(
                "open",
                ""
            );
        }
    }

    function updateExportSummary() {
        if (dom.exportProjectName) {
            dom.exportProjectName.textContent =
                state.project.name;
        }

        if (dom.exportDuration) {
            dom.exportDuration.textContent =
                formatTime(
                    getProjectDuration(),
                    false
                );
        }

        if (dom.exportResolution) {
            const resolution =
                getResolutionSize(
                    state.project.resolution
                );

            dom.exportResolution.textContent =
                `${resolution.width} × ${resolution.height}`;
        }
    }

    async function confirmExport(event) {
        if (event) event.preventDefault();

        const duration =
            getProjectDuration();

        if (duration <= 0) {
            notify(
                "La timeline est vide.",
                "error"
            );
            return;
        }

        if (duration > CONFIG.MAX_DURATION) {
            notify(
                "La vidéo ne peut pas dépasser 5 minutes.",
                "error"
            );
            return;
        }

        dom.confirmExportButton.disabled =
            true;

        dom.exportProgressContainer.hidden =
            false;

        setSystemStatus(
            "Préparation de l'export..."
        );

        try {
            const blob =
                await renderProjectToWebM(
                    (progress) => {
                        dom.exportProgress.value =
                            progress;

                        dom.exportProgressLabel.textContent =
                            `${Math.round(
                                progress
                            )}%`;
                    }
                );

            if (!blob) {
                throw new Error(
                    "Export impossible."
                );
            }

            const requestedFormat =
                dom.exportFormat.value;

            const extension =
                requestedFormat === "mp4"
                    ? "mp4"
                    : "webm";

            downloadBlob(
                blob,
                `${sanitizeFilename(
                    state.project.name
                )}.${extension}`
            );

            notify(
                requestedFormat === "mp4"
                    ? "Le navigateur ne fournit pas nécessairement un encodeur MP4. Le fichier exporté utilise l'encodage WebM compatible disponible."
                    : "Vidéo exportée avec succès.",
                "success",
                5000
            );

            setSystemStatus(
                "Export terminé"
            );

            closeDialog(dom.exportDialog);
        } catch (error) {
            console.error(error);

            notify(
                `Erreur d'export : ${error.message}`,
                "error",
                5000
            );

            setSystemStatus(
                "Erreur d'export"
            );
        } finally {
            dom.confirmExportButton.disabled =
                false;
        }
    }

    async function renderProjectToWebM(
        onProgress
    ) {
        if (!dom.previewCanvas) {
            throw new Error(
                "Canvas de rendu introuvable."
            );
        }

        const mimeType =
            getSupportedVideoMimeType();

        if (!mimeType) {
            throw new Error(
                "MediaRecorder/WebM n'est pas disponible dans ce navigateur."
            );
        }

        const canvas =
            document.createElement("canvas");

        const resolution =
            getResolutionSize(
                state.project.resolution
            );

        canvas.width =
            Math.min(
                resolution.width,
                1920
            );

        canvas.height =
            Math.min(
                resolution.height,
                1080
            );

        const ctx =
            canvas.getContext("2d");

        const fps =
            clamp(
                number(state.project.fps, 30),
                1,
                60
            );

        const stream =
            canvas.captureStream(fps);

        const recorder =
            new MediaRecorder(
                stream,
                {
                    mimeType,
                    videoBitsPerSecond:
                        chooseVideoBitrate()
                }
            );

        const chunks = [];

        recorder.ondataavailable =
            (event) => {
                if (event.data.size > 0) {
                    chunks.push(
                        event.data
                    );
                }
            };

        const duration =
            getProjectDuration();

        return new Promise(
            (resolve, reject) => {
                recorder.onerror = () => {
                    reject(
                        new Error(
                            "Erreur MediaRecorder."
                        )
                    );
                };

                recorder.onstop = () => {
                    resolve(
                        new Blob(
                            chunks,
                            {
                                type: mimeType
                            }
                        )
                    );
                };

                recorder.start(250);

                let frame = 0;

                const totalFrames =
                    Math.max(
                        1,
                        Math.ceil(
                            duration * fps
                        )
                    );

                const renderFrame = () => {
                    if (
                        frame >=
                        totalFrames
                    ) {
                        recorder.stop();
                        return;
                    }

                    const time =
                        frame / fps;

                    drawExportFrame(
                        ctx,
                        canvas.width,
                        canvas.height,
                        time
                    );

                    frame++;

                    onProgress(
                        (frame /
                            totalFrames) *
                            100
                    );

                    requestAnimationFrame(
                        renderFrame
                    );
                };

                renderFrame();
            }
        );
    }

    function chooseVideoBitrate() {
        switch (dom.exportQuality.value) {
            case "maximum":
                return 12_000_000;

            case "high":
                return 7_000_000;

            default:
                return 4_000_000;
        }
    }

    function drawExportFrame(
        ctx,
        width,
        height,
        time
    ) {
        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        drawPreviewBackground(
            ctx,
            width,
            height
        );

        state.tracks.forEach((track) => {
            if (track.muted) return;

            track.clips.forEach((clip) => {
                if (
                    time < clip.start ||
                    time >=
                        clip.start + clip.duration
                ) {
                    return;
                }

                if (
                    clip.type === "video" ||
                    clip.type === "overlay"
                ) {
                    drawExportMediaClip(
                        ctx,
                        clip,
                        width,
                        height,
                        time
                    );
                }

                if (clip.type === "text") {
                    drawExportTextClip(
                        ctx,
                        clip,
                        width,
                        height,
                        time
                    );
                }
            });
        });
    }

    function drawExportMediaClip(
        ctx,
        clip,
        width,
        height,
        time
    ) {
        let sourceUrl = null;

        if (clip.generatedUrl) {
            sourceUrl = clip.generatedUrl;
        }

        if (clip.mediaId) {
            const media =
                state.media.find(
                    (item) =>
                        item.id ===
                        clip.mediaId
                );

            if (!media) return;

            sourceUrl =
                state.editor.mediaObjectUrls[
                    media.id
                ];
        }

        if (!sourceUrl) return;

        if (clip.generatedUrl) {
            const image =
                getCachedImage(
                    clip.id,
                    sourceUrl
                );

            if (image.complete) {
                drawImageElement(
                    ctx,
                    image,
                    clip,
                    width,
                    height
                );
            }

            return;
        }

        const media =
            state.media.find(
                (item) =>
                    item.id ===
                    clip.mediaId
            );

        if (!media) return;

        if (media.type === "image") {
            const image =
                getCachedImage(
                    media.id,
                    sourceUrl
                );

            if (image.complete) {
                drawImageElement(
                    ctx,
                    image,
                    clip,
                    width,
                    height
                );
            }
        }

        if (media.type === "video") {
            const video =
                getCachedVideo(
                    media.id,
                    sourceUrl
                );

            const desiredTime =
                clip.sourceStart +
                (
                    time -
                    clip.start
                );

            try {
                video.currentTime =
                    clamp(
                        desiredTime,
                        0,
                        Math.max(
                            0,
                            media.duration ||
                                desiredTime
                        )
                    );
            } catch {}

            if (video.readyState >= 2) {
                drawVideoElement(
                    ctx,
                    sourceUrl,
                    clip,
                    width,
                    height
                );
            }
        }
    }

    function drawExportTextClip(
        ctx,
        clip,
        width,
        height,
        time
    ) {
        const localTime =
            time - clip.start;

        let text =
            clip.text || "";

        const progress =
            clamp(
                localTime /
                    Math.max(
                        0.001,
                        clip.duration
                    ),
                0,
                1
            );

        if (clip.animation === "typewriter") {
            text =
                text.slice(
                    0,
                    Math.floor(
                        text.length *
                            progress
                    )
                );
        }

        ctx.save();

        ctx.globalAlpha =
            clamp(
                number(
                    clip.opacity,
                    100
                ) / 100,
                0,
                1
            );

        ctx.translate(
            width / 2 +
                number(clip.x),
            height / 2 +
                number(clip.y)
        );

        ctx.rotate(
            number(clip.rotation, 0) *
                Math.PI /
                180
        );

        ctx.scale(
            number(clip.scaleX, 100) /
                100,
            number(clip.scaleY, 100) /
                100
        );

        ctx.fillStyle =
            clip.color ||
            "#ffffff";

        ctx.font =
            `700 ${
                number(
                    clip.fontSize,
                    48
                )
            }px ${
                clip.font ||
                "Arial"
            }`;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.shadowColor =
            "rgba(0,0,0,.75)";

        ctx.shadowBlur = 15;

        drawWrappedText(
            ctx,
            text,
            0,
            0,
            width * 0.8,
            number(
                clip.fontSize,
                48
            ) * 1.2
        );

        ctx.restore();
    }

    function drawWrappedText(
        ctx,
        text,
        x,
        y,
        maxWidth,
        lineHeight
    ) {
        const words =
            text.split(/\s+/);

        let line = "";
        const lines = [];

        words.forEach((word) => {
            const test =
                line
                    ? `${line} ${word}`
                    : word;

            const metrics =
                ctx.measureText(test);

            if (
                metrics.width >
                    maxWidth &&
                line
            ) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        });

        if (line) {
            lines.push(line);
        }

        const totalHeight =
            lines.length *
            lineHeight;

        let currentY =
            y -
            totalHeight / 2 +
            lineHeight / 2;

        lines.forEach((lineText) => {
            ctx.fillText(
                lineText,
                x,
                currentY
            );

            currentY += lineHeight;
        });
    }

    function downloadBlob(
        blob,
        filename
    ) {
        const url =
            URL.createObjectURL(blob);

        const anchor =
            document.createElement("a");

        anchor.href = url;
        anchor.download = filename;

        document.body.appendChild(anchor);

        anchor.click();

        anchor.remove();

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 5000);
    }

    function sanitizeFilename(name) {
        return (
            name
                .trim()
                .replace(
                    /[<>:"/\\|?*\x00-\x1F]/g,
                    "_"
                )
                .slice(0, 100) ||
            "video-fobas"
        );
    }

    /* =========================================================
       PLEIN ÉCRAN
    ========================================================== */

    async function toggleFullscreenPreview() {
        const target =
            dom.previewStage ||
            dom.previewSection;

        if (!target) return;

        try {
            if (!document.fullscreenElement) {
                await target.requestFullscreen?.();
            } else {
                await document.exitFullscreen?.();
            }
        } catch (error) {
            console.warn(
                "Fullscreen indisponible",
                error
            );
        }
    }

    /* =========================================================
       LOAD PROJECT DIALOG
    ========================================================== */

    function openLoadProjectDialog() {
        renderSavedProjects();

        if (
            typeof dom.loadProjectDialog.showModal ===
            "function"
        ) {
            dom.loadProjectDialog.showModal();
        } else {
            dom.loadProjectDialog.setAttribute(
                "open",
                ""
            );
        }
    }

    function renderSavedProjects() {
        if (!dom.savedProjectsList) return;

        const raw =
            localStorage.getItem(
                CONFIG.STORAGE_LIST_KEY
            );

        const list =
            safeParseJSON(raw, []);

        dom.savedProjectsList.innerHTML = "";

        if (!list.length) {
            dom.savedProjectsList.innerHTML =
                `<div class="empty-library">
                    Aucun projet sauvegardé.
                </div>`;

            return;
        }

        list.forEach((project) => {
            const item =
                document.createElement("article");

            item.className =
                "saved-project-item";

            item.innerHTML = `
                <div>
                    <strong>${escapeHTML(
                        project.name
                    )}</strong>

                    <small>
                        ${escapeHTML(
                            project.format
                        )}
                        ·
                        ${escapeHTML(
                            project.resolution
                        )}
                        ·
                        ${formatTime(
                            project.duration || 0,
                            false
                        )}
                    </small>
                </div>

                <button
                    type="button"
                    class="small-button"
                    data-load-saved-project="${project.id}"
                >
                    Charger
                </button>

                <button
                    type="button"
                    class="danger-action small-button"
                    data-delete-saved-project="${project.id}"
                >
                    Supprimer
                </button>
            `;

            dom.savedProjectsList.appendChild(
                item
            );
        });

        dom.savedProjectsList
            .querySelectorAll(
                "[data-load-saved-project]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        loadProjectById(
                            button.dataset
                                .loadSavedProject
                        );
                    }
                );
            });

        dom.savedProjectsList
            .querySelectorAll(
                "[data-delete-saved-project]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        deleteSavedProject(
                            button.dataset
                                .deleteSavedProject
                        );
                    }
                );
            });
    }

    function loadProjectById(id) {
        const raw =
            localStorage.getItem(
                CONFIG.STORAGE_LIST_KEY
            );

        const list =
            safeParseJSON(raw, []);

        const project =
            list.find(
                (item) =>
                    item.id === id
            );

        if (!project?.state) {
            notify(
                "Projet introuvable.",
                "error"
            );
            return;
        }

        stopPlayback();

        isRestoringState = true;

        state.history.undo = [];
        state.history.redo = [];

        mergeState(project.state);

        isRestoringState = false;

        renderAll();

        markSaved();

        closeDialog(
            dom.loadProjectDialog
        );

        notify(
            "Projet chargé avec succès.",
            "success"
        );
    }

    function deleteSavedProject(id) {
        const confirmed =
            window.confirm(
                "Supprimer ce projet local ?"
            );

        if (!confirmed) return;

        const raw =
            localStorage.getItem(
                CONFIG.STORAGE_LIST_KEY
            );

        const list =
            safeParseJSON(raw, []);

        const filtered =
            list.filter(
                (item) =>
                    item.id !== id
            );

        localStorage.setItem(
            CONFIG.STORAGE_LIST_KEY,
            JSON.stringify(filtered)
        );

        if (
            state.project.id === id
        ) {
            localStorage.removeItem(
                CONFIG.STORAGE_KEY
            );
        }

        renderSavedProjects();

        notify(
            "Projet supprimé.",
            "success"
        );
    }

    /* =========================================================
       DRAG & DROP
    ========================================================== */

    function setupMediaDropZone() {
        if (!dom.mediaDropZone) return;

        [
            "dragenter",
            "dragover"
        ].forEach((eventName) => {
            dom.mediaDropZone.addEventListener(
                eventName,
                (event) => {
                    event.preventDefault();

                    dom.mediaDropZone.classList.add(
                        "drag-over"
                    );
                }
            );
        });

        [
            "dragleave",
            "drop"
        ].forEach((eventName) => {
            dom.mediaDropZone.addEventListener(
                eventName,
                (event) => {
                    event.preventDefault();

                    dom.mediaDropZone.classList.remove(
                        "drag-over"
                    );
                }
            );
        });

        dom.mediaDropZone.addEventListener(
            "drop",
            (event) => {
                const files =
                    event.dataTransfer?.files;

                if (files?.length) {
                    importMediaFiles(files);
                }
            }
        );
    }

    /* =========================================================
       DATA-ACTION CENTRAL
    ========================================================== */

    function setupActionDelegation() {
        document.addEventListener(
            "click",
            (event) => {
                const actionElement =
                    event.target.closest(
                        "[data-action]"
                    );

                if (!actionElement) return;

                const action =
                    actionElement.dataset.action;

                switch (action) {
                    case "home":
                        createNewProject(
                            "Nouveau projet",
                            "16:9"
                        );
                        break;

                    case "new-project":
                        openNewProjectDialog();
                        break;

                    case "save-project":
                        saveProject();
                        break;

                    case "load-project":
                        openLoadProjectDialog();
                        break;

                    case "undo":
                        undo();
                        break;

                    case "redo":
                        redo();
                        break;

                    case "export":
                        openExportDialog();
                        break;

                    case "import-media":
                        openMediaPicker();
                        break;

                    case "clear-media":
                        clearMedia();
                        break;

                    case "import-audio":
                        openAudioPicker();
                        break;

                    case "add-text":
                        addTextClip();
                        break;

                    case "generate-voice":
                        generateVoice();
                        break;

                    case "generate-image":
                        generateImage();
                        break;

                    case "generate-video":
                        generateVideo();
                        break;

                    case "zoom-out":
                        zoomPreview(
                            -CONFIG.ZOOM_STEP
                        );
                        break;

                    case "zoom-in":
                        zoomPreview(
                            CONFIG.ZOOM_STEP
                        );
                        break;

                    case "zoom-reset":
                        resetPreviewZoom();
                        break;

                    case "fit-preview":
                        fitPreview();
                        break;

                    case "fullscreen-preview":
                        toggleFullscreenPreview();
                        break;

                    case "previous-frame":
                        previousFrame();
                        break;

                    case "play":
                        play();
                        break;

                    case "next-frame":
                        nextFrame();
                        break;

                    case "mute":
                        toggleMute();
                        break;

                    case "playback-settings":
                        notify(
                            "Lecture : contrôles standard actifs.",
                            "info"
                        );
                        break;

                    case "add-track":
                        addTrack();
                        break;

                    case "split-clip":
                        splitSelectedClip();
                        break;

                    case "delete-clip":
                        deleteSelectedClip();
                        break;

                    case "duplicate-clip":
                        duplicateSelectedClip();
                        break;

                    case "timeline-zoom-out":
                        zoomTimeline(
                            -CONFIG.TIMELINE_ZOOM_STEP
                        );
                        break;

                    case "timeline-zoom-in":
                        zoomTimeline(
                            CONFIG.TIMELINE_ZOOM_STEP
                        );
                        break;

                    case "mute-track":
                        toggleTrackMute(
                            actionElement.dataset
                                .trackId
                        );
                        break;

                    case "lock-track":
                        toggleTrackLock(
                            actionElement.dataset
                                .trackId
                        );
                        break;

                    case "close-inspector":
                        closeInspector();
                        break;

                    case "duplicate-selected":
                        duplicateSelectedClip();
                        break;

                    case "delete-selected":
                        deleteSelectedClip();
                        break;

                    case "reset-color":
                        resetColor();
                        break;

                    case "close-new-project-dialog":
                    case "cancel-new-project":
                        closeDialog(
                            dom.newProjectDialog
                        );
                        break;

                    case "close-export-dialog":
                    case "cancel-export":
                        closeDialog(
                            dom.exportDialog
                        );
                        break;

                    case "close-load-dialog":
                        closeDialog(
                            dom.loadProjectDialog
                        );
                        break;

                    case "clear-saved-projects":
                        clearSavedProjects();
                        break;

                    default:
                        break;
                }
            }
        );
    }

    /* =========================================================
       DATA-TAB
    ========================================================== */

    function setupTabDelegation() {
        document.addEventListener(
            "click",
            (event) => {
                const button =
                    event.target.closest(
                        "[data-tab]"
                    );

                if (!button) return;

                switchTab(
                    button.dataset.tab
                );
            }
        );
    }

    /* =========================================================
       DATA-EFFECT / DATA-TRANSITION
    ========================================================== */

    function setupEffectDelegation() {
        document.addEventListener(
            "click",
            (event) => {
                const effectButton =
                    event.target.closest(
                        "[data-effect]"
                    );

                if (effectButton) {
                    applyEffect(
                        effectButton.dataset.effect
                    );
                    return;
                }

                const transitionButton =
                    event.target.closest(
                        "[data-transition]"
                    );

                if (transitionButton) {
                    applyTransition(
                        transitionButton.dataset
                            .transition
                    );
                }
            }
        );
    }

    /* =========================================================
       DATA-PROPERTY / DATA-FIELD
    ========================================================== */

    function setupFieldDelegation() {
        document.addEventListener(
            "input",
            (event) => {
                const element =
                    event.target;

                if (
                    element.matches(
                        "[data-property]"
                    )
                ) {
                    updateSelectedProperty(
                        element.dataset
                            .property,
                        element.value
                    );

                    return;
                }

                if (
                    element.matches(
                        "[data-field]"
                    )
                ) {
                    handleFieldChange(
                        element,
                        false
                    );
                }
            }
        );

        document.addEventListener(
            "change",
            (event) => {
                const element =
                    event.target;

                if (
                    element.matches(
                        "[data-property]"
                    )
                ) {
                    updateSelectedProperty(
                        element.dataset
                            .property,
                        element.value
                    );

                    return;
                }

                if (
                    element.matches(
                        "[data-field]"
                    )
                ) {
                    handleFieldChange(
                        element,
                        true
                    );
                }
            }
        );
    }

    function handleFieldChange(
        element,
        committed
    ) {
        const field =
            element.dataset.field;

        switch (field) {
            case "project-name":
                state.project.name =
                    element.value.trim() ||
                    "Nouveau projet";

                updateExportSummary();

                if (committed) {
                    markDirty();
                }
                break;

            case "video-format":
                applyProjectFormat();
                break;

            case "video-resolution":
                applyProjectResolution();
                break;

            case "frame-rate":
                applyProjectFPS();
                break;

            case "text-content":
            case "text-font":
            case "text-size":
            case "text-color":
            case "text-animation":
                updateTextPropertiesFromControls();
                break;

            case "player-seek":
                seekTo(element.value);
                break;

            case "rotation-x":
            case "rotation-y":
            case "rotation-z":
            case "perspective-3d":
                apply3DControls();
                break;

            case "brightness":
            case "contrast":
            case "saturation":
                applyColorControls();
                break;

            default:
                break;
        }
    }

    /* =========================================================
       FILE INPUTS
    ========================================================== */

    function setupFileInputs() {
        dom.mediaFileInput?.addEventListener(
            "change",
            () => {
                importMediaFiles(
                    dom.mediaFileInput.files
                );

                dom.mediaFileInput.value = "";
            }
        );

        dom.audioFileInput?.addEventListener(
            "change",
            () => {
                importAudioFiles(
                    dom.audioFileInput.files
                );

                dom.audioFileInput.value = "";
            }
        );
    }

    /* =========================================================
       FORMULAIRES
    ========================================================== */

    function setupForms() {
        dom.newProjectForm?.addEventListener(
            "submit",
            confirmNewProject
        );

        dom.exportForm?.addEventListener(
            "submit",
            confirmExport
        );

        dom.closeNewProjectDialogButton?.addEventListener(
            "click",
            () =>
                closeDialog(
                    dom.newProjectDialog
                )
        );

        dom.cancelNewProjectButton?.addEventListener(
            "click",
            () =>
                closeDialog(
                    dom.newProjectDialog
                )
        );

        dom.closeExportDialogButton?.addEventListener(
            "click",
            () =>
                closeDialog(
                    dom.exportDialog
                )
        );

        dom.cancelExportButton?.addEventListener(
            "click",
            () =>
                closeDialog(
                    dom.exportDialog
                )
        );

        dom.closeLoadProjectDialogButton?.addEventListener(
            "click",
            () =>
                closeDialog(
                    dom.loadProjectDialog
                )
        );
    }

    /* =========================================================
       KEYBOARD
    ========================================================== */

    function setupKeyboard() {
        document.addEventListener(
            "keydown",
            (event) => {
                const target =
                    event.target;

                const isTyping =
                    target.matches?.(
                        "input, textarea, select"
                    );

                if (
                    isTyping &&
                    !event.ctrlKey &&
                    !event.metaKey
                ) {
                    return;
                }

                const modifier =
                    event.ctrlKey ||
                    event.metaKey;

                if (
                    modifier &&
                    event.key.toLowerCase() ===
                        "s"
                ) {
                    event.preventDefault();

                    saveProject();

                    return;
                }

                if (
                    modifier &&
                    event.key.toLowerCase() ===
                        "z"
                ) {
                    event.preventDefault();

                    if (event.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }

                    return;
                }

                if (
                    modifier &&
                    event.key.toLowerCase() ===
                        "y"
                ) {
                    event.preventDefault();

                    redo();

                    return;
                }

                if (
                    event.key === " "
                    && !isTyping
                ) {
                    event.preventDefault();

                    play();
                }

                if (
                    event.key === "ArrowLeft"
                    && !isTyping
                ) {
                    event.preventDefault();

                    previousFrame();
                }

                if (
                    event.key === "ArrowRight"
                    && !isTyping
                ) {
                    event.preventDefault();

                    nextFrame();
                }

                if (
                    event.key === "Delete"
                    && !isTyping
                ) {
                    event.preventDefault();

                    deleteSelectedClip();
                }

                if (
                    event.key === "Escape"
                ) {
                    stopPlayback();
                }
            }
        );
    }

    /* =========================================================
       FENÊTRE
    ========================================================== */

    function setupWindowEvents() {
        window.addEventListener(
            "beforeunload",
            () => {
                if (
                    dom.projectStatus?.dataset
                        .status === "dirty"
                ) {
                    saveProject(false);
                }
            }
        );

        document.addEventListener(
            "fullscreenchange",
            () => {
                state.editor.previewFullscreen =
                    Boolean(
                        document.fullscreenElement
                    );
            }
        );
    }

    /* =========================================================
       INITIALISATION
    ========================================================== */

    function syncAllUI() {
        if (dom.projectName) {
            dom.projectName.value =
                state.project.name;
        }

        if (dom.videoFormat) {
            dom.videoFormat.value =
                state.project.format;
        }

        if (dom.videoResolution) {
            dom.videoResolution.value =
                state.project.resolution;
        }

        if (dom.frameRate) {
            dom.frameRate.value =
                String(
                    state.project.fps || 30
                );
        }

        if (dom.maxDurationLabel) {
            dom.maxDurationLabel.textContent =
                "05:00";
        }

        updatePreviewResolution();

        updatePreviewZoomUI();
        updateTimelineZoomUI();

        switchTab(
            state.editor.activeTab || "media"
        );
    }

    function initializeGeneratedState() {
        if (!Array.isArray(state.generatedImages)) {
            state.generatedImages = [];
        }

        if (!Array.isArray(state.generatedVideos)) {
            state.generatedVideos = [];
        }
    }

    function loadLastProjectIfAvailable() {
        const raw =
            localStorage.getItem(
                CONFIG.STORAGE_KEY
            );

        if (!raw) return false;

        const parsed =
            safeParseJSON(raw, null);

        if (!parsed) return false;

        const useLast =
            window.confirm(
                "Un projet local a été trouvé. Voulez-vous le restaurer ?"
            );

        if (!useLast) return false;

        isRestoringState = true;

        mergeState(parsed);

        isRestoringState = false;

        return true;
    }

    function hideLoader() {
        if (!dom.applicationLoader) return;

        dom.applicationLoader.classList.add(
            "hidden"
        );

        setTimeout(() => {
            dom.applicationLoader.style.display =
                "none";
        }, 350);
    }

    function showLoader(
        title,
        message
    ) {
        if (!dom.applicationLoader) return;

        dom.applicationLoader.style.display =
            "flex";

        dom.applicationLoader.classList.remove(
            "hidden"
        );

        if (dom.loaderTitle) {
            dom.loaderTitle.textContent =
                title;
        }

        if (dom.loaderMessage) {
            dom.loaderMessage.textContent =
                message;
        }
    }

    function initialize() {
        cacheDOM();

        showLoader(
            "Initialisation",
            "Préparation du laboratoire..."
        );

        readInitialState();

        initializeGeneratedState();

        const restored =
            loadLastProjectIfAvailable();

        if (!restored) {
            state.project.duration =
                getProjectDuration();
        }

        setupActionDelegation();
        setupTabDelegation();
        setupEffectDelegation();
        setupFieldDelegation();
        setupFileInputs();
        setupForms();
        setupKeyboard();
        setupWindowEvents();
        setupMediaDropZone();
        setupPinchZoom();

        syncAllUI();

        renderAll();

        updateUndoRedoButtons();

        markSaved();

        dom.connectionStatus.textContent =
            navigator.onLine
                ? "Mode local / réseau disponible"
                : "Mode local / hors ligne";

        dom.storageStatus.textContent =
            "Stockage local activé";

        setRenderStatus(
            "Moteur prêt"
        );

        setSystemStatus(
            "Prêt"
        );

        setTimeout(
            hideLoader,
            500
        );
    }

    /* =========================================================
       DOM READY
    ========================================================== */

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }

})();





























