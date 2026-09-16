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












/* ============================================================
   SIMULATION GUITAR FOBAS
   BLOK 4 — TOUCH / STRINGS / FRETS / STRUMMING
   ============================================================ */

(() => {
    "use strict";

    const G = window.FOBASGuitarEngine;
    const state = G.state;
    const DOM = G.DOM;

    const $$ = (selector, root = document) => {
        try {
            return Array.from(
                root.querySelectorAll(selector)
            );
        } catch {
            return [];
        }
    };

    /* ---------------------------------------------------------
       GET STRING DATA
       --------------------------------------------------------- */

    function getStringData(
        stringIndex,
        fret = 0
    ) {

        const instrument =
            G.getInstrument();

        const string =
            instrument.tuning[
                stringIndex
            ];

        if (!string) return null;

        const midi =
            string.midi +
            Number(fret);

        return {
            stringIndex,
            fret,
            midi,
            note:
                G.getInstrument().tuning[
                    stringIndex
                ].note,
            frequency:
                440 *
                Math.pow(
                    2,
                    (midi - 69) / 12
                )
        };
    }

    /* ---------------------------------------------------------
       PRESS STRING / FRET
       --------------------------------------------------------- */

    function fretString(
        stringIndex,
        fret
    ) {

        const instrument =
            G.getInstrument();

        if (
            stringIndex < 0 ||
            stringIndex >= instrument.strings
        ) return;

        fret =
            Math.max(
                0,
                Math.min(
                    instrument.frets,
                    Number(fret)
                )
            );

        state.frettedStrings.set(
            stringIndex,
            fret
        );

        $$(".fret-touch").forEach(
            element => {

                element.classList.toggle(
                    "active",
                    Number(
                        element.dataset.string
                    ) === stringIndex &&
                    Number(
                        element.dataset.fret
                    ) === fret
                );
            }
        );

        G.renderFinger(
            stringIndex,
            fret
        );

        G.showMessage(
            fret === 0
                ? `String ${stringIndex + 1} ouverte`
                : `Fret ${fret}`
        );
    }

    /* ---------------------------------------------------------
       RELEASE FRET
       --------------------------------------------------------- */

    function releaseString(
        stringIndex
    ) {

        state.frettedStrings.delete(
            stringIndex
        );

        $$(".fret-touch").forEach(
            element => {

                if (
                    Number(
                        element.dataset.string
                    ) === stringIndex
                ) {
                    element.classList.remove(
                        "active"
                    );
                }
            }
        );

        G.removeFinger(
            stringIndex
        );
    }

    /* ---------------------------------------------------------
       CALCULATE NOTE
       --------------------------------------------------------- */

    function getPlayedString(
        stringIndex
    ) {

        const instrument =
            G.getInstrument();

        const base =
            instrument.tuning[
                stringIndex
            ];

        if (!base) return null;

        const fret =
            state.frettedStrings.has(
                stringIndex
            )
                ? state.frettedStrings.get(
                    stringIndex
                )
                : 0;

        return {
            stringIndex,
            fret,
            midi:
                base.midi + fret,
            frequency:
                base.frequency *
                Math.pow(
                    2,
                    fret / 12
                )
        };
    }

    /* ---------------------------------------------------------
       PLAY STRING
       --------------------------------------------------------- */

    async function playString(
        stringIndex,
        velocity = 0.9,
        direction = "down"
    ) {

        if (state.muted) return;

        const played =
            getPlayedString(
                stringIndex
            );

        if (!played) return;

        await G.Audio.playFrequency(
            played.frequency,
            {
                velocity:
                    Math.max(
                        0.12,
                        Math.min(
                            1,
                            velocity
                        )
                    )
            }
        );

        const element =
            DOM.stringsLayer?.querySelector(
                `.guitar-string[data-string="${stringIndex}"]`
            );

        if (element) {

            element.classList.add(
                "active"
            );

            element.dataset.note =
                G.frequencyToNote
                    ? G.frequencyToNote(
                        played.frequency
                    )?.note || ""
                    : "";

            setTimeout(() => {

                element.classList.remove(
                    "active"
                );

            }, 160);
        }

        state.noteCount++;

        state.lastString =
            stringIndex;

        state.lastFret =
            played.fret;

        state.lastFrequency =
            played.frequency;

        updateNoteDisplay(
            played.frequency,
            stringIndex,
            played.fret
        );

        if (G.Practice) {
            G.Practice.registerNote(
                played
            );
        }
    }

    /* ---------------------------------------------------------
       NOTE DISPLAY
       --------------------------------------------------------- */

    function updateNoteDisplay(
        frequency,
        stringIndex,
        fret
    ) {

        const note =
            frequencyToNoteLocal(
                frequency
            );

        if (DOM.currentNote) {

            DOM.currentNote.textContent =
                note
                    ? note.note
                    : "—";
        }

        if (DOM.currentFrequency) {

            DOM.currentFrequency.textContent =
                note
                    ? `${note.frequency.toFixed(2)} Hz`
                    : "— Hz";
        }

        const status =
            DOM.toolStatus;

        if (status) {

            status.textContent =
                `String ${stringIndex + 1} • Fret ${fret}`;
        }
    }

    function frequencyToNoteLocal(
        frequency
    ) {

        if (
            !frequency ||
            frequency <= 0
        ) return null;

        const midi =
            Math.round(
                69 +
                12 *
                Math.log2(
                    frequency / 440
                )
            );

        const names = [
            "C", "C#", "D", "D#", "E",
            "F", "F#", "G", "G#", "A",
            "A#", "B"
        ];

        return {
            note:
                names[
                    ((midi % 12) + 12) % 12
                ],
            frequency:
                440 *
                Math.pow(
                    2,
                    (midi - 69) / 12
                )
        };
    }

    /* ---------------------------------------------------------
       STRUM ALL STRINGS
       --------------------------------------------------------- */

    async function strum(
        direction = "down",
        velocity = 0.9
    ) {

        if (state.muted) return;

        await G.Audio.init();

        const instrument =
            G.getInstrument();

        G.showStrummingHand(
            direction
        );

        const indices =
            direction === "up"
                ? [...Array(
                    instrument.strings
                ).keys()].reverse()
                : [...Array(
                    instrument.strings
                ).keys()];

        const delay =
            instrument.type === "bass"
                ? 20
                : 13;

        for (
            let i = 0;
            i < indices.length;
            i++
        ) {

            const stringIndex =
                indices[i];

            setTimeout(
                () => {

                    playString(
                        stringIndex,
                        velocity,
                        direction
                    );

                },
                i * delay
            );
        }

        if (G.Practice) {
            G.Practice.registerStrum(
                direction
            );
        }
    }

    /* ---------------------------------------------------------
       MUTE
       --------------------------------------------------------- */

    function muteAll() {

        state.muted = true;

        G.Audio.stopAll();

        $$(".guitar-string").forEach(
            string => {

                string.classList.remove(
                    "active"
                );

                string.classList.add(
                    "muted"
                );
            }
        );

        G.showMessage(
            "Strings mute"
        );
    }

    /* ---------------------------------------------------------
       UNMUTE
       --------------------------------------------------------- */

    function unmuteAll() {

        state.muted = false;

        $$(".guitar-string").forEach(
            string => {

                string.classList.remove(
                    "muted"
                );
            }
        );

        G.showMessage(
            "Strings aktive"
        );
    }

    /* ---------------------------------------------------------
       STOP
       --------------------------------------------------------- */

    function stopAll() {

        G.Audio.stopAll();

        $$(".guitar-string").forEach(
            string => {

                string.classList.remove(
                    "active"
                );
            }
        );
    }

    /* ---------------------------------------------------------
       POINTER — FRET
       --------------------------------------------------------- */

    function bindFretTouch() {

        if (!DOM.fretTouchLayer) return;

        DOM.fretTouchLayer.style.pointerEvents =
            "auto";

        DOM.fretTouchLayer.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();
                event.stopPropagation();

                const target =
                    event.target.closest(
                        ".fret-touch"
                    );

                if (!target) return;

                const stringIndex =
                    Number(
                        target.dataset.string
                    );

                const fret =
                    Number(
                        target.dataset.fret
                    );

                try {
                    target.setPointerCapture(
                        event.pointerId
                    );
                } catch {}

                state.activePointers.set(
                    event.pointerId,
                    {
                        mode: "fret",
                        stringIndex,
                        fret
                    }
                );

                fretString(
                    stringIndex,
                    fret
                );
            },
            {
                passive: false
            }
        );

        DOM.fretTouchLayer.addEventListener(
            "pointerup",
            event => {

                const pointer =
                    state.activePointers.get(
                        event.pointerId
                    );

                if (
                    pointer &&
                    pointer.mode === "fret"
                ) {

                    state.activePointers.delete(
                        event.pointerId
                    );
                }

            },
            {
                passive: false
            }
        );

        DOM.fretTouchLayer.addEventListener(
            "pointercancel",
            event => {

                state.activePointers.delete(
                    event.pointerId
                );
            }
        );
    }

    /* ---------------------------------------------------------
       STRING POINTER
       --------------------------------------------------------- */

    function bindStringTouch() {

        if (!DOM.stringsLayer) return;

        DOM.stringsLayer.style.pointerEvents =
            "auto";

        DOM.stringsLayer.addEventListener(
            "pointerdown",
            async event => {

                event.preventDefault();
                event.stopPropagation();

                const target =
                    event.target.closest(
                        ".guitar-string"
                    );

                if (!target) return;

                const stringIndex =
                    Number(
                        target.dataset.string
                    );

                state.activePointers.set(
                    event.pointerId,
                    {
                        mode: "strum",
                        lastString:
                            stringIndex,
                        startY: event.clientY
                    }
                );

                try {
                    target.setPointerCapture(
                        event.pointerId
                    );
                } catch {}

                await playString(
                    stringIndex,
                    0.92
                );
            },
            {
                passive: false
            }
        );

        DOM.stringsLayer.addEventListener(
            "pointermove",
            async event => {

                const pointer =
                    state.activePointers.get(
                        event.pointerId
                    );

                if (
                    !pointer ||
                    pointer.mode !== "strum"
                ) return;

                const instrument =
                    G.getInstrument();

                const rect =
                    DOM.stringsLayer.getBoundingClientRect();

                if (!rect.height) return;

                const y =
                    event.clientY -
                    rect.top;

                const index =
                    Math.round(
                        (
                            y /
                            rect.height
                        ) *
                        (
                            instrument.strings - 1
                        )
                    );

                const stringIndex =
                    Math.max(
                        0,
                        Math.min(
                            instrument.strings - 1,
                            index
                        )
                    );

                if (
                    stringIndex !==
                    pointer.lastString
                ) {

                    const direction =
                        stringIndex >
                        pointer.lastString
                            ? "down"
                            : "up";

                    pointer.lastString =
                        stringIndex;

                    await playString(
                        stringIndex,
                        0.72,
                        direction
                    );
                }
            },
            {
                passive: false
            }
        );

        const finish =
            event => {

                state.activePointers.delete(
                    event.pointerId
                );
            };

        DOM.stringsLayer.addEventListener(
            "pointerup",
            finish
        );

        DOM.stringsLayer.addEventListener(
            "pointercancel",
            finish
        );
    }

    /* ---------------------------------------------------------
       BUTTON ACTION FINDER
       --------------------------------------------------------- */

    function findActionButton(
        actions
    ) {

        for (
            const action of actions
        ) {

            const selectors = [
                `[data-action="${action}"]`,
                `[data-control="${action}"]`,
                `#${action}`,
                `.action-${action}`,
                `.control-${action}`
            ];

            for (
                const selector of selectors
            ) {

                const el =
                    document.querySelector(
                        selector
                    );

                if (el) return el;
            }
        }

        return null;
    }

    /* ---------------------------------------------------------
       BUTTONS
       --------------------------------------------------------- */

    function bindStringControls() {

        const down =
            findActionButton([
                "strum-down",
                "strumDown",
                "down"
            ]);

        const up =
            findActionButton([
                "strum-up",
                "strumUp",
                "up"
            ]);

        const mute =
            findActionButton([
                "mute-all",
                "mute",
                "muteAll"
            ]);

        const stop =
            findActionButton([
                "stop-all",
                "stop",
                "stopAll"
            ]);

        down?.addEventListener(
            "click",
            () => strum("down", 0.92)
        );

        up?.addEventListener(
            "click",
            () => strum("up", 0.92)
        );

        mute?.addEventListener(
            "click",
            () => {

                if (state.muted) {
                    unmuteAll();
                } else {
                    muteAll();
                }
            }
        );

        stop?.addEventListener(
            "click",
            stopAll
        );
    }

    G.fretString = fretString;
    G.releaseString = releaseString;
    G.playString = playString;
    G.strum = strum;
    G.muteAll = muteAll;
    G.unmuteAll = unmuteAll;
    G.stopAll = stopAll;

    bindFretTouch();
    bindStringTouch();
    bindStringControls();

})();











/* ============================================================
   SIMULATION GUITAR FOBAS
   BLOK 5 — CHORD ENGINE
   ============================================================ */

(() => {
    "use strict";

    const G = window.FOBASGuitarEngine;
    const state = G.state;

    const CHORDS = G.chords;

    function chordForInstrument(
        chordName
    ) {

        const instrument =
            G.getInstrument();

        const guitarShape =
            CHORDS[chordName];

        if (!guitarShape) return null;

        if (
            instrument.strings === 6
        ) {

            return guitarShape.slice();
        }

        if (
            instrument.strings === 12
        ) {

            const shape = [];

            guitarShape.forEach(
                fret => {

                    shape.push(fret);
                    shape.push(fret);
                }
            );

            return shape;
        }

        /*
         * Bass instruments:
         * We keep the chord useful as a
         * playable low-register shape.
         */

        if (
            instrument.strings === 4
        ) {

            const rootMap = {
                C: 8,
                D: 10,
                E: 12,
                F: 13,
                G: 15,
                A: 17,
                Am: 17,
                Em: 12,
                Dm: 10
            };

            const root =
                rootMap[chordName] ??
                12;

            return [
                root,
                root + 5,
                root + 7,
                root + 12
            ];
        }

        if (
            instrument.strings === 5
        ) {

            const rootMap = {
                C: 3,
                D: 5,
                E: 7,
                F: 8,
                G: 10,
                A: 12,
                Am: 12,
                Em: 7,
                Dm: 5
            };

            const root =
                rootMap[chordName] ??
                7;

            return [
                root,
                root + 5,
                root + 7,
                root + 12,
                root + 17
            ];
        }

        return null;
    }

    /* ---------------------------------------------------------
       APPLY CHORD FINGERS
       --------------------------------------------------------- */

    function applyChord(
        chordName
    ) {

        const shape =
            chordForInstrument(
                chordName
            );

        if (!shape) {

            G.showMessage(
                "Chord sa pa disponib."
            );

            return;
        }

        state.frettedStrings.clear();

        for (
            let i = 0;
            i < shape.length;
            i++
        ) {

            const fret =
                Number(shape[i]);

            if (fret >= 0) {

                state.frettedStrings.set(
                    i,
                    fret
                );

            }
        }

        document
            .querySelectorAll(
                ".virtual-finger"
            )
            .forEach(
                finger => finger.remove()
            );

        document
            .querySelectorAll(
                ".fret-touch"
            )
            .forEach(
                touch => {

                    touch.classList.remove(
                        "active"
                    );
                }
            );

        state.frettedStrings.forEach(
            (fret, stringIndex) => {

                if (fret > 0) {

                    G.renderFinger(
                        stringIndex,
                        fret
                    );
                }

                const touch =
                    document.querySelector(
                        `.fret-touch[data-string="${stringIndex}"][data-fret="${fret}"]`
                    );

                touch?.classList.add(
                    "active"
                );
            }
        );

        state.selectedChord =
            chordName;

        localStorage.setItem(
            "fobas_guitar_chord",
            chordName
        );

        updateChordUI(
            chordName
        );

        G.showMessage(
            `Chord ${chordName} pare`
        );
    }

    /* ---------------------------------------------------------
       PLAY CHORD
       --------------------------------------------------------- */

    async function playChord(
        chordName,
        direction = "down"
    ) {

        applyChord(
            chordName
        );

        state.chordCount++;

        const instrument =
            G.getInstrument();

        const indices =
            direction === "up"
                ? [...Array(
                    instrument.strings
                ).keys()].reverse()
                : [...Array(
                    instrument.strings
                ).keys()];

        for (
            let i = 0;
            i < indices.length;
            i++
        ) {

            const stringIndex =
                indices[i];

            const shape =
                chordForInstrument(
                    chordName
                );

            if (!shape) continue;

            const fret =
                shape[stringIndex];

            if (
                fret === undefined ||
                fret < 0
            ) {
                continue;
            }

            setTimeout(
                () => {

                    G.playString(
                        stringIndex,
                        0.82,
                        direction
                    );

                },
                i *
                (
                    instrument.type === "bass"
                        ? 35
                        : 22
                )
            );
        }

        if (G.Practice) {

            G.Practice.registerChord(
                chordName
            );
        }
    }

    /* ---------------------------------------------------------
       UPDATE CHORD UI
       --------------------------------------------------------- */

    function updateChordUI(
        chordName
    ) {

        document
            .querySelectorAll(
                ".chord-button"
            )
            .forEach(
                button => {

                    const value =
                        button.dataset.chord ||
                        button.dataset.value ||
                        button.textContent.trim();

                    button.classList.toggle(
                        "active",
                        value === chordName
                    );
                }
            );

        const display =
            document.querySelector(
                ".active-chord-display strong"
            );

        if (display) {

            display.textContent =
                chordName;
        }
    }

    /* ---------------------------------------------------------
       BIND CHORD BUTTONS
       --------------------------------------------------------- */

    function bindChordButtons() {

        document
            .querySelectorAll(
                ".chord-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            const chord =
                                button.dataset.chord ||
                                button.dataset.value ||
                                button.textContent.trim();

                            if (!chord) return;

                            await G.Audio.init();

                            applyChord(
                                chord
                            );

                            /*
                             * Double click or separate
                             * play action can trigger sound.
                             * Normal click plays chord directly
                             * because simulator must be interactive.
                             */

                            await playChord(
                                chord,
                                "down"
                            );
                        }
                    );
                }
            );
    }

    G.applyChord = applyChord;
    G.playChord = playChord;

    bindChordButtons();

    if (state.selectedChord) {

        setTimeout(
            () => {

                if (
                    CHORDS[
                        state.selectedChord
                    ]
                ) {

                    applyChord(
                        state.selectedChord
                    );
                }

            },
            0
        );
    }

})();













/* ============================================================
   SIMULATION GUITAR FOBAS
   BLOK 6 — PROFESSIONAL TUNER
   ============================================================ */

(() => {
    "use strict";

    const G = window.FOBASGuitarEngine;
    const state = G.state;
    const DOM = G.DOM;

    const Tuner = {

        stream: null,
        context: null,
        analyser: null,
        data: null,
        raf: null,

        async start() {

            if (state.tunerActive) {
                return;
            }

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {

                G.showMessage(
                    "Mikwo pa disponib sou navigatè sa a."
                );

                return;
            }

            try {

                this.stream =
                    await navigator.mediaDevices
                        .getUserMedia({
                            audio: {
                                echoCancellation: false,
                                noiseSuppression: false,
                                autoGainControl: false
                            }
                        });

                const AudioContext =
                    window.AudioContext ||
                    window.webkitAudioContext;

                this.context =
                    new AudioContext();

                const source =
                    this.context.createMediaStreamSource(
                        this.stream
                    );

                this.analyser =
                    this.context.createAnalyser();

                this.analyser.fftSize =
                    4096;

                this.analyser.smoothingTimeConstant =
                    0.15;

                this.data =
                    new Float32Array(
                        this.analyser.fftSize
                    );

                source.connect(
                    this.analyser
                );

                state.tunerActive =
                    true;

                this.updateUI();

                this.loop();

                G.showMessage(
                    "Tuner aktive — jwe yon string."
                );

            } catch (error) {

                console.error(
                    "Tuner microphone error:",
                    error
                );

                G.showMessage(
                    "FOBAS Guitar bezwen pèmisyon mikwo pou tuner."
                );
            }
        },

        stop() {

            state.tunerActive =
                false;

            cancelAnimationFrame(
                this.raf
            );

            if (this.stream) {

                this.stream
                    .getTracks()
                    .forEach(
                        track =>
                            track.stop()
                    );
            }

            this.stream = null;

            if (this.context) {

                this.context.close()
                    .catch(() => {});
            }

            this.context = null;

            if (DOM.tunerNeedle) {

                DOM.tunerNeedle.style.transform =
                    "translateX(-50%) rotate(0deg)";
            }

            if (DOM.tunerCents) {

                DOM.tunerCents.textContent =
                    "0 cents";
            }

            G.showMessage(
                "Tuner etenn."
            );
        },

        loop() {

            if (
                !state.tunerActive ||
                !this.analyser
            ) {
                return;
            }

            this.analyser.getFloatTimeDomainData(
                this.data
            );

            const frequency =
                this.detectPitch(
                    this.data,
                    this.context.sampleRate
                );

            if (frequency) {

                this.updatePitch(
                    frequency
                );
            }

            this.raf =
                requestAnimationFrame(
                    () => this.loop()
                );
        },

        detectPitch(
            buffer,
            sampleRate
        ) {

            let rms = 0;

            for (
                let i = 0;
                i < buffer.length;
                i++
            ) {

                rms +=
                    buffer[i] *
                    buffer[i];
            }

            rms =
                Math.sqrt(
                    rms /
                    buffer.length
                );

            if (rms < 0.008) {
                return null;
            }

            let bestOffset = -1;
            let bestCorrelation = 0;

            const minFrequency = 35;
            const maxFrequency = 1000;

            const minOffset =
                Math.floor(
                    sampleRate /
                    maxFrequency
                );

            const maxOffset =
                Math.floor(
                    sampleRate /
                    minFrequency
                );

            for (
                let offset = minOffset;
                offset <=
                Math.min(
                    maxOffset,
                    buffer.length - 1
                );
                offset++
            ) {

                let correlation = 0;

                for (
                    let i = 0;
                    i <
                    buffer.length - offset;
                    i++
                ) {

                    correlation +=
                        buffer[i] *
                        buffer[i + offset];
                }

                correlation /=
                    buffer.length - offset;

                if (
                    correlation >
                    bestCorrelation
                ) {

                    bestCorrelation =
                        correlation;

                    bestOffset =
                        offset;
                }
            }

            if (
                bestOffset <= 0 ||
                bestCorrelation < 0.01
            ) {
                return null;
            }

            return (
                sampleRate /
                bestOffset
            );
        },

        updatePitch(
            frequency
        ) {

            const midi =
                Math.round(
                    69 +
                    12 *
                    Math.log2(
                        frequency / 440
                    )
                );

            const target =
                440 *
                Math.pow(
                    2,
                    (
                        midi - 69
                    ) / 12
                );

            const cents =
                1200 *
                Math.log2(
                    frequency /
                    target
                );

            const names = [
                "C", "C#", "D", "D#", "E",
                "F", "F#", "G", "G#", "A",
                "A#", "B"
            ];

            const note =
                names[
                    ((midi % 12) + 12) % 12
                ];

            if (DOM.tunerNote) {

                DOM.tunerNote.textContent =
                    note;
            }

            if (DOM.tunerCents) {

                const rounded =
                    Math.round(cents);

                DOM.tunerCents.textContent =
                    `${rounded > 0 ? "+" : ""}${rounded} cents`;
            }

            if (DOM.tunerNeedle) {

                const angle =
                    Math.max(
                        -45,
                        Math.min(
                            45,
                            cents * 0.45
                        )
                    );

                DOM.tunerNeedle.style.transform =
                    `translateX(-50%) rotate(${angle}deg)`;
            }
        },

        updateUI() {

            document
                .querySelectorAll(
                    "[data-action='tuner'], #tuner, .tuner-button"
                )
                .forEach(
                    button => {

                        button.classList.toggle(
                            "active",
                            state.tunerActive
                        );
                    }
                );
        },

        toggle() {

            if (
                state.tunerActive
            ) {
                this.stop();
            } else {
                this.start();
            }
        }
    };

    G.Tuner = Tuner;

    document
        .querySelectorAll(
            "[data-action='tuner'], #tuner, .tuner-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => Tuner.toggle()
                );
            }
        );

})();












/* ============================================================
   SIMULATION GUITAR FOBAS
   BLOK 7 — METRONOME / PRACTICE / PERFORMANCE
   ============================================================ */

(() => {
    "use strict";

    const G = window.FOBASGuitarEngine;
    const state = G.state;
    const DOM = G.DOM;

    /* ---------------------------------------------------------
       METRONOME
       --------------------------------------------------------- */

    const Metronome = {

        timer: null,
        nextTime: 0,

        async start() {

            if (state.metronomeActive) return;

            await G.Audio.init();

            state.metronomeActive =
                true;

            this.nextTime =
                G.Audio.context.currentTime;

            this.scheduler();

            G.showMessage(
                `Metronome ${state.bpm} BPM`
            );

            this.updateUI();
        },

        stop() {

            state.metronomeActive =
                false;

            clearTimeout(
                this.timer
            );

            this.timer = null;

            this.updateUI();

            G.showMessage(
                "Metronome etenn."
            );
        },

        scheduler() {

            if (
                !state.metronomeActive ||
                !G.Audio.context
            ) return;

            const now =
                G.Audio.context.currentTime;

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
                    () => this.scheduler(),
                    30
                );
        },

        scheduleClick(
            time
        ) {

            const oscillator =
                G.Audio.context
                    .createOscillator();

            const gain =
                G.Audio.context
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
                0.28,
                time + 0.003
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                time + 0.065
            );

            oscillator.connect(gain);
            gain.connect(
                G.Audio.dry
            );

            oscillator.start(
                time
            );

            oscillator.stop(
                time + 0.08
            );
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

        updateUI() {

            document
                .querySelectorAll(
                    "[data-action='metronome'], #metronome, .metronome-button"
                )
                .forEach(
                    button => {

                        button.classList.toggle(
                            "active",
                            state.metronomeActive
                        );
                    }
                );
        }
    };

    G.Metronome =
        Metronome;

    /* ---------------------------------------------------------
       PRACTICE ENGINE
       --------------------------------------------------------- */

    const Practice = {

        start() {

            state.practiceActive =
                true;

            if (!state.startedAt) {
                state.startedAt =
                    Date.now();
            }

            G.showMessage(
                "Practice Mode aktive."
            );

            this.update();
        },

        stop() {

            state.practiceActive =
                false;

            this.update();

            G.showMessage(
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

        registerNote() {

            if (
                !state.startedAt
            ) {
                state.startedAt =
                    Date.now();
            }

            state.correctNotes++;

            this.update();
        },

        registerStrum() {

            if (
                !state.startedAt
            ) {
                state.startedAt =
                    Date.now();
            }

            this.update();
        },

        registerChord() {

            if (
                !state.startedAt
            ) {
                state.startedAt =
                    Date.now();
            }

            this.update();
        },

        update() {

            const values =
                DOM.performanceValues;

            if (!values.length) return;

            const accuracy =
                state.noteCount > 0
                    ? Math.round(
                        (
                            state.correctNotes /
                            state.noteCount
                        ) *
                        100
                    )
                    : 0;

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

            values.forEach(
                value => {

                    const label =
                        value.parentElement
                            ?.textContent
                            ?.toLowerCase() ||
                        "";

                    if (
                        label.includes(
                            "note"
                        )
                    ) {
                        value.textContent =
                            state.noteCount;
                    }

                    else if (
                        label.includes(
                            "chord"
                        )
                    ) {
                        value.textContent =
                            state.chordCount;
                    }

                    else if (
                        label.includes(
                            "accuracy"
                        )
                    ) {
                        value.textContent =
                            `${accuracy}%`;
                    }

                    else if (
                        label.includes(
                            "time"
                        )
                    ) {
                        value.textContent =
                            `${minutes}:${String(
                                seconds
                            ).padStart(2, "0")}`;
                    }
                }
            );

            if (
                DOM.lessonProgressBar
            ) {

                const progress =
                    Math.min(
                        100,
                        (
                            state.noteCount /
                            20
                        ) * 100
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
                        "Kòmanse jwe yon string pou kòmanse pratike.";

                } else if (
                    state.noteCount < 20
                ) {

                    DOM.lessonMessage.textContent =
                        `${20 - state.noteCount} nòt ankò pou fini objektif la.`;

                } else {

                    DOM.lessonMessage.textContent =
                        "Objektif practice la rive 100%.`;
                }
            }
        },

        reset() {

            state.noteCount = 0;
            state.chordCount = 0;
            state.correctNotes = 0;
            state.startedAt = null;

            this.update();

            G.showMessage(
                "Practice stats reset."
            );
        }
    };

    G.Practice =
        Practice;

    /* ---------------------------------------------------------
       BPM
       --------------------------------------------------------- */

    function setBPM(value) {

        state.bpm =
            Math.max(
                40,
                Math.min(
                    220,
                    Number(value)
                )
            );

        if (DOM.bpmRange) {
            DOM.bpmRange.value =
                state.bpm;
        }

        const bpmValue =
            document.querySelector(
                "#bpm-value, .bpm-value, [data-bpm-value]"
            );

        if (bpmValue) {

            bpmValue.textContent =
                state.bpm;
        }

        G.saveState();
    }

    /* ---------------------------------------------------------
       VOLUME
       --------------------------------------------------------- */

    function setVolume(value) {

        const number =
            Number(value);

        state.volume =
            Math.max(
                0,
                Math.min(
                    1,
                    number
                )
            );

        G.Audio.setVolume(
            state.volume
        );

        const valueElement =
            document.querySelector(
                "#volume-value, .volume-value, [data-volume-value]"
            );

        if (valueElement) {

            valueElement.textContent =
                `${Math.round(
                    state.volume * 100
                )}%`;
        }
    }

    /* ---------------------------------------------------------
       REVERB
       --------------------------------------------------------- */

    function setReverb(value) {

        const number =
            Number(value);

        state.reverb =
            Math.max(
                0,
                Math.min(
                    1,
                    number
                )
            );

        G.Audio.setReverb(
            state.reverb
        );

        const valueElement =
            document.querySelector(
                "#reverb-value, .reverb-value, [data-reverb-value]"
            );

        if (valueElement) {

            valueElement.textContent =
                `${Math.round(
                    state.reverb * 100
                )}%`;
        }
    }

    /* ---------------------------------------------------------
       BIND CONTROLS
       --------------------------------------------------------- */

    DOM.bpmRange?.addEventListener(
        "input",
        event =>
            setBPM(
                event.target.value
            )
    );

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

    document
        .querySelectorAll(
            "[data-action='metronome'], #metronome, .metronome-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        Metronome.toggle()
                );
            }
        );

    document
        .querySelectorAll(
            "[data-action='practice'], #practice, .practice-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        Practice.toggle()
                );
            }
        );

    document
        .querySelectorAll(
            "[data-action='practice-reset'], #practice-reset"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        Practice.reset()
                );
            }
        );

    setBPM(state.bpm);

    G.setBPM = setBPM;
    G.setVolume = setVolume;
    G.setReverb = setReverb;

})();





















/* ============================================================
   SIMULATION GUITAR FOBAS
   BLOK 8 — CONTROLS / INSTRUMENTS / INIT / PUBLIC API
   ============================================================ */

(() => {
    "use strict";

    const G = window.FOBASGuitarEngine;
    const state = G.state;
    const DOM = G.DOM;

    /* ---------------------------------------------------------
       INSTRUMENT IDENTIFICATION
       --------------------------------------------------------- */

    function detectInstrumentFromCard(
        card
    ) {

        const id =
            card.dataset.instrument ||
            card.dataset.type ||
            card.dataset.guitar;

        if (id) {

            const normalized =
                id
                    .toLowerCase()
                    .replace(/[\s_-]+/g, "");

            const aliases = {
                acoustic: "acoustic",
                acousticguitar: "acoustic",

                classical: "classical",
                classicalguitar: "classical",

                electric: "electric",
                electricguitar: "electric",

                bass4: "bass4",
                bass4string: "bass4",
                "4stringbass": "bass4",

                bass5: "bass5",
                bass5string: "bass5",
                "5stringbass": "bass5",

                twelve: "twelve",
                twelveString: "twelve",
                "12string": "twelve",
                guitar12: "twelve"
            };

            if (
                aliases[normalized]
            ) {
                return aliases[
                    normalized
                ];
            }
        }

        const text =
            card.textContent
                .toLowerCase();

        if (
            text.includes("12") ||
            text.includes("twelve")
        ) {
            return "twelve";
        }

        if (
            text.includes("bass") &&
            text.includes("5")
        ) {
            return "bass5";
        }

        if (
            text.includes("bass") &&
            text.includes("4")
        ) {
            return "bass4";
        }

        if (
            text.includes("electric")
        ) {
            return "electric";
        }

        if (
            text.includes("classical")
        ) {
            return "classical";
        }

        return "acoustic";
    }

    /* ---------------------------------------------------------
       SET INSTRUMENT
       --------------------------------------------------------- */

    function setInstrument(
        instrumentId
    ) {

        if (
            !G.instruments[
                instrumentId
            ]
        ) {

            instrumentId =
                "acoustic";
        }

        if (
            state.instrumentId ===
            instrumentId &&
            G.initialized
        ) {

            G.updateInstrumentUI();

            return;
        }

        state.instrumentId =
            instrumentId;

        state.selectedChord =
            null;

        localStorage.setItem(
            "fobas_guitar_instrument",
            instrumentId
        );

        /*
         * Clear previous finger positions.
         */

        state.frettedStrings.clear();

        if (DOM.fingerLayer) {
            DOM.fingerLayer.innerHTML = "";
        }

        /*
         * Rebuild the physical guitar.
         */

        G.renderGuitar();

        /*
         * Remove old active fret states.
         */

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

        const instrument =
            G.getInstrument();

        G.showMessage(
            `${instrument.name} aktive — ${instrument.strings} strings`
        );
    }

    G.setInstrument =
        setInstrument;

    /* ---------------------------------------------------------
       INSTRUMENT BUTTONS
       --------------------------------------------------------- */

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

                            const id =
                                detectInstrumentFromCard(
                                    card
                                );

                            await G.Audio.init();

                            setInstrument(
                                id
                            );
                        }
                    );
                }
            );
    }

    /* ---------------------------------------------------------
       UNIVERSAL ACTION BUTTONS
       --------------------------------------------------------- */

    function bindUniversalButtons() {

        /*
         * Play / Start
         */

        document
            .querySelectorAll(
                "[data-action='play'], #play-guitar, .play-guitar"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            await G.Audio.init();

                            G.strum(
                                "down",
                                0.9
                            );
                        }
                    );
                }
            );

        /*
         * Stop
         */

        document
            .querySelectorAll(
                "[data-action='stop'], #stop-guitar"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => G.stopAll()
                    );
                }
            );

        /*
         * Reset
         */

        document
            .querySelectorAll(
                "[data-action='reset'], #reset-guitar"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            G.stopAll();

                            state.frettedStrings.clear();

                            if (
                                DOM.fingerLayer
                            ) {
                                DOM.fingerLayer.innerHTML =
                                    "";
                            }

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

                            G.showMessage(
                                "Guitar reset."
                            );
                        }
                    );
                }
            );
    }

    /* ---------------------------------------------------------
       MOBILE AUDIO UNLOCK
       --------------------------------------------------------- */

    function bindAudioUnlock() {

        const unlock =
            async () => {

                try {

                    await G.Audio.init();

                } catch (error) {

                    console.warn(
                        "FOBAS Audio unlock:",
                        error
                    );
                }
            };

        document.addEventListener(
            "touchstart",
            unlock,
            {
                once: true,
                passive: true
            }
        );

        document.addEventListener(
            "pointerdown",
            unlock,
            {
                once: true,
                passive: true
            }
        );

        document.addEventListener(
            "keydown",
            unlock,
            {
                once: true
            }
        );
    }

    /* ---------------------------------------------------------
       BOTTOM NAVIGATION
       --------------------------------------------------------- */

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
                                    item =>
                                        item.classList.remove(
                                            "active"
                                        )
                                );

                            button.classList.add(
                                "active"
                            );

                            const target =
                                button.dataset.target ||
                                button.dataset.section;

                            if (!target) return;

                            document
                                .querySelectorAll(
                                    ".guitar-main > section, .guitar-main .app-section"
                                )
                                .forEach(
                                    section => {

                                        const match =
                                            section.id ===
                                            target ||
                                            section.dataset.section ===
                                            target;

                                        if (match) {

                                            section.scrollIntoView({
                                                behavior:
                                                    "smooth",
                                                block:
                                                    "start"
                                            });
                                        }
                                    }
                                );
                        }
                    );
                }
            );
    }

    /* ---------------------------------------------------------
       INITIAL CONTROL VALUES
       --------------------------------------------------------- */

    function initializeControls() {

        if (DOM.volumeRange) {

            DOM.volumeRange.value =
                state.volume;
        }

        if (DOM.reverbRange) {

            DOM.reverbRange.value =
                state.reverb;
        }

        if (DOM.bpmRange) {

            DOM.bpmRange.value =
                state.bpm;
        }

        const volumeValue =
            document.querySelector(
                "#volume-value, .volume-value, [data-volume-value]"
            );

        if (volumeValue) {

            volumeValue.textContent =
                `${Math.round(
                    state.volume * 100
                )}%`;
        }

        const reverbValue =
            document.querySelector(
                "#reverb-value, .reverb-value, [data-reverb-value]"
            );

        if (reverbValue) {

            reverbValue.textContent =
                `${Math.round(
                    state.reverb * 100
                )}%`;
        }

        const bpmValue =
            document.querySelector(
                "#bpm-value, .bpm-value, [data-bpm-value]"
            );

        if (bpmValue) {

            bpmValue.textContent =
                state.bpm;
        }
    }

    /* ---------------------------------------------------------
       KEYBOARD SUPPORT
       --------------------------------------------------------- */

    function bindKeyboard() {

        document.addEventListener(
            "keydown",
            async event => {

                if (
                    event.target.matches(
                        "input, textarea, select"
                    )
                ) {
                    return;
                }

                const key =
                    event.key.toLowerCase();

                if (key === " ") {

                    event.preventDefault();

                    await G.Audio.init();

                    G.strum(
                        "down",
                        0.92
                    );

                    return;
                }

                if (key === "arrowup") {

                    event.preventDefault();

                    await G.Audio.init();

                    G.strum(
                        "up",
                        0.92
                    );

                    return;
                }

                if (key === "m") {

                    if (state.muted) {
                        G.unmuteAll();
                    } else {
                        G.muteAll();
                    }

                    return;
                }

                /*
                 * Number keys 1-9 select strings.
                 */

                const number =
                    Number(key);

                if (
                    Number.isInteger(number) &&
                    number >= 1 &&
                    number <= 9
                ) {

                    const stringIndex =
                        number - 1;

                    if (
                        stringIndex <
                        G.getInstrument().strings
                    ) {

                        await G.Audio.init();

                        G.playString(
                            stringIndex,
                            0.9
                        );
                    }
                }
            }
        );
    }

    /* ---------------------------------------------------------
       GLOBAL API
       --------------------------------------------------------- */

    G.selectInstrument =
        setInstrument;

    G.changeInstrument =
        setInstrument;

    G.playString =
        G.playString;

    G.playChord =
        G.playChord;

    G.strumDown =
        () =>
            G.strum(
                "down",
                0.92
            );

    G.strumUp =
        () =>
            G.strum(
                "up",
                0.92
            );

    G.toggleMute =
        () => {

            if (state.muted) {
                G.unmuteAll();
            } else {
                G.muteAll();
            }
        };

    G.toggleTuner =
        () =>
            G.Tuner.toggle();

    G.toggleMetronome =
        () =>
            G.Metronome.toggle();

    G.togglePractice =
        () =>
            G.Practice.toggle();

    G.reset =
        () => {

            G.stopAll();

            state.frettedStrings.clear();

            if (DOM.fingerLayer) {
                DOM.fingerLayer.innerHTML =
                    "";
            }

            G.renderGuitar();
        };

    /* ---------------------------------------------------------
       FINAL INITIALIZATION
       --------------------------------------------------------- */

    function initialize() {

        if (
            G.initialized
        ) {
            return;
        }

        try {

            /*
             * Build physical guitar.
             */

            G.renderGuitar();

            /*
             * Bind instrument cards.
             */

            bindInstrumentButtons();

            /*
             * Bind generic buttons.
             */

            bindUniversalButtons();

            /*
             * Mobile audio unlock.
             */

            bindAudioUnlock();

            /*
             * Navigation.
             */

            bindNavigation();

            /*
             * Keyboard.
             */

            bindKeyboard();

            /*
             * Controls.
             */

            initializeControls();

            /*
             * Make sure current instrument
             * appears active.
             */

            G.updateInstrumentUI();

            /*
             * Practice UI initial state.
             */

            if (G.Practice) {
                G.Practice.update();
            }

            G.initialized =
                true;

            FOBASGuitarReady();

        } catch (error) {

            console.error(
                "FOBAS Guitar initialization error:",
                error
            );

            if (G.showError) {

                G.showError(
                    "Gen yon pwoblèm pandan inisyalizasyon Simulation Guitar FOBAS."
                );
            }
        }
    }

    /* ---------------------------------------------------------
       READY EVENT
       --------------------------------------------------------- */

    function FOBASGuitarReady() {

        window.dispatchEvent(
            new CustomEvent(
                "fobas:guitar-ready",
                {
                    detail: {
                        engine:
                            G,
                        instrument:
                            G.getInstrument()
                    }
                }
            )
        );

        console.log(
            "🎸 Simulation Guitar FOBAS ready:",
            G.getInstrument().name
        );
    }

    /* ---------------------------------------------------------
       DOM READY
       --------------------------------------------------------- */

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
