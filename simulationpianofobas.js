/* ================================================================
   FOBAS PIANO — SIMULATION MUSICALE PROFESSIONNELLE
   ================================================================
   Fichier : simulationpianofobas.js

   Compatible avec :
   simulationpianofobas.html

   Fonctionnalités :
   - 30 touches chromatiques
   - 21 touches blanches
   - 9 touches noires
   - MIDI C2 → F4
   - Web Audio API
   - Polyphonie
   - Sustain
   - Métronome
   - Volume
   - BPM
   - Plusieurs timbres
   - Clavier ordinateur
   - Touch / Pointer / Souris
   - Affichage note / octave
   - Marqueur de partition
   ================================================================ */

(() => {
    "use strict";

    /* ============================================================
       CONFIGURATION PRINCIPALE
    ============================================================ */

    const CONFIG = {
        totalKeys: 30,

        firstMidi: 36, // C2
        lastMidi: 65,  // F4

        defaultVolume: 0.72,
        defaultBpm: 100,

        normalRelease: 0.18,
        sustainRelease: 1.35,

        maxPolyphony: 48,

        keyboardMap: [
            "a",
            "w",
            "s",
            "e",
            "d",
            "f",
            "t",
            "g",
            "y",
            "h",
            "u",
            "j",
            "k",
            "o",
            "l",
            "p",
            ";",
            "z",
            "x",
            "c",
            "v",
            "b",
            "n",
            "m",
            ",",
            ".",
            "/",
            "'",
            "[",
            "]"
        ]
    };

    /* ============================================================
       NOTES
    ============================================================ */

    const NOTE_NAMES = [
        "C",
        "C♯",
        "D",
        "D♯",
        "E",
        "F",
        "F♯",
        "G",
        "G♯",
        "A",
        "A♯",
        "B"
    ];

    const BLACK_PITCH_CLASSES = new Set([
        1,
        3,
        6,
        8,
        10
    ]);

    /* ============================================================
       TIMBRES
    ============================================================ */

    const VOICES = {
        piano: {
            label: "Piano Grand",
            oscillator1: "triangle",
            oscillator2: "sine",
            oscillator3: "triangle",
            osc2Level: 0.25,
            osc3Level: 0.08,
            attack: 0.008,
            decay: 1.25,
            sustain: 0.28,
            release: 1.35,
            filter: 5200,
            filterQ: 0.7,
            detune2: 0,
            detune3: 0
        },

        warm: {
            label: "Piano Warm",
            oscillator1: "triangle",
            oscillator2: "sine",
            oscillator3: "sine",
            osc2Level: 0.20,
            osc3Level: 0.10,
            attack: 0.015,
            decay: 1.55,
            sustain: 0.34,
            release: 1.55,
            filter: 3600,
            filterQ: 0.65,
            detune2: -2,
            detune3: 2
        },

        bright: {
            label: "Piano Bright",
            oscillator1: "triangle",
            oscillator2: "sawtooth",
            oscillator3: "sine",
            osc2Level: 0.16,
            osc3Level: 0.12,
            attack: 0.004,
            decay: 0.95,
            sustain: 0.25,
            release: 1.10,
            filter: 7200,
            filterQ: 0.8,
            detune2: 1,
            detune3: -1
        },

        grave: {
            label: "Grave",
            oscillator1: "sine",
            oscillator2: "triangle",
            oscillator3: "sine",
            osc2Level: 0.34,
            osc3Level: 0.12,
            attack: 0.012,
            decay: 1.75,
            sustain: 0.42,
            release: 1.80,
            filter: 2800,
            filterQ: 0.55,
            detune2: -3,
            detune3: 3
        },

        aigu: {
            label: "Aigu",
            oscillator1: "triangle",
            oscillator2: "sawtooth",
            oscillator3: "sine",
            osc2Level: 0.19,
            osc3Level: 0.10,
            attack: 0.004,
            decay: 0.80,
            sustain: 0.22,
            release: 0.90,
            filter: 8200,
            filterQ: 0.9,
            detune2: 2,
            detune3: -2
        },

        soprano: {
            label: "Soprano",
            oscillator1: "sine",
            oscillator2: "triangle",
            oscillator3: "sine",
            osc2Level: 0.30,
            osc3Level: 0.12,
            attack: 0.018,
            decay: 1.20,
            sustain: 0.38,
            release: 1.40,
            filter: 9000,
            filterQ: 0.7,
            detune2: 3,
            detune3: -3
        },

        alto: {
            label: "Alto",
            oscillator1: "triangle",
            oscillator2: "sine",
            oscillator3: "triangle",
            osc2Level: 0.27,
            osc3Level: 0.10,
            attack: 0.012,
            decay: 1.35,
            sustain: 0.35,
            release: 1.40,
            filter: 6000,
            filterQ: 0.65,
            detune2: -1,
            detune3: 1
        },

        tenor: {
            label: "Ténor",
            oscillator1: "triangle",
            oscillator2: "sine",
            oscillator3: "sine",
            osc2Level: 0.32,
            osc3Level: 0.08,
            attack: 0.010,
            decay: 1.50,
            sustain: 0.40,
            release: 1.60,
            filter: 4700,
            filterQ: 0.60,
            detune2: -2,
            detune3: 2
        },

        basse: {
            label: "Basse",
            oscillator1: "sine",
            oscillator2: "triangle",
            oscillator3: "sine",
            osc2Level: 0.38,
            osc3Level: 0.10,
            attack: 0.014,
            decay: 1.80,
            sustain: 0.46,
            release: 1.90,
            filter: 2200,
            filterQ: 0.50,
            detune2: -4,
            detune3: 4
        }
    };

    /* ============================================================
       ÉTAT GLOBAL
    ============================================================ */

    const state = {
        audioContext: null,

        masterGain: null,
        compressor: null,

        audioStarted: false,

        volume: CONFIG.defaultVolume,
        bpm: CONFIG.defaultBpm,

        sustain: false,
        metronome: false,

        selectedVoice: "piano",

        activeNotes: new Map(),

        pressedComputerKeys: new Set(),

        pointerNotes: new Map(),

        metronomeTimer: null,

        noteSequence: 0
    };

    /* ============================================================
       DOM
    ============================================================ */

    const $ = id => document.getElementById(id);

    const pianoKeyboard = $("pianoKeyboard");
    const startAudioBtn = $("startAudioBtn");
    const sustainBtn = $("sustainBtn");
    const metronomeBtn = $("metronomeBtn");

    const currentNote = $("currentNote");
    const currentOctave = $("currentOctave");
    const statusText = $("statusText");

    const bpmValue = $("bpmValue");
    const bpmOutput = $("bpmOutput");

    const volume = $("volume");
    const volumeValue = $("volumeValue");

    const bpm = $("bpm");
    const waveform = $("waveform");

    const staff = $("staff");
    const noteMarker = $("noteMarker");

    /* ============================================================
       UTILITAIRES
    ============================================================ */

    function midiToFrequency(midi) {
        return 440 * Math.pow(
            2,
            (midi - 69) / 12
        );
    }

    function midiToNoteName(midi) {
        const pitchClass =
            ((midi % 12) + 12) % 12;

        return NOTE_NAMES[pitchClass];
    }

    function midiToOctave(midi) {
        return Math.floor(midi / 12) - 1;
    }

    function isBlackKey(midi) {
        const pitchClass =
            ((midi % 12) + 12) % 12;

        return BLACK_PITCH_CLASSES.has(
            pitchClass
        );
    }

    function getFullNoteName(midi) {
        return `${midiToNoteName(midi)}${midiToOctave(midi)}`;
    }

    function clamp(value, min, max) {
        return Math.min(
            Math.max(value, min),
            max
        );
    }

    /* ============================================================
       AUDIO ENGINE
    ============================================================ */

    async function ensureAudio() {

        if (!state.audioContext) {

            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContextClass) {
                throw new Error(
                    "Web Audio API non disponible."
                );
            }

            state.audioContext =
                new AudioContextClass();

            state.compressor =
                state.audioContext.createDynamicsCompressor();

            state.compressor.threshold.value = -18;
            state.compressor.knee.value = 12;
            state.compressor.ratio.value = 4;
            state.compressor.attack.value = 0.003;
            state.compressor.release.value = 0.25;

            state.masterGain =
                state.audioContext.createGain();

            state.masterGain.gain.value =
                state.volume;

            state.compressor.connect(
                state.masterGain
            );

            state.masterGain.connect(
                state.audioContext.destination
            );
        }

        if (
            state.audioContext.state ===
            "suspended"
        ) {
            await state.audioContext.resume();
        }

        state.audioStarted = true;

        updateAudioButton();

        setStatus(
            "Piano actif — prêt à jouer."
        );
    }

    function updateAudioButton() {

        if (!startAudioBtn) {
            return;
        }

        if (state.audioStarted) {

            startAudioBtn.textContent =
                "Piano actif";

            startAudioBtn.classList.add(
                "active"
            );

        } else {

            startAudioBtn.textContent =
                "Activer le piano";

            startAudioBtn.classList.remove(
                "active"
            );
        }
    }

    /* ============================================================
       VOLUME
    ============================================================ */

    function updateVolume() {

        if (!volume) {
            return;
        }

        const value =
            clamp(
                Number(volume.value),
                0,
                1
            );

        state.volume = value;

        if (state.masterGain) {

            state.masterGain.gain.setTargetAtTime(
                value,
                state.audioContext.currentTime,
                0.015
            );
        }

        if (volumeValue) {

            volumeValue.textContent =
                `${Math.round(value * 100)}%`;
        }
    }

    /* ============================================================
       CRÉATION D'UNE VOIX
    ============================================================ */

    function createVoice(
        midi,
        velocity = 1
    ) {

        if (!state.audioContext) {
            return null;
        }

        const ctx =
            state.audioContext;

        const voice =
            VOICES[state.selectedVoice] ||
            VOICES.piano;

        const frequency =
            midiToFrequency(midi);

        const now =
            ctx.currentTime;

        const output =
            ctx.createGain();

        const filter =
            ctx.createBiquadFilter();

        filter.type =
            "lowpass";

        const filterFrequency =
            clamp(
                voice.filter *
                Math.pow(
                    2,
                    (midi - 60) / 36
                ),
                900,
                12000
            );

        filter.frequency.setValueAtTime(
            filterFrequency,
            now
        );

        filter.Q.value =
            voice.filterQ;

        output.gain.setValueAtTime(
            0.0001,
            now
        );

        filter.connect(output);
        output.connect(state.compressor);

        const oscillators = [];

        /* --------------------------------------------------------
           OSCILLATEUR PRINCIPAL
        -------------------------------------------------------- */

        const osc1 =
            ctx.createOscillator();

        osc1.type =
            voice.oscillator1;

        osc1.frequency.setValueAtTime(
            frequency,
            now
        );

        const gain1 =
            ctx.createGain();

        gain1.gain.value =
            1;

        osc1.connect(gain1);
        gain1.connect(filter);

        oscillators.push(osc1);

        /* --------------------------------------------------------
           SECOND OSCILLATEUR
        -------------------------------------------------------- */

        const osc2 =
            ctx.createOscillator();

        osc2.type =
            voice.oscillator2;

        osc2.frequency.setValueAtTime(
            frequency,
            now
        );

        osc2.detune.value =
            voice.detune2;

        const gain2 =
            ctx.createGain();

        gain2.gain.value =
            voice.osc2Level;

        osc2.connect(gain2);
        gain2.connect(filter);

        oscillators.push(osc2);

        /* --------------------------------------------------------
           TROISIÈME OSCILLATEUR
        -------------------------------------------------------- */

        const osc3 =
            ctx.createOscillator();

        osc3.type =
            voice.oscillator3;

        osc3.frequency.setValueAtTime(
            frequency * 2,
            now
        );

        osc3.detune.value =
            voice.detune3;

        const gain3 =
            ctx.createGain();

        gain3.gain.value =
            voice.osc3Level;

        osc3.connect(gain3);
        gain3.connect(filter);

        oscillators.push(osc3);

        /* --------------------------------------------------------
           ENVELOPPE ADSR
        -------------------------------------------------------- */

        const velocityLevel =
            clamp(
                Number(velocity),
                0.1,
                1
            );

        const peak =
            0.22 *
            velocityLevel;

        const attackEnd =
            now + voice.attack;

        const decayEnd =
            attackEnd + voice.decay;

        output.gain.cancelScheduledValues(
            now
        );

        output.gain.setValueAtTime(
            0.0001,
            now
        );

        output.gain.exponentialRampToValueAtTime(
            Math.max(0.0002, peak),
            attackEnd
        );

        output.gain.exponentialRampToValueAtTime(
            Math.max(
                0.0001,
                peak * voice.sustain
            ),
            decayEnd
        );

        /* --------------------------------------------------------
           DÉMARRAGE
        -------------------------------------------------------- */

        oscillators.forEach(
            oscillator => {
                oscillator.start(now);
            }
        );

        return {
            midi,
            frequency,

            output,
            filter,

            oscillators,

            startedAt: now,

            released: false,
            sustained: false,

            voiceName:
                state.selectedVoice,

            id:
                ++state.noteSequence
        };
    }

    /* ============================================================
       JOUER UNE NOTE
    ============================================================ */

    async function playNote(
        midi,
        velocity = 1
    ) {

        try {
            await ensureAudio();
        } catch (error) {
            setStatus(
                "Audio non disponible sur cet appareil."
            );
            return;
        }

        midi =
            Number(midi);

        if (
            midi < CONFIG.firstMidi ||
            midi > CONFIG.lastMidi
        ) {
            return;
        }

        /* Si la note existe déjà */
        if (
            state.activeNotes.has(midi)
        ) {
            releaseNote(
                midi,
                true
            );
        }

        /* Limite de polyphonie */
        if (
            state.activeNotes.size >=
            CONFIG.maxPolyphony
        ) {

            const firstNote =
                state.activeNotes
                    .values()
                    .next()
                    .value;

            if (firstNote) {
                forceStopNote(
                    firstNote
                );
            }
        }

        const note =
            createVoice(
                midi,
                velocity
            );

        if (!note) {
            return;
        }

        state.activeNotes.set(
            midi,
            note
        );

        updateNoteDisplay(midi);
        updateKeyVisual(midi, true);

        setStatus(
            `${getFullNoteName(midi)} — ${VOICES[state.selectedVoice].label}`
        );
    }

    /* ============================================================
       RELÂCHER UNE NOTE
    ============================================================ */

    function releaseNote(
        midi,
        immediate = false
    ) {

        const note =
            state.activeNotes.get(midi);

        if (!note) {
            return;
        }

        if (note.released) {
            return;
        }

        if (
            state.sustain &&
            !immediate
        ) {

            note.sustained = true;

            updateKeyVisual(
                midi,
                false,
                true
            );

            return;
        }

        note.released = true;

        const ctx =
            state.audioContext;

        if (!ctx) {
            return;
        }

        const now =
            ctx.currentTime;

        const releaseTime =
            immediate
                ? 0.025
                : (
                    state.sustain
                        ? CONFIG.sustainRelease
                        : CONFIG.normalRelease
                );

        const currentGain =
            Math.max(
                0.0001,
                note.output.gain.value
            );

        note.output.gain.cancelScheduledValues(
            now
        );

        note.output.gain.setValueAtTime(
            currentGain,
            now
        );

        note.output.gain.exponentialRampToValueAtTime(
            0.0001,
            now + releaseTime
        );

        note.oscillators.forEach(
            oscillator => {

                try {
                    oscillator.stop(
                        now + releaseTime + 0.03
                    );
                } catch (_) {}
            }
        );

        setTimeout(
            () => {

                try {
                    note.oscillators.forEach(
                        oscillator => {
                            oscillator.disconnect();
                        }
                    );

                    note.filter.disconnect();
                    note.output.disconnect();

                } catch (_) {}

                if (
                    state.activeNotes.get(midi) ===
                    note
                ) {
                    state.activeNotes.delete(
                        midi
                    );
                }

                updateKeyVisual(
                    midi,
                    false
                );

            },
            Math.max(
                80,
                (releaseTime + 0.08) * 1000
            )
        );
    }

    /* ============================================================
       ARRÊT FORCÉ
    ============================================================ */

    function forceStopNote(note) {

        if (!note) {
            return;
        }

        const midi =
            note.midi;

        try {

            note.oscillators.forEach(
                oscillator => {

                    try {
                        oscillator.stop();
                    } catch (_) {}

                    try {
                        oscillator.disconnect();
                    } catch (_) {}
                }
            );

            note.filter.disconnect();
            note.output.disconnect();

        } catch (_) {}

        state.activeNotes.delete(
            midi
        );

        updateKeyVisual(
            midi,
            false
        );
    }

    /* ============================================================
       ARRÊT DE TOUTES LES NOTES
    ============================================================ */

    function stopAllNotes() {

        const notes =
            Array.from(
                state.activeNotes.values()
            );

        notes.forEach(
            note => {
                forceStopNote(note);
            }
        );

        state.pointerNotes.clear();
        state.pressedComputerKeys.clear();
    }

    /* ============================================================
       SUSTAIN
    ============================================================ */

    function setSustain(enabled) {

        state.sustain =
            Boolean(enabled);

        if (sustainBtn) {

            sustainBtn.setAttribute(
                "aria-pressed",
                String(state.sustain)
            );

            const span =
                sustainBtn.querySelector("span");

            if (span) {
                span.textContent =
                    state.sustain
                        ? "ON"
                        : "OFF";
            }

            sustainBtn.classList.toggle(
                "active",
                state.sustain
            );
        }

        if (!state.sustain) {

            const sustainedNotes =
                Array.from(
                    state.activeNotes.values()
                ).filter(
                    note => note.sustained
                );

            sustainedNotes.forEach(
                note => {
                    releaseNote(
                        note.midi,
                        false
                    );
                }
            );
        }

        setStatus(
            state.sustain
                ? "Sustain activé."
                : "Sustain désactivé."
        );
    }

    /* ============================================================
       CRÉATION DU CLAVIER — 30 TOUCHES
    ============================================================ */

    function buildKeyboard() {

        if (!pianoKeyboard) {
            return;
        }

        pianoKeyboard.innerHTML = "";

        pianoKeyboard.setAttribute(
            "data-key-count",
            String(CONFIG.totalKeys)
        );

        pianoKeyboard.style.setProperty(
            "--white-count",
            String(
                countWhiteKeys()
            )
        );

        let whiteIndex = 0;

        for (
            let midi = CONFIG.firstMidi;
            midi <= CONFIG.lastMidi;
            midi++
        ) {

            if (!isBlackKey(midi)) {

                const key =
                    createPianoKey(
                        midi,
                        false,
                        whiteIndex
                    );

                pianoKeyboard.appendChild(
                    key
                );

                whiteIndex++;
            }
        }

        whiteIndex = 0;

        for (
            let midi = CONFIG.firstMidi;
            midi <= CONFIG.lastMidi;
            midi++
        ) {

            if (isBlackKey(midi)) {

                const key =
                    createPianoKey(
                        midi,
                        true,
                        findPreviousWhiteIndex(
                            midi
                        )
                    );

                pianoKeyboard.appendChild(
                    key
                );
            } else {
                whiteIndex++;
            }
        }

        updateKeyboardHelp();
    }

    function countWhiteKeys() {

        let count = 0;

        for (
            let midi = CONFIG.firstMidi;
            midi <= CONFIG.lastMidi;
            midi++
        ) {

            if (!isBlackKey(midi)) {
                count++;
            }
        }

        return count;
    }

    function findPreviousWhiteIndex(
        midi
    ) {

        let index = 0;

        for (
            let current =
                CONFIG.firstMidi;
            current < midi;
            current++
        ) {

            if (!isBlackKey(current)) {
                index++;
            }
        }

        return Math.max(
            0,
            index - 1
        );
    }

    /* ============================================================
       CRÉATION D'UNE TOUCHE
    ============================================================ */

    function createPianoKey(
        midi,
        black,
        whiteIndex
    ) {

        const key =
            document.createElement("button");

        key.type = "button";

        key.className =
            black
                ? "piano-key black-key"
                : "piano-key white-key";

        key.dataset.midi =
            String(midi);

        key.dataset.note =
            getFullNoteName(midi);

        key.dataset.keyIndex =
            String(
                midi -
                CONFIG.firstMidi
            );

        key.dataset.whiteIndex =
            String(whiteIndex);

        const computerKey =
            CONFIG.keyboardMap[
                midi - CONFIG.firstMidi
            ];

        key.dataset.computerKey =
            computerKey;

        key.setAttribute(
            "aria-label",
            `Note ${getFullNoteName(midi)}`
        );

        key.title =
            `${getFullNoteName(midi)} — touche ${computerKey.toUpperCase()}`;

        key.style.setProperty(
            "--white-index",
            String(whiteIndex)
        );

        key.style.setProperty(
            "--white-count",
            String(countWhiteKeys())
        );

        const noteLabel =
            document.createElement("span");

        noteLabel.className =
            "key-note";

        noteLabel.textContent =
            getFullNoteName(midi);

        key.appendChild(
            noteLabel
        );

        const keyLabel =
            document.createElement("span");

        keyLabel.className =
            "key-computer";

        keyLabel.textContent =
            computerKey.toUpperCase();

        key.appendChild(
            keyLabel
        );

        attachKeyEvents(
            key,
            midi
        );

        return key;
    }

    /* ============================================================
       ÉVÉNEMENTS DES TOUCHES
    ============================================================ */

    function attachKeyEvents(
        key,
        midi
    ) {

        key.addEventListener(
            "pointerdown",
            async event => {

                event.preventDefault();

                try {
                    key.setPointerCapture(
                        event.pointerId
                    );
                } catch (_) {}

                const velocity =
                    event.pointerType === "touch"
                        ? 0.95
                        : 1;

                state.pointerNotes.set(
                    event.pointerId,
                    midi
                );

                key.classList.add(
                    "active"
                );

                await playNote(
                    midi,
                    velocity
                );
            }
        );

        key.addEventListener(
            "pointerup",
            event => {

                event.preventDefault();

                const noteMidi =
                    state.pointerNotes.get(
                        event.pointerId
                    );

                state.pointerNotes.delete(
                    event.pointerId
                );

                releaseNote(
                    noteMidi ?? midi
                );
            }
        );

        key.addEventListener(
            "pointercancel",
            event => {

                const noteMidi =
                    state.pointerNotes.get(
                        event.pointerId
                    );

                state.pointerNotes.delete(
                    event.pointerId
                );

                releaseNote(
                    noteMidi ?? midi
                );
            }
        );

        key.addEventListener(
            "lostpointercapture",
            event => {

                const noteMidi =
                    state.pointerNotes.get(
                        event.pointerId
                    );

                if (
                    noteMidi !== undefined
                ) {

                    state.pointerNotes.delete(
                        event.pointerId
                    );

                    releaseNote(
                        noteMidi
                    );
                }
            }
        );

        key.addEventListener(
            "contextmenu",
            event => {
                event.preventDefault();
            }
        );
    }

    /* ============================================================
       VISUEL DES TOUCHES
    ============================================================ */

    function updateKeyVisual(
        midi,
        active,
        sustained = false
    ) {

        if (!pianoKeyboard) {
            return;
        }

        const key =
            pianoKeyboard.querySelector(
                `[data-midi="${midi}"]`
            );

        if (!key) {
            return;
        }

        key.classList.toggle(
            "active",
            Boolean(active)
        );

        key.classList.toggle(
            "sustained",
            Boolean(sustained)
        );
    }

    /* ============================================================
       CLAVIER ORDINATEUR
    ============================================================ */

    function getMidiFromComputerKey(
        key
    ) {

        const normalized =
            String(key)
                .toLowerCase();

        const index =
            CONFIG.keyboardMap.indexOf(
                normalized
            );

        if (index === -1) {
            return null;
        }

        return (
            CONFIG.firstMidi +
            index
        );
    }

    async function handleComputerKeyDown(
        event
    ) {

        if (
            event.ctrlKey ||
            event.metaKey ||
            event.altKey
        ) {
            return;
        }

        const midi =
            getMidiFromComputerKey(
                event.key
            );

        if (midi === null) {
            return;
        }

        event.preventDefault();

        const normalized =
            event.key.toLowerCase();

        if (
            state.pressedComputerKeys.has(
                normalized
            )
        ) {
            return;
        }

        state.pressedComputerKeys.add(
            normalized
        );

        await playNote(
            midi,
            0.95
        );
    }

    function handleComputerKeyUp(
        event
    ) {

        const midi =
            getMidiFromComputerKey(
                event.key
            );

        if (midi === null) {
            return;
        }

        event.preventDefault();

        const normalized =
            event.key.toLowerCase();

        state.pressedComputerKeys.delete(
            normalized
        );

        releaseNote(
            midi
        );
    }

    /* ============================================================
       AFFICHAGE NOTE
    ============================================================ */

    function updateNoteDisplay(
        midi
    ) {

        if (currentNote) {

            currentNote.textContent =
                midiToNoteName(midi);
        }

        if (currentOctave) {

            currentOctave.textContent =
                midiToOctave(midi);
        }

        updateStaffMarker(
            midi
        );
    }

    /* ============================================================
       PARTITION
    ============================================================ */

    function updateStaffMarker(
        midi
    ) {

        if (!noteMarker) {
            return;
        }

        const minMidi =
            CONFIG.firstMidi;

        const maxMidi =
            CONFIG.lastMidi;

        const percentage =
            (
                (midi - minMidi) /
                (maxMidi - minMidi)
            ) * 100;

        noteMarker.style.left =
            `${clamp(
                percentage,
                2,
                96
            )}%`;

        noteMarker.textContent =
            isBlackKey(midi)
                ? "◆"
                : "●";

        noteMarker.setAttribute(
            "aria-label",
            `Note ${getFullNoteName(midi)}`
        );

        if (staff) {

            staff.classList.add(
                "has-note"
            );
        }
    }

    /* ============================================================
       STATUS
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
       TIMBRE
    ============================================================ */

    function populateVoices() {

        if (!waveform) {
            return;
        }

        waveform.innerHTML = "";

        Object.entries(
            VOICES
        ).forEach(
            ([value, voice]) => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    value;

                option.textContent =
                    voice.label;

                if (
                    value ===
                    state.selectedVoice
                ) {
                    option.selected =
                        true;
                }

                waveform.appendChild(
                    option
                );
            }
        );
    }

    function changeVoice(
        voiceName
    ) {

        if (
            !VOICES[voiceName]
        ) {
            return;
        }

        state.selectedVoice =
            voiceName;

        setStatus(
            `Timbre sélectionné : ${VOICES[voiceName].label}`
        );
    }

    /* ============================================================
       BPM
    ============================================================ */

    function updateBpm() {

        if (!bpm) {
            return;
        }

        const value =
            clamp(
                Number(bpm.value),
                40,
                220
            );

        state.bpm =
            value;

        if (bpmValue) {
            bpmValue.textContent =
                String(value);
        }

        if (bpmOutput) {
            bpmOutput.textContent =
                String(value);
        }

        if (
            state.metronome
        ) {
            restartMetronome();
        }
    }

    /* ============================================================
       MÉTRONOME
    ============================================================ */

    function playMetronomeClick() {

        if (
            !state.audioContext ||
            !state.audioStarted
        ) {
            return;
        }

        const ctx =
            state.audioContext;

        const now =
            ctx.currentTime;

        const oscillator =
            ctx.createOscillator();

        const gain =
            ctx.createGain();

        oscillator.type =
            "sine";

        oscillator.frequency.setValueAtTime(
            1100,
            now
        );

        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            0.12,
            now + 0.004
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.065
        );

        oscillator.connect(gain);
        gain.connect(state.masterGain);

        oscillator.start(now);

        oscillator.stop(
            now + 0.08
        );
    }

    function startMetronome() {

        stopMetronome();

        const interval =
            60000 /
            state.bpm;

        playMetronomeClick();

        state.metronomeTimer =
            setInterval(
                playMetronomeClick,
                interval
            );
    }

    function stopMetronome() {

        if (
            state.metronomeTimer
        ) {

            clearInterval(
                state.metronomeTimer
            );

            state.metronomeTimer =
                null;
        }
    }

    function restartMetronome() {

        if (
            !state.metronome
        ) {
            return;
        }

        startMetronome();
    }

    function setMetronome(
        enabled
    ) {

        state.metronome =
            Boolean(enabled);

        if (metronomeBtn) {

            metronomeBtn.setAttribute(
                "aria-pressed",
                String(state.metronome)
            );

            const span =
                metronomeBtn.querySelector(
                    "span"
                );

            if (span) {

                span.textContent =
                    state.metronome
                        ? "ON"
                        : "OFF";
            }

            metronomeBtn.classList.toggle(
                "active",
                state.metronome
            );
        }

        if (
            state.metronome
        ) {

            ensureAudio()
                .then(() => {
                    startMetronome();
                });

            setStatus(
                `Métronome — ${state.bpm} BPM`
            );

        } else {

            stopMetronome();

            setStatus(
                "Métronome désactivé."
            );
        }
    }

    /* ============================================================
       AIDE CLAVIER
    ============================================================ */

    function updateKeyboardHelp() {

        const helpCards =
            document.querySelectorAll(
                ".help-card"
            );

        if (!helpCards.length) {
            return;
        }

        const allKeys =
            CONFIG.keyboardMap.map(
                key =>
                    key === " "
                        ? "ESPACE"
                        : key.toUpperCase()
            );

        const firstCard =
            helpCards[0];

        if (firstCard) {

            const span =
                firstCard.querySelector(
                    "span"
                );

            if (span) {

                span.textContent =
                    allKeys.join(" ");
            }
        }

        const whiteKeys = [];
        const blackKeys = [];

        for (
            let midi = CONFIG.firstMidi;
            midi <= CONFIG.lastMidi;
            midi++
        ) {

            const index =
                midi -
                CONFIG.firstMidi;

            const computerKey =
                CONFIG.keyboardMap[index];

            if (isBlackKey(midi)) {

                blackKeys.push(
                    computerKey.toUpperCase()
                );

            } else {

                whiteKeys.push(
                    computerKey.toUpperCase()
                );
            }
        }

        const secondCard =
            helpCards[1];

        if (secondCard) {

            const span =
                secondCard.querySelector(
                    "span"
                );

            if (span) {

                span.textContent =
                    whiteKeys.join(" · ");
            }
        }

        const thirdCard =
            helpCards[2];

        if (thirdCard) {

            const span =
                thirdCard.querySelector(
                    "span"
                );

            if (span) {

                span.textContent =
                    blackKeys.join(" · ");
            }
        }

        const footerSpans =
            document.querySelectorAll(
                ".piano-footer span"
            );

        if (
            footerSpans.length > 1
        ) {

            footerSpans[1].textContent =
                `Clavier ordinateur : ${allKeys.join(" ")}`;
        }
    }

    /* ============================================================
       BOUTON AUDIO
    ============================================================ */

    if (startAudioBtn) {

        startAudioBtn.addEventListener(
            "click",
            async () => {

                try {

                    await ensureAudio();

                    setStatus(
                        "Piano activé — vous pouvez jouer."
                    );

                } catch (_) {

                    setStatus(
                        "Impossible d'activer l'audio."
                    );
                }
            }
        );
    }

    /* ============================================================
       BOUTON SUSTAIN
    ============================================================ */

    if (sustainBtn) {

        sustainBtn.addEventListener(
            "click",
            () => {

                setSustain(
                    !state.sustain
                );
            }
        );
    }

    /* ============================================================
       BOUTON MÉTRONOME
    ============================================================ */

    if (metronomeBtn) {

        metronomeBtn.addEventListener(
            "click",
            () => {

                setMetronome(
                    !state.metronome
                );
            }
        );
    }

    /* ============================================================
       VOLUME
    ============================================================ */

    if (volume) {

        volume.addEventListener(
            "input",
            updateVolume
        );
    }

    /* ============================================================
       BPM
    ============================================================ */

    if (bpm) {

        bpm.addEventListener(
            "input",
            updateBpm
        );
    }

    /* ============================================================
       SÉLECTION DU SON
    ============================================================ */

    if (waveform) {

        waveform.addEventListener(
            "change",
            event => {

                changeVoice(
                    event.target.value
                );
            }
        );
    }

    /* ============================================================
       CLAVIER PHYSIQUE
    ============================================================ */

    window.addEventListener(
        "keydown",
        handleComputerKeyDown
    );

    window.addEventListener(
        "keyup",
        handleComputerKeyUp
    );

    /* ============================================================
       SÉCURITÉ — PERTE DE FOCUS
    ============================================================ */

    window.addEventListener(
        "blur",
        () => {

            state.pressedComputerKeys.clear();

            if (!state.sustain) {
                stopAllNotes();
            }
        }
    );

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.hidden
            ) {

                state.pressedComputerKeys.clear();

                if (!state.sustain) {
                    stopAllNotes();
                }
            }
        }
    );

    /* ============================================================
       EMPÊCHER LE MENU CONTEXTUEL SUR LE PIANO
    ============================================================ */

    if (pianoKeyboard) {

        pianoKeyboard.addEventListener(
            "contextmenu",
            event => {
                event.preventDefault();
            }
        );
    }

    /* ============================================================
       INITIALISATION
    ============================================================ */

    function init() {

        buildKeyboard();

        populateVoices();

        if (volume) {

            volume.value =
                String(
                    CONFIG.defaultVolume
                );
        }

        if (bpm) {

            bpm.value =
                String(
                    CONFIG.defaultBpm
                );
        }

        updateVolume();
        updateBpm();

        setSustain(false);

        setMetronome(false);

        updateAudioButton();

        setStatus(
            "Prêt — activez l'audio pour commencer."
        );
    }

    /* ============================================================
       LANCEMENT
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














/* ================================================================
   FOBAS PIANO PRO — VISUAL TOUCH KEYBOARD UPGRADE
   ---------------------------------------------------------------
   OBJECTIF
   ---------------------------------------------------------------
   - Rendre le piano visuellement professionnel
   - 88 touches A0 → C8
   - Design 3D réaliste
   - Touch mobile / tablette
   - 2 TOUCHES SIMULTANÉES ET PLUS
   - Compatible avec le moteur audio existant
   - Compatible avec le système MIDI existant
   - Compatible avec Recording / Exercise / Practice
   - NE MODIFIE PAS le moteur audio existant
   - NE REMPLACE PAS PianoKeyboardEngine
   ================================================================ */

(function FOBAS_PIANO_VISUAL_TOUCH_UPGRADE() {

    "use strict";


    /* ============================================================
       01 — PROTECTION
    ============================================================ */

    if (
        document.getElementById(
            "fobasPianoProfessionalTouchStyles"
        )
    ) {
        return;
    }


    /* ============================================================
       02 — STYLE PROFESSIONNEL
    ============================================================ */

    const style =
        document.createElement("style");

    style.id =
        "fobasPianoProfessionalTouchStyles";

    style.textContent = `

        /* ========================================================
           PIANO PRINCIPAL
        ======================================================== */

        #pianoKeyboard {

            position: relative !important;

            display: block !important;

            width: 100% !important;

            min-width: 1100px !important;

            height: 310px !important;

            margin: 0 !important;

            padding: 0 !important;

            overflow: visible !important;

            background:
                linear-gradient(
                    180deg,
                    #111827 0%,
                    #020617 48%,
                    #000000 100%
                ) !important;

            border-radius: 14px !important;

            border:
                2px solid
                rgba(255,255,255,.10) !important;

            box-shadow:

                inset 0 2px 0
                rgba(255,255,255,.08),

                inset 0 -12px 20px
                rgba(0,0,0,.75),

                0 20px 40px
                rgba(0,0,0,.45) !important;

            user-select: none !important;

            -webkit-user-select: none !important;

            -webkit-touch-callout: none !important;

            touch-action: none !important;

            overscroll-behavior: contain !important;

        }


        /* ========================================================
           BASE VISUELLE
        ======================================================== */

        #pianoKeyboard::before {

            content: "";

            position: absolute;

            left: 8px;

            right: 8px;

            bottom: 5px;

            height: 12px;

            border-radius: 0 0 9px 9px;

            background:
                linear-gradient(
                    180deg,
                    #374151,
                    #030712
                );

            box-shadow:
                inset 0 1px 0
                rgba(255,255,255,.12),

                0 5px 10px
                rgba(0,0,0,.65);

            pointer-events: none;

            z-index: 0;

        }


        /* ========================================================
           TOUCHES BLANCHES
        ======================================================== */

        #pianoKeyboard .piano-white-key {

            position: absolute !important;

            top: 0 !important;

            bottom: 10px !important;

            margin: 0 !important;

            padding: 0 !important;

            border-radius:
                0 0 8px 8px !important;

            border:

                1px solid
                rgba(100,116,139,.95) !important;

            border-top: 0 !important;

            background:

                linear-gradient(
                    180deg,
                    #ffffff 0%,
                    #f8fafc 34%,
                    #e5e7eb 72%,
                    #cbd5e1 100%
                ) !important;

            box-shadow:

                inset 2px 0 2px
                rgba(255,255,255,.90),

                inset -2px 0 3px
                rgba(0,0,0,.13),

                inset 0 -18px 18px
                rgba(0,0,0,.10),

                0 5px 5px
                rgba(0,0,0,.35) !important;

            color: #111827 !important;

            cursor: pointer !important;

            z-index: 1 !important;

            transition:
                transform .045s ease,
                background .045s ease,
                box-shadow .045s ease !important;

            -webkit-tap-highlight-color:
                transparent !important;

            touch-action: none !important;

        }


        /* --------------------------------------------------------
           REFLET SUR TOUCHES BLANCHES
        -------------------------------------------------------- */

        #pianoKeyboard
        .piano-white-key::before {

            content: "";

            position: absolute;

            left: 8%;

            right: 8%;

            top: 4px;

            height: 34%;

            border-radius:
                0 0 12px 12px;

            background:
                linear-gradient(
                    180deg,
                    rgba(255,255,255,.90),
                    rgba(255,255,255,0)
                );

            pointer-events: none;

        }


        /* --------------------------------------------------------
           BAS DE TOUCHE BLANCHE
        -------------------------------------------------------- */

        #pianoKeyboard
        .piano-white-key::after {

            content: "";

            position: absolute;

            left: 14%;

            right: 14%;

            bottom: 8px;

            height: 3px;

            border-radius: 20px;

            background:
                rgba(15,23,42,.13);

            pointer-events: none;

        }


        /* ========================================================
           TOUCHES BLANCHES ACTIVES
        ======================================================== */

        #pianoKeyboard
        .piano-white-key.active {

            transform:
                translateY(7px) !important;

            background:

                linear-gradient(
                    180deg,
                    #dbeafe 0%,
                    #bfdbfe 35%,
                    #93c5fd 72%,
                    #60a5fa 100%
                ) !important;

            box-shadow:

                inset 2px 0 3px
                rgba(255,255,255,.70),

                inset -2px 0 4px
                rgba(30,64,175,.25),

                inset 0 -20px 20px
                rgba(37,99,235,.20),

                0 2px 3px
                rgba(0,0,0,.38),

                0 0 16px
                rgba(59,130,246,.35) !important;

        }


        /* ========================================================
           TOUCHES NOIRES
        ======================================================== */

        #pianoKeyboard .piano-black-key {

            position: absolute !important;

            top: 0 !important;

            height: 63% !important;

            margin: 0 !important;

            padding: 0 !important;

            border-radius:
                0 0 8px 8px !important;

            border:

                1px solid
                #020617 !important;

            background:

                linear-gradient(
                    105deg,
                    #4b5563 0%,
                    #1f2937 12%,
                    #050505 34%,
                    #000000 70%,
                    #111827 88%,
                    #374151 100%
                ) !important;

            box-shadow:

                inset 2px 0 4px
                rgba(255,255,255,.17),

                inset -3px 0 6px
                rgba(0,0,0,.95),

                inset 0 -14px 12px
                rgba(0,0,0,.60),

                0 8px 9px
                rgba(0,0,0,.65) !important;

            color: #ffffff !important;

            cursor: pointer !important;

            z-index: 10 !important;

            transform:
                translateX(-50%) !important;

            transition:
                transform .045s ease,
                background .045s ease,
                box-shadow .045s ease !important;

            -webkit-tap-highlight-color:
                transparent !important;

            touch-action: none !important;

        }


        /* --------------------------------------------------------
           REFLET TOUCHES NOIRES
        -------------------------------------------------------- */

        #pianoKeyboard
        .piano-black-key::before {

            content: "";

            position: absolute;

            left: 4px;

            top: 0;

            width: 38%;

            height: 72%;

            border-radius:
                0 0 5px 5px;

            background:

                linear-gradient(
                    180deg,
                    rgba(255,255,255,.23),
                    rgba(255,255,255,0)
                );

            pointer-events: none;

        }


        /* ========================================================
           TOUCHES NOIRES ACTIVES
        ======================================================== */

        #pianoKeyboard
        .piano-black-key.active {

            transform:
                translateX(-50%)
                translateY(7px) !important;

            background:

                linear-gradient(
                    105deg,
                    #bfdbfe 0%,
                    #3b82f6 18%,
                    #1e3a8a 52%,
                    #020617 100%
                ) !important;

            box-shadow:

                inset 2px 0 4px
                rgba(255,255,255,.30),

                inset -3px 0 7px
                rgba(0,0,0,.95),

                0 2px 3px
                rgba(0,0,0,.60),

                0 0 20px
                rgba(59,130,246,.55) !important;

        }


        /* ========================================================
           LABELS
        ======================================================== */

        #pianoKeyboard
        .fobas-piano-key-label {

            position: absolute !important;

            left: 0 !important;

            right: 0 !important;

            bottom: 12px !important;

            display: block !important;

            text-align: center !important;

            pointer-events: none !important;

            font-family:
                Arial,
                Helvetica,
                sans-serif !important;

            font-size: 7px !important;

            line-height: 1 !important;

            font-weight: 800 !important;

            letter-spacing: .2px !important;

            color: #475569 !important;

            opacity: .70 !important;

            white-space: nowrap !important;

        }


        /* --------------------------------------------------------
           LABEL NOIRE
        -------------------------------------------------------- */

        #pianoKeyboard
        .piano-black-key
        .fobas-piano-key-label {

            bottom: 7px !important;

            color: #f8fafc !important;

            opacity: .72 !important;

            font-size: 6px !important;

        }


        /* ========================================================
           TOUCH MULTIPLE
        ======================================================== */

        #pianoKeyboard
        .piano-white-key,
        #pianoKeyboard
        .piano-black-key {

            -webkit-user-select: none !important;

            user-select: none !important;

            -webkit-touch-callout: none !important;

            touch-action: none !important;

        }


        /* ========================================================
           MOBILE
        ======================================================== */

        @media (max-width: 900px) {

            #pianoKeyboard {

                min-width: 1000px !important;

                height: 270px !important;

            }

            #pianoKeyboard
            .fobas-piano-key-label {

                font-size: 6px !important;

            }

            #pianoKeyboard
            .piano-black-key
            .fobas-piano-key-label {

                font-size: 5px !important;

            }

        }


        /* ========================================================
           PETIT MOBILE
        ======================================================== */

        @media (max-width: 600px) {

            #pianoKeyboard {

                min-width: 900px !important;

                height: 245px !important;

                border-radius: 10px !important;

            }

            #pianoKeyboard
            .fobas-piano-key-label {

                bottom: 8px !important;

                font-size: 5px !important;

            }

            #pianoKeyboard
            .piano-black-key
            .fobas-piano-key-label {

                bottom: 5px !important;

                font-size: 4px !important;

            }

        }


        /* ========================================================
           TRÈS PETIT ÉCRAN
        ======================================================== */

        @media (max-width: 420px) {

            #pianoKeyboard {

                min-width: 820px !important;

                height: 225px !important;

            }

        }

    `;

    document.head.appendChild(style);


    /* ============================================================
       03 — SÉCURITÉ TOUCH
       ------------------------------------------------------------
       NE REMPLACE PAS LES ÉVÉNEMENTS DU MOTEUR.
       On protège uniquement le comportement navigateur.
    ============================================================ */

    function installTouchProtection() {

        const keyboard =
            document.getElementById(
                "pianoKeyboard"
            );

        if (!keyboard) {
            return;
        }


        keyboard.addEventListener(
            "contextmenu",
            function (event) {

                event.preventDefault();

            },
            {
                passive: false
            }
        );


        keyboard.addEventListener(
            "dragstart",
            function (event) {

                event.preventDefault();

            },
            {
                passive: false
            }
        );


        keyboard.addEventListener(
            "selectstart",
            function (event) {

                event.preventDefault();

            },
            {
                passive: false
            }
        );


        /*
         * IMPORTANT :
         * chaque doigt possède son propre pointerId.
         * Le moteur actuel peut donc gérer plusieurs touches
         * simultanément sans fusionner les doigts.
         */

        keyboard.addEventListener(
            "pointerdown",
            function (event) {

                if (
                    event.pointerType === "touch"
                ) {

                    event.preventDefault();

                }

            },
            {
                passive: false,
                capture: true
            }
        );

    }


    /* ============================================================
       04 — RECALCUL DES TOUCHES NOIRES
       ------------------------------------------------------------
       Position exacte sur les jonctions des touches blanches.
    ============================================================ */

    function refreshBlackKeys() {

        const keyboard =
            document.getElementById(
                "pianoKeyboard"
            );

        if (!keyboard) {
            return;
        }


        const whiteKeys =
            Array.from(
                keyboard.querySelectorAll(
                    ".piano-white-key"
                )
            );


        const blackKeys =
            Array.from(
                keyboard.querySelectorAll(
                    ".piano-black-key"
                )
            );


        if (
            whiteKeys.length === 0 ||
            blackKeys.length === 0
        ) {
            return;
        }


        const keyboardWidth =
            keyboard.clientWidth;


        const whiteWidth =
            keyboardWidth /
            whiteKeys.length;


        const whiteIndexByMidi =
            new Map();


        whiteKeys.forEach(
            function (key, index) {

                const midi =
                    Number(
                        key.dataset.midi
                    );

                whiteIndexByMidi.set(
                    midi,
                    index
                );

            }
        );


        blackKeys.forEach(
            function (key) {

                const midi =
                    Number(
                        key.dataset.midi
                    );


                const previousMidi =
                    midi - 1;


                const previousIndex =
                    whiteIndexByMidi.get(
                        previousMidi
                    );


                if (
                    previousIndex === undefined
                ) {
                    return;
                }


                const center =
                    (
                        previousIndex + 1
                    ) *
                    whiteWidth;


                key.style.left =
                    center + "px";


                /*
                 * Largeur professionnelle de la touche noire.
                 */

                key.style.width =
                    Math.max(
                        20,
                        Math.min(
                            34,
                            whiteWidth * 0.62
                        )
                    ) + "px";

            }
        );

    }


    /* ============================================================
       05 — OBSERVATION DU PIANO
       ------------------------------------------------------------
       Si le moteur reconstruit les 88 touches, on recalcule
       automatiquement le design sans toucher au moteur.
    ============================================================ */

    function observeKeyboard() {

        const keyboard =
            document.getElementById(
                "pianoKeyboard"
            );

        if (!keyboard) {
            return;
        }


        if (
            keyboard.__fobasVisualObserver
        ) {
            return;
        }


        const observer =
            new MutationObserver(
                function () {

                    requestAnimationFrame(
                        refreshBlackKeys
                    );

                }
            );


        observer.observe(
            keyboard,
            {
                childList: true
            }
        );


        keyboard.__fobasVisualObserver =
            observer;

    }


    /* ============================================================
       06 — RESIZE
    ============================================================ */

    let resizeTimer = null;


    window.addEventListener(
        "resize",
        function () {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    function () {

                        refreshBlackKeys();

                    },
                    80
                );

        }
    );


    /* ============================================================
       07 — ORIENTATION MOBILE
    ============================================================ */

    window.addEventListener(
        "orientationchange",
        function () {

            setTimeout(
                refreshBlackKeys,
                150
            );

        }
    );


    /* ============================================================
       08 — INITIALISATION
    ============================================================ */

    function initialize() {

        installTouchProtection();

        observeKeyboard();

        refreshBlackKeys();


        /*
         * Le moteur principal peut construire le piano
         * légèrement après l'initialisation de la page.
         */

        setTimeout(
            refreshBlackKeys,
            100
        );


        setTimeout(
            refreshBlackKeys,
            300
        );


        setTimeout(
            refreshBlackKeys,
            700
        );


        setTimeout(
            refreshBlackKeys,
            1200
        );

    }


    /* ============================================================
       09 — DÉMARRAGE
    ============================================================ */

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


/* ================================================================
   FIN — FOBAS PIANO PRO VISUAL TOUCH
================================================================ */


