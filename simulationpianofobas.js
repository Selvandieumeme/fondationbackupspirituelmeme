/* ================================================================
   FOBAS PIANO — MOTEUR JAVASCRIPT PRINCIPAL
   ----------------------------------------------------------------
   VERSION : 1.0.0
   TYPE    : Piano virtuel professionnel
   FICHIER : simulationpianofobas.js

   COMPATIBLE AVEC :
   - simulationpianofobas.html
   - simulationpianofobas.css

   FONCTIONNALITÉS :
   - Clavier piano réaliste généré dynamiquement
   - Touches blanches et noires
   - Souris
   - Écran tactile
   - Clavier physique ordinateur
   - Polyphonie
   - Audio Web Audio API
   - Sustain
   - Métronome
   - Volume
   - BPM
   - Piano / Piano Warm / Piano Bright
   - Affichage note
   - Affichage octave
   - Affichage BPM
   - Partition visuelle
   - Animations des touches
   - Interface responsive
   - Accessibilité clavier
   ================================================================ */

(() => {

    "use strict";


    /* ============================================================
       01 — CONFIGURATION GÉNÉRALE
    ============================================================ */

    const CONFIG = {

        firstMidi: 48,

        lastMidi: 72,

        defaultVolume: 0.72,

        defaultBpm: 100,

        maxPolyphony: 32,

        sustainRelease: 0.90

    };


    /* ============================================================
       02 — MAPPING CLAVIER ORDINATEUR
       ----------------------------------------------------------------
       A W S E D F T G Y H U J K
    ============================================================ */

    const KEYBOARD_MAP = {

        "a": 48,
        "w": 49,
        "s": 50,
        "e": 51,
        "d": 52,
        "f": 53,
        "t": 54,
        "g": 55,
        "y": 56,
        "h": 57,
        "u": 58,
        "j": 59,
        "k": 60

    };


    /* ============================================================
       03 — NOMS DES NOTES
    ============================================================ */

    const NOTE_NAMES = [

        "Do",
        "Do♯",
        "Ré",
        "Ré♯",
        "Mi",
        "Fa",
        "Fa♯",
        "Sol",
        "Sol♯",
        "La",
        "La♯",
        "Si"

    ];


    /* ============================================================
       04 — NOTES BLANCHES
    ============================================================ */

    const WHITE_NOTES = new Set([

        0,
        2,
        4,
        5,
        7,
        9,
        11

    ]);


    /* ============================================================
       05 — RÉFÉRENCES DOM
    ============================================================ */

    const $ = (id) => {

        return document.getElementById(id);

    };


    const pianoKeyboard = $("pianoKeyboard");

    const startAudioBtn = $("startAudioBtn");

    const sustainBtn = $("sustainBtn");

    const metronomeBtn = $("metronomeBtn");

    const volumeControl = $("volume");

    const volumeValue = $("volumeValue");

    const bpmControl = $("bpm");

    const bpmOutput = $("bpmOutput");

    const bpmValue = $("bpmValue");

    const waveformControl = $("waveform");

    const statusText = $("statusText");

    const currentNote = $("currentNote");

    const currentOctave = $("currentOctave");

    const staff = $("staff");

    const noteMarker = $("noteMarker");


    /* ============================================================
       06 — VÉRIFICATION
    ============================================================ */

    if (!pianoKeyboard) {

        console.error(
            "FOBAS Piano : #pianoKeyboard introuvable."
        );

        return;

    }


    /* ============================================================
       07 — ÉTAT AUDIO
    ============================================================ */

    let audioContext = null;

    let masterGain = null;

    let compressor = null;

    let audioReady = false;


    /* ============================================================
       08 — ÉTAT MUSICAL
    ============================================================ */

    let sustain = false;

    let metronome = false;

    let bpm = CONFIG.defaultBpm;

    let volume = CONFIG.defaultVolume;


    /* ============================================================
       09 — MÉTRONOME
    ============================================================ */

    let metroTimer = null;

    let metroNextTime = 0;


    /* ============================================================
       10 — NOTES ACTIVES
    ============================================================ */

    const activeVoices = new Map();


    /* ============================================================
       11 — TOUCHES ENFONCÉES
    ============================================================ */

    const pressedKeys = new Set();


    /* ============================================================
       12 — ÉLÉMENTS DU CLAVIER
    ============================================================ */

    const keyElements = new Map();


    /* ============================================================
       13 — INJECTION DU STYLE VISUEL
       ----------------------------------------------------------------
       Ce style donne aux touches une apparence plus proche
       d'un vrai piano numérique.
    ============================================================ */

    const style = document.createElement("style");

    style.textContent = `

        #pianoKeyboard.fobas-real-piano {

            --white-key-width: clamp(42px, 5.2vw, 72px);

            --white-key-height: clamp(
                180px,
                30vw,
                360px
            );

            --black-key-width: clamp(
                27px,
                3.25vw,
                46px
            );

            --black-key-height: clamp(
                112px,
                19vw,
                235px
            );

            position: relative !important;

            display: flex !important;

            align-items: flex-start !important;

            justify-content: center !important;

            width: 100% !important;

            min-height:
                calc(
                    var(--white-key-height) + 50px
                ) !important;

            padding:
                22px
                12px
                28px !important;

            box-sizing: border-box !important;

            overflow-x: auto !important;

            overflow-y: hidden !important;

            border-radius:
                0 0 18px 18px !important;

            background:
                linear-gradient(
                    180deg,
                    #1b1b1b 0%,
                    #090909 55%,
                    #020202 100%
                ) !important;

            box-shadow:

                inset 0 10px 18px
                    rgba(255,255,255,.04),

                inset 0 -12px 22px
                    rgba(0,0,0,.95),

                0 16px 35px
                    rgba(0,0,0,.45) !important;

            scrollbar-width: thin;

            -webkit-overflow-scrolling: touch;

            touch-action: pan-x;

        }


        #pianoKeyboard
        .fobas-keyboard-inner {

            position: relative;

            flex: 0 0 auto;

            display: flex;

            height:
                var(--white-key-height);

            margin: 0 auto;

        }


        #pianoKeyboard
        .fobas-white-key {

            position: relative;

            flex: 0 0
                var(--white-key-width);

            height:
                var(--white-key-height);

            margin: 0;

            padding: 0;

            border:
                1px solid #b8b8b8;

            border-top:
                1px solid #ffffff;

            border-radius:
                0 0 9px 9px;

            cursor: pointer;

            user-select: none;

            -webkit-user-select: none;

            -webkit-tap-highlight-color:
                transparent;

            background:
                linear-gradient(
                    90deg,
                    #cfcfcf 0%,
                    #ffffff 9%,
                    #ffffff 76%,
                    #dedede 100%
                );

            box-shadow:

                inset 5px 0 8px
                    rgba(0,0,0,.08),

                inset -5px 0 8px
                    rgba(0,0,0,.11),

                0 5px 0 #888888,

                0 7px 12px
                    rgba(0,0,0,.35);

            transition:

                transform .055s ease,

                box-shadow .055s ease,

                background .055s ease;

        }


        #pianoKeyboard
        .fobas-white-key::before {

            content: "";

            position: absolute;

            left: 5px;

            right: 5px;

            top: 8px;

            height: 12px;

            border-radius: 50%;

            background:
                linear-gradient(
                    180deg,
                    rgba(255,255,255,.8),
                    rgba(255,255,255,0)
                );

            pointer-events: none;

        }


        #pianoKeyboard
        .fobas-white-key::after {

            content: "";

            position: absolute;

            left: 50%;

            bottom: 11px;

            width: 32%;

            height: 5px;

            transform:
                translateX(-50%);

            border-radius: 50%;

            background:
                rgba(0,0,0,.08);

            pointer-events: none;

        }


        #pianoKeyboard
        .fobas-white-key.is-pressed {

            transform:
                translateY(5px);

            background:
                linear-gradient(
                    90deg,
                    #bdbdbd,
                    #f1f1f1 15%,
                    #d8d8d8 100%
                );

            box-shadow:

                inset 4px 0 7px
                    rgba(0,0,0,.12),

                inset -4px 0 7px
                    rgba(0,0,0,.15),

                0 1px 0 #777777,

                0 2px 5px
                    rgba(0,0,0,.35);

        }


        #pianoKeyboard
        .fobas-black-key {

            position: absolute;

            z-index: 20;

            top: 0;

            width:
                var(--black-key-width);

            height:
                var(--black-key-height);

            margin: 0;

            padding: 0;

            border:
                1px solid #000000;

            border-top-color:
                #454545;

            border-radius:
                0 0 6px 6px;

            cursor: pointer;

            user-select: none;

            -webkit-user-select: none;

            -webkit-tap-highlight-color:
                transparent;

            background:
                linear-gradient(
                    90deg,
                    #030303 0%,
                    #2b2b2b 23%,
                    #080808 62%,
                    #000000 100%
                );

            box-shadow:

                inset 4px 0 5px
                    rgba(255,255,255,.08),

                inset -5px 0 7px
                    rgba(0,0,0,.95),

                0 6px 0 #000000,

                0 9px 12px
                    rgba(0,0,0,.55);

            transform-origin:
                top center;

            transition:

                transform .055s ease,

                background .055s ease,

                box-shadow .055s ease;

        }


        #pianoKeyboard
        .fobas-black-key::before {

            content: "";

            position: absolute;

            left: 5px;

            right: 5px;

            top: 5px;

            height: 30%;

            border-radius: 4px;

            background:
                linear-gradient(
                    180deg,
                    rgba(255,255,255,.16),
                    rgba(255,255,255,0)
                );

            pointer-events: none;

        }


        #pianoKeyboard
        .fobas-black-key.is-pressed {

            transform:
                translateY(5px)
                scaleY(.985);

            background:
                linear-gradient(
                    90deg,
                    #010101,
                    #111111 35%,
                    #020202 100%
                );

            box-shadow:

                inset 3px 0 4px
                    rgba(255,255,255,.04),

                inset -4px 0 6px
                    rgba(0,0,0,.98),

                0 1px 0 #000000,

                0 3px 6px
                    rgba(0,0,0,.55);

        }


        #pianoKeyboard
        .fobas-key-label {

            position: absolute;

            left: 0;

            right: 0;

            bottom: 13px;

            text-align: center;

            font-family:
                Inter,
                system-ui,
                sans-serif;

            font-size: 10px;

            font-weight: 700;

            letter-spacing: .04em;

            color:
                rgba(20,20,20,.48);

            pointer-events: none;

        }


        #pianoKeyboard
        .fobas-black-key
        .fobas-key-label {

            bottom: 8px;

            color:
                rgba(255,255,255,.45);

            font-size: 8px;

        }


        #pianoKeyboard
        .fobas-key-glow {

            position: absolute;

            left: 12%;

            right: 12%;

            bottom: 18px;

            height: 8px;

            border-radius: 50%;

            background:
                rgba(90,180,255,0);

            filter: blur(5px);

            transition:
                background .08s ease;

            pointer-events: none;

        }


        #pianoKeyboard
        .is-pressed
        .fobas-key-glow {

            background:
                rgba(90,180,255,.75);

        }


        #pianoKeyboard
        .fobas-white-key:focus-visible {

            outline:
                3px solid
                rgba(90,180,255,.85);

            outline-offset: 2px;

        }


        #pianoKeyboard
        .fobas-black-key:focus-visible {

            outline:
                3px solid
                rgba(90,180,255,.85);

            outline-offset: 2px;

        }


        @media (max-width: 700px) {

            #pianoKeyboard.fobas-real-piano {

                justify-content:
                    flex-start !important;

            }

        }

    `;

    document.head.appendChild(style);


    /* ============================================================
       14 — CONVERSION MIDI → NOTE
    ============================================================ */

    function midiToNote(midi) {

        const pitch =
            midi % 12;

        const octave =
            Math.floor(midi / 12) - 1;

        return {

            midi: midi,

            pitch: pitch,

            name:
                NOTE_NAMES[pitch],

            octave:
                octave,

            fullName:
                `${NOTE_NAMES[pitch]}${octave}`

        };

    }


    /* ============================================================
       15 — MIDI → FRÉQUENCE
    ============================================================ */

    function midiToFrequency(midi) {

        return 440 *
            Math.pow(
                2,
                (midi - 69) / 12
            );

    }


    /* ============================================================
       16 — DÉTERMINER TOUCHE BLANCHE
    ============================================================ */

    function isWhite(midi) {

        return WHITE_NOTES.has(
            midi % 12
        );

    }


    /* ============================================================
       17 — DÉTERMINER TOUCHE NOIRE
    ============================================================ */

    function isBlack(midi) {

        return !isWhite(midi);

    }


    /* ============================================================
       18 — COMPTER LES TOUCHES BLANCHES
    ============================================================ */

    function countWhitesBefore(midi) {

        let count = 0;

        for (
            let n = CONFIG.firstMidi;
            n < midi;
            n++
        ) {

            if (isWhite(n)) {
                count++;
            }

        }

        return count;

    }


    /* ============================================================
       19 — LIRE UNE VALEUR CSS NUMÉRIQUE
    ============================================================ */

    function getCssNumber(
        element,
        property,
        fallback
    ) {

        const value =
            getComputedStyle(element)
                .getPropertyValue(property)
                .trim();

        const parsed =
            parseFloat(value);

        return Number.isFinite(parsed)
            ? parsed
            : fallback;

    }


    /* ============================================================
       20 — CRÉATION DU CLAVIER
    ============================================================ */

    function buildKeyboard() {

        pianoKeyboard.innerHTML = "";

        pianoKeyboard.classList.add(
            "fobas-real-piano"
        );

        const inner =
            document.createElement("div");

        inner.className =
            "fobas-keyboard-inner";

        pianoKeyboard.appendChild(inner);


        /* --------------------------------------------------------
           TOUCHES BLANCHES
        -------------------------------------------------------- */

        for (
            let midi = CONFIG.firstMidi;
            midi <= CONFIG.lastMidi;
            midi++
        ) {

            if (!isWhite(midi)) {
                continue;
            }

            const key =
                createKey(
                    midi,
                    false
                );

            inner.appendChild(key);

        }


        /* --------------------------------------------------------
           TOUCHES NOIRES
        -------------------------------------------------------- */

        for (
            let midi = CONFIG.firstMidi;
            midi <= CONFIG.lastMidi;
            midi++
        ) {

            if (!isBlack(midi)) {
                continue;
            }

            const key =
                createKey(
                    midi,
                    true
                );

            inner.appendChild(key);

        }


        /* --------------------------------------------------------
           LARGEUR DU CLAVIER
        -------------------------------------------------------- */

        const whiteCount =
            Array.from(
                keyElements.keys()
            ).filter(isWhite).length;

        const whiteWidth =
            getCssNumber(
                inner,
                "--white-key-width",
                60
            );

        inner.style.width =
            `${whiteCount * whiteWidth}px`;


        repositionBlackKeys();

    }


    /* ============================================================
       21 — CRÉER UNE TOUCHE
    ============================================================ */

    function createKey(
        midi,
        black
    ) {

        const info =
            midiToNote(midi);

        const key =
            document.createElement("button");

        key.type = "button";

        key.className =
            black
                ? "fobas-black-key"
                : "fobas-white-key";

        key.dataset.midi =
            String(midi);

        key.dataset.note =
            info.fullName;

        key.setAttribute(
            "aria-label",
            `Jouer ${info.fullName}`
        );

        key.setAttribute(
            "tabindex",
            "0"
        );


        /* --------------------------------------------------------
           LABEL
        -------------------------------------------------------- */

        const label =
            document.createElement("span");

        label.className =
            "fobas-key-label";

        label.textContent =
            info.fullName;


        /* --------------------------------------------------------
           LUMIÈRE
        -------------------------------------------------------- */

        const glow =
            document.createElement("span");

        glow.className =
            "fobas-key-glow";


        key.appendChild(label);

        key.appendChild(glow);


        /* --------------------------------------------------------
           POINTER DOWN
        -------------------------------------------------------- */

        key.addEventListener(
            "pointerdown",
            (event) => {

                event.preventDefault();

                try {

                    key.setPointerCapture(
                        event.pointerId
                    );

                } catch (_) {}

                noteOn(midi);

            }
        );


        /* --------------------------------------------------------
           POINTER UP
        -------------------------------------------------------- */

        key.addEventListener(
            "pointerup",
            (event) => {

                event.preventDefault();

                noteOff(midi);

            }
        );


        /* --------------------------------------------------------
           POINTER CANCEL
        -------------------------------------------------------- */

        key.addEventListener(
            "pointercancel",
            () => {

                noteOff(midi);

            }
        );


        /* --------------------------------------------------------
           POINTER LEAVE
        -------------------------------------------------------- */

        key.addEventListener(
            "pointerleave",
            (event) => {

                if (event.buttons) {

                    noteOff(midi);

                }

            }
        );


        /* --------------------------------------------------------
           CLAVIER ACCESSIBLE
        -------------------------------------------------------- */

        key.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === " " ||
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    noteOn(midi);

                }

            }
        );


        key.addEventListener(
            "keyup",
            (event) => {

                if (
                    event.key === " " ||
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    noteOff(midi);

                }

            }
        );


        /* --------------------------------------------------------
           CONTEXT MENU
        -------------------------------------------------------- */

        key.addEventListener(
            "contextmenu",
            (event) => {

                event.preventDefault();

            }
        );


        keyElements.set(
            midi,
            key
        );


        return key;

    }


    /* ============================================================
       22 — POSITIONNER LES TOUCHES NOIRES
    ============================================================ */

    function repositionBlackKeys() {

        const inner =
            pianoKeyboard.querySelector(
                ".fobas-keyboard-inner"
            );

        if (!inner) {
            return;
        }


        const whiteWidth =
            getCssNumber(
                inner,
                "--white-key-width",
                60
            );


        const blackWidth =
            getCssNumber(
                inner,
                "--black-key-width",
                38
            );


        const whiteCount =
            Array.from(
                keyElements.keys()
            ).filter(isWhite).length;


        inner.style.width =
            `${whiteCount * whiteWidth}px`;


        keyElements.forEach(
            (element, midi) => {

                if (!isBlack(midi)) {
                    return;
                }

                const left =
                    countWhitesBefore(midi) *
                    whiteWidth -
                    blackWidth / 2;

                element.style.left =
                    `${left}px`;

            }
        );

    }


    /* ============================================================
       23 — AJOUTER LES TOUCHES DU CLAVIER ORDINATEUR
    ============================================================ */

    function updateKeyboardMapLabels() {

        const reverse =
            new Map();


        Object.entries(
            KEYBOARD_MAP
        ).forEach(
            ([key, midi]) => {

                reverse.set(
                    midi,
                    key.toUpperCase()
                );

            }
        );


        keyElements.forEach(
            (element, midi) => {

                const label =
                    element.querySelector(
                        ".fobas-key-label"
                    );

                if (!label) {
                    return;
                }


                const keyboardKey =
                    reverse.get(midi);


                if (keyboardKey) {

                    label.textContent =
                        `${midiToNote(midi).fullName} · ${keyboardKey}`;

                }

            }
        );

    }


    /* ============================================================
       24 — INITIALISER AUDIO
    ============================================================ */

    function ensureAudio() {

        if (audioReady) {
            return true;
        }


        try {

            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;


            if (!AudioContextClass) {

                setStatus(
                    "Web Audio API non disponible."
                );

                return false;

            }


            audioContext =
                new AudioContextClass();


            /* ----------------------------------------------------
               COMPRESSEUR
            ---------------------------------------------------- */

            compressor =
                audioContext
                    .createDynamicsCompressor();


            compressor.threshold.value =
                -18;

            compressor.knee.value =
                18;

            compressor.ratio.value =
                5;

            compressor.attack.value =
                0.003;

            compressor.release.value =
                0.18;


            /* ----------------------------------------------------
               MASTER GAIN
            ---------------------------------------------------- */

            masterGain =
                audioContext.createGain();


            masterGain.gain.value =
                volume;


            compressor.connect(
                masterGain
            );


            masterGain.connect(
                audioContext.destination
            );


            audioReady = true;


            if (
                audioContext.state ===
                "suspended"
            ) {

                audioContext.resume();

            }


            setStatus(
                "Piano activé — prêt à jouer."
            );


            return true;

        } catch (error) {

            console.error(
                "FOBAS Piano Audio Error:",
                error
            );


            setStatus(
                "Impossible d'activer le moteur audio."
            );


            return false;

        }

    }


    /* ============================================================
       25 — RÉACTIVER AUDIO
    ============================================================ */

    async function resumeAudio() {

        if (!ensureAudio()) {
            return false;
        }


        try {

            if (
                audioContext.state ===
                "suspended"
            ) {

                await audioContext.resume();

            }


            return true;

        } catch (error) {

            console.error(error);

            return false;

        }

    }


    /* ============================================================
       26 — CRÉER UNE VOIX DE PIANO
    ============================================================ */

    function createPianoVoice(midi) {

        if (!audioReady) {
            return null;
        }


        const now =
            audioContext.currentTime;


        const frequency =
            midiToFrequency(midi);


        const voice = {

            midi: midi,

            oscillators: [],

            gains: [],

            output: null,

            released: false,

            startTime: now

        };


        const output =
            audioContext.createGain();


        output.gain.setValueAtTime(
            0.0001,
            now
        );


        output.connect(
            compressor
        );


        voice.output =
            output;


        /* ========================================================
           CHOIX DU TIMBRE
        ======================================================== */

        const waveform =
            waveformControl
                ? waveformControl.value
                : "piano";


        let partials;


        if (waveform === "warm") {

            partials = [

                [1, 1.00],

                [2, 0.34],

                [3, 0.16],

                [4, 0.08]

            ];

        } else if (
            waveform === "bright"
        ) {

            partials = [

                [1, 1.00],

                [2, 0.48],

                [3, 0.27],

                [4, 0.16],

                [5, 0.08]

            ];

        } else {

            partials = [

                [1, 1.00],

                [2, 0.42],

                [3, 0.21],

                [4, 0.12],

                [5, 0.055]

            ];

        }


        const velocity = 0.90;


        /* ========================================================
           HARMONIQUES
        ======================================================== */

        partials.forEach(
            ([ratio, amount], index) => {

                const osc =
                    audioContext.createOscillator();


                const gain =
                    audioContext.createGain();


                osc.type =
                    index === 0
                        ? "triangle"
                        : "sine";


                osc.frequency.setValueAtTime(
                    frequency * ratio,
                    now
                );


                if (index > 0) {

                    osc.detune.value =
                        (index % 2
                            ? 1
                            : -1) *
                        index *
                        1.7;

                }


                const level =
                    amount *
                    velocity *
                    (
                        index === 0
                            ? 0.24
                            : 0.10
                    );


                gain.gain.setValueAtTime(
                    0.0001,
                    now
                );


                gain.gain.exponentialRampToValueAtTime(
                    Math.max(
                        0.0002,
                        level
                    ),
                    now + 0.008 +
                    index * 0.002
                );


                gain.gain.exponentialRampToValueAtTime(
                    Math.max(
                        0.00015,
                        level * 0.34
                    ),
                    now + 0.55
                );


                gain.gain.exponentialRampToValueAtTime(
                    0.0001,
                    now + 5.0
                );


                osc.connect(gain);

                gain.connect(output);


                osc.start(now);


                voice.oscillators.push(
                    osc
                );

                voice.gains.push(
                    gain
                );

            }
        );


        /* ========================================================
           PETIT SON DE MARTEAU
        ======================================================== */

        const clickOsc =
            audioContext.createOscillator();


        const clickGain =
            audioContext.createGain();


        clickOsc.type =
            "sine";


        clickOsc.frequency.value =
            Math.min(
                4200,
                frequency * 8
            );


        clickGain.gain.setValueAtTime(
            0.0001,
            now
        );


        clickGain.gain.exponentialRampToValueAtTime(
            0.018,
            now + 0.001
        );


        clickGain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.035
        );


        clickOsc.connect(
            clickGain
        );


        clickGain.connect(
            output
        );


        clickOsc.start(now);


        clickOsc.stop(
            now + 0.05
        );


        voice.oscillators.push(
            clickOsc
        );


        voice.gains.push(
            clickGain
        );


        /* ========================================================
           ATTACK PRINCIPAL
        ======================================================== */

        output.gain.exponentialRampToValueAtTime(
            1,
            now + 0.012
        );


        return voice;

    }


    /* ============================================================
       27 — ARRÊTER UNE VOIX
    ============================================================ */

    function stopVoice(
        voice,
        immediate = false
    ) {

        if (
            !voice ||
            voice.released
        ) {

            return;

        }


        voice.released = true;


        const now =
            audioContext.currentTime;


        const release =
            immediate
                ? 0.025
                : CONFIG.sustainRelease;


        try {

            voice.output.gain.cancelScheduledValues(
                now
            );


            voice.output.gain.setValueAtTime(
                Math.max(
                    0.0001,
                    voice.output.gain.value
                ),
                now
            );


            voice.output.gain.exponentialRampToValueAtTime(
                0.0001,
                now + release
            );


            voice.oscillators.forEach(
                (osc) => {

                    try {

                        osc.stop(
                            now +
                            release +
                            0.04
                        );

                    } catch (_) {}

                }
            );

        } catch (_) {}

    }


    /* ============================================================
       28 — JOUER UNE NOTE
    ============================================================ */

    async function noteOn(midi) {

        if (
            pressedKeys.has(midi)
        ) {

            return;

        }


        const ready =
            await resumeAudio();


        if (!ready) {
            return;
        }


        pressedKeys.add(midi);


        /* --------------------------------------------------------
           ÉVITER DOUBLE VOIX
        -------------------------------------------------------- */

        if (
            activeVoices.has(midi)
        ) {

            stopVoice(
                activeVoices.get(midi),
                true
            );


            activeVoices.delete(
                midi
            );

        }


        /* --------------------------------------------------------
           LIMITE POLYPHONIE
        -------------------------------------------------------- */

        if (
            activeVoices.size >=
            CONFIG.maxPolyphony
        ) {

            const oldest =
                activeVoices.keys()
                    .next()
                    .value;


            if (
                oldest !== undefined
            ) {

                stopVoice(
                    activeVoices.get(oldest),
                    true
                );


                activeVoices.delete(
                    oldest
                );

            }

        }


        const voice =
            createPianoVoice(midi);


        if (!voice) {
            return;
        }


        activeVoices.set(
            midi,
            voice
        );


        animateKey(
            midi,
            true
        );


        updateMusicalDisplay(
            midi
        );


        addStaffNote(
            midi
        );

    }


    /* ============================================================
       29 — RELÂCHER UNE NOTE
    ============================================================ */

    function noteOff(midi) {

        if (
            !pressedKeys.has(midi)
        ) {

            return;

        }


        pressedKeys.delete(
            midi
        );


        const voice =
            activeVoices.get(midi);


        if (!voice) {

            animateKey(
                midi,
                false
            );

            return;

        }


        if (!sustain) {

            stopVoice(
                voice,
                false
            );


            activeVoices.delete(
                midi
            );

        }


        animateKey(
            midi,
            false
        );

    }


    /* ============================================================
       30 — LIBÉRER NOTES SUSTAIN
    ============================================================ */

    function releaseSustainedVoices() {

        activeVoices.forEach(
            (voice, midi) => {

                if (
                    !pressedKeys.has(midi)
                ) {

                    stopVoice(
                        voice,
                        false
                    );


                    activeVoices.delete(
                        midi
                    );

                }

            }
        );

    }


    /* ============================================================
       31 — SUSTAIN
    ============================================================ */

    function toggleSustain() {

        sustain =
            !sustain;


        updateToggleButton(
            sustainBtn,
            sustain
        );


        if (!sustain) {

            releaseSustainedVoices();

        }


        setStatus(

            sustain
                ? "Sustain activé."
                : "Sustain désactivé."

        );

    }


    /* ============================================================
       32 — ANIMATION TOUCHE
    ============================================================ */

    function animateKey(
        midi,
        pressed
    ) {

        const key =
            keyElements.get(midi);


        if (!key) {
            return;
        }


        key.classList.toggle(
            "is-pressed",
            pressed
        );

    }


    /* ============================================================
       33 — AFFICHAGE NOTE / OCTAVE
    ============================================================ */

    function updateMusicalDisplay(
        midi
    ) {

        const info =
            midiToNote(midi);


        if (currentNote) {

            currentNote.textContent =
                info.name;

        }


        if (currentOctave) {

            currentOctave.textContent =
                info.octave;

        }


        if (statusText) {

            statusText.textContent =
                `Note jouée : ${info.fullName}`;

        }

    }


    /* ============================================================
       34 — MESSAGE DE STATUT
    ============================================================ */

    function setStatus(
        text
    ) {

        if (statusText) {

            statusText.textContent =
                text;

        }

    }


    /* ============================================================
       35 — PARTITION VISUELLE
    ============================================================ */

    function addStaffNote(
        midi
    ) {

        if (!noteMarker) {
            return;
        }


        const info =
            midiToNote(midi);


        const normalized =
            (
                midi -
                CONFIG.firstMidi
            ) /
            (
                CONFIG.lastMidi -
                CONFIG.firstMidi
            );


        const top =
            78 -
            normalized * 58;


        noteMarker.textContent =
            "●";


        noteMarker.style.top =
            `${Math.max(
                8,
                Math.min(
                    82,
                    top
                )
            )}%`;


        noteMarker.style.left =
            "50%";


        noteMarker.style.transform =
            "translate(-50%, -50%)";


        noteMarker.title =
            `Note : ${info.fullName}`;

    }


    /* ============================================================
       36 — CLAVIER ORDINATEUR
    ============================================================ */

    function setupComputerKeyboard() {

        window.addEventListener(
            "keydown",
            async (event) => {

                const key =
                    event.key.toLowerCase();


                if (
                    event.ctrlKey ||
                    event.altKey ||
                    event.metaKey
                ) {

                    return;

                }


                if (event.repeat) {
                    return;
                }


                const midi =
                    KEYBOARD_MAP[key];


                if (
                    midi === undefined
                ) {

                    return;

                }


                event.preventDefault();


                await noteOn(
                    midi
                );

            }
        );


        window.addEventListener(
            "keyup",
            (event) => {

                const key =
                    event.key.toLowerCase();


                const midi =
                    KEYBOARD_MAP[key];


                if (
                    midi === undefined
                ) {

                    return;

                }


                event.preventDefault();


                noteOff(
                    midi
                );

            }
        );


        window.addEventListener(
            "blur",
            () => {

                pressedKeys.forEach(
                    (midi) => {

                        noteOff(
                            midi
                        );

                    }
                );


                if (sustain) {

                    releaseSustainedVoices();

                }

            }
        );

    }


    /* ============================================================
       37 — VOLUME
    ============================================================ */

    function setupVolume() {

        if (!volumeControl) {
            return;
        }


        volume =
            Number(
                volumeControl.value
            );


        updateVolumeDisplay();


        volumeControl.addEventListener(
            "input",
            () => {

                volume =
                    Number(
                        volumeControl.value
                    );


                if (
                    masterGain &&
                    audioContext
                ) {

                    masterGain.gain.setTargetAtTime(
                        volume,
                        audioContext.currentTime,
                        0.015
                    );

                }


                updateVolumeDisplay();

            }
        );

    }


    /* ============================================================
       38 — AFFICHAGE VOLUME
    ============================================================ */

    function updateVolumeDisplay() {

        if (
            volumeValue &&
            volumeControl
        ) {

            volumeValue.textContent =
                `${Math.round(
                    Number(
                        volumeControl.value
                    ) * 100
                )}%`;

        }

    }


    /* ============================================================
       39 — BPM
    ============================================================ */

    function setupBpm() {

        if (!bpmControl) {
            return;
        }


        bpm =
            Number(
                bpmControl.value
            );


        updateBpmDisplay();


        bpmControl.addEventListener(
            "input",
            () => {

                bpm =
                    Number(
                        bpmControl.value
                    );


                updateBpmDisplay();


                if (metronome) {

                    restartMetronome();

                }

            }
        );

    }


    /* ============================================================
       40 — AFFICHAGE BPM
    ============================================================ */

    function updateBpmDisplay() {

        if (bpmOutput) {

            bpmOutput.textContent =
                String(bpm);

        }


        if (bpmValue) {

            bpmValue.textContent =
                String(bpm);

        }

    }


    /* ============================================================
       41 — TOGGLE MÉTRONOME
    ============================================================ */

    function toggleMetronome() {

        metronome =
            !metronome;


        updateToggleButton(
            metronomeBtn,
            metronome
        );


        if (metronome) {

            startMetronome();


            setStatus(
                `Métronome actif — ${bpm} BPM`
            );

        } else {

            stopMetronome();


            setStatus(
                "Métronome désactivé."
            );

        }

    }


    /* ============================================================
       42 — DÉMARRER MÉTRONOME
    ============================================================ */

    function startMetronome() {

        stopMetronome();


        if (!ensureAudio()) {
            return;
        }


        const interval =
            60000 /
            Math.max(
                40,
                bpm
            );


        metroNextTime =
            audioContext.currentTime +
            0.05;


        metroTimer =
            window.setInterval(
                () => {

                    metroClick();

                },
                interval
            );


        metroClick();

    }


    /* ============================================================
       43 — REDÉMARRER MÉTRONOME
    ============================================================ */

    function restartMetronome() {

        if (!metronome) {
            return;
        }


        startMetronome();

    }


    /* ============================================================
       44 — ARRÊTER MÉTRONOME
    ============================================================ */

    function stopMetronome() {

        if (
            metroTimer !== null
        ) {

            clearInterval(
                metroTimer
            );


            metroTimer =
                null;

        }

    }


    /* ============================================================
       45 — CLIC MÉTRONOME
    ============================================================ */

    function metroClick() {

        if (!audioReady) {
            return;
        }


        const now =
            audioContext.currentTime;


        const osc =
            audioContext.createOscillator();


        const gain =
            audioContext.createGain();


        osc.type =
            "sine";


        osc.frequency.setValueAtTime(
            1200,
            now
        );


        gain.gain.setValueAtTime(
            0.0001,
            now
        );


        gain.gain.exponentialRampToValueAtTime(
            0.10,
            now + 0.001
        );


        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.065
        );


        osc.connect(gain);


        gain.connect(
            compressor
        );


        osc.start(now);


        osc.stop(
            now + 0.08
        );

    }


    /* ============================================================
       46 — BOUTONS ON / OFF
    ============================================================ */

    function updateToggleButton(
        button,
        active
    ) {

        if (!button) {
            return;
        }


        button.setAttribute(
            "aria-pressed",
            String(active)
        );


        const span =
            button.querySelector(
                "span"
            );


        if (span) {

            span.textContent =
                active
                    ? "ON"
                    : "OFF";

        }


        button.classList.toggle(
            "active",
            active
        );


        button.dataset.state =
            active
                ? "on"
                : "off";

    }


    /* ============================================================
       47 — BOUTON ACTIVATION AUDIO
    ============================================================ */

    function setupAudioButton() {

        if (!startAudioBtn) {
            return;
        }


        startAudioBtn.addEventListener(
            "click",
            async () => {

                const ready =
                    await resumeAudio();


                if (!ready) {
                    return;
                }


                startAudioBtn.textContent =
                    "Piano actif";


                startAudioBtn.classList.add(
                    "active"
                );


                setStatus(
                    "Piano activé — touchez une touche."
                );

            }
        );

    }


    /* ============================================================
       48 — CONTRÔLES
    ============================================================ */

    function setupControls() {

        if (sustainBtn) {

            sustainBtn.addEventListener(
                "click",
                toggleSustain
            );

        }


        if (metronomeBtn) {

            metronomeBtn.addEventListener(
                "click",
                toggleMetronome
            );

        }

    }


    /* ============================================================
       49 — REDIMENSIONNEMENT
    ============================================================ */

    let resizeTimer =
        null;


    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    () => {

                        repositionBlackKeys();

                    },
                    80
                );

        }
    );


    /* ============================================================
       50 — ACCESSIBILITÉ
    ============================================================ */

    function setupAccessibility() {

        keyElements.forEach(
            (key) => {

                key.addEventListener(
                    "focus",
                    () => {

                        key.style.outline =
                            "3px solid rgba(90,180,255,.75)";

                        key.style.outlineOffset =
                            "2px";

                    }
                );


                key.addEventListener(
                    "blur",
                    () => {

                        key.style.outline =
                            "";

                        key.style.outlineOffset =
                            "";

                    }
                );

            }
        );

    }


    /* ============================================================
       51 — PROTECTION DU CONTEXT MENU
    ============================================================ */

    pianoKeyboard.addEventListener(
        "contextmenu",
        (event) => {

            event.preventDefault();

        }
    );


    /* ============================================================
       52 — NETTOYAGE DES VOIX
    ============================================================ */

    window.addEventListener(
        "beforeunload",
        () => {

            stopMetronome();


            activeVoices.forEach(
                (voice) => {

                    stopVoice(
                        voice,
                        true
                    );

                }
            );


            activeVoices.clear();

        }
    );


    /* ============================================================
       53 — INITIALISATION
    ============================================================ */

    function init() {

        buildKeyboard();


        updateKeyboardMapLabels();


        setupComputerKeyboard();


        setupVolume();


        setupBpm();


        setupAudioButton();


        setupControls();


        setupAccessibility();


        updateToggleButton(
            sustainBtn,
            false
        );


        updateToggleButton(
            metronomeBtn,
            false
        );


        updateVolumeDisplay();


        updateBpmDisplay();


        setStatus(
            "Prêt — activez l'audio pour commencer."
        );


        console.log(
            "FOBAS Piano — moteur chargé avec succès."
        );

    }


    /* ============================================================
       54 — LANCEMENT
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

























