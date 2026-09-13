/* ================================================================
   FOBAS PIANO
   ================================================================
   MOTEUR JAVASCRIPT PRINCIPAL
   simulationpianofobas.js

   VERSION
   ---------------------------------------------------------------
   FOBAS PIANO PRO — PROFESSIONAL MUSICAL SIMULATION ENGINE
   ================================================================ */


/* ================================================================
   01 — CONFIGURATION PRINCIPALE
================================================================ */

const FOBAS_PIANO_CONFIG = {

    appName: "FOBAS PIANO",
    version: "2.0.0 PRO",

    /* Piano acoustique standard */
    midiMin: 21,          // A0
    midiMax: 108,         // C8

    defaultVolume: 0.72,
    defaultBpm: 100,
    minBpm: 40,
    maxBpm: 220,

    maxPolyphony: 96,

    masterFadeIn: 0.008,
    masterFadeOut: 0.12,

    sampleBasePath: "samples/fobas-piano/",
    sampleEnabled: false,

    sampleManifest: null,

    defaultTimeSignatureNumerator: 4,
    defaultTimeSignatureDenominator: 4,

    defaultSubdivision: 1,

    noteMarkerDuration: 650,

    storagePrefix: "FOBAS_PIANO_PRO_",

    midiVelocityDefault: 92,

    keyboardOctaveOffset: 0,
    keyboardOctaveMin: -3,
    keyboardOctaveMax: 3,

    computerKeyboardBaseMidi: 60,

    metronomeLookAhead: 0.1,
    metronomeScheduleInterval: 25,

    recordingResolution: 1,

    sustainCC: 64,
    sostenutoCC: 66,
    softCC: 67,

    pitchBendCenter: 8192,
    pitchBendRange: 2
};


/* ================================================================
   02 — NOTE SYSTEM
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

const NOTE_NAMES_FR = {
    C: "Do",
    "C#": "Do#",
    D: "Ré",
    "D#": "Ré#",
    E: "Mi",
    F: "Fa",
    "F#": "Fa#",
    G: "Sol",
    "G#": "Sol#",
    A: "La",
    "A#": "La#",
    B: "Si"
};


/* ================================================================
   03 — COMPUTER KEYBOARD
================================================================ */

const COMPUTER_KEY_MAP = {

    a: 48,
    w: 49,
    s: 50,
    e: 51,
    d: 52,
    f: 53,
    t: 54,
    g: 55,
    y: 56,
    h: 57,
    u: 58,
    j: 59,
    k: 60,

    o: 61,
    l: 62,
    p: 63,
    ";": 64,

    z: 65,
    x: 66,
    c: 67,
    v: 68,
    b: 69,
    n: 70,
    m: 71,
    ",": 72
};


/* ================================================================
   04 — PIANO STATE
================================================================ */

const pianoState = {

    audioContext: null,
    masterGain: null,
    compressor: null,

    audioReady: false,
    audioStarting: false,

    volume: FOBAS_PIANO_CONFIG.defaultVolume,
    bpm: FOBAS_PIANO_CONFIG.defaultBpm,

    waveform: "piano",

    keyboardOctaveOffset:
        FOBAS_PIANO_CONFIG.keyboardOctaveOffset,

    sustain: false,
    sostenuto: false,
    soft: false,

    metronome: false,
    metronomeTimer: null,
    metronomeNextTime: 0,
    metronomeBeat: 0,

    timeSignatureNumerator:
        FOBAS_PIANO_CONFIG.defaultTimeSignatureNumerator,

    timeSignatureDenominator:
        FOBAS_PIANO_CONFIG.defaultTimeSignatureDenominator,

    subdivision:
        FOBAS_PIANO_CONFIG.defaultSubdivision,

    audioNodes: new Set(),

    activeVoices: new Map(),

    noteVoices: new Map(),

    activePointerNotes: new Map(),

    activeComputerNotes: new Map(),

    activeMidiNotes: new Map(),

    pressedComputerKeys: new Set(),

    heldSostenutoNotes: new Set(),

    pedalState: {
        sustain: false,
        sostenuto: false,
        soft: false
    },

    generatedKeys: new Map(),

    whiteKeys: [],
    blackKeys: [],

    midiToKey: new Map(),

    lastNote: null,

    noteSequence: [],

    currentScore: [],

    scoreCursor: 0,

    currentExercise: null,

    exerciseIndex: 0,

    learningMode: false,

    recording: false,

    recordingStartedAt: 0,

    recordingEvents: [],

    recordings: [],

    playback: false,

    playbackTimers: [],

    playbackStartedAt: 0,

    currentSong: null,

    practiceStats: {

        correct: 0,
        wrong: 0,
        missed: 0,
        total: 0,
        timingErrors: [],
        startTime: 0,
        endTime: 0
    },

    midiAccess: null,
    midiInputs: [],
    midiOutputs: [],
    selectedMidiInput: null,
    selectedMidiOutput: null,

    resizeTimer: null,

    pointerVoices: new Map(),

    initialized: false
};


/* ================================================================
   05 — DOM CACHE
================================================================ */

const pianoDOM = {};

function cacheDOM() {

    pianoDOM.app =
        document.getElementById("pianoApp");

    pianoDOM.keyboard =
        document.getElementById("pianoKeyboard");

    pianoDOM.staff =
        document.getElementById("staff");

    pianoDOM.noteMarker =
        document.getElementById("noteMarker");

    pianoDOM.startAudioBtn =
        document.getElementById("startAudioBtn");

    pianoDOM.sustainBtn =
        document.getElementById("sustainBtn");

    pianoDOM.metronomeBtn =
        document.getElementById("metronomeBtn");

    pianoDOM.volume =
        document.getElementById("volume");

    pianoDOM.volumeValue =
        document.getElementById("volumeValue");

    pianoDOM.bpm =
        document.getElementById("bpm");

    pianoDOM.bpmOutput =
        document.getElementById("bpmOutput");

    pianoDOM.bpmValue =
        document.getElementById("bpmValue");

    pianoDOM.waveform =
        document.getElementById("waveform");

    pianoDOM.currentNote =
        document.getElementById("currentNote");

    pianoDOM.currentOctave =
        document.getElementById("currentOctave");

    pianoDOM.statusText =
        document.getElementById("statusText");
}


/* ================================================================
   06 — UTILITAIRES
================================================================ */

function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}


function midiToNoteName(midi) {

    const value = Number(midi);

    if (!Number.isFinite(value)) {
        return "—";
    }

    return NOTE_NAMES[
        ((value % 12) + 12) % 12
    ];
}


function midiToOctave(midi) {

    return Math.floor(
        Number(midi) / 12
    ) - 1;
}


function midiToLabel(midi) {

    return (
        midiToNoteName(midi) +
        midiToOctave(midi)
    );
}


function noteNameToMidi(note, octave) {

    const index =
        NOTE_NAMES.indexOf(note);

    if (index < 0) {
        return null;
    }

    return (
        (Number(octave) + 1) * 12 +
        index
    );
}


function isBlackKey(midi) {

    return [
        1,
        3,
        6,
        8,
        10
    ].includes(
        ((midi % 12) + 12) % 12
    );
}


function getVelocityFromPointer(event) {

    if (
        event &&
        Number.isFinite(event.pressure) &&
        event.pressure > 0
    ) {

        return clamp(
            event.pressure * 127,
            1,
            127
        );
    }

    return 92;
}


function getCurrentTime() {

    if (
        pianoState.audioContext
    ) {

        return pianoState.audioContext.currentTime;
    }

    return 0;
}


/* ================================================================
   07 — PIANO KEYBOARD ENGINE
================================================================ */

const PianoKeyboardEngine = {

    initialize() {

        this.build88Keys();
        this.bindPointerEvents();
        this.bindKeyboardEvents();
        this.positionBlackKeys();

        window.addEventListener(
            "resize",
            () => {

                clearTimeout(
                    pianoState.resizeTimer
                );

                pianoState.resizeTimer =
                    setTimeout(
                        () => this.positionBlackKeys(),
                        100
                    );
            }
        );
    },


    build88Keys() {

        if (!pianoDOM.keyboard) {
            return;
        }

        pianoDOM.keyboard.innerHTML = "";

        pianoState.whiteKeys = [];
        pianoState.blackKeys = [];
        pianoState.midiToKey.clear();

        for (
            let midi = FOBAS_PIANO_CONFIG.midiMin;
            midi <= FOBAS_PIANO_CONFIG.midiMax;
            midi++
        ) {

            const key =
                this.createKey(midi);

            pianoDOM.keyboard.appendChild(key);

            pianoState.midiToKey.set(
                midi,
                key
            );

            if (isBlackKey(midi)) {
                pianoState.blackKeys.push(key);
            } else {
                pianoState.whiteKeys.push(key);
            }
        }
    },


    createKey(midi) {

        const black =
            isBlackKey(midi);

        const key =
            document.createElement("button");

        key.type = "button";

        key.className =
            black
                ? "piano-black-key"
                : "piano-white-key";

        key.dataset.midi = String(midi);
        key.dataset.note = midiToLabel(midi);
        key.dataset.noteName =
            midiToNoteName(midi);

        key.setAttribute(
            "aria-label",
            `${midiToLabel(midi)} — MIDI ${midi}`
        );

        key.tabIndex = -1;

        const label =
            document.createElement("span");

        label.className =
            "fobas-piano-key-label";

        label.textContent =
            midiToLabel(midi);

        key.appendChild(label);

        return key;
    },


    bindPointerEvents() {

        if (!pianoDOM.keyboard) {
            return;
        }

        pianoDOM.keyboard.addEventListener(
            "pointerdown",
            async event => {

                const key =
                    event.target.closest(
                        "[data-midi]"
                    );

                if (!key) {
                    return;
                }

                event.preventDefault();

                try {
                    key.setPointerCapture(
                        event.pointerId
                    );
                } catch (_) {}

                const midi =
                    Number(key.dataset.midi);

                const velocity =
                    getVelocityFromPointer(event);

                pianoState.activePointerNotes.set(
                    event.pointerId,
                    midi
                );

                await NoteEngine.noteOn(
                    midi,
                    velocity,
                    "pointer",
                    event.pointerId
                );
            }
        );


        const releasePointer =
            event => {

                const midi =
                    pianoState.activePointerNotes.get(
                        event.pointerId
                    );

                if (
                    midi === undefined
                ) {
                    return;
                }

                pianoState.activePointerNotes.delete(
                    event.pointerId
                );

                NoteEngine.noteOff(
                    midi,
                    "pointer",
                    event.pointerId
                );
            };


        pianoDOM.keyboard.addEventListener(
            "pointerup",
            releasePointer
        );

        pianoDOM.keyboard.addEventListener(
            "pointercancel",
            releasePointer
        );

        pianoDOM.keyboard.addEventListener(
            "lostpointercapture",
            releasePointer
        );
    },


    bindKeyboardEvents() {

        document.addEventListener(
            "keydown",
            async event => {

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

                if (event.repeat) {
                    return;
                }

                const key =
                    event.key.toLowerCase();

                if (key === " ") {

                    event.preventDefault();

                    PedalEngine.toggle(
                        "sustain"
                    );

                    return;
                }

                if (
                    key === "arrowup"
                ) {

                    event.preventDefault();

                    OctaveEngine.shift(1);

                    return;
                }

                if (
                    key === "arrowdown"
                ) {

                    event.preventDefault();

                    OctaveEngine.shift(-1);

                    return;
                }

                const baseMidi =
                    COMPUTER_KEY_MAP[key];

                if (
                    baseMidi === undefined
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

                const midi =
                    baseMidi +
                    pianoState.keyboardOctaveOffset * 12;

                if (
                    midi < FOBAS_PIANO_CONFIG.midiMin ||
                    midi > FOBAS_PIANO_CONFIG.midiMax
                ) {
                    return;
                }

                pianoState.activeComputerNotes.set(
                    key,
                    midi
                );

                await NoteEngine.noteOn(
                    midi,
                    FOBAS_PIANO_CONFIG.midiVelocityDefault,
                    "computer",
                    key
                );
            }
        );


        document.addEventListener(
            "keyup",
            event => {

                const key =
                    event.key.toLowerCase();

                if (
                    !pianoState.pressedComputerKeys.has(
                        key
                    )
                ) {
                    return;
                }

                pianoState.pressedComputerKeys.delete(
                    key
                );

                const midi =
                    pianoState.activeComputerNotes.get(
                        key
                    );

                pianoState.activeComputerNotes.delete(
                    key
                );

                if (
                    midi !== undefined
                ) {

                    NoteEngine.noteOff(
                        midi,
                        "computer",
                        key
                    );
                }
            }
        );
    },


    positionBlackKeys() {

        if (
            !pianoDOM.keyboard
        ) {
            return;
        }

        const whiteKeys =
            pianoState.whiteKeys;

        const keyboardRect =
            pianoDOM.keyboard.getBoundingClientRect();

        if (!keyboardRect.width) {
            return;
        }

        const whiteWidth =
            keyboardRect.width /
            whiteKeys.length;

        let whiteIndex = 0;

        for (
            let midi =
                FOBAS_PIANO_CONFIG.midiMin;
            midi <= FOBAS_PIANO_CONFIG.midiMax;
            midi++
        ) {

            const key =
                pianoState.midiToKey.get(
                    midi
                );

            if (!key) {
                continue;
            }

            if (isBlackKey(midi)) {

                const previousWhite =
                    midi - 1;

                const previousWhiteIndex =
                    this.countWhiteKeysBefore(
                        previousWhite
                    );

                const left =
                    (
                        previousWhiteIndex +
                        1
                    ) *
                    whiteWidth -
                    whiteWidth * 0.32;

                key.style.left =
                    `${left}px`;

            } else {

                whiteIndex++;
            }
        }
    },


    countWhiteKeysBefore(midi) {

        let count = 0;

        for (
            let i =
                FOBAS_PIANO_CONFIG.midiMin;
            i <= midi;
            i++
        ) {

            if (!isBlackKey(i)) {
                count++;
            }
        }

        return count - 1;
    },


    setKeyVisual(midi, active) {

        const key =
            pianoState.midiToKey.get(
                midi
            );

        if (!key) {
            return;
        }

        key.classList.toggle(
            "active",
            Boolean(active)
        );

        key.setAttribute(
            "aria-pressed",
            active ? "true" : "false"
        );
    }
};


/* ================================================================
   08 — AUDIO ENGINE
================================================================ */

const AcousticSampleEngine = {

    buffers: new Map(),
    loading: new Map(),
    enabled: false,
    manifest: null,


    async initialize() {

        this.enabled =
            Boolean(
                FOBAS_PIANO_CONFIG.sampleEnabled
            );

        this.manifest =
            FOBAS_PIANO_CONFIG.sampleManifest;

        if (
            !this.enabled ||
            !this.manifest
        ) {
            return;
        }

        await this.preloadManifest();
    },


    async preloadManifest() {

        const entries =
            this.getManifestEntries();

        await Promise.all(
            entries.map(
                item =>
                    this.loadSample(
                        item.midi,
                        item.velocityLayer,
                        item.url
                    )
            )
        );
    },


    getManifestEntries() {

        const result = [];

        if (!this.manifest) {
            return result;
        }

        for (
            const layer of Object.keys(
                this.manifest
            )
        ) {

            const notes =
                this.manifest[layer];

            if (!notes) {
                continue;
            }

            for (
                const midi of Object.keys(notes)
            ) {

                result.push({
                    midi: Number(midi),
                    velocityLayer: layer,
                    url: notes[midi]
                });
            }
        }

        return result;
    },


    async loadSample(
        midi,
        velocityLayer,
        url
    ) {

        const key =
            `${midi}:${velocityLayer}`;

        if (
            this.buffers.has(key)
        ) {
            return this.buffers.get(key);
        }

        if (
            this.loading.has(key)
        ) {
            return this.loading.get(key);
        }

        const promise =
            fetch(url)
                .then(response => {

                    if (!response.ok) {
                        throw new Error(
                            "Sample unavailable"
                        );
                    }

                    return response.arrayBuffer();
                })
                .then(buffer =>
                    pianoState.audioContext.decodeAudioData(
                        buffer
                    )
                )
                .then(decoded => {

                    this.buffers.set(
                        key,
                        decoded
                    );

                    return decoded;
                })
                .catch(() => null);

        this.loading.set(
            key,
            promise
        );

        return promise;
    },


    getLayer(velocity) {

        if (velocity < 48) {
            return "soft";
        }

        if (velocity < 96) {
            return "medium";
        }

        return "hard";
    },


    async play(
        midi,
        velocity,
        voice
    ) {

        if (
            !this.enabled ||
            !this.manifest ||
            !pianoState.audioContext
        ) {
            return false;
        }

        const layer =
            this.getLayer(velocity);

        const exact =
            this.manifest?.[layer]?.[midi];

        if (!exact) {
            return false;
        }

        const buffer =
            await this.loadSample(
                midi,
                layer,
                exact
            );

        if (!buffer) {
            return false;
        }

        const source =
            pianoState.audioContext.createBufferSource();

        const gain =
            pianoState.audioContext.createGain();

        source.buffer = buffer;

        gain.gain.setValueAtTime(
            0.0001,
            getCurrentTime()
        );

        gain.gain.exponentialRampToValueAtTime(
            getNoteAmplitude(velocity),
            getCurrentTime() +
            FOBAS_PIANO_CONFIG.masterFadeIn
        );

        source.connect(gain);
        gain.connect(
            pianoState.masterGain
        );

        source.start();

        voice.sampleSource = source;
        voice.sampleGain = gain;

        pianoState.audioNodes.add(source);
        pianoState.audioNodes.add(gain);

        return true;
    }
};


/* ================================================================
   09 — VOICE ENGINE
================================================================ */

const VoiceEngine = {

    create(
        midi,
        velocity
    ) {

        const now =
            getCurrentTime();

        const voice = {

            id:
                `${Date.now()}_${Math.random()
                    .toString(36)
                    .slice(2)}`,

            midi,
            velocity,

            startedAt:
                performance.now(),

            audioStartedAt:
                now,

            released: false,
            sustainHeld: false,
            sostenutoHeld: false,

            oscillators: [],
            gains: [],

            sampleSource: null,
            sampleGain: null,

            source: null
        };

        return voice;
    },


    startFallback(
        voice
    ) {

        const ctx =
            pianoState.audioContext;

        if (!ctx) {
            return;
        }

        const now =
            ctx.currentTime;

        const velocity =
            voice.velocity / 127;

        const amplitude =
            getNoteAmplitude(
                voice.velocity
            );

        const frequency =
            440 *
            Math.pow(
                2,
                (voice.midi - 69) / 12
            );

        const output =
            ctx.createGain();

        const filter =
            ctx.createBiquadFilter();

        filter.type =
            "lowpass";

        filter.frequency.setValueAtTime(
            getFilterFrequency(
                voice.velocity
            ),
            now
        );

        filter.Q.value = 0.65;

        output.gain.setValueAtTime(
            0.0001,
            now
        );

        output.gain.exponentialRampToValueAtTime(
            Math.max(
                0.001,
                amplitude
            ),
            now + 0.012
        );

        const oscillators = [];

        const partials = [
            {
                multiplier: 1,
                gain: 1,
                type: "triangle"
            },
            {
                multiplier: 2,
                gain: 0.23,
                type: "sine"
            },
            {
                multiplier: 3,
                gain: 0.08,
                type: "sine"
            },
            {
                multiplier: 4,
                gain: 0.035,
                type: "sine"
            }
        ];

        partials.forEach(
            partial => {

                const osc =
                    ctx.createOscillator();

                const gain =
                    ctx.createGain();

                osc.type =
                    partial.type;

                osc.frequency.setValueAtTime(
                    frequency *
                    partial.multiplier,
                    now
                );

                osc.detune.setValueAtTime(
                    (
                        partial.multiplier *
                        0.3
                    ),
                    now
                );

                gain.gain.value =
                    partial.gain *
                    (
                        0.85 +
                        velocity * 0.15
                    );

                osc.connect(gain);
                gain.connect(output);

                osc.start(now);

                oscillators.push(
                    osc
                );

                pianoState.audioNodes.add(
                    osc
                );

                pianoState.audioNodes.add(
                    gain
                );
            }
        );

        output.connect(filter);

        filter.connect(
            pianoState.masterGain
        );

        voice.oscillators =
            oscillators;

        voice.output =
            output;

        voice.filter =
            filter;

        voice.gain =
            output;

        pianoState.audioNodes.add(
            output
        );

        pianoState.audioNodes.add(
            filter
        );
    },


    release(
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

        const ctx =
            pianoState.audioContext;

        if (!ctx) {
            return;
        }

        const now =
            ctx.currentTime;

        const release =
            immediate
                ? 0.025
                : getReleaseTime(
                    voice.velocity,
                    pianoState.sustain,
                    pianoState.soft
                );

        if (
            voice.sampleGain
        ) {

            voice.sampleGain.gain.cancelScheduledValues(
                now
            );

            voice.sampleGain.gain.setTargetAtTime(
                0.0001,
                now,
                Math.max(
                    0.01,
                    release / 4
                )
            );

            if (
                voice.sampleSource
            ) {

                try {

                    voice.sampleSource.stop(
                        now +
                        Math.max(
                            0.05,
                            release * 4
                        )
                    );

                } catch (_) {}
            }
        }

        if (voice.gain) {

            voice.gain.gain.cancelScheduledValues(
                now
            );

            voice.gain.gain.setTargetAtTime(
                0.0001,
                now,
                Math.max(
                    0.01,
                    release / 4
                )
            );
        }

        voice.oscillators.forEach(
            oscillator => {

                try {

                    oscillator.stop(
                        now +
                        Math.max(
                            0.05,
                            release * 4
                        )
                    );

                } catch (_) {}
            }
        );

        setTimeout(
            () => {

                pianoState.activeVoices.delete(
                    voice.id
                );

                const voices =
                    pianoState.noteVoices.get(
                        voice.midi
                    );

                if (voices) {

                    voices.delete(
                        voice.id
                    );

                    if (!voices.size) {

                        pianoState.noteVoices.delete(
                            voice.midi
                        );

                        PianoKeyboardEngine.setKeyVisual(
                            voice.midi,
                            false
                        );
                    }
                }

            },
            Math.max(
                100,
                release * 4000
            )
        );
    }
};


/* ================================================================
   10 — AUDIO INITIALIZATION
================================================================ */

async function initializeAudio() {

    if (
        pianoState.audioReady
    ) {

        if (
            pianoState.audioContext.state ===
            "suspended"
        ) {

            await pianoState.audioContext.resume();
        }

        return true;
    }

    if (
        pianoState.audioStarting
    ) {
        return false;
    }

    pianoState.audioStarting = true;

    try {

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContextClass) {

            pianoState.audioStarting =
                false;

            updateStatus(
                "Audio Web non disponible sur cet appareil."
            );

            return false;
        }

        const ctx =
            new AudioContextClass();

        pianoState.audioContext =
            ctx;

        const compressor =
            ctx.createDynamicsCompressor();

        compressor.threshold.value = -18;
        compressor.knee.value = 12;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.18;

        const master =
            ctx.createGain();

        master.gain.value =
            pianoState.volume;

        master.connect(
            compressor
        );

        compressor.connect(
            ctx.destination
        );

        pianoState.masterGain =
            master;

        pianoState.compressor =
            compressor;

        if (
            ctx.state === "suspended"
        ) {
            await ctx.resume();
        }

        pianoState.audioReady = true;

        pianoState.audioStarting =
            false;

        await AcousticSampleEngine.initialize();

        updateAudioButton();

        updateStatus(
            "Piano prêt — vous pouvez commencer à jouer."
        );

        return true;

    } catch (_) {

        pianoState.audioStarting =
            false;

        pianoState.audioReady =
            false;

        updateStatus(
            "Impossible d'activer le moteur audio."
        );

        return false;
    }
}


async function ensureAudioReady() {

    if (
        !pianoState.audioReady
    ) {
        return initializeAudio();
    }

    if (
        pianoState.audioContext &&
        pianoState.audioContext.state ===
        "suspended"
    ) {

        await pianoState.audioContext.resume();
    }

    return true;
}


/* ================================================================
   11 — VOICE PARAMETERS
================================================================ */

function getNoteAmplitude(
    velocity
) {

    const normalized =
        clamp(
            velocity / 127,
            0,
            1
        );

    const curve =
        Math.pow(
            normalized,
            1.25
        );

    return (
        0.045 +
        curve * 0.22
    );
}


function getFilterFrequency(
    velocity
) {

    const normalized =
        clamp(
            velocity / 127,
            0,
            1
        );

    return (
        1700 +
        normalized * 6500
    );
}


function getReleaseTime(
    velocity,
    sustain,
    soft
) {

    let release =
        0.45 +
        (
            velocity / 127
        ) * 0.8;

    if (sustain) {
        release *= 1.8;
    }

    if (soft) {
        release *= 1.12;
    }

    return clamp(
        release,
        0.2,
        3.5
    );
}


/* ================================================================
   12 — NOTE ENGINE
================================================================ */

const NoteEngine = {

    async noteOn(
        midi,
        velocity = 92,
        source = "unknown",
        sourceId = null
    ) {

        midi = Number(midi);

        if (
            midi <
                FOBAS_PIANO_CONFIG.midiMin ||
            midi >
                FOBAS_PIANO_CONFIG.midiMax
        ) {
            return null;
        }

        const ready =
            await ensureAudioReady();

        if (!ready) {
            return null;
        }

        this.stopDuplicateSource(
            midi,
            source,
            sourceId
        );

        enforcePolyphonyLimit();

        velocity =
            clamp(
                Number(velocity) || 92,
                1,
                127
            );

        const voice =
            VoiceEngine.create(
                midi,
                velocity
            );

        voice.source =
            source;

        voice.sourceId =
            sourceId;

        pianoState.activeVoices.set(
            voice.id,
            voice
        );

        if (
            !pianoState.noteVoices.has(
                midi
            )
        ) {

            pianoState.noteVoices.set(
                midi,
                new Set()
            );
        }

        pianoState.noteVoices
            .get(midi)
            .add(voice.id);

        PianoKeyboardEngine.setKeyVisual(
            midi,
            true
        );

        const playedSample =
            await AcousticSampleEngine.play(
                midi,
                velocity,
                voice
            );

        if (!playedSample) {

            VoiceEngine.startFallback(
                voice
            );
        }

        updateMusicalDisplay(
            midi,
            velocity
        );

        RecordingEngine.captureNoteOn(
            midi,
            velocity,
            source
        );

        PracticeScoringEngine.registerPlayedNote(
            midi,
            performance.now()
        );

        return voice;
    },


    noteOff(
        midi,
        source = "unknown",
        sourceId = null
    ) {

        midi = Number(midi);

        const voices =
            pianoState.noteVoices.get(
                midi
            );

        if (!voices) {
            return;
        }

        voices.forEach(
            voiceId => {

                const voice =
                    pianoState.activeVoices.get(
                        voiceId
                    );

                if (!voice) {
                    return;
                }

                if (
                    voice.source !== source
                ) {
                    return;
                }

                if (
                    sourceId !== null &&
                    voice.sourceId !== sourceId
                ) {
                    return;
                }

                if (
                    pianoState.sustain &&
                    !voice.sostenutoHeld
                ) {

                    voice.sustainHeld =
                        true;

                    return;
                }

                if (
                    pianoState.sostenuto &&
                    pianoState.heldSostenutoNotes.has(
                        midi
                    )
                ) {

                    voice.sostenutoHeld =
                        true;

                    return;
                }

                VoiceEngine.release(
                    voice
                );

                RecordingEngine.captureNoteOff(
                    midi,
                    source
                );
            }
        );
    },


    stopDuplicateSource(
        midi,
        source,
        sourceId
    ) {

        const voices =
            pianoState.noteVoices.get(
                midi
            );

        if (!voices) {
            return;
        }

        voices.forEach(
            voiceId => {

                const voice =
                    pianoState.activeVoices.get(
                        voiceId
                    );

                if (
                    voice &&
                    voice.source === source &&
                    voice.sourceId === sourceId
                ) {

                    VoiceEngine.release(
                        voice,
                        true
                    );
                }
            }
        );
    }
};


/* ================================================================
   13 — POLYPHONY ENGINE
================================================================ */

const PolyphonyEngine = {

    enforce() {

        const voices =
            Array.from(
                pianoState.activeVoices.values()
            );

        if (
            voices.length <=
            FOBAS_PIANO_CONFIG.maxPolyphony
        ) {
            return;
        }

        voices
            .sort(
                (
                    a,
                    b
                ) =>
                    a.startedAt -
                    b.startedAt
            )
            .slice(
                0,
                voices.length -
                FOBAS_PIANO_CONFIG.maxPolyphony
            )
            .forEach(
                voice =>
                    VoiceEngine.release(
                        voice,
                        true
                    )
            );
    }
};


function enforcePolyphonyLimit() {

    PolyphonyEngine.enforce();
}


/* ================================================================
   14 — PEDAL ENGINE
================================================================ */

const PedalEngine = {

    set(
        pedal,
        value
    ) {

        value =
            Boolean(value);

        if (
            pedal === "sustain"
        ) {

            if (
                pianoState.sustain === value
            ) {
                return;
            }

            pianoState.sustain =
                value;

            pianoState.pedalState.sustain =
                value;

            if (!value) {
                this.releaseSustain();
            }
        }


        if (
            pedal === "sostenuto"
        ) {

            if (
                pianoState.sostenuto === value
            ) {
                return;
            }

            pianoState.sostenuto =
                value;

            pianoState.pedalState.sostenuto =
                value;

            if (value) {

                this.captureSostenuto();

            } else {

                this.releaseSostenuto();
            }
        }


        if (
            pedal === "soft"
        ) {

            pianoState.soft =
                value;

            pianoState.pedalState.soft =
                value;
        }

        updatePedalUI();
        updateStatus(
            `${pedal} ${value ? "ON" : "OFF"}`
        );

        RecordingEngine.capturePedal(
            pedal,
            value
        );
    },


    toggle(
        pedal
    ) {

        const value =
            !Boolean(
                pianoState[pedal]
            );

        this.set(
            pedal,
            value
        );
    },


    captureSostenuto() {

        pianoState.heldSostenutoNotes.clear();

        pianoState.noteVoices.forEach(
            (
                voiceIds,
                midi
            ) => {

                voiceIds.forEach(
                    voiceId => {

                        const voice =
                            pianoState.activeVoices.get(
                                voiceId
                            );

                        if (
                            voice &&
                            !voice.released
                        ) {

                            voice.sostenutoHeld =
                                true;

                            pianoState
                                .heldSostenutoNotes
                                .add(midi);
                        }
                    }
                );
            }
        );
    },


    releaseSustain() {

        pianoState.activeVoices.forEach(
            voice => {

                if (
                    voice.sustainHeld &&
                    !voice.sostenutoHeld
                ) {

                    voice.sustainHeld =
                        false;

                    VoiceEngine.release(
                        voice
                    );
                }
            }
        );
    },


    releaseSostenuto() {

        pianoState.activeVoices.forEach(
            voice => {

                if (
                    voice.sostenutoHeld
                ) {

                    voice.sostenutoHeld =
                        false;

                    if (
                        !pianoState.sustain
                    ) {

                        VoiceEngine.release(
                            voice
                        );
                    }
                }
            }
        );

        pianoState.heldSostenutoNotes.clear();
    }
};


/* ================================================================
   15 — OCTAVE ENGINE
================================================================ */

const OctaveEngine = {

    shift(direction) {

        pianoState.keyboardOctaveOffset =
            clamp(
                pianoState.keyboardOctaveOffset +
                Number(direction),
                FOBAS_PIANO_CONFIG.keyboardOctaveMin,
                FOBAS_PIANO_CONFIG.keyboardOctaveMax
            );

        updateOctaveUI();

        StorageEngine.saveSettings();
    },


    reset() {

        pianoState.keyboardOctaveOffset =
            0;

        updateOctaveUI();
    }
};


/* ================================================================
   16 — MUSICAL DISPLAY
================================================================ */

function updateMusicalDisplay(
    midi,
    velocity
) {

    const note =
        midiToNoteName(midi);

    const octave =
        midiToOctave(midi);

    if (
        pianoDOM.currentNote
    ) {

        pianoDOM.currentNote.textContent =
            `${NOTE_NAMES_FR[note] || note}`;
    }

    if (
        pianoDOM.currentOctave
    ) {

        pianoDOM.currentOctave.textContent =
            String(octave);
    }

    pianoState.lastNote = {
        midi,
        note,
        octave,
        velocity,
        time: performance.now()
    };

    NoteEngineDisplay.moveMarker(
        midi
    );
}


const NoteEngineDisplay = {

    moveMarker(midi) {

        if (
            !pianoDOM.noteMarker
        ) {
            return;
        }

        pianoDOM.noteMarker.textContent =
            "♪";

        pianoDOM.noteMarker.classList.add(
            "active"
        );

        pianoDOM.noteMarker.dataset.midi =
            String(midi);

        clearTimeout(
            this.timer
        );

        this.timer =
            setTimeout(
                () => {

                    pianoDOM.noteMarker.classList.remove(
                        "active"
                    );

                },
                FOBAS_PIANO_CONFIG.noteMarkerDuration
            );
    }
};


/* ================================================================
   17 — SCORE / NOTATION ENGINE
================================================================ */

const MusicNotationEngine = {

    svg: null,
    cursor: null,
    noteLayer: null,


    initialize() {

        if (!pianoDOM.staff) {
            return;
        }

        this.render();
    },


    render() {

        pianoDOM.staff
            .querySelector(
                ".fobas-score-svg"
            )
            ?.remove();

        const svg =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg"
            );

        svg.classList.add(
            "fobas-score-svg"
        );

        svg.setAttribute(
            "viewBox",
            "0 0 1200 300"
        );

        svg.setAttribute(
            "preserveAspectRatio",
            "none"
        );

        this.svg = svg;

        this.drawStaff(
            svg,
            75
        );

        this.drawStaff(
            svg,
            195
        );

        this.drawClefs(
            svg
        );

        this.cursor =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );

        this.cursor.setAttribute(
            "x1",
            "110"
        );

        this.cursor.setAttribute(
            "x2",
            "110"
        );

        this.cursor.setAttribute(
            "y1",
            "38"
        );

        this.cursor.setAttribute(
            "y2",
            "235"
        );

        this.cursor.setAttribute(
            "stroke",
            "currentColor"
        );

        this.cursor.setAttribute(
            "stroke-width",
            "2"
        );

        this.cursor.setAttribute(
            "opacity",
            "0.8"
        );

        svg.appendChild(
            this.cursor
        );

        this.noteLayer =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "g"
            );

        svg.appendChild(
            this.noteLayer
        );

        pianoDOM.staff.appendChild(
            svg
        );
    },


    drawStaff(
        svg,
        centerY
    ) {

        for (
            let i = -2;
            i <= 2;
            i++
        ) {

            const line =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "line"
                );

            const y =
                centerY +
                i * 12;

            line.setAttribute(
                "x1",
                "80"
            );

            line.setAttribute(
                "x2",
                "1140"
            );

            line.setAttribute(
                "y1",
                String(y)
            );

            line.setAttribute(
                "y2",
                String(y)
            );

            line.setAttribute(
                "stroke",
                "currentColor"
            );

            line.setAttribute(
                "opacity",
                "0.55"
            );

            svg.appendChild(
                line
            );
        }
    },


    drawClefs(svg) {

        const treble =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );

        treble.textContent =
            "𝄞";

        treble.setAttribute(
            "x",
            "45"
        );

        treble.setAttribute(
            "y",
            "105"
        );

        treble.setAttribute(
            "font-size",
            "72"
        );

        svg.appendChild(
            treble
        );


        const bass =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );

        bass.textContent =
            "𝄢";

        bass.setAttribute(
            "x",
            "45"
        );

        bass.setAttribute(
            "y",
            "225"
        );

        bass.setAttribute(
            "font-size",
            "62"
        );

        svg.appendChild(
            bass
        );
    },


    addPlayedNote(
        midi
    ) {

        if (
            !this.noteLayer
        ) {
            return;
        }

        const index =
            pianoState.currentScore.length;

        const x =
            130 +
            (
                index % 48
            ) * 20;

        const upper =
            midi >= 60;

        const centerY =
            upper
                ? 75
                : 195;

        const step =
            upper
                ? this.trebleStep(midi)
                : this.bassStep(midi);

        const y =
            centerY -
            step * 6;

        const note =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "ellipse"
            );

        note.setAttribute(
            "cx",
            String(x)
        );

        note.setAttribute(
            "cy",
            String(y)
        );

        note.setAttribute(
            "rx",
            "7"
        );

        note.setAttribute(
            "ry",
            "5"
        );

        note.setAttribute(
            "transform",
            `rotate(-15 ${x} ${y})`
        );

        note.setAttribute(
            "fill",
            "currentColor"
        );

        this.noteLayer.appendChild(
            note
        );

        if (
            pianoState.currentScore.length >
            48
        ) {

            const children =
                this.noteLayer.children;

            if (children.length > 48) {
                this.noteLayer.removeChild(
                    children[0]
                );
            }
        }
    },


    trebleStep(midi) {

        const map = {
            60: -6,
            62: -5,
            64: -4,
            65: -3,
            67: -2,
            69: -1,
            71: 0,
            72: 1,
            74: 2,
            76: 3,
            77: 4,
            79: 5,
            81: 6
        };

        return map[midi] ??
            Math.round(
                (midi - 71) /
                2
            );
    },


    bassStep(midi) {

        const map = {
            36: 6,
            38: 5,
            40: 4,
            41: 3,
            43: 2,
            45: 1,
            47: 0,
            48: -1,
            50: -2,
            52: -3,
            53: -4,
            55: -5,
            57: -6
        };

        return map[midi] ??
            Math.round(
                (47 - midi) /
                2
            );
    },


    moveCursor(index) {

        if (!this.cursor) {
            return;
        }

        const x =
            110 +
            (
                index % 50
            ) * 20;

        this.cursor.setAttribute(
            "x1",
            String(x)
        );

        this.cursor.setAttribute(
            "x2",
            String(x)
        );
    }
};


/* ================================================================
   18 — SCORE SYNC ENGINE
================================================================ */

const ScoreSyncEngine = {

    register(
        midi,
        duration = 1
    ) {

        const event = {

            midi,
            duration,
            time: performance.now()
        };

        pianoState.currentScore.push(
            event
        );

        MusicNotationEngine.addPlayedNote(
            midi
        );

        MusicNotationEngine.moveCursor(
            pianoState.currentScore.length
        );
    },


    load(score) {

        pianoState.currentScore =
            Array.isArray(score)
                ? score.slice()
                : [];

        pianoState.scoreCursor = 0;

        MusicNotationEngine.render();

        pianoState.currentScore.forEach(
            note =>
                MusicNotationEngine.addPlayedNote(
                    note.midi
                )
        );
    }
};


/* ================================================================
   19 — TEMPO ENGINE
================================================================ */

const TempoEngine = {

    setBPM(value) {

        pianoState.bpm =
            clamp(
                Number(value),
                FOBAS_PIANO_CONFIG.minBpm,
                FOBAS_PIANO_CONFIG.maxBpm
            );

        if (
            pianoDOM.bpm
        ) {
            pianoDOM.bpm.value =
                String(pianoState.bpm);
        }

        if (
            pianoDOM.bpmOutput
        ) {
            pianoDOM.bpmOutput.textContent =
                String(pianoState.bpm);
        }

        if (
            pianoDOM.bpmValue
        ) {
            pianoDOM.bpmValue.textContent =
                String(pianoState.bpm);
        }

        if (
            pianoState.metronome
        ) {
            MetronomeEngine.restart();
        }

        StorageEngine.saveSettings();
    }
};


/* ================================================================
   20 — METRONOME ENGINE
================================================================ */

const MetronomeEngine = {

    start() {

        if (
            pianoState.metronome
        ) {
            return;
        }

        pianoState.metronome =
            true;

        pianoState.metronomeBeat =
            0;

        pianoState.metronomeNextTime =
            getCurrentTime() + 0.05;

        this.scheduler();

        updateMetronomeUI();
    },


    stop() {

        pianoState.metronome =
            false;

        if (
            pianoState.metronomeTimer
        ) {

            clearInterval(
                pianoState.metronomeTimer
            );

            pianoState.metronomeTimer =
                null;
        }

        updateMetronomeUI();
    },


    toggle() {

        if (
            pianoState.metronome
        ) {
            this.stop();
        } else {
            this.start();
        }
    },


    restart() {

        if (
            !pianoState.metronome
        ) {
            return;
        }

        this.stop();
        this.start();
    },


    scheduler() {

        if (
            pianoState.metronomeTimer
        ) {
            return;
        }

        pianoState.metronomeTimer =
            setInterval(
                () => {

                    if (
                        !pianoState.metronome
                    ) {
                        return;
                    }

                    const interval =
                        60 /
                        pianoState.bpm;

                    while (
                        pianoState.metronomeNextTime <
                        getCurrentTime() +
                        FOBAS_PIANO_CONFIG.metronomeLookAhead
                    ) {

                        this.scheduleBeat(
                            pianoState.metronomeNextTime
                        );

                        pianoState.metronomeNextTime +=
                            interval /
                            pianoState.subdivision;
                    }

                },
                FOBAS_PIANO_CONFIG
                    .metronomeScheduleInterval
            );
    },


    scheduleBeat(time) {

        const ctx =
            pianoState.audioContext;

        if (!ctx) {
            return;
        }

        const beat =
            pianoState.metronomeBeat;

        const accent =
            beat === 0;

        const osc =
            ctx.createOscillator();

        const gain =
            ctx.createGain();

        osc.frequency.value =
            accent
                ? 1250
                : 850;

        gain.gain.setValueAtTime(
            accent ? 0.13 : 0.075,
            time
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            time + 0.06
        );

        osc.connect(gain);
        gain.connect(
            pianoState.masterGain
        );

        osc.start(time);
        osc.stop(time + 0.07);

        pianoState.metronomeBeat =
            (
                beat + 1
            ) %
            pianoState.timeSignatureNumerator;

        setTimeout(
            () =>
                this.flashBeat(
                    beat
                ),
            Math.max(
                0,
                (
                    time -
                    getCurrentTime()
                ) * 1000
            )
        );
    },


    flashBeat(beat) {

        const panel =
            document.getElementById(
                "fobasMetronomeBeat"
            );

        if (!panel) {
            return;
        }

        panel.textContent =
            String(beat + 1);

        panel.classList.add(
            "active"
        );

        setTimeout(
            () =>
                panel.classList.remove(
                    "active"
                ),
            100
        );
    }
};


/* ================================================================
   21 — RECORDING ENGINE
================================================================ */

const RecordingEngine = {

    start() {

        if (
            pianoState.recording
        ) {
            return;
        }

        pianoState.recording =
            true;

        pianoState.recordingStartedAt =
            performance.now();

        pianoState.recordingEvents = [];

        updateRecordingUI();

        updateStatus(
            "Enregistrement en cours..."
        );
    },


    stop() {

        if (
            !pianoState.recording
        ) {
            return null;
        }

        pianoState.recording =
            false;

        const recording = {

            id:
                Date.now(),

            createdAt:
                new Date().toISOString(),

            bpm:
                pianoState.bpm,

            timeSignature: [
                pianoState.timeSignatureNumerator,
                pianoState.timeSignatureDenominator
            ],

            events:
                pianoState.recordingEvents.slice()
        };

        pianoState.recordings.push(
            recording
        );

        StorageEngine.saveRecordings();

        updateRecordingUI();

        updateStatus(
            "Enregistrement sauvegardé."
        );

        return recording;
    },


    captureNoteOn(
        midi,
        velocity,
        source
    ) {

        if (
            !pianoState.recording
        ) {
            return;
        }

        pianoState.recordingEvents.push({

            type: "noteOn",

            midi,

            velocity,

            source,

            time:
                performance.now() -
                pianoState.recordingStartedAt
        });
    },


    captureNoteOff(
        midi,
        source
    ) {

        if (
            !pianoState.recording
        ) {
            return;
        }

        pianoState.recordingEvents.push({

            type: "noteOff",

            midi,

            source,

            time:
                performance.now() -
                pianoState.recordingStartedAt
        });
    },


    capturePedal(
        pedal,
        value
    ) {

        if (
            !pianoState.recording
        ) {
            return;
        }

        pianoState.recordingEvents.push({

            type: "pedal",

            pedal,

            value,

            time:
                performance.now() -
                pianoState.recordingStartedAt
        });
    }
};


/* ================================================================
   22 — PLAYBACK ENGINE
================================================================ */

const PlaybackEngine = {

    play(
        recording
    ) {

        if (
            !recording ||
            !Array.isArray(
                recording.events
            )
        ) {
            return;
        }

        this.stop();

        pianoState.playback =
            true;

        pianoState.playbackStartedAt =
            performance.now();

        recording.events.forEach(
            event => {

                const timer =
                    setTimeout(
                        () => {

                            if (
                                event.type ===
                                "noteOn"
                            ) {

                                NoteEngine.noteOn(
                                    event.midi,
                                    event.velocity,
                                    "playback",
                                    event.midi
                                );
                            }

                            if (
                                event.type ===
                                "noteOff"
                            ) {

                                NoteEngine.noteOff(
                                    event.midi,
                                    "playback",
                                    event.midi
                                );
                            }

                            if (
                                event.type ===
                                "pedal"
                            ) {

                                PedalEngine.set(
                                    event.pedal,
                                    event.value
                                );
                            }

                        },
                        Math.max(
                            0,
                            Number(event.time) || 0
                        )
                    );

                pianoState.playbackTimers.push(
                    timer
                );
            }
        );

        const endTime =
            recording.events.length
                ? Math.max(
                    ...recording.events.map(
                        e =>
                            Number(e.time) || 0
                    )
                )
                : 0;

        pianoState.playbackTimers.push(
            setTimeout(
                () => this.stop(),
                endTime + 500
            )
        );

        updatePlaybackUI();
    },


    stop() {

        pianoState.playbackTimers.forEach(
            timer =>
                clearTimeout(timer)
        );

        pianoState.playbackTimers = [];

        pianoState.playback =
            false;

        releaseAllNotes();

        updatePlaybackUI();
    }
};


/* ================================================================
   23 — LEARNING ENGINE
================================================================ */

const LearningEngine = {

    levels: [

        {
            id: "beginner",
            name: "Initiation",
            description:
                "Découverte du clavier, notes et rythme."
        },

        {
            id: "elementary",
            name: "Débutant",
            description:
                "Gammes simples et coordination."
        },

        {
            id: "intermediate",
            name: "Intermédiaire",
            description:
                "Accords, arpèges et lecture."
        },

        {
            id: "advanced",
            name: "Avancé",
            description:
                "Indépendance et précision."
        },

        {
            id: "expert",
            name: "Expert",
            description:
                "Vitesse, précision et interprétation."
        }
    ],


    enable() {

        pianoState.learningMode =
            true;

        updateLearningUI();

        updateStatus(
            "Mode apprentissage activé."
        );
    },


    disable() {

        pianoState.learningMode =
            false;

        updateLearningUI();
    }
};


/* ================================================================
   24 — EXERCISE ENGINE
================================================================ */

const ExerciseEngine = {

    exercises: [

        {
            id: "scale-c-major",

            name: "Gamme de Do majeur",

            category: "Gammes",

            bpm: 80,

            notes: [
                60,
                62,
                64,
                65,
                67,
                69,
                71,
                72,
                71,
                69,
                67,
                65,
                64,
                62,
                60
            ]
        },


        {
            id: "c-major-arpeggio",

            name: "Arpège de Do majeur",

            category: "Arpèges",

            bpm: 70,

            notes: [
                60,
                64,
                67,
                72,
                67,
                64,
                60
            ]
        },


        {
            id: "chromatic",

            name: "Exercice chromatique",

            category: "Technique",

            bpm: 90,

            notes: [
                60,
                61,
                62,
                63,
                64,
                65,
                66,
                67,
                68,
                69,
                70,
                71,
                72
            ]
        },


        {
            id: "fifths",

            name: "Cycle de quintes — étude",

            category: "Accords",

            bpm: 65,

            notes: [
                60,
                67,
                62,
                69,
                64,
                71,
                66,
                73
            ]
        },


        {
            id: "octave-control",

            name: "Contrôle des octaves",

            category: "Technique",

            bpm: 70,

            notes: [
                60,
                72,
                60,
                72,
                62,
                74,
                62,
                74,
                64,
                76,
                64,
                76
            ]
        }
    ],


    start(
        exerciseId
    ) {

        const exercise =
            this.exercises.find(
                item =>
                    item.id === exerciseId
            );

        if (!exercise) {
            return;
        }

        pianoState.currentExercise =
            exercise;

        pianoState.exerciseIndex =
            0;

        pianoState.practiceStats = {

            correct: 0,
            wrong: 0,
            missed: 0,
            total: exercise.notes.length,
            timingErrors: [],
            startTime: performance.now(),
            endTime: 0
        };

        TempoEngine.setBPM(
            exercise.bpm
        );

        updateExerciseUI();

        updateStatus(
            `Exercice : ${exercise.name}`
        );
    },


    stop() {

        pianoState.currentExercise =
            null;

        pianoState.exerciseIndex =
            0;

        updateExerciseUI();
    },


    expectedNote() {

        const exercise =
            pianoState.currentExercise;

        if (!exercise) {
            return null;
        }

        return exercise.notes[
            pianoState.exerciseIndex
        ];
    },


    registerNote(
        midi
    ) {

        const expected =
            this.expectedNote();

        if (
            expected === null ||
            expected === undefined
        ) {
            return;
        }

        if (
            Number(midi) ===
            Number(expected)
        ) {

            pianoState.practiceStats.correct++;

            pianoState.exerciseIndex++;

            if (
                pianoState.exerciseIndex >=
                pianoState.currentExercise.notes.length
            ) {

                pianoState.practiceStats.endTime =
                    performance.now();

                updateStatus(
                    "Exercice terminé — excellent travail."
                );

                PracticeScoringEngine.finishExercise();

            } else {

                updateExerciseUI();
            }

        } else {

            pianoState.practiceStats.wrong++;

            updateStatus(
                `Note attendue : ${midiToLabel(expected)}`
            );
        }
    }
};


/* ================================================================
   25 — PRACTICE SCORING ENGINE
================================================================ */

const PracticeScoringEngine = {

    registerPlayedNote(
        midi,
        time
    ) {

        if (
            pianoState.currentExercise
        ) {

            ExerciseEngine.registerNote(
                midi
            );
        }

        ScoreSyncEngine.register(
            midi
        );
    },


    finishExercise() {

        const stats =
            pianoState.practiceStats;

        const total =
            stats.total || 1;

        const accuracy =
            (
                stats.correct /
                total
            ) * 100;

        updatePracticeScore(
            accuracy
        );

        StorageEngine.saveProgress(
            pianoState.currentExercise?.id,
            {
                accuracy,
                correct: stats.correct,
                wrong: stats.wrong,
                date:
                    new Date().toISOString()
            }
        );
    }
};


/* ================================================================
   26 — SONG LIBRARY ENGINE
================================================================ */

const SongLibraryEngine = {

    songs: [

        {
            id: "fobas-scale",

            title: "Étude FOBAS — Do majeur",

            composer: "FOBAS Original Study",

            type: "exercise",

            bpm: 80,

            notes: [
                60,
                62,
                64,
                65,
                67,
                69,
                71,
                72,
                71,
                69,
                67,
                65,
                64,
                62,
                60
            ]
        },


        {
            id: "ode-to-joy-study",

            title: "Thème classique — étude",

            composer: "Domaine public",

            type: "public-domain",

            bpm: 90,

            notes: [
                64,
                64,
                65,
                67,
                67,
                65,
                64,
                62,
                60,
                60,
                62,
                64,
                64,
                62,
                62
            ]
        },


        {
            id: "fobas-chord-study",

            title: "Étude d'accords FOBAS",

            composer: "FOBAS Original Study",

            type: "exercise",

            bpm: 72,

            notes: [
                60,
                64,
                67,
                60,
                65,
                69,
                62,
                67,
                71,
                64,
                67,
                72
            ]
        }
    ],


    getAll() {

        return this.songs.slice();
    },


    get(
        id
    ) {

        return this.songs.find(
            song =>
                song.id === id
        );
    },


    load(
        id
    ) {

        const song =
            this.get(id);

        if (!song) {
            return;
        }

        pianoState.currentSong =
            song;

        ScoreSyncEngine.load(
            song.notes.map(
                midi => ({
                    midi,
                    duration: 1
                })
            )
        );

        TempoEngine.setBPM(
            song.bpm
        );

        updateStatus(
            `Morceau chargé : ${song.title}`
        );

        updateSongUI();
    }
};


/* ================================================================
   27 — MIDI ENGINE
================================================================ */

const MIDIEngine = {

    async initialize() {

        if (
            !navigator.requestMIDIAccess
        ) {

            updateMIDIUI(
                "MIDI non disponible"
            );

            return false;
        }

        try {

            pianoState.midiAccess =
                await navigator.requestMIDIAccess({
                    sysex: false
                });

            this.refresh();

            pianoState.midiAccess.onstatechange =
                () => this.refresh();

            updateMIDIUI(
                "MIDI connecté"
            );

            return true;

        } catch (_) {

            updateMIDIUI(
                "Accès MIDI refusé"
            );

            return false;
        }
    },


    refresh() {

        if (
            !pianoState.midiAccess
        ) {
            return;
        }

        pianoState.midiInputs =
            Array.from(
                pianoState.midiAccess.inputs.values()
            );

        pianoState.midiOutputs =
            Array.from(
                pianoState.midiAccess.outputs.values()
            );

        pianoState.midiInputs.forEach(
            input => {

                input.onmidimessage =
                    event =>
                        this.handleMessage(
                            event
                        );
            }
        );

        updateMIDISelects();
    },


    handleMessage(
        event
    ) {

        const data =
            event.data;

        if (
            !data ||
            data.length < 2
        ) {
            return;
        }

        const status =
            data[0];

        const command =
            status & 0xf0;

        const channel =
            status & 0x0f;

        const data1 =
            data[1];

        const data2 =
            data[2] || 0;

        if (
            command === 0x90 &&
            data2 > 0
        ) {

            NoteEngine.noteOn(
                data1,
                data2,
                "midi",
                channel
            );

            pianoState.activeMidiNotes.set(
                `${channel}:${data1}`,
                data1
            );

            return;
        }


        if (
            command === 0x80 ||
            (
                command === 0x90 &&
                data2 === 0
            )
        ) {

            NoteEngine.noteOff(
                data1,
                "midi",
                channel
            );

            pianoState.activeMidiNotes.delete(
                `${channel}:${data1}`
            );

            return;
        }


        if (
            command === 0xb0
        ) {

            if (
                data1 ===
                FOBAS_PIANO_CONFIG.sustainCC
            ) {

                PedalEngine.set(
                    "sustain",
                    data2 >= 64
                );
            }

            if (
                data1 ===
                FOBAS_PIANO_CONFIG.sostenutoCC
            ) {

                PedalEngine.set(
                    "sostenuto",
                    data2 >= 64
                );
            }

            if (
                data1 ===
                FOBAS_PIANO_CONFIG.softCC
            ) {

                PedalEngine.set(
                    "soft",
                    data2 >= 64
                );
            }
        }


        if (
            command === 0xe0
        ) {

            const bend =
                data1 |
                (
                    data2 << 7
                );

            const normalized =
                (
                    bend -
                    FOBAS_PIANO_CONFIG.pitchBendCenter
                ) /
                FOBAS_PIANO_CONFIG.pitchBendCenter;

            pianoState.pitchBend =
                clamp(
                    normalized,
                    -1,
                    1
                );
        }
    },


    sendNoteOn(
        midi,
        velocity = 100
    ) {

        if (
            !pianoState.selectedMidiOutput
        ) {
            return;
        }

        pianoState.selectedMidiOutput.send([
            0x90,
            midi,
            velocity
        ]);
    },


    sendNoteOff(
        midi
    ) {

        if (
            !pianoState.selectedMidiOutput
        ) {
            return;
        }

        pianoState.selectedMidiOutput.send([
            0x80,
            midi,
            0
        ]);
    },


    sendPedal(
        cc,
        value
    ) {

        if (
            !pianoState.selectedMidiOutput
        ) {
            return;
        }

        pianoState.selectedMidiOutput.send([
            0xb0,
            cc,
            value ? 127 : 0
        ]);
    }
};


/* ================================================================
   28 — STORAGE ENGINE
================================================================ */

const StorageEngine = {

    settingsKey:
        FOBAS_PIANO_CONFIG.storagePrefix +
        "settings",


    recordingsKey:
        FOBAS_PIANO_CONFIG.storagePrefix +
        "recordings",


    progressKey:
        FOBAS_PIANO_CONFIG.storagePrefix +
        "progress",


    saveSettings() {

        const data = {

            volume:
                pianoState.volume,

            bpm:
                pianoState.bpm,

            waveform:
                pianoState.waveform,

            octave:
                pianoState.keyboardOctaveOffset,

            timeSignatureNumerator:
                pianoState.timeSignatureNumerator,

            timeSignatureDenominator:
                pianoState.timeSignatureDenominator,

            subdivision:
                pianoState.subdivision
        };

        this.safeSet(
            this.settingsKey,
            data
        );
    },


    loadSettings() {

        const data =
            this.safeGet(
                this.settingsKey
            );

        if (!data) {
            return;
        }

        if (
            Number.isFinite(
                Number(data.volume)
            )
        ) {

            pianoState.volume =
                clamp(
                    Number(data.volume),
                    0,
                    1
                );
        }

        if (
            Number.isFinite(
                Number(data.bpm)
            )
        ) {

            pianoState.bpm =
                clamp(
                    Number(data.bpm),
                    FOBAS_PIANO_CONFIG.minBpm,
                    FOBAS_PIANO_CONFIG.maxBpm
                );
        }

        if (
            Number.isFinite(
                Number(data.octave)
            )
        ) {

            pianoState.keyboardOctaveOffset =
                clamp(
                    Number(data.octave),
                    FOBAS_PIANO_CONFIG.keyboardOctaveMin,
                    FOBAS_PIANO_CONFIG.keyboardOctaveMax
                );
        }

        if (data.waveform) {
            pianoState.waveform =
                data.waveform;
        }

        if (
            Number.isFinite(
                Number(data.timeSignatureNumerator)
            )
        ) {

            pianoState.timeSignatureNumerator =
                Number(
                    data.timeSignatureNumerator
                );
        }

        if (
            Number.isFinite(
                Number(data.timeSignatureDenominator)
            )
        ) {

            pianoState.timeSignatureDenominator =
                Number(
                    data.timeSignatureDenominator
                );
        }

        if (
            Number.isFinite(
                Number(data.subdivision)
            )
        ) {

            pianoState.subdivision =
                Number(
                    data.subdivision
                );
        }
    },


    saveRecordings() {

        this.safeSet(
            this.recordingsKey,
            pianoState.recordings
        );
    },


    loadRecordings() {

        const data =
            this.safeGet(
                this.recordingsKey
            );

        if (
            Array.isArray(data)
        ) {

            pianoState.recordings =
                data;
        }
    },


    saveProgress(
        exerciseId,
        result
    ) {

        if (!exerciseId) {
            return;
        }

        const progress =
            this.safeGet(
                this.progressKey
            ) || {};

        progress[exerciseId] =
            result;

        this.safeSet(
            this.progressKey,
            progress
        );
    },


    safeSet(
        key,
        value
    ) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

        } catch (_) {}
    },


    safeGet(
        key
    ) {

        try {

            const value =
                localStorage.getItem(
                    key
                );

            return value
                ? JSON.parse(value)
                : null;

        } catch (_) {

            return null;
        }
    }
};


/* ================================================================
   29 — RELEASE ALL NOTES
================================================================ */

function releaseAllNotes() {

    pianoState.activeVoices.forEach(
        voice =>
            VoiceEngine.release(
                voice,
                true
            )
    );

    pianoState.activePointerNotes.clear();
    pianoState.activeComputerNotes.clear();
    pianoState.activeMidiNotes.clear();
    pianoState.pressedComputerKeys.clear();

    pianoState.heldSostenutoNotes.clear();
}


/* ================================================================
   30 — VOLUME
================================================================ */

function setVolume(
    value
) {

    pianoState.volume =
        clamp(
            Number(value),
            0,
            1
        );

    if (
        pianoState.masterGain
    ) {

        pianoState.masterGain.gain.setTargetAtTime(
            pianoState.volume,
            getCurrentTime(),
            0.025
        );
    }

    if (
        pianoDOM.volume
    ) {

        pianoDOM.volume.value =
            String(pianoState.volume);
    }

    if (
        pianoDOM.volumeValue
    ) {

        pianoDOM.volumeValue.textContent =
            `${Math.round(
                pianoState.volume * 100
            )}%`;
    }

    StorageEngine.saveSettings();
}


/* ================================================================
   31 — UI ENGINE
================================================================ */

function updateAudioButton() {

    if (
        !pianoDOM.startAudioBtn
    ) {
        return;
    }

    if (
        pianoState.audioReady
    ) {

        pianoDOM.startAudioBtn.textContent =
            "Piano actif";

        pianoDOM.startAudioBtn.classList.add(
            "active"
        );

    } else {

        pianoDOM.startAudioBtn.textContent =
            "Activer le piano";

        pianoDOM.startAudioBtn.classList.remove(
            "active"
        );
    }
}


function updatePedalUI() {

    const map = {

        sustain:
            "fobasPedalSustain",

        sostenuto:
            "fobasPedalSostenuto",

        soft:
            "fobasPedalSoft"
    };

    Object.keys(map).forEach(
        pedal => {

            const element =
                document.getElementById(
                    map[pedal]
                );

            if (!element) {
                return;
            }

            const active =
                pianoState[pedal];

            element.classList.toggle(
                "active",
                active
            );

            element.setAttribute(
                "aria-pressed",
                active
                    ? "true"
                    : "false"
            );
        }
    );


    if (
        pianoDOM.sustainBtn
    ) {

        const span =
            pianoDOM.sustainBtn.querySelector(
                "span"
            );

        if (span) {
            span.textContent =
                pianoState.sustain
                    ? "ON"
                    : "OFF";
        }

        pianoDOM.sustainBtn.setAttribute(
            "aria-pressed",
            pianoState.sustain
                ? "true"
                : "false"
        );
    }
}


function updateMetronomeUI() {

    if (
        pianoDOM.metronomeBtn
    ) {

        const span =
            pianoDOM.metronomeBtn.querySelector(
                "span"
            );

        if (span) {
            span.textContent =
                pianoState.metronome
                    ? "ON"
                    : "OFF";
        }

        pianoDOM.metronomeBtn.setAttribute(
            "aria-pressed",
            pianoState.metronome
                ? "true"
                : "false"
        );
    }
}


function updateOctaveUI() {

    const element =
        document.getElementById(
            "fobasOctaveValue"
        );

    if (element) {

        const value =
            pianoState.keyboardOctaveOffset;

        element.textContent =
            value === 0
                ? "0"
                : value > 0
                    ? `+${value}`
                    : String(value);
    }
}


function updateLearningUI() {

    const element =
        document.getElementById(
            "fobasLearningStatus"
        );

    if (element) {

        element.textContent =
            pianoState.learningMode
                ? "APPRENTISSAGE ACTIF"
                : "MODE LIBRE";
    }
}


function updateExerciseUI() {

    const exercise =
        pianoState.currentExercise;

    const title =
        document.getElementById(
            "fobasExerciseTitle"
        );

    const progress =
        document.getElementById(
            "fobasExerciseProgress"
        );

    const next =
        document.getElementById(
            "fobasExerciseNext"
        );

    if (!exercise) {

        if (title) {
            title.textContent =
                "Aucun exercice";
        }

        if (progress) {
            progress.textContent =
                "—";
        }

        if (next) {
            next.textContent =
                "—";
        }

        return;
    }

    if (title) {
        title.textContent =
            exercise.name;
    }

    if (progress) {

        progress.textContent =
            `${pianoState.exerciseIndex} / ${exercise.notes.length}`;
    }

    if (next) {

        const expected =
            ExerciseEngine.expectedNote();

        next.textContent =
            expected === null
                ? "✓"
                : midiToLabel(expected);
    }
}


function updatePracticeScore(
    accuracy
) {

    const element =
        document.getElementById(
            "fobasPracticeScore"
        );

    if (element) {

        element.textContent =
            `${Math.round(
                accuracy
            )}%`;
    }
}


function updateRecordingUI() {

    const button =
        document.getElementById(
            "fobasRecordBtn"
        );

    if (!button) {
        return;
    }

    button.textContent =
        pianoState.recording
            ? "■ Arrêter"
            : "● Enregistrer";

    button.classList.toggle(
        "active",
        pianoState.recording
    );
}


function updatePlaybackUI() {

    const button =
        document.getElementById(
            "fobasPlaybackBtn"
        );

    if (!button) {
        return;
    }

    button.textContent =
        pianoState.playback
            ? "■ Stop"
            : "▶ Lecture";
}


function updateSongUI() {

    const element =
        document.getElementById(
            "fobasCurrentSong"
        );

    if (element) {

        element.textContent =
            pianoState.currentSong
                ? pianoState.currentSong.title
                : "Aucun morceau";
    }
}


function updateMIDIUI(
    text
) {

    const element =
        document.getElementById(
            "fobasMidiStatus"
        );

    if (element) {
        element.textContent =
            text;
    }
}


function updateStatus(
    text
) {

    if (
        pianoDOM.statusText
    ) {

        pianoDOM.statusText.textContent =
            text;
    }
}


/* ================================================================
   32 — PROFESSIONAL CONTROL PANEL
================================================================ */

const PianoStudioController = {

    initialize() {

        this.injectAdvancedStyles();
        this.createProfessionalControls();
        this.bindControls();
        this.populateLibraries();
    },


    injectAdvancedStyles() {

        if (
            document.getElementById(
                "fobasPianoProRuntimeStyles"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "fobasPianoProRuntimeStyles";

        style.textContent = `

            .fobas-piano-pro-console {
                display:grid;
                grid-template-columns:
                    repeat(auto-fit,minmax(220px,1fr));
                gap:12px;
                margin:14px 0;
            }

            .fobas-piano-pro-module {
                padding:14px;
                border:1px solid rgba(255,255,255,.10);
                border-radius:14px;
                background:rgba(255,255,255,.035);
            }

            .fobas-piano-pro-module h3 {
                margin:0 0 10px;
                font-size:12px;
                letter-spacing:.08em;
                text-transform:uppercase;
            }

            .fobas-piano-pro-row {
                display:flex;
                flex-wrap:wrap;
                gap:7px;
                align-items:center;
            }

            .fobas-piano-pro-row button,
            .fobas-piano-pro-row select {
                min-height:36px;
                padding:7px 10px;
                border-radius:9px;
                border:1px solid rgba(255,255,255,.12);
                background:rgba(0,0,0,.22);
                color:inherit;
            }

            .fobas-piano-pro-row button.active {
                outline:1px solid rgba(255,210,100,.75);
                box-shadow:0 0 15px rgba(255,190,80,.15);
            }

            .fobas-piano-pedals {
                display:grid;
                grid-template-columns:
                    repeat(3,1fr);
                gap:8px;
            }

            .fobas-piano-pedal {
                min-height:48px;
                border-radius:12px;
                border:1px solid rgba(255,255,255,.12);
                background:rgba(255,255,255,.04);
                color:inherit;
            }

            .fobas-piano-pedal.active {
                transform:translateY(2px);
                background:rgba(218,171,70,.20);
            }

            .fobas-piano-key-label {
                pointer-events:none;
                opacity:.45;
                font-size:8px;
            }

            .piano-black-key .fobas-piano-key-label {
                color:#fff;
                opacity:.55;
            }

            #fobasMetronomeBeat {
                display:inline-flex;
                min-width:28px;
                min-height:28px;
                align-items:center;
                justify-content:center;
                border-radius:50%;
                border:1px solid rgba(255,255,255,.12);
            }

            #fobasMetronomeBeat.active {
                transform:scale(1.15);
            }

            @media(max-width:600px) {
                .fobas-piano-pro-console {
                    grid-template-columns:1fr;
                }

                .fobas-piano-pedals {
                    grid-template-columns:1fr;
                }
            }
        `;

        document.head.appendChild(
            style
        );
    },


    createProfessionalControls() {

        if (
            document.getElementById(
                "fobasPianoProConsole"
            )
        ) {
            return;
        }

        const consolePanel =
            document.createElement("section");

        consolePanel.id =
            "fobasPianoProConsole";

        consolePanel.className =
            "fobas-piano-pro-console";

        consolePanel.setAttribute(
            "aria-label",
            "FOBAS Piano Professional Studio"
        );


        /* OCTAVE */

        const octave =
            this.module(
                "Clavier",
                `
                    <div class="fobas-piano-pro-row">
                        <button id="fobasOctaveDown" type="button">
                            − Octave
                        </button>

                        <strong>
                            OCTAVE
                            <span id="fobasOctaveValue">0</span>
                        </strong>

                        <button id="fobasOctaveUp" type="button">
                            + Octave
                        </button>

                        <button id="fobasOctaveReset" type="button">
                            Reset
                        </button>
                    </div>
                `
            );


        /* PEDALS */

        const pedals =
            this.module(
                "Pedals",
                `
                    <div class="fobas-piano-pedals">

                        <button
                            id="fobasPedalSustain"
                            class="fobas-piano-pedal"
                            type="button"
                            aria-pressed="false">
                            Sustain
                        </button>

                        <button
                            id="fobasPedalSostenuto"
                            class="fobas-piano-pedal"
                            type="button"
                            aria-pressed="false">
                            Sostenuto
                        </button>

                        <button
                            id="fobasPedalSoft"
                            class="fobas-piano-pedal"
                            type="button"
                            aria-pressed="false">
                            Soft / Una Corda
                        </button>

                    </div>
                `
            );


        /* METRONOME */

        const metronome =
            this.module(
                "Métronome professionnel",
                `
                    <div class="fobas-piano-pro-row">

                        <button
                            id="fobasMetronomeStart"
                            type="button">
                            Métronome
                        </button>

                        <span>
                            Beat
                            <strong id="fobasMetronomeBeat">
                                1
                            </strong>
                        </span>

                        <select id="fobasTimeSignature">
                            <option value="4/4">4/4</option>
                            <option value="3/4">3/4</option>
                            <option value="2/4">2/4</option>
                            <option value="6/8">6/8</option>
                            <option value="12/8">12/8</option>
                        </select>

                        <select id="fobasSubdivision">
                            <option value="1">Noires</option>
                            <option value="2">Croches</option>
                            <option value="4">Double-croches</option>
                        </select>

                    </div>
                `
            );


        /* LEARNING */

        const learning =
            this.module(
                "Apprentissage",
                `
                    <div class="fobas-piano-pro-row">

                        <button
                            id="fobasLearningBtn"
                            type="button">
                            Mode apprentissage
                        </button>

                        <span id="fobasLearningStatus">
                            MODE LIBRE
                        </span>

                        <select id="fobasLearningLevel">
                            <option value="beginner">
                                Initiation
                            </option>
                            <option value="elementary">
                                Débutant
                            </option>
                            <option value="intermediate">
                                Intermédiaire
                            </option>
                            <option value="advanced">
                                Avancé
                            </option>
                            <option value="expert">
                                Expert
                            </option>
                        </select>

                    </div>
                `
            );


        /* EXERCISES */

        const exercise =
            this.module(
                "Exercices",
                `
                    <div class="fobas-piano-pro-row">

                        <select id="fobasExerciseSelect"></select>

                        <button
                            id="fobasExerciseStart"
                            type="button">
                            Démarrer
                        </button>

                        <button
                            id="fobasExerciseStop"
                            type="button">
                            Arrêter
                        </button>

                    </div>

                    <div>
                        <strong id="fobasExerciseTitle">
                            Aucun exercice
                        </strong>

                        <span>
                            <span id="fobasExerciseProgress">—</span>
                        </span>

                        <span>
                            Prochaine :
                            <strong id="fobasExerciseNext">
                                —
                            </strong>
                        </span>

                        <span>
                            Score :
                            <strong id="fobasPracticeScore">
                                0%
                            </strong>
                        </span>
                    </div>
                `
            );


        /* RECORDING */

        const recording =
            this.module(
                "Studio / Enregistrement",
                `
                    <div class="fobas-piano-pro-row">

                        <button
                            id="fobasRecordBtn"
                            type="button">
                            ● Enregistrer
                        </button>

                        <button
                            id="fobasPlaybackBtn"
                            type="button">
                            ▶ Lecture
                        </button>

                    </div>
                `
            );


        /* SONGS */

        const songs =
            this.module(
                "Bibliothèque musicale",
                `
                    <div class="fobas-piano-pro-row">

                        <select id="fobasSongSelect"></select>

                        <button
                            id="fobasSongLoad"
                            type="button">
                            Charger
                        </button>

                    </div>

                    <div>
                        <strong id="fobasCurrentSong">
                            Aucun morceau
                        </strong>
                    </div>
                `
            );


        /* MIDI */

        const midi =
            this.module(
                "MIDI",
                `
                    <div class="fobas-piano-pro-row">

                        <button
                            id="fobasMidiConnect"
                            type="button">
                            Connecter MIDI
                        </button>

                        <select id="fobasMidiInput">
                            <option value="">
                                Entrée MIDI
                            </option>
                        </select>

                        <select id="fobasMidiOutput">
                            <option value="">
                                Sortie MIDI
                            </option>
                        </select>

                    </div>

                    <div id="fobasMidiStatus">
                        MIDI non initialisé
                    </div>
                `
            );


        consolePanel.append(
            octave,
            pedals,
            metronome,
            learning,
            exercise,
            recording,
            songs,
            midi
        );


        const target =
            document.querySelector(
                ".control-panel"
            );

        if (target) {

            target.insertAdjacentElement(
                "afterend",
                consolePanel
            );

        } else {

            pianoDOM.app.appendChild(
                consolePanel
            );
        }
    },


    module(
        title,
        html
    ) {

        const section =
            document.createElement("section");

        section.className =
            "fobas-piano-pro-module";

        section.innerHTML =
            `<h3>${title}</h3>${html}`;

        return section;
    },


    bindControls() {

        document
            .getElementById(
                "fobasOctaveDown"
            )
            ?.addEventListener(
                "click",
                () =>
                    OctaveEngine.shift(-1)
            );


        document
            .getElementById(
                "fobasOctaveUp"
            )
            ?.addEventListener(
                "click",
                () =>
                    OctaveEngine.shift(1)
            );


        document
            .getElementById(
                "fobasOctaveReset"
            )
            ?.addEventListener(
                "click",
                () =>
                    OctaveEngine.reset()
            );


        document
            .getElementById(
                "fobasPedalSustain"
            )
            ?.addEventListener(
                "click",
                () =>
                    PedalEngine.toggle(
                        "sustain"
                    )
            );


        document
            .getElementById(
                "fobasPedalSostenuto"
            )
            ?.addEventListener(
                "click",
                () =>
                    PedalEngine.toggle(
                        "sostenuto"
                    )
            );


        document
            .getElementById(
                "fobasPedalSoft"
            )
            ?.addEventListener(
                "click",
                () =>
                    PedalEngine.toggle(
                        "soft"
                    )
            );


        document
            .getElementById(
                "fobasMetronomeStart"
            )
            ?.addEventListener(
                "click",
                () =>
                    MetronomeEngine.toggle()
            );


        document
            .getElementById(
                "fobasTimeSignature"
            )
            ?.addEventListener(
                "change",
                event => {

                    const [
                        numerator,
                        denominator
                    ] =
                        event.target.value
                            .split("/")
                            .map(Number);

                    pianoState.timeSignatureNumerator =
                        numerator;

                    pianoState.timeSignatureDenominator =
                        denominator;

                    pianoState.metronomeBeat =
                        0;

                    StorageEngine.saveSettings();
                }
            );


        document
            .getElementById(
                "fobasSubdivision"
            )
            ?.addEventListener(
                "change",
                event => {

                    pianoState.subdivision =
                        Number(
                            event.target.value
                        );

                    StorageEngine.saveSettings();
                }
            );


        document
            .getElementById(
                "fobasLearningBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    if (
                        pianoState.learningMode
                    ) {
                        LearningEngine.disable();
                    } else {
                        LearningEngine.enable();
                    }
                }
            );


        document
            .getElementById(
                "fobasExerciseStart"
            )
            ?.addEventListener(
                "click",
                () => {

                    const id =
                        document.getElementById(
                            "fobasExerciseSelect"
                        )?.value;

                    ExerciseEngine.start(
                        id
                    );
                }
            );


        document
            .getElementById(
                "fobasExerciseStop"
            )
            ?.addEventListener(
                "click",
                () =>
                    ExerciseEngine.stop()
            );


        document
            .getElementById(
                "fobasRecordBtn"
            )
            ?.addEventListener(
                "click",
                async () => {

                    await ensureAudioReady();

                    if (
                        pianoState.recording
                    ) {
                        RecordingEngine.stop();
                    } else {
                        RecordingEngine.start();
                    }
                }
            );


        document
            .getElementById(
                "fobasPlaybackBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    if (
                        pianoState.playback
                    ) {

                        PlaybackEngine.stop();

                        return;
                    }

                    const recording =
                        pianoState.recordings[
                            pianoState.recordings.length - 1
                        ];

                    if (recording) {
                        PlaybackEngine.play(
                            recording
                        );
                    }
                }
            );


        document
            .getElementById(
                "fobasSongLoad"
            )
            ?.addEventListener(
                "click",
                () => {

                    const id =
                        document.getElementById(
                            "fobasSongSelect"
                        )?.value;

                    SongLibraryEngine.load(
                        id
                    );
                }
            );


        document
            .getElementById(
                "fobasMidiConnect"
            )
            ?.addEventListener(
                "click",
                () =>
                    MIDIEngine.initialize()
            );


        document
            .getElementById(
                "fobasMidiInput"
            )
            ?.addEventListener(
                "change",
                event => {

                    const id =
                        event.target.value;

                    pianoState.selectedMidiInput =
                        pianoState.midiInputs.find(
                            input =>
                                input.id === id
                        ) || null;

                    if (
                        pianoState.selectedMidiInput
                    ) {

                        pianoState.selectedMidiInput.onmidimessage =
                            event =>
                                MIDIEngine.handleMessage(
                                    event
                                );
                    }
                }
            );


        document
            .getElementById(
                "fobasMidiOutput"
            )
            ?.addEventListener(
                "change",
                event => {

                    pianoState.selectedMidiOutput =
                        pianoState.midiOutputs.find(
                            output =>
                                output.id ===
                                event.target.value
                        ) || null;
                }
            );
    },


    populateLibraries() {

        const exerciseSelect =
            document.getElementById(
                "fobasExerciseSelect"
            );

        if (exerciseSelect) {

            exerciseSelect.innerHTML = "";

            ExerciseEngine.exercises.forEach(
                exercise => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        exercise.id;

                    option.textContent =
                        `${exercise.category} — ${exercise.name}`;

                    exerciseSelect.appendChild(
                        option
                    );
                }
            );
        }


        const songSelect =
            document.getElementById(
                "fobasSongSelect"
            );

        if (songSelect) {

            songSelect.innerHTML = "";

            SongLibraryEngine.songs.forEach(
                song => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        song.id;

                    option.textContent =
                        song.title;

                    songSelect.appendChild(
                        option
                    );
                }
            );
        }
    }
};


/* ================================================================
   33 — MIDI SELECT UI
================================================================ */

function updateMIDISelects() {

    const inputSelect =
        document.getElementById(
            "fobasMidiInput"
        );

    const outputSelect =
        document.getElementById(
            "fobasMidiOutput"
        );

    if (inputSelect) {

        inputSelect.innerHTML =
            `<option value="">
                Entrée MIDI
            </option>`;

        pianoState.midiInputs.forEach(
            input => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    input.id;

                option.textContent =
                    input.name ||
                    "MIDI Input";

                inputSelect.appendChild(
                    option
                );
            }
        );
    }


    if (outputSelect) {

        outputSelect.innerHTML =
            `<option value="">
                Sortie MIDI
            </option>`;

        pianoState.midiOutputs.forEach(
            output => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    output.id;

                option.textContent =
                    output.name ||
                    "MIDI Output";

                outputSelect.appendChild(
                    option
                );
            }
        );
    }
}


/* ================================================================
   34 — EXISTING HTML CONTROLS
================================================================ */

function bindExistingControls() {

    pianoDOM.startAudioBtn
        ?.addEventListener(
            "click",
            () =>
                initializeAudio()
        );


    pianoDOM.sustainBtn
        ?.addEventListener(
            "click",
            () =>
                PedalEngine.toggle(
                    "sustain"
                )
        );


    pianoDOM.metronomeBtn
        ?.addEventListener(
            "click",
            () =>
                MetronomeEngine.toggle()
        );


    pianoDOM.volume
        ?.addEventListener(
            "input",
            event =>
                setVolume(
                    event.target.value
                )
        );


    pianoDOM.bpm
        ?.addEventListener(
            "input",
            event =>
                TempoEngine.setBPM(
                    event.target.value
                )
        );


    pianoDOM.waveform
        ?.addEventListener(
            "change",
            event => {

                pianoState.waveform =
                    event.target.value;

                StorageEngine.saveSettings();
            }
        );
}


/* ================================================================
   35 — VISIBILITY / PAGE LIFECYCLE
================================================================ */

function bindLifecycle() {

    document.addEventListener(
        "visibilitychange",
        async () => {

            if (
                document.hidden
            ) {

                pianoState.pressedComputerKeys.clear();

                if (
                    !pianoState.sustain &&
                    !pianoState.sostenuto
                ) {

                    releaseAllNotes();
                }

            } else if (
                pianoState.audioContext &&
                pianoState.audioContext.state ===
                "suspended"
            ) {

                try {
                    await pianoState.audioContext.resume();
                } catch (_) {}
            }
        }
    );


    window.addEventListener(
        "blur",
        () => {

            pianoState.pressedComputerKeys.clear();

            if (
                !pianoState.sustain
            ) {

                releaseAllNotes();
            }
        }
    );
}


/* ================================================================
   36 — INITIALIZATION
================================================================ */

function initializeFOBASPiano() {

    if (
        pianoState.initialized
    ) {
        return;
    }

    cacheDOM();

    StorageEngine.loadSettings();
    StorageEngine.loadRecordings();

    PianoKeyboardEngine.initialize();

    MusicNotationEngine.initialize();

    PianoStudioController.initialize();

    bindExistingControls();

    bindLifecycle();

    setVolume(
        pianoState.volume
    );

    TempoEngine.setBPM(
        pianoState.bpm
    );

    updateAudioButton();
    updatePedalUI();
    updateMetronomeUI();
    updateOctaveUI();
    updateLearningUI();
    updateExerciseUI();
    updateRecordingUI();
    updatePlaybackUI();
    updateSongUI();

    pianoState.initialized =
        true;

    updateStatus(
        "FOBAS Piano Pro prêt — activez le piano pour commencer."
    );
}


/* ================================================================
   37 — START
================================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeFOBASPiano,
        {
            once: true
        }
    );

} else {

    initializeFOBASPiano();
}


/* ================================================================
   38 — API PUBLIQUE FOBAS
================================================================ */

window.FOBASPiano = {

    version:
        FOBAS_PIANO_CONFIG.version,

    playNote(
        midi,
        velocity = 92
    ) {

        return NoteEngine.noteOn(
            midi,
            velocity,
            "api",
            midi
        );
    },

    stopNote(
        midi
    ) {

        NoteEngine.noteOff(
            midi,
            "api",
            midi
        );
    },

    sustain(
        value
    ) {

        PedalEngine.set(
            "sustain",
            value
        );
    },

    sostenuto(
        value
    ) {

        PedalEngine.set(
            "sostenuto",
            value
        );
    },

    soft(
        value
    ) {

        PedalEngine.set(
            "soft",
            value
        );
    },

    setBPM(
        value
    ) {

        TempoEngine.setBPM(
            value
        );
    },

    setVolume(
        value
    ) {

        setVolume(
            value
        );
    },

    octave(
        direction
    ) {

        OctaveEngine.shift(
            direction
        );
    },

    startRecording() {

        RecordingEngine.start();
    },

    stopRecording() {

        return RecordingEngine.stop();
    },

    playRecording(
        recording
    ) {

        PlaybackEngine.play(
            recording
        );
    },

    stopPlayback() {

        PlaybackEngine.stop();
    },

    startExercise(
        exerciseId
    ) {

        ExerciseEngine.start(
            exerciseId
        );
    },

    loadSong(
        songId
    ) {

        SongLibraryEngine.load(
            songId
        );
    },

    connectMIDI() {

        return MIDIEngine.initialize();
    },

    getState() {

        return {
            audioReady:
                pianoState.audioReady,

            volume:
                pianoState.volume,

            bpm:
                pianoState.bpm,

            octave:
                pianoState.keyboardOctaveOffset,

            sustain:
                pianoState.sustain,

            sostenuto:
                pianoState.sostenuto,

            soft:
                pianoState.soft,

            metronome:
                pianoState.metronome,

            recording:
                pianoState.recording,

            playback:
                pianoState.playback,

            activeVoices:
                pianoState.activeVoices.size,

            currentExercise:
                pianoState.currentExercise,

            currentSong:
                pianoState.currentSong
        };
    }
};


/* ================================================================
   FIN — FOBAS PIANO PRO
================================================================ */

















