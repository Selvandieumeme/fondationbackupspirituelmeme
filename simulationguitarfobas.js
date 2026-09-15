/* ============================================================
   SIMULATION GUITAR FOBAS
   BLOK 1 — CORE / INSTRUMENTS / STATE / DOM
   ============================================================ */

(() => {
    "use strict";

    /* ---------------------------------------------------------
       GLOBAL NAMESPACE
       --------------------------------------------------------- */

    const FOBASGuitar = {
        version: "1.0.0",
        initialized: false
    };

    window.FOBASGuitarEngine = FOBASGuitar;

    /* ---------------------------------------------------------
       HELPERS
       --------------------------------------------------------- */

    const $ = (selector, root = document) => {
        try {
            return root.querySelector(selector);
        } catch (error) {
            return null;
        }
    };

    const $$ = (selector, root = document) => {
        try {
            return Array.from(root.querySelectorAll(selector));
        } catch (error) {
            return [];
        }
    };

    const clamp = (value, min, max) =>
        Math.min(Math.max(value, min), max);

    const midiToFrequency = midi =>
        440 * Math.pow(2, (midi - 69) / 12);

    const frequencyToMidi = frequency =>
        69 + 12 * Math.log2(frequency / 440);

    const noteNames = [
        "C", "C#", "D", "D#", "E", "F",
        "F#", "G", "G#", "A", "A#", "B"
    ];

    const midiToNote = midi => {
        const rounded = Math.round(midi);
        return noteNames[((rounded % 12) + 12) % 12];
    };

    const frequencyToNote = frequency => {
        if (!frequency || frequency <= 0) return null;

        const midi = Math.round(frequencyToMidi(frequency));

        return {
            midi,
            note: midiToNote(midi),
            frequency: midiToFrequency(midi),
            cents:
                1200 *
                Math.log2(
                    frequency /
                    midiToFrequency(midi)
                )
        };
    };

    const safeNumber = (value, fallback = 0) => {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    };

    /* ---------------------------------------------------------
       INSTRUMENT DATABASE
       --------------------------------------------------------- */

    const INSTRUMENTS = {

        acoustic: {
            id: "acoustic",
            name: "Acoustic Guitar",
            shortName: "Acoustic",
            type: "guitar",
            strings: 6,
            frets: 20,
            tuningName: "Standard E",
            tuning: [
                { note: "E2", midi: 40, frequency: 82.4069 },
                { note: "A2", midi: 45, frequency: 110.0000 },
                { note: "D3", midi: 50, frequency: 146.8324 },
                { note: "G3", midi: 55, frequency: 195.9977 },
                { note: "B3", midi: 59, frequency: 246.9417 },
                { note: "E4", midi: 64, frequency: 329.6276 }
            ],
            stringThickness: [1.55, 1.35, 1.15, 0.95, 0.72, 0.58],
            color: "wood"
        },

        classical: {
            id: "classical",
            name: "Classical Guitar",
            shortName: "Classical",
            type: "guitar",
            strings: 6,
            frets: 19,
            tuningName: "Standard E",
            tuning: [
                { note: "E2", midi: 40, frequency: 82.4069 },
                { note: "A2", midi: 45, frequency: 110.0000 },
                { note: "D3", midi: 50, frequency: 146.8324 },
                { note: "G3", midi: 55, frequency: 195.9977 },
                { note: "B3", midi: 59, frequency: 246.9417 },
                { note: "E4", midi: 64, frequency: 329.6276 }
            ],
            stringThickness: [1.45, 1.30, 1.12, 1.00, 0.82, 0.68],
            color: "classical"
        },

        electric: {
            id: "electric",
            name: "Electric Guitar",
            shortName: "Electric",
            type: "guitar",
            strings: 6,
            frets: 24,
            tuningName: "Standard E",
            tuning: [
                { note: "E2", midi: 40, frequency: 82.4069 },
                { note: "A2", midi: 45, frequency: 110.0000 },
                { note: "D3", midi: 50, frequency: 146.8324 },
                { note: "G3", midi: 55, frequency: 195.9977 },
                { note: "B3", midi: 59, frequency: 246.9417 },
                { note: "E4", midi: 64, frequency: 329.6276 }
            ],
            stringThickness: [1.35, 1.15, 1.00, 0.85, 0.68, 0.55],
            color: "electric"
        },

        bass4: {
            id: "bass4",
            name: "Bass Guitar 4 Strings",
            shortName: "Bass 4",
            type: "bass",
            strings: 4,
            frets: 20,
            tuningName: "E A D G",
            tuning: [
                { note: "E1", midi: 28, frequency: 41.2034 },
                { note: "A1", midi: 33, frequency: 55.0000 },
                { note: "D2", midi: 38, frequency: 73.4162 },
                { note: "G2", midi: 43, frequency: 97.9989 }
            ],
            stringThickness: [2.10, 1.75, 1.45, 1.20],
            color: "bass"
        },

        bass5: {
            id: "bass5",
            name: "Bass Guitar 5 Strings",
            shortName: "Bass 5",
            type: "bass",
            strings: 5,
            frets: 20,
            tuningName: "B E A D G",
            tuning: [
                { note: "B0", midi: 23, frequency: 30.8677 },
                { note: "E1", midi: 28, frequency: 41.2034 },
                { note: "A1", midi: 33, frequency: 55.0000 },
                { note: "D2", midi: 38, frequency: 73.4162 },
                { note: "G2", midi: 43, frequency: 97.9989 }
            ],
            stringThickness: [2.35, 2.00, 1.70, 1.45, 1.20],
            color: "bass"
        },

        twelve: {
            id: "twelve",
            name: "12 String Guitar",
            shortName: "12 String",
            type: "guitar12",
            strings: 12,
            frets: 20,
            tuningName: "Standard 12 String",
            tuning: [
                { note: "E2", midi: 40, frequency: 82.4069 },
                { note: "E3", midi: 52, frequency: 164.8138 },

                { note: "A2", midi: 45, frequency: 110.0000 },
                { note: "A3", midi: 57, frequency: 220.0000 },

                { note: "D3", midi: 50, frequency: 146.8324 },
                { note: "D4", midi: 62, frequency: 293.6648 },

                { note: "G3", midi: 55, frequency: 195.9977 },
                { note: "G3", midi: 55, frequency: 195.9977 },

                { note: "B3", midi: 59, frequency: 246.9417 },
                { note: "B3", midi: 59, frequency: 246.9417 },

                { note: "E4", midi: 64, frequency: 329.6276 },
                { note: "E4", midi: 64, frequency: 329.6276 }
            ],
            stringThickness: [
                1.35, 0.65,
                1.20, 0.60,
                1.05, 0.55,
                0.90, 0.52,
                0.70, 0.52,
                0.56, 0.48
            ],
            color: "wood12"
        }
    };

    FOBASGuitar.instruments = INSTRUMENTS;

    /* ---------------------------------------------------------
       CHORD DATABASE
       --------------------------------------------------------- */

    const GUITAR_CHORDS = {
        C:  [-1, 3, 2, 0, 1, 0],
        D:  [-1, -1, 0, 2, 3, 2],
        E:  [0, 2, 2, 1, 0, 0],
        F:  [1, 3, 3, 2, 1, 1],
        G:  [3, 2, 0, 0, 0, 3],
        A:  [-1, 0, 2, 2, 2, 0],
        Am: [-1, 0, 2, 2, 1, 0],
        Em: [0, 2, 2, 0, 0, 0],
        Dm: [-1, -1, 0, 2, 3, 1]
    };

    FOBASGuitar.chords = GUITAR_CHORDS;

    /* ---------------------------------------------------------
       APPLICATION STATE
       --------------------------------------------------------- */

    const state = {

        instrumentId:
            localStorage.getItem(
                "fobas_guitar_instrument"
            ) || "acoustic",

        volume: safeNumber(
            localStorage.getItem(
                "fobas_guitar_volume"
            ),
            0.75
        ),

        resonance: safeNumber(
            localStorage.getItem(
                "fobas_guitar_resonance"
            ),
            0.45
        ),

        reverb: safeNumber(
            localStorage.getItem(
                "fobas_guitar_reverb"
            ),
            0.25
        ),

        bpm: safeNumber(
            localStorage.getItem(
                "fobas_guitar_bpm"
            ),
            90
        ),

        muted: false,

        selectedChord:
            localStorage.getItem(
                "fobas_guitar_chord"
            ) || null,

        tunerActive: false,

        metronomeActive: false,

        practiceActive: false,

        frettedStrings: new Map(),

        activePointers: new Map(),

        playingSources: new Set(),

        noteCount: 0,

        chordCount: 0,

        correctNotes: 0,

        startedAt: null,

        lastNote: null,

        lastFrequency: null,

        lastString: null,

        lastFret: null
    };

    FOBASGuitar.state = state;

    /* ---------------------------------------------------------
       CURRENT INSTRUMENT
       --------------------------------------------------------- */

    const getInstrument = () =>
        INSTRUMENTS[state.instrumentId] ||
        INSTRUMENTS.acoustic;

    FOBASGuitar.getInstrument = getInstrument;

    /* ---------------------------------------------------------
       DOM CACHE
       --------------------------------------------------------- */

    const DOM = {};

    function cacheDOM() {

        DOM.root =
            $("#fobas-guitar-app") ||
            document.body;

        DOM.stage =
            $("#guitar-stage") ||
            $(".guitar-stage");

        DOM.fretboard =
            $("#fretboard") ||
            $(".fretboard");

        DOM.stringsLayer =
            $("#strings-layer") ||
            $(".strings-layer");

        DOM.fretTouchLayer =
            $("#fret-touch-layer") ||
            $(".fret-touch-layer");

        DOM.fingerLayer =
            $("#finger-layer") ||
            $(".finger-layer");

        DOM.tuningPegs =
            $("#tuning-pegs") ||
            $(".tuning-pegs");

        DOM.guitarName =
            $("#guitar-name");

        DOM.guitarTuning =
            $(".guitar-tuning");

        DOM.stringCountBadge =
            $(".string-count-badge");

        DOM.currentNote =
            $(".current-note");

        DOM.currentFrequency =
            $(".current-frequency");

        DOM.toolStatus =
            $(".tool-status");

        DOM.tunerNote =
            $(".tuner-note");

        DOM.tunerNeedle =
            $(".tuner-needle");

        DOM.tunerCents =
            $(".tuner-cents");

        DOM.tunerMeter =
            $(".tuner-meter");

        DOM.bpmRange =
            $("#bpm-range");

        DOM.volumeRange =
            $("#volume-range");

        DOM.reverbRange =
            $("#reverb-range");

        DOM.lessonProgress =
            $(".lesson-progress");

        DOM.lessonProgressBar =
            $(".lesson-progress-bar");

        DOM.lessonMessage =
            $(".lesson-message");

        DOM.performanceValues =
            $$(".performance-value");

        DOM.interactionMessage =
            $(".interaction-message");

        DOM.appError =
            $(".app-error");

        DOM.appErrorCard =
            $(".error-card");
    }

    FOBASGuitar.DOM = DOM;

    /* ---------------------------------------------------------
       STORAGE
       --------------------------------------------------------- */

    function saveState() {

        try {

            localStorage.setItem(
                "fobas_guitar_instrument",
                state.instrumentId
            );

            localStorage.setItem(
                "fobas_guitar_volume",
                state.volume
            );

            localStorage.setItem(
                "fobas_guitar_resonance",
                state.resonance
            );

            localStorage.setItem(
                "fobas_guitar_reverb",
                state.reverb
            );

            localStorage.setItem(
                "fobas_guitar_bpm",
                state.bpm
            );

            if (state.selectedChord) {

                localStorage.setItem(
                    "fobas_guitar_chord",
                    state.selectedChord
                );

            }

        } catch (error) {
            console.warn(
                "FOBAS Guitar: localStorage unavailable."
            );
        }
    }

    FOBASGuitar.saveState = saveState;

    /* ---------------------------------------------------------
       UI MESSAGES
       --------------------------------------------------------- */

    function showInteractionMessage(message) {

        if (!DOM.interactionMessage) return;

        DOM.interactionMessage.textContent =
            message;

        DOM.interactionMessage.classList.add(
            "show"
        );

        clearTimeout(
            showInteractionMessage.timer
        );

        showInteractionMessage.timer =
            setTimeout(() => {

                DOM.interactionMessage.classList.remove(
                    "show"
                );

            }, 1800);
    }

    FOBASGuitar.showMessage =
        showInteractionMessage;

    /* ---------------------------------------------------------
       ERROR HANDLER
       --------------------------------------------------------- */

    function showError(message) {

        console.error(
            "FOBAS Guitar:",
            message
        );

        if (DOM.appErrorCard) {

            DOM.appErrorCard.textContent =
                message;

        }

        if (DOM.appError) {

            DOM.appError.classList.add(
                "show"
            );

        }
    }

    FOBASGuitar.showError = showError;

    /* ---------------------------------------------------------
       DOM INITIALIZATION
       --------------------------------------------------------- */

    cacheDOM();

})();










