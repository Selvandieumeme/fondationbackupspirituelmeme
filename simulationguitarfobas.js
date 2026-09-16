/* ============================================================
   FOBAS GUITAR SIMULATOR
   ------------------------------------------------------------
   VERSION : 4.0.0
   ENGINE  : FOBASGuitarEngine
   TYPE    : Professional Interactive Guitar Simulator
   ------------------------------------------------------------
   Compatible with:
   simulationguitarfobas.html
   ------------------------------------------------------------
   Architecture:
   - Dynamic Guitar Renderer
   - Multi Instrument System
   - Web Audio Guitar Engine
   - Chord Engine
   - Strumming Engine
   - Tuner
   - Metronome
   - Practice Engine
   - Performance Tracking
   - Touch / Keyboard Controls
   - Local Persistence
   ============================================================ */

(() => {

    "use strict";

    /* =========================================================
       GLOBAL ENGINE
    ========================================================= */

    const G = window.FOBASGuitarEngine =
        window.FOBASGuitarEngine || {};

    /* =========================================================
       CONFIGURATION
    ========================================================= */

    const CONFIG = {

        version: "4.0.0",

        storageKey:
            "FOBAS_GUITAR_SIMULATOR_STATE_V4",

        defaultInstrument:
            "acoustic",

        defaultBPM:
            80,

        minBPM:
            40,

        maxBPM:
            220,

        defaultVolume:
            0.85,

        defaultReverb:
            0.25,

        defaultFrets:
            12,

        maxFrets:
            24

    };

    /* =========================================================
       INSTRUMENT DATABASE
    ========================================================= */

    const INSTRUMENTS = {

        acoustic: {

            id: "acoustic",

            name:
                "Acoustic Guitar",

            shortName:
                "Acoustic",

            type:
                "guitar",

            strings:
                6,

            tuning:
                ["E", "A", "D", "G", "B", "E"],

            frequencies:
                [
                    82.41,
                    110.00,
                    146.83,
                    196.00,
                    246.94,
                    329.63
                ],

            stringNames:
                ["E", "A", "D", "G", "B", "E"],

            baseFrequency:
                82.41,

            color:
                "wood",

            body:
                "acoustic"

        },

        classical: {

            id: "classical",

            name:
                "Classical Guitar",

            shortName:
                "Classical",

            type:
                "guitar",

            strings:
                6,

            tuning:
                ["E", "A", "D", "G", "B", "E"],

            frequencies:
                [
                    82.41,
                    110.00,
                    146.83,
                    196.00,
                    246.94,
                    329.63
                ],

            stringNames:
                ["E", "A", "D", "G", "B", "E"],

            baseFrequency:
                82.41,

            color:
                "classical",

            body:
                "classical"

        },

        electric: {

            id: "electric",

            name:
                "Electric Guitar",

            shortName:
                "Electric",

            type:
                "guitar",

            strings:
                6,

            tuning:
                ["E", "A", "D", "G", "B", "E"],

            frequencies:
                [
                    82.41,
                    110.00,
                    146.83,
                    196.00,
                    246.94,
                    329.63
                ],

            stringNames:
                ["E", "A", "D", "G", "B", "E"],

            baseFrequency:
                82.41,

            color:
                "electric",

            body:
                "electric"

        },

        bass4: {

            id: "bass4",

            name:
                "Bass Guitar 4 Strings",

            shortName:
                "Bass 4",

            type:
                "bass",

            strings:
                4,

            tuning:
                ["E", "A", "D", "G"],

            frequencies:
                [
                    41.20,
                    55.00,
                    73.42,
                    98.00
                ],

            stringNames:
                ["E", "A", "D", "G"],

            baseFrequency:
                41.20,

            color:
                "bass",

            body:
                "bass"

        },

        bass5: {

            id: "bass5",

            name:
                "Bass Guitar 5 Strings",

            shortName:
                "Bass 5",

            type:
                "bass",

            strings:
                5,

            tuning:
                ["B", "E", "A", "D", "G"],

            frequencies:
                [
                    30.87,
                    41.20,
                    55.00,
                    73.42,
                    98.00
                ],

            stringNames:
                ["B", "E", "A", "D", "G"],

            baseFrequency:
                30.87,

            color:
                "bass",

            body:
                "bass"

        },

        guitar12: {

            id: "guitar12",

            name:
                "12 String Guitar",

            shortName:
                "12 String",

            type:
                "guitar12",

            strings:
                12,

            tuning:
                [
                    "E",
                    "E",
                    "A",
                    "A",
                    "D",
                    "D",
                    "G",
                    "G",
                    "B",
                    "B",
                    "E",
                    "E"
                ],

            frequencies:
                [
                    82.41,
                    82.41,
                    110.00,
                    110.00,
                    146.83,
                    146.83,
                    196.00,
                    196.00,
                    246.94,
                    246.94,
                    329.63,
                    329.63
                ],

            stringNames:
                [
                    "E",
                    "E",
                    "A",
                    "A",
                    "D",
                    "D",
                    "G",
                    "G",
                    "B",
                    "B",
                    "E",
                    "E"
                ],

            baseFrequency:
                82.41,

            color:
                "twelve",

            body:
                "acoustic"

        }

    };

    G.instruments =
        INSTRUMENTS;

    /* =========================================================
       CHORD DATABASE
    ========================================================= */

    const CHORDS = {

        C: {
            name: "C",
            frets: [-1, 3, 2, 0, 1, 0]
        },

        D: {
            name: "D",
            frets: [-1, -1, 0, 2, 3, 2]
        },

        E: {
            name: "E",
            frets: [0, 2, 2, 1, 0, 0]
        },

        F: {
            name: "F",
            frets: [1, 3, 3, 2, 1, 1]
        },

        G: {
            name: "G",
            frets: [3, 2, 0, 0, 0, 3]
        },

        A: {
            name: "A",
            frets: [-1, 0, 2, 2, 2, 0]
        },

        Am: {
            name: "Am",
            frets: [-1, 0, 2, 2, 1, 0]
        },

        Em: {
            name: "Em",
            frets: [0, 2, 2, 0, 0, 0]
        },

        Dm: {
            name: "Dm",
            frets: [-1, -1, 0, 2, 3, 1]
        }

    };

    G.chords =
        CHORDS;

    /* =========================================================
       STATE
    ========================================================= */

    const DEFAULT_STATE = {

        instrumentId:
            CONFIG.defaultInstrument,

        bpm:
            CONFIG.defaultBPM,

        volume:
            CONFIG.defaultVolume,

        reverb:
            CONFIG.defaultReverb,

        muted:
            false,

        metronomeActive:
            false,

        practiceActive:
            false,

        selectedChord:
            null,

        currentNote:
            null,

        currentFrequency:
            0,

        frettedStrings:
            new Map(),

        noteCount:
            0,

        chordCount:
            0,

        correctNotes:
            0,

        startedAt:
            null,

        tunerActive:
            false

    };

    const state = {

        ...DEFAULT_STATE,

        frettedStrings:
            new Map()

    };

    G.state =
        state;

    /* =========================================================
       DOM CACHE
    ========================================================= */

    const DOM = {

        app:
            document.querySelector(
                "#fobas-guitar-app"
            ),

        main:
            document.querySelector(
                "#guitar-main"
            ),

        guitarStage:
            document.querySelector(
                "#guitar-stage"
            ),

        guitarBody:
            document.querySelector(
                "#guitar-body"
            ),

        guitarNeck:
            document.querySelector(
                "#guitar-neck"
            ),

        fretboard:
            document.querySelector(
                "#fretboard"
            ),

        fretMarkers:
            document.querySelector(
                "#fret-markers"
            ),

        fretsLayer:
            document.querySelector(
                "#frets-layer"
            ),

        stringsLayer:
            document.querySelector(
                "#strings-layer"
            ),

        fingerLayer:
            document.querySelector(
                "#finger-layer"
            ),

        fretTouchLayer:
            document.querySelector(
                "#fret-touch-layer"
            ),

        tuningPegs:
            document.querySelector(
                "#tuning-pegs"
            ),

        instrumentTitle:
            document.querySelector(
                "#instrument-title"
            ),

        stringCount:
            document.querySelector(
                "#instrument-string-count"
            ),

        guitarName:
            document.querySelector(
                "#guitar-name"
            ),

        guitarTuning:
            document.querySelector(
                "#guitar-tuning"
            ),

        currentNote:
            document.querySelector(
                "#current-note"
            ),

        currentFrequency:
            document.querySelector(
                "#current-frequency"
            ),

        activeChord:
            document.querySelector(
                "#active-chord"
            ),

        noteDisplay:
            document.querySelector(
                "#note-display"
            ),

        tunerStatus:
            document.querySelector(
                "#tuner-status"
            ),

        tunerNote:
            document.querySelector(
                "#tuner-note"
            ),

        tunerNeedle:
            document.querySelector(
                "#tuner-needle"
            ),

        tunerCents:
            document.querySelector(
                "#tuner-cents"
            ),

        bpmRange:
            document.querySelector(
                "#bpm-range"
            ),

        bpmDisplay:
            document.querySelector(
                "#bpm-display"
            ),

        volumeRange:
            document.querySelector(
                "#volume-range"
            ),

        volumeDisplay:
            document.querySelector(
                "#volume-display"
            ),

        reverbRange:
            document.querySelector(
                "#reverb-range"
            ),

        reverbDisplay:
            document.querySelector(
                "#reverb-display"
            ),

        lessonProgressBar:
            document.querySelector(
                "#lesson-progress-bar"
            ),

        lessonMessage:
            document.querySelector(
                "#lesson-message"
            ),

        performanceValues:
            Array.from(
                document.querySelectorAll(
                    ".performance-value"
                )
            ),

        interactionMessage:
            document.querySelector(
                "#interaction-message"
            ),

        appError:
            document.querySelector(
                "#app-error"
            ),

        appErrorMessage:
            document.querySelector(
                "#app-error-message"
            ),

        errorClose:
            document.querySelector(
                "#btn-error-close"
            )

    };

    G.DOM =
        DOM;

    /* =========================================================
       UTILITY
    ========================================================= */

    function clamp(
        value,
        min,
        max
    ) {

        return Math.max(
            min,
            Math.min(
                max,
                value
            )
        );

    }

    function midiToFrequency(
        midi
    ) {

        return 440 *
            Math.pow(
                2,
                (midi - 69) / 12
            );

    }

    function frequencyToMidi(
        frequency
    ) {

        return 69 +
            12 *
            Math.log2(
                frequency / 440
            );

    }

    function frequencyToNote(
        frequency
    ) {

        if (
            !frequency ||
            frequency <= 0
        ) {
            return {
                name: "—",
                cents: 0,
                midi: 0
            };
        }

        const midi =
            Math.round(
                frequencyToMidi(
                    frequency
                )
            );

        const names = [
            "C",
            "C#",
            "D",
            "D#",
            "E",
            "F",
            "F#",
            "G",
            "G#",
            "A",
            "A#",
            "B"
        ];

        const note =
            names[
                ((midi % 12) + 12) % 12
            ];

        const target =
            midiToFrequency(
                midi
            );

        const cents =
            Math.round(
                1200 *
                Math.log2(
                    frequency /
                    target
                )
            );

        return {

            name:
                note +
                (
                    Math.floor(
                        midi / 12
                    ) - 1
                ),

            cents,

            midi

        };

    }

    function normalizeInstrumentId(
        id
    ) {

        if (
            id === "twelve"
        ) {
            return "guitar12";
        }

        if (
            INSTRUMENTS[id]
        ) {
            return id;
        }

        return "acoustic";

    }

    /* =========================================================
       STORAGE
    ========================================================= */

    function saveState() {

        try {

            const data = {

                instrumentId:
                    state.instrumentId,

                bpm:
                    state.bpm,

                volume:
                    state.volume,

                reverb:
                    state.reverb,

                muted:
                    state.muted

            };

            localStorage.setItem(
                CONFIG.storageKey,
                JSON.stringify(
                    data
                )
            );

        } catch (error) {

            console.warn(
                "FOBAS Guitar storage:",
                error
            );

        }

    }

    function loadState() {

        try {

            const raw =
                localStorage.getItem(
                    CONFIG.storageKey
                );

            if (!raw) {
                return;
            }

            const data =
                JSON.parse(
                    raw
                );

            if (
                data.instrumentId
            ) {

                state.instrumentId =
                    normalizeInstrumentId(
                        data.instrumentId
                    );

            }

            if (
                Number.isFinite(
                    Number(data.bpm)
                )
            ) {

                state.bpm =
                    clamp(
                        Number(data.bpm),
                        CONFIG.minBPM,
                        CONFIG.maxBPM
                    );

            }

            if (
                Number.isFinite(
                    Number(data.volume)
                )
            ) {

                state.volume =
                    clamp(
                        Number(data.volume),
                        0,
                        1
                    );

            }

            if (
                Number.isFinite(
                    Number(data.reverb)
                )
            ) {

                state.reverb =
                    clamp(
                        Number(data.reverb),
                        0,
                        1
                    );

            }

            if (
                typeof data.muted ===
                "boolean"
            ) {

                state.muted =
                    data.muted;

            }

        } catch (error) {

            console.warn(
                "FOBAS Guitar state load:",
                error
            );

        }

    }

    G.saveState =
        saveState;

    /* =========================================================
       AUDIO ENGINE
    ========================================================= */

    const AudioEngine = {

        context:
            null,

        master:
            null,

        dry:
            null,

        wet:
            null,

        compressor:
            null,

        initialized:
            false,

        async init() {

            if (
                this.initialized &&
                this.context
            ) {

                if (
                    this.context.state ===
                    "suspended"
                ) {

                    await this.context.resume();

                }

                return;

            }

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) {

                throw new Error(
                    "Web Audio API not supported."
                );

            }

            this.context =
                new AudioContext();

            this.master =
                this.context.createGain();

            this.dry =
                this.context.createGain();

            this.wet =
                this.context.createGain();

            this.compressor =
                this.context
                    .createDynamicsCompressor();

            this.master.gain.value =
                state.volume;

            this.dry.gain.value =
                1;

            this.wet.gain.value =
                state.reverb;

            this.dry.connect(
                this.master
            );

            this.wet.connect(
                this.master
            );

            this.master.connect(
                this.compressor
            );

            this.compressor.connect(
                this.context.destination
            );

            this.initialized =
                true;

            this.updateStatus(
                true
            );

        },

        async resume() {

            if (!this.context) {

                await this.init();

                return;

            }

            if (
                this.context.state ===
                "suspended"
            ) {

                await this.context.resume();

            }

        },

        setVolume(
            value
        ) {

            state.volume =
                clamp(
                    Number(value),
                    0,
                    1
                );

            if (
                this.master &&
                this.context
            ) {

                this.master.gain.setTargetAtTime(
                    state.volume,
                    this.context.currentTime,
                    0.01
                );

            }

            updateVolumeUI();

            saveState();

        },

        setReverb(
            value
        ) {

            state.reverb =
                clamp(
                    Number(value),
                    0,
                    1
                );

            if (
                this.wet &&
                this.context
            ) {

                this.wet.gain.setTargetAtTime(
                    state.reverb,
                    this.context.currentTime,
                    0.02
                );

            }

            updateReverbUI();

        },

        updateStatus(
            ready
        ) {

            const dot =
                document.querySelector(
                    "#audio-status"
                );

            const text =
                document.querySelector(
                    "#audio-status-text"
                );

            if (dot) {

                dot.classList.toggle(
                    "status-off",
                    !ready
                );

                dot.classList.toggle(
                    "status-on",
                    ready
                );

            }

            if (text) {

                text.textContent =
                    ready
                        ? "Audio Ready"
                        : "Audio Locked";

            }

        }

    };

    G.Audio =
        AudioEngine;

    /* =========================================================
       MESSAGE SYSTEM
    ========================================================= */

    let messageTimer =
        null;

    function showMessage(
        message
    ) {

        if (
            !DOM.interactionMessage
        ) {
            return;
        }

        DOM.interactionMessage.textContent =
            message;

        DOM.interactionMessage.classList.add(
            "visible"
        );

        clearTimeout(
            messageTimer
        );

        messageTimer =
            setTimeout(
                () => {

                    DOM.interactionMessage.classList.remove(
                        "visible"
                    );

                },
                2200
            );

    }

    G.showMessage =
        showMessage;

    /* =========================================================
       ERROR SYSTEM
    ========================================================= */

    function showError(
        message
    ) {

        if (
            DOM.appErrorMessage
        ) {

            DOM.appErrorMessage.textContent =
                message;

        }

        if (
            DOM.appError
        ) {

            DOM.appError.hidden =
                false;

        }

    }

    G.showError =
        showError;

    if (
        DOM.errorClose
    ) {

        DOM.errorClose.addEventListener(
            "click",
            () => {

                if (DOM.appError) {

                    DOM.appError.hidden =
                        true;

                }

            }
        );

    }

    /* =========================================================
       INSTRUMENT HELPERS
    ========================================================= */

    function getInstrument() {

        return (
            INSTRUMENTS[
                state.instrumentId
            ] ||
            INSTRUMENTS.acoustic
        );

    }

    G.getInstrument =
        getInstrument;

    /* =========================================================
       GUITAR RENDER ENGINE
    ========================================================= */

    function renderGuitar() {

        if (
            !DOM.fretboard ||
            !DOM.stringsLayer ||
            !DOM.fretsLayer ||
            !DOM.fretTouchLayer
        ) {
            return;
        }

        const instrument =
            getInstrument();

        DOM.stringsLayer.innerHTML =
            "";

        DOM.fretsLayer.innerHTML =
            "";

        DOM.fretTouchLayer.innerHTML =
            "";

        if (DOM.fretMarkers) {

            DOM.fretMarkers.innerHTML =
                "";

        }

        if (DOM.tuningPegs) {

            DOM.tuningPegs.innerHTML =
                "";

        }

        if (DOM.fingerLayer) {

            DOM.fingerLayer.innerHTML =
                "";

        }

        for (
            let fret = 0;
            fret <= CONFIG.defaultFrets;
            fret++
        ) {

            const fretElement =
                document.createElement(
                    "div"
                );

            fretElement.className =
                "dynamic-fret";

            fretElement.dataset.fret =
                fret;

            if (
                fret === 0
            ) {

                fretElement.classList.add(
                    "nut-fret"
                );

            }

            DOM.fretsLayer.appendChild(
                fretElement
            );

        }

        for (
            let stringIndex = 0;
            stringIndex <
            instrument.strings;
            stringIndex++
        ) {

            const stringElement =
                document.createElement(
                    "div"
                );

            stringElement.className =
                "dynamic-string";

            stringElement.dataset.string =
                stringIndex;

            stringElement.dataset.note =
                instrument.stringNames[
                    stringIndex
                ];

            stringElement.style.setProperty(
                "--string-index",
                stringIndex
            );

            stringElement.style.setProperty(
                "--string-count",
                instrument.strings
            );

            DOM.stringsLayer.appendChild(
                stringElement
            );

            createStringFrets(
                stringIndex,
                instrument
            );

        }

        createFretMarkers(
            instrument
        );

        createTuningPegs(
            instrument
        );

        applyInstrumentVisual(
            instrument
        );

        updateInstrumentUI();

        bindDynamicFretTouches();

    }

    G.renderGuitar =
        renderGuitar;

    /* =========================================================
       FRET MARKERS
    ========================================================= */

    function createFretMarkers(
        instrument
    ) {

        if (!DOM.fretMarkers) {
            return;
        }

        const markerFrets =
            [
                3,
                5,
                7,
                9,
                12
            ];

        markerFrets.forEach(
            fret => {

                if (
                    fret >
                    CONFIG.defaultFrets
                ) {
                    return;
                }

                const marker =
                    document.createElement(
                        "div"
                    );

                marker.className =
                    "dynamic-fret-marker";

                marker.dataset.fret =
                    fret;

                if (
                    fret === 12
                ) {

                    marker.classList.add(
                        "double-marker"
                    );

                }

                DOM.fretMarkers.appendChild(
                    marker
                );

            }
        );

    }

    /* =========================================================
       STRING FRET GRID
    ========================================================= */

    function createStringFrets(
        stringIndex,
        instrument
    ) {

        if (
            !DOM.fretTouchLayer
        ) {
            return;
        }

        for (
            let fret = 0;
            fret <= CONFIG.defaultFrets;
            fret++
        ) {

            const touch =
                document.createElement(
                    "button"
                );

            touch.type =
                "button";

            touch.className =
                "fret-touch";

            touch.dataset.string =
                stringIndex;

            touch.dataset.fret =
                fret;

            touch.setAttribute(
                "aria-label",
                `${instrument.stringNames[stringIndex]} string fret ${fret}`
            );

            touch.style.setProperty(
                "--string-index",
                stringIndex
            );

            touch.style.setProperty(
                "--string-count",
                instrument.strings
            );

            touch.style.setProperty(
                "--fret-index",
                fret
            );

            DOM.fretTouchLayer.appendChild(
                touch
            );

        }

    }

    /* =========================================================
       TUNING PEGS
    ========================================================= */

    function createTuningPegs(
        instrument
    ) {

        if (!DOM.tuningPegs) {
            return;
        }

        instrument.tuning.forEach(
            (
                note,
                index
            ) => {

                const peg =
                    document.createElement(
                        "div"
                    );

                peg.className =
                    "dynamic-tuning-peg";

                peg.dataset.string =
                    index;

                peg.dataset.note =
                    note;

                peg.textContent =
                    note;

                DOM.tuningPegs.appendChild(
                    peg
                );

            }
        );

    }

    /* =========================================================
       INSTRUMENT VISUAL
    ========================================================= */

    function applyInstrumentVisual(
        instrument
    ) {

        if (!DOM.guitarStage) {
            return;
        }

        DOM.guitarStage.dataset.instrument =
            instrument.id;

        DOM.guitarStage.dataset.type =
            instrument.type;

        if (DOM.guitarBody) {

            DOM.guitarBody.dataset.instrument =
                instrument.id;

            DOM.guitarBody.className =
                `guitar-body guitar-body-${instrument.body}`;

        }

        if (DOM.instrumentTitle) {

            DOM.instrumentTitle.textContent =
                instrument.name;

        }

        if (DOM.stringCount) {

            DOM.stringCount.textContent =
                `${instrument.strings} Strings`;

        }

        if (DOM.guitarName) {

            DOM.guitarName.textContent =
                instrument.name;

        }

        if (DOM.guitarTuning) {

            DOM.guitarTuning.textContent =
                instrument.tuning.join(
                    " "
                );

        }

    }

    /* =========================================================
       INSTRUMENT UI
    ========================================================= */

    function updateInstrumentUI() {

        const instrument =
            getInstrument();

        document
            .querySelectorAll(
                ".instrument-card"
            )
            .forEach(
                card => {

                    const id =
                        normalizeInstrumentId(
                            card.dataset.instrument
                        );

                    const active =
                        id ===
                        instrument.id;

                    card.classList.toggle(
                        "active",
                        active
                    );

                    card.setAttribute(
                        "aria-pressed",
                        String(active)
                    );

                }
            );

        applyInstrumentVisual(
            instrument
        );

    }

    G.updateInstrumentUI =
        updateInstrumentUI;

    /* =========================================================
       NOTE PLAYBACK
    ========================================================= */

    async function playString(
        stringIndex,
        velocity = 0.9,
        fret = null
    ) {

        const instrument =
            getInstrument();

        if (
            stringIndex < 0 ||
            stringIndex >=
            instrument.strings
        ) {
            return;
        }

        await AudioEngine.init();

        await AudioEngine.resume();

        const baseFrequency =
            instrument.frequencies[
                stringIndex
            ];

        let actualFret =
            fret;

        if (
            actualFret === null
        ) {

            actualFret =
                state.frettedStrings.get(
                    stringIndex
                ) || 0;

        }

        const frequency =
            baseFrequency *
            Math.pow(
                2,
                actualFret / 12
            );

        const note =
            frequencyToNote(
                frequency
            );

        state.currentNote =
            note.name;

        state.currentFrequency =
            frequency;

        state.noteCount++;

        if (
            state.practiceActive
        ) {

            state.correctNotes++;

        }

        updateNoteDisplay(
            note,
            frequency
        );

        createGuitarTone(
            frequency,
            velocity,
            instrument
        );

        animateString(
            stringIndex
        );

        updatePracticeUI();

    }

    G.playString =
        playString;

    /* =========================================================
       GUITAR TONE
    ========================================================= */

    function createGuitarTone(
        frequency,
        velocity,
        instrument
    ) {

        if (
            !AudioEngine.context
        ) {
            return;
        }

        const ctx =
            AudioEngine.context;

        const now =
            ctx.currentTime;

        const osc =
            ctx.createOscillator();

        const gain =
            ctx.createGain();

        const filter =
            ctx.createBiquadFilter();

        osc.type =
            instrument.type ===
            "electric"
                ? "sawtooth"
                : "triangle";

        osc.frequency.setValueAtTime(
            frequency,
            now
        );

        filter.type =
            "lowpass";

        filter.frequency.setValueAtTime(
            instrument.type ===
            "bass"
                ? 900
                : 4200,
            now
        );

        filter.Q.value =
            0.7;

        const amplitude =
            clamp(
                Number(velocity),
                0,
                1
            ) *
            (
                state.muted
                    ? 0
                    : 0.22
            );

        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            Math.max(
                amplitude,
                0.0002
            ),
            now + 0.008
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + (
                instrument.type ===
                "bass"
                    ? 1.8
                    : 1.25
            )
        );

        osc.connect(
            filter
        );

        filter.connect(
            gain
        );

        gain.connect(
            AudioEngine.dry
        );

        if (
            AudioEngine.wet
        ) {

            gain.connect(
                AudioEngine.wet
            );

        }

        osc.start(
            now
        );

        osc.stop(
            now + 1.9
        );

    }

    /* =========================================================
       STRUM
    ========================================================= */

    async function strum(
        direction = "down",
        velocity = 0.9
    ) {

        const instrument =
            getInstrument();

        await AudioEngine.init();

        await AudioEngine.resume();

        const indexes =
            Array.from(
                {
                    length:
                        instrument.strings
                },
                (_, i) => i
            );

        if (
            direction === "up"
        ) {

            indexes.reverse();

        }

        indexes.forEach(
            (
                stringIndex,
                position
            ) => {

                const fret =
                    state.frettedStrings.get(
                        stringIndex
                    ) || 0;

                setTimeout(
                    () => {

                        playString(
                            stringIndex,
                            velocity,
                            fret
                        );

                    },
                    position * 28
                );

            }
        );

        animateStrum(
            direction
        );

    }

    G.strum =
        strum;

    G.strumDown =
        () =>
            strum(
                "down",
                0.92
            );

    G.strumUp =
        () =>
            strum(
                "up",
                0.92
            );

    /* =========================================================
       STRUM VISUAL
    ========================================================= */

    function animateStrum(
        direction
    ) {

        const hand =
            document.querySelector(
                "#strumming-hand"
            );

        if (!hand) {
            return;
        }

        hand.classList.remove(
            "strum-down",
            "strum-up"
        );

        void hand.offsetWidth;

        hand.classList.add(
            direction === "up"
                ? "strum-up"
                : "strum-down"
        );

    }

    function animateString(
        stringIndex
    ) {

        const element =
            DOM.stringsLayer?.querySelector(
                `[data-string="${stringIndex}"]`
            );

        if (!element) {
            return;
        }

        element.classList.remove(
            "vibrating"
        );

        void element.offsetWidth;

        element.classList.add(
            "vibrating"
        );

        setTimeout(
            () => {

                element.classList.remove(
                    "vibrating"
                );

            },
            280
        );

    }

    /* =========================================================
       FRET INTERACTION
    ========================================================= */

    function bindDynamicFretTouches() {

        DOM.fretTouchLayer
            ?.querySelectorAll(
                ".fret-touch"
            )
            .forEach(
                touch => {

                    const handler =
                        async event => {

                            event.preventDefault();

                            const stringIndex =
                                Number(
                                    touch.dataset.string
                                );

                            const fret =
                                Number(
                                    touch.dataset.fret
                                );

                            state.frettedStrings.set(
                                stringIndex,
                                fret
                            );

                            touch.classList.add(
                                "active"
                            );

                            updateFinger(
                                stringIndex,
                                fret
                            );

                            await playString(
                                stringIndex,
                                0.88,
                                fret
                            );

                        };

                    touch.addEventListener(
                        "pointerdown",
                        handler
                    );

                }
            );

    }

    /* =========================================================
       FINGER VISUAL
    ========================================================= */

    function updateFinger(
        stringIndex,
        fret
    ) {

        if (!DOM.fingerLayer) {
            return;
        }

        const existing =
            DOM.fingerLayer.querySelector(
                `[data-string="${stringIndex}"]`
            );

        if (existing) {
            existing.remove();
        }

        if (fret <= 0) {
            return;
        }

        const finger =
            document.createElement(
                "div"
            );

        finger.className =
            "virtual-finger";

        finger.dataset.string =
            stringIndex;

        finger.dataset.fret =
            fret;

        finger.style.setProperty(
            "--string-index",
            stringIndex
        );

        finger.style.setProperty(
            "--string-count",
            getInstrument().strings
        );

        finger.style.setProperty(
            "--fret-index",
            fret
        );

        finger.textContent =
            fret;

        DOM.fingerLayer.appendChild(
            finger
        );

    }

    /* =========================================================
       CHORD ENGINE
    ========================================================= */

    function playChord(
        chordName
    ) {

        const chord =
            CHORDS[chordName];

        if (!chord) {
            return;
        }

        const instrument =
            getInstrument();

        state.selectedChord =
            chordName;

        state.chordCount++;

        document
            .querySelectorAll(
                ".chord-button"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.chord ===
                        chordName
                    );

                }
            );

        if (DOM.activeChord) {

            DOM.activeChord.textContent =
                chordName;

        }

        state.frettedStrings.clear();

        chord.frets.forEach(
            (
                fret,
                index
            ) => {

                if (
                    index <
                    instrument.strings &&
                    fret >= 0
                ) {

                    state.frettedStrings.set(
                        index,
                        fret
                    );

                    updateFinger(
                        index,
                        fret
                    );

                }

            }
        );

        showMessage(
            `Chord ${chordName} sélectionné.`
        );

        updatePracticeUI();

    }

    G.playChord =
        playChord;

    /* =========================================================
       CLEAR CHORD
    ========================================================= */

    function clearChord() {

        state.selectedChord =
            null;

        state.frettedStrings.clear();

        document
            .querySelectorAll(
                ".chord-button"
            )
            .forEach(
                button =>
                    button.classList.remove(
                        "active"
                    )
            );

        document
            .querySelectorAll(
                ".fret-touch.active"
            )
            .forEach(
                element =>
                    element.classList.remove(
                        "active"
                    )
            );

        if (DOM.fingerLayer) {

            DOM.fingerLayer.innerHTML =
                "";

        }

        if (DOM.activeChord) {

            DOM.activeChord.textContent =
                "—";

        }

        showMessage(
            "Chord effacé."
        );

    }

    /* =========================================================
       NOTE DISPLAY
    ========================================================= */

    function updateNoteDisplay(
        note,
        frequency
    ) {

        if (DOM.currentNote) {

            DOM.currentNote.textContent =
                note.name;

        }

        if (DOM.currentFrequency) {

            DOM.currentFrequency.textContent =
                `${frequency.toFixed(2)} Hz`;

        }

        if (DOM.noteDisplay) {

            DOM.noteDisplay.classList.remove(
                "note-pulse"
            );

            void DOM.noteDisplay.offsetWidth;

            DOM.noteDisplay.classList.add(
                "note-pulse"
            );

        }

    }

    /* =========================================================
       MUTE
    ========================================================= */

    function muteAll() {

        state.muted =
            true;

        updateMuteUI();

        saveState();

        showMessage(
            "Gita an silans."
        );

    }

    function unmuteAll() {

        state.muted =
            false;

        updateMuteUI();

        saveState();

        showMessage(
            "Son gita aktive."
        );

    }

    function updateMuteUI() {

        const button =
            document.querySelector(
                "#btn-mute"
            );

        if (button) {

            button.classList.toggle(
                "active",
                state.muted
            );

            button.setAttribute(
                "aria-pressed",
                String(
                    state.muted
                )
            );

        }

    }

    G.muteAll =
        muteAll;

    G.unmuteAll =
        unmuteAll;

    /* =========================================================
       STOP ALL
    ========================================================= */

    function stopAll() {

        state.metronomeActive =
            false;

        if (
            G.Metronome &&
            typeof G.Metronome.stop ===
            "function"
        ) {

            G.Metronome.stop();

        }

        document
            .querySelectorAll(
                ".vibrating, .strum-down, .strum-up"
            )
            .forEach(
                element => {

                    element.classList.remove(
                        "vibrating",
                        "strum-down",
                        "strum-up"
                    );

                }
            );

        showMessage(
            "Playback arrêté."
        );

    }

    G.stopAll =
        stopAll;

    /* =========================================================
       BPM
    ========================================================= */

    function setBPM(
        value
    ) {

        let bpm =
            Number(value);

        if (
            !Number.isFinite(bpm)
        ) {

            bpm =
                CONFIG.defaultBPM;

        }

        state.bpm =
            Math.round(
                clamp(
                    bpm,
                    CONFIG.minBPM,
                    CONFIG.maxBPM
                )
            );

        if (DOM.bpmRange) {

            DOM.bpmRange.value =
                state.bpm;

        }

        if (DOM.bpmDisplay) {

            DOM.bpmDisplay.textContent =
                `${state.bpm} BPM`;

        }

        saveState();

    }

    G.setBPM =
        setBPM;

    /* =========================================================
       VOLUME
    ========================================================= */

    function updateVolumeUI() {

        if (DOM.volumeRange) {

            DOM.volumeRange.value =
                state.volume;

        }

        if (DOM.volumeDisplay) {

            DOM.volumeDisplay.textContent =
                `${Math.round(
                    state.volume * 100
                )}%`;

        }

    }

    function setVolume(
        value
    ) {

        AudioEngine.setVolume(
            value
        );

    }

    G.setVolume =
        setVolume;

    /* =========================================================
       REVERB
    ========================================================= */

    function updateReverbUI() {

        if (DOM.reverbRange) {

            DOM.reverbRange.value =
                state.reverb;

        }

        if (DOM.reverbDisplay) {

            DOM.reverbDisplay.textContent =
                `${Math.round(
                    state.reverb * 100
                )}%`;

        }

    }

    function setReverb(
        value
    ) {

        AudioEngine.setReverb(
            value
        );

    }

    G.setReverb =
        setReverb;

    /* =========================================================
       TUNER
    ========================================================= */

    const Tuner = {

        active:
            false,

        targetString:
            0,

        toggle() {

            this.active =
                !this.active;

            state.tunerActive =
                this.active;

            if (
                this.active
            ) {

                this.start();

            } else {

                this.stop();

            }

        },

        start() {

            if (DOM.tunerStatus) {

                DOM.tunerStatus.textContent =
                    "Listening";

            }

            showMessage(
                "Tuner aktive."
            );

        },

        stop() {

            if (DOM.tunerStatus) {

                DOM.tunerStatus.textContent =
                    "Ready";

            }

            if (DOM.tunerNote) {

                DOM.tunerNote.textContent =
                    "—";

            }

            if (DOM.tunerCents) {

                DOM.tunerCents.textContent =
                    "0 cents";

            }

            if (DOM.tunerNeedle) {

                DOM.tunerNeedle.style.transform =
                    "translateX(-50%) rotate(0deg)";

            }

            showMessage(
                "Tuner etenn."
            );

        },

        feedFrequency(
            frequency
        ) {

            if (!this.active) {
                return;
            }

            const result =
                frequencyToNote(
                    frequency
                );

            if (DOM.tunerNote) {

                DOM.tunerNote.textContent =
                    result.name;

            }

            if (DOM.tunerCents) {

                DOM.tunerCents.textContent =
                    `${result.cents > 0 ? "+" : ""}${result.cents} cents`;

            }

            if (DOM.tunerNeedle) {

                const angle =
                    clamp(
                        result.cents,
                        -50,
                        50
                    );

                DOM.tunerNeedle.style.transform =
                    `translateX(-50%) rotate(${angle}deg)`;

            }

        }

    };

    G.Tuner =
        Tuner;

    /* =========================================================
       METRONOME
    ========================================================= */

    const Metronome = {

        timer:
            null,

        nextTime:
            0,

        async start() {

            if (
                state.metronomeActive
            ) {
                return;
            }

            await AudioEngine.init();

            await AudioEngine.resume();

            state.metronomeActive =
                true;

            this.nextTime =
                AudioEngine.context.currentTime;

            this.scheduler();

            this.updateUI();

            showMessage(
                `Metronome ${state.bpm} BPM`
            );

        },

        stop() {

            state.metronomeActive =
                false;

            clearTimeout(
                this.timer
            );

            this.timer =
                null;

            this.updateUI();

        },

        toggle() {

            if (
                state.metronomeActive
            ) {

                this.stop();

            } else {

                this.start();

            }

        },

        scheduler() {

            if (
                !state.metronomeActive ||
                !AudioEngine.context
            ) {
                return;
            }

            const now =
                AudioEngine.context.currentTime;

            while (
                this.nextTime <
                now + 0.12
            ) {

                this.scheduleClick(
                    this.nextTime
                );

                this.nextTime +=
                    60 /
                    state.bpm;

            }

            this.timer =
                setTimeout(
                    () =>
                        this.scheduler(),
                    30
                );

        },

        scheduleClick(
            time
        ) {

            if (
                !AudioEngine.context
            ) {
                return;
            }

            const oscillator =
                AudioEngine.context
                    .createOscillator();

            const gain =
                AudioEngine.context
                    .createGain();

            oscillator.type =
                "sine";

            oscillator.frequency.value =
                880;

            gain.gain.setValueAtTime(
                0.0001,
                time
            );

            gain.gain.exponentialRampToValueAtTime(
                0.25,
                time + 0.003
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                time + 0.065
            );

            oscillator.connect(
                gain
            );

            gain.connect(
                AudioEngine.dry
            );

            oscillator.start(
                time
            );

            oscillator.stop(
                time + 0.08
            );

        },

        updateUI() {

            const button =
                document.querySelector(
                    "#btn-metronome"
                );

            if (!button) {
                return;
            }

            button.classList.toggle(
                "active",
                state.metronomeActive
            );

            button.setAttribute(
                "aria-pressed",
                String(
                    state.metronomeActive
                )
            );

            button.textContent =
                state.metronomeActive
                    ? "Stop Metronome"
                    : "Start Metronome";

        }

    };

    G.Metronome =
        Metronome;

    /* =========================================================
       PRACTICE ENGINE
    ========================================================= */

    const Practice = {

        start() {

            state.practiceActive =
                true;

            if (
                !state.startedAt
            ) {

                state.startedAt =
                    Date.now();

            }

            showMessage(
                "Practice Mode aktive."
            );

            this.update();

        },

        stop() {

            state.practiceActive =
                false;

            this.update();

            showMessage(
                "Practice Mode fini."
            );

        },

        toggle() {

            if (
                state.practiceActive
            ) {

                this.stop();

            } else {

                this.start();

            }

        },

        reset() {

            state.noteCount =
                0;

            state.chordCount =
                0;

            state.correctNotes =
                0;

            state.startedAt =
                null;

            this.update();

            showMessage(
                "Practice stats reset."
            );

        },

        update() {

            const accuracy =
                state.noteCount > 0
                    ? Math.round(
                        (
                            state.correctNotes /
                            state.noteCount
                        ) * 100
                    )
                    : 100;

            const elapsed =
                state.startedAt
                    ? Math.floor(
                        (
                            Date.now() -
                            state.startedAt
                        ) / 1000
                    )
                    : 0;

            const minutes =
                Math.floor(
                    elapsed / 60
                );

            const seconds =
                elapsed % 60;

            const performanceMap = {

                "performance-notes":
                    state.noteCount,

                "performance-chords":
                    state.chordCount,

                "performance-accuracy":
                    `${accuracy}%`,

                "performance-time":
                    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

            };

            Object.entries(
                performanceMap
            ).forEach(
                (
                    [
                        id,
                        value
                    ]
                ) => {

                    const element =
                        document.getElementById(
                            id
                        );

                    if (element) {

                        element.textContent =
                            value;

                    }

                }
            );

            if (
                DOM.lessonProgressBar
            ) {

                const progress =
                    clamp(
                        (
                            state.noteCount /
                            20
                        ) * 100,
                        0,
                        100
                    );

                DOM.lessonProgressBar.style.width =
                    `${progress}%`;

            }

            if (
                DOM.lessonMessage
            ) {

                if (
                    state.noteCount === 0
                ) {

                    DOM.lessonMessage.textContent =
                        "Chwazi yon chord oswa touche yon string pou kòmanse.";

                } else if (
                    state.noteCount < 20
                ) {

                    DOM.lessonMessage.textContent =
                        `${20 - state.noteCount} nòt ankò pou fini objektif la.`;

                } else {

                    DOM.lessonMessage.textContent =
                        "Objektif practice la rive 100%.";

                }

            }

        }

    };

    G.Practice =
        Practice;

    function updatePracticeUI() {

        Practice.update();

    }

    /* =========================================================
       INSTRUMENT SELECTION
    ========================================================= */

    function setInstrument(
        instrumentId
    ) {

        const id =
            normalizeInstrumentId(
                instrumentId
            );

        if (
            !INSTRUMENTS[id]
        ) {
            return;
        }

        state.instrumentId =
            id;

        state.selectedChord =
            null;

        state.frettedStrings.clear();

        if (DOM.fingerLayer) {

            DOM.fingerLayer.innerHTML =
                "";

        }

        renderGuitar();

        updateInstrumentUI();

        saveState();

        const instrument =
            getInstrument();

        showMessage(
            `${instrument.name} aktive — ${instrument.strings} strings`
        );

    }

    G.setInstrument =
        setInstrument;

    G.selectInstrument =
        setInstrument;

    G.changeInstrument =
        setInstrument;

    /* =========================================================
       CHORD BUTTONS
    ========================================================= */

    function bindChordButtons() {

        document
            .querySelectorAll(
                ".chord-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            playChord(
                                button.dataset.chord
                            );

                        }
                    );

                }
            );

        const clear =
            document.querySelector(
                "#btn-clear-chord"
            );

        clear?.addEventListener(
            "click",
            clearChord
        );

    }

    /* =========================================================
       INSTRUMENT BUTTONS
    ========================================================= */

    function bindInstrumentButtons() {

        document
            .querySelectorAll(
                ".instrument-card"
            )
            .forEach(
                card => {

                    card.addEventListener(
                        "click",
                        async () => {

                            await AudioEngine.init();

                            setInstrument(
                                card.dataset.instrument
                            );

                        }
                    );

                }
            );

    }

    /* =========================================================
       PLAYING BUTTONS
    ========================================================= */

    function bindPlayingButtons() {

        document
            .querySelectorAll(
                ".strum-control"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            await AudioEngine.init();

                            await strum(
                                button.dataset.direction ||
                                "down",
                                0.92
                            );

                        }
                    );

                }
            );

        document
            .querySelector(
                "#btn-mute"
            )
            ?.addEventListener(
                "click",
                () => {

                    if (state.muted) {

                        unmuteAll();

                    } else {

                        muteAll();

                    }

                }
            );

        document
            .querySelector(
                "#btn-stop-all"
            )
            ?.addEventListener(
                "click",
                stopAll
            );

    }

    /* =========================================================
       METRONOME BUTTONS
    ========================================================= */

    function bindMetronomeControls() {

        document
            .querySelector(
                "#btn-metronome"
            )
            ?.addEventListener(
                "click",
                () =>
                    Metronome.toggle()
            );

        document
            .querySelector(
                "#btn-bpm-minus"
            )
            ?.addEventListener(
                "click",
                () =>
                    setBPM(
                        state.bpm - 5
                    )
            );

        document
            .querySelector(
                "#btn-bpm-plus"
            )
            ?.addEventListener(
                "click",
                () =>
                    setBPM(
                        state.bpm + 5
                    )
            );

        DOM.bpmRange?.addEventListener(
            "input",
            event =>
                setBPM(
                    event.target.value
                )
        );

    }

    /* =========================================================
       AUDIO CONTROLS
    ========================================================= */

    function bindAudioControls() {

        DOM.volumeRange?.addEventListener(
            "input",
            event =>
                setVolume(
                    event.target.value
                )
        );

        DOM.reverbRange?.addEventListener(
            "input",
            event =>
                setReverb(
                    event.target.value
                )
        );

    }

    /* =========================================================
       TUNER BUTTON
    ========================================================= */

    function bindTuner() {

        document
            .querySelector(
                "#btn-tuner"
            )
            ?.addEventListener(
                "click",
                async () => {

                    await AudioEngine.init();

                    Tuner.toggle();

                    const button =
                        document.querySelector(
                            "#btn-tuner"
                        );

                    if (button) {

                        button.textContent =
                            Tuner.active
                                ? "Stop Tuner"
                                : "Start Tuner";

                    }

                }
            );

    }

    /* =========================================================
       PRACTICE BUTTON
    ========================================================= */

    function bindPractice() {

        document
            .querySelector(
                "#btn-start-practice"
            )
            ?.addEventListener(
                "click",
                () => {

                    Practice.toggle();

                    const button =
                        document.querySelector(
                            "#btn-start-practice"
                        );

                    if (button) {

                        button.textContent =
                            state.practiceActive
                                ? "Stop Practice"
                                : "Start Practice";

                        button.classList.toggle(
                            "active",
                            state.practiceActive
                        );

                    }

                }
            );

    }

    /* =========================================================
       KEYBOARD
    ========================================================= */

    function bindKeyboard() {

        document.addEventListener(
            "keydown",
            async event => {

                const target =
                    event.target;

                if (
                    target &&
                    target.matches &&
                    target.matches(
                        "input, textarea, select, button"
                    )
                ) {
                    return;
                }

                const key =
                    event.key.toLowerCase();

                if (
                    event.code ===
                    "Space"
                ) {

                    event.preventDefault();

                    await AudioEngine.init();

                    strum(
                        "down",
                        0.92
                    );

                    return;

                }

                if (
                    key === "arrowup"
                ) {

                    event.preventDefault();

                    await AudioEngine.init();

                    strum(
                        "up",
                        0.92
                    );

                    return;

                }

                if (
                    key === "m"
                ) {

                    if (state.muted) {

                        unmuteAll();

                    } else {

                        muteAll();

                    }

                    return;

                }

                if (
                    key === "t"
                ) {

                    Tuner.toggle();

                    return;

                }

                if (
                    key === "p"
                ) {

                    Practice.toggle();

                    return;

                }

                const number =
                    Number(key);

                if (
                    Number.isInteger(number) &&
                    number >= 1 &&
                    number <= 9
                ) {

                    const index =
                        number - 1;

                    if (
                        index <
                        getInstrument().strings
                    ) {

                        await AudioEngine.init();

                        playString(
                            index,
                            0.9
                        );

                    }

                }

            }
        );

    }

    /* =========================================================
       NAVIGATION
    ========================================================= */

    function bindNavigation() {

        document
            .querySelectorAll(
                ".nav-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            document
                                .querySelectorAll(
                                    ".nav-button"
                                )
                                .forEach(
                                    item => {

                                        item.classList.remove(
                                            "active"
                                        );

                                        item.setAttribute(
                                            "aria-pressed",
                                            "false"
                                        );

                                    }
                                );

                            button.classList.add(
                                "active"
                            );

                            button.setAttribute(
                                "aria-pressed",
                                "true"
                            );

                            const view =
                                button.dataset.view;

                            const targets = {

                                guitar:
                                    "#guitar-section",

                                chords:
                                    "#chord-panel",

                                tuner:
                                    "#tuner-panel",

                                practice:
                                    "#lesson-panel",

                                settings:
                                    "#audio-panel"

                            };

                            const target =
                                targets[
                                    view
                                ];

                            if (!target) {
                                return;
                            }

                            const section =
                                document.querySelector(
                                    target
                                );

                            section?.scrollIntoView(
                                {
                                    behavior:
                                        "smooth",
                                    block:
                                        "start"
                                }
                            );

                        }
                    );

                }
            );

    }

    /* =========================================================
       TOUCH AUDIO UNLOCK
    ========================================================= */

    function bindAudioUnlock() {

        const unlock =
            async () => {

                try {

                    await AudioEngine.init();

                } catch (error) {

                    console.warn(
                        "FOBAS Audio:",
                        error
                    );

                }

            };

        document.addEventListener(
            "pointerdown",
            unlock,
            {
                once: true,
                passive: true
            }
        );

    }

    /* =========================================================
       RESET API
    ========================================================= */

    function reset() {

        stopAll();

        state.frettedStrings.clear();

        state.selectedChord =
            null;

        state.currentNote =
            null;

        state.currentFrequency =
            0;

        state.noteCount =
            0;

        state.chordCount =
            0;

        state.correctNotes =
            0;

        state.startedAt =
            null;

        clearChord();

        renderGuitar();

        Practice.update();

        updateMuteUI();

        showMessage(
            "Guitar reset."
        );

    }

    G.reset =
        reset;

    /* =========================================================
       INITIAL UI
    ========================================================= */

    function initializeUI() {

        setBPM(
            state.bpm
        );

        updateVolumeUI();

        updateReverbUI();

        updateMuteUI();

        Metronome.updateUI();

        Practice.update();

        updateInstrumentUI();

    }

    /* =========================================================
       PUBLIC API
    ========================================================= */

    G.getState =
        () =>
            state;

    G.getInstruments =
        () =>
            INSTRUMENTS;

    G.getChords =
        () =>
            CHORDS;

    G.frequencyToNote =
        frequencyToNote;

    G.noteToFrequency =
        midiToFrequency;

    G.toggleMute =
        () => {

            if (state.muted) {

                unmuteAll();

            } else {

                muteAll();

            }

        };

    G.toggleTuner =
        () =>
            Tuner.toggle();

    G.toggleMetronome =
        () =>
            Metronome.toggle();

    G.togglePractice =
        () =>
            Practice.toggle();

    /* =========================================================
       INITIALIZATION
    ========================================================= */

    function initialize() {

        try {

            loadState();

            renderGuitar();

            bindInstrumentButtons();

            bindChordButtons();

            bindPlayingButtons();

            bindMetronomeControls();

            bindAudioControls();

            bindTuner();

            bindPractice();

            bindKeyboard();

            bindNavigation();

            bindAudioUnlock();

            initializeUI();

            G.initialized =
                true;

            window.dispatchEvent(
                new CustomEvent(
                    "fobas:guitar-ready",
                    {
                        detail: {
                            engine:
                                G,

                            instrument:
                                getInstrument()
                        }
                    }
                )
            );

            console.log(
                "🎸 FOBAS Guitar Simulator ready:",
                getInstrument().name
            );

        } catch (error) {

            console.error(
                "FOBAS Guitar initialization error:",
                error
            );

            showError(
                "Gen yon pwoblèm pandan inisyalizasyon Simulation Guitar FOBAS."
            );

        }

    }

    /* =========================================================
       START
    ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();

    }

})();


















