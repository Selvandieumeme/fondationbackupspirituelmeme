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

















