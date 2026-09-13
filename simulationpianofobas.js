/* ================================================================
   FOBAS PIANO
   ================================================================
   MOTEUR JAVASCRIPT PRINCIPAL
   simulationpianofobas.js

   VERSION
   ---------------------------------------------------------------
   FOBAS PIANO — PROFESSIONAL MUSICAL SIMULATION ENGINE
   ================================================================ */


/* ================================================================
   01 — CONFIGURATION PRINCIPALE
================================================================ */

const FOBAS_PIANO_CONFIG = {

    appName: "FOBAS PIANO",

    version: "1.0.0",

    midiMin: 48, // C3

    midiMax: 72, // C5

    defaultVolume: 0.72,

    defaultBpm: 100,

    minBpm: 40,

    maxBpm: 220,

    masterFadeIn: 0.015,

    masterFadeOut: 0.08,

    oscillatorDetune: 2,

    keyReleaseTime: 0.8,

    maxPolyphony: 32,

    metronomeAccentEvery: 4,

    noteMarkerDuration: 650,

    audioUnlockTimeout: 1500

};


/* ================================================================
   02 — ÉTAT GLOBAL
================================================================ */

const pianoState = {

    audioContext: null,

    masterGain: null,

    compressor: null,

    audioReady: false,

    audioStarting: false,

    volume:
        FOBAS_PIANO_CONFIG.defaultVolume,

    bpm:
        FOBAS_PIANO_CONFIG.defaultBpm,

    sustain: false,

    metronome: false,

    metronomeTimer: null,

    metronomeBeat: 0,

    waveform: "piano",

    activeNotes: new Map(),

    activePointerNotes: new Map(),

    pressedComputerKeys: new Set(),

    generatedKeys: new Map(),

    whiteKeys: [],

    blackKeys: [],

    midiToKey: new Map(),

    noteSequence: [],

    lastNote: null,

    audioNodes: new Set(),

    resizeTimer: null

};


/* ================================================================
   03 — RÉFÉRENCES DOM
================================================================ */

const pianoDOM = {};


/* ================================================================
   04 — NOTES MUSICALES
================================================================ */

const NOTE_NAMES = [

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


/* ================================================================
   05 — MAPPING CLAVIER ORDINATEUR
================================================================ */

/*
   A W S E D F T G Y H U J K

   Correspondance :

   A = C
   W = C#
   S = D
   E = D#
   D = E
   F = F
   T = F#
   G = G
   Y = G#
   H = A
   U = A#
   J = B
   K = C octave suivante
*/

const COMPUTER_KEY_MAP = {

    a: 48, // C3
    w: 49, // C#3
    s: 50, // D3
    e: 51, // D#3
    d: 52, // E3
    f: 53, // F3
    t: 54, // F#3
    g: 55, // G3
    y: 56, // G#3
    h: 57, // A3
    u: 58, // A#3
    j: 59, // B3
    k: 60, // C4

    o: 61, // C#4
    l: 62, // D4
    p: 63, // D#4
    ";": 64, // E4
    z: 65, // F4
    x: 66, // F#4
    c: 67, // G4
    v: 68, // G#4
    b: 69, // A4
    n: 70, // A#4
    m: 71, // B4
    ",": 72 // C5

};


/* ================================================================
   06 — UTILITAIRES DOM
================================================================ */

function getElement(id) {

    return document.getElementById(id);

}


/* ================================================================
   07 — INITIALISATION DOM
================================================================ */

function cacheDOM() {

    pianoDOM.app =
        getElement("pianoApp");

    pianoDOM.startAudioBtn =
        getElement("startAudioBtn");

    pianoDOM.sustainBtn =
        getElement("sustainBtn");

    pianoDOM.metronomeBtn =
        getElement("metronomeBtn");

    pianoDOM.statusText =
        getElement("statusText");

    pianoDOM.currentNote =
        getElement("currentNote");

    pianoDOM.currentOctave =
        getElement("currentOctave");

    pianoDOM.bpmValue =
        getElement("bpmValue");

    pianoDOM.staff =
        getElement("staff");

    pianoDOM.noteMarker =
        getElement("noteMarker");

    pianoDOM.pianoKeyboard =
        getElement("pianoKeyboard");

    pianoDOM.volume =
        getElement("volume");

    pianoDOM.volumeValue =
        getElement("volumeValue");

    pianoDOM.bpm =
        getElement("bpm");

    pianoDOM.bpmOutput =
        getElement("bpmOutput");

    pianoDOM.waveform =
        getElement("waveform");

}


/* ================================================================
   08 — VALIDATION DOM
================================================================ */

function validateDOM() {

    const required = [

        "pianoApp",
        "startAudioBtn",
        "sustainBtn",
        "metronomeBtn",
        "statusText",
        "currentNote",
        "currentOctave",
        "bpmValue",
        "staff",
        "noteMarker",
        "pianoKeyboard",
        "volume",
        "volumeValue",
        "bpm",
        "bpmOutput",
        "waveform"

    ];

    const missing = required.filter(
        id => !getElement(id)
    );

    if (missing.length) {

        console.error(
            "FOBAS PIANO — Éléments HTML manquants :",
            missing
        );

        return false;

    }

    return true;

}


/* ================================================================
   09 — CONVERSION MIDI → NOTE
================================================================ */

function midiToNoteName(midi) {

    const normalized =
        Number(midi);

    if (!Number.isFinite(normalized)) {

        return "—";

    }

    const noteIndex =
        ((normalized % 12) + 12) % 12;

    return NOTE_NAMES[noteIndex];

}


/* ================================================================
   10 — CONVERSION MIDI → OCTAVE
================================================================ */

function midiToOctave(midi) {

    return Math.floor(
        Number(midi) / 12
    ) - 1;

}


/* ================================================================
   11 — MIDI → FRÉQUENCE
================================================================ */

function midiToFrequency(midi) {

    return 440 *
        Math.pow(
            2,
            (Number(midi) - 69) / 12
        );

}


/* ================================================================
   12 — NOTE COMPLÈTE
================================================================ */

function getMidiInformation(midi) {

    const note =
        midiToNoteName(midi);

    const octave =
        midiToOctave(midi);

    return {

        midi,

        note,

        octave,

        fullName:
            `${note}${octave}`,

        frequency:
            midiToFrequency(midi)

    };

}


/* ================================================================
   13 — IDENTIFICATION TOUCHES NOIRES
================================================================ */

function isBlackKey(midi) {

    const note =
        ((midi % 12) + 12) % 12;

    return [

        1,
        3,
        6,
        8,
        10

    ].includes(note);

}


/* ================================================================
   14 — CRÉATION CLAVIER
================================================================ */

function buildPianoKeyboard() {

    const container =
        pianoDOM.pianoKeyboard;

    if (!container) {

        return;

    }

    container.innerHTML = "";

    pianoState.generatedKeys.clear();

    pianoState.whiteKeys = [];

    pianoState.blackKeys = [];

    pianoState.midiToKey.clear();


    /*
       Création des touches blanches
    */

    for (
        let midi = FOBAS_PIANO_CONFIG.midiMin;
        midi <= FOBAS_PIANO_CONFIG.midiMax;
        midi++
    ) {

        if (isBlackKey(midi)) {

            continue;

        }

        const key =
            createPianoKey(
                midi,
                false
            );

        container.appendChild(key);

        pianoState.whiteKeys.push(key);

    }


    /*
       Création des touches noires
    */

    for (
        let midi = FOBAS_PIANO_CONFIG.midiMin;
        midi <= FOBAS_PIANO_CONFIG.midiMax;
        midi++
    ) {

        if (!isBlackKey(midi)) {

            continue;

        }

        const key =
            createPianoKey(
                midi,
                true
            );

        positionBlackKey(
            key,
            midi
        );

        container.appendChild(key);

        pianoState.blackKeys.push(key);

    }


    pianoState.generatedKeys.forEach(
        (key, midi) => {

            pianoState.midiToKey.set(
                midi,
                key
            );

        }
    );

}


/* ================================================================
   15 — CRÉATION D'UNE TOUCHE
================================================================ */

function createPianoKey(
    midi,
    black
) {

    const key =
        document.createElement("button");

    const info =
        getMidiInformation(midi);

    key.type =
        "button";

    key.className =
        black
            ? "piano-black-key"
            : "piano-white-key";

    key.dataset.midi =
        String(midi);

    key.dataset.note =
        info.fullName;

    key.dataset.frequency =
        String(info.frequency);

    key.setAttribute(
        "aria-label",
        `Touche ${info.fullName}`
    );

    key.setAttribute(
        "data-note",
        info.fullName
    );


    /*
       POINTER DOWN
    */

    key.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            try {

                key.setPointerCapture(
                    event.pointerId
                );

            } catch (_) {}


            const pointerId =
                String(event.pointerId);

            const previous =
                pianoState.activePointerNotes
                    .get(pointerId);

            if (previous === midi) {

                return;

            }

            if (previous !== undefined) {

                stopNote(
                    previous
                );

            }

            pianoState.activePointerNotes.set(
                pointerId,
                midi
            );

            playNote(
                midi
            );

        },
        {
            passive: false
        }
    );


    /*
       POINTER UP
    */

    key.addEventListener(
        "pointerup",
        event => {

            event.preventDefault();

            releasePointerNote(
                event.pointerId
            );

        },
        {
            passive: false
        }
    );


    /*
       POINTER CANCEL
    */

    key.addEventListener(
        "pointercancel",
        event => {

            releasePointerNote(
                event.pointerId
            );

        }
    );


    /*
       POINTER LEAVE
       On garde la note tant que le doigt
       reste appuyé.
    */


    key.addEventListener(
        "contextmenu",
        event => {

            event.preventDefault();

        }
    );


    pianoState.generatedKeys.set(
        midi,
        key
    );

    return key;

}


/* ================================================================
   16 — LIBÉRATION POINTER
================================================================ */

function releasePointerNote(
    pointerId
) {

    const id =
        String(pointerId);

    const midi =
        pianoState.activePointerNotes.get(id);

    if (midi === undefined) {

        return;

    }

    pianoState.activePointerNotes.delete(
        id
    );

    stopNote(
        midi
    );

}


/* ================================================================
   17 — POSITION TOUCHE NOIRE
================================================================ */

function positionBlackKey(
    key,
    midi
) {

    const whiteBefore =
        countWhiteKeysBefore(
            midi
        );

    const whiteWidth =
        getCSSNumber(
            "--white-key-width",
            76
        );

    const blackWidth =
        getCSSNumber(
            "--black-key-width",
            46
        );

    const left =
        (
            whiteBefore *
            whiteWidth
        ) -
        (blackWidth / 2);


    key.style.left =
        `${left}px`;

}


/* ================================================================
   18 — COMPTER TOUCHES BLANCHES
================================================================ */

function countWhiteKeysBefore(
    midi
) {

    let count = 0;

    for (
        let i =
            FOBAS_PIANO_CONFIG.midiMin;

        i < midi;

        i++
    ) {

        if (!isBlackKey(i)) {

            count++;

        }

    }

    return count;

}


/* ================================================================
   19 — LIRE VALEUR CSS
================================================================ */

function getCSSNumber(
    variable,
    fallback
) {

    const value =
        getComputedStyle(
            document.documentElement
        ).getPropertyValue(
            variable
        );

    const number =
        parseFloat(
            value
        );

    return Number.isFinite(number)
        ? number
        : fallback;

}


/* ================================================================
   20 — CRÉATION AUDIO
================================================================ */

async function initializeAudio() {

    if (pianoState.audioReady) {

        return true;

    }

    if (pianoState.audioStarting) {

        return false;

    }

    pianoState.audioStarting = true;


    try {

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContextClass) {

            throw new Error(
                "Web Audio API non disponible."
            );

        }


        pianoState.audioContext =
            new AudioContextClass();


        pianoState.masterGain =
            pianoState.audioContext.createGain();


        pianoState.compressor =
            pianoState.audioContext.createDynamicsCompressor();


        /*
           COMPRESSEUR
        */

        pianoState.compressor.threshold.value =
            -18;

        pianoState.compressor.knee.value =
            18;

        pianoState.compressor.ratio.value =
            4;

        pianoState.compressor.attack.value =
            0.003;

        pianoState.compressor.release.value =
            0.25;


        pianoState.masterGain.gain.value =
            pianoState.volume;


        pianoState.masterGain.connect(
            pianoState.compressor
        );

        pianoState.compressor.connect(
            pianoState.audioContext.destination
        );


        if (
            pianoState.audioContext.state ===
            "suspended"
        ) {

            await pianoState.audioContext.resume();

        }


        pianoState.audioReady =
            true;


        updateStatus(
            "Piano prêt — vous pouvez jouer."
        );


        updateAudioButton();


        return true;

    } catch (error) {

        console.error(
            "FOBAS PIANO — Audio initialization error:",
            error
        );

        pianoState.audioReady =
            false;

        updateStatus(
            "Impossible d'activer le moteur audio."
        );

        return false;

    } finally {

        pianoState.audioStarting =
            false;

    }

}


/* ================================================================
   21 — S'ASSURER QUE L'AUDIO EST PRÊT
================================================================ */

async function ensureAudioReady() {

    if (!pianoState.audioReady) {

        const ready =
            await initializeAudio();

        if (!ready) {

            return false;

        }

    }


    if (
        pianoState.audioContext &&
        pianoState.audioContext.state ===
        "suspended"
    ) {

        try {

            await pianoState.audioContext.resume();

        } catch (error) {

            console.warn(
                "Audio resume impossible:",
                error
            );

        }

    }

    return true;

}


/* ================================================================
   22 — GÉNÉRATEUR ENVELOPPE
================================================================ */

function createEnvelope(
    gainNode,
    now,
    peak,
    attack,
    decay
) {

    gainNode.gain.cancelScheduledValues(
        now
    );

    gainNode.gain.setValueAtTime(
        0.0001,
        now
    );

    gainNode.gain.linearRampToValueAtTime(
        peak,
        now + attack
    );

    gainNode.gain.exponentialRampToValueAtTime(
        Math.max(
            peak * 0.55,
            0.0001
        ),
        now + attack + decay
    );

}


/* ================================================================
   23 — CRÉATION SON PIANO
================================================================ */

function createPianoVoice(
    midi
) {

    if (
        !pianoState.audioContext ||
        !pianoState.masterGain
    ) {

        return null;

    }


    const ctx =
        pianoState.audioContext;

    const now =
        ctx.currentTime;

    const frequency =
        midiToFrequency(
            midi
        );


    const voiceGain =
        ctx.createGain();


    const filter =
        ctx.createBiquadFilter();


    filter.type =
        "lowpass";


    filter.frequency.value =
        getFilterFrequency();


    filter.Q.value =
        0.7;


    const main =
        ctx.createOscillator();


    const body =
        ctx.createOscillator();


    const harmonic =
        ctx.createOscillator();


    /*
       FORMES D'ONDE
    */

    const waveform =
        pianoState.waveform;


    if (waveform === "bright") {

        main.type =
            "triangle";

        body.type =
            "sine";

        harmonic.type =
            "triangle";

    }

    else if (waveform === "warm") {

        main.type =
            "sine";

        body.type =
            "triangle";

        harmonic.type =
            "sine";

    }

    else {

        main.type =
            "triangle";

        body.type =
            "sine";

        harmonic.type =
            "sine";

    }


    /*
       FRÉQUENCES
    */

    main.frequency.value =
        frequency;


    body.frequency.value =
        frequency;


    harmonic.frequency.value =
        frequency * 2;


    /*
       LÉGER DETUNING
    */

    body.detune.value =
        -FOBAS_PIANO_CONFIG.oscillatorDetune;


    harmonic.detune.value =
        FOBAS_PIANO_CONFIG.oscillatorDetune;


    /*
       NIVEAUX
    */

    const amplitude =
        getNoteAmplitude(
            midi
        );


    createEnvelope(
        voiceGain,
        now,
        amplitude,
        0.006,
        getDecayTime()
    );


    /*
       CONNEXIONS
    */

    main.connect(
        filter
    );

    body.connect(
        filter
    );

    harmonic.connect(
        filter
    );

    filter.connect(
        voiceGain
    );

    voiceGain.connect(
        pianoState.masterGain
    );


    /*
       START
    */

    main.start(
        now
    );

    body.start(
        now
    );

    harmonic.start(
        now
    );


    const voice = {

        midi,

        main,

        body,

        harmonic,

        filter,

        gain:
            voiceGain,

        startedAt:
            now,

        released:
            false,

        sustainHeld:
            pianoState.sustain,

        releaseTimer:
            null

    };


    pianoState.audioNodes.add(
        voice
    );


    return voice;

}


/* ================================================================
   24 — AMPLITUDE SELON NOTE
================================================================ */

function getNoteAmplitude(
    midi
) {

    const velocityCurve =
        0.75 +
        (
            (
                midi -
                FOBAS_PIANO_CONFIG.midiMin
            ) /
            (
                FOBAS_PIANO_CONFIG.midiMax -
                FOBAS_PIANO_CONFIG.midiMin
            )
        ) * 0.12;

    return Math.min(
        0.95,
        Math.max(
            0.55,
            velocityCurve
        )
    );

}


/* ================================================================
   25 — FILTRE SELON SON
================================================================ */

function getFilterFrequency() {

    if (
        pianoState.waveform ===
        "bright"
    ) {

        return 6500;

    }

    if (
        pianoState.waveform ===
        "warm"
    ) {

        return 3600;

    }

    return 4800;

}


/* ================================================================
   26 — DÉCROISSANCE SONORE
================================================================ */

function getDecayTime() {

    if (
        pianoState.waveform ===
        "bright"
    ) {

        return 2.2;

    }

    if (
        pianoState.waveform ===
        "warm"
    ) {

        return 3.2;

    }

    return 2.8;

}


/* ================================================================
   27 — JOUER UNE NOTE
================================================================ */

async function playNote(
    midi
) {

    midi =
        Number(midi);


    if (
        !Number.isInteger(midi) ||
        midi < FOBAS_PIANO_CONFIG.midiMin ||
        midi > FOBAS_PIANO_CONFIG.midiMax
    ) {

        return;

    }


    const ready =
        await ensureAudioReady();

    if (!ready) {

        return;

    }


    /*
       Éviter les doubles déclenchements
       inutiles.
    */

    if (
        pianoState.activeNotes.has(
            midi
        )
    ) {

        return;

    }


    /*
       Limite de polyphonie
    */

    enforcePolyphonyLimit();


    const voice =
        createPianoVoice(
            midi
        );


    if (!voice) {

        return;

    }


    pianoState.activeNotes.set(
        midi,
        voice
    );


    setKeyVisual(
        midi,
        true
    );


    updateMusicalDisplay(
        midi
    );


    addNoteToSequence(
        midi
    );

}


/* ================================================================
   28 — ARRÊTER UNE NOTE
================================================================ */

function stopNote(
    midi
) {

    midi =
        Number(midi);


    const voice =
        pianoState.activeNotes.get(
            midi
        );


    if (!voice) {

        setKeyVisual(
            midi,
            false
        );

        return;

    }


    /*
       Sustain garde la note active.
    */

    if (pianoState.sustain) {

        voice.sustainHeld =
            true;

        return;

    }


    releaseVoice(
        midi,
        voice
    );

}


/* ================================================================
   29 — RELÂCHER UNE VOIX
================================================================ */

function releaseVoice(
    midi,
    voice
) {

    if (!voice || voice.released) {

        return;

    }


    voice.released =
        true;


    const ctx =
        pianoState.audioContext;

    if (!ctx) {

        pianoState.activeNotes.delete(
            midi
        );

        setKeyVisual(
            midi,
            false
        );

        return;

    }


    const now =
        ctx.currentTime;


    try {

        voice.gain.gain.cancelScheduledValues(
            now
        );

        voice.gain.gain.setValueAtTime(
            Math.max(
                voice.gain.gain.value,
                0.0001
            ),
            now
        );

        voice.gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now +
            FOBAS_PIANO_CONFIG.masterFadeOut
        );


        voice.main.stop(
            now +
            FOBAS_PIANO_CONFIG.masterFadeOut +
            0.03
        );

        voice.body.stop(
            now +
            FOBAS_PIANO_CONFIG.masterFadeOut +
            0.03
        );

        voice.harmonic.stop(
            now +
            FOBAS_PIANO_CONFIG.masterFadeOut +
            0.03
        );


    } catch (error) {

        console.warn(
            "Voice release:",
            error
        );

    }


    voice.releaseTimer =
        window.setTimeout(
            () => {

                pianoState.audioNodes.delete(
                    voice
                );

                pianoState.activeNotes.delete(
                    midi
                );

            },
            150
        );


    setKeyVisual(
        midi,
        false
    );

}


/* ================================================================
   30 — LIBÉRER TOUTES LES NOTES
================================================================ */

function releaseAllNotes() {

    pianoState.activeNotes.forEach(
        (voice, midi) => {

            releaseVoice(
                midi,
                voice
            );

        }
    );


    pianoState.activePointerNotes.clear();

    pianoState.pressedComputerKeys.clear();

    document
        .querySelectorAll(
            ".piano-white-key.active, .piano-black-key.active"
        )
        .forEach(
            key => {

                key.classList.remove(
                    "active"
                );

            }
        );

}


/* ================================================================
   31 — LIMITE POLYPHONIE
================================================================ */

function enforcePolyphonyLimit() {

    const max =
        FOBAS_PIANO_CONFIG.maxPolyphony;

    if (
        pianoState.activeNotes.size <
        max
    ) {

        return;

    }


    const first =
        pianoState.activeNotes
            .entries()
            .next()
            .value;


    if (first) {

        const [
            midi,
            voice
        ] = first;

        releaseVoice(
            midi,
            voice
        );

    }

}


/* ================================================================
   32 — VISUEL TOUCHE
================================================================ */

function setKeyVisual(
    midi,
    active
) {

    const key =
        pianoState.midiToKey.get(
            Number(midi)
        );


    if (!key) {

        return;

    }


    key.classList.toggle(
        "active",
        Boolean(active)
    );

}


/* ================================================================
   33 — AFFICHAGE NOTE
================================================================ */

function updateMusicalDisplay(
    midi
) {

    const info =
        getMidiInformation(
            midi
        );


    pianoState.lastNote =
        info;


    if (pianoDOM.currentNote) {

        pianoDOM.currentNote.textContent =
            info.note;

    }


    if (pianoDOM.currentOctave) {

        pianoDOM.currentOctave.textContent =
            info.octave;

    }


    moveNoteMarker(
        midi
    );

}


/* ================================================================
   34 — NOTE MARKER
================================================================ */

function moveNoteMarker(
    midi
) {

    if (!pianoDOM.noteMarker) {

        return;

    }


    const range =
        FOBAS_PIANO_CONFIG.midiMax -
        FOBAS_PIANO_CONFIG.midiMin;


    const position =
        (
            (
                midi -
                FOBAS_PIANO_CONFIG.midiMin
            ) /
            range
        ) * 80 + 10;


    pianoDOM.noteMarker.style.left =
        `${position}%`;

    pianoDOM.noteMarker.style.opacity =
        "1";


    window.clearTimeout(
        pianoState.noteMarkerTimer
    );


    pianoState.noteMarkerTimer =
        window.setTimeout(
            () => {

                if (pianoDOM.noteMarker) {

                    pianoDOM.noteMarker.style.opacity =
                        "0";

                }

            },
            FOBAS_PIANO_CONFIG.noteMarkerDuration
        );

}


/* ================================================================
   35 — STATUS
================================================================ */

function updateStatus(
    message
) {

    if (
        pianoDOM.statusText
    ) {

        pianoDOM.statusText.textContent =
            message;

    }

}


/* ================================================================
   36 — BOUTON AUDIO
================================================================ */

function updateAudioButton() {

    if (!pianoDOM.startAudioBtn) {

        return;

    }


    if (pianoState.audioReady) {

        pianoDOM.startAudioBtn.textContent =
            "Piano actif";

        pianoDOM.startAudioBtn.classList.add(
            "audio-ready"
        );

    }

    else {

        pianoDOM.startAudioBtn.textContent =
            "Activer le piano";

        pianoDOM.startAudioBtn.classList.remove(
            "audio-ready"
        );

    }

}


/* ================================================================
   37 — SUSTAIN
================================================================ */

function toggleSustain() {

    pianoState.sustain =
        !pianoState.sustain;


    updateSustainButton();


    if (!pianoState.sustain) {

        pianoState.activeNotes.forEach(
            (voice, midi) => {

                if (
                    voice.sustainHeld
                ) {

                    voice.sustainHeld =
                        false;

                    releaseVoice(
                        midi,
                        voice
                    );

                }

            }
        );

    }


    updateStatus(
        pianoState.sustain
            ? "Sustain activé."
            : "Sustain désactivé."
    );

}


/* ================================================================
   38 — UI SUSTAIN
================================================================ */

function updateSustainButton() {

    const button =
        pianoDOM.sustainBtn;

    if (!button) {

        return;

    }


    button.setAttribute(
        "aria-pressed",
        String(
            pianoState.sustain
        )
    );


    const span =
        button.querySelector(
            "span"
        );


    if (span) {

        span.textContent =
            pianoState.sustain
                ? "ON"
                : "OFF";

    }


    button.classList.toggle(
        "active",
        pianoState.sustain
    );

}


/* ================================================================
   39 — VOLUME
================================================================ */

function updateVolume(
    value
) {

    const numeric =
        Number(value);


    if (
        !Number.isFinite(numeric)
    ) {

        return;

    }


    pianoState.volume =
        Math.min(
            1,
            Math.max(
                0,
                numeric
            )
        );


    if (
        pianoState.masterGain &&
        pianoState.audioContext
    ) {

        pianoState.masterGain.gain.setTargetAtTime(
            pianoState.volume,
            pianoState.audioContext.currentTime,
            0.015
        );

    }


    if (pianoDOM.volumeValue) {

        pianoDOM.volumeValue.textContent =
            `${Math.round(
                pianoState.volume * 100
            )}%`;

    }

}


/* ================================================================
   40 — BPM
================================================================ */

function updateBPM(
    value
) {

    const numeric =
        Number(value);


    if (
        !Number.isFinite(numeric)
    ) {

        return;

    }


    pianoState.bpm =
        Math.min(
            FOBAS_PIANO_CONFIG.maxBpm,
            Math.max(
                FOBAS_PIANO_CONFIG.minBpm,
                numeric
            )
        );


    if (pianoDOM.bpmValue) {

        pianoDOM.bpmValue.textContent =
            String(
                pianoState.bpm
            );

    }


    if (pianoDOM.bpmOutput) {

        pianoDOM.bpmOutput.textContent =
            String(
                pianoState.bpm
            );

    }


    if (
        pianoState.metronome
    ) {

        restartMetronome();

    }

}


/* ================================================================
   41 — TYPE DE SON
================================================================ */

function updateWaveform(
    value
) {

    const allowed = [

        "piano",
        "warm",
        "bright"

    ];


    if (
        !allowed.includes(
            value
        )
    ) {

        pianoState.waveform =
            "piano";

    }

    else {

        pianoState.waveform =
            value;

    }


    updateStatus(
        `Son sélectionné : ${getWaveformLabel()}`
    );

}


/* ================================================================
   42 — NOM DU SON
================================================================ */

function getWaveformLabel() {

    if (
        pianoState.waveform ===
        "warm"
    ) {

        return "Piano Warm";

    }


    if (
        pianoState.waveform ===
        "bright"
    ) {

        return "Piano Bright";

    }


    return "Piano";

}


/* ================================================================
   43 — MÉTRONOME
================================================================ */

function toggleMetronome() {

    pianoState.metronome =
        !pianoState.metronome;


    updateMetronomeButton();


    if (pianoState.metronome) {

        startMetronome();

        updateStatus(
            "Métronome activé."
        );

    }

    else {

        stopMetronome();

        updateStatus(
            "Métronome désactivé."
        );

    }

}


/* ================================================================
   44 — START MÉTRONOME
================================================================ */

function startMetronome() {

    stopMetronome();


    pianoState.metronomeBeat =
        0;


    const interval =
        getMetronomeInterval();


    pianoState.metronomeTimer =
        window.setInterval(
            metronomeTick,
            interval
        );


    metronomeTick();

}


/* ================================================================
   45 — STOP MÉTRONOME
================================================================ */

function stopMetronome() {

    if (
        pianoState.metronomeTimer
    ) {

        window.clearInterval(
            pianoState.metronomeTimer
        );

        pianoState.metronomeTimer =
            null;

    }


    pianoState.metronomeBeat =
        0;

}


/* ================================================================
   46 — RESTART MÉTRONOME
================================================================ */

function restartMetronome() {

    if (
        !pianoState.metronome
    ) {

        return;

    }


    startMetronome();

}


/* ================================================================
   47 — INTERVALLE MÉTRONOME
================================================================ */

function getMetronomeInterval() {

    return (
        60000 /
        pianoState.bpm
    );

}


/* ================================================================
   48 — TICK MÉTRONOME
================================================================ */

async function metronomeTick() {

    if (
        !pianoState.metronome
    ) {

        return;

    }


    pianoState.metronomeBeat++;


    const beat =
        pianoState.metronomeBeat;


    const accent =
        beat ===
        1;


    await playMetronomeClick(
        accent
    );


    if (
        beat >=
        FOBAS_PIANO_CONFIG.metronomeAccentEvery
    ) {

        pianoState.metronomeBeat =
            0;

    }

}


/* ================================================================
   49 — SON MÉTRONOME
================================================================ */

async function playMetronomeClick(
    accent
) {

    const ready =
        await ensureAudioReady();

    if (!ready) {

        return;

    }


    const ctx =
        pianoState.audioContext;

    const oscillator =
        ctx.createOscillator();

    const gain =
        ctx.createGain();


    oscillator.type =
        "sine";


    oscillator.frequency.value =
        accent
            ? 1450
            : 950;


    const now =
        ctx.currentTime;


    gain.gain.setValueAtTime(
        0.0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        accent
            ? 0.22
            : 0.13,
        now + 0.003
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.075
    );


    oscillator.connect(
        gain
    );

    gain.connect(
        pianoState.masterGain
    );


    oscillator.start(
        now
    );

    oscillator.stop(
        now + 0.08
    );

}


/* ================================================================
   50 — MAPPING CLAVIER ORDINATEUR
================================================================ */

async function handleComputerKeyDown(
    event
) {

    /*
       Ne pas intercepter les touches
       lorsqu'un champ est sélectionné.
    */

    const target =
        event.target;


    if (
        target &&
        (
            target.tagName === "INPUT" ||
            target.tagName === "SELECT" ||
            target.tagName === "TEXTAREA"
        )
    ) {

        return;

    }


    const key =
        String(
            event.key
        ).toLowerCase();


    /*
       ESPACE = sustain
    */

    if (
        event.code ===
        "Space"
    ) {

        event.preventDefault();


        if (
            !pianoState.pressedComputerKeys.has(
                "Space"
            )
        ) {

            pianoState.pressedComputerKeys.add(
                "Space"
            );

            toggleSustain();

        }

        return;

    }


    const midi =
        COMPUTER_KEY_MAP[key];


    if (
        midi === undefined
    ) {

        return;

    }


    event.preventDefault();


    if (
        pianoState.pressedComputerKeys.has(
            key
        )
    ) {

        return;

    }


    pianoState.pressedComputerKeys.add(
        key
    );


    await playNote(
        midi
    );

}


/* ================================================================
   51 — KEYUP CLAVIER
================================================================ */

function handleComputerKeyUp(
    event
) {

    const key =
        String(
            event.key
        ).toLowerCase();


    if (
        event.code ===
        "Space"
    ) {

        pianoState.pressedComputerKeys.delete(
            "Space"
        );

        return;

    }


    const midi =
        COMPUTER_KEY_MAP[key];


    if (
        midi === undefined
    ) {

        return;

    }


    pianoState.pressedComputerKeys.delete(
        key
    );


    stopNote(
        midi
    );

}


/* ================================================================
   52 — ÉVÉNEMENT VISIBILITÉ
================================================================ */

function handleVisibilityChange() {

    if (
        document.hidden
    ) {

        releaseAllNotes();

    }

}


/* ================================================================
   53 — REDIMENSIONNEMENT
================================================================ */

function handleResize() {

    window.clearTimeout(
        pianoState.resizeTimer
    );


    pianoState.resizeTimer =
        window.setTimeout(
            () => {

                repositionBlackKeys();

            },
            80
        );

}


/* ================================================================
   54 — REPOSITIONNER TOUCHES NOIRES
================================================================ */

function repositionBlackKeys() {

    pianoState.blackKeys.forEach(
        key => {

            const midi =
                Number(
                    key.dataset.midi
                );

            positionBlackKey(
                key,
                midi
            );

        }
    );

}


/* ================================================================
   55 — SÉQUENCE DE NOTES
================================================================ */

function addNoteToSequence(
    midi
) {

    const info =
        getMidiInformation(
            midi
        );


    pianoState.noteSequence.push({

        midi,

        note:
            info.note,

        octave:
            info.octave,

        time:
            Date.now()

    });


    /*
       On conserve une fenêtre
       raisonnable pour éviter
       une croissance infinie.
    */

    if (
        pianoState.noteSequence.length >
        500
    ) {

        pianoState.noteSequence.shift();

    }

}


/* ================================================================
   56 — UI MÉTRONOME
================================================================ */

function updateMetronomeButton() {

    const button =
        pianoDOM.metronomeBtn;


    if (!button) {

        return;

    }


    button.setAttribute(
        "aria-pressed",
        String(
            pianoState.metronome
        )
    );


    const span =
        button.querySelector(
            "span"
        );


    if (span) {

        span.textContent =
            pianoState.metronome
                ? "ON"
                : "OFF";

    }


    button.classList.toggle(
        "active",
        pianoState.metronome
    );

}


/* ================================================================
   57 — ÉVÉNEMENT AUDIO
================================================================ */

async function handleAudioButton() {

    const ready =
        await ensureAudioReady();


    if (ready) {

        updateStatus(
            "Moteur audio FOBAS actif."
        );

    }

}


/* ================================================================
   58 — BINDINGS DOM
================================================================ */

function bindDOMEvents() {

    /*
       Audio
    */

    if (
        pianoDOM.startAudioBtn
    ) {

        pianoDOM.startAudioBtn.addEventListener(
            "click",
            handleAudioButton
        );

    }


    /*
       Sustain
    */

    if (
        pianoDOM.sustainBtn
    ) {

        pianoDOM.sustainBtn.addEventListener(
            "click",
            toggleSustain
        );

    }


    /*
       Métronome
    */

    if (
        pianoDOM.metronomeBtn
    ) {

        pianoDOM.metronomeBtn.addEventListener(
            "click",
            toggleMetronome
        );

    }


    /*
       Volume
    */

    if (
        pianoDOM.volume
    ) {

        pianoDOM.volume.addEventListener(
            "input",
            event => {

                updateVolume(
                    event.target.value
                );

            }
        );

    }


    /*
       BPM
    */

    if (
        pianoDOM.bpm
    ) {

        pianoDOM.bpm.addEventListener(
            "input",
            event => {

                updateBPM(
                    event.target.value
                );

            }
        );

    }


    /*
       Type de son
    */

    if (
        pianoDOM.waveform
    ) {

        pianoDOM.waveform.addEventListener(
            "change",
            event => {

                updateWaveform(
                    event.target.value
                );

            }
        );

    }


    /*
       Clavier physique
    */

    document.addEventListener(
        "keydown",
        handleComputerKeyDown
    );


    document.addEventListener(
        "keyup",
        handleComputerKeyUp
    );


    /*
       Sécurité clavier
    */

    window.addEventListener(
        "blur",
        releaseAllNotes
    );


    document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
    );


    window.addEventListener(
        "resize",
        handleResize,
        {
            passive: true
        }
    );

}


/* ================================================================
   59 — VALEURS INITIALES UI
================================================================ */

function initializeUIValues() {

    if (pianoDOM.volume) {

        pianoDOM.volume.value =
            String(
                pianoState.volume
            );

    }


    if (pianoDOM.bpm) {

        pianoDOM.bpm.value =
            String(
                pianoState.bpm
            );

    }


    if (pianoDOM.waveform) {

        pianoDOM.waveform.value =
            pianoState.waveform;

    }


    updateVolume(
        pianoState.volume
    );


    updateBPM(
        pianoState.bpm
    );


    updateSustainButton();

    updateMetronomeButton();

    updateAudioButton();

}


/* ================================================================
   60 — INITIALISATION PRINCIPALE
================================================================ */

function initializeFobasPiano() {

    cacheDOM();


    if (!validateDOM()) {

        return;

    }


    buildPianoKeyboard();

    initializeUIValues();

    bindDOMEvents();


    updateStatus(
        "Prêt — activez le piano pour commencer."
    );


    console.info(
        "FOBAS PIANO",
        `v${FOBAS_PIANO_CONFIG.version}`,
        "— moteur initialisé."
    );

}


/* ================================================================
   61 — DÉMARRAGE
================================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeFobasPiano,
        {
            once: true
        }
    );

}

else {

    initializeFobasPiano();

}