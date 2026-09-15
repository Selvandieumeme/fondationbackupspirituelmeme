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










/* ============================================================
   SIMULATION GUITAR FOBAS
   BLOK 2 — 3D GUITAR RENDERER / FRETS / STRINGS / HAND
   ============================================================ */

(() => {
    "use strict";

    const G = window.FOBASGuitarEngine;
    const state = G.state;
    const DOM = G.DOM;

    const $ = (selector, root = document) => {
        try {
            return root.querySelector(selector);
        } catch {
            return null;
        }
    };

    const $$ = (selector, root = document) => {
        try {
            return Array.from(root.querySelectorAll(selector));
        } catch {
            return [];
        }
    };

    const clamp = (v, min, max) =>
        Math.min(Math.max(v, min), max);

    /* ---------------------------------------------------------
       GUITAR GEOMETRY
       --------------------------------------------------------- */

    const Geometry = {

        fretPosition(fret, fretCount) {

            if (fret <= 0) return 0;

            const ratio =
                1 -
                Math.pow(
                    2,
                    -fret / 12
                );

            return clamp(
                ratio * 100,
                0,
                98
            );
        },

        stringPosition(index, count) {

            if (count <= 1) return 50;

            return (
                8 +
                (
                    index /
                    (count - 1)
                ) * 84
            );
        }
    };

    /* ---------------------------------------------------------
       CREATE FRETS
       --------------------------------------------------------- */

    function renderFrets() {

        if (!DOM.fretboard) return;

        let layer =
            DOM.fretboard.querySelector(
                ".frets-layer"
            );

        if (!layer) {

            layer =
                document.createElement("div");

            layer.className =
                "frets-layer";

            DOM.fretboard.appendChild(layer);
        }

        layer.innerHTML = "";

        const instrument =
            G.getInstrument();

        for (
            let fret = 1;
            fret <= instrument.frets;
            fret++
        ) {

            const el =
                document.createElement("div");

            el.className = "fret";

            el.dataset.fret = fret;

            el.style.left =
                `${Geometry.fretPosition(
                    fret,
                    instrument.frets
                )}%`;

            layer.appendChild(el);
        }

        renderFretMarkers();
    }

    /* ---------------------------------------------------------
       FRET MARKERS
       --------------------------------------------------------- */

    function renderFretMarkers() {

        if (!DOM.fretboard) return;

        let markers =
            DOM.fretboard.querySelector(
                ".fret-markers"
            );

        if (!markers) {

            markers =
                document.createElement("div");

            markers.className =
                "fret-markers";

            DOM.fretboard.appendChild(markers);
        }

        markers.innerHTML = "";

        const instrument =
            G.getInstrument();

        const positions =
            [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

        positions.forEach(fret => {

            if (fret > instrument.frets) return;

            const marker =
                document.createElement("div");

            marker.className =
                "fret-marker";

            if (
                fret === 12 ||
                fret === 24
            ) {
                marker.classList.add(
                    "double"
                );
            }

            marker.dataset.fret = fret;

            marker.style.left =
                `${Geometry.fretPosition(
                    fret - 0.5,
                    instrument.frets
                )}%`;

            markers.appendChild(marker);
        });
    }

    /* ---------------------------------------------------------
       CREATE STRINGS
       --------------------------------------------------------- */

    function renderStrings() {

        if (!DOM.stringsLayer) return;

        DOM.stringsLayer.innerHTML = "";

        const instrument =
            G.getInstrument();

        instrument.tuning.forEach(
            (stringData, index) => {

                const string =
                    document.createElement("div");

                string.className =
                    "guitar-string";

                string.dataset.string =
                    index;

                string.dataset.note =
                    stringData.note;

                string.dataset.frequency =
                    stringData.frequency;

                string.style.setProperty(
                    "--string-thickness",
                    `${instrument.stringThickness[index]}px`
                );

                string.style.setProperty(
                    "--string-y",
                    `${Geometry.stringPosition(
                        index,
                        instrument.strings
                    )}%`
                );

                string.setAttribute(
                    "role",
                    "button"
                );

                string.setAttribute(
                    "aria-label",
                    `String ${index + 1}, ${stringData.note}`
                );

                DOM.stringsLayer.appendChild(
                    string
                );
            }
        );
    }

    /* ---------------------------------------------------------
       CREATE FRET TOUCH AREAS
       --------------------------------------------------------- */

    function renderFretTouchZones() {

        if (!DOM.fretTouchLayer) return;

        DOM.fretTouchLayer.innerHTML = "";

        const instrument =
            G.getInstrument();

        for (
            let stringIndex = 0;
            stringIndex < instrument.strings;
            stringIndex++
        ) {

            for (
                let fret = 0;
                fret <= instrument.frets;
                fret++
            ) {

                const touch =
                    document.createElement("div");

                touch.className =
                    "fret-touch";

                touch.dataset.string =
                    stringIndex;

                touch.dataset.fret =
                    fret;

                touch.setAttribute(
                    "aria-label",
                    `String ${stringIndex + 1}, fret ${fret}`
                );

                const leftStart =
                    fret === 0
                        ? 0
                        : Geometry.fretPosition(
                            fret - 1,
                            instrument.frets
                        );

                const leftEnd =
                    fret === instrument.frets
                        ? 100
                        : Geometry.fretPosition(
                            fret,
                            instrument.frets
                        );

                touch.style.left =
                    `${leftStart}%`;

                touch.style.width =
                    `${Math.max(
                        leftEnd - leftStart,
                        1.5
                    )}%`;

                touch.style.top =
                    `${Geometry.stringPosition(
                        stringIndex,
                        instrument.strings
                    )}%`;

                touch.style.height =
                    instrument.strings <= 6
                        ? "18%"
                        : "12%";

                DOM.fretTouchLayer.appendChild(
                    touch
                );
            }
        }
    }

    /* ---------------------------------------------------------
       CREATE TUNING PEGS
       --------------------------------------------------------- */

    function renderTuningPegs() {

        if (!DOM.tuningPegs) return;

        DOM.tuningPegs.innerHTML = "";

        const instrument =
            G.getInstrument();

        for (
            let i = 0;
            i < instrument.strings;
            i++
        ) {

            const peg =
                document.createElement("div");

            peg.className =
                "tuning-peg";

            peg.dataset.string = i;

            const side =
                i % 2 === 0
                    ? "left"
                    : "right";

            peg.dataset.side = side;

            peg.style.top =
                `${10 +
                (
                    Math.floor(i / 2) /
                    Math.max(
                        Math.ceil(
                            instrument.strings / 2
                        ) - 1,
                        1
                    )
                ) * 80}%`;

            peg.classList.add(side);

            DOM.tuningPegs.appendChild(
                peg
            );
        }
    }

    /* ---------------------------------------------------------
       VIRTUAL HAND
       --------------------------------------------------------- */

    function ensureHands() {

        if (!DOM.stage) return;

        let hand =
            DOM.stage.querySelector(
                ".virtual-hand.fretting-hand"
            );

        if (!hand) {

            hand =
                document.createElement("div");

            hand.className =
                "virtual-hand fretting-hand";

            hand.innerHTML = `
                <div class="hand-palm"></div>
                <div class="hand-finger thumb"></div>
                <div class="hand-finger index"></div>
                <div class="hand-finger middle"></div>
                <div class="hand-finger ring"></div>
                <div class="hand-finger little"></div>
            `;

            DOM.stage.appendChild(hand);
        }

        let strumHand =
            DOM.stage.querySelector(
                ".virtual-hand.strumming-hand"
            );

        if (!strumHand) {

            strumHand =
                document.createElement("div");

            strumHand.className =
                "virtual-hand strumming-hand";

            strumHand.innerHTML = `
                <div class="hand-palm"></div>
                <div class="hand-finger thumb"></div>
                <div class="hand-finger index"></div>
                <div class="hand-finger middle"></div>
                <div class="hand-finger ring"></div>
                <div class="hand-finger little"></div>
            `;

            DOM.stage.appendChild(
                strumHand
            );
        }
    }

    /* ---------------------------------------------------------
       RENDER FINGER
       --------------------------------------------------------- */

    function renderFinger(
        stringIndex,
        fret
    ) {

        if (!DOM.fingerLayer) return;

        let finger =
            DOM.fingerLayer.querySelector(
                `.virtual-finger[data-string="${stringIndex}"]`
            );

        if (!finger) {

            finger =
                document.createElement("div");

            finger.className =
                "virtual-finger";

            finger.dataset.string =
                stringIndex;

            DOM.fingerLayer.appendChild(
                finger
            );
        }

        const instrument =
            G.getInstrument();

        const left =
            fret <= 0
                ? 2
                : Geometry.fretPosition(
                    fret - 0.5,
                    instrument.frets
                );

        const top =
            Geometry.stringPosition(
                stringIndex,
                instrument.strings
            );

        finger.style.left =
            `${left}%`;

        finger.style.top =
            `${top}%`;

        finger.dataset.fret =
            fret;

        finger.classList.add(
            "active"
        );

        positionFrettingHand(
            stringIndex,
            fret
        );
    }

    /* ---------------------------------------------------------
       REMOVE FINGER
       --------------------------------------------------------- */

    function removeFinger(stringIndex) {

        if (!DOM.fingerLayer) return;

        const finger =
            DOM.fingerLayer.querySelector(
                `.virtual-finger[data-string="${stringIndex}"]`
            );

        if (finger) {
            finger.remove();
        }

        if (
            state.frettedStrings.size === 0
        ) {

            const hand =
                DOM.stage?.querySelector(
                    ".fretting-hand"
                );

            hand?.classList.remove(
                "visible"
            );
        }
    }

    /* ---------------------------------------------------------
       POSITION HAND
       --------------------------------------------------------- */

    function positionFrettingHand(
        stringIndex,
        fret
    ) {

        if (!DOM.stage) return;

        const hand =
            DOM.stage.querySelector(
                ".fretting-hand"
            );

        if (!hand) return;

        const instrument =
            G.getInstrument();

        hand.style.left =
            `${clamp(
                Geometry.fretPosition(
                    Math.max(fret, 1) - 0.5,
                    instrument.frets
                ) + 3,
                3,
                92
            )}%`;

        hand.style.top =
            `${clamp(
                Geometry.stringPosition(
                    stringIndex,
                    instrument.strings
                ),
                10,
                82
            )}%`;

        hand.classList.add(
            "visible"
        );
    }

    /* ---------------------------------------------------------
       SHOW STRUM HAND
       --------------------------------------------------------- */

    function showStrummingHand(
        direction = "down"
    ) {

        if (!DOM.stage) return;

        const hand =
            DOM.stage.querySelector(
                ".strumming-hand"
            );

        if (!hand) return;

        hand.dataset.direction =
            direction;

        hand.classList.add(
            "visible"
        );

        clearTimeout(
            showStrummingHand.timer
        );

        showStrummingHand.timer =
            setTimeout(() => {

                hand.classList.remove(
                    "visible"
                );

            }, 350);
    }

    /* ---------------------------------------------------------
       REFRESH WHOLE GUITAR
       --------------------------------------------------------- */

    function renderGuitar() {

        renderFrets();
        renderStrings();
        renderFretTouchZones();
        renderTuningPegs();
        ensureHands();

        state.frettedStrings.clear();

        if (DOM.fingerLayer) {
            DOM.fingerLayer.innerHTML = "";
        }

        updateInstrumentUI();
    }

    /* ---------------------------------------------------------
       UPDATE UI
       --------------------------------------------------------- */

    function updateInstrumentUI() {

        const instrument =
            G.getInstrument();

        if (DOM.guitarName) {

            DOM.guitarName.textContent =
                instrument.name;
        }

        if (DOM.guitarTuning) {

            DOM.guitarTuning.textContent =
                instrument.tuning
                    .map(s => s.note)
                    .join(" • ");
        }

        if (DOM.stringCountBadge) {

            DOM.stringCountBadge.textContent =
                `${instrument.strings} Strings`;
        }

        $$(".instrument-card").forEach(
            card => {

                const id =
                    card.dataset.instrument ||
                    card.dataset.type ||
                    card.getAttribute(
                        "data-guitar"
                    );

                const text =
                    card.textContent
                        .toLowerCase();

                const match =
                    id === instrument.id ||
                    (
                        !id &&
                        (
                            text.includes(
                                instrument.shortName
                                    .toLowerCase()
                            ) ||
                            text.includes(
                                instrument.name
                                    .toLowerCase()
                            )
                        )
                    );

                card.classList.toggle(
                    "active",
                    match
                );
            }
        );
    }

    G.Geometry = Geometry;
    G.renderGuitar = renderGuitar;
    G.renderFinger = renderFinger;
    G.removeFinger = removeFinger;
    G.showStrummingHand =
        showStrummingHand;
    G.updateInstrumentUI =
        updateInstrumentUI;

})();











/* ============================================================
   SIMULATION GUITAR FOBAS
   BLOK 3 — REAL WEB AUDIO ENGINE
   ============================================================ */

(() => {
    "use strict";

    const G = window.FOBASGuitarEngine;
    const state = G.state;

    const AudioEngine = {

        context: null,
        master: null,
        dry: null,
        wet: null,
        convolver: null,
        compressor: null,
        analyser: null,
        initialized: false,
        buffers: new Map(),

        async init() {

            if (this.initialized) {

                if (
                    this.context &&
                    this.context.state === "suspended"
                ) {
                    await this.context.resume();
                }

                return;
            }

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) {

                G.showError(
                    "Web Audio API pa disponib sou navigatè sa a."
                );

                return;
            }

            this.context =
                new AudioContext();

            this.master =
                this.context.createGain();

            this.dry =
                this.context.createGain();

            this.wet =
                this.context.createGain();

            this.convolver =
                this.context.createConvolver();

            this.compressor =
                this.context.createDynamicsCompressor();

            this.analyser =
                this.context.createAnalyser();

            this.analyser.fftSize = 2048;

            this.master.gain.value =
                state.volume;

            this.dry.gain.value =
                1 - state.reverb * 0.55;

            this.wet.gain.value =
                state.reverb;

            this.compressor.threshold.value =
                -18;

            this.compressor.knee.value =
                18;

            this.compressor.ratio.value =
                5;

            this.compressor.attack.value =
                0.003;

            this.compressor.release.value =
                0.25;

            this.createImpulseResponse();

            this.dry.connect(
                this.compressor
            );

            this.wet.connect(
                this.convolver
            );

            this.convolver.connect(
                this.compressor
            );

            this.compressor.connect(
                this.analyser
            );

            this.analyser.connect(
                this.master
            );

            this.master.connect(
                this.context.destination
            );

            this.initialized = true;

            await this.context.resume();
        },

        createImpulseResponse() {

            if (!this.context) return;

            const duration = 1.8;

            const length =
                Math.floor(
                    this.context.sampleRate *
                    duration
                );

            const impulse =
                this.context.createBuffer(
                    2,
                    length,
                    this.context.sampleRate
                );

            for (
                let channel = 0;
                channel < 2;
                channel++
            ) {

                const data =
                    impulse.getChannelData(
                        channel
                    );

                for (
                    let i = 0;
                    i < length;
                    i++
                ) {

                    const decay =
                        Math.pow(
                            1 - i / length,
                            2.8
                        );

                    data[i] =
                        (
                            Math.random() * 2 - 1
                        ) *
                        decay *
                        0.32;
                }
            }

            this.convolver.buffer =
                impulse;
        },

        setVolume(value) {

            state.volume =
                Math.max(
                    0,
                    Math.min(1, value)
                );

            if (this.master) {

                this.master.gain.setTargetAtTime(
                    state.volume,
                    this.context.currentTime,
                    0.015
                );
            }

            G.saveState();
        },

        setReverb(value) {

            state.reverb =
                Math.max(
                    0,
                    Math.min(1, value)
                );

            if (this.dry && this.wet) {

                this.dry.gain.value =
                    1 - state.reverb * 0.55;

                this.wet.gain.value =
                    state.reverb;
            }

            G.saveState();
        },

        generateBuffer(
            frequency,
            instrumentType = "guitar"
        ) {

            if (!this.context) return null;

            const key =
                `${frequency.toFixed(3)}_${instrumentType}`;

            if (
                this.buffers.has(key)
            ) {
                return this.buffers.get(key);
            }

            const duration =
                instrumentType === "bass"
                    ? 3.0
                    : 2.25;

            const length =
                Math.floor(
                    this.context.sampleRate *
                    duration
                );

            const buffer =
                this.context.createBuffer(
                    1,
                    length,
                    this.context.sampleRate
                );

            const data =
                buffer.getChannelData(0);

            const sampleRate =
                this.context.sampleRate;

            const harmonics =
                instrumentType === "bass"
                    ? [
                        [1, 1.00],
                        [2, 0.42],
                        [3, 0.18],
                        [4, 0.08]
                    ]
                    : [
                        [1, 1.00],
                        [2, 0.45],
                        [3, 0.25],
                        [4, 0.13],
                        [5, 0.08],
                        [6, 0.045]
                    ];

            for (
                let i = 0;
                i < length;
                i++
            ) {

                const t =
                    i / sampleRate;

                const attack =
                    Math.min(
                        1,
                        t * 280
                    );

                const decay =
                    Math.exp(
                        -t *
                        (
                            instrumentType === "bass"
                                ? 1.25
                                : 1.9
                        )
                    );

                let sample = 0;

                harmonics.forEach(
                    ([harmonic, amplitude]) => {

                        const harmonicDecay =
                            Math.exp(
                                -t *
                                (
                                    0.12 *
                                    harmonic
                                )
                            );

                        sample +=
                            Math.sin(
                                2 *
                                Math.PI *
                                frequency *
                                harmonic *
                                t
                            ) *
                            amplitude *
                            harmonicDecay;
                    }
                );

                const noise =
                    (
                        Math.random() * 2 - 1
                    ) *
                    Math.exp(-t * 180);

                data[i] =
                    (
                        sample * 0.72 +
                        noise * 0.28
                    ) *
                    attack *
                    decay *
                    0.38;
            }

            this.buffers.set(
                key,
                buffer
            );

            return buffer;
        },

        async playFrequency(
            frequency,
            options = {}
        ) {

            await this.init();

            if (!this.context) return;

            if (state.muted) return;

            frequency =
                Math.max(
                    20,
                    Math.min(
                        5000,
                        frequency
                    )
                );

            const instrument =
                G.getInstrument();

            const buffer =
                this.generateBuffer(
                    frequency,
                    instrument.type
                );

            if (!buffer) return;

            const source =
                this.context.createBufferSource();

            const gain =
                this.context.createGain();

            const filter =
                this.context.createBiquadFilter();

            filter.type =
                "lowpass";

            filter.frequency.value =
                instrument.type === "bass"
                    ? 2500
                    : 6200;

            filter.Q.value =
                0.55 +
                state.resonance * 2.2;

            source.buffer =
                buffer;

            const velocity =
                options.velocity ?? 0.9;

            const now =
                this.context.currentTime;

            gain.gain.setValueAtTime(
                0.0001,
                now
            );

            gain.gain.exponentialRampToValueAtTime(
                Math.max(
                    0.001,
                    velocity
                ),
                now + 0.008
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                now +
                (
                    instrument.type === "bass"
                        ? 2.7
                        : 2.0
                )
            );

            source.connect(filter);
            filter.connect(gain);
            gain.connect(this.dry);
            gain.connect(this.wet);

            source.onended = () => {

                state.playingSources.delete(
                    source
                );
            };

            state.playingSources.add(
                source
            );

            source.start();

            if (options.duration) {

                source.stop(
                    now +
                    options.duration
                );
            }

            return source;
        },

        stopAll() {

            state.playingSources.forEach(
                source => {

                    try {
                        source.stop();
                    } catch {}
                }
            );

            state.playingSources.clear();
        }
    };

    G.Audio = AudioEngine;

    G.playFrequency = frequency =>
        AudioEngine.playFrequency(
            frequency
        );

})();